const express = require("express");

const { evaluateRisk } = require("../services/riskEngine");
const { selectModalities } = require("../services/modalitySelectionEngine");
const { fuseModalities } = require("../services/fusionEngine");
const { decideAccess } = require("../services/decisionEngine");
const { simulateControllerResponse } = require("../services/accessController");
const {
  evaluateQuality: evaluateBiometricQuality,
  fuseBiometrics,
  evaluateBiometrics,
  verifyBiometrics,
  identifyBiometrics,
  getBiometricPolicy
} = require("../services/biometricEngineClient");
const { asyncHandler, createHttpError } = require("../utils/http");

const router = express.Router();

router.post(
  "/risk/evaluate",
  asyncHandler(async (request, response) => {
    const { confidenceScore, failedAttempts, sourceChannel, isOffHours } = request.body;

    if (confidenceScore === undefined) {
      throw createHttpError(400, "confidenceScore is required.");
    }

    const result = await evaluateRisk({
      confidenceScore,
      failedAttempts,
      sourceChannel: sourceChannel || "internal_portal",
      isOffHours: Boolean(isOffHours)
    });

    response.json(result);
  })
);

router.post(
  "/modality/select",
  asyncHandler(async (request, response) => {
    const { riskScore } = request.body;

    if (riskScore === undefined) {
      throw createHttpError(400, "riskScore is required.");
    }

    const result = await selectModalities(Number(riskScore));
    response.json(result);
  })
);

router.post(
  "/fusion/run",
  asyncHandler(async (request, response) => {
    const { modalities, modalityScores } = request.body;

    if (!Array.isArray(modalities) || modalities.length === 0) {
      throw createHttpError(400, "modalities must be a non-empty array.");
    }

    response.json(fuseModalities(modalities, modalityScores || {}));
  })
);

router.post(
  "/decision/run",
  asyncHandler(async (request, response) => {
    const { riskScore, fusedScore } = request.body;

    if (riskScore === undefined || fusedScore === undefined) {
      throw createHttpError(400, "riskScore and fusedScore are required.");
    }

    response.json(await decideAccess({ riskScore: Number(riskScore), fusedScore: Number(fusedScore) }));
  })
);

router.post(
  "/access-controller/simulate",
  asyncHandler(async (request, response) => {
    const { outcome } = request.body;

    if (!outcome) {
      throw createHttpError(400, "outcome is required.");
    }

    response.json(simulateControllerResponse({ outcome }));
  })
);

router.post(
  "/biometrics/quality",
  asyncHandler(async (request, response) => {
    const { sample } = request.body;

    if (!sample) {
      throw createHttpError(400, "sample is required.");
    }

    response.json(await evaluateBiometricQuality(sample));
  })
);

router.post(
  "/biometrics/fuse",
  asyncHandler(async (request, response) => {
    const { samples, strategy, baseThreshold, adaptationWindow, subjectId } = request.body;

    if (!Array.isArray(samples) || samples.length === 0) {
      throw createHttpError(400, "samples must be a non-empty array.");
    }

    response.json(
      await fuseBiometrics({
        subject_id: subjectId || null,
        samples,
        strategy,
        base_threshold: baseThreshold,
        adaptation_window: adaptationWindow
      })
    );
  })
);

router.post(
  "/biometrics/evaluate",
  asyncHandler(async (request, response) => {
    const { samples, strategy, baseThreshold, adaptationWindow, subjectId } = request.body;

    if (!Array.isArray(samples) || samples.length === 0) {
      throw createHttpError(400, "samples must be a non-empty array.");
    }

    response.json(
      await evaluateBiometrics({
        subject_id: subjectId || null,
        samples,
        strategy,
        base_threshold: baseThreshold,
        adaptation_window: adaptationWindow
      })
    );
  })
);

router.get(
  "/biometrics/policies/default",
  asyncHandler(async (request, response) => {
    response.json(await getBiometricPolicy());
  })
);

router.post(
  "/biometrics/verify",
  asyncHandler(async (request, response) => {
    const { probeSamples, referenceSamples, policy, baseThreshold, adaptationWindow, riskScore, environmentQuality, subjectId, modalityWeights } = request.body;

    if (!Array.isArray(probeSamples) || probeSamples.length === 0) {
      throw createHttpError(400, "probeSamples must be a non-empty array.");
    }

    if (!Array.isArray(referenceSamples) || referenceSamples.length === 0) {
      throw createHttpError(400, "referenceSamples must be a non-empty array.");
    }

    response.json(
      await verifyBiometrics({
        subject_id: subjectId || null,
        probe_samples: probeSamples,
        reference_samples: referenceSamples,
        policy,
        base_threshold: baseThreshold,
        adaptation_window: adaptationWindow,
        risk_score: riskScore,
        environment_quality: environmentQuality,
        modality_weights: modalityWeights || {}
      })
    );
  })
);

router.post(
  "/biometrics/identify",
  asyncHandler(async (request, response) => {
    const { probeSamples, candidates, policy, topK, baseThreshold, adaptationWindow, riskScore, environmentQuality, modalityWeights } = request.body;

    if (!Array.isArray(probeSamples) || probeSamples.length === 0) {
      throw createHttpError(400, "probeSamples must be a non-empty array.");
    }

    if (!Array.isArray(candidates) || candidates.length === 0) {
      throw createHttpError(400, "candidates must be a non-empty array.");
    }

    response.json(
      await identifyBiometrics({
        probe_samples: probeSamples,
        candidates,
        policy,
        top_k: topK,
        base_threshold: baseThreshold,
        adaptation_window: adaptationWindow,
        risk_score: riskScore,
        environment_quality: environmentQuality,
        modality_weights: modalityWeights || {}
      })
    );
  })
);

module.exports = router;
