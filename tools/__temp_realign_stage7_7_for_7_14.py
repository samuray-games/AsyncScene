from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "tools/test_stage7_7_preunlock_corridor.py"
text = PATH.read_text(encoding="utf-8")
old = '''Game.Stage7FirstExperience.destroy();
const resumed = Game.Stage7FirstExperience.claimResume(context);
assert.strictEqual(resumed.claimed, false, "acknowledged aftermath replayed after refresh");
assert.strictEqual(incomingCalls, 2);
'''
new = '''Game.Stage7FirstExperience.destroy();
const resumed = Game.Stage7FirstExperience.claimResume(context);
assert.strictEqual(resumed.claimed, true, "acknowledged aftermath contact was not restored after refresh");
assert.strictEqual(resumed.mode, "battle_aftermath_dm_contact_resume");
assert.strictEqual(incomingCalls, 2, "aftermath contact resume duplicated the battle");
'''
if text.count(old) != 1:
    raise SystemExit(f"Stage 7.7 acknowledged resume contract match count={text.count(old)}")
PATH.write_text(text.replace(old, new, 1), encoding="utf-8")
print("STAGE77_REALIGNED_FOR_STAGE714")
