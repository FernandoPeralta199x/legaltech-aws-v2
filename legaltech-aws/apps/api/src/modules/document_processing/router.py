from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from src.core.rbac import require_permission
from src.core.tenant import TenantContext
from src.db.session import get_db
from src.modules.audit.service import AuditLogService, get_audit_log_service
from src.modules.common.responses import success_response
from src.modules.document_processing.schemas import DocumentChunkRead
from src.modules.document_processing.schemas import ProcessLocalDocumentRequest
from src.modules.document_processing.schemas import ProcessLocalDocumentResponse
from src.modules.document_processing.service import DocumentProcessingService


router = APIRouter(prefix="/api/v1/documents", tags=["document-processing"])


def get_document_processing_service(
    db: Annotated[Session, Depends(get_db)],
) -> DocumentProcessingService:
    return DocumentProcessingService(db=db)


def serialize_process_result(result) -> dict:
    return ProcessLocalDocumentResponse.model_validate(result).model_dump(mode="json")


def serialize_chunk(chunk) -> dict:
    return DocumentChunkRead.model_validate(chunk).model_dump(mode="json")


def request_ip(request: Request) -> str | None:
    return request.client.host if request.client else None


@router.post("/{document_id}/process-local", status_code=status.HTTP_201_CREATED)
def process_document_local(
    document_id: UUID,
    payload: ProcessLocalDocumentRequest,
    request: Request,
    service: Annotated[
        DocumentProcessingService,
        Depends(get_document_processing_service),
    ],
    audit_log: Annotated[AuditLogService, Depends(get_audit_log_service)],
    tenant: Annotated[TenantContext, Depends(require_permission("documents:process"))],
) -> dict[str, object]:
    result = service.process_local_text(
        organization_id=tenant.organization_id,
        document_id=document_id,
        payload=payload,
    )
    audit_log.record_event(
        organization_id=tenant.organization_id,
        user_id=tenant.user_id,
        action="document.process_local",
        entity_type="document",
        entity_id=document_id,
        metadata={
            "chunk_count": result.chunk_count,
            "embedding_count": result.embedding_count,
            "text_length": len(payload.text),
            "provider": "fake_local",
        },
        ip_address=request_ip(request),
        user_agent=request.headers.get("user-agent"),
    )

    return success_response(
        serialize_process_result(result),
        "Documento processado localmente com sucesso.",
    )


@router.get("/{document_id}/chunks")
def list_document_chunks(
    document_id: UUID,
    request: Request,
    service: Annotated[
        DocumentProcessingService,
        Depends(get_document_processing_service),
    ],
    audit_log: Annotated[AuditLogService, Depends(get_audit_log_service)],
    tenant: Annotated[
        TenantContext,
        Depends(require_permission("document_chunks:read")),
    ],
) -> dict[str, object]:
    chunks = service.list_chunks(
        organization_id=tenant.organization_id,
        document_id=document_id,
    )
    audit_log.record_event(
        organization_id=tenant.organization_id,
        user_id=tenant.user_id,
        action="document_chunks.list",
        entity_type="document",
        entity_id=document_id,
        metadata={"chunk_count": len(chunks)},
        ip_address=request_ip(request),
        user_agent=request.headers.get("user-agent"),
    )

    return success_response([serialize_chunk(chunk) for chunk in chunks])
