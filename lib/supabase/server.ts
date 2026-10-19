import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../env';

/** Cliente com a sessão do usuário logado (painel). Respeita RLS. */
export async function serverClient() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet) {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Chamado a partir de um Server Component: o middleware cuida da renovação.
        }
      },
    },
  });
}

/** Retorna o usuário somente se ele estiver na tabela de administradores. */
export async function getAdminUser() {
  const supabase = await serverClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, isAdmin: false };
  const { data: isAdmin } = await supabase.rpc('is_admin');
  return { supabase, user, isAdmin: isAdmin === true };
}
