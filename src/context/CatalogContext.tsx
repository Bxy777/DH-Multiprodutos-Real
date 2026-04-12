import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { seedCatalog } from '../data/seedCatalog'
import type { CatalogProduct, ProductFlavor } from '../types'

const STORAGE_KEY = 'dh_catalog_v2'

function loadInitial(): CatalogProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as CatalogProduct[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    /* ignore */
  }
  return JSON.parse(JSON.stringify(seedCatalog)) as CatalogProduct[]
}

function persist(list: CatalogProduct[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    /* ignore */
  }
}

type CatalogContextValue = {
  products: CatalogProduct[]
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
  const [products, setProducts] = useState<CatalogProduct[]>(loadInitial)

  const commit = useCallback((next: CatalogProduct[]) => {
    setProducts(next)
    persist(next)
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
    [],
  )

  const removeProduct = useCallback((id: string) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id)
      persist(next)
      return next
    })
  }, [])

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
    [],
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
    [],
  )

  const addFlavor = useCallback((productId: string, flavor: ProductFlavor) => {
    setProducts((prev) => {
      const next = prev.map((p) =>
        p.id === productId ? { ...p, flavors: [...p.flavors, flavor] } : p,
      )
      persist(next)
      return next
    })
  }, [])

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
  }, [])

  const resetToSeed = useCallback(() => {
    const fresh = JSON.parse(JSON.stringify(seedCatalog)) as CatalogProduct[]
    commit(fresh)
  }, [commit])

  const value = useMemo(
    () => ({
      products,
      getById,
      upsertProduct,
      removeProduct,
      setFlavorStock,
      adjustFlavorStock,
      addFlavor,
      removeFlavor,
      resetToSeed,
    }),
    [
      products,
      getById,
      upsertProduct,
      removeProduct,
      setFlavorStock,
      adjustFlavorStock,
      addFlavor,
      removeFlavor,
      resetToSeed,
    ],
  )

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  const ctx = useContext(CatalogContext)
  if (!ctx) throw new Error('useCatalog outside CatalogProvider')
  return ctx
}
