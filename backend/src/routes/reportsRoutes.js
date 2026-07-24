const express = require("express");
const fs = require("node:fs/promises");
const path = require("node:path");

const { query } = require("../config/database");
const { asyncHandler, createHttpError } = require("../utils/http");

const router = express.Router();

function toSafeNumber(value, fallback = 0) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
}

function toRate(numerator, denominator) {
    const safeDenominator = Math.max(1, denominator);
    return Number((numerator / safeDenominator).toFixed(4));
}

function toSafeString(value, fallback = "") {
    if (value === undefined || value === null) {
        return fallback;
    }

    const normalized = String(value).trim();
    return normalized.length > 0 ? normalized : fallback;
}

function buildEvaluationMetrics(metricsRow) {
    const totalDecisions = toSafeNumber(metricsRow.total_decisions);
    const falseAcceptProxy = toSafeNumber(metricsRow.false_accept_proxy);
    const falseRejectProxy = toSafeNumber(metricsRow.false_reject_proxy);
    const farProxy = toRate(falseAcceptProxy, totalDecisions);
    const frrProxy = toRate(falseRejectProxy, totalDecisions);

    return {
        model: "proxy-v1",
        counts: {
            totalDecisions,
            falseAcceptProxy,
            falseRejectProxy,
            allowCount: toSafeNumber(metricsRow.allow_count),
            denyCount: toSafeNumber(metricsRow.deny_count),
            reviewCount: toSafeNumber(metricsRow.review_count)
        },
        farProxy,
        frrProxy,
        eerProxy: Number(((farProxy + frrProxy) / 2).toFixed(4)),
        definition: {
            falseAcceptProxy: "Decisions marked allow while spoofRisk in rationale is >= 0.7",
            falseRejectProxy: "Decisions marked deny while rationale riskLevel is low"
        }
    };
}

async function buildAnalyticsSnapshot() {
    const [attemptStatusRows, riskLevelRows, modalityRows, decisionRows, latencyRows, evaluationRows] = await Promise.all([
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
        ),
        query(
            `
                    SELECT
                        ROUND(AVG(EXTRACT(EPOCH FROM (completed_at - started_at)) * 1000)::numeric, 2) AS avg_latency_ms,
                        ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (completed_at - started_at)) * 1000)::numeric, 2) AS p50_latency_ms,
                        ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (completed_at - started_at)) * 1000)::numeric, 2) AS p95_latency_ms,
                        ROUND(PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (completed_at - started_at)) * 1000)::numeric, 2) AS p99_latency_ms,
                        COUNT(*)::int AS measured_attempts,
                        COUNT(*) FILTER (
                            WHERE EXTRACT(EPOCH FROM (completed_at - started_at)) * 1000 <= 2000
                        )::int AS within_sla_attempts
                    FROM authentication_attempts
                    WHERE completed_at IS NOT NULL
                `
        ),
        query(
            `
                    SELECT
                        COUNT(*)::int AS total_decisions,
                        COUNT(*) FILTER (
                            WHERE outcome = 'allow'
                                AND COALESCE((rationale ->> 'spoofRisk')::numeric, 0) >= 0.7
                        )::int AS false_accept_proxy,
                        COUNT(*) FILTER (
                            WHERE outcome = 'deny'
                                AND COALESCE(rationale ->> 'riskLevel', '') = 'low'
                        )::int AS false_reject_proxy,
                        COUNT(*) FILTER (WHERE outcome = 'allow')::int AS allow_count,
                        COUNT(*) FILTER (WHERE outcome = 'deny')::int AS deny_count,
                        COUNT(*) FILTER (WHERE outcome = 'review')::int AS review_count
                    FROM decisions
                `
        )
    ]);

    const latency = latencyRows.rows[0] || {};
    const measuredAttempts = toSafeNumber(latency.measured_attempts);
    const withinSlaAttempts = toSafeNumber(latency.within_sla_attempts);
    const evaluation = buildEvaluationMetrics(evaluationRows.rows[0] || {});

    return {
        generatedAt: new Date().toISOString(),
        attemptStatusDistribution: attemptStatusRows.rows,
        riskLevelDistribution: riskLevelRows.rows,
        modalityUsage: modalityRows.rows,
        decisionOutcomes: decisionRows.rows,
        evaluation,
        latency: {
            avgMs: toSafeNumber(latency.avg_latency_ms),
            p50Ms: toSafeNumber(latency.p50_latency_ms),
            p95Ms: toSafeNumber(latency.p95_latency_ms),
            p99Ms: toSafeNumber(latency.p99_latency_ms),
            measuredAttempts,
            withinSlaAttempts,
            slaTargetMs: 2000,
            slaComplianceRate: toRate(withinSlaAttempts, measuredAttempts)
        }
    };
}

function toCsvRows(snapshot) {
    const rows = [
        ["section", "metric", "label", "value"],
        ["latency", "avgMs", "", String(snapshot.latency.avgMs)],
        ["latency", "p50Ms", "", String(snapshot.latency.p50Ms)],
        ["latency", "p95Ms", "", String(snapshot.latency.p95Ms)],
        ["latency", "p99Ms", "", String(snapshot.latency.p99Ms)],
        ["latency", "slaComplianceRate", "", String(snapshot.latency.slaComplianceRate)],
        ["evaluation", "farProxy", "", String(snapshot.evaluation.farProxy)],
        ["evaluation", "frrProxy", "", String(snapshot.evaluation.frrProxy)],
        ["evaluation", "eerProxy", "", String(snapshot.evaluation.eerProxy)]
    ];

    if (snapshot.manifest) {
        rows.push(["manifest", "runId", "", String(snapshot.manifest.runId)]);
        rows.push(["manifest", "scenarioName", "", String(snapshot.manifest.scenarioName)]);
        rows.push(["manifest", "datasetTag", "", String(snapshot.manifest.datasetTag)]);
        rows.push(["manifest", "modelVersion", "", String(snapshot.manifest.modelVersion)]);
        rows.push(["manifest", "operator", "", String(snapshot.manifest.operator)]);
        rows.push(["manifest", "notes", "", String(snapshot.manifest.notes)]);

        snapshot.manifest.tags.forEach((tag, index) => {
            rows.push(["manifest", "tag", String(index + 1), String(tag)]);
        });
    }

    snapshot.attemptStatusDistribution.forEach((entry) => {
        rows.push(["attemptStatusDistribution", "count", String(entry.status), String(entry.count)]);
    });
    snapshot.riskLevelDistribution.forEach((entry) => {
        rows.push(["riskLevelDistribution", "count", String(entry.risk_level), String(entry.count)]);
    });
    snapshot.modalityUsage.forEach((entry) => {
        rows.push(["modalityUsage", "count", String(entry.primary_modality), String(entry.count)]);
    });
    snapshot.decisionOutcomes.forEach((entry) => {
        rows.push(["decisionOutcomes", "count", String(entry.outcome), String(entry.count)]);
    });

    return rows
        .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
        .join("\n");
}

function buildExportBaseName(generatedAt) {
    const stamp = String(generatedAt)
        .replace(/[\-:]/g, "")
        .replace(/\.\d{3}Z$/, "Z");
    return `analytics_${stamp}`;
}

function buildExportManifest(manifestInput, generatedAt) {
    const input = manifestInput && typeof manifestInput === "object" ? manifestInput : {};
    const stamp = String(generatedAt)
        .replace(/[\-:]/g, "")
        .replace(/\.\d{3}Z$/, "Z");

    const tags = Array.isArray(input.tags)
        ? input.tags
            .map((tag) => toSafeString(tag))
            .filter(Boolean)
            .slice(0, 10)
        : [];

    return {
        runId: toSafeString(input.runId, `run_${stamp}`),
        scenarioName: toSafeString(input.scenarioName, "unspecified_scenario"),
        datasetTag: toSafeString(input.datasetTag, "unspecified_dataset"),
        modelVersion: toSafeString(input.modelVersion, "unspecified_model"),
        operator: toSafeString(input.operator, "unspecified_operator"),
        notes: toSafeString(input.notes, ""),
        tags,
        createdAt: generatedAt
    };
}

router.get(
    "/analytics",
    asyncHandler(async (request, response) => {
        response.json(await buildAnalyticsSnapshot());
    })
);

router.post(
    "/analytics/export",
    asyncHandler(async (request, response) => {
        const format = String(request.query.format || request.body?.format || "both").toLowerCase();
        const allowedFormats = new Set(["json", "csv", "both"]);

        if (!allowedFormats.has(format)) {
            throw createHttpError(400, "format must be one of: json, csv, both.");
        }

        const snapshot = await buildAnalyticsSnapshot();
        const manifestInput = request.body?.manifest && typeof request.body.manifest === "object"
            ? request.body.manifest
            : request.body;
        const manifest = buildExportManifest(manifestInput, snapshot.generatedAt);
        const exportPayload = {
            ...snapshot,
            manifest
        };
        const reportsDirectory = path.resolve(__dirname, "..", "..", "..", "reports");
        const fileBaseName = buildExportBaseName(snapshot.generatedAt);
        const exportsCreated = [];

        await fs.mkdir(reportsDirectory, { recursive: true });

        if (format === "json" || format === "both") {
            const jsonFileName = `${fileBaseName}.json`;
            const jsonAbsolutePath = path.join(reportsDirectory, jsonFileName);
            await fs.writeFile(jsonAbsolutePath, `${JSON.stringify(exportPayload, null, 2)}\n`, "utf8");
            exportsCreated.push({
                format: "json",
                fileName: jsonFileName,
                relativePath: `reports/${jsonFileName}`
            });
        }

        if (format === "csv" || format === "both") {
            const csvFileName = `${fileBaseName}.csv`;
            const csvAbsolutePath = path.join(reportsDirectory, csvFileName);
            await fs.writeFile(csvAbsolutePath, `${toCsvRows(exportPayload)}\n`, "utf8");
            exportsCreated.push({
                format: "csv",
                fileName: csvFileName,
                relativePath: `reports/${csvFileName}`
            });
        }

        response.status(201).json({
            generatedAt: snapshot.generatedAt,
            format,
            manifest,
            files: exportsCreated,
            summary: {
                attemptsMeasured: snapshot.latency.measuredAttempts,
                slaComplianceRate: snapshot.latency.slaComplianceRate,
                farProxy: snapshot.evaluation.farProxy,
                frrProxy: snapshot.evaluation.frrProxy,
                eerProxy: snapshot.evaluation.eerProxy
            }
        });
    })
);

module.exports = router;
