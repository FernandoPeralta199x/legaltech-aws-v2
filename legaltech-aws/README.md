# LegalTech AWS V2

Plataforma LegalTech modular com frontend Next.js, backend FastAPI,
PostgreSQL, auditoria LGPD, RBAC, storage de documentos, fila local/mock e
preparacao para AWS.

Esta etapa organiza ambientes, variaveis, seguranca e infraestrutura futura.
Nenhum recurso AWS real e criado por este repositorio neste momento.

## Estado Atual

- Frontend: Next.js + TypeScript + Tailwind CSS.
- Backend: FastAPI + SQLAlchemy + Alembic.
- Banco local: PostgreSQL via Docker Compose com `pgvector`.
- Auth local: JWT dev apenas para `APP_ENV=local`.
- Auth futura: validacao Cognito/JWKS preparada no backend.
- Storage: local/mock e adaptador S3 preparado.
- Filas: local/mock e adaptador SQS preparado.
- Workers: processamento local de documentos com chunks/embeddings fake.
- Auditoria: `audit_log` avancado com sanitizacao LGPD.
- Infra: documentacao e checklists AWS, sem deploy real.

## Estrutura

```text
legaltech-aws/
+-- apps/
|   +-- api/
|   +-- frontend/
+-- database/
+-- docs/
+-- infra/
|   +-- aws/
+-- scripts/
+-- workers/
```

## Ambientes

- `local`: Docker/PostgreSQL, JWT dev, storage local e fila local.
- `dev`: AWS futura de desenvolvimento, com Cognito.
- `staging`: validacao antes de producao.
- `prod`: producao, sem JWT dev e sem mocks.

Referencias:

- `docs/ENVIRONMENT_VARIABLES.md`
- `docs/AWS_DEPLOYMENT_PLAN.md`
- `docs/SECURITY_CHECKLIST_AWS.md`
- `infra/aws/checklist-deploy.md`

## Configuracao Local

Exemplos ficticios:

- `.env.example`
- `apps/api/.env.example.local`
- `apps/frontend/.env.example`
- `infra/aws/env.example`

Nunca versione `.env` real, tokens, senhas, access keys, chaves privadas ou
segredos de APIs externas.

## Backend

```powershell
cd legaltech-aws
docker compose up -d postgres

cd apps\api
python -m venv .venv
.venv\Scripts\python.exe -m pip install --upgrade pip
.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example.local .env
alembic upgrade head
uvicorn src.main:app --reload
```

Health check:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/health
```

Para testar no celular na mesma rede, suba a API com `--host 0.0.0.0`,
inclua `http://192.168.0.102:3000` em `CORS_ALLOWED_ORIGINS` e use
`NEXT_PUBLIC_API_BASE_URL=http://192.168.0.102:8000` no frontend.

Validacoes:

```powershell
cd legaltech-aws\apps\api
.venv\Scripts\python.exe -m unittest discover -s tests -v
.venv\Scripts\python.exe -m compileall src tests
.venv\Scripts\python.exe -m pip check
```

## Frontend

```powershell
cd legaltech-aws\apps\frontend
npm install
Copy-Item .env.example .env.local
npm run dev
```

Abra:

```text
http://localhost:3000
```

Validacoes:

```powershell
cd legaltech-aws\apps\frontend
npm run test
npm run typecheck
npm run lint
npm run build
```

## Validacoes De Ambiente E Seguranca

Scripts offline, sem AWS real:

```powershell
cd legaltech-aws
python scripts\validate_env.py --env-file .env.example --environment local --target backend
python scripts\validate_env.py --env-file apps\frontend\.env.example --environment local --target frontend
python scripts\validate_env.py --env-file infra\aws\env.example --environment staging --target aws
python scripts\check_project_security.py .
```

## Regras De Seguranca

- `AUTH_PROVIDER=dev_jwt` somente em `APP_ENV=local`.
- `DEV_JWT_ENABLED=false` em `dev`, `staging` e `prod`.
- `AUTH_PROVIDER=cognito` e o caminho esperado para AWS.
- S3 deve ser privado por padrao.
- Upload/download de documentos deve usar presigned URL.
- `organization_id` nunca vem do frontend como fonte de verdade.
- Logs nao devem expor CPF/CNPJ completo, tokens, senhas, chaves ou contratos
  integrais.
- Secrets reais devem ficar fora do repositorio.

## Fora Do Escopo Atual

- Deploy real em AWS.
- Criacao real de Cognito, RDS, S3, SQS, Lambda ou CloudFront.
- Terraform/CDK completo.
- Cognito Hosted UI no frontend.
- OCR, IA, RAG e APIs externas reais.
