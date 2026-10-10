import assert from "node:assert/strict";
import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";
import http from "node:http";

const root = process.cwd();
const webRoot = path.resolve(process.env.ASYNC_SCENE_WEB_ROOT || path.join(root, "AsyncScene/Web"));
const server = http.createServer((request, response) => {
  let pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  if (pathname === "/AsyncScene/") pathname = "/AsyncScene/index.html";
  if (!pathname.startsWith("/AsyncScene/")) { response.writeHead(404).end(); return; }
  const file = path.resolve(webRoot, `.${pathname.slice("/AsyncScene".length)}`);
  if (!file.startsWith(`${webRoot}${path.sep}`) && file !== path.join(webRoot, "index.html")) { response.writeHead(403).end(); return; }
  fs.readFile(file, (error, data) => {
    if (error) { response.writeHead(404).end(String(error)); return; }
    const ext = path.extname(file);
    response.writeHead(200, { "content-type": ext === ".js" ? "text/javascript" : ext === ".css" ? "text/css" : "text/html" });
    response.end(data);
  });
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  const address = server.address();
  await page.goto(`http://127.0.0.1:${address.port}/AsyncScene/index.html?stage7test=1&stage7testrun=rayhan-result-card`);
  await page.waitForFunction(() => window.Game?.UI?.renderBattles && window.Game?.Stage715Demo && window.Game?.__S, null, { timeout: 15000 });

  const pending = await page.evaluate(async () => {
    const G = window.Game;
    const S = G.UI.S;
    G.__S = S;
    if (G.Stage715Demo?.destroy) G.Stage715Demo.destroy();
    S.players = S.players || {};
    S.players.npc_stage7_ken = S.players.npc_stage7_ken || { id: "npc_stage7_ken", name: "Райхан", role: "crowd", npc: true, points: 8, influence: 1 };
    S.me = Object.assign({}, S.me || {}, { id: "me", name: "Тестер", points: 2, rep: 1, wins: 1 });
    S.players.me = S.me;
    S.flags = Object.assign({}, S.flags, { stage715Demo: true, stage715DemoPhase: "rayhan_event_vote", stage715EventsPanelRevealed: true });
    S.battles = [{
      id: "stage7_15_rayhan_result_card_dom_fixture",
      opponentId: "npc_stage7_ken",
      attackerId: "npc_stage7_ken",
      defenderId: S.me.id || "me",
      status: "stage715_rayhan_event_vote",
      result: null,
      outcome: null,
      resolved: false,
      finished: false,
      draw: true,
      crowd: null,
      attackHidden: false,
      attack: { id: "stage7_15_rayhan_red_call", text: "Где будем разбираться?", displayText: "Где будем разбираться?", color: "r", type: "where" },
      defense: { id: "canon_where", text: "Кажется, прямо тут…", displayText: "Кажется, прямо тут…", stage715DisplayText: "Кажется, прямо тут…", color: "y", type: "where" },
      meta: {
        stage715DemoBattle: true,
        stage715RayhanScripted: true,
        stage715BattleId: "stage7_15_first_battle",
        stage715RayhanEventVotePending: true,
        stage715RayhanEventResolved: false,
        stage715SelectedDefenseText: "Кажется, прямо тут…",
        stage715RayhanRewardApplied: true,
      },
    }];
    G.UI.renderBattles();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    return {
      battleCount: document.getElementById("battleCount")?.textContent || null,
      cards: document.querySelectorAll("#battlesBody .battleCard").length,
      card: !!document.querySelector('[data-battle-id="stage7_15_rayhan_result_card_dom_fixture"]'),
    };
  });
  assert.equal(pending.battleCount, "1", "pending vote keeps the backing battle counted");
  assert.equal(pending.cards, 0, "pending Rayhan Event vote must not duplicate itself as a Battles card");

  const resolved = await page.evaluate(async () => {
    const G = window.Game;
    const S = G.UI.S;
    const battle = S.battles[0];
    battle.meta.stage715RayhanEventVotePending = false;
    battle.meta.stage715RayhanEventResolved = true;
    battle.status = "finished";
    battle.result = "win";
    battle.outcome = "win";
    battle.resolved = true;
    battle.finished = true;
    battle.draw = false;
    battle.crowd = null;
    S.flags.stage715DemoPhase = "rayhan_win_waiting_reply";
    G.UI.renderBattles();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const card = document.querySelector('[data-battle-id="stage7_15_rayhan_result_card_dom_fixture"]');
    return {
      battleCount: document.getElementById("battleCount")?.textContent || null,
      cards: document.querySelectorAll("#battlesBody .battleCard").length,
      visible: Boolean(card && card.isConnected && card.getBoundingClientRect().width && card.getBoundingClientRect().height && getComputedStyle(card).display !== "none" && getComputedStyle(card).visibility !== "hidden"),
      text: card?.innerText || "",
      buttons: card ? Array.from(card.querySelectorAll("button"), (button) => button.textContent.trim()) : [],
    };
  });
  assert.equal(resolved.battleCount, "1", "resolved battle count must match its visible result card");
  assert.equal(resolved.cards, 1, "resolved Rayhan Event must restore exactly one Battles card");
  assert.equal(resolved.visible, true, "resolved Rayhan result card must be visible in the rendered panel");
  assert.match(resolved.text, /Победа/);
  assert.match(resolved.text, /Кажется, прямо тут…/, "selected answer must remain on the result card");
  assert.deepEqual(resolved.buttons, ["Закрыть"], "resolved Rayhan card may expose only its close action");

  await page.evaluate(() => {
    const G = window.Game;
    const S = G.UI.S;
    G.Stage715Demo.claimResume({ state: S, UI: G.UI, playerName: S.me?.name || "Тестер" });
    G.UI.renderBattles();
  });
  await page.reload();
  await page.waitForFunction(() => window.Game?.UI?.renderBattles && window.Game?.__S?.battles?.some((battle) => battle.id === "stage7_15_rayhan_result_card_dom_fixture"), null, { polling: "raf", timeout: 15000 });
  const afterReload = await page.evaluate(() => {
    const G = window.Game;
    const S = G.__S || G.UI.S;
    const battle = S.battles.find((item) => item.id === "stage7_15_rayhan_result_card_dom_fixture");
    const card = document.querySelector('[data-battle-id="stage7_15_rayhan_result_card_dom_fixture"]');
    return {
      battleCount: document.getElementById("battleCount")?.textContent || null,
      cards: document.querySelectorAll("#battlesBody .battleCard").length,
      visible: Boolean(card && card.isConnected && card.getBoundingClientRect().width && card.getBoundingClientRect().height && getComputedStyle(card).display !== "none" && getComputedStyle(card).visibility !== "hidden"),
      text: card?.innerText || "",
      buttons: card ? Array.from(card.querySelectorAll("button"), (button) => button.textContent.trim()) : [],
      result: battle?.result,
      selected: battle?.meta?.stage715SelectedDefenseText,
      player: S.players?.me || S.me,
      rayhanPoints: S.players?.npc_stage7_ken?.points,
      rewardApplied: battle?.meta?.stage715RayhanRewardApplied,
    };
  });
  assert.equal(afterReload.battleCount, "1");
  assert.equal(afterReload.cards, 1, "reload must preserve the visible resolved battle card");
  assert.equal(afterReload.visible, true, "reload must preserve the visible result card in the rendered panel");
  assert.match(afterReload.text, /Победа/);
  assert.match(afterReload.text, /Кажется, прямо тут…/);
  assert.deepEqual(afterReload.buttons, ["Закрыть"]);
  assert.equal(afterReload.result, "win");
  assert.equal(afterReload.selected, "Кажется, прямо тут…");
  assert.equal(afterReload.rewardApplied, true);
  assert.equal(afterReload.player?.points, 2, "reload must not duplicate the player reward");
  assert.equal(afterReload.player?.rep, 1, "reload must not duplicate the REP reward");
  assert.equal(afterReload.player?.wins, 1, "reload must not duplicate the win");
  assert.equal(afterReload.rayhanPoints, 8, "reload must not debit Rayhan twice");
  assert.deepEqual(errors, [], "page must have no uncaught errors");
  console.log("PASS: pending vote is Events-only; resolved Rayhan victory card remains visible after reload without duplicate reward");
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
