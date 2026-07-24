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
  return {
    adapter: "local_simulated_relay",
    acknowledged: true,
    targetResource: context.targetResource || command.targetResource,
    deviceState: deriveStateFromCommand(command),
    telemetry: {
      actuator: command.actuator || null,
      queue: command.queue || null,
      securityLevel: context.accessPoint?.security_level || null
    }
  };
}

module.exports = {
  adapterName: "local_simulated_relay",
  executeCommand
};