#!/usr/bin/env python3
"""Focused runtime regressions for the Stage 7 Task 1 corrective slice."""

from pathlib import Path
import subprocess
import textwrap


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "AsyncScene/Web/ui"
DOCS = ROOT / "docs/ui"


def require(condition, message):
    if not condition:
        raise AssertionError(message)


MIRRORS = [
    "ui-core.js",
    "ui-chat.js",
    "ui-profile-visual-tone-repair.js",
    "ui-stage7-first-experience.js",
    "ui-battles.js",
    "ui-events.js",
]
for filename in MIRRORS:
    require((SOURCE / filename).read_bytes() == (DOCS / filename).read_bytes(), f"source/docs mirror mismatch: {filename}")

core = (SOURCE / "ui-core.js").read_text(encoding="utf-8")
chat = (SOURCE / "ui-chat.js").read_text(encoding="utf-8")
profile = (SOURCE / "ui-profile-visual-tone-repair.js").read_text(encoding="utf-8")
boot = (SOURCE / "ui-boot.js").read_text(encoding="utf-8")
docs_boot = (DOCS / "ui-boot.js").read_text(encoding="utf-8")
stage7 = (SOURCE / "ui-stage7-first-experience.js").read_text(encoding="utf-8")

for line in (
    "из общей кассы пропали деньги!!!",
    "пропажу заметили ещё до появления новичка!",
    "новичок пришёл - и деньги исчезли, странное совпадение",
    "без доказательств никого не обвиняем!",
):
    require(line in stage7, f"Stage 7 authored copy missing: {line}")

require("[mention игрока]" not in stage7, "literal mention placeholder remains in Stage 7 source")
require("@${playerName}, это сделал ты!!! деньги пропали после твоего появления!" in stage7, "dynamic player mention missing")
require("preserveText: true" in stage7, "Stage 7 authored messages are not explicitly marked")
require("preserveText: entry.preserveText === true" in stage7, "Stage 7 does not forward preserveText to chat ingress")
require("preserveText=false" in core, "ui-core pushChat has no preserveText parameter")
require("system || preserveText ? String(text || \"\")" in core, "ui-core still normalizes authored text")
require("m.preserveText !== true" in chat, "ui-chat has no explicit authored-text gate")
require("hasMentions" not in chat, "ui-chat still uses mentions as a normalization bypass")
require("STARTUP_NAME_STORAGE_KEY" in profile and "stage7_startup_stat_name_toasts_v3" in profile, "click-only startup session key missing")
require("requestStartupNameToasts" in profile and "stage7:player-entered-game" in profile, "authoritative game-enter transition missing")
require("STARTUP_NAME_VISIBLE_MS" not in profile and "STARTUP_NAME_GAP_MS" not in profile, "startup still has auto-dismiss timing")
require("setTimeout(requestStartupNameToasts" not in profile, "startup still starts from a timer")
require("stage6StartupNameToast" in profile, "dedicated startup toast node missing")
require("positionStartupNameToast" in profile, "startup toast positioning function missing")
require("startupStatValueAnchor" in profile, "startup toast is not anchored to visible stat values")
require("r.top - height - 6" in profile, "startup toast is not positioned above the visible stat value")
require("pointerEvents = \"auto\"" in profile, "startup toast is not user-dismissible")
require("dispatchEvent(new Event(\"stage7:player-entered-game\"))" in boot, "boot does not publish authoritative game-enter transition")
require("dispatchEvent(new Event(\"stage7:player-entered-game\"))" in docs_boot, "docs boot mirror lacks authoritative game-enter transition")

active_toast_files = {
    "battles": (SOURCE / "ui-battles.js").read_text(encoding="utf-8"),
    "events": (SOURCE / "ui-events.js").read_text(encoding="utf-8"),
    "menu": (SOURCE / "ui-menu.js").read_text(encoding="utf-8"),
}
active_toast_contracts = [
    (profile, "function showStartupNameToast"), (profile, "function showNamedDeltaToast"), (profile, "function ensureUnifiedToast"),
    (core, "function showDeltaToastInstant"), (core, "UI.showStatToast = (kind, text) =>"), (core, "UI.showActionToast ="),
    (active_toast_files["battles"], "function showBtnToastRight"), (active_toast_files["battles"], "function showChipToastAbove"),
    (active_toast_files["events"], "function showVoteBtnToast"), (active_toast_files["menu"], "function showLotteryToast"),
]
for source_text, marker in active_toast_contracts:
    start = source_text.find(marker)
    require(start >= 0, f"active toast implementation missing: {marker}")
    end = source_text.find("\n  function ", start + len(marker))
    body = source_text[start:end if end >= 0 else start + 2600]
    require("onclick" in body, f"{marker} has no explicit click/tap dismissal")
    require("setTimeout" not in body, f"{marker} has timer-based disappearance")

require("document.body.appendChild(el)" in active_toast_files["battles"], "battle toast is not body-owned")
require("document.body.appendChild(el)" in active_toast_files["events"], "event/vote toast is not body-owned")
require("style.transition" not in active_toast_files["battles"], "battle toast still uses a CSS transition lifecycle")
require("style.transition" not in active_toast_files["events"], "event/vote toast still uses a CSS transition lifecycle")


node_harness = r"""
const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

function makeNode(tag, id) {
  const node = {
    tagName: String(tag || "div").toUpperCase(), id: id || "", className: "", hidden: false,
    textContent: "", innerHTML: "", style: {}, dataset: {}, attributes: {}, children: [],
    listeners: {}, offsetHeight: 28, clientHeight: 400, scrollHeight: 400, scrollTop: 0,
    isConnected: true,
    setAttribute(name, value) { this.attributes[name] = String(value); },
    addEventListener(name, fn) { this.listeners[name] = fn; },
    appendChild(child) { this.children.push(child); child._parent = this; child.isConnected = true; return child; },
    remove() { this.isConnected = false; this.hidden = true; if (this._onRemove) this._onRemove(this); if (this._parent && this._parent._onRemove) this._parent._onRemove(this); },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    getBoundingClientRect() { return this.rect || { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 }; },
    contains() { return false; },
    closest() { return null; },
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
  };
  return node;
}

function runChatRenderRegression() {
  const source = fs.readFileSync("AsyncScene/Web/ui/ui-chat.js", "utf8");
  const chatLog = makeNode("div", "chatLog");
  const nodes = { chatLog };
  const player = { id: "me", name: "РайханИгрок", npc: false, influence: 7 };
  const npcs = [
    { id: "npc_mika", name: "Настя", npc: true, influence: 2 },
    { id: "npc_oleg", name: "Олег", npc: true, influence: 3 },
    { id: "npc_ken", name: "Райхан", npc: true, influence: 4 },
  ];
  const state = { me: player, players: { me: player }, chat: [] };
  npcs.forEach((npc) => { state.players[npc.id] = npc; });
  const UI = {
    S: state,
    $: (id) => nodes[id] || null,
    escapeHtml: (value) => String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;"),
    nameHTMLWithPill: (p) => String(p.name),
    displayName: (p) => String(p.name),
    getPlayerByName: (name) => Object.values(state.players).find((p) => p && p.name === name) || null,
    isDevBalanceEnabled: () => false,
    requestRenderAll() {},
  };
  const sandbox = {
    window: null, Game: { UI, __S: state, NPC: { getAll: () => npcs }, Data: {} }, document: {
      body: makeNode("body"),
      createElement: (tag) => makeNode(tag),
      getElementById: (id) => nodes[id] || null,
      addEventListener() {},
    },
    console, setTimeout, clearTimeout, setInterval, clearInterval, Math, Date, JSON, Object, Array, String, Number, Boolean, RegExp,
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: "ui-chat.js" });

  // These are the actual authored Stage 7 entries handed to UI.pushChat by pushLine.
  state.chat = [
    { id: "mika", name: "Настя", speakerId: "npc_mika", text: "из общей кассы пропали деньги!!!", preserveText: true },
    { id: "oleg", name: "Олег", speakerId: "npc_oleg", text: "пропажу заметили ещё до появления новичка!", preserveText: true },
    { id: "ken", name: "Райхан", speakerId: "npc_ken", text: "новичок пришёл - и деньги исчезли, странное совпадение", preserveText: true },
    { id: "mika2", name: "Настя", speakerId: "npc_mika", text: "без доказательств никого не обвиняем!", preserveText: true },
    { id: "accuse", name: "Райхан", speakerId: "npc_ken", text: "@РайханИгрок, это сделал ты!!! деньги пропали после твоего появления!", preserveText: true },
  ];
  UI.renderChatSmart();
  assert.strictEqual(chatLog.children.length, 5);
  const visible = chatLog.children.map((node) => {
    const match = node.innerHTML.match(/<div class="txt">([\s\S]*?)<\/div>/);
    assert(match, "rendered chat text block missing");
    return match[1].replace(/<[^>]+>/g, "").replace(/&quot;/g, "\"").replace(/&amp;/g, "&").trim();
  });
  assert.deepStrictEqual(visible, [
    "из общей кассы пропали деньги!!!",
    "пропажу заметили ещё до появления новичка!",
    "новичок пришёл - и деньги исчезли, странное совпадение",
    "без доказательств никого не обвиняем!",
    "РайханИгрок, это сделал ты!!! деньги пропали после твоего появления!",
  ]);
  assert(visible.every((text) => !text.includes("[mention игрока]")));
  assert(visible[4].includes("РайханИгрок"));
  assert(visible[0].includes("!!!") && visible[1].endsWith("!"));
}

function runStartupLifecycleRegression(options = {}) {
  const source = fs.readFileSync("AsyncScene/Web/ui/ui-profile-visual-tone-repair.js", "utf8");
  const nodes = {};
  const repChip = makeNode("button", "repChip");
  const pointsChip = makeNode("button", "pointsChip");
  repChip.rect = { left: 24, top: 18, right: 64, bottom: 42, width: 40, height: 24 };
  pointsChip.rect = { left: 210, top: 18, right: 250, bottom: 42, width: 40, height: 24 };
  const repAnchor = makeNode("span"); repAnchor.rect = { left: 24, top: 18, right: 64, bottom: 42, width: 40, height: 24 };
  const pointsAnchor = makeNode("span"); pointsAnchor.rect = { left: 210, top: 18, right: 250, bottom: 42, width: 40, height: 24 };
  const repValue = makeNode("span", "meRep"); repValue.rect = { left: 58, top: 82, right: 70, bottom: 106, width: 12, height: 24 };
  const pointsValue = makeNode("span", "mePoints"); pointsValue.rect = { left: 224, top: 82, right: 236, bottom: 106, width: 12, height: 24 };
  repChip.querySelector = (selector) => selector === "#meRep" || selector === ".statValue" ? repValue : null;
  pointsChip.querySelector = (selector) => selector === "#mePoints" || selector === ".pointsValue" ? pointsValue : null;
  const anchorsReady = { value: true };
  const startScreenVisible = { value: true };
  const children = [];
  const timers = [];
  let timerSeq = 0;
  const storage = new Map(options.staleSession === true ? [
    ["stage7_startup_stat_name_toasts", "1"],
    ["stage7_startup_stat_name_toasts_v2", "completed"],
  ] : []);
  const body = makeNode("body");
  const startScreen = makeNode("div", "startScreen");
  startScreen.classList.contains = (name) => name === "hidden" && !startScreenVisible.value;
  body.appendChild = (child) => { children.push(child); child._parent = body; if (child.id) nodes[child.id] = child; return child; };
  body._onRemove = (child) => { const index = children.indexOf(child); if (index >= 0) children.splice(index, 1); if (child.id) delete nodes[child.id]; };
  function setTimer(fn, delay) { const item = { id: ++timerSeq, fn, delay: Number(delay) || 0, cleared: false, ran: false }; timers.push(item); return item.id; }
  function clearTimer(id) { const item = timers.find((entry) => entry.id === id); if (item) item.cleared = true; }
  const document = {
    body,
    documentElement: { clientWidth: 390, clientHeight: 844, classList: { toggle() {} } },
    createElement: (tag) => makeNode(tag),
    getElementById: (id) => id === "startScreen" ? startScreen : (nodes[id] || null),
    querySelector: (selectorText) => {
      if (selectorText === '[data-profile-stat="rep"]') return repChip;
      if (selectorText === '[data-profile-stat="points"]') return pointsChip;
      return null;
    },
    querySelectorAll: () => [],
    listeners: {},
    addEventListener(name, fn) { this.listeners[name] = fn; },
  };
  const UI = {
    S: { me: { name: "РайханИгрок" } },
    getStatAnchor: (kind) => !anchorsReady.value ? null : (kind === "rep" ? repAnchor : pointsAnchor),
    isDevBalanceEnabled: () => false,
    showStatToast() {},
    requestRenderAll() {}, renderAll() {},
  };
  const Data = {
    TEXTS: {}, START_SCREEN_PROFILE_TEXTS: {},
    getUiProfile: () => "millennial", normalizeUiProfile: (value) => value || "millennial",
    setUiProfile() {}, t: () => "",
  };
  const OriginalSystem = { say: () => "", profileText: () => "", deliveryPolicy: () => ({}) };
  const sandbox = {
    window: null,
    Game: { UI, Data, System: OriginalSystem, __S: UI.S, __DEV: {} },
    document, console, Math, Date, JSON, Object, Array, String, Number, Boolean, RegExp,
    setTimeout: setTimer, clearTimeout: clearTimer, setInterval: () => 1, clearInterval: () => {},
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    MutationObserver: undefined,
  };
  sandbox.window = sandbox;
  sandbox.window.innerWidth = 390; sandbox.window.innerHeight = 844;
  sandbox.window.listeners = {};
  sandbox.window.addEventListener = (name, fn) => { sandbox.window.listeners[name] = fn; };
  sandbox.window.dispatchEvent = (event) => {
    const listener = sandbox.window.listeners[event.type];
    if (listener) listener(event);
  };
  sandbox.Event = function Event(type) { this.type = type; };
  sandbox.window.sessionStorage = { getItem: (key) => storage.get(key) || null, setItem: (key, value) => storage.set(key, String(value)) };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: "ui-profile-visual-tone-repair.js" });
  assert.strictEqual(children.length, 0, "startup must not run while start screen is visible");
  sandbox.window.dispatchEvent(new sandbox.Event("stage7:player-entered-game"));
  assert.strictEqual(children.length, 0, "visible start screen must block startup hints");
  startScreenVisible.value = false;
  sandbox.window.dispatchEvent(new sandbox.Event("stage7:player-entered-game"));
  assert.strictEqual(children.length, 1);
  assert.strictEqual(nodes.stage6StartupNameToast.textContent, "Репутация");
  assert(Number.parseInt(nodes.stage6StartupNameToast.style.left, 10) < 150);
  assert(nodes.stage6StartupNameToast.style.top.includes("48"));
  assert(Number.parseInt(nodes.stage6StartupNameToast.style.top, 10) + nodes.stage6StartupNameToast.offsetHeight < repValue.rect.top);
  assert(Math.abs(Number.parseInt(nodes.stage6StartupNameToast.style.left, 10) - ((repValue.rect.left + repValue.rect.right) / 2)) <= 1);
  assert.strictEqual(timers.filter((item) => !item.cleared && !item.ran).length, 0, "startup must not schedule auto-dismiss timers");
  for (let i = 0; i < 30; i += 1) assert(nodes.stage6StartupNameToast.isConnected, "Репутация disappeared without user action");
  nodes.stage6StartupNameToast.onclick({ stopPropagation() {} });
  assert.strictEqual(children.length, 1);
  assert.strictEqual(nodes.stage6StartupNameToast.textContent, "Баланс");
  assert(Number.parseInt(nodes.stage6StartupNameToast.style.left, 10) > 150);
  assert(Number.parseInt(nodes.stage6StartupNameToast.style.top, 10) + nodes.stage6StartupNameToast.offsetHeight < pointsValue.rect.top);
  assert(Math.abs(Number.parseInt(nodes.stage6StartupNameToast.style.left, 10) - ((pointsValue.rect.left + pointsValue.rect.right) / 2)) <= 1);
  for (let i = 0; i < 30; i += 1) assert(nodes.stage6StartupNameToast.isConnected, "Баланс disappeared without user action");
  nodes.stage6StartupNameToast.onclick({ stopPropagation() {} });
  assert.strictEqual(nodes.stage6StartupNameToast, undefined);
  assert.strictEqual(storage.get("stage7_startup_stat_name_toasts_v3"), "completed");
  assert(repChip.listeners.click);
  repChip.listeners.click();
  assert(nodes.stage6DeltaNameToast_rep, "manual stat tap no longer shows its name");
  sandbox.window.dispatchEvent(new sandbox.Event("stage7:player-entered-game"));
  assert.strictEqual(nodes.stage6StartupNameToast, undefined, "completed startup session must not replay");
}

runChatRenderRegression();
runStartupLifecycleRegression();
runStartupLifecycleRegression({ staleSession: true });
console.log("PASS_STAGE7_TASK1_RENDERED_RUNTIME");
"""

subprocess.run(["node", "-e", textwrap.dedent(node_harness)], cwd=ROOT, check=True)
