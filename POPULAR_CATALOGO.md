# 🚀 Como Popular o Catálogo no Supabase

## ⚠️ PROBLEMA
Os produtos novos (Luma 20k, Waka 25k/46k, etc.) não aparecem no site porque o catálogo no Supabase está vazio ou desatualizado.

## ✅ SOLUÇÃO RÁPIDA (Recomendada)

### Via Painel Admin:

1. **Execute o projeto localmente:**
   ```bash
   npm run dev
   ```

2. **Acesse o painel admin:**
   ```
   http://localhost:5173/admin/login
   ```

3. **Faça login** com as credenciais que você criou no Supabase

4. **Procure o botão "Resetar Catálogo"** ou "Restaurar Catálogo Padrão"

5. **Clique nele** - isso vai enviar todos os 49 produtos para o Supabase

6. **Recarregue a página inicial** - os produtos devem aparecer

---

## 🔧 SOLUÇÃO VIA SCRIPT (Alternativa)

Se o método acima não funcionar, use o script:

```bash
npx tsx scripts/populate-supabase.ts
```

**O script vai pedir:**
- 📧 E-mail do admin (o que você criou no Supabase)
- 🔑 Senha do admin

**Depois vai:**
- ✅ Fazer login
- ✅ Enviar os 49 produtos
- ✅ Mostrar lista de produtos por marca

---

## 📋 PRODUTOS QUE SERÃO ADICIONADOS (49 total)

### Ignite (10 produtos)
- Ultra 5500puffs
- New Edition 8000puffs
- 12000puffs
- Ultra 15500puffs
- 25000puffs
- 30000puffs
- Mix 40000puffs
- Sweet 40000puffs
- Ice 40000puffs

### Elfbar (7 produtos)
- EW Kit 9000puffs
- BC 10000puffs
- BC 15000puffs
- EW Refil 16000puffs
- GH 23000puffs
- TE 30000puffs
- King 40000puffs
- BC 45000puffs

### Life Pod (8 produtos)
- Refil 8000puffs
- Kit 8000puffs
- Kit 10000puffs ✨ **NOVO/ATUALIZADO**
- Refil 10000puffs ✨ **NOVO/ATUALIZADO**
- Refil 13000puffs ✨ **NOVO**
- Kit 20000puffs ✨ **NOVO**
- SK 14ml ✨ **NOVO**
- 40000puffs ✨ **NOVO**
- Bateria 8000

### Waka (2 produtos)
- 25000puffs ✨ **NOVO**
- 46000puffs ✨ **NOVO**

### Lost Mary (3 produtos)
- MO 10000puffs
- Dura 35000puffs
- Turbo 20000puffs ✨ **NOVO**

### Luma (1 produto)
- 20000puffs ✨ **NOVO**

### Nikbar (4 produtos)
- 10000puffs
- 10000puffs v2 ✨ **NOVO**
- 30000puffs
- 40000puffs

### Black Sheep (2 produtos)
- 30000puffs (sabores atualizados)
- 40000puffs (sabores atualizados)

### Outros (12 produtos)
- Sex Addict 28000puffs
- Oxbar Kit 32000puffs
- Oxbar Refil 32000puffs
- Rabeats 50000puffs
- Mr Freeze 100ml ✨ **NOVO**
- Mr Freeze 100ml v2 ✨ **NOVO**
- Hero Salt 30ml
- Yogi Salt 30ml
- Masking 30ml ✨ **NOVO**

---

## 🔍 VERIFICAR SE FUNCIONOU

### No Navegador Local:
1. Acesse: `http://localhost:5173`
2. Procure por "Luma" ou "Waka" na busca
3. Verifique se aparece "Luma 20000puffs" e "Waka 25000puffs"

### No Supabase:
1. Acesse: https://supabase.com/dashboard
2. Vá em **Table Editor**
3. Clique na tabela **catalog**
4. Verifique se o campo `data` tem 49 produtos

### Na Vercel (Produção):
1. Acesse seu site na Vercel
2. Force reload: `Ctrl + Shift + R`
3. Procure pelos novos produtos

---

## ⚠️ PROBLEMAS COMUNS

### Erro: "row-level security policy"
- **Causa**: Você não está autenticado como admin
- **Solução**: Use o script ou faça login no painel admin primeiro

### Erro: "Invalid login credentials"
- **Causa**: E-mail ou senha incorretos
- **Solução**: 
  1. Vá no Supabase → Authentication → Users
  2. Verifique o e-mail do usuário
  3. Se necessário, resete a senha

### Produtos ainda não aparecem
- **Causa**: Cache do navegador ou servidor
- **Solução**:
  1. Pare o servidor (`Ctrl + C`)
  2. Limpe o cache do navegador (`Ctrl + Shift + Delete`)
  3. Reinicie o servidor (`npm run dev`)
  4. Force reload (`Ctrl + Shift + R`)

### Mensagem "Catálogo carregado localmente" ainda aparece
- **Causa**: Supabase não configurado ou offline
- **Solução**:
  1. Verifique o arquivo `.env`
  2. Confirme que as URLs estão corretas
  3. Teste a conexão: abra o console (F12) e veja se há erros

---

## 📝 DEPOIS DE POPULAR

1. ✅ Reinicie o servidor local
2. ✅ Teste todos os novos produtos
3. ✅ Faça commit das alterações
4. ✅ Push para o GitHub
5. ✅ A Vercel vai fazer deploy automático
6. ✅ Aguarde 1-2 minutos
7. ✅ Acesse o site em produção
8. ✅ Force reload para limpar cache

---

## 🎯 RESUMO

**Total de produtos no catálogo**: 49
**Produtos novos adicionados**: 14
**Total de sabores**: ~185

**Marcas com produtos novos:**
- ✨ Life Pod (6 novos/atualizados)
- ✨ Waka (2 novos)
- ✨ Lost Mary (1 novo)
- ✨ Luma (1 novo)
- ✨ Nikbar (1 novo)
- ✨ Mr Freeze (2 novos)
- ✨ Masking (1 novo)

---

**Última atualização**: 3 de setembro de 2026
