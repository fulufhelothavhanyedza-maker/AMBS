const path = require("path");

const adapterRegistry = {
  local_simulated_relay: path.resolve(__dirname, "..", "..", "..", "hardware", "controller", "localSimulatedRelay.js"),
  gpio_relay: path.resolve(__dirname, "..", "..", "..", "hardware", "controller", "gpioRelayAdapter.js")
};

function getAdapterModulePath(adapterName) {
  return adapterRegistry[adapterName] || adapterRegistry.local_simulated_relay;
}

function loadHardwareControllerAdapter(adapterName = "local_simulated_relay") {
  const adapterPath = getAdapterModulePath(adapterName);
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const adapter = require(adapterPath);

  if (!adapter || typeof adapter.executeCommand !== "function") {
    throw new Error(`Hardware controller adapter '${adapterName}' is invalid.`);
  }

  return adapter;
}

function getHardwareControllerAdapterConfig(adapterName = "local_simulated_relay") {
  if (adapterName === "gpio_relay") {
    return {
      pin: Number(process.env.GPIO_RELAY_PIN || 17),
      activeState: process.env.GPIO_RELAY_ACTIVE_STATE || "high",
      dryRun: process.env.GPIO_RELAY_DRY_RUN !== "false",
      pulseMs: Number(process.env.GPIO_RELAY_PULSE_MS || 8000)
    };
  }

  return {};
}

function listHardwareControllerAdapters() {
  return Object.keys(adapterRegistry);
}

module.exports = {
  loadHardwareControllerAdapter,
  getHardwareControllerAdapterConfig,
  listHardwareControllerAdapters
};