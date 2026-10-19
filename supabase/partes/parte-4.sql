-- PARTE 4 DE 6: cole numa query nova e clique em Run

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
