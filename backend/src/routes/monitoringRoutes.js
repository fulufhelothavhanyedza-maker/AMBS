const express = require("express");
const { query } = require("../config/database");
const { asyncHandler, createHttpError } = require("../utils/http");
const { writeMonitoringEvent } = require("../services/monitoringService");
const { listLocalControllerEvents, listLocalControllerDeviceStates } = require("../services/localControllerService");

const router = express.Router();

router.get(
  "/events",
  asyncHandler(async (request, response) => {
    const result = await query(
      `
        SELECT id, event_type, severity, source_component, message, metadata, created_at
        FROM monitoring_events
        ORDER BY created_at DESC
        LIMIT 250
      `
    );

    response.json({ events: result.rows });
  })
);

router.post(
  "/events",
  asyncHandler(async (request, response) => {
    const { eventType, sourceComponent, message, severity, metadata } = request.body;

    if (!eventType || !sourceComponent || !message) {
      throw createHttpError(400, "eventType, sourceComponent, and message are required.");
    }

    const event = await writeMonitoringEvent({
      eventType,
      sourceComponent,
      message,
      severity: severity || "info",
      metadata: metadata || {}
    });

    response.status(201).json({ event });
  })
);

router.get(
  "/controller/overview",
  asyncHandler(async (request, response) => {
    const limit = Number.parseInt(String(request.query.limit || "25"), 10);
    const safeLimit = Number.isFinite(limit) ? limit : 25;

    const [deviceStates, controllerEvents] = await Promise.all([
      listLocalControllerDeviceStates(safeLimit),
      listLocalControllerEvents(safeLimit)
    ]);

    response.json({
      deviceStates,
      controllerEvents
    });
  })
);

module.exports = router;
