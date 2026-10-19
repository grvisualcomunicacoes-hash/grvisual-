export function formatBRL(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

/** Preço efetivo: promocional quando existir e for menor que o normal. */
export function effectivePrice(price: number | null, promo: number | null): number | null {
  if (price === null) return promo;
  if (promo !== null && promo >= 0 && promo < price) return promo;
  return price;
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(iso));
}

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Converte "R$ 1.234,56", "1234,56" ou "1234.56" em número. Vazio → null. */
export function parseMoney(input: string | null | undefined): number | null {
  if (input === null || input === undefined) return null;
  let s = String(input).trim().replace(/[R$\s]/g, '');
  if (!s) return null;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100) / 100;
}

/** Mantém só dígitos e garante o DDI 55 para números brasileiros. */
export function normalizeWhatsApp(input: string): string {
  const digits = String(input || '').replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
}

/** Lista "um item por linha" → array limpo. */
export function linesToArray(text: string | null | undefined): string[] {
  return String(text || '')
    .split(/\r?\n/)
    .map((l) => l.replace(/^[\s•\-*]+/, '').trim())
    .filter(Boolean);
}
