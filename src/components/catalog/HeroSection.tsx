import './HeroSection.css'

export function HeroSection() {
  return (
    <section className="hero" aria-label="Apresentação">
      {/* ticker */}
      <div className="hero__ticker" aria-hidden>
        <div className="hero__ticker-track">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="hero__ticker-item">
              PODS ORIGINAIS <span className="hero__ticker-dot">✦</span> ENTREGA GRÁTIS <span className="hero__ticker-dot">✦</span> 0 TAXAS NO CARTÃO <span className="hero__ticker-dot">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* banner com overlay de texto */}
      <div className="hero__banner">
        <img
          className="hero__banner-img"
          src="/hero-banner.jpg"
          alt="DH Multiprodutos — Pods premium"
        />

        {/* overlay escuro para legibilidade */}
        <div className="hero__banner-overlay" aria-hidden />

        {/* texto sobreposto */}
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
              Ver catálogo
            </a>
            <span className="hero__badge-pill">100% original</span>
          </div>
        </div>
      </div>

      {/* faixa inferior */}
      <div className="hero__strip">
        <span>⚡ Entrega grátis em Unaí</span>
        <span className="hero__strip-sep" />
        <span>✦ Pods originais</span>
        <span className="hero__strip-sep" />
        <span>◈ Melhor preço</span>
      </div>
    </section>
  )
}
