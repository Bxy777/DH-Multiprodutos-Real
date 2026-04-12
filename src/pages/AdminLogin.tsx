import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAdminSession, loginAdmin } from '../auth/adminSession'
import './AdminLogin.css'

export function AdminLogin() {
  const nav = useNavigate()
  const [pw, setPw] = useState('')
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (isAdminSession()) nav('/admin', { replace: true })
  }, [nav])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    setErr(null)
    if (loginAdmin(pw.trim())) {
      nav('/admin', { replace: true })
    } else {
      setErr('Senha incorreta.')
    }
  }

  return (
    <div className="adm-login">
      <div className="adm-login__card">
        <h1 className="adm-login__title">Painel DH</h1>
        <p className="adm-login__sub">Acesso restrito</p>
        <form onSubmit={submit} className="adm-login__form">
          <label className="adm-login__field">
            Senha
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </label>
          {err && <p className="adm-login__err">{err}</p>}
          <button type="submit" className="adm-login__btn">
            Entrar
          </button>
        </form>
        <Link to="/" className="adm-login__back">
          ← Voltar à loja
        </Link>
      </div>
    </div>
  )
}
