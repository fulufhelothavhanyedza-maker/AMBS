const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

function getDatabaseConfig() {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL
    };
  }

  const requiredVariables = [
    "DB_HOST",
    "DB_PORT",
    "DB_NAME",
    "DB_USER",
    "DB_PASSWORD"
  ];

  const missingVariables = requiredVariables.filter(
    (variableName) => !process.env[variableName]
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing database configuration: ${missingVariables.join(", ")}`
    );
  }

  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  };
}

let pool;

function getPool() {
  if (!pool) {
    const config = getDatabaseConfig();

    if (Object.prototype.hasOwnProperty.call(config, "port") && (!Number.isInteger(config.port) || config.port <= 0)) {
      throw new Error("DB_PORT must be a valid positive integer.");
    }

    pool = new Pool(config);
  }

  return pool;
}

async function query(text, params) {
  return getPool().query(text, params);
}

async function getClient() {
  return getPool().connect();
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = {
  query,
  getClient,
  getPool,
  closePool
};
