import { BRAND, instagramProfileUrl } from '../../config/brand'
import './SiteFooter.css'

export function SiteFooter() {
  const igStore = instagramProfileUrl(BRAND.instagram.store)
  const igDev = instagramProfileUrl(BRAND.instagram.dev)

  return (
    <footer className="site-footer">
      <p className="site-footer__copy">
        © 2026{' '}
        <a href={igStore} target="_blank" rel="noreferrer" className="site-footer__link">
          DH Multiprodutos
        </a>
        .
      </p>
      <p className="site-footer__row">
        <a href={igStore} target="_blank" rel="noreferrer" className="site-footer__ig">
          @dh_multiprodutosunai
        </a>
      </p>
      <p className="site-footer__dev">
        dev:{' '}
        <a href={igDev} target="_blank" rel="noreferrer" className="site-footer__link">
          realkauex
        </a>
      </p>
    </footer>
  )
}
