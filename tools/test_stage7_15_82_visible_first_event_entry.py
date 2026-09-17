#!/usr/bin/env python3
from pathlib import Path
import subprocess


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js"
DEPLOYED = ROOT / "docs/ui/ui-stage7-first-experience.js"
EVENTS = ROOT / "AsyncScene/Web/ui/ui-events.js"
INDEX = ROOT / "AsyncScene/Web/index.html"

assert SOURCE.read_bytes() == DEPLOYED.read_bytes(), "Stage 7.15 controller mirrors differ"
assert EVENTS.read_bytes() == (ROOT / "docs/ui/ui-events.js").read_bytes(), "Events UI mirrors differ"
subprocess.run(["node", "--check", str(SOURCE)], cwd=ROOT, check=True)
subprocess.run(["node", "--check", str(EVENTS)], cwd=ROOT, check=True)

source = SOURCE.read_text(encoding="utf-8")
assert 'function settleFirstIndependentBattleCompletion()' in source
assert 'flags.stage715FirstIndependentBattleComplete' in source
assert 'revealEventsPanel();' in source
assert source.count('revealEventsPanel()') >= 4, "existing Events reveals must remain intact"
assert source.index('state.flags.stage715FirstIndependentBattleComplete = true;') < source.index('revealEventsPanel()', source.index('function settleFirstIndependentBattleCompletion'))
assert 'G.Events.addEvent' not in source[source.index('function settleFirstIndependentBattleCompletion'):source.index('function watchFirstIndependentBattle')]
assert 'M83' not in source
events = EVENTS.read_text(encoding="utf-8")
index = INDEX.read_text(encoding="utf-8")
assert 'id="eventsHeader"' in index and 'id="eventsBody"' in index, "existing Events control missing"
assert 'UI.ensureEventsExpanded' in events and 'UI.renderEvents' in events, "existing Events control is not interactive"

node_test = r'''
const fs = require("fs");
const vm = require("vm");
const assert = require("assert");
const source = fs.readFileSync("AsyncScene/Web/ui/ui-stage7-first-experience.js", "utf8");

function runCase(label, battlePatch, expectReveal) {
  const state = {
    flags: {
      stage715Demo: true,
      stage715FirstIndependentBattleInstructionSent: true,
      stage715FirstIndependentBattleComplete: false,
      stage715EventsPanelRevealed: false,
    },
    me: { id: "me", name: "Тестер", points: 10, wins: 0 },
    rep: 1,
    players: { npc_weak: { id: "npc_weak", name: "Слабый", npc: true, points: 10 } },
    battles: [], events: [],
  };
  const reveals = [];
  const battle = Object.assign({
    id: `${label}-battle`, opponentId: "npc_weak", status: "finished",
    finished: true, resolved: true, result: "loss",
    meta: { stage715FirstIndependentBattle: true },
  }, battlePatch);
  state.battles.push(battle);
  const Game = {
    __S: state,
    __D: { moneyLog: [], toastLog: [] },
    Data: { START_POINTS_NPC: 10 },
    Telemetry: { action() {} },
    UI: {
      S: state, requestRenderAll() {}, renderAll() {},
      setPanelSize(panel, size) { reveals.push([panel, size]); },
      ensureEventsExpanded() { reveals.push(["events", "expanded"]); },
      setEventsCollapsed(value) { state.flags.eventsCollapsed = value; },
    },
  };
  const context = {
    window: { Game, location: { search: "?stage715demo=1" }, URLSearchParams, setTimeout, clearTimeout, setInterval, clearInterval },
    document: { querySelector() { return null; }, getElementById() { return null; } },
    URLSearchParams, setTimeout, clearTimeout, setInterval, clearInterval, console,
  };
  context.window.window = context.window;
  vm.runInNewContext(source, context);
  Game.Stage715Demo.claimResume({ state, UI: Game.UI, playerName: "Тестер" });
  assert.strictEqual(reveals.length, 0, `${label}: Events must be locked before qualifying WIN`);
  if (expectReveal) Game.Stage715Demo.firstIndependentBattleStarted({ opponentId: "npc_weak", battle });
  return new Promise((resolve) => setTimeout(() => {
    assert.strictEqual(state.flags.stage715FirstIndependentBattleComplete, expectReveal,
      `${label}: completion truth mismatch`);
    assert.strictEqual(reveals.length > 0, expectReveal, `${label}: Events reveal mismatch`);
    if (expectReveal) {
      assert.deepStrictEqual(reveals, [["events", "medium"], ["events", "expanded"]]);
      assert.strictEqual(Game.Stage715Demo.isFirstEventEligible(state), true, "eligibility query must reuse M81 completion truth");
      Game.Stage715Demo.firstIndependentBattleStarted({ opponentId: "npc_weak", battle });
      return setTimeout(() => {
        assert.deepStrictEqual(reveals, [["events", "medium"], ["events", "expanded"]]);
        resolve();
      }, 120);
    }
    resolve();
  }, 180));
}

(async () => {
  await runCase("prequalifying", { result: null, finished: false, resolved: false, status: "pickDefense" }, false);
  await runCase("start-only", { result: null, finished: false, resolved: false, status: "active" }, false);
  await runCase("loss", { result: "loss" }, false);
  await runCase("interrupted", { result: "interrupted" }, false);
  await runCase("unrelated", { result: "win", meta: {} }, false);
  await runCase("qualifying-win", { result: "win" }, true);
  console.log("PASS_STAGE7_15_82_VISIBLE_FIRST_EVENT_ENTRY");
})().catch((error) => { console.error(error); process.exit(1); });
'''
subprocess.run(["node", "-e", node_test], cwd=ROOT, check=True)

print("PASS_STAGE7_15_82_VISIBLE_FIRST_EVENT_ENTRY")
