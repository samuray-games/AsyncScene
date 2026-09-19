from pathlib import Path
import subprocess


ROOT = Path(__file__).resolve().parents[1]
STAGE = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js"
STAGE_DOCS = ROOT / "docs/ui/ui-stage7-first-experience.js"
BATTLES = ROOT / "AsyncScene/Web/ui/ui-battles.js"
BATTLES_DOCS = ROOT / "docs/ui/ui-battles.js"
API = ROOT / "AsyncScene/Web/conflict/conflict-api.js"
API_DOCS = ROOT / "docs/conflict/conflict-api.js"
CORE = ROOT / "AsyncScene/Web/conflict/conflict-core.js"
CORE_DOCS = ROOT / "docs/conflict/conflict-core.js"
ECONOMY = ROOT / "AsyncScene/Web/conflict/conflict-economy.js"
STATE = ROOT / "AsyncScene/Web/state.js"
STATE_DOCS = ROOT / "docs/state.js"


def require(condition, message):
    if not condition:
        raise AssertionError(message)


require(STAGE.read_bytes() == STAGE_DOCS.read_bytes(), "Stage 7.15 controller mirrors differ")
require(BATTLES.read_bytes() == BATTLES_DOCS.read_bytes(), "Battles UI mirrors differ")
for path in (STAGE, STAGE_DOCS, BATTLES, BATTLES_DOCS, API, API_DOCS, CORE, CORE_DOCS, STATE, STATE_DOCS):
    subprocess.run(["node", "--check", str(path)], cwd=ROOT, check=True)

stage = STAGE.read_text(encoding="utf-8")
battles = BATTLES.read_text(encoding="utf-8")
api = API.read_text(encoding="utf-8")
api_docs = API_DOCS.read_text(encoding="utf-8")
core = CORE.read_text(encoding="utf-8")
core_docs = CORE_DOCS.read_text(encoding="utf-8")
economy = ECONOMY.read_text(encoding="utf-8")
state = STATE.read_text(encoding="utf-8")
state_docs = STATE_DOCS.read_text(encoding="utf-8")

for text in (
    'meta && meta.suppressStatDelta === true',
    'emitStatDelta("rep", afterRep - beforeRep',
    'emitStatDelta("influence", afterInfluence - beforeInfluence',
):
    require(text in state and text in state_docs, f"missing mirrored transferRep suppression contract: {text}")

for source in (state, state_docs):
    start = source.index('if (!(meta && meta.suppressStatDelta === true))')
    end = source.index('success = true;', start)
    section = source[start:end]
    require(section.count('emitStatDelta(') == 2, "silent transfer must suppress both REP and influence deltas")

for text in (
    'const FIRST_INDEPENDENT_BATTLE_TARGET_ID = "npc_weak"',
    'const OLEG_FIRST_INDEPENDENT_BATTLE_LINE = "ладно я сегодня добрый',
    'OLEG_FIRST_INDEPENDENT_BATTLE_LINE.replace("{battlePanel}", label)',
    'state.flags.stage715OlegEscapeSuccessDmSent === true',
    'state.flags.stage715FirstIndependentBattleInstructionSent !== true',
    'pushOlegEscapeDm(instruction, "stage715FirstIndependentBattleInstructionSent")',
    'function isFirstIndependentBattleReady(state)',
    'function firstIndependentBattleStartOptions',
    'function firstIndependentBattleStarted',
    'function settleFirstIndependentBattleCompletion()',
    'stage715FirstIndependentBattleComplete = true',
    'safeArgumentRelation: {',
    'attackColor: "r"',
    'defenseColor: "y"',
    'const STAGE715_INITIAL_REP_BASELINE = 1',
    'function initializeStage715InitialRepBaseline(state, mode)',
    'state.flags.stage715InitialRepBaselineApplied === true',
    'transferRep("crowd_pool", "me", STAGE715_INITIAL_REP_BASELINE - currentRep',
    '"rep_stage715_initial_baseline", STAGE715_INITIAL_REP_BASELINE_ID',
    'context: "stage715_initial_rep_baseline"',
    'suppressStatDelta: true',
    'initializeStage715InitialRepBaseline(state, mode);',
):
    require(text in stage, f"missing first independent battle controller contract: {text}")

require(stage.count('pushOlegEscapeDm(instruction, "stage715FirstIndependentBattleInstructionSent")') == 1,
        "instruction DM must have one controller emission site")
require('stage715OlegFlowComplete === true' not in stage[stage.index('isChallengeButtonAvailable:'):],
        "challenge availability must not use the pre-escape Oleg completion flag")
require('баттлы/споры/итд' not in stage and '(в зависимости' not in stage,
        "player-facing instruction must not expose authoring placeholders")

for text in (
    'firstIndependentBattleStartOptions({ opponentId: cid, state: S, UI })',
    'Game.Conflict.start(cid, startOptions || undefined)',
    'Game.Conflict.startWith(cid, startOptions || undefined)',
    'firstIndependentBattleStarted({ opponentId: cid, battle: res.battle || null, state: S, UI })',
    'it.textContent = (UI.displayName ? UI.displayName(p) : String(p.name || ""))',
):
    require(text in battles, f"missing Battles UI metadata/stat-free picker contract: {text}")

for text in (
    'startWith(opponentId, opts)',
    'const battleMeta = opts && opts.battleMeta',
    'b.meta = Object.assign({}, b.meta || {}, battleMeta)',
    'function safeArgumentRelation(battle)',
    'function withSafeTone(argument, tone)',
    'battle.attack = withSafeTone(battle.attack, safeRelation.attackColor)',
    'const safeCandidates = safeRelation',
    'normalizeSafeTone(entry && (entry.color || entry._color)) === safeRelation.defenseColor',
    'Core.resolveBattleOutcome(b.id, defensePicked)',
):
    require(text in api and text in api_docs, f"missing mirrored generic API contract: {text}")

safe_section = api[api.index('const safeRelation = safeArgumentRelation(battle);'):api.index('// Schedule simulated opponent response.')]
require('forceOutcome' not in safe_section, "safe metadata must not bypass the resolver with a forced outcome")
require('transferRep(' not in api, "Conflict API must not perform recovery REP transfers")
require('transferRep("crowd_pool", "me", repGain, "rep_battle_win_delta"' in economy,
        "canonical +2 REP settlement branch must remain the owner")

for text in (
    "function applyEconomyForOutcome(outcome, battle)",
    "attack: b.attack || null",
    "defense: b.defense || null",
):
    require(text in core and text in core_docs, f"missing mirrored Core settlement-context propagation: {text}")

core_handoff = core[core.index("function applyEconomyForOutcome(outcome, battle)"):core.index("function getBattleCrowdPoolId", core.index("function applyEconomyForOutcome(outcome, battle)"))]
require("attack: b.attack || null" in core_handoff and "defense: b.defense || null" in core_handoff,
        "Core economy payload must preserve only resolved attack/defense context")

node = r'''
const fs = require("fs");
const assert = require("assert");
const core = fs.readFileSync("AsyncScene/Web/conflict/conflict-core.js", "utf8");
const economy = fs.readFileSync("AsyncScene/Web/conflict/conflict-economy.js", "utf8");

function extractFunction(source, marker) {
  const start = source.indexOf(marker);
  assert(start >= 0, `${marker} not found`);
  let depth = 0;
  for (let i = source.indexOf("{", start); i < source.length; i += 1) {
    if (source[i] === "{") depth += 1;
    if (source[i] === "}" && --depth === 0) return source.slice(start, i + 1);
  }
  throw new Error(`${marker} end not found`);
}

const applySource = extractFunction(core, "function applyEconomyForOutcome(outcome, battle)");
let payload = null;
const Game = { _ConflictEconomy: { applyResult: (battle) => { payload = battle; } } };
const apply = Function("Game", "getRole", `return (${applySource});`)(Game, () => "crowd");
const attack = { id: "attack_r", color: "r" };
const defense = { id: "defense_y", color: "y" };
apply("win", { id: "battle-safe", opponentId: "npc_weak", attack, defense, status: "finished" });
assert(payload, "Core must call the existing economy");
assert.strictEqual(payload.attack, attack, "Core must preserve the resolved attack");
assert.strictEqual(payload.defense, defense, "Core must preserve the resolved defense");

const deltaSource = extractFunction(economy, "function getToneDelta(battle)");
const getToneDelta = Function(`return (${deltaSource});`)();
assert.strictEqual(getToneDelta(payload), -2, "existing settlement must receive r/y as delta -2");
assert.strictEqual(getToneDelta({ result: "win" }), 0, "existing missing-argument fallback remains y/y");
console.log("PASS_CORE_ECONOMY_CONTEXT_PROPAGATION");
'''
subprocess.run(["node", "-e", node], cwd=ROOT, check=True)

for text in (
    "function isFirstEventEligible(state = stateFor())",
    "state.flags.stage715FirstIndependentBattleComplete === true",
    "isFirstEventEligible,",
):
    require(text in stage, f"missing M81 unlock contract: {text}")
for forbidden in (
    "stage715FirstEventUnlocked",
    "stage715FirstEventUnlockBattleId",
    "stage715_first_event_unlocked",
):
    require(forbidden not in stage, f"M81 added redundant persisted truth: {forbidden}")

m81_node = r'''
const assert = require("assert");
const source = process.env.M81_SOURCE;

function extractFunction(sourceText, marker) {
  const start = sourceText.indexOf(marker);
  assert(start >= 0, `${marker} not found`);
  const brace = sourceText.indexOf("{", start);
  let depth = 0;
  for (let index = brace; index < sourceText.length; index += 1) {
    if (sourceText[index] === "{") depth += 1;
    if (sourceText[index] === "}" && --depth === 0) return sourceText.slice(start, index + 1);
  }
  throw new Error(`unterminated function: ${marker}`);
}

const state = {
  flags: { stage715FirstIndependentBattleStarted: true, stage715FirstIndependentBattleId: "first-win" },
  battles: [],
  events: [{ id: "existing-event" }],
  cards: [{ id: "existing-card" }],
  content: ["existing-content"],
  me: { money: 10, rep: 1, wins: 0 },
};
const battleOutcome = Function(`return (${extractFunction(source, "function battleOutcome(battle)")});`)();
let saves = 0;
let renders = 0;
let systemMessages = [];
let eventReveals = 0;
const telemetry = [];
const stateFor = () => state;
const saveState = () => { saves += 1; };
const render = () => { renders += 1; };
const firstIndependentBattleFromState = Function(
  "stateFor",
  `return (${extractFunction(source, "function firstIndependentBattleFromState()")});`,
)(stateFor);
const settle = Function(
  "G",
  "stateFor",
  "firstIndependentBattleFromState",
  "battleOutcome",
  "saveState",
  "revealEventsPanel",
  "telemetry",
  "render",
  `return (${extractFunction(source, "function settleFirstIndependentBattleCompletion()")});`,
)(
  { UI: { pushSystem: (message) => systemMessages.push(message) } },
  stateFor,
  firstIndependentBattleFromState,
  battleOutcome,
  saveState,
  () => { eventReveals += 1; },
  (type, payload) => telemetry.push({ type, payload }),
  render,
);
const eligible = Function(
  "stateFor",
  `return (${extractFunction(source, "function isFirstEventEligible(state = stateFor())")});`,
)(stateFor);

function resetBattle(battle) {
  state.flags = { stage715FirstIndependentBattleStarted: true, stage715FirstIndependentBattleId: battle && battle.id || "first-win" };
  state.battles = battle ? [battle] : [];
  saves = 0;
  renders = 0;
  systemMessages = [];
  eventReveals = 0;
  telemetry.length = 0;
}

resetBattle({ id: "started", meta: { stage715FirstIndependentBattle: true }, status: "active" });
assert.strictEqual(eligible(), false, "starting the independent battle must remain locked");
assert.strictEqual(settle(), false, "incomplete battle must not unlock");
assert.strictEqual(saves, 0, "incomplete battle must not save completion");

for (const battle of [
  { id: "loss", meta: { stage715FirstIndependentBattle: true }, result: "lose" },
  { id: "interrupted", meta: { stage715FirstIndependentBattle: true }, result: "interrupted" },
  { id: "unfinished", meta: { stage715FirstIndependentBattle: true }, status: "finished", resolved: false },
  { id: "scripted", meta: { stage715DemoBattle: true }, result: "win" },
  { id: "unrelated", meta: { otherBattle: true }, result: "win" },
]) {
  resetBattle(battle);
  assert.strictEqual(eligible(), false, `${battle.id} must remain locked`);
  assert.strictEqual(settle(), false, `${battle.id} must not unlock`);
  assert.strictEqual(saves, 0, `${battle.id} must not save completion`);
}

resetBattle({ id: "first-win", meta: { stage715FirstIndependentBattle: true }, result: "win" });
const beforeProtected = JSON.stringify({ events: state.events, cards: state.cards, content: state.content, me: state.me });
assert.strictEqual(eligible(), false, "First Event must be locked before the qualifying win");
assert.strictEqual(settle(), true, "qualifying first-independent WIN must complete");
assert.strictEqual(eligible(), true, "qualifying first-independent WIN must make First Event eligible");
assert.strictEqual(state.flags.stage715FirstIndependentBattleComplete, true, "authoritative completion flag missing");
assert.strictEqual(state.battles[0].meta.stage715FirstIndependentBattleComplete, true, "battle completion marker missing");
assert.strictEqual(saves, 1, "qualifying completion must persist once");
assert.deepStrictEqual(systemMessages, ["У нас тут стычка!!! Выбери за кого ты в событиях. Участие стоит 1💰 плюс репутация за смелость."], "qualifying completion must announce First Event canonically");
assert.strictEqual(eventReveals, 1, "qualifying completion must reveal Events once");
assert.strictEqual(JSON.stringify({ events: state.events, cards: state.cards, content: state.content, me: state.me }), beforeProtected, "M81 changed event/content/economy state");
assert.strictEqual(telemetry.length, 1, "qualifying completion telemetry must be exactly once");
const afterFirstCheck = JSON.stringify(state);
assert.strictEqual(settle(), true, "completion re-check must be idempotent");
assert.strictEqual(JSON.stringify(state), afterFirstCheck, "completion re-check mutated state");
assert.strictEqual(saves, 1, "completion re-check must not save again");
assert.strictEqual(renders, 1, "completion re-check must not render again");
assert.strictEqual(eventReveals, 1, "completion re-check must not reveal Events again");
assert.strictEqual(telemetry.length, 1, "completion re-check must not emit telemetry again");
assert.strictEqual(eligible(), true, "eligibility query must remain deterministic");
console.log("PASS_STAGE7_15_81_FIRST_EVENT_UNLOCK_BEHAVIOR");
'''
subprocess.run(
    ["node", "-e", m81_node],
    cwd=ROOT,
    env={**__import__("os").environ, "M81_SOURCE": stage},
    check=True,
)

changed = subprocess.check_output(["git", "diff", "--name-only", "origin/main"], cwd=ROOT, text=True).splitlines()
for forbidden in (
    "AsyncScene/Web/conflict/conflict-economy.js",
    "docs/conflict/conflict-economy.js",
    "AsyncScene/Web/npcs.js",
    "docs/npcs.js",
    "AsyncScene/Web/ui/ui-core.js",
    "docs/ui/ui-core.js",
):
    require(forbidden not in changed, f"out-of-scope mutation: {forbidden}")

print("PASS_STAGE7_15_32_FIRST_INDEPENDENT_BATTLE_CONTRACT")
