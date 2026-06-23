import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createSupabaseClient, loadSupabaseConfig } from '../lib/supabase'

type SupabaseContextValue = {
  supabase: SupabaseClient | null
  configured: boolean
  loading: boolean
}

const SupabaseContext = createContext<SupabaseContextValue | null>(null)

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null)
  const [configured, setConfigured] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    loadSupabaseConfig()
      .then((cfg) => {
        if (!active) return
        if (cfg) {
          setSupabase(createSupabaseClient(cfg.url, cfg.anonKey))
          setConfigured(true)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const value = useMemo(
    () => ({ supabase, configured, loading }),
    [supabase, configured, loading],
  )

  return <SupabaseContext.Provider value={value}>{children}</SupabaseContext.Provider>
}

export function useSupabase() {
  const ctx = useContext(SupabaseContext)
  if (!ctx) throw new Error('useSupabase outside SupabaseProvider')
  return ctx
}
