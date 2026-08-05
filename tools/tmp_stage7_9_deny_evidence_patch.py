from pathlib import Path

CONTROLLER_PATHS = [
    Path("AsyncScene/Web/ui/ui-stage7-first-experience.js"),
    Path("docs/ui/ui-stage7-first-experience.js"),
]
BATTLE_UI_PATHS = [
    Path("AsyncScene/Web/ui/ui-battles.js"),
    Path("docs/ui/ui-battles.js"),
]
INDEX_PATHS = [Path("AsyncScene/Web/index.html"), Path("docs/index.html")]
OLD_CACHE = "stage7_8_real_argument_battle_20260806a"
NEW_CACHE = "stage7_9_deny_evidence_payoff_20260806a"


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected one match, found {count}")
    return text.replace(old, new, 1)


def patch_controller(text: str) -> str:
    text = replace_once(
        text,
        '  const REAL_BATTLE_MAX_ATTEMPTS = 40;\n',
        '  const REAL_BATTLE_MAX_ATTEMPTS = 40;\n  const DENY_EVIDENCE_PAYOFF_ID = "stage7_deny_evidence_reveal_v1";\n',
        "controller constant",
    )
    text = replace_once(
        text,
        '      attemptCount: 0,\n      lastAttemptAt: null,\n      lastFailureReason: null,\n',
        '      attemptCount: 0,\n      lastAttemptAt: null,\n      evidencePayoffMode: null,\n      evidencePayoffStatus: "not_applicable",\n      evidencePayoffRevealedAt: null,\n      evidencePayoffRevealCount: 0,\n      lastFailureReason: null,\n',
        "controller bridge defaults",
    )
    text = replace_once(
        text,
        '      attemptCount: Math.max(0, Number(raw.attemptCount) | 0),\n      lastAttemptAt: Number.isFinite(Number(raw.lastAttemptAt)) ? Number(raw.lastAttemptAt) : null,\n      lastFailureReason: typeof raw.lastFailureReason === "string" && raw.lastFailureReason ? raw.lastFailureReason : null,\n',
        '      attemptCount: Math.max(0, Number(raw.attemptCount) | 0),\n      lastAttemptAt: Number.isFinite(Number(raw.lastAttemptAt)) ? Number(raw.lastAttemptAt) : null,\n      evidencePayoffMode: ["shared", "held"].includes(raw.evidencePayoffMode) ? raw.evidencePayoffMode : null,\n      evidencePayoffStatus: ["not_applicable", "pending", "revealed", "expired"].includes(raw.evidencePayoffStatus)\n        ? raw.evidencePayoffStatus\n        : "not_applicable",\n      evidencePayoffRevealedAt: Number.isFinite(Number(raw.evidencePayoffRevealedAt)) ? Number(raw.evidencePayoffRevealedAt) : null,\n      evidencePayoffRevealCount: Math.max(0, Number(raw.evidencePayoffRevealCount) | 0),\n      lastFailureReason: typeof raw.lastFailureReason === "string" && raw.lastFailureReason ? raw.lastFailureReason : null,\n',
        "controller bridge sanitize",
    )
    insertion_marker = '''  function adoptRealBattle(battle) {
'''
    functions = '''  function getDenyEvidencePayoffMode() {
    if (!snapshot || snapshot.branchId !== "deny") return null;
    const memory = snapshot.npcMemory && snapshot.npcMemory.npc_stage7_mika
      ? snapshot.npcMemory.npc_stage7_mika
      : {};
    if (memory.evidenceShared) return "shared";
    if (memory.evidenceHeld) return "held";
    if (snapshot.followUpChoiceId === "primary") return "shared";
    if (snapshot.followUpChoiceId === "secondary") return "held";
    return null;
  }

  function ensureDenyEvidencePayoff(battle) {
    const bridge = getBridgeState();
    const mode = getDenyEvidencePayoffMode();
    if (!bridge || !battle || !mode) return false;
    if (!bridge.evidencePayoffMode) bridge.evidencePayoffMode = mode;
    if (bridge.evidencePayoffMode !== mode
      && !["revealed", "expired"].includes(bridge.evidencePayoffStatus)) {
      bridge.evidencePayoffMode = mode;
    }
    if (bridge.evidencePayoffStatus === "not_applicable") bridge.evidencePayoffStatus = "pending";
    battle.meta = battle.meta && typeof battle.meta === "object" ? battle.meta : {};
    battle.meta.stage7DenyEvidencePayoff = Object.assign(
      {},
      battle.meta.stage7DenyEvidencePayoff || {},
      {
        payoffId: DENY_EVIDENCE_PAYOFF_ID,
        mode: bridge.evidencePayoffMode,
        status: bridge.evidencePayoffStatus,
        revealedAt: bridge.evidencePayoffRevealedAt,
        revealCount: bridge.evidencePayoffRevealCount,
      }
    );
    return true;
  }

  function revealDenyEvidencePayoff(battle, trigger) {
    if (!battle || !ensureDenyEvidencePayoff(battle)) return false;
    const bridge = getBridgeState();
    const payoff = battle.meta && battle.meta.stage7DenyEvidencePayoff;
    if (!bridge || !payoff) return false;
    if (bridge.evidencePayoffStatus === "revealed") return true;
    if (bridge.evidencePayoffStatus === "expired") return false;
    if (battle.resolved === true || battle.finished === true || battle.status === "finished") return false;
    if (battle.status !== "pickDefense" || !battle.attack) return false;
    const trueColor = battle.attack._color || battle.attack.color || null;
    if (!trueColor) return false;

    battle.attack.color = trueColor;
    battle.attackHidden = false;
    battle.revealColor = trueColor;
    bridge.evidencePayoffStatus = "revealed";
    bridge.evidencePayoffRevealedAt = bridge.evidencePayoffRevealedAt || Date.now();
    bridge.evidencePayoffRevealCount = Math.max(1, bridge.evidencePayoffRevealCount + 1);
    payoff.status = "revealed";
    payoff.revealedAt = bridge.evidencePayoffRevealedAt;
    payoff.revealCount = bridge.evidencePayoffRevealCount;
    payoff.trigger = trigger === "held_manual" ? "held_manual" : "shared_auto";
    saveSnapshot();
    telemetry("first_experience.deny_evidence_payoff_revealed", {
      payoffId: DENY_EVIDENCE_PAYOFF_ID,
      battleId: battle.id || battle.battleId || null,
      mode: bridge.evidencePayoffMode,
      trigger: payoff.trigger,
      color: trueColor,
      revealCount: bridge.evidencePayoffRevealCount,
    });
    pushLine({
      system: true,
      text: bridge.evidencePayoffMode === "held"
        ? "Ты предъявил сохранённое доказательство. Цвет вброса Райхана раскрыт."
        : "Настя уже показала доказательство. Цвет вброса Райхана раскрыт.",
    });
    return true;
  }

  function initializeDenyEvidencePayoff(battle) {
    if (!ensureDenyEvidencePayoff(battle)) return false;
    const bridge = getBridgeState();
    if (!bridge) return false;
    saveSnapshot();
    if (bridge.evidencePayoffMode === "shared" && bridge.evidencePayoffStatus === "pending") {
      return revealDenyEvidencePayoff(battle, "shared_auto");
    }
    return true;
  }

  function revealHeldDenyEvidence(battleId) {
    const battle = getBridgeBattleList().find((item) => item && (
      item.id === battleId || item.battleId === battleId
    ));
    if (!battle || !ensureDenyEvidencePayoff(battle)) return false;
    const bridge = getBridgeState();
    if (!bridge || bridge.evidencePayoffMode !== "held") return false;
    return revealDenyEvidencePayoff(battle, "held_manual");
  }

'''
    text = replace_once(text, insertion_marker, functions + insertion_marker, "controller payoff functions")
    text = replace_once(
        text,
        '''    bridge.status = "created";
    bridge.battleId = battle.id || battle.battleId || bridge.battleId;
    bridge.createdAt = bridge.createdAt || Date.now();
    bridge.lastFailureReason = null;
    saveSnapshot();
    telemetry("first_experience.real_argument_battle_created", {
''',
        '''    bridge.status = "created";
    bridge.battleId = battle.id || battle.battleId || bridge.battleId;
    bridge.createdAt = bridge.createdAt || Date.now();
    bridge.lastFailureReason = null;
    initializeDenyEvidencePayoff(battle);
    saveSnapshot();
    telemetry("first_experience.real_argument_battle_created", {
''',
        "controller adopt initialize",
    )
    text = replace_once(
        text,
        '''    bridge.lastFailureReason = null;
    saveSnapshot();
    telemetry("first_experience.real_argument_battle_completed", {
''',
        '''    bridge.lastFailureReason = null;
    if (bridge.evidencePayoffStatus === "pending") {
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
    telemetry("first_experience.real_argument_battle_completed", {
''',
        "controller payoff expiry",
    )
    text = replace_once(
        text,
        '''        snapshot = Object.assign(existing, { realBattleBridge: bridge });
        attach(nextContext);
        releaseNormalWorldOnce();
        syncRealArgumentBattleLifecycle();
''',
        '''        snapshot = Object.assign(existing, { realBattleBridge: bridge });
        attach(nextContext);
        initializeDenyEvidencePayoff(resumedBattle);
        releaseNormalWorldOnce();
        syncRealArgumentBattleLifecycle();
''',
        "controller active resume payoff",
    )
    text = replace_once(
        text,
        '''    getSnapshot,
    getObservedEvidenceReport,
    resetForDev,
''',
        '''    getSnapshot,
    getObservedEvidenceReport,
    revealHeldDenyEvidence,
    resetForDev,
''',
        "controller public api",
    )
    text = replace_once(
        text,
        '''  G.__DEV.runStage7RealArgumentBattleBridge = attemptRealArgumentBattleBridge;
  G.__DEV.syncStage7RealArgumentBattleLifecycle = syncRealArgumentBattleLifecycle;
''',
        '''  G.__DEV.runStage7RealArgumentBattleBridge = attemptRealArgumentBattleBridge;
  G.__DEV.syncStage7RealArgumentBattleLifecycle = syncRealArgumentBattleLifecycle;
  G.__DEV.revealStage7HeldDenyEvidence = revealHeldDenyEvidence;
''',
        "controller dev api",
    )
    text = replace_once(
        text,
        '''    realArgumentBattleBridgePending: false,
    realArgumentBattleBridgeId: REAL_BATTLE_BRIDGE_ID,
''',
        '''    realArgumentBattleBridgePending: false,
    realArgumentBattleBridgeId: REAL_BATTLE_BRIDGE_ID,
    denyEvidencePayoffId: DENY_EVIDENCE_PAYOFF_ID,
    denyEvidenceSharedAutoReveal: true,
    denyEvidenceHeldManualReveal: true,
''',
        "controller smoke markers",
    )
    return text


def patch_battle_ui(text: str) -> str:
    text = replace_once(
        text,
        '''        const canFreeOff = (S && S.me && Number.isFinite(S.me.influence) ? S.me.influence : (S && S.me ? (S.me.influence || 0) : 0)) >= 5;

        const tactRow = document.createElement("div");
''',
        '''        const canFreeOff = (S && S.me && Number.isFinite(S.me.influence) ? S.me.influence : (S && S.me ? (S.me.influence || 0) : 0)) >= 5;
        const stage7DenyEvidencePayoff = b && b.meta && b.meta.stage7DenyEvidencePayoff
          ? b.meta.stage7DenyEvidencePayoff
          : null;

        const tactRow = document.createElement("div");
''',
        "battle ui payoff metadata",
    )
    text = replace_once(
        text,
        '''          const chip = document.createElement("div");
          chip.className = clsForColor(null, true);
          chip.textContent = `Вброс: ${String(argCanonUiText(b.attack, "Q") || "")}`;
          chip.style.color = "rgba(255,255,255,.92)";
''',
        '''          const chip = document.createElement("div");
          const evidenceRevealed = !!(stage7DenyEvidencePayoff
            && stage7DenyEvidencePayoff.status === "revealed"
            && b.attack.color);
          chip.className = clsForColor(evidenceRevealed ? b.attack.color : null, !evidenceRevealed);
          chip.textContent = `Вброс: ${String(argCanonUiText(b.attack, "Q") || "")}`;
          if (!evidenceRevealed) chip.style.color = "rgba(255,255,255,.92)";
          else if (b.attack.color === "k") chip.style.color = "#ddd";
          else chip.style.color = "black";
          chip.dataset.stage7DenyEvidenceRevealed = String(evidenceRevealed);
''',
        "battle ui revealed attack",
    )
    text = replace_once(
        text,
        '''          incoming.appendChild(chip);
          card.appendChild(incoming);
        }

       // Attack choices (ALWAYS 3) - built once per battle/status, then reused
''',
        '''          incoming.appendChild(chip);
          card.appendChild(incoming);
          if (evidenceRevealed) {
            const evidenceNote = document.createElement("div");
            evidenceNote.className = "noteLine";
            evidenceNote.dataset.testid = "stage7-deny-evidence-revealed";
            evidenceNote.textContent = stage7DenyEvidencePayoff.mode === "held"
              ? "Сохранённое доказательство раскрыло цвет вброса."
              : "Публичное доказательство раскрыло цвет вброса.";
            card.appendChild(evidenceNote);
          }
        }

       // Attack choices (ALWAYS 3) - built once per battle/status, then reused
''',
        "battle ui evidence note",
    )
    text = replace_once(
        text,
        '''       if (b.status === "pickDefense") {
          const actions = document.createElement("div");
          actions.className = "actions";

          const isMafiaBattle = !!(opp && opp.role === "mafia");
''',
        '''       if (b.status === "pickDefense") {
          const actions = document.createElement("div");
          actions.className = "actions";

          if (stage7DenyEvidencePayoff
            && stage7DenyEvidencePayoff.mode === "held"
            && stage7DenyEvidencePayoff.status === "pending") {
            const evidenceBtn = document.createElement("button");
            evidenceBtn.className = "btn small";
            evidenceBtn.type = "button";
            evidenceBtn.dataset.testid = "stage7-deny-evidence-reveal";
            evidenceBtn.textContent = "Показать доказательство";
            evidenceBtn.onclick = (e) => {
              stop(e);
              _captureBattleFocus(b.id, card);
              const stage7 = Game && Game.Stage7FirstExperience;
              const used = !!(stage7
                && typeof stage7.revealHeldDenyEvidence === "function"
                && stage7.revealHeldDenyEvidence(b.id));
              if (!used && UI && typeof UI.showActionToast === "function") {
                UI.showActionToast(evidenceBtn, "Доказательство уже недоступно.");
              }
              requestAll();
            };
            actions.appendChild(evidenceBtn);
          }

          const isMafiaBattle = !!(opp && opp.role === "mafia");
''',
        "battle ui held button",
    )
    return text


for path in CONTROLLER_PATHS:
    path.write_text(patch_controller(path.read_text(encoding="utf-8")), encoding="utf-8")

for path in BATTLE_UI_PATHS:
    path.write_text(patch_battle_ui(path.read_text(encoding="utf-8")), encoding="utf-8")

for path in INDEX_PATHS:
    text = path.read_text(encoding="utf-8")
    if text.count(OLD_CACHE) < 2:
        raise SystemExit(f"{path}: old cache marker missing")
    path.write_text(text.replace(OLD_CACHE, NEW_CACHE), encoding="utf-8")

for path in [
    Path("tools/test_stage7_first_causal_vertical_slice.py"),
    Path("tools/test_stage7_observed_evidence_harness.py"),
    Path("tools/test_stage7_7_preunlock_corridor.py"),
]:
    text = path.read_text(encoding="utf-8")
    if OLD_CACHE not in text:
        raise SystemExit(f"{path}: stale cache assertion missing")
    path.write_text(text.replace(OLD_CACHE, NEW_CACHE), encoding="utf-8")

TEST = r'''from pathlib import Path
import subprocess
import tempfile

CONTROLLER = Path("AsyncScene/Web/ui/ui-stage7-first-experience.js")
CONTROLLER_DOCS = Path("docs/ui/ui-stage7-first-experience.js")
BATTLES = Path("AsyncScene/Web/ui/ui-battles.js")
BATTLES_DOCS = Path("docs/ui/ui-battles.js")
INDEX = Path("AsyncScene/Web/index.html")
INDEX_DOCS = Path("docs/index.html")

controller = CONTROLLER.read_text(encoding="utf-8")
battles = BATTLES.read_text(encoding="utf-8")
assert controller == CONTROLLER_DOCS.read_text(encoding="utf-8")
assert battles == BATTLES_DOCS.read_text(encoding="utf-8")
assert INDEX.read_text(encoding="utf-8") == INDEX_DOCS.read_text(encoding="utf-8")
for marker in [
    "stage7_deny_evidence_reveal_v1",
    "evidencePayoffStatus",
    "revealHeldDenyEvidence",
    "deny_evidence_payoff_revealed",
    "deny_evidence_payoff_expired",
]:
    assert marker in controller, marker
for marker in [
    "stage7DenyEvidencePayoff",
    "Показать доказательство",
    "stage7-deny-evidence-reveal",
    "stage7-deny-evidence-revealed",
]:
    assert marker in battles, marker
for text in [INDEX.read_text(encoding="utf-8"), INDEX_DOCS.read_text(encoding="utf-8")]:
    assert text.count("stage7_9_deny_evidence_payoff_20260806a") >= 2

subprocess.run(["node", "--check", str(CONTROLLER)], check=True)
subprocess.run(["node", "--check", str(CONTROLLER_DOCS)], check=True)
subprocess.run(["node", "--check", str(BATTLES)], check=True)
subprocess.run(["node", "--check", str(BATTLES_DOCS)], check=True)

node_harness = r'''
const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

const storage = new Map();
global.localStorage = {
  getItem(key) { return storage.has(key) ? storage.get(key) : null; },
  setItem(key, value) { storage.set(key, String(value)); },
  removeItem(key) { storage.delete(key); },
};
global.window = global;
global.location = { search: "?stage7test=1&stage7testrun=stage7-9-evidence" };
window.location = global.location;

const nodes = Object.create(null);
function createNode(tag) {
  return {
    tagName: String(tag || "").toUpperCase(),
    id: "",
    className: "",
    hidden: false,
    innerHTML: "",
    attributes: Object.create(null),
    listeners: Object.create(null),
    setAttribute(name, value) { this.attributes[name] = String(value); },
    addEventListener(name, fn) { this.listeners[name] = fn; },
    remove() { if (this.id) delete nodes[this.id]; },
  };
}
const blocks = {
  id: "blocks",
  firstChild: null,
  insertBefore(node) { this.firstChild = node; if (node.id) nodes[node.id] = node; },
};
nodes.blocks = blocks;
global.document = {
  hidden: false,
  documentElement: { classList: { toggle() {} } },
  getElementById(id) { return nodes[id] || null; },
  createElement(tag) { return createNode(tag); },
  addEventListener() {},
};

const visibleLines = [];
const state = { me: { id: "me", points: 20 }, players: {}, battles: [], rep: 0 };
let incomingCalls = 0;
window.Game = {
  __S: state,
  State: state,
  Data: { START_POINTS_NPC: 10 },
  __A: { transferRep() { return { ok: true }; } },
  ConflictEconomy: { transferPoints() { return { ok: true }; } },
  Conflict: {
    incoming(opponentId) {
      incomingCalls += 1;
      const battle = {
        id: `stage7_real_${incomingCalls}`,
        opponentId,
        fromThem: true,
        status: "pickDefense",
        attack: { id: "canon_Y1_yn_test", text: "Ты опять уходишь от ответа?", type: "yn", _color: "y" },
        meta: {},
      };
      state.battles.unshift(battle);
      return { ok: true, battleId: battle.id, battle };
    },
  },
  UI: {},
};
const UI = {
  S: state,
  pushSystem(text) { visibleLines.push({ system: true, text }); },
  pushChat(entry) { visibleLines.push(entry); },
  requestRenderAll() {},
  renderAll() {},
};
const context = { state, UI, playerName: "Тестер", startNormalWorld() {} };

vm.runInThisContext(
  fs.readFileSync("AsyncScene/Web/ui/ui-stage7-first-experience.js", "utf8"),
  { filename: "ui-stage7-first-experience.js" }
);
const dev = Game.__DEV;

function runDeny(choice) {
  Game.Stage7FirstExperience.claimFreshStart(context);
  assert.strictEqual(dev.completeStage7RoundOne("deny"), true);
  assert.strictEqual(dev.settleStage7Intermission("foreground"), true);
  assert.strictEqual(dev.resolveStage7RoundTwo(choice), true);
  assert.strictEqual(dev.openStage7Questions(), true);
  for (let i = 0; i < 6; i += 1) assert.strictEqual(dev.answerStage7CurrentQuestionCorrect(), true);
  const snap = dev.getStage7FirstExperienceSnapshot();
  const battle = state.battles[0];
  assert(battle, "real battle missing");
  return { snap, battle };
}

let first = runDeny("primary");
assert.strictEqual(first.snap.realBattleBridge.evidencePayoffMode, "shared");
assert.strictEqual(first.snap.realBattleBridge.evidencePayoffStatus, "revealed");
assert.strictEqual(first.snap.realBattleBridge.evidencePayoffRevealCount, 1);
assert.strictEqual(first.battle.attack.color, "y");
assert.strictEqual(first.battle.meta.stage7DenyEvidencePayoff.mode, "shared");
assert.strictEqual(first.battle.meta.stage7DenyEvidencePayoff.status, "revealed");
const sharedLines = visibleLines.filter((line) => line.system && String(line.text).includes("Настя уже показала доказательство"));
assert.strictEqual(sharedLines.length, 1);
assert.strictEqual(Game.Stage7FirstExperience.revealHeldDenyEvidence(first.battle.id), false);
Game.Stage7FirstExperience.destroy();
const activeResume = Game.Stage7FirstExperience.claimResume(context);
assert.strictEqual(activeResume.claimed, true);
assert.strictEqual(dev.getStage7FirstExperienceSnapshot().realBattleBridge.evidencePayoffRevealCount, 1);
assert.strictEqual(visibleLines.filter((line) => line.system && String(line.text).includes("Настя уже показала доказательство")).length, 1);

Game.__DEV.resetStage7FirstExperience();
state.battles.length = 0;
first = runDeny("secondary");
assert.strictEqual(first.snap.realBattleBridge.evidencePayoffMode, "held");
assert.strictEqual(first.snap.realBattleBridge.evidencePayoffStatus, "pending");
assert.strictEqual(first.snap.realBattleBridge.evidencePayoffRevealCount, 0);
assert.strictEqual(first.battle.attack.color, undefined);
assert.strictEqual(first.battle.meta.stage7DenyEvidencePayoff.mode, "held");
assert.strictEqual(first.battle.meta.stage7DenyEvidencePayoff.status, "pending");
assert.strictEqual(Game.Stage7FirstExperience.revealHeldDenyEvidence(first.battle.id), true);
let heldSnap = dev.getStage7FirstExperienceSnapshot();
assert.strictEqual(first.battle.attack.color, "y");
assert.strictEqual(heldSnap.realBattleBridge.evidencePayoffStatus, "revealed");
assert.strictEqual(heldSnap.realBattleBridge.evidencePayoffRevealCount, 1);
assert.strictEqual(Game.Stage7FirstExperience.revealHeldDenyEvidence(first.battle.id), true);
heldSnap = dev.getStage7FirstExperienceSnapshot();
assert.strictEqual(heldSnap.realBattleBridge.evidencePayoffRevealCount, 1, "held evidence replayed");
assert.strictEqual(visibleLines.filter((line) => line.system && String(line.text).includes("Ты предъявил сохранённое доказательство")).length, 1);
const ordinary = { id: "ordinary", status: "pickDefense", attack: { _color: "r" }, meta: {} };
state.battles.unshift(ordinary);
assert.strictEqual(Game.Stage7FirstExperience.revealHeldDenyEvidence("ordinary"), false);
assert.strictEqual(ordinary.attack.color, undefined);
state.battles.shift();

Game.__DEV.resetStage7FirstExperience();
state.battles.length = 0;
first = runDeny("secondary");
first.battle.resolved = true;
first.battle.finished = true;
first.battle.status = "finished";
first.battle.result = "lose";
assert.strictEqual(dev.syncStage7RealArgumentBattleLifecycle(), true);
heldSnap = dev.getStage7FirstExperienceSnapshot();
assert.strictEqual(heldSnap.realBattleBridge.evidencePayoffStatus, "expired");
assert.strictEqual(first.battle.meta.stage7DenyEvidencePayoff.status, "expired");
assert.strictEqual(Game.Stage7FirstExperience.revealHeldDenyEvidence(first.battle.id), false);

console.log("STAGE7_9_DENY_EVIDENCE_PAYOFF_DYNAMIC_OK");
'''

with tempfile.NamedTemporaryFile("w", suffix=".js", encoding="utf-8", delete=False) as handle:
    handle.write(node_harness)
    harness_path = handle.name
try:
    completed = subprocess.run(["node", harness_path], check=True, text=True, capture_output=True)
    assert "STAGE7_9_DENY_EVIDENCE_PAYOFF_DYNAMIC_OK" in completed.stdout
finally:
    Path(harness_path).unlink(missing_ok=True)

print("STAGE7_9_DENY_EVIDENCE_PAYOFF_OK")
'''
Path("tools/test_stage7_9_deny_evidence_payoff.py").write_text(TEST, encoding="utf-8")

assert CONTROLLER_PATHS[0].read_text(encoding="utf-8") == CONTROLLER_PATHS[1].read_text(encoding="utf-8")
assert BATTLE_UI_PATHS[0].read_text(encoding="utf-8") == BATTLE_UI_PATHS[1].read_text(encoding="utf-8")
assert INDEX_PATHS[0].read_text(encoding="utf-8") == INDEX_PATHS[1].read_text(encoding="utf-8")
