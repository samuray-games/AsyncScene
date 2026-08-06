from pathlib import Path
import re

CONTROLLER = Path("AsyncScene/Web/ui/ui-stage7-first-experience.js")
CONTROLLER_DOCS = Path("docs/ui/ui-stage7-first-experience.js")
BATTLES = Path("AsyncScene/Web/ui/ui-battles.js")
BATTLES_DOCS = Path("docs/ui/ui-battles.js")
TEST = Path("tools/test_stage7_10_accuse_ken_payoffs.py")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected one match, found {count}")
    return text.replace(old, new, 1)


def regex_once(text: str, pattern: str, replacement: str, label: str) -> str:
    out, count = re.subn(pattern, replacement, text, count=1, flags=re.S)
    if count != 1:
        raise SystemExit(f"{label}: expected one match, found {count}")
    return out


controller = CONTROLLER.read_text(encoding="utf-8")
helpers = '''  function sanitizeDefenseChoice(raw) {
    if (!raw || typeof raw !== "object") return null;
    const id = typeof raw.id === "string" && raw.id.startsWith("canon_") ? raw.id : null;
    const text = typeof raw.text === "string" && raw.text.trim() ? raw.text : null;
    if (!id || !text) return null;
    const type = typeof raw.type === "string" && raw.type ? raw.type : null;
    const group = typeof raw.group === "string" && raw.group ? raw.group : type;
    return {
      id,
      color: ["y", "o", "r", "k"].includes(raw.color) ? raw.color : null,
      group,
      type: type || group,
      text,
      displayText: typeof raw.displayText === "string" && raw.displayText ? raw.displayText : text,
      _canonA: typeof raw._canonA === "string" && raw._canonA ? raw._canonA : null,
      _canonAId: typeof raw._canonAId === "string" && raw._canonAId ? raw._canonAId : null,
      _canonTextIndex: Number.isFinite(Number(raw._canonTextIndex)) ? Number(raw._canonTextIndex) : null,
      _sub: typeof raw._sub === "string" && raw._sub ? raw._sub : null,
    };
  }

  function defenseChoiceFingerprint(raw) {
    const choice = sanitizeDefenseChoice(raw);
    if (!choice) return null;
    if (choice._canonAId) return `canon:${choice._canonAId}`;
    return [choice.group || choice.type || "", choice.color || "", choice.text].join("|");
  }

  function sanitizeDefenseChoices(raw) {
    const out = [];
    const seenIds = new Set();
    (Array.isArray(raw) ? raw : []).forEach((item) => {
      const choice = sanitizeDefenseChoice(item);
      if (!choice || seenIds.has(choice.id)) return;
      seenIds.add(choice.id);
      out.push(choice);
    });
    return out.slice(0, 12);
  }

'''
controller = replace_once(
    controller,
    '  function defaultRealBattleBridge() {\n',
    helpers + '  function defaultRealBattleBridge() {\n',
    "controller defense snapshot helpers",
)
controller = replace_once(
    controller,
    '''      accusePayoffPreviousDefenseIds: [],
      accusePayoffDefenseIds: [],
      lastFailureReason: null,
''',
    '''      accusePayoffPreviousDefenseIds: [],
      accusePayoffDefenseIds: [],
      accusePayoffPreviousDefenseChoices: [],
      accusePayoffDefenseChoices: [],
      lastFailureReason: null,
''',
    "controller default choice snapshots",
)
controller = replace_once(
    controller,
    '''      accusePayoffDefenseIds: Array.from(new Set(Array.isArray(raw.accusePayoffDefenseIds)
        ? raw.accusePayoffDefenseIds.map(String).filter(Boolean).slice(0, 6)
        : [])),
      lastFailureReason: typeof raw.lastFailureReason === "string" && raw.lastFailureReason ? raw.lastFailureReason : null,
''',
    '''      accusePayoffDefenseIds: Array.from(new Set(Array.isArray(raw.accusePayoffDefenseIds)
        ? raw.accusePayoffDefenseIds.map(String).filter(Boolean).slice(0, 6)
        : [])),
      accusePayoffPreviousDefenseChoices: sanitizeDefenseChoices(raw.accusePayoffPreviousDefenseChoices).slice(0, 3),
      accusePayoffDefenseChoices: sanitizeDefenseChoices(raw.accusePayoffDefenseChoices).slice(0, 3),
      lastFailureReason: typeof raw.lastFailureReason === "string" && raw.lastFailureReason ? raw.lastFailureReason : null,
''',
    "controller sanitize choice snapshots",
)
controller = replace_once(
    controller,
    '''        previousDefenseIds: bridge.accusePayoffPreviousDefenseIds.slice(),
        defenseIds: bridge.accusePayoffDefenseIds.slice(),
''',
    '''        previousDefenseIds: bridge.accusePayoffPreviousDefenseIds.slice(),
        defenseIds: bridge.accusePayoffDefenseIds.slice(),
        previousDefenseChoices: clone(bridge.accusePayoffPreviousDefenseChoices) || [],
        defenseChoices: clone(bridge.accusePayoffDefenseChoices) || [],
''',
    "controller metadata choice snapshots",
)
new_payoff_functions = '''  function useAccuseKenRematchOptions(battleId, currentDefenseChoices, candidateChoices) {
    const battle = getBridgeBattleList().find((item) => item && (
      item.id === battleId || item.battleId === battleId
    ));
    if (!battle || !ensureAccuseKenPayoff(battle)) return false;
    const bridge = getBridgeState();
    if (!bridge || bridge.accusePayoffMode !== "public_rematch" || bridge.accusePayoffStatus !== "pending") return false;
    if (battle.resolved === true || battle.finished === true || battle.status === "finished") return false;
    if (battle.status !== "pickDefense") return false;

    const previousChoices = sanitizeDefenseChoices(currentDefenseChoices).slice(0, 3);
    const candidates = sanitizeDefenseChoices(candidateChoices);
    if (previousChoices.length !== 3 || candidates.length < 3) return false;
    const previousFingerprints = new Set(previousChoices.map(defenseChoiceFingerprint).filter(Boolean));
    const selected = [];
    const selectedFingerprints = new Set();
    const appendChoice = (choice, requireNew) => {
      if (!choice || selected.length >= 3) return;
      const fingerprint = defenseChoiceFingerprint(choice);
      if (!fingerprint || selectedFingerprints.has(fingerprint)) return;
      if (requireNew && previousFingerprints.has(fingerprint)) return;
      selected.push(choice);
      selectedFingerprints.add(fingerprint);
    };
    candidates.forEach((choice) => appendChoice(choice, true));
    candidates.forEach((choice) => appendChoice(choice, false));
    if (selected.length !== 3) return false;
    if (!selected.some((choice) => !previousFingerprints.has(defenseChoiceFingerprint(choice)))) return false;

    bridge.accusePayoffStatus = "used";
    bridge.accusePayoffAppliedAt = bridge.accusePayoffAppliedAt || Date.now();
    bridge.accusePayoffApplyCount = Math.max(1, bridge.accusePayoffApplyCount + 1);
    bridge.accusePayoffPreviousDefenseChoices = clone(previousChoices) || [];
    bridge.accusePayoffDefenseChoices = clone(selected) || [];
    bridge.accusePayoffPreviousDefenseIds = previousChoices.map((choice) => choice.id);
    bridge.accusePayoffDefenseIds = selected.map((choice) => choice.id);
    syncAccuseKenPayoffMeta(battle);
    saveSnapshot();
    telemetry("first_experience.accuse_ken_payoff_applied", {
      payoffId: ACCUSE_KEN_PAYOFF_ID,
      battleId: battle.id || battle.battleId || null,
      mode: bridge.accusePayoffMode,
      previousDefenseIds: bridge.accusePayoffPreviousDefenseIds.slice(),
      defenseIds: bridge.accusePayoffDefenseIds.slice(),
      applyCount: bridge.accusePayoffApplyCount,
    });
    pushLine({
      system: true,
      text: "Ты принял публичный реванш и один раз сменил варианты ответа.",
    });
    return true;
  }

  function chooseAccuseKenRematchDefenseChoices(battleId) {
    const battle = getBridgeBattleList().find((item) => item && (
      item.id === battleId || item.battleId === battleId
    ));
    if (!battle || !ensureAccuseKenPayoff(battle)) return null;
    const bridge = getBridgeState();
    if (!bridge || bridge.accusePayoffMode !== "public_rematch" || bridge.accusePayoffStatus !== "used") return null;
    const saved = sanitizeDefenseChoices(bridge.accusePayoffDefenseChoices).slice(0, 3);
    if (saved.length !== 3) return null;
    bridge.accusePayoffDefenseChoices = clone(saved) || [];
    bridge.accusePayoffDefenseIds = saved.map((choice) => choice.id);
    syncAccuseKenPayoffMeta(battle);
    return clone(saved);
  }

  function chooseAccuseKenRematchDefenseIds(battleId) {
    const choices = chooseAccuseKenRematchDefenseChoices(battleId);
    return Array.isArray(choices) ? choices.map((choice) => choice.id) : null;
  }

'''
controller = regex_once(
    controller,
    r'  function useAccuseKenRematchOptions\(battleId, currentDefenseIds\) \{.*?\n  function adoptRealBattle\(battle\) \{',
    new_payoff_functions + '  function adoptRealBattle(battle) {',
    "controller persisted rematch functions",
)
controller = replace_once(
    controller,
    '''    useAccuseKenRematchOptions,
    chooseAccuseKenRematchDefenseIds,
    resetForDev,
''',
    '''    useAccuseKenRematchOptions,
    chooseAccuseKenRematchDefenseChoices,
    chooseAccuseKenRematchDefenseIds,
    resetForDev,
''',
    "controller public choice snapshot export",
)
controller = replace_once(
    controller,
    '''  G.__DEV.useStage7AccuseKenRematchOptions = useAccuseKenRematchOptions;
  G.__DEV.chooseStage7AccuseKenRematchDefenseIds = chooseAccuseKenRematchDefenseIds;
''',
    '''  G.__DEV.useStage7AccuseKenRematchOptions = useAccuseKenRematchOptions;
  G.__DEV.chooseStage7AccuseKenRematchDefenseChoices = chooseAccuseKenRematchDefenseChoices;
  G.__DEV.chooseStage7AccuseKenRematchDefenseIds = chooseAccuseKenRematchDefenseIds;
''',
    "controller dev choice snapshot export",
)
CONTROLLER.write_text(controller, encoding="utf-8")
CONTROLLER_DOCS.write_text(controller, encoding="utf-8")

battles = BATTLES.read_text(encoding="utf-8")
old_build_branch = '''            if (uniq.length < 3 || rematchRefreshUsed) {
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
'''
new_build_branch = '''            if (uniq.length < 3) {
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
              const stage7 = Game && Game.Stage7FirstExperience;
              const restoredChoices = stage7
                && typeof stage7.chooseAccuseKenRematchDefenseChoices === "function"
                ? stage7.chooseAccuseKenRematchDefenseChoices(b.id)
                : null;
              if (Array.isArray(restoredChoices) && restoredChoices.length === 3) {
                finalChoices = restoredChoices;
              }
            }
            if (finalChoices.length !== 3) {
              finalChoices = uniq.slice(0, 3);
              shuffleInPlace(finalChoices);
            }
'''
battles = replace_once(battles, old_build_branch, new_build_branch, "battles restore full choices")
old_button = '''              const currentIds = Array.isArray(b._defenseChoices)
                ? b._defenseChoices.filter((item) => item && !item._pad).map((item) => item.id)
                : [];
              const stage7 = Game && Game.Stage7FirstExperience;
              const used = !!(stage7
                && typeof stage7.useAccuseKenRematchOptions === "function"
                && stage7.useAccuseKenRematchOptions(b.id, currentIds));
'''
new_button = '''              const currentChoices = Array.isArray(b._defenseChoices)
                ? b._defenseChoices.filter((item) => item && !item._pad)
                : [];
              const freshCandidates = [];
              for (let attempt = 0; attempt < 4; attempt += 1) {
                let batch = [];
                try {
                  if (Game.Conflict && typeof Game.Conflict.myDefenseOptions === "function") {
                    batch = Game.Conflict.myDefenseOptions(b) || [];
                  } else if (Game._ConflictArguments && typeof Game._ConflictArguments.myDefenseOptions === "function") {
                    batch = Game._ConflictArguments.myDefenseOptions(b) || [];
                  }
                } catch (_) {
                  batch = [];
                }
                (batch || []).forEach((item) => {
                  if (item && !item._pad) freshCandidates.push(item);
                });
              }
              const stage7 = Game && Game.Stage7FirstExperience;
              const used = !!(stage7
                && typeof stage7.useAccuseKenRematchOptions === "function"
                && stage7.useAccuseKenRematchOptions(b.id, currentChoices, freshCandidates));
'''
battles = replace_once(battles, old_button, new_button, "battles atomic full-choice reroll")
BATTLES.write_text(battles, encoding="utf-8")
BATTLES_DOCS.write_text(battles, encoding="utf-8")

test = TEST.read_text(encoding="utf-8")
test = replace_once(
    test,
    '    "chooseAccuseKenRematchDefenseIds",\n',
    '    "chooseAccuseKenRematchDefenseChoices",\n',
    "test marker",
)
test = replace_once(
    test,
    'INDEX_DOCS = Path("docs/index.html")\n',
    'INDEX_DOCS = Path("docs/index.html")\nCONFLICT_API = Path("AsyncScene/Web/conflict/conflict-api.js")\n',
    "test conflict API path",
)
test = replace_once(
    test,
    '''assert INDEX.read_text(encoding="utf-8") == INDEX_DOCS.read_text(encoding="utf-8")
''',
    '''assert INDEX.read_text(encoding="utf-8") == INDEX_DOCS.read_text(encoding="utf-8")
conflict_api = CONFLICT_API.read_text(encoding="utf-8")
assert "Array.isArray(battle._defenseChoices)" in conflict_api
assert "this._findArgById(battle._defenseChoices.filter" in conflict_api
''',
    "test restored choice resolution invariant",
)
old_dynamic = '''assert.strictEqual(Game.Stage7FirstExperience.useAccuseKenRematchOptions(first.battle.id, ["d1", "d2", "d3"]), true);
let selected = Game.Stage7FirstExperience.chooseAccuseKenRematchDefenseIds(
  first.battle.id,
  ["d1", "d2", "d3", "d4", "d5", "d6"]
);
assert.deepStrictEqual(selected, ["d4", "d5", "d6"]);
let snap = dev.getStage7FirstExperienceSnapshot();
assert.strictEqual(snap.realBattleBridge.accusePayoffStatus, "used");
assert.strictEqual(snap.realBattleBridge.accusePayoffApplyCount, 1);
assert.deepStrictEqual(snap.realBattleBridge.accusePayoffPreviousDefenseIds, ["d1", "d2", "d3"]);
assert.deepStrictEqual(snap.realBattleBridge.accusePayoffDefenseIds, ["d4", "d5", "d6"]);
assert.deepStrictEqual(first.battle.meta.stage7AccuseKenPayoff.defenseIds, ["d4", "d5", "d6"]);
assert.strictEqual(Game.Stage7FirstExperience.useAccuseKenRematchOptions(first.battle.id, ["d4", "d5", "d6"]), false);
selected = Game.Stage7FirstExperience.chooseAccuseKenRematchDefenseIds(
  first.battle.id,
  ["d6", "d5", "d4", "d3", "d2", "d1"]
);
assert.deepStrictEqual(selected, ["d4", "d5", "d6"]);
'''
new_dynamic = '''const previousChoices = [
  { id: "canon_d1", color: "y", group: "yn", type: "yn", text: "Старый ответ один", _canonAId: "old_1" },
  { id: "canon_d2", color: "y", group: "who", type: "who", text: "Старый ответ два", _canonAId: "old_2" },
  { id: "canon_d3", color: "y", group: "where", type: "where", text: "Старый ответ три", _canonAId: "old_3" },
];
const freshCandidates = [
  { id: "canon_d4", color: "y", group: "yn", type: "yn", text: "Новый ответ один", _canonAId: "new_1" },
  { id: "canon_d5", color: "y", group: "about", type: "about", text: "Новый ответ два", _canonAId: "new_2" },
  { id: "canon_d6", color: "y", group: "who", type: "who", text: "Новый ответ три", _canonAId: "new_3" },
];
assert.strictEqual(Game.Stage7FirstExperience.useAccuseKenRematchOptions(first.battle.id, previousChoices, freshCandidates), true);
let selected = Game.Stage7FirstExperience.chooseAccuseKenRematchDefenseChoices(first.battle.id);
assert.deepStrictEqual(selected.map((choice) => choice.id), ["canon_d4", "canon_d5", "canon_d6"]);
let snap = dev.getStage7FirstExperienceSnapshot();
assert.strictEqual(snap.realBattleBridge.accusePayoffStatus, "used");
assert.strictEqual(snap.realBattleBridge.accusePayoffApplyCount, 1);
assert.deepStrictEqual(snap.realBattleBridge.accusePayoffPreviousDefenseIds, ["canon_d1", "canon_d2", "canon_d3"]);
assert.deepStrictEqual(snap.realBattleBridge.accusePayoffDefenseIds, ["canon_d4", "canon_d5", "canon_d6"]);
assert.deepStrictEqual(snap.realBattleBridge.accusePayoffDefenseChoices.map((choice) => choice.text), ["Новый ответ один", "Новый ответ два", "Новый ответ три"]);
assert.deepStrictEqual(first.battle.meta.stage7AccuseKenPayoff.defenseIds, ["canon_d4", "canon_d5", "canon_d6"]);
assert.strictEqual(Game.Stage7FirstExperience.useAccuseKenRematchOptions(first.battle.id, freshCandidates, previousChoices), false);
selected = Game.Stage7FirstExperience.chooseAccuseKenRematchDefenseChoices(first.battle.id);
assert.deepStrictEqual(selected.map((choice) => choice.id), ["canon_d4", "canon_d5", "canon_d6"]);
'''
test = replace_once(test, old_dynamic, new_dynamic, "test full persisted choice contract")
test = replace_once(
    test,
    '''assert.deepStrictEqual(snap.realBattleBridge.accusePayoffDefenseIds, ["d4", "d5", "d6"]);
''',
    '''assert.deepStrictEqual(snap.realBattleBridge.accusePayoffDefenseIds, ["canon_d4", "canon_d5", "canon_d6"]);
assert.deepStrictEqual(
  Game.Stage7FirstExperience.chooseAccuseKenRematchDefenseChoices(first.battle.id).map((choice) => choice.text),
  ["Новый ответ один", "Новый ответ два", "Новый ответ три"]
);
''',
    "test resume full snapshot",
)
test = replace_once(
    test,
    '''assert.strictEqual(Game.Stage7FirstExperience.useAccuseKenRematchOptions("ordinary", ["d1", "d2", "d3"]), false);
assert.strictEqual(Game.Stage7FirstExperience.chooseAccuseKenRematchDefenseIds("ordinary", ["d1", "d2", "d3"]), null);
''',
    '''assert.strictEqual(Game.Stage7FirstExperience.useAccuseKenRematchOptions("ordinary", previousChoices, freshCandidates), false);
assert.strictEqual(Game.Stage7FirstExperience.chooseAccuseKenRematchDefenseChoices("ordinary"), null);
''',
    "test ordinary battle snapshot boundary",
)
test = replace_once(
    test,
    '''assert.strictEqual(Game.Stage7FirstExperience.useAccuseKenRematchOptions(first.battle.id, ["d1", "d2", "d3"]), false);
''',
    '''assert.strictEqual(Game.Stage7FirstExperience.useAccuseKenRematchOptions(first.battle.id, previousChoices, freshCandidates), false);
''',
    "test expired snapshot boundary",
)
TEST.write_text(test, encoding="utf-8")

print("STAGE7_10_PERSISTENCE_REPAIR_OK")
