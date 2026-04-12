import type { CatalogProduct } from '../../types'
import { ProductTile } from './ProductTile'
import './ProductGrid.css'

type Props = {
  products: CatalogProduct[]
}

export function ProductGrid({ products }: Props) {
  return (
    <section className="product-grid-section" id="catalog" aria-labelledby="catalog-heading">
      <div className="product-grid-section__head">
        <h2 id="catalog-heading" className="product-grid-section__title">
          Catálogo de pods
        </h2>
        <span className="product-grid-section__count">{products.length} itens</span>
      </div>
      {products.length === 0 ? (
        <p className="product-grid-section__empty">Nada encontrado. Tente outra busca ou marca.</p>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <ProductTile key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  )
}
