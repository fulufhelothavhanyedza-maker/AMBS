const { getConfigurationValue } = require("./configurationService");

function buildControllerCommand(decision, accessPolicy) {
  const targetResource = accessPolicy?.accessPoint?.name || "entry_gate_a";

  if (decision.outcome === "allow") {
    return {
      targetResource,
      outcome: decision.outcome,
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
      targetResource,
      outcome: decision.outcome,
      controllerResponse: "manual_review",
      responsePayload: {
        targetResource,
        queue: "security_desk",
        priority: "medium"
      }
    };
  }

  return {
    targetResource,
    outcome: decision.outcome,
    controllerResponse: "blocked",
    responsePayload: {
      targetResource,
      actuator: "door_lock",
      status: "locked",
      alarmRaised: true
    }
  };
}

function simulateControllerResponse(decision, accessPolicy) {
  const simulated = buildControllerCommand(decision, accessPolicy);
  return {
    controllerResponse: simulated.controllerResponse,
    responsePayload: {
      ...simulated.responsePayload,
      provider: "simulator",
      delivered: true
    }
  };
}

async function sendWebhookControllerCommand(controllerConfig, decision, accessPolicy) {
  const simulated = buildControllerCommand(decision, accessPolicy);

  if (typeof fetch !== "function") {
    return {
      controllerResponse: "delivery_failed",
      responsePayload: {
        ...simulated.responsePayload,
        provider: "webhook",
        delivered: false,
        error: "Global fetch is not available in this runtime."
      }
    };
  }

  try {
    const response = await fetch(controllerConfig.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(controllerConfig.authToken ? { Authorization: `Bearer ${controllerConfig.authToken}` } : {})
      },
      body: JSON.stringify({
        targetResource: simulated.targetResource,
        outcome: simulated.outcome,
        accessPoint: accessPolicy?.accessPoint || null,
        command: simulated.responsePayload
      })
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        controllerResponse: "delivery_failed",
        responsePayload: {
          ...simulated.responsePayload,
          provider: "webhook",
          delivered: false,
          statusCode: response.status,
          error: body.error || body.detail || "Controller webhook rejected the command."
        }
      };
    }

    return {
      controllerResponse: body.controllerResponse || "delivered",
      responsePayload: {
        ...simulated.responsePayload,
        provider: "webhook",
        delivered: true,
        remoteResponse: body
      }
    };
  } catch (error) {
    return {
      controllerResponse: "delivery_failed",
      responsePayload: {
        ...simulated.responsePayload,
        provider: "webhook",
        delivered: false,
        error: error instanceof Error ? error.message : "Controller webhook request failed."
      }
    };
  }
}

async function dispatchControllerDecision(decision, accessPolicy, overrideConfig = null) {
  const controllerConfig = overrideConfig || await getConfigurationValue("accessController.settings", {
    mode: "simulator",
    webhookUrl: null,
    authToken: null
  });

  if (controllerConfig?.mode === "webhook" && controllerConfig?.webhookUrl) {
    return sendWebhookControllerCommand(controllerConfig, decision, accessPolicy);
  }

  return simulateControllerResponse(decision, accessPolicy);
}

module.exports = {
  buildControllerCommand,
  simulateControllerResponse,
  dispatchControllerDecision
};
