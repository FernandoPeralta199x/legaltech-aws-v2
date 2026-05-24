import unittest
from uuid import uuid4

from sqlalchemy.dialects import postgresql


def compile_sql(statement) -> str:
    return str(
        statement.compile(
            dialect=postgresql.dialect(),
            compile_kwargs={"literal_binds": False},
        )
    )


class FakeScalarResult:
    def __init__(self, value: bool) -> None:
        self.value = value

    def first(self):
        return self.value


class FakeSession:
    def __init__(self, value: bool = True) -> None:
        self.value = value
        self.statements = []

    def scalars(self, statement):
        self.statements.append(statement)
        return FakeScalarResult(self.value)


class RolePermissionRepositoryTest(unittest.TestCase):
    def test_has_permission_filters_by_organization_role_and_permission(self) -> None:
        from src.modules.roles.repository import RolePermissionRepository

        session = FakeSession(value=True)
        organization_id = uuid4()

        result = RolePermissionRepository(session).has_permission(
            organization_id=organization_id,
            role="admin",
            permission="clients:write",
        )

        self.assertTrue(result)
        sql = compile_sql(session.statements[0])
        self.assertIn("roles_permissions.organization_id", sql)
        self.assertIn("roles_permissions.role", sql)
        self.assertIn("roles_permissions.permission", sql)


class RolePermissionServiceTest(unittest.TestCase):
    def test_has_permission_delegates_to_repository(self) -> None:
        from src.modules.roles.service import RolePermissionService

        class Repository:
            def __init__(self) -> None:
                self.calls = []

            def has_permission(self, *, organization_id, role, permission):
                self.calls.append((organization_id, role, permission))
                return True

        repository = Repository()
        organization_id = uuid4()

        result = RolePermissionService(repository=repository).has_permission(
            organization_id=organization_id,
            role="admin",
            permission="clients:write",
        )

        self.assertTrue(result)
        self.assertEqual(
            [(organization_id, "admin", "clients:write")],
            repository.calls,
        )


if __name__ == "__main__":
    unittest.main()
