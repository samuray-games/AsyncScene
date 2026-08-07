from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "tools/test_stage7_12_first_real_battle_aftermath.py"
text = PATH.read_text(encoding="utf-8")

old_marker = "stage7_13_aftermath_dm_followup_20260806a"
new_marker = "stage7_14_durable_aftermath_dm_contact_20260807a"
if old_marker not in text:
    raise SystemExit("Stage 7.12 stale cache marker not found")
text = text.replace(old_marker, new_marker)

old = '''assert.strictEqual(snap.npcMemory.npc_stage7_mika.firstRealBattleAftermath.status, "acknowledged");
assert.strictEqual(document.getElementById("stage7FirstExperiencePanel"), null);
assert.strictEqual(dev.acknowledgeStage7FirstBattleAftermath(), false);
Game.Stage7FirstExperience.destroy();
assert.strictEqual(Game.Stage7FirstExperience.claimResume(context).claimed, false);
'''
new = '''assert.strictEqual(snap.npcMemory.npc_stage7_mika.firstRealBattleAftermath.status, "acknowledged");
const contactPanel = document.getElementById("stage7FirstExperiencePanel");
assert(contactPanel);
assert(contactPanel.innerHTML.includes("Личный контакт"));
assert(contactPanel.innerHTML.includes("Настя"));
assert.strictEqual(dev.acknowledgeStage7FirstBattleAftermath(), false);
Game.Stage7FirstExperience.destroy();
const contactResume = Game.Stage7FirstExperience.claimResume(context);
assert.strictEqual(contactResume.claimed, true);
assert.strictEqual(contactResume.mode, "battle_aftermath_dm_contact_resume");
'''
if text.count(old) != 1:
    raise SystemExit(f"Stage 7.12 resume contract match count={text.count(old)}")
text = text.replace(old, new, 1)
PATH.write_text(text, encoding="utf-8")
print("STAGE712_REALIGNED_FOR_STAGE714")
