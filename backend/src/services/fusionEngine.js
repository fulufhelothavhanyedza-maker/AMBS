function toScoreMap(modalityScores) {
  if (!modalityScores || typeof modalityScores !== "object") {
    return {};
  }

  return modalityScores;
}

function clampScore(value) {
  const score = Number(value);
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.max(0, Math.min(100, score));
}

function fuseModalities(modalities, modalityScores) {
  const scoreMap = toScoreMap(modalityScores);
  const weights = {
    face: 0.55,
    gait: 0.45,
    fingerprint: 0.2,
    iris: 0.15,
    voice: 0.1
  };

  let totalWeight = 0;
  let weightedTotal = 0;
  const evidence = {};

  modalities.forEach((modality) => {
    const weight = weights[modality] || 0.1;
    const score = clampScore(scoreMap[modality]);
    totalWeight += weight;
    weightedTotal += score * weight;
    evidence[modality] = { score, weight };
  });

  const fusedScore = totalWeight > 0 ? Number((weightedTotal / totalWeight).toFixed(2)) : 0;

  return {
    fusedScore,
    algorithmVersion: "weighted-average-v1",
    evidence
  };
}

module.exports = {
  fuseModalities
};
