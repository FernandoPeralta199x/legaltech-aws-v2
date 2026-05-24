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
- rotas iniciais de metadados de documents em `/api/v1`;
- estrutura JWT/Cognito para `Authorization: Bearer <jwt>`;
- RBAC consultando `roles_permissions`;
- matriz base de permissoes por papel e seed interno de `roles_permissions`;
- audit_log service inicial para eventos sensiveis;
- README com comandos locais.

Nao foram implementados APIs externas, S3, SQS ou agentes.
As rotas sensiveis exigem JWT Cognito e permissao registrada em `roles_permissions`.

## Requisitos

- Python 3.12+
- Docker Desktop ou Docker Engine com Docker Compose
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

O arquivo `apps/api/.env.example.local` contem variaveis ficticias para o PostgreSQL local do `docker-compose.yml`.

Exemplo local, sem versionar segredos:

```env
APP_ENV=local
APP_NAME=legaltech-api
APP_VERSION=0.1.0
ENABLE_DOCS=true
LOG_LEVEL=INFO
DATABASE_URL=postgresql+psycopg://legaltech:legaltech_dev@localhost:5432/legaltech
AWS_REGION=sa-east-1
COGNITO_USER_POOL_ID=
COGNITO_CLIENT_ID=
COGNITO_ORGANIZATION_CLAIM=custom:organization_id
COGNITO_ROLE_CLAIM=custom:role
COGNITO_TOKEN_USE=id
DEV_JWT_ENABLED=true
DEV_JWT_SECRET=fictitious-local-dev-secret-32-bytes-minimum
DEV_JWT_ISSUER=legaltech-local-dev
DEV_JWT_AUDIENCE=legaltech-local-api
```

Para usar o fluxo local completo, copie o exemplo para `.env` dentro de `apps/api`. O arquivo `.env` segue ignorado pelo Git.

## PostgreSQL local com Docker

Na raiz do repositorio, suba o PostgreSQL local:

```bash
docker compose up -d postgres
```

O compose usa:

```text
Banco: legaltech
Usuario: legaltech
Senha: legaltech_dev
Porta: 5432
Imagem: pgvector/pgvector:pg16
Volume: legaltech_postgres_data
```

As credenciais acima sao apenas ficticias para desenvolvimento local. Nao use esses valores em producao.

Verificar saude do banco:

```bash
docker compose ps
docker compose exec postgres pg_isready -U legaltech -d legaltech
```

Confirmar extensoes disponiveis:

```bash
docker compose exec postgres psql -U legaltech -d legaltech -c "SELECT extname FROM pg_extension WHERE extname IN ('uuid-ossp', 'vector') ORDER BY extname;"
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

Rotas iniciais de documents, apenas para metadados:

```text
GET    /api/v1/documents
POST   /api/v1/documents
GET    /api/v1/documents/{document_id}
PATCH  /api/v1/documents/{document_id}
```

Nesta etapa, documents nao implementa upload real, S3, presigned URL, OCR, IA, embeddings ou RAG.

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
documents:read
documents:write
```

Se a organizacao local ja tiver sido populada antes desta permissao existir, rode novamente o seed interno de `roles_permissions`. O seed e idempotente e adiciona apenas permissoes faltantes.

Papeis base preparados no seed interno:

```text
owner
admin
analyst
client
support
```

Operacoes de leitura e escrita em `clients` e `cases` registram eventos via `AuditLogService`.
Operacoes de leitura e escrita em `documents` tambem registram eventos via `AuditLogService`.

## Documents metadata

As rotas de documents cadastram somente metadados no banco. Elas nao fazem upload de arquivo, nao geram URL temporaria e nao conversam com S3.

Criar document metadata:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/documents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "case_id": "case-uuid",
    "filename": "contrato.pdf",
    "content_type": "application/pdf",
    "size_bytes": 1024000,
    "file_hash": "sha256-opcional",
    "metadata": {
      "source": "metadata_only"
    }
  }'
```

Listar documents:

```bash
curl "http://127.0.0.1:8000/api/v1/documents?case_id=case-uuid" \
  -H "Authorization: Bearer $TOKEN"
```

Atualizar metadados:

```bash
curl -X PATCH http://127.0.0.1:8000/api/v1/documents/document-uuid \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "uploaded",
    "metadata": {
      "review": "pending"
    }
  }'
```

Campos como `organization_id`, `uploaded_by`, `storage_bucket` e `storage_key` nao sao aceitos no payload. O `organization_id` vem do JWT e os campos de storage permanecem internos como placeholders locais ate a etapa futura de S3/presigned URL.

## Seed interno de permissoes

O seed de `roles_permissions` e um comando administrativo interno, nao uma rota publica. Ele popula apenas permissoes faltantes para uma organizacao existente e registra auditoria quando cria novas permissoes.

Para testar localmente, aplique primeiro as migrations e crie a organizacao tecnica ficticia:

```bash
docker compose exec -T postgres psql -U legaltech -d legaltech < database/local/seed_example_organization.sql
```

No PowerShell, execute a partir da raiz do repositorio:

```powershell
Get-Content database\local\seed_example_organization.sql | docker compose exec -T postgres psql -U legaltech -d legaltech
```

Esse SQL cria apenas dados tecnicos ficticios:

```text
organization_id: 11111111-1111-4111-8111-111111111111
user_id:         22222222-2222-4222-8222-222222222222
email:           dev.local@example.test
role:            admin
```

Dry run, sem persistir:

```bash
python -m src.modules.admin.seed_roles_permissions \
  --organization-id 11111111-1111-4111-8111-111111111111 \
  --dry-run
```

Aplicar no banco configurado em `DATABASE_URL`:

```bash
python -m src.modules.admin.seed_roles_permissions \
  --organization-id 11111111-1111-4111-8111-111111111111
```

Registrar usuario interno responsavel pela auditoria, se existir na tabela `users`:

```bash
python -m src.modules.admin.seed_roles_permissions \
  --organization-id 11111111-1111-4111-8111-111111111111 \
  --actor-user-id 22222222-2222-4222-8222-222222222222
```

Use UUIDs reais apenas no ambiente local/dev apropriado. Nao coloque esses valores no codigo.

Conferir permissoes populadas no banco local:

```bash
docker compose exec postgres psql -U legaltech -d legaltech -c "SELECT role, COUNT(*) FROM roles_permissions WHERE organization_id = '11111111-1111-4111-8111-111111111111' GROUP BY role ORDER BY role;"
```

## JWT local de desenvolvimento

Para testar rotas reais localmente sem Cognito, habilite apenas em `APP_ENV=local`:

```env
DEV_JWT_ENABLED=true
DEV_JWT_SECRET=fictitious-local-dev-secret-32-bytes-minimum
DEV_JWT_ISSUER=legaltech-local-dev
DEV_JWT_AUDIENCE=legaltech-local-api
```

O segredo acima e ficticio e serve apenas para desenvolvimento local. Nao reutilize em outro ambiente.

Gerar token local:

```bash
python -m src.modules.admin.dev_jwt \
  --organization-id 11111111-1111-4111-8111-111111111111 \
  --user-id 22222222-2222-4222-8222-222222222222 \
  --email dev.local@example.test \
  --role admin
```

PowerShell:

```powershell
$TOKEN = python -m src.modules.admin.dev_jwt `
  --organization-id 11111111-1111-4111-8111-111111111111 `
  --user-id 22222222-2222-4222-8222-222222222222 `
  --email dev.local@example.test `
  --role admin
```

As claims do token carregam `organization_id`, `user_id` e `role`. Nao envie `organization_id` nos payloads de frontend.

## Smoke local de clients e cases

Fluxo end-to-end local:

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

$TOKEN = python -m src.modules.admin.dev_jwt `
  --organization-id 11111111-1111-4111-8111-111111111111 `
  --user-id 22222222-2222-4222-8222-222222222222 `
  --email dev.local@example.test `
  --role admin

uvicorn src.main:app --reload
```

Em outro terminal, execute:

```powershell
cd legaltech-aws\apps\api
$TOKEN = python -m src.modules.admin.dev_jwt `
  --organization-id 11111111-1111-4111-8111-111111111111 `
  --user-id 22222222-2222-4222-8222-222222222222 `
  --email dev.local@example.test `
  --role admin

python -m src.modules.admin.smoke_clients_cases --token $TOKEN
```

O smoke executa:

```text
POST /api/v1/clients
GET  /api/v1/clients
POST /api/v1/cases
GET  /api/v1/cases
```

Exemplo curl:

```bash
TOKEN="$(python -m src.modules.admin.dev_jwt \
  --organization-id 11111111-1111-4111-8111-111111111111 \
  --user-id 22222222-2222-4222-8222-222222222222 \
  --email dev.local@example.test \
  --role admin)"

curl -X POST http://127.0.0.1:8000/api/v1/clients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Cliente Local Exemplo","document":"00000000000","email":"cliente.local@example.test","phone":"+5500000000000","metadata":{"source":"local_curl"}}'

curl http://127.0.0.1:8000/api/v1/clients \
  -H "Authorization: Bearer $TOKEN"
```

Exemplo PowerShell:

```powershell
$Headers = @{ Authorization = "Bearer $TOKEN" }
$Client = Invoke-RestMethod `
  -Uri "http://127.0.0.1:8000/api/v1/clients" `
  -Method Post `
  -Headers $Headers `
  -ContentType "application/json" `
  -Body (@{
    name = "Cliente Local Exemplo"
    document = "00000000000"
    email = "cliente.local@example.test"
    phone = "+5500000000000"
    metadata = @{ source = "local_powershell" }
  } | ConvertTo-Json)

Invoke-RestMethod `
  -Uri "http://127.0.0.1:8000/api/v1/clients" `
  -Method Get `
  -Headers $Headers

$Case = Invoke-RestMethod `
  -Uri "http://127.0.0.1:8000/api/v1/cases" `
  -Method Post `
  -Headers $Headers `
  -ContentType "application/json" `
  -Body (@{
    client_id = $Client.data.id
    case_type = "contract_analysis"
    priority = "normal"
    metadata = @{ source = "local_powershell" }
  } | ConvertTo-Json)

Invoke-RestMethod `
  -Uri "http://127.0.0.1:8000/api/v1/cases" `
  -Method Get `
  -Headers $Headers
```

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

Fluxo completo para validar migrations no PostgreSQL local:

```bash
cd legaltech-aws/apps/api
export DATABASE_URL=postgresql+psycopg://legaltech:legaltech_dev@localhost:5432/legaltech
alembic upgrade head
alembic current
```

No PowerShell:

```powershell
cd legaltech-aws\apps\api
$env:DATABASE_URL="postgresql+psycopg://legaltech:legaltech_dev@localhost:5432/legaltech"
alembic upgrade head
alembic current
```

Para resetar apenas o banco local de desenvolvimento, remova o volume nomeado na raiz do repositorio:

```bash
docker compose down -v
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
python -m unittest tests.test_admin_seed_roles_permissions -v
```

Testar documents:

```bash
python -m unittest tests.test_documents_layers tests.test_documents_routes -v
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
│   ├── admin/
│   │   ├── dev_jwt.py
│   │   ├── seed_roles_permissions.py
│   │   └── smoke_clients_cases.py
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
│   ├── documents/
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
│       ├── permissions.py
│       ├── repository.py
│       └── service.py
└── main.py
```

## Proximos passos

1. Validar migrations contra um PostgreSQL local com `uuid-ossp` e `pgvector`.
2. Rodar o seed interno de `roles_permissions` para cada organizacao de desenvolvimento.
3. Mapear usuario interno a partir de `sub`/Cognito e tabela `users`.
4. Expandir auditoria para tentativas negadas.
5. Criar administracao segura para futuras alteracoes de permissoes, com aprovacao e auditoria.
