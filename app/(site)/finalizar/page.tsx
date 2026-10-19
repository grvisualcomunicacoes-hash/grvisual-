import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckoutForm } from '@/components/CheckoutForm';
import { getContent } from '@/lib/data';

export const metadata: Metadata = { title: 'Finalizar pedido', robots: { index: false } };

export default async function FinalizarPage() {
  const c = await getContent();
  return (
    <section className="page-hero">
      <div className="container" style={{ maxWidth: 760 }}>
        <nav className="breadcrumb" aria-label="Você está em"><Link href="/">Início</Link> / <Link href="/carrinho">Carrinho</Link> / Finalizar</nav>
        <h1>Finalizar pedido</h1>
        <p className="lead" style={{ marginBottom: 24 }}>Só pedimos o necessário para responder. Não solicitamos CPF nem documentos.</p>
        <CheckoutForm mode="cart" businessWhatsApp={c.contact.whatsapp} notices={c.notices} />
      </div>
    </section>
  );
}
