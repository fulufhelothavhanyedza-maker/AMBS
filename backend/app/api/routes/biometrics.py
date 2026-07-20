from fastapi import APIRouter

from backend.app.schemas.biometrics import (
    BiometricSample,
    FusionRequest,
    IdentificationRequest,
    VerificationRequest,
)
from backend.app.services.biometric_engine import engine

router = APIRouter()


@router.post("/quality")
def assess_quality(sample: BiometricSample):
    return engine.assess_quality(sample)


@router.post("/fuse")
def fuse_biometrics(request: FusionRequest):
    return engine.fuse(request)


@router.post("/evaluate")
def evaluate_biometrics(request: FusionRequest):
    return engine.evaluate(request)


@router.get("/policies/default")
def default_policy():
    return engine.policy_summary("score_level")


@router.post("/verify")
def verify_identity(request: VerificationRequest):
    return engine.verify(request)


@router.post("/identify")
def identify_identity(request: IdentificationRequest):
    return engine.identify(request)
