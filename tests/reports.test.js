const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
process.env.PORT = process.env.PORT || "0";

const database = require("../backend/src/config/database");

database.query = async (text, params) => {
    if (text.includes("FROM app_users") && text.includes("WHERE id = $1")) {
        return {
            rowCount: 1,
            rows: [
                {
                    id: params[0],
                    username: "admin",
                    full_name: "Admin User",
                    role: "administrator",
                    status: "active"
                }
            ]
        };
    }

    if (text.includes("FROM authentication_attempts") && text.includes("GROUP BY status")) {
        return { rowCount: 2, rows: [{ status: "passed", count: 4 }, { status: "failed", count: 1 }] };
    }

    if (text.includes("FROM risk_assessments")) {
        return { rowCount: 3, rows: [{ risk_level: "low", count: 2 }, { risk_level: "medium", count: 2 }, { risk_level: "high", count: 1 }] };
    }

    if (text.includes("FROM authentication_attempts") && text.includes("GROUP BY primary_modality")) {
        return { rowCount: 2, rows: [{ primary_modality: "face", count: 3 }, { primary_modality: "gait", count: 2 }] };
    }

    if (text.includes("PERCENTILE_CONT(0.95)") && text.includes("FROM authentication_attempts")) {
        return {
            rowCount: 1,
            rows: [{
                avg_latency_ms: 1180.5,
                p50_latency_ms: 1020.0,
                p95_latency_ms: 1980.0,
                p99_latency_ms: 2240.0,
                measured_attempts: 5,
                within_sla_attempts: 4
            }]
        };
    }

    if (text.includes("false_accept_proxy") && text.includes("false_reject_proxy")) {
        return {
            rowCount: 1,
            rows: [{
                total_decisions: 5,
                false_accept_proxy: 1,
                false_reject_proxy: 0,
                allow_count: 4,
                deny_count: 1,
                review_count: 0
            }]
        };
    }

    if (text.includes("FROM decisions")) {
        return { rowCount: 2, rows: [{ outcome: "allow", count: 4 }, { outcome: "deny", count: 1 }] };
    }

    return { rowCount: 0, rows: [] };
};

database.getClient = async () => ({
    query: async () => ({ rowCount: 0, rows: [] }),
    release: () => { }
});

const { app, shutdown } = require("../backend/src/app");

let server;
let baseUrl;
const reportsDirectory = path.resolve(__dirname, "..", "reports");
const token = jwt.sign(
    { sub: "user-1", username: "admin", role: "administrator" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
);

test.before(async () => {
    await shutdown();
    server = app.listen(0);
    const address = server.address();
    baseUrl = `http://127.0.0.1:${address.port}`;
});

test.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await shutdown();

    try {
        const entries = await fs.readdir(reportsDirectory);
        const generated = entries.filter((entry) => entry.startsWith("analytics_") && (entry.endsWith(".json") || entry.endsWith(".csv")));
        await Promise.all(generated.map((entry) => fs.unlink(path.join(reportsDirectory, entry))));
    } catch {
        // Ignore cleanup failures in test environments where files were not created.
    }
});

test("health endpoint responds", async () => {
    const response = await fetch(`${baseUrl}/health`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.status, "ok");
});

test("reports analytics endpoint returns distributions", async () => {
    const response = await fetch(`${baseUrl}/api/reports/analytics`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(payload.attemptStatusDistribution));
    assert.ok(Array.isArray(payload.riskLevelDistribution));
    assert.ok(Array.isArray(payload.modalityUsage));
    assert.ok(Array.isArray(payload.decisionOutcomes));
    assert.equal(payload.attemptStatusDistribution[0].status, "passed");
    assert.equal(payload.latency.slaTargetMs, 2000);
    assert.equal(payload.latency.measuredAttempts, 5);
    assert.equal(payload.latency.withinSlaAttempts, 4);
    assert.equal(payload.latency.slaComplianceRate, 0.8);
    assert.equal(payload.evaluation.model, "proxy-v1");
    assert.equal(payload.evaluation.counts.falseAcceptProxy, 1);
    assert.equal(payload.evaluation.counts.falseRejectProxy, 0);
    assert.equal(payload.evaluation.farProxy, 0.2);
    assert.equal(payload.evaluation.frrProxy, 0);
    assert.equal(payload.evaluation.eerProxy, 0.1);
});

test("reports analytics export endpoint writes JSON and CSV artifacts", async () => {
    const response = await fetch(`${baseUrl}/api/reports/analytics/export`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            format: "both",
            manifest: {
                scenarioName: "off_hours_high_risk_entry",
                datasetTag: "campus-pilot-v1",
                modelVersion: "face-gait-stack-2026.07",
                operator: "research-admin",
                notes: "Controlled evening access simulation",
                tags: ["pilot", "off-hours", "high-risk"]
            }
        })
    });

    const payload = await response.json();

    assert.equal(response.status, 201);
    assert.equal(payload.format, "both");
    assert.equal(payload.files.length, 2);
    assert.equal(payload.manifest.scenarioName, "off_hours_high_risk_entry");
    assert.equal(payload.manifest.datasetTag, "campus-pilot-v1");
    assert.equal(payload.manifest.modelVersion, "face-gait-stack-2026.07");
    assert.equal(payload.manifest.operator, "research-admin");
    assert.ok(Array.isArray(payload.manifest.tags));
    assert.equal(payload.manifest.tags.length, 3);

    const jsonExport = payload.files.find((entry) => entry.format === "json");
    const csvExport = payload.files.find((entry) => entry.format === "csv");

    assert.ok(jsonExport);
    assert.ok(csvExport);

    const jsonPath = path.resolve(__dirname, "..", jsonExport.relativePath.replace(/\//g, path.sep));
    const csvPath = path.resolve(__dirname, "..", csvExport.relativePath.replace(/\//g, path.sep));
    const [jsonContent, csvContent] = await Promise.all([
        fs.readFile(jsonPath, "utf8"),
        fs.readFile(csvPath, "utf8")
    ]);

    const parsedJson = JSON.parse(jsonContent);
    assert.equal(parsedJson.evaluation.model, "proxy-v1");
    assert.equal(parsedJson.manifest.scenarioName, "off_hours_high_risk_entry");
    assert.equal(parsedJson.manifest.datasetTag, "campus-pilot-v1");
    assert.equal(parsedJson.manifest.modelVersion, "face-gait-stack-2026.07");
    assert.ok(csvContent.includes('"section","metric","label","value"'));
    assert.ok(csvContent.includes('"evaluation","farProxy"'));
    assert.ok(csvContent.includes('"manifest","scenarioName"'));
    assert.ok(csvContent.includes('"manifest","datasetTag"'));
});
