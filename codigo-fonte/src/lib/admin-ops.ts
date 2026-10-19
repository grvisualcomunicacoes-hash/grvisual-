/**
 * Operações do painel sobre o arquivo dados/site.json.
 * Funções puras: recebem os dados atuais + o formulário e devolvem os dados novos
 * (ou uma mensagem de erro). Testadas em tests/admin-ops.test.ts.
 */
import { SERVICE_CATEGORIES } from './categories';
import { DEFAULT_CONTENT } from './defaults';
import { linesToArray, normalizeWhatsApp, parseMoney, slugify } from './format';
import type { SiteData } from './site-data';
import type { Faq, Package, PortfolioItem, SiteContent } from './types';
import { cleanText } from './validation';

export type OpResult = { ok: true; data: SiteData; message: string; id?: string } | { ok: false; error: string };

type Form = { get(name: string): FormDataEntryValue | null };
const str = (fd: Form, k: string, max = 2000) => cleanText(String(fd.get(k) ?? ''), max);
const long = (fd: Form, k: string, max = 5000) =>
  String(fd.get(k) ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max);
const bool = (fd: Form, k: string) => fd.get(k) === 'on' || fd.get(k) === 'true';
const int = (fd: Form, k: string, def: number, min: number, max: number) => {
  const n = parseInt(String(fd.get(k) ?? ''), 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def;
};
/** Aceita só caminhos do próprio site ou links https (bloqueia javascript: etc.). */
export const safeUrl = (v: string) => (v === '' || /^https:\/\//i.test(v) || /^[a-z0-9][a-z0-9/_.\-]*$/i.test(v) ? v : '');
const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const stamp = (d: SiteData): SiteData => ({ ...d, updatedAt: new Date().toISOString() });

function uniqueSlug(base: string, taken: string[]): string {
  let slug = base || 'item';
  let i = 2;
  while (taken.includes(slug)) slug = `${base}-${i++}`;
  return slug;
}

// ---------- pacotes ----------
export function savePackage(data: SiteData, fd: Form): OpResult {
  const id = str(fd, 'id', 60);
  const existing = id ? data.packages.find((p) => p.id === id) : undefined;
  const name = str(fd, 'name', 120);
  if (name.length < 2) return { ok: false, error: 'Informe o nome do pacote.' };
  const slug = slugify(str(fd, 'slug', 80) || name);
  if (!slug) return { ok: false, error: 'Endereço (slug) inválido.' };
  if (data.packages.some((p) => p.slug === slug && p.id !== existing?.id)) return { ok: false, error: 'Já existe um pacote com esse endereço. Escolha outro.' };
  const categoryRaw = str(fd, 'category', 40);
  const category = SERVICE_CATEGORIES.some((c) => c.key === categoryRaw) ? categoryRaw : 'outros';
  const pricing_mode = fd.get('pricing_mode') === 'orcamento' ? 'orcamento' : 'fixo';
  const price = parseMoney(str(fd, 'price', 20));
  const promo_price = parseMoney(str(fd, 'promo_price', 20));
  if (pricing_mode === 'fixo' && price === null) return { ok: false, error: 'Informe o preço ou marque "Sob orçamento".' };
  if (promo_price !== null && price !== null && promo_price >= price) return { ok: false, error: 'O preço promocional deve ser menor que o preço normal.' };

  const pkg: Package = {
    id: existing?.id ?? newId('p'),
    name,
    slug,
    category,
    pricing_mode,
    price,
    promo_price,
    allow_quantity: bool(fd, 'allow_quantity'),
    max_quantity: int(fd, 'max_quantity', 1, 1, 99),
    description: long(fd, 'description', 1500),
    includes: linesToArray(long(fd, 'includes', 4000)).slice(0, 40),
    excludes: linesToArray(long(fd, 'excludes', 2000)).slice(0, 30),
    duration: str(fd, 'duration', 80),
    deliverables: str(fd, 'deliverables', 160),
    needs_ad_budget: bool(fd, 'needs_ad_budget'),
    start_estimate: str(fd, 'start_estimate', 120),
    image_url: safeUrl(str(fd, 'image_url', 500)),
    active: bool(fd, 'active'),
    featured: bool(fd, 'featured'),
    sort_order: int(fd, 'sort_order', 100, 0, 9999),
    notes: long(fd, 'notes', 2000),
  };
  const packages = existing ? data.packages.map((p) => (p.id === existing.id ? pkg : p)) : [...data.packages, pkg];
  return { ok: true, data: stamp({ ...data, packages }), message: `Pacote "${name}" salvo.`, id: pkg.id };
}

export function duplicatePackage(data: SiteData, id: string): OpResult {
  const src = data.packages.find((p) => p.id === id);
  if (!src) return { ok: false, error: 'Pacote não encontrado.' };
  const copy: Package = {
    ...src,
    id: newId('p'),
    name: `${src.name} (cópia)`,
    slug: uniqueSlug(`${src.slug}-copia`, data.packages.map((p) => p.slug)),
    active: false,
    featured: false,
  };
  return { ok: true, data: stamp({ ...data, packages: [...data.packages, copy] }), message: 'Cópia criada (inativa). Revise e ative quando quiser.', id: copy.id };
}

export function deletePackage(data: SiteData, id: string): OpResult {
  if (!data.packages.some((p) => p.id === id)) return { ok: false, error: 'Pacote não encontrado.' };
  return { ok: true, data: stamp({ ...data, packages: data.packages.filter((p) => p.id !== id) }), message: 'Pacote excluído.' };
}

export function togglePackage(data: SiteData, id: string, field: 'active' | 'featured'): OpResult {
  const p = data.packages.find((x) => x.id === id);
  if (!p) return { ok: false, error: 'Pacote não encontrado.' };
  const packages = data.packages.map((x) => (x.id === id ? { ...x, [field]: !x[field] } : x));
  const label = field === 'active' ? (p.active ? 'desativado' : 'ativado') : p.featured ? 'fora dos destaques' : 'em destaque';
  return { ok: true, data: stamp({ ...data, packages }), message: `"${p.name}" ${label}.` };
}

// ---------- portfólio ----------
export function savePortfolio(data: SiteData, fd: Form, images: string[]): OpResult {
  const id = str(fd, 'id', 60);
  const existing = id ? data.portfolio.find((p) => p.id === id) : undefined;
  const title = str(fd, 'title', 160);
  if (title.length < 2) return { ok: false, error: 'Informe o título do projeto.' };
  const cleanImages = images.map((u) => safeUrl(String(u))).filter(Boolean).slice(0, 30);
  if (!cleanImages.length) return { ok: false, error: 'Adicione pelo menos uma imagem.' };
  const item: PortfolioItem = {
    id: existing?.id ?? newId('f'),
    slug: existing?.slug ?? uniqueSlug(slugify(title), data.portfolio.map((p) => p.slug)),
    title,
    client_name: str(fd, 'client_name', 120),
    category: str(fd, 'category', 80),
    description: long(fd, 'description', 3000),
    highlights: linesToArray(long(fd, 'highlights', 3000)).slice(0, 20),
    services: linesToArray(long(fd, 'services', 1000)).slice(0, 20),
    images: cleanImages,
    published: bool(fd, 'published'),
    sort_order: existing?.sort_order ?? Math.max(0, ...data.portfolio.map((p) => p.sort_order)) + 1,
  };
  const portfolio = existing ? data.portfolio.map((p) => (p.id === existing.id ? item : p)) : [...data.portfolio, item];
  return { ok: true, data: stamp({ ...data, portfolio }), message: `Projeto "${title}" salvo.`, id: item.id };
}

export function deletePortfolio(data: SiteData, id: string): OpResult {
  if (!data.portfolio.some((p) => p.id === id)) return { ok: false, error: 'Projeto não encontrado.' };
  return { ok: true, data: stamp({ ...data, portfolio: data.portfolio.filter((p) => p.id !== id) }), message: 'Projeto removido.' };
}

export function togglePortfolio(data: SiteData, id: string): OpResult {
  const p = data.portfolio.find((x) => x.id === id);
  if (!p) return { ok: false, error: 'Projeto não encontrado.' };
  return { ok: true, data: stamp({ ...data, portfolio: data.portfolio.map((x) => (x.id === id ? { ...x, published: !x.published } : x)) }), message: p.published ? 'Projeto ocultado.' : 'Projeto publicado.' };
}

export function movePortfolio(data: SiteData, id: string, dir: -1 | 1): OpResult {
  const list = [...data.portfolio].sort((a, b) => a.sort_order - b.sort_order);
  const i = list.findIndex((p) => p.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return { ok: false, error: 'Não dá para mover mais.' };
  [list[i], list[j]] = [list[j], list[i]];
  const portfolio = list.map((p, idx) => ({ ...p, sort_order: (idx + 1) * 10 }));
  return { ok: true, data: stamp({ ...data, portfolio }), message: 'Ordem atualizada.' };
}

// ---------- conteúdo ----------
export function saveContent(data: SiteData, fd: Form): OpResult {
  const base = data.content;
  const paragraphs = (k: string) =>
    long(fd, k, 8000)
      .split(/\n\s*\n/)
      .map((p) => p.replace(/\s+/g, ' ').trim())
      .filter(Boolean);
  const pairs = (prefix: string, max: number) => {
    const out: { title: string; text: string }[] = [];
    for (let i = 0; i < max; i++) {
      const title = str(fd, `${prefix}_title_${i}`, 120);
      if (title) out.push({ title, text: str(fd, `${prefix}_text_${i}`, 400) });
    }
    return out;
  };
  const testimonials = [];
  for (let i = 0; i < 12; i++) {
    const name = str(fd, `t_name_${i}`, 100);
    const text = long(fd, `t_text_${i}`, 600);
    if (name && text) testimonials.push({ name, business: str(fd, `t_business_${i}`, 120), text, authorized: bool(fd, `t_auth_${i}`) });
  }
  const whatsapp = normalizeWhatsApp(str(fd, 'whatsapp', 30));
  if (whatsapp.length < 12) return { ok: false, error: 'WhatsApp comercial inválido. Use DDD + número.' };
  const email = str(fd, 'email', 160);
  if (email && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) return { ok: false, error: 'E-mail comercial inválido.' };

  const content: SiteContent = {
    ...base,
    brand: { name: str(fd, 'brand_name', 80) || base.brand.name, slogan: str(fd, 'slogan', 120), logoUrl: safeUrl(str(fd, 'logo_url', 500)) || DEFAULT_CONTENT.brand.logoUrl },
    contact: {
      whatsapp,
      whatsappDisplay: str(fd, 'whatsapp_display', 40) || whatsapp,
      email,
      region: str(fd, 'region', 80),
      instagram: safeUrl(str(fd, 'instagram', 300)),
      facebook: safeUrl(str(fd, 'facebook', 300)),
      tiktok: safeUrl(str(fd, 'tiktok', 300)),
    },
    seo: { title: str(fd, 'seo_title', 120) || base.seo.title, description: str(fd, 'seo_description', 300) },
    hero: { kicker: str(fd, 'hero_kicker', 100), title: str(fd, 'hero_title', 120) || base.hero.title, subtitle: str(fd, 'hero_subtitle', 300) },
    banner: { active: bool(fd, 'banner_active'), text: str(fd, 'banner_text', 200), link: safeUrl(str(fd, 'banner_link', 300)) || (str(fd, 'banner_link', 300).startsWith('/') ? str(fd, 'banner_link', 300) : '') },
    about: { title: str(fd, 'about_title', 120) || base.about.title, paragraphs: paragraphs('about_paragraphs') },
    differentials: pairs('dif', 8),
    howItWorks: pairs('step', 6),
    notices: linesToArray(long(fd, 'notices', 3000)).slice(0, 12),
    testimonials,
    privacy: paragraphs('privacy'),
  };
  return { ok: true, data: stamp({ ...data, content }), message: 'Conteúdo do site atualizado.' };
}

// ---------- FAQ ----------
export function saveFaq(data: SiteData, fd: Form): OpResult {
  const id = str(fd, 'id', 60);
  const question = str(fd, 'question', 300);
  if (question.length < 3) return { ok: false, error: 'Escreva a pergunta.' };
  const existing = id ? data.faqs.find((f) => f.id === id) : undefined;
  const faq: Faq = {
    id: existing?.id ?? newId('faq'),
    question,
    answer: long(fd, 'answer', 3000),
    sort_order: int(fd, 'sort_order', (Math.max(0, ...data.faqs.map((f) => f.sort_order)) || 0) + 1, 0, 9999),
    active: bool(fd, 'active'),
  };
  const faqs = existing ? data.faqs.map((f) => (f.id === existing.id ? faq : f)) : [...data.faqs, faq];
  return { ok: true, data: stamp({ ...data, faqs }), message: 'Pergunta salva.' };
}

export function deleteFaq(data: SiteData, id: string): OpResult {
  return { ok: true, data: stamp({ ...data, faqs: data.faqs.filter((f) => f.id !== id) }), message: 'Pergunta removida.' };
}
