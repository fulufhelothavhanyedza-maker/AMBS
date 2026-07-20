const express = require("express");

const { query } = require("../config/database");
const { asyncHandler } = require("../utils/http");

const router = express.Router();

router.get(
    "/analytics",
    asyncHandler(async (request, response) => {
        const [attemptStatusRows, riskLevelRows, modalityRows, decisionRows] = await Promise.all([
            query(
                `
          SELECT status, COUNT(*)::int AS count
          FROM authentication_attempts
          GROUP BY status
          ORDER BY status
        `
            ),
            query(
                `
          SELECT risk_level, COUNT(*)::int AS count
          FROM risk_assessments
          GROUP BY risk_level
          ORDER BY risk_level
        `
            ),
            query(
                `
          SELECT primary_modality, COUNT(*)::int AS count
          FROM authentication_attempts
          GROUP BY primary_modality
          ORDER BY primary_modality
        `
            ),
            query(
                `
          SELECT outcome, COUNT(*)::int AS count
          FROM decisions
          GROUP BY outcome
          ORDER BY outcome
        `
            )
        ]);

        response.json({
            generatedAt: new Date().toISOString(),
            attemptStatusDistribution: attemptStatusRows.rows,
            riskLevelDistribution: riskLevelRows.rows,
            modalityUsage: modalityRows.rows,
            decisionOutcomes: decisionRows.rows
        });
    })
);

module.exports = router;
