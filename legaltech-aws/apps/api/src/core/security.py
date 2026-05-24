from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer


bearer_scheme = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class AuthenticatedUser:
    user_id: str
    email: str
    organization_id: str
    role: str


async def get_mock_current_user(request: Request) -> AuthenticatedUser:
    user_id = request.headers.get("X-Dev-User-Id")
    organization_id = request.headers.get("X-Dev-Organization-Id")

    if not user_id or not organization_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Mock authentication headers are required.",
        )

    return AuthenticatedUser(
        user_id=user_id,
        email=request.headers.get("X-Dev-Email", "dev@example.com"),
        organization_id=organization_id,
        role=request.headers.get("X-Dev-Role", "client"),
    )


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> AuthenticatedUser:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication is required.",
        )

    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Cognito/JWT authentication is not implemented yet.",
    )
