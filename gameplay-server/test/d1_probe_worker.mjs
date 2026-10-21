// Test-only Wrangler D1 probe. Never deploy or expose this unauthenticated
// inspection endpoint in production. This is NOT a gameplay HTTP API.
const TRANSITION = `INSERT INTO gameplay_apply_transition (
  battle_id, expected_version, command_id, fingerprint, receipt_code,
  receipt_event_ids_json, next_state_json, events_json, trusted_now_ms
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export default {
  async fetch(request, env) {
    const pathname = new URL(request.url).pathname;
    if (request.method === "GET" && pathname === "/health") {
      return json({ ok: true });
    }
    if (request.method !== "POST") return json({ ok: false }, 405);
    try {
      const body = await request.json();
      if (pathname === "/create") {
        const state = body.state;
        await env.DB.prepare(
          `INSERT INTO gameplay_create_battle (
             battle_id, initial_state_json, creation_event_json, trusted_now_ms)
           VALUES (?, ?, ?, ?)`,
        ).bind(
          state.battleId, JSON.stringify(state),
          JSON.stringify(state.events?.[0]), state.createdAt,
        ).run();
        return json({ ok: true });
      }
      if (pathname === "/diagnose") {
        const row = await env.DB.prepare(
          `SELECT typeof(?1) AS versionType, typeof(?2) AS clockType,
                  typeof(?3) AS commandType, typeof(?4) AS fingerprintType,
                  json_valid(?5) AS stateValid, json_valid(?6) AS receiptsValid,
                  json_valid(?7) AS eventsValid`,
        ).bind(
          body.expectedVersion, body.trustedNowMs, body.commandId, body.fingerprint,
          JSON.stringify(body.nextState), JSON.stringify(body.receiptEventIds),
          JSON.stringify(body.events),
        ).first();
        return json({ ok: true, row });
      }
      if (pathname === "/apply") {
        await env.DB.prepare(TRANSITION).bind(
          body.battleId, body.expectedVersion, body.commandId,
          body.fingerprint, "COMMITTED", JSON.stringify(body.receiptEventIds),
          JSON.stringify(body.nextState), JSON.stringify(body.events),
          body.trustedNowMs,
        ).run();
        return json({ ok: true });
      }
      if (pathname === "/inspect") {
        const row = await env.DB.prepare(
          `SELECT b.version, b.phase, b.state_json AS stateJson,
             (SELECT COUNT(*) FROM gameplay_command_receipts r WHERE r.battle_id=b.battle_id) AS receiptCount,
             (SELECT COUNT(*) FROM gameplay_event_outbox e WHERE e.battle_id=b.battle_id) AS outboxCount
            FROM gameplay_battles b WHERE b.battle_id=?`,
        ).bind(body.battleId).first();
        return row ? json({ ok: true, row }) : json({ ok: false }, 404);
      }
      return json({ ok: false }, 404);
    } catch (error) {
      // This endpoint is for LOCAL TESTING ONLY; error detail must not be
      // exposed by any future production application.
      return json({ ok: false, error: String(error?.message || error) }, 409);
    }
  },
};
