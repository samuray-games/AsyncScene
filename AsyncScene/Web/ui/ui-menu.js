// ui-menu.js
window.Game = window.Game || {};

(() => {
  const tryInit = () => {
    // UI-core must run first. If not ready yet, retry shortly.
    if (!window.Game.UI) return false;

    const UI = Game.UI;
    const S = UI.S;

  const getMenuBlock = () => document.getElementById("menuBlock");

  function applyMenuLabels() {
    const t = (Game.Data && typeof Game.Data.t === "function") ? Game.Data.t : (k) => String(k || "");
    const menuBtn = document.getElementById("btnMenu");
    if (menuBtn) menuBtn.textContent = t("menu_title");
    const lotTop = document.getElementById("btnLotteryTop");
    if (lotTop) {
      lotTop.title = "Лотерея отключена";
      lotTop.textContent = "Лотерея отключена";
    }
    const legacyRes = document.getElementById("lotteryResult");
    if (legacyRes) legacyRes.remove();

    const block = getMenuBlock();
    if (!block) return;
    const header = block.querySelector(".blockHeader, .panelHeader");
    if (!header) return;
    const titleNode = header.querySelector("div");
    if (titleNode) titleNode.textContent = t("menu_title");
  }

  function ensureManifestControls() {
    const block = getMenuBlock();
    if (!block) return;

    const body = document.getElementById("menuBody") || block.querySelector(".blockBody, .panelBody");
    if (!body) return;

    const btnId = "btnManifestToggle";
    let btn = document.getElementById(btnId);
    if (!btn) {
      btn = document.createElement("button");
      btn.id = btnId;
      btn.className = "btn small";
      btn.textContent = "Цель игры";
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const S = UI.S || {};
        S.flags = S.flags || {};
        S.flags.manifestOpen = !S.flags.manifestOpen;
        if (UI.renderMenu) UI.renderMenu();
      };
      body.appendChild(btn);
    }

    let panel = document.getElementById("manifestPanel");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "manifestPanel";
      panel.className = "panel manifestPanel hidden";

      const header = document.createElement("div");
      header.className = "panelHeader";
      const title = document.createElement("div");
      title.textContent = "Цель игры";
      const close = document.createElement("button");
      close.className = "btn closeX";
      close.type = "button";
      close.textContent = "×";
      close.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const S = UI.S || {};
        S.flags = S.flags || {};
        S.flags.manifestOpen = false;
        if (UI.renderMenu) UI.renderMenu();
      };
      header.appendChild(title);
      header.appendChild(close);

      const panelBody = document.createElement("div");
      panelBody.className = "panelBody manifestBody";
      panelBody.id = "manifestBody";

      panel.appendChild(header);
      panel.appendChild(panelBody);
      body.appendChild(panel);
    }

    const D = (Game && Game.Data) ? Game.Data : null;
    const full = (D && D.TEXTS && D.TEXTS.manifest && D.TEXTS.manifest.full)
      ? String(D.TEXTS.manifest.full)
      : "";
    const bodyEl = document.getElementById("manifestBody");
    if (bodyEl) bodyEl.textContent = full;

    const S = UI.S || {};
    S.flags = S.flags || {};
    panel.classList.toggle("hidden", !S.flags.manifestOpen);
  }

  function isDevModeActive() {
    try {
      if (Game && Game.Debug && Game.Debug.SHOW_NPC_BALANCES === true) return true;
      if (typeof window !== "undefined") {
        if (window.__DEV__ === true || window.DEV === true) return true;
        if (typeof location !== "undefined" && location && location.hostname === "localhost") return true;
        if (typeof location !== "undefined" && location && location.search && location.search.includes("dev=1")) return true;
      }
      if (S && S.flags && S.flags.devChecks === true) return true;
    } catch (_) {}
    return false;
  }

  function isCirculationEnabledUI() {
    const dbg = (Game && Game.Debug) ? Game.Debug : null;
    if (dbg && dbg.FORCE_CIRCULATION === true) return true;
    if (dbg && dbg.FORCE_CIRCULATION === false) return false;
    const D0 = (Game && Game.Data) ? Game.Data : null;
    const v = D0 && D0.CIRCULATION_ENABLED;
    return v === true || v === 1 || v === "true" || v === "1";
  }

  function ensureEconDevControls() {
    if (!isDevModeActive()) return;
    const block = getMenuBlock();
    if (!block) return;
    const body = document.getElementById("menuBody") || block.querySelector(".blockBody, .panelBody");
    if (!body) return;

    let wrap = document.getElementById("devEconControls");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = "devEconControls";
      wrap.className = "eventRow";
      body.appendChild(wrap);
    }

    const modeNow = isCirculationEnabledUI() ? "CIR" : "LEGACY";
    let label = document.getElementById("devEconLabel");
    if (!label) {
      label = document.createElement("div");
      label.id = "devEconLabel";
      label.className = "pill";
      wrap.appendChild(label);
    }
    label.textContent = `ECON: ${modeNow}`;

    let btn = document.getElementById("devEconToggle");
    if (!btn) {
      btn = document.createElement("button");
      btn.id = "devEconToggle";
      btn.className = "btn small";
      btn.textContent = "Переключить ECON";
      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        Game.Debug = Game.Debug || {};
        const cur = isCirculationEnabledUI();
        Game.Debug.FORCE_CIRCULATION = !cur;
        const next = Game.Debug.FORCE_CIRCULATION === true ? "CIR" : "LEGACY";
        if (UI && typeof UI.pushSystem === "function") UI.pushSystem(`ECON switched to ${next}`);
        label.textContent = `ECON: ${next}`;
      };
      wrap.appendChild(btn);
    }
  }
  function ensureMenuHeaderHasCloseX() {
    const block = getMenuBlock();
    if (!block) return;

    // Support both old and new header classnames.
    const header = block.querySelector(".blockHeader, .panelHeader");
    if (!header) return;

    // If we already injected a close button - do nothing.
    if (header.querySelector("#menuCloseX")) return;

    // Some layouts use a right-side label container.
    const righty = header.querySelector(".righty");

    const btn = document.createElement("button");
    btn.id = "menuCloseX";
    btn.className = "btn closeX"; // style.css supports this
    btn.type = "button";
    btn.textContent = "×";
    btn.title = "Свернуть";

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      UI.hideMenu();
    });

    // Always use explicit Close (×). Menu is closed, not collapsed.
    if (righty) {
      righty.replaceWith(btn);
    } else {
      header.appendChild(btn);
    }
  }

  function ensureLotteryControls() {
    const dock = document.getElementById("lotteryDock");
    if (!dock) return;

    const legacyHint = document.getElementById("lotteryHint");
    if (legacyHint) legacyHint.remove();

    const existing = document.getElementById("lotteryControls");
    if (existing && existing.parentElement === dock) return;
    if (existing) existing.remove();
    const legacyRes = document.getElementById("lotteryResult");
    if (legacyRes) legacyRes.remove();

    const LOT = (Game.Data && Game.Data.LOTTERY) ? Game.Data.LOTTERY : { bet: 5 };
    const BET = (LOT.bet | 0) || 5;

    const wrap = document.createElement("div");
    wrap.id = "lotteryControls";
    wrap.className = "lotteryRow";
    wrap.textContent = "Лотерея отключена";
    dock.appendChild(wrap);
  }

  function showLotteryToast(text) {
    const btn = document.getElementById("btnLotteryTop");
    if (!btn) return;

    let toast = document.getElementById("lotteryToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "lotteryToast";
      toast.className = "lotteryToast";
      toast.onclick = () => { toast.style.display = "none"; };
      document.body.appendChild(toast);
    }

    toast.textContent = text;
    const r = btn.getBoundingClientRect();
    const left = Math.round(r.left + (r.width / 2));
    const top = Math.round(r.bottom + 8);
    toast.style.left = `${left}px`;
    toast.style.top = `${top}px`;
    toast.style.display = "block";
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%)";

    try { clearTimeout(UI._lotteryToastTimer); } catch (_) {}
    UI._lotteryToastTimer = setTimeout(() => {
      if (toast) toast.style.display = "none";
    }, 5000);
  }

  function ensurePointsActions() {
    const block = getMenuBlock();
    if (!block) return;

    const body = document.getElementById("menuBody") || block.querySelector(".blockBody, .panelBody");
    if (!body) return;

    const existing = document.getElementById("pointsActions");
    if (existing && existing.parentElement === body) return;
    if (existing) existing.remove();

    const wrap = document.createElement("div");
    wrap.id = "pointsActions";
    wrap.className = "actions";

    const D0 = Game.Data || {};
    const costForce = Number.isFinite(D0.COST_FORCE_NPC_EVENT) ? (D0.COST_FORCE_NPC_EVENT | 0) : 5;
    const costIntervene = Number.isFinite(D0.COST_INTERVENE_CONFLICT) ? (D0.COST_INTERVENE_CONFLICT | 0) : 4;

    const spend = (amount, reason) => {
      try {
        if (Game.StateAPI && typeof Game.StateAPI.spendPoints === "function") {
          return Game.StateAPI.spendPoints(amount, reason);
        }
      } catch (_) {}
      return false;
    };

    const btnForce = document.createElement("button");
    btnForce.className = "btn small";
    btnForce.textContent = "Недоступно";
    btnForce.disabled = true;
    btnForce.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    wrap.appendChild(btnForce);

    const interveneWrap = document.createElement("div");
    interveneWrap.style.display = "flex";
    interveneWrap.style.gap = "8px";
    interveneWrap.style.alignItems = "center";

    const inp = document.createElement("input");
    inp.type = "text";
    inp.className = "input";
    inp.placeholder = "ID баттла или ник";
    inp.style.flex = "1 1 auto";

    const btnIntervene = document.createElement("button");
    btnIntervene.className = "btn small";
    btnIntervene.textContent = "Недоступно";
    btnIntervene.disabled = true;
    btnIntervene.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    interveneWrap.appendChild(inp);
    interveneWrap.appendChild(btnIntervene);
    wrap.appendChild(interveneWrap);

    body.appendChild(wrap);
  }

  UI.showMenu = () => {
    const el = getMenuBlock();
    if (!el) return;

    S.flags = S.flags || {};
    S.flags.menuOpen = true;

    el.classList.remove("hidden");
    el.classList.add("menu-open");

    applyMenuLabels();
    const right = document.getElementById("right");
    if (right) {
      const h = el.offsetHeight || el.getBoundingClientRect().height || 0;
      right.style.setProperty("--menu-height", `${Math.ceil(h)}px`);
      right.classList.add("menu-open");
    }

    ensureMenuHeaderHasCloseX();
    ensureLotteryControls();
    ensurePointsActions();
    ensureManifestControls();

    // Re-measure after injecting controls so layout push is correct
    const right2 = document.getElementById("right");
    if (right2) {
      const h2 = el.offsetHeight || el.getBoundingClientRect().height || 0;
      right2.style.setProperty("--menu-height", `${Math.ceil(h2)}px`);
    }

    // Menu is a block, not overlay. Let layout flow push content down.
    el.scrollIntoView?.({ block: "nearest" });

    const inp = document.getElementById("lotteryBet");
    if (inp) inp.dispatchEvent(new Event("input"));
  };

  UI.hideMenu = () => {
    const el = getMenuBlock();
    if (!el) return;

    S.flags = S.flags || {};
    S.flags.menuOpen = false;

    el.classList.add("hidden");
    el.classList.remove("menu-open");

    const right = document.getElementById("right");
    if (right) {
      right.style.removeProperty("--menu-height");
      right.classList.remove("menu-open");
    }
  };

  UI.toggleMenu = () => {
    S.flags = S.flags || {};
    const open = !!S.flags.menuOpen;
    if (open) UI.hideMenu();
    else UI.showMenu();
  };

  // Allow renderAll() to refresh menu labels when TEXT_MODE changes.
  UI.renderMenu = () => {
    applyMenuLabels();
    if (S.flags && S.flags.menuOpen) ensureMenuHeaderHasCloseX();
    ensureManifestControls();
    ensureEconDevControls();
  };

  UI.lottery = () => {
    ensureLotteryControls();
    showLotteryToast("Лотерея отключена");
    return;

    const LOT = (Game.Data && Game.Data.LOTTERY) ? Game.Data.LOTTERY : { bet: 5, cooldownMs: 10 * 60 * 1000 };
    const bet = (LOT.bet | 0) || 5;
    const cooldownMs = (LOT.cooldownMs | 0) || (10 * 60 * 1000);

    // Points check
    const notify = (t) => {
      showLotteryToast(t);
    };

    if ((S.me.points || 0) < bet) {
      notify("Недоступно.");
      UI.requestRenderAll?.();
      return;
    }

    const lot = S.lottery || (S.lottery = { bet, lastRoll: null, lastAt: 0, plays: 0 });
    const now = Date.now();
    const lastAt = Number(lot.lastAt || 0);
    if (lastAt && (now - lastAt) < cooldownMs) {
      notify("Рано. Дай паузу.");
      UI.requestRenderAll?.();
      return;
    }

    const spend = (Game.StateAPI && typeof Game.StateAPI.spendPoints === "function")
      ? Game.StateAPI.spendPoints
      : null;
    if (spend && !spend(bet, "lottery")) {
      notify("Недоступно.");
      UI.requestRenderAll?.();
      return;
    }
    if (!spend) {
      S.me.points = Math.max(0, (S.me.points || 0) - bet);
    }

    const plays = (lot.plays | 0);
    const weights = (plays < 2)
      ? [55, 25, 19, 1]
      : (plays < 5)
        ? [75, 18, 6, 1]
        : [82, 14, 3, 1];
    const values = [0, 5, 10, 20];

    let roll = Math.floor(Math.random() * 100);
    let win = 0;
    for (let i = 0; i < weights.length; i++) {
      roll -= weights[i];
      if (roll < 0) { win = values[i]; break; }
    }

    try {
      if (Game.StateAPI?.setLotteryLastRoll) Game.StateAPI.setLotteryLastRoll(win);
      else {
        S.lottery = S.lottery || { bet: bet, lastRoll: null, lastAt: 0, plays: 0 };
        S.lottery.lastRoll = win;
        S.lottery.lastAt = Date.now();
      }
    } catch (_) {}
    lot.lastAt = Date.now();
    lot.plays = (lot.plays | 0) + 1;

    if (win <= 0) {
      const loseLines = ["Ну… бывает.", "Не сегодня.", "Логично.", "Мимо."];
      notify(loseLines[Math.floor(Math.random() * loseLines.length)]);
    } else {
      const winLines = ["Окей, повезло.", "Ладно, это было чисто.", "Чисто фарт."];
      notify(winLines[Math.floor(Math.random() * winLines.length)]);
    }

    if (win > 0) {
      if (Game.StateAPI && typeof Game.StateAPI.addPoints === "function") {
        Game.StateAPI.addPoints(win, "lottery_win");
      } else {
        S.me.points += win;
      }
    }
    try {
      const name = (S.me && S.me.name) ? S.me.name : "Игрок";
      const text = `${name} сыграл в лотерею.`;
      if (UI.pushChat) UI.pushChat({ name: "Система", text, system: true });
    } catch (_) {}
    UI.requestRenderAll?.();
  };

  UI.bindMenuUI = () => {
    applyMenuLabels();
    ensureMenuHeaderHasCloseX();

    // IMPORTANT: #btnMenu (and sometimes #btnLottery) can be recreated on every UI re-render.
    // Directly binding to the element once will break after requestRenderAll().
    // Use delegated binding that survives DOM replacement.
    if (!UI._menuDelegatedBound) {
      UI._menuDelegatedBound = true;

      document.addEventListener("click", (e) => {
        // Menu toggle
        const menuBtn = e.target && e.target.closest ? e.target.closest("#btnMenu") : null;
        if (menuBtn) {
          e.preventDefault();
          e.stopPropagation();
          UI.toggleMenu();
          // Some codepaths rely on a render request to refresh layout/classes.
          if (UI.requestRenderAll) UI.requestRenderAll();
          return;
        }

        // Lottery action
        const lotBtn = e.target && e.target.closest ? e.target.closest("#btnLottery, #btnLotteryTop") : null;
        if (lotBtn) {
          e.preventDefault();
          e.stopPropagation();
          UI.lottery();
          return;
        }
      });
    }
  };

  // Best-effort bind now (if DOM ready), and also let ui-boot call UI.bindMenuUI() safely.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => UI.bindMenuUI(), { once: true });
  } else {
    UI.bindMenuUI();
  }

  // Restore menu open state from flags on boot / re-render (full restore, not only "hidden")
  try {
    if (S.flags && S.flags.menuOpen) {
      UI.showMenu();
    } else {
      UI.hideMenu();
    }
  } catch (_) {}

    return true;
  };

  // Init now if possible, otherwise retry until UI becomes available.
  if (!tryInit()) {
    const retry = () => {
      if (tryInit()) return;
      setTimeout(retry, 50);
    };
    setTimeout(retry, 0);
  }
})();
