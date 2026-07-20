const { getConfigurationValue } = require("./configurationService");

async function decideAccess({ riskScore, fusedScore, accessPolicy }) {
  const thresholds = await getConfigurationValue("decision.thresholds", {
    allow: 75,
    review: 55
  });

  const adjustedScore = fusedScore - riskScore * 0.35;
  let outcome = "deny";

  if (adjustedScore >= thresholds.allow) {
    outcome = "allow";
  } else if (adjustedScore >= thresholds.review) {
    outcome = "review";
  }

  if (accessPolicy?.matchedPolicy?.step_up_required && outcome === "allow") {
    outcome = "review";
  }

  if (accessPolicy && accessPolicy.isAllowed === false) {
    outcome = accessPolicy.stepUpRequired ? "review" : "deny";
  }

  return {
    outcome,
    adjustedScore: Number(adjustedScore.toFixed(2)),
    thresholds,
    policySummary: accessPolicy
      ? {
        accessPoint: accessPolicy.accessPoint
          ? {
            id: accessPolicy.accessPoint.id,
            name: accessPolicy.accessPoint.name,
            securityLevel: accessPolicy.accessPoint.security_level
          }
          : null,
        isAllowed: accessPolicy.isAllowed,
        reason: accessPolicy.reason,
        stepUpRequired: accessPolicy.stepUpRequired,
        policyId: accessPolicy.matchedPolicy?.id || null
      }
      : null
  };
}

module.exports = {
  decideAccess
};
