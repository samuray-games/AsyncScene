#!/usr/bin/env python3
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


require(STAGE.read_bytes() == STAGE_DOCS.read_bytes(), "Stage 7.15 controller mirrors differ")
require(BATTLES.read_bytes() == BATTLES_DOCS.read_bytes(), "battle UI mirrors differ")
for path in (STAGE, STAGE_DOCS, BATTLES, BATTLES_DOCS):
    subprocess.run(["node", "--check", str(path)], cwd=ROOT, check=True)

stage = STAGE.read_text(encoding="utf-8")
battles = BATTLES.read_text(encoding="utf-8")
changed = set(subprocess.check_output(
    ["git", "diff", "--name-only", "origin/main"], cwd=ROOT, text=True
).splitlines())
allowed = {
    "AsyncScene/Web/ui/ui-stage7-first-experience.js",
    "docs/ui/ui-stage7-first-experience.js",
    "AsyncScene/Web/ui/ui-battles.js",
    "docs/ui/ui-battles.js",
    "tools/test_stage7_15_50_progressive_disclosure.py",
    "tools/test_stage7_15_demo_isolation.py",
    "tools/test_stage7_15_safari_corridor.py",
    "tools/test_stage7_15_tone_first_battle.py",
    "tools/test_stage7_15_21_nastya_battle.py",
    "tools/test_stage7_15_22_oleg_battle.py",
    "tools/test_stage7_15_30_oleg_dm.py",
    "tools/test_stage7_15_31_escape_bribe.py",
}
require(changed <= allowed, f"scope widened: {sorted(changed - allowed)}")

for text in (
    'const STAGE715_PROGRESSIVE_INIT_FLAG = "stage715ProgressiveDisclosureInitialized"',
    'UI.setPanelSize("battles", "collapsed")',
    'UI.setPanelSize("dm", "collapsed")',
    'UI.setPanelSize("events", "collapsed")',
    'UI.setEventsCollapsed(true)',
    'function revealPanelOnce(panelKey, stateFlag, telemetryId)',
    'if (state.flags[stateFlag] === true) return false',
    'function revealBattlesPanel()',
    'function revealEventsPanel()',
    'phase = "battle_unlocked";\n    revealBattlesPanel();',
    'revealPanelOnce("dm", STAGE715_DM_REVEALED_FLAG, "stage715_dm_panel_revealed")',
    'if (!alreadyOpened && typeof UI.openDM === "function") UI.openDM(OLEG_DM_ID)',
    'revealEventsPanel,',
    'shouldRevealBattleBlock,',
):
    require(text in stage, f"missing progressive disclosure contract: {text}")

require(stage.count('revealPanelOnce("battles"') == 1, "Battles reveal helper must be one-shot")
require(stage.count('revealPanelOnce("dm"') == 1, "DM reveal helper must be one-shot")
require(stage.count('revealPanelOnce("events"') == 1, "Events reveal helper must be one-shot")
watch_oleg = stage[stage.index("function watchOlegBattle"):stage.index("function settleOlegEscapeRep")]
require(watch_oleg.index('telemetry("stage715_oleg_battle_result"') < watch_oleg.index("openOlegDmAfterLoss()"), "DM cannot open before Oleg battle result")
require('!stage715Progressive && !UI._battlesInitExpanded' in battles, "ordinary battle default expansion must remain intact")
require('if (!alreadyOpened && typeof UI.openDM === "function") UI.openDM(OLEG_DM_ID);' in stage, "resume must not call Oleg openDM again")
require('setInterval(() => {' not in stage[stage.index('function revealPanelOnce'):stage.index('function focusOlegDmLine')], "panel reveal helpers must not poll")

print("PASS_STAGE7_15_50_PROGRESSIVE_DISCLOSURE")
