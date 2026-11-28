// Social battles: K1 HTTP client. Every request is signed with the device-bound session.
(function (root) {
  "use strict";

  class SocialApiError extends Error {
    constructor(code, status) {
      super(code);
      this.code = code;
      this.status = status;
    }
  }

  function create({ apiOrigin, sessionId, session = root.Game.SocialSession, fetchImpl = root.fetch.bind(root) }) {
    async function request(method, path, body) {
      const bodyText = body === undefined ? "" : JSON.stringify(body);
      const headers = await session.signRequest({ method, path, bodyText, sessionId });
      if (body !== undefined) headers["Content-Type"] = "application/json";
      let response;
      try {
        response = await fetchImpl(apiOrigin + path, {
          method, headers, body: body === undefined ? undefined : bodyText,
          credentials: "omit", cache: "no-store", mode: "cors"
        });
      } catch (_) {
        throw new SocialApiError("NETWORK_ERROR", 0);
      }
      let payload = null;
      try { payload = await response.json(); } catch (_) { payload = null; }
      if (!response.ok) {
        const code = payload && typeof payload.error === "string" ? payload.error : "HTTP_" + response.status;
        throw new SocialApiError(code, response.status);
      }
      return payload;
    }

    // Retries reuse the same id so the server can replay the original receipt.
    async function withRetry(fn, attempts = 3) {
      let last;
      for (let i = 0; i < attempts; i++) {
        try { return await fn(); } catch (error) {
          last = error;
          if (!(error instanceof SocialApiError) || error.code !== "NETWORK_ERROR") throw error;
        }
      }
      throw last;
    }

    const enc = encodeURIComponent;
    return Object.freeze({
      me: () => request("GET", "/v1/me"),
      players: () => request("GET", "/v1/players?scope=challengeable"),
      listBattles: () => request("GET", "/v1/battles?scope=mine"),
      getBattle: (battleId) => request("GET", "/v1/battles/" + enc(battleId)),
      createBattle: (opponentActorId, clientOperationId) =>
        withRetry(() => request("POST", "/v1/battles", { opponentActorId, clientOperationId })),
      commit: (battleId, commandId, selection, textIntent) =>
        withRetry(() => request("POST", "/v1/battles/" + enc(battleId) + "/commit", { commandId, selection, textIntent }))
    });
  }

  root.Game = root.Game || {};
  root.Game.SocialApi = Object.freeze({ create, SocialApiError });
})(typeof window === "object" ? window : globalThis);
