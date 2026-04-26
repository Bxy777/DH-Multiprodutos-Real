import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase, supabaseConfigured } from '../lib/supabase'
import { isAdminSession } from '../auth/adminSession'

type AuthState = 'loading' | 'authenticated' | 'unauthenticated'

export function useAuth() {
  const [state, setState] = useState<AuthState>('loading')
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    // Fallback: sem Supabase, usa sessionStorage
    if (!supabaseConfigured || !supabase) {
      setState(isAdminSession() ? 'authenticated' : 'unauthenticated')
      return
    }

    // Verifica sessão existente
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setState(data.session ? 'authenticated' : 'unauthenticated')
    })

    // Escuta mudanças de sessão (login/logout/refresh)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setState(newSession ? 'authenticated' : 'unauthenticated')
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string): Promise<string | null> => {
    if (!supabaseConfigured || !supabase) return 'Supabase não configurado.'
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return 'E-mail ou senha incorretos.'
    return null
  }

  const signOut = async () => {
    if (supabaseConfigured && supabase) {
      await supabase.auth.signOut()
    }
  }

  return { state, session, signIn, signOut }
}
