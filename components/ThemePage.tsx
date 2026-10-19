import Link from 'next/link';
import { THEME_PAGES, type ThemeKey } from '@/lib/categories';
import { getPackages, getPortfolio } from '@/lib/data';
import { PackageCard } from './PackageCard';
import { PortfolioGallery } from './PortfolioGallery';

export async function ThemePage({ theme }: { theme: ThemeKey }) {
  const t = THEME_PAGES[theme];
  const [packages, portfolio] = await Promise.all([getPackages({ categories: t.categories }), getPortfolio()]);
  const related = portfolio.filter((p) => (t.portfolioCategories as readonly string[]).includes(p.category)).slice(0, 6);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumb" aria-label="Você está em">
            <Link href="/">Início</Link> / <Link href="/servicos">Serviços</Link> / {t.title}
          </nav>
          <h1>{t.title}</h1>
          <p className="lead">{t.intro}</p>
        </div>
      </section>
      <section className="section-sm">
        <div className="container">
          {packages.length ? (
            <div className="grid grid-3">
              {packages.map((p) => (
                <PackageCard key={p.id} pkg={p} showCategory={false} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p className="muted">Os pacotes desta categoria estão sendo atualizados.</p>
              <Link href="/orcamento" className="btn btn-primary">Solicitar orçamento</Link>
            </div>
          )}
          <p className="muted small" style={{ marginTop: 20 }}>
            Precisa de algo diferente? <Link href="/orcamento">Peça um orçamento personalizado</Link>.
          </p>
        </div>
      </section>
      {related.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <div className="eyebrow">Portfólio</div>
              <h2>Trabalhos relacionados</h2>
            </div>
            <PortfolioGallery items={related} showFilters={false} />
          </div>
        </section>
      )}
    </>
  );
}
