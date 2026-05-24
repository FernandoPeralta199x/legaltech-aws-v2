# LegalTech AWS V2

## Objetivo

Base inicial para o desenvolvimento do projeto LegalTech AWS V2: uma plataforma modular para fluxos juridicos com frontend web, API backend, persistencia relacional, preparo para RAG futuro, armazenamento privado de documentos, filas, workers e infraestrutura AWS.

Esta fase cria a base documental, backend inicial e frontend inicial do repositório. Nenhuma API externa real foi implementada e nenhum agente completo foi criado.

## Stack Tecnica

- Frontend: Next.js + TypeScript
- Backend: FastAPI + Python
- ORM: SQLAlchemy
- Migrations: Alembic
- Banco: PostgreSQL
- Vetorial/RAG futuro: pgvector
- Arquivos: Amazon S3 privado
- Filas: AWS SQS
- Workers: AWS Lambda
- Auth futura: Cognito/JWT/RBAC/Tenant
- Infra futura: AWS

## Estrutura De Pastas

```text
legaltech-aws/
├── apps/
│   ├── frontend/
│   └── api/
├── workers/
│   └── triagem/
├── infra/
├── database/
├── docs/
├── .env.example
├── .gitignore
├── AGENTS.md
└── README.md
```

## Responsabilidades Iniciais

- `apps/frontend/`: aplicacao Next.js com TypeScript.
- `apps/api/`: API FastAPI organizada em rotas, services, schemas, repositories e models.
- `workers/triagem/`: worker futuro para processamento assincrono de triagem.
- `infra/`: definicoes futuras de infraestrutura AWS.
- `database/`: configuracoes futuras de banco, migrations e extensoes como pgvector.
- `docs/`: documentacao tecnica, decisoes arquiteturais e guias do projeto.

## Ordem Recomendada De Implementacao

1. Definir contratos de dominio, entidades sensiveis e regras de tenant/auditoria.
2. Criar a base do backend FastAPI com configuracao, health check e estrutura modular.
3. Configurar SQLAlchemy, Alembic, PostgreSQL e modelos iniciais com `organization_id`.
4. Criar autenticacao base com validacao de JWT/Cognito simulada em ambiente local.
5. Implementar RBAC, tenant resolution e `audit_log` para acoes sensiveis.
6. Criar frontend Next.js com layout base, chamadas futuras ao backend e estados de UI.
7. Implementar fluxo de upload via presigned URL para S3 privado.
8. Introduzir SQS e worker de triagem com contrato de mensagem versionado.
9. Preparar pgvector e pipeline RAG somente depois dos fluxos base estarem testados.
10. Adicionar agentes e integracoes externas apenas apos contratos, auditoria e revisao humana estarem definidos.

## Comandos Locais

```bash
# Frontend
cd apps/frontend
npm install
npm run dev
npm run typecheck
npm run lint
npm run build
```

```bash
# Backend
cd apps/api
python -m venv .venv
pip install -r requirements.txt
uvicorn app.main:app --reload
```

```bash
# Migrations
cd apps/api
alembic upgrade head
```

```bash
# Testes e validacoes
cd apps/frontend
npm run typecheck
npm run lint
npm run build

cd ../api
pytest
```

## Frontend Inicial

O app em `apps/frontend` usa Next.js + TypeScript + Tailwind CSS e inclui rotas iniciais para `/`, `/login`, `/dashboard`, `/clients`, `/cases` e `/documents`.

Nesta etapa, a UI usa apenas dados mockados e ficticios. O `apiClient` esta preparado para consumir `NEXT_PUBLIC_API_BASE_URL` futuramente, sem autenticacao real e sem expor segredos no navegador.

## Configuracao

Copie `.env.example` para `.env` apenas em ambiente local e preencha valores reais fora do controle de versao. Nunca commitar chaves, tokens, senhas ou credenciais de provedores externos.
