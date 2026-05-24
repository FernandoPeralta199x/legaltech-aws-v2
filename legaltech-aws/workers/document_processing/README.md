# Worker local de document processing

Worker inicial para consumir jobs de processamento de documentos em ambiente local/mock.

Ele nao usa AWS SQS real, Lambda, OCR, OpenAI, Claude, Bedrock, RAG real, frontend ou APIs externas. O job carrega apenas IDs e metadados tecnicos minimos. O worker revalida `organization_id`, `case_id` e `document_id` no banco antes de processar.

## Configuracao local

Use valores ficticios no `.env` da API:

```env
QUEUE_BACKEND=local
LOCAL_QUEUE_PATH=storage/local_queue/document_processing.jsonl
LOCAL_PROCESSING_MAX_TEXT_CHARS=50000
DOCUMENT_PROCESSING_MAX_ATTEMPTS=3
```

A fila local e um arquivo JSONL em `apps/api/storage/local_queue/`, pasta ignorada pelo Git.

## Rodar uma vez

Na raiz `legaltech-aws`:

```powershell
cd apps\api
.\.venv\Scripts\Activate.ps1
$env:PYTHONPATH=".;..\.."
python ..\..\workers\document_processing\worker.py --once
```

Ou por modulo, a partir da raiz `legaltech-aws`:

```powershell
$env:PYTHONPATH="apps/api;."
apps\api\.venv\Scripts\python.exe -m workers.document_processing.worker --once
```

## Fluxo local esperado

1. Suba o PostgreSQL local.
2. Aplique migrations.
3. Rode o seed interno de `roles_permissions`.
4. Gere um JWT dev com permissao/papel adequado.
5. Enfileire um documento pela API:

```powershell
Invoke-RestMethod `
  -Uri "http://127.0.0.1:8000/api/v1/documents/document-uuid/enqueue-processing" `
  -Method Post `
  -Headers @{ Authorization = "Bearer $TOKEN" }
```

6. Rode o worker com `--once`.

O worker grava eventos em `audit_log` para inicio, sucesso, falha ou skip. O conteudo integral do documento nao e transportado no job nem registrado nos logs.

Actions de auditoria emitidas pelo fluxo:

```text
agent_execution.created
documents.process_started
agent_execution.started
documents.process_completed
agent_execution.completed
documents.process_failed
agent_execution.failed
agent_execution.skipped
```

## Estados controlados

`agent_executions.status`:

```text
queued
running
completed
failed
retrying
skipped
```

`documents.status`:

```text
uploaded
processing
processed
failed
```

Fluxo resumido:

1. Job novo cria `agent_executions` como `queued`.
2. Worker revalida tenant, case e document no banco.
3. Worker marca execução como `running` e documento como `processing`.
4. Sucesso marca execução como `completed` e documento como `processed`.
5. Erro marca execução como `failed` e documento como `failed`.
6. Job com `job_id` já `completed` retorna sucesso sem reprocessar.
7. Retry usa `attempt` do job e respeita `DOCUMENT_PROCESSING_MAX_ATTEMPTS`.

Payload interno esperado:

```json
{
  "job_id": "job-uuid",
  "job_type": "document_processing",
  "agent_type": "document_processing_local",
  "organization_id": "organization-uuid",
  "case_id": "case-uuid",
  "document_id": "document-uuid",
  "attempt": 1,
  "requested_by": "user-uuid",
  "metadata": {
    "source": "api"
  },
  "created_at": "2026-05-24T00:00:00Z"
}
```

O worker nunca confia cegamente nesses IDs: ele consulta o PostgreSQL antes de processar e falha o job se `case_id`, `document_id` e `organization_id` nao forem consistentes.

## Testes

```powershell
cd apps\api
.\.venv\Scripts\python.exe -m unittest tests.test_document_processing_queue_worker -v
```
