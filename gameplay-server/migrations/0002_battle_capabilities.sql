-- Chat 03B2 alpha-only capability authentication; never use telemetry IDs.
-- Tokens are high-entropy random bearer secrets issued only by trusted bootstrap.
-- Only SHA-256 digests are persisted. Full account identity is NOT implemented.
CREATE TABLE gameplay_battle_capabilities (
  battle_id TEXT NOT NULL REFERENCES gameplay_battles(battle_id) ON DELETE RESTRICT,
  side TEXT NOT NULL CHECK (side IN ('A', 'B')),
  participant_id TEXT NOT NULL CHECK (length(participant_id) BETWEEN 1 AND 128),
  token_sha256 TEXT NOT NULL UNIQUE CHECK (length(token_sha256) = 64),
  created_at_ms INTEGER NOT NULL CHECK (created_at_ms >= 0),
  PRIMARY KEY (battle_id, side)
);
CREATE INDEX idx_gameplay_battle_capabilities_lookup
  ON gameplay_battle_capabilities(token_sha256, battle_id);
