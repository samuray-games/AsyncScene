from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEST13 = ROOT / "tools/test_stage7_13_aftermath_dm_followup.py"
TEST14 = ROOT / "tools/test_stage7_14_durable_aftermath_dm_contact.py"

def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly 1 match, got {count}")
    return text.replace(old, new, 1)

t13 = TEST13.read_text(encoding="utf-8")
old13 = '''  assert.strictEqual(rt.UI.openDM(targetNpcId), `opened:${targetNpcId}`);
  assert.strictEqual((rt.state.dm.logs[targetNpcId] || []).length, 1);
  return rt;
}
'''
new13 = '''  assert.strictEqual(rt.UI.openDM(targetNpcId), `opened:${targetNpcId}`);
  assert.strictEqual((rt.state.dm.logs[targetNpcId] || []).length, 1);
  run.G.Stage7FirstExperience.destroy();
  return rt;
}
'''
t13 = replace_once(t13, old13, new13, "Stage 7.13 resumed controller teardown")
TEST13.write_text(t13, encoding="utf-8")

t14 = TEST14.read_text(encoding="utf-8")
old_pending = '''  snap = resumed.sandbox.Game.__DEV.getStage7FirstExperienceSnapshot();
  assert.strictEqual(snap.realBattleBridge.aftermathDmDeliveryCount, 1);
}

// A previously delivered reply also survives reload as history.'''
new_pending = '''  snap = resumed.sandbox.Game.__DEV.getStage7FirstExperienceSnapshot();
  assert.strictEqual(snap.realBattleBridge.aftermathDmDeliveryCount, 1);
  resumed.sandbox.Game.Stage7FirstExperience.destroy();
}

// A previously delivered reply also survives reload as history.'''
t14 = replace_once(t14, old_pending, new_pending, "Stage 7.14 pending-resume teardown")
old_delivered = '''  snap = resumed.sandbox.Game.__DEV.getStage7FirstExperienceSnapshot();
  assert.strictEqual(snap.realBattleBridge.aftermathDmDeliveryCount, 1);
}

// No aftermath means no durable contact and no ordinary-DM side effect.'''
new_delivered = '''  snap = resumed.sandbox.Game.__DEV.getStage7FirstExperienceSnapshot();
  assert.strictEqual(snap.realBattleBridge.aftermathDmDeliveryCount, 1);
  resumed.sandbox.Game.Stage7FirstExperience.destroy();
}

// No aftermath means no durable contact and no ordinary-DM side effect.'''
t14 = replace_once(t14, old_delivered, new_delivered, "Stage 7.14 delivered-resume teardown")
TEST14.write_text(t14, encoding="utf-8")

print("STAGE714_TEST_TEARDOWN_FIXED")
