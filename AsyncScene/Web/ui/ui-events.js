// ui-events.js
window.Game = window.Game || {};

(() => {
  const UI = Game.UI;
  const S = UI.S;
  const t = (key, vars) => (Game.Data && typeof Game.Data.t === "function")
    ? Game.Data.t(key, vars)
    : String(key || "");
  const $ = UI.$;
  const escapeHtml = UI.escapeHtml;

  function stop(ev){
    try { ev.preventDefault(); } catch(_) {}
    try { ev.stopPropagation(); } catch(_) {}
  }

  function getEventsRootBlock(headerEl){
    if (!headerEl) return null;
    // Prefer explicit id if present, otherwise closest .block container
    const byId = $("eventsBlock");
    if (byId) return byId;
    return headerEl.closest ? headerEl.closest(".block") : null;
  }

  function applyEventsSizeClass(rootEl, size){
    if (!rootEl) return;
    try {
      if (UI && typeof UI.applyPanelSizeClasses === "function") {
        UI.applyPanelSizeClasses(rootEl, "events");
        return;
      }
    } catch (_) {}
    rootEl.classList.remove("panel--collapsed","panel--medium","panel--full");
    const s = (size === "collapsed" || size === "max" || size === "medium") ? size : "medium";
    const cls =
      s === "collapsed" ? "panel--collapsed" :
      s === "max" ? "panel--full" :
      "panel--medium";
    rootEl.classList.add(cls);
  }

  function getEventsSize(){
    return (S.flags && S.flags.eventsSize) || "medium";
  }

  function setEventsSize(next){
    S.flags = S.flags || {};
    S.flags.eventsSize = next;
  }

  // NOTE:
  // - Events показывают открытые события (свои + чужие).
  // - Этот UI не создаёт события сам. Он только рендерит то, что лежит в State/Events.
  // - Сворачивание/разворачивание хранится в state-флагах, а не в DOM.

  function setEventNote(e, msg) {
    e.uiNote = msg || "";
  }

  function showVoteBtnToast(anchorEl, text) {
    if (!anchorEl) return;
    const msg = String(text || "").trim();
    if (!msg) return;
    // Render toast on body so it survives DOM re-renders of the events card.
    try {
      // Associate a stable id with the anchor element if not present
      if (!anchorEl.__voteToastId) anchorEl.__voteToastId = `voteToast_${Date.now()}_${Math.floor(Math.random()*1e6)}`;
      const sid = String(anchorEl.__voteToastId);
      let el = document.querySelector(`.voteBtnToast[data-for='${sid}']`);
      if (!el) {
        el = document.createElement("div");
        el.className = "voteBtnToast";
        el.setAttribute("data-for", sid);
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
        const r = anchorEl.getBoundingClientRect();
        const left = (r.right + (window.pageXOffset || document.documentElement.scrollLeft || 0) + 8);
        const top = (r.top + (window.pageYOffset || document.documentElement.scrollTop || 0) + (r.height / 2));
        el.style.left = String(Math.round(left)) + "px";
        el.style.top = String(Math.round(top)) + "px";
        el.style.transform = "translateY(-50%)";
        el.style.display = "block";
        requestAnimationFrame(() => { try { el.style.opacity = "1"; } catch(_) {} });
      } catch (_) {}
      try {
        if (el.__voteToastTimer) clearTimeout(el.__voteToastTimer);
        el.__voteToastTimer = setTimeout(() => {
          try { el.style.opacity = "0"; } catch (_) {}
          try { setTimeout(() => { if (el && el.parentNode) el.parentNode.removeChild(el); }, 160); } catch (_) {}
        }, 1200);
      } catch (_) {}
    } catch (_) {}
  }

  // Cop chatter is driven by StateAPI.tickCops (state.js / events.js). UI must not duplicate it here.
  function maybeEmitCopChatter(_ctx) { return; }

  function isMySideId(id) {
    const meId = (S && S.me && S.me.id) ? S.me.id : "me";
    return id === "me" || (id && id === meId);
  }

  function isMyEvent(e) {
    const aId = e?.a?.id || e?.aId;
    const bId = e?.b?.id || e?.bId;
    return isMySideId(aId) || isMySideId(bId);
  }

  function getEventBattleId(e) {
    return (e && (e.battleId || e.battle?.id || e.tie?.battleId || e.refBattleId)) || null;
  }

  function highlightEvent(eventId) {
    S.flags = S.flags || {};
    S.flags.highlightEventId = eventId || null;
  }

  function getActiveEventId(){
    const evs = S && S.events;
    if (evs && (evs.activeId || evs.selectedId)) return evs.activeId || evs.selectedId;
    if (S && S.flags && (S.flags.activeEventId || S.flags.selectedEventId)) return S.flags.activeEventId || S.flags.selectedEventId;
    return null;
  }

  function setActiveEventId(eventId){
    // Prefer S.events container if it exists (ui-chat fallback writes here)
    if (S) {
      if (!S.events || Array.isArray(S.events)) {
        // If S.events is an array, keep it, but create a sidecar container
        S.eventsMeta = S.eventsMeta || {};
        S.eventsMeta.activeId = eventId || null;
        S.eventsMeta.selectedId = eventId || null;
      } else {
        S.events.activeId = eventId || null;
        S.events.selectedId = eventId || null;
      }
      S.flags = S.flags || {};
      S.flags.activeEventId = eventId || null;
      S.flags.selectedEventId = eventId || null;
    }
  }

  function getHighlightEventId(){
    return (S && S.flags && S.flags.highlightEventId) ? S.flags.highlightEventId : null;
  }

  function ensureEventsExpanded() {
    try {
      if (UI && typeof UI.ensureEventsExpanded === "function") return UI.ensureEventsExpanded();
    } catch (_) {}

    // Fallback if ui-core helpers are not present
    const body = $("eventsBody");
    if (body) body.classList.remove("hidden");

    S.flags = S.flags || {};
    S.flags.eventsCollapsed = false;
  }

  function scrollToEventCard(eventId) {
    if (!eventId) return false;

    // mark highlight BEFORE render so the element can be styled when it appears
    highlightEvent(eventId);
    setActiveEventId(eventId);

    ensureEventsExpanded();

    // Render once so the card exists in DOM
    rerenderEventsOnly();

    const body = $("eventsBody");
    if (!body) return false;

    const card = body.querySelector(`[data-event-id="${CSS.escape(eventId)}"]`);
    if (!card) return false;

    card.scrollIntoView({ block: "nearest", behavior: "smooth" });

    // clear highlight after a short pulse
    setTimeout(() => {
      if (S.flags && S.flags.highlightEventId === eventId) {
        S.flags.highlightEventId = null;
        rerenderEventsOnly();
      }
    }, 1500);

    return true;
  }

  // Если у тебя есть отдельный модуль Events - читаем оттуда, иначе из S.events
  function getEventsList() {
    if (Game.Events && typeof Game.Events.getAll === "function") {
      const arr = Game.Events.getAll();
      return Array.isArray(arr) ? arr : [];
    }
    return Array.isArray(S.events) ? S.events : [];
  }

  function rerenderEventsOnly() {
    // Avoid full re-render because Battles may randomize options on render.
    if (UI && typeof UI.renderEvents === "function") {
      UI.renderEvents();
      return;
    }
    // Fallback: prefer requestRenderAll to avoid click-double issues
    if (UI && typeof UI.requestRenderAll === "function") return UI.requestRenderAll();
    if (UI && typeof UI.renderAll === "function") {
      return setTimeout(() => { try { UI.renderAll(); } catch (_) {} }, 0);
    }
  }

  // Auto-refresh the Events panel while at least one crowd vote is active
  function scheduleEventsAutoRefresh(openList) {
    try {
      if (UI && UI._eventsAutoTimer) {
        clearTimeout(UI._eventsAutoTimer);
        UI._eventsAutoTimer = null;
      }
    } catch (_) {}

    if (!Array.isArray(openList) || openList.length === 0) return;

    // Keep refreshing while any crowd-vote event is unresolved.
    const now = Date.now();
    let nextDelay = null;
    let hasPending = false;
    openList.forEach(ne => {
      const e = ne && ne.raw;
      if (!ne || !e) return;
      if (!ne.crowd) return;
      if (e.resolved) return;
      const endsAt = (typeof e.endsAt === "number") ? e.endsAt : ne.endsAt;
      if (!Number.isFinite(endsAt)) return;
      hasPending = true;
      const left = endsAt - now;
      if (nextDelay === null || left < nextDelay) nextDelay = left;
    });

    if (!hasPending) return;

    const delay = (nextDelay != null && nextDelay <= 0) ? 80 : Math.min(1000, Math.max(200, (nextDelay | 0)));

    UI._eventsAutoTimer = setTimeout(() => {
      try { UI._eventsAutoTimer = null; } catch (_) {}
      try {
        if (UI && UI._eventsClickHold && Date.now() < UI._eventsClickHold) return;
      } catch (_) {}
      rerenderEventsOnly();
    }, delay);
  }

  // Унификация структуры события (чтобы не было «пустых событий»)
  function normalizeEvent(e) {
    const displayNameSafe = (id, name) => {
      if (UI && typeof UI.displayNameByIdOrName === "function") {
        const v = UI.displayNameByIdOrName(id || name);
        if (v) return v;
      }
      return String(name || "???");
    };
    const A = e?.a || (e?.aId ? S.players?.[e.aId] : null);
    const B = e?.b || (e?.bId ? S.players?.[e.bId] : null);

    const aId = e?.a?.id || e?.aId || A?.id || null;
    const bId = e?.b?.id || e?.bId || B?.id || null;

    const aNameRaw = e?.a?.name || e?.aName || A?.name || "???";
    const bNameRaw = e?.b?.name || e?.bName || B?.name || "???";
    const aName = displayNameSafe(aId, aNameRaw);
    const bName = displayNameSafe(bId, bNameRaw);

    const aInf = Number.isFinite(e?.a?.influence)
      ? e.a.influence
      : (Number.isFinite(A?.influence) ? A.influence : 0);

    const bInf = Number.isFinite(e?.b?.influence)
      ? e.b.influence
      : (Number.isFinite(B?.influence) ? B.influence : 0);

    const createdAt = (typeof e?.createdAt === "number") ? e.createdAt : Date.now();
    const endsAt = (typeof e?.endsAt === "number")
      ? e.endsAt
      : (typeof e?.endAt === "number")
        ? e.endAt
        : (createdAt + 10000);

    const resolved = !!e?.resolved;

    const titleFallback = `${aName} [${aInf}] vs ${bName} [${bInf}]`;
    let safeTitle = (e?.title && String(e.title).trim().length)
      ? String(e.title)
      : titleFallback;

    // Task 1: Use attempt formulation for title if it's an escape event
    if (e && e.voteLabels && e.escapeMode) {
      const isOff = e.escapeMode === "off";
      const action = isOff ? "послать" : "свалить от";
      safeTitle = `${aName} пытается ${action} ${bName}`;
    }

    const stableId = e?.id || `e_${createdAt}_${Math.floor(Math.random() * 9999)}`;
    // IMPORTANT: If raw event has no id, persist the generated one so Game.Events can reference it.
    if (e && !e.id) e.id = stableId;

    return {
      raw: e,
      id: stableId,
      battleId: getEventBattleId(e),
      createdAt,
      endsAt,
      resolved,
      a: { id: aId, name: aName, influence: aInf },
      b: { id: bId, name: bName, influence: bInf },
      title: safeTitle,
      resultLine: (e?.resultLine || e?.result || ""),
      closed: !!e?.closed,
      uiNote: e?.uiNote || "",
      voteLabels: e?.voteLabels || null,
      escapeMode: e?.escapeMode || null,
      // crowd votes (если есть)
      crowd: getCrowdState(e),
    };
  }

  function getCrowdState(rawEvent) {
    if (!rawEvent) return null;
    // Prefer existing crowd container, otherwise create one on the raw event (so mutations persist)
    const c = rawEvent.crowd || rawEvent.tieVote || rawEvent.tie || null;
    if (c && typeof c === "object") {
      // normalize common fields
      if (!Number.isFinite(c.aVotes) && Number.isFinite(c.votesA)) c.aVotes = c.votesA;
      if (!Number.isFinite(c.bVotes) && Number.isFinite(c.votesB)) c.bVotes = c.votesB;
      if (!Number.isFinite(c.aVotes)) c.aVotes = 0;
      if (!Number.isFinite(c.bVotes)) c.bVotes = 0;
      if (!c.voters || typeof c.voters !== "object") c.voters = {};
      return c;
    }

    const created = { aVotes: 0, bVotes: 0, voters: {} };
    rawEvent.crowd = created;
    return created;
  }

  function canVoteOnEvent(ne, rawEvent) {
    if (!ne || !rawEvent) return false;
    if (ne.resolved || rawEvent.resolved) return false;
    if (!ne.crowd) return false;
    if (isMyEvent(rawEvent)) return false;
    const sec = Math.max(0, Math.ceil((ne.endsAt - Date.now()) / 1000));
    if (sec <= 0) return false;
    // One vote per player
    const meId = (S && S.me && S.me.id) ? S.me.id : "me";
    const crowd = getCrowdState(rawEvent);
    if (!crowd) return false;
    return !crowd.voters[meId];
  }

  function voteForSide(rawEvent, side) {
    const crowd = getCrowdState(rawEvent);
    if (!crowd) return false;

    const meId = (S && S.me && S.me.id) ? S.me.id : "me";
    if (crowd.voters[meId]) return false;

    crowd.voters[meId] = side;
    if (side === "a") crowd.aVotes = (Number.isFinite(crowd.aVotes) ? crowd.aVotes : 0) + 1;
    if (side === "b") crowd.bVotes = (Number.isFinite(crowd.bVotes) ? crowd.bVotes : 0) + 1;
    crowd.votesA = (crowd.aVotes | 0);
    crowd.votesB = (crowd.bVotes | 0);
    if (rawEvent) {
      rawEvent.aVotes = crowd.aVotes;
      rawEvent.bVotes = crowd.bVotes;
      rawEvent.votesA = crowd.votesA;
      rawEvent.votesB = crowd.votesB;
    }

    return true;
  }

  function computeCrowdWinner(rawEvent) {
    const crowd = getCrowdState(rawEvent);
    if (!crowd) return { winner: null, aVotes: 0, bVotes: 0 };
    const aVotes = Number.isFinite(crowd.aVotes) ? crowd.aVotes : 0;
    const bVotes = Number.isFinite(crowd.bVotes) ? crowd.bVotes : 0;
    let winner = null;
    if (aVotes > bVotes) winner = "a";
    else if (bVotes > aVotes) winner = "b";
    return { winner, aVotes, bVotes };
  }

  function escapeResultLine(ne, rawEvent) {
    const mode = ne.escapeMode || (rawEvent && rawEvent.escapeMode) || "smyt";
    const { winner } = computeCrowdWinner(rawEvent);
    const aName = (UI && typeof UI.displayNameByIdOrName === "function")
      ? (UI.displayNameByIdOrName(ne.a.id || ne.a.name) || ne.a.name)
      : ne.a.name;
    const bName = (UI && typeof UI.displayNameByIdOrName === "function")
      ? (UI.displayNameByIdOrName(ne.b.id || ne.b.name) || ne.b.name)
      : ne.b.name;
    if (mode === "off") {
      return (winner === "a")
        ? `${aName} послал ${bName}`
        : `${aName} не послал ${bName}`;
    }
    return (winner === "a")
      ? `${aName} свалил от ${bName}`
      : `${aName} не свалил от ${bName}`;
  }

  function finalizeEventIfExpired(rawEvent, ne) {
    if (!rawEvent || !ne) return false;
    if (rawEvent.resolved || ne.resolved) return false;
    if (!ne.crowd) return false;

    const kind = rawEvent.type || rawEvent.kind;
    if (kind === "escape") return false;

    const aName = (UI && typeof UI.displayNameByIdOrName === "function")
      ? (UI.displayNameByIdOrName(ne.a.id || ne.a.name) || ne.a.name)
      : ne.a.name;
    const bName = (UI && typeof UI.displayNameByIdOrName === "function")
      ? (UI.displayNameByIdOrName(ne.b.id || ne.b.name) || ne.b.name)
      : ne.b.name;

    const now = Date.now();
    const endsAt = (typeof rawEvent.endsAt === "number") ? rawEvent.endsAt : ne.endsAt;
    if (!Number.isFinite(endsAt)) return false;
    if (now < endsAt) return false;

    const { winner, aVotes, bVotes } = computeCrowdWinner(rawEvent);

    rawEvent.resolved = true;
    rawEvent.resolvedAt = now;

    if (winner === "a") {
      rawEvent.winnerSide = "a";
      rawEvent.resultLine = t("tie_end_winner", { name: aName, aVotes, bVotes });
    } else if (winner === "b") {
      rawEvent.winnerSide = "b";
      rawEvent.resultLine = t("tie_end_winner", { name: bName, aVotes, bVotes });
    } else {
      rawEvent.winnerSide = null;
      rawEvent.resultLine = t("tie_end_draw", { aVotes, bVotes });
    }

    // Clear any UI-only notes when the outcome is locked
    rawEvent.uiNote = "";
    return true;
  }

  // PUBLIC: scroll to event by eventId (used from chat SYS bubbles)
  UI.scrollToEvent = (eventId) => {
    return scrollToEventCard(eventId);
  };

  // PUBLIC: allow other modules to focus a particular event
  UI.scrollToEventByBattleId = (battleId) => {
    if (!battleId) return false;
    const list = getEventsList();
    const rawFound = list.find(x => getEventBattleId(x) === battleId);
    if (!rawFound) return false;

    const ne = normalizeEvent(rawFound);
    // IMPORTANT: normalizeEvent may generate an id if raw event has none
    return scrollToEventCard(ne.id);
  };

  UI.renderEvents = () => {
    const body = $("eventsBody");
    const header = $("eventsHeader");
    if (!body || !header) return;

    // IMPORTANT: Do NOT call Events.tick() here!
    // It causes infinite loop: renderEvents → tick → simulateVotes → requestRender → renderEvents...
    // Events.tick() is called by ui-loops.js on a safe timer instead.
    // Only finalize expired events (read-only check, no render trigger).
    try {
      if (Game.Events && typeof Game.Events.finalizeExpired === "function") Game.Events.finalizeExpired();
    } catch (_) {}

    const rootBlock = getEventsRootBlock(header);
    const size = getEventsSize();
    applyEventsSizeClass(rootBlock, size);
    if (rootBlock) rootBlock.classList.remove("hidden");

    // Ensure header right controls exist (size cycler + close)
    // We do not rely on innerHTML of header to avoid ломать структуру.
    let right = header.querySelector(".righty");
    if (!right) {
      right = document.createElement("div");
      right.className = "righty";
      header.appendChild(right);
    }
    // Ensure a dedicated title node (avoid clobbering .righty and causing layout flicker)
    let titleEl = header.querySelector(".eventsTitle");
    if (!titleEl) {
      titleEl = document.createElement("div");
      titleEl.className = "eventsTitle";
      // Put title before right controls
      header.insertBefore(titleEl, right);
    } else if (titleEl.parentNode !== header) {
      header.insertBefore(titleEl, right);
    }

    if (!right.__controlsBuilt) {
      right.__controlsBuilt = true;
      right.textContent = "";
    }
    try {
      const legacyClose = document.getElementById("eventsCloseX");
      if (legacyClose) legacyClose.remove();
    } catch (_) {}

    const setSize = (next) => {
      setEventsSize(next);
      if (next === "collapsed") body.classList.add("hidden");
      else body.classList.remove("hidden");
      try {
        if (UI && typeof UI.setEventsCollapsed === "function") UI.setEventsCollapsed(next === "collapsed");
        else { S.flags = S.flags || {}; S.flags.eventsCollapsed = (next === "collapsed"); }
      } catch(_) {}
      rerenderEventsOnly();
    };

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

    const btnCollapse = ensureBtn("eventsBtnCollapse", "—", "Свернуть", (ev) => { stop(ev); setSize("collapsed"); });
    const btnMax = ensureBtn("eventsBtnMax", "□", "Развернуть", (ev) => { stop(ev); setSize("max"); });
    const btnMed = ensureBtn("eventsBtnMed", "⧉", "Стандартный размер", (ev) => { stop(ev); setSize("medium"); });

    try {
      const cur = getEventsSize();
      btnCollapse.classList.toggle("is-active", cur === "collapsed");
      btnMed.classList.toggle("is-active", cur === "medium");
      btnMax.classList.toggle("is-active", cur === "max");
    } catch(_) {}

    header.onclick = (ev) => {
      const t = ev && ev.target;
      if (t && (t.tagName === "BUTTON" || t.closest("button"))) return;
    };

    // Only open events (свои + чужие)
    const raw = getEventsList();
    const open = raw
      .filter(e => e && !e.closed)
      .filter(e => {
        const kind = e.kind || e.type || e.result || e.status;
        const isCrowd = (kind === "draw" || kind === "tie" || kind === "escape");
        if (!isCrowd) return true;
        return !isMyEvent(e);
      })
      .map(normalizeEvent);

    // Keep the Events panel updating while crowd voting is active (NPC votes should continue after player vote)
    scheduleEventsAutoRefresh(open);

    // My events first, then newest
    open.sort((a, b) => {
      const am = isMyEvent(a) ? 1 : 0;
      const bm = isMyEvent(b) ? 1 : 0;
      if (am !== bm) return bm - am;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

    // Update header title (do not overwrite controls)
    if (titleEl) {
      const nextTitle = t("events_title", { count: open.length });
      if (titleEl.textContent !== nextTitle) titleEl.textContent = nextTitle;
    }

    // Persist count to flags for other UI blocks (if needed)
    try {
      if (Game && Game.StateAPI && typeof Game.StateAPI.setEventCount === "function") {
        Game.StateAPI.setEventCount(open.length);
      } else {
        S.flags = S.flags || {};
        S.flags.eventCount = open.length;
      }
    } catch (_) {}

    body.innerHTML = "";

    // Close / clear workflow (dynamic: active vs resolved vs empty)
    const activeCount = open.filter(e => e && !e.resolved).length;
    const resolvedCount = open.filter(e => e && e.resolved).length;

    if (activeCount > 0) {
      const topRow = document.createElement("div");
      topRow.className = "eventRow";
      const btn = document.createElement("button");
      btn.className = "miniBtn danger";
      btn.textContent = t("events_close_extra");
      btn.onclick = () => {
        // Close resolved only
        if (Array.isArray(S.events)) {
          S.events.forEach(e => {
            if (e && !e.closed && e.resolved) e.closed = true;
          });
        }
        rerenderEventsOnly();
      };
      topRow.appendChild(btn);
      body.appendChild(topRow);
    } else if (resolvedCount > 0) {
      const topRow = document.createElement("div");
      topRow.className = "eventRow";
      const btn = document.createElement("button");
      btn.className = "miniBtn danger";
      btn.textContent = t("events_clear_all");
      btn.onclick = () => {
        if (Array.isArray(S.events)) {
          S.events.forEach(e => { if (e) e.closed = true; });
        }
        rerenderEventsOnly();
      };
      topRow.appendChild(btn);
      body.appendChild(topRow);
    }

    const renderOne = (ne) => {
      const e = ne.raw; // original reference (so buttons can mutate)
      const aName = (UI && typeof UI.displayNameByIdOrName === "function")
        ? (UI.displayNameByIdOrName(ne?.a?.id || ne?.a?.name) || ne?.a?.name || "???")
        : (ne?.a?.name || "???");
      const bName = (UI && typeof UI.displayNameByIdOrName === "function")
        ? (UI.displayNameByIdOrName(ne?.b?.id || ne?.b?.name) || ne?.b?.name || "???")
        : (ne?.b?.name || "???");

      // Ensure crowd state exists if this event supports voting
      if (ne.crowd) getCrowdState(e);

      const card = document.createElement("div");
      card.className = "eventCard";
      card.dataset.eventId = ne.id;
      if (ne.battleId) card.dataset.battleId = ne.battleId;

      card.onclick = (ev) => {
        const t = ev.target;
        if (t && (t.tagName === "BUTTON" || t.closest("button"))) return;

        highlightEvent(ne.id);
        setActiveEventId(ne.id);

        if (ne.battleId && Game.UI && typeof Game.UI.focusBattle === "function") {
          Game.UI.focusBattle(ne.battleId);
        }

        rerenderEventsOnly();
      };

      // If the vote timer expired, lock the result on the raw event before rendering.
      finalizeEventIfExpired(e, ne);

      // Fallback: if escape event reached end but still not resolved, resolve locally for UI.
      if (ne.voteLabels && ne.escapeMode && e && !e.resolved) {
        const endAt = (typeof e.endsAt === "number") ? e.endsAt : ne.endsAt;
        if (Number.isFinite(endAt) && Date.now() >= endAt) {
          const { winner } = computeCrowdWinner(e);
          if (winner) {
            e.resolved = true;
            e.state = "resolved";
            e.resultLine = escapeResultLine(ne, e);
          }
        }
      }

      const resolvedNow = !!(e && e.resolved);
      const endsAtNow = (e && typeof e.endsAt === "number") ? e.endsAt : ne.endsAt;
      const sec = resolvedNow ? 0 : Math.max(0, Math.ceil((endsAtNow - Date.now()) / 1000));
      const metaText = resolvedNow ? "" : t("events_left", { sec });

      card.innerHTML = `
        <div class="eventTop">
          <div class="title">${escapeHtml(ne.title)}</div>
          <div class="meta">${escapeHtml(metaText)}</div>
        </div>
      `;

      if (ne.voteLabels && ne.a && ne.b) {
        const who = document.createElement("div");
        who.className = "pill";
        who.textContent = `${aName} [${ne.a.influence}] vs ${bName} [${ne.b.influence}]`;
        card.appendChild(who);
      }

      // Crowd vote UI (clickable names + counters)
      if (ne.crowd && !resolvedNow && sec > 0) {
        const crowd = getCrowdState(e);
        const aVotes = Number.isFinite(crowd.aVotes) ? crowd.aVotes : 0;
        const bVotes = Number.isFinite(crowd.bVotes) ? crowd.bVotes : 0;

        const hint = document.createElement("div");
        hint.className = "pill";
        if (ne.voteLabels && ne.escapeMode) {
          hint.textContent = (ne.escapeMode === "off")
            ? `Послать ${bName}?`
            : `Дашь ${aName} смыться?`;
        } else {
          hint.textContent = t("tie_click_name_hint");
        }
        card.appendChild(hint);

        const row = document.createElement("div");
        row.className = "eventVoteRow";

        const meId = (S && S.me && S.me.id) ? S.me.id : "me";
        const myPick = crowd.voters && crowd.voters[meId] ? crowd.voters[meId] : null;
        const votingAllowed = canVoteOnEvent(ne, e);

      const mkSideBtn = (side, label, votes) => {
        const slot = document.createElement("div");
        slot.style.position = "relative";
        slot.style.display = "inline-block";

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "eventVoteBtn";
        btn.style.cursor = "pointer";
        btn.textContent = `${label} - ${votes}`;
        btn.setAttribute("data-side", side);
        btn.__toastHost = slot;

        // Visual state: picked vs locked
        if (myPick === side) btn.classList.add("selected");

        // After the player vote, BOTH buttons should look greyed (locked).
        // This must NOT stop NPC voting (NPC voting is time-based in Events tick).
        if (!votingAllowed) {
          btn.classList.add("is-disabled");
          btn.setAttribute("aria-disabled", "true");
          // Disable click interaction for the player (one vote only)
          btn.disabled = true;
        } else {
          btn.classList.remove("is-disabled");
          btn.removeAttribute("aria-disabled");
          btn.disabled = false;
        }

        // Make the picked side visibly distinct even when locked/disabled
        if (myPick === side) {
          btn.classList.add("selected");
        } else {
          btn.classList.remove("selected");
        }

        btn.onclick = (ev) => {
          stop(ev);
          if (btn.disabled) return;
          if (UI) UI._eventsClickHold = Date.now() + 420;

          // If no points, show local toast under the button and do nothing.
          // Prefer authoritative source: Game.State.me (may be updated by core/econ).
          const havePts = (Game && Game.State && Game.State.me && Number.isFinite(Game.State.me.points))
            ? (Game.State.me.points | 0)
            : ((S && S.me && Number.isFinite(S.me.points)) ? (S.me.points | 0) : 0);
          if (havePts <= 0) {
            const msg = "Не хватает пойнтов.";
            try { showVoteBtnToast(btn, msg); } catch (_) {}
            try { if (UI && typeof UI.showStatToast === "function") UI.showStatToast("points", msg); } catch(_) {}
            return;
          }

          // One vote per player: lock only the player, never stop NPC voting.
          if (!canVoteOnEvent(ne, e)) {
            const secLeft = Math.max(0, Math.ceil((ne.endsAt - Date.now()) / 1000));
            setEventNote(e, secLeft <= 0 ? "Всё, тайм-аут." : "Ты уже проголосовал.");
            // Prefer a soft render to avoid click flicker
            if (UI && typeof UI.requestRenderAll === "function") UI.requestRenderAll();
            else rerenderEventsOnly();
            return;
          }

          // IMPORTANT: route the vote through Game.Events if available (single source of truth)
          const eventId = (e && e.id) ? e.id : (ne.id || null);
          let ok = false;
          try {
            if (Game && Game.Events && typeof Game.Events.helpEvent === "function") {
              ok = !!Game.Events.helpEvent(eventId, side);
              // Sync local state from Game.State immediately after vote
              if (ok && Game.State && Array.isArray(Game.State.events)) {
                const freshEvent = Game.State.events.find(x => x.id === eventId);
                if (freshEvent && freshEvent.crowd) {
                  const crowdLocal = getCrowdState(e);
                  if (crowdLocal) {
                    crowdLocal.voters = freshEvent.crowd.voters || {};
                    crowdLocal.aVotes = freshEvent.crowd.aVotes | 0;
                    crowdLocal.bVotes = freshEvent.crowd.bVotes | 0;
                    crowdLocal.votesA = freshEvent.crowd.votesA | 0;
                    crowdLocal.votesB = freshEvent.crowd.votesB | 0;
                  }
                }
              }
            } else {
              ok = !!voteForSide(e, side);
            }
          } catch (_) {
            ok = false;
          }

          if (!ok) {
            // Show "Не хватает пойнтов." when vote failed due to insufficient points
            try {
              if (Game && Game.State && Array.isArray(Game.State.events)) {
                const freshEvent = Game.State.events.find(x => x && x.id === eventId);
                if (freshEvent && String(freshEvent.note || "") === "Не хватает пойнтов.") {
                  setEventNote(e, "Не хватает пойнтов.");
                  try { showVoteBtnToast(btn, "Не хватает пойнтов."); } catch (_) {}
                  try { if (UI && typeof UI.showStatToast === "function") UI.showStatToast("points", "Не хватает пойнтов."); } catch(_) {}
                }
              }
            } catch (_) {}
          }

          // Sync battle crowd data from Game.State.battles before render
          if (ok && Game && Game.State && Array.isArray(Game.State.battles)) {
            const battleId = (e && e.battleId) || (ne && ne.battleId) || null;
            if (battleId) {
              const freshBattle = Game.State.battles.find(x => x.id === battleId);
              const localBattle = S && Array.isArray(S.battles) ? S.battles.find(x => x.id === battleId) : null;
              if (freshBattle && localBattle && freshBattle.crowd) {
                localBattle.crowd = localBattle.crowd || {};
                localBattle.crowd.votesA = freshBattle.crowd.votesA | 0;
                localBattle.crowd.votesB = freshBattle.crowd.votesB | 0;
                localBattle.crowd.voters = freshBattle.crowd.voters || {};
              }
            }
          }

          // Immediate synchronous render for battles to show vote counts instantly (fixes DUM-009)
          if (UI && typeof UI.renderBattles === "function") UI.renderBattles();
          
          // Prefer a soft render to avoid re-entrant synchronous rerenders ("need to click twice")
          if (UI && typeof UI.requestRenderAll === "function") UI.requestRenderAll();
          else rerenderEventsOnly();
        };

        slot.appendChild(btn);
        return slot;
      };

        const useLabels = !!(ne.voteLabels && ne.voteLabels.a && ne.voteLabels.b);
        const aLabel = useLabels ? ne.voteLabels.a : `${aName} [${ne.a.influence}]`;
        const bLabel = useLabels ? ne.voteLabels.b : `${bName} [${ne.b.influence}]`;

        row.appendChild(mkSideBtn("a", aLabel, aVotes));
        row.appendChild(mkSideBtn("b", bLabel, bVotes));
        card.appendChild(row);

        const D0 = Game.Data || {};
        const extraCost = Number.isFinite(D0.COST_CROWD_EXTRA_VOTE) ? (D0.COST_CROWD_EXTRA_VOTE | 0) : 2;
        // Removed "Недоступно" buttons - they are not displayed anymore
      }

      // In-card note (no chat spam)
      if (e && e.uiNote) {
        const note = document.createElement("div");
        note.className = "noteLine";
        note.textContent = e.uiNote;
        card.appendChild(note);
      }

      if (resolvedNow) {
        const crowd = getCrowdState(e);
        const aVotes = Number.isFinite(crowd.aVotes) ? crowd.aVotes : 0;
        const bVotes = Number.isFinite(crowd.bVotes) ? crowd.bVotes : 0;
        const winnerSide = (e && e.crowd && e.crowd.winner) ? e.crowd.winner : computeCrowdWinner(e).winner;

        const info = document.createElement("div");
        info.className = "noteLine";
        info.style.marginTop = "4px";
        info.style.borderTop = "1px solid rgba(255,255,255,0.1)";
        info.style.paddingTop = "4px";

        // Твой выбор
        if (e && e.playerVoted && e.myVote) {
          const useLabels = !!(ne.voteLabels && ne.voteLabels.a && ne.voteLabels.b);
          const myChoiceLabel = (e.myVote === "a")
            ? (useLabels ? ne.voteLabels.a : aName)
            : (useLabels ? ne.voteLabels.b : bName);
          const row = document.createElement("div");
          row.textContent = `Твой выбор: ${myChoiceLabel}`;
          info.appendChild(row);
        }

        // Итог голосования: X:Y (always)
        {
          const row = document.createElement("div");
          row.textContent = `Итог голосования: ${aVotes}:${bVotes}`;
          info.appendChild(row);
        }

        // Результат: <...> (escape events use canonical phrasing)
        {
          let resLine = (e && (e.resultLine || e.result || e.resultText)) ? String(e.resultLine || e.result || e.resultText) : "";
          if (ne.voteLabels && ne.escapeMode) {
            resLine = escapeResultLine(ne, e);
          }
          const row = document.createElement("div");
          row.textContent = `Результат: ${resLine || "—"}`;
          info.appendChild(row);
        }

        // Deltas for player vote (participation -> result)
        if (e && e.playerVoted && e.myVote) {
          const sep = document.createElement("div");
          sep.style.marginTop = "6px";
          info.appendChild(sep);

          const head1 = document.createElement("div");
          head1.textContent = "Изменения за участие:";
          info.appendChild(head1);

          const d1a = document.createElement("div");
          d1a.textContent = "+1⭐";
          info.appendChild(d1a);

          const d1b = document.createElement("div");
          d1b.textContent = "-1💰";
          info.appendChild(d1b);

          const head2 = document.createElement("div");
          head2.style.marginTop = "6px";
          head2.textContent = "Изменения за результат:";
          info.appendChild(head2);

          const win = (winnerSide && e.myVote === winnerSide);
          const d2 = document.createElement("div");
          d2.textContent = win ? "+1💰" : "+0💰";
          info.appendChild(d2);
        }

        card.appendChild(info);
      }

      const hlId = getHighlightEventId();
      if (hlId && hlId === ne.id) {
        card.style.outline = "2px solid rgba(191,195,255,0.65)";
        card.style.boxShadow = "0 0 0 4px rgba(191,195,255,0.10)";
      }

      const activeId = getActiveEventId();
      if (activeId && activeId === ne.id) {
        card.classList.add("eventCard--active");
      }

      body.appendChild(card);
    };

    if (open.length) {
      open.forEach(renderOne);
    } else {
      const empty = document.createElement("div");
      empty.className = "pill";
      empty.textContent = t("events_empty");
      body.appendChild(empty);
    }

    try { if (UI && typeof UI.updateRightScroll === "function") UI.updateRightScroll(); } catch (_) {}
  };

  // Hook from chat/battles: try to focus the corresponding Event if it exists.
  // NOTE: we DO NOT create Events for my own ties.
  UI.signalTieFromBattle = (battleId) => {
    if (!battleId) return;
    // Only focus if the corresponding Event exists (we do NOT create events here)
    UI.scrollToEventByBattleId(battleId);
  };

})();
