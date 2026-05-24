from fastapi import FastAPI
from fastapi.responses import JSONResponse

from src.core.config import get_settings
from src.core.logging import configure_logging
from src.modules.cases.router import router as cases_router
from src.modules.clients.router import router as clients_router
from src.modules.common.exceptions import ResourceNotFoundError
from src.modules.common.responses import error_response
from src.modules.health.router import router as health_router


def create_app() -> FastAPI:
    settings = get_settings()
    configure_logging(settings.log_level)

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        docs_url="/docs" if settings.enable_docs else None,
        redoc_url="/redoc" if settings.enable_docs else None,
        openapi_url="/openapi.json" if settings.enable_docs else None,
    )

    @app.exception_handler(ResourceNotFoundError)
    async def resource_not_found_handler(_, exc: ResourceNotFoundError) -> JSONResponse:
        return JSONResponse(
            status_code=404,
            content=error_response(code=exc.code, message=str(exc)),
        )

    app.include_router(health_router)
    app.include_router(clients_router)
    app.include_router(cases_router)
    return app


app = create_app()
