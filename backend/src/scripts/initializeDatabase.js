const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { getClient, closePool } = require("../config/database");

const schemaPath = path.resolve(__dirname, "..", "db", "schema.sql");

async function seedDefaults(client) {
  await client.query(
    `
      INSERT INTO system_configuration (key, value, description)
      VALUES
        ('risk.thresholds', '{"low": 30, "medium": 60, "high": 85}', 'Default risk engine thresholds'),
        ('authentication.defaultModalities', '["face"]', 'Default modalities for low-risk authentication'),
        ('monitoring.retentionDays', '90', 'Default event monitoring retention period'),
        ('accessController.settings', '{"mode": "simulator", "webhookUrl": null, "authToken": null, "adapter": "local_simulated_relay"}', 'Default access controller integration settings'),
        ('decision.thresholds', '{"allow": 75, "review": 55}', 'Default decision engine thresholds')
      ON CONFLICT (key) DO NOTHING
    `
  );

  await client.query(
    `
      INSERT INTO modality_selection_rules (
        name,
        minimum_risk_score,
        maximum_risk_score,
        selected_modalities,
        description
      )
      VALUES
        ('low-risk-default', 0, 39.99, ARRAY['face']::modality_type[], 'Low risk face-first authentication'),
        ('medium-risk-step-up', 40, 69.99, ARRAY['face', 'gait']::modality_type[], 'Medium risk multimodal step-up'),
        ('high-risk-strong', 70, 100, ARRAY['face', 'gait']::modality_type[], 'High risk multimodal strong authentication')
      ON CONFLICT (name) DO NOTHING
    `
  );

  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || (
    process.env.ADMIN_PASSWORD ? await bcrypt.hash(process.env.ADMIN_PASSWORD, 12) : null
  );

  if (process.env.ADMIN_USERNAME && adminPasswordHash) {
    await client.query(
      `
        INSERT INTO app_users (username, password_hash, full_name, email, role)
        VALUES ($1, $2, $3, $4, 'administrator')
        ON CONFLICT (username) DO NOTHING
      `,
      [
        process.env.ADMIN_USERNAME,
        adminPasswordHash,
        process.env.ADMIN_FULL_NAME || "System Administrator",
        process.env.ADMIN_EMAIL || null
      ]
    );
  }
}

async function initializeDatabase() {
  const schema = fs.readFileSync(schemaPath, "utf8");
  const client = await getClient();

  try {
    await client.query("BEGIN");
    await client.query(schema);
    await seedDefaults(client);
    await client.query("COMMIT");
    console.log("AMBS database initialized successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

initializeDatabase()
  .catch((error) => {
    console.error("Failed to initialize the AMBS database.");
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closePool();
  });
