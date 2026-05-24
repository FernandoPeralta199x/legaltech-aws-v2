from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from src.core.tenant import TenantContext, get_dev_tenant_context
from src.db.session import get_db
from src.modules.clients.schemas import ClientCreate, ClientRead, ClientUpdate
from src.modules.clients.service import ClientService
from src.modules.common.responses import success_response


router = APIRouter(prefix="/api/v1/clients", tags=["clients"])


def get_client_service(db: Annotated[Session, Depends(get_db)]) -> ClientService:
    return ClientService(db=db)


def serialize_client(client) -> dict:
    return ClientRead.model_validate(client).model_dump(mode="json")


@router.get("")
def list_clients(
    service: Annotated[ClientService, Depends(get_client_service)],
    tenant: Annotated[TenantContext, Depends(get_dev_tenant_context)],
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

    return success_response([serialize_client(client) for client in clients])


@router.post("", status_code=status.HTTP_201_CREATED)
def create_client(
    payload: ClientCreate,
    service: Annotated[ClientService, Depends(get_client_service)],
    tenant: Annotated[TenantContext, Depends(get_dev_tenant_context)],
) -> dict[str, object]:
    client = service.create_client(
        organization_id=tenant.organization_id,
        user_id=tenant.user_id,
        payload=payload,
    )

    return success_response(serialize_client(client), "Cliente criado com sucesso.")


@router.get("/{client_id}")
def get_client(
    client_id: UUID,
    service: Annotated[ClientService, Depends(get_client_service)],
    tenant: Annotated[TenantContext, Depends(get_dev_tenant_context)],
) -> dict[str, object]:
    client = service.get_client(
        organization_id=tenant.organization_id,
        client_id=client_id,
    )

    return success_response(serialize_client(client))


@router.patch("/{client_id}")
def update_client(
    client_id: UUID,
    payload: ClientUpdate,
    service: Annotated[ClientService, Depends(get_client_service)],
    tenant: Annotated[TenantContext, Depends(get_dev_tenant_context)],
) -> dict[str, object]:
    client = service.update_client(
        organization_id=tenant.organization_id,
        client_id=client_id,
        payload=payload,
    )

    return success_response(serialize_client(client), "Cliente atualizado com sucesso.")

