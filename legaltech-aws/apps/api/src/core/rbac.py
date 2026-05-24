from collections.abc import Callable
from typing import Annotated

from fastapi import Depends, HTTPException, status

from src.core.tenant import TenantContext, get_dev_tenant_context


ROLE_PERMISSIONS: dict[str, set[str]] = {
    "owner": {
        "clients:read",
        "clients:write",
        "cases:read",
        "cases:write",
    },
    "admin": {
        "clients:read",
        "clients:write",
        "cases:read",
        "cases:write",
    },
    "analyst": {
        "clients:read",
        "cases:read",
        "cases:write",
    },
    "client": {
        "clients:read",
        "cases:read",
        "cases:write",
    },
    "support": {
        "clients:read",
        "cases:read",
    },
}


def role_has_permission(role: str, permission: str) -> bool:
    return permission in ROLE_PERMISSIONS.get(role, set())


def require_permission(permission: str) -> Callable:
    async def dependency(
        tenant: Annotated[TenantContext, Depends(get_dev_tenant_context)],
    ) -> TenantContext:
        if not role_has_permission(tenant.role, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission required: {permission}.",
            )

        return tenant

    return dependency

