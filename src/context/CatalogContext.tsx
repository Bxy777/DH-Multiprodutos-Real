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
import { supabase, supabaseConfigured } from '../lib/supabase'
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

/** Salva no Supabase (upsert na linha id=1) */
async function saveRemote(list: CatalogProduct[]) {
  if (!supabaseConfigured || !supabase) return
  await supabase.from('catalog').upsert({ id: 1, data: list, updated_at: new Date().toISOString() })
}

type CatalogContextValue = {
  products: CatalogProduct[]
  loading: boolean
  getById: (id: string) => CatalogProduct | undefined
  upsertProduct: (p: CatalogProduct) => void
  removeProduct: (id: string) => void
  setFlavorStock: (productId: string, flavorId: string, stock: number) => void
  adjustFlavorStock: (productId: string, flavorId: string, delta: number) => void
  addFlavor: (productId: string, flavor: ProductFlavor) => void
  removeFlavor: (productId: string, flavorId: string) => void
  resetToSeed: () => void
}

const CatalogContext = createContext<CatalogContextValue | null>(null)

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<CatalogProduct[]>(loadLocal)
  const [loading, setLoading] = useState(supabaseConfigured)

  // Carrega do Supabase na inicialização
  useEffect(() => {
    if (!supabaseConfigured || !supabase) return

    supabase
      .from('catalog')
      .select('data')
      .eq('id', 1)
      .single()
      .then(({ data, error }) => {
        if (!error && data?.data && Array.isArray(data.data) && data.data.length > 0) {
          const remote = data.data as CatalogProduct[]
          setProducts(remote)
          saveLocal(remote)
        }
        setLoading(false)
      })

    // Realtime: atualiza quando admin salva em outro dispositivo
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

    return () => { supabase?.removeChannel(channel) }
  }, [])

  const commit = useCallback((next: CatalogProduct[]) => {
    setProducts(next)
    saveLocal(next)
    saveRemote(next)
  }, [])

  const getById = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products],
  )

  const upsertProduct = useCallback((p: CatalogProduct) => {
    setProducts((prev) => {
      const i = prev.findIndex((x) => x.id === p.id)
      const next = [...prev]
      if (i >= 0) {
        // Edição: mantém na mesma posição
        next[i] = p
      } else {
        // Novo produto: insere após o último da mesma marca
        const lastBrandIndex = next.reduce(
          (last, x, idx) => (x.brand === p.brand ? idx : last),
          -1,
        )
        if (lastBrandIndex >= 0) {
          next.splice(lastBrandIndex + 1, 0, p)
        } else {
          next.push(p)
        }
      }
      saveLocal(next)
      saveRemote(next)
      return next
    })
  }, [])

  const removeProduct = useCallback((id: string) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id)
      saveLocal(next)
      saveRemote(next)
      return next
    })
  }, [])

  const setFlavorStock = useCallback((productId: string, flavorId: string, stock: number) => {
    setProducts((prev) => {
      const next = prev.map((p) => {
        if (p.id !== productId) return p
        return { ...p, flavors: p.flavors.map((f) => f.id === flavorId ? { ...f, stock: Math.max(0, Math.floor(stock)) } : f) }
      })
      saveLocal(next)
      saveRemote(next)
      return next
    })
  }, [])

  const adjustFlavorStock = useCallback((productId: string, flavorId: string, delta: number) => {
    setProducts((prev) => {
      const next = prev.map((p) => {
        if (p.id !== productId) return p
        return { ...p, flavors: p.flavors.map((f) => f.id === flavorId ? { ...f, stock: Math.max(0, f.stock + delta) } : f) }
      })
      saveLocal(next)
      saveRemote(next)
      return next
    })
  }, [])

  const addFlavor = useCallback((productId: string, flavor: ProductFlavor) => {
    setProducts((prev) => {
      const next = prev.map((p) => p.id === productId ? { ...p, flavors: [...p.flavors, flavor] } : p)
      saveLocal(next)
      saveRemote(next)
      return next
    })
  }, [])

  const removeFlavor = useCallback((productId: string, flavorId: string) => {
    setProducts((prev) => {
      const next = prev.map((p) => p.id === productId ? { ...p, flavors: p.flavors.filter((f) => f.id !== flavorId) } : p)
      saveLocal(next)
      saveRemote(next)
      return next
    })
  }, [])

  const resetToSeed = useCallback(() => {
    const fresh = JSON.parse(JSON.stringify(seedCatalog)) as CatalogProduct[]
    commit(fresh)
  }, [commit])

  const value = useMemo(() => ({
    products, loading, getById, upsertProduct, removeProduct,
    setFlavorStock, adjustFlavorStock, addFlavor, removeFlavor, resetToSeed,
  }), [products, loading, getById, upsertProduct, removeProduct, setFlavorStock, adjustFlavorStock, addFlavor, removeFlavor, resetToSeed])

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  const ctx = useContext(CatalogContext)
  if (!ctx) throw new Error('useCatalog outside CatalogProvider')
  return ctx
}
