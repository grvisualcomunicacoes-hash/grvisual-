-- PARTE 3 DE 6: cole numa query nova e clique em Run

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
