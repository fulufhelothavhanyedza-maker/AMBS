from __future__ import annotations

from backend.app.schemas.biometrics import BiometricModality, BiometricSample, QualityAssessmentResponse


def clamp(value: float, lower: float = 0.0, upper: float = 1.0) -> float:
    return max(lower, min(upper, value))


def assess_quality(sample: BiometricSample) -> QualityAssessmentResponse:
    context = sample.quality_context

    quality = 1.0
    quality *= 0.35 + 0.65 * clamp(context.lighting)
    quality *= 1.0 - 0.70 * clamp(context.occlusion)
    quality *= 1.0 - 0.45 * clamp(context.motion_blur)
    quality *= 1.0 - 0.25 * clamp(context.noise)
    quality *= 1.0 - 0.20 * clamp(context.risk_level)
    quality *= 0.40 + 0.60 * clamp(context.liveness_confidence)
    quality *= 1.0 - 0.65 * clamp(context.spoof_risk)

    modality_bias = {
        BiometricModality.face: 1.00,
        BiometricModality.gait: 0.95,
        BiometricModality.fingerprint: 0.98,
        BiometricModality.voice: 0.90,
        BiometricModality.iris: 1.02,
    }[sample.modality]

    quality = clamp(quality * modality_bias)
    quality_score = round(quality * 100, 2)

    if quality_score >= 80:
        recommendation = "use_primary"
    elif quality_score >= 60:
        recommendation = "use_with_fusion"
    else:
        recommendation = "step_up_required"

    if context.spoof_risk >= 0.7 or context.liveness_confidence <= 0.35:
        recommendation = "spoof_check_required"

    return QualityAssessmentResponse(
        modality=sample.modality,
        quality_score=quality_score,
        factors={
            "lighting": round(context.lighting, 3),
            "occlusion": round(context.occlusion, 3),
            "motion_blur": round(context.motion_blur, 3),
            "noise": round(context.noise, 3),
            "risk_level": round(context.risk_level, 3),
            "liveness_confidence": round(context.liveness_confidence, 3),
            "spoof_risk": round(context.spoof_risk, 3),
            "modality_bias": round(modality_bias, 3),
        },
        recommendation=recommendation,
    )
