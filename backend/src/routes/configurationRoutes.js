const express = require("express");

const { query } = require("../config/database");
const { requireRole } = require("../middleware/auth");
const { asyncHandler, createHttpError } = require("../utils/http");
const { writeAuditLog } = require("../services/auditService");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (request, response) => {
    const result = await query(
      `
        SELECT key, value, description, updated_at
        FROM system_configuration
        ORDER BY key ASC
      `
    );

    response.json({ configuration: result.rows });
  })
);

router.put(
  "/:key",
  requireRole("administrator"),
  asyncHandler(async (request, response) => {
    const { key } = request.params;
    const { value, description } = request.body;

    if (value === undefined) {
      throw createHttpError(400, "value is required.");
    }

    const result = await query(
      `
        INSERT INTO system_configuration (key, value, description, updated_by)
        VALUES ($1, $2::jsonb, $3, $4)
        ON CONFLICT (key)
        DO UPDATE SET
          value = EXCLUDED.value,
          description = COALESCE(EXCLUDED.description, system_configuration.description),
          updated_by = EXCLUDED.updated_by
        RETURNING key, value, description, updated_at
      `,
      [key, JSON.stringify(value), description || null, request.user.id]
    );

    await writeAuditLog({
      actorUserId: request.user.id,
      action: "configuration.update",
      entityType: "system_configuration",
      entityId: key,
      details: { value, description },
      ipAddress: request.ip
    });

    response.json({ configuration: result.rows[0] });
  })
);

module.exports = router;
