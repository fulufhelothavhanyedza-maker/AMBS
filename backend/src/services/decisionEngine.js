const { getConfigurationValue } = require("./configurationService");

async function decideAccess({ riskScore, fusedScore }) {
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

  return {
    outcome,
    adjustedScore: Number(adjustedScore.toFixed(2)),
    thresholds
  };
}

module.exports = {
  decideAccess
};
