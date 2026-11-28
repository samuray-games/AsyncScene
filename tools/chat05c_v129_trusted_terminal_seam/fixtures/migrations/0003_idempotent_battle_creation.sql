-- Chat 03B2: durable create idempotency and encrypted capability recovery.
-- Plain capability tokens and caller idempotency keys are never persisted.
CREATE TABLE gameplay_battle_creations (
  idempotency_key_sha256 TEXT PRIMARY KEY CHECK (length(idempotency_key_sha256) = 64),
  request_fingerprint_sha256 TEXT NOT NULL CHECK (length(request_fingerprint_sha256) = 64),
  battle_id TEXT NOT NULL UNIQUE REFERENCES gameplay_battles(battle_id) ON DELETE RESTRICT,
  deadline_at_ms INTEGER NOT NULL CHECK (deadline_at_ms >= 0),
  recovery_key_version TEXT NOT NULL CHECK (length(recovery_key_version) BETWEEN 1 AND 64),
  recovery_nonce_base64url TEXT NOT NULL CHECK (length(recovery_nonce_base64url) = 16),
  capabilities_ciphertext_base64url TEXT NOT NULL CHECK (length(capabilities_ciphertext_base64url) BETWEEN 1 AND 4096),
  created_at_ms INTEGER NOT NULL CHECK (created_at_ms >= 0)
);
