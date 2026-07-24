const test = require("node:test");
const assert = require("node:assert/strict");

const database = require("../backend/src/config/database");
const { evaluateRisk } = require("../backend/src/services/riskEngine");

const originalQuery = database.query;

test.afterEach(() => {
    database.query = originalQuery;
});

test("risk engine increases risk for off-hours high-security access", async () => {
    database.query = async () => ({ rowCount: 0, rows: [] });

    const baseline = await evaluateRisk({
        confidenceScore: 82,
        failedAttempts: 0,
        sourceChannel: "internal_portal",
        isOffHours: false,
        accessPointSecurityLevel: "low"
    });

    const heightened = await evaluateRisk({
        confidenceScore: 82,
        failedAttempts: 0,
        sourceChannel: "external_gateway",
        isOffHours: true,
        accessPointSecurityLevel: "high"
    });

    assert.ok(heightened.riskScore > baseline.riskScore);
    assert.equal(heightened.factors.find((factor) => factor.code === "off_hours_access").score, 100);
    assert.equal(heightened.factors.find((factor) => factor.code === "access_point_security").score, 100);
});

test("risk engine increases risk for spoof indicators and weak liveness", async () => {
    database.query = async () => ({ rowCount: 0, rows: [] });

    const trusted = await evaluateRisk({
        confidenceScore: 82,
        failedAttempts: 0,
        sourceChannel: "internal_portal",
        isOffHours: false,
        accessPointSecurityLevel: "low",
        spoofRisk: 0.02,
        livenessConfidence: 0.98
    });

    const suspicious = await evaluateRisk({
        confidenceScore: 82,
        failedAttempts: 0,
        sourceChannel: "internal_portal",
        isOffHours: false,
        accessPointSecurityLevel: "low",
        spoofRisk: 0.85,
        livenessConfidence: 0.2
    });

    assert.ok(suspicious.riskScore > trusted.riskScore);
    assert.equal(suspicious.factors.find((factor) => factor.code === "spoof_risk").score, 85);
    assert.equal(suspicious.factors.find((factor) => factor.code === "liveness_penalty").score, 80);
});