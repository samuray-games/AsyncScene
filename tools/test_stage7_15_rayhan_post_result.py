from pathlib import Path
import subprocess


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js"
DOCS = ROOT / "docs/ui/ui-stage7-first-experience.js"


def require(condition, message):
    if not condition:
        raise AssertionError(message)


require(SOURCE.read_bytes() == DOCS.read_bytes(), "Stage 7.15 mirrors differ")
for path in (SOURCE, DOCS):
    subprocess.run(["node", "--check", str(path)], cwd=ROOT, check=True)

source = SOURCE.read_text(encoding="utf-8")
canonical = "ладно ладно, я понял, не ори. смари у тебя репутация выросла, денежек больше стало и победа первая появилась. кликни по этим “+1” чтоб не мусорили экран, заодно посмотри чо там в меню и дай знать когда закончишь"
require(source.count(f'const RAYHAN_WIN_CHAT = "{canonical}";') == 1, "canonical Rayhan post-result copy must be exact and unique")
require(source.count('phase = "rayhan_win_waiting_reply";') == 1, "Rayhan victory must enter the post-result phase once")
require(source.count('state.flags.stage715RayhanRewardChatShown !== true') == 1, "post-result chat must be exactly-once guarded")
require('if (battleOutcome(battle) === "win") return battle;' in source, "win result must be read from the rendered battle mirror")
require('stage715RayhanRewardChatShown' in source and 'showNastyaAfterRayhanReply();' in source, "Nastya handoff must remain reply-gated")
require('function resetStage715FreshState(nextContext)' in source, "Fresh Start must clear persisted Stage 7.15 state")
require('storage.removeItem(STAGE715_STORAGE_KEY)' in source, "Fresh Start must remove the persisted Stage 7.15 snapshot")
require('key === DEMO_STATE_FLAG || key.startsWith("stage715")' in source, "Fresh Start must clear stale Stage 7.15 flags")
require('resetStage715FreshState(nextContext);' in source, "Fresh Start reset must run before the new intro")
print("PASS_STAGE7_15_RAYHAN_POST_RESULT_CONTRACT")
