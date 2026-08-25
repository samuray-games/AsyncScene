from pathlib import Path
import subprocess


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js"
DEPLOYED = ROOT / "docs/ui/ui-stage7-first-experience.js"

assert SOURCE.read_bytes() == DEPLOYED.read_bytes(), "Stage 7.15 controller mirrors differ"
subprocess.run(["node", "--check", str(SOURCE)], cwd=ROOT, check=True)

node_test = r'''
const fs = require("fs");
const vm = require("vm");
const assert = require("assert");
const source = fs.readFileSync("AsyncScene/Web/ui/ui-stage7-first-experience.js", "utf8");
const state = {
  flags: { stage715Demo: true, stage715DemoPhase: "tone_prompted" },
  me: { id: "me", name: "Тест" },
  players: {},
  battles: [],
};
let optionCalls = 0;
let revealCalls = 0;
const Game = {
  __S: state,
  __DEV: {},
  Data: { START_POINTS_NPC: 10 },
  Conflict: {
    myDefenseOptions() {
      optionCalls += 1;
      return [{ id: "canon_who", group: "who", type: "who", text: "canonical who" }];
    },
  },
  Telemetry: { action() {} },
  UI: {
    S: state,
    pushChat() {},
    requestRenderAll() {},
    renderAll() {},
    ensurePanelExpanded() { revealCalls += 1; },
    setPanelSize() {},
    sendChat() {},
  },
};
const document = {
  getElementById() { return null; },
  querySelector(selector) {
    if (selector === "#battlesHeader .battleTitleText") return { textContent: "Споры" };
    return null;
  },
};
const context = {
  window: { Game, document, location: { search: "?stage715demo=1" }, URLSearchParams, setTimeout, clearTimeout, setInterval, clearInterval },
  document, URLSearchParams, setTimeout, clearTimeout, setInterval, clearInterval, console,
};
context.window.window = context.window;
vm.runInNewContext(source, context);
const demo = Game.Stage715Demo;
demo.claimResume({ state, UI: Game.UI, playerName: state.me.name });
demo.handlePlayerMessage("первый ответ");
demo.handlePlayerMessage("тон вижу");
setTimeout(() => {
  try {
    const failure = demo.getLastFailure();
    assert.strictEqual(optionCalls, 12, `expected 12 option attempts, got ${optionCalls}`);
    assert(failure && failure.ok === false, "missing-group failure must be structured");
    assert.strictEqual(String(failure.reason), "missing canonical defense group: where, yn");
    assert.strictEqual(state.battles.length, 0, "failed challenge must not be created");
    assert.strictEqual(revealCalls, 0, "failed challenge must not reveal Battles");
    console.log("PASS_STAGE7_15_RAYHAN_MISSING_GROUP", JSON.stringify(failure));
    demo.destroy();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}, 9000);
'''

subprocess.run(["node", "-e", node_test], cwd=ROOT, check=True)
