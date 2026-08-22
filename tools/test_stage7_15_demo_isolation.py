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


require(STAGE.read_bytes() == STAGE_DOCS.read_bytes(), "Stage715Demo controller mirrors differ")
require(BATTLES.read_bytes() == BATTLES_DOCS.read_bytes(), "battle UI mirrors differ")
for path in (STAGE, STAGE_DOCS, BATTLES, BATTLES_DOCS):
    subprocess.run(["node", "--check", str(path)], cwd=ROOT, check=True)

stage = STAGE.read_text(encoding="utf-8")
battles = BATTLES.read_text(encoding="utf-8")
demo = stage[stage.index("// Stage 7.15 zero-tutorial demo") :]
unlock = demo[demo.index("function unlockFirstBattle()") : demo.index("function watchFirstBattle()")]

for marker in (
    "const NPC_TYPING_MIN_MS = 1100",
    "const NPC_TYPING_MAX_MS = 2800",
    "function npcTypingDelayMs(text)",
    "function setNpcTyping(entry)",
    "context.onTyping",
    "function withDemoChatIsolation(callback)",
    "handleRayhanDefenseChoice",
    "state.flags.stage715OlegFlowComplete = true",
    "const RAYHAN_BATTLE_CHOICES",
    "Похоже, ты…",
    "Кажется, прямо тут…",
    "Наверное, да…",
):
    require(marker in demo, f"missing demo isolation contract: {marker}")

require("привет, ${playerName}" not in demo, "Rayhan duplicate first response remains")
require('conflict.incoming("npc_stage7_ken"' not in unlock, "Rayhan demo battle still uses normal conflict incoming")
require('prepareNastyaDefenseChoices(battle)' not in unlock, "Rayhan demo battle still derives random defense choices")
require('pushNpc({ speakerId: "npc_stage7_ken", name: "Райхан", text: "Извините, кто тут дерзкий??" })' not in unlock,
        "Rayhan challenge is duplicated into chat")
require('attackHidden: true' in demo, "Rayhan battle color is not hidden on creation")

for marker in (
    "stage715DemoActive ? \"Вызвать\"",
    "stage715InviteAvailable",
    "isChallengeButtonAvailable",
    "stage715DemoController.handleRayhanDefenseChoice",
    "const stage715RayhanDemo = isStage715RayhanScriptedBattle(b)",
):
    require(marker in battles, f"missing demo battle UI isolation contract: {marker}")

changed = subprocess.check_output(["git", "diff", "--name-only", "origin/main"], cwd=ROOT, text=True).splitlines()
allowed = {
    "AsyncScene/Web/ui/ui-stage7-first-experience.js",
    "AsyncScene/Web/ui/ui-battles.js",
    "docs/ui/ui-stage7-first-experience.js",
    "docs/ui/ui-battles.js",
    "tools/test_stage7_15_demo_isolation.py",
    "tools/test_stage7_15_safari_corridor.py",
    "tools/test_stage7_15_tone_first_battle.py",
    "tools/test_stage7_15_21_nastya_battle.py",
    "tools/test_stage7_15_30_oleg_dm.py",
    "tools/test_stage7_15_31_escape_bribe.py",
    "tools/test_stage7_15_50_progressive_disclosure.py",
}
require(set(changed) <= allowed, f"scope widened: {sorted(set(changed) - allowed)}")

print("PASS_STAGE7_15_DEMO_ISOLATION")
