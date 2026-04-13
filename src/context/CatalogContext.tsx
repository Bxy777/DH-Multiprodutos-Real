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
import type { CatalogProduct, ProductFlavor } from '../types'

const API_URL = '/api/catalog'

async function fetchCatalog(): Promise<CatalogProduct[] | null> {
  try {
    const res = await fetch(API_URL)
    if (!res.ok) return null
    const data = await res.json()
    if (Array.isArray(data) && data.length > 0) return data
    return null
  } catch {
    return null
  }
}

async function saveCatalog(products: CatalogProduct[]): Promise<void> {
  try {
    await fetch(API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(products),
    })
  } catch {
    /* silent fail — will retry on next save */
  }
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
  refreshCatalog: () => Promise<void>
}

const CatalogContext = createContext<CatalogContextValue | null>(null)

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<CatalogProduct[]>(() => {
    // Use localStorage as immediate cache while server loads
    try {
      const raw = localStorage.getItem('dh_catalog_v2')
      if (raw) {
        const parsed = JSON.parse(raw) as CatalogProduct[]
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch { /* ignore */ }
    return JSON.parse(JSON.stringify(seedCatalog)) as CatalogProduct[]
  })
  const [loading, setLoading] = useState(true)
  const initialized = useRef(false)

  // Load from server on mount
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    fetchCatalog().then((remote) => {
      if (remote) {
        setProducts(remote)
        try { localStorage.setItem('dh_catalog_v2', JSON.stringify(remote)) } catch { /* */ }
      } else {
        // First time: push seed catalog to server
        const seed = JSON.parse(JSON.stringify(seedCatalog)) as CatalogProduct[]
        saveCatalog(seed)
      }
      setLoading(false)
    })
  }, [])

  const persist = useCallback((list: CatalogProduct[]) => {
    try { localStorage.setItem('dh_catalog_v2', JSON.stringify(list)) } catch { /* */ }
    saveCatalog(list)
  }, [])

  const getById = useCallback(
    (id: string) => products.find((p) => p.id === id),
    [products],
  )

  const upsertProduct = useCallback(
    (p: CatalogProduct) => {
      setProducts((prev) => {
        const i = prev.findIndex((x) => x.id === p.id)
        const next = [...prev]
        if (i >= 0) next[i] = p
        else next.push(p)
        persist(next)
        return next
      })
    },
    [persist],
  )

  const removeProduct = useCallback((id: string) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id)
      persist(next)
      return next
    })
  }, [persist])

  const setFlavorStock = useCallback(
    (productId: string, flavorId: string, stock: number) => {
      setProducts((prev) => {
        const next = prev.map((p) => {
          if (p.id !== productId) return p
          return {
            ...p,
            flavors: p.flavors.map((f) =>
              f.id === flavorId ? { ...f, stock: Math.max(0, Math.floor(stock)) } : f,
            ),
          }
        })
        persist(next)
        return next
      })
    },
    [persist],
  )

  const adjustFlavorStock = useCallback(
    (productId: string, flavorId: string, delta: number) => {
      setProducts((prev) => {
        const next = prev.map((p) => {
          if (p.id !== productId) return p
          return {
            ...p,
            flavors: p.flavors.map((f) =>
              f.id === flavorId ? { ...f, stock: Math.max(0, f.stock + delta) } : f,
            ),
          }
        })
        persist(next)
        return next
      })
    },
    [persist],
  )

  const addFlavor = useCallback((productId: string, flavor: ProductFlavor) => {
    setProducts((prev) => {
      const next = prev.map((p) =>
        p.id === productId ? { ...p, flavors: [...p.flavors, flavor] } : p,
      )
      persist(next)
      return next
    })
  }, [persist])

  const removeFlavor = useCallback((productId: string, flavorId: string) => {
    setProducts((prev) => {
      const next = prev.map((p) =>
        p.id === productId
          ? { ...p, flavors: p.flavors.filter((f) => f.id !== flavorId) }
          : p,
      )
      persist(next)
      return next
    })
  }, [persist])

  const resetToSeed = useCallback(() => {
    const fresh = JSON.parse(JSON.stringify(seedCatalog)) as CatalogProduct[]
    setProducts(fresh)
    persist(fresh)
  }, [persist])

  const refreshCatalog = useCallback(async () => {
    const remote = await fetchCatalog()
    if (remote) {
      setProducts(remote)
      try { localStorage.setItem('dh_catalog_v2', JSON.stringify(remote)) } catch { /* */ }
    }
  }, [])

  const value = useMemo(
    () => ({
      products,
      loading,
      getById,
      upsertProduct,
      removeProduct,
      setFlavorStock,
      adjustFlavorStock,
      addFlavor,
      removeFlavor,
      resetToSeed,
      refreshCatalog,
    }),
    [
      products,
      loading,
      getById,
      upsertProduct,
      removeProduct,
      setFlavorStock,
      adjustFlavorStock,
      addFlavor,
      removeFlavor,
      resetToSeed,
      refreshCatalog,
    ],
  )

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  const ctx = useContext(CatalogContext)
  if (!ctx) throw new Error('useCatalog outside CatalogProvider')
  return ctx
}
