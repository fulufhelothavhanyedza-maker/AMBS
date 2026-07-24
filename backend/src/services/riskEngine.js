const { getConfigurationValue } = require("./configurationService");

function toNumber(value, defaultValue = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : defaultValue;
}

function toRiskLevel(score, thresholds) {
  if (score >= thresholds.high) {
    return "high";
  }

  if (score >= thresholds.medium) {
    return "medium";
  }

  return "low";
}

function toSecurityLevelScore(securityLevel) {
  switch (String(securityLevel || "").toLowerCase()) {
    case "high":
      return 100;
    case "medium":
      return 65;
    case "low":
      return 25;
    default:
      return 0;
  }
}

async function evaluateRisk(input) {
  const thresholds = await getConfigurationValue("risk.thresholds", {
    low: 30,
    medium: 60,
    high: 85
  });

  const confidenceScore = toNumber(input.confidenceScore, 0);
  const failedAttempts = toNumber(input.failedAttempts, 0);
  const offHours = input.isOffHours ? 1 : 0;
  const untrustedChannel = input.sourceChannel && input.sourceChannel !== "internal_portal" ? 1 : 0;
  const accessPointSecurity = toSecurityLevelScore(input.accessPointSecurityLevel);
  const spoofRisk = Math.max(0, Math.min(100, toNumber(input.spoofRisk, 0) * 100));
  const livenessPenalty = Math.max(0, Math.min(100, (1 - toNumber(input.livenessConfidence, 1)) * 100));

  const factors = [
    {
      code: "confidence_gap",
      weight: 0.4,
      score: Math.max(0, 100 - confidenceScore)
    },
    {
      code: "failed_attempt_history",
      weight: 0.2,
      score: Math.min(100, failedAttempts * 25)
    },
    {
      code: "off_hours_access",
      weight: 0.1,
      score: offHours * 100
    },
    {
      code: "channel_risk",
      weight: 0.05,
      score: untrustedChannel * 100
    },
    {
      code: "access_point_security",
      weight: 0.1,
      score: accessPointSecurity
    },
    {
      code: "spoof_risk",
      weight: 0.15,
      score: spoofRisk
    },
    {
      code: "liveness_penalty",
      weight: 0.1,
      score: livenessPenalty
    }
  ];

  const weightedRisk = factors.reduce((accumulator, factor) => {
    return accumulator + factor.weight * factor.score;
  }, 0);

  const riskScore = Math.max(0, Math.min(100, Number(weightedRisk.toFixed(2))));

  return {
    riskScore,
    riskLevel: toRiskLevel(riskScore, thresholds),
    factors
  };
}

module.exports = {
  evaluateRisk
};
