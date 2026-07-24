const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
process.env.PORT = process.env.PORT || "0";

const database = require("../backend/src/config/database");

const originalQuery = database.query;
const originalGetClient = database.getClient;

const controllerStateStore = new Map();
const controllerEventStore = [];

database.query = async (text, params) => {
  if (text.includes("FROM app_users") && text.includes("WHERE id = $1")) {
    return {
      rowCount: 1,
      rows: [{ id: params[0], username: "admin", full_name: "Admin User", role: "administrator", status: "active" }]
    };
  }

  if (text.includes("INSERT INTO controller_dispatch_events")) {
    controllerEventStore.unshift({
      id: params[0],
      target_resource: params[1],
      outcome: params[2],
      controller_response: params[3],
      access_point: JSON.parse(params[4]),
      command_payload: JSON.parse(params[5]),
      device_state: params[6],
      metadata: JSON.parse(params[7]),
      delivered_at: params[8]
    });
    return { rowCount: 1, rows: [{ id: params[0] }] };
  }

  if (text.includes("INSERT INTO controller_device_state")) {
    controllerStateStore.set(params[0], {
      target_resource: params[0],
      access_point: JSON.parse(params[1]),
      outcome: params[2],
      state: params[3],
      last_command: JSON.parse(params[4]),
      last_event_id: params[5],
      updated_at: controllerEventStore[0]?.delivered_at || new Date().toISOString()
    });
    return { rowCount: 1, rows: [] };
  }

  if (text.includes("FROM controller_device_state")) {
    const row = controllerStateStore.get(params[0]);
    return { rowCount: row ? 1 : 0, rows: row ? [row] : [] };
  }

  if (text.includes("FROM controller_dispatch_events")) {
    return { rowCount: controllerEventStore.length, rows: controllerEventStore.slice(0, params[0]) };
  }

  return { rowCount: 0, rows: [] };
};

database.getClient = async () => ({
  query: async () => ({ rowCount: 0, rows: [] }),
  release: () => {}
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
  controllerStateStore.clear();
  controllerEventStore.length = 0;
  await new Promise((resolve) => server.close(resolve));
  await shutdown();
});

test("local controller webhook accepts a dispatch and exposes device state", async () => {
  const dispatchResponse = await fetch(`${baseUrl}/api/controller/dispatch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      targetResource: "residence_gate",
      outcome: "allow",
      accessPoint: { name: "residence_gate", security_level: "high" },
      command: {
        targetResource: "residence_gate",
        actuator: "door_lock",
        status: "opened",
        ttlSeconds: 8
      }
    })
  });

  const dispatchPayload = await dispatchResponse.json();

  assert.equal(dispatchResponse.status, 200);
  assert.equal(dispatchPayload.controllerResponse, "delivered");
  assert.equal(dispatchPayload.deviceState.state, "open");
  assert.equal(dispatchPayload.adapter, "local_simulated_relay");
  assert.equal(dispatchPayload.adapterResponse.adapter, "local_simulated_relay");

  const stateResponse = await fetch(`${baseUrl}/api/controller/devices/residence_gate/status`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const statePayload = await stateResponse.json();

  assert.equal(stateResponse.status, 200);
  assert.equal(statePayload.deviceState.targetResource, "residence_gate");
  assert.equal(statePayload.deviceState.lastEventId, dispatchPayload.controllerEventId);
  assert.equal(statePayload.deviceState.state, "open");

  const eventsResponse = await fetch(`${baseUrl}/api/controller/events?limit=10`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const eventsPayload = await eventsResponse.json();

  assert.equal(eventsResponse.status, 200);
  assert.equal(eventsPayload.events.length, 1);
  assert.equal(eventsPayload.events[0].targetResource, "residence_gate");
  assert.equal(eventsPayload.events[0].deviceState, "open");
  assert.equal(eventsPayload.events[0].metadata.adapter, "local_simulated_relay");
});