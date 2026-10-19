-- =====================================================================
-- Liberar acesso ao painel /admin
-- 1) Supabase → Authentication → Users → "Add user" → "Create new user"
--    Use seu e-mail e uma senha forte (marque "Auto Confirm User").
-- 2) Troque o e-mail abaixo se for outro e rode este arquivo no SQL Editor.
-- =====================================================================
insert into public.admins (user_id)
select id from auth.users where email = 'grvisualcomunicacoes@gmail.com'
on conflict (user_id) do nothing;

-- Conferir: deve aparecer 1 linha
select a.user_id, u.email from public.admins a join auth.users u on u.id = a.user_id;
