// K1 wire-contract and negative tests, without a browser.
// - The schema (contracts/social-battle-api-v1.schema.json) is the single source of field names.
// - Client request bodies are produced by the real client modules and checked against the schema,
//   not against the mock.
// - Mock responses are checked against the same schema; mock behaviour is NOT evidence about
//   native D1 atomicity (K1 §1.2, §4.2).
// Run: node --test tools/test_social_contract.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { createRequire } from "node:module";
import { startMockServer, canonicalJson } from "./mock_social_battle_server.mjs";
import { validate, assertValid } from "./social_wire_schema.mjs";

const require = createRequire(import.meta.url);
require("../AsyncScene/Web/social/social-session.js");
require("../AsyncScene/Web/social/social-api.js");
const { SocialSession, SocialApi } = globalThis.Game;
const subtle = webcrypto.subtle;

const b64url = (buf) => Buffer.from(buf).toString("base64url");
const hex = (buf) => Buffer.from(buf).toString("hex");

// Independent signer: real client canonicalString + a node key. Each call uses a fresh nonce.
async function makeSigner() {
  const pair = await subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, false, ["sign", "verify"]);
  const publicJwk = await subtle.exportKey("jwk", pair.publicKey);
  const calls = [];
  async function sign({ method, path, bodyText, sessionId, nonce, timestamp }) {
    nonce = nonce || b64url(webcrypto.getRandomValues(new Uint8Array(16)));
    timestamp = timestamp ?? Date.now();
    const bodySha256 = hex(await subtle.digest("SHA-256", new TextEncoder().encode(bodyText || "")));
    const msg = SocialSession.canonicalString({ method, path, bodySha256, nonce, timestamp, sessionId });
    const sig = await subtle.sign({ name: "ECDSA", hash: "SHA-256" }, pair.privateKey, new TextEncoder().encode(msg));
    calls.push({ method, path, nonce, bodyText });
    return { "Session-Id": sessionId, "Signature-Nonce": nonce, "Signature-Timestamp": String(timestamp), "Signature": b64url(sig) };
  }
  return { publicJwk, calls, signRequest: sign };
}

async function setup(opts = {}) {
  let clock = Date.now();
  const mock = await startMockServer({ pageOrigin: "http://127.0.0.1", now: () => clock, ...opts });
  for (const [actorId, displayName, allowedColors] of [["actor-a", "Аня", ["y", "o"]], ["actor-b", "Боря", ["y"]], ["actor-c", "Вика", ["y"]]]) {
    await mock.seedActor({ actorId, displayName, allowedColors });
  }
  const responses = [];
  async function session(actorId) {
    const signer = await makeSigner();
    const r = await fetch(mock.origin + "/__test__/sessions", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actorId, publicJwk: signer.publicJwk }) });
    const { sessionId } = await r.json();
    return { sessionId, signer };
  }
  // Raw signed request; records every response for schema checks.
  async function raw(s, method, path, body, signOpts = {}) {
    const bodyText = body === undefined ? "" : JSON.stringify(body);
    const headers = await s.signer.signRequest({ method, path, bodyText, sessionId: s.sessionId, timestamp: clock, ...signOpts });
    if (body !== undefined) headers["Content-Type"] = "application/json";
    const r = await fetch(mock.origin + path, { method, headers, body: body === undefined ? undefined : bodyText });
    const data = await r.json();
    responses.push({ path, status: r.status, data });
    return { status: r.status, data };
  }
  return { mock, session, raw, responses, advance: (ms) => { clock += ms; }, now: () => clock };
}

const commitBody = (commandId, over = {}) => ({
  commandId,
  selection: { attackColor: "y", defenseColor: "y", attackType: "N", defenseType: "S", role: "citizen", ...(over.selection || {}) },
  textIntent: over.textIntent || { attack: { offerId: "attack-N-1" }, defense: { offerId: "defense-S-1" } }
});

test("schema: one wire shape, strict, opponent data forbidden before reveal", () => {
  const base = { schemaVersion: 1, battleId: "11111111-1111-1111-1111-111111111111", version: 0, rulesVersion: "tactical_v1",
    phase: "created", deadlineAt: 1, participants: { self: "a", opponent: "b" }, participantNames: { self: "A", opponent: "B" },
    selfSide: "A", selfCommitted: false, opponentCommitted: false, revealed: false,
    readyTextOffers: { catalogVersion: "c1", normalizationVersion: "n1", offers: [{ channel: "attack", offerId: "x", text: "t", tacticType: "N" }] } };
  assert.deepEqual(validate("participantProjection", base), []);
  const snake = structuredClone(base);
  snake.readyTextOffers.offers = [{ channel: "attack", offer_id: "x", phrase_text: "t", tactic_type: "N" }];
  assert.ok(validate("participantProjection", snake).length > 0, "snake_case DB columns are not the wire format");
  const leak = { ...structuredClone(base), selections: { A: commitBody("c").selection, B: commitBody("c").selection } };
  assert.ok(validate("participantProjection", leak).length > 0, "selections before reveal must be rejected");
  assert.ok(validate("commitRequest", { ...commitBody("c"), extra: 1 }).length > 0, "unknown request fields are rejected");
  assert.ok(validate("selection", { ...commitBody("c").selection, attackColor: "x" }).length > 0);
});

test("client: request bodies match the schema; every retry is freshly signed with the same command", async (t) => {
  const env = await setup();
  t.after(() => env.mock.close());
  const a = await env.session("actor-a");
  const sent = [];
  let failNext = 0;      // network error before the request reaches the server
  let dropAckNext = 0;   // request reaches the server, the response is lost
  const fetchImpl = async (url, init) => {
    sent.push({ url, init });
    if (failNext > 0) { failNext--; throw new TypeError("network down"); }
    const res = await fetch(url, init);
    if (dropAckNext > 0) { dropAckNext--; await res.text(); throw new TypeError("connection reset"); }
    return res;
  };
  const api = SocialApi.create({ apiOrigin: env.mock.origin, sessionId: a.sessionId, session: a.signer, fetchImpl });

  // attempt 1: network error before the server; attempt 2: server creates, ACK lost; attempt 3: replay
  failNext = 1; dropAckNext = 0;
  const realFetch = fetchImpl;
  let attempt = 0;
  const api3 = SocialApi.create({ apiOrigin: env.mock.origin, sessionId: a.sessionId, session: a.signer,
    fetchImpl: (url, init) => { attempt++; if (attempt === 2) dropAckNext = 1; return realFetch(url, init); } });
  const created = await api3.createBattle("actor-b", "op-1");
  assert.equal(created.replayed, true, "retry after a lost ACK replays the original receipt");
  assertValid("createBattleResponse", created);
  const createSends = sent.splice(0);
  assert.equal(createSends.length, 3);
  for (const s of createSends) assertValid("createBattleRequest", JSON.parse(s.init.body));
  const nonces = new Set(createSends.map((s) => s.init.headers["Signature-Nonce"]));
  assert.equal(nonces.size, 3, "every retry is freshly signed");

  const view = await api.getBattle(created.battleId);
  assertValid("participantProjection", view);
  const offer = view.readyTextOffers.offers.find((o) => o.channel === "attack");
  const body = commitBody("cmd-1", { textIntent: { attack: { offerId: offer.offerId, finalText: "Своими словами" }, defense: { offerId: "defense-S-1" } } });
  dropAckNext = 1;
  const receipt = await api.commit(created.battleId, body.commandId, body.selection, body.textIntent);
  const commitSends = sent.splice(0).filter((s) => s.url.endsWith("/commit"));
  assert.equal(commitSends.length, 2);
  assert.equal(receipt.replayed, true);
  assertValid("commitResponse", receipt);
  for (const s of commitSends) {
    assertValid("commitRequest", JSON.parse(s.init.body));
    assert.equal(JSON.parse(s.init.body).commandId, "cmd-1");
  }
  assert.notEqual(commitSends[0].init.headers["Signature-Nonce"], commitSends[1].init.headers["Signature-Nonce"]);
});

test("nonce: concurrent duplicate accepted once; retained for the whole validity window; skew enforced", async (t) => {
  const env = await setup({ verifyDelayMs: 40 });
  t.after(() => env.mock.close());
  const a = await env.session("actor-a");
  const nonce = b64url(webcrypto.getRandomValues(new Uint8Array(16)));
  const ts = env.now();
  const headers = await a.signer.signRequest({ method: "GET", path: "/v1/me", bodyText: "", sessionId: a.sessionId, nonce, timestamp: ts });
  const once = () => fetch(env.mock.origin + "/v1/me", { headers }).then((r) => r.status);
  const statuses = await Promise.all(Array.from({ length: 12 }, once));
  assert.equal(statuses.filter((s) => s === 200).length, 1, "exactly one of the concurrent duplicates passes");
  assert.equal(statuses.filter((s) => s === 401).length, 11);

  env.advance(110000); // still inside ts ± skew: the nonce must still be remembered
  assert.equal(await once(), 401);
  env.advance(20000);  // window passed: rejected as stale, so forgetting the nonce is safe
  assert.equal(await once(), 401);
  assert.equal((await env.raw(a, "GET", "/v1/me", undefined, { timestamp: env.now() - 121000 })).status, 401, "too old");
  assert.equal((await env.raw(a, "GET", "/v1/me", undefined, { timestamp: env.now() + 121000 })).status, 401, "too far in the future");
  assert.equal((await env.raw(a, "GET", "/v1/me")).status, 200);

  const other = await makeSigner(); // wrong key for this session
  const bad = await other.signRequest({ method: "GET", path: "/v1/me", bodyText: "", sessionId: a.sessionId, timestamp: env.now() });
  assert.equal((await fetch(env.mock.origin + "/v1/me", { headers: bad })).status, 401);
  const tampered = await a.signer.signRequest({ method: "GET", path: "/v1/me", bodyText: "", sessionId: a.sessionId, timestamp: env.now() });
  assert.equal((await fetch(env.mock.origin + "/v1/players?scope=challengeable", { headers: tampered })).status, 401, "path is signed");
});

test("idempotency: whole-effect fingerprint; changed payload under the same id is a conflict", async (t) => {
  const env = await setup();
  t.after(() => env.mock.close());
  const a = await env.session("actor-a");
  const b = await env.session("actor-b");
  const c1 = await env.raw(a, "POST", "/v1/battles", { opponentActorId: "actor-b", clientOperationId: "op-x" });
  assert.equal(c1.status, 200);
  const c2 = await env.raw(a, "POST", "/v1/battles", { opponentActorId: "actor-b", clientOperationId: "op-x" });
  assert.deepEqual(c2.data, { battleId: c1.data.battleId, replayed: true });
  const c3 = await env.raw(a, "POST", "/v1/battles", { opponentActorId: "actor-c", clientOperationId: "op-x" });
  assert.deepEqual([c3.status, c3.data.error], [409, "IDEMPOTENCY_CONFLICT"], "same operation id, different target");

  const id = c1.data.battleId;
  const path = "/v1/battles/" + id + "/commit";
  const first = await env.raw(a, "POST", path, commitBody("cmd-a"));
  assert.equal(first.status, 200);
  assert.equal(first.data.replayed, false);
  const replay = await env.raw(a, "POST", path, commitBody("cmd-a"));
  assert.equal(replay.data.replayed, true);
  const reordered = JSON.parse(canonicalJson(commitBody("cmd-a"))); // key order does not matter
  assert.equal((await env.raw(a, "POST", path, reordered)).data.replayed, true);
  for (const changed of [
    commitBody("cmd-a", { selection: { attackColor: "o" } }),
    commitBody("cmd-a", { textIntent: { attack: { offerId: "attack-N-1", finalText: "Другой текст" }, defense: { offerId: "defense-S-1" } } }),
    commitBody("cmd-a", { textIntent: { attack: { offerId: "attack-N-2" }, defense: { offerId: "defense-S-1" } } })
  ]) {
    const r = await env.raw(a, "POST", path, changed);
    assert.deepEqual([r.status, r.data.error], [409, "IDEMPOTENCY_CONFLICT"]);
  }
  const second = await env.raw(a, "POST", path, commitBody("cmd-a2", { selection: { attackColor: "o" } }));
  assert.deepEqual([second.status, second.data.error], [409, "COMMIT_IMMUTABLE"], "a new command cannot change a commit");
  const foreign = await env.raw(b, "POST", path, commitBody("cmd-a")); // same id on the other side is a different command
  assert.equal(foreign.status, 200);
  assert.equal(foreign.data.view.revealed, true);
});

test("person-wide ACTIVE reservation for both persons until a terminal phase", async (t) => {
  const env = await setup({ deadlineMs: 60000 });
  t.after(() => env.mock.close());
  const a = await env.session("actor-a");
  const c = await env.session("actor-c");
  assert.equal((await env.raw(a, "POST", "/v1/battles", { opponentActorId: "actor-b", clientOperationId: "r1" })).status, 200);
  const selfBusy = await env.raw(a, "POST", "/v1/battles", { opponentActorId: "actor-c", clientOperationId: "r2" });
  assert.deepEqual([selfBusy.status, selfBusy.data.error], [409, "RESERVATION_CONFLICT"]);
  const opponentBusy = await env.raw(c, "POST", "/v1/battles", { opponentActorId: "actor-b", clientOperationId: "r3" });
  assert.deepEqual([opponentBusy.status, opponentBusy.data.error], [409, "RESERVATION_CONFLICT"], "same code, no hint which side");
  env.advance(61000); // commit deadline passed: the battle expires and releases both persons
  assert.equal((await env.raw(c, "POST", "/v1/battles", { opponentActorId: "actor-b", clientOperationId: "r4" })).status, 200);
});

test("privacy and schema: every mock response matches the wire schema", async (t) => {
  const env = await setup();
  t.after(() => env.mock.close());
  const a = await env.session("actor-a");
  const b = await env.session("actor-b");
  const c = await env.session("actor-c");
  const def = (path, method) => path === "/v1/me" ? "meResponse" : path.startsWith("/v1/players") ? "playersResponse"
    : path.startsWith("/v1/battles?") ? "battleListResponse" : path === "/v1/battles" ? "createBattleResponse"
    : path.endsWith("/commit") ? "commitResponse" : "participantProjection";
  await env.raw(a, "GET", "/v1/me");
  await env.raw(a, "GET", "/v1/players?scope=challengeable");
  const { data } = await env.raw(a, "POST", "/v1/battles", { opponentActorId: "actor-b", clientOperationId: "p1" });
  const path = "/v1/battles/" + data.battleId;
  await env.raw(a, "POST", path + "/commit", commitBody("x", { textIntent: { attack: { offerId: "attack-N-1", finalText: "Секрет" }, defense: { offerId: "defense-S-1" } } }));
  const peek = await env.raw(b, "GET", path);
  assert.ok(!JSON.stringify(peek.data).includes("Секрет"));
  const foreign = await env.raw(c, "GET", path);
  const missing = await env.raw(c, "GET", "/v1/battles/00000000-0000-0000-0000-000000000000");
  assert.deepEqual([foreign.status, foreign.data], [missing.status, missing.data], "foreign == missing");
  await env.raw(b, "GET", "/v1/battles?scope=mine");
  await env.raw(b, "POST", path + "/commit", commitBody("y"));
  await env.raw(a, "GET", path);
  for (const r of env.responses) {
    const name = r.status === 200 ? def(r.path) : "error";
    assert.deepEqual(validate(name, r.data), [], r.path + " " + r.status);
  }
});
