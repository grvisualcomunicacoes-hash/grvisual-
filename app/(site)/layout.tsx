import type { Metadata } from 'next';
import { CartProvider } from '@/components/CartProvider';
import { CartToast } from '@/components/CartToast';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { WhatsAppFloat } from '@/components/WhatsAppFloat';
import { getContent } from '@/lib/data';

// Páginas públicas são geradas e atualizadas a cada 60 s (e na hora, quando você salva no painel).
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent();
  return {
    title: { default: c.seo.title, template: `%s | ${c.brand.name}` },
    description: c.seo.description,
    openGraph: {
      type: 'website',
      locale: 'pt_BR',
      siteName: c.brand.name,
      title: c.seo.title,
      description: c.seo.description,
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: c.brand.name }],
    },
    twitter: { card: 'summary_large_image', title: c.seo.title, description: c.seo.description, images: ['/og-image.png'] },
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const content = await getContent();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: content.brand.name,
    slogan: content.brand.slogan,
    telephone: `+${content.contact.whatsapp}`,
    email: content.contact.email,
    areaServed: content.contact.region,
    sameAs: [content.contact.instagram, content.contact.facebook, content.contact.tiktok].filter(Boolean),
  };
  return (
    <CartProvider>
      <a href="#conteudo" className="skip-link">Pular para o conteúdo</a>
      {content.banner.active && content.banner.text && (
        <div className="top-banner">
          {content.banner.link ? <a href={content.banner.link}>{content.banner.text}</a> : content.banner.text}
        </div>
      )}
      <Header logoUrl={content.brand.logoUrl} brandName={content.brand.name} />
      <main id="conteudo">{children}</main>
      <Footer content={content} />
      <WhatsAppFloat phone={content.contact.whatsapp} />
      <CartToast />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    </CartProvider>
  );
}
