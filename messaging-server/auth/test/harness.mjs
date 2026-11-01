import { mkdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import worker from '../src/worker.mjs';
import { LocalSQLiteD1 } from '../src/sqlite-d1.mjs';

const here = fileURLToPath(new URL('.', import.meta.url));
const root = resolve(here, '..');
export const ORIGIN = 'http://localhost:8787';
export const RP_ID = 'localhost';
export const OPERATOR_SECRET = 'local-test-operator-secret-not-for-deployment';
export const RATE_KEY = 'local-test-rate-hmac-key-not-for-deployment';

export async function createHarness({ rateLimit = 1000, persistDir, dbGeneration = 1 } = {}) {
  const ownedPersist = persistDir || await import('node:fs/promises').then(({ mkdtemp }) => mkdtemp(join(tmpdir(), 'asyn-auth-d1-')));
  await mkdir(ownedPersist, { recursive: true });
  const db = new LocalSQLiteD1(join(ownedPersist, 'auth.sqlite'));
  await db.exec(await readFile(resolve(root, 'migrations/0001_auth.sql'), 'utf8'));
  const env = {
    AUTH_DB: db, AUTH_ORIGIN: ORIGIN, AUTH_RP_ID: RP_ID, AUTH_DB_GENERATION: String(dbGeneration),
    AUTH_SESSION_IDLE_MS: '86400000', AUTH_SESSION_ABSOLUTE_MS: '604800000',
    AUTH_TERMINAL_SESSION_RETENTION_MS: '7776000000', AUTH_CHALLENGE_TTL_MS: '300000',
    AUTH_PREAUTH_TTL_MS: '600000', AUTH_INVITE_TTL_MS: '604800000',
    AUTH_RECOVERY_CODE_COUNT: '4', AUTH_RATE_WINDOW_MS: '60000', AUTH_RATE_LIMIT: String(rateLimit),
    AUTH_OPERATOR_SECRET: OPERATOR_SECRET, AUTH_RATE_LIMIT_KEY: RATE_KEY,
  };
  return {
    db, env, persistDir: ownedPersist,
    async close({ remove = !persistDir } = {}) { db.close(); if (remove) await rm(ownedPersist, { recursive: true, force: true }); },
    async request(path, { method = 'GET', body, cookie = '', csrf = '', headers = {}, authorization } = {}) {
      const requestHeaders = new Headers({ origin: ORIGIN, 'sec-fetch-site': 'same-origin', ...headers });
      if (body !== undefined) requestHeaders.set('content-type', 'application/json');
      if (cookie) requestHeaders.set('cookie', cookie);
      if (csrf) requestHeaders.set('x-csrf-token', csrf);
      if (authorization) requestHeaders.set('authorization', authorization);
      const request = new Request(`${ORIGIN}${path}`, {
        method, headers: requestHeaders, ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      return worker.fetch(request, env);
    },
  };
}

export function cookieFrom(response, name) {
  const cookies = response.headers.getSetCookie?.() || [response.headers.get('set-cookie') || ''];
  const prefix = `${name}=`;
  const line = cookies.find((value) => value.startsWith(prefix));
  if (!line) return null;
  return line.split(';', 1)[0];
}

export function cookieValue(cookie) { return cookie?.slice(cookie.indexOf('=') + 1) || ''; }

export async function issueInvite(h) {
  const response = await h.request('/v1/auth/invitations', { method: 'POST', body: {}, authorization: `Bearer ${OPERATOR_SECRET}` });
  if (response.status !== 201) throw new Error(`invite_issue_failed:${response.status}:${await response.text()}`);
  return response.json();
}

export async function register(h, credential, invitation, { flags } = {}) {
  const optionsResponse = await h.request('/v1/auth/register/options', { method: 'POST', body: { invitationToken: invitation.invitationToken } });
  const options = await optionsResponse.json();
  const preauth = cookieFrom(optionsResponse, '__Host-asynchat-preauth');
  const preauthCsrf = cookieFrom(optionsResponse, '__Host-asynchat-preauth-csrf');
  const response = await h.request('/v1/auth/register/verify', {
    method: 'POST', cookie: `${preauth}; ${preauthCsrf}`, csrf: options.csrfToken,
    body: { challengeId: options.challengeId, response: (await import('./virtual-authenticator.mjs')).registrationResponse(options, credential, { ...(flags === undefined ? {} : { flags }) }) },
  });
  return { response, body: await response.json(), options, preauth, preauthCsrf };
}

export async function login(h, credential, userHandle, overrides = {}) {
  const optionsResponse = await h.request('/v1/auth/login/options', { method: 'POST', body: {} });
  const options = await optionsResponse.json();
  const preauth = cookieFrom(optionsResponse, '__Host-asynchat-preauth');
  const preauthCsrf = cookieFrom(optionsResponse, '__Host-asynchat-preauth-csrf');
  const auth = (await import('./virtual-authenticator.mjs')).assertionResponse(options, credential, { userHandle, ...overrides });
  const response = await h.request('/v1/auth/login/verify', { method: 'POST', cookie: `${preauth}; ${preauthCsrf}`, csrf: options.csrfToken,
    body: { challengeId: options.challengeId, response: auth } });
  return { response, body: await response.json(), options, preauth, preauthCsrf, assertion: auth };
}

export function sessionCookies(response) {
  return {
    session: cookieFrom(response, '__Host-asynchat'),
    csrf: cookieFrom(response, '__Host-asynchat-csrf'),
  };
}
