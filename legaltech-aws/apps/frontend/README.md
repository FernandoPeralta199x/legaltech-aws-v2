# LegalTech Frontend

Frontend inicial em Next.js + TypeScript para o projeto LegalTech AWS V2.

Esta entrega cria a base visual e estrutural do app web, ainda sem autenticacao real, Cognito, upload real, S3, IA/RAG ou consumo real do backend.

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
npm run build
```

## Rotas iniciais

```text
/             Visao operacional inicial
/login        Placeholder de login
/dashboard    Resumo da operacao
/clients      Listagem mock de clientes
/cases        Listagem mock de casos
/documents    Listagem mock de documentos
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
+-- types/
    +-- api.ts
    +-- domain.ts
    +-- index.ts
```

## Integracao futura com a API

O arquivo `services/apiClient.ts` esta preparado para usar `NEXT_PUBLIC_API_BASE_URL` e enviar `Authorization: Bearer <token>` quando a autenticacao real for integrada.

Regras mantidas nesta base:

- nenhum `organization_id` e enviado como fonte de autoridade;
- nenhum token, segredo ou chave real fica no frontend;
- dados exibidos sao mockados e ficticios;
- upload, presigned URL, Cognito, S3 e IA/RAG ficam para etapas futuras.
