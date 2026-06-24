import { useMemo } from 'react'
import { useCatalog } from '../../context/CatalogContext'
import { flyerCatalog } from '../../data/flyerCatalog'
import { ProductTile } from './ProductTile'
import './FlyerPromoSection.css'

/** Destaques das fotos promocionais — sempre visíveis no topo do catálogo */
export function FlyerPromoSection() {
  const { products, getById } = useCatalog()

  const promoProducts = useMemo(() => {
    return flyerCatalog.map((fp) => {
      const live = getById(fp.id) ?? products.find((p) => p.id === fp.id)
      return live ?? fp
    })
  }, [products, getById])

  return (
    <section className="flyer-promo" id="promocoes" aria-labelledby="flyer-promo-heading">
      <div className="flyer-promo__head">
        <div>
          <p className="flyer-promo__eyebrow">Pronta entrega · Entrega grátis</p>
          <h2 id="flyer-promo-heading" className="flyer-promo__title">
            Promoções das fotos
          </h2>
        </div>
        <span className="flyer-promo__count">{promoProducts.length} modelos</span>
      </div>
      <div className="flyer-promo__grid">
        {promoProducts.map((p) => (
          <ProductTile key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}
