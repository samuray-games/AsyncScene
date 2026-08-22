from pathlib import Path
import subprocess


ROOT = Path(__file__).resolve().parents[1]
STAGE_SOURCE = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js"
STAGE_DOCS = ROOT / "docs/ui/ui-stage7-first-experience.js"
DM_SOURCE = ROOT / "AsyncScene/Web/ui/ui-dm.js"
DM_DOCS = ROOT / "docs/ui/ui-dm.js"
def require(condition, message):
    if not condition:
        raise AssertionError(message)


require(STAGE_SOURCE.read_bytes() == STAGE_DOCS.read_bytes(), "Stage 7.15 controller mirrors differ")
require(DM_SOURCE.read_bytes() == DM_DOCS.read_bytes(), "DM UI mirrors differ")

for path in (STAGE_SOURCE, DM_SOURCE, STAGE_DOCS, DM_DOCS):
    subprocess.run(["node", "--check", str(path)], cwd=ROOT, check=True)

stage = STAGE_SOURCE.read_text(encoding="utf-8")
dm = DM_SOURCE.read_text(encoding="utf-8")

for text in (
    'const OLEG_DM_ID = "npc_bandit"',
    'const OLEG_PUBLIC_LOSS_LINE = "нефига лезть на взрослых дядек!',
    'const OLEG_DM_LINE = "ладно не расстраивайся, дам тебе ещё один шанс',
    '"oleg_dm"',
    'G.__A.pushDm(OLEG_DM_ID, "Олег", OLEG_DM_LINE',
    'UI.openDM(OLEG_DM_ID)',
    'stage715_oleg_dm_opened',
    'stage715_oleg_dm_replied',
    'handleOlegDmReply',
):
    require(text in stage, f"missing Oleg DM contract: {text}")

for text in (
    'isStage715OlegDmRestricted(S, withId)',
    'demo.handleOlegDmReply(text)',
    'dmSend.onclick = () =>',
    'dmExtraRow',
):
    require(text in dm, f"missing restricted DM contract: {text}")

require(stage.count('telemetry("stage715_oleg_dm_opened")') == 1, "Oleg open telemetry must be exactly once")
require(stage.count('telemetry("stage715_oleg_dm_replied")') == 1, "Oleg reply telemetry must be exactly once")
require(stage.count('telemetry("stage715_escape_option_unlocked")') == 1, "escape unlock telemetry must be exactly once")

changed = subprocess.check_output(
    ["git", "diff", "--name-only", "origin/main"],
    cwd=ROOT,
    text=True,
).splitlines()
allowed = {
    "AsyncScene/Web/ui/ui-stage7-first-experience.js",
    # TASK 7.15.22 and its focused regressions are part of this Stage 7.15 PR.
    "AsyncScene/Web/conflict/conflict-core.js",
    "docs/ui/ui-stage7-first-experience.js",
    "docs/conflict/conflict-core.js",
    "AsyncScene/Web/ui/ui-dm.js",
    "docs/ui/ui-dm.js",
    "AsyncScene/Web/ui/ui-battles.js",
    "docs/ui/ui-battles.js",
    "tools/test_stage7_15_22_oleg_battle.py",
    "tools/test_stage7_15_31_escape_bribe.py",
    "tools/test_stage7_15_30_oleg_dm.py",
}
require(set(changed) <= allowed, f"scope widened: {sorted(set(changed) - allowed)}")

print("PASS_STAGE7_15_30_OLEG_DM_CONTRACT")
