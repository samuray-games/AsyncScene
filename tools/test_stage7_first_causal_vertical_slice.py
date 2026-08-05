#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
JS_A = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js"
JS_B = ROOT / "docs/ui/ui-stage7-first-experience.js"
CSS_A = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.css"
CSS_B = ROOT / "docs/ui/ui-stage7-first-experience.css"
INDEX_A = ROOT / "AsyncScene/Web/index.html"
INDEX_B = ROOT / "docs/index.html"
BOOT_A = ROOT / "AsyncScene/Web/ui/ui-boot.js"
BOOT_B = ROOT / "docs/ui/ui-boot.js"


def require(condition, message):
    if not condition:
        raise AssertionError(message)


require(JS_A.read_bytes() == JS_B.read_bytes(), "JS mirrors differ")
require(CSS_A.read_bytes() == CSS_B.read_bytes(), "CSS mirrors differ")
require(INDEX_A.read_bytes() == INDEX_B.read_bytes(), "index mirrors differ")
require(BOOT_A.read_bytes() == BOOT_B.read_bytes(), "boot mirrors differ")

js = JS_A.read_text(encoding="utf-8")
index = INDEX_A.read_text(encoding="utf-8")
boot = BOOT_A.read_text(encoding="utf-8")

require('const STATES = ["accusation", "answer", "reaction", "vote", "consequence", "rematch", "completed", "main_unlocked"]' in js, "state order missing")
require('const RESPONSE_IDS = ["deny", "accuse_ken", "pay"]' in js, "response IDs missing")
require('const STORAGE_KEY = "AsyncScene_first_experience_v1"' in js, "storage key missing")
require('const SCENARIO_ID = "first_experience_personal_conflict_v1"' in js, "scenario ID missing")
require(js.count('const WORLD_ADVANCE_DELAY_MS = 45_000;') == 1, "45-second constant must appear once")

for label in ("Отрицать", "Обвинить Кена", "Заплатить"):
    require(label in js, f"missing response label {label}")
for cta in ("Ответить", "Посмотреть реакцию", "Увидеть голосование", "Принять последствие", "Ответить на реванш", "Исследовать мир"):
    require(cta in js, f"missing CTA {cta}")
for line in (
    "Ты вошёл в комнату.",
    "Из общей кассы пропали деньги.",
    "Пропажу заметили ещё до появления новичка?",
    "Новичок пришёл - и деньги исчезли. Странное совпадение.",
    "Без доказательств никого не обвиняем.",
    "Это сделал ты. Деньги пропали после твоего появления.",
):
    require(line in js, f"missing prelude line: {line}")

require('transferRep("crowd_pool", "me", 2' in js, "REP settlement amount missing")
require('transferPoints("me", "sink", 3' in js, "Money settlement amount missing")
require(not re.search(r"\bS\.rep\s*=", js), "direct REP assignment forbidden")
require(not re.search(r"\bS\.me\.points\s*=", js), "direct player point assignment forbidden")
require('first_experience_settlement_v1:' in js, "settlement ID missing")
require('first_experience_world_advance_v1:' in js, "world advance ID missing")
require('worldAdvanceSettled = true' in js, "world advance settlement missing")
require('releaseNormalWorldOnce();' in js, "normal-world release missing")
require('localStorage.removeItem(STORAGE_KEY)' in js, "dev reset must target only first-experience key")
require('snapshot.preludeComplete' in js and 'panel.hidden = true' in js, "accusation must remain hidden during prelude")

require('Мир живёт дальше' in js, "freedom title missing")
require('Первый конфликт завершён. Можешь продолжить исследовать игру или заняться своими делами. Мир будет жить дальше и меняться из-за твоего выбора, даже когда тебя нет в игре. Когда вернёшься, увидишь, к чему всё привело.' in js, "freedom body mismatch")
require('Можно закрыть игру в любой момент. Всё сохранено.' in js, "freedom support mismatch")
require('Пока тебя не было...' in js, "return header missing")
require('События продолжились' in js, "foreground header missing")
for forbidden in ("window.close", "youtube.com", "location.href ="):
    require(forbidden not in js.lower(), f"forbidden exit/service action: {forbidden}")

css_ref = 'ui/ui-stage7-first-experience.css?v=stage7_first_causal_slice_20260805a'
js_ref = 'ui/ui-stage7-first-experience.js?v=stage7_first_causal_slice_20260805a'
require(css_ref in index, "CSS wiring missing")
require(js_ref in index, "JS wiring missing")
require(index.index(css_ref) > index.index('ui/ui-stage7-essence.css'), "first-experience CSS order wrong")
require(index.index(js_ref) < index.index('ui/ui-boot.js'), "controller must load before boot")
require('claimFreshStart({ UI, state: S, playerName: name, startNormalWorld })' in boot, "fresh delegation missing")
require('claimResume({ UI, state: S, playerName: name, startNormalWorld })' in boot, "resume delegation missing")
require(boot.count('let normalWorldStarted = false;') == 2, "idempotent release closures missing")

print("PASS_STAGE7_FIRST_CAUSAL_VERTICAL_SLICE")
