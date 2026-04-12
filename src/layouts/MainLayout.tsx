import { Outlet } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './MainLayout.css'

export function MainLayout() {
  const { toast, dismissToast } = useCart()

  return (
    <div className="main-layout">
      <div className="main-layout__orb main-layout__orb--a" aria-hidden />
      <div className="main-layout__orb main-layout__orb--b" aria-hidden />
      <div className="main-layout__scan" aria-hidden />
      <div className="main-layout__content">
        <Outlet />
      </div>
      {toast && (
        <div className="cart-toast" role="status">
          <span className="cart-toast__shine" aria-hidden />
          <span className="cart-toast__text">{toast}</span>
          <button type="button" className="cart-toast__x" onClick={dismissToast} aria-label="Fechar">
            ×
          </button>
        </div>
      )}
    </div>
  )
}
