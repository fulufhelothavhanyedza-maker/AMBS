from __future__ import annotations

from backend.app.algorithms.quality import clamp
from backend.app.schemas.biometrics import FusionPolicy

_POLICY_PROFILES = {
    FusionPolicy.score_level: {
        "base_weights": {
            "face": 1.0,
            "gait": 0.95,
            "fingerprint": 0.98,
            "voice": 0.9,
            "iris": 1.02,
        },
        "quality_multiplier": 1.0,
        "risk_multiplier": 0.18,
        "environment_multiplier": 0.16,
        "threshold_bias": 0.0,
        "weight_exponent": 1.0,
    },
    FusionPolicy.feature_level: {
        "base_weights": {
            "face": 1.05,
            "gait": 1.0,
            "fingerprint": 1.0,
            "voice": 0.92,
            "iris": 1.04,
        },
        "quality_multiplier": 1.08,
        "risk_multiplier": 0.16,
        "environment_multiplier": 0.14,
        "threshold_bias": -0.02,
        "weight_exponent": 1.08,
    },
    FusionPolicy.decision_level: {
        "base_weights": {
            "face": 0.96,
            "gait": 0.93,
            "fingerprint": 0.95,
            "voice": 0.88,
            "iris": 0.99,
        },
        "quality_multiplier": 0.92,
        "risk_multiplier": 0.22,
        "environment_multiplier": 0.18,
        "threshold_bias": 0.04,
        "weight_exponent": 0.94,
    },
}


def get_policy_profile(policy: FusionPolicy | str) -> dict[str, object]:
    policy_value = FusionPolicy(policy)
    profile = _POLICY_PROFILES[policy_value]
    return {
        "policy": policy_value,
        **profile,
    }


def describe_policy(policy: FusionPolicy | str) -> dict[str, object]:
    profile = get_policy_profile(policy)
    return {
        "policy": profile["policy"].value,
        "base_weights": profile["base_weights"],
        "quality_multiplier": profile["quality_multiplier"],
        "risk_multiplier": profile["risk_multiplier"],
        "environment_multiplier": profile["environment_multiplier"],
        "threshold_bias": profile["threshold_bias"],
        "weight_exponent": profile["weight_exponent"],
    }


def calculate_adaptive_threshold(
    base_threshold: float,
    average_quality_score: float,
    risk_score: float,
    environment_quality: float,
    policy: FusionPolicy | str,
    adaptation_window: int,
) -> float:
    profile = get_policy_profile(policy)
    quality_delta = (80.0 - average_quality_score) / 200.0 * \
        float(profile["quality_multiplier"])
    risk_delta = clamp(risk_score) * float(profile["risk_multiplier"])
    environment_delta = (1.0 - clamp(environment_quality)) * \
        float(profile["environment_multiplier"])
    window_delta = min(adaptation_window, 10) * 0.005
    threshold = (
        base_threshold
        + float(profile["threshold_bias"])
        + quality_delta
        + risk_delta
        + environment_delta
        + window_delta
    )
    return round(clamp(threshold), 4)


def calculate_policy_weight(
    modality: str,
    quality_score: float,
    policy: FusionPolicy | str,
    custom_weights: dict[str, float] | None = None,
) -> float:
    profile = get_policy_profile(policy)
    base_weights = profile["base_weights"]  # type: ignore[assignment]
    base_weight = float(base_weights.get(modality, 0.85))
    if custom_weights and modality in custom_weights:
        base_weight = float(custom_weights[modality])

    quality_factor = 0.35 + 0.65 * clamp(quality_score / 100.0)
    exponent = float(profile["weight_exponent"])
    return round(max(0.0, base_weight * (quality_factor**exponent)), 6)
