import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="section">
      <div className="container empty-state">
        <h1 style={{ fontSize: '2rem' }}>Página não encontrada</h1>
        <p className="muted">O endereço pode ter mudado ou o serviço não está mais disponível.</p>
        <div className="btn-row" style={{ justifyContent: 'center' }}>
          <Link href="/" className="btn btn-primary">Ir para o início</Link>
          <Link href="/servicos" className="btn">Ver serviços</Link>
        </div>
      </div>
    </section>
  );
}
