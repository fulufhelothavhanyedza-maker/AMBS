const { query } = require("../config/database");

async function writeAuditLog({
  actorUserId = null,
  action,
  entityType,
  entityId = null,
  details = {},
  ipAddress = null
}) {
  await query(
    `
      INSERT INTO audit_logs (
        actor_user_id,
        action,
        entity_type,
        entity_id,
        details,
        ip_address
      )
      VALUES ($1, $2, $3, $4, $5::jsonb, $6)
    `,
    [actorUserId, action, entityType, entityId, JSON.stringify(details), ipAddress]
  );
}

module.exports = {
  writeAuditLog
};
