from __future__ import annotations

from math import sqrt

from backend.app.algorithms.policy import (
    calculate_adaptive_threshold,
    calculate_policy_weight,
    get_policy_profile,
)
from backend.app.algorithms.quality import assess_quality, clamp
from backend.app.schemas.biometrics import (
    BiometricModality,
    BiometricSample,
    IdentificationMatch,
    IdentificationRequest,
    IdentificationResponse,
    EvaluationResponse,
    FusionEvidence,
    FusionRequest,
    FusionResponse,
    MatchEvidence,
    VerificationRequest,
    VerificationResponse,
)


def normalize_vector(values: list[float]) -> list[float]:
    magnitude = sqrt(sum(value * value for value in values))
    if magnitude == 0:
        return [0.0 for _ in values]
    return [value / magnitude for value in values]


def cosine_similarity(left: list[float], right: list[float]) -> float:
    if len(left) != len(right):
        raise ValueError("Vectors must have the same length.")

    left_norm = normalize_vector(left)
    right_norm = normalize_vector(right)
    return sum(left_value * right_value for left_value, right_value in zip(left_norm, right_norm))


def infer_reference_vector(modality: BiometricModality, size: int) -> list[float]:
    base = {
        BiometricModality.face: 0.92,
        BiometricModality.gait: 0.88,
        BiometricModality.fingerprint: 0.95,
        BiometricModality.voice: 0.85,
        BiometricModality.iris: 0.97,
    }[modality]

    return [base for _ in range(size)]


def normalized_match_score(sample: BiometricSample) -> float:
    reference = infer_reference_vector(sample.modality, len(sample.embedding))
    similarity = cosine_similarity(sample.embedding, reference)
    return clamp((similarity + 1.0) / 2.0)


def adaptive_weight(
    sample: BiometricSample,
    quality_score: float,
    policy: str,
    modality_weights: dict[str, float] | None = None,
    environment_quality: float = 1.0,
) -> float:
    quality_factor = clamp(quality_score / 100.0)
    environment_factor = 0.75 + 0.25 * clamp(environment_quality)
    policy_factor = {
        "score_level": 1.0,
        "feature_level": 1.05,
        "decision_level": 0.92,
    }.get(policy, 1.0)

    return calculate_policy_weight(
        sample.modality.value,
        quality_score * environment_factor,
        policy,
        modality_weights,
    ) * (0.5 + 0.5 * quality_factor) * policy_factor


def adaptive_threshold(
    base_threshold: float,
    average_quality_score: float,
    adaptation_window: int,
    policy: str,
    risk_score: float = 0.0,
    environment_quality: float = 1.0,
) -> float:
    return calculate_adaptive_threshold(
        base_threshold,
        average_quality_score,
        risk_score,
        environment_quality,
        policy,
        adaptation_window,
    )


def _match_samples(
    probe_samples: list[BiometricSample],
    reference_samples: list[BiometricSample],
    policy: str,
    modality_weights: dict[str, float] | None,
    risk_score: float,
    environment_quality: float,
) -> tuple[float, float, list[MatchEvidence]]:
    reference_by_modality = {
        sample.modality: sample for sample in reference_samples}
    evidence: list[MatchEvidence] = []
    weighted_total = 0.0
    weight_sum = 0.0

    for probe in probe_samples:
        reference = reference_by_modality.get(probe.modality)
        if reference is None:
            continue

        probe_quality = assess_quality(probe).quality_score
        reference_quality = assess_quality(reference).quality_score
        similarity = clamp(
            (cosine_similarity(probe.embedding, reference.embedding) + 1.0) / 2.0)
        average_quality = (probe_quality + reference_quality) / 2.0
        weight = adaptive_weight(
            probe,
            average_quality,
            policy,
            modality_weights,
            environment_quality,
        )
        if policy == "decision_level":
            weight *= 0.9 + 0.1 * (1.0 - clamp(risk_score))

        weighted_total += similarity * weight
        weight_sum += weight
        evidence.append(
            MatchEvidence(
                modality=probe.modality,
                probe_quality=round(probe_quality, 2),
                reference_quality=round(reference_quality, 2),
                similarity=round(similarity, 4),
                weight=round(weight, 4),
            )
        )

    fused_score = round(weighted_total / weight_sum,
                        4) if weight_sum > 0 else 0.0
    average_quality = sum(
        entry.probe_quality for entry in evidence) / len(evidence) if evidence else 0.0
    return fused_score, average_quality, evidence


def fuse_request(request: FusionRequest) -> FusionResponse:
    quality_results = [assess_quality(sample) for sample in request.samples]
    evidence: list[FusionEvidence] = []

    weighted_total = 0.0
    weight_sum = 0.0

    for sample, quality_result in zip(request.samples, quality_results):
        match_score = normalized_match_score(sample)
        weight = adaptive_weight(
            sample,
            quality_result.quality_score,
            request.policy.value,
            request.modality_weights,
            request.environment_quality,
        )
        weighted_total += match_score * weight
        weight_sum += weight
        evidence.append(
            FusionEvidence(
                modality=sample.modality,
                quality_score=quality_result.quality_score,
                normalized_score=round(match_score, 4),
                weight=round(weight, 4),
            )
        )

    fused_score = round(weighted_total / weight_sum,
                        4) if weight_sum > 0 else 0.0
    average_quality = sum(
        result.quality_score for result in quality_results) / len(quality_results)
    adjusted_threshold = adaptive_threshold(
        request.base_threshold,
        average_quality,
        request.adaptation_window,
        request.policy.value,
        request.risk_score,
        request.environment_quality,
    )
    decision = "accept" if fused_score >= adjusted_threshold else "reject"

    return FusionResponse(
        subject_id=request.subject_id,
        strategy=request.strategy,
        fused_score=fused_score,
        adjusted_threshold=adjusted_threshold,
        decision=decision,
        evidence=evidence,
        factors={
            "average_quality": round(average_quality, 2),
            "sample_count": len(request.samples),
        },
    )


def evaluate_biometrics(request: FusionRequest) -> EvaluationResponse:
    quality = [assess_quality(sample) for sample in request.samples]
    fusion = fuse_request(request)
    return EvaluationResponse(quality=quality, fusion=fusion)


def verify_request(request: VerificationRequest) -> VerificationResponse:
    fused_score, average_quality, evidence = _match_samples(
        request.probe_samples,
        request.reference_samples,
        request.policy.value,
        request.modality_weights,
        request.risk_score,
        request.environment_quality,
    )
    adjusted_threshold = adaptive_threshold(
        request.base_threshold,
        average_quality,
        request.adaptation_window,
        request.policy.value,
        request.risk_score,
        request.environment_quality,
    )

    if fused_score >= adjusted_threshold:
        decision = "accept"
    elif fused_score >= max(0.0, adjusted_threshold - 0.05):
        decision = "review"
    else:
        decision = "reject"

    return VerificationResponse(
        subject_id=request.subject_id,
        policy=request.policy,
        fused_score=fused_score,
        adjusted_threshold=adjusted_threshold,
        decision=decision,
        evidence=evidence,
        factors={
            "average_quality": round(average_quality, 2),
            "probe_count": len(request.probe_samples),
            "reference_count": len(request.reference_samples),
            "policy_profile": get_policy_profile(request.policy)["policy"].value,
        },
    )


def identify_request(request: IdentificationRequest) -> IdentificationResponse:
    matches: list[IdentificationMatch] = []

    for candidate in request.candidates:
        fused_score, average_quality, evidence = _match_samples(
            request.probe_samples,
            candidate.reference_samples,
            request.policy.value,
            request.modality_weights,
            request.risk_score,
            request.environment_quality,
        )
        adjusted_threshold = adaptive_threshold(
            request.base_threshold,
            average_quality,
            request.adaptation_window,
            request.policy.value,
            request.risk_score,
            request.environment_quality,
        )
        decision = "match" if fused_score >= adjusted_threshold else "no_match"
        if decision == "no_match" and fused_score >= max(0.0, adjusted_threshold - 0.05):
            decision = "review"

        matches.append(
            IdentificationMatch(
                subject_id=candidate.subject_id,
                score=fused_score,
                adjusted_threshold=adjusted_threshold,
                decision=decision,
                evidence=evidence,
                rank=0,
            )
        )

    matches.sort(key=lambda item: item.score, reverse=True)
    ranked_matches = [match.model_copy(
        update={"rank": index + 1}) for index, match in enumerate(matches[: request.top_k])]
    top_match = ranked_matches[0] if ranked_matches else None

    return IdentificationResponse(matches=ranked_matches, top_match=top_match)
