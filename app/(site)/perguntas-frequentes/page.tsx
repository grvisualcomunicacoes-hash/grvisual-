import type { Metadata } from 'next';
import Link from 'next/link';
import { getFaqs } from '@/lib/data';

export const metadata: Metadata = { title: 'Perguntas frequentes', alternates: { canonical: '/perguntas-frequentes' } };

export default async function FaqPage() {
  const faqs = await getFaqs();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
  };
  return (
    <section className="page-hero">
      <div className="container">
        <nav className="breadcrumb" aria-label="Você está em"><Link href="/">Início</Link> / Perguntas frequentes</nav>
        <h1>Perguntas frequentes</h1>
        <div className="faq" style={{ marginTop: 20 }}>
          {faqs.map((f) => (
            <details key={f.id}>
              <summary>{f.question}</summary>
              <div className="answer">{f.answer}</div>
            </details>
          ))}
        </div>
        <p className="muted" style={{ marginTop: 24 }}>Não encontrou sua dúvida? <Link href="/orcamento">Fale com a gente</Link>.</p>
      </div>
      {faqs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />}
    </section>
  );
}
