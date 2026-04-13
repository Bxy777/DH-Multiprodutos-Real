import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { logoutAdmin } from '../auth/adminSession'
import { useCatalog } from '../context/CatalogContext'
import type { CatalogProduct, ProductFlavor } from '../types'
import { productInStock } from '../utils/product'
import './AdminDashboard.css'


function newId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}`
}

function emptyProduct(): CatalogProduct {
  return {
    id: newId(),
    brand: '',
    productKind: 'POD',
    name: '',
    puffs: '',
    nicotine: '50mg',
    shortDescription: '',
    price: 0,
    compareAt: undefined,
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80',
    flavors: [{ id: newId(), name: 'Sabor exemplo', stock: 5 }],
  }
}

async function uploadImage(file: File): Promise<string | null> {
  try {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/images/upload', { method: 'POST', body: form })
    if (!res.ok) return null
    const data = await res.json()
    return data.url ?? null
  } catch {
    return null
  }
}

export function AdminDashboard() {
  const nav = useNavigate()
  const { products, upsertProduct, removeProduct, resetToSeed, refreshCatalog } = useCatalog()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<CatalogProduct | null>(null)
  const [creating, setCreating] = useState(false)
  const [tab, setTab] = useState<'dados' | 'sabores'>('dados')
  const [uploading, setUploading] = useState(false)

  // Always fetch latest catalog from server when admin opens
  useEffect(() => { refreshCatalog() }, [])

  const stats = useMemo(() => {
    let flavorSkus = 0
    let low = 0
    let out = 0
    for (const p of products) {
      for (const f of p.flavors) {
        flavorSkus++
        if (f.stock === 0) out++
        else if (f.stock < 4) low++
      }
    }
    return {
      totalProducts: products.length,
      flavorSkus,
      low,
      out,
    }
  }, [products])

  useEffect(() => {
    if (editing) setTab('dados')
  }, [editing?.id])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return products
    return products.filter(
      (p) =>
        `${p.brand} ${p.name} ${p.puffs}`.toLowerCase().includes(s) ||
        p.flavors.some((f) => f.name.toLowerCase().includes(s)),
    )
  }, [products, q])

  const openNew = () => {
    setCreating(true)
    setEditing(emptyProduct())
  }

  const openEdit = (p: CatalogProduct) => {
    setCreating(false)
    setEditing(JSON.parse(JSON.stringify(p)) as CatalogProduct)
  }

  const save = (e: FormEvent) => {
    e.preventDefault()
    if (!editing) return
    const p = editing
    if (!p.brand.trim() || !p.name.trim() || !p.puffs.trim()) {
      alert('Preencha marca, nome do modelo e puffs.')
      return
    }
    if (p.flavors.length === 0) {
      alert('Cadastre ao menos um sabor.')
      return
    }
    upsertProduct({
      ...p,
      price: Number(p.price) || 0,
      compareAt: p.compareAt != null && p.compareAt > 0 ? Number(p.compareAt) : undefined,
      flavors: p.flavors.map((f) => ({
        ...f,
        stock: Math.max(0, Math.floor(Number(f.stock)) || 0),
      })),
    })
    setEditing(null)
    setCreating(false)
  }

  const logout = () => {
    logoutAdmin()
    nav('/admin/login', { replace: true })
  }

  return (
    <div className="adm">
      <header className="adm__top">
        <div>
          <h1 className="adm__h">Painel DH</h1>
          <p className="adm__sub">Estoque por sabor · produtos · preços</p>
        </div>
        <div className="adm__top-actions">
          <Link to="/" className="adm__link">
            Ver loja
          </Link>
          <button type="button" className="adm__ghost" onClick={logout}>
            Sair
          </button>
        </div>
      </header>

      <section className="adm__stats" aria-label="Resumo">
        <div className="adm__stat">
          <span className="adm__stat-val">{stats.totalProducts}</span>
          <span className="adm__stat-label">Produtos</span>
        </div>
        <div className="adm__stat">
          <span className="adm__stat-val">{stats.flavorSkus}</span>
          <span className="adm__stat-label">Sabores (SKU)</span>
        </div>
        <div className="adm__stat adm__stat--warn">
          <span className="adm__stat-val">{stats.low}</span>
          <span className="adm__stat-label">Estoque baixo</span>
        </div>
        <div className="adm__stat adm__stat--bad">
          <span className="adm__stat-val">{stats.out}</span>
          <span className="adm__stat-label">Esgotados</span>
        </div>
      </section>

      <div className="adm__toolbar">
        <input
          className="adm__search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar produto ou sabor…"
        />
        <button type="button" className="adm__primary" onClick={openNew}>
          + Novo pod
        </button>
        <button
          type="button"
          className="adm__danger-outline"
          onClick={() => {
            if (confirm('Restaurar catálogo inicial? Isso substitui todos os dados locais.')) resetToSeed()
          }}
        >
          Restaurar padrão
        </button>
      </div>

      <div className="adm__grid">
        {filtered.map((p) => {
          const ok = productInStock(p)
          const minStock = Math.min(...p.flavors.map((f) => f.stock))
          return (
            <button key={p.id} type="button" className="adm__card" onClick={() => openEdit(p)}>
              <div className="adm__card-img">
                <img src={p.image} alt="" />
                {!ok && <span className="adm__oos">Sem estoque</span>}
              </div>
              <div className="adm__card-body">
                <strong>
                  {p.brand} {p.name}
                </strong>
                <span className="adm__card-meta">
                  {p.puffs} · menor estoque: {minStock}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {editing && (
        <div className="adm__drawer">
          <div className="adm__drawer-inner">
            <div className="adm__drawer-head">
              <h2>{creating ? 'Novo produto' : 'Editar produto'}</h2>
              <button type="button" className="adm__x" onClick={() => setEditing(null)} aria-label="Fechar">
                ×
              </button>
            </div>
            <form onSubmit={save} className="adm__form">
              <div className="adm__tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === 'dados'}
                  className={`adm__tab ${tab === 'dados' ? 'adm__tab--on' : ''}`}
                  onClick={() => setTab('dados')}
                >
                  Dados & preço
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === 'sabores'}
                  className={`adm__tab ${tab === 'sabores' ? 'adm__tab--on' : ''}`}
                  onClick={() => setTab('sabores')}
                >
                  Sabores ({editing.flavors.length})
                </button>
              </div>

              {tab === 'dados' && (
                <>
              <label>
                Marca *
                <input
                  value={editing.brand}
                  onChange={(e) => setEditing({ ...editing, brand: e.target.value })}
                />
              </label>
              <label>
                Nome do modelo *
                <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </label>
              <label>
                Puffs *
                <input
                  value={editing.puffs}
                  onChange={(e) => setEditing({ ...editing, puffs: e.target.value })}
                  placeholder="ex.: 8.000 puffs"
                />
              </label>
              <label>
                Nicotina
                <input
                  value={editing.nicotine}
                  onChange={(e) => setEditing({ ...editing, nicotine: e.target.value })}
                />
              </label>
              <label>
                Descrição curta
                <textarea
                  rows={3}
                  value={editing.shortDescription}
                  onChange={(e) => setEditing({ ...editing, shortDescription: e.target.value })}
                />
              </label>
              <label>
                Imagem do produto
                <div className="adm__img-upload">
                  {editing.image && (
                    <img src={editing.image} alt="Preview" className="adm__img-preview" />
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      setUploading(true)
                      const url = await uploadImage(file)
                      setUploading(false)
                      if (url) {
                        setEditing({ ...editing, image: url })
                      } else {
                        alert('Erro ao enviar imagem. Tente novamente.')
                      }
                      e.target.value = ''
                    }}
                  />
                  <button
                    type="button"
                    className="adm__small"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? 'Enviando…' : 'Enviar imagem'}
                  </button>
                </div>
                <input
                  value={editing.image}
                  onChange={(e) => setEditing({ ...editing, image: e.target.value })}
                  placeholder="Ou cole a URL da imagem"
                />
              </label>
              <div className="adm__row2">
                <label>
                  Preço (R$) *
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={editing.price || ''}
                    onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })}
                  />
                </label>
                <label>
                  Preço antes (opcional)
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={editing.compareAt ?? ''}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        compareAt: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                  />
                </label>
              </div>
                </>
              )}

              {tab === 'sabores' && (
              <div className="adm__flavors">
                <div className="adm__flavors-head">
                  <h3>Sabores e estoque</h3>
                  <button
                    type="button"
                    className="adm__small"
                    onClick={() => {
                      const nf: ProductFlavor = { id: newId(), name: 'Novo sabor', stock: 5 }
                      setEditing((e) => (e ? { ...e, flavors: [...e.flavors, nf] } : null))
                    }}
                  >
                    + Sabor
                  </button>
                </div>
                {editing.flavors.map((f) => (
                  <div key={f.id} className="adm__flavor-row">
                    <input
                      value={f.name}
                      onChange={(e) => {
                        const flavors = editing.flavors.map((x) =>
                          x.id === f.id ? { ...x, name: e.target.value } : x,
                        )
                        setEditing({ ...editing, flavors })
                      }}
                    />
                    <input
                      type="number"
                      min={0}
                      className="adm__stock-input"
                      value={f.stock}
                      onChange={(e) => {
                        const v = Math.max(0, parseInt(e.target.value, 10) || 0)
                        const flavors = editing.flavors.map((x) => (x.id === f.id ? { ...x, stock: v } : x))
                        setEditing({ ...editing, flavors })
                      }}
                    />
                    <div className="adm__flavor-actions">
                      <button
                        type="button"
                        className="adm__mini"
                        onClick={() => {
                          setEditing({
                            ...editing,
                            flavors: editing.flavors.map((x) =>
                              x.id === f.id ? { ...x, stock: Math.max(0, x.stock - 1) } : x,
                            ),
                          })
                        }}
                      >
                        −1 venda
                      </button>
                      <button
                        type="button"
                        className="adm__mini"
                        onClick={() => {
                          setEditing({
                            ...editing,
                            flavors: editing.flavors.map((x) =>
                              x.id === f.id ? { ...x, stock: x.stock + 1 } : x,
                            ),
                          })
                        }}
                      >
                        +1 entrada
                      </button>
                      <button
                        type="button"
                        className="adm__mini danger"
                        onClick={() => {
                          if (!confirm('Remover este sabor?')) return
                          setEditing({
                            ...editing,
                            flavors: editing.flavors.filter((x) => x.id !== f.id),
                          })
                        }}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              )}

              <div className="adm__form-actions">
                {!creating && (
                  <button
                    type="button"
                    className="adm__danger"
                    onClick={() => {
                      if (!confirm('Excluir este produto do catálogo?')) return
                      removeProduct(editing.id)
                      setEditing(null)
                    }}
                  >
                    Excluir produto
                  </button>
                )}
                <button type="submit" className="adm__primary wide">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
