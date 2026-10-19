import { Link, useRoute } from '../router';
import { useEffect, useState } from 'react';
import { useCart } from './CartProvider';
import { IconCart, IconClose, IconMenu } from './Icons';

const NAV = [
  { href: '/', label: 'Início' },
  { href: '/servicos', label: 'Serviços' },
  { href: '/portfolio', label: 'Portfólio' },
  { href: '/como-funciona', label: 'Como funciona' },
  { href: '/perguntas-frequentes', label: 'Dúvidas' },
  { href: '/sobre', label: 'Sobre' },
];

const MOBILE_EXTRA = [
  { href: '/redes-sociais', label: 'Gestão de redes sociais' },
  { href: '/trafego-pago', label: 'Tráfego pago e divulgação' },
  { href: '/identidade-visual', label: 'Identidade visual e artes' },
  { href: '/orcamento', label: 'Solicitar orçamento' },
];

export function Header({ logoUrl, brandName }: { logoUrl: string; brandName: string }) {
  const pathname = useRoute();
  const [open, setOpen] = useState(false);
  const { count, ready } = useCart();

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand" aria-label={`${brandName} — página inicial`}>
                    <img src={logoUrl} alt="" width={55} height={30} />
          <span className="brand-text">
            <span className="brand-name">GR VISUAL</span>
            <span className="brand-sub">COMUNICAÇÕES</span>
          </span>
        </Link>

        <nav className="main-nav" aria-label="Principal">
          {NAV.map((n) => (
            <Link key={n.href} to={n.href} aria-current={isActive(n.href) ? 'page' : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <Link to="/orcamento" className="btn btn-primary btn-sm header-cta">
            Solicitar orçamento
          </Link>
          <Link to="/carrinho" className="cart-btn" aria-label={`Carrinho${ready && count ? `, ${count} itens` : ''}`}>
            <IconCart />
            {ready && count > 0 && <span className="cart-count">{count}</span>}
          </Link>
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" className="container mobile-nav" aria-label="Menu">
          {[...NAV, ...MOBILE_EXTRA].map((n) => (
            <Link key={n.href} to={n.href} aria-current={isActive(n.href) ? 'page' : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
