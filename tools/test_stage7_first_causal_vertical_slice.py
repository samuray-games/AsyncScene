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

js = JS_A.read_text(encoding="utf-8")
index = INDEX_A.read_text(encoding="utf-8")
boots = {
    "source": BOOT_A.read_text(encoding="utf-8"),
    "docs": BOOT_B.read_text(encoding="utf-8"),
}

require('const ONBOARDING_FLOW_VERSION = 3' in js, "onboarding flow version missing")
require('const STATES = ["accusation", "answer", "reaction", "vote", "consequence", "rematch", "intermission", "round_two", "round_two_result", "questionnaire", "main_unlocked"]' in js, "current state order missing")
require('const RESPONSE_IDS = ["deny", "accuse_ken", "pay"]' in js, "response IDs missing")
require('const STORAGE_KEY_NORMAL = "AsyncScene_first_experience_v1"' in js, "storage key missing")
require('const SCENARIO_ID = "first_experience_personal_conflict_v1"' in js, "scenario ID missing")
require(js.count('const WORLD_ADVANCE_DELAY_MS = 45_000;') == 1, "45-second constant must appear once")
require('const INTERMISSION_NPCS = [' in js, "three-NPC intermission missing")
require(js.count('role: "обвинитель"') == 1, "Rayhan intermission NPC missing")
require(js.count('role: "свидетель"') == 1, "Nastya intermission NPC missing")
require(js.count('role: "наблюдатель"') == 1, "Oleg intermission NPC missing")

for label in ("Отрицать", "Обвинить Райхана", "Заплатить"):
    require(label in js, f"missing response label {label}")
for cta in ("Ответить", "Посмотреть реакцию", "Увидеть голосование", "Принять последствие", "Осмотреться", "Перейти к 6 вопросам"):
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
require('transferPoints("me", "sink", 3' in js, "money settlement amount missing")
require(not re.search(r"\bS\.rep\s*=", js), "direct REP assignment forbidden")
require(not re.search(r"\bS\.me\.points\s*=", js), "direct player point assignment forbidden")
require('first_experience_settlement_v1:' in js, "settlement ID missing")
require('first_experience_world_advance_v2:' in js, "world advance ID missing")
require('worldAdvanceSettled = true' in js, "world advance settlement missing")
require('snapshot.stateId = "questionnaire"' in js, "six-question gate missing")
require('snapshot.onboardingUnlocked = true' in js, "full unlock missing")
require('releaseNormalWorldOnce();' in js, "normal-world release missing")
require('localStorage.removeItem(STORAGE_KEY)' in js, "dev reset must target only first-experience key")
require('snapshot.preludeComplete' in js and 'panel.hidden = true' in js, "accusation must remain hidden during prelude")
require('Полная игра пока закрыта.' in js, "intermission lock copy missing")
require('Если уйдёшь, второй раунд встретит тебя после возвращения.' in js, "leave-return promise missing")
require('snapshot.worldAdvancePresentationMode = mode === "return" ? "return" : "foreground"' in js, "foreground/return presentation mode missing")

require('const REAL_BATTLE_BRIDGE_ID = "stage7_first_real_argument_battle_v1"' in js, "real battle bridge ID missing")
require('conflict.incoming(REAL_BATTLE_OPPONENT_ID' in js, "real incoming argument battle missing")
require('realBattleBridgeInFlight' in js, "real battle reentrancy guard missing")
require('syncRealArgumentBattleLifecycle' in js, "real battle lifecycle closure missing")
require('bridge.status = "completed"' in js, "completed real battle state missing")

for forbidden in ("window.close", "youtube.com", "location.href =", "fetch(", "XMLHttpRequest", "sendBeacon", "WebSocket"):
    require(forbidden not in js, f"forbidden onboarding primitive: {forbidden}")

cache_token = "stage7_9_deny_evidence_payoff_20260806a"
require(index.count(cache_token) == 2, "expected current JS and CSS cache-buster references")
require(index.index(f'ui/ui-stage7-first-experience.css?v={cache_token}') > index.index('ui/ui-stage7-essence.css'), "first-experience CSS order wrong")
require(index.index(f'ui/ui-stage7-first-experience.js?v={cache_token}') < index.index('ui/ui-boot.js'), "controller must load before boot")

for label, boot in boots.items():
    require('claimFreshStart({ UI, state: S, playerName: name, startNormalWorld })' in boot, f"{label} fresh delegation missing")
    require('claimResume({ UI, state: S, playerName: name, startNormalWorld })' in boot, f"{label} resume delegation missing")
    require(boot.count('let normalWorldStarted = false;') == 2, f"{label} idempotent release closures missing")
    require(boot.count('if (UI.startLoops) UI.startLoops();') >= 2, f"{label} normal loop release missing")

print("PASS_STAGE7_FIRST_CAUSAL_VERTICAL_SLICE")
