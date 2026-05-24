from collections.abc import Callable
from typing import Annotated

from fastapi import Depends, HTTPException, status

from src.core.tenant import TenantContext, get_tenant_context
from src.modules.roles.service import RolePermissionService, get_role_permission_service


def get_permission_service(
    service: Annotated[RolePermissionService, Depends(get_role_permission_service)],
) -> RolePermissionService:
    return service


def require_permission(permission: str) -> Callable:
    async def dependency(
        tenant: Annotated[TenantContext, Depends(get_tenant_context)],
        permission_service: Annotated[
            RolePermissionService,
            Depends(get_permission_service),
        ],
    ) -> TenantContext:
        has_permission = permission_service.has_permission(
            organization_id=tenant.organization_id,
            role=tenant.role,
            permission=permission,
        )
        if not has_permission:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission required: {permission}.",
            )

        return tenant

    return dependency
