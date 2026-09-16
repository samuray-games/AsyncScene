from pathlib import Path
import subprocess


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js"
DOCS = ROOT / "docs/ui/ui-stage7-first-experience.js"


def require(condition, message):
    if not condition:
        raise AssertionError(message)


require(SOURCE.read_bytes() == DOCS.read_bytes(), "Stage 7.15 controller mirrors differ")
for path in (SOURCE, DOCS):
    subprocess.run(["node", "--check", str(path)], cwd=ROOT, check=True)

source = SOURCE.read_text(encoding="utf-8")
settle_start = source.index("function settleFirstIndependentBattleCompletion()")
settle_end = source.index("function watchFirstIndependentBattle()", settle_start)
settle = source[settle_start:settle_end]

for text in (
    "function unlockFirstEventAfterIndependentBattle(state, battle)",
    "state.flags.stage715FirstEventUnlocked === true",
    "state.flags.stage715FirstEventUnlocked = true",
    "state.flags.stage715FirstEventUnlockBattleId",
    'telemetry("stage715_first_event_unlocked"',
    "function isFirstEventUnlocked(state = stateFor())",
    "isFirstEventUnlocked,",
):
    require(text in source, f"missing M81 unlock contract: {text}")

require(
    settle.index("state.flags.stage715FirstIndependentBattleComplete = true;")
    < settle.index("unlockFirstEventAfterIndependentBattle(state, battle);")
    < settle.index("saveState();"),
    "M81 unlock must follow first-battle completion and persist in the same save",
)
require(
    "battleOutcome(battle) !== \"win\"" in settle,
    "M81 unlock must remain gated by the successful first independent battle",
)
for forbidden in (
    "canonical First Event",
    "stage715FirstEventTitle",
    "stage715FirstEventChoices",
    "stage715FirstEventResolution",
    "stage715FirstEventCompleted",
):
    require(forbidden not in source, f"M81 scope leaked into later milestone: {forbidden}")

changed = subprocess.check_output(["git", "diff", "--name-only", "origin/main"], cwd=ROOT, text=True).splitlines()
require(
    set(changed) == {
        "AsyncScene/Web/ui/ui-stage7-first-experience.js",
        "docs/ui/ui-stage7-first-experience.js",
    },
    f"out-of-scope mutation: {changed}",
)
require((ROOT / "tools/test_stage7_15_81_first_event_unlock.py").exists(), "focused M81 validator missing")

print("PASS_STAGE7_15_81_FIRST_EVENT_UNLOCK_CONTRACT")
