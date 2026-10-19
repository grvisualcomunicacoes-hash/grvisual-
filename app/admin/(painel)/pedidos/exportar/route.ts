import { getAdminUser } from '@/lib/supabase/server';
import { ORDER_STATUSES, ORDER_STATUS_LABELS, type OrderLine, type OrderStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

function csvCell(v: unknown): string {
  let s = v === null || v === undefined ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // evita fórmulas maliciosas no Excel
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(req: Request) {
  const { supabase, user, isAdmin } = await getAdminUser();
  if (!user || !isAdmin) return new Response('Não autorizado', { status: 401 });

  const sp = new URL(req.url).searchParams;
  let query = supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5000);
  const status = sp.get('status');
  if (status && (ORDER_STATUSES as readonly string[]).includes(status)) query = query.eq('status', status);
  const de = sp.get('de');
  const ate = sp.get('ate');
  if (de && /^\d{4}-\d{2}-\d{2}$/.test(de)) query = query.gte('created_at', `${de}T00:00:00-03:00`);
  if (ate && /^\d{4}-\d{2}-\d{2}$/.test(ate)) query = query.lte('created_at', `${ate}T23:59:59-03:00`);
  const q = (sp.get('q') || '').replace(/[%,()*\\]/g, ' ').trim().slice(0, 60);
  if (q) query = query.or(`customer_name.ilike.%${q}%,business_name.ilike.%${q}%,code.ilike.%${q}%`);

  const { data, error } = await query;
  if (error) return new Response('Erro ao gerar o arquivo', { status: 500 });

  const header = ['Código', 'Data', 'Cliente', 'Empresa', 'WhatsApp', 'E-mail', 'Cidade', 'Serviços', 'Total estimado', 'Valor recebido', 'Status', 'Retorno por', 'Objetivo', 'Observações', 'Anotações internas'];
  const rows = (data ?? []).map((o) => [
    o.code,
    new Date(o.created_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
    o.customer_name,
    o.business_name,
    o.whatsapp,
    o.email,
    o.city,
    ((o.items as OrderLine[]) || []).map((l) => `${l.name} x${l.quantity}`).join(' | '),
    String(o.estimated_total).replace('.', ','),
    String(o.amount_received).replace('.', ','),
    ORDER_STATUS_LABELS[o.status as OrderStatus] ?? o.status,
    o.contact_channel,
    o.objective,
    o.project_notes,
    o.internal_notes,
  ]);
  const csv = '﻿' + [header, ...rows].map((r) => r.map(csvCell).join(';')).join('\r\n');
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="pedidos-gr-visual-${stamp}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
