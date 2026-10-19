# GR Visual Studio IA

Aplicativo de gestão da GR Visual Comunicações (PWA instalável).

- Endereço: https://grvisualcomunicacoes-hash.github.io/grvisual-/studio/
- Telas: `#inicio`, `#clientes`, `#conteudo`, `#financeiro`, `#projetos`, `#tarefas`, `#pacotes`, `#estudio`, `#tia`, `#config`

## Como funciona

| Parte | Onde roda |
|---|---|
| Telas do app (front-end) | GitHub Pages (esta pasta) |
| Login e banco de dados | Supabase (Auth + PostgreSQL com regras de acesso por conta) |
| Funciona sem internet | Service worker guarda a tela; os dados precisam de conexão |

Nenhuma chave fica no código. A URL e a chave **pública** do Supabase são digitadas na tela
Configurações e ficam salvas só no aparelho. A chave secreta (service_role) nunca deve ser usada no app.

## Configurar o banco (uma vez, ~10 minutos)

1. Crie uma conta grátis em https://supabase.com e um projeto novo (região: São Paulo).
2. No projeto, abra **SQL Editor**, cole o conteúdo de `supabase.sql` e clique em **Run**.
3. Abra **Project Settings › API** e copie a **Project URL** e a chave **anon / publishable**.
4. No app, vá em **Mais › Configurações**, cole os dois campos e toque em **Salvar e conectar**.
5. Na tela de login, toque em **Primeiro acesso: criar minha conta** e confirme pelo e-mail.
6. Depois de entrar, no Supabase vá em **Authentication › Sign In / Providers** e desligue
   **Allow new users to sign up**, para ninguém mais criar conta.
7. Em **Mais › Importar backup**, escolha o arquivo `gr-visual-backup-inicial.json` para trazer os clientes.

## Atualizar o app

Toda alteração enviada para a branch `main` é publicada automaticamente pelo GitHub Pages em 1–2 minutos.
Ao trocar `index.html`, aumente também o número em `CACHE` dentro de `sw.js` (ex.: `gr-studio-v4`)
para os celulares baixarem a versão nova.

Os dados dos clientes **não** ficam neste repositório (ele é público): ficam no Supabase.
