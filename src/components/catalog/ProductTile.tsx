import { Link } from 'react-router-dom'
import type { CatalogProduct } from '../../types'
import { formatBRL } from '../../utils/format'
import { discountPercent, productInStock } from '../../utils/product'
import './ProductTile.css'

type Props = {
  product: CatalogProduct
}

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 7h15l-1.5 9h-12L6 7zm0 0L5 3H2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="20" r="1.6" fill="currentColor" />
      <circle cx="17" cy="20" r="1.6" fill="currentColor" />
    </svg>
  )
}

export function ProductTile({ product }: Props) {
  const available = productInStock(product)
  const off = discountPercent(product)

  return (
    <article className={`product-tile ${!available ? 'product-tile--out' : ''}`}>
      <Link
        to={`/produto/${product.id}`}
        className={`product-tile__media ${!available ? 'product-tile__media--off' : ''}`}
        onClick={(e) => !available && e.preventDefault()}
      >
        {off != null && off > 0 && (
          <span className="product-tile__badge">{available ? `−${off}%` : 'Esgotado'}</span>
        )}
        <img src={product.image} alt="" loading="lazy" />
      </Link>
      <div className="product-tile__body">
        <h3 className="product-tile__title">
          {product.brand} {product.name}
        </h3>
        <p className="product-tile__meta">
          <span>{product.brand}</span>
          <span className="product-tile__dot">·</span>
          <span>{product.puffs}</span>
        </p>
        <p className="product-tile__desc">{product.shortDescription}</p>
        <div className="product-tile__prices">
          <span className="product-tile__now">{formatBRL(product.price)}</span>
          {product.compareAt != null && product.compareAt > product.price && (
            <span className="product-tile__was">{formatBRL(product.compareAt)}</span>
          )}
        </div>
        <div className="product-tile__row">
          <Link
            to={`/produto/${product.id}`}
            className={`product-tile__btn product-tile__btn--buy ${!available ? 'product-tile__btn--off' : ''}`}
            onClick={(e) => !available && e.preventDefault()}
          >
            Comprar
          </Link>
          <Link
            to={`/produto/${product.id}#escolher`}
            className={`product-tile__btn product-tile__btn--cart ${!available ? 'product-tile__btn--off' : ''}`}
            aria-label="Adicionar ao carrinho"
            title="Adicionar ao carrinho"
            onClick={(e) => !available && e.preventDefault()}
          >
            <CartIcon />
            <span className="product-tile__cart-label">Carrinho</span>
          </Link>
        </div>
      </div>
    </article>
  )
}
