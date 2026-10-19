-- PARTE 1 DE 6: cole numa query nova e clique em Run

-- =====================================================================
-- GR Visual Comunicações — estrutura do banco (Supabase / PostgreSQL)
-- Como usar: Supabase → SQL Editor → New query → cole TUDO → Run.
-- Depois rode o arquivo seed.sql (conteúdo inicial).
-- Pode ser executado novamente sem apagar dados (usa IF NOT EXISTS).
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Administradores: só quem estiver nesta tabela acessa o painel.
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Função usada pelas regras de acesso. SECURITY DEFINER para poder ler
-- a tabela admins sem expor o conteúdo dela.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Atualiza a coluna updated_at automaticamente
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Pacotes e serviços
-- ---------------------------------------------------------------------
create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{1,80}$'),
  name text not null check (char_length(name) between 2 and 120),
  category text not null default 'outros',
  price numeric(10,2) check (price is null or price >= 0),
  promo_price numeric(10,2) check (promo_price is null or promo_price >= 0),
  pricing_mode text not null default 'fixo' check (pricing_mode in ('fixo', 'orcamento')),
  allow_quantity boolean not null default false,
  max_quantity int not null default 1 check (max_quantity between 1 and 99),
  description text not null default '',
  includes text[] not null default '{}',
  excludes text[] not null default '{}',
  duration text not null default '',
  deliverables text not null default '',
  needs_ad_budget boolean not null default false,
  start_estimate text not null default '',
  image_url text not null default '',
  active boolean not null default true,
  featured boolean not null default false,
  sort_order int not null default 100,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists packages_touch on public.packages;
create trigger packages_touch before update on public.packages
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- Portfólio
-- ---------------------------------------------------------------------
create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{1,80}$'),
  title text not null check (char_length(title) between 2 and 160),
  client_name text not null default '',
  category text not null default '',
  description text not null default '',
  highlights text[] not null default '{}',
  services text[] not null default '{}',
  images text[] not null default '{}',
  published boolean not null default true,
  sort_order int not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists portfolio_touch on public.portfolio_items;
create trigger portfolio_touch before update on public.portfolio_items
  for each row execute function public.touch_updated_at();
