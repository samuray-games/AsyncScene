from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "AsyncScene/Web/ui/ui-menu.js"
DOCS = ROOT / "docs/ui/ui-menu.js"


def require(condition, message):
    if not condition:
        raise AssertionError(message)


source = SOURCE.read_text(encoding="utf-8")
docs = DOCS.read_text(encoding="utf-8")
mirror_markers = [
    'const STAGE715_GOAL_TEXT = "Цель - стать значимой фигурой в этом мире: наращивать влияние, строить связи и менять расклад вокруг себя.";',
    'btn.textContent = "Цель";',
    'btn.textContent = isStage715DemoActive() ? "К старту" : t("return_to_start");',
    'btn.insertAdjacentElement("afterend", bodyEl);',
]
require(all(marker in source and marker in docs for marker in mirror_markers),
        "Stage 7.15 menu repair is not mirrored in docs")
require('const STAGE715_GOAL_TEXT = "Цель - стать значимой фигурой в этом мире: наращивать влияние, строить связи и менять расклад вокруг себя.";' in source,
        "canonical Stage 7.15 goal copy missing")
require('btn.textContent = "Цель";' in source and 'btn.textContent = isStage715DemoActive() ? "К старту"' in source,
        "Stage 7.15 menu labels missing")
require('btn.insertAdjacentElement("afterend", bodyEl);' in source,
        "Stage 7.15 goal must render inline below its button")
require('const legacyPanel = bodyEl && bodyEl.closest("#manifestPanel");' in source,
        "Stage 7.15 nested goal panel cleanup missing")
require('bodyEl.setAttribute("aria-hidden", S.flags.manifestOpen ? "false" : "true");' in source,
        "Stage 7.15 inline goal disclosure state missing")

print("PASS_STAGE7_15_MENU_INLINE_GOAL")
