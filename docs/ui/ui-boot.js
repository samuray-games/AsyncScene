//
//  ui-boot.js
//  AsyncScene
//
//  Created by Ray on 2025/12/17.
//

// ui-boot.js
window.Game = window.Game || {};

(() => {
  const UIBOOT_VERSION = "UIBOOT_V5";
  const UIBOOT_MODE_FIX_MARKER = "UIBOOT_MODE_FIX_7E9D54F";
  const START_DIAG_MAX = 12;
  const startDiagLines = [];

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function markStartDiag(label) {
    const line = `${new Date().toLocaleTimeString()} ${label}`;
    startDiagLines.push(line);
    while (startDiagLines.length > START_DIAG_MAX) startDiagLines.shift();
    setText("startDiag", startDiagLines.join("\n"));
  }

  function markUiBootVersion() {
    setText("deployMarker", "BOOT_FIX_V4");
    setText("uiBootVersion", UIBOOT_VERSION);
    markStartDiag(`${UIBOOT_VERSION}_LOADED`);
    markStartDiag(UIBOOT_MODE_FIX_MARKER);
  }

  function getStartName(UI) {
    const $ = UI && UI.$;
    const input = ($ && $("nameInput")) || document.getElementById("nameInput");
    return input ? String(input.value || "").trim() : "";
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
        <div class="card login">
          <div class="cardHeader">
            <div class="h2">AsyncScene</div>
            <div class="small muted">Чат - главный экран</div>
          </div>
          <div class="formRow">
            <label class="label" for="nameInput">Твой ник</label>
            <input id="nameInput" class="input" placeholder="Твой ник" data-enter-target="btnStart" />
            <div id="deployMarker" class="pill deployMarker">BOOT_FIX_V4</div>
            <div id="uiBootVersion" class="pill uiBootVersion">UIBOOT_PENDING</div>
            <div id="startDiag" class="pill startDiag">DIAG_WAITING</div>
            <div id="startManifestShort" class="pill"></div>
            <div class="row mt12">
              <button id="btnRandom" class="btn">Случайный ник</button>
              <button id="btnStart" class="btn primary">Начать</button>
            </div>
            <div id="startHint" class="small mt12">Клик по баблу откроет личку.</div>
          </div>
        </div>
      `;
      document.body.appendChild(st);
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
    st.style.display = "";
    st.removeAttribute("aria-hidden");
    st.style.pointerEvents = "auto";
  }

  function applyStartManifest(UI) {
    const $ = UI.$;
    markUiBootVersion();
    const el = $("startManifestShort") || document.getElementById("startManifestShort");
    if (!el) return;
    const D = (window.Game && window.Game.Data) ? window.Game.Data : null;
    const text = (D && D.TEXTS && D.TEXTS.manifest && D.TEXTS.manifest.short)
      ? String(D.TEXTS.manifest.short)
      : "";
    el.textContent = text;
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

    const btnRandom = $("btnRandom");

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

    // Random nick
    if (btnRandom)
      btnRandom.onclick = () => {
        const ni = $("nameInput");
        if (!ni) return;
        if (window.Game && Game.Data && Game.Data.RANDOM_NAMES && Game.Data.pick) ni.value = Game.Data.pick(Game.Data.RANDOM_NAMES);
        else ni.value = `Игрок${Math.floor(Math.random() * 999)}`;
      };

    // Start. Bind every mobile-relevant event visibly so iPhone Safari can be verified without a console.
    if (btnStart) {
      markStartDiag("START_HANDLER_FOUND");
      let lastStartAt = 0;
      const runStart = (source, e) => {
        markStartDiag(source);
        const now = Date.now();
        if (now - lastStartAt < 450) return;
        lastStartAt = now;
        try {
          if (e && typeof e.preventDefault === "function") e.preventDefault();
        } catch (_) {}
        try {
          startGame(UI);
        } catch (err) {
          markStartDiag(`START_EXCEPTION:${err && err.message ? err.message : String(err)}`);
        }
      };
      btnStart.onclick = (e) => runStart("click", e);
      btnStart.addEventListener("touchstart", (e) => { markStartDiag("touchstart"); }, { passive: true });
      btnStart.addEventListener("touchend", (e) => runStart("touchend", e), { passive: false });
      btnStart.addEventListener("pointerup", (e) => runStart("pointerup", e), false);
    } else {
      markStartDiag("START_HANDLER_MISSING");
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
            UI.dmPushLine(withId, target.name, target.role === "bandit" ? "ты че, самый смелый? ща разберемся" : "слыш, не умничай, выходи на баттл");
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

      markStartDiag("START_CLICKED");
      const name = getStartName(UI);
      if (!name) {
        markStartDiag("START_NEEDS_NAME");
        return;
      }

      if (S.flags.started || S.isStarted === true) {
        S.flags.started = true;
        S.isStarted = true;
        if (G.State) {
          G.State.isStarted = true;
          if (G.State.flags) G.State.flags.started = true;
        }
        markStartDiag("START_HIDE_ATTEMPT");
        ensureStartScreenHidden(UI);
        startHidden = true;
        markStartDiag("STARTSCREEN_HIDDEN");
        return;
      }

      S.flags.started = true;
      S.isStarted = true;
      if (G.State) {
        G.State.isStarted = true;
        if (G.State.flags) G.State.flags.started = true;
      }
      if (!S.me) S.me = { id: "me" };

      // Reset player state
      S.me.name = name;

      // Hide as soon as the start input is accepted so later optional UI work cannot keep the overlay open.
      markStartDiag("START_HIDE_ATTEMPT");
      ensureStartScreenHidden(UI);
      startHidden = true;
      markStartDiag("STARTSCREEN_HIDDEN");
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
        S.progress = { weeklyInfluenceGained: 0, weekStartAt: 0, lastDailyBonusAt: 0 };
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
        markStartDiag(`START_EXCEPTION:${err && err.message ? err.message : String(err)}`);
      }
    }
  }

  function boot(UI) {
    const G = window.Game || {};
    bindLocations(UI);

    ensureStartScreenVisible(UI);
    applyStartManifest(UI);

    // Build players once so name lists exist (mentions, DM roster), but do NOT start loops yet
    if (!UI.S.players || Object.keys(UI.S.players).length === 0) {
      UI.buildPlayers && UI.buildPlayers();
    }

    // Bind events
    bindUI(UI);
    if (typeof bindChatHeaderLocations === "function") bindChatHeaderLocations(UI);
    bindBlockHeaderToggles(UI);

    // Render minimal UI only
    UI.renderAllMinimal && UI.renderAllMinimal();

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
        setTimeout(() => { try { G.__DEV.selfCheck({ mode: selfCheckMode, mutate: false }); } catch (_) {} }, 0);
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

  whenReady(initWithRetry);
})();
