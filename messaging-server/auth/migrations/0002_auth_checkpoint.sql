ALTER TABLE auth_operation_commits ADD COLUMN authority_seq INTEGER NOT NULL DEFAULT 0;
ALTER TABLE auth_operation_commits ADD COLUMN authority_digest TEXT NOT NULL DEFAULT '0000000000000000000000000000000000000000000000000000000000000000';
CREATE INDEX IF NOT EXISTS auth_operation_authority_seq ON auth_operation_commits(authority_seq);
CREATE TABLE IF NOT EXISTS auth_checkpoint (
  singleton INTEGER PRIMARY KEY CHECK (singleton = 1),
  seq INTEGER NOT NULL CHECK (seq >= 0),
  digest TEXT NOT NULL CHECK (length(digest) = 64),
  operation_id TEXT
);
INSERT OR IGNORE INTO auth_checkpoint(singleton, seq, digest)
  VALUES (1, 0, '0000000000000000000000000000000000000000000000000000000000000000');
CREATE TABLE IF NOT EXISTS auth_checkpoint_apply_guard (
  singleton INTEGER PRIMARY KEY CHECK (singleton = 1), operation_id TEXT NOT NULL UNIQUE,
  seq INTEGER NOT NULL, previous_digest TEXT NOT NULL, digest TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('operation', 'invite_revoke')), invitation_id TEXT, occurred_at INTEGER NOT NULL
);
CREATE TRIGGER IF NOT EXISTS auth_checkpoint_guard_before_insert
BEFORE INSERT ON auth_checkpoint_apply_guard BEGIN
  SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM auth_checkpoint c WHERE c.singleton = 1
    AND c.seq = NEW.seq - 1 AND c.digest = NEW.previous_digest)
    THEN RAISE(ABORT, 'AUTH_CHECKPOINT_MISMATCH') END;
  SELECT CASE WHEN NEW.kind = 'invite_revoke' AND NOT EXISTS (SELECT 1 FROM auth_invitations i
    WHERE i.invitation_id = NEW.invitation_id AND i.revoked_at IS NULL AND i.consumed_at IS NULL)
    THEN RAISE(ABORT, 'AUTH_GUARD') END;
  SELECT CASE WHEN EXISTS (SELECT 1 FROM auth_checkpoint_apply_guard)
    THEN RAISE(ABORT, 'AUTH_CHECKPOINT_MISMATCH') END;
END;
CREATE TRIGGER IF NOT EXISTS auth_checkpoint_guard_update
BEFORE UPDATE ON auth_checkpoint WHEN EXISTS (SELECT 1 FROM auth_checkpoint_apply_guard) BEGIN
  SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM auth_checkpoint_apply_guard g WHERE g.operation_id = NEW.operation_id
    AND NEW.seq = g.seq AND NEW.digest = g.digest AND OLD.seq = g.seq - 1 AND OLD.digest = g.previous_digest)
    THEN RAISE(ABORT, 'AUTH_CHECKPOINT_MISMATCH') END;
END;
CREATE TRIGGER IF NOT EXISTS auth_checkpoint_guard_no_delete
BEFORE DELETE ON auth_checkpoint BEGIN SELECT RAISE(ABORT, 'AUTH_CHECKPOINT_MISMATCH'); END;
CREATE TRIGGER IF NOT EXISTS auth_operation_checkpoint_guard
BEFORE INSERT ON auth_operation_commits WHEN NEW.purpose != 'session_fence' BEGIN
  SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM auth_checkpoint_apply_guard g WHERE g.kind = 'operation'
    AND g.operation_id = NEW.operation_id AND g.seq = NEW.authority_seq AND g.digest = NEW.authority_digest)
    THEN RAISE(ABORT, 'AUTH_CHECKPOINT_MISMATCH') END;
END;
CREATE TRIGGER IF NOT EXISTS auth_invite_revoke_checkpoint_guard
BEFORE UPDATE OF revoked_at ON auth_invitations WHEN OLD.revoked_at IS NULL AND NEW.revoked_at IS NOT NULL BEGIN
  SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM auth_checkpoint_apply_guard g WHERE g.kind = 'invite_revoke'
    AND g.invitation_id = NEW.invitation_id AND g.occurred_at = NEW.revoked_at)
    THEN RAISE(ABORT, 'AUTH_CHECKPOINT_MISMATCH') END;
END;
