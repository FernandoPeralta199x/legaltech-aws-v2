# LegalTech API

Backend inicial em FastAPI para o projeto LegalTech AWS V2.

Esta entrega cria apenas a base da API:

- aplicacao FastAPI;
- endpoint `GET /health`;
- configuracao central com Pydantic Settings;
- estrutura inicial de banco com SQLAlchemy;
- configuracao Alembic e migration inicial;
- models iniciais com `organization_id` nas tabelas sensiveis;
- placeholders seguros para Cognito/JWT e tenant;
- README com comandos locais.

Nao foram implementados autenticacao real, APIs externas, S3, SQS ou agentes.

## Requisitos

- Python 3.12+
- PostgreSQL local ou remoto para etapas futuras

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

## Migrations

O Alembic esta configurado em `alembic.ini` e usa `DATABASE_URL` via Pydantic Settings.

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

## Estrutura

```text
src/
├── core/
│   ├── config.py
│   ├── logging.py
│   ├── security.py
│   └── tenant.py
├── db/
│   ├── base.py
│   └── session.py
├── models/
│   ├── agent_execution.py
│   ├── audit_log.py
│   ├── case.py
│   ├── client.py
│   ├── document.py
│   ├── mixins.py
│   ├── organization.py
│   └── user.py
├── modules/
│   └── health/
│       └── router.py
└── main.py
```

## Proximos passos

1. Expandir models para `roles_permissions`, partes, cache externo, chunks, reviews e reports.
2. Implementar validacao JWT/Cognito.
3. Implementar tenant middleware e RBAC.
4. Adicionar auditoria para rotas sensiveis.
5. Criar repositories e services para clientes/casos.
