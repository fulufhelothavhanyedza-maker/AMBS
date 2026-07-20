from fastapi import FastAPI

from .api.router import api_router
from .core.settings import get_settings


def create_app() -> FastAPI:
    settings = get_settings()
    fastapi_app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        docs_url="/docs",
        redoc_url="/redoc",
    )
    fastapi_app.include_router(api_router)
    return fastapi_app


app = create_app()
