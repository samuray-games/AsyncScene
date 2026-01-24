// state.js
window.Game = window.Game || {};

(() => {
  const Game = window.Game;

  // Avoid capturing Util/Data too early: other scripts may load after state.js.
  // Always resolve dependencies at call-time and provide safe fallbacks.
  const getUtil = () => Game.Util || {};
  const nowHHMM = () => {
    const U = getUtil();
    if (typeof U.nowHHMM === "function") return U.nowHHMM();
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  };
  const safeId = () => {
    const U = getUtil();
    if (typeof U.safeId === "function") return U.safeId();
    return `id_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  };

  function getProgression() {
    const P = (Game.Data && Game.Data.PROGRESSION) ? Game.Data.PROGRESSION : null;
    const unlock = (P && P.unlockInfluence) ? P.unlockInfluence : null;
    const strong = (unlock && Number.isFinite(unlock.strong)) ? (unlock.strong | 0) : 5;
    const power = (unlock && Number.isFinite(unlock.power)) ? (unlock.power | 0) : 10;
    const absolute = (unlock && Number.isFinite(unlock.absolute)) ? (unlock.absolute | 0) : 100;
    return {
      strong: Math.max(0, strong),
      power: Math.max(0, power),
      absolute: Math.max(0, absolute),
    };
  }

  function getRepConfig(){
    const D = (Game && Game.Data) ? Game.Data : null;
    const REP_WIN = (D && Number.isFinite(D.REP_WIN)) ? (D.REP_WIN | 0) : 2;
    const REP_DRAW = (D && Number.isFinite(D.REP_DRAW)) ? (D.REP_DRAW | 0) : 1;
    const REP_TIE_HELP = (D && Number.isFinite(D.REP_TIE_HELP)) ? (D.REP_TIE_HELP | 0) : 1;
    const REP_DAILY = (D && Number.isFinite(D.REP_DAILY)) ? (D.REP_DAILY | 0) : 1;
    const INF_BASE = (D && Number.isFinite(D.INF_BASE_COST)) ? (D.INF_BASE_COST | 0) : 12;
    const INF_PER = (D && Number.isFinite(D.INF_PER_LEVEL)) ? (D.INF_PER_LEVEL | 0) : 4;
    const WEEKLY_SOFTCAP = (D && Number.isFinite(D.WEEKLY_SOFTCAP)) ? (D.WEEKLY_SOFTCAP | 0) : 2;
    const SOFTCAP_MULT = (D && Number.isFinite(D.SOFTCAP_MULT)) ? (D.SOFTCAP_MULT | 0) : 2;
    return {
      REP_WIN,
      REP_DRAW,
      REP_TIE_HELP,
      REP_DAILY,
      INF_BASE: Math.max(1, INF_BASE),
      INF_PER: Math.max(0, INF_PER),
      WEEKLY_SOFTCAP: Math.max(0, WEEKLY_SOFTCAP),
      SOFTCAP_MULT: Math.max(1, SOFTCAP_MULT),
    };
  }

  function ensureProgress(){
    if (!State.progress || typeof State.progress !== "object") {
      State.progress = { weeklyInfluenceGained: 0, weekStartAt: 0, lastDailyBonusAt: 0 };
    }
    if (!Number.isFinite(State.progress.weeklyInfluenceGained)) State.progress.weeklyInfluenceGained = 0;
    if (!Number.isFinite(State.progress.weekStartAt)) State.progress.weekStartAt = 0;
    if (!Number.isFinite(State.progress.lastDailyBonusAt)) State.progress.lastDailyBonusAt = 0;
  }

  function normalizeWeek(){
    ensureProgress();
    const now = Date.now();
    const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    if (!State.progress.weekStartAt) {
      State.progress.weekStartAt = now;
      State.progress.weeklyInfluenceGained = 0;
      return;
    }
    if ((now - State.progress.weekStartAt) >= WEEK_MS) {
      State.progress.weekStartAt = now;
      State.progress.weeklyInfluenceGained = 0;
    }
  }

  function repNeedForNextInfluence(){
    normalizeWeek();
    const cfg = getRepConfig();
    const progV2 = !!(Game && Game.Data && Game.Data.PROGRESSION_V2);
    const inf = Number(State.me.influence || 0);
    let need = cfg.INF_BASE + (cfg.INF_PER * (inf | 0));
    if (progV2) {
      const cap = cfg.WEEKLY_SOFTCAP;
      if (cap > 0) {
        const over = (State.progress.weeklyInfluenceGained | 0) - cap + 1;
        if (over > 0) {
          const ratio = Math.min(1, over / cap);
          const mult = 1 + ratio * (cfg.SOFTCAP_MULT - 1);
          need = Math.ceil(need * mult);
        }
      }
    } else if (State.progress.weeklyInfluenceGained >= cfg.WEEKLY_SOFTCAP) {
      need = need * cfg.SOFTCAP_MULT;
    }
    return Math.max(1, need | 0);
  }

  function weeklyCapActive(){
    normalizeWeek();
    const cfg = getRepConfig();
    return State.progress.weeklyInfluenceGained >= cfg.WEEKLY_SOFTCAP;
  }

  function applyRepConversion(){
    normalizeWeek();
    const cfg = getRepConfig();
    const before = (State.me.influence | 0);
    let loops = 0;
    while ((State.rep | 0) >= repNeedForNextInfluence()) {
      const need = repNeedForNextInfluence();
      State.rep = (State.rep | 0) - need;
      State.me.influence = (State.me.influence | 0) + 1;
      State.progress.weeklyInfluenceGained = (State.progress.weeklyInfluenceGained | 0) + 1;
      loops++;
      if (loops > 50) break;
    }
    // UI side-effects are out-of-scope for state layer.
  }

  function addRep(amount, reason){
    if (!isDevFlag()) {
      try { console.warn("[REP] addRep blocked in prod", reason); } catch (_) {}
      return 0;
    }
    const n = Number(amount || 0);
    if (!Number.isFinite(n) || n === 0) return 0;
    if (!Number.isFinite(State.rep)) State.rep = 0;
    State.rep = (State.rep | 0) + (n | 0);
    applyRepConversion();
    syncMeToPlayers();
    return State.rep | 0;
  }

  function getRepAccount(id){
    if (!id) return null;
    if (id === "crowd_pool" || id === "daily_pool") {
      if (!Game.Debug || typeof Game.Debug !== "object") Game.Debug = {};
      if (!Game.Debug.repPools || typeof Game.Debug.repPools !== "object") Game.Debug.repPools = {};
      if (!Game.Debug.repPools[id]) Game.Debug.repPools[id] = { id, rep: 1000, pool: true };
      return Game.Debug.repPools[id];
    }
    if (id === "rep_emitter") {
      return { id: "rep_emitter", rep: Number.MAX_SAFE_INTEGER, pool: true };
    }
    if (id === "me") return { id: "me", kind: "me" };
    if (!State.players) return null;
    const p = State.players[id];
    if (!p) return null;
    if (!Number.isFinite(p.rep)) p.rep = 0;
    return p;
  }

  function logRepTransfer(entry){
    const Econ = (Game && (Game.ConflictEconomy || Game._ConflictEconomy)) ? (Game.ConflictEconomy || Game._ConflictEconomy) : null;
    if (Econ && typeof Econ._logTx === "function") {
      Econ._logTx(entry);
      return;
    }
    if (!Game.Debug || typeof Game.Debug !== "object") Game.Debug = {};
    if (!Array.isArray(Game.Debug.moneyLog)) Game.Debug.moneyLog = [];
    if (!Game.Debug.moneyLogByBattle || typeof Game.Debug.moneyLogByBattle !== "object") Game.Debug.moneyLogByBattle = {};
    Game.Debug.moneyLog.push(entry);
    const bid = entry && entry.battleId ? String(entry.battleId) : "";
    if (bid) {
      if (!Array.isArray(Game.Debug.moneyLogByBattle[bid])) Game.Debug.moneyLogByBattle[bid] = [];
      Game.Debug.moneyLogByBattle[bid].push(entry);
    }
  }

  function transferRep(fromId, toId, amount, reason, battleId){
    const n = Number(amount || 0);
    if (!Number.isFinite(n) || n === 0) return { ok: false, reason: "bad_amount" };
    const fromAcc = getRepAccount(fromId);
    const toAcc = getRepAccount(toId);
    if (!fromAcc || !toAcc) return { ok: false, reason: "bad_account" };
    if (isDevFlag() && (!reason || !battleId)) {
      try { console.warn("[REP] transferRep missing reason/battleId", reason, battleId); } catch (_) {}
    }
    const beforeRep = (State.rep || 0) | 0;
    const beforeInfluence = (State.me && Number.isFinite(State.me.influence)) ? (State.me.influence | 0) : 0;
    const beforeFrom = (fromId === "me") ? (State.rep | 0) : (fromAcc.rep | 0);
    const beforeTo = (toId === "me") ? (State.rep | 0) : (toAcc.rep | 0);
    const isEmitter = (fromId === "rep_emitter");
    const amt = n | 0;
    
    // Check sufficient funds (fix DUM-022 #3)
    const available = isEmitter ? Number.MAX_SAFE_INTEGER : (beforeFrom | 0);
    if (!isEmitter && available < amt) {
      if (isDevFlag()) {
        try { console.warn("[REP] transferRep insufficient funds", { fromId, available, amt, reason }); } catch (_) {}
      }
      return { ok: false, reason: "insufficient_rep", available, requested: amt };
    }
    
    // Apply transfer with clipping to prevent negative (fix DUM-022 #2)
    if (!isEmitter) {
      if (fromId === "me") State.rep = Math.max(0, (State.rep | 0) - amt);
      else fromAcc.rep = Math.max(0, (fromAcc.rep | 0) - amt);
    }
    if (toId === "me") State.rep = Math.max(0, (State.rep | 0) + amt);
    else toAcc.rep = Math.max(0, (toAcc.rep | 0) + amt);
    if (fromId === "me" || toId === "me") {
      applyRepConversion();
      syncMeToPlayers();
    }
    logRepTransfer({
      time: Date.now(),
      sourceId: String(fromId),
      targetId: String(toId),
      amount: amt,
      reason: String(reason || "rep_transfer"),
      battleId: battleId || null,
      currency: "rep",
      before: { from: beforeFrom, to: beforeTo }
    });
    const afterRep = (State.rep || 0) | 0;
    const afterInfluence = (State.me && Number.isFinite(State.me.influence)) ? (State.me.influence | 0) : 0;
    emitStatDelta("rep", afterRep - beforeRep, { reason: reason || "rep_transfer", battleId: battleId || null });
    emitStatDelta("influence", afterInfluence - beforeInfluence, { reason: reason || "rep_transfer", battleId: battleId || null });
    return { ok: true, amount: amt };
  }

  function maybeDailyRepBonus(){
    ensureProgress();
    const cfg = getRepConfig();
    const last = new Date(State.progress.lastDailyBonusAt || 0);
    const now = new Date();
    const sameDay = last.getFullYear() === now.getFullYear()
      && last.getMonth() === now.getMonth()
      && last.getDate() === now.getDate();
    if (sameDay) return false;
    State.progress.lastDailyBonusAt = Date.now();
    const day = new Date();
    const dayId = `daily_${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
    transferRep("daily_pool", "me", cfg.REP_DAILY, "rep_daily_bonus", dayId);
    // REP v2 economy: daily also grants +1 point (legacy mode only).
    try {
      if (!isCirculationEnabled()) {
        addPoints(1, "daily_bonus");
      }
    } catch (_) {}
    return true;
  }
  function getPointsConfig(){
    const D = (Game && Game.Data) ? Game.Data : null;
    const start = (D && Number.isFinite(D.POINTS_START)) ? (D.POINTS_START | 0) : 10;
    const startPlayer = (D && Number.isFinite(D.START_POINTS_PLAYER)) ? (D.START_POINTS_PLAYER | 0) : start;
    const startNpc = (D && Number.isFinite(D.START_POINTS_NPC)) ? (D.START_POINTS_NPC | 0) : start;
    const softCap = (D && Number.isFinite(D.POINTS_SOFT_CAP)) ? (D.POINTS_SOFT_CAP | 0) : 20;
    return {
      start: Math.max(0, start),
      startPlayer: Math.max(0, startPlayer),
      startNpc: Math.max(0, startNpc),
      softCap: Math.max(0, softCap)
    };
  }

  function isCirculationEnabled(){
    const Econ = (Game && (Game.ConflictEconomy || Game._ConflictEconomy)) ? (Game.ConflictEconomy || Game._ConflictEconomy) : null;
    if (Econ && typeof Econ.isCirculationEnabled === "function") return Econ.isCirculationEnabled();
    const D = (Game && Game.Data) ? Game.Data : null;
    const dbg = (Game && Game.Debug) ? Game.Debug : null;
    if (dbg && dbg.FORCE_CIRCULATION === true) {
      if (dbg._econModeLogged !== "cir") {
        dbg._econModeLogged = "cir";
        try { console.log("[DEV] ECON: CIR"); } catch (_) {}
      }
      return true;
    }
    if (dbg && dbg.FORCE_CIRCULATION === false) {
      if (dbg._econModeLogged !== "legacy") {
        dbg._econModeLogged = "legacy";
        try { console.log("[DEV] ECON: LEGACY"); } catch (_) {}
      }
      return false;
    }
    const v = D && D.CIRCULATION_ENABLED;
    return v === true || v === 1 || v === "true" || v === "1";
  }

  function getEcon(){
    return (Game && Game._ConflictEconomy) ? Game._ConflictEconomy : null;
  }

  function isDevFlag(){
    return (
      (typeof window !== "undefined" && (window.__DEV__ === true || window.DEV === true)) ||
      (typeof location !== "undefined" && location && location.hostname === "localhost") ||
      (typeof location !== "undefined" && location && location.search && location.search.includes("dev=1"))
    );
  }

  let pointsWriteDepth = 0;
  function withPointsWrite(fn){
    pointsWriteDepth++;
    try { return fn(); } finally { pointsWriteDepth = Math.max(0, pointsWriteDepth - 1); }
  }

  function canWritePoints(){
    const dbg = (Game && Game.Debug) ? Game.Debug : null;
    const allowDev = !!(dbg && (dbg.ALLOW_POINTS_WRITE === true || dbg.BYPASS_POINTS_GUARD === true));
    return !isCirculationEnabled() || pointsWriteDepth > 0 || allowDev;
  }

  function rejectPointsWrite(action){
    const msg = "Циркуляция: прямое изменение баланса заблокировано";
    const dbg = (Game && Game.Debug) ? Game.Debug : null;
    if (dbg && (dbg.ALLOW_POINTS_WRITE === true || dbg.BYPASS_POINTS_GUARD === true)) {
      return true;
    }
    if (isDevFlag()) {
      const allowWrite = !!(dbg && dbg.ALLOW_POINTS_WRITE === true);
      const bypass = !!(dbg && dbg.BYPASS_POINTS_GUARD === true);
      const cir = isCirculationEnabled();
      let stackHead = "";
      try {
        const err = new Error();
        const s = String(err && err.stack ? err.stack : "");
        const lines = s.split("\n").map(x => x.trim()).filter(Boolean);
        if (lines.length > 1) stackHead = `${lines[1] || ""}${lines[2] ? " | " + lines[2] : ""}`;
      } catch (_) {}
      const tail = ` allowWrite=${allowWrite} bypass=${bypass} cir=${cir}${stackHead ? " stack=" + stackHead : ""}`;
      throw new Error(action ? `${msg} (${action})${tail}` : `${msg}${tail}`);
    }
    try { pushSystem(msg + "."); } catch (_) {}
    return false;
  }

  function guardPointsObject(obj, label){
    if (!obj || typeof obj !== "object") return;
    const desc = Object.getOwnPropertyDescriptor(obj, "points");
    if (desc && typeof desc.get === "function") return;
    let store = Number.isFinite(obj.points) ? (obj.points | 0) : 0;
    Object.defineProperty(obj, "points", {
      configurable: true,
      enumerable: true,
      get(){ return store; },
      set(v){
        const next = Number.isFinite(Number(v)) ? (Number(v) | 0) : 0;
        if (!canWritePoints()) {
          rejectPointsWrite(label || "points");
          return;
        }
        store = next;
      }
    });
  }

  function emitStatDelta(kind, delta, meta){
    if (!kind || !Number.isFinite(Number(delta || 0))) return;
    const diff = (delta | 0);
    if (!diff) return;
    try {
      if (!Game.Debug || typeof Game.Debug !== "object") Game.Debug = {};
      if (!Array.isArray(Game.Debug.toastLog)) Game.Debug.toastLog = [];
      Game.Debug.toastLog.push({
        time: Date.now(),
        kind: String(kind),
        delta: diff,
        reason: meta && meta.reason ? String(meta.reason) : null,
        battleId: (meta && meta.battleId != null) ? meta.battleId : null,
      });
      if (Game.Debug.toastLog.length > 300) {
        Game.Debug.toastLog.splice(0, Game.Debug.toastLog.length - 300);
      }
    } catch (_) {}
    try {
      if (Game && Game.UI && typeof Game.UI.emitStatDelta === "function") {
        Game.UI.emitStatDelta(kind, diff, meta || null);
      }
    } catch (_) {}
  }

  // Tier is derived from influence thresholds (single source of truth: Game.Data.PROGRESSION.unlockInfluence)
  // y (weak) < strong, o (strong) >= strong, r (powerful) >= power, k (absolute) >= absolute
  function tierFromInfluence(influence) {
    const inf = (influence || 0) | 0;
    const T = getProgression();
    if (inf >= T.absolute) return "k";
    if (inf >= T.power) return "r";
    if (inf >= T.strong) return "o";
    return "y";
  }

  const State = {
    isStarted: false,

    // NPC runtime state
    npc: {
      lastChatAt: 0,
      chatCooldownMs: 0,
      lastActionAt: 0,
      actionCooldownMs: 0,
      lastDmAt: 0,
      timers: {}, // named timers for npc loops
    },

    me: {
      id: "me",
      name: "",
      points: getPointsConfig().startPlayer,
      influence: 0,
      wins: 0,
      winsSinceInfluence: 0,

      // Unlock flags (single source of truth in state)
      unlockOrange: false,
      unlockRed: false,
      unlockBlack: false,

      // Cached tier for UI (y/o/r/k). Updated via syncMeToPlayers().
      argumentTier: "y",

      locationId: "plaza",
    },

    rep: 0,
    influence: 0,

    // all "players" includes NPCs + me mirror
    players: {},

    points: {
      lastChatRewardAt: 0,
    },

    chat: [], // {id,t,name,text,isSystem,isMe,playerId}
    dm: {
      open: false,
      withId: null,
      logs: {}, // withId -> messages

      // UI toggles inside DM
      inviteOpen: false,
      teachOpen: false,

      // One-time aggression triggers per DM (toxic/bandit)
      agroStarted: {}, // withId -> true
    },

    // Cop reports (denunciations) runtime state
    // Global state for authority system (multiple cops)
    reports: {
      lastAt: 0,
      cooldownMs: 3 * 60 * 1000, 
      history: {},
      copCooldowns: {}, // copId -> lastAt (global per cop)
    },
    jailed: {},
    victimByRole: {},
    revengeUntil: 0,
    battleCooldowns: {},

    battles: [], // active battle cards
    events: [],  // npc vs npc events
    lottery: {
      bet: 5,          // фиксированная ставка
      lastRoll: null,  // последний результат
      lastAt: 0,       // timestamp последнего броска (ms)
      plays: 0,        // попытки за сессию
    },
    // UI flags (single source of truth for collapsible blocks etc.)
    flags: {
      // Events panel
      eventsOpen: true,
      eventsCollapsed: false,
      eventCount: 0,

      // Events selection + highlight (single source of truth)
      activeEventId: null,
      selectedEventId: null,
      highlightEventId: null,

      // Panel sizes (collapsed / medium / max) - single source of truth for UI
      // These are used by ui-dm.js / ui-battles.js / ui-events.js
      dmSize: "medium",
      battlesSize: "medium",
      eventsSize: "medium",
      locationsSize: "medium",

      // Optional visibility toggles (UI may set these)
      dmHidden: false,
      battlesHidden: false,
      eventsHidden: false,
    },

    // Optional cache for Events panel selection when S.events is an array
    eventsMeta: {
      activeId: null,
      selectedId: null,
    },

    // Tie-vote state (single source of truth).
    // IMPORTANT: UI/render code must NOT replace this object reference during an active vote.
    // Always mutate fields via StateAPI.upsertVote()/ensureVote()/clearVote() so rerenders don't lose mutations.
    vote: {
      active: false,
      battleId: null,
      // contenders
      aId: null,
      bId: null,
      aName: "",
      bName: "",
      // counts map: { [playerId]: 0|1 } and totals per side
      countsByVoter: {},
      totals: { a: 0, b: 0 },
      // voting constraints
      playerVoted: false,
      playerSide: null, // "a" | "b" | null
      // timing
      startedAt: 0,
      endsAt: 0,
      // timers (ids) so loops can cancel reliably
      timerId: null,
      npcTimerId: null,
      // resolution
      resolved: false,
      winner: null, // "a" | "b" | "tie"
      resultText: "",
      // linked event/chat
      eventId: null,
      chatId: null,
    },

    // Evidence that certain roles were actually seen recently (chat/battles can mark this).
    // roleKey -> lastSeenAt (ms)
    sightings: {},
  };

  guardPointsObject(State.me, "State.me.points");

  function resetAll(){
    State.isStarted = false;
    State.me = {
      id: "me",
      name: "",
      points: getPointsConfig().startPlayer,
      influence: 0,
      wins: 0,
      winsSinceInfluence: 0,

      unlockOrange: false,
      unlockRed: false,
      unlockBlack: false,
      argumentTier: "y",

      locationId: "plaza",
    };
    State.rep = 0;
    State.influence = 0;
    State.players = {};
    State.points = { lastChatRewardAt: 0, overflow: 0, capNote: "" };
    State.chat = [];
    State.dm = { open:false, withId:null, logs:{}, inviteOpen:false, teachOpen:false, agroStarted:{} };
    State.battles = [];
    State.events = [];
    State.eventsMeta = { activeId: null, selectedId: null };
    State.lottery = { bet: 5, lastRoll: null, lastAt: 0, plays: 0 };
    State.flags = {
      eventsOpen: true,
      eventsCollapsed: false,
      eventCount: 0,

      activeEventId: null,
      selectedEventId: null,
      highlightEventId: null,

      dmSize: "medium",
      battlesSize: "medium",
      eventsSize: "medium",
      locationsSize: "medium",

      dmHidden: false,
      battlesHidden: false,
      eventsHidden: false,
    };
    State.vote = {
      active: false,
      battleId: null,
      aId: null,
      bId: null,
      aName: "",
      bName: "",
      countsByVoter: {},
      totals: { a: 0, b: 0 },
      playerVoted: false,
      playerSide: null,
      startedAt: 0,
      endsAt: 0,
      timerId: null,
      npcTimerId: null,
      resolved: false,
      winner: null,
      resultText: "",
      eventId: null,
      chatId: null,
    };
    State.sightings = {};
    State.reports = {
      lastAt: 0,
      cooldownMs: 3 * 60 * 1000,
      history: {},
      copCooldowns: {},
      copChatter: {
        nextChatAtByCopId: {},
        nextDmAtByCopId: {},
        introChatSentByCopId: {},
        introDmSentByCopId: {},
      },
    };
    // Alias for external access (requested: state.copCooldowns)
    State.copCooldowns = State.reports.copCooldowns;
    State.jailed = {};
    State.victimByRole = {};
    State.revengeUntil = 0;
    State.npc = {
      lastChatAt: 0,
      chatCooldownMs: 0,
      lastActionAt: 0,
      actionCooldownMs: 0,
      timers: {},
    };
    State.progress = {
      weeklyInfluenceGained: 0,
      weekStartAt: 0,
      lastDailyBonusAt: 0,
    };
    State._seededNPCs = false;
    guardPointsObject(State.me, "State.me.points");
  }

  // --- DM state migration (targetId -> withId) ---
  function migrateDmState(){
    const dm = State.dm || null;
    if (!dm) return;
    if (dm.withId == null && dm.targetId != null) dm.withId = dm.targetId;
    if (dm.targetId != null) delete dm.targetId;

    if (typeof dm.inviteOpen !== "boolean") dm.inviteOpen = false;
    if (typeof dm.teachOpen !== "boolean") dm.teachOpen = false;
    if (!dm.agroStarted || typeof dm.agroStarted !== "object") dm.agroStarted = {};
  }

  function seedPlayers(){
    State.players = {};
    migrateDmState();
    State._seededNPCs = false;

    // ensure tier cache is consistent before mirroring
    State.me.argumentTier = tierFromInfluence(State.me.influence);

    if (Game.NPC && typeof Game.NPC.seedPlayers === "function") {
      Game.NPC.seedPlayers(State);
    }

    // me mirror
    State.players["me"] = {
      id: "me",
      name: State.me.name || "Ты",
      points: State.me.points,
      influence: State.me.influence,
      argumentTier: State.me.argumentTier,
      unlockOrange: !!State.me.unlockOrange,
      unlockRed: !!State.me.unlockRed,
      unlockBlack: !!State.me.unlockBlack,
      isMe: true,
      npc: false,
    };
    guardPointsObject(State.players["me"], "State.players.me.points");

    // NPC pool comes from Game.NPC after loaded.
    // Support both the newer API (getAll) and older (list).
    let npcs = Object.values(State.players || {}).filter(p => {
      if (!p) return false;
      const id = String(p.id || "");
      return p.npc === true || p.type === "npc" || id.startsWith("npc_");
    });
    if (!npcs.length) {
      npcs = (Game.NPC && typeof Game.NPC.getAll === "function")
        ? Game.NPC.getAll()
        : (Game.NPC && typeof Game.NPC.list === "function")
          ? Game.NPC.list()
          : (Game.NPC && Array.isArray(Game.NPC.PLAYERS))
            ? Game.NPC.PLAYERS
            : [];
    }

    npcs.forEach(n => {
      if (!n || !n.id) return;
      // Ensure npc flag exists for role queries
      const cfg = getPointsConfig();
      const base = { npc: true, ...n };
      if (typeof base.points !== "number") base.points = cfg.startNpc;
      State.players[n.id] = base;
      guardPointsObject(State.players[n.id], `State.players.${n.id}.points`);
    });
  }

  function pushChat(name, text, opts = {}){
    migrateDmState();
    const item = {
      id: safeId(),
      t: nowHHMM(),
      name,
      text,
      isSystem: !!opts.isSystem,
      playerId: opts.playerId || null,
      isMe: !!opts.isMe,
      speakerId: opts.playerId || null,

      // Mentions metadata (optional, for UI highlights)
      mentions: extractMentionedIds(text),
      isMentionedMe: isMeMentioned(text),
    };
    State.chat.push(item);

    // Mark that we have actually seen this NPC role recently (for Cop evidence).
    if (item.playerId) markSightingByPlayerId(item.playerId);

    if (State.chat.length > 200) State.chat.shift();
    return item;
  }

  function pushSystem(text){
    return pushChat("Система", text, { isSystem:true });
  }

  function copLine(text){
    const N = Game.NPC || null;
    if (N && typeof N.normalizeCopLine === "function") return N.normalizeCopLine(text);
    // Fallback: keep punctuation decent
    const raw = (text == null) ? "" : String(text);
    let t = raw.replace(/\s+/g, " ").trim();
    if (!t) return "";
    t = t.charAt(0).toUpperCase() + t.slice(1);
    if (!/[.!?]$/.test(t)) t += ".";
    return t;
  }

  function copName(){
    // Pick an assigned cop for the current session or a random one if none assigned.
    if (!State.assignedCopId) {
      const cops = Object.values(State.players || {}).filter(p => p && p.role === "cop");
      if (cops.length > 0) {
        State.assignedCopId = cops[Math.floor(Math.random() * cops.length)].id;
      }
    }
    const p = State.players[State.assignedCopId || "npc_cop_v"];
    return (p && p.name) ? p.name : "Владимир Иванович";
  }

  function listCops(){
    return Object.values(State.players || {}).filter(p => p && p.role === "cop");
  }

  function isCopBusyById(copId, nowTs){
    const cdMs = (State.reports && Number.isFinite(State.reports.cooldownMs)) ? (State.reports.cooldownMs | 0) : (5 * 60 * 1000);
    const last = (State.reports && State.reports.copCooldowns) ? (State.reports.copCooldowns[copId] || 0) : 0;
    const now0 = (typeof nowTs === "number") ? nowTs : Date.now();
    return (now0 - last) < cdMs;
  }

  function pickCopTemplate(list, fallback){
    const arr = Array.isArray(list) ? list : [];
    if (!arr.length) return String(fallback || "");
    return String(arr[Math.floor(Math.random() * arr.length)] || arr[0] || fallback || "");
  }

  function fillCopTemplate(tpl, cop, vars = {}){
    let out = String(tpl || "");
    const copName0 = (cop && cop.name) ? String(cop.name) : "Коп";
    out = out.replace(/\{cop\.fullName\}/g, copName0);
    out = out.replace(/\{cop\.rank\}/g, "");
    out = out.replace(/\{role\}/g, String(vars.role || ""));
    out = out.replace(/\{name\}/g, String(vars.name || ""));
    return out.replace(/\s+/g, " ").trim();
  }

  function emitCopChatById(copId, listName, vars = {}){
    const D = Game.Data || null;
    const tpl = (D && D.COP_TEMPLATES) ? D.COP_TEMPLATES : null;
    const cop = (State.players && copId && State.players[copId]) ? State.players[copId] : null;
    if (!cop || cop.role !== "cop") return false;
    if (!tpl) return false;
    const raw = pickCopTemplate(tpl[listName], "");
    const msg = fillCopTemplate(raw, cop, vars);
    if (!msg) return false;
    pushChat(String(cop.name || "Коп"), copLine(msg), { isSystem: false, playerId: copId });
    return true;
  }

  function emitCopDmById(copId, listName, vars = {}){
    const D = Game.Data || null;
    const tpl = (D && D.COP_TEMPLATES) ? D.COP_TEMPLATES : null;
    const cop = (State.players && copId && State.players[copId]) ? State.players[copId] : null;
    if (!cop || cop.role !== "cop") return false;
    if (!tpl) return false;
    const raw = pickCopTemplate(tpl[listName], "");
    const msg = fillCopTemplate(raw, cop, vars);
    if (!msg) return false;
    pushDm(copId, String(cop.name || "Коп"), copLine(msg), { isSystem: false, playerId: copId });
    return true;
  }

  function tickCopChatter(nowTs){
    const now0 = (typeof nowTs === "number") ? nowTs : Date.now();
    const cops = listCops();
    if (!cops.length) return false;
    const D = Game.Data || null;
    if (!D || !D.COP_TEMPLATES) return false;

    const rep = State.reports || {};
    rep.copChatter ||= {
      nextChatAtByCopId: {},
      nextDmAtByCopId: {},
      introChatSentByCopId: {},
      introDmSentByCopId: {},
      // New single-source flags (avoid chat+DM duplicates)
      introSentByCopId: {},
      lastKindByCopId: {},   // "warnings" | "chatReplies" | "cooldownReplies" | "intros"
      lastTextByCopId: {},   // last emitted line (dedupe)
    };
    const ch = rep.copChatter;
    ch.nextChatAtByCopId ||= {};
    ch.nextDmAtByCopId ||= {};
    ch.introChatSentByCopId ||= {};
    ch.introDmSentByCopId ||= {};
    ch.introSentByCopId ||= {};
    ch.lastKindByCopId ||= {};
    ch.lastTextByCopId ||= {};

    let did = false;

    for (const cop of cops) {
      const cid = String(cop.id || "");
      if (!cid) continue;

      // Schedule defaults (staggered)
      if (!Number.isFinite(ch.nextChatAtByCopId[cid])) ch.nextChatAtByCopId[cid] = now0 + 8000 + Math.floor(Math.random() * 12000);
      if (!Number.isFinite(ch.nextDmAtByCopId[cid])) ch.nextDmAtByCopId[cid] = now0 + 12000 + Math.floor(Math.random() * 18000);

      const busy = isCopBusyById(cid, now0);

      const dueChat = now0 >= (ch.nextChatAtByCopId[cid] || 0);
      const dueDm = now0 >= (ch.nextDmAtByCopId[cid] || 0);
      if (!dueChat && !dueDm) continue;

      // IMPORTANT: each cop emits into exactly ONE channel per tick (chat OR DM), no dual-send.
      const channel = (dueChat && dueDm)
        ? (Math.random() < 0.5 ? "chat" : "dm")
        : (dueChat ? "chat" : "dm");

      let listName = "chatReplies";
      if (busy) {
        listName = "cooldownReplies";
      } else if (!ch.introSentByCopId[cid]) {
        listName = "intros";
      } else {
        // Alternate warnings <-> chatReplies when not busy
        const last = String(ch.lastKindByCopId[cid] || "");
        listName = (last === "warnings") ? "chatReplies" : "warnings";
      }

      // Build the exact message once (so it can't appear in both chat+DM)
      let ok = false;
      try {
        const tpl = (D && D.COP_TEMPLATES) ? D.COP_TEMPLATES : null;
        if (tpl) {
          let raw = pickCopTemplate(tpl[listName], "");
          let msg = fillCopTemplate(raw, cop, {});
          const lastText = String(ch.lastTextByCopId[cid] || "");
          // Try a couple times to avoid immediate repeats
          if (msg && lastText && msg === lastText) {
            for (let i = 0; i < 2; i++) {
              raw = pickCopTemplate(tpl[listName], raw);
              msg = fillCopTemplate(raw, cop, {});
              if (msg && msg !== lastText) break;
            }
          }
          if (msg) {
            if (channel === "chat") {
              pushChat(String(cop.name || "Коп"), copLine(msg), { isSystem: false, playerId: cid });
            } else {
              const targetId = (cop && cop.id) ? cop.id : "";
              if (targetId) {
                pushDm(targetId, String(cop.name || "Коп"), copLine(msg), { isSystem: false, playerId: cid });
              } else {
                // Fallback to chat when we cannot resolve a real cop id
                pushChat(String(cop.name || "Коп"), copLine(msg), { isSystem: false, playerId: cid });
              }
            }
            ok = true;
            ch.lastTextByCopId[cid] = msg;
          }
        }
      } catch (_) {
        ok = false;
      }

      // Reschedule: always push the chosen channel forward; push the other slightly to prevent immediate back-to-back.
      if (channel === "chat") {
        ch.nextChatAtByCopId[cid] = now0 + 45000 + Math.floor(Math.random() * 45000);
        if (dueDm) ch.nextDmAtByCopId[cid] = Math.max(ch.nextDmAtByCopId[cid] || 0, now0 + 18000);
      } else {
        ch.nextDmAtByCopId[cid] = now0 + 60000 + Math.floor(Math.random() * 60000);
        if (dueChat) ch.nextChatAtByCopId[cid] = Math.max(ch.nextChatAtByCopId[cid] || 0, now0 + 18000);
      }

      if (ok) {
        did = true;
        if (listName === "intros") ch.introSentByCopId[cid] = true;
        if (!busy && (listName === "warnings" || listName === "chatReplies")) ch.lastKindByCopId[cid] = listName;
        if (busy) ch.lastKindByCopId[cid] = "cooldownReplies";
      }
    }

    return did;
  }

  function getAvailableCop(){
    const cops = Object.values(State.players || {}).filter(p => p && p.role === "cop");
    const cdMs = State.reports.cooldownMs || (5 * 60 * 1000);
    const now = Date.now();
    
    // Find first cop whose cooldown has passed
    return cops.find(c => {
      const last = State.reports.copCooldowns[c.id] || 0;
      return (now - last) >= cdMs;
    }) || null;
  }

  function getRoleOf(id){
    const p = (id && State.players) ? State.players[id] : null;
    return p && (p.role || p.type) ? String(p.role || p.type) : "";
  }

  // ---- Mentions helpers (single source of truth for UI) ----
  function getAllPlayerIds(){
    return Object.keys(State.players || {});
  }

  function getAllMentionCandidates(){
    const out = [];
    const ids = getAllPlayerIds();
    for (const id of ids) {
      const p = State.players[id];
      if (!p || !p.name) continue;
      out.push({
        id,
        name: String(p.name),
        influence: (p.influence || 0) | 0,
        isMe: !!p.isMe,
        npc: !!p.npc,
        role: p.role || p.type || "",
      });
    }
    // sort: me first, then by influence desc, then name asc
    out.sort((a, b) => {
      if (a.isMe !== b.isMe) return a.isMe ? -1 : 1;
      if (b.influence !== a.influence) return b.influence - a.influence;
      return a.name.localeCompare(b.name, "ru");
    });
    return out;
  }

  function getMentionNames(){
    return getAllMentionCandidates().map(x => x.name);
  }

  function findPlayerIdByName(name){
    const n = String(name || "").trim();
    if (!n) return null;
    const ids = getAllPlayerIds();
    for (const id of ids) {
      const p = State.players[id];
      if (!p || !p.name) continue;
      if (String(p.name) === n) return id;
    }
    return null;
  }

  function escapeRe(s){
    return String(s || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // Extract mentions in text. Supports both "@Name" and bare "Name" (for NPC reactions that may omit "@").
  function extractMentionedIds(text){
    const t = String(text || "");
    const ids = [];
    const candidates = getAllMentionCandidates();
    for (const c of candidates) {
      const nm = String(c.name || "");
      if (!nm) continue;
      const reAt = new RegExp(`(^|\\s)@${escapeRe(nm)}(?=\\s|$)`, "iu");
      const reBare = new RegExp(`(^|\\s)${escapeRe(nm)}(?=\\s|$)`, "iu");
      if (reAt.test(t) || reBare.test(t)) ids.push(c.id);
    }
    return ids;
  }

  function isMeMentioned(text){
    const meName = (State.me && State.me.name) ? String(State.me.name).trim() : "";
    if (!meName) return false;
    const t = String(text || "");
    const reAt = new RegExp(`(^|\\s)@${escapeRe(meName)}(?=\\s|$)`, "iu");
    const reBare = new RegExp(`(^|\\s)${escapeRe(meName)}(?=\\s|$)`, "iu");
    return reAt.test(t) || reBare.test(t);
  }

  function markSightingByPlayerId(playerId){
    try {
      const p = (playerId && State.players) ? State.players[playerId] : null;
      if (!p || !p.npc) return;
      const role = String(p.role || p.type || "").toLowerCase();
      if (!role) return;
      // normalize role keys
      const roleKey =
        (role.includes("токс") || role === "toxic") ? "toxic" :
        (role.includes("банд") || role === "bandit") ? "bandit" :
        (role.includes("мафи") || role === "mafia" || role === "mafioso") ? "mafia" :
        (role.includes("cop") || role.includes("police") || role === "cop") ? "cop" :
        "";
      if (!roleKey) return;
      State.sightings[roleKey] = Date.now();
    } catch (_) {}
  }

  function findNpcByRole(role){
    const r = String(role || "");
    const ids = Object.keys(State.players || {});
    for (const id of ids) {
      const p = State.players[id];
      if (!p || !p.npc) continue;
      const pr = p.role || p.type;
      if (pr && String(pr) === r) return p;
    }
    return null;
  }

  function resolveCopById(copId){
    try {
      if (!copId || !State || !State.players) return null;
      const p = State.players[copId];
      if (!p) return null;
      const role = String(p.role || p.type || "").toLowerCase();
      if (role === "cop" || role === "police") return p;
    } catch (_) {}
    return null;
  }

  function copDmTo(copId, text, vars = {}){
    const D = Game.Data || null;
    const cop = resolveCopById(copId)
      || (State && State.players ? Object.values(State.players).find(p => p && (p.role === "cop" || p.role === "police")) : null);
    const copName0 = (cop && cop.name) ? String(cop.name) : "Коп";
    const tpl = (D && D.COP_TEMPLATES) ? D.COP_TEMPLATES : null;
    const pick = (arr) => (Array.isArray(arr) && arr.length) ? arr[Math.floor(Math.random() * arr.length)] : "";
    const fill = (s) => {
      let out = String(s || "");
      out = out.replace(/\{cop\.fullName\}/g, copName0);
      out = out.replace(/\{cop\.rank\}/g, "");
      out = out.replace(/\{role\}/g, String(vars.role || ""));
      out = out.replace(/\{name\}/g, String(vars.name || ""));
      return out.replace(/\s+/g, " ").trim();
    };
    const isKey =
      text === "cop_busy" ||
      text === "cop_accept" ||
      text === "cop_success" ||
      text === "cop_fail";
    const listName =
      (text === "cop_busy") ? "cooldownReplies" :
      (text === "cop_accept") ? "chatReplies" :
      (text === "cop_success") ? "thanks" :
      (text === "cop_fail") ? "scolds" :
      "";

    // First DM: send intro once
    try {
      migrateDmState();
      const key = (cop && cop.id) ? cop.id : String(copId || "npc_cop");
      const arr = (State.dm && State.dm.logs && State.dm.logs[key]) ? State.dm.logs[key] : [];
      if (arr && arr.length === 0 && tpl && tpl.intros) {
        const intro = fill(pick(tpl.intros));
        if (intro && cop && cop.id) pushDm(cop.id, copName0, copLine(intro), { isSystem: false, playerId: cop.id });
      }
    } catch (_) {}

    const msg = (isKey && tpl && listName && tpl[listName])
      ? fill(pick(tpl[listName]))
      : fill(String(text || ""));
    if (cop && cop.id) pushDm(cop.id, copName0, copLine(msg), { isSystem: false, playerId: cop.id });
  }

  function copChatFrom(copId, text, vars = {}){
    const D = Game.Data || null;
    const cop = resolveCopById(copId)
      || (State && State.players ? Object.values(State.players).find(p => p && (p.role === "cop" || p.role === "police")) : null);
    const copName0 = (cop && cop.name) ? String(cop.name) : "Коп";
    const tpl = (D && D.COP_TEMPLATES) ? D.COP_TEMPLATES : null;
    const pick = (arr) => (Array.isArray(arr) && arr.length) ? arr[Math.floor(Math.random() * arr.length)] : "";
    const fill = (s) => {
      let out = String(s || "");
      out = out.replace(/\{cop\.fullName\}/g, copName0);
      out = out.replace(/\{cop\.rank\}/g, "");
      out = out.replace(/\{role\}/g, String(vars.role || ""));
      out = out.replace(/\{name\}/g, String(vars.name || ""));
      return out.replace(/\s+/g, " ").trim();
    };
    const isKey =
      text === "cop_warning" ||
      text === "cop_reply" ||
      text === "cop_busy" ||
      text === "cop_thanks" ||
      text === "cop_scold";
    const listName =
      (text === "cop_warning") ? "warnings" :
      (text === "cop_reply") ? "chatReplies" :
      (text === "cop_busy") ? "cooldownReplies" :
      (text === "cop_thanks") ? "thanks" :
      (text === "cop_scold") ? "scolds" :
      "";
    const msg = (isKey && tpl && listName && tpl[listName])
      ? fill(pick(tpl[listName]))
      : fill(String(text || ""));
    pushChat(copName0, copLine(msg), { isSystem: false, playerId: (cop && cop.id) ? cop.id : (copId || "npc_cop_v") });
  }

  // Backward-compat wrappers (legacy callsites rely on assignedCopId).
  function copDm(text, vars = {}){
    const cid = State && State.assignedCopId ? State.assignedCopId : null;
    return copDmTo(cid, text, vars);
  }

  function copChat(text, vars = {}){
    const cid = State && State.assignedCopId ? State.assignedCopId : null;
    return copChatFrom(cid, text, vars);
  }

  function pushDm(targetId, name, text, opts = {}){
    migrateDmState();
    if (!State.dm.logs[targetId]) State.dm.logs[targetId] = [];
    // Deduplicate: avoid pushing identical DM from same sender within short window
    try {
      const arr = State.dm.logs[targetId];
      const last = Array.isArray(arr) && arr.length ? arr[arr.length - 1] : null;
      const nowMs = Date.now();
      if (last && String(last.name) === String(name) && String(last.text) === String(text)) {
        const lastTime = Number(last.timeMs || 0);
        if (nowMs - lastTime < 2500) {
          // skip duplicate within 2.5s window
          return;
        }
      }
    } catch (_) {}

    State.dm.logs[targetId].push({
      id: safeId(),
      t: nowHHMM(),
      timeMs: Date.now(),
      name,
      text,
      isSystem: !!opts.isSystem,
      playerId: opts.playerId || null,

      // Mentions metadata (optional, for UI highlights)
      mentions: extractMentionedIds(text),
      isMentionedMe: isMeMentioned(text),
    });
    const arr = State.dm.logs[targetId];
    if (arr.length > 120) arr.shift();

    // DM tabs: incoming/outgoing line opens (or focuses) the corresponding DM thread.
    // This is the canonical place where logs[targetId] is mutated.
    try {
      State.dm.openIds = Array.isArray(State.dm.openIds) ? State.dm.openIds : [];
      if (!("activeId" in State.dm)) State.dm.activeId = null;
      State.dm.unread = State.dm.unread || {};
      const id = String(targetId || "");
      if (id && !State.dm.openIds.includes(id)) State.dm.openIds.push(id);
      if (id && !State.dm.activeId) {
        State.dm.activeId = id;
        State.dm.withId = id; // compat alias
      }
      const activeId = String(State.dm.activeId || "");
      if (id) {
        if (activeId === id) {
          State.dm.unread[id] = 0;
        } else {
          State.dm.unread[id] = (Number(State.dm.unread[id]) || 0) + 1;
        }
        try {
          if (Game && Game.UI && typeof Game.UI.isPanelCollapsed === "function" && Game.UI.isPanelCollapsed("dm")) {
            if (typeof Game.UI.bumpCollapsedCounter === "function") Game.UI.bumpCollapsedCounter("dm");
          }
        } catch (_) {}
      }
    } catch (_) {}
  }

  try {
    if (Game && Game.UI && typeof Game.UI.renderDM === "function") {
      Game.UI.renderDM();
    }
  } catch (_) {}
  try {
    if (Game && Game.UI && typeof Game.UI.requestRenderAll === "function") {
      Game.UI.requestRenderAll();
    }
  } catch (_) {}

  function canReport(copId){
    const specific = resolveCopById(copId);
    if (specific && specific.id) {
      return !isCopBusyById(specific.id);
    }
    return !!getAvailableCop();
  }

  function getReportCooldownLeftMs(){
    const cops = Object.values(State.players || {}).filter(p => p && p.role === "cop");
    const cdMs = State.reports.cooldownMs || (5 * 60 * 1000);
    const now = Date.now();
    
    const lefts = cops.map(c => {
      const last = State.reports.copCooldowns[c.id] || 0;
      return Math.max(0, cdMs - (now - last));
    });
    
    // If any cop is free, cooldown left is 0. Otherwise, it's the minimum wait time until first cop is free.
    return Math.min(...lefts);
  }

  function markReported(targetId, ok, role, copId){
    State.reports.history[targetId] = {
      ok: !!ok,
      at: Date.now(),
      by: "me",
      role: String(role || ""),
      copId: copId || null,
    };
    // Canon: cooldown on "report" starts only after a successful report.
    // In multi-cop system, we record which cop took the report and start their global cooldown.
    if (ok) {
      State.reports.lastAt = Date.now();
      const cid = copId || State.assignedCopId || null;
      if (cid) State.reports.copCooldowns[cid] = Date.now();
    }
  }

  function hasReported(targetId){
    // Canon: reported targets disappear from lists only during the report cooldown window,
    // and only after a successful report.
    const rec = State.reports.history[targetId];
    if (!rec || !rec.ok) return false;
    
    // We check against the general cooldown duration.
    const cd = State.reports.cooldownMs || 5 * 60 * 1000;
    return (Date.now() - (rec.at || 0)) < cd;
  }

  // P0-2: проверить, пострадал ли игрок от этого NPC и сколько потерял
  function checkIfVictimized(npcId) {
    if (!npcId) return false;
    try {
      let stolenAmount = 0;
      let wasVictimized = false;
      
      // Проверяем moneyLog на robbery/theft от этого конкретного NPC
      if (Game.Debug && Array.isArray(Game.Debug.moneyLog)) {
        const theftLogs = Game.Debug.moneyLog.filter(l => 
          l && l.sourceId === "me" && l.targetId === npcId &&
          (l.reason && (l.reason.includes("toxic") || l.reason.includes("bandit") || l.reason.includes("robbery") || l.reason.includes("steal")))
        );
        if (theftLogs.length > 0) {
          wasVictimized = true;
          stolenAmount = theftLogs.reduce((sum, log) => sum + (log.amount || 0), 0);
        }
      }
      
      // Проверяем историю баттлов на поражения от этого NPC
      if (Array.isArray(State.battles)) {
        const lost = State.battles.find(b => b && b.opponentId === npcId && b.result === "lose");
        if (lost) wasVictimized = true;
      }
      
      return wasVictimized ? { stolenAmount } : false;
    } catch (_) {}
    return false;
  }

  function applyReportByRole(role, opts = null){
    const raw = String(role || "").trim();
    const r = raw.toLowerCase();
    // normalize synonyms
    let target = null;
    try {
      const ps = State.players || {};
      target = Object.values(ps).find(x => x && x.name && String(x.name).toLowerCase() === r) || null;
    } catch (_) {}
    // normalize synonyms helper (moved up so name-only reports are supported)
    const normalizeRoleKeyEarly = (s) => {
      const x = String(s || "").toLowerCase();
      if (!x) return "";
      if (x.includes("токс") || x.includes("toxic")) return "toxic";
      if (x.includes("банд") || x.includes("bandit")) return "bandit";
      if (x.includes("мафи") || x.includes("mafia") || x.includes("mafioso")) return "mafia";
      return "";
    };

    let roleKey = "";
    try {
      if (target) roleKey = normalizeRoleKeyEarly(String(target.role || target.type || ""));
      if (!roleKey) {
        if (r.includes("токс") || r === "toxic") roleKey = "toxic";
        else if (r.includes("банд") || r === "bandit") roleKey = "bandit";
        else if (r.includes("мафи") || r === "mafia" || r === "mafioso") roleKey = "mafia";
      }
    } catch (_) { roleKey = ""; }

    // MULTI-COP CANON: report is handled by a конкретный copId (from DM), with per-cop cooldowns.
    // We resolve the cop as early as possible so even "unknown_role" replies go to the correct DM thread.
    const requestedCopId = (opts && typeof opts === "object" && opts.copId) ? String(opts.copId) : "";
    const requestedCop = requestedCopId ? resolveCopById(requestedCopId) : null;
    const availableCop = requestedCop || getAvailableCop();
    const cop = (availableCop && availableCop.id) ? availableCop : null;

    // If no roleKey AND no target found by name -> unknown role request
    if (!roleKey && !target) {
      if (cop && cop.id) copDmTo(cop.id, "Уточните, кого сдаёте: токсик, бандит или мафиози.");
      return { ok: false, reason: "unknown_role" };
    }

    if (!cop || !cop.id) {
      return { ok: false, reason: "all_cops_busy" };
    }
    // If the requested cop is busy, only this cop replies "busy" in their DM.
    if (isCopBusyById(cop.id)) {
      try { copDmTo(cop.id, "cop_busy"); } catch (_) {}
      return { ok: false, reason: "cop_busy", copId: cop.id };
    }

    // Assign this cop for this interaction (used by legacy helpers)
    State.assignedCopId = cop.id;
    // Immediately notify player that this cop accepted the report (DM in THIS cop thread)
    try { pushDm(cop.id, cop.name, copLine("Принял. Сейчас разберёмся."), { isSystem: false, playerId: cop.id }); } catch (_) {}

    if (!target) target = findNpcByRole(roleKey);
    if (!target || !target.id) {
      copDmTo(cop.id, "Цель не обнаружена. Проверю ещё раз.");
      markReported(`missing:${roleKey}:${Date.now()}`, false, roleKey, cop.id);
      return { ok: false, reason: "not_found" };
    }

    // If already jailed, don't panic or duplicate.
    if ((roleKey === "toxic" || roleKey === "bandit" || roleKey === "mafia") && State.jailed && State.jailed[target.id]) {
      const jail = State.jailed[target.id];
      if (jail && Date.now() < (jail.until || 0)) {
        return { ok: false, reason: "already_jailed", targetId: target.id };
      }
    }

    // Prevent repeat report of the same target during cooldown window.
    if (hasReported(target.id)) {
      copDmTo(cop.id, "Этот контакт уже отмечен. Повтор не требуется.");
      return { ok: false, reason: "already_reported", targetId: target.id };
    }

    // Determine reported role key (for later truthful check).
    const normalizeRoleKey = (s) => {
      const x = String(s || "").toLowerCase();
      if (!x) return "";
      if (x.includes("токс") || x.includes("toxic")) return "toxic";
      if (x.includes("банд") || x.includes("bandit")) return "bandit";
      if (x.includes("мафи") || x.includes("mafia") || x.includes("mafioso")) return "mafia";
      return x;
    };

    // If roleKey is empty but we found a target by name, accept the report and use the target's role for comparisons.
    if (!roleKey && target && target.role) {
      const nr = normalizeRoleKey(target.role);
      roleKey = nr || "";
    }

    const ALLOWED_REPORT_ROLES = new Set(["toxic","bandit","mafia"]);
    let reportedRole = "";
    try {
      if (target && target.role) reportedRole = normalizeRoleKey(target.role);
      if (!reportedRole) reportedRole = normalizeRoleKey(r);
    } catch (_) { reportedRole = normalizeRoleKey(r); }

    if (!ALLOWED_REPORT_ROLES.has(roleKey)) {
      return { ok:false, reason:"report_invalid_target", role: roleKey };
    }
    const meId = (State.me && State.me.id) ? String(State.me.id) : "me";
    if (target && target.id && String(target.id) === meId) {
      return { ok:false, reason:"self_report", role: roleKey };
    }
    if (targetRole === "cop" || (cop && cop.id && target && target.id && String(target.id) === String(cop.id))) {
      return { ok:false, reason:"report_invalid_target", role: roleKey };
    }
    const actual = getRoleOf(target && target.id);
    const truthful = Boolean(reportedRole && target && (reportedRole === normalizeRoleKey(actual)));
    const reportId = `report_${target.id}_${Date.now()}`;
    let repTransferred = false;

    // Reward/penalty values from NPC knowledge base if available
    const N = Game.NPC || {};
    const reward = (N.COP && N.COP.report && Number.isFinite(N.COP.report.rewardPoints)) ? (N.COP.report.rewardPoints|0) : 2;
    const penalty = (N.COP && N.COP.report && Number.isFinite(N.COP.report.falsePenalty)) ? (N.COP.report.falsePenalty|0) : 5;

    // Canon: truth is determined by actual role only. No "evidence window" gating.
    // If role mismatched -> false report (REP penalty only) — REP v2 economy
    if (!ALLOWED_REPORT_ROLES.has(roleKey)) {
      applyFalseReport(target, roleKey, cop.id, reportId);
      return { ok:false, reason:"report_invalid_target", role: roleKey };
    }
    if (target && target.id && String(target.id) === meId) {
      applyFalseReport(target, roleKey, cop.id, reportId);
      return { ok:false, reason:"self_report", role: roleKey };
    }
    const targetRole = (target && target.role) ? String(target.role).toLowerCase() : "";
    if (targetRole === "cop" || (cop && cop.id && target && target.id && String(target.id) === String(cop.id))) {
      applyFalseReport(target, roleKey, cop.id, reportId);
      return { ok:false, reason:"report_invalid_target", role: roleKey };
    }
    if (!truthful) {
      const D = (Game && Game.Data) ? Game.Data : null;
      const prev = (State.reports && State.reports.history) ? State.reports.history[target.id] : null;
      const baseRepPenalty = (D && Number.isFinite(D.REP_REPORT_FALSE)) ? (D.REP_REPORT_FALSE | 0) : 2;
      const repeatRepPenalty = (D && Number.isFinite(D.REP_REPORT_FALSE_REPEAT)) ? (D.REP_REPORT_FALSE_REPEAT | 0) : 3;
      const repPenalty = (prev && prev.ok === false) ? repeatRepPenalty : baseRepPenalty;
      
      // Apply REP penalty via transferRep; record and notify player explicitly.
      try {
        transferRep("me", "crowd_pool", repPenalty, "rep_report_false", reportId);
      } catch (_) {}

      // Ensure debug logs and toasts reflect the penalty even if econ path is silent.
      try {
        const dbg = (Game && Game.Debug) ? Game.Debug : (window.Game.Debug = window.Game.Debug || {});
        dbg.moneyLog = Array.isArray(dbg.moneyLog) ? dbg.moneyLog : (dbg.moneyLog = dbg.moneyLog || []);
        dbg.moneyLog.push({
          time: Date.now(),
          sourceId: "me",
          targetId: "crowd_pool",
          amount: repPenalty,
          reason: "rep_report_false",
          eventId: reportId || null,
          battleId: reportId || null,
          currency: "rep"
        });
        dbg.toastLog = Array.isArray(dbg.toastLog) ? dbg.toastLog : (dbg.toastLog = dbg.toastLog || []);
        dbg.toastLog.push({ ts: Date.now(), kind: "rep", delta: -(repPenalty), eventId: reportId || null, text: `-${repPenalty}⭐` });
      } catch (_) {}

      // DM to player: explicit penalty notice
      try {
        const penaltyMsg = `Это ложный донос — штраф ${repPenalty}⭐. Будьте внимательнее.`;
        pushDm(cop.id, cop.name, copLine(penaltyMsg), { isSystem: false, playerId: cop.id });
      } catch (_) {}

      markReported(target.id, false, roleKey, cop.id);
      try { copDmTo(cop.id, "cop_fail"); } catch (_) {}
      return { ok: false, reason: "false_report", role: roleKey, repPenalty, copId: cop.id };
    }

    const sendRevengeDM = (roleKey, jailedId) => {
      try {
        const pool = Object.values(State.players || {}).filter(p => p && p.role === roleKey && p.id !== jailedId);
        if (!pool.length) return;
        const npc = pool[Math.floor(Math.random() * pool.length)];
        if (!npc || !npc.id) return;
        let line = "ты за это ответишь";
        if (roleKey === "bandit") line = "долг вернем, не забудь";
        if (Game.NPC && typeof Game.NPC.generateAggroDMLine === "function") {
          const fallback = Game.NPC.generateAggroDMLine(npc);
          if (!line && fallback) line = fallback;
        }
        pushDm(npc.id, npc.name, line, { isSystem: false, playerId: npc.id });
      } catch (_) {}
    };

    if (truthful) {
      // REP v2 economy: truthful report gives fixed REP, no points reward.
      const payout = 0;
      const D = (Game && Game.Data) ? Game.Data : null;
        if (!repTransferred) {
        const repGain = (D && Number.isFinite(D.REP_REPORT_TRUE)) ? (D.REP_REPORT_TRUE | 0) : 2;
        try {
          transferRep("crowd_pool", "me", repGain, "rep_report_true", reportId);
        } catch (_) {}
        // immediate DM: use known local values (repGain)
        try {
          const repMsg = repGain > 0 ? `+${repGain}⭐` : "";
          const bonusMsg = repMsg ? `Благодарим за сдачу, получено ${repMsg}`.trim() : "Благодарим за сдачу, получено.";
          pushDm(cop.id, cop.name, copLine(bonusMsg), { isSystem: false, playerId: cop.id });
        } catch (_) {}
        // Fallback logging: ensure debug logs / toasts reflect the rep transfer if econ didn't
        try {
          const dbg = (Game && Game.Debug) ? Game.Debug : (window.Game.Debug = window.Game.Debug || {});
          dbg.moneyLog = Array.isArray(dbg.moneyLog) ? dbg.moneyLog : (dbg.moneyLog = dbg.moneyLog || []);
          const existsRep = dbg.moneyLog.some(x => x && String(x.reason || "") === "rep_report_true" && String(x.eventId||x.battleId||"") === String(reportId || ""));
          if (!existsRep) {
            dbg.moneyLog.push({
              time: Date.now(),
              reason: "rep_report_true",
              currency: "rep",
              amount: repGain,
              sourceId: "crowd_pool",
              targetId: "me",
              eventId: reportId || null,
              battleId: reportId || null
            });
          }
          dbg.toastLog = Array.isArray(dbg.toastLog) ? dbg.toastLog : (dbg.toastLog = dbg.toastLog || []);
          dbg.toastLog.push({ ts: Date.now(), kind: "rep", delta: repGain, eventId: reportId || null, text: `+${repGain}⭐` });
        } catch (_) {}
        repTransferred = true;
      }

      markReported(target.id, true, roleKey, cop.id);
      
      // Notify player in DM about the successful report and rewards.
      // Compute actual rep/points amounts from moneyLog (authoritative) to avoid mismatches.
      try {
        let repSum = 0;
        let ptsSum = 0;
        try {
          const logs = (Game && Game.Debug && Array.isArray(Game.Debug.moneyLog)) ? Game.Debug.moneyLog : [];
          const bidStr = String(reportId || "");
          for (const L of logs) {
            if (!L) continue;
            const tag = String(L.reason || "").toLowerCase();
            const bidMatch = String(L.eventId || L.battleId || L.meta && L.meta.eventId || "").indexOf(bidStr) >= 0 || String(L.battleId || L.eventId || "") === bidStr;
            if (!bidStr || bidMatch) {
              // rep reasons
              if (tag.indexOf("rep_report_true") >= 0 || tag.indexOf("rep_") === 0 || String(L.currency || "").toLowerCase() === "rep") {
                repSum += Number(L.amount || L.delta || 0);
              }
              // points reasons
              if (tag.indexOf("cop_compensation_return") >= 0 || tag.indexOf("crowd_vote_refund") >= 0 || String(L.currency || "").toLowerCase() === "points") {
                ptsSum += Number(L.amount || L.delta || 0);
              }
            }
          }
        } catch (_) {}
        const repMsg = (repSum > 0) ? `+${repSum}⭐` : "";
        const ptsMsg = (ptsSum > 0) ? ` +${ptsSum}💰` : "";
        const bonusMsg = repMsg || ptsMsg ? `Благодарим за сдачу, получено ${repMsg}${ptsMsg}`.trim() : "Благодарим за сдачу, получено.";
        pushDm(cop.id, cop.name, copLine(bonusMsg), { isSystem: false, playerId: cop.id });
      } catch(_) {}

      if (roleKey === "toxic" || roleKey === "bandit" || roleKey === "mafia") {
        // P0-2: дополнительный DM если игрок пострадал + компенсация пойнтов
        try {
          const victimized = checkIfVictimized(target.id);
          if (victimized) {
            copDmTo(cop.id, "Я понимаю, что вас это задело. Меры приняты.");
            
            // P0-2: компенсация пойнтов по правилам проекта (возврат украденного)
            const returnAmount = victimized.stolenAmount || 0; // возврат украденного
            if (returnAmount > 0) {
              // Возврат украденных пойнтов: используем addPoints для простоты
              addPoints(returnAmount, "cop_compensation_return");
              // Fallback: log the refund in debug moneyLog/toastLog
              try {
                const dbg = (Game && Game.Debug) ? Game.Debug : (window.Game.Debug = window.Game.Debug || {});
                dbg.moneyLog = Array.isArray(dbg.moneyLog) ? dbg.moneyLog : (dbg.moneyLog = dbg.moneyLog || []);
                dbg.moneyLog.push({
                  time: Date.now(),
                  reason: "cop_compensation_return",
                  currency: "points",
                  amount: returnAmount,
                  sourceId: "cop_compensation",
                  targetId: "me",
                  eventId: reportId || null
                });
                dbg.toastLog = Array.isArray(dbg.toastLog) ? dbg.toastLog : (dbg.toastLog = dbg.toastLog || []);
                dbg.toastLog.push({ ts: Date.now(), kind: "points", delta: returnAmount, eventId: reportId || null, text: `+${returnAmount}💰` });
              } catch (_) {}
            }
            // P0-2: grant extra +1 REP and +1 point (bonus) for victim case
            try {
              if (Game.StateAPI && typeof Game.StateAPI.transferRep === "function") {
                Game.StateAPI.transferRep("crowd_pool", "me", 1, "rep_cop_victim_bonus", reportId);
              }
            } catch (_) {}
            // Apply +1 point bonus
            try { addPoints(1, "cop_victim_point_bonus"); } catch (_) {}

            // Immediate toast for the bonus
            try {
              if (Game.UI && typeof Game.UI.pushSystem === "function") {
                Game.UI.pushSystem(`+1⭐ +1💰`);
              }
              if (Game.UI && typeof Game.UI.requestRenderAll === "function") {
                Game.UI.requestRenderAll();
              }
            } catch (_) {}

            // If there was a return of stolen points, show a toast for that amount
            if (returnAmount > 0) {
              try {
                if (Game.UI && typeof Game.UI.pushSystem === "function") {
                  Game.UI.pushSystem(`+${returnAmount}💰`);
                }
              } catch (_) {}
            }
          }
        } catch (_) {}
      } else {
        copDmTo(cop.id, "Информация подтвердилась. Контакт отмечен.");
      }

      // Remove any active battles with this target immediately (pipeline consistency).
      try {
        if (Array.isArray(State.battles)) {
          State.battles = State.battles.filter(b => b && b.opponentId !== target.id && b.attackerId !== target.id);
        }
      } catch (_) {}

      const now = Date.now();

      if (roleKey === "toxic" || roleKey === "bandit" || roleKey === "mafia") {
        const jailMs = 5 * 60 * 1000;
        State.jailed = State.jailed || {};
        State.jailed[target.id] = { until: now + jailMs, role: roleKey };
        State.revengeUntil = Math.max(State.revengeUntil || 0, now + jailMs);
        try {
          if (State.reports && State.reports.history) delete State.reports.history[target.id];
        } catch (_) {}
        // Public chat: ONLY this cop posts the jail notice. No благодарностей / наград в общем чате.
        try {
          copChatFrom(cop.id, `${target.name} отправился за решётку на 5 минут.`);
        } catch (_) {}
        sendRevengeDM(roleKey, target.id);
      } else {
        // Non-jail confirmations stay in DM only.
      }

      if (State.victimByRole && State.victimByRole[roleKey]) {
        State.victimByRole[roleKey] = null;
      }

      return { ok: true, targetId: target.id, role: roleKey, reward: payout, copId: cop.id };
    }

    // False report (no confirmation branch - redundant with above check but kept for safety)
    try { if (cop && cop.id) copDmTo(cop.id, "Подтверждений нет. Будьте осторожнее с обвинениями."); } catch (_) {}
    return { ok: false, reason: "false_report" };
  }

  function ensureNonNegativePoints(){
    withPointsWrite(() => {
      // me
      State.me.points = Math.max(0, State.me.points || 0);
      if (!State.points) State.points = { lastChatRewardAt: 0, overflow: 0, capNote: "" };
      State.points.overflow = Math.max(0, State.points.overflow || 0);
      // Mirror legacy/compat field for UI: overPoints == overflow remainder (0..4)
      State.overPoints = Math.max(0, (State.points.overflow || 0) | 0);
      // mirror in players
      if (State.players.me) State.players.me.points = State.me.points;

      // others
      Object.values(State.players).forEach(p => {
        if (p && typeof p.points === "number") p.points = Math.max(0, p.points);
      });
    });
  }

  function addPoints(amount, reason){
    const cfg = getPointsConfig();
    // Capture beforePoints early so circulation branch can compute overflow reliably.
    const beforePoints = (State.me && Number.isFinite(State.me.points)) ? (State.me.points | 0) : 0;
    const finalizePoints = () => {
      const afterPoints = (State.me && Number.isFinite(State.me.points)) ? (State.me.points | 0) : 0;
      emitStatDelta("points", afterPoints - beforePoints, { reason: reason || "addPoints" });
      return State.me.points;
    };
    const n = Number(amount || 0);
    if (!Number.isFinite(n) || n === 0) return 0;
    if (isCirculationEnabled() && !pointsWriteDepth) {
      const r = String(reason || "").toLowerCase();
      const allow = r.startsWith("dev") || r.includes("migration") || r.includes("init") || !State.isStarted;
      if (!allow) return rejectPointsWrite(`addPoints:${reason || "unknown"}`) ? 0 : 0;
    }
    if (!State.points) State.points = { lastChatRewardAt: 0, overflow: 0, capNote: "" };
    if (isCirculationEnabled()) {
      withPointsWrite(() => {
        State.me.points = (State.me.points || 0) + (n | 0);
        State.points.overflow = 0;
        State.points.capNote = "";
      });
      syncMeToPlayers();
      ensureNonNegativePoints();
      // When circulation is enabled, still support overflow->REP conversion:
      try {
        const cfg2 = getPointsConfig();
        const cap2 = (cfg2 && Number.isFinite(cfg2.softCap)) ? (cfg2.softCap | 0) : ((Game.Data && Number.isFinite(Game.Data.POINTS_SOFT_CAP)) ? (Game.Data.POINTS_SOFT_CAP|0) : 20);
        const before = (typeof beforePoints !== "undefined" && Number.isFinite(beforePoints)) ? (beforePoints | 0) : ((State.me && Number.isFinite(State.me.points)) ? (State.me.points | 0) : 0) - (n|0);
        const total = before + (n|0);
        let overflow = Math.max(0, total - cap2);
        const step = (Game && Game.Data && Number.isFinite(Game.Data.OVERPOINTS_TO_REP)) ? (Game.Data.OVERPOINTS_TO_REP | 0) : 5;
        const repGain = (step > 0) ? Math.floor(overflow / step) : 0;
        if (repGain > 0) {
          overflow -= (repGain * step);
          try {
            const bid = `overpoints_${(State.progress && Number.isFinite(State.progress.weekStartAt)) ? (State.progress.weekStartAt | 0) : Date.now()}`;
            if (Game && Game.StateAPI && typeof Game.StateAPI.transferRep === "function") {
              Game.StateAPI.transferRep("crowd_pool", "me", repGain, "rep_overpoints_convert", bid);
            } else {
              transferRep("crowd_pool", "me", repGain, "rep_overpoints_convert", bid);
            }
          } catch (_) {}
          // Per spec: on conversion, reset overflow to 0.
          overflow = 0;
        }
        const finalOverflow = Math.max(0, overflow | 0);
        State.points.overflow = finalOverflow;
        State.overPoints = finalOverflow;
        State.pointsCapActive = ((State.me && Number.isFinite(State.me.points) ? (State.me.points|0) : 0) >= cap2);
      } catch (_) {}
      return finalizePoints();
    }
    const cap = (cfg.softCap | 0);
    let base = (State.me.points || 0) | 0;
    let overflow = (State.points.overflow || 0) | 0;
    const total = base + (n | 0);
    if (total <= cap) {
      base = total;
    } else {
      base = cap;
      overflow += (total - cap);
    }
    // Variant B: convert overPoints to +1 ⭐ REP per N (default 5), not influence
    const step = (Game && Game.Data && Number.isFinite(Game.Data.OVERPOINTS_TO_REP))
      ? (Game.Data.OVERPOINTS_TO_REP | 0)
      : 5;
    const repGain = (step > 0) ? Math.floor(overflow / step) : 0;
    if (repGain > 0) {
      overflow -= (repGain * step);
      try {
        const bid = `overpoints_${(State.progress && Number.isFinite(State.progress.weekStartAt)) ? (State.progress.weekStartAt | 0) : Date.now()}`;
        transferRep("crowd_pool", "me", repGain, "rep_overpoints_convert", bid);
      } catch (_) {}
      // Reset overflow on conversion (spec: clear overPoints after conversion)
      overflow = 0;
    }
    State.me.points = base;
    // Store final overflow (zero if conversion occurred)
    State.points.overflow = Math.max(0, overflow | 0);
    State.overPoints = Math.max(0, State.points.overflow | 0);
    State.pointsCapActive = (base >= cap);
    State.points.capNote = (base >= cap) ? "Кап: каждые 5 💰 -> +1 ⭐." : "";
    syncMeToPlayers();
    ensureNonNegativePoints();
    return finalizePoints();
  }

  function spendPoints(amount, reason){
    const n = Number(amount || 0);
    if (!Number.isFinite(n) || n <= 0) return true;
    if (isCirculationEnabled() && !pointsWriteDepth) {
      const r = String(reason || "").toLowerCase();
      const allow = r.startsWith("dev") || r.includes("migration") || r.includes("init") || !State.isStarted;
      if (!allow) return rejectPointsWrite(`spendPoints:${reason || "unknown"}`) ? false : false;
    }
    const cur = (State.me.points || 0) | 0;
    if (cur < n) return false;
    const beforePoints = cur;
    withPointsWrite(() => {
      State.me.points = cur - (n | 0);
      if (!State.points) State.points = { lastChatRewardAt: 0, overflow: 0, capNote: "" };
      State.points.overflow = 0;
      State.points.capNote = "";
    });
    State.overPoints = 0;
    State.pointsCapActive = false;
    syncMeToPlayers();
    ensureNonNegativePoints();
    const afterPoints = (State.me && Number.isFinite(State.me.points)) ? (State.me.points | 0) : 0;
    emitStatDelta("points", afterPoints - beforePoints, { reason: reason || "spendPoints" });
    return true;
  }

  function syncMeToPlayers(){
    // keep cached tier consistent (single source of truth)
    State.me.argumentTier = tierFromInfluence(State.me.influence);
    State.influence = State.me.influence;

    if (!State.players.me) return;
    withPointsWrite(() => {
      State.players.me.name = State.me.name;
      State.players.me.points = State.me.points;
      State.players.me.influence = State.me.influence;
    });

    // mirror unlock flags and cached tier for UI
    State.players.me.argumentTier = State.me.argumentTier;
    // mirror progression counters for UI lists/filters
    State.players.me.wins = (State.me.wins | 0);
    State.players.me.winsSinceInfluence = (State.me.winsSinceInfluence | 0);
    State.players.me.unlockOrange = !!State.me.unlockOrange;
    State.players.me.unlockRed = !!State.me.unlockRed;
    State.players.me.unlockBlack = !!State.me.unlockBlack;
  }

  function setLocation(id){
    State.me.locationId = id;
  }

  Game.State = State;
  Game._withPointsWrite = withPointsWrite;
  Game.StateAPI = {
    resetAll,
    seedPlayers,
    pushChat,
    pushSystem,
    pushDm,
    ensureNonNegativePoints,
    addPoints,
    spendPoints,
    addRep,
    transferRep,
    emitStatDelta,
    maybeDailyRepBonus,
    repNeedForNextInfluence,
    weeklyCapActive,
    syncMeToPlayers,
    setLocation,

    // Tier helpers for UI
    getMyArgumentTier: () => tierFromInfluence(State.me.influence),
    getMyArgumentTierColor: () => tierFromInfluence(State.me.influence),

    // Mentions (centralized list for autocomplete + flags)
    getAllMentionCandidates,
    getMentionNames,
    findPlayerIdByName,

    getNpcState: () => State.npc,
    setNpcCooldowns: ({ chatMs, actionMs }) => {
      if (typeof chatMs === "number") State.npc.chatCooldownMs = chatMs;
      if (typeof actionMs === "number") State.npc.actionCooldownMs = actionMs;
    },
    markNpcChat: () => { State.npc.lastChatAt = Date.now(); },
    markNpcAction: () => { State.npc.lastActionAt = Date.now(); },
    canNpcChat: () => {
      const cd = State.npc.chatCooldownMs || 0;
      return Date.now() - (State.npc.lastChatAt || 0) >= cd;
    },
    canNpcAct: () => {
      const cd = State.npc.actionCooldownMs || 0;
      return Date.now() - (State.npc.lastActionAt || 0) >= cd;
    },

    // Cop reports (denunciations)
    canReport,
    getReportCooldownLeftMs,
    hasReported,
    applyReportByRole,
    tickCops: (nowTs) => tickCopChatter(nowTs),
    setReportCooldownMs: (ms) => {
      if (typeof ms === "number" && ms >= 0) State.reports.cooldownMs = ms;
    },
    isNpcJailed: (id) => {
      if (!id || !State.jailed) return false;
      const rec = State.jailed[id];
      if (!rec || !rec.until) return false;
      if (Date.now() >= rec.until) {
        delete State.jailed[id];
        try {
          if (State.reports && State.reports.history) delete State.reports.history[id];
        } catch (_) {}
        return false;
      }
      return true;
    },
    markNpcJailed: (id, ms, role) => {
      if (!id) return;
      const until = Date.now() + (ms || 0);
      if (!State.jailed) State.jailed = {};
      State.jailed[id] = { until, role: role || null };
    },
    getRevengeUntil: () => State.revengeUntil || 0,
    setRevengeUntil: (ms) => {
      if (typeof ms === "number") State.revengeUntil = Math.max(State.revengeUntil || 0, Date.now() + ms);
    },

    // Events flags helpers (source of truth in State.flags)
    getEventsFlags: () => (State.flags || {}),
    setEventsOpen: (v) => { if (!State.flags) State.flags = {}; State.flags.eventsOpen = !!v; },
    setEventsCollapsed: (v) => { if (!State.flags) State.flags = {}; State.flags.eventsCollapsed = !!v; },
    setEventCount: (n) => { if (!State.flags) State.flags = {}; State.flags.eventCount = (n || 0) | 0; },
    setHighlightEventId: (id) => { if (!State.flags) State.flags = {}; State.flags.highlightEventId = id || null; },

    // Events data helpers (preserve object identity so vote mutations are not lost on rerender)
    getEvents: () => State.events,
    findEventById: (id) => {
      const eid = id == null ? null : String(id);
      if (!eid) return null;
      const arr = State.events || [];
      for (const ev of arr) {
        if (ev && String(ev.id) === eid) return ev;
      }
      return null;
    },
    upsertEvent: (eventOrId, patch = {}) => {
      const arr = State.events || (State.events = []);
      const isObj = eventOrId && typeof eventOrId === "object";
      const id = isObj ? (eventOrId.id != null ? String(eventOrId.id) : "") : String(eventOrId || "");
      if (!id) return null;

      let ev = null;
      for (const x of arr) {
        if (x && String(x.id) === id) { ev = x; break; }
      }

      if (!ev) {
        ev = isObj ? eventOrId : { id };
        arr.unshift(ev);
      }

      if (patch && typeof patch === "object") {
        for (const k of Object.keys(patch)) {
          const v = patch[k];
          // preserve nested objects unless explicitly replaced with an object
          if (k === "crowd" || k === "votes") {
            if (v && typeof v === "object") ev[k] = v;
            continue;
          }
          ev[k] = v;
        }
      }

      // Ensure containers exist for vote simulation
      if (!ev.crowd || typeof ev.crowd !== "object") ev.crowd = {};
      if (!ev.votes || typeof ev.votes !== "object") ev.votes = { a: 0, b: 0, by: {} };

      return ev;
    },

    // Ensures event vote containers exist without replacing event object
    ensureEventVoteContainers: (eventId) => {
      const ev = (typeof eventId === "object") ? eventId : (Game.StateAPI.findEventById ? Game.StateAPI.findEventById(eventId) : null);
      if (!ev) return null;
      if (!ev.crowd || typeof ev.crowd !== "object") ev.crowd = {};
      if (!ev.votes || typeof ev.votes !== "object") ev.votes = { a: 0, b: 0, by: {} };
      return ev;
    },

    // Panel size helpers (collapsed / medium / max)
    getPanelSizes: () => {
      const f = State.flags || {};
      return {
        dm: f.dmSize || "medium",
        battles: f.battlesSize || "medium",
        events: f.eventsSize || "medium",
        locations: f.locationsSize || "medium",
      };
    },
    setPanelSize: (key, size) => {
      if (!State.flags) State.flags = {};
      const s = (size === "collapsed" || size === "medium" || size === "max") ? size : "medium";
      if (key === "dm") State.flags.dmSize = s;
      if (key === "battles") State.flags.battlesSize = s;
      if (key === "events") State.flags.eventsSize = s;
      if (key === "locations") State.flags.locationsSize = s;
    },
    setPanelHidden: (key, v) => {
      if (!State.flags) State.flags = {};
      const b = !!v;
      if (key === "dm") State.flags.dmHidden = b;
      if (key === "battles") State.flags.battlesHidden = b;
      if (key === "events") State.flags.eventsHidden = b;
      if (key === "locations") State.flags.locationsHidden = b;
    },

    // Lottery state (UI-only convenience, economy is handled elsewhere)
    getLotteryBet: () => {
      const LOT = (Game.Data && Game.Data.LOTTERY) ? Game.Data.LOTTERY : { bet: 5 };
      const fixed = (LOT.bet | 0) || 5;
      return Math.max(0, fixed);
    },
    setLotteryBet: (n) => {
      const LOT = (Game.Data && Game.Data.LOTTERY) ? Game.Data.LOTTERY : { bet: 5 };
      const v = (LOT.bet | 0) || 5;
      if (!State.lottery) State.lottery = { bet: v, lastRoll: null, lastAt: 0, plays: 0 };
      State.lottery.bet = v;
      return v;
    },
    setLotteryLastRoll: (roll) => {
      const LOT = (Game.Data && Game.Data.LOTTERY) ? Game.Data.LOTTERY : { bet: 5 };
      const BET = (LOT.bet | 0) || 5;
      if (!State.lottery) State.lottery = { bet: BET, lastRoll: null, lastAt: 0, plays: 0 };
      State.lottery.lastRoll = (roll == null) ? null : (roll | 0);
      State.lottery.lastAt = Date.now();
    },
  };

  function readCrowdCore(){
    return (Game && (Game.ConflictCore || Game._ConflictCore)) ? (Game.ConflictCore || Game._ConflictCore) : null;
  }

  function bindCrowdCoreFunctions(){
    const core = readCrowdCore();
    if (!Game.StateAPI) Game.StateAPI = {};
    Game.StateAPI.applyCrowdVoteTick = (battleId) => {
      try {
        if (!core || typeof core.applyCrowdVoteTick !== "function") return null;
        return core.applyCrowdVoteTick(battleId);
      } catch (_) {
        return null;
      }
    };
    Game.StateAPI.finalizeCrowdVote = (battleId) => {
      try {
        if (!core || typeof core.finalizeCrowdVote !== "function") return null;
        return core.finalizeCrowdVote(battleId);
      } catch (_) {
        return null;
      }
    };
  }

  bindCrowdCoreFunctions();
})();
