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
  await page.goto(`http://127.0.0.1:${address.port}/AsyncScene/index.html?stage7test=1&stage7testrun=atom6-oleg-escape`);
  await page.waitForFunction(() => window.Game?.UI?.renderBattles && window.Game?.Stage715Demo, null, { timeout: 10000 });

  const result = await page.evaluate(async () => {
    const G = window.Game;
    const S = G.UI.S;
    const canonicalState = G.__S;
    let id = "stage7_15_oleg_escape_dom_fixture";
    const expected = ["Возможно, там, где Подворотня…", "Думаю, Райхан…", "Кажется, нет…"];
    S.flags = Object.assign({}, S.flags, {
      stage715Demo: true,
      stage715DemoPhase: "oleg_dm",
      stage715OlegDmActive: true,
      stage715OlegDmReplied: false,
      stage715OlegPublicLossLineShown: true,
    });
    if (canonicalState && canonicalState !== S) {
      canonicalState.flags = Object.assign({}, canonicalState.flags, S.flags);
      canonicalState.rep = 5;
      if (canonicalState.me) canonicalState.me.points = 10;
    }
    for (const store of new Set([S, canonicalState])) {
      if (!store) continue;
      store.battles = (store.battles || []).filter((battle) => battle.id !== id
        && !(battle.meta && battle.meta.stage715BattleId === "stage7_15_oleg_escape_battle"));
    }
    const resumed = G.Stage715Demo.claimResume({ state: S, UI: G.UI });
    if (!resumed || resumed.claimed !== true) throw new Error("Stage 7.15 controller did not claim the DM checkpoint");
    if (!G.Stage715Demo.handleOlegDmReply("понятно")) throw new Error("nonempty first Oleg DM reply did not unlock the scripted escape card");
    const created = S.battles.find((entry) => entry.meta && entry.meta.stage715BattleId === "stage7_15_oleg_escape_battle");
    if (!created) throw new Error("first Oleg DM reply did not create the owned escape battle");
    G.Stage715Demo.handleOlegDmReply("ещё ответ");
    if (S.battles.filter((entry) => entry.meta && entry.meta.stage715BattleId === "stage7_15_oleg_escape_battle").length !== 1) {
      throw new Error("repeated DM reply duplicated the escape battle");
    }
    id = created.id;
    let corePickCalls = 0;
    const priorPick = G.Conflict?.pickDefense;
    if (G.Conflict) G.Conflict.pickDefense = () => { corePickCalls += 1; return true; };
    const battle = created;
    const renderAndRead = () => {
      G.UI.renderBattles();
      const card = document.querySelector(`[data-battle-id="${id}"]`);
      const rows = card ? Array.from(card.querySelectorAll(".choiceRow")) : [];
      const chips = rows.length > 1 ? Array.from(rows[1].querySelectorAll(".chip")) : [];
      return {
        card,
        argument: rows[0]?.textContent?.replace(/^Аргумент:\s*/, "").trim() || "",
        texts: chips.map((chip) => chip.textContent.trim()),
        colors: chips.map((chip) => chip.className.trim()),
        buttons: card ? Array.from(card.querySelectorAll("button")).map((button) => button.textContent.trim()) : [],
        visible: Boolean(card && card.getBoundingClientRect().width && getComputedStyle(card).visibility !== "hidden"),
      };
    };
    const first = renderAndRead();
    G.UI._battleChoiceCache.defense[id] = [{ id: "generic", text: "Подставной общий аргумент", color: "r" }];
    const afterPoison = renderAndRead();
    battle.status = "retry_pickDefense";
    battle.status = "pickDefense";
    G.UI._battleChoiceCache.status[id] = "previous_status";
    const afterInvalidate = renderAndRead();
    const chip = afterInvalidate.card?.querySelectorAll(".choiceRow")[1]?.querySelector(".chip");
    chip?.click();
    const selected = battle.meta.stage715OlegEscapeSelectedText;
    const resultAfterSelection = { corePickCalls, selected, battleStatus: battle.status, resolved: battle.resolved };
    S.me.points = 10;
    const beforeAttempts = { money: S.me.points, rep: S.rep, battleId: battle.id };
    const leave = document.querySelector(`[data-battle-id="${id}"]`)?.querySelector("button");
    leave?.click();
    leave?.click();
    const firstAttempt = {
      escape: Object.assign({}, battle.meta.stage715Escape),
      money: S.me.points,
      battleId: battle.id,
    };
    if (battle._escapeTimer) clearInterval(battle._escapeTimer);
    if (battle._crowdTimer) clearInterval(battle._crowdTimer);
    battle.escapeVote = null;
    battle._escapePrev = null;
    battle.status = "pickDefense";
    battle.result = null;
    battle.resolved = false;
    battle.finished = false;
    battle.meta.stage715Escape = { attempt: 1, status: "failed", outcomeHandled: true, repSettled: true, scriptedVotes: { a: 2, b: 3 } };
    const restored = renderAndRead();
    restored.card?.querySelector("button")?.click();
    const secondAttempt = {
      escape: Object.assign({}, battle.meta.stage715Escape),
      money: S.me.points,
      battleId: battle.id,
    };
    if (battle._escapeTimer) clearInterval(battle._escapeTimer);
    if (battle._crowdTimer) clearInterval(battle._crowdTimer);
    if (G.Conflict) G.Conflict.pickDefense = priorPick;
    return {
      expected, first: { argument: first.argument, texts: first.texts, colors: first.colors, buttons: first.buttons, visible: first.visible },
      afterPoison: { argument: afterPoison.argument, texts: afterPoison.texts, colors: afterPoison.colors, buttons: afterPoison.buttons },
      afterInvalidate: { argument: afterInvalidate.argument, texts: afterInvalidate.texts, colors: afterInvalidate.colors, buttons: afterInvalidate.buttons },
      resultAfterSelection,
      beforeAttempts,
      firstAttempt,
      restored: { buttons: restored.buttons, texts: restored.texts },
      secondAttempt,
    };
  });

  for (const pass of [result.first, result.afterPoison, result.afterInvalidate]) {
    assert.equal(pass.argument, "Где будем разбираться?", "escape card argument must be the exact scripted Oleg prompt");
    assert.deepEqual(pass.texts, result.expected, "escape card must render the exact three scripted player answers");
    assert.deepEqual(pass.colors, ["chip y", "chip y", "chip y"], "all escape answer chips must render yellow");
    assert.deepEqual(pass.buttons, ["Уйти"], "Уйти must be the only escape battle action button");
  }
  assert.equal(result.first.visible, true, "scripted escape battle card must be visibly rendered");
  assert.equal(result.resultAfterSelection.corePickCalls, 0, "scripted answer chips must not route into generic Conflict.pickDefense");
  assert.equal(result.resultAfterSelection.selected, result.expected[0], "selected scripted text must remain canonical");
  assert.equal(result.resultAfterSelection.battleStatus, "pickDefense", "selecting an answer must not enter a generic conflict branch");
  assert.equal(result.resultAfterSelection.resolved, false, "selecting an answer must not settle the escape battle");
  assert.equal(result.firstAttempt.escape.attempt, 1, "the first leave action must start exactly one escape attempt");
  assert.equal(result.firstAttempt.escape.status, "voting", "the first leave button must start the existing escape vote");
  assert.deepEqual(result.firstAttempt.escape.scriptedVotes, { a: 2, b: 3 }, "first attempt must schedule five scripted votes at 2:3");
  assert.equal(result.firstAttempt.money, result.beforeAttempts.money - 1, "the first attempt must charge one money at start");
  assert.deepEqual(result.restored.buttons, ["Уйти"], "the restored retry card must expose only Уйти");
  assert.deepEqual(result.restored.texts, result.expected, "the restored retry card must keep the exact scripted choices");
  assert.equal(result.secondAttempt.escape.attempt, 2, "the retry must reuse the same battle identity for attempt two");
  assert.equal(result.secondAttempt.escape.status, "voting", "the retry action must start the second existing escape vote");
  assert.deepEqual(result.secondAttempt.escape.scriptedVotes, { a: 3, b: 2 }, "second attempt must schedule five scripted votes at 3:2");
  assert.equal(result.secondAttempt.money, result.beforeAttempts.money - 2, "two starts must charge two money total");
  assert.equal(result.firstAttempt.battleId, result.beforeAttempts.battleId, "first attempt must retain the original battle identity");
  assert.equal(result.secondAttempt.battleId, result.beforeAttempts.battleId, "retry must retain the same battle identity");
  assert.deepEqual(errors, [], `browser page errors: ${JSON.stringify(errors)}`);
  console.log("PASS_STAGE7_15_ATOM6_OLEG_ESCAPE_RENDERED_DOM", JSON.stringify(result));
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
