import { useEffect, useRef } from 'react'
import type { CatalogProduct } from '../../types'
import { ProductTile } from './ProductTile'
import './ProductGrid.css'

type Props = {
  products: CatalogProduct[]
}

export function ProductGrid({ products }: Props) {
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!gridRef.current) return
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('product-tile--visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    const tiles = gridRef.current.querySelectorAll('.product-tile')
    tiles.forEach((tile) => observer.observe(tile))

    return () => observer.disconnect()
  }, [products])

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
        <div ref={gridRef} className="product-grid">
          {products.map((p) => (
            <ProductTile key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  )
}
