const express = require("express");
const bcrypt = require("bcryptjs");

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
        SELECT id, username, full_name, email, role, status, last_login_at, created_at
        FROM app_users
        ORDER BY created_at DESC
      `
    );

    response.json({ users: result.rows });
  })
);

router.post(
  "/",
  requireRole("administrator"),
  asyncHandler(async (request, response) => {
    const { username, password, fullName, email, role } = request.body;

    if (!username || !password || !fullName) {
      throw createHttpError(400, "username, password, and fullName are required.");
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await query(
      `
        INSERT INTO app_users (username, password_hash, full_name, email, role)
        VALUES ($1, $2, $3, $4, COALESCE($5, 'operator')::user_role)
        RETURNING id, username, full_name, email, role, status, created_at
      `,
      [username, passwordHash, fullName, email || null, role || "operator"]
    );

    await writeAuditLog({
      actorUserId: request.user.id,
      action: "users.create",
      entityType: "app_user",
      entityId: result.rows[0].id,
      details: { username: result.rows[0].username, role: result.rows[0].role },
      ipAddress: request.ip
    });

    response.status(201).json({ user: result.rows[0] });
  })
);

router.patch(
  "/:userId",
  requireRole("administrator"),
  asyncHandler(async (request, response) => {
    const { userId } = request.params;
    const { fullName, email, role, status } = request.body;

    const result = await query(
      `
        UPDATE app_users
        SET
          full_name = COALESCE($2, full_name),
          email = COALESCE($3, email),
          role = COALESCE($4::user_role, role),
          status = COALESCE($5::account_status, status)
        WHERE id = $1
        RETURNING id, username, full_name, email, role, status, last_login_at, updated_at
      `,
      [userId, fullName || null, email || null, role || null, status || null]
    );

    if (result.rowCount === 0) {
      throw createHttpError(404, "User not found.");
    }

    await writeAuditLog({
      actorUserId: request.user.id,
      action: "users.update",
      entityType: "app_user",
      entityId: userId,
      details: request.body,
      ipAddress: request.ip
    });

    response.json({ user: result.rows[0] });
  })
);

module.exports = router;
