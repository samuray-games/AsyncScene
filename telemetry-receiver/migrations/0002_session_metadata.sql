-- Additive session metadata only. Never stores IP addresses, device identifiers,
-- browser geolocation, or account/profile data.
CREATE TABLE IF NOT EXISTS telemetry_sessions (
  session_id TEXT PRIMARY KEY,
  anonymous_id TEXT NOT NULL,
  nickname TEXT,
  city TEXT,
  first_received_at INTEGER NOT NULL,
  last_received_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_telemetry_sessions_last_received
  ON telemetry_sessions(last_received_at);
