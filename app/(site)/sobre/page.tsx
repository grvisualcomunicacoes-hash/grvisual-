import type { Metadata } from 'next';
import Link from 'next/link';
import { getContent } from '@/lib/data';

export const metadata: Metadata = { title: 'Sobre a GR Visual', alternates: { canonical: '/sobre' } };

export default async function SobrePage() {
  const c = await getContent();
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumb" aria-label="Você está em"><Link href="/">Início</Link> / Sobre</nav>
          <div className="eyebrow">{c.brand.slogan}</div>
          <h1>{c.about.title}</h1>
          <div className="prose">{c.about.paragraphs.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}</div>
        </div>
      </section>
      {c.differentials.length > 0 && (
        <section className="section-sm">
          <div className="container grid grid-4">
            {c.differentials.map((d) => (
              <div className="card" key={d.title}>
                <h3>{d.title}</h3>
                <p className="muted small" style={{ margin: 0 }}>{d.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}
      <section className="section-sm">
        <div className="container btn-row">
          <Link href="/servicos" className="btn btn-primary">Ver serviços</Link>
          <Link href="/portfolio" className="btn">Ver portfólio</Link>
        </div>
      </section>
    </>
  );
}
