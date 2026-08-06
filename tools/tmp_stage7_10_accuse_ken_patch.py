from pathlib import Path

CONTROLLER = Path("AsyncScene/Web/ui/ui-stage7-first-experience.js")
CONTROLLER_DOCS = Path("docs/ui/ui-stage7-first-experience.js")
BATTLES = Path("AsyncScene/Web/ui/ui-battles.js")
BATTLES_DOCS = Path("docs/ui/ui-battles.js")
INDEX = Path("AsyncScene/Web/index.html")
INDEX_DOCS = Path("docs/index.html")
OLD_MARKER = "stage7_9_deny_evidence_payoff_20260806a"
NEW_MARKER = "stage7_10_accuse_ken_payoffs_20260806a"


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected one match, found {count}")
    return text.replace(old, new, 1)


controller = CONTROLLER.read_text(encoding="utf-8")
controller = replace_once(
    controller,
    '  const DENY_EVIDENCE_PAYOFF_ID = "stage7_deny_evidence_reveal_v1";\n',
    '  const DENY_EVIDENCE_PAYOFF_ID = "stage7_deny_evidence_reveal_v1";\n'
    '  const ACCUSE_KEN_PAYOFF_ID = "stage7_accuse_ken_tactical_v1";\n',
    "controller payoff constant",
)
controller = replace_once(
    controller,
    '''      evidencePayoffMode: null,
      evidencePayoffStatus: "not_applicable",
      evidencePayoffRevealedAt: null,
      evidencePayoffRevealCount: 0,
      lastFailureReason: null,
''',
    '''      evidencePayoffMode: null,
      evidencePayoffStatus: "not_applicable",
      evidencePayoffRevealedAt: null,
      evidencePayoffRevealCount: 0,
      accusePayoffMode: null,
      accusePayoffStatus: "not_applicable",
      accusePayoffAppliedAt: null,
      accusePayoffApplyCount: 0,
      accusePayoffPreviousDefenseIds: [],
      accusePayoffDefenseIds: [],
      lastFailureReason: null,
''',
    "controller default bridge",
)
controller = replace_once(
    controller,
    '''      evidencePayoffRevealedAt: Number.isFinite(Number(raw.evidencePayoffRevealedAt)) ? Number(raw.evidencePayoffRevealedAt) : null,
      evidencePayoffRevealCount: Math.max(0, Number(raw.evidencePayoffRevealCount) | 0),
      lastFailureReason: typeof raw.lastFailureReason === "string" && raw.lastFailureReason ? raw.lastFailureReason : null,
''',
    '''      evidencePayoffRevealedAt: Number.isFinite(Number(raw.evidencePayoffRevealedAt)) ? Number(raw.evidencePayoffRevealedAt) : null,
      evidencePayoffRevealCount: Math.max(0, Number(raw.evidencePayoffRevealCount) | 0),
      accusePayoffMode: ["public_rematch", "witness"].includes(raw.accusePayoffMode) ? raw.accusePayoffMode : null,
      accusePayoffStatus: ["not_applicable", "pending", "used", "revealed", "expired"].includes(raw.accusePayoffStatus)
        ? raw.accusePayoffStatus
        : "not_applicable",
      accusePayoffAppliedAt: Number.isFinite(Number(raw.accusePayoffAppliedAt)) ? Number(raw.accusePayoffAppliedAt) : null,
      accusePayoffApplyCount: Math.max(0, Number(raw.accusePayoffApplyCount) | 0),
      accusePayoffPreviousDefenseIds: Array.from(new Set(Array.isArray(raw.accusePayoffPreviousDefenseIds)
        ? raw.accusePayoffPreviousDefenseIds.map(String).filter(Boolean).slice(0, 6)
        : [])),
      accusePayoffDefenseIds: Array.from(new Set(Array.isArray(raw.accusePayoffDefenseIds)
        ? raw.accusePayoffDefenseIds.map(String).filter(Boolean).slice(0, 6)
        : [])),
      lastFailureReason: typeof raw.lastFailureReason === "string" && raw.lastFailureReason ? raw.lastFailureReason : null,
''',
    "controller sanitize bridge",
)
controller = replace_once(
    controller,
    '''    if (bridge.evidencePayoffStatus === "pending") {
      bridge.evidencePayoffStatus = "expired";
      if (battle.meta && battle.meta.stage7DenyEvidencePayoff) {
        battle.meta.stage7DenyEvidencePayoff.status = "expired";
      }
      telemetry("first_experience.deny_evidence_payoff_expired", {
        payoffId: DENY_EVIDENCE_PAYOFF_ID,
        battleId: bridge.battleId,
        mode: bridge.evidencePayoffMode,
      });
    }
    saveSnapshot();
''',
    '''    if (bridge.evidencePayoffStatus === "pending") {
      bridge.evidencePayoffStatus = "expired";
      if (battle.meta && battle.meta.stage7DenyEvidencePayoff) {
        battle.meta.stage7DenyEvidencePayoff.status = "expired";
      }
      telemetry("first_experience.deny_evidence_payoff_expired", {
        payoffId: DENY_EVIDENCE_PAYOFF_ID,
        battleId: bridge.battleId,
        mode: bridge.evidencePayoffMode,
      });
    }
    if (bridge.accusePayoffStatus === "pending") {
      bridge.accusePayoffStatus = "expired";
      if (battle.meta && battle.meta.stage7AccuseKenPayoff) {
        battle.meta.stage7AccuseKenPayoff.status = "expired";
      }
      telemetry("first_experience.accuse_ken_payoff_expired", {
        payoffId: ACCUSE_KEN_PAYOFF_ID,
        battleId: bridge.battleId,
        mode: bridge.accusePayoffMode,
      });
    }
    saveSnapshot();
''',
    "controller lifecycle expiry",
)

accuse_functions = '''
  function getAccuseKenPayoffMode() {
    if (!snapshot || snapshot.branchId !== "accuse_ken") return null;
    const memory = snapshot.npcMemory && snapshot.npcMemory.npc_stage7_ken
      ? snapshot.npcMemory.npc_stage7_ken
      : {};
    if (memory.publicRematchAccepted) return "public_rematch";
    if (memory.witnessRequested) return "witness";
    if (snapshot.followUpChoiceId === "primary") return "public_rematch";
    if (snapshot.followUpChoiceId === "secondary") return "witness";
    return null;
  }

  function syncAccuseKenPayoffMeta(battle) {
    const bridge = getBridgeState();
    if (!bridge || !battle || !battle.meta) return false;
    battle.meta.stage7AccuseKenPayoff = Object.assign(
      {},
      battle.meta.stage7AccuseKenPayoff || {},
      {
        payoffId: ACCUSE_KEN_PAYOFF_ID,
        mode: bridge.accusePayoffMode,
        status: bridge.accusePayoffStatus,
        appliedAt: bridge.accusePayoffAppliedAt,
        applyCount: bridge.accusePayoffApplyCount,
        previousDefenseIds: bridge.accusePayoffPreviousDefenseIds.slice(),
        defenseIds: bridge.accusePayoffDefenseIds.slice(),
      }
    );
    return true;
  }

  function ensureAccuseKenPayoff(battle) {
    const bridge = getBridgeState();
    const mode = getAccuseKenPayoffMode();
    if (!bridge || !battle || !mode) return false;
    const battleId = battle.id || battle.battleId || null;
    const taggedBridgeBattle = !!(battle.meta
      && battle.meta.stage7OnboardingBridgeId === REAL_BATTLE_BRIDGE_ID);
    if (!taggedBridgeBattle || !battleId
      || (bridge.battleId && bridge.battleId !== battleId)) return false;
    if (!bridge.accusePayoffMode) bridge.accusePayoffMode = mode;
    if (bridge.accusePayoffMode !== mode
      && !["used", "revealed", "expired"].includes(bridge.accusePayoffStatus)) {
      bridge.accusePayoffMode = mode;
    }
    if (bridge.accusePayoffStatus === "not_applicable") bridge.accusePayoffStatus = "pending";
    battle.meta = battle.meta && typeof battle.meta === "object" ? battle.meta : {};
    return syncAccuseKenPayoffMeta(battle);
  }

  function applyAccuseKenWitnessPayoff(battle) {
    if (!battle || !ensureAccuseKenPayoff(battle)) return false;
    const bridge = getBridgeState();
    if (!bridge || bridge.accusePayoffMode !== "witness") return false;
    if (bridge.accusePayoffStatus === "expired") return false;
    if (battle.resolved === true || battle.finished === true || battle.status === "finished") return false;
    if (battle.status !== "pickDefense" || !battle.attack) return false;
    const trueColor = battle.attack._color || battle.attack.color || null;
    if (!trueColor) return false;
    if (bridge.accusePayoffStatus === "revealed") {
      battle.attack.color = trueColor;
      battle.attackHidden = false;
      battle.revealColor = trueColor;
      syncAccuseKenPayoffMeta(battle);
      return true;
    }

    battle.attack.color = trueColor;
    battle.attackHidden = false;
    battle.revealColor = trueColor;
    bridge.accusePayoffStatus = "revealed";
    bridge.accusePayoffAppliedAt = bridge.accusePayoffAppliedAt || Date.now();
    bridge.accusePayoffApplyCount = Math.max(1, bridge.accusePayoffApplyCount + 1);
    syncAccuseKenPayoffMeta(battle);
    saveSnapshot();
    telemetry("first_experience.accuse_ken_payoff_applied", {
      payoffId: ACCUSE_KEN_PAYOFF_ID,
      battleId: battle.id || battle.battleId || null,
      mode: bridge.accusePayoffMode,
      color: trueColor,
      applyCount: bridge.accusePayoffApplyCount,
    });
    pushLine({
      system: true,
      text: "Настя привела свидетеля. Цвет первого вброса Райхана раскрыт.",
    });
    return true;
  }

  function initializeAccuseKenPayoff(battle) {
    if (!ensureAccuseKenPayoff(battle)) return false;
    const bridge = getBridgeState();
    if (!bridge) return false;
    saveSnapshot();
    if (bridge.accusePayoffMode === "witness") return applyAccuseKenWitnessPayoff(battle);
    return true;
  }

  function useAccuseKenRematchOptions(battleId, currentDefenseIds) {
    const battle = getBridgeBattleList().find((item) => item && (
      item.id === battleId || item.battleId === battleId
    ));
    if (!battle || !ensureAccuseKenPayoff(battle)) return false;
    const bridge = getBridgeState();
    if (!bridge || bridge.accusePayoffMode !== "public_rematch" || bridge.accusePayoffStatus !== "pending") return false;
    if (battle.resolved === true || battle.finished === true || battle.status === "finished") return false;
    if (battle.status !== "pickDefense") return false;
    const previousIds = Array.from(new Set(Array.isArray(currentDefenseIds)
      ? currentDefenseIds.map(String).filter((id) => id && !id.startsWith("__pad_"))
      : [])).slice(0, 3);
    if (previousIds.length !== 3) return false;

    bridge.accusePayoffStatus = "used";
    bridge.accusePayoffAppliedAt = bridge.accusePayoffAppliedAt || Date.now();
    bridge.accusePayoffApplyCount = Math.max(1, bridge.accusePayoffApplyCount + 1);
    bridge.accusePayoffPreviousDefenseIds = previousIds;
    bridge.accusePayoffDefenseIds = [];
    syncAccuseKenPayoffMeta(battle);
    saveSnapshot();
    telemetry("first_experience.accuse_ken_payoff_applied", {
      payoffId: ACCUSE_KEN_PAYOFF_ID,
      battleId: battle.id || battle.battleId || null,
      mode: bridge.accusePayoffMode,
      previousDefenseIds: previousIds.slice(),
      applyCount: bridge.accusePayoffApplyCount,
    });
    pushLine({
      system: true,
      text: "Ты принял публичный реванш и один раз сменил варианты ответа.",
    });
    return true;
  }

  function chooseAccuseKenRematchDefenseIds(battleId, candidateIds) {
    const battle = getBridgeBattleList().find((item) => item && (
      item.id === battleId || item.battleId === battleId
    ));
    if (!battle || !ensureAccuseKenPayoff(battle)) return null;
    const bridge = getBridgeState();
    if (!bridge || bridge.accusePayoffMode !== "public_rematch" || bridge.accusePayoffStatus !== "used") return null;
    const candidates = Array.from(new Set(Array.isArray(candidateIds)
      ? candidateIds.map(String).filter((id) => id && !id.startsWith("__pad_"))
      : []));
    if (candidates.length < 3) return null;

    const saved = bridge.accusePayoffDefenseIds.filter((id) => candidates.includes(id));
    if (saved.length === 3) {
      syncAccuseKenPayoffMeta(battle);
      return saved.slice();
    }

    const previous = new Set(bridge.accusePayoffPreviousDefenseIds);
    const selected = [];
    candidates.forEach((id) => {
      if (selected.length < 3 && !previous.has(id) && !selected.includes(id)) selected.push(id);
    });
    candidates.forEach((id) => {
      if (selected.length < 3 && !selected.includes(id)) selected.push(id);
    });
    if (selected.length !== 3) return null;
    bridge.accusePayoffDefenseIds = selected.slice();
    syncAccuseKenPayoffMeta(battle);
    saveSnapshot();
    telemetry("first_experience.accuse_ken_rematch_options_selected", {
      payoffId: ACCUSE_KEN_PAYOFF_ID,
      battleId: battle.id || battle.battleId || null,
      defenseIds: selected.slice(),
    });
    return selected;
  }

'''
controller = replace_once(
    controller,
    '  function adoptRealBattle(battle) {\n',
    accuse_functions + '  function adoptRealBattle(battle) {\n',
    "controller accuse functions",
)
controller = replace_once(
    controller,
    '''    initializeDenyEvidencePayoff(battle);
    saveSnapshot();
''',
    '''    initializeDenyEvidencePayoff(battle);
    initializeAccuseKenPayoff(battle);
    saveSnapshot();
''',
    "controller adopt initialize",
)
controller = replace_once(
    controller,
    '''    revealHeldDenyEvidence,
    resetForDev,
''',
    '''    revealHeldDenyEvidence,
    useAccuseKenRematchOptions,
    chooseAccuseKenRematchDefenseIds,
    resetForDev,
''',
    "controller public exports",
)
controller = replace_once(
    controller,
    '''  G.__DEV.revealStage7HeldDenyEvidence = revealHeldDenyEvidence;
  G.__DEV.getStage7IntermissionNpcIds''',
    '''  G.__DEV.revealStage7HeldDenyEvidence = revealHeldDenyEvidence;
  G.__DEV.useStage7AccuseKenRematchOptions = useAccuseKenRematchOptions;
  G.__DEV.chooseStage7AccuseKenRematchDefenseIds = chooseAccuseKenRematchDefenseIds;
  G.__DEV.getStage7IntermissionNpcIds''',
    "controller dev exports",
)
controller = replace_once(
    controller,
    '''    stage: "7.8",
''',
    '''    stage: "7.10",
''',
    "controller smoke stage",
)
controller = replace_once(
    controller,
    '''    denyEvidenceHeldManualReveal: true,
''',
    '''    denyEvidenceHeldManualReveal: true,
    accuseKenPayoffId: ACCUSE_KEN_PAYOFF_ID,
    accuseKenPublicRematchDefenseRefresh: true,
    accuseKenWitnessAutoReveal: true,
''',
    "controller smoke flags",
)
CONTROLLER.write_text(controller, encoding="utf-8")
CONTROLLER_DOCS.write_text(controller, encoding="utf-8")

battles = BATTLES.read_text(encoding="utf-8")
battles = replace_once(
    battles,
    '''        const stage7DenyEvidencePayoff = b && b.meta && b.meta.stage7DenyEvidencePayoff
          ? b.meta.stage7DenyEvidencePayoff
          : null;
''',
    '''        const stage7DenyEvidencePayoff = b && b.meta && b.meta.stage7DenyEvidencePayoff
          ? b.meta.stage7DenyEvidencePayoff
          : null;
        const stage7AccuseKenPayoff = b && b.meta && b.meta.stage7AccuseKenPayoff
          ? b.meta.stage7AccuseKenPayoff
          : null;
''',
    "battles payoff metadata",
)
battles = replace_once(
    battles,
    '''          const evidenceRevealed = !!(stage7DenyEvidencePayoff
            && stage7DenyEvidencePayoff.status === "revealed"
            && b.attack.color);
          chip.className = clsForColor(evidenceRevealed ? b.attack.color : null, !evidenceRevealed);
          chip.textContent = `Вброс: ${String(argCanonUiText(b.attack, "Q") || "")}`;
          if (!evidenceRevealed) chip.style.color = "rgba(255,255,255,.92)";
          else if (b.attack.color === "k") chip.style.color = "#ddd";
          else chip.style.color = "black";
          chip.dataset.stage7DenyEvidenceRevealed = String(evidenceRevealed);
''',
    '''          const evidenceRevealed = !!(stage7DenyEvidencePayoff
            && stage7DenyEvidencePayoff.status === "revealed"
            && b.attack.color);
          const witnessRevealed = !!(stage7AccuseKenPayoff
            && stage7AccuseKenPayoff.mode === "witness"
            && stage7AccuseKenPayoff.status === "revealed"
            && b.attack.color);
          const stage7ColorRevealed = evidenceRevealed || witnessRevealed;
          chip.className = clsForColor(stage7ColorRevealed ? b.attack.color : null, !stage7ColorRevealed);
          chip.textContent = `Вброс: ${String(argCanonUiText(b.attack, "Q") || "")}`;
          if (!stage7ColorRevealed) chip.style.color = "rgba(255,255,255,.92)";
          else if (b.attack.color === "k") chip.style.color = "#ddd";
          else chip.style.color = "black";
          chip.dataset.stage7DenyEvidenceRevealed = String(evidenceRevealed);
          chip.dataset.stage7AccuseWitnessRevealed = String(witnessRevealed);
''',
    "battles incoming reveal",
)
battles = replace_once(
    battles,
    '''          if (evidenceRevealed) {
            const evidenceNote = document.createElement("div");
            evidenceNote.className = "noteLine";
            evidenceNote.dataset.testid = "stage7-deny-evidence-revealed";
            evidenceNote.textContent = stage7DenyEvidencePayoff.mode === "held"
              ? "Сохранённое доказательство раскрыло цвет вброса."
              : "Публичное доказательство раскрыло цвет вброса.";
            card.appendChild(evidenceNote);
          }
''',
    '''          if (evidenceRevealed) {
            const evidenceNote = document.createElement("div");
            evidenceNote.className = "noteLine";
            evidenceNote.dataset.testid = "stage7-deny-evidence-revealed";
            evidenceNote.textContent = stage7DenyEvidencePayoff.mode === "held"
              ? "Сохранённое доказательство раскрыло цвет вброса."
              : "Публичное доказательство раскрыло цвет вброса.";
            card.appendChild(evidenceNote);
          }
          if (witnessRevealed) {
            const witnessNote = document.createElement("div");
            witnessNote.className = "noteLine";
            witnessNote.dataset.testid = "stage7-accuse-witness-revealed";
            witnessNote.textContent = "Свидетель Насти раскрыл цвет первого вброса.";
            card.appendChild(witnessNote);
          }
''',
    "battles reveal notes",
)
old_defense = '''            // Dedup and pad to exactly 3
            const seen = new Set();
            const uniq = [];
            const pushUniq = (arr) => {
              (arr || []).forEach(x => {
                if (!x || !x.id) return;
                if (seen.has(x.id)) return;
                seen.add(x.id);
                uniq.push(x);
              });
            };

            pushUniq(choices);

            if (uniq.length < 3) {
              let all = [];
              try {
                if (Game.Conflict && typeof Game.Conflict.myDefenseOptions === "function") {
                  if (Game.Conflict.myDefenseOptions.length >= 1) all = Game.Conflict.myDefenseOptions(b) || [];
                  else all = Game.Conflict.myDefenseOptions() || [];
                }
              } catch (_) {
                all = [];
              }

              if (wantType) {
                pushUniq(all.filter(x => (x.qtype || x.type || x.kind) === wantType));
              }
              pushUniq(all);
            }

            let finalChoices = uniq.slice(0, 3);
            shuffleInPlace(finalChoices);

            while (finalChoices.length < 3) {
              finalChoices.push({ id: `__pad_${finalChoices.length}`, color: null, text: "...", _pad: true });
            }

            return finalChoices;
'''
new_defense = '''            // Dedup and pad to exactly 3
            const seen = new Set();
            const uniq = [];
            const pushUniq = (arr) => {
              (arr || []).forEach(x => {
                if (!x || !x.id) return;
                if (seen.has(x.id)) return;
                seen.add(x.id);
                uniq.push(x);
              });
            };

            pushUniq(choices);
            const rematchRefreshUsed = !!(stage7AccuseKenPayoff
              && stage7AccuseKenPayoff.mode === "public_rematch"
              && stage7AccuseKenPayoff.status === "used");

            if (uniq.length < 3 || rematchRefreshUsed) {
              let all = [];
              try {
                if (Game.Conflict && typeof Game.Conflict.myDefenseOptions === "function") {
                  if (Game.Conflict.myDefenseOptions.length >= 1) all = Game.Conflict.myDefenseOptions(b) || [];
                  else all = Game.Conflict.myDefenseOptions() || [];
                }
              } catch (_) {
                all = [];
              }

              if (wantType) {
                pushUniq(all.filter(x => (x.qtype || x.type || x.kind) === wantType));
              }
              pushUniq(all);
            }

            let finalChoices = [];
            if (rematchRefreshUsed) {
              shuffleInPlace(uniq);
              const stage7 = Game && Game.Stage7FirstExperience;
              const selectedIds = stage7
                && typeof stage7.chooseAccuseKenRematchDefenseIds === "function"
                ? stage7.chooseAccuseKenRematchDefenseIds(b.id, uniq.map((item) => item.id))
                : null;
              if (Array.isArray(selectedIds)) {
                selectedIds.forEach((id) => {
                  const item = uniq.find((candidate) => candidate && candidate.id === id);
                  if (item && !finalChoices.includes(item)) finalChoices.push(item);
                });
              }
              if (finalChoices.length < 3) {
                const previousIds = new Set(Array.isArray(stage7AccuseKenPayoff.previousDefenseIds)
                  ? stage7AccuseKenPayoff.previousDefenseIds.map(String)
                  : []);
                uniq.forEach((item) => {
                  if (finalChoices.length < 3 && item && !previousIds.has(String(item.id)) && !finalChoices.includes(item)) {
                    finalChoices.push(item);
                  }
                });
                uniq.forEach((item) => {
                  if (finalChoices.length < 3 && item && !finalChoices.includes(item)) finalChoices.push(item);
                });
              }
            } else {
              finalChoices = uniq.slice(0, 3);
              shuffleInPlace(finalChoices);
            }

            while (finalChoices.length < 3) {
              finalChoices.push({ id: `__pad_${finalChoices.length}`, color: null, text: "...", _pad: true });
            }

            return finalChoices;
'''
battles = replace_once(battles, old_defense, new_defense, "battles defense refresh")
battles = replace_once(
    battles,
    '''          if (stage7DenyEvidencePayoff
            && stage7DenyEvidencePayoff.mode === "held"
''',
    '''          if (stage7AccuseKenPayoff
            && stage7AccuseKenPayoff.mode === "public_rematch"
            && stage7AccuseKenPayoff.status === "pending") {
            const rematchRefreshBtn = document.createElement("button");
            rematchRefreshBtn.className = "btn small";
            rematchRefreshBtn.type = "button";
            rematchRefreshBtn.dataset.testid = "stage7-accuse-rematch-refresh";
            rematchRefreshBtn.textContent = "Сменить ответы";
            rematchRefreshBtn.onclick = (e) => {
              stop(e);
              _captureBattleFocus(b.id, card);
              const currentIds = Array.isArray(b._defenseChoices)
                ? b._defenseChoices.filter((item) => item && !item._pad).map((item) => item.id)
                : [];
              const stage7 = Game && Game.Stage7FirstExperience;
              const used = !!(stage7
                && typeof stage7.useAccuseKenRematchOptions === "function"
                && stage7.useAccuseKenRematchOptions(b.id, currentIds));
              if (used) {
                try { delete b._defenseChoices; } catch (_) {}
                try {
                  if (UI._battleChoiceCache && UI._battleChoiceCache.defense) {
                    delete UI._battleChoiceCache.defense[String(b.id)];
                  }
                } catch (_) {}
              } else if (UI && typeof UI.showActionToast === "function") {
                UI.showActionToast(rematchRefreshBtn, "Смена ответов уже недоступна.");
              }
              requestAll();
            };
            actions.appendChild(rematchRefreshBtn);
          }

          if (stage7DenyEvidencePayoff
            && stage7DenyEvidencePayoff.mode === "held"
''',
    "battles rematch action",
)
battles = replace_once(
    battles,
    '''          card.appendChild(actions);
        }

        if (b.inlineNote) {
''',
    '''          card.appendChild(actions);
          if (stage7AccuseKenPayoff
            && stage7AccuseKenPayoff.mode === "public_rematch"
            && stage7AccuseKenPayoff.status === "used") {
            const rematchNote = document.createElement("div");
            rematchNote.className = "noteLine";
            rematchNote.dataset.testid = "stage7-accuse-rematch-used";
            rematchNote.textContent = "Ты уже один раз сменил варианты ответа перед публичным реваншем.";
            card.appendChild(rematchNote);
          }
        }

        if (b.inlineNote) {
''',
    "battles rematch note",
)
BATTLES.write_text(battles, encoding="utf-8")
BATTLES_DOCS.write_text(battles, encoding="utf-8")

index = INDEX.read_text(encoding="utf-8")
if index.count(OLD_MARKER) < 2:
    raise SystemExit(f"index marker expected at least twice, found {index.count(OLD_MARKER)}")
index = index.replace(OLD_MARKER, NEW_MARKER)
INDEX.write_text(index, encoding="utf-8")
INDEX_DOCS.write_text(index, encoding="utf-8")

for test_path in [
    Path("tools/test_stage7_7_preunlock_corridor.py"),
    Path("tools/test_stage7_first_causal_vertical_slice.py"),
    Path("tools/test_stage7_observed_evidence_harness.py"),
    Path("tools/test_stage7_9_deny_evidence_payoff.py"),
]:
    text = test_path.read_text(encoding="utf-8")
    if OLD_MARKER not in text:
        raise SystemExit(f"missing cache marker in {test_path}")
    test_path.write_text(text.replace(OLD_MARKER, NEW_MARKER), encoding="utf-8")

print("STAGE7_10_ACCUSE_KEN_PATCH_OK")
