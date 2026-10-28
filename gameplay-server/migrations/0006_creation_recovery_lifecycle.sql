-- Chat 03B2 creation-recovery lifecycle. D1-compatible SQLite.
-- Legacy 0003 records are not issuance proof and are deliberately CLOSED.
PRAGMA foreign_keys = ON;

CREATE TABLE gameplay_battle_creations_v6 (
  idempotency_key_sha256 TEXT PRIMARY KEY
    CHECK (length(idempotency_key_sha256) = 64),
  request_fingerprint_sha256 TEXT,
  lifecycle_state TEXT NOT NULL
    CHECK (lifecycle_state IN ('RECOVERABLE', 'CLOSED', 'TOMBSTONE')),
  battle_id TEXT UNIQUE REFERENCES gameplay_battles(battle_id) ON DELETE RESTRICT,
  deadline_at_ms INTEGER,
  recovery_key_version TEXT,
  recovery_nonce_base64url TEXT,
  capabilities_ciphertext_base64url TEXT,
  original_a_token_sha256 TEXT,
  original_a_generation INTEGER,
  original_b_token_sha256 TEXT,
  original_b_generation INTEGER,
  created_at_ms INTEGER,
  CHECK (
    (lifecycle_state = 'RECOVERABLE'
      AND request_fingerprint_sha256 IS NOT NULL
      AND length(request_fingerprint_sha256) = 64
      AND battle_id IS NOT NULL AND deadline_at_ms IS NOT NULL
      AND deadline_at_ms >= 0
      AND recovery_key_version IS NOT NULL
      AND length(recovery_key_version) BETWEEN 1 AND 64
      AND recovery_nonce_base64url IS NOT NULL
      AND length(recovery_nonce_base64url) = 16
      AND capabilities_ciphertext_base64url IS NOT NULL
      AND length(capabilities_ciphertext_base64url) BETWEEN 1 AND 4096
      AND original_a_token_sha256 IS NOT NULL AND length(original_a_token_sha256) = 64
      AND typeof(original_a_generation) = 'integer'
      AND original_a_generation BETWEEN 1 AND 9007199254740991
      AND original_b_token_sha256 IS NOT NULL AND length(original_b_token_sha256) = 64
      AND typeof(original_b_generation) = 'integer'
      AND original_b_generation BETWEEN 1 AND 9007199254740991
      AND created_at_ms IS NOT NULL AND created_at_ms >= 0)
    OR
    (lifecycle_state = 'CLOSED'
      AND request_fingerprint_sha256 IS NOT NULL
      AND length(request_fingerprint_sha256) = 64
      AND battle_id IS NOT NULL AND deadline_at_ms IS NOT NULL
      AND deadline_at_ms >= 0
      AND recovery_key_version IS NULL AND recovery_nonce_base64url IS NULL
      AND capabilities_ciphertext_base64url IS NULL
      AND original_a_token_sha256 IS NULL AND original_a_generation IS NULL
      AND original_b_token_sha256 IS NULL AND original_b_generation IS NULL
      AND created_at_ms IS NOT NULL AND created_at_ms >= 0)
    OR
    (lifecycle_state = 'TOMBSTONE'
      AND request_fingerprint_sha256 IS NULL AND battle_id IS NULL
      AND deadline_at_ms IS NULL AND recovery_key_version IS NULL
      AND recovery_nonce_base64url IS NULL AND capabilities_ciphertext_base64url IS NULL
      AND original_a_token_sha256 IS NULL AND original_a_generation IS NULL
      AND original_b_token_sha256 IS NULL AND original_b_generation IS NULL
      AND created_at_ms IS NULL)
  )
);

-- No historical generation value proves original credential issuance.
-- Preserve the idempotency digest, fingerprint, battle/deadline linkage and
-- creation timestamp, but erase every recovery field from every legacy row.
INSERT INTO gameplay_battle_creations_v6 (
  idempotency_key_sha256, request_fingerprint_sha256, lifecycle_state,
  battle_id, deadline_at_ms, recovery_key_version, recovery_nonce_base64url,
  capabilities_ciphertext_base64url, original_a_token_sha256,
  original_a_generation, original_b_token_sha256, original_b_generation,
  created_at_ms
)
SELECT idempotency_key_sha256, request_fingerprint_sha256, 'CLOSED',
       battle_id, deadline_at_ms, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
       created_at_ms
FROM gameplay_battle_creations;

DROP TABLE gameplay_battle_creations;
ALTER TABLE gameplay_battle_creations_v6 RENAME TO gameplay_battle_creations;
CREATE INDEX idx_gameplay_battle_creations_battle_state
  ON gameplay_battle_creations(battle_id, lifecycle_state);

-- New recoverable rows must bind to both currently active capabilities at the
-- exact digest and generation that were recorded as issued in this INSERT.
CREATE TRIGGER trg_chat03b2_creation_issue_proof
BEFORE INSERT ON gameplay_battle_creations
WHEN NEW.lifecycle_state = 'RECOVERABLE'
BEGIN
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM gameplay_battle_capabilities c
    WHERE c.battle_id = NEW.battle_id AND c.side = 'A'
      AND c.token_sha256 = NEW.original_a_token_sha256
      AND c.generation = NEW.original_a_generation AND c.status = 'active'
  ) OR NOT EXISTS (
    SELECT 1 FROM gameplay_battle_capabilities c
    WHERE c.battle_id = NEW.battle_id AND c.side = 'B'
      AND c.token_sha256 = NEW.original_b_token_sha256
      AND c.generation = NEW.original_b_generation AND c.status = 'active'
  ) THEN RAISE(ABORT, 'RECOVERY_ISSUANCE_PROOF_MISMATCH') END;
END;

-- Recovery identity and the original digest/generation pair cannot be rebound
-- while a row remains recoverable. Ciphertext fields remain ordinary stored
-- data so authenticated-decryption failures can be handled fail-closed.
CREATE TRIGGER trg_chat03b2_recoverable_identity_immutable
BEFORE UPDATE ON gameplay_battle_creations
WHEN OLD.lifecycle_state = 'RECOVERABLE' AND NEW.lifecycle_state = 'RECOVERABLE'
 AND (NEW.request_fingerprint_sha256 IS NOT OLD.request_fingerprint_sha256
   OR NEW.battle_id IS NOT OLD.battle_id
   OR NEW.created_at_ms IS NOT OLD.created_at_ms
   OR NEW.original_a_token_sha256 IS NOT OLD.original_a_token_sha256
   OR NEW.original_a_generation IS NOT OLD.original_a_generation
   OR NEW.original_b_token_sha256 IS NOT OLD.original_b_token_sha256
   OR NEW.original_b_generation IS NOT OLD.original_b_generation)
BEGIN
  SELECT RAISE(ABORT, 'RECOVERY_ORIGINAL_BINDING_MISMATCH');
END;

CREATE TRIGGER trg_chat03b2_creation_state_edges
BEFORE UPDATE OF lifecycle_state ON gameplay_battle_creations
WHEN NOT ((OLD.lifecycle_state = 'RECOVERABLE' AND NEW.lifecycle_state = 'CLOSED')
       OR (OLD.lifecycle_state = 'CLOSED' AND NEW.lifecycle_state = 'TOMBSTONE')
       OR OLD.lifecycle_state = NEW.lifecycle_state)
BEGIN
  SELECT RAISE(ABORT, 'INVALID_CREATION_STATE_EDGE');
END;

-- A tombstone is deliberately only the idempotency-key digest. No TTL or purge
-- policy is implied, and deletion remains blocked pending an explicit policy.
CREATE TRIGGER trg_chat03b2_creation_delete_blocked
BEFORE DELETE ON gameplay_battle_creations
BEGIN
  SELECT RAISE(ABORT, 'CREATION_DELETE_NOT_AUTHORIZED');
END;

CREATE TRIGGER trg_chat03b2_idempotency_digest_immutable
BEFORE UPDATE OF idempotency_key_sha256 ON gameplay_battle_creations
WHEN NEW.idempotency_key_sha256 IS NOT OLD.idempotency_key_sha256
BEGIN
  SELECT RAISE(ABORT, 'IDEMPOTENCY_DIGEST_IMMUTABLE');
END;

-- The receipt is inserted inside the same transition statement after the
-- battle CAS. A failed CAS rolls this trigger and closure back with it.
-- Participant command IDs are Worker-scoped as A:<id> or B:<id>. Scheduler
-- expiry is Worker-only and uses its fixed system:expire:<battle-id> ID.
CREATE TRIGGER trg_chat03b2_transition_closes_creation_recovery
AFTER INSERT ON gameplay_command_receipts
BEGIN
  UPDATE gameplay_battle_creations
  SET lifecycle_state = 'CLOSED',
      recovery_key_version = NULL, recovery_nonce_base64url = NULL,
      capabilities_ciphertext_base64url = NULL,
      original_a_token_sha256 = NULL, original_a_generation = NULL,
      original_b_token_sha256 = NULL, original_b_generation = NULL
  WHERE battle_id = NEW.battle_id AND lifecycle_state = 'RECOVERABLE'
    AND (
      NEW.command_id GLOB 'A:*' OR NEW.command_id GLOB 'B:*'
      OR (NEW.command_id = 'system:expire:' || NEW.battle_id
          AND (SELECT phase FROM gameplay_battles WHERE battle_id = NEW.battle_id) = 'expired')
    );
END;

-- Digest rotation, participant reassignment, generation change, revocation,
-- or deletion closes recovery in the same SQLite statement/transaction.
CREATE TRIGGER trg_chat03b2_capability_change_closes_recovery
AFTER UPDATE OF token_sha256, participant_id, status, generation
ON gameplay_battle_capabilities
WHEN NEW.token_sha256 IS NOT OLD.token_sha256
  OR NEW.participant_id IS NOT OLD.participant_id
  OR NEW.status IS NOT OLD.status
  OR NEW.generation IS NOT OLD.generation
BEGIN
  UPDATE gameplay_battle_creations
  SET lifecycle_state = 'CLOSED',
      recovery_key_version = NULL, recovery_nonce_base64url = NULL,
      capabilities_ciphertext_base64url = NULL,
      original_a_token_sha256 = NULL, original_a_generation = NULL,
      original_b_token_sha256 = NULL, original_b_generation = NULL
  WHERE battle_id = NEW.battle_id AND lifecycle_state = 'RECOVERABLE';
END;

CREATE TRIGGER trg_chat03b2_capability_delete_closes_recovery
AFTER DELETE ON gameplay_battle_capabilities
BEGIN
  UPDATE gameplay_battle_creations
  SET lifecycle_state = 'CLOSED',
      recovery_key_version = NULL, recovery_nonce_base64url = NULL,
      capabilities_ciphertext_base64url = NULL,
      original_a_token_sha256 = NULL, original_a_generation = NULL,
      original_b_token_sha256 = NULL, original_b_generation = NULL
  WHERE battle_id = OLD.battle_id AND lifecycle_state = 'RECOVERABLE';
END;
