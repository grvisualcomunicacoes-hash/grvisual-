import type { CustomerInput } from './types';

export interface ItemInput {
  packageId: string;
  quantity: number;
  notes: string;
}

export interface OrderPayload {
  customer: CustomerInput;
  items: ItemInput[];
  sendMethod: 'whatsapp' | 'email';
}

export type ValidationResult =
  | { ok: true; data: OrderPayload }
  | { ok: false; errors: Record<string, string> };

const LIMITS = {
  name: 100,
  business: 120,
  email: 160,
  city: 80,
  objective: 1000,
  projectNotes: 2000,
  itemNotes: 500,
  maxItems: 20,
};

/** Remove caracteres de controle e espaços extras; corta no limite. */
export function cleanText(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim()
    .slice(0, max);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@<>()"',;:]+@[^\s@<>()"',;:]+\.[a-z]{2,}$/i.test(email) && email.length <= LIMITS.email;
}

/** Aceita telefones brasileiros com DDD (10 ou 11 dígitos), com ou sem +55. */
export function isValidBrazilPhone(input: string): boolean {
  let d = input.replace(/\D/g, '');
  if (d.startsWith('55') && (d.length === 12 || d.length === 13)) d = d.slice(2);
  if (d.length !== 10 && d.length !== 11) return false;
  if (d.startsWith('0')) return false;
  if (d.length === 11 && d[2] !== '9') return false;
  return true;
}

const ID_PATTERN = /^[a-zA-Z0-9-]{1,80}$/;

export function validateOrderPayload(body: unknown): ValidationResult {
  const errors: Record<string, string> = {};
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  const c = (b.customer && typeof b.customer === 'object' ? b.customer : {}) as Record<string, unknown>;

  const customer: CustomerInput = {
    name: cleanText(c.name, LIMITS.name),
    business: cleanText(c.business, LIMITS.business),
    whatsapp: cleanText(c.whatsapp, 30),
    email: cleanText(c.email, LIMITS.email).toLowerCase(),
    city: cleanText(c.city, LIMITS.city),
    objective: cleanText(c.objective, LIMITS.objective),
    projectNotes: cleanText(c.projectNotes, LIMITS.projectNotes),
    contactChannel: c.contactChannel === 'email' || c.contactChannel === 'ligacao' ? c.contactChannel : 'whatsapp',
    privacyAccepted: c.privacyAccepted === true,
  };

  if (customer.name.length < 2) errors.name = 'Informe seu nome.';
  if (!isValidBrazilPhone(customer.whatsapp)) errors.whatsapp = 'Informe um WhatsApp válido com DDD.';
  if (customer.email && !isValidEmail(customer.email)) errors.email = 'E-mail inválido.';
  if (customer.contactChannel === 'email' && !customer.email) errors.email = 'Informe o e-mail para retorno por e-mail.';
  if (customer.city.length < 2) errors.city = 'Informe sua cidade.';
  if (!customer.privacyAccepted) errors.privacyAccepted = 'É preciso confirmar a leitura da política de privacidade.';

  const rawItems = Array.isArray(b.items) ? b.items : [];
  if (rawItems.length > LIMITS.maxItems) errors.items = `Máximo de ${LIMITS.maxItems} itens por pedido.`;

  const items: ItemInput[] = [];
  for (const raw of rawItems.slice(0, LIMITS.maxItems)) {
    const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
    const packageId = typeof r.packageId === 'string' ? r.packageId : '';
    if (!ID_PATTERN.test(packageId)) {
      errors.items = 'Há um item inválido no carrinho.';
      continue;
    }
    const q = Number(r.quantity);
    const quantity = Number.isInteger(q) && q >= 1 && q <= 99 ? q : 1;
    items.push({ packageId, quantity, notes: cleanText(r.notes, LIMITS.itemNotes) });
  }

  if (items.length === 0 && customer.objective.length < 5 && customer.projectNotes.length < 5) {
    errors.objective = 'Escolha um serviço ou descreva o que você precisa.';
  }

  const sendMethod = b.sendMethod === 'email' ? 'email' : 'whatsapp';

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: { customer, items, sendMethod } };
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
