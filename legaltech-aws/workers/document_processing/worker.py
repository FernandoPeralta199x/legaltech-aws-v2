import argparse
import sys
from collections.abc import Callable
from datetime import UTC, datetime
from pathlib import Path
from typing import Protocol
from uuid import UUID


API_ROOT = Path(__file__).resolve().parents[2] / "apps" / "api"
if str(API_ROOT) not in sys.path:
    sys.path.insert(0, str(API_ROOT))

from sqlalchemy import select
from sqlalchemy.orm import Session

from src.db.session import SessionLocal
from src.models.agent_execution import AgentExecution
from src.models.document import Document
from src.models.document_chunk import DocumentChunk
from src.modules.audit.service import AuditLogService
from src.modules.common.exceptions import ResourceNotFoundError
from src.modules.common.identifiers import parse_uuid
from src.modules.document_processing.schemas import ProcessLocalDocumentRequest
from src.modules.document_processing.service import DocumentProcessingService
from src.modules.queues.publisher import create_queue_client
from src.modules.queues.schemas import DocumentProcessingJob, QueueMessage, WorkerResult


PROCESSING_AGENT_TYPE = "document_processing_local"
TERMINAL_IDEMPOTENT_STATUSES = frozenset({"running", "succeeded", "skipped"})


class QueueClientProtocol(Protocol):
    def receive(self, *, max_messages: int = 1) -> list[QueueMessage]: ...

    def ack(self, receipt_handle: str) -> None: ...


class WorkerRepositoryProtocol(Protocol):
    def get_document(
        self,
        *,
        organization_id: UUID | str,
        document_id: UUID | str,
    ) -> Document | None: ...

    def list_chunks(
        self,
        *,
        organization_id: UUID | str,
        document_id: UUID | str,
    ) -> list[DocumentChunk]: ...

    def get_execution_by_job_id(
        self,
        *,
        organization_id: UUID | str,
        job_id: UUID | str,
    ) -> AgentExecution | None: ...

    def create_execution(
        self,
        *,
        job: DocumentProcessingJob,
        status: str,
    ) -> AgentExecution: ...

    def mark_execution_started(self, execution: AgentExecution) -> None: ...

    def mark_execution_succeeded(self, execution: AgentExecution, *, result) -> None: ...

    def mark_execution_skipped(self, execution: AgentExecution, *, reason: str) -> None:
        ...

    def mark_execution_failed(
        self,
        execution: AgentExecution,
        *,
        error_message: str,
    ) -> None: ...


class DocumentProcessingWorkerRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_document(
        self,
        *,
        organization_id: UUID | str,
        document_id: UUID | str,
    ) -> Document | None:
        statement = select(Document).where(
            Document.id == parse_uuid(document_id),
            Document.organization_id == parse_uuid(organization_id),
            Document.deleted_at.is_(None),
        )
        return self.db.scalars(statement).first()

    def list_chunks(
        self,
        *,
        organization_id: UUID | str,
        document_id: UUID | str,
    ) -> list[DocumentChunk]:
        statement = select(DocumentChunk).where(
            DocumentChunk.organization_id == parse_uuid(organization_id),
            DocumentChunk.document_id == parse_uuid(document_id),
        )
        return list(self.db.scalars(statement).all())

    def get_execution_by_job_id(
        self,
        *,
        organization_id: UUID | str,
        job_id: UUID | str,
    ) -> AgentExecution | None:
        statement = select(AgentExecution).where(
            AgentExecution.organization_id == parse_uuid(organization_id),
            AgentExecution.job_id == parse_uuid(job_id),
        )
        return self.db.scalars(statement).first()

    def create_execution(
        self,
        *,
        job: DocumentProcessingJob,
        status: str,
    ) -> AgentExecution:
        now = datetime.now(UTC)
        execution = AgentExecution(
            organization_id=job.organization_id,
            case_id=job.case_id,
            document_id=job.document_id,
            job_id=job.job_id,
            agent_type=PROCESSING_AGENT_TYPE,
            status=status,
            input_payload={
                "job_type": job.job_type,
                "case_id": str(job.case_id),
                "document_id": str(job.document_id),
                "source": job.metadata.get("source", "queue"),
            },
            output_payload={},
            started_at=now if status == "running" else None,
        )
        self.db.add(execution)
        self.db.flush()
        return execution

    def mark_execution_started(self, execution: AgentExecution) -> None:
        execution.status = "running"
        execution.started_at = execution.started_at or datetime.now(UTC)
        self.db.flush()

    def mark_execution_succeeded(self, execution: AgentExecution, *, result) -> None:
        execution.status = "succeeded"
        execution.completed_at = datetime.now(UTC)
        execution.output_payload = {
            "status": result.status,
            "chunk_count": result.chunk_count,
            "embedding_count": result.embedding_count,
        }
        execution.error_message = None
        self.db.flush()

    def mark_execution_skipped(self, execution: AgentExecution, *, reason: str) -> None:
        execution.status = "skipped"
        execution.completed_at = datetime.now(UTC)
        execution.output_payload = {"reason": reason}
        self.db.flush()

    def mark_execution_failed(
        self,
        execution: AgentExecution,
        *,
        error_message: str,
    ) -> None:
        execution.status = "failed"
        execution.completed_at = datetime.now(UTC)
        execution.error_message = error_message[:500]
        self.db.flush()


def default_mock_text_provider(job: DocumentProcessingJob) -> str:
    return (
        "Texto local ficticio para processamento de documento em ambiente de "
        f"desenvolvimento. Job {job.job_id}."
    )


class DocumentProcessingWorker:
    def __init__(
        self,
        *,
        queue_client: QueueClientProtocol | None = None,
        db: Session | None = None,
        repository: WorkerRepositoryProtocol | None = None,
        processing_service: DocumentProcessingService | None = None,
        audit_log: AuditLogService | None = None,
        text_provider: Callable[[DocumentProcessingJob], str] = default_mock_text_provider,
    ) -> None:
        self.db = db
        self.queue_client = queue_client or create_queue_client()

        if repository is None:
            if db is None:
                raise ValueError("db is required when repository is not provided.")
            repository = DocumentProcessingWorkerRepository(db)
        if processing_service is None:
            if db is None:
                raise ValueError(
                    "db is required when processing_service is not provided."
                )
            processing_service = DocumentProcessingService(db=db)
        if audit_log is None:
            if db is None:
                raise ValueError("db is required when audit_log is not provided.")
            audit_log = AuditLogService(db)

        self.repository = repository
        self.processing_service = processing_service
        self.audit_log = audit_log
        self.text_provider = text_provider

    def process_one(self) -> WorkerResult:
        messages = self.queue_client.receive(max_messages=1)
        if not messages:
            return WorkerResult(status="empty")

        message = messages[0]
        try:
            result = self._process_job(message.job)
            self._commit()
            return result
        except Exception as exc:
            self._rollback()
            return WorkerResult(
                job_id=message.job.job_id,
                document_id=message.job.document_id,
                status="failed",
                reason=exc.__class__.__name__,
            )
        finally:
            self.queue_client.ack(message.receipt_handle)

    def _process_job(self, job: DocumentProcessingJob) -> WorkerResult:
        execution = self.repository.get_execution_by_job_id(
            organization_id=job.organization_id,
            job_id=job.job_id,
        )
        if execution and execution.status in TERMINAL_IDEMPOTENT_STATUSES:
            self._record_audit(job, action="document_processing.worker_skipped")
            return WorkerResult(
                job_id=job.job_id,
                document_id=job.document_id,
                status="skipped",
                reason="duplicate_job",
            )

        if execution is None:
            execution = self.repository.create_execution(job=job, status="queued")

        self._record_audit(job, action="document_processing.worker_started")

        try:
            document = self.repository.get_document(
                organization_id=job.organization_id,
                document_id=job.document_id,
            )
            if document is None:
                raise ResourceNotFoundError("Document not found.")
            if document.case_id != job.case_id:
                raise ResourceNotFoundError("Document not found for case.")

            existing_chunks = self.repository.list_chunks(
                organization_id=job.organization_id,
                document_id=job.document_id,
            )
            if existing_chunks:
                self.repository.mark_execution_skipped(
                    execution,
                    reason="document_already_processed",
                )
                self._record_audit(
                    job,
                    action="document_processing.worker_skipped",
                    metadata={"reason": "document_already_processed"},
                )
                return WorkerResult(
                    job_id=job.job_id,
                    document_id=job.document_id,
                    status="skipped",
                    reason="document_already_processed",
                )

            self.repository.mark_execution_started(execution)
            result = self.processing_service.process_local_text(
                organization_id=job.organization_id,
                document_id=job.document_id,
                payload=ProcessLocalDocumentRequest(
                    text=self.text_provider(job),
                    metadata={
                        "source": "worker_local_queue",
                        "job_id": str(job.job_id),
                    },
                ),
            )
            self.repository.mark_execution_succeeded(execution, result=result)
            self._record_audit(
                job,
                action="document_processing.worker_succeeded",
                metadata={
                    "chunk_count": result.chunk_count,
                    "embedding_count": result.embedding_count,
                },
            )
            return WorkerResult(
                job_id=job.job_id,
                document_id=job.document_id,
                status="succeeded",
            )
        except Exception as exc:
            self.repository.mark_execution_failed(
                execution,
                error_message=exc.__class__.__name__,
            )
            self._record_audit(
                job,
                action="document_processing.worker_failed",
                metadata={"error_type": exc.__class__.__name__},
            )
            return WorkerResult(
                job_id=job.job_id,
                document_id=job.document_id,
                status="failed",
                reason=exc.__class__.__name__,
            )

    def _record_audit(
        self,
        job: DocumentProcessingJob,
        *,
        action: str,
        metadata: dict | None = None,
    ) -> None:
        safe_metadata = {
            "job_id": str(job.job_id),
            "case_id": str(job.case_id),
            "source": job.metadata.get("source", "queue"),
        }
        if metadata:
            safe_metadata.update(metadata)

        self.audit_log.record_event(
            organization_id=job.organization_id,
            user_id=job.requested_by,
            action=action,
            entity_type="document",
            entity_id=job.document_id,
            metadata=safe_metadata,
        )

    def _commit(self) -> None:
        if self.db is not None:
            self.db.commit()

    def _rollback(self) -> None:
        if self.db is not None:
            self.db.rollback()


def build_worker() -> tuple[DocumentProcessingWorker, Session]:
    db = SessionLocal()
    return DocumentProcessingWorker(db=db), db


def main() -> int:
    parser = argparse.ArgumentParser(description="Worker local de processamento.")
    parser.add_argument("--once", action="store_true", help="Processa apenas um job.")
    parser.add_argument(
        "--max-jobs",
        type=int,
        default=1,
        help="Numero maximo de jobs a processar nesta execucao.",
    )
    args = parser.parse_args()

    worker, db = build_worker()
    try:
        max_jobs = 1 if args.once else max(1, args.max_jobs)
        for _ in range(max_jobs):
            result = worker.process_one()
            print(result.model_dump_json())
            if result.status == "empty":
                break
    finally:
        db.close()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
