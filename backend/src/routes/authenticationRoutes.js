const express = require("express");

const { getClient, query } = require("../config/database");
const { asyncHandler, createHttpError } = require("../utils/http");
const { evaluateRisk } = require("../services/riskEngine");
const { selectModalities } = require("../services/modalitySelectionEngine");
const { fuseModalities } = require("../services/fusionEngine");
const { decideAccess } = require("../services/decisionEngine");
const { resolveAccessPoint, evaluateAccessPolicy } = require("../services/accessPolicyService");
const { simulateControllerResponse } = require("../services/accessController");
const { writeAuditLog } = require("../services/auditService");
const { writeMonitoringEvent } = require("../services/monitoringService");

const router = express.Router();

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
      modalityScores = {},
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

    const risk = await evaluateRisk({
      confidenceScore,
      failedAttempts: failedAttemptsResult.rows[0].count,
      sourceChannel,
      isOffHours: false
    });

    const strictAccessPointLookup = Object.prototype.hasOwnProperty.call(request.body, "accessPointId")
      || Object.prototype.hasOwnProperty.call(request.body, "targetResource");
    const accessPoint = await resolveAccessPoint({ accessPointId, targetResource });

    if (strictAccessPointLookup && !accessPoint) {
      throw createHttpError(400, "The supplied access point could not be found.");
    }

    const accessPolicy = await evaluateAccessPolicy({
      accessPoint,
      riskLevel: risk.riskLevel
    });

    const modalities = await selectModalities(risk.riskScore);
    const fusion = fuseModalities(modalities.modalities, modalityScores);
    const decision = await decideAccess({
      riskScore: risk.riskScore,
      fusedScore: fusion.fusedScore,
      accessPolicy
    });
    const controller = simulateControllerResponse(decision, accessPolicy);

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
          decision.outcome === "allow" ? "passed" : "failed",
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
        [attempt.id, modalities.modalities, fusion.fusedScore, fusion.algorithmVersion, JSON.stringify(fusion.evidence)]
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
          modalities: modalities.modalities,
          fusedScore: fusion.fusedScore,
          decision: decision.outcome,
          accessPoint: decision.policySummary?.accessPoint,
          policyReason: decision.policySummary?.reason
        },
        ipAddress: request.ip
      });

      await writeMonitoringEvent({
        eventType: "authentication_processed",
        severity: decision.outcome === "deny" ? "warning" : "info",
        sourceComponent: "authentication_engine",
        message: `Authentication ${attempt.id} processed with decision ${decision.outcome}`,
        metadata: {
          attemptId: attempt.id,
          decision: decision.outcome,
          riskScore: risk.riskScore,
          fusedScore: fusion.fusedScore,
          accessPoint: decision.policySummary?.accessPoint,
          policyReason: decision.policySummary?.reason
        }
      });

      response.status(201).json({
        attempt,
        risk: riskResult.rows[0],
        modalities,
        fusion: fusionResult.rows[0],
        decision: decisionResult.rows[0],
        controller: controllerResult.rows[0]
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
