const database = require("../config/database");

async function listAuditLogs(limit = 200) {
    const result = await database.query(
        `
      SELECT
        l.id,
        l.action,
        l.entity_type,
        l.entity_id,
        l.details,
        l.ip_address,
        l.created_at,
        u.username AS actor_username
      FROM audit_logs l
      LEFT JOIN app_users u ON u.id = l.actor_user_id
      ORDER BY l.created_at DESC
      LIMIT $1
    `,
        [limit]
    );

    return result.rows;
}

async function writeAuditLog({
    actorUserId = null,
    action,
    entityType,
    entityId = null,
    details = {},
    ipAddress = null
}) {
    await database.query(
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
    listAuditLogs,
    writeAuditLog
};
