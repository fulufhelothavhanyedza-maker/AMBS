-- Persist local controller dispatch events and current device state.

CREATE TABLE IF NOT EXISTS controller_dispatch_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_resource VARCHAR(150) NOT NULL,
  outcome VARCHAR(50) NOT NULL,
  controller_response VARCHAR(100) NOT NULL,
  access_point JSONB,
  command_payload JSONB NOT NULL DEFAULT '{}'::JSONB,
  device_state VARCHAR(50) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  delivered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS controller_device_state (
  target_resource VARCHAR(150) PRIMARY KEY,
  access_point JSONB,
  outcome VARCHAR(50) NOT NULL,
  state VARCHAR(50) NOT NULL,
  last_command JSONB NOT NULL DEFAULT '{}'::JSONB,
  last_event_id UUID REFERENCES controller_dispatch_events(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_controller_dispatch_events_target_resource ON controller_dispatch_events(target_resource);
CREATE INDEX IF NOT EXISTS idx_controller_dispatch_events_delivered_at ON controller_dispatch_events(delivered_at DESC);

DROP TRIGGER IF EXISTS trg_controller_device_state_updated_at ON controller_device_state;
CREATE TRIGGER trg_controller_device_state_updated_at
BEFORE UPDATE ON controller_device_state
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();