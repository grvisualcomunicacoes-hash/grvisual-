import { createRoot } from 'react-dom/client';
import type { ThemeKey } from '@/lib/categories';
import { CartProvider } from './components/CartProvider';
import { CartToast } from './components/CartToast';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { WhatsAppFloat } from './components/WhatsAppFloat';
import { DataProvider, useData } from './data';
import * as P from './pages';
import { useRoute } from './router';

function Page({ path }: { path: string }) {
  if (path === '/' || path === '') return <P.HomePage />;
  if (path === '/servicos') return <P.ServicosPage />;
  if (path.startsWith('/servicos/')) return <P.ServicoPage slug={decodeURIComponent(path.slice('/servicos/'.length))} />;
  if (['/redes-sociais', '/trafego-pago', '/identidade-visual'].includes(path)) return <P.ThemePage theme={path.slice(1) as ThemeKey} />;
  if (path === '/portfolio') return <P.PortfolioPage />;
  if (path === '/sobre') return <P.SobrePage />;
  if (path === '/como-funciona') return <P.ComoFuncionaPage />;
  if (path === '/perguntas-frequentes') return <P.FaqPage />;
  if (path === '/orcamento') return <P.OrcamentoPage />;
  if (path === '/carrinho') return <P.CarrinhoPage />;
  if (path === '/finalizar') return <P.FinalizarPage />;
  if (path === '/privacidade') return <P.PrivacidadePage />;
  return <P.NotFoundPage />;
}

function App() {
  const path = useRoute();
  const { data, loading } = useData();
  const c = data.content;
  return (
    <CartProvider>
      <a href="#conteudo" className="skip-link" onClick={(e) => { e.preventDefault(); document.getElementById('conteudo')?.focus(); }}>Pular para o conteúdo</a>
      {c.banner.active && c.banner.text && (
        <div className="top-banner">{c.banner.link ? <a href={c.banner.link.startsWith('/') ? `#${c.banner.link}` : c.banner.link}>{c.banner.text}</a> : c.banner.text}</div>
      )}
      <Header logoUrl={c.brand.logoUrl} brandName={c.brand.name} />
      <main id="conteudo" tabIndex={-1} style={{ outline: 'none' }}>
        {loading ? (
          <div className="section"><div className="container empty-state muted"><span className="spinner" style={{ display: 'inline-block' }} /> Carregando…</div></div>
        ) : (
          <Page path={path} />
        )}
      </main>
      <Footer content={c} />
      <WhatsAppFloat phone={c.contact.whatsapp} />
      <CartToast />
    </CartProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <DataProvider>
    <App />
  </DataProvider>
);
