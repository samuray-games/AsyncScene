from pathlib import Path
import subprocess


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js"
DEPLOYED = ROOT / "docs/ui/ui-stage7-first-experience.js"


def require(condition, message):
    if not condition:
        raise AssertionError(message)


require(SOURCE.read_bytes() == DEPLOYED.read_bytes(), "Stage 7.15 controller mirrors differ")
subprocess.run(["node", "--check", str(SOURCE)], cwd=ROOT, check=True)
source_text = SOURCE.read_text(encoding="utf-8")
handler = source_text[source_text.index("function handleRayhanDefenseChoice") : source_text.index("function isChoiceText")]
require("conflict.pickDefense" in handler, "Rayhan choice must use the existing defense resolver")
require('battle.status = "finished"' not in handler, "Rayhan handler must not force-finish every answer")
require('battle.result = "win"' not in handler, "Rayhan handler must not force a win")
require("G.Events.addEvent" in source_text, "wrong answer must create the standard event card")
require("G.Events.finalizeOpenEventNow" in source_text, "event must resolve through the existing event resolver")
require("RAYHAN_EVENT_MIN_DELAY_MS" in source_text and "RAYHAN_EVENT_MAX_DELAY_MS" in source_text, "event votes need a 1-3 second schedule")
require("watchFirstBattle()" not in source_text, "first Rayhan unlock must not call a removed watcher before render")

node_test = r'''
const fs = require("fs");
const vm = require("vm");
const assert = require("assert");
const source = fs.readFileSync("AsyncScene/Web/ui/ui-stage7-first-experience.js", "utf8");

function runScenario(choiceId) {
  const rayhanId = "npc_stage7_ken";
  const voters = ["npc_voter_1", "npc_voter_2", "npc_voter_3", "npc_voter_4", "npc_voter_5"];
  const state = {
    flags: { stage715Demo: true, stage715DemoPhase: "battle_unlocked", stage715EventsPanelRevealed: false },
    me: { id: "me", name: "Тестер", points: 0, wins: 0, influence: 0 },
    rep: 0,
    players: {
      [rayhanId]: { id: rayhanId, name: "Райхан", role: "crowd", npc: true, points: 10, influence: 1 },
      ...Object.assign({}, ...voters.map((id, index) => ({
        [id]: { id, name: `Голос ${index + 1}`, role: "crowd", npc: true, points: 10, influence: 1 },
      }))),
    },
    battles: [],
    events: [],
  };
  const battle = {
    id: "stage7_15_first_battle",
    opponentId: rayhanId,
    status: "pickDefense",
    resolved: false,
    finished: false,
    result: null,
    fromThem: true,
    attack: { id: "rayhan_attack", text: "Извините, кто тут дерзкий??", type: "yn", group: "yn", color: "y", _color: "y" },
    meta: { stage715DemoBattle: true, stage715BattleId: "stage7_15_first_battle", stage715RayhanScripted: true },
    _defenseChoices: [
      { id: "canon_who", group: "who", type: "who", color: "y", stage715DisplayText: "Похоже, ты…" },
      { id: "canon_where", group: "where", type: "where", color: "y", stage715DisplayText: "Кажется, прямо тут…" },
      { id: "canon_yn", group: "yn", type: "yn", color: "y", stage715DisplayText: "Наверное, да…" },
    ],
  };
  state.battles.push(battle);
  const chat = [];
  const system = [];
  const timeline = [];
  const eventUnlocks = [];
  let eventAdds = 0;
  const Game = {
    __S: state,
    __D: { toastLog: [], moneyLog: [] },
    Data: { START_POINTS_NPC: 10, t: () => "Споры" },
    Telemetry: { action() {} },
    ConflictEconomy: {
      transferPoints(from, to, amount, reason, meta) {
        const source = from === "me" ? state.me : state.players[from];
        const target = to === "me" ? state.me : state.players[to];
        assert(source && target, `missing economy account ${from}->${to}`);
        source.points -= amount;
        target.points += amount;
        Game.__D.moneyLog.push({ sourceId: from, targetId: to, amount, currency: "points", reason, battleId: meta.battleId });
        return { ok: true };
      },
    },
    __A: {
      transferRep(from, to, amount) {
        assert.strictEqual(from, "crowd_pool");
        assert.strictEqual(to, "me");
        state.rep += amount;
        return { ok: true };
      },
      emitStatDelta(kind, delta, meta) { Game.__D.toastLog.push({ kind, delta, battleId: meta.battleId }); },
      syncMeToPlayers() {},
    },
    Events: {
      addEvent(event) { eventAdds += 1; state.events.unshift(event); },
      finalizeOpenEventNow(event) {
        const crowd = event.crowd;
        event.resolved = true;
        event.state = "resolved";
        crowd.decided = true;
        crowd.winner = crowd.aVotes > crowd.bVotes ? "a" : "b";
        return true;
      },
    },
    Conflict: {
      pickDefense(battleId, defenseId) {
        assert.strictEqual(battleId, battle.id);
        const picked = battle._defenseChoices.find((item) => item.id === defenseId);
        battle.defense = picked;
        if (defenseId === "canon_yn") {
          battle.status = "finished";
          battle.finished = true;
          battle.resolved = true;
          battle.result = "win";
          return { ok: true, outcome: "win" };
        }
        battle.status = "crowd";
        battle.result = null;
        battle.draw = true;
        battle.crowd = { voters: {}, votesA: 0, votesB: 0, aVotes: 0, bVotes: 0, cap: 5, decided: false };
        return { ok: true, outcome: "draw" };
      },
      finalizeCrowdVote(battleId) {
        assert.strictEqual(battleId, battle.id);
        assert.strictEqual(battle.crowd.votesB, 3);
        assert.strictEqual(battle.crowd.votesA, 2);
        battle.crowd.decided = true;
        battle.crowd.winner = "defender";
        battle.status = "finished";
        battle.finished = true;
        battle.resolved = true;
        battle.draw = false;
        battle.result = "win";
        return { outcome: "B_WIN" };
      },
      incoming(opponentId) {
        const nastya = {
          id: "stage7_15_nastya_battle",
          opponentId,
          status: "pickDefense",
          resolved: false,
          finished: false,
          result: null,
          fromThem: true,
          attack: { id: "incoming_attack", text: "incoming", type: "yn", group: "yn", color: "o", _color: "o" },
          meta: {},
          _defenseChoices: [],
        };
        state.battles.push(nastya);
        return nastya;
      },
      myDefenseOptions() { return battle._defenseChoices; },
    },
    UI: {
      S: state,
      pushChat(entry) { chat.push(entry); timeline.push([entry.system ? "system" : "chat", entry.text]); },
      pushSystem(text) { system.push(text); timeline.push(["system", text]); },
      requestRenderAll() {},
      renderAll() {},
      renderEvents() {},
      displayNameByIdOrName(id) { return id === "me" ? state.me.name : (state.players[id] || {}).name; },
      setPanelSize(panel, size) { if (panel === "events") eventUnlocks.push(size); },
      ensureEventsExpanded() { eventUnlocks.push("expanded"); },
      ensurePanelExpanded() {},
      renderBattles() {},
      sendChat() {},
    },
  };
  const document = { querySelector() { return null; }, getElementById() { return null; } };
  const context = {
    window: { Game, document, location: { search: "?stage715demo=1" }, URLSearchParams, setTimeout, clearTimeout, setInterval, clearInterval },
    document, URLSearchParams, setTimeout, clearTimeout, setInterval, clearInterval, console,
  };
  context.Math = Object.create(Math);
  context.Math.random = () => 0;
  context.window.window = context.window;
  vm.runInNewContext(source, context);
  Game.Stage715Demo.claimResume({ state, UI: Game.UI, playerName: state.me.name });
  assert.strictEqual(Game.Stage715Demo.handleRayhanDefenseChoice(battle.id, choiceId), true);
  setTimeout(() => { battle._defenseChoices = []; }, 0);
  const immediateResult = battle.result;
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const event = state.events.find((entry) => entry && entry.stage715RayhanEvent === true);
        resolve({ state, battle, event, chat, system, timeline, eventUnlocks, immediateResult, eventAdds, game: Game });
      } catch (error) { reject(error); }
    }, choiceId === "canon_yn" ? 500 : 8200);
  });
}

(async () => {
  const wrong = await runScenario("canon_who");
  assert.notStrictEqual(wrong.immediateResult, "win", "wrong answer must not win immediately");
  assert.strictEqual(wrong.battle.result, "win", "event vote must resolve in player's favour");
  assert(wrong.event, "wrong answer must create a scripted event card");
  assert.strictEqual(wrong.eventAdds, 1, "wrong answer must start exactly one event sequence");
  assert.strictEqual(wrong.event.title, "Райхан против Тестер", "event card title must use player nickname");
  assert(!String(wrong.event.title).includes("stage715_"), "event title must not expose a Stage 7.15 id");
  assert(![wrong.event.title, wrong.event.meta, wrong.event.aName, wrong.event.bName].some((value) => String(value || "").includes("stage715_")), "event display fields must not expose internal ids");
  assert.strictEqual(wrong.event.voteLabels.a, "за тебя", "standard player vote label must remain unchanged");
  assert.strictEqual(wrong.event.voteLabels.b, "за Райхана", "standard Rayhan vote label must remain unchanged");
  assert.strictEqual(wrong.event.crowd.alreadyVotedCount, 5, "event must contain five votes");
  assert.strictEqual(wrong.event.crowd.aVotes, 3, "player must receive three event votes");
  assert.strictEqual(wrong.event.crowd.bVotes, 2, "Rayhan must receive two event votes");
  assert(wrong.event.crowd.scriptedVoteAt.every((at, index, list) => index === 0 || at - list[index - 1] >= 1000), "event votes must be delayed");
  assert(wrong.event.crowd.scriptedVoteAt.every((at, index, list) => index === 0 || at - list[index - 1] <= 3000), "event vote delays must be at most three seconds");
  assert(wrong.chat.some((entry) => entry.text === "хааа ответ мимо! ща толпа решит кто из нас прав!"), "wrong-answer chat line missing");
  assert.strictEqual(wrong.chat.filter((entry) => entry.text === "хааа ответ мимо! ща толпа решит кто из нас прав!").length, 1, "wrong-answer chat line duplicated");
  assert.strictEqual(wrong.timeline.filter((entry) => entry[0] === "system" && entry[1] === "Толпа решает.").length, 1, "system line duplicated or missing");
  assert(wrong.timeline.findIndex((entry) => entry[0] === "chat" && entry[1] === "хааа ответ мимо! ща толпа решит кто из нас прав!") < wrong.timeline.findIndex((entry) => entry[0] === "system" && entry[1] === "Толпа решает."), "system line must follow Rayhan chat line");
  assert(wrong.eventUnlocks.includes("expanded"), "events panel must unlock and expand");
  assert.strictEqual(wrong.state.me.points, 2, "Rayhan must transfer exactly two points after event win");
  assert.strictEqual(wrong.state.players.npc_stage7_ken.points, 8, "Rayhan must fund the two-point reward");
  assert.deepStrictEqual(wrong.game.__D.toastLog.map((entry) => [entry.kind, entry.delta]).sort(), [["points", 2], ["rep", 1], ["wins", 1]].sort());
  assert.strictEqual(wrong.event.resolved, true, "Rayhan event must resolve");
  assert.strictEqual(wrong.state.flags.stage715DemoPhase, "rayhan_win_waiting_reply", "event resolution must not leave the demo stuck");
  assert.strictEqual(wrong.game.Stage715Demo.handlePlayerMessage("готово"), true, "Rayhan post-win reply must advance the corridor");
  assert.strictEqual(wrong.state.flags.stage715DemoPhase, "nastya_battle", "Nastya battle must start after the Rayhan event");
  await new Promise((resolve) => setTimeout(resolve, 6500));
  assert.strictEqual(wrong.chat.filter((entry) => entry.text === "Так, я не поняла, это что за беспредел тут?? Тестер, ты проблем захотел? Бегом в Споры!").length, 1, "Nastya trigger must be emitted once with the current battle label");
  assert.strictEqual(wrong.battle.meta.stage715RayhanEventStartSequence, true, "Rayhan event start sequence must remain single-shot");
  wrong.game.Stage715Demo.destroy();

  const correct = await runScenario("canon_yn");
  assert.strictEqual(correct.battle.result, "win", "correct answer must resolve directly");
  assert.strictEqual(correct.battle.crowd, undefined, "correct answer must not create a vote");
  assert.strictEqual(correct.state.events.length, 0, "correct answer must not create an event card");
  assert.strictEqual(correct.state.me.points, 2, "direct win must reward exactly two points");
  assert.strictEqual(correct.state.players.npc_stage7_ken.points, 8, "direct win must debit Rayhan");
  assert(!correct.chat.some((entry) => entry.text === "хааа ответ мимо! ща толпа решит кто из нас прав!"), "correct answer must not emit wrong-answer chat");
  correct.game.Stage715Demo.destroy();
  console.log("PASS_STAGE7_15_RAYHAN_EVENTS_FIRST");
})().catch((error) => { console.error(error); process.exitCode = 1; });
'''

subprocess.run(["node", "-e", node_test], cwd=ROOT, check=True)
print("PASS_STAGE7_15_RAYHAN_EVENTS_FIRST_CONTRACT")
