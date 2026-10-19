import Link from 'next/link';
import { Flash } from '@/components/admin/Flash';
import { requireAdmin } from '@/lib/admin-auth';
import { formatBRL, formatDateTime } from '@/lib/format';
import { ORDER_STATUSES, ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/types';

type SP = Promise<{ status?: string; de?: string; ate?: string; q?: string; ok?: string; erro?: string }>;

export default async function PedidosAdmin({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();

  let query = supabase
    .from('orders')
    .select('id, code, created_at, customer_name, business_name, whatsapp, city, status, estimated_total, has_quote_items, send_method, email_status')
    .order('created_at', { ascending: false })
    .limit(300);
  if (sp.status && (ORDER_STATUSES as readonly string[]).includes(sp.status)) query = query.eq('status', sp.status);
  if (sp.de && /^\d{4}-\d{2}-\d{2}$/.test(sp.de)) query = query.gte('created_at', `${sp.de}T00:00:00-03:00`);
  if (sp.ate && /^\d{4}-\d{2}-\d{2}$/.test(sp.ate)) query = query.lte('created_at', `${sp.ate}T23:59:59-03:00`);
  const q = (sp.q || '').replace(/[%,()*\\]/g, ' ').trim().slice(0, 60);
  if (q) query = query.or(`customer_name.ilike.%${q}%,business_name.ilike.%${q}%,code.ilike.%${q}%`);

  const { data, error } = await query;
  const orders = data ?? [];
  const exportParams = new URLSearchParams(Object.entries({ status: sp.status, de: sp.de, ate: sp.ate, q: sp.q }).filter(([, v]) => v) as [string, string][]);

  return (
    <>
      <div className="admin-top">
        <h1>Pedidos</h1>
        <a href={`/admin/pedidos/exportar?${exportParams}`} className="btn btn-sm">Exportar CSV</a>
      </div>
      <Flash ok={sp.ok} erro={sp.erro} />
      <form className="filters card" method="get" style={{ marginBottom: 16 }}>
        <div className="field full">
          <label htmlFor="q" className="small">Buscar cliente ou código</label>
          <input id="q" name="q" className="input" defaultValue={sp.q} placeholder="Nome, empresa ou GR-…" />
        </div>
        <div className="field full">
          <label htmlFor="status" className="small">Status</label>
          <select id="status" name="status" className="select input" defaultValue={sp.status || ''}>
            <option value="">Todos</option>
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="de" className="small">De</label>
          <input id="de" name="de" type="date" className="input" defaultValue={sp.de} />
        </div>
        <div className="field">
          <label htmlFor="ate" className="small">Até</label>
          <input id="ate" name="ate" type="date" className="input" defaultValue={sp.ate} />
        </div>
        <div className="btn-row full">
          <button className="btn btn-primary btn-sm">Filtrar</button>
          <Link href="/admin/pedidos" className="btn btn-ghost btn-sm">Limpar</Link>
        </div>
      </form>
      {error && <div className="alert alert-error">Não foi possível carregar os pedidos.</div>}
      <p className="small muted">{orders.length} pedido(s){orders.length === 300 ? ' (mostrando os 300 mais recentes)' : ''}</p>
      <div className="list">
        {orders.map((o) => (
          <Link key={o.id} href={`/admin/pedidos/${o.id}`} className="row-card" style={{ color: 'var(--text)', textDecoration: 'none' }}>
            <div className="row-head">
              <div>
                <strong>{o.customer_name}</strong>{o.business_name && <span className="muted"> · {o.business_name}</span>}
                <div className="small muted">{o.code} · {formatDateTime(o.created_at)} · {o.city}</div>
              </div>
              <span className={`badge ${o.status === 'novo' ? 'badge-cyan' : o.status === 'cancelado' ? 'badge-red' : ['aprovado', 'em_andamento', 'concluido'].includes(o.status) ? 'badge-green' : ''}`}>
                {ORDER_STATUS_LABELS[o.status as OrderStatus]}
              </span>
            </div>
            <div className="small">
              Estimado: <strong>{Number(o.estimated_total) > 0 ? formatBRL(Number(o.estimated_total)) : 'Sob orçamento'}</strong>
              {o.has_quote_items && Number(o.estimated_total) > 0 && ' + orçamento'} · enviado por {o.send_method === 'email' ? 'e-mail' : 'WhatsApp'}
            </div>
          </Link>
        ))}
        {orders.length === 0 && <div className="empty-state muted">Nenhum pedido encontrado.</div>}
      </div>
    </>
  );
}
