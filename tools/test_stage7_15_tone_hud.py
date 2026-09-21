from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "AsyncScene/Web/ui/ui-core.js"
DOCS = ROOT / "docs/ui/ui-core.js"


def require(condition, message):
    if not condition:
        raise AssertionError(message)


source = SOURCE.read_text(encoding="utf-8")
require(SOURCE.read_bytes() == DOCS.read_bytes(), "ui-core mirrors differ")
require("const stage715DemoActive = !!(Game.Stage715Demo" in source,
        "Stage 7.15 tone HUD gate missing")
require("dom.next.hidden = stage715DemoActive;" in source,
        "Stage 7.15 tone-delta row must be hidden")
require('dom.next.setAttribute("aria-hidden", stage715DemoActive ? "true" : "false");' in source,
        "Stage 7.15 tone-delta row accessibility state missing")
require("if (stage715DemoActive) return;" in source,
        "Stage 7.15 gate must not alter ordinary tone HUD rendering")

print("PASS_STAGE7_15_TONE_HUD_GATE")
