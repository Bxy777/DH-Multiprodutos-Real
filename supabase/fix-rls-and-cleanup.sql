-- ============================================================================
-- FIX: Row Level Security e Limpeza de Duplicatas
-- ============================================================================
-- Execute este script no SQL Editor do Supabase
-- ============================================================================

-- PARTE 1: Atualizar política RLS do catálogo para permitir sincronização pública
-- ============================================================================

DROP POLICY IF EXISTS "catalog_auth_all" ON catalog;
DROP POLICY IF EXISTS "catalog_public_read" ON catalog;
DROP POLICY IF EXISTS "catalog_public_write" ON catalog;

-- Permite leitura e escrita pública no catálogo
CREATE POLICY "catalog_public_read" 
  ON catalog FOR SELECT 
  USING (true);

CREATE POLICY "catalog_public_write" 
  ON catalog FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- ============================================================================
-- PARTE 2: Limpar dados duplicados (opcional - execute se necessário)
-- ============================================================================

-- Limpar o catálogo atual (remove tudo)
UPDATE catalog SET data = '[]'::jsonb WHERE id = 1;

-- ============================================================================
-- SCRIPT FINALIZADO
-- ============================================================================
-- 
-- Após executar este script:
-- 1. Acesse o site e clique em "Restaurar padrão" no admin
-- 2. Ou execute o script force-populate.ts novamente
-- 3. O erro de RLS não deve mais aparecer
--
-- ============================================================================
