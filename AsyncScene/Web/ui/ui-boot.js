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

  function ensureStartScreenExists(UI) {
    const $ = UI.$;

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
          <label id="startBirthYearLabel" class="startFieldLabel">Последние 2 цифры года рождения</label>
          <div id="startBirthYearPicker" class="startBirthYearPicker" aria-label="Последние 2 цифры года рождения">
            <div class="startBirthYearWheel" data-birth-year-digit="0">
              <button id="startBirthYear0Up" class="startBirthYearArrow" type="button" data-birth-year-step="1" data-birth-year-index="0" aria-label="Увеличить первую цифру">▲</button>
              <div id="startBirthYearDigit0" class="startBirthYearDigit" aria-live="polite">0</div>
              <button id="startBirthYear0Down" class="startBirthYearArrow" type="button" data-birth-year-step="-1" data-birth-year-index="0" aria-label="Уменьшить первую цифру">▼</button>
            </div>
            <div class="startBirthYearWheel" data-birth-year-digit="1">
              <button id="startBirthYear1Up" class="startBirthYearArrow" type="button" data-birth-year-step="1" data-birth-year-index="1" aria-label="Увеличить вторую цифру">▲</button>
              <div id="startBirthYearDigit1" class="startBirthYearDigit" aria-live="polite">0</div>
              <button id="startBirthYear1Down" class="startBirthYearArrow" type="button" data-birth-year-step="-1" data-birth-year-index="1" aria-label="Уменьшить вторую цифру">▼</button>
            </div>
          </div>
          <div id="startBirthYearHint" class="startFieldHint">Только для интерфейса. Не сохраняем. Можно поменять позже.</div>
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
    st.querySelectorAll("#btnStart, #btnRules, #btnResetOnboarding, #startBirthYearPicker button").forEach((el) => {
      el.style.pointerEvents = "auto";
      el.style.position = el.style.position || "relative";
      el.style.zIndex = el.style.zIndex || "2";
      if (el.tagName === "BUTTON" && !el.getAttribute("type")) el.setAttribute("type", "button");
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

  function readBirthYearProfileValue() {
    const picker = document.getElementById("startBirthYearPicker");
    if (!picker || typeof picker.getAttribute !== "function") return "";
    return String(picker.getAttribute("data-birth-year-value") || "").trim();
  }

  function applyUiProfileBeforeEnter(UI, rawBirthYearValue) {
    const G = window.Game || {};
    const Data = G.Data || null;
    const profile = Data && typeof Data.resolveUiProfileFromBirthYearValue === "function"
      ? Data.resolveUiProfileFromBirthYearValue(rawBirthYearValue)
      : "default";
    if (Data && typeof Data.setUiProfile === "function") {
      Data.setUiProfile(profile);
    } else if (Data && typeof Data === "object") {
      Data.UI_PROFILE = profile;
    }
    if (UI && UI.S) {
      UI.S.flags = UI.S.flags || {};
      UI.S.flags.uiProfile = profile;
    }
    if (G.__DEV && typeof G.__DEV === "object") {
      G.__DEV.__uiProfileAppliedBeforeEnter = true;
    }
    return profile;
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
      birthYearLabel.textContent = "Последние 2 цифры года рождения";
      const insertLabelBefore = $("startBirthYearPicker") || document.getElementById("startBirthYearPicker") || $("startBtns") || document.getElementById("startBtns");
      if (insertLabelBefore && insertLabelBefore.parentNode) insertLabelBefore.parentNode.insertBefore(birthYearLabel, insertLabelBefore);
      else if (economyEl && economyEl.parentNode) economyEl.parentNode.insertBefore(birthYearLabel, economyEl.nextSibling);
    } else {
      birthYearLabel.textContent = "Последние 2 цифры года рождения";
    }

    let birthYearPicker = $("startBirthYearPicker") || document.getElementById("startBirthYearPicker");
    if (!birthYearPicker) {
      const buildWheel = (index, ordinal) => `
        <div class="startBirthYearWheel" data-birth-year-digit="${index}">
          <button id="startBirthYear${index}Up" class="startBirthYearArrow" type="button" data-birth-year-step="1" data-birth-year-index="${index}" aria-label="Увеличить ${ordinal} цифру">▲</button>
          <div id="startBirthYearDigit${index}" class="startBirthYearDigit" aria-live="polite">0</div>
          <button id="startBirthYear${index}Down" class="startBirthYearArrow" type="button" data-birth-year-step="-1" data-birth-year-index="${index}" aria-label="Уменьшить ${ordinal} цифру">▼</button>
        </div>`;
      birthYearPicker = document.createElement("div");
      birthYearPicker.id = "startBirthYearPicker";
      birthYearPicker.className = "startBirthYearPicker";
      birthYearPicker.setAttribute("aria-label", "Последние 2 цифры года рождения");
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
      birthYearHint.textContent = "Только для интерфейса. Не сохраняем. Можно поменять позже.";
      const insertHintBefore = $("startBtns") || document.getElementById("startBtns");
      if (insertHintBefore && insertHintBefore.parentNode) insertHintBefore.parentNode.insertBefore(birthYearHint, insertHintBefore);
      else if (birthYearPicker && birthYearPicker.parentNode) birthYearPicker.parentNode.insertBefore(birthYearHint, birthYearPicker.nextSibling);
    } else {
      birthYearHint.textContent = "Только для интерфейса. Не сохраняем. Можно поменять позже.";
    }

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
    if (startBtn) startBtn.textContent = resumeMode ? "Продолжить" : (typeof actions.start === "string" ? actions.start : "Старт");

    const rulesBtn = $("btnRules") || document.getElementById("btnRules");
    if (rulesBtn) rulesBtn.textContent = typeof actions.rules === "string" ? actions.rules : "";

    const resetBtn = $("btnResetOnboarding") || document.getElementById("btnResetOnboarding");
    if (resetBtn) {
      resetBtn.textContent = "Сбросить старт";
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
        resetOnboardingSeen(UI);
        if (UI.S) {
          UI.S.isStarted = false;
          UI.S.flags = UI.S.flags || {};
          UI.S.flags.started = false;
        }
        applyStartScreenContent(UI);
        ensureStartScreenVisible(UI);
      };
    }

    const runStart = (source, e) => {
      markBootDiag(source);
      try {
        if (e && typeof e.preventDefault === "function") e.preventDefault();
      } catch (_) {}
      try {
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
      const birthYearValue = readBirthYearProfileValue();
      const uiProfile = applyUiProfileBeforeEnter(UI, birthYearValue);
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
    const runBirthYearValueContractSmoke = function runBirthYearValueContractSmoke() {
        const result = {
          ok: false,
          buildTag: (typeof window !== "undefined" && window.__BUILD_TAG__) || G.__DEV.buildTag || G.__buildTag || null,
          commit: (typeof window !== "undefined" && window.__COMMIT__) || G.__DEV.commit || G.__commit || null,
          smokeVersion: "step6_1_birth_year_value_contract_smoke_v20260613_001",
          producedValuesSample: [],
          invalidValuesDetected: [],
          emptyStateSafe: false,
          ageCreated: false,
          birthDateCreated: false,
          dateObjectCreated: false,
          newStorageKeys: [],
          failures: [],
          failedChecks: [],
          startScreenVisible: false,
          digitPickerVisible: false,
          upDownControlsVisible: false,
          helperVisible: false,
          emptyStartOk: false,
          ageSource: null,
          agePath: null,
          birthYearPersistenceDetected: false,
          forbiddenRemaining: [],
          missingCoverage: []
        };
        const EXPECTED_BUILD_TAG = "build_2026_06_13_step6_1_birth_year_value_contract";
        const EXPECTED_COMMIT = "step6_1_birth_year_value_contract";
        const EXPECTED_SMOKE_VERSION = "step6_1_birth_year_value_contract_smoke_v20260613_001";
        const fail = (check, detail) => {
          if (result.failedChecks.indexOf(check) < 0) result.failedChecks.push(check);
          result.failures.push(detail === undefined ? check : { check, detail });
        };
        const isVisible = (el) => {
          if (!el) return false;
          const cs = getComputedStyle(el);
          return !el.hidden && !el.classList.contains("hidden") && cs.display !== "none" && cs.visibility !== "hidden" && el.getClientRects().length > 0;
        };
        try {
          if (window.__BUILD_TAG__ !== EXPECTED_BUILD_TAG) fail("build_tag_mismatch", { expected: EXPECTED_BUILD_TAG, actual: window.__BUILD_TAG__ || null });
          if (window.__COMMIT__ !== EXPECTED_COMMIT) fail("commit_mismatch", { expected: EXPECTED_COMMIT, actual: window.__COMMIT__ || null });
          if (result.smokeVersion !== EXPECTED_SMOKE_VERSION) fail("smoke_version_mismatch", { expected: EXPECTED_SMOKE_VERSION, actual: result.smokeVersion });
          if (typeof G.__DEV.refreshOnboardingStartScreenOnce === "function") {
            G.__DEV.refreshOnboardingStartScreenOnce();
          }
          let st = document.getElementById("startScreen");
          if (!isVisible(st) && G.__A && typeof G.__A.resetOnboardingSeen === "function") {
            try { G.__A.resetOnboardingSeen(); } catch (_) {}
            if (typeof G.__DEV.refreshOnboardingStartScreenOnce === "function") G.__DEV.refreshOnboardingStartScreenOnce();
            st = document.getElementById("startScreen");
          }
          result.startScreenVisible = isVisible(st);
          if (!result.startScreenVisible) fail("start_screen_not_visible", null);
          const picker = document.getElementById("startBirthYearPicker");
          const hint = document.getElementById("startBirthYearHint");
          const digit0 = document.getElementById("startBirthYearDigit0");
          const digit1 = document.getElementById("startBirthYearDigit1");
          const controls = picker ? Array.from(picker.querySelectorAll("button[data-birth-year-step]")) : [];
          result.digitPickerVisible = isVisible(picker) && isVisible(digit0) && isVisible(digit1);
          if (!result.digitPickerVisible) fail("digit_picker_not_visible", null);
          result.upDownControlsVisible = controls.length === 4 && controls.every(isVisible);
          if (!result.upDownControlsVisible) fail("up_down_controls_not_visible", controls.map((el) => el && el.id).filter(Boolean));
          result.helperVisible = isVisible(hint) && (hint.textContent || "").trim() === "Только для интерфейса. Не сохраняем. Можно поменять позже.";
          if (!result.helperVisible) fail("helper_not_visible", hint ? (hint.textContent || "").trim() : null);
          const readValue = () => (picker && typeof picker.getAttribute === "function" ? String(picker.getAttribute("data-birth-year-value") || "") : "");
          const initialValue = readValue();
          const sampleStates = [
            ["00", [0, 0]],
            ["01", [0, 1]],
            ["09", [0, 9]],
            ["10", [1, 0]],
            ["42", [4, 2]],
            ["95", [9, 5]],
            ["99", [9, 9]],
          ];
          result.producedValuesSample = [];
          for (const [expectedValue, digits] of sampleStates) {
            if (digit0) digit0.textContent = String(digits[0]);
            if (digit1) digit1.textContent = String(digits[1]);
            if (picker) picker.setAttribute("data-birth-year-value", `${digits[0]}${digits[1]}`);
            const producedValue = readValue();
            result.producedValuesSample.push(producedValue);
            if (!/^\d{2}$/.test(producedValue)) {
              result.invalidValuesDetected.push({ expected: expectedValue, produced: producedValue });
            } else if (producedValue !== expectedValue) {
              result.invalidValuesDetected.push({ expected: expectedValue, produced: producedValue });
            }
          }
          result.emptyStateSafe = /^\d{2}$/.test(initialValue) || initialValue === "";
          if (!result.emptyStateSafe) fail("empty_state_not_safe", initialValue);
          if (picker && /^\d{2}$/.test(initialValue)) picker.setAttribute("data-birth-year-value", initialValue);
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
          const findAgeAndBirthDatePaths = () => {
            const state = (window.Game && (window.Game.__S || window.Game.State)) || null;
            const sources = [
              ["state.save", state && state.save],
              ["state.snapshot", state && state.snapshot],
              ["state.worldSnapshot", state && state.worldSnapshot],
              ["window.__D", window.Game && window.Game.__D],
            ];
            const hits = { ageCreated: false, birthDateCreated: false, dateObjectCreated: false };
            for (const [basePath, obj] of sources) {
              if (!obj || typeof obj !== "object") continue;
              for (const key of Object.keys(obj)) {
                if (key === "age" || /age/i.test(key)) hits.ageCreated = true;
                if (key === "birthDate" || /birthdate/i.test(key)) hits.birthDateCreated = true;
                if (key === "date" || /date/i.test(key)) hits.dateObjectCreated = true;
              }
            }
            return hits;
          };
          const startBtn = document.getElementById("btnStart");
          if (!startBtn) {
            fail("start_button_missing", null);
          } else {
            const ageInfo = (() => {
              const state = (window.Game && (window.Game.__S || window.Game.State)) || null;
              const sources = [
                ["state.save", state && state.save],
                ["state.snapshot", state && state.snapshot],
                ["state.worldSnapshot", state && state.worldSnapshot],
                ["window.__D", window.Game && window.Game.__D],
              ];
              for (const [basePath, obj] of sources) {
                if (!obj || typeof obj !== "object") continue;
                for (const key of Object.keys(obj)) {
                  if (key === "age" || /age/i.test(key)) return { ageSource: "preexisting", agePath: `${basePath}.${key}` };
                }
              }
              return { ageSource: "none", agePath: null };
            })();
            result.ageSource = ageInfo.ageSource;
            result.agePath = ageInfo.agePath;
            const before = collectPersisted();
            startBtn.click();
            const after = collectPersisted();
            result.emptyStartOk = !!(window.Game && window.Game.__S && window.Game.__S.isStarted === true);
            if (!result.emptyStartOk) fail("empty_start_blocked", null);
            const combined = JSON.stringify({ before, after });
            const featureMatches = combined.match(/birthYear|birth_year|startBirthYear|selectedDigit|digit0|digit1|picker|wheel/i);
            const ageMatches = combined.match(/(?:^|[^a-zA-Z])age(?:[^a-zA-Z]|$)/i);
            result.birthYearPersistenceDetected = !!featureMatches;
            const ageFeatureLeak = ageMatches && result.ageSource !== "preexisting";
            const birthDateLeak = /birthDate|birthdate|dateObject|new Date|Date\(/i.test(combined);
            result.ageCreated = !!ageMatches && result.ageSource !== "preexisting";
            result.birthDateCreated = birthDateLeak;
            result.dateObjectCreated = birthDateLeak;
            result.newStorageKeys = Array.from(new Set([
              ...((after.storageKeys || []).filter((key) => !(before.storageKeys || []).includes(key))),
              ...((after.saveKeys || []).filter((key) => !(before.saveKeys || []).includes(key))),
              ...((after.snapshotKeys || []).filter((key) => !(before.snapshotKeys || []).includes(key))),
              ...((after.worldSnapshotKeys || []).filter((key) => !(before.worldSnapshotKeys || []).includes(key))),
            ]));
            if (result.newStorageKeys.length) fail("new_storage_keys_detected", result.newStorageKeys.slice());
            const matches = featureMatches || ageFeatureLeak ? Array.from(new Set([...(featureMatches || []), ...(ageFeatureLeak ? ["age"] : [])])) : [];
            if (matches && matches.length) {
              result.forbiddenRemaining = Array.from(new Set(matches));
              fail("persistence_hit", result.forbiddenRemaining.slice());
            }
            if (result.ageCreated) fail("age_created", true);
            if (result.birthDateCreated) fail("birthdate_created", true);
            if (result.dateObjectCreated) fail("date_object_created", true);
          }
        } catch (err) {
          fail("smoke_exception", err && err.message ? String(err.message) : String(err));
        }
        result.ok = result.failedChecks.length === 0
          && result.forbiddenRemaining.length === 0
          && result.missingCoverage.length === 0
          && result.birthYearPersistenceDetected === false
          && result.invalidValuesDetected.length === 0
          && result.emptyStateSafe === true
          && result.ageCreated === false
          && result.birthDateCreated === false
          && result.dateObjectCreated === false
          && result.newStorageKeys.length === 0;
        console.warn("BIRTH_YEAR_START_SCREEN_UI_SMOKE", result.ok ? "PASS" : "FAIL", result);
        return result;
      };
    if (typeof G.__DEV.smokeBirthYearValueContract !== "function") {
      G.__DEV.smokeBirthYearValueContract = function smokeBirthYearValueContract() {
        return runBirthYearValueContractSmoke();
      };
    }
    if (typeof G.__DEV.smokeBirthYearStartScreenUi !== "function") {
      G.__DEV.smokeBirthYearStartScreenUi = function smokeBirthYearStartScreenUi() {
        return runBirthYearValueContractSmoke();
      };
    }
    if (typeof G.__DEV.smokeUiProfileResolver !== "function") {
      const UI_PROFILE_RESOLVER_BUILD_TAG = "build_2026_06_13_step6_2_ui_profile_resolver";
      const UI_PROFILE_RESOLVER_COMMIT = "step6_2_ui_profile_resolver";
      const UI_PROFILE_RESOLVER_SMOKE_VERSION = "step6_2_ui_profile_resolver_smoke_v20260613_001";
      G.__DEV.smokeUiProfileResolver = function smokeUiProfileResolver() {
        const result = {
          ok: false,
          buildTag: UI_PROFILE_RESOLVER_BUILD_TAG,
          commit: UI_PROFILE_RESOLVER_COMMIT,
          smokeVersion: UI_PROFILE_RESOLVER_SMOKE_VERSION,
          resolvedCases: [],
          appliedBeforeEnter: false,
          textMixingDetected: false,
          newStorageKeys: [],
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
          result.resolvedCases = expectedCases.map(([input, expected]) => {
            const actual = resolvedValueOf(input);
            if (actual !== expected) {
              fail("case_mismatch", { input, expected, actual });
            }
            return { input, expected, actual };
          });
          const beforeMixSignature = JSON.stringify(beforeProfileSnapshot);
          let renderAllCount = 0;
          let renderProfileSnapshot = null;
          const originalRenderAll = G.UI && typeof G.UI.renderAll === "function" ? G.UI.renderAll : null;
          if (originalRenderAll) {
            G.UI.renderAll = function wrappedRenderAll(...args) {
              renderAllCount += 1;
              if (!renderProfileSnapshot) {
                renderProfileSnapshot = {
                  uiProfile: G.Data && typeof G.Data.getUiProfile === "function" ? G.Data.getUiProfile() : (G.Data && G.Data.UI_PROFILE) || null,
                  flagProfile: (G.__S && G.__S.flags && G.__S.flags.uiProfile) || null,
                  appliedBeforeEnter: !!(G.__DEV && G.__DEV.__uiProfileAppliedBeforeEnter === true),
                };
              }
              return originalRenderAll.apply(this, args);
            };
          }
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
            if (originalRenderAll) G.UI.renderAll = originalRenderAll;
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
          result.appliedBeforeEnter = !!(
            renderProfileSnapshot
            && renderProfileSnapshot.uiProfile === "millennial"
            && renderProfileSnapshot.flagProfile === "millennial"
            && renderProfileSnapshot.appliedBeforeEnter === true
            && G.Data
            && typeof G.Data.getUiProfile === "function"
            && G.Data.getUiProfile() === "millennial"
          );
          if (!result.appliedBeforeEnter) {
            fail("profile_not_applied_before_render", renderProfileSnapshot || null);
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
          && result.failedChecks.length === 0;
        return result;
      };
      if (!G.Dev || typeof G.Dev !== "object") G.Dev = {};
      G.Dev.smokeUiProfileResolver = G.__DEV.smokeUiProfileResolver;
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
        const runtimeSmokeVersion = typeof G.__DEV.smokeBirthYearValueContract === "function"
          ? "step6_1_birth_year_value_contract_smoke_v20260613_001"
          : (typeof G.__DEV.smokeBirthYearStartScreenUi === "function" ? "step6_1_birth_year_value_contract_smoke_v20260613_001" : null);
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
        const docsSmokeVersion = typeof G.__DEV.smokeBirthYearStartScreenUi === "function"
          ? "step6_1_birth_year_value_contract_smoke_v20260613_001"
          : null;
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
})();
