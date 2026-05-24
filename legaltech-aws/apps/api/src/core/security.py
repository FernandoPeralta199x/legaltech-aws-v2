from dataclasses import dataclass
from functools import lru_cache
from typing import Any
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from src.core.config import Settings, get_settings


bearer_scheme = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class AuthenticatedUser:
    user_id: str
    email: str
    organization_id: str
    role: str
    claims: dict[str, Any] | None = None


class CognitoJWTVerifier:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def verify(self, token: str) -> AuthenticatedUser:
        claims = self._decode_claims(token)
        self._validate_claims(claims)

        organization_id = claims.get(self.settings.cognito_organization_claim)
        role = self._resolve_role(claims)
        user_id = claims.get("sub")

        if not user_id or not organization_id or not role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="JWT claims do not include user, tenant and role.",
            )

        return AuthenticatedUser(
            user_id=str(user_id),
            email=str(claims.get("email", "")),
            organization_id=str(organization_id),
            role=str(role),
            claims=claims,
        )

    def _decode_claims(self, token: str) -> dict[str, Any]:
        if not self.settings.cognito_jwks_url or not self.settings.cognito_issuer:
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="Cognito settings are not configured.",
            )

        try:
            import jwt
        except ImportError as exc:
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="PyJWT is required for Cognito/JWT validation.",
            ) from exc

        try:
            jwks_client = jwt.PyJWKClient(self.settings.cognito_jwks_url)
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            return jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                issuer=self.settings.cognito_issuer,
                options={"verify_aud": False},
            )
        except jwt.PyJWTError as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid JWT.",
            ) from exc

    def _validate_claims(self, claims: dict[str, Any]) -> None:
        token_use = claims.get("token_use")
        if token_use != self.settings.cognito_token_use:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Cognito token use.",
            )

        if self.settings.cognito_client_id:
            audience = claims.get("aud")
            client_id = claims.get("client_id")
            if self.settings.cognito_client_id not in {audience, client_id}:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid Cognito client id.",
                )

    def _resolve_role(self, claims: dict[str, Any]) -> str | None:
        role = claims.get(self.settings.cognito_role_claim)
        if role:
            return str(role)

        groups = claims.get("cognito:groups")
        if isinstance(groups, list) and groups:
            return str(groups[0])

        return None


class LocalDevJWTVerifier:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def verify(self, token: str) -> AuthenticatedUser:
        claims = self._decode_claims(token)

        organization_id = claims.get(self.settings.cognito_organization_claim)
        role = claims.get(self.settings.cognito_role_claim)
        user_id = claims.get("sub")

        if claims.get("token_use") != "dev":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid local development token use.",
            )

        if not user_id or not organization_id or not role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="JWT claims do not include user, tenant and role.",
            )

        return AuthenticatedUser(
            user_id=str(user_id),
            email=str(claims.get("email", "")),
            organization_id=str(organization_id),
            role=str(role),
            claims=claims,
        )

    def _decode_claims(self, token: str) -> dict[str, Any]:
        if self.settings.app_env != "local" or not self.settings.dev_jwt_enabled:
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="Local development JWT validation is disabled.",
            )

        if not self.settings.dev_jwt_secret:
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="DEV_JWT_SECRET is required for local JWT validation.",
            )

        try:
            import jwt
        except ImportError as exc:
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="PyJWT is required for local JWT validation.",
            ) from exc

        try:
            return jwt.decode(
                token,
                self.settings.dev_jwt_secret,
                algorithms=["HS256"],
                issuer=self.settings.dev_jwt_issuer,
                audience=self.settings.dev_jwt_audience,
            )
        except jwt.PyJWTError as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid local development JWT.",
            ) from exc


@lru_cache
def get_cached_jwt_verifier() -> CognitoJWTVerifier | LocalDevJWTVerifier:
    settings = get_settings()
    if settings.dev_jwt_enabled:
        return LocalDevJWTVerifier(settings)

    return CognitoJWTVerifier(settings)


def get_jwt_verifier() -> CognitoJWTVerifier | LocalDevJWTVerifier:
    return get_cached_jwt_verifier()


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    verifier: Annotated[
        CognitoJWTVerifier | LocalDevJWTVerifier,
        Depends(get_jwt_verifier),
    ],
) -> AuthenticatedUser:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication is required.",
        )

    return verifier.verify(credentials.credentials)
