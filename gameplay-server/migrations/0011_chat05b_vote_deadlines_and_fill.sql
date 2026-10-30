-- Chat05B: immutable opening policy, server-time human ballot gate, and
-- separately-originated deterministic NPC fixture ballots.
-- Existing 0001-0010 rows are retained. Legacy open votes are configured once
-- by the Worker using the then-explicit policy settings; their original
-- created_at_ms remains the deadline origin.

CREATE TABLE gameplay_social_vote_deadlines (
  vote_id TEXT NOT NULL PRIMARY KEY
    REFERENCES gameplay_social_votes(vote_id) ON DELETE RESTRICT,
  opened_at_ms INTEGER NOT NULL CHECK (
    typeof(opened_at_ms)='integer' AND opened_at_ms BETWEEN 0 AND 9007199254740991
  ),
  duration_ms INTEGER CHECK (
    duration_ms IS NULL OR (typeof(duration_ms)='integer' AND duration_ms BETWEEN 1 AND 604800000)
  ),
  deadline_at_ms INTEGER CHECK (
    deadline_at_ms IS NULL OR (typeof(deadline_at_ms)='integer' AND deadline_at_ms BETWEEN 0 AND 9007199254740991)
  ),
  quorum INTEGER CHECK (
    quorum IS NULL OR (typeof(quorum)='integer' AND quorum BETWEEN 3 AND 101 AND quorum % 2 = 1)
  ),
  status TEXT NOT NULL CHECK (status IN ('unconfigured','open','closed','legacy_closed')),
  closed_at_ms INTEGER CHECK (
    closed_at_ms IS NULL OR (typeof(closed_at_ms)='integer' AND closed_at_ms BETWEEN 0 AND 9007199254740991)
  ),
  human_count INTEGER CHECK (human_count IS NULL OR (typeof(human_count)='integer' AND human_count >= 0)),
  npc_count INTEGER CHECK (npc_count IS NULL OR (typeof(npc_count)='integer' AND npc_count >= 0)),
  count_a INTEGER CHECK (count_a IS NULL OR (typeof(count_a)='integer' AND count_a >= 0)),
  count_b INTEGER CHECK (count_b IS NULL OR (typeof(count_b)='integer' AND count_b >= 0)),
  final_choice TEXT CHECK (final_choice IS NULL OR final_choice IN ('A','B')),
  CHECK (
    (status IN ('unconfigured','legacy_closed') AND duration_ms IS NULL
      AND deadline_at_ms IS NULL AND quorum IS NULL AND closed_at_ms IS NULL
      AND human_count IS NULL AND npc_count IS NULL AND count_a IS NULL
      AND count_b IS NULL AND final_choice IS NULL)
    OR
    (status='open' AND duration_ms IS NOT NULL AND deadline_at_ms IS NOT NULL
      AND deadline_at_ms=opened_at_ms+duration_ms
      AND quorum IS NOT NULL AND closed_at_ms IS NULL AND human_count IS NULL
      AND npc_count IS NULL AND count_a IS NULL AND count_b IS NULL AND final_choice IS NULL)
    OR
    (status='closed' AND duration_ms IS NOT NULL AND deadline_at_ms IS NOT NULL
      AND deadline_at_ms=opened_at_ms+duration_ms
      AND quorum IS NOT NULL AND closed_at_ms IS NOT NULL AND human_count IS NOT NULL
      AND npc_count IS NOT NULL AND count_a IS NOT NULL AND count_b IS NOT NULL
      AND final_choice IS NOT NULL)
  )
);

-- Do not delete or rebuild the Chat05A vote or ballot tables. Existing open
-- votes keep their original opening time and are configured once on first use.
INSERT INTO gameplay_social_vote_deadlines (vote_id,opened_at_ms,status)
SELECT vote_id,created_at_ms,CASE WHEN status='open' THEN 'unconfigured' ELSE 'legacy_closed' END
FROM gameplay_social_votes;

CREATE TABLE gameplay_social_npc_ballots (
  vote_id TEXT NOT NULL REFERENCES gameplay_social_vote_deadlines(vote_id) ON DELETE RESTRICT,
  fixture_slot INTEGER NOT NULL CHECK (typeof(fixture_slot)='integer' AND fixture_slot BETWEEN 1 AND 101),
  fixture_version TEXT NOT NULL CHECK (fixture_version='chat05b-deterministic-fixture-v1'),
  choice TEXT NOT NULL CHECK (choice IN ('A','B')),
  cast_at_ms INTEGER NOT NULL CHECK (
    typeof(cast_at_ms)='integer' AND cast_at_ms BETWEEN 0 AND 9007199254740991
  ),
  PRIMARY KEY (vote_id,fixture_slot)
);

CREATE TRIGGER trg_gameplay_social_vote_deadline_no_replace
BEFORE INSERT ON gameplay_social_vote_deadlines
WHEN EXISTS (SELECT 1 FROM gameplay_social_vote_deadlines WHERE vote_id=NEW.vote_id)
BEGIN
  SELECT RAISE(ABORT,'SOCIAL_VOTE_DEADLINE_IMMUTABLE');
END;

CREATE TRIGGER trg_gameplay_social_vote_deadline_open_gate
BEFORE INSERT ON gameplay_social_vote_deadlines
WHEN NOT EXISTS (
  SELECT 1 FROM gameplay_social_votes v
  WHERE v.vote_id=NEW.vote_id AND v.status='open' AND v.created_at_ms=NEW.opened_at_ms
) OR NEW.status!='open' OR NEW.duration_ms IS NULL OR NEW.quorum IS NULL
  OR NEW.deadline_at_ms IS NULL
  OR NEW.deadline_at_ms IS NOT (NEW.opened_at_ms+NEW.duration_ms)
BEGIN
  SELECT RAISE(ABORT,'SOCIAL_VOTE_DEADLINE_INVALID');
END;

CREATE TRIGGER trg_gameplay_social_vote_deadline_update_guard
BEFORE UPDATE ON gameplay_social_vote_deadlines
WHEN OLD.status='legacy_closed'
  OR OLD.status='closed'
  OR NEW.vote_id IS NOT OLD.vote_id
  OR NEW.opened_at_ms IS NOT OLD.opened_at_ms
  OR (OLD.status='open' AND (NEW.duration_ms IS NOT OLD.duration_ms
      OR NEW.deadline_at_ms IS NOT OLD.deadline_at_ms OR NEW.quorum IS NOT OLD.quorum))
  OR NOT (
    (OLD.status='unconfigured' AND NEW.status='open'
      AND NEW.duration_ms IS NOT NULL AND NEW.quorum IS NOT NULL
      AND NEW.deadline_at_ms IS NOT NULL
      AND NEW.deadline_at_ms=NEW.opened_at_ms+NEW.duration_ms
      AND NEW.closed_at_ms IS NULL AND NEW.human_count IS NULL AND NEW.npc_count IS NULL
      AND NEW.count_a IS NULL AND NEW.count_b IS NULL AND NEW.final_choice IS NULL
      AND (SELECT COUNT(*) FROM gameplay_social_ballots b WHERE b.vote_id=OLD.vote_id)<=NEW.quorum)
    OR
    (OLD.status='open' AND NEW.status='closed'
      AND NEW.closed_at_ms>=OLD.deadline_at_ms
      AND NEW.human_count=(SELECT COUNT(*) FROM gameplay_social_ballots b WHERE b.vote_id=OLD.vote_id)
      AND NEW.npc_count=(SELECT COUNT(*) FROM gameplay_social_npc_ballots n WHERE n.vote_id=OLD.vote_id)
      AND NEW.human_count+NEW.npc_count=OLD.quorum
      AND NEW.count_a=(SELECT COUNT(*) FROM gameplay_social_ballots b WHERE b.vote_id=OLD.vote_id AND b.choice='A')
        +(SELECT COUNT(*) FROM gameplay_social_npc_ballots n WHERE n.vote_id=OLD.vote_id AND n.choice='A')
      AND NEW.count_b=(SELECT COUNT(*) FROM gameplay_social_ballots b WHERE b.vote_id=OLD.vote_id AND b.choice='B')
        +(SELECT COUNT(*) FROM gameplay_social_npc_ballots n WHERE n.vote_id=OLD.vote_id AND n.choice='B')
      AND NEW.count_a+NEW.count_b=OLD.quorum
      AND NEW.count_a!=NEW.count_b
      AND ((NEW.final_choice='A' AND NEW.count_a>NEW.count_b)
        OR (NEW.final_choice='B' AND NEW.count_b>NEW.count_a)))
  )
BEGIN
  SELECT RAISE(ABORT,'SOCIAL_VOTE_CLOSURE_INVALID');
END;

CREATE TRIGGER trg_gameplay_social_vote_deadline_no_delete
BEFORE DELETE ON gameplay_social_vote_deadlines
BEGIN
  SELECT RAISE(ABORT,'SOCIAL_VOTE_DEADLINE_IMMUTABLE');
END;

CREATE TRIGGER trg_gameplay_social_ballot_deadline_guard
BEFORE INSERT ON gameplay_social_ballots
BEGIN
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM gameplay_social_vote_deadlines d
    WHERE d.vote_id=NEW.vote_id AND d.status='open' AND NEW.cast_at_ms<d.deadline_at_ms
  ) THEN RAISE(ABORT,'SOCIAL_VOTE_CLOSED_OR_DEADLINE') END;
  SELECT CASE WHEN (
    SELECT COUNT(*) FROM gameplay_social_ballots b WHERE b.vote_id=NEW.vote_id
  )+(
    SELECT COUNT(*) FROM gameplay_social_npc_ballots n WHERE n.vote_id=NEW.vote_id
  ) >= (
    SELECT quorum FROM gameplay_social_vote_deadlines d WHERE d.vote_id=NEW.vote_id
  ) THEN RAISE(ABORT,'SOCIAL_VOTE_QUORUM_REACHED') END;
END;

CREATE TRIGGER trg_gameplay_social_npc_ballot_gate
BEFORE INSERT ON gameplay_social_npc_ballots
WHEN NOT EXISTS (
  SELECT 1 FROM gameplay_social_vote_deadlines d
  WHERE d.vote_id=NEW.vote_id AND d.status='open'
    AND NEW.cast_at_ms>=d.deadline_at_ms
    AND NEW.fixture_version='chat05b-deterministic-fixture-v1'
    AND (SELECT COUNT(*) FROM gameplay_social_ballots b WHERE b.vote_id=NEW.vote_id)
      +(SELECT COUNT(*) FROM gameplay_social_npc_ballots n WHERE n.vote_id=NEW.vote_id)<d.quorum
)
BEGIN
  SELECT RAISE(ABORT,'SOCIAL_NPC_FILL_NOT_ALLOWED');
END;

CREATE TRIGGER trg_gameplay_social_npc_ballot_no_update
BEFORE UPDATE ON gameplay_social_npc_ballots
BEGIN
  SELECT RAISE(ABORT,'SOCIAL_NPC_BALLOT_IMMUTABLE');
END;

CREATE TRIGGER trg_gameplay_social_npc_ballot_no_delete
BEFORE DELETE ON gameplay_social_npc_ballots
BEGIN
  SELECT RAISE(ABORT,'SOCIAL_NPC_BALLOT_IMMUTABLE');
END;
