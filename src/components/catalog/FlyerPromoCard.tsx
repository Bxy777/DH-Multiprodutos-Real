import { Link } from 'react-router-dom'
import type { CatalogProduct } from '../../types'
import { formatBRL } from '../../utils/format'
import './FlyerPromoCard.css'

type Props = {
  product: CatalogProduct
}

export function FlyerPromoCard({ product }: Props) {
  const flavors = (product.flavors ?? []).filter((f) => !f.hidden)
  const price = Number(product.price) || 0

  return (
    <article className="flyer-card">
      <Link to={`/produto/${product.id}`} className="flyer-card__top">
        <div className="flyer-card__media">
          <img src={product.image} alt={`${product.brand} ${product.name}`} loading="lazy" />
        </div>
        <div className="flyer-card__head">
          <h3 className="flyer-card__name">
            {product.brand} {product.name}
          </h3>
          <p className="flyer-card__puffs">{product.puffs}</p>
          <p className="flyer-card__price">{formatBRL(price)}</p>
        </div>
      </Link>

      <div className="flyer-card__flavors-wrap">
        <p className="flyer-card__flavors-label">
          {flavors.length} sabores disponíveis
        </p>
        <ul className="flyer-card__flavors">
          {flavors.map((f) => (
            <li key={f.id}>{f.name}</li>
          ))}
        </ul>
      </div>

      <Link to={`/produto/${product.id}`} className="flyer-card__cta">
        Comprar
      </Link>
    </article>
  )
}
