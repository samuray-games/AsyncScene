from pathlib import Path

SOURCE = Path("AsyncScene/Web/ui/ui-stage7-first-experience.js")
DOCS = Path("docs/ui/ui-stage7-first-experience.js")
SOURCE_INDEX = Path("AsyncScene/Web/index.html")
DOCS_INDEX = Path("docs/index.html")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected one anchor, got {count}")
    return text.replace(old, new, 1)


text = SOURCE.read_text(encoding="utf-8")

text = replace_once(
    text,
    '  const WORLD_ADVANCE_DELAY_MS = 45_000;\n',
    '  const WORLD_ADVANCE_DELAY_MS = 45_000;\n  const FOLLOW_UP_REACTION_DELAY_MS = TEST_MODE ? 10_000 : 30_000;\n',
    'reaction delay',
)

text = replace_once(
    text,
    '      primaryMemory: { evidenceShared: 1 },\n      secondaryMemory: { evidenceHeld: 1 },\n',
    '      primaryMemory: { evidenceShared: 1 },\n      secondaryMemory: { evidenceHeld: 1 },\n      primaryReaction: {\n        memoryKey: "evidenceShared",\n        title: "Настя подтвердила доказательство",\n        body: "Настя показала доказательство остальным. Райхан потерял возможность ссылаться только на подозрение.",\n      },\n      secondaryReaction: {\n        memoryKey: "evidenceHeld",\n        title: "Райхан использовал паузу",\n        body: "Ты оставил доказательство при себе. Райхан сказал остальным, что подтверждения твоих слов никто не видел.",\n      },\n',
    'deny reactions',
)
text = replace_once(
    text,
    '      primaryMemory: { publicRematchAccepted: 1 },\n      secondaryMemory: { witnessRequested: 1 },\n',
    '      primaryMemory: { publicRematchAccepted: 1 },\n      secondaryMemory: { witnessRequested: 1 },\n      primaryReaction: {\n        memoryKey: "publicRematchAccepted",\n        title: "Райхан объявил реванш",\n        body: "Ты принял реванш. Райхан назначил публичный спор и начал собирать сторонников.",\n      },\n      secondaryReaction: {\n        memoryKey: "witnessRequested",\n        title: "Настя нашла свидетеля",\n        body: "Ты потребовал свидетеля. Настя нашла человека, который видел начало конфликта, и Райхану придётся отвечать при нём.",\n      },\n',
    'accuse reactions',
)
text = replace_once(
    text,
    '      primaryMemory: { receiptDemanded: 1 },\n      secondaryMemory: { pressureIgnored: 1 },\n',
    '      primaryMemory: { receiptDemanded: 1 },\n      secondaryMemory: { pressureIgnored: 1 },\n      primaryReaction: {\n        memoryKey: "receiptDemanded",\n        title: "Олег подтвердил оплату",\n        body: "Ты потребовал расписку. Олег подтвердил получение денег и больше не может выдать оплату за признание вины.",\n      },\n      secondaryReaction: {\n        memoryKey: "pressureIgnored",\n        title: "Олег усилил давление",\n        body: "Ты оставил всё как есть. Олег рассказал другим, что подтверждения оплаты нет, и решил давить снова.",\n      },\n',
    'pay reactions',
)

text = replace_once(
    text,
    '      followUpChoiceId: null,\n      followUpSettled: false,\n      lastHiddenAt: null,\n',
    '      followUpChoiceId: null,\n      followUpSettled: false,\n      followUpReactionId: null,\n      followUpReactionDueAt: null,\n      followUpReactionPresented: false,\n      followUpReactionPresentationMode: null,\n      followUpReactionPresentedCount: 0,\n      followUpReactionSettled: false,\n      lastHiddenAt: null,\n',
    'snapshot fields',
)

text = replace_once(
    text,
    '    const voteStep = Math.max(0, Math.min(5, Number(raw.voteStep) | 0));\n    return Object.assign(base, raw, {\n',
    '    const voteStep = Math.max(0, Math.min(5, Number(raw.voteStep) | 0));\n    const hasFollowUpReactionContract = Object.prototype.hasOwnProperty.call(raw, "followUpReactionDueAt")\n      || Object.prototype.hasOwnProperty.call(raw, "followUpReactionSettled")\n      || Object.prototype.hasOwnProperty.call(raw, "followUpReactionId");\n    return Object.assign(base, raw, {\n',
    'sanitize contract marker',
)

text = replace_once(
    text,
    '      followUpSettled: raw.followUpSettled === true\n        || (raw.worldAdvanceSettled === true && !Object.prototype.hasOwnProperty.call(raw, "branchFollowUpPending")),\n      freedomCardShown: raw.freedomCardShown === true,\n',
    '      followUpSettled: raw.followUpSettled === true\n        || (raw.worldAdvanceSettled === true && !Object.prototype.hasOwnProperty.call(raw, "branchFollowUpPending")),\n      followUpReactionId: typeof raw.followUpReactionId === "string" && raw.followUpReactionId ? raw.followUpReactionId : null,\n      followUpReactionDueAt: Number.isFinite(Number(raw.followUpReactionDueAt)) ? Number(raw.followUpReactionDueAt) : null,\n      followUpReactionPresented: raw.followUpReactionPresented === true,\n      followUpReactionPresentationMode: ["foreground", "return"].includes(raw.followUpReactionPresentationMode)\n        ? raw.followUpReactionPresentationMode\n        : null,\n      followUpReactionPresentedCount: Math.max(0, Number(raw.followUpReactionPresentedCount) | 0),\n      followUpReactionSettled: raw.followUpReactionSettled === true\n        || (raw.followUpSettled === true && !hasFollowUpReactionContract),\n      freedomCardShown: raw.freedomCardShown === true,\n',
    'sanitize reaction fields',
)

render_anchor = '''  function renderBranchFollowUp(panel) {
    const offer = BRANCH_FOLLOW_UPS[snapshot && snapshot.branchId];
    if (!offer) return;
    panel.innerHTML = `
      <div class="stage7BranchFollowUp">
        <h2>${offer.title}</h2>
        <p>${offer.prompt}</p>
        <div class="stage7ChoiceGrid">
          ${actionButton(offer.primaryLabel, "resolve-branch-follow-up", 'data-follow-up="primary"')}
          ${actionButton(offer.secondaryLabel, "resolve-branch-follow-up", 'data-follow-up="secondary"')}
        </div>
        <div class="stage7Support">Этот выбор сохранится и повлияет на дальнейшие реакции.</div>
      </div>`;
  }

'''
render_insert = render_anchor + '''  function getFollowUpReaction() {
    if (!snapshot || !snapshot.followUpSettled || !snapshot.followUpChoiceId) return null;
    const offer = BRANCH_FOLLOW_UPS[snapshot.branchId];
    if (!offer) return null;
    const reaction = snapshot.followUpChoiceId === "primary" ? offer.primaryReaction : offer.secondaryReaction;
    const memory = snapshot.npcMemory && snapshot.npcMemory[offer.memoryTarget];
    if (!reaction || !memory || Number(memory[reaction.memoryKey]) < 1) return null;
    return reaction;
  }

  function renderFollowUpReaction(panel) {
    const reaction = getFollowUpReaction();
    if (!reaction) return;
    const header = snapshot.followUpReactionPresentationMode === "return"
      ? "Пока тебя не было..."
      : "Твой выбор изменил ситуацию";
    panel.innerHTML = `
      <div class="stage7BranchFollowUp" role="dialog" aria-modal="true" aria-labelledby="stage7FollowUpReactionTitle">
        <div class="stage7EvidenceBadge">${header}</div>
        <h2 id="stage7FollowUpReactionTitle">${reaction.title}</h2>
        <p>${reaction.body}</p>
        ${actionButton("Продолжить", "ack-follow-up-reaction")}
        <div class="stage7Support">Это произошло из-за твоего предыдущего выбора.</div>
      </div>`;
  }

'''
text = replace_once(text, render_anchor, render_insert, 'reaction renderer')

text = replace_once(
    text,
    '    const controlled = snapshot.stateId !== "main_unlocked"\n      || !snapshot.freedomCardDismissed\n      || snapshot.branchFollowUpPending;\n',
    '    const controlled = snapshot.stateId !== "main_unlocked"\n      || !snapshot.freedomCardDismissed\n      || snapshot.branchFollowUpPending\n      || (snapshot.followUpReactionPresented && !snapshot.followUpReactionSettled);\n',
    'controlled mode',
)
text = replace_once(
    text,
    '    if (snapshot.branchFollowUpPending && !snapshot.followUpSettled) {\n      renderBranchFollowUp(panel);\n      return;\n    }\n\n    if (snapshot.stateId === "main_unlocked") {\n',
    '    if (snapshot.branchFollowUpPending && !snapshot.followUpSettled) {\n      renderBranchFollowUp(panel);\n      return;\n    }\n\n    if (snapshot.followUpReactionPresented && !snapshot.followUpReactionSettled) {\n      renderFollowUpReaction(panel);\n      return;\n    }\n\n    if (snapshot.stateId === "main_unlocked") {\n',
    'reaction render priority',
)

reaction_functions = '''  function getFollowUpReactionDue() {
    return !!(snapshot
      && snapshot.stateId === "main_unlocked"
      && snapshot.followUpSettled
      && !snapshot.followUpReactionSettled
      && !snapshot.followUpReactionPresented
      && Number.isFinite(Number(snapshot.followUpReactionDueAt))
      && Date.now() >= Number(snapshot.followUpReactionDueAt));
  }

  function presentFollowUpReaction(mode) {
    if (!getFollowUpReactionDue() || !getFollowUpReaction()) return false;
    snapshot.followUpReactionPresented = true;
    snapshot.followUpReactionPresentationMode = mode === "return" ? "return" : "foreground";
    snapshot.followUpReactionPresentedCount = (snapshot.followUpReactionPresentedCount | 0) + 1;
    saveSnapshot();
    telemetry("first_experience.follow_up_reaction_presented", {
      reactionId: snapshot.followUpReactionId,
      choiceId: snapshot.followUpChoiceId,
      mode: snapshot.followUpReactionPresentationMode,
    });
    render();
    return true;
  }

  function settleFollowUpReaction() {
    if (!snapshot || !snapshot.followUpReactionPresented || snapshot.followUpReactionSettled) return false;
    snapshot.followUpReactionPresented = false;
    snapshot.followUpReactionSettled = true;
    saveSnapshot();
    telemetry("first_experience.follow_up_reaction_settled", {
      reactionId: snapshot.followUpReactionId,
      choiceId: snapshot.followUpChoiceId,
    });
    render();
    releaseNormalWorldOnce();
    return true;
  }

'''
text = replace_once(
    text,
    '  function releaseNormalWorldOnce() {\n    if (normalWorldReleased) return;\n    normalWorldReleased = true;\n    setControlledMode(false);\n    const panel = document.getElementById("stage7FirstExperiencePanel");\n    if (panel) panel.remove();\n    if (context && typeof context.startNormalWorld === "function") context.startNormalWorld();\n  }\n',
    reaction_functions + '  function releaseNormalWorldOnce() {\n    setControlledMode(false);\n    const panel = document.getElementById("stage7FirstExperiencePanel");\n    if (panel) panel.remove();\n    if (normalWorldReleased) return;\n    normalWorldReleased = true;\n    if (context && typeof context.startNormalWorld === "function") context.startNormalWorld();\n  }\n',
    'reaction lifecycle and release',
)

text = replace_once(
    text,
    '    snapshot.followUpSettled = true;\n    snapshot.branchFollowUpPending = false;\n    snapshot.npcMemory[offer.memoryTarget] = Object.assign(\n',
    '    snapshot.followUpSettled = true;\n    snapshot.branchFollowUpPending = false;\n    snapshot.followUpReactionId = `${snapshot.branchId}:${choiceId}`;\n    snapshot.followUpReactionDueAt = Date.now() + FOLLOW_UP_REACTION_DELAY_MS;\n    snapshot.followUpReactionPresented = false;\n    snapshot.followUpReactionPresentationMode = null;\n    snapshot.followUpReactionPresentedCount = 0;\n    snapshot.followUpReactionSettled = false;\n    snapshot.npcMemory[offer.memoryTarget] = Object.assign(\n',
    'schedule reaction',
)
text = replace_once(
    text,
    '      memory\n    );\n    saveSnapshot();\n',
    '      memory\n    );\n    ensureScenarioPlayers();\n    saveSnapshot();\n',
    'hydrate selected memory',
)

text = replace_once(
    text,
    '    } else if (action === "resolve-branch-follow-up" && snapshot.branchFollowUpPending && !snapshot.followUpSettled) {\n      settleBranchFollowUp(button && button.getAttribute("data-follow-up"));\n    } else if (action === "ack-world-advance" && snapshot.worldAdvancePresented && !snapshot.worldAdvanceSettled) {\n',
    '    } else if (action === "resolve-branch-follow-up" && snapshot.branchFollowUpPending && !snapshot.followUpSettled) {\n      settleBranchFollowUp(button && button.getAttribute("data-follow-up"));\n    } else if (action === "ack-follow-up-reaction" && snapshot.followUpReactionPresented && !snapshot.followUpReactionSettled) {\n      settleFollowUpReaction();\n    } else if (action === "ack-world-advance" && snapshot.worldAdvancePresented && !snapshot.worldAdvanceSettled) {\n',
    'reaction action',
)

text = replace_once(
    text,
    '    if (!document.hidden && worldDue && snapshot.freedomCardDismissed) presentWorldAdvance("foreground");\n',
    '    if (!document.hidden && worldDue && snapshot.freedomCardDismissed) presentWorldAdvance("foreground");\n    if (!document.hidden && getFollowUpReactionDue()) presentFollowUpReaction("foreground");\n',
    'foreground reaction scheduler',
)

old_visibility = '''        if (due) {
          presentWorldAdvance("return");
        } else {
          snapshot.lastHiddenAt = null;
          saveSnapshot();
        }
'''
new_visibility = '''        if (due) {
          presentWorldAdvance("return");
        } else if (getFollowUpReactionDue()) {
          presentFollowUpReaction("return");
        } else {
          snapshot.lastHiddenAt = null;
          saveSnapshot();
        }
'''
text = replace_once(text, old_visibility, new_visibility, 'return reaction scheduler')

text = replace_once(
    text,
    '    if (snapshot && snapshot.stateId === "vote" && snapshot.voteStarted && snapshot.voteStep < 5) scheduleVoteStep();\n    render();\n  }\n',
    '    if (snapshot && snapshot.stateId === "vote" && snapshot.voteStarted && snapshot.voteStep < 5) scheduleVoteStep();\n    render();\n    if (snapshot\n      && snapshot.worldAdvanceSettled\n      && snapshot.followUpSettled\n      && !snapshot.followUpReactionSettled\n      && !snapshot.followUpReactionPresented) {\n      releaseNormalWorldOnce();\n    }\n  }\n',
    'resume normal world while waiting',
)

text = text.replace(
    'if (existing && existing.worldAdvanceSettled && existing.followUpSettled && !hasPendingEvidenceReport(existing)) {',
    'if (existing && existing.worldAdvanceSettled && existing.followUpSettled && existing.followUpReactionSettled && !hasPendingEvidenceReport(existing)) {',
)
if text.count('existing.followUpReactionSettled && !hasPendingEvidenceReport(existing)') != 2:
    raise RuntimeError('completion gates were not updated twice')

old_resume_due = '''    const dueOnReturn = snapshot.stateId === "main_unlocked"
      && snapshot.awaitingWorldAdvance
      && !snapshot.worldAdvancePresented
      && Date.now() >= Number(snapshot.worldAdvanceDueAt || 0);
    if (dueOnReturn) {
      snapshot.worldAdvancePresented = true;
      snapshot.worldAdvancePresentationMode = "return";
      markEvidenceWorldAdvancePresented("return");
    } else if (snapshot.stateId === "main_unlocked" && snapshot.freedomCardShown && !snapshot.freedomCardDismissed) {
      snapshot.freedomCardDismissed = true;
    }
'''
new_resume_due = '''    const dueOnReturn = snapshot.stateId === "main_unlocked"
      && snapshot.awaitingWorldAdvance
      && !snapshot.worldAdvancePresented
      && Date.now() >= Number(snapshot.worldAdvanceDueAt || 0);
    const followUpReactionDueOnReturn = !dueOnReturn && getFollowUpReactionDue();
    if (dueOnReturn) {
      snapshot.worldAdvancePresented = true;
      snapshot.worldAdvancePresentationMode = "return";
      markEvidenceWorldAdvancePresented("return");
    } else if (followUpReactionDueOnReturn && getFollowUpReaction()) {
      snapshot.followUpReactionPresented = true;
      snapshot.followUpReactionPresentationMode = "return";
      snapshot.followUpReactionPresentedCount = (snapshot.followUpReactionPresentedCount | 0) + 1;
    } else if (snapshot.stateId === "main_unlocked" && snapshot.freedomCardShown && !snapshot.freedomCardDismissed) {
      snapshot.freedomCardDismissed = true;
    }
'''
text = replace_once(text, old_resume_due, new_resume_due, 'resume due reaction')
text = replace_once(
    text,
    '    if (dueOnReturn) telemetry("first_experience.world_advance_presented", { mode: "return", worldAdvanceId: snapshot.worldAdvanceId });\n',
    '    if (dueOnReturn) telemetry("first_experience.world_advance_presented", { mode: "return", worldAdvanceId: snapshot.worldAdvanceId });\n    if (followUpReactionDueOnReturn) telemetry("first_experience.follow_up_reaction_presented", {\n      reactionId: snapshot.followUpReactionId,\n      choiceId: snapshot.followUpChoiceId,\n      mode: "return",\n    });\n',
    'resume telemetry',
)

text = replace_once(
    text,
    '    return !!(current && (!current.worldAdvanceSettled || current.branchFollowUpPending));\n',
    '    return !!(current && (\n      !current.worldAdvanceSettled\n      || current.branchFollowUpPending\n      || !current.followUpReactionSettled\n    ));\n',
    'pending contract',
)

text = replace_once(
    text,
    '  function settleWorldAdvanceForDev() {\n    if (!snapshot) snapshot = loadSnapshot();\n    if (!snapshot) return false;\n    snapshot.worldAdvanceDueAt = Date.now() - 1;\n    snapshot.freedomCardDismissed = true;\n    saveSnapshot();\n    return presentWorldAdvance("foreground");\n  }\n\n  function destroy() {\n',
    '  function settleWorldAdvanceForDev() {\n    if (!snapshot) snapshot = loadSnapshot();\n    if (!snapshot) return false;\n    snapshot.worldAdvanceDueAt = Date.now() - 1;\n    snapshot.freedomCardDismissed = true;\n    saveSnapshot();\n    return presentWorldAdvance("foreground");\n  }\n\n  function settleFollowUpReactionForDev() {\n    if (!snapshot) snapshot = loadSnapshot();\n    if (!snapshot || snapshot.followUpReactionSettled) return false;\n    snapshot.followUpReactionDueAt = Date.now() - 1;\n    saveSnapshot();\n    return presentFollowUpReaction("foreground");\n  }\n\n  function destroy() {\n',
    'dev reaction hook',
)
text = replace_once(
    text,
    '  G.__DEV.settleStage7FirstExperienceWorldAdvance = settleWorldAdvanceForDev;\n',
    '  G.__DEV.settleStage7FirstExperienceWorldAdvance = settleWorldAdvanceForDev;\n  G.__DEV.settleStage7FollowUpReaction = settleFollowUpReactionForDev;\n',
    'dev export',
)
text = replace_once(
    text,
    '    stage: "7.3",\n',
    '    stage: "7.6",\n    followUpReactionDelayMs: FOLLOW_UP_REACTION_DELAY_MS,\n    visibleLaterReaction: true,\n',
    'smoke stage',
)

SOURCE.write_text(text, encoding="utf-8")
DOCS.write_text(text, encoding="utf-8")

index = SOURCE_INDEX.read_text(encoding="utf-8")
old_cache = "stage7_5_branch_consequence_20260805a"
new_cache = "stage7_6_visible_follow_up_reaction_20260805a"
if index.count(old_cache) != 2:
    raise RuntimeError(f"expected two old cache-busters, got {index.count(old_cache)}")
index = index.replace(old_cache, new_cache)
SOURCE_INDEX.write_text(index, encoding="utf-8")
DOCS_INDEX.write_text(index, encoding="utf-8")

print("STAGE7_6_RUNTIME_PATCH_OK")
