import assert from "node:assert/strict";
import test from "node:test";
import { assertLoopbackApiBase, createBattleClient, localApiBase } from "../dev-harness/api.mjs";
import { createSyntheticBattle } from "../dev-harness/create_local_battle.mjs";

const battleId = "123e4567-e89b-42d3-a456-426614174000";
const tokenA = "A".repeat(43);
const tokenB = "B".repeat(43);

test("browser API client is limited to loopback and omits ambient credentials", async () => {
  const calls = [];
  const client = createBattleClient({
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return { ok: true, json: async () => ({ phase: "created" }) };
    },
    idFactory: () => "00000000-0000-4000-8000-000000000001",
  });
  await client.getView(battleId, tokenA);
  await client.commit(battleId, tokenA, { role: "citizen" });
  assert.equal(calls[0].url, localApiBase + "/v1/battles/" + battleId);
  assert.equal(calls[1].url, localApiBase + "/v1/battles/" + battleId + "/commit");
  for (const { options } of calls) {
    assert.equal(options.credentials, "omit");
    assert.equal(options.cache, "no-store");
    assert.equal(options.redirect, "error");
    assert.equal(options.referrerPolicy, "no-referrer");
    assert.equal(options.headers.authorization, "Bearer " + tokenA);
  }
  assert.deepEqual(JSON.parse(calls[1].options.body), {
    commandId: "harness-00000000-0000-4000-8000-000000000001", selection: { role: "citizen" },
  });
});

test("browser client rejects non-loopback, HTTPS, credentialed, and path-bearing endpoints", () => {
  for (const url of [
    "https://example.com", "http://192.168.1.2:8787", "http://127.0.0.1.evil.test:8787",
    "http://user@127.0.0.1:8787", "http://127.0.0.1:8787/path",
  ]) assert.throws(() => assertLoopbackApiBase(url));
});

test("client validates battle IDs and one-player tokens before making a request", async () => {
  let calls = 0;
  const client = createBattleClient({ fetchImpl: async () => { calls++; } });
  await assert.rejects(client.getView("not-a-battle", tokenA), /battle ID/);
  await assert.rejects(client.getView(battleId, tokenA + "x"), /43-character/);
  assert.equal(calls, 0);
});

test("local bootstrap sends synthetic A and B creation only to loopback server-to-server", async () => {
  let captured;
  const created = { battleId, capabilities: { A: { token: tokenA }, B: { token: tokenB } } };
  const result = await createSyntheticBattle({
    adminToken: "local-admin-token-" + "x".repeat(40),
    fetchImpl: async (url, options) => {
      captured = { url, options };
      return { ok: true, status: 201, json: async () => created };
    },
  });
  assert.equal(result, created);
  assert.equal(captured.url, localApiBase + "/v1/admin/battles");
  assert.equal(captured.options.credentials, "omit");
  assert.equal(captured.options.headers.authorization, "Bearer local-admin-token-" + "x".repeat(40));
  assert.match(captured.options.headers["idempotency-key"], /^[A-Za-z0-9_-]{43}$/);
  const payload = JSON.parse(captured.options.body);
  assert.equal(payload.participants.A.role, "citizen");
  assert.equal(payload.participants.B.role, "citizen");
  assert.notEqual(payload.participants.A.id, payload.participants.B.id);
});

test("bootstrap refuses malformed credentials and remote Worker targets", async () => {
  await assert.rejects(createSyntheticBattle({ adminToken: "short", fetchImpl: async () => { throw Error("must not run"); } }));
  await assert.rejects(createSyntheticBattle({
    adminToken: "local-admin-token-" + "x".repeat(40),
    baseUrl: "https://example.com",
    fetchImpl: async () => { throw Error("must not run"); },
  }));
});
