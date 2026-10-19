'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import { SERVICE_CATEGORIES } from '@/lib/categories';
import { mergeContent } from '@/lib/data';
import { DEFAULT_CONTENT } from '@/lib/defaults';
import { linesToArray, normalizeWhatsApp, parseMoney, slugify } from '@/lib/format';
import { ORDER_STATUSES, type SiteContent } from '@/lib/types';
import { cleanText } from '@/lib/validation';
import { serverClient } from '@/lib/supabase/server';

// ---------- utilitários ----------
const str = (fd: FormData, k: string, max = 2000) => cleanText(String(fd.get(k) ?? ''), max);
const long = (fd: FormData, k: string, max = 5000) =>
  String(fd.get(k) ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max);
const bool = (fd: FormData, k: string) => fd.get(k) === 'on' || fd.get(k) === 'true';
const int = (fd: FormData, k: string, def: number, min: number, max: number) => {
  const n = parseInt(String(fd.get(k) ?? ''), 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : def;
};
const safeUrl = (v: string) => (v === '' || v.startsWith('/') || /^https:\/\//i.test(v) ? v : '');
const uuidOk = (v: string) => /^[0-9a-f-]{36}$/i.test(v);

function done(path: string, msg: string): never {
  revalidatePath('/', 'layout');
  redirect(`${path}${path.includes('?') ? '&' : '?'}ok=${encodeURIComponent(msg)}`);
}
function fail(path: string, msg: string): never {
  redirect(`${path}${path.includes('?') ? '&' : '?'}erro=${encodeURIComponent(msg)}`);
}
function friendly(err: { code?: string; message?: string } | null): string {
  if (!err) return 'Erro desconhecido.';
  if (err.code === '23505') return 'Já existe um item com esse endereço (slug). Escolha outro.';
  if (err.code === '42501') return 'Sem permissão para esta ação.';
  return 'Não foi possível salvar. Verifique a conexão e tente de novo.';
}

// ---------- sessão ----------
export async function signOut() {
  const supabase = await serverClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

// ---------- pacotes ----------
export async function savePackage(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(fd, 'id', 40);
  const back = id ? `/admin/pacotes/${id}` : '/admin/pacotes/novo';

  const name = str(fd, 'name', 120);
  if (name.length < 2) fail(back, 'Informe o nome do pacote.');
  const slug = slugify(str(fd, 'slug', 80) || name);
  if (!slug) fail(back, 'Endereço (slug) inválido.');
  const categoryRaw = str(fd, 'category', 40);
  const category = SERVICE_CATEGORIES.some((c) => c.key === categoryRaw) ? categoryRaw : 'outros';
  const pricing_mode = fd.get('pricing_mode') === 'orcamento' ? 'orcamento' : 'fixo';
  const price = parseMoney(str(fd, 'price', 20));
  const promo_price = parseMoney(str(fd, 'promo_price', 20));
  if (pricing_mode === 'fixo' && price === null) fail(back, 'Informe o preço ou marque "Sob orçamento".');
  if (promo_price !== null && price !== null && promo_price >= price) fail(back, 'O preço promocional deve ser menor que o preço normal.');

  const row = {
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

  const { error } = id && uuidOk(id)
    ? await supabase.from('packages').update(row).eq('id', id)
    : await supabase.from('packages').insert(row);
  if (error) fail(back, friendly(error));
  done('/admin/pacotes', `Pacote "${name}" salvo.`);
}

export async function duplicatePackage(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(fd, 'id', 40);
  const { data, error } = await supabase.from('packages').select('*').eq('id', id).single();
  if (error || !data) fail('/admin/pacotes', 'Pacote não encontrado.');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, created_at: _c, updated_at: _u, ...rest } = data;
  const copy = { ...rest, name: `${data.name} (cópia)`, slug: `${data.slug}-copia-${Date.now().toString(36).slice(-4)}`, active: false, featured: false };
  const { data: created, error: e2 } = await supabase.from('packages').insert(copy).select('id').single();
  if (e2 || !created) fail('/admin/pacotes', friendly(e2));
  done(`/admin/pacotes/${created.id}`, 'Cópia criada (inativa). Revise e ative quando quiser.');
}

export async function deletePackage(fd: FormData) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('packages').delete().eq('id', str(fd, 'id', 40));
  if (error) fail('/admin/pacotes', friendly(error));
  done('/admin/pacotes', 'Pacote excluído.');
}

export async function togglePackage(fd: FormData) {
  const { supabase } = await requireAdmin();
  const field = fd.get('field') === 'featured' ? 'featured' : 'active';
  const value = fd.get('value') === 'true';
  const { error } = await supabase.from('packages').update({ [field]: value }).eq('id', str(fd, 'id', 40));
  if (error) fail('/admin/pacotes', friendly(error));
  done('/admin/pacotes', 'Atualizado.');
}

// ---------- portfólio ----------
export async function savePortfolio(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(fd, 'id', 40);
  const back = id ? `/admin/portfolio/${id}` : '/admin/portfolio/novo';
  const title = str(fd, 'title', 160);
  if (title.length < 2) fail(back, 'Informe o título do projeto.');
  let images: string[] = [];
  try {
    const parsed = JSON.parse(String(fd.get('images') || '[]'));
    if (Array.isArray(parsed)) images = parsed.map((u) => safeUrl(String(u))).filter(Boolean).slice(0, 30);
  } catch {
    /* mantém vazio */
  }
  const row = {
    title,
    slug: slugify(str(fd, 'slug', 80) || title),
    client_name: str(fd, 'client_name', 120),
    category: str(fd, 'category', 80),
    description: long(fd, 'description', 3000),
    highlights: linesToArray(long(fd, 'highlights', 3000)).slice(0, 20),
    services: linesToArray(long(fd, 'services', 1000)).slice(0, 20),
    images,
    published: bool(fd, 'published'),
    sort_order: int(fd, 'sort_order', 100, 0, 9999),
  };
  const { error } = id && uuidOk(id)
    ? await supabase.from('portfolio_items').update(row).eq('id', id)
    : await supabase.from('portfolio_items').insert(row);
  if (error) fail(back, friendly(error));
  done('/admin/portfolio', `Projeto "${title}" salvo.`);
}

export async function deletePortfolio(fd: FormData) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('portfolio_items').delete().eq('id', str(fd, 'id', 40));
  if (error) fail('/admin/portfolio', friendly(error));
  done('/admin/portfolio', 'Projeto removido.');
}

export async function togglePortfolio(fd: FormData) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from('portfolio_items')
    .update({ published: fd.get('value') === 'true' })
    .eq('id', str(fd, 'id', 40));
  if (error) fail('/admin/portfolio', friendly(error));
  done('/admin/portfolio', 'Atualizado.');
}

export async function movePortfolio(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(fd, 'id', 40);
  const dir = fd.get('dir') === 'up' ? -1 : 1;
  const { data } = await supabase.from('portfolio_items').select('id, sort_order').order('sort_order').order('created_at');
  if (!data) fail('/admin/portfolio', 'Não foi possível reordenar.');
  const list = data.map((r) => r.id as string);
  const i = list.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) done('/admin/portfolio', 'Ordem mantida.');
  [list[i], list[j]] = [list[j], list[i]];
  await Promise.all(list.map((pid, idx) => supabase.from('portfolio_items').update({ sort_order: (idx + 1) * 10 }).eq('id', pid)));
  done('/admin/portfolio', 'Ordem atualizada.');
}

// ---------- pedidos ----------
export async function updateOrder(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(fd, 'id', 40);
  const back = `/admin/pedidos/${id}`;
  const status = String(fd.get('status'));
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) fail(back, 'Status inválido.');
  const received = parseMoney(str(fd, 'amount_received', 20)) ?? 0;
  const { error } = await supabase
    .from('orders')
    .update({ status, internal_notes: long(fd, 'internal_notes', 5000), amount_received: received })
    .eq('id', id);
  if (error) fail(back, friendly(error));
  done(back, 'Pedido atualizado.');
}

export async function deleteOrder(fd: FormData) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('orders').delete().eq('id', str(fd, 'id', 40));
  if (error) fail('/admin/pedidos', friendly(error));
  done('/admin/pedidos', 'Pedido excluído.');
}

// ---------- conteúdo ----------
export async function saveContent(fd: FormData) {
  const { supabase } = await requireAdmin();
  const back = '/admin/conteudo';
  const { data: current } = await supabase.from('site_settings').select('content').eq('id', 1).maybeSingle();
  const base: SiteContent = mergeContent(DEFAULT_CONTENT, current?.content);

  const paragraphs = (k: string) =>
    long(fd, k, 8000)
      .split(/\n\s*\n/)
      .map((p) => p.replace(/\s+/g, ' ').trim())
      .filter(Boolean);
  const pairs = (prefix: string, max: number) => {
    const out: { title: string; text: string }[] = [];
    for (let i = 0; i < max; i++) {
      const title = str(fd, `${prefix}_title_${i}`, 120);
      const text = str(fd, `${prefix}_text_${i}`, 400);
      if (title) out.push({ title, text });
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
  if (whatsapp.length < 12) fail(back, 'WhatsApp comercial inválido. Use DDD + número.');

  const content: SiteContent = {
    ...base,
    brand: { name: str(fd, 'brand_name', 80) || base.brand.name, slogan: str(fd, 'slogan', 120), logoUrl: safeUrl(str(fd, 'logo_url', 500)) || DEFAULT_CONTENT.brand.logoUrl },
    contact: {
      whatsapp,
      whatsappDisplay: str(fd, 'whatsapp_display', 40) || whatsapp,
      email: str(fd, 'email', 160),
      region: str(fd, 'region', 80),
      instagram: safeUrl(str(fd, 'instagram', 300)),
      facebook: safeUrl(str(fd, 'facebook', 300)),
      tiktok: safeUrl(str(fd, 'tiktok', 300)),
    },
    seo: { title: str(fd, 'seo_title', 120) || base.seo.title, description: str(fd, 'seo_description', 300) },
    hero: { kicker: str(fd, 'hero_kicker', 100), title: str(fd, 'hero_title', 120) || base.hero.title, subtitle: str(fd, 'hero_subtitle', 300) },
    banner: { active: bool(fd, 'banner_active'), text: str(fd, 'banner_text', 200), link: safeUrl(str(fd, 'banner_link', 300)) },
    about: { title: str(fd, 'about_title', 120) || base.about.title, paragraphs: paragraphs('about_paragraphs') },
    differentials: pairs('dif', 8),
    howItWorks: pairs('step', 6),
    notices: linesToArray(long(fd, 'notices', 3000)).slice(0, 12),
    testimonials,
    privacy: paragraphs('privacy'),
  };

  const { error } = await supabase.from('site_settings').upsert({ id: 1, content });
  if (error) fail(back, friendly(error));
  done(back, 'Conteúdo do site atualizado.');
}

export async function saveFaq(fd: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(fd, 'id', 40);
  const question = str(fd, 'question', 300);
  if (question.length < 3) fail('/admin/conteudo#faq', 'Escreva a pergunta.');
  const row = { question, answer: long(fd, 'answer', 3000), sort_order: int(fd, 'sort_order', 100, 0, 9999), active: bool(fd, 'active') };
  const { error } = id && uuidOk(id) ? await supabase.from('faqs').update(row).eq('id', id) : await supabase.from('faqs').insert(row);
  if (error) fail('/admin/conteudo', friendly(error));
  done('/admin/conteudo', 'Pergunta salva.');
}

export async function deleteFaq(fd: FormData) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from('faqs').delete().eq('id', str(fd, 'id', 40));
  if (error) fail('/admin/conteudo', friendly(error));
  done('/admin/conteudo', 'Pergunta removida.');
}
