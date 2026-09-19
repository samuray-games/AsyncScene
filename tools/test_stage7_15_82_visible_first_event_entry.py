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
events = EVENTS.read_text(encoding="utf-8")
index = INDEX.read_text(encoding="utf-8")
assert 'function settleFirstIndependentBattleCompletion()' in source
assert 'stage715FirstIndependentBattleComplete' in source
settle_body = source[source.index('function settleFirstIndependentBattleCompletion'):source.index('function watchFirstIndependentBattle')]
assert 'revealEventsPanel();' in settle_body, "first independent victory must reveal the M82 Events surface"
assert 'У нас тут стычка!!! Выбери за кого ты в событиях.' in settle_body, "first event eligibility message must be canonical"
assert 'M83' not in source
assert 'function renderFirstEventEntry(' in events
assert 'stage715FirstEventEntry' in events
assert 'id="eventsHeader"' in index and 'id="eventsBody"' in index
assert 'function setStage715EventsPanelVisible(visible)' in source
assert 'setStage715EventsPanelVisible(false)' in source
assert 'setStage715EventsPanelVisible(!!(state.flags && state.flags[STAGE715_EVENTS_REVEALED_FLAG] === true))' in source
reveal_body = source[source.index('function revealPanelOnce'):source.index('function setStage715EventsPanelVisible')]
assert 'if (panelKey === "events") setStage715EventsPanelVisible(true);' in reveal_body

node_test = r'''
const fs = require("fs");
const assert = require("assert");
const source = fs.readFileSync("AsyncScene/Web/ui/ui-stage7-first-experience.js", "utf8");
const events = fs.readFileSync("AsyncScene/Web/ui/ui-events.js", "utf8");
function extractFunction(text, marker) {
  const start = text.indexOf(marker); assert(start >= 0, `missing ${marker}`);
  const open = text.indexOf("{", start); let depth = 0; let quote = null;
  for (let i = open; i < text.length; i++) {
    const ch = text[i];
    if (quote) { if (ch === quote && text[i - 1] !== "\\") quote = null; continue; }
    if (ch === "'" || ch === '"' || ch === "`") { quote = ch; continue; }
    if (ch === "{") depth++;
    if (ch === "}" && --depth === 0) return text.slice(start, i + 1);
  }
  throw new Error(`unterminated ${marker}`);
}
class Element {
  constructor(tag) { this.tagName = tag.toUpperCase(); this.children = []; this.dataset = {}; this.className = ""; this.textContent = ""; this.classList = { add() {}, remove() {} }; }
  appendChild(child) { this.children.push(child); child.parentNode = this; return child; }
}
global.document = { createElement: (tag) => new Element(tag) };
global.Game = { Stage715Demo: { isFirstEventEligible: (state) => state.flags.stage715FirstIndependentBattleComplete === true } };
global.stop = (event) => { event.preventDefault(); event.stopPropagation(); };
const renderEntry = Function("Game", extractFunction(events, "function renderFirstEventEntry(") + "; return renderFirstEventEntry;")(Game);
function entryCase(label, eligible) {
  const state = { flags: { stage715EventsPanelRevealed: true, stage715FirstIndependentBattleComplete: eligible } };
  const body = new Element("div"); let opened = 0; let rerendered = 0;
  const ui = { setPanelSize(panel, size) { assert.deepStrictEqual([panel, size], ["events", "medium"]); opened++; } };
  const made = renderEntry(body, state, ui, () => { opened++; }, () => { rerendered++; });
  assert.strictEqual(made, eligible, `${label}: entry eligibility`);
  assert.strictEqual(body.children.length, eligible ? 1 : 0, `${label}: entry presence`);
  if (eligible) {
    const entry = body.children[0];
    assert.strictEqual(entry.className, "eventCard stage715FirstEventEntry");
    assert.strictEqual(entry.dataset.entryId, "stage715-first-event-entry");
    const action = entry.children[1];
    assert.strictEqual(action.dataset.action, "open-first-event-entry");
    action.onclick({ preventDefault() {}, stopPropagation() {}, target: action });
    assert.strictEqual(state.flags.eventsOpen, true, `${label}: control opens Events`);
    assert.strictEqual(state.flags.eventsCollapsed, false, `${label}: control expands Events`);
    assert.strictEqual(opened, 2, `${label}: normal UI mechanics`);
    assert.strictEqual(rerendered, 1, `${label}: rerender`);
  }
}
entryCase("SCRIPTED_RAYHAN_EVENTS_ALREADY_VISIBLE", false);
entryCase("PREQUALIFYING_LOCK", false);
entryCase("START_ONLY_LOCK", false);
entryCase("LOSS_LOCK", false);
entryCase("INTERRUPTED_LOCK", false);
entryCase("UNRELATED_BATTLE_LOCK", false);
entryCase("QUALIFYING_WIN_ENTRY_VISIBLE", true);
console.log("PASS_STAGE7_15_82_VISIBLE_FIRST_EVENT_ENTRY");
'''
subprocess.run(["node", "-e", node_test], cwd=ROOT, check=True)
print("PASS_STAGE7_15_82_VISIBLE_FIRST_EVENT_ENTRY")
