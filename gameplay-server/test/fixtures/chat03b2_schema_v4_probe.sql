-- SYNTHETIC-ONLY Chat03B2 schema-v4 feasibility probe.
-- This is executable SQLite fixture code, NOT a deployable migration.
-- Caller applies migrations 0001-0003, seeds synthetic rows, enables FK checks,
-- then executes this file. Foreign-key enforcement is never disabled.

BEGIN IMMEDIATE;

CREATE TEMP TABLE chat03b2_creation_rows_before AS
SELECT idempotency_key_sha256, request_fingerprint_sha256, battle_id,
       deadline_at_ms, recovery_key_version, recovery_nonce_base64url,
       capabilities_ciphertext_base64url, created_at_ms
FROM gameplay_battle_creations;

CREATE TEMP TABLE chat03b2_assertion (ok INTEGER NOT NULL CHECK (ok = 1));

CREATE TEMP TABLE chat03b2_battle_rows_before AS
SELECT battle_id, version, state_json FROM gameplay_battles;

CREATE TEMP TABLE chat03b2_capability_rows_before AS
SELECT battle_id, side, token_sha256 FROM gameplay_battle_capabilities;

CREATE TEMP TABLE chat03b2_receipt_rows_before AS
SELECT battle_id, command_id, fingerprint, code, event_ids_json, recorded_version
FROM gameplay_command_receipts;

CREATE TEMP TABLE chat03b2_outbox_rows_before AS
SELECT event_id, battle_id, version, event_type, payload_json
FROM gameplay_event_outbox;

CREATE TABLE gameplay_battle_creations_v4 (
  idempotency_key_sha256 TEXT PRIMARY KEY CHECK (length(idempotency_key_sha256) = 64),
  request_fingerprint_sha256 TEXT CHECK (request_fingerprint_sha256 IS NULL OR length(request_fingerprint_sha256) = 64),
  lifecycle_state TEXT NOT NULL CHECK (lifecycle_state IN ('RECOVERABLE', 'CLOSED', 'TOMBSTONE')),
  battle_id TEXT UNIQUE REFERENCES gameplay_battles(battle_id) ON DELETE RESTRICT,
  deadline_at_ms INTEGER,
  recovery_key_version TEXT,
  recovery_nonce_base64url TEXT,
  capabilities_ciphertext_base64url TEXT,
  recovery_generation INTEGER,
  created_at_ms INTEGER CHECK (created_at_ms IS NULL OR created_at_ms >= 0),
  purge_after_ms INTEGER,
  CHECK (purge_after_ms IS NULL OR purge_after_ms >= 0),
  CHECK (
    (lifecycle_state = 'RECOVERABLE'
      AND request_fingerprint_sha256 IS NOT NULL AND created_at_ms IS NOT NULL
      AND battle_id IS NOT NULL AND deadline_at_ms IS NOT NULL
      AND recovery_key_version IS NOT NULL AND recovery_nonce_base64url IS NOT NULL
      AND capabilities_ciphertext_base64url IS NOT NULL AND recovery_generation IS NOT NULL)
    OR
    (lifecycle_state = 'CLOSED'
      AND request_fingerprint_sha256 IS NOT NULL AND created_at_ms IS NOT NULL
      AND battle_id IS NOT NULL AND deadline_at_ms IS NOT NULL
      AND recovery_key_version IS NULL AND recovery_nonce_base64url IS NULL
      AND capabilities_ciphertext_base64url IS NULL AND recovery_generation IS NULL)
    OR
    (lifecycle_state = 'TOMBSTONE'
      AND request_fingerprint_sha256 IS NULL AND created_at_ms IS NULL
      AND battle_id IS NULL AND deadline_at_ms IS NULL
      AND recovery_key_version IS NULL AND recovery_nonce_base64url IS NULL
      AND capabilities_ciphertext_base64url IS NULL AND recovery_generation IS NULL)
  )
);

-- Existing v3 rows do not prove that recovery material was issued for the
-- capability digests and generation now present. Fail closed: retain only the
-- idempotency/fingerprint/battle linkage, and close every migrated row.
INSERT INTO gameplay_battle_creations_v4 (
  idempotency_key_sha256, request_fingerprint_sha256, lifecycle_state,
  battle_id, deadline_at_ms, recovery_key_version, recovery_nonce_base64url,
  capabilities_ciphertext_base64url, recovery_generation, created_at_ms, purge_after_ms
)
SELECT c.idempotency_key_sha256, c.request_fingerprint_sha256, 'CLOSED',
       c.battle_id, c.deadline_at_ms, NULL, NULL, NULL, NULL, c.created_at_ms, NULL
FROM gameplay_battle_creations c;

-- Verify data copies and idempotency digests before replacing the source.
INSERT INTO chat03b2_assertion
SELECT CASE WHEN
  (SELECT COUNT(*) FROM gameplay_battle_creations_v4) != (SELECT COUNT(*) FROM chat03b2_creation_rows_before)
  OR EXISTS (
    SELECT 1 FROM chat03b2_creation_rows_before old
    JOIN gameplay_battle_creations_v4 new USING (idempotency_key_sha256)
    WHERE old.request_fingerprint_sha256 != new.request_fingerprint_sha256
       OR old.battle_id != new.battle_id
       OR old.deadline_at_ms != new.deadline_at_ms
       OR old.created_at_ms != new.created_at_ms
  )
THEN 0 ELSE 1 END;

DROP TABLE gameplay_battle_creations;
ALTER TABLE gameplay_battle_creations_v4 RENAME TO gameplay_battle_creations;

CREATE INDEX idx_gameplay_battle_creations_battle_state
  ON gameplay_battle_creations(battle_id, lifecycle_state);
CREATE INDEX idx_gameplay_battle_creations_retention
  ON gameplay_battle_creations(purge_after_ms)
  WHERE lifecycle_state = 'TOMBSTONE' AND purge_after_ms IS NOT NULL;

-- Recovery is only available for the originally stored digests/generation.
CREATE TRIGGER trg_chat03b2_recovery_requires_original_capabilities
BEFORE UPDATE OF recovery_key_version, recovery_nonce_base64url, recovery_generation,
                 capabilities_ciphertext_base64url ON gameplay_battle_creations
WHEN OLD.lifecycle_state = 'RECOVERABLE'
BEGIN
  SELECT CASE WHEN NEW.lifecycle_state = 'RECOVERABLE' AND (
    NEW.battle_id IS NOT OLD.battle_id
    OR NEW.request_fingerprint_sha256 IS NOT OLD.request_fingerprint_sha256
    OR NEW.recovery_key_version IS NOT OLD.recovery_key_version
    OR NEW.recovery_nonce_base64url IS NOT OLD.recovery_nonce_base64url
    OR NEW.recovery_generation IS NOT OLD.recovery_generation
    OR NEW.capabilities_ciphertext_base64url IS NOT OLD.capabilities_ciphertext_base64url
  ) THEN RAISE(ABORT, 'RECOVERY_ORIGINAL_BINDING_MISMATCH') END;
END;

-- State transitions clear recovery material atomically. A live creation keeps
-- its battle; tombstoning clears it. Purge with NULL is a deliberate no-op.
CREATE TRIGGER trg_chat03b2_no_live_battle_delete
BEFORE DELETE ON gameplay_battles
WHEN EXISTS (SELECT 1 FROM gameplay_battle_creations c
             WHERE c.battle_id = OLD.battle_id
               AND c.lifecycle_state IN ('RECOVERABLE', 'CLOSED'))
BEGIN
  SELECT RAISE(ABORT, 'LIVE_CREATION_BLOCKS_BATTLE_DELETE');
END;

CREATE TRIGGER trg_chat03b2_creation_state_edges
BEFORE UPDATE OF lifecycle_state ON gameplay_battle_creations
WHEN NOT (
  (OLD.lifecycle_state = 'RECOVERABLE' AND NEW.lifecycle_state = 'CLOSED')
  OR (OLD.lifecycle_state = 'RECOVERABLE' AND NEW.lifecycle_state = 'TOMBSTONE')
  OR (OLD.lifecycle_state = 'CLOSED' AND NEW.lifecycle_state = 'TOMBSTONE')
  OR (OLD.lifecycle_state = NEW.lifecycle_state)
)
BEGIN
  SELECT RAISE(ABORT, 'INVALID_CREATION_STATE_EDGE');
END;

CREATE TRIGGER trg_chat03b2_recovery_close_shape
BEFORE UPDATE ON gameplay_battle_creations
WHEN NEW.lifecycle_state IN ('CLOSED', 'TOMBSTONE')
BEGIN
  SELECT CASE WHEN NEW.recovery_key_version IS NOT NULL
    OR NEW.recovery_nonce_base64url IS NOT NULL
    OR NEW.capabilities_ciphertext_base64url IS NOT NULL
    OR NEW.recovery_generation IS NOT NULL
  THEN RAISE(ABORT, 'CLOSED_RECOVERY_MATERIAL_PRESENT') END;
END;

-- Capability rotation/revocation and recovery closure share the caller's
-- transaction. If the caller rolls back the digest mutation, closure rolls back.
CREATE TRIGGER trg_chat03b2_capability_rotation_closes_recovery
AFTER UPDATE OF token_sha256, participant_id ON gameplay_battle_capabilities
BEGIN
  UPDATE gameplay_battle_creations SET lifecycle_state = 'CLOSED',
    recovery_key_version = NULL, recovery_nonce_base64url = NULL,
    capabilities_ciphertext_base64url = NULL, recovery_generation = NULL
  WHERE battle_id = NEW.battle_id AND lifecycle_state = 'RECOVERABLE';
END;

CREATE TRIGGER trg_chat03b2_capability_revocation_closes_recovery
AFTER DELETE ON gameplay_battle_capabilities
BEGIN
  UPDATE gameplay_battle_creations SET lifecycle_state = 'CLOSED',
    recovery_key_version = NULL, recovery_nonce_base64url = NULL,
    capabilities_ciphertext_base64url = NULL, recovery_generation = NULL
  WHERE battle_id = OLD.battle_id AND lifecycle_state = 'RECOVERABLE';
END;

CREATE TRIGGER trg_chat03b2_tombstone_cleanup
AFTER UPDATE OF lifecycle_state ON gameplay_battle_creations
WHEN NEW.lifecycle_state = 'TOMBSTONE' AND OLD.lifecycle_state != 'TOMBSTONE'
BEGIN
  DELETE FROM gameplay_command_receipts WHERE battle_id = OLD.battle_id;
  DELETE FROM gameplay_event_outbox WHERE battle_id = OLD.battle_id;
  DELETE FROM gameplay_battle_capabilities WHERE battle_id = OLD.battle_id;
END;

CREATE TRIGGER trg_chat03b2_tombstone_purge
BEFORE DELETE ON gameplay_battle_creations
WHEN OLD.lifecycle_state = 'TOMBSTONE'
 AND (OLD.purge_after_ms IS NULL OR OLD.purge_after_ms > CAST(strftime('%s','now') AS INTEGER) * 1000)
BEGIN
  SELECT RAISE(ABORT, 'TOMBSTONE_RETENTION_ACTIVE');
END;

CREATE TEMP TABLE chat03b2_probe_preservation (
  ok INTEGER NOT NULL CHECK (ok = 1)
);
INSERT INTO chat03b2_probe_preservation
SELECT CASE WHEN
  (SELECT COUNT(*) FROM gameplay_battles) = (SELECT COUNT(*) FROM chat03b2_battle_rows_before)
  AND (SELECT COUNT(*) FROM gameplay_battle_capabilities) = (SELECT COUNT(*) FROM chat03b2_capability_rows_before)
  AND (SELECT COUNT(*) FROM gameplay_command_receipts) = (SELECT COUNT(*) FROM chat03b2_receipt_rows_before)
  AND (SELECT COUNT(*) FROM gameplay_event_outbox) = (SELECT COUNT(*) FROM chat03b2_outbox_rows_before)
  AND NOT EXISTS (
    SELECT 1 FROM chat03b2_battle_rows_before old LEFT JOIN gameplay_battles new
      ON new.battle_id=old.battle_id AND new.version=old.version AND new.state_json=old.state_json
    WHERE new.battle_id IS NULL
  )
  AND NOT EXISTS (
    SELECT 1 FROM chat03b2_capability_rows_before old LEFT JOIN gameplay_battle_capabilities new
      ON new.battle_id=old.battle_id AND new.side=old.side AND new.token_sha256=old.token_sha256
    WHERE new.battle_id IS NULL
  )
  AND NOT EXISTS (
    SELECT 1 FROM chat03b2_receipt_rows_before old LEFT JOIN gameplay_command_receipts new
      ON new.battle_id=old.battle_id AND new.command_id=old.command_id
       AND new.fingerprint=old.fingerprint AND new.code=old.code
       AND new.event_ids_json=old.event_ids_json AND new.recorded_version=old.recorded_version
    WHERE new.battle_id IS NULL
  )
  AND NOT EXISTS (
    SELECT 1 FROM chat03b2_outbox_rows_before old LEFT JOIN gameplay_event_outbox new
      ON new.event_id=old.event_id AND new.battle_id=old.battle_id
       AND new.version=old.version AND new.event_type=old.event_type
       AND new.payload_json=old.payload_json
    WHERE new.event_id IS NULL
  )
THEN 1 ELSE 0 END;

COMMIT;
