import type { Metadata } from 'next';
import Link from 'next/link';
import { Notices } from '@/components/Notices';
import { PackageCard } from '@/components/PackageCard';
import { SERVICE_CATEGORIES } from '@/lib/categories';
import { getContent, getPackages } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Serviços e pacotes',
  description: 'Pacotes de gestão de redes sociais, tráfego pago, divulgação, identidade visual e produção de conteúdo da GR Visual Comunicações.',
  alternates: { canonical: '/servicos' },
};

export default async function ServicosPage() {
  const [packages, content] = await Promise.all([getPackages(), getContent()]);
  const groups = SERVICE_CATEGORIES.map((c) => ({ ...c, items: packages.filter((p) => p.category === c.key) })).filter((g) => g.items.length);
  const known = new Set<string>(SERVICE_CATEGORIES.map((c) => c.key));
  const others = packages.filter((p) => !known.has(p.category));
  if (others.length) groups.push({ key: 'outros', label: 'Outros serviços', items: others } as (typeof groups)[number]);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumb" aria-label="Você está em"><Link href="/">Início</Link> / Serviços</nav>
          <h1>Serviços e pacotes</h1>
          <p className="lead">Adicione ao carrinho o que faz sentido para o seu negócio. Você revisa tudo antes de enviar — nada é cobrado pelo site.</p>
        </div>
      </section>
      {groups.length > 1 && (
        <div className="container">
          <nav className="filter-bar" aria-label="Categorias">
            {groups.map((g) => (
              <a key={g.key} href={`#${g.key}`} className="chip">{g.label}</a>
            ))}
          </nav>
        </div>
      )}
      {groups.map((g) => (
        <section key={g.key} id={g.key} className="section-sm" style={{ scrollMarginTop: 80 }}>
          <div className="container">
            <h2 style={{ fontSize: '1.5rem' }}>{g.label}</h2>
            <div className="grid grid-3">
              {g.items.map((p) => (
                <PackageCard key={p.id} pkg={p} showCategory={false} />
              ))}
            </div>
          </div>
        </section>
      ))}
      {!groups.length && (
        <div className="container"><div className="empty-state muted">Os pacotes estão sendo atualizados. <Link href="/orcamento">Solicite um orçamento</Link>.</div></div>
      )}
      <section className="section-sm">
        <div className="container">
          <Notices notices={content.notices} title="Importante" />
        </div>
      </section>
    </>
  );
}
