import type { MetadataRoute } from 'next';
import { getPackages } from '@/lib/data';
import { SITE_URL } from '@/lib/env';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ['', '/sobre', '/servicos', '/redes-sociais', '/trafego-pago', '/identidade-visual', '/portfolio', '/como-funciona', '/perguntas-frequentes', '/orcamento', '/privacidade'];
  const packages = await getPackages();
  return [
    ...pages.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: 'weekly' as const, priority: p === '' ? 1 : 0.7 })),
    ...packages.map((p) => ({ url: `${SITE_URL}/servicos/${p.slug}`, changeFrequency: 'weekly' as const, priority: 0.6 })),
  ];
}
