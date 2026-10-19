import Link from 'next/link';
import { IconArrow, IconChat, IconMegaphone, IconPalette, IconWhatsApp } from '@/components/Icons';
import { PackageCard } from '@/components/PackageCard';
import { PortfolioGallery } from '@/components/PortfolioGallery';
import { THEME_PAGES } from '@/lib/categories';
import { getContent, getPackages, getPortfolio } from '@/lib/data';

const THEME_ICONS = { 'redes-sociais': IconChat, 'trafego-pago': IconMegaphone, 'identidade-visual': IconPalette } as const;

export default async function HomePage() {
  const [content, featured, portfolio] = await Promise.all([getContent(), getPackages({ featured: true }), getPortfolio()]);
  const heroImages = portfolio.flatMap((p) => p.images.slice(0, 1)).slice(0, 4);
  const testimonials = content.testimonials.filter((t) => t.authorized && t.text.trim());
  const [titleStart, ...rest] = content.hero.title.split(',');

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="reveal">
            <div className="eyebrow">{content.hero.kicker}</div>
            <h1>
              {rest.length ? (
                <>
                  {titleStart},<br />
                  <span className="grad-text">{rest.join(',').trim()}</span>
                </>
              ) : (
                <span className="grad-text">{content.hero.title}</span>
              )}
            </h1>
            <p className="lead">{content.hero.subtitle}</p>
            <div className="hero-actions">
              <Link href="/servicos" className="btn btn-primary">Conhecer os pacotes <IconArrow /></Link>
              <Link href="/portfolio" className="btn">Ver portfólio</Link>
              <Link href="/orcamento" className="btn btn-grad">Solicitar orçamento</Link>
            </div>
            <div className="hero-notes">
              <span>Sem pagamento pelo site</span>
              <span>Atendimento pelo WhatsApp</span>
              <span>{content.contact.region}</span>
            </div>
          </div>
          {heroImages.length >= 2 && (
            <div className="hero-visual" aria-hidden="true">
              <div className="hero-glow" />
              {heroImages.map((src, i) => (
                <div className="tile" key={src}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" loading={i < 2 ? 'eager' : 'lazy'} fetchPriority={i === 0 ? 'high' : undefined} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="section" id="pacotes">
          <div className="container">
            <div className="section-head-row">
              <div>
                <div className="eyebrow">Pacotes em destaque</div>
                <h2>Escolha como quer aparecer</h2>
              </div>
              <Link href="/servicos" className="btn btn-sm">Ver todos os serviços <IconArrow /></Link>
            </div>
            <div className="grid grid-4">
              {featured.map((p) => (
                <PackageCard key={p.id} pkg={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">Serviços</div>
            <h2>Tudo o que a sua marca precisa para ser vista</h2>
          </div>
          <div className="grid grid-3">
            {(Object.keys(THEME_PAGES) as (keyof typeof THEME_PAGES)[]).map((key) => {
              const t = THEME_PAGES[key];
              const Icon = THEME_ICONS[key];
              return (
                <Link key={key} href={`/${key}`} className="cat-card">
                  <span className="cat-icon"><Icon /></span>
                  <h3 style={{ margin: 0 }}>{t.title}</h3>
                  <p className="muted small" style={{ margin: 0 }}>{t.intro}</p>
                  <span className="more">Ver pacotes →</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {portfolio.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-head-row">
              <div>
                <div className="eyebrow">Portfólio</div>
                <h2>Trabalhos reais</h2>
              </div>
              <Link href="/portfolio" className="btn btn-sm">Ver portfólio completo <IconArrow /></Link>
            </div>
            <PortfolioGallery items={portfolio.slice(0, 6)} showFilters={false} />
          </div>
        </section>
      )}

      {content.differentials.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-head">
              <div className="eyebrow">Por que a GR Visual</div>
              <h2>Diferenciais</h2>
            </div>
            <div className="grid grid-4">
              {content.differentials.map((d) => (
                <div className="card" key={d.title}>
                  <h3>{d.title}</h3>
                  <p className="muted small" style={{ margin: 0 }}>{d.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <div className="section-head">
              <div className="eyebrow">Depoimentos</div>
              <h2>Quem já trabalhou com a gente</h2>
            </div>
            <div className="grid grid-3">
              {testimonials.map((t) => (
                <figure className="card testimonial" key={t.name + t.text.slice(0, 10)} style={{ margin: 0 }}>
                  <blockquote>“{t.text}”</blockquote>
                  <cite>— {t.name}{t.business ? `, ${t.business}` : ''}</cite>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-band">
            <div>
              <h2 style={{ marginBottom: 8 }}>Tem uma ideia? A gente cria.</h2>
              <p className="muted" style={{ margin: 0 }}>Conte o que você precisa e receba um orçamento pelo WhatsApp.</p>
            </div>
            <div className="btn-row" style={{ marginTop: 18 }}>
              <a
                className="btn btn-whatsapp"
                href={`https://wa.me/${content.contact.whatsapp}?text=${encodeURIComponent('Olá! Vim pelo site da GR Visual e gostaria de um orçamento.')}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconWhatsApp /> Chamar no WhatsApp
              </a>
              <Link href="/orcamento" className="btn">Montar orçamento</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
