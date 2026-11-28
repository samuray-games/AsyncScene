// C1 end-to-end UI test: two players fight one tactical_v1 battle inside the game UI
// against the TEST-ONLY K1 mock (tools/mock_social_battle_server.mjs).
// Every request to a non-loopback host is aborted at the network layer before it leaves
// the browser (production telemetry included); attempts are counted and reported.
// Run: node --test tools/test_social_battles_ui.mjs
import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { startMockServer } from "./mock_social_battle_server.mjs";
import { validate } from "./social_wire_schema.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WEB = path.join(ROOT, "AsyncScene", "Web");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".webp": "image/webp" };

async function startStatic() {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, "http://127.0.0.1");
    if (!url.pathname.startsWith("/AsyncScene/")) { res.writeHead(404); return res.end(); }
    const file = path.join(WEB, decodeURIComponent(url.pathname.slice("/AsyncScene/".length)) || "index.html");
    if (!file.startsWith(WEB)) { res.writeHead(403); return res.end(); }
    try {
      const data = await fs.readFile(file);
      res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
      res.end(data);
    } catch (_) { res.writeHead(404); res.end(); }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return { origin: `http://127.0.0.1:${server.address().port}`, close: () => new Promise((r) => server.close(r)) };
}

const blocked = [];
const wire = []; // every K1 response seen by any browser, checked against the wire schema
async function newPlayer(browser, { pageOrigin, apiOrigin, flag = true, viewport = { width: 1280, height: 900 } }) {
  const context = await browser.newContext({ viewport });
  await context.route("**/*", (route) => {
    const host = new URL(route.request().url()).hostname;
    if (host === "127.0.0.1") return route.continue();
    blocked.push(route.request().url());
    return route.abort("blockedbyclient");
  });
  if (flag) {
    await context.addInitScript((api) => {
      localStorage.setItem("asynchronia.socialBattles.v1", JSON.stringify({ enabled: true, apiOrigin: api }));
    }, apiOrigin);
  }
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  const responses = [];
  page.on("response", async (r) => {
    if (r.url().startsWith(apiOrigin) && r.request().method() !== "OPTIONS") {
      try { const body = await r.text(); responses.push(body); wire.push({ url: r.url(), method: r.request().method(), status: r.status(), body }); } catch (_) {}
    }
  });
  await page.goto(pageOrigin + "/AsyncScene/index.html");
  if (flag) await enterGame(page);
  return { context, page, errors, responses };
}


// Normal game entry (nickname → «Начать»), the same way a player passes the start screen.
async function enterGame(page) {
  const start = page.locator("#startScreen.active");
  try { await start.waitFor({ timeout: 3000 }); } catch (_) { return; }
  const nick = page.getByPlaceholder("Как тебя называть?");
  if (await nick.count()) await nick.fill("Тестер");
  await page.click("#btnStart");
  await page.locator("#startScreen.active").waitFor({ state: "detached", timeout: 10000 })
    .catch(() => page.locator("#startScreen").waitFor({ state: "hidden", timeout: 10000 }));
}

async function reloadGame(page) {
  await page.reload();
  await enterGame(page);
}

async function login(player, mock, actorId) {
  const { publicJwk } = await player.page.evaluate(() => window.Game.SocialSession.ensureDeviceKey());
  const res = await fetch(mock.origin + "/__test__/sessions", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actorId, publicJwk })
  });
  const { sessionId } = await res.json();
  await player.page.evaluate(([sid, api]) => window.Game.SocialSession.setSession(sid, api), [sessionId, mock.origin]);
  await reloadGame(player.page);
  await player.page.locator("#socialBattlesBlock .sb-challenge").waitFor({ state: "attached" });
}

const card = (page) => page.locator("#socialBattlesBlock .sb-card").first();

// Session change on a mounted page, WITHOUT reload (the UI must react on its own).
async function switchSession(player, mock, actorId) {
  const { publicJwk } = await player.page.evaluate(() => window.Game.SocialSession.ensureDeviceKey());
  const res = await fetch(mock.origin + "/__test__/sessions", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actorId, publicJwk })
  });
  const { sessionId } = await res.json();
  await player.page.evaluate(([sid, api]) => window.Game.SocialSession.setSession(sid, api), [sessionId, mock.origin]);
  return sessionId;
}
const draftKeys = (page) => page.evaluate(() => Object.keys(sessionStorage).filter((k) => k.startsWith("asynchronia.socialBattles.draft.")));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test("social battles: flag off, two-player battle, privacy, drafts, reveal", async (t) => {
  const site = await startStatic();
  const mock = await startMockServer({ pageOrigin: site.origin });
  await mock.seedActor({ actorId: "actor-a", displayName: "Аня", allowedColors: ["y", "o"] });
  await mock.seedActor({ actorId: "actor-b", displayName: "Боря", allowedColors: ["y"] });
  await mock.seedActor({ actorId: "actor-c", displayName: "Вика", allowedColors: ["y"] });
  const browser = await chromium.launch();
  t.after(async () => { await browser.close(); await mock.close(); await site.close(); });

  await t.test("flag off renders nothing and calls no social API", async () => {
    const before = mock.log.length;
    const p = await newPlayer(browser, { pageOrigin: site.origin, apiOrigin: mock.origin, flag: false });
    await p.page.waitForTimeout(500);
    assert.equal(await p.page.locator("#socialBattlesBlock").count(), 0);
    assert.equal(mock.log.length, before);
    await p.context.close();
  });

  const A = await newPlayer(browser, { pageOrigin: site.origin, apiOrigin: mock.origin });
  const B = await newPlayer(browser, { pageOrigin: site.origin, apiOrigin: mock.origin });

  await t.test("without a session the panel asks for invite login", async () => {
    await A.page.locator("#socialBattlesBlock .sb-empty").waitFor();
    assert.match(await A.page.locator("#socialBattlesBlock").innerText(), /входа по приглашению/);
  });

  await login(A, mock, "actor-a");
  await login(B, mock, "actor-b");

  const SECRET = "Ты сегодня явно не в форме, Боря";
  await t.test("A challenges B, edits a plate inline and commits", async () => {
    await A.page.selectOption("#socialBattlesBlock .sb-opponent", "actor-b");
    await A.page.click("#socialBattlesBlock .sb-challenge-btn");
    await card(A.page).locator(".sb-commit").waitFor();
    // only allowed colors are offered
    const colors = await card(A.page).locator(".sb-color-select").first().locator("option").allTextContents();
    assert.deepEqual(colors, ["Жёлтый", "Оранжевый"]);
    await card(A.page).locator(".sb-type-select").first().selectOption("N");
    await card(A.page).locator(".sb-color-select").first().selectOption("o");
    // inline edit: Escape cancels
    const plate = card(A.page).locator(".sb-plate.sb-own").first();
    const before = await plate.innerText();
    await plate.click();
    await A.page.keyboard.type(" лишнее");
    await A.page.keyboard.press("Escape");
    assert.equal(await plate.innerText(), before);
    // inline edit: ✕ is shown while editing; outside click saves
    await plate.click();
    assert.equal(await card(A.page).locator(".sb-cancel-edit").count(), 1);
    await A.page.keyboard.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
    await A.page.keyboard.type(SECRET);
    await A.page.mouse.click(5, 5);
    assert.equal(await plate.innerText(), SECRET);
    // draft survives reload
    await reloadGame(A.page);
    await card(A.page).locator(".sb-commit").waitFor();
    assert.equal(await card(A.page).locator(".sb-plate.sb-own").first().innerText(), SECRET);
    await card(A.page).locator(".sb-commit").click();
    await card(A.page).locator(".sb-status").waitFor();
    assert.match(await card(A.page).innerText(), /Ждём ход соперника/);
  });

  await t.test("B sees the battle but none of A's hidden choices", async () => {
    await reloadGame(B.page);
    await card(B.page).locator(".sb-commit").waitFor();
    const text = await B.page.locator("#socialBattlesBlock").innerText();
    assert.ok(!text.includes(SECRET), "A's text must not be rendered before reveal");
    assert.equal(await card(B.page).locator(".sb-c-hidden").count(), 2);
    assert.ok(B.responses.every((body) => !body.includes(SECRET)), "A's text must not reach B before reveal");
    assert.ok(B.responses.every((body) => !body.includes('"attackColor":"o"')), "A's color must not reach B before reveal");
  });

  await t.test("drafts are scoped to the account: switching actor in one tab drops them", async () => {
    const D = await newPlayer(browser, { pageOrigin: site.origin, apiOrigin: mock.origin });
    await login(D, mock, "actor-b");
    await card(D.page).locator(".sb-commit").waitFor();
    const plate = card(D.page).locator(".sb-plate.sb-own").first();
    await plate.click();
    await D.page.keyboard.type(" черновик Бори");
    await D.page.mouse.click(5, 5);
    const keys = () => D.page.evaluate(() => Object.keys(sessionStorage).filter((k) => k.startsWith("asynchronia.socialBattles.draft.")));
    const before = await keys();
    assert.equal(before.length, 1);
    assert.ok(before[0].includes(encodeURIComponent("actor-b") + "|B|"), "key carries API origin, actor, side and battle");
    await login(D, mock, "actor-c"); // another account in the same tab
    assert.deepEqual(await keys(), [], "previous account's drafts are gone");
    assert.ok(!(await D.page.locator("#socialBattlesBlock").innerText()).includes("черновик Бори"));
    await D.context.close();
  });

  await t.test("no reload: account switch and logout fully replace the previous player's UI and controller", async () => {
    const D = await newPlayer(browser, { pageOrigin: site.origin, apiOrigin: mock.origin });
    await login(D, mock, "actor-b"); // setup only; everything below happens without reload
    await card(D.page).locator(".sb-commit").waitFor();
    const plate = card(D.page).locator(".sb-plate.sb-own").first();
    await plate.click();
    await D.page.keyboard.type(" МАРКЕР-БОРИ");
    await D.page.mouse.click(5, 5);
    assert.match(await D.page.locator("#socialBattlesBlock").innerText(), /МАРКЕР-БОРИ/);
    const oldSession = (await D.page.evaluate((api) => window.Game.SocialSession.getSession(api), mock.origin)).sessionId;

    // 1) switch to another account while B's draft is on screen
    const switchedAt = mock.log.length;
    const cSession = await switchSession(D, mock, "actor-c");
    await D.page.waitForFunction(() => window.Game.SocialBattles.controller &&
      window.Game.SocialBattles.controller.state.me && window.Game.SocialBattles.controller.state.me.actorId === "actor-c");
    await D.page.locator("#socialBattlesBlock .sb-challenge").waitFor();
    const text = await D.page.locator("#socialBattlesBlock").innerText();
    assert.ok(!text.includes("МАРКЕР-БОРИ"), "previous account's draft is gone from the DOM");
    assert.ok(!text.includes("Бой: Аня"), "previous account's battle card is gone");
    assert.equal(await D.page.locator("#socialBattlesBlock .sb-card").count(), 0);
    assert.deepEqual(await draftKeys(D.page), []);
    await sleep(3500); // longer than the expanded-battle poll
    assert.equal(mock.log.slice(switchedAt).filter((e) => e.sessionId === oldSession).length, 0, "old controller stopped polling");

    // 2) a late reply of the previous session must not repaint the old account
    const bSession = await switchSession(D, mock, "actor-b");
    await card(D.page).locator(".sb-commit").waitFor();
    await D.page.route(mock.origin + "/**", async (route) => {
      if (route.request().headers()["session-id"] === bSession) await sleep(1500);
      return route.fallback();
    });
    const refreshing = D.page.evaluate(() => { window.Game.SocialBattles.controller.refresh(); });
    await refreshing;
    await switchSession(D, mock, "actor-c");
    await sleep(2500); // the delayed reply for actor-b arrives after the switch
    assert.equal(await D.page.evaluate(() => window.Game.SocialBattles.controller.state.me.actorId), "actor-c");
    assert.equal(await D.page.locator("#socialBattlesBlock .sb-card").count(), 0, "late reply ignored");
    await D.page.unroute(mock.origin + "/**");

    // 3) logout without reload
    const loggedOutAt = mock.log.length;
    const currentC = (await D.page.evaluate((api) => window.Game.SocialSession.getSession(api), mock.origin)).sessionId;
    await D.page.evaluate(() => window.Game.SocialSession.clearSession());
    await D.page.locator("#socialBattlesBlock .sb-empty", { hasText: "входа по приглашению" }).waitFor();
    assert.equal(await D.page.evaluate(() => window.Game.SocialBattles.controller), null);
    assert.equal(await D.page.locator("#socialBattlesBlock .sb-challenge").count(), 0);
    assert.deepEqual(await draftKeys(D.page), []);
    await sleep(3500);
    const mine = new Set([oldSession, cSession, bSession, currentC]); // every session this tab ever had
    assert.equal(mock.log.slice(loggedOutAt).filter((e) => mine.has(e.sessionId)).length, 0, "no signed requests after logout");
    await D.context.close();
  });

  await t.test("B commits; both see one-step reveal with result and crowd status", async () => {
    await card(B.page).locator(".sb-commit").click();
    await card(B.page).locator(".sb-result").waitFor();
    await reloadGame(A.page);
    await card(A.page).locator(".sb-result").waitFor();
    for (const P of [A, B]) {
      const body = await card(P.page).innerText();
      assert.ok(body.includes(SECRET), "revealed text visible to both");
      assert.equal(await card(P.page).locator(".sb-plate").count(), 4);
      assert.equal(await card(P.page).locator(".sb-c-hidden").count(), 0);
      assert.match(body, /Победа|Поражение|Ничья/);
      assert.match(body, /Толпа решает/); // authored text triggers the crowd stage (Chat01 §4)
    }
    const outcomeA = await card(A.page).locator(".sb-outcome").innerText();
    const outcomeB = await card(B.page).locator(".sb-outcome").innerText();
    const mirror = { "Победа": "Поражение", "Поражение": "Победа", "Ничья": "Ничья" };
    assert.equal(outcomeB, mirror[outcomeA]);
  });

  await t.test("mobile: panel lives in the battles tab without horizontal overflow", async () => {
    const M = await newPlayer(browser, { pageOrigin: site.origin, apiOrigin: mock.origin, viewport: { width: 393, height: 852 } });
    await login(M, mock, "actor-a");
    assert.equal(await M.page.locator("#socialBattlesBlock").isVisible(), false, "hidden outside the battles tab");
    await M.page.click("#mobileTabBattles");
    await M.page.locator("#socialBattlesBlock .sb-card").first().waitFor();
    assert.equal(await M.page.locator("#socialBattlesBlock").isVisible(), true);
    const overflow = await M.page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    assert.equal(overflow, false);
    await M.context.close();
  });

  await t.test("a second challenge while a battle is ACTIVE is refused by the server", async () => {
    await reloadGame(A.page);
    await A.page.selectOption("#socialBattlesBlock .sb-opponent", "actor-c");
    await A.page.click("#socialBattlesBlock .sb-challenge-btn");
    await A.page.locator("#socialBattlesBlock .sb-error").waitFor();
    assert.match(await A.page.locator("#socialBattlesBlock .sb-error").innerText(), /уже идёт бой/);
  });

  await t.test("every K1 response matches the wire schema", () => {
    const def = ({ url, method, status }) => {
      const u = new URL(url);
      if (status !== 200) return "error";
      if (u.pathname === "/v1/me") return "meResponse";
      if (u.pathname === "/v1/players") return "playersResponse";
      if (u.pathname === "/v1/battles") return method === "POST" ? "createBattleResponse" : "battleListResponse";
      if (u.pathname.endsWith("/commit")) return "commitResponse";
      return "participantProjection";
    };
    assert.ok(wire.length > 10);
    for (const r of wire) assert.deepEqual(validate(def(r), JSON.parse(r.body)), [], r.method + " " + r.url);
  });

  await t.test("no page errors", () => {
    assert.deepEqual([...A.errors, ...B.errors].filter((e) => !/telemetry/i.test(e)), []);
  });
  console.log(`blocked non-loopback requests: ${blocked.length} to ${[...new Set(blocked.map((u) => new URL(u).hostname))].join(", ")}`);
  await A.context.close();
  await B.context.close();
});
