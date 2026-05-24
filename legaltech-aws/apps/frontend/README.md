# LegalTech Frontend

Frontend inicial em Next.js + TypeScript para o projeto LegalTech AWS V2.

Esta entrega cria a base visual e estrutural do app web, com login/JWT local de desenvolvimento. Ainda nao ha Cognito real, refresh token, cadastro real, upload real, S3, IA/RAG ou consumo real de dados do backend.

## Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- lucide-react para icones

## Configuracao local

Crie o arquivo `.env.local` a partir do exemplo:

```powershell
Copy-Item .env.example .env.local
```

Variaveis publicas usadas nesta etapa:

```env
NEXT_PUBLIC_APP_NAME=LegalTech AWS V2
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

Nao coloque segredos em variaveis `NEXT_PUBLIC_*`. Qualquer valor com esse prefixo pode ser enviado ao navegador.

## Instalar e rodar

```powershell
cd legaltech-aws\apps\frontend
npm install
npm run dev
```

Abra:

```text
http://localhost:3000
```

## Comandos de validacao

```powershell
npm run typecheck
npm run lint
npm run test
npm run build
```

## Rotas iniciais

```text
/             Visao operacional inicial
/login        Login dev local
/dashboard    Resumo da operacao
/clients      Listagem mock de clientes
/cases        Listagem mock de casos
/documents    Listagem mock de documentos
```

As rotas `/dashboard`, `/clients`, `/cases` e `/documents` usam uma guarda visual local. Sem sessao salva, o app redireciona para `/login`.

## Login/JWT dev local

O login atual existe apenas para desenvolvimento local. Ele permite:

- selecionar papel dev: `owner`, `admin`, `analyst`, `client` ou `support`;
- colar um JWT dev gerado pelo backend;
- salvar a sessao em `localStorage`;
- enviar `Authorization: Bearer <token>` automaticamente pelo `apiClient`;
- limpar a sessao pelo botao `Sair` no Header.

Gerar token dev pelo backend, a partir de `apps/api`:

```powershell
$TOKEN = python -m src.modules.admin.dev_jwt `
  --organization-id 11111111-1111-4111-8111-111111111111 `
  --user-id 22222222-2222-4222-8222-222222222222 `
  --email dev.local@example.test `
  --role admin
```

Depois, cole o valor de `$TOKEN` no campo `JWT dev do backend` em `/login`.

Se o campo de token ficar vazio, o frontend cria uma sessao visual local com um token placeholder sem assinatura real. Esse placeholder serve apenas para navegar pela UI mockada e nao deve ser usado para chamar rotas protegidas do backend.

Importante:

- esse fluxo nao e producao;
- nao use Cognito real nesta tela;
- nao cole tokens reais de usuarios;
- nao coloque segredos no frontend;
- `organization_id` continua vindo do token/contexto autenticado, nunca de payloads enviados pela UI.

## Estrutura

```text
apps/frontend/
+-- components/
|   +-- AppLayout.tsx
|   +-- Button.tsx
|   +-- Card.tsx
|   +-- EmptyState.tsx
|   +-- Header.tsx
|   +-- PageTitle.tsx
|   +-- Sidebar.tsx
|   +-- StatusBadge.tsx
|   +-- AuthGuard.tsx
+-- lib/
|   +-- cn.ts
|   +-- formatters.ts
|   +-- mockData.ts
+-- services/
|   +-- apiClient.ts
+-- src/app/
|   +-- clients/page.tsx
|   +-- cases/page.tsx
|   +-- dashboard/page.tsx
|   +-- documents/page.tsx
|   +-- login/page.tsx
|   +-- globals.css
|   +-- layout.tsx
|   +-- page.tsx
+-- src/lib/
|   +-- authStorage.ts
|   +-- useDevSession.ts
+-- src/services/
|   +-- apiClient.ts
|   +-- auth.ts
+-- src/types/
|   +-- auth.ts
+-- types/
    +-- api.ts
    +-- domain.ts
    +-- index.ts
```

## Integracao futura com a API

O arquivo `src/services/apiClient.ts` usa `NEXT_PUBLIC_API_BASE_URL` e envia `Authorization: Bearer <token>` quando houver token dev salvo. O arquivo `services/apiClient.ts` permanece como reexport para compatibilidade.

Regras mantidas nesta base:

- nenhum `organization_id` e enviado como fonte de autoridade;
- nenhum segredo ou chave real fica no frontend;
- token salvo em `localStorage` e permitido somente para desenvolvimento local;
- dados exibidos sao mockados e ficticios;
- upload, presigned URL, Cognito, S3 e IA/RAG ficam para etapas futuras.
