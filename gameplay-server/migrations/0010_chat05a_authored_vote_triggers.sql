-- Chat05A atom 2: allow the single social vote to be triggered by DRAW, authored text, or both.
-- Rebuilds the v8 vote/ballot tables without deleting existing rows or editing applied migrations.

DROP TRIGGER trg_gameplay_cast_social_vote;
DROP VIEW gameplay_cast_social_vote;
DROP TRIGGER trg_gameplay_social_ballot_no_replace;
DROP TRIGGER trg_gameplay_social_ballot_authorization_guard;
DROP TRIGGER trg_gameplay_social_ballot_participant_guard;
DROP TRIGGER trg_gameplay_social_ballot_no_update;
DROP TRIGGER trg_gameplay_social_ballot_no_delete;
DROP TRIGGER trg_gameplay_social_vote_gate;
DROP TRIGGER trg_gameplay_social_vote_no_replace;
DROP TRIGGER trg_gameplay_social_vote_immutable;
DROP TRIGGER trg_gameplay_social_vote_no_delete;

ALTER TABLE gameplay_social_ballots RENAME TO gameplay_social_ballots_v8;
ALTER TABLE gameplay_social_votes RENAME TO gameplay_social_votes_v8;

CREATE TABLE gameplay_social_votes (
  vote_id TEXT NOT NULL PRIMARY KEY CHECK (length(vote_id) BETWEEN 1 AND 128),
  battle_id TEXT NOT NULL UNIQUE REFERENCES gameplay_battles(battle_id) ON DELETE RESTRICT,
  trigger_reason TEXT NOT NULL CHECK (trigger_reason IN ('DRAW','AUTHORED_TEXT','BOTH','NONE')),
  status TEXT NOT NULL CHECK (status IN ('open', 'closed')),
  created_at_ms INTEGER NOT NULL CHECK (
    typeof(created_at_ms) = 'integer'
    AND created_at_ms BETWEEN 0 AND 9007199254740991
  )
);

INSERT INTO gameplay_social_votes (vote_id,battle_id,trigger_reason,status,created_at_ms)
SELECT vote_id,battle_id,trigger_reason,status,created_at_ms FROM gameplay_social_votes_v8;

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


INSERT INTO gameplay_social_ballots
  (vote_id,person_id,choice,capability_token_sha256,capability_generation,cast_at_ms)
SELECT vote_id,person_id,choice,capability_token_sha256,capability_generation,cast_at_ms
FROM gameplay_social_ballots_v8;

DROP TABLE gameplay_social_ballots_v8;
DROP TABLE gameplay_social_votes_v8;

CREATE TRIGGER trg_gameplay_social_vote_gate
BEFORE INSERT ON gameplay_social_votes
WHEN NOT EXISTS (
  SELECT 1 FROM gameplay_battles b
  WHERE b.battle_id=NEW.battle_id
    AND json_extract(b.state_json,'$.phase')='revealed'
    AND json_extract(b.state_json,'$.socialVoteTrigger')=NEW.trigger_reason
    AND (SELECT COUNT(*) FROM gameplay_battle_persons p WHERE p.battle_id=NEW.battle_id)=2
    AND (
      (NEW.trigger_reason='DRAW'
        AND json_extract(b.state_json,'$.mechanicalOutcome')='DRAW'
        AND (
          (
            NOT EXISTS (SELECT 1 FROM gameplay_battle_text_catalogs c WHERE c.battle_id=NEW.battle_id)
            AND (SELECT COUNT(*) FROM gameplay_battle_text_commits t WHERE t.battle_id=NEW.battle_id)=0
          )
          OR (
            EXISTS (SELECT 1 FROM gameplay_battle_text_catalogs c WHERE c.battle_id=NEW.battle_id)
            AND (SELECT COUNT(*) FROM gameplay_battle_text_commits t WHERE t.battle_id=NEW.battle_id)=2
            AND NOT EXISTS (
              SELECT 1 FROM gameplay_battle_text_commits t WHERE t.battle_id=NEW.battle_id
                AND (t.attack_words_edited=1 OR t.defense_words_edited=1)
            )
          )
        )
      )
      OR (NEW.trigger_reason='AUTHORED_TEXT'
        AND json_extract(b.state_json,'$.mechanicalOutcome') IN ('A_WIN','B_WIN')
        AND (SELECT COUNT(*) FROM gameplay_battle_text_commits t WHERE t.battle_id=NEW.battle_id)=2
        AND EXISTS (
          SELECT 1 FROM gameplay_battle_text_commits t WHERE t.battle_id=NEW.battle_id
            AND (t.attack_words_edited=1 OR t.defense_words_edited=1)
        )
      )
      OR (NEW.trigger_reason='BOTH'
        AND json_extract(b.state_json,'$.mechanicalOutcome')='DRAW'
        AND (SELECT COUNT(*) FROM gameplay_battle_text_commits t WHERE t.battle_id=NEW.battle_id)=2
        AND EXISTS (
          SELECT 1 FROM gameplay_battle_text_commits t WHERE t.battle_id=NEW.battle_id
            AND (t.attack_words_edited=1 OR t.defense_words_edited=1)
        )
      )
    )
)
BEGIN
  SELECT RAISE(ABORT,'SOCIAL_VOTE_TRIGGER_NOT_MET');
END;

CREATE TRIGGER trg_gameplay_social_vote_no_replace
BEFORE INSERT ON gameplay_social_votes
WHEN EXISTS (SELECT 1 FROM gameplay_social_votes WHERE vote_id=NEW.vote_id OR battle_id=NEW.battle_id)
BEGIN
  SELECT RAISE(ABORT,'SOCIAL_VOTE_IMMUTABLE');
END;

CREATE TRIGGER trg_gameplay_social_vote_immutable
BEFORE UPDATE ON gameplay_social_votes
BEGIN
  SELECT RAISE(ABORT,'SOCIAL_VOTE_IMMUTABLE');
END;

CREATE TRIGGER trg_gameplay_social_vote_no_delete
BEFORE DELETE ON gameplay_social_votes
BEGIN
  SELECT RAISE(ABORT,'SOCIAL_VOTE_IMMUTABLE');
END;

CREATE TRIGGER trg_gameplay_social_ballot_no_replace
BEFORE INSERT ON gameplay_social_ballots
WHEN EXISTS (
  SELECT 1 FROM gameplay_social_ballots
  WHERE vote_id = NEW.vote_id AND person_id = NEW.person_id
)
BEGIN
  SELECT RAISE(ABORT, 'SOCIAL_BALLOT_IMMUTABLE');
END;

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
