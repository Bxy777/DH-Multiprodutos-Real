/**
 * Script para popular o catálogo no Supabase
 * 
 * COMO USAR:
 * 1. Execute: npx tsx scripts/populate-supabase.ts
 * 2. Digite o e-mail do admin quando solicitado
 * 3. Digite a senha do admin quando solicitado
 */

import { createClient } from '@supabase/supabase-js'
import { seedCatalog } from '../src/data/seedCatalog'
import * as readline from 'readline'

// Suas credenciais do Supabase
const SUPABASE_URL = 'https://pzsqnmvrndmgnprtmqra.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6c3FubXZybmRtZ25wcnRtcXJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTk5NzMsImV4cCI6MjA5Mjc5NTk3M30.bb5Ptdt4TT32GzAeuHeIYyzPOZTY_w14msu3atuRbhc'

function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise(resolve => rl.question(query, ans => {
    rl.close()
    resolve(ans)
  }))
}

async function populateSupabase() {
  console.log('🚀 Conectando ao Supabase...')
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  // Solicitar credenciais do admin
  console.log('\n🔐 Para popular o catálogo, você precisa fazer login como admin.')
  const email = await askQuestion('📧 E-mail do admin: ')
  const password = await askQuestion('🔑 Senha do admin: ')

  console.log('\n🔓 Autenticando...')

  // Fazer login
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: password.trim(),
  })

  if (authError || !authData.user) {
    console.error('❌ Erro ao fazer login:', authError?.message || 'Credenciais inválidas')
    console.error('💡 Verifique se você criou um usuário admin no Supabase (Authentication > Users)')
    process.exit(1)
  }

  console.log('✅ Login realizado com sucesso!')
  console.log(`📦 Enviando ${seedCatalog.length} produtos para o Supabase...`)

  try {
    const { error } = await supabase
      .from('catalog')
      .upsert(
        { 
          id: 1, 
          data: seedCatalog,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      )

    if (error) {
      console.error('❌ Erro ao popular catálogo:', error.message)
      console.error('💡 Verifique se as políticas RLS estão configuradas corretamente')
      process.exit(1)
    }

    console.log('\n✅ Catálogo populado com sucesso!')
    console.log(`✅ ${seedCatalog.length} produtos enviados ao Supabase`)
    console.log('\n📋 Produtos incluídos:')
    
    // Listar produtos adicionados
    const brands = new Set(seedCatalog.map(p => p.brand))
    brands.forEach(brand => {
      const count = seedCatalog.filter(p => p.brand === brand).length
      console.log(`   - ${brand}: ${count} produtos`)
    })

    console.log('\n🎉 Pronto! Agora:')
    console.log('   1. Reinicie o servidor (npm run dev)')
    console.log('   2. Acesse http://localhost:5173')
    console.log('   3. Veja todos os produtos, incluindo Luma 20k, Waka 25k/46k, etc.')
    
    // Fazer logout
    await supabase.auth.signOut()
    process.exit(0)

  } catch (err) {
    console.error('❌ Erro inesperado:', err)
    process.exit(1)
  }
}

populateSupabase()
