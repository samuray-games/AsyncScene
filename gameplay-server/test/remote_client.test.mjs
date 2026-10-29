import assert from "node:assert/strict";
import { cp, mkdir, readFile, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRemoteClientApp } from "../remote-client/app.mjs";
import {
  createIndexedDbStorage, createMemoryStorage, makeTransport, sanitizeSelection,
  validateApiOrigin, visibleBattleState,
} from "../remote-client/client.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../remote-client");
const battle = "123e4567-e89b-42d3-a456-426614174000";
const tokenA = "A".repeat(43);
const tokenB = "B".repeat(43);
const selection = { attackColor: "y", defenseColor: "o", attackType: "N", defenseType: "S", role: "citizen" };
const validView = (overrides = {}) => ({ battleId: battle, version: 1,
  phase: overrides.phase ?? (overrides.selfCommitted && overrides.opponentCommitted ? "committed" :
    overrides.selfCommitted || overrides.opponentCommitted ? "waiting" : "created"),
  selfCommitted: false, opponentCommitted: false, revealed: false, ...overrides });
const validResolution = (mechanicalOutcome = "A_WIN") => ({ ok: true, rulesVersion: "tactical_v1",
  pressureA: 3, pressureB: 2, defenseA: 1, defenseB: 1, hitA: true, hitB: false,
  mechanicalOutcome, close: false, lead: null,
  explanation: { code: "A_ONLY_HIT", text: "test result", hitReasonA: "PRESSURE_EXCEEDS_DEFENSE",
    hitReasonB: "COLOR_GAP_STOPS_ATTACK" } });
const revealedView = (overrides = {}) => validView({ phase: "revealed", selfCommitted: true,
  opponentCommitted: true, revealed: true, selections: { A: selection, B: { ...selection, attackType: "T" } },
  resolution: validResolution(), mechanicalOutcome: "A_WIN", socialOutcome: "NONE", recognizedOutcome: "PENDING", ...overrides });
let assertions = 0;
function test(name, fn) {
  return Promise.resolve().then(fn).then(() => { assertions++; console.log(`PASS ${name}`); });
}
async function rejectsCode(promise, code) {
  await assert.rejects(promise, error => error.message === code);
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

class FakeElement {
  constructor(id, fields = []) {
    this.id = id;
    this.fields = fields;
    this.listeners = new Map();
    this.value = "";
    this.textContent = "";
    this.hidden = false;
    this.disabled = false;
  }
  addEventListener(type, listener) { this.listeners.set(type, listener); }
  querySelectorAll() { return this.fields; }
  dispatch(type) {
    const listener = this.listeners.get(type);
    assert.ok(listener, `missing ${type} listener on ${this.id}`);
    return listener({ preventDefault() {} });
  }
}

class FakeFormData {
  constructor(form) { this.form = form; }
  entries() { return this.form.fields.filter(field => !field.disabled).map(field => [field.name, field.value]); }
}

function fakeDocument() {
  const connectFields = [new FakeElement("battle-id"), new FakeElement("token")];
  connectFields[0].value = "";
  connectFields[1].value = "";
  const commitFields = [
    Object.assign(new FakeElement("attackType"), { name: "attackType", value: "N" }),
    Object.assign(new FakeElement("attackColor"), { name: "attackColor", value: "y" }),
    Object.assign(new FakeElement("defenseType"), { name: "defenseType", value: "S" }),
    Object.assign(new FakeElement("defenseColor"), { name: "defenseColor", value: "o" }),
    Object.assign(new FakeElement("role"), { name: "role", value: "citizen" }),
  ];
  const elements = new Map([
    ["connect-form", new FakeElement("connect-form", connectFields)],
    ["commit-form", new FakeElement("commit-form", commitFields)],
    ["battle-id", connectFields[0]], ["token", connectFields[1]],
    ...["status", "battle", "own-state", "opponent-state", "result", "remember", "commit-button", "forget"]
      .map(id => [id, new FakeElement(id)]),
  ]);
  return { getElementById: id => elements.get(id), elements, connectFields, commitFields };
}

function fakeTimers() {
  const callbacks = new Map();
  let nextId = 0;
  return {
    callbacks,
    setInterval(callback) { const id = ++nextId; callbacks.set(id, callback); return id; },
    clearInterval(id) { callbacks.delete(id); },
  };
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
      return new Response(JSON.stringify({ battleId: battle, ...validView() }), { status: 200 });
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
  const hidden = validView({ phase: "committed", selfCommitted: true, opponentCommitted: true, revealed: false,
    selections: { A: selection, B: { ...selection, attackColor: "r" } } });
  assert.equal(visibleBattleState(hidden, selection).result, null);
  assert.throws(() => visibleBattleState({ ...hidden, revealed: true }, selection), /INVALID_SERVER_RESPONSE/,
    "a reveal flag inconsistent with the server phase fails closed");
  const revealed = visibleBattleState(revealedView({ selections: hidden.selections }), selection);
  assert.deepEqual(revealed.result.selections.B, { ...selection, attackColor: "r" });
});

await test("Chat01 attack and defense codes use all six approved Russian labels", async () => {
  const html = await readFile(path.join(root, "index.html"), "utf8");
  for (const [code, label] of [["N", "Наезд"], ["P", "Предъява"], ["T", "Подкол"],
    ["S", "Спокойная защита"], ["C", "Контратака"], ["G", "Агрессия"]]) {
    assert.ok(html.includes(`<option value="${code}">${label}</option>`), `missing ${code} label ${label}`);
  }
  for (const oldLabel of ["Напор", "Позиция", "Техника", "Стойка", "Контроль", "Гибкость"]) {
    assert.equal(html.includes(oldLabel), false, `obsolete label remains: ${oldLabel}`);
  }
});

await test("Forget invalidates automatic IndexedDB restore before it can reconnect or restore fields", async () => {
  const credentialRead = deferred();
  let connects = 0;
  let credentials = { token: tokenA, battleId: battle };
  const storage = {
    getCredential: () => credentialRead.promise,
    getPending: async () => null,
    saveToken: async () => {},
    forget: async () => { credentials = null; },
  };
  const transport = { ready: true, connect: async () => { connects++; return validView(); } };
  const doc = fakeDocument();
  const app = createRemoteClientApp({ document: doc, storage, transport,
    setIntervalImpl: () => 1, clearIntervalImpl: () => {} });
  const forgetting = doc.elements.get("forget").dispatch("click");
  assert.equal(doc.elements.get("token").value, "", "Forget clears the token synchronously");
  assert.equal(doc.elements.get("battle").hidden, true, "Forget hides the old battle synchronously");
  credentialRead.resolve({ token: tokenA, battleId: battle });
  await Promise.all([app.restorePromise, forgetting]);
  assert.equal(connects, 0, "stale restore must stop before starting its network read");
  assert.equal(doc.elements.get("token").value, "");
  assert.equal(doc.elements.get("battle-id").value, "");
  assert.equal(doc.elements.get("battle").hidden, true);
  assert.equal(credentials, null);
});

await test("Forget during the final IndexedDB phase of auto restore ignores pending-session completion", async () => {
  const pendingRead = deferred();
  const pendingStarted = deferred();
  const storage = {
    getCredential: async () => ({ token: tokenA, battleId: battle }),
    getPending: () => { pendingStarted.resolve(); return pendingRead.promise; },
    saveToken: async () => {}, forget: async () => {},
  };
  const transport = { ready: true, connect: async () => validView() };
  const doc = fakeDocument();
  const app = createRemoteClientApp({ document: doc, storage, transport,
    setIntervalImpl: () => 1, clearIntervalImpl: () => {} });
  await pendingStarted.promise;
  const forgetting = doc.elements.get("forget").dispatch("click");
  pendingRead.resolve({ selection, commandId: "pending-old" });
  await Promise.all([app.restorePromise, forgetting]);
  assert.equal(doc.elements.get("token").value, "");
  assert.equal(doc.elements.get("battle-id").value, "");
  assert.equal(doc.elements.get("battle").hidden, true);
  assert.equal(doc.elements.get("remember").disabled, true);
});

await test("Forget during manual connection prevents late GET and pending-state results from activating the session", async () => {
  const getResponse = deferred();
  let pendingReads = 0;
  const storage = { getCredential: async () => null, getPending: async () => { pendingReads++; return null; },
    saveToken: async () => {}, forget: async () => {} };
  const transport = { ready: true, connect: () => getResponse.promise };
  const doc = fakeDocument();
  const app = createRemoteClientApp({ document: doc, storage, transport,
    setIntervalImpl: () => 1, clearIntervalImpl: () => {} });
  await app.restorePromise;
  doc.elements.get("battle-id").value = battle;
  doc.elements.get("token").value = tokenA;
  const connecting = doc.elements.get("connect-form").dispatch("submit");
  const forgetting = doc.elements.get("forget").dispatch("click");
  getResponse.resolve(validView());
  await Promise.all([connecting, forgetting]);
  assert.equal(pendingReads, 0, "stale manual GET must not proceed to restore pending state");
  assert.equal(doc.elements.get("battle").hidden, true);
  assert.equal(doc.elements.get("token").value, "");
  assert.match(doc.elements.get("status").textContent, /удалён/);
});

await test("Forget during manual connection's IndexedDB lookup ignores the late pending command", async () => {
  const pendingRead = deferred();
  const pendingStarted = deferred();
  const storage = { getCredential: async () => null,
    getPending: () => { pendingStarted.resolve(); return pendingRead.promise; },
    saveToken: async () => {}, forget: async () => {} };
  const transport = { ready: true, connect: async () => validView() };
  const doc = fakeDocument();
  const app = createRemoteClientApp({ document: doc, storage, transport,
    setIntervalImpl: () => 1, clearIntervalImpl: () => {} });
  await app.restorePromise;
  doc.elements.get("battle-id").value = battle;
  doc.elements.get("token").value = tokenA;
  const connecting = doc.elements.get("connect-form").dispatch("submit");
  await pendingStarted.promise;
  const forgetting = doc.elements.get("forget").dispatch("click");
  pendingRead.resolve({ selection, commandId: "pending-old" });
  await Promise.all([connecting, forgetting]);
  assert.equal(doc.elements.get("battle").hidden, true);
  assert.equal(doc.elements.get("token").value, "");
  assert.equal(doc.elements.get("commit-button").textContent, "");
});

await test("Forget during refresh ignores the late response and does not repaint the old battle", async () => {
  const refreshResponse = deferred();
  let connects = 0;
  const storage = { getCredential: async () => null, getPending: async () => null,
    saveToken: async () => {}, forget: async () => {} };
  const transport = { ready: true, connect: async () => {
    connects++;
    if (connects === 1) return validView();
    return refreshResponse.promise;
  } };
  const doc = fakeDocument();
  const timers = fakeTimers();
  const app = createRemoteClientApp({ document: doc, storage, transport,
    setIntervalImpl: timers.setInterval, clearIntervalImpl: timers.clearInterval });
  await app.restorePromise;
  doc.elements.get("battle-id").value = battle;
  doc.elements.get("token").value = tokenA;
  await doc.elements.get("connect-form").dispatch("submit");
  assert.equal(doc.elements.get("battle").hidden, false);
  const tick = [...timers.callbacks.values()][0];
  const refreshing = tick();
  assert.equal(connects, 2);
  const forgetting = doc.elements.get("forget").dispatch("click");
  refreshResponse.resolve(revealedView());
  await Promise.all([refreshing, forgetting]);
  assert.equal(doc.elements.get("battle").hidden, true);
  assert.equal(doc.elements.get("result").textContent, "");
  assert.match(doc.elements.get("status").textContent, /удалён/);
});

await test("Forget during an in-flight commit suppresses stale UI, preserves commandId, and retry reuses it", async () => {
  const firstPost = deferred();
  const postStarted = deferred();
  const posts = [];
  const committedCommands = new Map();
  const storage = createMemoryStorage();
  const view = () => validView({ selfCommitted: committedCommands.size > 0 });
  const transport = makeTransport({ apiOrigin: "https://game-api.example.test", originApproved: true,
    storage, idFactory: () => "forget-race-command-1",
    fetchImpl: async (url, init) => {
      if (init.method === "GET") return new Response(JSON.stringify(view()), { status: 200 });
      const body = JSON.parse(init.body);
      posts.push(body.commandId);
      if (!committedCommands.has(body.commandId)) committedCommands.set(body.commandId, body.selection);
      if (posts.length === 1) {
        postStarted.resolve(body);
        return firstPost.promise;
      }
      return new Response(JSON.stringify({ view: view() }), { status: 200 });
    } });
  const doc = fakeDocument();
  const app = createRemoteClientApp({ document: doc, storage, transport,
    FormDataImpl: FakeFormData, setIntervalImpl: () => 1, clearIntervalImpl: () => {} });
  await app.restorePromise;
  doc.elements.get("battle-id").value = battle;
  doc.elements.get("token").value = tokenA;
  await doc.elements.get("connect-form").dispatch("submit");
  const submitting = doc.elements.get("commit-form").dispatch("submit");
  const original = await postStarted.promise;
  const forgetting = doc.elements.get("forget").dispatch("click");
  assert.equal(doc.elements.get("battle").hidden, true, "Forget hides the current session before awaiting storage");
  await forgetting;
  firstPost.resolve(new Response(JSON.stringify({ view: view() }), { status: 200 }));
  await submitting;

  const pending = await storage.getPending(battle, tokenA);
  assert.equal(pending.commandId, original.commandId, "accepted-but-unacknowledged command identity remains durable");
  assert.deepEqual(posts, [original.commandId], "late completion must not trigger an automatic repeat");
  assert.equal(doc.elements.get("battle").hidden, true, "late commit response cannot restore the forgotten UI");
  assert.equal(doc.elements.get("token").value, "");

  doc.elements.get("battle-id").value = battle;
  doc.elements.get("token").value = tokenA;
  await doc.elements.get("connect-form").dispatch("submit");
  assert.equal(doc.elements.get("commit-button").textContent, "Повторить исходную команду");
  await doc.elements.get("commit-form").dispatch("submit");
  assert.deepEqual(posts, [original.commandId, original.commandId], "recovery reuses the exact original commandId");
  assert.equal(committedCommands.size, 1, "server-side idempotent replay represents one committed write");
  assert.equal(await storage.getPending(battle, tokenA), null);
});

await test("same-token tabs atomically share one durable command and compare-delete cannot erase its replacement", async () => {
  const storage = createMemoryStorage();
  let next = 0;
  const transport = makeTransport({ apiOrigin: "https://game-api.example.test", originApproved: true,
    storage, idFactory: () => `same-tab-command-${++next}`, fetchImpl: async () => new Response("{}") });
  const [first, second] = await Promise.all([
    transport.prepareCommit(battle, tokenA, selection),
    transport.prepareCommit(battle, tokenA, selection),
  ]);
  assert.equal(first.commandId, second.commandId, "parallel tabs must receive the atomically persisted winner");
  await storage.clearPendingIfCommand(battle, tokenA, "different-command-id");
  assert.equal((await storage.getPending(battle, tokenA)).commandId, first.commandId,
    "late acknowledgement from a different command cannot clear the durable retry identity");
});

await test("separate IndexedDB connections serialize concurrent same-token command creation", async () => {
  const indexedDB = new FakeIndexedDB();
  const firstStorage = createIndexedDbStorage(indexedDB);
  const secondStorage = createIndexedDbStorage(indexedDB);
  let next = 0;
  const firstTransport = makeTransport({ apiOrigin: "https://game-api.example.test", originApproved: true,
    storage: firstStorage, idFactory: () => `idb-tab-command-${++next}` });
  const secondTransport = makeTransport({ apiOrigin: "https://game-api.example.test", originApproved: true,
    storage: secondStorage, idFactory: () => `idb-tab-command-${++next}` });
  const prepared = await Promise.all([
    firstTransport.prepareCommit(battle, tokenA, selection),
    secondTransport.prepareCommit(battle, tokenA, selection),
  ]);
  assert.equal(prepared[0].commandId, prepared[1].commandId);
  const durable = await firstStorage.getPending(battle, tokenA);
  assert.equal(durable.commandId, prepared[0].commandId);
});

await test("manual reconnect never labels a pending selection as committed when server already has a move", async () => {
  const storage = createMemoryStorage();
  const staleSelection = { ...selection, attackColor: "o", attackType: "T" };
  const transport = makeTransport({ apiOrigin: "https://game-api.example.test", originApproved: true, storage,
    idFactory: () => "manual-reconnect-stale-command",
    fetchImpl: async (_url, init) => init.method === "GET"
      ? new Response(JSON.stringify(validView({ phase: "waiting", version: 2, selfCommitted: true })), { status: 200 })
      : new Response("{}", { status: 500 }) });
  const pending = await transport.prepareCommit(battle, tokenA, staleSelection);
  const doc = fakeDocument();
  const app = createRemoteClientApp({ document: doc, storage, transport, FormDataImpl: FakeFormData,
    setIntervalImpl: () => 1, clearIntervalImpl: () => {} });
  await app.restorePromise;
  doc.elements.get("battle-id").value = battle;
  doc.elements.get("token").value = tokenA;
  await doc.elements.get("connect-form").dispatch("submit");

  assert.equal(doc.elements.get("own-state").textContent, "Ваш статус: ход подтверждён.",
    "the pending T selection must not be attributed to the server-confirmed move");
  assert.equal(doc.elements.get("commit-button").textContent, "Повторить исходную команду");
  assert.equal((await storage.getPending(battle, tokenA)).commandId, pending.commandId,
    "retain the original command identity for reconciliation");
});

await test("auto-restore never labels a pending selection as committed when server already has a move", async () => {
  const storage = createMemoryStorage();
  const staleSelection = { ...selection, attackColor: "o", attackType: "T" };
  await storage.saveToken(tokenA, battle);
  const transport = makeTransport({ apiOrigin: "https://game-api.example.test", originApproved: true, storage,
    idFactory: () => "auto-restore-stale-command",
    fetchImpl: async (_url, init) => init.method === "GET"
      ? new Response(JSON.stringify(validView({ phase: "waiting", version: 2, selfCommitted: true })), { status: 200 })
      : new Response("{}", { status: 500 }) });
  const pending = await transport.prepareCommit(battle, tokenA, staleSelection);
  const doc = fakeDocument();
  const app = createRemoteClientApp({ document: doc, storage, transport, FormDataImpl: FakeFormData,
    setIntervalImpl: () => 1, clearIntervalImpl: () => {} });
  await app.restorePromise;

  assert.equal(doc.elements.get("own-state").textContent, "Ваш статус: ход подтверждён.",
    "auto-restore must not claim the pending T selection was the accepted move");
  assert.equal(doc.elements.get("commit-button").textContent, "Повторить исходную команду");
  assert.equal((await storage.getPending(battle, tokenA)).commandId, pending.commandId,
    "retain the original command identity for reconciliation");
});

await test("stale second tab reconciles ALREADY_COMMITTED by readback without accepting its own selection", async () => {
  const storage = createMemoryStorage();
  let gets = 0;
  const posts = [];
  const transport = makeTransport({ apiOrigin: "https://game-api.example.test", originApproved: true, storage,
    idFactory: () => "stale-tab-command-2",
    fetchImpl: async (_url, init) => {
      if (init.method === "GET") {
        gets++;
        return new Response(JSON.stringify(gets === 1
          ? validView({ version: 1 })
          : validView({ phase: "waiting", version: 2, selfCommitted: true })), { status: 200 });
      }
      posts.push(JSON.parse(init.body));
      return new Response(JSON.stringify({ error: "ALREADY_COMMITTED" }), { status: 409 });
    } });
  const doc = fakeDocument();
  const app = createRemoteClientApp({ document: doc, storage, transport, FormDataImpl: FakeFormData,
    setIntervalImpl: () => 1, clearIntervalImpl: () => {} });
  await app.restorePromise;
  doc.elements.get("battle-id").value = battle;
  doc.elements.get("token").value = tokenA;
  await doc.elements.get("connect-form").dispatch("submit");
  doc.commitFields.find(field => field.name === "attackColor").value = "o";
  await doc.elements.get("commit-form").dispatch("submit");
  assert.equal(posts.length, 1, "the rejected fresh command is not blindly retried");
  assert.equal(posts[0].commandId, "stale-tab-command-2");
  assert.equal(await storage.getPending(battle, tokenA), null,
    "only after selfCommitted readback is the exact rejected command removed");
  assert.match(doc.elements.get("own-state").textContent, /ход подтверждён/);
  assert.match(doc.elements.get("status").textContent, /подтвердил ход этого участника ранее/);
  assert.equal(doc.elements.get("own-state").textContent.includes("o/S"), false,
    "the rejected tab's local selection is not displayed as the accepted server selection");
});

await test("retry submits the exact command read by the app and never displays a concurrently replaced selection", async () => {
  const baseStorage = createMemoryStorage();
  const preparer = makeTransport({ apiOrigin: "https://game-api.example.test", originApproved: true,
    storage: baseStorage, idFactory: () => "retry-original-command" });
  const original = await preparer.prepareCommit(battle, tokenA, selection);
  const replacement = { ...original, commandId: "retry-replacement-command", selection: { ...selection, attackColor: "o" } };
  let pendingReads = 0;
  const storage = {
    ...baseStorage,
    getCredential: () => baseStorage.getCredential(),
    getPending: async (...args) => {
      pendingReads++;
      const result = await baseStorage.getPending(...args);
      if (pendingReads === 2) await baseStorage.putPending(replacement);
      return result;
    },
  };
  const posted = [];
  let gets = 0;
  const transport = makeTransport({ apiOrigin: "https://game-api.example.test", originApproved: true, storage,
    fetchImpl: async (_url, init) => {
      if (init.method === "GET") {
        gets++;
        return new Response(JSON.stringify(gets === 1 ? validView() : validView({ phase: "waiting", version: 2, selfCommitted: true })), { status: 200 });
      }
      posted.push(JSON.parse(init.body));
      return new Response(JSON.stringify({ error: "ALREADY_COMMITTED" }), { status: 409 });
    } });
  const doc = fakeDocument();
  const app = createRemoteClientApp({ document: doc, storage, transport, FormDataImpl: FakeFormData,
    setIntervalImpl: () => 1, clearIntervalImpl: () => {} });
  await app.restorePromise;
  doc.elements.get("battle-id").value = battle;
  doc.elements.get("token").value = tokenA;
  await doc.elements.get("connect-form").dispatch("submit");
  await doc.elements.get("commit-form").dispatch("submit");
  assert.equal(posted.length, 1);
  assert.equal(posted[0].commandId, original.commandId,
    "the command sent is the exact ID captured by the app, not a later IndexedDB value");
  assert.equal((await baseStorage.getPending(battle, tokenA)).commandId, replacement.commandId,
    "a concurrently replaced pending command is retained for its own reconciliation");
  assert.match(doc.elements.get("own-state").textContent, /ход подтверждён\./,
    "server confirmation is shown without borrowing the replacement's selection");
  assert.equal(doc.elements.get("own-state").textContent.includes("o/S"), false);
});

await test("stale retry tab reconciles a cleared shared pending from selfCommitted readback without posting", async () => {
  const storage = createMemoryStorage();
  const prep = makeTransport({ apiOrigin: "https://game-api.example.test", originApproved: true, storage,
    idFactory: () => "shared-tab-command-1" });
  await prep.prepareCommit(battle, tokenA, selection);
  let gets = 0;
  let posts = 0;
  const transport = makeTransport({ apiOrigin: "https://game-api.example.test", originApproved: true, storage,
    fetchImpl: async (_url, init) => {
      if (init.method === "POST") { posts++; return new Response("{}", { status: 500 }); }
      gets++;
      return new Response(JSON.stringify(gets === 1
        ? validView()
        : validView({ phase: "waiting", version: 2, selfCommitted: true })), { status: 200 });
    } });
  const doc = fakeDocument();
  const app = createRemoteClientApp({ document: doc, storage, transport,
    setIntervalImpl: () => 1, clearIntervalImpl: () => {} });
  await app.restorePromise;
  doc.elements.get("battle-id").value = battle;
  doc.elements.get("token").value = tokenA;
  await doc.elements.get("connect-form").dispatch("submit");
  assert.equal(doc.elements.get("commit-button").textContent, "Повторить исходную команду");

  await storage.clearPending(battle, tokenA); // another tab received the server acknowledgement
  await doc.elements.get("commit-form").dispatch("submit");
  assert.equal(posts, 0, "missing shared command must never be replaced by a new POST");
  assert.equal(await storage.getPending(battle, tokenA), null);
  assert.equal(doc.elements.get("commit-form").hidden, true);
  assert.equal(doc.elements.get("own-state").textContent, "Ваш статус: ход подтверждён.");
  assert.match(doc.elements.get("status").textContent, /новый ход не отправлялся/);
});

await test("late commit acknowledgement cannot roll a newer revealed version back", async () => {
  const storage = createMemoryStorage();
  const postResponse = deferred();
  const postStarted = deferred();
  let gets = 0;
  const transport = makeTransport({ apiOrigin: "https://game-api.example.test", originApproved: true, storage,
    idFactory: () => "late-ack-command-1",
    fetchImpl: async (_url, init) => {
      if (init.method === "POST") { postStarted.resolve(); return postResponse.promise; }
      gets++;
      return new Response(JSON.stringify(gets === 1 ? validView({ version: 1 }) : revealedView({ version: 3 })), { status: 200 });
    } });
  const doc = fakeDocument();
  const app = createRemoteClientApp({ document: doc, storage, transport, FormDataImpl: FakeFormData,
    setIntervalImpl: () => 1, clearIntervalImpl: () => {} });
  await app.restorePromise;
  doc.elements.get("battle-id").value = battle;
  doc.elements.get("token").value = tokenA;
  await doc.elements.get("connect-form").dispatch("submit");
  const submitting = doc.elements.get("commit-form").dispatch("submit");
  await postStarted.promise;
  await app.refresh();
  assert.equal(doc.elements.get("result").hidden, false, "newer polling result is displayed first");
  postResponse.resolve(new Response(JSON.stringify({ view: validView({ version: 2, selfCommitted: true }) }), { status: 200 }));
  await submitting;
  assert.equal(doc.elements.get("result").hidden, false, "older POST acknowledgement cannot hide the reveal");
  assert.equal(doc.elements.get("result").textContent.includes("Атаки раскрыты: N/T"), true);
  assert.equal(doc.elements.get("commit-form").hidden, true);
});

await test("malformed GET and POST views fail closed without deleting the retry command", async () => {
  const storage = createMemoryStorage();
  let responseView = {};
  const transport = makeTransport({ apiOrigin: "https://game-api.example.test", originApproved: true, storage,
    idFactory: () => "malformed-view-command-1",
    fetchImpl: async (_url, init) => init.method === "GET"
      ? new Response(JSON.stringify(responseView), { status: 200 })
      : new Response(JSON.stringify({ view: responseView }), { status: 200 }) });
  await rejectsCode(transport.connect(battle, tokenA), "INVALID_SERVER_RESPONSE");
  const pending = await transport.prepareCommit(battle, tokenA, selection);
  await rejectsCode(transport.sendPending(battle, tokenA, pending), "INVALID_SERVER_RESPONSE");
  assert.equal((await storage.getPending(battle, tokenA)).commandId, pending.commandId);
  responseView = revealedView({ selections: {} });
  await rejectsCode(transport.connect(battle, tokenA), "INVALID_SERVER_RESPONSE");
  await rejectsCode(transport.sendPending(battle, tokenA, pending), "INVALID_SERVER_RESPONSE");
  assert.equal((await storage.getPending(battle, tokenA)).commandId, pending.commandId,
    "nested malformed reveal shape cannot clear recovery state");
  responseView = revealedView({ phase: "final", selfCommitted: false, opponentCommitted: true });
  await rejectsCode(transport.connect(battle, tokenA), "INVALID_SERVER_RESPONSE");
  await rejectsCode(transport.sendPending(battle, tokenA, pending), "INVALID_SERVER_RESPONSE");
  assert.equal((await storage.getPending(battle, tokenA)).commandId, pending.commandId,
    "impossible final phase/commit flags cannot clear recovery state");
  responseView = revealedView({ phase: "final", mechanicalOutcome: "DRAW",
    resolution: validResolution("DRAW"), recognizedOutcome: "DRAW", socialOutcome: "NONE" });
  await rejectsCode(transport.connect(battle, tokenA), "INVALID_SERVER_RESPONSE");
  await rejectsCode(transport.sendPending(battle, tokenA, pending), "INVALID_SERVER_RESPONSE");
  assert.equal((await storage.getPending(battle, tokenA)).commandId, pending.commandId,
    "canonical-impossible final DRAW cannot clear a pending command");
  responseView = validView({ selfCommitted: true });
  await transport.sendPending(battle, tokenA, pending);
  assert.equal(await storage.getPending(battle, tokenA), null);
});

await test("out-of-order refresh cannot roll a revealed view back to an older waiting version", async () => {
  const storage = createMemoryStorage();
  const responses = [deferred(), deferred()];
  let gets = 0;
  const transport = { ready: true, connect: async () => {
    gets++;
    if (gets === 1) return validView({ version: 1 });
    return responses[gets - 2].promise;
  } };
  const doc = fakeDocument();
  const app = createRemoteClientApp({ document: doc, storage, transport,
    setIntervalImpl: () => 1, clearIntervalImpl: () => {} });
  await app.restorePromise;
  doc.elements.get("battle-id").value = battle;
  doc.elements.get("token").value = tokenA;
  await doc.elements.get("connect-form").dispatch("submit");
  const older = app.refresh();
  const newer = app.refresh();
  responses[1].resolve(revealedView({ version: 3 }));
  await new Promise(resolve => setImmediate(resolve));
  responses[0].resolve(validView({ version: 2, phase: "waiting", selfCommitted: false, opponentCommitted: true }));
  await Promise.all([older, newer]);
  assert.equal(doc.elements.get("result").hidden, false);
  assert.equal(doc.elements.get("commit-form").hidden, true);
  assert.match(doc.elements.get("own-state").textContent, /подтверждён/);
});

await test("expired state closes commit and safely clears only an uncommitted pending intent", async () => {
  const storage = createMemoryStorage();
  const pending = await makeTransport({ apiOrigin: "https://game-api.example.test", originApproved: true, storage,
    idFactory: () => "expired-uncommitted-1", fetchImpl: async () => new Response("{}") })
    .prepareCommit(battle, tokenA, selection);
  let posts = 0;
  const transport = { ready: true, connect: async () => validView({ version: 9, phase: "expired" }),
    retryPending: async () => { posts++; throw new Error("should not submit after authoritative expiry"); } };
  const doc = fakeDocument();
  const app = createRemoteClientApp({ document: doc, storage, transport,
    setIntervalImpl: () => 1, clearIntervalImpl: () => {} });
  await app.restorePromise;
  doc.elements.get("battle-id").value = battle;
  doc.elements.get("token").value = tokenA;
  await doc.elements.get("connect-form").dispatch("submit");
  assert.equal(await storage.getPending(battle, tokenA), null, "terminal readback proves no participant commit was accepted");
  assert.equal(doc.elements.get("commit-form").hidden, true);
  assert.equal(doc.elements.get("commit-button").disabled, false);
  assert.equal(pending.commandId, "expired-uncommitted-1");
  assert.equal(posts, 0);
});

await test("deadline-crossing 200 timeout response is not reported as an accepted commit", async () => {
  const storage = createMemoryStorage();
  const transport = makeTransport({ apiOrigin: "https://game-api.example.test", originApproved: true, storage,
    idFactory: () => "late-timeout-command-1",
    fetchImpl: async (_url, init) => init.method === "GET"
      ? new Response(JSON.stringify(validView()), { status: 200 })
      : new Response(JSON.stringify({ code: "TIMED_OUT", view: validView({ phase: "expired", version: 2 }) }), { status: 200 }) });
  const doc = fakeDocument();
  const app = createRemoteClientApp({ document: doc, storage, transport, FormDataImpl: FakeFormData,
    setIntervalImpl: () => 1, clearIntervalImpl: () => {} });
  await app.restorePromise;
  doc.elements.get("battle-id").value = battle;
  doc.elements.get("token").value = tokenA;
  await doc.elements.get("connect-form").dispatch("submit");
  await doc.elements.get("commit-form").dispatch("submit");
  assert.match(doc.elements.get("status").textContent, /Срок хода завершён/);
  assert.doesNotMatch(doc.elements.get("status").textContent, /Ход принят/);
  assert.equal(doc.elements.get("commit-form").hidden, true);
  assert.equal(await storage.getPending(battle, tokenA), null);
});

await test("Forget waits behind an in-flight opt-in write so it cannot resurrect a credential", async () => {
  const saveStarted = deferred();
  const saveGate = deferred();
  let credential = null;
  const storage = {
    getCredential: async () => null,
    getPending: async () => null,
    saveToken: async (token, battleId, isCurrent) => {
      if (!isCurrent()) throw new Error("SESSION_EXPIRED");
      saveStarted.resolve();
      await saveGate.promise;
      credential = { token, battleId };
    },
    forget: async () => { credential = null; },
  };
  const transport = { ready: true, connect: async () => validView() };
  const doc = fakeDocument();
  const app = createRemoteClientApp({ document: doc, storage, transport,
    setIntervalImpl: () => 1, clearIntervalImpl: () => {} });
  await app.restorePromise;
  doc.elements.get("battle-id").value = battle;
  doc.elements.get("token").value = tokenA;
  await doc.elements.get("connect-form").dispatch("submit");
  const remembering = doc.elements.get("remember").dispatch("click");
  await saveStarted.promise;
  const forgetting = doc.elements.get("forget").dispatch("click");
  saveGate.resolve();
  await Promise.all([remembering, forgetting]);
  assert.equal(credential, null, "serialized Forget deletion runs after the prior Remember transaction");
  assert.equal(doc.elements.get("token").value, "");
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
      return new Response(JSON.stringify({ view: validView({ selfCommitted: true }) }), { status: 200 });
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
      return new Response(JSON.stringify({ view: validView({ selfCommitted: true }) }), { status: 200 });
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
      return new Response(JSON.stringify({ view: validView({ selfCommitted: true }) }), { status: 200 });
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
      return new Response(JSON.stringify({ view: validView({ selfCommitted: true }) }), { status: 200 }); } });
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
      return new Response(JSON.stringify({ view: validView({ selfCommitted: true }) }), { status: 200 });
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

console.log(`REMOTE_CLIENT_TESTS_PASS ${assertions}/36`);
