import { createClient } from '@supabase/supabase-js'

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim()
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim()

const isValid = Boolean(
  url &&
  url.startsWith('https://') &&
  url.includes('.supabase.co') &&
  key &&
  key.startsWith('eyJ') &&
  key.length > 100,
)

export const supabase = isValid ? createClient(url!, key!) : null
export const supabaseConfigured = isValid

/** Mensagem amigável para erros de rede do Supabase */
export function formatSupabaseError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err)
  if (/failed to fetch|networkerror|load failed/i.test(msg)) {
    return 'Não foi possível conectar ao Supabase. Verifique se o projeto existe em supabase.com e se a URL em VITE_SUPABASE_URL está correta.'
  }
  return msg
}
