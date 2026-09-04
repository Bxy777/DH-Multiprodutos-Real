import { useMemo } from 'react'
import { useCatalog } from '../../context/CatalogContext'
import { flyerCatalog } from '../../data/flyerCatalog'
import { FlyerPromoCard } from './FlyerPromoCard'
import './FlyerPromoSection.css'

/** Destaques das fotos promocionais — sempre visíveis no topo do catálogo */
export function FlyerPromoSection() {
  const { getById, products } = useCatalog()

  const promoProducts = useMemo(() => {
    return flyerCatalog.map((fp) => {
      const live = getById(fp.id)
      if (!live) return fp
      return {
        ...fp,
        price: live.price ?? fp.price,
        name: live.name || fp.name,
        puffs: live.puffs || fp.puffs,
        image: live.image || fp.image,
        flavors: live.flavors?.length ? live.flavors : fp.flavors,
      }
    })
  }, [getById, products])

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
          <FlyerPromoCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  )
}
