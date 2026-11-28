-- Participant writes must pass capability validation in the same statement as
-- the existing CAS, receipt, and outbox mutation. The Worker-only scheduler
-- continues to use gameplay_apply_transition directly; public HTTP routes must
-- never accept caller-selected transition views or actor types.
--
-- Historical generation=1 remains schema initialization metadata, not proof
-- of original credential issuance. This migration does not close the separate
-- 0003 encrypted creation replay lifecycle; coordinated lifecycle closure is
-- required before any deployment.
CREATE VIEW gameplay_apply_participant_transition AS SELECT
  NULL AS battle_id,
  NULL AS expected_version,
  NULL AS command_id,
  NULL AS fingerprint,
  NULL AS receipt_code,
  NULL AS receipt_event_ids_json,
  NULL AS next_state_json,
  NULL AS events_json,
  NULL AS trusted_now_ms,
  NULL AS capability_side,
  NULL AS capability_token_sha256,
  NULL AS expected_generation
WHERE 0;

CREATE TRIGGER trg_gameplay_apply_participant_transition
INSTEAD OF INSERT ON gameplay_apply_participant_transition
BEGIN
  SELECT CASE WHEN
    typeof(NEW.capability_side) IS NOT 'text'
    OR NEW.capability_side NOT IN ('A', 'B')
    OR typeof(NEW.capability_token_sha256) IS NOT 'text'
    OR length(NEW.capability_token_sha256) != 64
    OR typeof(NEW.expected_generation) NOT IN ('integer', 'real')
    OR NEW.expected_generation IS NOT CAST(NEW.expected_generation AS INTEGER)
    OR NEW.expected_generation < 1
    OR NEW.expected_generation > 9007199254740991
    OR NOT EXISTS (
      SELECT 1
      FROM gameplay_battle_capabilities AS c
      JOIN gameplay_battles AS b ON b.battle_id = c.battle_id
      WHERE c.battle_id = NEW.battle_id
        AND c.side = NEW.capability_side
        AND c.token_sha256 = NEW.capability_token_sha256
        AND c.status = 'active'
        AND c.generation = NEW.expected_generation
        AND json_extract(b.state_json,
          '$.participants.' || c.side || '.id') = c.participant_id
    )
  THEN RAISE(ABORT, 'INVALID_CAPABILITY') END;

  INSERT INTO gameplay_apply_transition (
    battle_id,expected_version,command_id,fingerprint,receipt_code,
    receipt_event_ids_json,next_state_json,events_json,trusted_now_ms
  ) VALUES (
    NEW.battle_id,NEW.expected_version,NEW.command_id,NEW.fingerprint,NEW.receipt_code,
    NEW.receipt_event_ids_json,NEW.next_state_json,NEW.events_json,NEW.trusted_now_ms
  );
END;
