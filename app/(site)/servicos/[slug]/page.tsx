import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AddToCartButton } from '@/components/AddToCartButton';
import { Notices } from '@/components/Notices';
import { PriceTag } from '@/components/PackageCard';
import { categoryLabel } from '@/lib/categories';
import { getContent, getPackageBySlug, getPackages } from '@/lib/data';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const all = await getPackages();
  return all.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);
  if (!pkg) return { title: 'Serviço não encontrado' };
  return {
    title: pkg.name,
    description: pkg.description || `${pkg.name} — ${categoryLabel(pkg.category)} | GR Visual Comunicações`,
    alternates: { canonical: `/servicos/${pkg.slug}` },
  };
}

export default async function ServicoPage({ params }: Props) {
  const { slug } = await params;
  const [pkg, content] = await Promise.all([getPackageBySlug(slug), getContent()]);
  if (!pkg) notFound();

  const facts = [
    pkg.duration && ['Duração', pkg.duration],
    pkg.deliverables && ['Entregáveis', pkg.deliverables],
    pkg.start_estimate && ['Prazo estimado de início', pkg.start_estimate],
    pkg.needs_ad_budget && ['Verba de anúncios', 'Não inclusa — paga à parte, direto na plataforma'],
  ].filter(Boolean) as [string, string][];

  return (
    <section className="page-hero">
      <div className="container">
        <nav className="breadcrumb" aria-label="Você está em">
          <Link href="/">Início</Link> / <Link href="/servicos">Serviços</Link> / {pkg.name}
        </nav>
        <div className="detail-layout">
          <div>
            <div className="eyebrow">{categoryLabel(pkg.category)}</div>
            <h1>{pkg.name}</h1>
            {pkg.description && <p className="lead">{pkg.description}</p>}
            {pkg.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pkg.image_url} alt="" style={{ borderRadius: 18, border: '1px solid var(--line)', margin: '20px 0' }} />
            )}
            {pkg.includes.length > 0 && (
              <div className="card" style={{ marginTop: 20 }}>
                <h2 style={{ fontSize: '1.2rem' }}>O que está incluído</h2>
                <ul className="check-list">{pkg.includes.map((i) => <li key={i}>{i}</li>)}</ul>
              </div>
            )}
            {pkg.excludes.length > 0 && (
              <div className="card" style={{ marginTop: 16 }}>
                <h2 style={{ fontSize: '1.2rem' }}>O que não está incluído</h2>
                <ul className="check-list x-list">{pkg.excludes.map((i) => <li key={i}>{i}</li>)}</ul>
              </div>
            )}
            {pkg.notes && (
              <div className="card" style={{ marginTop: 16 }}>
                <h2 style={{ fontSize: '1.2rem' }}>Observações e condições</h2>
                <p className="muted" style={{ whiteSpace: 'pre-line', margin: 0 }}>{pkg.notes}</p>
              </div>
            )}
          </div>
          <aside className="card summary">
            <PriceTag pkg={pkg} />
            {facts.length > 0 && (
              <dl style={{ margin: 0, display: 'grid', gap: 10 }}>
                {facts.map(([k, v]) => (
                  <div key={k} className="summary-row" style={{ flexDirection: 'column', gap: 2 }}>
                    <dt className="muted small">{k}</dt>
                    <dd style={{ margin: 0, fontWeight: 600 }}>{v}</dd>
                  </div>
                ))}
              </dl>
            )}
            <AddToCartButton pkg={pkg} full />
            <Link href="/orcamento" className="btn btn-ghost btn-block btn-sm">Prefiro pedir um orçamento personalizado</Link>
            <Notices notices={content.notices} title="Importante" />
          </aside>
        </div>
      </div>
    </section>
  );
}
