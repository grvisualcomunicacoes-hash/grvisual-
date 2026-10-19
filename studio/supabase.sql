-- GR Visual Studio IA — estrutura do banco de dados (Supabase / PostgreSQL)
-- Cole tudo no SQL Editor do Supabase e clique em RUN. Pode rodar mais de uma vez sem problema.

create table if not exists public.registros (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  colecao text not null,          -- clientes, conteudos, financeiro, tarefas, pacotes, tia, criacoes
  id text not null,
  dados jsonb not null default '{}'::jsonb,
  atualizado_em timestamptz not null default now(),
  primary key (user_id, colecao, id)
);

create index if not exists registros_colecao_idx on public.registros (user_id, colecao);

-- Segurança: cada conta só enxerga e altera os próprios registros.
alter table public.registros enable row level security;

drop policy if exists "dono le" on public.registros;
drop policy if exists "dono insere" on public.registros;
drop policy if exists "dono altera" on public.registros;
drop policy if exists "dono exclui" on public.registros;

create policy "dono le"     on public.registros for select using (auth.uid() = user_id);
create policy "dono insere" on public.registros for insert with check (auth.uid() = user_id);
create policy "dono altera" on public.registros for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "dono exclui" on public.registros for delete using (auth.uid() = user_id);

revoke all on public.registros from anon;
grant select, insert, update, delete on public.registros to authenticated;
