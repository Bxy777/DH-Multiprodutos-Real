-- Catálogo compartilhado (uma linha com JSON completo)
-- Pode rodar mais de uma vez sem erro.

create table if not exists catalog (
  id integer primary key default 1 check (id = 1),
  data jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

insert into catalog (id, data)
values (1, '[]'::jsonb)
on conflict (id) do nothing;

-- ── Permissões (RLS) ─────────────────────────────────────────────
-- O app usa a chave anon no navegador; sem estas policies o save falha.

alter table catalog enable row level security;

drop policy if exists "catalog_public_all" on catalog;
drop policy if exists "catalog_public_read" on catalog;
drop policy if exists "catalog_public_insert" on catalog;
drop policy if exists "catalog_public_update" on catalog;

create policy "catalog_public_all"
  on catalog
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- Realtime: só adiciona se ainda não estiver na publicação
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'catalog'
  ) then
    alter publication supabase_realtime add table catalog;
  end if;
end $$;
