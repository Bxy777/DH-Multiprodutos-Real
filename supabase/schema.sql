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

-- Permite leitura/escrita pelo app (anon key)
alter table catalog disable row level security;

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
