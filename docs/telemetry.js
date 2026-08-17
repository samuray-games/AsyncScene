// Privacy-safe behavioral telemetry for real player sessions.
// No DOM input, free-form player text, URL/query values, or hidden profile data are collected.
// The sole text exception is the short gameplay nickname explicitly accepted on the visible start screen.
window.Game = window.Game || {};

(() => {
  "use strict";

  const Game = window.Game;
  if (Game.Telemetry && Game.Telemetry.schemaVersion === 1) return;

  const SCHEMA_VERSION = 1;
  const STORE_VERSION = 1;
  const STORAGE_KEY = "AsyncScene_behavioral_telemetry_v1";
  const IDENTITY_KEY = "AsyncScene_behavioral_telemetry_anonymous_v1";
  const SESSION_KEY = "AsyncScene_behavioral_telemetry_session_v1";
  const ACTIVE_SESSIONS_KEY = "AsyncScene_behavioral_telemetry_active_sessions_v1";
  const MAX_EVENTS = 1000;
  const MAX_EVENT_AGE_MS = 30 * 24 * 60 * 60 * 1000;
  const BATCH_SIZE = 50;
  const MAX_SESSION_METADATA = 50;
  const MAX_RETRY_ATTEMPTS = 6;
  const RETRY_BASE_MS = 2000;
  const ALLOWED_TYPES = new Set([
    "session_start", "session_end",
    "screen_enter", "screen_exit",
    "modal_open", "modal_close",
    "button_click", "action",
    "choice_selected", "state_changed",
    "question_shown", "question_answered",
    "visibility_hidden", "visibility_visible",
    "abandon", "return",
    "cycle_started", "cycle_completed",
  ]);
  const BLOCKED_KEY = /(text|message|content|input|secret|token|password|email|phone|url|href|name|birth|age|query|search|hash)/i;
  const SAFE_ID = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,119}$/;
  const GAMEPLAY_NICKNAME = /^[\p{L}\p{N}][\p{L}\p{N} ._-]{0,23}$/u;

  const local = safeStorage("localStorage");
  const session = safeStorage("sessionStorage");
  const pageViewId = makeId("page");
  const pageStartedAt = Date.now();
  const pageStartedMono = monotonicNow();
  let anonymousId = readOrCreateAnonymousId();
  let sessionId = readOrCreateSessionId();
  let sequence = 0;
  let firstActionAt = null;
  let foregroundStartedMono = document.hidden ? null : monotonicNow();
  let foregroundElapsedMs = 0;
  let hiddenAt = document.hidden ? Date.now() : null;
  let activeScreen = null;
  let activeModal = null;
  let activeQuestion = null;
  let cycle = null;
  let flushTimer = null;
  let flushInFlight = null;
  let retryAttempt = 0;
  let installed = false;
  let ending = false;

  function safeStorage(name) {
    try {
      const storage = window[name];
      if (!storage) return null;
      const probe = `__asynchronia_telemetry_probe_${name}`;
      storage.setItem(probe, "1");
      storage.removeItem(probe);
      return storage;
    } catch (_) {
      return null;
    }
  }

  function monotonicNow() {
    return (window.performance && typeof window.performance.now === "function")
      ? window.performance.now()
      : Date.now();
  }

  function makeId(prefix) {
    try {
      if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return `${prefix}:${window.crypto.randomUUID()}`;
      }
      if (window.crypto && typeof window.crypto.getRandomValues === "function") {
        const bytes = new Uint32Array(4);
        window.crypto.getRandomValues(bytes);
        return `${prefix}:${Array.from(bytes).map((value) => value.toString(16).padStart(8, "0")).join("")}`;
      }
    } catch (_) {}
    return `${prefix}:${Date.now().toString(36)}:${Math.random().toString(36).slice(2, 14)}`;
  }

  function readJson(storage, key, fallback) {
    if (!storage) return fallback;
    try {
      const raw = storage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function writeJson(storage, key, value) {
    if (!storage) return false;
    try {
      storage.setItem(key, JSON.stringify(value));
      return true;
    } catch (_) {
      return false;
    }
  }

  function readOrCreateAnonymousId() {
    let value = local ? String(local.getItem(IDENTITY_KEY) || "") : "";
    if (!SAFE_ID.test(value)) {
      value = makeId("anon");
      try { if (local) local.setItem(IDENTITY_KEY, value); } catch (_) {}
    }
    return value;
  }

  function readOrCreateSessionId() {
    const saved = readJson(session, SESSION_KEY, null);
    if (saved && SAFE_ID.test(String(saved.sessionId || ""))) {
      return String(saved.sessionId);
    }
    const value = makeId("session");
    writeJson(session, SESSION_KEY, { sessionId: value, createdAt: Date.now(), ended: false });
    return value;
  }

  function emptyStore() {
    return { storeVersion: STORE_VERSION, schemaVersion: SCHEMA_VERSION, events: [], pendingBatches: [], sessionMetadata: {} };
  }

  function loadStore() {
    const raw = readJson(local, STORAGE_KEY, null);
    if (!raw || raw.storeVersion !== STORE_VERSION || !Array.isArray(raw.events)) return emptyStore();
    const cutoff = Date.now() - MAX_EVENT_AGE_MS;
    raw.events = raw.events.filter((event) => event && Number(event.occurredAt) >= cutoff).slice(-MAX_EVENTS);
    raw.pendingBatches = Array.isArray(raw.pendingBatches) ? raw.pendingBatches.slice(-40) : [];
    raw.sessionMetadata = raw.sessionMetadata && typeof raw.sessionMetadata === "object" && !Array.isArray(raw.sessionMetadata)
      ? raw.sessionMetadata
      : {};
    return raw;
  }

  function saveStore(store) {
    store.events = Array.isArray(store.events) ? store.events.slice(-MAX_EVENTS) : [];
    store.pendingBatches = Array.isArray(store.pendingBatches) ? store.pendingBatches.slice(-40) : [];
    store.sessionMetadata = store.sessionMetadata && typeof store.sessionMetadata === "object" && !Array.isArray(store.sessionMetadata)
      ? store.sessionMetadata
      : {};
    return writeJson(local, STORAGE_KEY, store);
  }

  function loadActiveSessions() {
    const raw = readJson(local, ACTIVE_SESSIONS_KEY, null);
    const sessions = raw && raw.schemaVersion === SCHEMA_VERSION && raw.sessions && typeof raw.sessions === "object"
      ? raw.sessions
      : {};
    const cutoff = Date.now() - MAX_EVENT_AGE_MS;
    Object.keys(sessions).forEach((id) => {
      if (!sessions[id] || Number(sessions[id].lastSeenAt || 0) < cutoff) delete sessions[id];
    });
    return { schemaVersion: SCHEMA_VERSION, sessions };
  }

  function stableId(value) {
    const normalized = String(value || "").trim().slice(0, 120);
    return SAFE_ID.test(normalized) ? normalized : null;
  }

  function gameplayNickname(value) {
    const nickname = String(value || "").trim().replace(/\s+/g, " ");
    return GAMEPLAY_NICKNAME.test(nickname) ? nickname : null;
  }

  function sessionMetadataFor(events, store) {
    const bySession = store && store.sessionMetadata && typeof store.sessionMetadata === "object"
      ? store.sessionMetadata
      : {};
    const seen = new Set();
    const rows = [];
    for (const event of events) {
      const sessionId = stableId(event && event.sessionId);
      if (!sessionId || seen.has(sessionId)) continue;
      seen.add(sessionId);
      const nickname = gameplayNickname(bySession[sessionId] && bySession[sessionId].nickname);
      if (nickname) rows.push({ sessionId, nickname });
      if (rows.length >= MAX_SESSION_METADATA) break;
    }
    return rows;
  }

  function safeValue(value) {
    if (value === null || value === undefined) return null;
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    if (typeof value === "string") return stableId(value);
    return null;
  }

  function sanitizePayload(payload) {
    const clean = {};
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return clean;
    Object.keys(payload).sort().forEach((key) => {
      if (!SAFE_ID.test(key) || BLOCKED_KEY.test(key)) return;
      const value = safeValue(payload[key]);
      if (value !== null) clean[key] = value;
    });
    return clean;
  }

  function currentForegroundMs(nowMono) {
    const now = Number.isFinite(nowMono) ? nowMono : monotonicNow();
    return Math.max(0, Math.round(foregroundElapsedMs + (foregroundStartedMono === null ? 0 : now - foregroundStartedMono)));
  }

  function contextSnapshot() {
    const context = {};
    if (activeScreen && activeScreen.id) context.screenId = activeScreen.id;
    if (activeModal && activeModal.id) context.modalId = activeModal.id;
    if (activeQuestion && activeQuestion.id) context.questionId = activeQuestion.id;
    if (cycle && cycle.id) context.cycleId = cycle.id;
    return context;
  }

  function append(type, payload, options) {
    if (!ALLOWED_TYPES.has(type)) return null;
    const now = Date.now();
    const event = {
      schemaVersion: SCHEMA_VERSION,
      eventId: makeId("event"),
      sequence: ++sequence,
      type,
      occurredAt: now,
      monotonicMs: Math.max(0, Math.round(monotonicNow() - pageStartedMono)),
      anonymousId,
      sessionId,
      pageViewId,
      context: Object.assign(contextSnapshot(), sanitizePayload(options && options.context)),
      payload: sanitizePayload(payload),
    };
    const store = loadStore();
    store.events.push(event);
    saveStore(store);
    writeActiveSession(type, event);
    scheduleFlush();
    return event;
  }

  function writeActiveSession(type, event) {
    if (!local) return;
    const registry = loadActiveSessions();
    const active = {
      schemaVersion: SCHEMA_VERSION,
      anonymousId,
      sessionId,
      pageViewId,
      startedAt: pageStartedAt,
      lastSeenAt: event ? event.occurredAt : Date.now(),
      lastEventType: type || null,
      lastScreenId: activeScreen && activeScreen.id || null,
      lastQuestionId: activeQuestion && activeQuestion.id || null,
      lastCycleId: cycle && cycle.id || null,
      lastActionId: event && event.payload && event.payload.actionId || null,
      ended: type === "session_end",
    };
    registry.sessions[sessionId] = active;
    const recent = Object.keys(registry.sessions).map((id) => registry.sessions[id])
      .sort((left, right) => Number(right.lastSeenAt || 0) - Number(left.lastSeenAt || 0))
      .slice(0, 20);
    registry.sessions = Object.fromEntries(recent.map((item) => [item.sessionId, item]));
    writeJson(local, ACTIVE_SESSIONS_KEY, registry);
  }

  function closeTimedSurface(surface, type, reason) {
    if (!surface) return;
    const nowMono = monotonicNow();
    const dwell = Math.max(0, Math.round(surface.foregroundMs + (surface.foregroundStartedMono === null ? 0 : nowMono - surface.foregroundStartedMono)));
    const idKey = type === "screen_exit" ? "screenId" : "modalId";
    append(type, { [idKey]: surface.id, foregroundDwellMs: dwell, reason: stableId(reason || "transition") });
  }

  function setScreen(screenId, reason) {
    const id = stableId(screenId);
    if (!id || activeScreen && activeScreen.id === id) return false;
    closeTimedSurface(activeScreen, "screen_exit", reason || "transition");
    activeScreen = {
      id,
      foregroundMs: 0,
      foregroundStartedMono: document.hidden ? null : monotonicNow(),
    };
    append("screen_enter", { screenId: id, reason: stableId(reason || "transition") });
    return true;
  }

  function clearScreen(reason) {
    if (!activeScreen) return false;
    closeTimedSurface(activeScreen, "screen_exit", reason || "closed");
    activeScreen = null;
    return true;
  }

  function setModal(modalId) {
    const id = stableId(modalId);
    if (!id || activeModal && activeModal.id === id) return false;
    closeTimedSurface(activeModal, "modal_close", "transition");
    activeModal = {
      id,
      foregroundMs: 0,
      foregroundStartedMono: document.hidden ? null : monotonicNow(),
    };
    append("modal_open", { modalId: id });
    return true;
  }

  function clearModal(reason) {
    if (!activeModal) return false;
    closeTimedSurface(activeModal, "modal_close", reason || "closed");
    activeModal = null;
    return true;
  }

  function visible(element) {
    if (!element) return false;
    let current = element;
    while (current && current.nodeType === 1) {
      if (current.hidden || current.getAttribute("aria-hidden") === "true") return false;
      if (current.classList && current.classList.contains("hidden")) return false;
      try {
        const style = window.getComputedStyle ? window.getComputedStyle(current) : null;
        if (style && (style.display === "none" || style.visibility === "hidden")) return false;
      } catch (_) {}
      current = current.parentElement;
    }
    return true;
  }

  function primaryScreenId() {
    const start = document.getElementById("startScreen");
    if (visible(start)) return "start";
    const stage7 = document.getElementById("stage7FirstExperiencePanel");
    if (visible(stage7)) return stableId(stage7.getAttribute("data-telemetry-screen")) || "stage7.first_experience";
    const state = Game.__S || Game.State || null;
    const dm = document.getElementById("dmBlock");
    if (visible(dm) && state && state.dm && state.dm.open) return "dm";
    const menu = document.getElementById("menuBlock");
    if (visible(menu) && state && state.flags && state.flags.menuOpen) return "menu";
    return "main";
  }

  function modalIdFromElement(element) {
    if (!element) return null;
    return stableId(
      element.getAttribute("data-telemetry-modal")
      || element.id
      || element.getAttribute("data-testid")
      || element.getAttribute("aria-labelledby")
    );
  }

  function scanSurfaces(reason) {
    setScreen(primaryScreenId(), reason || "dom_update");
    const dialogs = Array.from(document.querySelectorAll('[role="dialog"][aria-modal="true"]'));
    const open = dialogs.find(visible);
    const nextModalId = modalIdFromElement(open);
    if (nextModalId) setModal(nextModalId);
    else clearModal("dom_update");
  }

  function actionIdentity(element) {
    if (!element) return null;
    const actionId = stableId(
      element.getAttribute("data-telemetry-action")
      || element.getAttribute("data-stage7-action")
      || element.getAttribute("data-action")
      || element.getAttribute("data-testid")
      || element.id
    );
    if (!actionId) return null;
    const elementId = stableId(element.id || element.getAttribute("data-testid") || actionId);
    return { actionId, elementId };
  }

  function handleClick(event) {
    const element = event.target && event.target.closest
      ? event.target.closest('button, [role="button"], a[data-action], [data-telemetry-action], [data-stage7-action]')
      : null;
    const identity = actionIdentity(element);
    if (!identity) return;
    const now = Date.now();
    if (firstActionAt === null) firstActionAt = now;
    append("button_click", {
      actionId: identity.actionId,
      elementId: identity.elementId,
      firstActionMs: Math.max(0, firstActionAt - pageStartedAt),
    });
  }

  function handleVisibility() {
    const now = Date.now();
    const nowMono = monotonicNow();
    if (document.hidden) {
      if (foregroundStartedMono !== null) {
        foregroundElapsedMs += Math.max(0, nowMono - foregroundStartedMono);
        foregroundStartedMono = null;
      }
      [activeScreen, activeModal, activeQuestion, cycle].forEach((timer) => {
        if (!timer || timer.foregroundStartedMono === null) return;
        timer.foregroundMs += Math.max(0, nowMono - timer.foregroundStartedMono);
        timer.foregroundStartedMono = null;
      });
      hiddenAt = now;
      append("visibility_hidden", { foregroundElapsedMs: currentForegroundMs(nowMono) });
      return;
    }
    const hiddenMs = hiddenAt === null ? 0 : Math.max(0, now - hiddenAt);
    hiddenAt = null;
    foregroundStartedMono = nowMono;
    [activeScreen, activeModal, activeQuestion, cycle].forEach((timer) => {
      if (timer) timer.foregroundStartedMono = nowMono;
    });
    append("visibility_visible", { hiddenMs, foregroundElapsedMs: currentForegroundMs(nowMono) });
    append("return", { elapsedMs: hiddenMs, reason: "visibility" });
    scanSurfaces("visibility_return");
  }

  function choiceSelected(details) {
    const payload = details || {};
    return append("choice_selected", {
      flowId: stableId(payload.flowId),
      stateId: stableId(payload.stateId),
      choiceId: stableId(payload.choiceId),
      questionId: stableId(payload.questionId),
      battleId: stableId(payload.battleId),
    });
  }

  function stateChanged(details) {
    const payload = details || {};
    return append("state_changed", {
      flowId: stableId(payload.flowId),
      fromStateId: stableId(payload.fromStateId),
      toStateId: stableId(payload.toStateId),
    });
  }

  function questionShown(details) {
    const payload = details || {};
    const questionId = stableId(payload.questionId);
    if (!questionId || activeQuestion && activeQuestion.id === questionId) return null;
    activeQuestion = {
      id: questionId,
      flowId: stableId(payload.flowId),
      foregroundMs: 0,
      foregroundStartedMono: document.hidden ? null : monotonicNow(),
    };
    return append("question_shown", { flowId: activeQuestion.flowId, questionId });
  }

  function questionAnswered(details) {
    const payload = details || {};
    const questionId = stableId(payload.questionId);
    const nowMono = monotonicNow();
    let dwell = null;
    if (activeQuestion && activeQuestion.id === questionId) {
      dwell = Math.max(0, Math.round(activeQuestion.foregroundMs + (activeQuestion.foregroundStartedMono === null ? 0 : nowMono - activeQuestion.foregroundStartedMono)));
    }
    activeQuestion = null;
    return append("question_answered", {
      flowId: stableId(payload.flowId),
      questionId,
      answerId: stableId(payload.answerId),
      foregroundDwellMs: dwell,
    });
  }

  function startCycle(details) {
    const payload = details || {};
    const cycleId = stableId(payload.cycleId);
    if (!cycleId) return null;
    cycle = {
      id: cycleId,
      flowId: stableId(payload.flowId),
      foregroundMs: 0,
      foregroundStartedMono: document.hidden ? null : monotonicNow(),
    };
    return append("cycle_started", { flowId: cycle.flowId, cycleId });
  }

  function completeCycle(details) {
    const payload = details || {};
    const cycleId = stableId(payload.cycleId) || cycle && cycle.id;
    if (!cycleId) return null;
    const nowMono = monotonicNow();
    const dwell = cycle && cycle.id === cycleId
      ? Math.max(0, Math.round(cycle.foregroundMs + (cycle.foregroundStartedMono === null ? 0 : nowMono - cycle.foregroundStartedMono)))
      : null;
    cycle = null;
    return append("cycle_completed", {
      flowId: stableId(payload.flowId),
      cycleId,
      foregroundDwellMs: dwell,
      outcomeId: stableId(payload.outcomeId),
    });
  }

  function action(actionId, details) {
    return append("action", Object.assign({ actionId: stableId(actionId) }, sanitizePayload(details)));
  }

  function transportConfig() {
    const config = window.__ASYNCHRONIA_TELEMETRY_TRANSPORT__;
    if (!config || config.enabled !== true || config.mode !== "private_friends_alpha") return null;
    try {
      const endpoint = new URL(String(config.endpoint || ""), window.location.origin);
      if (endpoint.protocol !== "https:" && endpoint.hostname !== "localhost" && endpoint.hostname !== "127.0.0.1") return null;
      if (endpoint.origin !== String(config.endpointOrigin || "")) return null;
      if (endpoint.pathname !== "/v1/events" || endpoint.search || endpoint.hash || endpoint.username || endpoint.password) return null;
      const cohortId = stableId(config.cohortId);
      if (!cohortId) return null;
      return { endpoint: endpoint.href, cohortId, mode: config.mode };
    } catch (_) {
      return null;
    }
  }

  function pendingBatch(store) {
    const unsent = new Map(store.events.filter((event) => !event.transmittedAt)
      .map((event) => [event.eventId, event]));
    store.pendingBatches = store.pendingBatches.filter((batch) => batch
      && stableId(batch.batchId)
      && Array.isArray(batch.eventIds)
      && batch.eventIds.length > 0
      && batch.eventIds.length <= BATCH_SIZE
      && batch.eventIds.every((eventId) => unsent.has(eventId)));
    if (store.pendingBatches.length) {
      const batch = store.pendingBatches[0];
      return { batch, events: batch.eventIds.map((eventId) => unsent.get(eventId)) };
    }
    const events = Array.from(unsent).map((entry) => entry[1]).slice(0, BATCH_SIZE);
    if (!events.length) return { batch: null, events: [] };
    const batch = {
      batchId: makeId("batch"),
      eventIds: events.map((event) => event.eventId),
      sessionMetadata: sessionMetadataFor(events, store),
      createdAt: Date.now(),
    };
    store.pendingBatches.push(batch);
    saveStore(store);
    return { batch, events };
  }

  function scheduleFlush(delay) {
    if (!transportConfig() || flushTimer || document.hidden) return;
    flushTimer = setTimeout(() => {
      flushTimer = null;
      flush();
    }, Number.isFinite(delay) ? delay : 1000);
  }

  async function flushOnce() {
    const config = transportConfig();
    if (!config || !navigator.onLine || typeof window.fetch !== "function") return { ok: false, reason: "transport_disabled_or_offline" };
    const store = loadStore();
    const selected = pendingBatch(store);
    const events = selected.events;
    if (!events.length) return { ok: true, sent: 0 };
    const batchId = selected.batch.batchId;
    try {
      const response = await window.fetch(config.endpoint, {
        method: "POST",
        credentials: "omit",
        cache: "no-store",
        keepalive: true,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contractVersion: 1,
          schemaVersion: SCHEMA_VERSION,
          batchId,
          mode: config.mode,
          cohortId: config.cohortId,
          sessionMetadata: Array.isArray(selected.batch.sessionMetadata) ? selected.batch.sessionMetadata : [],
          events,
        }),
      });
      if (!response || !response.ok) throw new Error(`http_${response && response.status || 0}`);
      const sentIds = new Set(events.map((event) => event.eventId));
      const latest = loadStore();
      latest.events.forEach((event) => {
        if (sentIds.has(event.eventId)) event.transmittedAt = Date.now();
      });
      latest.pendingBatches = latest.pendingBatches.filter((batch) => batch.batchId !== batchId);
      saveStore(latest);
      retryAttempt = 0;
      if (latest.events.some((event) => !event.transmittedAt)) scheduleFlush(0);
      return { ok: true, sent: events.length, batchId };
    } catch (_) {
      retryAttempt = Math.min(MAX_RETRY_ATTEMPTS, retryAttempt + 1);
      if (retryAttempt < MAX_RETRY_ATTEMPTS) {
        const delay = Math.min(60000, RETRY_BASE_MS * (2 ** (retryAttempt - 1)));
        scheduleFlush(delay);
      }
      return { ok: false, reason: "retry_scheduled", retryAttempt };
    }
  }

  function flush() {
    if (flushInFlight) return flushInFlight;
    flushInFlight = flushOnce().finally(() => { flushInFlight = null; });
    return flushInFlight;
  }

  function exportData() {
    const store = loadStore();
    return {
      exportVersion: 1,
      schemaVersion: SCHEMA_VERSION,
      exportedAt: Date.now(),
      privacy: {
        freeFormPlayerAuthoredText: false,
        voluntaryGameplayNicknameOnly: true,
        profileData: false,
        urlsOrQuery: false,
        networkTransmissionEnabled: !!transportConfig(),
        retentionDays: 30,
        maxEvents: MAX_EVENTS,
      },
      sessionMetadata: sessionMetadataFor(store.events, store),
      events: store.events.map((event) => JSON.parse(JSON.stringify(event))),
    };
  }

  function summary() {
    const events = loadStore().events;
    const counts = {};
    const screenDwellMs = {};
    const questionDwellMs = {};
    events.forEach((event) => {
      counts[event.type] = (counts[event.type] || 0) + 1;
      if (event.type === "screen_exit" && event.payload.screenId) {
        screenDwellMs[event.payload.screenId] = (screenDwellMs[event.payload.screenId] || 0) + Number(event.payload.foregroundDwellMs || 0);
      }
      if (event.type === "question_answered" && event.payload.questionId) {
        questionDwellMs[event.payload.questionId] = (questionDwellMs[event.payload.questionId] || 0) + Number(event.payload.foregroundDwellMs || 0);
      }
    });
    return { schemaVersion: SCHEMA_VERSION, eventCount: events.length, counts, screenDwellMs, questionDwellMs };
  }

  function clear(options) {
    if (local) local.removeItem(STORAGE_KEY);
    if (options && options.includeIdentity === true) {
      if (local) local.removeItem(IDENTITY_KEY);
      anonymousId = readOrCreateAnonymousId();
    }
    return true;
  }

  function rotateIdentity() {
    clear({ includeIdentity: true });
    sessionId = makeId("session");
    writeJson(session, SESSION_KEY, { sessionId, createdAt: Date.now(), ended: false });
    return anonymousId;
  }

  function finish(reason) {
    if (ending) return;
    ending = true;
    const terminalContext = contextSnapshot();
    closeTimedSurface(activeModal, "modal_close", reason || "pagehide");
    activeModal = null;
    closeTimedSurface(activeScreen, "screen_exit", reason || "pagehide");
    activeScreen = null;
    append("session_end", {
      reason: stableId(reason || "pagehide"),
      durationMs: Math.max(0, Date.now() - pageStartedAt),
      foregroundDwellMs: currentForegroundMs(),
      screenId: terminalContext.screenId,
      modalId: terminalContext.modalId,
      questionId: terminalContext.questionId,
      cycleId: terminalContext.cycleId,
    });
    writeJson(session, SESSION_KEY, { sessionId, createdAt: pageStartedAt, ended: true, endedAt: Date.now() });
    if (transportConfig()) flush();
  }

  function setGameplayNickname(value) {
    const nickname = gameplayNickname(value);
    if (!nickname) return false;
    const store = loadStore();
    const previous = gameplayNickname(store.sessionMetadata[sessionId] && store.sessionMetadata[sessionId].nickname);
    if (previous === nickname) return true;
    store.sessionMetadata[sessionId] = { nickname, updatedAt: Date.now() };
    saveStore(store);
    append("action", { actionId: "player_nickname_set" });
    return true;
  }

  function install() {
    if (installed) return;
    installed = true;
    const previous = loadActiveSessions().sessions[sessionId] || null;
    const returnVisit = !!previous || loadStore().events.length > 0;
    if (previous && previous.ended !== true && previous.pageViewId !== pageViewId) {
      append("abandon", {
        priorSessionId: stableId(previous.sessionId),
        screenId: stableId(previous.lastScreenId),
        questionId: stableId(previous.lastQuestionId),
        cycleId: stableId(previous.lastCycleId),
        elapsedMs: Math.max(0, Date.now() - Number(previous.lastSeenAt || Date.now())),
      });
      append("return", {
        priorSessionId: stableId(previous.sessionId),
        elapsedMs: Math.max(0, Date.now() - Number(previous.lastSeenAt || Date.now())),
        reason: "new_session",
      });
    }
    append("session_start", {
      returnVisit,
      transportEnabled: !!transportConfig(),
    });
    scanSurfaces("session_start");
    document.addEventListener("click", handleClick, true);
    document.addEventListener("visibilitychange", handleVisibility, true);
    window.addEventListener("pagehide", () => finish("pagehide"), true);
    window.addEventListener("pageshow", (event) => {
      if (event && event.persisted) {
        ending = false;
        append("return", { reason: "bfcache", elapsedMs: 0 });
        scanSurfaces("bfcache_return");
      }
    }, true);
    window.addEventListener("online", () => scheduleFlush(0), true);
    window.addEventListener("stage7:player-entered-game", () => scanSurfaces("player_entered_game"), true);
    if (typeof MutationObserver === "function") {
      const observer = new MutationObserver(() => scanSurfaces("dom_update"));
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class", "hidden", "aria-hidden", "aria-modal", "data-telemetry-screen", "data-telemetry-modal"],
        childList: true,
        subtree: true,
      });
    }
    scheduleFlush();
  }

  Game.Telemetry = Object.freeze({
    schemaVersion: SCHEMA_VERSION,
    policy: Object.freeze({
      localStorageKey: STORAGE_KEY,
      maxEvents: MAX_EVENTS,
      retentionDays: 30,
      batchSize: BATCH_SIZE,
      networkTransmissionDefault: false,
      freeFormPlayerAuthoredText: false,
      voluntaryGameplayNicknameOnly: true,
      profileData: false,
      privateFriendsAlphaTransportOnly: true,
      credentialsOrCookies: false,
    }),
    install,
    action,
    choiceSelected,
    stateChanged,
    questionShown,
    questionAnswered,
    startCycle,
    completeCycle,
    setGameplayNickname,
    setScreen,
    clearScreen,
    setModal,
    clearModal,
    flush,
    export: exportData,
    getEvents: () => exportData().events,
    summary,
    clear,
    rotateIdentity,
    finish,
    inspect: () => ({
      schemaVersion: SCHEMA_VERSION,
      anonymousId,
      sessionId,
      pageViewId,
      activeScreenId: activeScreen && activeScreen.id || null,
      activeModalId: activeModal && activeModal.id || null,
      foregroundElapsedMs: currentForegroundMs(),
      transportEnabled: !!transportConfig(),
      eventCount: loadStore().events.length,
    }),
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
