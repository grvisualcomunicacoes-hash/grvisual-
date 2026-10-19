/** Categorias de serviços. A chave é gravada no banco; o rótulo aparece no site. */
export const SERVICE_CATEGORIES = [
  { key: 'alimentacao', label: 'Lanchonetes, restaurantes e confeitarias' },
  { key: 'redes-sociais', label: 'Gestão de redes sociais' },
  { key: 'conteudo', label: 'Produção de conteúdo' },
  { key: 'trafego-pago', label: 'Tráfego pago' },
  { key: 'divulgacao', label: 'Divulgação' },
  { key: 'identidade-visual', label: 'Identidade visual e artes' },
  { key: 'impressos', label: 'Impressos e campanhas' },
  { key: 'kits', label: 'Kits para empreendedores' },
  { key: 'avulsos', label: 'Artes e serviços avulsos' },
  { key: 'outros', label: 'Outros serviços' },
] as const;

export function categoryLabel(key: string): string {
  return SERVICE_CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

/** Páginas temáticas do site e quais categorias cada uma reúne. */
export const THEME_PAGES = {
  'redes-sociais': {
    title: 'Gestão de redes sociais',
    intro:
      'Planejamento, criação e organização do seu perfil para que ele funcione como vitrine e canal de contato com novos clientes.',
    categories: ['redes-sociais', 'conteudo', 'alimentacao'],
    portfolioCategories: ['Social media', 'Cases', 'Artes para redes sociais', 'Campanhas para redes sociais'],
  },
  'trafego-pago': {
    title: 'Tráfego pago e divulgação',
    intro:
      'Anúncios e divulgação para levar a sua marca a mais pessoas. A verba investida nas plataformas de anúncio é paga à parte, diretamente pelo cliente.',
    categories: ['trafego-pago', 'divulgacao'],
    portfolioCategories: ['Campanhas para redes sociais', 'Cases'],
  },
  'identidade-visual': {
    title: 'Identidade visual e criação de artes',
    intro:
      'Logotipos, artes, cardápios, flyers e materiais impressos com a cara do seu negócio — do digital ao impresso.',
    categories: ['identidade-visual', 'impressos', 'kits', 'avulsos'],
    portfolioCategories: ['Identidade visual', 'Cardápios e impressos', 'Artes para redes sociais'],
  },
} as const;

export type ThemeKey = keyof typeof THEME_PAGES;

export const PORTFOLIO_CATEGORY_SUGGESTIONS = [
  'Social media',
  'Cases',
  'Identidade visual',
  'Artes para redes sociais',
  'Campanhas para redes sociais',
  'Cardápios e impressos',
];
