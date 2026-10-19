import { NextResponse } from 'next/server';
import { mergeContent, normalizePackage } from '@/lib/data';
import { DEFAULT_CONTENT } from '@/lib/defaults';
import { sendOrderEmail } from '@/lib/email';
import { buildOrderLines, generateOrderCode } from '@/lib/order-build';
import { serviceClient } from '@/lib/supabase/service';
import type { SiteContent } from '@/lib/types';
import { validateOrderPayload } from '@/lib/validation';
import { buildWhatsAppMessage, whatsappLink } from '@/lib/whatsapp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Limite simples por IP (melhor esforço; cada instância do servidor tem o seu).
const hits = new Map<string, number[]>();
function tooMany(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > 8;
}

function fail(status: number, error: string, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ ok: false, error, ...extra }, { status });
}

export async function POST(req: Request) {
  const length = Number(req.headers.get('content-length') || 0);
  if (length > 60_000) return fail(413, 'Pedido muito grande.');

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local';
  if (tooMany(ip)) return fail(429, 'Muitas tentativas seguidas. Aguarde alguns minutos ou chame no WhatsApp.');

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return fail(400, 'Não foi possível ler os dados enviados.');
  }

  // Anti-robô: campo invisível preenchido ou envio rápido demais.
  const startedAt = Number(body.startedAt || 0);
  if ((typeof body.website === 'string' && body.website.trim() !== '') || (startedAt && Date.now() - startedAt < 2500)) {
    return fail(400, 'Não foi possível enviar. Tente novamente.');
  }

  const result = validateOrderPayload(body);
  if (!result.ok) return fail(422, 'Confira os campos destacados.', { fields: result.errors });
  const { customer, items, sendMethod } = result.data;

  const db = serviceClient();
  if (!db) {
    return fail(503, 'O registro de pedidos ainda não está configurado.', { fallback: 'whatsapp' });
  }

  try {
    // Preços sempre conferidos no banco.
    let packages: ReturnType<typeof normalizePackage>[] = [];
    if (items.length) {
      const slugs = [...new Set(items.map((i) => i.packageId))];
      const { data, error } = await db.from('packages').select('*').in('slug', slugs);
      if (error) throw error;
      packages = (data || []).map(normalizePackage);
    }
    const built = buildOrderLines(items, packages);
    if (built.missing.length) {
      return fail(409, 'Alguns serviços do carrinho não estão mais disponíveis. Eles foram removidos — revise e envie novamente.', {
        missing: built.missing,
      });
    }

    const { data: settings } = await db.from('site_settings').select('content').eq('id', 1).maybeSingle();
    const content: SiteContent = mergeContent(DEFAULT_CONTENT, settings?.content);

    let code = '';
    let orderId = '';
    for (let attempt = 0; attempt < 4; attempt++) {
      code = generateOrderCode();
      const { data, error } = await db
        .from('orders')
        .insert({
          code,
          customer_name: customer.name,
          business_name: customer.business,
          whatsapp: customer.whatsapp,
          email: customer.email,
          city: customer.city,
          objective: customer.objective,
          project_notes: customer.projectNotes,
          contact_channel: customer.contactChannel,
          privacy_accepted_at: new Date().toISOString(),
          send_method: sendMethod,
          items: built.lines,
          estimated_total: built.estimatedTotal,
          has_quote_items: built.hasQuoteItems,
        })
        .select('id')
        .single();
      if (!error && data) {
        orderId = data.id;
        break;
      }
      if (error && error.code !== '23505') throw error; // 23505 = código repetido → tenta outro
    }
    if (!orderId) throw new Error('Não foi possível gerar o código do pedido');

    // Aviso por e-mail para a GR Visual (quando o Resend estiver configurado).
    const email = await sendOrderEmail({
      code,
      customer,
      lines: built.lines,
      estimatedTotal: built.estimatedTotal,
      hasQuoteItems: built.hasQuoteItems,
      sendMethod,
    });
    await db.from('orders').update({ email_status: email.status }).eq('id', orderId);
    if (email.status === 'falhou') console.error('[pedido]', code, 'falha no e-mail:', email.error);

    const message = buildWhatsAppMessage({
      code,
      customer,
      lines: built.lines,
      estimatedTotal: built.estimatedTotal,
      hasQuoteItems: built.hasQuoteItems,
    });

    return NextResponse.json({
      ok: true,
      code,
      emailStatus: email.status,
      estimatedTotal: built.estimatedTotal,
      hasQuoteItems: built.hasQuoteItems,
      whatsappUrl: whatsappLink(content.contact.whatsapp, message),
    });
  } catch (err) {
    console.error('[pedido] erro ao registrar:', err);
    return fail(500, 'Não conseguimos registrar o pedido agora.', { fallback: 'whatsapp' });
  }
}
