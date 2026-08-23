from pathlib import Path
import subprocess


ROOT = Path(__file__).resolve().parents[1]
STAGE = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js"
STAGE_DOCS = ROOT / "docs/ui/ui-stage7-first-experience.js"
BATTLES = ROOT / "AsyncScene/Web/ui/ui-battles.js"
BATTLES_DOCS = ROOT / "docs/ui/ui-battles.js"


def require(condition, message):
    if not condition:
        raise AssertionError(message)


require(STAGE.read_bytes() == STAGE_DOCS.read_bytes(), "Stage715Demo mirrors differ")
require(BATTLES.read_bytes() == BATTLES_DOCS.read_bytes(), "battle UI mirrors differ")
for path in (STAGE, STAGE_DOCS, BATTLES, BATTLES_DOCS):
    subprocess.run(["node", "--check", str(path)], cwd=ROOT, check=True)

stage = STAGE.read_text(encoding="utf-8")
battles = BATTLES.read_text(encoding="utf-8")
for marker in (
    'function revealBattlesPanel()',
    'if (typeof UI.ensurePanelExpanded === "function") UI.ensurePanelExpanded("battles")',
    'if (typeof UI.renderBattles === "function") UI.renderBattles()',
    'const battle = scriptedRayhanBattle(state)',
    'stage715RayhanScripted: true',
    'Извините, кто тут дерзкий??',
):
    require(marker in stage, f"missing Rayhan reveal transition marker: {marker}")

for marker in (
    'const stage715RayhanDemo = isStage715RayhanScriptedBattle(b)',
    'stage715DemoController.handleRayhanDefenseChoice',
    'if (!isStage715Rayhan)',
):
    require(marker in battles, f"missing Rayhan scripted battle UI guard: {marker}")

node_test = r'''
const fs = require("fs");
const vm = require("vm");
const source = fs.readFileSync("AsyncScene/Web/ui/ui-stage7-first-experience.js", "utf8");
const state = {
  flags: { stage715Demo: true, stage715DemoPhase: "tone_prompted", stage715ProgressiveDisclosureInitialized: true },
  players: {}, battles: [], chat: [], me: { id: "me", name: "Тест" },
};
const panelCalls = [];
let npcReactionCalls = 0;
const game = { __S: state, __DEV: {}, NPC: { generateReactionToMe() { npcReactionCalls += 1; } } };
const UI = {
  S: state,
  pushChat(message) {
    if (typeof game.NPC.generateReactionToMe === "function" && message && message.isMe) npcReactionCalls += 1;
    state.chat.push(message);
  },
  requestRenderAll() {},
  renderAll() {},
  renderBattles() { panelCalls.push("renderBattles"); },
  ensurePanelExpanded(key) { panelCalls.push(["ensurePanelExpanded", key]); },
  setPanelSize() {},
};
game.UI = UI;
const element = () => ({ addEventListener() {}, classList: { remove() {}, add() {} } });
const document = { getElementById(id) { return ["chatInput", "chatLog"].includes(id) ? element() : null; } };
const context = {
  window: { Game: game, document, location: { search: "" }, URLSearchParams, setTimeout, clearTimeout, setInterval, clearInterval },
  document, URLSearchParams, setTimeout, clearTimeout, setInterval, clearInterval, console,
};
context.window.window = context.window;
vm.runInNewContext(source, context);
const demo = game.Stage715Demo;
demo.claimResume({ UI, state, playerName: state.me.name });
demo.handlePlayerMessage("ответ игрока");
const battle = state.battles[0];
if (!battle || battle.meta.stage715RayhanScripted !== true) throw new Error("scripted Rayhan challenge was not created");
if (battle.attack.text !== "Извините, кто тут дерзкий??") throw new Error("challenge text mismatch");
const answerTexts = battle._defenseChoices.map((choice) => choice.text);
if (JSON.stringify(answerTexts) !== JSON.stringify(["Похоже, ты…", "Кажется, прямо тут…", "Наверное, да…"])) throw new Error("Rayhan answers mismatch");
if (answerTexts.some((text) => /Kai|Sen|Кай|Сен/.test(text))) throw new Error("random Kai/Sen answer leaked");
if (state.chat.some((message) => message.text === "Извините, кто тут дерзкий??")) throw new Error("challenge duplicated in chat");
if (!panelCalls.some((entry) => Array.isArray(entry) && entry[0] === "ensurePanelExpanded" && entry[1] === "battles")) throw new Error("Battles panel was not expanded");
if (!panelCalls.includes("renderBattles")) throw new Error("Battles panel was not rendered");
if (npcReactionCalls !== 0) throw new Error("normal NPC reaction leaked into demo transition");
demo.destroy();
console.log("PASS_STAGE7_15_RAYHAN_REVEAL_RUNTIME");
'''
subprocess.run(["node", "-e", node_test], cwd=ROOT, check=True)

changed = subprocess.check_output(["git", "diff", "--name-only", "origin/main"], cwd=ROOT, text=True).splitlines()
allowed = {
    "AsyncScene/Web/ui/ui-stage7-first-experience.js",
    "AsyncScene/Web/ui/ui-battles.js",
    "docs/ui/ui-stage7-first-experience.js",
    "docs/ui/ui-battles.js",
    "tools/test_stage7_15_rayhan_reveal.py",
}
require(set(changed) <= allowed, f"scope widened: {sorted(set(changed) - allowed)}")

print("PASS_STAGE7_15_RAYHAN_REVEAL")
