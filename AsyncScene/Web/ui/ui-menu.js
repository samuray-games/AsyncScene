// ui-menu.js
window.Game = window.Game || {};

(() => {
  const tryInit = () => {
    // UI-core must run first. If not ready yet, retry shortly.
    if (!window.Game.UI) return false;

    const UI = Game.UI;
    const S = UI.S;

  const getMenuBlock = () => document.getElementById("menuBlock");
  const TRAINING_UI_ARG_KEY = "menu_training_arg";

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
      if (Game && Game.__D && Game.__D.SHOW_NPC_BALANCES === true) return true;
      if (typeof window !== "undefined") {
        if (window.__DEV__ === true || window.DEV === true) return true;
        if (typeof location !== "undefined" && location && location.search) {
          try {
            const params = new URLSearchParams(location.search);
            if (params.get("dev") === "1") return true;
          } catch (_) {}
        }
      }
      if (S && S.flags && S.flags.devChecks === true) return true;
    } catch (_) {}
    return false;
  }

  function isCirculationEnabledUI() {
    return true;
  }

  function ensureLoggerControls() {
    if (!isDevModeActive()) return;
    const block = getMenuBlock();
    if (!block) return;
    const body = document.getElementById("menuBody") || block.querySelector(".blockBody, .panelBody");
    if (!body) return;

    let wrap = document.getElementById("loggerControls");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = "loggerControls";
      wrap.className = "eventRow";
      wrap.style.gap = "8px";
      wrap.style.flexWrap = "wrap";
      wrap.style.alignItems = "center";
      body.appendChild(wrap);
    }
    wrap.innerHTML = "";

    const status = document.createElement("span");
    status.id = "loggerStatusIndicator";
    status.className = "pill";
    status.textContent = "Logger: unknown";
    wrap.appendChild(status);

    const makeButton = (label, title, onClick) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn small";
      btn.textContent = label;
      btn.title = title;
      btn.onclick = onClick;
      wrap.appendChild(btn);
      return btn;
    };

    const logger = (Game && Game.Logger) ? Game.Logger : null;
    const notify = (msg) => {
      if (UI && typeof UI.showStatToast === "function") UI.showStatToast("points", msg);
      else if (UI && typeof UI.pushSystem === "function") UI.pushSystem(msg);
    };

    makeButton("Ping logger", "Check logger availability", async () => {
      if (!logger) {
        notify("Logger not running.");
        return;
      }
      const ok = await logger.ping();
      notify(ok ? "Logger reachable." : "Logger unreachable.");
    });

    makeButton("Force flush", "Send pending log batch", () => {
      if (!logger) {
        notify("Logger not running.");
        return;
      }
      logger.forceFlush();
      notify("Logger flush triggered.");
    });

    const updateStatus = (value) => {
      if (!status) return;
      const label = value === "connected" ? "connected" : value === "disconnected" ? "disconnected" : "unknown";
      status.textContent = `Logger: ${label}`;
    };
    if (logger && typeof logger.onStatusChange === "function") {
      logger.onStatusChange(updateStatus);
    } else {
      updateStatus("disabled");
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
    btn.title = "Закрыть";

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

    const existing = document.getElementById("trainingControls");
    if (existing && existing.parentElement === body) return;
    if (existing) existing.remove();

    const wrap = document.createElement("div");
    wrap.id = "trainingControls";
    wrap.className = "actions";
    wrap.style.display = "flex";
    wrap.style.flexDirection = "column";
    wrap.style.gap = "8px";

    const statusText = document.createElement("div");
    statusText.id = "trainingStatusText";
    statusText.className = "trainingStatus";
    statusText.textContent = "Загрузка тренировки...";

    const btn = document.createElement("button");
    btn.id = "trainingActionBtn";
    btn.type = "button";
    btn.className = "btn small";
    btn.textContent = "Тренировка аргумента";

    const resultText = document.createElement("div");
    resultText.id = "trainingResultText";
    resultText.className = "trainingResult";
    resultText.textContent = "xp: 0, уровень: 0";

    wrap.appendChild(statusText);
    wrap.appendChild(btn);
    wrap.appendChild(resultText);
    body.appendChild(wrap);

    const trainingControls = {
      argKey: TRAINING_UI_ARG_KEY,
      button: btn,
      statusEl: statusText,
      resultEl: resultText,
      latestStatus: null,
      refresh: updateTrainingStatus,
      performAction: handleTrainingAction
    };
    Game.UI.trainingControls = trainingControls;

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleTrainingAction();
    });

    function formatCooldownText(status) {
      if (!status) return "";
      if (status.whyBlocked === "cooldown") return `Кулдаун до дня ${status.cooldownUntilDay} (ещё ${status.remainingDays || 0} дн.)`;
      if (status.whyBlocked === "insufficient_points") return "Не хватает 💰";
      return "Готово к тренировке";
    }

    function updateTrainingStatus() {
      const api = Game.TrainingAPI || null;
      if (!api || typeof api.status !== "function") {
        trainingControls.latestStatus = null;
        trainingControls.statusEl.textContent = "Тренинг недоступен.";
        trainingControls.resultEl.textContent = "";
        trainingControls.button.disabled = true;
        return;
      }
      const status = api.status({ argKey: TRAINING_UI_ARG_KEY });
      trainingControls.latestStatus = status;
      if (!status || !status.ok) {
        trainingControls.statusEl.textContent = "Статус тренинга недоступен.";
        trainingControls.button.disabled = true;
        trainingControls.resultEl.textContent = "";
        return;
      }
      const price = Number.isFinite(status.price) ? (status.price | 0) : 0;
      trainingControls.button.textContent = `Тренировка аргумента (${price} 💰)`;
      trainingControls.button.disabled = !status.canTrain;
      trainingControls.statusEl.textContent = `Цена ${price} 💰 • ${status.canTrain ? "доступно" : formatCooldownText(status)}`;
      const xp = status.progress && Number.isFinite(status.progress.xp) ? (status.progress.xp | 0) : 0;
      const level = status.progress && Number.isFinite(status.progress.level) ? (status.progress.level | 0) : 0;
      trainingControls.resultEl.textContent = `XP ${xp}, уровень ${level}`;
    }

    function handleTrainingAction() {
      updateTrainingStatus();
      const status = trainingControls.latestStatus;
      if (!status || !status.ok || !status.canTrain) {
        return { ok: false, reason: status ? status.whyBlocked : "blocked" };
      }
      const trainId = `ui_train_${Date.now().toString(36)}`;
      const res = Game.TrainingAPI.train({ argKey: TRAINING_UI_ARG_KEY, trainId });
      if (res && res.snapshotAfter) {
        const snap = res.snapshotAfter;
        const xp = snap.progress && Number.isFinite(snap.progress.xp) ? (snap.progress.xp | 0) : 0;
        const level = snap.progress && Number.isFinite(snap.progress.level) ? (snap.progress.level | 0) : 0;
        trainingControls.resultEl.textContent = `XP ${xp}, уровень ${level}, кулдаун до дня ${snap.cooldownUntilDay}`;
      }
      setTimeout(updateTrainingStatus, 0);
      return res;
    }

    updateTrainingStatus();
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
    if (UI.trainingControls && typeof UI.trainingControls.refresh === "function") {
      UI.trainingControls.refresh();
    }

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
    ensureLoggerControls();
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

    const spend = (Game.__A && typeof Game.__A.spendPoints === "function")
      ? Game.__A.spendPoints
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
      if (Game.__A?.setLotteryLastRoll) Game.__A.setLotteryLastRoll(win);
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
      if (Game.__A && typeof Game.__A.addPoints === "function") {
        Game.__A.addPoints(win, "lottery_win");
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
