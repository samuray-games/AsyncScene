const LOCAL_API_BASE = "http://127.0.0.1:8787";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TOKEN = /^[A-Za-z0-9_-]{43}$/;
const COMMAND_ID = /^[A-Za-z0-9:_-]{4,100}$/;

export function assertLoopbackApiBase(value = LOCAL_API_BASE) {
  let url;
  try { url = new URL(value); } catch { throw new Error("API address must be a local loopback URL"); }
  if (url.protocol !== "http:" || !["127.0.0.1", "localhost"].includes(url.hostname) ||
      url.username || url.password || url.search || url.hash || url.pathname !== "/") {
    throw new Error("This harness only connects to a local Worker on this computer");
  }
  return url.origin;
}

export function createBattleClient({ baseUrl = LOCAL_API_BASE, fetchImpl = globalThis.fetch,
  idFactory = () => globalThis.crypto.randomUUID() } = {}) {
  const base = assertLoopbackApiBase(baseUrl);
  if (typeof fetchImpl !== "function") throw new Error("Fetch is unavailable");
  let pendingCommand = null;
  async function request(battleId, token, method, body) {
    if (!UUID.test(battleId)) throw new Error("Enter a valid battle ID");
    if (!TOKEN.test(token)) throw new Error("Enter the 43-character player token");
    const headers = { authorization: "Bearer " + token, accept: "application/json" };
    const options = { method, headers, credentials: "omit", cache: "no-store",
      redirect: "error", referrerPolicy: "no-referrer" };
    if (body !== undefined) {
      headers["content-type"] = "application/json";
      options.body = JSON.stringify(body);
    }
    const response = await fetchImpl(base + "/v1/battles/" + battleId +
      (method === "POST" ? "/commit" : ""), options);
    let data;
    try { data = await response.json(); } catch { throw new Error("Worker returned invalid JSON"); }
    if (!response.ok) throw new Error(data?.error || "Worker request failed");
    return data;
  }
  return Object.freeze({
    getView(battleId, token) { return request(battleId, token, "GET"); },
    commit(battleId, token, selection) {
      if (!pendingCommand) {
        const commandId = "harness-" + idFactory();
        if (!COMMAND_ID.test(commandId)) throw new Error("Generated command ID is invalid");
        pendingCommand = { battleId, token, commandId, selection: { ...selection } };
      } else if (pendingCommand.battleId !== battleId || pendingCommand.token !== token) {
        throw new Error("Previous local command outcome is uncertain; reconnect before starting another battle");
      }
      // An ambiguous response must retry the same immutable intent and commandId.
      return request(battleId, token, "POST", {
        commandId: pendingCommand.commandId,
        selection: pendingCommand.selection,
      });
    },
  });
}

export const localApiBase = LOCAL_API_BASE;
