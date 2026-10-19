import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Flash } from '@/components/admin/Flash';
import { SubmitButton } from '@/components/admin/SubmitButton';
import { requireAdmin } from '@/lib/admin-auth';
import { formatBRL, formatDateTime } from '@/lib/format';
import { ORDER_STATUSES, ORDER_STATUS_LABELS, type Order } from '@/lib/types';
import { deleteOrder, updateOrder } from '../../../actions';

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; erro?: string }> };

const CHANNEL: Record<string, string> = { whatsapp: 'WhatsApp', email: 'E-mail', ligacao: 'Ligação' };
const EMAIL: Record<string, string> = { enviado: 'E-mail de aviso enviado', falhou: 'Falha no e-mail de aviso', nao_configurado: 'E-mail não configurado' };

export default async function PedidoDetalhe({ params, searchParams }: Props) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from('orders').select('*').eq('id', id).maybeSingle();
  if (!data) notFound();
  const o = data as Order;
  const phone = o.whatsapp.replace(/\D/g, '');
  const waPhone = phone.length <= 11 ? `55${phone}` : phone;
  const hello = encodeURIComponent(`Olá, ${o.customer_name.split(' ')[0]}! Aqui é da GR Visual Comunicações, sobre o seu pedido ${o.code}.`);

  return (
    <>
      <div className="admin-top">
        <div>
          <div className="small muted">{o.code}</div>
          <h1>{o.customer_name}</h1>
        </div>
        <Link href="/admin/pedidos" className="btn btn-sm btn-ghost">← Pedidos</Link>
      </div>
      <Flash {...sp} />
      <div className="detail-layout">
        <div style={{ display: 'grid', gap: 16 }}>
          <section className="card">
            <h2 style={{ fontSize: '1.1rem' }}>Cliente</h2>
            <dl style={{ display: 'grid', gap: 6, margin: 0 }}>
              {[
                ['Empresa', o.business_name],
                ['WhatsApp', o.whatsapp],
                ['E-mail', o.email],
                ['Cidade', o.city],
                ['Prefere retorno por', CHANNEL[o.contact_channel] ?? o.contact_channel],
                ['Recebido em', formatDateTime(o.created_at)],
                ['Enviado por', `${o.send_method === 'email' ? 'E-mail' : 'WhatsApp'} · ${EMAIL[o.email_status] ?? ''}`],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="summary-row small"><dt className="muted">{k}</dt><dd style={{ margin: 0, textAlign: 'right' }}>{v}</dd></div>
              ))}
            </dl>
            <div className="btn-row" style={{ marginTop: 14 }}>
              <a className="btn btn-whatsapp btn-sm" href={`https://wa.me/${waPhone}?text=${hello}`} target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a>
              {o.email && <a className="btn btn-sm" href={`mailto:${o.email}?subject=${encodeURIComponent(`Seu pedido ${o.code} — GR Visual`)}`}>Enviar e-mail</a>}
            </div>
          </section>

          <section className="card">
            <h2 style={{ fontSize: '1.1rem' }}>Itens</h2>
            {o.items.length === 0 ? (
              <p className="muted small">Orçamento personalizado — nenhum pacote selecionado.</p>
            ) : (
              <div className="table-wrap">
                <table className="simple">
                  <thead><tr><th>Serviço</th><th>Qtd.</th><th>Unit.</th><th>Subtotal</th></tr></thead>
                  <tbody>
                    {o.items.map((l, i) => (
                      <tr key={i}>
                        <td>{l.name}{l.needs_ad_budget && <div className="small muted">Verba de anúncios à parte</div>}{l.notes && <div className="small">Obs.: {l.notes}</div>}</td>
                        <td>{l.quantity}</td>
                        <td>{l.unit_price === null ? 'Orçamento' : formatBRL(l.unit_price)}</td>
                        <td>{l.subtotal === null ? '—' : formatBRL(l.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p style={{ marginTop: 12, marginBottom: 0 }}>
              <strong>Total estimado: {Number(o.estimated_total) > 0 ? formatBRL(Number(o.estimated_total)) : 'A definir'}</strong>
              {o.has_quote_items && Number(o.estimated_total) > 0 && ' + itens sob orçamento'}
            </p>
          </section>

          {(o.objective || o.project_notes) && (
            <section className="card">
              {o.objective && (<><h2 style={{ fontSize: '1.1rem' }}>Objetivo</h2><p className="muted" style={{ whiteSpace: 'pre-wrap' }}>{o.objective}</p></>)}
              {o.project_notes && (<><h2 style={{ fontSize: '1.1rem' }}>Observações</h2><p className="muted" style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{o.project_notes}</p></>)}
            </section>
          )}
        </div>

        <aside style={{ display: 'grid', gap: 16 }}>
          <form action={updateOrder} className="card form">
            <input type="hidden" name="id" value={o.id} />
            <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Andamento</h2>
            <div className="field">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" className="select input" defaultValue={o.status}>
                {ORDER_STATUSES.map((s) => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="amount_received">Valor efetivamente recebido (R$)</label>
              <input id="amount_received" name="amount_received" className="input" inputMode="decimal" defaultValue={Number(o.amount_received) ? Number(o.amount_received).toFixed(2).replace('.', ',') : ''} placeholder="0,00" />
              <span className="hint">Só o que já entrou de verdade. Usado no painel como “valores recebidos”.</span>
            </div>
            <div className="field">
              <label htmlFor="internal_notes">Anotações internas</label>
              <textarea id="internal_notes" name="internal_notes" className="textarea" defaultValue={o.internal_notes} placeholder="Visível só para você" />
            </div>
            <SubmitButton>Salvar</SubmitButton>
            <span className="small muted">Última atualização: {formatDateTime(o.updated_at)}</span>
          </form>
          <form action={deleteOrder}>
            <input type="hidden" name="id" value={o.id} />
            <SubmitButton className="btn btn-danger btn-sm btn-block" pendingText="Excluindo…" confirm="Excluir este pedido definitivamente? (Para desistências, prefira o status Cancelado.)">
              Excluir pedido
            </SubmitButton>
          </form>
        </aside>
      </div>
    </>
  );
}
