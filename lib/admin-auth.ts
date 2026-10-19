import { redirect } from 'next/navigation';
import { getAdminUser } from './supabase/server';

/** Garante que quem chama é administradora. Usado em todas as ações do painel. */
export async function requireAdmin() {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user) redirect('/admin/login');
  if (!isAdmin) throw new Error('Acesso negado: este usuário não é administrador.');
  return { supabase, user };
}
