from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.orm import Session

from src.core.rbac import require_permission
from src.core.tenant import TenantContext
from src.db.session import get_db
from src.modules.audit import actions
from src.modules.audit.service import AuditLogService, get_audit_log_service
from src.modules.clients.schemas import ClientCreate, ClientRead, ClientUpdate
from src.modules.clients.service import ClientService
from src.modules.common.responses import success_response


router = APIRouter(prefix="/api/v1/clients", tags=["clients"])


def get_client_service(db: Annotated[Session, Depends(get_db)]) -> ClientService:
    return ClientService(db=db)


def serialize_client(client) -> dict:
    return ClientRead.model_validate(client).model_dump(mode="json")


def request_ip(request: Request) -> str | None:
    return request.client.host if request.client else None


@router.get("")
def list_clients(
    request: Request,
    service: Annotated[ClientService, Depends(get_client_service)],
    audit_log: Annotated[AuditLogService, Depends(get_audit_log_service)],
    tenant: Annotated[TenantContext, Depends(require_permission("clients:read"))],
    search: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> dict[str, object]:
    clients = service.list_clients(
        organization_id=tenant.organization_id,
        search=search,
        page=page,
        page_size=page_size,
    )
    audit_log.record_event(
        organization_id=tenant.organization_id,
        user_id=tenant.user_id,
        action=actions.CLIENTS_LIST,
        entity_type="client",
        metadata={
            "has_search": bool(search),
            "page": page,
            "page_size": page_size,
        },
        ip_address=request_ip(request),
        user_agent=request.headers.get("user-agent"),
    )

    return success_response([serialize_client(client) for client in clients])


@router.post("", status_code=status.HTTP_201_CREATED)
def create_client(
    payload: ClientCreate,
    request: Request,
    service: Annotated[ClientService, Depends(get_client_service)],
    audit_log: Annotated[AuditLogService, Depends(get_audit_log_service)],
    tenant: Annotated[TenantContext, Depends(require_permission("clients:write"))],
) -> dict[str, object]:
    client = service.create_client(
        organization_id=tenant.organization_id,
        user_id=tenant.user_id,
        payload=payload,
    )
    audit_log.record_event(
        organization_id=tenant.organization_id,
        user_id=tenant.user_id,
        action=actions.CLIENTS_CREATE,
        entity_type="client",
        entity_id=client.id,
        metadata={"source": "api"},
        ip_address=request_ip(request),
        user_agent=request.headers.get("user-agent"),
    )

    return success_response(serialize_client(client), "Cliente criado com sucesso.")


@router.get("/{client_id}")
def get_client(
    client_id: UUID,
    request: Request,
    service: Annotated[ClientService, Depends(get_client_service)],
    audit_log: Annotated[AuditLogService, Depends(get_audit_log_service)],
    tenant: Annotated[TenantContext, Depends(require_permission("clients:read"))],
) -> dict[str, object]:
    client = service.get_client(
        organization_id=tenant.organization_id,
        client_id=client_id,
    )
    audit_log.record_event(
        organization_id=tenant.organization_id,
        user_id=tenant.user_id,
        action=actions.CLIENTS_READ,
        entity_type="client",
        entity_id=client.id,
        metadata={"source": "api"},
        ip_address=request_ip(request),
        user_agent=request.headers.get("user-agent"),
    )

    return success_response(serialize_client(client))


@router.patch("/{client_id}")
def update_client(
    client_id: UUID,
    payload: ClientUpdate,
    request: Request,
    service: Annotated[ClientService, Depends(get_client_service)],
    audit_log: Annotated[AuditLogService, Depends(get_audit_log_service)],
    tenant: Annotated[TenantContext, Depends(require_permission("clients:write"))],
) -> dict[str, object]:
    client = service.update_client(
        organization_id=tenant.organization_id,
        client_id=client_id,
        payload=payload,
    )
    audit_log.record_event(
        organization_id=tenant.organization_id,
        user_id=tenant.user_id,
        action=actions.CLIENTS_UPDATE,
        entity_type="client",
        entity_id=client.id,
        metadata={"updated_fields": list(payload.model_dump(exclude_unset=True))},
        ip_address=request_ip(request),
        user_agent=request.headers.get("user-agent"),
    )

    return success_response(serialize_client(client), "Cliente atualizado com sucesso.")
