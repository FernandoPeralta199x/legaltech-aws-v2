import hashlib
import re
from dataclasses import dataclass
from pathlib import Path
from typing import BinaryIO
from uuid import UUID, uuid4

from fastapi import HTTPException, UploadFile, status

from src.core.config import Settings, get_settings


ALLOWED_UPLOAD_EXTENSIONS = frozenset({".pdf", ".docx", ".txt"})
DEFAULT_CONTENT_TYPE = "application/octet-stream"
LOCAL_STORAGE_BUCKET = "local-dev"
READ_CHUNK_SIZE_BYTES = 1024 * 1024


@dataclass(frozen=True)
class LocalUploadResult:
    filename: str
    content_type: str
    size_bytes: int
    storage_bucket: str
    storage_key: str
    file_hash: str


class LocalDocumentStorage:
    def __init__(
        self,
        *,
        root_path: str | Path,
        max_size_bytes: int,
        allowed_extensions: frozenset[str] = ALLOWED_UPLOAD_EXTENSIONS,
    ) -> None:
        self.root_path = Path(root_path).resolve()
        self.max_size_bytes = max_size_bytes
        self.allowed_extensions = allowed_extensions

    @classmethod
    def from_settings(cls, settings: Settings | None = None) -> "LocalDocumentStorage":
        settings = settings or get_settings()
        root_path = Path(settings.local_upload_root)
        if not root_path.is_absolute():
            api_root = Path(__file__).resolve().parents[3]
            root_path = api_root / root_path

        return cls(
            root_path=root_path,
            max_size_bytes=settings.max_upload_size_bytes,
        )

    def save_upload(
        self,
        *,
        upload_file: UploadFile,
        organization_id: UUID | str,
        case_id: UUID | str,
    ) -> LocalUploadResult:
        return self.save_file(
            file_obj=upload_file.file,
            filename=upload_file.filename or "document",
            content_type=upload_file.content_type or DEFAULT_CONTENT_TYPE,
            organization_id=organization_id,
            case_id=case_id,
        )

    def save_file(
        self,
        *,
        file_obj: BinaryIO,
        filename: str,
        content_type: str,
        organization_id: UUID | str,
        case_id: UUID | str,
    ) -> LocalUploadResult:
        safe_filename = self._safe_filename(filename)
        self._validate_extension(safe_filename)

        organization_path = str(organization_id)
        case_path = str(case_id)
        storage_key = (
            f"{organization_path}/cases/{case_path}/"
            f"{uuid4().hex}_{safe_filename}"
        )
        target_path = (self.root_path / storage_key).resolve()
        self._ensure_path_inside_root(target_path)
        target_path.parent.mkdir(parents=True, exist_ok=True)

        digest = hashlib.sha256()
        size_bytes = 0
        created_target = False

        try:
            with target_path.open("xb") as destination:
                created_target = True
                while chunk := file_obj.read(READ_CHUNK_SIZE_BYTES):
                    size_bytes += len(chunk)
                    if size_bytes > self.max_size_bytes:
                        raise HTTPException(
                            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
                            detail="Uploaded file exceeds the configured maximum size.",
                        )

                    digest.update(chunk)
                    destination.write(chunk)

            if size_bytes == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Uploaded file must not be empty.",
                )
        except Exception:
            if created_target:
                target_path.unlink(missing_ok=True)
            raise

        return LocalUploadResult(
            filename=safe_filename,
            content_type=content_type,
            size_bytes=size_bytes,
            storage_bucket=LOCAL_STORAGE_BUCKET,
            storage_key=storage_key.replace("\\", "/"),
            file_hash=f"sha256:{digest.hexdigest()}",
        )

    def _safe_filename(self, filename: str) -> str:
        base_name = Path(filename).name.strip()
        if not base_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file must include a filename.",
            )

        safe_name = re.sub(r"[^A-Za-z0-9._-]+", "_", base_name)
        safe_name = safe_name.strip("._")
        if not safe_name or "." not in safe_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file must include a valid extension.",
            )

        return safe_name

    def _validate_extension(self, filename: str) -> None:
        extension = Path(filename).suffix.lower()
        if extension not in self.allowed_extensions:
            allowed = ", ".join(sorted(self.allowed_extensions))
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported document extension. Allowed: {allowed}.",
            )

    def _ensure_path_inside_root(self, target_path: Path) -> None:
        try:
            target_path.relative_to(self.root_path)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid upload path.",
            ) from exc
