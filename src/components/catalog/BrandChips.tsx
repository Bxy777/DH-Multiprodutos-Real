import './BrandChips.css'

type Props = {
  brands: string[]
  active: string | null
  onSelect: (brand: string | null) => void
}

export function BrandChips({ brands, active, onSelect }: Props) {
  return (
    <div className="brand-chips" role="tablist" aria-label="Filtrar por marca">
      <button
        type="button"
        role="tab"
        aria-selected={active === null}
        className={`brand-chip ${active === null ? 'brand-chip--on' : ''}`}
        onClick={() => onSelect(null)}
      >
        Todos
      </button>
      {brands.map((b) => (
        <button
          key={b}
          type="button"
          role="tab"
          aria-selected={active === b}
          className={`brand-chip ${active === b ? 'brand-chip--on' : ''}`}
          onClick={() => onSelect(b)}
        >
          {b}
        </button>
      ))}
    </div>
  )
}
