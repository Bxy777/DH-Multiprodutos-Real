import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export type SupabaseRuntimeConfig = {
  url: string
  anonKey: string
}

export function validateSupabaseConfig(url?: string, anonKey?: string): boolean {
  const u = url?.trim()
  const k = anonKey?.trim()
  return Boolean(
    u &&
    u.startsWith('https://') &&
    u.includes('.supabase.co') &&
    k &&
    k.startsWith('eyJ') &&
    k.length > 100,
  )
}

export function createSupabaseClient(url: string, anonKey: string): SupabaseClient {
  return createClient(url.trim(), anonKey.trim())
}

export function formatSupabaseError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err)
  if (/failed to fetch|networkerror|load failed/i.test(msg)) {
    return 'Não foi possível conectar ao Supabase. Confira a URL do projeto e se ele está ativo em supabase.com.'
  }
  return msg
}

export async function loadSupabaseConfig(): Promise<SupabaseRuntimeConfig | null> {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim()
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim()

  if (validateSupabaseConfig(envUrl, envKey)) {
    return { url: envUrl!, anonKey: envKey! }
  }

  try {
    const res = await fetch('/config.json', { cache: 'no-store' })
    if (!res.ok) return null
    const data = (await res.json()) as Record<string, string>
    const url = (data.url ?? data.VITE_SUPABASE_URL ?? '').trim()
    const anonKey = (data.anonKey ?? data.VITE_SUPABASE_ANON_KEY ?? '').trim()
    if (validateSupabaseConfig(url, anonKey)) return { url, anonKey }
  } catch {
    /* config.json opcional */
  }

  return null
}
