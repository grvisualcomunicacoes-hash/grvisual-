export type PricingMode = 'fixo' | 'orcamento';

export interface Package {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number | null;
  promo_price: number | null;
  pricing_mode: PricingMode;
  allow_quantity: boolean;
  max_quantity: number;
  description: string;
  includes: string[];
  excludes: string[];
  duration: string;
  deliverables: string;
  needs_ad_budget: boolean;
  start_estimate: string;
  image_url: string;
  active: boolean;
  featured: boolean;
  sort_order: number;
  notes: string;
}

export interface PortfolioItem {
  id: string;
  slug: string;
  title: string;
  client_name: string;
  category: string;
  description: string;
  highlights: string[];
  services: string[];
  images: string[];
  published: boolean;
  sort_order: number;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  active: boolean;
}

export interface Testimonial {
  name: string;
  business: string;
  text: string;
  authorized: boolean;
}

export interface SiteContent {
  brand: { name: string; slogan: string; logoUrl: string };
  contact: {
    whatsapp: string;
    whatsappDisplay: string;
    email: string;
    region: string;
    instagram: string;
    facebook: string;
    tiktok: string;
  };
  seo: { title: string; description: string };
  hero: { kicker: string; title: string; subtitle: string };
  banner: { active: boolean; text: string; link: string };
  about: { title: string; paragraphs: string[] };
  differentials: { title: string; text: string }[];
  howItWorks: { title: string; text: string }[];
  notices: string[];
  testimonials: Testimonial[];
  privacy: string[];
}

export const ORDER_STATUSES = [
  'novo',
  'aguardando_contato',
  'orcamento_enviado',
  'aguardando_aprovacao',
  'aprovado',
  'em_andamento',
  'concluido',
  'cancelado',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  novo: 'Novo',
  aguardando_contato: 'Aguardando contato',
  orcamento_enviado: 'Orçamento enviado',
  aguardando_aprovacao: 'Aguardando aprovação',
  aprovado: 'Aprovado',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

/** Item gravado no pedido: "fotografia" do pacote no momento do pedido. */
export interface OrderLine {
  package_id: string | null;
  name: string;
  category: string;
  pricing_mode: PricingMode;
  unit_price: number | null;
  quantity: number;
  subtotal: number | null;
  needs_ad_budget: boolean;
  notes: string;
}

export interface CustomerInput {
  name: string;
  business: string;
  whatsapp: string;
  email: string;
  city: string;
  objective: string;
  projectNotes: string;
  contactChannel: 'whatsapp' | 'email' | 'ligacao';
  privacyAccepted: boolean;
}

export interface Order {
  id: string;
  code: string;
  created_at: string;
  updated_at: string;
  customer_name: string;
  business_name: string;
  whatsapp: string;
  email: string;
  city: string;
  objective: string;
  project_notes: string;
  contact_channel: string;
  send_method: 'whatsapp' | 'email';
  email_status: 'nao_configurado' | 'enviado' | 'falhou';
  items: OrderLine[];
  estimated_total: number;
  has_quote_items: boolean;
  status: OrderStatus;
  internal_notes: string;
  amount_received: number;
}
