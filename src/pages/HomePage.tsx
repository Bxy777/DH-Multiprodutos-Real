import { useMemo, useState } from 'react'
import { useCatalog } from '../context/CatalogContext'
import { useCart } from '../context/CartContext'
import { ShopHeader } from '../components/catalog/ShopHeader'
import { HeroSection } from '../components/catalog/HeroSection'
import { BrandChips } from '../components/catalog/BrandChips'
import { FlyerPromoSection } from '../components/catalog/FlyerPromoSection'
import { ProductGrid } from '../components/catalog/ProductGrid'
import { WhySection } from '../components/catalog/WhySection'
import { SiteFooter } from '../components/catalog/SiteFooter'
import { Sheet } from '../components/Sheet'
import { CartPanel } from '../components/CartPanel'
import { FLYER_PRODUCT_IDS } from '../data/flyerCatalog'
import { cartWhatsAppLink } from '../utils/order'
import './HomePage.css'

// Ordem fixa das marcas — novos produtos da mesma marca ficam agrupados
const BRAND_ORDER = [
  'Ignite', 'Waka', 'Sex Addict', 'Elfbar', 'Life Pod',
  'Nikbar', 'Black Sheep', 'Lost Mary', 'Oxbar',
  'Rabeats', 'Mr Freeze', 'Hero Salt', 'Yogi',
]

function flyerSortIndex(id: string): number {
  const i = FLYER_PRODUCT_IDS.indexOf(id as (typeof FLYER_PRODUCT_IDS)[number])
  return i >= 0 ? i : FLYER_PRODUCT_IDS.length + 1
}

function brandIndex(brand: string): number {
  const i = BRAND_ORDER.indexOf(brand)
  return i >= 0 ? i : BRAND_ORDER.length
}

/** Extrai número de puffs do campo puffs (ex: "40.000 puffs" → 40000) */
function parsePuffs(puffs: string): number {
  const n = puffs.replace(/\./g, '').replace(/[^\d]/g, '')
  return n ? parseInt(n, 10) : 0
}

export function HomePage() {
  const { products, loading, syncError, cloudEnabled } = useCatalog()
  const { lines, removeLine } = useCart()
  const [searchQuery, setSearchQuery] = useState('')
  const [brandFilter, setBrandFilter] = useState<string | null>(null)
  const [cartOpen, setCartOpen] = useState(false)

  const brands = useMemo(() => [...new Set(products.map((p) => p.brand))].sort(), [products])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const list = products.filter((p) => {
      if (p.hidden) return false
      if (brandFilter && p.brand !== brandFilter) return false
      if (!q) return true
      const blob = `${p.name} ${p.brand} ${p.puffs} ${p.shortDescription}`.toLowerCase()
      return blob.includes(q)
    })
    // Ordena por marca, depois por puffs crescente dentro de cada marca
    return [...list].sort((a, b) => {
      const flyerDiff = flyerSortIndex(a.id) - flyerSortIndex(b.id)
      if (flyerDiff !== 0) return flyerDiff
      const brandDiff = brandIndex(a.brand) - brandIndex(b.brand)
      if (brandDiff !== 0) return brandDiff
      return parsePuffs(a.puffs) - parsePuffs(b.puffs)
    })
  }, [searchQuery, brandFilter, products])

  const cartCount = lines.reduce((n, l) => n + l.qty, 0)
  const waCart = cartWhatsAppLink(lines)

  return (
    <div className="home">
      <ShopHeader
        variant="home"
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
      />
      <main className="home__main">
        <HeroSection />
        {cloudEnabled && syncError && (
          <p className="home__sync-warn" role="status">
            Catálogo carregado localmente. Para sincronizar na nuvem, rode o SQL em{' '}
            <code>supabase/schema.sql</code> no Supabase.
          </p>
        )}
        {!loading && products.length === 0 && (
          <p className="home__sync-warn" role="status">
            Catálogo vazio — recarregue a página ou acesse /admin e use &quot;Restaurar padrão&quot;.
          </p>
        )}
        <FlyerPromoSection />
        <BrandChips brands={brands} active={brandFilter} onSelect={setBrandFilter} />
        <ProductGrid products={filtered} />
        <WhySection />
        <SiteFooter />
      </main>

      <Sheet open={cartOpen} title="Carrinho" onClose={() => setCartOpen(false)}>
        <CartPanel lines={lines} onRemove={removeLine} whatsappOrderHref={waCart} />
      </Sheet>
    </div>
  )
}
