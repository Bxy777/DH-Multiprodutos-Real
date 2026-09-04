import './HeroSection.css'

export function HeroSection() {
  return (
    <section className="hero" aria-label="Apresentação">
      {/* Banner with editorial composition */}
      <div className="hero__banner">
        <img
          className="hero__banner-img"
          src="/hero-banner.jpg"
          alt="DH Multiprodutos — Pods premium"
        />

        {/* Refined overlay for readability */}
        <div className="hero__banner-overlay" aria-hidden />

        {/* Content with better hierarchy */}
        <div className="hero__banner-content">
          <div className="hero__kicker">
            <span className="hero__kicker-dot" />
            Unaí — MG
          </div>

          <h1 className="hero__headline">
            <span className="hero__headline-line1">DH</span>
            <span className="hero__headline-line2">MULTI<em>PRODUTOS</em></span>
          </h1>

          <p className="hero__sub">Pods premium. Preço real. Entrega na sua porta.</p>

          <div className="hero__actions">
            <a className="hero__cta" href="#promocoes">
              Ver promoções
            </a>
            <span className="hero__badge-pill">100% original</span>
          </div>
        </div>
      </div>

      {/* Bottom info strip */}
      <div className="hero__strip">
        <span>⚡ Entrega grátis em Unaí</span>
        <span className="hero__strip-sep" aria-hidden />
        <span>✦ Pods originais</span>
        <span className="hero__strip-sep" aria-hidden />
        <span>◈ Melhor preço</span>
      </div>
    </section>
  )
}
