from pathlib import Path
import subprocess


ROOT = Path(__file__).resolve().parents[1]
STAGE = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js"
STAGE_DOCS = ROOT / "docs/ui/ui-stage7-first-experience.js"
CORE = ROOT / "AsyncScene/Web/conflict/conflict-core.js"
CORE_DOCS = ROOT / "docs/conflict/conflict-core.js"


def require(condition, message):
    if not condition:
        raise AssertionError(message)


require(STAGE.read_bytes() == STAGE_DOCS.read_bytes(), "Stage 7.15 controller mirrors differ")
require(CORE.read_bytes() == CORE_DOCS.read_bytes(), "Conflict core mirrors differ")
for path in (STAGE, STAGE_DOCS, CORE, CORE_DOCS):
    subprocess.run(["node", "--check", str(path)], cwd=ROOT, check=True)

stage = STAGE.read_text(encoding="utf-8")
core = CORE.read_text(encoding="utf-8")
for text in (
    'const OLEG_BATTLE_ID = "stage7_15_oleg_battle"',
    'const OLEG_BATTLE_LINE = "слыш ты, совсем нюх потерялся да? надо тебя на место поставить."',
    'const OLEG_BATTLE_PROMPT = "Где будем разбираться?"',
    'Возможно, там, где Подворотня…',
    'Думаю, Райхан…',
    'Кажется, нет…',
    'const OLEG_REMATCH_LINE = "ты реально решил биться до последней монеты?"',
    'stage715OlegScriptedLoss: true',
    'conflict.incoming(OLEG_DM_ID, { pinned: true })',
    'openOlegDmAfterLoss();',
    'stage715_oleg_battle_started',
    'stage715_oleg_battle_result',
    'stage715_oleg_rematch_line_shown',
):
    require(text in stage, f"missing Oleg battle contract: {text}")

for text in (
    'const stage715Oleg = !!(b.meta && b.meta.stage715OlegScriptedLoss === true)',
    'outcome = "lose"',
    'econTransfer("me", "crowd_pool", 2, "stage715_oleg_scripted_loss"',
    'transferRep("me", "crowd_pool", 2, "rep_stage715_oleg_scripted_loss"',
):
    require(text in core, f"missing scripted Oleg settlement: {text}")

print("PASS_STAGE7_15_22_OLEG_BATTLE_CONTRACT")
