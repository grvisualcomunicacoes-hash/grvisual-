import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="section">
      <div className="container empty-state">
        <h1 style={{ fontSize: '2rem' }}>Página não encontrada</h1>
        <p className="muted">O endereço pode ter mudado.</p>
        <Link href="/" className="btn btn-primary">Ir para o início</Link>
      </div>
    </main>
  );
}
