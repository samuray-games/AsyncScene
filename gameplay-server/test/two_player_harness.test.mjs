import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  battleProgressText, describeResult, participantSide, readableError,
} from "../dev-harness/presentation.mjs";
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

const publicView = (side, outcome = "DRAW", reason = "BOTH_DEFENSES_HELD") => {
  const other = side === "A" ? "B" : "A";
  return {
    revealed: true,
    phase: "revealed",
    participants: {
      self: "synthetic-" + side + "-123e4567-e89b-42d3-a456-426614174000",
      opponent: "synthetic-" + other + "-123e4567-e89b-42d3-a456-426614174001",
    },
    selections: {
      A: { attackColor: "y", defenseColor: "y", attackType: "N", defenseType: "S" },
      B: { attackColor: "y", defenseColor: "y", attackType: "N", defenseType: "S" },
    },
    mechanicalOutcome: outcome,
    resolution: {
      ok: true,
      mechanicalOutcome: outcome,
      pressureA: 2,
      pressureB: 2,
      defenseA: 3,
      defenseB: 3,
      explanation: { code: reason },
    },
  };
};

test("harness screen is Russian and has no raw JSON result or visible synthetic IDs", async () => {
  const html = await readFile(new URL("../dev-harness/index.html", import.meta.url), "utf8");
  const clientSource = await readFile(new URL("../dev-harness/client.mjs", import.meta.url), "utf8");
  assert.match(html, /<html lang="ru">/);
  for (const label of [
    "Тестовый бой", "Игрок А", "Игрок Б", "Номер боя", "Ключ игрока",
    "Подключиться", "Очистить данные этого окна", "Обновить состояние",
    "Жёлтый", "Оранжевый", "Красный", "Отправить ход",
  ]) assert.ok(html.includes(label), "missing Russian UI label: " + label);
  assert.doesNotMatch(html, /lang="en"|Two player battle|Connect|Commit move|result-data|<pre/);
  assert.doesNotMatch(clientSource, /JSON\.stringify|localStorage|sessionStorage|document\.cookie|console\.log/);
  assert.doesNotMatch(clientSource, /participants\.self\s*\+|participants\.opponent\s*\+/);
});

test("player side is derived from the server public view, with mismatches rejected", () => {
  assert.equal(participantSide(publicView("A")), "A");
  assert.equal(participantSide(publicView("B")), "B");
  const mismatch = publicView("A");
  mismatch.participants.opponent = "synthetic-A-123e4567-e89b-42d3-a456-426614174001";
  assert.equal(participantSide(mismatch), null);
  assert.equal(participantSide({ participants: { self: "player-A", opponent: "player-B" } }), null);
});

test("battle progress is clear for waiting, committed, both received, expired and completed states", () => {
  assert.equal(battleProgressText({ phase: "created", selfCommitted: false, opponentCommitted: false }),
    "Ожидаем твой ход.");
  assert.equal(battleProgressText({ phase: "waiting", selfCommitted: true, opponentCommitted: false }),
    "Твой ход принят. Ожидаем ход соперника.");
  assert.equal(battleProgressText({ phase: "waiting", selfCommitted: false, opponentCommitted: true }),
    "Соперник сделал ход. Теперь твой ход.");
  assert.equal(battleProgressText({ phase: "committed", selfCommitted: true, opponentCommitted: true }),
    "Оба хода получены.");
  assert.equal(battleProgressText({ phase: "expired" }), "Время для хода истекло.");
  assert.equal(battleProgressText({ phase: "revealed", revealed: true }), "Бой завершён.");
});

test("server outcome is shown from the token holder A/B perspective with the supplied draw", () => {
  const drawA = describeResult(publicView("A"));
  const drawB = describeResult(publicView("B"));
  assert.equal(drawA.title, "Ничья");
  assert.equal(drawB.title, "Ничья");
  assert.equal(drawA.explanation, "Оба удара отражены. Ни один игрок не пробил защиту противника.");
  assert.deepEqual(drawA.stats, {
    A: { attack: 2, defense: 3 },
    B: { attack: 2, defense: 3 },
  });
  assert.deepEqual(drawA.actions, {
    A: { attack: "Жёлтый; вариант атаки N", defense: "Жёлтый; вариант защиты S" },
    B: { attack: "Жёлтый; вариант атаки N", defense: "Жёлтый; вариант защиты S" },
  });
  assert.equal(describeResult(publicView("A", "A_WIN", "A_ONLY_HIT")).title, "Победа");
  assert.equal(describeResult(publicView("B", "A_WIN", "A_ONLY_HIT")).title, "Поражение");
  assert.equal(describeResult(publicView("B", "B_WIN", "B_ONLY_HIT")).title, "Победа");
  assert.equal(describeResult(publicView("A", "B_WIN", "B_ONLY_HIT")).title, "Поражение");
});

test("unknown or inconsistent server outcome fails closed and unknown error text is not exposed", () => {
  const unknown = publicView("A", "MAYBE");
  assert.equal(describeResult(unknown).title, "Результат недоступен");
  const inconsistent = publicView("A", "A_WIN");
  inconsistent.resolution.mechanicalOutcome = "B_WIN";
  assert.equal(describeResult(inconsistent).title, "Результат недоступен");
  const inconsistentReason = publicView("A", "A_WIN", "BOTH_DEFENSES_HELD");
  assert.equal(describeResult(inconsistentReason).title, "Результат недоступен");
  const secret = "bearer-secret-that-must-not-be-shown";
  const safe = readableError(new Error("unexpected response " + secret));
  assert.ok(!safe.includes(secret));
  assert.equal(safe, "Не удалось выполнить действие. Проверь данные и соединение с локальным сервером.");
});
