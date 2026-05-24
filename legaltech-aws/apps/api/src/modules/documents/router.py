from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.orm import Session

from src.core.rbac import require_permission
from src.core.tenant import TenantContext
from src.db.session import get_db
from src.modules.audit.service import AuditLogService, get_audit_log_service
from src.modules.common.responses import success_response
from src.modules.documents.schemas import DocumentCreate, DocumentRead, DocumentUpdate
from src.modules.documents.service import DocumentService


router = APIRouter(prefix="/api/v1/documents", tags=["documents"])


def get_document_service(db: Annotated[Session, Depends(get_db)]) -> DocumentService:
    return DocumentService(db=db)


def serialize_document(document) -> dict:
    return DocumentRead.model_validate(document).model_dump(mode="json")


def request_ip(request: Request) -> str | None:
    return request.client.host if request.client else None


@router.get("")
def list_documents(
    request: Request,
    service: Annotated[DocumentService, Depends(get_document_service)],
    audit_log: Annotated[AuditLogService, Depends(get_audit_log_service)],
    tenant: Annotated[TenantContext, Depends(require_permission("documents:read"))],
    case_id: UUID | None = None,
    status: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> dict[str, object]:
    documents = service.list_documents(
        organization_id=tenant.organization_id,
        case_id=case_id,
        status=status,
        page=page,
        page_size=page_size,
    )
    audit_log.record_event(
        organization_id=tenant.organization_id,
        user_id=tenant.user_id,
        action="document.list",
        entity_type="document",
        metadata={
            "case_id": str(case_id) if case_id else None,
            "status": status,
            "page": page,
            "page_size": page_size,
        },
        ip_address=request_ip(request),
        user_agent=request.headers.get("user-agent"),
    )

    return success_response([serialize_document(document) for document in documents])


@router.post("", status_code=status.HTTP_201_CREATED)
def create_document(
    payload: DocumentCreate,
    request: Request,
    service: Annotated[DocumentService, Depends(get_document_service)],
    audit_log: Annotated[AuditLogService, Depends(get_audit_log_service)],
    tenant: Annotated[TenantContext, Depends(require_permission("documents:write"))],
) -> dict[str, object]:
    document = service.create_document(
        organization_id=tenant.organization_id,
        user_id=tenant.user_id,
        payload=payload,
    )
    audit_log.record_event(
        organization_id=tenant.organization_id,
        user_id=tenant.user_id,
        action="document.create",
        entity_type="document",
        entity_id=document.id,
        metadata={
            "case_id": str(document.case_id),
            "source": "api",
            "mode": "metadata_only",
        },
        ip_address=request_ip(request),
        user_agent=request.headers.get("user-agent"),
    )

    return success_response(serialize_document(document), "Documento criado com sucesso.")


@router.get("/{document_id}")
def get_document(
    document_id: UUID,
    request: Request,
    service: Annotated[DocumentService, Depends(get_document_service)],
    audit_log: Annotated[AuditLogService, Depends(get_audit_log_service)],
    tenant: Annotated[TenantContext, Depends(require_permission("documents:read"))],
) -> dict[str, object]:
    document = service.get_document(
        organization_id=tenant.organization_id,
        document_id=document_id,
    )
    audit_log.record_event(
        organization_id=tenant.organization_id,
        user_id=tenant.user_id,
        action="document.read",
        entity_type="document",
        entity_id=document.id,
        metadata={"case_id": str(document.case_id), "source": "api"},
        ip_address=request_ip(request),
        user_agent=request.headers.get("user-agent"),
    )

    return success_response(serialize_document(document))


@router.patch("/{document_id}")
def update_document(
    document_id: UUID,
    payload: DocumentUpdate,
    request: Request,
    service: Annotated[DocumentService, Depends(get_document_service)],
    audit_log: Annotated[AuditLogService, Depends(get_audit_log_service)],
    tenant: Annotated[TenantContext, Depends(require_permission("documents:write"))],
) -> dict[str, object]:
    document = service.update_document(
        organization_id=tenant.organization_id,
        document_id=document_id,
        payload=payload,
    )
    audit_log.record_event(
        organization_id=tenant.organization_id,
        user_id=tenant.user_id,
        action="document.update",
        entity_type="document",
        entity_id=document.id,
        metadata={
            "case_id": str(document.case_id),
            "updated_fields": list(payload.model_dump(exclude_unset=True)),
        },
        ip_address=request_ip(request),
        user_agent=request.headers.get("user-agent"),
    )

    return success_response(
        serialize_document(document),
        "Documento atualizado com sucesso.",
    )
