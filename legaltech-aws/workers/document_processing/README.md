# Worker local de document processing

Worker inicial para consumir jobs de processamento de documentos em ambiente local/mock.

Ele nao usa AWS SQS real, Lambda, OCR, OpenAI, Claude, Bedrock, RAG real, frontend ou APIs externas. O job carrega apenas IDs e metadados tecnicos minimos. O worker revalida `organization_id`, `case_id` e `document_id` no banco antes de processar.

## Configuracao local

Use valores ficticios no `.env` da API:

```env
QUEUE_BACKEND=local
LOCAL_QUEUE_PATH=storage/local_queue/document_processing.jsonl
LOCAL_PROCESSING_MAX_TEXT_CHARS=50000
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

## Testes

```powershell
cd apps\api
.\.venv\Scripts\python.exe -m unittest tests.test_document_processing_queue_worker -v
```
