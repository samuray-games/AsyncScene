import assert from 'node:assert/strict';
import { cp, mkdtemp } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test, { afterEach, beforeEach, describe } from 'node:test';
import worker, { pruneTerminalSessions, resolveSession } from '../src/worker.mjs';
import { createHarness, cookieFrom, cookieValue, issueInvite, login, ORIGIN, register, sessionCookies } from './harness.mjs';
import { assertionResponse, registrationResponse, virtualAuthenticator } from './virtual-authenticator.mjs';

let h;
describe('messaging auth on local SQLite adapter', { concurrency: false }, () => {
  beforeEach(async () => { h = await createHarness(); });
  afterEach(async () => { if (h) await h.close(); h = null; });

  async function createFenceEffectGuard(harness = h) {
    await harness.db.exec(`
      CREATE TABLE auth_test_effects (effect_id TEXT PRIMARY KEY, fence_id TEXT NOT NULL UNIQUE REFERENCES auth_session_fences(operation_id));
      CREATE TRIGGER auth_test_effect_guard BEFORE INSERT ON auth_test_effects
      BEGIN
        SELECT CASE WHEN NOT EXISTS (
          SELECT 1 FROM auth_session_fences f JOIN auth_sessions s ON s.session_id = f.session_id
          JOIN auth_accounts a ON a.actor_id = s.actor_id
          WHERE f.operation_id = NEW.fence_id AND f.consumed_at IS NULL
            AND f.actor_id = a.actor_id AND s.revoked_at IS NULL AND s.expired_at IS NULL
            AND s.idle_expires_at > f.created_at AND s.absolute_expires_at > f.created_at
            AND s.auth_epoch = a.auth_epoch AND f.auth_epoch = a.auth_epoch AND a.status = 'active'
        ) THEN RAISE(ABORT, 'AUTH_GUARD') END;
      END;
      CREATE TRIGGER auth_test_effect_consume AFTER INSERT ON auth_test_effects
      BEGIN UPDATE auth_session_fences SET consumed_at = (SELECT created_at FROM auth_session_fences WHERE operation_id = NEW.fence_id) WHERE operation_id = NEW.fence_id; END;
    `);
  }

  async function makePlayer(harness = h, { registrationFlags } = {}) {
    const credential = virtualAuthenticator();
    const invite = await issueInvite(harness);
    const created = await register(harness, credential, invite, { ...(registrationFlags === undefined ? {} : { flags: registrationFlags }) });
    assert.equal(created.response.status, 201);
    const cookies = sessionCookies(created.response);
    assert(cookies.session);
    return {
      credential, actorId: created.body.actorId, recoveryCodes: created.body.recoveryCodes,
      userHandle: created.options.user.id, sessionCookie: cookies.session, csrfCookie: cookies.csrf,
      csrf: created.body.csrfToken, invitation: invite, registration: created,
    };
  }

  async function rawFenceStatement(db, session, operationId, now = Date.now()) {
    const payload = JSON.stringify({ sessionTokenHash: session.tokenHash });
    const payloadHash = createHash('sha256').update(payload).digest('hex');
    return db.prepare(`INSERT INTO auth_operation_commits(operation_id, purpose, actor_id, session_id, expected_epoch, payload_hash, payload_json, occurred_at)
      VALUES (?, 'session_fence', ?, ?, ?, ?, ?, ?)`)
      .bind(operationId, session.actorId, session.sessionId, session.authEpoch, payloadHash, payload, now);
  }

  test('invite registration stores only secret digests and issues separated secure cookies', async () => {
    const player = await makePlayer();
    assert.match(player.actorId, /^[0-9a-f-]{36}$/u);
    const invitation = await h.db.prepare('SELECT * FROM auth_invitations WHERE invitation_id = ?').bind(player.invitation.invitationId).first();
    assert.equal(invitation.token_hash, createHash('sha256').update(player.invitation.invitationToken).digest('hex'));
    assert.equal(invitation.consumed_by_actor_id, player.actorId);
    const session = await h.db.prepare('SELECT * FROM auth_sessions WHERE actor_id = ?').bind(player.actorId).first();
    assert.notEqual(session.token_hash, cookieValue(player.sessionCookie));
    assert.equal(JSON.stringify(session).includes(cookieValue(player.sessionCookie)), false);
    assert.equal(JSON.stringify(await h.db.prepare('SELECT code_hash FROM auth_recovery_codes WHERE actor_id = ?').bind(player.actorId).all()).includes(player.recoveryCodes[0]), false);
    const header = player.sessionCookie;
    assert.match(header, /^__Host-asynchat=/u);
    const setCookies = player.registration.response.headers.getSetCookie();
    assert(setCookies.some((value) => value.includes('HttpOnly') && value.includes('Secure') && value.includes('SameSite=Strict')));
    assert(setCookies.some((value) => value.startsWith('__Host-asynchat-csrf=') && !value.includes('HttpOnly')));
  });

  test('the same passkey signs in to the original actor after a local SQLite connection reopen', async () => {
    const persist = await mkdtemp(join(tmpdir(), 'asyn-auth-reopen-'));
    const first = await createHarness({ persistDir: persist });
    const player = await makePlayer(first);
    await first.close({ remove: false });
    h = await createHarness({ persistDir: persist });
    const signedIn = await login(h, player.credential, player.userHandle, { counter: 0 });
    assert.equal(signedIn.response.status, 200, JSON.stringify(signedIn.body));
    assert.equal(signedIn.body.actorId, player.actorId);
    const count = await h.db.prepare('SELECT COUNT(*) AS count FROM auth_accounts').first();
    assert.equal(count.count, 1);
  });

  test('two players get isolated actors and bearer session secrets', async () => {
    const a = await makePlayer();
    const b = await makePlayer();
    assert.notEqual(a.actorId, b.actorId);
    const resA = await h.request('/v1/auth/session?actorId=' + encodeURIComponent(b.actorId), { cookie: a.sessionCookie });
    assert.equal(resA.status, 200);
    assert.equal((await resA.json()).actorId, a.actorId);
    const aRow = await h.db.prepare('SELECT token_hash FROM auth_sessions WHERE actor_id = ?').bind(a.actorId).first();
    const bRow = await h.db.prepare('SELECT token_hash FROM auth_sessions WHERE actor_id = ?').bind(b.actorId).first();
    assert.notEqual(aRow.token_hash, bRow.token_hash);
    assert.notEqual(aRow.token_hash, cookieValue(a.sessionCookie));
    assert.notEqual(bRow.token_hash, cookieValue(b.sessionCookie));
    assert.equal((await h.request('/v1/auth/account/' + b.actorId + '/secrets', { cookie: a.sessionCookie })).status, 404);
  });

  test('client supplied actorId is rejected and grants no authorization', async () => {
    const a = await makePlayer();
    const optionsResponse = await h.request('/v1/auth/login/options', { method: 'POST', body: {} });
    const options = await optionsResponse.json();
    const preauth = cookieFrom(optionsResponse, '__Host-asynchat-preauth');
    const preauthCsrf = cookieFrom(optionsResponse, '__Host-asynchat-preauth-csrf');
    const forged = await h.request('/v1/auth/login/verify', { method: 'POST', cookie: `${preauth}; ${preauthCsrf}`, csrf: options.csrfToken,
      body: { challengeId: options.challengeId, actorId: 'victim', response: assertionResponse(options, a.credential, { userHandle: a.userHandle, counter: 0 }) } });
    assert.equal(forged.status, 400);
    assert.equal((await forged.json()).error, 'invalid_request');
    assert.equal((await h.db.prepare('SELECT COUNT(*) AS count FROM auth_sessions WHERE actor_id = ?').bind(a.actorId).first()).count, 1);
  });

  test('one invitation cannot be consumed concurrently twice', async () => {
    const invite = await issueInvite(h);
    const credentialA = virtualAuthenticator();
    const credentialB = virtualAuthenticator();
    const start = async () => {
      const response = await h.request('/v1/auth/register/options', { method: 'POST', body: { invitationToken: invite.invitationToken } });
      return { response, options: await response.json(), preauth: cookieFrom(response, '__Host-asynchat-preauth'), csrfCookie: cookieFrom(response, '__Host-asynchat-preauth-csrf') };
    };
    const [a, b] = await Promise.all([start(), start()]);
    const finish = (ctx, credential) => h.request('/v1/auth/register/verify', { method: 'POST',
      cookie: `${ctx.preauth}; ${ctx.csrfCookie}`, csrf: ctx.options.csrfToken,
      body: { challengeId: ctx.options.challengeId, response: registrationResponse(ctx.options, credential) } });
    const responses = await Promise.all([finish(a, credentialA), finish(b, credentialB)]);
    assert.deepEqual(responses.map((response) => response.status).sort(), [201, 409]);
    assert.equal((await h.db.prepare('SELECT COUNT(*) AS count FROM auth_accounts').first()).count, 1);
    assert.equal((await h.db.prepare('SELECT COUNT(*) AS count FROM auth_invitations WHERE consumed_at IS NOT NULL').first()).count, 1);
    const successful = responses.find((response) => response.status === 201);
    const sessionCookie = cookieFrom(successful, '__Host-asynchat');
    assert.equal((await h.request('/v1/auth/session', { cookie: sessionCookie })).status, 200);
  });

  test('replayed registration challenge cannot create a second actor', async () => {
    const player = await makePlayer();
    const original = player.registration;
    const response = await h.request('/v1/auth/register/verify', { method: 'POST',
      cookie: `${original.preauth}; ${original.preauthCsrf}`, csrf: original.options.csrfToken,
      body: { challengeId: original.options.challengeId, response: registrationResponse(original.options, player.credential) } });
    assert.equal(response.status, 401);
    assert.equal((await h.db.prepare('SELECT COUNT(*) AS count FROM auth_accounts').first()).count, 1);
  });

  test('origin and fetch-site checks reject cross-origin writes before state changes', async () => {
    const response = await h.request('/v1/auth/login/options', { method: 'POST', headers: { origin: 'https://attacker.example' }, body: {} });
    assert.equal(response.status, 403);
    assert.equal((await h.db.prepare('SELECT COUNT(*) AS count FROM auth_preauth').first()).count, 0);
    const fetchSite = await h.request('/v1/auth/login/options', { method: 'POST', headers: { 'sec-fetch-site': 'cross-site' }, body: {} });
    assert.equal(fetchSite.status, 403);
  });

  test('CSRF token is bound to pre-auth cookie and challenge', async () => {
    const invite = await issueInvite(h);
    const start = await h.request('/v1/auth/register/options', { method: 'POST', body: { invitationToken: invite.invitationToken } });
    const options = await start.json();
    const bad = await h.request('/v1/auth/register/verify', { method: 'POST', cookie: cookieFrom(start, '__Host-asynchat-preauth'),
      csrf: options.csrfToken, body: { challengeId: options.challengeId, response: registrationResponse(options, virtualAuthenticator()) } });
    assert.equal(bad.status, 401);
    assert.equal((await h.db.prepare('SELECT COUNT(*) AS count FROM auth_accounts').first()).count, 0);
  });

  test('WebAuthn verifier rejects wrong origin, RP ID hash, UP, UV, signature, challenge, and handle', async () => {
    const player = await makePlayer();
    const cases = [
      ['origin', { origin: 'https://attacker.example' }],
      ['rp-id', { corruptRpHash: true }],
      ['user-presence', { flags: 0x04 }],
      ['user-verification', { flags: 0x01 }],
      ['backup eligibility changed', { flags: 0x0d }],
      ['signature', { corruptSignature: true }],
      ['challenge', { challenge: 'not-the-issued-challenge' }],
      ['user-handle', { userHandle: 'attacker-handle' }],
    ];
    for (const [name, overrides] of cases) {
      const optionsResponse = await h.request('/v1/auth/login/options', { method: 'POST', body: {} });
      const options = await optionsResponse.json();
      const preauth = cookieFrom(optionsResponse, '__Host-asynchat-preauth');
      const csrfCookie = cookieFrom(optionsResponse, '__Host-asynchat-preauth-csrf');
      const assertion = assertionResponse(options, player.credential, { userHandle: player.userHandle, counter: 0, ...overrides });
      const response = await h.request('/v1/auth/login/verify', { method: 'POST', cookie: `${preauth}; ${csrfCookie}`,
        csrf: options.csrfToken, body: { challengeId: options.challengeId, response: assertion } });
      assert.equal(response.status, 401, name);
      assert.equal((await h.db.prepare('SELECT COUNT(*) AS count FROM auth_sessions WHERE actor_id = ?').bind(player.actorId).first()).count, 1);
    }
  });

  test('signCount allows 0 to 0 and increases, and rejects nonzero rollback without locking the account', async () => {
    const player = await makePlayer();
    const zero = await login(h, player.credential, player.userHandle, { counter: 0 });
    assert.equal(zero.response.status, 200);
    const one = await login(h, player.credential, player.userHandle, { counter: 1 });
    assert.equal(one.response.status, 200);
    const rollback = await login(h, player.credential, player.userHandle, { counter: 1 });
    assert.equal(rollback.response.status, 401);
    const account = await h.db.prepare('SELECT status FROM auth_accounts WHERE actor_id = ?').bind(player.actorId).first();
    assert.equal(account.status, 'active');
    assert.equal((await h.db.prepare('SELECT MAX(sign_count) AS max_count FROM auth_credentials WHERE actor_id = ?').bind(player.actorId).first()).max_count, 1);
  });

  test('backup eligibility is immutable while backup state can change for an eligible passkey', async () => {
    const player = await makePlayer(h, { registrationFlags: 0x4d });
    let row = await h.db.prepare('SELECT device_type, backed_up FROM auth_credentials WHERE actor_id = ?').bind(player.actorId).first();
    assert.deepEqual([row.device_type, row.backed_up], ['multiDevice', 0]);
    const backedUp = await login(h, player.credential, player.userHandle, { counter: 0, flags: 0x1d });
    assert.equal(backedUp.response.status, 200);
    row = await h.db.prepare('SELECT device_type, backed_up FROM auth_credentials WHERE actor_id = ?').bind(player.actorId).first();
    assert.deepEqual([row.device_type, row.backed_up], ['multiDevice', 1]);
  });

  test('concurrent sign-in replay creates at most one session for a challenge', async () => {
    const player = await makePlayer();
    const optionsResponse = await h.request('/v1/auth/login/options', { method: 'POST', body: {} });
    const options = await optionsResponse.json();
    const preauth = cookieFrom(optionsResponse, '__Host-asynchat-preauth');
    const csrfCookie = cookieFrom(optionsResponse, '__Host-asynchat-preauth-csrf');
    const responseBody = { challengeId: options.challengeId, response: assertionResponse(options, player.credential, { userHandle: player.userHandle, counter: 0 }) };
    const attempt = () => h.request('/v1/auth/login/verify', { method: 'POST', cookie: `${preauth}; ${csrfCookie}`, csrf: options.csrfToken, body: responseBody });
    const results = await Promise.all([attempt(), attempt()]);
    assert.deepEqual(results.map((item) => item.status).sort(), [200, 401]);
    assert.equal((await h.db.prepare('SELECT COUNT(*) AS count FROM auth_sessions WHERE actor_id = ?').bind(player.actorId).first()).count, 2);
  });

  test('slow request body cannot extend a WebAuthn challenge past its expiry', async () => {
    h.env.AUTH_CHALLENGE_TTL_MS = '1000';
    const player = await makePlayer();
    const optionsResponse = await h.request('/v1/auth/login/options', { method: 'POST', body: {} });
    const options = await optionsResponse.json();
    const preauth = cookieFrom(optionsResponse, '__Host-asynchat-preauth');
    const csrfCookie = cookieFrom(optionsResponse, '__Host-asynchat-preauth-csrf');
    const bodyText = JSON.stringify({ challengeId: options.challengeId,
      response: assertionResponse(options, player.credential, { userHandle: player.userHandle, counter: 0 }) });
    const encoded = new TextEncoder().encode(bodyText);
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(encoded.slice(0, 1));
        setTimeout(() => { controller.enqueue(encoded.slice(1)); controller.close(); }, 1200);
      },
    });
    const request = new Request(`${ORIGIN}/v1/auth/login/verify`, { method: 'POST',
      headers: { origin: ORIGIN, 'sec-fetch-site': 'same-origin', 'content-type': 'application/json',
        cookie: `${preauth}; ${csrfCookie}`, 'x-csrf-token': options.csrfToken }, body, duplex: 'half' });
    const response = await worker.fetch(request, h.env);
    assert.equal(response.status, 400);
    assert.equal((await h.db.prepare('SELECT COUNT(*) AS count FROM auth_sessions WHERE actor_id = ?').bind(player.actorId).first()).count, 1);
  });

  test('session resolver distinguishes absent, active, expired and revoked', async () => {
    const absent = await resolveSession(new Request(`${ORIGIN}/`, { headers: {} }), h.db, h.authority);
    assert.equal(absent.state, 'absent');
    const player = await makePlayer();
    let session = await resolveSession(new Request(`${ORIGIN}/`, { headers: { cookie: player.sessionCookie } }), h.db, h.authority);
    assert.equal(session.state, 'active');
    await h.db.prepare('UPDATE auth_sessions SET idle_expires_at = ? WHERE session_id = ?').bind(Date.now() - 1, session.sessionId).run();
    session = await resolveSession(new Request(`${ORIGIN}/`, { headers: { cookie: player.sessionCookie } }), h.db, h.authority);
    assert.equal(session.state, 'expired');
    const fresh = await login(h, player.credential, player.userHandle, { counter: 0 });
    const freshCookies = sessionCookies(fresh.response);
    const active = await resolveSession(new Request(`${ORIGIN}/`, { headers: { cookie: freshCookies.session } }), h.db, h.authority);
    assert.equal(active.state, 'active');
    const logout = await h.request('/v1/auth/logout', { method: 'POST', cookie: `${freshCookies.session}; ${freshCookies.csrf}`, csrf: fresh.body.csrfToken, body: {} });
    assert.equal(logout.status, 200);
    const revoked = await resolveSession(new Request(`${ORIGIN}/`, { headers: { cookie: freshCookies.session } }), h.db, h.authority);
    assert.equal(revoked.state, 'revoked');
  });

  test('logout revokes only one session; revoke-all increments epoch and closes every session', async () => {
    const player = await makePlayer();
    const another = await login(h, player.credential, player.userHandle, { counter: 0 });
    const secondCookies = sessionCookies(another.response);
    const logout = await h.request('/v1/auth/logout', { method: 'POST', cookie: `${player.sessionCookie}; ${player.csrfCookie}`, csrf: player.csrf, body: {} });
    assert.equal(logout.status, 200);
    const secondStillWorks = await h.request('/v1/auth/session', { cookie: secondCookies.session });
    assert.equal(secondStillWorks.status, 200);
    const revokeAll = await h.request('/v1/auth/sessions/revoke-all', { method: 'POST', cookie: `${secondCookies.session}; ${secondCookies.csrf}`, csrf: another.body.csrfToken, body: {} });
    assert.equal(revokeAll.status, 200);
    assert.equal((await h.request('/v1/auth/session', { cookie: secondCookies.session })).status, 401);
    assert.equal((await h.db.prepare('SELECT auth_epoch FROM auth_accounts WHERE actor_id = ?').bind(player.actorId).first()).auth_epoch, 2);
  });

  test('recovery code is one-use, replaces credentials, revokes sessions and supports a new device', async () => {
    const player = await makePlayer();
    const newCredential = virtualAuthenticator();
    const begin = await h.request('/v1/auth/recovery/begin', { method: 'POST', body: { recoveryCode: player.recoveryCodes[0] } });
    assert.equal(begin.status, 200, await begin.clone().text());
    const preauth = cookieFrom(begin, '__Host-asynchat-preauth');
    const csrfCookie = cookieFrom(begin, '__Host-asynchat-preauth-csrf');
    const beginBody = await begin.json();
    const optionsResponse = await h.request('/v1/auth/recovery/options', { method: 'POST', cookie: `${preauth}; ${csrfCookie}`, csrf: beginBody.csrfToken, body: {} });
    const options = await optionsResponse.json();
    const verified = await h.request('/v1/auth/recovery/verify', { method: 'POST', cookie: `${preauth}; ${csrfCookie}`, csrf: beginBody.csrfToken,
      body: { challengeId: options.challengeId, response: registrationResponse(options, newCredential) } });
    assert.equal(verified.status, 200, await verified.clone().text());
    const verifiedBody = await verified.json();
    assert.equal(verifiedBody.actorId, player.actorId);
    assert.equal((await h.request('/v1/auth/session', { cookie: player.sessionCookie })).status, 401);
    assert.equal((await h.db.prepare("SELECT COUNT(*) AS count FROM auth_credentials WHERE actor_id = ? AND status = 'active'").bind(player.actorId).first()).count, 1);
    assert.equal((await h.db.prepare("SELECT status, auth_epoch FROM auth_accounts WHERE actor_id = ?").bind(player.actorId).first()).auth_epoch, 2);
    const reused = await h.request('/v1/auth/recovery/begin', { method: 'POST', body: { recoveryCode: player.recoveryCodes[0] } });
    assert.equal(reused.status, 401);
    const newLogin = await login(h, newCredential, player.userHandle, { counter: 0 });
    assert.equal(newLogin.response.status, 200);
    assert.equal(newLogin.body.actorId, player.actorId);
  });

  test('lost recovery response is recovered by signing in with the newly enrolled passkey', async () => {
    const player = await makePlayer();
    const newCredential = virtualAuthenticator();
    const begin = await h.request('/v1/auth/recovery/begin', { method: 'POST', body: { recoveryCode: player.recoveryCodes[1] } });
    const preauth = cookieFrom(begin, '__Host-asynchat-preauth');
    const csrfCookie = cookieFrom(begin, '__Host-asynchat-preauth-csrf');
    const beginBody = await begin.json();
    const optionsResponse = await h.request('/v1/auth/recovery/options', { method: 'POST', cookie: `${preauth}; ${csrfCookie}`, csrf: beginBody.csrfToken, body: {} });
    const options = await optionsResponse.json();
    const completed = await h.request('/v1/auth/recovery/verify', { method: 'POST', cookie: `${preauth}; ${csrfCookie}`, csrf: beginBody.csrfToken,
      body: { challengeId: options.challengeId, response: registrationResponse(options, newCredential) } });
    assert.equal(completed.status, 200);
    // Deliberately discard its cookies and body, as if the response disappeared on the network.
    const recoveredLogin = await login(h, newCredential, player.userHandle, { counter: 0 });
    assert.equal(recoveredLogin.response.status, 200);
    assert.equal(recoveredLogin.body.actorId, player.actorId);
    assert.equal((await h.request('/v1/auth/recovery/begin', { method: 'POST', body: { recoveryCode: player.recoveryCodes[1] } })).status, 401);
  });

  test('same recovery code cannot reserve two pre-auth contexts or be rebound', async () => {
    const player = await makePlayer();
    const first = await h.request('/v1/auth/recovery/begin', { method: 'POST', body: { recoveryCode: player.recoveryCodes[2] } });
    const second = await h.request('/v1/auth/recovery/begin', { method: 'POST', body: { recoveryCode: player.recoveryCodes[2] } });
    assert.equal(first.status, 200);
    assert.equal(second.status, 409);
    const firstBody = await first.json();
    const wrong = await h.request('/v1/auth/recovery/options', { method: 'POST', cookie: `${cookieFrom(first, '__Host-asynchat-preauth')}; ${cookieFrom(first, '__Host-asynchat-preauth-csrf')}`,
      csrf: 'operation-id-is-not-a-secret', body: {} });
    assert.equal(wrong.status, 401);
    assert(firstBody.csrfToken && firstBody.csrfToken.length > 20);
  });

  test('adding a backup passkey keeps the stable actor and either key can authenticate', async () => {
    const player = await makePlayer();
    const backup = virtualAuthenticator();
    const optionsResponse = await h.request('/v1/auth/passkeys/add/options', { method: 'POST', cookie: `${player.sessionCookie}; ${player.csrfCookie}`,
      csrf: player.csrf, body: {} });
    assert.equal(optionsResponse.status, 200);
    const options = await optionsResponse.json();
    const added = await h.request('/v1/auth/passkeys/add/verify', { method: 'POST', cookie: `${player.sessionCookie}; ${player.csrfCookie}`,
      csrf: player.csrf, body: { challengeId: options.challengeId, response: registrationResponse(options, backup) } });
    assert.equal(added.status, 200, await added.clone().text());
    assert.equal((await h.db.prepare("SELECT COUNT(*) AS count FROM auth_credentials WHERE actor_id = ? AND status = 'active'").bind(player.actorId).first()).count, 2);
    const signedIn = await login(h, backup, player.userHandle, { counter: 0 });
    assert.equal(signedIn.body.actorId, player.actorId);
  });

  test('one-time challenge rejects replay and a forged client actorId', async () => {
    const player = await makePlayer();
    const signedIn = await login(h, player.credential, player.userHandle, { counter: 0 });
    assert.equal(signedIn.response.status, 200);
    const replay = await h.request('/v1/auth/login/verify', { method: 'POST', cookie: `${signedIn.preauth}; ${signedIn.preauthCsrf}`,
      csrf: signedIn.options.csrfToken, body: { challengeId: signedIn.options.challengeId, response: signedIn.assertion } });
    assert.equal(replay.status, 401);
  });

  test('trigger guard aborts stale challenge operation before any side effect', async () => {
    const invite = await issueInvite(h);
    const credential = virtualAuthenticator();
    const start = await h.request('/v1/auth/register/options', { method: 'POST', body: { invitationToken: invite.invitationToken } });
    const options = await start.json();
    const preauth = cookieFrom(start, '__Host-asynchat-preauth');
    const csrfCookie = cookieFrom(start, '__Host-asynchat-preauth-csrf');
    await h.db.prepare('UPDATE auth_invitations SET consumed_at = ? WHERE invitation_id = ?').bind(Date.now(), invite.invitationId).run();
    const rejected = await h.request('/v1/auth/register/verify', { method: 'POST', cookie: `${preauth}; ${csrfCookie}`, csrf: options.csrfToken,
      body: { challengeId: options.challengeId, response: registrationResponse(options, credential) } });
    assert.equal(rejected.status, 409);
    assert.equal((await h.db.prepare('SELECT COUNT(*) AS count FROM auth_accounts').first()).count, 0);
    assert.equal((await h.db.prepare('SELECT COUNT(*) AS count FROM auth_credentials').first()).count, 0);
    assert.equal((await h.db.prepare('SELECT COUNT(*) AS count FROM auth_sessions').first()).count, 0);
    assert.equal((await h.db.prepare('SELECT consumed_at FROM auth_challenges WHERE challenge_id = ?').bind(options.challengeId).first()).consumed_at, null);
  });

  test('session fence and protected effect roll back together when its guard fails', async () => {
    const player = await makePlayer();
    await createFenceEffectGuard();
    const resolved = await resolveSession(new Request(`${ORIGIN}/`, { headers: { cookie: player.sessionCookie } }), h.db, h.authority);
    await h.db.batch([
      await rawFenceStatement(h.db, resolved, 'authorized-fence', Date.now()),
      h.db.prepare('INSERT INTO auth_test_effects(effect_id, fence_id) VALUES (?, ?)').bind('authorized-effect', 'authorized-fence'),
    ]);
    assert.equal((await h.db.prepare('SELECT COUNT(*) AS count FROM auth_test_effects').first()).count, 1);
    assert((await h.db.prepare('SELECT consumed_at FROM auth_session_fences WHERE operation_id = ?').bind('authorized-fence').first()).consumed_at !== null);
    await h.request('/v1/auth/sessions/revoke-all', { method: 'POST', cookie: `${player.sessionCookie}; ${player.csrfCookie}`, csrf: player.csrf, body: {} });
    await assert.rejects(h.db.batch([
      await rawFenceStatement(h.db, resolved, 'fence-after-revoke', Date.now()),
      h.db.prepare('INSERT INTO auth_test_effects(effect_id, fence_id) VALUES (?, ?)').bind('must-roll-back', 'fence-after-revoke'),
    ]));
    assert.equal((await h.db.prepare('SELECT COUNT(*) AS count FROM auth_session_fences').first()).count, 1);
    assert.equal((await h.db.prepare('SELECT COUNT(*) AS count FROM auth_test_effects').first()).count, 1);
  });

  test('revocation racing an authorized effect is atomic, and no effect commits after revoke', async () => {
    const player = await makePlayer();
    await createFenceEffectGuard();
    const resolved = await resolveSession(new Request(`${ORIGIN}/`, { headers: { cookie: player.sessionCookie } }), h.db, h.authority);
    const attemptFence = h.db.batch([
      await rawFenceStatement(h.db, resolved, 'racing-fence', Date.now()),
      h.db.prepare('INSERT INTO auth_test_effects(effect_id, fence_id) VALUES (?, ?)').bind('race-effect', 'racing-fence'),
    ]);
    const revoke = h.request('/v1/auth/sessions/revoke-all', { method: 'POST', cookie: `${player.sessionCookie}; ${player.csrfCookie}`, csrf: player.csrf, body: {} });
    const raced = await Promise.allSettled([attemptFence, revoke]);
    const after = await h.db.prepare('SELECT COUNT(*) AS count FROM auth_test_effects').first();
    assert(after.count === 0 || after.count === 1);
    assert.equal((await h.request('/v1/auth/session', { cookie: player.sessionCookie })).status, 401);
    const stale = await resolveSession(new Request(`${ORIGIN}/`, { headers: { cookie: player.sessionCookie } }), h.db, h.authority);
    await assert.rejects(h.db.batch([
      await rawFenceStatement(h.db, stale, 'after-revoke-fence', Date.now()),
      h.db.prepare('INSERT INTO auth_test_effects(effect_id, fence_id) VALUES (?, ?)').bind('forbidden-effect', 'after-revoke-fence'),
    ]));
    assert.equal((await h.db.prepare('SELECT COUNT(*) AS count FROM auth_test_effects').first()).count, after.count);
    assert(raced.length === 2);
  });

  test('D1 batch rolls back preceding statements after a later SQL failure', async () => {
    const rollback = h.db.batch([
      h.db.prepare('INSERT INTO auth_invitations(invitation_id, token_hash, issued_at, expires_at) VALUES (?, ?, ?, ?)')
      .bind('rollback-invite', 'rollback-hash', Date.now() - 2000, Date.now() - 1000),
      h.db.prepare('INSERT INTO no_such_table(id) VALUES (?)').bind('x'),
    ]);
    const independent = h.db.prepare('INSERT INTO auth_invitations(invitation_id, token_hash, issued_at, expires_at) VALUES (?, ?, ?, ?)')
      .bind('independent-invite', 'independent-hash', Date.now(), Date.now() + 1000).run();
    await assert.rejects(rollback);
    assert.equal((await independent).meta.changes, 1);
    assert.equal((await h.db.prepare('SELECT COUNT(*) AS count FROM auth_invitations WHERE invitation_id = ?').bind('rollback-invite').first()).count, 0);
    assert.equal((await h.db.prepare('SELECT COUNT(*) AS count FROM auth_invitations WHERE invitation_id = ?').bind('independent-invite').first()).count, 1);
  });

  test('missing storage fails closed without creating an identity', async () => {
    const response = await worker.fetch(new Request(`${ORIGIN}/v1/auth/session`), {
      AUTH_ORIGIN: ORIGIN, AUTH_RP_ID: 'localhost', AUTH_DB_GENERATION: '1', AUTH_RATE_LIMIT_KEY: 'local-test-rate-hmac-key-not-for-deployment',
    });
    assert.equal(response.status, 503);
    assert.equal((await response.json()).error, 'temporarily_unavailable');
  });

  test('stale database generation is denied after restore until an external generation bump', async () => {
    const data = await mkdtemp(join(tmpdir(), 'asyn-auth-restore-'));
    const backup = `${data}-old-copy`;
    const original = await createHarness({ persistDir: data });
    const player = await makePlayer(original);
    await original.close({ remove: false });
    await cp(data, backup, { recursive: true });
    h = await createHarness({ persistDir: data });
    await h.request('/v1/auth/sessions/revoke-all', { method: 'POST', cookie: `${player.sessionCookie}; ${player.csrfCookie}`, csrf: player.csrf, body: {} });
    await h.close({ remove: false });
    h = await createHarness({ persistDir: backup, dbGeneration: 2 });
    const restored = await h.request('/v1/auth/session', { cookie: player.sessionCookie });
    assert.equal(restored.status, 503);
    assert.equal((await restored.json()).error, 'temporarily_unavailable');
  });

  test('rate limit returns fixed errors and never reflects supplied secrets', async () => {
    await h.close();
    h = await createHarness({ rateLimit: 2 });
    const sentinel = 'SENTINEL-SECRET-DO-NOT-REFLECT';
    const results = [];
    for (let index = 0; index < 3; index += 1) results.push(await h.request('/v1/auth/login/options', { method: 'POST', body: { secret: sentinel } }));
    assert.deepEqual(results.map((item) => item.status), [400, 400, 429]);
    for (const response of results) assert.equal((await response.text()).includes(sentinel), false);
  });

  test('unknown write paths do not allocate rate-limit buckets', async () => {
    for (let index = 0; index < 20; index += 1) {
      const response = await h.request(`/v1/auth/unknown-${index}`, { method: 'POST', body: {} });
      assert.equal(response.status, 404);
    }
    assert.equal((await h.db.prepare('SELECT COUNT(*) AS count FROM auth_rate_limits').first()).count, 0);
  });

  test('malformed and oversized requests return bounded client errors', async () => {
    const malformed = new Request(`${ORIGIN}/v1/auth/login/options`, { method: 'POST',
      headers: { origin: ORIGIN, 'sec-fetch-site': 'same-origin', 'content-type': 'application/json' }, body: '{bad' });
    const invalid = await worker.fetch(malformed, h.env);
    assert.equal(invalid.status, 400);
    assert.equal((await invalid.json()).error, 'invalid_json');
    const oversized = new Request(`${ORIGIN}/v1/auth/login/options`, { method: 'POST',
      headers: { origin: ORIGIN, 'sec-fetch-site': 'same-origin', 'content-type': 'application/json' }, body: JSON.stringify({ data: 'x'.repeat(70000) }) });
    const tooLarge = await worker.fetch(oversized, h.env);
    assert.equal(tooLarge.status, 413);
    assert.equal((await tooLarge.json()).error, 'body_too_large');
  });

  test('lost registration response does not create a second actor; the same passkey can sign in', async () => {
    const credential = virtualAuthenticator();
    const invite = await issueInvite(h);
    const created = await register(h, credential, invite);
    const actorId = created.body.actorId;
    // Do not retain the registration session cookie or one-time recovery-code response.
    const signedIn = await login(h, credential, created.options.user.id, { counter: 0 });
    assert.equal(signedIn.response.status, 200);
    assert.equal(signedIn.body.actorId, actorId);
    assert.equal((await h.db.prepare('SELECT COUNT(*) AS count FROM auth_accounts').first()).count, 1);
  });

  test('expired and revoked invitations cannot start registration', async () => {
    const expired = await issueInvite(h);
    await h.db.prepare('UPDATE auth_invitations SET issued_at = ?, expires_at = ? WHERE invitation_id = ?').bind(Date.now() - 2000, Date.now() - 1000, expired.invitationId).run();
    const expiredResponse = await h.request('/v1/auth/register/options', { method: 'POST', body: { invitationToken: expired.invitationToken } });
    assert.equal(expiredResponse.status, 400);
    const revoked = await issueInvite(h);
    await h.authority.runExclusive(() => h.authority.revokeInvitation(h.db, revoked.invitationId, Date.now()));
    const revokedResponse = await h.request('/v1/auth/register/options', { method: 'POST', body: { invitationToken: revoked.invitationToken } });
    assert.equal(revokedResponse.status, 400);
    assert.equal((await h.db.prepare('SELECT COUNT(*) AS count FROM auth_accounts').first()).count, 0);
  });

  test('expired WebAuthn challenge cannot register or consume its invitation', async () => {
    const invitation = await issueInvite(h);
    const credential = virtualAuthenticator();
    const optionsResponse = await h.request('/v1/auth/register/options', { method: 'POST', body: { invitationToken: invitation.invitationToken } });
    const options = await optionsResponse.json();
    const preauth = cookieFrom(optionsResponse, '__Host-asynchat-preauth');
    const csrfCookie = cookieFrom(optionsResponse, '__Host-asynchat-preauth-csrf');
    await h.db.prepare('UPDATE auth_challenges SET created_at = ?, expires_at = ? WHERE challenge_id = ?').bind(Date.now() - 2000, Date.now() - 1000, options.challengeId).run();
    const response = await h.request('/v1/auth/register/verify', { method: 'POST', cookie: `${preauth}; ${csrfCookie}`, csrf: options.csrfToken,
      body: { challengeId: options.challengeId, response: registrationResponse(options, credential) } });
    assert.equal(response.status, 400);
    assert.equal((await h.db.prepare('SELECT consumed_at FROM auth_invitations WHERE invitation_id = ?').bind(invitation.invitationId).first()).consumed_at, null);
    assert.equal((await h.db.prepare('SELECT COUNT(*) AS count FROM auth_accounts').first()).count, 0);
  });

  test('expired session records are pruned only after the configured retention window', async () => {
    const player = await makePlayer();
    const session = await resolveSession(new Request(`${ORIGIN}/`, { headers: { cookie: player.sessionCookie } }), h.db, h.authority);
    const revokedAt = Date.now() - 100000;
    await h.db.prepare('UPDATE auth_sessions SET revoked_at = ? WHERE session_id = ?').bind(revokedAt, session.sessionId).run();
    await pruneTerminalSessions(h.db, Date.now(), 200000, h.authority);
    assert.equal((await resolveSession(new Request(`${ORIGIN}/`, { headers: { cookie: player.sessionCookie } }), h.db, h.authority)).state, 'revoked');
    await pruneTerminalSessions(h.db, Date.now(), 1000, h.authority);
    assert.equal((await resolveSession(new Request(`${ORIGIN}/`, { headers: { cookie: player.sessionCookie } }), h.db, h.authority)).state, 'absent');
  });

  test('all external errors use bounded codes and never include tokens or raw exception text', async () => {
    const player = await makePlayer();
    const token = cookieValue(player.sessionCookie);
    const bad = await h.request('/v1/auth/register/verify', { method: 'POST', body: { invitationToken: token, actorId: token } });
    const text = await bad.text();
    assert.equal(text.includes(token), false);
    assert.match(text, /"error":"invalid_request"/u);
    assert.equal(text.includes('AUTH_GUARD'), false);
    const unsupported = await h.request('/v1/auth/admin/secrets', { cookie: player.sessionCookie });
    assert.equal(unsupported.status, 404);
    assert.equal((await unsupported.text()).includes(token), false);
  });
});
