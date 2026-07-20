const { query } = require("../config/database");

async function writeMonitoringEvent({
  eventType,
  severity = "info",
  sourceComponent,
  message,
  metadata = {}
}) {
  const result = await query(
    `
      INSERT INTO monitoring_events (
        event_type,
        severity,
        source_component,
        message,
        metadata
      )
      VALUES ($1, $2, $3, $4, $5::jsonb)
      RETURNING id, event_type, severity, source_component, message, metadata, created_at
    `,
    [eventType, severity, sourceComponent, message, JSON.stringify(metadata)]
  );

  return result.rows[0];
}

module.exports = {
  writeMonitoringEvent
};
