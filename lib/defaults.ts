/**
 * Conteúdo inicial do site.
 * - Usado para gerar o seed do banco (supabase/seed.sql) e como "plano B"
 *   quando o banco ainda não está configurado.
 * - Depois de publicado, TUDO isso é editado pelo painel /admin.
 * - Nada aqui foi inventado: os textos vêm do pedido da Pamella, da tabela
 *   comercial informada por ela e das imagens do portfólio enviadas.
 *   Campos sem informação ficam vazios para preencher no painel.
 */
import type { Faq, Package, PortfolioItem, SiteContent } from './types';

export const DEFAULT_CONTENT: SiteContent = {
  brand: {
    name: 'GR Visual Comunicações',
    slogan: 'Sua ideia, nossa criação',
    logoUrl: '/brand/gr-mark.png',
  },
  contact: {
    whatsapp: '5527988435960',
    whatsappDisplay: '(27) 98843-5960',
    email: 'grvisualcomunicacoes@gmail.com',
    region: 'Grande Vitória – ES',
    instagram: 'https://www.instagram.com/grvisualcomunicacoes',
    facebook: '',
    tiktok: '',
  },
  seo: {
    title: 'GR Visual Comunicações — Sua ideia, nossa criação',
    description:
      'Gestão de redes sociais, tráfego pago, identidade visual, artes e materiais impressos para pequenos negócios da Grande Vitória – ES. Monte seu pedido e fale pelo WhatsApp.',
  },
  hero: {
    kicker: 'Comunicação visual e marketing digital',
    title: 'Sua ideia, nossa criação',
    subtitle:
      'Redes sociais, tráfego pago, identidade visual e materiais impressos para o seu negócio ser visto — e lembrado.',
  },
  banner: { active: false, text: '', link: '' },
  about: {
    title: 'Sobre a GR Visual',
    paragraphs: [
      'A GR Visual Comunicações cria a comunicação de pequenos negócios e profissionais autônomos da Grande Vitória: identidade visual, artes para redes sociais, gestão de perfis, materiais digitais e impressos, cardápios, tabelas de preços, banners e tráfego pago.',
      'O trabalho vai além de criar artes: organizamos a apresentação da sua marca para que o seu perfil funcione como vitrine e como canal de contato com novos clientes.',
    ],
  },
  differentials: [
    { title: 'Do digital ao impresso', text: 'Redes sociais, cardápios, flyers, banners e identidade visual em um só lugar.' },
    { title: 'Pacotes para pequenos negócios', text: 'Opções pensadas para quem está começando ou quer crescer no digital.' },
    { title: 'Atendimento direto', text: 'Você fala com quem cria, pelo WhatsApp, do pedido à entrega.' },
    { title: 'Produção no seu negócio', text: 'Podemos ir até você para produzir conteúdo; o deslocamento é combinado à parte.' },
  ],
  howItWorks: [
    { title: 'Escolha', text: 'Navegue pelos pacotes e adicione ao carrinho o que faz sentido para o seu negócio — ou peça um orçamento personalizado.' },
    { title: 'Envie o pedido', text: 'Preencha seus dados e envie pelo WhatsApp ou por e-mail. Nenhum pagamento é feito pelo site.' },
    { title: 'Confirmação', text: 'Conferimos escopo, prazo e condições com você e enviamos a confirmação do orçamento.' },
    { title: 'Criação', text: 'Com tudo aprovado, começamos a produção e acompanhamos as entregas com você.' },
  ],
  notices: [
    'O envio do pedido não garante disponibilidade imediata.',
    'Os serviços dependem da confirmação de escopo, prazo e condições.',
    'A verba de anúncios (tráfego pago) é cobrada separadamente, direto pela plataforma.',
    'Serviços personalizados podem exigir orçamento individual.',
  ],
  testimonials: [],
  privacy: [
    'Esta política explica como a GR Visual Comunicações trata os dados enviados pelo site, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).',
    'Dados coletados: nome, nome da empresa (opcional), WhatsApp, e-mail (opcional), cidade, serviços de interesse, objetivo e observações sobre o projeto. Não solicitamos CPF nem documentos pessoais.',
    'Finalidade: usamos esses dados somente para responder à sua solicitação, preparar o orçamento e conduzir a contratação, quando houver.',
    'Compartilhamento: os dados não são vendidos nem cedidos a terceiros. Eles ficam armazenados em serviços de tecnologia contratados para o funcionamento do site (hospedagem, banco de dados e envio de e-mail).',
    'Guarda: mantemos os dados pelo tempo necessário para o atendimento e para obrigações legais. Você pode pedir a exclusão a qualquer momento.',
    'Seus direitos: você pode solicitar acesso, correção ou exclusão dos seus dados pelo WhatsApp ou e-mail informados neste site.',
    'O carrinho do site fica salvo apenas no seu próprio navegador, para que você não perca os itens escolhidos enquanto navega.',
  ],
};

type SeedPackage = Omit<Package, 'id'>;

const pkg = (p: Partial<SeedPackage> & Pick<SeedPackage, 'slug' | 'name' | 'category'>): SeedPackage => ({
  price: null,
  promo_price: null,
  pricing_mode: 'fixo',
  allow_quantity: false,
  max_quantity: 1,
  description: '',
  includes: [],
  excludes: [],
  duration: '',
  deliverables: '',
  needs_ad_budget: false,
  start_estimate: '',
  image_url: '',
  active: true,
  featured: false,
  sort_order: 100,
  notes: '',
  ...p,
});

/** Pacotes iniciais. Ativos = os 8 informados no pedido; inativos = tabela antiga, para revisar. */
export const SEED_PACKAGES: SeedPackage[] = [
  pkg({ slug: 'venda-rapida', name: 'Venda Rápida', category: 'divulgacao', price: 67, duration: '20 dias', featured: true, sort_order: 1 }),
  pkg({
    slug: 'mini',
    name: 'Mini',
    category: 'redes-sociais',
    price: 140,
    duration: '30 dias',
    featured: true,
    sort_order: 2,
    includes: [
      '2 publicações',
      '3 stories',
      'Divulgação em grupos de WhatsApp',
      'Estratégia básica',
      'Ajustes de identidade',
      'Tabela de preços ou delivery',
    ],
  }),
  pkg({ slug: 'social-trafego', name: 'Social + Tráfego', category: 'trafego-pago', price: 380, needs_ad_budget: true, featured: true, sort_order: 3 }),
  pkg({
    slug: 'gestao-trafego-pago',
    name: 'Gestão de tráfego pago',
    category: 'trafego-pago',
    price: 250,
    needs_ad_budget: true,
    excludes: ['Verba de anúncios (paga à parte, direto na plataforma)'],
    sort_order: 4,
  }),
  pkg({
    slug: 'digital-trafego',
    name: 'Digital + Tráfego',
    category: 'trafego-pago',
    price: 500,
    needs_ad_budget: true,
    includes: ['Google Meu Negócio'],
    featured: true,
    sort_order: 5,
  }),
  pkg({ slug: 'conteudo-adicional', name: 'Produção de conteúdo adicional', category: 'conteudo', price: 80, allow_quantity: true, max_quantity: 10, sort_order: 6 }),
  pkg({ slug: 'lancamento-de-marca', name: 'Lançamento de Marca', category: 'identidade-visual', price: 200, sort_order: 7 }),
  pkg({
    slug: 'sabor-completo',
    name: 'Sabor Completo',
    category: 'divulgacao',
    price: 170,
    description: 'Para lanchonetes e restaurantes: divulgação em grupos, cardápio, promoções, destaques e cartão ou panfleto digital.',
    includes: [
      'Cardápio digital + versão para imprimir',
      '4 artes de promoção ou combos',
      'Capa + 3 destaques para o Instagram',
      'Cartão digital com link do WhatsApp',
      'Panfleto digital',
      'Divulgação em grupos de WhatsApp durante 15 dias',
    ],
    sort_order: 8,
  }),
  // ---- Tabela anterior: entram INATIVOS para você revisar e ativar se quiser ----
  pkg({ slug: 'visibilidade', name: 'Visibilidade', category: 'redes-sociais', price: 30, active: false, sort_order: 20, includes: ['2 posts', '2 divulgações no WhatsApp', '1 arte', '1 story'] }),
  pkg({ slug: 'start', name: 'Start', category: 'redes-sociais', price: 50, active: false, sort_order: 21, includes: ['3 posts', '4 divulgações no WhatsApp', '2 divulgações no Facebook', '2 artes', '2 stories'] }),
  pkg({ slug: 'presenca-digital', name: 'Presença Digital', category: 'redes-sociais', price: 120, active: false, sort_order: 22, includes: ['4 posts', '4 stories', 'Artes', 'Textos', 'Divulgação', 'Organização mensal'] }),
  pkg({ slug: 'presenca', name: 'Presença', category: 'redes-sociais', price: 180, active: false, sort_order: 23, includes: ['Publicações semanais', 'Stories', 'Artes promocionais', 'Divulgação em grupos', 'Cartão e flyer digital'] }),
  pkg({ slug: 'campanha-essencial', name: 'Campanha Essencial', category: 'redes-sociais', price: 397, active: false, sort_order: 24, includes: ['8 posts', '8 stories', 'Legendas', 'Calendário', 'Destaques', 'Análise básica'] }),
  pkg({ slug: 'campanha-inicial', name: 'Campanha Inicial', category: 'impressos', price: 897, active: false, sort_order: 25, includes: ['5 artes', '5 stories', '500 flyers', 'Wind banner 2 m'] }),
  pkg({ slug: 'campanha-bairro', name: 'Campanha Bairro', category: 'impressos', price: 1790, active: false, sort_order: 26, includes: ['1.000 flyers A5', '500 adesivos', '5 promotores'] }),
  pkg({ slug: 'campanha-completa', name: 'Campanha Completa', category: 'impressos', price: 2990, active: false, sort_order: 27, includes: ['10.000 flyers A5', '500 adesivos', 'Banner gota 2 m', '5 promotores', 'Acompanhamento da equipe'] }),
  pkg({ slug: 'wind-banner', name: 'Wind Banner 2,70 × 0,70 m', category: 'impressos', price: 349.5, active: false, sort_order: 28, start_estimate: 'Prazo de cerca de 10 dias', notes: 'R$ 299,50 cada na compra de 2. Entrada de 50%. Criação da arte à parte: R$ 40.' }),
  pkg({ slug: 'divulgacao-de-vagas', name: 'Divulgação de vagas', category: 'divulgacao', price: 80, active: false, sort_order: 29, description: 'Divulgação em grupos de WhatsApp, Facebook e regionais.', notes: 'Preço "a partir de".' }),
];

type SeedPortfolio = Omit<PortfolioItem, 'id'>;

export const SEED_PORTFOLIO: SeedPortfolio[] = [
  {
    slug: 'fatima-confeitaria-case',
    title: 'Case de resultados — Fátima Confeitaria',
    client_name: 'Fátima Confeitaria',
    category: 'Cases',
    description:
      'Modernização da identidade visual (mantendo a orquídea e o lilás da marca), organização do perfil, bio estratégica, destaques e estratégia de conteúdo para aproximar a confeitaria do público.',
    highlights: [
      'Visualizações: 4.123 → 11.973 (+190,4%)',
      'Alcance: 350 → 2.381 contas (+580,3%)',
      'Interações: 53 → 286 (+439,6%)',
      'Novos seguidores: 8 → 45',
      'Visualizações nos stories: 3.600 → 7.900 (+119,4%)',
      'Comparativo de métricas do Instagram, junho → julho',
    ],
    services: ['Identidade visual', 'Organização de perfil', 'Estratégia de conteúdo', 'Social media'],
    images: [
      '/portfolio/fatima-capa.webp',
      '/portfolio/fatima-ponto-partida.webp',
      '/portfolio/fatima-identidade.webp',
      '/portfolio/fatima-perfil.webp',
      '/portfolio/fatima-conteudo.webp',
      '/portfolio/fatima-resultados.webp',
      '/portfolio/fatima-numeros.webp',
    ],
    published: true,
    sort_order: 1,
  },
  {
    slug: 'cris-organiza-perfil',
    title: 'Organização de perfil — Cris Organiza',
    client_name: 'Cris Organiza',
    category: 'Social media',
    description:
      'Transformação do perfil de uma personal organizer: bio com informações claras, destaques personalizados e padronizados e feed com identidade visual coesa.',
    highlights: [
      'Organização da bio',
      'Destaques personalizados e padronizados',
      'Feed estratégico com identidade visual',
      'Conteúdo alinhado com o público e o serviço',
    ],
    services: ['Social media', 'Organização de perfil'],
    images: ['/portfolio/cris-antes-depois.webp', '/portfolio/cris-transformacao.webp'],
    published: true,
    sort_order: 2,
  },
  {
    slug: 'legaab-colecao-lumina',
    title: 'Campanha Coleção Lumina — Legaab Modas',
    client_name: 'Legaab Modas',
    category: 'Campanhas para redes sociais',
    description:
      'Sequência de artes para a campanha da Coleção Lumina: apresentação da coleção, looks, oferta para quem viesse pelo anúncio e informações da loja.',
    highlights: [],
    services: ['Campanha', 'Artes para redes sociais e anúncios'],
    images: ['/portfolio/legaab-lumina.webp'],
    published: true,
    sort_order: 3,
  },
  {
    slug: 'acaraje-do-iran',
    title: 'Cardápio e materiais — Acarajé do Iran',
    client_name: 'Acarajé do Iran',
    category: 'Cardápios e impressos',
    description:
      'Cardápio com itens e preços, arte vertical com chamada para pedidos no iFood e simulação de aplicação da marca em wind banner e display de mesa.',
    highlights: [],
    services: ['Cardápio', 'Arte para stories', 'Wind banner', 'Display de mesa'],
    images: ['/portfolio/acaraje-cardapio.webp', '/portfolio/acaraje-banner.webp', '/portfolio/acaraje-mockup.webp'],
    published: true,
    sort_order: 4,
  },
  {
    slug: 'miamore-bolsas-maternidade',
    title: 'Artes de produto — Miamore Bolsas Maternidade',
    client_name: 'Miamore Bolsas Maternidade',
    category: 'Artes para redes sociais',
    description: 'Artes que valorizam os detalhes das bolsas: estampa, laços, acabamento e alça, com a identidade delicada da marca.',
    highlights: [],
    services: ['Artes para redes sociais'],
    images: ['/portfolio/miamore-detalhes.webp', '/portfolio/miamore-kit.webp'],
    published: true,
    sort_order: 5,
  },
  {
    slug: 'teotelas',
    title: 'Logotipo e flyer — Teotelas',
    client_name: 'Teotelas',
    category: 'Identidade visual',
    description: 'Logotipo para empresa de telas e redes de proteção e flyer digital com serviços e QR code para o WhatsApp.',
    highlights: [],
    services: ['Logotipo', 'Flyer digital'],
    images: ['/portfolio/teotelas-flyer.webp', '/portfolio/teotelas-logo.webp'],
    published: true,
    sort_order: 6,
  },
  {
    slug: 'vinix-clean',
    title: 'Oferta antes e depois — Vinix Clean',
    client_name: 'Vinix Clean',
    category: 'Artes para redes sociais',
    description: 'Arte promocional para higienização de sofá retrátil, com comparação antes e depois e chamada para agendamento pelo WhatsApp.',
    highlights: [],
    services: ['Arte promocional'],
    images: ['/portfolio/vinix-oferta.webp'],
    published: true,
    sort_order: 7,
  },
  {
    slug: 'luna-pink',
    title: 'Logotipo — Luna Pink',
    client_name: 'Luna Pink',
    category: 'Identidade visual',
    description: 'Logotipo para marca de moda fitness feminina.',
    highlights: [],
    services: ['Logotipo'],
    images: ['/portfolio/luna-pink-logo.webp'],
    published: true,
    sort_order: 8,
  },
];

export const SEED_FAQS: Omit<Faq, 'id'>[] = [
  {
    question: 'Como funciona a contratação pelo site?',
    answer:
      'Você escolhe os serviços, preenche seus dados e envia o pedido pelo WhatsApp ou por e-mail. Depois conferimos com você o escopo, o prazo e as condições antes de qualquer confirmação.',
    sort_order: 1,
    active: true,
  },
  {
    question: 'Preciso pagar alguma coisa pelo site?',
    answer: 'Não. O site não faz cobranças. O pagamento é combinado diretamente com a GR Visual depois que o orçamento for confirmado.',
    sort_order: 2,
    active: true,
  },
  {
    question: 'A verba dos anúncios está inclusa nos pacotes de tráfego pago?',
    answer: 'Não. O valor do pacote é pela gestão. A verba investida nos anúncios é paga à parte, diretamente na plataforma (Meta, Google etc.).',
    sort_order: 3,
    active: true,
  },
  {
    question: 'Posso pedir um serviço que não está na lista?',
    answer: 'Pode, sim. Use a opção "Solicitar orçamento" e descreva o que você precisa.',
    sort_order: 4,
    active: true,
  },
  {
    question: 'Vocês vão até o meu negócio para produzir conteúdo?',
    answer: 'Sim, a produção de conteúdo pode ser feita no local. O deslocamento é combinado e pago à parte pelo cliente.',
    sort_order: 5,
    active: true,
  },
];
