const test = require("node:test");
const assert = require("node:assert/strict");
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
        return { rowCount: 2, rows: [{ primary_modality: "facial", count: 3 }, { primary_modality: "gait", count: 2 }] };
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
});
