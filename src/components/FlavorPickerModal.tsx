import { useEffect, useState } from 'react'
import type { CatalogProduct } from '../types'
import { formatBRL } from '../utils/format'
import './FlavorPickerModal.css'

interface Props {
  product: CatalogProduct
  onClose: () => void
  onAdd: (flavorId: string, flavorName: string) => void
}

export function FlavorPickerModal({ product, onClose, onAdd }: Props) {
  const available = product.flavors.filter((f) => f.stock > 0)
  const [selectedId, setSelectedId] = useState<string | null>(
    available.length === 1 ? available[0].id : null,
  )
  const [error, setError] = useState<string | null>(null)

  // fechar com Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // travar scroll do body
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  const handleConfirm = () => {
    if (!selectedId) {
      setError('Escolha um sabor para continuar.')
      return
    }
    const flavor = product.flavors.find((f) => f.id === selectedId)
    if (!flavor) return
    onAdd(selectedId, flavor.name)
  }

  return (
    <div className="fpm-root" role="dialog" aria-modal aria-label="Escolher sabor">
      <button type="button" className="fpm-backdrop" aria-label="Fechar" onClick={onClose} />
      <div className="fpm-panel">
        <div className="fpm-handle" aria-hidden />

        <div className="fpm-head">
          <div className="fpm-product-info">
            <img className="fpm-img" src={product.image} alt="" />
            <div>
              <p className="fpm-brand">{product.brand}</p>
              <h2 className="fpm-name">{product.name}</h2>
              <p className="fpm-price">{formatBRL(product.price)}</p>
            </div>
          </div>
          <button type="button" className="fpm-close" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </div>

        <div className="fpm-body">
          <p className="fpm-label">Escolha o sabor</p>
          <div className="fpm-chips" role="radiogroup" aria-label="Sabores disponíveis">
            {product.flavors.map((f) => {
              const disabled = f.stock === 0
              const active = selectedId === f.id
              return (
                <button
                  key={f.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  disabled={disabled}
                  className={`fpm-chip ${active ? 'fpm-chip--on' : ''} ${disabled ? 'fpm-chip--off' : ''}`}
                  onClick={() => { setSelectedId(f.id); setError(null) }}
                >
                  <span className="fpm-chip-name">{f.name}</span>
                  {disabled && <span className="fpm-chip-tag">Esgotado</span>}
                  {!disabled && f.stock < 4 && (
                    <span className="fpm-chip-tag fpm-chip-tag--low">{f.stock} rest.</span>
                  )}
                </button>
              )
            })}
          </div>

          {error && <p className="fpm-error" role="alert">{error}</p>}
        </div>

        <div className="fpm-footer">
          <button type="button" className="fpm-btn fpm-btn--confirm" onClick={handleConfirm}>
            Adicionar ao carrinho
          </button>
        </div>
      </div>
    </div>
  )
}
