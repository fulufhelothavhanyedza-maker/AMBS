function simulateControllerResponse(decision, accessPolicy) {
  const targetResource = accessPolicy?.accessPoint?.name || "entry_gate_a";

  if (decision.outcome === "allow") {
    return {
      controllerResponse: "granted",
      responsePayload: {
        targetResource,
        actuator: "door_lock",
        status: "opened",
        ttlSeconds: 8
      }
    };
  }

  if (decision.outcome === "review") {
    return {
      controllerResponse: "manual_review",
      responsePayload: {
        targetResource,
        queue: "security_desk",
        priority: "medium"
      }
    };
  }

  return {
    controllerResponse: "blocked",
    responsePayload: {
      targetResource,
      actuator: "door_lock",
      status: "locked",
      alarmRaised: true
    }
  };
}

module.exports = {
  simulateControllerResponse
};
