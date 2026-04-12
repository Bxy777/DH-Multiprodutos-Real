import type { CatalogProduct } from '../types'

export function productInStock(p: CatalogProduct): boolean {
  return p.flavors.some((f) => f.stock > 0)
}

export function discountPercent(p: CatalogProduct): number | null {
  if (p.compareAt == null || p.compareAt <= p.price) return null
  return Math.round((1 - p.price / p.compareAt) * 100)
}
