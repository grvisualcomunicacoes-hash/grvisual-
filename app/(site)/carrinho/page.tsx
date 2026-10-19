import type { Metadata } from 'next';
import Link from 'next/link';
import { CartView } from '@/components/CartView';
import { getContent } from '@/lib/data';

export const metadata: Metadata = { title: 'Carrinho', robots: { index: false } };

export default async function CarrinhoPage() {
  const c = await getContent();
  return (
    <section className="page-hero">
      <div className="container">
        <nav className="breadcrumb" aria-label="Você está em"><Link href="/">Início</Link> / Carrinho</nav>
        <h1>Carrinho</h1>
        <p className="lead" style={{ marginBottom: 24 }}>Seu pedido é uma solicitação de orçamento — revise os serviços e envie quando quiser.</p>
        <CartView notices={c.notices} />
      </div>
    </section>
  );
}
