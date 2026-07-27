import json
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CASES = (
    (
        ROOT / "AsyncScene" / "Web" / "state.js",
        ROOT / "AsyncScene" / "Web" / "npcs.js",
        ROOT / "AsyncScene" / "Web" / "ui" / "ui-dm.js",
    ),
    (
        ROOT / "docs" / "state.js",
        ROOT / "docs" / "npcs.js",
        ROOT / "docs" / "ui" / "ui-dm.js",
    ),
)


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def run_runtime_harness(state_source: str, npcs_source: str, dm_source: str) -> dict[str, object]:
    script = """
const stateSource = __STATE__;
const npcsSource = __NPCS__;
const dmSource = __DM__;

let now = 1_000_000;
let seed = 123456789;
let nextTimerId = 1;
const timers = new Map();
const intervals = new Map();
const microtasks = [];

function random() {
  seed = (seed * 48271) % 0x7fffffff;
  return seed / 0x7fffffff;
}

function queueMicrotaskFake(fn) {
  microtasks.push(fn);
}

function flushMicrotasks(limit = 1000) {
  let steps = 0;
  while (microtasks.length) {
    const fn = microtasks.shift();
    fn();
    steps += 1;
    if (steps > limit) throw new Error("microtask_overflow");
  }
}

function setTimeoutFake(fn, delay = 0) {
  const id = nextTimerId++;
  timers.set(id, { fn, at: now + Number(delay || 0) });
  return id;
}

function clearTimeoutFake(id) {
  timers.delete(id);
}

function setIntervalFake(fn, delay = 0) {
  const id = nextTimerId++;
  intervals.set(id, { fn, delay: Number(delay || 0) });
  return id;
}

function advance(ms) {
  now += Number(ms || 0);
  let progressed = true;
  let guard = 0;
  while (progressed) {
    progressed = false;
    const due = Array.from(timers.entries())
      .filter(([, timer]) => timer.at <= now)
      .sort((a, b) => a[1].at - b[1].at || a[0] - b[0]);
    for (const [id, timer] of due) {
      timers.delete(id);
      timer.fn();
      flushMicrotasks();
      progressed = true;
    }
    guard += 1;
    if (guard > 2000) throw new Error("timer_overflow");
  }
}

class FakeTextNode {
  constructor(value, parent = null) {
    this.nodeType = 3;
    this.parentElement = parent;
    this._nodeValue = String(value || "");
  }
  get nodeValue() {
    return this._nodeValue;
  }
  set nodeValue(next) {
    this._nodeValue = String(next || "");
  }
}

class FakeClassList {
  constructor(owner) {
    this.owner = owner;
    this.values = new Set();
  }
  sync() {
    this.owner.className = Array.from(this.values).join(" ");
  }
  add(...names) {
    names.forEach((name) => this.values.add(String(name)));
    this.sync();
  }
  remove(...names) {
    names.forEach((name) => this.values.delete(String(name)));
    this.sync();
  }
  toggle(name, force) {
    const key = String(name);
    const shouldAdd = force === undefined ? !this.values.has(key) : !!force;
    if (shouldAdd) this.values.add(key);
    else this.values.delete(key);
    this.sync();
  }
  contains(name) {
    return this.values.has(String(name));
  }
}

class FakeElement {
  constructor(documentRef, id = "", tagName = "div") {
    this.ownerDocument = documentRef;
    this.id = id;
    this.tagName = String(tagName || "div").toUpperCase();
    this.nodeType = 1;
    this.parentNode = null;
    this.parentElement = null;
    this.childNodes = [];
    this.style = {};
    this.dataset = {};
    this.attributes = {};
    this.className = "";
    this.classList = new FakeClassList(this);
    this.disabled = false;
    this.title = "";
    this.type = "";
    this.value = "";
    this.placeholder = "";
    this.textContent = "";
    this.innerHTML = "";
    this.scrollTop = 0;
    this.scrollHeight = 0;
    this.isConnected = false;
    this.onclick = null;
    this.__listeners = new Map();
    if (this.id) this.ownerDocument.register(this);
  }
  appendChild(child) {
    child.parentNode = this;
    child.parentElement = this;
    child.isConnected = this.isConnected;
    this.childNodes.push(child);
    if (child.id) this.ownerDocument.register(child);
    return child;
  }
  insertBefore(child) {
    return this.appendChild(child);
  }
  insertAdjacentElement(_, child) {
    return this.appendChild(child);
  }
  remove() {
    if (this.id) this.ownerDocument.unregister(this.id);
    this.isConnected = false;
  }
  contains(target) {
    if (target === this) return true;
    return this.childNodes.includes(target);
  }
  closest() {
    return null;
  }
  addEventListener(type, fn) {
    const key = String(type);
    const list = this.__listeners.get(key) || [];
    list.push(fn);
    this.__listeners.set(key, list);
  }
  querySelector(selector) {
    if (selector === ".panelBody" || selector === ".blockBody") return null;
    return null;
  }
  querySelectorAll(selector) {
    const results = [];
    if (selector === ".dmLine") {
      const visit = (node) => {
        if (!node || node.nodeType !== 1) return;
        if (String(node.className || "").split(/\\s+/).includes("dmLine")) results.push(node);
        node.childNodes.forEach(visit);
      };
      this.childNodes.forEach(visit);
    }
    return results;
  }
  getBoundingClientRect() {
    return { left: 100, bottom: 32, width: 240 };
  }
  focus() {}
  scrollIntoView() {}
  set textContent(next) {
    this._textContent = String(next || "");
    this.childNodes = this._textContent ? [new FakeTextNode(this._textContent, this)] : [];
  }
  get textContent() {
    if (this.childNodes.length) {
      return this.childNodes.map((node) => String(node.nodeValue || "")).join("");
    }
    return this._textContent || "";
  }
  set innerHTML(next) {
    this._innerHTML = String(next || "");
    this.childNodes = [];
  }
  get innerHTML() {
    return this._innerHTML || "";
  }
}

class FakeDocument {
  constructor() {
    this.elements = new Map();
    this.body = new FakeElement(this, "body", "body");
    this.body.isConnected = true;
    this.clickListeners = new Set();
  }
  register(element) {
    this.elements.set(element.id, element);
    element.isConnected = true;
  }
  unregister(id) {
    this.elements.delete(id);
  }
  createElement(tagName) {
    return new FakeElement(this, "", tagName);
  }
  getElementById(id) {
    return this.elements.get(String(id)) || null;
  }
  querySelector() {
    return null;
  }
  querySelectorAll() {
    return [];
  }
  addEventListener(type, fn, capture) {
    if (type === "click" && capture === true) this.clickListeners.add(fn);
  }
  removeEventListener(type, fn, capture) {
    if (type === "click" && capture === true) this.clickListeners.delete(fn);
  }
}

const document = new FakeDocument();
const elements = document.elements;

function mount(id, parent = document.body, tag = "div") {
  const el = new FakeElement(document, id, tag);
  parent.appendChild(el);
  return el;
}

const dmBlock = mount("dmBlock");
const dmBlockHeader = mount("dmBlockHeader", dmBlock);
const dmHeader = mount("dmHeader", dmBlockHeader);
const dmTitle = mount("dmTitle", dmHeader);
const dmHeaderCount = mount("dmHeaderCount", dmHeader);
const dmLog = mount("dmLog", dmBlock);
const dmActions = mount("dmActions", dmBlock);
const dmExtraRow = mount("dmExtraRow", dmBlock);
const reportHint = mount("reportHint", dmExtraRow);

const fakeConsole = { log() {}, warn() {}, error() {} };
const math = Object.create(Math);
math.random = random;

const window = {
  localStorage: { getItem: () => null, setItem: () => {} },
  Game: {
    __DEV: {},
    Dev: {},
    Config: {},
    Data: {
      COP_TEMPLATES: {
        intros: ["Привет"],
        warnings: ["Осторожно"],
        chatReplies: ["На связи"],
        cooldownReplies: ["Занят"],
      },
      getUiProfile: () => "millennial",
      t: (key) => String(key || ""),
    },
    Util: {
      safeId: () => `id_${now}_${Math.floor(random() * 1e6)}`,
      nowHHMM: () => "09:00",
    },
    UI: {
      $: (id) => document.getElementById(id),
      escapeHtml: (value) => String(value || ""),
      displayName: (player) => (player && player.name) ? String(player.name) : "",
      pulsePanelHeader: () => {},
      getCollapsedCounter: () => 0,
      isMobilePanelMode: () => false,
      setPanelSize: () => {},
      getPanelSize: () => "medium",
      openBattlesAndScroll: () => {},
      showStatToast: () => {},
      pushSystem: () => {},
      renderChat: () => {},
      renderBattles: () => {},
      renderEvents: () => {},
      showActionToast: () => {},
    },
    System: {
      say: (kind, code) => `${kind}:${code}`,
      profileText: () => "",
    },
    Rules: {
      isP2PTransfersEnabled: () => false,
      isP2PPlayerToPlayerEnabled: () => false,
      isP2PBacklogActive: () => false,
    },
    Security: {
      isSafe: () => true,
      emit: () => {},
      rateLimit: () => ({ ok: true, key: "k", resetIn: 0 }),
    },
  },
};

const context = {
  window,
  Game: window.Game,
  document,
  console: fakeConsole,
  Date: class FakeDate extends Date {
    constructor(...args) {
      super(...(args.length ? args : [now]));
    }
    static now() {
      return now;
    }
  },
  Math: math,
  Node: { TEXT_NODE: 3 },
  NodeFilter: { SHOW_TEXT: 4 },
  MutationObserver: function() { this.observe = () => {}; },
  queueMicrotask: queueMicrotaskFake,
  setTimeout: setTimeoutFake,
  clearTimeout: clearTimeoutFake,
  setInterval: setIntervalFake,
  clearInterval: () => {},
};

import vm from "vm";
vm.createContext(context);
vm.runInContext(stateSource, context, { filename: "state.js" });
vm.runInContext(npcsSource, context, { filename: "npcs.js" });
vm.runInContext(dmSource, context, { filename: "ui-dm.js" });

window.Game.NPC.seedPlayers(window.Game.__S);
window.Game.State = window.Game.__S;
window.Game.StateAPI = window.Game.__A;

const S = window.Game.__S;
S.me = { id: "me", name: "Игрок", points: 50, influence: 5 };
S.players.me = S.me;
S.reports.cooldownMs = 500;

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function collectAmbientSample(targetCount) {
  window.Game.__A.resetPublicChatCopBudget(0);
  const entries = [];
  let attempts = 0;
  while (entries.length < targetCount && attempts < targetCount * 20) {
    attempts += 1;
    const npc = window.Game.NPC.randomForChat();
    if (!npc || !npc.name) continue;
    if (npc.role === "bandit" && math.random() < 0.5) continue;
    if (npc.role === "mafia" && math.random() < 0.85) continue;
    if (window.Game.__A.isNpcJailed(npc.id)) continue;
    const text = window.Game.NPC.generateChatLine(npc);
    if (text == null || !String(text).trim()) continue;
    entries.push({
      id: npc.id,
      name: npc.name,
      role: String(npc.role || ""),
      text: String(text),
      sourceTag: "ambient_npc_chat",
    });
  }
  if (entries.length !== targetCount) throw new Error(`ambient_sample_incomplete:${entries.length}`);
  return entries;
}

function countCopDmLines() {
  const logs = (S.dm && S.dm.logs) ? S.dm.logs : {};
  return Object.keys(logs)
    .filter((id) => id.startsWith("npc_cop_"))
    .reduce((sum, id) => sum + ((logs[id] || []).length), 0);
}

function runPeriodicCopTick() {
  S.chat = [];
  S.dm = S.dm || { logs: {} };
  S.dm.logs = {};
  S.reports.copChatter = {
    nextChatAtByCopId: { npc_cop_v: 0, npc_cop_k: 0, npc_cop_a: 0 },
    nextDmAtByCopId: { npc_cop_v: 0, npc_cop_k: 0, npc_cop_a: 0 },
    introChatSentByCopId: {},
    introDmSentByCopId: {},
    introSentByCopId: {},
    lastKindByCopId: {},
    lastTextByCopId: {},
    skippedDmTargetDiagnostics: [],
  };
  const publicBefore = S.chat.length;
  const dmBefore = countCopDmLines();
  const did = window.Game.__A.tickCops(now);
  return {
    did,
    publicDelta: S.chat.length - publicBefore,
    dmDelta: countCopDmLines() - dmBefore,
    diagnostics: deepClone(S.reports.copChatter.skippedDmTargetDiagnostics || []),
  };
}

function ensureDmOpen(withId) {
  S.dm = {
    open: true,
    activeId: withId,
    withId,
    openIds: [withId],
    logs: S.dm && S.dm.logs ? S.dm.logs : { [withId]: [] },
    unread: {},
    inviteOpen: false,
  };
}

function openCopReportUi(copId) {
  ensureDmOpen(copId);
  window.Game.UI._copReport = { open: false, q: "", sel: 0, list: [], dropdownOpen: false };
  window.Game.UI.renderDM();
  const openBtn = document.getElementById("reportOpenBtn");
  if (!openBtn || typeof openBtn.onclick !== "function") throw new Error("report_open_button_missing");
  const event = { stopPropagation() {}, preventDefault() {}, target: openBtn };
  openBtn.onclick(event);
  advance(0);
  flushMicrotasks();
}

function activeWakeTimerCount() {
  const timerId = window.Game.UI._copReport && window.Game.UI._copReport.reportWakeTimer;
  return timerId && timers.has(timerId) ? 1 : 0;
}

const ambientEntries = collectAmbientSample(1100);
const periodicTick = runPeriodicCopTick();

const firstReport = window.Game.__A.applyReportByRole("toxic", { copId: "npc_cop_v" });
const firstPendingBefore = deepClone(window.Game.__A.getPendingReport(firstReport.pendingId));
const firstChatCountBeforeExpiry = (S.chat || []).length;
advance(1000);
const firstResolve = deepClone(window.Game.__A.resolvePendingReportsTick(now));
const moneyLogAfterFirstResolve = ((window.Game.__D && window.Game.__D.moneyLog) || []).length;
const firstResolveAgain = deepClone(window.Game.__A.resolvePendingReportsTick(now));
const moneyLogAfterSecondTick = ((window.Game.__D && window.Game.__D.moneyLog) || []).length;
const firstCopBusyAfterResolve = window.Game.__A.isCopBusyById("npc_cop_v", now);
const chatCountAfterFirstResolve = (S.chat || []).length;

openCopReportUi("npc_cop_v");
window.Game.UI.renderDM();
window.Game.UI.renderDM();
window.Game.UI.renderDM();
const reportBtnDuringCooldown = document.getElementById("reportBtn");
const cooldownUi = {
  text: reportBtnDuringCooldown ? String(reportBtnDuringCooldown.textContent || "") : "",
  disabled: !!(reportBtnDuringCooldown && reportBtnDuringCooldown.disabled),
  wakeTimerCount: activeWakeTimerCount(),
  outsideClickListenerCount: document.clickListeners.size,
};

advance(1000);
const chatCountAfterExpiryWithoutChat = (S.chat || []).length;
window.Game.UI.renderDM();
const reportBtnAfterExpiry = document.getElementById("reportBtn");
const postExpiryUi = {
  text: reportBtnAfterExpiry ? String(reportBtnAfterExpiry.textContent || "") : "",
  disabled: !!(reportBtnAfterExpiry && reportBtnAfterExpiry.disabled),
  wakeTimerCount: activeWakeTimerCount(),
  outsideClickListenerCount: document.clickListeners.size,
};

advance(5000);
const secondReport = window.Game.__A.applyReportByRole("bandit", { copId: "npc_cop_k" });
advance(1000);
const secondResolve = deepClone(window.Game.__A.resolvePendingReportsTick(now));
const secondCopBusyAfterResolve = window.Game.__A.isCopBusyById("npc_cop_k", now);
const moneyLogAfterSecondResolve = ((window.Game.__D && window.Game.__D.moneyLog) || []).length;
const secondResolveAgain = deepClone(window.Game.__A.resolvePendingReportsTick(now));
const moneyLogAfterSecondDuplicateTick = ((window.Game.__D && window.Game.__D.moneyLog) || []).length;

advance(5000);
const thirdReport = window.Game.__A.applyReportByRole("mafia", { copId: "npc_cop_v" });
advance(1000);
const thirdResolve = deepClone(window.Game.__A.resolvePendingReportsTick(now));
const moneyLogAfterThirdResolve = ((window.Game.__D && window.Game.__D.moneyLog) || []).length;
const thirdResolveAgain = deepClone(window.Game.__A.resolvePendingReportsTick(now));
const moneyLogAfterThirdDuplicateTick = ((window.Game.__D && window.Game.__D.moneyLog) || []).length;

const moneyReasons = ((window.Game.__D && window.Game.__D.moneyLog) || []).map((entry) => String(entry.reason || ""));
const explicitCopPublic = (S.chat || []).filter((entry) => String(entry.playerId || "").startsWith("npc_cop_"));

const summary = {
  ambientEntries,
  periodicTick,
  reports: {
    firstReport,
    firstPendingBefore,
    firstResolve,
    firstResolveAgain,
    firstCopBusy: firstCopBusyAfterResolve,
    explicitCopPublic,
    moneyLogAfterFirstResolve,
    moneyLogAfterSecondTick,
    firstChatCountBeforeExpiry: chatCountAfterFirstResolve,
    chatCountAfterExpiryWithoutChat,
    secondReport,
    secondResolve,
    secondResolveAgain,
    secondCopBusy: secondCopBusyAfterResolve,
    moneyLogAfterSecondResolve,
    moneyLogAfterSecondDuplicateTick,
    thirdReport,
    thirdResolve,
    thirdResolveAgain,
    moneyLogAfterThirdResolve,
    moneyLogAfterThirdDuplicateTick,
    moneyReasons,
  },
  cooldownUi,
  postExpiryUi,
};

console.log(JSON.stringify(summary));
"""
    script = (
        script.replace("__STATE__", json.dumps(state_source))
        .replace("__NPCS__", json.dumps(npcs_source))
        .replace("__DM__", json.dumps(dm_source))
    )
    completed = subprocess.run(
        ["node", "--input-type=module", "-e", script],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
    )
    if completed.returncode != 0:
        raise AssertionError(
            "runtime harness failed\n"
            f"stdout:\n{completed.stdout}\n"
            f"stderr:\n{completed.stderr}"
        )
    return json.loads(completed.stdout)


class NpcChatBalanceAndReportRecoveryTests(unittest.TestCase):
    def test_runtime_chat_balance_and_report_recovery(self) -> None:
        for state_path, npcs_path, dm_path in CASES:
            result = run_runtime_harness(read(state_path), read(npcs_path), read(dm_path))

            ambient = result["ambientEntries"]
            ambient_cops = [entry for entry in ambient if entry["role"] == "cop"]
            ambient_non_cops = [entry for entry in ambient if entry["role"] != "cop"]
            cop_ratio = len(ambient_cops) / len(ambient)
            self.assertGreaterEqual(cop_ratio, 0.06)
            self.assertLessEqual(cop_ratio, 0.12)
            self.assertTrue(all(entry["sourceTag"] == "ambient_npc_chat" for entry in ambient))
            self.assertTrue(
                all(not (ambient[index]["role"] == "cop" and ambient[index + 1]["role"] == "cop") for index in range(len(ambient) - 1))
            )
            self.assertGreater(len(ambient_non_cops), len(ambient_cops))
            self.assertGreaterEqual(len({entry["role"] for entry in ambient_non_cops}), 3)
            self.assertGreaterEqual(len({entry["name"] for entry in ambient_non_cops}), 8)
            self.assertGreaterEqual(len({entry["text"] for entry in ambient_non_cops}), 20)

            periodic = result["periodicTick"]
            self.assertTrue(periodic["did"])
            self.assertEqual(periodic["publicDelta"], 0)
            self.assertGreater(periodic["dmDelta"], 0)
            self.assertEqual(periodic["diagnostics"], [])

            reports = result["reports"]
            self.assertTrue(reports["firstReport"]["ok"])
            self.assertEqual(reports["firstReport"]["reasonCode"], "pending")
            self.assertFalse(reports["firstPendingBefore"]["resolved"])
            self.assertEqual(len(reports["firstResolve"]), 1)
            self.assertEqual(reports["firstResolveAgain"], [])
            self.assertEqual(reports["moneyLogAfterFirstResolve"], reports["moneyLogAfterSecondTick"])
            self.assertTrue(reports["firstCopBusy"])
            self.assertTrue(reports["secondReport"]["ok"])
            self.assertEqual(reports["secondReport"]["copId"], "npc_cop_k")
            self.assertEqual(len(reports["secondResolve"]), 1)
            self.assertEqual(reports["secondResolveAgain"], [])
            self.assertTrue(reports["secondCopBusy"])
            self.assertEqual(reports["moneyLogAfterSecondResolve"], reports["moneyLogAfterSecondDuplicateTick"])
            self.assertTrue(reports["thirdReport"]["ok"])
            self.assertEqual(reports["thirdReport"]["copId"], "npc_cop_v")
            self.assertEqual(len(reports["thirdResolve"]), 1)
            self.assertEqual(reports["thirdResolveAgain"], [])
            self.assertEqual(reports["moneyLogAfterThirdResolve"], reports["moneyLogAfterThirdDuplicateTick"])
            self.assertEqual(reports["chatCountAfterExpiryWithoutChat"], reports["firstChatCountBeforeExpiry"])

            explicit = reports["explicitCopPublic"]
            self.assertGreaterEqual(len(explicit), 1)
            self.assertTrue(all(entry["sourceTag"] == "explicit_cop_public_notice" for entry in explicit))

            cooldown_ui = result["cooldownUi"]
            self.assertEqual(cooldown_ui["text"], "Занят")
            self.assertTrue(cooldown_ui["disabled"])
            self.assertEqual(cooldown_ui["wakeTimerCount"], 1)
            self.assertEqual(cooldown_ui["outsideClickListenerCount"], 1)

            post_expiry_ui = result["postExpiryUi"]
            self.assertEqual(post_expiry_ui["text"], "Сдать")
            self.assertFalse(post_expiry_ui["disabled"])
            self.assertEqual(post_expiry_ui["wakeTimerCount"], 0)
            self.assertEqual(post_expiry_ui["outsideClickListenerCount"], 1)


if __name__ == "__main__":
    unittest.main()
