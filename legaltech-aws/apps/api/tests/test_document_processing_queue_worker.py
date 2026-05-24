import sys
import tempfile
import unittest
from datetime import UTC, datetime
from pathlib import Path
from types import SimpleNamespace
from uuid import uuid4

from fastapi.testclient import TestClient
from pydantic import ValidationError

from src.main import create_app
from src.modules.common.exceptions import ResourceNotFoundError


REPO_ROOT = Path(__file__).resolve().parents[3]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

ORG_ID = "11111111-1111-4111-8111-111111111111"
USER_ID = "22222222-2222-4222-8222-222222222222"


def auth_headers() -> dict[str, str]:
    return {"Authorization": "Bearer valid-test-token"}


class FakeJwtVerifier:
    def verify(self, token: str):
        from src.core.security import AuthenticatedUser

        return AuthenticatedUser(
            user_id=USER_ID,
            email="dev@example.com",
            organization_id=ORG_ID,
            role="admin",
        )


class FakePermissionService:
    def __init__(self) -> None:
        self.calls = []
        self.allowed = True

    def has_permission(self, *, organization_id: str, role: str, permission: str) -> bool:
        self.calls.append(
            {
                "organization_id": organization_id,
                "role": role,
                "permission": permission,
            }
        )
        return self.allowed


class FakeAuditLogService:
    def __init__(self) -> None:
        self.events = []

    def record_event(self, **kwargs):
        self.events.append(kwargs)
        return SimpleNamespace(**kwargs)


class QueueSchemasTest(unittest.TestCase):
    def test_document_processing_job_rejects_sensitive_metadata(self) -> None:
        from src.modules.queues.schemas import DocumentProcessingJob

        with self.assertRaises(ValidationError):
            DocumentProcessingJob.model_validate(
                {
                    "organization_id": uuid4(),
                    "case_id": uuid4(),
                    "document_id": uuid4(),
                    "requested_by": uuid4(),
                    "metadata": {"text": "conteudo sensivel ficticio"},
                }
            )


class LocalQueueTest(unittest.TestCase):
    def test_publish_and_consume_local_processing_job(self) -> None:
        from src.modules.queues.local_queue import LocalFileQueueClient
        from src.modules.queues.schemas import DocumentProcessingJob

        with tempfile.TemporaryDirectory() as temp_dir:
            queue = LocalFileQueueClient(Path(temp_dir) / "jobs.jsonl")
            job = DocumentProcessingJob(
                organization_id=uuid4(),
                case_id=uuid4(),
                document_id=uuid4(),
                requested_by=uuid4(),
                metadata={"source": "unit-test"},
            )

            queued = queue.publish(job)
            messages = queue.receive(max_messages=1)

        self.assertEqual(job.job_id, queued.job.job_id)
        self.assertEqual(1, len(messages))
        self.assertEqual(job.job_id, messages[0].job.job_id)
        self.assertNotIn("conteudo", messages[0].job.model_dump_json())


class PublisherTest(unittest.TestCase):
    def test_publisher_validates_document_tenant_and_publishes_ids_only(self) -> None:
        from src.modules.queues.publisher import DocumentProcessingJobPublisher

        organization_id = uuid4()
        document_id = uuid4()
        case_id = uuid4()
        requested_by = uuid4()

        class Repository:
            def get_document(self, *, organization_id, document_id):
                return SimpleNamespace(
                    id=document_id,
                    organization_id=organization_id,
                    case_id=case_id,
                )

        class Queue:
            def __init__(self) -> None:
                self.jobs = []

            def publish(self, job):
                self.jobs.append(job)
                return SimpleNamespace(job=job)

        queue = Queue()
        publisher = DocumentProcessingJobPublisher(
            repository=Repository(),
            queue_client=queue,
            queue_backend="local",
        )

        result = publisher.enqueue_document_processing(
            organization_id=organization_id,
            document_id=document_id,
            requested_by=requested_by,
        )

        self.assertEqual("queued", result.status)
        self.assertEqual(document_id, queue.jobs[0].document_id)
        self.assertEqual(case_id, queue.jobs[0].case_id)
        self.assertEqual(organization_id, queue.jobs[0].organization_id)
        self.assertEqual(requested_by, queue.jobs[0].requested_by)
        self.assertNotIn("text", queue.jobs[0].model_dump())
        self.assertNotIn("content", queue.jobs[0].model_dump())

    def test_publisher_rejects_document_from_other_organization(self) -> None:
        from src.modules.queues.publisher import DocumentProcessingJobPublisher

        class Repository:
            def get_document(self, *, organization_id, document_id):
                return None

        class Queue:
            def publish(self, job):
                raise AssertionError("queue should not receive invalid jobs")

        publisher = DocumentProcessingJobPublisher(
            repository=Repository(),
            queue_client=Queue(),
            queue_backend="local",
        )

        with self.assertRaises(ResourceNotFoundError):
            publisher.enqueue_document_processing(
                organization_id=uuid4(),
                document_id=uuid4(),
                requested_by=uuid4(),
            )


class EnqueueDocumentProcessingRouteTest(unittest.TestCase):
    def setUp(self) -> None:
        from src.core.rbac import get_permission_service
        from src.core.security import get_jwt_verifier
        from src.modules.audit.service import get_audit_log_service
        from src.modules.document_processing.router import (
            get_document_processing_job_publisher,
        )

        class FakePublisher:
            def __init__(self) -> None:
                self.calls = []

            def enqueue_document_processing(self, **kwargs):
                self.calls.append(kwargs)
                return SimpleNamespace(
                    job_id=uuid4(),
                    status="queued",
                    queue_backend="local",
                    document_id=kwargs["document_id"],
                )

        self.publisher = FakePublisher()
        self.audit_service = FakeAuditLogService()
        self.permission_service = FakePermissionService()
        self.app = create_app()
        self.app.dependency_overrides[get_jwt_verifier] = lambda: FakeJwtVerifier()
        self.app.dependency_overrides[get_permission_service] = (
            lambda: self.permission_service
        )
        self.app.dependency_overrides[get_document_processing_job_publisher] = (
            lambda: self.publisher
        )
        self.app.dependency_overrides[get_audit_log_service] = lambda: self.audit_service
        self.client = TestClient(self.app)

    def tearDown(self) -> None:
        self.app.dependency_overrides.clear()

    def test_enqueue_processing_uses_rbac_tenant_and_audit(self) -> None:
        document_id = uuid4()
        response = self.client.post(
            f"/api/v1/documents/{document_id}/enqueue-processing",
            headers=auth_headers(),
        )

        self.assertEqual(202, response.status_code)
        self.assertTrue(response.json()["success"])
        self.assertEqual("queued", response.json()["data"]["status"])
        self.assertEqual(
            "documents:process",
            self.permission_service.calls[0]["permission"],
        )
        self.assertEqual(ORG_ID, self.publisher.calls[0]["organization_id"])
        self.assertEqual(USER_ID, self.publisher.calls[0]["requested_by"])
        self.assertEqual(document_id, self.publisher.calls[0]["document_id"])
        self.assertEqual(
            "document.processing_enqueue",
            self.audit_service.events[0]["action"],
        )
        self.assertNotIn("text", self.audit_service.events[0]["metadata"])
        self.assertNotIn("content", str(self.audit_service.events[0]["metadata"]))

    def test_enqueue_without_permission_is_forbidden(self) -> None:
        self.permission_service.allowed = False

        response = self.client.post(
            f"/api/v1/documents/{uuid4()}/enqueue-processing",
            headers=auth_headers(),
        )

        self.assertEqual(403, response.status_code)
        self.assertEqual([], self.publisher.calls)


class FakeWorkerQueue:
    def __init__(self, messages) -> None:
        self.messages = list(messages)
        self.acked = []

    def receive(self, *, max_messages=1):
        selected = self.messages[:max_messages]
        self.messages = self.messages[max_messages:]
        return selected

    def ack(self, receipt_handle: str) -> None:
        self.acked.append(receipt_handle)


class FakeWorkerRepository:
    def __init__(self, *, document=None, chunks=None, execution=None) -> None:
        self.document = document
        self.chunks = chunks or []
        self.execution = execution
        self.created_executions = []
        self.statuses = []
        self.document_queries = []

    def get_document(self, *, organization_id, document_id):
        self.document_queries.append(
            {"organization_id": organization_id, "document_id": document_id}
        )
        return self.document

    def list_chunks(self, *, organization_id, document_id):
        return self.chunks

    def get_execution_by_job_id(self, *, organization_id, job_id):
        return self.execution

    def create_execution(self, *, job, status):
        execution = SimpleNamespace(
            id=uuid4(),
            organization_id=job.organization_id,
            case_id=job.case_id,
            document_id=job.document_id,
            job_id=job.job_id,
            status=status,
            started_at=None,
            completed_at=None,
            output_payload={},
            error_message=None,
        )
        self.created_executions.append(execution)
        self.execution = execution
        return execution

    def mark_execution_started(self, execution):
        execution.status = "running"
        self.statuses.append("running")

    def mark_execution_succeeded(self, execution, *, result):
        execution.status = "succeeded"
        self.statuses.append("succeeded")

    def mark_execution_skipped(self, execution, *, reason):
        execution.status = "skipped"
        self.statuses.append("skipped")

    def mark_execution_failed(self, execution, *, error_message):
        execution.status = "failed"
        execution.error_message = error_message
        self.statuses.append("failed")


class FakeProcessingService:
    def __init__(self) -> None:
        self.calls = []

    def process_local_text(self, **kwargs):
        self.calls.append(kwargs)
        return SimpleNamespace(
            document_id=kwargs["document_id"],
            chunk_count=1,
            embedding_count=1,
            status="processed_local",
        )


class DocumentProcessingWorkerTest(unittest.TestCase):
    def make_message(self, *, organization_id=None, document_id=None, case_id=None):
        from src.modules.queues.schemas import DocumentProcessingJob, LocalQueueMessage

        job = DocumentProcessingJob(
            organization_id=organization_id or uuid4(),
            case_id=case_id or uuid4(),
            document_id=document_id or uuid4(),
            requested_by=uuid4(),
            metadata={"source": "unit-test"},
        )
        return LocalQueueMessage(receipt_handle=str(uuid4()), job=job)

    def test_worker_consumes_job_revalidates_ids_and_processes_document(self) -> None:
        from workers.document_processing.worker import DocumentProcessingWorker

        message = self.make_message()
        document = SimpleNamespace(
            id=message.job.document_id,
            organization_id=message.job.organization_id,
            case_id=message.job.case_id,
        )
        repository = FakeWorkerRepository(document=document)
        processing_service = FakeProcessingService()
        audit_log = FakeAuditLogService()
        worker = DocumentProcessingWorker(
            queue_client=FakeWorkerQueue([message]),
            repository=repository,
            processing_service=processing_service,
            audit_log=audit_log,
        )

        result = worker.process_one()

        self.assertEqual("succeeded", result.status)
        self.assertEqual([message.receipt_handle], worker.queue_client.acked)
        self.assertEqual(message.job.organization_id, repository.document_queries[0]["organization_id"])
        self.assertEqual(message.job.document_id, repository.document_queries[0]["document_id"])
        self.assertEqual(message.job.organization_id, processing_service.calls[0]["organization_id"])
        self.assertEqual(message.job.document_id, processing_service.calls[0]["document_id"])
        self.assertNotIn("text", audit_log.events[0]["metadata"])
        self.assertNotIn("conteudo sensivel", str(audit_log.events))
        self.assertIn("succeeded", repository.statuses)

    def test_worker_rejects_job_when_document_case_does_not_match(self) -> None:
        from workers.document_processing.worker import DocumentProcessingWorker

        message = self.make_message()
        document = SimpleNamespace(
            id=message.job.document_id,
            organization_id=message.job.organization_id,
            case_id=uuid4(),
        )
        repository = FakeWorkerRepository(document=document)
        processing_service = FakeProcessingService()
        audit_log = FakeAuditLogService()
        worker = DocumentProcessingWorker(
            queue_client=FakeWorkerQueue([message]),
            repository=repository,
            processing_service=processing_service,
            audit_log=audit_log,
        )

        result = worker.process_one()

        self.assertEqual("failed", result.status)
        self.assertEqual([], processing_service.calls)
        self.assertIn("failed", repository.statuses)
        self.assertEqual("document_processing.worker_failed", audit_log.events[-1]["action"])

    def test_worker_skips_duplicate_when_chunks_already_exist(self) -> None:
        from workers.document_processing.worker import DocumentProcessingWorker

        message = self.make_message()
        document = SimpleNamespace(
            id=message.job.document_id,
            organization_id=message.job.organization_id,
            case_id=message.job.case_id,
        )
        repository = FakeWorkerRepository(
            document=document,
            chunks=[SimpleNamespace(id=uuid4())],
        )
        processing_service = FakeProcessingService()
        audit_log = FakeAuditLogService()
        worker = DocumentProcessingWorker(
            queue_client=FakeWorkerQueue([message]),
            repository=repository,
            processing_service=processing_service,
            audit_log=audit_log,
        )

        result = worker.process_one()

        self.assertEqual("skipped", result.status)
        self.assertEqual([], processing_service.calls)
        self.assertIn("skipped", repository.statuses)
        self.assertEqual("document_processing.worker_skipped", audit_log.events[-1]["action"])

    def test_worker_fails_job_from_other_organization(self) -> None:
        from workers.document_processing.worker import DocumentProcessingWorker

        message = self.make_message()
        repository = FakeWorkerRepository(document=None)
        processing_service = FakeProcessingService()
        audit_log = FakeAuditLogService()
        worker = DocumentProcessingWorker(
            queue_client=FakeWorkerQueue([message]),
            repository=repository,
            processing_service=processing_service,
            audit_log=audit_log,
        )

        result = worker.process_one()

        self.assertEqual("failed", result.status)
        self.assertEqual([], processing_service.calls)
        self.assertEqual("document_processing.worker_failed", audit_log.events[-1]["action"])


if __name__ == "__main__":
    unittest.main()
