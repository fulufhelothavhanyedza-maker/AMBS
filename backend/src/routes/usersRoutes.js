const express = require("express");
const bcrypt = require("bcryptjs");

const { listUsers, createUser, updateUser } = require("../models/userModel");
const { requireRole } = require("../middleware/auth");
const { asyncHandler, createHttpError } = require("../utils/http");
const { writeAuditLog } = require("../models/auditLogModel");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (request, response) => {
    response.json({ users: await listUsers() });
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
    const user = await createUser({
      username,
      passwordHash,
      fullName,
      email: email || null,
      role: role || "operator"
    });

    await writeAuditLog({
      actorUserId: request.user.id,
      action: "users.create",
      entityType: "app_user",
      entityId: user.id,
      details: { username: user.username, role: user.role },
      ipAddress: request.ip
    });

    response.status(201).json({ user });
  })
);

router.patch(
  "/:userId",
  requireRole("administrator"),
  asyncHandler(async (request, response) => {
    const { userId } = request.params;
    const { fullName, email, role, status } = request.body;

    const user = await updateUser(userId, { fullName, email, role, status });

    if (!user) {
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

    response.json({ user });
  })
);

module.exports = router;
