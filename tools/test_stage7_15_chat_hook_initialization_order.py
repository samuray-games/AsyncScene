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

node_test = r'''
const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

const input = { value: "", addEventListener() {} };
const state = {
  flags: { stage715Demo: true, stage715DemoPhase: "awaiting_first" },
  me: { id: "me", name: "Тестер", points: 2, wins: 0 },
  rep: 0,
  players: {},
  battles: [],
  chat: [],
  events: [],
};
const Game = global.window = { Game: null };
Game.Game = Game;
Game.Game = {
  __S: state,
  __D: { moneyLog: [], toastLog: [] },
  Data: { START_POINTS_NPC: 10 },
  __A: { syncMeToPlayers() {} },
  UI: {
    S: state,
    pushChat(entry) { state.chat.push(entry); },
    requestRenderAll() {},
    renderAll() {},
    getStage7TutorialBlocks() { return {}; },
    setStage7TutorialBlockState() {},
    isStage7TutorialBlockUnlocked() { return false; },
    unlockStage7TutorialBlock() { return true; },
    displayNameByIdOrName(id) { return state.players[id] ? state.players[id].name : String(id); },
  },
};
global.document = {
  getElementById(id) { return id === "chatInput" ? input : null; },
  querySelector() { return null; },
};
global.location = { search: "" };
global.localStorage = { getItem() { return null; }, setItem() {} };
Game.Game.console = global.console;
Game.Game.setTimeout = global.setTimeout;
Game.Game.clearTimeout = global.clearTimeout;
Game.Game.setInterval = global.setInterval;
Game.Game.clearInterval = global.clearInterval;
Game.Game.URLSearchParams = global.URLSearchParams;

vm.runInThisContext(fs.readFileSync("AsyncScene/Web/ui/ui-stage7-first-experience.js", "utf8"));
const UI = Game.Game.UI;
assert.strictEqual(typeof UI.sendChat, "undefined", "race setup must start without UI.sendChat");
assert.strictEqual(UI.__stage715ChatHookReady, true, "readiness binding must be installed when sendChat is absent");

let genericCalls = 0;
UI.sendChat = function () { genericCalls += 1; };
const firstWrapped = UI.sendChat;
assert.strictEqual(firstWrapped.__stage715DemoWrapped, true, "late sendChat assignment must be wrapped");
UI.sendChat = firstWrapped;
assert.strictEqual(UI.sendChat, firstWrapped, "repeated readiness assignment must not double-wrap");

const demo = Game.Game.Stage715Demo;
assert.strictEqual(demo.claimResume({ state, UI, playerName: "Тестер" }).claimed, true);
input.value = "Привет";
UI.sendChat();
assert.strictEqual(state.flags.stage715DemoPhase, "tone_prompted", "accepted message must advance awaiting_first to tone_prompted");
assert.strictEqual(genericCalls, 0, "active Stage 7.15 send must not bypass interception");
assert.strictEqual(UI.sendChat, firstWrapped, "repeated install attempts must retain one wrapper");
const waitFor = (predicate, label) => new Promise((resolve, reject) => {
  const started = Date.now();
  const poll = () => {
    if (predicate()) return resolve();
    if (Date.now() - started > 5000) return reject(new Error(`timed out waiting for ${label}`));
    setTimeout(poll, 10);
  };
  poll();
});

waitFor(() => state.chat.some((entry) => String(entry.text || "").includes("слыш а чо как грубо")), "tone prompt")
  .then(() => new Promise((resolve) => setTimeout(resolve, 100)))
  .then(() => {
    assert.ok(!state.chat.some((entry) => String(entry.text || "").includes("не здороваешься")), "delayed first-message nudge must not continue");
    demo.destroy();
    input.value = "Обычный чат";
    UI.sendChat();
    assert.strictEqual(genericCalls, 1, "inactive Stage 7.15 send must preserve generic UI.sendChat behavior");
    console.log("PASS_STAGE7_15_CHAT_HOOK_INITIALIZATION_ORDER");
  })
  .catch((error) => { console.error(error); process.exitCode = 1; });
'''

subprocess.run(["node", "-e", node_test], cwd=ROOT, check=True)
print("PASS_STAGE7_15_CHAT_HOOK_INITIALIZATION_ORDER_GUARD")
