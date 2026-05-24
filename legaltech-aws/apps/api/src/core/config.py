from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    app_env: str = Field(default="local", alias="APP_ENV")
    app_name: str = Field(default="legaltech-api", alias="APP_NAME")
    app_version: str = Field(default="0.1.0", alias="APP_VERSION")
    enable_docs: bool = Field(default=True, alias="ENABLE_DOCS")
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")

    database_url: str = Field(
        default="postgresql+psycopg://legaltech:legaltech@localhost:5432/legaltech",
        alias="DATABASE_URL",
    )

    aws_region: str = Field(default="sa-east-1", alias="AWS_REGION")
    cognito_user_pool_id: str | None = Field(default=None, alias="COGNITO_USER_POOL_ID")
    cognito_client_id: str | None = Field(default=None, alias="COGNITO_CLIENT_ID")
    cognito_organization_claim: str = Field(
        default="custom:organization_id",
        alias="COGNITO_ORGANIZATION_CLAIM",
    )
    cognito_role_claim: str = Field(
        default="custom:role",
        alias="COGNITO_ROLE_CLAIM",
    )
    cognito_token_use: Literal["id", "access"] = Field(
        default="id",
        alias="COGNITO_TOKEN_USE",
    )
    dev_jwt_enabled: bool = Field(default=False, alias="DEV_JWT_ENABLED")
    dev_jwt_secret: str | None = Field(default=None, alias="DEV_JWT_SECRET")
    dev_jwt_issuer: str = Field(
        default="legaltech-local-dev",
        alias="DEV_JWT_ISSUER",
    )
    dev_jwt_audience: str = Field(
        default="legaltech-local-api",
        alias="DEV_JWT_AUDIENCE",
    )

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        if value.startswith("postgresql://"):
            return value.replace("postgresql://", "postgresql+psycopg://", 1)

        return value

    @property
    def cognito_issuer(self) -> str | None:
        if not self.cognito_user_pool_id:
            return None

        return (
            f"https://cognito-idp.{self.aws_region}.amazonaws.com/"
            f"{self.cognito_user_pool_id}"
        )

    @property
    def cognito_jwks_url(self) -> str | None:
        if not self.cognito_issuer:
            return None

        return f"{self.cognito_issuer}/.well-known/jwks.json"


@lru_cache
def get_settings() -> Settings:
    return Settings()
