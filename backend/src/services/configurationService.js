const { query } = require("../config/database");

async function getConfigurationValue(key, fallbackValue) {
  const result = await query(
    `
      SELECT value
      FROM system_configuration
      WHERE key = $1
    `,
    [key]
  );

  if (result.rowCount === 0) {
    return fallbackValue;
  }

  return result.rows[0].value;
}

module.exports = {
  getConfigurationValue
};
