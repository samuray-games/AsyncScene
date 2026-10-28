import assert from "node:assert/strict";
import { cp, mkdir, readFile, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createIndexedDbStorage, createMemoryStorage, makeTransport, sanitizeSelection,
  validateApiOrigin, visibleBattleState,
} from "../remote-client/client.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../remote-client");
const battle = "123e4567-e89b-42d3-a456-426614174000";
const tokenA = "A".repeat(43);
const tokenB = "B".repeat(43);
const selection = { attackColor: "y", defenseColor: "o", attackType: "N", defenseType: "S", role: "citizen" };
let assertions = 0;
function test(name, fn) {
  return Promise.resolve().then(fn).then(() => { assertions++; console.log(`PASS ${name}`); });
}
async function rejectsCode(promise, code) {
  await assert.rejects(promise, error => error.message === code);
}

class FakeIndexedDB {
  data = new Map();
  abortNextTransaction = false;
  open() {
    const request = {};
    queueMicrotask(() => {
      const db = {
        objectStoreNames: { contains: () => true },
        transaction: names => {
          const list = Array.isArray(names) ? names : [names];
          const before = structuredClone(this.data);
          const transaction = { objectStore: name => ({
            get: key => this.operation("get", name, key),
      put: (value, key) => this.operation("put", name, key ?? value.key ?? value.battleId, value),
            delete: key => this.operation("delete", name, key),
            clear: () => this.operation("clear", name),
          }) };
          const complete = () => queueMicrotask(() => {
            if (this.abortNextTransaction) {
              this.abortNextTransaction = false;
              this.data = before;
              transaction.onabort?.();
            } else transaction.oncomplete?.();
          });
          const original = transaction.objectStore;
          transaction.objectStore = name => {
            assert.ok(list.includes(name));
            const store = original(name);
            for (const method of ["get", "put", "delete", "clear"]) {
              const operation = store[method];
              store[method] = (...args) => { const result = operation(...args); result._afterSuccess = complete; return result; };
            }
            return store;
          };
          return transaction;
        }, close() {},
      };
      request.result = db;
      request.onsuccess?.();
    });
    request.onupgradeneeded = null;
    return request;
  }
  operation(op, store, key, value) {
    const request = {};
    const dataKey = `${store}:${key ?? ""}`;
    queueMicrotask(() => {
      if (op === "get") request.result = structuredClone(this.data.get(dataKey));
      else if (op === "put") { this.data.set(dataKey, structuredClone(value)); request.result = key; }
      else if (op === "delete") this.data.delete(dataKey);
      else if (op === "clear") for (const item of [...this.data.keys()]) if (item.startsWith(`${store}:`)) this.data.delete(item);
      request.onsuccess?.();
      request._afterSuccess?.();
    });
    return request;
  }
}

await test("missing, malformed, non-HTTPS, path, and shared GitHub origins fail closed", async () => {
  for (const value of ["", null, "not a URL", "http://api.example.test", "https://api.example.test/path",
    "https://api.example.test/", "https://u:p@api.example.test", "https://samuray-games.github.io",
    "https://samuray-games.github.io.", "https://samuray-games.github.io..", "https://other.github.io."]) {
    assert.equal(validateApiOrigin(value), null);
  }
  let called = false;
  const transport = makeTransport({ apiOrigin: "", storage: createMemoryStorage(), fetchImpl: async () => { called = true; } });
  assert.equal(transport.ready, false);
  await rejectsCode(transport.connect(battle, tokenA), "CLIENT_NOT_CONFIGURED");
  assert.equal(called, false);
  const unapproved = makeTransport({ apiOrigin: "https://game-api.example.test", storage: createMemoryStorage(),
    fetchImpl: async () => { called = true; } });
  assert.equal(unapproved.ready, false);
  await rejectsCode(unapproved.connect(battle, tokenA), "CLIENT_NOT_CONFIGURED");
  assert.equal(called, false, "a valid but unapproved origin cannot connect");
  const forbidden = makeTransport({ apiOrigin: "https://samuray-games.github.io.", originApproved: true,
    storage: createMemoryStorage(), fetchImpl: async () => { called = true; } });
  assert.equal(forbidden.ready, false, "reserved Pages origin spellings remain blocked even when marked approved");
  await rejectsCode(forbidden.connect(battle, tokenA), "CLIENT_NOT_CONFIGURED");
  assert.equal(called, false);
});

await test("only canonical participant routes and headers are used; A and B credentials stay separate", async () => {
  const requests = [];
  const transport = makeTransport({ apiOrigin: "https://game-api.example.test", originApproved: true, storage: createMemoryStorage(),
    fetchImpl: async (url, init) => {
      requests.push({ url, init });
      return new Response(JSON.stringify({ battleId: battle, phase: "waiting", selfCommitted: false,
        opponentCommitted: false, revealed: false }), { status: 200 });
    } });
  await transport.connect(battle, tokenA);
  await transport.connect(battle, tokenB);
  assert.deepEqual(requests.map(r => r.url), [
    `https://game-api.example.test/v1/battles/${battle}`,
    `https://game-api.example.test/v1/battles/${battle}`,
  ]);
  assert.deepEqual(requests.map(r => r.init.headers.get("Authorization")), [`Bearer ${tokenA}`, `Bearer ${tokenB}`]);
  assert.ok(requests.every(r => r.init.credentials === "omit" && r.init.redirect === "error"));
  assert.equal(requests.some(r => /admin|\?|#/.test(r.url)), false);
  assert.equal(requests.some(r => "body" in r.init), false);
});

await test("invalid battle IDs, tokens, methods, and command IDs are rejected before network", async () => {
  let called = false;
  const transport = makeTransport({ apiOrigin: "https://game-api.example.test", originApproved: true, storage: createMemoryStorage(), fetchImpl: async () => { called = true; } });
  await rejectsCode(transport.connect("https://evil.test/" + battle, tokenA), "INVALID_BATTLE_ID");
  await rejectsCode(transport.connect(battle, "short"), "INVALID_TOKEN");
  await rejectsCode(transport.request(battle, tokenA, "DELETE"), "METHOD_NOT_ALLOWED");
  await rejectsCode(transport.request(battle, tokenA, "POST", { commandId: "x", selection }), "INVALID_COMMAND_ID");
  assert.equal(called, false);
});

await test("opponent hidden data remains undisplayed until an explicit server reveal", async () => {
  const hidden = { phase: "waiting", selfCommitted: true, opponentCommitted: true, revealed: false,
    selections: { A: selection, B: { ...selection, attackColor: "r" } } };
  assert.equal(visibleBattleState(hidden, selection).result, null);
  const inconsistent = visibleBattleState({ ...hidden, revealed: true }, selection);
  assert.equal(inconsistent.result, null, "waiting phase cannot expose an early reveal");
  const revealed = visibleBattleState({ ...hidden, phase: "revealed", revealed: true, resolution: { winner: "A" } }, selection);
  assert.deepEqual(revealed.result.selections.B, { ...selection, attackColor: "r" });
});

await test("memory-only mode does not survive a page storage replacement", async () => {
  const firstPage = createMemoryStorage();
  await firstPage.saveToken(tokenA, battle);
  assert.equal(await createMemoryStorage().getCredential(), null);
  await firstPage.forget();
  assert.equal(await firstPage.getToken(), null);
});

await test("IndexedDB credential exists only after explicit opt-in and restores after reload", async () => {
  const indexedDB = new FakeIndexedDB();
  const firstPage = createIndexedDbStorage(indexedDB);
  assert.equal(await firstPage.getCredential(), undefined);
  await firstPage.saveToken(tokenA, battle);
  const reloadedPage = createIndexedDbStorage(indexedDB);
  assert.deepEqual(await reloadedPage.getCredential(), { token: tokenA, battleId: battle });
  assert.equal(await reloadedPage.getToken(), tokenA);
});

await test("Forget clears the retained credential but preserves an uncertain command identity", async () => {
  const storage = createIndexedDbStorage(new FakeIndexedDB());
  await storage.saveToken(tokenA, battle);
  const transport = makeTransport({ apiOrigin: "https://game-api.example.test", originApproved: true, storage, idFactory: () => "cmd-1234" });
  await transport.prepareCommit(battle, tokenA, selection);
  await storage.forget();
  assert.equal(await storage.getToken(), null);
  assert.equal((await storage.getPending(battle, tokenA)).commandId, "cmd-1234");
  assert.equal(await storage.getPending(battle, tokenB), undefined);
});

await test("IndexedDB write waits for transaction commit and rejects an abort after request success", async () => {
  const indexedDB = new FakeIndexedDB();
  const storage = createIndexedDbStorage(indexedDB);
  const transport = makeTransport({ apiOrigin: "https://game-api.example.test", originApproved: true, storage, idFactory: () => "cmd-abort" });
  indexedDB.abortNextTransaction = true;
  await rejectsCode(transport.prepareCommit(battle, tokenA, selection), "STORAGE_UNAVAILABLE");
  assert.equal(await storage.getPending(battle, tokenA), undefined);
});

await test("A/B pending commands are scoped to separate bearer digests", async () => {
  const storage = createIndexedDbStorage(new FakeIndexedDB());
  let nextId = 0;
  const transport = makeTransport({ apiOrigin: "https://game-api.example.test", originApproved: true, storage,
    idFactory: () => `side-command-${++nextId}` });
  const pendingA = await transport.prepareCommit(battle, tokenA, selection);
  assert.equal(pendingA.key.includes(tokenA), false);
  await rejectsCode(transport.retryPending(battle, tokenB), "NO_PENDING_COMMAND");
  const pendingB = await transport.prepareCommit(battle, tokenB, { ...selection, attackColor: "o" });
  assert.notEqual(pendingA.key, pendingB.key);
  assert.equal(pendingA.commandId, "side-command-1");
  assert.equal(pendingB.commandId, "side-command-2");
});

await test("pending command recovers after reload without opting in to token storage", async () => {
  const indexedDB = new FakeIndexedDB();
  const beforeReload = createIndexedDbStorage(indexedDB);
  const first = makeTransport({ apiOrigin: "https://game-api.example.test", originApproved: true, storage: beforeReload,
    idFactory: () => "reload-command-1" });
  await first.prepareCommit(battle, tokenA, selection);
  const afterReload = createIndexedDbStorage(indexedDB);
  assert.equal(await afterReload.getCredential(), undefined, "bearer must remain memory-only by default");
  const sent = [];
  const recovered = makeTransport({ apiOrigin: "https://game-api.example.test", originApproved: true, storage: afterReload,
    fetchImpl: async (_url, init) => {
      sent.push(JSON.parse(init.body).commandId);
      return new Response(JSON.stringify({ view: { phase: "waiting", selfCommitted: true } }), { status: 200 });
    } });
  await recovered.retryPending(battle, tokenA);
  assert.deepEqual(sent, ["reload-command-1"]);
  assert.equal(await afterReload.getPending(battle, tokenA), undefined);
});

await test("clear acknowledgement abort retains the same command for safe retry", async () => {
  const indexedDB = new FakeIndexedDB();
  const storage = createIndexedDbStorage(indexedDB);
  const sent = [];
  let abortClearOnce = true;
  const transport = makeTransport({ apiOrigin: "https://game-api.example.test", originApproved: true, storage,
    idFactory: () => "clear-abort-command", fetchImpl: async (_url, init) => {
      sent.push(JSON.parse(init.body).commandId);
      if (abortClearOnce) { abortClearOnce = false; indexedDB.abortNextTransaction = true; }
      return new Response(JSON.stringify({ view: { phase: "waiting", selfCommitted: true } }), { status: 200 });
    } });
  await rejectsCode(transport.commit(battle, tokenA, selection), "COMMIT_ACKNOWLEDGED_PENDING_RETAINED");
  assert.equal((await storage.getPending(battle, tokenA)).commandId, "clear-abort-command");
  await transport.retryPending(battle, tokenA);
  assert.deepEqual(sent, ["clear-abort-command", "clear-abort-command"]);
  assert.equal(await storage.getPending(battle, tokenA), undefined);
});

await test("ambiguous network loss after server commit retries original command once", async () => {
  const storage = createMemoryStorage();
  let generated = 0;
  let committed = new Map();
  let failAfterApply = true;
  const ids = [];
  const transport = makeTransport({ apiOrigin: "https://game-api.example.test", originApproved: true, storage,
    idFactory: () => `command-${++generated}`,
    fetchImpl: async (_url, init) => {
      const body = JSON.parse(init.body);
      ids.push(body.commandId);
      if (!committed.has(body.commandId)) committed.set(body.commandId, 1);
      if (failAfterApply) { failAfterApply = false; throw new Error("network down"); }
      return new Response(JSON.stringify({ view: { phase: "waiting", selfCommitted: true, opponentCommitted: false } }), { status: 200 });
    } });
  await rejectsCode(transport.commit(battle, tokenA, selection), "NETWORK_UNCERTAIN");
  const pending = await storage.getPending(battle, tokenA);
  assert.equal(pending.commandId, "command-1");
  await transport.retryPending(battle, tokenA);
  assert.deepEqual(ids, ["command-1", "command-1"]);
  assert.equal(generated, 1);
  assert.equal(committed.size, 1);
  assert.equal(await storage.getPending(battle, tokenA), null);
});

await test("selection change cannot create a second command while the first is uncertain", async () => {
  const storage = createMemoryStorage();
  const transport = makeTransport({ apiOrigin: "https://game-api.example.test", originApproved: true, storage, idFactory: () => "command-1234",
    fetchImpl: async () => { throw new Error("offline"); } });
  await rejectsCode(transport.commit(battle, tokenA, selection), "NETWORK_UNCERTAIN");
  await rejectsCode(transport.commit(battle, tokenA, { ...selection, attackColor: "o" }), "PENDING_COMMAND_EXISTS");
});

await test("network loss before server acceptance keeps the original command for recovery", async () => {
  const storage = createMemoryStorage();
  let calls = 0;
  const transport = makeTransport({ apiOrigin: "https://game-api.example.test", originApproved: true, storage, idFactory: () => "command-before-1",
    fetchImpl: async () => { calls++; if (calls === 1) throw new Error("offline before request arrived");
      return new Response(JSON.stringify({ view: { phase: "waiting", selfCommitted: true } }), { status: 200 }); } });
  await rejectsCode(transport.commit(battle, tokenA, selection), "NETWORK_UNCERTAIN");
  assert.equal((await storage.getPending(battle, tokenA)).commandId, "command-before-1");
  await transport.retryPending(battle, tokenA);
  assert.equal(calls, 2);
  assert.equal(await storage.getPending(battle, tokenA), null);
});

await test("successful commit uses only original participant endpoint and never double-posts", async () => {
  const storage = createMemoryStorage();
  const requests = [];
  const transport = makeTransport({ apiOrigin: "https://game-api.example.test", originApproved: true, storage, idFactory: () => "command-1234",
    fetchImpl: async (url, init) => {
      requests.push({ url, body: JSON.parse(init.body), auth: init.headers.get("Authorization") });
      return new Response(JSON.stringify({ view: { phase: "waiting", selfCommitted: true, opponentCommitted: false } }), { status: 200 });
    } });
  await transport.commit(battle, tokenA, selection);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, `https://game-api.example.test/v1/battles/${battle}/commit`);
  assert.equal(requests[0].auth, `Bearer ${tokenA}`);
  assert.deepEqual(requests[0].body, { commandId: "command-1234", selection });
  assert.equal(await storage.getPending(battle, tokenA), null);
});

await test("revoked capability becomes a fixed non-sensitive error", async () => {
  const transport = makeTransport({ apiOrigin: "https://game-api.example.test", originApproved: true, storage: createMemoryStorage(),
    fetchImpl: async () => new Response(JSON.stringify({ error: "UNAUTHORIZED", token: tokenA }), { status: 401 }) });
  await rejectsCode(transport.connect(battle, tokenA), "CAPABILITY_REJECTED");
});

await test("client contains no admin routes, admin/recovery secrets, telemetry, or token URL handling", async () => {
  const files = ["index.html", "app.mjs", "client.mjs", "config.mjs", "build.mjs", "style.css"];
  const contents = (await Promise.all(files.map(file => readFile(path.join(root, file), "utf8")))).join("\n");
  for (const forbidden of ["ADMIN_CONTROL_TOKEN", "CREATE_RECOVERY_KEYS", "CREATE_RECOVERY_KEY_CURRENT",
    "/v1/admin", "telemetry", "localStorage", "location.search", "location.hash"]) {
    assert.equal(contents.includes(forbidden), false, `forbidden string ${forbidden}`);
  }
  assert.match(await readFile(path.join(root, "config.mjs"), "utf8"), /API_ORIGIN\s*=\s*""/);
  assert.match(await readFile(path.join(root, "config.mjs"), "utf8"), /API_ORIGIN_APPROVED\s*=\s*false/);
  assert.match(await readFile(path.join(root, "index.html"), "utf8"), /connect-src 'none'/);
  assert.equal(sanitizeSelection(selection).role, "citizen");
});

await test("build is blocked without an exact approved origin and emits no public configuration", async () => {
  const temp = await mkdtemp(path.join(os.tmpdir(), "chat03-client-build-test-"));
  try {
    const buildRoot = path.join(temp, "remote-client");
    await mkdir(buildRoot, { recursive: true });
    for (const name of ["index.html", "app.mjs", "client.mjs", "style.css", "build.mjs"]) {
      await cp(path.join(root, name), path.join(buildRoot, name));
    }
    const build = env => spawnSync(process.execPath, [path.join(buildRoot, "build.mjs")], {
      cwd: temp, env: { ...process.env, ...env }, encoding: "utf8",
    });
    const configured = build({ CHAT03_API_ORIGIN: "https://client-test.invalid", CHAT03_API_ORIGIN_APPROVED: "YES" });
    assert.equal(configured.status, 0, configured.stderr);
    const generatedHtml = await readFile(path.join(buildRoot, "dist/index.html"), "utf8");
    const generatedHeaders = await readFile(path.join(buildRoot, "dist/_headers"), "utf8");
    const generatedConfig = await readFile(path.join(buildRoot, "dist/config.mjs"), "utf8");
    assert.match(generatedHtml, /connect-src https:\/\/client-test\.invalid/);
    assert.doesNotMatch(generatedHtml, /frame-ancestors/);
    assert.match(generatedHeaders, /frame-ancestors 'none'/);
    assert.match(generatedHeaders, /X-Frame-Options: DENY/);
    assert.match(generatedHeaders, /Referrer-Policy: no-referrer/);
    assert.match(generatedConfig, /API_ORIGIN_APPROVED = true/);
    const forbidden = build({ CHAT03_API_ORIGIN: "https://samuray-games.github.io.", CHAT03_API_ORIGIN_APPROVED: "YES" });
    assert.equal(forbidden.status, 2);
    assert.match(forbidden.stderr, /BUILD_BLOCKED/);
    await assert.rejects(stat(path.join(buildRoot, "dist")));
    const blocked = build({ CHAT03_API_ORIGIN: "", CHAT03_API_ORIGIN_APPROVED: "" });
    assert.equal(blocked.status, 2);
    assert.match(blocked.stderr, /BUILD_BLOCKED/);
    await assert.rejects(stat(path.join(buildRoot, "dist")));
    assert.equal(validateApiOrigin("https://proposed-template.workers.dev/path"), null);
  } finally { await rm(temp, { recursive: true, force: true }); }
});

console.log(`REMOTE_CLIENT_TESTS_PASS ${assertions}/18`);
