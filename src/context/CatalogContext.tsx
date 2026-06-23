import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { seedCatalog } from '../data/seedCatalog'
import { formatSupabaseError } from '../lib/supabase'
import { useSupabase } from './SupabaseContext'
import type { CatalogProduct, ProductFlavor } from '../types'

const STORAGE_KEY = 'dh_catalog_v2'

function loadLocal(): CatalogProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as CatalogProduct[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch { /* ignore */ }
  return JSON.parse(JSON.stringify(seedCatalog)) as CatalogProduct[]
}

function saveLocal(list: CatalogProduct[]) {
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
  const [products, setProducts] = useState<CatalogProduct[]>(loadLocal)
  const [loading, setLoading] = useState(true)
  const [syncError, setSyncError] = useState<string | null>(null)

  const persist = useCallback(async (next: CatalogProduct[]): Promise<boolean> => {
    setProducts(next)
    saveLocal(next)

    if (!cloudEnabled || !supabase) {
      setSyncError(null)
      return true
    }

    try {
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

  useEffect(() => {
    if (supabaseLoading) return

    if (!cloudEnabled || !supabase) {
      setLoading(false)
      return
    }

    void (async () => {
      try {
        const { data, error } = await supabase
          .from('catalog')
          .select('data')
          .eq('id', 1)
          .single()

        if (error) {
          console.error('[catalog] erro ao carregar do Supabase:', error.message)
          setSyncError(error.message)
        } else if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          const remote = data.data as CatalogProduct[]
          setProducts(remote)
          saveLocal(remote)
          setSyncError(null)
        }
      } catch (err) {
        console.error('[catalog] erro ao carregar do Supabase:', err)
        setSyncError(formatSupabaseError(err))
      } finally {
        setLoading(false)
      }
    })()

    const channel = supabase
      .channel('catalog-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'catalog' }, (payload) => {
        const remote = (payload.new as { data: CatalogProduct[] }).data
        if (Array.isArray(remote) && remote.length > 0) {
          setProducts(remote)
          saveLocal(remote)
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [supabaseLoading, cloudEnabled, supabase])

  const getById = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products],
  )

  const upsertProduct = useCallback(async (p: CatalogProduct) => {
    const next = upsertInList(products, p)
    return persist(next)
  }, [persist, products])

  const removeProduct = useCallback(async (id: string) => {
    return persist(products.filter((p) => p.id !== id))
  }, [persist, products])

  const reorderProduct = useCallback(async (id: string, direction: 'up' | 'down') => {
    const i = products.findIndex((p) => p.id === id)
    if (i < 0) return true
    const brand = products[i].brand
    let swapIdx = -1
    if (direction === 'up') {
      for (let j = i - 1; j >= 0; j--) {
        if (products[j].brand === brand) { swapIdx = j; break }
      }
    } else {
      for (let j = i + 1; j < products.length; j++) {
        if (products[j].brand === brand) { swapIdx = j; break }
      }
    }
    if (swapIdx < 0) return true
    const next = [...products]
    ;[next[i], next[swapIdx]] = [next[swapIdx], next[i]]
    return persist(next)
  }, [persist, products])

  const setFlavorStock = useCallback(async (productId: string, flavorId: string, stock: number) => {
    const next = products.map((p) => {
      if (p.id !== productId) return p
      return {
        ...p,
        flavors: p.flavors.map((f) =>
          f.id === flavorId ? { ...f, stock: Math.max(0, Math.floor(stock)) } : f,
        ),
      }
    })
    return persist(next)
  }, [persist, products])

  const adjustFlavorStock = useCallback(async (productId: string, flavorId: string, delta: number) => {
    const next = products.map((p) => {
      if (p.id !== productId) return p
      return {
        ...p,
        flavors: p.flavors.map((f) =>
          f.id === flavorId ? { ...f, stock: Math.max(0, f.stock + delta) } : f,
        ),
      }
    })
    return persist(next)
  }, [persist, products])

  const addFlavor = useCallback(async (productId: string, flavor: ProductFlavor) => {
    const next = products.map((p) =>
      p.id === productId ? { ...p, flavors: [...p.flavors, flavor] } : p,
    )
    return persist(next)
  }, [persist, products])

  const removeFlavor = useCallback(async (productId: string, flavorId: string) => {
    const next = products.map((p) =>
      p.id === productId ? { ...p, flavors: p.flavors.filter((f) => f.id !== flavorId) } : p,
    )
    return persist(next)
  }, [persist, products])

  const resetToSeed = useCallback(async () => {
    const fresh = JSON.parse(JSON.stringify(seedCatalog)) as CatalogProduct[]
    return persist(fresh)
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
