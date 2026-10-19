import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AdminNav } from '@/components/admin/AdminNav';
import { isSupabaseConfigured } from '@/lib/env';
import { getAdminUser } from '@/lib/supabase/server';
import { signOut } from '../actions';

export const dynamic = 'force-dynamic';

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) redirect('/admin/login');
  const { user, isAdmin } = await getAdminUser();
  if (!user) redirect('/admin/login');

  if (!isAdmin) {
    return (
      <main className="login-wrap">
        <div className="card login-card">
          <h1 style={{ fontSize: '1.3rem' }}>Acesso não autorizado</h1>
          <p className="muted">O usuário <strong>{user.email}</strong> entrou, mas não está cadastrado como administrador. Rode o arquivo <code>supabase/admin.sql</code> com este e-mail.</p>
          <form action={signOut}><button className="btn btn-block">Sair</button></form>
        </div>
      </main>
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <Link href="/admin" className="brand" style={{ marginBottom: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/gr-mark.png" alt="" width={44} height={24} />
          <span className="brand-text"><span className="brand-name">PAINEL</span><span className="brand-sub">GR VISUAL</span></span>
        </Link>
        <AdminNav variant="side" />
        <div style={{ marginTop: 'auto', display: 'grid', gap: 8 }}>
          <Link href="/" target="_blank">Ver site ↗</Link>
          <span className="small muted" style={{ padding: '0 12px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</span>
          <form action={signOut}><button className="btn btn-sm btn-block">Sair</button></form>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
      <nav className="admin-bottom-nav" aria-label="Painel">
        <AdminNav variant="bottom" />
      </nav>
    </div>
  );
}
