-- Chat05B P2 append-only correction for existing NPC fixture slots.
-- Preserves previously applied 0011; no destructive migrations or data rewrite.
-- Rejects duplicate slots even with PRAGMA recursive_triggers=0 and
-- INSERT OR REPLACE, independently of the existing DELETE trigger.
CREATE TRIGGER trg_gameplay_social_npc_ballot_no_replace
BEFORE INSERT ON gameplay_social_npc_ballots
WHEN EXISTS (
  SELECT 1
  FROM gameplay_social_npc_ballots AS existing
  WHERE existing.vote_id = NEW.vote_id
    AND existing.fixture_slot = NEW.fixture_slot
)
BEGIN
  SELECT RAISE(ABORT, 'SOCIAL_NPC_BALLOT_IMMUTABLE');
END;
