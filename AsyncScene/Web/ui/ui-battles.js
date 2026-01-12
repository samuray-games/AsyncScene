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

  const nowMs = () => Date.now();
  const fmtSec = (ms) => {
    const s = Math.max(0, Math.ceil(ms / 1000));
    return String(s);
  };

 const spendPoints = (amount, reason) => {
   try {
     if (Game.StateAPI && typeof Game.StateAPI.spendPoints === "function") {
       return Game.StateAPI.spendPoints(amount, reason);
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

  function tryEscapeBattle(battleId, mode) {
    try {
      if (!Game.Conflict || typeof Game.Conflict.escape !== "function") return;
      const res = Game.Conflict.escape(battleId, mode);
      if (res && res.ok === false) {
        const cost = (typeof res.cost === "number") ? res.cost : null;
        if (res.reason === "no_points" || res.error === "not_enough_points") {
         const msg = "Недоступно.";
         if (UI && typeof UI.showStatToast === "function") {
           UI.showStatToast("points", msg);
         } else {
           setInlineNote(battleId, msg);
         }
       } else {
         setInlineNote(battleId, "Этот мув не зашёл.");
       }
      }
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
      const msg = "Недоступно.";
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
   if (b.status === "draw") return true;
   if (b.draw === true && b.crowd && !b.crowd.decided) return true;
   return !!(b.crowd && typeof b.crowd.endAt === "number" && !b.crowd.decided);
 }

 function isEscapeVote(b) {
   return !!(b && b.escapeVote && !b.escapeVote.decided);
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
   const countEl = $("battleCount");
   if (!body || !countEl) return;
   bindBattleArgClicks();

   const header = $("battlesHeader");
   let headerBtns = null;
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

     const btnCollapse = ensureBtn("battlesBtnCollapse", "—", "Свернуть", (ev) => { stop(ev); setSizeHeader("collapsed"); });
     const btnMax = ensureBtn("battlesBtnMax", "□", "Развернуть", (ev) => { stop(ev); setSizeHeader("max"); });
     const btnMed = ensureBtn("battlesBtnMed", "⧉", "Стандартный размер", (ev) => { stop(ev); setSizeHeader("medium"); });
     headerBtns = { btnCollapse, btnMed, btnMax };
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
     headerBtns.btnCollapse.classList.toggle("is-active", size === "collapsed");
     headerBtns.btnMed.classList.toggle("is-active", size === "medium");
     headerBtns.btnMax.classList.toggle("is-active", size === "max");
   }
   body.classList.toggle("hidden", size === "collapsed");

    // Local invite UI state (kept stable across renders)
    UI._battleInvite = UI._battleInvite || { open:false, q:"", sel:0, lastPicked:null };

    // Auto-expand battles panel when there is at least one active battle (Step 10)
    try {
      if (typeof UI.openBattles === "function") {
        const hasActive = Array.isArray(S.battles) && S.battles.some(b => b && b.resolved !== true);
        if (hasActive) {
          if (UI && typeof UI.ensurePanelExpanded === "function") UI.ensurePanelExpanded("battles");
          else if (size === "collapsed") { S.flags = S.flags || {}; S.flags.battlesSize = "medium"; }
        }
      }
    } catch (_) {}

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

    body.innerHTML = "";

    // Invite to battle button (inline input like @)
    {
      const inviteRow = document.createElement("div");
      inviteRow.className = "actions";

      const inviteBtn = document.createElement("button");
      inviteBtn.className = "btn";
      inviteBtn.textContent = "Вызвать";
      inviteBtn.onclick = (e) => {
        stop(e);
        UI._battleInvite.open = !UI._battleInvite.open;
        UI._battleInvite.sel = 0;
        requestAll();
        setTimeout(() => {
          const el = document.getElementById("battleInviteInput");
          if (el) el.focus();
        }, 0);
      };
      inviteRow.appendChild(inviteBtn);

      body.appendChild(inviteRow);
    }

    if (UI._battleInvite && UI._battleInvite.open) {
      const top2 = document.createElement("div");
      top2.className = "battleTop";

      const input = document.createElement("input");
      input.type = "text";
      input.id = "battleInviteInput";
      input.className = "input";
      input.placeholder = "Ник. Как в чате.";
      input.value = String(UI._battleInvite.q || "");
      input.autocomplete = "off";

      const close = document.createElement("button");
      close.className = "btn small";
      close.textContent = "×";
      close.title = "Закрыть";
      close.onclick = (e) => { stop(e); UI._battleInvite.open = false; requestAll(); };

      top2.appendChild(input);
      const go = document.createElement("button");
      go.className = "btn small";
      go.textContent = "Вызвать";
      top2.appendChild(go);
      top2.appendChild(close);
      body.appendChild(top2);

      const isTargetablePlayer = (p) => {
        if (!p) return false;
        if (p.isMe) return false;
        if (p.role === "cop") return false;
        if (p.npc && (p.role === "toxic" || p.role === "bandit") && Game.StateAPI && typeof Game.StateAPI.isNpcJailed === "function") {
          try { if (Game.StateAPI.isNpcJailed(p.id)) return false; } catch (_) {}
        }
        return true;
      };

      const all = Object.values(S.players || {}).filter(isTargetablePlayer);
      const names = all.map(p => p && p.name).filter(Boolean);

      const listWrap = document.createElement("div");
      listWrap.id = "battleInviteList";
      listWrap.className = "mention-list";
      // Positioning handled by CSS: #battleInviteList with position:fixed and z-index:2000
      // Store for appendChild before early return (fixes regression: dropdown not appearing at all)
      UI._battleInviteListWrap = listWrap;

      const renderInviteList = () => {
        const q = String(UI._battleInvite.q || "").trim().toLowerCase();
      const list = q ? all.filter(p => p && String(p.name || "").toLowerCase().includes(q)) : all.slice(0, 10);
        UI._battleInvite._list = list;

        listWrap.innerHTML = "";
        list.forEach((p, idx) => {
          const it = document.createElement("div");
          it.className = "mention-item";
          if (idx === (UI._battleInvite.sel || 0)) it.classList.add("active");
          it.textContent = (UI.displayName ? UI.displayName(p) : String(p.name || ""));
          it.onclick = (e) => {
            stop(e);
            UI._battleInvite.q = String(p.name || "");
            UI._battleInvite.lastPicked = p.id;
            UI._battleInvite.sel = idx;
            input.value = UI._battleInvite.q;
            renderInviteList();
            setTimeout(() => { try { const el = document.getElementById("battleInviteInput"); el && el.focus && el.focus(); } catch(_){} }, 0);
          };
          listWrap.appendChild(it);
        });
      };

      renderInviteList();

      const findByExact = (nameRaw) => all.find(p => p && String(p.name || "").toLowerCase() === nameRaw.toLowerCase());

      const snapToSelection = () => {
        const list = UI._battleInvite._list || [];
        const idx = Math.max(0, Math.min(UI._battleInvite.sel || 0, list.length - 1));
        if (list[idx]) {
          UI._battleInvite.q = list[idx].name;
          input.value = UI._battleInvite.q;
        }
      };

      const startFromInput = () => {
        UI._battleInvite.q = String(input.value || "");
        const nameRaw = String(UI._battleInvite.q || "").trim();
        if (!nameRaw) return;

        const target = findByExact(nameRaw);
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

        if (Game.Conflict && typeof Game.Conflict.start === "function") {
          Game.Conflict.start(cid);
        } else if (Game.Conflict && typeof Game.Conflict.startWith === "function") {
          Game.Conflict.startWith(cid);
        }
        // Keep dropdown open after starting battle (fixes DUM-005: dropdown disappears after battle starts)
        // UI._battleInvite.open = false; // ← removed: user can close manually via × or Escape
        UI._battleInvite.q = "";
        UI._battleInvite.sel = 0;
        requestAll();
      };

      go.onclick = (e) => { stop(e); if (!String(UI._battleInvite.q || "").trim()) snapToSelection(); startFromInput(); };

      input.onkeydown = (e) => {
        const k = e.key;
        if (k === "Escape") { stop(e); UI._battleInvite.open = false; requestAll(); return; }
        if (k === "ArrowDown") { stop(e); UI._battleInvite.sel = (UI._battleInvite.sel || 0) + 1; renderInviteList(); return; }
        if (k === "ArrowUp") { stop(e); UI._battleInvite.sel = Math.max(0, (UI._battleInvite.sel || 0) - 1); renderInviteList(); return; }
        if (k === "Enter") {
          stop(e);
          if (!String(UI._battleInvite.q || "").trim()) snapToSelection();
          startFromInput();
          return;
        }
      };
      input.addEventListener("keydown", input.onkeydown, true);
      input.addEventListener("keyup", (e) => {
        if (e && e.key === "Enter") stop(e);
      }, true);

      input.oninput = () => {
        UI._battleInvite.q = String(input.value || "");
        UI._battleInvite.sel = 0;
        renderInviteList();
      };
    }

   // Append invite list dropdown now (must be before early return for empty battles)
   if (UI._battleInviteListWrap) {
     body.appendChild(UI._battleInviteListWrap);
     // Store reference to re-append at end if battles exist (to ensure dropdown is on top)
     UI._battleDropdownElement = UI._battleInviteListWrap;
     delete UI._battleInviteListWrap;
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
          if (!Number.isFinite(v.endAt) && Number.isFinite(v.endsAt)) v.endAt = v.endsAt;
          if (!Number.isFinite(v.endsAt) && Number.isFinite(v.endAt)) v.endsAt = v.endAt;
          if (!Number.isFinite(v.endAt) || !v.endAt) {
            v.endAt = nowMs() + 30000;
            v.endsAt = v.endAt;
          }

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

          const voteHint = document.createElement("div");
          voteHint.className = "pill";
          voteHint.textContent = "Голосование идёт. Ты только смотришь.";
          escapeWrap.appendChild(voteHint);

          const voteRow = document.createElement("div");
          voteRow.className = "eventVoteRow";
          escapeWrap.appendChild(voteRow);

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
            const c = bb.escapeVote || {};
            const end = (typeof c.endAt === "number") ? c.endAt : v.endAt;
            const left = end - nowMs();
            const infoEl = document.getElementById(`escapeInfo_${bb.id}`);
            if (infoEl) infoEl.textContent = `Ещё ${fmtSec(left)} сек`;

            try {
            if (voteRow && voteRow.childElementCount === 0) {
                voteRow.appendChild(mkVoteBtn(voteLabelA, c.votesA || 0));
                voteRow.appendChild(mkVoteBtn(voteLabelB, c.votesB || 0));
              } else if (voteRow && voteRow.childElementCount === 2) {
                voteRow.children[0].textContent = `${voteLabelA} - ${c.votesA || 0}`;
                voteRow.children[1].textContent = `${voteLabelB} - ${c.votesB || 0}`;
              }
            } catch (_) {}

            if (left <= 0 && !c.decided && Game.Conflict && typeof Game.Conflict.finalizeEscapeVote === "function") {
              try { Game.Conflict.finalizeEscapeVote(bb.id); } catch (_) {}
            }
          };

          UI._ensureEscapeTicker(
            b.id,
            () => S.battles.find(x => x.id === b.id),
            (bb) => update(bb)
          );
          update(b);

          const leftNow = v.endAt - nowMs();
          if ((leftNow <= 0 || v.decided) && !escapeWrap._resultShown) {
            const resLine = document.createElement("div");
            resLine.className = "noteLine";
            resLine.textContent = b.resultLine || "Всё, финал.";
            escapeWrap.appendChild(resLine);
            escapeWrap._resultShown = true;

            const closeRow = document.createElement("div");
            closeRow.className = "actions";

            const closeBtn = document.createElement("button");
            closeBtn.className = "btn small";
            closeBtn.textContent = "Свернуть";
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
          if (!b.crowd) b.crowd = { endAt: 0, votesA: 0, votesB: 0, decided: false };
          b.crowd.uiOnly = true;
          if (!Number.isFinite(b.crowd.endAt) && Number.isFinite(b.crowd.endsAt)) {
            b.crowd.endAt = b.crowd.endsAt;
          }
          if (!Number.isFinite(b.crowd.endsAt) && Number.isFinite(b.crowd.endAt)) {
            b.crowd.endsAt = b.crowd.endAt;
          }
          if (!Number.isFinite(b.crowd.endAt) || !b.crowd.endAt) {
            b.crowd.endAt = nowMs() + 30000;
            b.crowd.endsAt = b.crowd.endAt;
          }
          const endAt = b.crowd.endAt;

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


          const voteHint = document.createElement("div");
          voteHint.className = "pill";
          voteHint.textContent = isMyDraw ? "Голосование идёт. Ты только смотришь." : "Голосование идёт.";
          drawWrap.appendChild(voteHint);

          const voteRow = document.createElement("div");
          voteRow.className = "eventVoteRow";
          drawWrap.appendChild(voteRow);

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
            const c = bb.crowd || {};
            const end = (typeof c.endAt === "number") ? c.endAt : endAt;
            const left = end - nowMs();
            const infoEl = document.getElementById(`drawInfo_${bb.id}`);
            if (infoEl) infoEl.textContent = `Ещё ${fmtSec(left)} сек`;

            try {
              const vRow = voteRow;
              if (vRow && vRow.childElementCount === 0) {
                const aLabel = nameWithInf(attackerId);
                const bLabel = nameWithInf(defenderId);
                vRow.appendChild(mkVoteBtn(aLabel, c.votesA || 0));
                vRow.appendChild(mkVoteBtn(bLabel, c.votesB || 0));
              } else if (vRow && vRow.childElementCount === 2) {
                vRow.children[0].textContent = `${nameWithInf(attackerId)} - ${c.votesA || 0}`;
                vRow.children[1].textContent = `${nameWithInf(defenderId)} - ${c.votesB || 0}`;
              }
            } catch (_) {}

            if (left <= 0 && !c.decided && Game.Conflict && typeof Game.Conflict.finalizeCrowdVote === "function") {
              try { Game.Conflict.finalizeCrowdVote(bb.id); } catch (_) {}
            }
          };

          UI._ensureDrawTicker(
            b.id,
            () => S.battles.find(x => x.id === b.id),
            (bb) => update(bb)
          );
          update(b);

          const leftNow = b.crowd.endAt - nowMs();
          if ((leftNow <= 0 || b.drawResolved === true || b.crowd.decided) && !drawWrap._resultShown) {
            const resLine = document.createElement("div");
            resLine.className = "noteLine";
            resLine.textContent = b.drawResultLine || b.resultLine || "Всё, финал.";
            drawWrap.appendChild(resLine);
            drawWrap._resultShown = true;

            const closeRow = document.createElement("div");
            closeRow.className = "actions";

            const closeBtn = document.createElement("button");
            closeBtn.className = "btn small";
            closeBtn.textContent = "Свернуть";
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

            // Text color rules: black on colored chips, light on black chips, light on unknown.
            if (p && p.color === "k") chip.style.color = "#ddd";
            else if (p && p.color) chip.style.color = "black";
            else chip.style.color = "rgba(255,255,255,.92)";

            if (p && p._pad) {
              chip.style.opacity = "0.55";
              chip.style.cursor = "default";
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
              row.appendChild(chip);
              return;
            }

            chip.className = clsForColor(p.color);
            chip.textContent = p.text;

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
          sm.onclick = (e) => {
            stop(e);
            _captureBattleFocus(b.id, card);
            tryEscapeBattle(b.id, "smyt");
          };
          actions.appendChild(sm);

          if (!isMafiaBattle) {
            const off = document.createElement("button");
            off.className = "btn small";
            off.textContent = "Отвали";
            off.disabled = !canFreeOff;
            off.onclick = (e) => {
              stop(e);
              if (!canFreeOff) {
                // Show toast if button is disabled (influence < 5)
                if (UI && typeof UI.showStatToast === "function") {
                  UI.showStatToast("influence", "Отвали откроется на ⚡ 5.");
                }
                return;
              }
              _captureBattleFocus(b.id, card);
              tryEscapeBattle(b.id, "off");
            };
            actions.appendChild(off);
            
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
          const isEligible = !b.rematchOf && (b.result === "win" || b.result === "lose");
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

          if (rem && rem.requestedAt && rem.decided !== true) {
            show = true;
            const requesterId = rem.requestedBy || null;
            const requesterName = nameById(requesterId);
            remLine.textContent = `${requesterName} просит реванш`;

            const isForMe = (requesterId !== "me");
            if (isForMe) {
              const btnAccept = document.createElement("button");
              btnAccept.className = "btn small";
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
          } else if (rem && rem.requestedAt && rem.decided === true) {
            show = true;
            remLine.textContent = (rem.accepted === true) ? "Реванш принят" : "Реванш отклонён";
          } else if (isEligible && youAreLoser) {
            show = true;
            remLine.textContent = "Хочешь реванш";

            const btnReq = document.createElement("button");
            btnReq.className = "btn small";
            btnReq.textContent = "Попросить";
            btnReq.onclick = (e) => {
              stop(e);
              try {
                if (Game.Conflict && typeof Game.Conflict.requestRematch === "function") {
                  Game.Conflict.requestRematch(b.id);
                }
              } catch (_) {}
              requestAll();
            };
            remActions.appendChild(btnReq);
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
        closeBtn.textContent = "Свернуть";
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
})();
