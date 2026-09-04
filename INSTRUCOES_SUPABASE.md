# 📋 Instruções para Configurar Supabase

## 🎯 PASSO A PASSO COMPLETO

### 1️⃣ Criar Conta e Projeto no Supabase

1. Acesse: **https://supabase.com**
2. Clique em **"Start your project"** ou **"Sign Up"**
3. Faça login com GitHub (recomendado) ou e-mail
4. Clique em **"New project"** (canto superior direito)
5. Preencha:
   - **Name**: `dh-multiprodutos`
   - **Database Password**: Clique em "Generate" e **SALVE ESSA SENHA**
   - **Region**: **South America (São Paulo)** - mais rápido para Brasil
6. Clique em **"Create new project"**
7. Aguarde 2-3 minutos até o projeto ficar pronto

---

### 2️⃣ Executar o Schema SQL

1. No menu lateral esquerdo, procure o ícone 💾 e clique em **"SQL Editor"**
2. Clique no botão **"+ New query"** (canto superior esquerdo)
3. Abra o arquivo `supabase/schema.sql` deste projeto
4. **COPIE TODO O CONTEÚDO** do arquivo
5. **COLE** na área de edição do SQL Editor do Supabase
6. Clique no botão **"Run"** (canto inferior direito) ou pressione **Ctrl + Enter**
7. Deve aparecer: ✅ **"Success. No rows returned"** - Isso significa que funcionou!

#### ⚠️ Se aparecer algum erro:

**Erro: "relation already exists"**
- Isso é normal se você já executou o script antes
- O script está preparado para não dar erro em execuções repetidas
- Pode ignorar essa mensagem

**Erro: "permission denied"**
- Verifique se você está logado como owner do projeto
- Certifique-se de estar no projeto correto

---

### 3️⃣ Verificar se as Tabelas Foram Criadas

1. No menu lateral esquerdo, clique no ícone 📊 **"Table Editor"**
2. Você deve ver as seguintes tabelas:
   - ✅ `catalog` - Armazena produtos e sabores
   - ✅ `orders` - Armazena pedidos
   - ✅ `store_config` - Configurações da loja
   - ✅ `audit_log` - Log de ações administrativas

3. Clique na tabela `catalog` - deve ter 1 registro com `data: []`
4. Clique na tabela `store_config` - deve ter 6 registros de configuração

---

### 4️⃣ Criar Usuário Administrador

1. No menu lateral esquerdo, clique no ícone 👤 **"Authentication"**
2. Clique em **"Users"** no submenu
3. Clique no botão **"Add user"** (canto superior direito)
4. Selecione **"Create new user"**
5. Preencha:
   - **Email**: Seu e-mail de administrador (ex: `admin@dhmultiprodutos.com`)
   - **Password**: Crie uma senha forte (mínimo 8 caracteres)
   - **Auto Confirm User**: Marque essa opção ✅
6. Clique em **"Create user"**

**⚠️ IMPORTANTE**: Guarde esse e-mail e senha - são as credenciais para acessar o painel administrativo do site!

---

### 5️⃣ Obter as Chaves do Projeto

1. No menu lateral esquerdo, clique no ícone ⚙️ **"Project Settings"**
2. No submenu, clique em **"API"**
3. Você vai ver duas informações importantes:

#### 📌 Project URL
Está na seção **"Project URL"** no topo:
```
https://xxxxxxxxx.supabase.co
```
**Copie e guarde** - isso vai no `VITE_SUPABASE_URL`

#### 📌 Anon Key
Está na seção **"Project API keys"**, procure por **"anon" "public"**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJz...
```
**Copie e guarde** - isso vai no `VITE_SUPABASE_ANON_KEY`

> 💡 **Dica**: Use os botões de copiar 📋 ao lado de cada valor

---

### 6️⃣ Configurar Variáveis de Ambiente

#### No arquivo `.env` local (para desenvolvimento):

Crie/edite o arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://xxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Na Vercel (para produção):

1. Acesse o dashboard da Vercel
2. Selecione seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Adicione as variáveis:
   - `VITE_SUPABASE_URL` → Cole a URL do projeto
   - `VITE_SUPABASE_ANON_KEY` → Cole a chave anon

#### No Netlify (se usar):

1. Acesse o dashboard do Netlify
2. Selecione seu site
3. Vá em **Site settings** → **Environment variables**
4. Clique em **Add a variable** para cada uma:
   - `VITE_SUPABASE_URL` → Cole a URL do projeto
   - `VITE_SUPABASE_ANON_KEY` → Cole a chave anon

---

### 7️⃣ Testar a Conexão

1. Execute o projeto localmente:
   ```bash
   npm run dev
   ```

2. Abra o navegador em `http://localhost:5173`

3. Verifique:
   - ✅ Site carrega sem erros no console
   - ✅ Produtos aparecem na home (podem estar vazios no início)
   - ✅ Acesse `/admin/login` e teste login com o usuário criado

---

## 🔐 Segurança e Boas Práticas

### ✅ O que está configurado:

- **Row Level Security (RLS)** habilitado em todas as tabelas
- **Políticas de acesso** configuradas:
  - Público pode ler catálogo e criar pedidos
  - Apenas admins autenticados podem modificar dados
- **Índices** criados para melhor performance
- **Triggers** para atualizar timestamps automaticamente

### ⚠️ Nunca compartilhe:

- ❌ Database Password (senha gerada na criação do projeto)
- ❌ Service Role Key (chave de administrador)
- ❌ Credenciais do usuário administrador

### ✅ Pode compartilhar:

- ✅ Project URL
- ✅ Anon Key (chave pública)

---

## 📊 Estrutura das Tabelas

### `catalog`
Armazena todo o catálogo em um único registro JSON:
```json
{
  "id": 1,
  "data": [
    {
      "id": "produto-1",
      "brand": "Ignite",
      "name": "Ultra 5500puffs",
      "price": 99.90,
      "flavors": [...]
    }
  ]
}
```

### `orders`
Armazena cada pedido realizado:
```json
{
  "id": "uuid",
  "items": [...],
  "total": 199.80,
  "address": "Rua X, 123",
  "payment_method": "pix",
  "status": "pending"
}
```

### `store_config`
Configurações da loja:
```json
{
  "key": "store_name",
  "value": "DH Multiprodutos"
}
```

### `audit_log`
Log de ações administrativas:
```json
{
  "action": "product_update",
  "admin_id": "uuid",
  "entity_type": "product",
  "previous_data": {...},
  "new_data": {...}
}
```

---

## 🆘 Problemas Comuns

### Erro: "Invalid API key"
- Verifique se copiou a chave corretamente
- Certifique-se de usar a chave **anon**, não a service_role
- Reinicie o servidor após alterar variáveis de ambiente

### Erro: "Failed to fetch"
- Verifique se a URL do projeto está correta
- Certifique-se de que o projeto está ativo no Supabase
- Verifique sua conexão com internet

### Produtos não aparecem no site
- Verifique se a tabela `catalog` tem dados
- Abra o console do navegador (F12) e veja se há erros
- Verifique se as políticas RLS estão corretas

### Não consigo fazer login no admin
- Verifique se o usuário foi criado em Authentication > Users
- Certifique-se de que marcou "Auto Confirm User"
- Verifique se o e-mail e senha estão corretos
- Limpe o cache do navegador (Ctrl + Shift + Del)

---

## 📚 Recursos Úteis

- **Documentação Supabase**: https://supabase.com/docs
- **Supabase Status**: https://status.supabase.com
- **Community**: https://github.com/supabase/supabase/discussions

---

## ✅ Checklist Final

Antes de fazer deploy:

- [ ] Projeto criado no Supabase
- [ ] Schema SQL executado com sucesso
- [ ] Tabelas visíveis no Table Editor
- [ ] Usuário administrador criado
- [ ] Project URL copiado
- [ ] Anon Key copiado
- [ ] Variáveis de ambiente configuradas
- [ ] Teste local funcionando
- [ ] Login no admin funcionando

---

**Última atualização**: 3 de setembro de 2026
