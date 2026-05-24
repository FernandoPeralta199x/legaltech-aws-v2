from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.orm import Session

from src.core.rbac import require_permission
from src.core.tenant import TenantContext
from src.db.session import get_db
from src.modules.audit import actions
from src.modules.audit.service import AuditLogService, get_audit_log_service
from src.modules.cases.schemas import CaseCreate, CaseRead, CaseUpdate
from src.modules.cases.service import CaseService
from src.modules.common.responses import success_response


router = APIRouter(prefix="/api/v1/cases", tags=["cases"])


def get_case_service(db: Annotated[Session, Depends(get_db)]) -> CaseService:
    return CaseService(db=db)


def serialize_case(case) -> dict:
    return CaseRead.model_validate(case).model_dump(mode="json")


def request_ip(request: Request) -> str | None:
    return request.client.host if request.client else None


@router.get("")
def list_cases(
    request: Request,
    service: Annotated[CaseService, Depends(get_case_service)],
    audit_log: Annotated[AuditLogService, Depends(get_audit_log_service)],
    tenant: Annotated[TenantContext, Depends(require_permission("cases:read"))],
    status: str | None = None,
    case_type: str | None = None,
    client_id: UUID | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> dict[str, object]:
    cases = service.list_cases(
        organization_id=tenant.organization_id,
        status=status,
        case_type=case_type,
        client_id=client_id,
        page=page,
        page_size=page_size,
    )
    audit_log.record_event(
        organization_id=tenant.organization_id,
        user_id=tenant.user_id,
        action=actions.CASES_LIST,
        entity_type="case",
        metadata={
            "status": status,
            "case_type": case_type,
            "client_id": str(client_id) if client_id else None,
            "page": page,
            "page_size": page_size,
        },
        ip_address=request_ip(request),
        user_agent=request.headers.get("user-agent"),
    )

    return success_response([serialize_case(case) for case in cases])


@router.post("", status_code=status.HTTP_201_CREATED)
def create_case(
    payload: CaseCreate,
    request: Request,
    service: Annotated[CaseService, Depends(get_case_service)],
    audit_log: Annotated[AuditLogService, Depends(get_audit_log_service)],
    tenant: Annotated[TenantContext, Depends(require_permission("cases:write"))],
) -> dict[str, object]:
    case = service.create_case(
        organization_id=tenant.organization_id,
        user_id=tenant.user_id,
        payload=payload,
    )
    audit_log.record_event(
        organization_id=tenant.organization_id,
        user_id=tenant.user_id,
        action=actions.CASES_CREATE,
        entity_type="case",
        entity_id=case.id,
        metadata={"source": "api"},
        ip_address=request_ip(request),
        user_agent=request.headers.get("user-agent"),
    )

    return success_response(serialize_case(case), "Caso criado com sucesso.")


@router.get("/{case_id}")
def get_case(
    case_id: UUID,
    request: Request,
    service: Annotated[CaseService, Depends(get_case_service)],
    audit_log: Annotated[AuditLogService, Depends(get_audit_log_service)],
    tenant: Annotated[TenantContext, Depends(require_permission("cases:read"))],
) -> dict[str, object]:
    case = service.get_case(
        organization_id=tenant.organization_id,
        case_id=case_id,
    )
    audit_log.record_event(
        organization_id=tenant.organization_id,
        user_id=tenant.user_id,
        action=actions.CASES_READ,
        entity_type="case",
        entity_id=case.id,
        metadata={"source": "api"},
        ip_address=request_ip(request),
        user_agent=request.headers.get("user-agent"),
    )

    return success_response(serialize_case(case))


@router.patch("/{case_id}")
def update_case(
    case_id: UUID,
    payload: CaseUpdate,
    request: Request,
    service: Annotated[CaseService, Depends(get_case_service)],
    audit_log: Annotated[AuditLogService, Depends(get_audit_log_service)],
    tenant: Annotated[TenantContext, Depends(require_permission("cases:write"))],
) -> dict[str, object]:
    case = service.update_case(
        organization_id=tenant.organization_id,
        case_id=case_id,
        payload=payload,
    )
    audit_log.record_event(
        organization_id=tenant.organization_id,
        user_id=tenant.user_id,
        action=actions.CASES_UPDATE,
        entity_type="case",
        entity_id=case.id,
        metadata={"updated_fields": list(payload.model_dump(exclude_unset=True))},
        ip_address=request_ip(request),
        user_agent=request.headers.get("user-agent"),
    )

    return success_response(serialize_case(case), "Caso atualizado com sucesso.")
