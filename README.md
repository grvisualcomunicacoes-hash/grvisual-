# GR Visual Comunicações — site comercial

> *Sua ideia, nossa criação.*

Site da GR Visual com catálogo de serviços, carrinho, envio de pedidos pelo **WhatsApp** ou **e-mail** e **painel administrativo** em `/admin` — tudo editável pelo celular, sem programar.

**Tecnologia:** Next.js (site e painel) · Supabase (banco de dados, login e imagens) · Resend (e-mail) · Vercel (hospedagem). Todos têm plano gratuito suficiente para começar.

---

## ✅ O que já está pronto

- Páginas: Início, Sobre, Serviços e pacotes, Gestão de redes sociais, Tráfego pago e divulgação, Identidade visual e artes, Portfólio, Como funciona, Perguntas frequentes, Solicitar orçamento, Carrinho, Finalizar pedido e Política de privacidade.
- Portfólio com os 8 projetos enviados (Fátima Confeitaria, Cris Organiza, Legaab, Acarajé do Iran, Miamore, Teotelas, Vinix Clean e Luna Pink).
- 8 pacotes ativos com os preços informados + 10 pacotes da tabela antiga **cadastrados como inativos**, para você revisar e ativar se quiser.
- Carrinho que não se perde ao navegar, quantidades só onde faz sentido, observações por serviço.
- Pedido gravado no banco com **preço conferido no servidor** (ninguém consegue alterar o valor pelo navegador).
- Botão **"Enviar pedido pelo WhatsApp"** com mensagem organizada para o (27) 98843-5960.
- Envio real por e-mail para grvisualcomunicacoes@gmail.com (depois de configurar o Resend).
- Painel com pedidos (status, anotações, valor recebido, filtros, busca, CSV), pacotes, portfólio, textos, contatos, avisos, depoimentos e FAQ.
- SEO, imagem de compartilhamento no WhatsApp, favicon, sitemap e regras de segurança no banco.

## ⚠️ O que depende de você configurar

| Item | Onde | Sem isso… |
|---|---|---|
| Banco de dados | Supabase (Passo 1) | o site abre com o conteúdo inicial, mas pedidos não ficam gravados e o painel não entra |
| Publicação | Vercel (Passo 3) | o site não fica no ar |
| E-mail dos pedidos | Resend (Passo 2) | tudo funciona; o pedido só não chega por e-mail (o WhatsApp continua) |
| Domínio próprio | Registro.br + Vercel (Passo 5) | o site fica num endereço `….vercel.app` |
| Completar pacotes | Painel → Pacotes | Venda Rápida, Social + Tráfego, Lançamento de Marca e outros estão **sem a lista do que inclui** — preencha para não ficar vago |

---

## Passo 1 — Supabase (banco de dados) · ~10 min

1. Crie uma conta em **supabase.com** → **New project**.
   - Nome: `grvisual` · Senha do banco: forte (guarde) · Região: **South America (São Paulo)**.
2. Quando o projeto terminar de criar, abra **SQL Editor → New query**.
3. Neste repositório do GitHub, abra `supabase/schema.sql` → botão **Raw** → copie tudo → cole no SQL Editor → **Run**.
4. Faça o mesmo com `supabase/seed.sql` (conteúdo inicial: pacotes, portfólio, textos e FAQ).
5. **Bloqueie cadastros públicos:** Authentication → Sign In / Providers → desligue **"Allow new users to sign up"**.
6. **Crie seu login do painel:** Authentication → Users → **Add user → Create new user** → seu e-mail + senha forte (mín. 10 caracteres) → marque **Auto Confirm User**.
7. Rode `supabase/admin.sql` no SQL Editor (se usou outro e-mail no passo 6, troque no arquivo antes). Deve aparecer 1 linha com seu e-mail.
8. Em **Project Settings → API**, anote:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** (secreta!) → `SUPABASE_SERVICE_ROLE_KEY`

## Passo 2 — Resend (e-mail dos pedidos) · ~5 min · opcional

1. Crie a conta em **resend.com** usando **grvisualcomunicacoes@gmail.com**.
2. **API Keys → Create API Key** → copie a chave (começa com `re_`).
3. Sem domínio próprio, use `EMAIL_FROM=GR Visual Site <onboarding@resend.dev>`. Nesse modo o Resend só entrega para o e-mail dono da conta — que é exatamente o seu Gmail.
4. Quando tiver domínio próprio: Resend → **Domains** → adicione e verifique o domínio, e troque para algo como `EMAIL_FROM=GR Visual <pedidos@seudominio.com.br>`.

## Passo 3 — Vercel (colocar no ar) · ~5 min

1. Entre em **vercel.com** com a sua conta do GitHub.
2. **Add New → Project** → escolha o repositório deste site → **Import**.
3. Abra **Environment Variables** e cadastre (veja `.env.example`):

   | Nome | Valor |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL do Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | chave anon public |
   | `SUPABASE_SERVICE_ROLE_KEY` | chave service_role |
   | `NEXT_PUBLIC_SITE_URL` | endereço do site (pode deixar para depois) |
   | `RESEND_API_KEY` | chave do Resend (opcional) |
   | `EMAIL_FROM` | `GR Visual Site <onboarding@resend.dev>` |
   | `ORDER_NOTIFY_EMAIL` | `grvisualcomunicacoes@gmail.com` |

4. **Deploy.** Em 1–2 minutos o site fica no ar num endereço `https://….vercel.app`.
5. Volte ao Supabase → **Authentication → URL Configuration**:
   - **Site URL:** o endereço do site
   - **Redirect URLs:** adicione `https://SEU-ENDERECO/admin/redefinir-senha` (para o "Esqueci a senha" funcionar)

Toda alteração enviada ao GitHub publica o site de novo automaticamente. Mudanças de variáveis exigem **Deployments → ⋯ → Redeploy**.

## Passo 4 — Conferir se está tudo funcionando

- [ ] Abrir o site no celular, adicionar 2 pacotes ao carrinho, finalizar e enviar pelo WhatsApp.
- [ ] Ver o pedido em `/admin/pedidos` (e no Gmail, se configurou o Resend).
- [ ] No painel, editar o preço de um pacote e conferir no site.
- [ ] Enviar uma imagem nova no portfólio pelo celular.
- [ ] Mudar o status de um pedido e lançar um valor recebido.

## Passo 5 — Domínio próprio (ex.: grvisual.com.br)

1. Registre o domínio em **registro.br** (ou outro registrador).
2. Vercel → seu projeto → **Settings → Domains** → digite o domínio → **Add**.
3. A Vercel mostra os registros de DNS que precisam ser criados. No registro.br: **Domínios → seu domínio → Editar zona / DNS** e crie exatamente os registros mostrados pela Vercel. A propagação leva de minutos a algumas horas.
4. Atualize `NEXT_PUBLIC_SITE_URL` na Vercel e a **Site URL / Redirect URLs** no Supabase com o novo domínio → **Redeploy**.

---

## 📱 Usando o painel pelo celular

- Acesse `https://SEU-SITE/admin` e entre com o e-mail e senha do Passo 1.
- Dica: no Chrome do Android, menu ⋮ → **Adicionar à tela inicial** para abrir o painel como um app.
- **Pedidos:** veja os dados, chame o cliente no WhatsApp com 1 toque, mude o status, escreva anotações e lance o **valor efetivamente recebido**. O painel inicial mostra separadamente pedidos recebidos, aprovados e valores recebidos — estimativas nunca contam como faturamento.
- **Pacotes:** criar, editar, duplicar, ativar/desativar, destacar na página inicial, ordem de exibição, imagem de capa. Na lista "O que está incluído", escreva um item por linha.
- **Portfólio:** adicione projetos com várias imagens (elas são reduzidas automaticamente no celular), reordene, publique ou oculte.
- **Conteúdo:** textos da página inicial, contatos, redes sociais, faixa de promoção no topo, diferenciais, passos, avisos comerciais, depoimentos (só aparecem se marcados como autorizados), SEO, política de privacidade e FAQ.

### Segurança

- Use senha forte e não compartilhe. "Esqueci a senha" envia um link para o seu e-mail.
- A chave `service_role` fica **só na Vercel** — nunca coloque em mensagens, prints ou no código.
- Cadastros públicos ficam desligados (Passo 1.5); só quem está na tabela `admins` entra no painel.
- Para dar acesso a outra pessoa: crie o usuário dela no Supabase e rode o `admin.sql` com o e-mail dela. Para remover, apague a linha dela em **Table Editor → admins**.
- Visitantes só leem pacotes ativos, portfólio publicado e textos. Pedidos não podem ser lidos por ninguém além das administradoras (regras de RLS no banco).

---

## Para quem for mexer no código

```bash
npm install
cp .env.example .env.local   # preencha com os valores do Supabase
npm run dev                  # http://localhost:3000
npm test                     # testes da lógica de carrinho, pedido, WhatsApp e e-mail
```

- `app/(site)` — páginas públicas · `app/admin` — painel · `app/api/orders` — recebe os pedidos
- `lib/defaults.ts` — conteúdo inicial (gera `supabase/seed.sql` com `npx tsx scripts/generate-seed.ts`)
- `supabase/schema.sql` — tabelas, regras de acesso (RLS) e armazenamento de imagens
- Sem banco configurado, o site funciona com o conteúdo inicial e o pedido vai direto pelo WhatsApp.

### Testes realizados antes da entrega

- 16 testes automáticos da lógica (`npm test`): preços conferidos no servidor, quantidades travadas, itens sob orçamento, código do pedido, mensagem do WhatsApp codificada, e-mail sem injeção de HTML, validação dos campos.
- Fluxo do cliente num navegador real (celular 390 px): adicionar, alterar quantidade, observações, recarregar sem perder o carrinho, remover, validação, envio, WhatsApp, falha do servidor e pacote desativado.
- API de pedidos e todas as ações do painel com um banco simulado: cadastro/edição/duplicação/exclusão de pacotes, portfólio, FAQ, conteúdo, status e valor recebido de pedidos, filtros, exportação CSV e bloqueio para quem não é administrador.
- A compilação final (`next build`) acontece na Vercel no primeiro deploy.
