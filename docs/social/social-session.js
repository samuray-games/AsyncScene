// Social battles: device-bound session (K1 §1).
// The private signing key is created non-extractable and never leaves the browser.
// This prevents key theft but is NOT XSS protection: script running in the page can still
// request signatures while the page is open. Session creation (passkey login) is a separate
// module; this file only holds the device key and the server-issued session id.
(function (root) {
  "use strict";

  const DB_NAME = "asynchronia-social";
  const STORE = "kv";
  const SIGNATURE_SCHEME = "K1-SIG-V1";

  function openDb() {
    return new Promise((resolve, reject) => {
      const req = root.indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || Error("INDEXEDDB_OPEN_FAILED"));
    });
  }

  async function kv(mode, fn) {
    const db = await openDb();
    try {
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const store = tx.objectStore(STORE);
        let out;
        Promise.resolve(fn(store)).then((value) => { out = value; }, reject);
        tx.oncomplete = () => resolve(out);
        tx.onerror = () => reject(tx.error || Error("INDEXEDDB_TX_FAILED"));
        tx.onabort = () => reject(tx.error || Error("INDEXEDDB_TX_ABORTED"));
      });
    } finally {
      db.close();
    }
  }

  const getValue = (key) => kv("readonly", (store) => new Promise((resolve, reject) => {
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }));
  const putValue = (key, value) => kv("readwrite", (store) => { store.put(value, key); });
  const deleteValue = (key) => kv("readwrite", (store) => { store.delete(key); });

  async function ensureDeviceKey() {
    const existing = await getValue("deviceKey");
    if (existing && existing.privateKey && existing.publicJwk) return { publicJwk: existing.publicJwk };
    const pair = await root.crypto.subtle.generateKey(
      { name: "ECDSA", namedCurve: "P-256" }, false, ["sign", "verify"]
    );
    const publicJwk = await root.crypto.subtle.exportKey("jwk", pair.publicKey);
    await putValue("deviceKey", { privateKey: pair.privateKey, publicJwk });
    return { publicJwk };
  }

  // Drafts are per account (K1 §1.3): a session change in this tab drops every draft.
  function dropAllDrafts() {
    try {
      const store = root.sessionStorage;
      for (let i = store.length - 1; i >= 0; i--) {
        const key = store.key(i);
        if (key && key.startsWith("asynchronia.socialBattles.draft.")) store.removeItem(key);
      }
    } catch (_) {}
  }

  async function setSession(sessionId, apiOrigin) {
    if (typeof sessionId !== "string" || !/^[A-Za-z0-9_-]{16,128}$/.test(sessionId)) throw Error("INVALID_SESSION_ID");
    if (typeof apiOrigin !== "string" || !apiOrigin) throw Error("INVALID_API_ORIGIN");
    const prior = await getValue("session");
    if (!prior || prior.sessionId !== sessionId || prior.apiOrigin !== apiOrigin) dropAllDrafts();
    await putValue("session", { sessionId, apiOrigin });
  }

  async function getSession(apiOrigin) {
    const session = await getValue("session");
    if (!session || session.apiOrigin !== apiOrigin) return null;
    return { sessionId: session.sessionId };
  }

  async function clearSession() {
    dropAllDrafts();
    await deleteValue("session");
  }

  function hex(buffer) {
    return Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0")).join("");
  }

  function base64url(buffer) {
    let s = "";
    for (const b of new Uint8Array(buffer)) s += String.fromCharCode(b);
    return root.btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function canonicalString({ method, path, bodySha256, nonce, timestamp, sessionId }) {
    return [SIGNATURE_SCHEME, method, path, bodySha256, nonce, String(timestamp), sessionId].join("\n");
  }

  async function signRequest({ method, path, bodyText, sessionId }) {
    const key = await getValue("deviceKey");
    if (!key || !key.privateKey) throw Error("DEVICE_KEY_MISSING");
    const enc = new TextEncoder();
    const bodySha256 = hex(await root.crypto.subtle.digest("SHA-256", enc.encode(bodyText || "")));
    const nonceBytes = new Uint8Array(16);
    root.crypto.getRandomValues(nonceBytes);
    const nonce = base64url(nonceBytes);
    const timestamp = Date.now();
    const message = canonicalString({ method, path, bodySha256, nonce, timestamp, sessionId });
    const signature = await root.crypto.subtle.sign(
      { name: "ECDSA", hash: "SHA-256" }, key.privateKey, enc.encode(message)
    );
    return {
      "Session-Id": sessionId,
      "Signature-Nonce": nonce,
      "Signature-Timestamp": String(timestamp),
      "Signature": base64url(signature)
    };
  }

  root.Game = root.Game || {};
  root.Game.SocialSession = Object.freeze({
    SIGNATURE_SCHEME, canonicalString, ensureDeviceKey, setSession, getSession, clearSession, signRequest
  });
})(typeof window === "object" ? window : globalThis);
