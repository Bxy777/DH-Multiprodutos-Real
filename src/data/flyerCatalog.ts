import type { CatalogProduct } from '../types'

/** Incremente ao alterar produtos/preços das fotos — força novo sync na nuvem */
export const FLYER_CATALOG_VERSION = 6

export const FLYER_PRODUCT_IDS = [] as const

/** 
 * Produtos promocionais do catálogo (atualizado 31/08/2026)
 * Array vazio = usa apenas seedCatalog.ts
 */
export const flyerCatalog: CatalogProduct[] = []

/** Atualiza ou insere produtos das fotos no catálogo */
export function mergeFlyerCatalog(catalog: CatalogProduct[]): CatalogProduct[] {
  const result = catalog.map((p) => {
    const flyer = flyerCatalog.find((f) => f.id === p.id)
    return flyer ?? p
  })

  for (const fp of flyerCatalog) {
    if (result.some((p) => p.id === fp.id)) continue

    let insertAt = result.length
    for (let i = result.length - 1; i >= 0; i--) {
      if (result[i].brand === fp.brand) {
        insertAt = i + 1
        break
      }
    }
    if (insertAt === result.length) {
      const firstSame = result.findIndex((p) => p.brand === fp.brand)
      if (firstSame >= 0) insertAt = firstSame
    }
    result.splice(insertAt, 0, fp)
  }

  return result
}
