import type { Metadata } from 'next';
import Link from 'next/link';
import { Notices } from '@/components/Notices';
import { getContent } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Como funciona a contratação',
  description: 'Escolha os serviços, envie o pedido pelo WhatsApp ou e-mail e receba a confirmação de escopo, prazo e condições.',
  alternates: { canonical: '/como-funciona' },
};

export default async function ComoFuncionaPage() {
  const c = await getContent();
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <nav className="breadcrumb" aria-label="Você está em"><Link href="/">Início</Link> / Como funciona</nav>
          <h1>Como funciona a contratação</h1>
          <p className="lead">Simples e sem compromisso: o pedido pelo site é uma solicitação de orçamento.</p>
        </div>
      </section>
      <section className="section-sm">
        <div className="container">
          <div className="steps">
            {c.howItWorks.map((s) => (
              <div className="step" key={s.title}>
                <h3>{s.title}</h3>
                <p className="muted small" style={{ margin: 0 }}>{s.text}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24 }}><Notices notices={c.notices} title="Importante" /></div>
          <div className="btn-row" style={{ marginTop: 24 }}>
            <Link href="/servicos" className="btn btn-primary">Escolher serviços</Link>
            <Link href="/orcamento" className="btn">Pedir orçamento personalizado</Link>
          </div>
        </div>
      </section>
    </>
  );
}
