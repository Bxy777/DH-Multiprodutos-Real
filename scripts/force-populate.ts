/**
 * SCRIPT DE EMERGÊNCIA - Popular Supabase SEM autenticação
 * Coloque a SERVICE_ROLE_KEY do Supabase abaixo
 */

import { createClient } from '@supabase/supabase-js'
import { seedCatalog } from '../src/data/seedCatalog'

const SUPABASE_URL = 'https://pzsqnmvrndmgnprtmqra.supabase.co'

// ⚠️ SERVICE_ROLE_KEY (Settings → API → service_role)
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6c3FubXZybmRtZ25wcnRtcXJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzIxOTk3MywiZXhwIjoyMDkyNzk1OTczfQ.-NeoWUHVZ9eWeEZ19mPohkE6jDHZP5eNz6BnF25BigA'

async function forcePopulate() {
  console.log('🚀 Forçando população do catálogo...')
  
  if (SERVICE_ROLE_KEY === 'COLE_A_SERVICE_ROLE_KEY_AQUI') {
    console.error('❌ ERRO: Você precisa colar a SERVICE_ROLE_KEY no script!')
    console.error('📝 Vá em: Supabase Dashboard → Settings → API → Copie "service_role"')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  console.log(`📦 Enviando ${seedCatalog.length} produtos...`)

  try {
    // Tentar inserir/atualizar
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
      console.error('❌ Erro:', error.message)
      
      // Tentar com raw SQL como fallback
      console.log('🔄 Tentando método alternativo...')
      
      const { error: sqlError } = await supabase.rpc('exec_sql', {
        sql: `
          INSERT INTO catalog (id, data, updated_at)
          VALUES (1, '${JSON.stringify(seedCatalog)}'::jsonb, now())
          ON CONFLICT (id) DO UPDATE
          SET data = '${JSON.stringify(seedCatalog)}'::jsonb,
              updated_at = now();
        `
      })

      if (sqlError) {
        console.error('❌ Erro no SQL:', sqlError.message)
        process.exit(1)
      }
    }

    console.log('✅ SUCESSO! Catálogo populado!')
    console.log(`✅ ${seedCatalog.length} produtos no Supabase`)
    console.log('\n🎉 AGORA:')
    console.log('   1. Acesse seu site na Vercel')
    console.log('   2. Pressione Ctrl+Shift+R (force reload)')
    console.log('   3. A mensagem NÃO vai mais aparecer!')
    
    process.exit(0)

  } catch (err) {
    console.error('❌ Erro fatal:', err)
    process.exit(1)
  }
}

forcePopulate()
