import { DEFAULT_CONTENT, SEED_FAQS, SEED_PACKAGES, SEED_PORTFOLIO } from './defaults';
import { mergeContent } from './merge';
import type { Faq, Package, PortfolioItem, SiteContent } from './types';

/** Tudo o que o site mostra fica em um único arquivo: dados/site.json */
export interface SiteData {
  version: number;
  updatedAt: string;
  content: SiteContent;
  packages: Package[];
  portfolio: PortfolioItem[];
  faqs: Faq[];
}

export function defaultSiteData(): SiteData {
  return {
    version: 1,
    updatedAt: new Date(0).toISOString(),
    content: DEFAULT_CONTENT,
    packages: SEED_PACKAGES.map((p) => ({ ...p, id: p.slug })),
    portfolio: SEED_PORTFOLIO.map((p) => ({ ...p, id: p.slug })),
    faqs: SEED_FAQS.map((f, i) => ({ ...f, id: `faq-${i + 1}` })),
  };
}

const arr = <T,>(v: unknown, fallback: T[]): T[] => (Array.isArray(v) ? (v as T[]) : fallback);
const str = (v: unknown, d = '') => (typeof v === 'string' ? v : d);
const num = (v: unknown): number | null => (v === null || v === undefined || v === '' || !Number.isFinite(Number(v)) ? null : Number(v));

/** Normaliza o JSON salvo (protege o site de campos faltando ou com tipo errado). */
export function normalizeSiteData(raw: unknown): SiteData {
  const base = defaultSiteData();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Record<string, unknown>;
  const packages = arr<Record<string, unknown>>(r.packages, []).filter((p) => p && typeof p.slug === 'string' && typeof p.name === 'string').map(
    (p): Package => ({
      id: str(p.id, str(p.slug)),
      slug: str(p.slug),
      name: str(p.name),
      category: str(p.category, 'outros'),
      price: num(p.price),
      promo_price: num(p.promo_price),
      pricing_mode: p.pricing_mode === 'orcamento' ? 'orcamento' : 'fixo',
      allow_quantity: Boolean(p.allow_quantity),
      max_quantity: Math.max(1, Math.min(99, Number(p.max_quantity) || 1)),
      description: str(p.description),
      includes: arr<string>(p.includes, []).filter((x) => typeof x === 'string'),
      excludes: arr<string>(p.excludes, []).filter((x) => typeof x === 'string'),
      duration: str(p.duration),
      deliverables: str(p.deliverables),
      needs_ad_budget: Boolean(p.needs_ad_budget),
      start_estimate: str(p.start_estimate),
      image_url: str(p.image_url),
      active: p.active !== false,
      featured: Boolean(p.featured),
      sort_order: Number(p.sort_order) || 100,
      notes: str(p.notes),
    })
  );
  const portfolio = arr<Record<string, unknown>>(r.portfolio, []).filter((p) => p && typeof p.title === 'string').map(
    (p): PortfolioItem => ({
      id: str(p.id, str(p.slug)),
      slug: str(p.slug),
      title: str(p.title),
      client_name: str(p.client_name),
      category: str(p.category),
      description: str(p.description),
      highlights: arr<string>(p.highlights, []),
      services: arr<string>(p.services, []),
      images: arr<string>(p.images, []),
      published: p.published !== false,
      sort_order: Number(p.sort_order) || 100,
    })
  );
  const faqs = arr<Record<string, unknown>>(r.faqs, []).filter((f) => f && typeof f.question === 'string').map(
    (f, i): Faq => ({ id: str(f.id, `faq-${i + 1}`), question: str(f.question), answer: str(f.answer), sort_order: Number(f.sort_order) || i + 1, active: f.active !== false })
  );
  return {
    version: Number(r.version) || 1,
    updatedAt: str(r.updatedAt, base.updatedAt),
    content: mergeContent(base.content, r.content),
    packages: Array.isArray(r.packages) ? packages : base.packages,
    portfolio: Array.isArray(r.portfolio) ? portfolio : base.portfolio,
    faqs: Array.isArray(r.faqs) ? faqs : base.faqs,
  };
}

export const bySort = <T extends { sort_order: number }>(a: T, b: T) => a.sort_order - b.sort_order;
export const activePackages = (d: SiteData) => d.packages.filter((p) => p.active).sort(bySort);
export const publishedPortfolio = (d: SiteData) => d.portfolio.filter((p) => p.published && p.images.length > 0).sort(bySort);
export const activeFaqs = (d: SiteData) => d.faqs.filter((f) => f.active).sort(bySort);
