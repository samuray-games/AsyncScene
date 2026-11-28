-- V129 isolated SQL seam applied AFTER untouched original 0001-0012 and V128 candidate.
-- NEVER copy this into a real migration without exclusive writer and approved signed issuer authority.
-- SQL cannot authenticate issuer/proof. Single trusted server writer is mandatory.
CREATE TABLE v129_seam_commands (
 battle_id TEXT NOT NULL PRIMARY KEY,
 canonical_event_id TEXT NOT NULL UNIQUE,
 envelope_json TEXT NOT NULL CHECK(json_valid(envelope_json)),
 receipt_json TEXT NOT NULL CHECK(json_valid(receipt_json)),
 receipt_sha256 TEXT NOT NULL CHECK(length(receipt_sha256)=64),
 issuer_attestation_sha256 TEXT NOT NULL CHECK(length(issuer_attestation_sha256)=64),
 sidecar_attestation_sha256 TEXT,
 binding_attestation_sha256 TEXT NOT NULL CHECK(length(binding_attestation_sha256)=64),
 CHECK(sidecar_attestation_sha256 IS NULL OR length(sidecar_attestation_sha256)=64)
);
CREATE TABLE v129_terminal_receipts (
 battle_id TEXT NOT NULL PRIMARY KEY REFERENCES v129_seam_commands(battle_id),
 canonical_event_id TEXT NOT NULL UNIQUE,
 command_id TEXT NOT NULL,
 fingerprint TEXT NOT NULL,
 kind TEXT NOT NULL CHECK(kind IN ('FINAL','CANCEL')),
 receipt_json TEXT NOT NULL CHECK(json_valid(receipt_json)),
 receipt_sha256 TEXT NOT NULL UNIQUE CHECK(length(receipt_sha256)=64),
 issuer_attestation_sha256 TEXT NOT NULL,
 sidecar_attestation_sha256 TEXT,
 binding_attestation_sha256 TEXT NOT NULL,
 commit_identity TEXT NOT NULL UNIQUE,
 source_system TEXT NOT NULL CHECK(source_system='gameplay-server'),
 committed_version INTEGER NOT NULL,
 CHECK(kind='FINAL' OR sidecar_attestation_sha256 IS NULL)
);
CREATE TRIGGER v129_cmd_no_replace BEFORE INSERT ON v129_seam_commands
WHEN EXISTS(SELECT 1 FROM v129_seam_commands WHERE battle_id=NEW.battle_id OR canonical_event_id=NEW.canonical_event_id)
BEGIN SELECT RAISE(ABORT,'V129_TERMINAL_ALREADY_EXISTS'); END;
CREATE TRIGGER v129_cmd_no_update BEFORE UPDATE ON v129_seam_commands
BEGIN SELECT RAISE(ABORT,'V129_SEAM_IMMUTABLE'); END;
CREATE TRIGGER v129_cmd_no_delete BEFORE DELETE ON v129_seam_commands
BEGIN SELECT RAISE(ABORT,'V129_SEAM_IMMUTABLE'); END;
CREATE TRIGGER v129_receipt_no_replace BEFORE INSERT ON v129_terminal_receipts
WHEN EXISTS(SELECT 1 FROM v129_terminal_receipts WHERE battle_id=NEW.battle_id OR canonical_event_id=NEW.canonical_event_id OR receipt_sha256=NEW.receipt_sha256)
BEGIN SELECT RAISE(ABORT,'V129_RECEIPT_IMMUTABLE'); END;
CREATE TRIGGER v129_receipt_no_update BEFORE UPDATE ON v129_terminal_receipts
BEGIN SELECT RAISE(ABORT,'V129_RECEIPT_IMMUTABLE'); END;
CREATE TRIGGER v129_receipt_no_delete BEFORE DELETE ON v129_terminal_receipts
BEGIN SELECT RAISE(ABORT,'V129_RECEIPT_IMMUTABLE'); END;

-- Close a V128 privilege bypass: raw V128 insert is impossible without one
-- exactly matching in-flight V129 command row. This remains one privileged
-- database writer contract, NOT SQL-layer verification of issuer cryptography.
CREATE TRIGGER v129_require_verified_seam BEFORE INSERT ON v128_terminal_proposal
WHEN NOT EXISTS (SELECT 1 FROM v129_seam_commands c
 WHERE c.battle_id=NEW.battle_id AND c.canonical_event_id=NEW.canonical_event_id
 AND json_extract(c.envelope_json, '$.battle_id') IS NEW.battle_id
 AND json_extract(c.envelope_json, '$.kind') IS NEW.kind
 AND json_extract(c.envelope_json, '$.source_system') IS NEW.source_system
 AND json_extract(c.envelope_json, '$.canonical_event_id') IS NEW.canonical_event_id
 AND json_extract(c.envelope_json, '$.commit_identity') IS NEW.commit_identity
 AND json_extract(c.envelope_json, '$.command_id') IS NEW.command_id
 AND json_extract(c.envelope_json, '$.fingerprint') IS NEW.fingerprint
 AND json_extract(c.envelope_json, '$.receipt_digest') IS NEW.receipt_digest
 AND json_extract(c.envelope_json, '$.issuer_proof_digest') IS NEW.issuer_proof_digest
 AND json_extract(c.envelope_json, '$.expected_version') IS NEW.expected_version
 AND json_extract(c.envelope_json, '$.battle_generation') IS NEW.battle_generation
 AND json_extract(c.envelope_json, '$.side_a_person_id') IS NEW.side_a_person_id
 AND json_extract(c.envelope_json, '$.side_b_person_id') IS NEW.side_b_person_id
 AND json_extract(c.envelope_json, '$.side_a_binding_epoch') IS NEW.side_a_binding_epoch
 AND json_extract(c.envelope_json, '$.side_b_binding_epoch') IS NEW.side_b_binding_epoch
 AND json_extract(c.envelope_json, '$.side_a_occupancy_generation') IS NEW.side_a_occupancy_generation
 AND json_extract(c.envelope_json, '$.side_b_occupancy_generation') IS NEW.side_b_occupancy_generation
 AND json_extract(c.envelope_json, '$.vote_id') IS NEW.vote_id
 AND json_extract(c.envelope_json, '$.social_choice') IS NEW.social_choice
 AND json_extract(c.envelope_json, '$.mechanical_outcome') IS NEW.mechanical_outcome
 AND json_extract(c.envelope_json, '$.recognized_outcome') IS NEW.recognized_outcome
 AND json_extract(c.envelope_json, '$.trusted_now_ms') IS NEW.trusted_now_ms)
BEGIN SELECT RAISE(ABORT,'V129_SEAM_REQUIRED'); END;

CREATE TRIGGER v129_receipt_complete_gate BEFORE INSERT ON v129_terminal_receipts
WHEN NOT EXISTS (
 SELECT 1 FROM v128_terminal_proposal t
 JOIN gameplay_command_receipts r ON r.battle_id=t.battle_id AND r.command_id=t.command_id
 JOIN gameplay_event_outbox o ON o.event_id=t.canonical_event_id AND o.battle_id=t.battle_id
 JOIN v128_binding_fixture b ON b.battle_id=t.battle_id
 WHERE t.battle_id=NEW.battle_id AND t.canonical_event_id=NEW.canonical_event_id
 AND t.command_id=NEW.command_id AND t.fingerprint=NEW.fingerprint
 AND t.kind=NEW.kind AND t.commit_identity=NEW.commit_identity
 AND t.source_system=NEW.source_system AND t.receipt_digest=NEW.receipt_sha256
 AND r.fingerprint=NEW.fingerprint AND json_extract(r.event_ids_json,'$[0]')=NEW.canonical_event_id
 AND r.recorded_version=NEW.committed_version
 AND o.version=NEW.committed_version
 AND o.event_type=(CASE WHEN NEW.kind='FINAL' THEN 'battle.finalized' ELSE 'battle.cancelled' END)
 AND json_extract(o.payload_json,'$.receiptDigest')=NEW.receipt_sha256
 AND json_extract(NEW.receipt_json,'$.battleId')=NEW.battle_id
 AND json_extract(NEW.receipt_json,'$.canonicalEventId')=NEW.canonical_event_id
 AND json_extract(NEW.receipt_json,'$.commitIdentity')=NEW.commit_identity
 AND json_extract(NEW.receipt_json,'$.commandId')=NEW.command_id
 AND json_extract(NEW.receipt_json,'$.fingerprint')=NEW.fingerprint
 AND json_extract(NEW.receipt_json,'$.terminalKind')=NEW.kind
 AND json_extract(NEW.receipt_json,'$.receiptVersion')=NEW.committed_version
 AND (SELECT count(*) FROM v128_occupancy_fixture occ
      WHERE occ.battle_id=t.battle_id AND occ.status='RELEASED'
      AND occ.released_by_event_id=t.canonical_event_id)=2
 AND (SELECT count(*) FROM v128_settlement_intent si
      WHERE si.battle_id=t.battle_id AND si.canonical_event_id=t.canonical_event_id
        AND si.payload_digest=t.receipt_digest)=(CASE WHEN NEW.kind='FINAL' THEN 1 ELSE 0 END)
 )
BEGIN SELECT RAISE(ABORT,'V129_INCOMPLETE_TERMINAL_RECEIPT'); END;

CREATE TRIGGER v129_command_preflight BEFORE INSERT ON v129_seam_commands
WHEN json_extract(NEW.envelope_json,'$.battle_id') IS NOT NEW.battle_id
 OR json_extract(NEW.envelope_json,'$.canonical_event_id') IS NOT NEW.canonical_event_id
 OR json_extract(NEW.envelope_json,'$.receipt_digest') IS NOT NEW.receipt_sha256
 OR json_extract(NEW.receipt_json,'$.battleId') IS NOT NEW.battle_id
 OR json_extract(NEW.receipt_json,'$.canonicalEventId') IS NOT NEW.canonical_event_id
 OR json_extract(NEW.receipt_json,'$.issuerAttestationDigest') IS NOT NEW.issuer_attestation_sha256
 OR json_extract(NEW.receipt_json,'$.bindingAttestationDigest') IS NOT NEW.binding_attestation_sha256
 OR json_extract(NEW.receipt_json,'$.sidecarAttestationDigest') IS NOT NEW.sidecar_attestation_sha256
 OR json_extract(NEW.envelope_json,'$.kind') NOT IN ('FINAL','CANCEL')
 OR (json_extract(NEW.envelope_json,'$.kind')='FINAL' AND NEW.sidecar_attestation_sha256 IS NULL)
 OR (json_extract(NEW.envelope_json,'$.kind')='CANCEL' AND NEW.sidecar_attestation_sha256 IS NOT NULL)
BEGIN SELECT RAISE(ABORT,'V129_EXACT_RECEIPT_IDENTITY'); END;

CREATE TRIGGER v129_command_atomic_effects AFTER INSERT ON v129_seam_commands
BEGIN
 INSERT INTO v128_terminal_proposal (battle_id,kind,source_system,canonical_event_id,commit_identity,command_id,fingerprint,receipt_digest,issuer_proof_digest,expected_version,battle_generation,side_a_person_id,side_b_person_id,side_a_binding_epoch,side_b_binding_epoch,side_a_occupancy_generation,side_b_occupancy_generation,vote_id,social_choice,mechanical_outcome,recognized_outcome,trusted_now_ms) VALUES (
   json_extract(NEW.envelope_json, '$.battle_id'),json_extract(NEW.envelope_json, '$.kind'),json_extract(NEW.envelope_json, '$.source_system'),json_extract(NEW.envelope_json, '$.canonical_event_id'),json_extract(NEW.envelope_json, '$.commit_identity'),json_extract(NEW.envelope_json, '$.command_id'),json_extract(NEW.envelope_json, '$.fingerprint'),json_extract(NEW.envelope_json, '$.receipt_digest'),json_extract(NEW.envelope_json, '$.issuer_proof_digest'),json_extract(NEW.envelope_json, '$.expected_version'),json_extract(NEW.envelope_json, '$.battle_generation'),json_extract(NEW.envelope_json, '$.side_a_person_id'),json_extract(NEW.envelope_json, '$.side_b_person_id'),json_extract(NEW.envelope_json, '$.side_a_binding_epoch'),json_extract(NEW.envelope_json, '$.side_b_binding_epoch'),json_extract(NEW.envelope_json, '$.side_a_occupancy_generation'),json_extract(NEW.envelope_json, '$.side_b_occupancy_generation'),json_extract(NEW.envelope_json, '$.vote_id'),json_extract(NEW.envelope_json, '$.social_choice'),json_extract(NEW.envelope_json, '$.mechanical_outcome'),json_extract(NEW.envelope_json, '$.recognized_outcome'),json_extract(NEW.envelope_json, '$.trusted_now_ms')
 );
 INSERT INTO v129_terminal_receipts(
  battle_id,canonical_event_id,command_id,fingerprint,kind,receipt_json,receipt_sha256,
  issuer_attestation_sha256,sidecar_attestation_sha256,binding_attestation_sha256,
  commit_identity,source_system,committed_version
 ) VALUES (
   NEW.battle_id,NEW.canonical_event_id,json_extract(NEW.envelope_json, '$.command_id'),json_extract(NEW.envelope_json, '$.fingerprint'),json_extract(NEW.envelope_json, '$.kind'),
   NEW.receipt_json,NEW.receipt_sha256,NEW.issuer_attestation_sha256,
   NEW.sidecar_attestation_sha256,NEW.binding_attestation_sha256,
   json_extract(NEW.envelope_json, '$.commit_identity'),json_extract(NEW.envelope_json, '$.source_system'),json_extract(NEW.envelope_json, '$.expected_version')+1
 );
END;
