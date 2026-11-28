// Social battles (K1 contract, contracts/social-battle-api-v1.md): feature flag and API origin.
// Default OFF. When disabled the social modules render nothing and make no network requests.
(function (root) {
  "use strict";

  const STORAGE_KEY = "asynchronia.socialBattles.v1";
  // Approved non-loopback API origins. Empty until the owner approves a staging origin.
  const APPROVED_API_ORIGINS = Object.freeze([]);
  const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "[::1]"]);

  function parseOrigin(value) {
    if (typeof value !== "string" || !value) return null;
    try {
      const url = new URL(value);
      if (url.protocol !== "http:" && url.protocol !== "https:") return null;
      if (url.origin !== value.replace(/\/+$/, "")) return null;
      return url;
    } catch (_) {
      return null;
    }
  }

  function isLoopback(url) {
    return !!url && LOOPBACK_HOSTS.has(url.hostname);
  }

  function pageIsLoopback() {
    try { return LOOPBACK_HOSTS.has(root.location.hostname); } catch (_) { return false; }
  }

  function read() {
    let raw = null;
    try { raw = JSON.parse(root.localStorage.getItem(STORAGE_KEY) || "null"); } catch (_) { raw = null; }
    if (!raw || raw.enabled !== true) return { enabled: false, reason: "FLAG_OFF" };
    const api = parseOrigin(raw.apiOrigin);
    if (!api) return { enabled: false, reason: "API_ORIGIN_INVALID" };
    const approved = APPROVED_API_ORIGINS.includes(api.origin);
    // A loopback API is allowed only from a loopback page (local development and tests).
    const loopbackPair = isLoopback(api) && pageIsLoopback();
    if (!approved && !loopbackPair) return { enabled: false, reason: "API_ORIGIN_NOT_APPROVED" };
    return { enabled: true, apiOrigin: api.origin };
  }

  root.Game = root.Game || {};
  root.Game.SocialConfig = Object.freeze({ STORAGE_KEY, read });
})(typeof window === "object" ? window : globalThis);
