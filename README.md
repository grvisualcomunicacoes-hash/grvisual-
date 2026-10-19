# GR Visual Comunicações — site

> *Sua ideia, nossa criação.*

Site da GR Visual publicado **só pelo GitHub (GitHub Pages)** — sem banco de dados, sem Vercel, sem mensalidade.

- Catálogo de pacotes, portfólio, carrinho e pedido pelo **WhatsApp** ou **e-mail**
- **Painel** em `/admin.html` para editar pacotes, preços, portfólio (com fotos), textos e perguntas frequentes pelo celular

---

## 🚀 Colocar no ar (uma vez só · ~3 minutos)

**1. Deixar o repositório público**
GitHub → este repositório → **Settings** → role até o fim → **Danger Zone** → **Change visibility** → **Make public** → confirme.
*(No plano gratuito, o GitHub Pages só funciona em repositório público. Não há senhas no código.)*

**2. Ligar o GitHub Pages**
**Settings** → **Pages** (menu da esquerda) → em **Build and deployment / Source** escolha **Deploy from a branch** → Branch: **main** e pasta **/(root)** → **Save**.

Em 1–2 minutos o site fica no ar em:
**https://grvisualcomunicacoes-hash.github.io/grvisual-/**

---

## ✉️ Ativar o recebimento por e-mail (uma vez só)

Os pedidos por e-mail usam o serviço gratuito **FormSubmit**. Na **primeira** vez que alguém enviar um pedido, chega no grvisualcomunicacoes@gmail.com um e-mail do FormSubmit pedindo ativação → abra e toque em **Activate Form**. Dica: faça você mesma um pedido de teste por e-mail logo depois de publicar.

Até ativar, o site avisa o cliente e oferece o WhatsApp — nenhum pedido se perde.

---

## 🔐 Painel (editar o site pelo celular)

Endereço: **https://grvisualcomunicacoes-hash.github.io/grvisual-/admin.html**

O "login" é um **token do GitHub** (crie uma vez):
1. Abra **github.com/settings/personal-access-tokens/new**
2. **Token name:** Painel do site · **Expiration:** 1 ano
3. **Repository access:** *Only select repositories* → **grvisual-**
4. **Permissions → Repository permissions → Contents:** *Read and write*
5. **Generate token** → copie e cole no painel.

O token fica salvo só no seu celular. Se perder o aparelho, apague o token na mesma página do GitHub.

**O que dá para fazer no painel:** criar, editar, duplicar, ativar/desativar, destacar e excluir pacotes · adicionar projetos ao portfólio com fotos (reduzidas automaticamente) · reordenar e ocultar projetos · editar textos, contatos, redes sociais, faixa de promoção, avisos, depoimentos, SEO e política de privacidade · perguntas frequentes.

Cada "Salvar" grava no GitHub e o site atualiza sozinho em cerca de 1 minuto.

---

## 📦 O que ainda vale revisar no painel

- Pacotes **sem a lista do que inclui** (aparecem marcados em amarelo no painel): Venda Rápida, Social + Tráfego, Gestão de tráfego pago, Digital + Tráfego, Produção de conteúdo adicional e Lançamento de Marca.
- Pacotes da tabela antiga entram **inativos** (Start, Presença, Campanhas, Wind Banner…): ative os que quiser vender.
- Portfólio com nomes de clientes e números do case da Fátima: confirme se todos autorizaram a divulgação.

## 🌐 Domínio próprio (opcional)

Registre o domínio (ex.: registro.br) → **Settings → Pages → Custom domain** → siga as instruções de DNS que o GitHub mostrar. Depois troque o endereço antigo nas linhas `og:url`, `og:image` e `canonical` do `index.html` (para o compartilhamento no WhatsApp mostrar a imagem certa).

---

## Como funciona por dentro

| Arquivo | Para quê |
|---|---|
| `index.html` + `assets/site.js` | o site |
| `admin.html` + `assets/admin.js` | o painel |
| `dados/site.json` | **todo o conteúdo** (pacotes, portfólio, textos, FAQ) — é o que o painel edita |
| `imagens/` | portfólio, logotipo e fotos enviadas pelo painel |
| `codigo-fonte/` | código para programadores (React + Bun). Para regerar: `cd codigo-fonte && bun install && ./build.sh ..` |

- Sem servidor: os preços do pedido saem do catálogo publicado; o WhatsApp funciona direto do celular do cliente.
- Pedidos **não ficam guardados num painel** — chegam no WhatsApp e no Gmail.
- A versão anterior (com banco de dados Supabase, painel de pedidos e Vercel) está guardada no branch **`versao-completa`**, caso um dia queira usá-la.
