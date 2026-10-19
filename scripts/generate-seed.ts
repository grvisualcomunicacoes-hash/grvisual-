/**
 * Gera supabase/seed.sql a partir de lib/defaults.ts.
 * Uso: npx tsx scripts/generate-seed.ts
 */
import { writeFileSync } from 'node:fs';
import { DEFAULT_CONTENT, SEED_FAQS, SEED_PACKAGES, SEED_PORTFOLIO } from '../lib/defaults';

const q = (s: string) => `'${String(s).replace(/'/g, "''")}'`;
const arr = (a: string[]) => (a.length ? `array[${a.map(q).join(', ')}]::text[]` : `'{}'::text[]`);
const num = (n: number | null) => (n === null ? 'null' : String(n));
const bool = (b: boolean) => (b ? 'true' : 'false');

const lines: string[] = [];
lines.push('-- Conteúdo inicial. Gerado por scripts/generate-seed.ts — pode rodar mais de uma vez:');
lines.push('-- registros que já existem NÃO são sobrescritos (suas edições ficam preservadas).');
lines.push('');
lines.push('insert into public.site_settings (id, content) values (1, $json$' + JSON.stringify(DEFAULT_CONTENT, null, 2) + '$json$::jsonb)');
lines.push('on conflict (id) do nothing;');
lines.push('');
for (const p of SEED_PACKAGES) {
  lines.push(
    'insert into public.packages (slug, name, category, price, promo_price, pricing_mode, allow_quantity, max_quantity, description, includes, excludes, duration, deliverables, needs_ad_budget, start_estimate, image_url, active, featured, sort_order, notes) values (' +
      [q(p.slug), q(p.name), q(p.category), num(p.price), num(p.promo_price), q(p.pricing_mode), bool(p.allow_quantity), p.max_quantity, q(p.description), arr(p.includes), arr(p.excludes), q(p.duration), q(p.deliverables), bool(p.needs_ad_budget), q(p.start_estimate), q(p.image_url), bool(p.active), bool(p.featured), p.sort_order, q(p.notes)].join(', ') +
      ') on conflict (slug) do nothing;'
  );
}
lines.push('');
for (const p of SEED_PORTFOLIO) {
  lines.push(
    'insert into public.portfolio_items (slug, title, client_name, category, description, highlights, services, images, published, sort_order) values (' +
      [q(p.slug), q(p.title), q(p.client_name), q(p.category), q(p.description), arr(p.highlights), arr(p.services), arr(p.images), bool(p.published), p.sort_order].join(', ') +
      ') on conflict (slug) do nothing;'
  );
}
lines.push('');
lines.push('-- Perguntas frequentes: só insere se a tabela estiver vazia');
lines.push('insert into public.faqs (question, answer, sort_order, active)');
lines.push('select * from (values');
lines.push(SEED_FAQS.map((f) => `  (${q(f.question)}, ${q(f.answer)}, ${f.sort_order}, ${bool(f.active)})`).join(',\n'));
lines.push(') as v(question, answer, sort_order, active)');
lines.push('where not exists (select 1 from public.faqs);');
lines.push('');

writeFileSync(new URL('../supabase/seed.sql', import.meta.url), lines.join('\n'));
console.log('supabase/seed.sql gerado:', SEED_PACKAGES.length, 'pacotes,', SEED_PORTFOLIO.length, 'projetos,', SEED_FAQS.length, 'perguntas');
