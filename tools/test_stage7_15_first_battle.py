from pathlib import Path
import subprocess


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "AsyncScene/Web/ui/ui-battles.js"
DOCS = ROOT / "docs/ui/ui-battles.js"
FIRST_EXPERIENCE = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js"
FIRST_EXPERIENCE_DOCS = ROOT / "docs/ui/ui-stage7-first-experience.js"

assert SOURCE.read_bytes() == DOCS.read_bytes(), "battle UI source/docs mirror drift"
assert FIRST_EXPERIENCE.read_bytes() == FIRST_EXPERIENCE_DOCS.read_bytes(), "first-experience mirror drift"

changed = subprocess.check_output(
    ["git", "diff", "--name-only", "origin/main"],
    cwd=ROOT,
    text=True,
).splitlines()
for forbidden in (
    "AsyncScene/Web/ui/ui-boot.js",
    "AsyncScene/Web/telemetry.js",
):
    assert forbidden not in changed, f"forbidden file changed: {forbidden}"
assert "AsyncScene/Web/ui/ui-stage7-first-experience.js" not in changed
assert "docs/ui/ui-stage7-first-experience.js" not in changed

for path in (SOURCE, DOCS):
    subprocess.run(["node", "--check", str(path)], cwd=ROOT, check=True)

ui_source = SOURCE.read_text(encoding="utf-8")
for marker in (
    "isStage715DemoBattle",
    "shouldHideStage715BattleBlock",
    'battlesBlock.classList.toggle("hidden", hideStage715BattleBlock)',
    'body.classList.add("hidden")',
    'body.classList.remove("hidden")',
    'Array.isArray(b._defenseChoices)',
    'clsForColor(stage7ColorRevealed ? b.attack.color : null, !stage7ColorRevealed)',
):
    assert marker in ui_source, marker

print("STAGE7_15_FIRST_BATTLE_OK")
