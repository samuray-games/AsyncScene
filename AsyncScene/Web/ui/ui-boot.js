//
//  ui-boot.js
//  AsyncScene
//
//  Created by Ray on 2025/12/17.
//

// ui-boot.js
window.Game = window.Game || {};

(() => {
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
    st.classList.add("active");
    st.style.display = "";
    st.removeAttribute("aria-hidden");
    st.style.pointerEvents = "auto";
  }

  function applyStartManifest(UI) {
    const $ = UI.$;
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
    if (!st) return;

    // Hide robustly: some index variants show the start screen by default
    st.classList.remove("active");
    st.style.display = "none";
    st.setAttribute("aria-hidden", "true");

    // Also stop clicks from being swallowed by the overlay in case CSS keeps it on top
    st.style.pointerEvents = "none";
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
    const $ = UI.$;
    const header = $("chatHeader");
    if (!header || header.__locHeader) return;
    header.__locHeader = true;
    header.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      UI.S.flags = UI.S.flags || {};
      UI.S.flags.locationsOpen = !UI.S.flags.locationsOpen;
      if (typeof UI.renderLocations === "function") UI.renderLocations();
    });
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

    // Start
    if (btnStart) btnStart.onclick = () => startGame(UI);

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
    UI.S.flags = UI.S.flags || {};

    const S = UI.S;
    const $ = UI.$;

    const name = ($("nameInput")?.value || "").trim();
    if (!name) return;

    if (UI.S.flags.started) return;
    UI.S.flags.started = true;

    // Reset player state
    S.me.name = name;
    const startPoints = (Game.Data && Number.isFinite(Game.Data.START_POINTS_PLAYER))
      ? (Game.Data.START_POINTS_PLAYER | 0)
      : (Game.Data && Number.isFinite(Game.Data.POINTS_START))
        ? (Game.Data.POINTS_START | 0)
        : 0;
    S.me.points = startPoints;
    S.me.influence = 0;
    S.me.wins = 0;
    S.me.winsSinceInfluence = 0;
    S.me.oneShots = [];
    S.rep = 0;
    S.influence = 0;
    S.progress = { weeklyInfluenceGained: 0, weekStartAt: 0, lastDailyBonusAt: 0 };

    // Build players first (includes NPCs)
    if (Game.__A && typeof Game.__A.seedPlayers === "function") {
      Game.__A.seedPlayers();
    } else if (Game.NPC && typeof Game.NPC.seedPlayers === "function") {
      Game.NPC.seedPlayers(S);
    }
    UI.buildPlayers && UI.buildPlayers();

    if (S.players && S.players["me"]) {
      S.players["me"].name = name;
      S.players["me"].influence = 0;
      S.players["me"].points = (S.me.points | 0);
      S.players["me"].wins = 0;
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
    S.flags.highlightEventId = null;

    if (UI.closeDM) UI.closeDM();

    // Hide start
    ensureStartScreenHidden(UI);
    const st = $("startScreen") || document.getElementById("startScreen");
    if (st) st.style.pointerEvents = "none";

    // Welcome
    if (Game.Data && Game.Data.SYS && Game.Data.SYS.joined) UI.pushSystem && UI.pushSystem(Game.Data.SYS.joined(name));
    else UI.pushSystem && UI.pushSystem(`${name} пришел(а) на площадь.`);

    // Cop line
    const cop = S.players ? Object.values(S.players).find((p) => p && p.role === "cop") : null;
    if (cop && Game.NPC && Game.NPC.generateChatLine && UI.pushChat) {
      UI.pushChat({ name: cop.name, text: Game.NPC.generateChatLine(cop), system: false });
    }

    // Start loops only after login
    if (UI.startLoops) UI.startLoops();

    // Render everything
    UI.renderAll && UI.renderAll();
  }

  function boot(UI) {
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
      if (UI.S.flags.devChecks && Game.__DEV && typeof Game.__DEV.selfCheck === "function") {
        setTimeout(() => { try { Game.__DEV.selfCheck({ mode: "smoke", mutate: false }); } catch (_) {} }, 0);
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
