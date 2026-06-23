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

  useEffect(() => {
    if (state === 'authenticated') nav('/admin', { replace: true })
  }, [state, nav])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setErr(null)
    setLoading(true)
    try {
      if (email.trim() && supabaseConfigured) {
        const error = await signIn(email.trim(), pw)
        if (error) setErr(error)
        else return
      }

      if (loginAdmin(pw.trim())) {
        nav('/admin', { replace: true })
      } else {
        setErr(email.trim() ? 'E-mail ou senha incorretos.' : 'Senha incorreta.')
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
        <p className="adm-login__sub">Senha do painel ou e-mail + senha Supabase</p>
        <form onSubmit={submit} className="adm-login__form">
          <label className="adm-login__field">
            E-mail <span className="adm-login__optional">(opcional)</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              placeholder="seuemail@exemplo.com"
              disabled={loading}
            />
          </label>
          <label className="adm-login__field">
            Senha
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
              required
              disabled={loading}
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
