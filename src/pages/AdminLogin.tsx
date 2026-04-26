import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabaseConfigured } from '../lib/supabase'
import { loginAdmin } from '../auth/adminSession'
import './AdminLogin.css'

export function AdminLogin() {
  const nav = useNavigate()
  const { state, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Redireciona se já autenticado
  useEffect(() => {
    if (state === 'authenticated') nav('/admin', { replace: true })
  }, [state, nav])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setErr(null)
    setLoading(true)
    try {
      if (supabaseConfigured) {
        // Autenticação via Supabase
        const error = await signIn(email.trim(), pw)
        if (error) setErr(error)
        // sucesso: useAuth detecta a sessão e redireciona via useEffect
      } else {
        // Fallback local
        if (loginAdmin(pw.trim())) {
          nav('/admin', { replace: true })
        } else {
          setErr('Senha incorreta.')
        }
      }
    } catch {
      setErr('Erro ao conectar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="adm-login">
      <div className="adm-login__card">
        <h1 className="adm-login__title">Painel DH</h1>
        <p className="adm-login__sub">Acesso restrito</p>
        <form onSubmit={submit} className="adm-login__form">
          {supabaseConfigured && (
            <label className="adm-login__field">
              E-mail
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="seuemail@exemplo.com"
                required
              />
            </label>
          )}
          <label className="adm-login__field">
            Senha
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
              required
            />
          </label>
          {err && <p className="adm-login__err" role="alert">{err}</p>}
          <button type="submit" className="adm-login__btn" disabled={loading || state === 'loading'}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
        <Link to="/" className="adm-login__back">
          ← Voltar à loja
        </Link>
      </div>
    </div>
  )
}
