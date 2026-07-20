const path = require("path");
const express = require("express");
const cors = require("cors");

const { closePool } = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const usersRoutes = require("./routes/usersRoutes");
const enrolmentRoutes = require("./routes/enrolmentRoutes");
const authenticationRoutes = require("./routes/authenticationRoutes");
const auditRoutes = require("./routes/auditRoutes");
const monitoringRoutes = require("./routes/monitoringRoutes");
const configurationRoutes = require("./routes/configurationRoutes");
const engineRoutes = require("./routes/engineRoutes");
const { requireAuth } = require("./middleware/auth");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.resolve(__dirname, "..", "..", "frontend")));
app.use("/css", express.static(path.resolve(__dirname, "..", "..", "css")));
app.use("/javascript", express.static(path.resolve(__dirname, "..", "..", "javascript")));
app.use("/images", express.static(path.resolve(__dirname, "..", "..", "images")));

app.get("/health", (request, response) => {
  response.json({ status: "ok", service: "ambs-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", requireAuth, dashboardRoutes);
app.use("/api/users", requireAuth, usersRoutes);
app.use("/api/enrolment", requireAuth, enrolmentRoutes);
app.use("/api/authentication", requireAuth, authenticationRoutes);
app.use("/api/audit", requireAuth, auditRoutes);
app.use("/api/monitoring", requireAuth, monitoringRoutes);
app.use("/api/configuration", requireAuth, configurationRoutes);
app.use("/api/engines", requireAuth, engineRoutes);

app.use((error, request, response, next) => {
  const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 500;
  const payload = { error: error.message || "Unexpected server error." };

  if (statusCode >= 500) {
    console.error(error);
  }

  response.status(statusCode).json(payload);
});

async function shutdown() {
  await closePool();
}

module.exports = { app, shutdown };
