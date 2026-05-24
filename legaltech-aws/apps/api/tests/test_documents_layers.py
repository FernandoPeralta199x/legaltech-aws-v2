import unittest
from uuid import uuid4

from pydantic import ValidationError
from sqlalchemy.dialects import postgresql


def compile_sql(statement) -> str:
    return str(
        statement.compile(
            dialect=postgresql.dialect(),
            compile_kwargs={"literal_binds": False},
        )
    )


class FakeScalarResult:
    def __init__(self, values=None) -> None:
        self.values = values or []

    def all(self):
        return self.values

    def first(self):
        return self.values[0] if self.values else None


class FakeSession:
    def __init__(self, scalars_result=None) -> None:
        self.scalars_result = FakeScalarResult(scalars_result)
        self.statements = []
        self.added = []
        self.flushed = False
        self.refreshed = []

    def scalars(self, statement):
        self.statements.append(statement)
        return self.scalars_result

    def add(self, instance) -> None:
        self.added.append(instance)

    def flush(self) -> None:
        self.flushed = True

    def refresh(self, instance) -> None:
        self.refreshed.append(instance)


class DocumentSchemasTest(unittest.TestCase):
    def test_document_create_rejects_authoritative_and_storage_fields(self) -> None:
        from src.modules.documents.schemas import DocumentCreate

        with self.assertRaises(ValidationError):
            DocumentCreate.model_validate(
                {
                    "case_id": str(uuid4()),
                    "filename": "contrato.pdf",
                    "content_type": "application/pdf",
                    "size_bytes": 1024,
                    "organization_id": str(uuid4()),
                    "storage_bucket": "frontend-bucket",
                    "storage_key": "frontend-key",
                    "uploaded_by": str(uuid4()),
                }
            )

    def test_document_update_rejects_authoritative_and_storage_fields(self) -> None:
        from src.modules.documents.schemas import DocumentUpdate

        with self.assertRaises(ValidationError):
            DocumentUpdate.model_validate(
                {
                    "metadata": {"origin": "frontend"},
                    "organization_id": str(uuid4()),
                    "storage_bucket": "frontend-bucket",
                    "storage_key": "frontend-key",
                    "uploaded_by": str(uuid4()),
                }
            )


class DocumentRepositoryTest(unittest.TestCase):
    def test_list_documents_filters_by_organization_not_deleted_and_filters(self) -> None:
        from src.modules.documents.repository import DocumentRepository

        session = FakeSession()

        DocumentRepository(session).list_documents(
            organization_id=uuid4(),
            case_id=uuid4(),
            status="pending_upload",
            page=2,
            page_size=10,
        )

        sql = compile_sql(session.statements[0])
        self.assertIn("documents.organization_id", sql)
        self.assertIn("documents.deleted_at IS NULL", sql)
        self.assertIn("documents.case_id", sql)
        self.assertIn("documents.status", sql)
        self.assertIn("LIMIT", sql)
        self.assertIn("OFFSET", sql)

    def test_get_document_filters_by_organization_and_not_deleted(self) -> None:
        from src.modules.documents.repository import DocumentRepository

        session = FakeSession()

        DocumentRepository(session).get_document(
            organization_id=uuid4(),
            document_id=uuid4(),
        )

        sql = compile_sql(session.statements[0])
        self.assertIn("documents.id", sql)
        self.assertIn("documents.organization_id", sql)
        self.assertIn("documents.deleted_at IS NULL", sql)


class DocumentServiceTest(unittest.TestCase):
    def test_create_document_requires_case_from_same_organization(self) -> None:
        from src.modules.common.exceptions import ResourceNotFoundError
        from src.modules.documents.schemas import DocumentCreate
        from src.modules.documents.service import DocumentService

        class DocumentRepository:
            def create_document(self, document):
                return document

        class CaseRepository:
            def get_case(self, *, organization_id, case_id):
                return None

        service = DocumentService(
            repository=DocumentRepository(),
            case_repository=CaseRepository(),
        )

        with self.assertRaises(ResourceNotFoundError):
            service.create_document(
                organization_id=uuid4(),
                user_id=uuid4(),
                payload=DocumentCreate(
                    case_id=uuid4(),
                    filename="contrato.pdf",
                    content_type="application/pdf",
                    size_bytes=1024,
                ),
            )

    def test_create_document_uses_internal_tenant_user_and_storage_placeholders(self) -> None:
        from src.modules.documents.schemas import DocumentCreate
        from src.modules.documents.service import DocumentService

        class DocumentRepository:
            def __init__(self) -> None:
                self.created = None

            def create_document(self, document):
                self.created = document
                return document

        class CaseRepository:
            def get_case(self, *, organization_id, case_id):
                return object()

        organization_id = uuid4()
        user_id = uuid4()
        case_id = uuid4()
        document_repository = DocumentRepository()
        service = DocumentService(
            repository=document_repository,
            case_repository=CaseRepository(),
        )

        service.create_document(
            organization_id=organization_id,
            user_id=user_id,
            payload=DocumentCreate(
                case_id=case_id,
                filename="contrato.pdf",
                content_type="application/pdf",
                size_bytes=1024,
                metadata={"origin": "unit-test"},
            ),
        )

        self.assertEqual(organization_id, document_repository.created.organization_id)
        self.assertEqual(user_id, document_repository.created.uploaded_by)
        self.assertEqual(case_id, document_repository.created.case_id)
        self.assertEqual("metadata-only-local", document_repository.created.storage_bucket)
        self.assertIn(str(organization_id), document_repository.created.storage_key)
        self.assertEqual({"origin": "unit-test"}, document_repository.created.metadata_json)

    def test_update_document_validates_new_case_when_case_id_changes(self) -> None:
        from src.modules.common.exceptions import ResourceNotFoundError
        from src.modules.documents.schemas import DocumentUpdate
        from src.modules.documents.service import DocumentService

        class DocumentRepository:
            def get_document(self, *, organization_id, document_id):
                return object()

            def update_document(self, document, values):
                return document

        class CaseRepository:
            def get_case(self, *, organization_id, case_id):
                return None

        service = DocumentService(
            repository=DocumentRepository(),
            case_repository=CaseRepository(),
        )

        with self.assertRaises(ResourceNotFoundError):
            service.update_document(
                organization_id=uuid4(),
                document_id=uuid4(),
                payload=DocumentUpdate(case_id=uuid4()),
            )


if __name__ == "__main__":
    unittest.main()
