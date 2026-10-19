-- Chat 03B1: isolated gameplay-state storage. NOT a telemetry migration.
-- D1-compatible SQLite; no backend is deployed by adding this file.
PRAGMA foreign_keys = ON;

CREATE TABLE gameplay_battles (
  battle_id TEXT NOT NULL PRIMARY KEY,
  version INTEGER NOT NULL CHECK (version >= 0),
  rules_version TEXT NOT NULL CHECK (rules_version = 'tactical_v1'),
  phase TEXT NOT NULL,
  state_json TEXT NOT NULL CHECK (json_valid(state_json)),
  created_at_ms INTEGER NOT NULL,
  updated_at_ms INTEGER NOT NULL
);

CREATE TABLE gameplay_command_receipts (
  battle_id TEXT NOT NULL REFERENCES gameplay_battles(battle_id) ON DELETE RESTRICT,
  command_id TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  code TEXT NOT NULL,
  event_ids_json TEXT NOT NULL CHECK (json_valid(event_ids_json) AND json_type(event_ids_json) = 'array'),
  recorded_version INTEGER NOT NULL,
  PRIMARY KEY (battle_id, command_id)
);

CREATE TABLE gameplay_event_outbox (
  event_id TEXT NOT NULL PRIMARY KEY,
  battle_id TEXT NOT NULL REFERENCES gameplay_battles(battle_id) ON DELETE RESTRICT,
  version INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  payload_json TEXT NOT NULL CHECK (json_valid(payload_json)),
  created_at_ms INTEGER NOT NULL,
  published_at_ms INTEGER
);
CREATE INDEX idx_gameplay_outbox_pending ON gameplay_event_outbox(published_at_ms, created_at_ms);

-- The trigger runs as ONE atomic SQL statement. D1 batch() alone is not a
-- compare-and-swap: a zero-row UPDATE is not a SQL error and does not roll back.
CREATE VIEW gameplay_apply_transition AS SELECT
  NULL AS battle_id,
  NULL AS expected_version,
  NULL AS command_id,
  NULL AS fingerprint,
  NULL AS receipt_code,
  NULL AS receipt_event_ids_json,
  NULL AS next_state_json,
  NULL AS events_json,
  NULL AS trusted_now_ms
WHERE 0;

CREATE TRIGGER trg_gameplay_apply_transition
INSTEAD OF INSERT ON gameplay_apply_transition
BEGIN
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM gameplay_battles
    WHERE battle_id = NEW.battle_id AND version = NEW.expected_version
  ) THEN RAISE(ABORT, 'VERSION_CONFLICT') END;

  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM gameplay_command_receipts
    WHERE battle_id = NEW.battle_id AND command_id = NEW.command_id
  ) THEN RAISE(ABORT, 'COMMAND_ID_REUSE') END;

  SELECT CASE WHEN
    -- Wrangler D1 Workers bind all JS Numbers as SQL REAL (including 0,
    -- 123); Python sqlite bindings may use INTEGER. Accept both only when
    -- mathematically integral and within JS's safe integer range.
    typeof(NEW.expected_version) NOT IN ('integer', 'real')
    OR NEW.expected_version IS NOT CAST(NEW.expected_version AS INTEGER)
    OR NEW.expected_version < 0
    OR NEW.expected_version >= 9007199254740991
    OR typeof(NEW.trusted_now_ms) NOT IN ('integer', 'real')
    OR NEW.trusted_now_ms IS NOT CAST(NEW.trusted_now_ms AS INTEGER)
    OR NEW.trusted_now_ms < 0
    OR NEW.trusted_now_ms > 9007199254740991
    OR typeof(NEW.command_id) != 'text'
    OR typeof(NEW.fingerprint) != 'text'
    OR COALESCE(json_valid(NEW.next_state_json), 0) != 1
    OR COALESCE(json_valid(NEW.receipt_event_ids_json), 0) != 1
    OR COALESCE(json_valid(NEW.events_json), 0) != 1
  THEN RAISE(ABORT, 'INVALID_JSON') END;

  SELECT CASE WHEN
    json_type(NEW.events_json) != 'array'
    OR json_type(NEW.receipt_event_ids_json) != 'array'
    OR json_extract(NEW.next_state_json, '$.version') IS NOT NEW.expected_version + 1
    OR json_extract(NEW.next_state_json, '$.battleId') IS NOT NEW.battle_id
    OR json_extract(NEW.next_state_json, '$.rulesVersion') IS NOT 'tactical_v1'
    OR json_array_length(NEW.events_json) != json_array_length(NEW.receipt_event_ids_json)
    -- A receipt is a bijection to new outbox events, never just one-way
    -- membership. All IDs must be unique, nonempty strings.
    OR EXISTS (
      SELECT 1 FROM json_each(NEW.receipt_event_ids_json) AS receipt_id
      WHERE receipt_id.type IS NOT 'text'
         OR length(receipt_id.value) = 0
    )
    OR (
      SELECT COUNT(DISTINCT value)
      FROM json_each(NEW.receipt_event_ids_json)
    ) != json_array_length(NEW.receipt_event_ids_json)
    -- Both sides must contain distinct IDs. This rejects duplicate outbox
    -- events before INSERT, with one consistent INVALID_TRANSITION result.
    OR (
      SELECT COUNT(DISTINCT json_extract(value, '$.eventId'))
      FROM json_each(NEW.events_json)
    ) != json_array_length(NEW.events_json)
    -- Equal cardinality, unique IDs on both sides and reverse membership
    -- establish the exact bijection without imposing array order.
    OR EXISTS (
      SELECT 1 FROM json_each(NEW.events_json) AS emitted
      WHERE json_type(emitted.value) IS NOT 'object'
         OR json_type(emitted.value, '$.eventId') IS NOT 'text'
         OR length(json_extract(emitted.value, '$.eventId')) = 0
         OR json_type(emitted.value, '$.version') IS NOT 'integer'
         OR json_extract(emitted.value, '$.version') IS NOT NEW.expected_version + 1
         OR json_type(emitted.value, '$.type') IS NOT 'text'
         OR length(trim(json_extract(emitted.value, '$.type'))) = 0
         OR json_type(emitted.value, '$.payload') IS NOT 'object'
         OR NOT EXISTS (
           SELECT 1 FROM json_each(NEW.receipt_event_ids_json) AS receipt_id
           WHERE receipt_id.value = json_extract(emitted.value, '$.eventId')
         )
    )
  THEN RAISE(ABORT, 'INVALID_TRANSITION') END;

  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM gameplay_battles AS b
    WHERE b.battle_id = NEW.battle_id
      AND (
        json_extract(b.state_json, '$.participants') IS NOT json_extract(NEW.next_state_json, '$.participants')
        OR json_extract(b.state_json, '$.deadlineAt') IS NOT json_extract(NEW.next_state_json, '$.deadlineAt')
        OR json_extract(b.state_json, '$.rulesVersion') IS NOT json_extract(NEW.next_state_json, '$.rulesVersion')
        OR json_extract(b.state_json, '$.createdAt') IS NOT json_extract(NEW.next_state_json, '$.createdAt')
      )
  ) THEN RAISE(ABORT, 'IMMUTABLE_SNAPSHOT') END;

  UPDATE gameplay_battles
  SET version = NEW.expected_version + 1,
      phase = json_extract(NEW.next_state_json, '$.phase'),
      state_json = NEW.next_state_json,
      updated_at_ms = NEW.trusted_now_ms
  WHERE battle_id = NEW.battle_id AND version = NEW.expected_version;

  INSERT INTO gameplay_command_receipts
    (battle_id, command_id, fingerprint, code, event_ids_json, recorded_version)
  VALUES
    (NEW.battle_id, NEW.command_id, NEW.fingerprint, NEW.receipt_code,
     NEW.receipt_event_ids_json, NEW.expected_version + 1);

  INSERT INTO gameplay_event_outbox
    (event_id, battle_id, version, event_type, payload_json, created_at_ms)
  SELECT
    json_extract(value, '$.eventId'),
    NEW.battle_id,
    json_extract(value, '$.version'),
    json_extract(value, '$.type'),
    json_extract(value, '$.payload'),
    NEW.trusted_now_ms
  FROM json_each(NEW.events_json);
END;
