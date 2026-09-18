from pathlib import Path
import subprocess


ROOT = Path(__file__).resolve().parents[1]
STAGE = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js"
STAGE_DOCS = ROOT / "docs/ui/ui-stage7-first-experience.js"
BOOT = ROOT / "AsyncScene/Web/ui/ui-boot.js"
BOOT_DOCS = ROOT / "docs/ui/ui-boot.js"
DATA = ROOT / "AsyncScene/Web/data.js"
DATA_DOCS = ROOT / "docs/data.js"
PROFILE = ROOT / "AsyncScene/Web/ui/ui-profile-visual-tone-repair.js"
PROFILE_DOCS = ROOT / "docs/ui/ui-profile-visual-tone-repair.js"


def require(condition, message):
    if not condition:
        raise AssertionError(message)


for source, deployed, label in (
    (STAGE, STAGE_DOCS, "Stage 7.15 controller"),
    (BOOT, BOOT_DOCS, "boot"),
    (DATA, DATA_DOCS, "data"),
    (PROFILE, PROFILE_DOCS, "profile text"),
):
    if label != "boot":
        require(source.read_bytes() == deployed.read_bytes(), f"{label} mirrors differ")
    else:
        source_text = source.read_text(encoding="utf-8")
        deployed_text = deployed.read_text(encoding="utf-8")
        for marker in ("autoResumeStage715", "retired missing-money PRELUDE resume API"):
            require(marker in source_text and marker in deployed_text, f"boot mirror missing {marker}")
    subprocess.run(["node", "--check", str(source)], cwd=ROOT, check=True)

for path in (DATA, DATA_DOCS, PROFILE, PROFILE_DOCS):
    text = path.read_text(encoding="utf-8")
    require(text.count("Асинхрония") >= 5, f"{path} does not expose all five canonical profile titles")
    require('start_title: "Asynchronia"' not in text, f"stale visible title in {path}")

stage_text = STAGE.read_text(encoding="utf-8")
boot_text = BOOT.read_text(encoding="utf-8")
require('text: "здарова)"' in stage_text, "Oleg intro is not exact canonical text")
require('text: "Здарова"' not in stage_text, "obsolete Oleg intro remains")
require("hasPersistedCheckpoint" in stage_text, "Stage 7.15 persistence probe missing")
require("autoResumeStage715" in boot_text, "ordinary boot auto-resume missing")
require("retired missing-money PRELUDE resume API" in boot_text, "PRELUDE guard missing from boot")
resume_route = boot_text[boot_text.index("if (resumeMode"):boot_text.index("if (S.flags.started")]
require(resume_route.index("retired missing-money PRELUDE resume API") < resume_route.index("firstExperience.claimResume"), "canonical Stage 7.15 route can still fall through to PRELUDE")

node_test = r'''
const fs = require("fs");
const vm = require("vm");
const assert = require("assert");
const source = fs.readFileSync("AsyncScene/Web/ui/ui-stage7-first-experience.js", "utf8");
const storage = new Map();

function runtime(state) {
  const localStorage = {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(key, String(value)); },
    removeItem(key) { storage.delete(key); },
  };
  const document = { addEventListener() {}, getElementById() { return null; }, querySelector() { return null; } };
  const UI = {
    S: state,
    renderAll() {}, requestRenderAll() {}, renderEvents() {}, renderBattles() {},
    ensurePanelExpanded() {}, ensureEventsExpanded() {}, setPanelSize() {},
    pushChat(entry) { state.chat = state.chat || []; state.chat.push(entry); },
    pushSystem() {}, sendChat() {},
  };
  const Game = { __S: state, UI, Data: { START_POINTS_NPC: 10, t: () => "Споры" }, Telemetry: { action() {} }, __A: { syncMeToPlayers() {} } };
  const window = { Game, localStorage, document, location: { search: "" }, URLSearchParams, setTimeout, clearTimeout, setInterval, clearInterval };
  window.window = window;
  const context = { window, document, URLSearchParams, setTimeout, clearTimeout, setInterval, clearInterval, console };
  vm.runInNewContext(source, context);
  return { state, UI, Game };
}

const active = {
  flags: { stage715Demo: true, stage715DemoPhase: "battle_unlocked" },
  me: { id: "me", name: "Тестер", points: 0, wins: 0 },
  rep: 1,
  players: { npc_stage7_ken: { id: "npc_stage7_ken", name: "Райхан", npc: true, role: "crowd", points: 10 } },
  battles: [{ id: "stage7_15_first_battle", status: "pickDefense", resolved: false, finished: false,
    opponentId: "npc_stage7_ken", meta: { stage715BattleId: "stage7_15_first_battle", stage715RayhanScripted: true },
    attack: { text: "Извините, кто тут дерзкий?? Выберите ответ быстренько!", group: "who" },
    _defenseChoices: [{ id: "canon_who", group: "who", stage715DisplayText: "Похоже, ты…" }] }],
  events: [], chat: [{ name: "Райхан", text: "всем привет в этом чатике!" }],
};
const first = runtime(active);
assert.strictEqual(first.Game.Stage715Demo.claimResume({ state: active, UI: first.UI, playerName: "Тестер" }).claimed, true);
assert(storage.has("AsyncScene_stage715_gameplay_v1"), "checkpoint was not persisted");
const savedBattleCount = active.battles.length;
const reloadedState = { flags: {}, me: {}, players: {}, battles: [], events: [], chat: [] };
const second = runtime(reloadedState);
assert.strictEqual(second.Game.Stage715Demo.hasPersistedCheckpoint(), true, "persisted checkpoint was not detected");
assert.strictEqual(second.Game.Stage715Demo.claimResume({ state: reloadedState, UI: second.UI, playerName: "Тестер" }).claimed, true);
assert.strictEqual(reloadedState.flags.stage715DemoPhase, "battle_unlocked", "phase changed during ordinary reload");
assert.strictEqual(reloadedState.battles.length, savedBattleCount, "reload duplicated or lost the active battle");
assert.strictEqual(reloadedState.battles[0].status, "pickDefense", "defense-waiting state was not preserved");
assert.strictEqual(reloadedState.chat.length, 1, "reload duplicated NPC chat");

console.log("PASS_STAGE7_15_RELOAD_RESUME_AND_PRELUDE_GUARD");
'''
subprocess.run(["node", "-e", node_test], cwd=ROOT, check=True)
print("PASS_STAGE7_15_RELOAD_RESUME_CONTRACT")
