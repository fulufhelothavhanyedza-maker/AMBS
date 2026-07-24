const express = require("express");

const { getClient, query } = require("../config/database");
const { getLatestEnrolledTemplatesBySubject } = require("../models/biometricTemplateModel");
const { asyncHandler, createHttpError } = require("../utils/http");
const { evaluateRisk } = require("../services/riskEngine");
const { selectModalities } = require("../services/modalitySelectionEngine");
const { fuseModalities } = require("../services/fusionEngine");
const { decideAccess } = require("../services/decisionEngine");
const { resolveAccessPoint, evaluateAccessPolicy } = require("../services/accessPolicyService");
const { dispatchControllerDecision } = require("../services/accessController");
const { extractBiometrics, evaluateBiometrics, verifyBiometrics } = require("../services/biometricEngineClient");
const { writeAuditLog } = require("../services/auditService");
const { writeMonitoringEvent } = require("../services/monitoringService");

const router = express.Router();

function toAttemptStatus(outcome) {
  if (outcome === "allow") {
    return "passed";
  }

  if (outcome === "review") {
    return "challenged";
  }

  return "failed";
}

function normalizeBiometricFusion(biometricEvaluation, fallbackFusion, fallbackModalities) {
  if (!biometricEvaluation) {
    return {
      fusedScore: fallbackFusion.fusedScore,
      algorithmVersion: fallbackFusion.algorithmVersion,
      evidence: fallbackFusion.evidence,
      modalities: fallbackModalities
    };
  }

  if (biometricEvaluation.fused_score !== undefined) {
    const evidence = Array.isArray(biometricEvaluation.evidence)
      ? biometricEvaluation.evidence
      : [];
    const modalities = evidence.length > 0
      ? [...new Set(evidence.map((entry) => entry.modality))]
      : fallbackModalities;

    return {
      fusedScore: Number((Number(biometricEvaluation.fused_score || 0) * 100).toFixed(2)),
      algorithmVersion: "biometric-engine-template-verify-v1",
      evidence: {
        source: "biometric_engine_verify",
        decision: biometricEvaluation.decision,
        adjustedThreshold: biometricEvaluation.adjusted_threshold,
        factors: biometricEvaluation.factors || {},
        evidence
      },
      modalities
    };
  }

  const evidence = Array.isArray(biometricEvaluation.fusion.evidence)
    ? biometricEvaluation.fusion.evidence
    : [];
  const modalities = evidence.length > 0
    ? [...new Set(evidence.map((entry) => entry.modality))]
    : fallbackModalities;

  return {
    fusedScore: Number((Number(biometricEvaluation.fusion.fused_score || 0) * 100).toFixed(2)),
    algorithmVersion: "biometric-engine-adaptive-fusion-v1",
    evidence: {
      source: "biometric_engine",
      decision: biometricEvaluation.fusion.decision,
      adjustedThreshold: biometricEvaluation.fusion.adjusted_threshold,
      factors: biometricEvaluation.fusion.factors || {},
      evidence
    },
    modalities
  };
}

function toReferenceSamples(templates, probeSamples) {
  const probeModalities = new Set(
    probeSamples
      .map((sample) => sample?.modality)
      .filter(Boolean)
  );

  return templates
    .filter((template) => probeModalities.has(template.modality))
    .map((template) => ({
      modality: template.modality,
      embedding: Array.isArray(template.feature_vector) ? template.feature_vector : [],
      quality_context: {
        lighting: 1,
        occlusion: 0,
        motion_blur: 0,
        noise: 0,
        risk_level: 0
      }
    }))
    .filter((sample) => sample.embedding.length > 0);
}

function normalizeExtractedSamples(extractionResponse) {
  const extractedSamples = Array.isArray(extractionResponse?.samples)
    ? extractionResponse.samples
    : [];

  return extractedSamples
    .map((sample) => ({
      modality: sample.modality,
      embedding: Array.isArray(sample.embedding) ? sample.embedding : [],
      quality_context: sample.quality_context || {
        lighting: 0.8,
        occlusion: 0,
        motion_blur: 0,
        noise: 0,
        risk_level: 0
      }
    }))
    .filter((sample) => sample.embedding.length > 0);
}

function summarizeBiometricSignals(samples) {
  const qualityContexts = samples
    .map((sample) => sample?.quality_context)
    .filter(Boolean);

  if (qualityContexts.length === 0) {
    return {
      spoofRisk: 0,
      livenessConfidence: 1
    };
  }

  return {
    spoofRisk: Math.max(...qualityContexts.map((context) => Number(context.spoof_risk || 0))),
    livenessConfidence: Math.min(...qualityContexts.map((context) => Number(context.liveness_confidence ?? 1)))
  };
}

function toBiometricError(error) {
  const statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : null;
  return {
    message: error?.message || "Biometric engine request failed.",
    statusCode
  };
}

router.get(
  "/attempts",
  asyncHandler(async (request, response) => {
    const result = await query(
      `
        SELECT
          a.id,
          a.subject_id,
          s.external_reference,
          a.primary_modality,
          a.status,
          a.confidence_score,
          a.risk_score,
          a.source_channel,
          a.started_at,
          d.outcome AS decision_outcome
        FROM authentication_attempts a
        LEFT JOIN subjects s ON s.id = a.subject_id
        LEFT JOIN decisions d ON d.authentication_attempt_id = a.id
        ORDER BY a.started_at DESC
      `
    );

    response.json({ attempts: result.rows });
  })
);

router.post(
  "/attempts",
  asyncHandler(async (request, response) => {
    const {
      subjectId,
      primaryModality,
      confidenceScore,
      sourceChannel = "internal_portal",
      isOffHours = false,
      modalityScores = {},
      biometricEvaluationRequest,
      accessPointId,
      targetResource = "entry_gate_a"
    } = request.body;

    if (!subjectId || !primaryModality || confidenceScore === undefined) {
      throw createHttpError(400, "subjectId, primaryModality, and confidenceScore are required.");
    }

    const failedAttemptsResult = await query(
      `
        SELECT COUNT(*)::int AS count
        FROM authentication_attempts
        WHERE subject_id = $1
          AND status = 'failed'
          AND started_at > NOW() - INTERVAL '24 hours'
      `,
      [subjectId]
    );

    const strictAccessPointLookup = Object.prototype.hasOwnProperty.call(request.body, "accessPointId")
      || Object.prototype.hasOwnProperty.call(request.body, "targetResource");
    const accessPoint = await resolveAccessPoint({ accessPointId, targetResource });

    if (strictAccessPointLookup && !accessPoint) {
      throw createHttpError(400, "The supplied access point could not be found.");
    }

    const providedBiometricSamples = Array.isArray(biometricEvaluationRequest?.samples) && biometricEvaluationRequest.samples.length > 0
      ? biometricEvaluationRequest.samples
      : [];
    const captureSamples = Array.isArray(biometricEvaluationRequest?.captureSamples) && biometricEvaluationRequest.captureSamples.length > 0
      ? biometricEvaluationRequest.captureSamples
      : [];
    const biometricRuntime = {
      status: "not_requested",
      degradedMode: false,
      extractionError: null,
      evaluationError: null
    };
    const hasBiometricRequest = providedBiometricSamples.length > 0 || captureSamples.length > 0;
    let biometricExtraction = null;
    let biometricEvaluation = null;
    let biometricSamples = providedBiometricSamples;

    if (hasBiometricRequest) {
      biometricRuntime.status = "requested";
    }

    if (providedBiometricSamples.length === 0 && captureSamples.length > 0) {
      try {
        biometricExtraction = await extractBiometrics({ samples: captureSamples });
        biometricSamples = normalizeExtractedSamples(biometricExtraction);
        biometricRuntime.status = "extracted";
      } catch (error) {
        biometricRuntime.degradedMode = true;
        biometricRuntime.extractionError = toBiometricError(error);
        biometricSamples = [];
      }
    }

    if (providedBiometricSamples.length > 0) {
      biometricRuntime.status = "provided_samples";
    }

    const biometricSignals = summarizeBiometricSignals(biometricSamples);
    const risk = await evaluateRisk({
      confidenceScore,
      failedAttempts: failedAttemptsResult.rows[0].count,
      sourceChannel,
      isOffHours: Boolean(isOffHours),
      accessPointSecurityLevel: accessPoint?.security_level,
      spoofRisk: biometricSignals.spoofRisk,
      livenessConfidence: biometricSignals.livenessConfidence
    });
    const enrolledTemplates = biometricSamples.length > 0
      ? await getLatestEnrolledTemplatesBySubject(subjectId)
      : [];
    const referenceSamples = toReferenceSamples(enrolledTemplates, biometricSamples);
    if (biometricSamples.length > 0) {
      try {
        biometricEvaluation = referenceSamples.length > 0
          ? await verifyBiometrics({
            subject_id: subjectId,
            probe_samples: biometricSamples,
            reference_samples: referenceSamples,
            policy: biometricEvaluationRequest?.policy,
            base_threshold: biometricEvaluationRequest?.baseThreshold,
            adaptation_window: biometricEvaluationRequest?.adaptationWindow,
            risk_score: biometricEvaluationRequest?.riskScore ?? risk.riskScore / 100,
            environment_quality: biometricEvaluationRequest?.environmentQuality,
            modality_weights: biometricEvaluationRequest?.modalityWeights || {}
          })
          : await evaluateBiometrics({
            subjectId,
            samples: biometricSamples,
            strategy: biometricEvaluationRequest?.strategy,
            baseThreshold: biometricEvaluationRequest?.baseThreshold,
            adaptationWindow: biometricEvaluationRequest?.adaptationWindow,
            policy: biometricEvaluationRequest?.policy,
            riskScore: biometricEvaluationRequest?.riskScore ?? risk.riskScore / 100,
            environmentQuality: biometricEvaluationRequest?.environmentQuality,
            modalityWeights: biometricEvaluationRequest?.modalityWeights
          });
        biometricRuntime.status = referenceSamples.length > 0 ? "verified" : "evaluated";
      } catch (error) {
        biometricRuntime.degradedMode = true;
        biometricRuntime.evaluationError = toBiometricError(error);
      }
    }

    const accessPolicy = await evaluateAccessPolicy({
      accessPoint,
      riskLevel: risk.riskLevel
    });

    const modalities = await selectModalities(risk.riskScore);
    const fallbackFusion = fuseModalities(modalities.modalities, modalityScores);
    const fusion = normalizeBiometricFusion(
      biometricEvaluation,
      fallbackFusion,
      modalities.modalities
    );
    let decision = await decideAccess({
      riskScore: risk.riskScore,
      fusedScore: fusion.fusedScore,
      accessPolicy
    });

    if (biometricRuntime.degradedMode && hasBiometricRequest && decision.outcome === "allow") {
      decision = {
        ...decision,
        outcome: "review"
      };
    }

    const controller = await dispatchControllerDecision(decision, accessPolicy);

    const client = await getClient();

    try {
      await client.query("BEGIN");

      const attemptResult = await client.query(
        `
          INSERT INTO authentication_attempts (
            subject_id,
            requested_by,
            primary_modality,
            status,
            confidence_score,
            risk_score,
            source_channel,
            completed_at
          )
          VALUES (
            $1,
            $2,
            $3::modality_type,
            $4::authentication_status,
            $5,
            $6,
            $7,
            NOW()
          )
          RETURNING id, subject_id, primary_modality, status, confidence_score, risk_score, source_channel, started_at, completed_at
        `,
        [
          subjectId,
          request.user.id,
          primaryModality,
          toAttemptStatus(decision.outcome),
          confidenceScore,
          risk.riskScore,
          sourceChannel
        ]
      );

      const attempt = attemptResult.rows[0];

      const riskResult = await client.query(
        `
          INSERT INTO risk_assessments (
            authentication_attempt_id,
            risk_score,
            risk_level,
            factors
          )
          VALUES ($1, $2, $3, $4::jsonb)
          RETURNING id, risk_score, risk_level, factors, evaluated_at
        `,
        [attempt.id, risk.riskScore, risk.riskLevel, JSON.stringify(risk.factors)]
      );

      const fusionResult = await client.query(
        `
          INSERT INTO fusion_results (
            authentication_attempt_id,
            participating_modalities,
            fused_score,
            algorithm_version,
            evidence
          )
          VALUES ($1, $2::modality_type[], $3, $4, $5::jsonb)
          RETURNING id, participating_modalities, fused_score, algorithm_version, evidence
        `,
        [attempt.id, fusion.modalities, fusion.fusedScore, fusion.algorithmVersion, JSON.stringify(fusion.evidence)]
      );

      const decisionResult = await client.query(
        `
          INSERT INTO decisions (
            authentication_attempt_id,
            risk_assessment_id,
            fusion_result_id,
            outcome,
            rationale
          )
          VALUES ($1, $2, $3, $4::decision_outcome, $5::jsonb)
          RETURNING id, outcome, rationale, created_at
        `,
        [
          attempt.id,
          riskResult.rows[0].id,
          fusionResult.rows[0].id,
          decision.outcome,
          JSON.stringify({
            adjustedScore: decision.adjustedScore,
            thresholds: decision.thresholds,
            riskLevel: risk.riskLevel,
            ruleName: modalities.ruleName,
            spoofRisk: biometricSignals.spoofRisk,
            livenessConfidence: biometricSignals.livenessConfidence,
            extractionSource: biometricExtraction ? "biometric_engine_extract" : null,
            fusionSource: referenceSamples.length > 0 ? "biometric_engine_verify" : biometricEvaluation ? "biometric_engine" : "express_fallback",
            biometricRuntime,
            accessPolicy: decision.policySummary
          })
        ]
      );

      const controllerResult = await client.query(
        `
          INSERT INTO access_controller_events (
            decision_id,
            target_resource,
            controller_response,
            response_payload
          )
          VALUES ($1, $2, $3, $4::jsonb)
          RETURNING id, decision_id, target_resource, controller_response, delivered_at, response_payload
        `,
        [
          decisionResult.rows[0].id,
          accessPoint?.name || targetResource,
          controller.controllerResponse,
          JSON.stringify(controller.responsePayload)
        ]
      );

      await client.query("COMMIT");

      await writeAuditLog({
        actorUserId: request.user.id,
        action: "authentication.evaluate",
        entityType: "authentication_attempt",
        entityId: attempt.id,
        details: {
          riskScore: risk.riskScore,
          riskLevel: risk.riskLevel,
          modalities: fusion.modalities,
          fusedScore: fusion.fusedScore,
          decision: decision.outcome,
          accessPoint: decision.policySummary?.accessPoint,
          policyReason: decision.policySummary?.reason,
          spoofRisk: biometricSignals.spoofRisk,
          livenessConfidence: biometricSignals.livenessConfidence,
          biometricRuntime,
          extractedModalities: biometricExtraction?.samples?.map((sample) => sample.modality) || [],
          biometricDecision: biometricEvaluation?.decision || biometricEvaluation?.fusion?.decision || null,
          biometricScore: biometricEvaluation?.fused_score ?? biometricEvaluation?.fusion?.fused_score ?? null
        },
        ipAddress: request.ip
      });

      await writeMonitoringEvent({
        eventType: "authentication_processed",
        severity: decision.outcome === "allow" ? "info" : "warning",
        sourceComponent: "authentication_engine",
        message: `Authentication ${attempt.id} processed with decision ${decision.outcome}`,
        metadata: {
          attemptId: attempt.id,
          decision: decision.outcome,
          riskScore: risk.riskScore,
          fusedScore: fusion.fusedScore,
          modalities: fusion.modalities,
          accessPoint: decision.policySummary?.accessPoint,
          policyReason: decision.policySummary?.reason,
          spoofRisk: biometricSignals.spoofRisk,
          livenessConfidence: biometricSignals.livenessConfidence,
          biometricRuntime,
          extractedModalities: biometricExtraction?.samples?.map((sample) => sample.modality) || [],
          biometricDecision: biometricEvaluation?.decision || biometricEvaluation?.fusion?.decision || null,
          biometricScore: biometricEvaluation?.fused_score ?? biometricEvaluation?.fusion?.fused_score ?? null
        }
      });

      response.status(201).json({
        attempt,
        risk: riskResult.rows[0],
        modalities,
        fusion: fusionResult.rows[0],
        decision: decisionResult.rows[0],
        controller: controllerResult.rows[0],
        biometricRuntime,
        biometricExtraction,
        biometricEvaluation
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  })
);

module.exports = router;
