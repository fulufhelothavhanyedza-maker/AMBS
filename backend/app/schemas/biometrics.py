from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class BiometricModality(str, Enum):
    face = "face"
    gait = "gait"
    fingerprint = "fingerprint"
    voice = "voice"
    iris = "iris"


class FusionStrategy(str, Enum):
    score_level = "score_level"
    feature_level = "feature_level"
    decision_level = "decision_level"


class FusionPolicy(str, Enum):
    score_level = "score_level"
    feature_level = "feature_level"
    decision_level = "decision_level"


class QualityContext(BaseModel):
    lighting: float = Field(default=0.8, ge=0.0, le=1.0)
    occlusion: float = Field(default=0.0, ge=0.0, le=1.0)
    motion_blur: float = Field(default=0.0, ge=0.0, le=1.0)
    noise: float = Field(default=0.0, ge=0.0, le=1.0)
    risk_level: float = Field(default=0.0, ge=0.0, le=1.0)


class BiometricSample(BaseModel):
    modality: BiometricModality
    embedding: list[float] = Field(min_length=1)
    quality_context: QualityContext = Field(default_factory=QualityContext)


class QualityAssessmentRequest(BaseModel):
    sample: BiometricSample


class QualityAssessmentResponse(BaseModel):
    modality: BiometricModality
    quality_score: float
    factors: dict[str, float]
    recommendation: str


class FusionRequest(BaseModel):
    subject_id: str | None = None
    samples: list[BiometricSample] = Field(min_length=1)
    strategy: FusionStrategy = FusionStrategy.score_level
    base_threshold: float = Field(default=0.75, ge=0.0, le=1.0)
    adaptation_window: int = Field(default=3, ge=1, le=10)
    policy: FusionPolicy = FusionPolicy.score_level
    risk_score: float = Field(default=0.0, ge=0.0, le=1.0)
    environment_quality: float = Field(default=1.0, ge=0.0, le=1.0)
    modality_weights: dict[str, float] = Field(default_factory=dict)


class FusionEvidence(BaseModel):
    modality: BiometricModality
    quality_score: float
    normalized_score: float
    weight: float


class FusionResponse(BaseModel):
    subject_id: str | None
    strategy: FusionStrategy
    fused_score: float
    adjusted_threshold: float
    decision: str
    evidence: list[FusionEvidence]
    factors: dict[str, Any]


class EvaluationResponse(BaseModel):
    quality: list[QualityAssessmentResponse]
    fusion: FusionResponse


class MatchEvidence(BaseModel):
    modality: BiometricModality
    probe_quality: float
    reference_quality: float
    similarity: float
    weight: float


class VerificationRequest(BaseModel):
    subject_id: str | None = None
    probe_samples: list[BiometricSample] = Field(min_length=1)
    reference_samples: list[BiometricSample] = Field(min_length=1)
    policy: FusionPolicy = FusionPolicy.score_level
    base_threshold: float = Field(default=0.75, ge=0.0, le=1.0)
    adaptation_window: int = Field(default=3, ge=1, le=10)
    risk_score: float = Field(default=0.0, ge=0.0, le=1.0)
    environment_quality: float = Field(default=1.0, ge=0.0, le=1.0)
    modality_weights: dict[str, float] = Field(default_factory=dict)


class VerificationResponse(BaseModel):
    subject_id: str | None
    policy: FusionPolicy
    fused_score: float
    adjusted_threshold: float
    decision: str
    evidence: list[MatchEvidence]
    factors: dict[str, Any]


class IdentificationCandidate(BaseModel):
    subject_id: str
    reference_samples: list[BiometricSample] = Field(min_length=1)


class IdentificationRequest(BaseModel):
    probe_samples: list[BiometricSample] = Field(min_length=1)
    candidates: list[IdentificationCandidate] = Field(min_length=1)
    policy: FusionPolicy = FusionPolicy.score_level
    top_k: int = Field(default=3, ge=1, le=10)
    base_threshold: float = Field(default=0.75, ge=0.0, le=1.0)
    adaptation_window: int = Field(default=3, ge=1, le=10)
    risk_score: float = Field(default=0.0, ge=0.0, le=1.0)
    environment_quality: float = Field(default=1.0, ge=0.0, le=1.0)
    modality_weights: dict[str, float] = Field(default_factory=dict)


class IdentificationMatch(BaseModel):
    subject_id: str
    score: float
    adjusted_threshold: float
    decision: str
    evidence: list[MatchEvidence]
    rank: int


class IdentificationResponse(BaseModel):
    matches: list[IdentificationMatch]
    top_match: IdentificationMatch | None
