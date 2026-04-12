# Plano de Implementação: Backend E-commerce Completo — DH Multiprodutos

## Visão Geral

Implementação incremental da evolução do backend e UX do site DH Multiprodutos. A stack permanece SPA React 19 + TypeScript + Vite. Cada tarefa constrói sobre a anterior, terminando com tudo integrado e funcional.

> Tarefas marcadas com `*` são opcionais (testes) e podem ser puladas para um MVP mais rápido.

---

## Tarefas

- [ ] 1. Instalar dependências e configurar variáveis de ambiente
  - Instalar `@supabase/supabase-js`, `@sentry/react`, `zod`, `dompurify`, `@types/dompurify` via npm
  - Criar `.env.example` na raiz com todas as variáveis documentadas: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SENTRY_DSN`, `VITE_UPSTASH_REDIS_REST_URL`, `VITE_UPSTASH_REDIS_REST_TOKEN`, `VITE_WHATSAPP`
  - Adicionar `.env.local` ao `.gitignore` (verificar se já está)
  - Instalar `fast-check` e `vitest` como devDependencies para testes de propriedade
  - Criar `vitest.config.ts` com `environment: 'jsdom'` e `globals: true`
  - _Requisitos: 1.1, 11.1, 12.1, 14.6_

- [ ] 2. Criar camada de infraestrutura (`src/lib/`)
  - [ ] 2.1 Criar `src/lib/supabase.ts`
    - Singleton `SupabaseClient` usando `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
    - Exportar instância `supabase` tipada
    - _Requisitos: 1.1, 3.1_

  - [ ] 2.2 Criar `src/lib/sentry.ts`
    - Função `initSentry()` que inicializa `@sentry/react` com `VITE_SENTRY_DSN`
    - Retornar sem erro se DSN ausente (degradação graciosa)
    - `tracesSampleRate: 0.2`
    - _Requisitos: 11.1, 11.6_

  - [ ] 2.3 Criar `src/lib/upstash.ts`
    - Implementar `checkRateLimit(key)`, `incrementAttempt(key)`, `resetAttempts(key)` usando fetch nativo (sem SDK)
    - Janela de 15 minutos, limite de 5 tentativas
    - Retornar `{ blocked: false }` silenciosamente se variáveis Upstash ausentes
    - _Requisitos: 12.1, 12.2, 12.3, 12.5, 12.6_

  - [ ]* 2.4 Escrever teste de propriedade para rate limiting (Propriedade 8)
    - **Propriedade 8: Rate limiting bloqueia após 5 tentativas**
    - Usar `fc.integer({ min: 5, max: 20 })` para simular N tentativas falhas
    - Verificar que a partir da 5ª tentativa `checkRateLimit` retorna `{ blocked: true }`
    - **Valida: Requisito 12.3**

- [ ] 3. Criar schemas Zod e migrar tipos TypeScript
  - [ ] 3.1 Criar `src/schemas/product.schema.ts`
    - Definir `ProductFlavorSchema` e `CatalogProductSchema` conforme design
    - `image` deve validar `startsWith('https://')` e domínios permitidos (unsplash.com, imgur.com, i.imgur.com, images.unsplash.com)
    - Exportar tipos inferidos `ProductFlavor` e `CatalogProduct`
    - _Requisitos: 13.1, 13.7, 14.2_

  - [ ] 3.2 Criar `src/schemas/order.schema.ts`
    - Definir `OrderItemSchema` e `OrderSchema` com todos os campos do design
    - Exportar tipos `Order`, `OrderItem`, `OrderStatus`
    - _Requisitos: 13.1, 4.2_

  - [ ] 3.3 Criar `src/schemas/config.schema.ts`
    - Definir `StoreConfigSchema` com validação de `whatsapp` (regex `^\d{10,15}$`)
    - Exportar tipo `StoreConfig`
    - _Requisitos: 13.1, 9.5_

  - [ ] 3.4 Atualizar `src/types.ts`
    - Re-exportar `CatalogProduct`, `ProductFlavor`, `Order`, `OrderItem`, `OrderStatus`, `StoreConfig` dos schemas Zod
    - Manter `CartLine` e `PaymentMethod` como tipos locais (não têm schema Zod)
    - _Requisitos: 13.7_

  - [ ]* 3.5 Escrever testes de propriedade para validação Zod (Propriedades 1, 12)
    - **Propriedade 1: Validação Zod filtra registros inválidos**
    - Usar `fc.array(fc.oneof(validProductArbitrary, invalidProductArbitrary))`
    - Verificar que apenas registros válidos passam pelo schema
    - **Propriedade 12: Validação de formulário Zod aceita apenas entradas válidas**
    - Testar `CatalogProductSchema` e `StoreConfigSchema` com entradas válidas e inválidas
    - **Valida: Requisitos 1.3, 1.4, 13.2, 13.3, 13.4, 13.5**

- [ ] 4. Criar arquivo de migração SQL do Supabase
  - Criar `supabase/migrations/001_initial_schema.sql` com:
    - Tabelas: `products`, `flavors`, `orders`, `store_config`, `audit_log` conforme design
    - Trigger `updated_at` para `products`, `flavors`, `store_config`
    - Políticas RLS para cada tabela conforme tabela do design (anon vs authenticated)
    - CHECK `stock >= 0` na tabela `flavors`
    - Índices em `products.active`, `flavors.product_id`, `orders.created_at`, `audit_log.created_at`
  - _Requisitos: 1.2, 2.1, 2.5, 3.7, 4.1, 9.2, 15.1, 15.7_

- [ ] 5. Implementar autenticação com Supabase Auth
  - [ ] 5.1 Criar `src/auth/useAdminAuth.ts`
    - Hook com `session`, `loading`, `signIn(email, password)`, `signOut()`
    - Usar `supabase.auth.getSession()` e `onAuthStateChange`
    - `signIn` chama `checkRateLimit` antes de tentar autenticar; incrementa contador em falha; reseta em sucesso
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5, 12.2, 12.4_

  - [ ] 5.2 Atualizar `src/pages/AdminLogin.tsx`
    - Campos: e-mail + senha (substituir campo único de senha)
    - Chamar `useAdminAuth().signIn` no submit
    - Exibir mensagem de bloqueio com tempo restante quando rate limit atingido
    - Exibir "E-mail ou senha incorretos." para credenciais inválidas
    - Sem fallback de senha local quando `VITE_SUPABASE_URL` configurado
    - _Requisitos: 3.2, 3.3, 3.6, 12.3_

  - [ ] 5.3 Atualizar `AdminGate` em `src/App.tsx`
    - Substituir `isAdminSession` por `useAdminAuth().session`
    - Adicionar `StoreConfigProvider` ao wrapper de providers
    - Chamar `initSentry()` antes do render (importar de `src/lib/sentry.ts`)
    - Exibir mensagem de configuração ausente se `VITE_SUPABASE_URL` não configurado
    - _Requisitos: 3.6, 3.7, 11.1_

- [ ] 6. Atualizar `CatalogContext` com Supabase + Realtime + fallback
  - Substituir fonte primária de `localStorage` por tabela `products` do Supabase (JOIN com `flavors`)
  - Validar cada registro com `CatalogProductSchema.safeParse()` antes de inserir no estado
  - Registrar erros de validação no Sentry via `Sentry.captureException`
  - Fallback para `localStorage` se Supabase falhar na inicialização
  - Subscrever canal Realtime em `products` e `flavors` para sincronização entre abas
  - `removeProduct` deve fazer soft delete (`active = false`) em vez de DELETE
  - `saveProduct` deve usar upsert no Supabase com sanitização DOMPurify nos campos de texto
  - Validar URL de imagem contra lista de domínios permitidos antes de salvar
  - _Requisitos: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 13.2, 13.3, 14.1, 14.2_

  - [ ]* 6.1 Escrever teste de propriedade para soft delete (Propriedade 3)
    - **Propriedade 3: Soft delete preserva registro**
    - Verificar que após `removeProduct`, produto existe com `active = false` e não aparece em queries com `active = true`
    - **Valida: Requisito 1.7**

  - [ ]* 6.2 Escrever testes de propriedade para validação de URL e sanitização (Propriedades 9, 10)
    - **Propriedade 9: Sanitização remove tags HTML**
    - Usar `fc.string()` com injeção de tags HTML; verificar que DOMPurify remove todas as tags
    - **Propriedade 10: Validação de URL de imagem aceita apenas domínios permitidos**
    - Usar `fc.webUrl()` e URLs inválidas; verificar que apenas URLs `https://` de domínios permitidos passam
    - **Valida: Requisitos 14.1, 14.2**

- [ ] 7. Criar `StoreConfigContext` e hook `useStoreConfig`
  - Criar `src/context/StoreConfigContext.tsx` com `StoreConfigProvider` e `useStoreConfig()`
  - Carregar configurações da tabela `store_config` do Supabase
  - Fallback para valores de `src/config/brand.ts` se tabela vazia ou Supabase indisponível
  - `updateConfig(patch)` faz upsert no Supabase e atualiza estado local
  - Criar `src/hooks/useStoreConfig.ts` como re-export do hook do context
  - Atualizar `ShopHeader`, `HeroSection`, `SiteFooter` e `WhySection` para consumir `useStoreConfig()` em vez de importar `brand.ts` diretamente
  - _Requisitos: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 8. Criar componente `FlavorPickerModal`
  - [ ] 8.1 Criar `src/components/FlavorPickerModal.tsx`
    - Props: `product: CatalogProduct`, `onClose: () => void`, `onAdd: (flavorId, flavorName) => void`
    - Chips de sabor: disponível (clicável), esgotado (disabled + label "Esgotado"), estoque baixo (label "N rest.")
    - Pré-selecionar automaticamente se exatamente 1 sabor com `stock > 0`
    - Botão confirmar: chama `onAdd` e fecha; sem seleção exibe "Escolha um sabor para continuar." inline
    - Overlay clicável e botão "×" fecham sem adicionar ao carrinho
    - _Requisitos: 5.1, 5.2, 5.3, 5.4, 5.6, 5.7, 5.8_

  - [ ] 8.2 Criar `src/components/FlavorPickerModal.css`
    - Overlay com `position: fixed`, `z-index` alto
    - Modal responsivo: `max-width: 480px`, `width: 90vw`
    - Chips em grid de 2 colunas mínimo
    - Rolagem interna na lista de sabores se necessário
    - _Requisitos: 5.7_

  - [ ] 8.3 Integrar `FlavorPickerModal` em `src/components/catalog/ProductTile.tsx`
    - Botão "Adicionar ao carrinho" abre modal em vez de navegar para ProductPage
    - Ao confirmar no modal: chamar `addToCart` do `CartContext` e exibir toast existente
    - _Requisitos: 5.1, 5.3, 5.5_

  - [ ]* 8.4 Escrever testes de propriedade para chips de sabor (Propriedades 4, 5)
    - **Propriedade 4: Chips de sabor refletem disponibilidade**
    - Usar `fc.array(fc.record({ stock: fc.nat() }))` para gerar sabores com stocks variados
    - Verificar que chips com `stock === 0` estão disabled e com `stock > 0` estão habilitados
    - **Propriedade 5: Pré-seleção automática com sabor único**
    - Gerar produtos com exatamente 1 sabor com `stock > 0`; verificar pré-seleção automática
    - **Valida: Requisitos 2.3, 5.2, 5.8_

- [ ] 9. Criar hooks de pedidos e auditoria
  - [ ] 9.1 Criar `src/hooks/useOrders.ts`
    - `orders: Order[]`, `loading: boolean`, `saveOrder(order)`, `updateStatus(id, status)`
    - `saveOrder` insere na tabela `orders`; em caso de falha, loga no console e não bloqueia o fluxo
    - `updateStatus` faz UPDATE em `orders.status`
    - Carregar pedidos ordenados por `created_at DESC`
    - Validar cada pedido recebido com `OrderSchema.safeParse()`
    - _Requisitos: 4.1, 4.2, 4.3, 4.5, 4.6_

  - [ ] 9.2 Criar `src/hooks/useAuditLog.ts`
    - `logs: AuditLogEntry[]`, `loading: boolean`, `logAction(entry)`
    - `logAction` insere assincronamente; falha silenciosa com `Sentry.captureMessage` (warning)
    - Carregar últimos 100 logs ordenados por `created_at DESC`
    - _Requisitos: 15.1, 15.2, 15.3, 15.4, 15.5_

  - [ ]* 9.3 Escrever testes de propriedade para pedidos e audit log (Propriedades 6, 7, 11)
    - **Propriedade 6: Objeto de pedido contém todos os campos obrigatórios**
    - Usar `fc.array(cartLineArbitrary, { minLength: 1 })` para gerar linhas de carrinho
    - Verificar que o objeto `Order` construído passa em `OrderSchema.safeParse()`
    - **Propriedade 7: Pedidos ordenados do mais recente para o mais antigo**
    - Usar `fc.array(fc.record({ created_at: fc.date() }))` e verificar ordenação DESC
    - **Propriedade 11: Registro de audit log contém todos os campos obrigatórios**
    - Usar `fc.constantFrom(...adminActions)` e verificar campos obrigatórios presentes
    - **Valida: Requisitos 4.2, 4.3, 15.2**

- [ ] 10. Atualizar `AdminDashboard` com abas e UX mobile
  - [ ] 10.1 Reestruturar `src/pages/AdminDashboard.tsx` com sistema de abas
    - Abas: Produtos | Pedidos | Estoque | Configurações
    - Navegação por abas fixas na parte inferior em mobile (< 600px)
    - Substituir todos os `alert()` por notificações inline com auto-dismiss de 3 segundos
    - Integrar `useAdminAuth` para logout e `useAuditLog` para registrar ações
    - _Requisitos: 7.1, 8.1, 8.2, 8.7, 8.8_

  - [ ] 10.2 Implementar aba Pedidos no AdminDashboard
    - Lista de pedidos via `useOrders()` com filtro por status (todos/pending/confirmed/delivered)
    - Exibir: número do pedido, data, total, status, resumo dos itens
    - Detalhe ao clicar: itens completos, endereço, forma de pagamento, total, histórico de status
    - Mensagem "Nenhum pedido registrado ainda." quando lista vazia
    - Estatísticas: total de pedidos do dia e faturamento do dia
    - _Requisitos: 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ] 10.3 Implementar aba Estoque no AdminDashboard
    - Lista de todos os sabores agrupados por produto com indicadores visuais (normal/baixo/esgotado)
    - Destaque vermelho + "Esgotado" para `stock === 0`; amarelo + "Estoque baixo" para `0 < stock < 4`
    - Totais no topo: SKUs esgotados e SKUs com estoque baixo
    - Campo de estoque editável inline com botões −1/+1 grandes (mínimo 44×44px)
    - Clicar no sabor abre drawer de edição do produto na aba "Sabores"
    - _Requisitos: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 8.5, 8.6_

  - [ ] 10.4 Implementar aba Configurações no AdminDashboard
    - Formulário com campos: nome da loja, WhatsApp, hero claim, heroLead, linha de entrega, Instagram
    - Validação Zod de `StoreConfigSchema` antes de salvar; erros inline por campo
    - Subseção "Log de Auditoria" com últimos 100 eventos via `useAuditLog()`
    - Detalhe ao clicar no evento: dados anteriores e novos em formato legível
    - _Requisitos: 9.1, 9.2, 9.5, 13.5, 13.6, 15.5, 15.6_

  - [ ] 10.5 Atualizar `src/pages/AdminDashboard.css` para UX mobile
    - Abas fixas na parte inferior em `< 600px`
    - Cards de produto em 1 coluna em `< 480px`
    - Drawer de edição em tela cheia em mobile
    - Botões de toque com área mínima de 44×44px
    - _Requisitos: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 11. Integrar registro de pedidos no fluxo de checkout
  - Localizar onde o link do WhatsApp é gerado (provavelmente `src/utils/order.ts` ou `CartPanel.tsx`)
  - Antes de abrir o WhatsApp, chamar `useOrders().saveOrder()` com os dados do carrinho
  - Construir objeto `Order` completo com `id` (uuid), `created_at`, `items`, `total`, `address`, `payment_method`, `status: 'pending'`
  - Falha no Supabase não deve bloquear abertura do WhatsApp (try/catch com log)
  - Registrar ação no `audit_log` via `useAuditLog().logAction()`
  - _Requisitos: 4.1, 4.2, 4.6, 15.1_

- [ ] 12. Implementar segurança: DOMPurify, CSP e headers
  - [ ] 12.1 Aplicar DOMPurify nos campos de texto livre
    - Sanitizar com `DOMPurify.sanitize()` antes de persistir: nome do produto, descrição, nome do sabor, textos da loja (hero claim, heroLead, deliveryLine, instagram)
    - Aplicar nos formulários do AdminDashboard e no `CatalogContext.saveProduct`
    - _Requisitos: 14.1_

  - [ ] 12.2 Adicionar Content Security Policy no `index.html`
    - Meta tag `<meta http-equiv="Content-Security-Policy" content="...">`
    - `default-src 'self'`, `img-src 'self' https://images.unsplash.com https://i.imgur.com https://imgur.com data:`, `connect-src 'self' https://*.supabase.co https://*.upstash.io https://*.sentry.io`, `script-src 'self'`
    - _Requisitos: 14.4_

  - [ ] 12.3 Configurar headers de segurança em `vite.config.ts`
    - Adicionar `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` no servidor de preview via `server.headers`
    - _Requisitos: 14.5_

- [ ] 13. Ajustes de responsividade CSS
  - [ ] 13.1 Atualizar `src/components/catalog/ShopHeader.css`
    - Campo de busca colapsado em ícone em `< 480px`, expandindo ao toque
    - _Requisitos: 6.1, 6.2_

  - [ ] 13.2 Atualizar `src/components/catalog/ProductGrid.css`
    - Mínimo 2 colunas em `320px–599px`; mínimo 3 colunas em `600px–1023px`
    - _Requisitos: 6.1, 6.3_

  - [ ] 13.3 Atualizar `src/components/CartPanel.css`
    - `width: 100%` em `< 480px`
    - _Requisitos: 6.4_

  - [ ] 13.4 Atualizar `src/pages/ProductPage.css`
    - Chips de sabor em grid de mínimo 2 colunas em `< 480px`
    - Botões de ação sempre visíveis sem scroll horizontal
    - _Requisitos: 6.5, 6.6_

  - [ ] 13.5 Atualizar `src/components/catalog/SiteFooter.css`
    - Layout em coluna única em `< 600px`
    - _Requisitos: 6.7_

- [ ] 14. Inicializar Sentry e capturar erros nas operações críticas
  - Chamar `initSentry()` em `src/main.tsx` antes de `ReactDOM.createRoot`
  - Adicionar `Sentry.captureException` nas operações: salvar produto, registrar pedido, atualizar estoque, falha de autenticação
  - Adicionar `Sentry.captureMessage` (warning) para falhas de audit log e Upstash indisponível
  - Verificar que `VITE_SENTRY_DSN` ausente não causa erro (já tratado em `sentry.ts`)
  - _Requisitos: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

- [ ] 15. Criar arquivo `public/_redirects` para Netlify SPA routing
  - Conteúdo: `/* /index.html 200`
  - Garante que rotas como `/admin/login` funcionem após refresh no Netlify
  - _Requisitos: (infraestrutura de deploy)_

- [ ] 16. Checkpoint final — Garantir que tudo está integrado
  - Verificar que `CatalogContext` carrega produtos do Supabase com fallback localStorage
  - Verificar que `AdminLogin` usa e-mail + senha com rate limiting
  - Verificar que `FlavorPickerModal` abre ao clicar em "Adicionar ao carrinho"
  - Verificar que pedidos são salvos no Supabase ao abrir WhatsApp
  - Verificar que `AdminDashboard` exibe abas Produtos/Pedidos/Estoque/Configurações
  - Verificar que CSP está no `index.html` e headers no `vite.config.ts`
  - Garantir que todos os testes passam, perguntar ao usuário se houver dúvidas.

---

## Notas

- Tarefas com `*` são opcionais e podem ser puladas para MVP mais rápido
- Cada tarefa referencia requisitos específicos para rastreabilidade
- Os testes de propriedade usam `fast-check` com `numRuns: 100, seed: 42` para reprodutibilidade em CI
- O design já foi aprovado — não alterar arquitetura sem consultar o usuário
- Itens já feitos manualmente (não incluídos): remoção do link "Área do lojista", título "Painel DH", CSS admin removido, DEPLOY.md criado
