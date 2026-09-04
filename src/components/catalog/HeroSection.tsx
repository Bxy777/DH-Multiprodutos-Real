import './HeroSection.css'

export function HeroSection() {
  return (
    <section className="hero" aria-label="Apresentação">
      {/* Animated gradient background */}
      <div className="hero__gradient-bg" aria-hidden />
      
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
            <a className="hero__cta" href="#catalog">
              <span>Compre Aqui</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
            <span className="hero__badge-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              100% original
            </span>
          </div>
        </div>
      </div>

      {/* Bottom info strip */}
      <div className="hero__strip">
        <div className="hero__strip-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Pods originais</span>
        </div>
        <span className="hero__strip-sep" aria-hidden />
        <div className="hero__strip-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Melhor preço</span>
        </div>
      </div>
    </section>
  )
}
