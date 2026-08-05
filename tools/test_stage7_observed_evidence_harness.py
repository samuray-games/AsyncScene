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


require(JS_A.read_bytes() == JS_B.read_bytes(), "Stage 7.2 JS mirrors differ")
require(CSS_A.read_bytes() == CSS_B.read_bytes(), "Stage 7.2 CSS mirrors differ")
require(INDEX_A.read_bytes() == INDEX_B.read_bytes(), "Stage 7.2 index mirrors differ")

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
    'const COMPREHENSION_PASS_MIN = 4',
    'getStage7ObservedEvidenceReport',
    'smokeStage7ObservedEvidenceHarness',
):
    require(token in js, f"missing Stage 7.2 contract token: {token}")

for question in (
    "В чём тебя обвинили?",
    "Как ты ответил?",
    "Что произошло сразу после твоего ответа?",
    "Какой ресурс изменился из-за решения?",
    "Почему мир изменился позже?",
    "Хочется узнать, что будет дальше?",
):
    require(question in js, f"missing evidence question: {question}")

require('settlementAppliedCount === 1' in js, "settlement exactly-once assertion missing")
require('worldAdvancePresentedCount === 1' in js, "presentation exactly-once assertion missing")
require('worldAdvanceSettledCount === 1' in js, "world settlement exactly-once assertion missing")
require('!snapshot.worldAdvancePresented' in js, "return presentation duplicate guard missing")
require('acknowledgeWorldAdvance({ deferRelease: true })' in js, "report-before-release gate missing")
require('networkTransmission: false' in js, "local-only evidence declaration missing")
for forbidden in ("fetch(", "XMLHttpRequest", "sendBeacon", "WebSocket"):
    require(forbidden not in js, f"network transmission primitive forbidden: {forbidden}")

require("Stage 7.2 explicit observed-evidence test mode" in css, "Stage 7.2 CSS missing")
require("stage7_observed_evidence_20260805c" in index, "Stage 7.2 cache buster missing")
require(index.count("stage7_observed_evidence_20260805c") == 2, "expected JS and CSS cache-buster references")
require(not re.search(r"S\.me\.points\s*=", js), "direct point mutation forbidden")
require(not re.search(r"S\.rep\s*=", js), "direct reputation mutation forbidden")

print("PASS_STAGE7_OBSERVED_EVIDENCE_HARNESS")
