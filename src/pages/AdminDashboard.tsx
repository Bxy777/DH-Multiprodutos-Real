import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { logoutAdmin } from '../auth/adminSession'
import { useAuth } from '../hooks/useAuth'
import { useCatalog } from '../context/CatalogContext'
import type { CatalogProduct, ProductFlavor } from '../types'
import { productInStock } from '../utils/product'
import { formatBRL } from '../utils/format'
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

function StockDot({ stock }: { stock: number }) {
  if (stock === 0) return <span className="adm__dot adm__dot--out" title="Esgotado" />
  if (stock < 4) return <span className="adm__dot adm__dot--low" title={`${stock} em estoque`} />
  return <span className="adm__dot adm__dot--ok" title={`${stock} em estoque`} />
}

export function AdminDashboard() {
  const nav = useNavigate()
  const { signOut } = useAuth()
  const { products, upsertProduct, removeProduct, reorderProduct, resetToSeed, cloudEnabled, syncError } = useCatalog()

  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<CatalogProduct | null>(null)
  const [creating, setCreating] = useState(false)
  const [tab, setTab] = useState<'dados' | 'sabores'>('dados')
  const [toast, setToast] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

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
    return { totalProducts: products.length, flavorSkus, low, out }
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
    setConfirmDelete(false)
    setEditing(emptyProduct())
  }

  const openEdit = (p: CatalogProduct) => {
    setCreating(false)
    setConfirmDelete(false)
    setEditing(JSON.parse(JSON.stringify(p)) as CatalogProduct)
  }

  const saveFeedback = (ok: boolean) => {
    if (ok && cloudEnabled) return '✓ Salvo na nuvem — todos veem a alteração!'
    if (ok) return '⚠️ Salvo só neste aparelho. Configure o Supabase na Vercel e faça redeploy.'
    if (syncError) return `⚠️ Erro ao salvar na nuvem: ${syncError}`
    return '⚠️ Não foi possível sincronizar com a nuvem.'
  }

  const save = async (e: FormEvent) => {
    e.preventDefault()
    if (!editing) return
    const p = editing
    if (!p.brand.trim() || !p.name.trim() || !p.puffs.trim()) {
      showToast('⚠️ Preencha marca, nome e puffs.')
      return
    }
    if (p.flavors.length === 0) {
      showToast('⚠️ Cadastre ao menos um sabor.')
      return
    }
    const ok = await upsertProduct({
      ...p,
      price: Number(p.price) || 0,
      compareAt: p.compareAt != null && p.compareAt > 0 ? Number(p.compareAt) : undefined,
      flavors: p.flavors.map((f) => ({
        ...f,
        stock: Math.max(0, Math.floor(Number(f.stock)) || 0),
      })),
    })
    showToast(saveFeedback(ok))
    if (ok) {
      setEditing(null)
      setCreating(false)
    }
  }

  const logout = async () => {
    logoutAdmin()
    await signOut()
    nav('/admin/login', { replace: true })
  }

  return (
    <div className="adm">
      {/* Toast */}
      {toast && <div className="adm__toast">{toast}</div>}

      <header className="adm__top">
        <div>
          <h1 className="adm__h">Painel DH</h1>
          <p className="adm__sub">Estoque · produtos · preços</p>
        </div>
        <div className="adm__top-actions">
          <Link to="/" className="adm__link">Ver loja</Link>
          <button type="button" className="adm__ghost" onClick={logout}>Sair</button>
        </div>
      </header>

      {!cloudEnabled && (
        <div className="adm__warn-banner" role="status">
          ⚠️ <strong>Modo local.</strong> Alterações ficam só neste aparelho. Para sincronizar com todos:
          crie um projeto em <strong>supabase.com</strong>, rode o SQL em <code>supabase/schema.sql</code>,
          e adicione <code>VITE_SUPABASE_URL</code> + <code>VITE_SUPABASE_ANON_KEY</code> na Vercel (dhpodss) → Redeploy.
        </div>
      )}

      {cloudEnabled && syncError && (
        <div className="adm__warn-banner adm__warn-banner--error" role="alert">
          ⚠️ <strong>Erro ao sincronizar:</strong> {syncError}
        </div>
      )}

      {cloudEnabled && !syncError && (
        <div className="adm__sync-ok" role="status">
          ☁️ Catálogo sincronizado na nuvem — mudanças aparecem para todos os clientes.
        </div>
      )}

      {/* Stats */}
      <section className="adm__stats" aria-label="Resumo">
        <div className="adm__stat">
          <span className="adm__stat-val">{stats.totalProducts}</span>
          <span className="adm__stat-label">Produtos</span>
        </div>
        <div className="adm__stat">
          <span className="adm__stat-val">{stats.flavorSkus}</span>
          <span className="adm__stat-label">Sabores</span>
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

      {/* Toolbar */}
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
        {confirmReset ? (
          <div className="adm__confirm-inline">
            <span>Restaurar catálogo?</span>
            <button
              type="button"
              className="adm__confirm-yes"
              onClick={async () => {
                const ok = await resetToSeed()
                setConfirmReset(false)
                showToast(ok ? '✓ Catálogo restaurado na nuvem!' : saveFeedback(false))
              }}
            >
              Sim
            </button>
            <button type="button" className="adm__confirm-no" onClick={() => setConfirmReset(false)}>
              Não
            </button>
          </div>
        ) : (
          <button type="button" className="adm__danger-outline" onClick={() => setConfirmReset(true)}>
            Restaurar padrão
          </button>
        )}
      </div>

      {/* Grid de produtos */}
      <div className="adm__grid">
        {filtered.map((p) => {
          const ok = productInStock(p)
          const availFlavors = p.flavors.filter((f) => f.stock > 0).length
          const minStock = p.flavors.length > 0 ? Math.min(...p.flavors.map((f) => f.stock)) : 0
          return (
            <button key={p.id} type="button" className={`adm__card ${p.hidden ? 'adm__card--hidden' : ''}`} onClick={() => openEdit(p)}>
              <div className="adm__card-img">
                <img src={p.image} alt="" />
                {!ok && <span className="adm__oos">Esgotado</span>}
                {p.hidden && <span className="adm__hidden-badge">👁‍🗨 Oculto</span>}
                <span className="adm__card-price">{formatBRL(p.price)}</span>
              </div>
              <div className="adm__card-body">
                <strong>{p.brand} {p.name}</strong>
                <span className="adm__card-meta">{p.puffs}</span>
                <div className="adm__card-stock">
                  {p.flavors.slice(0, 8).map((f) => (
                    <StockDot key={f.id} stock={f.stock} />
                  ))}
                  {p.flavors.length > 8 && (
                    <span className="adm__card-more">+{p.flavors.length - 8}</span>
                  )}
                  <span className="adm__card-stock-label">
                    {availFlavors}/{p.flavors.length} disponíveis · min {minStock}
                  </span>
                </div>
                <div className="adm__card-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className={`adm__visibility-btn ${p.hidden ? 'adm__visibility-btn--hidden' : ''}`}
                    title={p.hidden ? 'Produto oculto — clique para mostrar' : 'Produto visível — clique para ocultar'}
                    onClick={async (e) => {
                      e.stopPropagation()
                      const ok = await upsertProduct({ ...p, hidden: !p.hidden })
                      if (!ok) showToast(saveFeedback(false))
                    }}
                  >
                    {p.hidden ? (
                      // Olho fechado
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      // Olho aberto
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                  <div className="adm__card-order">
                    <button type="button" className="adm__order-btn" title="Mover para cima" onClick={() => reorderProduct(p.id, 'up')}>↑</button>
                    <button type="button" className="adm__order-btn" title="Mover para baixo" onClick={() => reorderProduct(p.id, 'down')}>↓</button>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Drawer de edição */}
      {editing && (
        <div className="adm__drawer" onClick={(e) => e.target === e.currentTarget && setEditing(null)}>
          <div className="adm__drawer-inner">
            <div className="adm__drawer-head">
              <h2>{creating ? 'Novo produto' : 'Editar produto'}</h2>
              <button type="button" className="adm__x" onClick={() => setEditing(null)} aria-label="Fechar">×</button>
            </div>

            <form onSubmit={save} className="adm__form">
              <div className="adm__tabs" role="tablist">
                <button
                  type="button" role="tab"
                  aria-selected={tab === 'dados'}
                  className={`adm__tab ${tab === 'dados' ? 'adm__tab--on' : ''}`}
                  onClick={() => setTab('dados')}
                >
                  Dados & preço
                </button>
                <button
                  type="button" role="tab"
                  aria-selected={tab === 'sabores'}
                  className={`adm__tab ${tab === 'sabores' ? 'adm__tab--on' : ''}`}
                  onClick={() => setTab('sabores')}
                >
                  Sabores ({editing.flavors.length})
                </button>
              </div>

              {tab === 'dados' && (
                <>
                  {/* Preview da imagem */}
                  {editing.image && (
                    <div className="adm__img-preview">
                      <img src={editing.image} alt="Preview" />
                    </div>
                  )}

                  <label>
                    Marca *
                    <input value={editing.brand} onChange={(e) => setEditing({ ...editing, brand: e.target.value })} />
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
                    <input value={editing.nicotine} onChange={(e) => setEditing({ ...editing, nicotine: e.target.value })} />
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
                    URL da imagem
                    <input value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} placeholder="https://..." />
                  </label>
                  <div className="adm__upload-row">
                    <span className="adm__upload-label">ou enviar arquivo</span>
                    <label className="adm__upload-btn">
                      📁 Escolher imagem
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          const reader = new FileReader()
                          reader.onload = (ev) => {
                            const result = ev.target?.result as string
                            if (result) setEditing({ ...editing, image: result })
                          }
                          reader.readAsDataURL(file)
                          e.target.value = ''
                        }}
                      />
                    </label>
                  </div>
                  <div className="adm__row2">
                    <label>
                      Preço (R$) *
                      <input
                        type="number" step="0.01" min={0}
                        value={editing.price || ''}
                        onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })}
                      />
                    </label>
                    <label>
                      Preço antes (opcional)
                      <input
                        type="number" step="0.01" min={0}
                        value={editing.compareAt ?? ''}
                        onChange={(e) =>
                          setEditing({ ...editing, compareAt: e.target.value ? parseFloat(e.target.value) : undefined })
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
                      type="button" className="adm__small"
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
                      <div className="adm__flavor-top">
                        <StockDot stock={f.stock} />
                        <input
                          value={f.name}
                          placeholder="Nome do sabor"
                          onChange={(e) => {
                            const flavors = editing.flavors.map((x) =>
                              x.id === f.id ? { ...x, name: e.target.value } : x,
                            )
                            setEditing({ ...editing, flavors })
                          }}
                        />
                      </div>
                      <div className="adm__flavor-ctrl">
                        <button
                          type="button" className="adm__mini"
                          onClick={() =>
                            setEditing({
                              ...editing,
                              flavors: editing.flavors.map((x) =>
                                x.id === f.id ? { ...x, stock: Math.max(0, x.stock - 1) } : x,
                              ),
                            })
                          }
                        >
                          −
                        </button>
                        <input
                          type="number" min={0}
                          className="adm__stock-input"
                          value={f.stock}
                          onChange={(e) => {
                            const v = Math.max(0, parseInt(e.target.value, 10) || 0)
                            const flavors = editing.flavors.map((x) => (x.id === f.id ? { ...x, stock: v } : x))
                            setEditing({ ...editing, flavors })
                          }}
                        />
                        <button
                          type="button" className="adm__mini"
                          onClick={() =>
                            setEditing({
                              ...editing,
                              flavors: editing.flavors.map((x) =>
                                x.id === f.id ? { ...x, stock: x.stock + 1 } : x,
                              ),
                            })
                          }
                        >
                          +
                        </button>
                        <button
                          type="button" className="adm__mini danger"
                          onClick={() =>
                            setEditing({
                              ...editing,
                              flavors: editing.flavors.filter((x) => x.id !== f.id),
                            })
                          }
                        >
                          ✕
                        </button>
                        <button
                          type="button"
                          className={`adm__mini ${f.hidden ? 'adm__flavor-eye--off' : ''}`}
                          title={f.hidden ? 'Oculto — clique para mostrar' : 'Visível — clique para ocultar'}
                          onClick={() => {
                            const flavors = editing.flavors.map((x) =>
                              x.id === f.id ? { ...x, hidden: !x.hidden } : x,
                            )
                            setEditing({ ...editing, flavors })
                          }}
                        >
                          {f.hidden ? (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                              <line x1="1" y1="1" x2="23" y2="23"/>
                            </svg>
                          ) : (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="adm__form-actions">
                {!creating && (
                  confirmDelete ? (
                    <div className="adm__confirm-inline">
                      <span>Excluir produto?</span>
                      <button
                        type="button" className="adm__confirm-yes"
                        onClick={async () => {
                          const ok = await removeProduct(editing.id)
                          setEditing(null)
                          showToast(ok ? 'Produto excluído.' : saveFeedback(false))
                        }}
                      >
                        Sim
                      </button>
                      <button type="button" className="adm__confirm-no" onClick={() => setConfirmDelete(false)}>
                        Não
                      </button>
                    </div>
                  ) : (
                    <button type="button" className="adm__danger" onClick={() => setConfirmDelete(true)}>
                      Excluir produto
                    </button>
                  )
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
