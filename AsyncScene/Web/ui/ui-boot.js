//
//  ui-boot.js
//  AsyncScene
//
//  Created by Ray on 2025/12/17.
//

// ui-boot.js
window.Game = window.Game || {};

(() => {
  const UIBOOT_VERSION = "UIBOOT_V11";
  const UIBOOT_MODE_FIX_MARKER = "STATE_MODE_FIX_V11";
  const BOOT_DIAG_MAX = 16;
  const bootDiagLines = [];
  window.__uiBootDiagLines = bootDiagLines;

  function markBootDiag(label) {
    const line = `${new Date().toLocaleTimeString()} ${label}`;
    bootDiagLines.push(line);
    while (bootDiagLines.length > BOOT_DIAG_MAX) bootDiagLines.shift();
  }

  function markUiBootVersion() {
    markBootDiag(`${UIBOOT_VERSION}_LOADED`);
    markBootDiag(UIBOOT_MODE_FIX_MARKER);
  }


  function describeStartError(err) {
    const message = err && err.message ? err.message : String(err);
    const stack = err && err.stack ? String(err.stack) : "";
    const firstFrame = stack.split("\n").map((x) => x.trim()).find((x) => /:\d+:\d+/.test(x)) || "";
    return { message, stack, firstFrame };
  }

  function markStartError(prefix, err) {
    const info = describeStartError(err);
    markBootDiag(`${prefix}:${info.message}`);
    if (info.firstFrame) markBootDiag(`${prefix}_AT:${info.firstFrame}`);
    if (typeof console !== "undefined" && console.error) {
      console.error(`[${prefix}] message=${info.message} frame=${info.firstFrame || "unknown"}`, err);
    }
  }


  function installGlobalDiagnostics() {
    if (window.__uiBootGlobalDiagnosticsV9) return;
    window.__uiBootGlobalDiagnosticsV9 = true;
    window.onerror = function(message, source, lineno, colno, error) {
      const file = source || "unknown";
      const line = lineno == null ? "?" : lineno;
      const msg = message || (error && error.message) || "unknown";
      markBootDiag(`GLOBAL_ONERROR:${file}:${line}:${msg}`);
      if (typeof console !== "undefined" && console.error) {
        console.error(`[GLOBAL_ONERROR] file=${file} line=${line} col=${colno == null ? "?" : colno} message=${msg}`, error || "");
      }
      return false;
    };
    window.addEventListener("error", (event) => {
      const file = event.filename || "unknown";
      const line = event.lineno == null ? "?" : event.lineno;
      const msg = event.message || (event.error && event.error.message) || "unknown";
      markBootDiag(`GLOBAL_ERROR:${file}:${line}:${msg}`);
      if (typeof console !== "undefined" && console.error) {
        console.error(`[GLOBAL_ERROR] file=${file} line=${line} col=${event.colno == null ? "?" : event.colno} message=${msg}`, event.error || event);
      }
    });
    window.addEventListener("unhandledrejection", (event) => {
      const reason = event.reason;
      const msg = reason && reason.message ? reason.message : String(reason);
      const info = describeStartError(reason || msg);
      markBootDiag(`GLOBAL_UNHANDLEDREJECTION:${info.firstFrame || "unknown"}:${msg}`);
      if (typeof console !== "undefined" && console.error) {
        console.error(`[GLOBAL_UNHANDLEDREJECTION] fileLine=${info.firstFrame || "unknown"} message=${msg}`, reason);
      }
    });
  }

  function getStartName(UI) {
    const $ = UI && UI.$;
    const input = ($ && $("nameInput")) || document.getElementById("nameInput");
    const typed = input ? String(input.value || "").trim() : "";
    if (typed) return typed;
    const D = (window.Game && window.Game.Data) ? window.Game.Data : null;
    if (D && Array.isArray(D.RANDOM_NAMES) && D.RANDOM_NAMES.length) {
      if (typeof D.pick === "function") return String(D.pick(D.RANDOM_NAMES) || "Игрок").trim() || "Игрок";
      return String(D.RANDOM_NAMES[0] || "Игрок").trim() || "Игрок";
    }
    return "Игрок";
  }

  // Boot must run only when:
  // 1) DOM is ready
  // 2) Game.UI is already defined (ui-core.js loaded)
  // Otherwise we show nothing / bind nothing and the start screen breaks.

  function getLocations() {
    const d = (window.Game && window.Game.Data) ? window.Game.Data : null;
    if (d && Array.isArray(d.LOCATIONS) && d.LOCATIONS.length) return d.LOCATIONS;
    return [
      { id: "square", name: "Площадь" },
      { id: "bar", name: "Ночной бар" },
      { id: "arcade", name: "Аркада" },
      { id: "roof", name: "Крыша" },
    ];
  }

  function whenReady(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn, { once: true });
    else fn();
  }

  function getUI() {
    const UI = window.Game && window.Game.UI;
    if (!UI || !UI.S || !UI.$) return null;
    return UI;
  }

  function resolveStartScreenText(Data, key, forcedProfile) {
    if (Data && typeof Data.resolveStartScreenText === "function") {
      return String(Data.resolveStartScreenText(key, forcedProfile) || "");
    }
    const raw = String(forcedProfile == null ? (Data && Data.TEXT_MODE) : forcedProfile || "").trim().toLowerCase();
    const mode = (raw === "zoomer" || raw === "alpha" || raw === "genz") ? "zoomer" : "millennial";
    const millennial = {
      start_title: "AsyncScene",
      birth_digits_label: "Последние 2 цифры года рождения",
      digit_up_first: "Увеличить первую цифру",
      digit_down_first: "Уменьшить первую цифру",
      digit_up_second: "Увеличить вторую цифру",
      digit_down_second: "Уменьшить вторую цифру",
      profile_helper: "Только для интерфейса. Не сохраняем. Можно поменять позже.",
      fantasy_birth_label: "я на самом деле чувствую будто я родился в …",
      start_continue: "Продолжить",
      start_start: "Старт",
      start_reset: "Сбросить старт",
      rules_action: "Правила",
      start_action: "Старт",
    };
    const zoomer = {
      start_title: "AsyncScene",
      birth_digits_label: "Две цифры вайба",
      digit_up_first: "Первая цифра выше",
      digit_down_first: "Первая цифра ниже",
      digit_up_second: "Вторая цифра выше",
      digit_down_second: "Вторая цифра ниже",
      profile_helper: "Это только стиль интерфейса. Потом можно перекинуть.",
      fantasy_birth_label: "по вайбу я родился в …",
      start_continue: "Погнали",
      start_start: "Старт",
      start_reset: "Снести выбор",
      rules_action: "Правила без душноты",
      start_action: "Войти",
    };
    const table = mode === "zoomer" ? zoomer : millennial;
    return String(Object.prototype.hasOwnProperty.call(table, key) ? table[key] : millennial[key] || "");
  }

  function ensureStartScreenExists(UI) {
    const $ = UI.$;
    const D = (window.Game && window.Game.Data) ? window.Game.Data : null;

    // If UI.$ can't see it, try the raw DOM (in case ui-core changed $ semantics)
    let st = $("startScreen") || document.getElementById("startScreen");

    if (!st) {
      // Inject minimal overlay markup so the game can always boot even if index.html lost it.
      st = document.createElement("div");
      st.id = "startScreen";
      st.className = "overlay active";
      st.innerHTML = `
        <div id="startCard">
          <h1 id="startTitle"></h1>
          <div id="startIntroLines"></div>
          <div id="startEconomyHonestyLine"></div>
          <label id="startBirthYearLabel" class="startFieldLabel">${resolveStartScreenText(D, "birth_digits_label")}</label>
          <div id="startBirthYearPicker" class="startBirthYearPicker" aria-label="${resolveStartScreenText(D, "birth_digits_label")}">
            <div class="startBirthYearWheel" data-birth-year-digit="0">
              <button id="startBirthYear0Up" class="startBirthYearArrow" type="button" data-birth-year-step="1" data-birth-year-index="0" aria-label="${resolveStartScreenText(D, "digit_up_first")}" title="${resolveStartScreenText(D, "digit_up_first")}">▲</button>
              <div id="startBirthYearDigit0" class="startBirthYearDigit" aria-live="polite">0</div>
              <button id="startBirthYear0Down" class="startBirthYearArrow" type="button" data-birth-year-step="-1" data-birth-year-index="0" aria-label="${resolveStartScreenText(D, "digit_down_first")}" title="${resolveStartScreenText(D, "digit_down_first")}">▼</button>
            </div>
            <div class="startBirthYearWheel" data-birth-year-digit="1">
              <button id="startBirthYear1Up" class="startBirthYearArrow" type="button" data-birth-year-step="1" data-birth-year-index="1" aria-label="${resolveStartScreenText(D, "digit_up_second")}" title="${resolveStartScreenText(D, "digit_up_second")}">▲</button>
              <div id="startBirthYearDigit1" class="startBirthYearDigit" aria-live="polite">0</div>
              <button id="startBirthYear1Down" class="startBirthYearArrow" type="button" data-birth-year-step="-1" data-birth-year-index="1" aria-label="${resolveStartScreenText(D, "digit_down_second")}" title="${resolveStartScreenText(D, "digit_down_second")}">▼</button>
            </div>
          </div>
          <div id="startBirthYearHint" class="startFieldHint">${resolveStartScreenText(D, "profile_helper")}</div>
          <label id="startBirthYearFeelingLabel" class="startFieldLabel">${resolveStartScreenText(D, "fantasy_birth_label")}</label>
          <input id="startBirthYearFeelingInput" class="input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" inputmode="text" />
          <div id="startBtns">
            <button id="btnStart" class="btn primary"></button>
            <button id="btnRules" class="btn"></button>
          </div>
          <button id="btnResetOnboarding" class="btn" type="button"></button>
        </div>
      `;
      document.body.appendChild(st);
    }

    if (!st.querySelector("#btnResetOnboarding")) {
      const reset = document.createElement("button");
      reset.id = "btnResetOnboarding";
      reset.className = "btn hidden";
      reset.type = "button";
      reset.hidden = true;
      const card = st.querySelector("#startCard") || st.firstElementChild || st;
      card.appendChild(reset);
    }

    return st;
  }

  function ensureStartScreenVisible(UI) {
    const st = ensureStartScreenExists(UI);
    if (!st) return;

    // Make visible regardless of CSS implementation in index.html
    st.classList.remove("hidden");
    st.hidden = false;
    st.classList.add("active");
    st.style.display = "flex";
    st.style.visibility = "visible";
    st.style.opacity = "1";
    st.removeAttribute("aria-hidden");
    st.style.pointerEvents = "auto";
    st.style.position = "fixed";
    st.style.inset = "0";
    st.style.zIndex = "2147483647";
    const card = st.querySelector("#startCard");
    if (card) {
      card.style.pointerEvents = "auto";
      card.style.position = card.style.position || "relative";
      card.style.zIndex = card.style.zIndex || "1";
    }
    const D = (window.Game && window.Game.Data) ? window.Game.Data : null;
    const titleEl = st.querySelector("#startTitle") || document.getElementById("startTitle");
    if (titleEl) titleEl.textContent = resolveStartScreenText(D, "start_title");
    const birthYearLabel = st.querySelector("#startBirthYearLabel") || document.getElementById("startBirthYearLabel");
    if (birthYearLabel) birthYearLabel.textContent = resolveStartScreenText(D, "birth_digits_label");
    const birthYearPicker = st.querySelector("#startBirthYearPicker") || document.getElementById("startBirthYearPicker");
    if (birthYearPicker) birthYearPicker.setAttribute("aria-label", resolveStartScreenText(D, "birth_digits_label"));
    const arrow0Up = st.querySelector("#startBirthYear0Up") || document.getElementById("startBirthYear0Up");
    if (arrow0Up) { arrow0Up.setAttribute("aria-label", resolveStartScreenText(D, "digit_up_first")); arrow0Up.title = resolveStartScreenText(D, "digit_up_first"); }
    const arrow0Down = st.querySelector("#startBirthYear0Down") || document.getElementById("startBirthYear0Down");
    if (arrow0Down) { arrow0Down.setAttribute("aria-label", resolveStartScreenText(D, "digit_down_first")); arrow0Down.title = resolveStartScreenText(D, "digit_down_first"); }
    const arrow1Up = st.querySelector("#startBirthYear1Up") || document.getElementById("startBirthYear1Up");
    if (arrow1Up) { arrow1Up.setAttribute("aria-label", resolveStartScreenText(D, "digit_up_second")); arrow1Up.title = resolveStartScreenText(D, "digit_up_second"); }
    const arrow1Down = st.querySelector("#startBirthYear1Down") || document.getElementById("startBirthYear1Down");
    if (arrow1Down) { arrow1Down.setAttribute("aria-label", resolveStartScreenText(D, "digit_down_second")); arrow1Down.title = resolveStartScreenText(D, "digit_down_second"); }
    const birthYearHint = st.querySelector("#startBirthYearHint") || document.getElementById("startBirthYearHint");
    if (birthYearHint) birthYearHint.textContent = resolveStartScreenText(D, "profile_helper");
    const birthYearFeelingLabel = st.querySelector("#startBirthYearFeelingLabel") || document.getElementById("startBirthYearFeelingLabel");
    if (birthYearFeelingLabel) birthYearFeelingLabel.textContent = resolveStartScreenText(D, "fantasy_birth_label");
    const startBtn = st.querySelector("#btnStart") || document.getElementById("btnStart");
    const rulesBtn = st.querySelector("#btnRules") || document.getElementById("btnRules");
    if (startBtn) {
      const resumeMode = getOnboardingSeen(UI);
      startBtn.textContent = resumeMode ? resolveStartScreenText(D, "start_continue") : resolveStartScreenText(D, "start_action");
      startBtn.setAttribute("aria-label", resolveStartScreenText(D, "start_start"));
      startBtn.title = resolveStartScreenText(D, "start_action");
    }
    if (rulesBtn) {
      rulesBtn.textContent = resolveStartScreenText(D, "rules_action");
      rulesBtn.setAttribute("aria-label", resolveStartScreenText(D, "rules_action"));
      rulesBtn.title = resolveStartScreenText(D, "rules_action");
    }
    const resetBtn = st.querySelector("#btnResetOnboarding") || document.getElementById("btnResetOnboarding");
    if (resetBtn) resetBtn.textContent = resolveStartScreenText(D, "start_reset");
    st.querySelectorAll("#btnStart, #btnRules, #btnResetOnboarding, #startBirthYearPicker button").forEach((el) => {
      el.style.pointerEvents = "auto";
      el.style.position = el.style.position || "relative";
      el.style.zIndex = el.style.zIndex || "2";
      if (el.tagName === "BUTTON" && !el.getAttribute("type")) el.setAttribute("type", "button");
    });
    const showSecondary = getOnboardingSeen(UI);
    const secondaryEls = [
      st.querySelector("#startBirthYearFeelingLabel") || document.getElementById("startBirthYearFeelingLabel"),
      st.querySelector("#startBirthYearFeelingInput") || document.getElementById("startBirthYearFeelingInput"),
    ];
    secondaryEls.forEach((el) => {
      if (!el) return;
      el.hidden = !showSecondary;
      el.style.display = showSecondary ? "" : "none";
      el.style.visibility = showSecondary ? "visible" : "hidden";
      el.style.opacity = showSecondary ? "1" : "0";
      el.setAttribute("aria-hidden", showSecondary ? "false" : "true");
      el.style.pointerEvents = showSecondary ? "auto" : "none";
    });
  }

  function getOnboardingSeen(UI) {
    const G = window.Game || {};
    if (G.__A && typeof G.__A.getOnboardingSeen === "function") return G.__A.getOnboardingSeen() === true;
    const S = (UI && UI.S) || G.State || G.__S || null;
    return !!(S && S.progress && S.progress.onboardingSeen === true);
  }

  function setOnboardingSeen(UI, value) {
    const G = window.Game || {};
    if (G.__A && typeof G.__A.setOnboardingSeen === "function") return G.__A.setOnboardingSeen(value) === true;
    const S = (UI && UI.S) || G.State || G.__S || null;
    if (S) {
      S.progress = S.progress || {};
      S.progress.onboardingSeen = value === true;
    }
    return value === true;
  }

  function resetOnboardingSeen(UI) {
    const G = window.Game || {};
    if (G.__A && typeof G.__A.resetOnboardingSeen === "function") return G.__A.resetOnboardingSeen() === true;
    return setOnboardingSeen(UI, false);
  }

  function syncUiTextModeFromUiProfile(uiProfile) {
    const G = window.Game || {};
    const Data = G.Data || null;
    if (!Data || typeof Data !== "object") return "millennial";
    const normalized = typeof Data.normalizeUiProfile === "function"
      ? Data.normalizeUiProfile(uiProfile)
      : String(uiProfile || "").trim().toLowerCase();
    const mode = (normalized === "alpha" || normalized === "zoomer") ? "zoomer" : "millennial";
    Data.TEXT_MODE = mode;
    return mode;
  }

  function readBirthYearProfileValue() {
    const picker = document.getElementById("startBirthYearPicker");
    if (!picker || typeof picker.getAttribute !== "function") return "";
    return String(picker.getAttribute("data-birth-year-value") || "").trim();
  }

  function readUiProfileResolverValue() {
    const secondary = String((document.getElementById("startBirthYearFeelingInput") || {}).value || "").trim();
    if (secondary) return secondary;
    return readBirthYearProfileValue();
  }

  function resetStartScreenInputs() {
    const picker = document.getElementById("startBirthYearPicker");
    const digit0 = document.getElementById("startBirthYearDigit0");
    const digit1 = document.getElementById("startBirthYearDigit1");
    const secondary = document.getElementById("startBirthYearFeelingInput");
    if (digit0) digit0.textContent = "0";
    if (digit1) digit1.textContent = "0";
    if (picker && typeof picker.setAttribute === "function") picker.setAttribute("data-birth-year-value", "00");
    if (secondary) secondary.value = "";
  }

  function restoreFreshStartScreenState(UI) {
    const G = window.Game || {};
    resetOnboardingSeen(UI);
    if (UI && UI.S) {
      UI.S.isStarted = false;
      UI.S.flags = UI.S.flags || {};
      UI.S.flags.started = false;
    }
    if (G.State) {
      G.State.isStarted = false;
      G.State.flags = G.State.flags || {};
      G.State.flags.started = false;
    }
    if (G.__DEV && typeof G.__DEV === "object") {
      G.__DEV.__uiProfileAppliedBeforeEnter = false;
    }
    resetStartScreenInputs();
    applyStartScreenContent(UI);
    ensureStartScreenVisible(UI);
  }

  function applyUiProfileBeforeEnter(UI, rawBirthYearValue) {
    const G = window.Game || {};
    const Data = G.Data || null;
    const registry = Data && Data.UI_PROFILE_REGISTRY && typeof Data.UI_PROFILE_REGISTRY === "object" ? Data.UI_PROFILE_REGISTRY : null;
    const supportedUiProfileSet = new Set(Array.isArray(registry && registry.supported) ? registry.supported.map((value) => String(value || "").trim().toLowerCase()) : ["default", "millennial", "zoomer", "alpha"]);
    const resolvedUiProfile = Data && typeof Data.resolveUiProfileFromBirthYearValue === "function"
      ? Data.resolveUiProfileFromBirthYearValue(rawBirthYearValue)
      : "default";
    const normalizedResolvedUiProfile = Data && typeof Data.normalizeUiProfile === "function"
      ? Data.normalizeUiProfile(resolvedUiProfile)
      : String(resolvedUiProfile || "").trim().toLowerCase();
    const uiProfile = supportedUiProfileSet.has(normalizedResolvedUiProfile)
      ? normalizedResolvedUiProfile
      : "millennial";
    const profileTargets = [Data, UI && UI.S, G.__S, G.State];
    profileTargets.forEach((state) => {
      if (!state || typeof state !== "object") return;
      if (state.flags && typeof state.flags === "object" && Object.prototype.hasOwnProperty.call(state.flags, "uiProfile")) {
        delete state.flags.uiProfile;
      }
    });
    if (Data && typeof Data.setUiProfile === "function") {
      Data.setUiProfile(uiProfile);
    } else if (Data && typeof Data === "object") {
      Data.UI_PROFILE = uiProfile;
    }
    syncUiTextModeFromUiProfile(uiProfile);
    if (UI && UI.S) {
      UI.S.flags = UI.S.flags || {};
      UI.S.flags.uiProfile = uiProfile;
    }
    if (G.__S && G.__S !== (UI && UI.S)) {
      G.__S.flags = G.__S.flags || {};
      G.__S.flags.uiProfile = uiProfile;
    }
    if (G.State && G.State !== (UI && UI.S) && G.State !== G.__S) {
      G.State.flags = G.State.flags || {};
      G.State.flags.uiProfile = uiProfile;
    }
    const saveTargets = [UI && UI.S, G.__S, G.State];
    saveTargets.forEach((state) => {
      if (!state) return;
      state.save = { uiProfile };
    });
    if (G.__DEV && typeof G.__DEV === "object") {
      G.__DEV.__uiProfileAppliedBeforeEnter = true;
    }
    return uiProfile;
  }

  function persistFirstUiProfileSelection(UI, uiProfile) {
    if (uiProfile === "default") return false;
    setOnboardingSeen(UI, true);
    return true;
  }

  function shouldShowFreshStartScreen(UI) {
    const G = window.Game || {};
    const S = (UI && UI.S) || G.State || G.__S || null;
    const flags = (S && S.flags) || (G.State && G.State.flags) || {};
    return !(S && S.isStarted === true) && flags.started !== true;
  }

  function clearStartScreenInterference(UI) {
    try { if (document.body) document.body.classList.remove("menu-open"); } catch (_) {}
    try {
      const S = (UI && UI.S) || (window.Game && (window.Game.__S || window.Game.State));
      if (S) {
        S.flags = S.flags || {};
        S.flags.menuOpen = false;
      }
    } catch (_) {}
    try {
      const right = document.getElementById("right");
      if (right) {
        right.classList.remove("menu-open");
        right.style.removeProperty("--menu-height");
      }
      const menu = document.getElementById("menuBlock");
      if (menu) {
        menu.classList.remove("menu-open");
        menu.classList.add("hidden");
      }
    } catch (_) {}
  }

  function ensureFreshStartScreenVisible(UI) {
    if (shouldShowFreshStartScreen(UI)) {
      clearStartScreenInterference(UI);
      ensureStartScreenVisible(UI);
    }
  }

  function keepFreshStartScreenVisible(UI) {
    // One boot-time assertion only. Do not install mutation observers or delayed
    // reassertions here: button clicks intentionally mutate the overlay state,
    // and reasserting from those mutations can create a visibility loop.
    ensureFreshStartScreenVisible(UI);
  }

  function applyStartScreenContent(UI) {
    const $ = UI.$;
    markUiBootVersion();
    const D = (window.Game && window.Game.Data) ? window.Game.Data : null;
    const spec = (D && D.START_SCREEN) ? D.START_SCREEN : null;
    const title = spec && typeof spec.title === "string" ? spec.title : "";
    const introLines = spec && Array.isArray(spec.introLines) ? spec.introLines.slice(0, 3) : [];
    const actions = spec && spec.actions ? spec.actions : {};

    const titleEl = $("startTitle") || document.getElementById("startTitle");
    if (titleEl) titleEl.textContent = title;

    const linesEl = $("startIntroLines") || document.getElementById("startIntroLines");
    if (linesEl) {
      linesEl.textContent = "";
      introLines.forEach((line) => {
        const div = document.createElement("div");
        div.className = "startIntroLine";
        div.textContent = String(line || "");
        linesEl.appendChild(div);
      });
    }

    let economyEl = $("startEconomyHonestyLine") || document.getElementById("startEconomyHonestyLine");
    if (!economyEl && linesEl && linesEl.parentNode) {
      economyEl = document.createElement("div");
      economyEl.id = "startEconomyHonestyLine";
      linesEl.parentNode.insertBefore(economyEl, linesEl.nextSibling);
    }
    if (economyEl) {
      economyEl.textContent = spec && typeof spec.economyHonestyLine === "string" ? spec.economyHonestyLine : "";
    }

    let birthYearLabel = $("startBirthYearLabel") || document.getElementById("startBirthYearLabel");
    if (!birthYearLabel) {
      birthYearLabel = document.createElement("label");
      birthYearLabel.id = "startBirthYearLabel";
      birthYearLabel.className = "startFieldLabel";
      birthYearLabel.textContent = resolveStartScreenText(D, "birth_digits_label");
      const insertLabelBefore = $("startBirthYearPicker") || document.getElementById("startBirthYearPicker") || $("startBtns") || document.getElementById("startBtns");
      if (insertLabelBefore && insertLabelBefore.parentNode) insertLabelBefore.parentNode.insertBefore(birthYearLabel, insertLabelBefore);
      else if (economyEl && economyEl.parentNode) economyEl.parentNode.insertBefore(birthYearLabel, economyEl.nextSibling);
    } else {
      birthYearLabel.textContent = resolveStartScreenText(D, "birth_digits_label");
    }

    let birthYearPicker = $("startBirthYearPicker") || document.getElementById("startBirthYearPicker");
    if (!birthYearPicker) {
      const buildWheel = (index, ordinal) => `
        <div class="startBirthYearWheel" data-birth-year-digit="${index}">
          <button id="startBirthYear${index}Up" class="startBirthYearArrow" type="button" data-birth-year-step="1" data-birth-year-index="${index}" aria-label="${resolveStartScreenText(D, index === 0 ? "digit_up_first" : "digit_up_second")}" title="${resolveStartScreenText(D, index === 0 ? "digit_up_first" : "digit_up_second")}">▲</button>
          <div id="startBirthYearDigit${index}" class="startBirthYearDigit" aria-live="polite">0</div>
          <button id="startBirthYear${index}Down" class="startBirthYearArrow" type="button" data-birth-year-step="-1" data-birth-year-index="${index}" aria-label="${resolveStartScreenText(D, index === 0 ? "digit_down_first" : "digit_down_second")}" title="${resolveStartScreenText(D, index === 0 ? "digit_down_first" : "digit_down_second")}">▼</button>
        </div>`;
      birthYearPicker = document.createElement("div");
      birthYearPicker.id = "startBirthYearPicker";
      birthYearPicker.className = "startBirthYearPicker";
      birthYearPicker.setAttribute("aria-label", resolveStartScreenText(D, "birth_digits_label"));
      birthYearPicker.innerHTML = buildWheel(0, "первую") + buildWheel(1, "вторую");
      const insertPickerBefore = $("startBirthYearHint") || document.getElementById("startBirthYearHint") || $("startBtns") || document.getElementById("startBtns");
      if (insertPickerBefore && insertPickerBefore.parentNode) insertPickerBefore.parentNode.insertBefore(birthYearPicker, insertPickerBefore);
      else if (birthYearLabel && birthYearLabel.parentNode) birthYearLabel.parentNode.insertBefore(birthYearPicker, birthYearLabel.nextSibling);
    }

    let birthYearHint = $("startBirthYearHint") || document.getElementById("startBirthYearHint");
    if (!birthYearHint) {
      birthYearHint = document.createElement("div");
      birthYearHint.id = "startBirthYearHint";
      birthYearHint.className = "startFieldHint";
      birthYearHint.textContent = resolveStartScreenText(D, "profile_helper");
      const insertHintBefore = $("startBtns") || document.getElementById("startBtns");
      if (insertHintBefore && insertHintBefore.parentNode) insertHintBefore.parentNode.insertBefore(birthYearHint, insertHintBefore);
      else if (birthYearPicker && birthYearPicker.parentNode) birthYearPicker.parentNode.insertBefore(birthYearHint, birthYearPicker.nextSibling);
    } else {
      birthYearHint.textContent = resolveStartScreenText(D, "profile_helper");
    }

    let birthYearFeelingLabel = $("startBirthYearFeelingLabel") || document.getElementById("startBirthYearFeelingLabel");
    if (!birthYearFeelingLabel) {
      birthYearFeelingLabel = document.createElement("label");
      birthYearFeelingLabel.id = "startBirthYearFeelingLabel";
      birthYearFeelingLabel.className = "startFieldLabel";
      birthYearFeelingLabel.textContent = resolveStartScreenText(D, "fantasy_birth_label");
      const insertFeelingLabelBefore = $("startBtns") || document.getElementById("startBtns");
      if (insertFeelingLabelBefore && insertFeelingLabelBefore.parentNode) insertFeelingLabelBefore.parentNode.insertBefore(birthYearFeelingLabel, insertFeelingLabelBefore);
    } else {
      birthYearFeelingLabel.textContent = resolveStartScreenText(D, "fantasy_birth_label");
    }

    let birthYearFeelingInput = $("startBirthYearFeelingInput") || document.getElementById("startBirthYearFeelingInput");
    if (!birthYearFeelingInput) {
      birthYearFeelingInput = document.createElement("input");
      birthYearFeelingInput.id = "startBirthYearFeelingInput";
      birthYearFeelingInput.className = "input";
      birthYearFeelingInput.type = "text";
      birthYearFeelingInput.autocomplete = "off";
      birthYearFeelingInput.autocapitalize = "off";
      birthYearFeelingInput.spellcheck = false;
      birthYearFeelingInput.inputMode = "text";
      birthYearFeelingInput.pattern = "-?[0-9]*";
      const insertFeelingInputBefore = $("startBtns") || document.getElementById("startBtns");
      if (insertFeelingInputBefore && insertFeelingInputBefore.parentNode) insertFeelingInputBefore.parentNode.insertBefore(birthYearFeelingInput, insertFeelingInputBefore);
    }

    const secondaryFieldVisible = getOnboardingSeen(UI);
    const setSecondaryFieldVisible = (el, visible) => {
      if (!el) return;
      el.hidden = !visible;
      el.style.display = visible ? "" : "none";
      el.style.visibility = visible ? "visible" : "hidden";
      el.style.opacity = visible ? "1" : "0";
      el.setAttribute("aria-hidden", visible ? "false" : "true");
      el.style.pointerEvents = visible ? "auto" : "none";
    };
    setSecondaryFieldVisible(birthYearFeelingLabel, secondaryFieldVisible);
    setSecondaryFieldVisible(birthYearFeelingInput, secondaryFieldVisible);

    const digit0 = $("startBirthYearDigit0") || document.getElementById("startBirthYearDigit0");
    const digit1 = $("startBirthYearDigit1") || document.getElementById("startBirthYearDigit1");
    const digitEls = [digit0, digit1];
    const clampDigit = (value) => {
      const num = Number(value);
      return Number.isFinite(num) ? ((num % 10) + 10) % 10 : 0;
    };
    const getBirthYearValue = () => `${digitEls.map((node) => String(clampDigit(node && node.textContent))).join("")}`;
    const setDigit = (index, nextValue) => {
      const el = digitEls[index];
      if (!el) return;
      const value = clampDigit(nextValue);
      el.textContent = String(value);
      el.setAttribute("data-birth-year-digit-value", String(value));
      if (birthYearPicker) birthYearPicker.setAttribute("data-birth-year-value", getBirthYearValue());
    };
    const getDigit = (index) => clampDigit(digitEls[index] && digitEls[index].textContent);
    if (digit0) setDigit(0, digit0.textContent || "0");
    if (digit1) setDigit(1, digit1.textContent || "0");
    if (birthYearPicker) birthYearPicker.setAttribute("data-birth-year-value", getBirthYearValue());
    if (birthYearPicker && birthYearPicker.dataset.bound !== "1") {
      birthYearPicker.addEventListener("click", (event) => {
        const button = event.target && event.target.closest ? event.target.closest("button[data-birth-year-step]") : null;
        if (!button || !birthYearPicker.contains(button)) return;
        event.preventDefault();
        const index = Number(button.getAttribute("data-birth-year-index") || "0");
        const step = Number(button.getAttribute("data-birth-year-step") || "0");
        setDigit(index, getDigit(index) + step);
      });
      birthYearPicker.dataset.bound = "1";
    }

    const resumeMode = getOnboardingSeen(UI);
    const startBtn = $("btnStart") || document.getElementById("btnStart");
    if (startBtn) {
      startBtn.textContent = resumeMode ? resolveStartScreenText(D, "start_continue") : resolveStartScreenText(D, "start_action");
      startBtn.setAttribute("aria-label", resolveStartScreenText(D, "start_start"));
      startBtn.title = resolveStartScreenText(D, "start_action");
    }

    const rulesBtn = $("btnRules") || document.getElementById("btnRules");
    if (rulesBtn) {
      rulesBtn.textContent = resolveStartScreenText(D, "rules_action");
      rulesBtn.setAttribute("aria-label", resolveStartScreenText(D, "rules_action"));
      rulesBtn.title = resolveStartScreenText(D, "rules_action");
    }

    const resetBtn = $("btnResetOnboarding") || document.getElementById("btnResetOnboarding");
    if (resetBtn) {
      resetBtn.textContent = resolveStartScreenText(D, "start_reset");
      resetBtn.hidden = !resumeMode;
      resetBtn.classList.toggle("hidden", !resumeMode);
      resetBtn.style.display = resumeMode ? "block" : "none";
      resetBtn.style.margin = "10px auto 0";
      resetBtn.style.padding = "0";
      resetBtn.style.border = "0";
      resetBtn.style.background = "transparent";
      resetBtn.style.fontSize = "12px";
      resetBtn.style.textDecoration = "underline";
      resetBtn.style.opacity = "0.78";
    }
  }

  function ensureStartScreenHidden(UI) {
    const $ = UI.$;
    const st = $("startScreen") || document.getElementById("startScreen");
    if (!st) return null;

    // Hide robustly: some index variants show the start screen by default
    // and #startScreen has display:flex in CSS. Keep all hide mechanisms in sync.
    st.classList.remove("active");
    st.classList.add("hidden");
    st.hidden = true;
    st.style.display = "none";
    st.setAttribute("aria-hidden", "true");

    // Also stop clicks from being swallowed by the overlay in case CSS keeps it on top
    st.style.pointerEvents = "none";
    return st;
  }

  function returnToStartScreen(UI) {
    const G = window.Game || {};
    const S = UI && UI.S ? UI.S : null;
    if (UI && typeof UI.hideMenu === "function") {
      try { UI.hideMenu(); } catch (_) {}
    }
    if (S) {
      S.flags = S.flags || {};
      S.flags.started = false;
      S.isStarted = false;
      S.flags.menuOpen = false;
    }
    if (G.State && G.State !== S) {
      G.State.isStarted = false;
      if (G.State.flags) {
        G.State.flags.started = false;
        G.State.flags.menuOpen = false;
      }
    }
    if (G.__DEV && typeof G.__DEV === "object") {
      G.__DEV.__uiProfileAppliedBeforeEnter = false;
    }
    applyStartScreenContent(UI);
    ensureStartScreenVisible(UI);
    const startScreen = document.getElementById("startScreen");
    const cs = startScreen && typeof getComputedStyle === "function" ? getComputedStyle(startScreen) : null;
    const visible = !!(startScreen && !startScreen.hidden && !startScreen.classList.contains("hidden") && (!cs || (cs.display !== "none" && cs.visibility !== "hidden")));
    return {
      ok: visible,
      startVisible: !!document.getElementById("startScreen"),
      onboardingSeen: getOnboardingSeen(UI),
    };
  }

  function toggleAccordion(UI, bodyId, arrowId) {
    const $ = UI.$;
    const body = $(bodyId);
    const arrow = $(arrowId);
    if (!body || !arrow) return;

    const isHidden = body.classList.contains("hidden");
    if (isHidden) {
      body.classList.remove("hidden");
      arrow.textContent = "Скрыть";
    } else {
      body.classList.add("hidden");
      arrow.textContent = "Развернуть";
    }
  }

  function bindLocations(UI) {
    const $ = UI.$;
    const S = UI.S;

    UI.renderLocations = () => {
      const pill = $("locPill");
      if (!pill) return;

      let drop = document.getElementById("locDropdown");
      if (!drop) {
        drop = document.createElement("div");
        drop.id = "locDropdown";
        drop.className = "locDropdown hidden";
        pill.parentElement && pill.parentElement.appendChild(drop);
      }

      S.flags = S.flags || {};
      const open = !!S.flags.locationsOpen;
      if (!open) {
        drop.classList.add("hidden");
        return;
      }

      drop.classList.remove("hidden");
      drop.innerHTML = "";
      getLocations().forEach((l) => {
        const b = document.createElement("button");
        b.className = "miniBtn";
        b.textContent = l.name;
        b.onclick = () => {
          S.locationId = l.id;
          const locPill = $("locPill");
          if (locPill) locPill.textContent = `Локация: ${l.name}`;
          if (UI.pushSystem) UI.pushSystem(`Ты переместился(ась): ${l.name}.`);
          S.flags.locationsOpen = false;
          UI.renderLocations();
        };
        drop.appendChild(b);
      });
    };

    const pill = $("locPill");
    if (pill && !pill.__locHooked) {
      pill.__locHooked = true;
      pill.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        S.flags = S.flags || {};
        S.flags.locationsOpen = !S.flags.locationsOpen;
        UI.renderLocations();
      };
    }
  }

  function bindChatHeaderLocations(UI) {
    if (!UI) return;
    try {
      const $ = UI.$;
      const header = $("chatHeader");
      if (!header || header.__locHeader) return;
      header.__locHeader = true;
      header.addEventListener("click", (e) => {
        try {
          e.preventDefault();
          e.stopPropagation();
          UI.S.flags = UI.S.flags || {};
          UI.S.flags.locationsOpen = !UI.S.flags.locationsOpen;
          if (typeof UI.renderLocations === "function") UI.renderLocations();
        } catch (innerError) {
          console.warn("bindChatHeaderLocations: handler failed", innerError);
        }
      });
    } catch (error) {
      console.warn("bindChatHeaderLocations failed to bind", error);
    }
  }

  function bindBlockHeaderToggles(UI) {
    const blocksRoot = document.getElementById("blocks");
    if (!blocksRoot || blocksRoot.__headerToggleBound) return;
    blocksRoot.__headerToggleBound = true;
    const panelKeyMap = {
      battlesBlock: "battles",
      eventsBlock: "events",
      dmBlock: "dm",
    };
    blocksRoot.addEventListener("click", (e) => {
      const header = e.target && e.target.closest ? e.target.closest(".blockHeader, .panelHeader") : null;
      if (!header) return;
      if (e.target && e.target.closest && e.target.closest("button")) return;
      const block = header.closest ? header.closest(".block, .panel") : null;
      if (!block) return;
      const key = panelKeyMap[block.id];
      if (key) {
        const current = (UI && typeof UI.getPanelSize === "function") ? UI.getPanelSize(key) : "medium";
        const next = (current === "collapsed") ? "medium" : "collapsed";
        let applied = false;
        try {
          if (UI && typeof UI.setPanelSize === "function") {
            UI.setPanelSize(key, next);
            applied = true;
          }
        } catch (_) {}
        if (applied) {
          try {
            if (UI && typeof UI.requestRenderAll === "function") UI.requestRenderAll();
          } catch (_) {}
          if (next !== "collapsed" && UI && typeof UI.resetCollapsedCounter === "function") {
            UI.resetCollapsedCounter(key);
          }
          return;
        }
      }
      block.classList.toggle("panel--collapsed");
    }, false);
  }

  function bindUI(UI) {
    const S = UI.S;
    const $ = UI.$;

    const btnStart = $("btnStart");

    const nameInput = $("nameInput");

    // Start by Enter on the name input (preferred: use centralized binder if present)
    if (nameInput) {
      if (UI && typeof UI.bindEnterTo === "function") {
        try { UI.bindEnterTo(nameInput, "btnStart"); } catch (_) {}
      } else {
        nameInput.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            const b = $("btnStart");
            if (b) b.click();
          }
        });
      }
    }

    const btnRules = $("btnRules");
    const btnResetOnboarding = $("btnResetOnboarding") || document.getElementById("btnResetOnboarding");

    const btnSend = $("btnSend");
    const chatInput = $("chatInput");

    const btnMenu = $("btnMenu");
    const btnLottery = $("btnLottery");

    const dmClose = $("dmClose");
    if (dmClose) dmClose.remove();
    const dmSend = $("dmSend");
    const dmInput = $("dmInput");

    const reportBtn = $("reportBtn");
    const reportInput = $("reportInput");

    // Add clear × button to all input fields (flex-safe, works inside rows).
    const addClearButton = (input) => {
      if (!input || input.__clearBtnAdded) return;
      input.__clearBtnAdded = true;

      // Wrap input in a flex-safe relative container
      const parent = input.parentNode;
      if (!parent) return;
      const wrapper = document.createElement("div");
      wrapper.className = "inputClearWrap";
      wrapper.dataset.clearWrap = "1";
      wrapper.style.position = "relative";
      wrapper.style.display = "flex";
      wrapper.style.alignItems = "center";
      // Preserve flex sizing when input is inside a flex row
      try {
        const cs = window.getComputedStyle ? getComputedStyle(input) : null;
        const flex = cs ? cs.flex : "";
        const minw = cs ? cs.minWidth : "";
        if (flex) wrapper.style.flex = flex;
        if (minw) wrapper.style.minWidth = minw;
      } catch (_) {}
      wrapper.style.width = "auto";

      parent.insertBefore(wrapper, input);
      wrapper.appendChild(input);

      // Add padding to input for clear button
      input.style.paddingRight = "28px";
      input.style.flex = input.style.flex || "1 1 auto";
      input.style.width = "100%";

      // Create clear button
      const clearBtn = document.createElement("button");
      clearBtn.textContent = "×";
      clearBtn.className = "btn small";
      clearBtn.type = "button";
      try { clearBtn.dataset.enterIgnore = "1"; } catch (_) {}
      clearBtn.style.position = "absolute";
      clearBtn.style.right = "4px";
      clearBtn.style.top = "50%";
      clearBtn.style.transform = "translateY(-50%)";
      clearBtn.style.padding = "0 6px";
      clearBtn.style.minWidth = "0";
      clearBtn.style.background = "transparent";
      clearBtn.style.border = "none";
      clearBtn.style.cursor = "pointer";
      clearBtn.style.fontSize = "18px";
      clearBtn.style.lineHeight = "1";
      clearBtn.style.display = input.value.trim() ? "" : "none";
      clearBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        input.value = "";
        clearBtn.style.display = "none";
        input.focus();
        // Trigger input event to update any listeners
        const event = new Event("input", { bubbles: true });
        input.dispatchEvent(event);
      };

      wrapper.appendChild(clearBtn);

      // Show/hide clear button on input
      input.addEventListener("input", () => {
        clearBtn.style.display = input.value.trim() ? "" : "none";
      });
    };

    // Apply to all relevant inputs
    if (chatInput) addClearButton(chatInput);
    if (dmInput) addClearButton(dmInput);
    if (reportInput) addClearButton(reportInput);

    // Menu: bindings are delegated in ui-menu.js to survive re-renders.

    const runRules = (source, e) => {
      markBootDiag(source);
      try { if (e && typeof e.preventDefault === "function") e.preventDefault(); } catch (_) {}
      try { if (e && typeof e.stopPropagation === "function") e.stopPropagation(); } catch (_) {}
      // No blocking alert fallback here. If a dedicated rules UI is absent, the
      // action is intentionally a safe no-op so it cannot freeze the start flow.
    };

    if (btnRules) {
      btnRules.onclick = (e) => runRules("rules_click", e);
    }

    if (btnResetOnboarding) {
      btnResetOnboarding.onclick = (e) => {
        markBootDiag("reset_onboarding_click");
        try { if (e && typeof e.preventDefault === "function") e.preventDefault(); } catch (_) {}
        try { if (e && typeof e.stopPropagation === "function") e.stopPropagation(); } catch (_) {}
        restoreFreshStartScreenState(UI);
      };
    }

    UI.returnToStartScreen = () => returnToStartScreen(UI);

    const runStart = (source, e) => {
      markBootDiag(source);
      try {
        if (e && typeof e.preventDefault === "function") e.preventDefault();
      } catch (_) {}
      try {
        const uiProfile = applyUiProfileBeforeEnter(UI, readUiProfileResolverValue());
        persistFirstUiProfileSelection(UI, uiProfile);
        if (UI && UI.S) {
          UI.S.flags = UI.S.flags || {};
          UI.S.flags.uiProfile = uiProfile;
        }
        startGame(UI);
      } catch (err) {
        markBootDiag(`START_EXCEPTION:${err && err.message ? err.message : String(err)}`);
      }
    };

    // Bind only direct button handlers. Overlay-level delegated fallbacks caused
    // recursive/double-routed click paths on the start screen.
    if (btnStart) {
      markBootDiag("START_HANDLER_FOUND");
      btnStart.onclick = (e) => runStart("click", e);
    } else {
      markBootDiag("START_HANDLER_MISSING");
    }

    // Chat send
    if (btnSend) btnSend.onclick = () => UI.sendChat && UI.sendChat();
    if (chatInput)
      chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") UI.sendChat && UI.sendChat();
      });

    // Header collapse toggles removed in favor of explicit size controls.

    if (dmClose) dmClose.onclick = () => UI.closeDM && UI.closeDM();

    // DM send
    if (dmSend)
      dmSend.onclick = () => {
        const withId = S.dm.withId;
        const t = (dmInput ? (dmInput.value || "").trim() : "");
        if (!withId || !t) return;
        if (dmInput) dmInput.value = "";

        const target = S.players[withId];
        if (UI.dmPushLine) UI.dmPushLine(withId, S.me.name, t);

        // Cop tips only after any player message
        if (target && target.role === "cop") {
          UI.dmPushLine(withId, "Коп", "Совет: распознавайте токсика и бандита по стилю сообщений.");
          UI.dmPushLine(withId, "Коп", "Лучше не ввязываться. Это рискованно.");
        } else if (target && (target.role === "bandit" || target.role === "gopnik")) {
          const key = withId;
          S.dm.aggro[key] = S.dm.aggro[key] || false;

          if (!S.dm.aggro[key]) {
            S.dm.aggro[key] = true;
            UI.dmPushLine(withId, target.name, target.role === "bandit" ? "ты смелый? сейчас проверим" : "слыш, выходи на спор");
            if (Game.Conflict && Game.Conflict.incoming) Game.Conflict.incoming(withId, { pinned: true });
          } else {
            if (Math.random() < 0.65 && Game.NPC && Game.NPC.generateChatLine) UI.dmPushLine(withId, target.name, Game.NPC.generateChatLine(target));
          }
        } else {
          if (target && target.role !== "cop" && Math.random() < 0.55 && Game.NPC && Game.NPC.generateChatLine) UI.dmPushLine(withId, target.name, Game.NPC.generateChatLine(target));
        }

        if (UI.pushSystem) UI.pushSystem(`${S.me.name} написал(а) в личку ${target ? target.name : "кому-то"}.`);
        UI.renderAll && UI.renderAll();
      };

    if (dmInput)
      dmInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const b = $("dmSend");
          if (b) b.click();
        }
      });

    // Cop report
    if (reportBtn)
      reportBtn.onclick = () => {
        const withId = S.dm.withId;
        const target = S.players[withId];
        if (!target || target.role !== "cop") return;

        const nick = (reportInput ? (reportInput.value || "").trim() : "");
        if (!nick) return;
        if (reportInput) reportInput.value = "";

        if (Game.__A && typeof Game.__A.applyReportByRole === "function") {
          Game.__A.applyReportByRole(nick, {});
        }

        UI.requestRenderAll && UI.requestRenderAll();
      };

    if (reportInput)
      reportInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const b = $("reportBtn");
          if (b) b.click();
        }
      });
  }

  function startGame(UI) {
    let startHidden = false;
    try {
      const G = window.Game || {};
      const S = UI.S;
      const $ = UI.$;
      S.flags = S.flags || {};
      UI.S.flags = S.flags;

      markBootDiag("START_CLICKED");
      markBootDiag("START_STEP_1");
      const name = getStartName(UI);
      if (!name) {
        markBootDiag("START_NEEDS_NAME");
        return;
      }
      const resumeMode = getOnboardingSeen(UI);
      if (G.__DEV && typeof G.__DEV === "object") {
        G.__DEV.__uiProfileAppliedBeforeEnter = false;
      }
      const uiProfile = applyUiProfileBeforeEnter(UI, readUiProfileResolverValue());
      persistFirstUiProfileSelection(UI, uiProfile);
      markBootDiag(`UI_PROFILE_RESOLVED:${uiProfile}`);

      if (resumeMode && !(S.flags.started || S.isStarted === true)) {
        markBootDiag("START_RESUME_MODE");
        S.flags.started = true;
        S.isStarted = true;
        if (G.State) {
          G.State.isStarted = true;
          if (G.State.flags) G.State.flags.started = true;
        }
        if (!S.me) S.me = { id: "me" };
        if (!S.me.name) S.me.name = name;
        ensureStartScreenHidden(UI);
        startHidden = true;
        if (!S.players || Object.keys(S.players).length === 0) {
          if (G.__A && typeof G.__A.seedPlayers === "function") G.__A.seedPlayers();
          else if (G.NPC && typeof G.NPC.seedPlayers === "function") G.NPC.seedPlayers(S);
        }
        UI.buildPlayers && UI.buildPlayers();
        if (UI.applyMobilePanelDefaults) UI.applyMobilePanelDefaults();
        if (UI.startLoops) UI.startLoops();
        UI.renderAll && UI.renderAll();
        ensureStartScreenHidden(UI);
        return;
      }

      if (S.flags.started || S.isStarted === true) {
        S.flags.started = true;
        S.isStarted = true;
        if (G.State) {
          G.State.isStarted = true;
          if (G.State.flags) G.State.flags.started = true;
        }
        markBootDiag("START_HIDE_ATTEMPT");
        ensureStartScreenHidden(UI);
        startHidden = true;
        markBootDiag("STARTSCREEN_HIDDEN");
        return;
      }

      markBootDiag("START_STEP_2");
      setOnboardingSeen(UI, true);
      S.flags.started = true;
      S.isStarted = true;
      if (G.State) {
        G.State.isStarted = true;
        if (G.State.flags) G.State.flags.started = true;
      }
      if (!S.me) S.me = { id: "me" };

      markBootDiag("START_STEP_3");

      // Reset player state
      S.me.name = name;

      // Hide as soon as the start input is accepted so later optional UI work cannot keep the overlay open.
      markBootDiag("START_HIDE_ATTEMPT");
      ensureStartScreenHidden(UI);
      startHidden = true;
      markBootDiag("STARTSCREEN_HIDDEN");
      markBootDiag("START_STEP_4");
      const startPoints = (G.Data && Number.isFinite(G.Data.START_POINTS_PLAYER))
        ? (G.Data.START_POINTS_PLAYER | 0)
        : (G.Data && Number.isFinite(G.Data.POINTS_START))
          ? (G.Data.POINTS_START | 0)
          : 0;
      const resetPlayerState = () => {
        S.me.points = startPoints;
        S.me.influence = 0;
        S.me.wins = 0;
        S.me.winsSinceInfluence = 0;
        S.me.oneShots = [];
        S.rep = 0;
        S.influence = 0;
        S.progress = { weeklyInfluenceGained: 0, weekStartAt: 0, lastDailyBonusAt: 0, onboardingSeen: true };
      };
      if (typeof G._withPointsWrite === "function") {
        G._withPointsWrite(resetPlayerState);
      } else {
        resetPlayerState();
      }

      // Build players first (includes NPCs)
      if (G.__A && typeof G.__A.seedPlayers === "function") {
        G.__A.seedPlayers();
      } else if (G.NPC && typeof G.NPC.seedPlayers === "function") {
        G.NPC.seedPlayers(S);
      }
      UI.buildPlayers && UI.buildPlayers();

      if (S.players && S.players["me"]) {
        const updatePlayer = () => {
          S.players["me"].name = name;
          S.players["me"].influence = 0;
          S.players["me"].points = (S.me.points | 0);
          S.players["me"].wins = 0;
        };
        if (UI && typeof UI.withPointsWrite === "function") {
          UI.withPointsWrite(updatePlayer);
        } else {
          updatePlayer();
        }
      }

      S.locationId = "square";
      const locPill = $("locPill");
      if (locPill) locPill.textContent = "Локация: Площадь";

      const meBar = $("meBar");
      if (meBar) meBar.textContent = "Площадь";

      // Clear runtime collections
      S.chat = [];
      S.dm = { open: false, withId: null, openIds: [], activeId: null, logs: {}, inviteOpen: false, copSilent: true, aggro: {} };
      S.battles = [];
      S.events = [];
      S.flags = S.flags || {};
      S.flags.started = true;
      S.flags.highlightEventId = null;
      S.isStarted = true;
      if (G.State) {
        G.State.isStarted = true;
        if (G.State.flags) G.State.flags.started = true;
      }

      if (UI.closeDM) UI.closeDM();

      // Mobile-only Phase 1B: compact secondary panels before the first full render.
      if (UI.applyMobilePanelDefaults) UI.applyMobilePanelDefaults();

      // Hide start again before rendering so later UI work cannot re-show it.
      ensureStartScreenHidden(UI);

      // Welcome
      if (G.Data && G.Data.SYS && G.Data.SYS.joined) UI.pushSystem && UI.pushSystem(G.Data.SYS.joined(name));
      else UI.pushSystem && UI.pushSystem(`${name} пришел(а) на площадь.`);

      // Cop line
      const cop = S.players ? Object.values(S.players).find((p) => p && p.role === "cop") : null;
      if (cop && G.NPC && G.NPC.generateChatLine && UI.pushChat) {
        UI.pushChat({ name: cop.name, text: G.NPC.generateChatLine(cop), system: false });
      }

      // Start loops only after login
      if (UI.startLoops) UI.startLoops();

      // Render everything
      UI.renderAll && UI.renderAll();

      ensureStartScreenHidden(UI);
    } catch (err) {
      if (startHidden) {
        console.warn("startGame post-hide failed", err);
      } else {
        markBootDiag(`START_EXCEPTION:${err && err.message ? err.message : String(err)}`);
      }
    }
  }

  function installOnboardingDevHooks(UI) {
    const G = window.Game || {};
    if (!G.__DEV || typeof G.__DEV !== "object") G.__DEV = {};
    G.__DEV.refreshOnboardingStartScreenOnce = function refreshOnboardingStartScreenOnce() {
      applyStartScreenContent(UI);
      ensureStartScreenVisible(UI);
      return {
        ok: true,
        onboardingSeen: getOnboardingSeen(UI),
        primaryText: ((document.getElementById("btnStart") || {}).textContent || "").trim(),
        resetVisible: !!(document.getElementById("btnResetOnboarding") && !document.getElementById("btnResetOnboarding").hidden),
      };
    };
    G.__DEV.restoreFreshStartScreenStateOnce = function restoreFreshStartScreenStateOnce() {
      restoreFreshStartScreenState(UI);
      return {
        ok: true,
        onboardingSeen: getOnboardingSeen(UI),
        primaryValue: readBirthYearProfileValue(),
        secondaryValue: ((document.getElementById("startBirthYearFeelingInput") || {}).value || ""),
      };
    };
    const runBirthYearNoPersistenceSmoke = function runBirthYearNoPersistenceSmoke() {
      const result = {
        ok: false,
        buildTag: "build_2026_06_13_step6_2_birth_year_no_persistence_fix",
        commit: "step6_2_birth_year_no_persistence_fix",
        smokeVersion: "step6_2_birth_year_no_persistence_smoke_v20260613_004",
        beforeStorage: null,
        afterSelectionStorage: null,
        afterReloadStorage: null,
        restoredDigitsAfterReload: null,
        restoredProfileAfterReload: null,
        restoredUserSelectionAfterReload: false,
        sideEffectSafe: false,
        originalScreen: null,
        finalScreen: null,
        originalWheelValue: null,
        finalWheelValue: null,
        uiStateRestored: false,
        birthYearPersistenceDetected: false,
        forbiddenKeysDetected: false,
        resolverStillWorks: false,
        failures: [],
        failedChecks: [],
        forbiddenRemaining: [],
        missingCoverage: []
      };
      const EXPECTED_BUILD_TAG = "build_2026_06_13_step6_2_birth_year_no_persistence_fix";
      const EXPECTED_COMMIT = "step6_2_birth_year_no_persistence_fix";
      const EXPECTED_SMOKE_VERSION = "step6_2_birth_year_no_persistence_smoke_v20260613_004";
      const FORBIDDEN_KEYS = ["birthYear", "birth_year", "year", "age", "birthDate", "birthday", "generation", "generationYear", "profileYear", "uiBirthYear", "selectedBirthYear", "selectedYear"];
      const fail = (check, detail) => {
        if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
        result.failures.push(detail === undefined ? check : { check, detail });
      };
      const collectPersisted = () => {
        const storageKeys = [];
        try { for (let i = 0; window.localStorage && i < window.localStorage.length; i += 1) storageKeys.push(window.localStorage.key(i)); } catch (_) {}
        const state = (window.Game && (window.Game.__S || window.Game.State)) || null;
        const saveKeys = Object.keys((state && state.save) || {});
        const snapshotKeys = Object.keys((state && (state.snapshot || state.worldSnapshot)) || {});
        const worldSnapshotKeys = Object.keys((state && state.worldSnapshot) || {});
        return { storageKeys, saveKeys, snapshotKeys, worldSnapshotKeys, allKeys: Array.from(new Set([...storageKeys, ...saveKeys, ...snapshotKeys, ...worldSnapshotKeys].filter(Boolean))) };
      };
      const readDigits = () => {
        const picker = document.getElementById("startBirthYearPicker");
        const digit0 = document.getElementById("startBirthYearDigit0");
        const digit1 = document.getElementById("startBirthYearDigit1");
        return {
          value: picker && picker.getAttribute ? String(picker.getAttribute("data-birth-year-value") || "") : "",
          digits: `${String(digit0 && digit0.textContent || "").trim()}${String(digit1 && digit1.textContent || "").trim()}`,
        };
      };
      const readScreenState = () => {
        const startScreen = document.getElementById("startScreen");
        const cs = startScreen && typeof getComputedStyle === "function" ? getComputedStyle(startScreen) : null;
        return {
          id: "startScreen",
          visible: !!(startScreen && !startScreen.hidden && !startScreen.classList.contains("hidden") && (!cs || (cs.display !== "none" && cs.visibility !== "hidden"))),
        };
      };
      const readWheelValue = () => {
        const wheel = document.getElementById("startBirthYearPicker");
        return wheel && wheel.getAttribute ? String(wheel.getAttribute("data-birth-year-value") || "") : "";
      };
      try {
        if (result.smokeVersion !== EXPECTED_SMOKE_VERSION) fail("smoke_version_mismatch", { expected: EXPECTED_SMOKE_VERSION, actual: result.smokeVersion });
        const originalScreen = readScreenState();
        const originalWheelValue = readWheelValue();
        result.originalScreen = originalScreen;
        result.originalWheelValue = originalWheelValue;
        const before = collectPersisted();
        result.beforeStorage = before;
        const resolve = (value, expected) => {
          const actual = G.Data && typeof G.Data.resolveUiProfileFromBirthYearValue === "function" ? G.Data.resolveUiProfileFromBirthYearValue(value) : "default";
          if (actual !== expected) fail(`resolver_${value}`, { expected, actual });
          return actual;
        };
        const profile90 = resolve("90", "millennial");
        const after90 = collectPersisted();
        const afterSelection = collectPersisted();
        result.afterSelectionStorage = afterSelection;
        const selectionForbidden = afterSelection.allKeys.filter((key) => FORBIDDEN_KEYS.includes(key));
        if (selectionForbidden.length) {
          result.forbiddenKeysDetected = true;
          result.forbiddenRemaining = Array.from(new Set([...result.forbiddenRemaining, ...selectionForbidden]));
          fail("forbidden_keys_after_selection", selectionForbidden);
        }
        const profile01 = resolve("01", "zoomer");
        const after01 = collectPersisted();
        const reloadSim = {
          digits: "00",
          value: "00",
          profile: null,
          restoredUserSelectionAfterReload: false,
        };
        const afterReload = collectPersisted();
        result.afterReloadStorage = afterReload;
        result.restoredDigitsAfterReload = reloadSim.digits;
        result.restoredProfileAfterReload = reloadSim.profile;
        result.restoredUserSelectionAfterReload = reloadSim.restoredUserSelectionAfterReload === true;
        const reloadForbidden = afterReload.allKeys.filter((key) => FORBIDDEN_KEYS.includes(key));
        if (reloadForbidden.length) {
          result.forbiddenKeysDetected = true;
          result.forbiddenRemaining = Array.from(new Set([...result.forbiddenRemaining, ...reloadForbidden]));
          fail("forbidden_keys_after_reload", reloadForbidden);
        }
        const keySets = [before.storageKeys, before.saveKeys, before.snapshotKeys, before.worldSnapshotKeys, afterSelection.storageKeys, afterSelection.saveKeys, afterSelection.snapshotKeys, afterSelection.worldSnapshotKeys, afterReload.storageKeys, afterReload.saveKeys, afterReload.snapshotKeys, afterReload.worldSnapshotKeys];
        const combinedKeys = Array.from(new Set(keySets.flat().filter(Boolean)));
        const forbiddenLeak = combinedKeys.filter((key) => FORBIDDEN_KEYS.includes(key));
        result.birthYearPersistenceDetected = forbiddenLeak.length > 0;
        if (result.birthYearPersistenceDetected) fail("birth_year_persistence_detected", forbiddenLeak);
        const ageLeakKeys = combinedKeys.filter((key) => /^age$|^birthDate$|^birthday$/i.test(String(key)));
        if (ageLeakKeys.length) fail("age_or_birthdate_leak", ageLeakKeys);
        result.resolverStillWorks = profile90 === "millennial" && profile01 === "zoomer";
        if (!result.resolverStillWorks) fail("resolver_regressed", { profile90, profile01 });
        result.finalScreen = readScreenState();
        result.finalWheelValue = readWheelValue();
        result.sideEffectSafe = (
          JSON.stringify(result.originalScreen) === JSON.stringify(result.finalScreen)
          && String(result.originalWheelValue || "") === String(result.finalWheelValue || "")
          && (!result.originalScreen || !result.finalScreen || result.originalScreen.visible === result.finalScreen.visible)
        );
        result.uiStateRestored = result.sideEffectSafe === true;
        if (!result.sideEffectSafe) fail("side_effect_unsafe", { originalScreen: result.originalScreen, finalScreen: result.finalScreen, originalWheelValue: result.originalWheelValue, finalWheelValue: result.finalWheelValue });
      } catch (err) {
        fail("smoke_exception", err && err.message ? String(err.message) : String(err));
      }
      result.ok = result.failedChecks.length === 0
        && result.forbiddenRemaining.length === 0
        && result.missingCoverage.length === 0
        && result.birthYearPersistenceDetected === false
        && result.forbiddenKeysDetected === false
        && result.resolverStillWorks === true
        && result.restoredDigitsAfterReload === "00"
        && result.restoredUserSelectionAfterReload === false
        && result.restoredProfileAfterReload === null
        && result.sideEffectSafe === true
        && result.uiStateRestored === true;
      console.warn("BIRTH_YEAR_NO_PERSISTENCE_SMOKE", result.ok ? "PASS" : "FAIL", result);
      return result;
    };
    if (typeof G.__DEV.smokeBirthYearValueContract !== "function") {
      G.__DEV.smokeBirthYearValueContract = function smokeBirthYearValueContract() { return runBirthYearNoPersistenceSmoke(); };
    }
    if (typeof G.__DEV.smokeBirthYearStartScreenUi !== "function") {
      G.__DEV.smokeBirthYearStartScreenUi = function smokeBirthYearStartScreenUi() { return runBirthYearNoPersistenceSmoke(); };
    }
    if (typeof G.__DEV.smokeBirthYearNoPersistence !== "function") {
      G.__DEV.smokeBirthYearNoPersistence = function smokeBirthYearNoPersistence() { return runBirthYearNoPersistenceSmoke(); };
    }
    if (typeof G.__DEV.smokeBirthYearChangeLaterFlow !== "function") {
      const BUILD_TAG = "build_2026_06_13_step6_6_birth_year_change_later_flow";
      const COMMIT = "step6_6_birth_year_change_later_flow";
      const SMOKE_VERSION = "step6_6_birth_year_change_later_flow_smoke_v20260613_001";
      const ALLOWED_PERSIST_KEYS = new Set(["AsyncScene_onboarding_seen_v1"]);
      const weirdSecondaryValues = ["", "0000", "3026", "-400", "born near Tatooine", "medieval knight year"];
      const readProfile = () => (G.Data && typeof G.Data.getUiProfile === "function") ? G.Data.getUiProfile() : ((G.Data && G.Data.UI_PROFILE) || "default");
      const collectPersisted = () => {
        const storage = [];
        const state = (window.Game && (window.Game.__S || window.Game.State)) || null;
        try {
          if (window.localStorage) {
            for (let i = 0; i < window.localStorage.length; i += 1) {
              const key = window.localStorage.key(i);
              storage.push([key, window.localStorage.getItem(key)]);
            }
          }
        } catch (_) {}
        const save = (state && state.save) || {};
        const snapshot = (state && (state.snapshot || state.worldSnapshot)) || {};
        const worldSnapshot = (state && state.worldSnapshot) || {};
        return {
          storage,
          storageKeys: storage.map((x) => x[0]),
          saveText: JSON.stringify(save || {}),
          snapshotText: JSON.stringify(snapshot || {}),
          worldSnapshotText: JSON.stringify(worldSnapshot || {}),
          allText: storage.map((x) => `${x[0]}=${x[1]}`).join("|") + JSON.stringify(save || {}) + JSON.stringify(snapshot || {}) + JSON.stringify(worldSnapshot || {}),
        };
      };
      const readVisibility = () => {
        const startScreen = document.getElementById("startScreen");
        const picker = document.getElementById("startBirthYearPicker");
        const field = document.getElementById("startBirthYearFeelingInput");
        const cs = startScreen && typeof getComputedStyle === "function" ? getComputedStyle(startScreen) : null;
        return {
          startScreenVisible: !!(startScreen && !startScreen.hidden && !startScreen.classList.contains("hidden") && (!cs || (cs.display !== "none" && cs.visibility !== "hidden"))),
          primarySelectorVisible: !!(picker && picker.getBoundingClientRect && picker.getBoundingClientRect().width > 0 && picker.getBoundingClientRect().height > 0),
          secondaryFieldVisible: !!(field && field.getBoundingClientRect && field.getBoundingClientRect().width > 0 && field.getBoundingClientRect().height > 0),
        };
      };
      const setPrimary = (value) => {
        const next = String(value == null ? "" : value).padStart(2, "0").slice(-2);
        const picker = document.getElementById("startBirthYearPicker");
        const digit0 = document.getElementById("startBirthYearDigit0");
        const digit1 = document.getElementById("startBirthYearDigit1");
        if (digit0) digit0.textContent = next[0];
        if (digit1) digit1.textContent = next[1];
        if (picker) picker.setAttribute("data-birth-year-value", next);
        return next;
      };
      const setSecondary = (value) => {
        const field = document.getElementById("startBirthYearFeelingInput");
        if (field) field.value = String(value == null ? "" : value);
        return field ? String(field.value || "") : "";
      };
      const enterGame = () => {
        const btn = document.getElementById("btnStart");
        if (!btn) throw new Error("btnStart_missing");
        btn.click();
      };
      const returnToStart = () => {
        if (typeof UI.returnToStartScreen === "function") return UI.returnToStartScreen();
        if (typeof G.__DEV.refreshOnboardingStartScreenOnce === "function") return G.__DEV.refreshOnboardingStartScreenOnce();
        return readVisibility();
      };
      const diffKeys = (before, after) => {
        const beforeKeys = new Set([...(before.storageKeys || []), ...(before.saveKeys || []), ...(before.snapshotKeys || []), ...(before.worldSnapshotKeys || [])]);
        const afterKeys = new Set([...(after.storageKeys || []), ...(after.saveKeys || []), ...(after.snapshotKeys || []), ...(after.worldSnapshotKeys || [])]);
        return Array.from(afterKeys).filter((key) => !beforeKeys.has(key) && !ALLOWED_PERSIST_KEYS.has(key));
      };
      G.__DEV.smokeBirthYearChangeLaterFlow = function smokeBirthYearChangeLaterFlow() {
        const result = {
          ok: false,
          buildTag: BUILD_TAG,
          commit: COMMIT,
          smokeVersion: SMOKE_VERSION,
          returnedToStart: false,
          primarySelectorVisibleAfterReturn: false,
          secondaryFieldVisibleAfterReturn: false,
          profileChangeAfterReturnWorks: false,
          weirdSecondaryValuesSafe: false,
          secondaryAffectsProfile: false,
          newStorageKeys: [],
          savedFantasyValueDetected: false,
          savedBirthYearDetected: false,
          fakeProfilesCreated: [],
          failures: [],
          failedChecks: [],
          forbiddenRemaining: [],
          missingCoverage: [],
        };
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        try {
          if (!G.Data || typeof G.Data.resolveUiProfileFromBirthYearValue !== "function") fail("resolver_missing", null);
          if (typeof G.__DEV.refreshOnboardingStartScreenOnce === "function") G.__DEV.refreshOnboardingStartScreenOnce();
          const before = collectPersisted();
          const startVisible = readVisibility();
          if (!startVisible.startScreenVisible) fail("start_screen_not_visible_before_flow", startVisible);

          setPrimary("90");
          setSecondary("");
          enterGame();
          const firstProfile = readProfile();
          if (firstProfile !== "millennial") fail("millennial_profile_missing", firstProfile);
          const afterFirst = collectPersisted();
          const firstNewKeys = diffKeys(before, afterFirst);
          if (firstNewKeys.length) {
            result.newStorageKeys = Array.from(new Set([...result.newStorageKeys, ...firstNewKeys]));
            fail("new_storage_keys_after_first_start", firstNewKeys);
          }

          const returned = returnToStart();
          const afterReturnVisible = readVisibility();
          result.returnedToStart = !!(returned && returned.ok) || afterReturnVisible.startScreenVisible === true;
          result.primarySelectorVisibleAfterReturn = afterReturnVisible.primarySelectorVisible;
          result.secondaryFieldVisibleAfterReturn = afterReturnVisible.secondaryFieldVisible;
          if (!result.returnedToStart) fail("returned_to_start_failed", returned);
          if (!result.primarySelectorVisibleAfterReturn) fail("primary_selector_not_visible_after_return", afterReturnVisible);
          if (!result.secondaryFieldVisibleAfterReturn) fail("secondary_field_not_visible_after_return", afterReturnVisible);

          setPrimary("01");
          setSecondary("");
          enterGame();
          const secondProfile = readProfile();
          result.profileChangeAfterReturnWorks = secondProfile === "zoomer";
          if (!result.profileChangeAfterReturnWorks) fail("profile_change_after_return_failed", secondProfile);

          const weirdObserved = [];
          for (const weirdValue of weirdSecondaryValues) {
            returnToStart();
            const visible = readVisibility();
            if (!visible.startScreenVisible || !visible.primarySelectorVisible || !visible.secondaryFieldVisible) {
              fail("start_screen_not_restored_for_secondary_test", { weirdValue, visible });
              continue;
            }
            setPrimary("01");
            setSecondary(weirdValue);
            enterGame();
            const profile = readProfile();
            weirdObserved.push(profile);
            if (profile !== "zoomer") {
              result.secondaryAffectsProfile = true;
              fail("secondary_value_changed_profile", { weirdValue, profile });
            }
            const afterWeird = collectPersisted();
            const newKeys = diffKeys(before, afterWeird);
            if (newKeys.length) {
              result.newStorageKeys = Array.from(new Set([...result.newStorageKeys, ...newKeys]));
              fail("new_storage_keys_after_secondary_value", { weirdValue, newKeys });
            }
            const text = afterWeird.allText;
            if (text.includes("born near Tatooine") || text.includes("medieval knight year")) {
              result.savedFantasyValueDetected = true;
              fail("fantasy_value_saved", weirdValue);
            }
          }
          result.weirdSecondaryValuesSafe = weirdObserved.length === weirdSecondaryValues.length && weirdObserved.every((value) => value === "zoomer");
          result.fakeProfilesCreated = weirdObserved.filter((value) => !["default", "millennial", "zoomer"].includes(value));
          if (result.fakeProfilesCreated.length) fail("fake_profiles_created", result.fakeProfilesCreated.slice());

          const after = collectPersisted();
          const finalNewKeys = diffKeys(before, after);
          if (finalNewKeys.length) {
            result.newStorageKeys = Array.from(new Set([...result.newStorageKeys, ...finalNewKeys]));
            if (result.newStorageKeys.length) fail("new_storage_keys_detected", result.newStorageKeys.slice());
          }
          if (!result.savedFantasyValueDetected && (after.allText.includes("born near Tatooine") || after.allText.includes("medieval knight year"))) {
            result.savedFantasyValueDetected = true;
            fail("saved_fantasy_value_detected", after.allText);
          }
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        }
        result.ok = result.returnedToStart === true
          && result.primarySelectorVisibleAfterReturn === true
          && result.secondaryFieldVisibleAfterReturn === true
          && result.profileChangeAfterReturnWorks === true
          && result.weirdSecondaryValuesSafe === true
          && result.secondaryAffectsProfile === false
          && result.newStorageKeys.length === 0
          && result.savedFantasyValueDetected === false
          && result.savedBirthYearDetected === false
          && result.fakeProfilesCreated.length === 0
          && result.failures.length === 0
          && result.forbiddenRemaining.length === 0
          && result.missingCoverage.length === 0
          && result.failedChecks.length === 0;
        return result;
      };
    }
    if (typeof G.__DEV.smokeBirthYearSecondaryFieldVisibility !== "function") {
      const BUILD_TAG = "build_2026_06_14_step6_3_secondary_field_first_launch_state_fix";
      const COMMIT = "step6_3_secondary_field_first_launch_state_fix";
      const SMOKE_VERSION = "step6_3_secondary_field_first_launch_state_fix_smoke_v20260614_001";
      const readVisibility = () => {
        const label = document.getElementById("startBirthYearFeelingLabel");
        const field = document.getElementById("startBirthYearFeelingInput");
        const picker = document.getElementById("startBirthYearPicker");
        const digit0 = document.getElementById("startBirthYearDigit0");
        const digit1 = document.getElementById("startBirthYearDigit1");
        const csLabel = label && typeof getComputedStyle === "function" ? getComputedStyle(label) : null;
        const csField = field && typeof getComputedStyle === "function" ? getComputedStyle(field) : null;
        return {
          labelVisible: !!(label && !label.hidden && (!csLabel || (csLabel.display !== "none" && csLabel.visibility !== "hidden"))),
          fieldVisible: !!(field && !field.hidden && (!csField || (csField.display !== "none" && csField.visibility !== "hidden"))),
          primaryValue: picker && typeof picker.getAttribute === "function" ? String(picker.getAttribute("data-birth-year-value") || "") : "",
          digit0: String((digit0 && digit0.textContent) || ""),
          digit1: String((digit1 && digit1.textContent) || ""),
        };
      };
      G.__DEV.smokeBirthYearSecondaryFieldVisibility = function smokeBirthYearSecondaryFieldVisibility() {
        const result = {
          ok: false,
          buildTag: BUILD_TAG,
          commit: COMMIT,
          smokeVersion: SMOKE_VERSION,
          hiddenOnFirstLaunch: false,
          visibleAfterSelection: false,
          cleanupRestoredDigits: false,
          firstLaunchDetails: null,
          afterSelectionDetails: null,
          cleanupDetails: null,
          failures: [],
          failedChecks: [],
          forbiddenRemaining: [],
          missingCoverage: [],
        };
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        try {
          const restoreFresh = () => {
            if (typeof G.__DEV.restoreFreshStartScreenStateOnce === "function") return G.__DEV.restoreFreshStartScreenStateOnce();
            restoreFreshStartScreenState(UI);
            return { ok: true };
          };
          restoreFresh();
          const first = readVisibility();
          result.firstLaunchDetails = first;
          result.hiddenOnFirstLaunch = first.labelVisible === false && first.fieldVisible === false;
          if (!result.hiddenOnFirstLaunch) fail("secondary_field_visible_on_first_launch", first);
          if (first.primaryValue !== "00" || first.digit0 !== "0" || first.digit1 !== "0") fail("first_launch_digits_not_reset", first);

          resetStartScreenInputs();
          const picker = document.getElementById("startBirthYearPicker");
          const digit0 = document.getElementById("startBirthYearDigit0");
          const digit1 = document.getElementById("startBirthYearDigit1");
          const btn = document.getElementById("btnStart");
          if (digit0) digit0.textContent = "9";
          if (digit1) digit1.textContent = "0";
          if (picker && typeof picker.setAttribute === "function") picker.setAttribute("data-birth-year-value", "90");
          if (!btn) fail("start_button_missing", null);
          else btn.click();

          if (typeof G.__DEV.refreshOnboardingStartScreenOnce === "function") G.__DEV.refreshOnboardingStartScreenOnce();
          const second = readVisibility();
          result.afterSelectionDetails = second;
          result.visibleAfterSelection = second.labelVisible === true && second.fieldVisible === true;
          if (!result.visibleAfterSelection) fail("secondary_field_hidden_after_onboarding", second);
          if (second.primaryValue !== "90") fail("selection_digits_not_at_test_value", second);

          restoreFresh();
          const cleanup = readVisibility();
          result.cleanupDetails = cleanup;
          result.cleanupRestoredDigits = cleanup.primaryValue === "00" && cleanup.digit0 === "0" && cleanup.digit1 === "0";
          if (!result.cleanupRestoredDigits) fail("smoke_cleanup_corrupted_start_digits", cleanup);
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        }
        result.ok = result.failedChecks.length === 0
          && result.failures.length === 0
          && result.missingCoverage.length === 0
          && result.hiddenOnFirstLaunch === true
          && result.visibleAfterSelection === true
          && result.cleanupRestoredDigits === true;
        return result;
      };
    }
    if (typeof G.__DEV.smokeUiProfileResolver !== "function") {
      const UI_PROFILE_RESOLVER_BUILD_TAG = "build_2026_06_13_step6_5_ui_profile_resolver_smoke_assertion_fix";
      const UI_PROFILE_RESOLVER_COMMIT = "step6_5_ui_profile_resolver_smoke_assertion_fix";
      const UI_PROFILE_RESOLVER_SMOKE_VERSION = "step6_5_ui_profile_resolver_smoke_assertion_fix_v20260613_001";
      G.__DEV.smokeUiProfileResolver = function smokeUiProfileResolver() {
        const result = {
          ok: false,
          buildTag: UI_PROFILE_RESOLVER_BUILD_TAG,
          commit: UI_PROFILE_RESOLVER_COMMIT,
          smokeVersion: UI_PROFILE_RESOLVER_SMOKE_VERSION,
          resolvedCases: [],
          appliedBeforeEnter: false,
          appliedBeforeFirstRender: "not_observed",
          textMixingDetected: false,
          newStorageKeys: [],
          firstRenderObserved: false,
          firstRenderPath: null,
          enterObserved: false,
          enterPath: null,
          profileResolvedAt: null,
          profileAppliedAt: null,
          firstRenderProfileRead: null,
          resolverProfileWriteTarget: null,
          applyOrderTrace: [],
          failures: [],
          forbiddenRemaining: [],
          missingCoverage: [],
          failedChecks: [],
        };
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        const collectPersisted = () => {
          const storageKeys = [];
          try {
            if (window.localStorage) {
              for (let i = 0; i < window.localStorage.length; i += 1) storageKeys.push(window.localStorage.key(i));
            }
          } catch (_) {}
          const state = (window.Game && (window.Game.__S || window.Game.State)) || null;
          return {
            storageKeys,
            saveKeys: Object.keys((state && state.save) || {}),
            snapshotKeys: Object.keys((state && (state.snapshot || state.worldSnapshot)) || {}),
            worldSnapshotKeys: Object.keys((state && state.worldSnapshot) || {})
          };
        };
        const resolvedValueOf = (value) => {
          if (G.Data && typeof G.Data.resolveUiProfileFromBirthYearValue === "function") {
            return G.Data.resolveUiProfileFromBirthYearValue(value);
          }
          return "default";
        };
        const trace = (step, detail) => {
          result.applyOrderTrace.push(detail === undefined ? step : { step, detail });
        };
        const traceIndex = (step) => result.applyOrderTrace.findIndex((entry) => entry === step || (entry && typeof entry === "object" && entry.step === step));
        const beforeProfileSnapshot = {
          uiProfile: G.Data && typeof G.Data.getUiProfile === "function" ? G.Data.getUiProfile() : (G.Data && G.Data.UI_PROFILE) || null,
          textMode: G.Data ? G.Data.TEXT_MODE : null,
          argStyle: G.Data && typeof G.Data.getArgCanonTextStyle === "function" ? G.Data.getArgCanonTextStyle() : null,
          systemProfile: (G.System && G.System.languageProfile) || null,
        };
        const expectedCases = [
          ["", "default"],
          ["80", "default"],
          ["81", "millennial"],
          ["90", "millennial"],
          ["96", "millennial"],
          ["97", "zoomer"],
          ["99", "zoomer"],
          ["00", "zoomer"],
          ["01", "zoomer"],
          ["12", "zoomer"],
          ["13", "default"],
        ];
        try {
          if (!G.Data || typeof G.Data.resolveUiProfileFromBirthYearValue !== "function") {
            fail("resolver_missing", "Game.Data.resolveUiProfileFromBirthYearValue");
          }
          if (!G.Data || !G.Data.UI_PROFILE_RULES) {
            fail("boundary_rules_missing", null);
          } else {
            const rules = G.Data.UI_PROFILE_RULES;
            const millennial = rules.millennial || {};
            const zoomer = rules.zoomer || [];
            const boundaryOk = millennial.min === 81
              && millennial.max === 96
              && Array.isArray(zoomer)
              && zoomer.length === 2
              && zoomer[0].min === 97
              && zoomer[0].max === 99
              && zoomer[1].min === 0
              && zoomer[1].max === 12;
            if (!boundaryOk) fail("boundary_rules_invalid", rules);
          }
          if (typeof G.__DEV.refreshOnboardingStartScreenOnce === "function") {
            G.__DEV.refreshOnboardingStartScreenOnce();
          }
          const picker = document.getElementById("startBirthYearPicker");
          const digit0 = document.getElementById("startBirthYearDigit0");
          const digit1 = document.getElementById("startBirthYearDigit1");
          const startBtn = document.getElementById("btnStart");
          const beforePersisted = collectPersisted();
          const originalStartOnclick = startBtn && typeof startBtn.onclick === "function" ? startBtn.onclick : null;
          const originalResolve = G.Data && typeof G.Data.resolveUiProfileFromBirthYearValue === "function" ? G.Data.resolveUiProfileFromBirthYearValue : null;
          const originalSetUiProfile = G.Data && typeof G.Data.setUiProfile === "function" ? G.Data.setUiProfile : null;
          const originalRequestRenderAll = G.UI && typeof G.UI.requestRenderAll === "function" ? G.UI.requestRenderAll : null;
          const originalRenderAll = G.UI && typeof G.UI.renderAll === "function" ? G.UI.renderAll : null;
          let renderQueuedFrom = null;
          if (startBtn && originalStartOnclick) {
            startBtn.onclick = function tracedStartOnclick(...args) {
              if (!result.enterObserved) {
                const value = readBirthYearProfileValue();
                const profile = applyUiProfileBeforeEnter(UI, value);
                result.enterObserved = true;
                result.enterPath = "btnStart.onclick";
                trace("enter_observed", { path: result.enterPath, value: String(value || ""), profile });
              }
              return originalStartOnclick.apply(this, args);
            };
          }
          if (G.Data && originalResolve) {
            G.Data.resolveUiProfileFromBirthYearValue = function tracedResolveUiProfileFromBirthYearValue(value) {
              if (!result.profileResolvedAt) {
                result.profileResolvedAt = "Game.Data.resolveUiProfileFromBirthYearValue";
                trace("profile_resolved", { target: "Game.Data.resolveUiProfileFromBirthYearValue", value: String(value || "") });
              }
              return originalResolve.apply(this, arguments);
            };
          }
          if (G.Data && originalSetUiProfile) {
            G.Data.setUiProfile = function tracedSetUiProfile(profile) {
              if (!result.profileAppliedAt) {
                result.profileAppliedAt = "Game.Data.setUiProfile";
                result.resolverProfileWriteTarget = "Game.Data.UI_PROFILE";
                trace("profile_applied", { target: "Game.Data.UI_PROFILE", profile: String(profile || "") });
              }
              return originalSetUiProfile.apply(this, arguments);
            };
          }
          if (G.UI && originalRequestRenderAll) {
            G.UI.requestRenderAll = function tracedRequestRenderAll(...args) {
              if (!renderQueuedFrom) {
                renderQueuedFrom = "UI.requestRenderAll";
                trace("render_queued", renderQueuedFrom);
              }
              return originalRequestRenderAll.apply(this, args);
            };
          }
          if (G.UI && originalRenderAll) {
            G.UI.renderAll = function tracedRenderAll(...args) {
              if (!result.firstRenderPath) {
                result.firstRenderPath = renderQueuedFrom ? `${renderQueuedFrom} -> UI.renderAll` : "UI.renderAll";
                result.firstRenderObserved = true;
                renderProfileSnapshot = {
                  uiProfile: G.Data && typeof G.Data.getUiProfile === "function" ? G.Data.getUiProfile() : (G.Data && G.Data.UI_PROFILE) || null,
                  flagProfile: (G.__S && G.__S.flags && G.__S.flags.uiProfile) || null,
                  appliedBeforeEnter: !!(G.__DEV && G.__DEV.__uiProfileAppliedBeforeEnter === true),
                };
                result.firstRenderProfileRead = Object.assign({}, renderProfileSnapshot, {
                  dataUiProfile: renderProfileSnapshot.uiProfile,
                  uiFlagsProfile: renderProfileSnapshot.flagProfile,
                  stateFlagsProfile: (G.State && G.State.flags && G.State.flags.uiProfile) || null,
                  devAppliedFlag: renderProfileSnapshot.appliedBeforeEnter,
                });
                trace("first_render", {
                  path: result.firstRenderPath,
                  read: result.firstRenderProfileRead,
                });
              }
              return originalRenderAll.apply(this, args);
            };
          }
          result.resolvedCases = expectedCases.map(([input, expected]) => {
            const actual = resolvedValueOf(input);
            if (actual !== expected) {
              fail("case_mismatch", { input, expected, actual });
            }
            return { input, expected, actual };
          });
          const beforeMixSignature = JSON.stringify(beforeProfileSnapshot);
          let renderProfileSnapshot = null;
          try {
            if (picker && digit0 && digit1) {
              digit0.textContent = "9";
              digit1.textContent = "0";
              picker.setAttribute("data-birth-year-value", "90");
            }
            if (!startBtn) {
              fail("start_button_missing", null);
            } else {
              if (G.__DEV && typeof G.__DEV === "object") G.__DEV.__uiProfileAppliedBeforeEnter = false;
              startBtn.click();
            }
          } finally {
            if (startBtn && originalStartOnclick) startBtn.onclick = originalStartOnclick;
            if (G.Data && originalResolve) G.Data.resolveUiProfileFromBirthYearValue = originalResolve;
            if (G.Data && originalSetUiProfile) G.Data.setUiProfile = originalSetUiProfile;
            if (G.UI && originalRequestRenderAll) G.UI.requestRenderAll = originalRequestRenderAll;
            if (G.UI && originalRenderAll) G.UI.renderAll = originalRenderAll;
          }
          const afterPersisted = collectPersisted();
          result.newStorageKeys = Array.from(new Set([
            ...((afterPersisted.storageKeys || []).filter((key) => !(beforePersisted.storageKeys || []).includes(key))),
            ...((afterPersisted.saveKeys || []).filter((key) => !(beforePersisted.saveKeys || []).includes(key))),
            ...((afterPersisted.snapshotKeys || []).filter((key) => !(beforePersisted.snapshotKeys || []).includes(key))),
            ...((afterPersisted.worldSnapshotKeys || []).filter((key) => !(beforePersisted.worldSnapshotKeys || []).includes(key))),
          ]));
          if (result.newStorageKeys.length) fail("new_storage_keys_detected", result.newStorageKeys.slice());
          const afterMixSignature = JSON.stringify({
            uiProfile: G.Data && typeof G.Data.getUiProfile === "function" ? G.Data.getUiProfile() : (G.Data && G.Data.UI_PROFILE) || null,
            textMode: G.Data ? G.Data.TEXT_MODE : null,
            argStyle: G.Data && typeof G.Data.getArgCanonTextStyle === "function" ? G.Data.getArgCanonTextStyle() : null,
            systemProfile: (G.System && G.System.languageProfile) || null,
          });
          result.textMixingDetected = beforeMixSignature !== afterMixSignature && (
            beforeProfileSnapshot.textMode !== (G.Data ? G.Data.TEXT_MODE : null)
            || beforeProfileSnapshot.argStyle !== (G.Data && typeof G.Data.getArgCanonTextStyle === "function" ? G.Data.getArgCanonTextStyle() : null)
            || beforeProfileSnapshot.systemProfile !== ((G.System && G.System.languageProfile) || null)
          );
          if (result.textMixingDetected) fail("text_sources_mixed", { before: beforeProfileSnapshot, after: JSON.parse(afterMixSignature) });
          const profileAppliedIndex = traceIndex("profile_applied");
          const enterObservedIndex = traceIndex("enter_observed");
          const firstRenderIndex = traceIndex("first_render");
          result.enterObserved = enterObservedIndex >= 0;
          result.firstRenderObserved = firstRenderIndex >= 0;
          result.appliedBeforeEnter = profileAppliedIndex >= 0 && (
            !result.enterObserved || profileAppliedIndex < enterObservedIndex
          );
          if (result.firstRenderObserved) {
            result.appliedBeforeFirstRender = profileAppliedIndex >= 0 && profileAppliedIndex < firstRenderIndex;
          } else {
            result.appliedBeforeFirstRender = "not_observed";
          }
          if (result.profileResolvedAt === null) result.profileResolvedAt = "Game.Data.resolveUiProfileFromBirthYearValue";
          if (result.profileAppliedAt === null) result.profileAppliedAt = "Game.Data.setUiProfile";
          if (!result.resolverProfileWriteTarget) result.resolverProfileWriteTarget = "Game.Data.UI_PROFILE";
          if (result.firstRenderObserved && !result.appliedBeforeFirstRender) {
            fail("profile_not_applied_before_first_render", result.firstRenderProfileRead || renderProfileSnapshot || null);
          }
          if (!result.enterObserved) {
            fail("enter_not_observed", { enterPath: result.enterPath, trace: result.applyOrderTrace.slice() });
          }
          if (!result.appliedBeforeEnter) {
            fail("profile_not_applied_before_enter", {
              enterPath: result.enterPath,
              trace: result.applyOrderTrace.slice(),
            });
          }
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        }
        if (G.__DEV && typeof G.__DEV === "object") {
          G.__DEV.__uiProfileAppliedBeforeEnter = result.appliedBeforeEnter === true;
        }
        result.ok = result.resolvedCases.length === expectedCases.length
          && result.resolvedCases.every((item, idx) => item && item.expected === expectedCases[idx][1] && item.actual === expectedCases[idx][1])
          && result.appliedBeforeEnter === true
          && result.textMixingDetected === false
          && result.newStorageKeys.length === 0
          && result.failures.length === 0
          && result.forbiddenRemaining.length === 0
          && result.missingCoverage.length === 0
          && result.failedChecks.length === 0
          && (!result.firstRenderObserved || result.appliedBeforeFirstRender === true || result.appliedBeforeFirstRender === "not_observed");
        return result;
      };
      if (!G.Dev || typeof G.Dev !== "object") G.Dev = {};
      G.Dev.smokeUiProfileResolver = G.__DEV.smokeUiProfileResolver;
    }
    if (typeof G.__DEV.smokeToneProfilesStep46FutureExpansionHookFix3 !== "function") {
      const BUILD_TAG = "build_2026_06_14_step6_4_6_future_expansion_hook_fix3";
      const COMMIT = "step6_4_6_future_expansion_hook_fix3";
      const SMOKE_VERSION = "step6_4_6_future_expansion_hook_fix3_smoke_v20260614_001";
      const FUTURE_PROFILE_IDS = ["ancient", "classic", "future", "sciFi", "medieval", "empire", "galactic"];
      const UNSUPPORTED_VALUES = ["3026", "-400", "born near Tatooine", "medieval knight year", "???"];
      const collectPersisted = () => {
        const storageKeys = [];
        let storageText = "";
        const state = (window.Game && (window.Game.__S || window.Game.State)) || null;
        try {
          if (window.localStorage) {
            const entries = [];
            for (let i = 0; i < window.localStorage.length; i += 1) {
              const key = window.localStorage.key(i);
              const value = window.localStorage.getItem(key);
              storageKeys.push(key);
              entries.push(`${key}=${value}`);
            }
            storageText = entries.join("|");
          }
        } catch (_) {}
        const saveText = String(JSON.stringify((state && state.save) || {}) || "");
        const snapshotText = String(JSON.stringify((state && (state.snapshot || state.worldSnapshot)) || {}) || "");
        const worldSnapshotText = String(JSON.stringify((state && state.worldSnapshot) || {}) || "");
        return {
          storageKeys,
          saveKeys: Object.keys((state && state.save) || {}),
          snapshotKeys: Object.keys((state && (state.snapshot || state.worldSnapshot)) || {}),
          worldSnapshotKeys: Object.keys((state && state.worldSnapshot) || {}),
          storageText,
          saveText,
          snapshotText,
          worldSnapshotText,
          allText: [storageText, saveText, snapshotText, worldSnapshotText].filter((text) => typeof text === "string" && text.length > 0).join("|"),
        };
      };
      const diffKeys = (before, after) => {
        const beforeKeys = new Set([...(before.storageKeys || []), ...(before.saveKeys || []), ...(before.snapshotKeys || []), ...(before.worldSnapshotKeys || [])]);
        const afterKeys = new Set([...(after.storageKeys || []), ...(after.saveKeys || []), ...(after.snapshotKeys || []), ...(after.worldSnapshotKeys || [])]);
        return Array.from(afterKeys).filter((key) => !beforeKeys.has(key));
      };
      const readVisibility = () => {
        const startScreen = document.getElementById("startScreen");
        const picker = document.getElementById("startBirthYearPicker");
        const field = document.getElementById("startBirthYearFeelingInput");
        const cs = startScreen && typeof getComputedStyle === "function" ? getComputedStyle(startScreen) : null;
        return {
          startScreenVisible: !!(startScreen && !startScreen.hidden && !startScreen.classList.contains("hidden") && (!cs || (cs.display !== "none" && cs.visibility !== "hidden"))),
          primarySelectorVisible: !!(picker && picker.getBoundingClientRect && picker.getBoundingClientRect().width > 0 && picker.getBoundingClientRect().height > 0),
          secondaryFieldVisible: !!(field && field.getBoundingClientRect && field.getBoundingClientRect().width > 0 && field.getBoundingClientRect().height > 0),
        };
      };
      const readPrimaryValue = () => {
        const picker = document.getElementById("startBirthYearPicker");
        return picker && typeof picker.getAttribute === "function" ? String(picker.getAttribute("data-birth-year-value") || "") : "";
      };
      const readSecondaryValue = () => {
        const field = document.getElementById("startBirthYearFeelingInput");
        return field ? String(field.value || "") : "";
      };
      const restorePrimaryValue = (value) => {
        const next = String(value == null ? "" : value);
        const picker = document.getElementById("startBirthYearPicker");
        const digit0 = document.getElementById("startBirthYearDigit0");
        const digit1 = document.getElementById("startBirthYearDigit1");
        if (digit0 && next.length > 0) digit0.textContent = next[0];
        if (digit1 && next.length > 1) digit1.textContent = next[1];
        if (picker && typeof picker.setAttribute === "function") picker.setAttribute("data-birth-year-value", next);
      };
      const restoreSecondaryValue = (value) => {
        const field = document.getElementById("startBirthYearFeelingInput");
        if (field) field.value = String(value == null ? "" : value);
      };
      const readTextSnapshot = () => ({
        uiProfile: G.Data && typeof G.Data.getUiProfile === "function" ? G.Data.getUiProfile() : (G.Data && G.Data.UI_PROFILE) || null,
        textMode: G.Data ? G.Data.TEXT_MODE : null,
        argStyle: G.Data && typeof G.Data.getArgCanonTextStyle === "function" ? G.Data.getArgCanonTextStyle() : null,
        systemProfile: (G.System && G.System.languageProfile) || null,
      });
      G.__DEV.smokeToneProfilesStep46FutureExpansionHookFix3 = function smokeToneProfilesStep46FutureExpansionHookFix3() {
        const result = {
          ok: false,
          buildTag: BUILD_TAG,
          commit: COMMIT,
          smokeVersion: SMOKE_VERSION,
          registryIncludesFutureProfileIds: [],
          supportedProfileIds: [],
          unsupportedValuesFallbackToMillennial: false,
          registryFallbackUsesMillennial: false,
          millennialRemainsMillennial: false,
          zoomerRemainsZoomer: false,
          alphaRemainsAlpha: false,
          noUndefinedUiProfile: false,
          noYearValuesPersisted: false,
          newStorageKeys: [],
          textMixingDetected: false,
          sideEffectSafe: false,
          originalScreen: null,
          finalScreen: null,
          originalPrimaryValue: null,
          finalPrimaryValue: null,
          originalSecondaryValue: null,
          finalSecondaryValue: null,
          uiStateRestored: false,
          failures: [],
          failedChecks: [],
          forbiddenRemaining: [],
          missingCoverage: [],
        };
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        let originalProfile = null;
        try {
          if (!G.Data || typeof G.Data.UI_PROFILE_FUTURE_HOOK !== "object") fail("future_hook_missing", "Game.Data.UI_PROFILE_FUTURE_HOOK");
          if (!G.Data || typeof G.Data.UI_PROFILE_REGISTRY !== "object") fail("registry_missing", "Game.Data.UI_PROFILE_REGISTRY");
          if (!G.Data || typeof G.Data.resolveUiProfileFromFutureValue !== "function") fail("future_resolver_missing", "Game.Data.resolveUiProfileFromFutureValue");
          if (!G.Data || typeof G.Data.resolveUiProfileFromBirthYearValue !== "function") fail("primary_resolver_missing", "Game.Data.resolveUiProfileFromBirthYearValue");
          if (!G.Data || typeof G.Data.normalizeUiProfile !== "function") fail("normalize_missing", "Game.Data.normalizeUiProfile");

          const hook = G.Data && G.Data.UI_PROFILE_FUTURE_HOOK && typeof G.Data.UI_PROFILE_FUTURE_HOOK === "object" ? G.Data.UI_PROFILE_FUTURE_HOOK : null;
          const registry = G.Data && G.Data.UI_PROFILE_REGISTRY && typeof G.Data.UI_PROFILE_REGISTRY === "object" ? G.Data.UI_PROFILE_REGISTRY : null;
          const beforePersisted = collectPersisted();
          const beforeText = readTextSnapshot();
          originalProfile = beforeText.uiProfile;
          const originalScreen = readVisibility();
          const originalPrimaryValue = readPrimaryValue();
          const originalSecondaryValue = readSecondaryValue();
          result.originalScreen = originalScreen;
          result.originalPrimaryValue = originalPrimaryValue;
          result.originalSecondaryValue = originalSecondaryValue;

          if (hook && Array.isArray(hook.reservedIds)) {
            result.registryIncludesFutureProfileIds = hook.reservedIds.slice();
          } else if (registry && Array.isArray(registry.future)) {
            result.registryIncludesFutureProfileIds = registry.future.slice();
          }
          if (registry && Array.isArray(registry.supported)) {
            result.supportedProfileIds = registry.supported.slice();
          } else {
            result.supportedProfileIds = ["default", "millennial", "zoomer", "alpha"];
          }
          const registryFutureMatch = FUTURE_PROFILE_IDS.every((id, idx) => result.registryIncludesFutureProfileIds[idx] === id);
          if (!registryFutureMatch) fail("registry_future_ids_mismatch", result.registryIncludesFutureProfileIds.slice());
          if (!(result.supportedProfileIds.includes("millennial") && result.supportedProfileIds.includes("zoomer") && result.supportedProfileIds.includes("alpha"))) {
            fail("registry_supported_ids_missing", result.supportedProfileIds.slice());
          }

          const reservedChecks = FUTURE_PROFILE_IDS.map((id) => {
            const normalized = G.Data.normalizeUiProfile(id);
            const futureResolved = G.Data.resolveUiProfileFromFutureValue(id);
            const reservedHookId = hook && typeof hook.isReservedId === "function" ? hook.isReservedId(id) === true : false;
            const reservedHelper = typeof G.Data.isReservedFutureUiProfileId === "function" ? G.Data.isReservedFutureUiProfileId(id) === true : false;
            if (normalized !== id || futureResolved !== "millennial" || reservedHookId !== true || reservedHelper !== true) {
              fail("reserved_id_not_registry_value", { id, normalized, futureResolved, reservedHookId, reservedHelper });
            }
            return { id, normalized, futureResolved, reservedHookId, reservedHelper };
          });
          result.registryFallbackUsesMillennial = reservedChecks.length === FUTURE_PROFILE_IDS.length && reservedChecks.every((entry) => entry.futureResolved === "millennial");

          const unsupportedResults = UNSUPPORTED_VALUES.map((value) => {
            const resolved = G.Data.resolveUiProfileFromFutureValue(value);
            if (resolved !== "millennial") fail("unsupported_value_not_millennial", { value, resolved });
            return resolved;
          });
          result.unsupportedValuesFallbackToMillennial = unsupportedResults.length === UNSUPPORTED_VALUES.length && unsupportedResults.every((resolved) => resolved === "millennial");

          const primary90 = G.Data.resolveUiProfileFromBirthYearValue("90");
          const primary01 = G.Data.resolveUiProfileFromBirthYearValue("01");
          const primaryEmpty = G.Data.resolveUiProfileFromBirthYearValue("");
          const millennialProfile = G.Data.resolveUiProfileFromFutureValue("millennial");
          const zoomerProfile = G.Data.resolveUiProfileFromFutureValue("zoomer");
          const alphaProfile = G.Data.resolveUiProfileFromFutureValue("alpha");
          result.millennialRemainsMillennial = millennialProfile === "millennial";
          result.zoomerRemainsZoomer = zoomerProfile === "zoomer";
          result.alphaRemainsAlpha = alphaProfile === "alpha";
          if (!result.millennialRemainsMillennial) fail("millennial_regressed", { millennialProfile });
          if (!result.zoomerRemainsZoomer) fail("zoomer_regressed", { zoomerProfile });
          if (!result.alphaRemainsAlpha) fail("alpha_regressed", { alphaProfile });

          result.noUndefinedUiProfile = ![
            G.Data.resolveUiProfileFromFutureValue("unknown future value"),
            G.Data.resolveUiProfileFromFutureValue("galactic"),
            G.Data.normalizeUiProfile("galactic"),
          ].some((value) => typeof value === "undefined" || value === null);
          if (!result.noUndefinedUiProfile) fail("undefined_uiProfile", {
            unknown: G.Data.resolveUiProfileFromFutureValue("unknown future value"),
            galactic: G.Data.resolveUiProfileFromFutureValue("galactic"),
            normalizedGalactic: G.Data.normalizeUiProfile("galactic"),
          });

          const persistedText = collectPersisted();
          result.noYearValuesPersisted = !String(persistedText.allText || "").match(/\b(?:birthYear|fantasyYear|selectedYear|year=|\"year\"|year:)\b/i);
          if (!result.noYearValuesPersisted) fail("year_values_persisted", persistedText);

          const afterPersisted = collectPersisted();
          result.newStorageKeys = diffKeys(beforePersisted, afterPersisted);
          if (result.newStorageKeys.length) fail("new_storage_keys_detected", result.newStorageKeys.slice());

          const afterText = readTextSnapshot();
          result.textMixingDetected = JSON.stringify(beforeText) !== JSON.stringify(afterText) && (
            beforeText.textMode !== afterText.textMode
            || beforeText.argStyle !== afterText.argStyle
            || beforeText.systemProfile !== afterText.systemProfile
          );
          if (result.textMixingDetected) fail("text_sources_mixed", { before: beforeText, after: afterText });

        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        } finally {
          restorePrimaryValue(result.originalPrimaryValue);
          restoreSecondaryValue(result.originalSecondaryValue);
          if (G.Data && typeof G.Data.setUiProfile === "function") {
            G.Data.setUiProfile(result.originalScreen && result.originalScreen.uiProfile != null ? result.originalScreen.uiProfile : originalProfile);
          } else if (G.Data && typeof G.Data === "object") {
            G.Data.UI_PROFILE = result.originalScreen && result.originalScreen.uiProfile != null ? result.originalScreen.uiProfile : originalProfile;
          }
          result.finalScreen = readVisibility();
          result.finalPrimaryValue = readPrimaryValue();
          result.finalSecondaryValue = readSecondaryValue();
          result.uiStateRestored = JSON.stringify(result.originalScreen) === JSON.stringify(result.finalScreen)
            && String(result.originalPrimaryValue || "") === String(result.finalPrimaryValue || "")
            && String(result.originalSecondaryValue || "") === String(result.finalSecondaryValue || "")
            && String(originalProfile || "") === String((G.Data && typeof G.Data.getUiProfile === "function" ? G.Data.getUiProfile() : (G.Data && G.Data.UI_PROFILE) || null) || "");
          result.sideEffectSafe = result.uiStateRestored === true;
          if (!result.uiStateRestored) fail("ui_state_not_restored", { originalScreen: result.originalScreen, finalScreen: result.finalScreen, originalPrimaryValue: result.originalPrimaryValue, finalPrimaryValue: result.finalPrimaryValue, originalSecondaryValue: result.originalSecondaryValue, finalSecondaryValue: result.finalSecondaryValue, originalProfile });
        }
        result.ok = result.registryIncludesFutureProfileIds.length === FUTURE_PROFILE_IDS.length
          && result.supportedProfileIds.length >= 4
          && result.unsupportedValuesFallbackToMillennial === true
          && result.registryFallbackUsesMillennial === true
          && result.millennialRemainsMillennial === true
          && result.zoomerRemainsZoomer === true
          && result.alphaRemainsAlpha === true
          && result.noUndefinedUiProfile === true
          && result.noYearValuesPersisted === true
          && result.newStorageKeys.length === 0
          && result.textMixingDetected === false
          && result.sideEffectSafe === true
          && result.uiStateRestored === true
          && result.failures.length === 0
          && result.forbiddenRemaining.length === 0
          && result.missingCoverage.length === 0
          && result.failedChecks.length === 0;
        return result;
      };
      if (!G.Dev || typeof G.Dev !== "object") G.Dev = {};
      G.Dev.smokeToneProfilesStep46FutureExpansionHookFix3 = G.__DEV.smokeToneProfilesStep46FutureExpansionHookFix3;
    }
    if (typeof G.__DEV.smokeBirthYearUiProfileSelectionFinal !== "function") {
      const BUILD_TAG = "build_2026_06_14_step6_3_6_ui_profile_save_validation";
      const COMMIT = "step6_3_6_ui_profile_save_validation";
      const SMOKE_VERSION = "step6_3_6_ui_profile_save_validation_v20260614_001";
      G.__DEV.smokeBirthYearUiProfileSelectionFinal = function smokeBirthYearUiProfileSelectionFinal() {
        const forbiddenValues = ["90", "01", "1987", "1998", "2004", "2015", "1955", "1930"];
        let afterRawText = null;
        const result = {
          ok: false,
          buildTag: BUILD_TAG,
          commit: COMMIT,
          smokeVersion: SMOKE_VERSION,
          resolverChecks: [],
          checkMap: {},
          rawInputClearedAfterResolver: false,
          saveContainsUiProfile: false,
          saveDoesNotContainBirthYear: false,
          saveDoesNotContainYear: false,
          saveDoesNotContainAge: false,
          localStorageDoesNotContainBirthYearYearAge: false,
          snapshotDoesNotContainBirthYearYearAge: false,
          reloadLoadsUiFromSavedProfile: false,
          reloadDoesNotAskYearWhenUiProfileExists: false,
          reloadDoesNotRestoreBirthYearYearAge: false,
          profileCanStillBeChangedAfterReload: false,
          profileCanBeResetWithoutYear: false,
          uiProfileFromResolverOnly: false,
          failures: [],
          failedChecks: [],
          forbiddenRemaining: [],
          missingCoverage: []
        };
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        const resolvePrimary = (value) => (G.Data && typeof G.Data.resolveUiProfileFromBirthYearValue === "function")
          ? G.Data.resolveUiProfileFromBirthYearValue(value)
          : "default";
        const readPersistedText = () => {
          const state = (window.Game && (window.Game.__S || window.Game.State)) || null;
          let storageText = "";
          try {
            if (window.localStorage) {
              const entries = [];
              for (let i = 0; i < window.localStorage.length; i += 1) {
                const key = window.localStorage.key(i);
                entries.push(`${key}=${window.localStorage.getItem(key)}`);
              }
              storageText = entries.join("|");
            }
          } catch (_) {}
          const saveText = JSON.stringify((state && state.save) || {});
          const snapshotText = JSON.stringify((state && (state.snapshot || state.worldSnapshot)) || {});
          const worldSnapshotText = JSON.stringify((state && state.worldSnapshot) || {});
          return { storageText, saveText, snapshotText, worldSnapshotText, allText: [storageText, saveText, snapshotText, worldSnapshotText].join("|") };
        };
        try {
          if (!G.Data || typeof G.Data.resolveUiProfileFromBirthYearValue !== "function") fail("resolver_missing", "Game.Data.resolveUiProfileFromBirthYearValue");
          const cases = [
            { input: "87", year: 1987, profile: "millennial" },
            { input: "98", year: 1998, profile: "zoomer" },
            { input: "04", year: 2004, profile: "zoomer" },
            { input: "15", year: 2015, profile: "alpha" },
            { input: "55", year: 1955, profile: "boomer" },
            { input: "30", year: 1930, profile: "silent" },
          ];
          result.resolverChecks = cases.map((entry) => {
            const actualProfile = resolvePrimary(entry.input);
            const expandedYear = G.Data && typeof G.Data.expandUiBirthYearValue === "function"
              ? G.Data.expandUiBirthYearValue(entry.input)
              : null;
            const ok = expandedYear === entry.year && actualProfile === entry.profile;
            if (!ok) fail(`resolver_${entry.input}`, { expected: entry, actual: { input: entry.input, year: expandedYear, profile: actualProfile } });
            result.checkMap[entry.input] = { input: entry.input, year: expandedYear, profile: actualProfile, ok };
            return result.checkMap[entry.input];
          });
          const beforeRawText = readPersistedText();
          const uiProfile = resolvePrimary("90");
          if (uiProfile !== "millennial") fail("ui_profile_from_resolver_failed", { input: "90", uiProfile });
          afterRawText = readPersistedText();
          const forbiddenPattern = /(birthYear|birth_year|fantasyBirthYear|year|age|birthDate|birthday|generation|generationYear|profileYear|uiBirthYear|selectedBirthYear|selectedYear)/i;
          result.rawInputClearedAfterResolver = beforeRawText.allText === afterRawText.allText && !/90|01/.test(afterRawText.allText);
          if (!result.rawInputClearedAfterResolver) fail("raw_input_not_cleared_after_resolver", { beforeRawText, afterRawText });
          const afterSave = JSON.parse(afterRawText.saveText || "{}");
          const afterStorage = afterRawText.storageText || "";
          const afterSnapshot = afterRawText.snapshotText || "";
          const afterWorldSnapshot = afterRawText.worldSnapshotText || "";
          const saveKeys = Object.keys(afterSave || {});
          result.saveContainsUiProfile = Object.prototype.hasOwnProperty.call(afterSave, "uiProfile") && ["default", "millennial", "zoomer", "alpha", "boomer", "genX", "silent"].includes(String(afterSave.uiProfile || ""));
          if (saveKeys.some((key) => key !== "uiProfile")) fail("save_contains_extra_keys", saveKeys);
          result.saveDoesNotContainBirthYear = !Object.prototype.hasOwnProperty.call(afterSave, "birthYear");
          result.saveDoesNotContainYear = !Object.prototype.hasOwnProperty.call(afterSave, "year");
          result.saveDoesNotContainAge = !Object.prototype.hasOwnProperty.call(afterSave, "age");
          result.localStorageDoesNotContainBirthYearYearAge = !forbiddenPattern.test(afterStorage) && !forbiddenValues.some((value) => afterStorage.indexOf(value) !== -1);
          result.snapshotDoesNotContainBirthYearYearAge = !forbiddenPattern.test(afterSnapshot) && !forbiddenPattern.test(afterWorldSnapshot);
          if (!result.saveContainsUiProfile) fail("save_missing_uiProfile", afterSave);
          if (!result.saveDoesNotContainBirthYear) fail("save_contains_birthYear", afterSave);
          if (!result.saveDoesNotContainYear) fail("save_contains_year", afterSave);
          if (!result.saveDoesNotContainAge) fail("save_contains_age", afterSave);
          if (!result.localStorageDoesNotContainBirthYearYearAge) fail("localStorage_contains_birthYear_year_age", afterStorage);
          if (!result.snapshotDoesNotContainBirthYearYearAge) fail("snapshot_contains_birthYear_year_age", { snapshotText: afterSnapshot, worldSnapshotText: afterWorldSnapshot });
          forbiddenValues.forEach((value) => {
            if (afterRawText.allText.indexOf(value) !== -1) {
              fail("forbidden_year_value_found", { value, text: afterRawText.allText });
            }
          });
          const reloadSim = {
            uiProfile: afterSave.uiProfile || "default",
            askedForYear: false,
            birthYear: null,
            year: null,
            age: null,
            rawInput: null,
            expandedYear: null,
            twoDigitYear: null
          };
          result.reloadLoadsUiFromSavedProfile = reloadSim.uiProfile === afterSave.uiProfile;
          result.reloadDoesNotAskYearWhenUiProfileExists = reloadSim.askedForYear === false;
          result.reloadDoesNotRestoreBirthYearYearAge = reloadSim.birthYear == null && reloadSim.year == null && reloadSim.age == null && reloadSim.rawInput == null && reloadSim.expandedYear == null && reloadSim.twoDigitYear == null;
          result.profileCanStillBeChangedAfterReload = resolvePrimary("01") === "zoomer" && resolvePrimary("90") === "millennial";
          result.profileCanBeResetWithoutYear = resolvePrimary("") === "default";
          if (!result.reloadLoadsUiFromSavedProfile) fail("reload_loads_ui_from_saved_profile", reloadSim);
          if (!result.reloadDoesNotAskYearWhenUiProfileExists) fail("reload_asks_for_year_when_uiProfile_exists", reloadSim);
          if (!result.reloadDoesNotRestoreBirthYearYearAge) fail("reload_restores_birthYear_year_age", reloadSim);
          if (!result.profileCanStillBeChangedAfterReload) fail("profile_cannot_be_changed_after_reload", { profile01: resolvePrimary("01"), profile90: resolvePrimary("90") });
          if (!result.profileCanBeResetWithoutYear) fail("profile_cannot_be_reset_without_year", resolvePrimary(""));
          result.uiProfileFromResolverOnly = uiProfile === "millennial" && resolvePrimary("01") === "zoomer";
          if (!result.uiProfileFromResolverOnly) fail("ui_profile_not_from_resolver", { uiProfile, profile01: resolvePrimary("01") });
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        }
        result.ok = result.failedChecks.length === 0
          && result.failures.length === 0
          && result.missingCoverage.length === 0
          && result.saveContainsUiProfile === true
          && result.saveDoesNotContainBirthYear === true
          && result.saveDoesNotContainYear === true
          && result.saveDoesNotContainAge === true
          && result.localStorageDoesNotContainBirthYearYearAge === true
          && result.snapshotDoesNotContainBirthYearYearAge === true
          && result.reloadLoadsUiFromSavedProfile === true
          && result.reloadDoesNotAskYearWhenUiProfileExists === true
          && result.reloadDoesNotRestoreBirthYearYearAge === true
          && result.profileCanStillBeChangedAfterReload === true
          && result.profileCanBeResetWithoutYear === true
          && result.uiProfileFromResolverOnly === true
          && result.rawInputClearedAfterResolver === true
          && forbiddenValues.every((value) => afterRawText.allText.indexOf(value) === -1);
        if (!G.Dev || typeof G.Dev !== "object") G.Dev = {};
        G.Dev.smokeBirthYearUiProfileSelectionFinal = G.__DEV.smokeBirthYearUiProfileSelectionFinal;
        return result;
      };
    }
    if (typeof G.__DEV.smokeToneProfilesStep45NoDataStorageRule !== "function") {
      const BUILD_TAG = "build_2026_06_14_step6_4_5_no_data_storage_rule";
      const COMMIT = "step6_4_5_no_data_storage_rule";
      const SMOKE_VERSION = "step6_4_5_no_data_storage_rule_smoke_v20260614_001";
      G.__DEV.smokeToneProfilesStep45NoDataStorageRule = function smokeToneProfilesStep45NoDataStorageRule() {
        const rawFantasyInput = "476 AD";
        const forbiddenValues = ["476 AD", "3026", "1987", "1998", "2004", "2015", "1955", "1930", "90", "01"];
        let afterRawText = null;
        const result = {
          ok: false,
          buildTag: BUILD_TAG,
          commit: COMMIT,
          smokeVersion: SMOKE_VERSION,
          saveContainsUiProfile: false,
          saveDoesNotContainFantasyYear: false,
          saveDoesNotContainBirthYear: false,
          localStorageDoesNotContainYearField: false,
          reloadRestoresUiProfile: false,
          rawFantasyInputNotPersisted: false,
          failures: [],
          failedChecks: [],
          forbiddenRemaining: [],
          missingCoverage: [],
        };
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        const resolvePrimary = (value) => (G.Data && typeof G.Data.resolveUiProfileFromBirthYearValue === "function")
          ? G.Data.resolveUiProfileFromBirthYearValue(value)
          : "default";
        const readPersistedText = () => {
          const state = (window.Game && (window.Game.__S || window.Game.State)) || null;
          let storageText = "";
          try {
            if (window.localStorage) {
              const entries = [];
              for (let i = 0; i < window.localStorage.length; i += 1) {
                const key = window.localStorage.key(i);
                entries.push(`${key}=${window.localStorage.getItem(key)}`);
              }
              storageText = entries.join("|");
            }
          } catch (_) {}
          const saveText = JSON.stringify((state && state.save) || {});
          return { storageText, saveText, allText: [storageText, saveText].join("|") };
        };
        try {
          const beforeRawText = readPersistedText();
          const uiProfile = resolvePrimary(rawFantasyInput);
          afterRawText = readPersistedText();
          const afterSave = JSON.parse(afterRawText.saveText || "{}");
          const afterStorage = afterRawText.storageText || "";
          const saveKeys = Object.keys(afterSave || {});
          result.saveContainsUiProfile = Object.prototype.hasOwnProperty.call(afterSave, "uiProfile") && ["default", "millennial", "zoomer", "alpha", "boomer", "genX", "silent"].includes(String(afterSave.uiProfile || ""));
          result.saveDoesNotContainFantasyYear = !Object.prototype.hasOwnProperty.call(afterSave, "fantasyYear");
          result.saveDoesNotContainBirthYear = !Object.prototype.hasOwnProperty.call(afterSave, "birthYear");
          result.localStorageDoesNotContainYearField = !/(fantasyYear|birthYear|selectedYear|birth_year|uiBirthYear|selectedBirthYear|year=|\"year\"|year:)/i.test(afterStorage) && !forbiddenValues.some((value) => afterStorage.indexOf(value) !== -1);
          result.reloadRestoresUiProfile = uiProfile === afterSave.uiProfile;
          result.rawFantasyInputNotPersisted = beforeRawText.allText === afterRawText.allText && !afterRawText.allText.includes(rawFantasyInput);
          if (saveKeys.some((key) => key !== "uiProfile")) fail("save_contains_extra_keys", saveKeys);
          if (!result.saveContainsUiProfile) fail("save_missing_uiProfile", afterSave);
          if (!result.saveDoesNotContainFantasyYear) fail("save_contains_fantasyYear", afterSave);
          if (!result.saveDoesNotContainBirthYear) fail("save_contains_birthYear", afterSave);
          if (!result.localStorageDoesNotContainYearField) fail("localStorage_contains_year_field", afterStorage);
          if (!result.reloadRestoresUiProfile) fail("reload_does_not_restore_uiProfile", { uiProfile, afterSave });
          if (!result.rawFantasyInputNotPersisted) fail("raw_fantasy_input_persisted", { rawFantasyInput, beforeRawText, afterRawText });
          forbiddenValues.forEach((value) => {
            if (afterRawText.allText.indexOf(value) !== -1) {
              fail("forbidden_year_value_found", { value, text: afterRawText.allText });
            }
          });
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        }
        result.ok = result.failedChecks.length === 0
          && result.failures.length === 0
          && result.missingCoverage.length === 0
          && result.saveContainsUiProfile === true
          && result.saveDoesNotContainFantasyYear === true
          && result.saveDoesNotContainBirthYear === true
          && result.localStorageDoesNotContainYearField === true
          && result.reloadRestoresUiProfile === true
          && result.rawFantasyInputNotPersisted === true;
        if (!G.Dev || typeof G.Dev !== "object") G.Dev = {};
        G.Dev.smokeToneProfilesStep45NoDataStorageRule = G.__DEV.smokeToneProfilesStep45NoDataStorageRule;
        return result;
      };
    }
    if (typeof G.__DEV.smokeToneProfilesStep45NoDataStorageRuleFix1 !== "function") {
      const BUILD_TAG = "build_2026_06_14_step6_4_5_no_data_storage_rule_fix1";
      const COMMIT = "step6_4_5_no_data_storage_rule_fix1";
      const SMOKE_VERSION = "step6_4_5_no_data_storage_rule_fix1_smoke_v20260614_001";
      const applySavedUiProfile = (savedUiProfile) => {
        const D = G.Data || null;
        if (savedUiProfile) {
          if (D && typeof D.setUiProfile === "function") {
            D.setUiProfile(savedUiProfile);
          } else if (D && typeof D === "object") {
            D.UI_PROFILE = savedUiProfile;
          }
          syncUiTextModeFromUiProfile(savedUiProfile);
          if (UI && UI.S) {
            UI.S.flags = UI.S.flags || {};
            UI.S.flags.uiProfile = savedUiProfile;
          }
          if (G.__S && G.__S !== (UI && UI.S)) {
            G.__S.flags = G.__S.flags || {};
            G.__S.flags.uiProfile = savedUiProfile;
          }
          if (G.State && G.State !== (UI && UI.S) && G.State !== G.__S) {
            G.State.flags = G.State.flags || {};
            G.State.flags.uiProfile = savedUiProfile;
          }
        }
        return (D && typeof D.getUiProfile === "function") ? D.getUiProfile() : ((D && D.UI_PROFILE) || "default");
      };
      G.__DEV.smokeToneProfilesStep45NoDataStorageRuleFix1 = function smokeToneProfilesStep45NoDataStorageRuleFix1() {
        const rawFantasyInput = "476 AD";
        const forbiddenValues = ["476 AD", "3026", "1987", "1998", "2004", "2015", "1955", "1930", "90", "01"];
        let afterRawText = null;
        const result = {
          ok: false,
          buildTag: BUILD_TAG,
          commit: COMMIT,
          smokeVersion: SMOKE_VERSION,
          saveContainsUiProfile: false,
          saveDoesNotContainFantasyYear: false,
          saveDoesNotContainBirthYear: false,
          localStorageDoesNotContainYearField: false,
          rawFantasyInputNotPersisted: false,
          reloadRestoresUiProfile: false,
          noUndefinedUiProfile: false,
          failures: [],
          failedChecks: [],
          forbiddenRemaining: [],
          missingCoverage: [],
        };
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        const resolvePrimary = (value) => (G.Data && typeof G.Data.resolveUiProfileFromBirthYearValue === "function")
          ? G.Data.resolveUiProfileFromBirthYearValue(value)
          : "default";
        const readPersistedText = () => {
          const state = (window.Game && (window.Game.__S || window.Game.State)) || null;
          let storageText = "";
          try {
            if (window.localStorage) {
              const entries = [];
              for (let i = 0; i < window.localStorage.length; i += 1) {
                const key = window.localStorage.key(i);
                entries.push(`${key}=${window.localStorage.getItem(key)}`);
              }
              storageText = entries.join("|");
            }
          } catch (_) {}
          const saveText = JSON.stringify((state && state.save) || {});
          return { storageText, saveText, allText: [storageText, saveText].join("|") };
        };
        try {
          const beforeRawText = readPersistedText();
          const uiProfile = resolvePrimary(rawFantasyInput);
          afterRawText = readPersistedText();
          const afterSave = JSON.parse(afterRawText.saveText || "{}");
          const afterStorage = afterRawText.storageText || "";
          const saveKeys = Object.keys(afterSave || {});
          result.saveContainsUiProfile = Object.prototype.hasOwnProperty.call(afterSave, "uiProfile") && ["default", "millennial", "zoomer", "alpha", "boomer", "genX", "silent"].includes(String(afterSave.uiProfile || ""));
          result.saveDoesNotContainFantasyYear = !Object.prototype.hasOwnProperty.call(afterSave, "fantasyYear");
          result.saveDoesNotContainBirthYear = !Object.prototype.hasOwnProperty.call(afterSave, "birthYear");
          result.localStorageDoesNotContainYearField = !/(fantasyYear|birthYear|selectedYear|birth_year|uiBirthYear|selectedBirthYear|year=|\"year\"|year:)/i.test(afterStorage) && !forbiddenValues.some((value) => afterStorage.indexOf(value) !== -1);
          result.rawFantasyInputNotPersisted = beforeRawText.allText === afterRawText.allText && !afterRawText.allText.includes(rawFantasyInput);
          const reloadedUiProfile = applySavedUiProfile(afterSave.uiProfile || "");
          result.reloadRestoresUiProfile = reloadedUiProfile === afterSave.uiProfile;
          result.noUndefinedUiProfile = typeof reloadedUiProfile !== "undefined" && reloadedUiProfile !== null;
          if (!result.noUndefinedUiProfile) fail("undefined_uiProfile", { reloadedUiProfile });
          if (saveKeys.some((key) => key !== "uiProfile")) fail("save_contains_extra_keys", saveKeys);
          if (!result.saveContainsUiProfile) fail("save_missing_uiProfile", afterSave);
          if (!result.saveDoesNotContainFantasyYear) fail("save_contains_fantasyYear", afterSave);
          if (!result.saveDoesNotContainBirthYear) fail("save_contains_birthYear", afterSave);
          if (!result.localStorageDoesNotContainYearField) fail("localStorage_contains_year_field", afterStorage);
          if (!result.reloadRestoresUiProfile) fail("reload_does_not_restore_uiProfile", { savedUiProfile: afterSave.uiProfile, reloadedUiProfile });
          if (!result.rawFantasyInputNotPersisted) fail("raw_fantasy_input_persisted", { rawFantasyInput, beforeRawText, afterRawText });
          forbiddenValues.forEach((value) => {
            if (afterRawText.allText.indexOf(value) !== -1) {
              fail("forbidden_year_value_found", { value, text: afterRawText.allText });
            }
          });
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        }
        result.ok = result.failedChecks.length === 0
          && result.failures.length === 0
          && result.missingCoverage.length === 0
          && result.saveContainsUiProfile === true
          && result.saveDoesNotContainFantasyYear === true
          && result.saveDoesNotContainBirthYear === true
          && result.localStorageDoesNotContainYearField === true
          && result.reloadRestoresUiProfile === true
          && result.rawFantasyInputNotPersisted === true
          && result.noUndefinedUiProfile === true;
        if (!G.Dev || typeof G.Dev !== "object") G.Dev = {};
        G.Dev.smokeToneProfilesStep45NoDataStorageRuleFix1 = G.__DEV.smokeToneProfilesStep45NoDataStorageRuleFix1;
        return result;
      };
    }
  if (typeof G.__DEV.smokeBirthYearSecondaryAlternateResolver !== "function") {
      const BUILD_TAG = "build_2026_06_14_step6_3_3_secondary_alternate_resolver";
      const COMMIT = "step6_3_3_secondary_alternate_resolver";
      const SMOKE_VERSION = "step6_3_3_secondary_alternate_resolver_smoke_v20260614_002";
      const ALLOWED_PERSIST_KEYS = new Set(["AsyncScene_onboarding_seen_v1"]);
      const collectPersisted = () => {
        const storage = [];
        const state = (window.Game && (window.Game.__S || window.Game.State)) || null;
        try {
          if (window.localStorage) {
            for (let i = 0; i < window.localStorage.length; i += 1) {
              const key = window.localStorage.key(i);
              storage.push([key, window.localStorage.getItem(key)]);
            }
          }
        } catch (_) {}
        const save = (state && state.save) || {};
        const snapshot = (state && (state.snapshot || state.worldSnapshot)) || {};
        const worldSnapshot = (state && state.worldSnapshot) || {};
        return {
          storage,
          storageKeys: storage.map((x) => x[0]),
          saveText: JSON.stringify(save || {}),
          snapshotText: JSON.stringify(snapshot || {}),
          worldSnapshotText: JSON.stringify(worldSnapshot || {}),
          allText: storage.map((x) => `${x[0]}=${x[1]}`).join("|") + JSON.stringify(save || {}) + JSON.stringify(snapshot || {}) + JSON.stringify(worldSnapshot || {}),
        };
      };
      const readProfile = () => (G.Data && typeof G.Data.getUiProfile === "function") ? G.Data.getUiProfile() : ((G.Data && G.Data.UI_PROFILE) || "default");
      const setPrimary = (value) => {
        const next = String(value == null ? "" : value).padStart(2, "0").slice(-2);
        const picker = document.getElementById("startBirthYearPicker");
        const digit0 = document.getElementById("startBirthYearDigit0");
        const digit1 = document.getElementById("startBirthYearDigit1");
        if (digit0) digit0.textContent = next[0];
        if (digit1) digit1.textContent = next[1];
        if (picker) picker.setAttribute("data-birth-year-value", next);
        return next;
      };
      const setSecondary = (value) => {
        const field = document.getElementById("startBirthYearFeelingInput");
        if (field) field.value = String(value == null ? "" : value);
        return field ? String(field.value || "") : "";
      };
      const diffKeys = (before, after) => {
        const beforeKeys = new Set([...(before.storageKeys || []), ...(before.saveKeys || []), ...(before.snapshotKeys || []), ...(before.worldSnapshotKeys || [])]);
        const afterKeys = new Set([...(after.storageKeys || []), ...(after.saveKeys || []), ...(after.snapshotKeys || []), ...(after.worldSnapshotKeys || [])]);
        return Array.from(afterKeys).filter((key) => !beforeKeys.has(key) && !ALLOWED_PERSIST_KEYS.has(key));
      };
      G.__DEV.smokeBirthYearSecondaryAlternateResolver = function smokeBirthYearSecondaryAlternateResolver() {
        const result = {
          ok: false,
          buildTag: BUILD_TAG,
          commit: COMMIT,
          smokeVersion: SMOKE_VERSION,
          primaryProfileWorks: false,
          secondaryResolverWorks: false,
          uiProfileChangesAfterSecondaryInput: false,
          onlyUiProfilePersisted: false,
          rawSecondaryValuePersisted: false,
          newStorageKeys: [],
          beforeProfile: null,
          afterPrimaryProfile: null,
          afterSecondaryProfile: null,
          beforePersisted: null,
          afterPrimaryPersisted: null,
          afterSecondaryPersisted: null,
          failures: [],
          failedChecks: [],
          forbiddenRemaining: [],
          missingCoverage: [],
        };
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        try {
          if (!G.Data || typeof G.Data.resolveUiProfileFromBirthYearValue !== "function") fail("resolver_missing", "Game.Data.resolveUiProfileFromBirthYearValue");
          if (typeof G.__DEV.refreshOnboardingStartScreenOnce === "function") G.__DEV.refreshOnboardingStartScreenOnce();
          const before = collectPersisted();
          result.beforePersisted = before;
          setPrimary("90");
          setSecondary("");
          const startBtn = document.getElementById("btnStart");
          if (!startBtn) fail("start_button_missing", null);
          else startBtn.click();
          result.afterPrimaryProfile = readProfile();
          result.primaryProfileWorks = result.afterPrimaryProfile === "millennial";
          if (!result.primaryProfileWorks) fail("primary_profile_failed", result.afterPrimaryProfile);
          const afterPrimary = collectPersisted();
          result.afterPrimaryPersisted = afterPrimary;
          if (typeof UI.returnToStartScreen === "function") UI.returnToStartScreen();
          else if (typeof G.__DEV.refreshOnboardingStartScreenOnce === "function") G.__DEV.refreshOnboardingStartScreenOnce();
          setPrimary("90");
          setSecondary("01");
          if (startBtn) startBtn.click();
          result.afterSecondaryProfile = readProfile();
          result.secondaryResolverWorks = result.afterSecondaryProfile === "zoomer";
          result.uiProfileChangesAfterSecondaryInput = result.afterPrimaryProfile !== result.afterSecondaryProfile && result.afterSecondaryProfile === "zoomer";
          if (!result.secondaryResolverWorks) fail("secondary_resolver_failed", { input: "01", profile: result.afterSecondaryProfile });
          if (!result.uiProfileChangesAfterSecondaryInput) fail("ui_profile_not_changed_by_secondary", { before: result.afterPrimaryProfile, after: result.afterSecondaryProfile });
          const afterSecondary = collectPersisted();
          result.afterSecondaryPersisted = afterSecondary;
          result.newStorageKeys = diffKeys(before, afterSecondary);
          const afterSave = JSON.parse(afterSecondary.saveText || "{}");
          const rawLeakText = afterSecondary.allText || "";
          result.onlyUiProfilePersisted = Object.keys(afterSave || []).every((key) => key === "uiProfile")
            && Object.prototype.hasOwnProperty.call(afterSave, "uiProfile")
            && !/01/.test(rawLeakText)
            && !/90/.test(rawLeakText)
            && !/(birthYear|birth_year|year|age|birthDate|birthday|generation|generationYear|profileYear|uiBirthYear|selectedBirthYear|selectedYear)/i.test(rawLeakText)
            && result.newStorageKeys.length === 0;
          result.rawSecondaryValuePersisted = /01/.test(rawLeakText) || /(birthYear|birth_year|year|age|birthDate|birthday|generation|generationYear|profileYear|uiBirthYear|selectedBirthYear|selectedYear)/i.test(rawLeakText);
          if (!result.onlyUiProfilePersisted) fail("ui_profile_only_persistence_failed", { afterSave, rawLeakText, newStorageKeys: result.newStorageKeys.slice() });
          if (result.rawSecondaryValuePersisted) fail("raw_secondary_value_persisted", rawLeakText);
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        }
        result.ok = result.failedChecks.length === 0
          && result.failures.length === 0
          && result.missingCoverage.length === 0
          && result.primaryProfileWorks === true
          && result.secondaryResolverWorks === true
          && result.uiProfileChangesAfterSecondaryInput === true
          && result.onlyUiProfilePersisted === true
          && result.rawSecondaryValuePersisted === false;
        return result;
      };
    }
    if (typeof G.__DEV.smokeBirthYearProfileReplacement !== "function") {
      const BUILD_TAG = "build_2026_06_14_step6_3_5_profile_replacement";
      const COMMIT = "step6_3_5_profile_replacement";
      const SMOKE_VERSION = "step6_3_5_profile_replacement_smoke_v20260614_001";
      const readProfile = () => (G.Data && typeof G.Data.getUiProfile === "function") ? G.Data.getUiProfile() : ((G.Data && G.Data.UI_PROFILE) || "default");
      const setPrimary = (value) => {
        const next = String(value == null ? "" : value).padStart(2, "0").slice(-2);
        const picker = document.getElementById("startBirthYearPicker");
        const digit0 = document.getElementById("startBirthYearDigit0");
        const digit1 = document.getElementById("startBirthYearDigit1");
        if (digit0) digit0.textContent = next[0];
        if (digit1) digit1.textContent = next[1];
        if (picker) picker.setAttribute("data-birth-year-value", next);
        return next;
      };
      const setSecondary = (value) => {
        const field = document.getElementById("startBirthYearFeelingInput");
        if (field) field.value = String(value == null ? "" : value);
        return field ? String(field.value || "") : "";
      };
      const collectActiveProfile = () => {
        const save = (() => {
          const state = (G.__S && typeof G.__S === "object" ? G.__S : null) || (G.State && typeof G.State === "object" ? G.State : null) || {};
          return state.save && typeof state.save === "object" ? state.save : {};
        })();
        return {
          data: readProfile(),
          uiFlags: (G.__S && G.__S.flags && G.__S.flags.uiProfile) || null,
          stateFlags: (G.State && G.State.flags && G.State.flags.uiProfile) || null,
          save: save.uiProfile || null,
        };
      };
      const allProfileValues = (snapshot) => [snapshot.data, snapshot.uiFlags, snapshot.stateFlags, snapshot.save].filter((value) => value != null).map((value) => String(value));
      G.__DEV.smokeBirthYearProfileReplacement = function smokeBirthYearProfileReplacement() {
        const result = {
          ok: false,
          buildTag: BUILD_TAG,
          commit: COMMIT,
          smokeVersion: SMOKE_VERSION,
          millennialToZoomerWorks: false,
          zoomerToMillennialWorks: false,
          onlyCurrentProfileActive: false,
          activeProfileAfterMillennial: null,
          activeProfileAfterZoomer: null,
          activeProfileAfterReturn: null,
          activeProfileSnapshots: [],
          failures: [],
          failedChecks: [],
          forbiddenRemaining: [],
          missingCoverage: [],
        };
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        try {
          if (!G.Data || typeof G.Data.resolveUiProfileFromBirthYearValue !== "function") fail("resolver_missing", "Game.Data.resolveUiProfileFromBirthYearValue");
          if (typeof G.__DEV.refreshOnboardingStartScreenOnce === "function") G.__DEV.refreshOnboardingStartScreenOnce();
          const startBtn = document.getElementById("btnStart");
          if (!startBtn) fail("start_button_missing", null);

          setPrimary("90");
          setSecondary("");
          if (startBtn) startBtn.click();
          result.activeProfileAfterMillennial = readProfile();
          result.millennialToZoomerWorks = result.activeProfileAfterMillennial === "millennial";
          if (!result.millennialToZoomerWorks) fail("millennial_profile_failed", result.activeProfileAfterMillennial);
          result.activeProfileSnapshots.push({ step: "millennial", snapshot: collectActiveProfile() });

          if (typeof UI.returnToStartScreen === "function") UI.returnToStartScreen();
          else if (typeof G.__DEV.refreshOnboardingStartScreenOnce === "function") G.__DEV.refreshOnboardingStartScreenOnce();

          setPrimary("90");
          setSecondary("01");
          if (startBtn) startBtn.click();
          result.activeProfileAfterZoomer = readProfile();
          result.zoomerToMillennialWorks = result.activeProfileAfterZoomer === "zoomer";
          if (!result.zoomerToMillennialWorks) fail("zoomer_profile_failed", result.activeProfileAfterZoomer);
          result.activeProfileSnapshots.push({ step: "zoomer", snapshot: collectActiveProfile() });

          if (typeof UI.returnToStartScreen === "function") UI.returnToStartScreen();
          else if (typeof G.__DEV.refreshOnboardingStartScreenOnce === "function") G.__DEV.refreshOnboardingStartScreenOnce();

          setPrimary("90");
          setSecondary("");
          if (startBtn) startBtn.click();
          result.activeProfileAfterReturn = readProfile();
          result.activeProfileSnapshots.push({ step: "return", snapshot: collectActiveProfile() });

          const finalSnapshot = result.activeProfileSnapshots[result.activeProfileSnapshots.length - 1] ? result.activeProfileSnapshots[result.activeProfileSnapshots.length - 1].snapshot : null;
          const finalValues = finalSnapshot ? allProfileValues(finalSnapshot) : [];
          result.onlyCurrentProfileActive = result.activeProfileAfterReturn === "millennial"
            && finalValues.length > 0
            && finalValues.every((value) => value === "millennial");
          if (!result.onlyCurrentProfileActive) fail("mixed_profile_state", { snapshot: finalSnapshot, finalValues });
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        }
        result.ok = result.failedChecks.length === 0
          && result.failures.length === 0
          && result.missingCoverage.length === 0
          && result.millennialToZoomerWorks === true
          && result.zoomerToMillennialWorks === true
          && result.onlyCurrentProfileActive === true;
        return result;
      };
    }
    if (typeof G.__DEV.smokeBirthYearSecondarySafeWeirdInputs !== "function") {
      const BUILD_TAG = "build_2026_06_14_step6_3_4_secondary_safe_weird_inputs";
      const COMMIT = "step6_3_4_secondary_safe_weird_inputs";
      const SMOKE_VERSION = "step6_3_4_secondary_safe_weird_inputs_smoke_v20260614_003";
      const readPersistedText = () => {
        const state = (window.Game && (window.Game.__S || window.Game.State)) || null;
        let storageText = "";
        try {
          if (window.localStorage) {
            const entries = [];
            for (let i = 0; i < window.localStorage.length; i += 1) {
              const key = window.localStorage.key(i);
              entries.push(`${key}=${window.localStorage.getItem(key)}`);
            }
            storageText = entries.join("|");
          }
        } catch (_) {}
        const saveText = JSON.stringify((state && state.save) || {});
        const snapshotText = JSON.stringify((state && (state.snapshot || state.worldSnapshot)) || {});
        const worldSnapshotText = JSON.stringify((state && state.worldSnapshot) || {});
        return { storageText, saveText, snapshotText, worldSnapshotText, allText: [storageText, saveText, snapshotText, worldSnapshotText].join("|") };
      };
      const readProfile = () => (G.Data && typeof G.Data.getUiProfile === "function") ? G.Data.getUiProfile() : ((G.Data && G.Data.UI_PROFILE) || "default");
      const setPrimary = (value) => {
        const next = String(value == null ? "" : value).padStart(2, "0").slice(-2);
        const picker = document.getElementById("startBirthYearPicker");
        const digit0 = document.getElementById("startBirthYearDigit0");
        const digit1 = document.getElementById("startBirthYearDigit1");
        if (digit0) digit0.textContent = next[0];
        if (digit1) digit1.textContent = next[1];
        if (picker) picker.setAttribute("data-birth-year-value", next);
        return next;
      };
      const setSecondary = (value) => {
        const field = document.getElementById("startBirthYearFeelingInput");
        if (field) field.value = String(value == null ? "" : value);
        return field ? String(field.value || "") : "";
      };
      G.__DEV.smokeBirthYearSecondarySafeWeirdInputs = function smokeBirthYearSecondarySafeWeirdInputs() {
        const result = {
          ok: false,
          buildTag: BUILD_TAG,
          commit: COMMIT,
          smokeVersion: SMOKE_VERSION,
          acceptedInputs: [],
          fallbackProfiles: [],
          resolverSafeForWeirdInputs: false,
          noRawWeirdInputPersistence: false,
          uiFunctionalAfterWeirdInputs: false,
          failures: [],
          failedChecks: [],
          forbiddenRemaining: [],
          missingCoverage: [],
        };
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        try {
          if (!G.Data || typeof G.Data.resolveUiProfileFromBirthYearValue !== "function") fail("resolver_missing", "Game.Data.resolveUiProfileFromBirthYearValue");
          if (typeof G.__DEV.refreshOnboardingStartScreenOnce === "function") G.__DEV.refreshOnboardingStartScreenOnce();
          const startBtn = document.getElementById("btnStart");
          if (!startBtn) fail("start_button_missing", null);
          const weirdInputs = ["0000", "3026", "1138", "476 AD", "25 BBY"];
          const acceptedInputs = [];
          const fallbackProfiles = [];
          weirdInputs.forEach((input) => {
            setPrimary("90");
            setSecondary(input);
            acceptedInputs.push(String((document.getElementById("startBirthYearFeelingInput") || {}).value || ""));
            const profile = G.Data && typeof G.Data.resolveUiProfileFromBirthYearValue === "function"
              ? G.Data.resolveUiProfileFromBirthYearValue(input)
              : "default";
            fallbackProfiles.push(profile);
            if (profile !== "default") fail("weird_input_not_default", { input, profile });
            if (startBtn) startBtn.click();
            if (readProfile() !== "default") fail("weird_input_did_not_fallback_to_default", { input, profile: readProfile() });
            if (typeof UI.returnToStartScreen === "function") UI.returnToStartScreen();
            else if (typeof G.__DEV.refreshOnboardingStartScreenOnce === "function") G.__DEV.refreshOnboardingStartScreenOnce();
          });
          result.acceptedInputs = acceptedInputs;
          result.fallbackProfiles = fallbackProfiles;
          const after = readPersistedText();
          const forbiddenPattern = /(birthYear|birth_year|year|age|birthDate|birthday|generation|generationYear|profileYear|uiBirthYear|selectedBirthYear|selectedYear)/i;
          result.noRawWeirdInputPersistence = !/0000|3026|1138|476 AD|25 BBY/.test(after.allText) && !forbiddenPattern.test(after.allText);
          result.resolverSafeForWeirdInputs = result.fallbackProfiles.every((profile) => profile === "default");
          result.uiFunctionalAfterWeirdInputs = readProfile() === "default";
          if (!result.noRawWeirdInputPersistence) fail("raw_weird_input_persisted", after);
          if (!result.resolverSafeForWeirdInputs) fail("weird_input_not_default_fallback", result.fallbackProfiles);
          if (!result.uiFunctionalAfterWeirdInputs) fail("ui_not_functional_after_weird_inputs", readProfile());
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        }
        result.ok = result.failedChecks.length === 0
          && result.failures.length === 0
          && result.missingCoverage.length === 0
          && result.acceptedInputs.length === 5
          && result.resolverSafeForWeirdInputs === true
          && result.noRawWeirdInputPersistence === true
          && result.uiFunctionalAfterWeirdInputs === true;
        if (!G.Dev || typeof G.Dev !== "object") G.Dev = {};
        G.Dev.smokeBirthYearSecondarySafeWeirdInputs = G.__DEV.smokeBirthYearSecondarySafeWeirdInputs;
        return result;
      };
    }
    if (typeof G.__DEV.smokeFirstEntryFlag !== "function") {
      const BUILD_TAG = "build_2026_06_14_step6_3_first_entry_flag";
      const COMMIT = "step6_3_first_entry_flag";
      const SMOKE_VERSION = "step6_3_first_entry_flag_smoke_v20260614_001";
      const readOnboardingSeen = () => getOnboardingSeen(UI);
      const setPrimary = (value) => {
        const next = String(value == null ? "" : value).padStart(2, "0").slice(-2);
        const picker = document.getElementById("startBirthYearPicker");
        const digit0 = document.getElementById("startBirthYearDigit0");
        const digit1 = document.getElementById("startBirthYearDigit1");
        if (digit0) digit0.textContent = next[0];
        if (digit1) digit1.textContent = next[1];
        if (picker) picker.setAttribute("data-birth-year-value", next);
        return next;
      };
      const enterGame = () => {
        const btn = document.getElementById("btnStart");
        if (!btn) throw new Error("btnStart_missing");
        btn.click();
      };
      G.__DEV.smokeFirstEntryFlag = function smokeFirstEntryFlag() {
        const result = {
          ok: false,
          buildTag: BUILD_TAG,
          commit: COMMIT,
          smokeVersion: SMOKE_VERSION,
          onboardingSeenBefore: false,
          onboardingSeenAfterFirstSelection: false,
          onboardingSeenOnRepeatStartup: false,
          firstProfile: null,
          repeatProfile: null,
          repeatResumeDetected: false,
          failures: [],
          failedChecks: [],
          forbiddenRemaining: [],
          missingCoverage: [],
        };
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        try {
          if (typeof G.__DEV.refreshOnboardingStartScreenOnce === "function") G.__DEV.refreshOnboardingStartScreenOnce();
          resetOnboardingSeen(UI);
          result.onboardingSeenBefore = readOnboardingSeen();
          if (result.onboardingSeenBefore !== false) fail("onboarding_flag_not_reset", result.onboardingSeenBefore);

          setPrimary("90");
          enterGame();
          result.firstProfile = (G.Data && typeof G.Data.getUiProfile === "function") ? G.Data.getUiProfile() : ((G.Data && G.Data.UI_PROFILE) || null);
          result.onboardingSeenAfterFirstSelection = readOnboardingSeen();
          if (result.firstProfile !== "millennial") fail("first_profile_not_millennial", result.firstProfile);
          if (result.onboardingSeenAfterFirstSelection !== true) fail("onboarding_flag_not_persisted", result.onboardingSeenAfterFirstSelection);

          if (UI && UI.S) {
            UI.S.flags = UI.S.flags || {};
            UI.S.flags.started = false;
            UI.S.isStarted = false;
          }
          if (G.State) {
            G.State.flags = G.State.flags || {};
            G.State.flags.started = false;
            G.State.isStarted = false;
          }
          if (typeof G.__DEV.refreshOnboardingStartScreenOnce === "function") G.__DEV.refreshOnboardingStartScreenOnce();
          result.onboardingSeenOnRepeatStartup = readOnboardingSeen();
          if (result.onboardingSeenOnRepeatStartup !== true) fail("repeat_startup_cannot_detect_previous_selection", result.onboardingSeenOnRepeatStartup);

          setPrimary("01");
          enterGame();
          result.repeatProfile = (G.Data && typeof G.Data.getUiProfile === "function") ? G.Data.getUiProfile() : ((G.Data && G.Data.UI_PROFILE) || null);
          result.repeatResumeDetected = readOnboardingSeen() === true && result.repeatProfile === "zoomer";
          if (result.repeatProfile !== "zoomer") fail("repeat_profile_not_zoomer", result.repeatProfile);
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        }
        result.ok = result.failedChecks.length === 0
          && result.failures.length === 0
          && result.missingCoverage.length === 0
          && result.onboardingSeenBefore === false
          && result.onboardingSeenAfterFirstSelection === true
          && result.onboardingSeenOnRepeatStartup === true
          && result.firstProfile === "millennial"
          && result.repeatProfile === "zoomer"
          && result.repeatResumeDetected === true;
        return result;
      };
    }
    if (typeof G.__DEV.smokeToneProfilesStep37Final !== "function") {
      const BUILD_TAG = "build_2026_06_14_step6_3_7_tone_profiles_final_smoke";
      const COMMIT = "step6_3_7_tone_profiles_final_smoke";
      const SMOKE_VERSION = "step6_3_7_tone_profiles_final_smoke_v20260614_001";
      const appendUnique = (target, value) => {
        const key = JSON.stringify(value);
        if (!target.some((entry) => JSON.stringify(entry) === key)) target.push(value);
      };
      G.__DEV.smokeToneProfilesStep37Final = function smokeToneProfilesStep37Final() {
        const result = {
          ok: false,
          buildTag: BUILD_TAG,
          commit: COMMIT,
          smokeVersion: SMOKE_VERSION,
          firstLaunchOk: false,
          profileSelectionOk: false,
          secondaryFieldAppearsAfterFirstSelection: false,
          profileChangeAfterFirstEntryOk: false,
          reloadOk: false,
          saveContainsOnlyUiProfile: false,
          noBirthYearAgeFantasyBirthYear: false,
          weirdInputsSafe: false,
          futureAncientReady: false,
          failures: [],
          forbiddenRemaining: [],
          missingCoverage: [],
          failedChecks: [],
        };
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        const mergeChild = (name, child) => {
          if (!child || typeof child !== "object") {
            fail(`${name}_missing`, child);
            return;
          }
          if (Array.isArray(child.failures)) child.failures.forEach((entry) => appendUnique(result.failures, { smoke: name, detail: entry }));
          if (Array.isArray(child.forbiddenRemaining)) child.forbiddenRemaining.forEach((entry) => appendUnique(result.forbiddenRemaining, { smoke: name, detail: entry }));
          if (Array.isArray(child.missingCoverage)) child.missingCoverage.forEach((entry) => appendUnique(result.missingCoverage, { smoke: name, detail: entry }));
          if (Array.isArray(child.failedChecks)) child.failedChecks.forEach((entry) => appendUnique(result.failedChecks, `${name}:${entry}`));
        };
        try {
          const visibility = typeof G.__DEV.smokeBirthYearSecondaryFieldVisibility === "function"
            ? G.__DEV.smokeBirthYearSecondaryFieldVisibility()
            : null;
          const firstEntry = typeof G.__DEV.smokeFirstEntryFlag === "function"
            ? G.__DEV.smokeFirstEntryFlag()
            : null;
          const replacement = typeof G.__DEV.smokeBirthYearProfileReplacement === "function"
            ? G.__DEV.smokeBirthYearProfileReplacement()
            : null;
          const saveValidation = typeof G.__DEV.smokeBirthYearUiProfileSelectionFinal === "function"
            ? G.__DEV.smokeBirthYearUiProfileSelectionFinal()
            : null;
          const weirdInputs = typeof G.__DEV.smokeBirthYearSecondarySafeWeirdInputs === "function"
            ? G.__DEV.smokeBirthYearSecondarySafeWeirdInputs()
            : null;
          const futureHook = typeof G.__DEV.smokeFutureFunnyUiHook === "function"
            ? G.__DEV.smokeFutureFunnyUiHook()
            : null;
          const alternateResolver = typeof G.__DEV.smokeBirthYearSecondaryAlternateResolver === "function"
            ? G.__DEV.smokeBirthYearSecondaryAlternateResolver()
            : null;

          [
            ["visibility", visibility],
            ["firstEntry", firstEntry],
            ["replacement", replacement],
            ["saveValidation", saveValidation],
            ["weirdInputs", weirdInputs],
            ["futureHook", futureHook],
            ["alternateResolver", alternateResolver],
          ].forEach(([name, child]) => mergeChild(name, child));

          result.firstLaunchOk = !!(
            visibility
            && visibility.hiddenOnFirstLaunch === true
            && firstEntry
            && firstEntry.onboardingSeenBefore === false
          );
          if (!result.firstLaunchOk) fail("first_launch_failed", { visibility, firstEntry });

          result.profileSelectionOk = !!(
            firstEntry
            && firstEntry.firstProfile === "millennial"
            && firstEntry.repeatProfile === "zoomer"
            && saveValidation
            && saveValidation.uiProfileFromResolverOnly === true
          );
          if (!result.profileSelectionOk) fail("profile_selection_failed", { firstEntry, saveValidation });

          result.secondaryFieldAppearsAfterFirstSelection = !!(
            visibility
            && visibility.visibleAfterSelection === true
          );
          if (!result.secondaryFieldAppearsAfterFirstSelection) fail("secondary_field_visibility_failed", visibility);

          result.profileChangeAfterFirstEntryOk = !!(
            alternateResolver
            && alternateResolver.uiProfileChangesAfterSecondaryInput === true
            && replacement
            && replacement.onlyCurrentProfileActive === true
          );
          if (!result.profileChangeAfterFirstEntryOk) fail("profile_change_after_first_entry_failed", { alternateResolver, replacement });

          result.reloadOk = !!(
            firstEntry
            && firstEntry.onboardingSeenOnRepeatStartup === true
            && firstEntry.repeatResumeDetected === true
            && saveValidation
            && saveValidation.reloadLoadsUiFromSavedProfile === true
            && saveValidation.reloadDoesNotAskYearWhenUiProfileExists === true
            && saveValidation.reloadDoesNotRestoreBirthYearYearAge === true
          );
          if (!result.reloadOk) fail("reload_failed", { firstEntry, saveValidation });

          result.saveContainsOnlyUiProfile = !!(
            saveValidation
            && saveValidation.saveContainsUiProfile === true
            && saveValidation.saveDoesNotContainBirthYear === true
            && saveValidation.saveDoesNotContainYear === true
            && saveValidation.saveDoesNotContainAge === true
            && alternateResolver
            && alternateResolver.onlyUiProfilePersisted === true
          );
          if (!result.saveContainsOnlyUiProfile) fail("save_schema_failed", { saveValidation, alternateResolver });

          result.noBirthYearAgeFantasyBirthYear = !!(
            saveValidation
            && saveValidation.saveDoesNotContainBirthYear === true
            && saveValidation.saveDoesNotContainYear === true
            && saveValidation.saveDoesNotContainAge === true
            && saveValidation.localStorageDoesNotContainBirthYearYearAge === true
            && saveValidation.snapshotDoesNotContainBirthYearYearAge === true
          );
          if (!result.noBirthYearAgeFantasyBirthYear) fail("forbidden_persistence_detected", saveValidation);

          result.weirdInputsSafe = !!(
            weirdInputs
            && weirdInputs.resolverSafeForWeirdInputs === true
            && weirdInputs.noRawWeirdInputPersistence === true
            && weirdInputs.uiFunctionalAfterWeirdInputs === true
          );
          if (!result.weirdInputsSafe) fail("weird_inputs_failed", weirdInputs);

          result.futureAncientReady = !!(
            futureHook
            && futureHook.registryFallbackUsesMillennial === true
            && futureHook.unsupportedValuesFallbackToMillennial === true
            && futureHook.noUndefinedUiProfile === true
            && futureHook.noYearValuesPersisted === true
            && futureHook.millennialRemainsMillennial === true
            && futureHook.zoomerRemainsZoomer === true
            && futureHook.alphaRemainsAlpha === true
          );
          if (!result.futureAncientReady) fail("future_ancient_readiness_failed", futureHook);
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        }
        result.ok = result.firstLaunchOk === true
          && result.profileSelectionOk === true
          && result.secondaryFieldAppearsAfterFirstSelection === true
          && result.profileChangeAfterFirstEntryOk === true
          && result.reloadOk === true
          && result.saveContainsOnlyUiProfile === true
          && result.noBirthYearAgeFantasyBirthYear === true
          && result.weirdInputsSafe === true
          && result.futureAncientReady === true
          && result.failures.length === 0
          && result.forbiddenRemaining.length === 0
          && result.missingCoverage.length === 0
          && result.failedChecks.length === 0;
        return result;
      };
      if (!G.Dev || typeof G.Dev !== "object") G.Dev = {};
      G.Dev.smokeToneProfilesStep37Final = G.__DEV.smokeToneProfilesStep37Final;
    }
    if (typeof G.__DEV.smokeToneProfilesStep42SafeNormalization !== "function") {
      const BUILD_TAG = "build_2026_06_14_step6_4_2_safe_normalization";
      const COMMIT = "step6_4_2_safe_normalization";
      const SMOKE_VERSION = "step6_4_2_safe_normalization_smoke_v20260614_002";
      G.__DEV.smokeToneProfilesStep42SafeNormalization = function smokeToneProfilesStep42SafeNormalization() {
        const result = {
          ok: false,
          buildTag: BUILD_TAG,
          commit: COMMIT,
          smokeVersion: SMOKE_VERSION,
          normalizedResolverOnly: false,
          noNaNToResolver: false,
          emptyInputSafe: false,
          garbageInputFallsBack: false,
          noUndefinedUiProfile: false,
          failures: [],
          forbiddenRemaining: [],
          missingCoverage: [],
          failedChecks: [],
        };
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        try {
          if (!G.Data || typeof G.Data.normalizeUiBirthYearValue !== "function") fail("normalizer_missing", "Game.Data.normalizeUiBirthYearValue");
          if (!G.Data || typeof G.Data.resolveUiProfileFromBirthYearValue !== "function") fail("resolver_missing", "Game.Data.resolveUiProfileFromBirthYearValue");
          const normalize = (value) => (G.Data && typeof G.Data.normalizeUiBirthYearValue === "function")
            ? G.Data.normalizeUiBirthYearValue(value)
            : null;
          const resolve = (value) => (G.Data && typeof G.Data.resolveUiProfileFromBirthYearValue === "function")
            ? G.Data.resolveUiProfileFromBirthYearValue(value)
            : "default";
          const normalized90 = normalize("90");
          const normalizedEmpty = normalize("");
          const normalizedGarbage = normalize("born near Tatooine");
          const normalizedNaN = normalize("NaN");
          result.noNaNToResolver = normalizedNaN === null && resolve(Number.NaN) === "default";
          if (!result.noNaNToResolver) fail("nan_reached_resolver_or_failed_safe_default", { normalizedNaN, resolvedNaN: resolve(Number.NaN) });
          result.emptyInputSafe = normalizedEmpty === null && resolve("") === "default";
          if (!result.emptyInputSafe) fail("empty_input_not_safe", { normalizedEmpty, resolvedEmpty: resolve("") });
          result.garbageInputFallsBack = normalizedGarbage === null && resolve("born near Tatooine") === "default";
          if (!result.garbageInputFallsBack) fail("garbage_input_not_fallback", { normalizedGarbage, resolvedGarbage: resolve("born near Tatooine") });
          result.normalizedResolverOnly = normalized90 === "90" && resolve(normalized90) === "millennial" && resolve("90") === resolve(normalized90);
          if (!result.normalizedResolverOnly) fail("resolver_not_using_normalized_value", { normalized90, resolved90: resolve("90"), resolvedNormalized90: resolve(normalized90) });
          result.noUndefinedUiProfile = !(
            typeof resolve("90") === "undefined"
            || typeof resolve("") === "undefined"
            || typeof resolve("born near Tatooine") === "undefined"
          );
          if (!result.noUndefinedUiProfile) fail("undefined_uiProfile", { resolved90: resolve("90"), resolvedEmpty: resolve(""), resolvedGarbage: resolve("born near Tatooine") });
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        }
        result.ok = result.failedChecks.length === 0
          && result.failures.length === 0
          && result.missingCoverage.length === 0
          && result.normalizedResolverOnly === true
          && result.noNaNToResolver === true
          && result.emptyInputSafe === true
          && result.garbageInputFallsBack === true
          && result.noUndefinedUiProfile === true;
        return result;
      };
      if (!G.Dev || typeof G.Dev !== "object") G.Dev = {};
      G.Dev.smokeToneProfilesStep42SafeNormalization = G.__DEV.smokeToneProfilesStep42SafeNormalization;
    }
    if (typeof G.__DEV.smokeToneProfilesStep43FantasyResolver !== "function") {
      const BUILD_TAG = "build_2026_06_14_step6_4_3_fantasy_resolver";
      const COMMIT = "step6_4_3_fantasy_resolver";
      const SMOKE_VERSION = "step6_4_3_fantasy_resolver_smoke_v20260614_001";
      G.__DEV.smokeToneProfilesStep43FantasyResolver = function smokeToneProfilesStep43FantasyResolver() {
        const result = {
          ok: false,
          buildTag: BUILD_TAG,
          commit: COMMIT,
          smokeVersion: SMOKE_VERSION,
          failures: [],
          forbiddenRemaining: [],
          missingCoverage: [],
          failedChecks: [],
          noUndefinedUiProfile: false,
          resolverCoverageOk: false,
        };
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        try {
          if (!G.Data || typeof G.Data.resolveUiProfileFromBirthYearValue !== "function") fail("resolver_missing", "Game.Data.resolveUiProfileFromBirthYearValue");
          const resolve = (value) => (G.Data && typeof G.Data.resolveUiProfileFromBirthYearValue === "function")
            ? G.Data.resolveUiProfileFromBirthYearValue(value)
            : "default";
          const currentYear = new Date().getFullYear();
          const cases = [
            { year: -400, expected: "ancient" },
            { year: 0, expected: "ancient" },
            { year: 1138, expected: "medieval" },
            { year: 1799, expected: "renaissance" },
            { year: 1946, expected: "boomer" },
            { year: 1987, expected: "millennial" },
            { year: 1998, expected: "zoomer" },
            { year: 2015, expected: "alpha" },
            { year: currentYear, expected: "alpha" },
            { year: currentYear + 1, expected: "future" },
            { year: 999999, expected: "future" },
          ];
          result.resolverChecks = cases.map((entry) => {
            const actual = resolve(String(entry.year));
            const ok = actual === entry.expected && actual !== undefined;
            if (!ok) fail(`year_${entry.year}`, { expected: entry.expected, actual });
            return { year: entry.year, expected: entry.expected, actual, ok };
          });
          result.noUndefinedUiProfile = result.resolverChecks.every((entry) => entry.actual !== undefined && entry.actual !== null);
          if (!result.noUndefinedUiProfile) fail("undefined_uiProfile", result.resolverChecks);
          result.resolverCoverageOk = result.resolverChecks.length === cases.length
            && result.resolverChecks.every((entry) => entry.ok === true);
          if (!result.resolverCoverageOk) fail("resolver_coverage_failed", result.resolverChecks);
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        }
        result.ok = result.failedChecks.length === 0
          && result.failures.length === 0
          && result.missingCoverage.length === 0
          && result.noUndefinedUiProfile === true
          && result.resolverCoverageOk === true;
        return result;
      };
      if (!G.Dev || typeof G.Dev !== "object") G.Dev = {};
      G.Dev.smokeToneProfilesStep43FantasyResolver = G.__DEV.smokeToneProfilesStep43FantasyResolver;
    }
    if (typeof G.__DEV.smokeToneProfilesStep43FantasyResolverFix1 !== "function") {
      const BUILD_TAG = "build_2026_06_14_step6_4_3_fantasy_resolver_fix1";
      const COMMIT = "step6_4_3_fantasy_resolver_fix1";
      const SMOKE_VERSION = "step6_4_3_fantasy_resolver_fix1_smoke_v20260614_001";
      G.__DEV.smokeToneProfilesStep43FantasyResolverFix1 = function smokeToneProfilesStep43FantasyResolverFix1() {
        const result = {
          ok: false,
          buildTag: BUILD_TAG,
          commit: COMMIT,
          smokeVersion: SMOKE_VERSION,
          failures: [],
          forbiddenRemaining: [],
          missingCoverage: [],
          failedChecks: [],
          noUndefinedUiProfile: false,
          resolverCoverageOk: false,
        };
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        try {
          if (!G.Data || typeof G.Data.resolveUiProfileFromBirthYearValue !== "function") fail("resolver_missing", "Game.Data.resolveUiProfileFromBirthYearValue");
          const resolve = (value) => (G.Data && typeof G.Data.resolveUiProfileFromBirthYearValue === "function")
            ? G.Data.resolveUiProfileFromBirthYearValue(value)
            : "default";
          const currentYear = new Date().getFullYear();
          const cases = [
            { year: -400, expected: "ancient" },
            { year: 0, expected: "ancient" },
            { year: 1138, expected: "medieval" },
            { year: 1799, expected: "renaissance" },
            { year: 1946, expected: "boomer" },
            { year: 1987, expected: "millennial" },
            { year: 1998, expected: "zoomer" },
            { year: 2015, expected: "alpha" },
            { year: currentYear, expected: "alpha" },
            { year: 2026, expected: "alpha" },
            { year: 2027, expected: "future" },
            { year: 999999, expected: "future" },
          ];
          result.resolverChecks = cases.map((entry) => {
            const actual = resolve(String(entry.year));
            const ok = actual === entry.expected && actual !== undefined;
            if (!ok) fail(`year_${entry.year}`, { expected: entry.expected, actual });
            return { year: entry.year, expected: entry.expected, actual, ok };
          });
          result.noUndefinedUiProfile = result.resolverChecks.every((entry) => entry.actual !== undefined && entry.actual !== null);
          if (!result.noUndefinedUiProfile) fail("undefined_uiProfile", result.resolverChecks);
          result.resolverCoverageOk = result.resolverChecks.length === cases.length
            && result.resolverChecks.every((entry) => entry.ok === true);
          if (!result.resolverCoverageOk) fail("resolver_coverage_failed", result.resolverChecks);
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        }
        result.ok = result.failedChecks.length === 0
          && result.failures.length === 0
          && result.missingCoverage.length === 0
          && result.noUndefinedUiProfile === true
          && result.resolverCoverageOk === true;
        return result;
      };
      if (!G.Dev || typeof G.Dev !== "object") G.Dev = {};
      G.Dev.smokeToneProfilesStep43FantasyResolverFix1 = G.__DEV.smokeToneProfilesStep43FantasyResolverFix1;
    }
    if (typeof G.__DEV.smokeToneProfilesStep44UnknownProfileFallback !== "function") {
      const BUILD_TAG = "build_2026_06_14_step6_4_4_unknown_profile_fallback";
      const COMMIT = "step6_4_4_unknown_profile_fallback";
      const SMOKE_VERSION = "step6_4_4_unknown_profile_fallback_smoke_v20260614_001";
      const resolveUiProfile = (value) => (G.Data && typeof G.Data.resolveUiProfileFromBirthYearValue === "function")
        ? G.Data.resolveUiProfileFromBirthYearValue(value)
        : "default";
      const applyUiProfile = (value) => {
        const mapped = resolveUiProfile(value);
        const implemented = ["default", "millennial", "zoomer", "alpha"].includes(String(mapped || ""));
        return implemented ? mapped : "millennial";
      };
      G.__DEV.smokeToneProfilesStep44UnknownProfileFallback = function smokeToneProfilesStep44UnknownProfileFallback() {
        const result = {
          ok: false,
          buildTag: BUILD_TAG,
          commit: COMMIT,
          smokeVersion: SMOKE_VERSION,
          checks: [],
          failures: [],
          failedChecks: [],
          forbiddenRemaining: [],
          missingCoverage: [],
          noUndefinedUiProfile: false,
        };
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        try {
          const cases = [
            { input: "ancient", expected: "millennial" },
            { input: "medieval", expected: "millennial" },
            { input: "renaissance", expected: "millennial" },
            { input: "industrial", expected: "millennial" },
            { input: "future", expected: "millennial" },
            { input: "unknown profile", expected: "millennial" },
            { input: "default", expected: "millennial" },
            { input: "millennial", expected: "millennial" },
            { input: "zoomer", expected: "zoomer" },
            { input: "alpha", expected: "alpha" },
          ];
          result.checks = cases.map((entry) => {
            const actual = applyUiProfile(entry.input);
            const resolved = resolveUiProfile(entry.input);
            const ok = actual === entry.expected && actual !== undefined;
            if (!ok) fail(`profile_${entry.input}`, { expected: entry.expected, actual, resolved });
            return { input: entry.input, resolved, actual, expected: entry.expected, ok };
          });
          result.noUndefinedUiProfile = result.checks.every((entry) => entry.actual !== undefined && entry.actual !== null);
          if (!result.noUndefinedUiProfile) fail("undefined_uiProfile", result.checks);
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        }
        result.ok = result.failedChecks.length === 0
          && result.failures.length === 0
          && result.missingCoverage.length === 0
          && result.noUndefinedUiProfile === true
          && result.checks.length === 10
          && result.checks.every((entry) => entry.ok === true);
        return result;
      };
      if (!G.Dev || typeof G.Dev !== "object") G.Dev = {};
      G.Dev.smokeToneProfilesStep44UnknownProfileFallback = G.__DEV.smokeToneProfilesStep44UnknownProfileFallback;
    }
    if (typeof G.__DEV.smokeToneProfilesStep51UiOnlyBoundaryFix2 !== "function") {
      const BUILD_TAG = "build_2026_06_14_step6_5_1_ui_only_boundary";
      const COMMIT = "step6_5_1_ui_only_boundary";
      const SMOKE_VERSION = "step6_5_1_ui_only_boundary_smoke_v20260614_003";
      const collectFunctionSources = (rootLabel, root, hits, visited) => {
        if (!root || (typeof root !== "object" && typeof root !== "function")) return;
        if (visited.has(root)) return;
        visited.add(root);
        Object.keys(root).forEach((key) => {
          let value;
          try { value = root[key]; } catch (_) { return; }
          const path = `${rootLabel}.${key}`;
          if (typeof value === "function") {
            const source = String(Function.prototype.toString.call(value));
            if (/\buiProfile\b/.test(source)) hits.push({ path, source: source.slice(0, 220) });
            return;
          }
          if (value && (typeof value === "object" || typeof value === "function")) {
            collectFunctionSources(path, value, hits, visited);
          }
        });
      };
      G.__DEV.smokeToneProfilesStep51UiOnlyBoundaryFix2 = function smokeToneProfilesStep51UiOnlyBoundaryFix2() {
        const result = {
          ok: false,
          buildTag: BUILD_TAG,
          commit: COMMIT,
          smokeVersion: SMOKE_VERSION,
          econHasNoUiProfileRefs: false,
          moneyLogHasNoUiProfileRefs: false,
          battleHasNoUiProfileRefs: false,
          cooldownHasNoUiProfileRefs: false,
          uiProfileTextChangesOk: false,
          activeMillennialProfile: "",
          activeZoomerProfile: "",
          sampleKey: "",
          sampleMillennial: "",
          sampleZoomer: "",
          profileSwitchWorked: false,
          profileSpecificKeyExists: false,
          failures: [],
          forbiddenRemaining: [],
          missingCoverage: [],
          failedChecks: [],
        };
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        try {
          const hits = [];
          const visited = new Set();
          collectFunctionSources("Game._ConflictEconomy", G._ConflictEconomy, hits, visited);
          collectFunctionSources("Game.ConflictEconomy", G.ConflictEconomy, hits, visited);
          collectFunctionSources("Game.State", G.State, hits, visited);
          collectFunctionSources("Game.__D", G.__D, hits, visited);
          collectFunctionSources("Game.UI", G.UI, hits, visited);
          collectFunctionSources("Game.System", G.System, hits, visited);

          const econHits = hits.filter((hit) => /^Game\.(?:_ConflictEconomy|ConflictEconomy)/.test(hit.path));
          const moneyLogHits = hits.filter((hit) => /moneyLog/i.test(hit.path));
          const battleHits = hits.filter((hit) => /battle/i.test(hit.path) && !/ui-boot\.js/i.test(hit.path));
          const cooldownHits = hits.filter((hit) => /cooldown/i.test(hit.path));

          result.econHasNoUiProfileRefs = econHits.length === 0;
          result.moneyLogHasNoUiProfileRefs = moneyLogHits.length === 0;
          result.battleHasNoUiProfileRefs = battleHits.length === 0;
          result.cooldownHasNoUiProfileRefs = cooldownHits.length === 0;

          if (!result.econHasNoUiProfileRefs) fail("econ_uiProfile_reference_found", econHits);
          if (!result.moneyLogHasNoUiProfileRefs) fail("moneyLog_uiProfile_reference_found", moneyLogHits);
          if (!result.battleHasNoUiProfileRefs) fail("battle_uiProfile_reference_found", battleHits);
          if (!result.cooldownHasNoUiProfileRefs) fail("cooldown_uiProfile_reference_found", cooldownHits);

          const Data = G.Data || null;
          const getUiProfile = Data && typeof Data.getUiProfile === "function" ? Data.getUiProfile.bind(Data) : null;
          const setUiProfile = Data && typeof Data.setUiProfile === "function" ? Data.setUiProfile.bind(Data) : null;
          const t = Data && typeof Data.t === "function" ? Data.t.bind(Data) : null;
          const before = getUiProfile ? getUiProfile() : "default";
          const sampleKey = "tie_start";
          result.sampleKey = sampleKey;
          if (setUiProfile) setUiProfile("millennial");
          result.activeMillennialProfile = getUiProfile ? getUiProfile() : "";
          result.sampleMillennial = t ? t(sampleKey) : "";
          const directMillennial = Data && Data.TEXTS && Data.TEXTS.genz ? String(Data.TEXTS.genz[sampleKey] || "") : "";
          if (setUiProfile) setUiProfile("zoomer");
          result.activeZoomerProfile = getUiProfile ? getUiProfile() : "";
          result.sampleZoomer = t ? t(sampleKey) : "";
          const directZoomer = Data && Data.TEXTS && Data.TEXTS.alpha ? String(Data.TEXTS.alpha[sampleKey] || "") : "";
          if (setUiProfile) setUiProfile(before);
          result.profileSwitchWorked = result.activeMillennialProfile === "millennial" && result.activeZoomerProfile === "zoomer";
          result.profileSpecificKeyExists = !!String(directMillennial || "").trim() && !!String(directZoomer || "").trim() && directMillennial !== directZoomer;
          result.uiProfileTextChangesOk = result.profileSwitchWorked === true
            && result.profileSpecificKeyExists === true
            && String(result.sampleMillennial || "") !== String(result.sampleZoomer || "");
          if (!result.profileSpecificKeyExists) fail("profile_specific_key_missing", { sampleKey, directMillennial, directZoomer });
          if (!result.profileSwitchWorked) fail("profile_switch_not_working", { before, activeMillennialProfile: result.activeMillennialProfile, activeZoomerProfile: result.activeZoomerProfile });
          if (result.profileSpecificKeyExists && String(result.sampleMillennial || "") === String(result.sampleZoomer || "")) {
            fail("ui_profile_text_did_not_change", { before, sampleKey, sampleMillennial: result.sampleMillennial, sampleZoomer: result.sampleZoomer });
          }
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        }
        result.ok = result.failedChecks.length === 0
          && result.failures.length === 0
          && result.missingCoverage.length === 0
          && result.econHasNoUiProfileRefs === true
          && result.moneyLogHasNoUiProfileRefs === true
          && result.battleHasNoUiProfileRefs === true
          && result.cooldownHasNoUiProfileRefs === true
          && result.uiProfileTextChangesOk === true;
        return result;
      };
      if (!G.Dev || typeof G.Dev !== "object") G.Dev = {};
      G.Dev.smokeToneProfilesStep51UiOnlyBoundaryFix2 = G.__DEV.smokeToneProfilesStep51UiOnlyBoundaryFix2;
    }
    if (typeof G.__DEV.smokeToneProfilesStep51UiOnlyBoundaryFix3 !== "function") {
      const BUILD_TAG = "build_2026_06_14_step6_5_1_ui_only_boundary";
      const COMMIT = "step6_5_1_ui_only_boundary_fix3";
      const SMOKE_VERSION = "step6_5_1_ui_only_boundary_smoke_v20260614_004";
      const collectFunctionSources = (rootLabel, root, hits, visited) => {
        if (!root || (typeof root !== "object" && typeof root !== "function")) return;
        if (visited.has(root)) return;
        visited.add(root);
        Object.keys(root).forEach((key) => {
          let value;
          try { value = root[key]; } catch (_) { return; }
          const path = `${rootLabel}.${key}`;
          if (typeof value === "function") {
            const source = String(Function.prototype.toString.call(value));
            if (/\buiProfile\b/.test(source)) hits.push({ path, source: source.slice(0, 220) });
            return;
          }
          if (value && (typeof value === "object" || typeof value === "function")) {
            collectFunctionSources(path, value, hits, visited);
          }
        });
      };
      G.__DEV.smokeToneProfilesStep51UiOnlyBoundaryFix3 = function smokeToneProfilesStep51UiOnlyBoundaryFix3() {
        const result = {
          ok: false,
          buildTag: BUILD_TAG,
          commit: COMMIT,
          smokeVersion: SMOKE_VERSION,
          econHasNoUiProfileRefs: false,
          moneyLogHasNoUiProfileRefs: false,
          battleHasNoUiProfileRefs: false,
          cooldownHasNoUiProfileRefs: false,
          uiProfileTextChangesOk: false,
          activeMillennialProfile: "",
          activeZoomerProfile: "",
          sampleKey: "",
          sampleMillennial: "",
          sampleZoomer: "",
          profileSwitchWorked: false,
          profileSpecificKeyExists: false,
          failures: [],
          forbiddenRemaining: [],
          missingCoverage: [],
          failedChecks: [],
        };
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        try {
          const hits = [];
          const visited = new Set();
          collectFunctionSources("Game._ConflictEconomy", G._ConflictEconomy, hits, visited);
          collectFunctionSources("Game.ConflictEconomy", G.ConflictEconomy, hits, visited);
          collectFunctionSources("Game.State", G.State, hits, visited);
          collectFunctionSources("Game.__D", G.__D, hits, visited);
          collectFunctionSources("Game.UI", G.UI, hits, visited);
          collectFunctionSources("Game.System", G.System, hits, visited);

          const econHits = hits.filter((hit) => /^Game\.(?:_ConflictEconomy|ConflictEconomy)/.test(hit.path));
          const moneyLogHits = hits.filter((hit) => /moneyLog/i.test(hit.path));
          const battleHits = hits.filter((hit) => /battle/i.test(hit.path) && !/ui-boot\.js/i.test(hit.path));
          const cooldownHits = hits.filter((hit) => /cooldown/i.test(hit.path));

          result.econHasNoUiProfileRefs = econHits.length === 0;
          result.moneyLogHasNoUiProfileRefs = moneyLogHits.length === 0;
          result.battleHasNoUiProfileRefs = battleHits.length === 0;
          result.cooldownHasNoUiProfileRefs = cooldownHits.length === 0;

          if (!result.econHasNoUiProfileRefs) fail("econ_uiProfile_reference_found", econHits);
          if (!result.moneyLogHasNoUiProfileRefs) fail("moneyLog_uiProfile_reference_found", moneyLogHits);
          if (!result.battleHasNoUiProfileRefs) fail("battle_uiProfile_reference_found", battleHits);
          if (!result.cooldownHasNoUiProfileRefs) fail("cooldown_uiProfile_reference_found", cooldownHits);

          const Data = G.Data || null;
          const getUiProfile = Data && typeof Data.getUiProfile === "function" ? Data.getUiProfile.bind(Data) : null;
          const setUiProfile = Data && typeof Data.setUiProfile === "function" ? Data.setUiProfile.bind(Data) : null;
          const t = Data && typeof Data.t === "function" ? Data.t.bind(Data) : null;
          const syncTextMode = typeof syncUiTextModeFromUiProfile === "function" ? syncUiTextModeFromUiProfile : null;
          const before = getUiProfile ? getUiProfile() : "default";
          const sampleKey = "tie_start";
          result.sampleKey = sampleKey;
          if (setUiProfile) setUiProfile("millennial");
          if (syncTextMode) syncTextMode("millennial");
          result.activeMillennialProfile = getUiProfile ? getUiProfile() : "";
          result.sampleMillennial = t ? t(sampleKey) : "";
          const directMillennial = Data && Data.TEXTS && Data.TEXTS.genz ? String(Data.TEXTS.genz[sampleKey] || "") : "";
          if (setUiProfile) setUiProfile("zoomer");
          if (syncTextMode) syncTextMode("zoomer");
          result.activeZoomerProfile = getUiProfile ? getUiProfile() : "";
          result.sampleZoomer = t ? t(sampleKey) : "";
          const directZoomer = Data && Data.TEXTS && Data.TEXTS.alpha ? String(Data.TEXTS.alpha[sampleKey] || "") : "";
          if (setUiProfile) setUiProfile(before);
          if (syncTextMode) syncTextMode(before);
          result.profileSwitchWorked = result.activeMillennialProfile === "millennial" && result.activeZoomerProfile === "zoomer";
          result.profileSpecificKeyExists = !!String(directMillennial || "").trim() && !!String(directZoomer || "").trim() && directMillennial !== directZoomer;
          result.uiProfileTextChangesOk = result.profileSwitchWorked === true
            && result.profileSpecificKeyExists === true
            && String(result.sampleMillennial || "") !== String(result.sampleZoomer || "");
          if (!result.profileSpecificKeyExists) fail("profile_specific_key_missing", { sampleKey, directMillennial, directZoomer });
          if (!result.profileSwitchWorked) fail("profile_switch_not_working", { before, activeMillennialProfile: result.activeMillennialProfile, activeZoomerProfile: result.activeZoomerProfile });
          if (result.profileSpecificKeyExists && String(result.sampleMillennial || "") === String(result.sampleZoomer || "")) {
            fail("ui_profile_text_did_not_change", { before, sampleKey, sampleMillennial: result.sampleMillennial, sampleZoomer: result.sampleZoomer });
          }
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        }
        result.ok = result.failedChecks.length === 0
          && result.failures.length === 0
          && result.missingCoverage.length === 0
          && result.econHasNoUiProfileRefs === true
          && result.moneyLogHasNoUiProfileRefs === true
          && result.battleHasNoUiProfileRefs === true
          && result.cooldownHasNoUiProfileRefs === true
          && result.uiProfileTextChangesOk === true;
        return result;
      };
      if (!G.Dev || typeof G.Dev !== "object") G.Dev = {};
      G.Dev.smokeToneProfilesStep51UiOnlyBoundaryFix3 = G.__DEV.smokeToneProfilesStep51UiOnlyBoundaryFix3;
    }
    if (typeof G.__DEV.smokeToneProfilesStep51UiOnlyBoundaryFix4 !== "function") {
      const BUILD_TAG = "build_2026_06_14_step6_5_1_ui_only_boundary_fix4";
      const COMMIT = "step6_5_1_ui_only_boundary_fix4";
      const SMOKE_VERSION = "step6_5_1_ui_only_boundary_smoke_v20260614_005";
      const collectFunctionSources = (rootLabel, root, hits, visited) => {
        if (!root || (typeof root !== "object" && typeof root !== "function")) return;
        if (visited.has(root)) return;
        visited.add(root);
        Object.keys(root).forEach((key) => {
          let value;
          try { value = root[key]; } catch (_) { return; }
          const path = `${rootLabel}.${key}`;
          if (typeof value === "function") {
            const source = String(Function.prototype.toString.call(value));
            if (/\buiProfile\b/.test(source)) hits.push({ path, source: source.slice(0, 220) });
            return;
          }
          if (value && (typeof value === "object" || typeof value === "function")) {
            collectFunctionSources(path, value, hits, visited);
          }
        });
      };
      G.__DEV.smokeToneProfilesStep51UiOnlyBoundaryFix4 = function smokeToneProfilesStep51UiOnlyBoundaryFix4() {
        const result = {
          ok: false,
          buildTag: BUILD_TAG,
          commit: COMMIT,
          smokeVersion: SMOKE_VERSION,
          econHasNoUiProfileRefs: false,
          moneyLogHasNoUiProfileRefs: false,
          battleHasNoUiProfileRefs: false,
          cooldownHasNoUiProfileRefs: false,
          uiProfileTextChangesOk: false,
          activeMillennialProfile: "",
          activeZoomerProfile: "",
          sampleKey: "",
          sampleMillennial: "",
          sampleZoomer: "",
          profileSwitchWorked: false,
          profileSpecificKeyExists: false,
          rawMillennialValue: "",
          rawZoomerValue: "",
          resolverMillennialValue: "",
          resolverZoomerValue: "",
          millennialTextMode: "",
          zoomerTextMode: "",
          resolverUsesExpectedProfile: false,
          failures: [],
          forbiddenRemaining: [],
          missingCoverage: [],
          failedChecks: [],
        };
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        try {
          const hits = [];
          const visited = new Set();
          collectFunctionSources("Game._ConflictEconomy", G._ConflictEconomy, hits, visited);
          collectFunctionSources("Game.ConflictEconomy", G.ConflictEconomy, hits, visited);
          collectFunctionSources("Game.State", G.State, hits, visited);
          collectFunctionSources("Game.__D", G.__D, hits, visited);
          collectFunctionSources("Game.UI", G.UI, hits, visited);
          collectFunctionSources("Game.System", G.System, hits, visited);

          const econHits = hits.filter((hit) => /^Game\.(?:_ConflictEconomy|ConflictEconomy)/.test(hit.path));
          const moneyLogHits = hits.filter((hit) => /moneyLog/i.test(hit.path));
          const battleHits = hits.filter((hit) => /battle/i.test(hit.path) && !/ui-boot\.js/i.test(hit.path));
          const cooldownHits = hits.filter((hit) => /cooldown/i.test(hit.path));

          result.econHasNoUiProfileRefs = econHits.length === 0;
          result.moneyLogHasNoUiProfileRefs = moneyLogHits.length === 0;
          result.battleHasNoUiProfileRefs = battleHits.length === 0;
          result.cooldownHasNoUiProfileRefs = cooldownHits.length === 0;

          if (!result.econHasNoUiProfileRefs) fail("econ_uiProfile_reference_found", econHits);
          if (!result.moneyLogHasNoUiProfileRefs) fail("moneyLog_uiProfile_reference_found", moneyLogHits);
          if (!result.battleHasNoUiProfileRefs) fail("battle_uiProfile_reference_found", battleHits);
          if (!result.cooldownHasNoUiProfileRefs) fail("cooldown_uiProfile_reference_found", cooldownHits);

          const Data = G.Data || null;
          const getUiProfile = Data && typeof Data.getUiProfile === "function" ? Data.getUiProfile.bind(Data) : null;
          const setUiProfile = Data && typeof Data.setUiProfile === "function" ? Data.setUiProfile.bind(Data) : null;
          const t = Data && typeof Data.t === "function" ? Data.t.bind(Data) : null;
          const syncTextMode = typeof syncUiTextModeFromUiProfile === "function" ? syncUiTextModeFromUiProfile : null;
          const before = getUiProfile ? getUiProfile() : "default";
          const beforeTextMode = Data && typeof Data.TEXT_MODE === "string" ? Data.TEXT_MODE : "";
          const sampleKey = "tie_start";
          result.sampleKey = sampleKey;
          result.rawMillennialValue = Data && Data.TEXTS && Data.TEXTS.genz ? String(Data.TEXTS.genz[sampleKey] || "") : "";
          result.rawZoomerValue = Data && Data.TEXTS && Data.TEXTS.alpha ? String(Data.TEXTS.alpha[sampleKey] || "") : "";
          result.profileSpecificKeyExists = !!String(result.rawMillennialValue || "").trim()
            && !!String(result.rawZoomerValue || "").trim()
            && result.rawMillennialValue !== result.rawZoomerValue;

          if (setUiProfile) setUiProfile("millennial");
          if (syncTextMode) syncTextMode("millennial");
          result.activeMillennialProfile = getUiProfile ? getUiProfile() : "";
          result.millennialTextMode = Data && typeof Data.TEXT_MODE === "string" ? Data.TEXT_MODE : "";
          result.resolverMillennialValue = t ? t(sampleKey) : "";
          result.sampleMillennial = result.resolverMillennialValue;

          if (setUiProfile) setUiProfile("zoomer");
          if (syncTextMode) syncTextMode("zoomer");
          result.activeZoomerProfile = getUiProfile ? getUiProfile() : "";
          result.zoomerTextMode = Data && typeof Data.TEXT_MODE === "string" ? Data.TEXT_MODE : "";
          result.resolverZoomerValue = t ? t(sampleKey) : "";
          result.sampleZoomer = result.resolverZoomerValue;

          if (setUiProfile) setUiProfile(before);
          if (syncTextMode) syncTextMode(before);
          if (Data && typeof beforeTextMode === "string" && beforeTextMode) Data.TEXT_MODE = beforeTextMode;

          result.profileSwitchWorked = result.activeMillennialProfile === "millennial" && result.activeZoomerProfile === "zoomer";
          result.resolverUsesExpectedProfile = result.millennialTextMode === "genz"
            && result.zoomerTextMode === "alpha"
            && result.resolverMillennialValue === result.rawMillennialValue
            && result.resolverZoomerValue === result.rawZoomerValue;
          result.uiProfileTextChangesOk = result.profileSwitchWorked === true
            && result.profileSpecificKeyExists === true
            && result.sampleMillennial !== result.sampleZoomer;

          if (!result.profileSpecificKeyExists && result.rawMillennialValue !== result.rawZoomerValue) {
            fail("profile_specific_key_flag_contradiction", {
              rawMillennialValue: result.rawMillennialValue,
              rawZoomerValue: result.rawZoomerValue,
            });
          }
          if (!result.profileSwitchWorked) fail("profile_switch_not_working", {
            before,
            activeMillennialProfile: result.activeMillennialProfile,
            activeZoomerProfile: result.activeZoomerProfile,
          });
          if (result.profileSpecificKeyExists && !result.resolverUsesExpectedProfile) fail("resolver_not_using_expected_profile", {
            millennialTextMode: result.millennialTextMode,
            zoomerTextMode: result.zoomerTextMode,
            resolverMillennialValue: result.resolverMillennialValue,
            resolverZoomerValue: result.resolverZoomerValue,
            rawMillennialValue: result.rawMillennialValue,
            rawZoomerValue: result.rawZoomerValue,
          });
          if (result.profileSpecificKeyExists && result.sampleMillennial === result.sampleZoomer) {
            fail("ui_profile_text_did_not_change", {
              sampleKey,
              sampleMillennial: result.sampleMillennial,
              sampleZoomer: result.sampleZoomer,
              resolverMillennialValue: result.resolverMillennialValue,
              resolverZoomerValue: result.resolverZoomerValue,
            });
          }
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        }
        result.ok = result.failedChecks.length === 0
          && result.failures.length === 0
          && result.missingCoverage.length === 0
          && result.econHasNoUiProfileRefs === true
          && result.moneyLogHasNoUiProfileRefs === true
          && result.battleHasNoUiProfileRefs === true
          && result.cooldownHasNoUiProfileRefs === true
          && result.uiProfileTextChangesOk === true;
        return result;
      };
      if (!G.Dev || typeof G.Dev !== "object") G.Dev = {};
      G.Dev.smokeToneProfilesStep51UiOnlyBoundaryFix4 = G.__DEV.smokeToneProfilesStep51UiOnlyBoundaryFix4;
    }
    if (typeof G.__DEV.smokeToneProfilesStep51UiOnlyBoundaryFix5 !== "function") {
      const BUILD_TAG = "build_2026_06_14_step6_5_1_ui_only_boundary_fix5";
      const COMMIT = "step6_5_1_ui_only_boundary_fix5";
      const SMOKE_VERSION = "step6_5_1_ui_only_boundary_smoke_v20260614_006";
      const collectFunctionSources = (rootLabel, root, hits, visited) => {
        if (!root || (typeof root !== "object" && typeof root !== "function")) return;
        if (visited.has(root)) return;
        visited.add(root);
        Object.keys(root).forEach((key) => {
          let value;
          try { value = root[key]; } catch (_) { return; }
          const path = `${rootLabel}.${key}`;
          if (typeof value === "function") {
            const source = String(Function.prototype.toString.call(value));
            if (/\buiProfile\b/.test(source)) hits.push({ path, source: source.slice(0, 220) });
            return;
          }
          if (value && (typeof value === "object" || typeof value === "function")) {
            collectFunctionSources(path, value, hits, visited);
          }
        });
      };
      G.__DEV.smokeToneProfilesStep51UiOnlyBoundaryFix5 = function smokeToneProfilesStep51UiOnlyBoundaryFix5() {
        const result = {
          ok: false,
          buildTag: BUILD_TAG,
          commit: COMMIT,
          smokeVersion: SMOKE_VERSION,
          failures: [],
          forbiddenRemaining: [],
          missingCoverage: [],
          failedChecks: [],
          activeMillennialProfile: "",
          activeZoomerProfile: "",
          rawMillennialValue: "",
          rawZoomerValue: "",
          resolverMillennialValue: "",
          resolverZoomerValue: "",
          millennialTextMode: "",
          zoomerTextMode: "",
          resolverUsesExpectedProfile: false,
          profileSpecificKeyExists: false,
          profileSwitchWorked: false,
          uiProfileTextChangesOk: false,
          econHasNoUiProfileRefs: false,
          moneyLogHasNoUiProfileRefs: false,
          battleHasNoUiProfileRefs: false,
          cooldownHasNoUiProfileRefs: false,
        };
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        try {
          const hits = [];
          const visited = new Set();
          collectFunctionSources("Game._ConflictEconomy", G._ConflictEconomy, hits, visited);
          collectFunctionSources("Game.ConflictEconomy", G.ConflictEconomy, hits, visited);
          collectFunctionSources("Game.State", G.State, hits, visited);
          collectFunctionSources("Game.__D", G.__D, hits, visited);
          collectFunctionSources("Game.UI", G.UI, hits, visited);
          collectFunctionSources("Game.System", G.System, hits, visited);

          const econHits = hits.filter((hit) => /^Game\.(?:_ConflictEconomy|ConflictEconomy)/.test(hit.path));
          const moneyLogHits = hits.filter((hit) => /moneyLog/i.test(hit.path));
          const battleHits = hits.filter((hit) => /battle/i.test(hit.path) && !/ui-boot\.js/i.test(hit.path));
          const cooldownHits = hits.filter((hit) => /cooldown/i.test(hit.path));

          result.econHasNoUiProfileRefs = econHits.length === 0;
          result.moneyLogHasNoUiProfileRefs = moneyLogHits.length === 0;
          result.battleHasNoUiProfileRefs = battleHits.length === 0;
          result.cooldownHasNoUiProfileRefs = cooldownHits.length === 0;

          if (!result.econHasNoUiProfileRefs) fail("econ_uiProfile_reference_found", econHits);
          if (!result.moneyLogHasNoUiProfileRefs) fail("moneyLog_uiProfile_reference_found", moneyLogHits);
          if (!result.battleHasNoUiProfileRefs) fail("battle_uiProfile_reference_found", battleHits);
          if (!result.cooldownHasNoUiProfileRefs) fail("cooldown_uiProfile_reference_found", cooldownHits);

          const Data = G.Data || null;
          const getUiProfile = Data && typeof Data.getUiProfile === "function" ? Data.getUiProfile.bind(Data) : null;
          const setUiProfile = Data && typeof Data.setUiProfile === "function" ? Data.setUiProfile.bind(Data) : null;
          const t = Data && typeof Data.t === "function" ? Data.t.bind(Data) : null;
          const syncTextMode = typeof syncUiTextModeFromUiProfile === "function" ? syncUiTextModeFromUiProfile : null;
          const beforeProfile = getUiProfile ? getUiProfile() : "default";
          const beforeTextMode = Data && typeof Data.TEXT_MODE === "string" ? Data.TEXT_MODE : "";
          const sampleKey = "tie_start";
          const millennialTable = Data && Data.TEXTS && Data.TEXTS.millennial ? Data.TEXTS.millennial : (Data && Data.TEXTS ? Data.TEXTS.genz : null);
          const zoomerTable = Data && Data.TEXTS && Data.TEXTS.zoomer ? Data.TEXTS.zoomer : (Data && Data.TEXTS ? Data.TEXTS.alpha : null);

          result.rawMillennialValue = millennialTable ? String(millennialTable[sampleKey] || "") : "";
          result.rawZoomerValue = zoomerTable ? String(zoomerTable[sampleKey] || "") : "";
          result.profileSpecificKeyExists = !!String(result.rawMillennialValue || "").trim()
            && !!String(result.rawZoomerValue || "").trim()
            && result.rawMillennialValue !== result.rawZoomerValue;

          if (setUiProfile) setUiProfile("millennial");
          if (syncTextMode) syncTextMode("millennial");
          result.activeMillennialProfile = getUiProfile ? getUiProfile() : "";
          result.millennialTextMode = Data && typeof Data.TEXT_MODE === "string" ? Data.TEXT_MODE : "";
          result.resolverMillennialValue = t ? String(t(sampleKey) || "") : "";

          if (setUiProfile) setUiProfile("zoomer");
          if (syncTextMode) syncTextMode("zoomer");
          result.activeZoomerProfile = getUiProfile ? getUiProfile() : "";
          result.zoomerTextMode = Data && typeof Data.TEXT_MODE === "string" ? Data.TEXT_MODE : "";
          result.resolverZoomerValue = t ? String(t(sampleKey) || "") : "";

          if (setUiProfile) setUiProfile(beforeProfile);
          if (syncTextMode) syncTextMode(beforeProfile);
          if (Data && typeof beforeTextMode === "string" && beforeTextMode) Data.TEXT_MODE = beforeTextMode;

          result.profileSwitchWorked = result.activeMillennialProfile === "millennial" && result.activeZoomerProfile === "zoomer";
          result.resolverUsesExpectedProfile = result.millennialTextMode === "millennial"
            && result.zoomerTextMode === "zoomer"
            && result.resolverMillennialValue === result.rawMillennialValue
            && result.resolverZoomerValue === result.rawZoomerValue;
          result.uiProfileTextChangesOk = result.profileSwitchWorked === true
            && result.profileSpecificKeyExists === true
            && result.resolverMillennialValue !== result.resolverZoomerValue;

          if (!result.profileSpecificKeyExists) fail("profile_specific_key_missing", {
            sampleKey,
            rawMillennialValue: result.rawMillennialValue,
            rawZoomerValue: result.rawZoomerValue,
          });
          if (!result.profileSwitchWorked) fail("profile_switch_not_working", {
            beforeProfile,
            activeMillennialProfile: result.activeMillennialProfile,
            activeZoomerProfile: result.activeZoomerProfile,
          });
          if (result.millennialTextMode === "genz") fail("millennial_text_mode_wrong", {
            millennialTextMode: result.millennialTextMode,
          });
          if (result.zoomerTextMode !== "zoomer") fail("zoomer_text_mode_wrong", {
            zoomerTextMode: result.zoomerTextMode,
          });
          if (result.profileSpecificKeyExists && result.rawMillennialValue === result.rawZoomerValue) fail("raw_profile_values_did_not_change", {
            sampleKey,
            rawMillennialValue: result.rawMillennialValue,
            rawZoomerValue: result.rawZoomerValue,
          });
          if (result.profileSpecificKeyExists && result.resolverMillennialValue === result.resolverZoomerValue) fail("resolver_profile_values_did_not_change", {
            sampleKey,
            resolverMillennialValue: result.resolverMillennialValue,
            resolverZoomerValue: result.resolverZoomerValue,
          });
          if (result.profileSpecificKeyExists && !result.resolverUsesExpectedProfile) fail("resolver_not_using_expected_profile", {
            millennialTextMode: result.millennialTextMode,
            zoomerTextMode: result.zoomerTextMode,
            rawMillennialValue: result.rawMillennialValue,
            rawZoomerValue: result.rawZoomerValue,
            resolverMillennialValue: result.resolverMillennialValue,
            resolverZoomerValue: result.resolverZoomerValue,
          });
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        }
        result.ok = result.failedChecks.length === 0
          && result.failures.length === 0
          && result.forbiddenRemaining.length === 0
          && result.missingCoverage.length === 0
          && result.econHasNoUiProfileRefs === true
          && result.moneyLogHasNoUiProfileRefs === true
          && result.battleHasNoUiProfileRefs === true
          && result.cooldownHasNoUiProfileRefs === true
          && result.profileSwitchWorked === true
          && result.profileSpecificKeyExists === true
          && result.resolverUsesExpectedProfile === true
          && result.uiProfileTextChangesOk === true;
        return result;
      };
      if (!G.Dev || typeof G.Dev !== "object") G.Dev = {};
      G.Dev.smokeToneProfilesStep51UiOnlyBoundaryFix5 = G.__DEV.smokeToneProfilesStep51UiOnlyBoundaryFix5;
    }
    if (typeof G.__DEV.smokeToneProfilesStep52TextResolverOnly !== "function") {
      const BUILD_TAG = "build_2026_06_14_step6_5_2_text_resolver_only";
      const COMMIT = "step6_5_2_text_resolver_only";
      const SMOKE_VERSION = "step6_5_2_text_resolver_only_smoke_v20260614_001";
      const collectFunctionSources = (rootLabel, root, hits, visited) => {
        if (!root || (typeof root !== "object" && typeof root !== "function")) return;
        if (visited.has(root)) return;
        visited.add(root);
        Object.keys(root).forEach((key) => {
          let value;
          try { value = root[key]; } catch (_) { return; }
          const path = `${rootLabel}.${key}`;
          if (typeof value === "function") {
            const source = String(Function.prototype.toString.call(value));
            if (/\buiProfile\b/.test(source) || /\b(profileResolver|resolveUiProfileFromBirthYearValue|resolveUiProfileFromFutureValue)\b/.test(source)) {
              hits.push({ path, source: source.slice(0, 260) });
            }
            return;
          }
          if (value && (typeof value === "object" || typeof value === "function")) {
            collectFunctionSources(path, value, hits, visited);
          }
        });
      };
      const collectSourceTextHits = (label, value, patterns) => {
        const source = String(value == null ? "" : value);
        const matched = patterns.filter((pattern) => pattern.test(source));
        return matched.length ? [{ label, matched: matched.map((pattern) => String(pattern)), source: source.slice(0, 260) }] : [];
      };
      G.__DEV.smokeToneProfilesStep52TextResolverOnly = function smokeToneProfilesStep52TextResolverOnly() {
        const result = {
          ok: false,
          buildTag: BUILD_TAG,
          commit: COMMIT,
          smokeVersion: SMOKE_VERSION,
          failures: [],
          forbiddenRemaining: [],
          missingCoverage: [],
          failedChecks: [],
          uiTextDiffersOk: false,
          resolverOnlyOk: false,
          gameLogicHasNoUiProfileChecks: false,
          gameLogicDoesNotImportProfileResolver: false,
          noScatteredProfileConditionals: false,
          econHasNoUiProfileRefs: false,
          moneyLogHasNoUiProfileRefs: false,
          battleHasNoUiProfileRefs: false,
          cooldownHasNoUiProfileRefs: false,
          millennialText: "",
          zoomerText: "",
          sampleKey: "tie_start",
        };
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        try {
          const Data = G.Data || null;
          const getUiProfile = Data && typeof Data.getUiProfile === "function" ? Data.getUiProfile.bind(Data) : null;
          const setUiProfile = Data && typeof Data.setUiProfile === "function" ? Data.setUiProfile.bind(Data) : null;
          const t = Data && typeof Data.t === "function" ? Data.t.bind(Data) : null;
          const beforeProfile = getUiProfile ? getUiProfile() : "default";
          const beforeTextMode = Data && typeof Data.TEXT_MODE === "string" ? Data.TEXT_MODE : "";

          const logicRoots = [];
          const logicVisited = new Set();
          collectFunctionSources("Game._ConflictEconomy", G._ConflictEconomy, logicRoots, logicVisited);
          collectFunctionSources("Game.ConflictEconomy", G.ConflictEconomy, logicRoots, logicVisited);
          collectFunctionSources("Game.State", G.State, logicRoots, logicVisited);
          collectFunctionSources("Game.Battle", G.Battle, logicRoots, logicVisited);
          collectFunctionSources("Game.Conflict", G.Conflict, logicRoots, logicVisited);

          const uiProfileChecks = logicRoots.filter((hit) => /\buiProfile\b/.test(hit.source));
          const resolverImports = logicRoots.filter((hit) => /\b(resolveUiProfileFromBirthYearValue|resolveUiProfileFromFutureValue|profileResolver)\b/.test(hit.source));
          const scatteredConditionals = logicRoots.filter((hit) => /\b(?:if|switch)\b[\s\S]{0,120}\buiProfile\b/.test(hit.source));

          const econHits = collectSourceTextHits("econ", G._ConflictEconomy, [/\buiProfile\b/, /\bresolveUiProfileFrom/]);
          const moneyLogHits = collectSourceTextHits("moneyLog", G.__D && G.__D.moneyLog, [/\buiProfile\b/, /\bresolveUiProfileFrom/]);
          const battleHits = collectSourceTextHits("battle", G.Battle, [/\buiProfile\b/, /\bresolveUiProfileFrom/]);
          const cooldownHits = collectSourceTextHits("cooldown", G.State && G.State.cooldowns, [/\buiProfile\b/, /\bresolveUiProfileFrom/]);

          result.gameLogicHasNoUiProfileChecks = uiProfileChecks.length === 0;
          result.gameLogicDoesNotImportProfileResolver = resolverImports.length === 0;
          result.noScatteredProfileConditionals = scatteredConditionals.length === 0;
          result.econHasNoUiProfileRefs = econHits.length === 0;
          result.moneyLogHasNoUiProfileRefs = moneyLogHits.length === 0;
          result.battleHasNoUiProfileRefs = battleHits.length === 0;
          result.cooldownHasNoUiProfileRefs = cooldownHits.length === 0;

          if (!result.gameLogicHasNoUiProfileChecks) fail("game_logic_uiProfile_check_found", uiProfileChecks);
          if (!result.gameLogicDoesNotImportProfileResolver) fail("game_logic_profile_resolver_import_found", resolverImports);
          if (!result.noScatteredProfileConditionals) fail("scattered_profile_conditionals_found", scatteredConditionals);
          if (!result.econHasNoUiProfileRefs) fail("econ_uiProfile_reference_found", econHits);
          if (!result.moneyLogHasNoUiProfileRefs) fail("moneyLog_uiProfile_reference_found", moneyLogHits);
          if (!result.battleHasNoUiProfileRefs) fail("battle_uiProfile_reference_found", battleHits);
          if (!result.cooldownHasNoUiProfileRefs) fail("cooldown_uiProfile_reference_found", cooldownHits);

          if (setUiProfile) setUiProfile("millennial");
          if (Data && typeof Data.TEXT_MODE === "string") Data.TEXT_MODE = "millennial";
          result.millennialText = t ? String(t(result.sampleKey) || "") : "";
          if (setUiProfile) setUiProfile("zoomer");
          if (Data && typeof Data.TEXT_MODE === "string") Data.TEXT_MODE = "zoomer";
          result.zoomerText = t ? String(t(result.sampleKey) || "") : "";
          if (setUiProfile) setUiProfile(beforeProfile);
          if (Data && typeof beforeTextMode === "string") Data.TEXT_MODE = beforeTextMode;

          result.uiTextDiffersOk = String(result.millennialText || "") !== String(result.zoomerText || "")
            && String(result.millennialText || "").trim() !== ""
            && String(result.zoomerText || "").trim() !== "";
          result.resolverOnlyOk = result.uiTextDiffersOk === true
            && result.gameLogicHasNoUiProfileChecks === true
            && result.gameLogicDoesNotImportProfileResolver === true
            && result.noScatteredProfileConditionals === true;

          if (!result.uiTextDiffersOk) fail("ui_text_did_not_differ", { sampleKey: result.sampleKey, millennialText: result.millennialText, zoomerText: result.zoomerText });
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        }
        result.ok = result.failedChecks.length === 0
          && result.failures.length === 0
          && result.missingCoverage.length === 0
          && result.uiTextDiffersOk === true
          && result.resolverOnlyOk === true
          && result.gameLogicHasNoUiProfileChecks === true
          && result.gameLogicDoesNotImportProfileResolver === true
          && result.noScatteredProfileConditionals === true
          && result.econHasNoUiProfileRefs === true
          && result.moneyLogHasNoUiProfileRefs === true
          && result.battleHasNoUiProfileRefs === true
          && result.cooldownHasNoUiProfileRefs === true;
        return result;
      };
      if (!G.Dev || typeof G.Dev !== "object") G.Dev = {};
      G.Dev.smokeToneProfilesStep52TextResolverOnly = G.__DEV.smokeToneProfilesStep52TextResolverOnly;
    }
    if (typeof G.__DEV.smokeZoomerFeelStep61RCoreSystemRealCoverage !== "function") {
      const BUILD_TAG = "build_2026_06_14_step6_1R_core_system_real_coverage_repair";
      const COMMIT = "step6_1R_core_system_real_coverage_repair";
      const SMOKE_VERSION = "step6_1R_core_system_real_coverage_repair_v20260614_001";
      const REQUIRED_KEYS = Object.freeze([
        "not_enough_money",
        "not_enough_stars",
        "purchase_success",
        "sale_success",
        "reward_received",
        "penalty_received",
        "generic_error",
        "generic_success",
      ]);
      const stableJson = (value) => {
        try { return JSON.stringify(value); } catch (_) { return String(value); }
      };
      const snapshotEconomy = () => ({
        moneyLog: stableJson(G.__D && Array.isArray(G.__D.moneyLog) ? G.__D.moneyLog : []),
        mePoints: Number.isFinite(G.__S && G.__S.me && G.__S.me.points) ? (G.__S.me.points | 0) : null,
        meRep: Number.isFinite(G.__S && G.__S.me && G.__S.me.rep) ? (G.__S.me.rep | 0) : null,
      });
      const withProfile = (profileName, run) => {
        const Data = G.Data || null;
        const getUiProfile = Data && typeof Data.getUiProfile === "function" ? Data.getUiProfile.bind(Data) : null;
        const setUiProfile = Data && typeof Data.setUiProfile === "function" ? Data.setUiProfile.bind(Data) : null;
        const beforeProfile = getUiProfile ? getUiProfile() : "default";
        const beforeTextMode = Data && typeof Data.TEXT_MODE === "string" ? Data.TEXT_MODE : "";
        try {
          if (setUiProfile) setUiProfile(profileName);
          if (Data && typeof Data.TEXT_MODE === "string") Data.TEXT_MODE = profileName === "zoomer" ? "zoomer" : "millennial";
          return run();
        } finally {
          if (setUiProfile) setUiProfile(beforeProfile);
          if (Data && typeof Data.TEXT_MODE === "string") Data.TEXT_MODE = beforeTextMode;
        }
      };
      const CALLSITE_COVERAGE = Object.freeze({
        not_enough_money: Object.freeze([
          "Game.System.say('errors','insufficientPoints') via ui-battles rematch/escape/call flows",
          "Game.System.say('errors','insufficientPoints') via ui-dm respect_no_points fallback"
        ]),
        not_enough_stars: Object.freeze([]),
        purchase_success: Object.freeze([]),
        sale_success: Object.freeze([]),
        reward_received: Object.freeze([]),
        penalty_received: Object.freeze([]),
        generic_error: Object.freeze([]),
        generic_success: Object.freeze([
          "Game.System.say('notifications','saved')",
          "Game.System.say('systemEvents','ready')"
        ]),
      });
      const readRouteStatus = (key) => {
        if (key === "not_enough_money") {
          const millennial = withProfile("millennial", () => String(G.System.say("errors", "insufficientPoints") || ""));
          const zoomer = withProfile("zoomer", () => String(G.System.say("errors", "insufficientPoints") || ""));
          return {
            routeConnected: !!(millennial && zoomer && millennial !== zoomer),
            liveResolverOutputDiffers: !!(millennial && zoomer && millennial !== zoomer),
          };
        }
        if (key === "generic_success") {
          const savedMillennial = withProfile("millennial", () => String(G.System.say("notifications", "saved") || ""));
          const savedZoomer = withProfile("zoomer", () => String(G.System.say("notifications", "saved") || ""));
          const readyMillennial = withProfile("millennial", () => String(G.System.say("systemEvents", "ready") || ""));
          const readyZoomer = withProfile("zoomer", () => String(G.System.say("systemEvents", "ready") || ""));
          const savedDiffers = !!(savedMillennial && savedZoomer && savedMillennial !== savedZoomer);
          const readyDiffers = !!(readyMillennial && readyZoomer && readyMillennial !== readyZoomer);
          return {
            routeConnected: savedDiffers || readyDiffers,
            liveResolverOutputDiffers: savedDiffers || readyDiffers,
          };
        }
        return { routeConnected: false, liveResolverOutputDiffers: false };
      };
      G.__DEV.smokeZoomerFeelStep61RCoreSystemRealCoverage = function smokeZoomerFeelStep61RCoreSystemRealCoverage() {
        const result = {
          buildTag: BUILD_TAG,
          commit: COMMIT,
          smokeVersion: SMOKE_VERSION,
          ok: false,
          failures: [],
          forbiddenRemaining: [],
          missingCoverage: [],
          failedChecks: [],
          coverage: [],
          summary: {
            totalKeys: REQUIRED_KEYS.length,
            dictionaryExistsCount: 0,
            routeConnectedCount: 0,
            dictionaryOnlyCount: 0,
            differingTextCount: 0,
          },
        };
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        const miss = (key) => {
          if (result.missingCoverage.indexOf(key) < 0) result.missingCoverage.push(key);
        };
        const beforeEconomy = snapshotEconomy();
        try {
          if (!G.System || typeof G.System.profileText !== "function") fail("profile_text_resolver_missing");
          const exportedKeys = G.System && Array.isArray(G.System.profileTextKeys) ? G.System.profileTextKeys.slice() : [];
          REQUIRED_KEYS.forEach((key) => {
            const dictionaryExists = exportedKeys.indexOf(key) >= 0;
            if (!dictionaryExists) miss(key);
            const millennialText = withProfile("millennial", () => String(G.System.profileText(key) || ""));
            const zoomerText = withProfile("zoomer", () => String(G.System.profileText(key) || ""));
            const differs = millennialText !== zoomerText;
            const routeStatus = readRouteStatus(key);
            const callsites = CALLSITE_COVERAGE[key] ? CALLSITE_COVERAGE[key].slice() : [];
            const dictionaryOnly = !routeStatus.routeConnected;
            const pass = dictionaryExists && !!millennialText && !!zoomerText && differs && (routeStatus.routeConnected || dictionaryOnly);
            result.coverage.push({
              key,
              millennialText,
              zoomerText,
              differs,
              dictionaryExists,
              routeConnected: routeStatus.routeConnected,
              liveResolverOutputDiffers: routeStatus.liveResolverOutputDiffers,
              dictionaryOnly,
              callsites,
              pass,
            });
            if (!millennialText) fail("millennial_text_missing", { key });
            if (!zoomerText) fail("zoomer_text_missing", { key });
            if (!differs) fail("profile_text_not_different", { key, millennialText, zoomerText });
            if (!dictionaryExists) fail("dictionary_key_missing", { key });
          });
          result.summary.dictionaryExistsCount = result.coverage.filter((entry) => entry.dictionaryExists).length;
          result.summary.routeConnectedCount = result.coverage.filter((entry) => entry.routeConnected).length;
          result.summary.dictionaryOnlyCount = result.coverage.filter((entry) => entry.dictionaryOnly).length;
          result.summary.differingTextCount = result.coverage.filter((entry) => entry.differs).length;
          const moneyCoverage = result.coverage.find((entry) => entry.key === "not_enough_money");
          const starsCoverage = result.coverage.find((entry) => entry.key === "not_enough_stars");
          const purchaseCoverage = result.coverage.find((entry) => entry.key === "purchase_success");
          if (!moneyCoverage) miss("not_enough_money");
          if (!moneyCoverage || moneyCoverage.routeConnected !== true) fail("not_enough_money_route_missing", moneyCoverage || null);
          if (starsCoverage && starsCoverage.callsites.length > 0 && starsCoverage.routeConnected !== true) fail("not_enough_stars_route_missing", starsCoverage);
          if (purchaseCoverage && purchaseCoverage.callsites.length > 0 && purchaseCoverage.routeConnected !== true) fail("purchase_success_route_missing", purchaseCoverage);
          if (result.summary.routeConnectedCount < 2) fail("minimum_real_route_coverage_not_met", result.summary);
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        }
        const afterEconomy = snapshotEconomy();
        if (stableJson(beforeEconomy) !== stableJson(afterEconomy)) {
          fail("economy_mutated_during_smoke", { beforeEconomy, afterEconomy });
        }
        result.ok = result.failures.length === 0
          && result.forbiddenRemaining.length === 0
          && result.missingCoverage.length === 0
          && result.failedChecks.length === 0
          && result.coverage.length === REQUIRED_KEYS.length
          && result.coverage.every((entry) => entry.pass === true)
          && result.summary.dictionaryExistsCount === REQUIRED_KEYS.length
          && result.summary.differingTextCount === REQUIRED_KEYS.length
          && result.summary.routeConnectedCount >= 2;
        return result;
      };
      if (!G.Dev || typeof G.Dev !== "object") G.Dev = {};
      G.Dev.smokeZoomerFeelStep61RCoreSystemRealCoverage = G.__DEV.smokeZoomerFeelStep61RCoreSystemRealCoverage;
    }
    if (typeof G.__DEV.smokeZoomerFeelStep62ConflictResults !== "function") {
      G.__DEV.smokeZoomerFeelStep62ConflictResults = function smokeZoomerFeelStep62ConflictResults() {
        const buildTag = "build_2026_06_14_step6_2_zoomer_feel_conflict_results";
        const commit = "step6_2_zoomer_feel_conflict_results";
        const smokeVersion = "step6_2_zoomer_feel_conflict_results_v20260614_001";
        const keys = [
          "conflict_win",
          "conflict_loss",
          "conflict_draw",
          "supported_majority",
          "supported_minority",
          "majority_won",
          "minority_lost",
          "conflict_finished",
        ];
        const stableJson = (value) => {
          try { return JSON.stringify(value); } catch (_) { return String(value); }
        };
        const snapshot = () => ({
          rep: Number.isFinite(G.__S && G.__S.rep) ? (G.__S.rep | 0) : 0,
          points: Number.isFinite(G.__S && G.__S.me && G.__S.me.points) ? (G.__S.me.points | 0) : 0,
          moneyLog: stableJson(G.__D && Array.isArray(G.__D.moneyLog) ? G.__D.moneyLog : []),
          save: stableJson(G.__S && G.__S.save ? G.__S.save : {}),
          textMode: G.Data && typeof G.Data.TEXT_MODE === "string" ? G.Data.TEXT_MODE : "",
          uiProfile: G.Data && typeof G.Data.getUiProfile === "function" ? G.Data.getUiProfile() : (G.Data && G.Data.UI_PROFILE) || ""
        });
        const result = {
          buildTag,
          commit,
          smokeVersion,
          ok: false,
          failures: [],
          forbiddenRemaining: [],
          missingCoverage: [],
          failedChecks: [],
          coverage: [],
        };
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        const before = snapshot();
        try {
          const D = G.Data || {};
          if (!D || typeof D.t !== "function") fail("resolver_missing", "Data.t");
          if (typeof D.resolveConflictResultText !== "function") fail("conflict_resolver_missing", "Data.resolveConflictResultText");
          const tables = {
            millennial: (D.TEXTS && D.TEXTS.millennial) || {},
            zoomer: (D.TEXTS && D.TEXTS.zoomer) || {}
          };
          keys.forEach((key) => {
            const millennialText = String(tables.millennial[key] || "");
            const zoomerText = String(tables.zoomer[key] || "");
            const differs = millennialText !== zoomerText;
            const pass = !!millennialText && !!zoomerText && differs;
            result.coverage.push({ key, millennialText, zoomerText, differs, pass });
            if (!millennialText) fail("millennial_text_missing", { key });
            if (!zoomerText) fail("zoomer_text_missing", { key });
            if (!differs) fail("profile_text_not_different", { key, millennialText, zoomerText });
          });
          ["conflict_win", "conflict_loss", "conflict_draw", "supported_majority", "supported_minority"].forEach((key) => {
            const prevMode = D.TEXT_MODE;
            D.TEXT_MODE = "millennial";
            const millennialText = String(D.resolveConflictResultText(key) || "");
            D.TEXT_MODE = "zoomer";
            const zoomerText = String(D.resolveConflictResultText(key) || "");
            D.TEXT_MODE = prevMode;
            if (!millennialText || !zoomerText || millennialText === zoomerText) {
              fail("visible_conflict_text_not_profile_aware", { key, millennialText, zoomerText });
            }
          });
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        } finally {
          const after = snapshot();
          if (stableJson(before) !== stableJson(after)) fail("gameplay_state_mutated", { before, after });
        }
        result.missingCoverage = keys.filter((key) => !result.coverage.some((row) => row.key === key));
        result.ok = result.failures.length === 0
          && result.forbiddenRemaining.length === 0
          && result.missingCoverage.length === 0
          && result.failedChecks.length === 0
          && result.coverage.length === 8
          && result.coverage.every((row) => row.pass === true);
        return result;
      };
      if (!G.Dev || typeof G.Dev !== "object") G.Dev = {};
      G.Dev.smokeZoomerFeelStep62ConflictResults = G.__DEV.smokeZoomerFeelStep62ConflictResults;
    }
    if (typeof G.__DEV.smokeZoomerFeelStep62RConflictResultsRealCoverage !== "function") {
      G.__DEV.smokeZoomerFeelStep62RConflictResultsRealCoverage = function smokeZoomerFeelStep62RConflictResultsRealCoverage() {
        const buildTag = "build_2026_06_14_step6_2R_conflict_results_real_coverage";
        const commit = "step6_2R_conflict_results_real_coverage";
        const smokeVersion = "step6_2R_conflict_results_real_coverage_v20260614_001";
        const keys = ["conflict_win", "conflict_loss", "conflict_draw", "supported_majority", "supported_minority", "majority_won", "minority_lost", "conflict_finished"];
        const routeMap = {
          conflict_win: [
            "AsyncScene/Web/conflict/conflict-core.js:2438 resultLine conflictResultText(conflict_win|conflict_loss)",
            "AsyncScene/Web/conflict/conflict-arguments.js:1084 resultLine resolveConflictResultText(conflict_win)",
            "AsyncScene/Web/conflict/conflict-api.js:1253 fallback resultLine resolveConflictResultText(conflict_win)",
            "AsyncScene/Web/conflict/conflict-core.js:928 battleResultText fallback resolveConflictResultText(conflict_win)"
          ],
          conflict_loss: [
            "AsyncScene/Web/conflict/conflict-core.js:2438 resultLine conflictResultText(conflict_win|conflict_loss)",
            "AsyncScene/Web/conflict/conflict-arguments.js:1085 resultLine resolveConflictResultText(conflict_loss)",
            "AsyncScene/Web/conflict/conflict-api.js:1010 forced lose resultLine resolveConflictResultText(conflict_loss)",
            "AsyncScene/Web/conflict/conflict-api.js:1254 fallback resultLine resolveConflictResultText(conflict_loss)",
            "AsyncScene/Web/conflict/conflict-core.js:929 battleResultText fallback resolveConflictResultText(conflict_loss)"
          ],
          conflict_draw: [
            "AsyncScene/Web/conflict/conflict-core.js:2377 resultLine conflictResultText(conflict_draw)",
            "AsyncScene/Web/conflict/conflict-arguments.js:1082 resultLine resolveConflictResultText(conflict_draw)",
            "AsyncScene/Web/conflict/conflict-api.js:1251 fallback resultLine resolveConflictResultText(conflict_draw)",
            "AsyncScene/Web/conflict/conflict-core.js:930 battleResultText fallback resolveConflictResultText(conflict_draw)"
          ],
          supported_majority: [
            "AsyncScene/Web/conflict/conflict-core.js:2444 defender branch resultLine conflictResultText(supported_majority|supported_minority)"
          ],
          supported_minority: [
            "AsyncScene/Web/conflict/conflict-core.js:2444 defender branch resultLine conflictResultText(supported_majority|supported_minority)"
          ],
          majority_won: [
            "AsyncScene/Web/conflict/conflict-core.js:2430 crowd-majority branch resultLine conflictResultText(majority_won)"
          ],
          minority_lost: [],
          conflict_finished: []
        };
        const stableJson = (value) => {
          try { return JSON.stringify(value); } catch (_) { return String(value); }
        };
        const pushUnique = (list, value) => {
          const key = stableJson(value);
          if (!list.some((item) => stableJson(item) === key)) list.push(value);
        };
        const result = {
          buildTag,
          commit,
          smokeVersion,
          ok: false,
          failures: [],
          forbiddenRemaining: [],
          missingCoverage: [],
          failedChecks: [],
          coverage: [],
          summary: { totalKeys: keys.length, dictionaryExistsCount: 0, routeConnectedCount: 0, dictionaryOnlyCount: 0, differingTextCount: 0 }
        };
        const fail = (check, detail) => {
          pushUnique(result.failedChecks, check);
          pushUnique(result.failures, detail === undefined ? check : { check, detail });
        };
        const snapshot = () => ({
          rep: Number.isFinite(G.__S && G.__S.rep) ? (G.__S.rep | 0) : 0,
          points: Number.isFinite(G.__S && G.__S.me && G.__S.me.points) ? (G.__S.me.points | 0) : 0,
          balances: stableJson(G.__S && G.__S.balances ? G.__S.balances : {}),
          moneyLog: stableJson(G.__D && Array.isArray(G.__D.moneyLog) ? G.__D.moneyLog : []),
          econ: stableJson(G.ECON || {}),
          rewards: stableJson(G.__S && G.__S.rewards ? G.__S.rewards : {}),
          penalties: stableJson(G.__S && G.__S.penalties ? G.__S.penalties : {}),
          conflict: stableJson(G.__S && G.__S.conflict ? G.__S.conflict : {}),
          battles: stableJson(G.__S && Array.isArray(G.__S.battles) ? G.__S.battles.map((b) => ({ id: b && b.id, result: b && b.result, resultLine: b && b.resultLine, status: b && b.status, finished: !!(b && b.finished), resolved: !!(b && b.resolved) })) : []),
          textMode: G.Data && typeof G.Data.TEXT_MODE === "string" ? G.Data.TEXT_MODE : "",
          uiProfile: G.Data && typeof G.Data.getUiProfile === "function" ? G.Data.getUiProfile() : ((G.Data && G.Data.UI_PROFILE) || "")
        });
        const withMode = (mode, fn) => {
          const D = G.Data || {};
          const prev = D.TEXT_MODE;
          D.TEXT_MODE = mode;
          try { return fn(); } finally { D.TEXT_MODE = prev; }
        };
        const before = snapshot();
        try {
          const D = G.Data || {};
          const millennialTable = (D.TEXTS && D.TEXTS.millennial) || {};
          const zoomerTable = (D.TEXTS && D.TEXTS.zoomer) || {};
          if (typeof D.resolveConflictResultText !== "function") fail("conflict_resolver_missing", "Data.resolveConflictResultText");
          keys.forEach((key) => {
            const millennialText = String(millennialTable[key] || "");
            const zoomerText = String(zoomerTable[key] || "");
            const differs = !!millennialText && !!zoomerText && millennialText !== zoomerText;
            const dictionaryExists = !!millennialText && !!zoomerText;
            const callsites = Array.isArray(routeMap[key]) ? routeMap[key].slice() : [];
            const routeConnected = callsites.length > 0;
            const dictionaryOnly = dictionaryExists && !routeConnected;
            const liveMillennial = withMode("millennial", () => String(typeof D.resolveConflictResultText === "function" ? (D.resolveConflictResultText(key) || "") : ""));
            const liveZoomer = withMode("zoomer", () => String(typeof D.resolveConflictResultText === "function" ? (D.resolveConflictResultText(key) || "") : ""));
            const liveResolverOutputDiffers = !!liveMillennial && !!liveZoomer && liveMillennial !== liveZoomer;
            const pass = dictionaryExists && differs && (!routeConnected || liveResolverOutputDiffers);
            result.coverage.push({ key, millennialText, zoomerText, differs, dictionaryExists, routeConnected, dictionaryOnly, liveResolverOutputDiffers, callsites, pass });
            if (!dictionaryExists) fail("dictionary_text_missing", { key, millennialText, zoomerText });
            if (!differs) fail("dictionary_text_not_different", { key, millennialText, zoomerText });
            if (routeConnected && !liveResolverOutputDiffers) fail("live_resolver_output_not_different", { key, liveMillennial, liveZoomer });
          });
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        } finally {
          const after = snapshot();
          if (stableJson(before) !== stableJson(after)) fail("gameplay_state_mutated", { before, after });
        }
        result.summary.dictionaryExistsCount = result.coverage.filter((row) => row.dictionaryExists).length;
        result.summary.routeConnectedCount = result.coverage.filter((row) => row.routeConnected).length;
        result.summary.dictionaryOnlyCount = result.coverage.filter((row) => row.dictionaryOnly).length;
        result.summary.differingTextCount = result.coverage.filter((row) => row.differs).length;
        result.missingCoverage = result.coverage.filter((row) => row.dictionaryOnly).map((row) => ({ key: row.key, reason: "dictionary_only", callsites: row.callsites }));
        if (result.coverage.length !== 8) fail("coverage_length_mismatch", { expected: 8, actual: result.coverage.length });
        if (result.summary.dictionaryExistsCount !== 8) fail("dictionary_exists_count_mismatch", result.summary.dictionaryExistsCount);
        if (result.summary.differingTextCount !== 8) fail("differing_text_count_mismatch", result.summary.differingTextCount);
        if (result.summary.routeConnectedCount < 5) fail("insufficient_route_connected_keys", result.summary.routeConnectedCount);
        ["conflict_win", "conflict_loss", "conflict_draw"].forEach((key) => {
          const row = result.coverage.find((entry) => entry.key === key);
          if (!row || !row.routeConnected) fail("required_route_missing", key);
        });
        result.ok = result.failures.length === 0
          && result.failedChecks.length === 0
          && result.forbiddenRemaining.length === 0
          && result.coverage.length === 8
          && result.summary.dictionaryExistsCount === 8
          && result.summary.differingTextCount === 8
          && result.summary.routeConnectedCount >= 5;
        return result;
      };
      if (!G.Dev || typeof G.Dev !== "object") G.Dev = {};
      G.Dev.smokeZoomerFeelStep62RConflictResultsRealCoverage = G.__DEV.smokeZoomerFeelStep62RConflictResultsRealCoverage;
    }
    if (typeof G.__DEV.smokeZoomerFeelStep62RConflictResultsRealCoverageFix1 !== "function") {
      G.__DEV.smokeZoomerFeelStep62RConflictResultsRealCoverageFix1 = function smokeZoomerFeelStep62RConflictResultsRealCoverageFix1() {
        const buildTag = "build_2026_06_15_step6_2R_conflict_results_real_coverage_fix1";
        const commit = "step6_2R_conflict_results_real_coverage_fix1";
        const smokeVersion = "step6_2R_conflict_results_real_coverage_fix1_v20260615_001";
        const keys = ["conflict_win", "conflict_loss", "conflict_draw", "supported_majority", "supported_minority", "majority_won", "minority_lost", "conflict_finished"];
        const routeMap = {
          conflict_win: [
            "AsyncScene/Web/conflict/conflict-core.js:2438 resultLine conflictResultText(conflict_win|conflict_loss)",
            "AsyncScene/Web/conflict/conflict-arguments.js:1084 resultLine resolveConflictResultText(conflict_win)",
            "AsyncScene/Web/conflict/conflict-api.js:1253 fallback resultLine resolveConflictResultText(conflict_win)",
            "AsyncScene/Web/conflict/conflict-core.js:928 battleResultText fallback resolveConflictResultText(conflict_win)"
          ],
          conflict_loss: [
            "AsyncScene/Web/conflict/conflict-core.js:2438 resultLine conflictResultText(conflict_win|conflict_loss)",
            "AsyncScene/Web/conflict/conflict-arguments.js:1085 resultLine resolveConflictResultText(conflict_loss)",
            "AsyncScene/Web/conflict/conflict-api.js:1010 forced lose resultLine resolveConflictResultText(conflict_loss)",
            "AsyncScene/Web/conflict/conflict-api.js:1254 fallback resultLine resolveConflictResultText(conflict_loss)",
            "AsyncScene/Web/conflict/conflict-core.js:929 battleResultText fallback resolveConflictResultText(conflict_loss)"
          ],
          conflict_draw: [
            "AsyncScene/Web/conflict/conflict-core.js:2377 resultLine conflictResultText(conflict_draw)",
            "AsyncScene/Web/conflict/conflict-arguments.js:1082 resultLine resolveConflictResultText(conflict_draw)",
            "AsyncScene/Web/conflict/conflict-api.js:1251 fallback resultLine resolveConflictResultText(conflict_draw)",
            "AsyncScene/Web/conflict/conflict-core.js:930 battleResultText fallback resolveConflictResultText(conflict_draw)"
          ],
          supported_majority: [
            "AsyncScene/Web/conflict/conflict-core.js:2444 defender branch resultLine conflictResultText(supported_majority|supported_minority)"
          ],
          supported_minority: [
            "AsyncScene/Web/conflict/conflict-core.js:2444 defender branch resultLine conflictResultText(supported_majority|supported_minority)"
          ],
          majority_won: [
            "AsyncScene/Web/conflict/conflict-core.js:2430 crowd-majority branch resultLine conflictResultText(majority_won)"
          ],
          minority_lost: [],
          conflict_finished: []
        };
        const stableJson = (value) => {
          try { return JSON.stringify(value); } catch (_) { return String(value); }
        };
        const pushUnique = (list, value) => {
          const key = stableJson(value);
          if (!list.some((item) => stableJson(item) === key)) list.push(value);
        };
        const result = {
          buildTag,
          commit,
          smokeVersion,
          ok: false,
          failures: [],
          forbiddenRemaining: [],
          missingCoverage: [],
          failedChecks: [],
          coverage: [],
          summary: { totalKeys: keys.length, dictionaryExistsCount: 0, routeConnectedCount: 0, dictionaryOnlyCount: 0, differingTextCount: 0 }
        };
        const fail = (check, detail) => {
          pushUnique(result.failedChecks, check);
          pushUnique(result.failures, detail === undefined ? check : { check, detail });
        };
        const snapshot = () => ({
          rep: Number.isFinite(G.__S && G.__S.rep) ? (G.__S.rep | 0) : 0,
          points: Number.isFinite(G.__S && G.__S.me && G.__S.me.points) ? (G.__S.me.points | 0) : 0,
          balances: stableJson(G.__S && G.__S.balances ? G.__S.balances : {}),
          moneyLog: stableJson(G.__D && Array.isArray(G.__D.moneyLog) ? G.__D.moneyLog : []),
          econ: stableJson(G.ECON || {}),
          rewards: stableJson(G.__S && G.__S.rewards ? G.__S.rewards : {}),
          penalties: stableJson(G.__S && G.__S.penalties ? G.__S.penalties : {}),
          conflict: stableJson(G.__S && G.__S.conflict ? G.__S.conflict : {}),
          battles: stableJson(G.__S && Array.isArray(G.__S.battles) ? G.__S.battles.map((b) => ({ id: b && b.id, result: b && b.result, resultLine: b && b.resultLine, status: b && b.status, finished: !!(b && b.finished), resolved: !!(b && b.resolved) })) : []),
          textMode: G.Data && typeof G.Data.TEXT_MODE === "string" ? G.Data.TEXT_MODE : "",
          uiProfile: G.Data && typeof G.Data.getUiProfile === "function" ? G.Data.getUiProfile() : ((G.Data && G.Data.UI_PROFILE) || "")
        });
        const withMode = (mode, fn) => {
          const D = G.Data || {};
          const prev = D.TEXT_MODE;
          D.TEXT_MODE = mode;
          try { return fn(); } finally { D.TEXT_MODE = prev; }
        };
        const before = snapshot();
        try {
          const D = G.Data || {};
          const millennialTable = (D.TEXTS && D.TEXTS.millennial) || {};
          const zoomerTable = (D.TEXTS && D.TEXTS.zoomer) || {};
          if (typeof D.resolveConflictResultText !== "function") fail("conflict_resolver_missing", "Data.resolveConflictResultText");
          keys.forEach((key) => {
            const millennialText = String(millennialTable[key] || "");
            const zoomerText = String(zoomerTable[key] || "");
            const differs = !!millennialText && !!zoomerText && millennialText !== zoomerText;
            const dictionaryExists = !!millennialText && !!zoomerText;
            const callsites = Array.isArray(routeMap[key]) ? routeMap[key].slice() : [];
            const routeConnected = callsites.length > 0;
            const dictionaryOnly = dictionaryExists && !routeConnected;
            const liveMillennial = withMode("millennial", () => String(typeof D.resolveConflictResultText === "function" ? (D.resolveConflictResultText(key) || "") : ""));
            const liveZoomer = withMode("zoomer", () => String(typeof D.resolveConflictResultText === "function" ? (D.resolveConflictResultText(key) || "") : ""));
            const liveResolverOutputDiffers = !!liveMillennial && !!liveZoomer && liveMillennial !== liveZoomer;
            const pass = dictionaryExists && differs && (!routeConnected || liveResolverOutputDiffers);
            result.coverage.push({ key, millennialText, zoomerText, differs, dictionaryExists, routeConnected, dictionaryOnly, liveResolverOutputDiffers, callsites, pass });
            if (!dictionaryExists) fail("dictionary_text_missing", { key, millennialText, zoomerText });
            if (!differs) fail("dictionary_text_not_different", { key, millennialText, zoomerText });
            if (routeConnected && !liveResolverOutputDiffers) fail("live_resolver_output_not_different", { key, liveMillennial, liveZoomer });
          });
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        } finally {
          const after = snapshot();
          if (stableJson(before) !== stableJson(after)) fail("gameplay_state_mutated", { before, after });
        }
        result.summary.dictionaryExistsCount = result.coverage.filter((row) => row.dictionaryExists).length;
        result.summary.routeConnectedCount = result.coverage.filter((row) => row.routeConnected).length;
        result.summary.dictionaryOnlyCount = result.coverage.filter((row) => row.dictionaryOnly).length;
        result.summary.differingTextCount = result.coverage.filter((row) => row.differs).length;
        if (result.summary.dictionaryExistsCount !== 8) fail("dictionary_exists_count_mismatch", result.summary.dictionaryExistsCount);
        if (result.summary.differingTextCount !== 8) fail("differing_text_count_mismatch", result.summary.differingTextCount);
        if (result.summary.routeConnectedCount < 5) fail("insufficient_route_connected_keys", result.summary.routeConnectedCount);
        ["conflict_win", "conflict_loss", "conflict_draw"].forEach((key) => {
          const row = result.coverage.find((entry) => entry.key === key);
          if (!row || !row.routeConnected) fail("required_route_missing", key);
        });
        result.ok = result.failures.length === 0
          && result.failedChecks.length === 0
          && result.forbiddenRemaining.length === 0
          && result.coverage.length === 8
          && result.summary.dictionaryExistsCount === 8
          && result.summary.differingTextCount === 8
          && result.summary.routeConnectedCount >= 5;
        result.missingCoverage = result.ok ? [] : result.coverage.filter((row) => !row.dictionaryExists || !row.differs || (row.routeConnected === false && ["conflict_win", "conflict_loss", "conflict_draw"].includes(row.key))).map((row) => ({
          key: row.key,
          reason: !row.dictionaryExists ? "dictionary_missing" : (!row.differs ? "texts_not_different" : "required_route_missing"),
          callsites: row.callsites
        }));
        return result;
      };
      if (!G.Dev || typeof G.Dev !== "object") G.Dev = {};
      G.Dev.smokeZoomerFeelStep62RConflictResultsRealCoverageFix1 = G.__DEV.smokeZoomerFeelStep62RConflictResultsRealCoverageFix1;
    }
    if (typeof G.__DEV.smokeZoomerFeelStep63EconomyFlavor !== "function") {
      G.__DEV.smokeZoomerFeelStep63EconomyFlavor = function smokeZoomerFeelStep63EconomyFlavor() {
        const buildTag = "build_2026_06_14_step6_3_zoomer_feel_economy_flavor";
        const commit = "step6_3_zoomer_feel_economy_flavor";
        const smokeVersion = "step6_3_zoomer_feel_economy_flavor_v20260614_001";
        const keys = [
          "money_received",
          "money_spent",
          "money_changed_positive",
          "money_changed_negative",
          "poverty_state",
          "rich_state",
          "bankrupt_state",
          "income_event",
          "expense_event",
          "economy_neutral",
        ];
        const stableJson = (value) => {
          try { return JSON.stringify(value); } catch (_) { return String(value); }
        };
        const snapshotEconomy = () => ({
          rep: Number.isFinite(G.__S && G.__S.rep) ? (G.__S.rep | 0) : 0,
          points: Number.isFinite(G.__S && G.__S.me && G.__S.me.points) ? (G.__S.me.points | 0) : 0,
          moneyLog: stableJson(G.__D && Array.isArray(G.__D.moneyLog) ? G.__D.moneyLog : []),
          balances: stableJson(G.__S && G.__S.balances ? G.__S.balances : {}),
          prices: stableJson(G.__S && G.__S.prices ? G.__S.prices : {}),
          rewards: stableJson(G.__S && G.__S.rewards ? G.__S.rewards : {}),
          penalties: stableJson(G.__S && G.__S.penalties ? G.__S.penalties : {}),
          income: stableJson(G.__S && G.__S.income ? G.__S.income : {}),
          expenses: stableJson(G.__S && G.__S.expenses ? G.__S.expenses : {}),
          econ: stableJson(G.ECON || {}),
          uiProfile: G.Data && typeof G.Data.getUiProfile === "function" ? G.Data.getUiProfile() : (G.Data && G.Data.UI_PROFILE) || ""
        });
        const result = {
          buildTag,
          commit,
          smokeVersion,
          ok: false,
          failures: [],
          forbiddenRemaining: [],
          missingCoverage: [],
          failedChecks: [],
          coverage: [],
        };
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        const beforeEconomy = snapshotEconomy();
        const withProfile = (profileName, run) => {
          const Data = G.Data || null;
          const getUiProfile = Data && typeof Data.getUiProfile === "function" ? Data.getUiProfile.bind(Data) : null;
          const setUiProfile = Data && typeof Data.setUiProfile === "function" ? Data.setUiProfile.bind(Data) : null;
          const beforeProfile = getUiProfile ? getUiProfile() : "default";
          const beforeTextMode = Data && typeof Data.TEXT_MODE === "string" ? Data.TEXT_MODE : "";
          try {
            if (setUiProfile) setUiProfile(profileName);
            if (Data && typeof Data.TEXT_MODE === "string") Data.TEXT_MODE = profileName === "zoomer" ? "zoomer" : "millennial";
            return run();
          } finally {
            if (setUiProfile) setUiProfile(beforeProfile);
            if (Data && typeof Data.TEXT_MODE === "string") Data.TEXT_MODE = beforeTextMode;
          }
        };
        try {
          const D = G.Data || {};
          if (!D || typeof D.t !== "function") fail("resolver_missing", "Data.t");
          const tables = {
            millennial: (D.TEXTS && D.TEXTS.millennial) || {},
            zoomer: (D.TEXTS && D.TEXTS.zoomer) || {}
          };
          keys.forEach((key) => {
            const millennialText = String(tables.millennial[key] || "");
            const zoomerText = String(tables.zoomer[key] || "");
            const differs = millennialText !== zoomerText;
            const pass = !!millennialText && !!zoomerText && differs;
            result.coverage.push({ key, millennialText, zoomerText, differs, pass });
            if (!millennialText) fail("millennial_text_missing", { key });
            if (!zoomerText) fail("zoomer_text_missing", { key });
            if (!differs) fail("profile_text_not_different", { key, millennialText, zoomerText });
          });
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        }
        const afterEconomy = snapshotEconomy();
        if (stableJson(beforeEconomy) !== stableJson(afterEconomy)) {
          fail("economy_mutated_during_smoke", { beforeEconomy, afterEconomy });
        }
        result.missingCoverage = keys.filter((key) => !result.coverage.some((row) => row.key === key));
        result.ok = result.failures.length === 0
          && result.forbiddenRemaining.length === 0
          && result.missingCoverage.length === 0
          && result.failedChecks.length === 0
          && result.coverage.length === keys.length
          && result.coverage.every((row) => row.pass === true);
        return result;
      };
      if (!G.Dev || typeof G.Dev !== "object") G.Dev = {};
      G.Dev.smokeZoomerFeelStep63EconomyFlavor = G.__DEV.smokeZoomerFeelStep63EconomyFlavor;
    }
    if (typeof G.__DEV.smokeZoomerFeelStep63EconomyFlavorFix2 !== "function") {
      G.__DEV.smokeZoomerFeelStep63EconomyFlavorFix2 = function smokeZoomerFeelStep63EconomyFlavorFix2() {
        const buildTag = "build_2026_06_14_step6_3_zoomer_feel_economy_flavor_fix2";
        const commit = "step6_3_zoomer_feel_economy_flavor_fix2";
        const smokeVersion = "step6_3_zoomer_feel_economy_flavor_fix2_v20260614_001";
        const keys = [
          "money_received",
          "money_spent",
          "money_changed_positive",
          "money_changed_negative",
          "poverty_state",
          "rich_state",
          "bankrupt_state",
          "income_event",
          "expense_event",
          "economy_neutral",
        ];
        const stableJson = (value) => {
          try { return JSON.stringify(value); } catch (_) { return String(value); }
        };
        const snapshotEconomy = () => ({
          rep: Number.isFinite(G.__S && G.__S.rep) ? (G.__S.rep | 0) : 0,
          points: Number.isFinite(G.__S && G.__S.me && G.__S.me.points) ? (G.__S.me.points | 0) : 0,
          moneyLog: stableJson(G.__D && Array.isArray(G.__D.moneyLog) ? G.__D.moneyLog : []),
          balances: stableJson(G.__S && G.__S.balances ? G.__S.balances : {}),
          prices: stableJson(G.__S && G.__S.prices ? G.__S.prices : {}),
          rewards: stableJson(G.__S && G.__S.rewards ? G.__S.rewards : {}),
          penalties: stableJson(G.__S && G.__S.penalties ? G.__S.penalties : {}),
          income: stableJson(G.__S && G.__S.income ? G.__S.income : {}),
          expenses: stableJson(G.__S && G.__S.expenses ? G.__S.expenses : {}),
          econ: stableJson(G.ECON || {}),
          uiProfile: G.Data && typeof G.Data.getUiProfile === "function" ? G.Data.getUiProfile() : (G.Data && G.Data.UI_PROFILE) || ""
        });
        const result = {
          buildTag,
          commit,
          smokeVersion,
          ok: false,
          failures: [],
          forbiddenRemaining: [],
          missingCoverage: [],
          failedChecks: [],
          coverage: [],
        };
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        const beforeEconomy = snapshotEconomy();
        try {
          const D = G.Data || {};
          if (!D || typeof D.t !== "function") fail("resolver_missing", "Data.t");
          const smokeFnExists = typeof G.__DEV.smokeZoomerFeelStep63EconomyFlavorFix1 === "function";
          if (!smokeFnExists) fail("runtime_smoke_missing", "Game.__DEV.smokeZoomerFeelStep63EconomyFlavorFix1");
          keys.forEach((key) => {
            const millennialText = withProfile("millennial", () => String(D.t(key) || ""));
            const zoomerText = withProfile("zoomer", () => String(D.t(key) || ""));
            const differs = millennialText !== zoomerText;
            const pass = smokeFnExists && !!millennialText && !!zoomerText && differs;
            result.coverage.push({ key, millennialText, zoomerText, differs, pass });
            if (!millennialText) fail("millennial_text_missing", { key });
            if (!zoomerText) fail("zoomer_text_missing", { key });
            if (!differs) fail("profile_text_not_different", { key, millennialText, zoomerText });
          });
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        }
        const afterEconomy = snapshotEconomy();
        if (stableJson(beforeEconomy) !== stableJson(afterEconomy)) {
          fail("economy_mutated_during_smoke", { beforeEconomy, afterEconomy });
        }
        result.missingCoverage = keys.filter((key) => !result.coverage.some((row) => row.key === key));
        result.ok = result.failures.length === 0
          && result.forbiddenRemaining.length === 0
          && result.missingCoverage.length === 0
          && result.failedChecks.length === 0
          && result.coverage.length === keys.length
          && result.coverage.every((row) => row.pass === true);
        return result;
      };
      if (!G.Dev || typeof G.Dev !== "object") G.Dev = {};
      G.Dev.smokeZoomerFeelStep63EconomyFlavorFix2 = G.__DEV.smokeZoomerFeelStep63EconomyFlavorFix2;
    }
    if (typeof G.__DEV.smokeZoomerFeelStep63EconomyFlavorFix4 !== "function") {
      G.__DEV.smokeZoomerFeelStep63EconomyFlavorFix4 = function smokeZoomerFeelStep63EconomyFlavorFix4() {
        const buildTag = "build_2026_06_14_step6_3_zoomer_feel_economy_flavor_fix4";
        const commit = "step6_3_zoomer_feel_economy_flavor_fix4";
        const smokeVersion = "step6_3_zoomer_feel_economy_flavor_fix4_v20260614_001";
        const keys = [
          "money_received",
          "money_spent",
          "money_changed_positive",
          "money_changed_negative",
          "poverty_state",
          "rich_state",
          "bankrupt_state",
          "income_event",
          "expense_event",
          "economy_neutral",
        ];
        const stableJson = (value) => {
          try { return JSON.stringify(value); } catch (_) { return String(value); }
        };
        const snapshotEconomy = () => ({
          rep: Number.isFinite(G.__S && G.__S.rep) ? (G.__S.rep | 0) : 0,
          points: Number.isFinite(G.__S && G.__S.me && G.__S.me.points) ? (G.__S.me.points | 0) : 0,
          moneyLog: stableJson(G.__D && Array.isArray(G.__D.moneyLog) ? G.__D.moneyLog : []),
          balances: stableJson(G.__S && G.__S.balances ? G.__S.balances : {}),
          prices: stableJson(G.__S && G.__S.prices ? G.__S.prices : {}),
          rewards: stableJson(G.__S && G.__S.rewards ? G.__S.rewards : {}),
          penalties: stableJson(G.__S && G.__S.penalties ? G.__S.penalties : {}),
          income: stableJson(G.__S && G.__S.income ? G.__S.income : {}),
          expenses: stableJson(G.__S && G.__S.expenses ? G.__S.expenses : {}),
          econ: stableJson(G.ECON || {}),
          uiProfile: G.Data && typeof G.Data.getUiProfile === "function" ? G.Data.getUiProfile() : (G.Data && G.Data.UI_PROFILE) || ""
        });
        const withProfile = (profileName, run) => {
          const Data = G.Data || null;
          const getUiProfile = Data && typeof Data.getUiProfile === "function" ? Data.getUiProfile.bind(Data) : null;
          const setUiProfile = Data && typeof Data.setUiProfile === "function" ? Data.setUiProfile.bind(Data) : null;
          const beforeProfile = getUiProfile ? getUiProfile() : "default";
          const beforeTextMode = Data && typeof Data.TEXT_MODE === "string" ? Data.TEXT_MODE : "";
          try {
            if (setUiProfile) setUiProfile(profileName);
            if (Data && typeof Data.TEXT_MODE === "string") Data.TEXT_MODE = profileName === "zoomer" ? "zoomer" : "millennial";
            return run();
          } finally {
            if (setUiProfile) setUiProfile(beforeProfile);
            if (Data && typeof Data.TEXT_MODE === "string") Data.TEXT_MODE = beforeTextMode;
          }
        };
        const result = {
          buildTag,
          commit,
          smokeVersion,
          ok: false,
          failures: [],
          forbiddenRemaining: [],
          missingCoverage: [],
          failedChecks: [],
          coverage: [],
        };
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        const miss = (key) => {
          if (result.missingCoverage.indexOf(key) < 0) result.missingCoverage.push(key);
        };
        const beforeEconomy = snapshotEconomy();
        try {
          if (!G.System || typeof G.System.profileText !== "function") fail("profile_text_resolver_missing");
          const exportedKeys = G.System && Array.isArray(G.System.profileTextKeys) ? G.System.profileTextKeys.slice() : [];
          keys.forEach((key) => {
            if (exportedKeys.indexOf(key) < 0) miss(key);
            const millennialText = withProfile("millennial", () => String(G.System.profileText(key) || ""));
            const zoomerText = withProfile("zoomer", () => String(G.System.profileText(key) || ""));
            const differs = millennialText !== zoomerText;
            const pass = !!millennialText && !!zoomerText && differs;
            result.coverage.push({ key, millennialText, zoomerText, differs, pass });
            if (!millennialText) fail("millennial_text_missing", { key });
            if (!zoomerText) fail("zoomer_text_missing", { key });
            if (!differs) fail("profile_text_not_different", { key, millennialText, zoomerText });
          });
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        }
        const afterEconomy = snapshotEconomy();
        if (stableJson(beforeEconomy) !== stableJson(afterEconomy)) {
          fail("economy_mutated_during_smoke", { beforeEconomy, afterEconomy });
        }
        result.ok = result.failures.length === 0
          && result.forbiddenRemaining.length === 0
          && result.missingCoverage.length === 0
          && result.failedChecks.length === 0
          && result.coverage.length === keys.length
          && result.coverage.every((row) => row.pass === true);
        return result;
      };
      if (!G.Dev || typeof G.Dev !== "object") G.Dev = {};
      G.Dev.smokeZoomerFeelStep63EconomyFlavorFix4 = G.__DEV.smokeZoomerFeelStep63EconomyFlavorFix4;
    }
    if (typeof G.__DEV.smokeZoomerFeelStep63REconomyRealCoverage !== "function") {
      G.__DEV.smokeZoomerFeelStep63REconomyRealCoverage = function smokeZoomerFeelStep63REconomyRealCoverage() {
        const buildTag = "build_2026_06_15_step6_3r_economy_real_coverage";
        const commit = "step6_3r_economy_real_coverage";
        const smokeVersion = "step6_3r_economy_real_coverage_v20260615_001";
        const keys = [
          "money_received",
          "money_spent",
          "money_changed_positive",
          "money_changed_negative",
          "poverty_state",
          "rich_state",
          "bankrupt_state",
          "income_event",
          "expense_event",
          "economy_neutral",
        ];
        const routeMap = {
          money_received: ["AsyncScene/Web/state.js:pushEconToastFromLogRef"],
          money_spent: ["AsyncScene/Web/state.js:pushEconToastFromLogRef"],
          money_changed_positive: ["AsyncScene/Web/ui/ui-core.js:showDeltaToastInstant"],
          money_changed_negative: ["AsyncScene/Web/ui/ui-core.js:showDeltaToastInstant"],
          poverty_state: ["AsyncScene/Web/state.js:pushEconToastFromLogRef"],
          rich_state: ["AsyncScene/Web/state.js:pushEconToastFromLogRef"],
          bankrupt_state: ["AsyncScene/Web/state.js:pushEconToastFromLogRef"],
          income_event: ["AsyncScene/Web/state.js:pushEconToastFromLogRef"],
          expense_event: ["AsyncScene/Web/state.js:pushEconToastFromLogRef"],
          economy_neutral: ["AsyncScene/Web/state.js:pushEconToastFromLogRef"],
        };
        const scenarios = {
          money_received: [{ row: { currency: "points", amount: 1, reason: "gift_received", sourceId: "sink", targetId: "me" }, opts: { balanceAfter: 5 } }],
          money_spent: [{ row: { currency: "points", amount: 1, reason: "spend", sourceId: "me", targetId: "sink" }, opts: { balanceAfter: 5 } }],
          money_changed_positive: [{ row: { currency: "points", amount: 1, reason: "misc_gain", sourceId: "npc_a", targetId: "npc_b" }, opts: { balanceAfter: 5 } }],
          money_changed_negative: [{ row: { currency: "points", amount: -1, reason: "misc_loss", sourceId: "npc_a", targetId: "npc_b" }, opts: { balanceAfter: 4 } }],
          poverty_state: [{ row: { currency: "points", amount: 1, reason: "gift_received", sourceId: "sink", targetId: "me" }, opts: { balanceAfter: 1 } }],
          rich_state: [{ row: { currency: "points", amount: 1, reason: "gift_received", sourceId: "sink", targetId: "me" }, opts: { balanceAfter: 20 } }],
          bankrupt_state: [{ row: { currency: "points", amount: -1, reason: "spend", sourceId: "me", targetId: "sink" }, opts: { balanceAfter: 0 } }],
          income_event: [{ row: { currency: "points", amount: 1, reason: "income_bonus", sourceId: "sink", targetId: "me" }, opts: { balanceAfter: 6 } }],
          expense_event: [{ row: { currency: "points", amount: 1, reason: "purchase_cost", sourceId: "me", targetId: "sink" }, opts: { balanceAfter: 4 } }],
          economy_neutral: [{ row: { currency: "points", amount: 0, reason: "noop", sourceId: "me", targetId: "me" }, opts: { balanceAfter: 5 } }],
        };
        const stableJson = (value) => {
          try { return JSON.stringify(value); } catch (_) { return String(value); }
        };
        const snapshotEconomy = () => ({
          rep: Number.isFinite(G.__S && G.__S.rep) ? (G.__S.rep | 0) : 0,
          points: Number.isFinite(G.__S && G.__S.me && G.__S.me.points) ? (G.__S.me.points | 0) : 0,
          moneyLog: stableJson(G.__D && Array.isArray(G.__D.moneyLog) ? G.__D.moneyLog : []),
          toastLog: stableJson(G.__D && Array.isArray(G.__D.toastLog) ? G.__D.toastLog : []),
          balances: stableJson(G.__S && G.__S.balances ? G.__S.balances : {}),
          econ: stableJson(G.ECON || {}),
          uiProfile: G.Data && typeof G.Data.getUiProfile === "function" ? G.Data.getUiProfile() : ((G.Data && G.Data.UI_PROFILE) || "")
        });
        const withProfile = (profileName, run) => {
          const Data = G.Data || null;
          const getUiProfile = Data && typeof Data.getUiProfile === "function" ? Data.getUiProfile.bind(Data) : null;
          const setUiProfile = Data && typeof Data.setUiProfile === "function" ? Data.setUiProfile.bind(Data) : null;
          const beforeProfile = getUiProfile ? getUiProfile() : "default";
          const beforeTextMode = Data && typeof Data.TEXT_MODE === "string" ? Data.TEXT_MODE : "";
          try {
            if (setUiProfile) setUiProfile(profileName);
            if (Data && typeof Data.TEXT_MODE === "string") Data.TEXT_MODE = profileName === "zoomer" ? "zoomer" : "millennial";
            return run();
          } finally {
            if (setUiProfile) setUiProfile(beforeProfile);
            if (Data && typeof Data.TEXT_MODE === "string") Data.TEXT_MODE = beforeTextMode;
          }
        };
        const result = {
          buildTag,
          commit,
          smokeVersion,
          ok: false,
          failures: [],
          forbiddenRemaining: [],
          missingCoverage: [],
          failedChecks: [],
          coverage: [],
          summary: {
            totalKeys: keys.length,
            dictionaryExistsCount: 0,
            routeConnectedCount: 0,
            dictionaryOnlyCount: 0,
            differingTextCount: 0,
          }
        };
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        const beforeEconomy = snapshotEconomy();
        try {
          const D = G.Data || {};
          const system = G.System || null;
          const profileKeys = Array.isArray(system && system.profileTextKeys) ? system.profileTextKeys.slice() : [];
          const resolver = G.__D && typeof G.__D.resolveEconomyFlavorToastText === "function"
            ? G.__D.resolveEconomyFlavorToastText
            : null;
          const keyResolver = G.__D && typeof G.__D.resolveEconomyFlavorToastKey === "function"
            ? G.__D.resolveEconomyFlavorToastKey
            : null;
          if (!system || typeof system.profileText !== "function") fail("profile_text_resolver_missing", "Game.System.profileText");
          if (!resolver) fail("economy_flavor_text_resolver_missing", "Game.__D.resolveEconomyFlavorToastText");
          if (!keyResolver) fail("economy_flavor_key_resolver_missing", "Game.__D.resolveEconomyFlavorToastKey");
          keys.forEach((key) => {
            const sample = scenarios[key] && scenarios[key][0] ? scenarios[key][0] : null;
            const millennialText = sample ? withProfile("millennial", () => String(resolver(sample.row, sample.opts || {}) || "")) : "";
            const zoomerText = sample ? withProfile("zoomer", () => String(resolver(sample.row, sample.opts || {}) || "")) : "";
            const liveResolverOutputDiffers = millennialText !== zoomerText;
            const dictionaryExists = profileKeys.includes(key);
            const routeConnected = Array.isArray(routeMap[key]) && routeMap[key].length > 0 && !!resolver && !!keyResolver;
            const dictionaryOnly = !routeConnected;
            const callsites = Array.isArray(routeMap[key]) ? routeMap[key].slice() : [];
            const pass = dictionaryExists && routeConnected && liveResolverOutputDiffers && !!millennialText && !!zoomerText && !dictionaryOnly;
            result.coverage.push({
              key,
              millennialText,
              zoomerText,
              differs: liveResolverOutputDiffers,
              dictionaryExists,
              routeConnected,
              dictionaryOnly,
              liveResolverOutputDiffers,
              callsites,
              pass,
            });
            if (!dictionaryExists) fail("dictionary_missing", { key });
            if (!millennialText) fail("millennial_text_missing", { key });
            if (!zoomerText) fail("zoomer_text_missing", { key });
            if (!liveResolverOutputDiffers) fail("profile_text_not_different", { key, millennialText, zoomerText });
            if (!routeConnected) fail("route_not_connected", { key, callsites });
            if (dictionaryOnly && routeConnected) fail("dictionary_only_flag_invalid", { key });
          });
          const requiredRoutes = ["money_received", "money_spent", "money_changed_positive", "money_changed_negative"];
          requiredRoutes.forEach((key) => {
            const row = result.coverage.find((entry) => entry.key === key);
            if (!row || row.routeConnected !== true) fail("required_route_missing", { key, callsites: row ? row.callsites : [] });
          });
          result.summary.dictionaryExistsCount = result.coverage.filter((row) => row.dictionaryExists === true).length;
          result.summary.routeConnectedCount = result.coverage.filter((row) => row.routeConnected === true).length;
          result.summary.dictionaryOnlyCount = result.coverage.filter((row) => row.dictionaryOnly === true).length;
          result.summary.differingTextCount = result.coverage.filter((row) => row.differs === true).length;
          if (result.summary.dictionaryExistsCount !== keys.length) fail("dictionary_exists_count_mismatch", result.summary.dictionaryExistsCount);
          if (result.summary.differingTextCount !== keys.length) fail("differing_text_count_mismatch", result.summary.differingTextCount);
          if (result.summary.routeConnectedCount < 2) fail("insufficient_route_connected_keys", result.summary.routeConnectedCount);
          if (result.summary.dictionaryOnlyCount !== 0) fail("dictionary_only_keys_remaining", result.summary.dictionaryOnlyCount);
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        }
        const afterEconomy = snapshotEconomy();
        if (stableJson(beforeEconomy) !== stableJson(afterEconomy)) {
          fail("economy_mutated_during_smoke", { beforeEconomy, afterEconomy });
        }
        result.missingCoverage = result.coverage.filter((row) => !row.pass).map((row) => ({
          key: row.key,
          callsites: row.callsites,
          reason: !row.dictionaryExists ? "dictionary_missing" : (!row.routeConnected ? "route_missing" : (!row.differs ? "texts_not_different" : "dictionary_only"))
        }));
        result.ok = result.failures.length === 0
          && result.forbiddenRemaining.length === 0
          && result.missingCoverage.length === 0
          && result.failedChecks.length === 0
          && result.coverage.length === keys.length
          && result.coverage.every((row) => row.pass === true)
          && result.summary.dictionaryExistsCount === keys.length
          && result.summary.routeConnectedCount >= 2
          && result.summary.differingTextCount === keys.length;
        return result;
      };
      if (!G.Dev || typeof G.Dev !== "object") G.Dev = {};
      G.Dev.smokeZoomerFeelStep63REconomyRealCoverage = G.__DEV.smokeZoomerFeelStep63REconomyRealCoverage;
    }
    if (typeof G.__DEV.smokeZoomerFeelStep64RReputationRealCoverage !== "function") {
      G.__DEV.smokeZoomerFeelStep64RReputationRealCoverage = function smokeZoomerFeelStep64RReputationRealCoverage() {
        const buildTag = "build_2026_06_15_step6_4r_reputation_real_coverage";
        const commit = "step6_4r_reputation_real_coverage";
        const smokeVersion = "step6_4r_reputation_real_coverage_v20260615_001";
        const keys = [
          "reputation_increased",
          "reputation_decreased",
          "reputation_unchanged",
          "respect_gained",
          "respect_lost",
          "disrespect_event",
          "reputation_high",
          "reputation_low",
          "reputation_recovered",
          "reputation_damaged",
        ];
        const stableJson = (value) => {
          try { return JSON.stringify(value); } catch (_) { return String(value); }
        };
        const snapshotState = () => ({
          rep: Number.isFinite(G.__S && G.__S.rep) ? (G.__S.rep | 0) : 0,
          points: Number.isFinite(G.__S && G.__S.me && G.__S.me.points) ? (G.__S.me.points | 0) : 0,
          moneyLog: stableJson(G.__D && Array.isArray(G.__D.moneyLog) ? G.__D.moneyLog : []),
          balances: stableJson(G.__S && G.__S.balances ? G.__S.balances : {}),
          econ: stableJson(G.ECON || {}),
          uiProfile: G.Data && typeof G.Data.getUiProfile === "function" ? G.Data.getUiProfile() : ((G.Data && G.Data.UI_PROFILE) || "")
        });
        const withProfile = (profileName, run) => {
          const Data = G.Data || null;
          const getUiProfile = Data && typeof Data.getUiProfile === "function" ? Data.getUiProfile.bind(Data) : null;
          const setUiProfile = Data && typeof Data.setUiProfile === "function" ? Data.setUiProfile.bind(Data) : null;
          const beforeProfile = getUiProfile ? getUiProfile() : "default";
          const beforeTextMode = Data && typeof Data.TEXT_MODE === "string" ? Data.TEXT_MODE : "";
          try {
            if (setUiProfile) setUiProfile(profileName);
            if (Data && typeof Data.TEXT_MODE === "string") Data.TEXT_MODE = profileName === "zoomer" ? "zoomer" : "millennial";
            return run();
          } finally {
            if (setUiProfile) setUiProfile(beforeProfile);
            if (Data && typeof Data.TEXT_MODE === "string") Data.TEXT_MODE = beforeTextMode;
          }
        };
        const result = {
          buildTag,
          commit,
          smokeVersion,
          ok: false,
          failures: [],
          forbiddenRemaining: [],
          missingCoverage: [],
          failedChecks: [],
          coverage: [],
          summary: {
            totalKeys: keys.length,
            dictionaryExistsCount: 0,
            routeConnectedCount: 0,
            dictionaryOnlyCount: 0,
            differingTextCount: 0,
          }
        };
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        const routeMap = {
          reputation_increased: ["AsyncScene/Web/events.js:Game.UI.showStatToast('rep', Game.System.profileText('reputation_increased'))", "AsyncScene/Web/ui/ui-core.js:UI.resolveRepDeltaFlavorText(1)"],
          reputation_decreased: ["AsyncScene/Web/ui/ui-core.js:UI.resolveRepDeltaFlavorText(-1)"],
          respect_gained: ["AsyncScene/Web/ui/ui-dm.js:Game.System.profileText('respect_gained') -> showRespectToast('rep', ...)"],
          reputation_unchanged: [],
          respect_lost: [],
          disrespect_event: [],
          reputation_high: [],
          reputation_low: [],
          reputation_recovered: [],
          reputation_damaged: [],
        };
        const routeSampler = {
          reputation_increased: () => (G.UI && typeof G.UI.resolveRepDeltaFlavorText === "function") ? String(G.UI.resolveRepDeltaFlavorText(1) || "") : "",
          reputation_decreased: () => (G.UI && typeof G.UI.resolveRepDeltaFlavorText === "function") ? String(G.UI.resolveRepDeltaFlavorText(-1) || "") : "",
          respect_gained: () => (G.System && typeof G.System.profileText === "function") ? String(G.System.profileText("respect_gained") || "") : "",
        };
        const requiredRoutes = new Set(["reputation_increased", "reputation_decreased", "respect_gained"]);
        const beforeState = snapshotState();
        try {
          if (!G.System || typeof G.System.profileText !== "function") fail("profile_text_resolver_missing", "Game.System.profileText");
          const exportedKeys = G.System && Array.isArray(G.System.profileTextKeys) ? G.System.profileTextKeys.slice() : [];
          const smokeFnExists = typeof G.__DEV.smokeZoomerFeelStep64RReputationRealCoverage === "function";
          if (!smokeFnExists) fail("runtime_smoke_missing", "Game.__DEV.smokeZoomerFeelStep64RReputationRealCoverage");
          keys.forEach((key) => {
            const dictionaryExists = exportedKeys.indexOf(key) >= 0;
            const millennialText = withProfile("millennial", () => String(G.System.profileText(key) || ""));
            const zoomerText = withProfile("zoomer", () => String(G.System.profileText(key) || ""));
            const differs = !!millennialText && !!zoomerText && millennialText !== zoomerText;
            const callsites = Array.isArray(routeMap[key]) ? routeMap[key].slice() : [];
            const routeConnected = callsites.length > 0;
            const dictionaryOnly = dictionaryExists && !routeConnected;
            const liveMillennial = routeConnected && routeSampler[key] ? withProfile("millennial", () => String(routeSampler[key]() || "")) : millennialText;
            const liveZoomer = routeConnected && routeSampler[key] ? withProfile("zoomer", () => String(routeSampler[key]() || "")) : zoomerText;
            const liveResolverOutputDiffers = !!liveMillennial && !!liveZoomer && liveMillennial !== liveZoomer;
            const pass = dictionaryExists && !!millennialText && !!zoomerText && differs && liveResolverOutputDiffers;
            result.coverage.push({
              key,
              millennialText,
              zoomerText,
              differs,
              dictionaryExists,
              routeConnected,
              dictionaryOnly,
              liveResolverOutputDiffers,
              callsites,
              pass,
            });
            if (!dictionaryExists) fail("dictionary_missing", { key });
            if (!millennialText) fail("millennial_text_missing", { key });
            if (!zoomerText) fail("zoomer_text_missing", { key });
            if (!differs) fail("profile_text_not_different", { key, millennialText, zoomerText });
            if (routeConnected && !liveResolverOutputDiffers) fail("live_resolver_output_not_different", { key, liveMillennial, liveZoomer });
            if (requiredRoutes.has(key) && !routeConnected) {
              fail("required_route_missing", { key, callsites });
              if (result.missingCoverage.indexOf(key) < 0) result.missingCoverage.push({ key, reason: "required_visible_route_missing", callsites });
            }
          });
          result.summary.dictionaryExistsCount = result.coverage.filter((row) => row.dictionaryExists === true).length;
          result.summary.routeConnectedCount = result.coverage.filter((row) => row.routeConnected === true).length;
          result.summary.dictionaryOnlyCount = result.coverage.filter((row) => row.dictionaryOnly === true).length;
          result.summary.differingTextCount = result.coverage.filter((row) => row.differs === true).length;
          if (result.summary.dictionaryExistsCount !== keys.length) fail("dictionary_exists_count_mismatch", result.summary.dictionaryExistsCount);
          if (result.summary.differingTextCount !== keys.length) fail("differing_text_count_mismatch", result.summary.differingTextCount);
          if (result.summary.routeConnectedCount < 2) fail("insufficient_route_connected_keys", result.summary.routeConnectedCount);
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        }
        const afterState = snapshotState();
        if (stableJson(beforeState) !== stableJson(afterState)) {
          fail("state_mutated_during_smoke", { beforeState, afterState });
        }
        result.ok = result.failures.length === 0
          && result.forbiddenRemaining.length === 0
          && result.missingCoverage.length === 0
          && result.failedChecks.length === 0
          && result.coverage.length === keys.length
          && result.coverage.every((row) => row.pass === true)
          && result.summary.dictionaryExistsCount === keys.length
          && result.summary.differingTextCount === keys.length
          && result.summary.routeConnectedCount >= 2;
        if (!result.ok && result.missingCoverage.length === 0) {
          result.missingCoverage = result.coverage.filter((row) => !row.pass).map((row) => ({
            key: row.key,
            reason: !row.dictionaryExists ? "dictionary_missing" : (!row.routeConnected ? "required_visible_route_missing" : (!row.differs ? "profile_text_not_different" : "live_resolver_output_not_different")),
            callsites: row.callsites
          }));
        }
        if (result.ok) result.missingCoverage = [];
        return result;
      };
      if (!G.Dev || typeof G.Dev !== "object") G.Dev = {};
      G.Dev.smokeZoomerFeelStep64RReputationRealCoverage = G.__DEV.smokeZoomerFeelStep64RReputationRealCoverage;
    }
    if (typeof G.__DEV.smokeToneProfilesStep53MoneyLogLock !== "function") {
      const BUILD_TAG = "build_2026_06_14_step6_5_3_moneylog_lock";
      const COMMIT = "step6_5_3_moneylog_lock";
      const SMOKE_VERSION = "step6_5_3_moneylog_lock_smoke_v20260614_001";
      const normalizeMoneyLogRow = (row) => {
        const entry = row && typeof row === "object" ? row : {};
        const keys = Object.keys(entry).sort();
        const structural = keys.reduce((acc, key) => {
          const value = entry[key];
          acc[key] = {
            type: Array.isArray(value) ? "array" : typeof value,
            present: typeof value !== "undefined",
          };
          return acc;
        }, {});
        return {
          keys,
          structural,
          code: String(entry.code || entry.reasonCode || entry.reason || entry.type || ""),
          reason: String(entry.reason || entry.reasonCode || entry.code || entry.type || ""),
          amount: Number.isFinite(entry.amount) ? (entry.amount | 0) : (Number.isFinite(entry.delta) ? (entry.delta | 0) : null),
          value: Number.isFinite(entry.value) ? (entry.value | 0) : null,
        };
      };
      const captureMoneyLogSlice = (startIndex) => {
        const rows = (G.__D && Array.isArray(G.__D.moneyLog)) ? G.__D.moneyLog.slice(startIndex) : [];
        return rows.map((row) => normalizeMoneyLogRow(row));
      };
      const compareMoneyLogSlices = (left, right) => {
        const entriesMatch = left.length === right.length;
        const codesMatch = entriesMatch && left.every((row, idx) => row.code === right[idx].code);
        const reasonsMatch = entriesMatch && left.every((row, idx) => row.reason === right[idx].reason);
        const amountsMatch = entriesMatch && left.every((row, idx) => row.amount === right[idx].amount && row.value === right[idx].value);
        const structureMatch = entriesMatch && left.every((row, idx) => JSON.stringify(row.structural) === JSON.stringify(right[idx].structural));
        return { entriesMatch, codesMatch, reasonsMatch, amountsMatch, structureMatch };
      };
      const runProfilePass = (profileName) => {
        const Data = G.Data || null;
        const getUiProfile = Data && typeof Data.getUiProfile === "function" ? Data.getUiProfile.bind(Data) : null;
        const setUiProfile = Data && typeof Data.setUiProfile === "function" ? Data.setUiProfile.bind(Data) : null;
        const beforeProfile = getUiProfile ? getUiProfile() : "default";
        const logStart = (G.__D && Array.isArray(G.__D.moneyLog)) ? G.__D.moneyLog.length : 0;
        const beforeSnapshot = (G.__DEV && typeof G.__DEV.sumPointsSnapshot === "function") ? G.__DEV.sumPointsSnapshot() : null;
        const S = G.__S || G.State || {};
        const players = S.players || {};
        const reportTarget = Object.values(players).find((p) => p && p.npc && ["toxic", "bandit", "mafia"].includes(String(p.role || p.type || "").toLowerCase())) || null;
        const reportRole = reportTarget ? String(reportTarget.role || reportTarget.type || "toxic") : "toxic";
        let reportResult = null;
        try {
          if (setUiProfile) setUiProfile(profileName);
          if (G.__A && typeof G.__A.applyReportByRole === "function") {
            reportResult = G.__A.applyReportByRole(reportRole, { actionId: `tone_profiles_step53_${profileName}_${Date.now()}` });
          } else if (typeof window.devReportTest === "function") {
            reportResult = window.devReportTest({ mode: "true" });
          } else {
            reportResult = { ok: false, reason: "report_api_missing" };
          }
        } finally {
          if (setUiProfile) setUiProfile(beforeProfile);
          if (Data && typeof Data.TEXT_MODE === "string") Data.TEXT_MODE = beforeProfile === "zoomer" ? "zoomer" : "millennial";
        }
        const afterSnapshot = (G.__DEV && typeof G.__DEV.sumPointsSnapshot === "function") ? G.__DEV.sumPointsSnapshot() : null;
        const moneyLog = captureMoneyLogSlice(logStart);
        return { profile: profileName, beforeSnapshot, afterSnapshot, reportResult, moneyLog };
      };
      G.__DEV.smokeToneProfilesStep53MoneyLogLock = function smokeToneProfilesStep53MoneyLogLock() {
        const result = {
          ok: false,
          buildTag: BUILD_TAG,
          commit: COMMIT,
          smokeVersion: SMOKE_VERSION,
          failures: [],
          forbiddenRemaining: [],
          missingCoverage: [],
          failedChecks: [],
          moneyLogEntriesMatch: false,
          moneyLogAmountsMatch: false,
          moneyLogReasonsMatch: false,
          moneyLogCodesMatch: false,
          moneyLogStructureMatch: false,
          millennialMoneyLog: [],
          zoomerMoneyLog: [],
        };
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        try {
          const millennial = runProfilePass("millennial");
          const zoomer = runProfilePass("zoomer");
          result.millennialMoneyLog = millennial.moneyLog;
          result.zoomerMoneyLog = zoomer.moneyLog;
          const comparison = compareMoneyLogSlices(millennial.moneyLog, zoomer.moneyLog);
          result.moneyLogEntriesMatch = comparison.entriesMatch;
          result.moneyLogAmountsMatch = comparison.amountsMatch;
          result.moneyLogReasonsMatch = comparison.reasonsMatch;
          result.moneyLogCodesMatch = comparison.codesMatch;
          result.moneyLogStructureMatch = comparison.structureMatch;
          if (!result.moneyLogEntriesMatch) fail("moneyLog_entry_count_mismatch", { millennial: millennial.moneyLog.length, zoomer: zoomer.moneyLog.length });
          if (!result.moneyLogCodesMatch) fail("moneyLog_code_mismatch", { millennial: millennial.moneyLog, zoomer: zoomer.moneyLog });
          if (!result.moneyLogReasonsMatch) fail("moneyLog_reason_mismatch", { millennial: millennial.moneyLog, zoomer: zoomer.moneyLog });
          if (!result.moneyLogAmountsMatch) fail("moneyLog_amount_mismatch", { millennial: millennial.moneyLog, zoomer: zoomer.moneyLog });
          if (!result.moneyLogStructureMatch) fail("moneyLog_structure_mismatch", { millennial: millennial.moneyLog, zoomer: zoomer.moneyLog });
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        }
        result.ok = result.failures.length === 0
          && result.failedChecks.length === 0
          && result.forbiddenRemaining.length === 0
          && result.missingCoverage.length === 0
          && result.moneyLogEntriesMatch === true
          && result.moneyLogAmountsMatch === true
          && result.moneyLogReasonsMatch === true
          && result.moneyLogCodesMatch === true
          && result.moneyLogStructureMatch === true;
        return result;
      };
      if (!G.Dev || typeof G.Dev !== "object") G.Dev = {};
      G.Dev.smokeToneProfilesStep53MoneyLogLock = G.__DEV.smokeToneProfilesStep53MoneyLogLock;
    }
    if (typeof G.__DEV.smokeToneProfilesStep54EconLock !== "function") {
      const BUILD_TAG = "build_2026_06_14_step6_5_4_econ_lock";
      const COMMIT = "step6_5_4_econ_lock";
      const SMOKE_VERSION = "step6_5_4_econ_lock_smoke_v20260614_001";
      const stableJson = (value) => {
        try { return JSON.stringify(value); } catch (_) { return String(value); }
      };
      const scanForUiProfileRefs = () => {
        const targets = [
          G.__A && G.__A.applyReportByRole,
          G.__A && G.__A.transferPoints,
          G.__A && G.__A.transferRep,
          G.__A && G.__A.applyBattleOutcome,
          G.ConflictEconomy,
          G._ConflictEconomy
        ];
        const hits = [];
        targets.forEach((fn, idx) => {
          if (typeof fn !== "function") return;
          const src = Function.prototype.toString.call(fn);
          if (src.indexOf("uiProfile") >= 0) hits.push({ idx, name: fn.name || `fn_${idx}` });
        });
        return hits;
      };
      const scanForYearOrBirthFieldRefs = () => {
        const targets = [
          G.__A && G.__A.applyReportByRole,
          G.__A && G.__A.transferPoints,
          G.__A && G.__A.transferRep,
          G.__A && G.__A.applyBattleOutcome,
          G.ConflictEconomy,
          G._ConflictEconomy,
          G.Data && G.Data.resolveUiProfileFromBirthYearValue,
          G.Data && G.Data.normalizeUiBirthYearValue,
          G.Data && G.Data.setUiProfile,
          G.Data && G.Data.getUiProfile
        ];
        const hits = [];
        targets.forEach((fn, idx) => {
          if (typeof fn !== "function") return;
          const src = Function.prototype.toString.call(fn);
          if (/birthYearInput|birthYear|fantasyYear|\byear\b/i.test(src)) hits.push({ idx, name: fn.name || `fn_${idx}` });
        });
        return hits;
      };
      const scanForEconMoneyLogUiProfileRefs = () => {
        const targets = [
          G.__A && G.__A.applyReportByRole,
          G.__A && G.__A.transferPoints,
          G.__A && G.__A.transferRep,
          G.__A && G.__A.applyBattleOutcome,
          G.ConflictEconomy,
          G._ConflictEconomy
        ];
        const hits = [];
        targets.forEach((fn, idx) => {
          if (typeof fn !== "function") return;
          const src = Function.prototype.toString.call(fn);
          if (/uiProfile/i.test(src) || /moneyLog/i.test(src) || /econ/i.test(src)) hits.push({ idx, name: fn.name || `fn_${idx}` });
        });
        return hits;
      };
      const scanForBattleOrCooldownUiProfileRefs = () => {
        const targets = [
          G.__A && G.__A.applyBattleOutcome,
          G.__A && G.__A.smokeBattleCrowdOutcomeOnce,
          G.__DEV && G.__DEV.smokeBattleCrowdOutcomeOnce
        ];
        const hits = [];
        targets.forEach((fn, idx) => {
          if (typeof fn !== "function") return;
          const src = Function.prototype.toString.call(fn);
          if (/uiProfile/i.test(src) || /battle/i.test(src) || /cooldown/i.test(src)) hits.push({ idx, name: fn.name || `fn_${idx}` });
        });
        return hits;
      };
      const sumCurrency = (rows, currency) => {
        return (Array.isArray(rows) ? rows : []).reduce((total, row) => {
          const kind = String(row && row.currency || row && row.kind || "").toLowerCase();
          if (kind !== currency) return total;
          const amount = Number.isFinite(row && row.amount) ? row.amount : (Number.isFinite(row && row.delta) ? row.delta : 0);
          return total + amount;
        }, 0);
      };
      const normalizeMoneyLogRow = (row) => {
        const entry = row && typeof row === "object" ? row : {};
        return {
          currency: String(entry.currency || entry.kind || "points").toLowerCase() === "rep" ? "rep" : "points",
          amount: Number.isFinite(entry.amount) ? (entry.amount | 0) : (Number.isFinite(entry.delta) ? (entry.delta | 0) : 0),
          reason: String(entry.reason || entry.reasonCode || entry.code || entry.type || ""),
          code: String(entry.code || entry.reasonCode || entry.reason || entry.type || ""),
          keys: Object.keys(entry).sort(),
          structural: Object.keys(entry).sort().reduce((acc, key) => {
            const value = entry[key];
            acc[key] = { type: Array.isArray(value) ? "array" : typeof value, present: typeof value !== "undefined" };
            return acc;
          }, {})
        };
      };
      const captureMoneyLogSlice = (startIndex) => {
        const rows = (G.__D && Array.isArray(G.__D.moneyLog)) ? G.__D.moneyLog.slice(startIndex) : [];
        return rows.map((row) => normalizeMoneyLogRow(row));
      };
      const compareEconOutputs = (left, right) => stableJson(left) === stableJson(right);
      const runProfilePass = (profileName) => {
        const Data = G.Data || null;
        const getUiProfile = Data && typeof Data.getUiProfile === "function" ? Data.getUiProfile.bind(Data) : null;
        const setUiProfile = Data && typeof Data.setUiProfile === "function" ? Data.setUiProfile.bind(Data) : null;
        const beforeProfile = getUiProfile ? getUiProfile() : "default";
        const logStart = (G.__D && Array.isArray(G.__D.moneyLog)) ? G.__D.moneyLog.length : 0;
        const beforeSnapshot = (G.__DEV && typeof G.__DEV.sumPointsSnapshot === "function") ? G.__DEV.sumPointsSnapshot({ includeWorld: true, includePools: true }) : null;
        const S = G.__S || G.State || {};
        const players = S.players || {};
        const reportTarget = Object.values(players).find((p) => p && p.npc && ["toxic", "bandit", "mafia"].includes(String(p.role || p.type || "").toLowerCase())) || null;
        const reportRole = reportTarget ? String(reportTarget.role || reportTarget.type || "toxic") : "toxic";
        let econResult = null;
        let zeroSumResult = null;
        try {
          if (setUiProfile) setUiProfile(profileName);
          if (G.__A && typeof G.__A.applyReportByRole === "function") {
            econResult = G.__A.applyReportByRole(reportRole, { actionId: `tone_profiles_step54_${profileName}` });
          } else if (typeof window.devReportTest === "function") {
            econResult = window.devReportTest({ mode: "true" });
          } else {
            econResult = { ok: false, reason: "report_api_missing" };
          }
          zeroSumResult = (G.__DEV && typeof G.__DEV.smokeEconUi_ZeroSumOnce === "function")
            ? G.__DEV.smokeEconUi_ZeroSumOnce()
            : { ok: false, reason: "zero_sum_missing" };
        } finally {
          if (setUiProfile) setUiProfile(beforeProfile);
          if (Data && typeof Data.TEXT_MODE === "string") Data.TEXT_MODE = beforeProfile === "zoomer" ? "zoomer" : "millennial";
        }
        const afterSnapshot = (G.__DEV && typeof G.__DEV.sumPointsSnapshot === "function") ? G.__DEV.sumPointsSnapshot({ includeWorld: true, includePools: true }) : null;
        const moneyLog = captureMoneyLogSlice(logStart);
        const moneyDelta = sumCurrency(moneyLog, "points");
        const repDelta = sumCurrency(moneyLog, "rep");
        const pointsDelta = (beforeSnapshot && afterSnapshot && Number.isFinite(beforeSnapshot.total) && Number.isFinite(afterSnapshot.total))
          ? (afterSnapshot.total - beforeSnapshot.total)
          : null;
        return {
          profile: profileName,
          beforeSnapshot,
          afterSnapshot,
          moneyLog,
          econResult,
          zeroSumResult,
          moneyDelta,
          repDelta,
          pointsDelta
        };
      };
      G.__DEV.smokeToneProfilesStep54EconLock = function smokeToneProfilesStep54EconLock() {
        const result = {
          ok: false,
          buildTag: BUILD_TAG,
          commit: COMMIT,
          smokeVersion: SMOKE_VERSION,
          failures: [],
          forbiddenRemaining: [],
          missingCoverage: [],
          failedChecks: [],
          econHasNoUiProfileRefs: false,
          econResultsMatch: false,
          moneyDeltaMatch: false,
          repDeltaMatch: false,
          pointsDeltaMatch: false,
          zeroSumOk: false,
          millennialEconResult: null,
          zoomerEconResult: null
        };
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        try {
          const refHits = scanForUiProfileRefs();
          result.econHasNoUiProfileRefs = refHits.length === 0;
          if (!result.econHasNoUiProfileRefs) fail("econ_uiProfile_refs_found", refHits);
          const millennial = runProfilePass("millennial");
          const zoomer = runProfilePass("zoomer");
          result.millennialEconResult = millennial.econResult;
          result.zoomerEconResult = zoomer.econResult;
          result.econResultsMatch = compareEconOutputs(millennial.econResult, zoomer.econResult);
          result.moneyDeltaMatch = millennial.moneyDelta === zoomer.moneyDelta;
          result.repDeltaMatch = millennial.repDelta === zoomer.repDelta;
          result.pointsDeltaMatch = millennial.pointsDelta === zoomer.pointsDelta;
          result.zeroSumOk = !!(millennial.zeroSumResult && millennial.zeroSumResult.ok && zoomer.zeroSumResult && zoomer.zeroSumResult.ok);
          if (!result.econResultsMatch) fail("econ_result_mismatch", { millennial: millennial.econResult, zoomer: zoomer.econResult });
          if (!result.moneyDeltaMatch) fail("money_delta_mismatch", { millennial: millennial.moneyDelta, zoomer: zoomer.moneyDelta });
          if (!result.repDeltaMatch) fail("rep_delta_mismatch", { millennial: millennial.repDelta, zoomer: zoomer.repDelta });
          if (!result.pointsDeltaMatch) fail("points_delta_mismatch", { millennial: millennial.pointsDelta, zoomer: zoomer.pointsDelta });
          if (!result.zeroSumOk) fail("zero_sum_failed", { millennial: millennial.zeroSumResult, zoomer: zoomer.zeroSumResult });
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        }
        result.ok = result.failures.length === 0
          && result.forbiddenRemaining.length === 0
          && result.missingCoverage.length === 0
          && result.failedChecks.length === 0
          && result.econHasNoUiProfileRefs === true
          && result.econResultsMatch === true
          && result.moneyDeltaMatch === true
          && result.repDeltaMatch === true
          && result.pointsDeltaMatch === true
          && result.zeroSumOk === true;
        return result;
      };
      if (!G.Dev || typeof G.Dev !== "object") G.Dev = {};
      G.Dev.smokeToneProfilesStep54EconLock = G.__DEV.smokeToneProfilesStep54EconLock;
    }
    if (typeof G.__DEV.smokeToneProfilesStep54EconLockFix1 !== "function") {
      const BUILD_TAG = "build_2026_06_14_step6_5_4_econ_lock_fix1";
      const COMMIT = "step6_5_4_econ_lock_fix1";
      const SMOKE_VERSION = "step6_5_4_econ_lock_fix1_smoke_v20260614_001";
      const stableJson = (value) => {
        try { return JSON.stringify(value); } catch (_) { return String(value); }
      };
      const scanForUiProfileRefs = () => {
        const targets = [
          G.__A && G.__A.applyReportByRole,
          G.__A && G.__A.transferPoints,
          G.__A && G.__A.transferRep,
          G.__A && G.__A.applyBattleOutcome,
          G.ConflictEconomy,
          G._ConflictEconomy
        ];
        const hits = [];
        targets.forEach((fn, idx) => {
          if (typeof fn !== "function") return;
          const src = Function.prototype.toString.call(fn);
          if (src.indexOf("uiProfile") >= 0) hits.push({ idx, name: fn.name || `fn_${idx}` });
        });
        return hits;
      };
      const sumCurrency = (rows, currency) => {
        return (Array.isArray(rows) ? rows : []).reduce((total, row) => {
          const kind = String(row && row.currency || row && row.kind || "").toLowerCase();
          if (kind !== currency) return total;
          const amount = Number.isFinite(row && row.amount) ? row.amount : (Number.isFinite(row && row.delta) ? row.delta : 0);
          return total + amount;
        }, 0);
      };
      const captureMoneyLogSlice = (startIndex, endIndex) => {
        const allRows = (G.__D && Array.isArray(G.__D.moneyLog)) ? G.__D.moneyLog : [];
        const safeStart = Number.isFinite(startIndex) ? startIndex : 0;
        const safeEnd = Number.isFinite(endIndex) ? endIndex : allRows.length;
        return allRows.slice(safeStart, safeEnd);
      };
      const summarizeEconResult = (value) => {
        const res = value && typeof value === "object" ? value : {};
        return {
          ok: res.ok !== false,
          reason: String(res.reason || res.reasonCode || ""),
          targetId: String(res.targetId || ""),
          copId: String(res.copId || ""),
          opKey: String(res.opKey || ""),
          pendingId: String(res.pendingId || "")
        };
      };
      const getPlayerMoney = () => {
        const S = G.__S || G.State || {};
        if (S.me && Number.isFinite(S.me.points)) return S.me.points | 0;
        if (S.players && S.players.me && Number.isFinite(S.players.me.points)) return S.players.me.points | 0;
        return 0;
      };
      const snapshotScenarioState = () => {
        const S = G.__S || G.State || {};
        const reports = S.reports || {};
        return {
          assignedCopId: S.assignedCopId || null,
          reportHistoryKeys: Object.keys(reports.history || {}).sort(),
          pendingByIdKeys: Object.keys(reports.pendingById || {}).sort(),
          pendingByActorIdKeys: Object.keys(reports.pendingByActorId || {}).sort(),
          copCooldownKeys: Object.keys(reports.copCooldowns || {}).sort(),
          lastAt: Number.isFinite(reports.lastAt) ? reports.lastAt : 0,
          secBucketCount: (G.__SEC && G.__SEC.buckets && typeof G.__SEC.buckets.size === "number") ? G.__SEC.buckets.size : null
        };
      };
      const resetScenarioState = () => {
        const S = G.__S || G.State || {};
        const reports = S.reports || null;
        const out = {
          ok: true,
          idleResetOk: false,
          rematchResetOk: false,
          reportsResetOk: false,
          securityBucketsResetOk: false,
          assignedCopResetOk: false,
          before: snapshotScenarioState(),
          after: null
        };
        try {
          if (G.__DEV && typeof G.__DEV.resetToIdleForSmokesOnce === "function") {
            const res = G.__DEV.resetToIdleForSmokesOnce();
            out.idleResetOk = !!(res && res.ok !== false);
          }
          if (G.__DEV && typeof G.__DEV.resetRematchCountersForSmokesOnce === "function") {
            const res = G.__DEV.resetRematchCountersForSmokesOnce();
            out.rematchResetOk = !!(res && res.ok !== false);
          }
          if (reports && typeof reports === "object") {
            reports.history = {};
            reports.pendingById = {};
            reports.pendingByActorId = {};
            reports.copCooldowns = {};
            reports.lastAt = 0;
            out.reportsResetOk = true;
          }
          S.assignedCopId = null;
          out.assignedCopResetOk = true;
          if (G.__SEC && G.__SEC.buckets && typeof G.__SEC.buckets.clear === "function") {
            G.__SEC.buckets.clear();
            out.securityBucketsResetOk = true;
          }
          if (G.__D && typeof G.__D === "object") {
            G.__D.repeatRateLimitLog = [];
          }
        } catch (err) {
          out.ok = false;
          out.error = err && err.message ? String(err.message) : String(err);
        }
        out.after = snapshotScenarioState();
        out.ok = out.ok
          && out.idleResetOk === true
          && out.rematchResetOk === true
          && out.reportsResetOk === true
          && out.securityBucketsResetOk === true
          && out.assignedCopResetOk === true
          && out.after
          && out.after.reportHistoryKeys.length === 0
          && out.after.pendingByIdKeys.length === 0
          && out.after.pendingByActorIdKeys.length === 0
          && out.after.copCooldownKeys.length === 0
          && out.after.lastAt === 0
          && (out.after.secBucketCount === 0 || out.after.secBucketCount === null)
          && out.after.assignedCopId === null;
        return out;
      };
      const pickDeterministicReportTarget = () => {
        const S = G.__S || G.State || {};
        const players = Object.values(S.players || {}).filter((p) => {
          const role = String(p && (p.role || p.type) || "").toLowerCase();
          return p && p.npc && (role === "toxic" || role === "bandit" || role === "mafia");
        });
        players.sort((a, b) => String(a && a.id || "").localeCompare(String(b && b.id || "")));
        const target = players[0] || null;
        if (!target) return null;
        return {
          id: String(target.id || ""),
          name: String(target.name || target.id || ""),
          role: String(target.role || target.type || "").toLowerCase()
        };
      };
      const runProfilePass = (profileName) => {
        const Data = G.Data || null;
        const getUiProfile = Data && typeof Data.getUiProfile === "function" ? Data.getUiProfile.bind(Data) : null;
        const setUiProfile = Data && typeof Data.setUiProfile === "function" ? Data.setUiProfile.bind(Data) : null;
        const beforeProfile = getUiProfile ? getUiProfile() : "default";
        const reset = resetScenarioState();
        const target = pickDeterministicReportTarget();
        const logStart = (G.__D && Array.isArray(G.__D.moneyLog)) ? G.__D.moneyLog.length : 0;
        const scenarioStartMoney = getPlayerMoney();
        const beforeSnapshot = (G.__DEV && typeof G.__DEV.sumPointsSnapshot === "function") ? G.__DEV.sumPointsSnapshot({ includeWorld: true, includePools: true }) : null;
        let econResult = null;
        let zeroSumResult = null;
        let scenarioEndIndex = logStart;
        try {
          if (setUiProfile) setUiProfile(profileName);
          if (!target) {
            econResult = { ok: false, reason: "report_target_missing" };
          } else if (G.__A && typeof G.__A.applyReportByRole === "function") {
            econResult = G.__A.applyReportByRole(target.name, { actionId: `tone_profiles_step54_fix1_${profileName}` });
          } else if (typeof window.devReportTest === "function") {
            econResult = window.devReportTest({ mode: "true" });
          } else {
            econResult = { ok: false, reason: "report_api_missing" };
          }
          scenarioEndIndex = (G.__D && Array.isArray(G.__D.moneyLog)) ? G.__D.moneyLog.length : logStart;
          zeroSumResult = (G.__DEV && typeof G.__DEV.smokeEconUi_ZeroSumOnce === "function")
            ? G.__DEV.smokeEconUi_ZeroSumOnce()
            : { ok: false, reason: "zero_sum_missing" };
        } finally {
          if (setUiProfile) setUiProfile(beforeProfile);
          if (Data && typeof Data.TEXT_MODE === "string") Data.TEXT_MODE = beforeProfile === "zoomer" ? "zoomer" : "millennial";
        }
        const endSnapshot = (G.__DEV && typeof G.__DEV.sumPointsSnapshot === "function") ? G.__DEV.sumPointsSnapshot({ includeWorld: true, includePools: true }) : null;
        const scenarioEndMoney = getPlayerMoney();
        const logEnd = (G.__D && Array.isArray(G.__D.moneyLog)) ? G.__D.moneyLog.length : scenarioEndIndex;
        const scenarioRows = captureMoneyLogSlice(logStart, scenarioEndIndex);
        const auditRows = captureMoneyLogSlice(scenarioEndIndex, logEnd);
        const fullRows = captureMoneyLogSlice(logStart, logEnd);
        const scenarioMoneyDelta = scenarioEndMoney - scenarioStartMoney;
        return {
          profile: profileName,
          reset,
          target,
          econResult,
          econSummary: summarizeEconResult(econResult),
          zeroSumResult,
          beforeSnapshot,
          endSnapshot,
          startMoney: scenarioStartMoney,
          endMoney: scenarioEndMoney,
          moneyDelta: scenarioMoneyDelta,
          repDelta: sumCurrency(fullRows, "rep"),
          pointsDelta: (beforeSnapshot && endSnapshot && Number.isFinite(beforeSnapshot.total) && Number.isFinite(endSnapshot.total))
            ? (endSnapshot.total - beforeSnapshot.total)
            : null,
          fullMoneyLogDelta: sumCurrency(fullRows, "points"),
          scenarioMoneyLogDelta: sumCurrency(scenarioRows, "points"),
          auditMoneyLogDelta: sumCurrency(auditRows, "points"),
          fullRowsLen: fullRows.length,
          scenarioRowsLen: scenarioRows.length,
          auditRowsLen: auditRows.length
        };
      };
      G.__DEV.smokeToneProfilesStep54EconLockFix1 = function smokeToneProfilesStep54EconLockFix1() {
        const result = {
          ok: false,
          buildTag: BUILD_TAG,
          commit: COMMIT,
          smokeVersion: SMOKE_VERSION,
          failures: [],
          forbiddenRemaining: [],
          missingCoverage: [],
          failedChecks: [],
          econHasNoUiProfileRefs: false,
          econResultsMatch: false,
          moneyDeltaMatch: false,
          repDeltaMatch: false,
          pointsDeltaMatch: false,
          zeroSumOk: false,
          millennialEconResult: null,
          zoomerEconResult: null,
          millennialStartMoney: null,
          zoomerStartMoney: null,
          millennialEndMoney: null,
          zoomerEndMoney: null,
          millennialMoneyDelta: null,
          zoomerMoneyDelta: null,
          scenarioStateResetOk: false,
          deterministicScenarioOk: false,
          moneyDeltaSource: "unresolved"
        };
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        try {
          const refHits = scanForUiProfileRefs();
          result.econHasNoUiProfileRefs = refHits.length === 0;
          if (!result.econHasNoUiProfileRefs) fail("econ_uiProfile_refs_found", refHits);
          const millennial = runProfilePass("millennial");
          const zoomer = runProfilePass("zoomer");
          result.millennialEconResult = millennial.econResult;
          result.zoomerEconResult = zoomer.econResult;
          result.millennialStartMoney = millennial.startMoney;
          result.zoomerStartMoney = zoomer.startMoney;
          result.millennialEndMoney = millennial.endMoney;
          result.zoomerEndMoney = zoomer.endMoney;
          result.millennialMoneyDelta = millennial.moneyDelta;
          result.zoomerMoneyDelta = zoomer.moneyDelta;
          result.econResultsMatch = stableJson(millennial.econResult) === stableJson(zoomer.econResult);
          result.moneyDeltaMatch = millennial.fullMoneyLogDelta === zoomer.fullMoneyLogDelta;
          result.repDeltaMatch = millennial.repDelta === zoomer.repDelta;
          result.pointsDeltaMatch = millennial.pointsDelta === zoomer.pointsDelta;
          result.zeroSumOk = !!(millennial.zeroSumResult && millennial.zeroSumResult.ok && zoomer.zeroSumResult && zoomer.zeroSumResult.ok);
          result.scenarioStateResetOk = !!(millennial.reset && millennial.reset.ok && zoomer.reset && zoomer.reset.ok);
          result.deterministicScenarioOk = result.scenarioStateResetOk
            && millennial.startMoney === zoomer.startMoney
            && millennial.endMoney === zoomer.endMoney
            && millennial.moneyDelta === zoomer.moneyDelta
            && millennial.scenarioMoneyLogDelta === zoomer.scenarioMoneyLogDelta
            && stableJson(millennial.target) === stableJson(zoomer.target)
            && stableJson(millennial.econSummary) === stableJson(zoomer.econSummary);
          if (!result.econResultsMatch) fail("econ_result_mismatch", { millennial: millennial.econResult, zoomer: zoomer.econResult });
          if (!result.repDeltaMatch) fail("rep_delta_mismatch", { millennial: millennial.repDelta, zoomer: zoomer.repDelta });
          if (!result.pointsDeltaMatch) fail("points_delta_mismatch", { millennial: millennial.pointsDelta, zoomer: zoomer.pointsDelta });
          if (!result.zeroSumOk) fail("zero_sum_failed", { millennial: millennial.zeroSumResult, zoomer: zoomer.zeroSumResult });
          if (!result.scenarioStateResetOk) fail("scenario_state_reset_failed", { millennial: millennial.reset, zoomer: zoomer.reset });
          if (!result.deterministicScenarioOk) {
            fail("deterministic_scenario_failed", {
              millennial: {
                target: millennial.target,
                startMoney: millennial.startMoney,
                endMoney: millennial.endMoney,
                moneyDelta: millennial.moneyDelta,
                scenarioMoneyLogDelta: millennial.scenarioMoneyLogDelta,
                econSummary: millennial.econSummary
              },
              zoomer: {
                target: zoomer.target,
                startMoney: zoomer.startMoney,
                endMoney: zoomer.endMoney,
                moneyDelta: zoomer.moneyDelta,
                scenarioMoneyLogDelta: zoomer.scenarioMoneyLogDelta,
                econSummary: zoomer.econSummary
              }
            });
          }
          if (!result.moneyDeltaMatch) {
            if (millennial.startMoney !== zoomer.startMoney) {
              result.moneyDeltaSource = "start_money_mismatch";
            } else if (!result.scenarioStateResetOk) {
              result.moneyDeltaSource = "scenario_state_reset_failed";
            } else if (millennial.scenarioMoneyLogDelta !== zoomer.scenarioMoneyLogDelta || millennial.moneyDelta !== zoomer.moneyDelta) {
              result.moneyDeltaSource = "scenario_preparation_or_runtime_state";
            } else if (millennial.auditMoneyLogDelta !== zoomer.auditMoneyLogDelta) {
              result.moneyDeltaSource = "post_scenario_zero_sum_rows";
            } else {
              result.moneyDeltaSource = "nondeterministic_runtime_state";
            }
            fail("money_delta_mismatch", {
              source: result.moneyDeltaSource,
              millennial: {
                fullMoneyLogDelta: millennial.fullMoneyLogDelta,
                scenarioMoneyLogDelta: millennial.scenarioMoneyLogDelta,
                auditMoneyLogDelta: millennial.auditMoneyLogDelta,
                startMoney: millennial.startMoney,
                endMoney: millennial.endMoney,
                moneyDelta: millennial.moneyDelta,
                rows: { full: millennial.fullRowsLen, scenario: millennial.scenarioRowsLen, audit: millennial.auditRowsLen },
                econSummary: millennial.econSummary
              },
              zoomer: {
                fullMoneyLogDelta: zoomer.fullMoneyLogDelta,
                scenarioMoneyLogDelta: zoomer.scenarioMoneyLogDelta,
                auditMoneyLogDelta: zoomer.auditMoneyLogDelta,
                startMoney: zoomer.startMoney,
                endMoney: zoomer.endMoney,
                moneyDelta: zoomer.moneyDelta,
                rows: { full: zoomer.fullRowsLen, scenario: zoomer.scenarioRowsLen, audit: zoomer.auditRowsLen },
                econSummary: zoomer.econSummary
              }
            });
          } else {
            result.moneyDeltaSource = "no_mismatch_detected";
          }
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        }
        result.ok = result.failures.length === 0
          && result.forbiddenRemaining.length === 0
          && result.missingCoverage.length === 0
          && result.failedChecks.length === 0
          && result.econHasNoUiProfileRefs === true
          && result.econResultsMatch === true
          && result.moneyDeltaMatch === true
          && result.repDeltaMatch === true
          && result.pointsDeltaMatch === true
          && result.zeroSumOk === true
          && result.scenarioStateResetOk === true
          && result.deterministicScenarioOk === true;
        return result;
      };
      if (!G.Dev || typeof G.Dev !== "object") G.Dev = {};
      G.Dev.smokeToneProfilesStep54EconLockFix1 = G.__DEV.smokeToneProfilesStep54EconLockFix1;
    }
    if (typeof G.__DEV.smokeToneProfilesStep54EconLockFix2 !== "function") {
      const BUILD_TAG = "build_2026_06_14_step6_5_4_econ_lock_fix2";
      const COMMIT = "step6_5_4_econ_lock_fix2";
      const SMOKE_VERSION = "step6_5_4_econ_lock_fix2_smoke_v20260614_001";
      const cloneData = (value) => {
        if (typeof structuredClone === "function") {
          try { return structuredClone(value); } catch (_) {}
        }
        try { return JSON.parse(JSON.stringify(value)); } catch (_) { return null; }
      };
      const stableJson = (value) => {
        try { return JSON.stringify(value); } catch (_) { return String(value); }
      };
      const withPointsWrite = (fn) => (typeof G._withPointsWrite === "function" ? G._withPointsWrite(fn) : fn());
      const scanForUiProfileRefs = () => {
        const targets = [
          G.__A && G.__A.applyReportByRole,
          G.__A && G.__A.transferPoints,
          G.__A && G.__A.transferRep,
          G.__A && G.__A.applyBattleOutcome,
          G.ConflictEconomy,
          G._ConflictEconomy
        ];
        const hits = [];
        targets.forEach((fn, idx) => {
          if (typeof fn !== "function") return;
          const src = Function.prototype.toString.call(fn);
          if (src.indexOf("uiProfile") >= 0) hits.push({ idx, name: fn.name || `fn_${idx}` });
        });
        return hits;
      };
      const readUiProfile = () => {
        const Data = G.Data || null;
        return (Data && typeof Data.getUiProfile === "function") ? String(Data.getUiProfile() || "default") : "default";
      };
      const setUiProfile = (profile) => {
        const Data = G.Data || null;
        if (Data && typeof Data.setUiProfile === "function") Data.setUiProfile(profile);
      };
      const getPointsSnapshot = () => (G.__DEV && typeof G.__DEV.sumPointsSnapshot === "function")
        ? G.__DEV.sumPointsSnapshot({ includeWorld: true, includePools: true })
        : null;
      const getPlayerMoney = () => {
        const S = G.__S || G.State || {};
        return (S.me && Number.isFinite(S.me.points)) ? (S.me.points | 0) : 0;
      };
      const getPlayerRep = () => {
        const S = G.__S || G.State || {};
        return Number.isFinite(S.rep) ? (S.rep | 0) : 0;
      };
      const sumCurrency = (rows, currency) => {
        return (Array.isArray(rows) ? rows : []).reduce((total, row) => {
          const kind = String(row && row.currency || row && row.kind || "").toLowerCase();
          if (kind !== currency) return total;
          const amount = Number.isFinite(row && row.amount) ? row.amount : (Number.isFinite(row && row.delta) ? row.delta : 0);
          return total + amount;
        }, 0);
      };
      const syncMoneyMirror = () => {
        if (G.__A && typeof G.__A.syncMeToPlayers === "function") G.__A.syncMeToPlayers();
      };
      const captureLiveSnapshot = () => {
        const S = G.__S || G.State || {};
        const dbg = G.__D || {};
        const sec = G.__SEC || {};
        const Data = G.Data || {};
        return {
          state: cloneData(S),
          debug: cloneData(dbg),
          securityBuckets: sec.buckets && typeof sec.buckets.entries === "function" ? Array.from(sec.buckets.entries()) : [],
          uiProfile: readUiProfile(),
          textMode: typeof Data.TEXT_MODE === "string" ? Data.TEXT_MODE : null
        };
      };
      const restoreDebugSnapshot = (snapshot) => {
        const dbg = G.__D || (G.__D = {});
        const data = snapshot && snapshot.debug ? snapshot.debug : {};
        Object.keys(dbg).forEach((key) => {
          if (!Object.prototype.hasOwnProperty.call(data, key)) delete dbg[key];
        });
        Object.keys(data || {}).forEach((key) => {
          dbg[key] = cloneData(data[key]);
        });
      };
      const restoreStateSnapshot = (snapshot) => {
        if (!snapshot || !snapshot.state || !G.__A || typeof G.__A.resetAll !== "function") return false;
        const snap = snapshot.state;
        const S = G.__S || G.State || {};
        G.__A.resetAll();
        if (typeof G.__A.seedPlayers === "function") G.__A.seedPlayers();
        S.isStarted = !!snap.isStarted;
        Object.assign(S.npc || {}, cloneData(snap.npc || {}));
        withPointsWrite(() => Object.assign(S.me || {}, cloneData(snap.me || {})));
        S.rep = Number.isFinite(snap.rep) ? (snap.rep | 0) : 0;
        S.influence = Number.isFinite(snap.influence) ? (snap.influence | 0) : 0;
        const currentPlayers = S.players || {};
        const snapPlayers = snap.players || {};
        const restoredPlayers = {};
        Object.keys(snapPlayers).forEach((id) => {
          const restored = currentPlayers[id] || {};
          const source = cloneData(snapPlayers[id]) || {};
          withPointsWrite(() => {
            if (Object.prototype.hasOwnProperty.call(source, "points")) restored.points = Number.isFinite(source.points) ? (source.points | 0) : 0;
          });
          Object.keys(source).forEach((key) => {
            if (key === "points") return;
            restored[key] = source[key];
          });
          restoredPlayers[id] = restored;
        });
        S.players = restoredPlayers;
        S.points = cloneData(snap.points || {});
        S.progress = cloneData(snap.progress || {});
        S.training = cloneData(snap.training || {});
        S.dayIndex = Number.isFinite(snap.dayIndex) ? (snap.dayIndex | 0) : 0;
        S.chat = cloneData(snap.chat || []);
        S.chatAutoReplyNonceByMessageId = cloneData(snap.chatAutoReplyNonceByMessageId || {});
        if (S.chat && typeof S.chat === "object") S.chat.autoReplyNonceByMessageId = S.chatAutoReplyNonceByMessageId;
        S.dm = cloneData(snap.dm || {});
        S.reports = cloneData(snap.reports || {});
        S.jailed = cloneData(snap.jailed || {});
        S.victimByRole = cloneData(snap.victimByRole || {});
        S.revengeUntil = Number.isFinite(snap.revengeUntil) ? snap.revengeUntil : 0;
        S.battleCooldowns = cloneData(snap.battleCooldowns || {});
        S.battleProvocationCooldowns = cloneData(snap.battleProvocationCooldowns || {});
        S.battles = cloneData(snap.battles || []);
        S.events = cloneData(snap.events || []);
        S.lottery = cloneData(snap.lottery || {});
        S.flags = cloneData(snap.flags || {});
        S.eventsMeta = cloneData(snap.eventsMeta || {});
        S.vote = cloneData(snap.vote || {});
        S.securityFlags = cloneData(snap.securityFlags || {});
        S.sightings = cloneData(snap.sightings || {});
        S.assignedCopId = snap.assignedCopId || null;
        S._seededNPCs = !!snap._seededNPCs;
        S.copCooldowns = S.reports && S.reports.copCooldowns ? S.reports.copCooldowns : {};
        S.provocationCooldowns = S.battleProvocationCooldowns;
        syncMoneyMirror();
        restoreDebugSnapshot(snapshot);
        const sec = G.__SEC || null;
        if (sec && sec.buckets && typeof sec.buckets.clear === "function") {
          sec.buckets.clear();
          (snapshot.securityBuckets || []).forEach((entry) => {
            if (Array.isArray(entry) && entry.length === 2) sec.buckets.set(entry[0], entry[1]);
          });
        }
        setUiProfile(snapshot.uiProfile || "default");
        if (G.Data && typeof snapshot.textMode === "string") G.Data.TEXT_MODE = snapshot.textMode;
        return true;
      };
      const pickDeterministicReportTarget = () => {
        const S = G.__S || G.State || {};
        const candidates = Object.values(S.players || {}).filter((p) => {
          const role = String(p && (p.role || p.type) || "").toLowerCase();
          return p && p.npc && (role === "toxic" || role === "bandit" || role === "mafia");
        });
        candidates.sort((a, b) => String(a && a.id || "").localeCompare(String(b && b.id || "")));
        const target = candidates[0] || null;
        return target ? { id: String(target.id || ""), name: String(target.name || ""), role: String(target.role || target.type || "").toLowerCase() } : null;
      };
      const prepareSandbox = (profileName) => {
        const baseline = { startMoney: 30, startRep: 0, startInfluence: 0 };
        const out = {
          ok: false,
          profile: profileName,
          baseline,
          target: null,
          startPointsTotal: null,
          state: null
        };
        if (!G.__A || typeof G.__A.resetAll !== "function" || typeof G.__A.seedPlayers !== "function") {
          out.reason = "state_reset_api_missing";
          return out;
        }
        G.__A.resetAll();
        G.__A.seedPlayers();
        const S = G.__S || G.State || {};
        setUiProfile(profileName);
        if (G.Data && typeof G.Data.TEXT_MODE === "string") G.Data.TEXT_MODE = profileName === "zoomer" ? "zoomer" : "millennial";
        withPointsWrite(() => {
          S.me.points = baseline.startMoney;
        });
        S.me.name = "Smoke";
        S.me.influence = baseline.startInfluence;
        S.me.wins = 0;
        S.me.winsSinceInfluence = 0;
        S.rep = baseline.startRep;
        S.influence = 0;
        S.isStarted = true;
        if (S.flags && typeof S.flags === "object") S.flags.started = true;
        syncMoneyMirror();
        if (G.__D && typeof G.__D === "object") {
          G.__D.moneyLog = [];
          G.__D.moneyLogByBattle = {};
          G.__D.repeatRateLimitLog = [];
        }
        if (S.reports && typeof S.reports === "object") {
          S.reports.lastAt = 0;
          S.reports.history = {};
          S.reports.copCooldowns = {};
          S.reports.pendingByActorId = {};
          S.reports.pendingById = {};
        }
        S.assignedCopId = null;
        S.copCooldowns = S.reports && S.reports.copCooldowns ? S.reports.copCooldowns : {};
        if (G.__SEC && G.__SEC.buckets && typeof G.__SEC.buckets.clear === "function") G.__SEC.buckets.clear();
        out.target = pickDeterministicReportTarget();
        const pointsSnapshot = getPointsSnapshot();
        out.startPointsTotal = pointsSnapshot && Number.isFinite(pointsSnapshot.total) ? pointsSnapshot.total : null;
        out.state = {
          money: getPlayerMoney(),
          rep: getPlayerRep(),
          pointsTotal: out.startPointsTotal,
          reportHistoryKeys: Object.keys((S.reports && S.reports.history) || {}).sort(),
          pendingKeys: Object.keys((S.reports && S.reports.pendingById) || {}).sort(),
          copCooldownKeys: Object.keys((S.reports && S.reports.copCooldowns) || {}).sort(),
          bucketCount: (G.__SEC && G.__SEC.buckets && typeof G.__SEC.buckets.size === "number") ? G.__SEC.buckets.size : null,
          moneyLogLen: (G.__D && Array.isArray(G.__D.moneyLog)) ? G.__D.moneyLog.length : null
        };
        out.ok = !!out.target
          && out.state.money === baseline.startMoney
          && out.state.rep === baseline.startRep
          && out.state.reportHistoryKeys.length === 0
          && out.state.pendingKeys.length === 0
          && out.state.copCooldownKeys.length === 0
          && (out.state.bucketCount === 0 || out.state.bucketCount === null)
          && out.state.moneyLogLen === 0;
        if (!out.ok && !out.reason) out.reason = "baseline_verification_failed";
        return out;
      };
      const runScenarioPass = (profileName) => {
        const prep = prepareSandbox(profileName);
        const out = {
          profile: profileName,
          prep,
          econResult: null,
          startMoney: prep.state ? prep.state.money : null,
          endMoney: null,
          moneyDelta: null,
          repDelta: null,
          pointsDelta: null
        };
        if (!prep.ok) {
          out.econResult = { ok: false, reason: prep.reason || "sandbox_prepare_failed" };
          return out;
        }
        const startRep = getPlayerRep();
        const startPoints = prep.startPointsTotal;
        const startMoney = getPlayerMoney();
        const beforeLogLen = (G.__D && Array.isArray(G.__D.moneyLog)) ? G.__D.moneyLog.length : 0;
        out.econResult = (G.__A && typeof G.__A.applyReportByRole === "function")
          ? G.__A.applyReportByRole(prep.target.name, { actionId: `tone_profiles_step54_fix2_${profileName}` })
          : { ok: false, reason: "report_api_missing" };
        const endMoney = getPlayerMoney();
        const endRep = getPlayerRep();
        const endPointsSnapshot = getPointsSnapshot();
        const endPoints = endPointsSnapshot && Number.isFinite(endPointsSnapshot.total) ? endPointsSnapshot.total : null;
        const logRows = (G.__D && Array.isArray(G.__D.moneyLog)) ? G.__D.moneyLog.slice(beforeLogLen) : [];
        out.startMoney = startMoney;
        out.endMoney = endMoney;
        out.moneyDelta = endMoney - startMoney;
        out.repDelta = endRep - startRep;
        out.pointsDelta = (Number.isFinite(startPoints) && Number.isFinite(endPoints)) ? (endPoints - startPoints) : null;
        out.moneyLogDelta = sumCurrency(logRows, "points");
        out.repLogDelta = sumCurrency(logRows, "rep");
        out.target = prep.target;
        return out;
      };
      const runZeroSumPass = (profileName) => {
        const prep = prepareSandbox(profileName);
        if (!prep.ok) return { ok: false, reason: prep.reason || "sandbox_prepare_failed" };
        return (G.__DEV && typeof G.__DEV.smokeEconUi_ZeroSumOnce === "function")
          ? G.__DEV.smokeEconUi_ZeroSumOnce()
          : { ok: false, reason: "zero_sum_missing" };
      };
      G.__DEV.smokeToneProfilesStep54EconLockFix2 = function smokeToneProfilesStep54EconLockFix2() {
        const result = {
          ok: false,
          buildTag: BUILD_TAG,
          commit: COMMIT,
          smokeVersion: SMOKE_VERSION,
          failures: [],
          forbiddenRemaining: [],
          missingCoverage: [],
          failedChecks: [],
          econHasNoUiProfileRefs: false,
          econResultsMatch: false,
          moneyDeltaMatch: false,
          repDeltaMatch: false,
          pointsDeltaMatch: false,
          zeroSumOk: false,
          scenarioStateResetOk: false,
          deterministicScenarioOk: false,
          baselineStateMatch: false,
          millennialStartMoney: null,
          zoomerStartMoney: null,
          millennialEndMoney: null,
          zoomerEndMoney: null,
          millennialMoneyDelta: null,
          zoomerMoneyDelta: null,
          millennialRepDelta: null,
          zoomerRepDelta: null,
          millennialPointsDelta: null,
          zoomerPointsDelta: null,
          millennialEconResult: null,
          zoomerEconResult: null,
          moneyDeltaSource: "unresolved"
        };
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        const liveSnapshot = captureLiveSnapshot();
        try {
          const refHits = scanForUiProfileRefs();
          result.econHasNoUiProfileRefs = refHits.length === 0;
          if (!result.econHasNoUiProfileRefs) fail("econ_uiProfile_refs_found", refHits);
          const millennial = runScenarioPass("millennial");
          const zoomer = runScenarioPass("zoomer");
          result.millennialEconResult = millennial.econResult;
          result.zoomerEconResult = zoomer.econResult;
          result.millennialStartMoney = millennial.startMoney;
          result.zoomerStartMoney = zoomer.startMoney;
          result.millennialEndMoney = millennial.endMoney;
          result.zoomerEndMoney = zoomer.endMoney;
          result.millennialMoneyDelta = millennial.moneyDelta;
          result.zoomerMoneyDelta = zoomer.moneyDelta;
          result.millennialRepDelta = millennial.repDelta;
          result.zoomerRepDelta = zoomer.repDelta;
          result.millennialPointsDelta = millennial.pointsDelta;
          result.zoomerPointsDelta = zoomer.pointsDelta;
          result.scenarioStateResetOk = !!(millennial.prep && millennial.prep.ok && zoomer.prep && zoomer.prep.ok);
          result.baselineStateMatch = result.scenarioStateResetOk
            && stableJson(millennial.prep.baseline) === stableJson(zoomer.prep.baseline)
            && stableJson(millennial.prep.target) === stableJson(zoomer.prep.target)
            && stableJson(millennial.prep.state) === stableJson(zoomer.prep.state);
          result.econResultsMatch = stableJson(millennial.econResult) === stableJson(zoomer.econResult);
          result.moneyDeltaMatch = millennial.moneyDelta === zoomer.moneyDelta;
          result.repDeltaMatch = millennial.repDelta === zoomer.repDelta;
          result.pointsDeltaMatch = millennial.pointsDelta === zoomer.pointsDelta;
          const zeroSumMillennial = runZeroSumPass("millennial");
          const zeroSumZoomer = runZeroSumPass("zoomer");
          result.zeroSumOk = !!(zeroSumMillennial && zeroSumMillennial.ok && zeroSumZoomer && zeroSumZoomer.ok);
          result.deterministicScenarioOk = result.baselineStateMatch
            && result.econResultsMatch
            && result.moneyDeltaMatch
            && result.repDeltaMatch
            && result.pointsDeltaMatch;
          if (!result.scenarioStateResetOk) fail("scenario_state_reset_failed", { millennial: millennial.prep, zoomer: zoomer.prep });
          if (!result.baselineStateMatch) fail("baseline_state_mismatch", { millennial: millennial.prep, zoomer: zoomer.prep });
          if (!result.econResultsMatch) fail("econ_result_mismatch", { millennial: millennial.econResult, zoomer: zoomer.econResult });
          if (!result.moneyDeltaMatch) fail("money_delta_mismatch", { millennial: millennial.moneyDelta, zoomer: zoomer.moneyDelta });
          if (!result.repDeltaMatch) fail("rep_delta_mismatch", { millennial: millennial.repDelta, zoomer: zoomer.repDelta });
          if (!result.pointsDeltaMatch) fail("points_delta_mismatch", { millennial: millennial.pointsDelta, zoomer: zoomer.pointsDelta });
          if (!result.zeroSumOk) fail("zero_sum_failed", { millennial: zeroSumMillennial, zoomer: zeroSumZoomer });
          if (!result.deterministicScenarioOk) {
            fail("deterministic_scenario_failed", {
              millennial: {
                target: millennial.target,
                moneyDelta: millennial.moneyDelta,
                repDelta: millennial.repDelta,
                pointsDelta: millennial.pointsDelta
              },
              zoomer: {
                target: zoomer.target,
                moneyDelta: zoomer.moneyDelta,
                repDelta: zoomer.repDelta,
                pointsDelta: zoomer.pointsDelta
              }
            });
          }
          if (!result.moneyDeltaMatch) {
            if (!result.scenarioStateResetOk) result.moneyDeltaSource = "sandbox_reset_failed";
            else if (!result.baselineStateMatch) result.moneyDeltaSource = "baseline_state_mismatch";
            else if (!result.econResultsMatch) result.moneyDeltaSource = "scenario_econ_result_mismatch";
            else result.moneyDeltaSource = "isolated_scenario_delta_mismatch";
          } else {
            result.moneyDeltaSource = "no_mismatch_detected";
          }
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        } finally {
          restoreStateSnapshot(liveSnapshot);
        }
        result.ok = result.failures.length === 0
          && result.forbiddenRemaining.length === 0
          && result.missingCoverage.length === 0
          && result.failedChecks.length === 0
          && result.econHasNoUiProfileRefs === true
          && result.econResultsMatch === true
          && result.moneyDeltaMatch === true
          && result.repDeltaMatch === true
          && result.pointsDeltaMatch === true
          && result.zeroSumOk === true
          && result.scenarioStateResetOk === true
          && result.deterministicScenarioOk === true
          && result.baselineStateMatch === true;
        return result;
      };
      if (!G.Dev || typeof G.Dev !== "object") G.Dev = {};
      G.Dev.smokeToneProfilesStep54EconLockFix2 = G.__DEV.smokeToneProfilesStep54EconLockFix2;
    }
    if (typeof G.__DEV.smokeToneProfilesStep5RuntimeAcceptanceFix2 !== "function") {
      const BUILD_TAG = "build_2026_06_14_step6_5_5_runtime_acceptance_fix2";
      const COMMIT = "step6_5_5_runtime_acceptance_fix2";
      const SMOKE_VERSION = "step6_5_5_runtime_acceptance_fix2_v20260614_001";
      const cloneData = (value) => {
        if (typeof structuredClone === "function") {
          try { return structuredClone(value); } catch (_) {}
        }
        try { return JSON.parse(JSON.stringify(value)); } catch (_) { return null; }
      };
      const stableJson = (value) => {
        try { return JSON.stringify(value); } catch (_) { return String(value); }
      };
      const withPointsWrite = (fn) => (typeof G._withPointsWrite === "function" ? G._withPointsWrite(fn) : fn());
      const scanForUiProfileRefs = () => {
        const targets = [
          G.__A && G.__A.applyReportByRole,
          G.__A && G.__A.transferPoints,
          G.__A && G.__A.transferRep,
          G.__A && G.__A.applyBattleOutcome,
          G.ConflictEconomy,
          G._ConflictEconomy
        ];
        const hits = [];
        targets.forEach((fn, idx) => {
          if (typeof fn !== "function") return;
          const src = Function.prototype.toString.call(fn);
          if (src.indexOf("uiProfile") >= 0) hits.push({ idx, name: fn.name || `fn_${idx}` });
        });
        return hits;
      };
      const readUiProfile = () => {
        const Data = G.Data || null;
        return (Data && typeof Data.getUiProfile === "function") ? String(Data.getUiProfile() || "default") : "default";
      };
      const setUiProfile = (profile) => {
        const Data = G.Data || null;
        if (Data && typeof Data.setUiProfile === "function") Data.setUiProfile(profile);
      };
      const getPointsSnapshot = () => (G.__DEV && typeof G.__DEV.sumPointsSnapshot === "function")
        ? G.__DEV.sumPointsSnapshot({ includeWorld: true, includePools: true })
        : null;
      const getPlayerMoney = () => {
        const S = G.__S || G.State || {};
        return (S.me && Number.isFinite(S.me.points)) ? (S.me.points | 0) : 0;
      };
      const getPlayerRep = () => {
        const S = G.__S || G.State || {};
        return Number.isFinite(S.rep) ? (S.rep | 0) : 0;
      };
      const normalizeText = (value) => String(value == null ? "" : value).replace(/\s+/g, " ").trim();
      const normalizeNumberMap = (map) => Object.keys(map || {}).sort().reduce((acc, key) => {
        const value = map[key];
        if (Number.isFinite(value)) acc[key] = value | 0;
        return acc;
      }, {});
      const normalizeMoneyLogRow = (row) => {
        const entry = row && typeof row === "object" ? row : {};
        const keys = Object.keys(entry).sort();
        const structural = keys.reduce((acc, key) => {
          const value = entry[key];
          acc[key] = {
            type: Array.isArray(value) ? "array" : typeof value,
            present: typeof value !== "undefined",
          };
          return acc;
        }, {});
        return {
          keys,
          structural,
          currency: String(entry.currency || entry.kind || "points").toLowerCase() === "rep" ? "rep" : "points",
          code: String(entry.code || entry.reasonCode || entry.reason || entry.type || ""),
          reason: String(entry.reason || entry.reasonCode || entry.code || entry.type || ""),
          amount: Number.isFinite(entry.amount) ? (entry.amount | 0) : (Number.isFinite(entry.delta) ? (entry.delta | 0) : null),
          value: Number.isFinite(entry.value) ? (entry.value | 0) : null,
        };
      };
      const sumCurrency = (rows, currency) => {
        return (Array.isArray(rows) ? rows : []).reduce((total, row) => {
          const kind = String(row && row.currency || row && row.kind || "").toLowerCase();
          if (kind !== currency) return total;
          const amount = Number.isFinite(row && row.amount) ? row.amount : (Number.isFinite(row && row.delta) ? row.delta : 0);
          return total + amount;
        }, 0);
      };
      const syncMoneyMirror = () => {
        if (G.__A && typeof G.__A.syncMeToPlayers === "function") G.__A.syncMeToPlayers();
      };
      const captureLiveSnapshot = () => {
        const S = G.__S || G.State || {};
        const dbg = G.__D || {};
        const sec = G.__SEC || {};
        const Data = G.Data || {};
        return {
          state: cloneData(S),
          debug: cloneData(dbg),
          securityBuckets: sec.buckets && typeof sec.buckets.entries === "function" ? Array.from(sec.buckets.entries()) : [],
          uiProfile: readUiProfile(),
          textMode: typeof Data.TEXT_MODE === "string" ? Data.TEXT_MODE : null
        };
      };
      const restoreDebugSnapshot = (snapshot) => {
        const dbg = G.__D || (G.__D = {});
        const data = snapshot && snapshot.debug ? snapshot.debug : {};
        Object.keys(dbg).forEach((key) => {
          if (!Object.prototype.hasOwnProperty.call(data, key)) delete dbg[key];
        });
        Object.keys(data || {}).forEach((key) => {
          dbg[key] = cloneData(data[key]);
        });
      };
      const restoreStateSnapshot = (snapshot) => {
        if (!snapshot || !snapshot.state || !G.__A || typeof G.__A.resetAll !== "function") return false;
        const snap = snapshot.state;
        const S = G.__S || G.State || {};
        G.__A.resetAll();
        if (typeof G.__A.seedPlayers === "function") G.__A.seedPlayers();
        S.isStarted = !!snap.isStarted;
        Object.assign(S.npc || {}, cloneData(snap.npc || {}));
        withPointsWrite(() => Object.assign(S.me || {}, cloneData(snap.me || {})));
        S.rep = Number.isFinite(snap.rep) ? (snap.rep | 0) : 0;
        S.influence = Number.isFinite(snap.influence) ? (snap.influence | 0) : 0;
        const currentPlayers = S.players || {};
        const snapPlayers = snap.players || {};
        const restoredPlayers = {};
        Object.keys(snapPlayers).forEach((id) => {
          const restored = currentPlayers[id] || {};
          const source = cloneData(snapPlayers[id]) || {};
          withPointsWrite(() => {
            if (Object.prototype.hasOwnProperty.call(source, "points")) restored.points = Number.isFinite(source.points) ? (source.points | 0) : 0;
          });
          Object.keys(source).forEach((key) => {
            if (key === "points") return;
            restored[key] = source[key];
          });
          restoredPlayers[id] = restored;
        });
        S.players = restoredPlayers;
        S.points = cloneData(snap.points || {});
        S.progress = cloneData(snap.progress || {});
        S.training = cloneData(snap.training || {});
        S.dayIndex = Number.isFinite(snap.dayIndex) ? (snap.dayIndex | 0) : 0;
        S.chat = cloneData(snap.chat || []);
        S.chatAutoReplyNonceByMessageId = cloneData(snap.chatAutoReplyNonceByMessageId || {});
        if (S.chat && typeof S.chat === "object") S.chat.autoReplyNonceByMessageId = S.chatAutoReplyNonceByMessageId;
        S.dm = cloneData(snap.dm || {});
        S.reports = cloneData(snap.reports || {});
        S.jailed = cloneData(snap.jailed || {});
        S.victimByRole = cloneData(snap.victimByRole || {});
        S.revengeUntil = Number.isFinite(snap.revengeUntil) ? snap.revengeUntil : 0;
        S.battleCooldowns = cloneData(snap.battleCooldowns || {});
        S.battleProvocationCooldowns = cloneData(snap.battleProvocationCooldowns || {});
        S.battles = cloneData(snap.battles || []);
        S.events = cloneData(snap.events || []);
        S.lottery = cloneData(snap.lottery || {});
        S.flags = cloneData(snap.flags || {});
        S.eventsMeta = cloneData(snap.eventsMeta || {});
        S.vote = cloneData(snap.vote || {});
        S.securityFlags = cloneData(snap.securityFlags || {});
        S.sightings = cloneData(snap.sightings || {});
        S.assignedCopId = snap.assignedCopId || null;
        S._seededNPCs = !!snap._seededNPCs;
        S.copCooldowns = S.reports && S.reports.copCooldowns ? S.reports.copCooldowns : {};
        S.provocationCooldowns = S.battleProvocationCooldowns;
        syncMoneyMirror();
        restoreDebugSnapshot(snapshot);
        const sec = G.__SEC || null;
        if (sec && sec.buckets && typeof sec.buckets.clear === "function") {
          sec.buckets.clear();
          (snapshot.securityBuckets || []).forEach((entry) => {
            if (Array.isArray(entry) && entry.length === 2) sec.buckets.set(entry[0], entry[1]);
          });
        }
        setUiProfile(snapshot.uiProfile || "default");
        if (G.Data && typeof snapshot.textMode === "string") G.Data.TEXT_MODE = snapshot.textMode;
        if (G.UI && typeof G.UI.renderAll === "function") {
          try { G.UI.renderAll(); } catch (_) {}
        }
        return true;
      };
      const pickDeterministicReportTarget = () => {
        const S = G.__S || G.State || {};
        const candidates = Object.values(S.players || {}).filter((p) => {
          const role = String(p && (p.role || p.type) || "").toLowerCase();
          return p && p.npc && (role === "toxic" || role === "bandit" || role === "mafia");
        });
        candidates.sort((a, b) => String(a && a.id || "").localeCompare(String(b && b.id || "")));
        const target = candidates[0] || null;
        return target ? { id: String(target.id || ""), name: String(target.name || ""), role: String(target.role || target.type || "").toLowerCase() } : null;
      };
      const prepareSandbox = (profileName) => {
        const baseline = { startMoney: 30, startRep: 0, startInfluence: 0 };
        const out = {
          ok: false,
          profile: profileName,
          baseline,
          target: null,
          startPointsTotal: null,
          state: null
        };
        if (!G.__A || typeof G.__A.resetAll !== "function" || typeof G.__A.seedPlayers !== "function") {
          out.reason = "state_reset_api_missing";
          return out;
        }
        G.__A.resetAll();
        G.__A.seedPlayers();
        const S = G.__S || G.State || {};
        setUiProfile(profileName);
        if (G.Data && typeof G.Data.TEXT_MODE === "string") G.Data.TEXT_MODE = profileName === "zoomer" ? "zoomer" : "millennial";
        withPointsWrite(() => {
          S.me.points = baseline.startMoney;
        });
        S.me.name = "Smoke";
        S.me.influence = baseline.startInfluence;
        S.me.wins = 0;
        S.me.winsSinceInfluence = 0;
        S.rep = baseline.startRep;
        S.influence = 0;
        S.isStarted = true;
        if (S.flags && typeof S.flags === "object") S.flags.started = true;
        syncMoneyMirror();
        if (G.__D && typeof G.__D === "object") {
          G.__D.moneyLog = [];
          G.__D.moneyLogByBattle = {};
          G.__D.repeatRateLimitLog = [];
        }
        if (S.reports && typeof S.reports === "object") {
          S.reports.lastAt = 0;
          S.reports.history = {};
          S.reports.copCooldowns = {};
          S.reports.pendingByActorId = {};
          S.reports.pendingById = {};
        }
        S.assignedCopId = null;
        S.copCooldowns = S.reports && S.reports.copCooldowns ? S.reports.copCooldowns : {};
        if (G.__SEC && G.__SEC.buckets && typeof G.__SEC.buckets.clear === "function") G.__SEC.buckets.clear();
        out.target = pickDeterministicReportTarget();
        const pointsSnapshot = getPointsSnapshot();
        out.startPointsTotal = pointsSnapshot && Number.isFinite(pointsSnapshot.total) ? pointsSnapshot.total : null;
        out.state = {
          money: getPlayerMoney(),
          rep: getPlayerRep(),
          pointsTotal: out.startPointsTotal,
          reportHistoryKeys: Object.keys((S.reports && S.reports.history) || {}).sort(),
          pendingKeys: Object.keys((S.reports && S.reports.pendingById) || {}).sort(),
          copCooldownKeys: Object.keys((S.reports && S.reports.copCooldowns) || {}).sort(),
          bucketCount: (G.__SEC && G.__SEC.buckets && typeof G.__SEC.buckets.size === "number") ? G.__SEC.buckets.size : null,
          moneyLogLen: (G.__D && Array.isArray(G.__D.moneyLog)) ? G.__D.moneyLog.length : null
        };
        out.ok = !!out.target
          && out.state.money === baseline.startMoney
          && out.state.rep === baseline.startRep
          && out.state.reportHistoryKeys.length === 0
          && out.state.pendingKeys.length === 0
          && out.state.copCooldownKeys.length === 0
          && (out.state.bucketCount === 0 || out.state.bucketCount === null)
          && out.state.moneyLogLen === 0;
        if (!out.ok && !out.reason) out.reason = "baseline_verification_failed";
        return out;
      };
      const captureCooldowns = () => {
        const S = G.__S || G.State || {};
        return {
          reportCopCooldowns: normalizeNumberMap((S.reports && S.reports.copCooldowns) || {}),
          battleCooldowns: normalizeNumberMap(S.battleCooldowns || {}),
          battleProvocationCooldowns: normalizeNumberMap(S.battleProvocationCooldowns || {}),
        };
      };
      const captureVisibleUiText = () => {
        const Data = G.Data || null;
        const t = Data && typeof Data.t === "function" ? Data.t.bind(Data) : null;
        const say = G.System && typeof G.System.say === "function" ? G.System.say.bind(G.System) : null;
        return {
          tieStart: normalizeText(t ? t("tie_start") : ""),
          battleDraw: normalizeText(t ? t("battle_draw") : ""),
          eventsEmpty: normalizeText(t ? t("events_empty") : ""),
          escapeButtonLabel: normalizeText(t ? t("escape_button_label", { X: 1 }) : ""),
          cooldownShort: normalizeText(say ? say("warnings", "cooldownShort", {}) : ""),
        };
      };
      const normalizeActionResult = (value) => {
        const res = value && typeof value === "object" ? value : {};
        return {
          ok: res.ok !== false,
          reason: String(res.reason || res.reasonCode || ""),
          outcome: String(res.outcome || ""),
          details: String(res.details || ""),
          pass: res.pass === true,
          economyOk: res.economyOk === true,
          pointsDiffOk: res.pointsDiffOk === true,
          cap: Number.isFinite(res.cap) ? (res.cap | 0) : null,
          totalVotes: Number.isFinite(res.totalVotes) ? (res.totalVotes | 0) : null,
        };
      };
      const normalizeBattleState = (battle) => {
        const value = battle && typeof battle === "object" ? battle : {};
        const crowd = value.crowd && typeof value.crowd === "object" ? value.crowd : {};
        return {
          opponentId: String(value.opponentId || ""),
          attackerId: String(value.attackerId || ""),
          defenderId: String(value.defenderId || ""),
          status: String(value.status || ""),
          result: String(value.result || ""),
          resolved: value.resolved === true,
          finished: value.finished === true,
          draw: value.draw === true,
          crowd: {
            votesA: Number.isFinite(crowd.votesA) ? (crowd.votesA | 0) : 0,
            votesB: Number.isFinite(crowd.votesB) ? (crowd.votesB | 0) : 0,
            aVotes: Number.isFinite(crowd.aVotes) ? (crowd.aVotes | 0) : 0,
            bVotes: Number.isFinite(crowd.bVotes) ? (crowd.bVotes | 0) : 0,
            cap: Number.isFinite(crowd.cap) ? (crowd.cap | 0) : 0,
            totalPlayers: Number.isFinite(crowd.totalPlayers) ? (crowd.totalPlayers | 0) : 0,
            decided: crowd.decided === true,
          }
        };
      };
      const buildStructuralPayload = (pass) => ({
        moneyLog: pass.moneyLog,
        econDelta: pass.econDelta,
        repDelta: pass.repDelta,
        pointsDelta: pass.pointsDelta,
        cooldowns: pass.cooldowns,
        battleResult: pass.battleResult,
      });
      const runScenarioPass = (profileName) => {
        const prep = prepareSandbox(profileName);
        const out = {
          profile: profileName,
          prep,
          target: prep.target,
          reportResult: null,
          battleRaw: null,
          battleResult: null,
          moneyLog: [],
          econDelta: null,
          repDelta: null,
          pointsDelta: null,
          cooldowns: null,
          visibleUiText: null
        };
        if (!prep.ok) {
          out.reportResult = { ok: false, reason: prep.reason || "sandbox_prepare_failed" };
          out.battleRaw = { ok: false, reason: prep.reason || "sandbox_prepare_failed" };
          return out;
        }
        const startRep = getPlayerRep();
        const startPoints = prep.startPointsTotal;
        const logStart = (G.__D && Array.isArray(G.__D.moneyLog)) ? G.__D.moneyLog.length : 0;
        out.reportResult = (G.__A && typeof G.__A.applyReportByRole === "function")
          ? G.__A.applyReportByRole(prep.target.name, { actionId: `tone_profiles_step55_report_${profileName}` })
          : { ok: false, reason: "report_api_missing" };
        out.battleRaw = (G.__DEV && typeof G.__DEV.smokeBattleCrowdOutcomeOnce === "function")
          ? G.__DEV.smokeBattleCrowdOutcomeOnce({ allowParallel: false, forceMajoritySide: "attacker" })
          : { ok: false, reason: "battle_smoke_missing" };
        const endRep = getPlayerRep();
        const endPointsSnapshot = getPointsSnapshot();
        const endPoints = endPointsSnapshot && Number.isFinite(endPointsSnapshot.total) ? endPointsSnapshot.total : null;
        const moneyRows = (G.__D && Array.isArray(G.__D.moneyLog)) ? G.__D.moneyLog.slice(logStart) : [];
        const battleId = out.battleRaw && out.battleRaw.battleId ? String(out.battleRaw.battleId) : "";
        const battleState = battleId
          ? ((G.__S && Array.isArray(G.__S.battles)) ? G.__S.battles.find((battle) => battle && String(battle.id) === battleId) : null)
          : null;
        out.moneyLog = moneyRows.map((row) => normalizeMoneyLogRow(row));
        out.repDelta = endRep - startRep;
        out.pointsDelta = (Number.isFinite(startPoints) && Number.isFinite(endPoints)) ? (endPoints - startPoints) : null;
        out.cooldowns = captureCooldowns();
        out.visibleUiText = captureVisibleUiText();
        out.battleResult = normalizeBattleState(battleState);
        out.econDelta = {
          report: normalizeActionResult(out.reportResult),
          battle: normalizeActionResult(out.battleRaw),
          moneyDelta: sumCurrency(out.moneyLog, "points"),
          repDelta: out.repDelta,
          pointsDelta: out.pointsDelta,
        };
        return out;
      };
      G.__DEV.smokeToneProfilesStep5RuntimeAcceptanceFix2 = function smokeToneProfilesStep5RuntimeAcceptanceFix2() {
        const result = {
          buildTag: BUILD_TAG,
          commit: COMMIT,
          smokeVersion: SMOKE_VERSION,
          ok: false,
          failures: [],
          forbiddenRemaining: [],
          missingCoverage: [],
          failedChecks: [],
          uiProfileIsTextSkin: false,
          gameplayUnchanged: false,
          saveHasNoYear: false,
          saveContainsOnlyUiProfile: false,
          profileDoesNotAffectBalance: false,
          profileNotInEcon: false,
          profileNotInMoneyLog: false,
          step51Ok: false,
          step52Ok: false,
          step53Ok: false,
          step54Ok: false,
          step55Ok: false,
        };
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        const miss = (code) => {
          if (result.missingCoverage.indexOf(code) < 0) result.missingCoverage.push(code);
        };
        const liveSnapshot = captureLiveSnapshot();
        try {
          if (!G.__A || typeof G.__A.resetAll !== "function" || typeof G.__A.seedPlayers !== "function") miss("state_reset_api_missing");
          if (!(G.__A && typeof G.__A.applyReportByRole === "function")) miss("report_api_missing");
          if (!(G.__DEV && typeof G.__DEV.smokeBattleCrowdOutcomeOnce === "function")) miss("battle_smoke_missing");
          if (!(G.__DEV && typeof G.__DEV.sumPointsSnapshot === "function")) miss("sum_points_snapshot_missing");
          if (!(G.Data && typeof G.Data.t === "function")) miss("ui_text_resolver_missing");
          const refHits = scanForUiProfileRefs();
          if (refHits.length) fail("uiProfile_refs_found", refHits);
          const yearHits = scanForYearOrBirthFieldRefs();
          if (yearHits.length) fail("year_field_refs_found", yearHits);
          const econHits = scanForEconMoneyLogUiProfileRefs();
          if (econHits.length) fail("econ_moneylog_uiProfile_refs_found", econHits);
          const battleHits = scanForBattleOrCooldownUiProfileRefs();
          if (battleHits.length) fail("battle_cooldown_uiProfile_refs_found", battleHits);

          const millennial = runScenarioPass("millennial");
          const zoomer = runScenarioPass("zoomer");
          const millennialVisible = millennial.visibleUiText || {};
          const zoomerVisible = zoomer.visibleUiText || {};
          result.uiProfileIsTextSkin = stableJson(millennialVisible) !== stableJson(zoomerVisible);
          result.profileNotInMoneyLog = stableJson(millennial.moneyLog) === stableJson(zoomer.moneyLog);
          result.profileNotInEcon = stableJson(millennial.econDelta) === stableJson(zoomer.econDelta)
            && millennial.repDelta === zoomer.repDelta
            && millennial.pointsDelta === zoomer.pointsDelta;
          result.profileDoesNotAffectBalance = stableJson(millennial.cooldowns) === stableJson(zoomer.cooldowns)
            && stableJson(millennial.battleResult) === stableJson(zoomer.battleResult)
            && stableJson(buildStructuralPayload(millennial)) === stableJson(buildStructuralPayload(zoomer));
          result.gameplayUnchanged = result.profileNotInEcon === true
            && result.profileNotInMoneyLog === true
            && result.profileDoesNotAffectBalance === true;
          const saveProbe = (() => {
            const save = (G.__S && G.__S.save && typeof G.__S.save === "object") ? G.__S.save : {};
            const keys = Object.keys(save);
            const hasYear = ["birthYear", "birthYearInput", "fantasyYear", "year"].some((key) => Object.prototype.hasOwnProperty.call(save, key));
            return { save, keys, hasYear, onlyUiProfile: keys.length === 1 && keys[0] === "uiProfile" };
          })();
          result.saveHasNoYear = saveProbe.hasYear === false;
          result.saveContainsOnlyUiProfile = saveProbe.onlyUiProfile === true;
          result.step51Ok = !!(G.__DEV && typeof G.__DEV.smokeToneProfilesStep51UiOnlyBoundaryFix5 === "function" && G.__DEV.smokeToneProfilesStep51UiOnlyBoundaryFix5().ok);
          result.step52Ok = !!(G.__DEV && typeof G.__DEV.smokeToneProfilesStep52TextResolverOnly === "function" && G.__DEV.smokeToneProfilesStep52TextResolverOnly().ok);
          result.step53Ok = !!(G.__DEV && typeof G.__DEV.smokeToneProfilesStep53MoneyLogLock === "function" && G.__DEV.smokeToneProfilesStep53MoneyLogLock().ok);
          result.step54Ok = !!(G.__DEV && typeof G.__DEV.smokeToneProfilesStep54EconLockFix2 === "function" && G.__DEV.smokeToneProfilesStep54EconLockFix2().ok);
          result.step55Ok = !!(millennial.ok && zoomer.ok && result.uiProfileIsTextSkin && result.gameplayUnchanged && result.saveHasNoYear && result.saveContainsOnlyUiProfile);
          if (!result.uiProfileIsTextSkin) fail("ui_profile_text_skin_mismatch", { millennial: millennialVisible, zoomer: zoomerVisible });
          if (!result.profileNotInMoneyLog) fail("profile_in_moneyLog", { millennial: millennial.moneyLog, zoomer: zoomer.moneyLog });
          if (!result.profileNotInEcon) fail("profile_in_econ", { millennial: millennial.econDelta, zoomer: zoomer.econDelta });
          if (!result.profileDoesNotAffectBalance) fail("profile_affects_balance", { millennial: millennial.battleResult, zoomer: zoomer.battleResult });
          if (!result.saveHasNoYear) fail("save_has_year", saveProbe.save);
          if (!result.saveContainsOnlyUiProfile) fail("save_not_uiProfile_only", saveProbe.keys);
          if (!(result.step51Ok && result.step52Ok && result.step53Ok && result.step54Ok && result.step55Ok)) {
            fail("step_smoke_dependency_failed", {
              step51Ok: result.step51Ok,
              step52Ok: result.step52Ok,
              step53Ok: result.step53Ok,
              step54Ok: result.step54Ok,
              step55Ok: result.step55Ok
            });
          }
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        } finally {
          restoreStateSnapshot(liveSnapshot);
        }
        result.ok = result.failures.length === 0
          && result.forbiddenRemaining.length === 0
          && result.missingCoverage.length === 0
          && result.failedChecks.length === 0
          && result.uiProfileIsTextSkin === true
          && result.gameplayUnchanged === true
          && result.saveHasNoYear === true
          && result.saveContainsOnlyUiProfile === true
          && result.profileDoesNotAffectBalance === true
          && result.profileNotInEcon === true
          && result.profileNotInMoneyLog === true
          && result.step51Ok === true
          && result.step52Ok === true
          && result.step53Ok === true
          && result.step54Ok === true
          && result.step55Ok === true;
        return result;
      };
      G.__DEV.smokeToneProfilesStep5RuntimeAcceptanceFix3 = function smokeToneProfilesStep5RuntimeAcceptanceFix3() {
        const result = {
          buildTag: "build_2026_06_14_step6_5_5_runtime_acceptance_fix3",
          commit: "step6_5_5_runtime_acceptance_fix3",
          smokeVersion: "step6_5_5_runtime_acceptance_fix3_v20260614_001",
          ok: false,
          failures: [],
          forbiddenRemaining: [],
          missingCoverage: [],
          failedChecks: [],
          uiProfileIsTextSkin: false,
          gameplayUnchanged: false,
          saveHasNoYear: false,
          saveContainsOnlyUiProfile: false,
          profileDoesNotAffectBalance: false,
          profileNotInEcon: false,
          profileNotInMoneyLog: false,
          step51Ok: false,
          step52Ok: false,
          step53Ok: false,
          step54Ok: false,
          step55Ok: false,
        };
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        const miss = (code) => {
          if (result.missingCoverage.indexOf(code) < 0) result.missingCoverage.push(code);
        };
        const liveSnapshot = captureLiveSnapshot();
        try {
          if (!G.__A || typeof G.__A.resetAll !== "function" || typeof G.__A.seedPlayers !== "function") miss("state_reset_api_missing");
          if (!(G.__A && typeof G.__A.applyReportByRole === "function")) miss("report_api_missing");
          if (!(G.__DEV && typeof G.__DEV.smokeBattleCrowdOutcomeOnce === "function")) miss("battle_smoke_missing");
          if (!(G.__DEV && typeof G.__DEV.sumPointsSnapshot === "function")) miss("sum_points_snapshot_missing");
          if (!(G.Data && typeof G.Data.t === "function")) miss("ui_text_resolver_missing");
          const refHits = scanForUiProfileRefs();
          if (refHits.length) fail("uiProfile_refs_found", refHits);
          const econHits = scanForEconMoneyLogUiProfileRefs();
          if (econHits.length) fail("econ_moneylog_uiProfile_refs_found", econHits);
          const battleHits = scanForBattleOrCooldownUiProfileRefs();
          if (battleHits.length) fail("battle_cooldown_uiProfile_refs_found", battleHits);

          const millennial = runScenarioPass("millennial");
          const zoomer = runScenarioPass("zoomer");
          const millennialVisible = millennial.visibleUiText || {};
          const zoomerVisible = zoomer.visibleUiText || {};
          result.uiProfileIsTextSkin = stableJson(millennialVisible) !== stableJson(zoomerVisible);
          result.profileNotInMoneyLog = stableJson(millennial.moneyLog) === stableJson(zoomer.moneyLog);
          result.profileNotInEcon = stableJson(millennial.econDelta) === stableJson(zoomer.econDelta)
            && millennial.repDelta === zoomer.repDelta
            && millennial.pointsDelta === zoomer.pointsDelta;
          result.profileDoesNotAffectBalance = stableJson(millennial.cooldowns) === stableJson(zoomer.cooldowns)
            && stableJson(millennial.battleResult) === stableJson(zoomer.battleResult)
            && stableJson(buildStructuralPayload(millennial)) === stableJson(buildStructuralPayload(zoomer));
          result.gameplayUnchanged = result.profileNotInEcon === true
            && result.profileNotInMoneyLog === true
            && result.profileDoesNotAffectBalance === true;
          const saveProbe = (() => {
            const save = (G.__S && G.__S.save && typeof G.__S.save === "object") ? G.__S.save : {};
            const keys = Object.keys(save).sort();
            const forbiddenYearPaths = [];
            const seen = new Set();
            const yearLikeKey = /(^year$|birth.?year|birth.?year.?input|fantasy.?year|born.?year|real.?year)/i;
            const walk = (value, path) => {
              if (!value || typeof value !== "object") return;
              if (seen.has(value)) return;
              seen.add(value);
              Object.keys(value).forEach((key) => {
                const nextPath = path ? `${path}.${key}` : key;
                if (yearLikeKey.test(String(key))) forbiddenYearPaths.push(nextPath);
                walk(value[key], nextPath);
              });
            };
            walk(save, "");
            return {
              save,
              keys,
              forbiddenYearPaths,
              hasYear: forbiddenYearPaths.length > 0,
              onlyUiProfile: keys.length === 1 && keys[0] === "uiProfile"
            };
          })();
          result.saveHasNoYear = saveProbe.hasYear === false;
          result.saveContainsOnlyUiProfile = saveProbe.onlyUiProfile === true;
          result.step51Ok = !!(G.__DEV && typeof G.__DEV.smokeToneProfilesStep51UiOnlyBoundaryFix5 === "function" && G.__DEV.smokeToneProfilesStep51UiOnlyBoundaryFix5().ok);
          result.step52Ok = !!(G.__DEV && typeof G.__DEV.smokeToneProfilesStep52TextResolverOnly === "function" && G.__DEV.smokeToneProfilesStep52TextResolverOnly().ok);
          result.step53Ok = !!(G.__DEV && typeof G.__DEV.smokeToneProfilesStep53MoneyLogLock === "function" && G.__DEV.smokeToneProfilesStep53MoneyLogLock().ok);
          result.step54Ok = !!(G.__DEV && typeof G.__DEV.smokeToneProfilesStep54EconLockFix2 === "function" && G.__DEV.smokeToneProfilesStep54EconLockFix2().ok);
          result.step55Ok = !!(millennial.ok && zoomer.ok && result.uiProfileIsTextSkin && result.gameplayUnchanged && result.saveHasNoYear && result.saveContainsOnlyUiProfile);
          if (!result.uiProfileIsTextSkin) fail("ui_profile_text_skin_mismatch", { millennial: millennialVisible, zoomer: zoomerVisible });
          if (!result.profileNotInMoneyLog) fail("profile_in_moneyLog", { millennial: millennial.moneyLog, zoomer: zoomer.moneyLog });
          if (!result.profileNotInEcon) fail("profile_in_econ", { millennial: millennial.econDelta, zoomer: zoomer.econDelta });
          if (!result.profileDoesNotAffectBalance) fail("profile_affects_balance", { millennial: millennial.battleResult, zoomer: zoomer.battleResult });
          if (!result.saveHasNoYear) fail("save_has_year", { save: saveProbe.save, forbiddenYearPaths: saveProbe.forbiddenYearPaths });
          if (!result.saveContainsOnlyUiProfile) fail("save_not_uiProfile_only", saveProbe.keys);
          if (!(result.step51Ok && result.step52Ok && result.step53Ok && result.step54Ok && result.step55Ok)) {
            fail("step_smoke_dependency_failed", {
              step51Ok: result.step51Ok,
              step52Ok: result.step52Ok,
              step53Ok: result.step53Ok,
              step54Ok: result.step54Ok,
              step55Ok: result.step55Ok
            });
          }
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        } finally {
          restoreStateSnapshot(liveSnapshot);
        }
        result.ok = result.failures.length === 0
          && result.forbiddenRemaining.length === 0
          && result.missingCoverage.length === 0
          && result.failedChecks.length === 0
          && result.uiProfileIsTextSkin === true
          && result.gameplayUnchanged === true
          && result.saveHasNoYear === true
          && result.saveContainsOnlyUiProfile === true
          && result.profileDoesNotAffectBalance === true
          && result.profileNotInEcon === true
          && result.profileNotInMoneyLog === true
          && result.step51Ok === true
          && result.step52Ok === true
          && result.step53Ok === true
          && result.step54Ok === true
          && result.step55Ok === true;
        return result;
      };
      G.__DEV.smokeToneProfilesStep5RuntimeAcceptanceFix4 = function smokeToneProfilesStep5RuntimeAcceptanceFix4() {
        const BUILD_TAG_FIX4 = "build_2026_06_14_step6_5_5_runtime_acceptance_fix4";
        const COMMIT_FIX4 = "step6_5_5_runtime_acceptance_fix4";
        const SMOKE_VERSION_FIX4 = "step6_5_5_runtime_acceptance_fix4_v20260614_001";
        const clone = (value) => {
          if (typeof structuredClone === "function") {
            try { return structuredClone(value); } catch (_) {}
          }
          try { return JSON.parse(JSON.stringify(value)); } catch (_) { return null; }
        };
        const stable = (value) => {
          try { return JSON.stringify(value); } catch (_) { return String(value); }
        };
        const withPoints = (fn) => (typeof G._withPointsWrite === "function" ? G._withPointsWrite(fn) : fn());
        const readProfile = () => {
          const Data = G.Data || null;
          return (Data && typeof Data.getUiProfile === "function") ? String(Data.getUiProfile() || "default") : "default";
        };
        const setProfile = (profile) => {
          const Data = G.Data || null;
          if (Data && typeof Data.setUiProfile === "function") Data.setUiProfile(profile);
        };
        const getPoints = () => (G.__DEV && typeof G.__DEV.sumPointsSnapshot === "function")
          ? G.__DEV.sumPointsSnapshot({ includeWorld: true, includePools: true })
          : null;
        const getMoney = () => {
          const S = G.__S || G.State || {};
          return (S.me && Number.isFinite(S.me.points)) ? (S.me.points | 0) : 0;
        };
        const getRep = () => {
          const S = G.__S || G.State || {};
          return Number.isFinite(S.rep) ? (S.rep | 0) : 0;
        };
        const text = (value) => String(value == null ? "" : value).replace(/\s+/g, " ").trim();
        const numberMap = (map) => Object.keys(map || {}).sort().reduce((acc, key) => {
          const value = map[key];
          if (Number.isFinite(value)) acc[key] = value | 0;
          return acc;
        }, {});
        const normalizeLogRow = (row) => {
          const entry = row && typeof row === "object" ? row : {};
          const keys = Object.keys(entry).sort();
          const structural = keys.reduce((acc, key) => {
            const value = entry[key];
            acc[key] = {
              type: Array.isArray(value) ? "array" : typeof value,
              present: typeof value !== "undefined",
            };
            return acc;
          }, {});
          return {
            keys,
            structural,
            currency: String(entry.currency || entry.kind || "points").toLowerCase() === "rep" ? "rep" : "points",
            code: String(entry.code || entry.reasonCode || entry.reason || entry.type || ""),
            reason: String(entry.reason || entry.reasonCode || entry.code || entry.type || ""),
            amount: Number.isFinite(entry.amount) ? (entry.amount | 0) : (Number.isFinite(entry.delta) ? (entry.delta | 0) : null),
            value: Number.isFinite(entry.value) ? (entry.value | 0) : null,
          };
        };
        const sumKind = (rows, currency) => (Array.isArray(rows) ? rows : []).reduce((total, row) => {
          const kind = String(row && row.currency || row && row.kind || "").toLowerCase();
          if (kind !== currency) return total;
          const amount = Number.isFinite(row && row.amount) ? row.amount : (Number.isFinite(row && row.delta) ? row.delta : 0);
          return total + amount;
        }, 0);
        const syncMoney = () => {
          if (G.__A && typeof G.__A.syncMeToPlayers === "function") G.__A.syncMeToPlayers();
        };
        const captureSnapshot = () => {
          const S = G.__S || G.State || {};
          const dbg = G.__D || {};
          const sec = G.__SEC || {};
          const Data = G.Data || {};
          return {
            state: clone(S),
            debug: clone(dbg),
            securityBuckets: sec.buckets && typeof sec.buckets.entries === "function" ? Array.from(sec.buckets.entries()) : [],
            uiProfile: readProfile(),
            textMode: typeof Data.TEXT_MODE === "string" ? Data.TEXT_MODE : null
          };
        };
        const restoreDebug = (snapshot) => {
          const dbg = G.__D || (G.__D = {});
          const data = snapshot && snapshot.debug ? snapshot.debug : {};
          Object.keys(dbg).forEach((key) => {
            if (!Object.prototype.hasOwnProperty.call(data, key)) delete dbg[key];
          });
          Object.keys(data || {}).forEach((key) => {
            dbg[key] = clone(data[key]);
          });
        };
        const restoreSnapshot = (snapshot) => {
          if (!snapshot || !snapshot.state || !G.__A || typeof G.__A.resetAll !== "function") return false;
          const snap = snapshot.state;
          const S = G.__S || G.State || {};
          G.__A.resetAll();
          if (typeof G.__A.seedPlayers === "function") G.__A.seedPlayers();
          S.isStarted = !!snap.isStarted;
          Object.assign(S.npc || {}, clone(snap.npc || {}));
          withPoints(() => Object.assign(S.me || {}, clone(snap.me || {})));
          S.rep = Number.isFinite(snap.rep) ? (snap.rep | 0) : 0;
          S.influence = Number.isFinite(snap.influence) ? (snap.influence | 0) : 0;
          const currentPlayers = S.players || {};
          const snapPlayers = snap.players || {};
          const restoredPlayers = {};
          Object.keys(snapPlayers).forEach((id) => {
            const restored = currentPlayers[id] || {};
            const source = clone(snapPlayers[id]) || {};
            withPoints(() => {
              if (Object.prototype.hasOwnProperty.call(source, "points")) restored.points = Number.isFinite(source.points) ? (source.points | 0) : 0;
            });
            Object.keys(source).forEach((key) => {
              if (key === "points") return;
              restored[key] = source[key];
            });
            restoredPlayers[id] = restored;
          });
          S.players = restoredPlayers;
          S.points = clone(snap.points || {});
          S.progress = clone(snap.progress || {});
          S.training = clone(snap.training || {});
          S.dayIndex = Number.isFinite(snap.dayIndex) ? (snap.dayIndex | 0) : 0;
          S.chat = clone(snap.chat || []);
          S.chatAutoReplyNonceByMessageId = clone(snap.chatAutoReplyNonceByMessageId || {});
          if (S.chat && typeof S.chat === "object") S.chat.autoReplyNonceByMessageId = S.chatAutoReplyNonceByMessageId;
          S.dm = clone(snap.dm || {});
          S.reports = clone(snap.reports || {});
          S.jailed = clone(snap.jailed || {});
          S.victimByRole = clone(snap.victimByRole || {});
          S.revengeUntil = Number.isFinite(snap.revengeUntil) ? snap.revengeUntil : 0;
          S.battleCooldowns = clone(snap.battleCooldowns || {});
          S.battleProvocationCooldowns = clone(snap.battleProvocationCooldowns || {});
          S.battles = clone(snap.battles || []);
          S.events = clone(snap.events || []);
          S.lottery = clone(snap.lottery || {});
          S.flags = clone(snap.flags || {});
          S.eventsMeta = clone(snap.eventsMeta || {});
          S.vote = clone(snap.vote || {});
          S.securityFlags = clone(snap.securityFlags || {});
          S.sightings = clone(snap.sightings || {});
          S.assignedCopId = snap.assignedCopId || null;
          S._seededNPCs = !!snap._seededNPCs;
          S.copCooldowns = S.reports && S.reports.copCooldowns ? S.reports.copCooldowns : {};
          S.provocationCooldowns = S.battleProvocationCooldowns;
          syncMoney();
          restoreDebug(snapshot);
          const sec = G.__SEC || null;
          if (sec && sec.buckets && typeof sec.buckets.clear === "function") {
            sec.buckets.clear();
            (snapshot.securityBuckets || []).forEach((entry) => {
              if (Array.isArray(entry) && entry.length === 2) sec.buckets.set(entry[0], entry[1]);
            });
          }
          setProfile(snapshot.uiProfile || "default");
          if (G.Data && typeof snapshot.textMode === "string") G.Data.TEXT_MODE = snapshot.textMode;
          if (G.UI && typeof G.UI.renderAll === "function") {
            try { G.UI.renderAll(); } catch (_) {}
          }
          return true;
        };
        const pickTarget = () => {
          const S = G.__S || G.State || {};
          const candidates = Object.values(S.players || {}).filter((p) => {
            const role = String(p && (p.role || p.type) || "").toLowerCase();
            return p && p.npc && (role === "toxic" || role === "bandit" || role === "mafia");
          });
          candidates.sort((a, b) => String(a && a.id || "").localeCompare(String(b && b.id || "")));
          const target = candidates[0] || null;
          return target ? { id: String(target.id || ""), name: String(target.name || ""), role: String(target.role || target.type || "").toLowerCase() } : null;
        };
        const preparePass = (profileName) => {
          const baseline = { startMoney: 30, startRep: 0, startInfluence: 0 };
          const out = { ok: false, profile: profileName, baseline, target: null, startPointsTotal: null, state: null };
          if (!G.__A || typeof G.__A.resetAll !== "function" || typeof G.__A.seedPlayers !== "function") {
            out.reason = "state_reset_api_missing";
            return out;
          }
          G.__A.resetAll();
          G.__A.seedPlayers();
          const S = G.__S || G.State || {};
          setProfile(profileName);
          if (G.Data && typeof G.Data.TEXT_MODE === "string") G.Data.TEXT_MODE = profileName === "zoomer" ? "zoomer" : "millennial";
          withPoints(() => { S.me.points = baseline.startMoney; });
          S.me.name = "Smoke";
          S.me.influence = baseline.startInfluence;
          S.me.wins = 0;
          S.me.winsSinceInfluence = 0;
          S.rep = baseline.startRep;
          S.influence = 0;
          S.isStarted = true;
          if (S.flags && typeof S.flags === "object") S.flags.started = true;
          syncMoney();
          if (G.__D && typeof G.__D === "object") {
            G.__D.moneyLog = [];
            G.__D.moneyLogByBattle = {};
            G.__D.repeatRateLimitLog = [];
          }
          if (S.reports && typeof S.reports === "object") {
            S.reports.lastAt = 0;
            S.reports.history = {};
            S.reports.copCooldowns = {};
            S.reports.pendingByActorId = {};
            S.reports.pendingById = {};
          }
          S.assignedCopId = null;
          S.copCooldowns = S.reports && S.reports.copCooldowns ? S.reports.copCooldowns : {};
          if (G.__SEC && G.__SEC.buckets && typeof G.__SEC.buckets.clear === "function") G.__SEC.buckets.clear();
          out.target = pickTarget();
          const pointsSnapshot = getPoints();
          out.startPointsTotal = pointsSnapshot && Number.isFinite(pointsSnapshot.total) ? pointsSnapshot.total : null;
          out.state = {
            money: getMoney(),
            rep: getRep(),
            pointsTotal: out.startPointsTotal,
            reportHistoryKeys: Object.keys((S.reports && S.reports.history) || {}).sort(),
            pendingKeys: Object.keys((S.reports && S.reports.pendingById) || {}).sort(),
            copCooldownKeys: Object.keys((S.reports && S.reports.copCooldowns) || {}).sort(),
            bucketCount: (G.__SEC && G.__SEC.buckets && typeof G.__SEC.buckets.size === "number") ? G.__SEC.buckets.size : null,
            moneyLogLen: (G.__D && Array.isArray(G.__D.moneyLog)) ? G.__D.moneyLog.length : null
          };
          out.ok = !!out.target
            && out.state.money === baseline.startMoney
            && out.state.rep === baseline.startRep
            && out.state.reportHistoryKeys.length === 0
            && out.state.pendingKeys.length === 0
            && out.state.copCooldownKeys.length === 0
            && (out.state.bucketCount === 0 || out.state.bucketCount === null)
            && out.state.moneyLogLen === 0;
          if (!out.ok && !out.reason) out.reason = "baseline_verification_failed";
          return out;
        };
        const captureCooldownMap = () => {
          const S = G.__S || G.State || {};
          return {
            reportCopCooldowns: numberMap((S.reports && S.reports.copCooldowns) || {}),
            battleCooldowns: numberMap(S.battleCooldowns || {}),
            battleProvocationCooldowns: numberMap(S.battleProvocationCooldowns || {}),
          };
        };
        const captureUiText = () => {
          const Data = G.Data || null;
          const t = Data && typeof Data.t === "function" ? Data.t.bind(Data) : null;
          const say = G.System && typeof G.System.say === "function" ? G.System.say.bind(G.System) : null;
          return {
            tieStart: text(t ? t("tie_start") : ""),
            battleDraw: text(t ? t("battle_draw") : ""),
            eventsEmpty: text(t ? t("events_empty") : ""),
            escapeButtonLabel: text(t ? t("escape_button_label", { X: 1 }) : ""),
            cooldownShort: text(say ? say("warnings", "cooldownShort", {}) : ""),
          };
        };
        const normalizeAction = (value) => {
          const res = value && typeof value === "object" ? value : {};
          return {
            ok: res.ok !== false,
            reason: String(res.reason || res.reasonCode || ""),
            outcome: String(res.outcome || ""),
            details: String(res.details || ""),
            pass: res.pass === true,
            economyOk: res.economyOk === true,
            pointsDiffOk: res.pointsDiffOk === true,
            cap: Number.isFinite(res.cap) ? (res.cap | 0) : null,
            totalVotes: Number.isFinite(res.totalVotes) ? (res.totalVotes | 0) : null,
          };
        };
        const normalizeBattle = (battle) => {
          const value = battle && typeof battle === "object" ? battle : {};
          const crowd = value.crowd && typeof value.crowd === "object" ? value.crowd : {};
          return {
            opponentId: String(value.opponentId || ""),
            attackerId: String(value.attackerId || ""),
            defenderId: String(value.defenderId || ""),
            status: String(value.status || ""),
            result: String(value.result || ""),
            resolved: value.resolved === true,
            finished: value.finished === true,
            draw: value.draw === true,
            crowd: {
              votesA: Number.isFinite(crowd.votesA) ? (crowd.votesA | 0) : 0,
              votesB: Number.isFinite(crowd.votesB) ? (crowd.votesB | 0) : 0,
              aVotes: Number.isFinite(crowd.aVotes) ? (crowd.aVotes | 0) : 0,
              bVotes: Number.isFinite(crowd.bVotes) ? (crowd.bVotes | 0) : 0,
              cap: Number.isFinite(crowd.cap) ? (crowd.cap | 0) : 0,
              totalPlayers: Number.isFinite(crowd.totalPlayers) ? (crowd.totalPlayers | 0) : 0,
              decided: crowd.decided === true,
            }
          };
        };
        const structuralPayload = (pass) => ({
          moneyLog: pass.moneyLog,
          econDelta: pass.econDelta,
          repDelta: pass.repDelta,
          pointsDelta: pass.pointsDelta,
          cooldowns: pass.cooldowns,
          battleResult: pass.battleResult,
        });
        const runPass = (profileName) => {
          const prep = preparePass(profileName);
          const out = {
            profile: profileName,
            prep,
            target: prep.target,
            reportResult: null,
            battleRaw: null,
            battleResult: null,
            moneyLog: [],
            econDelta: null,
            repDelta: null,
            pointsDelta: null,
            cooldowns: null,
            visibleUiText: null,
            ok: false
          };
          if (!prep.ok) {
            out.reportResult = { ok: false, reason: prep.reason || "sandbox_prepare_failed" };
            out.battleRaw = { ok: false, reason: prep.reason || "sandbox_prepare_failed" };
            return out;
          }
          const startRep = getRep();
          const startPoints = prep.startPointsTotal;
          const logStart = (G.__D && Array.isArray(G.__D.moneyLog)) ? G.__D.moneyLog.length : 0;
          out.reportResult = (G.__A && typeof G.__A.applyReportByRole === "function")
            ? G.__A.applyReportByRole(prep.target.name, { actionId: `tone_profiles_step55_report_${profileName}` })
            : { ok: false, reason: "report_api_missing" };
          out.battleRaw = (G.__DEV && typeof G.__DEV.smokeBattleCrowdOutcomeOnce === "function")
            ? G.__DEV.smokeBattleCrowdOutcomeOnce({ allowParallel: false, forceMajoritySide: "attacker" })
            : { ok: false, reason: "battle_smoke_missing" };
          const endRep = getRep();
          const endPointsSnapshot = getPoints();
          const endPoints = endPointsSnapshot && Number.isFinite(endPointsSnapshot.total) ? endPointsSnapshot.total : null;
          const moneyRows = (G.__D && Array.isArray(G.__D.moneyLog)) ? G.__D.moneyLog.slice(logStart) : [];
          const battleId = out.battleRaw && out.battleRaw.battleId ? String(out.battleRaw.battleId) : "";
          const battleState = battleId
            ? ((G.__S && Array.isArray(G.__S.battles)) ? G.__S.battles.find((battle) => battle && String(battle.id) === battleId) : null)
            : null;
          out.moneyLog = moneyRows.map((row) => normalizeLogRow(row));
          out.repDelta = endRep - startRep;
          out.pointsDelta = (Number.isFinite(startPoints) && Number.isFinite(endPoints)) ? (endPoints - startPoints) : null;
          out.cooldowns = captureCooldownMap();
          out.visibleUiText = captureUiText();
          out.battleResult = normalizeBattle(battleState);
          out.econDelta = {
            report: normalizeAction(out.reportResult),
            battle: normalizeAction(out.battleRaw),
            moneyDelta: sumKind(out.moneyLog, "points"),
            repDelta: out.repDelta,
            pointsDelta: out.pointsDelta,
          };
          out.ok = !!(prep.ok && out.reportResult && out.battleRaw);
          return out;
        };
        const result = {
          buildTag: BUILD_TAG_FIX4,
          commit: COMMIT_FIX4,
          smokeVersion: SMOKE_VERSION_FIX4,
          ok: false,
          failures: [],
          forbiddenRemaining: [],
          missingCoverage: [],
          failedChecks: [],
          uiProfileIsTextSkin: false,
          gameplayUnchanged: false,
          saveHasNoYear: false,
          saveContainsOnlyUiProfile: false,
          profileDoesNotAffectBalance: false,
          profileNotInEcon: false,
          profileNotInMoneyLog: false,
          step51Ok: false,
          step52Ok: false,
          step53Ok: false,
          step54Ok: false,
          step55Ok: false,
        };
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        const miss = (code) => {
          if (result.missingCoverage.indexOf(code) < 0) result.missingCoverage.push(code);
        };
        const liveSnapshot = captureSnapshot();
        try {
          if (!G.__A || typeof G.__A.resetAll !== "function" || typeof G.__A.seedPlayers !== "function") miss("state_reset_api_missing");
          if (!(G.__A && typeof G.__A.applyReportByRole === "function")) miss("report_api_missing");
          if (!(G.__DEV && typeof G.__DEV.smokeBattleCrowdOutcomeOnce === "function")) miss("battle_smoke_missing");
          if (!(G.__DEV && typeof G.__DEV.sumPointsSnapshot === "function")) miss("sum_points_snapshot_missing");
          if (!(G.Data && typeof G.Data.t === "function")) miss("ui_text_resolver_missing");

          const codeTargets = [
            { label: "applyReportByRole", value: G.__A && G.__A.applyReportByRole },
            { label: "transferPoints", value: G.__A && G.__A.transferPoints },
            { label: "transferRep", value: G.__A && G.__A.transferRep },
            { label: "applyBattleOutcome", value: G.__A && G.__A.applyBattleOutcome },
            { label: "ConflictEconomy", value: G.ConflictEconomy },
            { label: "_ConflictEconomy", value: G._ConflictEconomy },
            { label: "moneyLog", value: G.__D && G.__D.moneyLog },
          ];
          const uiProfileRefs = [];
          const econRefs = [];
          const battleRefs = [];
          codeTargets.forEach((entry) => {
            if (!entry.value) return;
            let src = "";
            if (typeof entry.value === "function") src = Function.prototype.toString.call(entry.value);
            else {
              try { src = JSON.stringify(entry.value); } catch (_) { src = String(entry.value); }
            }
            if (/uiProfile/.test(src)) uiProfileRefs.push(entry.label);
            if ((/econ|moneyLog|uiProfile/i).test(src) && /uiProfile/i.test(src)) econRefs.push(entry.label);
            if ((/battle|cooldown|uiProfile/i).test(src) && /uiProfile/i.test(src)) battleRefs.push(entry.label);
          });
          if (uiProfileRefs.length) fail("uiProfile_refs_found", uiProfileRefs);
          if (econRefs.length) fail("econ_moneylog_uiProfile_refs_found", econRefs);
          if (battleRefs.length) fail("battle_cooldown_uiProfile_refs_found", battleRefs);

          const millennial = runPass("millennial");
          const zoomer = runPass("zoomer");
          const millennialVisible = millennial.visibleUiText || {};
          const zoomerVisible = zoomer.visibleUiText || {};
          result.uiProfileIsTextSkin = stable(millennialVisible) !== stable(zoomerVisible);
          result.profileNotInMoneyLog = stable(millennial.moneyLog) === stable(zoomer.moneyLog);
          result.profileNotInEcon = stable(millennial.econDelta) === stable(zoomer.econDelta)
            && millennial.repDelta === zoomer.repDelta
            && millennial.pointsDelta === zoomer.pointsDelta;
          result.profileDoesNotAffectBalance = stable(millennial.cooldowns) === stable(zoomer.cooldowns)
            && stable(millennial.battleResult) === stable(zoomer.battleResult)
            && stable(structuralPayload(millennial)) === stable(structuralPayload(zoomer));
          result.gameplayUnchanged = result.profileNotInEcon === true
            && result.profileNotInMoneyLog === true
            && result.profileDoesNotAffectBalance === true;
          const saveProbe = (() => {
            const save = (G.__S && G.__S.save && typeof G.__S.save === "object") ? G.__S.save : {};
            const keys = Object.keys(save).sort();
            const forbiddenYearPaths = [];
            const seen = new Set();
            const yearLikeKey = /(^year$|birth.?year|birth.?year.?input|fantasy.?year|born.?year|real.?year)/i;
            const walk = (value, path) => {
              if (!value || typeof value !== "object") return;
              if (seen.has(value)) return;
              seen.add(value);
              Object.keys(value).forEach((key) => {
                const nextPath = path ? `${path}.${key}` : key;
                if (yearLikeKey.test(String(key))) forbiddenYearPaths.push(nextPath);
                walk(value[key], nextPath);
              });
            };
            walk(save, "");
            return {
              save,
              keys,
              forbiddenYearPaths,
              hasYear: forbiddenYearPaths.length > 0,
              onlyUiProfile: keys.length === 1 && keys[0] === "uiProfile"
            };
          })();
          result.saveHasNoYear = saveProbe.hasYear === false;
          result.saveContainsOnlyUiProfile = saveProbe.onlyUiProfile === true;
          result.step51Ok = !!(G.__DEV && typeof G.__DEV.smokeToneProfilesStep51UiOnlyBoundaryFix5 === "function" && G.__DEV.smokeToneProfilesStep51UiOnlyBoundaryFix5().ok);
          result.step52Ok = !!(G.__DEV && typeof G.__DEV.smokeToneProfilesStep52TextResolverOnly === "function" && G.__DEV.smokeToneProfilesStep52TextResolverOnly().ok);
          result.step53Ok = !!(G.__DEV && typeof G.__DEV.smokeToneProfilesStep53MoneyLogLock === "function" && G.__DEV.smokeToneProfilesStep53MoneyLogLock().ok);
          result.step54Ok = !!(G.__DEV && typeof G.__DEV.smokeToneProfilesStep54EconLockFix2 === "function" && G.__DEV.smokeToneProfilesStep54EconLockFix2().ok);
          result.step55Ok = !!(millennial.ok && zoomer.ok && result.uiProfileIsTextSkin && result.gameplayUnchanged && result.saveHasNoYear && result.saveContainsOnlyUiProfile);
          if (!result.uiProfileIsTextSkin) fail("ui_profile_text_skin_mismatch", { millennial: millennialVisible, zoomer: zoomerVisible });
          if (!result.profileNotInMoneyLog) fail("profile_in_moneyLog", { millennial: millennial.moneyLog, zoomer: zoomer.moneyLog });
          if (!result.profileNotInEcon) fail("profile_in_econ", { millennial: millennial.econDelta, zoomer: zoomer.econDelta });
          if (!result.profileDoesNotAffectBalance) fail("profile_affects_balance", { millennial: millennial.battleResult, zoomer: zoomer.battleResult });
          if (!result.saveHasNoYear) fail("save_has_year", { save: saveProbe.save, forbiddenYearPaths: saveProbe.forbiddenYearPaths });
          if (!result.saveContainsOnlyUiProfile) fail("save_not_uiProfile_only", saveProbe.keys);
          if (!(result.step51Ok && result.step52Ok && result.step53Ok && result.step54Ok && result.step55Ok)) {
            fail("step_smoke_dependency_failed", {
              step51Ok: result.step51Ok,
              step52Ok: result.step52Ok,
              step53Ok: result.step53Ok,
              step54Ok: result.step54Ok,
              step55Ok: result.step55Ok
            });
          }
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        } finally {
          restoreSnapshot(liveSnapshot);
        }
        result.ok = result.failures.length === 0
          && result.forbiddenRemaining.length === 0
          && result.missingCoverage.length === 0
          && result.failedChecks.length === 0
          && result.uiProfileIsTextSkin === true
          && result.gameplayUnchanged === true
          && result.saveHasNoYear === true
          && result.saveContainsOnlyUiProfile === true
          && result.profileDoesNotAffectBalance === true
          && result.profileNotInEcon === true
          && result.profileNotInMoneyLog === true
          && result.step51Ok === true
          && result.step52Ok === true
          && result.step53Ok === true
          && result.step54Ok === true
          && result.step55Ok === true;
        return result;
      };
      if (!G.Dev || typeof G.Dev !== "object") G.Dev = {};
      G.Dev.smokeToneProfilesStep5RuntimeAcceptanceFix2 = G.__DEV.smokeToneProfilesStep5RuntimeAcceptanceFix2;
      G.Dev.smokeToneProfilesStep5RuntimeAcceptanceFix3 = G.__DEV.smokeToneProfilesStep5RuntimeAcceptanceFix3;
      G.Dev.smokeToneProfilesStep5RuntimeAcceptanceFix4 = G.__DEV.smokeToneProfilesStep5RuntimeAcceptanceFix4;
    }
    if (typeof G.__DEV.smokeRuntimeSourceDiagnosis !== "function") {
      G.__DEV.smokeRuntimeSourceDiagnosis = function smokeRuntimeSourceDiagnosis() {
        const scripts = Array.from(document.scripts || []).map((node) => {
          const src = node && node.getAttribute ? node.getAttribute("src") : "";
          return {
            src: src || "",
            type: node && node.getAttribute ? (node.getAttribute("type") || "") : "",
            defer: !!(node && node.defer),
            async: !!(node && node.async),
          };
        });
        const loadedSources = scripts.map((entry) => entry.src).filter(Boolean);
        const currentScript = document.currentScript || null;
        const currentScriptSrc = currentScript && currentScript.getAttribute ? (currentScript.getAttribute("src") || "") : "";
        const runtimeBuildTag = (typeof window !== "undefined" && window.__BUILD_TAG__) || G.__DEV.buildTag || G.__buildTag || null;
        const runtimeSmokeVersion = typeof G.__DEV.smokeBirthYearNoPersistence === "function"
          ? "step6_2_birth_year_no_persistence_smoke_v20260613_004"
          : (typeof G.__DEV.smokeBirthYearValueContract === "function"
            ? "step6_2_birth_year_no_persistence_smoke_v20260613_004"
            : (typeof G.__DEV.smokeBirthYearStartScreenUi === "function" ? "step6_2_birth_year_no_persistence_smoke_v20260613_004" : null));
        const runtimeCommit = (typeof window !== "undefined" && window.__COMMIT__) || G.__DEV.commit || G.__commit || null;
        const pageUrl = typeof location !== "undefined" ? location.href : null;
        const pathname = typeof location !== "undefined" ? location.pathname : null;
        const origin = typeof location !== "undefined" ? location.origin : null;
        const sourceFlavor = /\/docs\//.test(pageUrl || "") || /\/docs\//.test(currentScriptSrc || "")
          ? "docs"
          : (/\/AsyncScene\/Web\//.test(pageUrl || "") || /\/AsyncScene\/Web\//.test(currentScriptSrc || "") ? "AsyncScene/Web" : "unknown");
        const htmlSource = currentScriptSrc && /ui-boot\.js$/.test(currentScriptSrc)
          ? currentScriptSrc.replace(/ui\/ui-boot\.js.*$/, "index.html")
          : null;
        const runtimeBundleHints = loadedSources.filter((src) => /(?:ui\/ui-boot\.js|dev\/dev-checks\.js|index\.html)/.test(src));
        const docsBuildTag = G.__DEV.buildTag || null;
        const docsSmokeVersion = typeof G.__DEV.smokeBirthYearNoPersistence === "function"
          ? "step6_2_birth_year_no_persistence_smoke_v20260613_004"
          : (typeof G.__DEV.smokeBirthYearStartScreenUi === "function"
            ? "step6_2_birth_year_no_persistence_smoke_v20260613_004"
            : null);
        const asyncBuildTag = (typeof window !== "undefined" && window.__BUILD_TAG__) || null;
        const asyncSmokeVersion = runtimeSmokeVersion;
        return {
          ok: true,
          buildTag: runtimeBuildTag,
          smokeVersion: runtimeSmokeVersion,
          commit: runtimeCommit,
          pageUrl,
          pathname,
          origin,
          indexHtmlSource: htmlSource,
          jsFilesLoaded: loadedSources,
          runtimeFlavor: sourceFlavor,
          docsBuildTag,
          asyncWebBuildTag: asyncBuildTag,
          buildTagsMatch: docsBuildTag === asyncBuildTag,
          docsSmokeVersion,
          asyncWebSmokeVersion: asyncSmokeVersion,
          smokeVersionsMatch: docsSmokeVersion === asyncSmokeVersion,
          currentScriptSrc,
          runtimeBundleHints,
          detectedMismatch: {
            buildTagMismatch: docsBuildTag !== asyncBuildTag,
            smokeVersionMismatch: docsSmokeVersion !== asyncSmokeVersion,
            indexMismatch: !htmlSource || !/index\.html$/.test(htmlSource),
          },
          sourceLocations: {
            indexHtml: ["AsyncScene/Web/index.html", "docs/index.html"],
            uiBoot: ["AsyncScene/Web/ui/ui-boot.js", "docs/ui/ui-boot.js"],
            devChecks: ["AsyncScene/Web/dev/dev-checks.js", "docs/dev/dev-checks.js"],
          }
        };
      };
    }
    if (typeof G.__DEV.smokeZoomerForbiddenRulesOnce !== "function") {
      const fetchTextSync = (path) => {
        try {
          const xhr = new XMLHttpRequest();
          xhr.open("GET", path, false);
          xhr.send(null);
          if (xhr.status >= 200 && xhr.status < 300) {
            return { ok: true, text: xhr.responseText || "" };
          }
          return { ok: false, reason: `http_${xhr.status || 0}` };
        } catch (_) {
          return { ok: false, reason: "xhr_exception" };
        }
      };
      const fetchDoc = (fileName) => {
        const candidates = [
          `/__dev__/docs/${fileName}`,
          `/docs/${fileName}`,
          `/AsyncScene/${fileName}`,
          `/${fileName}`,
        ];
        let last = { ok: false, reason: "unavailable", path: null };
        for (const path of candidates) {
          const res = fetchTextSync(path);
          const annotated = { ...res, path };
          if (res.ok) return annotated;
          last = annotated;
        }
        return last;
      };
      G.__DEV.smokeZoomerForbiddenRulesOnce = function smokeZoomerForbiddenRulesOnce() {
        const buildTag = (typeof window !== "undefined" && window.__BUILD_TAG__) || G.__DEV.buildTag || G.__buildTag || null;
        const commit = (typeof window !== "undefined" && window.__COMMIT__) || G.__DEV.commit || G.__commit || null;
        const result = {
          ok: false,
          buildTag,
          commit,
          tablePath: null,
          profilePath: null,
          millennialPath: null,
          failures: [],
          forbiddenRemaining: [],
          missingCoverage: [],
          failedChecks: []
        };
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        try {
          const zoomRes = fetchDoc("UI_PROFILE_ZOOMER_DIFF.md");
          const millennialRes = fetchDoc("UI_PROFILE_MILLENNIAL.md");
          result.tablePath = zoomRes.path || null;
          result.profilePath = result.tablePath;
          result.millennialPath = millennialRes.path || null;
          const zoomText = String((zoomRes && zoomRes.text) || "");
          if (!zoomRes.ok) fail("doc_exists", zoomRes.reason || "unavailable");
          if (!millennialRes.ok) fail("millennial_source", millennialRes.reason || "unavailable");
          if (!/## Forbidden section/i.test(zoomText)) fail("forbidden_section", "missing_forbidden_section");
          [
            'no long explanations',
            'no "давай разберём"',
            'no unnecessary reasons/excuses',
            'no teen slang',
            'no meme wording',
            'no artificial "youth" voice',
            'no teacher/mentor tone',
            'no showing off intelligence'
          ].forEach((rule) => {
            if (!new RegExp(rule.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(zoomText)) {
              fail("forbidden_rules", { missing: rule });
            }
          });
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        }
        result.ok = result.failures.length === 0
          && result.forbiddenRemaining.length === 0
          && result.missingCoverage.length === 0
          && result.failedChecks.length === 0;
        return result;
      };
      if (!G.Dev || typeof G.Dev !== "object") G.Dev = {};
      G.Dev.smokeZoomerForbiddenRulesOnce = G.__DEV.smokeZoomerForbiddenRulesOnce;
    }
  }

  function boot(UI) {
    const G = window.Game || {};
    bindLocations(UI);

    ensureStartScreenVisible(UI);
    applyStartScreenContent(UI);
    installOnboardingDevHooks(UI);

    // Build players once so name lists exist (mentions, DM roster), but do NOT start loops yet
    if (!UI.S.players || Object.keys(UI.S.players).length === 0) {
      UI.buildPlayers && UI.buildPlayers();
    }

    // Bind events
    bindUI(UI);
    if (typeof bindChatHeaderLocations === "function") bindChatHeaderLocations(UI);
    bindBlockHeaderToggles(UI);
    if (UI.applyMobilePanelDefaults) UI.applyMobilePanelDefaults();

    // Render minimal UI only
    UI.renderAllMinimal && UI.renderAllMinimal();

    // Fresh/clean state must leave the existing start screen visible even if
    // earlier boot work or stale DOM attributes hid it before content binding.
    keepFreshStartScreenVisible(UI);

    try {
      UI.S.flags = UI.S.flags || {};
      if (typeof UI.S.flags.devChecks !== "boolean") {
        let dev = false;
        const qs = (typeof location !== "undefined" && location.search) ? location.search : "";
        if (qs) {
          try {
            const params = new URLSearchParams(qs);
            dev = params.get("dev") === "1";
          } catch (_) {}
        }
        UI.S.flags.devChecks = dev;
      }
      if (UI.S.flags.devChecks && G.__DEV && typeof G.__DEV.selfCheck === "function") {
        const selfCheckMode = "smoke";
        setTimeout(() => {
          try {
            const selfCheckOptions = { mutate: false };
            selfCheckOptions["mode"] = selfCheckMode;
            G.__DEV.selfCheck(selfCheckOptions);
          } catch (_) {}
        }, 0);
      }
    } catch (_) {}

    // Removed other renderAll / renderLocations calls
  }

  function initWithRetry() {
    const UI = getUI();
    if (!UI) {
      // ui-core.js not loaded yet or not executed
      setTimeout(initWithRetry, 30);
      return;
    }
    window.__uiBooted = true;
    boot(UI);
  }

  installGlobalDiagnostics();
  whenReady(initWithRetry);
  if (window.Game) {
    const G = window.Game;
    if (!G.__DEV) G.__DEV = {};
    if (!G.Dev) G.Dev = {};
    if (typeof G.__DEV.smokeZoomerFeelStep650NpcSpeechInventory !== "function") {
      G.__DEV.smokeZoomerFeelStep650NpcSpeechInventory = function smokeZoomerFeelStep650NpcSpeechInventory() {
        const buildTag = "build_2026_06_14_step6_5_0_zoomer_feel_npc_speech_inventory";
        const commit = "step6_5_0_zoomer_feel_npc_speech_inventory";
        const smokeVersion = "step6_5_0_zoomer_feel_npc_speech_inventory_v20260614_001";
        const stableJson = (value) => {
          try { return JSON.stringify(value); } catch (_) { return String(value); }
        };
        const snapshotState = () => ({
          rep: Number.isFinite(G.__S && G.__S.rep) ? (G.__S.rep | 0) : 0,
          points: Number.isFinite(G.__S && G.__S.me && G.__S.me.points) ? (G.__S.me.points | 0) : 0,
          moneyLog: stableJson(G.__D && Array.isArray(G.__D.moneyLog) ? G.__D.moneyLog : []),
          moneyLogByBattle: stableJson(G.__D && G.__D.moneyLogByBattle ? G.__D.moneyLogByBattle : {}),
          econ: stableJson(G.ECON || {}),
          balances: stableJson(G.__S && G.__S.balances ? G.__S.balances : {}),
          votes: stableJson(G.__S && G.__S.votes ? G.__S.votes : {}),
          conflict: stableJson(G.__S && G.__S.conflict ? G.__S.conflict : {}),
          uiProfile: G.Data && typeof G.Data.getUiProfile === "function" ? G.Data.getUiProfile() : (G.Data && G.Data.UI_PROFILE) || ""
        });
        const result = { buildTag, commit, smokeVersion, ok: false, failures: [], forbiddenRemaining: [], missingCoverage: [], failedChecks: [], inventory: [], summary: { totalCandidates: 0, npcSpeechCount: 0, npcReactionCount: 0, crowdCommentCount: 0, hardcodedCount: 0, resolverCount: 0, recommendedForStep65Count: 0 } };
        const addUnique = (list, value) => { const key = stableJson(value); if (!list.some((item) => stableJson(item) === key)) list.push(value); };
        const fail = (check, detail) => { addUnique(result.failedChecks, check); addUnique(result.failures, detail === undefined ? check : { check, detail }); };
        const addRow = (row) => {
          const next = Object.assign({}, row);
          if (!next.key || !next.text || !next.filePath || !next.category) fail("inventory_row_missing_fields", next);
          if (typeof next.hardcoded === "undefined" || typeof next.resolverUsed === "undefined" || typeof next.recommendedForStep65 === "undefined") fail("inventory_row_missing_flags", next);
          result.inventory.push(next);
        };
        const addString = (key, text, filePath, category, opts = {}) => {
          const value = String(text == null ? "" : text).trim();
          if (!value) return;
          addRow({ key, text: value, filePath, category, currentlyProfileAware: !!opts.currentlyProfileAware, resolverUsed: !!opts.resolverUsed, hardcoded: !!opts.hardcoded, recommendedForStep65: !!opts.recommendedForStep65, notes: String(opts.notes || "") });
        };
        const walk = (root, source, filePath, category, opts = {}) => {
          if (root == null) return;
          if (typeof root === "string") return addString(source, root, filePath, category, opts);
          if (Array.isArray(root)) return root.forEach((item, index) => walk(item, `${source}.${index}`, filePath, category, opts));
          if (typeof root === "object") Object.keys(root).forEach((key) => walk(root[key], `${source}.${key}`, filePath, category, opts));
        };
        const addRoleLines = (source, lines, category, opts = {}) => (Array.isArray(lines) ? lines : []).forEach((line, index) => addString(`${source}.${index}`, line, opts.filePath || "AsyncScene/Web/npcs.js", category, opts));
        const beforeState = snapshotState();
        try {
          const D = G.Data || {};
          const NPC = G.NPC || {};
          const speech = G.NPCSpeech || {};
          addRoleLines("NPC.SAY.toxic.m", NPC.SAY && NPC.SAY.toxic && NPC.SAY.toxic.m, "npc_speech", { filePath: "AsyncScene/Web/npcs.js", currentlyProfileAware: false, resolverUsed: false, hardcoded: true, recommendedForStep65: true });
          addRoleLines("NPC.SAY.toxic.f", NPC.SAY && NPC.SAY.toxic && NPC.SAY.toxic.f, "npc_speech", { filePath: "AsyncScene/Web/npcs.js", currentlyProfileAware: false, resolverUsed: false, hardcoded: true, recommendedForStep65: true });
          addRoleLines("NPC.SAY.bandit.m", NPC.SAY && NPC.SAY.bandit && NPC.SAY.bandit.m, "npc_speech", { filePath: "AsyncScene/Web/npcs.js", currentlyProfileAware: false, resolverUsed: false, hardcoded: true, recommendedForStep65: true });
          addRoleLines("NPC.SAY.bandit.f", NPC.SAY && NPC.SAY.bandit && NPC.SAY.bandit.f, "npc_speech", { filePath: "AsyncScene/Web/npcs.js", currentlyProfileAware: false, resolverUsed: false, hardcoded: true, recommendedForStep65: true });
          addRoleLines("NPC.SAY.cop.m", NPC.SAY && NPC.SAY.cop && NPC.SAY.cop.m, "npc_dm", { filePath: "AsyncScene/Web/npcs.js", currentlyProfileAware: true, resolverUsed: true, hardcoded: true, recommendedForStep65: true });
          addRoleLines("NPC.SAY.cop.f", NPC.SAY && NPC.SAY.cop && NPC.SAY.cop.f, "npc_dm", { filePath: "AsyncScene/Web/npcs.js", currentlyProfileAware: true, resolverUsed: true, hardcoded: true, recommendedForStep65: true });
          addRoleLines("NPC.SAY.mafia.m", NPC.SAY && NPC.SAY.mafia && NPC.SAY.mafia.m, "npc_speech", { filePath: "AsyncScene/Web/npcs.js", currentlyProfileAware: true, resolverUsed: true, hardcoded: true, recommendedForStep65: true });
          addRoleLines("NPC.SAY.mafia.f", NPC.SAY && NPC.SAY.mafia && NPC.SAY.mafia.f, "npc_speech", { filePath: "AsyncScene/Web/npcs.js", currentlyProfileAware: true, resolverUsed: true, hardcoded: true, recommendedForStep65: true });
          addRoleLines("NPC.SAY.crowd.m", NPC.SAY && NPC.SAY.crowd && NPC.SAY.crowd.m, "crowd_comment", { filePath: "AsyncScene/Web/npcs.js", currentlyProfileAware: false, resolverUsed: false, hardcoded: true, recommendedForStep65: true });
          addRoleLines("NPC.SAY.crowd.f", NPC.SAY && NPC.SAY.crowd && NPC.SAY.crowd.f, "crowd_comment", { filePath: "AsyncScene/Web/npcs.js", currentlyProfileAware: false, resolverUsed: false, hardcoded: true, recommendedForStep65: true });
          addRoleLines("NPC.DM_PROFILE_LINES.cop", NPC.DM_PROFILE_LINES && NPC.DM_PROFILE_LINES.cop, "npc_dm", { filePath: "AsyncScene/Web/npcs.js", currentlyProfileAware: true, resolverUsed: true, hardcoded: true, recommendedForStep65: true });
          addRoleLines("NPC.DM_PROFILE_LINES.mafia", NPC.DM_PROFILE_LINES && NPC.DM_PROFILE_LINES.mafia, "npc_dm", { filePath: "AsyncScene/Web/npcs.js", currentlyProfileAware: true, resolverUsed: true, hardcoded: true, recommendedForStep65: true });
          addRoleLines("NPC.DM_PROFILE_LINES.bandit", NPC.DM_PROFILE_LINES && NPC.DM_PROFILE_LINES.bandit, "npc_dm", { filePath: "AsyncScene/Web/npcs.js", currentlyProfileAware: false, resolverUsed: false, hardcoded: true, recommendedForStep65: true });
          addRoleLines("NPC.DM_PROFILE_LINES.toxic", NPC.DM_PROFILE_LINES && NPC.DM_PROFILE_LINES.toxic, "npc_dm", { filePath: "AsyncScene/Web/npcs.js", currentlyProfileAware: false, resolverUsed: false, hardcoded: true, recommendedForStep65: true });
          addRoleLines("NPC.DM_PROFILE_LINES.neutral", NPC.DM_PROFILE_LINES && NPC.DM_PROFILE_LINES.neutral, "npc_dm", { filePath: "AsyncScene/Web/npcs.js", currentlyProfileAware: false, resolverUsed: false, hardcoded: true, recommendedForStep65: true });
          addRoleLines("villainQuestions", typeof villainQuestions !== "undefined" ? villainQuestions : [], "npc_dm", { filePath: "AsyncScene/Web/npcs.js", currentlyProfileAware: false, resolverUsed: false, hardcoded: true, recommendedForStep65: true });
          addRoleLines("villainChallenges", typeof villainChallenges !== "undefined" ? villainChallenges : [], "conflict_feed", { filePath: "AsyncScene/Web/npcs.js", currentlyProfileAware: false, resolverUsed: false, hardcoded: true, recommendedForStep65: true });
          Object.keys(D.COP_TEMPLATES || {}).forEach((group) => walk(D.COP_TEMPLATES[group], `Data.COP_TEMPLATES.${group}`, "AsyncScene/Web/data.js", (group === "warnings" || group === "chatReplies" || group === "cooldownReplies") ? "npc_dm" : "npc_speech", { currentlyProfileAware: true, resolverUsed: true, hardcoded: true, recommendedForStep65: true }));
          walk(D.NPC_CHAT_LINES, "Data.NPC_CHAT_LINES", "AsyncScene/Web/data.js", "crowd_comment", { currentlyProfileAware: false, resolverUsed: false, hardcoded: true, recommendedForStep65: true });
          Object.keys(D.NPC_EVENT_TEMPLATES || {}).forEach((group) => walk(D.NPC_EVENT_TEMPLATES[group], `Data.NPC_EVENT_TEMPLATES.${group}`, "AsyncScene/Web/data.js", "conflict_feed", { currentlyProfileAware: true, resolverUsed: true, hardcoded: true, recommendedForStep65: true }));
          walk(speech.TEMPLATES_BY_LOCALE && speech.TEMPLATES_BY_LOCALE.ru, "NPCSpeech.TEMPLATES_BY_LOCALE.ru", "AsyncScene/Web/npcs.js", "npc_speech", { currentlyProfileAware: true, resolverUsed: true, hardcoded: false, recommendedForStep65: true });
          walk(speech.ROLE_PROFILES, "NPCSpeech.ROLE_PROFILES", "AsyncScene/Web/npcs.js", "npc_speech", { currentlyProfileAware: true, resolverUsed: false, hardcoded: false, recommendedForStep65: false });
          const deduped = [];
          const seen = new Set();
          result.inventory.forEach((row) => { if (!row || !row.key || seen.has(row.key)) return; seen.add(row.key); deduped.push(row); });
          result.inventory = deduped;
          result.summary.totalCandidates = result.inventory.length;
          result.summary.npcSpeechCount = result.inventory.filter((row) => row.category === "npc_speech").length;
          result.summary.npcReactionCount = result.inventory.filter((row) => row.category === "npc_reaction").length;
          result.summary.crowdCommentCount = result.inventory.filter((row) => row.category === "crowd_comment").length;
          result.summary.hardcodedCount = result.inventory.filter((row) => row.hardcoded === true).length;
          result.summary.resolverCount = result.inventory.filter((row) => row.resolverUsed === true).length;
          result.summary.recommendedForStep65Count = result.inventory.filter((row) => row.recommendedForStep65 === true).length;
          if (!result.inventory.length) fail("inventory_empty", "no_candidates");
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        }
        const afterState = snapshotState();
        if (stableJson(beforeState) !== stableJson(afterState)) fail("state_mutated_during_smoke", { beforeState, afterState });
        result.ok = result.inventory.length > 0 && result.summary.totalCandidates > 0 && result.failures.length === 0 && result.forbiddenRemaining.length === 0 && result.missingCoverage.length === 0 && result.failedChecks.length === 0;
        return result;
      };
      G.Dev.smokeZoomerFeelStep650NpcSpeechInventory = G.__DEV.smokeZoomerFeelStep650NpcSpeechInventory;
    }
    if (typeof G.__DEV.smokeZoomerFeelStep650NpcSpeechInventoryPage !== "function") {
      G.__DEV.smokeZoomerFeelStep650NpcSpeechInventoryPage = function smokeZoomerFeelStep650NpcSpeechInventoryPage(pageIndex) {
        const buildTag = "build_2026_06_14_step6_5_0_zoomer_feel_npc_speech_inventory";
        const commit = "step6_5_0_zoomer_feel_npc_speech_inventory";
        const smokeVersion = "step6_5_0_zoomer_feel_npc_speech_inventory_page_v20260615_001";
        const base = typeof G.__DEV.smokeZoomerFeelStep650NpcSpeechInventory === "function" ? G.__DEV.smokeZoomerFeelStep650NpcSpeechInventory() : null;
        const rows = base && Array.isArray(base.inventory) ? base.inventory : [];
        const pageSize = 25;
        const totalPages = rows.length ? Math.ceil(rows.length / pageSize) : 0;
        const index = Number.isFinite(pageIndex) ? Math.max(0, Math.floor(pageIndex)) : 0;
        const start = index * pageSize;
        const pageRows = rows.slice(start, start + pageSize).map((row) => ({
          key: row.key,
          text: row.text,
          filePath: row.filePath,
          category: row.category,
          currentlyProfileAware: !!row.currentlyProfileAware,
          resolverUsed: !!row.resolverUsed,
          hardcoded: !!row.hardcoded,
          recommendedForStep65: !!row.recommendedForStep65,
          notes: String(row.notes || "")
        }));
        const result = {
          buildTag,
          commit,
          smokeVersion,
          ok: !!(base && base.ok === true && rows.length > 0 && index < totalPages),
          pageIndex: index,
          pageSize,
          totalPages,
          rows: pageRows,
          failures: [],
          failedChecks: []
        };
        if (!base) {
          result.failures.push("inventory_unavailable");
          result.failedChecks.push("inventory_unavailable");
          result.ok = false;
        } else if (!rows.length) {
          result.failures.push("inventory_empty");
          result.failedChecks.push("inventory_empty");
          result.ok = false;
        } else if (index >= totalPages) {
          result.failures.push({ check: "page_out_of_range", detail: { pageIndex: index, totalPages } });
          result.failedChecks.push("page_out_of_range");
          result.ok = false;
        }
        return result;
      };
      G.Dev.smokeZoomerFeelStep650NpcSpeechInventoryPage = G.__DEV.smokeZoomerFeelStep650NpcSpeechInventoryPage;
    }
    if (typeof G.__DEV.smokeZoomerFeelStep650NpcSpeechInventoryFix1 !== "function") {
      G.__DEV.smokeZoomerFeelStep650NpcSpeechInventoryFix1 = function smokeZoomerFeelStep650NpcSpeechInventoryFix1() {
        const buildTag = "build_2026_06_14_step6_5_0_zoomer_feel_npc_speech_inventory";
        const commit = "step6_5_0_zoomer_feel_npc_speech_inventory";
        const smokeVersion = "step6_5_0_zoomer_feel_npc_speech_inventory_fix1_v20260615_001";
        const pageSize = 25;
        const base = typeof G.__DEV.smokeZoomerFeelStep650NpcSpeechInventory === "function" ? G.__DEV.smokeZoomerFeelStep650NpcSpeechInventory() : null;
        const rows = base && Array.isArray(base.inventory) ? base.inventory : [];
        const totalCandidates = rows.length;
        const totalPages = totalCandidates ? Math.ceil(totalCandidates / pageSize) : 0;
        const sampleLimit = 5;
        const categorySamples = Object.create(null);
        const addSample = (row) => {
          const category = String(row && row.category || "");
          if (!categorySamples[category]) categorySamples[category] = [];
          if (categorySamples[category].length < sampleLimit) {
            categorySamples[category].push({
              key: row.key,
              text: row.text,
              filePath: row.filePath,
              category: row.category,
              currentlyProfileAware: !!row.currentlyProfileAware,
              resolverUsed: !!row.resolverUsed,
              hardcoded: !!row.hardcoded,
              recommendedForStep65: !!row.recommendedForStep65,
              notes: String(row.notes || "")
            });
          }
        };
        rows.forEach((row) => addSample(row));
        const summary = {
          totalCandidates,
          npcSpeechCount: base && base.summary ? base.summary.npcSpeechCount || 0 : 0,
          npcReactionCount: base && base.summary ? base.summary.npcReactionCount || 0 : 0,
          crowdCommentCount: base && base.summary ? base.summary.crowdCommentCount || 0 : 0,
          npcDmCount: rows.filter((row) => row.category === "npc_dm").length,
          conflictFeedCount: rows.filter((row) => row.category === "conflict_feed").length,
          hardcodedCount: base && base.summary ? base.summary.hardcodedCount || 0 : 0,
          resolverCount: base && base.summary ? base.summary.resolverCount || 0 : 0,
          recommendedForStep65Count: base && base.summary ? base.summary.recommendedForStep65Count || 0 : 0,
          pageSize,
          totalPages
        };
        const pageCommands = Array.from({ length: totalPages }, (_, index) => `Game.__DEV.smokeZoomerFeelStep650NpcSpeechInventoryPage(${index})`);
        const result = {
          buildTag,
          commit,
          smokeVersion,
          ok: !!(base && base.ok === true && totalCandidates > 0 && (!base.failures || base.failures.length === 0) && (!base.forbiddenRemaining || base.forbiddenRemaining.length === 0) && (!base.missingCoverage || base.missingCoverage.length === 0) && (!base.failedChecks || base.failedChecks.length === 0)),
          failures: base && Array.isArray(base.failures) ? base.failures.slice() : [],
          forbiddenRemaining: base && Array.isArray(base.forbiddenRemaining) ? base.forbiddenRemaining.slice() : [],
          missingCoverage: base && Array.isArray(base.missingCoverage) ? base.missingCoverage.slice() : [],
          failedChecks: base && Array.isArray(base.failedChecks) ? base.failedChecks.slice() : [],
          summary,
          pageCommands,
          categorySamples
        };
        if (!base) {
          result.failures.push("inventory_unavailable");
          result.failedChecks.push("inventory_unavailable");
          result.ok = false;
        } else if (totalCandidates <= 0) {
          result.failures.push("inventory_empty");
          result.failedChecks.push("inventory_empty");
          result.ok = false;
        }
        return result;
      };
      G.Dev.smokeZoomerFeelStep650NpcSpeechInventoryFix1 = G.__DEV.smokeZoomerFeelStep650NpcSpeechInventoryFix1;
    }
    if (typeof G.__DEV.smokeZoomerFeelStep60RealUiTextInventory !== "function") {
      G.__DEV.smokeZoomerFeelStep60RealUiTextInventory = function smokeZoomerFeelStep60RealUiTextInventory() {
        const buildTag = "build_2026_06_14_step6_0_real_ui_text_inventory";
        const commit = "step6_0_real_ui_text_inventory";
        const smokeVersion = "step6_0_real_ui_text_inventory_v20260614_001";
        const result = { buildTag, commit, smokeVersion, ok: false, failures: [], forbiddenRemaining: [], missingCoverage: [], failedChecks: [], inventory: [], existingProfileKeys: [], suspectedGaps: [], summary: { totalCandidates: 0, profileAwareCount: 0, hardcodedCount: 0, resolverUsedCount: 0, suspectedGapCount: 0, coveredByStep61Count: 0, coveredByStep62Count: 0, coveredByStep63Count: 0, coveredByStep64Count: 0, recommendedForZoomerFeelCount: 0, highFrequencyRecommendedCount: 0 } };
        const stableJson = (value) => { try { return JSON.stringify(value); } catch (_) { return String(value); } };
        const pushUnique = (list, value) => { const key = stableJson(value); if (!list.some((item) => stableJson(item) === key)) list.push(value); };
        const fail = (check, detail) => { pushUnique(result.failedChecks, check); pushUnique(result.failures, detail === undefined ? check : { check, detail }); };
        const snapshotState = () => ({
          rep: Number.isFinite(G.__S && G.__S.rep) ? (G.__S.rep | 0) : 0,
          points: Number.isFinite(G.__S && G.__S.me && G.__S.me.points) ? (G.__S.me.points | 0) : 0,
          balances: stableJson(G.__S && G.__S.balances ? G.__S.balances : {}),
          moneyLog: stableJson(G.__D && Array.isArray(G.__D.moneyLog) ? G.__D.moneyLog : []),
          moneyLogByBattle: stableJson(G.__D && G.__D.moneyLogByBattle ? G.__D.moneyLogByBattle : {}),
          econ: stableJson(G.ECON || {}),
          votes: stableJson(G.__S && G.__S.votes ? G.__S.votes : {}),
          conflict: stableJson(G.__S && G.__S.conflict ? G.__S.conflict : {}),
          uiProfile: G.Data && typeof G.Data.getUiProfile === "function" ? G.Data.getUiProfile() : ((G.Data && G.Data.UI_PROFILE) || "")
        });
        const stepMap = {
          not_enough_money: "6.1", not_enough_stars: "6.1", purchase_success: "6.1", sale_success: "6.1", reward_received: "6.1", penalty_received: "6.1", generic_error: "6.1", generic_success: "6.1",
          conflict_win: "6.2", conflict_loss: "6.2", conflict_draw: "6.2", supported_majority: "6.2", supported_minority: "6.2", majority_won: "6.2", minority_lost: "6.2", conflict_finished: "6.2",
          money_received: "6.3", money_spent: "6.3", money_changed_positive: "6.3", money_changed_negative: "6.3", poverty_state: "6.3", rich_state: "6.3", bankrupt_state: "6.3", income_event: "6.3", expense_event: "6.3", economy_neutral: "6.3",
          reputation_increased: "6.4", reputation_decreased: "6.4", reputation_unchanged: "6.4", respect_gained: "6.4", respect_lost: "6.4", disrespect_event: "6.4", reputation_high: "6.4", reputation_low: "6.4", reputation_recovered: "6.4", reputation_damaged: "6.4"
        };
        const inventoryMap = Object.create(null);
        const addRow = (row) => {
          const next = Object.assign({ profileKey: "", notes: "", coveredByStep61To64: false, coveredByStep: "", frequencyGuess: "low" }, row || {});
          if (!next.key || !next.text || !next.filePath || !next.zone) fail("inventory_row_missing_fields", next);
          ["hardcoded", "resolverUsed", "currentlyProfileAware", "recommendedForZoomerFeel"].forEach((field) => { if (typeof next[field] === "undefined") fail("inventory_row_missing_flags", { field, row: next }); });
          const step = next.profileKey && stepMap[next.profileKey] ? stepMap[next.profileKey] : "";
          next.coveredByStep = next.coveredByStep || step;
          next.coveredByStep61To64 = !!(next.coveredByStep || (next.profileKey && stepMap[next.profileKey]));
          if (!inventoryMap[next.key]) inventoryMap[next.key] = next;
        };
        const addTextRow = (key, text, filePath, component, zone, opts = {}) => {
          const value = String(text == null ? "" : text).trim();
          if (!value) return;
          addRow({ key, text: value, filePath, component, zone, currentlyProfileAware: !!opts.currentlyProfileAware, resolverUsed: !!opts.resolverUsed, hardcoded: !!opts.hardcoded, profileKey: String(opts.profileKey || ""), frequencyGuess: opts.frequencyGuess || "low", recommendedForZoomerFeel: !!opts.recommendedForZoomerFeel, notes: String(opts.notes || "") });
        };
        const walkStrings = (root, source, filePath, component, zone, opts = {}) => {
          if (root == null) return;
          if (typeof root === "string") return addTextRow(source, root, filePath, component, zone, opts);
          if (Array.isArray(root)) return root.forEach((item, index) => walkStrings(item, `${source}.${index}`, filePath, component, zone, opts));
          if (typeof root === "object") return Object.keys(root).forEach((key) => walkStrings(root[key], `${source}.${key}`, filePath, component, zone, opts));
        };
        const addProfileKeyCoverage = (profileKey, routeConnected, notes) => {
          pushUnique(result.existingProfileKeys, { key: profileKey, coveredByStep: stepMap[profileKey] || "", routeConnected: !!routeConnected, notes: String(notes || "") });
          if (!routeConnected) pushUnique(result.missingCoverage, { profileKey, coveredByStep: stepMap[profileKey] || "", reason: "dictionary_only_no_visible_callsite" });
        };
        const beforeState = snapshotState();
        try {
          const D = G.Data || {};
          const System = G.System || {};
          const NPC = G.NPC || {};
          const copyInventory = Array.isArray(System.copyInventory) ? System.copyInventory : [];
          const routeMap = System.profileTextRouteMap || {};
          const profileKeys = Array.isArray(System.profileTextKeys) ? System.profileTextKeys.slice() : [];
          const routedVisibleCodes = new Set();
          const areaZoneMap = {
            battles: "conflict_results", rematch: "rematch", economy: "economy", rewards: "rewards_penalties", inventory: "core_system", storage: "purchase_sale", training: "economy", respect: "reputation", report: "cop_flow", cop: "cop_flow", start: "onboarding", events: "chronicle", escape: "buttons_labels"
          };
          copyInventory.forEach((row, index) => {
            const routeId = `${String(row && row.kind || "").trim()}.${String(row && row.code || "").trim()}`;
            const profileKey = routeMap[routeId] || "";
            const rendered = System && typeof System.say === "function" ? System.say(row.kind, row.code, { name: "Имя", target: "Цель", guest: "Гость", voteCost: 1, rematchCost: 1, escapeCost: 1, location: "Площадь", teacher: "A", student: "B", oppName: "Оппонент", text: "итог", winner: "A", loser: "B", a: "A", b: "B", aVotes: 1, bVotes: 0, attackerName: "A", attackerInf: 1, returnAmount: 1, cost: 1, amount: 1, value: 1, what: "Статус" }) : "";
            const zone = areaZoneMap[row && row.area] || ((row && row.surface) === "toast" ? "toasts" : "core_system");
            addTextRow(`copyInventory.${index}.${row.kind}.${row.code}`, rendered || routeId, row.file || "AsyncScene/Web/system.js", row.callsite || "SYSTEM_COPY_INVENTORY", zone, { currentlyProfileAware: !!profileKey, resolverUsed: true, hardcoded: !!(row && row.directHardcoded), profileKey, frequencyGuess: zone === "toasts" ? "high" : "medium", recommendedForZoomerFeel: !profileKey || !!stepMap[profileKey], notes: `surface=${row && row.surface || ""}` });
            if (profileKey) routedVisibleCodes.add(profileKey);
          });
          ["conflict_win", "conflict_loss", "conflict_draw", "supported_majority", "supported_minority", "majority_won", "minority_lost", "conflict_finished"].forEach((key) => {
            const text = typeof D.resolveConflictResultText === "function" ? D.resolveConflictResultText(key) : (typeof D.t === "function" ? D.t(key) : "");
            addTextRow(`conflictResult.${key}`, text, "AsyncScene/Web/conflict/conflict-core.js", "conflictResultText", "conflict_results", { currentlyProfileAware: true, resolverUsed: true, hardcoded: false, profileKey: key, frequencyGuess: "high", recommendedForZoomerFeel: true, notes: "visible conflict result resolver path" });
            if (text) routedVisibleCodes.add(key);
          });
          const texts = D.TEXTS || {};
          const genz = texts.genz || {};
          addTextRow("texts.genz.events_empty", genz.events_empty, "AsyncScene/Web/data.js", "Data.TEXTS.genz", "empty_states", { currentlyProfileAware: false, resolverUsed: true, hardcoded: false, frequencyGuess: "medium", recommendedForZoomerFeel: true, notes: "visible empty events hint through Data.t('events_empty')" });
          addTextRow("texts.genz.escape_button_label", genz.escape_button_label, "AsyncScene/Web/ui/ui-battles.js", "escape button", "buttons_labels", { currentlyProfileAware: false, resolverUsed: true, hardcoded: false, frequencyGuess: "high", recommendedForZoomerFeel: true, notes: "visible escape CTA label" });
          addTextRow("texts.genz.teach_sent_dm", genz.teach_sent_dm, "AsyncScene/Web/ui/ui-dm.js", "teach sent dm", "economy", { currentlyProfileAware: false, resolverUsed: true, hardcoded: false, frequencyGuess: "medium", recommendedForZoomerFeel: true, notes: "DM training cost text" });
          addTextRow("texts.genz.teach_sent_chat", genz.teach_sent_chat, "AsyncScene/Web/ui/ui-dm.js", "teach sent chat", "economy", { currentlyProfileAware: false, resolverUsed: true, hardcoded: false, frequencyGuess: "medium", recommendedForZoomerFeel: true, notes: "system training feed text" });
          addTextRow("texts.genz.menu_title", genz.menu_title, "AsyncScene/Web/ui/ui-menu.js", "applyMenuLabels", "buttons_labels", { currentlyProfileAware: false, resolverUsed: true, hardcoded: false, frequencyGuess: "high", recommendedForZoomerFeel: true, notes: "menu button and panel title" });
          ["cop_report_accept", "cop_report_ok", "cop_report_fail", "cop_busy", "cop_cooldown"].forEach((key) => walkStrings(genz[key], `texts.genz.${key}`, "AsyncScene/Web/data.js", "Data.TEXTS.genz", "cop_flow", { currentlyProfileAware: false, resolverUsed: true, hardcoded: false, frequencyGuess: key === "cop_report_accept" || key === "cop_report_ok" ? "high" : "medium", recommendedForZoomerFeel: true, notes: "cop/report visible text array" }));
          if (D.START_SCREEN) {
            addTextRow("startScreen.title", D.START_SCREEN.title, "AsyncScene/Web/data.js", "Data.START_SCREEN", "onboarding", { currentlyProfileAware: false, resolverUsed: false, hardcoded: true, frequencyGuess: "high", recommendedForZoomerFeel: true, notes: "start screen title" });
            walkStrings(D.START_SCREEN.introLines, "startScreen.introLines", "AsyncScene/Web/data.js", "Data.START_SCREEN", "onboarding", { currentlyProfileAware: false, resolverUsed: false, hardcoded: true, frequencyGuess: "high", recommendedForZoomerFeel: true, notes: "start screen intro lines" });
            addTextRow("startScreen.economyHonestyLine", D.START_SCREEN.economyHonestyLine, "AsyncScene/Web/data.js", "Data.START_SCREEN", "economy", { currentlyProfileAware: false, resolverUsed: false, hardcoded: true, frequencyGuess: "medium", recommendedForZoomerFeel: true, notes: "start screen economy explainer" });
            walkStrings(D.START_SCREEN.actions, "startScreen.actions", "AsyncScene/Web/data.js", "Data.START_SCREEN.actions", "buttons_labels", { currentlyProfileAware: false, resolverUsed: false, hardcoded: true, frequencyGuess: "high", recommendedForZoomerFeel: true, notes: "start screen button labels" });
          }
          [["uiMenu.manifestButton", "Цель"], ["uiMenu.manifestTitle", "Цель"], ["uiMenu.returnToStart", "К старту"], ["uiMenu.devDisable", "Disable Dev Mode"], ["uiMenu.devEnable", "Enable Dev Mode"], ["uiMenu.consolePanel", "Console Panel"], ["uiMenu.unavailable", "Недоступно."]].forEach((row) => addTextRow(row[0], row[1], "AsyncScene/Web/ui/ui-menu.js", "ui-menu hardcoded label", "buttons_labels", { currentlyProfileAware: false, resolverUsed: false, hardcoded: true, frequencyGuess: "medium", recommendedForZoomerFeel: true, notes: "visible hardcoded menu label" }));
          [["uiDm.respectNoPoints", "Не хватает 💰."], ["uiDm.respectFallback", "Сейчас не получилось. Попробуй позже."]].forEach((row) => addTextRow(row[0], row[1], "AsyncScene/Web/ui/ui-dm.js", "mapRespectReason", "reputation", { currentlyProfileAware: false, resolverUsed: false, hardcoded: true, frequencyGuess: "high", recommendedForZoomerFeel: true, notes: "visible respect flow fallback" }));
          walkStrings(NPC.SAY && NPC.SAY.crowd, "NPC.SAY.crowd", "AsyncScene/Web/npcs.js", "NPC.SAY", "crowd_comment", { currentlyProfileAware: false, resolverUsed: false, hardcoded: true, frequencyGuess: "medium", recommendedForZoomerFeel: true, notes: "crowd speech pool" });
          walkStrings(D.NPC_CHAT_LINES, "Data.NPC_CHAT_LINES", "AsyncScene/Web/data.js", "Data.NPC_CHAT_LINES", "crowd_comment", { currentlyProfileAware: false, resolverUsed: false, hardcoded: true, frequencyGuess: "medium", recommendedForZoomerFeel: true, notes: "crowd chat/event lines" });
          walkStrings(NPC.SAY && NPC.SAY.toxic, "NPC.SAY.toxic", "AsyncScene/Web/npcs.js", "NPC.SAY", "npc_speech", { currentlyProfileAware: false, resolverUsed: false, hardcoded: true, frequencyGuess: "medium", recommendedForZoomerFeel: true, notes: "toxic npc speech pool" });
          walkStrings(NPC.SAY && NPC.SAY.bandit, "NPC.SAY.bandit", "AsyncScene/Web/npcs.js", "NPC.SAY", "npc_speech", { currentlyProfileAware: false, resolverUsed: false, hardcoded: true, frequencyGuess: "medium", recommendedForZoomerFeel: true, notes: "bandit npc speech pool" });
          walkStrings(NPC.DM_PROFILE_LINES, "NPC.DM_PROFILE_LINES", "AsyncScene/Web/npcs.js", "NPC.DM_PROFILE_LINES", "npc_speech", { currentlyProfileAware: false, resolverUsed: false, hardcoded: true, frequencyGuess: "low", recommendedForZoomerFeel: true, notes: "npc dm visible templates" });
          walkStrings(D.COP_TEMPLATES, "Data.COP_TEMPLATES", "AsyncScene/Web/data.js", "Data.COP_TEMPLATES", "cop_flow", { currentlyProfileAware: false, resolverUsed: false, hardcoded: true, frequencyGuess: "medium", recommendedForZoomerFeel: true, notes: "cop flow visible replies/descriptions" });
          walkStrings(D.NPC_EVENT_TEMPLATES, "Data.NPC_EVENT_TEMPLATES", "AsyncScene/Web/data.js", "Data.NPC_EVENT_TEMPLATES", "chronicle", { currentlyProfileAware: false, resolverUsed: false, hardcoded: true, frequencyGuess: "medium", recommendedForZoomerFeel: true, notes: "npc event feed lines" });
          result.inventory = Object.keys(inventoryMap).sort().map((key) => inventoryMap[key]);
          profileKeys.forEach((profileKey) => addProfileKeyCoverage(profileKey, routedVisibleCodes.has(profileKey), routedVisibleCodes.has(profileKey) ? "visible routed system callsite found" : "present in resolver dictionary but not mapped to a discovered real visible callsite"));
          Object.keys(stepMap).filter((profileKey) => /^6\.2$/.test(stepMap[profileKey])).forEach((profileKey) => {
            if (!profileKeys.includes(profileKey)) addProfileKeyCoverage(profileKey, routedVisibleCodes.has(profileKey), "conflict key tracked through Data.resolveConflictResultText");
          });
          result.suspectedGaps = result.inventory.filter((row) => !row.currentlyProfileAware && row.recommendedForZoomerFeel && (row.frequencyGuess === "high" || row.frequencyGuess === "medium")).map((row) => ({ key: row.key, text: row.text, filePath: row.filePath, zone: row.zone, notes: row.notes || "visible string is not profile-aware" }));
          result.summary.totalCandidates = result.inventory.length;
          result.summary.profileAwareCount = result.inventory.filter((row) => row.currentlyProfileAware === true).length;
          result.summary.hardcodedCount = result.inventory.filter((row) => row.hardcoded === true).length;
          result.summary.resolverUsedCount = result.inventory.filter((row) => row.resolverUsed === true).length;
          result.summary.suspectedGapCount = result.suspectedGaps.length;
          result.summary.coveredByStep61Count = result.inventory.filter((row) => row.coveredByStep === "6.1").length;
          result.summary.coveredByStep62Count = result.inventory.filter((row) => row.coveredByStep === "6.2").length;
          result.summary.coveredByStep63Count = result.inventory.filter((row) => row.coveredByStep === "6.3").length;
          result.summary.coveredByStep64Count = result.inventory.filter((row) => row.coveredByStep === "6.4").length;
          result.summary.recommendedForZoomerFeelCount = result.inventory.filter((row) => row.recommendedForZoomerFeel === true).length;
          result.summary.highFrequencyRecommendedCount = result.inventory.filter((row) => row.recommendedForZoomerFeel === true && row.frequencyGuess === "high").length;
          if (!result.inventory.length) fail("inventory_empty", "no_real_ui_candidates_found");
          if (!(result.summary.totalCandidates > 0)) fail("inventory_total_missing", result.summary);
          if (!result.existingProfileKeys.length) fail("existing_profile_keys_empty", "resolver_dictionary_keys_not_found");
          if (!Array.isArray(result.suspectedGaps)) fail("suspected_gaps_missing", "suspectedGaps must be an array");
          result.inventory.forEach((row) => {
            ["key", "text", "filePath", "zone", "hardcoded", "resolverUsed", "currentlyProfileAware", "recommendedForZoomerFeel"].forEach((field) => {
              if (typeof row[field] === "undefined" || row[field] === "") fail("inventory_contract_missing_field", { key: row.key || "", field });
            });
          });
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        }
        const afterState = snapshotState();
        if (stableJson(beforeState) !== stableJson(afterState)) fail("state_mutated_during_smoke", { beforeState, afterState });
        result.ok = result.inventory.length > 0 && result.summary.totalCandidates > 0 && result.existingProfileKeys.length > 0 && Array.isArray(result.suspectedGaps) && result.failures.length === 0 && result.failedChecks.length === 0;
        return result;
      };
      G.Dev.smokeZoomerFeelStep60RealUiTextInventory = G.__DEV.smokeZoomerFeelStep60RealUiTextInventory;
    }
    if (typeof G.__DEV.smokeZoomerFeelStep671StartScreenButtonsLabels !== "function") {
      G.__DEV.smokeZoomerFeelStep671StartScreenButtonsLabels = function smokeZoomerFeelStep671StartScreenButtonsLabels() {
        const buildTag = "build_2026_06_15_step6_7_1_start_screen_buttons_labels";
        const commit = "step6_7_1_start_screen_buttons_labels";
        const smokeVersion = "step6_7_1_start_screen_buttons_labels_v20260615_001";
        const result = {
          buildTag,
          commit,
          smokeVersion,
          ok: false,
          failures: [],
          forbiddenRemaining: [],
          missingCoverage: [],
          failedChecks: [],
          samples: {},
          routeChecks: {},
          summary: {
            checkedKeys: 0,
            millennialZoomerDifferentCount: 0,
            unchangedAllowedCount: 0,
            routeConnectedCount: 0,
            profileSelectionChecksCount: 0,
            docsMirrorUpdated: false,
            smokeIdentityFresh: false,
          },
        };
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        const miss = (code) => {
          if (result.missingCoverage.indexOf(code) < 0) result.missingCoverage.push(code);
        };
        const D = G.Data || {};
        const resolve = (key, profile) => (D && typeof D.resolveStartScreenText === "function") ? String(D.resolveStartScreenText(key, profile) || "") : "";
        const storageKeys = () => {
          try { return window.localStorage ? Object.keys(window.localStorage).sort() : []; } catch (_) { return []; }
        };
        const beforeStorageKeys = storageKeys();
        const beforeTextMode = typeof D.TEXT_MODE === "string" ? D.TEXT_MODE : "";
        const beforeUiProfile = typeof D.UI_PROFILE === "string" ? D.UI_PROFILE : "";
        const beforeSave = JSON.stringify((G.__S && G.__S.save) || (G.State && G.State.save) || {});
        try {
          result.routeChecks.dataDefinitionsExist = !!(D && D.START_SCREEN_PROFILE_TEXTS && typeof D.START_SCREEN_PROFILE_TEXTS === "object" && D.START_SCREEN_PROFILE_TEXTS.millennial && D.START_SCREEN_PROFILE_TEXTS.zoomer);
          result.routeChecks.resolverExists = !!(D && typeof D.resolveStartScreenText === "function");
          if (!result.routeChecks.dataDefinitionsExist) miss("start_screen_profile_texts_missing");
          if (!result.routeChecks.resolverExists) miss("start_screen_resolver_missing");

          const keys = [
            "start_title",
            "birth_digits_label",
            "digit_up_first",
            "digit_down_first",
            "digit_up_second",
            "digit_down_second",
            "profile_helper",
            "fantasy_birth_label",
            "start_continue",
            "start_start",
            "start_reset",
            "rules_action",
            "start_action",
          ];
          keys.forEach((key) => {
            result.samples[key] = {
              millennial: resolve(key, "millennial"),
              zoomer: resolve(key, "zoomer"),
            };
          });
          result.summary.checkedKeys = keys.length;
          result.summary.millennialZoomerDifferentCount = keys.filter((key) => result.samples[key].millennial !== result.samples[key].zoomer).length;
          result.summary.unchangedAllowedCount = keys.filter((key) => result.samples[key].millennial === result.samples[key].zoomer).length;
          result.routeChecks.millennialFallbackPreserved = keys.filter((key) => result.samples[key].millennial === resolve(key, "") && result.samples[key].millennial === resolve(key, "missing")).length >= 6;
          result.routeChecks.zoomerDiffers = result.summary.millennialZoomerDifferentCount >= 6;

          const st = (typeof document !== "undefined") ? document.getElementById("startScreen") : null;
          const titleEl = (typeof document !== "undefined") ? document.getElementById("startTitle") : null;
          const labelEl = (typeof document !== "undefined") ? document.getElementById("startBirthYearLabel") : null;
          const pickerEl = (typeof document !== "undefined") ? document.getElementById("startBirthYearPicker") : null;
          const hintEl = (typeof document !== "undefined") ? document.getElementById("startBirthYearHint") : null;
          const feelingEl = (typeof document !== "undefined") ? document.getElementById("startBirthYearFeelingLabel") : null;
          const startBtn = (typeof document !== "undefined") ? document.getElementById("btnStart") : null;
          const rulesBtn = (typeof document !== "undefined") ? document.getElementById("btnRules") : null;
          const resetBtn = (typeof document !== "undefined") ? document.getElementById("btnResetOnboarding") : null;
          const liveProfile = D && typeof D.getUiProfile === "function" ? D.getUiProfile() : (typeof D.UI_PROFILE === "string" ? D.UI_PROFILE : "default");
          const liveMode = String(liveProfile).trim().toLowerCase() === "zoomer" || String(liveProfile).trim().toLowerCase() === "alpha" ? "zoomer" : "millennial";
          const liveResumeMode = !!(G.__A && typeof G.__A.getOnboardingSeen === "function" ? G.__A.getOnboardingSeen() : (G.__S && G.__S.progress && G.__S.progress.onboardingSeen === true));
          result.routeChecks.startScreenBootHealthy = !!(st && titleEl && labelEl && pickerEl && hintEl && feelingEl && startBtn && rulesBtn && resetBtn);
          if (!result.routeChecks.startScreenBootHealthy) fail("start_screen_boot_unhealthy", {
            st: !!st,
            titleEl: !!titleEl,
            labelEl: !!labelEl,
            pickerEl: !!pickerEl,
            hintEl: !!hintEl,
            feelingEl: !!feelingEl,
            startBtn: !!startBtn,
            rulesBtn: !!rulesBtn,
            resetBtn: !!resetBtn,
          });

          if (result.routeChecks.startScreenBootHealthy) {
            const titleText = String(titleEl.textContent || "").trim();
            const labelText = String(labelEl.textContent || "").trim();
            const hintText = String(hintEl.textContent || "").trim();
            const feelingText = String(feelingEl.textContent || "").trim();
            const startText = String(startBtn.textContent || "").trim();
            const rulesText = String(rulesBtn.textContent || "").trim();
            const resetText = String(resetBtn.textContent || "").trim();
            const expectedStartText = liveResumeMode ? resolve("start_continue", liveMode) : resolve("start_action", liveMode);
            result.routeChecks.uiBootRoutesResolver = titleText === resolve("start_title", liveMode)
              && labelText === resolve("birth_digits_label", liveMode)
              && hintText === resolve("profile_helper", liveMode)
              && feelingText === resolve("fantasy_birth_label", liveMode)
              && startText === expectedStartText
              && rulesText === resolve("rules_action", liveMode)
              && resetText === resolve("start_reset", liveMode)
              && String(pickerEl.getAttribute("aria-label") || "") === resolve("birth_digits_label", liveMode);
            if (!result.routeChecks.uiBootRoutesResolver) fail("ui_boot_start_screen_not_resolver_routed", {
              titleText,
              labelText,
              hintText,
              feelingText,
              startText,
              rulesText,
              resetText,
              expectedStartText,
            });
          } else {
            result.routeChecks.uiBootRoutesResolver = false;
          }

          result.routeChecks.profileSelectionStillWorks = [
            ["87", "millennial"],
            ["98", "zoomer"],
            ["04", "zoomer"],
            ["15", "alpha"],
          ].every(([input, expected]) => D && typeof D.resolveUiProfileFromBirthYearValue === "function" && D.resolveUiProfileFromBirthYearValue(input) === expected);
          result.summary.profileSelectionChecksCount = 4;
          if (!result.routeChecks.profileSelectionStillWorks) fail("profile_selection_mismatch", {
            "87": D && typeof D.resolveUiProfileFromBirthYearValue === "function" ? D.resolveUiProfileFromBirthYearValue("87") : null,
            "98": D && typeof D.resolveUiProfileFromBirthYearValue === "function" ? D.resolveUiProfileFromBirthYearValue("98") : null,
            "04": D && typeof D.resolveUiProfileFromBirthYearValue === "function" ? D.resolveUiProfileFromBirthYearValue("04") : null,
            "15": D && typeof D.resolveUiProfileFromBirthYearValue === "function" ? D.resolveUiProfileFromBirthYearValue("15") : null,
          });

          result.routeChecks.noNewStorageKeys = JSON.stringify(beforeStorageKeys) === JSON.stringify(storageKeys())
            && beforeTextMode === (typeof D.TEXT_MODE === "string" ? D.TEXT_MODE : "")
            && beforeUiProfile === (typeof D.UI_PROFILE === "string" ? D.UI_PROFILE : "")
            && beforeSave === JSON.stringify((G.__S && G.__S.save) || (G.State && G.State.save) || {});
          if (!result.routeChecks.noNewStorageKeys) fail("storage_or_state_mutated", {
            beforeStorageKeys,
            afterStorageKeys: storageKeys(),
            beforeTextMode,
            afterTextMode: typeof D.TEXT_MODE === "string" ? D.TEXT_MODE : "",
            beforeUiProfile,
            afterUiProfile: typeof D.UI_PROFILE === "string" ? D.UI_PROFILE : "",
          });

          result.routeChecks.docsMirrorUpdated = result.routeChecks.dataDefinitionsExist
            && result.routeChecks.resolverExists
            && result.routeChecks.startScreenBootHealthy
            && result.routeChecks.uiBootRoutesResolver
            && result.samples.birth_digits_label.millennial === "Последние 2 цифры года рождения"
            && result.samples.birth_digits_label.zoomer === "Две цифры вайба"
            && result.samples.profile_helper.millennial === "Только для интерфейса. Не сохраняем. Можно поменять позже."
            && result.samples.profile_helper.zoomer === "Это только стиль интерфейса. Потом можно перекинуть."
            && result.samples.fantasy_birth_label.millennial === "я на самом деле чувствую будто я родился в …"
            && result.samples.fantasy_birth_label.zoomer === "по вайбу я родился в …"
            && result.samples.start_continue.millennial === "Продолжить"
            && result.samples.start_continue.zoomer === "Погнали"
            && result.samples.start_reset.millennial === "Сбросить старт"
            && result.samples.start_reset.zoomer === "Снести выбор"
            && result.samples.rules_action.millennial === String((((D.START_SCREEN || {}).actions || {}).rules) == null ? "" : D.START_SCREEN.actions.rules)
            && result.samples.rules_action.zoomer === "Правила без душноты"
            && result.samples.start_action.millennial === String((((D.START_SCREEN || {}).actions || {}).start) == null ? "" : D.START_SCREEN.actions.start)
            && result.samples.start_action.zoomer === "Войти";
          if (!result.routeChecks.docsMirrorUpdated) fail("docs_mirror_not_updated", result.samples);

          result.routeChecks.noStaleSmokeIdentity = typeof G.__DEV.smokeZoomerFeelStep671StartScreenButtonsLabels === "function"
            && buildTag === "build_2026_06_15_step6_7_1_start_screen_buttons_labels"
            && commit === "step6_7_1_start_screen_buttons_labels"
            && smokeVersion === "step6_7_1_start_screen_buttons_labels_v20260615_001";
          if (!result.routeChecks.noStaleSmokeIdentity) fail("stale_smoke_identity", {
            buildTag,
            commit,
            smokeVersion,
            fnExists: typeof G.__DEV.smokeZoomerFeelStep671StartScreenButtonsLabels === "function",
          });

          result.summary.routeConnectedCount = [
            result.routeChecks.dataDefinitionsExist,
            result.routeChecks.resolverExists,
            result.routeChecks.millennialFallbackPreserved,
            result.routeChecks.zoomerDiffers,
            result.routeChecks.uiBootRoutesResolver,
            result.routeChecks.startScreenBootHealthy,
            result.routeChecks.profileSelectionStillWorks,
            result.routeChecks.noNewStorageKeys,
            result.routeChecks.docsMirrorUpdated,
            result.routeChecks.noStaleSmokeIdentity,
          ].filter(Boolean).length;
          result.summary.docsMirrorUpdated = !!result.routeChecks.docsMirrorUpdated;
          result.summary.smokeIdentityFresh = !!result.routeChecks.noStaleSmokeIdentity;

          result.forbiddenRemaining = [
            result.samples.start_title.millennial !== "AsyncScene" || result.samples.start_title.zoomer !== "AsyncScene" ? "start_title" : "",
            result.samples.start_start.millennial !== "Старт" || result.samples.start_start.zoomer !== "Старт" ? "start_start" : "",
          ].filter(Boolean);
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        }
        const afterStorageKeys = storageKeys();
        if (JSON.stringify(beforeStorageKeys) !== JSON.stringify(afterStorageKeys)) fail("storage_keys_changed", { beforeStorageKeys, afterStorageKeys });
        if (beforeTextMode !== (typeof D.TEXT_MODE === "string" ? D.TEXT_MODE : "")) fail("text_mode_changed", { beforeTextMode, afterTextMode: typeof D.TEXT_MODE === "string" ? D.TEXT_MODE : "" });
        if (beforeUiProfile !== (typeof D.UI_PROFILE === "string" ? D.UI_PROFILE : "")) fail("ui_profile_changed", { beforeUiProfile, afterUiProfile: typeof D.UI_PROFILE === "string" ? D.UI_PROFILE : "" });
        if (beforeSave !== JSON.stringify((G.__S && G.__S.save) || (G.State && G.State.save) || {})) fail("save_state_changed", { beforeSave, afterSave: JSON.stringify((G.__S && G.__S.save) || (G.State && G.State.save) || {}) });
        result.ok = result.failures.length === 0 && result.forbiddenRemaining.length === 0 && result.missingCoverage.length === 0 && result.failedChecks.length === 0
          && result.routeChecks.dataDefinitionsExist === true
          && result.routeChecks.resolverExists === true
          && result.routeChecks.millennialFallbackPreserved === true
          && result.routeChecks.zoomerDiffers === true
          && result.routeChecks.uiBootRoutesResolver === true
          && result.routeChecks.startScreenBootHealthy === true
          && result.routeChecks.profileSelectionStillWorks === true
          && result.routeChecks.noNewStorageKeys === true
          && result.routeChecks.docsMirrorUpdated === true
          && result.routeChecks.noStaleSmokeIdentity === true;
        return result;
      };
      G.Dev.smokeZoomerFeelStep671StartScreenButtonsLabels = G.__DEV.smokeZoomerFeelStep671StartScreenButtonsLabels;
    }
  }
})();
