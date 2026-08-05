#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC_JS = ROOT / "AsyncScene/Web/ui/ui-stage7-personalization.js"
DOCS_JS = ROOT / "docs/ui/ui-stage7-personalization.js"
SRC_INDEX = ROOT / "AsyncScene/Web/index.html"
DOCS_INDEX = ROOT / "docs/index.html"
CONTROLLER = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js"
MARKER = '<script defer src="ui/ui-stage7-personalization.js?v=stage7_4_personalization_20260805a"></script>'

source = SRC_JS.read_text(encoding="utf-8")
deployed = DOCS_JS.read_text(encoding="utf-8")
assert source == deployed, "source/docs personalization JS drift"

for index_path in (SRC_INDEX, DOCS_INDEX):
    index = index_path.read_text(encoding="utf-8")
    assert index.count(MARKER) == 1, f"missing or duplicate personalization wiring in {index_path}"
    assert index.index("ui-stage7-first-experience.js") < index.index(MARKER) < index.index("ui-boot.js"), f"wrong script order in {index_path}"

required = [
    'label.textContent = "Ник"',
    'input.id = "nameInput"',
    'input.placeholder = "Как тебя называть?"',
    '["Кен", "Райхан"]',
    '["Мика", "Настя"]',
    'players.npc_stage7_ken.name = ANTAGONIST_NAME',
    'players.npc_stage7_mika.name = MEDIATOR_NAME',
    'button[data-stage7-action="open-evidence-questionnaire"]',
    'Чтобы открыть полную игру, ответь на 6 простых, но важных вопросов.',
    'Тест Stage 7.4',
]
for token in required:
    assert token in source, f"missing Stage 7.4 contract token: {token}"

for forbidden in ("fetch(", "XMLHttpRequest", "sendBeacon", "WebSocket"):
    assert forbidden not in source, f"network API forbidden in personalization layer: {forbidden}"

controller = CONTROLLER.read_text(encoding="utf-8")
assert 'change: "Кен убедил одного человека поддержать его."' in controller
assert 'hook: "Мика просит доказательство. Сначала ответить ей или поговорить с Олегом?"' in controller
assert 'function getStartName(UI)' in (ROOT / "AsyncScene/Web/ui/ui-boot.js").read_text(encoding="utf-8")
assert 'document.getElementById("nameInput")' in (ROOT / "AsyncScene/Web/ui/ui-boot.js").read_text(encoding="utf-8")

print("STAGE7_4_PERSONALIZATION_OK")
