# Guia Completo de Deploy — DH Multiprodutos

Siga na ordem: Supabase → Upstash → Sentry → GitHub → Netlify.
No final você terá o site no ar com tudo funcionando.

---

## PARTE 1 — Supabase (banco de dados + login do admin)

### Passo 1 — Criar conta

1. Abra o navegador e acesse: **https://supabase.com**
2. Clique no botão verde **"Start your project"** (centro da tela)
3. Clique em **"Continue with GitHub"** — é a forma mais fácil
4. Se não tiver GitHub, clique em **"Sign up"** e crie com e-mail
5. Autorize o Supabase a acessar sua conta GitHub quando pedir

---

### Passo 2 — Criar o projeto

1. Após o login, você cai no painel do Supabase
2. Clique no botão **"New project"** (canto superior direito ou centro da tela)
3. Se pedir para criar uma organização primeiro, coloque seu nome e clique em **"Create organization"**
4. Preencha o formulário do projeto:
   - **Name**: `dh-multiprodutos`
   - **Database Password**: clique em **"Generate a password"** — copie e salve essa senha em algum lugar seguro (bloco de notas, etc.)
   - **Region**: selecione **"South America (São Paulo)"** — mais rápido para seus clientes
5. Clique em **"Create new project"**
6. Aguarde aparecer uma barra de progresso — leva cerca de 2 minutos

---

### Passo 3 — Criar as tabelas (SQL)

1. No menu lateral esquerdo, procure o ícone que parece um banco de dados — passe o mouse e vai aparecer **"SQL Editor"**
2. Clique em **"SQL Editor"**
3. Clique em **"New query"** (botão no canto superior esquerdo da área de SQL)
4. Apague qualquer texto que aparecer na área de digitação
5. Cole TODO o código abaixo:

```sql
-- Tabela de produtos
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand text NOT NULL,
  product_kind text NOT NULL DEFAULT 'POD',
  name text NOT NULL,
  puffs text NOT NULL,
  nicotine text NOT NULL DEFAULT '50mg',
  short_description text DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  compare_at numeric(10,2),
  image text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tabela de sabores
CREATE TABLE flavors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tabela de pedidos
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  items jsonb NOT NULL DEFAULT '[]',
  total numeric(10,2) NOT NULL DEFAULT 0,
  address text DEFAULT '',
  payment_method text NOT NULL DEFAULT 'pix',
  status text NOT NULL DEFAULT 'pending'
);

-- Configurações da loja
CREATE TABLE store_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Log de auditoria
CREATE TABLE audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  action text NOT NULL,
  admin_id uuid REFERENCES auth.users(id),
  entity_type text NOT NULL,
  entity_id uuid,
  previous_data jsonb,
  new_data jsonb
);

-- Atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_flavors_updated_at BEFORE UPDATE ON flavors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_store_config_updated_at BEFORE UPDATE ON store_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

6. Clique no botão **"Run"** (canto inferior direito da área de SQL) — ou pressione **Ctrl + Enter**
7. Deve aparecer a mensagem **"Success. No rows returned"** — isso é correto, significa que funcionou

---

### Passo 4 — Configurar segurança (RLS)

1. Ainda no **SQL Editor**, clique em **"New query"** novamente
2. Cole TODO o código abaixo:

```sql
-- Ativar segurança em todas as tabelas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE flavors ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Produtos: qualquer um pode ver, só admin pode editar
CREATE POLICY "products_public_read" ON products FOR SELECT USING (active = true);
CREATE POLICY "products_auth_all" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Sabores: qualquer um pode ver, só admin pode editar
CREATE POLICY "flavors_public_read" ON flavors FOR SELECT USING (true);
CREATE POLICY "flavors_auth_all" ON flavors FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Pedidos: qualquer um pode criar, só admin pode ver e atualizar
CREATE POLICY "orders_public_insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_auth_read" ON orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "orders_auth_update" ON orders FOR UPDATE TO authenticated USING (true);

-- Configurações: qualquer um pode ver, só admin pode editar
CREATE POLICY "config_public_read" ON store_config FOR SELECT USING (true);
CREATE POLICY "config_auth_all" ON store_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Log de auditoria: só admin pode ver e criar
CREATE POLICY "audit_auth_all" ON audit_log FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

3. Clique em **"Run"** novamente
4. Deve aparecer **"Success. No rows returned"** — funcionou

---

### Passo 5 — Criar o usuário administrador (seu login do painel)

1. No menu lateral esquerdo, clique no ícone de pessoa — vai aparecer **"Authentication"**
2. Clique em **"Authentication"**
3. No menu que abrir, clique em **"Users"**
4. Clique no botão **"Add user"** (canto superior direito)
5. Clique em **"Create new user"**
6. Preencha:
   - **Email**: seu e-mail (ex: `seuemail@gmail.com`)
   - **Password**: crie uma senha forte (mínimo 8 caracteres, com letras e números)
7. Clique em **"Create user"**
8. **IMPORTANTE**: guarde esse e-mail e senha — são as credenciais para acessar o Painel DH

---

### Passo 6 — Pegar as chaves do projeto

1. No menu lateral esquerdo, clique no ícone de engrenagem — vai aparecer **"Project Settings"**
2. Clique em **"Project Settings"**
3. No submenu que abrir, clique em **"API"**
4. Você vai ver duas informações importantes — copie e salve as duas:

   **Project URL** — parece com isso:
   ```
   https://dceiwmvdhswphfpyhrgd.supabase.co
   ```
   Esse valor vai no `VITE_SUPABASE_URL`

   **anon public** (está na seção "Project API keys") — uma chave longa começando com `eyJ`:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZWl3bXZkaHN3cGhmcHlocmdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMDM5NTQsImV4cCI6MjA5MTU3OTk1NH0.C1Ljllc2Hz5VBO1ImynC91n-D-1JDQDtwu1vDs8OXxk
   ```
   Esse valor vai no `VITE_SUPABASE_ANON_KEY`

---

## PARTE 2 — Upstash (proteção contra tentativas de login)

### Passo 1 — Criar conta

1. Abra: **https://upstash.com**
2. Clique em **"Sign Up"** (canto superior direito)
3. Clique em **"Continue with GitHub"** — mais fácil
4. Autorize quando pedir

---

### Passo 2 — Criar o banco Redis

1. Após o login, você cai no painel do Upstash
2. Clique em **"Create Database"** (botão no centro ou canto superior direito)
3. Preencha:
   - **Name**: `dh-ratelimit`
   - **Type**: deixe em **"Regional"**
   - **Region**: selecione **"South America (São Paulo)"** ou a mais próxima disponível
   - **TLS**: deixe ativado (já vem ativado)
4. Clique em **"Create"**
5. Aguarde alguns segundos

---

### Passo 3 — Pegar as credenciais

1. Após criar, você cai na página do banco
2. Clique na aba **"REST API"** (está no meio da página, entre as abas)
3. Você vai ver duas informações — copie e salve:

   **UPSTASH_REDIS_REST_URL** — parece com isso:
   ```
   "https://easy-baboon-97182.upstash.io"
   ```
   Esse valor vai no `VITE_UPSTASH_REDIS_REST_URL`

   **UPSTASH_REDIS_REST_TOKEN** — uma chave longa:
   ```
   "gQAAAAAAAXueAAIncDI3YzgxMWZmMDQ0OTg0ZDc5OGU1OTlkYTljZDhmNTNhM3AyOTcxODI"
   ```
   Esse valor vai no `VITE_UPSTASH_REDIS_REST_TOKEN`

   > Dica: tem um botão de copiar ao lado de cada valor — use ele para não errar

---

## PARTE 3 — Sentry (monitoramento de erros)

### Passo 1 — Criar conta

1. Abra: **https://sentry.io**
2. Clique em **"Get Started"** (centro da tela) ou **"Sign Up"** (canto superior direito)
3. Clique em **"Continue with GitHub"**
4. Autorize quando pedir
5. Vai pedir para escolher um nome de organização — coloque `dh-multiprodutos` e clique em **"Create"**

---

### Passo 2 — Criar o projeto

1. Após o login, clique em **"Create Project"** (pode aparecer automaticamente ou no menu lateral em **"Projects"**)
2. Na lista de plataformas, procure e clique em **"React"**
3. Em **"Set your alert frequency"**, deixe a opção padrão
4. Em **"Project name"**, coloque: `dh-multiprodutos`
5. Clique em **"Create Project"**

---

### Passo 3 — Pegar o DSN

1. Após criar o projeto, o Sentry mostra uma tela de configuração com um código
2. Procure a linha que contém `dsn:` — o valor parece com isso:
   ```
   https://abc123def456@o000000.ingest.sentry.io/0000000
   ```
3. Copie esse valor — vai no `VITE_SENTRY_DSN`

   > Se fechar essa tela sem copiar: vá em **Settings** (menu lateral) → **Projects** → clique no seu projeto → **Client Keys (DSN)** → copie o valor em **DSN**

---

## PARTE 4 — GitHub (subir o código)

Antes de ir ao Netlify, o código precisa estar no GitHub.

### Passo 1 — Criar conta no GitHub (se não tiver)

1. Abra: **https://github.com**
2. Clique em **"Sign up"** e siga os passos

---

### Passo 2 — Criar o repositório

1. Após o login no GitHub, clique no **"+"** (canto superior direito) → **"New repository"**
2. Preencha:
   - **Repository name**: `dh-multiprodutos`
   - **Visibility**: deixe em **"Private"** (mais seguro)
3. Clique em **"Create repository"**
4. O GitHub vai mostrar uma tela com comandos — deixe essa aba aberta

---

### Passo 3 — Subir o código pelo terminal

1. Abra o terminal na pasta do projeto (no Kiro: clique com botão direito na pasta → "Open in Terminal", ou use o terminal integrado)
2. Execute os comandos abaixo um por um:

```bash
git init
git add .
git commit -m "primeiro commit"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/dh-multiprodutos.git
git push -u origin main
```

> Substitua `SEU_USUARIO` pelo seu nome de usuário do GitHub

3. O GitHub vai pedir seu usuário e senha — use o e-mail e senha do GitHub
   > Se pedir "token" em vez de senha: vá em GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token → marque "repo" → copie e use como senha

---

## PARTE 5 — Netlify (colocar o site no ar)

### Passo 1 — Criar conta

1. Abra: **https://netlify.com**
2. Clique em **"Sign up"** (canto superior direito)
3. Clique em **"Continue with GitHub"** — obrigatório para conectar o repositório
4. Autorize quando pedir

---

### Passo 2 — Conectar o repositório

1. Após o login, você cai no painel do Netlify
2. Clique em **"Add new site"** (botão no centro ou canto superior direito)
3. Clique em **"Import an existing project"**
4. Clique em **"Deploy with GitHub"**
5. Clique em **"Authorize Netlify"** quando pedir
6. Na lista de repositórios, procure e clique em **"dh-multiprodutos"**
   > Se não aparecer: clique em "Configure the Netlify app on GitHub" e autorize o acesso ao repositório

---

### Passo 3 — Configurar o build

Na tela de configuração que abrir, preencha:

| Campo | O que colocar |
|---|---|
| **Branch to deploy** | `main` |
| **Build command** | `npm run build` |
| **Publish directory** | `dist` |

---

### Passo 4 — Adicionar as variáveis de ambiente

1. Ainda na mesma tela, clique em **"Show advanced"** (link abaixo das configurações de build)
2. Clique em **"New variable"** para cada variável abaixo — adicione uma por vez:

| Variável | Valor | Onde pegar |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` | Supabase → Project Settings → API → anon public |
| `VITE_SENTRY_DSN` | `https://xxx@sentry.io/...` | Sentry → Settings → Projects → Client Keys |
| `VITE_UPSTASH_REDIS_REST_URL` | `https://xxx.upstash.io` | Upstash → seu banco → REST API |
| `VITE_UPSTASH_REDIS_REST_TOKEN` | `AXxx...` | Upstash → seu banco → REST API |
| `VITE_WHATSAPP` | `5538999845134` | Seu número (país+DDD+número, sem espaços) |

3. Após adicionar todas, clique em **"Deploy site"**
4. Aguarde o build terminar — leva 1 a 3 minutos
5. Quando aparecer **"Published"** com uma URL (ex: `dh-multiprodutos.netlify.app`), o site está no ar

---

### Passo 5 — Configurar redirecionamento (importante)

Sem isso, ao atualizar a página em rotas como `/admin/login` vai dar erro 404.

1. Na pasta do projeto, abra a pasta **`public`**
2. Crie um arquivo chamado **`_redirects`** (sem extensão, só esse nome)
3. Coloque exatamente esse conteúdo dentro:
   ```
   /*    /index.html   200
   ```
4. Salve o arquivo
5. No terminal, execute:
   ```bash
   git add .
   git commit -m "adiciona redirects para Netlify"
   git push
   ```
6. O Netlify vai detectar o push e fazer o deploy automaticamente

---

### Passo 6 — Domínio personalizado (opcional)

Se quiser usar um domínio próprio (ex: `dhmultiprodutos.com.br`):

1. No painel do Netlify, clique no seu site
2. Clique em **"Domain settings"** (ou **"Set up a custom domain"**)
3. Clique em **"Add custom domain"**
4. Digite seu domínio e clique em **"Verify"**
5. O Netlify vai mostrar os servidores DNS — você precisa configurar isso no site onde comprou o domínio:
   - Acesse o painel do seu registrador de domínio (ex: Registro.br, GoDaddy, Hostinger)
   - Procure por **"DNS"** ou **"Nameservers"**
   - Substitua os nameservers pelos que o Netlify mostrou
6. Aguarde até 24 horas para o DNS propagar
7. O HTTPS é configurado automaticamente pelo Netlify — não precisa fazer nada

---

## Resumo — O que guardar em local seguro

Anote tudo isso antes de fechar as abas:

```
SUPABASE
  URL do projeto:     https://xxx.supabase.co
  Chave anon:         eyJ...
  E-mail do admin:    seuemail@gmail.com
  Senha do admin:     (a que você criou no passo 5 do Supabase)
  Senha do banco:     (a gerada no passo 2 do Supabase)

UPSTASH
  REST URL:           https://xxx.upstash.io
  REST Token:         AXxx...

SENTRY
  DSN:                https://xxx@sentry.io/...

NETLIFY
  URL do site:        https://dh-multiprodutos.netlify.app
```
