const database = require("../config/database");

async function listUsers() {
    const result = await database.query(
        `
      SELECT id, username, full_name, email, role, status, last_login_at, created_at, updated_at
      FROM app_users
      ORDER BY created_at DESC
    `
    );

    return result.rows;
}

async function createUser({ username, passwordHash, fullName, email = null, role = "operator" }) {
    const result = await database.query(
        `
      INSERT INTO app_users (username, password_hash, full_name, email, role)
      VALUES ($1, $2, $3, $4, COALESCE($5, 'operator')::user_role)
      RETURNING id, username, full_name, email, role, status, created_at, updated_at
    `,
        [username, passwordHash, fullName, email, role]
    );

    return result.rows[0];
}

async function updateUser(userId, { fullName, email, role, status }) {
    const result = await database.query(
        `
      UPDATE app_users
      SET
        full_name = COALESCE($2, full_name),
        email = COALESCE($3, email),
        role = COALESCE($4::user_role, role),
        status = COALESCE($5::account_status, status)
      WHERE id = $1
      RETURNING id, username, full_name, email, role, status, last_login_at, created_at, updated_at
    `,
        [userId, fullName || null, email || null, role || null, status || null]
    );

    return result.rowCount > 0 ? result.rows[0] : null;
}

module.exports = {
    listUsers,
    createUser,
    updateUser
};
