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


for source, deployed, label in (
    (STAGE, STAGE_DOCS, "Stage 7.15 controller"),
    (BATTLES, BATTLES_DOCS, "battle UI"),
):
    require(source.read_bytes() == deployed.read_bytes(), f"{label} mirrors differ")
    subprocess.run(["node", "--check", str(source)], cwd=ROOT, check=True)

stage = STAGE.read_text(encoding="utf-8")
battles = BATTLES.read_text(encoding="utf-8")

for marker in (
    'const NPC_MESSAGE_GAP_MS = 900',
    'let npcQueue = []',
    'function drainNpcQueue()',
    'stage715RayhanScripted: true',
    'Извините, кто тут дерзкий??',
    'const SILENCE_TEXT = "[ник игрока] слыш а ты чо не здороваешься!?"',
    'function watchFirstBattle()',
    'phase = "nastya_prompt"',
):
    require(marker in stage, f"missing Safari corridor contract: {marker}")

require('const battleId = conflict.incoming("npc_stage7_ken", { pinned: true });' in stage,
        "controller must retain canonical battle creation entrypoint")
require('stage715RayhanScripted' in battles and 'if (!isStage715Rayhan)' in battles,
        "scripted Rayhan battle must suppress ordinary battle controls")
require('`пошли в ${stage715BattleBlockName()}`' in battles,
        "battle invite text must derive from the current block title")
require('speakerId: null' in stage,
        "Stage 7.15 scripted bubbles must not carry DM speaker identity")

print("PASS_STAGE7_15_SAFARI_CORRIDOR")
