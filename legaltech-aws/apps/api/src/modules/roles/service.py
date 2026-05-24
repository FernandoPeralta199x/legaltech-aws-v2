from typing import Annotated, Protocol
from uuid import UUID

from fastapi import Depends
from sqlalchemy.orm import Session

from src.db.session import get_db
from src.modules.roles.repository import RolePermissionRepository


class RolePermissionRepositoryProtocol(Protocol):
    def has_permission(
        self,
        *,
        organization_id: UUID | str,
        role: str,
        permission: str,
    ) -> bool: ...


class RolePermissionService:
    def __init__(
        self,
        db: Session | None = None,
        repository: RolePermissionRepositoryProtocol | None = None,
    ) -> None:
        if repository is None:
            if db is None:
                raise ValueError("db is required when repository is not provided.")
            repository = RolePermissionRepository(db)

        self.repository = repository

    def has_permission(
        self,
        *,
        organization_id: UUID | str,
        role: str,
        permission: str,
    ) -> bool:
        return self.repository.has_permission(
            organization_id=organization_id,
            role=role,
            permission=permission,
        )


def get_role_permission_service(
    db: Annotated[Session, Depends(get_db)],
) -> RolePermissionService:
    return RolePermissionService(db=db)
