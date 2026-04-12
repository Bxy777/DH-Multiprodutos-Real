import { useMemo, useState } from 'react'
import { useCatalog } from '../context/CatalogContext'
import { useCart } from '../context/CartContext'
import { ShopHeader } from '../components/catalog/ShopHeader'
import { HeroSection } from '../components/catalog/HeroSection'
import { BrandChips } from '../components/catalog/BrandChips'
import { ProductGrid } from '../components/catalog/ProductGrid'
import { WhySection } from '../components/catalog/WhySection'
import { SiteFooter } from '../components/catalog/SiteFooter'
import { Sheet } from '../components/Sheet'
import { CartPanel } from '../components/CartPanel'
import { cartWhatsAppLink } from '../utils/order'
import './HomePage.css'

export function HomePage() {
  const { products } = useCatalog()
  const { lines, removeLine } = useCart()
  const [searchQuery, setSearchQuery] = useState('')
  const [brandFilter, setBrandFilter] = useState<string | null>(null)
  const [cartOpen, setCartOpen] = useState(false)

  const brands = useMemo(() => [...new Set(products.map((p) => p.brand))].sort(), [products])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return products.filter((p) => {
      if (brandFilter && p.brand !== brandFilter) return false
      if (!q) return true
      const blob = `${p.name} ${p.brand} ${p.puffs} ${p.shortDescription}`.toLowerCase()
      return blob.includes(q)
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
