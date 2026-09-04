# Correção do Erro de RLS e Produtos Duplicados

## Problema 1: Erro "new row violates row-level security policy"

### Solução:

1. Acesse o **Supabase Dashboard**: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral esquerdo)
4. Cole e execute o seguinte SQL:

```sql
-- Remover políticas antigas
DROP POLICY IF EXISTS "catalog_auth_all" ON catalog;
DROP POLICY IF EXISTS "catalog_public_read" ON catalog;
DROP POLICY IF EXISTS "catalog_public_write" ON catalog;

-- Criar nova política que permite acesso público total
CREATE POLICY "catalog_public_read" 
  ON catalog FOR SELECT 
  USING (true);

CREATE POLICY "catalog_public_write" 
  ON catalog FOR ALL 
  USING (true) 
  WITH CHECK (true);
```

5. Clique em **Run** (ou pressione Ctrl+Enter)
6. Aguarde a mensagem "Success. No rows returned"

---

## Problema 2: Produtos Duplicados

### Solução:

Após corrigir o RLS, limpe os produtos duplicados:

1. No mesmo **SQL Editor**, execute:

```sql
-- Limpar todo o catálogo
UPDATE catalog SET data = '[]'::jsonb WHERE id = 1;
```

2. Agora recarregue o catálogo limpo. Você tem 2 opções:

### Opção A: Via Interface do Site (Recomendado)
1. Acesse http://localhost:5173/admin (ou sua URL de produção)
2. Clique no botão **"Restaurar padrão"**
3. Aguarde a mensagem de sucesso
4. Verifique se os produtos apareceram sem duplicatas

### Opção B: Via Script (Se a Opção A não funcionar)
1. Abra o terminal no diretório do projeto
2. Execute:
```bash
npx tsx scripts/force-populate.ts
```
3. Aguarde a confirmação "✅ Catálogo sincronizado"

---

## Verificação

1. Acesse a home page do site
2. Verifique se:
   - ✅ Não aparece mais o erro de RLS
   - ✅ Os produtos não estão duplicados
   - ✅ Todos os 49 produtos aparecem corretamente

---

## Se o erro persistir

Execute este SQL para desabilitar RLS completamente (temporariamente):

```sql
ALTER TABLE catalog DISABLE ROW LEVEL SECURITY;
```

⚠️ **IMPORTANTE**: Isso remove a segurança da tabela. Use apenas para debug!

Para reativar depois:

```sql
ALTER TABLE catalog ENABLE ROW LEVEL SECURITY;
```

---

## Arquivo SQL Completo

Ou execute o arquivo completo: `supabase/fix-rls-and-cleanup.sql`
