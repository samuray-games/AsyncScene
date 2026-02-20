// ui-battles.js
(() => {
  const Game = window.Game;
  if (!Game || !Game.UI) return;

  const UI = Game.UI;
  const S = UI.S;
  const $ = UI.$;
  const escapeHtml = UI.escapeHtml;
  const stop = (e) => {
    try { e && e.preventDefault && e.preventDefault(); } catch(_) {}
    try { e && e.stopPropagation && e.stopPropagation(); } catch(_) {}
    try { e && e.stopImmediatePropagation && e.stopImmediatePropagation(); } catch(_) {}
  };
  const t = (key, vars) => (Game.Data && typeof Game.Data.t === "function")
    ? Game.Data.t(key, vars)
    : String(key || "");

  const isDevCrowdMode = (() => {
    if (typeof window === "undefined") return false;
    const devQuery = (typeof location !== "undefined" && location.search) ? location.search : "";
    return window.__DEV__ === true || window.DEV === true || (devQuery && devQuery.includes("dev=1"));
  })();

  function formatCrowdEligibleLine(crowd) {
    const breakdown = crowd && crowd.eligibleBreakdown;
    if (!breakdown) return "";
    const eligible = Number.isFinite(breakdown.npcEligible) ? (breakdown.npcEligible | 0) : 0;
    const excluded0 = Number.isFinite(breakdown.npcExcludedZeroPts) ? (breakdown.npcExcludedZeroPts | 0) : 0;
    return `eligible: ${eligible}, excluded0: ${excluded0}`;
  }

  function updateCrowdEligibleLine(el, crowd) {
    if (!el) return;
    const text = formatCrowdEligibleLine(crowd);
    if (isDevCrowdMode && text) {
      el.textContent = text;
      el.style.display = "block";
    } else {
      el.style.display = "none";
    }
  }

  const requestAll = () => {
    try {
      if (UI && typeof UI.renderBattles === "function") return UI.renderBattles();
      if (UI && typeof UI.requestRenderAll === "function") return UI.requestRenderAll();
      if (UI && typeof UI.renderAll === "function") {
        // Avoid synchronous re-render inside click handlers.
        return setTimeout(() => {
          try { UI.renderAll(); } catch (_) {}
        }, 0);
      }
    } catch (_) {}
  };

  function getRawCountsFromVoters(c) {
    if (!c || !c.voters || typeof c.voters !== "object") {
      const a = Number.isFinite(c && c.votesA) ? (c.votesA | 0) : (Number.isFinite(c && c.aVotes) ? (c.aVotes | 0) : 0);
      const b = Number.isFinite(c && c.votesB) ? (c.votesB | 0) : (Number.isFinite(c && c.bVotes) ? (c.bVotes | 0) : 0);
      return { a, b, total: (a + b) | 0 };
    }
    let a = 0;
    let b = 0;
    for (const id of Object.keys(c.voters)) {
      const side = c.voters[id];
      if (side === "a" || side === "attacker") a++;
      else if (side === "b" || side === "defender") b++;
    }
    return { a, b, total: (a + b) | 0 };
  }

  function showBtnToastRight(btn, text) {
    if (!btn) return;
    const msg = String(text || "").trim();
    if (!msg) return;
    // Render toast as a body-level absolutely positioned element so it survives
    // rapid re-renders of the battle card (which may detach button's parent).
    let el = document.querySelector(".btnToastRight[data-for-btid=\"" + (btn.dataset && btn.dataset.battleId ? String(btn.dataset.battleId) : "") + "\"]");
    if (!el) {
      el = document.createElement("div");
      el.className = "btnToastRight";
      el.setAttribute("data-for-btid", (btn.dataset && btn.dataset.battleId) ? String(btn.dataset.battleId) : "");
      el.style.position = "absolute";
      el.style.padding = "6px 10px";
      el.style.borderRadius = "8px";
      el.style.fontSize = "12px";
      el.style.fontWeight = "900";
      el.style.whiteSpace = "nowrap";
      el.style.background = "rgba(0,0,0,0.85)";
      el.style.color = "white";
      el.style.zIndex = "999999";
      el.style.pointerEvents = "none";
      el.style.transition = "opacity 120ms ease";
      el.style.opacity = "0";
      try { document.body.appendChild(el); } catch (_) {}
    }
    el.textContent = msg;
    try {
      const r = btn.getBoundingClientRect();
      const left = (r.right + (window.pageXOffset || document.documentElement.scrollLeft || 0) + 8);
      const top = (r.top + (window.pageYOffset || document.documentElement.scrollTop || 0) + (r.height / 2));
      el.style.left = String(Math.round(left)) + "px";
      el.style.top = String(Math.round(top)) + "px";
      el.style.transform = "translateY(-50%)";
      el.style.display = "block";
      // show
      requestAnimationFrame(() => { try { el.style.opacity = "1"; } catch(_) {} });
    } catch (_) {}
    try {
      if (el.__btnToastTimer) clearTimeout(el.__btnToastTimer);
      el.__btnToastTimer = setTimeout(() => {
        try { el.style.opacity = "0"; } catch (_) {}
        try { setTimeout(() => { if (el && el.parentNode) el.parentNode.removeChild(el); }, 160); } catch (_) {}
      }, 1200);
    } catch (_) {}
  }

  function showChipToastAbove(chip, text) {
    if (!chip) return;
    const msg = String(text || "").trim();
    if (!msg) return;
    try { chip.style.position = "relative"; } catch (_) {}
    let el = chip.querySelector ? chip.querySelector(".chipToast") : null;
    if (!el) {
      el = document.createElement("div");
      el.className = "chipToast";
      el.style.position = "absolute";
      el.style.left = "50%";
      el.style.bottom = "100%";
      el.style.marginBottom = "6px";
      el.style.transform = "translateX(-50%)";
      el.style.padding = "4px 8px";
      el.style.borderRadius = "8px";
      el.style.fontSize = "12px";
      el.style.fontWeight = "900";
      el.style.whiteSpace = "nowrap";
      el.style.background = "rgba(0,0,0,0.75)";
      el.style.color = "white";
      el.style.zIndex = "9999";
      el.style.pointerEvents = "none";
      try { chip.appendChild(el); } catch (_) {}
    }
    el.textContent = msg;
    el.style.display = "block";
    try {
      if (chip.__chipToastTimer) clearTimeout(chip.__chipToastTimer);
      chip.__chipToastTimer = setTimeout(() => {
        try { if (el) el.style.display = "none"; } catch (_) {}
      }, 1200);
    } catch (_) {}
  }

  const UI_CROWD_TIMER_WARMUP_MS = 60000;
  const UI_CROWD_TIMER_COUNTDOWN_MS = 10000;
  function getUiCrowdTimerState(crowd){
  const nowMs = Date.now();
  const startedAtMs = (crowd && Number.isFinite(crowd.startedAtMs)) ? (crowd.startedAtMs | 0) : (nowMs - UI_CROWD_TIMER_WARMUP_MS);
  const warmupEndMs = startedAtMs + UI_CROWD_TIMER_WARMUP_MS;
  const countdownStartMs = (crowd && Number.isFinite(crowd.countdownStartMs))
    ? (crowd.countdownStartMs | 0)
    : null;
  const countdownEndMs = (crowd && Number.isFinite(crowd.countdownEndMs))
    ? (crowd.countdownEndMs | 0)
    : null;
  const countdownActive = countdownStartMs !== null && nowMs >= countdownStartMs;
  const leftMs = countdownEndMs ? Math.max(0, countdownEndMs - nowMs) : 0;
  const seconds = countdownEndMs ? Math.max(0, Math.ceil(leftMs / 1000)) : 0;
  const inWarmup = nowMs < warmupEndMs && !countdownActive;
  return { inWarmup, countdownActive, warmupEndMs, seconds, leftMs, countdownStartMs, countdownEndMs };
}

  // Keep a specific battle card in view across re-renders.
  UI._battleFocus = UI._battleFocus || { id: null, offset: null, at: 0 };

  function _findScrollParent(el) {
    let p = el;
    while (p && p !== document.body) {
      try {
        const cs = window.getComputedStyle(p);
        const oy = cs && cs.overflowY;
        if (oy === "auto" || oy === "scroll") return p;
      } catch (_) {}
      p = p.parentElement;
    }
    return window;
  }

  function _captureBattleFocus(battleId, cardEl) {
    try {
      if (!battleId || !cardEl) return;
      const sp = _findScrollParent(cardEl);
      if (sp === window) {
        const r = cardEl.getBoundingClientRect();
        UI._battleFocus = { id: battleId, offset: r.top, at: Date.now() };
      } else {
        const sr = sp.getBoundingClientRect();
        const cr = cardEl.getBoundingClientRect();
        UI._battleFocus = { id: battleId, offset: (cr.top - sr.top), at: Date.now() };
      }
    } catch (_) {}
  }

  function _applyBattleFocus() {
    try {
      const f = UI._battleFocus;
      if (!f || !f.id) return;
      // Only auto-follow shortly after a user action.
      if (!f.at || (Date.now() - f.at) > 1200) return;

      const body = $("battlesBody");
      if (!body) return;
      const card = body.querySelector(`[data-battle-id="${CSS.escape(String(f.id))}"]`);
      if (!card) return;

      const sp = _findScrollParent(card);
      if (sp === window) {
        const r = card.getBoundingClientRect();
        const delta = r.top - f.offset;
        if (Math.abs(delta) > 2) window.scrollBy(0, delta);
      } else {
        const sr = sp.getBoundingClientRect();
        const cr = card.getBoundingClientRect();
        const newOffset = cr.top - sr.top;
        const delta = newOffset - f.offset;
        if (Math.abs(delta) > 2) sp.scrollTop += delta;
      }
    } catch (_) {}
  }

 // Draw voting tickers (kept stable across renders)
 UI._drawTickers = UI._drawTickers || Object.create(null);
 UI._ensureDrawTicker = (battleId, getBattle, onTick) => {
   if (UI._drawTickers[battleId]) return;
   UI._drawTickers[battleId] = setInterval(() => {
      try {
        const b = getBattle();
       if (!b || (!isDrawBattle(b))) {
         clearInterval(UI._drawTickers[battleId]);
         delete UI._drawTickers[battleId];
         return;
       }
        onTick(b);
      } catch (_) {}
    }, 250);
  };
  UI._clearDrawTicker = (battleId) => {
    if (!UI._drawTickers[battleId]) return;
    try { clearInterval(UI._drawTickers[battleId]); } catch (_) {}
    delete UI._drawTickers[battleId];
  };

  // Escape voting tickers (kept stable across renders)
  UI._escapeTickers = UI._escapeTickers || Object.create(null);
  UI._ensureEscapeTicker = (battleId, getBattle, onTick) => {
    if (UI._escapeTickers[battleId]) return;
    UI._escapeTickers[battleId] = setInterval(() => {
      try {
        const b = getBattle();
        if (!b || (!isEscapeVote(b))) {
          clearInterval(UI._escapeTickers[battleId]);
          delete UI._escapeTickers[battleId];
          return;
        }
        onTick(b);
      } catch (_) {}
    }, 250);
  };
  UI._clearEscapeTicker = (battleId) => {
    if (!UI._escapeTickers[battleId]) return;
    try { clearInterval(UI._escapeTickers[battleId]); } catch (_) {}
    delete UI._escapeTickers[battleId];
  };

  // Coalesced async finalization / render scheduling for draw tickers.
  // Prevents synchronous spikes when many tickers fire near the same end time.
  UI._drawFinalizePending = UI._drawFinalizePending || Object.create(null);
  UI._drawRenderPending = UI._drawRenderPending || false;
  UI._scheduleDrawFinalize = (battleId) => {
    try {
      if (UI._drawFinalizePending[battleId]) return;
      UI._drawFinalizePending[battleId] = true;
      setTimeout(() => {
        try { delete UI._drawFinalizePending[battleId]; } catch(_) {}
        try { if (Game && Game.Conflict && typeof Game.Conflict.finalizeCrowdVote === "function") Game.Conflict.finalizeCrowdVote(battleId); } catch (_) {}
      }, 0);
    } catch (_) {}
  };
  UI._scheduleDrawRequestAll = () => {
    try {
      if (UI._drawRenderPending) return;
      UI._drawRenderPending = true;
      setTimeout(() => {
        try { UI._drawRenderPending = false; } catch(_) {}
        try { requestAll(); } catch (_) {}
      }, 0);
    } catch (_) {}
  };

  const nowMs = () => Date.now();
  const fmtSec = (ms) => {
    const s = Math.max(0, Math.ceil(ms / 1000));
    return String(s);
  };

  // Normalize timer field names across modules (some use endAt, some endsAt).
  // Returns the best-effort numeric end time (ms) or 0.
  function _normEnds(v) {
    try {
      if (!v || typeof v !== "object") return 0;
      const ea = Number(v.endAt);
      const es = Number(v.endsAt);
      const hasEA = Number.isFinite(ea) && ea > 0;
      const hasES = Number.isFinite(es) && es > 0;
      if (!hasEA && hasES) v.endAt = es;
      if (!hasES && hasEA) v.endsAt = ea;
      const out = Number(v.endAt || v.endsAt || 0);
      return Number.isFinite(out) ? out : 0;
    } catch (_) {
      return 0;
    }
  }

 const spendPoints = (amount, reason) => {
   try {
     if (Game.__A && typeof Game.__A.spendPoints === "function") {
       return Game.__A.spendPoints(amount, reason);
     }
   } catch (_) {}
   return false;
 };

 function bindBattleArgClicks() {
   const body = $("battlesBody");
   if (!body || body.__argClicksBound) return;
   body.__argClicksBound = true;
   body.addEventListener("click", (e) => {
     const chip = e && e.target && e.target.closest
       ? e.target.closest(".chip[data-action][data-arg-id]")
       : null;
     if (!chip || !body.contains(chip)) return;
     const action = chip.dataset.action;
     const argId = chip.dataset.argId;
     const battleId = chip.dataset.battleId;
     if (!battleId || !argId) return;

     const card = chip.closest(".battleCard");
     _captureBattleFocus(battleId, card);

     if (action === "pickAttack") {
       const fn = (Game.Conflict && typeof Game.Conflict.pickAttack === "function")
         ? Game.Conflict.pickAttack
         : (Game.Conflict && typeof Game.Conflict.chooseAttack === "function")
           ? Game.Conflict.chooseAttack
           : (Game.Conflict && typeof Game.Conflict.selectAttack === "function")
             ? Game.Conflict.selectAttack
             : null;
       if (fn) {
         stop(e);
         fn.call(Game.Conflict, battleId, argId);
       }
       return;
     }

     if (action === "pickDefense") {
       const fn = (Game.Conflict && typeof Game.Conflict.pickDefense === "function")
         ? Game.Conflict.pickDefense
         : (Game.Conflict && typeof Game.Conflict.chooseDefense === "function")
           ? Game.Conflict.chooseDefense
           : (Game.Conflict && typeof Game.Conflict.selectDefense === "function")
             ? Game.Conflict.selectDefense
             : null;
       if (fn) {
         stop(e);
         fn.call(Game.Conflict, battleId, argId);
       }
     }
   }, false);
 }

  function clearBattleChoices(b){
    if (!b) return;
    delete b._attackChoices;
    delete b._defenseChoices;
    delete b._choicesForStatus;
    const id = b.id != null ? String(b.id) : null;
    if (id && UI._battleChoiceCache) {
      delete UI._battleChoiceCache.attack[id];
      delete UI._battleChoiceCache.defense[id];
      delete UI._battleChoiceCache.status[id];
    }
  }

  const shuffleInPlace = (arr) => {
    try {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
      }
    } catch (_) {}
    return arr;
  };

  // Helpers
  const clsForColor = (color, hidden = false) => {
    if (hidden) return "chip hiddenPower";

    // Support only short codes.
    if (color === "y") return "chip y";
    if (color === "o") return "chip o";
    if (color === "r") return "chip r";
    if (color === "k") return "chip k";

    return "chip";
  };

  const oppInfluence = (opp) => opp ? (opp.influence || 0) : 0;

  // Normalize battle result text to the canonical trio: Победа / Поражение / Толпа решает
  function _normalizeResultText(bb) {
    try {
      if (!bb) return "Результат готов.";

      const raw = (bb.resultLine != null) ? String(bb.resultLine) : "";
      const rawL = raw.toLowerCase();

      // If core/UI used flavor text for draw, normalize it.
      if (rawL.includes("чил")) return raw;
      if (rawL.includes("нич") || rawL.includes("draw") || rawL.includes("tie") || rawL.includes("peace")) {
        return t("battle_draw");
      }
      if (rawL.includes("побед") || rawL.includes("win") || rawL.includes("victory") || rawL.includes("won")) {
        return t("battle_win");
      }
      if (rawL.includes("пораж") || rawL.includes("проиг") || rawL.includes("lose") || rawL.includes("loss") || rawL.includes("lost")) {
        return t("battle_lose");
      }

      // Derive from common structured outcome fields.
      const r = (bb.result || bb.outcome || bb.final || bb.status || "");
      const rr = String(r).toLowerCase();

      if (rr === "win" || rr === "victory" || rr === "won" || rr === "attacker_win" || rr === "a_win") return t("battle_win");
      if (rr === "lose" || rr === "loss" || rr === "lost" || rr === "defender_win" || rr === "b_win") return t("battle_lose");
      if (rr === "draw" || rr === "tie" || rr === "peace" || rr === "chill") return t("battle_draw");

      // If there was some other text, keep it (but avoid empty).
      if (raw && raw.trim()) return raw;
      return "Результат готов.";
    } catch (_) {
      return "Результат готов.";
    }
  }

  // Keep 3-choice sets stable across UI re-renders.
  UI._battleChoiceCache = UI._battleChoiceCache || { attack: Object.create(null), defense: Object.create(null), status: Object.create(null) };
  function _resetChoiceCacheIfNeeded(b) {
    if (!b) return;
    const id = b.id != null ? String(b.id) : null;
    if (b.resolved === true) {
      delete b._attackChoices;
      delete b._defenseChoices;
      delete b._choicesForStatus;
      if (id) {
        delete UI._battleChoiceCache.attack[id];
        delete UI._battleChoiceCache.defense[id];
        delete UI._battleChoiceCache.status[id];
      }
      return;
    }
    if (id) {
      const lastStatus = UI._battleChoiceCache.status[id];
      if (lastStatus && lastStatus !== b.status) {
        delete UI._battleChoiceCache.attack[id];
        delete UI._battleChoiceCache.defense[id];
      }
      UI._battleChoiceCache.status[id] = b.status;
    }
    if (b._choicesForStatus !== b.status) {
      delete b._attackChoices;
      delete b._defenseChoices;
      b._choicesForStatus = b.status;
    }
  }

  function _getOrBuildChoices(b, key, buildFn) {
    try {
      _resetChoiceCacheIfNeeded(b);
      const cacheKey = (key === "_attackChoices") ? "attack" : "defense";
      if (b && Array.isArray(b[key]) && b[key].length === 3) return b[key];
      if (b && b.id != null) {
        const id = String(b.id);
        const cached = UI._battleChoiceCache[cacheKey] && UI._battleChoiceCache[cacheKey][id];
        if (Array.isArray(cached) && cached.length === 3) {
          b[key] = cached;
          return cached;
        }
      }
      const built = (buildFn && typeof buildFn === "function") ? (buildFn() || []) : [];
      if (b) b[key] = built;
      if (b && b.id != null) {
        const id = String(b.id);
        if (UI._battleChoiceCache[cacheKey]) UI._battleChoiceCache[cacheKey][id] = built;
      }
      return built;
    } catch (_) {
      return [];
    }
  }

  function setInlineNote(battleId, text) {
    try {
      const b = S.battles.find(x => x && x.id === battleId);
      if (!b) return;
      b.inlineNote = text || "";
      requestAll();
    } catch (_) {}
  }

  function tryEscapeBattle(battleId, mode, anchorBtn, costOverride) {
    try {
      const Core = (Game && (Game._ConflictCore || Game.ConflictCore)) ? (Game._ConflictCore || Game.ConflictCore) : null;
      const useCore = !!(Core && typeof Core.escape === "function");
      const useApi = !!(Game.Conflict && typeof Game.Conflict.escape === "function");
      if (!useCore && !useApi) return;

      const opts = (typeof mode === "string" || mode == null)
        ? { mode: String(mode || "smyt") }
        : mode;
      if (typeof costOverride === "number") opts.cost = costOverride | 0;

      const res = useCore ? Core.escape(battleId, opts) : Game.Conflict.escape(battleId, opts);
      // If player has no points, show a nearby toast immediately (UI-level guidance),
      // but still call core so rep_escape_click is applied and core can return its result.
      try {
        const mePts = (Game && Game.__S && Game.__S.me && Number.isFinite(Game.__S.me.points)) ? (Game.__S.me.points | 0) : 0;
        if ((mePts | 0) <= 0 && opts && String(opts.mode || "").toLowerCase() !== "off") {
          const msg = "Не хватает пойнтов.";
          if (anchorBtn) {
            showBtnToastRight(anchorBtn, msg);
          } else if (UI && typeof UI.showStatToast === "function") {
            UI.showStatToast("points", msg);
          } else {
            setInlineNote(battleId, msg);
          }
        }
      } catch (_) {}

      if (res && res.ok === false) {
        const cost = (typeof res.cost === "number") ? res.cost : null;
        if (
          res.reason === "no_points" ||
          res.reason === "insufficient" ||
          res.reason === "min_reserve" ||
          res.error === "not_enough_points"
        ) {
         const msg = "Не хватает пойнтов.";
         if (anchorBtn) {
           showBtnToastRight(anchorBtn, msg);
         } else if (UI && typeof UI.showStatToast === "function") {
           UI.showStatToast("points", msg);
         } else {
           setInlineNote(battleId, msg);
         }
       } else {
         setInlineNote(battleId, "Этот мув не зашёл.");
       }
      }
      requestAll();
    } catch (_) {
      // silent
    }
  }

  UI.pinBattleToTop = (battleId) => {
    const b = S.battles.find(x => x && x.id === battleId);
    if (!b) return;

    // Mark as pinned and bump to "most recent pin" so it floats to the top.
    b.pinned = true;
    b.pinnedAt = Date.now();

    requestAll();
  };

 function activeBattles() {
   return S.battles.filter(b => b && (b.resolved !== true || isDrawBattle(b)));
 }

 function resolvedBattles() {
   return S.battles.filter(b => b && b.resolved === true && !isDrawBattle(b));
 }

  function removeResolvedBattles() {
    // clear any tickers that might be attached
   try {
     S.battles.forEach(b => {
       if (b && b.id && b.resolved === true && !isDrawBattle(b)) {
         UI._clearDrawTicker(b.id);
         UI._clearEscapeTicker(b.id);
       }
     });
   } catch (_) {}
   S.battles = S.battles.filter(b => !(b && b.resolved === true && !isDrawBattle(b)));
    requestAll();
  }

 // Escape all only affects ACTIVE battles
 function escapeAllActive(mode) {
   const act = activeBattles();
   if (act.length === 0) return;

   const canFreeOff = (S && S.me && Number.isFinite(S.me.influence) ? S.me.influence : (S && S.me ? (S.me.influence || 0) : 0)) >= 5;

   // "Отвали" (free dismiss) - only if unlocked.
   // Mafioso cannot be dismissed with "off" - only escape is allowed.
   if (mode === "off") {
     if (!canFreeOff) return;

     let hadMafia = false;

     // Close ONLY active battles, keep resolved ones.
     act.forEach(b => {
       try {
         const opp = S.players[b.opponentId];
         const isMafia = !!(opp && opp.role === "mafia");
         if (isMafia) {
           hadMafia = true;
           // Show note inside that mafia battle card
           if (b && b.id) setInlineNote(b.id, "С мафиози так нельзя. Только смыться.");
           return;
         }
         if (Game.Conflict && typeof Game.Conflict.escape === "function") {
           Game.Conflict.escape(b.id, "off");
         }
       } catch (_) {}
     });

     // If there were mafia battles, keep UI stable and do not claim global success.
     return;
   }

    // "Свалить от всех": cost is sum of per-battle costs (variable by opponent)
    let need = act.length;
    try {
      if (Game.Conflict && typeof Game.Conflict.escapeAllCost === "function") {
        need = Game.Conflict.escapeAllCost();
      }
    } catch (_) {}

    if ((S.me.points || 0) < need) {
      const msg = "Пойнтов не хватает.";
      if (UI && typeof UI.showStatToast === "function") {
        UI.showStatToast("points", msg);
      } else if (act[0] && act[0].id) {
        setInlineNote(act[0].id, msg);
      }
      return;
    }

    // Close ONLY active battles. Conflict.escape handles point transfer per battle.
    act.forEach(b => {
      if (Game.Conflict && typeof Game.Conflict.escape === "function") {
        Game.Conflict.escape(b.id, "smyt");
      }
    });
  }

 function isDrawBattle(b) {
   if (!b) return false;
   const c = b.crowd;
   if (!c || c.decided) return false;
   // Accept either endAt or endsAt as evidence that vote is ongoing.
   const end = _normEnds(c);
   if (b.status === "draw") return true;
   if (b.draw === true) return true;
   return !!(end > 0);
 }

 function isEscapeVote(b) {
   if (!b || !b.escapeVote || b.escapeVote.decided) return false;
   _normEnds(b.escapeVote);
   return true;
 }

  function sortedBattles() {
    const active = activeBattles();
    const resolved = resolvedBattles();

    // pinned active battles first
    const activePinned = active.filter(b => b.pinned);
    const activeUnpinned = active.filter(b => !b.pinned);

    // Pinned battles: newest pin first, then keep original order as tie-breaker.
    activePinned.sort((a, b) => {
      const ap = (typeof a.pinnedAt === "number") ? a.pinnedAt : 0;
      const bp = (typeof b.pinnedAt === "number") ? b.pinnedAt : 0;
      if (bp !== ap) return bp - ap;
      return S.battles.indexOf(a) - S.battles.indexOf(b);
    });
    // Ensure activeUnpinned keeps S.battles order; do NOT sort by time or any other criteria!
    activeUnpinned.sort((a, b) => S.battles.indexOf(a) - S.battles.indexOf(b));
    resolved.sort((a, b) => S.battles.indexOf(a) - S.battles.indexOf(b));

    return activePinned.concat(activeUnpinned).concat(resolved);
  }

UI.renderBattles = () => {
  const body = $("battlesBody");
  let countEl = $("battleCount");
  const countWrapper = $("battleCountWrapper");
  if (countWrapper && !countEl) {
    // Restore missing counter span if wrapper was overwritten.
    countWrapper.textContent = "(";
    countEl = document.createElement("span");
    countEl.id = "battleCount";
    countEl.textContent = "0";
    countWrapper.appendChild(countEl);
    countWrapper.appendChild(document.createTextNode(")"));
  }
  if (!body || !countEl) return;
  body.classList.remove("hidden");
  bindBattleArgClicks();

   const header = $("battlesHeader");
   let headerBtns = null;
   if (header) {
     header.__toggleBound = true;
     header.onpointerdown = null;
     header.onclick = (ev) => {
       const t = ev && ev.target;
       if (t && (t.tagName === "BUTTON" || (t.closest && t.closest("button")))) return;
       try {
         if (header && header.classList) header.classList.remove("panelHeader--hot");
         if (UI && typeof UI.resetCollapsedCounter === "function") UI.resetCollapsedCounter("battles");
       } catch (_) {}
     };
   }
    if (header) {
      let right = header.querySelector(".righty");
     if (!right) {
       right = document.createElement("div");
       right.className = "righty";
       header.appendChild(right);
     }
     if (!right.__controlsBuilt) {
       right.__controlsBuilt = true;
       right.textContent = "";
     }
     const ensureBtn = (id, glyph, title, onClick) => {
       let btn = document.getElementById(id);
       if (!btn) {
         btn = document.createElement("button");
         btn.id = id;
         btn.type = "button";
         btn.className = "panelCtrlBtn";
         btn.title = title;
         btn.textContent = glyph;
         btn.onclick = onClick;
         right.appendChild(btn);
       } else if (!right.contains(btn)) {
         right.appendChild(btn);
       }
       return btn;
     };

     const setSizeHeader = (next) => {
       try {
         if (UI && typeof UI.setPanelSize === "function") UI.setPanelSize("battles", next);
         else { S.flags = S.flags || {}; S.flags.battlesSize = next; }
       } catch (_) {}
       requestAll();
     };

     const btnMax = ensureBtn("battlesBtnMax", "□", "Развернуть", (ev) => { stop(ev); setSizeHeader("max"); });
     const btnMed = ensureBtn("battlesBtnMed", "⧉", "Стандартный размер", (ev) => { stop(ev); setSizeHeader("medium"); });
    headerBtns = { btnMed, btnMax };
    try {
      const collapsedCount = (UI && typeof UI.getCollapsedCounter === "function") ? UI.getCollapsedCounter("battles") : 0;
      const battlesCount = Array.isArray(S.battles) ? S.battles.length : 0;
      const displayCount = Math.max(collapsedCount, battlesCount);
      const battleTitle = header.querySelector(".battleTitleText");
      if (battleTitle) battleTitle.textContent = "Баттлы";
      if (countWrapper) countWrapper.style.display = displayCount ? "" : "none";
      countEl.textContent = String(displayCount);
      if (header) {
        if (displayCount > 0) header.classList.add("panelHeader--hot");
        UI.pulsePanelHeader && UI.pulsePanelHeader("battles", header, displayCount, 0);
      }
    } catch (_) {}
  }

   // Ensure default size on start
   S.flags = S.flags || {};
   if (!S.flags.battlesSize) S.flags.battlesSize = "medium";

   if (!UI._battlesInitExpanded) {
     UI._battlesInitExpanded = true;
     try {
       if (typeof UI.ensurePanelExpanded === "function") UI.ensurePanelExpanded("battles");
       else {
         S.flags = S.flags || {};
         if (S.flags.battlesSize === "collapsed") S.flags.battlesSize = "medium";
       }
     } catch (_) {}
   }

   // Panel size state (Step 10): source of truth is StateAPI via UI helpers if present
   const size = (UI && typeof UI.getPanelSize === "function")
     ? UI.getPanelSize("battles")
     : ((S.flags && S.flags.battlesSize) || "medium");
  if (headerBtns) {
    headerBtns.btnMed.classList.toggle("is-active", size === "medium");
    headerBtns.btnMax.classList.toggle("is-active", size === "max");
  }

    // Local invite UI state (kept stable across renders)
    UI._battleInvite = UI._battleInvite || { open:false, q:"", sel:0, lastPicked:null };

  const battlesCount = Array.isArray(S.battles) ? S.battles.length : 0;
  countEl.textContent = String(battlesCount);

   // We'll render invite controls even when there are no battles.
   // The empty-state hint will be shown AFTER invite UI.

    // Apply size classes to the battles container (Step 10)
    try {
      const parent = body.closest(".panel") || body.closest(".block") || null;
      if (parent && UI && typeof UI.applyPanelSizeClasses === "function") {
        UI.applyPanelSizeClasses(parent, "battles");
      }
    } catch (_) {}

    const _focusIdBefore = UI._battleFocus && UI._battleFocus.id ? UI._battleFocus.id : null;
    // Preserve visible anchor to avoid shifting cards when new ones are prepended.
    // If the user is viewing a specific card (focused) or any visible card, keep it fixed.
    let _anchor = null;
    try {
      const container = body;
      const rect = container.getBoundingClientRect();
      // Prefer focused card if exists
      const focusId = UI._battleFocus && UI._battleFocus.id ? String(UI._battleFocus.id) : null;
      let anchorEl = null;
      if (focusId) {
        try {
          anchorEl = container.querySelector(`[data-battle-id="${(window.CSS && typeof CSS.escape === 'function') ? CSS.escape(focusId) : focusId}"]`);
        } catch (_) { anchorEl = null; }
      }
      // Fallback: first visible child
      if (!anchorEl) {
        for (const ch of Array.from(container.children)) {
          try {
            const cr = ch.getBoundingClientRect();
            if (cr.bottom > rect.top + 2) { anchorEl = ch; break; }
          } catch(_) {}
        }
      }
      if (anchorEl) {
        const id = anchorEl.getAttribute && anchorEl.getAttribute("data-battle-id");
        if (id) _anchor = { id: String(id), offset: (anchorEl.offsetTop - container.scrollTop) };
      }
    } catch (_) { _anchor = null; }

    body.innerHTML = "";
    // Schedule a deferred restore so the anchor's visual position stays stable
    // after the synchronous DOM build completes.
    try {
      const _savedAnchor = _anchor;
      setTimeout(() => {
        try {
          if (!_savedAnchor || !_savedAnchor.id) return;
          const container = body;
          const aid = (window.CSS && typeof CSS.escape === "function") ? CSS.escape(_savedAnchor.id) : _savedAnchor.id;
          const newEl = container.querySelector(`[data-battle-id="${aid}"]`);
          if (newEl) {
            const newOffset = newEl.offsetTop;
            container.scrollTop = Math.max(0, newOffset - (_savedAnchor.offset || 0));
          }
        } catch (_) {}
      }, 0);
    } catch (_) {}

    // Invite to battle button → input with dropdown when clicked
    {
      const inviteRow = document.createElement("div");
      inviteRow.className = "actions";
      inviteRow.style.position = "relative";
      inviteRow.style.display = "flex";
      inviteRow.style.gap = "8px";
      inviteRow.style.alignItems = "center";

      if (!UI._battleInvite || !UI._battleInvite.open) {
        // Show button "Вызвать"
        const inviteBtn = document.createElement("button");
        inviteBtn.className = "btn";
        inviteBtn.textContent = "Вызвать";
        inviteBtn.onclick = (e) => {
          stop(e);
          UI._battleInvite = UI._battleInvite || {};
          UI._battleInvite.open = true;
          UI._battleInvite.sel = 0;
          UI._battleInvite.q = "";
          requestAll();
          setTimeout(() => {
            const el = document.getElementById("battleInviteInput");
            if (el) el.focus();
          }, 0);
        };
        inviteRow.appendChild(inviteBtn);
      } else {
        // Show input with clear × inside + "Баттл!" button + dropdown below
        const inputWrap = document.createElement("div");
        inputWrap.style.position = "relative";
        inputWrap.style.display = "flex";
        inputWrap.style.alignItems = "center";
        inputWrap.style.flex = "1";

        const input = document.createElement("input");
        input.type = "text";
        input.id = "battleInviteInput";
        input.className = "input";
        input.placeholder = "Ник. Как в чате.";
        input.value = String(UI._battleInvite.q || "");
        input.autocomplete = "off";
        // This input already has a dedicated clear button inside inputWrap.
        // Prevent global auto-clear wrapper from double-wrapping it.
        try { input.dataset.noAutoClear = "1"; } catch (_) {}
        try { input.__clearBtnAdded = true; } catch (_) {}
        input.style.paddingRight = "28px"; // Space for clear × button

        const clearBtn = document.createElement("button");
        clearBtn.textContent = "×";
        clearBtn.className = "btn small";
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
        clearBtn.style.display = (UI._battleInvite.q && UI._battleInvite.q.trim()) ? "" : "none";
        clearBtn.onclick = (e) => {
          stop(e);
          UI._battleInvite.q = "";
          input.value = "";
          clearBtn.style.display = "none";
          input.focus();
          requestAll();
        };

        inputWrap.appendChild(input);
        inputWrap.appendChild(clearBtn);
        inviteRow.appendChild(inputWrap);

        const battleBtn = document.createElement("button");
        battleBtn.className = "btn small";
        battleBtn.textContent = "Баттл!";
        battleBtn.onclick = (e) => {
          stop(e);
          // Start battle from input value
          const nameRaw = String(input.value || "").trim();
          if (!nameRaw) {
            if (UI && typeof UI.showActionToast === "function") UI.showActionToast(battleBtn, "Выбери игрока.");
            else if (UI && typeof UI.showStatToast === "function") UI.showStatToast("points", "Выбери игрока.");
            return;
          }

          const all = Object.values(S.players || {}).filter(p => {
            if (!p) return false;
            if (p.isMe) return false;
            if (p.role === "cop") return false;
            if (p.npc && (p.role === "toxic" || p.role === "bandit") && Game.__A && typeof Game.__A.isNpcJailed === "function") {
              try { if (Game.__A.isNpcJailed(p.id)) return false; } catch (_) {}
            }
            return true;
          });

          const target = all.find(p => p && String(p.name || "").toLowerCase() === nameRaw.toLowerCase());
          if (!target) {
            UI.showStatToast("points", "Такого нет.");
            return;
          }

          const cid = target.id;
          const cdMap = S.battleCooldowns || {};
          const last = cdMap[cid] || 0;
          const cdMs = 3 * 60 * 1000;
          if (last && (Date.now() - last) < cdMs) {
            UI.showStatToast("points", "Подожди немного.");
            return;
          }

          // Ensure battles panel is not collapsed
          try { if (UI && typeof UI.ensurePanelExpanded === "function") UI.ensurePanelExpanded("battles"); } catch (_) {}

          let res = null;
          try {
            if (Game.Conflict && typeof Game.Conflict.start === "function") {
              res = Game.Conflict.start(cid);
            } else if (Game.Conflict && typeof Game.Conflict.startWith === "function") {
              res = Game.Conflict.startWith(cid);
            }
          } catch (_) {}
          if (res && res.ok === false && (res.reason === "no_points" || res.reason === "insufficient")) {
            UI.showStatToast("points", "Пойнтов не хватает.");
            return;
          }

          // Close input and return to button
          UI._battleInvite.open = false;
          UI._battleInvite.q = "";
          UI._battleInvite.sel = 0;
          requestAll();
        };
        inviteRow.appendChild(battleBtn);
      }

      body.appendChild(inviteRow);

      // Create dropdown AFTER inviteRow is added to DOM (so input has correct position)
      if (UI._battleInvite && UI._battleInvite.open) {
        const input = document.getElementById("battleInviteInput");
        if (!input) return;

        // Dropdown list below input
        const isTargetablePlayer = (p) => {
          if (!p) return false;
          if (p.isMe) return false;
          if (p.role === "cop") return false;
          if (p.npc && (p.role === "toxic" || p.role === "bandit") && Game.__A && typeof Game.__A.isNpcJailed === "function") {
            try { if (Game.__A.isNpcJailed(p.id)) return false; } catch (_) {}
          }
          // Filter out players with active battle cooldown (3 minutes)
          const cdMap = S.battleCooldowns || {};
          const last = cdMap[p.id] || 0;
          const cdMs = 3 * 60 * 1000;
          if (last && (Date.now() - last) < cdMs) return false;
          return true;
        };

        const all = Object.values(S.players || {}).filter(isTargetablePlayer);
        const q = String(UI._battleInvite.q || "").trim().toLowerCase();
        const list = q ? all.filter(p => p && String(p.name || "").toLowerCase().includes(q)) : all.slice(0, 10);

        // Remove old dropdown if exists
        const oldListWrap = document.getElementById("battleInviteDropdown");
        if (oldListWrap) oldListWrap.remove();

        const listWrap = document.createElement("div");
        listWrap.id = "battleInviteDropdown";
        listWrap.className = "mention-list";
        listWrap.style.position = "fixed"; // Fixed positioning to escape parent overflow
        listWrap.style.zIndex = "9999"; // High z-index to appear above all battle cards
        listWrap.style.maxHeight = "200px";
        listWrap.style.overflowY = "auto";

        // Position dropdown below input using getBoundingClientRect
        const positionDropdown = () => {
          const rect = input.getBoundingClientRect();
          listWrap.style.left = `${rect.left}px`;
          listWrap.style.top = `${rect.bottom + 4}px`;
          listWrap.style.width = `${Math.max(rect.width, 200)}px`;
        };

        list.forEach((p, idx) => {
          const it = document.createElement("div");
          it.className = "mention-item";
          if (idx === (UI._battleInvite.sel || 0)) it.classList.add("active");
          it.textContent = (UI.displayName ? UI.displayName(p) : String(p.name || ""));
          it.onclick = (e) => {
            stop(e);
            UI._battleInvite.q = String(p.name || "");
            UI._battleInvite.sel = idx;
            input.value = UI._battleInvite.q;
            // Update clear button visibility
            const clearBtn = input.nextElementSibling;
            if (clearBtn) clearBtn.style.display = UI._battleInvite.q ? "" : "none";
            // Close dropdown after selection
            UI._battleInvite.open = false;
            listWrap.remove();
          };
          listWrap.appendChild(it);
        });

        // Append to body to render outside inviteRow container
        document.body.appendChild(listWrap);

        // Position dropdown after adding to DOM (delayed to get correct coordinates)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            positionDropdown();
          });
        });

        // Input event handlers
        input.oninput = () => {
          UI._battleInvite.q = String(input.value || "");
          UI._battleInvite.sel = 0;
          const clearBtn = input.nextElementSibling;
          if (clearBtn) clearBtn.style.display = UI._battleInvite.q.trim() ? "" : "none";
          requestAll();
        };

        input.onkeydown = (e) => {
          const k = e.key;
          if (k === "Escape") {
            stop(e);
            UI._battleInvite.open = false;
            requestAll();
            return;
          }
          if (k === "ArrowDown") {
            stop(e);
            UI._battleInvite.sel = Math.min((UI._battleInvite.sel || 0) + 1, list.length - 1);
            requestAll();
            return;
          }
          if (k === "ArrowUp") {
            stop(e);
            UI._battleInvite.sel = Math.max(0, (UI._battleInvite.sel || 0) - 1);
            requestAll();
            return;
          }
          if (k === "Enter") {
            stop(e);
            // Snap to selection if no exact match
            if (!UI._battleInvite.q.trim() && list[UI._battleInvite.sel || 0]) {
              UI._battleInvite.q = list[UI._battleInvite.sel || 0].name;
              input.value = UI._battleInvite.q;
            }
            // Trigger "Баттл!" button click
            battleBtn.click();
            return;
          }
        };

        // Reposition dropdown on focus (in case of scroll/resize)
        input.onfocus = () => {
          setTimeout(() => positionDropdown(), 0);
        };

        // Click in input to show dropdown if closed
        input.onclick = (e) => {
          stop(e);
          const dropdown = document.getElementById("battleInviteDropdown");
          if (!UI._battleInvite.open) {
            UI._battleInvite.open = true;
            requestAll();
          } else if (dropdown && dropdown.style.display === "none") {
            // Dropdown exists but hidden, just show and reposition
            dropdown.style.display = "";
            requestAnimationFrame(() => positionDropdown());
          }
        };

        // Click outside to hide dropdown (delayed to avoid immediate trigger)
        // Prevent leaking multiple document listeners across re-renders.
        try {
          if (UI._battleInvite && UI._battleInvite._clickOutsideHandler) {
            document.removeEventListener("click", UI._battleInvite._clickOutsideHandler, true);
          }
          if (UI._battleInvite && UI._battleInvite._clickOutsideTimer) {
            clearTimeout(UI._battleInvite._clickOutsideTimer);
            UI._battleInvite._clickOutsideTimer = null;
          }
        } catch (_) {}

        const handleClickOutside = (e) => {
          // If state/input/dropdown is gone, clean up this listener.
          if (!UI._battleInvite || !UI._battleInvite.open) {
            try { document.removeEventListener("click", handleClickOutside, true); } catch (_) {}
            try { if (UI._battleInvite) UI._battleInvite._clickOutsideHandler = null; } catch (_) {}
            return;
          }
          const dropdown = document.getElementById("battleInviteDropdown");
          if (!dropdown || !input || input.isConnected !== true) {
            UI._battleInvite.open = false;
            try { if (dropdown && dropdown.parentNode) dropdown.remove(); } catch (_) {}
            try { document.removeEventListener("click", handleClickOutside, true); } catch (_) {}
            try { UI._battleInvite._clickOutsideHandler = null; } catch (_) {}
            return;
          }
          // Check if click is outside both input and dropdown
          if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            UI._battleInvite.open = false;
            if (dropdown.parentNode) dropdown.remove();
            document.removeEventListener("click", handleClickOutside, true);
            try { UI._battleInvite._clickOutsideHandler = null; } catch (_) {}
          }
        };

        // Delay listener to avoid triggering on the same click that opened dropdown
        try { UI._battleInvite._clickOutsideHandler = handleClickOutside; } catch (_) {}
        try {
          UI._battleInvite._clickOutsideTimer = setTimeout(() => {
            document.addEventListener("click", handleClickOutside, true);
          }, 200);
        } catch (_) {}
      }
      // header toggle is bound near header creation (always on)
    }


   // Empty state (after invite controls)
   if (!Array.isArray(S.battles) || S.battles.length === 0) {
     const hint = document.createElement("div");
     hint.className = "hint";
     hint.textContent = "Никто не вызывает. Тишина.";
     body.appendChild(hint);
     try { if (UI && typeof UI.updateRightScroll === "function") UI.updateRightScroll(); } catch (_) {}
     return;
   }

   // Cards
    sortedBattles().forEach(b => {
      const opp = S.players[b.opponentId];
      const oppName = opp ? (UI.displayName ? UI.displayName(opp) : opp.name) : "Кто-то";

      const card = document.createElement("div");
      card.className = "battleCard";
      card.setAttribute("data-battle-id", String(b.id));

      // Click card background to pin (chips/buttons stopPropagation)
      card.onclick = (e) => {
        stop(e);
        if (UI._battleClickLock) return;
        UI._battleClickLock = true;
        setTimeout(() => { UI._battleClickLock = false; }, 0);

        _captureBattleFocus(b.id, card);
        UI.pinBattleToTop(b.id);
      };

      const top = document.createElement("div");
      top.className = "battleTop";
      top.innerHTML = `
        <div class="kpill"><strong>${escapeHtml(oppName)}</strong> <span class="badge">[${escapeHtml(String(oppInfluence(opp)))}]</span></div>
      `;
      card.appendChild(top);

      const line = document.createElement("div");
      line.className = "noteLine";

      if (b.resolved !== true) {
       if (b.status === "pickDefense") line.textContent = "Бери контраргумент";
       else if (b.status === "pickAttack") line.textContent = "Бери аргумент";
       else if (isEscapeVote(b)) {
         const mode = (b.escapeVote && b.escapeVote.mode) ? b.escapeVote.mode : "smyt";
         line.textContent = (mode === "off") ? "Отвалить?" : "Свалить?";
       }
       else if (isDrawBattle(b)) line.textContent = t("battle_draw");
       else line.textContent = "Бери аргумент";
      } else {
        line.textContent = _normalizeResultText(b);
      }
      card.appendChild(line);

      // ESCAPE VOTE (crowd vote) - render even if resolved is true
      if (isEscapeVote(b)) {
          const v = b.escapeVote || {};
          const isOff = v.mode === "off";
          const voteLabelA = isOff ? "Отвалить" : "Свалить";
          const voteLabelB = isOff ? "Останься" : "Остаться";
          const escapeWrap = document.createElement("div");
          escapeWrap.className = "eventCard";

          const ttl = document.createElement("div");
          ttl.className = "battleTop";
          ttl.innerHTML = `<div class="kpill"><strong>${voteLabelA} — толпа решает</strong></div>`;
          escapeWrap.appendChild(ttl);

          const info = document.createElement("div");
          info.className = "noteLine";
          info.id = `escapeInfo_${b.id}`;
          escapeWrap.appendChild(info);

          const diagLine = document.createElement("div");
          diagLine.className = "noteLine crowdDiag";
          diagLine.style.display = "none";
          diagLine.style.fontSize = "11px";
          diagLine.style.opacity = "0.7";
          escapeWrap.appendChild(diagLine);

          const voteHint = document.createElement("div");
          voteHint.className = "pill";
          voteHint.textContent = "Голосование идёт. Ты только смотришь.";
          escapeWrap.appendChild(voteHint);

          // NOTE: battles panel is fully re-rendered via `body.innerHTML = ""`.
          // Any previously captured DOM nodes become detached. We keep a mutable
          // reference and re-acquire the current row from DOM on each tick.
          let voteRowEl = document.createElement("div");
          voteRowEl.className = "eventVoteRow";
          escapeWrap.appendChild(voteRowEl);

          const mkVoteBtn = (label, votes) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "eventVoteBtn is-disabled";
            btn.disabled = true;
            btn.setAttribute("aria-disabled", "true");
            btn.textContent = `${label} - ${votes}`;
            return btn;
          };

          const update = (bb) => {
            // IMPORTANT: votes may be mutated on Game.__S battles (core/api),
            // while UI.S.battles can lag until a full render is triggered (e.g. chat).
            // During the ticker we read authoritative values from Game.__S by id.
            let freshBattle = null;
            try {
              if (Game && Game.__S && Array.isArray(Game.__S.battles)) {
                freshBattle = Game.__S.battles.find(x => x && x.id === bb.id) || null;
              }
            } catch (_) {}
            const freshVote = (freshBattle && freshBattle.escapeVote) ? freshBattle.escapeVote : null;

            const c = freshVote || bb.escapeVote || {};
            // Re-acquire current vote row if the panel was re-rendered.
            try {
              const bid0 = String(bb.id || "");
              const bidSel = (window && window.CSS && typeof window.CSS.escape === "function")
                ? window.CSS.escape(bid0)
                : bid0;
              if (!voteRowEl || voteRowEl.isConnected !== true) {
                const bodyEl = $("battlesBody") || document.getElementById("battlesBody") || null;
                const cardEl = bodyEl
                  ? bodyEl.querySelector(`[data-battle-id="${bidSel}"]`)
                  : document.querySelector(`[data-battle-id="${bidSel}"]`);
                const row = cardEl ? cardEl.querySelector(".eventVoteRow") : null;
                if (row) voteRowEl = row;
              }
            } catch (_) {}

            const infoEl = document.getElementById(`escapeInfo_${bb.id}`);
            if (infoEl) {
              const cap = Number.isFinite(c.cap) ? (c.cap | 0) : 0;
              const raw = getRawCountsFromVoters(c);
              infoEl.textContent = cap > 0 ? `Голоса: ${raw.total}/${cap}` : `Голоса: ${raw.total}`;
              updateCrowdEligibleLine(diagLine, c);
            }

            try {
              if (timerLine) {
                const timerState = getUiCrowdTimerState(c);
                const showTimer = timerState.countdownActive && Number.isFinite(timerState.countdownStartMs);
                timerLine.style.display = "block";
                timerLine.textContent = showTimer ? `Таймер: ${timerState.seconds}с` : "Голосование идёт";
              }
            } catch (_) {}

            try {
            // Best-effort: keep local battle in sync so other UI code reads fresh numbers.
            try {
              bb.escapeVote = bb.escapeVote || {};
              bb.escapeVote.votesA = (c.votesA | 0);
              bb.escapeVote.votesB = (c.votesB | 0);
              bb.escapeVote.decided = !!c.decided;
            } catch (_) {}

            const raw = getRawCountsFromVoters(c);
            if (voteRowEl && voteRowEl.childElementCount === 0) {
                voteRowEl.appendChild(mkVoteBtn(voteLabelA, raw.a || 0));
                voteRowEl.appendChild(mkVoteBtn(voteLabelB, raw.b || 0));
              } else if (voteRowEl && voteRowEl.childElementCount === 2) {
                voteRowEl.children[0].textContent = `${voteLabelA} - ${raw.a || 0}`;
                voteRowEl.children[1].textContent = `${voteLabelB} - ${raw.b || 0}`;
              }
            } catch (_) {}

            // Optional debug (opt-in): window.__logBattleCounters = true
            try {
              if (window && window.__logBattleCounters) {
                const raw0 = getRawCountsFromVoters(c);
                const a0 = raw0.a | 0;
                const b0 = raw0.b | 0;
                if (bb._lastEscapeVotesA !== a0 || bb._lastEscapeVotesB !== b0) {
                  bb._lastEscapeVotesA = a0;
                  bb._lastEscapeVotesB = b0;
                  console.log("[escapeCounters]", bb.id, "votesA=", a0, "votesB=", b0);
                }
              }
            } catch (_) {}

            // Force a re-render when vote finishes, even if API suppresses renders (e.g. uiOnly).
            try {
              if (c.decided && !bb._uiEscapeFinalRenderQueued) {
                bb._uiEscapeFinalRenderQueued = true;
                requestAll();
              }
            } catch (_) {}
          };

          UI._ensureEscapeTicker(
            b.id,
            () => S.battles.find(x => x.id === b.id),
            (bb) => update(bb)
          );
          update(b);

          if (v.decided && !escapeWrap._resultShown) {
            const resLine = document.createElement("div");
            resLine.className = "noteLine";
            resLine.textContent = b.resultLine || "Всё, финал.";
            escapeWrap.appendChild(resLine);
            escapeWrap._resultShown = true;

            const closeRow = document.createElement("div");
            closeRow.className = "actions";

            const closeBtn = document.createElement("button");
            closeBtn.className = "btn small";
            closeBtn.textContent = "Закрыть";
            closeBtn.onclick = (e) => {
              stop(e);
              _captureBattleFocus(b.id, card);
              UI._clearEscapeTicker(b.id);
              S.battles = S.battles.filter(x => x.id !== b.id);
              requestAll();
            };
            closeRow.appendChild(closeBtn);
            escapeWrap.appendChild(closeRow);
          }

          card.appendChild(escapeWrap);
          body.appendChild(card);
          return;
        }

      // DRAW (crowd vote) - render even if resolved is true
      if (isDrawBattle(b)) {
          const isMyDraw = (b.fromThem === true || b.fromThem === false);
          const crowd = b.crowd || {};
          if (!b.crowd) b.crowd = { votesA: 0, votesB: 0, decided: false };
          b.crowd.uiOnly = true;

          if (!b._crowdLoopStarted && !b.crowd.decided && Game.Conflict && typeof Game.Conflict.startCrowdVote === "function") {
            b._crowdLoopStarted = true;
            try { Game.Conflict.startCrowdVote(b.id); } catch (_) {}
          }

          // While draw vote is running, still show the resolved pair: attack (revealed color) then defense.
          // Incoming attacks may keep true color in attack._color until resolution, so reveal from _color as needed.
          const drawRevealColor = b.revealColor || (b.attack && (b.attack.color || b.attack._color)) || (b.defense && b.defense.color) || null;
          if (b.attack && !b.attack.color && drawRevealColor) b.attack.color = drawRevealColor;

          const showArgs = !!(b.attack || b.defense);
          if (showArgs) {
            if (b.attack) {
              const aRow = document.createElement("div");
             aRow.className = "choiceRow";
             const a = document.createElement("div");
             a.className = clsForColor(b.attack.color);
             a.textContent = b.attack.text;
             if (!b.attack.color) {
               a.className = clsForColor(null, true);
               a.style.color = "rgba(255,255,255,.92)";
             } else if (b.attack.color === "k") {
               a.style.color = "#ddd";
             } else {
               a.style.color = "black";
             }
             aRow.appendChild(a);
             card.appendChild(aRow);
           }

           if (b.defense) {
             const dRow = document.createElement("div");
             dRow.className = "choiceRow";
             const d = document.createElement("div");
             d.className = clsForColor(b.defense.color);
             d.textContent = b.defense.text;
             if (!b.defense.color) {
               d.className = clsForColor(null, true);
               d.style.color = "rgba(255,255,255,.92)";
             } else if (b.defense.color === "k") {
               d.style.color = "#ddd";
             } else {
               d.style.color = "black";
             }
             dRow.appendChild(d);
             card.appendChild(dRow);
           }
          }

           const drawWrap = document.createElement("div");
           drawWrap.className = "eventCard";

          const ttl = document.createElement("div");
          ttl.className = "battleTop";
          ttl.innerHTML = `<div class="kpill"><strong>Толпа решает</strong></div>`;
          drawWrap.appendChild(ttl);

          const info = document.createElement("div");
          info.className = "noteLine";
          info.id = `drawInfo_${b.id}`;
          drawWrap.appendChild(info);

          const diagLine = document.createElement("div");
          diagLine.className = "noteLine crowdDiag";
          diagLine.style.display = "none";
          diagLine.style.fontSize = "11px";
          diagLine.style.opacity = "0.7";
          drawWrap.appendChild(diagLine);


          const voteHint = document.createElement("div");
          voteHint.className = "pill";
          voteHint.textContent = isMyDraw ? "Голосование идёт. Ты только смотришь." : "Голосование идёт.";
          drawWrap.appendChild(voteHint);

          const timerLine = document.createElement("div");
          timerLine.className = "noteLine crowdTimer";
          timerLine.textContent = "Голосование идёт";
          drawWrap.appendChild(timerLine);

          // NOTE: battles panel is fully re-rendered via `body.innerHTML = ""`.
          // Any previously captured DOM nodes become detached. We keep a mutable
          // reference and re-acquire the current row from DOM on each tick.
          let voteRowEl = document.createElement("div");
          voteRowEl.className = "eventVoteRow";
          drawWrap.appendChild(voteRowEl);

          const me = S.me || {};
          const attackerId = b.fromThem ? b.opponentId : "me";
          const defenderId = b.fromThem ? "me" : b.opponentId;

           const nameWithInf = (id) => {
             if (!id || id === "me") {
               const n = (UI.displayName ? UI.displayName(me) : me.name) || "Ты";
               const inf = Number.isFinite(me.influence) ? me.influence : 0;
               return `${n} [${inf}]`;
             }
             const p = S.players ? S.players[id] : null;
             const n = (p && (UI.displayName ? UI.displayName(p) : p.name)) ? (UI.displayName ? UI.displayName(p) : p.name) : "Игрок";
             const inf = (p && Number.isFinite(p.influence)) ? p.influence : 0;
             return `${n} [${inf}]`;
           };

          const mkVoteBtn = (label, votes) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "eventVoteBtn is-disabled";
            btn.disabled = true;
            btn.setAttribute("aria-disabled", "true");
            btn.textContent = `${label} - ${votes}`;
            return btn;
          };

          const update = (bb) => {
            // IMPORTANT: votes may be mutated on Game.__S battles (core/api),
            // while UI.S.battles can lag until a full render is triggered (e.g. chat).
            // During the ticker we read authoritative values from Game.__S by id.
            let freshBattle = null;
            try {
              if (Game && Game.__S && Array.isArray(Game.__S.battles)) {
                freshBattle = Game.__S.battles.find(x => x && x.id === bb.id) || null;
              }
            } catch (_) {}
            const freshCrowd = (freshBattle && freshBattle.crowd) ? freshBattle.crowd : null;

            const c = freshCrowd || bb.crowd || {};
            // Re-acquire current vote row if the panel was re-rendered.
            try {
              const bid0 = String(bb.id || "");
              const bidSel = (window && window.CSS && typeof window.CSS.escape === "function")
                ? window.CSS.escape(bid0)
                : bid0;
              if (!voteRowEl || voteRowEl.isConnected !== true) {
                const bodyEl = $("battlesBody") || document.getElementById("battlesBody") || null;
                const cardEl = bodyEl
                  ? bodyEl.querySelector(`[data-battle-id="${bidSel}"]`)
                  : document.querySelector(`[data-battle-id="${bidSel}"]`);
                const row = cardEl ? cardEl.querySelector(".eventVoteRow") : null;
                if (row) voteRowEl = row;
              }
            } catch (_) {}

            const infoEl = document.getElementById(`drawInfo_${bb.id}`);
            if (infoEl) {
              const cap = Number.isFinite(c.cap) ? (c.cap | 0) : 0;
              const raw = getRawCountsFromVoters(c);
              infoEl.textContent = cap > 0 ? `Голоса: ${raw.total}/${cap}` : `Голоса: ${raw.total}`;
              updateCrowdEligibleLine(diagLine, c);
            }

            try {
              const vRow = voteRowEl;
              // Best-effort: keep local battle in sync so other UI code reads fresh numbers.
              try {
                bb.crowd = bb.crowd || {};
                bb.crowd.votesA = (c.votesA | 0);
                bb.crowd.votesB = (c.votesB | 0);
                bb.crowd.decided = !!c.decided;
              } catch (_) {}

              if (vRow && vRow.childElementCount === 0) {
                const aLabel = nameWithInf(attackerId);
                const bLabel = nameWithInf(defenderId);
                const raw = getRawCountsFromVoters(c);
                vRow.appendChild(mkVoteBtn(aLabel, raw.a || 0));
                vRow.appendChild(mkVoteBtn(bLabel, raw.b || 0));
              } else if (vRow && vRow.childElementCount === 2) {
                const raw = getRawCountsFromVoters(c);
                vRow.children[0].textContent = `${nameWithInf(attackerId)} - ${raw.a || 0}`;
                vRow.children[1].textContent = `${nameWithInf(defenderId)} - ${raw.b || 0}`;
              }
            } catch (_) {}

            // Optional debug (opt-in): window.__logBattleCounters = true
            try {
              if (window && window.__logBattleCounters) {
                const raw0 = getRawCountsFromVoters(c);
                const a0 = raw0.a | 0;
                const b0 = raw0.b | 0;
                if (bb._lastCrowdVotesA !== a0 || bb._lastCrowdVotesB !== b0) {
                  bb._lastCrowdVotesA = a0;
                  bb._lastCrowdVotesB = b0;
                  console.log("[drawCounters]", bb.id, "votesA=", a0, "votesB=", b0);
                }
              }
            } catch (_) {}

            // Schedule a coalesced render when decided
            try {
              if (c.decided && !bb._uiDrawFinalRenderQueued) {
                bb._uiDrawFinalRenderQueued = true;
                UI._scheduleDrawRequestAll();
              }
            } catch (_) {}
          };

          UI._ensureDrawTicker(
            b.id,
            () => S.battles.find(x => x.id === b.id),
            (bb) => update(bb)
          );
          update(b);

          if ((b.drawResolved === true || b.crowd.decided) && !drawWrap._resultShown) {
            const resLine = document.createElement("div");
            resLine.className = "noteLine";
            resLine.textContent = b.drawResultLine || b.resultLine || "Всё, финал.";
            drawWrap.appendChild(resLine);
            drawWrap._resultShown = true;

            const closeRow = document.createElement("div");
            closeRow.className = "actions";

            const closeBtn = document.createElement("button");
            closeBtn.className = "btn small";
            closeBtn.textContent = "Закрыть";
            closeBtn.onclick = (e) => {
              stop(e);
              _captureBattleFocus(b.id, card);
              UI._clearDrawTicker(b.id);
              // Draws should NOT auto-disappear; close removes the battle card only when user clicks.
              S.battles = S.battles.filter(x => x.id !== b.id);
              requestAll();
            };
            closeRow.appendChild(closeBtn);
            drawWrap.appendChild(closeRow);
          }

          card.appendChild(drawWrap);
          body.appendChild(card);
          return;
        }

      // UNRESOLVED
      if (b.resolved !== true) {
        const D0 = Game.Data || {};
        const boostCost = Number.isFinite(D0.COST_BATTLE_BOOST) ? (D0.COST_BATTLE_BOOST | 0) : 2;
        const rerollCost = Number.isFinite(D0.COST_REROLL_ARGUMENTS) ? (D0.COST_REROLL_ARGUMENTS | 0) : 3;
        const hintCost = Number.isFinite(D0.COST_HINT_WEAKNESS) ? (D0.COST_HINT_WEAKNESS | 0) : 2;
        const canFreeOff = (S && S.me && Number.isFinite(S.me.influence) ? S.me.influence : (S && S.me ? (S.me.influence || 0) : 0)) >= 5;

        const tactRow = document.createElement("div");
        tactRow.className = "actions";

      // Removed 3 "Недоступно" buttons (boost/reroll/hint) - they are not displayed anymore

        if (tactRow.childElementCount > 0) card.appendChild(tactRow);

        // Show incoming hidden attack (no color yet) for pickDefense
        if (b.status === "pickDefense" && b.attack) {
          const incoming = document.createElement("div");
          incoming.className = "choiceRow";

          const chip = document.createElement("div");
          chip.className = clsForColor(null, true);
          chip.textContent = `Вброс: ${String(b.attack.text || "")}`;
          chip.style.color = "rgba(255,255,255,.92)";
          // show toast above incoming (grey) attack when clicked
          chip.onclick = (e) => {
            stop(e);
          const typeRaw = (b.attack && (b.attack.type || b.attack.group || b.attack.kind || b.attack.pool)) ? String(b.attack.type || b.attack.group || b.attack.kind || b.attack.pool).toLowerCase() : "";
          const norm = (typeRaw === "yesno") ? "yn" : typeRaw;
          const hints = {
            who: "Ответь кто.",
            where: "Ответь где.",
            about: "Ответь про кого.",
            yn: "Ответь да или нет."
          };
          const msg = hints[norm] || "Ответь ...";
          showChipToastAbove(chip, msg);
          };
          incoming.appendChild(chip);
          card.appendChild(incoming);
        }

       // Attack choices (ALWAYS 3) - built once per battle/status, then reused
        if (b.status === "pickAttack") {
          const row = document.createElement("div");
          row.className = "choiceRow";

          const pickAttackFn = (Game.Conflict && typeof Game.Conflict.pickAttack === "function")
            ? Game.Conflict.pickAttack
            : (Game.Conflict && typeof Game.Conflict.chooseAttack === "function")
              ? Game.Conflict.chooseAttack
              : (Game.Conflict && typeof Game.Conflict.selectAttack === "function")
                ? Game.Conflict.selectAttack
                : null;

          const buildAttackChoices = () => {
            const listRaw = (Game.Conflict && Game.Conflict.myAttackOptions)
              ? Game.Conflict.myAttackOptions(b)
              : [];

            const seenA = new Set();
            const listUniq = [];
            (listRaw || []).forEach(x => {
              if (!x || !x.id) return;
              if (seenA.has(x.id)) return;
              seenA.add(x.id);
              listUniq.push(x);
            });

            const pool = listUniq.slice();
            shuffleInPlace(pool);

            const list = [];
            const usedTypes = new Set();
            const usedTexts = new Set();
            const usedIds = new Set();

            const normType = (it) => {
              const raw = (it && (it.group || it.type || it.qtype || it.kind)) ? String(it.group || it.type || it.qtype || it.kind) : "";
              const s = raw.trim().toLowerCase();
              if (!s) return "";
              if (s === "yesno" || s === "yes-no" || s === "yes_no" || s === "да/нет" || s === "да-нет") return "yn";
              return s;
            };

            for (const it of pool) {
              if (!it || list.length >= 3) break;
              const id = it.id;
              if (!id || usedIds.has(id)) continue;
              const t0 = normType(it);
              if (!t0) continue;
              if (usedTypes.has(t0)) continue;
              const txt = String(it.text || "");
              if (txt && usedTexts.has(txt)) continue;
              list.push(it);
              usedIds.add(id);
              usedTypes.add(t0);
              if (txt) usedTexts.add(txt);
            }

            if (list.length < 3) {
              for (const it of pool) {
                if (!it || list.length >= 3) break;
                const id = it.id;
                if (!id || usedIds.has(id)) continue;
                const txt = String(it.text || "");
                if (txt && usedTexts.has(txt)) continue;
                list.push(it);
                usedIds.add(id);
                const t0 = normType(it);
                if (t0) usedTypes.add(t0);
                if (txt) usedTexts.add(txt);
              }
            }

            shuffleInPlace(list);

            while (list.length < 3) {
              list.push({ id: `__pad_attack_${list.length}`, text: "...", _pad: true });
            }
            return list;
          };

          const list = _getOrBuildChoices(b, "_attackChoices", buildAttackChoices);

          (list || []).forEach(p => {
            const chip = document.createElement("div");
            // Outgoing attack choices should be color-visible.
            chip.className = clsForColor(p && p.color ? p.color : null, false);
            chip.textContent = String(p && p.text ? p.text : "");

            // UI type hints (Canon hover)
            try {
              if (p && !p._pad && Game.Data && typeof Game.Data.t === "function") {
                const typeRaw = (p.group || p.type || p.pool || "").toString().toLowerCase();
                const type = (typeRaw === "yesno") ? "yn" : typeRaw;
                if (type === "who") chip.title = Game.Data.t("hint_type_who");
                else if (type === "where") chip.title = Game.Data.t("hint_type_where");
                else if (type === "about") chip.title = Game.Data.t("hint_type_about");
                else if (type === "yn") chip.title = Game.Data.t("hint_type_yn");
              }
            } catch (_) {}

            // Text color rules: black on colored chips, light on black chips, light on unknown.
            if (p && p.color === "k") chip.style.color = "#ddd";
            else if (p && p.color) chip.style.color = "black";
            else chip.style.color = "rgba(255,255,255,.92)";

          if (p && p._pad) {
            chip.style.opacity = "0.55";
            chip.style.cursor = "default";
            chip.onclick = (e) => {
              stop(e);
              const typeRaw = (p.group || p.type || p.pool || "").toString().toLowerCase();
              const norm = (typeRaw === "yesno") ? "yn" : typeRaw;
              const hints = {
                who: "Ответь кто.",
                where: "Ответь где.",
                about: "Ответь про кого.",
                yn: "Ответь да или нет."
              };
              const msg = hints[norm] || "Ответь ...";
              showChipToastAbove(chip, msg);
            };
              row.appendChild(chip);
              return;
            }

            if (pickAttackFn) {
              chip.onclick = (e) => {
                stop(e);
                _captureBattleFocus(b.id, card);
                pickAttackFn.call(Game.Conflict, b.id, p.id);
                // Clear cached choices after pick to keep result stable
                try { delete b._attackChoices; } catch (_) {}
                try {
                  if (UI._battleChoiceCache && UI._battleChoiceCache.attack) {
                    delete UI._battleChoiceCache.attack[String(b.id)];
                  }
                } catch (_) {}
              };
            }
           if (p && p.id != null) {
             chip.dataset.action = "pickAttack";
             chip.dataset.argId = String(p.id);
             chip.dataset.battleId = String(b.id);
           }

            row.appendChild(chip);
          });

          card.appendChild(row);

          // "Уйти за 1💰" button
          const leaveActions = document.createElement("div");
          leaveActions.className = "actions";

          const leaveBtn = document.createElement("button");
          leaveBtn.className = "btn small";
          leaveBtn.textContent = "Уйти за 1💰";
          leaveBtn.title = "−1⭐, при успехе +1⭐";
          leaveBtn.onclick = (e) => {
            stop(e);
            _captureBattleFocus(b.id, card);
            // Leave battle: applies -1 ⭐ REP (core), then resolves via escape pipeline
            tryEscapeBattle(b.id, "smyt", leaveBtn, 1);
          };
          leaveActions.appendChild(leaveBtn);
          card.appendChild(leaveActions);
        }

        // Defense choices (LIMIT to 3) - built once per battle/status, then reused
        if (b.status === "pickDefense") {
          const row = document.createElement("div");
          row.className = "choiceRow";

          const attackArg = b.attack || null;
          const wantType = attackArg ? (attackArg.qtype || attackArg.type || attackArg.kind || null) : null;

          const buildDefenseChoices = () => {
            let choices = [];

            // Preferred API (new split conflict)
            if (Game.Conflict && typeof Game.Conflict.getDefenseChoicesForBattle === "function") {
              choices = Game.Conflict.getDefenseChoicesForBattle(b.id, 3) || [];
            }

            // Alternative split module namespace
            if ((!choices || choices.length === 0) && Game._ConflictArguments && typeof Game._ConflictArguments.myDefenseOptions === "function") {
              try {
                choices = Game._ConflictArguments.myDefenseOptions(b) || [];
              } catch (_) {
                choices = Game._ConflictArguments.myDefenseOptions() || [];
              }
            }

            // Fallback: use myDefenseOptions() and filter by incoming attack type
            if ((!choices || choices.length === 0) && Game.Conflict && typeof Game.Conflict.myDefenseOptions === "function") {
              let all = [];
              try {
                if (Game.Conflict.myDefenseOptions.length >= 1) all = Game.Conflict.myDefenseOptions(b) || [];
                else all = Game.Conflict.myDefenseOptions() || [];
              } catch (_) {
                all = Game.Conflict.myDefenseOptions() || [];
              }

              let filtered = all;
              if (wantType) {
                filtered = all.filter(x => (x.qtype || x.type || x.kind) === wantType);
              }

              choices = (filtered && filtered.length > 0) ? filtered : all;
            }

            // Dedup and pad to exactly 3
            const seen = new Set();
            const uniq = [];
            const pushUniq = (arr) => {
              (arr || []).forEach(x => {
                if (!x || !x.id) return;
                if (seen.has(x.id)) return;
                seen.add(x.id);
                uniq.push(x);
              });
            };

            pushUniq(choices);

            if (uniq.length < 3) {
              let all = [];
              try {
                if (Game.Conflict && typeof Game.Conflict.myDefenseOptions === "function") {
                  if (Game.Conflict.myDefenseOptions.length >= 1) all = Game.Conflict.myDefenseOptions(b) || [];
                  else all = Game.Conflict.myDefenseOptions() || [];
                }
              } catch (_) {
                all = [];
              }

              if (wantType) {
                pushUniq(all.filter(x => (x.qtype || x.type || x.kind) === wantType));
              }
              pushUniq(all);
            }

            let finalChoices = uniq.slice(0, 3);
            shuffleInPlace(finalChoices);

            while (finalChoices.length < 3) {
              finalChoices.push({ id: `__pad_${finalChoices.length}`, color: null, text: "...", _pad: true });
            }

            return finalChoices;
          };

          const choices = _getOrBuildChoices(b, "_defenseChoices", buildDefenseChoices);

          const pickDefenseFn = (Game.Conflict && typeof Game.Conflict.pickDefense === "function")
            ? Game.Conflict.pickDefense
            : (Game.Conflict && typeof Game.Conflict.chooseDefense === "function")
              ? Game.Conflict.chooseDefense
              : (Game.Conflict && typeof Game.Conflict.selectDefense === "function")
                ? Game.Conflict.selectDefense
                : null;

          (choices || []).forEach(p => {
            const chip = document.createElement("div");

            if (p && p._pad) {
              chip.className = clsForColor(null, true);
              chip.textContent = p.text;
              chip.style.opacity = "0.55";
              chip.style.cursor = "default";
              chip.style.color = "rgba(255,255,255,.92)";
              chip.onclick = (e) => {
                stop(e);
                const typeRaw = (p.group || p.type || p.pool || "").toString().toLowerCase();
                const norm = (typeRaw === "yesno") ? "yn" : typeRaw;
                const hints = {
                  who: "Ответь кто.",
                  where: "Ответь где.",
                  about: "Ответь про кого.",
                  yn: "Ответь да или нет."
                };
                const msg = hints[norm] || "Ответь ...";
                showChipToastAbove(chip, msg);
              };
              row.appendChild(chip);
              return;
            }

            chip.className = clsForColor(p.color);
            chip.textContent = p.text;

            // Counter-arguments: hover hints disabled
            try { chip.removeAttribute("title"); } catch (_) {}

            if (pickDefenseFn) {
              chip.onclick = (e) => {
                stop(e);
                _captureBattleFocus(b.id, card);
                pickDefenseFn.call(Game.Conflict, b.id, p.id);
                // Clear cached choices after pick to keep result stable
                try { delete b._defenseChoices; } catch (_) {}
                try {
                  if (UI._battleChoiceCache && UI._battleChoiceCache.defense) {
                    delete UI._battleChoiceCache.defense[String(b.id)];
                  }
                } catch (_) {}
              };
            }
           if (p && p.id != null) {
             chip.dataset.action = "pickDefense";
             chip.dataset.argId = String(p.id);
             chip.dataset.battleId = String(b.id);
           }

            // Text color for defense chips:
            if (p.color === "k") {
              chip.style.color = "#ddd";
            } else {
              chip.style.color = "black";
            }

            row.appendChild(chip);
          });

          card.appendChild(row);
        }

       // Per-battle actions (only while picking defense)
       if (b.status === "pickDefense") {
          const actions = document.createElement("div");
          actions.className = "actions";

          const isMafiaBattle = !!(opp && opp.role === "mafia");

          const sm = document.createElement("button");
          sm.className = "btn small";

          let oneCost = 1;
          try {
            if (Game.Conflict && typeof Game.Conflict.escapeCost === "function") {
              oneCost = Game.Conflict.escapeCost(b.id);
            } else if (Game.Data && typeof Game.Data.escapeCostByRole === "function") {
              const r = (opp && opp.role) ? String(opp.role).toLowerCase() : "";
              oneCost = Game.Data.escapeCostByRole(r, b);
            }
          } catch (_) {}

         sm.textContent = t("escape_button_label", { X: oneCost });
          sm.title = "−1⭐, при успехе +1⭐";
          sm.onclick = (e) => {
            stop(e);
            _captureBattleFocus(b.id, card);
            tryEscapeBattle(b.id, "smyt", sm);
          };
          actions.appendChild(sm);

          if (!isMafiaBattle) {
            const off = document.createElement("button");
            off.className = "btn small";
            off.textContent = "Отвали";
            // NOTE: disabled buttons do not fire hover/click events in browsers.
            // We keep it interactive, but block action when locked and show an inline toast under the button.
            off.disabled = false;
            off.setAttribute("aria-disabled", String(!canFreeOff));
            off.classList.toggle("is-disabled", !canFreeOff);

            const offWrap = document.createElement("div");
            offWrap.style.display = "flex";
            offWrap.style.flexDirection = "column";
            offWrap.style.alignItems = "flex-start";
            offWrap.style.gap = "4px";

            const offToast = document.createElement("div");
            offToast.className = "noteLine";
            offToast.style.display = "none";

            const showOffToast = () => {
              try {
                const msg = "Откроется на ⚡5";
                try { showBtnToastRight(off, msg); } catch (_) {}
                // ensure inline offToast stays hidden to avoid duplicate messages
                try { offToast.style.display = "none"; } catch (_) {}
              } catch (_) {}
            };

            off.onmouseenter = () => { if (!canFreeOff) showOffToast(); };
            off.onclick = (e) => {
              stop(e);
              if (!canFreeOff) {
                showOffToast();
                return;
              }
              _captureBattleFocus(b.id, card);
              tryEscapeBattle(b.id, "off", off);
            };
            offWrap.appendChild(off);
            offWrap.appendChild(offToast);
            actions.appendChild(offWrap);
            
            // Removed "Недоступно." pill - now showing toast on button click instead
          }

          card.appendChild(actions);
        }

        if (b.inlineNote) {
          const note = document.createElement("div");
          note.className = "noteLine";
          note.textContent = b.inlineNote;
          card.appendChild(note);
        }
      } else {
        // RESOLVED: show revealed attack + defense with colors and a close button
        const revealColor = b.revealColor || (b.attack && b.attack.color) || (b.defense && b.defense.color) || null;
        if (b.attack && !b.attack.color && revealColor) {
          b.attack.color = revealColor;
        }

        // Show attack first (вброс)
        if (b.attack) {
          const aRow = document.createElement("div");
          aRow.className = "choiceRow";
          const a = document.createElement("div");
          a.className = clsForColor(b.attack.color);
          a.textContent = b.attack.text;
          if (!b.attack.color) {
            a.className = clsForColor(null, true);
            a.style.color = "rgba(255,255,255,.92)";
          } else if (b.attack.color === "k") {
            a.style.color = "#ddd";
          } else {
            a.style.color = "black";
          }
          aRow.appendChild(a);
          card.appendChild(aRow);
        }

        // Then defense (контраргумент)
        if (b.defense) {
          const dRow = document.createElement("div");
          dRow.className = "choiceRow";
          const d = document.createElement("div");
          d.className = clsForColor(b.defense.color);
          d.textContent = b.defense.text;
          if (!b.defense.color) {
            d.className = clsForColor(null, true);
            d.style.color = "rgba(255,255,255,.92)";
          } else if (b.defense.color === "k") {
            d.style.color = "#ddd";
          } else {
            d.style.color = "black";
          }
          dRow.appendChild(d);
          card.appendChild(dRow);
        }

        const res = document.createElement("div");
        res.className = "battleTop";
        const resText = _normalizeResultText(b);
        try {
          const rl = (b.resultLine != null) ? String(b.resultLine) : "";
          const rll = rl.toLowerCase();
          if (!rl.trim() || rll.includes("чил") || rll.includes("peace") || rll.includes("draw") || rll.includes("tie")) {
            b.resultLine = resText;
          }
        } catch (_) {}
        res.innerHTML = `<div class="kpill"><strong>${escapeHtml(resText)}</strong></div>`;
        card.appendChild(res);

        // Rematch UI (wave 3): request/accept/decline via core API only, no numeric promises.
        try {
          const rem = b.rematch || null;
          // Allow rematch for any resolved battle (including those created via accept/rematchOf).
          const isEligible = (b.result === "win" || b.result === "lose");
          const youAreLoser = (b.result === "lose");
          const nameById = (pid) => {
            if (!pid) return "Кто-то";
            if (pid === "me") {
              const me = S && S.me ? S.me : null;
              return me ? (UI.displayName ? UI.displayName(me) : (me.name || "Ты")) : "Ты";
            }
            const p = (S && S.players && S.players[pid]) ? S.players[pid] : null;
            return p ? (UI.displayName ? UI.displayName(p) : (p.name || "Кто-то")) : "Кто-то";
          };

          const remWrap = document.createElement("div");
          remWrap.className = "eventCard";

          const remLine = document.createElement("div");
          remLine.className = "noteLine";

          const remActions = document.createElement("div");
          remActions.className = "actions";

          let show = false;

          // Pending rematch request (undecided)
          if (rem && rem.requestedAt && rem.decided !== true) {
            show = true;
            const requesterId = rem.requestedBy || null;
            const isFromMe = (requesterId === "me");

            if (isFromMe) {
              // I requested rematch, waiting for response.
              remLine.textContent = "Ты вызвал на реванш.";
            } else {
              // Opponent requested rematch, show accept/decline buttons.
              const requesterName = nameById(requesterId);
              remLine.textContent = `${requesterName} просит реванш`;

              const btnAccept = document.createElement("button");
              btnAccept.className = "btn small";
              btnAccept.type = "button";
              try { btnAccept.dataset.enterIgnore = "1"; } catch (_) {}
              btnAccept.textContent = "Принять";
              btnAccept.onclick = (e) => {
                stop(e);
                try {
                  if (Game.Conflict && typeof Game.Conflict.respondRematch === "function") {
                    Game.Conflict.respondRematch(b.id, true);
                  }
                } catch (_) {}
                requestAll();
              };
              remActions.appendChild(btnAccept);

              const btnDecline = document.createElement("button");
              btnDecline.className = "btn small";
              btnDecline.type = "button";
              try { btnDecline.dataset.enterIgnore = "1"; } catch (_) {}
              btnDecline.textContent = "Отклонить";
              btnDecline.onclick = (e) => {
                stop(e);
                try {
                  if (Game.Conflict && typeof Game.Conflict.respondRematch === "function") {
                    Game.Conflict.respondRematch(b.id, false);
                  }
                } catch (_) {}
                requestAll();
              };
              remActions.appendChild(btnDecline);
            }
          }
          
          // Decided rematch: show result and offer retry if declined and I'm the loser.
          if (rem && rem.requestedAt && rem.decided === true) {
            show = true;
            if (rem.accepted === true) {
              // Accepted: battle card will be replaced, show brief message.
              remLine.textContent = "Реванш принят";
            } else {
              // Declined: show "Реванш отклонён." and offer retry (if I'm the loser).
              remLine.textContent = "Реванш отклонён.";
              
              if (isEligible && youAreLoser) {
                const nextCost = (b.rematchRequestCount || 0) + 1;
                const retryBtn = document.createElement("button");
                retryBtn.className = "btn small";
                retryBtn.disabled = false; // Explicitly enable button
                retryBtn.type = "button";
                try { retryBtn.dataset.enterIgnore = "1"; } catch (_) {}
                retryBtn.textContent = `Снова реванш? ${nextCost} 💰`;
                retryBtn.onclick = (e) => {
                  stop(e);
                  try {
                    if (Game.Conflict && typeof Game.Conflict.requestRematch === "function") {
                      const r = Game.Conflict.requestRematch(b.id);
                      if (r && r.ok === false && (r.reason === "no_points" || r.reason === "insufficient" || r.reason === "min_reserve")) {
                        if (UI && typeof UI.showStatToast === "function") UI.showStatToast("points", "Пойнтов не хватает.");
                      }
                      if (r && r.ok === false && r.reason === "already_requested") {
                        if (UI && typeof UI.showToast === "function") UI.showToast("Реванш уже запрошен.");
                      }
                      if (r && r.ok === false && r.reason === "not_eligible") {
                        if (UI && typeof UI.showToast === "function") UI.showToast("Пока нельзя: баттл ещё не завершён.");
                      }
                      if (r && r.ok === false && r.reason === "not_found") {
                        if (UI && typeof UI.showToast === "function") UI.showToast("Баттл не найден.");
                      }
                    }
                  } catch (_) {}
                  requestAll();
                };
                const retryActions = document.createElement("div");
                retryActions.className = "actions";
                retryActions.appendChild(retryBtn);
                remWrap.appendChild(retryActions);
              }
            }
          }
          
          // Initial rematch request (no request yet, or only after accept - new battle).
          if (!rem || (rem.decided === true && rem.accepted === true)) {
            if (isEligible && youAreLoser) {
              show = true;
              const nextCost = (b.rematchRequestCount || 0) + 1;
              const isFirstTime = (b.rematchRequestCount || 0) === 0;
              
              // Use button instead of clickable div for rematch request
              const btnRematch = document.createElement("button");
              btnRematch.className = "btn small";
              btnRematch.disabled = false; // Explicitly enable button
              btnRematch.type = "button";
              try { btnRematch.dataset.enterIgnore = "1"; } catch (_) {}
              btnRematch.textContent = isFirstTime ? `Реванш? ${nextCost} 💰` : `Снова реванш? ${nextCost} 💰`;
              btnRematch.onclick = (e) => {
                stop(e);
                try {
                  if (Game.Conflict && typeof Game.Conflict.requestRematch === "function") {
                    const r = Game.Conflict.requestRematch(b.id);
                    if (r && r.ok === false && (r.reason === "no_points" || r.reason === "insufficient" || r.reason === "min_reserve")) {
                      if (UI && typeof UI.showStatToast === "function") UI.showStatToast("points", "Пойнтов не хватает.");
                    }
                    if (r && r.ok === false && r.reason === "already_requested") {
                      if (UI && typeof UI.showToast === "function") UI.showToast("Реванш уже запрошен.");
                    }
                    if (r && r.ok === false && r.reason === "not_eligible") {
                      if (UI && typeof UI.showToast === "function") UI.showToast("Пока нельзя: баттл ещё не завершён.");
                    }
                    if (r && r.ok === false && r.reason === "not_found") {
                      if (UI && typeof UI.showToast === "function") UI.showToast("Баттл не найден.");
                    }
                  }
                } catch (_) {}
                requestAll();
              };
              remActions.appendChild(btnRematch);
            }
          }

          if (show) {
            remWrap.appendChild(remLine);
            if (remActions.childElementCount > 0) remWrap.appendChild(remActions);
            card.appendChild(remWrap);
          }
        } catch (_) {}

        const closeRow = document.createElement("div");
        closeRow.className = "actions";

            const closeBtn = document.createElement("button");
            closeBtn.className = "btn small";
            closeBtn.textContent = "Закрыть";
        closeBtn.onclick = (e) => {
          stop(e);
          _captureBattleFocus(b.id, card);
          UI._clearDrawTicker(b.id);
          // Remove only this resolved battle
          S.battles = S.battles.filter(x => x.id !== b.id);
          requestAll();
        };
        closeRow.appendChild(closeBtn);

        card.appendChild(closeRow);
      }

      body.appendChild(card);
    });

    // Move dropdown to end of body AFTER all battle cards to ensure it's on top
    if (UI._battleDropdownElement && UI._battleDropdownElement.parentNode === body) {
      body.appendChild(UI._battleDropdownElement);
      delete UI._battleDropdownElement;
    }

    // Keep the interacted battle card in view as it moves between active/resolved sections.
   if (_focusIdBefore) {
     requestAnimationFrame(() => {
       try { _applyBattleFocus(); } catch (_) {}
     });
   }
   try { if (UI && typeof UI.updateRightScroll === "function") UI.updateRightScroll(); } catch (_) {}
 };

 // Update crowd vote counters for a specific battle (fixes DUM-030)
 UI.updateBattleCounters = (battleId) => {
   if (!battleId) return;
   
   // Sync crowd data from Game.__S.battles to local S.battles
   if (Game && Game.__S && Array.isArray(Game.__S.battles)) {
     const freshBattle = Game.__S.battles.find(x => x.id === battleId);
     const localBattle = S && Array.isArray(S.battles) ? S.battles.find(x => x.id === battleId) : null;
     if (freshBattle && localBattle && freshBattle.crowd) {
       localBattle.crowd = localBattle.crowd || {};
       localBattle.crowd.votesA = freshBattle.crowd.votesA | 0;
       localBattle.crowd.votesB = freshBattle.crowd.votesB | 0;
       localBattle.crowd.voters = freshBattle.crowd.voters || {};
       
       // Update DOM immediately
       try {
         const card = document.querySelector(`[data-battle-id="${battleId}"]`);
         if (card) {
           const voteRow = card.querySelector('.eventVoteRow');
           if (voteRow && voteRow.childElementCount === 2) {
             const c = localBattle.crowd;
             // Find attacker/defender names from battle
             const attackerId = localBattle.attackerId || localBattle.fromId;
             const defenderId = localBattle.defenderId || localBattle.toId;
             
             // Helper to get name with influence badge
             const nameWithInf = (playerId) => {
               if (!playerId) return "?";
               const p = S.players && S.players[playerId] ? S.players[playerId] : null;
               if (!p) return playerId;
               const name = p.name || playerId;
               const pts = Number.isFinite(p.points) ? (p.points | 0) : 0;
               const inf = Number.isFinite(p.influence) ? (p.influence | 0) : 0;
               return `${name} 💰${pts} [${inf}]`;
             };
             
            const raw = getRawCountsFromVoters(c);
            voteRow.children[0].textContent = `${nameWithInf(attackerId)} - ${raw.a || 0}`;
            voteRow.children[1].textContent = `${nameWithInf(defenderId)} - ${raw.b || 0}`;
            
            console.log('[updateBattleCounters]', battleId, 'votesA:', raw.a, 'votesB:', raw.b);
           }
         }
       } catch (e) {
         console.warn('[updateBattleCounters] DOM update failed:', e);
       }
     }
   }
 };
})();
