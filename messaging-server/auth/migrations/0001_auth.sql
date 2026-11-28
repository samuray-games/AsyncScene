PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS auth_runtime_state (
  singleton INTEGER PRIMARY KEY CHECK (singleton = 1),
  generation INTEGER NOT NULL CHECK (generation > 0)
);
INSERT OR IGNORE INTO auth_runtime_state(singleton, generation) VALUES (1, 1);

CREATE TABLE IF NOT EXISTS auth_accounts (
  actor_id TEXT PRIMARY KEY,
  user_handle TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('active', 'disabled')),
  auth_epoch INTEGER NOT NULL DEFAULT 1 CHECK (auth_epoch > 0),
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_credentials (
  credential_id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL REFERENCES auth_accounts(actor_id),
  public_key BLOB NOT NULL,
  sign_count INTEGER NOT NULL DEFAULT 0 CHECK (sign_count >= 0),
  device_type TEXT NOT NULL CHECK (device_type IN ('singleDevice', 'multiDevice')),
  backed_up INTEGER NOT NULL CHECK (backed_up IN (0, 1)),
  transports_json TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL CHECK (status IN ('active', 'revoked')),
  created_at INTEGER NOT NULL,
  revoked_at INTEGER
);
CREATE INDEX IF NOT EXISTS auth_credentials_actor_status ON auth_credentials(actor_id, status);

CREATE TABLE IF NOT EXISTS auth_invitations (
  invitation_id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  issued_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  revoked_at INTEGER,
  consumed_at INTEGER,
  consumed_by_actor_id TEXT REFERENCES auth_accounts(actor_id),
  CHECK (expires_at > issued_at)
);

CREATE TABLE IF NOT EXISTS auth_preauth (
  preauth_id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  csrf_hash TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('register', 'login', 'recovery')),
  invitation_id TEXT REFERENCES auth_invitations(invitation_id),
  actor_id TEXT REFERENCES auth_accounts(actor_id),
  recovery_code_id TEXT,
  auth_epoch INTEGER,
  state TEXT NOT NULL CHECK (state IN ('active', 'used', 'expired', 'revoked')),
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  CHECK (expires_at > created_at),
  CHECK ((purpose = 'register' AND invitation_id IS NOT NULL AND actor_id IS NULL)
      OR (purpose = 'login' AND invitation_id IS NULL AND actor_id IS NULL)
      OR (purpose = 'recovery' AND invitation_id IS NULL AND actor_id IS NOT NULL AND recovery_code_id IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS auth_preauth_expiry ON auth_preauth(state, expires_at);
CREATE TRIGGER IF NOT EXISTS auth_recovery_preauth_guard
BEFORE INSERT ON auth_preauth WHEN NEW.purpose = 'recovery'
BEGIN
  SELECT CASE WHEN NOT EXISTS (
    SELECT 1 FROM auth_recovery_codes r JOIN auth_accounts a ON a.actor_id = r.actor_id
    WHERE r.recovery_code_id = NEW.recovery_code_id AND r.actor_id = NEW.actor_id
      AND r.used_at IS NULL AND r.revoked_at IS NULL AND a.status = 'active'
      AND a.auth_epoch = NEW.auth_epoch
  ) OR EXISTS (
    SELECT 1 FROM auth_preauth p WHERE p.recovery_code_id = NEW.recovery_code_id
      AND p.purpose = 'recovery' AND p.state = 'active' AND p.expires_at > NEW.created_at
  ) THEN RAISE(ABORT, 'AUTH_GUARD') END;
END;

CREATE TABLE IF NOT EXISTS auth_challenges (
  challenge_id TEXT PRIMARY KEY,
  challenge TEXT NOT NULL,
  user_handle TEXT,
  purpose TEXT NOT NULL CHECK (purpose IN ('register', 'login', 'add_credential', 'recovery')),
  preauth_id TEXT REFERENCES auth_preauth(preauth_id),
  session_id TEXT REFERENCES auth_sessions(session_id),
  actor_id TEXT REFERENCES auth_accounts(actor_id),
  auth_epoch INTEGER,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  consumed_at INTEGER,
  CHECK (expires_at > created_at),
  CHECK ((purpose = 'add_credential' AND preauth_id IS NULL AND session_id IS NOT NULL AND actor_id IS NOT NULL) OR (purpose != 'add_credential' AND preauth_id IS NOT NULL AND session_id IS NULL))
);
CREATE INDEX IF NOT EXISTS auth_challenges_expiry ON auth_challenges(consumed_at, expires_at);

CREATE TABLE IF NOT EXISTS auth_recovery_codes (
  recovery_code_id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL REFERENCES auth_accounts(actor_id),
  code_hash TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  used_at INTEGER,
  revoked_at INTEGER
);
CREATE INDEX IF NOT EXISTS auth_recovery_actor ON auth_recovery_codes(actor_id, used_at, revoked_at);

CREATE TABLE IF NOT EXISTS auth_sessions (
  session_id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL REFERENCES auth_accounts(actor_id),
  token_hash TEXT NOT NULL UNIQUE,
  csrf_hash TEXT NOT NULL,
  auth_epoch INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  idle_expires_at INTEGER NOT NULL,
  absolute_expires_at INTEGER NOT NULL,
  revoked_at INTEGER,
  expired_at INTEGER,
  CHECK (idle_expires_at <= absolute_expires_at)
);
CREATE INDEX IF NOT EXISTS auth_sessions_actor ON auth_sessions(actor_id, revoked_at, absolute_expires_at);

CREATE TABLE IF NOT EXISTS auth_rate_limits (
  bucket_hash TEXT PRIMARY KEY,
  window_started_at INTEGER NOT NULL,
  request_count INTEGER NOT NULL CHECK (request_count > 0),
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_operation_commits (
  operation_id TEXT PRIMARY KEY,
  purpose TEXT NOT NULL CHECK (purpose IN ('registration', 'login', 'add_credential', 'recovery', 'logout', 'revoke_all', 'rotate_recovery_codes', 'session_fence')),
  actor_id TEXT,
  invitation_id TEXT,
  preauth_id TEXT,
  challenge_id TEXT,
  recovery_code_id TEXT,
  session_id TEXT,
  expected_epoch INTEGER,
  expected_counter INTEGER,
  credential_id TEXT,
  payload_hash TEXT NOT NULL CHECK (length(payload_hash) = 64 AND payload_hash NOT GLOB '*[^0-9a-f]*'),
  payload_json TEXT NOT NULL CHECK (json_valid(payload_json)),
  occurred_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_session_fences (
  operation_id TEXT PRIMARY KEY REFERENCES auth_operation_commits(operation_id),
  session_id TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  auth_epoch INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  consumed_at INTEGER
);

CREATE TRIGGER IF NOT EXISTS auth_operation_guard_before
BEFORE INSERT ON auth_operation_commits
BEGIN
  SELECT CASE WHEN NEW.purpose = 'registration' AND NOT EXISTS (
    SELECT 1 FROM auth_invitations i
    JOIN auth_preauth p ON p.preauth_id = NEW.preauth_id AND p.invitation_id = i.invitation_id
    JOIN auth_challenges c ON c.challenge_id = NEW.challenge_id AND c.preauth_id = p.preauth_id
    WHERE i.invitation_id = NEW.invitation_id AND i.revoked_at IS NULL AND i.consumed_at IS NULL
      AND i.expires_at > NEW.occurred_at AND p.purpose = 'register' AND p.state = 'active'
      AND p.expires_at > NEW.occurred_at AND c.purpose = 'register' AND c.consumed_at IS NULL
      AND c.expires_at > NEW.occurred_at AND c.challenge = json_extract(NEW.payload_json, '$.challenge')
      AND c.user_handle = json_extract(NEW.payload_json, '$.userHandle')
      AND NEW.actor_id IS NOT NULL AND NEW.credential_id IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM auth_accounts a WHERE a.actor_id = NEW.actor_id)
      AND NOT EXISTS (SELECT 1 FROM auth_credentials k WHERE k.credential_id = NEW.credential_id)
      AND NOT EXISTS (SELECT 1 FROM auth_sessions x WHERE x.session_id = NEW.session_id)
  ) THEN RAISE(ABORT, 'AUTH_GUARD') END;

  SELECT CASE WHEN NEW.purpose = 'login' AND NOT EXISTS (
    SELECT 1 FROM auth_challenges c
    JOIN auth_preauth p ON p.preauth_id = c.preauth_id
    JOIN auth_credentials k ON k.credential_id = NEW.credential_id
    JOIN auth_accounts a ON a.actor_id = k.actor_id
    WHERE c.challenge_id = NEW.challenge_id AND c.preauth_id = NEW.preauth_id
      AND c.purpose = 'login' AND c.consumed_at IS NULL AND c.expires_at > NEW.occurred_at
      AND c.challenge = json_extract(NEW.payload_json, '$.challenge')
      AND p.purpose = 'login' AND p.state = 'active' AND p.expires_at > NEW.occurred_at
      AND k.status = 'active' AND a.status = 'active' AND a.auth_epoch = NEW.expected_epoch
      AND k.sign_count = NEW.expected_counter AND k.device_type = json_extract(NEW.payload_json, '$.deviceType')
      AND NEW.actor_id = a.actor_id
      AND NOT EXISTS (SELECT 1 FROM auth_sessions s WHERE s.session_id = NEW.session_id)
  ) THEN RAISE(ABORT, 'AUTH_GUARD') END;

  SELECT CASE WHEN NEW.purpose = 'add_credential' AND NOT EXISTS (
    SELECT 1 FROM auth_challenges c JOIN auth_sessions s ON s.session_id = NEW.session_id JOIN auth_accounts a ON a.actor_id = s.actor_id
    WHERE c.challenge_id = NEW.challenge_id AND c.purpose = 'add_credential'
      AND c.actor_id = a.actor_id AND c.session_id = s.session_id AND c.auth_epoch = a.auth_epoch AND c.consumed_at IS NULL
      AND c.expires_at > NEW.occurred_at AND c.challenge = json_extract(NEW.payload_json, '$.challenge')
      AND s.token_hash = json_extract(NEW.payload_json, '$.sessionTokenHash')
      AND s.revoked_at IS NULL AND s.expired_at IS NULL AND s.idle_expires_at > NEW.occurred_at
      AND s.absolute_expires_at > NEW.occurred_at AND s.auth_epoch = a.auth_epoch
      AND a.status = 'active' AND a.auth_epoch = NEW.expected_epoch
      AND NEW.actor_id = a.actor_id AND NEW.credential_id IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM auth_credentials k WHERE k.credential_id = NEW.credential_id)
  ) THEN RAISE(ABORT, 'AUTH_GUARD') END;

  SELECT CASE WHEN NEW.purpose = 'recovery' AND NOT EXISTS (
    SELECT 1 FROM auth_preauth p JOIN auth_accounts a ON a.actor_id = p.actor_id
    JOIN auth_recovery_codes r ON r.recovery_code_id = p.recovery_code_id AND r.actor_id = a.actor_id
    JOIN auth_challenges c ON c.challenge_id = NEW.challenge_id AND c.preauth_id = p.preauth_id
    WHERE p.preauth_id = NEW.preauth_id AND p.purpose = 'recovery' AND p.state = 'active'
      AND p.expires_at > NEW.occurred_at AND p.auth_epoch = a.auth_epoch AND a.status = 'active'
      AND r.recovery_code_id = NEW.recovery_code_id AND r.used_at IS NULL AND r.revoked_at IS NULL
      AND c.purpose = 'recovery' AND c.consumed_at IS NULL AND c.expires_at > NEW.occurred_at
      AND c.challenge = json_extract(NEW.payload_json, '$.challenge')
      AND NEW.actor_id = a.actor_id AND NEW.expected_epoch = a.auth_epoch
      AND NEW.credential_id IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM auth_credentials k WHERE k.credential_id = NEW.credential_id)
      AND NOT EXISTS (SELECT 1 FROM auth_sessions s WHERE s.session_id = NEW.session_id)
  ) THEN RAISE(ABORT, 'AUTH_GUARD') END;

  SELECT CASE WHEN NEW.purpose = 'logout' AND NOT EXISTS (
    SELECT 1 FROM auth_sessions s JOIN auth_accounts a ON a.actor_id = s.actor_id
    WHERE s.session_id = NEW.session_id AND s.actor_id = NEW.actor_id
      AND s.token_hash = json_extract(NEW.payload_json, '$.sessionTokenHash')
      AND s.revoked_at IS NULL AND s.expired_at IS NULL AND s.idle_expires_at > NEW.occurred_at
      AND s.absolute_expires_at > NEW.occurred_at AND s.auth_epoch = a.auth_epoch
      AND a.status = 'active' AND a.auth_epoch = NEW.expected_epoch
  ) THEN RAISE(ABORT, 'AUTH_GUARD') END;

  SELECT CASE WHEN NEW.purpose = 'revoke_all' AND NOT EXISTS (
    SELECT 1 FROM auth_sessions s JOIN auth_accounts a ON a.actor_id = s.actor_id
    WHERE s.session_id = NEW.session_id AND s.actor_id = NEW.actor_id
      AND s.token_hash = json_extract(NEW.payload_json, '$.sessionTokenHash')
      AND s.revoked_at IS NULL AND s.expired_at IS NULL AND s.idle_expires_at > NEW.occurred_at
      AND s.absolute_expires_at > NEW.occurred_at AND s.auth_epoch = a.auth_epoch
      AND a.status = 'active' AND a.auth_epoch = NEW.expected_epoch
  ) THEN RAISE(ABORT, 'AUTH_GUARD') END;

  SELECT CASE WHEN NEW.purpose = 'rotate_recovery_codes' AND NOT EXISTS (
    SELECT 1 FROM auth_sessions s JOIN auth_accounts a ON a.actor_id = s.actor_id
    WHERE s.session_id = NEW.session_id AND s.actor_id = NEW.actor_id
      AND s.token_hash = json_extract(NEW.payload_json, '$.sessionTokenHash')
      AND s.revoked_at IS NULL AND s.expired_at IS NULL AND s.idle_expires_at > NEW.occurred_at
      AND s.absolute_expires_at > NEW.occurred_at AND s.auth_epoch = a.auth_epoch
      AND a.status = 'active' AND a.auth_epoch = NEW.expected_epoch
  ) THEN RAISE(ABORT, 'AUTH_GUARD') END;

  SELECT CASE WHEN NEW.purpose = 'session_fence' AND NOT EXISTS (
    SELECT 1 FROM auth_sessions s JOIN auth_accounts a ON a.actor_id = s.actor_id
    WHERE s.session_id = NEW.session_id AND s.actor_id = NEW.actor_id
      AND s.token_hash = json_extract(NEW.payload_json, '$.sessionTokenHash')
      AND s.revoked_at IS NULL AND s.expired_at IS NULL AND s.idle_expires_at > NEW.occurred_at
      AND s.absolute_expires_at > NEW.occurred_at AND s.auth_epoch = a.auth_epoch
      AND a.status = 'active' AND a.auth_epoch = NEW.expected_epoch
  ) THEN RAISE(ABORT, 'AUTH_GUARD') END;
END;

CREATE TRIGGER IF NOT EXISTS auth_operation_apply_registration
AFTER INSERT ON auth_operation_commits WHEN NEW.purpose = 'registration'
BEGIN
  INSERT INTO auth_accounts(actor_id, user_handle, status, auth_epoch, created_at)
    VALUES (NEW.actor_id, json_extract(NEW.payload_json, '$.userHandle'), 'active', 1, NEW.occurred_at);
  INSERT INTO auth_credentials(credential_id, actor_id, public_key, sign_count, device_type, backed_up, transports_json, status, created_at)
    VALUES (NEW.credential_id, NEW.actor_id, json_extract(NEW.payload_json, '$.publicKey'), json_extract(NEW.payload_json, '$.signCount'), json_extract(NEW.payload_json, '$.deviceType'), json_extract(NEW.payload_json, '$.backedUp'), json_extract(NEW.payload_json, '$.transports'), 'active', NEW.occurred_at);
  UPDATE auth_invitations SET consumed_at = NEW.occurred_at, consumed_by_actor_id = NEW.actor_id WHERE invitation_id = NEW.invitation_id;
  UPDATE auth_challenges SET consumed_at = NEW.occurred_at WHERE challenge_id = NEW.challenge_id;
  UPDATE auth_preauth SET state = 'used' WHERE preauth_id = NEW.preauth_id;
  INSERT INTO auth_sessions(session_id, actor_id, token_hash, csrf_hash, auth_epoch, created_at, last_seen_at, idle_expires_at, absolute_expires_at)
    VALUES (NEW.session_id, NEW.actor_id, json_extract(NEW.payload_json, '$.sessionTokenHash'), json_extract(NEW.payload_json, '$.sessionCsrfHash'), 1, NEW.occurred_at, NEW.occurred_at, json_extract(NEW.payload_json, '$.idleExpiresAt'), json_extract(NEW.payload_json, '$.absoluteExpiresAt'));
  INSERT INTO auth_recovery_codes(recovery_code_id, actor_id, code_hash, created_at)
    SELECT json_extract(value, '$.id'), NEW.actor_id, json_extract(value, '$.hash'), NEW.occurred_at FROM json_each(NEW.payload_json, '$.recoveryCodes');
END;

CREATE TRIGGER IF NOT EXISTS auth_operation_apply_login
AFTER INSERT ON auth_operation_commits WHEN NEW.purpose = 'login'
BEGIN
  UPDATE auth_credentials SET sign_count = json_extract(NEW.payload_json, '$.newCounter'), backed_up = json_extract(NEW.payload_json, '$.backedUp') WHERE credential_id = NEW.credential_id AND sign_count = NEW.expected_counter AND status = 'active' AND device_type = json_extract(NEW.payload_json, '$.deviceType');
  UPDATE auth_challenges SET consumed_at = NEW.occurred_at WHERE challenge_id = NEW.challenge_id;
  UPDATE auth_preauth SET state = 'used' WHERE preauth_id = NEW.preauth_id;
  INSERT INTO auth_sessions(session_id, actor_id, token_hash, csrf_hash, auth_epoch, created_at, last_seen_at, idle_expires_at, absolute_expires_at)
    VALUES (NEW.session_id, NEW.actor_id, json_extract(NEW.payload_json, '$.sessionTokenHash'), json_extract(NEW.payload_json, '$.sessionCsrfHash'), NEW.expected_epoch, NEW.occurred_at, NEW.occurred_at, json_extract(NEW.payload_json, '$.idleExpiresAt'), json_extract(NEW.payload_json, '$.absoluteExpiresAt'));
END;

CREATE TRIGGER IF NOT EXISTS auth_operation_apply_add_credential
AFTER INSERT ON auth_operation_commits WHEN NEW.purpose = 'add_credential'
BEGIN
  INSERT INTO auth_credentials(credential_id, actor_id, public_key, sign_count, device_type, backed_up, transports_json, status, created_at)
    VALUES (NEW.credential_id, NEW.actor_id, json_extract(NEW.payload_json, '$.publicKey'), json_extract(NEW.payload_json, '$.signCount'), json_extract(NEW.payload_json, '$.deviceType'), json_extract(NEW.payload_json, '$.backedUp'), json_extract(NEW.payload_json, '$.transports'), 'active', NEW.occurred_at);
  UPDATE auth_challenges SET consumed_at = NEW.occurred_at WHERE challenge_id = NEW.challenge_id;
END;

CREATE TRIGGER IF NOT EXISTS auth_operation_apply_recovery
AFTER INSERT ON auth_operation_commits WHEN NEW.purpose = 'recovery'
BEGIN
  UPDATE auth_recovery_codes SET used_at = NEW.occurred_at WHERE recovery_code_id = NEW.recovery_code_id AND used_at IS NULL AND revoked_at IS NULL;
  UPDATE auth_accounts SET auth_epoch = auth_epoch + 1 WHERE actor_id = NEW.actor_id AND auth_epoch = NEW.expected_epoch AND status = 'active';
  UPDATE auth_sessions SET revoked_at = NEW.occurred_at WHERE actor_id = NEW.actor_id AND revoked_at IS NULL;
  UPDATE auth_credentials SET status = 'revoked', revoked_at = NEW.occurred_at WHERE actor_id = NEW.actor_id AND status = 'active';
  INSERT INTO auth_credentials(credential_id, actor_id, public_key, sign_count, device_type, backed_up, transports_json, status, created_at)
    VALUES (NEW.credential_id, NEW.actor_id, json_extract(NEW.payload_json, '$.publicKey'), json_extract(NEW.payload_json, '$.signCount'), json_extract(NEW.payload_json, '$.deviceType'), json_extract(NEW.payload_json, '$.backedUp'), json_extract(NEW.payload_json, '$.transports'), 'active', NEW.occurred_at);
  UPDATE auth_challenges SET consumed_at = NEW.occurred_at WHERE challenge_id = NEW.challenge_id;
  UPDATE auth_preauth SET state = 'used' WHERE preauth_id = NEW.preauth_id;
  UPDATE auth_recovery_codes SET revoked_at = NEW.occurred_at WHERE actor_id = NEW.actor_id AND recovery_code_id != NEW.recovery_code_id AND revoked_at IS NULL;
  INSERT INTO auth_sessions(session_id, actor_id, token_hash, csrf_hash, auth_epoch, created_at, last_seen_at, idle_expires_at, absolute_expires_at)
    VALUES (NEW.session_id, NEW.actor_id, json_extract(NEW.payload_json, '$.sessionTokenHash'), json_extract(NEW.payload_json, '$.sessionCsrfHash'), NEW.expected_epoch + 1, NEW.occurred_at, NEW.occurred_at, json_extract(NEW.payload_json, '$.idleExpiresAt'), json_extract(NEW.payload_json, '$.absoluteExpiresAt'));
  INSERT INTO auth_recovery_codes(recovery_code_id, actor_id, code_hash, created_at)
    SELECT json_extract(value, '$.id'), NEW.actor_id, json_extract(value, '$.hash'), NEW.occurred_at FROM json_each(NEW.payload_json, '$.recoveryCodes');
END;

CREATE TRIGGER IF NOT EXISTS auth_operation_apply_logout
AFTER INSERT ON auth_operation_commits WHEN NEW.purpose = 'logout'
BEGIN
  UPDATE auth_sessions SET revoked_at = NEW.occurred_at WHERE session_id = NEW.session_id AND revoked_at IS NULL;
END;

CREATE TRIGGER IF NOT EXISTS auth_operation_apply_revoke_all
AFTER INSERT ON auth_operation_commits WHEN NEW.purpose = 'revoke_all'
BEGIN
  UPDATE auth_accounts SET auth_epoch = auth_epoch + 1 WHERE actor_id = NEW.actor_id AND auth_epoch = NEW.expected_epoch;
  UPDATE auth_sessions SET revoked_at = NEW.occurred_at WHERE actor_id = NEW.actor_id AND revoked_at IS NULL;
  UPDATE auth_preauth SET state = 'revoked' WHERE actor_id = NEW.actor_id AND state = 'active';
END;

CREATE TRIGGER IF NOT EXISTS auth_operation_apply_rotate_codes
AFTER INSERT ON auth_operation_commits WHEN NEW.purpose = 'rotate_recovery_codes'
BEGIN
  UPDATE auth_recovery_codes SET revoked_at = NEW.occurred_at WHERE actor_id = NEW.actor_id AND revoked_at IS NULL;
  INSERT INTO auth_recovery_codes(recovery_code_id, actor_id, code_hash, created_at)
    SELECT json_extract(value, '$.id'), NEW.actor_id, json_extract(value, '$.hash'), NEW.occurred_at FROM json_each(NEW.payload_json, '$.recoveryCodes');
END;

CREATE TRIGGER IF NOT EXISTS auth_operation_apply_session_fence
AFTER INSERT ON auth_operation_commits WHEN NEW.purpose = 'session_fence'
BEGIN
  INSERT INTO auth_session_fences(operation_id, session_id, actor_id, auth_epoch, created_at)
    VALUES (NEW.operation_id, NEW.session_id, NEW.actor_id, NEW.expected_epoch, NEW.occurred_at);
END;

CREATE TRIGGER IF NOT EXISTS auth_operation_immutable_update
BEFORE UPDATE ON auth_operation_commits BEGIN SELECT RAISE(ABORT, 'AUTH_IMMUTABLE'); END;
CREATE TRIGGER IF NOT EXISTS auth_operation_immutable_delete
BEFORE DELETE ON auth_operation_commits BEGIN SELECT RAISE(ABORT, 'AUTH_IMMUTABLE'); END;
