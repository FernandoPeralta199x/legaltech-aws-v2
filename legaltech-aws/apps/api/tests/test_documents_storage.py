import io
import tempfile
import unittest
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException


class LocalDocumentStorageTest(unittest.TestCase):
    def test_save_file_validates_extension_and_persists_under_tenant_case_path(self) -> None:
        from src.modules.documents.storage import LocalDocumentStorage

        organization_id = uuid4()
        case_id = uuid4()

        with tempfile.TemporaryDirectory() as temp_dir:
            storage = LocalDocumentStorage(root_path=temp_dir, max_size_bytes=1024)

            result = storage.save_file(
                file_obj=io.BytesIO(b"conteudo de teste"),
                filename="Peticao Inicial.pdf",
                content_type="application/pdf",
                organization_id=organization_id,
                case_id=case_id,
            )

            saved_path = Path(temp_dir) / result.storage_key
            self.assertTrue(saved_path.is_file())
            self.assertEqual(b"conteudo de teste", saved_path.read_bytes())
            self.assertEqual("local-dev", result.storage_bucket)
            self.assertEqual("application/pdf", result.content_type)
            self.assertEqual(len(b"conteudo de teste"), result.size_bytes)
            self.assertIn(str(organization_id), result.storage_key)
            self.assertIn(str(case_id), result.storage_key)
            self.assertTrue(result.filename.endswith(".pdf"))
            self.assertTrue(result.file_hash.startswith("sha256:"))

    def test_save_file_rejects_unsupported_extension(self) -> None:
        from src.modules.documents.storage import LocalDocumentStorage

        with tempfile.TemporaryDirectory() as temp_dir:
            storage = LocalDocumentStorage(root_path=temp_dir, max_size_bytes=1024)

            with self.assertRaises(HTTPException) as context:
                storage.save_file(
                    file_obj=io.BytesIO(b"binario"),
                    filename="payload.exe",
                    content_type="application/octet-stream",
                    organization_id=uuid4(),
                    case_id=uuid4(),
                )

            self.assertEqual(400, context.exception.status_code)

    def test_save_file_rejects_files_above_max_size_and_removes_partial_file(self) -> None:
        from src.modules.documents.storage import LocalDocumentStorage

        with tempfile.TemporaryDirectory() as temp_dir:
            storage = LocalDocumentStorage(root_path=temp_dir, max_size_bytes=3)

            with self.assertRaises(HTTPException) as context:
                storage.save_file(
                    file_obj=io.BytesIO(b"1234"),
                    filename="contrato.txt",
                    content_type="text/plain",
                    organization_id=uuid4(),
                    case_id=uuid4(),
                )

            self.assertEqual(413, context.exception.status_code)
            self.assertFalse(any(path.is_file() for path in Path(temp_dir).rglob("*")))

    def test_local_upload_folder_is_ignored_by_git(self) -> None:
        repository_root = Path(__file__).resolve().parents[3]
        gitignore = (repository_root / ".gitignore").read_text(encoding="utf-8")

        self.assertIn(
            "apps/api/storage/local_uploads/",
            gitignore.replace("\\", "/"),
        )


if __name__ == "__main__":
    unittest.main()
