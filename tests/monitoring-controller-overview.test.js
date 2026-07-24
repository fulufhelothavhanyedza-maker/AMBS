const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
process.env.PORT = process.env.PORT || "0";

const database = require("../backend/src/config/database");

const originalQuery = database.query;
const originalGetClient = database.getClient;

database.query = async (text, params) => {
    if (text.includes("FROM app_users") && text.includes("WHERE id = $1")) {
        return {
            rowCount: 1,
            rows: [{ id: params[0], username: "admin", full_name: "Admin User", role: "administrator", status: "active" }]
        };
    }

    if (text.includes("FROM controller_device_state")) {
        return {
            rowCount: 1,
            rows: [{
                target_resource: "residence_gate",
                access_point: { name: "residence_gate", security_level: "high" },
                outcome: "allow",
                state: "open",
                last_command: { adapter: "local_simulated_relay", actuator: "door_lock", status: "opened" },
                last_event_id: "evt-1",
                updated_at: new Date().toISOString()
            }]
        };
    }

    if (text.includes("FROM controller_dispatch_events")) {
        return {
            rowCount: 1,
            rows: [{
                id: "evt-1",
                target_resource: "residence_gate",
                outcome: "allow",
                controller_response: "delivered",
                access_point: { name: "residence_gate", security_level: "high" },
                command_payload: { targetResource: "residence_gate", actuator: "door_lock", status: "opened" },
                device_state: "open",
                metadata: { provider: "local_controller", adapter: "local_simulated_relay" },
                delivered_at: new Date().toISOString()
            }]
        };
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
    database.query = originalQuery;
    database.getClient = originalGetClient;
    await new Promise((resolve) => server.close(resolve));
    await shutdown();
});

test("monitoring overview exposes controller device states and dispatch events", async () => {
    const response = await fetch(`${baseUrl}/api/monitoring/controller/overview?limit=10`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.deviceStates.length, 1);
    assert.equal(payload.controllerEvents.length, 1);
    assert.equal(payload.deviceStates[0].targetResource, "residence_gate");
    assert.equal(payload.deviceStates[0].adapter, "local_simulated_relay");
    assert.equal(payload.controllerEvents[0].targetResource, "residence_gate");
    assert.equal(payload.controllerEvents[0].metadata.adapter, "local_simulated_relay");
});