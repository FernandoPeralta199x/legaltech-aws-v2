# LegalTech Frontend

Frontend inicial em Next.js + TypeScript para o projeto LegalTech AWS V2.

Esta entrega cria a base visual e estrutural do app web, com login/JWT local de desenvolvimento e integracao inicial das telas de `clients`, `cases` e `documents` com o backend FastAPI real. Ainda nao ha Cognito real, refresh token, cadastro real de usuario, upload real em S3, OCR, IA/RAG ou APIs externas.

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
NEXT_PUBLIC_ENABLE_API_MOCK_FALLBACK=true
```

Nao coloque segredos em variaveis `NEXT_PUBLIC_*`. Qualquer valor com esse prefixo pode ser enviado ao navegador.

`NEXT_PUBLIC_ENABLE_API_MOCK_FALLBACK=true` permite que as telas integradas usem dados ficticios locais quando o backend nao estiver rodando. Para validar falhas reais de API/autorizacao sem fallback, use:

```env
NEXT_PUBLIC_ENABLE_API_MOCK_FALLBACK=false
```

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

## Rodar backend local

Para consumir a API real, suba o backend conforme o README de `apps/api`. Fluxo resumido:

```powershell
cd legaltech-aws
docker compose up -d postgres

cd apps\api
Copy-Item .env.example.local .env
$env:DATABASE_URL="postgresql+psycopg://legaltech:legaltech_dev@localhost:5432/legaltech"
alembic upgrade head

cd ..\..
Get-Content database\local\seed_example_organization.sql | docker compose exec -T postgres psql -U legaltech -d legaltech

cd apps\api
python -m src.modules.admin.seed_roles_permissions `
  --organization-id 11111111-1111-4111-8111-111111111111 `
  --actor-user-id 22222222-2222-4222-8222-222222222222

uvicorn src.main:app --reload
```

Health check esperado:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/health
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
/dashboard    Resumo da operacao usando clients/cases/documents integraveis
/clients      Lista e cria clientes via backend real
/cases        Lista e cria casos via backend real
/documents    Lista documentos, cria metadados, gera URL e enfileira processamento
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

Labels de papeis exibidas no frontend:

```text
owner   = Proprietário
admin   = Administrador
analyst = Analista
client  = Cliente
support = Suporte
```

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
|   +-- cases.ts
|   +-- clients.ts
|   +-- documents.ts
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
|   +-- cases.ts
|   +-- clients.ts
|   +-- documents.ts
|   +-- fallback.ts
+-- src/types/
|   +-- auth.ts
+-- types/
    +-- api.ts
    +-- domain.ts
    +-- index.ts
```

## Integracao com a API

O arquivo `src/services/apiClient.ts` usa `NEXT_PUBLIC_API_BASE_URL` e envia `Authorization: Bearer <token>` quando houver token dev salvo. O arquivo `services/apiClient.ts` permanece como reexport para compatibilidade.

Services integrados:

```text
src/services/clients.ts
src/services/cases.ts
src/services/documents.ts
```

Endpoints usados pelas telas:

```text
GET  /api/v1/clients
POST /api/v1/clients
GET  /api/v1/cases
POST /api/v1/cases
GET  /api/v1/cases/{case_id}
GET  /api/v1/documents
POST /api/v1/documents
GET  /api/v1/documents/{document_id}/download-url
POST /api/v1/documents/{document_id}/enqueue-processing
```

Fallback mockado:

- usado apenas quando a API fica indisponivel por falha de rede/conexao;
- nao mascara `401`, `403`, erros de validacao ou erros retornados pelo backend;
- continua usando apenas dados ficticios locais de `lib/mockData.ts`;
- pode ser desligado com `NEXT_PUBLIC_ENABLE_API_MOCK_FALLBACK=false`.

Ainda mockado nesta etapa:

- agentes ativos no dashboard;
- relatorios, revisoes, timeline e partes detalhadas do caso;
- upload real de arquivo no frontend;
- Cognito, refresh token, S3 real, OCR, IA/RAG e APIs externas.

Regras mantidas nesta base:

- nenhum `organization_id` e enviado como fonte de autoridade;
- nenhum segredo ou chave real fica no frontend;
- token salvo em `localStorage` e permitido somente para desenvolvimento local;
- payloads de criacao enviam apenas campos aceitos pelo backend;
- fallback local usa dados mockados e ficticios;
- upload real, Cognito, S3 e IA/RAG ficam para etapas futuras.
