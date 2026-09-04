import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { seedCatalog } from '../data/seedCatalog'
import { FLYER_CATALOG_VERSION, mergeFlyerCatalog } from '../data/flyerCatalog'
import { formatSupabaseError } from '../lib/supabase'
import { useSupabase } from './SupabaseContext'
import type { CatalogProduct, ProductFlavor } from '../types'

const STORAGE_KEY = 'dh_catalog_v3'
const FLYER_SYNC_KEY = 'dh_flyer_sync_v'
const POLL_MS = 30_000

function defaultCatalog(): CatalogProduct[] {
  return mergeFlyerCatalog(
    JSON.parse(JSON.stringify(seedCatalog)) as CatalogProduct[],
  )
}

function loadLocal(): CatalogProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as CatalogProduct[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        return mergeFlyerCatalog(parsed)
      }
    }
  } catch { /* ignore */ }
  return defaultCatalog()
}

function saveLocal(list: CatalogProduct[]) {
  if (!Array.isArray(list) || list.length === 0) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch { /* ignore */ }
}

function upsertInList(prev: CatalogProduct[], p: CatalogProduct): CatalogProduct[] {
  const i = prev.findIndex((x) => x.id === p.id)
  const next = [...prev]
  if (i >= 0) {
    next[i] = p
    return next
  }
  const lastBrandIndex = next.reduce(
    (last, x, idx) => (x.brand === p.brand ? idx : last),
    -1,
  )
  if (lastBrandIndex >= 0) next.splice(lastBrandIndex + 1, 0, p)
  else next.push(p)
  return next
}

function applyRemoteCatalog(remote: CatalogProduct[]) {
  saveLocal(remote)
}

type CatalogContextValue = {
  products: CatalogProduct[]
  loading: boolean
  cloudEnabled: boolean
  syncError: string | null
  getById: (id: string) => CatalogProduct | undefined
  upsertProduct: (p: CatalogProduct) => Promise<boolean>
  removeProduct: (id: string) => Promise<boolean>
  reorderProduct: (id: string, direction: 'up' | 'down') => Promise<boolean>
  setFlavorStock: (productId: string, flavorId: string, stock: number) => Promise<boolean>
  adjustFlavorStock: (productId: string, flavorId: string, delta: number) => Promise<boolean>
  addFlavor: (productId: string, flavor: ProductFlavor) => Promise<boolean>
  removeFlavor: (productId: string, flavorId: string) => Promise<boolean>
  resetToSeed: () => Promise<boolean>
}

const CatalogContext = createContext<CatalogContextValue | null>(null)

export function CatalogProvider({ children }: { children: ReactNode }) {
  const { supabase, configured: cloudEnabled, loading: supabaseLoading } = useSupabase()
  const [products, setProducts] = useState<CatalogProduct[]>(defaultCatalog)
  const [loading, setLoading] = useState(true)
  const [syncError, setSyncError] = useState<string | null>(null)
  const productsRef = useRef(products)
  productsRef.current = products

  const pushRemote = useCallback(async (next: CatalogProduct[]): Promise<boolean> => {
    if (!cloudEnabled || !supabase) {
      setSyncError(null)
      return true
    }

    try {
      // Verificar se usuário está autenticado antes de tentar salvar
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        // Usuário não autenticado - apenas silenciar o erro e usar localStorage
        console.log('[catalog] Salvando apenas localmente (não autenticado)')
        setSyncError(null)
        return true
      }

      const { error } = await supabase
        .from('catalog')
        .upsert(
          { id: 1, data: next, updated_at: new Date().toISOString() },
          { onConflict: 'id' },
        )

      if (error) {
        console.error('[catalog] erro ao salvar no Supabase:', error.message)
        setSyncError(error.message)
        return false
      }

      setSyncError(null)
      return true
    } catch (err) {
      const message = formatSupabaseError(err)
      console.error('[catalog] erro ao salvar no Supabase:', err)
      setSyncError(message)
      return false
    }
  }, [cloudEnabled, supabase])

  const persist = useCallback(async (next: CatalogProduct[]): Promise<boolean> => {
    const safe = mergeFlyerCatalog(
      Array.isArray(next) && next.length > 0 ? next : defaultCatalog(),
    )
    productsRef.current = safe
    setProducts(safe)
    saveLocal(safe)
    return pushRemote(safe)
  }, [pushRemote])

  const applyChange = useCallback(async (
    mutate: (prev: CatalogProduct[]) => CatalogProduct[],
  ): Promise<boolean> => {
    return persist(mutate(productsRef.current))
  }, [persist])

  const applyRemoteState = useCallback((next: CatalogProduct[]) => {
    const merged = mergeFlyerCatalog(
      Array.isArray(next) && next.length > 0 ? next : defaultCatalog(),
    )
    productsRef.current = merged
    setProducts(merged)
    applyRemoteCatalog(merged)
  }, [])

  const pullRemote = useCallback(async (): Promise<boolean> => {
    if (!cloudEnabled || !supabase) return false

    try {
      const { data, error } = await supabase
        .from('catalog')
        .select('data')
        .eq('id', 1)
        .maybeSingle()

      if (error) {
        console.error('[catalog] erro ao buscar nuvem:', error.message)
        setSyncError(error.message)
        return false
      }

      if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
        const merged = mergeFlyerCatalog(data.data as CatalogProduct[])
        applyRemoteState(merged)
        setSyncError(null)
        if (JSON.stringify(merged) !== JSON.stringify(data.data)) {
          void pushRemote(merged)
        }
        return true
      }

      return false
    } catch (err) {
      console.error('[catalog] erro ao buscar nuvem:', err)
      setSyncError(formatSupabaseError(err))
      return false
    }
  }, [cloudEnabled, supabase, pushRemote, applyRemoteState])

  const bootstrapRemote = useCallback(async () => {
    let base = loadLocal()

    if (cloudEnabled && supabase) {
      try {
        const { data, error } = await supabase
          .from('catalog')
          .select('data')
          .eq('id', 1)
          .maybeSingle()

        if (error) {
          console.error('[catalog] erro ao buscar nuvem:', error.message)
          setSyncError(error.message)
        } else if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          base = data.data as CatalogProduct[]
          setSyncError(null)
        }
      } catch (err) {
        console.error('[catalog] erro ao buscar nuvem:', err)
        setSyncError(formatSupabaseError(err))
      }
    }

    const merged = mergeFlyerCatalog(base)
    const flyerSynced =
      localStorage.getItem(FLYER_SYNC_KEY) === String(FLYER_CATALOG_VERSION)

    if (!flyerSynced || JSON.stringify(merged) !== JSON.stringify(base)) {
      const ok = await persist(merged)
      if (ok) localStorage.setItem(FLYER_SYNC_KEY, String(FLYER_CATALOG_VERSION))
    } else {
      applyRemoteState(merged)
    }

    setLoading(false)
  }, [cloudEnabled, supabase, persist, applyRemoteState])

  useEffect(() => {
    if (supabaseLoading) return
    void bootstrapRemote()
  }, [supabaseLoading, bootstrapRemote])

  useEffect(() => {
    if (!cloudEnabled || !supabase) return

    const onVisible = () => {
      if (document.visibilityState === 'visible') void pullRemote()
    }
    document.addEventListener('visibilitychange', onVisible)

    const poll = window.setInterval(() => {
      void pullRemote()
    }, POLL_MS)

    const channel = supabase
      .channel('catalog-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'catalog' },
        (payload) => {
          const row = (payload.new ?? payload.old) as { data?: CatalogProduct[] } | null
          const remote = row?.data
          if (Array.isArray(remote) && remote.length > 0) {
            applyRemoteState(remote)
          }
        },
      )
      .subscribe()

    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.clearInterval(poll)
      supabase.removeChannel(channel)
    }
  }, [cloudEnabled, supabase, pullRemote, applyRemoteState])

  const getById = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products],
  )

  const upsertProduct = useCallback(
    (p: CatalogProduct) => applyChange((prev) => upsertInList(prev, p)),
    [applyChange],
  )

  const removeProduct = useCallback(
    (id: string) => applyChange((prev) => prev.filter((p) => p.id !== id)),
    [applyChange],
  )

  const reorderProduct = useCallback(async (id: string, direction: 'up' | 'down') => {
    return applyChange((prev) => {
      const i = prev.findIndex((p) => p.id === id)
      if (i < 0) return prev
      const brand = prev[i].brand
      let swapIdx = -1
      if (direction === 'up') {
        for (let j = i - 1; j >= 0; j--) {
          if (prev[j].brand === brand) { swapIdx = j; break }
        }
      } else {
        for (let j = i + 1; j < prev.length; j++) {
          if (prev[j].brand === brand) { swapIdx = j; break }
        }
      }
      if (swapIdx < 0) return prev
      const next = [...prev]
      ;[next[i], next[swapIdx]] = [next[swapIdx], next[i]]
      return next
    })
  }, [applyChange])

  const setFlavorStock = useCallback(async (productId: string, flavorId: string, stock: number) => {
    return applyChange((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p
        return {
          ...p,
          flavors: p.flavors.map((f) =>
            f.id === flavorId ? { ...f, stock: Math.max(0, Math.floor(stock)) } : f,
          ),
        }
      }),
    )
  }, [applyChange])

  const adjustFlavorStock = useCallback(async (productId: string, flavorId: string, delta: number) => {
    return applyChange((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p
        return {
          ...p,
          flavors: p.flavors.map((f) =>
            f.id === flavorId ? { ...f, stock: Math.max(0, f.stock + delta) } : f,
          ),
        }
      }),
    )
  }, [applyChange])

  const addFlavor = useCallback(async (productId: string, flavor: ProductFlavor) => {
    return applyChange((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, flavors: [...p.flavors, flavor] } : p,
      ),
    )
  }, [applyChange])

  const removeFlavor = useCallback(async (productId: string, flavorId: string) => {
    return applyChange((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, flavors: p.flavors.filter((f) => f.id !== flavorId) } : p,
      ),
    )
  }, [applyChange])

  const resetToSeed = useCallback(async () => {
    return persist(defaultCatalog())
  }, [persist])

  const value = useMemo(() => ({
    products,
    loading: loading || supabaseLoading,
    cloudEnabled,
    syncError,
    getById,
    upsertProduct,
    removeProduct,
    reorderProduct,
    setFlavorStock,
    adjustFlavorStock,
    addFlavor,
    removeFlavor,
    resetToSeed,
  }), [
    products, loading, supabaseLoading, cloudEnabled, syncError, getById,
    upsertProduct, removeProduct, reorderProduct, setFlavorStock, adjustFlavorStock,
    addFlavor, removeFlavor, resetToSeed,
  ])

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  const ctx = useContext(CatalogContext)
  if (!ctx) throw new Error('useCatalog outside CatalogProvider')
  return ctx
}
