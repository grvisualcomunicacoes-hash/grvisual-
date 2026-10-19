import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Protege tudo em /admin: sem login → vai para /admin/login.
 * (A verificação de "é administradora?" acontece também no layout do painel
 * e no banco, pelas regras de RLS.)
 */
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const path = request.nextUrl.pathname;
  const isLogin = path.startsWith('/admin/login');
  const isPublic = isLogin || path.startsWith('/admin/redefinir-senha');

  if (!url || !key) {
    if (isPublic) return NextResponse.next();
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(toSet) {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublic) {
    const login = new URL('/admin/login', request.url);
    return NextResponse.redirect(login);
  }
  if (user && isLogin) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }
  return response;
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
