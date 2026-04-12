export type ProductFlavor = {
  id: string
  name: string
  /** Quantidade em estoque; 0 = indisponível */
  stock: number
}

export type CatalogProduct = {
  id: string
  brand: string
  /** Ex.: POD */
  productKind: string
  /** Nome curto do modelo ex.: V80 8000 */
  name: string
  puffs: string
  /** Ex.: 50mg */
  nicotine: string
  shortDescription: string
  price: number
  compareAt?: number
  image: string
  flavors: ProductFlavor[]
}

export type CartLine = {
  productId: string
  flavorId: string
  flavorName: string
  productName: string
  brand: string
  unitPrice: number
  qty: number
}

export type PaymentMethod = 'pix' | 'credito' | 'debito' | 'dinheiro'
