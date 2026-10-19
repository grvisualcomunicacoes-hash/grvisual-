import { effectivePrice } from './format';
import type { OrderLine, Package } from './types';
import type { ItemInput } from './validation';

export interface BuiltOrder {
  lines: OrderLine[];
  estimatedTotal: number;
  hasQuoteItems: boolean;
  missing: string[];
}

/**
 * Monta as linhas do pedido usando SEMPRE os preços do banco (nunca os do navegador).
 * - Serviços "sob orçamento" entram sem valor e com quantidade 1.
 * - Serviços que não permitem quantidade ficam travados em 1.
 * - Nenhum desconto ou taxa é aplicado.
 */
export function buildOrderLines(items: ItemInput[], packages: Package[]): BuiltOrder {
  // O carrinho identifica cada pacote pelo slug (estável e legível).
  const bySlug = new Map(packages.map((p) => [p.slug, p]));
  const lines: OrderLine[] = [];
  const missing: string[] = [];
  let total = 0;
  let hasQuote = false;

  for (const item of items) {
    const pkg = bySlug.get(item.packageId);
    if (!pkg || !pkg.active) {
      missing.push(item.packageId);
      continue;
    }
    const unit = pkg.pricing_mode === 'orcamento' ? null : effectivePrice(pkg.price, pkg.promo_price);
    const isQuote = unit === null;
    const maxQ = pkg.allow_quantity && !isQuote ? Math.max(1, pkg.max_quantity || 1) : 1;
    const quantity = Math.min(Math.max(1, item.quantity), maxQ);
    const subtotal = unit === null ? null : Math.round(unit * quantity * 100) / 100;
    if (subtotal === null) hasQuote = true;
    else total += subtotal;

    lines.push({
      package_id: pkg.id,
      name: pkg.name,
      category: pkg.category,
      pricing_mode: isQuote ? 'orcamento' : 'fixo',
      unit_price: unit,
      quantity,
      subtotal,
      needs_ad_budget: pkg.needs_ad_budget,
      notes: item.notes,
    });
  }

  return { lines, estimatedTotal: Math.round(total * 100) / 100, hasQuoteItems: hasQuote, missing };
}

/** Código legível do pedido, ex.: GR-261018-7K2Q */
export function generateOrderCode(now = new Date(), random: () => number = Math.random): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00';
  const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let suffix = '';
  for (let i = 0; i < 4; i++) suffix += alphabet[Math.floor(random() * alphabet.length)];
  return `GR-${get('year')}${get('month')}${get('day')}-${suffix}`;
}
