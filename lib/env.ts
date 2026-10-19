export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
function resolveSiteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`,
    process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
  ];
  for (const c of candidates) {
    if (!c) continue;
    try {
      return new URL(c).origin;
    } catch {
      /* ignora valor inválido */
    }
  }
  return 'http://localhost:3000';
}

/** Endereço público do site (para SEO, sitemap e links nos e-mails). */
export const SITE_URL = resolveSiteUrl();

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('SEU-PROJETO'));
}

/** Só existe no servidor (sem prefixo NEXT_PUBLIC_). */
export function serviceRoleKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

export function emailConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY || '',
    from: process.env.EMAIL_FROM || 'GR Visual Site <onboarding@resend.dev>',
    to: process.env.ORDER_NOTIFY_EMAIL || 'grvisualcomunicacoes@gmail.com',
  };
}
