#!/usr/bin/env python3
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "AsyncScene/Web"
DOCS = ROOT / "docs"


def require(condition, message):
    if not condition:
        raise AssertionError(message)


MIRROR_FILES = [
    "index.html",
    "style-base.css",
    "ui/ui-core.js",
    "ui/ui-dm.js",
    "ui/ui-events.js",
    "ui/ui-profile-visual-tone-repair.js",
    "ui/ui-stage7-first-experience.css",
    "ui/ui-stage7-first-experience.js",
    "ui/ui-stage7-personalization.js",
]
for relative in MIRROR_FILES:
    source = SOURCE / relative
    docs = DOCS / relative
    require(source.read_bytes() == docs.read_bytes(), f"source/docs mirror mismatch: {relative}")

stage7 = (SOURCE / "ui/ui-stage7-first-experience.js").read_text(encoding="utf-8")
personalization = (SOURCE / "ui/ui-stage7-personalization.js").read_text(encoding="utf-8")
tone = (SOURCE / "ui/ui-profile-visual-tone-repair.js").read_text(encoding="utf-8")
core = (SOURCE / "ui/ui-core.js").read_text(encoding="utf-8")
dm = (SOURCE / "ui/ui-dm.js").read_text(encoding="utf-8")
events = (SOURCE / "ui/ui-events.js").read_text(encoding="utf-8")
css = (SOURCE / "style-base.css").read_text(encoding="utf-8")
index = (SOURCE / "index.html").read_text(encoding="utf-8")

for line in (
    "Из общей кассы пропали деньги!!!",
    "Пропажу заметили ещё до появления новичка!",
    "Новичок пришёл - и деньги исчезли, странное совпадение",
    "Без доказательств никого не обвиняем!",
    "это сделал ты!!! деньги пропали после твоего появления!",
):
    require(line in stage7, f"punctuation copy missing: {line}")

require("Реакция комнаты" in stage7, "room reaction heading missing")
require("Продолжить" in stage7, "natural consequence CTA missing")
require("До второго раунда можно осмотреться и узнать об участниках." in stage7, "pre-round copy missing")
require("Можно узнать об участниках, подождать Райхана или отлучиться по своим делам." in stage7, "intermission copy missing")
require("До второго раунда примерно 32 сек." not in stage7, "countdown copy remains")
require("Это второй и последний учебный раунд перед проверкой понимания." not in stage7, "AI-ish round copy remains")
require("Вопросы по ситуации" in stage7, "comprehension heading missing")
require("Перейти к вопросам" in stage7, "question CTA missing")
require("После вопросов откроется полная игра" not in stage7, "post-question support copy remains")
require("Ответ не останавливает прохождение" not in stage7, "questionnaire support copy remains")
require("Игра открыта. Личка не откроется сама после обновления страницы." not in stage7, "post-battle DM support copy remains")

require("deltaName" in tone and "namedDeltaText" in tone, "verbal delta labels missing")
require("Баланс" in tone and "Репутация" in tone, "balance/rep delta names missing")
require("bindDeltaChipTaps" in tone, "mobile delta tap binding missing")
require('[data-profile-stat="${kind}"]' in tone and '"rep", "points"' in tone, "rep/points tap targets missing")
require("UI.isDevBalanceEnabled = isDevBalanceEnabled" in core, "devmode visibility hook missing")
require("dev-balance-visible" in core and "dev-balance-visible" in css, "devmode influence visibility class missing")
require('RESERVED_SYSTEM_DM_IDS = new Set(["security_owner"])' in dm, "security service reservation missing")
require("isHiddenSystemDmId" in dm and "!UI.isDevBalanceEnabled()" in dm, "security service devmode gate missing")
require("devInfluencePill" in dm and "influenceLabel" in events, "influence labels are not devmode-gated")

require(index.count("stage7_cosmetic_cleanup_20260808a") >= 2, "cosmetic cache-buster missing")
print("PASS_STAGE7_COSMETIC_CLEANUP")
