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

node_test = r'''
const fs = require("fs");
const vm = require("vm");
const assert = require("assert");
const source = fs.readFileSync("AsyncScene/Web/ui/ui-stage7-first-experience.js", "utf8");

function runScenario(choiceId) {
  const rayhanId = "npc_stage7_ken";
  const voters = ["npc_voter_1", "npc_voter_2", "npc_voter_3", "npc_voter_4", "npc_voter_5"];
  const state = {
    flags: { stage715Demo: true, stage715DemoPhase: "battle_unlocked" },
    me: { id: "me", name: "Тестер", points: 0, wins: 0 },
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
    meta: { stage715DemoBattle: true, stage715BattleId: "stage7_15_first_battle", stage715RayhanScripted: true },
    _defenseChoices: [
      { id: "canon_who", group: "who", type: "who", color: "y", stage715DisplayText: "Похоже, ты…" },
      { id: "canon_where", group: "where", type: "where", color: "y", stage715DisplayText: "Кажется, прямо тут…" },
      { id: "canon_yn", group: "yn", type: "yn", color: "y", stage715DisplayText: "Наверное, да…" },
    ],
  };
  state.battles.push(battle);
  const chat = [];
  const Game = {
    __S: state,
    __D: { toastLog: [], moneyLog: [] },
    Data: { START_POINTS_NPC: 10, t: () => "Споры" },
    NPC: {
      getAll() { return Object.values(state.players); },
      voteInDraw() { return { voterId: null, side: null, weight: 0 }; },
    },
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
      transferRep(from, to, amount) { assert.strictEqual(from, "crowd_pool"); assert.strictEqual(to, "me"); state.rep += amount; return { ok: true }; },
      emitStatDelta(kind, delta, meta) { Game.__D.toastLog.push({ kind, delta, battleId: meta.battleId }); },
      syncMeToPlayers() {},
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
        battle.crowd = { voters: {}, votesA: 0, votesB: 0, aVotes: 0, bVotes: 0, cap: 10, decided: false };
        return { ok: true, outcome: "draw" };
      },
      applyCrowdVote(battleId) {
        const vote = Game.NPC.voteInDraw(battle, {});
        if (!vote.voterId || battle.crowd.voters[vote.voterId]) return;
        const side = vote.side === "defender" ? "b" : "a";
        battle.crowd.voters[vote.voterId] = side;
        if (side === "b") battle.crowd.votesB += 1;
        else battle.crowd.votesA += 1;
        battle.crowd.aVotes = battle.crowd.votesA;
        battle.crowd.bVotes = battle.crowd.votesB;
        if (Object.keys(battle.crowd.voters).length === 5) {
          battle.crowd.cap = 5;
          battle.crowd.decided = true;
          battle.status = "finished";
          battle.finished = true;
          battle.resolved = true;
          battle.result = battle.crowd.votesB > battle.crowd.votesA ? "win" : "lose";
        }
      },
      finalizeCrowdVote() {},
      myDefenseOptions() { return battle._defenseChoices; },
    },
    UI: {
      S: state,
      pushChat(entry) { chat.push(entry); },
      requestRenderAll() {},
      renderAll() {},
      displayNameByIdOrName(id) { return id === "me" ? state.me.name : (state.players[id] || {}).name; },
      setPanelSize() {},
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
  context.window.window = context.window;
  vm.runInNewContext(source, context);
  Game.Stage715Demo.claimResume({ state, UI: Game.UI, playerName: state.me.name });
  assert.strictEqual(Game.Stage715Demo.handleRayhanDefenseChoice(battle.id, choiceId), true);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve({ state, battle, chat, game: Game });
        Game.Stage715Demo.destroy();
      } catch (error) { reject(error); }
    }, choiceId === "canon_yn" ? 250 : 1800);
  });
}

(async () => {
  const wrong = await runScenario("canon_who");
  assert.strictEqual(wrong.battle.result, "win", "vote should resolve in player's favour");
  assert.strictEqual(wrong.battle.crowd.decided, true, "vote must resolve through crowd flow");
  assert.strictEqual(wrong.battle.crowd.cap, 5, "Rayhan demo vote must have five votes");
  assert.strictEqual(wrong.battle.crowd.votesB, 3, "player must receive the majority");
  assert.strictEqual(wrong.battle.crowd.votesA, 2, "Rayhan must receive the minority");
  assert(wrong.chat.some((entry) => entry.text === "хааа ответ мимо! ща толпа решит кто из нас прав!"), "wrong-answer chat line missing");
  assert.strictEqual(wrong.state.me.points, 2, "wrong-answer win must reward exactly two points");
  assert.strictEqual(wrong.state.players.npc_stage7_ken.points, 8, "wrong-answer reward must debit Rayhan");
  assert.deepStrictEqual(wrong.game.__D.toastLog.map((entry) => [entry.kind, entry.delta]).sort(), [["points", 2], ["rep", 1], ["wins", 1]].sort());

  const correct = await runScenario("canon_yn");
  assert.strictEqual(correct.battle.result, "win", "correct answer must resolve directly");
  assert.strictEqual(correct.battle.crowd, undefined, "correct answer must not create a vote");
  assert.strictEqual(correct.state.me.points, 2, "direct win must reward exactly two points");
  assert.strictEqual(correct.state.players.npc_stage7_ken.points, 8, "direct win must debit Rayhan");
  assert(!correct.chat.some((entry) => entry.text === "хааа ответ мимо! ща толпа решит кто из нас прав!"), "correct answer must not emit wrong-answer chat");
  console.log("PASS_STAGE7_15_RAYHAN_ANSWER_VALIDATION");
})().catch((error) => { console.error(error); process.exitCode = 1; });
'''

subprocess.run(["node", "-e", node_test], cwd=ROOT, check=True)
print("PASS_STAGE7_15_RAYHAN_ANSWER_VALIDATION_CONTRACT")
