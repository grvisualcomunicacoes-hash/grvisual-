/**
 * Testes da lógica principal (carrinho → pedido → WhatsApp/e-mail).
 * Rodar: npm test
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DEFAULT_CONTENT, SEED_PACKAGES } from '../lib/defaults';
import { buildOrderEmail } from '../lib/email';
import { effectivePrice, formatBRL, linesToArray, normalizeWhatsApp, parseMoney, slugify } from '../lib/format';
import { mergeContent } from '../lib/merge';
import { buildOrderLines, generateOrderCode } from '../lib/order-build';
import type { Package } from '../lib/types';
import { escapeHtml, isValidBrazilPhone, validateOrderPayload } from '../lib/validation';
import { buildWhatsAppMessage, whatsappLink } from '../lib/whatsapp';

const packages: Package[] = SEED_PACKAGES.map((p) => ({ ...p, id: p.slug }));
const nbsp = (s: string) => s.replace(/ /g, ' ');

const customer = {
  name: 'Maria Souza',
  business: 'Doces da Maria',
  whatsapp: '(27) 99999-1234',
  email: 'maria@exemplo.com',
  city: 'Vila Velha',
  objective: 'Vender mais pelo Instagram',
  projectNotes: '',
  contactChannel: 'whatsapp' as const,
  privacyAccepted: true,
};

test('formatação de dinheiro e conversões', () => {
  assert.equal(nbsp(formatBRL(140)), 'R$ 140,00');
  assert.equal(nbsp(formatBRL(1790)), 'R$ 1.790,00');
  assert.equal(parseMoney('R$ 1.234,56'), 1234.56);
  assert.equal(parseMoney('349,5'), 349.5);
  assert.equal(parseMoney('80'), 80);
  assert.equal(parseMoney(''), null);
  assert.equal(parseMoney('-5'), null);
  assert.equal(effectivePrice(140, 120), 120);
  assert.equal(effectivePrice(140, 150), 140, 'promo maior que o preço é ignorada');
  assert.equal(slugify('Social + Tráfego!'), 'social-trafego');
  assert.equal(normalizeWhatsApp('(27) 98843-5960'), '5527988435960');
  assert.deepEqual(linesToArray('- 2 posts\n\n• 3 stories \n'), ['2 posts', '3 stories']);
});

test('validação de telefone brasileiro', () => {
  assert.ok(isValidBrazilPhone('(27) 98843-5960'));
  assert.ok(isValidBrazilPhone('+55 27 98843-5960'));
  assert.ok(isValidBrazilPhone('2733334444'));
  assert.ok(!isValidBrazilPhone('98843-5960'), 'sem DDD');
  assert.ok(!isValidBrazilPhone('27 88843-5960'), 'celular sem 9');
});

test('validação do formulário: campos obrigatórios e LGPD', () => {
  const r = validateOrderPayload({ customer: { name: 'A', whatsapp: '123', city: '', privacyAccepted: false }, items: [] });
  assert.equal(r.ok, false);
  if (!r.ok) {
    assert.ok(r.errors.name && r.errors.whatsapp && r.errors.city && r.errors.privacyAccepted && r.errors.objective);
  }
});

test('validação: e-mail obrigatório só quando retorno for por e-mail', () => {
  const base = { customer: { ...customer, email: '' }, items: [{ packageId: 'mini', quantity: 1, notes: '' }] };
  assert.equal(validateOrderPayload(base).ok, true);
  const r = validateOrderPayload({ ...base, customer: { ...base.customer, contactChannel: 'email' } });
  assert.equal(r.ok, false);
});

test('validação: limpa caracteres de controle e rejeita IDs maliciosos', () => {
  const r = validateOrderPayload({
    customer: { ...customer, name: 'Maria\u0000 <b>Souza</b>' },
    items: [{ packageId: "mini'; drop table", quantity: 1 }],
  });
  assert.equal(r.ok, false);
  const ok = validateOrderPayload({ customer: { ...customer, name: 'Maria\u0007 Souza' }, items: [] });
  assert.equal(ok.ok, true);
  if (ok.ok) assert.equal(ok.data.customer.name, 'Maria Souza');
});

test('orçamento personalizado sem pacote é aceito quando há descrição', () => {
  const r = validateOrderPayload({ customer, items: [] });
  assert.equal(r.ok, true);
});

test('pedido usa preços do banco, ignora preço enviado e trava quantidades', () => {
  const built = buildOrderLines(
    [
      { packageId: 'mini', quantity: 5, notes: 'cores rosa' }, // não permite quantidade → 1
      { packageId: 'conteudo-adicional', quantity: 50, notes: '' }, // máx. 10
      { packageId: 'gestao-trafego-pago', quantity: 1, notes: '' },
    ],
    packages
  );
  assert.equal(built.missing.length, 0);
  assert.equal(built.lines[0].quantity, 1);
  assert.equal(built.lines[0].unit_price, 140);
  assert.equal(built.lines[1].quantity, 10);
  assert.equal(built.lines[1].subtotal, 800);
  assert.equal(built.lines[2].needs_ad_budget, true);
  assert.equal(built.estimatedTotal, 140 + 800 + 250);
  assert.equal(built.hasQuoteItems, false);
});

test('pacote inativo ou inexistente é recusado', () => {
  const built = buildOrderLines([{ packageId: 'visibilidade', quantity: 1, notes: '' }, { packageId: 'nao-existe', quantity: 1, notes: '' }], packages);
  assert.deepEqual(built.missing, ['visibilidade', 'nao-existe']);
  assert.equal(built.lines.length, 0);
});

test('serviço sob orçamento não soma no total e não multiplica', () => {
  const quote: Package = { ...packages[0], slug: 'projeto-especial', pricing_mode: 'orcamento', allow_quantity: true, max_quantity: 9 };
  const built = buildOrderLines([{ packageId: 'projeto-especial', quantity: 7, notes: '' }, { packageId: 'mini', quantity: 1, notes: '' }], [...packages, quote]);
  assert.equal(built.lines[0].unit_price, null);
  assert.equal(built.lines[0].quantity, 1);
  assert.equal(built.estimatedTotal, 140);
  assert.equal(built.hasQuoteItems, true);
});

test('promoção é respeitada e nenhum desconto extra é aplicado', () => {
  const promo = packages.map((p) => (p.slug === 'mini' ? { ...p, promo_price: 120 } : p));
  const built = buildOrderLines([{ packageId: 'mini', quantity: 1, notes: '' }], promo);
  assert.equal(built.estimatedTotal, 120);
});

test('código do pedido tem formato GR-AAMMDD-XXXX no fuso de Brasília', () => {
  const code = generateOrderCode(new Date('2026-10-19T02:30:00Z'), () => 0); // 23:30 do dia 18 em Brasília
  assert.equal(code, 'GR-261018-2222');
  assert.match(generateOrderCode(), /^GR-\d{6}-[2-9A-HJ-NP-Z]{4}$/);
});

test('mensagem do WhatsApp: completa, organizada e codificada', () => {
  const built = buildOrderLines([{ packageId: 'mini', quantity: 1, notes: 'cores rosa & dourado' }, { packageId: 'social-trafego', quantity: 1, notes: '' }], packages);
  const msg = buildWhatsAppMessage({ code: 'GR-261018-ABCD', customer, lines: built.lines, estimatedTotal: built.estimatedTotal, hasQuoteItems: false });
  const plain = nbsp(msg);
  assert.ok(plain.includes('GR Visual Comunicações'));
  assert.ok(plain.includes('Pedido: *GR-261018-ABCD*'));
  assert.ok(plain.includes('Nome: Maria Souza'));
  assert.ok(plain.includes('1. Mini — 1 x R$ 140,00 = R$ 140,00'));
  assert.ok(plain.includes('(verba de anúncios à parte)'));
  assert.ok(plain.includes('Obs.: cores rosa & dourado'));
  assert.ok(plain.includes('Total estimado: R$ 520,00'));
  assert.ok(plain.includes('Gostaria de confirmar o orçamento'));
  assert.ok(!/recebido|confirmado/i.test(plain), 'não afirma que o pedido foi recebido/confirmado');

  const url = whatsappLink('5527988435960', msg);
  assert.ok(url.startsWith('https://wa.me/5527988435960?text='));
  assert.ok(!url.includes(' ') && !url.includes('\n') && !url.includes('&dourado'));
  assert.equal(decodeURIComponent(url.split('?text=')[1]), msg);
});

test('mensagem do WhatsApp para orçamento personalizado', () => {
  const msg = buildWhatsAppMessage({ code: null, customer, lines: [], estimatedTotal: 0, hasQuoteItems: false });
  assert.ok(msg.includes('orçamento personalizado'));
  assert.ok(!msg.includes('Pedido:'));
});

test('e-mail do pedido escapa HTML enviado pelo cliente', () => {
  const evil = { ...customer, name: '<script>alert(1)</script>', projectNotes: '<img src=x onerror=alert(1)>' };
  const built = buildOrderLines([{ packageId: 'mini', quantity: 1, notes: '"><b>x</b>' }], packages);
  const { html, subject, text } = buildOrderEmail({ code: 'GR-1', customer: evil, lines: built.lines, estimatedTotal: built.estimatedTotal, hasQuoteItems: false, sendMethod: 'email' });
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<img src=x'));
  assert.ok(!html.includes('"><b>x</b>'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(subject.includes('GR-1'));
  assert.ok(nbsp(text).includes('Mini: 1 x R$ 140,00'));
  assert.equal(escapeHtml(`<a href="x">'</a>`), '&lt;a href=&quot;x&quot;&gt;&#39;&lt;/a&gt;');
});

test('conteúdo salvo é mesclado com o padrão sem quebrar campos novos', () => {
  const merged = mergeContent(DEFAULT_CONTENT, { hero: { title: 'Novo título' }, notices: ['Só um aviso'], contact: { whatsapp: 123 } });
  assert.equal(merged.hero.title, 'Novo título');
  assert.equal(merged.hero.subtitle, DEFAULT_CONTENT.hero.subtitle);
  assert.deepEqual(merged.notices, ['Só um aviso']);
  assert.equal(merged.contact.whatsapp, DEFAULT_CONTENT.contact.whatsapp, 'tipo errado volta ao padrão');
  assert.deepEqual(mergeContent(DEFAULT_CONTENT, null), DEFAULT_CONTENT);
});

test('catálogo inicial: 8 pacotes ativos com os preços informados', () => {
  const active = SEED_PACKAGES.filter((p) => p.active);
  const prices = Object.fromEntries(active.map((p) => [p.name, p.price]));
  assert.deepEqual(prices, {
    'Venda Rápida': 67,
    Mini: 140,
    'Social + Tráfego': 380,
    'Gestão de tráfego pago': 250,
    'Digital + Tráfego': 500,
    'Produção de conteúdo adicional': 80,
    'Lançamento de Marca': 200,
    'Sabor Completo': 170,
  });
  const slugs = SEED_PACKAGES.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length, 'slugs únicos');
  assert.ok(slugs.every((s) => /^[a-z0-9-]{1,80}$/.test(s)));
});
