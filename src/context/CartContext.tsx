import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { CartLine } from '../types'

type CartContextValue = {
  lines: CartLine[]
  toast: string | null
  addLine: (line: Omit<CartLine, 'qty'> & { qty?: number }) => boolean
  setQty: (index: number, qty: number) => void
  removeLine: (index: number) => void
  clearCart: () => void
  dismissToast: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const CART_KEY = 'dh_cart_v1'

function loadCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as CartLine[]
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (l) =>
            l &&
            typeof l.productId === 'string' &&
            typeof l.flavorId === 'string' &&
            typeof l.flavorName === 'string',
        )
      }
    }
  } catch {
    /* ignore */
  }
  return []
}

function saveCart(lines: CartLine[]) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(lines))
  } catch {
    /* ignore */
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(loadCart)
  const [toast, setToast] = useState<string | null>(null)

  const dismissToast = useCallback(() => setToast(null), [])

  const addLine = useCallback(
    (line: Omit<CartLine, 'qty'> & { qty?: number }) => {
      const qty = line.qty ?? 1
      setLines((prev) => {
        const i = prev.findIndex(
          (l) => l.productId === line.productId && l.flavorId === line.flavorId,
        )
        let next: CartLine[]
        if (i >= 0) {
          next = [...prev]
          next[i] = { ...next[i], qty: next[i].qty + qty }
        } else {
          next = [...prev, { ...line, qty }]
        }
        saveCart(next)
        return next
      })
      setToast(`${line.productName} · ${line.flavorName} adicionado ao carrinho`)
      window.setTimeout(() => setToast(null), 3200)
      return true
    },
    [],
  )

  const setQty = useCallback((index: number, qty: number) => {
    const q = Math.max(1, Math.floor(qty))
    setLines((prev) => {
      const next = [...prev]
      if (!next[index]) return prev
      next[index] = { ...next[index], qty: q }
      saveCart(next)
      return next
    })
  }, [])

  const removeLine = useCallback((index: number) => {
    setLines((prev) => {
      const next = prev.filter((_, j) => j !== index)
      saveCart(next)
      return next
    })
  }, [])

  const clearCart = useCallback(() => {
    setLines([])
    saveCart([])
  }, [])

  const value = useMemo(
    () => ({
      lines,
      toast,
      addLine,
      setQty,
      removeLine,
      clearCart,
      dismissToast,
    }),
    [lines, toast, addLine, setQty, removeLine, clearCart, dismissToast],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart outside CartProvider')
  return ctx
}
