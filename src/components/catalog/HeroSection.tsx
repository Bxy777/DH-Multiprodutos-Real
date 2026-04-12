import { BRAND } from '../../config/brand'
import './HeroSection.css'

export function HeroSection() {
  return (
    <section className="hero" aria-label="Apresentação">
      <div className="hero__grid">
        <div className="hero__copy">
          <span className="hero__eyebrow">Multimarcas · Unaí</span>
          <h1 className="hero__headline">
            Estoque que gira.
            <span className="hero__headline-accent"> Novidade toda semana.</span>
          </h1>
          <p className="hero__text">{BRAND.heroLead}</p>
          <a className="hero__cta" href="#catalog">
            Ver catálogo
            <span className="hero__cta-arrow" aria-hidden>
              ↓
            </span>
          </a>
        </div>
        <div className="hero__visual" aria-hidden>
          <div className="hero__orb" />
          <div className="hero__ring" />
          <div className="hero__slash" />
        </div>
      </div>
    </section>
  )
}
