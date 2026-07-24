from __future__ import annotations

from enum import Enum
from math import isfinite
from typing import Any

from pydantic import BaseModel, Field, field_validator, model_validator


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
    liveness_confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    spoof_risk: float = Field(default=0.0, ge=0.0, le=1.0)


class BiometricSample(BaseModel):
    modality: BiometricModality
    embedding: list[float] = Field(min_length=1)
    quality_context: QualityContext = Field(default_factory=QualityContext)

    @field_validator("embedding")
    @classmethod
    def validate_embedding(cls, value: list[float]) -> list[float]:
        normalized: list[float] = []
        for entry in value:
            numeric = float(entry)
            if not isfinite(numeric):
                raise ValueError("Embedding values must be finite numbers.")
            normalized.append(numeric)
        return normalized


class CaptureSample(BaseModel):
    modality: BiometricModality
    raw_signal: list[float] = Field(min_length=4)
    frame_count: int = Field(default=12, ge=1, le=600)
    capture_duration: float = Field(default=1.0, gt=0.0, le=60.0)
    sensor_confidence: float = Field(default=0.9, ge=0.0, le=1.0)
    quality_context: QualityContext = Field(default_factory=QualityContext)

    @field_validator("raw_signal")
    @classmethod
    def validate_raw_signal(cls, value: list[float]) -> list[float]:
        normalized: list[float] = []
        for entry in value:
            numeric = float(entry)
            if not isfinite(numeric):
                raise ValueError("Raw signal values must be finite numbers.")
            normalized.append(numeric)
        return normalized


class ExtractionRequest(BaseModel):
    samples: list[CaptureSample] = Field(min_length=1)


class ExtractedBiometricSample(BaseModel):
    modality: BiometricModality
    embedding: list[float] = Field(min_length=1)
    quality_context: QualityContext
    diagnostics: dict[str, Any]


class ExtractionResponse(BaseModel):
    samples: list[ExtractedBiometricSample]


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

    @field_validator("modality_weights")
    @classmethod
    def validate_modality_weights(cls, value: dict[str, float]) -> dict[str, float]:
        allowed = {member.value for member in BiometricModality}
        normalized: dict[str, float] = {}
        for key, score in value.items():
            if key not in allowed:
                raise ValueError(
                    f"Unknown modality '{key}' in modality_weights.")
            numeric = float(score)
            if not isfinite(numeric) or numeric < 0.0 or numeric > 3.0:
                raise ValueError(
                    "modality_weights values must be finite numbers between 0.0 and 3.0.")
            normalized[key] = numeric
        return normalized


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

    @model_validator(mode="after")
    def validate_modal_overlap(self) -> "VerificationRequest":
        probe_modalities = {sample.modality for sample in self.probe_samples}
        reference_modalities = {
            sample.modality for sample in self.reference_samples}
        if probe_modalities.isdisjoint(reference_modalities):
            raise ValueError(
                "probe_samples and reference_samples must share at least one modality.")
        return self


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

    @model_validator(mode="after")
    def validate_top_k(self) -> "IdentificationRequest":
        if self.top_k > len(self.candidates):
            raise ValueError("top_k cannot exceed the number of candidates.")
        return self


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
