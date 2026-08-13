PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS telemetry_batches (
  batch_id TEXT PRIMARY KEY,
  contract_version INTEGER NOT NULL,
  schema_version INTEGER NOT NULL,
  cohort_id TEXT NOT NULL,
  anonymous_id TEXT NOT NULL,
  received_at INTEGER NOT NULL,
  submitted_event_count INTEGER NOT NULL,
  inserted_event_count INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS telemetry_events (
  event_id TEXT PRIMARY KEY,
  batch_id TEXT NOT NULL,
  schema_version INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  occurred_at INTEGER NOT NULL,
  received_at INTEGER NOT NULL,
  sequence INTEGER NOT NULL,
  monotonic_ms INTEGER NOT NULL,
  anonymous_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  page_view_id TEXT NOT NULL,
  screen_id TEXT,
  modal_id TEXT,
  question_id TEXT,
  cycle_id TEXT,
  action_id TEXT,
  choice_id TEXT,
  flow_id TEXT,
  state_id TEXT,
  from_state_id TEXT,
  to_state_id TEXT,
  battle_id TEXT,
  answer_id TEXT,
  outcome_id TEXT,
  reason_id TEXT,
  foreground_dwell_ms INTEGER,
  context_json TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  FOREIGN KEY (batch_id) REFERENCES telemetry_batches(batch_id)
);

CREATE INDEX IF NOT EXISTS idx_telemetry_events_received
  ON telemetry_events(received_at);
CREATE INDEX IF NOT EXISTS idx_telemetry_events_session
  ON telemetry_events(session_id, occurred_at, sequence);
CREATE INDEX IF NOT EXISTS idx_telemetry_events_type
  ON telemetry_events(event_type, occurred_at);
CREATE INDEX IF NOT EXISTS idx_telemetry_events_screen
  ON telemetry_events(screen_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_telemetry_events_flow
  ON telemetry_events(flow_id, state_id, occurred_at);
