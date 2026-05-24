from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from src.core.tenant import TenantContext, get_dev_tenant_context
from src.db.session import get_db
from src.modules.cases.schemas import CaseCreate, CaseRead, CaseUpdate
from src.modules.cases.service import CaseService
from src.modules.common.responses import success_response


router = APIRouter(prefix="/api/v1/cases", tags=["cases"])


def get_case_service(db: Annotated[Session, Depends(get_db)]) -> CaseService:
    return CaseService(db=db)


def serialize_case(case) -> dict:
    return CaseRead.model_validate(case).model_dump(mode="json")


@router.get("")
def list_cases(
    service: Annotated[CaseService, Depends(get_case_service)],
    tenant: Annotated[TenantContext, Depends(get_dev_tenant_context)],
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

    return success_response([serialize_case(case) for case in cases])


@router.post("", status_code=status.HTTP_201_CREATED)
def create_case(
    payload: CaseCreate,
    service: Annotated[CaseService, Depends(get_case_service)],
    tenant: Annotated[TenantContext, Depends(get_dev_tenant_context)],
) -> dict[str, object]:
    case = service.create_case(
        organization_id=tenant.organization_id,
        user_id=tenant.user_id,
        payload=payload,
    )

    return success_response(serialize_case(case), "Caso criado com sucesso.")


@router.get("/{case_id}")
def get_case(
    case_id: UUID,
    service: Annotated[CaseService, Depends(get_case_service)],
    tenant: Annotated[TenantContext, Depends(get_dev_tenant_context)],
) -> dict[str, object]:
    case = service.get_case(
        organization_id=tenant.organization_id,
        case_id=case_id,
    )

    return success_response(serialize_case(case))


@router.patch("/{case_id}")
def update_case(
    case_id: UUID,
    payload: CaseUpdate,
    service: Annotated[CaseService, Depends(get_case_service)],
    tenant: Annotated[TenantContext, Depends(get_dev_tenant_context)],
) -> dict[str, object]:
    case = service.update_case(
        organization_id=tenant.organization_id,
        case_id=case_id,
        payload=payload,
    )

    return success_response(serialize_case(case), "Caso atualizado com sucesso.")

