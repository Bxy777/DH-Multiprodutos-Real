import './WhySection.css'

export function WhySection() {
  return (
    <section className="why" aria-labelledby="why-heading">
      <div className="why__head">
        <h2 id="why-heading" className="why__title">
          Por que comprar aqui?
        </h2>
        <p className="why__subtitle">Entrega rápida e grátis</p>
      </div>
      <ul className="why__list">
        <li>
          <span className="why__mark" aria-hidden>
            01
          </span>
          <div>
            <strong>Entregas super rápidas e gratuitas</strong>
            <span>Logística focada em Unaí — sem surpresa no prazo.</span>
          </div>
        </li>
        <li>
          <span className="why__mark" aria-hidden>
            02
          </span>
          <div>
            <strong>Pods 100% originais, direto da fábrica</strong>
            <span>Curadoria séria de fornecimento — você recebe o que pediu.</span>
          </div>
        </li>
        <li>
          <span className="why__mark" aria-hidden>
            03
          </span>
          <div>
            <strong>Preços excelentes e produto original</strong>
            <span>Relação custo x benefício pensada para quem compra sempre.</span>
          </div>
        </li>
      </ul>
      <p className="why__manifesto">
        Não é à toa que somos a <em>maior</em> loja de venda de pods de Unaí — sempre trazendo novidades e os
        melhores preços do mercado!
      </p>
    </section>
  )
}
