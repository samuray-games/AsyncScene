export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const TOKEN_RE = /^[A-Za-z0-9_-]{32,512}$/;
const SELECTION_KEYS = ["attackColor", "defenseColor", "attackType", "defenseType", "role"];

export function validateApiOrigin(value) {
  if (typeof value !== "string" || !value || value !== value.trim()) return null;
  try {
    const url = new URL(value);
    const hostname = url.hostname.replace(/\.+$/, "");
    if (url.protocol !== "https:" || url.origin !== value || url.username || url.password ||
        url.pathname !== "/" || url.search || url.hash || hostname === "samuray-games.github.io" ||
        hostname.endsWith(".github.io")) return null;
    return value;
  } catch { return null; }
}

export function sanitizeSelection(value) {
  if (!value || typeof value !== "object" || Array.isArray(value) ||
      Object.keys(value).length !== SELECTION_KEYS.length ||
      SELECTION_KEYS.some(k => !Object.hasOwn(value, k))) throw new Error("INVALID_SELECTION");
  const result = Object.fromEntries(SELECTION_KEYS.map(k => [k, value[k]]));
  if (!["y", "o", "r", "k"].includes(result.attackColor) ||
      !["y", "o", "r", "k"].includes(result.defenseColor) ||
      !["N", "P", "T"].includes(result.attackType) ||
      !["S", "C", "G"].includes(result.defenseType) ||
      typeof result.role !== "string" || !/^[A-Za-z0-9_-]{1,64}$/.test(result.role) ||
      (result.role !== "mafia" && (result.attackColor === "k" || result.defenseColor === "k"))) {
    throw new Error("INVALID_SELECTION");
  }
  return result;
}

async function pendingKey(battleId, token) {
  const bytes = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token)));
  const scope = Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
  return `${battleId}:${scope}`;
}

export function makeTransport({ apiOrigin, originApproved = false, fetchImpl = globalThis.fetch, storage, idFactory = () => crypto.randomUUID() }) {
  const origin = originApproved ? validateApiOrigin(apiOrigin) : null;
  return Object.freeze({
    ready: Boolean(origin),
    async request(battleId, token, method = "GET", payload) {
      if (!origin) throw new Error("CLIENT_NOT_CONFIGURED");
      if (typeof battleId !== "string" || !UUID_RE.test(battleId)) throw new Error("INVALID_BATTLE_ID");
      if (typeof token !== "string" || !TOKEN_RE.test(token)) throw new Error("INVALID_TOKEN");
      if (method !== "GET" && method !== "POST") throw new Error("METHOD_NOT_ALLOWED");
      if (method === "POST") {
        sanitizeSelection(payload?.selection);
        if (typeof payload?.commandId !== "string" || !/^[A-Za-z0-9:_-]{4,100}$/.test(payload.commandId)) {
          throw new Error("INVALID_COMMAND_ID");
        }
      }
      const url = method === "GET"
        ? `${origin}/v1/battles/${battleId}`
        : `${origin}/v1/battles/${battleId}/commit`;
      const headers = new Headers({ Authorization: `Bearer ${token}` });
      const init = { method, headers, credentials: "omit", cache: "no-store", redirect: "error" };
      if (method === "POST") {
        headers.set("Content-Type", "application/json");
        init.body = JSON.stringify({ commandId: payload.commandId, selection: sanitizeSelection(payload.selection) });
      }
      let response;
      try { response = await fetchImpl(url, init); }
      catch { throw new Error("NETWORK_UNCERTAIN"); }
      if (response.status === 401 || response.status === 403) throw new Error("CAPABILITY_REJECTED");
      if (!response.ok) throw new Error(response.status === 409 ? "COMMAND_CONFLICT" : "REQUEST_FAILED");
      try { return await response.json(); } catch { throw new Error("INVALID_SERVER_RESPONSE"); }
    },
    async connect(battleId, token) { return this.request(battleId, token, "GET"); },
    async prepareCommit(battleId, token, selection, { isCurrent = () => true } = {}) {
      if (typeof battleId !== "string" || !UUID_RE.test(battleId)) throw new Error("INVALID_BATTLE_ID");
      if (typeof token !== "string" || !TOKEN_RE.test(token)) throw new Error("INVALID_TOKEN");
      const safe = sanitizeSelection(selection);
      const key = await pendingKey(battleId, token);
      if (!isCurrent()) throw new Error("SESSION_EXPIRED");
      let pending = await storage.getPending(battleId, token);
      if (!isCurrent()) throw new Error("SESSION_EXPIRED");
      if (pending && JSON.stringify(pending.selection) !== JSON.stringify(safe)) throw new Error("PENDING_COMMAND_EXISTS");
      if (!pending) {
        pending = { key, battleId, commandId: idFactory(), selection: safe };
        if (!isCurrent()) throw new Error("SESSION_EXPIRED");
        await storage.putPending(pending, isCurrent);
        if (!isCurrent()) throw new Error("SESSION_EXPIRED");
      }
      return pending;
    },
    async sendPending(battleId, token, pending, { isCurrent = () => true } = {}) {
      if (!pending || pending.battleId !== battleId) throw new Error("NO_PENDING_COMMAND");
      if (pending.key !== await pendingKey(battleId, token)) throw new Error("NO_PENDING_COMMAND");
      if (!isCurrent()) throw new Error("SESSION_EXPIRED");
      const response = await this.request(battleId, token, "POST", pending);
      if (!isCurrent()) throw new Error("SESSION_EXPIRED");
      if (!response || !response.view) throw new Error("INVALID_SERVER_RESPONSE");
      try { await storage.clearPending(battleId, token); }
      catch { throw new Error("COMMIT_ACKNOWLEDGED_PENDING_RETAINED"); }
      if (!isCurrent()) throw new Error("SESSION_EXPIRED");
      return response;
    },
    async commit(battleId, token, selection, options) {
      const pending = await this.prepareCommit(battleId, token, selection, options);
      return this.sendPending(battleId, token, pending, options);
    },
    async retryPending(battleId, token, options) {
      const pending = await storage.getPending(battleId, token);
      if (!pending) throw new Error("NO_PENDING_COMMAND");
      if (options?.isCurrent && !options.isCurrent()) throw new Error("SESSION_EXPIRED");
      return this.sendPending(battleId, token, pending, options);
    },
  });
}

export function createMemoryStorage() {
  const values = new Map();
  return {
    async getPending(id, token) { return values.get(`pending:${await pendingKey(id, token)}`) || null; },
    async putPending(value, isCurrent = () => true) {
      if (!isCurrent()) throw new Error("SESSION_EXPIRED");
      values.set(`pending:${value.key}`, structuredClone(value));
    },
    async clearPending(id, token) { values.delete(`pending:${await pendingKey(id, token)}`); },
    async getCredential() { return values.get("credential") || null; },
    async getToken() { return values.get("credential")?.token || null; },
    async saveToken(token, battleId, isCurrent = () => true) {
      if (!isCurrent()) throw new Error("SESSION_EXPIRED");
      values.set("credential", { token, battleId });
    },
    async forget() { values.delete("credential"); },
  };
}

export function createIndexedDbStorage(indexedDBImpl = globalThis.indexedDB) {
  const DB_NAME = "asynchronia-participant-client-v1";
  const open = () => new Promise((resolve, reject) => {
    if (!indexedDBImpl) return reject(new Error("STORAGE_UNAVAILABLE"));
    const request = indexedDBImpl.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("credential")) db.createObjectStore("credential");
      if (!db.objectStoreNames.contains("pending")) db.createObjectStore("pending", { keyPath: "key" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("STORAGE_UNAVAILABLE"));
  });
  const tx = async (store, mode, action, isCurrent = () => true) => {
    const db = await open();
    return new Promise((resolve, reject) => {
      if (!isCurrent()) {
        db.close();
        reject(new Error("SESSION_EXPIRED"));
        return;
      }
      const transaction = db.transaction(store, mode);
      let result;
      let settled = false;
      const request = action(transaction.objectStore(store));
      request.onsuccess = () => { result = request.result; };
      request.onerror = () => {
        if (!settled) { settled = true; db.close(); reject(new Error("STORAGE_UNAVAILABLE")); }
      };
      transaction.oncomplete = () => {
        db.close();
        if (!settled) { settled = true; resolve(result); }
      };
      transaction.onerror = transaction.onabort = () => {
        db.close();
        if (!settled) { settled = true; reject(new Error("STORAGE_UNAVAILABLE")); }
      };
    });
  };
  return {
    async getPending(id, token) {
      const key = await pendingKey(id, token);
      return tx("pending", "readonly", s => s.get(key));
    },
    putPending(value, isCurrent = () => true) {
      return tx("pending", "readwrite", s => s.put(value), isCurrent);
    },
    async clearPending(id, token) {
      const key = await pendingKey(id, token);
      return tx("pending", "readwrite", s => s.delete(key));
    },
    getCredential() { return tx("credential", "readonly", s => s.get("own")); },
    async getToken() { const record = await tx("credential", "readonly", s => s.get("own")); return record?.token || null; },
    saveToken(token, battleId, isCurrent = () => true) {
      return tx("credential", "readwrite", s => s.put({ token, battleId }, "own"), isCurrent);
    },
    async forget() {
      const db = await open();
      await new Promise((resolve, reject) => {
        const transaction = db.transaction("credential", "readwrite");
        transaction.objectStore("credential").delete("own");
        transaction.oncomplete = () => { db.close(); resolve(); };
        transaction.onerror = transaction.onabort = () => { db.close(); reject(new Error("STORAGE_UNAVAILABLE")); };
      });
      db.close();
    },
  };
}

export function visibleBattleState(view, selfSelection = null) {
  if (!view || typeof view !== "object") throw new Error("INVALID_SERVER_RESPONSE");
  const state = {
    phase: typeof view.phase === "string" ? view.phase : "unknown",
    selfCommitted: view.selfCommitted === true,
    opponentCommitted: view.opponentCommitted === true,
    ownSelection: view.selfCommitted && selfSelection ? selfSelection : null,
    result: null,
  };
  if (view.revealed === true && ["revealed", "final"].includes(view.phase) && view.selections && view.resolution) {
    state.result = { selections: view.selections, resolution: view.resolution,
      mechanicalOutcome: view.mechanicalOutcome, socialOutcome: view.socialOutcome,
      recognizedOutcome: view.recognizedOutcome };
  }
  return state;
}
