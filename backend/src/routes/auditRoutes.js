const express = require("express");
const { asyncHandler } = require("../utils/http");
const { listAuditLogs } = require("../models/auditLogModel");

const router = express.Router();

router.get(
  "/logs",
  asyncHandler(async (request, response) => {
    response.json({ logs: await listAuditLogs(200) });
  })
);

module.exports = router;
