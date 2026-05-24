import unittest
from pathlib import Path

from sqlalchemy import inspect

from src.db.base import Base


class ModelMetadataTest(unittest.TestCase):
    def test_initial_tables_are_registered(self) -> None:
        import src.models  # noqa: F401

        expected_tables = {
            "organizations",
            "users",
            "clients",
            "cases",
            "documents",
            "audit_log",
            "agent_executions",
        }

        self.assertEqual(expected_tables, set(Base.metadata.tables))

    def test_sensitive_tables_have_organization_id(self) -> None:
        import src.models  # noqa: F401

        sensitive_tables = {
            "users",
            "clients",
            "cases",
            "documents",
            "audit_log",
            "agent_executions",
        }

        for table_name in sensitive_tables:
            with self.subTest(table=table_name):
                table = Base.metadata.tables[table_name]
                self.assertIn("organization_id", table.c)
                self.assertFalse(table.c.organization_id.nullable)

    def test_mutable_tables_have_timestamps(self) -> None:
        import src.models  # noqa: F401

        for table_name, table in Base.metadata.tables.items():
            with self.subTest(table=table_name):
                self.assertIn("created_at", table.c)
                self.assertIn("updated_at", table.c)
                self.assertFalse(table.c.created_at.nullable)
                self.assertFalse(table.c.updated_at.nullable)

    def test_uuid_primary_keys_are_configured(self) -> None:
        import src.models  # noqa: F401

        for table_name, table in Base.metadata.tables.items():
            with self.subTest(table=table_name):
                primary_key = inspect(table).primary_key
                self.assertEqual(1, len(primary_key.columns))
                self.assertEqual("id", next(iter(primary_key.columns)).name)

    def test_expected_indexes_exist(self) -> None:
        import src.models  # noqa: F401

        expected_indexes = {
            "idx_users_org_email",
            "idx_users_org_role",
            "idx_clients_org_name",
            "idx_clients_org_document",
            "idx_cases_org_status",
            "idx_cases_org_client",
            "idx_documents_org_case",
            "idx_documents_org_status",
            "idx_audit_log_org_created",
            "idx_agent_executions_job_id",
            "idx_agent_executions_org_case",
            "idx_agent_executions_org_status",
        }
        actual_indexes = {
            index.name
            for table in Base.metadata.tables.values()
            for index in table.indexes
        }

        self.assertTrue(expected_indexes.issubset(actual_indexes))


class AlembicConfigTest(unittest.TestCase):
    def test_alembic_files_exist(self) -> None:
        api_root = Path(__file__).resolve().parents[1]

        self.assertTrue((api_root / "alembic.ini").is_file())
        self.assertTrue((api_root / "alembic" / "env.py").is_file())
        self.assertTrue((api_root / "alembic" / "script.py.mako").is_file())
        self.assertTrue((api_root / "alembic" / "versions").is_dir())


if __name__ == "__main__":
    unittest.main()
