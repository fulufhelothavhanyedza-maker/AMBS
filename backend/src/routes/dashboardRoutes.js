const express = require("express");
const { query } = require("../config/database");
const { asyncHandler } = require("../utils/http");

const router = express.Router();

router.get(
  "/summary",
  asyncHandler(async (request, response) => {
    const [users, subjects, attempts, decisions, events] = await Promise.all([
      query("SELECT COUNT(*)::int AS count FROM app_users"),
      query("SELECT COUNT(*)::int AS count FROM subjects"),
      query("SELECT COUNT(*)::int AS count FROM authentication_attempts"),
      query("SELECT COUNT(*)::int AS count FROM decisions"),
      query("SELECT COUNT(*)::int AS count FROM monitoring_events")
    ]);

    response.json({
      users: users.rows[0].count,
      subjects: subjects.rows[0].count,
      authenticationAttempts: attempts.rows[0].count,
      decisions: decisions.rows[0].count,
      monitoringEvents: events.rows[0].count
    });
  })
);

module.exports = router;
