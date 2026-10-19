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

## Banco de dados

Já configurado: projeto Supabase **grvisual** (`config.js`). Tabela `registros` com RLS (cada conta só acessa
os próprios dados). Só `grvisualcomunicacoes@gmail.com` pode criar conta (tabela `acesso_permitido`).
No primeiro cadastro, os clientes, pacotes, tarefas, cobranças e contratos migrados são copiados para a conta.

## Atualizar o app

Toda alteração enviada para a branch `main` é publicada automaticamente pelo GitHub Pages em 1–2 minutos.
Ao trocar `index.html`, aumente também o número em `CACHE` dentro de `sw.js` (ex.: `gr-studio-v4`)
para os celulares baixarem a versão nova.

Os dados dos clientes **não** ficam neste repositório (ele é público): ficam no Supabase.
