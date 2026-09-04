-- ============================================================================
-- SCHEMA SQL COMPLETO PARA SUPABASE - DH MULTIPRODUTOS
-- ============================================================================
-- Execute este script no SQL Editor do Supabase para criar todas as tabelas
-- necessárias para o funcionamento do site.
-- ============================================================================

-- PARTE 1: CRIAR TABELAS
-- ============================================================================

-- Tabela de catálogo (produtos e sabores armazenados como JSON)
CREATE TABLE IF NOT EXISTS catalog (
  id integer PRIMARY KEY DEFAULT 1,
  data jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Inserir registro inicial se não existir
INSERT INTO catalog (id, data, updated_at)
VALUES (1, '[]'::jsonb, now())
ON CONFLICT (id) DO NOTHING;

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total numeric(10,2) NOT NULL DEFAULT 0,
  address text DEFAULT '',
  payment_method text NOT NULL DEFAULT 'pix',
  status text NOT NULL DEFAULT 'pending',
  customer_name text DEFAULT '',
  customer_phone text DEFAULT '',
  notes text DEFAULT ''
);

-- Tabela de configurações da loja
CREATE TABLE IF NOT EXISTS store_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tabela de log de auditoria
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  action text NOT NULL,
  admin_id uuid REFERENCES auth.users(id),
  entity_type text NOT NULL,
  entity_id text,
  previous_data jsonb,
  new_data jsonb,
  description text DEFAULT ''
);

-- ============================================================================
-- PARTE 2: TRIGGERS PARA UPDATED_AT
-- ============================================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para catalog
DROP TRIGGER IF EXISTS trg_catalog_updated_at ON catalog;
CREATE TRIGGER trg_catalog_updated_at 
  BEFORE UPDATE ON catalog
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at();

-- Trigger para store_config
DROP TRIGGER IF EXISTS trg_store_config_updated_at ON store_config;
CREATE TRIGGER trg_store_config_updated_at 
  BEFORE UPDATE ON store_config
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- PARTE 3: HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PARTE 4: POLÍTICAS DE SEGURANÇA (RLS POLICIES)
-- ============================================================================

-- CATALOG: Qualquer um pode ler e modificar (necessário para sync do catálogo)
DROP POLICY IF EXISTS "catalog_public_read" ON catalog;
CREATE POLICY "catalog_public_read" 
  ON catalog FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "catalog_public_write" ON catalog;
CREATE POLICY "catalog_public_write" 
  ON catalog FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- ORDERS: Qualquer um pode criar, apenas autenticados podem ler e atualizar
DROP POLICY IF EXISTS "orders_public_insert" ON orders;
CREATE POLICY "orders_public_insert" 
  ON orders FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "orders_auth_read" ON orders;
CREATE POLICY "orders_auth_read" 
  ON orders FOR SELECT 
  TO authenticated 
  USING (true);

DROP POLICY IF EXISTS "orders_auth_update" ON orders;
CREATE POLICY "orders_auth_update" 
  ON orders FOR UPDATE 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

DROP POLICY IF EXISTS "orders_auth_delete" ON orders;
CREATE POLICY "orders_auth_delete" 
  ON orders FOR DELETE 
  TO authenticated 
  USING (true);

-- STORE_CONFIG: Qualquer um pode ler, apenas autenticados podem modificar
DROP POLICY IF EXISTS "config_public_read" ON store_config;
CREATE POLICY "config_public_read" 
  ON store_config FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "config_auth_all" ON store_config;
CREATE POLICY "config_auth_all" 
  ON store_config FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- AUDIT_LOG: Apenas autenticados podem ver e criar
DROP POLICY IF EXISTS "audit_auth_all" ON audit_log;
CREATE POLICY "audit_auth_all" 
  ON audit_log FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- ============================================================================
-- PARTE 5: ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índices para melhorar a performance das consultas
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_id ON audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity_type ON audit_log(entity_type);
CREATE INDEX IF NOT EXISTS idx_store_config_key ON store_config(key);

-- ============================================================================
-- PARTE 6: CONFIGURAÇÕES INICIAIS
-- ============================================================================

-- Inserir configurações padrão da loja (se não existirem)
INSERT INTO store_config (key, value) VALUES
  ('store_name', 'DH Multiprodutos'),
  ('store_phone', '5538999845134'),
  ('delivery_free', 'true'),
  ('delivery_message', 'Entrega grátis na cidade'),
  ('payment_methods', '["pix","credito","debito","dinheiro"]'),
  ('store_open', 'true')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- PARTE 7: COMENTÁRIOS NAS TABELAS
-- ============================================================================

COMMENT ON TABLE catalog IS 'Armazena todo o catálogo de produtos em formato JSON';
COMMENT ON TABLE orders IS 'Armazena todos os pedidos realizados pelos clientes';
COMMENT ON TABLE store_config IS 'Configurações gerais da loja';
COMMENT ON TABLE audit_log IS 'Log de auditoria para rastrear ações administrativas';

COMMENT ON COLUMN catalog.data IS 'Array JSON com todos os produtos e sabores';
COMMENT ON COLUMN orders.items IS 'Array JSON com os itens do pedido';
COMMENT ON COLUMN orders.payment_method IS 'Forma de pagamento: pix, credito, debito, dinheiro';
COMMENT ON COLUMN orders.status IS 'Status do pedido: pending, processing, completed, cancelled';

-- ============================================================================
-- SCRIPT FINALIZADO COM SUCESSO
-- ============================================================================
-- 
-- PRÓXIMOS PASSOS:
-- 1. Execute este script no SQL Editor do Supabase
-- 2. Verifique se apareceu "Success. No rows returned" 
-- 3. Crie um usuário administrador em Authentication > Users
-- 4. Configure as variáveis de ambiente no projeto (Vercel/Netlify)
-- 5. Faça o deploy do site
--
-- ============================================================================