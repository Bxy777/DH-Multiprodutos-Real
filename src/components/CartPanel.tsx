import type { CartLine } from '../types'
import { BRAND } from '../config/brand'
import { formatBRL, hapticLight } from '../utils/format'
import './CartPanel.css'

type Props = {
  lines: CartLine[]
  onRemove: (index: number) => void
  whatsappOrderHref: string | null
}

export function CartPanel({ lines, onRemove, whatsappOrderHref }: Props) {
  const total = lines.reduce((s, l) => s + l.unitPrice * l.qty, 0)

  return (
    <div className="cart-panel">
      {lines.length === 0 ? (
        <p className="cart-panel__empty">Seu carrinho está vazio.</p>
      ) : (
        <ul className="cart-list">
          {lines.map((line, i) => (
            <li key={`${line.productId}-${i}`} className="cart-line">
              <div className="cart-line__text">
                <span className="cart-line__title">{line.productName}</span>
                <span className="cart-line__meta">
                  {line.brand} · {line.flavorName} · {line.qty}x
                </span>
              </div>
              <div className="cart-line__right">
                <span className="cart-line__price">{formatBRL(line.unitPrice * line.qty)}</span>
                <button
                  type="button"
                  className="cart-line__remove"
                  onClick={() => {
                    hapticLight()
                    onRemove(i)
                  }}
                >
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {lines.length > 0 && (
        <>
          <div className="cart-total">
            <span>Total</span>
            <strong>{formatBRL(total)}</strong>
          </div>
          <p className="cart-panel__hint">
            Pedido para retirada/entrega em <strong>{BRAND.deliveryLine}</strong>. Confirme sabores disponíveis no
            WhatsApp.
          </p>
          {whatsappOrderHref && (
            <a className="cart-panel__wa" href={whatsappOrderHref} target="_blank" rel="noreferrer">
              Enviar pedido no WhatsApp
            </a>
          )}
        </>
      )}
    </div>
  )
}
