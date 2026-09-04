-- ═══════════════════════════════════════════════════════════════
-- FIX RÁPIDO - Cole e execute TUDO de uma vez (30 segundos)
-- ═══════════════════════════════════════════════════════════════

-- 1. Remover políticas antigas (se houver)
DROP POLICY IF EXISTS "Allow public read access" ON catalog;
DROP POLICY IF EXISTS "Allow authenticated users to manage catalog" ON catalog;
DROP POLICY IF EXISTS "Allow admin to manage catalog" ON catalog;
DROP POLICY IF EXISTS "Public can view catalog" ON catalog;
DROP POLICY IF EXISTS "Authenticated users can manage catalog" ON catalog;
DROP POLICY IF EXISTS "Public full access to catalog" ON catalog;
DROP POLICY IF EXISTS "Enable all access for all users" ON catalog;

-- 2. Criar política que permite TUDO para TODOS
CREATE POLICY "Enable all access for all users"
ON catalog
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- 3. Garantir que RLS está ativo
ALTER TABLE catalog ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════
-- PRONTO! Agora teste no admin do site
-- ═══════════════════════════════════════════════════════════════
