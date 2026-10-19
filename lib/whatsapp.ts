import { formatBRL } from './format';
import type { CustomerInput, OrderLine } from './types';

const CHANNEL_LABEL: Record<CustomerInput['contactChannel'], string> = {
  whatsapp: 'WhatsApp',
  email: 'E-mail',
  ligacao: 'Ligação',
};

export interface WhatsAppMessageInput {
  code?: string | null;
  customer: CustomerInput;
  lines: OrderLine[];
  estimatedTotal: number;
  hasQuoteItems: boolean;
}

/** Mensagem organizada para o WhatsApp (usa *negrito* do próprio WhatsApp). */
export function buildWhatsAppMessage(input: WhatsAppMessageInput): string {
  const { code, customer, lines, estimatedTotal, hasQuoteItems } = input;
  const out: string[] = [];

  out.push('*GR Visual Comunicações — Solicitação pelo site*');
  if (code) out.push(`Pedido: *${code}*`);
  out.push('');
  out.push('*Cliente*');
  out.push(`Nome: ${customer.name}`);
  if (customer.business) out.push(`Empresa/negócio: ${customer.business}`);
  out.push(`WhatsApp: ${customer.whatsapp}`);
  if (customer.email) out.push(`E-mail: ${customer.email}`);
  out.push(`Cidade: ${customer.city}`);
  out.push(`Prefere retorno por: ${CHANNEL_LABEL[customer.contactChannel]}`);

  out.push('');
  if (lines.length === 0) {
    out.push('*Serviço:* orçamento personalizado');
  } else {
    out.push('*Serviços selecionados*');
    lines.forEach((l, i) => {
      if (l.pricing_mode === 'orcamento' || l.unit_price === null) {
        out.push(`${i + 1}. ${l.name} — sob orçamento`);
      } else {
        out.push(`${i + 1}. ${l.name} — ${l.quantity} x ${formatBRL(l.unit_price)} = ${formatBRL(l.subtotal)}`);
      }
      if (l.needs_ad_budget) out.push('   (verba de anúncios à parte)');
      if (l.notes) out.push(`   Obs.: ${l.notes}`);
    });
    out.push('');
    if (estimatedTotal > 0) {
      out.push(`*Total estimado: ${formatBRL(estimatedTotal)}*${hasQuoteItems ? ' + itens sob orçamento' : ''}`);
    } else if (hasQuoteItems) {
      out.push('*Total:* a definir no orçamento');
    }
  }

  if (customer.objective) {
    out.push('');
    out.push(`*Objetivo:* ${customer.objective}`);
  }
  if (customer.projectNotes) {
    out.push('');
    out.push(`*Observações:* ${customer.projectNotes}`);
  }

  out.push('');
  out.push('Gostaria de confirmar o orçamento, a disponibilidade e as condições. Obrigado(a)!');
  return out.join('\n');
}

export function whatsappLink(phoneDigits: string, text: string): string {
  const digits = phoneDigits.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
