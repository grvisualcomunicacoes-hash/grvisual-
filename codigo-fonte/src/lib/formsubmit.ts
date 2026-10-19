import { formatBRL } from './format';
import type { CustomerInput, OrderLine } from './types';

/**
 * Envio real do pedido por e-mail usando o FormSubmit (formsubmit.co):
 * não precisa de servidor nem de chave secreta.
 * Na PRIMEIRA vez, o FormSubmit manda um e-mail de ativação para o endereço
 * comercial; depois de clicar em "Activate", os pedidos passam a chegar.
 */
export interface OrderEmail {
  to: string;
  code: string;
  customer: CustomerInput;
  lines: OrderLine[];
  estimatedTotal: number;
  hasQuoteItems: boolean;
  sendMethod: 'whatsapp' | 'email';
  honeypot?: string;
}

const CHANNEL: Record<string, string> = { whatsapp: 'WhatsApp', email: 'E-mail', ligacao: 'Ligação' };

export function buildFormSubmitPayload(o: OrderEmail): Record<string, string> {
  const c = o.customer;
  const services = o.lines.length
    ? o.lines
        .map((l, i) => `${i + 1}. ${l.name} — ${l.unit_price === null ? 'sob orçamento' : `${l.quantity} x ${formatBRL(l.unit_price)} = ${formatBRL(l.subtotal)}`}${l.needs_ad_budget ? ' (verba de anúncios à parte)' : ''}${l.notes ? ` | Obs.: ${l.notes}` : ''}`)
        .join('\n')
    : 'Orçamento personalizado (nenhum pacote selecionado)';
  const total = o.estimatedTotal > 0 ? `${formatBRL(o.estimatedTotal)}${o.hasQuoteItems ? ' + itens sob orçamento' : ''}` : o.hasQuoteItems ? 'A definir no orçamento' : '—';
  const payload: Record<string, string> = {
    _subject: `Novo pedido ${o.code} — ${c.name}`,
    _template: 'table',
    _captcha: 'false',
    Pedido: o.code,
    'Cliente escolheu enviar por': o.sendMethod === 'email' ? 'E-mail' : 'WhatsApp',
    Nome: c.name,
    Empresa: c.business || '—',
    WhatsApp: c.whatsapp,
    'E-mail': c.email || '—',
    Cidade: c.city,
    'Prefere retorno por': CHANNEL[c.contactChannel] ?? c.contactChannel,
    Serviços: services,
    'Total estimado': total,
    Objetivo: c.objective || '—',
    Observações: c.projectNotes || '—',
    Aviso: 'Pedido de orçamento: ainda não é uma venda confirmada.',
  };
  if (c.email) payload._replyto = c.email;
  if (o.honeypot) payload._honey = o.honeypot;
  return payload;
}

export async function sendOrderEmail(o: OrderEmail): Promise<{ ok: boolean; reason?: string }> {
  if (!o.to || !o.to.includes('@')) return { ok: false, reason: 'E-mail comercial não configurado.' };
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(o.to)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(buildFormSubmitPayload(o)),
    });
    const json = await res.json().catch(() => ({}));
    const ok = res.ok && (json.success === true || json.success === 'true');
    return ok ? { ok: true } : { ok: false, reason: String(json.message || `Erro ${res.status}`) };
  } catch {
    return { ok: false, reason: 'Sem conexão com o serviço de e-mail.' };
  }
}
