from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js"
DEPLOYED = ROOT / "docs/ui/ui-stage7-first-experience.js"
UI_SOURCE = ROOT / "AsyncScene/Web/ui/ui-battles.js"
UI_DEPLOYED = ROOT / "docs/ui/ui-battles.js"


def require(condition, message):
    if not condition:
        raise AssertionError(message)


controller = SOURCE.read_text(encoding="utf-8")
controller_docs = DEPLOYED.read_text(encoding="utf-8")
battles = UI_SOURCE.read_text(encoding="utf-8")
battles_docs = UI_DEPLOYED.read_text(encoding="utf-8")
require(controller == controller_docs, "controller mirror differs")
require(battles == battles_docs, "battle UI mirror differs")

ordered_controller_markers = (
    'const TONE_PROMPT =',
    'const TONE_ACK =',
    'function settleRayhanWinRewards',
    'function showNastyaAfterRayhanReply',
    'function startNastyaBattle',
    'function handleNastyaDefenseChoice',
    'function handleOlegDefenseChoice',
    'phase = "nastya_waiting_chat_reply"',
    'function startNastyaCrowdVote',
    'phase = "nastya_crowd_vote"',
    'function revealNastyaBattle',
    'function syncNastyaBattleOutcome',
)
require(all(marker in controller for marker in ordered_controller_markers),
        "canonical corridor controller markers are incomplete")

for text in (
    'const NASTYA_EXPLANATION = "Видишь, у меня аргумент оранжевый',
    'const NASTYA_RESOLVED_COUNTERARGUMENT = "Ну… да, наверное."',
    'battle.status = "stage715_resolved_answer"',
    'battle.result = null',
    'battle.meta.stage715NastyaChatReplyPending = false',
    'G.Conflict.startCrowdVote(battle.id)',
    'if (phase === "nastya_waiting_chat_reply") return true;',
    'phase === "nastya_crowd_vote"',
    'if (nastyaWon && !stage715BattleById(OLEG_BATTLE_ID)) startOlegBattle();',
    'const OLEG_BATTLE_CHOICES =',
    'Похоже, ты…',
    'Кажется, прямо тут…',
    'Наверное, да…',
    'Думаю, Олег, но это не точно…',
    'Похоже, там, где Америка…',
    'const NASTYA_REMATCH_CHOICES =',
    'text: "Кажется, Райхан…"',
    'text: "Наверное, там, где Площадь…"',
    'Возможно, там, где Подворотня…',
    'Думаю, Райхан…',
    'const displayText = choice.stage715DisplayText',
    'preserveStage715SelectedDefenseText(OLEG_BATTLE_ID, displayText)',
):
    require(text in controller, f"missing chronological corridor marker: {text}")

for text in (
    'const stage715NastyaIntermediate =',
    'suppressOutcome: stage715NastyaIntermediate',
    'helperCtx.labels = { opponent: "Аргумент", mine: "Твой контраргумент" }',
    'if (stage715NastyaIntermediate)',
):
    require(text in battles, f"missing visible Nastya checkpoint marker: {text}")

require('До скромного: 3 ⚡' not in controller, "forbidden tone-delta copy leaked into controller")
require('M83' not in controller and 'M83' not in battles, "M83 must not be introduced")
print("PASS_STAGE7_15_CANONICAL_CORRIDOR_ORDER")
