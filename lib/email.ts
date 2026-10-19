import { emailConfig, SITE_URL } from './env';
import { formatBRL } from './format';
import type { CustomerInput, OrderLine } from './types';
import { escapeHtml } from './validation';

export interface OrderEmailInput {
  code: string;
  customer: CustomerInput;
  lines: OrderLine[];
  estimatedTotal: number;
  hasQuoteItems: boolean;
  sendMethod: 'whatsapp' | 'email';
}

export type EmailResult = { status: 'enviado' } | { status: 'nao_configurado' } | { status: 'falhou'; error: string };

const CHANNEL: Record<string, string> = { whatsapp: 'WhatsApp', email: 'E-mail', ligacao: 'Ligação' };

export function buildOrderEmail(o: OrderEmailInput) {
  const e = escapeHtml;
  const c = o.customer;
  const rows = o.lines
    .map((l) => {
      const price = l.unit_price === null ? 'Sob orçamento' : `${l.quantity} × ${formatBRL(l.unit_price)} = <b>${formatBRL(l.subtotal)}</b>`;
      return `<tr>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb">${e(l.name)}${l.needs_ad_budget ? '<br><small style="color:#6b7280">Verba de anúncios à parte</small>' : ''}${l.notes ? `<br><small>Obs.: ${e(l.notes)}</small>` : ''}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;white-space:nowrap">${price}</td>
      </tr>`;
    })
    .join('');

  const total =
    o.estimatedTotal > 0
      ? `${formatBRL(o.estimatedTotal)}${o.hasQuoteItems ? ' + itens sob orçamento' : ''}`
      : o.hasQuoteItems
        ? 'A definir no orçamento'
        : '—';

  const field = (label: string, value: string) =>
    value ? `<tr><td style="padding:4px 8px;color:#6b7280">${label}</td><td style="padding:4px 8px">${e(value)}</td></tr>` : '';

  const html = `<!doctype html><html><body style="font-family:Arial,Helvetica,sans-serif;color:#111827;background:#f3f4f6;padding:16px">
  <div style="max-width:620px;margin:auto;background:#fff;border-radius:12px;overflow:hidden">
    <div style="background:#070b1f;color:#fff;padding:20px">
      <div style="font-size:12px;letter-spacing:2px;color:#22d3ee">GR VISUAL COMUNICAÇÕES</div>
      <h1 style="margin:6px 0 0;font-size:20px">Novo pedido ${e(o.code)}</h1>
      <div style="font-size:13px;color:#cbd5e1">Enviado pelo site — ${o.sendMethod === 'email' ? 'cliente escolheu e-mail' : 'cliente escolheu WhatsApp'}</div>
    </div>
    <div style="padding:20px">
      <h2 style="font-size:15px;margin:0 0 8px">Cliente</h2>
      <table style="font-size:14px;border-collapse:collapse">
        ${field('Nome', c.name)}${field('Empresa', c.business)}${field('WhatsApp', c.whatsapp)}${field('E-mail', c.email)}${field('Cidade', c.city)}${field('Retorno por', CHANNEL[c.contactChannel] ?? c.contactChannel)}
      </table>
      <h2 style="font-size:15px;margin:20px 0 8px">Serviços</h2>
      ${o.lines.length ? `<table style="width:100%;font-size:14px;border-collapse:collapse">${rows}</table>` : '<p style="font-size:14px">Orçamento personalizado (nenhum pacote selecionado).</p>'}
      <p style="font-size:15px"><b>Total estimado:</b> ${total}</p>
      ${c.objective ? `<h2 style="font-size:15px;margin:20px 0 8px">Objetivo</h2><p style="font-size:14px;white-space:pre-wrap">${e(c.objective)}</p>` : ''}
      ${c.projectNotes ? `<h2 style="font-size:15px;margin:20px 0 8px">Observações</h2><p style="font-size:14px;white-space:pre-wrap">${e(c.projectNotes)}</p>` : ''}
      <p style="margin-top:24px"><a href="${SITE_URL}/admin/pedidos" style="background:#06b6d4;color:#00111a;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:bold">Abrir no painel</a></p>
      <p style="font-size:12px;color:#6b7280">Este é um pedido de orçamento: ainda não é uma venda confirmada.</p>
    </div>
  </div></body></html>`;

  const text = [
    `Novo pedido ${o.code} — GR Visual Comunicações`,
    `Cliente: ${c.name}${c.business ? ` (${c.business})` : ''}`,
    `WhatsApp: ${c.whatsapp}${c.email ? ` | E-mail: ${c.email}` : ''} | Cidade: ${c.city}`,
    `Retorno por: ${CHANNEL[c.contactChannel] ?? c.contactChannel}`,
    '',
    ...o.lines.map((l) => `- ${l.name}: ${l.unit_price === null ? 'sob orçamento' : `${l.quantity} x ${formatBRL(l.unit_price)} = ${formatBRL(l.subtotal)}`}${l.notes ? ` (obs.: ${l.notes})` : ''}`),
    `Total estimado: ${total}`,
    c.objective ? `\nObjetivo: ${c.objective}` : '',
    c.projectNotes ? `\nObservações: ${c.projectNotes}` : '',
  ].join('\n');

  return { subject: `Novo pedido ${o.code} — ${c.name}`, html, text };
}

/** Envio real via API do Resend (https://resend.com). A chave fica só no servidor. */
export async function sendOrderEmail(o: OrderEmailInput): Promise<EmailResult> {
  const cfg = emailConfig();
  if (!cfg.apiKey) return { status: 'nao_configurado' };
  const { subject, html, text } = buildOrderEmail(o);
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${cfg.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: cfg.from,
        to: [cfg.to],
        reply_to: o.customer.email || undefined,
        subject,
        html,
        text,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { status: 'falhou', error: `Resend ${res.status}: ${body.slice(0, 200)}` };
    }
    return { status: 'enviado' };
  } catch (err) {
    return { status: 'falhou', error: err instanceof Error ? err.message : 'erro desconhecido' };
  }
}
