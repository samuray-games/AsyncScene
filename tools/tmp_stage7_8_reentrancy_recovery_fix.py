from pathlib import Path

SOURCE = Path("AsyncScene/Web/ui/ui-stage7-first-experience.js")
DOCS = Path("docs/ui/ui-stage7-first-experience.js")
TEST = Path("tools/test_stage7_7_preunlock_corridor.py")


def replace_exact(text: str, old: str, new: str, expected: int, label: str) -> str:
    count = text.count(old)
    if count != expected:
        raise SystemExit(f"{label}: expected {expected} matches, found {count}")
    return text.replace(old, new)


for path in [SOURCE, DOCS]:
    text = path.read_text(encoding="utf-8")
    text = replace_exact(
        text,
        "  let realBattleBridgeTimer = null;\n",
        "  let realBattleBridgeTimer = null;\n  let realBattleBridgeInFlight = false;\n",
        1,
        f"{path}: in-flight state",
    )
    text = replace_exact(
        text,
        '''    const bridge = getBridgeState();
    if (!bridge || bridge.status !== "pending") return bridge && bridge.status === "created";

    const existing = findExistingRealBattle();
''',
        '''    const bridge = getBridgeState();
    if (!bridge || bridge.status !== "pending") return bridge && bridge.status === "created";
    if (realBattleBridgeInFlight) return true;
    realBattleBridgeInFlight = true;
    try {

    const existing = findExistingRealBattle();
''',
        1,
        f"{path}: enter in-flight guard",
    )
    text = replace_exact(
        text,
        '''    return false;
  }

  function scheduleRealArgumentBattleBridge() {
''',
        '''    return false;
    } finally {
      realBattleBridgeInFlight = false;
    }
  }

  function scheduleRealArgumentBattleBridge() {
''',
        1,
        f"{path}: leave in-flight guard",
    )
    old_claim = '''      const bridge = sanitizeRealBattleBridge(existing.realBattleBridge);
      if (bridge.status === "pending") {
        snapshot = Object.assign(existing, { realBattleBridge: bridge });
        attach(nextContext);
        releaseNormalWorldOnce();
        if (!attemptRealArgumentBattleBridge()) scheduleRealArgumentBattleBridge();
        return { claimed: true, mode: "battle_bridge_resume", stateId: snapshot.stateId, releaseNormalWorld: releaseNormalWorldOnce };
      }
      return { claimed: false, mode: "complete", stateId: existing.stateId, releaseNormalWorld: () => {} };
'''
    new_claim = '''      const bridge = sanitizeRealBattleBridge(existing.realBattleBridge);
      const resumeState = nextContext && nextContext.state
        ? nextContext.state
        : (G.__S || G.State || null);
      const resumedBattle = resumeState && Array.isArray(resumeState.battles)
        ? resumeState.battles.find((battle) => battle && (
          (battle.meta && battle.meta.stage7OnboardingBridgeId === REAL_BATTLE_BRIDGE_ID)
          || (bridge.battleId && (battle.id === bridge.battleId || battle.battleId === bridge.battleId))
        ))
        : null;
      if (bridge.status === "created" && !resumedBattle) {
        bridge.status = "pending";
        bridge.battleId = null;
        bridge.attemptCount = 0;
        bridge.lastFailureReason = "created_battle_missing_after_resume";
      }
      if (bridge.status === "pending") {
        bridge.attemptCount = 0;
        snapshot = Object.assign(existing, { realBattleBridge: bridge });
        attach(nextContext);
        releaseNormalWorldOnce();
        if (!attemptRealArgumentBattleBridge()) scheduleRealArgumentBattleBridge();
        return { claimed: true, mode: "battle_bridge_resume", stateId: snapshot.stateId, releaseNormalWorld: releaseNormalWorldOnce };
      }
      return { claimed: false, mode: "complete", stateId: existing.stateId, releaseNormalWorld: () => {} };
'''
    text = replace_exact(text, old_claim, new_claim, 2, f"{path}: resume recovery blocks")
    text = replace_exact(
        text,
        '''    realBattleBridgeTimer = null;
    context = null;
''',
        '''    realBattleBridgeTimer = null;
    realBattleBridgeInFlight = false;
    context = null;
''',
        1,
        f"{path}: destroy in-flight state",
    )
    path.write_text(text, encoding="utf-8")

text = TEST.read_text(encoding="utf-8")
text = replace_exact(
    text,
    'assert "stage7OnboardingBridgeId" in source\n',
    'assert "stage7OnboardingBridgeId" in source\nassert "realBattleBridgeInFlight" in source\n',
    1,
    "test static guard",
)
text = replace_exact(
    text,
    '''let incomingCalls = 0;
const visibleLines = [];
''',
    '''let incomingCalls = 0;
let reentrantBridgeProbe = false;
const visibleLines = [];
''',
    1,
    "test reentrant flag",
)
text = replace_exact(
    text,
    '''  requestRenderAll() {},
  renderAll() {},
''',
    '''  requestRenderAll() {
    if (reentrantBridgeProbe && Game.__DEV && typeof Game.__DEV.runStage7RealArgumentBattleBridge === "function") {
      Game.__DEV.runStage7RealArgumentBattleBridge();
    }
  },
  renderAll() {},
''',
    1,
    "test reentrant render",
)
text = replace_exact(
    text,
    '''assert.strictEqual(dev.answerStage7CurrentQuestionCorrect(), true);
snap = dev.getStage7FirstExperienceSnapshot();
''',
    '''reentrantBridgeProbe = true;
assert.strictEqual(dev.answerStage7CurrentQuestionCorrect(), true);
reentrantBridgeProbe = false;
snap = dev.getStage7FirstExperienceSnapshot();
''',
    1,
    "test enable reentrant probe",
)
text = replace_exact(
    text,
    '''Game.Stage7FirstExperience.destroy();
const resumed = Game.Stage7FirstExperience.claimResume(context);
assert.strictEqual(resumed.claimed, false, "completed corridor replayed after bridge recovery");
assert.strictEqual(incomingCalls, 1);

Game.__DEV.resetStage7FirstExperience();
''',
    '''const createdButMissing = JSON.parse(storage.get(storageKey));
createdButMissing.realBattleBridge.status = "created";
createdButMissing.realBattleBridge.battleId = "stage7_real_battle_1";
storage.set(storageKey, JSON.stringify(createdButMissing));
state.battles.length = 0;
Game.Stage7FirstExperience.destroy();
const recreated = Game.Stage7FirstExperience.claimResume(context);
assert.strictEqual(recreated.claimed, true, "missing created battle was not recovered");
snap = dev.getStage7FirstExperienceSnapshot();
assert.strictEqual(incomingCalls, 2, "missing battle was not recreated exactly once");
assert.strictEqual(state.battles.length, 1);
assert.strictEqual(snap.realBattleBridge.status, "created");
assert.strictEqual(snap.realBattleBridge.battleId, "stage7_real_battle_2");
Game.Stage7FirstExperience.destroy();
const resumed = Game.Stage7FirstExperience.claimResume(context);
assert.strictEqual(resumed.claimed, false, "completed corridor replayed after bridge recovery");
assert.strictEqual(incomingCalls, 2);

Game.__DEV.resetStage7FirstExperience();
''',
    1,
    "test missing battle recovery",
)
TEST.write_text(text, encoding="utf-8")

print("STAGE7_8_REENTRANCY_RECOVERY_FIX_OK")
