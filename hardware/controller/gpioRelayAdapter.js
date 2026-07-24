function deriveStateFromCommand(command) {
  if (command.status === "opened") {
    return "open";
  }

  if (command.queue === "security_desk") {
    return "review";
  }

  return "locked";
}

async function executeCommand(command, context = {}) {
  const adapterConfig = context.adapterConfig || {};

  return {
    adapter: "gpio_relay",
    acknowledged: true,
    targetResource: context.targetResource || command.targetResource,
    deviceState: deriveStateFromCommand(command),
    telemetry: {
      pin: Number(adapterConfig.pin || 17),
      activeState: adapterConfig.activeState || "high",
      dryRun: adapterConfig.dryRun !== false,
      pulseMs: Number(adapterConfig.pulseMs || 8000),
      actuator: command.actuator || null,
      securityLevel: context.accessPoint?.security_level || null
    }
  };
}

module.exports = {
  adapterName: "gpio_relay",
  executeCommand
};