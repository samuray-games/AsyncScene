#!/usr/bin/env python3
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
subprocess.run(["node", "--check", str(DEPLOYED)], cwd=ROOT, check=True)
js = SOURCE.read_text(encoding="utf-8")

required = (
    'const RAYHAN_ID = "npc_stage7_ken"',
    'const RAYHAN_WIN_CHAT = "ладно ладно, я понял',
    'const RAYHAN_REWARD_REASON = "stage715_rayhan_post_win_reward"',
    'economy.transferPoints(RAYHAN_ID, "me", pointsNeeded, RAYHAN_REWARD_REASON',
    'G.__A.transferRep("crowd_pool", "me", repNeeded, RAYHAN_REWARD_REASON',
    'G.__A.emitStatDelta("wins", winsNeeded',
    'ensureRayhanRewardToast("rep", 1, battleId)',
    'ensureRayhanRewardToast("points", 2, battleId)',
    'ensureRayhanRewardToast("wins", 1, battleId)',
    'phase = "rayhan_win_waiting_reply"',
    'state.flags.stage715RayhanRewardChatShown !== true',
    'const label = currentBattleBlockLabel()',
    'UI.displayNameByIdOrName',
    'text: `Так, я не поняла, это что за беспредел тут?? ${playerNickname()}, ты проблем захотел? Бегом в ${label}!`',
    'const started = startNastyaBattle()',
    'conflict.incoming("npc_stage7_mika", { pinned: true })',
    'stage715NastyaReactionShown !== true',
)
for text in required:
    require(text in js, f"missing Rayhan post-win contract: {text}")

watcher = js[js.index("function watchRayhanBattle"):js.index("function unlockOlegEscapeBattle")]
require(watcher.index('battleOutcome(battle) !== "win"') < watcher.index("settleRayhanWinRewards(battle)"), "Rayhan reward must follow win detection")
handler = js[js.index("function handlePlayerMessage"):js.index("function installChatHook")]
require(handler.index('if (phase === "rayhan_win_waiting_reply")') < handler.index("showNastyaAfterRayhanReply()"), "Nastya reaction must wait for the next player reply")
reaction = js[js.index("function showNastyaAfterRayhanReply"):js.index("function prepareNastyaDefenseChoices")]
require(reaction.index("pushNpc(") < reaction.index("startNastyaBattle()"), "Nastya chat must precede the scripted battle card")
require("[ник]" not in js, "runtime must not contain placeholder nickname")
require(js.count('conflict.incoming("npc_stage7_mika", { pinned: true })') == 1, "Nastya card must have one scripted start")
require(js.count('state.flags.stage715RayhanRewardChatShown !== true') == 1, "Rayhan reward chat must be idempotent")
require(js.count('state.flags.stage715NastyaReactionShown !== true') == 1, "Nastya reaction must be idempotent")

node_harness = r'''
const fs = require("fs");
const vm = require("vm");
const assert = require("assert");
const storage = new Map();
global.window = global;
global.localStorage = { getItem: (key) => storage.get(key) || null, setItem: (key, value) => storage.set(key, String(value)) };
global.location = { search: "?stage715demo=1" };
const labelNode = { textContent: "Споры" };
global.document = {
  querySelector(selector) { return selector.includes("battleTitleText") ? labelNode : null; },
  getElementById() { return null; },
};
const state = {
  flags: { stage715Demo: true, stage715DemoPhase: "battle_unlocked" },
  me: { id: "me", name: "Тестер", points: 0, wins: 0 },
  rep: 0, players: {}, battles: [], events: [],
};
const visibleChat = [];
const toastEvents = [];
let incomingCalls = 0;
const rayhanBattle = { id: "rayhan_post_win_test", opponentId: "npc_stage7_ken", status: "pickDefense", resolved: false, meta: { stage715DemoBattle: true, stage715BattleId: "stage7_15_first_battle" } };
state.battles.push(rayhanBattle);
const Game = window.Game = {
  __S: state, Data: { START_POINTS_NPC: 10, t: () => "Споры" },
  __D: { toastLog: [] },
  __A: {
    transferRep(from, to, amount) { assert.strictEqual(from, "crowd_pool"); assert.strictEqual(to, "me"); state.rep += amount; return { ok: true }; },
    emitStatDelta(kind, delta, meta) { toastEvents.push({ kind, delta, battleId: meta.battleId }); Game.__D.toastLog.push({ kind, delta, battleId: meta.battleId }); },
    syncMeToPlayers() {},
  },
  ConflictEconomy: {
    transferPoints(from, to, amount, reason, meta) {
      assert.strictEqual(from, "npc_stage7_ken"); assert.strictEqual(to, "me"); assert.strictEqual(amount, 2);
      state.players[from].points -= amount; state.me.points += amount;
      return { ok: true };
    },
  },
  Conflict: {
    incoming(opponentId) {
      incomingCalls += 1;
      const battle = { id: `nastya_${incomingCalls}`, opponentId, status: "pickDefense", meta: {} };
      state.battles.unshift(battle); return battle;
    },
    myDefenseOptions() { return [{ id: "canon_yn", group: "yn" }, { id: "canon_who", group: "who" }, { id: "canon_where", group: "where" }]; },
  },
  UI: { sendChat() {} },
};
const UI = Game.UI;
Object.assign(UI, {
  pushChat(entry) { visibleChat.push(entry); }, requestRenderAll() {}, renderAll() {},
  getStage7TutorialBlocks() { return state.flags.stage7TutorialBlocks || {}; },
  setStage7TutorialBlockState() {}, isStage7TutorialBlockUnlocked() { return false; },
  unlockStage7TutorialBlock() { return true; },
  displayNameByIdOrName(id) { return state.players[id] ? state.players[id].name : state.me.name; },
  emitStatDelta() {}, showStatToast() {},
});
vm.runInThisContext(fs.readFileSync("AsyncScene/Web/ui/ui-stage7-first-experience.js", "utf8"));
const context = { state, UI, playerName: "Тестер" };
Game.Stage715Demo.claimResume(context);
state.players.npc_stage7_ken.points = 10;
rayhanBattle.resolved = true; rayhanBattle.finished = true; rayhanBattle.status = "finished"; rayhanBattle.result = "win";
setTimeout(() => {
  try {
    assert.strictEqual(state.rep, 1);
    assert.strictEqual(state.me.points, 2);
    assert.strictEqual(state.players.npc_stage7_ken.points, 8);
    assert.strictEqual(state.me.wins, 1);
    assert.deepStrictEqual(toastEvents.map((item) => [item.kind, item.delta]).sort(), [["rep", 1], ["points", 2], ["wins", 1]].sort());
    assert(visibleChat.some((item) => item.text.includes("денежек больше стало")));
    Game.Stage715Demo.handlePlayerMessage("готов");
    setTimeout(() => {
      try {
        const nastya = state.battles.find((item) => item.meta && item.meta.stage715BattleId === "stage7_15_nastya_battle");
        assert(nastya, "scripted Nastya battle card missing");
        const reaction = visibleChat.find((item) => item.name === "Настя");
        assert(reaction && reaction.text.includes("Тестер") && reaction.text.includes("Бегом в Споры!"));
        assert(!visibleChat.some((item) => item.text.includes("[ник]")));
        assert.strictEqual(visibleChat.filter((item) => item.text.includes("денежек больше стало")).length, 1);
        Game.Stage715Demo.destroy();
        console.log("PASS_STAGE7_15_RAYHAN_POST_WIN_RUNTIME_SEQUENCE");
      } catch (error) { console.error(error); process.exitCode = 1; }
    }, 3500);
  } catch (error) { console.error(error); process.exitCode = 1; }
}, 4000);
'''
subprocess.run(["node", "-e", node_harness], cwd=ROOT, check=True)

print("PASS_STAGE7_15_RAYHAN_POST_WIN_SEQUENCE")
