const test = require("node:test");
const assert = require("node:assert/strict");

const database = require("../backend/src/config/database");
const { dispatchControllerDecision, simulateControllerResponse } = require("../backend/src/services/accessController");

const originalQuery = database.query;

test.afterEach(() => {
    database.query = originalQuery;
});

test("access controller falls back to simulator mode by default", async () => {
    database.query = async () => ({ rowCount: 0, rows: [] });

    const response = await dispatchControllerDecision(
        { outcome: "allow" },
        { accessPoint: { name: "entry_gate_a" } }
    );

    assert.deepEqual(response, simulateControllerResponse(
        { outcome: "allow" },
        { accessPoint: { name: "entry_gate_a" } }
    ));
});

test("access controller can deliver commands through a webhook endpoint", async () => {
    database.query = async () => ({ rowCount: 0, rows: [] });
    const originalFetch = global.fetch;
    const calls = [];

    global.fetch = async (url, options) => {
        calls.push({ url, options });
        return {
            ok: true,
            status: 200,
            json: async () => ({ controllerResponse: "delivered", controllerEventId: "evt-1" })
        };
    };

    try {
        const response = await dispatchControllerDecision(
            { outcome: "allow" },
            { accessPoint: { name: "residence_gate", security_level: "high" } },
            { mode: "webhook", webhookUrl: "http://controller.local/dispatch", authToken: "token-123" }
        );

        assert.equal(calls.length, 1);
        assert.equal(calls[0].url, "http://controller.local/dispatch");
        assert.equal(calls[0].options.method, "POST");
        assert.equal(calls[0].options.headers.Authorization, "Bearer token-123");

        const payload = JSON.parse(calls[0].options.body);
        assert.equal(payload.targetResource, "residence_gate");
        assert.equal(payload.outcome, "allow");
        assert.equal(payload.command.status, "opened");

        assert.equal(response.controllerResponse, "delivered");
        assert.equal(response.responsePayload.provider, "webhook");
        assert.equal(response.responsePayload.delivered, true);
        assert.equal(response.responsePayload.remoteResponse.controllerEventId, "evt-1");
    } finally {
        global.fetch = originalFetch;
    }
});