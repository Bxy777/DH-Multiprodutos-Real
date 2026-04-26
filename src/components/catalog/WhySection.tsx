import './WhySection.css'

export function WhySection() {
  return (
    <section className="why" aria-label="Diferenciais">
      <div className="why__inner">
        <div className="why__card why__card--highlight">
          <span className="why__card-icon">⚡</span>
          <strong>Entrega grátis</strong>
          <span>Unaí e região</span>
        </div>
        <div className="why__card">
          <span className="why__card-icon">✦</span>
          <strong>100% original</strong>
          <span>Direto da fábrica</span>
        </div>
        <div className="why__card">
          <span className="why__card-icon">◈</span>
          <strong>Menor preço</strong>
          <span>Garantido</span>
        </div>
      </div>
    </section>
  )
}
