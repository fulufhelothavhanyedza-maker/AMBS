const jwt = require("jsonwebtoken");
const { query } = require("../config/database");
const { createHttpError } = require("../utils/http");

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw createHttpError(500, "JWT_SECRET is not configured.");
  }

  return process.env.JWT_SECRET;
}

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      username: user.username,
      role: user.role
    },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
  );
}

async function requireAuth(request, response, next) {
  const header = request.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(createHttpError(401, "Missing bearer token."));
  }

  try {
    const token = header.slice("Bearer ".length);
    const payload = jwt.verify(token, getJwtSecret());
    const result = await query(
      `
        SELECT id, username, full_name, role, status
        FROM app_users
        WHERE id = $1
      `,
      [payload.sub]
    );

    if (result.rowCount === 0) {
      return next(createHttpError(401, "Invalid token subject."));
    }

    if (result.rows[0].status !== "active") {
      return next(createHttpError(403, "User account is not active."));
    }

    request.user = result.rows[0];
    return next();
  } catch (error) {
    if (error && error.statusCode) {
      return next(error);
    }

    return next(createHttpError(401, "Invalid or expired token."));
  }
}

function requireRole(...allowedRoles) {
  return (request, response, next) => {
    if (!request.user) {
      return next(createHttpError(401, "Authentication required."));
    }

    if (!allowedRoles.includes(request.user.role)) {
      return next(createHttpError(403, "Insufficient permissions."));
    }

    return next();
  };
}

module.exports = {
  signToken,
  requireAuth,
  requireRole
};
