function simulateControllerResponse(decision) {
  if (decision.outcome === "allow") {
    return {
      controllerResponse: "granted",
      responsePayload: {
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
        queue: "security_desk",
        priority: "medium"
      }
    };
  }

  return {
    controllerResponse: "blocked",
    responsePayload: {
      actuator: "door_lock",
      status: "locked",
      alarmRaised: true
    }
  };
}

module.exports = {
  simulateControllerResponse
};
