const { query } = require("../config/database");
const { getConfigurationValue } = require("./configurationService");

async function selectModalities(riskScore) {
  const result = await query(
    `
      SELECT name, minimum_risk_score, maximum_risk_score, selected_modalities
      FROM modality_selection_rules
      WHERE is_active = TRUE
        AND $1 >= minimum_risk_score
        AND $1 <= maximum_risk_score
      ORDER BY minimum_risk_score DESC
      LIMIT 1
    `,
    [riskScore]
  );

  if (result.rowCount > 0) {
    return {
      ruleName: result.rows[0].name,
      modalities: result.rows[0].selected_modalities
    };
  }

  const defaults = await getConfigurationValue("authentication.defaultModalities", ["face"]);
  return {
    ruleName: "default-fallback",
    modalities: defaults
  };
}

module.exports = {
  selectModalities
};
