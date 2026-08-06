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


def require(condition, message):
    if not condition:
        raise AssertionError(message)


require(JS_A.read_bytes() == JS_B.read_bytes(), "Stage 7 evidence JS mirrors differ")
require(CSS_A.read_bytes() == CSS_B.read_bytes(), "Stage 7 evidence CSS mirrors differ")
require(INDEX_A.read_bytes() == INDEX_B.read_bytes(), "Stage 7 evidence index mirrors differ")

js = JS_A.read_text(encoding="utf-8")
css = CSS_A.read_text(encoding="utf-8")
index = INDEX_A.read_text(encoding="utf-8")

for token in (
    'const TEST_MODE_PARAM = "stage7test"',
    'const TEST_RUN_PARAM = "stage7testrun"',
    'const STORAGE_KEY_NORMAL = "AsyncScene_first_experience_v1"',
    'const STORAGE_KEY_TEST_PREFIX = "AsyncScene_first_experience_evidence_v1"',
    'const FIRST_ACTION_TARGET_MS = 30_000',
    'const COMPLETE_CYCLE_TARGET_MS = 180_000',
    'const COMPREHENSION_PASS_MIN = 5',
    'getStage7ObservedEvidenceReport',
    'continuationStateValid',
    'continuationStatePass',
    'presentedWorldAdvanceId',
    'smokeStage7ObservedEvidenceHarness',
):
    require(token in js, f"missing observed-evidence contract token: {token}")

for question in (
    "В чём тебя обвинили?",
    "Как ты ответил в первом раунде?",
    "Что произошло сразу после твоего ответа?",
    "Какой ресурс изменился после первого раунда?",
    "Почему начался второй раунд?",
    "Что ты решил во втором раунде?",
):
    require(question in js, f"missing evidence question: {question}")

require('settlementAppliedCount === 1' in js, "settlement exactly-once assertion missing")
require('worldAdvancePresentedCount === 1' in js, "presentation exactly-once assertion missing")
require('worldAdvanceSettledCount === 1' in js, "world settlement exactly-once assertion missing")
require('continuationStatePass' in js, "continuation-state integrity assertion missing")
require('evidence.presentedWorldAdvanceId = snapshot.worldAdvanceId' in js, "world advance identity capture missing")
require('!snapshot.worldAdvancePresented' in js, "return presentation duplicate guard missing")
require('snapshot.evidence.answersComplete = true' in js, "questionnaire completion missing")
require('snapshot.evidence.comprehensionScore' in js, "comprehension score missing")
require('snapshot.onboardingUnlocked = true' in js, "unlock after questionnaire missing")
require('snapshot.realBattleBridge = Object.assign(defaultRealBattleBridge()' in js, "post-question real battle queue missing")
require('if (TEST_MODE) {' in js and 'snapshot.evidence.finalReport = getObservedEvidenceReport();' in js, "local test report capture missing")

for forbidden in ("fetch(", "XMLHttpRequest", "sendBeacon", "WebSocket"):
    require(forbidden not in js, f"network transmission primitive forbidden: {forbidden}")

require("Stage 7.2 explicit observed-evidence test mode" in css, "observed-evidence CSS contract missing")
cache_token = "stage7_11_pay_branch_payoffs_20260806a"
require(index.count(cache_token) == 2, "expected current JS and CSS cache-buster references")
require(not re.search(r"\bS\.me\.points\s*=", js), "direct point mutation forbidden")
require(not re.search(r"\bS\.rep\s*=", js), "direct reputation mutation forbidden")

print("PASS_STAGE7_OBSERVED_EVIDENCE_HARNESS")
