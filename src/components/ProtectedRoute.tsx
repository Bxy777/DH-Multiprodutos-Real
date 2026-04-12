import { useEffect, useState, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase, supabaseConfigured } from '../lib/supabase'
import { isAdminSession } from '../auth/adminSession'

interface Props {
  children: ReactNode
}

/**
 * Protege rotas do admin.
 * - Se Supabase estiver configurado: valida sessão JWT via supabase.auth.getSession()
 * - Fallback: usa sessionStorage (comportamento legado enquanto Supabase não está configurado)
 */
export function ProtectedRoute({ children }: Props) {
  const [status, setStatus] = useState<'loading' | 'ok' | 'denied'>('loading')

  useEffect(() => {
    if (!supabaseConfigured || !supabase) {
      // fallback legado
      setStatus(isAdminSession() ? 'ok' : 'denied')
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setStatus(data.session ? 'ok' : 'denied')
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setStatus(session ? 'ok' : 'denied')
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  if (status === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', color: '#fff' }}>
        Verificando acesso…
      </div>
    )
  }

  if (status === 'denied') {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}
