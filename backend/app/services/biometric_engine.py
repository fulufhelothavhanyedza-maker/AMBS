from __future__ import annotations

from backend.app.algorithms.extraction import extract_embeddings
from backend.app.algorithms.policy import describe_policy
from backend.app.algorithms.fusion import (
    evaluate_biometrics,
    fuse_request,
    identify_request,
    verify_request,
)
from backend.app.algorithms.quality import assess_quality
from backend.app.schemas.biometrics import BiometricSample, ExtractionRequest, FusionRequest, IdentificationRequest, VerificationRequest


class BiometricEngine:
    def extract(self, request: ExtractionRequest):
        return extract_embeddings(request.samples)

    def assess_quality(self, sample: BiometricSample):
        return assess_quality(sample)

    def fuse(self, request: FusionRequest):
        return fuse_request(request)

    def evaluate(self, request: FusionRequest):
        return evaluate_biometrics(request)

    def verify(self, request: VerificationRequest):
        return verify_request(request)

    def identify(self, request: IdentificationRequest):
        return identify_request(request)

    def policy_summary(self, policy: str = "score_level"):
        return describe_policy(policy)


engine = BiometricEngine()
