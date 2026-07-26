from __future__ import annotations

import json
import re
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASELINE_SHA = "8c885c3f4af51ac00fa917e506cd58eae83b2d53"
EXPECTED_UI_BOOT_TOKEN = "step9_ui_boot_g_scope_fix_20260726b"

BOOT_CASES = {
    "source": ROOT / "AsyncScene" / "Web" / "ui" / "ui-boot.js",
    "docs": ROOT / "docs" / "ui" / "ui-boot.js",
}

BOOT_RELATIVE_PATHS = {
    "source": "AsyncScene/Web/ui/ui-boot.js",
    "docs": "docs/ui/ui-boot.js",
}

INDEX_CASES = {
    "source": ROOT / "AsyncScene" / "Web" / "index.html",
    "docs": ROOT / "docs" / "index.html",
}

HARNESS_FUNCTIONS = (
    "getPrimaryAuthorizedState",
    "getAuthorizedStateTargets",
    "getOnboardingSeen",
    "setOnboardingSeen",
    "resetOnboardingSeen",
    "syncUiTextModeFromUiProfile",
    "syncStartScreenUiProfileFromSelection",
    "resetStartScreenInputs",
    "restoreFreshStartScreenState",
    "applyUiProfileBeforeEnter",
    "persistFirstUiProfileSelection",
    "shouldShowFreshStartScreen",
    "clearStartScreenInterference",
    "applyStartScreenContent",
    "returnToStartScreen",
)

PRODUCTION_FUNCTIONS = (
    "getPrimaryAuthorizedState",
    "getAuthorizedStateTargets",
    "getOnboardingSeen",
    "setOnboardingSeen",
    "syncStartScreenUiProfileFromSelection",
    "restoreFreshStartScreenState",
    "applyUiProfileBeforeEnter",
    "shouldShowFreshStartScreen",
    "clearStartScreenInterference",
    "applyStartScreenContent",
    "returnToStartScreen",
    "startGame",
)

PUBLIC_STATE_PATTERN = re.compile(r"\b(?:G|Game|window\.Game)\.State\b")
UI_BOOT_TOKEN_PATTERN = re.compile(r'ui/ui-boot\.js\?v=([^"]+)')


def extract_named_function(source: str, name: str) -> str:
    anchor = f"function {name}("
    start = source.find(anchor)
    if start < 0:
        raise AssertionError(f"missing function {name}")
    brace = source.find("{", start)
    if brace < 0:
        raise AssertionError(f"missing function body for {name}")
    depth = 0
    in_string = False
    string_char = ""
    escaped = False
    for index in range(brace, len(source)):
        ch = source[index]
        if in_string:
            if escaped:
                escaped = False
            elif ch == "\\":
                escaped = True
            elif ch == string_char:
                in_string = False
            continue
        if ch in ("'", '"', "`"):
            in_string = True
            string_char = ch
            continue
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return source[start:index + 1]
    raise AssertionError(f"unterminated function {name}")


def git_show(revision: str, relative_path: str) -> str:
    completed = subprocess.run(
        ["git", "show", f"{revision}:{relative_path}"],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
    )
    if completed.returncode != 0:
        raise AssertionError(
            "git show failed\n"
            f"stdout:\n{completed.stdout}\n"
            f"stderr:\n{completed.stderr}"
        )
    return completed.stdout


def run_ui_boot_harness_source(label: str, source: str) -> dict[str, object]:
    extracted = "\n\n".join(extract_named_function(source, name) for name in HARNESS_FUNCTIONS)
    script = """
const FILE_LABEL = __FILE_LABEL__;

function makeClassList(initial = []) {
  const values = new Set(initial);
  return {
    add(...names) {
      names.forEach((name) => { if (name) values.add(String(name)); });
    },
    remove(...names) {
      names.forEach((name) => values.delete(String(name)));
    },
    toggle(name, force) {
      if (force === true) {
        values.add(String(name));
        return true;
      }
      if (force === false) {
        values.delete(String(name));
        return false;
      }
      if (values.has(String(name))) {
        values.delete(String(name));
        return false;
      }
      values.add(String(name));
      return true;
    },
    contains(name) {
      return values.has(String(name));
    },
    toArray() {
      return Array.from(values);
    },
  };
}

function makeStyle() {
  return {
    removeProperty(name) {
      delete this[name];
    },
  };
}

function makeElement(id, tagName = "div") {
  return {
    id,
    tagName: String(tagName || "div").toUpperCase(),
    textContent: "",
    value: "",
    hidden: false,
    dataset: {},
    attributes: {},
    style: makeStyle(),
    listeners: {},
    children: [],
    parentNode: null,
    classList: makeClassList(),
    setAttribute(name, value) {
      const text = String(value);
      this.attributes[name] = text;
      if (name.startsWith("data-")) {
        const key = name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        this.dataset[key] = text;
      }
    },
    getAttribute(name) {
      return Object.prototype.hasOwnProperty.call(this.attributes, name) ? this.attributes[name] : null;
    },
    appendChild(child) {
      child.parentNode = this;
      this.children.push(child);
      return child;
    },
    insertBefore(child, before) {
      child.parentNode = this;
      const index = this.children.indexOf(before);
      if (index >= 0) this.children.splice(index, 0, child);
      else this.children.push(child);
      return child;
    },
    addEventListener(type, handler) {
      if (!this.listeners[type]) this.listeners[type] = [];
      this.listeners[type].push(handler);
    },
    dispatch(type, target) {
      const event = {
        target,
        defaultPrevented: false,
        preventDefault() {
          this.defaultPrevented = true;
        },
      };
      (this.listeners[type] || []).forEach((handler) => handler(event));
      return event;
    },
    contains(node) {
      let current = node;
      while (current) {
        if (current === this) return true;
        current = current.parentNode;
      }
      return false;
    },
    closest(selector) {
      if (selector === "button[data-birth-year-step]" && this.tagName === "BUTTON" && this.getAttribute("data-birth-year-step") !== null) {
        return this;
      }
      return null;
    },
    querySelector() {
      return null;
    },
    querySelectorAll() {
      return [];
    },
  };
}

function createDocument() {
  const elements = {};
  const startIntroLines = [];

  function register(element) {
    if (element.id) elements[element.id] = element;
    return element;
  }

  function querySelectorAll(selector) {
    if (selector === "#startScreen") return [elements.startScreen];
    if (selector === "#startIntroLines .startIntroLine") return startIntroLines.slice();
    if (selector === "#btnStart, #btnRules, #btnResetOnboarding, #startBirthYearPicker button") {
      return [
        elements.btnStart,
        elements.btnRules,
        elements.btnResetOnboarding,
        elements.startBirthYear0Up,
        elements.startBirthYear0Down,
        elements.startBirthYear1Up,
        elements.startBirthYear1Down,
      ];
    }
    const idMatch = selector.match(/^#([A-Za-z0-9_-]+)$/);
    if (idMatch) {
      const node = elements[idMatch[1]];
      return node ? [node] : [];
    }
    return [];
  }

  function querySelector(selector) {
    return querySelectorAll(selector)[0] || null;
  }

  const body = register(makeElement("body", "body"));
  const startScreen = register(makeElement("startScreen", "div"));
  startScreen.querySelector = querySelector;
  startScreen.querySelectorAll = querySelectorAll;

  const title = register(makeElement("startTitle", "div"));
  const birthYearLabel = register(makeElement("startBirthYearLabel", "label"));
  const birthYearPicker = register(makeElement("startBirthYearPicker", "div"));
  const birthYearHint = register(makeElement("startBirthYearHint", "div"));
  const birthYearFeelingLabel = register(makeElement("startBirthYearFeelingLabel", "label"));
  const birthYearFeelingInput = register(makeElement("startBirthYearFeelingInput", "input"));
  const startEconomyHonestyLine = register(makeElement("startEconomyHonestyLine", "div"));
  const btnStart = register(makeElement("btnStart", "button"));
  const btnRules = register(makeElement("btnRules", "button"));
  const btnResetOnboarding = register(makeElement("btnResetOnboarding", "button"));
  const startBirthYearDigit0 = register(makeElement("startBirthYearDigit0", "span"));
  const startBirthYearDigit1 = register(makeElement("startBirthYearDigit1", "span"));
  const right = register(makeElement("right", "div"));
  const menuBlock = register(makeElement("menuBlock", "div"));
  const startIntroRoot = register(makeElement("startIntroLines", "div"));

  startBirthYearDigit0.textContent = "0";
  startBirthYearDigit1.textContent = "0";
  birthYearPicker.setAttribute("data-birth-year-value", "00");

  const buttonSpecs = [
    ["startBirthYear0Up", 0, 1],
    ["startBirthYear0Down", 0, -1],
    ["startBirthYear1Up", 1, 1],
    ["startBirthYear1Down", 1, -1],
  ];
  buttonSpecs.forEach(([id, index, step]) => {
    const button = register(makeElement(id, "button"));
    button.setAttribute("data-birth-year-index", String(index));
    button.setAttribute("data-birth-year-step", String(step));
    birthYearPicker.appendChild(button);
  });

  [title, birthYearLabel, birthYearPicker, birthYearHint, birthYearFeelingLabel, birthYearFeelingInput, btnStart, btnRules, btnResetOnboarding, startEconomyHonestyLine, startIntroRoot].forEach((child) => {
    startScreen.appendChild(child);
  });
  birthYearPicker.appendChild(startBirthYearDigit0);
  birthYearPicker.appendChild(startBirthYearDigit1);

  for (let index = 0; index < 3; index += 1) {
    const line = register(makeElement(`introLine${index}`, "div"));
    line.classList.add("startIntroLine");
    startIntroLines.push(line);
    startIntroRoot.appendChild(line);
  }

  const document = {
    body,
    createElement(tagName) {
      return makeElement(`generated_${Object.keys(elements).length}`, tagName);
    },
    getElementById(id) {
      return elements[id] || null;
    },
    querySelector,
    querySelectorAll,
  };

  return { document, elements };
}

function makeObservedState() {
  const counts = {
    flagUiProfileSets: 0,
    saveSets: 0,
  };
  const flagsTarget = {};
  const flags = new Proxy(flagsTarget, {
    set(target, prop, value) {
      if (prop === "uiProfile") counts.flagUiProfileSets += 1;
      target[prop] = value;
      return true;
    },
    deleteProperty(target, prop) {
      delete target[prop];
      return true;
    },
  });
  const target = {
    flags,
    progress: {},
    save: null,
    isStarted: false,
  };
  const state = new Proxy(target, {
    get(obj, prop) {
      return obj[prop];
    },
    set(obj, prop, value) {
      if (prop === "save") counts.saveSets += 1;
      obj[prop] = value;
      return true;
    },
  });
  return { state, counts };
}

function createData() {
  return {
    UI_PROFILE: "default",
    TEXT_MODE: "millennial",
    UI_PROFILE_REGISTRY: { supported: ["default", "millennial", "zoomer", "alpha"] },
    START_SCREEN: {},
    START_POINTS_PLAYER: 7,
    normalizeUiProfile(value) {
      const normalized = String(value || "").trim().toLowerCase();
      return normalized || "default";
    },
    resolveUiProfileFromBirthYearValue(value) {
      const text = String(value || "").trim();
      if (text === "10") return "alpha";
      if (text === "90") return "zoomer";
      if (text === "42") return "millennial";
      return "millennial";
    },
    setUiProfile(value) {
      this.UI_PROFILE = this.normalizeUiProfile(value);
      return this.UI_PROFILE;
    },
    getUiProfile() {
      return this.UI_PROFILE;
    },
    resolveUiTextMode(value) {
      const profile = this.normalizeUiProfile(value);
      return profile === "alpha" || profile === "zoomer" ? "zoomer" : "millennial";
    },
    SYS: {
      joined(name) {
        return `${name} joined`;
      },
    },
  };
}

function createEnvironment(options = {}) {
  const { document, elements } = createDocument();
  const Data = createData();
  const observed = options.shared === true ? makeObservedState() : null;
  const uiState = observed ? observed.state : {
    flags: {},
    progress: {},
    save: null,
    isStarted: false,
  };
  const internalState = options.shared === true
    ? uiState
    : {
        flags: {},
        progress: {},
        save: null,
        isStarted: false,
      };
  const Game = {
    Data,
    __S: internalState,
    __A: {},
    __D: {
      securityEvents: [],
    },
    NPC: {
      seedPlayers() {},
    },
  };
  Object.defineProperty(Game, "State", {
    configurable: true,
    get() {
      Game.__D.securityEvents.push({ type: "forbidden_api_access", meta: { key: "Game.State" } });
      return undefined;
    },
  });
  globalThis.window = { Game };
  delete globalThis.G;
  if (Object.prototype.hasOwnProperty.call(globalThis, "G")) {
    throw new Error("ambient global G unexpectedly present after delete");
  }
  globalThis.document = document;
  globalThis.getComputedStyle = (element) => ({
    display: element && element.style && element.style.display ? element.style.display : "",
    visibility: element && element.style && element.style.visibility ? element.style.visibility : "visible",
  });
  return {
    Game,
    UI: {
      S: uiState,
      $: (id) => document.getElementById(id),
      hideMenuCalled: 0,
      hideMenu() {
        this.hideMenuCalled += 1;
      },
      withPointsWrite(callback) {
        callback();
      },
    },
    document,
    elements,
    observed,
  };
}

function forbiddenCount(game) {
  return game.__D.securityEvents.filter((entry) => entry && entry.type === "forbidden_api_access").length;
}

function changedDigitCount(beforeDigits, afterDigits) {
  let changed = 0;
  for (let index = 0; index < beforeDigits.length; index += 1) {
    if (beforeDigits[index] !== afterDigits[index]) changed += 1;
  }
  return changed;
}

function captureError(error) {
  if (!error) return null;
  return {
    name: typeof error.name === "string" ? error.name : null,
    message: typeof error.message === "string" ? error.message : String(error),
  };
}

function resolveStartScreenText(_data, key) {
  return String(key || "");
}

function markUiBootVersion() {}

function getActiveStartScreenProfile() {
  return window.Game.Data.getUiProfile();
}

function setSecondaryFieldVisible(element, visible) {
  if (!element) return;
  element.hidden = !visible;
  element.style.display = visible ? "" : "none";
}

function syncStartScreenRootTexts() {}

function buildWheel() {
  return "";
}

function ensureStartScreenVisible() {}

function getStartName() {
  return "Tester";
}

function markBootDiag() {}

__EXTRACTED__

const originalSyncUiTextModeFromUiProfile = syncUiTextModeFromUiProfile;
let syncUiTextModeCalls = 0;
syncUiTextModeFromUiProfile = function wrappedSyncUiTextModeFromUiProfile(...args) {
  syncUiTextModeCalls += 1;
  return originalSyncUiTextModeFromUiProfile(...args);
};

function runBirthYearScenario(buttonId, options = {}) {
  const env = createEnvironment();
  const installDevRefresh = options.installDevRefresh === true;
  let devRefreshCalls = 0;
  env.Game.__DEV = env.Game.__DEV && typeof env.Game.__DEV === "object" ? env.Game.__DEV : {};
  if (installDevRefresh) {
    env.Game.__DEV.refreshOnboardingStartScreenOnce = function refreshOnboardingStartScreenOnce() {
      devRefreshCalls += 1;
    };
  } else {
    delete env.Game.__DEV.refreshOnboardingStartScreenOnce;
  }
  const ambientGPresentBeforeClick = Object.prototype.hasOwnProperty.call(globalThis, "G");
  applyStartScreenContent(env.UI);
  const picker = env.document.getElementById("startBirthYearPicker");
  const button = env.document.getElementById(buttonId);
  const beforeDigits = [
    env.document.getElementById("startBirthYearDigit0").textContent,
    env.document.getElementById("startBirthYearDigit1").textContent,
  ];
  const beforeForbidden = forbiddenCount(env.Game);
  let clickUncaughtError = null;
  try {
    picker.dispatch("click", button);
  } catch (error) {
    clickUncaughtError = captureError(error);
  }
  const afterDigits = [
    env.document.getElementById("startBirthYearDigit0").textContent,
    env.document.getElementById("startBirthYearDigit1").textContent,
  ];
  const ambientGPresentAfterClick = Object.prototype.hasOwnProperty.call(globalThis, "G");
  const digitValue = picker.getAttribute("data-birth-year-value");
  return {
    ambientGPresentBeforeClick,
    ambientGPresentAfterClick,
    clickUncaughtError,
    changedDigitCount: changedDigitCount(beforeDigits, afterDigits),
    digitValue,
    forbiddenDelta: forbiddenCount(env.Game) - beforeForbidden,
    dataUiProfile: env.Game.Data.getUiProfile(),
    uiStateProfile: env.UI.S.flags.uiProfile || null,
    internalStateProfile: env.Game.__S.flags.uiProfile || null,
    devRefreshCalls,
    pageUsable: !!picker && digitValue === `${afterDigits[0]}${afterDigits[1]}` && !!env.document.getElementById("btnStart"),
  };
}

function runSavedProfileRestoreScenario() {
  const env = createEnvironment();
  env.UI.S.save = { uiProfile: "alpha" };
  const beforeForbidden = forbiddenCount(env.Game);
  applyStartScreenContent(env.UI);
  return {
    forbiddenDelta: forbiddenCount(env.Game) - beforeForbidden,
    dataUiProfile: env.Game.Data.getUiProfile(),
    uiStateProfile: env.UI.S.flags.uiProfile || null,
    internalStateProfile: env.Game.__S.flags.uiProfile || null,
    listenerBound: env.document.getElementById("startBirthYearPicker").dataset.bound || null,
  };
}

function runSharedSyncScenario() {
  const env = createEnvironment({ shared: true });
  const beforeForbidden = forbiddenCount(env.Game);
  const uiProfile = syncStartScreenUiProfileFromSelection(env.UI, "10");
  return {
    uiProfile,
    forbiddenDelta: forbiddenCount(env.Game) - beforeForbidden,
    flagUiProfileSets: env.observed.counts.flagUiProfileSets,
    sharedProfile: env.UI.S.flags.uiProfile || null,
    dataUiProfile: env.Game.Data.getUiProfile(),
  };
}

function runApplyDistinctScenario() {
  const env = createEnvironment();
  env.UI.S.flags.uiProfile = "stale";
  env.Game.__S.flags.uiProfile = "stale";
  const beforeForbidden = forbiddenCount(env.Game);
  const beforeSyncCalls = syncUiTextModeCalls;
  const uiProfile = applyUiProfileBeforeEnter(env.UI, "10");
  return {
    uiProfile,
    forbiddenDelta: forbiddenCount(env.Game) - beforeForbidden,
    syncUiTextModeCalls: syncUiTextModeCalls - beforeSyncCalls,
    dataUiProfile: env.Game.Data.getUiProfile(),
    uiStateProfile: env.UI.S.flags.uiProfile || null,
    internalStateProfile: env.Game.__S.flags.uiProfile || null,
    uiSaveProfile: env.UI.S.save && env.UI.S.save.uiProfile,
    internalSaveProfile: env.Game.__S.save && env.Game.__S.save.uiProfile,
  };
}

function runApplySharedScenario() {
  const env = createEnvironment({ shared: true });
  env.UI.S.flags.uiProfile = "stale";
  const beforeFlagSets = env.observed.counts.flagUiProfileSets;
  const beforeSaveSets = env.observed.counts.saveSets;
  const beforeForbidden = forbiddenCount(env.Game);
  const beforeSyncCalls = syncUiTextModeCalls;
  const uiProfile = applyUiProfileBeforeEnter(env.UI, "90");
  return {
    uiProfile,
    forbiddenDelta: forbiddenCount(env.Game) - beforeForbidden,
    syncUiTextModeCalls: syncUiTextModeCalls - beforeSyncCalls,
    flagUiProfileSets: env.observed.counts.flagUiProfileSets - beforeFlagSets,
    saveSets: env.observed.counts.saveSets - beforeSaveSets,
    sharedProfile: env.UI.S.flags.uiProfile || null,
    sharedSaveProfile: env.UI.S.save && env.UI.S.save.uiProfile,
    dataUiProfile: env.Game.Data.getUiProfile(),
  };
}

function runRestoreScenario() {
  const env = createEnvironment();
  env.UI.S.progress.onboardingSeen = true;
  env.UI.S.isStarted = true;
  env.UI.S.flags.started = true;
  env.Game.__S.isStarted = true;
  env.Game.__S.flags.started = true;
  env.document.getElementById("startBirthYearDigit0").textContent = "7";
  env.document.getElementById("startBirthYearDigit1").textContent = "8";
  env.document.getElementById("startBirthYearPicker").setAttribute("data-birth-year-value", "78");
  env.document.getElementById("startBirthYearFeelingInput").value = "99";
  let refreshCalls = 0;
  let visibleCalls = 0;
  applyStartScreenContent = function patchedApplyStartScreenContent() {
    refreshCalls += 1;
  };
  ensureStartScreenVisible = function patchedEnsureStartScreenVisible() {
    visibleCalls += 1;
  };
  const beforeForbidden = forbiddenCount(env.Game);
  restoreFreshStartScreenState(env.UI);
  return {
    forbiddenDelta: forbiddenCount(env.Game) - beforeForbidden,
    onboardingSeen: getOnboardingSeen(env.UI),
    uiStarted: env.UI.S.isStarted,
    uiFlagStarted: env.UI.S.flags.started,
    internalStarted: env.Game.__S.isStarted,
    internalFlagStarted: env.Game.__S.flags.started,
    digitValue: env.document.getElementById("startBirthYearPicker").getAttribute("data-birth-year-value"),
    feelingValue: env.document.getElementById("startBirthYearFeelingInput").value,
    refreshCalls,
    visibleCalls,
  };
}

function runShowDecisionScenario() {
  const env = createEnvironment();
  const beforeForbidden = forbiddenCount(env.Game);
  const whenFresh = shouldShowFreshStartScreen(env.UI);
  env.UI.S.isStarted = true;
  env.UI.S.flags.started = true;
  const whenStarted = shouldShowFreshStartScreen(env.UI);
  return {
    forbiddenDelta: forbiddenCount(env.Game) - beforeForbidden,
    whenFresh,
    whenStarted,
  };
}

function runClearScenario() {
  const env = createEnvironment();
  env.document.body.classList.add("menu-open");
  env.document.getElementById("right").classList.add("menu-open");
  env.document.getElementById("menuBlock").classList.add("menu-open");
  env.UI.S.flags.menuOpen = true;
  env.Game.__S.flags.menuOpen = true;
  const beforeForbidden = forbiddenCount(env.Game);
  clearStartScreenInterference(env.UI);
  return {
    forbiddenDelta: forbiddenCount(env.Game) - beforeForbidden,
    bodyHasMenuOpen: env.document.body.classList.contains("menu-open"),
    rightHasMenuOpen: env.document.getElementById("right").classList.contains("menu-open"),
    menuHidden: env.document.getElementById("menuBlock").classList.contains("hidden"),
    uiMenuOpen: env.UI.S.flags.menuOpen,
    internalMenuOpen: env.Game.__S.flags.menuOpen,
  };
}

function runReturnScenario() {
  const env = createEnvironment();
  env.UI.S.isStarted = true;
  env.UI.S.flags.started = true;
  env.UI.S.flags.menuOpen = true;
  env.Game.__S.isStarted = true;
  env.Game.__S.flags.started = true;
  env.Game.__S.flags.menuOpen = true;
  let refreshCalls = 0;
  let visibleCalls = 0;
  applyStartScreenContent = function patchedApplyStartScreenContent() {
    refreshCalls += 1;
  };
  ensureStartScreenVisible = function patchedEnsureStartScreenVisible() {
    visibleCalls += 1;
  };
  const beforeForbidden = forbiddenCount(env.Game);
  const outcome = returnToStartScreen(env.UI);
  return {
    forbiddenDelta: forbiddenCount(env.Game) - beforeForbidden,
    outcome,
    hideMenuCalled: env.UI.hideMenuCalled,
    uiStarted: env.UI.S.isStarted,
    uiFlagStarted: env.UI.S.flags.started,
    uiMenuOpen: env.UI.S.flags.menuOpen,
    internalStarted: env.Game.__S.isStarted,
    internalFlagStarted: env.Game.__S.flags.started,
    internalMenuOpen: env.Game.__S.flags.menuOpen,
    refreshCalls,
    visibleCalls,
  };
}

function runExplicitAccessScenario() {
  const env = createEnvironment();
  const beforeForbidden = forbiddenCount(env.Game);
  void env.Game.State;
  return {
    forbiddenDelta: forbiddenCount(env.Game) - beforeForbidden,
  };
}

const result = {
  fileLabel: FILE_LABEL,
  birthYearUp: runBirthYearScenario("startBirthYear0Up"),
  birthYearDown: runBirthYearScenario("startBirthYear0Down"),
  birthYearUpWithDevRefresh: runBirthYearScenario("startBirthYear0Up", { installDevRefresh: true }),
  birthYearDownWithDevRefresh: runBirthYearScenario("startBirthYear0Down", { installDevRefresh: true }),
  savedUiProfileRestore: runSavedProfileRestoreScenario(),
  sharedSync: runSharedSyncScenario(),
  applyDistinct: runApplyDistinctScenario(),
  applyShared: runApplySharedScenario(),
  restore: runRestoreScenario(),
  showDecision: runShowDecisionScenario(),
  clear: runClearScenario(),
  returnToStartScreen: runReturnScenario(),
  explicitAccess: runExplicitAccessScenario(),
};

console.log(JSON.stringify(result));
""".replace("__FILE_LABEL__", json.dumps(label)).replace("__EXTRACTED__", extracted)
    completed = subprocess.run(
        ["node", "--input-type=module", "-e", script],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
    )
    if completed.returncode != 0:
        raise AssertionError(
            "ui-boot harness failed\n"
            f"stdout:\n{completed.stdout}\n"
            f"stderr:\n{completed.stderr}"
        )
    return json.loads(completed.stdout)


def run_ui_boot_harness(label: str, path: Path) -> dict[str, object]:
    return run_ui_boot_harness_source(label, path.read_text(encoding="utf-8"))


class Step9UiBootForbiddenStateAccessTests(unittest.TestCase):
    maxDiff = None

    def test_ui_boot_harness_covers_both_mirrors_without_public_state_getter_reads(self) -> None:
        source_result = run_ui_boot_harness("source", BOOT_CASES["source"])
        docs_result = run_ui_boot_harness("docs", BOOT_CASES["docs"])

        for result in (source_result, docs_result):
            self.assertFalse(result["birthYearUp"]["ambientGPresentBeforeClick"])
            self.assertFalse(result["birthYearUp"]["ambientGPresentAfterClick"])
            self.assertIsNone(result["birthYearUp"]["clickUncaughtError"])
            self.assertEqual(result["birthYearUp"]["changedDigitCount"], 1)
            self.assertEqual(result["birthYearUp"]["digitValue"], "10")
            self.assertEqual(result["birthYearUp"]["forbiddenDelta"], 0)
            self.assertEqual(result["birthYearUp"]["dataUiProfile"], "alpha")
            self.assertEqual(result["birthYearUp"]["uiStateProfile"], "alpha")
            self.assertEqual(result["birthYearUp"]["internalStateProfile"], "alpha")
            self.assertTrue(result["birthYearUp"]["pageUsable"])

            self.assertFalse(result["birthYearDown"]["ambientGPresentBeforeClick"])
            self.assertFalse(result["birthYearDown"]["ambientGPresentAfterClick"])
            self.assertIsNone(result["birthYearDown"]["clickUncaughtError"])
            self.assertEqual(result["birthYearDown"]["changedDigitCount"], 1)
            self.assertEqual(result["birthYearDown"]["digitValue"], "90")
            self.assertEqual(result["birthYearDown"]["forbiddenDelta"], 0)
            self.assertEqual(result["birthYearDown"]["dataUiProfile"], "zoomer")
            self.assertEqual(result["birthYearDown"]["uiStateProfile"], "zoomer")
            self.assertEqual(result["birthYearDown"]["internalStateProfile"], "zoomer")
            self.assertTrue(result["birthYearDown"]["pageUsable"])

            self.assertFalse(result["birthYearUpWithDevRefresh"]["ambientGPresentBeforeClick"])
            self.assertFalse(result["birthYearUpWithDevRefresh"]["ambientGPresentAfterClick"])
            self.assertIsNone(result["birthYearUpWithDevRefresh"]["clickUncaughtError"])
            self.assertEqual(result["birthYearUpWithDevRefresh"]["changedDigitCount"], 1)
            self.assertEqual(result["birthYearUpWithDevRefresh"]["digitValue"], "10")
            self.assertEqual(result["birthYearUpWithDevRefresh"]["forbiddenDelta"], 0)
            self.assertEqual(result["birthYearUpWithDevRefresh"]["dataUiProfile"], "alpha")
            self.assertEqual(result["birthYearUpWithDevRefresh"]["uiStateProfile"], "alpha")
            self.assertEqual(result["birthYearUpWithDevRefresh"]["internalStateProfile"], "alpha")
            self.assertEqual(result["birthYearUpWithDevRefresh"]["devRefreshCalls"], 1)
            self.assertTrue(result["birthYearUpWithDevRefresh"]["pageUsable"])

            self.assertFalse(result["birthYearDownWithDevRefresh"]["ambientGPresentBeforeClick"])
            self.assertFalse(result["birthYearDownWithDevRefresh"]["ambientGPresentAfterClick"])
            self.assertIsNone(result["birthYearDownWithDevRefresh"]["clickUncaughtError"])
            self.assertEqual(result["birthYearDownWithDevRefresh"]["changedDigitCount"], 1)
            self.assertEqual(result["birthYearDownWithDevRefresh"]["digitValue"], "90")
            self.assertEqual(result["birthYearDownWithDevRefresh"]["forbiddenDelta"], 0)
            self.assertEqual(result["birthYearDownWithDevRefresh"]["dataUiProfile"], "zoomer")
            self.assertEqual(result["birthYearDownWithDevRefresh"]["uiStateProfile"], "zoomer")
            self.assertEqual(result["birthYearDownWithDevRefresh"]["internalStateProfile"], "zoomer")
            self.assertEqual(result["birthYearDownWithDevRefresh"]["devRefreshCalls"], 1)
            self.assertTrue(result["birthYearDownWithDevRefresh"]["pageUsable"])

            self.assertEqual(result["savedUiProfileRestore"]["forbiddenDelta"], 0)
            self.assertEqual(result["savedUiProfileRestore"]["dataUiProfile"], "alpha")
            self.assertEqual(result["savedUiProfileRestore"]["uiStateProfile"], "alpha")
            self.assertEqual(result["savedUiProfileRestore"]["internalStateProfile"], "alpha")
            self.assertEqual(result["savedUiProfileRestore"]["listenerBound"], "1")

            self.assertEqual(result["sharedSync"]["forbiddenDelta"], 0)
            self.assertEqual(result["sharedSync"]["uiProfile"], "alpha")
            self.assertEqual(result["sharedSync"]["sharedProfile"], "alpha")
            self.assertEqual(result["sharedSync"]["dataUiProfile"], "alpha")
            self.assertEqual(result["sharedSync"]["flagUiProfileSets"], 1)

            self.assertEqual(result["applyDistinct"]["forbiddenDelta"], 0)
            self.assertEqual(result["applyDistinct"]["uiProfile"], "alpha")
            self.assertEqual(result["applyDistinct"]["dataUiProfile"], "alpha")
            self.assertEqual(result["applyDistinct"]["uiStateProfile"], "alpha")
            self.assertEqual(result["applyDistinct"]["internalStateProfile"], "alpha")
            self.assertEqual(result["applyDistinct"]["uiSaveProfile"], "alpha")
            self.assertEqual(result["applyDistinct"]["internalSaveProfile"], "alpha")

            self.assertEqual(result["applyShared"]["forbiddenDelta"], 0)
            self.assertEqual(result["applyShared"]["uiProfile"], "zoomer")
            self.assertEqual(result["applyShared"]["sharedProfile"], "zoomer")
            self.assertEqual(result["applyShared"]["sharedSaveProfile"], "zoomer")
            self.assertEqual(result["applyShared"]["dataUiProfile"], "zoomer")
            self.assertEqual(result["applyShared"]["flagUiProfileSets"], 1)
            self.assertEqual(result["applyShared"]["saveSets"], 1)

            self.assertEqual(result["restore"]["forbiddenDelta"], 0)
            self.assertFalse(result["restore"]["onboardingSeen"])
            self.assertFalse(result["restore"]["uiStarted"])
            self.assertFalse(result["restore"]["uiFlagStarted"])
            self.assertFalse(result["restore"]["internalStarted"])
            self.assertFalse(result["restore"]["internalFlagStarted"])
            self.assertEqual(result["restore"]["digitValue"], "00")
            self.assertEqual(result["restore"]["feelingValue"], "")
            self.assertEqual(result["restore"]["refreshCalls"], 1)
            self.assertEqual(result["restore"]["visibleCalls"], 1)

            self.assertEqual(result["showDecision"]["forbiddenDelta"], 0)
            self.assertTrue(result["showDecision"]["whenFresh"])
            self.assertFalse(result["showDecision"]["whenStarted"])

            self.assertEqual(result["clear"]["forbiddenDelta"], 0)
            self.assertFalse(result["clear"]["bodyHasMenuOpen"])
            self.assertFalse(result["clear"]["rightHasMenuOpen"])
            self.assertTrue(result["clear"]["menuHidden"])
            self.assertFalse(result["clear"]["uiMenuOpen"])
            self.assertFalse(result["clear"]["internalMenuOpen"])

            self.assertEqual(result["returnToStartScreen"]["forbiddenDelta"], 0)
            self.assertEqual(result["returnToStartScreen"]["hideMenuCalled"], 1)
            self.assertFalse(result["returnToStartScreen"]["uiStarted"])
            self.assertFalse(result["returnToStartScreen"]["uiFlagStarted"])
            self.assertFalse(result["returnToStartScreen"]["uiMenuOpen"])
            self.assertFalse(result["returnToStartScreen"]["internalStarted"])
            self.assertFalse(result["returnToStartScreen"]["internalFlagStarted"])
            self.assertFalse(result["returnToStartScreen"]["internalMenuOpen"])
            self.assertEqual(result["returnToStartScreen"]["refreshCalls"], 1)
            self.assertEqual(result["returnToStartScreen"]["visibleCalls"], 1)
            self.assertTrue(result["returnToStartScreen"]["outcome"]["ok"])

            self.assertEqual(result["explicitAccess"]["forbiddenDelta"], 1)

        self.assertEqual(source_result["applyDistinct"]["syncUiTextModeCalls"], 1)
        self.assertEqual(source_result["applyShared"]["syncUiTextModeCalls"], 1)
        self.assertEqual(docs_result["applyDistinct"]["syncUiTextModeCalls"], 0)
        self.assertEqual(docs_result["applyShared"]["syncUiTextModeCalls"], 0)

        comparable_keys = (
            "birthYearUp",
            "birthYearDown",
            "birthYearUpWithDevRefresh",
            "birthYearDownWithDevRefresh",
            "savedUiProfileRestore",
            "sharedSync",
            "restore",
            "showDecision",
            "clear",
            "returnToStartScreen",
            "explicitAccess",
        )
        for key in comparable_keys:
            self.assertEqual(source_result[key], docs_result[key])

        self.assertEqual(
            {key: value for key, value in source_result["applyDistinct"].items() if key != "syncUiTextModeCalls"},
            {key: value for key, value in docs_result["applyDistinct"].items() if key != "syncUiTextModeCalls"},
        )
        self.assertEqual(
            {key: value for key, value in source_result["applyShared"].items() if key != "syncUiTextModeCalls"},
            {key: value for key, value in docs_result["applyShared"].items() if key != "syncUiTextModeCalls"},
        )

    def test_baseline_click_path_fails_without_ambient_g_alias(self) -> None:
        for label, relative_path in BOOT_RELATIVE_PATHS.items():
            baseline_source = git_show(BASELINE_SHA, relative_path)
            result = run_ui_boot_harness_source(f"{label}-baseline", baseline_source)
            self.assertFalse(result["birthYearUp"]["ambientGPresentBeforeClick"])
            self.assertFalse(result["birthYearUp"]["ambientGPresentAfterClick"])
            self.assertIsNotNone(result["birthYearUp"]["clickUncaughtError"])
            self.assertEqual(result["birthYearUp"]["clickUncaughtError"]["message"], "G is not defined")
            self.assertEqual(result["birthYearUp"]["forbiddenDelta"], 0)
            self.assertFalse(result["birthYearDown"]["ambientGPresentBeforeClick"])
            self.assertFalse(result["birthYearDown"]["ambientGPresentAfterClick"])
            self.assertIsNotNone(result["birthYearDown"]["clickUncaughtError"])
            self.assertEqual(result["birthYearDown"]["clickUncaughtError"]["message"], "G is not defined")
            self.assertEqual(result["birthYearDown"]["forbiddenDelta"], 0)

    def test_production_functions_no_longer_reference_public_game_state_getter(self) -> None:
        for label, path in BOOT_CASES.items():
            source = path.read_text(encoding="utf-8")
            for name in PRODUCTION_FUNCTIONS:
                extracted = extract_named_function(source, name)
                self.assertIsNone(
                    PUBLIC_STATE_PATTERN.search(extracted),
                    msg=f"{label} production function still references public Game.State: {name}",
                )

    def test_index_files_only_bump_ui_boot_query_token(self) -> None:
        for relative_path, path in (
            ("AsyncScene/Web/index.html", INDEX_CASES["source"]),
            ("docs/index.html", INDEX_CASES["docs"]),
        ):
            current = path.read_text(encoding="utf-8")
            baseline = git_show(BASELINE_SHA, relative_path)

            current_match = UI_BOOT_TOKEN_PATTERN.search(current)
            baseline_match = UI_BOOT_TOKEN_PATTERN.search(baseline)
            self.assertIsNotNone(current_match, msg=f"missing ui-boot token in {relative_path}")
            self.assertIsNotNone(baseline_match, msg=f"missing baseline ui-boot token in {relative_path}")
            self.assertEqual(current_match.group(1), EXPECTED_UI_BOOT_TOKEN)

            normalized_current = UI_BOOT_TOKEN_PATTERN.sub('ui/ui-boot.js?v=<UI_BOOT_TOKEN>', current, count=1)
            normalized_baseline = UI_BOOT_TOKEN_PATTERN.sub('ui/ui-boot.js?v=<UI_BOOT_TOKEN>', baseline, count=1)
            self.assertEqual(normalized_current, normalized_baseline)


if __name__ == "__main__":
    unittest.main()
