// TEST-ONLY synthetic implementation of the K1 contract (contracts/social-battle-api-v1.md).
// Never deployed, never referenced by the game. Runs only in local tests on 127.0.0.1.
// Uses the real tactical_v1 resolver + lifecycle and the real Chat01 word-signature rule;
// identity, persistence and economy are in-memory fakes. No real auth: actors and sessions are
// seeded through /__test__/ routes that exist only here.
import http from "node:http";
import { webcrypto as crypto, randomUUID, createHash } from "node:crypto";
import { createRequire } from "node:module";
import { canonicalWordSignature } from "../gameplay-server/src/social-vote-contract.mjs";

const require = createRequire(import.meta.url);
require("../AsyncScene/Web/conflict/tactical-resolver.js");
require("../AsyncScene/Web/conflict/tactical-lifecycle.js");
const lifecycle = globalThis.TacticalCombatLifecycleV1.createLifecycle(globalThis.Game.TacticalCombatV1);

const SIGNATURE_SCHEME = "K1-SIG-V1";
const MAX_SKEW_MS = 120000;
const PHRASES = {
  attack: {
    N: ["Ты слишком уверен в себе.", "Говори по делу, без спектакля."],
    P: ["Есть вопрос, который надо закрыть.", "Объясни, зачем ты так поступил."],
    T: ["Это была репетиция или весь номер?", "У тебя аргументы в отпуске?"]
  },
  defense: {
    S: ["Я услышал. Теперь давай по фактам.", "Тише. Слова ещё ничего не доказывают."],
    C: ["Тот же вопрос можно задать тебе.", "Тогда объясни собственный поступок."],
    G: ["Не тебе мне указывать.", "Сначала научись отвечать за слова."]
  }
};

function offersCatalog() {
  const offers = [];
  for (const channel of ["attack", "defense"]) {
    for (const [type, list] of Object.entries(PHRASES[channel])) {
      list.forEach((text, i) => offers.push({ channel, offer_id: `${channel}-${type}-${i + 1}`, phrase_text: text, tactic_type: type }));
    }
  }
  return offers;
}

const b64urlToBytes = (s) => Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");

export async function startMockServer({ pageOrigin, port = 0, deadlineMs = 3600000 } = {}) {
  const actors = new Map();   // actorId -> {actorId, displayName, role, allowedColors}
  const sessions = new Map(); // sessionId -> {actorId, publicKey, nonces:Set}
  const battles = new Map();  // battleId -> {state, texts:{A,B}, offers}
  const creates = new Map();  // actorId:clientOperationId -> battleId
  const log = [];             // request log for privacy assertions

  const send = (res, status, body) => {
    res.writeHead(status, {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": pageOrigin || "null",
      "Vary": "Origin",
      "Cache-Control": "no-store"
    });
    res.end(JSON.stringify(body));
  };

  async function authenticate(req, path, bodyText) {
    const sessionId = req.headers["session-id"];
    const nonce = req.headers["signature-nonce"];
    const ts = Number(req.headers["signature-timestamp"]);
    const sig = req.headers["signature"];
    const session = typeof sessionId === "string" ? sessions.get(sessionId) : null;
    if (!session || !nonce || !sig || !Number.isFinite(ts)) return null;
    if (Math.abs(Date.now() - ts) > MAX_SKEW_MS || session.nonces.has(nonce)) return null;
    const bodySha256 = createHash("sha256").update(bodyText).digest("hex");
    const message = [SIGNATURE_SCHEME, req.method, path, bodySha256, nonce, String(ts), sessionId].join("\n");
    const ok = await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, session.publicKey,
      b64urlToBytes(sig), new TextEncoder().encode(message));
    if (!ok) return null;
    session.nonces.add(nonce);
    return actors.get(session.actorId) || null;
  }

  const sideOf = (state, actorId) =>
    state.participants.A.id === actorId ? "A" : state.participants.B.id === actorId ? "B" : null;

  function projection(record, actor) {
    const { state } = record;
    const side = sideOf(state, actor.actorId);
    const view = lifecycle.getPublicView(state, actor.actorId);
    const other = side === "A" ? "B" : "A";
    const out = {
      ...view,
      selfSide: side,
      participantNames: {
        self: actors.get(state.participants[side].id).displayName,
        opponent: actors.get(state.participants[other].id).displayName
      }
    };
    if (!view.revealed) {
      out.readyTextOffers = { catalogVersion: "mock-1", normalizationVersion: "mock", offers: record.offers };
    } else {
      out.committedTexts = { A: record.texts.A, B: record.texts.B };
    }
    return out;
  }

  function summary(record, actor) {
    const { state } = record;
    const side = sideOf(state, actor.actorId);
    const other = side === "A" ? "B" : "A";
    const awaiting = ["created", "waiting"].includes(state.phase) && !state.commits[side];
    return {
      battleId: state.battleId, phase: state.phase, version: state.version,
      opponentName: actors.get(state.participants[other].id).displayName, awaitingMyAction: awaiting
    };
  }

  function commit(record, actor, body) {
    const { state } = record;
    const side = sideOf(state, actor.actorId);
    const sel = body.selection || {};
    if (!actor.allowedColors.includes(sel.attackColor) || !actor.allowedColors.includes(sel.defenseColor)) {
      return [409, { error: "COLOR_NOT_ALLOWED" }];
    }
    if (sel.role !== actor.role) return [409, { error: "ROLE_MISMATCH" }];
    const texts = {};
    for (const channel of ["attack", "defense"]) {
      const intent = body.textIntent && body.textIntent[channel];
      const offer = intent && record.offers.find((o) => o.channel === channel && o.offer_id === intent.offerId);
      if (!offer) return [409, { error: "UNKNOWN_TEXT_OFFER" }];
      const text = typeof intent.finalText === "string" ? intent.finalText : offer.phrase_text;
      if (!text.trim() || Array.from(text).length > 1000) return [400, { error: "INVALID_TEXT_INTENT" }];
      texts[channel] = { offerId: offer.offer_id, text,
        wordsEdited: canonicalWordSignature(text) !== canonicalWordSignature(offer.phrase_text) };
    }
    const command = { commandId: side + ":" + body.commandId, expectedVersion: state.version, type: "commit",
      actorId: actor.actorId, participantId: actor.actorId,
      selection: { attackColor: sel.attackColor, defenseColor: sel.defenseColor, attackType: sel.attackType,
        defenseType: sel.defenseType, role: sel.role } };
    const result = lifecycle.execute(state, command, Date.now());
    if (!result.ok) return [409, { error: result.error || result.code || "COMMIT_REJECTED" }];
    record.state = result.state;
    if (!result.replayed && result.code === "COMMITTED") record.texts[side] = texts;
    if (record.state.phase === "committed") {
      const edited = ["A", "B"].some((s) => record.texts[s].attack.wordsEdited || record.texts[s].defense.wordsEdited);
      const draw = globalThis.Game.TacticalCombatV1.resolve(record.state.commits.A.selection,
        record.state.commits.B.selection, "tactical_v1").mechanicalOutcome === "DRAW";
      const trigger = draw && edited ? "BOTH" : draw ? "DRAW" : edited ? "AUTHORED_TEXT" : "NONE";
      const revealed = lifecycle.execute(record.state, { commandId: "system:reveal", expectedVersion: record.state.version,
        type: "reveal", actorId: "system", socialVoteTrigger: trigger }, Date.now());
      if (!revealed.ok) return [500, { error: "REVEAL_FAILED" }];
      record.state = revealed.state;
      if (trigger === "NONE") {
        const fin = lifecycle.execute(record.state, { commandId: "system:finalize", expectedVersion: record.state.version,
          type: "finalize", actorId: "system", recognizedOutcome: record.state.mechanicalOutcome }, Date.now());
        if (fin.ok) record.state = fin.state;
      }
    }
    return [200, { code: result.code, replayed: !!result.replayed, view: projection(record, actor) }];
  }

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, "http://127.0.0.1");
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const bodyText = Buffer.concat(chunks).toString("utf8");
    const path = url.pathname + url.search;
    log.push({ method: req.method, path, sessionId: req.headers["session-id"] || null });
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": pageOrigin || "null",
        "Access-Control-Allow-Methods": "GET, POST",
        "Access-Control-Allow-Headers": "Content-Type, Session-Id, Signature, Signature-Nonce, Signature-Timestamp",
        "Access-Control-Max-Age": "60"
      });
      return res.end();
    }
    let body = null;
    if (bodyText) { try { body = JSON.parse(bodyText); } catch (_) { return send(res, 400, { error: "INVALID_JSON" }); } }

    // ---- test-only seeding ----
    if (url.pathname === "/__test__/actors" && req.method === "POST") {
      actors.set(body.actorId, { actorId: body.actorId, displayName: body.displayName,
        role: body.role || "citizen", allowedColors: body.allowedColors || ["y"] });
      return send(res, 200, { ok: true });
    }
    if (url.pathname === "/__test__/sessions" && req.method === "POST") {
      if (!actors.has(body.actorId)) return send(res, 404, { error: "NOT_FOUND" });
      const publicKey = await crypto.subtle.importKey("jwk", body.publicJwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
      const sessionId = randomUUID().replace(/-/g, "");
      sessions.set(sessionId, { actorId: body.actorId, publicKey, nonces: new Set() });
      return send(res, 200, { sessionId });
    }

    const actor = await authenticate(req, path, bodyText);
    if (!actor) return send(res, 401, { error: "UNAUTHORIZED" });

    if (url.pathname === "/v1/me" && req.method === "GET") {
      return send(res, 200, { actorId: actor.actorId, displayName: actor.displayName, role: actor.role,
        allowedColors: actor.allowedColors, progress: { rep: 0, points: 0, wins: 0 } });
    }
    if (url.pathname === "/v1/players" && req.method === "GET") {
      return send(res, 200, { players: [...actors.values()].filter((a) => a.actorId !== actor.actorId)
        .map((a) => ({ actorId: a.actorId, displayName: a.displayName })) });
    }
    if (url.pathname === "/v1/battles" && req.method === "GET") {
      const mine = [...battles.values()].filter((r) => sideOf(r.state, actor.actorId)).map((r) => summary(r, actor)).reverse();
      return send(res, 200, { battles: mine, awaitingMyAction: mine.filter((b) => b.awaitingMyAction).length });
    }
    if (url.pathname === "/v1/battles" && req.method === "POST") {
      const key = actor.actorId + ":" + body.clientOperationId;
      if (creates.has(key)) return send(res, 200, { battleId: creates.get(key), replayed: true });
      const opponent = actors.get(body.opponentActorId);
      if (!opponent || opponent.actorId === actor.actorId) return send(res, 404, { error: "NOT_FOUND" });
      const battleId = randomUUID();
      const created = lifecycle.createBattle({ battleId, deadlineAt: Date.now() + deadlineMs, createdAt: Date.now(),
        participants: { A: { id: actor.actorId, role: actor.role }, B: { id: opponent.actorId, role: opponent.role } } });
      if (!created.ok) return send(res, 500, { error: "CREATE_FAILED" });
      battles.set(battleId, { state: created.state, texts: {}, offers: offersCatalog() });
      creates.set(key, battleId);
      return send(res, 200, { battleId });
    }
    const m = /^\/v1\/battles\/([0-9a-f-]{36})(\/commit)?$/.exec(url.pathname);
    const record = m && battles.get(m[1]);
    // Foreign and missing battles are indistinguishable.
    if (!record || !sideOf(record.state, actor.actorId)) return send(res, 404, { error: "NOT_FOUND" });
    if (!m[2] && req.method === "GET") return send(res, 200, projection(record, actor));
    if (m[2] && req.method === "POST") {
      const [status, payload] = commit(record, actor, body || {});
      return send(res, status, payload);
    }
    return send(res, 405, { error: "METHOD_NOT_ALLOWED" });
  });

  await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  return {
    origin, log, battles,
    async seedActor(actor) {
      actors.set(actor.actorId, { role: "citizen", allowedColors: ["y"], ...actor });
    },
    close: () => new Promise((resolve) => server.close(resolve))
  };
}
