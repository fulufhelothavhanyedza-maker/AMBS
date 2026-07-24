-- Backfill missing controller adapter metadata into persisted device-state rows.

UPDATE controller_device_state AS cds
SET last_command = cds.last_command || jsonb_build_object(
  'adapter', cde.metadata ->> 'adapter'
)
FROM controller_dispatch_events AS cde
WHERE cds.last_event_id = cde.id
  AND COALESCE(cds.last_command ->> 'adapter', '') = ''
  AND COALESCE(cde.metadata ->> 'adapter', '') <> '';