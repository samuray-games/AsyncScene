-- Chat05A atom 1: trusted, immutable ready-offer snapshots and atomic participant text commits.
-- Synthetic fixtures only are used by tests; this migration does not invent or seed game canon.

CREATE TABLE gameplay_battle_text_catalogs (
  battle_id TEXT NOT NULL PRIMARY KEY REFERENCES gameplay_battles(battle_id) ON DELETE RESTRICT,
  catalog_version TEXT NOT NULL CHECK (length(catalog_version) BETWEEN 1 AND 64),
  normalization_version TEXT NOT NULL CHECK (normalization_version = 'chat01-unicode-words-v1'),
  created_at_ms INTEGER NOT NULL CHECK (typeof(created_at_ms) = 'integer' AND created_at_ms BETWEEN 0 AND 9007199254740991)
);

CREATE TABLE gameplay_battle_text_offers (
  battle_id TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('A','B')),
  channel TEXT NOT NULL CHECK (channel IN ('attack','defense')),
  offer_id TEXT NOT NULL CHECK (length(offer_id) BETWEEN 1 AND 64),
  phrase_text TEXT NOT NULL CHECK (length(CAST(phrase_text AS BLOB)) BETWEEN 1 AND 4096),
  word_signature TEXT NOT NULL CHECK (length(CAST(word_signature AS BLOB)) BETWEEN 2 AND 8192),
  PRIMARY KEY (battle_id,side,channel,offer_id),
  FOREIGN KEY (battle_id) REFERENCES gameplay_battle_text_catalogs(battle_id) ON DELETE RESTRICT
);

CREATE TRIGGER trg_gameplay_text_catalog_pin_guard
BEFORE INSERT ON gameplay_battle_text_catalogs
WHEN NOT EXISTS (
  SELECT 1 FROM gameplay_battles b
  WHERE b.battle_id=NEW.battle_id
    AND json_extract(b.state_json,'$.phase') IN ('created','waiting')
    AND json_type(b.state_json,'$.commits.A') IS NULL
    AND json_type(b.state_json,'$.commits.B') IS NULL
)
BEGIN
  SELECT RAISE(ABORT,'TEXT_CATALOG_TOO_LATE');
END;

CREATE TRIGGER trg_gameplay_text_catalog_no_replace
BEFORE INSERT ON gameplay_battle_text_catalogs
WHEN EXISTS (SELECT 1 FROM gameplay_battle_text_catalogs WHERE battle_id=NEW.battle_id)
BEGIN
  SELECT RAISE(ABORT,'TEXT_CATALOG_IMMUTABLE');
END;

CREATE TRIGGER trg_gameplay_text_catalog_no_update
BEFORE UPDATE ON gameplay_battle_text_catalogs
BEGIN
  SELECT RAISE(ABORT,'TEXT_CATALOG_IMMUTABLE');
END;

CREATE TRIGGER trg_gameplay_text_catalog_no_delete
BEFORE DELETE ON gameplay_battle_text_catalogs
BEGIN
  SELECT RAISE(ABORT,'TEXT_CATALOG_IMMUTABLE');
END;

CREATE TRIGGER trg_gameplay_text_offer_guard
BEFORE INSERT ON gameplay_battle_text_offers
WHEN NOT EXISTS (
  SELECT 1 FROM gameplay_battle_text_catalogs c
  WHERE c.battle_id=NEW.battle_id
    AND c.normalization_version='chat01-unicode-words-v1'
)
BEGIN
  SELECT RAISE(ABORT,'TEXT_CATALOG_REQUIRED');
END;

CREATE TRIGGER trg_gameplay_text_offer_no_replace
BEFORE INSERT ON gameplay_battle_text_offers
WHEN EXISTS (
  SELECT 1 FROM gameplay_battle_text_offers
  WHERE battle_id=NEW.battle_id AND side=NEW.side AND channel=NEW.channel AND offer_id=NEW.offer_id
)
BEGIN
  SELECT RAISE(ABORT,'TEXT_OFFER_IMMUTABLE');
END;

CREATE TRIGGER trg_gameplay_text_offer_no_update
BEFORE UPDATE ON gameplay_battle_text_offers
BEGIN
  SELECT RAISE(ABORT,'TEXT_OFFER_IMMUTABLE');
END;

CREATE TRIGGER trg_gameplay_text_offer_no_delete
BEFORE DELETE ON gameplay_battle_text_offers
BEGIN
  SELECT RAISE(ABORT,'TEXT_OFFER_IMMUTABLE');
END;

CREATE TABLE gameplay_battle_text_commits (
  battle_id TEXT NOT NULL REFERENCES gameplay_battles(battle_id) ON DELETE RESTRICT,
  side TEXT NOT NULL CHECK (side IN ('A','B')),
  catalog_version TEXT NOT NULL,
  normalization_version TEXT NOT NULL CHECK (normalization_version = 'chat01-unicode-words-v1'),
  expected_version INTEGER NOT NULL CHECK (typeof(expected_version)='integer' AND expected_version BETWEEN 0 AND 9007199254740990),
  recorded_version INTEGER NOT NULL CHECK (typeof(recorded_version)='integer' AND recorded_version BETWEEN 1 AND 9007199254740991),
  command_id TEXT NOT NULL CHECK (length(command_id) BETWEEN 1 AND 128),
  fingerprint TEXT NOT NULL CHECK (length(fingerprint) BETWEEN 1 AND 20000),
  capability_token_sha256 TEXT NOT NULL CHECK (length(capability_token_sha256)=64),
  capability_generation INTEGER NOT NULL CHECK (typeof(capability_generation)='integer' AND capability_generation BETWEEN 1 AND 9007199254740991),
  attack_offer_id TEXT NOT NULL,
  attack_text TEXT NOT NULL CHECK (length(CAST(attack_text AS BLOB)) BETWEEN 1 AND 4096),
  attack_signature TEXT NOT NULL CHECK (length(CAST(attack_signature AS BLOB)) BETWEEN 2 AND 8192),
  attack_words_edited INTEGER NOT NULL CHECK (attack_words_edited IN (0,1)),
  defense_offer_id TEXT NOT NULL,
  defense_text TEXT NOT NULL CHECK (length(CAST(defense_text AS BLOB)) BETWEEN 1 AND 4096),
  defense_signature TEXT NOT NULL CHECK (length(CAST(defense_signature AS BLOB)) BETWEEN 2 AND 8192),
  defense_words_edited INTEGER NOT NULL CHECK (defense_words_edited IN (0,1)),
  committed_at_ms INTEGER NOT NULL CHECK (typeof(committed_at_ms)='integer' AND committed_at_ms BETWEEN 0 AND 9007199254740991),
  PRIMARY KEY (battle_id,side),
  FOREIGN KEY (battle_id) REFERENCES gameplay_battle_text_catalogs(battle_id) ON DELETE RESTRICT
);

CREATE TRIGGER trg_gameplay_text_commit_guard
BEFORE INSERT ON gameplay_battle_text_commits
WHEN NOT (
  NEW.recorded_version = NEW.expected_version + 1
  AND EXISTS (
    SELECT 1 FROM gameplay_battles b
    JOIN gameplay_battle_text_catalogs cat ON cat.battle_id=b.battle_id
    JOIN gameplay_battle_capabilities cap ON cap.battle_id=b.battle_id AND cap.side=NEW.side
    WHERE b.battle_id=NEW.battle_id AND b.version=NEW.expected_version
      AND json_extract(b.state_json,'$.phase') IN ('created','waiting')
      AND json_type(b.state_json,'$.commits.' || NEW.side) IS NULL
      AND cat.catalog_version=NEW.catalog_version
      AND cat.normalization_version=NEW.normalization_version
      AND cap.status='active' AND cap.generation=NEW.capability_generation
      AND cap.token_sha256=NEW.capability_token_sha256
      AND json_extract(b.state_json,'$.participants.' || NEW.side || '.id')=cap.participant_id
      AND length(CAST(NEW.attack_text AS BLOB)) BETWEEN 1 AND 4096
      AND length(CAST(NEW.defense_text AS BLOB)) BETWEEN 1 AND 4096
      AND instr(NEW.attack_text,char(0))=0 AND instr(NEW.defense_text,char(0))=0
      AND EXISTS (SELECT 1 FROM gameplay_battle_text_offers o WHERE o.battle_id=NEW.battle_id AND o.side=NEW.side AND o.channel='attack' AND o.offer_id=NEW.attack_offer_id)
      AND EXISTS (SELECT 1 FROM gameplay_battle_text_offers o WHERE o.battle_id=NEW.battle_id AND o.side=NEW.side AND o.channel='defense' AND o.offer_id=NEW.defense_offer_id)
  )
)
BEGIN
  SELECT RAISE(ABORT,'INVALID_TEXT_COMMIT');
END;

CREATE TRIGGER trg_gameplay_text_commit_no_replace
BEFORE INSERT ON gameplay_battle_text_commits
WHEN EXISTS (SELECT 1 FROM gameplay_battle_text_commits WHERE battle_id=NEW.battle_id AND side=NEW.side)
BEGIN
  SELECT RAISE(ABORT,'TEXT_COMMIT_IMMUTABLE');
END;

CREATE TRIGGER trg_gameplay_text_commit_no_update
BEFORE UPDATE ON gameplay_battle_text_commits
BEGIN
  SELECT RAISE(ABORT,'TEXT_COMMIT_IMMUTABLE');
END;

CREATE TRIGGER trg_gameplay_text_commit_no_delete
BEFORE DELETE ON gameplay_battle_text_commits
BEGIN
  SELECT RAISE(ABORT,'TEXT_COMMIT_IMMUTABLE');
END;

-- Every transition adding a participant commit to a text-enabled battle must
-- carry its matching immutable text row in the same SQL statement/transaction.
CREATE TRIGGER trg_gameplay_battle_text_commit_required
BEFORE UPDATE OF state_json,version ON gameplay_battles
WHEN NEW.version=OLD.version+1
 AND EXISTS (SELECT 1 FROM gameplay_battle_text_catalogs c WHERE c.battle_id=NEW.battle_id)
 AND (
   (json_type(OLD.state_json,'$.commits.A') IS NULL AND json_type(NEW.state_json,'$.commits.A') IS NOT NULL)
   OR
   (json_type(OLD.state_json,'$.commits.B') IS NULL AND json_type(NEW.state_json,'$.commits.B') IS NOT NULL)
 )
 AND NOT EXISTS (
   SELECT 1 FROM gameplay_battle_text_commits t
   WHERE t.battle_id=NEW.battle_id AND t.expected_version=OLD.version AND t.recorded_version=NEW.version
     AND json_type(OLD.state_json,'$.commits.' || t.side) IS NULL
     AND json_type(NEW.state_json,'$.commits.' || t.side) IS NOT NULL
 )
BEGIN
  SELECT RAISE(ABORT,'TEXT_COMMIT_REQUIRED');
END;

CREATE VIEW gameplay_apply_participant_text_transition AS SELECT
  NULL AS battle_id,NULL AS expected_version,NULL AS command_id,NULL AS fingerprint,
  NULL AS receipt_code,NULL AS receipt_event_ids_json,NULL AS next_state_json,
  NULL AS events_json,NULL AS trusted_now_ms,NULL AS capability_side,
  NULL AS capability_token_sha256,NULL AS expected_generation,NULL AS catalog_version,
  NULL AS normalization_version,NULL AS attack_offer_id,NULL AS attack_text,
  NULL AS attack_signature,NULL AS attack_words_edited,NULL AS defense_offer_id,
  NULL AS defense_text,NULL AS defense_signature,NULL AS defense_words_edited
WHERE 0;

CREATE TRIGGER trg_gameplay_apply_participant_text_transition
INSTEAD OF INSERT ON gameplay_apply_participant_text_transition
BEGIN
  INSERT INTO gameplay_battle_text_commits (
    battle_id,side,catalog_version,normalization_version,expected_version,recorded_version,
    command_id,fingerprint,capability_token_sha256,capability_generation,
    attack_offer_id,attack_text,attack_signature,attack_words_edited,
    defense_offer_id,defense_text,defense_signature,defense_words_edited,committed_at_ms
  ) VALUES (
    NEW.battle_id,NEW.capability_side,NEW.catalog_version,NEW.normalization_version,
    NEW.expected_version,NEW.expected_version+1,NEW.command_id,NEW.fingerprint,
    NEW.capability_token_sha256,NEW.expected_generation,
    NEW.attack_offer_id,NEW.attack_text,NEW.attack_signature,NEW.attack_words_edited,
    NEW.defense_offer_id,NEW.defense_text,NEW.defense_signature,NEW.defense_words_edited,
    NEW.trusted_now_ms
  );
  INSERT INTO gameplay_apply_participant_transition (
    battle_id,expected_version,command_id,fingerprint,receipt_code,
    receipt_event_ids_json,next_state_json,events_json,trusted_now_ms,
    capability_side,capability_token_sha256,expected_generation
  ) VALUES (
    NEW.battle_id,NEW.expected_version,NEW.command_id,NEW.fingerprint,NEW.receipt_code,
    NEW.receipt_event_ids_json,NEW.next_state_json,NEW.events_json,NEW.trusted_now_ms,
    NEW.capability_side,NEW.capability_token_sha256,NEW.expected_generation
  );
END;
