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
  const consoleErrors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  const address = server.address();
  await page.goto(`http://127.0.0.1:${address.port}/AsyncScene/index.html?stage7test=1&stage7testrun=oleg-dom-colors`);
  try {
    await page.waitForFunction(() => window.Game?.UI?.renderBattles && window.Game?.__S, null, { timeout: 10000 });
  } catch (error) {
    throw new Error(`application renderer did not load: ${String(error)}; pageErrors=${JSON.stringify(errors)}; consoleErrors=${JSON.stringify(consoleErrors)}; body=${(await page.locator("body").innerText()).slice(0, 500)}`);
  }

  const rendered = await page.evaluate(async () => {
    const G = window.Game;
    const S = G.UI.S;
    G.__S = S;
    const choices = [
      { id: "canon_where", group: "where", type: "where", color: "y", stage715DisplayText: "Возможно, там, где Подворотня…" },
      { id: "canon_who", group: "who", type: "who", color: "y", stage715DisplayText: "Думаю, Райхан…" },
      { id: "canon_yn", group: "yn", type: "yn", color: "y", stage715DisplayText: "Кажется, нет…" },
    ];
    S.flags = Object.assign({}, S.flags, { stage715Demo: true, stage715DemoPhase: "oleg_battle" });
    S.battles = (S.battles || []).filter((battle) => battle.id !== "stage7_15_oleg_dom_fixture");
    const battle = {
      id: "stage7_15_oleg_dom_fixture", opponentId: "npc_bandit", attackerId: "npc_bandit", defenderId: S.me?.id || "me",
      status: "pickDefense", resolved: false, finished: false, attackHidden: true,
      attack: { id: "oleg-red", text: "Где будем разбираться?", displayText: "Где будем разбираться?", color: "r", type: "where" },
      _defenseChoices: choices,
      meta: { stage715DemoBattle: true, stage715OlegBattle: true, stage715BattleId: "stage7_15_oleg_battle", stage715OlegNoPostLossActions: true, stage715OlegResultRevealed: false },
    };
    S.battles.push(battle);
    if (document.getElementById("startScreen")) document.getElementById("startScreen").style.display = "none";
    G.UI.renderBattles();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const card = document.querySelector('[data-battle-id="stage7_15_oleg_dom_fixture"]');
    const before = {
      cardVisible: Boolean(card && card.getBoundingClientRect().width && getComputedStyle(card).visibility !== "hidden"),
      opponent: card?.querySelector(".choiceRow .chip")?.className || null,
      choices: card ? Array.from(card.querySelectorAll(".choiceRow"))[1]?.querySelectorAll(".chip") || [] : [],
      allButtons: card ? Array.from(card.querySelectorAll("button")).map((button) => button.textContent.trim()) : [],
    };
    const chipClasses = Array.from(before.choices, (chip) => chip.className);
    return { before: { ...before, choices: chipClasses }, battle, state: S };
  });

  if (process.env.OLEG_TIMING_ONLY !== "1") {
    assert.equal(rendered.before.cardVisible, true, "fixture battle card must be attached and visible in the rendered page");
    assert.match(rendered.before.opponent || "", /hiddenPower/, "Oleg red argument must render neutral before selection");
    assert.equal(rendered.before.choices.length, 3, "all three scripted answers must be rendered");
    assert.deepEqual(rendered.before.choices, ["chip y", "chip y", "chip y"], "all three rendered Oleg answer chips must be yellow");
    assert.equal(rendered.before.allButtons.length, 0, "unresolved first Oleg card must not expose actions");
  }

  await page.evaluate(() => {
    const G = window.Game;
    const S = G.UI.S;
    G.__S = S;
    G.Stage715Demo.destroy();
    S.chat = [];
    S.messages = [];
    S.battles = [{
      id: "stage7_15_nastya_battle", status: "finished", result: "win", outcome: "win", resolved: true, finished: true,
      meta: { stage715NastyaBattle: true, stage715BattleId: "stage7_15_nastya_battle", stage715NastyaPostWinQuestionShown: true },
    }];
    S.flags = Object.assign({}, S.flags, {
      stage715Demo: true,
      stage715DemoPhase: "next_scripted_flow",
      stage715NastyaPostWinReplyReceived: true,
      stage715NastyaWon: true,
      stage715OlegCardRevealAt: null,
      stage715OlegResultRevealAt: null,
      stage715OlegPublicLossAt: null,
      stage715OlegDmAt: null,
    });
    S.dm = { open: false, openIds: [], logs: {} };
    G.Stage715Demo.claimResume({ state: S, UI: G.UI });
    G.Stage715Demo.handlePlayerMessage("готово");
  });

  const visibleStamp = async (container, text, battleId = null) => {
    const handle = await page.waitForFunction(({ containerId, expected, id }) => {
      const root = id === "dmBlock" ? document.getElementById(id)
        : id ? document.querySelector(`[data-battle-id="${CSS.escape(id)}"]`) : document.getElementById(containerId);
      if (!root || !root.isConnected) return false;
      const style = getComputedStyle(root);
      const rect = root.getBoundingClientRect();
      if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity || "1") <= 0 || !rect.width || !rect.height) return false;
      if (!String(root.innerText || root.textContent || "").includes(expected)) return false;
      return Date.now();
    }, { containerId: container, expected: text, id: battleId }, { polling: "raf", timeout: 20000 });
    try {
      const timestamp = await handle.jsonValue();
      assert.ok(Number.isFinite(timestamp), `visible timestamp must be numeric for ${container}`);
      return timestamp;
    } finally {
      await handle.dispose();
    }
  };

  const greetingAt = await visibleStamp("chatLog", "слыш ты, совсем нюх потерялся да? надо тебя на место поставить.");
  const olegBattleHandle = await page.waitForFunction(() => window.Game.__S.battles.find((item) => item.meta?.stage715OlegBattle)?.id || false, null, { polling: "raf", timeout: 10000 });
  let olegBattleId;
  try {
    olegBattleId = await olegBattleHandle.jsonValue();
  } finally {
    await olegBattleHandle.dispose();
  }
  assert.equal(typeof olegBattleId, "string", "Oleg battle ID must be a concrete string");
  let cardAt;
  try { cardAt = await visibleStamp("battlesBody", "Где будем разбираться?", olegBattleId); }
  catch (error) {
    const diagnostic = await page.evaluate(() => ({ state: window.Game.__S, snapshot: window.Game.Stage715Demo.getState(), body: document.body.innerText.slice(-2000) }));
    throw new Error(`${String(error)}; state=${JSON.stringify(diagnostic.state?.flags)} battles=${JSON.stringify(diagnostic.state?.battles)} stage=${JSON.stringify(diagnostic.snapshot)} visible=${diagnostic.body}`);
  }
  assert.ok(cardAt - greetingAt >= 1000, `visible greeting-to-card gap was ${cardAt - greetingAt} ms`);
  const card = page.locator(`[data-battle-id="${olegBattleId}"]`);
  const answer = card.locator(".choiceRow").nth(1).locator(".chip").first();
  await answer.evaluate((element) => element.addEventListener("click", () => { window.__olegAnswerSelectedAt = Date.now(); }, { capture: true, once: true }));
  await answer.click();
  const answerAt = await page.evaluate(() => window.__olegAnswerSelectedAt);
  await page.reload();
  await page.waitForFunction(() => window.Game?.Stage715Demo && window.Game.__S?.battles?.some((item) => item.meta?.stage715OlegBattle && item.defense?.stage715DisplayText), null, { polling: "raf", timeout: 15000 });
  const resultAt = await visibleStamp("battlesBody", "Поражение", olegBattleId);
  assert.ok(resultAt - answerAt >= 1000, `visible answer-to-result gap was ${resultAt - answerAt} ms`);
  const publicLoss = "нефига лезть на взрослых дядек! меня может победить только такой же красный цвет, либо соседний оранжевый, а ты, с желтым тоном, знай свое место, и не дай Бог попадётся черный - это конец даже для меня. но ты вроде норм, поэтому я тебе в личку кое-что отправил, глянь.";
  const publicAt = await visibleStamp("chatLog", publicLoss);
  assert.ok(publicAt - resultAt >= 1000, `visible result-to-public-loss gap was ${publicAt - resultAt} ms`);
  const dm = "ладно не расстраивайся, дам тебе ещё один шанс, только никому не говори. если понимаешь, что не вытягиваешь, то всегда можешь уйти от конфликта за взятку. ок?";
  const dmAt = await visibleStamp("dmLog", dm, "dmBlock");
  assert.ok(dmAt - publicAt >= 1000, `visible public-loss-to-DM gap was ${dmAt - publicAt} ms`);
  const finished = await page.evaluate((id) => {
    const cardEl = document.querySelector(`[data-battle-id="${CSS.escape(id)}"]`);
    return {
      selectedAnswer: (() => {
        const battle = window.Game.__S.battles.find((item) => item.meta?.stage715OlegBattle);
        return battle?.meta?.stage715SelectedDefenseText || battle?.defense?.stage715DisplayText;
      })(),
      opponentColor: cardEl?.querySelector('[data-testid="incoming-opp-arg"] .chip')?.className || null,
      selectedColor: cardEl?.querySelector('[data-testid="incoming-my-counter"] .chip')?.className || null,
      battle: window.Game.__S.battles.find((item) => item.meta?.stage715OlegBattle),
      actionButtons: cardEl ? Array.from(cardEl.querySelectorAll("button")).map((button) => button.textContent.trim()) : [],
    };
  }, olegBattleId);
  assert.equal(finished.selectedAnswer, "Возможно, там, где Подворотня…", JSON.stringify(finished.battle));
  assert.equal(finished.opponentColor, "chip r", "revealed Oleg argument must be red");
  assert.equal(finished.selectedColor, "chip y", "selected player counterargument must remain yellow");
  assert.deepEqual(finished.actionButtons, []);
  const genericColors = await page.evaluate(async () => {
    const G = window.Game;
    const S = G.UI.S;
    const originalOptions = G.Conflict.myDefenseOptions;
    const originalChoices = G.Conflict.getDefenseChoicesForBattle;
    const custom = [
      { id: "generic-r", group: "where", type: "where", color: "r", text: "Generic red" },
      { id: "generic-o", group: "who", type: "who", color: "o", text: "Generic orange" },
      { id: "generic-y", group: "yn", type: "yn", color: "y", text: "Generic yellow" },
    ];
    G.Conflict.myDefenseOptions = () => custom;
    G.Conflict.getDefenseChoicesForBattle = () => custom;
    const battle = {
      id: "ordinary_color_fixture", opponentId: "npc_bandit", attackerId: "npc_bandit", defenderId: S.me?.id || "me",
      status: "pickDefense", resolved: false, finished: false, attackHidden: true,
      attack: { text: "Ordinary prompt", displayText: "Ordinary prompt", color: "r", type: "where" },
      meta: {},
    };
    S.battles.push(battle);
    G.UI.renderBattles();
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const card = document.querySelector('[data-battle-id="ordinary_color_fixture"]');
    const rows = card ? Array.from(card.querySelectorAll(".choiceRow")) : [];
    const classes = rows[1] ? Array.from(rows[1].querySelectorAll(".chip"), (chip) => chip.className) : [];
    G.Conflict.myDefenseOptions = originalOptions;
    G.Conflict.getDefenseChoicesForBattle = originalChoices;
    S.battles = S.battles.filter((item) => item.id !== "ordinary_color_fixture");
    G.UI.renderBattles();
    return classes;
  });
  assert.deepEqual(genericColors.slice().sort(), ["chip o", "chip r", "chip y"], "ordinary generic battle colors must keep their original values");
  assert.deepEqual(errors, [], `browser page errors: ${errors.join(" | ")}`);
  console.log(`PASS_STAGE7_15_ATOM5_OLEG_RENDERED_DOM_COLORS_AND_VISIBLE_TIMING ${JSON.stringify({ greetingToCardMs: cardAt - greetingAt, answerToResultMs: resultAt - answerAt, resultToPublicMs: publicAt - resultAt, publicToDmMs: dmAt - publicAt })}`);
} finally {
  await browser.close();
  server.close();
}
