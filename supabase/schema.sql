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

-- ---------------------------------------------------------------------
-- Perguntas frequentes
-- ---------------------------------------------------------------------
create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null check (char_length(question) between 3 and 300),
  answer text not null default '',
  sort_order int not null default 100,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Conteúdo do site (textos, contatos, avisos...) — uma única linha
-- ---------------------------------------------------------------------
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

drop trigger if exists settings_touch on public.site_settings;
create trigger settings_touch before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- Pedidos / solicitações de orçamento
-- ---------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  customer_name text not null,
  business_name text not null default '',
  whatsapp text not null,
  email text not null default '',
  city text not null default '',
  objective text not null default '',
  project_notes text not null default '',
  contact_channel text not null default 'whatsapp' check (contact_channel in ('whatsapp', 'email', 'ligacao')),
  privacy_accepted_at timestamptz not null,
  send_method text not null default 'whatsapp' check (send_method in ('whatsapp', 'email')),
  email_status text not null default 'nao_configurado' check (email_status in ('nao_configurado', 'enviado', 'falhou')),
  items jsonb not null default '[]'::jsonb,
  estimated_total numeric(10,2) not null default 0,
  has_quote_items boolean not null default false,
  status text not null default 'novo' check (status in (
    'novo', 'aguardando_contato', 'orcamento_enviado', 'aguardando_aprovacao',
    'aprovado', 'em_andamento', 'concluido', 'cancelado')),
  internal_notes text not null default '',
  amount_received numeric(10,2) not null default 0 check (amount_received >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_created_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

-- Permissões básicas da API (as regras de RLS abaixo continuam limitando o acesso)
grant usage on schema public to anon, authenticated, service_role;
grant select on public.packages, public.portfolio_items, public.faqs, public.site_settings to anon, authenticated;
grant insert, update, delete on public.packages, public.portfolio_items, public.faqs, public.site_settings to authenticated;
grant select, insert, update, delete on public.orders to authenticated;
grant select on public.admins to authenticated;
grant all on all tables in schema public to service_role;

-- =====================================================================
-- REGRAS DE ACESSO (Row Level Security)
-- Visitantes: só leem o que está ativo/publicado. Não leem pedidos.
-- Pedidos são gravados pelo servidor do site (chave service_role),
-- depois de validados e com preços conferidos no banco.
-- Administradores: acesso completo.
-- =====================================================================
alter table public.admins enable row level security;
alter table public.packages enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.faqs enable row level security;
alter table public.site_settings enable row level security;
alter table public.orders enable row level security;

drop policy if exists "admins_self" on public.admins;
create policy "admins_self" on public.admins for select to authenticated using (user_id = auth.uid());

drop policy if exists "packages_public_read" on public.packages;
create policy "packages_public_read" on public.packages for select to anon, authenticated using (active or public.is_admin());
drop policy if exists "packages_admin_write" on public.packages;
create policy "packages_admin_write" on public.packages for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "portfolio_public_read" on public.portfolio_items;
create policy "portfolio_public_read" on public.portfolio_items for select to anon, authenticated using (published or public.is_admin());
drop policy if exists "portfolio_admin_write" on public.portfolio_items;
create policy "portfolio_admin_write" on public.portfolio_items for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "faqs_public_read" on public.faqs;
create policy "faqs_public_read" on public.faqs for select to anon, authenticated using (active or public.is_admin());
drop policy if exists "faqs_admin_write" on public.faqs;
create policy "faqs_admin_write" on public.faqs for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "settings_public_read" on public.site_settings;
create policy "settings_public_read" on public.site_settings for select to anon, authenticated using (true);
drop policy if exists "settings_admin_write" on public.site_settings;
create policy "settings_admin_write" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Pedidos: NENHUMA regra para visitantes → visitantes não leem nem gravam diretamente.
drop policy if exists "orders_admin_all" on public.orders;
create policy "orders_admin_all" on public.orders for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- ARMAZENAMENTO DE IMAGENS (bucket "media", leitura pública)
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'])
on conflict (id) do update set public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read" on storage.objects for select to anon, authenticated using (bucket_id = 'media');
drop policy if exists "media_admin_insert" on storage.objects;
create policy "media_admin_insert" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "media_admin_update" on storage.objects;
create policy "media_admin_update" on storage.objects for update to authenticated using (bucket_id = 'media' and public.is_admin());
drop policy if exists "media_admin_delete" on storage.objects;
create policy "media_admin_delete" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_admin());
