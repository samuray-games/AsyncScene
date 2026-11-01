import assert from 'node:assert/strict';
import { copyFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import worker, { resolveSession } from '../src/worker.mjs';
import { LocalCheckpointAuthority } from '../src/checkpoint-authority.mjs';
import { LocalSQLiteD1 } from '../src/sqlite-d1.mjs';
import { createHarness, cookieFrom, issueInvite, login, register, sessionCookies } from './harness.mjs';
import { registrationResponse, virtualAuthenticator } from './virtual-authenticator.mjs';

async function player(h) {
  const credential = virtualAuthenticator();
  const invite = await issueInvite(h);
  const created = await register(h, credential, invite);
  assert.equal(created.response.status, 201);
  const cookies = sessionCookies(created.response);
  return { credential, invite, created, cookies, actorId: created.body.actorId,
    userHandle: created.options.user.id, recoveryCodes: created.body.recoveryCodes };
}

async function persist(fn) {
  const dir = await mkdtemp(join(tmpdir(), 'asyn-auth-checkpoint-'));
  let h;
  try { h = await createHarness({ persistDir: dir }); await fn(dir, h, (next) => { h = next; }); }
  finally { if (h) await h.close({ remove: false }).catch(() => {}); await rm(dir, { recursive: true, force: true }); }
}

async function recovery(h, p, code, credential = virtualAuthenticator()) {
  const begin = await h.request('/v1/auth/recovery/begin', { method: 'POST', body: { recoveryCode: code } });
  const beginBody = await begin.json();
  const preauth = cookieFrom(begin, '__Host-asynchat-preauth');
  const csrfCookie = cookieFrom(begin, '__Host-asynchat-preauth-csrf');
  const optionsResponse = await h.request('/v1/auth/recovery/options', { method: 'POST', cookie: `${preauth}; ${csrfCookie}`, csrf: beginBody.csrfToken, body: {} });
  const options = await optionsResponse.json();
  const completed = await h.request('/v1/auth/recovery/verify', { method: 'POST', cookie: `${preauth}; ${csrfCookie}`, csrf: beginBody.csrfToken,
    body: { challengeId: options.challengeId, response: registrationResponse(options, credential) } });
  return { completed, credential };
}

test('checkpoint denies a restored pre-revocation session snapshot', async () => persist(async (dir, h, replace) => {
  const p = await player(h);
  await h.close({ remove: false }); h = null;
  await copyFile(join(dir, 'auth.sqlite'), join(dir, 'before-revoke.sqlite'));
  h = await createHarness({ persistDir: dir }); replace(h);
  const logout = await h.request('/v1/auth/logout', { method: 'POST', cookie: `${p.cookies.session}; ${p.cookies.csrf}`, csrf: p.created.body.csrfToken, body: {} });
  assert.equal(logout.status, 200);
  await h.close({ remove: false }); h = null;
  await copyFile(join(dir, 'before-revoke.sqlite'), join(dir, 'auth.sqlite'));
  h = await createHarness({ persistDir: dir }); replace(h);
  assert.equal((await h.request('/v1/auth/session', { cookie: p.cookies.session })).status, 503);
  assert.notEqual((await resolveSession(new Request(`${h.env.AUTH_ORIGIN}/`, { headers: { cookie: p.cookies.session } }), h.db, h.authority)).state, 'active');
  assert.equal((await h.db.prepare('SELECT revoked_at FROM auth_sessions WHERE actor_id = ?').bind(p.actorId).first()).revoked_at, null);
}));

test('restoring a pre-recovery auth snapshot cannot authenticate the revoked old passkey', async () => persist(async (dir, h, replace) => {
  const p = await player(h);
  await h.close({ remove: false }); h = null;
  await copyFile(join(dir, 'auth.sqlite'), join(dir, 'before-recovery.sqlite'));
  h = await createHarness({ persistDir: dir }); replace(h);
  const recovered = await recovery(h, p, p.recoveryCodes[0]);
  assert.equal(recovered.completed.status, 200);
  await h.close({ remove: false }); h = null;
  await copyFile(join(dir, 'before-recovery.sqlite'), join(dir, 'auth.sqlite'));
  h = await createHarness({ persistDir: dir }); replace(h);
  assert.equal((await h.request('/v1/auth/login/options', { method: 'POST', body: {} })).status, 503);
}));

test('restoring a pre-consumption invitation snapshot cannot reuse its already-consumed invite', async () => persist(async (dir, h, replace) => {
  const invite = await issueInvite(h);
  const credential = virtualAuthenticator();
  const start = await h.request('/v1/auth/register/options', { method: 'POST', body: { invitationToken: invite.invitationToken } });
  const options = await start.json();
  const preauth = cookieFrom(start, '__Host-asynchat-preauth');
  const csrfCookie = cookieFrom(start, '__Host-asynchat-preauth-csrf');
  await h.close({ remove: false }); h = null;
  await copyFile(join(dir, 'auth.sqlite'), join(dir, 'before-consumption.sqlite'));
  h = await createHarness({ persistDir: dir }); replace(h);
  const verified = await h.request('/v1/auth/register/verify', { method: 'POST', cookie: `${preauth}; ${csrfCookie}`, csrf: options.csrfToken,
    body: { challengeId: options.challengeId, response: registrationResponse(options, credential) } });
  assert.equal(verified.status, 201);
  assert.equal((await h.db.prepare('SELECT COUNT(*) AS n FROM auth_accounts').first()).n, 1);
  await h.close({ remove: false }); h = null;
  await copyFile(join(dir, 'before-consumption.sqlite'), join(dir, 'auth.sqlite'));
  h = await createHarness({ persistDir: dir }); replace(h);
  const replay = await h.request('/v1/auth/register/verify', { method: 'POST', cookie: `${preauth}; ${csrfCookie}`, csrf: options.csrfToken,
    body: { challengeId: options.challengeId, response: registrationResponse(options, credential) } });
  assert.equal(replay.status, 503);
  assert.equal((await h.db.prepare('SELECT COUNT(*) AS n FROM auth_accounts').first()).n, 0);
}));

test('restoring an old recovery-code snapshot fails closed after recovery', async () => persist(async (dir, h, replace) => {
  const p = await player(h);
  await h.close({ remove: false }); h = null;
  await copyFile(join(dir, 'auth.sqlite'), join(dir, 'before-code-use.sqlite'));
  h = await createHarness({ persistDir: dir }); replace(h);
  assert.equal((await recovery(h, p, p.recoveryCodes[0])).completed.status, 200);
  await h.close({ remove: false }); h = null;
  await copyFile(join(dir, 'before-code-use.sqlite'), join(dir, 'auth.sqlite'));
  h = await createHarness({ persistDir: dir }); replace(h);
  assert.equal((await h.request('/v1/auth/recovery/begin', { method: 'POST', body: { recoveryCode: p.recoveryCodes[0] } })).status, 503);
}));

test('a prepared invalid competing registration is discarded after reopen without blocking valid sessions', async () => persist(async (dir, h, replace) => {
  try {
    const invite = await issueInvite(h);
    const start = async () => {
      const response = await h.request('/v1/auth/register/options', { method: 'POST', body: { invitationToken: invite.invitationToken } });
      return { response, options: await response.json(), preauth: cookieFrom(response, '__Host-asynchat-preauth'),
        csrfCookie: cookieFrom(response, '__Host-asynchat-preauth-csrf') };
    };
    const first = await start();
    const second = await start();
    const credentialA = virtualAuthenticator();
    const firstResponse = await h.request('/v1/auth/register/verify', { method: 'POST', cookie: `${first.preauth}; ${first.csrfCookie}`,
      csrf: first.options.csrfToken, body: { challengeId: first.options.challengeId, response: registrationResponse(first.options, credentialA) } });
    assert.equal(firstResponse.status, 201);
    h.authority.failAt = 'after_prepare';
    const rejected = await h.request('/v1/auth/register/verify', { method: 'POST', cookie: `${second.preauth}; ${second.csrfCookie}`,
      csrf: second.options.csrfToken, body: { challengeId: second.options.challengeId, response: registrationResponse(second.options, virtualAuthenticator()) } });
    assert.equal(rejected.status, 409);
    await h.close({ remove: false }); h = null;
    h = await createHarness({ persistDir: dir }); replace(h);
    const recoveredSession = cookieFrom(firstResponse, '__Host-asynchat');
    assert.equal((await h.request('/v1/auth/session', { cookie: recoveredSession })).status, 200);
    assert.equal((await h.authorityDb.prepare('SELECT pending_seq FROM checkpoint_state WHERE singleton = 1').first()).pending_seq, null);
  } finally { if (h) await h.close({ remove: false }); }
}));

test('a valid prepared registration is replayed after reopening both stores without creating a second actor', async () => persist(async (dir, h, replace) => {
  const invite = await issueInvite(h);
  const credential = virtualAuthenticator();
  const start = await h.request('/v1/auth/register/options', { method: 'POST', body: { invitationToken: invite.invitationToken } });
  const options = await start.json();
  const preauth = cookieFrom(start, '__Host-asynchat-preauth');
  const csrfCookie = cookieFrom(start, '__Host-asynchat-preauth-csrf');
  h.authority.failAt = 'after_prepare';
  const lost = await h.request('/v1/auth/register/verify', { method: 'POST', cookie: `${preauth}; ${csrfCookie}`, csrf: options.csrfToken,
    body: { challengeId: options.challengeId, response: registrationResponse(options, credential) } });
  assert.equal(lost.status, 409);
  await h.close({ remove: false }); h = null;
  h = await createHarness({ persistDir: dir }); replace(h);
  const loginResult = await login(h, credential, options.user.id, { counter: 0 });
  assert.equal(loginResult.response.status, 200);
  assert.equal((await h.db.prepare('SELECT COUNT(*) AS n FROM auth_accounts').first()).n, 1);
}));

test('authority absence and outage fail closed for reads and writes', async () => {
  const h = await createHarness();
  try {
    delete h.env.AUTHORITY;
    assert.equal((await h.request('/v1/auth/session')).status, 503);
    const restored = await createHarness({ persistDir: h.persistDir });
    try {
      restored.authority.available = false;
      assert.equal((await restored.request('/v1/auth/login/options', { method: 'POST', body: {} })).status, 503);
      assert.equal((await restored.request('/v1/auth/session')).status, 503);
    } finally { await restored.close({ remove: false }); }
    const missing = await createHarness({ persistDir: h.persistDir });
    const blankAuthorityDb = new LocalSQLiteD1();
    try {
      const blankAuthority = new LocalCheckpointAuthority(blankAuthorityDb);
      await blankAuthority.initialize();
      missing.env.AUTHORITY = blankAuthority;
      assert.equal((await missing.request('/v1/auth/session')).status, 503);
    } finally { blankAuthorityDb.close(); await missing.close({ remove: false }); }
  } finally { await h.close(); }
});

test('checkpoint CAS failure aborts the preceding invitation mutation in the same batch', async () => {
  const h = await createHarness();
  try {
    const invite = await issueInvite(h);
    const revokedAt = Date.now();
    const event = await h.authority.prepare('invite_revoke', { operationId: `cas-test:${revokedAt}`, invitationId: invite.invitationId, revokedAt });
    const originalBatch = h.db.batch.bind(h.db);
    h.db.batch = async (statements) => {
      h.db.native.prepare('UPDATE auth_checkpoint SET seq = 9, digest = ? WHERE singleton = 1').run('9'.repeat(64));
      return originalBatch(statements);
    };
    await assert.rejects(h.authority.apply(h.db, event));
    h.db.batch = originalBatch;
    assert.equal((await h.db.prepare('SELECT revoked_at FROM auth_invitations WHERE invitation_id = ?').bind(invite.invitationId).first()).revoked_at, null);
  } finally { await h.close(); }
});

test('lagging, ahead, and digest-mismatched checkpoints never authorize', async () => {
  const h = await createHarness();
  try {
    const p = await player(h);
    await h.db.prepare('UPDATE auth_checkpoint SET seq = seq - 1 WHERE singleton = 1').run();
    assert.equal((await h.request('/v1/auth/session', { cookie: p.cookies.session })).status, 503);
    await h.db.prepare('UPDATE auth_checkpoint SET seq = seq + 2 WHERE singleton = 1').run();
    assert.equal((await h.request('/v1/auth/session', { cookie: p.cookies.session })).status, 503);
    await h.db.prepare('UPDATE auth_checkpoint SET seq = 1, digest = ? WHERE singleton = 1').bind('f'.repeat(64)).run();
    assert.equal((await h.request('/v1/auth/session', { cookie: p.cookies.session })).status, 503);
  } finally { await h.close(); }
});

for (const phase of ['after_prepare', 'after_auth_commit', 'after_finalize']) {
  test(`crash at ${phase} never creates an authorization gap after reopening both stores`, async () => persist(async (dir, h, replace) => {
    try {
      const p = await player(h);
      h.authority.failAt = phase;
      const logout = await h.request('/v1/auth/logout', { method: 'POST', cookie: `${p.cookies.session}; ${p.cookies.csrf}`, csrf: p.created.body.csrfToken, body: {} });
      assert.equal(logout.status, 503);
      await h.close({ remove: false }); h = null;
      h = await createHarness({ persistDir: dir }); replace(h);
      assert.equal((await h.request('/v1/auth/session', { cookie: p.cookies.session })).status, 401);
      assert.equal((await h.db.prepare('SELECT COUNT(*) AS n FROM auth_operation_commits WHERE purpose = \'logout\'').first()).n, 1);
    } finally { if (h) await h.close({ remove: false }); }
  }));
}

test('prepared recovery survives restart and the previous passkey remains revoked', async () => persist(async (dir, h, replace) => {
  const p = await player(h);
  const begin = await h.request('/v1/auth/recovery/begin', { method: 'POST', body: { recoveryCode: p.recoveryCodes[0] } });
  const beginBody = await begin.json();
  const preauth = cookieFrom(begin, '__Host-asynchat-preauth');
  const csrfCookie = cookieFrom(begin, '__Host-asynchat-preauth-csrf');
  const optionsResponse = await h.request('/v1/auth/recovery/options', { method: 'POST', cookie: `${preauth}; ${csrfCookie}`, csrf: beginBody.csrfToken, body: {} });
  const options = await optionsResponse.json();
  h.authority.failAt = 'after_prepare';
  const failedResponse = await h.request('/v1/auth/recovery/verify', { method: 'POST', cookie: `${preauth}; ${csrfCookie}`, csrf: beginBody.csrfToken,
    body: { challengeId: options.challengeId, response: registrationResponse(options, virtualAuthenticator()) } });
  assert.equal(failedResponse.status, 409);
  await h.close({ remove: false }); h = null;
  h = await createHarness({ persistDir: dir }); replace(h);
  assert.equal((await h.request('/v1/auth/session', { cookie: p.cookies.session })).status, 401);
  assert.equal((await login(h, p.credential, p.userHandle)).response.status, 401);
}));

test('concurrent session read and logout serialize; no later read succeeds', async () => {
  const h = await createHarness();
  try {
    const p = await player(h);
    const [read, logout] = await Promise.all([
      h.request('/v1/auth/session', { cookie: p.cookies.session }),
      h.request('/v1/auth/logout', { method: 'POST', cookie: `${p.cookies.session}; ${p.cookies.csrf}`, csrf: p.created.body.csrfToken, body: {} }),
    ]);
    assert.equal(read.status, 200);
    assert.equal(logout.status, 200);
    assert.equal((await h.request('/v1/auth/session', { cookie: p.cookies.session })).status, 401);
  } finally { await h.close(); }
});

test('guarded session resolver reads trusted time after acquiring the authority lock', async () => {
  const h = await createHarness();
  try {
    const p = await player(h);
    const session = await h.db.prepare('SELECT session_id FROM auth_sessions WHERE actor_id = ?').bind(p.actorId).first();
    await h.db.prepare('UPDATE auth_sessions SET idle_expires_at = ? WHERE session_id = ?').bind(Date.now() + 35, session.session_id).run();
    const lock = h.authority.runExclusive(() => new Promise((resolve) => setTimeout(resolve, 80)));
    await new Promise((resolve) => setTimeout(resolve, 5));
    const result = resolveSession(new Request(`${h.env.AUTH_ORIGIN}/`, { headers: { cookie: p.cookies.session } }), h.db, h.authority);
    await lock;
    assert.equal((await result).state, 'expired');
  } finally { await h.close(); }
});

test('unknown endpoint and replayed protected operation do not bypass checkpoint gate', async () => {
  const h = await createHarness();
  try {
    const p = await player(h);
    assert.equal((await h.request('/v1/auth/other-endpoint', { cookie: p.cookies.session })).status, 404);
    assert.equal((await h.request('/v1/auth/logout', { method: 'POST', cookie: `${p.cookies.session}; ${p.cookies.csrf}`, csrf: p.created.body.csrfToken, body: {} })).status, 200);
    assert.equal((await h.request('/v1/auth/logout', { method: 'POST', cookie: `${p.cookies.session}; ${p.cookies.csrf}`, csrf: p.created.body.csrfToken, body: {} })).status, 200);
    assert.equal((await h.request('/v1/auth/session', { cookie: p.cookies.session })).status, 401);
    assert.equal((await h.db.prepare("SELECT COUNT(*) AS n FROM auth_operation_commits WHERE purpose = 'logout'").first()).n, 1);
  } finally { await h.close(); }
});

test('an incomplete POST body does not hold the authority serialization queue', async () => {
  const h = await createHarness();
  let finishBody;
  try {
    const stream = new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode('{')); finishBody = controller; } });
    const bodyRequest = new Request(`${h.env.AUTH_ORIGIN}/v1/auth/login/options`, {
      method: 'POST', headers: { origin: h.env.AUTH_ORIGIN, 'sec-fetch-site': 'same-origin', 'content-type': 'application/json' }, body: stream, duplex: 'half',
    });
    const pending = worker.fetch(bodyRequest, h.env);
    const quick = await Promise.race([h.request('/v1/auth/session'), new Promise((resolve) => setTimeout(() => resolve(null), 100))]);
    assert(quick, 'unclosed body blocked the checkpoint queue');
    assert.equal(quick.status, 401);
    finishBody.enqueue(new TextEncoder().encode('}'));
    finishBody.close();
    assert.equal((await pending).status, 200);
  } finally { await h.close(); }
});

test('restoring both databases together is outside the two-store guarantee', async () => persist(async (dir, h, replace) => {
  const p = await player(h);
  await h.close({ remove: false }); h = null;
  await copyFile(join(dir, 'auth.sqlite'), join(dir, 'auth.snapshot'));
  await copyFile(join(dir, 'checkpoint-authority.sqlite'), join(dir, 'authority.snapshot'));
  h = await createHarness({ persistDir: dir }); replace(h);
  await h.request('/v1/auth/logout', { method: 'POST', cookie: `${p.cookies.session}; ${p.cookies.csrf}`, csrf: p.created.body.csrfToken, body: {} });
  await h.close({ remove: false }); h = null;
  await copyFile(join(dir, 'auth.snapshot'), join(dir, 'auth.sqlite'));
  await copyFile(join(dir, 'authority.snapshot'), join(dir, 'checkpoint-authority.sqlite'));
  h = await createHarness({ persistDir: dir }); replace(h);
  assert.equal((await h.request('/v1/auth/session', { cookie: p.cookies.session })).status, 200);
}));
