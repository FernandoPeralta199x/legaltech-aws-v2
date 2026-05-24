# LegalTech API

Backend inicial em FastAPI para o projeto LegalTech AWS V2.

Esta entrega cria apenas a base da API:

- aplicacao FastAPI;
- endpoint `GET /health`;
- configuracao central com Pydantic Settings;
- estrutura inicial de banco com SQLAlchemy;
- configuracao Alembic com migrations incrementais;
- models iniciais do MVP com `organization_id` nas tabelas sensiveis;
- camada inicial de schemas, repositories e services para clients e cases;
- rotas CRUD iniciais para clients e cases em `/api/v1`;
- estrutura JWT/Cognito para `Authorization: Bearer <jwt>`;
- RBAC consultando `roles_permissions`;
- audit_log service inicial para eventos sensiveis;
- README com comandos locais.

Nao foram implementados APIs externas, S3, SQS ou agentes.
As rotas sensiveis exigem JWT Cognito e permissao registrada em `roles_permissions`.

## Requisitos

- Python 3.12+
- PostgreSQL local ou remoto para migrations
- Extensoes PostgreSQL `uuid-ossp` e `vector` disponiveis no banco

## Configuracao local

Crie um ambiente virtual dentro de `legaltech-aws/apps/api`:

```bash
python -m venv .venv
.venv\\Scripts\\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Opcionalmente crie um `.env` local, sem versionar segredos:

```env
APP_ENV=local
APP_NAME=legaltech-api
APP_VERSION=0.1.0
ENABLE_DOCS=true
LOG_LEVEL=INFO
DATABASE_URL=postgresql+psycopg://legaltech:legaltech@localhost:5432/legaltech
AWS_REGION=sa-east-1
COGNITO_USER_POOL_ID=
COGNITO_CLIENT_ID=
COGNITO_ORGANIZATION_CLAIM=custom:organization_id
COGNITO_ROLE_CLAIM=custom:role
COGNITO_TOKEN_USE=id
```

## Rodar localmente

```bash
uvicorn src.main:app --reload
```

Health check:

```bash
curl http://127.0.0.1:8000/health
```

Resposta esperada:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "legaltech-api"
  }
}
```

Rotas iniciais de clients:

```text
GET    /api/v1/clients
POST   /api/v1/clients
GET    /api/v1/clients/{client_id}
PATCH  /api/v1/clients/{client_id}
```

Rotas iniciais de cases:

```text
GET    /api/v1/cases
POST   /api/v1/cases
GET    /api/v1/cases/{case_id}
PATCH  /api/v1/cases/{case_id}
```

Importante: `organization_id` e `user_id` nao fazem parte dos payloads. Eles sao derivados das claims do JWT validado.
As rotas reais usam `DATABASE_URL`; para chamadas locais fora dos testes, aplique as migrations em um PostgreSQL disponivel e cadastre permissoes em `roles_permissions`.

Header esperado:

```text
Authorization: Bearer <jwt>
```

Claims esperadas por padrao:

```text
sub
email
custom:organization_id
custom:role
token_use=id
aud=<COGNITO_CLIENT_ID>
```

`COGNITO_ORGANIZATION_CLAIM`, `COGNITO_ROLE_CLAIM` e `COGNITO_TOKEN_USE` podem ser ajustados via `.env`.

Permissoes usadas pelas rotas atuais:

```text
clients:read
clients:write
cases:read
cases:write
```

Operacoes de leitura e escrita em `clients` e `cases` registram eventos via `AuditLogService`.

## Migrations

O Alembic esta configurado em `alembic.ini` e usa `DATABASE_URL` via Pydantic Settings.

Migrations existentes:

- `0001_initial_models.py`: organizations, users, clients, cases, documents, audit_log e agent_executions.
- `0002_remaining_mvp_models.py`: roles_permissions, case_parties, external_queries_cache, document_chunks, document_embeddings, human_reviews e reports.

Gerar uma nova revision a partir dos models:

```bash
alembic revision --autogenerate -m "descricao da mudanca"
```

Aplicar migrations no banco configurado:

```bash
alembic upgrade head
```

Ver migration atual:

```bash
alembic current
```

Gerar SQL sem aplicar no banco:

```bash
alembic upgrade head --sql
```

## Testes

```bash
python -m unittest discover -s tests -v
```

Testar apenas as rotas de clients/cases:

```bash
python -m unittest tests.test_clients_cases_routes -v
```

Testar auth/RBAC e auditoria:

```bash
python -m unittest tests.test_auth_rbac_audit -v
python -m unittest tests.test_roles_permissions -v
```

Esses testes usam services/verifiers mockados via `dependency_overrides`, entao nao exigem conexao com banco ou Cognito real.

## Estrutura

```text
src/
├── core/
│   ├── config.py
│   ├── logging.py
│   ├── rbac.py
│   ├── security.py
│   └── tenant.py
├── db/
│   ├── base.py
│   └── session.py
├── models/
│   ├── agent_execution.py
│   ├── audit_log.py
│   ├── case.py
│   ├── case_party.py
│   ├── client.py
│   ├── document.py
│   ├── document_chunk.py
│   ├── document_embedding.py
│   ├── external_query_cache.py
│   ├── human_review.py
│   ├── mixins.py
│   ├── organization.py
│   ├── report.py
│   ├── role_permission.py
│   ├── types.py
│   └── user.py
├── modules/
│   ├── audit/
│   │   └── service.py
│   ├── cases/
│   │   ├── repository.py
│   │   ├── router.py
│   │   ├── schemas.py
│   │   └── service.py
│   ├── clients/
│   │   ├── repository.py
│   │   ├── router.py
│   │   ├── schemas.py
│   │   └── service.py
│   ├── common/
│   │   ├── exceptions.py
│   │   ├── identifiers.py
│   │   └── responses.py
│   ├── health/
│   │   └── router.py
│   └── roles/
│       ├── repository.py
│       └── service.py
└── main.py
```

## Proximos passos

1. Validar migrations contra um PostgreSQL local com `uuid-ossp` e `pgvector`.
2. Popular `roles_permissions` por organizacao e papel.
3. Mapear usuario interno a partir de `sub`/Cognito e tabela `users`.
4. Expandir auditoria para tentativas negadas.
5. Criar seed/admin tooling para permissoes iniciais.
