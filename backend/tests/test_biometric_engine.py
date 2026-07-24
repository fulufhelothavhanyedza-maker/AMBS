import unittest

from backend.app.algorithms.extraction import extract_embeddings
from backend.app.algorithms.fusion import evaluate_biometrics, fuse_request, identify_request, verify_request
from backend.app.algorithms.quality import assess_quality
from backend.app.main import app
from backend.app.schemas.biometrics import (
    BiometricModality,
    BiometricSample,
    CaptureSample,
    FusionPolicy,
    FusionRequest,
    IdentificationCandidate,
    IdentificationRequest,
    QualityContext,
    VerificationRequest,
)


class BiometricEngineTests(unittest.TestCase):
    def test_quality_decreases_with_bad_context(self):
        good_sample = BiometricSample(
            modality=BiometricModality.face,
            embedding=[0.9, 0.8, 0.7],
            quality_context=QualityContext(
                lighting=0.95, occlusion=0.0, motion_blur=0.0, noise=0.0, risk_level=0.0),
        )
        bad_sample = BiometricSample(
            modality=BiometricModality.face,
            embedding=[0.9, 0.8, 0.7],
            quality_context=QualityContext(
                lighting=0.2, occlusion=0.7, motion_blur=0.5, noise=0.4, risk_level=0.3),
        )

        good_quality = assess_quality(good_sample)
        bad_quality = assess_quality(bad_sample)

        self.assertGreater(good_quality.quality_score,
                           bad_quality.quality_score)
        self.assertEqual(good_quality.recommendation, "use_primary")
        self.assertEqual(bad_quality.recommendation, "step_up_required")

    def test_quality_flags_spoof_risk_and_low_liveness(self):
        suspicious_sample = BiometricSample(
            modality=BiometricModality.face,
            embedding=[0.9, 0.8, 0.7],
            quality_context=QualityContext(
                lighting=0.9,
                occlusion=0.0,
                motion_blur=0.0,
                noise=0.0,
                risk_level=0.0,
                liveness_confidence=0.2,
                spoof_risk=0.85,
            ),
        )

        suspicious_quality = assess_quality(suspicious_sample)

        self.assertLess(suspicious_quality.quality_score, 60)
        self.assertEqual(suspicious_quality.recommendation,
                         "spoof_check_required")
        self.assertEqual(suspicious_quality.factors["spoof_risk"], 0.85)
        self.assertEqual(
            suspicious_quality.factors["liveness_confidence"], 0.2)

    def test_fusion_accepts_high_quality_samples(self):
        request = FusionRequest(
            subject_id="subject-1",
            samples=[
                BiometricSample(
                    modality=BiometricModality.face,
                    embedding=[0.95, 0.94, 0.93],
                    quality_context=QualityContext(
                        lighting=0.98, occlusion=0.0, motion_blur=0.0, noise=0.0, risk_level=0.0),
                ),
                BiometricSample(
                    modality=BiometricModality.gait,
                    embedding=[0.9, 0.89, 0.88],
                    quality_context=QualityContext(
                        lighting=0.9, occlusion=0.0, motion_blur=0.0, noise=0.0, risk_level=0.0),
                ),
            ],
            base_threshold=0.7,
            adaptation_window=2,
        )

        result = fuse_request(request)
        evaluation = evaluate_biometrics(request)

        self.assertGreaterEqual(result.fused_score, result.adjusted_threshold)
        self.assertEqual(result.decision, "accept")
        self.assertEqual(len(result.evidence), 2)
        self.assertEqual(evaluation.fusion.decision, "accept")
        self.assertEqual(len(evaluation.quality), 2)

    def test_api_router_exposes_biometric_routes(self):
        paths = set(app.openapi()["paths"].keys())
        self.assertIn("/health", paths)
        self.assertIn("/biometrics/extract", paths)
        self.assertIn("/biometrics/quality", paths)
        self.assertIn("/biometrics/fuse", paths)
        self.assertIn("/biometrics/evaluate", paths)
        self.assertIn("/biometrics/policies/default", paths)
        self.assertIn("/biometrics/verify", paths)
        self.assertIn("/biometrics/identify", paths)

    def test_extract_embeddings_generates_face_and_gait_vectors(self):
        result = extract_embeddings([
            CaptureSample(
                modality=BiometricModality.face,
                raw_signal=[0.2, 0.4, 0.6, 0.5, 0.45],
                frame_count=18,
                capture_duration=1.2,
                sensor_confidence=0.94,
                quality_context=QualityContext(
                    lighting=0.95, occlusion=0.05, motion_blur=0.02, noise=0.03, risk_level=0.0),
            ),
            CaptureSample(
                modality=BiometricModality.gait,
                raw_signal=[0.1, 0.3, 0.65, 0.25, 0.7, 0.2],
                frame_count=24,
                capture_duration=1.5,
                sensor_confidence=0.91,
                quality_context=QualityContext(
                    lighting=0.88, occlusion=0.0, motion_blur=0.08, noise=0.06, risk_level=0.02),
            ),
        ])

        self.assertEqual(len(result.samples), 2)
        self.assertEqual(result.samples[0].modality, BiometricModality.face)
        self.assertEqual(result.samples[1].modality, BiometricModality.gait)
        self.assertEqual(len(result.samples[0].embedding), 8)
        self.assertEqual(len(result.samples[1].embedding), 8)
        self.assertNotEqual(
            result.samples[0].embedding, result.samples[1].embedding)
        self.assertIn("frame_count", result.samples[0].diagnostics)
        self.assertIn("cadence", result.samples[1].diagnostics)

    def test_verify_request_accepts_matching_probe_and_reference(self):
        probe = BiometricSample(
            modality=BiometricModality.face,
            embedding=[0.96, 0.95, 0.94],
            quality_context=QualityContext(
                lighting=0.98, occlusion=0.0, motion_blur=0.0, noise=0.0, risk_level=0.0),
        )
        reference = BiometricSample(
            modality=BiometricModality.face,
            embedding=[0.95, 0.94, 0.93],
            quality_context=QualityContext(
                lighting=0.96, occlusion=0.0, motion_blur=0.0, noise=0.0, risk_level=0.0),
        )

        result = verify_request(
            VerificationRequest(
                subject_id="subject-1",
                probe_samples=[probe],
                reference_samples=[reference],
                policy=FusionPolicy.score_level,
                base_threshold=0.72,
                risk_score=0.05,
                environment_quality=0.95,
            )
        )

        self.assertEqual(result.decision, "accept")
        self.assertGreaterEqual(result.fused_score, result.adjusted_threshold)
        self.assertEqual(len(result.evidence), 1)

    def test_identification_ranks_best_candidate_first(self):
        probe = BiometricSample(
            modality=BiometricModality.gait,
            embedding=[0.91, 0.9, 0.89],
            quality_context=QualityContext(
                lighting=0.92, occlusion=0.0, motion_blur=0.0, noise=0.0, risk_level=0.0),
        )
        strong_candidate = IdentificationCandidate(
            subject_id="candidate-1",
            reference_samples=[
                BiometricSample(
                    modality=BiometricModality.gait,
                    embedding=[0.9, 0.9, 0.88],
                    quality_context=QualityContext(
                        lighting=0.94, occlusion=0.0, motion_blur=0.0, noise=0.0, risk_level=0.0),
                )
            ],
        )
        weak_candidate = IdentificationCandidate(
            subject_id="candidate-2",
            reference_samples=[
                BiometricSample(
                    modality=BiometricModality.gait,
                    embedding=[0.2, 0.1, 0.05],
                    quality_context=QualityContext(
                        lighting=0.5, occlusion=0.4, motion_blur=0.2, noise=0.3, risk_level=0.2),
                )
            ],
        )

        result = identify_request(
            IdentificationRequest(
                probe_samples=[probe],
                candidates=[weak_candidate, strong_candidate],
                top_k=2,
                policy=FusionPolicy.feature_level,
                base_threshold=0.7,
                risk_score=0.03,
                environment_quality=0.9,
            )
        )

        self.assertEqual(result.top_match.subject_id, "candidate-1")
        self.assertEqual(result.matches[0].subject_id, "candidate-1")
        self.assertEqual(len(result.matches), 2)


if __name__ == "__main__":
    unittest.main()
