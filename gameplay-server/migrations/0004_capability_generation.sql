-- Additive capability metadata foundation. Existing digests are preserved.
-- Backfilled generation 1 records schema initialization only; it does not
-- establish when or how the original bearer credential was issued.
ALTER TABLE gameplay_battle_capabilities
  ADD COLUMN status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'revoked'));

ALTER TABLE gameplay_battle_capabilities
  ADD COLUMN generation INTEGER NOT NULL DEFAULT 1
    CHECK (
      typeof(generation) = 'integer'
      AND generation BETWEEN 1 AND 9007199254740991
    );

-- A SQL authorization fence must still read status and generation together
-- with the battle mutation. This guard only prevents persisted regression.
CREATE TRIGGER trg_gameplay_capability_generation_monotonic
BEFORE UPDATE OF generation ON gameplay_battle_capabilities
WHEN NEW.generation < OLD.generation
BEGIN
  SELECT RAISE(ABORT, 'CAPABILITY_GENERATION_REGRESSION');
END;
