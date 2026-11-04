import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';

const SESSION_COOKIE = '__Host-asynchat';
const PREAUTH_COOKIE = '__Host-asynchat-preauth';
const SESSION_CSRF_COOKIE = '__Host-asynchat-csrf';
const PREAUTH_CSRF_COOKIE = '__Host-asynchat-preauth-csrf';
const MAX_BODY_BYTES = 64 * 1024;
const RECOVERY_CODE_BYTES = 20;
const GENERIC_AUTH = 'unauthorized';

class RequestInputError extends Error {
  constructor(status, code) { super(code); this.status = status; this.code = code; }
}

function json(data, status = 200, headers = {}) {
  const responseHeaders = new Headers({ 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  for (const [name, value] of Object.entries(headers)) {
    if (name.toLowerCase() === 'set-cookie' && Array.isArray(value)) {
      for (const item of value) responseHeaders.append('set-cookie', item);
    } else responseHeaders.set(name, value);
  }
  return new Response(JSON.stringify(data), { status, headers: responseHeaders });
}

function errorResponse(status, code, requestId, headers = {}) {
  return json({ error: code, requestId }, status, headers);
}

function readConfig(env) {
  const integer = (name, fallback, min = 1, max = Number.MAX_SAFE_INTEGER) => {
    const raw = env[name];
    const value = raw === undefined || raw === '' ? fallback : Number(raw);
    return Number.isSafeInteger(value) && value >= min && value <= max ? value : fallback;
  };
  const origin = typeof env.AUTH_ORIGIN === 'string' ? env.AUTH_ORIGIN : '';
  let parsed;
  try { parsed = new URL(origin); } catch { parsed = null; }
  const rpId = typeof env.AUTH_RP_ID === 'string' ? env.AUTH_RP_ID.toLowerCase() : '';
  if (!parsed || parsed.origin !== origin || !rpId || parsed.hostname.toLowerCase() !== rpId) return null;
  return {
    origin,
    rpId,
    generation: integer('AUTH_DB_GENERATION', 0, 1),
    idleMs: integer('AUTH_SESSION_IDLE_MS', 30 * 86400000),
    absoluteMs: integer('AUTH_SESSION_ABSOLUTE_MS', 90 * 86400000),
    terminalRetentionMs: integer('AUTH_TERMINAL_SESSION_RETENTION_MS', 90 * 86400000),
    challengeTtlMs: integer('AUTH_CHALLENGE_TTL_MS', 5 * 60000, 1000),
    preauthTtlMs: integer('AUTH_PREAUTH_TTL_MS', 10 * 60000, 1000),
    inviteTtlMs: integer('AUTH_INVITE_TTL_MS', 7 * 86400000, 1000),
    recoveryCount: integer('AUTH_RECOVERY_CODE_COUNT', 10, 1, 50),
    rateWindowMs: integer('AUTH_RATE_WINDOW_MS', 60000, 1000),
    rateLimit: integer('AUTH_RATE_LIMIT', 10, 1, 10000),
  };
}

function bytesToBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '');
}

function base64UrlToBytes(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]+$/u.test(value)) throw new Error('invalid_encoding');
  const padded = value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - value.length % 4) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function randomToken(byteLength = 32) {
  return bytesToBase64Url(crypto.getRandomValues(new Uint8Array(byteLength)));
}

function randomId() { return crypto.randomUUID(); }

async function sha256(value) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(bytes)].map((value) => value.toString(16).padStart(2, '0')).join('');
}

async function hmacHex(secret, value) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return [...new Uint8Array(mac)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function equalConstantTime(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string') return false;
  let mismatch = left.length ^ right.length;
  const n = Math.max(left.length, right.length);
  for (let index = 0; index < n; index += 1) {
    mismatch |= (left.charCodeAt(index) || 0) ^ (right.charCodeAt(index) || 0);
  }
  return mismatch === 0;
}

function cookieValue(request, name) {
  const header = request.headers.get('cookie') || '';
  for (const part of header.split(';')) {
    const at = part.indexOf('=');
    if (at < 0 || part.slice(0, at).trim() !== name) continue;
    return part.slice(at + 1).trim();
  }
  return null;
}

function cookie(name, value, maxAge) {
  return `${name}=${value}; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=${Math.max(0, Math.floor(maxAge / 1000))}`;
}
function csrfCookie(name, value, maxAge) {
  return `${name}=${value}; Path=/; Secure; SameSite=Strict; Max-Age=${Math.max(0, Math.floor(maxAge / 1000))}`;
}
const clearCookie = (name) => `${name}=; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=0`;

async function readJson(request) {
  const length = Number(request.headers.get('content-length') || 0);
  if (length > MAX_BODY_BYTES) throw new RequestInputError(413, 'body_too_large');
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) throw new RequestInputError(413, 'body_too_large');
  let value;
  try { value = JSON.parse(text); } catch { throw new RequestInputError(400, 'invalid_json'); }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new RequestInputError(400, 'invalid_json');
  return value;
}

async function bufferRequestBeforeAuthorityLock(request) {
  if (['GET', 'HEAD'].includes(request.method.toUpperCase()) || !request.body) return { request };
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel().catch(() => {});
      return { tooLarge: true };
    }
    chunks.push(value);
  }
  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  return { request: new Request(request.url, { method: request.method, headers: request.headers, body }) };
}

function onlyKeys(value, allowed) {
  return Object.keys(value).every((key) => allowed.includes(key));
}

async function storeReady(db, config) {
  if (!db || !config?.generation) return false;
  const state = await db.prepare('SELECT generation FROM auth_runtime_state WHERE singleton = 1').first();
  return Boolean(state && state.generation === config.generation);
}

async function rateLimit(request, env, config, requestPath, now) {
  if (!env.AUTH_RATE_LIMIT_KEY || !env.AUTH_DB) return false;
  const address = request.headers.get('cf-connecting-ip') || 'local-test-client';
  const windowStarted = Math.floor(now / config.rateWindowMs) * config.rateWindowMs;
  const bucket = await hmacHex(env.AUTH_RATE_LIMIT_KEY, `${requestPath}\n${address}\n${windowStarted}`);
  await env.AUTH_DB.prepare(`INSERT INTO auth_rate_limits(bucket_hash, window_started_at, request_count, expires_at)
    VALUES (?, ?, 1, ?) ON CONFLICT(bucket_hash) DO UPDATE SET
    request_count = CASE WHEN auth_rate_limits.window_started_at = excluded.window_started_at THEN auth_rate_limits.request_count + 1 ELSE 1 END,
    window_started_at = excluded.window_started_at, expires_at = excluded.expires_at`)
    .bind(bucket, windowStarted, windowStarted + config.rateWindowMs * 2).run();
  const row = await env.AUTH_DB.prepare('SELECT request_count FROM auth_rate_limits WHERE bucket_hash = ?').bind(bucket).first();
  return Boolean(row && row.request_count > config.rateLimit);
}


async function enforceOrigin(request, config) {
  if (request.headers.get('origin') !== config.origin) return false;
  const site = request.headers.get('sec-fetch-site');
  if (site && site !== 'same-origin') return false;
  try {
    const url = new URL(request.url);
    return url.hostname.toLowerCase() === config.rpId;
  } catch { return false; }
}

async function preauthFromRequest(request, db, now) {
  const token = cookieValue(request, PREAUTH_COOKIE);
  if (!token) return null;
  const tokenHash = await sha256(token);
  const row = await db.prepare('SELECT * FROM auth_preauth WHERE token_hash = ?').bind(tokenHash).first();
  if (!row || row.state !== 'active' || row.expires_at <= now) return null;
  const csrf = request.headers.get('x-csrf-token');
  if (!csrf || !equalConstantTime(csrf, cookieValue(request, PREAUTH_CSRF_COOKIE)) || !equalConstantTime(await sha256(csrf), row.csrf_hash)) return null;
  return row;
}

async function resolveSessionFromDatabase(request, db, now = Date.now()) {
  const token = cookieValue(request, SESSION_COOKIE);
  if (!token) return { state: 'absent' };
  const tokenHash = await sha256(token);
  const row = await db.prepare(`SELECT s.*, a.status AS account_status, a.auth_epoch AS current_epoch
    FROM auth_sessions s JOIN auth_accounts a ON a.actor_id = s.actor_id WHERE s.token_hash = ?`).bind(tokenHash).first();
  if (!row) return { state: 'absent' };
  if (row.revoked_at !== null || row.account_status !== 'active' || row.auth_epoch !== row.current_epoch) return { state: 'revoked' };
  if (row.expired_at !== null || row.idle_expires_at <= now || row.absolute_expires_at <= now) {
    await db.prepare(`UPDATE auth_sessions SET expired_at = COALESCE(expired_at, ?)
      WHERE session_id = ? AND revoked_at IS NULL AND (idle_expires_at <= ? OR absolute_expires_at <= ?)`)
      .bind(now, row.session_id, now, now).run();
    return { state: 'expired' };
  }
  const newIdleExpiry = Math.min(now + Number(row.idle_expires_at - row.last_seen_at), row.absolute_expires_at);
  const refreshed = await db.prepare(`UPDATE auth_sessions SET last_seen_at = ?, idle_expires_at = ?
    WHERE session_id = ? AND token_hash = ? AND revoked_at IS NULL AND expired_at IS NULL
      AND idle_expires_at > ? AND absolute_expires_at > ? AND auth_epoch = ?`)
    .bind(now, newIdleExpiry, row.session_id, tokenHash, now, now, row.current_epoch).run();
  if (refreshed.meta?.changes !== 1) return resolveSessionWithoutRefresh(tokenHash, db, now);
  return {
    state: 'active', actorId: row.actor_id, authEpoch: row.current_epoch,
    sessionId: row.session_id, tokenHash, csrfHash: row.csrf_hash,
  };
}

export async function resolveSession(request, db, authority) {
  if (!authority?.runExclusive) return { state: 'unavailable' };
  try {
    return await authority.runExclusive(async () => {
      await authority.reconcile(db);
      return resolveSessionFromDatabase(request, db, Date.now());
    });
  } catch { return { state: 'unavailable' }; }
}

async function resolveSessionWithoutRefresh(tokenHash, db, now) {
  const row = await db.prepare(`SELECT s.*, a.status AS account_status, a.auth_epoch AS current_epoch
    FROM auth_sessions s JOIN auth_accounts a ON a.actor_id = s.actor_id WHERE s.token_hash = ?`).bind(tokenHash).first();
  if (!row) return { state: 'absent' };
  if (row.revoked_at !== null || row.account_status !== 'active' || row.auth_epoch !== row.current_epoch) return { state: 'revoked' };
  if (row.expired_at !== null || row.idle_expires_at <= now || row.absolute_expires_at <= now) return { state: 'expired' };
  return { state: 'absent' };
}

async function sessionFromRequest(request, env, now) {
  const session = await resolveSessionFromDatabase(request, env.AUTH_DB, now);
  if (session.state !== 'active') return session;
  const csrf = request.headers.get('x-csrf-token');
  if (!csrf || !equalConstantTime(csrf, cookieValue(request, SESSION_CSRF_COOKIE)) || !equalConstantTime(await sha256(csrf), session.csrfHash)) return { state: 'absent' };
  return session;
}

function authErrorStatus(state) { return state === 'absent' || state === 'expired' || state === 'revoked' ? 401 : 503; }

async function operation(db, authority, { purpose, actorId = null, invitationId = null, preauthId = null, challengeId = null, recoveryCodeId = null, sessionId = null, expectedEpoch = null, expectedCounter = null, credentialId = null, payload, now }) {
  const payloadJson = JSON.stringify(payload);
  const payloadHash = await sha256(payloadJson);
  const fields = { operationId: randomId(), purpose, actorId, invitationId, preauthId, challengeId, recoveryCodeId,
    sessionId, expectedEpoch, expectedCounter, credentialId, payloadHash, payloadJson, occurredAt: now };
  if (!authority) throw new Error('AUTHORITY_UNAVAILABLE');
  return authority.commitOperation(db, fields);
}

function makeSessionMaterial(now, config) {
  const token = randomToken(32);
  const csrf = randomToken(32);
  const sessionId = randomId();
  const absolute = now + config.absoluteMs;
  return { token, csrf, sessionId, tokenHashPromise: sha256(token), csrfHashPromise: sha256(csrf), idleExpiresAt: Math.min(now + config.idleMs, absolute), absoluteExpiresAt: absolute };
}

async function makeRecoveryCodes(count) {
  const displayed = [];
  const records = [];
  for (let index = 0; index < count; index += 1) {
    const code = randomToken(RECOVERY_CODE_BYTES);
    displayed.push(code);
    records.push({ id: randomId(), hash: await sha256(code) });
  }
  return { displayed, records };
}

async function issueInvite(request, env, config, now, requestId) {
  const body = await readJson(request);
  if (!onlyKeys(body, [])) return errorResponse(400, 'invalid_request', requestId);
  const expected = env.AUTH_OPERATOR_SECRET;
  const supplied = (request.headers.get('authorization') || '').replace(/^Bearer\s+/iu, '');
  if (!expected || !supplied || !equalConstantTime(await sha256(supplied), await sha256(expected))) return errorResponse(401, 'unauthorized', requestId);
  const invitationToken = randomToken(32);
  const invitationId = randomId();
  await env.AUTH_DB.prepare(`INSERT INTO auth_invitations(invitation_id, token_hash, issued_at, expires_at) VALUES (?, ?, ?, ?)`)
    .bind(invitationId, await sha256(invitationToken), now, now + config.inviteTtlMs).run();
  return json({ invitationId, invitationToken, expiresAt: now + config.inviteTtlMs }, 201);
}

async function revokeInvite(request, env, requestId, invitationId) {
  const expected = env.AUTH_OPERATOR_SECRET;
  const supplied = (request.headers.get('authorization') || '').replace(/^Bearer\s+/iu, '');
  if (!expected || !supplied || !equalConstantTime(await sha256(supplied), await sha256(expected))) return errorResponse(401, 'unauthorized', requestId);
  const invite = await env.AUTH_DB.prepare(`SELECT invitation_id FROM auth_invitations WHERE invitation_id = ? AND revoked_at IS NULL AND consumed_at IS NULL`).bind(invitationId).first();
  if (!invite) return errorResponse(404, 'not_found', requestId);
  await env.AUTHORITY.revokeInvitation(env.AUTH_DB, invitationId, Date.now());
  return json({ ok: true });
}

async function beginRegistration(request, env, config, now, requestId) {
  const body = await readJson(request);
  now = Date.now();
  if (!onlyKeys(body, ['invitationToken']) || typeof body.invitationToken !== 'string' || body.invitationToken.length > 128) return errorResponse(400, 'invalid_request', requestId);
  const invite = await env.AUTH_DB.prepare(`SELECT * FROM auth_invitations WHERE token_hash = ? AND revoked_at IS NULL AND consumed_at IS NULL AND expires_at > ?`)
    .bind(await sha256(body.invitationToken), now).first();
  if (!invite) return errorResponse(400, 'invalid_invitation', requestId);
  const preauthToken = randomToken(32);
  const csrf = randomToken(32);
  const preauthId = randomId();
  const preauthExpires = now + config.preauthTtlMs;
  const handle = randomToken(32);
  const options = await generateRegistrationOptions({
    rpName: 'Asynchronia', rpID: config.rpId, userName: 'Asynchronia player',
    userDisplayName: 'Asynchronia player', userID: base64UrlToBytes(handle),
    attestationType: 'none', timeout: config.challengeTtlMs,
    authenticatorSelection: { residentKey: 'required', userVerification: 'required' },
  });
  const challengeId = randomId();
  await env.AUTH_DB.batch([
    env.AUTH_DB.prepare(`INSERT INTO auth_preauth(preauth_id, token_hash, csrf_hash, purpose, invitation_id, state, created_at, expires_at) VALUES (?, ?, ?, 'register', ?, 'active', ?, ?)`)
      .bind(preauthId, await sha256(preauthToken), await sha256(csrf), invite.invitation_id, now, preauthExpires),
    env.AUTH_DB.prepare(`INSERT INTO auth_challenges(challenge_id, challenge, user_handle, purpose, preauth_id, created_at, expires_at) VALUES (?, ?, ?, 'register', ?, ?, ?)`)
      .bind(challengeId, options.challenge, handle, preauthId, now, now + config.challengeTtlMs),
  ]);
  return json({ ...options, challengeId, csrfToken: csrf }, 200, { 'set-cookie': [cookie(PREAUTH_COOKIE, preauthToken, config.preauthTtlMs), csrfCookie(PREAUTH_CSRF_COOKIE, csrf, config.preauthTtlMs)] });
}

async function verifyRegistration(request, env, config, now, requestId) {
  const body = await readJson(request);
  now = Date.now();
  if (!onlyKeys(body, ['challengeId', 'response']) || typeof body.challengeId !== 'string' || !body.response || typeof body.response !== 'object') return errorResponse(400, 'invalid_request', requestId);
  const preauth = await preauthFromRequest(request, env.AUTH_DB, now);
  if (!preauth || preauth.purpose !== 'register') return errorResponse(401, GENERIC_AUTH, requestId);
  const challenge = await env.AUTH_DB.prepare(`SELECT * FROM auth_challenges WHERE challenge_id = ? AND preauth_id = ? AND purpose = 'register'`)
    .bind(body.challengeId, preauth.preauth_id).first();
  if (!challenge || challenge.consumed_at !== null || challenge.expires_at <= now) return errorResponse(400, 'invalid_credential', requestId);
  let verified;
  try {
    verified = await verifyRegistrationResponse({ response: body.response, expectedChallenge: challenge.challenge,
      expectedOrigin: config.origin, expectedRPID: config.rpId, expectedType: 'webauthn.create', requireUserVerification: true });
  } catch { return errorResponse(400, 'invalid_credential', requestId); }
  const info = verified.registrationInfo;
  if (!verified.verified || !info?.userVerified || !info.credential?.id || !info.credential?.publicKey) return errorResponse(400, 'invalid_credential', requestId);
  const actorId = randomId();
  const session = makeSessionMaterial(now, config);
  const codes = await makeRecoveryCodes(config.recoveryCount);
  const sessionTokenHash = await session.tokenHashPromise;
  const sessionCsrfHash = await session.csrfHashPromise;
  const payload = {
    challenge: challenge.challenge,
    userHandle: challenge.user_handle,
    publicKey: bytesToBase64Url(info.credential.publicKey),
    signCount: Number(info.credential.counter || 0),
    deviceType: info.credentialDeviceType,
    backedUp: Boolean(info.credentialBackedUp),
    transports: JSON.stringify(info.credential.transports || []),
    sessionTokenHash, sessionCsrfHash,
    idleExpiresAt: session.idleExpiresAt, absoluteExpiresAt: session.absoluteExpiresAt,
    recoveryCodes: codes.records,
  };
  try {
    await operation(env.AUTH_DB, env.AUTHORITY, { purpose: 'registration', actorId, invitationId: preauth.invitation_id,
      preauthId: preauth.preauth_id, challengeId: challenge.challenge_id, sessionId: session.sessionId,
      credentialId: info.credential.id, payload, now });
  } catch { return errorResponse(409, 'registration_unavailable', requestId); }
  return json({ actorId, recoveryCodes: codes.displayed, csrfToken: session.csrf }, 201, {
    'set-cookie': [cookie(SESSION_COOKIE, session.token, config.absoluteMs), csrfCookie(SESSION_CSRF_COOKIE, session.csrf, config.absoluteMs), clearCookie(PREAUTH_COOKIE), clearCookie(PREAUTH_CSRF_COOKIE)],
  });
}

async function beginLogin(request, env, config, now, requestId) {
  const body = await readJson(request);
  now = Date.now();
  if (!onlyKeys(body, [])) return errorResponse(400, 'invalid_request', requestId);
  const token = randomToken(32);
  const csrf = randomToken(32);
  const preauthId = randomId();
  const options = await generateAuthenticationOptions({ rpID: config.rpId, userVerification: 'required', timeout: config.challengeTtlMs });
  const challengeId = randomId();
  await env.AUTH_DB.batch([
    env.AUTH_DB.prepare(`INSERT INTO auth_preauth(preauth_id, token_hash, csrf_hash, purpose, state, created_at, expires_at) VALUES (?, ?, ?, 'login', 'active', ?, ?)`)
      .bind(preauthId, await sha256(token), await sha256(csrf), now, now + config.preauthTtlMs),
    env.AUTH_DB.prepare(`INSERT INTO auth_challenges(challenge_id, challenge, purpose, preauth_id, created_at, expires_at) VALUES (?, ?, 'login', ?, ?, ?)`)
      .bind(challengeId, options.challenge, preauthId, now, now + config.challengeTtlMs),
  ]);
  return json({ ...options, challengeId, csrfToken: csrf }, 200, { 'set-cookie': [cookie(PREAUTH_COOKIE, token, config.preauthTtlMs), csrfCookie(PREAUTH_CSRF_COOKIE, csrf, config.preauthTtlMs)] });
}

async function verifyLogin(request, env, config, now, requestId) {
  const body = await readJson(request);
  now = Date.now();
  if (!onlyKeys(body, ['challengeId', 'response']) || typeof body.challengeId !== 'string' || !body.response || typeof body.response !== 'object') return errorResponse(400, 'invalid_request', requestId);
  const preauth = await preauthFromRequest(request, env.AUTH_DB, now);
  if (!preauth || preauth.purpose !== 'login') return errorResponse(401, GENERIC_AUTH, requestId);
  const challenge = await env.AUTH_DB.prepare(`SELECT * FROM auth_challenges WHERE challenge_id = ? AND preauth_id = ? AND purpose = 'login'`)
    .bind(body.challengeId, preauth.preauth_id).first();
  if (!challenge || challenge.consumed_at !== null || challenge.expires_at <= now) return errorResponse(400, 'invalid_credential', requestId);
  const credentialId = body.response.id;
  if (typeof credentialId !== 'string' || !credentialId || credentialId.length > 2048) return errorResponse(400, 'invalid_credential', requestId);
  const row = await env.AUTH_DB.prepare(`SELECT k.*, a.user_handle, a.auth_epoch, a.status AS account_status
    FROM auth_credentials k JOIN auth_accounts a ON a.actor_id = k.actor_id
    WHERE k.credential_id = ? AND k.status = 'active'`).bind(credentialId).first();
  if (!row || row.account_status !== 'active') return errorResponse(401, GENERIC_AUTH, requestId);
  const userHandle = body.response.response?.userHandle;
  if (typeof userHandle !== 'string' || !equalConstantTime(userHandle, row.user_handle)) return errorResponse(401, GENERIC_AUTH, requestId);
  const counter = Number(row.sign_count);
  let verified;
  try {
    verified = await verifyAuthenticationResponse({ response: body.response, expectedChallenge: challenge.challenge,
      expectedOrigin: config.origin, expectedRPID: config.rpId, expectedType: 'webauthn.get', requireUserVerification: true,
      credential: { id: row.credential_id, publicKey: base64UrlToBytes(row.public_key), counter, transports: JSON.parse(row.transports_json) } });
  } catch { return errorResponse(401, GENERIC_AUTH, requestId); }
  const info = verified.authenticationInfo;
  if (!verified.verified || !info?.userVerified) return errorResponse(401, GENERIC_AUTH, requestId);
  // WebAuthn BE (backup eligibility) is permanent for a credential. BS (backed up)
  // may change for an eligible credential; never let an assertion rewrite BE.
  if (info.credentialDeviceType !== row.device_type) return errorResponse(401, GENERIC_AUTH, requestId);
  if (counter !== 0 && info.newCounter <= counter) return errorResponse(401, GENERIC_AUTH, requestId);
  if (counter === 0 && info.newCounter < 0) return errorResponse(401, GENERIC_AUTH, requestId);
  const session = makeSessionMaterial(now, config);
  const sessionTokenHash = await session.tokenHashPromise;
  const sessionCsrfHash = await session.csrfHashPromise;
  try {
    await operation(env.AUTH_DB, env.AUTHORITY, { purpose: 'login', actorId: row.actor_id, preauthId: preauth.preauth_id,
      challengeId: challenge.challenge_id, sessionId: session.sessionId, expectedEpoch: row.auth_epoch,
      expectedCounter: counter, credentialId: row.credential_id,
      payload: { challenge: challenge.challenge, newCounter: info.newCounter,
        deviceType: info.credentialDeviceType, backedUp: Boolean(info.credentialBackedUp),
        sessionTokenHash, sessionCsrfHash, idleExpiresAt: session.idleExpiresAt, absoluteExpiresAt: session.absoluteExpiresAt }, now });
  } catch { return errorResponse(401, GENERIC_AUTH, requestId); }
  return json({ actorId: row.actor_id, csrfToken: session.csrf }, 200, {
    'set-cookie': [cookie(SESSION_COOKIE, session.token, config.absoluteMs), csrfCookie(SESSION_CSRF_COOKIE, session.csrf, config.absoluteMs), clearCookie(PREAUTH_COOKIE), clearCookie(PREAUTH_CSRF_COOKIE)],
  });
}

async function beginAddCredential(request, env, config, now, requestId) {
  const body = await readJson(request);
  now = Date.now();
  if (!onlyKeys(body, [])) return errorResponse(400, 'invalid_request', requestId);
  const session = await sessionFromRequest(request, env, now);
  if (session.state !== 'active') return errorResponse(authErrorStatus(session.state), GENERIC_AUTH, requestId);
  const account = await env.AUTH_DB.prepare('SELECT user_handle FROM auth_accounts WHERE actor_id = ? AND status = \'active\'').bind(session.actorId).first();
  const existing = await env.AUTH_DB.prepare(`SELECT credential_id, transports_json FROM auth_credentials WHERE actor_id = ? AND status = 'active'`).bind(session.actorId).all();
  const options = await generateRegistrationOptions({ rpName: 'Asynchronia', rpID: config.rpId,
    userName: `player-${session.actorId}`, userDisplayName: 'Asynchronia player', userID: base64UrlToBytes(account.user_handle),
    attestationType: 'none', timeout: config.challengeTtlMs,
    excludeCredentials: existing.results.map((item) => ({ id: item.credential_id, transports: JSON.parse(item.transports_json) })),
    authenticatorSelection: { residentKey: 'required', userVerification: 'required' }, });
  const challengeId = randomId();
  await env.AUTH_DB.prepare(`INSERT INTO auth_challenges(challenge_id, challenge, purpose, session_id, actor_id, auth_epoch, created_at, expires_at)
    VALUES (?, ?, 'add_credential', ?, ?, ?, ?, ?)`)
    .bind(challengeId, options.challenge, session.sessionId, session.actorId, session.authEpoch, now, now + config.challengeTtlMs).run();
  return json({ ...options, challengeId });
}

async function verifyAddCredential(request, env, config, now, requestId) {
  const body = await readJson(request);
  now = Date.now();
  if (!onlyKeys(body, ['challengeId', 'response']) || typeof body.challengeId !== 'string' || !body.response || typeof body.response !== 'object') return errorResponse(400, 'invalid_request', requestId);
  const session = await sessionFromRequest(request, env, now);
  if (session.state !== 'active') return errorResponse(authErrorStatus(session.state), GENERIC_AUTH, requestId);
  const challenge = await env.AUTH_DB.prepare(`SELECT * FROM auth_challenges WHERE challenge_id = ? AND session_id = ? AND actor_id = ? AND purpose = 'add_credential'`)
    .bind(body.challengeId, session.sessionId, session.actorId).first();
  if (!challenge || challenge.consumed_at !== null || challenge.expires_at <= now || challenge.auth_epoch !== session.authEpoch) return errorResponse(400, 'invalid_credential', requestId);
  let verified;
  try { verified = await verifyRegistrationResponse({ response: body.response, expectedChallenge: challenge.challenge,
    expectedOrigin: config.origin, expectedRPID: config.rpId, requireUserVerification: true }); }
  catch { return errorResponse(400, 'invalid_credential', requestId); }
  const info = verified.registrationInfo;
  if (!verified.verified || !info?.userVerified || !info.credential?.id) return errorResponse(400, 'invalid_credential', requestId);
  try {
    await operation(env.AUTH_DB, env.AUTHORITY, { purpose: 'add_credential', actorId: session.actorId,
      challengeId: challenge.challenge_id, sessionId: session.sessionId, expectedEpoch: session.authEpoch,
      credentialId: info.credential.id,
      payload: { challenge: challenge.challenge, sessionTokenHash: session.tokenHash,
        publicKey: bytesToBase64Url(info.credential.publicKey), signCount: Number(info.credential.counter || 0),
        deviceType: info.credentialDeviceType, backedUp: Boolean(info.credentialBackedUp),
        transports: JSON.stringify(info.credential.transports || []) }, now });
  } catch { return errorResponse(409, 'credential_unavailable', requestId); }
  return json({ ok: true });
}

async function beginRecovery(request, env, config, now, requestId) {
  const body = await readJson(request);
  now = Date.now();
  if (!onlyKeys(body, ['recoveryCode']) || typeof body.recoveryCode !== 'string' || body.recoveryCode.length > 128) return errorResponse(400, 'invalid_request', requestId);
  const codeHash = await sha256(body.recoveryCode);
  const code = await env.AUTH_DB.prepare(`SELECT r.recovery_code_id, r.actor_id, a.auth_epoch FROM auth_recovery_codes r
    JOIN auth_accounts a ON a.actor_id = r.actor_id WHERE r.code_hash = ? AND r.used_at IS NULL
    AND r.revoked_at IS NULL AND a.status = 'active'`).bind(codeHash).first();
  if (!code) return errorResponse(401, 'invalid_recovery', requestId);
  const token = randomToken(32);
  const csrf = randomToken(32);
  const preauthId = randomId();
  try {
    await env.AUTH_DB.prepare(`INSERT INTO auth_preauth(preauth_id, token_hash, csrf_hash, purpose, actor_id, recovery_code_id, auth_epoch, state, created_at, expires_at)
      VALUES (?, ?, ?, 'recovery', ?, ?, ?, 'active', ?, ?)`)
      .bind(preauthId, await sha256(token), await sha256(csrf), code.actor_id, code.recovery_code_id, code.auth_epoch, now, now + config.preauthTtlMs).run();
  } catch { return errorResponse(409, 'recovery_unavailable', requestId); }
  return json({ csrfToken: csrf, expiresAt: now + config.preauthTtlMs }, 200, { 'set-cookie': [cookie(PREAUTH_COOKIE, token, config.preauthTtlMs), csrfCookie(PREAUTH_CSRF_COOKIE, csrf, config.preauthTtlMs)] });
}

async function beginRecoveryPasskey(request, env, config, now, requestId) {
  const body = await readJson(request);
  now = Date.now();
  if (!onlyKeys(body, [])) return errorResponse(400, 'invalid_request', requestId);
  const preauth = await preauthFromRequest(request, env.AUTH_DB, now);
  if (!preauth || preauth.purpose !== 'recovery') return errorResponse(401, GENERIC_AUTH, requestId);
  const account = await env.AUTH_DB.prepare('SELECT user_handle FROM auth_accounts WHERE actor_id = ? AND status = \'active\' AND auth_epoch = ?')
    .bind(preauth.actor_id, preauth.auth_epoch).first();
  if (!account) return errorResponse(401, GENERIC_AUTH, requestId);
  const options = await generateRegistrationOptions({ rpName: 'Asynchronia', rpID: config.rpId,
    userName: `player-${preauth.actor_id}`, userDisplayName: 'Asynchronia player', userID: base64UrlToBytes(account.user_handle),
    attestationType: 'none', timeout: config.challengeTtlMs,
    authenticatorSelection: { residentKey: 'required', userVerification: 'required' } });
  const challengeId = randomId();
  await env.AUTH_DB.prepare(`INSERT INTO auth_challenges(challenge_id, challenge, purpose, preauth_id, actor_id, auth_epoch, created_at, expires_at)
    VALUES (?, ?, 'recovery', ?, ?, ?, ?, ?)`)
    .bind(challengeId, options.challenge, preauth.preauth_id, preauth.actor_id, preauth.auth_epoch, now, now + config.challengeTtlMs).run();
  return json({ ...options, challengeId });
}

async function verifyRecoveryPasskey(request, env, config, now, requestId) {
  const body = await readJson(request);
  now = Date.now();
  if (!onlyKeys(body, ['challengeId', 'response']) || typeof body.challengeId !== 'string' || !body.response || typeof body.response !== 'object') return errorResponse(400, 'invalid_request', requestId);
  const preauth = await preauthFromRequest(request, env.AUTH_DB, now);
  if (!preauth || preauth.purpose !== 'recovery') return errorResponse(401, GENERIC_AUTH, requestId);
  const challenge = await env.AUTH_DB.prepare(`SELECT * FROM auth_challenges WHERE challenge_id = ? AND preauth_id = ? AND actor_id = ? AND purpose = 'recovery'`)
    .bind(body.challengeId, preauth.preauth_id, preauth.actor_id).first();
  if (!challenge || challenge.consumed_at !== null || challenge.expires_at <= now || challenge.auth_epoch !== preauth.auth_epoch) return errorResponse(400, 'invalid_credential', requestId);
  let verified;
  try { verified = await verifyRegistrationResponse({ response: body.response, expectedChallenge: challenge.challenge,
    expectedOrigin: config.origin, expectedRPID: config.rpId, requireUserVerification: true }); }
  catch { return errorResponse(400, 'invalid_credential', requestId); }
  const info = verified.registrationInfo;
  if (!verified.verified || !info?.userVerified || !info.credential?.id) return errorResponse(400, 'invalid_credential', requestId);
  const session = makeSessionMaterial(now, config);
  const codes = await makeRecoveryCodes(config.recoveryCount);
  try {
    await operation(env.AUTH_DB, env.AUTHORITY, { purpose: 'recovery', actorId: preauth.actor_id, preauthId: preauth.preauth_id,
      challengeId: challenge.challenge_id, recoveryCodeId: preauth.recovery_code_id,
      sessionId: session.sessionId, expectedEpoch: preauth.auth_epoch, credentialId: info.credential.id,
      payload: { challenge: challenge.challenge, publicKey: bytesToBase64Url(info.credential.publicKey),
        signCount: Number(info.credential.counter || 0), deviceType: info.credentialDeviceType,
        backedUp: Boolean(info.credentialBackedUp), transports: JSON.stringify(info.credential.transports || []),
        sessionTokenHash: await session.tokenHashPromise, sessionCsrfHash: await session.csrfHashPromise,
        idleExpiresAt: session.idleExpiresAt, absoluteExpiresAt: session.absoluteExpiresAt, recoveryCodes: codes.records }, now });
  } catch { return errorResponse(409, 'recovery_unavailable', requestId); }
  return json({ actorId: preauth.actor_id, recoveryCodes: codes.displayed, csrfToken: session.csrf }, 200, {
    'set-cookie': [cookie(SESSION_COOKIE, session.token, config.absoluteMs), csrfCookie(SESSION_CSRF_COOKIE, session.csrf, config.absoluteMs), clearCookie(PREAUTH_COOKIE), clearCookie(PREAUTH_CSRF_COOKIE)],
  });
}

async function logout(request, env, now, requestId) {
  const session = await sessionFromRequest(request, env, now);
  if (session.state !== 'active') return json({ ok: true }, 200, { 'set-cookie': [clearCookie(SESSION_COOKIE), clearCookie(SESSION_CSRF_COOKIE)] });
  try {
    await operation(env.AUTH_DB, env.AUTHORITY, { purpose: 'logout', actorId: session.actorId, sessionId: session.sessionId,
      expectedEpoch: session.authEpoch, payload: { sessionTokenHash: session.tokenHash }, now });
  } catch { return errorResponse(503, 'temporarily_unavailable', requestId); }
  return json({ ok: true }, 200, { 'set-cookie': [clearCookie(SESSION_COOKIE), clearCookie(SESSION_CSRF_COOKIE)] });
}

async function revokeAll(request, env, now, requestId) {
  const session = await sessionFromRequest(request, env, now);
  if (session.state !== 'active') return errorResponse(authErrorStatus(session.state), GENERIC_AUTH, requestId);
  try { await operation(env.AUTH_DB, env.AUTHORITY, { purpose: 'revoke_all', actorId: session.actorId, sessionId: session.sessionId,
    expectedEpoch: session.authEpoch, payload: { sessionTokenHash: session.tokenHash }, now }); }
  catch { return errorResponse(503, 'temporarily_unavailable', requestId); }
  return json({ ok: true }, 200, { 'set-cookie': [clearCookie(SESSION_COOKIE), clearCookie(SESSION_CSRF_COOKIE)] });
}

async function rotateCodes(request, env, config, now, requestId) {
  const session = await sessionFromRequest(request, env, now);
  if (session.state !== 'active') return errorResponse(authErrorStatus(session.state), GENERIC_AUTH, requestId);
  const codes = await makeRecoveryCodes(config.recoveryCount);
  try { await operation(env.AUTH_DB, env.AUTHORITY, { purpose: 'rotate_recovery_codes', actorId: session.actorId,
    sessionId: session.sessionId, expectedEpoch: session.authEpoch,
    payload: { sessionTokenHash: session.tokenHash, recoveryCodes: codes.records }, now }); }
  catch { return errorResponse(503, 'temporarily_unavailable', requestId); }
  return json({ recoveryCodes: codes.displayed });
}


export async function pruneTerminalSessions(db, now, retentionMs, authority) {
  if (!Number.isSafeInteger(now) || !Number.isSafeInteger(retentionMs) || retentionMs < 0) throw new TypeError('invalid_cleanup_window');
  if (!authority?.runExclusive) throw new Error('AUTHORITY_UNAVAILABLE');
  const cutoff = now - retentionMs;
  return authority.runExclusive(async () => {
    await authority.reconcile(db);
    return db.batch([
      db.prepare(`UPDATE auth_sessions SET expired_at = ? WHERE expired_at IS NULL AND revoked_at IS NULL AND (idle_expires_at <= ? OR absolute_expires_at <= ?)`)
        .bind(now, now, now),
      db.prepare(`DELETE FROM auth_challenges WHERE (consumed_at IS NOT NULL AND consumed_at <= ?) OR expires_at <= ?`)
        .bind(cutoff, now),
      db.prepare(`UPDATE auth_preauth SET state = 'expired' WHERE state = 'active' AND expires_at <= ?`).bind(now),
      db.prepare(`DELETE FROM auth_preauth WHERE state IN ('used', 'expired', 'revoked') AND expires_at <= ?`).bind(cutoff),
      db.prepare(`DELETE FROM auth_sessions WHERE (revoked_at IS NOT NULL AND revoked_at <= ?) OR (expired_at IS NOT NULL AND expired_at <= ?)`)
        .bind(cutoff, cutoff),
      db.prepare(`DELETE FROM auth_rate_limits WHERE expires_at <= ?`).bind(now),
    ]);
  });
}

async function getSession(request, env, now, requestId) {
  const session = await resolveSessionFromDatabase(request, env.AUTH_DB, now);
  if (session.state !== 'active') return errorResponse(authErrorStatus(session.state), GENERIC_AUTH, requestId);
  return json({ actorId: session.actorId, csrfToken: null });
}

async function route(request, env, config, requestId) {
  if (!config || !env.AUTH_DB || !env.AUTHORITY || !env.AUTH_RATE_LIMIT_KEY) return errorResponse(503, 'temporarily_unavailable', requestId);
  const now = Date.now();
  try { await env.AUTHORITY.reconcile(env.AUTH_DB); } catch { return errorResponse(503, 'temporarily_unavailable', requestId); }
  if (!await storeReady(env.AUTH_DB, config)) return errorResponse(503, 'temporarily_unavailable', requestId);
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method.toUpperCase();
  const rateKey = method === 'POST' && /^\/v1\/auth\/invitations\/[0-9a-f-]{36}\/revoke$/u.test(path)
    ? 'POST /v1/auth/invitations/:id/revoke'
    : `${method} ${path}`;
  const knownWrite = method === 'POST' && [
    '/v1/auth/invitations', '/v1/auth/register/options', '/v1/auth/register/verify',
    '/v1/auth/login/options', '/v1/auth/login/verify', '/v1/auth/logout', '/v1/auth/sessions/revoke-all',
    '/v1/auth/passkeys/add/options', '/v1/auth/passkeys/add/verify', '/v1/auth/recovery/begin',
    '/v1/auth/recovery/options', '/v1/auth/recovery/verify', '/v1/auth/recovery/codes/rotate',
  ].includes(path) || (method === 'POST' && rateKey === 'POST /v1/auth/invitations/:id/revoke');
  if (method !== 'GET' && !knownWrite) return errorResponse(404, 'not_found', requestId);
  const isWrite = method !== 'GET' && method !== 'HEAD';
  if (isWrite && !await enforceOrigin(request, config)) return errorResponse(403, 'origin_rejected', requestId);
  if (isWrite && await rateLimit(request, env, config, rateKey, now)) return errorResponse(429, 'rate_limited', requestId);
  if (method === 'POST' && path === '/v1/auth/invitations') return issueInvite(request, env, config, now, requestId);
  const inviteRevoke = /^\/v1\/auth\/invitations\/([0-9a-f-]{36})\/revoke$/u.exec(path);
  if (method === 'POST' && inviteRevoke) return revokeInvite(request, env, requestId, inviteRevoke[1]);
  if (method === 'POST' && path === '/v1/auth/register/options') return beginRegistration(request, env, config, now, requestId);
  if (method === 'POST' && path === '/v1/auth/register/verify') return verifyRegistration(request, env, config, now, requestId);
  if (method === 'POST' && path === '/v1/auth/login/options') return beginLogin(request, env, config, now, requestId);
  if (method === 'POST' && path === '/v1/auth/login/verify') return verifyLogin(request, env, config, now, requestId);
  if (method === 'GET' && path === '/v1/auth/session') return getSession(request, env, now, requestId);
  if (method === 'POST' && path === '/v1/auth/logout') return logout(request, env, now, requestId);
  if (method === 'POST' && path === '/v1/auth/sessions/revoke-all') return revokeAll(request, env, now, requestId);
  if (method === 'POST' && path === '/v1/auth/passkeys/add/options') return beginAddCredential(request, env, config, now, requestId);
  if (method === 'POST' && path === '/v1/auth/passkeys/add/verify') return verifyAddCredential(request, env, config, now, requestId);
  if (method === 'POST' && path === '/v1/auth/recovery/begin') return beginRecovery(request, env, config, now, requestId);
  if (method === 'POST' && path === '/v1/auth/recovery/options') return beginRecoveryPasskey(request, env, config, now, requestId);
  if (method === 'POST' && path === '/v1/auth/recovery/verify') return verifyRecoveryPasskey(request, env, config, now, requestId);
  if (method === 'POST' && path === '/v1/auth/recovery/codes/rotate') return rotateCodes(request, env, config, now, requestId);
  return errorResponse(404, 'not_found', requestId);
}

export default {
  async fetch(request, env) {
    const requestId = randomId();
    try {
      if (!env?.AUTHORITY?.runExclusive) return errorResponse(503, 'temporarily_unavailable', requestId);
      const buffered = await bufferRequestBeforeAuthorityLock(request);
      if (buffered.tooLarge) return errorResponse(413, 'body_too_large', requestId);
      return await env.AUTHORITY.runExclusive(() => route(buffered.request, env, readConfig(env), requestId));
    }
    catch (error) {
      if (error instanceof RequestInputError) return errorResponse(error.status, error.code, requestId);
      return errorResponse(503, 'temporarily_unavailable', requestId);
    }
  },
};
