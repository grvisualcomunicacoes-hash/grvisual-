import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckoutForm } from '@/components/CheckoutForm';
import { getContent } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Solicitar orçamento',
  description: 'Conte o que o seu negócio precisa e receba um orçamento personalizado da GR Visual Comunicações.',
  alternates: { canonical: '/orcamento' },
};

export default async function OrcamentoPage() {
  const c = await getContent();
  return (
    <section className="page-hero">
      <div className="container" style={{ maxWidth: 760 }}>
        <nav className="breadcrumb" aria-label="Você está em"><Link href="/">Início</Link> / Solicitar orçamento</nav>
        <h1>Solicitar orçamento</h1>
        <p className="lead" style={{ marginBottom: 8 }}>Não precisa escolher um pacote: descreva o que você precisa e a gente monta a proposta.</p>
        <p className="small muted" style={{ marginBottom: 24 }}>Já escolheu pacotes? <Link href="/carrinho">Revise seu carrinho</Link>.</p>
        <CheckoutForm mode="custom" businessWhatsApp={c.contact.whatsapp} notices={c.notices} />
      </div>
    </section>
  );
}
