import Link from 'next/link';
import { Flash } from '@/components/admin/Flash';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { requireAdmin } from '@/lib/admin-auth';
import { categoryLabel } from '@/lib/categories';
import { normalizePackage } from '@/lib/data';
import { formatBRL } from '@/lib/format';
import { deletePackage, duplicatePackage, togglePackage } from '../../actions';

type SP = Promise<{ ok?: string; erro?: string }>;

export default async function PacotesAdmin({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from('packages').select('*').order('sort_order').order('name');
  const list = (data ?? []).map(normalizePackage);

  return (
    <>
      <div className="admin-top">
        <h1>Pacotes e serviços</h1>
        <Link href="/admin/pacotes/novo" className="btn btn-primary btn-sm">+ Novo pacote</Link>
      </div>
      <Flash {...sp} />
      <p className="small muted">Ordem de exibição: número menor aparece primeiro. Pacotes inativos não aparecem no site.</p>
      <div className="list">
        {list.map((p) => (
          <div key={p.id} className={`row-card ${p.active ? '' : 'inactive'}`}>
            <div className="row-head">
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.image_url && <img src={p.image_url} alt="" className="thumb-sm" />}
                <div>
                  <h3><Link href={`/admin/pacotes/${p.id}`}>{p.name}</Link></h3>
                  <span className="small muted">
                    #{p.sort_order} · {categoryLabel(p.category)} ·{' '}
                    {p.pricing_mode === 'orcamento' ? 'Sob orçamento' : formatBRL(p.promo_price ?? p.price)}
                    {p.promo_price !== null && p.price !== null && <> (de {formatBRL(p.price)})</>}
                  </span>
                </div>
              </div>
              <div className="meta-list" style={{ justifyContent: 'flex-end' }}>
                {p.featured && <span className="badge badge-magenta">Destaque</span>}
                <span className={`badge ${p.active ? 'badge-green' : ''}`}>{p.active ? 'Ativo' : 'Inativo'}</span>
              </div>
            </div>
            <div className="row-actions">
              <Link href={`/admin/pacotes/${p.id}`} className="btn btn-sm">Editar</Link>
              <form action={togglePackage}>
                <input type="hidden" name="id" value={p.id} /><input type="hidden" name="field" value="active" /><input type="hidden" name="value" value={String(!p.active)} />
                <SubmitButton className="btn btn-sm btn-ghost" pendingText="…">{p.active ? 'Desativar' : 'Ativar'}</SubmitButton>
              </form>
              <form action={togglePackage}>
                <input type="hidden" name="id" value={p.id} /><input type="hidden" name="field" value="featured" /><input type="hidden" name="value" value={String(!p.featured)} />
                <SubmitButton className="btn btn-sm btn-ghost" pendingText="…">{p.featured ? 'Tirar destaque' : 'Destacar'}</SubmitButton>
              </form>
              <form action={duplicatePackage}>
                <input type="hidden" name="id" value={p.id} />
                <SubmitButton className="btn btn-sm btn-ghost" pendingText="…">Duplicar</SubmitButton>
              </form>
              <form action={deletePackage}>
                <input type="hidden" name="id" value={p.id} />
                <SubmitButton className="btn btn-sm btn-danger" pendingText="…" confirm={`Excluir "${p.name}" definitivamente?`}>Excluir</SubmitButton>
              </form>
            </div>
          </div>
        ))}
        {list.length === 0 && <div className="empty-state muted">Nenhum pacote. Rode o seed.sql ou crie o primeiro.</div>}
      </div>
    </>
  );
}
