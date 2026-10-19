import type { Metadata } from 'next';
import Link from 'next/link';
import { getContent } from '@/lib/data';

export const metadata: Metadata = { title: 'Política de privacidade e tratamento de dados', alternates: { canonical: '/privacidade' } };

export default async function PrivacidadePage() {
  const c = await getContent();
  return (
    <section className="page-hero">
      <div className="container">
        <nav className="breadcrumb" aria-label="Você está em"><Link href="/">Início</Link> / Privacidade</nav>
        <h1>Política de privacidade e tratamento de dados</h1>
        <div className="prose" style={{ marginTop: 16 }}>
          {c.privacy.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}
          <p>
            Contato: <a href={`mailto:${c.contact.email}`}>{c.contact.email}</a> · WhatsApp {c.contact.whatsappDisplay}
          </p>
        </div>
      </div>
    </section>
  );
}
