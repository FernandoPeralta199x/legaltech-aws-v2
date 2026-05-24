import unittest
from datetime import UTC, datetime
from types import SimpleNamespace
from uuid import UUID, uuid4

from fastapi.testclient import TestClient

from src.main import create_app


ORG_ID = "11111111-1111-4111-8111-111111111111"
USER_ID = "22222222-2222-4222-8222-222222222222"


def auth_headers(role: str = "admin") -> dict[str, str]:
    return {
        "X-Dev-User-Id": USER_ID,
        "X-Dev-Organization-Id": ORG_ID,
        "X-Dev-Role": role,
        "X-Dev-Email": "dev@example.com",
    }


def make_client(**overrides):
    now = datetime(2026, 5, 24, 12, 0, tzinfo=UTC)
    values = {
        "id": uuid4(),
        "name": "Cliente Teste",
        "document": "00000000000",
        "email": "cliente@example.com",
        "phone": "+5548999999999",
        "metadata_json": {},
        "created_at": now,
        "updated_at": now,
    }
    values.update(overrides)
    return SimpleNamespace(**values)


def make_case(**overrides):
    now = datetime(2026, 5, 24, 12, 0, tzinfo=UTC)
    values = {
        "id": uuid4(),
        "client_id": uuid4(),
        "case_type": "contract_analysis",
        "status": "draft",
        "priority": "normal",
        "metadata_json": {},
        "submitted_at": None,
        "completed_at": None,
        "created_at": now,
        "updated_at": now,
    }
    values.update(overrides)
    return SimpleNamespace(**values)


class FakeClientService:
    def list_clients(self, **kwargs):
        return [make_client()]

    def create_client(self, **kwargs):
        return make_client(name=kwargs["payload"].name)

    def get_client(self, **kwargs):
        return make_client(id=UUID(str(kwargs["client_id"])))

    def update_client(self, **kwargs):
        return make_client(id=UUID(str(kwargs["client_id"])), name=kwargs["payload"].name)


class FakeCaseService:
    def list_cases(self, **kwargs):
        return [make_case()]

    def create_case(self, **kwargs):
        return make_case(client_id=kwargs["payload"].client_id)

    def get_case(self, **kwargs):
        return make_case(id=UUID(str(kwargs["case_id"])))

    def update_case(self, **kwargs):
        return make_case(id=UUID(str(kwargs["case_id"])), status=kwargs["payload"].status)


class FakeAuditLogService:
    def __init__(self) -> None:
        self.events = []

    def record_event(self, **kwargs):
        self.events.append(kwargs)
        return SimpleNamespace(**kwargs)


class AuthRbacAuditRoutesTest(unittest.TestCase):
    def setUp(self) -> None:
        from src.modules.cases.router import get_case_service
        from src.modules.clients.router import get_client_service

        self.audit_service = FakeAuditLogService()
        self.app = create_app()
        self.app.dependency_overrides[get_client_service] = lambda: FakeClientService()
        self.app.dependency_overrides[get_case_service] = lambda: FakeCaseService()

        from src.modules.audit.service import get_audit_log_service

        self.app.dependency_overrides[get_audit_log_service] = lambda: self.audit_service
        self.client = TestClient(self.app)

    def tearDown(self) -> None:
        self.app.dependency_overrides.clear()

    def test_sensitive_routes_require_mock_auth_headers(self) -> None:
        response = self.client.get("/api/v1/clients")

        self.assertEqual(401, response.status_code)
        body = response.json()
        self.assertEqual(False, body["success"])
        self.assertEqual("UNAUTHORIZED", body["error"]["code"])

    def test_rbac_denies_write_when_role_lacks_permission(self) -> None:
        response = self.client.post(
            "/api/v1/clients",
            headers=auth_headers(role="support"),
            json={"name": "Cliente Teste"},
        )

        self.assertEqual(403, response.status_code)
        body = response.json()
        self.assertEqual(False, body["success"])
        self.assertEqual("FORBIDDEN", body["error"]["code"])

    def test_create_client_records_audit_log(self) -> None:
        response = self.client.post(
            "/api/v1/clients",
            headers=auth_headers(role="admin"),
            json={"name": "Cliente Teste"},
        )

        self.assertEqual(201, response.status_code)
        self.assertEqual(1, len(self.audit_service.events))
        event = self.audit_service.events[0]
        self.assertEqual(ORG_ID, event["organization_id"])
        self.assertEqual(USER_ID, event["user_id"])
        self.assertEqual("client.create", event["action"])
        self.assertEqual("client", event["entity_type"])

    def test_get_client_records_audit_log(self) -> None:
        client_id = uuid4()
        response = self.client.get(
            f"/api/v1/clients/{client_id}",
            headers=auth_headers(role="admin"),
        )

        self.assertEqual(200, response.status_code)
        self.assertEqual(1, len(self.audit_service.events))
        event = self.audit_service.events[0]
        self.assertEqual("client.read", event["action"])
        self.assertEqual("client", event["entity_type"])
        self.assertEqual(client_id, event["entity_id"])

    def test_update_case_records_audit_log(self) -> None:
        case_id = uuid4()
        response = self.client.patch(
            f"/api/v1/cases/{case_id}",
            headers=auth_headers(role="admin"),
            json={"status": "submitted"},
        )

        self.assertEqual(200, response.status_code)
        self.assertEqual(1, len(self.audit_service.events))
        event = self.audit_service.events[0]
        self.assertEqual("case.update", event["action"])
        self.assertEqual("case", event["entity_type"])
        self.assertEqual(case_id, event["entity_id"])


if __name__ == "__main__":
    unittest.main()
