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
    if (r.url().startsWith(apiOrigin)) { try { responses.push(await r.text()); } catch (_) {} }
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

test("social battles: flag off, two-player battle, privacy, drafts, reveal", async (t) => {
  const site = await startStatic();
  const mock = await startMockServer({ pageOrigin: site.origin });
  await mock.seedActor({ actorId: "actor-a", displayName: "Аня", allowedColors: ["y", "o"] });
  await mock.seedActor({ actorId: "actor-b", displayName: "Боря", allowedColors: ["y"] });
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

  await t.test("no page errors", () => {
    assert.deepEqual([...A.errors, ...B.errors].filter((e) => !/telemetry/i.test(e)), []);
  });
  console.log(`blocked non-loopback requests: ${blocked.length}`);
  await A.context.close();
  await B.context.close();
});
