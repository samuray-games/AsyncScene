from pathlib import Path
import ast
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
CONTROLLER = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js"
CONTROLLER_DOCS = ROOT / "docs/ui/ui-stage7-first-experience.js"
INDEX = ROOT / "AsyncScene/Web/index.html"
INDEX_DOCS = ROOT / "docs/index.html"
STAGE13_TEST = ROOT / "tools/test_stage7_13_aftermath_dm_followup.py"

controller = CONTROLLER.read_text(encoding="utf-8")
assert controller == CONTROLLER_DOCS.read_text(encoding="utf-8")
assert INDEX.read_text(encoding="utf-8") == INDEX_DOCS.read_text(encoding="utf-8")

for marker in [
    "stage7_first_real_battle_dm_contact_v1",
    "getFirstBattleAftermathDmContactRecord",
    "renderFirstBattleAftermathDmContact",
    "openFirstBattleAftermathDmContact",
    "restoreFirstBattleAftermathDmHistory",
    "battle_aftermath_dm_contact_resume",
    "open-aftermath-dm-contact",
    "stage7AftermathHistoryRestored",
    'stage: "7.14"',
]:
    assert marker in controller, marker

for text in [INDEX.read_text(encoding="utf-8"), INDEX_DOCS.read_text(encoding="utf-8")]:
    assert text.count("stage7_14_durable_aftermath_dm_contact_20260807a") >= 2

for path in [CONTROLLER, CONTROLLER_DOCS]:
    subprocess.run(["node", "--check", str(path)], check=True)

# Reuse the accepted Stage 7.13 dynamic harness definitions without executing
# its stale cache-marker assertions. This keeps the exact battle/aftermath setup.
module = ast.parse(STAGE13_TEST.read_text(encoding="utf-8"))
node_harness = None
for node in module.body:
    if isinstance(node, ast.Assign):
        for target in node.targets:
            if isinstance(target, ast.Name) and target.id == "node_harness":
                node_harness = ast.literal_eval(node.value)
                break
    if node_harness is not None:
        break
assert isinstance(node_harness, str) and "function makeRuntime" in node_harness
split_marker = '\nrunCase("deny-win"'
assert split_marker in node_harness
node_harness = node_harness.split(split_marker, 1)[0]
assert "function prepareAcknowledged" in node_harness

extra = r'''

function storageEntries(rt) {
  return Array.from(rt.storage.entries());
}

// Pending reply survives a full controller/runtime reload. The contact is
// visible but the DM is not auto-opened. Explicit opening consumes the same
// Stage 7.13 reply exactly once.
{
  const source = makeRuntime("stage714-pending");
  const prepared = prepareAcknowledged(source, "deny", "primary", "win");
  assert.strictEqual(prepared.dev.acknowledgeStage7FirstBattleAftermath(), true);
  let snap = prepared.dev.getStage7FirstExperienceSnapshot();
  assert.strictEqual(snap.realBattleBridge.aftermathDmStatus, "pending");
  assert.strictEqual(source.openCalls.length, 0);
  const entries = storageEntries(source);
  prepared.G.Stage7FirstExperience.destroy();

  const resumed = makeRuntime("stage714-pending", entries);
  const claim = resumed.sandbox.Game.Stage7FirstExperience.claimResume(resumed.context);
  assert.strictEqual(claim.claimed, true);
  assert.strictEqual(claim.mode, "battle_aftermath_dm_contact_resume");
  assert.strictEqual(resumed.openCalls.length, 0, "refresh must not auto-open the DM");
  assert.deepStrictEqual(Array.from(resumed.state.dm.openIds), []);
  const panel = resumed.sandbox.document.getElementById("stage7FirstExperiencePanel");
  assert(panel);
  assert(panel.innerHTML.includes("Личный контакт"));
  assert(panel.innerHTML.includes("Настя"));
  assert(panel.innerHTML.includes("open-aftermath-dm-contact"));
  const contact = resumed.sandbox.Game.__DEV.getStage7FirstBattleAftermathDmContact();
  assert.strictEqual(contact.targetNpcId, "npc_stage7_mika");
  assert.strictEqual(contact.dmStatus, "pending");

  assert.strictEqual(resumed.sandbox.Game.__DEV.openStage7FirstBattleAftermathDmContact(), true);
  assert.deepStrictEqual(Array.from(resumed.openCalls), ["npc_stage7_mika"]);
  assert.strictEqual((resumed.state.dm.logs.npc_stage7_mika || []).length, 1);
  snap = resumed.sandbox.Game.__DEV.getStage7FirstExperienceSnapshot();
  assert.strictEqual(snap.realBattleBridge.aftermathDmStatus, "delivered");
  assert.strictEqual(snap.realBattleBridge.aftermathDmDeliveryCount, 1);

  assert.strictEqual(resumed.sandbox.Game.__DEV.openStage7FirstBattleAftermathDmContact(), true);
  assert.strictEqual((resumed.state.dm.logs.npc_stage7_mika || []).length, 1);
  snap = resumed.sandbox.Game.__DEV.getStage7FirstExperienceSnapshot();
  assert.strictEqual(snap.realBattleBridge.aftermathDmDeliveryCount, 1);
  resumed.sandbox.Game.Stage7FirstExperience.destroy();
}

// A previously delivered reply also survives reload as history. Generic DM
// state may be empty after refresh, so the controller restores the persisted
// Stage 7 line only on explicit contact opening, never on boot.
{
  const source = makeRuntime("stage714-delivered");
  const prepared = prepareAcknowledged(source, "pay", "secondary", "ignored");
  assert.strictEqual(prepared.dev.acknowledgeStage7FirstBattleAftermath(), true);
  assert.strictEqual(source.UI.openDM("npc_bandit"), "opened:npc_bandit");
  let snap = prepared.dev.getStage7FirstExperienceSnapshot();
  assert.strictEqual(snap.realBattleBridge.aftermathDmStatus, "delivered");
  assert.strictEqual(snap.realBattleBridge.aftermathDmDeliveryCount, 1);
  const entries = storageEntries(source);
  prepared.G.Stage7FirstExperience.destroy();

  const resumed = makeRuntime("stage714-delivered", entries);
  const claim = resumed.sandbox.Game.Stage7FirstExperience.claimFreshStart(resumed.context);
  assert.strictEqual(claim.claimed, true);
  assert.strictEqual(claim.mode, "battle_aftermath_dm_contact_resume");
  assert.strictEqual(resumed.openCalls.length, 0, "delivered history must not auto-open after refresh");
  assert.deepStrictEqual(Array.from(resumed.state.dm.openIds), []);
  assert.strictEqual((resumed.state.dm.logs.npc_bandit || []).length, 0);

  const contact = resumed.sandbox.Game.__DEV.getStage7FirstBattleAftermathDmContact();
  assert.strictEqual(contact.targetNpcId, "npc_bandit");
  assert.strictEqual(contact.dmStatus, "delivered");
  assert.strictEqual(resumed.sandbox.Game.__DEV.openStage7FirstBattleAftermathDmContact(), true);
  assert.deepStrictEqual(Array.from(resumed.openCalls), ["npc_bandit"]);
  const logs = resumed.state.dm.logs.npc_bandit || [];
  assert.strictEqual(logs.length, 1);
  assert(logs[0].text.includes("Баттл ничего не закрыл"));
  assert.strictEqual(logs[0].stage7AftermathHistoryRestored, true);
  snap = resumed.sandbox.Game.__DEV.getStage7FirstExperienceSnapshot();
  assert.strictEqual(snap.realBattleBridge.aftermathDmStatus, "delivered");
  assert.strictEqual(snap.realBattleBridge.aftermathDmDeliveryCount, 1);

  assert.strictEqual(resumed.sandbox.Game.__DEV.openStage7FirstBattleAftermathDmContact(), true);
  assert.strictEqual((resumed.state.dm.logs.npc_bandit || []).length, 1);
  snap = resumed.sandbox.Game.__DEV.getStage7FirstExperienceSnapshot();
  assert.strictEqual(snap.realBattleBridge.aftermathDmDeliveryCount, 1);
  resumed.sandbox.Game.Stage7FirstExperience.destroy();
}

// No aftermath means no durable contact and no ordinary-DM side effect.
{
  const ordinary = makeRuntime("stage714-ordinary");
  ordinary.state.players.npc_stage7_mika = { id: "npc_stage7_mika", name: "Настя", npc: true };
  assert.strictEqual(ordinary.sandbox.Game.__DEV.getStage7FirstBattleAftermathDmContact(), null);
  assert.strictEqual(ordinary.sandbox.Game.__DEV.openStage7FirstBattleAftermathDmContact(), false);
  assert.strictEqual(ordinary.openCalls.length, 0);
  assert.strictEqual(ordinary.UI.openDM("npc_stage7_mika"), "opened:npc_stage7_mika");
  assert.strictEqual((ordinary.state.dm.logs.npc_stage7_mika || []).length, 0);
}

console.log("STAGE7_14_DURABLE_AFTERMATH_DM_CONTACT_DYNAMIC_OK");
'''

with tempfile.NamedTemporaryFile("w", suffix=".js", encoding="utf-8", delete=False) as handle:
    handle.write(node_harness)
    handle.write(extra)
    harness_path = Path(handle.name)
try:
    completed = subprocess.run(["node", str(harness_path)], check=False, text=True, capture_output=True)
    if completed.returncode != 0:
        raise AssertionError("node harness failed\nSTDOUT:\n" + completed.stdout + "\nSTDERR:\n" + completed.stderr)
    assert "STAGE7_14_DURABLE_AFTERMATH_DM_CONTACT_DYNAMIC_OK" in completed.stdout
finally:
    harness_path.unlink(missing_ok=True)

print("STAGE7_14_DURABLE_AFTERMATH_DM_CONTACT_OK")
