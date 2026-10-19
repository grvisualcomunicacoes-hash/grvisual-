import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, isSupabaseConfigured, serviceRoleKey } from '../env';

/**
 * Cliente com a chave service_role. USE SOMENTE EM CÓDIGO DE SERVIDOR
 * (rotas /api e server actions). Ignora RLS, por isso só grava pedidos
 * depois de validar tudo no servidor.
 */
export function serviceClient() {
  const key = serviceRoleKey();
  if (typeof window !== 'undefined') throw new Error('serviceClient não pode rodar no navegador');
  if (!isSupabaseConfigured() || !key) return null;
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
