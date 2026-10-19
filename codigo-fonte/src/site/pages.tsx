import { useEffect } from 'react';
import { THEME_PAGES, SERVICE_CATEGORIES, categoryLabel, type ThemeKey } from '@/lib/categories';
import { activeFaqs, activePackages, publishedPortfolio } from '@/lib/site-data';
import { AddToCartButton } from './components/AddToCartButton';
import { CartView } from './components/CartView';
import { CheckoutForm } from './components/CheckoutForm';
import { IconArrow, IconChat, IconMegaphone, IconPalette, IconWhatsApp } from './components/Icons';
import { Notices } from './components/Notices';
import { PackageCard, PriceTag } from './components/PackageCard';
import { PortfolioGallery } from './components/PortfolioGallery';
import { useData } from './data';
import { Link } from './router';

function useTitle(title?: string, description?: string) {
  const { data } = useData();
  useEffect(() => {
    document.title = title ? `${title} | ${data.content.brand.name}` : data.content.seo.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', description || data.content.seo.description);
  }, [title, description, data]);
}

function Crumbs({ items }: { items: [string, string?][] }) {
  return (
    <nav className="breadcrumb" aria-label="Você está em">
      <Link to="/">Início</Link>
      {items.map(([label, to]) => (
        <span key={label}> / {to ? <Link to={to}>{label}</Link> : label}</span>
      ))}
    </nav>
  );
}

const THEME_ICONS = { 'redes-sociais': IconChat, 'trafego-pago': IconMegaphone, 'identidade-visual': IconPalette } as const;

export function HomePage() {
  useTitle();
  const { data } = useData();
  const content = data.content;
  const featured = activePackages(data).filter((p) => p.featured);
  const portfolio = publishedPortfolio(data);
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
              <Link to="/servicos" className="btn btn-primary">Conhecer os pacotes <IconArrow /></Link>
              <Link to="/portfolio" className="btn">Ver portfólio</Link>
              <Link to="/orcamento" className="btn btn-grad">Solicitar orçamento</Link>
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
                  <img src={src} alt="" loading={i < 2 ? 'eager' : 'lazy'} />
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
              <Link to="/servicos" className="btn btn-sm">Ver todos os serviços <IconArrow /></Link>
            </div>
            <div className="grid grid-4">
              {featured.map((p) => <PackageCard key={p.slug} pkg={p} />)}
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
            {(Object.keys(THEME_PAGES) as ThemeKey[]).map((key) => {
              const t = THEME_PAGES[key];
              const Icon = THEME_ICONS[key];
              return (
                <Link key={key} to={`/${key}`} className="cat-card">
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
              <Link to="/portfolio" className="btn btn-sm">Ver portfólio completo <IconArrow /></Link>
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
              <a className="btn btn-whatsapp" href={`https://wa.me/${content.contact.whatsapp}?text=${encodeURIComponent('Olá! Vim pelo site da GR Visual e gostaria de um orçamento.')}`} target="_blank" rel="noopener noreferrer">
                <IconWhatsApp /> Chamar no WhatsApp
              </a>
              <Link to="/orcamento" className="btn">Montar orçamento</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function ServicosPage() {
  useTitle('Serviços e pacotes', 'Pacotes de gestão de redes sociais, tráfego pago, divulgação, identidade visual e produção de conteúdo.');
  const { data } = useData();
  const packages = activePackages(data);
  const known = new Set<string>(SERVICE_CATEGORIES.map((c) => c.key));
  const groups: { key: string; label: string; items: typeof packages }[] = SERVICE_CATEGORIES.map((c) => ({ key: c.key as string, label: c.label as string, items: packages.filter((p) => p.category === c.key) })).filter((g) => g.items.length);
  const others = packages.filter((p) => !known.has(p.category));
  if (others.length) groups.push({ key: 'outros-extra', label: 'Outros serviços', items: others });

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Crumbs items={[['Serviços']]} />
          <h1>Serviços e pacotes</h1>
          <p className="lead">Adicione ao carrinho o que faz sentido para o seu negócio. Você revisa tudo antes de enviar — nada é cobrado pelo site.</p>
        </div>
      </section>
      {groups.length > 1 && (
        <div className="container">
          <nav className="filter-bar" aria-label="Categorias">
            {groups.map((g) => (
              <button key={g.key} type="button" className="chip" onClick={() => document.getElementById(`sec-${g.key}`)?.scrollIntoView({ behavior: 'smooth' })}>
                {g.label}
              </button>
            ))}
          </nav>
        </div>
      )}
      {groups.map((g) => (
        <section key={g.key} id={`sec-${g.key}`} className="section-sm" style={{ scrollMarginTop: 80 }}>
          <div className="container">
            <h2 style={{ fontSize: '1.5rem' }}>{g.label}</h2>
            <div className="grid grid-3">
              {g.items.map((p) => <PackageCard key={p.slug} pkg={p} showCategory={false} />)}
            </div>
          </div>
        </section>
      ))}
      {!groups.length && (
        <div className="container"><div className="empty-state muted">Os pacotes estão sendo atualizados. <Link to="/orcamento">Solicite um orçamento</Link>.</div></div>
      )}
      <section className="section-sm">
        <div className="container"><Notices notices={data.content.notices} title="Importante" /></div>
      </section>
    </>
  );
}

export function ServicoPage({ slug }: { slug: string }) {
  const { data } = useData();
  const pkg = activePackages(data).find((p) => p.slug === slug);
  useTitle(pkg?.name ?? 'Serviço não encontrado', pkg?.description);
  if (!pkg) return <NotFoundPage />;

  const facts = [
    pkg.duration && ['Duração', pkg.duration],
    pkg.deliverables && ['Entregáveis', pkg.deliverables],
    pkg.start_estimate && ['Prazo estimado de início', pkg.start_estimate],
    pkg.needs_ad_budget && ['Verba de anúncios', 'Não inclusa — paga à parte, direto na plataforma'],
  ].filter(Boolean) as [string, string][];

  return (
    <section className="page-hero">
      <div className="container">
        <Crumbs items={[['Serviços', '/servicos'], [pkg.name]]} />
        <div className="detail-layout">
          <div>
            <div className="eyebrow">{categoryLabel(pkg.category)}</div>
            <h1>{pkg.name}</h1>
            {pkg.description && <p className="lead">{pkg.description}</p>}
            {pkg.image_url && <img src={pkg.image_url} alt="" style={{ borderRadius: 18, border: '1px solid var(--line)', margin: '20px 0' }} />}
            {pkg.includes.length > 0 && (
              <div className="card" style={{ marginTop: 20 }}>
                <h2 style={{ fontSize: '1.2rem' }}>O que está incluído</h2>
                <ul className="check-list">{pkg.includes.map((i) => <li key={i}>{i}</li>)}</ul>
              </div>
            )}
            {pkg.excludes.length > 0 && (
              <div className="card" style={{ marginTop: 16 }}>
                <h2 style={{ fontSize: '1.2rem' }}>O que não está incluído</h2>
                <ul className="check-list x-list">{pkg.excludes.map((i) => <li key={i}>{i}</li>)}</ul>
              </div>
            )}
            {pkg.notes && (
              <div className="card" style={{ marginTop: 16 }}>
                <h2 style={{ fontSize: '1.2rem' }}>Observações e condições</h2>
                <p className="muted" style={{ whiteSpace: 'pre-line', margin: 0 }}>{pkg.notes}</p>
              </div>
            )}
          </div>
          <aside className="card summary">
            <PriceTag pkg={pkg} />
            {facts.length > 0 && (
              <dl style={{ margin: 0, display: 'grid', gap: 10 }}>
                {facts.map(([k, v]) => (
                  <div key={k} className="summary-row" style={{ flexDirection: 'column', gap: 2 }}>
                    <dt className="muted small">{k}</dt>
                    <dd style={{ margin: 0, fontWeight: 600 }}>{v}</dd>
                  </div>
                ))}
              </dl>
            )}
            <AddToCartButton pkg={pkg} full />
            <Link to="/orcamento" className="btn btn-ghost btn-block btn-sm">Prefiro pedir um orçamento personalizado</Link>
            <Notices notices={data.content.notices} title="Importante" />
          </aside>
        </div>
      </div>
    </section>
  );
}

export function ThemePage({ theme }: { theme: ThemeKey }) {
  const t = THEME_PAGES[theme];
  useTitle(t.title, t.intro);
  const { data } = useData();
  const packages = activePackages(data).filter((p) => (t.categories as readonly string[]).includes(p.category));
  const related = publishedPortfolio(data).filter((p) => (t.portfolioCategories as readonly string[]).includes(p.category)).slice(0, 6);
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Crumbs items={[['Serviços', '/servicos'], [t.title]]} />
          <h1>{t.title}</h1>
          <p className="lead">{t.intro}</p>
        </div>
      </section>
      <section className="section-sm">
        <div className="container">
          {packages.length ? (
            <div className="grid grid-3">{packages.map((p) => <PackageCard key={p.slug} pkg={p} showCategory={false} />)}</div>
          ) : (
            <div className="empty-state">
              <p className="muted">Os pacotes desta categoria estão sendo atualizados.</p>
              <Link to="/orcamento" className="btn btn-primary">Solicitar orçamento</Link>
            </div>
          )}
          <p className="muted small" style={{ marginTop: 20 }}>Precisa de algo diferente? <Link to="/orcamento">Peça um orçamento personalizado</Link>.</p>
        </div>
      </section>
      {related.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head"><div className="eyebrow">Portfólio</div><h2>Trabalhos relacionados</h2></div>
            <PortfolioGallery items={related} showFilters={false} />
          </div>
        </section>
      )}
    </>
  );
}

export function PortfolioPage() {
  useTitle('Portfólio', 'Trabalhos reais da GR Visual Comunicações: social media, identidade visual, campanhas, cardápios e artes.');
  const { data } = useData();
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Crumbs items={[['Portfólio']]} />
          <h1>Portfólio</h1>
          <p className="lead">Projetos desenvolvidos para negócios reais. Toque em um trabalho para ver todas as imagens e os serviços realizados.</p>
        </div>
      </section>
      <section className="section-sm"><div className="container"><PortfolioGallery items={publishedPortfolio(data)} /></div></section>
    </>
  );
}

export function SobrePage() {
  useTitle('Sobre a GR Visual');
  const c = useData().data.content;
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Crumbs items={[['Sobre']]} />
          <div className="eyebrow">{c.brand.slogan}</div>
          <h1>{c.about.title}</h1>
          <div className="prose">{c.about.paragraphs.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}</div>
        </div>
      </section>
      {c.differentials.length > 0 && (
        <section className="section-sm">
          <div className="container grid grid-4">
            {c.differentials.map((d) => (
              <div className="card" key={d.title}><h3>{d.title}</h3><p className="muted small" style={{ margin: 0 }}>{d.text}</p></div>
            ))}
          </div>
        </section>
      )}
      <section className="section-sm">
        <div className="container btn-row">
          <Link to="/servicos" className="btn btn-primary">Ver serviços</Link>
          <Link to="/portfolio" className="btn">Ver portfólio</Link>
        </div>
      </section>
    </>
  );
}

export function ComoFuncionaPage() {
  useTitle('Como funciona a contratação');
  const c = useData().data.content;
  return (
    <section className="page-hero">
      <div className="container">
        <Crumbs items={[['Como funciona']]} />
        <h1>Como funciona a contratação</h1>
        <p className="lead">Simples e sem compromisso: o pedido pelo site é uma solicitação de orçamento.</p>
        <div className="steps" style={{ marginTop: 24 }}>
          {c.howItWorks.map((s) => (
            <div className="step" key={s.title}><h3>{s.title}</h3><p className="muted small" style={{ margin: 0 }}>{s.text}</p></div>
          ))}
        </div>
        <div style={{ marginTop: 24 }}><Notices notices={c.notices} title="Importante" /></div>
        <div className="btn-row" style={{ marginTop: 24 }}>
          <Link to="/servicos" className="btn btn-primary">Escolher serviços</Link>
          <Link to="/orcamento" className="btn">Pedir orçamento personalizado</Link>
        </div>
      </div>
    </section>
  );
}

export function FaqPage() {
  useTitle('Perguntas frequentes');
  const faqs = activeFaqs(useData().data);
  return (
    <section className="page-hero">
      <div className="container">
        <Crumbs items={[['Perguntas frequentes']]} />
        <h1>Perguntas frequentes</h1>
        <div className="faq" style={{ marginTop: 20 }}>
          {faqs.map((f) => (
            <details key={f.id}>
              <summary>{f.question}</summary>
              <div className="answer">{f.answer}</div>
            </details>
          ))}
        </div>
        <p className="muted" style={{ marginTop: 24 }}>Não encontrou sua dúvida? <Link to="/orcamento">Fale com a gente</Link>.</p>
      </div>
    </section>
  );
}

export function PrivacidadePage() {
  useTitle('Política de privacidade');
  const c = useData().data.content;
  return (
    <section className="page-hero">
      <div className="container">
        <Crumbs items={[['Privacidade']]} />
        <h1>Política de privacidade e tratamento de dados</h1>
        <div className="prose" style={{ marginTop: 16 }}>
          {c.privacy.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}
          <p>Contato: <a href={`mailto:${c.contact.email}`}>{c.contact.email}</a> · WhatsApp {c.contact.whatsappDisplay}</p>
        </div>
      </div>
    </section>
  );
}

export function CarrinhoPage() {
  useTitle('Carrinho');
  const c = useData().data.content;
  return (
    <section className="page-hero">
      <div className="container">
        <Crumbs items={[['Carrinho']]} />
        <h1>Carrinho</h1>
        <p className="lead" style={{ marginBottom: 24 }}>Seu pedido é uma solicitação de orçamento — revise os serviços e envie quando quiser.</p>
        <CartView notices={c.notices} />
      </div>
    </section>
  );
}

export function FinalizarPage() {
  useTitle('Finalizar pedido');
  const c = useData().data.content;
  return (
    <section className="page-hero">
      <div className="container" style={{ maxWidth: 760 }}>
        <Crumbs items={[['Carrinho', '/carrinho'], ['Finalizar']]} />
        <h1>Finalizar pedido</h1>
        <p className="lead" style={{ marginBottom: 24 }}>Só pedimos o necessário para responder. Não solicitamos CPF nem documentos.</p>
        <CheckoutForm mode="cart" businessWhatsApp={c.contact.whatsapp} notices={c.notices} />
      </div>
    </section>
  );
}

export function OrcamentoPage() {
  useTitle('Solicitar orçamento', 'Conte o que o seu negócio precisa e receba um orçamento personalizado.');
  const c = useData().data.content;
  return (
    <section className="page-hero">
      <div className="container" style={{ maxWidth: 760 }}>
        <Crumbs items={[['Solicitar orçamento']]} />
        <h1>Solicitar orçamento</h1>
        <p className="lead" style={{ marginBottom: 8 }}>Não precisa escolher um pacote: descreva o que você precisa e a gente monta a proposta.</p>
        <p className="small muted" style={{ marginBottom: 24 }}>Já escolheu pacotes? <Link to="/carrinho">Revise seu carrinho</Link>.</p>
        <CheckoutForm mode="custom" businessWhatsApp={c.contact.whatsapp} notices={c.notices} />
      </div>
    </section>
  );
}

export function NotFoundPage() {
  useTitle('Página não encontrada');
  return (
    <section className="section">
      <div className="container empty-state">
        <h1 style={{ fontSize: '2rem' }}>Página não encontrada</h1>
        <p className="muted">O endereço pode ter mudado ou o serviço não está mais disponível.</p>
        <div className="btn-row" style={{ justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary">Ir para o início</Link>
          <Link to="/servicos" className="btn">Ver serviços</Link>
        </div>
      </div>
    </section>
  );
}
