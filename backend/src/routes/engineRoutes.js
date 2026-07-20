const express = require("express");

const { evaluateRisk } = require("../services/riskEngine");
const { selectModalities } = require("../services/modalitySelectionEngine");
const { fuseModalities } = require("../services/fusionEngine");
const { decideAccess } = require("../services/decisionEngine");
const { simulateControllerResponse } = require("../services/accessController");
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

module.exports = router;
