-- Chat05A server-owned people, spectator capabilities, and one-vote/one-ballot constraints.
-- No names, contact details, raw bearer secrets, or telemetry data are stored.
-- This atom intentionally enables DRAW only. No authoritative authored-text store exists in this Worker.
PRAGMA foreign_keys = ON;

CREATE TABLE gameplay_persons (
  person_id TEXT NOT NULL PRIMARY KEY CHECK (length(person_id) BETWEEN 1 AND 64 AND person_id = trim(person_id)),
  created_at_ms INTEGER NOT NULL CHECK (
    typeof(created_at_ms) = 'integer'
    AND created_at_ms BETWEEN 0 AND 9007199254740991
  )
);

CREATE TABLE gameplay_person_registration_requests (
  idempotency_key_sha256 TEXT NOT NULL PRIMARY KEY CHECK (length(idempotency_key_sha256) = 64),
  person_id TEXT NOT NULL UNIQUE REFERENCES gameplay_persons(person_id) ON DELETE RESTRICT,
  created_at_ms INTEGER NOT NULL CHECK (
    typeof(created_at_ms) = 'integer'
    AND created_at_ms BETWEEN 0 AND 9007199254740991
  )
);

CREATE TRIGGER trg_gameplay_person_identity_immutable
BEFORE UPDATE ON gameplay_persons
BEGIN
  SELECT RAISE(ABORT, 'PERSON_IDENTITY_IMMUTABLE');
END;

CREATE TRIGGER trg_gameplay_person_no_delete
BEFORE DELETE ON gameplay_persons
BEGIN
  SELECT RAISE(ABORT, 'PERSON_IDENTITY_IMMUTABLE');
END;

CREATE TABLE gameplay_battle_persons (
  battle_id TEXT NOT NULL REFERENCES gameplay_battles(battle_id) ON DELETE RESTRICT,
  side TEXT NOT NULL CHECK (side IN ('A', 'B')),
  person_id TEXT NOT NULL REFERENCES gameplay_persons(person_id) ON DELETE RESTRICT,
  PRIMARY KEY (battle_id, side),
  UNIQUE (battle_id, person_id)
);

CREATE TRIGGER trg_gameplay_battle_persons_immutable
BEFORE UPDATE ON gameplay_battle_persons
BEGIN
  SELECT RAISE(ABORT, 'BATTLE_PERSON_IDENTITY_IMMUTABLE');
END;

CREATE TRIGGER trg_gameplay_battle_persons_no_delete
BEFORE DELETE ON gameplay_battle_persons
BEGIN
  SELECT RAISE(ABORT, 'BATTLE_PERSON_IDENTITY_IMMUTABLE');
END;

CREATE TABLE gameplay_battle_spectator_capabilities (
  battle_id TEXT NOT NULL REFERENCES gameplay_battles(battle_id) ON DELETE RESTRICT,
  person_id TEXT NOT NULL REFERENCES gameplay_persons(person_id) ON DELETE RESTRICT,
  token_sha256 TEXT NOT NULL UNIQUE CHECK (length(token_sha256) = 64),
  created_at_ms INTEGER NOT NULL CHECK (
    typeof(created_at_ms) = 'integer'
    AND created_at_ms BETWEEN 0 AND 9007199254740991
  ),
  status TEXT NOT NULL CHECK (status IN ('active', 'revoked')),
  generation INTEGER NOT NULL CHECK (
    typeof(generation) = 'integer'
    AND generation BETWEEN 1 AND 9007199254740991
  ),
  PRIMARY KEY (battle_id, person_id)
);

CREATE INDEX idx_gameplay_spectator_capability_lookup
  ON gameplay_battle_spectator_capabilities(battle_id, token_sha256, status, generation);

CREATE TRIGGER trg_gameplay_spectator_digest_history_guard
BEFORE INSERT ON gameplay_battle_spectator_capabilities
WHEN EXISTS (
  SELECT 1 FROM gameplay_capability_digest_history WHERE token_sha256 = NEW.token_sha256
)
BEGIN
  SELECT RAISE(ABORT, 'CAPABILITY_DIGEST_REUSE');
END;

CREATE TRIGGER trg_gameplay_spectator_digest_history_record
AFTER INSERT ON gameplay_battle_spectator_capabilities
BEGIN
  INSERT INTO gameplay_capability_digest_history(token_sha256) VALUES (NEW.token_sha256);
END;

CREATE TRIGGER trg_gameplay_spectator_identity_immutable
BEFORE UPDATE OF battle_id, person_id ON gameplay_battle_spectator_capabilities
WHEN NEW.battle_id IS NOT OLD.battle_id OR NEW.person_id IS NOT OLD.person_id
BEGIN
  SELECT RAISE(ABORT, 'SPECTATOR_IDENTITY_IMMUTABLE');
END;

CREATE TRIGGER trg_gameplay_spectator_operator_transition_guard
BEFORE UPDATE OF status, token_sha256, generation ON gameplay_battle_spectator_capabilities
WHEN NOT (
  (NEW.status = OLD.status
   AND NEW.token_sha256 = OLD.token_sha256
   AND NEW.generation = OLD.generation)
  OR
  (OLD.status = 'active' AND NEW.status = 'revoked'
   AND NEW.token_sha256 = OLD.token_sha256
   AND OLD.generation < 9007199254740991
   AND NEW.generation = OLD.generation + 1)
  OR
  (NEW.status = 'active'
   AND NEW.token_sha256 <> OLD.token_sha256
   AND OLD.generation < 9007199254740991
   AND NEW.generation = OLD.generation + 1)
)
BEGIN
  SELECT RAISE(ABORT, 'INVALID_SPECTATOR_CAPABILITY_TRANSITION');
END;

CREATE TRIGGER trg_gameplay_spectator_generation_monotonic
BEFORE UPDATE OF generation ON gameplay_battle_spectator_capabilities
WHEN NEW.generation < OLD.generation
BEGIN
  SELECT RAISE(ABORT, 'SPECTATOR_CAPABILITY_GENERATION_REGRESSION');
END;

CREATE TRIGGER trg_gameplay_spectator_digest_replace_guard
BEFORE UPDATE OF token_sha256 ON gameplay_battle_spectator_capabilities
WHEN NEW.token_sha256 <> OLD.token_sha256
  AND EXISTS (
    SELECT 1 FROM gameplay_capability_digest_history WHERE token_sha256 = NEW.token_sha256
  )
BEGIN
  SELECT RAISE(ABORT, 'CAPABILITY_DIGEST_REUSE');
END;

CREATE TRIGGER trg_gameplay_spectator_digest_replace_record
AFTER UPDATE OF token_sha256 ON gameplay_battle_spectator_capabilities
WHEN NEW.token_sha256 <> OLD.token_sha256
BEGIN
  INSERT INTO gameplay_capability_digest_history(token_sha256) VALUES (NEW.token_sha256);
END;

CREATE TRIGGER trg_gameplay_spectator_no_delete
BEFORE DELETE ON gameplay_battle_spectator_capabilities
BEGIN
  SELECT RAISE(ABORT, 'SPECTATOR_CAPABILITY_HISTORY_REQUIRED');
END;

CREATE TABLE gameplay_social_votes (
  vote_id TEXT NOT NULL PRIMARY KEY CHECK (length(vote_id) BETWEEN 1 AND 128),
  battle_id TEXT NOT NULL UNIQUE REFERENCES gameplay_battles(battle_id) ON DELETE RESTRICT,
  trigger_reason TEXT NOT NULL CHECK (trigger_reason = 'DRAW'),
  status TEXT NOT NULL CHECK (status IN ('open', 'closed')),
  created_at_ms INTEGER NOT NULL CHECK (
    typeof(created_at_ms) = 'integer'
    AND created_at_ms BETWEEN 0 AND 9007199254740991
  )
);

CREATE TRIGGER trg_gameplay_social_vote_gate
BEFORE INSERT ON gameplay_social_votes
WHEN NOT EXISTS (
  SELECT 1 FROM gameplay_battles b
  WHERE b.battle_id = NEW.battle_id
    AND json_extract(b.state_json, '$.phase') = 'revealed'
    AND NEW.trigger_reason = 'DRAW'
    AND json_extract(b.state_json, '$.mechanicalOutcome') = 'DRAW'
)
BEGIN
  SELECT RAISE(ABORT, 'SOCIAL_VOTE_TRIGGER_NOT_MET');
END;

CREATE TRIGGER trg_gameplay_social_vote_immutable
BEFORE UPDATE ON gameplay_social_votes
BEGIN
  SELECT RAISE(ABORT, 'SOCIAL_VOTE_IMMUTABLE');
END;

CREATE TRIGGER trg_gameplay_social_vote_no_delete
BEFORE DELETE ON gameplay_social_votes
BEGIN
  SELECT RAISE(ABORT, 'SOCIAL_VOTE_IMMUTABLE');
END;

CREATE TABLE gameplay_social_ballots (
  vote_id TEXT NOT NULL REFERENCES gameplay_social_votes(vote_id) ON DELETE RESTRICT,
  person_id TEXT NOT NULL REFERENCES gameplay_persons(person_id) ON DELETE RESTRICT,
  choice TEXT NOT NULL CHECK (choice IN ('A', 'B')),
  capability_token_sha256 TEXT NOT NULL CHECK (length(capability_token_sha256) = 64),
  capability_generation INTEGER NOT NULL CHECK (
    typeof(capability_generation) = 'integer'
    AND capability_generation BETWEEN 1 AND 9007199254740991
  ),
  cast_at_ms INTEGER NOT NULL CHECK (
    typeof(cast_at_ms) = 'integer'
    AND cast_at_ms BETWEEN 0 AND 9007199254740991
  ),
  PRIMARY KEY (vote_id, person_id)
);

CREATE TRIGGER trg_gameplay_social_ballot_authorization_guard
BEFORE INSERT ON gameplay_social_ballots
WHEN NOT EXISTS (
  SELECT 1
  FROM gameplay_social_votes v
  JOIN gameplay_battle_spectator_capabilities c
    ON c.battle_id = v.battle_id
   AND c.person_id = NEW.person_id
   AND c.token_sha256 = NEW.capability_token_sha256
   AND c.status = 'active'
   AND c.generation = NEW.capability_generation
  WHERE v.vote_id = NEW.vote_id
    AND v.status = 'open'
)
BEGIN
  SELECT RAISE(ABORT, 'INVALID_SPECTATOR_CAPABILITY');
END;

CREATE TRIGGER trg_gameplay_social_ballot_participant_guard
BEFORE INSERT ON gameplay_social_ballots
WHEN EXISTS (
  SELECT 1
  FROM gameplay_social_votes v
  JOIN gameplay_battle_persons p ON p.battle_id = v.battle_id
  WHERE v.vote_id = NEW.vote_id AND p.person_id = NEW.person_id
)
BEGIN
  SELECT RAISE(ABORT, 'PARTICIPANT_CANNOT_VOTE');
END;

CREATE TRIGGER trg_gameplay_social_ballot_no_update
BEFORE UPDATE ON gameplay_social_ballots
BEGIN
  SELECT RAISE(ABORT, 'SOCIAL_BALLOT_IMMUTABLE');
END;

CREATE TRIGGER trg_gameplay_social_ballot_no_delete
BEFORE DELETE ON gameplay_social_ballots
BEGIN
  SELECT RAISE(ABORT, 'SOCIAL_BALLOT_IMMUTABLE');
END;

-- The view derives personId from an active spectator bearer hash.
-- The caller never supplies or chooses the identity persisted in a ballot.
CREATE VIEW gameplay_cast_social_vote AS
SELECT NULL AS battle_id, NULL AS vote_id, NULL AS token_sha256,
       NULL AS expected_generation, NULL AS choice, NULL AS trusted_now_ms
WHERE 0;

CREATE TRIGGER trg_gameplay_cast_social_vote
INSTEAD OF INSERT ON gameplay_cast_social_vote
BEGIN
  SELECT CASE WHEN
    typeof(NEW.battle_id) IS NOT 'text'
    OR typeof(NEW.vote_id) IS NOT 'text'
    OR typeof(NEW.token_sha256) IS NOT 'text'
    OR length(NEW.token_sha256) != 64
    OR typeof(NEW.expected_generation) NOT IN ('integer', 'real')
    OR NEW.expected_generation IS NOT CAST(NEW.expected_generation AS INTEGER)
    OR NEW.expected_generation < 1
    OR NEW.expected_generation > 9007199254740991
    OR NEW.choice NOT IN ('A', 'B')
    OR typeof(NEW.trusted_now_ms) NOT IN ('integer', 'real')
    OR NEW.trusted_now_ms IS NOT CAST(NEW.trusted_now_ms AS INTEGER)
    OR NEW.trusted_now_ms < 0
    OR NEW.trusted_now_ms > 9007199254740991
  THEN RAISE(ABORT, 'INVALID_SOCIAL_BALLOT') END;

  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM gameplay_social_votes v
    WHERE v.vote_id = NEW.vote_id
      AND v.battle_id = NEW.battle_id
      AND v.status = 'open'
  ) THEN RAISE(ABORT, 'SOCIAL_VOTE_NOT_OPEN') END;

  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM gameplay_battle_spectator_capabilities c
    WHERE c.battle_id = NEW.battle_id
      AND c.token_sha256 = NEW.token_sha256
      AND c.status = 'active'
      AND c.generation = NEW.expected_generation
  ) THEN RAISE(ABORT, 'INVALID_SPECTATOR_CAPABILITY') END;

  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM gameplay_battle_spectator_capabilities c
    JOIN gameplay_battle_persons p
      ON p.battle_id = c.battle_id AND p.person_id = c.person_id
    WHERE c.battle_id = NEW.battle_id
      AND c.token_sha256 = NEW.token_sha256
      AND c.status = 'active'
      AND c.generation = NEW.expected_generation
  ) THEN RAISE(ABORT, 'PARTICIPANT_CANNOT_VOTE') END;

  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM gameplay_social_ballots ballot
    JOIN gameplay_battle_spectator_capabilities c
      ON c.person_id = ballot.person_id AND c.battle_id = NEW.battle_id
    WHERE ballot.vote_id = NEW.vote_id
      AND c.token_sha256 = NEW.token_sha256
      AND c.status = 'active'
      AND c.generation = NEW.expected_generation
  ) THEN RAISE(ABORT, 'BALLOT_ALREADY_CAST') END;

  INSERT INTO gameplay_social_ballots
    (vote_id,person_id,choice,capability_token_sha256,capability_generation,cast_at_ms)
  SELECT NEW.vote_id,c.person_id,NEW.choice,c.token_sha256,c.generation,
         CAST(NEW.trusted_now_ms AS INTEGER)
  FROM gameplay_battle_spectator_capabilities c
  WHERE c.battle_id = NEW.battle_id
    AND c.token_sha256 = NEW.token_sha256
    AND c.status = 'active'
    AND c.generation = NEW.expected_generation;
END;
