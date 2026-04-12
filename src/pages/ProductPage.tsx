import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useCatalog } from '../context/CatalogContext'
import { useCart } from '../context/CartContext'
import { ShopHeader } from '../components/catalog/ShopHeader'
import { Sheet } from '../components/Sheet'
import { CartPanel } from '../components/CartPanel'
import { cartWhatsAppLink, singleOrderWhatsAppLink } from '../utils/order'
import { formatBRL } from '../utils/format'
import { discountPercent, productInStock } from '../utils/product'
import type { PaymentMethod } from '../types'
import './ProductPage.css'

function RelatedCard({
  p,
}: {
  p: {
    id: string
    brand: string
    name: string
    puffs: string
    price: number
    compareAt?: number
    image: string
  }
}) {
  const off = p.compareAt && p.compareAt > p.price ? Math.round((1 - p.price / p.compareAt) * 100) : null
  return (
    <article className="rel-card">
      <Link to={`/produto/${p.id}`} className="rel-card__media">
        {off != null && <span className="rel-card__badge">−{off}%</span>}
        <img src={p.image} alt="" loading="lazy" />
      </Link>
      <div className="rel-card__body">
        <h4 className="rel-card__title">
          {p.brand} {p.name}
        </h4>
        <p className="rel-card__meta">
          Marca: {p.brand} · {p.puffs}
        </p>
        <div className="rel-card__prices">
          <span className="rel-card__now">{formatBRL(p.price)}</span>
          {p.compareAt != null && p.compareAt > p.price && (
            <span className="rel-card__was">{formatBRL(p.compareAt)}</span>
          )}
        </div>
        <div className="rel-card__row">
          <Link to={`/produto/${p.id}`} className="rel-card__btn rel-card__btn--line">
            Ver produto
          </Link>
          <Link to={`/produto/${p.id}#escolher`} className="rel-card__btn rel-card__btn--fill">
            Adicionar
          </Link>
        </div>
      </div>
    </article>
  )
}

export function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getById, products } = useCatalog()
  const { lines, addLine, removeLine } = useCart()
  const [cartOpen, setCartOpen] = useState(false)

  const p = id ? getById(id) : undefined

  const [flavorId, setFlavorId] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [address, setAddress] = useState('')
  const [payment, setPayment] = useState<PaymentMethod | ''>('')
  const [changeFor, setChangeFor] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const related = useMemo(() => {
    if (!p) return []
    return products.filter((x) => x.id !== p.id).slice(0, 4)
  }, [p, products])

  const flavor = p?.flavors.find((f) => f.id === flavorId)
  const cartCount = lines.reduce((n, l) => n + l.qty, 0)
  const waCart = cartWhatsAppLink(lines)

  useEffect(() => {
    setFlavorId(null)
    setQty(1)
    setAddress('')
    setPayment('')
    setChangeFor('')
    setFormError(null)
  }, [id])

  useEffect(() => {
    if (flavor && qty > flavor.stock) setQty(Math.max(1, flavor.stock))
  }, [flavor, qty])

  if (!id) return <Navigate to="/" replace />
  if (!p) return <Navigate to="/" replace />

  const pct = discountPercent(p)
  const available = productInStock(p)

  const handleAddCart = () => {
    setFormError(null)
    if (!flavorId || !flavor) {
      setFormError('Escolha um sabor antes de adicionar ao carrinho.')
      document.getElementById('escolher')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    if (flavor.stock < qty) {
      setFormError('Quantidade acima do estoque deste sabor.')
      return
    }
    addLine({
      productId: p.id,
      flavorId: flavor.id,
      flavorName: flavor.name,
      productName: p.name,
      brand: p.brand,
      unitPrice: p.price,
      qty,
    })
    setCartOpen(true)
  }

  const handleBuy = () => {
    setFormError(null)
    if (!flavorId || !flavor) {
      setFormError('Selecione o sabor do pod para continuar.')
      document.getElementById('escolher')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    if (flavor.stock < qty) {
      setFormError('Estoque insuficiente para esta quantidade.')
      return
    }
    if (!address.trim()) {
      setFormError('Informe o endereço completo.')
      return
    }
    if (!payment) {
      setFormError('Selecione a forma de pagamento.')
      return
    }
    const url = singleOrderWhatsAppLink({
      brand: p.brand,
      productName: p.name,
      flavorName: flavor.name,
      qty,
      unitPrice: p.price,
      address: address.trim(),
      payment: payment as PaymentMethod,
      changeFor: payment === 'dinheiro' ? changeFor : undefined,
    })
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="pp">
      <ShopHeader variant="product" cartCount={cartCount} onOpenCart={() => setCartOpen(true)} />

      <div className="pp__hero-img">
        {pct != null && pct > 0 && <span className="pp__badge">−{pct}%</span>}
        <img src={p.image} alt="" />
      </div>

      <div className="pp__wrap">
        <div className="pp__tags">
          <span className="pp__tag">{p.brand}</span>
          <span className="pp__tag pp__tag--dim">{p.productKind}</span>
          <span className="pp__tag pp__tag--dim">{p.puffs}</span>
        </div>
        <h1 className="pp__title">
          {p.brand} {p.name}
        </h1>
        <p className="pp__sub">
          Marca: {p.brand} · Nicotina: {p.nicotine}
        </p>

        <div id="escolher" className="pp__block pp__block--flavor">
          <div className="pp__flavor-head">
            <h2 className="pp__h">Sabor</h2>
            <p className="pp__flavor-pick" aria-live="polite">
              <span className="pp__flavor-pick-label">Sabor:</span>{' '}
              <span className="pp__flavor-pick-name">{flavor?.name ?? 'Selecione abaixo'}</span>
            </p>
          </div>
          {!available && <p className="pp__warn">Produto indisponível no momento.</p>}
          <div className="pp__flavors" role="radiogroup" aria-label="Sabor do pod">
            {p.flavors.map((f) => {
              const disabled = f.stock <= 0
              const active = flavorId === f.id
              return (
                <button
                  key={f.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  disabled={disabled}
                  className={`pp__chip ${active ? 'pp__chip--on' : ''} ${disabled ? 'pp__chip--off' : ''}`}
                  onClick={() => setFlavorId(f.id)}
                >
                  <span className="pp__chip-name">{f.name}</span>
                  {!disabled && f.stock < 6 && (
                    <span className="pp__chip-stock" title={`${f.stock} em estoque`}>
                      {f.stock} rest.
                    </span>
                  )}
                  {disabled && <span className="pp__chip-stock">Esgotado</span>}
                </button>
              )
            })}
          </div>
        </div>

        <div className="pp__price-row">
          <div>
            <span className="pp__price">{formatBRL(p.price)}</span>
            {p.compareAt != null && p.compareAt > p.price && (
              <span className="pp__old">{formatBRL(p.compareAt)}</span>
            )}
          </div>
          <div className="pp__qty">
            <span className="pp__qty-label">Quantidade</span>
            <div className="pp__qty-ctrl">
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Menos">
                −
              </button>
              <span>{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                aria-label="Mais"
                disabled={flavor != null && qty >= flavor.stock}
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="pp__trust">
          <span>Entrega grátis na cidade</span>
          <span>Cartão sem taxa</span>
          <span>Cobrimos qualquer preço</span>
        </div>

        <section className="pp__section">
          <h2 className="pp__h">Dados para entrega</h2>
          <label className="pp__field">
            Endereço completo *
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              placeholder="Rua, número, bairro, cidade"
              autoComplete="street-address"
            />
          </label>
          <p className="pp__field-label">Forma de pagamento *</p>
          <div className="pp__pay-grid">
            {(
              [
                ['pix', 'Pix'],
                ['credito', 'Cartão de crédito'],
                ['debito', 'Cartão de débito'],
                ['dinheiro', 'Dinheiro (espécie)'],
              ] as const
            ).map(([val, label]) => (
              <button
                key={val}
                type="button"
                className={`pp__pay ${payment === val ? 'pp__pay--on' : ''}`}
                onClick={() => setPayment(val)}
              >
                {label}
              </button>
            ))}
          </div>
          {payment === 'dinheiro' && (
            <label className="pp__field">
              Troco para quanto? (opcional)
              <input
                value={changeFor}
                onChange={(e) => setChangeFor(e.target.value)}
                placeholder="Ex.: R$ 100,00"
                inputMode="decimal"
              />
            </label>
          )}
        </section>

        <div className="pp__summary">
          <div className="pp__sum-row">
            <span>Produto</span>
            <strong>
              {p.brand} {p.name}
            </strong>
          </div>
          <div className="pp__sum-row">
            <span>Sabor</span>
            <strong>{flavor?.name ?? '—'}</strong>
          </div>
          <div className="pp__sum-row">
            <span>Quantidade</span>
            <strong>{qty}x</strong>
          </div>
          <div className="pp__sum-row pp__sum-total">
            <span>Total</span>
            <strong>{formatBRL(p.price * qty)}</strong>
          </div>
        </div>

        {formError && <p className="pp__error">{formError}</p>}

        <div className="pp__actions">
          <button type="button" className="pp__btn pp__btn--ghost" onClick={() => navigate(-1)}>
            Voltar
          </button>
          <button type="button" className="pp__btn pp__btn--neon" onClick={handleBuy} disabled={!available}>
            Finalizar compra
          </button>
        </div>

        <p className="pp__hint-mini">
          Confira sabor, quantidade e dados — o pedido é enviado já formatado no WhatsApp.
        </p>

        <button type="button" className="pp__add-cart" onClick={handleAddCart} disabled={!available}>
          Adicionar ao carrinho
        </button>
      </div>

      <section className="pp__related">
        <div className="pp__related-head">
          <h2>Você também vai gostar</h2>
          <Link to="/#catalog" className="pp__related-all">
            Ver todos →
          </Link>
        </div>
        <div className="pp__related-grid">
          {related.map((x) => (
            <RelatedCard
              key={x.id}
              p={{
                id: x.id,
                brand: x.brand,
                name: x.name,
                puffs: x.puffs,
                price: x.price,
                compareAt: x.compareAt,
                image: x.image,
              }}
            />
          ))}
        </div>
      </section>

      <Sheet open={cartOpen} title="Carrinho" onClose={() => setCartOpen(false)}>
        <CartPanel lines={lines} onRemove={removeLine} whatsappOrderHref={waCart} />
      </Sheet>
    </div>
  )
}
