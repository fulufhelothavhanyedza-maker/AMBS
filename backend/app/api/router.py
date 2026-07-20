from fastapi import APIRouter

from .routes import biometrics, health

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(
    biometrics.router, prefix="/biometrics", tags=["biometrics"])
