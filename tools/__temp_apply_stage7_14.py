from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js"
DOC = ROOT / "docs/ui/ui-stage7-first-experience.js"
INDEX = ROOT / "AsyncScene/Web/index.html"
INDEX_DOC = ROOT / "docs/index.html"
TEST13 = ROOT / "tools/test_stage7_13_aftermath_dm_followup.py"
TEST14 = ROOT / "tools/test_stage7_14_durable_aftermath_dm_contact.py"

def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly 1 match, got {count}")
    return text.replace(old, new, 1)

src = SRC.read_text(encoding="utf-8")
if src != DOC.read_text(encoding="utf-8"):
    raise SystemExit("controller mirrors differ before patch")
if INDEX.read_text(encoding="utf-8") != INDEX_DOC.read_text(encoding="utf-8"):
    raise SystemExit("index mirrors differ before patch")

src = replace_once(
    src,
    '  const FIRST_BATTLE_AFTERMATH_DM_ID = "stage7_first_real_battle_dm_followup_v1";\n',
    '  const FIRST_BATTLE_AFTERMATH_DM_ID = "stage7_first_real_battle_dm_followup_v1";\n'
    '  const FIRST_BATTLE_AFTERMATH_DM_CONTACT_ID = "stage7_first_real_battle_dm_contact_v1";\n',
    "contact constant",
)

anchor = '''  function getFirstBattleAftermathDmRecord(targetNpcId) {
'''
insert = '''  function getFirstBattleAftermathDmContactRecord() {
    const current = snapshot || loadSnapshot();
    if (!current || current.onboardingUnlocked !== true) return null;
    const bridge = sanitizeRealBattleBridge(current.realBattleBridge);
    if (bridge.status !== "completed"
      || bridge.aftermathStatus !== "acknowledged"
      || !["pending", "delivered"].includes(bridge.aftermathDmStatus)) return null;
    const branchId = RESPONSE_IDS.includes(bridge.aftermathBranchId)
      ? bridge.aftermathBranchId
      : bridge.branchId;
    const expectedTarget = branchId ? FIRST_BATTLE_AFTERMATH_TARGETS[branchId] : null;
    const target = bridge.aftermathTargetNpcId || expectedTarget;
    if (!branchId || !target || target !== expectedTarget) return null;
    const memory = current.npcMemory && current.npcMemory[target];
    const saved = memory && memory.firstRealBattleAftermath;
    if (!saved
      || saved.aftermathId !== FIRST_BATTLE_AFTERMATH_ID
      || saved.status !== "acknowledged"
      || !saved.battleId
      || saved.battleId !== bridge.battleId
      || saved.targetNpcId !== target
      || saved.branchId !== branchId) return null;
    const outcomeKind = ["win", "lose", "interrupted"].includes(bridge.aftermathOutcomeKind)
      ? bridge.aftermathOutcomeKind
      : normalizeFirstBattleAftermathOutcome(bridge.aftermathOutcomeRaw || bridge.outcome);
    const copyGroup = FIRST_BATTLE_AFTERMATH_DM_COPY[branchId];
    const text = copyGroup && copyGroup[outcomeKind];
    if (!copyGroup || !text) return null;
    const lineId = bridge.aftermathDmLineId
      || `${FIRST_BATTLE_AFTERMATH_DM_ID}:${bridge.battleId}:${target}`;
    return {
      contactId: FIRST_BATTLE_AFTERMATH_DM_CONTACT_ID,
      lineId,
      targetNpcId: target,
      npcName: copyGroup.npcName,
      battleId: bridge.battleId,
      branchId,
      outcomeKind,
      dmStatus: bridge.aftermathDmStatus,
      text,
    };
  }

  function restoreFirstBattleAftermathDmHistory(contact) {
    if (!contact || contact.dmStatus !== "delivered") return false;
    ensureScenarioPlayers();
    const logs = getDmLogsForNpc(contact.targetNpcId);
    const UI = G.UI;
    if (!logs || !UI || typeof UI.dmPushLine !== "function") return false;
    const existing = logs.find((item) => item
      && item.stage7AftermathReplyId === contact.lineId
      && item.stage7AftermathBattleId === contact.battleId);
    if (existing) return true;
    UI.dmPushLine(contact.targetNpcId, contact.npcName, contact.text);
    const line = logs[logs.length - 1] || null;
    if (!line) return false;
    line.stage7AftermathReplyId = contact.lineId;
    line.stage7AftermathBattleId = contact.battleId;
    line.stage7AftermathOutcomeKind = contact.outcomeKind;
    line.stage7AftermathHistoryRestored = true;
    return true;
  }

  function renderFirstBattleAftermathDmContact(panel) {
    const contact = getFirstBattleAftermathDmContactRecord();
    if (!panel || !contact) return false;
    const statusText = contact.dmStatus === "pending"
      ? "После баттла у тебя осталось личное сообщение."
      : "Переписка после баттла сохранена.";
    panel.innerHTML = `
      <div class="stage7BranchFollowUp stage7AftermathDmContact" data-testid="stage7-aftermath-dm-contact">
        <div class="stage7EvidenceBadge">Личный контакт</div>
        <h2>${contact.npcName}</h2>
        <p>${statusText}</p>
        ${actionButton(`Открыть личку: ${contact.npcName}`, "open-aftermath-dm-contact")}
        <div class="stage7Support">Игра открыта. Личка не откроется сама после обновления страницы.</div>
      </div>`;
    return true;
  }

  function openFirstBattleAftermathDmContact() {
    const contact = getFirstBattleAftermathDmContactRecord();
    const UI = G.UI;
    if (!contact || !UI || typeof UI.openDM !== "function") return false;
    ensureScenarioPlayers();
    if (contact.dmStatus === "delivered") restoreFirstBattleAftermathDmHistory(contact);
    const result = UI.openDM(contact.targetNpcId);
    if (result === false) return false;
    if (contact.dmStatus === "delivered") restoreFirstBattleAftermathDmHistory(contact);
    telemetry("first_experience.first_real_battle_aftermath_dm_contact_opened", {
      contactId: FIRST_BATTLE_AFTERMATH_DM_CONTACT_ID,
      targetNpcId: contact.targetNpcId,
      branchId: contact.branchId,
      battleId: contact.battleId,
      outcomeKind: contact.outcomeKind,
      dmStatus: contact.dmStatus,
    });
    render();
    return true;
  }


'''
src = replace_once(src, anchor, insert + anchor, "contact helpers")

old_render = '''      if (bridge && bridge.aftermathStatus === "pending") {
        releaseNormalWorldOnce({ preservePanel: true });
        panel.hidden = false;
        renderFirstBattleAftermath(panel);
        return;
      }
      panel.remove();
      releaseNormalWorldOnce();
      return;
'''
new_render = '''      if (bridge && bridge.aftermathStatus === "pending") {
        releaseNormalWorldOnce({ preservePanel: true });
        panel.hidden = false;
        renderFirstBattleAftermath(panel);
        return;
      }
      if (bridge
        && bridge.status === "completed"
        && bridge.aftermathStatus === "acknowledged"
        && ["pending", "delivered"].includes(bridge.aftermathDmStatus)) {
        releaseNormalWorldOnce({ preservePanel: true });
        panel.hidden = false;
        if (renderFirstBattleAftermathDmContact(panel)) return;
      }
      panel.remove();
      releaseNormalWorldOnce();
      return;
'''
src = replace_once(src, old_render, new_render, "unlocked render")

old_action = '''    } else if (action === "acknowledge-first-battle-aftermath" && snapshot.onboardingUnlocked) {
      acknowledgeFirstBattleAftermath();
    }
'''
new_action = '''    } else if (action === "acknowledge-first-battle-aftermath" && snapshot.onboardingUnlocked) {
      acknowledgeFirstBattleAftermath();
    } else if (action === "open-aftermath-dm-contact" && snapshot.onboardingUnlocked) {
      openFirstBattleAftermathDmContact();
    }
'''
src = replace_once(src, old_action, new_action, "panel action")

resume_case = '''      if (bridge.status === "completed" && bridge.aftermathStatus === "pending") {
        snapshot = Object.assign(existing, { realBattleBridge: bridge });
        attach(nextContext);
        return {
          claimed: true,
          mode: "battle_aftermath_resume",
          stateId: snapshot.stateId,
          releaseNormalWorld: () => releaseNormalWorldOnce({ preservePanel: true }),
        };
      }
'''
resume_plus = resume_case + '''      if (bridge.status === "completed"
        && bridge.aftermathStatus === "acknowledged"
        && ["pending", "delivered"].includes(bridge.aftermathDmStatus)) {
        snapshot = Object.assign(existing, { realBattleBridge: bridge });
        attach(nextContext);
        return {
          claimed: true,
          mode: "battle_aftermath_dm_contact_resume",
          stateId: snapshot.stateId,
          releaseNormalWorld: () => releaseNormalWorldOnce({ preservePanel: true }),
        };
      }
'''
if src.count(resume_case) != 2:
    raise SystemExit(f"resume cases: expected 2, got {src.count(resume_case)}")
src = src.replace(resume_case, resume_plus)

old_pending = '''    const bridge = sanitizeRealBattleBridge(current.realBattleBridge);
    return bridge.status === "completed" && bridge.aftermathStatus === "pending";
'''
new_pending = '''    const bridge = sanitizeRealBattleBridge(current.realBattleBridge);
    return bridge.status === "completed" && (
      bridge.aftermathStatus === "pending"
      || (bridge.aftermathStatus === "acknowledged"
        && ["pending", "delivered"].includes(bridge.aftermathDmStatus))
    );
'''
src = replace_once(src, old_pending, new_pending, "isPending")

old_exports = '''    getFirstBattleAftermathDmRecord,
    deliverFirstBattleAftermathDm,
    installFirstBattleAftermathDmHook,
'''
new_exports = '''    getFirstBattleAftermathDmRecord,
    getFirstBattleAftermathDmContactRecord,
    openFirstBattleAftermathDmContact,
    restoreFirstBattleAftermathDmHistory,
    deliverFirstBattleAftermathDm,
    installFirstBattleAftermathDmHook,
'''
src = replace_once(src, old_exports, new_exports, "public exports")

old_dev = '''  G.__DEV.getStage7FirstBattleAftermathDm = getFirstBattleAftermathDmRecord;
  G.__DEV.deliverStage7FirstBattleAftermathDm = deliverFirstBattleAftermathDm;
'''
new_dev = '''  G.__DEV.getStage7FirstBattleAftermathDm = getFirstBattleAftermathDmRecord;
  G.__DEV.getStage7FirstBattleAftermathDmContact = getFirstBattleAftermathDmContactRecord;
  G.__DEV.openStage7FirstBattleAftermathDmContact = openFirstBattleAftermathDmContact;
  G.__DEV.restoreStage7FirstBattleAftermathDmHistory = restoreFirstBattleAftermathDmHistory;
  G.__DEV.deliverStage7FirstBattleAftermathDm = deliverFirstBattleAftermathDm;
'''
src = replace_once(src, old_dev, new_dev, "dev exports")

src = replace_once(src, '    stage: "7.13",\n', '    stage: "7.14",\n', "smoke stage")

old_smoke_tail = '''    firstBattleAftermathDmTargetBound: true,
    firstBattleAftermathDmExactlyOnce: true,
    firstBattleAftermathDmRefreshSafe: true,
'''
new_smoke_tail = '''    firstBattleAftermathDmTargetBound: true,
    firstBattleAftermathDmExactlyOnce: true,
    firstBattleAftermathDmRefreshSafe: true,
    firstBattleAftermathDmContactId: FIRST_BATTLE_AFTERMATH_DM_CONTACT_ID,
    firstBattleAftermathDmContactDurable: true,
    firstBattleAftermathDmContactNoAutoOpen: true,
    firstBattleAftermathDmHistoryRestoredOnDemand: true,
'''
src = replace_once(src, old_smoke_tail, new_smoke_tail, "smoke contact flags")

SRC.write_text(src, encoding="utf-8")
DOC.write_text(src, encoding="utf-8")

index = INDEX.read_text(encoding="utf-8")
old_marker = "stage7_13_aftermath_dm_followup_20260806c"
new_marker = "stage7_14_durable_aftermath_dm_contact_20260807a"
if index.count(old_marker) < 2:
    raise SystemExit(f"index marker: expected at least 2 old markers, got {index.count(old_marker)}")
index = index.replace(old_marker, new_marker)
INDEX.write_text(index, encoding="utf-8")
INDEX_DOC.write_text(index, encoding="utf-8")

t13 = TEST13.read_text(encoding="utf-8")
t13 = t13.replace("stage7_13_aftermath_dm_followup_20260806a", new_marker)
old_t13_resume = '''  run.G.Stage7FirstExperience.destroy();
  assert.strictEqual(run.G.Stage7FirstExperience.claimResume(rt.context).claimed, false);
  assert.strictEqual(rt.UI.openDM(targetNpcId), `opened:${targetNpcId}`);
'''
new_t13_resume = '''  run.G.Stage7FirstExperience.destroy();
  const resumedClaim = run.G.Stage7FirstExperience.claimResume(rt.context);
  assert.strictEqual(resumedClaim.claimed, true);
  assert.strictEqual(resumedClaim.mode, "battle_aftermath_dm_contact_resume");
  assert.strictEqual(rt.UI.openDM(targetNpcId), `opened:${targetNpcId}`);
'''
t13 = replace_once(t13, old_t13_resume, new_t13_resume, "stage13 durable resume expectation")
TEST13.write_text(t13, encoding="utf-8")

t14 = TEST14.read_text(encoding="utf-8")
old_extract = 'assert isinstance(node_harness, str) and "function makeRuntime" in node_harness\n\nextra = r' + "'''" + '\n'
new_extract = (
    'assert isinstance(node_harness, str) and "function makeRuntime" in node_harness\n'
    'split_marker = \'\\nrunCase("deny-win"\'\n'
    'assert split_marker in node_harness\n'
    'node_harness = node_harness.split(split_marker, 1)[0]\n'
    'assert "function prepareAcknowledged" in node_harness\n\n'
    'extra = r' + "'''" + '\n'
)
t14 = replace_once(t14, old_extract, new_extract, "stage14 harness definitions only")
TEST14.write_text(t14, encoding="utf-8")

print("STAGE714_PATCH_APPLIED")
