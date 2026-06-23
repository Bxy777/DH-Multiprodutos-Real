-- Catálogo compartilhado (uma linha com JSON completo)
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

-- Sincronização em tempo real entre dispositivos
alter publication supabase_realtime add table catalog;
