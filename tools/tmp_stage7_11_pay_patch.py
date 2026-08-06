from pathlib import Path

CTRL = Path('AsyncScene/Web/ui/ui-stage7-first-experience.js')
CTRL_DOCS = Path('docs/ui/ui-stage7-first-experience.js')
BATTLES = Path('AsyncScene/Web/ui/ui-battles.js')
BATTLES_DOCS = Path('docs/ui/ui-battles.js')
INDEX = Path('AsyncScene/Web/index.html')
INDEX_DOCS = Path('docs/index.html')
OLD_TAG = 'stage7_10_accuse_ken_payoffs_20260806a'
NEW_TAG = 'stage7_11_pay_branch_payoffs_20260806a'


def replace_once(text, old, new, label):
    if text.count(old) != 1:
        raise SystemExit(f'{label}: expected one anchor, found {text.count(old)}: {old[:100]!r}')
    return text.replace(old, new, 1)


def patch_controller(text):
    text = replace_once(text,
        '  const ACCUSE_KEN_PAYOFF_ID = "stage7_accuse_ken_tactical_v1";\n',
        '  const ACCUSE_KEN_PAYOFF_ID = "stage7_accuse_ken_tactical_v1";\n  const PAY_PAYOFF_ID = "stage7_pay_tactical_v1";\n',
        'pay constant')

    text = replace_once(text,
        '      accusePayoffPreviousDefenseChoices: [],\n      accusePayoffDefenseChoices: [],\n      lastFailureReason: null,\n',
        '      accusePayoffPreviousDefenseChoices: [],\n      accusePayoffDefenseChoices: [],\n      payPayoffMode: null,\n      payPayoffStatus: "not_applicable",\n      payPayoffAppliedAt: null,\n      payPayoffApplyCount: 0,\n      payPayoffDefenseChoices: [],\n      payPayoffMarkedDefenseId: null,\n      payPayoffMarkedFingerprint: null,\n      lastFailureReason: null,\n',
        'pay defaults')

    text = replace_once(text,
        '      accusePayoffPreviousDefenseChoices: sanitizeDefenseChoices(raw.accusePayoffPreviousDefenseChoices).slice(0, 3),\n      accusePayoffDefenseChoices: sanitizeDefenseChoices(raw.accusePayoffDefenseChoices).slice(0, 3),\n      lastFailureReason: typeof raw.lastFailureReason === "string" && raw.lastFailureReason ? raw.lastFailureReason : null,\n',
        '      accusePayoffPreviousDefenseChoices: sanitizeDefenseChoices(raw.accusePayoffPreviousDefenseChoices).slice(0, 3),\n      accusePayoffDefenseChoices: sanitizeDefenseChoices(raw.accusePayoffDefenseChoices).slice(0, 3),\n      payPayoffMode: ["receipt", "pressure"].includes(raw.payPayoffMode) ? raw.payPayoffMode : null,\n      payPayoffStatus: ["not_applicable", "pending", "marked", "used", "expired"].includes(raw.payPayoffStatus)\n        ? raw.payPayoffStatus\n        : "not_applicable",\n      payPayoffAppliedAt: Number.isFinite(Number(raw.payPayoffAppliedAt)) ? Number(raw.payPayoffAppliedAt) : null,\n      payPayoffApplyCount: Math.max(0, Number(raw.payPayoffApplyCount) | 0),\n      payPayoffDefenseChoices: sanitizeDefenseChoices(raw.payPayoffDefenseChoices).slice(0, 3),\n      payPayoffMarkedDefenseId: typeof raw.payPayoffMarkedDefenseId === "string" && raw.payPayoffMarkedDefenseId\n        ? raw.payPayoffMarkedDefenseId\n        : null,\n      payPayoffMarkedFingerprint: typeof raw.payPayoffMarkedFingerprint === "string" && raw.payPayoffMarkedFingerprint\n        ? raw.payPayoffMarkedFingerprint\n        : null,\n      lastFailureReason: typeof raw.lastFailureReason === "string" && raw.lastFailureReason ? raw.lastFailureReason : null,\n',
        'pay sanitize')

    expire_anchor = '''    if (bridge.accusePayoffStatus === "pending") {
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
'''
    expire_new = expire_anchor + '''    if (bridge.payPayoffStatus === "pending") {
      bridge.payPayoffStatus = "expired";
      if (battle.meta && battle.meta.stage7PayPayoff) {
        battle.meta.stage7PayPayoff.status = "expired";
      }
      telemetry("first_experience.pay_payoff_expired", {
        payoffId: PAY_PAYOFF_ID,
        battleId: bridge.battleId,
        mode: bridge.payPayoffMode,
      });
    }
'''
    text = replace_once(text, expire_anchor, expire_new, 'pay expiry')

    insert_anchor = '''  function chooseAccuseKenRematchDefenseIds(battleId) {
    const choices = chooseAccuseKenRematchDefenseChoices(battleId);
    return Array.isArray(choices) ? choices.map((choice) => choice.id) : null;
  }

  function adoptRealBattle(battle) {
'''
    pay_functions = r'''  function chooseAccuseKenRematchDefenseIds(battleId) {
    const choices = chooseAccuseKenRematchDefenseChoices(battleId);
    return Array.isArray(choices) ? choices.map((choice) => choice.id) : null;
  }

  function normalizePayArgumentGroup(value) {
    const raw = value && (value.group || value.type || value.qtype || value.kind || value.questionType);
    const normalized = String(raw || "").trim().toLowerCase();
    if (["yesno", "yes-no", "yes_no", "да/нет", "да-нет"].includes(normalized)) return "yn";
    if (["topic", "о чем", "о-чем", "о_чем"].includes(normalized)) return "about";
    if (["what", "who/what", "who-what", "кто", "что", "кто/что", "кто-что"].includes(normalized)) return "who";
    return normalized;
  }

  function getPayPayoffMode() {
    if (!snapshot || snapshot.branchId !== "pay") return null;
    const memory = snapshot.npcMemory && snapshot.npcMemory.npc_bandit
      ? snapshot.npcMemory.npc_bandit
      : {};
    if (memory.receiptDemanded) return "receipt";
    if (memory.pressureIgnored) return "pressure";
    if (snapshot.followUpChoiceId === "primary") return "receipt";
    if (snapshot.followUpChoiceId === "secondary") return "pressure";
    return null;
  }

  function syncPayPayoffMeta(battle) {
    const bridge = getBridgeState();
    if (!bridge || !battle) return false;
    battle.meta = battle.meta && typeof battle.meta === "object" ? battle.meta : {};
    battle.meta.stage7PayPayoff = Object.assign({}, battle.meta.stage7PayPayoff || {}, {
      payoffId: PAY_PAYOFF_ID,
      mode: bridge.payPayoffMode,
      status: bridge.payPayoffStatus,
      appliedAt: bridge.payPayoffAppliedAt,
      applyCount: bridge.payPayoffApplyCount,
      defenseChoices: clone(bridge.payPayoffDefenseChoices) || [],
      markedDefenseId: bridge.payPayoffMarkedDefenseId,
      markedFingerprint: bridge.payPayoffMarkedFingerprint,
    });
    return true;
  }

  function ensurePayPayoff(battle) {
    const bridge = getBridgeState();
    const mode = getPayPayoffMode();
    if (!bridge || !battle || !mode) return false;
    const battleId = battle.id || battle.battleId || null;
    const taggedBridgeBattle = !!(battle.meta
      && battle.meta.stage7OnboardingBridgeId === REAL_BATTLE_BRIDGE_ID);
    if (!taggedBridgeBattle || !battleId
      || (bridge.battleId && bridge.battleId !== battleId)) return false;
    if (!bridge.payPayoffMode) bridge.payPayoffMode = mode;
    if (bridge.payPayoffMode !== mode
      && !["marked", "used", "expired"].includes(bridge.payPayoffStatus)) {
      bridge.payPayoffMode = mode;
    }
    if (bridge.payPayoffStatus === "not_applicable") bridge.payPayoffStatus = "pending";
    return syncPayPayoffMeta(battle);
  }

  function choosePayDefenseChoices(battleId) {
    const battle = getBridgeBattleList().find((item) => item && (
      item.id === battleId || item.battleId === battleId
    ));
    if (!battle || !ensurePayPayoff(battle)) return null;
    const bridge = getBridgeState();
    if (!bridge || !["receipt", "pressure"].includes(bridge.payPayoffMode)) return null;
    const saved = sanitizeDefenseChoices(bridge.payPayoffDefenseChoices).slice(0, 3);
    if (saved.length !== 3) return null;
    bridge.payPayoffDefenseChoices = clone(saved) || [];
    syncPayPayoffMeta(battle);
    return clone(saved);
  }

  function preparePayDefenseChoices(battleId, currentDefenseChoices) {
    const battle = getBridgeBattleList().find((item) => item && (
      item.id === battleId || item.battleId === battleId
    ));
    if (!battle || !ensurePayPayoff(battle)) return null;
    const bridge = getBridgeState();
    if (!bridge || battle.status !== "pickDefense"
      || battle.resolved === true || battle.finished === true) return null;

    const alreadySaved = sanitizeDefenseChoices(bridge.payPayoffDefenseChoices).slice(0, 3);
    if (alreadySaved.length === 3) {
      bridge.payPayoffDefenseChoices = clone(alreadySaved) || [];
      syncPayPayoffMeta(battle);
      return clone(alreadySaved);
    }

    const choices = sanitizeDefenseChoices(currentDefenseChoices).slice(0, 3);
    if (choices.length !== 3) return null;
    bridge.payPayoffDefenseChoices = clone(choices) || [];

    if (bridge.payPayoffMode === "receipt" && bridge.payPayoffStatus === "pending") {
      const attackGroup = normalizePayArgumentGroup(battle.attack);
      const matching = choices.find((choice) => normalizePayArgumentGroup(choice) === attackGroup) || null;
      if (!matching) return null;
      bridge.payPayoffStatus = "marked";
      bridge.payPayoffAppliedAt = bridge.payPayoffAppliedAt || Date.now();
      bridge.payPayoffApplyCount = Math.max(1, bridge.payPayoffApplyCount + 1);
      bridge.payPayoffMarkedDefenseId = matching.id;
      bridge.payPayoffMarkedFingerprint = defenseChoiceFingerprint(matching);
      telemetry("first_experience.pay_payoff_applied", {
        payoffId: PAY_PAYOFF_ID,
        battleId,
        mode: bridge.payPayoffMode,
        markedDefenseId: matching.id,
        applyCount: bridge.payPayoffApplyCount,
      });
      pushLine({
        system: true,
        text: "Расписка Олега помогла отделить подходящий по типу ответ.",
      });
    }

    syncPayPayoffMeta(battle);
    saveSnapshot();
    return clone(choices);
  }

  function usePayPressureAnalysis(battleId, currentDefenseChoices) {
    const battle = getBridgeBattleList().find((item) => item && (
      item.id === battleId || item.battleId === battleId
    ));
    if (!battle || !ensurePayPayoff(battle)) return false;
    const bridge = getBridgeState();
    if (!bridge || bridge.payPayoffMode !== "pressure" || bridge.payPayoffStatus !== "pending") return false;
    if (battle.status !== "pickDefense" || battle.resolved === true || battle.finished === true) return false;

    const choices = sanitizeDefenseChoices(currentDefenseChoices).slice(0, 3);
    if (choices.length !== 3) return false;
    const attackGroup = normalizePayArgumentGroup(battle.attack);
    const wrong = choices.find((choice) => normalizePayArgumentGroup(choice) !== attackGroup) || null;
    if (!wrong) return false;

    bridge.payPayoffStatus = "used";
    bridge.payPayoffAppliedAt = bridge.payPayoffAppliedAt || Date.now();
    bridge.payPayoffApplyCount = Math.max(1, bridge.payPayoffApplyCount + 1);
    bridge.payPayoffDefenseChoices = clone(choices) || [];
    bridge.payPayoffMarkedDefenseId = wrong.id;
    bridge.payPayoffMarkedFingerprint = defenseChoiceFingerprint(wrong);
    syncPayPayoffMeta(battle);
    saveSnapshot();
    telemetry("first_experience.pay_payoff_applied", {
      payoffId: PAY_PAYOFF_ID,
      battleId,
      mode: bridge.payPayoffMode,
      markedDefenseId: wrong.id,
      applyCount: bridge.payPayoffApplyCount,
    });
    pushLine({
      system: true,
      text: "Ты разобрал давление Олега и заметил один ответ, который не подходит к типу вброса.",
    });
    return true;
  }

  function initializePayPayoff(battle) {
    if (!ensurePayPayoff(battle)) return false;
    saveSnapshot();
    return true;
  }

  function adoptRealBattle(battle) {
'''
    text = replace_once(text, insert_anchor, pay_functions, 'pay functions')

    text = replace_once(text,
        '    initializeDenyEvidencePayoff(battle);\n    initializeAccuseKenPayoff(battle);\n    saveSnapshot();\n',
        '    initializeDenyEvidencePayoff(battle);\n    initializeAccuseKenPayoff(battle);\n    initializePayPayoff(battle);\n    saveSnapshot();\n',
        'pay initialize')

    text = replace_once(text,
        '    useAccuseKenRematchOptions,\n    chooseAccuseKenRematchDefenseChoices,\n    chooseAccuseKenRematchDefenseIds,\n    resetForDev,\n',
        '    useAccuseKenRematchOptions,\n    chooseAccuseKenRematchDefenseChoices,\n    chooseAccuseKenRematchDefenseIds,\n    preparePayDefenseChoices,\n    choosePayDefenseChoices,\n    usePayPressureAnalysis,\n    resetForDev,\n',
        'pay exports')
    return text


def patch_battles(text):
    text = replace_once(text,
        '        const stage7AccuseKenPayoff = b && b.meta && b.meta.stage7AccuseKenPayoff\n          ? b.meta.stage7AccuseKenPayoff\n          : null;\n\n        const tactRow',
        '        const stage7AccuseKenPayoff = b && b.meta && b.meta.stage7AccuseKenPayoff\n          ? b.meta.stage7AccuseKenPayoff\n          : null;\n        const stage7PayPayoff = b && b.meta && b.meta.stage7PayPayoff\n          ? b.meta.stage7PayPayoff\n          : null;\n\n        const tactRow',
        'pay meta')

    text = replace_once(text,
        '          const choices = _getOrBuildChoices(b, "_defenseChoices", buildDefenseChoices);\n\n          const pickDefenseFn',
        '''          let choices = null;
          const stage7Controller = Game && Game.Stage7FirstExperience;
          const restoredPayChoices = stage7Controller
            && typeof stage7Controller.choosePayDefenseChoices === "function"
            ? stage7Controller.choosePayDefenseChoices(b.id)
            : null;
          if (Array.isArray(restoredPayChoices) && restoredPayChoices.length === 3) {
            choices = restoredPayChoices;
            b._defenseChoices = restoredPayChoices;
            if (UI._battleChoiceCache && UI._battleChoiceCache.defense) {
              UI._battleChoiceCache.defense[String(b.id)] = restoredPayChoices;
            }
          } else {
            choices = _getOrBuildChoices(b, "_defenseChoices", buildDefenseChoices);
            const preparedPayChoices = stage7Controller
              && typeof stage7Controller.preparePayDefenseChoices === "function"
              ? stage7Controller.preparePayDefenseChoices(b.id, choices)
              : null;
            if (Array.isArray(preparedPayChoices) && preparedPayChoices.length === 3) {
              choices = preparedPayChoices;
              b._defenseChoices = preparedPayChoices;
              if (UI._battleChoiceCache && UI._battleChoiceCache.defense) {
                UI._battleChoiceCache.defense[String(b.id)] = preparedPayChoices;
              }
            }
          }

          const pickDefenseFn''',
        'pay choice restore')

    text = replace_once(text,
        '            chip.className = clsForColor(p.color);\n            chip.textContent = argCanonUiText(p, "A");\n\n            // Counter-arguments: hover hints disabled\n',
        '''            chip.className = clsForColor(p.color);
            chip.textContent = argCanonUiText(p, "A");
            const livePayPayoff = b && b.meta && b.meta.stage7PayPayoff
              ? b.meta.stage7PayPayoff
              : null;
            const payMarked = !!(livePayPayoff
              && livePayPayoff.markedDefenseId
              && String(livePayPayoff.markedDefenseId) === String(p.id));
            if (payMarked) {
              const originalDefenseText = chip.textContent;
              chip.textContent = livePayPayoff.mode === "receipt"
                ? `✓ По расписке: ${originalDefenseText}`
                : `⚠ Давление Олега: ${originalDefenseText}`;
              chip.dataset.stage7PayMarked = "true";
              chip.dataset.testid = livePayPayoff.mode === "receipt"
                ? "stage7-pay-receipt-marked-defense"
                : "stage7-pay-pressure-marked-defense";
              chip.style.outline = "2px solid currentColor";
              chip.style.outlineOffset = "2px";
            }

            // Counter-arguments: hover hints disabled
''',
        'pay marked chip')

    text = replace_once(text,
        '''          card.appendChild(row);
        }

       // Per-battle actions (only while picking defense)
''',
        '''          card.appendChild(row);
          const livePayNote = b && b.meta && b.meta.stage7PayPayoff
            ? b.meta.stage7PayPayoff
            : null;
          if (livePayNote && livePayNote.mode === "receipt" && livePayNote.status === "marked") {
            const note = document.createElement("div");
            note.className = "noteLine";
            note.dataset.testid = "stage7-pay-receipt-note";
            note.textContent = "Расписка подтверждает: отмеченный ответ подходит к типу вброса.";
            card.appendChild(note);
          } else if (livePayNote && livePayNote.mode === "pressure" && livePayNote.status === "used") {
            const note = document.createElement("div");
            note.className = "noteLine";
            note.dataset.testid = "stage7-pay-pressure-note";
            note.textContent = "Ты разобрал давление Олега: отмеченный ответ не подходит к типу вброса.";
            card.appendChild(note);
          }
        }

       // Per-battle actions (only while picking defense)
''',
        'pay note')

    text = replace_once(text,
        '''          const actions = document.createElement("div");
          actions.className = "actions";

          if (stage7AccuseKenPayoff
''',
        '''          const actions = document.createElement("div");
          actions.className = "actions";

          const livePayAction = b && b.meta && b.meta.stage7PayPayoff
            ? b.meta.stage7PayPayoff
            : stage7PayPayoff;
          if (livePayAction
            && livePayAction.mode === "pressure"
            && livePayAction.status === "pending") {
            const pressureBtn = document.createElement("button");
            pressureBtn.className = "btn small";
            pressureBtn.type = "button";
            pressureBtn.dataset.testid = "stage7-pay-pressure-analyze";
            pressureBtn.textContent = "Разобрать давление";
            pressureBtn.onclick = (e) => {
              stop(e);
              _captureBattleFocus(b.id, card);
              const currentChoices = Array.isArray(b._defenseChoices)
                ? b._defenseChoices.filter((item) => item && !item._pad)
                : [];
              const stage7 = Game && Game.Stage7FirstExperience;
              const used = !!(stage7
                && typeof stage7.usePayPressureAnalysis === "function"
                && stage7.usePayPressureAnalysis(b.id, currentChoices));
              if (!used && UI && typeof UI.showActionToast === "function") {
                UI.showActionToast(pressureBtn, "Разбор давления уже недоступен.");
              }
              requestAll();
            };
            actions.appendChild(pressureBtn);
          }

          if (stage7AccuseKenPayoff
''',
        'pay action')
    return text


controller = patch_controller(CTRL.read_text(encoding='utf-8'))
CTRL.write_text(controller, encoding='utf-8')
CTRL_DOCS.write_text(controller, encoding='utf-8')

battles = patch_battles(BATTLES.read_text(encoding='utf-8'))
BATTLES.write_text(battles, encoding='utf-8')
BATTLES_DOCS.write_text(battles, encoding='utf-8')

for path in (INDEX, INDEX_DOCS):
    text = path.read_text(encoding='utf-8')
    if text.count(OLD_TAG) < 2:
        raise SystemExit(f'{path}: old cache tag missing')
    path.write_text(text.replace(OLD_TAG, NEW_TAG), encoding='utf-8')

for path in Path('tools').glob('test_stage7*.py'):
    text = path.read_text(encoding='utf-8')
    if OLD_TAG in text:
        path.write_text(text.replace(OLD_TAG, NEW_TAG), encoding='utf-8')

print('STAGE7_11_PAY_PATCH_OK')
