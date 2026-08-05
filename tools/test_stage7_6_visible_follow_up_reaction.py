#!/usr/bin/env python3
from __future__ import annotations

import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js"
DOCS = ROOT / "docs/ui/ui-stage7-first-experience.js"
SOURCE_INDEX = ROOT / "AsyncScene/Web/index.html"
DOCS_INDEX = ROOT / "docs/index.html"


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


source = SOURCE.read_text(encoding="utf-8")
docs = DOCS.read_text(encoding="utf-8")
source_index = SOURCE_INDEX.read_text(encoding="utf-8")
docs_index = DOCS_INDEX.read_text(encoding="utf-8")

require(source == docs, "Stage 7.6 source/docs controller mirrors differ")
require(source_index == docs_index, "Stage 7.6 source/docs index mirrors differ")
require("stage7_6_visible_follow_up_reaction_20260805a" in source_index, "Stage 7.6 cache-buster missing")
require("FOLLOW_UP_REACTION_DELAY_MS = TEST_MODE ? 10_000 : 30_000" in source, "later-reaction delay contract missing")
require("followUpReactionPresentedCount" in source, "exactly-once presentation counter missing")
require("followUpReactionSettled" in source, "settled persistence flag missing")
require("getFollowUpReactionDue" in source, "due check missing")
require("presentFollowUpReaction" in source, "presentation function missing")
require("settleFollowUpReaction" in source, "settlement function missing")
require("ack-follow-up-reaction" in source, "reaction acknowledgement action missing")
require("Это произошло из-за твоего предыдущего выбора." in source, "causal explanation missing")
require("Настя подтвердила доказательство" in source, "deny primary reaction missing")
require("Райхан использовал паузу" in source, "deny secondary reaction missing")
require("Райхан объявил реванш" in source, "accuse primary reaction missing")
require("Настя нашла свидетеля" in source, "accuse secondary reaction missing")
require("Олег подтвердил оплату" in source, "pay primary reaction missing")
require("Олег усилил давление" in source, "pay secondary reaction missing")
require("raw.followUpSettled === true && !hasFollowUpReactionContract" in source, "legacy Stage 7.5 completion migration missing")
for forbidden in ("fetch(", "XMLHttpRequest", "sendBeacon", "WebSocket"):
    require(forbidden not in source, f"network transmission forbidden in controller: {forbidden}")

subprocess.run(["node", "--check", str(SOURCE)], check=True, cwd=ROOT)
subprocess.run(["node", "--check", str(DOCS)], check=True, cwd=ROOT)

harness = r'''
const path = require("path");
const controllerPath = process.argv[2];

global.window = global;
global.location = { search: "?stage7test=1&stage7testrun=stage7_6_test" };

const storage = new Map();
global.localStorage = {
  getItem(key) { return storage.has(key) ? storage.get(key) : null; },
  setItem(key, value) { storage.set(key, String(value)); },
  removeItem(key) { storage.delete(key); },
};

const elements = new Map();
const blocks = {
  firstChild: null,
  insertBefore(child) {
    elements.set(child.id, child);
    this.firstChild = child;
  },
};
elements.set("blocks", blocks);

const visibilityHandlers = [];
global.document = {
  hidden: false,
  documentElement: { classList: { toggle() {} } },
  getElementById(id) { return elements.get(id) || null; },
  createElement() {
    const node = {
      id: "",
      className: "",
      hidden: false,
      innerHTML: "",
      setAttribute() {},
      addEventListener(type, handler) { if (type === "click") this._click = handler; },
      remove() { if (this.id) elements.delete(this.id); },
    };
    return node;
  },
  addEventListener(type, handler) { if (type === "visibilitychange") visibilityHandlers.push(handler); },
};

global.Game = {};
require(controllerPath);

const STORAGE_KEY = "AsyncScene_first_experience_evidence_v1:stage7_6_test";
const state = { players: {}, me: { points: 10 } };
const UI = {
  pushSystem() {},
  pushChat() {},
  requestRenderAll() {},
  renderAll() {},
};
let normalWorldStarts = 0;
const context = { UI, state, playerName: "Тестер", startNormalWorld() { normalWorldStarts += 1; } };

function seed(choice, memory, includeReactionFields = true) {
  const raw = {
    schemaVersion: 1,
    scenarioId: "first_experience_personal_conflict_v1",
    stateId: "main_unlocked",
    preludeComplete: true,
    branchId: "deny",
    shownMessageIds: ["ken_accusation"],
    settlementId: "settlement:test",
    settled: true,
    freedomCardShown: true,
    freedomCardDismissed: true,
    awaitingWorldAdvance: false,
    worldAdvanceDueAt: Date.now() - 1000,
    worldAdvanceId: "world:test",
    worldAdvanceSettled: true,
    worldAdvancePresented: false,
    branchFollowUpPending: false,
    followUpChoiceId: choice,
    followUpSettled: true,
    npcMemory: { npc_stage7_mika: memory },
    telemetry: [],
  };
  if (includeReactionFields) {
    Object.assign(raw, {
      followUpReactionId: `deny:${choice}`,
      followUpReactionDueAt: Date.now() - 1,
      followUpReactionPresented: false,
      followUpReactionPresentationMode: null,
      followUpReactionPresentedCount: 0,
      followUpReactionSettled: false,
    });
  }
  storage.set(STORAGE_KEY, JSON.stringify(raw));
}

function clickReaction() {
  const panel = elements.get("stage7FirstExperiencePanel");
  if (!panel || typeof panel._click !== "function") throw new Error("reaction panel click handler missing");
  const button = {
    disabled: false,
    closest() { return this; },
    getAttribute(name) { return name === "data-stage7-action" ? "ack-follow-up-reaction" : null; },
  };
  panel._click({ target: button, preventDefault() {} });
}

seed("primary", { evidenceShared: 1 });
let claim = Game.Stage7FirstExperience.claimResume(context);
if (!claim || claim.claimed !== true) throw new Error("primary due reaction was not claimed");
let panel = elements.get("stage7FirstExperiencePanel");
if (!panel || !panel.innerHTML.includes("Настя подтвердила доказательство")) throw new Error("primary reaction copy missing");
let snapshot = Game.Stage7FirstExperience.getSnapshot();
if (snapshot.followUpReactionPresentedCount !== 1 || snapshot.followUpReactionPresentationMode !== "return") {
  throw new Error("primary reaction did not present exactly once on return");
}
clickReaction();
snapshot = Game.Stage7FirstExperience.getSnapshot();
if (!snapshot.followUpReactionSettled || snapshot.followUpReactionPresented) throw new Error("primary reaction did not settle");
if (normalWorldStarts !== 1) throw new Error(`normal world start count after primary=${normalWorldStarts}`);
Game.Stage7FirstExperience.destroy();
claim = Game.Stage7FirstExperience.claimResume(context);
if (!claim || claim.claimed !== false) throw new Error("settled reaction replayed after refresh");

seed("secondary", { evidenceHeld: 1 });
Game.Stage7FirstExperience.destroy();
claim = Game.Stage7FirstExperience.claimResume(context);
if (!claim || claim.claimed !== true) throw new Error("secondary due reaction was not claimed");
panel = elements.get("stage7FirstExperiencePanel");
if (!panel || !panel.innerHTML.includes("Райхан использовал паузу")) throw new Error("secondary reaction copy missing");
if (panel.innerHTML.includes("Настя подтвердила доказательство")) throw new Error("primary and secondary reactions are not distinguishable");
clickReaction();
Game.Stage7FirstExperience.destroy();

seed("primary", { evidenceShared: 1 }, false);
claim = Game.Stage7FirstExperience.claimResume(context);
if (!claim || claim.claimed !== false) throw new Error("legacy accepted Stage 7.5 save was retroactively reopened");
Game.Stage7FirstExperience.destroy();
console.log("STAGE7_6_NODE_HARNESS_OK");
'''

with tempfile.NamedTemporaryFile("w", suffix=".js", encoding="utf-8", delete=False) as handle:
    handle.write(harness)
    harness_path = Path(handle.name)
try:
    subprocess.run(["node", str(harness_path), str(SOURCE)], check=True, cwd=ROOT)
finally:
    harness_path.unlink(missing_ok=True)

print("STAGE7_6_VISIBLE_FOLLOW_UP_REACTION_OK")
