-- PARTE 2 DE 6: cole numa query nova e clique em Run

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
