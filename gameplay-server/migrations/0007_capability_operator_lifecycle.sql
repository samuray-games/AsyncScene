-- Chat 03B2: trusted operator revoke/replace lifecycle.
-- Historical SHA-256 digests are retained indefinitely so a bearer value can
-- never be reissued after its capability row changes or is deleted.
CREATE TABLE gameplay_capability_digest_history (
  token_sha256 TEXT NOT NULL PRIMARY KEY CHECK (length(token_sha256) = 64)
);

INSERT INTO gameplay_capability_digest_history(token_sha256)
SELECT token_sha256 FROM gameplay_battle_capabilities;

CREATE TRIGGER trg_gameplay_capability_identity_immutable
BEFORE UPDATE OF battle_id, side, participant_id ON gameplay_battle_capabilities
WHEN NEW.battle_id IS NOT OLD.battle_id
  OR NEW.side IS NOT OLD.side
  OR NEW.participant_id IS NOT OLD.participant_id
BEGIN
  SELECT RAISE(ABORT, 'CAPABILITY_IDENTITY_IMMUTABLE');
END;

CREATE TRIGGER trg_gameplay_capability_digest_history_no_update
BEFORE UPDATE ON gameplay_capability_digest_history
BEGIN
  SELECT RAISE(ABORT, 'CAPABILITY_DIGEST_HISTORY_IMMUTABLE');
END;

CREATE TRIGGER trg_gameplay_capability_digest_history_no_delete
BEFORE DELETE ON gameplay_capability_digest_history
BEGIN
  SELECT RAISE(ABORT, 'CAPABILITY_DIGEST_HISTORY_IMMUTABLE');
END;

-- Stop INSERT OR REPLACE from silently deleting an existing history row.
CREATE TRIGGER trg_gameplay_capability_digest_history_no_replace
BEFORE INSERT ON gameplay_capability_digest_history
WHEN EXISTS (
  SELECT 1 FROM gameplay_capability_digest_history
  WHERE token_sha256 = NEW.token_sha256
)
BEGIN
  SELECT RAISE(ABORT, 'CAPABILITY_DIGEST_HISTORY_IMMUTABLE');
END;

CREATE TRIGGER trg_gameplay_capability_insert_digest_history_guard
BEFORE INSERT ON gameplay_battle_capabilities
WHEN EXISTS (
  SELECT 1 FROM gameplay_capability_digest_history
  WHERE token_sha256 = NEW.token_sha256
)
BEGIN
  SELECT RAISE(ABORT, 'CAPABILITY_DIGEST_REUSE');
END;

CREATE TRIGGER trg_gameplay_capability_insert_digest_history_record
AFTER INSERT ON gameplay_battle_capabilities
BEGIN
  INSERT INTO gameplay_capability_digest_history(token_sha256)
  VALUES (NEW.token_sha256);
END;

-- The only legal credential mutations advance exactly one generation:
-- active -> revoked keeps the digest; revoked -> active requires a fresh one.
-- A status flip or generation edit by itself cannot reactivate old access.
CREATE TRIGGER trg_gameplay_capability_operator_transition_guard
BEFORE UPDATE OF status, token_sha256, generation, participant_id ON gameplay_battle_capabilities
WHEN NOT (
  (NEW.status = OLD.status
   AND NEW.token_sha256 = OLD.token_sha256
   AND NEW.generation = OLD.generation
   AND NEW.participant_id = OLD.participant_id)
  OR
  (OLD.status = 'active' AND NEW.status = 'revoked'
   AND NEW.token_sha256 = OLD.token_sha256
   AND NEW.participant_id = OLD.participant_id
   AND OLD.generation < 9007199254740991
   AND NEW.generation = OLD.generation + 1)
  OR
  (NEW.status = 'active'
   AND NEW.token_sha256 <> OLD.token_sha256
   AND NEW.participant_id = OLD.participant_id
   AND OLD.generation < 9007199254740991
   AND NEW.generation = OLD.generation + 1)
)
BEGIN
  SELECT RAISE(ABORT, 'INVALID_CAPABILITY_OPERATOR_TRANSITION');
END;

CREATE TRIGGER trg_gameplay_capability_replace_digest_history_guard
BEFORE UPDATE OF token_sha256 ON gameplay_battle_capabilities
WHEN NEW.token_sha256 <> OLD.token_sha256 AND EXISTS (
  SELECT 1 FROM gameplay_capability_digest_history
  WHERE token_sha256 = NEW.token_sha256
)
BEGIN
  SELECT RAISE(ABORT, 'CAPABILITY_DIGEST_REUSE');
END;

CREATE TRIGGER trg_gameplay_capability_replace_digest_history_record
AFTER UPDATE OF token_sha256 ON gameplay_battle_capabilities
WHEN NEW.token_sha256 <> OLD.token_sha256
BEGIN
  INSERT INTO gameplay_capability_digest_history(token_sha256)
  VALUES (NEW.token_sha256);
END;
