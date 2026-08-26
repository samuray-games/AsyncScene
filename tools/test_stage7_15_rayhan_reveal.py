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
    'const result = unlockFirstBattle()',
    'function currentBattlesPanelLabel()',
    'rayhanBattleInviteText()',
    'stage715RayhanScripted: true',
    'Извините, кто тут дерзкий??',
):
    require(marker in stage, f"missing Rayhan reveal transition marker: {marker}")

for marker in (
    'const stage715RayhanDemo = isStage715RayhanScriptedBattle(b)',
    'stage715DemoController.handleRayhanDefenseChoice',
    'if (!isStage715Rayhan)',
    'traceStage715RayhanDom("render-start"',
    'document.querySelector("#battlesBody")',
    'battlesBodyInnerHTMLLength',
    'battlesBodyChildrenLength',
    'traceStage715RayhanDom("card-appended"',
    'traceStage715RayhanDom("render-complete"',
):
    require(marker in battles, f"missing Rayhan scripted battle UI guard: {marker}")

invite_guard = battles.split('if (!stage715InviteAvailable)', 1)[1].split('const inviteRow', 1)[0]
require('S.battles.length === 0' in invite_guard, "invite guard does not distinguish empty and populated battle lists")
require('traceStage715RayhanDom("invite-guard-with-battles"' in invite_guard, "populated battle list does not continue past invite guard")
require('return;' in invite_guard, "empty invite guard no longer exits after rendering the empty hint")
require('sortedBattles().forEach(b =>' in battles, "battle card loop missing after invite guard")

node_test = r'''
const fs = require("fs");
const vm = require("vm");
const source = fs.readFileSync("AsyncScene/Web/ui/ui-stage7-first-experience.js", "utf8");
const state = {
  flags: { stage715Demo: true, stage715DemoPhase: "tone_prompted", stage715ProgressiveDisclosureInitialized: true },
  players: {}, battles: [], chat: [], me: { id: "me", name: "Тест" },
};
const scriptState = JSON.parse(JSON.stringify(state));
const shadowState = JSON.parse(JSON.stringify(state));
const renderState = JSON.parse(JSON.stringify(state));
const panelCalls = [];
let renderedCards = [];
let renderBattlesInputCount = 0;
let renderBattlesOutputCards = 0;
const pipelineTrace = [];
let npcReactionCalls = 0;
const chatMessages = [];
const battleBody = {
  innerHTML: "",
  children: [],
  classList: { add() {}, remove() {} },
  appendChild(node) { this.children.push(node); this.innerHTML += node.textContent || ""; return node; },
};
let defenseOptionCall = 0;
const game = {
  __S: state,
  __DEV: {},
  NPC: { generateReactionToMe() { npcReactionCalls += 1; } },
  Conflict: {
    myDefenseOptions() {
      defenseOptionCall += 1;
      const sequence = [
        [{ id: "canon_who", group: "who", type: "who", text: "canonical who" }],
        [{ id: "canon_yn", group: "yn", type: "yn", text: "canonical yn" }],
        [{ id: "canon_where", group: "where", type: "where", text: "canonical where" }],
      ];
      return sequence[Math.min(defenseOptionCall - 1, sequence.length - 1)];
    },
  },
};
const UI = {
  S: state,
  pushChat(message) {
    if (typeof game.NPC.generateReactionToMe === "function" && message && message.isMe) npcReactionCalls += 1;
    state.chat.push(message);
    chatMessages.push(message);
  },
  requestRenderAll() {},
  renderAll() {},
  renderBattles() {
    panelCalls.push("renderBattles");
    const queriedBody = document.querySelector("#battlesBody");
    queriedBody.innerHTML = "";
    queriedBody.children = [];
    const input = Array.isArray(game.__S.battles) ? game.__S.battles : [];
    const active = input.filter((battle) => battle && (battle.resolved !== true || (battle.crowd && battle.crowd.decided !== true)));
    renderBattlesInputCount = input.length;
    renderedCards = active.map((battle) => battle.attack && battle.attack.text).filter(Boolean);
    renderBattlesOutputCards = renderedCards.length;
    active.forEach((battle) => queriedBody.appendChild({
      className: "battleCard",
      textContent: battle.attack && battle.attack.text,
      style: { display: "flex", visibility: "visible" },
      hidden: false,
      isConnected: true,
    }));
    pipelineTrace.push({ stage: "renderBattles", stateBattles: this.S.battles.length, activeBattles: active.length, inputCount: renderBattlesInputCount, outputCards: renderBattlesOutputCards, selector: "#battlesBody", battlesBodyExists: !!queriedBody, battlesBodyInnerHTMLLength: queriedBody.innerHTML.length, battlesBodyChildrenLength: queriedBody.children.length, createdCardsVisible: queriedBody.children.every((card) => card.style.display !== "none" && card.style.visibility !== "hidden") });
  },
  ensurePanelExpanded(key) { panelCalls.push(["ensurePanelExpanded", key]); },
  setPanelSize() {},
};
const contextUI = Object.assign({}, UI, { S: shadowState });
game.__S = renderState;
game.UI = UI;
const element = () => ({ addEventListener() {}, classList: { remove() {}, add() {} } });
const document = {
  getElementById(id) { return ["chatInput", "chatLog"].includes(id) ? element() : null; },
  querySelector(selector) {
    if (selector === "#battlesBody") return battleBody;
    return selector === "#battlesHeader .battleTitleText" ? { textContent: "Споры" } : null;
  },
};
const context = {
  window: { Game: game, document, location: { search: "" }, URLSearchParams, setTimeout, clearTimeout, setInterval, clearInterval },
  document, URLSearchParams, setTimeout, clearTimeout, setInterval, clearInterval, console,
};
context.window.window = context.window;
vm.runInNewContext(source, context);
const demo = game.Stage715Demo;
demo.claimResume({ UI: contextUI, state: scriptState, playerName: state.me.name });
demo.handlePlayerMessage("ответ игрока");
if (UI.S.battles.length !== 0) throw new Error("challenge was created before final Rayhan message completed");
const waitFor = (predicate, label) => new Promise((resolve, reject) => {
  const started = Date.now();
  const poll = () => {
    if (predicate()) return resolve();
    if (Date.now() - started > 7000) return reject(new Error(`timed out waiting for ${label}`));
    setTimeout(poll, 25);
  };
  poll();
});
waitFor(() => chatMessages.some((message) => message.text === "нефиг дерзить тут сопляк, пошли в споры, пообщаемся 1на1 коль не ссыш"), "Rayhan final chat message")
  .then(() => waitFor(() => UI.S.battles.length === 1, "Rayhan scripted challenge"))
  .then(() => {
const battle = UI.S.battles[0];
if (UI.S.battles.length !== 1) throw new Error("Battles list does not contain exactly one scripted challenge");
if (game.__S.battles.length !== 1) throw new Error("render state does not contain exactly one scripted challenge");
if (!battle || battle.meta.stage715RayhanScripted !== true) throw new Error("scripted Rayhan challenge was not created");
if (battle.fromThem !== true || battle.draw !== false || battle.crowd !== null || battle.pinned !== false || battle.defense !== null) throw new Error("Rayhan challenge schema is not canonical incoming shape");
if (battle.attack.text !== "Извините, кто тут дерзкий??") throw new Error("challenge text mismatch");
const answerTexts = battle._defenseChoices.map((choice) => choice.stage715DisplayText || choice.text);
if (JSON.stringify(answerTexts) !== JSON.stringify(["Похоже, ты…", "Кажется, прямо тут…", "Наверное, да…"])) throw new Error("Rayhan answers mismatch");
if (answerTexts.some((text) => /Kai|Sen|Кай|Сен/.test(text))) throw new Error("random Kai/Sen answer leaked");
if (state.chat.some((message) => message.text === "Извините, кто тут дерзкий??")) throw new Error("challenge duplicated in chat");
if (!panelCalls.some((entry) => Array.isArray(entry) && entry[0] === "ensurePanelExpanded" && entry[1] === "battles")) throw new Error("Battles panel was not expanded");
if (!panelCalls.includes("renderBattles")) throw new Error("Battles panel was not rendered");
if (JSON.stringify(renderedCards) !== JSON.stringify(["Извините, кто тут дерзкий??"])) throw new Error("rendered challenge card mismatch");
if (renderBattlesInputCount !== 1) throw new Error(`renderBattles input count mismatch: ${renderBattlesInputCount}`);
if (renderBattlesOutputCards !== 1) throw new Error(`renderBattles output card count mismatch: ${renderBattlesOutputCards}`);
if (defenseOptionCall !== 3) throw new Error(`Rayhan defense option accumulation mismatch: ${defenseOptionCall}`);
if (!pipelineTrace.some((entry) => entry.selector === "#battlesBody" && entry.activeBattles === 1 && entry.outputCards === 1 && entry.battlesBodyExists && entry.battlesBodyInnerHTMLLength > 0 && entry.battlesBodyChildrenLength === 1 && entry.createdCardsVisible)) throw new Error(`Rayhan DOM render pipeline trace mismatch: ${JSON.stringify(pipelineTrace)}`);
console.log("STAGE715_RAYHAN_PIPELINE_TRACE", JSON.stringify(pipelineTrace));
if (scriptState.battles.length !== 0) throw new Error("challenge was stored outside the render state");
if (shadowState.battles.length !== 0) throw new Error("challenge was stored in context shadow state");
if (JSON.stringify(battle).match(/Kai|Sen|Кай|Сен|Уйти -1|Отойти/)) throw new Error("random conflict payload leaked");
if (npcReactionCalls !== 0) throw new Error("normal NPC reaction leaked into demo transition");
demo.destroy();
console.log("PASS_STAGE7_15_RAYHAN_REVEAL_RUNTIME");
  })
  .catch((error) => { console.error(error); process.exitCode = 1; });
'''
subprocess.run(["node", "-e", node_test], cwd=ROOT, check=True)

changed = subprocess.check_output(["git", "diff", "--name-only", "origin/main"], cwd=ROOT, text=True).splitlines()
changed = [path for path in changed if not path.startswith((".playwright-cli/", "output/playwright/"))]
allowed = {
    "tools/test_stage7_15_demo_isolation.py",
    "tools/test_stage7_15_30_oleg_dm.py",
    "tools/test_stage7_15_31_escape_bribe.py",
    "tools/test_stage7_15_50_progressive_disclosure.py",
    "tools/test_stage7_15_tone_first_battle.py",
    "AsyncScene/Web/ui/ui-stage7-first-experience.js",
    "AsyncScene/Web/conflict/conflict-core.js",
    "AsyncScene/Web/events.js",
    "AsyncScene/Web/ui/ui-events.js",
    "AsyncScene/Web/ui/ui-battles.js",
    "docs/ui/ui-stage7-first-experience.js",
    "docs/conflict/conflict-core.js",
    "docs/events.js",
    "docs/ui/ui-events.js",
    "docs/ui/ui-battles.js",
    "AsyncScene/Web/conflict/conflict-api.js",
    "docs/conflict/conflict-api.js",
    "AsyncScene/Web/state.js",
    "docs/state.js",
    "tools/test_stage7_15_32_first_independent_battle.py",
    "tools/test_transfer_rep_suppress_stat_delta.py",
    "AsyncScene/Web/style-base.css",
    "docs/style-base.css",
    "tools/test_stage7_15_rayhan_reveal.py",
    "tools/test_stage7_15_21_nastya_battle.py",
    "tools/test_stage7_15_demo_activation_routing.py",
    "tools/test_stage7_15_rayhan_answer_validation.py",
    "tools/test_stage7_15_rayhan_missing_group.py",
    "tools/test_stage7_15_rayhan_light_theme.py",
    "tools/test_stage7_15_safari_corridor.py",
}
require(set(changed) <= allowed, f"scope widened: {sorted(set(changed) - allowed)}")

print("PASS_STAGE7_15_RAYHAN_REVEAL")
