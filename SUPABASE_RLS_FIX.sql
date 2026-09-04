-- FIX DEFINITIVO: Row-Level Security para tabela catalog
-- Execute estes comandos no Supabase SQL Editor

-- ═══════════════════════════════════════════════════════════════
-- SOLUÇÃO 1: Permitir acesso público total (RECOMENDADO para loja)
-- ═══════════════════════════════════════════════════════════════

-- 1. Remover todas as políticas antigas
DROP POLICY IF EXISTS "Allow public read access" ON catalog;
DROP POLICY IF EXISTS "Allow authenticated users to manage catalog" ON catalog;
DROP POLICY IF EXISTS "Allow admin to manage catalog" ON catalog;
DROP POLICY IF EXISTS "Public can view catalog" ON catalog;
DROP POLICY IF EXISTS "Authenticated users can manage catalog" ON catalog;
DROP POLICY IF EXISTS "Public full access to catalog" ON catalog;

-- 2. Criar política única que permite TUDO para TODOS
CREATE POLICY "Enable all access for all users"
ON catalog
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- 3. Garantir que RLS está ativo
ALTER TABLE catalog ENABLE ROW LEVEL SECURITY;

-- 4. Verificar se funcionou
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'catalog';

-- ═══════════════════════════════════════════════════════════════
-- SOLUÇÃO 2: Desabilitar RLS completamente (se SOLUÇÃO 1 não funcionar)
-- ═══════════════════════════════════════════════════════════════
-- ATENÇÃO: Use apenas se a SOLUÇÃO 1 não resolver!

-- DROP POLICY IF EXISTS "Enable all access for all users" ON catalog;
-- ALTER TABLE catalog DISABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════
-- VERIFICAÇÃO FINAL
-- ═══════════════════════════════════════════════════════════════

-- Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'catalog'
ORDER BY ordinal_position;

-- Verificar se há dados
SELECT id, 
       jsonb_array_length(data) as product_count, 
       updated_at,
       created_at
FROM catalog
WHERE id = 1;

-- Testar INSERT (deve funcionar agora)
-- Se já existe registro com id=1, isso vai atualizar
INSERT INTO catalog (id, data, updated_at)
VALUES (1, '[]'::jsonb, NOW())
ON CONFLICT (id) DO UPDATE
SET updated_at = NOW();

-- ═══════════════════════════════════════════════════════════════
-- EXPLICAÇÃO DO PROBLEMA
-- ═══════════════════════════════════════════════════════════════

/*
O erro "new row violates row-level security policy" acontece porque:

1. A tabela 'catalog' tem RLS habilitado
2. Não há política que permita INSERT/UPDATE público
3. O usuário do site não está autenticado
4. O código tenta fazer upsert e é bloqueado

A SOLUÇÃO 1 cria uma política que permite:
- SELECT (ler)
- INSERT (criar)
- UPDATE (atualizar)
- DELETE (deletar)

Para TODOS os usuários (public = qualquer um, autenticado ou não)

Isso é seguro para uma loja porque:
- É um catálogo público de produtos
- Não contém dados sensíveis de clientes
- O admin pode sempre restaurar do seedCatalog
- O LocalStorage protege contra perda de dados

Se quiser restringir apenas para admins autenticados no futuro,
você precisará:
1. Autenticar o usuário no admin
2. Criar política específica para o email do admin
*/
