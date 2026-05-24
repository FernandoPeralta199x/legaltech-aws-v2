from typing import Annotated, Any
from uuid import UUID

from fastapi import Depends
from sqlalchemy.orm import Session

from src.db.session import get_db
from src.models.audit_log import AuditLog
from src.modules.common.identifiers import parse_uuid


class AuditLogService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def record_event(
        self,
        *,
        organization_id: UUID | str,
        user_id: UUID | str | None,
        action: str,
        entity_type: str,
        entity_id: UUID | str | None = None,
        metadata: dict[str, Any] | None = None,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> AuditLog:
        event = AuditLog(
            organization_id=parse_uuid(organization_id),
            user_id=parse_uuid(user_id) if user_id else None,
            action=action,
            entity_type=entity_type,
            entity_id=parse_uuid(entity_id) if entity_id else None,
            ip_address=ip_address,
            user_agent=user_agent,
            metadata_json=metadata or {},
        )
        self.db.add(event)
        self.db.flush()

        return event


def get_audit_log_service(
    db: Annotated[Session, Depends(get_db)],
) -> AuditLogService:
    return AuditLogService(db)

