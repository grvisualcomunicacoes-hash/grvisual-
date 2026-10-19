-- Conteúdo inicial. Gerado por scripts/generate-seed.ts — pode rodar mais de uma vez:
-- registros que já existem NÃO são sobrescritos (suas edições ficam preservadas).

insert into public.site_settings (id, content) values (1, $json${
  "brand": {
    "name": "GR Visual Comunicações",
    "slogan": "Sua ideia, nossa criação",
    "logoUrl": "/brand/gr-mark.png"
  },
  "contact": {
    "whatsapp": "5527988435960",
    "whatsappDisplay": "(27) 98843-5960",
    "email": "grvisualcomunicacoes@gmail.com",
    "region": "Grande Vitória – ES",
    "instagram": "https://www.instagram.com/grvisualcomunicacoes",
    "facebook": "",
    "tiktok": ""
  },
  "seo": {
    "title": "GR Visual Comunicações — Sua ideia, nossa criação",
    "description": "Gestão de redes sociais, tráfego pago, identidade visual, artes e materiais impressos para pequenos negócios da Grande Vitória – ES. Monte seu pedido e fale pelo WhatsApp."
  },
  "hero": {
    "kicker": "Comunicação visual e marketing digital",
    "title": "Sua ideia, nossa criação",
    "subtitle": "Redes sociais, tráfego pago, identidade visual e materiais impressos para o seu negócio ser visto — e lembrado."
  },
  "banner": {
    "active": false,
    "text": "",
    "link": ""
  },
  "about": {
    "title": "Sobre a GR Visual",
    "paragraphs": [
      "A GR Visual Comunicações cria a comunicação de pequenos negócios e profissionais autônomos da Grande Vitória: identidade visual, artes para redes sociais, gestão de perfis, materiais digitais e impressos, cardápios, tabelas de preços, banners e tráfego pago.",
      "O trabalho vai além de criar artes: organizamos a apresentação da sua marca para que o seu perfil funcione como vitrine e como canal de contato com novos clientes."
    ]
  },
  "differentials": [
    {
      "title": "Do digital ao impresso",
      "text": "Redes sociais, cardápios, flyers, banners e identidade visual em um só lugar."
    },
    {
      "title": "Pacotes para pequenos negócios",
      "text": "Opções pensadas para quem está começando ou quer crescer no digital."
    },
    {
      "title": "Atendimento direto",
      "text": "Você fala com quem cria, pelo WhatsApp, do pedido à entrega."
    },
    {
      "title": "Produção no seu negócio",
      "text": "Podemos ir até você para produzir conteúdo; o deslocamento é combinado à parte."
    }
  ],
  "howItWorks": [
    {
      "title": "Escolha",
      "text": "Navegue pelos pacotes e adicione ao carrinho o que faz sentido para o seu negócio — ou peça um orçamento personalizado."
    },
    {
      "title": "Envie o pedido",
      "text": "Preencha seus dados e envie pelo WhatsApp ou por e-mail. Nenhum pagamento é feito pelo site."
    },
    {
      "title": "Confirmação",
      "text": "Conferimos escopo, prazo e condições com você e enviamos a confirmação do orçamento."
    },
    {
      "title": "Criação",
      "text": "Com tudo aprovado, começamos a produção e acompanhamos as entregas com você."
    }
  ],
  "notices": [
    "O envio do pedido não garante disponibilidade imediata.",
    "Os serviços dependem da confirmação de escopo, prazo e condições.",
    "A verba de anúncios (tráfego pago) é cobrada separadamente, direto pela plataforma.",
    "Serviços personalizados podem exigir orçamento individual."
  ],
  "testimonials": [],
  "privacy": [
    "Esta política explica como a GR Visual Comunicações trata os dados enviados pelo site, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).",
    "Dados coletados: nome, nome da empresa (opcional), WhatsApp, e-mail (opcional), cidade, serviços de interesse, objetivo e observações sobre o projeto. Não solicitamos CPF nem documentos pessoais.",
    "Finalidade: usamos esses dados somente para responder à sua solicitação, preparar o orçamento e conduzir a contratação, quando houver.",
    "Compartilhamento: os dados não são vendidos nem cedidos a terceiros. Eles ficam armazenados em serviços de tecnologia contratados para o funcionamento do site (hospedagem, banco de dados e envio de e-mail).",
    "Guarda: mantemos os dados pelo tempo necessário para o atendimento e para obrigações legais. Você pode pedir a exclusão a qualquer momento.",
    "Seus direitos: você pode solicitar acesso, correção ou exclusão dos seus dados pelo WhatsApp ou e-mail informados neste site.",
    "O carrinho do site fica salvo apenas no seu próprio navegador, para que você não perca os itens escolhidos enquanto navega."
  ]
}$json$::jsonb)
on conflict (id) do nothing;

insert into public.packages (slug, name, category, price, promo_price, pricing_mode, allow_quantity, max_quantity, description, includes, excludes, duration, deliverables, needs_ad_budget, start_estimate, image_url, active, featured, sort_order, notes) values ('venda-rapida', 'Venda Rápida', 'divulgacao', 67, null, 'fixo', false, 1, '', '{}'::text[], '{}'::text[], '20 dias', '', false, '', '', true, true, 1, '') on conflict (slug) do nothing;
insert into public.packages (slug, name, category, price, promo_price, pricing_mode, allow_quantity, max_quantity, description, includes, excludes, duration, deliverables, needs_ad_budget, start_estimate, image_url, active, featured, sort_order, notes) values ('mini', 'Mini', 'redes-sociais', 140, null, 'fixo', false, 1, '', array['2 publicações', '3 stories', 'Divulgação em grupos de WhatsApp', 'Estratégia básica', 'Ajustes de identidade', 'Tabela de preços ou delivery']::text[], '{}'::text[], '30 dias', '', false, '', '', true, true, 2, '') on conflict (slug) do nothing;
insert into public.packages (slug, name, category, price, promo_price, pricing_mode, allow_quantity, max_quantity, description, includes, excludes, duration, deliverables, needs_ad_budget, start_estimate, image_url, active, featured, sort_order, notes) values ('social-trafego', 'Social + Tráfego', 'trafego-pago', 380, null, 'fixo', false, 1, '', '{}'::text[], '{}'::text[], '', '', true, '', '', true, true, 3, '') on conflict (slug) do nothing;
insert into public.packages (slug, name, category, price, promo_price, pricing_mode, allow_quantity, max_quantity, description, includes, excludes, duration, deliverables, needs_ad_budget, start_estimate, image_url, active, featured, sort_order, notes) values ('gestao-trafego-pago', 'Gestão de tráfego pago', 'trafego-pago', 250, null, 'fixo', false, 1, '', '{}'::text[], array['Verba de anúncios (paga à parte, direto na plataforma)']::text[], '', '', true, '', '', true, false, 4, '') on conflict (slug) do nothing;
insert into public.packages (slug, name, category, price, promo_price, pricing_mode, allow_quantity, max_quantity, description, includes, excludes, duration, deliverables, needs_ad_budget, start_estimate, image_url, active, featured, sort_order, notes) values ('digital-trafego', 'Digital + Tráfego', 'trafego-pago', 500, null, 'fixo', false, 1, '', array['Google Meu Negócio']::text[], '{}'::text[], '', '', true, '', '', true, true, 5, '') on conflict (slug) do nothing;
insert into public.packages (slug, name, category, price, promo_price, pricing_mode, allow_quantity, max_quantity, description, includes, excludes, duration, deliverables, needs_ad_budget, start_estimate, image_url, active, featured, sort_order, notes) values ('conteudo-adicional', 'Produção de conteúdo adicional', 'conteudo', 80, null, 'fixo', true, 10, '', '{}'::text[], '{}'::text[], '', '', false, '', '', true, false, 6, '') on conflict (slug) do nothing;
insert into public.packages (slug, name, category, price, promo_price, pricing_mode, allow_quantity, max_quantity, description, includes, excludes, duration, deliverables, needs_ad_budget, start_estimate, image_url, active, featured, sort_order, notes) values ('lancamento-de-marca', 'Lançamento de Marca', 'identidade-visual', 200, null, 'fixo', false, 1, '', '{}'::text[], '{}'::text[], '', '', false, '', '', true, false, 7, '') on conflict (slug) do nothing;
insert into public.packages (slug, name, category, price, promo_price, pricing_mode, allow_quantity, max_quantity, description, includes, excludes, duration, deliverables, needs_ad_budget, start_estimate, image_url, active, featured, sort_order, notes) values ('sabor-completo', 'Sabor Completo', 'divulgacao', 170, null, 'fixo', false, 1, 'Para lanchonetes e restaurantes: divulgação em grupos, cardápio, promoções, destaques e cartão ou panfleto digital.', array['Cardápio digital + versão para imprimir', '4 artes de promoção ou combos', 'Capa + 3 destaques para o Instagram', 'Cartão digital com link do WhatsApp', 'Panfleto digital', 'Divulgação em grupos de WhatsApp durante 15 dias']::text[], '{}'::text[], '', '', false, '', '', true, false, 8, '') on conflict (slug) do nothing;
insert into public.packages (slug, name, category, price, promo_price, pricing_mode, allow_quantity, max_quantity, description, includes, excludes, duration, deliverables, needs_ad_budget, start_estimate, image_url, active, featured, sort_order, notes) values ('visibilidade', 'Visibilidade', 'redes-sociais', 30, null, 'fixo', false, 1, '', array['2 posts', '2 divulgações no WhatsApp', '1 arte', '1 story']::text[], '{}'::text[], '', '', false, '', '', false, false, 20, '') on conflict (slug) do nothing;
insert into public.packages (slug, name, category, price, promo_price, pricing_mode, allow_quantity, max_quantity, description, includes, excludes, duration, deliverables, needs_ad_budget, start_estimate, image_url, active, featured, sort_order, notes) values ('start', 'Start', 'redes-sociais', 50, null, 'fixo', false, 1, '', array['3 posts', '4 divulgações no WhatsApp', '2 divulgações no Facebook', '2 artes', '2 stories']::text[], '{}'::text[], '', '', false, '', '', false, false, 21, '') on conflict (slug) do nothing;
insert into public.packages (slug, name, category, price, promo_price, pricing_mode, allow_quantity, max_quantity, description, includes, excludes, duration, deliverables, needs_ad_budget, start_estimate, image_url, active, featured, sort_order, notes) values ('presenca-digital', 'Presença Digital', 'redes-sociais', 120, null, 'fixo', false, 1, '', array['4 posts', '4 stories', 'Artes', 'Textos', 'Divulgação', 'Organização mensal']::text[], '{}'::text[], '', '', false, '', '', false, false, 22, '') on conflict (slug) do nothing;
insert into public.packages (slug, name, category, price, promo_price, pricing_mode, allow_quantity, max_quantity, description, includes, excludes, duration, deliverables, needs_ad_budget, start_estimate, image_url, active, featured, sort_order, notes) values ('presenca', 'Presença', 'redes-sociais', 180, null, 'fixo', false, 1, '', array['Publicações semanais', 'Stories', 'Artes promocionais', 'Divulgação em grupos', 'Cartão e flyer digital']::text[], '{}'::text[], '', '', false, '', '', false, false, 23, '') on conflict (slug) do nothing;
insert into public.packages (slug, name, category, price, promo_price, pricing_mode, allow_quantity, max_quantity, description, includes, excludes, duration, deliverables, needs_ad_budget, start_estimate, image_url, active, featured, sort_order, notes) values ('campanha-essencial', 'Campanha Essencial', 'redes-sociais', 397, null, 'fixo', false, 1, '', array['8 posts', '8 stories', 'Legendas', 'Calendário', 'Destaques', 'Análise básica']::text[], '{}'::text[], '', '', false, '', '', false, false, 24, '') on conflict (slug) do nothing;
insert into public.packages (slug, name, category, price, promo_price, pricing_mode, allow_quantity, max_quantity, description, includes, excludes, duration, deliverables, needs_ad_budget, start_estimate, image_url, active, featured, sort_order, notes) values ('campanha-inicial', 'Campanha Inicial', 'impressos', 897, null, 'fixo', false, 1, '', array['5 artes', '5 stories', '500 flyers', 'Wind banner 2 m']::text[], '{}'::text[], '', '', false, '', '', false, false, 25, '') on conflict (slug) do nothing;
insert into public.packages (slug, name, category, price, promo_price, pricing_mode, allow_quantity, max_quantity, description, includes, excludes, duration, deliverables, needs_ad_budget, start_estimate, image_url, active, featured, sort_order, notes) values ('campanha-bairro', 'Campanha Bairro', 'impressos', 1790, null, 'fixo', false, 1, '', array['1.000 flyers A5', '500 adesivos', '5 promotores']::text[], '{}'::text[], '', '', false, '', '', false, false, 26, '') on conflict (slug) do nothing;
insert into public.packages (slug, name, category, price, promo_price, pricing_mode, allow_quantity, max_quantity, description, includes, excludes, duration, deliverables, needs_ad_budget, start_estimate, image_url, active, featured, sort_order, notes) values ('campanha-completa', 'Campanha Completa', 'impressos', 2990, null, 'fixo', false, 1, '', array['10.000 flyers A5', '500 adesivos', 'Banner gota 2 m', '5 promotores', 'Acompanhamento da equipe']::text[], '{}'::text[], '', '', false, '', '', false, false, 27, '') on conflict (slug) do nothing;
insert into public.packages (slug, name, category, price, promo_price, pricing_mode, allow_quantity, max_quantity, description, includes, excludes, duration, deliverables, needs_ad_budget, start_estimate, image_url, active, featured, sort_order, notes) values ('wind-banner', 'Wind Banner 2,70 × 0,70 m', 'impressos', 349.5, null, 'fixo', false, 1, '', '{}'::text[], '{}'::text[], '', '', false, 'Prazo de cerca de 10 dias', '', false, false, 28, 'R$ 299,50 cada na compra de 2. Entrada de 50%. Criação da arte à parte: R$ 40.') on conflict (slug) do nothing;
insert into public.packages (slug, name, category, price, promo_price, pricing_mode, allow_quantity, max_quantity, description, includes, excludes, duration, deliverables, needs_ad_budget, start_estimate, image_url, active, featured, sort_order, notes) values ('divulgacao-de-vagas', 'Divulgação de vagas', 'divulgacao', 80, null, 'fixo', false, 1, 'Divulgação em grupos de WhatsApp, Facebook e regionais.', '{}'::text[], '{}'::text[], '', '', false, '', '', false, false, 29, 'Preço "a partir de".') on conflict (slug) do nothing;

insert into public.portfolio_items (slug, title, client_name, category, description, highlights, services, images, published, sort_order) values ('fatima-confeitaria-case', 'Case de resultados — Fátima Confeitaria', 'Fátima Confeitaria', 'Cases', 'Modernização da identidade visual (mantendo a orquídea e o lilás da marca), organização do perfil, bio estratégica, destaques e estratégia de conteúdo para aproximar a confeitaria do público.', array['Visualizações: 4.123 → 11.973 (+190,4%)', 'Alcance: 350 → 2.381 contas (+580,3%)', 'Interações: 53 → 286 (+439,6%)', 'Novos seguidores: 8 → 45', 'Visualizações nos stories: 3.600 → 7.900 (+119,4%)', 'Comparativo de métricas do Instagram, junho → julho']::text[], array['Identidade visual', 'Organização de perfil', 'Estratégia de conteúdo', 'Social media']::text[], array['/portfolio/fatima-capa.webp', '/portfolio/fatima-ponto-partida.webp', '/portfolio/fatima-identidade.webp', '/portfolio/fatima-perfil.webp', '/portfolio/fatima-conteudo.webp', '/portfolio/fatima-resultados.webp', '/portfolio/fatima-numeros.webp']::text[], true, 1) on conflict (slug) do nothing;
insert into public.portfolio_items (slug, title, client_name, category, description, highlights, services, images, published, sort_order) values ('cris-organiza-perfil', 'Organização de perfil — Cris Organiza', 'Cris Organiza', 'Social media', 'Transformação do perfil de uma personal organizer: bio com informações claras, destaques personalizados e padronizados e feed com identidade visual coesa.', array['Organização da bio', 'Destaques personalizados e padronizados', 'Feed estratégico com identidade visual', 'Conteúdo alinhado com o público e o serviço']::text[], array['Social media', 'Organização de perfil']::text[], array['/portfolio/cris-antes-depois.webp', '/portfolio/cris-transformacao.webp']::text[], true, 2) on conflict (slug) do nothing;
insert into public.portfolio_items (slug, title, client_name, category, description, highlights, services, images, published, sort_order) values ('legaab-colecao-lumina', 'Campanha Coleção Lumina — Legaab Modas', 'Legaab Modas', 'Campanhas para redes sociais', 'Sequência de artes para a campanha da Coleção Lumina: apresentação da coleção, looks, oferta para quem viesse pelo anúncio e informações da loja.', '{}'::text[], array['Campanha', 'Artes para redes sociais e anúncios']::text[], array['/portfolio/legaab-lumina.webp']::text[], true, 3) on conflict (slug) do nothing;
insert into public.portfolio_items (slug, title, client_name, category, description, highlights, services, images, published, sort_order) values ('acaraje-do-iran', 'Cardápio e materiais — Acarajé do Iran', 'Acarajé do Iran', 'Cardápios e impressos', 'Cardápio com itens e preços, arte vertical com chamada para pedidos no iFood e simulação de aplicação da marca em wind banner e display de mesa.', '{}'::text[], array['Cardápio', 'Arte para stories', 'Wind banner', 'Display de mesa']::text[], array['/portfolio/acaraje-cardapio.webp', '/portfolio/acaraje-banner.webp', '/portfolio/acaraje-mockup.webp']::text[], true, 4) on conflict (slug) do nothing;
insert into public.portfolio_items (slug, title, client_name, category, description, highlights, services, images, published, sort_order) values ('miamore-bolsas-maternidade', 'Artes de produto — Miamore Bolsas Maternidade', 'Miamore Bolsas Maternidade', 'Artes para redes sociais', 'Artes que valorizam os detalhes das bolsas: estampa, laços, acabamento e alça, com a identidade delicada da marca.', '{}'::text[], array['Artes para redes sociais']::text[], array['/portfolio/miamore-detalhes.webp', '/portfolio/miamore-kit.webp']::text[], true, 5) on conflict (slug) do nothing;
insert into public.portfolio_items (slug, title, client_name, category, description, highlights, services, images, published, sort_order) values ('teotelas', 'Logotipo e flyer — Teotelas', 'Teotelas', 'Identidade visual', 'Logotipo para empresa de telas e redes de proteção e flyer digital com serviços e QR code para o WhatsApp.', '{}'::text[], array['Logotipo', 'Flyer digital']::text[], array['/portfolio/teotelas-flyer.webp', '/portfolio/teotelas-logo.webp']::text[], true, 6) on conflict (slug) do nothing;
insert into public.portfolio_items (slug, title, client_name, category, description, highlights, services, images, published, sort_order) values ('vinix-clean', 'Oferta antes e depois — Vinix Clean', 'Vinix Clean', 'Artes para redes sociais', 'Arte promocional para higienização de sofá retrátil, com comparação antes e depois e chamada para agendamento pelo WhatsApp.', '{}'::text[], array['Arte promocional']::text[], array['/portfolio/vinix-oferta.webp']::text[], true, 7) on conflict (slug) do nothing;
insert into public.portfolio_items (slug, title, client_name, category, description, highlights, services, images, published, sort_order) values ('luna-pink', 'Logotipo — Luna Pink', 'Luna Pink', 'Identidade visual', 'Logotipo para marca de moda fitness feminina.', '{}'::text[], array['Logotipo']::text[], array['/portfolio/luna-pink-logo.webp']::text[], true, 8) on conflict (slug) do nothing;

-- Perguntas frequentes: só insere se a tabela estiver vazia
insert into public.faqs (question, answer, sort_order, active)
select * from (values
  ('Como funciona a contratação pelo site?', 'Você escolhe os serviços, preenche seus dados e envia o pedido pelo WhatsApp ou por e-mail. Depois conferimos com você o escopo, o prazo e as condições antes de qualquer confirmação.', 1, true),
  ('Preciso pagar alguma coisa pelo site?', 'Não. O site não faz cobranças. O pagamento é combinado diretamente com a GR Visual depois que o orçamento for confirmado.', 2, true),
  ('A verba dos anúncios está inclusa nos pacotes de tráfego pago?', 'Não. O valor do pacote é pela gestão. A verba investida nos anúncios é paga à parte, diretamente na plataforma (Meta, Google etc.).', 3, true),
  ('Posso pedir um serviço que não está na lista?', 'Pode, sim. Use a opção "Solicitar orçamento" e descreva o que você precisa.', 4, true),
  ('Vocês vão até o meu negócio para produzir conteúdo?', 'Sim, a produção de conteúdo pode ser feita no local. O deslocamento é combinado e pago à parte pelo cliente.', 5, true)
) as v(question, answer, sort_order, active)
where not exists (select 1 from public.faqs);
