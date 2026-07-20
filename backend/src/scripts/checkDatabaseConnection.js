const { query, closePool } = require("../config/database");

async function checkDatabaseConnection() {
  const result = await query(
    "SELECT current_database() AS database_name, current_user AS database_user, NOW() AS checked_at"
  );

  console.log("Database connection successful.");
  console.log(result.rows[0]);
}

checkDatabaseConnection()
  .catch((error) => {
    console.error("Database connection failed.");
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closePool();
  });
