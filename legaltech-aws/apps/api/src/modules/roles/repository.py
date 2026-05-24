from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from src.models.role_permission import RolePermission
from src.modules.common.identifiers import parse_uuid


class RolePermissionRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def has_permission(
        self,
        *,
        organization_id: UUID | str,
        role: str,
        permission: str,
    ) -> bool:
        statement = (
            select(RolePermission.id)
            .where(
                RolePermission.organization_id == parse_uuid(organization_id),
                RolePermission.role == role,
                RolePermission.permission == permission,
            )
            .limit(1)
        )

        return self.db.scalars(statement).first() is not None

