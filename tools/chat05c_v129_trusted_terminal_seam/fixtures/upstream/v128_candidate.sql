-- V128 EARLY CANDIDATE (DRAFT, UNTESTED). Exact original SQL 0001-0012 remains unchanged.
-- NOT an authorized repository migration; not native D1 or Worker SQL.
-- v128_* issuer, binding and occupancy tables are SYNTHETIC TEST FIXTURES, NOT existing project authority.
-- Effective CANCEL disposition is an owner-unapproved proposal, original 0011 remains unchanged.
-- All patch DDL is non-production and cannot validate real issuer, native D1 or independent rollback witness.
-- Real issuer validation, native transactional topology, grant epoch and external rollback witness remain BLOCKED.

-- Deliberately synthetic issuer verification registry. Real proof requires server-only privileged
-- authority established OUTSIDE SQL; inserting into this fixture is NOT authentication.
CREATE TABLE v128_issuer_fixture (
  battle_id TEXT NOT NULL REFERENCES gameplay_battles(battle_id),
  kind TEXT NOT NULL CHECK (kind IN ('FINAL','CANCEL')),
  vote_id TEXT NOT NULL REFERENCES gameplay_social_votes(vote_id),
  proof_digest TEXT NOT NULL CHECK (length(proof_digest)>0),
  authorized_generation INTEGER NOT NULL,
  expires_at_ms INTEGER NOT NULL,
  PRIMARY KEY(battle_id,kind)
);
CREATE TABLE v128_binding_fixture (
  battle_id TEXT PRIMARY KEY REFERENCES gameplay_battles(battle_id),
  battle_generation INTEGER NOT NULL,
  side_a_person_id TEXT NOT NULL,
  side_b_person_id TEXT NOT NULL,
  side_a_binding_epoch INTEGER NOT NULL,
  side_b_binding_epoch INTEGER NOT NULL,
  side_a_occupancy_generation INTEGER NOT NULL,
  side_b_occupancy_generation INTEGER NOT NULL,
  CHECK(side_a_person_id <> side_b_person_id)
);
CREATE TABLE v128_occupancy_fixture (
  person_id TEXT NOT NULL,
  battle_id TEXT NOT NULL,
  reservation_generation INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('ACTIVE','RELEASED')),
  released_by_event_id TEXT,
  PRIMARY KEY(person_id,battle_id,reservation_generation),
  CHECK ((status='ACTIVE' AND released_by_event_id IS NULL) OR
         (status='RELEASED' AND released_by_event_id IS NOT NULL))
);
CREATE TABLE v128_terminal_proposal (
  battle_id TEXT NOT NULL PRIMARY KEY REFERENCES gameplay_battles(battle_id),
  kind TEXT NOT NULL CHECK(kind IN ('FINAL','CANCEL')),
  source_system TEXT NOT NULL CHECK(source_system='gameplay-server'),
  canonical_event_id TEXT NOT NULL UNIQUE,
  commit_identity TEXT NOT NULL UNIQUE,
  command_id TEXT NOT NULL,
  fingerprint TEXT NOT NULL,
  receipt_digest TEXT NOT NULL,
  issuer_proof_digest TEXT NOT NULL,
  expected_version INTEGER NOT NULL,
  battle_generation INTEGER NOT NULL,
  side_a_person_id TEXT NOT NULL,
  side_b_person_id TEXT NOT NULL,
  side_a_binding_epoch INTEGER NOT NULL,
  side_b_binding_epoch INTEGER NOT NULL,
  side_a_occupancy_generation INTEGER NOT NULL,
  side_b_occupancy_generation INTEGER NOT NULL,
  vote_id TEXT NOT NULL REFERENCES gameplay_social_votes(vote_id),
  social_choice TEXT CHECK(social_choice IN ('A','B')),
  mechanical_outcome TEXT NOT NULL,
  recognized_outcome TEXT,
  trusted_now_ms INTEGER NOT NULL,
  CHECK ((kind='FINAL' AND vote_id IS NOT NULL AND social_choice IS NOT NULL AND recognized_outcome IS NOT NULL)
     OR (kind='CANCEL' AND vote_id IS NOT NULL AND social_choice IS NULL AND recognized_outcome IS NULL)),
  CHECK (side_a_person_id <> side_b_person_id)
);
CREATE TABLE v128_vote_terminal_disposition (
  vote_id TEXT NOT NULL PRIMARY KEY REFERENCES gameplay_social_votes(vote_id),
  battle_id TEXT NOT NULL UNIQUE REFERENCES v128_terminal_proposal(battle_id),
  effective_state TEXT NOT NULL CHECK(effective_state IN ('FINAL_CLOSED','CANCEL_NO_RESULT'))
);
CREATE TABLE v128_settlement_intent (
  battle_id TEXT PRIMARY KEY REFERENCES v128_terminal_proposal(battle_id),
  canonical_event_id TEXT NOT NULL UNIQUE,
  effect_key TEXT NOT NULL UNIQUE,
  payload_digest TEXT NOT NULL
);

-- DO NOT rely on DELETE triggers to stop REPLACE: 0011 demonstrated that
-- recursive_triggers=OFF can delete a row without firing DELETE hooks.
CREATE TRIGGER v128_battle_no_replace BEFORE INSERT ON gameplay_battles
WHEN EXISTS(SELECT 1 FROM gameplay_battles WHERE battle_id=NEW.battle_id)
BEGIN SELECT RAISE(ABORT,'V128_BATTLE_NO_REPLACE'); END;
CREATE TRIGGER v128_binding_no_replace BEFORE INSERT ON v128_binding_fixture
WHEN EXISTS(SELECT 1 FROM v128_binding_fixture WHERE battle_id=NEW.battle_id)
BEGIN SELECT RAISE(ABORT,'V128_BINDING_NO_REPLACE'); END;
CREATE TRIGGER v128_binding_no_update BEFORE UPDATE ON v128_binding_fixture
BEGIN SELECT RAISE(ABORT,'V128_BINDING_IMMUTABLE'); END;
CREATE TRIGGER v128_binding_no_delete BEFORE DELETE ON v128_binding_fixture
BEGIN SELECT RAISE(ABORT,'V128_BINDING_IMMUTABLE'); END;
CREATE TRIGGER v128_issuer_no_replace BEFORE INSERT ON v128_issuer_fixture
WHEN EXISTS(SELECT 1 FROM v128_issuer_fixture WHERE battle_id=NEW.battle_id AND kind=NEW.kind)
BEGIN SELECT RAISE(ABORT,'V128_ISSUER_NO_REPLACE'); END;
CREATE TRIGGER v128_issuer_no_update BEFORE UPDATE ON v128_issuer_fixture
BEGIN SELECT RAISE(ABORT,'V128_ISSUER_IMMUTABLE'); END;
CREATE TRIGGER v128_issuer_no_delete BEFORE DELETE ON v128_issuer_fixture
BEGIN SELECT RAISE(ABORT,'V128_ISSUER_IMMUTABLE'); END;
CREATE TRIGGER v128_occupancy_no_replace BEFORE INSERT ON v128_occupancy_fixture
WHEN EXISTS(SELECT 1 FROM v128_occupancy_fixture WHERE person_id=NEW.person_id AND battle_id=NEW.battle_id AND reservation_generation=NEW.reservation_generation)
BEGIN SELECT RAISE(ABORT,'V128_OCCUPANCY_NO_REPLACE'); END;
CREATE TRIGGER v128_terminal_no_replace BEFORE INSERT ON v128_terminal_proposal
WHEN EXISTS (SELECT 1 FROM v128_terminal_proposal t WHERE t.battle_id=NEW.battle_id OR t.canonical_event_id=NEW.canonical_event_id)
BEGIN SELECT RAISE(ABORT,'V128_TERMINAL_ALREADY_EXISTS'); END;
CREATE TRIGGER v128_terminal_no_update BEFORE UPDATE ON v128_terminal_proposal
BEGIN SELECT RAISE(ABORT,'V128_TERMINAL_IMMUTABLE'); END;
CREATE TRIGGER v128_terminal_no_delete BEFORE DELETE ON v128_terminal_proposal
BEGIN SELECT RAISE(ABORT,'V128_TERMINAL_IMMUTABLE'); END;
CREATE TRIGGER v128_vote_disposition_no_replace BEFORE INSERT ON v128_vote_terminal_disposition
WHEN EXISTS(SELECT 1 FROM v128_vote_terminal_disposition WHERE vote_id=NEW.vote_id OR battle_id=NEW.battle_id)
BEGIN SELECT RAISE(ABORT,'V128_VOTE_DISPOSITION_NO_REPLACE'); END;
CREATE TRIGGER v128_vote_disposition_no_update BEFORE UPDATE ON v128_vote_terminal_disposition
BEGIN SELECT RAISE(ABORT,'V128_VOTE_TERMINAL_IMMUTABLE'); END;
CREATE TRIGGER v128_vote_disposition_no_delete BEFORE DELETE ON v128_vote_terminal_disposition
BEGIN SELECT RAISE(ABORT,'V128_VOTE_TERMINAL_IMMUTABLE'); END;
CREATE TRIGGER v128_settlement_no_replace BEFORE INSERT ON v128_settlement_intent
WHEN EXISTS(SELECT 1 FROM v128_settlement_intent WHERE battle_id=NEW.battle_id OR canonical_event_id=NEW.canonical_event_id OR effect_key=NEW.effect_key)
BEGIN SELECT RAISE(ABORT,'V128_SETTLEMENT_NO_REPLACE'); END;
-- Disallow manufacturing an economic intent on CANCEL or for a different event,
-- even when bypassing the server writer with privileged direct SQL.
CREATE TRIGGER v128_settlement_semantic_gate BEFORE INSERT ON v128_settlement_intent
WHEN NOT EXISTS(
  SELECT 1 FROM v128_terminal_proposal t
  WHERE t.battle_id=NEW.battle_id AND t.kind='FINAL'
    AND t.canonical_event_id=NEW.canonical_event_id
    AND NEW.effect_key='settlement-intent:'||t.battle_id
    AND NEW.payload_digest=t.receipt_digest
)
BEGIN SELECT RAISE(ABORT,'V128_NO_SETTLEMENT_WITHOUT_FINAL'); END;
CREATE TRIGGER v128_settlement_no_update BEFORE UPDATE ON v128_settlement_intent
BEGIN SELECT RAISE(ABORT,'V128_SETTLEMENT_IMMUTABLE'); END;
CREATE TRIGGER v128_settlement_no_delete BEFORE DELETE ON v128_settlement_intent
BEGIN SELECT RAISE(ABORT,'V128_SETTLEMENT_IMMUTABLE'); END;

-- Prevent REPLACE bypass of existing slots and denial of durable receipt/payload tampering.
CREATE TRIGGER v128_receipt_no_replace BEFORE INSERT ON gameplay_command_receipts
WHEN EXISTS (SELECT 1 FROM gameplay_command_receipts r WHERE r.battle_id=NEW.battle_id AND r.command_id=NEW.command_id)
BEGIN SELECT RAISE(ABORT,'V128_RECEIPT_IMMUTABLE'); END;
CREATE TRIGGER v128_receipt_no_update BEFORE UPDATE ON gameplay_command_receipts
BEGIN SELECT RAISE(ABORT,'V128_RECEIPT_IMMUTABLE'); END;
CREATE TRIGGER v128_receipt_no_delete BEFORE DELETE ON gameplay_command_receipts
BEGIN SELECT RAISE(ABORT,'V128_RECEIPT_IMMUTABLE'); END;
-- No second command receipt or unrelated outbox event may be appended after terminal.
CREATE TRIGGER v128_receipt_after_terminal_gate BEFORE INSERT ON gameplay_command_receipts
WHEN EXISTS (
  SELECT 1 FROM v128_terminal_proposal t
  WHERE t.battle_id=NEW.battle_id AND t.command_id<>NEW.command_id
)
BEGIN SELECT RAISE(ABORT,'V128_POST_TERMINAL_RECEIPT'); END;
CREATE TRIGGER v128_outbox_after_terminal_gate BEFORE INSERT ON gameplay_event_outbox
WHEN EXISTS (
  SELECT 1 FROM v128_terminal_proposal t
  WHERE t.battle_id=NEW.battle_id AND t.canonical_event_id<>NEW.event_id
)
BEGIN SELECT RAISE(ABORT,'V128_POST_TERMINAL_OUTBOX'); END;
CREATE UNIQUE INDEX v128_one_terminal_outbox_per_battle
 ON gameplay_event_outbox(battle_id)
 WHERE event_type IN ('battle.finalized','battle.cancelled');
CREATE TRIGGER v128_outbox_no_replace BEFORE INSERT ON gameplay_event_outbox
WHEN EXISTS (SELECT 1 FROM gameplay_event_outbox e WHERE e.event_id=NEW.event_id)
BEGIN SELECT RAISE(ABORT,'V128_OUTBOX_IMMUTABLE'); END;
CREATE TRIGGER v128_outbox_payload_no_update BEFORE UPDATE OF event_id,battle_id,version,event_type,payload_json,created_at_ms ON gameplay_event_outbox
BEGIN SELECT RAISE(ABORT,'V128_OUTBOX_IMMUTABLE'); END;
CREATE TRIGGER v128_outbox_no_delete BEFORE DELETE ON gameplay_event_outbox
BEGIN SELECT RAISE(ABORT,'V128_OUTBOX_IMMUTABLE'); END;

-- Terminal events must be created under the same terminal row, even through the legacy 0001 transition view.
CREATE TRIGGER v128_terminal_outbox_gate BEFORE INSERT ON gameplay_event_outbox
WHEN NEW.event_type IN ('battle.finalized','battle.cancelled') AND NOT EXISTS (
  SELECT 1 FROM v128_terminal_proposal t
  WHERE t.battle_id=NEW.battle_id AND t.canonical_event_id=NEW.event_id
    AND ((t.kind='FINAL' AND NEW.event_type='battle.finalized')
      OR (t.kind='CANCEL' AND NEW.event_type='battle.cancelled'))
)
BEGIN SELECT RAISE(ABORT,'V128_TRUSTED_TERMINAL_ONLY'); END;
-- Freeze mechanical outcome from the REVEALED snapshot onward, not only after the terminal row.
CREATE TRIGGER v128_mechanical_after_reveal_immutable BEFORE UPDATE OF state_json ON gameplay_battles
WHEN OLD.phase IN ('revealed','final','cancelled') AND
 json_extract(NEW.state_json,'$.mechanicalOutcome') IS NOT json_extract(OLD.state_json,'$.mechanicalOutcome')
BEGIN SELECT RAISE(ABORT,'V128_MECHANICAL_OUTCOME_IMMUTABLE'); END;
CREATE TRIGGER v128_battle_terminal_admission BEFORE UPDATE ON gameplay_battles
WHEN NEW.phase IN ('final','cancelled') AND NOT EXISTS (
  SELECT 1 FROM v128_terminal_proposal t WHERE t.battle_id=NEW.battle_id
    AND t.expected_version=OLD.version
    AND ((t.kind='FINAL' AND NEW.phase='final') OR (t.kind='CANCEL' AND NEW.phase='cancelled'))
)
BEGIN SELECT RAISE(ABORT,'V128_TERMINAL_NOT_AUTHORIZED'); END;
CREATE TRIGGER v128_battle_after_terminal_no_change BEFORE UPDATE ON gameplay_battles
WHEN OLD.phase IN ('final','cancelled') AND EXISTS (
  SELECT 1 FROM v128_terminal_proposal WHERE battle_id=OLD.battle_id
)
BEGIN SELECT RAISE(ABORT,'V128_BATTLE_FROZEN'); END;

-- Check effective terminal disposition, not 0011.status alone: CANCEL may be before deadline.
CREATE TRIGGER v128_deadline_after_disposition_no_update BEFORE UPDATE ON gameplay_social_vote_deadlines
WHEN EXISTS (SELECT 1 FROM v128_vote_terminal_disposition x WHERE x.vote_id=OLD.vote_id)
BEGIN SELECT RAISE(ABORT,'V128_VOTE_DISPOSITION_IMMUTABLE'); END;
CREATE TRIGGER v128_new_vote_after_terminal_gate BEFORE INSERT ON gameplay_social_votes
WHEN EXISTS (SELECT 1 FROM v128_terminal_proposal t WHERE t.battle_id=NEW.battle_id)
BEGIN SELECT RAISE(ABORT,'V128_BATTLE_ALREADY_TERMINAL'); END;
CREATE TRIGGER v128_new_vote_deadline_after_terminal_gate BEFORE INSERT ON gameplay_social_vote_deadlines
WHEN EXISTS (SELECT 1 FROM gameplay_social_votes v JOIN v128_terminal_proposal t
 ON t.battle_id=v.battle_id WHERE v.vote_id=NEW.vote_id)
BEGIN SELECT RAISE(ABORT,'V128_BATTLE_ALREADY_TERMINAL'); END;
CREATE TRIGGER v128_human_ballot_terminal_gate BEFORE INSERT ON gameplay_social_ballots
WHEN EXISTS (SELECT 1 FROM v128_vote_terminal_disposition x WHERE x.vote_id=NEW.vote_id)
BEGIN SELECT RAISE(ABORT,'V128_VOTE_TERMINAL'); END;
CREATE TRIGGER v128_npc_ballot_terminal_gate BEFORE INSERT ON gameplay_social_npc_ballots
WHEN EXISTS (SELECT 1 FROM v128_vote_terminal_disposition x WHERE x.vote_id=NEW.vote_id)
BEGIN SELECT RAISE(ABORT,'V128_VOTE_TERMINAL'); END;
-- Two synthetic occupancy releases are allowed ONLY for the exact terminal
-- event and exact two source-bound generations in the same transaction.
CREATE TRIGGER v128_occupancy_release_gate BEFORE UPDATE ON v128_occupancy_fixture
WHEN NEW.person_id IS NOT OLD.person_id
 OR NEW.battle_id IS NOT OLD.battle_id
 OR NEW.reservation_generation IS NOT OLD.reservation_generation
 OR OLD.status!='ACTIVE' OR NEW.status!='RELEASED'
 OR NOT EXISTS(
  SELECT 1 FROM v128_terminal_proposal t JOIN v128_binding_fixture b ON b.battle_id=t.battle_id
  WHERE t.battle_id=OLD.battle_id AND NEW.released_by_event_id=t.canonical_event_id
    AND ((OLD.person_id=b.side_a_person_id AND OLD.reservation_generation=b.side_a_occupancy_generation)
      OR (OLD.person_id=b.side_b_person_id AND OLD.reservation_generation=b.side_b_occupancy_generation))
)
BEGIN SELECT RAISE(ABORT,'V128_UNAUTHORIZED_OCCUPANCY_RELEASE'); END;
CREATE TRIGGER v128_occupancy_no_delete BEFORE DELETE ON v128_occupancy_fixture
BEGIN SELECT RAISE(ABORT,'V128_OCCUPANCY_IMMUTABLE'); END;
CREATE TRIGGER v128_released_occupancy_immutable BEFORE UPDATE ON v128_occupancy_fixture
WHEN OLD.status='RELEASED'
BEGIN SELECT RAISE(ABORT,'V128_OCCUPANCY_RELEASE_IMMUTABLE'); END;

CREATE TRIGGER v128_terminal_preflight BEFORE INSERT ON v128_terminal_proposal
BEGIN
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM gameplay_battles b
    WHERE b.battle_id=NEW.battle_id AND b.version=NEW.expected_version
      AND b.phase='revealed' AND json_extract(b.state_json,'$.mechanicalOutcome') IS NEW.mechanical_outcome
  ) THEN RAISE(ABORT,'V128_PHASE_VERSION_MECHANICAL_CONFLICT') END;
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM v128_binding_fixture a
    WHERE a.battle_id=NEW.battle_id AND a.battle_generation=NEW.battle_generation
      AND a.side_a_person_id=NEW.side_a_person_id AND a.side_b_person_id=NEW.side_b_person_id
      AND a.side_a_binding_epoch=NEW.side_a_binding_epoch
      AND a.side_b_binding_epoch=NEW.side_b_binding_epoch
      AND a.side_a_occupancy_generation=NEW.side_a_occupancy_generation
      AND a.side_b_occupancy_generation=NEW.side_b_occupancy_generation
  ) THEN RAISE(ABORT,'V128_BINDING_EPOCH_CONFLICT') END;
  SELECT CASE WHEN (SELECT count(*) FROM v128_occupancy_fixture o WHERE
       o.battle_id=NEW.battle_id AND o.status='ACTIVE' AND
       ((o.person_id=NEW.side_a_person_id AND o.reservation_generation=NEW.side_a_occupancy_generation) OR
        (o.person_id=NEW.side_b_person_id AND o.reservation_generation=NEW.side_b_occupancy_generation)))!=2
  THEN RAISE(ABORT,'V128_OCCUPANCY_GENERATION_CONFLICT') END;
  SELECT CASE WHEN NEW.kind='FINAL' AND NOT EXISTS (
    SELECT 1 FROM gameplay_social_votes v JOIN gameplay_social_vote_deadlines d ON v.vote_id=d.vote_id
    WHERE v.vote_id=NEW.vote_id AND v.battle_id=NEW.battle_id AND d.status='closed'
      AND d.final_choice=NEW.social_choice
  ) THEN RAISE(ABORT,'V128_FINAL_REQUIRES_CLOSED_SIDECAR') END;
  SELECT CASE WHEN NEW.kind='CANCEL' AND NEW.vote_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM gameplay_social_votes v WHERE v.vote_id=NEW.vote_id AND v.battle_id=NEW.battle_id
  ) THEN RAISE(ABORT,'V128_CANCEL_FOREIGN_VOTE') END;
  -- Reference to synthetic issuer records is ONLY a test-model guard, not real authentication.
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM v128_issuer_fixture i WHERE i.battle_id=NEW.battle_id
      AND i.kind=NEW.kind AND i.vote_id=NEW.vote_id
      AND i.proof_digest=NEW.issuer_proof_digest
      AND i.authorized_generation=NEW.battle_generation
      AND NEW.trusted_now_ms<=i.expires_at_ms
  ) THEN RAISE(ABORT,'V128_ISSUER_FIXTURE_MISMATCH') END;
  -- For the exact DRAW sidecar cutset, choice A/B is the only admissible
  -- recognized outcome. Other product outcomes need owner-approved mapping.
  SELECT CASE WHEN NEW.kind='FINAL' AND (
     NEW.mechanical_outcome!='DRAW'
     OR NEW.recognized_outcome IS NOT CASE NEW.social_choice
       WHEN 'A' THEN 'A_WIN' WHEN 'B' THEN 'B_WIN' END
  ) THEN RAISE(ABORT,'V128_RECOGNIZED_OUTCOME_MISMATCH') END;
  SELECT CASE WHEN NEW.issuer_proof_digest='' OR NEW.receipt_digest='' OR NEW.source_system!='gameplay-server'
    THEN RAISE(ABORT,'V128_MISSING_TEST_ISSUER_FIELDS') END;
END;

-- Single SQL statement's AFTER trigger commits all local rows together or none.
-- Caller must do server-side issuer/authority verification BEFORE this privileged write.
CREATE TRIGGER v128_terminal_atomic_effects AFTER INSERT ON v128_terminal_proposal
BEGIN
  INSERT INTO v128_vote_terminal_disposition(vote_id,battle_id,effective_state)
  SELECT NEW.vote_id,NEW.battle_id,CASE WHEN NEW.kind='FINAL' THEN 'FINAL_CLOSED' ELSE 'CANCEL_NO_RESULT' END
  WHERE NEW.vote_id IS NOT NULL;
  UPDATE gameplay_battles
    SET version=NEW.expected_version+1,
        phase=CASE WHEN NEW.kind='FINAL' THEN 'final' ELSE 'cancelled' END,
        state_json=json_set(state_json,
          '$.version',NEW.expected_version+1,
          '$.phase',CASE WHEN NEW.kind='FINAL' THEN 'final' ELSE 'cancelled' END,
          '$.recognizedOutcome',NEW.recognized_outcome),
        updated_at_ms=NEW.trusted_now_ms
  WHERE battle_id=NEW.battle_id AND version=NEW.expected_version AND phase='revealed';
  SELECT CASE WHEN changes()!=1 THEN RAISE(ABORT,'V128_CAS_FAILED') END;
  INSERT INTO gameplay_command_receipts(battle_id,command_id,fingerprint,code,event_ids_json,recorded_version)
    VALUES(NEW.battle_id,NEW.command_id,NEW.fingerprint,
      CASE WHEN NEW.kind='FINAL' THEN 'FINALIZED' ELSE 'CANCELLED' END,
      json_array(NEW.canonical_event_id),NEW.expected_version+1);
  INSERT INTO gameplay_event_outbox(event_id,battle_id,version,event_type,payload_json,created_at_ms)
    VALUES(NEW.canonical_event_id,NEW.battle_id,NEW.expected_version+1,
      CASE WHEN NEW.kind='FINAL' THEN 'battle.finalized' ELSE 'battle.cancelled' END,
      json_object('commitIdentity',NEW.commit_identity,'receiptDigest',NEW.receipt_digest,
        'kind',NEW.kind,'recognizedOutcome',NEW.recognized_outcome),NEW.trusted_now_ms);
  INSERT INTO v128_settlement_intent(battle_id,canonical_event_id,effect_key,payload_digest)
  SELECT NEW.battle_id,NEW.canonical_event_id,'settlement-intent:'||NEW.battle_id,NEW.receipt_digest
   WHERE NEW.kind='FINAL';
  UPDATE v128_occupancy_fixture
  SET status='RELEASED',released_by_event_id=NEW.canonical_event_id
  WHERE battle_id=NEW.battle_id AND status='ACTIVE' AND
      ((person_id=NEW.side_a_person_id AND reservation_generation=NEW.side_a_occupancy_generation)
      OR (person_id=NEW.side_b_person_id AND reservation_generation=NEW.side_b_occupancy_generation));
  SELECT CASE WHEN changes()!=2 THEN RAISE(ABORT,'V128_OCCUPANCY_RELEASE_COUNT_MISMATCH') END;
END;
