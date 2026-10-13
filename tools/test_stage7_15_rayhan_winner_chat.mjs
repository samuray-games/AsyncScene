import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const sourcePath = new URL("../AsyncScene/Web/conflict/conflict-core.js", import.meta.url);
const source = fs.readFileSync(sourcePath, "utf8");
const exportMarker = "  const wrappedCore = wrapConflictCore(C);";
assert(source.includes(exportMarker), "conflict-core test seam must remain available");

const emitted = [];
const systemCalls = [];
const Game = {
  __S: {
    me: { id: "me", name: "Тестер" },
    players: { npc_stage7_ken: { id: "npc_stage7_ken", name: "Райхан" } },
  },
  __A: {
    pushChat(name, text, options) {
      emitted.push({ name, text, options });
    },
  },
  System: {
    say(kind, code, values) {
      systemCalls.push({ kind, code, values });
      return "Баттл с " + values.oppName + ": " + values.text + ".";
    },
  },
};
const context = {
  Game,
  window: { location: { search: "" } },
  URLSearchParams,
  console: { warn() {}, error() {}, log() {} },
  Date,
  Math,
  Object,
  Array,
  String,
  Number,
  Boolean,
  RegExp,
  JSON,
  Error,
  Proxy,
  Reflect,
};
vm.createContext(context);
vm.runInContext(
  source.replace(exportMarker, "  Game.__testAnnounceBattleResult = announceBattleResult;\n" + exportMarker),
  context,
  { filename: "conflict-core.js" },
);

const rayhanWin = {
  id: "stage715-rayhan-win",
  fromThem: true,
  opponentId: "npc_stage7_ken",
  result: "win",
  resolved: true,
  suppressCrowdSystemChat: true,
  meta: { stage715RayhanScripted: true, stage715RayhanEventResolved: true },
};
Game.__testAnnounceBattleResult(rayhanWin);
Game.__testAnnounceBattleResult(rayhanWin);
assert.equal(emitted.length, 1, "resolved tutorial player victory emits exactly once");
assert.equal(emitted[0].name, "Система");
assert.equal(emitted[0].text, "Баттл с Тестер: победа.");
assert.equal(emitted[0].options.system, true);
assert.equal(systemCalls[0].values.oppName, "Тестер", "winner line uses the current nickname");
assert.notEqual(systemCalls[0].values.oppName, "Райхан", "winner line does not falsely name Rayhan");
assert.equal(rayhanWin.chatResultAnnounced, true);

const ordinarySuppressed = {
  id: "ordinary-suppressed",
  fromThem: true,
  opponentId: "npc_stage7_ken",
  result: "win",
  suppressCrowdSystemChat: true,
  meta: {},
};
Game.__testAnnounceBattleResult(ordinarySuppressed);
assert.equal(emitted.length, 1, "ordinary suppressed battle emits no result line");
assert.equal(ordinarySuppressed.chatResultAnnounced, true);

const rayhanLoss = {
  id: "stage715-rayhan-loss",
  fromThem: true,
  opponentId: "npc_stage7_ken",
  result: "lose",
  suppressCrowdSystemChat: true,
  meta: { stage715RayhanScripted: true, stage715RayhanEventResolved: true },
};
Game.__testAnnounceBattleResult(rayhanLoss);
assert.equal(emitted.length, 1, "a Rayhan tutorial loss emits no false player victory");
assert.equal(rayhanLoss.chatResultAnnounced, true);

console.log("PASS_STAGE7_15_RAYHAN_WINNER_CHAT");
