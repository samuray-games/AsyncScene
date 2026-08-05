from pathlib import Path

SOURCE = Path("AsyncScene/Web/ui/ui-stage7-first-experience.js")
DOCS = Path("docs/ui/ui-stage7-first-experience.js")
TEST = Path("tools/test_stage7_7_preunlock_corridor.py")


def replace_exact(text: str, old: str, new: str, expected: int, label: str) -> str:
    count = text.count(old)
    if count != expected:
        raise SystemExit(f"{label}: expected {expected} matches, found {count}")
    return text.replace(old, new)


old = '''      if (bridge.status === "created" && !resumedBattle) {
        bridge.status = "pending";
        bridge.battleId = null;
        bridge.attemptCount = 0;
        bridge.lastFailureReason = "created_battle_missing_after_resume";
      }
      if (bridge.status === "pending") {
'''
new = '''      if (bridge.status === "created" && resumedBattle) {
        snapshot = Object.assign(existing, { realBattleBridge: bridge });
        attach(nextContext);
        releaseNormalWorldOnce();
        syncRealArgumentBattleLifecycle();
        return { claimed: true, mode: "battle_bridge_active_resume", stateId: snapshot.stateId, releaseNormalWorld: releaseNormalWorldOnce };
      }
      if (bridge.status === "created" && !resumedBattle) {
        bridge.status = "pending";
        bridge.battleId = null;
        bridge.attemptCount = 0;
        bridge.lastFailureReason = "created_battle_missing_after_resume";
      }
      if (bridge.status === "pending") {
'''

for path in (SOURCE, DOCS):
    text = path.read_text(encoding="utf-8")
    text = replace_exact(text, old, new, 2, f"{path}: active resume blocks")
    path.write_text(text, encoding="utf-8")

text = TEST.read_text(encoding="utf-8")
needle = '''assert.strictEqual(state.battles[0].meta.stage7SecondRoundChoiceId, "primary");
assert(visibleLines.some((line) => line && line.name === "Райхан"), "Rayhan injection missing");
'''
replacement = '''assert.strictEqual(state.battles[0].meta.stage7SecondRoundChoiceId, "primary");
Game.Stage7FirstExperience.destroy();
const activeResume = Game.Stage7FirstExperience.claimResume(context);
assert.strictEqual(activeResume.claimed, true, "active real battle did not reattach lifecycle tracking");
assert.strictEqual(activeResume.mode, "battle_bridge_active_resume");
assert.strictEqual(incomingCalls, 1, "active resume duplicated the battle");
assert(visibleLines.some((line) => line && line.name === "Райхан"), "Rayhan injection missing");
'''
text = replace_exact(text, needle, replacement, 1, "test active resume")
TEST.write_text(text, encoding="utf-8")

print("STAGE7_8_ACTIVE_RESUME_FIX_OK")
