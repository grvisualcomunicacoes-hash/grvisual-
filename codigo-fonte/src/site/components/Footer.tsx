import { Link } from '../router';
import type { SiteContent } from '@/lib/types';
import { IconFacebook, IconInstagram, IconMail, IconTikTok, IconWhatsApp } from './Icons';

export function Footer({ content }: { content: SiteContent }) {
  const { contact, brand } = content;
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link to="/" className="brand">
              <img src={brand.logoUrl} alt="" width={55} height={30} loading="lazy" />
              <span className="brand-text">
                <span className="brand-name">GR VISUAL</span>
                <span className="brand-sub">COMUNICAÇÕES</span>
              </span>
            </Link>
            <p className="muted small" style={{ marginTop: 14 }}>
              {brand.slogan}. {contact.region}
            </p>
            <div className="socials">
              {contact.instagram && (
                <a href={contact.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <IconInstagram />
                </a>
              )}
              {contact.facebook && (
                <a href={contact.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <IconFacebook />
                </a>
              )}
              {contact.tiktok && (
                <a href={contact.tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                  <IconTikTok />
                </a>
              )}
            </div>
          </div>
          <div>
            <h4>Navegação</h4>
            <ul className="footer-links">
              <li><Link to="/servicos">Serviços e pacotes</Link></li>
              <li><Link to="/redes-sociais">Gestão de redes sociais</Link></li>
              <li><Link to="/trafego-pago">Tráfego pago e divulgação</Link></li>
              <li><Link to="/identidade-visual">Identidade visual e artes</Link></li>
              <li><Link to="/portfolio">Portfólio</Link></li>
              <li><Link to="/como-funciona">Como funciona</Link></li>
            </ul>
          </div>
          <div>
            <h4>Contato</h4>
            <ul className="footer-links">
              <li>
                <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer">
                  <IconWhatsApp style={{ verticalAlign: '-4px', marginRight: 6 }} />
                  {contact.whatsappDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`}>
                  <IconMail style={{ verticalAlign: '-4px', marginRight: 6 }} />
                  {contact.email}
                </a>
              </li>
              <li><Link to="/orcamento">Solicitar orçamento</Link></li>
              <li><Link to="/perguntas-frequentes">Perguntas frequentes</Link></li>
              <li><Link to="/privacidade">Política de privacidade</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {year} {brand.name}. Todos os direitos reservados.</span>
          <span>Pedidos pelo site são solicitações de orçamento — sem cobrança online.</span>
        </div>
      </div>
    </footer>
  );
}
