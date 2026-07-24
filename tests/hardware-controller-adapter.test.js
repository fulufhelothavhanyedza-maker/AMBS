const test = require("node:test");
const assert = require("node:assert/strict");

const database = require("../backend/src/config/database");
const {
  loadHardwareControllerAdapter,
  getHardwareControllerAdapterConfig,
  listHardwareControllerAdapters
} = require("../backend/src/services/hardwareControllerAdapter");
const { dispatchLocalControllerCommand } = require("../backend/src/services/localControllerService");

const originalQuery = database.query;
const originalAdapter = process.env.ACCESS_CONTROLLER_ADAPTER;
const originalPin = process.env.GPIO_RELAY_PIN;
const originalDryRun = process.env.GPIO_RELAY_DRY_RUN;

test.afterEach(() => {
  database.query = originalQuery;
  process.env.ACCESS_CONTROLLER_ADAPTER = originalAdapter;
  process.env.GPIO_RELAY_PIN = originalPin;
  process.env.GPIO_RELAY_DRY_RUN = originalDryRun;
});

test("hardware controller adapter registry exposes both local and gpio adapters", () => {
  const adapters = listHardwareControllerAdapters();

  assert.ok(adapters.includes("local_simulated_relay"));
  assert.ok(adapters.includes("gpio_relay"));
  assert.equal(loadHardwareControllerAdapter("gpio_relay").adapterName, "gpio_relay");
});

test("local controller service can execute commands through the gpio relay adapter", async () => {
  database.query = async () => ({ rowCount: 0, rows: [] });
  process.env.ACCESS_CONTROLLER_ADAPTER = "gpio_relay";
  process.env.GPIO_RELAY_PIN = "23";
  process.env.GPIO_RELAY_DRY_RUN = "true";

  const adapterConfig = getHardwareControllerAdapterConfig("gpio_relay");
  assert.equal(adapterConfig.pin, 23);
  assert.equal(adapterConfig.dryRun, true);

  const response = await dispatchLocalControllerCommand({
    targetResource: "lab_door_1",
    outcome: "allow",
    accessPoint: { name: "lab_door_1", security_level: "high" },
    command: {
      targetResource: "lab_door_1",
      actuator: "door_lock",
      status: "opened",
      ttlSeconds: 8
    }
  });

  assert.equal(response.adapter, "gpio_relay");
  assert.equal(response.adapterResponse.adapter, "gpio_relay");
  assert.equal(response.adapterResponse.telemetry.pin, 23);
  assert.equal(response.adapterResponse.telemetry.dryRun, true);
  assert.equal(response.deviceState.state, "open");
});