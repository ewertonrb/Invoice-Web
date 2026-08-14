# Invoice Platform Web

Frontend web do Invoice Platform, construído com Next.js, React, TypeScript e Tailwind CSS.

O frontend fornece a interface para autenticação, seleção de empresa, workers, worklogs, aprovações, invoices, shifts, notificações e configurações da conta.

## Requisitos

- Node.js 20 ou superior
- npm
- Backend `InvoiceAPI` disponível localmente ou em um ambiente remoto

## Configuração local

Instale as dependências:

```bash
npm install
```

Crie o arquivo `.env.local` a partir do exemplo:

```bash
cp .env.example .env.local
```

Configure a URL do backend:

```env
API_BASE_URL=http://localhost:8080
```

`API_BASE_URL` é usado pelo proxy server-side do Next.js. O navegador acessa o backend através de `/api/backend`, mantendo o token de sessão no servidor.

## Scripts

```bash
npm run dev       # ambiente de desenvolvimento
npm run build     # build de produção
npm run start     # inicia o build de produção
npm run typecheck # valida os tipos TypeScript
npm run lint      # executa o ESLint
npm test          # executa os testes Vitest
```

Antes de publicar, execute pelo menos:

```bash
npm run typecheck
npm test -- --run
npm run build
```

## Produção

Defina `API_BASE_URL` com a URL interna ou pública do backend de produção e gere o build:

```bash
API_BASE_URL=https://api.example.com npm run build
npm run start
```

Em produção, o frontend deve ser executado atrás de HTTPS e de um reverse proxy. Não commite `.env.local`, tokens, passwords ou chaves privadas.

## Arquitetura

- `src/app`: rotas do App Router, layouts e endpoints BFF.
- `src/features`: componentes, schemas, APIs e hooks por domínio.
- `src/components/layout`: shell principal e navegação do dashboard.
- `src/lib/auth`: sessão, cookies e redirects de autenticação.
- `src/lib/api`: cliente server-side, erros e chaves de cache.
- `public/images`: assets estáticos, incluindo a logo da aplicação.

As rotas em `src/app/api/backend/[...path]` encaminham as requisições autenticadas para o backend configurado em `API_BASE_URL`. A sessão é mantida em cookie HTTP-only.

## Repositório relacionado

- Backend: [InvoiceAPI](https://github.com/ewertonrb/InvoiceAPI)
- Branch de desenvolvimento: `develop`

As alterações do frontend devem ser integradas na branch `develop` antes do deploy. O frontend e o backend precisam estar configurados para apontar um para o outro no ambiente correspondente.
