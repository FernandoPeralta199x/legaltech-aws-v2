# LegalTech API

Backend inicial em FastAPI para o projeto LegalTech AWS V2.

Esta entrega cria apenas a base da API:

- aplicacao FastAPI;
- endpoint `GET /health`;
- configuracao central com Pydantic Settings;
- estrutura inicial de banco com SQLAlchemy;
- placeholders seguros para Cognito/JWT e tenant;
- README com comandos locais.

Nao foram implementados autenticacao real, modelos de banco, migrations, APIs externas, S3, SQS ou agentes.

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
├── modules/
│   └── health/
│       └── router.py
└── main.py
```

## Proximos passos

1. Adicionar testes automatizados.
2. Configurar Alembic e modelos iniciais com `organization_id`.
3. Implementar validacao JWT/Cognito.
4. Implementar tenant middleware e RBAC.
5. Adicionar auditoria para rotas sensiveis.
