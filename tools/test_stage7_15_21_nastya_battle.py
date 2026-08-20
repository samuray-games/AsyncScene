from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js"
DEPLOYED = ROOT / "docs/ui/ui-stage7-first-experience.js"
BATTLE_SOURCE = ROOT / "AsyncScene/Web/ui/ui-battles.js"
BATTLE_DEPLOYED = ROOT / "docs/ui/ui-battles.js"


def require(condition, message):
    if not condition:
        raise AssertionError(message)


source = SOURCE.read_bytes()
deployed = DEPLOYED.read_bytes()
battle_source = BATTLE_SOURCE.read_bytes()
battle_deployed = BATTLE_DEPLOYED.read_bytes()
require(source == deployed, "Stage 7.15 controller mirrors differ")
require(battle_source == battle_deployed, "battle UI mirrors differ")
js = source.decode("utf-8")
battle_js = battle_source.decode("utf-8")

for text in (
    'const NASTYA_PROMPT = "Ты на проблемы нарываешься?"',
    '"Так, я не поняла, это что за беспредел тут?? [ник], ты проблем захотел?"',
    '"Кажется, нет…"',
    '"Думаю, Олег, но это не точно…"',
    '"Похоже, там, где Америка…"',
    'const NASTYA_BATTLE_ID = "stage7_15_nastya_battle"',
    'stage715_nastya_battle_started',
    'stage715_nastya_battle_result',
    'conflict.incoming("npc_stage7_mika", { pinned: true })',
    'G.Conflict.startCrowdVote',
    'stage715NastyaPayoff',
    'openNextScriptedFlow("loss")',
    'stage715NastyaResultRecorded',
):
    require(text in js, f"missing Nastya contract: {text}")

for text in (
    'if (p.stage715DisplayText) return String(p.stage715DisplayText);',
    'stage715NastyaPayoff',
    'stage715-nastya-tone-revealed',
):
    require(text in battle_js, f"missing Nastya battle UI contract: {text}")

require(js.count('conflict.incoming("npc_stage7_mika", { pinned: true })') == 1, "Nastya battle must use one Conflict API start")
require(js.count('telemetry("stage715_nastya_battle_started")') == 1, "Nastya start telemetry must be exactly once")
require(js.count('telemetry("stage715_nastya_battle_result"') >= 2, "Nastya result telemetry must cover win/draw and loss")
require('battle.attack.color = trueColor;' in js, "Nastya color reveal must use the battle argument, not a fabricated result")
require('battle.result = "' not in js and "battle.result = '" not in js, "scripted flow must not simulate battle result through direct state mutation")

print("PASS_STAGE7_15_21_NASTYA_BATTLE_CONTRACT")
