-- FIX: Row-Level Security para tabela catalog
-- Execute estes comandos no Supabase SQL Editor

-- 1. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Allow public read access" ON catalog;
DROP POLICY IF EXISTS "Allow authenticated users to manage catalog" ON catalog;
DROP POLICY IF EXISTS "Allow admin to manage catalog" ON catalog;

-- 2. Permitir leitura pública (qualquer um pode ver o catálogo)
CREATE POLICY "Public can view catalog"
ON catalog FOR SELECT
TO public
USING (true);

-- 3. Permitir que usuários autenticados gerenciem o catálogo
-- (qualquer usuário autenticado pode inserir/atualizar/deletar)
CREATE POLICY "Authenticated users can manage catalog"
ON catalog FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Alternativa: Se quiser permitir acesso público total (inclusive escrita)
-- USE COM CUIDADO - permite que qualquer um edite o catálogo!
-- Descomente apenas se tiver certeza:

-- DROP POLICY IF EXISTS "Public can view catalog" ON catalog;
-- DROP POLICY IF EXISTS "Authenticated users can manage catalog" ON catalog;
-- 
-- CREATE POLICY "Public full access to catalog"
-- ON catalog FOR ALL
-- TO public
-- USING (true)
-- WITH CHECK (true);

-- 5. Verificar se RLS está habilitado
ALTER TABLE catalog ENABLE ROW LEVEL SECURITY;

-- 6. Verificar políticas atuais
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'catalog';
