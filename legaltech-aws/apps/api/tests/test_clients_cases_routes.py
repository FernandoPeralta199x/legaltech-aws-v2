import unittest
from datetime import UTC, datetime
from types import SimpleNamespace
from uuid import UUID, uuid4

from fastapi.testclient import TestClient

from src.core.tenant import TenantContext
from src.main import create_app
from src.modules.common.exceptions import ResourceNotFoundError


ORG_ID = "11111111-1111-4111-8111-111111111111"
USER_ID = "22222222-2222-4222-8222-222222222222"


def tenant_override() -> TenantContext:
    return TenantContext(
        organization_id=ORG_ID,
        user_id=USER_ID,
        role="admin",
    )


def make_client(**overrides):
    now = datetime(2026, 5, 23, 12, 0, tzinfo=UTC)
    values = {
        "id": uuid4(),
        "name": "Cliente Teste",
        "document": "00000000000",
        "email": "cliente@example.com",
        "phone": "+5548999999999",
        "metadata_json": {"origin": "test"},
        "created_at": now,
        "updated_at": now,
    }
    values.update(overrides)
    return SimpleNamespace(**values)


def make_case(**overrides):
    now = datetime(2026, 5, 23, 12, 0, tzinfo=UTC)
    values = {
        "id": uuid4(),
        "client_id": uuid4(),
        "case_type": "contract_analysis",
        "status": "draft",
        "priority": "normal",
        "metadata_json": {"product": "analise_contratual"},
        "submitted_at": None,
        "completed_at": None,
        "created_at": now,
        "updated_at": now,
    }
    values.update(overrides)
    return SimpleNamespace(**values)


class FakeClientService:
    def __init__(self) -> None:
        self.calls = []
        self.client = make_client()

    def list_clients(self, **kwargs):
        self.calls.append(("list_clients", kwargs))
        return [self.client]

    def create_client(self, **kwargs):
        self.calls.append(("create_client", kwargs))
        return make_client(
            name=kwargs["payload"].name,
            document=kwargs["payload"].document,
            metadata_json=kwargs["payload"].metadata,
        )

    def get_client(self, **kwargs):
        self.calls.append(("get_client", kwargs))
        return self.client

    def update_client(self, **kwargs):
        self.calls.append(("update_client", kwargs))
        return make_client(id=UUID(str(kwargs["client_id"])), name=kwargs["payload"].name)


class NotFoundClientService(FakeClientService):
    def get_client(self, **kwargs):
        raise ResourceNotFoundError("Client not found.")


class FakeCaseService:
    def __init__(self) -> None:
        self.calls = []
        self.case = make_case()

    def list_cases(self, **kwargs):
        self.calls.append(("list_cases", kwargs))
        return [self.case]

    def create_case(self, **kwargs):
        self.calls.append(("create_case", kwargs))
        return make_case(
            client_id=kwargs["payload"].client_id,
            case_type=kwargs["payload"].case_type,
            priority=kwargs["payload"].priority,
            metadata_json=kwargs["payload"].metadata,
        )

    def get_case(self, **kwargs):
        self.calls.append(("get_case", kwargs))
        return self.case

    def update_case(self, **kwargs):
        self.calls.append(("update_case", kwargs))
        return make_case(id=UUID(str(kwargs["case_id"])), status=kwargs["payload"].status)


class NotFoundCaseService(FakeCaseService):
    def get_case(self, **kwargs):
        raise ResourceNotFoundError("Case not found.")


class FakeAuditLogService:
    def record_event(self, **kwargs):
        return SimpleNamespace(**kwargs)


class ClientsRoutesTest(unittest.TestCase):
    def setUp(self) -> None:
        from src.core.tenant import get_dev_tenant_context
        from src.modules.audit.service import get_audit_log_service
        from src.modules.clients.router import get_client_service

        self.service = FakeClientService()
        self.app = create_app()
        self.app.dependency_overrides[get_dev_tenant_context] = tenant_override
        self.app.dependency_overrides[get_client_service] = lambda: self.service
        self.app.dependency_overrides[get_audit_log_service] = FakeAuditLogService
        self.client = TestClient(self.app)

    def tearDown(self) -> None:
        self.app.dependency_overrides.clear()

    def test_list_clients_uses_internal_tenant_context(self) -> None:
        response = self.client.get("/api/v1/clients?search=teste&page=2&page_size=10")

        self.assertEqual(200, response.status_code)
        body = response.json()
        self.assertTrue(body["success"])
        self.assertEqual("Cliente Teste", body["data"][0]["name"])
        self.assertEqual(
            ("list_clients", {
                "organization_id": ORG_ID,
                "search": "teste",
                "page": 2,
                "page_size": 10,
            }),
            self.service.calls[0],
        )

    def test_create_client_rejects_frontend_organization_id(self) -> None:
        response = self.client.post(
            "/api/v1/clients",
            json={
                "name": "Cliente Teste",
                "organization_id": str(uuid4()),
            },
        )

        self.assertEqual(422, response.status_code)

    def test_create_client_uses_internal_tenant_and_user(self) -> None:
        response = self.client.post(
            "/api/v1/clients",
            json={
                "name": "Cliente Novo",
                "document": "00000000000",
                "metadata": {"origin": "route-test"},
            },
        )

        self.assertEqual(201, response.status_code)
        self.assertTrue(response.json()["success"])
        _, kwargs = self.service.calls[0]
        self.assertEqual(ORG_ID, kwargs["organization_id"])
        self.assertEqual(USER_ID, kwargs["user_id"])

    def test_get_client_not_found_returns_contract_error(self) -> None:
        from src.modules.clients.router import get_client_service

        self.app.dependency_overrides[get_client_service] = lambda: NotFoundClientService()
        missing_id = uuid4()
        response = self.client.get(f"/api/v1/clients/{missing_id}")

        self.assertEqual(404, response.status_code)
        self.assertEqual(False, response.json()["success"])
        self.assertEqual("NOT_FOUND", response.json()["error"]["code"])

    def test_update_client_uses_internal_tenant_context(self) -> None:
        client_id = uuid4()
        response = self.client.patch(
            f"/api/v1/clients/{client_id}",
            json={"name": "Cliente Atualizado"},
        )

        self.assertEqual(200, response.status_code)
        self.assertTrue(response.json()["success"])
        _, kwargs = self.service.calls[0]
        self.assertEqual(ORG_ID, kwargs["organization_id"])
        self.assertEqual(client_id, kwargs["client_id"])


class CasesRoutesTest(unittest.TestCase):
    def setUp(self) -> None:
        from src.core.tenant import get_dev_tenant_context
        from src.modules.audit.service import get_audit_log_service
        from src.modules.cases.router import get_case_service

        self.service = FakeCaseService()
        self.app = create_app()
        self.app.dependency_overrides[get_dev_tenant_context] = tenant_override
        self.app.dependency_overrides[get_case_service] = lambda: self.service
        self.app.dependency_overrides[get_audit_log_service] = FakeAuditLogService
        self.client = TestClient(self.app)

    def tearDown(self) -> None:
        self.app.dependency_overrides.clear()

    def test_list_cases_uses_internal_tenant_context(self) -> None:
        client_id = uuid4()
        response = self.client.get(
            "/api/v1/cases",
            params={
                "status": "draft",
                "case_type": "contract_analysis",
                "client_id": str(client_id),
            },
        )

        self.assertEqual(200, response.status_code)
        self.assertTrue(response.json()["success"])
        _, kwargs = self.service.calls[0]
        self.assertEqual(ORG_ID, kwargs["organization_id"])
        self.assertEqual("draft", kwargs["status"])
        self.assertEqual(client_id, kwargs["client_id"])

    def test_create_case_rejects_frontend_organization_id_and_created_by(self) -> None:
        response = self.client.post(
            "/api/v1/cases",
            json={
                "client_id": str(uuid4()),
                "case_type": "contract_analysis",
                "organization_id": str(uuid4()),
                "created_by": str(uuid4()),
            },
        )

        self.assertEqual(422, response.status_code)

    def test_create_case_uses_internal_tenant_and_user(self) -> None:
        response = self.client.post(
            "/api/v1/cases",
            json={
                "client_id": str(uuid4()),
                "case_type": "contract_analysis",
                "priority": "normal",
                "metadata": {"product": "analise_contratual"},
            },
        )

        self.assertEqual(201, response.status_code)
        self.assertTrue(response.json()["success"])
        _, kwargs = self.service.calls[0]
        self.assertEqual(ORG_ID, kwargs["organization_id"])
        self.assertEqual(USER_ID, kwargs["user_id"])

    def test_get_case_not_found_returns_contract_error(self) -> None:
        from src.modules.cases.router import get_case_service

        self.app.dependency_overrides[get_case_service] = lambda: NotFoundCaseService()
        missing_id = uuid4()
        response = self.client.get(f"/api/v1/cases/{missing_id}")

        self.assertEqual(404, response.status_code)
        self.assertEqual(False, response.json()["success"])
        self.assertEqual("NOT_FOUND", response.json()["error"]["code"])

    def test_update_case_uses_internal_tenant_context(self) -> None:
        case_id = uuid4()
        response = self.client.patch(
            f"/api/v1/cases/{case_id}",
            json={"status": "submitted"},
        )

        self.assertEqual(200, response.status_code)
        self.assertTrue(response.json()["success"])
        _, kwargs = self.service.calls[0]
        self.assertEqual(ORG_ID, kwargs["organization_id"])
        self.assertEqual(case_id, kwargs["case_id"])


if __name__ == "__main__":
    unittest.main()
