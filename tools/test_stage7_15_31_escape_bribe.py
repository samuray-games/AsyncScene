from pathlib import Path
import subprocess


ROOT = Path(__file__).resolve().parents[1]
STAGE_SOURCE = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js"
STAGE_DOCS = ROOT / "docs/ui/ui-stage7-first-experience.js"
BATTLE_SOURCE = ROOT / "AsyncScene/Web/ui/ui-battles.js"
BATTLE_DOCS = ROOT / "docs/ui/ui-battles.js"
CORE_SOURCE = ROOT / "AsyncScene/Web/conflict/conflict-core.js"
CORE_DOCS = ROOT / "docs/conflict/conflict-core.js"
INDEX_SOURCE = ROOT / "AsyncScene/Web/index.html"
INDEX_DOCS = ROOT / "docs/index.html"


def require(condition, message):
    if not condition:
        raise AssertionError(message)


for source, deployed, label in (
    (STAGE_SOURCE, STAGE_DOCS, "Stage 7.15 controller"),
    (BATTLE_SOURCE, BATTLE_DOCS, "battle UI"),
    (CORE_SOURCE, CORE_DOCS, "Conflict Core"),
):
    require(source.read_bytes() == deployed.read_bytes(), f"{label} mirrors differ")
    subprocess.run(["node", "--check", str(source)], cwd=ROOT, check=True)
    subprocess.run(["node", "--check", str(deployed)], cwd=ROOT, check=True)

stage = STAGE_SOURCE.read_text(encoding="utf-8")
battle = BATTLE_SOURCE.read_text(encoding="utf-8")
core = CORE_SOURCE.read_text(encoding="utf-8")
index = INDEX_SOURCE.read_text(encoding="utf-8")

require(INDEX_SOURCE.read_bytes() == INDEX_DOCS.read_bytes(), "index mirrors differ")
for text in (
    "conflict/conflict-core.js?v=stage7_15_31_escape_bribe_20260821a",
    "ui/ui-battles.js?v=stage7_15_safari_corridor_repair_20260822a",
    "ui/ui-stage7-first-experience.js?v=stage7_15_safari_corridor_repair_20260822a",
):
    require(text in index, f"missing Stage 7.15.31 cache-busted entrypoint: {text}")

for text in (
    'const OLEG_ESCAPE_BATTLE_ID = "stage7_15_oleg_escape_battle"',
    'conflict.incoming(OLEG_DM_ID, { pinned: true })',
    'stage715OlegEscape: true',
    'Core.escape(battle.id, { mode: "smyt", cost: 1 })',
    'const scriptedVotes = attempt === 1 ? { a: 2, b: 3 } : { a: 3, b: 2 }',
    'transferRep("me", "crowd_pool", 1, "rep_stage715_escape_bribe", battle.id',
    'stage715_escape_started',
    'stage715_escape_failed',
    'stage715_escape_success',
    'У ${playerName} не получилось уйти от Олега!',
    'У ${playerName} получилось уйти от Олега!',
    'слыш трусишка, кудааа, не так быстро! ладно, можешь ещё разок попробовать.',
    'трусишек не уважают, поэтому репутация понизилась',
    'У тебя получилось уйти от конфликта за взятку, все довольны.',
):
    require(text in stage, f"missing Stage 7.15.31 contract: {text}")

require(stage.count('telemetry("stage715_escape_started")') == 1, "escape started telemetry must be controller-owned once")
require(stage.count('telemetry("stage715_escape_failed")') == 1, "escape failed telemetry must be controller-owned once")
require(stage.count('telemetry("stage715_escape_success")') == 1, "escape success telemetry must be controller-owned once")
require('stage715OlegEscapeAttempts = attempt' in stage, "escape attempt count must persist in scenario state")
require('openNextScriptedFlow("escape_success")' in stage, "success must release the next scripted flow")

for text in (
    'function applyScriptedEscapeVote(b, v)',
    'const scripted = v && v.scriptedVotes;',
    'v.cap = votesA + votesB;',
    'if (applyScriptedEscapeVote(b, v))',
    'finalizeEscapeVote(b);',
):
    require(text in core, f"missing existing escape vote integration: {text}")

require('function startEscapeVote(b, mode, cost)' in core, "existing escape vote start must remain the owner")
require('function finalizeEscapeVote(b)' in core, "existing escape vote finalization must remain the owner")

for text in (
    'function isStage715OlegEscapeBattle(battle)',
    'sm.textContent = isStage715Escape ? "Уйти"',
    'demo.startOlegEscape(b.id)',
    'isStage715Escape ? "Уйти" : "Свалить"',
    'if (!isMafiaBattle && !isStage715Escape)',
):
    require(text in battle, f"missing Stage 7.15.31 UI contract: {text}")

changed = subprocess.check_output(
    ["git", "diff", "--name-only", "origin/main"], cwd=ROOT, text=True
).splitlines()
allowed = {
    "AsyncScene/Web/conflict/conflict-core.js",
    "AsyncScene/Web/ui/ui-battles.js",
    "AsyncScene/Web/ui/ui-stage7-first-experience.js",
    "docs/conflict/conflict-core.js",
    "docs/ui/ui-battles.js",
    "docs/ui/ui-stage7-first-experience.js",
    "AsyncScene/Web/index.html",
    "docs/index.html",
    "tools/test_stage7_15_31_escape_bribe.py",
    "tools/test_stage7_15_22_oleg_battle.py",
    "tools/test_stage7_15_30_oleg_dm.py",
    "tools/test_stage7_15_demo_isolation.py",
    "tools/test_stage7_15_safari_corridor.py",
    "tools/test_stage7_15_tone_first_battle.py",
    "tools/test_stage7_15_21_nastya_battle.py",
    "tools/test_stage7_15_50_progressive_disclosure.py",
}
require(set(changed) <= allowed, f"scope widened: {sorted(set(changed) - allowed)}")

print("PASS_STAGE7_15_31_ESCAPE_BRIBE_CONTRACT")
