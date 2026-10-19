import Link from 'next/link';
import { Flash } from '@/components/admin/Flash';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { requireAdmin } from '@/lib/admin-auth';
import type { PortfolioItem } from '@/lib/types';
import { deletePortfolio, movePortfolio, togglePortfolio } from '../../actions';

export default async function PortfolioAdmin({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from('portfolio_items').select('*').order('sort_order').order('created_at');
  const list = (data ?? []) as PortfolioItem[];

  return (
    <>
      <div className="admin-top">
        <h1>Portfólio</h1>
        <Link href="/admin/portfolio/novo" className="btn btn-primary btn-sm">+ Novo projeto</Link>
      </div>
      <Flash {...sp} />
      <div className="list">
        {list.map((p, i) => (
          <div key={p.id} className={`row-card ${p.published ? '' : 'inactive'}`}>
            <div className="row-head">
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.images[0] && <img src={p.images[0]} alt="" className="thumb-sm" />}
                <div>
                  <h3><Link href={`/admin/portfolio/${p.id}`}>{p.title}</Link></h3>
                  <span className="small muted">{p.category || 'Sem categoria'} · {p.images.length} imagem(ns)</span>
                </div>
              </div>
              <span className={`badge ${p.published ? 'badge-green' : ''}`}>{p.published ? 'Publicado' : 'Oculto'}</span>
            </div>
            <div className="row-actions">
              <Link href={`/admin/portfolio/${p.id}`} className="btn btn-sm">Editar</Link>
              <form action={movePortfolio}>
                <input type="hidden" name="id" value={p.id} /><input type="hidden" name="dir" value="up" />
                <SubmitButton className="btn btn-sm btn-ghost" pendingText="…">{i === 0 ? '—' : '↑ Subir'}</SubmitButton>
              </form>
              <form action={movePortfolio}>
                <input type="hidden" name="id" value={p.id} /><input type="hidden" name="dir" value="down" />
                <SubmitButton className="btn btn-sm btn-ghost" pendingText="…">{i === list.length - 1 ? '—' : '↓ Descer'}</SubmitButton>
              </form>
              <form action={togglePortfolio}>
                <input type="hidden" name="id" value={p.id} /><input type="hidden" name="value" value={String(!p.published)} />
                <SubmitButton className="btn btn-sm btn-ghost" pendingText="…">{p.published ? 'Ocultar' : 'Publicar'}</SubmitButton>
              </form>
              <form action={deletePortfolio}>
                <input type="hidden" name="id" value={p.id} />
                <SubmitButton className="btn btn-sm btn-danger" pendingText="…" confirm={`Remover "${p.title}" do portfólio?`}>Remover</SubmitButton>
              </form>
            </div>
          </div>
        ))}
        {list.length === 0 && <div className="empty-state muted">Nenhum projeto ainda.</div>}
      </div>
    </>
  );
}
