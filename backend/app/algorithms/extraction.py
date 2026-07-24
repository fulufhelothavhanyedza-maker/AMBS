from __future__ import annotations

import importlib
import os
from math import sqrt
from typing import Callable

from backend.app.algorithms.quality import clamp
from backend.app.schemas.biometrics import (
    BiometricModality,
    CaptureSample,
    ExtractionResponse,
    ExtractedBiometricSample,
)

ExtractionFunction = Callable[[CaptureSample], list[float]]


def _safe_mean(values: list[float]) -> float:
    return sum(values) / len(values) if values else 0.0


def _safe_variance(values: list[float], mean_value: float) -> float:
    return sum((value - mean_value) ** 2 for value in values) / len(values) if values else 0.0


def _normalized_signal(values: list[float]) -> list[float]:
    peak = max((abs(value) for value in values), default=1.0)
    if peak == 0:
        peak = 1.0
    return [value / peak for value in values]


def _face_embedding(sample: CaptureSample) -> tuple[list[float], dict[str, float]]:
    signal = _normalized_signal(sample.raw_signal)
    mean_value = _safe_mean(signal)
    variance = _safe_variance(signal, mean_value)
    spread = max(signal) - min(signal)
    drift = signal[-1] - signal[0]
    energy = _safe_mean([value * value for value in signal])
    frame_density = clamp(sample.frame_count / 30.0)
    stability = 1.0 - clamp(sqrt(variance))

    embedding = [
        clamp((mean_value + 1.0) / 2.0),
        clamp(spread / 2.0),
        clamp(energy),
        clamp((drift + 1.0) / 2.0),
        clamp(sample.sensor_confidence),
        frame_density,
        clamp(sample.quality_context.lighting),
        clamp(1.0 - sample.quality_context.occlusion),
    ]
    diagnostics = {
        "mean_signal": round(mean_value, 4),
        "variance": round(variance, 4),
        "spread": round(spread, 4),
        "frame_density": round(frame_density, 4),
        "stability": round(stability, 4),
    }
    return embedding, diagnostics


def _gait_embedding(sample: CaptureSample) -> tuple[list[float], dict[str, float]]:
    signal = _normalized_signal(sample.raw_signal)
    deltas = [abs(right - left) for left, right in zip(signal, signal[1:])]
    mean_value = _safe_mean(signal)
    delta_mean = _safe_mean(deltas)
    variance = _safe_variance(signal, mean_value)
    energy = _safe_mean([value * value for value in signal])
    cadence = clamp(
        (sample.frame_count / max(sample.capture_duration, 0.1)) / 30.0)
    motion_consistency = 1.0 - clamp(_safe_variance(deltas, delta_mean) * 4.0)

    embedding = [
        clamp((mean_value + 1.0) / 2.0),
        clamp(delta_mean),
        clamp(energy),
        cadence,
        clamp(sample.sensor_confidence),
        clamp(1.0 - sample.quality_context.motion_blur),
        clamp(1.0 - sample.quality_context.noise),
        clamp(motion_consistency),
    ]
    diagnostics = {
        "mean_signal": round(mean_value, 4),
        "delta_mean": round(delta_mean, 4),
        "variance": round(variance, 4),
        "cadence": round(cadence, 4),
        "motion_consistency": round(motion_consistency, 4),
    }
    return embedding, diagnostics


class HeuristicExtractor:
    provider_name = "heuristic"

    def extract(self, sample: CaptureSample) -> tuple[list[float], dict[str, float]]:
        if sample.modality == BiometricModality.face:
            return _face_embedding(sample)
        if sample.modality == BiometricModality.gait:
            return _gait_embedding(sample)
        raise ValueError(
            f"Heuristic extraction is not implemented for modality '{sample.modality.value}'."
        )


class ModelBackedExtractor:
    provider_name = "model"

    def __init__(self) -> None:
        self._extractors: dict[BiometricModality, ExtractionFunction] = {}
        self._extractors[BiometricModality.face] = self._load_extractor(
            BiometricModality.face,
            "AMBS_FACE_EXTRACTOR",
        )
        self._extractors[BiometricModality.gait] = self._load_extractor(
            BiometricModality.gait,
            "AMBS_GAIT_EXTRACTOR",
        )

    def _load_extractor(self, modality: BiometricModality, variable: str) -> ExtractionFunction:
        target = os.getenv(variable, "").strip()
        if not target:
            raise RuntimeError(
                f"Environment variable {variable} must point to a callable in '<module>:<function>' format."
            )

        if ":" not in target:
            raise RuntimeError(
                f"Environment variable {variable} has invalid value '{target}'. Use '<module>:<function>'."
            )

        module_name, function_name = target.split(":", 1)
        module = importlib.import_module(module_name)
        function = getattr(module, function_name, None)

        if function is None or not callable(function):
            raise RuntimeError(
                f"Extractor target '{target}' for modality '{modality.value}' is not callable."
            )

        return function

    def extract(self, sample: CaptureSample) -> tuple[list[float], dict[str, float]]:
        extractor = self._extractors.get(sample.modality)
        if extractor is None:
            raise ValueError(
                f"Model-backed extraction is not implemented for modality '{sample.modality.value}'."
            )

        embedding = extractor(sample)
        if not isinstance(embedding, list) or not embedding:
            raise RuntimeError(
                f"Model extractor for modality '{sample.modality.value}' returned an invalid embedding."
            )

        vector = [float(value) for value in embedding]
        diagnostics = {
            "provider": self.provider_name,
            "embedding_dimension": len(vector),
            "source": "configured_extractor",
        }
        return vector, diagnostics


def _build_extractor() -> HeuristicExtractor | ModelBackedExtractor:
    provider = os.getenv("AMBS_EXTRACTION_PROVIDER",
                         "heuristic").strip().lower()
    if provider == "model":
        return ModelBackedExtractor()
    return HeuristicExtractor()


def extract_embeddings(samples: list[CaptureSample]) -> ExtractionResponse:
    extractor = _build_extractor()
    allow_fallback = os.getenv(
        "AMBS_ALLOW_EXTRACTION_FALLBACK", "true").strip().lower() != "false"
    extracted_samples: list[ExtractedBiometricSample] = []

    for sample in samples:
        try:
            embedding, diagnostics = extractor.extract(sample)
            extraction_status = "ok"
            fallback_reason = None
        except (RuntimeError, ValueError, TypeError, ImportError) as error:
            if not allow_fallback or sample.modality not in {BiometricModality.face, BiometricModality.gait}:
                raise

            heuristic = HeuristicExtractor()
            embedding, diagnostics = heuristic.extract(sample)
            extraction_status = "fallback"
            fallback_reason = str(error)

        extracted_samples.append(
            ExtractedBiometricSample(
                modality=sample.modality,
                embedding=[round(value, 6) for value in embedding],
                quality_context=sample.quality_context,
                diagnostics={
                    **diagnostics,
                    "provider": getattr(extractor, "provider_name", "unknown"),
                    "status": extraction_status,
                    "fallback_reason": fallback_reason,
                    "frame_count": sample.frame_count,
                    "capture_duration": round(sample.capture_duration, 4),
                    "sensor_confidence": round(sample.sensor_confidence, 4),
                },
            )
        )

    return ExtractionResponse(samples=extracted_samples)
