const express = require("express");
const bcrypt = require("bcryptjs");

const { query } = require("../config/database");
const { signToken, requireAuth } = require("../middleware/auth");
const { asyncHandler, createHttpError } = require("../utils/http");
const { writeAuditLog } = require("../services/auditService");

const router = express.Router();

router.post(
  "/login",
  asyncHandler(async (request, response) => {
    const { username, password } = request.body;

    if (!username || !password) {
      throw createHttpError(400, "username and password are required.");
    }

    const result = await query(
      `
        SELECT id, username, password_hash, full_name, role, status
        FROM app_users
        WHERE username = $1
      `,
      [username]
    );

    if (result.rowCount === 0) {
      throw createHttpError(401, "Invalid credentials.");
    }

    const user = result.rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      throw createHttpError(401, "Invalid credentials.");
    }

    if (user.status !== "active") {
      throw createHttpError(403, "Account is not active.");
    }

    await query(
      `
        UPDATE app_users
        SET last_login_at = NOW()
        WHERE id = $1
      `,
      [user.id]
    );

    await writeAuditLog({
      actorUserId: user.id,
      action: "auth.login",
      entityType: "app_user",
      entityId: user.id,
      details: { username: user.username },
      ipAddress: request.ip
    });

    response.json({
      token: signToken(user),
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        role: user.role
      }
    });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (request, response) => {
    response.json({ user: request.user });
  })
);

module.exports = router;
