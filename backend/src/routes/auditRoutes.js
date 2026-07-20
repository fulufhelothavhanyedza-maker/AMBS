const express = require("express");
const { query } = require("../config/database");
const { asyncHandler } = require("../utils/http");

const router = express.Router();

router.get(
  "/logs",
  asyncHandler(async (request, response) => {
    const result = await query(
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
        LIMIT 200
      `
    );

    response.json({ logs: result.rows });
  })
);

module.exports = router;
