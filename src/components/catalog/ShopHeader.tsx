import { Link } from 'react-router-dom'
import { BRAND } from '../../config/brand'
import { useTheme } from '../../context/ThemeContext'
import './ShopHeader.css'

type Props = {
  variant: 'home' | 'product'
  cartCount: number
  onOpenCart: () => void
  searchQuery?: string
  onSearch?: (q: string) => void
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function ShopHeader({ variant, cartCount, onOpenCart, searchQuery, onSearch }: Props) {
  const { theme, toggle } = useTheme()

  return (
    <header className={`shop-header shop-header--${variant}`}>
      <div className="shop-header__row">
        {variant === 'product' ? (
          <Link to="/" className="shop-header__back">
            ← Voltar
          </Link>
        ) : (
          <span className="shop-header__spacer" />
        )}
        <Link to="/" className="shop-header__brand-block">
          <img className="shop-header__logo" src="/dh-logo.png" alt="" width={44} height={44} />
          <div className="shop-header__titles">
            <span className="shop-header__name">{BRAND.name}</span>
            {variant === 'home' && <span className="shop-header__claim">{BRAND.claim}</span>}
          </div>
        </Link>
        <div className="shop-header__actions">
          <button
            type="button"
            className="shop-header__theme-btn"
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
            title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            type="button"
            className={`shop-header__cart ${cartCount > 0 ? 'shop-header__cart--pulse' : ''}`}
            onClick={onOpenCart}
            aria-label="Carrinho"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
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
            {cartCount > 0 && <span className="shop-header__badge">{cartCount > 99 ? '99+' : cartCount}</span>}
          </button>
        </div>
      </div>
      {variant === 'home' && onSearch && (
        <label className="shop-header__search">
          <span className="visually-hidden">Buscar</span>
          <svg className="shop-header__search-ico" width="16" height="16" viewBox="0 0 24 24" aria-hidden>
            <path
              fill="currentColor"
              d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
            />
          </svg>
          <input
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Buscar modelo ou marca…"
            enterKeyHint="search"
            autoComplete="off"
          />
        </label>
      )}
    </header>
  )
}
