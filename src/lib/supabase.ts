import { createClient } from '@supabase/supabase-js'

/** Projeto Supabase DH — chave anon é pública (proteção via RLS no banco) */
const DEFAULT_SUPABASE_URL = 'https://dceiwmvdhswphfpyhrgd.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZWl3bXZkaHN3cGhmcHlocmdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMDM5NTQsImV4cCI6MjA5MTU3OTk1NH0.C1Ljllc2Hz5VBO1ImynC91n-D-1JDQDtwu1vDs8OXxk'

const url = (import.meta.env.VITE_SUPABASE_URL ?? DEFAULT_SUPABASE_URL).trim()
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? DEFAULT_SUPABASE_ANON_KEY).trim()

const isValid = Boolean(
  url.startsWith('https://') &&
  url.includes('.supabase.co') &&
  key.startsWith('eyJ') &&
  key.length > 100,
)

export const supabase = isValid ? createClient(url, key) : null
export const supabaseConfigured = isValid
