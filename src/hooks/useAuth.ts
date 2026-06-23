import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { isAdminSession } from '../auth/adminSession'
import { useSupabase } from '../context/SupabaseContext'

type AuthState = 'loading' | 'authenticated' | 'unauthenticated'

function isAuthenticated(session: Session | null): boolean {
  return isAdminSession() || Boolean(session)
}

export function useAuth() {
  const { supabase, configured, loading: supabaseLoading } = useSupabase()
  const [state, setState] = useState<AuthState>('loading')
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    if (supabaseLoading) return

    if (!configured || !supabase) {
      setState(isAdminSession() ? 'authenticated' : 'unauthenticated')
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setState(isAuthenticated(data.session) ? 'authenticated' : 'unauthenticated')
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setState(isAuthenticated(newSession) ? 'authenticated' : 'unauthenticated')
    })

    return () => listener.subscription.unsubscribe()
  }, [supabaseLoading, configured, supabase])

  const signIn = async (email: string, password: string): Promise<string | null> => {
    if (!configured || !supabase) return 'Supabase não configurado.'
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return 'E-mail ou senha incorretos.'
    return null
  }

  const signOut = async () => {
    if (configured && supabase) {
      await supabase.auth.signOut()
    }
  }

  return { state, session, signIn, signOut }
}
