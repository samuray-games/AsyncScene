#!/usr/bin/env python3
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js"
DEPLOYED = ROOT / "docs/ui/ui-stage7-first-experience.js"


def require(condition, message):
    if not condition:
        raise AssertionError(message)


source = SOURCE.read_bytes()
deployed = DEPLOYED.read_bytes()
require(source == deployed, "Stage 7.15 controller mirrors differ")
js = source.decode("utf-8")

for text in (
    'const TONE_PROMPT = "слыш а чо как грубо?! ща выясним кто тут главный! посмотри в правый верхний угол экрана и напиши мне силу и цвет твоего тона"',
    'const TONE_ACK = "ага, вижу. значит ты вот такой. интересно..."',
    'const TONE_BATTLE_INVITE = "нефиг дерзить тут сопляк, пошли в баттлы, пообщаемся 1на1 коль не ссыш"',
    'telemetry("stage715_tone_seen")',
    'telemetry("stage715_tone_answered")',
    'telemetry("stage715_battle_unlocked")',
    'phase === "tone_prompted"',
    'const battleId = conflict.incoming("npc_stage7_ken", { pinned: true });',
    'stage715DemoBattle: true',
    'demoId: "stage7_15_first_battle"',
):
    require(text in js, f"missing Stage 7.15 contract: {text}")

require(js.count('conflict.incoming("npc_stage7_ken", { pinned: true })') == 1, "demo must create one incoming first battle")
require('if (phase === "intro") playIntro();' in js, "resume must not replay intro after a later phase")

print("PASS_STAGE7_15_TONE_FIRST_BATTLE_CONTRACT")
