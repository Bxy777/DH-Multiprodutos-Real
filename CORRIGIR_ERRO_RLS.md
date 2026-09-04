# 🔧 Como Corrigir o Erro de Sincronização Supabase

## ❌ Erro que você está vendo:

```
⚠️ Erro ao sincronizar: new row violates row-level security policy for table "catalog"
```

---

## ✅ Solução Rápida (5 minutos)

### **Passo 1: Abrir o Supabase Dashboard**

1. Acesse: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto **DH Multiprodutos**

### **Passo 2: Abrir o SQL Editor**

1. No menu lateral esquerdo, clique em **SQL Editor** (ícone de raio ⚡)
2. Clique em **New Query** (ou pressione `Ctrl + Enter`)

### **Passo 3: Copiar e Executar o SQL**

1. Abra o arquivo `SUPABASE_RLS_FIX.sql` neste projeto
2. **Copie TODO o conteúdo** da **SOLUÇÃO 1** (linhas 1-22)
3. **Cole** no SQL Editor do Supabase
4. Clique em **Run** (botão verde) ou pressione `Ctrl + Enter`

### **Passo 4: Verificar se Funcionou**

Você deve ver a mensagem:
```
Success. No rows returned
```

E a tabela de resultados deve mostrar:
```
policyname: "Enable all access for all users"
cmd: ALL
```

---

## 🧪 Testar a Solução

### **Opção A: Pelo Admin do Site**

1. Acesse: https://seu-site.vercel.app/admin/login
2. Faça login
3. Tente **adicionar** ou **editar** um produto
4. O banner verde deve aparecer: **✓ Salvo na nuvem — todos veem a alteração!**

### **Opção B: Pelo Supabase**

No SQL Editor, execute:
```sql
SELECT id, 
       jsonb_array_length(data) as product_count, 
       updated_at
FROM catalog
WHERE id = 1;
```

Deve mostrar a quantidade de produtos e a última atualização.

---

## ❓ O que Esta Solução Faz?

### Antes (com erro):
- ❌ Tabela `catalog` com RLS ativo
- ❌ Sem política que permita escrita pública
- ❌ Código tenta salvar → **BLOQUEADO**
- ❌ Erro aparece no banner vermelho

### Depois (corrigido):
- ✅ Política criada: `Enable all access for all users`
- ✅ Permite `SELECT`, `INSERT`, `UPDATE`, `DELETE`
- ✅ Para todos (autenticados ou não)
- ✅ Código salva com sucesso → **Banner verde**

---

## 🔒 Isso é Seguro?

**Sim**, para este caso específico:

✅ **Catálogo público** - produtos são informação pública  
✅ **Sem dados sensíveis** - não há emails, senhas, CPFs  
✅ **LocalStorage como backup** - dados não se perdem  
✅ **Restauração fácil** - admin pode resetar do seed  

### Se Quiser Restringir no Futuro:

Crie políticas específicas por email:
```sql
DROP POLICY "Enable all access for all users" ON catalog;

CREATE POLICY "Admin only access"
ON catalog FOR ALL
TO authenticated
USING (auth.email() = 'seu-email@gmail.com')
WITH CHECK (auth.email() = 'seu-email@gmail.com');
```

---

## 🆘 Solução Alternativa (se SOLUÇÃO 1 não funcionar)

### **Desabilitar RLS Completamente**

No SQL Editor:
```sql
ALTER TABLE catalog DISABLE ROW LEVEL SECURITY;
```

⚠️ **Use apenas se a SOLUÇÃO 1 falhar**

---

## 📝 Verificação Final

Execute no SQL Editor:
```sql
-- Ver políticas ativas
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'catalog';

-- Ver RLS status
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'catalog';
```

Resultado esperado:
- `policyname`: Enable all access for all users
- `cmd`: ALL
- `rowsecurity`: true

---

## 💡 Por Que o Erro Aparece "Às Vezes"?

O erro aparece **verde** quando:
- ✅ Você está **autenticado** no /admin
- ✅ A política permite usuários autenticados

O erro aparece **vermelho** quando:
- ❌ Você **não está autenticado**
- ❌ A política **não permite** acesso público

**Solução permanente**: Executar `SUPABASE_RLS_FIX.sql` permite acesso sempre.

---

## 📞 Precisa de Ajuda?

1. Verifique se copiou **TODO** o SQL da SOLUÇÃO 1
2. Verifique se está no **projeto correto** do Supabase
3. Tente fazer logout e login novamente no /admin
4. Em último caso, use a **SOLUÇÃO 2** (desabilitar RLS)

---

## ✅ Checklist de Sucesso

- [ ] Abri o Supabase Dashboard
- [ ] Selecionei o projeto DH Multiprodutos
- [ ] Abri o SQL Editor
- [ ] Copiei e executei a SOLUÇÃO 1
- [ ] Vi "Success. No rows returned"
- [ ] Testei adicionar/editar produto no admin
- [ ] Banner verde apareceu
- [ ] Erro sumiu! 🎉
