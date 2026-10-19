import type { Metadata } from 'next';
import Link from 'next/link';
import { PortfolioGallery } from '@/components/PortfolioGallery';
import { getPortfolio } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Portfólio',
  description: 'Trabalhos reais da GR Visual Comunicações: social media, identidade visual, campanhas, cardápios e artes para redes sociais.',
  alternates: { canonical: '/portfolio' },
};

export default async function PortfolioPage() {
  const items = await getPortfolio();
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumb" aria-label="Você está em"><Link href="/">Início</Link> / Portfólio</nav>
          <h1>Portfólio</h1>
          <p className="lead">Projetos desenvolvidos para negócios reais. Toque em um trabalho para ver todas as imagens e os serviços realizados.</p>
        </div>
      </section>
      <section className="section-sm">
        <div className="container">
          <PortfolioGallery items={items} />
        </div>
      </section>
    </>
  );
}
