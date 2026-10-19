import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import { formatBRL, formatDateTime } from '@/lib/format';
import { ORDER_STATUS_LABELS, type OrderLine, type OrderStatus } from '@/lib/types';
import { signOut } from '../actions';

const APPROVED: OrderStatus[] = ['aprovado', 'em_andamento', 'concluido'];

export default async function Dashboard() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from('orders')
    .select('id, code, created_at, customer_name, business_name, status, estimated_total, amount_received, items, has_quote_items')
    .order('created_at', { ascending: false })
    .limit(1000);
  const orders = data ?? [];

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const thisMonth = orders.filter((o) => new Date(o.created_at).getTime() >= monthStart);
  const open = orders.filter((o) => !APPROVED.includes(o.status) && o.status !== 'cancelado');
  const approved = orders.filter((o) => APPROVED.includes(o.status));
  const sum = (list: typeof orders, k: 'estimated_total' | 'amount_received') => list.reduce((n, o) => n + Number(o[k] || 0), 0);

  const counts = new Map<string, number>();
  for (const o of orders) {
    if (o.status === 'cancelado') continue;
    for (const l of (o.items as OrderLine[]) || []) counts.set(l.name, (counts.get(l.name) || 0) + (l.quantity || 1));
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const topMax = top[0]?.[1] || 1;

  return (
    <>
      <div className="admin-top">
        <h1>Visão geral</h1>
        <div className="btn-row">
          <Link href="/" target="_blank" className="btn btn-sm">Ver site ↗</Link>
          <form action={signOut}><button className="btn btn-sm btn-ghost">Sair</button></form>
        </div>
      </div>
      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>Não foi possível carregar os pedidos.</div>}

      <div className="stat-grid">
        <div className="stat cyan">
          <div className="k">Pedidos recebidos</div>
          <div className="v">{orders.length}</div>
          <div className="s">{thisMonth.length} neste mês</div>
        </div>
        <div className="stat">
          <div className="k">Novos (sem contato)</div>
          <div className="v">{orders.filter((o) => o.status === 'novo').length}</div>
          <div className="s">{open.length} em aberto</div>
        </div>
        <div className="stat magenta">
          <div className="k">Pedidos aprovados</div>
          <div className="v">{approved.length}</div>
          <div className="s">Estimado: {formatBRL(sum(approved, 'estimated_total'))}</div>
        </div>
        <div className="stat green">
          <div className="k">Valores recebidos</div>
          <div className="v">{formatBRL(sum(orders, 'amount_received'))}</div>
          <div className="s">Lançados manualmente em cada pedido</div>
        </div>
      </div>
      <p className="small muted" style={{ marginTop: 10 }}>
        Valor estimado dos pedidos em aberto: <strong>{formatBRL(sum(open, 'estimated_total'))}</strong>. Estimativas não são faturamento —
        só conta como recebido o que você lançar em “Valor recebido” no pedido.
      </p>

      <div className="grid grid-2" style={{ marginTop: 20 }}>
        <section className="card">
          <div className="summary-row" style={{ marginBottom: 12 }}>
            <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Pedidos recentes</h2>
            <Link href="/admin/pedidos" className="small">Ver todos</Link>
          </div>
          {orders.length === 0 ? (
            <p className="muted small">Nenhum pedido ainda.</p>
          ) : (
            <div className="list">
              {orders.slice(0, 6).map((o) => (
                <Link key={o.id} href={`/admin/pedidos/${o.id}`} className="row-card" style={{ color: 'var(--text)', textDecoration: 'none' }}>
                  <div className="row-head">
                    <strong>{o.customer_name}{o.business_name ? ` · ${o.business_name}` : ''}</strong>
                    <span className={`badge ${o.status === 'novo' ? 'badge-cyan' : ''}`}>{ORDER_STATUS_LABELS[o.status as OrderStatus]}</span>
                  </div>
                  <span className="small muted">{o.code} · {formatDateTime(o.created_at)} · {Number(o.estimated_total) > 0 ? formatBRL(Number(o.estimated_total)) : 'Sob orçamento'}</span>
                </Link>
              ))}
            </div>
          )}
        </section>
        <section className="card">
          <h2 style={{ fontSize: '1.1rem' }}>Serviços mais solicitados</h2>
          {top.length === 0 ? (
            <p className="muted small">Aparece aqui quando chegarem pedidos.</p>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {top.map(([name, n]) => (
                <div key={name}>
                  <div className="summary-row small"><span>{name}</span><strong>{n}</strong></div>
                  <div className="bar"><span style={{ width: `${(n / topMax) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
