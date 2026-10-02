from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTROLLER = (ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js").read_text(encoding="utf-8")
BATTLES = (ROOT / "AsyncScene/Web/ui/ui-battles.js").read_text(encoding="utf-8")
MENU = (ROOT / "AsyncScene/Web/ui/ui-menu.js").read_text(encoding="utf-8")


def require(ok, message):
    if not ok:
        raise AssertionError(message)


choice = CONTROLLER[CONTROLLER.index("function handleNastyaDefenseChoice"):
                    CONTROLLER.index("function handleOlegDefenseChoice")]
require("stage715SelectedDefenseText = choice.stage715DisplayText || choice.text" in choice,
        "selected Nastya answer must retain the exact selected copy")
require("preserveStage715SelectedDefenseText(NASTYA_BATTLE_ID, choice.stage715DisplayText || choice.text" in choice,
        "selected Nastya answer must be persisted without scripted replacement")
require("preserveStage715SelectedDefenseText(NASTYA_BATTLE_ID, NASTYA_RESOLVED_COUNTERARGUMENT)" not in choice,
        "resolved scripted counterargument must not overwrite the player's answer")

vote = CONTROLLER[CONTROLLER.index("function startNastyaCrowdVote"):
                  CONTROLLER.index("function rayhanEventVoterIds")]
require("G.Events.addEvent(event)" in vote and "revealEventsPanel()" in vote,
        "Nastya crowd belongs to the visible Events history")
require("G.Conflict.startCrowdVote" not in vote and "battle.status = \"draw\"" not in vote,
        "Nastya vote must not create a Battles-owned crowd draw")
require("battle.crowd = null" in vote and "cap: 5" in vote and "scriptedVoterIds: voters" in vote,
        "battle must remain crowd-free and Events must own exactly five voters")
require("return 1000 + Math.floor(Math.random() * 1001)" in CONTROLLER,
        "each Events vote must be delayed by a random 1-2 seconds")
require("index < 3 ? \"a\" : \"b\"" in CONTROLLER
        and 'Number(event.crowd.aVotes || event.crowd.votesA || 0) !== 3' in CONTROLLER
        and 'Number(event.crowd.bVotes || event.crowd.votesB || 0) !== 2' in CONTROLLER,
        "the Events vote must resolve with player majority 3:2")
require("stage715NastyaEventResolved" in CONTROLLER and "Тебя поддержало большинство." in CONTROLLER,
        "Events resolution must settle the Nastya win through the exact system line")

nastya_final = BATTLES[BATTLES.index("if (b.meta && b.meta.stage715NastyaBattle === true && b.crowd.decided === true)"):
                       BATTLES.index("if ((b.drawResolved === true || b.crowd.decided)")]
require('finalLine.textContent = b.result === "win" ? "Победа!" : ""' in nastya_final,
        "final Nastya battle result must be a single Победа")
require('closeBtn.textContent = "Закрыть"' in nastya_final
        and 'S.battles = S.battles.filter((item) => item.id !== b.id)' in nastya_final,
        "Nastya close must remove only its battle card")
require("btn.textContent = isStage715DemoActive() ? STAGE715_GOAL_TEXT" not in MENU,
        "menu copy remains controlled by the Stage 7.15 mode-specific label path")
require("return active" in CONTROLLER[CONTROLLER.index("function isActive"):CONTROLLER.index("function clearTimers")],
        "active in-memory Stage 7.15 checkpoints must keep the canonical menu path")
phase_restore = CONTROLLER[CONTROLLER.index("function restorePhase(nextContext, mode)"):
                            CONTROLLER.index("function telemetry(actionId)")]
require('"nastya_post_win_waiting_reply"' in phase_restore,
        "post-win Nastya checkpoint must resume in place without replaying the demo intro")
require("removeResolvedNastyaBattle" in CONTROLLER and "saveState()" in CONTROLLER,
        "closing Nastya must persist the card removal across reload")

for source_path, docs_path in (
    ("AsyncScene/Web/ui/ui-stage7-first-experience.js", "docs/ui/ui-stage7-first-experience.js"),
    ("AsyncScene/Web/ui/ui-battles.js", "docs/ui/ui-battles.js"),
):
    require((ROOT / source_path).read_bytes() == (ROOT / docs_path).read_bytes(),
            f"source/docs mirror drift: {source_path}")

print("PASS_STAGE7_15_ATOM3_RUNTIME_REPAIR_CONTRACT")
