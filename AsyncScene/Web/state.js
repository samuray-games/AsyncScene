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
    const beforeFrom = (fromId === "me") ? (State.rep | 0) : (fromAcc.rep | 0);
    const beforeTo = (toId === "me") ? (State.rep | 0) : (toAcc.rep | 0);
    const amt = n | 0;
    
    // Check sufficient funds (fix DUM-022 #3)
    const available = beforeFrom | 0;
    if (available < amt) {
      if (isDevFlag()) {
        try { console.warn("[REP] transferRep insufficient funds", { fromId, available, amt, reason }); } catch (_) {}
      }
      return { ok: false, reason: "insufficient_rep", available, requested: amt };
    }
    
    // Apply transfer with clipping to prevent negative (fix DUM-022 #2)
    if (fromId === "me") State.rep = Math.max(0, (State.rep | 0) - amt);
    else fromAcc.rep = Math.max(0, (fromAcc.rep | 0) - amt);
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
    return true;
  }
  function getPointsConfig(){
    const D = (Game && Game.Data) ? Game.Data : null;
    const start = (D && Number.isFinite(D.POINTS_START)) ? (D.POINTS_START | 0) : 0;
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
    reports: {
      lastAt: 0,
      cooldownMs: 5 * 60 * 1000, // 5m default (canon: report cooldown matches villain jail window)
      // targetId -> { ok: boolean, at: number, by: "me", role: string }
      history: {},
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
      cooldownMs: 5 * 60 * 1000,
      history: {},
    };
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
    const p = State.players["npc_cop"];
    return (p && p.name) ? p.name : "Коп";
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

  function copDm(text){
    const name = copName();
    // DM log key: npc_cop
    pushDm("npc_cop", name, copLine(text), { isSystem: false, playerId: "npc_cop" });
  }

  function copChat(text){
    const name = copName();
    pushChat(name, copLine(text), { isSystem: false, playerId: "npc_cop" });
  }

  function pushDm(targetId, name, text, opts = {}){
    migrateDmState();
    if (!State.dm.logs[targetId]) State.dm.logs[targetId] = [];
    State.dm.logs[targetId].push({
      id: safeId(),
      t: nowHHMM(),
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
  }

  function canReport(){
    const cd = State.reports.cooldownMs || 0;
    return Date.now() - (State.reports.lastAt || 0) >= cd;
  }

  function getReportCooldownLeftMs(){
    const cd = State.reports.cooldownMs || 0;
    const left = cd - (Date.now() - (State.reports.lastAt || 0));
    return Math.max(0, left);
  }

  function markReported(targetId, ok, role){
    State.reports.history[targetId] = {
      ok: !!ok,
      at: Date.now(),
      by: "me",
      role: String(role || ""),
    };
    // Canon: cooldown on "report" starts only after a successful report.
    // (False reports should not lock the whole report action.)
    if (ok) State.reports.lastAt = Date.now();
  }

  function hasReported(targetId){
    // Canon: reported targets disappear from lists only during the report cooldown window,
    // and only after a successful report.
    const rec = State.reports.history[targetId];
    if (!rec || !rec.ok) return false;
    const cd = State.reports.cooldownMs || 0;
    if (!cd) return false;
    return (Date.now() - (rec.at || 0)) < cd;
  }

  function applyReportByRole(role){
    const raw = String(role || "").trim();
    const r = raw.toLowerCase();
    // normalize synonyms
    let target = null;
    try {
      const ps = State.players || {};
      target = Object.values(ps).find(x => x && x.name && String(x.name).toLowerCase() === r) || null;
    } catch (_) {}
    const roleKey =
      (target && (String(target.role || target.type || "").includes("toxic") || String(target.role || target.type || "").includes("токс"))) ? "toxic" :
      (target && (String(target.role || target.type || "").includes("bandit") || String(target.role || target.type || "").includes("банд"))) ? "bandit" :
      (target && (String(target.role || target.type || "").includes("mafia") || String(target.role || target.type || "").includes("мафи"))) ? "mafia" :
      (r.includes("токс") || r === "toxic") ? "toxic" :
      (r.includes("банд") || r === "bandit") ? "bandit" :
      (r.includes("мафи") || r === "mafia" || r === "mafioso") ? "mafia" :
      "";

    if (!roleKey) {
      copDm("Уточните, кого сдаёте: токсик, бандит или мафиози.");
      return { ok: false, reason: "unknown_role" };
    }

    if (!canReport()) {
      const left = Math.ceil(getReportCooldownLeftMs() / 1000);
      copDm("Я занят. Зайди позже.");
      return { ok: false, reason: "cooldown", leftSec: left };
    }

    if (!target) target = findNpcByRole(roleKey);
    if (!target || !target.id) {
      copDm("Цель не обнаружена. Проверю ещё раз.");
      markReported(`missing:${roleKey}:${Date.now()}`, false, roleKey);
      return { ok: false, reason: "not_found" };
    }

    // If already jailed, don't panic or duplicate.
    if ((roleKey === "toxic" || roleKey === "bandit") && State.jailed && State.jailed[target.id]) {
      const jail = State.jailed[target.id];
      if (jail && Date.now() < (jail.until || 0)) {
        return { ok: false, reason: "already_jailed", targetId: target.id };
      }
    }

    // Prevent repeat report of the same target during cooldown window.
    if (hasReported(target.id)) {
      copDm("Этот контакт уже отмечен. Повтор не требуется.");
      return { ok: false, reason: "already_reported", targetId: target.id };
    }

    // Determine truth: role must match.
    const actual = getRoleOf(target.id);
    const truthful = (actual === roleKey);
    const reportId = `report_${target.id}_${Date.now()}`;
    let repTransferred = false;

    // Reward/penalty values from NPC knowledge base if available
    const N = Game.NPC || {};
    const reward = (N.COP && N.COP.report && Number.isFinite(N.COP.report.rewardPoints)) ? (N.COP.report.rewardPoints|0) : 2;
    const penalty = (N.COP && N.COP.report && Number.isFinite(N.COP.report.falsePenalty)) ? (N.COP.report.falsePenalty|0) : 5;

    // Canon: truth is determined by actual role only. No "evidence window" gating.
    // If role mismatched -> false report (REP penalty only) — REP v2 economy
    if (!truthful) {
      const D = (Game && Game.Data) ? Game.Data : null;
      const prev = (State.reports && State.reports.history) ? State.reports.history[target.id] : null;
      const baseRepPenalty = (D && Number.isFinite(D.REP_REPORT_FALSE)) ? (D.REP_REPORT_FALSE | 0) : 2;
      const repeatRepPenalty = (D && Number.isFinite(D.REP_REPORT_FALSE_REPEAT)) ? (D.REP_REPORT_FALSE_REPEAT | 0) : 3;
      const repPenalty = (prev && prev.ok === false) ? repeatRepPenalty : baseRepPenalty;
      if (!State.players["npc_cop"]) {
        State.players["npc_cop"] = { id: "npc_cop", name: copName(), role: "cop", rep: 0 };
      }
      transferRep("me", "npc_cop", repPenalty, "rep_report_false", reportId);
      markReported(target.id, false, roleKey);
      copDm(`Ложный донос. Штраф по репутации -${repPenalty}.`);
      copChat("Ложный донос зафиксирован.");
      return { ok: false, reason: "false_report", role: roleKey, repPenalty };
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
      let payout = reward;
      const now = Date.now();
      const harm = State.victimByRole ? State.victimByRole[roleKey] : null;
      const HARM_WINDOW_MS = 10 * 60 * 1000;
      const hasHarm = harm && harm.loss > 0 && (now - harm.at) <= HARM_WINDOW_MS;

      // Points canon:
      // - Base reward: 2 points (transfer from villain to me)
      // - If harmed recently: return stolen + 3 extra points
      if ((roleKey === "toxic" || roleKey === "bandit") && hasHarm) {
        payout = (harm.loss | 0) + 3; // Возврат + 3 Points награда
      } else {
        payout = 2;
      }

      // REP canon:
      // - Report without confirmations: +1
      // - Report with harm confirmation: +2
      if (!repTransferred) {
        const repGain = hasHarm ? 2 : 1;
        transferRep("crowd_pool", "me", repGain, "rep_report_true", reportId);
        repTransferred = true;
      }

      let payoutApplied = payout | 0;
      if (isCirculationEnabled()) {
        payoutApplied = 0;
        const Econ = getEcon();
        if (Econ && typeof Econ.transferPoints === "function") {
          const acc = (State.players && target && target.id && State.players[target.id]) ? State.players[target.id] : null;
          const available = acc && Number.isFinite(acc.points) ? (acc.points | 0) : 0;
          const amt = Math.max(0, Math.min(payout | 0, available));
          if (amt > 0) {
            Econ.transferPoints(target.id, "me", amt, "cop_reward", { role: roleKey, battleId: reportId });
            payoutApplied = amt;
          }
        }
      } else {
        const acc = (State.players && target && target.id && State.players[target.id]) ? State.players[target.id] : null;
        const available = acc && Number.isFinite(acc.points) ? (acc.points | 0) : 0;
        const amt = Math.max(0, Math.min(payout, available));
        if (amt > 0) {
          acc.points = Math.max(0, acc.points - amt);
          addPoints(amt, "cop_reward");
          payoutApplied = amt;
        }
      }

      markReported(target.id, true, roleKey);
      if ((roleKey === "toxic" || roleKey === "bandit") && hasHarm) {
        copDm(`Донос принят. Возмещение ${harm.loss} и вознаграждение ${payoutApplied} 💰. ${target.name} задержан на 5 минут.`);
      } else if (roleKey === "toxic" || roleKey === "bandit") {
        copDm(`Донос принят. Вознаграждение ${payoutApplied} 💰. ${target.name} задержан на 5 минут.`);
      } else {
        copDm(`Донос принят. Вознаграждение ${payoutApplied} 💰. Контакт отмечен.`);
      }

      if (roleKey === "toxic" || roleKey === "bandit") {
        const jailMs = 5 * 60 * 1000;
        State.jailed = State.jailed || {};
        State.jailed[target.id] = { until: now + jailMs, role: roleKey };
        State.revengeUntil = Math.max(State.revengeUntil || 0, now + jailMs);
        try {
          if (State.reports && State.reports.history) delete State.reports.history[target.id];
        } catch (_) {}
        try {
          if (Array.isArray(State.battles)) {
            State.battles = State.battles.filter(b => b && b.opponentId !== target.id);
          }
        } catch (_) {}
        const meName = (State.me && State.me.name) ? State.me.name : "Игрок";
        copChat(`Благодаря ${meName} ${roleKey === "toxic" ? "токсик" : "бандит"} ${target.name} отправился за решётку на 5 минут.`);
        copChat(`Все баттлы ${target.name} сняты.`);
        sendRevengeDM(roleKey, target.id);
      } else {
        const meName = (State.me && State.me.name) ? State.me.name : "Игрок";
        if (roleKey === "mafia") {
          copChat(`Благодаря ${meName} мафиози ${target.name} отмечен.`);
        } else {
          copChat(`Внимание: подозрительный персонаж — ${target.name}.`);
        }
      }

      if (State.victimByRole && State.victimByRole[roleKey]) {
        State.victimByRole[roleKey] = null;
      }

      return { ok: true, targetId: target.id, role: roleKey, reward: payout };
    }

    // False report
    if (isCirculationEnabled()) {
      const Econ = getEcon();
      if (Econ && typeof Econ.transferPoints === "function") {
        Econ.transferPoints("me", "sink", penalty, "false_report");
      }
    } else {
      spendPoints(penalty, "false_report");
    }

    markReported(target.id, false, roleKey);
    copDm(`Ложный донос. Штраф -${penalty} 💰.`);
    copChat("Ложный донос зафиксирован.");
    return { ok: false, targetId: target.id, role: roleKey, penalty, reason: "false_report" };
  }

  function ensureNonNegativePoints(){
    withPointsWrite(() => {
      // me
      State.me.points = Math.max(0, State.me.points || 0);
      if (!State.points) State.points = { lastChatRewardAt: 0, overflow: 0, capNote: "" };
      State.points.overflow = Math.max(0, State.points.overflow || 0);
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
      return State.me.points;
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
    const infGain = Math.floor(overflow / 5);
    if (infGain > 0) {
      overflow -= (infGain * 5);
      State.me.influence = (State.me.influence | 0) + infGain;
      if (State.progress) {
        State.progress.weeklyInfluenceGained = (State.progress.weeklyInfluenceGained | 0) + infGain;
      }
    }
    State.me.points = base;
    State.points.overflow = overflow;
    State.points.capNote = (base >= cap) ? "Кап: каждые 5 💰 -> +1 ⚡." : "";
    syncMeToPlayers();
    ensureNonNegativePoints();
    return State.me.points;
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
    withPointsWrite(() => {
      State.me.points = cur - (n | 0);
      if (!State.points) State.points = { lastChatRewardAt: 0, overflow: 0, capNote: "" };
      State.points.overflow = 0;
      State.points.capNote = "";
    });
    syncMeToPlayers();
    ensureNonNegativePoints();
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
})();
