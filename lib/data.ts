import { DEFAULT_CONTENT, SEED_FAQS, SEED_PACKAGES, SEED_PORTFOLIO } from './defaults';
import { publicClient } from './supabase/public';
import { mergeContent } from './merge';
import type { Faq, Package, PortfolioItem, SiteContent } from './types';

export { mergeContent };

/**
 * Leitura de dados do site público.
 * Se o banco ainda não estiver configurado (ou cair), usa o conteúdo inicial
 * para que o site nunca fique em branco.
 */

export function normalizePackage(row: Record<string, unknown>): Package {
  const n = (v: unknown) => (v === null || v === undefined || v === '' ? null : Number(v));
  return {
    id: String(row.id ?? row.slug),
    slug: String(row.slug),
    name: String(row.name ?? ''),
    category: String(row.category ?? 'outros'),
    price: n(row.price),
    promo_price: n(row.promo_price),
    pricing_mode: row.pricing_mode === 'orcamento' ? 'orcamento' : 'fixo',
    allow_quantity: Boolean(row.allow_quantity),
    max_quantity: Number(row.max_quantity ?? 1) || 1,
    description: String(row.description ?? ''),
    includes: Array.isArray(row.includes) ? (row.includes as string[]) : [],
    excludes: Array.isArray(row.excludes) ? (row.excludes as string[]) : [],
    duration: String(row.duration ?? ''),
    deliverables: String(row.deliverables ?? ''),
    needs_ad_budget: Boolean(row.needs_ad_budget),
    start_estimate: String(row.start_estimate ?? ''),
    image_url: String(row.image_url ?? ''),
    active: row.active !== false,
    featured: Boolean(row.featured),
    sort_order: Number(row.sort_order ?? 100),
    notes: String(row.notes ?? ''),
  };
}

const FALLBACK_PACKAGES: Package[] = SEED_PACKAGES.map((p) => normalizePackage({ ...p, id: p.slug }));
const FALLBACK_PORTFOLIO: PortfolioItem[] = SEED_PORTFOLIO.map((p) => ({ ...p, id: p.slug }));
const FALLBACK_FAQS: Faq[] = SEED_FAQS.map((f, i) => ({ ...f, id: String(i + 1) }));

export async function getContent(): Promise<SiteContent> {
  const db = publicClient();
  if (!db) return DEFAULT_CONTENT;
  try {
    const { data, error } = await db.from('site_settings').select('content').eq('id', 1).maybeSingle();
    if (error || !data) return DEFAULT_CONTENT;
    return mergeContent(DEFAULT_CONTENT, data.content);
  } catch {
    return DEFAULT_CONTENT;
  }
}

export async function getPackages(opts: { featured?: boolean; categories?: readonly string[] } = {}): Promise<Package[]> {
  const db = publicClient();
  let list: Package[];
  if (!db) {
    list = FALLBACK_PACKAGES.filter((p) => p.active);
  } else {
    try {
      const { data, error } = await db
        .from('packages')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });
      list = error || !data ? FALLBACK_PACKAGES.filter((p) => p.active) : data.map(normalizePackage);
    } catch {
      list = FALLBACK_PACKAGES.filter((p) => p.active);
    }
  }
  if (opts.featured) list = list.filter((p) => p.featured);
  if (opts.categories) list = list.filter((p) => opts.categories!.includes(p.category));
  return list.sort((a, b) => a.sort_order - b.sort_order);
}

export async function getPackageBySlug(slug: string): Promise<Package | null> {
  const all = await getPackages();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getPortfolio(): Promise<PortfolioItem[]> {
  const db = publicClient();
  if (!db) return FALLBACK_PORTFOLIO;
  try {
    const { data, error } = await db
      .from('portfolio_items')
      .select('id, slug, title, client_name, category, description, highlights, services, images, published, sort_order')
      .eq('published', true)
      .order('sort_order', { ascending: true });
    if (error || !data) return FALLBACK_PORTFOLIO;
    return data as PortfolioItem[];
  } catch {
    return FALLBACK_PORTFOLIO;
  }
}

export async function getFaqs(): Promise<Faq[]> {
  const db = publicClient();
  if (!db) return FALLBACK_FAQS;
  try {
    const { data, error } = await db.from('faqs').select('*').eq('active', true).order('sort_order', { ascending: true });
    if (error || !data) return FALLBACK_FAQS;
    return data as Faq[];
  } catch {
    return FALLBACK_FAQS;
  }
}
