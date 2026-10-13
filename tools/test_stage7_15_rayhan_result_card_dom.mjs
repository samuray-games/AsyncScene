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
    const rayhanBattle = {
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
    };
    S.battles = [rayhanBattle];
    S.events = [{
      id: "stage715_rayhan_event_dom_fixture",
      battleId: rayhanBattle.id,
      stage715RayhanEvent: true,
      title: `${S.me.name} против Райхана`,
      state: "open",
      resolved: false,
      aId: S.me.id,
      aName: S.me.name,
      bId: "npc_stage7_ken",
      bName: "Райхан",
      a: { id: S.me.id, name: S.me.name, influence: 1 },
      b: { id: "npc_stage7_ken", name: "Райхан", influence: 1 },
      voteLabels: { a: "за тебя", b: "за Райхана" },
      crowd: { cap: 5, voters: {}, aVotes: 0, bVotes: 0, alreadyVotedCount: 0, decided: false },
    }];
    G.Stage715Demo.claimResume({ state: S, UI: G.UI, playerName: S.me.name });
    G.UI.renderBattles();
    G.UI.renderEvents();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const battleCard = document.querySelector('[data-battle-id="stage7_15_rayhan_result_card_dom_fixture"]');
    const eventCard = document.querySelector('[data-event-id="stage715_rayhan_event_dom_fixture"]');
    return {
      battleCount: document.getElementById("battleCount")?.textContent || null,
      cards: document.querySelectorAll("#battlesBody .battleCard").length,
      card: Boolean(battleCard && battleCard.isConnected && battleCard.getBoundingClientRect().width && battleCard.getBoundingClientRect().height),
      battleText: battleCard?.innerText || "",
      battleVoteButtons: battleCard?.querySelectorAll(".eventVoteBtn, .voteBtn, [data-side]").length || 0,
      eventCard: Boolean(eventCard && eventCard.isConnected),
      eventTitle: eventCard?.querySelector(".title")?.textContent || "",
      voteButtons: eventCard ? Array.from(eventCard.querySelectorAll(".eventVoteBtn"), (button) => ({ disabled: button.disabled, text: button.textContent.trim() })) : [],
      voteResult: G.Events.helpEvent("stage715_rayhan_event_dom_fixture", "a"),
      pointsAfterRejectedVote: S.me.points,
      repAfterRejectedVote: S.rep,
    };
  });
  assert.equal(pending.battleCount, "1", "pending vote keeps the backing battle counted");
  assert.equal(pending.cards, 1, "the original Rayhan battle card remains present during Events voting");
  assert.equal(pending.card, true, "the original battle card is visible during the Event vote");
  assert.match(pending.battleText, /Где будем разбираться\?/);
  assert.match(pending.battleText, /Кажется, прямо тут…/, "the selected counterargument remains visible during voting");
  assert.equal(pending.battleVoteButtons, 0, "Battles must not add a second voting widget");
  assert.equal(pending.eventCard, true, "the Event and original battle card are simultaneously rendered");
  assert.equal(pending.eventTitle, "Тестер против Райхана");
  assert.equal(pending.voteButtons.length, 2, "the scripted Event keeps its vote counters visible");
  assert(pending.voteButtons.every((button) => button.disabled), "manual vote controls are disabled during tutorial voting");
  assert.equal(pending.voteResult, false, "the action API rejects manual tutorial votes");
  assert.equal(pending.pointsAfterRejectedVote, 2, "rejected manual vote does not change player points");
  assert.equal(pending.repAfterRejectedVote, 1, "rejected manual vote does not change REP");

  const resolved = await page.evaluate(async () => {
    const G = window.Game;
    const S = G.UI.S;
    const battle = S.battles[0];
    const event = S.events[0];
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
    event.resolved = true;
    event.state = "resolved";
    event.crowd.aVotes = 3;
    event.crowd.votesA = 3;
    event.crowd.bVotes = 2;
    event.crowd.votesB = 2;
    event.crowd.alreadyVotedCount = 5;
    event.crowd.decided = true;
    event.crowd.winner = "a";
    G.UI.renderBattles();
    G.UI.renderEvents();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const card = document.querySelector('[data-battle-id="stage7_15_rayhan_result_card_dom_fixture"]');
    const resolvedEvent = document.querySelector('[data-event-id="stage715_rayhan_event_dom_fixture"]');
    return {
      battleCount: document.getElementById("battleCount")?.textContent || null,
      cards: document.querySelectorAll("#battlesBody .battleCard").length,
      visible: Boolean(card && card.isConnected && card.getBoundingClientRect().width && card.getBoundingClientRect().height && getComputedStyle(card).display !== "none" && getComputedStyle(card).visibility !== "hidden"),
      text: card?.innerText || "",
      buttons: card ? Array.from(card.querySelectorAll("button"), (button) => button.textContent.trim()) : [],
      eventTitle: resolvedEvent?.querySelector(".title")?.textContent || "",
      eventText: resolvedEvent?.innerText || "",
    };
  });
  assert.equal(resolved.battleCount, "1", "resolved battle count must match its visible result card");
  assert.equal(resolved.cards, 1, "resolved Rayhan Event must restore exactly one Battles card");
  assert.equal(resolved.visible, true, "resolved Rayhan result card must be visible in the rendered panel");
  assert.equal(resolved.eventTitle, "Тестер против Райхана", "the resolved Event keeps the player-first title");
  assert.match(resolved.eventText, /Итог: 3:2/, "resolved Event keeps the player-win tally");
  assert.doesNotMatch(resolved.eventText, /Ты ещё не проголосовал\./, "resolved scripted Event omits the irrelevant not-voted warning");
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
