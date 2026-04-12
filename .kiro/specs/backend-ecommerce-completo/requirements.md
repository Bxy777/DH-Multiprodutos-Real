# Documento de Requisitos

## Introdução

Este documento descreve os requisitos para a evolução completa do backend e da experiência de uso do site DH Multiprodutos — uma loja de e-commerce de pods descartáveis construída em React + TypeScript + Vite.

O escopo cobre quatro grandes áreas:

1. **Backend persistente** — substituir o armazenamento em `localStorage` por um banco de dados real (Supabase), com sincronização em tempo real entre dispositivos.
2. **Responsividade total** — garantir que todas as páginas voltadas ao cliente funcionem perfeitamente em celular e computador sem alterar o visual existente.
3. **Fluxo de carrinho simplificado** — ao clicar em "Adicionar ao carrinho" em qualquer produto, abrir um modal/sheet de seleção de sabor antes de redirecionar para a página de compra completa, evitando que o cliente se perca.
4. **Admin Dashboard aprimorado** — painel administrativo mais completo, com melhor UX mobile, gestão de pedidos, histórico de vendas e configurações da loja.

---

## Glossário

- **Sistema**: a aplicação web DH Multiprodutos como um todo.
- **Loja**: as páginas voltadas ao cliente final (HomePage, ProductPage).
- **Admin**: o painel administrativo acessível via `/admin`.
- **Catálogo**: conjunto de produtos (`CatalogProduct`) gerenciados pelo `CatalogContext`.
- **Carrinho**: conjunto de linhas de pedido (`CartLine`) gerenciadas pelo `CartContext`.
- **Sabor**: variante de um produto (`ProductFlavor`) com nome e estoque.
- **Modal_Sabor**: componente de seleção rápida de sabor exibido antes de adicionar ao carrinho.
- **Supabase**: plataforma de backend-as-a-service (PostgreSQL + Auth + Realtime) usada como banco de dados persistente.
- **Pedido**: registro de uma intenção de compra enviada via WhatsApp, salvo no banco para histórico.
- **Admin_Session**: sessão autenticada do administrador, validada via Supabase Auth.
- **SKU**: combinação única de produto + sabor que representa uma unidade de estoque.
- **Estoque_Baixo**: sabor com `stock > 0` e `stock < 4`.
- **Esgotado**: sabor com `stock === 0`.
- **Sentry**: serviço de monitoramento de erros e performance em produção (`@sentry/react`).
- **Upstash**: serviço de Redis gerenciado acessível via REST API, usado para rate limiting.
- **Zod**: biblioteca de validação de schemas em runtime para TypeScript.
- **DOMPurify**: biblioteca de sanitização de HTML para prevenção de XSS.
- **Audit_Log**: tabela do Supabase que registra ações administrativas para fins de auditoria.
- **Rate_Limiter**: mecanismo que restringe o número de tentativas de login por IP em uma janela de tempo.

---

## Requisitos

### Requisito 1: Persistência de Catálogo no Supabase

**User Story:** Como administrador, quero que o catálogo de produtos seja salvo em um banco de dados real, para que as alterações feitas no painel sejam visíveis para todos os clientes em qualquer dispositivo imediatamente.

#### Critérios de Aceitação

1. THE Sistema SHALL conectar-se ao Supabase usando as variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` na inicialização.
2. WHEN o CatalogContext é inicializado, THE Sistema SHALL carregar os produtos da tabela `products` do Supabase como fonte primária de dados.
3. WHEN os dados são carregados do Supabase, THE Sistema SHALL validar a estrutura de cada produto usando um schema Zod antes de inserir no estado da aplicação.
4. IF a validação Zod de um produto falhar, THEN THE Sistema SHALL descartar o registro inválido, registrar o erro no Sentry e continuar carregando os demais produtos.
5. IF a conexão com o Supabase falhar durante a inicialização, THEN THE Sistema SHALL carregar o catálogo do `localStorage` como fallback e exibir um aviso discreto ao administrador.
6. WHEN o administrador salva um produto no Admin Dashboard, THE Sistema SHALL persistir as alterações na tabela `products` do Supabase em até 2 segundos.
7. WHEN o administrador remove um produto, THE Sistema SHALL marcar o registro como inativo no Supabase (soft delete) em vez de excluí-lo fisicamente.
8. THE Sistema SHALL sincronizar o catálogo em tempo real via Supabase Realtime, de modo que alterações feitas em uma aba sejam refletidas em outras abas abertas sem recarregar a página.
9. WHEN o administrador clica em "Restaurar padrão", THE Sistema SHALL substituir todos os registros ativos na tabela `products` pelos dados do `seedCatalog` e confirmar a operação ao usuário.

---

### Requisito 2: Persistência do Estoque por Sabor

**User Story:** Como administrador, quero que o estoque de cada sabor seja salvo no banco de dados, para que vendas registradas no painel reduzam o estoque visível para os clientes em tempo real.

#### Critérios de Aceitação

1. THE Sistema SHALL armazenar o estoque de cada sabor (`ProductFlavor.stock`) na tabela `flavors` do Supabase, vinculada ao produto pelo `product_id`.
2. WHEN o administrador ajusta o estoque de um sabor no painel (botões −1 venda / +1 entrada ou campo numérico), THE Sistema SHALL atualizar o valor na tabela `flavors` do Supabase imediatamente.
3. WHEN um sabor tem `stock === 0`, THE Loja SHALL exibir o chip desse sabor como "Esgotado" e desabilitá-lo para seleção.
4. WHEN um sabor tem `stock > 0` e `stock < 4`, THE Loja SHALL exibir a quantidade restante no chip do sabor (ex.: "3 rest.").
5. THE Sistema SHALL garantir que o valor de estoque nunca seja negativo; IF uma operação resultaria em estoque negativo, THEN THE Sistema SHALL manter o valor em 0.

---

### Requisito 3: Autenticação do Administrador via Supabase Auth

**User Story:** Como administrador, quero fazer login com e-mail e senha reais, para que o acesso ao painel seja seguro e não dependa de uma senha hardcoded no código-fonte.

#### Critérios de Aceitação

1. THE Admin SHALL autenticar-se via Supabase Auth usando e-mail e senha cadastrados no projeto Supabase.
2. WHEN o administrador submete credenciais válidas na tela de login, THE Sistema SHALL criar uma sessão Supabase e redirecionar para `/admin`.
3. IF o administrador submete credenciais inválidas, THEN THE Sistema SHALL exibir a mensagem "E-mail ou senha incorretos." sem revelar qual campo está errado.
4. WHEN a sessão Supabase expira, THE Sistema SHALL redirecionar o administrador para `/admin/login` automaticamente.
5. WHEN o administrador clica em "Sair", THE Sistema SHALL encerrar a sessão Supabase e redirecionar para `/admin/login`.
6. IF a variável `VITE_SUPABASE_URL` não estiver configurada, THEN THE Sistema SHALL bloquear o acesso ao painel administrativo completamente e exibir a mensagem "Configuração de autenticação ausente. Configure as variáveis de ambiente do Supabase." sem oferecer nenhum fallback de senha local.
7. THE Sistema SHALL validar a sessão Supabase no servidor a cada requisição ao painel, rejeitando tokens expirados ou inválidos.

---

### Requisito 4: Registro de Pedidos

**User Story:** Como administrador, quero que cada pedido enviado via WhatsApp seja registrado no banco de dados, para que eu tenha um histórico de vendas consultável no painel.

#### Critérios de Aceitação

1. WHEN o cliente clica em "Finalizar compra" ou "Enviar pedido no WhatsApp" e o link do WhatsApp é aberto, THE Sistema SHALL salvar um registro na tabela `orders` do Supabase com: data/hora, itens (produto, sabor, quantidade, preço unitário), total, endereço e forma de pagamento.
2. THE Pedido SHALL conter os campos: `id`, `created_at`, `items` (JSON), `total`, `address`, `payment_method`, `status` (padrão: `"pending"`).
3. THE Admin Dashboard SHALL exibir a lista de pedidos registrados, ordenada do mais recente para o mais antigo.
4. WHEN o administrador visualiza um pedido, THE Sistema SHALL exibir todos os itens, total, endereço, forma de pagamento e status.
5. WHEN o administrador altera o status de um pedido (pending → confirmed → delivered), THE Sistema SHALL atualizar o campo `status` na tabela `orders` do Supabase.
6. IF a gravação do pedido no Supabase falhar, THEN THE Sistema SHALL registrar o erro no console e prosseguir com a abertura do WhatsApp normalmente, sem bloquear o cliente.

---

### Requisito 5: Modal de Seleção de Sabor (Fluxo de Carrinho Simplificado)

**User Story:** Como cliente, quero que ao clicar em "Adicionar ao carrinho" na grade de produtos, um modal rápido de seleção de sabor seja exibido, para que eu não precise navegar para a página completa do produto só para escolher o sabor.

#### Critérios de Aceitação

1. WHEN o cliente clica no botão "Adicionar ao carrinho" em um `ProductTile` na HomePage, THE Modal_Sabor SHALL ser exibido com o nome do produto, imagem, preço e a lista de sabores disponíveis.
2. THE Modal_Sabor SHALL exibir apenas os sabores com `stock > 0` como selecionáveis; sabores com `stock === 0` SHALL ser exibidos como desabilitados com o rótulo "Esgotado".
3. WHEN o cliente seleciona um sabor e confirma no Modal_Sabor, THE Sistema SHALL adicionar o item ao carrinho e fechar o modal.
4. WHEN o cliente confirma no Modal_Sabor sem ter selecionado um sabor, THE Modal_Sabor SHALL exibir a mensagem "Escolha um sabor para continuar." sem fechar.
5. WHEN o item é adicionado ao carrinho via Modal_Sabor, THE Sistema SHALL exibir o toast de confirmação existente ("Produto · Sabor adicionado ao carrinho").
6. WHEN o cliente clica fora do Modal_Sabor ou no botão "×", THE Modal_Sabor SHALL fechar sem adicionar nada ao carrinho.
7. THE Modal_Sabor SHALL ser responsivo e ocupar no máximo 90% da largura da tela em dispositivos móveis, com rolagem interna se a lista de sabores for longa.
8. WHERE o produto tiver apenas um sabor disponível, THE Modal_Sabor SHALL pré-selecionar esse sabor automaticamente.

---

### Requisito 6: Responsividade Total da Loja

**User Story:** Como cliente, quero que todas as páginas da loja funcionem perfeitamente no celular e no computador, para que eu possa comprar de qualquer dispositivo sem dificuldade.

#### Critérios de Aceitação

1. THE Loja SHALL renderizar corretamente em viewports de 320px a 1440px de largura sem overflow horizontal.
2. THE ShopHeader SHALL exibir o campo de busca colapsado em um ícone em telas menores que 480px, expandindo ao toque.
3. THE ProductGrid SHALL usar no mínimo 2 colunas em telas de 320px–599px e no mínimo 3 colunas em telas de 600px–1023px.
4. THE CartPanel (Sheet) SHALL ocupar 100% da largura da tela em dispositivos com viewport menor que 480px.
5. THE ProductPage SHALL exibir os chips de sabor em um grid de no mínimo 2 colunas em telas menores que 480px.
6. WHEN o cliente acessa a ProductPage em um dispositivo móvel, THE Sistema SHALL garantir que os botões de ação ("Finalizar compra", "Adicionar ao carrinho") estejam sempre visíveis sem necessidade de rolagem horizontal.
7. THE SiteFooter SHALL reorganizar seus elementos em coluna única em telas menores que 600px.

---

### Requisito 7: Admin Dashboard — Gestão de Pedidos

**User Story:** Como administrador, quero uma seção de pedidos no painel, para que eu possa acompanhar e gerenciar todas as compras realizadas pelos clientes.

#### Critérios de Aceitação

1. THE Admin Dashboard SHALL incluir uma aba ou seção "Pedidos" acessível a partir do menu principal do painel.
2. WHEN o administrador acessa a seção de pedidos, THE Sistema SHALL exibir a lista de pedidos com: número do pedido, data, total, status e resumo dos itens.
3. THE Admin Dashboard SHALL permitir filtrar pedidos por status (todos, pendente, confirmado, entregue).
4. WHEN o administrador clica em um pedido, THE Sistema SHALL exibir os detalhes completos: itens, endereço, forma de pagamento, total e histórico de status.
5. THE Admin Dashboard SHALL exibir o total de pedidos do dia e o faturamento do dia no painel de estatísticas.
6. WHEN não houver pedidos registrados, THE Sistema SHALL exibir a mensagem "Nenhum pedido registrado ainda." na seção de pedidos.

---

### Requisito 8: Admin Dashboard — UX Mobile Aprimorada

**User Story:** Como administrador, quero que o painel administrativo seja fácil de usar no celular, para que eu possa gerenciar a loja de qualquer lugar sem precisar de um computador.

#### Critérios de Aceitação

1. THE Admin Dashboard SHALL renderizar corretamente em viewports de 320px a 1440px sem overflow horizontal.
2. THE Admin Dashboard SHALL usar navegação por abas fixas na parte inferior da tela em dispositivos com viewport menor que 600px, com as seções: Produtos, Pedidos, Estoque e Configurações.
3. THE Admin Dashboard SHALL exibir os cards de produto em lista vertical (1 coluna) em telas menores que 480px, com imagem, nome, estoque mínimo e botão de edição visíveis.
4. WHEN o administrador abre o drawer de edição de produto em um dispositivo móvel, THE Sistema SHALL exibir o drawer em tela cheia (100% de altura e largura).
5. THE Admin Dashboard SHALL usar botões de toque com área mínima de 44×44px em todos os controles interativos.
6. THE Admin Dashboard SHALL exibir os campos de estoque dos sabores com botões de incremento/decremento grandes o suficiente para uso com o polegar em dispositivos móveis.
7. WHEN o administrador salva um produto com sucesso, THE Sistema SHALL exibir uma notificação de sucesso ("Produto salvo com sucesso!") por 3 segundos.
8. IF o administrador tenta salvar um produto com campos obrigatórios vazios, THEN THE Sistema SHALL destacar os campos inválidos com borda vermelha e exibir mensagem de erro inline, sem usar `alert()`.

---

### Requisito 9: Admin Dashboard — Configurações da Loja

**User Story:** Como administrador, quero poder alterar as configurações básicas da loja (nome, WhatsApp, texto do hero) diretamente no painel, para que eu não precise editar o código-fonte para personalizar a loja.

#### Critérios de Aceitação

1. THE Admin Dashboard SHALL incluir uma seção "Configurações" com campos editáveis para: nome da loja, número do WhatsApp, texto do hero (claim e heroLead), linha de entrega e usuário do Instagram.
2. WHEN o administrador salva as configurações, THE Sistema SHALL persistir os valores na tabela `store_config` do Supabase.
3. WHEN a Loja é carregada, THE Sistema SHALL buscar as configurações da tabela `store_config` e usá-las em vez dos valores hardcoded em `brand.ts`.
4. IF a tabela `store_config` não contiver registros, THEN THE Sistema SHALL usar os valores padrão definidos em `brand.ts` como fallback.
5. WHEN o administrador altera o número do WhatsApp nas configurações, THE Sistema SHALL validar que o valor contém apenas dígitos e tem entre 10 e 15 caracteres antes de salvar.

---

### Requisito 10: Histórico e Relatório de Estoque

**User Story:** Como administrador, quero visualizar um resumo do estoque atual com alertas de sabores esgotados ou com estoque baixo, para que eu possa repor o estoque antes de perder vendas.

#### Critérios de Aceitação

1. THE Admin Dashboard SHALL exibir na seção "Estoque" uma lista de todos os sabores agrupados por produto, com nome do sabor, quantidade em estoque e indicador visual de status (normal, baixo, esgotado).
2. WHEN um sabor está com `stock === 0`, THE Sistema SHALL destacá-lo com cor vermelha e rótulo "Esgotado" na lista de estoque.
3. WHEN um sabor está com `stock > 0` e `stock < 4`, THE Sistema SHALL destacá-lo com cor amarela e rótulo "Estoque baixo" na lista de estoque.
4. THE Admin Dashboard SHALL exibir no topo da seção de estoque o total de SKUs esgotados e o total de SKUs com estoque baixo.
5. WHEN o administrador clica em um sabor na lista de estoque, THE Sistema SHALL abrir o drawer de edição do produto correspondente diretamente na aba "Sabores".
6. THE Admin Dashboard SHALL permitir que o administrador atualize o estoque de um sabor diretamente na lista de estoque, sem precisar abrir o drawer de edição completo.

---

### Requisito 11: Monitoramento de Erros com Sentry

**User Story:** Como administrador, quero que erros em produção sejam capturados e reportados automaticamente, para que eu possa identificar e corrigir problemas antes que afetem os clientes.

#### Critérios de Aceitação

1. THE Sistema SHALL inicializar o `@sentry/react` na entrada da aplicação (`main.tsx`) usando o DSN configurado via variável de ambiente `VITE_SENTRY_DSN`.
2. WHEN um erro JavaScript não tratado ocorre em produção, THE Sentry SHALL capturar o erro com stack trace, URL da página e informações do navegador automaticamente.
3. WHEN uma falha de autenticação ocorre (credenciais inválidas, sessão expirada), THE Sistema SHALL registrar o evento no Sentry com nível `warning` e contexto da ação.
4. WHEN uma operação de persistência no Supabase falha (salvar produto, registrar pedido, atualizar estoque), THE Sistema SHALL registrar o erro no Sentry com nível `error` e os dados da operação que falhou.
5. THE Sentry SHALL rastrear a performance de carregamento das páginas HomePage, ProductPage e Admin Dashboard, reportando o tempo de carregamento inicial.
6. WHERE a variável `VITE_SENTRY_DSN` não estiver configurada, THE Sistema SHALL funcionar normalmente sem o monitoramento, registrando erros apenas no console.

---

### Requisito 12: Rate Limiting de Login via Upstash Redis

**User Story:** Como administrador, quero que tentativas excessivas de login sejam bloqueadas automaticamente, para que ataques de força bruta não comprometam o acesso ao painel.

#### Critérios de Aceitação

1. THE Rate_Limiter SHALL usar a Upstash Redis REST API, configurada via variáveis de ambiente `VITE_UPSTASH_REDIS_REST_URL` e `VITE_UPSTASH_REDIS_REST_TOKEN`, para contar tentativas de login por identificador de cliente.
2. WHEN o administrador submete credenciais na tela de login, THE Rate_Limiter SHALL incrementar o contador de tentativas associado ao endereço IP ou fingerprint do cliente.
3. IF o número de tentativas de login de um mesmo cliente atingir 5 dentro de uma janela de 15 minutos, THEN THE Sistema SHALL bloquear novas tentativas e exibir a mensagem "Muitas tentativas. Tente novamente em X minutos." onde X é o tempo restante até o desbloqueio.
4. WHEN o administrador realiza login com sucesso, THE Rate_Limiter SHALL zerar o contador de tentativas do cliente.
5. WHEN o bloqueio expira após 15 minutos, THE Rate_Limiter SHALL permitir novas tentativas de login automaticamente.
6. WHERE as variáveis de ambiente do Upstash não estiverem configuradas, THE Sistema SHALL permitir o login sem rate limiting e registrar um aviso no console indicando que o rate limiting está desabilitado.

---

### Requisito 13: Validação de Dados com Zod

**User Story:** Como desenvolvedor, quero que todos os dados externos e entradas do administrador sejam validados com schemas Zod, para que dados malformados não causem comportamentos inesperados na aplicação.

#### Critérios de Aceitação

1. THE Sistema SHALL definir schemas Zod para todas as entidades principais: `CatalogProduct`, `ProductFlavor`, `Order`, `StoreConfig` e `AuditLog`.
2. WHEN dados são recebidos do Supabase (produtos, pedidos, configurações), THE Sistema SHALL validar cada registro contra o schema Zod correspondente antes de inserir no estado da aplicação.
3. IF a validação Zod de um registro falhar, THEN THE Sistema SHALL descartar o registro inválido, registrar o erro no Sentry e continuar processando os demais registros sem interromper a aplicação.
4. WHEN o administrador submete o formulário de criação ou edição de produto, THE Sistema SHALL validar os campos com o schema Zod de `CatalogProduct` antes de enviar ao Supabase.
5. WHEN o administrador submete o formulário de configurações da loja, THE Sistema SHALL validar os campos com o schema Zod de `StoreConfig` antes de persistir.
6. IF a validação Zod de um formulário falhar, THEN THE Sistema SHALL exibir mensagens de erro inline abaixo de cada campo inválido sem usar `alert()` e sem fechar o formulário.
7. THE Sistema SHALL inferir os tipos TypeScript das entidades a partir dos schemas Zod, eliminando duplicação entre tipos e validações.

---

### Requisito 14: Sanitização e Segurança de Conteúdo

**User Story:** Como administrador, quero que o site esteja protegido contra injeção de conteúdo malicioso, para que clientes e o próprio painel não sejam expostos a ataques XSS ou de injeção de recursos.

#### Critérios de Aceitação

1. WHEN o administrador salva um campo de texto livre (nome do produto, descrição, nome do sabor, textos da loja), THE Sistema SHALL sanitizar o valor com DOMPurify antes de persistir no Supabase.
2. WHEN o administrador informa uma URL de imagem para um produto, THE Sistema SHALL validar que a URL começa com `https://` e que o domínio pertence à lista de domínios permitidos (unsplash.com, imgur.com, i.imgur.com, images.unsplash.com).
3. IF a URL de imagem informada não passar na validação, THEN THE Sistema SHALL exibir a mensagem "URL de imagem inválida. Use apenas URLs https:// de domínios permitidos." e impedir o salvamento.
4. THE Sistema SHALL incluir uma Content Security Policy via meta tag no `index.html` restringindo: `default-src 'self'`, `img-src` aos domínios de imagem permitidos, `connect-src` ao domínio do Supabase e Upstash, e `script-src 'self'`.
5. THE Sistema SHALL configurar os headers de segurança `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` e `Referrer-Policy: strict-origin-when-cross-origin` via `vite.config.ts` no servidor de preview e orientar a configuração equivalente no servidor de produção.
6. THE Sistema SHALL garantir que nenhuma senha, token de API ou chave secreta seja incluída no bundle JavaScript de produção; todas as credenciais SHALL ser carregadas exclusivamente via variáveis de ambiente prefixadas com `VITE_`.

---

### Requisito 15: Auditoria de Ações Administrativas

**User Story:** Como administrador, quero que todas as ações realizadas no painel sejam registradas com data, hora e detalhes, para que eu possa rastrear alterações e identificar atividades suspeitas.

#### Critérios de Aceitação

1. THE Sistema SHALL registrar um evento na tabela `audit_log` do Supabase para cada uma das seguintes ações: login do administrador, logout do administrador, criação de produto, edição de produto, exclusão (soft delete) de produto, alteração de estoque de sabor, alteração de configurações da loja.
2. THE Audit_Log SHALL conter os campos: `id`, `created_at`, `action` (string descritiva da ação), `admin_id` (ID do usuário Supabase Auth), `entity_type` (ex.: "product", "flavor", "config"), `entity_id` (ID do registro afetado), `previous_data` (JSON com valores anteriores), `new_data` (JSON com valores novos).
3. WHEN uma ação auditável é executada com sucesso, THE Sistema SHALL inserir o registro no `audit_log` de forma assíncrona, sem bloquear a operação principal.
4. IF a inserção no `audit_log` falhar, THEN THE Sistema SHALL registrar o erro no Sentry com nível `warning` e prosseguir com a operação principal sem interrompê-la.
5. THE Admin Dashboard SHALL exibir na seção "Configurações" uma subseção "Log de Auditoria" com a lista dos últimos 100 eventos, ordenados do mais recente para o mais antigo, exibindo: data/hora, ação e entidade afetada.
6. WHEN o administrador clica em um evento do log de auditoria, THE Sistema SHALL exibir os dados anteriores e novos em formato legível (diff simplificado).
7. THE Sistema SHALL restringir o acesso à tabela `audit_log` no Supabase via Row Level Security (RLS), permitindo apenas leitura e inserção pelo usuário autenticado como administrador.
