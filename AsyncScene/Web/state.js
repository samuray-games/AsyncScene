// state.js
window.Game = window.Game || {};

(() => {
  const Game = window.Game;
  if (!Game.__DEV || typeof Game.__DEV !== "object") Game.__DEV = {};
  let ReactionPolicy = null;
  const REP_EMITTER_DAILY_CAP = 20;
  const RESPECT_REASON_CODES = Object.freeze({
    POINTS_COST: "points_respect_cost",
    REP_GIVEN: "rep_respect_given",
    REP_EMITTER_REFILL: "rep_emitter_refill",
    BLOCK_PREFIX: "respect_block_",
  });
  let respectEntrypointLogged = false;
  function logRespectEntrypointReady(){
    if (respectEntrypointLogged) return;
    respectEntrypointLogged = true;
    try {
      console.log("ECON08_RESPECT_ENTRYPOINT_READY");
    } catch (_) {}
  }

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

  function dayKeyFromNowTs(nowTs){
    const stamp = Number.isFinite(nowTs) ? nowTs : Date.now();
    const d = new Date(stamp);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function ensureRespectLedger(){
    ensureProgress();
    if (!State.progress.respectLedger || typeof State.progress.respectLedger !== "object") {
      State.progress.respectLedger = {
        lastByPairDay: Object.create(null),
        lastInboundDay: Object.create(null),
      };
    }
    const ledger = State.progress.respectLedger;
    if (!ledger.lastByPairDay || typeof ledger.lastByPairDay !== "object") {
      ledger.lastByPairDay = Object.create(null);
    }
    if (!ledger.lastInboundDay || typeof ledger.lastInboundDay !== "object") {
      ledger.lastInboundDay = Object.create(null);
    }
    return ledger;
  }

  function ensureRepEmitter(nowTs){
    ensureProgress();
    const dayKey = dayKeyFromNowTs(nowTs);
    if (!State.progress.repEmitter || typeof State.progress.repEmitter !== "object") {
      State.progress.repEmitter = { balance: 0, dayKey: "", lastRefillLoggedDayKey: "" };
    }
    const emitter = State.progress.repEmitter;
    let emitterRefilled = false;
    if (emitter.dayKey !== dayKey) {
      emitter.dayKey = dayKey;
      emitter.balance = REP_EMITTER_DAILY_CAP;
      emitterRefilled = true;
    }
    if (!Number.isFinite(emitter.balance)) emitter.balance = 0;
    return { emitter, dayKey, emitterRefilled };
  }

  function ensurePool(container, key){
    if (!container[key] || typeof container[key] !== "object") {
      container[key] = Object.create(null);
    }
    return container[key];
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
      withRepWrite(() => {
        State.rep = (State.rep | 0) - need;
      });
      State.me.influence = (State.me.influence | 0) + 1;
      State.progress.weeklyInfluenceGained = (State.progress.weeklyInfluenceGained | 0) + 1;
      loops++;
      if (loops > 50) break;
    }
    // UI side-effects are out-of-scope for state layer.
  }

  function addRep(amount, reason, meta){
    if (!isDevFlag()) {
      try { console.warn("[REP] addRep blocked in prod", reason); } catch (_) {}
      return 0;
    }
    const meId = (State.me && State.me.id) ? State.me.id : "me";
    if (ReactionPolicy && ReactionPolicy.isActionBlocked(meId, "economy")) {
      return State.rep | 0;
    }
    if (!Security.isSafe()) {
      Security.emit("tamper_function", { key: "addRep", action: "call", reason: "blocked", mode: isDevFlag() ? "dev" : "prod" });
      return State.rep | 0;
    }
    const n = Number(amount || 0);
    if (!Number.isFinite(n) || n === 0) return 0;
    const rl = Security.rateLimit("rep_add", {
      actorId: (State.me && State.me.id) ? String(State.me.id) : "me",
      reason: reason || "addRep",
      battleId: meta && meta.battleId,
      actionId: meta && meta.actionId
    }, { max: 3, windowMs: 1200, burst: 2 });
    if (!rl.ok) {
      Security.emit("rate_limit", { action: "rep_add", reason: reason || "addRep", battleId: meta && meta.battleId, key: rl.key, resetIn: rl.resetIn });
      return State.rep | 0;
    }
    if (!Number.isFinite(State.rep)) {
      withRepWrite(() => {
        State.rep = 0;
      });
    }
    const guardMeta = {
      reason: reason || "addRep",
      actionId: meta && meta.actionId,
      battleId: meta && meta.battleId,
      context: meta && meta.context,
    };
    const guard = ResourceValidator.claim("rep", guardMeta);
    if (!guard.ok) {
      return State.rep | 0;
    }
    let success = false;
    try {
      withRepWrite(() => {
        State.rep = (State.rep | 0) + (n | 0);
      });
      applyRepConversion();
      syncMeToPlayers();
      success = true;
      return State.rep | 0;
    } finally {
      ResourceValidator.release(guard.key, success);
    }
  }

  function giveRespect(fromId, toId, nowTs){
    logRespectEntrypointReady();
    const actorId = (typeof fromId === "string" && fromId) ? fromId : (State.me && State.me.id) ? State.me.id : "me";
    const targetId = (typeof toId === "string") ? toId : (toId != null ? String(toId) : "");
    const timestamp = Number.isFinite(nowTs) ? nowTs : Date.now();
    const dayKey = dayKeyFromNowTs(timestamp);
    const ledger = ensureRespectLedger();
    const pairMap = ensurePool(ledger.lastByPairDay, actorId);
    const inboundMap = ensurePool(ledger.lastInboundDay, targetId);
    const opKey = `respect:${dayKey}:${actorId}:${targetId}`;
    const meta = {
      fromId: actorId,
      toId: targetId,
      nowTs: timestamp,
      op: "respect",
      opKey,
      stub: true,
      dayKey,
    };

    const blockedResponse = (reason) => ({
      ok: false,
      reason,
      delta: { points: 0, rep: 0 },
      meta: { ...meta, blocked: true },
    });

    if (!targetId) {
      return blockedResponse("respect_pair_daily");
    }

    if (actorId === targetId) {
      return blockedResponse("respect_self");
    }

    const actorDay = ledger.lastByPairDay[actorId];
    if (actorDay && actorDay[targetId] === dayKey) {
      return blockedResponse("respect_pair_daily");
    }

    const reverseDay = ledger.lastByPairDay[targetId];
    if (reverseDay && reverseDay[actorId] === dayKey) {
      return blockedResponse("respect_no_chain");
    }

    const emitterState = ensureRepEmitter(timestamp);
    if (emitterState.emitter.balance < 1) {
      return {
        ok: false,
        reason: "respect_emitter_empty",
        delta: { points: 0, rep: 0 },
        meta: {
          ...meta,
          blocked: true,
          emitterBalance: emitterState.emitter.balance,
          emitterDailyCap: REP_EMITTER_DAILY_CAP,
          emitterRefilled: !!emitterState.emitterRefilled,
        },
      };
    }

    const Econ = getEcon();
    let pay = null;
    if (Econ && typeof Econ.transferPoints === "function") {
      pay = Econ.transferPoints(actorId, "sink", 1, RESPECT_REASON_CODES.POINTS_COST, {
        opKey,
        dayKey,
        op: "respect",
        fromId: actorId,
        toId: targetId,
        stub: true,
      });
    }
    if (!pay || pay.ok === false) {
      return {
        ok: false,
        reason: "respect_no_points",
        delta: { points: 0, rep: 0 },
        meta: {
          ...meta,
          blocked: true,
          payReason: pay && pay.reason ? pay.reason : "transfer_failed",
        },
      };
    }

    if (emitterState.emitterRefilled && emitterState.emitter.lastRefillLoggedDayKey !== dayKey) {
      emitterState.emitter.lastRefillLoggedDayKey = dayKey;
      logRepTransfer({
        time: Date.now(),
        sourceId: "rep_emitter",
        targetId: "rep_emitter",
        amount: 0,
        reason: RESPECT_REASON_CODES.REP_EMITTER_REFILL,
        battleId: opKey,
        currency: "rep",
        meta: { dayKey, cap: REP_EMITTER_DAILY_CAP, op: "respect", opKey }
      });
    }

    emitterState.emitter.balance -= 1;
    transferRep("rep_emitter", targetId, 1, RESPECT_REASON_CODES.REP_GIVEN, opKey, {
      fromId: actorId,
      toId: targetId,
      dayKey,
      opKey,
      op: "respect",
    });
    pairMap[targetId] = dayKey;
    inboundMap[actorId] = dayKey;

    return {
      ok: true,
      reason: RESPECT_REASON_CODES.REP_GIVEN,
      delta: { points: -1, rep: 1 },
      meta: {
        ...meta,
        emitterBalanceAfter: emitterState.emitter.balance,
        emitterDailyCap: REP_EMITTER_DAILY_CAP,
        emitterRefilled: !!emitterState.emitterRefilled,
      },
    };
  }

  function getRepAccount(id){
    if (!id) return null;
    if (id === "crowd_pool" || id === "daily_pool") {
      if (!Game.__D || typeof Game.__D !== "object") Game.__D = {};
      if (!Game.__D.repPools || typeof Game.__D.repPools !== "object") Game.__D.repPools = {};
      if (!Game.__D.repPools[id]) Game.__D.repPools[id] = { id, rep: 1000, pool: true };
      return Game.__D.repPools[id];
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
    if (!Game.__D || typeof Game.__D !== "object") Game.__D = {};
    if (!Array.isArray(Game.__D.moneyLog)) Game.__D.moneyLog = [];
    if (!Game.__D.moneyLogByBattle || typeof Game.__D.moneyLogByBattle !== "object") Game.__D.moneyLogByBattle = {};
    Game.__D.moneyLog.push(entry);
    const bid = entry && entry.battleId ? String(entry.battleId) : "";
    if (bid) {
      if (!Array.isArray(Game.__D.moneyLogByBattle[bid])) Game.__D.moneyLogByBattle[bid] = [];
      Game.__D.moneyLogByBattle[bid].push(entry);
    }
  }

  function getPointsEmissionCallsite(){
    try {
      const err = new Error("POINTS_EMISSION_BLOCKED");
      const lines = String(err && err.stack ? err.stack : "").split("\n").map(x => x.trim()).filter(Boolean);
      return lines[3] || lines[2] || lines[1] || "";
    } catch (_) {
      return "";
    }
  }

  function logPointsEmissionBlocked(callsite, amount, reason, meta, targetId){
    const Econ = (Game && (Game.ConflictEconomy || Game._ConflictEconomy)) ? (Game.ConflictEconomy || Game._ConflictEconomy) : null;
    const amt = Number.isFinite(amount) ? (amount | 0) : 0;
    const entry = {
      time: Date.now(),
      reason: "points_emission_blocked",
      currency: "points",
      amount: amt,
      sourceId: "emitter",
      targetId: targetId || "me",
      battleId: meta && meta.battleId ? meta.battleId : null,
      eventId: meta && meta.eventId ? meta.eventId : null,
      meta: {
        callsite: callsite || "",
        amount: amt,
        targetId: targetId || "me",
        reason: reason || "addPoints"
      }
    };
    if (Econ && typeof Econ._logTx === "function") {
      Econ._logTx(entry);
      return;
    }
    if (!Game.__D || typeof Game.__D !== "object") Game.__D = {};
    if (!Array.isArray(Game.__D.moneyLog)) Game.__D.moneyLog = [];
    if (!Game.__D.moneyLogByBattle || typeof Game.__D.moneyLogByBattle !== "object") Game.__D.moneyLogByBattle = {};
    Game.__D.moneyLog.push(entry);
    const bid = entry && entry.battleId ? String(entry.battleId) : "";
    if (bid) {
      if (!Array.isArray(Game.__D.moneyLogByBattle[bid])) Game.__D.moneyLogByBattle[bid] = [];
      Game.__D.moneyLogByBattle[bid].push(entry);
    }
  }

  const SILENT_REASON_TOKENS = ["dev", "migration", "internal"];
  const SILENT_WORLD_REASONS = new Set([
    "world_tax_in",
    "world_tax_out",
    "world_stipend_out",
    "npc_account_init",
    "npc_account_sync",
    "npc_activity_tax",
    "crowd_cap_debug"
  ]);

  function isSilentOkReason(reason, involvesMe){
    if (!reason) return false;
    const normalized = String(reason || "").toLowerCase();
    if (!normalized) return false;
    for (const token of SILENT_REASON_TOKENS) {
      if (normalized === token) return true;
      if (normalized.startsWith(token)) return true;
      if (normalized.includes(`_${token}`)) return true;
    }
    if (!involvesMe && SILENT_WORLD_REASONS.has(normalized)) return true;
    return false;
  }

  function shouldToastRow(row){
    if (!row || typeof row !== "object") return false;
    const involvesMe = (String(row.sourceId || "") === "me") || (String(row.targetId || "") === "me");
    if (!involvesMe) return false;
    const amountSource = (row.amount !== undefined) ? row.amount : ((row.delta !== undefined) ? row.delta : 0);
    const amount = Number(amountSource);
    if (!Number.isFinite(amount) || amount === 0) return false;
    const currencyCandidate = String(row.currency || row.kind || "points").toLowerCase();
    if (currencyCandidate !== "points" && currencyCandidate !== "rep") return false;
    const reason = String(row.reason || (row.meta && row.meta.reason) || "").trim();
    if (isSilentOkReason(reason, involvesMe)) return false;
    return true;
  }

  function pushMoneyLogRow(row){
    const entry = (row && typeof row === "object") ? row : {};
    if (!Game.__D || typeof Game.__D !== "object") Game.__D = {};
    const dbg = Game.__D;
    if (!Array.isArray(dbg.moneyLog)) dbg.moneyLog = [];
    if (!dbg.moneyLogByBattle || typeof dbg.moneyLogByBattle !== "object") dbg.moneyLogByBattle = {};
    const timestamp = Number.isFinite(entry.time) ? entry.time : (Number.isFinite(entry.ts) ? entry.ts : Date.now());
    const candidateCurrency = String(entry.currency || entry.kind || "points").toLowerCase();
    const currency = (candidateCurrency === "rep") ? "rep" : "points";
    const amountSource = (entry.amount !== undefined) ? entry.amount : ((entry.delta !== undefined) ? entry.delta : 0);
    const parsedAmount = Number(amountSource);
    const amount = Number.isFinite(parsedAmount) ? parsedAmount : 0;
    const reasonSource = entry.reason || (entry.meta && entry.meta.reason) || entry.kind || "";
    const reason = String(reasonSource || "").trim();
    const txId = entry.txId ? String(entry.txId) : `tx_${timestamp}_${Math.random().toString(16).slice(2)}`;
    const meta = (entry.meta && typeof entry.meta === "object") ? Object.assign({}, entry.meta) : {};
    if (entry.delta !== undefined && meta.delta === undefined) {
      meta.delta = entry.delta;
    }
    const normalized = Object.assign({}, entry, {
      time: timestamp,
      ts: timestamp,
      currency,
      amount,
      reason,
      txId,
      meta
    });
    normalized.toastExpected = shouldToastRow(normalized);
    dbg.moneyLog.push(normalized);
    const logIndex = dbg.moneyLog.length - 1;
    const result = { txId, logIndex };
    const battleId = normalized.battleId ? String(normalized.battleId) : "";
    if (battleId) {
      if (!Array.isArray(dbg.moneyLogByBattle[battleId])) dbg.moneyLogByBattle[battleId] = [];
      dbg.moneyLogByBattle[battleId].push(normalized);
      result.battleLogIndex = dbg.moneyLogByBattle[battleId].length - 1;
    }
    return result;
  }

  function calcEconToastTs(){
    if (!Game.__D || typeof Game.__D !== "object") Game.__D = {};
    const dbg = Game.__D;
    const nowMs = Date.now();
    if (!Number.isFinite(dbg._econToastLastMs) || dbg._econToastLastMs !== nowMs) {
      dbg._econToastSeq = 0;
      dbg._econToastLastMs = nowMs;
    }
    const seq = Number.isFinite(dbg._econToastSeq) ? (dbg._econToastSeq | 0) : 0;
    const ts = nowMs + (seq * 0.001);
    dbg._econToastSeq = seq + 1;
    return ts;
  }

  function resolveMoneyLogRow(ref){
    if (!ref || typeof ref !== "object") return null;
    if (!Game.__D || typeof Game.__D !== "object") return null;
    const dbg = Game.__D;
    if (!Array.isArray(dbg.moneyLog)) return null;
    const logIndex = Number.isFinite(ref.logIndex) ? ref.logIndex : null;
    if (logIndex !== null) {
      return dbg.moneyLog[logIndex] || null;
    }
    const txId = ref.txId ? String(ref.txId) : null;
    if (txId) {
      return dbg.moneyLog.find(row => row && String(row.txId || "") === txId) || null;
    }
    return null;
  }

  function formatEconToastText(payload){
    const icons = { rep: "⭐", points: "💰" };
    const currency = String(payload.currency || "points").toLowerCase();
    const icon = icons[currency] || "";
    const amount = Number.isFinite(payload.amount) ? payload.amount : 0;
    const sign = amount > 0 ? "+" : amount < 0 ? "" : "";
    const textAmount = `${sign}${amount}`;
    const reason = payload.reason ? ` ${payload.reason}` : "";
    return `${icon}${textAmount}${reason}`.trim();
  }

  function createEconPayload(row){
    if (!row || typeof row !== "object") return null;
    const currency = String(row.currency || row.kind || "points").toLowerCase() === "rep" ? "rep" : "points";
    const amount = Number.isFinite(row.amount) ? row.amount : ((row.delta !== undefined) ? Number(row.delta) : 0);
    return {
      currency,
      amount,
      reason: row.reason,
      sourceId: row.sourceId,
      targetId: row.targetId,
      battleId: row.battleId,
      eventId: row.eventId
    };
  }

  function formatEconDelta(row){
    const payload = createEconPayload(row) || {
      currency: String(row.currency || row.kind || "points").toLowerCase() === "rep" ? "rep" : "points",
      amount: Number.isFinite(row.amount) ? row.amount : ((row.delta !== undefined) ? Number(row.delta) : 0),
      reason: row.reason,
      sourceId: row.sourceId,
      targetId: row.targetId,
      battleId: row.battleId,
      eventId: row.eventId
    };
    if (!payload) return "";
    return formatEconToastText(payload);
  }

  function logEconToastSideEffect(fn, detail){
    if (!fn) return;
    if (!Game || !Game.__D || typeof Game.__D !== "object") return;
    const dbg = Game.__D;
    if (!Array.isArray(dbg.__econToastForbiddenCalls)) dbg.__econToastForbiddenCalls = [];
    dbg.__econToastForbiddenCalls.push({
      fn,
      detail: (detail && typeof detail === "object") ? Object.assign({}, detail) : detail,
      ts: Date.now()
    });
    try {
      console.warn("ECON_UI4_FORBIDDEN_UI_SIDE_EFFECT", { fn, detail });
    } catch (_) {}
  }

  function sanitizePanelList(flags){
    if (Array.isArray(flags)) return flags.slice();
    if (!flags) return null;
    try {
      return Array.from(flags).slice();
    } catch (_) {
      return null;
    }
  }

  function capturePanelStateSig(){
    const notes = [];
    let flags = null;
    if (Game && Game.__S && Game.__S.flags) {
      flags = Game.__S.flags;
    } else if (Game && Game.State && Game.State.flags) {
      flags = Game.State.flags;
    }
    const panelState = {
      activePanel: null,
      openPanels: null,
      activeChip: null,
      dmOpen: null,
      battlesOpen: null,
      eventsOpen: null
    };
    if (flags && typeof flags === "object") {
      panelState.activePanel = flags.activePanel || flags.activePanelId || null;
      panelState.openPanels = sanitizePanelList(flags.openPanels) || null;
      panelState.activeChip = flags.activeChip || flags.activeChipId || null;
      if (flags.dmHidden === true) panelState.dmOpen = false;
      else if (flags.dmHidden === false) panelState.dmOpen = true;
      if (flags.battlesHidden === true) panelState.battlesOpen = false;
      else if (flags.battlesHidden === false) panelState.battlesOpen = true;
      panelState.eventsOpen = (flags.eventsOpen === undefined) ? null : !!flags.eventsOpen;
    } else {
      notes.push("panelFlags_missing");
    }
    if (!panelState.openPanels && typeof document !== "undefined" && document && document.querySelectorAll) {
      try {
        const panelEls = document.querySelectorAll(".panel:not(.hidden), .panel.panel--full, .card:not(.hidden)");
        const ids = Array.from(panelEls || []).map(el => String(el.id || (el.dataset ? el.dataset.panelKey : "") || el.className || "").trim()).filter(Boolean);
        panelState.openPanels = ids.length ? ids : null;
        if (ids.length) notes.push("panelList_from_dom");
      } catch (_) {}
    }
    if (panelState.activePanel === null && typeof document !== "undefined" && document && document.querySelector) {
      try {
        const activeEl = document.querySelector(".panel.panel--full, .panel.is-open, .card.panel--full");
        if (activeEl) {
          panelState.activePanel = activeEl.id || (activeEl.dataset ? activeEl.dataset.panelKey : null) || null;
          notes.push("activePanel_from_dom");
        }
      } catch (_) {}
    }
    return { panelStateSig: panelState, notes };
  }

  function captureFocusSig(){
    const sig = { tag: null, id: null, cls: null };
    if (typeof document === "undefined" || !document) return sig;
    try {
      const active = document.activeElement;
      if (!active) return sig;
      sig.tag = String(active.tagName || "").toLowerCase() || null;
      sig.id = active.id || null;
      const cls = (active.getAttribute && active.getAttribute("class")) ? active.getAttribute("class") : active.className;
      sig.cls = cls ? String(cls) : null;
    } catch (_) {}
    return sig;
  }

  function sigEqual(a, b){
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch (_) {
      return false;
    }
  }

  function summarizeArg(arg){
    if (arg == null) return null;
    if (typeof arg === "string" || typeof arg === "number" || typeof arg === "boolean") return arg;
    if (typeof arg === "object") {
      if (typeof HTMLElement !== "undefined" && arg instanceof HTMLElement) {
        return {
          tag: String(arg.tagName || "").toLowerCase(),
          id: String(arg.id || ""),
          cls: String(arg.className || "")
        };
      }
      if (arg && typeof arg.id === "string" && typeof arg.tagName === "string") {
        return { tag: arg.tagName, id: arg.id };
      }
      try {
        return JSON.stringify(arg);
      } catch (_) {
        return null;
      }
    }
    return null;
  }

  function wrapUiSideEffect(name){
    if (!Game || !Game.UI) return;
    const target = Game.UI[name];
    if (typeof target !== "function" || target.__econGuarded) return;
    Game.UI[name] = function(...args){
      if (Game && Game.__D && Game.__D.__econToastInFlight) {
        logEconToastSideEffect(name, { args: args.map(summarizeArg).filter(x => x != null) });
      }
      return target.apply(this, args);
    };
    Game.UI[name].__econGuarded = true;
  }

  function wrapDomMethod(proto, methodName, label){
    if (!proto || typeof proto.prototype === "undefined") return;
    const original = proto.prototype[methodName];
    if (typeof original !== "function" || original.__econPatched) return;
    proto.prototype[methodName] = function(...args){
      if (Game && Game.__D && Game.__D.__econToastInFlight) {
        logEconToastSideEffect(label, {
          tag: this && this.tagName ? String(this.tagName).toLowerCase() : null,
          id: this && this.id ? String(this.id) : null,
          cls: this && this.className ? String(this.className) : null,
          args: args.map(summarizeArg).filter(x => x != null)
        });
      }
      return original.apply(this, args);
    };
    proto.prototype[methodName].__econPatched = true;
  }

  function installEconUiSideEffectGuards(){
    const guardNames = [
      "openDM",
      "openDMByName",
      "openDMBySpeakerId",
      "openBattlesAndScroll",
      "openEventsPanel",
      "ensureEventsExpanded",
      "highlightEventById",
      "scrollToEventByBattleId"
    ];
    for (const name of guardNames) {
      wrapUiSideEffect(name);
    }
    if (typeof HTMLElement !== "undefined") {
      wrapDomMethod(HTMLElement, "focus", "element.focus");
    }
    if (typeof Element !== "undefined") {
      wrapDomMethod(Element, "scrollIntoView", "element.scrollIntoView");
    }
    if (typeof window !== "undefined" && typeof window.scrollTo === "function") {
      const originalScrollTo = window.scrollTo;
      if (!originalScrollTo.__econPatched) {
        window.scrollTo = function(...args){
          if (Game && Game.__D && Game.__D.__econToastInFlight) {
            logEconToastSideEffect("window.scrollTo", { args: args.map(summarizeArg).filter(x => x != null) });
          }
          return originalScrollTo.apply(this, args);
        };
        window.scrollTo.__econPatched = true;
      }
    }
  }

  function emitEconToastNow(row, toast, overrideText){
    if (!row || !toast) return;
    const text = String(overrideText || toast.text || row.reason || "");
    if (!text) return;
    const kind = String(row.currency || "points").toLowerCase() === "rep" ? "rep" : "points";
    try {
      if (Game && Game.UI && typeof Game.UI.showStatToast === "function") {
        Game.UI.showStatToast(kind, text);
      }
    } catch (_) {}
  }

  function pushEconToastFromLogRef(ref, overrideText){
    if (!ref || typeof ref !== "object") return null;
    if (!Game.__D || typeof Game.__D !== "object") return null;
    const dbg = Game.__D;
    if (!Array.isArray(dbg.moneyLog)) return { ok: false, reason: "moneylog_missing" };
    const indexCandidate = Number.isFinite(ref.logIndex) ? ref.logIndex : null;
    let row = (indexCandidate !== null) ? dbg.moneyLog[indexCandidate] : null;
    if (!row || (ref.txId && String(row.txId || "") !== String(ref.txId))) {
      row = resolveMoneyLogRow(ref);
    }
    if (!row) {
      if (Game && Game.__DEV && typeof Game.__DEV === "object") {
        console.warn("ECON_UI3_ROW_MISSING", { ref });
      }
      return { ok: false, reason: "row_not_found_for_toast", ref };
    }
    if (!row.reason) {
      if (Game && Game.__DEV && typeof Game.__DEV === "object") {
        console.warn("ECON_UI3_ROW_REASON_MISSING", { ref, txId: row.txId });
      }
      return { ok: false, reason: "row_missing_reason", ref, txId: row.txId };
    }
    if (!Array.isArray(dbg.toastLog)) dbg.toastLog = [];
    const already = dbg.toastLog.some(t => t && t.kind === "econ" && t.txId === row.txId);
    if (already) {
      if (Game && Game.__DEV && typeof Game.__DEV === "object") {
        console.warn("ECON_UI2_DUP_BLOCKED", { txId: row.txId });
      }
      return { skipped: true, reason: "dup_txId", txId: row.txId };
    }
    const payload = createEconPayload(row);
    const tsToast = calcEconToastTs();
    const logIndex = dbg.moneyLog.findIndex(r => r && String(r.txId || "") === String(row.txId));
    const toast = {
      kind: "econ",
      txId: row.txId,
      logIndex: (logIndex >= 0) ? logIndex : (indexCandidate !== null ? indexCandidate : 0),
      reason: row.reason,
      ts: tsToast,
      payload
    };
    if (!toast.text) {
      const defaultText = formatEconDelta(row);
      if (defaultText) toast.text = defaultText;
    }
    if (typeof overrideText === "string" && overrideText) {
      toast.text = overrideText;
    }
    dbg.toastLog.push(toast);
    const flagHolder = Game && Game.__D ? Game.__D : null;
    try {
      if (flagHolder) flagHolder.__econToastInFlight = true;
      emitEconToastNow(row, toast, overrideText);
    } finally {
      if (flagHolder) flagHolder.__econToastInFlight = false;
    }
    return toast;
  }

  function transferRep(fromId, toId, amount, reason, battleId, meta){
    const meId = (State.me && State.me.id) ? State.me.id : "me";
    if (ReactionPolicy && ReactionPolicy.isActionBlocked(meId, "economy") && ((fromId === meId) || (toId === meId))) {
      return { ok: false, reason: "security_blocked" };
    }
    if (!Security.isSafe()) {
      Security.emit("tamper_function", { key: "transferRep", action: "call", reason: "blocked", mode: isDevFlag() ? "dev" : "prod" });
      return { ok: false, reason: "security_tamper" };
    }
    const n = Number(amount || 0);
    if (!Number.isFinite(n) || n === 0) return { ok: false, reason: "bad_amount" };
    const rl = Security.rateLimit("rep_transfer", {
      actorId: (State.me && State.me.id) ? String(State.me.id) : "me",
      reason: reason || "rep_transfer",
      battleId,
      actionId: meta && meta.actionId,
      fromId,
      toId
    }, { max: 6, windowMs: 1200, burst: 4 });
    if (!rl.ok) {
      Security.emit("rate_limit", { action: "rep_transfer", reason: reason || "rep_transfer", battleId, fromId, toId, key: rl.key, resetIn: rl.resetIn });
      return { ok: false, reason: "rate_limited" };
    }
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
    const guardMeta = {
      reason: reason || "rep_transfer",
      battleId,
      actionId: meta && meta.actionId,
      context: meta && meta.context,
      fromId,
      toId,
    };
    const guard = ResourceValidator.claim("rep", guardMeta);
    if (!guard.ok) {
      return { ok: false, reason: guard.reason || "duplicate" };
    }
    let success = false;
    
    // Apply transfer with clipping to prevent negative (fix DUM-022 #2)
    if (!isEmitter) {
      if (fromId === "me") {
        withRepWrite(() => {
          State.rep = Math.max(0, (State.rep | 0) - amt);
        });
      } else {
        fromAcc.rep = Math.max(0, (fromAcc.rep | 0) - amt);
      }
    }
    if (toId === "me") {
      withRepWrite(() => {
        State.rep = Math.max(0, (State.rep | 0) + amt);
      });
    } else {
      toAcc.rep = Math.max(0, (toAcc.rep | 0) + amt);
    }
    if (fromId === "me" || toId === "me") {
      applyRepConversion();
      syncMeToPlayers();
    }
    const afterRep = (State.rep || 0) | 0;
    const afterInfluence = (State.me && Number.isFinite(State.me.influence)) ? (State.me.influence | 0) : 0;
    try {
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
      emitStatDelta("rep", afterRep - beforeRep, { reason: reason || "rep_transfer", battleId: battleId || null });
      emitStatDelta("influence", afterInfluence - beforeInfluence, { reason: reason || "rep_transfer", battleId: battleId || null });
      success = true;
      return { ok: true, amount: amt };
    } finally {
      ResourceValidator.release(guard.key, success);
    }
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
    return true;
  }

  function getEcon(){
    return (Game && Game._ConflictEconomy) ? Game._ConflictEconomy : null;
  }

  function getPointsActor(actorId){
    const id = (actorId != null) ? String(actorId) : "me";
    const meId = (State.me && State.me.id) ? String(State.me.id) : "me";
    if (id === "me" || id === meId) return State.me || null;
    if (State.players && State.players[id]) return State.players[id];
    return null;
  }

  function applySocialPenalty(action, actorId, opts = null){
    const cfg = (opts && typeof opts === "object") ? opts : {};
    const reason = String(cfg.reason || "social_penalty");
    const actorKey = (actorId != null) ? String(actorId) : "me";
    const actor = getPointsActor(actorKey);
    const amountWanted = Number.isFinite(cfg.amountWanted) ? (cfg.amountWanted | 0) : 0;
    if (!actor || !Number.isFinite(actor.points)) {
      return {
        ok: false,
        reason,
        amountWanted,
        amountActual: 0,
        partial: true,
        pointsBefore: 0,
        pointsAfter: 0
      };
    }
    const pointsBefore = actor.points | 0;
    const amountActual = Math.max(0, Math.min(amountWanted | 0, Math.max(0, pointsBefore | 0)));
    const partial = amountActual !== amountWanted;
    let pointsAfter = pointsBefore;
    let ok = true;
    const Econ = (Game && (Game._ConflictEconomy || Game.ConflictEconomy)) ? (Game._ConflictEconomy || Game.ConflictEconomy) : null;
    if (Econ && typeof Econ.transferPoints === "function" && amountActual > 0) {
      const meta = Object.assign({}, (cfg.meta && typeof cfg.meta === "object") ? cfg.meta : {}, {
        action: String(action || "social_penalty"),
        targetId: cfg.targetId ? String(cfg.targetId) : null,
        amountWanted,
        amountActual,
        partial,
        pointsBefore,
        pointsAfter: null,
        key: cfg.key ? String(cfg.key) : null
      });
      const tx = Econ.transferPoints(actorKey, "sink", amountActual, reason, meta);
      ok = !(tx && tx.ok === false);
      const actorAfter = getPointsActor(actorKey);
      pointsAfter = (actorAfter && Number.isFinite(actorAfter.points)) ? (actorAfter.points | 0) : (pointsBefore - amountActual);
      meta.pointsAfter = pointsAfter;
    }
    return {
      ok,
      reason,
      amountWanted,
      amountActual,
      partial,
      pointsBefore,
      pointsAfter
    };
  }

  function hasExplicitDevQueryParam() {
    if (typeof location === "undefined" || !location) return false;
    const search = location.search;
    if (!search) return false;
    try {
      const params = new URLSearchParams(search);
      return params.get("dev") === "1";
    } catch (_) {
      return false;
    }
  }

  function isDevFlag(){
    return (
      (typeof window !== "undefined" && (window.__DEV__ === true || window.DEV === true)) ||
      hasExplicitDevQueryParam()
    );
  }

  function defineGameSurfaceProp(name, internalName) {
    if (!Game || !internalName) return;
    if (Object.getOwnPropertyDescriptor(Game, name)) return;
    Object.defineProperty(Game, name, {
      configurable: false,
      enumerable: false,
      get() {
        if (!isDevFlag()) {
          emitForbiddenAccess(`Game.${name}`, "get");
          return undefined;
        }
        return Game[internalName];
      },
      set(value) {
        if (!isDevFlag()) {
          emitForbiddenAccess(`Game.${name}`, "set");
          return;
        }
        Game[internalName] = value;
      }
    });
  }

  if (typeof window !== "undefined") {
    if (isDevFlag()) {
      window.__defineGameSurfaceProp = window.__defineGameSurfaceProp || defineGameSurfaceProp;
    } else if (window.__defineGameSurfaceProp === defineGameSurfaceProp) {
      try {
        delete window.__defineGameSurfaceProp;
      } catch (_) {
        window.__defineGameSurfaceProp = undefined;
      }
    }
  }

  function tryRemove(propTarget, propName){
    if (!propTarget || typeof propTarget !== "object") return;
    try {
      delete propTarget[propName];
    } catch (_) {
      propTarget[propName] = undefined;
    }
  }

  if (typeof window !== "undefined" && !isDevFlag()) {
    tryRemove(Game, "Dev");
    tryRemove(Game, "__DEV");
    tryRemove(window, "__defineGameSurfaceProp");
  }

  let pointsWriteDepth = 0;
  function withPointsWrite(fn){
    pointsWriteDepth++;
    try { return fn(); } finally { pointsWriteDepth = Math.max(0, pointsWriteDepth - 1); }
  }

  function canWritePoints(){
    const dbg = (Game && Game.__D) ? Game.__D : null;
    const allowDev = !!(dbg && (dbg.ALLOW_POINTS_WRITE === true || dbg.BYPASS_POINTS_GUARD === true));
    return !isCirculationEnabled() || pointsWriteDepth > 0 || allowDev;
  }

  function rejectPointsWrite(action){
    const msg = "Циркуляция: прямое изменение баланса заблокировано";
    const dbg = (Game && Game.__D) ? Game.__D : null;
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
          const labelPath = label || "State.me.points";
          const reason = Number.isFinite(v) ? "unauthorized_points_write" : "invalid_number";
          emitInvalidMutation(labelPath, next, reason);
          rejectPointsWrite(label || "points");
          return;
        }
        store = next;
      }
    });
 }

  const RESOURCE_DUPLICATE_WINDOW_MS = 1400;
  const ResourceValidator = (() => {
    const recent = new Map();
    const locked = new Set();

    function now(){ return Date.now(); }

    function cleanup(){
      const stamp = now();
      for (const [key, ts] of recent) {
        if ((stamp - ts) > RESOURCE_DUPLICATE_WINDOW_MS) {
          recent.delete(key);
        }
      }
    }

    function readValue(kind){
      const runtime = (Game && Game.__S) ? Game.__S : (typeof State !== "undefined" ? State : null);
      if (!runtime) return 0;
      if (kind === "points") {
        const points = runtime.me && Number.isFinite(runtime.me.points) ? (runtime.me.points | 0) : 0;
        return points;
      }
      if (kind === "rep") {
        return Number.isFinite(runtime.rep) ? (runtime.rep | 0) : 0;
      }
      if (kind === "influence") {
        const inf = runtime.me && Number.isFinite(runtime.me.influence) ? (runtime.me.influence | 0) : 0;
        return inf;
      }
      return 0;
    }

    function makeKey(kind, meta){
      const reason = (meta && meta.reason) ? String(meta.reason) : "";
      const actionId = (meta && meta.actionId) ? String(meta.actionId) : "";
      const battleId = (meta && meta.battleId != null) ? String(meta.battleId) : "";
      const context = (meta && meta.context) ? String(meta.context) : "";
      const fromId = (meta && meta.fromId) ? String(meta.fromId) : "";
      const toId = (meta && meta.toId) ? String(meta.toId) : "";
      return `${kind}:${battleId}:${actionId}:${fromId}:${toId}:${reason}:${context}`;
    }

    return {
      claim(kind, meta){
        cleanup();
        const key = makeKey(kind, meta || {});
        const stamp = now();
        if (recent.has(key) && (stamp - recent.get(key)) < RESOURCE_DUPLICATE_WINDOW_MS) {
          return { ok: false, key, reason: "duplicate" };
        }
        if (locked.has(key)) {
          return { ok: false, key, reason: "in_progress" };
        }
        locked.add(key);
        return { ok: true, key, before: readValue(kind) };
      },
      release(key, success){
        if (!key) return;
        locked.delete(key);
        if (success) {
          recent.set(key, now());
        }
      }
    };
  })();

  const Security = (() => {
    const OWNER_DM_TARGET = "security_owner";
    const OWNER_DM_NAME = "Служба безопасности";

    const SEC = {
      events: [],
      notices: [],
      maxEvents: 120,
      maxNotices: 50,
      lastEmit: new Map(),
      lastNotify: new Map(),
      buckets: new Map(),
      methods: [],
      handles: [],
      tampered: false,
      lastVerifyAt: 0,
      bootPhase: true,
    };

    function now(){ return Date.now(); }
    function mode(){ return isDevFlag() ? "dev" : "prod"; }

    function safeStr(v){
      if (v == null) return "";
      try { return String(v); } catch (_) { return ""; }
    }

    function readStateSafe(){
      try { return State; } catch (_) { return null; }
    }

    function readPlayerId(){
      const state = readStateSafe();
      if (state && state.me && state.me.id) return String(state.me.id);
      const fallback = (Game && Game.__S && Game.__S.me && Game.__S.me.id) ? Game.__S.me.id : null;
      if (fallback) return String(fallback);
      return "me";
    }

    function readSessionId(){
      if (Game && Game.Logger && Game.Logger.sessionId) {
        return String(Game.Logger.sessionId);
      }
      if (typeof window !== "undefined" && window.sessionId) {
        return String(window.sessionId);
      }
      return "";
    }

    function describeEventDetails(details){
      if (!details || typeof details !== "object") return "";
      const parts = [];
      if (details.key) parts.push(`key=${safeStr(details.key)}`);
      if (details.action) parts.push(`action=${safeStr(details.action)}`);
      if (details.reason) parts.push(`reason=${safeStr(details.reason)}`);
      if (!parts.length && details.description) parts.push(String(details.description));
      return parts.join("; ");
    }

    function deliverOwnerDm(ev){
      if (!ev || !ev.time) return;
      const state = readStateSafe();
      if (!state || !state.dm) return;
      const lines = [];
      lines.push(`Тип: ${ev.type}`);
      lines.push(`Игрок: ${ev.playerId || "unknown"}`);
      lines.push(`Сессия: ${ev.sessionId || "—"}`);
      lines.push(`Время: ${new Date(ev.time).toISOString()}`);
      const desc = describeEventDetails(ev.meta);
      if (desc) lines.push(`Описание: ${desc}`);
      try {
        pushDm(OWNER_DM_TARGET, OWNER_DM_NAME, lines.join("\n"), { isSystem: true });
      } catch (_) {}
    }

    function buildEventKey(type, details){
      const base = safeStr(type);
      const key = details && details.key ? safeStr(details.key) : "";
      const action = details && details.action ? safeStr(details.action) : "";
      const reason = details && details.reason ? safeStr(details.reason) : "";
      if (key) return `${base}:${key}`;
      if (action || reason) return `${base}:${action}:${reason}`;
      return base;
    }

    function pushRing(arr, item, max){
      arr.push(item);
      if (arr.length > max) arr.splice(0, arr.length - max);
    }

    const DEBUG_SECURITY_EVENTS_STORE = "__debugSecurityEventsStore";

    function ensureSecurityEventsArray(){
      if (typeof Game !== "object" || !Game) return;
      if (!Game.__D) Game.__D = {};
      if (!Array.isArray(Game.__D.securityEvents)) Game.__D.securityEvents = [];
      if (!isDevFlag()) return;
      const debugSurface = (Game && Game.Debug && typeof Game.Debug === "object") ? Game.Debug : null;
      if (!debugSurface) return;
      const storeExists = Object.prototype.hasOwnProperty.call(debugSurface, DEBUG_SECURITY_EVENTS_STORE);
      if (!storeExists) {
        const existing = Array.isArray(Game.__D.securityEvents) ? Game.__D.securityEvents : [];
        Object.defineProperty(debugSurface, DEBUG_SECURITY_EVENTS_STORE, {
          configurable: true,
          enumerable: false,
          writable: true,
          value: existing,
        });
      }
      const desc = Object.getOwnPropertyDescriptor(debugSurface, "securityEvents");
      if (desc && desc.get) return;
      Object.defineProperty(debugSurface, "securityEvents", {
        configurable: true,
        enumerable: false,
        get() {
          let arr = debugSurface[DEBUG_SECURITY_EVENTS_STORE];
          if (!Array.isArray(arr)) {
            arr = [];
            debugSurface[DEBUG_SECURITY_EVENTS_STORE] = arr;
          }
          return arr;
        },
        set(value) {
          if (!Array.isArray(value)) return;
          debugSurface[DEBUG_SECURITY_EVENTS_STORE] = value;
        },
      });
    }

    function shouldEmit(map, key, ttl){
      const stamp = now();
      const prev = map.get(key) || 0;
      if ((stamp - prev) < ttl) return 0;
      map.set(key, stamp);
      return stamp;
    }

    function emit(type, details, opts = null){
      if (SEC.bootPhase) return;
      const key = buildEventKey(type, details);
      const ttl = (opts && Number.isFinite(opts.minGapMs)) ? (opts.minGapMs | 0) : 1500;
      const stamp = shouldEmit(SEC.lastEmit, key, ttl);
      if (!stamp) return;
      const playerId = readPlayerId();
      const sessionId = readSessionId();
      const meta = (details && typeof details === "object") ? Object.assign({}, details) : {};
      const ev = {
        time: stamp,
        type: safeStr(type),
        playerId,
        sessionId,
        meta,
        details: meta,
        key,
        mode: mode(),
      };
      pushRing(SEC.events, ev, SEC.maxEvents);
      try {
        if (Game.__D && typeof Game.__D === "object") {
          ensureSecurityEventsArray();
          if (!Array.isArray(Game.__D.securityEvents)) Game.__D.securityEvents = [];
          pushRing(Game.__D.securityEvents, ev, SEC.maxEvents);
          if (ReactionPolicy && typeof ReactionPolicy.handleEvent === "function") {
            ReactionPolicy.handleEvent(ev);
          }
        }
      } catch (_) {}
      if (isDevFlag()) {
        try { console.warn("[SEC]", ev.type, ev.details); } catch (_) {}
      }
      if (!opts || opts.notify !== false) notifyOwner(ev);
    }

    function notifyOwner(ev){
      if (SEC.bootPhase) return;
      const detailKey = ev && ev.key ? safeStr(ev.key) : "";
      const key = `notify:${safeStr(ev && ev.type)}:${detailKey}`;
      const stamp = shouldEmit(SEC.lastNotify, key, 6000);
      if (!stamp) return;
      const notice = {
        time: stamp,
        type: safeStr(ev && ev.type),
        details: ev && ev.meta ? ev.meta : {},
      };
      pushRing(SEC.notices, notice, SEC.maxNotices);
      try {
        if (Game.__D && typeof Game.__D === "object") {
          if (!Array.isArray(Game.__D.securityNotices)) Game.__D.securityNotices = [];
          pushRing(Game.__D.securityNotices, notice, SEC.maxNotices);
        }
      } catch (_) {}
      if (isDevFlag()) {
        try { console.warn("[SEC:notify]", notice.type, notice.details); } catch (_) {}
      }
      deliverOwnerDm(ev);
    }

    function buildRateKey(action, details){
      const actorId = details && details.actorId ? safeStr(details.actorId) : "me";
      const reason = details && details.reason ? safeStr(details.reason) : "";
      const battleId = details && details.battleId != null ? safeStr(details.battleId) : "";
      const eventId = details && details.eventId != null ? safeStr(details.eventId) : "";
      const actionId = details && details.actionId ? safeStr(details.actionId) : "";
      const fromId = details && details.fromId ? safeStr(details.fromId) : "";
      const toId = details && details.toId ? safeStr(details.toId) : "";
      const stableKey = details && details.stableKey ? safeStr(details.stableKey) : "";
      if (stableKey) return `${safeStr(action)}:${stableKey}`;
      return `${safeStr(action)}:${actorId}:${reason}:${battleId}:${eventId}:${actionId}:${fromId}:${toId}`;
    }

    function rateLimit(action, details, cfg){
      const max = (cfg && Number.isFinite(cfg.max)) ? Number(cfg.max) : 4;
      const windowMs = (cfg && Number.isFinite(cfg.windowMs)) ? Number(cfg.windowMs) : 1200;
      const burst = (cfg && Number.isFinite(cfg.burst)) ? Number(cfg.burst) : max;
      const key = buildRateKey(action, details || {});
      const stamp = now();
      let b = SEC.buckets.get(key);
      if (!b) b = { tokens: burst, last: stamp };
      const elapsed = Math.max(0, stamp - b.last);
      const refill = (elapsed / windowMs) * max;
      b.tokens = Math.min(burst, b.tokens + refill);
      b.last = stamp;
      if (b.tokens < 1) {
        SEC.buckets.set(key, b);
        const resetIn = Math.ceil(((1 - b.tokens) * windowMs) / max);
        return { ok: false, key, resetIn, remaining: 0 };
      }
      b.tokens -= 1;
      SEC.buckets.set(key, b);
      return { ok: true, key, remaining: Math.floor(b.tokens) };
    }

    function finishBoot(){
      if (!SEC.bootPhase) return;
      SEC.bootPhase = false;
    }

    function defineHandleProp(name, value){
      if (!Game || !name) return;
      const desc = Object.getOwnPropertyDescriptor(Game, name);
      if (desc && desc.get && desc.get._secHandle) return;
      try {
        Object.defineProperty(Game, name, {
          configurable: false,
          enumerable: false,
          get() { return value; },
      set(v){
        if (v !== value) {
          SEC.tampered = true;
          emit("tamper_handle", { key: name, action: "set", mode: mode() });
          emitTamperDetected({ key: name, action: "set_handle", mode: mode() });
        }
      }
    });
        const g = Object.getOwnPropertyDescriptor(Game, name).get;
        if (g) g._secHandle = true;
      } catch (_) {}
      SEC.handles.push({ name, value });
    }

    function protectMethod(obj, key, fn, label){
      if (!obj || !key || typeof fn !== "function") return;
      const desc = Object.getOwnPropertyDescriptor(obj, key);
      if (desc && desc.get && desc.get._secProtected) return;
      try {
        Object.defineProperty(obj, key, {
          configurable: false,
          enumerable: true,
          get() { return fn; },
      set(v){
        if (v !== fn) {
          SEC.tampered = true;
          emit("tamper_function", { key: label || key, action: "set", mode: mode() });
          emitTamperDetected({ key: label || key, action: "set_function", mode: mode() });
        }
      }
    });
        const g = Object.getOwnPropertyDescriptor(obj, key).get;
        if (g) g._secProtected = true;
      } catch (_) {}
      SEC.methods.push({ obj, key, fn, label: label || key });
    }

    function verify(force){
      const stamp = now();
      if (!force && (stamp - SEC.lastVerifyAt) < 1500) return !SEC.tampered;
      SEC.lastVerifyAt = stamp;
      for (const h of SEC.handles) {
      try {
        if (Game[h.name] !== h.value) {
          SEC.tampered = true;
          emit("tamper_handle", { key: h.name, action: "swap", mode: mode() });
          emitTamperDetected({ key: h.name, action: "swap_handle", mode: mode() });
          defineHandleProp(h.name, h.value);
        }
      } catch (_) {}
      }
      for (const m of SEC.methods) {
      try {
        if (!m.obj || m.obj[m.key] !== m.fn) {
          SEC.tampered = true;
          emit("tamper_function", { key: m.label, action: "swap", mode: mode() });
          emitTamperDetected({ key: m.label, action: "swap_function", mode: mode() });
          protectMethod(m.obj, m.key, m.fn, m.label);
        }
      } catch (_) {}
      }
      return !SEC.tampered;
    }

    const store = { events: SEC.events, notices: SEC.notices, emit, notifyOwner };

  return {
      emit,
      notifyOwner,
      rateLimit,
      defineHandleProp,
      protectMethod,
      verify,
      isSafe: () => verify(false),
      finishBoot,
      store,
    };
  })();

  function captureSecurityStack(limit = 3){
    try {
      const err = new Error();
      const stack = err && err.stack ? String(err.stack) : "";
      const lines = stack.split("\n").map(x => x.trim()).filter(Boolean);
      return lines.slice(2, 2 + (limit || 0)).join(" | ");
    } catch (_) {
      return "";
    }
  }

  function securitySafeKey(value){
    if (value == null) return "";
    try {
      return String(value);
    } catch (_) {
      return "";
    }
  }

  function emitForbiddenAccess(key, action){
    Security.emit("forbidden_api_access", {
      key: securitySafeKey(key),
      action: securitySafeKey(action),
      stack: captureSecurityStack(3)
    }, { minGapMs: 1000 });
  }

  function emitInvalidMutation(path, value, reason){
    Security.emit("invalid_state_mutation", {
      path: securitySafeKey(path),
      value: (typeof value === "number") ? value : securitySafeKey(value),
      reason: securitySafeKey(reason),
      stack: captureSecurityStack(4)
    }, { minGapMs: 1200 });
  }

  function emitTamperDetected(details){
    const payload = Object.assign({
      stack: captureSecurityStack(4)
    }, details || {});
    Security.emit("tamper_detected", payload, { minGapMs: 1500 });
  }

  function isProtectedSurface(target){
    if (!target) return false;
    if (target === Game) return true;
    const stateSurface = Game && Game.State;
    if (stateSurface && target === stateSurface) return true;
    const stateApiSurface = Game && Game.StateAPI;
    if (stateApiSurface && target === stateApiSurface) return true;
    const debugSurface = isDevFlag() ? (Game && Game.Debug) : null;
    if (debugSurface && target === debugSurface) return true;
    const coreSurface = Game && Game._ConflictCore;
    if (coreSurface && target === coreSurface) return true;
    if (target === (Game && Game.ConflictCore)) return true;
    const handleS = Game && Game.__S;
    if (handleS && target === handleS) return true;
    const handleA = Game && Game.__A;
    if (handleA && target === handleA) return true;
    const handleD = Game && Game.__D;
    if (handleD && target === handleD) return true;
    return false;
  }

  function describeSurface(target){
    if (!target) return "unknown";
    if (target === Game) return "Game";
    if (target === (Game && Game.State)) return "Game.State";
    if (target === (Game && Game.StateAPI)) return "Game.StateAPI";
    const debugSurface = isDevFlag() ? (Game && Game.Debug) : null;
    if (debugSurface && target === debugSurface) return "Game.Debug";
    if (target === (Game && Game._ConflictCore)) return "Game._ConflictCore";
    if (target === (Game && Game.ConflictCore)) return "Game.ConflictCore";
    if (target === (Game && Game.__S)) return "Game.__S";
    if (target === (Game && Game.__A)) return "Game.__A";
    if (target === (Game && Game.__D)) return "Game.__D";
    return "protected";
  }

  function handleGlobalTamper(target, prop, action){
    if (!isProtectedSurface(target)) return;
    emitTamperDetected({ key: `${describeSurface(target)}.${String(prop || "<?>")}`, action });
  }

  (function wrapGlobalTamperHooks(){
    if (typeof Object === "undefined") return;
    if (!Object.defineProperty.__intrusionWrapped) {
      const original = Object.defineProperty;
      Object.defineProperty = function(target, prop, descriptor){
        handleGlobalTamper(target, prop, "defineProperty");
        return original.call(Object, target, prop, descriptor);
      };
      try { Object.defineProperty.__intrusionWrapped = true; } catch (_) {}
    }
    if (!Object.defineProperties.__intrusionWrapped) {
      const original = Object.defineProperties;
      Object.defineProperties = function(target, props){
        handleGlobalTamper(target, Object.keys(props || {}).join(","), "defineProperties");
        return original.call(Object, target, props);
      };
      try { Object.defineProperties.__intrusionWrapped = true; } catch (_) {}
    }
    if (!Object.setPrototypeOf.__intrusionWrapped) {
      const original = Object.setPrototypeOf;
      Object.setPrototypeOf = function(target, proto){
        handleGlobalTamper(target, "__proto__", "setPrototypeOf");
        return original.call(Object, target, proto);
      };
      try { Object.setPrototypeOf.__intrusionWrapped = true; } catch (_) {}
    }
  })();

  function emitStatDelta(kind, delta, meta){
    if (!kind || !Number.isFinite(Number(delta || 0))) return;
    const diff = (delta | 0);
    if (!diff) return;
    try {
      if (!Game.__D || typeof Game.__D !== "object") Game.__D = {};
      if (!Array.isArray(Game.__D.toastLog)) Game.__D.toastLog = [];
      Game.__D.toastLog.push({
        time: Date.now(),
        kind: String(kind),
        delta: diff,
        reason: meta && meta.reason ? String(meta.reason) : null,
        battleId: (meta && meta.battleId != null) ? meta.battleId : null,
      });
      if (Game.__D.toastLog.length > 300) {
        Game.__D.toastLog.splice(0, Game.__D.toastLog.length - 300);
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

  // --- Training state (data contract only, deterministic defaults) ---
  const TRAINING_VERSION = 1;

  function sanitizeNonNegativeInt(v){
    if (!Number.isFinite(v)) return 0;
    const n = (v | 0);
    return n < 0 ? 0 : n;
  }

  function sanitizeTimestamp(v){
    return sanitizeNonNegativeInt(v);
  }

  function cloneTrainingEntry(raw){
    const entry = raw && typeof raw === "object" ? raw : {};
    return {
      level: sanitizeNonNegativeInt(entry.level),
      xp: sanitizeNonNegativeInt(entry.xp),
      lastTrainedAt: sanitizeTimestamp(entry.lastTrainedAt),
      cooldownUntil: sanitizeTimestamp(entry.cooldownUntil),
    };
  }

  function buildTrainingStateFrom(raw){
    const src = raw && typeof raw === "object" ? raw : {};
    const byArgKeySrc = (src.byArgKey && typeof src.byArgKey === "object") ? src.byArgKey : {};
    const countersSrc = (src.counters && typeof src.counters === "object") ? src.counters : {};
    const byArgKey = {};
    for (const key of Object.keys(byArgKeySrc)) {
      if (!key) continue;
      byArgKey[String(key)] = cloneTrainingEntry(byArgKeySrc[key]);
    }
    const counters = {
      totalTrains: sanitizeNonNegativeInt(countersSrc.totalTrains),
      todayTrains: sanitizeNonNegativeInt(countersSrc.todayTrains),
      lastTrainDay: sanitizeNonNegativeInt(countersSrc.lastTrainDay),
    };
    const versionRaw = Number.isFinite(src.version) ? (src.version | 0) : TRAINING_VERSION;
    const version = versionRaw > 0 ? versionRaw : TRAINING_VERSION;
    return { version, byArgKey, counters };
  }

  function ensureTrainingState(target){
    const tgt = (target && typeof target === "object") ? target : null;
    const next = buildTrainingStateFrom(tgt && tgt.training);
    if (tgt) tgt.training = next;
    return next;
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

    training: buildTrainingStateFrom({}),
    dayIndex: 0,

    chat: [], // {id,t,name,text,isSystem,isMe,playerId}
    dm: {
      open: false,
      withId: null,
      logs: {}, // withId -> messages
      names: {}, // custom display names for system DM threads

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
    securityFlags: {},

    // Evidence that certain roles were actually seen recently (chat/battles can mark this).
    // roleKey -> lastSeenAt (ms)
    sightings: {},
  };

  guardPointsObject(State.me, "State.me.points");
  let _stateRepValue = Number.isFinite(State.rep) ? (State.rep | 0) : 0;
  let _repWriteDepth = 0;
  function withRepWrite(fn){
    _repWriteDepth++;
    try { return fn(); }
    finally { _repWriteDepth = Math.max(0, _repWriteDepth - 1); }
  }
  function canWriteRep(){
    return _repWriteDepth > 0 || isDevFlag();
  }
  function sanitizeRepValue(v){
    return Number.isFinite(Number(v)) ? (Number(v) | 0) : 0;
  }
  Object.defineProperty(State, "rep", {
    configurable: true,
    enumerable: true,
    get(){ return _stateRepValue; },
    set(v){
      const next = sanitizeRepValue(v);
      if (!canWriteRep()) {
        const reason = Number.isFinite(Number(v)) ? "unauthorized_rep_write" : "invalid_number";
        emitInvalidMutation("State.rep", next, reason);
        return;
      }
      _stateRepValue = Math.max(0, next);
    }
  });

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
    withRepWrite(() => {
      State.rep = 0;
    });
    State.influence = 0;
    State.players = {};
    State.points = { lastChatRewardAt: 0, overflow: 0, capNote: "" };
    State.training = buildTrainingStateFrom({});
    State.dayIndex = 0;
    State.chat = [];
    State.dm = { open:false, withId:null, logs:{}, names:{}, inviteOpen:false, teachOpen:false, agroStarted:{} };
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
    State.securityFlags = {};
    if (ReactionPolicy && typeof ReactionPolicy.restorePersistedFlags === "function") {
      ReactionPolicy.restorePersistedFlags();
    }
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

    State.dm.names = State.dm.names || {};
    const dmId = String(targetId || opts.playerId || "");
    const safeName = name ? String(name) : dmId;
    if (dmId) {
      State.dm.names[dmId] = safeName;
      State.players = State.players || {};
      const existingPlayer = State.players[dmId];
      if (!existingPlayer) {
        State.players[dmId] = { id: dmId, name: safeName, influence: 0 };
      } else if (name) {
        existingPlayer.name = safeName;
      }
    }

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
      if (Game.__D && Array.isArray(Game.__D.moneyLog)) {
        const theftLogs = Game.__D.moneyLog.filter(l => 
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
    if (isDevFlag()) {
      console.warn("REPORT_REPEAT_RL_V1_LOADED", {
        buildTag: (Game && Game.__BUILD_TAG) ? Game.__BUILD_TAG : null,
        file: "state.js",
        ts: Date.now()
      });
    }
    if (!Security.isSafe()) {
      Security.emit("tamper_function", { key: "applyReportByRole", action: "call", reason: "blocked", mode: isDevFlag() ? "dev" : "prod" });
      return { ok: false, reason: "security_tamper" };
    }
    const rl = Security.rateLimit("report_submit", {
      actorId: (State.me && State.me.id) ? String(State.me.id) : "me",
      reason: "report_submit",
      actionId: opts && opts.actionId,
      battleId: opts && opts.battleId
    }, { max: 1, windowMs: 4000, burst: 1 });
    if (!rl.ok) {
      Security.emit("rate_limit", { action: "report_submit", reason: "report_submit", key: rl.key, resetIn: rl.resetIn });
      try {
        if (!Game.__D || typeof Game.__D !== "object") Game.__D = {};
        if (!Array.isArray(Game.__D.moneyLog)) Game.__D.moneyLog = [];
        const entry = {
          time: Date.now(),
          reason: "report_rate_limited",
          currency: "meta",
          amount: 0,
          sourceId: (State.me && State.me.id) ? String(State.me.id) : "me",
          targetId: "report_submit",
          eventId: opts && opts.actionId ? String(opts.actionId) : null,
          battleId: opts && opts.battleId ? String(opts.battleId) : null,
          meta: { key: rl.key, resetIn: rl.resetIn, actionId: opts && opts.actionId ? String(opts.actionId) : null }
        };
        Game.__D.moneyLog.push(entry);
      } catch (_) {}
      return { ok: false, reason: "rate_limited" };
    }
    const raw = String(role || "").trim();
    const r = raw.toLowerCase();
    // normalize synonyms
    let target = null;
    try {
      const ps = State.players || {};
      target = Object.values(ps).find(x => x && x.name && String(x.name).toLowerCase() === r) || null;
    } catch (_) {}
    // normalize synonyms helper (moved up so name-only reports are supported)
    const normalizeRoleKey = (s) => {
      const x = String(s || "").toLowerCase();
      if (!x) return "";
      if (x.includes("токс") || x.includes("toxic")) return "toxic";
      if (x.includes("банд") || x.includes("bandit")) return "bandit";
      if (x.includes("мафи") || x.includes("mafia") || x.includes("mafioso")) return "mafia";
      return "";
    };

    let roleKey = "";
    try {
      if (target) roleKey = normalizeRoleKey(String(target.role || target.type || ""));
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

    const reportedRoleEarly = normalizeRoleKey(r || roleKey || "");
    const repeatActorId = (State.me && State.me.id) ? String(State.me.id) : "me";
    const repeatTargetId = String(target.id);
    const repeatRole = reportedRoleEarly || null;
    const stableKey = `${repeatActorId}|${repeatTargetId}|${repeatRole || ""}`;
    const repeatKeyMeta = {
      actorId: repeatActorId,
      targetId: repeatTargetId,
      role: repeatRole,
      reason: "report_repeat",
      battleId: opts && opts.battleId,
      stableKey
    };
    const repeatRl = Security.rateLimit("report_repeat", repeatKeyMeta, { max: 1, windowMs: 4000, burst: 1 });
    const rlResetIn = Number.isFinite(repeatRl.resetIn) ? repeatRl.resetIn : 4000;
    const rlResetAt = Date.now() + rlResetIn;
    if (isDevFlag()) {
      console.warn("REPORT_REPEAT_RL_V1_CHECK", {
        stableKey,
        rawKey: repeatRl.key || null,
        actorId: repeatActorId,
        targetId: repeatTargetId,
        role: repeatRole,
        now: Date.now(),
        blocked: !repeatRl.ok,
        resetAt: rlResetAt
      });
    }
    try {
      if (!Game.__D || typeof Game.__D !== "object") Game.__D = {};
      if (!Array.isArray(Game.__D.repeatRateLimitLog)) Game.__D.repeatRateLimitLog = [];
      Game.__D.repeatRateLimitLog.push({
        type: "check",
        stableKey,
        rawKey: repeatRl.key || null,
        blocked: !repeatRl.ok,
        resetAt: rlResetAt,
        resetIn: rlResetIn,
        actorId: repeatActorId,
        targetId: repeatTargetId,
        role: repeatRole,
        time: Date.now()
      });
    } catch (_) {}
    if (!repeatRl.ok) {
      Security.emit("rate_limit", { action: "report_repeat", reason: "report_repeat", key: repeatRl.key, resetIn: repeatRl.resetIn });
      if (isDevFlag()) {
        console.warn("REPORT_REPEAT_RL_V1_BLOCK", {
          stableKey,
          rawKey: repeatRl.key,
          resetIn: repeatRl.resetIn,
          resetAt: rlResetIn ? (Date.now() + rlResetIn) : null,
          actorId: repeatActorId,
          targetId: repeatTargetId,
          role: repeatRole
        });
      }
      try {
        if (!Game.__D || typeof Game.__D !== "object") Game.__D = {};
        if (!Array.isArray(Game.__D.moneyLog)) Game.__D.moneyLog = [];
        const entry = {
          time: Date.now(),
          reason: "report_rate_limited",
          currency: "meta",
          amount: 0,
          sourceId: repeatActorId,
          targetId: repeatTargetId,
          eventId: opts && opts.actionId ? String(opts.actionId) : null,
          battleId: opts && opts.battleId ? String(opts.battleId) : null,
          meta: { key: repeatRl.key, stableKey, resetIn: repeatRl.resetIn, role: repeatRole, targetId: repeatTargetId }
        };
        Game.__D.moneyLog.push(entry);
      } catch (_) {}
      try {
        if (!Game.__D || typeof Game.__D !== "object") Game.__D = {};
        if (!Array.isArray(Game.__D.repeatRateLimitLog)) Game.__D.repeatRateLimitLog = [];
        Game.__D.repeatRateLimitLog.push({
          type: "block",
          stableKey,
          rawKey: repeatRl.key || null,
          blocked: true,
          resetAt: rlResetAt,
          resetIn: rlResetIn,
          actorId: repeatActorId,
          targetId: repeatTargetId,
          role: repeatRole,
          time: Date.now()
        });
      } catch (_) {}
      return {
        ok: false,
        reason: "rate_limited",
        cooldownMs: 4000,
        resetAt: Date.now() + (repeatRl.resetIn || 0),
        targetId: target.id,
        key: repeatRl.key,
        stableKey
      };
    }

    // Prevent repeat report of the same target during cooldown window.
    if (hasReported(target.id)) {
      copDmTo(cop.id, "Этот контакт уже отмечен. Повтор не требуется.");
      return { ok: false, reason: "already_reported", targetId: target.id };
    }

    // Determine reported role key (for later truthful check).
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
    const targetRole = (target && target.role) ? String(target.role).toLowerCase() : "";

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
      const penaltyPts = (N.COP && N.COP.report && Number.isFinite(N.COP.report.falsePenalty))
        ? (N.COP.report.falsePenalty | 0)
        : 5;
      
      // Apply REP penalty via transferRep; record and notify player explicitly.
      try {
        transferRep("me", "crowd_pool", repPenalty, "rep_report_false", reportId);
      } catch (_) {}

      // Apply points penalty via transferPoints (no emission).
      try {
        const Econ = (Game && (Game._ConflictEconomy || Game.ConflictEconomy)) ? (Game._ConflictEconomy || Game.ConflictEconomy) : null;
        const pointsBefore = (State.me && Number.isFinite(State.me.points)) ? (State.me.points | 0) : 0;
        const amountWanted = penaltyPts | 0;
        const amountActual = Math.min(amountWanted, Math.max(0, pointsBefore));
        const pointsAfter = Math.max(0, pointsBefore - amountActual);
        if (Econ && typeof Econ.transferPoints === "function" && amountActual > 0) {
          if (isDevFlag()) {
            let stackHint = "";
            try {
              const err = new Error();
              const s = String(err && err.stack ? err.stack : "");
              stackHint = s.split("\n").slice(0, 3).join(" | ");
            } catch (_) {}
            console.warn("ECON_SOC_FALSE_PTS_TRACE_V1", {
              stage: "before_points_penalty",
              reportId: reportId || null,
              pointsBefore,
              amountWanted,
              amountActual,
              stackHint
            });
          }
          const tx = Econ.transferPoints("me", "sink", amountActual, "report_false_penalty", {
            reportId: reportId || null,
            amountWanted,
            amountActual,
            pointsBefore,
            pointsAfter,
            partial: amountActual !== amountWanted,
            operation: "report_false_penalty"
          });
          if (isDevFlag()) {
            const afterPts = (State.me && Number.isFinite(State.me.points)) ? (State.me.points | 0) : null;
            console.warn("ECON_SOC_FALSE_PTS_TRACE_V1", {
              stage: "after_points_penalty",
              reportId: reportId || null,
              pointsAfter: afterPts,
              tx
            });
          }
        }
      } catch (_) {}

      // Ensure debug logs and toasts reflect the penalty even if econ path is silent.
      try {
        const dbg = (Game && Game.__D) ? Game.__D : (window.Game.__D = window.Game.__D || {});
        dbg.moneyLog = Array.isArray(dbg.moneyLog) ? dbg.moneyLog : (dbg.moneyLog = dbg.moneyLog || []);
        const existingIndex = dbg.moneyLog.findIndex(x => x && String(x.reason || "") === "rep_report_false" && String(x.eventId || "") === String(reportId || "") && String(x.battleId || "") === String(reportId || ""));
        let ref = null;
        if (existingIndex >= 0) {
          ref = { txId: dbg.moneyLog[existingIndex].txId, logIndex: existingIndex };
        } else {
          const rowHelper = (typeof dbg.pushMoneyLogRow === "function") ? dbg.pushMoneyLogRow : pushMoneyLogRow;
          ref = rowHelper({
            time: Date.now(),
            sourceId: "me",
            targetId: "crowd_pool",
            amount: repPenalty,
            reason: "rep_report_false",
            eventId: reportId || null,
            battleId: reportId || null,
            currency: "rep"
          });
        }
        const toastHelper = (typeof dbg.pushEconToastFromLogRef === "function") ? dbg.pushEconToastFromLogRef : pushEconToastFromLogRef;
        if (ref && typeof toastHelper === "function") {
          toastHelper(ref, `-${repPenalty}⭐`);
        }
      } catch (_) {}

      // DM to player: explicit penalty notice
      try {
        const penaltyMsg = `Это ложный донос — штраф ${repPenalty}⭐. Будьте внимательнее.`;
        pushDm(cop.id, cop.name, copLine(penaltyMsg), { isSystem: false, playerId: cop.id });
      } catch (_) {}

      markReported(target.id, false, roleKey, cop.id);
      try { copDmTo(cop.id, "cop_fail"); } catch (_) {}
      if (isDevFlag()) {
        const endPts = (State.me && Number.isFinite(State.me.points)) ? (State.me.points | 0) : null;
        console.warn("ECON_SOC_FALSE_PTS_TRACE_V1", {
          stage: "after_false_report",
          reportId: reportId || null,
          pointsAfter: endPts
        });
      }
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
          const dbg = (Game && Game.__D) ? Game.__D : (window.Game.__D = window.Game.__D || {});
          dbg.moneyLog = Array.isArray(dbg.moneyLog) ? dbg.moneyLog : (dbg.moneyLog = dbg.moneyLog || []);
          const existingIndex = dbg.moneyLog.findIndex(x => x && String(x.reason || "") === "rep_report_true" && String(x.eventId||x.battleId||"") === String(reportId || ""));
        let ref = null;
        if (existingIndex >= 0) {
          ref = { txId: dbg.moneyLog[existingIndex].txId, logIndex: existingIndex };
        } else {
          const rowHelper = (typeof dbg.pushMoneyLogRow === "function") ? dbg.pushMoneyLogRow : pushMoneyLogRow;
          ref = rowHelper({
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
        const toastHelper = (typeof dbg.pushEconToastFromLogRef === "function") ? dbg.pushEconToastFromLogRef : pushEconToastFromLogRef;
        if (ref && typeof toastHelper === "function") {
          toastHelper(ref, `+${repGain}⭐`);
        }
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
          const logs = (Game && Game.__D && Array.isArray(Game.__D.moneyLog)) ? Game.__D.moneyLog : [];
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
              const Econ = (Game && (Game._ConflictEconomy || Game.ConflictEconomy)) ? (Game._ConflictEconomy || Game.ConflictEconomy) : null;
              const amountWanted = returnAmount | 0;
              const bankBal = (Econ && typeof Econ.getWorldBankBalance === "function") ? (Econ.getWorldBankBalance() | 0) : null;
              const amountActual = (bankBal == null) ? amountWanted : Math.max(0, Math.min(amountWanted, bankBal));
              const pointsBefore = (State.me && Number.isFinite(State.me.points)) ? (State.me.points | 0) : 0;
              const pointsAfter = pointsBefore + amountActual;
              if (Econ && typeof Econ.transferPoints === "function" && amountActual > 0) {
                Econ.transferPoints("worldBank", "me", amountActual, "report_true_compensation", {
                  reportId: reportId || null,
                  amountWanted,
                  amountActual,
                  pointsBefore,
                  pointsAfter,
                  partial: amountActual !== amountWanted,
                  kind: "return"
                });
              }
            }
            // P0-2: grant extra +1 REP and +1 point (bonus) for victim case
            try {
              if (Game.__A && typeof Game.__A.transferRep === "function") {
                Game.__A.transferRep("crowd_pool", "me", 1, "rep_cop_victim_bonus", reportId);
              }
            } catch (_) {}
            // Apply +1 point bonus via transfer
            try {
              const Econ = (Game && (Game._ConflictEconomy || Game.ConflictEconomy)) ? (Game._ConflictEconomy || Game.ConflictEconomy) : null;
              const amountWanted = 1;
              const bankBal = (Econ && typeof Econ.getWorldBankBalance === "function") ? (Econ.getWorldBankBalance() | 0) : null;
              const amountActual = (bankBal == null) ? amountWanted : Math.max(0, Math.min(amountWanted, bankBal));
              const pointsBefore = (State.me && Number.isFinite(State.me.points)) ? (State.me.points | 0) : 0;
              const pointsAfter = pointsBefore + amountActual;
              if (Econ && typeof Econ.transferPoints === "function" && amountActual > 0) {
                Econ.transferPoints("worldBank", "me", amountActual, "report_true_compensation", {
                  reportId: reportId || null,
                  amountWanted,
                  amountActual,
                  pointsBefore,
                  pointsAfter,
                  partial: amountActual !== amountWanted,
                  kind: "victim_bonus"
                });
              }
            } catch (_) {}

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

  function addPoints(amount, reason, meta){
    const meId = (State.me && State.me.id) ? State.me.id : "me";
    if (ReactionPolicy && ReactionPolicy.isActionBlocked(meId, "economy")) {
      return (State.me && Number.isFinite(State.me.points)) ? (State.me.points | 0) : 0;
    }
    if (!Security.isSafe()) {
      Security.emit("tamper_function", { key: "addPoints", action: "call", reason: "blocked", mode: isDevFlag() ? "dev" : "prod" });
      return (State.me && Number.isFinite(State.me.points)) ? (State.me.points | 0) : 0;
    }
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
    if (n > 0) {
      const callsite = getPointsEmissionCallsite();
      if (isDevFlag()) {
        const err = new Error("POINTS_EMISSION_BLOCKED");
        if (callsite) err.stack = `Error: POINTS_EMISSION_BLOCKED\n${callsite}`;
        throw err;
      }
      logPointsEmissionBlocked(callsite, n, reason, meta || {}, meId);
      return (State.me && Number.isFinite(State.me.points)) ? (State.me.points | 0) : 0;
    }
    const rl = Security.rateLimit("points_add", {
      actorId: (State.me && State.me.id) ? String(State.me.id) : "me",
      reason: reason || "addPoints",
      battleId: meta && meta.battleId,
      actionId: meta && meta.actionId
    }, { max: 1, windowMs: 900, burst: 1 });
    if (!rl.ok) {
      Security.emit("rate_limit", { action: "points_add", reason: reason || "addPoints", battleId: meta && meta.battleId, key: rl.key, resetIn: rl.resetIn });
      return (State.me && Number.isFinite(State.me.points)) ? (State.me.points | 0) : 0;
    }
    if (isCirculationEnabled() && !pointsWriteDepth) {
      const r = String(reason || "").toLowerCase();
      const allow = r.startsWith("dev") || r.includes("migration") || r.includes("init") || !State.isStarted;
      if (!allow) return rejectPointsWrite(`addPoints:${reason || "unknown"}`) ? 0 : 0;
    }
    const guardMeta = {
      reason: reason || "addPoints",
      actionId: meta && meta.actionId,
      battleId: meta && meta.battleId,
      context: meta && meta.context,
    };
    const guard = ResourceValidator.claim("points", guardMeta);
    if (!guard.ok) {
      const current = (State.me && Number.isFinite(State.me.points)) ? (State.me.points | 0) : 0;
      return current;
    }
    let success = false;
    try {
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
              if (Game && Game.__A && typeof Game.__A.transferRep === "function") {
                Game.__A.transferRep("crowd_pool", "me", repGain, "rep_overpoints_convert", bid);
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
        success = true;
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
      success = true;
      return finalizePoints();
    } finally {
      ResourceValidator.release(guard.key, success);
    }
  }

  function spendPoints(amount, reason, meta){
    const meId = (State.me && State.me.id) ? State.me.id : "me";
    if (ReactionPolicy && ReactionPolicy.isActionBlocked(meId, "economy")) {
      return false;
    }
    if (!Security.isSafe()) {
      Security.emit("tamper_function", { key: "spendPoints", action: "call", reason: "blocked", mode: isDevFlag() ? "dev" : "prod" });
      return false;
    }
    const n = Number(amount || 0);
    if (!Number.isFinite(n) || n <= 0) return true;
    const rl = Security.rateLimit("points_spend", {
      actorId: (State.me && State.me.id) ? String(State.me.id) : "me",
      reason: reason || "spendPoints",
      battleId: meta && meta.battleId,
      actionId: meta && meta.actionId
    }, { max: 1, windowMs: 900, burst: 1 });
    if (!rl.ok) {
      Security.emit("rate_limit", { action: "points_spend", reason: reason || "spendPoints", battleId: meta && meta.battleId, key: rl.key, resetIn: rl.resetIn });
      return false;
    }
    if (isCirculationEnabled() && !pointsWriteDepth) {
      const r = String(reason || "").toLowerCase();
      const allow = r.startsWith("dev") || r.includes("migration") || r.includes("init") || !State.isStarted;
      if (!allow) return rejectPointsWrite(`spendPoints:${reason || "unknown"}`) ? false : false;
    }
    const cur = (State.me.points || 0) | 0;
    if (cur < n) return false;
    const beforePoints = cur;
    const guardMeta = {
      reason: reason || "spendPoints",
      actionId: meta && meta.actionId,
      battleId: meta && meta.battleId,
      context: meta && meta.context,
    };
    const guard = ResourceValidator.claim("points", guardMeta);
    if (!guard.ok) return false;
    let success = false;
    try {
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
      success = true;
      return true;
    } finally {
      ResourceValidator.release(guard.key, success);
    }
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

  const TrainingStateAPI = {
    getSnapshot: () => buildTrainingStateFrom(ensureTrainingState(State)),
    normalize: (raw) => buildTrainingStateFrom(raw),
  };
  Game.TrainingState = Object.assign(Game.TrainingState || {}, TrainingStateAPI);

  Security.defineHandleProp("__S", State);
  Game._withPointsWrite = withPointsWrite;
  const StateAPI = {
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
    giveRespect,
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
      const ev = (typeof eventId === "object") ? eventId : (Game.__A.findEventById ? Game.__A.findEventById(eventId) : null);
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

  logRespectEntrypointReady();
  if (Game.__DEV && typeof Game.__DEV === "object") {
    Game.__DEV.getRespectEmitterCap = () => REP_EMITTER_DAILY_CAP;
    Game.__DEV.smokeToastContractProbeOnce = function smokeToastContractProbeOnce(opts = {}) {
      const now = () => (Game.Time && typeof Game.Time.now === "function") ? Game.Time.now() : Date.now();
      const formatTimestamp = (stamp) => {
        const d = new Date(stamp);
        const pad = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      };
      const dbg = (Game && Game.__D) ? Game.__D : (window.Game.__D = window.Game.__D || {});
      const savedToasts = Array.isArray(dbg.toastLog) ? dbg.toastLog.slice() : [];
      dbg.toastLog = [];
      const failed = [];
      let sampleToast = null;
      let sampleRow = null;
      let ref = null;
      try {
        const rowHelper = (typeof dbg.pushMoneyLogRow === "function") ? dbg.pushMoneyLogRow : pushMoneyLogRow;
        ref = rowHelper({
          time: Date.now(),
          reason: "toast_contract_probe",
          currency: "points",
          amount: 1,
          sourceId: "toast_contract_probe",
          targetId: "me",
          eventId: opts.eventId || "toast_contract_probe",
          battleId: opts.battleId || "toast_contract_probe",
          meta: { probe: true }
        });
        sampleRow = (ref && Array.isArray(dbg.moneyLog) && Number.isFinite(ref.logIndex)) ? dbg.moneyLog[ref.logIndex] : null;
        if (!sampleRow) failed.push("moneylog_row_missing");
      } catch (_) {
        failed.push("moneylog_push_failed");
      }
      const toastHelper = (typeof dbg.pushEconToastFromLogRef === "function") ? dbg.pushEconToastFromLogRef : pushEconToastFromLogRef;
      if (ref && typeof toastHelper === "function") {
        const toastResult = toastHelper(ref, opts.toastText || "+1💰");
        const toast = (toastResult && toastResult.ok === false) ? null : toastResult;
        if (toast) {
          sampleToast = toast;
          if (toast.kind !== "econ") failed.push("toast_wrong_kind");
          if (!toast.txId) failed.push("toast_missing_txId");
          if (!toast.reason) failed.push("toast_missing_reason");
          if (sampleRow && toast.logIndex !== ref.logIndex) failed.push("toast_logindex_mismatch");
          if (sampleRow && toast.txId !== sampleRow.txId) failed.push("toast_txid_mismatch");
          if (sampleRow && toast.reason !== sampleRow.reason) failed.push("toast_reason_mismatch");
        } else {
          failed.push("toast_push_failed");
          if (toastResult && toastResult.ok === false) {
            failed.push(`toast_error:${toastResult.reason || "unknown"}`);
          }
        }
      } else {
        failed.push("toast_helper_missing");
      }
      const newToasts = Array.isArray(dbg.toastLog) ? dbg.toastLog.slice() : [];
      dbg.toastLog = savedToasts.concat(newToasts);
      const result = {
        ok: failed.length === 0,
        failed,
        sampleToast,
        sampleRow
      };
      try {
        const stamp = formatTimestamp(now());
        console.log(`DUMP_AT [${stamp}]`);
        console.log("ECON_UI0_TOAST_CONTRACT_BEGIN");
        console.log(JSON.stringify(result));
        console.log("ECON_UI0_TOAST_CONTRACT_END");
      } catch (_) {}
      return result;
    };
    Game.__DEV.smokeEconUi_ToastImmediateOnce = function smokeEconUi_ToastImmediateOnce(opts = {}) {
      const now = () => (Game.Time && typeof Game.Time.now === "function") ? Game.Time.now() : Date.now();
      const formatTimestamp = (stamp) => {
        const d = new Date(stamp);
        const pad = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      };
      const dbg = (Game && Game.__D) ? Game.__D : (window.Game.__D = window.Game.__D || {});
      const failed = [];
      const samples = [];
      const seenToastTs = new Set();
      const ops = [
        { reason: "toast_immediate_probe", currency: "points", amount: 1, sourceId: "smoke_probe", targetId: "me", text: "+1💰" },
        { reason: "toast_immediate_crowd", currency: "points", amount: 1, sourceId: "smoke_crowd", targetId: "me", text: "+1💰" },
        { reason: "toast_immediate_report", currency: "rep", amount: -1, sourceId: "me", targetId: "crowd_pool", text: "-1⭐" }
      ];
      for (const op of ops) {
        const rowHelper = (typeof dbg.pushMoneyLogRow === "function") ? dbg.pushMoneyLogRow : pushMoneyLogRow;
        let ref = null;
        let row = null;
        let toast = null;
        let toastFailed = false;
        try {
          ref = rowHelper({
            time: Date.now(),
            reason: op.reason,
            currency: op.currency,
            amount: op.amount,
            sourceId: op.sourceId,
            targetId: op.targetId,
            battleId: op.battleId || "smoke_econ_ui",
            meta: { smoke: "econ_ui_immediate", op: op.reason }
          });
          row = (ref && Array.isArray(dbg.moneyLog) && Number.isFinite(ref.logIndex)) ? dbg.moneyLog[ref.logIndex] : null;
        } catch (_) {
          failed.push(`moneylog_push_failed:${op.reason}`);
        }
        try {
          const toastHelper = (typeof dbg.pushEconToastFromLogRef === "function") ? dbg.pushEconToastFromLogRef : pushEconToastFromLogRef;
          if (ref && typeof toastHelper === "function") {
            const toastResult = toastHelper(ref, op.text);
            if (toastResult && toastResult.ok === false) {
              toast = null;
              toastFailed = true;
              failed.push(`toast_push_failed:${op.reason}`);
              failed.push(`toast_error:${op.reason}:${toastResult.reason || "unknown"}`);
            } else {
              toast = toastResult;
            }
          }
        } catch (_) {
          toastFailed = true;
          failed.push(`toast_push_failed:${op.reason}`);
        }
        const tsRow = row ? Number(row.ts || row.time || 0) : 0;
        const tsToast = toast ? Number(toast.ts || 0) : 0;
        const dt = (tsRow && tsToast) ? (tsToast - tsRow) : null;
        samples.push({
          reason: op.reason,
          tsRow,
          tsToast,
          dt
        });
        if (!row) failed.push(`moneylog_row_missing:${op.reason}`);
        if (!toast && !toastFailed) failed.push(`toast_missing:${op.reason}`);
        if (dt != null && dt > (opts.maxDt || 16)) {
          failed.push(`dt_too_large:${op.reason}:${dt}`);
        }
        if (tsToast && seenToastTs.has(tsToast)) {
          failed.push(`toast_batched:${op.reason}`);
        }
        if (tsToast) seenToastTs.add(tsToast);
      }
      const result = {
        ok: failed.length === 0,
        failed,
        samples
      };
      try {
        const stamp = formatTimestamp(now());
        console.log(`DUMP_AT [${stamp}]`);
        console.log("ECON_UI1_TOAST_IMMEDIATE_BEGIN");
        console.log(JSON.stringify(result));
        console.log("ECON_UI1_TOAST_IMMEDIATE_END");
      } catch (_) {}
      return result;
    };
    Game.__DEV.smokeEconUi_DedupOnce = function smokeEconUi_DedupOnce(opts = {}) {
      const now = () => (Game.Time && typeof Game.Time.now === "function") ? Game.Time.now() : Date.now();
      const formatTimestamp = (stamp) => {
        const d = new Date(stamp);
        const pad = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      };
      const dbg = (Game && Game.__D) ? Game.__D : (window.Game.__D = window.Game.__D || {});
      const saved = Array.isArray(dbg.toastLog) ? dbg.toastLog.slice() : [];
      dbg.toastLog = [];
      const rowHelper = (typeof dbg.pushMoneyLogRow === "function") ? dbg.pushMoneyLogRow : pushMoneyLogRow;
      let ref = null;
      try {
        ref = rowHelper({
          time: Date.now(),
          reason: "toast_dedup_probe",
          currency: "points",
          amount: 1,
          sourceId: "smoke_dedup",
          targetId: "me",
          battleId: "smoke_dedup",
          meta: { smoke: "econ_ui_dedup" }
        });
      } catch (_) {}
      let first = null;
      let second = null;
      try {
        if (ref) first = pushEconToastFromLogRef(ref, opts.toastText || "+1💰");
      } catch (_) {}
      try {
        if (ref) second = pushEconToastFromLogRef(ref, opts.toastText || "+1💰");
      } catch (_) {}
      const log = Array.isArray(dbg.toastLog) ? dbg.toastLog : [];
      const count = log.filter(t => t && t.kind === "econ" && t.txId === (ref && ref.txId)).length;
      const failed = [];
      if (count !== 1) failed.push(`count=${count}`);
      if (!ref) failed.push("moneylog_missing");
      const result = {
        ok: failed.length === 0,
        failed,
        count,
        txId: ref && ref.txId ? ref.txId : null,
        first,
        second
      };
      const newToasts = Array.isArray(dbg.toastLog) ? dbg.toastLog.slice() : [];
      dbg.toastLog = saved.concat(newToasts);
      try {
        const stamp = formatTimestamp(now());
        console.log(`DUMP_AT [${stamp}]`);
        console.log("ECON_UI2_DEDUP_BEGIN");
        console.log(JSON.stringify(result));
        console.log("ECON_UI2_DEDUP_END");
      } catch (_) {}
      return result;
    };
    Game.__DEV.smokeEconUi_ToastMatchesMoneyLogOnce = function smokeEconUi_ToastMatchesMoneyLogOnce(opts = {}) {
      const now = () => (Game.Time && typeof Game.Time.now === "function") ? Game.Time.now() : Date.now();
      const formatTimestamp = (stamp) => {
        const d = new Date(stamp);
        const pad = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      };
      const dbg = (Game && Game.__D) ? Game.__D : (window.Game.__D = window.Game.__D || {});
      const savedToasts = Array.isArray(dbg.toastLog) ? dbg.toastLog.slice() : [];
      dbg.toastLog = [];
      const failed = [];
      const samples = [];
      const rowHelper = (typeof dbg.pushMoneyLogRow === "function") ? dbg.pushMoneyLogRow : pushMoneyLogRow;
      const toastHelper = (typeof dbg.pushEconToastFromLogRef === "function") ? dbg.pushEconToastFromLogRef : pushEconToastFromLogRef;
      const ops = [
        { reason: "toast_match_probe_points_plus", currency: "points", amount: 1, sourceId: "smoke_match_probe", targetId: "me", battleId: "toast_match_probe_points_plus", eventId: "toast_match_probe_points_plus", text: "+1💰" },
        { reason: "toast_match_probe_points_minus", currency: "points", amount: -2, sourceId: "smoke_match_probe", targetId: "me", battleId: "toast_match_probe_points_minus", eventId: "toast_match_probe_points_minus", text: "-2💰" },
        { reason: "toast_match_probe_rep_plus", currency: "rep", amount: 5, sourceId: "smoke_match_probe", targetId: "me", battleId: "toast_match_probe_rep_plus", eventId: "toast_match_probe_rep_plus", text: "+5⭐" },
        { reason: "toast_match_probe_rep_minus", currency: "rep", amount: -1, sourceId: "me", targetId: "crowd_pool", battleId: "toast_match_probe_rep_minus", eventId: "toast_match_probe_rep_minus", text: "-1⭐" },
      ];
      for (const op of ops) {
        let ref = null;
        let row = null;
        let toast = null;
        let toastFailed = false;
        try {
          ref = rowHelper({
            time: Date.now(),
            reason: op.reason,
            currency: op.currency,
            amount: op.amount,
            sourceId: op.sourceId,
            targetId: op.targetId,
            battleId: op.battleId,
            eventId: op.eventId,
            meta: { smoke: "econ_ui_match", op: op.reason }
          });
          if (ref && Array.isArray(dbg.moneyLog) && Number.isFinite(ref.logIndex)) {
            row = dbg.moneyLog[ref.logIndex];
          }
        } catch (_) {
          failed.push(`moneylog_push_failed:${op.reason}`);
        }
        try {
          if (ref && typeof toastHelper === "function") {
            const toastResult = toastHelper(ref, op.text);
            if (toastResult && toastResult.ok === false) {
              toastFailed = true;
              failed.push(`toast_push_failed:${op.reason}`);
              failed.push(`toast_error:${op.reason}:${toastResult.reason || "unknown"}`);
            } else {
              toast = toastResult;
            }
          }
        } catch (_) {
          toastFailed = true;
          failed.push(`toast_push_failed:${op.reason}`);
        }
        const payload = toast && toast.payload ? toast.payload : null;
        samples.push({
          txId: ref && ref.txId ? ref.txId : null,
          row: row ? {
            txId: row.txId,
            reason: row.reason,
            currency: row.currency,
            kind: row.kind,
            amount: row.amount,
            delta: row.delta,
            sourceId: row.sourceId,
            targetId: row.targetId
          } : null,
          toastPayload: payload,
          text: toast && toast.text ? toast.text : null
        });
        if (!row) {
          failed.push(`moneylog_row_missing:${op.reason}`);
        }
        if (!toast) {
          if (!toastFailed) {
            failed.push(`toast_missing:${op.reason}`);
          }
          continue;
        }
        const expectedCurrency = row ? String(row.currency || row.kind || "points").toLowerCase() : null;
        const gotCurrency = payload ? String(payload.currency || "points").toLowerCase() : null;
        if (row && payload && gotCurrency !== expectedCurrency) {
          failed.push(`currency_mismatch:${op.reason}:${expectedCurrency}->${payload.currency}`);
        }
        const expectedAmount = row ? (Number.isFinite(row.amount) ? row.amount : ((row.delta !== undefined) ? Number(row.delta) : 0)) : null;
        const gotAmount = (payload && Number.isFinite(payload.amount)) ? payload.amount : payload && payload.amount;
        if (row && payload && expectedAmount !== gotAmount) {
          failed.push(`amount_mismatch:${op.reason}:${expectedAmount}->${payload && payload.amount}`);
        }
        if (row && payload && String(payload.reason || "") !== String(row.reason || "")) {
          failed.push(`reason_mismatch:${op.reason}:${row.reason}->${payload && payload.reason}`);
        }
      }
      const result = {
        ok: failed.length === 0,
        failed,
        samples
      };
      const newToasts = Array.isArray(dbg.toastLog) ? dbg.toastLog.slice() : [];
      dbg.toastLog = savedToasts.concat(newToasts);
      try {
        const stamp = formatTimestamp(now());
        console.log(`DUMP_AT [${stamp}]`);
        console.log("ECON_UI3_MATCH_BEGIN");
        console.log(JSON.stringify(result));
        console.log("ECON_UI3_MATCH_END");
      } catch (_) {}
      return result;
    };
    Game.__DEV.smokeEconUi_NoAutoOpenOnce = function smokeEconUi_NoAutoOpenOnce(opts = {}) {
      const now = () => (Game.Time && typeof Game.Time.now === "function") ? Game.Time.now() : Date.now();
      const formatTimestamp = (stamp) => {
        const d = new Date(stamp);
        const pad = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      };
      const dbg = (Game && Game.__D) ? Game.__D : (window.Game.__D = window.Game.__D || {});
      const savedCalls = Array.isArray(dbg.__econToastForbiddenCalls) ? dbg.__econToastForbiddenCalls.slice() : [];
      dbg.__econToastForbiddenCalls = [];
      const beforePanel = capturePanelStateSig();
      const beforeFocus = captureFocusSig();
      const rowHelper = (typeof dbg.pushMoneyLogRow === "function") ? dbg.pushMoneyLogRow : pushMoneyLogRow;
      const toastHelper = (typeof dbg.pushEconToastFromLogRef === "function") ? dbg.pushEconToastFromLogRef : pushEconToastFromLogRef;
      const ops = [
        { reason: "ui4_probe_1", currency: "points", amount: 1, sourceId: "smoke_ui4", targetId: "me" },
        { reason: "ui4_probe_2", currency: "points", amount: -1, sourceId: "me", targetId: "crowd_pool" },
        { reason: "ui4_probe_3", currency: "rep", amount: 1, sourceId: "smoke_ui4", targetId: "me" }
      ];
      for (const op of ops) {
        try {
          const ref = rowHelper({
            time: Date.now(),
            reason: op.reason,
            currency: op.currency,
            amount: op.amount,
            sourceId: op.sourceId,
            targetId: op.targetId,
            meta: { smoke: "econ_ui4", op: op.reason }
          });
          if (ref && typeof toastHelper === "function") {
            toastHelper(ref, opts.toastText || `probe:${op.reason}`);
          }
        } catch (_) {}
      }
      const afterPanel = capturePanelStateSig();
      const afterFocus = captureFocusSig();
      const forbiddenCalls = Array.isArray(dbg.__econToastForbiddenCalls) ? dbg.__econToastForbiddenCalls.slice() : [];
      dbg.__econToastForbiddenCalls = savedCalls.concat(forbiddenCalls);
      const failed = [];
      if (!sigEqual(beforePanel.panelStateSig, afterPanel.panelStateSig)) failed.push("panel_state_changed");
      if (!sigEqual(beforeFocus, afterFocus)) failed.push("focus_changed");
      if (forbiddenCalls.length) failed.push("forbidden_calls");
      const result = {
        ok: failed.length === 0,
        failed,
        before: {
          panelStateSig: beforePanel.panelStateSig,
          focusSig: beforeFocus,
          notes: beforePanel.notes
        },
        after: {
          panelStateSig: afterPanel.panelStateSig,
          focusSig: afterFocus,
          notes: afterPanel.notes
        },
        forbiddenCalls,
        notes: []
      };
      try {
        const stamp = formatTimestamp(now());
        console.log(`DUMP_AT [${stamp}]`);
        console.log("ECON_UI4_NOAUTO_BEGIN");
        console.log(JSON.stringify(result));
        console.log("ECON_UI4_NOAUTO_END");
      } catch (_) {}
      return result;
    };
    Game.__DEV.smokeEconUi_NoSilentReasonsOnce = function smokeEconUi_NoSilentReasonsOnce(opts = {}) {
      const now = () => (Game.Time && typeof Game.Time.now === "function") ? Game.Time.now() : Date.now();
      const formatTimestamp = (stamp) => {
        const d = new Date(stamp);
        const pad = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      };
      const dbg = (Game && Game.__D) ? Game.__D : (window.Game.__D = window.Game.__D || {});
      const sampleLimit = (opts && Number.isFinite(opts.sampleLimit)) ? (opts.sampleLimit | 0) : 5;
      const summary = { rowsChecked: 0, silentCount: 0, silentSamples: [] };
      const failed = [];
      const scenarioAudit = [];

      const ensurePointsForRematch = (targetId, battleId) => {
        if (!targetId) return;
        const Econ = Game.ConflictEconomy || Game._ConflictEconomy || null;
        if (!Econ || typeof Econ.transferPoints !== "function") return;
        const getSnapshotPoints = (pid) => {
          const stateRef = Game.__S || Game.State || {};
          if (!pid) return 0;
          if (pid === "me") {
            const me = stateRef.me || (stateRef.players && stateRef.players.me);
            return (me && Number.isFinite(me.points)) ? (me.points | 0) : 0;
          }
          const player = stateRef.players ? stateRef.players[pid] : null;
          return (player && Number.isFinite(player.points)) ? (player.points | 0) : 0;
        };
        if (getSnapshotPoints(targetId) >= 1) return;
        try {
          Econ.transferPoints("worldBank", targetId, 1, "smoke_rematch_seed", {
            battleId,
            context: { battleId },
            meta: { smoke: "econ_ui_no_silent" }
          });
        } catch (_) {}
      };

      const runRematchScenario = () => {
        const Core = Game.ConflictCore || Game._ConflictCore || null;
        if (!Core || typeof Core.requestRematch !== "function" || typeof Core.respondRematch !== "function") {
          return { ok: false, reason: "rematch_core_missing" };
        }
        if (!Game.__DEV || typeof Game.__DEV.smokeBattleCrowdOutcomeOnce !== "function") {
          return { ok: false, reason: "smokeBattleCrowdOutcomeOnce_missing" };
        }
        const battleRes = Game.__DEV.smokeBattleCrowdOutcomeOnce({ allowParallel: false });
        if (!battleRes || battleRes.ok !== true) return { ok: false, reason: "battle_smoke_failed", battleRes };
        const battleId = battleRes.battleId || null;
        if (!battleId) return { ok: false, reason: "battle_id_missing" };
        const stateRef = Game.__S || Game.State || {};
        const battle = (stateRef.battles || []).find(b => b && String(b.id) === String(battleId));
        if (!battle) return { ok: false, reason: "battle_missing", battleId };
        const resultLabel = String(battle.result || "").toLowerCase();
        const winnerId = (resultLabel === "win") ? "me" : (battle.opponentId || "npc_weak");
        const loserId = (resultLabel === "win") ? (battle.opponentId || "npc_weak") : "me";
        if (!loserId) return { ok: false, reason: "loser_missing" };
        ensurePointsForRematch(loserId, battleId);
        const request = Core.requestRematch(battleId, loserId);
        if (!request || request.ok !== true) return { ok: false, reason: "rematch_request_failed", request };
        const respond = Core.respondRematch(battleId, true, winnerId);
        if (!respond || respond.ok !== true) return { ok: false, reason: "rematch_respond_failed", respond };
        return { ok: true, battleId, request, respond };
      };

      const scenarioDefs = [
        {
          label: "battle",
          runner: () => {
            if (!Game.__DEV || typeof Game.__DEV.smokeBattleCrowdOutcomeOnce !== "function") {
              return { ok: false, reason: "smokeBattleCrowdOutcomeOnce_missing" };
            }
            return Game.__DEV.smokeBattleCrowdOutcomeOnce({ allowParallel: false });
          }
        },
        {
          label: "crowd",
          runner: () => {
            if (!Game.__DEV || typeof Game.__DEV.smokeNpcCrowdEventEconomyOnce !== "function") {
              return { ok: false, reason: "smokeNpcCrowdEventEconomyOnce_missing" };
            }
            return Game.__DEV.smokeNpcCrowdEventEconomyOnce({ forceBranch: "majority" });
          }
        },
        {
          label: "report",
          runner: () => {
            if (typeof window.devReportTest !== "function") {
              return { ok: false, reason: "devReportTest_missing" };
            }
            return window.devReportTest({ mode: "false" });
          }
        },
        { label: "rematch", runner: runRematchScenario },
        {
          label: "escape",
          runner: () => {
            if (!Game.__DEV || typeof Game.__DEV.smokeEscapeCrowdOutcomeOnce !== "function") {
              return { ok: false, reason: "smokeEscapeCrowdOutcomeOnce_missing" };
            }
            return Game.__DEV.smokeEscapeCrowdOutcomeOnce({ allowParallel: false });
          }
        }
      ];

      const runScenario = (def) => {
        const beforeLen = (Array.isArray(dbg.moneyLog)) ? dbg.moneyLog.length : 0;
        let scenarioResult = null;
        try {
          scenarioResult = def.runner();
        } catch (err) {
          scenarioResult = { ok: false, reason: err && err.message ? String(err.message) : "exception" };
        }
        const afterLen = (Array.isArray(dbg.moneyLog)) ? dbg.moneyLog.length : 0;
        const rows = (Array.isArray(dbg.moneyLog) && afterLen > beforeLen) ? dbg.moneyLog.slice(beforeLen, afterLen) : [];
        scenarioAudit.push({
          label: def.label,
          ok: scenarioResult ? (scenarioResult.ok !== false) : true,
          reason: scenarioResult && scenarioResult.reason ? scenarioResult.reason : null,
          rowsCount: rows.length
        });
        if (scenarioResult && scenarioResult.ok === false) {
          failed.push(`scenario:${def.label}:${scenarioResult.reason || "failed"}`);
        }
        rows.forEach(row => {
          if (!row || typeof row !== "object") return;
          const involvesMe = (String(row.sourceId || "") === "me") || (String(row.targetId || "") === "me");
          const amountSource = (row.amount !== undefined) ? row.amount : ((row.delta !== undefined) ? row.delta : 0);
          const amount = Number(amountSource);
          const currencyCandidate = String(row.currency || row.kind || "").toLowerCase();
          if (!involvesMe && !row.txId) return;
          if (involvesMe && (!row.txId || row.txId === "undefined")) {
            failed.push(`missing_txId:${String(row.reason || "unknown")}`);
            return;
          }
          if (involvesMe && Number.isFinite(amount) && amount !== 0) {
            if (currencyCandidate !== "points" && currencyCandidate !== "rep") {
              failed.push(`missing_currency:${String(row.reason || "unknown")}`);
              return;
            }
          }
          if (shouldToastRow(row)) {
            summary.rowsChecked += 1;
            const hasToast = Array.isArray(dbg.toastLog) ? dbg.toastLog.some(t => t && t.kind === "econ" && row.txId && row.txId === t.txId) : false;
            if (!hasToast) {
              summary.silentCount += 1;
              if (summary.silentSamples.length < sampleLimit) {
                summary.silentSamples.push({
                  scenario: def.label,
                  reason: row.reason,
                  currency: row.currency,
                  amount: row.amount,
                  txId: row.txId,
                  battleId: row.battleId,
                  eventId: row.eventId
                });
              }
              failed.push(`silent:${def.label}:${String(row.reason || "unknown")}:missing`);
            }
          }
        });
      };

      for (const scenarioDef of scenarioDefs) {
        runScenario(scenarioDef);
      }

      const result = {
        ok: failed.length === 0,
        failed,
        summary,
        scenarios: scenarioAudit
      };
      try {
        const stamp = formatTimestamp(now());
        console.log(`DUMP_AT [${stamp}]`);
        console.log("ECON_UI5_COVERAGE_BEGIN");
        console.log(JSON.stringify(result));
        console.log("ECON_UI5_COVERAGE_END");
      } catch (_) {}
      return result;
    };
  }

  installEconUiSideEffectGuards();
  if (typeof window !== "undefined") {
    const scheduleGuard = () => installEconUiSideEffectGuards();
    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(scheduleGuard);
    } else {
      setTimeout(scheduleGuard, 0);
    }
  }

  function createReactionPolicy(){
    const SHORT_WINDOW_MS = 60 * 1000;
    const TEMP_BLOCK_TTL_MS = 120 * 1000;
    const LONG_WINDOW_MS = 10 * 60 * 1000;
    const HARD_THRESHOLD = 5;
    const MAX_REACTIONS = 180;
    const HARD_TYPES = new Set(["critical_tamper", "forbidden_api_repeat"]);
    const LEVELS = {
      LOG_ONLY: "log_only",
      TEMP_BLOCK: "temp_block",
      PERMA_FLAG: "perma_flag",
    };
    const PRIORITY = {
      [LEVELS.LOG_ONLY]: 0,
      [LEVELS.TEMP_BLOCK]: 1,
      [LEVELS.PERMA_FLAG]: 2,
    };
    const STORAGE_KEY = "AsyncScene_security_perma_flags_v1";
    const storage = (typeof window !== "undefined" && window.localStorage) ? window.localStorage : null;

    function loadPersisted(){
      if (!storage) return {};
      try {
        const raw = storage.getItem(STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") return parsed;
      } catch (_) {}
      return {};
    }

    let persistedPerma = loadPersisted();
    const restoredPlayers = [];
    const history = new Map();

    function ensureStateFlags(){
      if (!State.securityFlags || typeof State.securityFlags !== "object") {
        State.securityFlags = {};
      }
    }

    function cleanupExpiredFlag(playerId){
      ensureStateFlags();
      const flag = State.securityFlags[playerId];
      if (!flag) return null;
      if (flag.level === LEVELS.TEMP_BLOCK && flag.until && Date.now() >= (flag.until || 0)) {
        delete State.securityFlags[playerId];
        return null;
      }
      return flag;
    }

    function getStateFlag(playerId){
      if (!playerId) return null;
      return cleanupExpiredFlag(String(playerId));
    }

    function persistPermaFlags(){
      if (!storage) return;
      const payload = {};
      const flags = State.securityFlags || {};
      for (const [pid, flag] of Object.entries(flags)) {
        if (flag && flag.level === LEVELS.PERMA_FLAG) {
          payload[pid] = { since: Number(flag.since || Date.now()) };
        }
      }
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (_) {}
      persistedPerma = payload;
    }

    function setFlagForPlayer(playerId, level, stamp, extra = {}){
      ensureStateFlags();
      const key = playerId ? String(playerId) : "me";
      const current = cleanupExpiredFlag(key);
      const nextPriority = PRIORITY[level] || 0;
      const currentPriority = current ? (PRIORITY[current.level] || 0) : -1;
      if (current && current.level === LEVELS.TEMP_BLOCK && level === LEVELS.TEMP_BLOCK) {
        current.until = Math.max(current.until || 0, Number(extra.until || 0));
        current.since = stamp;
        current.counts = extra.counts || current.counts;
        return current;
      }
      if (current && currentPriority > nextPriority) {
        return current;
      }
      const entry = {
        level,
        since: stamp,
        until: (level === LEVELS.TEMP_BLOCK) ? Number(extra.until || 0) : null,
        counts: extra.counts || null,
        type: extra.type || null,
      };
      State.securityFlags[key] = entry;
      if (level === LEVELS.PERMA_FLAG) {
        persistedPerma = { ...persistedPerma, [key]: { since: stamp } };
        persistPermaFlags();
      }
      return entry;
    }

    function restorePersistedFlags(){
      if (isDevFlag && isDevFlag()) {
        ensureStateFlags();
        State.securityFlags = {};
        restoredPlayers.length = 0;
        return;
      }
      ensureStateFlags();
      State.securityFlags = {};
      restoredPlayers.length = 0;
      for (const [pid, data] of Object.entries(persistedPerma || {})) {
        if (!pid) continue;
        State.securityFlags[pid] = {
          level: LEVELS.PERMA_FLAG,
          since: Number((data && data.since) || Date.now()),
          until: null,
        };
        restoredPlayers.push(pid);
      }
    }

    const REACTION_LOG_TTL_MS = 1500;
    const reactionLogLast = new Map();

    function makeReactionLogKey(entry){
      if (!entry) return "";
      const playerId = entry.playerId || "me";
      const sessionId = entry.sessionId || "";
      const type = entry.type || "";
      const reaction = entry.reaction || "";
      const metaKey = entry.meta && entry.meta.key ? String(entry.meta.key) : "";
      return [playerId, sessionId, type, reaction, metaKey].join("|");
    }

    function shouldLogReaction(key, ttl = REACTION_LOG_TTL_MS){
      if (!key) return true;
      const stamp = Date.now();
      const prev = reactionLogLast.get(key) || 0;
      if (stamp - prev < ttl) return false;
      reactionLogLast.set(key, stamp);
      return true;
    }

    function emitReactionConsole(entry){
      if (!entry || !isDevFlag()) return;
      const key = makeReactionLogKey(entry);
      if (!shouldLogReaction(key)) return;
      const payload = {
        time: entry.time,
        playerId: entry.playerId,
        sessionId: entry.sessionId,
        type: entry.type,
        reaction: entry.reaction,
        counts: entry.counts,
        window: {
          shortWindowMs: SHORT_WINDOW_MS,
          longWindowMs: LONG_WINDOW_MS,
        },
        meta: entry.meta,
      };
      try {
        console.log("[SEC:reaction]", payload);
      } catch (_) {}
    }

    function emitRestoreEvents(){
      if (!restoredPlayers.length) return;
      if (!Security || typeof Security.emit !== "function") return;
      for (const pid of restoredPlayers) {
        Security.emit("perma_flag_restore", { restored: true, playerId: String(pid) }, { minGapMs: 1500 });
      }
    }

    function ensureReactionArray(){
      if (!Game.__D) Game.__D = {};
      if (!Array.isArray(Game.__D.securityReactions)) Game.__D.securityReactions = [];
      return Game.__D.securityReactions;
    }

    function pushReactionLog(entry){
      if (!entry) return;
      const arr = ensureReactionArray();
      arr.push(entry);
      if (arr.length > MAX_REACTIONS) {
        arr.splice(0, arr.length - MAX_REACTIONS);
      }
      emitReactionConsole(entry);
    }

    function recordHistory(typeKey, timestamp){
      let list = history.get(typeKey);
      if (!list) {
        list = [];
        history.set(typeKey, list);
      }
      list.push(timestamp);
      const cutoff = timestamp - LONG_WINDOW_MS;
      while (list.length && list[0] < cutoff) {
        list.shift();
      }
      return list;
    }

    function handleEvent(ev){
      if (!ev || !ev.type) return null;
      const stamp = Number.isFinite(ev.time) ? ev.time : Date.now();
      const origType = String(ev.type);
      const typeKey = origType.toLowerCase();
      const playerId = (ev.playerId && String(ev.playerId)) ? String(ev.playerId) : "me";
      const sessionId = (ev.sessionId && String(ev.sessionId)) ? String(ev.sessionId) : "";
      const list = recordHistory(typeKey, stamp);
      const shortCutoff = stamp - SHORT_WINDOW_MS;
      let shortCount = 0;
      for (let i = list.length - 1; i >= 0; i--) {
        if (list[i] >= shortCutoff) shortCount++;
        else break;
      }
      const longCount = list.length;
      let level = LEVELS.LOG_ONLY;
      const devMode = (typeof isDevFlag === "function") ? isDevFlag() : false;
      if (!devMode) {
      if (typeKey === "perma_flag_restore") {
        level = LEVELS.PERMA_FLAG;
      }
      if (HARD_TYPES.has(typeKey) || longCount >= HARD_THRESHOLD) {
        level = LEVELS.PERMA_FLAG;
      } else if (shortCount >= 2) {
        level = LEVELS.TEMP_BLOCK;
      }
      }
      const counts = { short: shortCount, long: longCount };
      const meta = (ev.meta && typeof ev.meta === "object") ? Object.assign({}, ev.meta) : {};
      let until = null;
      if (!devMode && level === LEVELS.TEMP_BLOCK) {
        until = stamp + TEMP_BLOCK_TTL_MS;
        setFlagForPlayer(playerId, level, stamp, { until, type: origType, counts });
      } else if (!devMode && level === LEVELS.PERMA_FLAG) {
        setFlagForPlayer(playerId, level, stamp, { type: origType, counts });
      }
      const reactionEntry = {
        time: stamp,
        playerId,
        sessionId,
        type: origType,
        reaction: level,
        until: until,
        counts,
        meta,
      };
      pushReactionLog(reactionEntry);
      return reactionEntry;
    }

    function isActionBlocked(playerId){
      if (isDevFlag && isDevFlag()) return false;
      return !!getStateFlag(playerId);
    }

    function getFlag(playerId){
      if (isDevFlag && isDevFlag()) return null;
      return getStateFlag(playerId);
    }

    return {
      handleEvent,
      isActionBlocked,
      getFlag,
      restorePersistedFlags,
      emitRestoreEvents,
    };
  }

  ReactionPolicy = createReactionPolicy();
  Game.SecurityPolicy = ReactionPolicy;
  if (ReactionPolicy && typeof ReactionPolicy.restorePersistedFlags === "function") {
    ReactionPolicy.restorePersistedFlags();
  }

  Security.defineHandleProp("__A", StateAPI);

  function readCrowdCore(){
    return (Game && (Game.ConflictCore || Game._ConflictCore)) ? (Game.ConflictCore || Game._ConflictCore) : null;
  }

  function bindCrowdCoreFunctions(){
    const core = readCrowdCore();
    if (!Game.__A) Game.__A = {};
    Game.__A.applyCrowdVoteTick = (battleId) => {
      try {
        if (!core || typeof core.applyCrowdVoteTick !== "function") return null;
        return core.applyCrowdVoteTick(battleId);
      } catch (_) {
        return null;
      }
    };
    Game.__A.finalizeCrowdVote = (battleId) => {
      try {
        if (!core || typeof core.finalizeCrowdVote !== "function") return null;
        return core.finalizeCrowdVote(battleId);
      } catch (_) {
        return null;
      }
    };
  }

  const debugStore = Game.__D || {};
  Security.defineHandleProp("__D", debugStore);
  Security.defineHandleProp("__SEC", Security.store);
  if (typeof debugStore.pushMoneyLogRow !== "function") {
    debugStore.pushMoneyLogRow = pushMoneyLogRow;
  }
  if (typeof debugStore.pushEconToastFromLogRef !== "function") {
    debugStore.pushEconToastFromLogRef = pushEconToastFromLogRef;
  }
  defineGameSurfaceProp("State", "__S");
  defineGameSurfaceProp("Debug", "__D");
  defineGameSurfaceProp("StateAPI", "__A");

  if (!Game.Social || typeof Game.Social !== "object") Game.Social = {};
  Game.Social.applySocialPenalty = applySocialPenalty;

  bindCrowdCoreFunctions();
  Security.protectMethod(StateAPI, "addPoints", addPoints, "StateAPI.addPoints");
  Security.protectMethod(StateAPI, "spendPoints", spendPoints, "StateAPI.spendPoints");
  Security.protectMethod(StateAPI, "transferRep", transferRep, "StateAPI.transferRep");
  Security.protectMethod(StateAPI, "addRep", addRep, "StateAPI.addRep");
  Security.protectMethod(StateAPI, "giveRespect", giveRespect, "StateAPI.giveRespect");
  Security.finishBoot();
  if (ReactionPolicy && typeof ReactionPolicy.emitRestoreEvents === "function") {
    ReactionPolicy.emitRestoreEvents();
  }
})();
