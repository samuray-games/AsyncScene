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
