from pathlib import Path

SOURCE = Path("AsyncScene/Web/ui/ui-stage7-first-experience.js")
DOCS = Path("docs/ui/ui-stage7-first-experience.js")
TEST = Path("tools/test_stage7_7_preunlock_corridor.py")


def replace_exact(text: str, old: str, new: str, expected: int, label: str) -> str:
    count = text.count(old)
    if count != expected:
        raise SystemExit(f"{label}: expected {expected} matches, found {count}")
    return text.replace(old, new)


lifecycle_fn = r'''  function syncRealArgumentBattleLifecycle() {
    const bridge = getBridgeState();
    if (!bridge || bridge.status !== "created") return false;
    const battle = findExistingRealBattle();
    if (!battle) return false;
    const completed = battle.resolved === true
      || battle.finished === true
      || battle.status === "finished";
    if (!completed) return false;
    bridge.status = "completed";
    bridge.completedAt = bridge.completedAt || Date.now();
    bridge.outcome = typeof battle.result === "string" && battle.result ? battle.result : null;
    bridge.lastFailureReason = null;
    saveSnapshot();
    telemetry("first_experience.real_argument_battle_completed", {
      bridgeId: REAL_BATTLE_BRIDGE_ID,
      battleId: bridge.battleId,
      outcome: bridge.outcome,
    });
    return true;
  }

'''

for path in [SOURCE, DOCS]:
    text = path.read_text(encoding="utf-8")
    text = replace_exact(
        text,
        '''      createdAt: null,
      injectionShown: false,
''',
        '''      createdAt: null,
      completedAt: null,
      outcome: null,
      injectionShown: false,
''',
        1,
        f"{path}: lifecycle defaults",
    )
    text = replace_exact(
        text,
        '''      status: ["not_started", "pending", "created"].includes(raw.status) ? raw.status : "not_started",
''',
        '''      status: ["not_started", "pending", "created", "completed"].includes(raw.status) ? raw.status : "not_started",
''',
        1,
        f"{path}: completed status",
    )
    text = replace_exact(
        text,
        '''      createdAt: Number.isFinite(Number(raw.createdAt)) ? Number(raw.createdAt) : null,
      injectionShown: raw.injectionShown === true,
''',
        '''      createdAt: Number.isFinite(Number(raw.createdAt)) ? Number(raw.createdAt) : null,
      completedAt: Number.isFinite(Number(raw.completedAt)) ? Number(raw.completedAt) : null,
      outcome: typeof raw.outcome === "string" && raw.outcome ? raw.outcome : null,
      injectionShown: raw.injectionShown === true,
''',
        1,
        f"{path}: sanitize lifecycle",
    )
    text = replace_exact(
        text,
        '''  function getRealBattleInjection() {
''',
        lifecycle_fn + '''  function getRealBattleInjection() {
''',
        1,
        f"{path}: lifecycle function",
    )
    text = replace_exact(
        text,
        '''  function schedulerTick() {
    if (!snapshot || !context) return;
''',
        '''  function schedulerTick() {
    if (!snapshot || !context) return;
    syncRealArgumentBattleLifecycle();
''',
        1,
        f"{path}: lifecycle scheduler",
    )
    text = replace_exact(
        text,
        '''  G.__DEV.runStage7RealArgumentBattleBridge = attemptRealArgumentBattleBridge;
  G.__DEV.getStage7IntermissionNpcIds = () => INTERMISSION_NPCS.map((npc) => npc.id);
''',
        '''  G.__DEV.runStage7RealArgumentBattleBridge = attemptRealArgumentBattleBridge;
  G.__DEV.syncStage7RealArgumentBattleLifecycle = syncRealArgumentBattleLifecycle;
  G.__DEV.getStage7IntermissionNpcIds = () => INTERMISSION_NPCS.map((npc) => npc.id);
''',
        1,
        f"{path}: lifecycle dev hook",
    )
    path.write_text(text, encoding="utf-8")

text = TEST.read_text(encoding="utf-8")
text = replace_exact(
    text,
    'assert "realBattleBridgeInFlight" in source\n',
    'assert "realBattleBridgeInFlight" in source\nassert "syncRealArgumentBattleLifecycle" in source\nassert "real_argument_battle_completed" in source\n',
    1,
    "test lifecycle static markers",
)
text = replace_exact(
    text,
    '''assert.strictEqual(snap.realBattleBridge.status, "created");
assert.strictEqual(snap.realBattleBridge.battleId, "stage7_real_battle_2");
Game.Stage7FirstExperience.destroy();
const resumed = Game.Stage7FirstExperience.claimResume(context);
assert.strictEqual(resumed.claimed, false, "completed corridor replayed after bridge recovery");
assert.strictEqual(incomingCalls, 2);
''',
    '''assert.strictEqual(snap.realBattleBridge.status, "created");
assert.strictEqual(snap.realBattleBridge.battleId, "stage7_real_battle_2");
state.battles[0].resolved = true;
state.battles[0].finished = true;
state.battles[0].status = "finished";
state.battles[0].result = "win";
assert.strictEqual(dev.syncStage7RealArgumentBattleLifecycle(), true, "finished battle lifecycle was not recorded");
snap = dev.getStage7FirstExperienceSnapshot();
assert.strictEqual(snap.realBattleBridge.status, "completed");
assert.strictEqual(snap.realBattleBridge.outcome, "win");
state.battles.length = 0;
Game.Stage7FirstExperience.destroy();
const resumed = Game.Stage7FirstExperience.claimResume(context);
assert.strictEqual(resumed.claimed, false, "completed real battle replayed after refresh");
assert.strictEqual(incomingCalls, 2);
''',
    1,
    "test lifecycle completion",
)
TEST.write_text(text, encoding="utf-8")

print("STAGE7_8_BATTLE_LIFECYCLE_FIX_OK")
