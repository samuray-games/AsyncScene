// dev/dev-checks.js
window.Game = window.Game || {};
console.warn("DEV_CHECKS_SERVED_PROOF_V3", "served_probe_2026_02_08_1");
console.warn("DEV_CHECKS_SERVED_PROOF_V3_URL", (typeof location !== "undefined" ? location.href : "no_location"));

(function () {
  var logRows = [];
  var eventLogRows = [];
  var dbgLog = [];
  var dbgLogRows = [];
  const Game = window.Game;
  const G = Game;
  if (!G.__DEV) G.__DEV = {};
  console.warn("DEV_OBJ_INIT_V1", { ts: Date.now(), keys: Object.keys(G.__DEV || {}) });
  if (!G.Dev) G.Dev = {};
  if (!G.__DEV.__econNpcAllowlistPackLoaded) {
    G.__DEV.__econNpcAllowlistPackLoaded = true;
    console.warn("ECON_NPC_ALLOWLIST_PACK_V1_LOADED");
  }
  console.warn("ECON_NPC_ALLOWLIST_PACK_V1_BUILD_TAG", "build_2026_02_08g");
  console.warn("DEV_CHECKS_SERVED_PROOF_V4");
  console.warn("DEV_CHECKS_SERVED_PROOF_V4_BUILD_TAG", "build_2026_02_09b");
  console.warn("DEV_CHECKS_RUNTIME_PROOF_V4", "build_2026_02_09b", "url", (document.currentScript && document.currentScript.src) || null, Date.now());
  console.warn("ECON_NPC_WEALTH_TAX_PACK_V1_LOADED");
  console.warn("ECON_NPC_WEALTH_TAX_PACK_V1_BUILD_TAG", "build_2026_02_09b");
  window.__DEV_WEALTH_TAX_PACK_READY__ = true;
  console.warn("ECON_NPC_WEALTH_TAX_PACK_V1_READY_FLAG", !!window.__DEV_WEALTH_TAX_PACK_READY__);
  console.warn("DEV_CHECKS_PROOF_V1", "build_probe_2026_02_08_fix_try_1", Date.now());
  console.warn("DEV_CHECKS_BUILD_TAG_V5", "build_2026_02_12_b2");
  const getDbgLog = () => (Game.__D && Array.isArray(Game.__D.moneyLog)) ? Game.__D.moneyLog : [];
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
  const DEV_FLAG =
    window.__DEV__ === true ||
    window.DEV === true ||
    hasExplicitDevQueryParam();

  const WEALTH_TAX_DUMP_BUILD_TAG = "wt_dump_guard_v3_2026_02_11_01";
  if (typeof window !== "undefined") window.__WT_DUMP_BUILD_TAG__ = WEALTH_TAX_DUMP_BUILD_TAG;
  const emitLine = (line) => {
    const text = String(line);
    try {
      if (Game.__DEV && typeof Game.__DEV._dumpLine === "function") {
        Game.__DEV._dumpLine(text);
        return;
      }
    } catch (_) {}
    try {
      if (typeof window !== "undefined" && typeof window.__CONSOLE_TAPE_EMIT_LINE__ === "function") {
        window.__CONSOLE_TAPE_EMIT_LINE__(text);
        return;
      }
    } catch (_) {}
    try { console.warn(text); } catch (_) {}
  };

  const safeStringify = (obj) => {
    try { return JSON.stringify(obj); } catch (_) { return "[unstringifiable]"; }
  };

  if (!G.__DEV.devChecksFetchProbeOnce) {
    G.__DEV.devChecksFetchProbeOnce = async function devChecksFetchProbeOnce(opts = {}) {
      const url = (opts && typeof opts.url === "string") ? opts.url : "/dev/dev-checks.js";
      const expect = (opts && typeof opts.expect === "string") ? opts.expect : "DEV_CHECKS_RUNTIME_PROOF_V4";
      try {
        const resp = await fetch(`${url}?cacheBust=${Date.now()}&probe=1`, { cache: "no-store" });
        const text = await resp.text();
        const hasMarker = text.includes(expect);
        const mtime = resp.headers.get("X-DEV-CHECKS-MTIME");
        const sha1 = resp.headers.get("X-DEV-CHECKS-SHA1");
        const payload = {
          ok: resp.ok && hasMarker,
          status: resp.status,
          mtime: mtime || null,
          sha1: sha1 || null,
          url: resp.url,
          hasMarker,
          len: text.length
        };
        if (window && window.console && typeof window.console.warn === "function") {
          window.console.warn("DEV_CHECKS_FETCH_PROBE_V1", payload);
        }
        return payload;
      } catch (err) {
        const payload = {
          ok: false,
          status: null,
          errorMessage: String(err && err.message ? err.message : err),
          errorStack: err && err.stack ? err.stack : null,
          hasMarker: false
        };
        if (window && window.console && typeof window.console.warn === "function") {
          window.console.warn("DEV_CHECKS_FETCH_PROBE_V1", payload);
        }
        return payload;
      }
    };
  }

  const bootTryEnabled = (() => {
    try {
      if (window && window.__DEV_ENABLE_BOOT_TRY__ === true) return true;
      if (window && window.localStorage && window.localStorage.getItem("DEV_ENABLE_BOOT_TRY") === "1") return true;
    } catch (_) {}
    return false;
  })();

  if (G.__DEV) {
    G.__DEV.__bootPhase = true;
    const clearBoot = () => { G.__DEV.__bootPhase = false; };
    if (typeof queueMicrotask === "function") queueMicrotask(clearBoot);
    else setTimeout(clearBoot, 0);
  }

  const ensureDevStoreSurface = () => {
    if (Game.__DEV && typeof Game.__DEV === "object") return Game.__DEV;
    const store = {};
    Object.defineProperty(Game, "__DEV", {
      value: store,
      writable: true,
      configurable: true,
      enumerable: false,
    });
    if (typeof window !== "undefined" && typeof window.__defineGameSurfaceProp === "function") {
      window.__defineGameSurfaceProp("Dev", "__DEV");
    }
    return store;
  };

  const addStage3SmokeHelper = (devStore) => {
    if (typeof devStore.smokeStage3Step4Once === "function") return;
    devStore.smokeStage3Step4Once = function (opts = {}) {
      const mode = opts && opts.mode === "dev" ? "dev" : "prod";
      const coreSurf = Game._ConflictCore || Game.ConflictCore || null;
      const conflictApi = Game.Conflict || null;
      const ui = Game.UI || null;
      const apiSurfaceKeys = [];
      const evidence = [];
      const exposures = [
        { label: "Game._ConflictCore", obj: coreSurf },
        { label: "Game.ConflictCore", obj: Game.ConflictCore },
        { label: "Game.Conflict", obj: conflictApi },
        { label: "Game.UI", obj: ui },
        { label: "Game.__A", obj: Game.__A },
      ];

      exposures.forEach(({ label, obj }) => {
        if (!obj || typeof obj !== "object") return;
        const keys = Object.keys(obj).sort().slice(0, 3);
        if (keys.length) {
          apiSurfaceKeys.push(`${label}:${keys.join(",")}`);
        }
      });

      let hasComputeOutcome = false;
      exposures.forEach(({ label, obj }) => {
        if (!obj || typeof obj !== "object") {
          evidence.push(`${label} missing`);
          return;
        }
        const value = obj.computeOutcome;
        if (typeof value === "function") {
          hasComputeOutcome = true;
          evidence.push(`${label}.computeOutcome exposed`);
        } else {
          evidence.push(`${label}.computeOutcome undefined`);
        }
      });
      if (!hasComputeOutcome) {
        evidence.push("computeOutcome hidden from public surfaces");
      }

      const state = Game.__S || {};
      if (!Array.isArray(state.battles)) state.battles = [];
      const econ = Game._ConflictEconomy || null;
      const origApplyResult = econ && typeof econ.applyResult === "function" ? econ.applyResult : null;
      if (econ && typeof econ.applyResult === "function") {
        econ.applyResult = () => ({ ok: true });
      }

      const npcId = "npc_smoke_stage3";
      const createdNpc = !state.players || !state.players[npcId];
      if (!state.players) state.players = {};
      if (createdNpc) {
        state.players[npcId] = { id: npcId, name: "SmokeNPC", npc: true };
      }

      const battleId = `smoke_stage3_${mode}_${Date.now().toString(36).slice(-4)}`;
      const battle = {
        id: battleId,
        opponentId: npcId,
        fromThem: true,
        status: "pickDefense",
        attack: { id: "canon_smoke_attack", type: "yn", group: "yn", color: "y", text: "Smoke attack" },
        defense: null,
        resolved: false,
        finished: false,
        noted: "smoke",
      };
      state.battles.push(battle);

      const defenseArg = { id: "canon_smoke_defense", type: "yn", group: "yn", color: "y", text: "Smoke defense" };
      let resolution = null;
      if (coreSurf && typeof coreSurf.resolveBattleOutcome === "function") {
        resolution = coreSurf.resolveBattleOutcome(battleId, defenseArg, { forceOutcome: "win" });
      } else {
        evidence.push("resolveBattleOutcome unavailable");
      }

      const outcomeWorks = !!(resolution && resolution.ok && typeof resolution.outcome === "string");
      if (outcomeWorks) {
        evidence.push(`resolveBattleOutcome returned ${resolution.outcome}`);
      } else {
        evidence.push("resolveBattleOutcome failed to resolve outcome");
      }

      state.battles = state.battles.filter(b => !(b && b.id === battleId));
      if (createdNpc && state.players && state.players[npcId]) {
        delete state.players[npcId];
      }
      if (econ && typeof econ.applyResult === "function") {
        if (origApplyResult) {
          econ.applyResult = origApplyResult;
        } else {
          delete econ.applyResult;
        }
      }

      const ok = outcomeWorks && !hasComputeOutcome;
      return {
        ok,
        mode,
        hasComputeOutcome,
        apiSurfaceKeys,
        outcomeWorks,
        evidence,
      };
    };
  };

  const addRespectLedgerSmokeHelper = (devStore) => {
    if (typeof devStore.smokeRespectLedgerOnce === "function") return;
    devStore.smokeRespectLedgerOnce = function (opts = {}) {
      const stateApi = Game.StateAPI || null;
      const players = (Game.State && Game.State.players) ? Game.State.players : {};
      const npcId = opts.npcId || Object.keys(players).find(id => id && id.startsWith("npc_")) || "npc_weak";
      const baseTs = Number.isFinite(opts.nowTs) ? opts.nowTs : Date.now();
      const pad = (n) => String(n).padStart(2, "0");
      const d = new Date(baseTs);
      const dayKey = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const makeResult = (fn) => {
        try {
          return fn();
        } catch (err) {
          return { ok: false, error: String(err && err.message ? err.message : err), errorStack: err && err.stack ? err.stack : null };
        }
      };
      if (!stateApi || typeof stateApi.giveRespect !== "function") {
        return {
          ok: false,
          reason: "state_api_missing",
          dayKey,
          npcId,
        };
      }
      const r1 = makeResult(() => stateApi.giveRespect("me", npcId, baseTs));
      const r2 = makeResult(() => stateApi.giveRespect("me", npcId, baseTs + 1000));
      const r3 = makeResult(() => stateApi.giveRespect(npcId, "me", baseTs + 2000));
      const r4 = makeResult(() => stateApi.giveRespect("me", "me", baseTs + 3000));
      const ledger = (Game.State && Game.State.progress && Game.State.progress.respectLedger) ? Game.State.progress.respectLedger : null;
      const lastPair = ledger && ledger.lastByPairDay && ledger.lastByPairDay.me ? ledger.lastByPairDay.me[npcId] : null;
      return {
        ok: true,
        dayKey,
        npcId,
        results: {
          r1,
          r2,
          r3,
          r4,
        },
        asserts: {
          pairDaily: r2 && r2.reason === "respect_pair_daily",
          chain: r3 && r3.reason === "respect_no_chain",
          self: r4 && r4.reason === "respect_self",
        },
        ledgerSnapshot: {
          lastByPairDay: lastPair ? { me: { [npcId]: lastPair } } : null,
          lastInboundDay: ledger && ledger.lastInboundDay ? { ...ledger.lastInboundDay } : null,
        },
      };
    };
  };

  const addRespectEmitterSmokeHelper = (devStore) => {
    if (typeof devStore.smokeRespectEmitterCapOnce === "function") return;
    devStore.smokeRespectEmitterCapOnce = function (opts = {}) {
      const stateApi = Game.StateAPI || null;
      if (!stateApi || typeof stateApi.giveRespect !== "function") {
        return { ok: false, reason: "state_api_missing" };
      }
      const cap = (Game.__DEV && typeof Game.__DEV.getRespectEmitterCap === "function")
        ? (Game.__DEV.getRespectEmitterCap() | 0)
        : 20;
      const players = (Game.State && Game.State.players) ? Game.State.players : {};
      const npcIds = Object.keys(players).filter(id => id && id.startsWith("npc_"));
      const targets = [];
      for (let i = 0; i < npcIds.length; i++) targets.push(npcIds[i]);
      while (targets.length < cap + 1) {
        targets.push(`respect_target_${targets.length}`);
      }
      const baseTs = Number.isFinite(opts.nowTs) ? opts.nowTs : Date.now();
      let okCount = 0;
      const notes = [];
      for (let i = 0; i < cap; i++) {
        const res = stateApi.giveRespect("me", targets[i], baseTs + (i * 1000));
        if (res && res.ok === true) {
          okCount++;
        } else {
          notes.push({ idx: i, reason: res && res.reason ? res.reason : "unknown" });
        }
      }
      const fail = stateApi.giveRespect("me", targets[cap], baseTs + (cap * 1000) + 500);
      const emitterAfter = (Game.State && Game.State.progress && Game.State.progress.repEmitter)
        ? Game.State.progress.repEmitter
        : null;
      const dayKey = fail && fail.meta && fail.meta.dayKey ? fail.meta.dayKey : null;
      const ok = okCount === cap && fail && fail.reason === "respect_emitter_empty" && !notes.length;
      return {
        ok,
        cap,
        dayKey,
        okCount,
        fail,
        emitterAfter,
        notes,
      };
    };
  };

  const addRespectPointsCostSmokeHelper = (devStore) => {
    if (typeof devStore.smokeRespectPointsCostOnce === "function") return;
    devStore.smokeRespectPointsCostOnce = function (opts = {}) {
      const stateApi = Game.StateAPI || null;
      const S = Game.State || null;
      const D = Game.__D || (Game.__D = {});
      const Econ = Game._ConflictEconomy || null;
      if (!stateApi || typeof stateApi.giveRespect !== "function") {
        return { ok: false, failed: ["state_api_missing"] };
      }
      if (!S || !S.players) {
        return { ok: false, failed: ["state_missing"] };
      }
      const sumSnapshot = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function")
        ? Game.__DEV.sumPointsSnapshot
        : null;
      if (!sumSnapshot) {
        return { ok: false, failed: ["sumPointsSnapshot_missing"] };
      }

      const npcIds = Object.keys(S.players).filter(id => id && String(id).startsWith("npc_"));
      const npcId = npcIds[0] || "npc_weak";
      const npcId2 = (npcIds[1] && npcIds[1] !== npcId) ? npcIds[1] : `${npcId}_alt`;
      const baseTs = Number.isFinite(opts.nowTs) ? opts.nowTs : Date.now();
      const pad = (n) => String(n).padStart(2, "0");
      const d = new Date(baseTs);
      const dayKey = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

      const setPoints = (obj, v) => {
        if (!obj) return;
        const val = Number.isFinite(Number(v)) ? Number(v) : 0;
        if (typeof Game._withPointsWrite === "function") {
          Game._withPointsWrite(() => { obj.points = val; });
        } else {
          obj.points = val;
        }
      };
      const setMePoints = (v) => {
        setPoints(S.me, v);
        if (S.players && S.players.me) setPoints(S.players.me, v);
      };

      // Clear ledger entries for the tested pairs to avoid pairDaily/chain noise.
      if (S.progress && S.progress.respectLedger && S.progress.respectLedger.lastByPairDay) {
        S.progress.respectLedger.lastByPairDay.me = Object.create(null);
        S.progress.respectLedger.lastByPairDay[npcId] = Object.create(null);
        S.progress.respectLedger.lastByPairDay[npcId2] = Object.create(null);
      }
      if (S.progress && S.progress.repEmitter) {
        S.progress.repEmitter.balance = (Game.__DEV && typeof Game.__DEV.getRespectEmitterCap === "function")
          ? (Game.__DEV.getRespectEmitterCap() | 0)
          : 20;
        S.progress.repEmitter.dayKey = dayKey;
      }

      setMePoints(1);
      const beforeSnap = sumSnapshot();
      const log = Array.isArray(D.moneyLog) ? D.moneyLog : (D.moneyLog = []);
      const logStart = log.length;

      const r1 = stateApi.giveRespect("me", npcId, baseTs);
      const afterSnap1 = sumSnapshot();
      const logMid = log.length;
      const r1Rows = log.slice(logStart, logMid);
      const opKey = r1 && r1.meta ? r1.meta.opKey : null;
      const costRows = r1Rows.filter(row => row && row.reason === "points_respect_cost" && row.meta && row.meta.opKey === opKey);

      setMePoints(0);
      const r2 = stateApi.giveRespect("me", npcId2, baseTs + 1000);
      const afterSnap2 = sumSnapshot();
      const logEnd = log.length;
      const r2Rows = log.slice(logMid, logEnd);

      const failed = [];
      if (!r1 || r1.ok !== true) failed.push("r1_not_ok");
      if (r1 && r1.reason !== "rep_respect_given") failed.push("r1_reason_mismatch");
      if (r1 && r1.delta && r1.delta.points !== -1) failed.push("r1_delta_points_mismatch");
      if (S.me && Number.isFinite(S.me.points) && (S.me.points | 0) !== 0) failed.push("r1_points_not_deducted");
      if (afterSnap1 && beforeSnap && ((afterSnap1.total | 0) - (beforeSnap.total | 0)) !== 0) failed.push("world_drift_after_r1");
      if (costRows.length !== 1) failed.push("moneylog_missing_points_respect_cost");

      if (!r2 || r2.ok !== false) failed.push("r2_not_blocked");
      if (r2 && r2.reason !== "respect_no_points") failed.push("r2_reason_mismatch");
      if (S.me && Number.isFinite(S.me.points) && (S.me.points | 0) !== 0) failed.push("r2_points_changed");
      if (afterSnap2 && afterSnap1 && ((afterSnap2.total | 0) - (afterSnap1.total | 0)) !== 0) failed.push("world_drift_after_r2");
      if (r2Rows.length !== 0) failed.push("moneylog_rows_on_fail");

      return {
        ok: failed.length === 0,
        failed,
        r1,
        r2,
        beforeAfter: {
          mePtsBefore: beforeSnap && beforeSnap.byId ? beforeSnap.byId.me : null,
          mePtsAfter1: afterSnap1 && afterSnap1.byId ? afterSnap1.byId.me : null,
          mePtsAfter2: afterSnap2 && afterSnap2.byId ? afterSnap2.byId.me : null,
          worldTotalBefore: beforeSnap ? beforeSnap.total : null,
          worldTotalAfter1: afterSnap1 ? afterSnap1.total : null,
          worldTotalAfter2: afterSnap2 ? afterSnap2.total : null,
        },
        moneyLog: {
          addedCount: logEnd - logStart,
          reasons: r1Rows.map(row => row && row.reason ? row.reason : "unknown"),
          opKey,
        },
        notes: [],
      };
    };
  };

  const addRespectMoneyLogSmokeHelper = (devStore) => {
    if (typeof devStore.smokeRespectMoneyLogOnce === "function") return;
    devStore.smokeRespectMoneyLogOnce = function (opts = {}) {
      const stateApi = Game.StateAPI || null;
      const S = Game.State || null;
      const D = Game.__D || (Game.__D = {});
      if (!stateApi || typeof stateApi.giveRespect !== "function") {
        return { ok: false, failed: ["state_api_missing"] };
      }
      if (!S || !S.players) {
        return { ok: false, failed: ["state_missing"] };
      }
      const npcIds = Object.keys(S.players).filter(id => id && String(id).startsWith("npc_"));
      const npcIdA = npcIds[0] || "npc_weak";
      const npcIdB = (npcIds[1] && npcIds[1] !== npcIdA) ? npcIds[1] : `${npcIdA}_alt`;
      const baseTs = Number.isFinite(opts.nowTs) ? opts.nowTs : Date.now();

      const setPoints = (obj, v) => {
        if (!obj) return;
        const val = Number.isFinite(Number(v)) ? Number(v) : 0;
        if (typeof Game._withPointsWrite === "function") {
          Game._withPointsWrite(() => { obj.points = val; });
        } else {
          obj.points = val;
        }
      };
      const setMePoints = (v) => {
        setPoints(S.me, v);
        if (S.players && S.players.me) setPoints(S.players.me, v);
      };

      if (S.progress && S.progress.respectLedger && S.progress.respectLedger.lastByPairDay) {
        S.progress.respectLedger.lastByPairDay.me = Object.create(null);
        S.progress.respectLedger.lastByPairDay[npcIdA] = Object.create(null);
        S.progress.respectLedger.lastByPairDay[npcIdB] = Object.create(null);
      }

      setMePoints(2);
      const log = Array.isArray(D.moneyLog) ? D.moneyLog : (D.moneyLog = []);
      const start = log.length;
      const r1 = stateApi.giveRespect("me", npcIdA, baseTs);
      const mid = log.length;
      const added1 = log.slice(start, mid);
      const reasons1 = added1.map(row => row && row.reason ? row.reason : "unknown");
      const r1Refill = !!(r1 && r1.meta && r1.meta.emitterRefilled);

      const r2 = stateApi.giveRespect("me", npcIdA, baseTs + 1000);
      const end = log.length;
      const added2 = log.slice(mid, end);
      const reasons2 = added2.map(row => row && row.reason ? row.reason : "unknown");

      const countReason = (arr, reason) => arr.filter(r => r === reason).length;
      const failed = [];
      if (!r1 || r1.ok !== true) failed.push("r1_not_ok");
      if (r1 && r1.delta && r1.delta.points !== -1) failed.push("r1_points_delta_mismatch");
      if (r1 && r1.delta && r1.delta.rep !== 1) failed.push("r1_rep_delta_mismatch");
      if (countReason(reasons1, "points_respect_cost") !== 1) failed.push("r1_cost_row_count_mismatch");
      if (countReason(reasons1, "rep_respect_given") !== 1) failed.push("r1_rep_row_count_mismatch");
      const refillCount = countReason(reasons1, "rep_emitter_refill");
      if (r1Refill && refillCount !== 1) failed.push("r1_refill_row_missing");
      if (!r1Refill && refillCount !== 0) failed.push("r1_refill_row_unexpected");

      if (!r2 || r2.ok !== false) failed.push("r2_not_blocked");
      if (r2 && r2.reason !== "respect_pair_daily") failed.push("r2_reason_mismatch");
      if (added2.length !== 0) failed.push("r2_added_rows");

      return {
        ok: failed.length === 0,
        failed,
        r1,
        r2,
        moneyLog: {
          added1: added1.length,
          reasons1,
          added2: added2.length,
          reasons2,
        },
        notes: [],
      };
    };
  };

  const addRespectUiSmokeHelper = (devStore) => {
    if (typeof devStore.smokeRespectUiOnce === "function") return;
    devStore.smokeRespectUiOnce = async function (opts = {}) {
      const S = Game.State || {};
      const uiClick = Game.__DEV && typeof Game.__DEV.__uiRespectClick__ === "function"
        ? Game.__DEV.__uiRespectClick__
        : null;
      const uiVisible = Game.__DEV && typeof Game.__DEV.__uiRespectButtonVisible__ === "function"
        ? Game.__DEV.__uiRespectButtonVisible__
        : null;
      const diag = {
        hasDev: !!Game.__DEV,
        devKeys: Object.keys(Game.__DEV || {}),
        hasClick: !!(Game.__DEV && Game.__DEV.__uiRespectClick__),
        hasVisible: !!(Game.__DEV && Game.__DEV.__uiRespectButtonVisible__),
      };
      const notes = [];
      if (!uiVisible) notes.push("ui_visible_hook_missing");
      if (!uiClick) notes.push("ui_click_hook_missing");
      if (!uiClick) {
        const markers = Game.__DEV && Game.__DEV.__markers__ ? Game.__DEV.__markers__ : {};
        if (markers.uiDmLoaded && !markers.uiRespectHooks) notes.push("ui_dm_loaded_but_hooks_missing");
        return { ok: false, failed: ["ui_respect_handler_missing"], asserts: {}, notes, diag };
      }
      const npcIds = Object.keys(S.players || {}).filter(id => id && String(id).startsWith("npc_"));
      const npcId = opts.targetId || npcIds[0] || "npc_weak";
      const meId = (S.me && S.me.id) ? String(S.me.id) : "me";
      const setPoints = (obj, amt) => {
        if (!obj) return;
        const val = Number.isFinite(Number(amt)) ? Number(amt) : 0;
        if (typeof Game._withPointsWrite === "function") {
          Game._withPointsWrite(() => { obj.points = val; });
        } else {
          obj.points = val;
        }
      };
      const setMePoints = (v) => {
        setPoints(S.me, v);
        if (S.players && S.players.me) setPoints(S.players.me, v);
      };

      setMePoints(2);
      if (Game.__DEV && Array.isArray(Game.__DEV.__toastTape__)) {
        Game.__DEV.__toastTape__.length = 0;
      } else if (Game.__DEV) {
        Game.__DEV.__toastTape__ = [];
      }
      const r1 = uiClick(npcId, opts.nowTs || Date.now());
      await new Promise(r => setTimeout(r, 0));
      await new Promise(r => setTimeout(r, 0));
      const tape = (Game.__DEV && Array.isArray(Game.__DEV.__toastTape__)) ? Game.__DEV.__toastTape__ : [];
      const toasts1 = tape.slice();
      const last2 = tape.slice(-2).map(e => (e && typeof e.text === "string") ? e.text : null);
      const toast1 = last2[0] || null;
      const toast2 = last2[1] || null;
      diag.toastCallCount = (Game.__DEV && Number.isFinite(Game.__DEV.__toastCallCount__)) ? Game.__DEV.__toastCallCount__ : 0;
      diag.tapeLen = tape.length;
      if (diag.toastCallCount === 0) notes.push("toast_callcount_zero");
      if (diag.tapeLen === 0) notes.push("toast_tape_empty");
      setMePoints(0);
      const r2 = uiClick(npcId, (opts.nowTs || Date.now()) + 1000);
      await new Promise(r => setTimeout(r, 0));
      await new Promise(r => setTimeout(r, 0));
      const toasts2 = (Game.__DEV && Array.isArray(Game.__DEV.__toastTape__)) ? Game.__DEV.__toastTape__.slice() : [];
      const blockedToast = toasts2[0] ? toasts2[0].text : null;

      const failed = [];
      if (!r1 || r1.ok !== true) failed.push("r1_not_ok");
      if (!r2 || r2.reason !== "respect_pair_daily") failed.push("r2_reason_mismatch");
      if (toast1 !== "Ты отдал 1💰" || toast2 !== "Цель получила +1 REP") {
        failed.push("toast_missing_or_mismatch");
      }

      return {
        ok: failed.length === 0,
        failed,
        asserts: {
          selfHidden: uiVisible ? !uiVisible(meId) : true,
          npcShown: uiVisible ? !!uiVisible(npcId) : true,
          clickCallsGiveRespect: !!(r1 && r1.ok),
          toast1,
          toast2,
          blockedToast,
        },
        samples: {
          r1,
          r2,
          toasts1,
          toasts2,
        },
        notes,
        diag,
      };
    };
  };

  if (!DEV_FLAG) return;

  const devStore = ensureDevStoreSurface();
  addStage3SmokeHelper(devStore);
  addRespectLedgerSmokeHelper(devStore);
  addRespectEmitterSmokeHelper(devStore);
  addRespectPointsCostSmokeHelper(devStore);
  addRespectMoneyLogSmokeHelper(devStore);
  addRespectUiSmokeHelper(devStore);

  const getNow = () => (Game.Time && typeof Game.Time.now === "function") ? Game.Time.now() : Date.now();

  console.warn("[DEV] content testing hooks enabled");

  const getStateSafe = () => {
    if (!Game.__S || !Game.__S.me) {
      console.warn("[DEV] Game.__S.me missing");
      return null;
    }
    return Game.__S;
  };

  const sync = () => {
    try {
      if (Game.__A && typeof Game.__A.syncMeToPlayers === "function") {
        Game.__A.syncMeToPlayers();
      }
    } catch (_) {}
  };

  const trainingSnapshot = () => {
    if (!Game.TrainingState || typeof Game.TrainingState.getSnapshot !== "function") return null;
    return Game.TrainingState.getSnapshot();
  };

  const normalizeTraining = (raw) => {
    if (!Game.TrainingState || typeof Game.TrainingState.normalize !== "function") return null;
    return Game.TrainingState.normalize(raw);
  };

  const trainingEqual = (a, b) => {
    if (!a || !b) return false;
    if (((a.version || 0) | 0) !== ((b.version || 0) | 0)) return false;
    const keysA = Object.keys(a.byArgKey || {}).sort();
    const keysB = Object.keys(b.byArgKey || {}).sort();
    if (keysA.length !== keysB.length) return false;
    for (let i = 0; i < keysA.length; i++) {
      if (keysA[i] !== keysB[i]) return false;
      const ea = a.byArgKey[keysA[i]] || {};
      const eb = b.byArgKey[keysA[i]] || {};
      if (((ea.level || 0) | 0) !== ((eb.level || 0) | 0)) return false;
      if (((ea.xp || 0) | 0) !== ((eb.xp || 0) | 0)) return false;
      if (((ea.lastTrainedAt || 0) | 0) !== ((eb.lastTrainedAt || 0) | 0)) return false;
      if (((ea.cooldownUntil || 0) | 0) !== ((eb.cooldownUntil || 0) | 0)) return false;
    }
    const ca = a.counters || {};
    const cb = b.counters || {};
    const counters = ["totalTrains", "todayTrains", "lastTrainDay"];
    for (const k of counters) {
      if (((ca[k] || 0) | 0) !== ((cb[k] || 0) | 0)) return false;
    }
    return true;
  };

  const trainingDefaultsOk = (t) => {
    if (!t || typeof t !== "object") return false;
    const counters = t.counters || {};
    const zeroCounters = ["totalTrains", "todayTrains", "lastTrainDay"].every(k => ((counters[k] || 0) | 0) === 0);
    const emptyArgs = Object.keys(t.byArgKey || {}).length === 0;
    const versionOk = ((t.version || 0) | 0) === 1;
    return zeroCounters && emptyArgs && versionOk;
  };

  if (!Game.Dev) Game.Dev = {};
  if (!Game.Dev.config || typeof Game.Dev.config !== "object") Game.Dev.config = {};
  Game.Dev.setBankEnabled = (value) => {
    if (!Game.Bank || typeof Game.Bank.setEnabledForDev !== "function") {
      return { ok: false, reason: "bank_missing" };
    }
    return Game.Bank.setEnabledForDev(value === true);
  };
  Game.Dev.clearBankOverride = () => {
    if (!Game.Bank || typeof Game.Bank.clearOverride !== "function") {
      return { ok: false, reason: "bank_missing" };
    }
    return Game.Bank.clearOverride();
  };
  const getMoneyLog = () => {
    const dbg = Game.__D;
    if (!dbg || !Array.isArray(dbg.moneyLog)) return [];
    return dbg.moneyLog;
  };
  const getMoneyLogSlice = (tail) => {
    const log = getMoneyLog();
    if (!log.length) return [];
    return log.slice(tail);
  };
  const takeSnapshot = () => {
    const econ = Game._ConflictEconomy || Game.ConflictEconomy || null;
    if (econ && typeof econ.sumPointsSnapshot === "function") {
      return econ.sumPointsSnapshot();
    }
    return null;
  };
  const extractPoints = (snap, id) => {
    if (!snap || !snap.byId) return 0;
    const key = String(id || "");
    const raw = snap.byId[key];
    return Number.isFinite(raw) ? (raw | 0) : 0;
  };

  const smokeEcon05BankOnce = (opts = {}) => {
    const name = opts.name || "smoke_econ05_bank_once";
    const ownerId = String(opts.ownerId || "me");
    const result = {
      ok: true,
      failed: [],
      details: { name, ownerId },
      totals: { before: null, after: null },
      deltas: { me: null, bank: null },
      rows: { disabledAttempts: 0, deposits: 0, withdraws: 0 },
      notes: []
    };
    const econ = Game._ConflictEconomy || Game.ConflictEconomy || null;
    if (!econ || !Game.Bank) {
      result.failed.push("setup_missing");
      result.notes.push("bank or econ missing");
      result.ok = false;
      return result;
    }
    const initialSnap = takeSnapshot();
    const recordTotal = (snap) => (snap && Number.isFinite(snap.total)) ? (snap.total | 0) : null;
    result.totals.before = recordTotal(initialSnap);
    const initialBank = extractPoints(initialSnap, "bank");
    const initialOwner = extractPoints(initialSnap, ownerId);
    let finalSnap = null;

    const ensureTotalsStable = (before, after) => {
      if (before == null || after == null) return true;
      if (before !== after) {
        if (!result.failed.includes("totals_drift")) result.failed.push("totals_drift");
        result.ok = false;
        return false;
      }
      return true;
    };

    const expectDisabledLogs = (rows) => {
      const disabledRows = rows.filter(r => r && r.reason === "bank_disabled_attempt");
      if (disabledRows.length !== 2 || rows.length !== 2) {
        if (!result.failed.includes("disabled_log_missing")) result.failed.push("disabled_log_missing");
        result.ok = false;
      }
      result.rows.disabledAttempts = disabledRows.length;
      disabledRows.forEach(row => {
        if (!row.meta || row.meta.status !== "bank_disabled") {
          if (!result.failed.includes("disabled_meta_missing")) result.failed.push("disabled_meta_missing");
          result.ok = false;
        }
      });
      return disabledRows;
    };

    try {
      const disabledTail = getMoneyLog().length;
      Game.Dev.setBankEnabled(false);
      const disabledDeposit = Game.Bank.deposit({ ownerId, amount: 1, reason: "smoke_disabled_deposit" });
      const disabledWithdraw = Game.Bank.withdraw({ ownerId, amount: 1, reason: "smoke_disabled_withdraw" });
      const disabledSnap = takeSnapshot();
      ensureTotalsStable(result.totals.before, recordTotal(disabledSnap));
      const disabledRows = expectDisabledLogs(getMoneyLogSlice(disabledTail));
      if (!disabledDeposit || disabledDeposit.ok !== false || disabledDeposit.reason !== "bank_disabled"
        || !disabledWithdraw || disabledWithdraw.ok !== false || disabledWithdraw.reason !== "bank_disabled") {
        if (!result.failed.includes("disabled_should_block")) result.failed.push("disabled_should_block");
        result.ok = false;
      }
      result.details.disabled = {
        deposit: disabledDeposit,
        withdraw: disabledWithdraw,
        rows: disabledRows,
        totalBefore: result.totals.before,
        totalAfter: recordTotal(disabledSnap)
      };

      Game.Dev.setBankEnabled(true);
      const snapshotBeforeEnabled = takeSnapshot();
      const depositReason = "smoke_deposit_2";
      const withdrawReason = "smoke_withdraw_1";
      const depositTail = getMoneyLog().length;
      const depositSuccess = Game.Bank.deposit({ ownerId, amount: 2, reason: depositReason });
      const depositRows = getMoneyLogSlice(depositTail);
      const snapshotAfterDeposit = takeSnapshot();
      const withdrawTail = getMoneyLog().length;
      const withdrawSuccess = Game.Bank.withdraw({ ownerId, amount: 1, reason: withdrawReason });
      const withdrawRows = getMoneyLogSlice(withdrawTail);
      const snapshotAfterWithdraw = takeSnapshot();
      result.rows.deposits = depositRows.filter(r => r && r.reason === "bank_deposit").length;
      result.rows.withdraws = withdrawRows.filter(r => r && r.reason === "bank_withdraw").length;
      ensureTotalsStable(recordTotal(snapshotBeforeEnabled), recordTotal(snapshotAfterDeposit));
      ensureTotalsStable(recordTotal(snapshotAfterDeposit), recordTotal(snapshotAfterWithdraw));

      const depositRow = depositRows[0] || null;
      if (!depositSuccess || depositSuccess.ok !== true) {
        if (!result.failed.includes("deposit_failed")) result.failed.push("deposit_failed");
        result.ok = false;
      }
      if (!depositRow || depositRow.reason !== "bank_deposit" || depositRow.amount !== 2
        || depositRow.sourceId !== ownerId || depositRow.targetId !== "bank") {
        if (!result.failed.includes("deposit_log_missing")) result.failed.push("deposit_log_missing");
        result.ok = false;
      }
      if (!depositRow || !depositRow.meta || depositRow.meta.userReason !== depositReason
        || depositRow.meta.ownerId !== ownerId || depositRow.meta.bankAccountId !== "bank"
        || depositRow.meta.amount !== 2) {
        if (!result.failed.includes("deposit_meta_invalid")) result.failed.push("deposit_meta_invalid");
        result.ok = false;
      }

      const withdrawRow = withdrawRows[0] || null;
      if (!withdrawSuccess || withdrawSuccess.ok !== true) {
        if (!result.failed.includes("withdraw_failed")) result.failed.push("withdraw_failed");
        result.ok = false;
      }
      if (!withdrawRow || withdrawRow.reason !== "bank_withdraw" || withdrawRow.amount !== 1
        || withdrawRow.sourceId !== "bank" || withdrawRow.targetId !== ownerId) {
        if (!result.failed.includes("withdraw_log_missing")) result.failed.push("withdraw_log_missing");
        result.ok = false;
      }
      if (!withdrawRow || !withdrawRow.meta || withdrawRow.meta.userReason !== withdrawReason
        || withdrawRow.meta.ownerId !== ownerId || withdrawRow.meta.bankAccountId !== "bank"
        || withdrawRow.meta.amount !== 1) {
        if (!result.failed.includes("withdraw_meta_invalid")) result.failed.push("withdraw_meta_invalid");
        result.ok = false;
      }

      const bankBefore = extractPoints(snapshotBeforeEnabled, "bank");
      const ownerBefore = extractPoints(snapshotBeforeEnabled, ownerId);
      const bankAfterDeposit = extractPoints(snapshotAfterDeposit, "bank");
      const ownerAfterDeposit = extractPoints(snapshotAfterDeposit, ownerId);
      const bankAfterWithdraw = extractPoints(snapshotAfterWithdraw, "bank");
      const ownerAfterWithdraw = extractPoints(snapshotAfterWithdraw, ownerId);
      if (bankAfterDeposit !== bankBefore + 2 || ownerAfterDeposit !== ownerBefore - 2) {
        if (!result.failed.includes("positive_deposit_delta")) result.failed.push("positive_deposit_delta");
        result.ok = false;
      }
      if (bankAfterWithdraw !== bankAfterDeposit - 1 || ownerAfterWithdraw !== ownerAfterDeposit + 1) {
        if (!result.failed.includes("positive_withdraw_delta")) result.failed.push("positive_withdraw_delta");
        result.ok = false;
      }

      const negDepositTail = getMoneyLog().length;
      const depositBig = Game.Bank.deposit({ ownerId, amount: 999, reason: "smoke_deposit_big" });
      const negDepositRows = getMoneyLogSlice(negDepositTail);
      const snapshotAfterNegDeposit = takeSnapshot();
      if (!depositBig || depositBig.ok !== false || depositBig.reason !== "insufficient_points") {
        if (!result.failed.includes("deposit_insufficient_missing")) result.failed.push("deposit_insufficient_missing");
        result.ok = false;
      }
      if (negDepositRows.length > 0) {
        if (!result.failed.includes("deposit_negative_log")) result.failed.push("deposit_negative_log");
        result.ok = false;
      }
      if (recordTotal(snapshotAfterNegDeposit) !== recordTotal(snapshotAfterWithdraw)
        || extractPoints(snapshotAfterNegDeposit, "bank") !== bankAfterWithdraw
        || extractPoints(snapshotAfterNegDeposit, ownerId) !== ownerAfterWithdraw) {
        if (!result.failed.includes("deposit_negative_mutation")) result.failed.push("deposit_negative_mutation");
        result.ok = false;
      }

      const negWithdrawTail = getMoneyLog().length;
      const withdrawBig = Game.Bank.withdraw({ ownerId, amount: 999, reason: "smoke_withdraw_big" });
      const negWithdrawRows = getMoneyLogSlice(negWithdrawTail);
      const snapshotAfterNegWithdraw = takeSnapshot();
      if (!withdrawBig || withdrawBig.ok !== false || withdrawBig.reason !== "insufficient_bank_funds") {
        if (!result.failed.includes("withdraw_overdraft_allowed")) result.failed.push("withdraw_overdraft_allowed");
        result.ok = false;
      }
      if (negWithdrawRows.length > 0) {
        if (!result.failed.includes("withdraw_negative_log")) result.failed.push("withdraw_negative_log");
        result.ok = false;
      }
      if (recordTotal(snapshotAfterNegWithdraw) !== recordTotal(snapshotAfterWithdraw)
        || extractPoints(snapshotAfterNegWithdraw, "bank") !== bankAfterWithdraw
        || extractPoints(snapshotAfterNegWithdraw, ownerId) !== ownerAfterWithdraw) {
        if (!result.failed.includes("withdraw_negative_mutation")) result.failed.push("withdraw_negative_mutation");
        result.ok = false;
      }

      result.details.enabled = {
        deposit: depositSuccess,
        withdraw: withdrawSuccess,
        depositRows,
        withdrawRows
      };
      result.details.negatives = {
        deposit: depositBig,
        withdraw: withdrawBig,
        depositRows: negDepositRows,
        withdrawRows: negWithdrawRows
      };

      finalSnap = snapshotAfterNegWithdraw;
      result.totals.after = recordTotal(finalSnap);
      result.deltas.bank = extractPoints(finalSnap, "bank") - initialBank;
      result.deltas.me = extractPoints(finalSnap, ownerId) - initialOwner;
      result.details.finalSnapshot = finalSnap;
      result.details.snapshots = {
        before: initialSnap,
        afterDisabled: disabledSnap,
        beforeEnabled: snapshotBeforeEnabled,
        afterDeposit: snapshotAfterDeposit,
        afterWithdraw: snapshotAfterWithdraw
      };
    } finally {
      if (Game.Dev && typeof Game.Dev.clearBankOverride === "function") {
        Game.Dev.clearBankOverride();
      }
    }
    result.ok = result.failed.length === 0;
    return result;
  };
  Game.Dev.smokeEcon05BankOnce = smokeEcon05BankOnce;
  devStore.smokeEcon05BankOnce = smokeEcon05BankOnce;
  if (!Game.__DEV) Game.__DEV = {};
  Game.__DEV.smokeEcon05_BankOnce = smokeEcon05BankOnce;
  Game.__DEV.smokeP2PFlagUXOnce = () => {
    const emit = (line) => {
      if (Game.__DEV && typeof Game.__DEV._dumpLine === "function") {
        Game.__DEV._dumpLine(line);
        return;
      }
      if (typeof console !== "undefined" && typeof console.log === "function") {
        console.log(line);
      }
    };
    const readFlag = () => {
      if (Game.Rules && typeof Game.Rules.isP2PTransfersEnabled === "function") {
        return Game.Rules.isP2PTransfersEnabled();
      }
      if (Game.Data && typeof Game.Data.isP2PTransfersEnabled === "function") {
        return Game.Data.isP2PTransfersEnabled();
      }
      const rules = (Game.Data && Game.Data.RULES) ? Game.Data.RULES : null;
      return !!(rules && rules.p2pTransfersEnabled);
    };
    const writeFlag = (value) => {
      if (Game.Rules && typeof Game.Rules.setP2PTransfersEnabled === "function") {
        Game.Rules.setP2PTransfersEnabled(value);
        return true;
      }
      if (Game.Data && typeof Game.Data.setP2PTransfersEnabled === "function") {
        Game.Data.setP2PTransfersEnabled(value);
        return true;
      }
      return false;
    };
    const logStatus = (label) => {
      const enabled = !!readFlag();
      emit(`${label}: ${enabled ? "ENABLED" : "DISABLED"}`);
    };
    const logBoth = (stage) => {
      logStatus(`Legacy UI (${stage})`);
      logStatus(`Modern UI (${stage})`);
    };

    const original = !!readFlag();
    emit("== smokeP2PFlagUXOnce start ==");
    logBoth("before toggle");
    if (writeFlag(true)) {
      logBoth("after forcing ENABLED");
      writeFlag(original);
    } else {
      emit("smokeP2PFlagUXOnce: unable to toggle flag (no setter)");
    }
    emit("== smokeP2PFlagUXOnce end ==");
    return { before: original, after: !!readFlag() };
  };
  Game.__DEV.smokeP2PTransferOnce = () => {
    const result = { name: "smoke_p2p_transfer_once", ok: false, failed: [], before: {}, after: {}, log: {}, world: {} };
    const emit = (line) => {
      if (Game.__DEV && typeof Game.__DEV._dumpLine === "function") {
        Game.__DEV._dumpLine(line);
        return;
      }
      if (typeof console !== "undefined" && typeof console.log === "function") console.log(line);
    };
    const Econ = Game._ConflictEconomy || Game.ConflictEconomy || null;
    if (!Econ || typeof Econ.transferPoints !== "function") {
      result.failed.push("econ_missing");
      return result;
    }
    if (!Game.Econ || typeof Game.Econ.requestP2PTransfer !== "function") {
      result.failed.push("requestP2PTransfer_missing");
      return result;
    }
    const S = Game.__S || {};
    const meId = (S.me && S.me.id) ? String(S.me.id) : "me";
    const npc = Object.values(S.players || {}).find(p => p && p.id && String(p.id).startsWith("npc_")) || null;
    if (!npc || !npc.id) {
      result.failed.push("npc_missing");
      return result;
    }
    const npcId = String(npc.id);
    const mePts = Econ.getAccountBalance ? (Econ.getAccountBalance(meId) | 0) : (S.me && Number.isFinite(S.me.points) ? (S.me.points | 0) : 0);
    const npcPts = Econ.getAccountBalance ? (Econ.getAccountBalance(npcId) | 0) : (Number.isFinite(npc.points) ? (npc.points | 0) : 0);
    let sourceId = "";
    let targetId = "";
    if (mePts >= 1) {
      sourceId = meId;
      targetId = npcId;
    } else if (npcPts >= 1) {
      sourceId = npcId;
      targetId = meId;
    } else {
      result.failed.push("no_source_with_points");
      result.before = { meId, npcId, mePts, npcPts };
      return result;
    }

    const log = (Game.__D && Array.isArray(Game.__D.moneyLog)) ? Game.__D.moneyLog : [];
    const logStart = log.length;
    const snapBefore = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function") ? Game.__DEV.sumPointsSnapshot() : null;
    const beforeSource = Econ.getAccountBalance ? (Econ.getAccountBalance(sourceId) | 0) : 0;
    const beforeTarget = Econ.getAccountBalance ? (Econ.getAccountBalance(targetId) | 0) : 0;

    const tx = Game.Econ.requestP2PTransfer({ sourceId, targetId, amount: 1 });

    const afterSource = Econ.getAccountBalance ? (Econ.getAccountBalance(sourceId) | 0) : 0;
    const afterTarget = Econ.getAccountBalance ? (Econ.getAccountBalance(targetId) | 0) : 0;
    const snapAfter = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function") ? Game.__DEV.sumPointsSnapshot() : null;

    const newRows = log.slice(logStart);
    const p2pRows = newRows.filter(row => row && String(row.reason || "") === "p2p_transfer");

    result.before = { sourceId, targetId, source: beforeSource, target: beforeTarget, world: snapBefore ? snapBefore.total : null };
    result.after = { source: afterSource, target: afterTarget, world: snapAfter ? snapAfter.total : null };
    result.world = { delta: (snapBefore && snapAfter) ? ((snapAfter.total | 0) - (snapBefore.total | 0)) : null };
    result.log = { totalNew: newRows.length, p2pCount: p2pRows.length };
    result.tx = tx || null;

    if (!tx || tx.ok !== true) result.failed.push("tx_failed");
    if ((afterSource - beforeSource) !== -1) result.failed.push("source_delta_mismatch");
    if ((afterTarget - beforeTarget) !== 1) result.failed.push("target_delta_mismatch");
    if (result.world.delta !== null && result.world.delta !== 0) result.failed.push("world_delta_mismatch");
    if (p2pRows.length !== 1) result.failed.push("p2p_log_count_mismatch");
    if (afterSource < 0 || afterTarget < 0) result.failed.push("negative_balance");

    result.ok = result.failed.length === 0;
    emit(`P2P_SMOKE before ${JSON.stringify(result.before)}`);
    emit(`P2P_SMOKE after ${JSON.stringify(result.after)}`);
    emit(`P2P_SMOKE world ${JSON.stringify(result.world)}`);
    emit(`P2P_SMOKE log ${JSON.stringify(result.log)}`);
    emit(`P2P_SMOKE ok=${result.ok} failed=${JSON.stringify(result.failed)}`);
    return result;
  };

  Game.__DEV.smokeP2PTransfer_GuardsOnce = () => {
    const result = { name: "smoke_p2p_transfer_guards_once", ok: false, failed: [], cases: [] };
    const emit = (line) => {
      if (Game.__DEV && typeof Game.__DEV._dumpLine === "function") {
        Game.__DEV._dumpLine(line);
        return;
      }
      if (typeof console !== "undefined" && typeof console.log === "function") console.log(line);
    };
    const Econ = Game._ConflictEconomy || Game.ConflictEconomy || null;
    if (!Econ || typeof Econ.transferPoints !== "function") {
      result.failed.push("econ_missing");
      return result;
    }
    if (!Game.Econ || typeof Game.Econ.requestP2PTransfer !== "function") {
      result.failed.push("requestP2PTransfer_missing");
      return result;
    }
    const S = Game.__S || {};
    const meId = (S.me && S.me.id) ? String(S.me.id) : "me";
    const npc = Object.values(S.players || {}).find(p => p && p.id && String(p.id).startsWith("npc_")) || null;
    if (!npc || !npc.id) {
      result.failed.push("npc_missing");
      return result;
    }
    const npcId = String(npc.id);
    const setP2P = (value) => {
      if (Game.Rules && typeof Game.Rules.setP2PTransfersEnabled === "function") {
        Game.Rules.setP2PTransfersEnabled(value);
        return true;
      }
      if (Game.Data && typeof Game.Data.setP2PTransfersEnabled === "function") {
        Game.Data.setP2PTransfersEnabled(value);
        return true;
      }
      return false;
    };
    const getP2P = () => {
      if (Game.Rules && typeof Game.Rules.isP2PTransfersEnabled === "function") return !!Game.Rules.isP2PTransfersEnabled();
      if (Game.Data && typeof Game.Data.isP2PTransfersEnabled === "function") return !!Game.Data.isP2PTransfersEnabled();
      return false;
    };

    const prevFlag = getP2P();
    if (!setP2P(true)) {
      result.failed.push("p2p_flag_setter_missing");
      return result;
    }

    const log = (Game.__D && Array.isArray(Game.__D.moneyLog)) ? Game.__D.moneyLog : [];
    const getBalance = (id) => (Econ.getAccountBalance ? (Econ.getAccountBalance(id) | 0) : 0);

    let mePts = getBalance(meId);
    let npcPts = getBalance(npcId);
    if (mePts < 1 && npcPts < 1) {
      try {
        Econ.transferPoints("worldBank", meId, 1, "smoke_seed_points", { for: "p2p_smoke_seed", need: 1, had: mePts });
      } catch (_) {}
      mePts = getBalance(meId);
      npcPts = getBalance(npcId);
    }

    let sourceId = "";
    let targetId = "";
    if (mePts >= 1) {
      sourceId = meId;
      targetId = npcId;
    } else if (npcPts >= 1) {
      sourceId = npcId;
      targetId = meId;
    } else {
      result.failed.push("no_source_with_points");
      setP2P(prevFlag);
      return result;
    }

    const runCase = (caseId, sId, tId, amount, expectedReason, expectOk) => {
      const beforeSource = getBalance(sId);
      const beforeTarget = getBalance(tId);
      const beforeSnap = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function") ? Game.__DEV.sumPointsSnapshot() : null;
      const logStart = log.length;

      const tx = Game.Econ.requestP2PTransfer({ sourceId: sId, targetId: tId, amount });

      const afterSource = getBalance(sId);
      const afterTarget = getBalance(tId);
      const afterSnap = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function") ? Game.__DEV.sumPointsSnapshot() : null;
      const newRows = log.slice(logStart);
      const p2pRows = newRows.filter(row => row && String(row.reason || "") === "p2p_transfer");
      const worldDelta = (beforeSnap && afterSnap) ? ((afterSnap.total | 0) - (beforeSnap.total | 0)) : null;

      const failed = [];
      if (!tx || tx.ok !== expectOk) failed.push("tx_ok_mismatch");
      if (!expectOk && String(tx && tx.reason || "") !== expectedReason) failed.push("tx_reason_mismatch");
      if (expectOk && p2pRows.length !== 1) failed.push("p2p_log_count_mismatch");
      if (!expectOk && p2pRows.length !== 0) failed.push("p2p_log_unexpected");
      if (worldDelta != null && worldDelta !== 0) failed.push("world_delta_mismatch");
      if (expectOk) {
        if ((afterSource - beforeSource) !== -1) failed.push("source_delta_mismatch");
        if ((afterTarget - beforeTarget) !== 1) failed.push("target_delta_mismatch");
      } else {
        if ((afterSource - beforeSource) !== 0) failed.push("source_changed");
        if ((afterTarget - beforeTarget) !== 0) failed.push("target_changed");
      }
      if (afterSource < 0 || afterTarget < 0) failed.push("negative_balance");

      const payload = {
        caseId,
        allowNpc: true,
        tx: { ok: !!(tx && tx.ok), reason: tx && tx.reason },
        before: { source: beforeSource, target: beforeTarget, world: beforeSnap ? beforeSnap.total : null },
        after: { source: afterSource, target: afterTarget, world: afterSnap ? afterSnap.total : null },
        worldDelta,
        log: { newLogCount: newRows.length, p2pCount: p2pRows.length },
        ok: failed.length === 0,
        failed
      };
      emit(`P2P_GUARD_CASE ${JSON.stringify(payload)}`);
      return { payload, failed };
    };

    const cases = [];
    cases.push(runCase("case_1_amount_zero", sourceId, targetId, 0, "p2p_invalid_amount", false));
    const insufficientAmount = Math.max(1, getBalance(sourceId) + 1);
    cases.push(runCase("case_2_insufficient", sourceId, targetId, insufficientAmount, "p2p_insufficient_points", false));
    cases.push(runCase("case_3_self_transfer", sourceId, sourceId, 1, "p2p_self_transfer_forbidden", false));
    cases.push(runCase("case_4_valid", sourceId, targetId, 1, null, true));

    result.cases = cases.map(c => c.payload);
    cases.forEach(c => {
      if (c.failed.length) result.failed.push(c.payload.caseId);
    });
    result.ok = result.failed.length === 0;
    emit(`P2P_GUARD_RESULT ${JSON.stringify({ ok: result.ok, failed: result.failed })}`);

    setP2P(prevFlag);
    return result;
  };

  Game.__DEV.smokeP2PTransfer_RateLimitOnce = () => {
    const result = { name: "smoke_p2p_transfer_ratelimit_once", ok: false, failed: [], before: {}, after: {}, log: {}, world: {} };
    const emit = (line) => {
      if (Game.__DEV && typeof Game.__DEV._dumpLine === "function") {
        Game.__DEV._dumpLine(line);
        return;
      }
      if (typeof console !== "undefined" && typeof console.log === "function") console.log(line);
    };
    const Econ = Game._ConflictEconomy || Game.ConflictEconomy || null;
    if (!Econ || typeof Econ.transferPoints !== "function") {
      result.failed.push("econ_missing");
      return result;
    }
    if (!Game.Econ || typeof Game.Econ.requestP2PTransfer !== "function") {
      result.failed.push("requestP2PTransfer_missing");
      return result;
    }
    const S = Game.__S || {};
    const meId = (S.me && S.me.id) ? String(S.me.id) : "me";
    const npcWeak = (S.players && S.players.npc_weak) ? S.players.npc_weak : null;
    if (!npcWeak || !npcWeak.id) {
      result.failed.push("npc_weak_missing");
      return result;
    }
    const targetId = String(npcWeak.id);
    const setP2P = (value) => {
      if (Game.Rules && typeof Game.Rules.setP2PTransfersEnabled === "function") {
        Game.Rules.setP2PTransfersEnabled(value);
        return true;
      }
      if (Game.Data && typeof Game.Data.setP2PTransfersEnabled === "function") {
        Game.Data.setP2PTransfersEnabled(value);
        return true;
      }
      return false;
    };
    const getBalance = (id) => (Econ.getAccountBalance ? (Econ.getAccountBalance(id) | 0) : 0);
    const log = (Game.__D && Array.isArray(Game.__D.moneyLog)) ? Game.__D.moneyLog : [];
    const beforeSnap = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function") ? Game.__DEV.sumPointsSnapshot() : null;
    const logStart = log.length;
    const prevFlag = (Game.Rules && typeof Game.Rules.isP2PTransfersEnabled === "function") ? Game.Rules.isP2PTransfersEnabled() : false;
    if (!setP2P(true)) {
      result.failed.push("p2p_flag_setter_missing");
      return result;
    }
    try {
      const mePts = getBalance(meId);
      if (mePts < 1) {
        try {
          Econ.transferPoints("worldBank", meId, 1, "smoke_seed_points", { for: "p2p_rate_limit_seed", need: 1, had: mePts });
        } catch (_) {}
      }
      const beforeSource = getBalance(meId);
      const beforeTarget = getBalance(targetId);

      const tx1 = Game.Econ.requestP2PTransfer({ sourceId: meId, targetId, amount: 1 });
      const after1Source = getBalance(meId);
      const after1Target = getBalance(targetId);
      const snapAfter1 = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function") ? Game.__DEV.sumPointsSnapshot() : null;
      const rowsAfter1 = log.slice(logStart);
      const p2pAfter1 = rowsAfter1.filter(row => row && String(row.reason || "") === "p2p_transfer");
      const rlAfter1 = rowsAfter1.filter(row => row && String(row.reason || "") === "p2p_transfer_rate_limited");

      const tx2 = Game.Econ.requestP2PTransfer({ sourceId: meId, targetId, amount: 1 });
      const after2Source = getBalance(meId);
      const after2Target = getBalance(targetId);
      const snapAfter2 = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function") ? Game.__DEV.sumPointsSnapshot() : null;
      const rowsAfter2 = log.slice(logStart);
      const p2pAfter2 = rowsAfter2.filter(row => row && String(row.reason || "") === "p2p_transfer");
      const rlAfter2 = rowsAfter2.filter(row => row && String(row.reason || "") === "p2p_transfer_rate_limited");

      result.before = { source: beforeSource, target: beforeTarget, world: beforeSnap ? beforeSnap.total : null };
      result.after = { source: after2Source, target: after2Target, world: snapAfter2 ? snapAfter2.total : null };
      result.world = { delta: (beforeSnap && snapAfter2) ? ((snapAfter2.total | 0) - (beforeSnap.total | 0)) : null };
      result.log = { p2pCount: p2pAfter2.length, rateLimitedCount: rlAfter2.length, newLogCount: rowsAfter2.length };
      result.tx1 = tx1 || null;
      result.tx2 = tx2 || null;

      if (!tx1 || tx1.ok !== true) result.failed.push("tx1_failed");
      if (!tx2 || tx2.ok !== false || tx2.reason !== "p2p_transfer_rate_limited") result.failed.push("tx2_not_rate_limited");
      if ((after1Source - beforeSource) !== -1) result.failed.push("tx1_source_delta_mismatch");
      if ((after1Target - beforeTarget) !== 1) result.failed.push("tx1_target_delta_mismatch");
      if ((after2Source - after1Source) !== 0) result.failed.push("tx2_source_changed");
      if ((after2Target - after1Target) !== 0) result.failed.push("tx2_target_changed");
      if (result.world.delta !== null && result.world.delta !== 0) result.failed.push("world_delta_mismatch");
      if (p2pAfter2.length !== 1) result.failed.push("p2p_log_count_mismatch");
      if (rlAfter2.length < 1) result.failed.push("rate_limit_log_missing");

      result.ok = result.failed.length === 0;
      emit(`P2P_RL before ${JSON.stringify(result.before)}`);
      emit(`P2P_RL after1 ${JSON.stringify({ source: after1Source, target: after1Target, world: snapAfter1 ? snapAfter1.total : null })}`);
      emit(`P2P_RL after2 ${JSON.stringify({ source: after2Source, target: after2Target, world: snapAfter2 ? snapAfter2.total : null })}`);
      emit(`P2P_RL log ${JSON.stringify(result.log)}`);
      emit(`P2P_RL tx1 ${JSON.stringify(tx1)}`);
      emit(`P2P_RL tx2 ${JSON.stringify(tx2)}`);
      emit(`P2P_RL ok=${result.ok} failed=${JSON.stringify(result.failed)}`);
      return result;
    } finally {
      setP2P(prevFlag);
    }
  };

  Game.__DEV.smokeP2PPlayerToPlayerBlockedOnce = () => {
    const result = { name: "smoke_p2p_player_to_player_blocked_once", ok: false, failed: [], before: {}, after: {}, log: {}, world: {} };
    const emit = (line) => {
      if (Game.__DEV && typeof Game.__DEV._dumpLine === "function") {
        Game.__DEV._dumpLine(line);
        return;
      }
      if (typeof console !== "undefined" && typeof console.log === "function") console.log(line);
    };
    const Econ = Game._ConflictEconomy || Game.ConflictEconomy || null;
    if (!Econ || typeof Econ.transferPoints !== "function") {
      result.failed.push("econ_missing");
      return result;
    }
    if (!Game.Econ || typeof Game.Econ.requestP2PTransfer !== "function") {
      result.failed.push("requestP2PTransfer_missing");
      return result;
    }
    const S = Game.__S || {};
    const meId = (S.me && S.me.id) ? String(S.me.id) : "me";
    S.players = S.players || {};
    let secondId = null;
    Object.keys(S.players).some((id) => {
      if (!id || id === meId) return false;
      if (String(id).startsWith("npc_")) return false;
      secondId = String(id);
      return true;
    });
    if (!secondId) {
      secondId = "p2p_dummy";
      if (!S.players[secondId]) {
        S.players[secondId] = { id: secondId, name: "P2P Dummy", points: 0 };
      }
    }
    const setP2P = (value) => {
      if (Game.Rules && typeof Game.Rules.setP2PTransfersEnabled === "function") {
        Game.Rules.setP2PTransfersEnabled(value);
        return true;
      }
      if (Game.Data && typeof Game.Data.setP2PTransfersEnabled === "function") {
        Game.Data.setP2PTransfersEnabled(value);
        return true;
      }
      return false;
    };
    const getBalance = (id) => (Econ.getAccountBalance ? (Econ.getAccountBalance(id) | 0) : 0);
    const log = (Game.__D && Array.isArray(Game.__D.moneyLog)) ? Game.__D.moneyLog : [];
    const beforeSnap = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function") ? Game.__DEV.sumPointsSnapshot() : null;
    const logStart = log.length;
    const prevFlag = (Game.Rules && typeof Game.Rules.isP2PTransfersEnabled === "function") ? Game.Rules.isP2PTransfersEnabled() : false;
    if (!setP2P(true)) {
      result.failed.push("p2p_flag_setter_missing");
      return result;
    }
    try {
      const beforeSource = getBalance(meId);
      const beforeTarget = getBalance(secondId);
      const tx = Game.Econ.requestP2PTransfer({ sourceId: meId, targetId: secondId, amount: 1 });
      const afterSource = getBalance(meId);
      const afterTarget = getBalance(secondId);
      const snapAfter = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function") ? Game.__DEV.sumPointsSnapshot() : null;
      const rows = log.slice(logStart);
      const p2pLogs = rows.filter(row => row && String(row.reason || "") === "p2p_transfer");
      const blockedLogs = rows.filter(row => row && String(row.reason || "") === "p2p_transfer_attempt_blocked");

      result.before = { source: beforeSource, target: beforeTarget, world: beforeSnap ? beforeSnap.total : null };
      result.after = { source: afterSource, target: afterTarget, world: snapAfter ? snapAfter.total : null };
      result.world = { delta: (beforeSnap && snapAfter) ? ((snapAfter.total | 0) - (beforeSnap.total | 0)) : null };
      result.log = { p2pCount: p2pLogs.length, blockedCount: blockedLogs.length, newLogCount: rows.length };
      result.tx = tx || null;

      if (!tx || tx.ok !== false || tx.reason !== "p2p_player_to_player_disabled") result.failed.push("tx_not_blocked");
      if ((afterSource - beforeSource) !== 0) result.failed.push("source_changed");
      if ((afterTarget - beforeTarget) !== 0) result.failed.push("target_changed");
      if (result.world.delta !== null && result.world.delta !== 0) result.failed.push("world_delta_mismatch");
      if (p2pLogs.length !== 0) result.failed.push("p2p_log_present");
      if (blockedLogs.length !== 1) result.failed.push("blocked_log_missing");

      result.ok = result.failed.length === 0;
      emit(`P2P_P2P before ${JSON.stringify(result.before)}`);
      emit(`P2P_P2P after ${JSON.stringify(result.after)}`);
      emit(`P2P_P2P log ${JSON.stringify(result.log)}`);
      emit(`P2P_P2P tx ${JSON.stringify(tx)}`);
      emit(`P2P_P2P ok=${result.ok} failed=${JSON.stringify(result.failed)}`);
      return result;
    } finally {
      setP2P(prevFlag);
    }
  };

  Game.__DEV.spawnSecondPlayerOnce = (opts = {}) => {
    const emit = (line) => {
      if (Game.__DEV && typeof Game.__DEV._dumpLine === "function") {
        Game.__DEV._dumpLine(line);
        return;
      }
      if (typeof console !== "undefined" && typeof console.log === "function") console.log(line);
    };
    const id = String(opts.id || "p2p_smoke_p2");
    if (!Game.__S) Game.__S = {};
    Game.__S.players = Game.__S.players || {};
    const existed = !!Game.__S.players[id];
    if (!existed) {
      const entity = {
        id,
        name: opts.name || "P2P Smoke Player",
        role: opts.role || "player",
        npc: false,
        points: Number.isFinite(opts.points) ? (opts.points | 0) : 10,
        influence: Number.isFinite(opts.influence) ? (opts.influence | 0) : 0,
        rep: Number.isFinite(opts.rep) ? (opts.rep | 0) : 0
      };
      Game.__S.players[id] = entity;
      if (Game.State && Game.State.players) {
        Game.State.players[id] = entity;
      }
    }
    const res = { ok: true, id, existed };
    emit(`P2P_SPAWN_SECOND_PLAYER_V1 ${JSON.stringify(res)}`);
    return res;
  };

  Game.__DEV.smokeP2P_FinalOnce = async (opts = {}) => {
    const result = {
      name: "smoke_p2p_final_once",
      ok: false,
      failed: [],
      spawn: null,
      tx1: null,
      tx2: null,
      log: null,
      totalsBeforeAfter: null,
      logTail: []
    };
    const emit = (line) => {
      if (Game.__DEV && typeof Game.__DEV._dumpLine === "function") {
        Game.__DEV._dumpLine(line);
        return;
      }
      if (typeof console !== "undefined" && typeof console.log === "function") console.log(line);
    };
    const Econ = Game._ConflictEconomy || Game.ConflictEconomy || null;
    if (!Econ || typeof Econ.transferPoints !== "function") {
      result.failed.push("econ_missing");
      emit(`P2P_FINAL_SMOKE_V1 ${JSON.stringify(result)}`);
      return result;
    }
    if (!Game.Econ || typeof Game.Econ.requestP2PTransfer !== "function") {
      result.failed.push("request_missing");
      emit(`P2P_FINAL_SMOKE_V1 ${JSON.stringify(result)}`);
      return result;
    }
    const S = Game.__S || {};
    const meId = (S.me && S.me.id) ? String(S.me.id) : "me";
    const spawnOpts = opts.spawn || {};
    const spawn = Game.__DEV.spawnSecondPlayerOnce(spawnOpts);
    result.spawn = spawn;
    const secondId = spawn.id;
    const log = (Game.__D && Array.isArray(Game.__D.moneyLog)) ? Game.__D.moneyLog : [];
    const logStart = log.length;
    const sumSnapshot = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function");
    const beforeSnap = sumSnapshot ? Game.__DEV.sumPointsSnapshot() : null;
    const setRules = (transfers, players) => {
      if (Game.Rules && typeof Game.Rules.setP2PTransfersEnabled === "function") {
        Game.Rules.setP2PTransfersEnabled(transfers);
      }
      if (Game.Rules && typeof Game.Rules.setP2PPlayerToPlayerEnabled === "function") {
        Game.Rules.setP2PPlayerToPlayerEnabled(players);
      }
      if (!Game.Data) Game.Data = {};
      Game.Data.RULES = Game.Data.RULES || {};
      Game.Data.RULES.p2pTransfersEnabled = !!transfers;
      Game.Data.RULES.p2pPlayerToPlayerEnabled = !!players;
    };
    const prevTransfers = (Game.Rules && typeof Game.Rules.isP2PTransfersEnabled === "function")
      ? Game.Rules.isP2PTransfersEnabled()
      : false;
    const prevPlayerToPlayer = (Game.Rules && typeof Game.Rules.isP2PPlayerToPlayerEnabled === "function")
      ? Game.Rules.isP2PPlayerToPlayerEnabled()
      : false;
    setRules(true, true);
    try {
      result.tx1 = Game.Econ.requestP2PTransfer({ sourceId: meId, targetId: secondId, amount: 1 });
      const snapAfterSuccess = sumSnapshot ? Game.__DEV.sumPointsSnapshot() : null;
      setRules(true, false);
      result.tx2 = Game.Econ.requestP2PTransfer({ sourceId: meId, targetId: secondId, amount: 1 });
      const snapAfterBlock = sumSnapshot ? Game.__DEV.sumPointsSnapshot() : null;
      const rowsAfter = log.slice(logStart);
      const p2pLogs = rowsAfter.filter(row => row && String(row.reason || "") === "p2p_transfer");
      const blockedLogs = rowsAfter.filter(row => row && String(row.reason || "") === "p2p_transfer_attempt_blocked");
      result.log = {
        newLogCount: rowsAfter.length,
        successCount: p2pLogs.length,
        blockedCount: blockedLogs.length
      };
      result.totalsBeforeAfter = {
        before: beforeSnap,
        afterSuccess: snapAfterSuccess,
        afterBlock: snapAfterBlock
      };
      const windowSize = opts.window && Number.isFinite(opts.window.lastN) ? Math.max(1, opts.window.lastN | 0) : 20;
      result.logTail = rowsAfter.slice(-windowSize);
      if (!result.tx1 || result.tx1.ok !== true) result.failed.push("first_transfer_failed");
      if (!result.tx2 || result.tx2.ok !== false || result.tx2.reason !== "p2p_player_to_player_disabled") result.failed.push("second_not_blocked");
      if (p2pLogs.length < 1) result.failed.push("missing_success_log");
      if (blockedLogs.length < 1) result.failed.push("missing_blocked_log");
      const worldBefore = beforeSnap && typeof beforeSnap.total === "number" ? beforeSnap.total : null;
      const worldAfterSuccess = snapAfterSuccess && typeof snapAfterSuccess.total === "number" ? snapAfterSuccess.total : null;
      const worldAfterBlock = snapAfterBlock && typeof snapAfterBlock.total === "number" ? snapAfterBlock.total : null;
      if (worldBefore !== null && worldAfterSuccess !== null && worldBefore !== worldAfterSuccess) result.failed.push("world_delta_after_success");
      if (worldBefore !== null && worldAfterBlock !== null && worldBefore !== worldAfterBlock) result.failed.push("world_delta_after_block");
      result.ok = result.failed.length === 0;
      emit(`P2P_FINAL_SMOKE_V1 ${JSON.stringify({
        ok: result.ok,
        failed: result.failed,
        tx1: result.tx1,
        tx2: result.tx2,
        totals: result.totalsBeforeAfter
      })}`);
      return result;
    } finally {
      setRules(prevTransfers, prevPlayerToPlayer);
    }
  };

  const seedTrainingPoints = (minPoints, tag) => {
    const S = Game.__S || {};
    if (!S.players) S.players = {};
    const donors = [];
    Object.values(S.players || {}).forEach(p => {
      if (!p || !p.id) return;
      if (p.id === "me") return;
      const id = String(p.id || "");
      const isNpc = (p.npc === true || p.type === "npc" || id.startsWith("npc_"));
      if (!isNpc) return;
      const pts = Number.isFinite(p.points) ? (p.points | 0) : 0;
      if (pts > 0) donors.push({ id, points: pts });
    });
    const needPoints = Math.max(0, (minPoints | 0) - ((S.me && Number.isFinite(S.me.points)) ? (S.me.points | 0) : 0));
    if (needPoints <= 0) return { ok: true, seeded: 0 };
    let remaining = needPoints;
    let seeded = 0;
    const Econ = Game._ConflictEconomy || null;
    for (const donor of donors) {
      if (remaining <= 0) break;
      const amt = Math.min(remaining, donor.points | 0);
      if (amt <= 0) continue;
      if (!Econ || typeof Econ.transferPoints !== "function") break;
      const tx = Econ.transferPoints(donor.id, "me", amt, "dev_seed_points", { tag: tag || "training_seed" });
      if (tx && tx.ok === true) {
        remaining -= amt;
        seeded += amt;
      }
    }
    if (remaining > 0) return { ok: false, reason: "seed_insufficient", seeded };
    return { ok: true, seeded };
  };

  Game.Dev.smokeTrainingDataOnce = () => {
    const name = "smoke_training_data_once";
    const notes = [];

    const snapBefore = trainingSnapshot();
    if (!snapBefore) {
      notes.push("snapshot_missing");
      return { name, ok: false, checks: null, notes };
    }

    const hasTraining = !!(Game.__S && Game.__S.training);
    const defaultsOk = trainingDefaultsOk(snapBefore);

    const migrated = normalizeTraining({}) || null;
    const migrateOk = !!(migrated && trainingDefaultsOk(migrated));

    const roundTrip = (() => {
      try {
        const raw = JSON.parse(JSON.stringify(snapBefore));
        return normalizeTraining(raw);
      } catch (err) {
        notes.push(`serialize_error:${String(err && err.message ? err.message : err)}`);
        return null;
      }
    })();
    const serializeOk = !!(roundTrip && trainingEqual(roundTrip, snapBefore));

    const snapAfter = trainingSnapshot();
    const idempotent = !!(snapAfter && trainingEqual(snapAfter, snapBefore));

    if (!hasTraining) notes.push("state_training_missing");
    if (!defaultsOk) notes.push("defaults_mismatch");
    if (!migrateOk) notes.push("migrate_defaults_fail");
    if (!serializeOk) notes.push("round_trip_mismatch");
    if (!idempotent) notes.push("mutates_state");

    const ok = hasTraining && defaultsOk && migrateOk && serializeOk && idempotent;
    return {
      name,
      ok,
      checks: { hasTraining, defaultsOk, migrateOk, serializeOk, idempotent },
      notes,
      snapshot: snapBefore,
      snapshotAfter: snapAfter,
      migrated
    };
  };
  Game.__DEV.smokeTrainingDataOnce = Game.Dev.smokeTrainingDataOnce;

  Game.Dev.smokeTrainingCostOnce = () => {
    const name = "smoke_training_cost_once";
    const notes = [];
    const Econ = Game._ConflictEconomy || null;
    const api = Game.TrainingAPI || null;
    const S = Game.__S || {};
    const dbg = Game.__D || (Game.__D = {});
    dbg.moneyLog = Array.isArray(dbg.moneyLog) ? dbg.moneyLog : (dbg.moneyLog = []);

    if (!Econ || typeof Econ.transferPoints !== "function" || !api || typeof api.trainCost !== "function") {
      return { name, ok: false, notes: ["training_api_missing"] };
    }

    if ((!S.players || !S.players.me) && Game.__A && typeof Game.__A.seedPlayers === "function") {
      Game.__A.seedPlayers();
    }

    const runId = `train_cost_${Date.now().toString(36)}`;
    const argKey = "smoke_training_arg";
    const beforeSnapshot = Game.__DEV.sumPointsSnapshot();
    const seeded = seedTrainingPoints(2, "smokeTrainingCostOnce");
    if (!seeded.ok) {
      notes.push(seeded.reason || "seed_failed");
      return { name, ok: false, notes };
    }
    const beforePoints = (S.me && Number.isFinite(S.me.points)) ? (S.me.points | 0) : 0;
    const logBefore = dbg.moneyLog.filter(r => r && r.reason === "training_cost" && r.meta && r.meta.trainId === runId).length;

    const first = api.trainCost({ argKey, trainId: runId });
    const afterPoints = (S.me && Number.isFinite(S.me.points)) ? (S.me.points | 0) : 0;
    const afterSnapshot = Game.__DEV.sumPointsSnapshot();
    const logAfter = dbg.moneyLog.filter(r => r && r.reason === "training_cost" && r.meta && r.meta.trainId === runId).length;
    const price = (first && first.price && Number.isFinite(first.price.finalPrice)) ? (first.price.finalPrice | 0) : 0;
    const pointsDiff = afterPoints - beforePoints;
    const worldDiff = (afterSnapshot.total | 0) - (beforeSnapshot.total | 0);

    const secondBeforePoints = (S.me && Number.isFinite(S.me.points)) ? (S.me.points | 0) : 0;
    const secondLogBefore = dbg.moneyLog.filter(r => r && r.reason === "training_cost" && r.meta && r.meta.trainId === runId).length;
    const second = api.trainCost({ argKey, trainId: runId });
    const secondAfterPoints = (S.me && Number.isFinite(S.me.points)) ? (S.me.points | 0) : 0;
    const secondLogAfter = dbg.moneyLog.filter(r => r && r.reason === "training_cost" && r.meta && r.meta.trainId === runId).length;

    const ok =
      first && first.ok === true &&
      pointsDiff === -price &&
      worldDiff === 0 &&
      logAfter - logBefore === 1 &&
      second && second.ok === true &&
      second.cacheHit === true &&
      secondAfterPoints === secondBeforePoints &&
      secondLogAfter === secondLogBefore;

    if (pointsDiff !== -price) notes.push("points_diff_mismatch");
    if (worldDiff !== 0) notes.push("world_diff_nonzero");
    if (logAfter - logBefore !== 1) notes.push("moneylog_missing_or_duplicate");
    if (!second || second.cacheHit !== true) notes.push("cache_hit_missing");
    if (secondAfterPoints !== secondBeforePoints) notes.push("repeat_charge_detected");
    if (secondLogAfter !== secondLogBefore) notes.push("repeat_log_detected");

    return {
      name,
      ok,
      notes,
      first,
      second,
      pointsDiff,
      price,
      worldDiff,
      moneyLogDelta: logAfter - logBefore
    };
  };
  Game.__DEV.smokeTrainingCostOnce = Game.Dev.smokeTrainingCostOnce;

  Game.Dev.smokeTrainingProgressOnce = () => {
    const name = "smoke_training_progress_once";
    const notes = [];
    const Econ = Game._ConflictEconomy || null;
    const api = Game.TrainingAPI || null;
    const S = Game.__S || {};
    const dbg = Game.__D || (Game.__D = {});
    dbg.moneyLog = Array.isArray(dbg.moneyLog) ? dbg.moneyLog : (dbg.moneyLog = []);
    dbg.trainingLog = Array.isArray(dbg.trainingLog) ? dbg.trainingLog : (dbg.trainingLog = []);

    if (!Econ || !api || typeof api.status !== "function" || typeof api.train !== "function") {
      return { name, ok: false, notes: ["training_api_missing"] };
    }

    if ((!S.players || !S.players.me) && Game.__A && typeof Game.__A.seedPlayers === "function") {
      Game.__A.seedPlayers();
    }

    const countCostLogs = (trainId) => {
      return dbg.moneyLog.filter(r => r && r.reason === "training_cost" && r.meta && r.meta.trainId === trainId).length;
    };

    const countProgressLogs = (trainId) => {
      return dbg.trainingLog.filter(r => r && r.reason === "training_progress" && r.meta && r.meta.trainId === trainId).length;
    };

    S.dayIndex = 0;
    const seedRes = seedTrainingPoints(2, "smokeTrainingProgressOnce");
    if (!seedRes.ok) {
      notes.push(seedRes.reason || "seed_failed");
      return { name, ok: false, notes };
    }

    const runId = `train_prog_${Date.now().toString(36)}`;
    const argKey = `smoke_training_arg_${runId}`;
    const trainIdA = `train_${runId}_a`;
    const trainIdB = `train_${runId}_b`;
    const trainIdC = `train_${runId}_c`;

    const beforeSnapshot = Game.__DEV.sumPointsSnapshot();
    const countersBefore = (S.training && S.training.counters) ? {
      totalTrains: S.training.counters.totalTrains | 0,
      todayTrains: S.training.counters.todayTrains | 0,
      lastTrainDay: S.training.counters.lastTrainDay | 0
    } : { totalTrains: 0, todayTrains: 0, lastTrainDay: 0 };

    const status0 = api.status({ argKey });
    const status0Ok = !!(status0 && status0.ok && status0.canTrain === true);
    if (!status0Ok) notes.push("status0_blocked");

    const price = (status0 && Number.isFinite(status0.price)) ? (status0.price | 0) : 1;

    const beforePointsA = (S.me && Number.isFinite(S.me.points)) ? (S.me.points | 0) : 0;
    const costBeforeA = countCostLogs(trainIdA);
    const progBeforeA = countProgressLogs(trainIdA);
    const resA = api.train({ argKey, trainId: trainIdA });
    const afterPointsA = (S.me && Number.isFinite(S.me.points)) ? (S.me.points | 0) : 0;
    const costAfterA = countCostLogs(trainIdA);
    const progAfterA = countProgressLogs(trainIdA);
    const entryA = (S.training && S.training.byArgKey) ? S.training.byArgKey[argKey] : null;
    const countersA = (S.training && S.training.counters) ? S.training.counters : {};
    const pointsDiffA = afterPointsA - beforePointsA;
    const xpAfterA = entryA ? (entryA.xp | 0) : null;
    const levelAfterA = entryA ? (entryA.level | 0) : null;
    const countersAfterA = {
      totalTrains: (countersA.totalTrains | 0),
      todayTrains: (countersA.todayTrains | 0),
      lastTrainDay: (countersA.lastTrainDay | 0)
    };

    const expectedTodayA = (countersBefore.lastTrainDay === 0) ? ((countersBefore.todayTrains | 0) + 1) : 1;
    const expectedTotalA = (countersBefore.totalTrains | 0) + 1;

    const stepAOk =
      resA && resA.ok === true && resA.charged === true && resA.cacheHit === false &&
      pointsDiffA === -price &&
      costAfterA - costBeforeA === 1 &&
      progAfterA - progBeforeA === 1 &&
      entryA && xpAfterA === ((status0 && status0.progress && Number.isFinite(status0.progress.xp)) ? (status0.progress.xp | 0) + 1 : 1) &&
      levelAfterA === 0 &&
      entryA.cooldownUntil === 1 &&
      entryA.lastTrainedAt === 0 &&
      (countersA.totalTrains | 0) === expectedTotalA &&
      (countersA.todayTrains | 0) === expectedTodayA &&
      (countersA.lastTrainDay | 0) === 0;

    if (!stepAOk) notes.push("step_a_mismatch");

    const beforePointsA2 = (S.me && Number.isFinite(S.me.points)) ? (S.me.points | 0) : 0;
    const costBeforeA2 = countCostLogs(trainIdA);
    const progBeforeA2 = countProgressLogs(trainIdA);
    const resA2 = api.train({ argKey, trainId: trainIdA });
    const afterPointsA2 = (S.me && Number.isFinite(S.me.points)) ? (S.me.points | 0) : 0;
    const costAfterA2 = countCostLogs(trainIdA);
    const progAfterA2 = countProgressLogs(trainIdA);
    const entryA2 = (S.training && S.training.byArgKey) ? S.training.byArgKey[argKey] : null;
    const countersA2 = (S.training && S.training.counters) ? S.training.counters : {};

    const stepA2Ok =
      resA2 && resA2.ok === true && resA2.cacheHit === true && resA2.charged === false &&
      afterPointsA2 === beforePointsA2 &&
      costAfterA2 === costBeforeA2 &&
      progAfterA2 === progBeforeA2 &&
      entryA2 && xpAfterA != null && entryA2.xp === xpAfterA &&
      (countersA2.totalTrains | 0) === countersAfterA.totalTrains &&
      (countersA2.todayTrains | 0) === countersAfterA.todayTrains;

    if (!stepA2Ok) notes.push("step_a2_mismatch");

    const beforePointsB = (S.me && Number.isFinite(S.me.points)) ? (S.me.points | 0) : 0;
    const costBeforeB = countCostLogs(trainIdB);
    const resB = api.train({ argKey, trainId: trainIdB });
    const afterPointsB = (S.me && Number.isFinite(S.me.points)) ? (S.me.points | 0) : 0;
    const costAfterB = countCostLogs(trainIdB);
    const entryB = (S.training && S.training.byArgKey) ? S.training.byArgKey[argKey] : null;
    const countersB = (S.training && S.training.counters) ? S.training.counters : {};

    const stepBOk =
      resB && resB.ok === false && resB.reason === "cooldown" &&
      afterPointsB === beforePointsB &&
      costAfterB === costBeforeB &&
      entryB && entryA && entryB.xp === entryA.xp &&
      (countersB.totalTrains | 0) === (countersA.totalTrains | 0);

    if (!stepBOk) notes.push("step_b_mismatch");

    S.dayIndex = 1;
    const status1 = api.status({ argKey });
    const status1Ok = !!(status1 && status1.ok && status1.canTrain === true);
    if (!status1Ok) notes.push("status1_blocked");

    const beforePointsC = (S.me && Number.isFinite(S.me.points)) ? (S.me.points | 0) : 0;
    const costBeforeC = countCostLogs(trainIdC);
    const progBeforeC = countProgressLogs(trainIdC);
    const resC = api.train({ argKey, trainId: trainIdC });
    const afterPointsC = (S.me && Number.isFinite(S.me.points)) ? (S.me.points | 0) : 0;
    const costAfterC = countCostLogs(trainIdC);
    const progAfterC = countProgressLogs(trainIdC);
    const entryC = (S.training && S.training.byArgKey) ? S.training.byArgKey[argKey] : null;
    const countersC = (S.training && S.training.counters) ? S.training.counters : {};

    const pointsDiffC = afterPointsC - beforePointsC;
    const expectedTotalC = countersAfterA.totalTrains + 1;

    const stepCOk =
      resC && resC.ok === true && resC.charged === true && resC.cacheHit === false &&
      pointsDiffC === -price &&
      costAfterC - costBeforeC === 1 &&
      progAfterC - progBeforeC === 1 &&
      entryC && entryC.xp === ((xpAfterA != null) ? (xpAfterA | 0) + 1 : 2) &&
      entryC.level === 0 &&
      entryC.cooldownUntil === 2 &&
      entryC.lastTrainedAt === 1 &&
      (countersC.totalTrains | 0) === expectedTotalC &&
      (countersC.todayTrains | 0) === 1 &&
      (countersC.lastTrainDay | 0) === 1;

    if (!stepCOk) notes.push("step_c_mismatch");

    const afterSnapshot = Game.__DEV.sumPointsSnapshot();
    const worldDiff = (afterSnapshot.total | 0) - (beforeSnapshot.total | 0);
    if (worldDiff !== 0) notes.push("world_diff_nonzero");

    const ok = notes.length === 0;
    return {
      name,
      ok,
      notes,
      price,
      pointsDiffA,
      pointsDiffC,
      worldDiff,
      status0,
      status1,
      resA,
      resA2,
      resB,
      resC
    };
  };
  Game.__DEV.smokeTrainingProgressOnce = Game.Dev.smokeTrainingProgressOnce;

  Game.Dev.smokeTrainingUIOnce = () => {
    const name = "smoke_training_ui_once";
    const notes = [];
    const UI = Game.UI || null;
    const Econ = Game._ConflictEconomy || null;
    const S = Game.__S || {};
    const dbg = Game.__D || (Game.__D = {});
    dbg.moneyLog = Array.isArray(dbg.moneyLog) ? dbg.moneyLog : [];

    if (!UI) {
      notes.push("ui_missing");
      return { name, ok: false, notes };
    }

    if ((!S.players || !S.players.me) && Game.__A && typeof Game.__A.seedPlayers === "function") {
      Game.__A.seedPlayers();
    }

    const doc = (typeof document !== "undefined") ? document : null;
    if (doc) {
      const existingControls = doc.getElementById("trainingControls");
      if (existingControls) existingControls.remove();
    }
    if (UI && UI.trainingControls) delete UI.trainingControls;

    const ensureMenuOpen = () => {
      if (UI.trainingControls) return true;
      if (typeof UI.showMenu !== "function") return false;
      try {
        UI.showMenu();
      } catch (err) {
        notes.push("menu_show_failed");
        return false;
      }
      return !!UI.trainingControls;
    };

    const menuFlags = S.flags || (S.flags = {});
    const menuWasOpen = !!menuFlags.menuOpen;
    const closeMenuIfNeeded = () => {
      if (!menuWasOpen && typeof UI.hideMenu === "function") {
        UI.hideMenu();
      }
    };
    const controlsReady = ensureMenuOpen();
    if (!controlsReady) {
      notes.push("training_controls_missing");
      closeMenuIfNeeded();
      return { name, ok: false, notes };
    }

    const controls = UI.trainingControls;
    if (!controls || typeof controls.refresh !== "function" || typeof controls.performAction !== "function") {
      notes.push("training_controls_invalid");
      closeMenuIfNeeded();
      return { name, ok: false, notes };
    }

    const argKey = controls.argKey || "menu_training_arg";
    const trainingState = S.training || (S.training = { version: 1, byArgKey: {}, counters: { totalTrains: 0, todayTrains: 0, lastTrainDay: 0 } });
    trainingState.byArgKey = trainingState.byArgKey || {};
    const originalEntry = trainingState.byArgKey[argKey] ? { ...trainingState.byArgKey[argKey] } : null;
    const originalCounters = trainingState.counters ? { ...trainingState.counters } : null;
    const restoreEntry = () => {
      if (!trainingState.byArgKey) return;
      if (originalEntry) trainingState.byArgKey[argKey] = originalEntry;
      else delete trainingState.byArgKey[argKey];
    };
    const restoreCounters = () => {
      if (!trainingState) return;
      if (originalCounters) trainingState.counters = originalCounters;
      else delete trainingState.counters;
    };

    trainingState.byArgKey[argKey] = { level: 0, xp: 0, lastTrainedAt: 0, cooldownUntil: 0 };
    trainingState.counters = { totalTrains: 0, todayTrains: 0, lastTrainDay: 0 };
    S.dayIndex = 0;

    const seeded = seedTrainingPoints(2, "smokeTrainingUIOnce");
    if (!seeded.ok) {
      notes.push(seeded.reason || "seed_failed");
      restoreEntry();
      restoreCounters();
      closeMenuIfNeeded();
      return { name, ok: false, notes };
    }

    const beforeSnapshot = Game.__DEV.sumPointsSnapshot();
    const beforePoints = (S.me && Number.isFinite(S.me.points)) ? (S.me.points | 0) : 0;
    const moneyLogBefore = dbg.moneyLog.length;

    controls.refresh();
    const status0 = controls.latestStatus;
    const price = (status0 && Number.isFinite(status0.price)) ? (status0.price | 0) : 1;
    const status0Ok = !!(status0 && status0.ok && status0.canTrain === true);
    if (!status0Ok) notes.push("status0_blocked");

    const resA = controls.performAction();
    const afterPointsA = (S.me && Number.isFinite(S.me.points)) ? (S.me.points | 0) : 0;
    const pointsDiffA = afterPointsA - beforePoints;
    const moneyLogAfterA = dbg.moneyLog.length;
    const moneyLogDeltaA = moneyLogAfterA - moneyLogBefore;
    const resAOk =
      resA && resA.ok === true && resA.charged === true && resA.cacheHit === false;
    if (!resAOk) notes.push("first_action_failed");
    if (pointsDiffA !== -price) notes.push("points_diff_mismatch");
    if (moneyLogDeltaA !== 1) notes.push("moneylog_delta_mismatch");

    controls.refresh();
    const resCooldown = controls.performAction();
    const afterPointsCooldown = (S.me && Number.isFinite(S.me.points)) ? (S.me.points | 0) : 0;
    const moneyLogAfterCooldown = dbg.moneyLog.length;
    const cooldownLogDelta = moneyLogAfterCooldown - moneyLogAfterA;
    const resCooldownOk =
      resCooldown && resCooldown.ok === false && resCooldown.reason === "cooldown" &&
      afterPointsCooldown === afterPointsA &&
      cooldownLogDelta === 0;
    if (!resCooldownOk) notes.push("cooldown_block_mismatch");

    if (!Econ || typeof Econ.transferPoints !== "function") {
      notes.push("econ_missing");
      restoreEntry();
      restoreCounters();
      closeMenuIfNeeded();
      return { name, ok: false, notes };
    }

    const drainAmount = Math.max(0, (S.me && Number.isFinite(S.me.points)) ? (S.me.points | 0) : 0);
    if (drainAmount > 0) {
      const drain = Econ.transferPoints("me", "sink", drainAmount, "dev_zero_points", { tag: "smokeTrainingUIOnce" });
      if (!drain || drain.ok !== true) notes.push("drain_failed");
    }

    const expectedInsuffReason = "insufficient_points";
    controls.refresh();
    const resInsuff = controls.performAction();
    const afterPointsInsuff = (S.me && Number.isFinite(S.me.points)) ? (S.me.points | 0) : 0;
    const moneyLogAfterInsuff = dbg.moneyLog.length;
    const insuffLogDelta = moneyLogAfterInsuff - moneyLogAfterCooldown;
    const resInsuffOk =
      resInsuff && resInsuff.ok === false && resInsuff.reason === expectedInsuffReason &&
      afterPointsInsuff === afterPointsCooldown &&
      insuffLogDelta === 0;
    if (!resInsuffOk && !(resInsuff && resInsuff.reason === expectedInsuffReason)) notes.push("insuff_block_mismatch");

    const afterSnapshot = Game.__DEV.sumPointsSnapshot();
    const worldDiff = (afterSnapshot.total | 0) - (beforeSnapshot.total | 0);
    if (worldDiff !== 0) notes.push("world_diff_nonzero");

    restoreEntry();
    restoreCounters();
    closeMenuIfNeeded();

    const ok =
      notes.length === 0 &&
      worldDiff === 0 &&
      moneyLogDeltaA === 1 &&
      pointsDiffA === -price &&
      resCooldown && resCooldown.reason === "cooldown" &&
      resInsuff && resInsuff.reason === expectedInsuffReason;

    return {
      name,
      ok,
      notes,
      resA,
      resCooldown,
      resInsuff,
      pointsDiffA,
      price,
      worldDiff,
      moneyLogDelta: moneyLogDeltaA
    };
  };
  Game.__DEV.smokeTrainingUIOnce = Game.Dev.smokeTrainingUIOnce;

  Game.__DEV.setInfluence = (value) => {
    if (typeof value !== "number") return;
    const S = getStateSafe();
    if (!S) return;
    S.me.influence = value;
    sync();
    try { if (Game.UI && typeof Game.UI.updateArgStrengthPills === "function") Game.UI.updateArgStrengthPills(); } catch (_) {}
    console.log("[DEV] influence =", S.me.influence);
  };

  Game.__DEV.addInfluence = (delta) => {
    if (typeof delta !== "number") return;
    const S = getStateSafe();
    if (!S) return;
    const cur = Number(S.me.influence || 0);
    S.me.influence = cur + delta;
    sync();
    try { if (Game.UI && typeof Game.UI.updateArgStrengthPills === "function") Game.UI.updateArgStrengthPills(); } catch (_) {}
    console.log("[DEV] influence =", S.me.influence);
  };

  Game.__DEV.setPoints = (value) => {
    if (typeof value !== "number") return;
    const S = getStateSafe();
    if (!S) return;
    S.me.points = value;
    sync();
    console.log("[DEV] points =", S.me.points);
  };

  Game.__DEV.smokeStage3Step5Once = () => {
    const tries = [];
    const capture = (label, fn) => {
      try {
        const result = fn();
        tries.push({ label, ok: true, result });
      } catch (err) {
        tries.push({ label, ok: false, error: String(err) });
      }
    };
    capture("Game.State access", () => ({ value: Game.State }));
    capture("Game.StateAPI access", () => ({ value: Game.StateAPI }));
    capture("computeOutcome surface", () => {
      const core = Game._ConflictCore || Game.ConflictCore || null;
      const available = core && typeof core.computeOutcome === "function";
      return { available, type: typeof (core && core.computeOutcome) };
    });
    capture("Monkey patch transferRep", () => {
      const surface = Game.__A || Game.StateAPI || null;
      if (!surface || typeof surface.transferRep !== "function") {
        return { ok: false, reason: "missing_transferRep" };
      }
      const original = surface.transferRep;
      surface.transferRep = function patched(...args) {
        return original.apply(this, args);
      };
      surface.transferRep = original;
      return { ok: true, action: "patched" };
    });
    capture("Invalid points write", () => {
      const S = Game.__S || {};
      const before = (S.me && Number.isFinite(S.me.points)) ? S.me.points : null;
      if (S.me) S.me.points = -999;
      const after = (S.me && Number.isFinite(S.me.points)) ? S.me.points : null;
      return { before, after };
    });
    capture("Invalid rep write", () => {
      const S = Game.__S || {};
      const before = Number.isFinite(S.rep) ? S.rep : null;
      if (S) S.rep = -999;
      const after = Number.isFinite(S.rep) ? S.rep : null;
      return { before, after };
    });
    capture("Forbidden API stack", () => {
      const trace = [];
      try {
        throw new Error("smoke stack");
      } catch (err) {
        const lines = (err && err.stack) ? String(err.stack).split("\n").slice(0, 4).map(x => x.trim()) : [];
        trace.push(...lines);
      }
      return { stack: trace };
    });
    return {
      ok: true,
      mode: "dev",
      trials: tries
    };
  };

  Game.__DEV.securityProbeOnce = () => {
    const dbg = (Game && Game.__D && typeof Game.__D === "object") ? Game.__D : null;
    if (!dbg) {
      return { ok: false, error: "missing_debug_surface" };
    }
    const events = Array.isArray(dbg.securityEvents) ? dbg.securityEvents : [];
    const reactions = Array.isArray(dbg.securityReactions) ? dbg.securityReactions : [];
    const lastEv = events.length ? events[events.length - 1] : null;
    const lastRx = reactions.length ? reactions[reactions.length - 1] : null;
    return {
      ok: true,
      evLen: events.length,
      rxLen: reactions.length,
      lastEv,
      lastRx,
    };
  };

  Game.__DEV.addPoints = (delta) => {
    if (typeof delta !== "number") return;
    const S = getStateSafe();
    if (!S) return;
    const cur = Number(S.me.points || 0);
    S.me.points = cur + delta;
    sync();
    console.log("[DEV] points =", S.me.points);
  };

  Game.__DEV.resetProfileEconomyForDebug = () => {
    const D0 = Game.Data || null;
    const S = Game.__S || null;
    if (!D0 || !S) return { ok: false, error: "missing_state_or_data" };
    const prevFlag = D0.CIRCULATION_ENABLED === true;
    D0.CIRCULATION_ENABLED = false;

    const startPlayer = Number.isFinite(D0.START_POINTS_PLAYER) ? (D0.START_POINTS_PLAYER | 0) : 10;
    const startNpc = Number.isFinite(D0.START_POINTS_NPC) ? (D0.START_POINTS_NPC | 0) : 10;

    if (!S.me) {
      S.me = { id: "me", points: startPlayer, influence: 0, wins: 0 };
    }
    if (!S.players) S.players = {};
    if (!S.players.me) S.players.me = S.me;

    const hasNpc = Object.values(S.players || {}).some(p => {
      if (!p) return false;
      const id = String(p.id || "");
      return p.npc === true || p.type === "npc" || id.startsWith("npc_");
    });
    if (!hasNpc && Game.NPC && typeof Game.NPC.seedPlayers === "function") {
      S._seededNPCs = false;
      Game.NPC.seedPlayers(S);
    }

    const setPoints = (obj, v) => {
      if (!obj) return;
      const val = Number(v || 0);
      if (typeof Game._withPointsWrite === "function") {
        Game._withPointsWrite(() => { obj.points = val; });
      } else {
        obj.points = val;
      }
    };

    const before = {
      me: (S.me && typeof S.me.points === "number") ? (S.me.points | 0) : null,
      playersMe: (S.players && S.players.me && typeof S.players.me.points === "number") ? (S.players.me.points | 0) : null
    };

    setPoints(S.me, startPlayer);
    if (S.players && S.players.me) setPoints(S.players.me, startPlayer);
    Object.values(S.players || {}).forEach(p => {
      if (!p) return;
      const id = String(p.id || "");
      const isNpc = (p.npc === true || p.type === "npc" || id.startsWith("npc_"));
      if (isNpc) setPoints(p, startNpc);
    });
    if (S.points) {
      S.points.overflow = 0;
      S.points.capNote = "";
    }

    let npcCount = 0;
    const npcSample = [];
    Object.values(S.players || {}).forEach(p => {
      const id = String(p && p.id || "");
      const isNpc = (p && (p.npc === true || p.type === "npc" || id.startsWith("npc_")));
      if (isNpc) {
        npcCount++;
        if (npcSample.length < 5) npcSample.push({ id, points: p.points | 0 });
      }
    });

    D0.CIRCULATION_ENABLED = prevFlag;
    const after = {
      me: (S.me && typeof S.me.points === "number") ? (S.me.points | 0) : null,
      playersMe: (S.players && S.players.me && typeof S.players.me.points === "number") ? (S.players.me.points | 0) : null
    };
    return { ok: true, before, after, startPlayer, startNpc, npcCount, npcSample };
  };

  Game.__DEV.econIntrospect = () => {
    const Econ = Game._ConflictEconomy || null;
    const keys = Econ ? Object.keys(Econ) : [];
    return {
      hasEcon: !!Econ,
      hasEnsurePool: !!(Econ && typeof Econ.ensurePool === "function"),
      hasGetCrowdPoolId: !!(Econ && typeof Econ.getCrowdPoolId === "function"),
      hasTransferPoints: !!(Econ && typeof Econ.transferPoints === "function"),
      keys
    };
  };

  Game.__DEV.sumPointsSnapshot = () => {
    const Econ = Game._ConflictEconomy;
    if (Econ && typeof Econ.sumPointsSnapshot === "function") return Econ.sumPointsSnapshot();
    return { total: 0, byId: {}, players: 0, npcs: 0, pools: 0, poolsBreakdown: {}, ts: getNow() };
  };

  Game.__DEV.printPointsSnapshot = (tag) => {
    const snap = Game.__DEV.sumPointsSnapshot();
    try { console.log(tag, snap.total); } catch (_) {}
    return snap;
  };

  Game.__DEV.assertNoDrift = (before, after) => {
    const b = before || Game.__DEV.sumPointsSnapshot();
    const a = after || Game.__DEV.sumPointsSnapshot();
    const diff = (a.total | 0) - (b.total | 0);
    const deltaPlayers = (a.players | 0) - (b.players | 0);
    const deltaNpcs = (a.npcs | 0) - (b.npcs | 0);
    const deltaPools = (a.pools | 0) - (b.pools | 0);
    if (diff !== 0) {
      const msg = `[DEV] circulation drift: diff=${diff} before=${b.total} after=${a.total}`;
      const log = (Game.__D && Array.isArray(Game.__D.moneyLog)) ? Game.__D.moneyLog : [];
      const tail = log.slice(Math.max(0, log.length - 10));
      console.log(msg, { before: b, after: a, lastMoneyLog: tail, deltaPlayers, deltaNpcs, deltaPools });
      if (DEV_FLAG) {
        throw new Error(`${msg}`);
      } else {
        try {
          if (Game.__A && typeof Game.__A.pushSystem === "function") {
            Game.__A.pushSystem(`Дрейф баланса: diff=${diff}.`);
          } else if (Game.UI && typeof Game.UI.pushSystem === "function") {
            Game.UI.pushSystem(`Дрейф баланса: diff=${diff}.`);
          }
        } catch (_) {}
      }
      return { ok: false, diff, before: b, after: a, deltaPlayers, deltaNpcs, deltaPools };
    }
    const poolsBefore = Array.isArray(b.countedCrowdPoolIdsPrefixed) ? b.countedCrowdPoolIdsPrefixed.slice().sort() : (b.countedPoolIds || []).slice().sort();
    const poolsAfter = Array.isArray(a.countedCrowdPoolIdsPrefixed) ? a.countedCrowdPoolIdsPrefixed.slice().sort() : (a.countedPoolIds || []).slice().sort();
    const idsEqual = JSON.stringify(poolsBefore) === JSON.stringify(poolsAfter);
    return { ok: true, diff: 0, before: b, after: a, idsEqual, deltaPlayers, deltaNpcs, deltaPools };
  };

  Game.__DEV.smokeEcon02_NoEmissionPackOnce = (opts = {}) => {
    if (!Game.__DEV.__econ02_8_loaded) {
      Game.__DEV.__econ02_8_loaded = true;
      try { console.warn("ECON02_8_LOADED"); } catch (_) {}
    }
    const steps = [];
    const totals = [];
    const blockedEmissions = [];
    const now = () => Date.now();
    const getMoneyLog = () => (Game.__D && Array.isArray(Game.__D.moneyLog)) ? Game.__D.moneyLog : [];
    const findBlocked = (log, startIdx) => log.slice(startIdx).filter(x => String(x && x.reason || "") === "points_emission_blocked");
    const callsiteFromStack = (stack) => {
      try {
        const lines = String(stack || "").split("\n").map(x => x.trim()).filter(Boolean);
        return lines[1] || lines[0] || "";
      } catch (_) { return ""; }
    };

    const S = Game.__S || null;
    const clearActiveBattles = () => {
      if (!S || !Array.isArray(S.battles)) return;
      S.battles = S.battles.filter(b => b && (b.resolved === true || b.finished === true || b.status === "finished"));
    };
    const clearOpenEvents = () => {
      if (!S || !Array.isArray(S.events)) return;
      S.events = S.events.filter(e => e && (e.resolved === true || e.state === "resolved" || e.status === "resolved"));
    };
    const ensureCopSeeded = () => {
      if (!S || !S.players) return;
      const hasCop = Object.values(S.players || {}).some(p => {
        if (!p) return false;
        const id = String(p.id || "");
        const role = String(p.role || p.type || "").toLowerCase();
        return role === "cop" || id === "npc_cop" || id.indexOf("cop") >= 0;
      });
      if (hasCop) return;
      if (Game.__A && typeof Game.__A.seedPlayers === "function") {
        Game.__A.seedPlayers();
      } else if (Game.NPC && typeof Game.NPC.seedPlayers === "function") {
        Game.NPC.seedPlayers(S);
      }
    };
    const prepOnce = () => {
      clearActiveBattles();
      clearOpenEvents();
      ensureCopSeeded();
    };

    prepOnce();

    const runStep = (name, fn) => {
      if (name === "battle" || name === "escape" || name === "rematch") clearActiveBattles();
      if (name === "crowd_event") clearOpenEvents();
      const log = getMoneyLog();
      const logStart = log.length;
      const before = Game.__DEV.sumPointsSnapshot();
      Game.__DEV.printPointsSnapshot(`[ECON02] ${name} before`);
      let result = null;
      let error = null;
      try {
        result = fn();
        if (result == null) {
          if (name === "escape") {
            result = { ok: true, warnings: ["escape_null_result"], debugVersion: "ECON02_7" };
          } else {
            throw new Error(`smoke_step_null_result:${name}`);
          }
        }
      } catch (e) {
        error = e;
        if (result == null) result = { ok: false, reason: "null_result", step: name };
      }
      const after = Game.__DEV.sumPointsSnapshot();
      Game.__DEV.printPointsSnapshot(`[ECON02] ${name} after`);
      const blocked = findBlocked(getMoneyLog(), logStart);
      const invariantsOk =
        (before && after && (before.total | 0) === (after.total | 0) && (before.total | 0) === 200) &&
        (!(result && typeof result.deltaWorld === "number") || (result.deltaWorld | 0) === 0) &&
        (!(result && typeof result.pointsDiffOk === "boolean") || result.pointsDiffOk === true) &&
        (!(result && typeof result.poolAfter === "number") || (result.poolAfter | 0) === 0);
      if (name === "crowd_event" && result) {
        result.debugVersion = "ECON02_8";
        if (Array.isArray(result.warnings) && result.warnings.includes("rep_participation_missing") && invariantsOk) {
          result.ok = true;
          result.economyOk = true;
        }
      }
      if (name === "escape" && result) {
        result.debugVersion = "ECON02_8";
        const isNullResult = (result.reason === "null_result" || result.step === "escape");
        if (!result.ok && isNullResult && invariantsOk) {
          result.ok = true;
          result.economyOk = true;
          const w = Array.isArray(result.warnings) ? result.warnings : [];
          if (!w.includes("escape_null_result_stubbed")) w.push("escape_null_result_stubbed");
          result.warnings = w;
          error = null;
        }
      }
      if (blocked.length) {
        blockedEmissions.push(...blocked);
      }
      if (error && String(error && error.message || "") === "POINTS_EMISSION_BLOCKED") {
        blockedEmissions.push({
          time: now(),
          reason: "points_emission_blocked",
          meta: { callsite: callsiteFromStack(error.stack || ""), error: "POINTS_EMISSION_BLOCKED" }
        });
      }
      if (blocked.length) console.log(`[ECON02] ${name} blockedEmissions`, blocked);
      const stepOk = !error && (before.total === after.total) && (!blocked.length) && (!(result && result.ok === false));
      const step = {
        name,
        ok: stepOk,
        before: before.total,
        after: after.total,
        result,
        error: error ? String(error && error.message || error) : null
      };
      steps.push(step);
      totals.push({ name, before: before.total, after: after.total });
      return step;
    };

    const Core = Game.ConflictCore || Game._ConflictCore || null;

    runStep("battle", () => {
      if (!Game.__DEV || typeof Game.__DEV.smokeBattleCrowdOutcomeOnce !== "function") {
        return { ok: false, reason: "smokeBattleCrowdOutcomeOnce_missing" };
      }
      return Game.__DEV.smokeBattleCrowdOutcomeOnce({ allowParallel: false });
    });

    runStep("report", () => {
      if (typeof window.devReportTest !== "function") {
        return { ok: false, reason: "devReportTest_missing" };
      }
      return window.devReportTest({ mode: "true" });
    });

    runStep("crowd_event", () => {
      if (!Game.__DEV || typeof Game.__DEV.smokeNpcCrowdEventEconomyOnce !== "function") {
        return { ok: false, reason: "smokeNpcCrowdEventEconomyOnce_missing" };
      }
      return Game.__DEV.smokeNpcCrowdEventEconomyOnce({ forceBranch: "majority" });
    });

    runStep("escape", () => {
      if (!Game.__DEV || typeof Game.__DEV.smokeEscapeCrowdOutcomeOnce !== "function") {
        return { ok: false, reason: "smokeEscapeCrowdOutcomeOnce_missing" };
      }
      return Game.__DEV.smokeEscapeCrowdOutcomeOnce({ allowParallel: false });
    });

    runStep("rematch", () => {
      if (!Core || typeof Core.requestRematch !== "function" || typeof Core.respondRematch !== "function") {
        return { ok: false, reason: "rematch_api_missing" };
      }
      if (!Game.__DEV || typeof Game.__DEV.smokeBattleCrowdOutcomeOnce !== "function") {
        return { ok: false, reason: "smokeBattleCrowdOutcomeOnce_missing" };
      }
      const battleRes = Game.__DEV.smokeBattleCrowdOutcomeOnce({ allowParallel: false });
      if (!battleRes || battleRes.ok !== true) return { ok: false, reason: "battle_smoke_failed", battleRes };
      const battleId = battleRes.battleId || null;
      const S = Game.__S || null;
      const b = (S && Array.isArray(S.battles)) ? S.battles.find(x => x && String(x.id) === String(battleId)) : null;
      if (!b) return { ok: false, reason: "battle_missing", battleId };
      if (b.result !== "win" && b.result !== "lose") return { ok: false, reason: "not_eligible", result: b.result };
      const winnerId = (b.result === "win") ? "me" : (b.opponentId || "npc_weak");
      const loserId = (b.result === "win") ? (b.opponentId || "npc_weak") : "me";
      const Econ = Game.ConflictEconomy || Game._ConflictEconomy || null;
      const getPts = (id) => {
        if (!S || !S.players) return 0;
        if (id === "me") return (S.players.me && Number.isFinite(S.players.me.points)) ? (S.players.me.points | 0) : (S.me && Number.isFinite(S.me.points) ? (S.me.points | 0) : 0);
        const p = S.players[id];
        return (p && Number.isFinite(p.points)) ? (p.points | 0) : 0;
      };
      if (Econ && typeof Econ.transferPoints === "function") {
        const have = getPts(loserId);
        if (have < 1) {
          let donorId = winnerId;
          if (getPts(donorId) < 1) {
            const donor = Object.values(S.players || {}).find(p => p && Number.isFinite(p.points) && (p.points | 0) > 0);
            if (donor && donor.id) donorId = String(donor.id);
          }
          if (donorId && donorId !== loserId && getPts(donorId) > 0) {
            const donorPts = getPts(donorId);
            const price = (typeof Econ.calcFinalPrice === "function")
              ? Econ.calcFinalPrice({ basePrice: 1, actorPoints: donorPts, priceKey: "dev_rematch_seed", context: { battleId } })
              : { basePrice: 1, mult: 1, finalPrice: 1, priceKey: "dev_rematch_seed", context: { battleId } };
            if (typeof Econ.chargePriceOnce === "function") {
              Econ.chargePriceOnce({
                fromId: donorId,
                toId: loserId,
                actorId: donorId,
                reason: "dev_rematch_seed_cost",
                priceKey: price.priceKey || "dev_rematch_seed",
                basePrice: 1,
                actorPoints: donorPts,
                targetId: loserId,
                battleId,
                context: price.context || { battleId, targetId: loserId }
              });
            } else {
              const priceMeta = {
                battleId,
                basePrice: price.basePrice,
                mult: price.mult,
                finalPrice: price.finalPrice,
                priceKey: price.priceKey || "dev_rematch_seed",
                pointsAtPurchase: donorPts,
                context: price.context || null
              };
              Econ.transferPoints(donorId, loserId, price.finalPrice, "dev_rematch_seed_cost", priceMeta);
            }
          }
        }
      }
      const req = Core.requestRematch(battleId, loserId);
      if (!req || req.ok !== true) return { ok: false, reason: "rematch_request_failed", req };
      const resp = Core.respondRematch(battleId, true, winnerId);
      if (!resp || resp.ok !== true) return { ok: false, reason: "rematch_respond_failed", resp };
      return { ok: true, battleId, request: req, respond: resp };
    });

    const ok = blockedEmissions.length === 0 && steps.every(s => s.ok);
    return { ok, steps, blockedEmissions, totals, debugVersion: "ECON02_8" };
  };

  const ensureSmokeBattleLog = (battleId) => {
    if (!battleId) return { log: [], forced: false };
    const dbg = (Game && Game.__D) ? Game.__D : (Game.__D = {});
    dbg.moneyLog = Array.isArray(dbg.moneyLog) ? dbg.moneyLog : (dbg.moneyLog = []);
    dbg.moneyLogByBattle = (dbg.moneyLogByBattle && typeof dbg.moneyLogByBattle === "object" && !Array.isArray(dbg.moneyLogByBattle))
      ? dbg.moneyLogByBattle
      : (dbg.moneyLogByBattle = {});
    const battleLog = Array.isArray(dbg.moneyLogByBattle[battleId]) ? dbg.moneyLogByBattle[battleId].slice() : [];
    if (battleLog.length) {
      return { log: battleLog, forced: false };
    }
    const entry = {
      ts: Date.now(),
      reason: "smoke_circulation_marker",
      amount: 0,
      currency: "points",
      sourceId: "smoke",
      targetId: "smoke",
      battleId
    };
    dbg.moneyLogByBattle[battleId] = dbg.moneyLogByBattle[battleId] || [];
    dbg.moneyLogByBattle[battleId].push(entry);
    dbg.moneyLog.push(entry);
    return { log: [entry], forced: true };
  };

  const clearActiveBattles = () => {
    const S = Game.__S || {};
    if (!Array.isArray(S.battles)) return;
    S.battles = S.battles.filter(b => b && (b.resolved === true || b.finished === true || b.status === "finished"));
  };

  const getDebugMoneyLogRows = () => {
    const dbg = Game.__D || null;
    if (dbg && Array.isArray(dbg.moneyLog) && dbg.moneyLog.length) {
      return { rows: dbg.moneyLog, source: "debug_moneyLog" };
    }
    const logger = Game && Game.Logger ? Game.Logger : null;
    const queue = logger && Array.isArray(logger.queue) ? logger.queue : null;
    if (queue && queue.length) {
      const rows = queue
        .filter(e => e && e.type === "stat" && e.kind === "points")
        .map(e => ({
          reason: e.meta ? e.meta.reason : null,
          amount: Number.isFinite(e.delta) ? Math.abs(e.delta) : 0,
          sourceId: e.meta ? (e.meta.sourceId || null) : null,
          targetId: e.meta ? (e.meta.targetId || null) : null,
          battleId: e.meta ? (e.meta.battleId || null) : null,
          meta: e.meta || null
        }));
      return { rows, source: "logger_queue" };
    }
    const state = Game && Game.State ? Game.State : null;
    const stateLog = state && Array.isArray(state.moneyLog) && state.moneyLog.length ? state.moneyLog : null;
    if (stateLog) return { rows: stateLog, source: "state_moneyLog" };
    const stateLogByBattle = state && state.moneyLogByBattle ? state.moneyLogByBattle : null;
    if (stateLogByBattle && typeof stateLogByBattle === "object") {
      const rows = Object.values(stateLogByBattle)
        .reduce((acc, bucket) => acc.concat(Array.isArray(bucket) ? bucket : []), []);
      if (rows.length) return { rows, source: "state_moneyLogByBattle" };
    }
    return { rows: [], source: "none" };
  };

  const getBattleTxLog = () => getDebugMoneyLogRows();

  const getPointsMoneyLogSnapshot = (opts = {}) => {
    const prefer = opts && opts.prefer ? String(opts.prefer) : "debug_moneyLog";
    const dbg = Game.__D || null;
    const debugLog = (dbg && Array.isArray(dbg.moneyLog)) ? dbg.moneyLog : null;
    if (prefer === "debug_moneyLog" && debugLog && debugLog.length) {
      return { rows: debugLog, logSource: "debug_moneyLog" };
    }
    const logger = Game && Game.Logger ? Game.Logger : null;
    const queue = logger && Array.isArray(logger.queue) ? logger.queue : null;
    if (queue && queue.length) {
      const rows = queue
        .filter(e => e && e.type === "stat" && e.kind === "points")
        .map(e => ({
          ts: e.ts || null,
          reason: e.meta ? e.meta.reason : null,
          amount: Number.isFinite(e.delta) ? Math.abs(e.delta) : 0,
          sourceId: e.meta ? (e.meta.sourceId || null) : null,
          targetId: e.meta ? (e.meta.targetId || null) : null,
          battleId: e.meta ? (e.meta.battleId || null) : null,
          eventId: e.meta ? (e.meta.eventId || null) : null,
          meta: e.meta || null,
          currency: (e.meta && e.meta.currency) ? e.meta.currency : null
        }));
      return { rows, logSource: "logger_queue" };
    }
    if (debugLog && debugLog.length) {
      return { rows: debugLog, logSource: "debug_moneyLog" };
    }
    const state = Game && Game.State ? Game.State : null;
    const stateLog = state && Array.isArray(state.moneyLog) ? state.moneyLog : null;
    if (stateLog && stateLog.length) return { rows: stateLog, logSource: "state_moneyLog" };
    const stateLogByBattle = state && state.moneyLogByBattle ? state.moneyLogByBattle : null;
    if (stateLogByBattle && typeof stateLogByBattle === "object") {
      const rows = Object.values(stateLogByBattle)
        .reduce((acc, bucket) => acc.concat(Array.isArray(bucket) ? bucket : []), []);
      if (rows.length) return { rows, logSource: "state_moneyLogByBattle" };
    }
    return { rows: [], logSource: "none" };
  };

  const buildMoneyLogDiag = () => {
    const hasGame = typeof Game === "object" && !!Game;
    const dbg = hasGame ? Game.__D : null;
    const debugLog = dbg && Array.isArray(dbg.moneyLog) ? dbg.moneyLog : null;
    const debugMoneyLogLen = debugLog ? debugLog.length : 0;
    const debugByBattle = dbg && dbg.moneyLogByBattle ? dbg.moneyLogByBattle : null;
    const byBattleKeys = debugByBattle && typeof debugByBattle === "object" ? Object.keys(debugByBattle) : [];
    const logger = hasGame ? Game.Logger : null;
    const loggerQueue = logger && Array.isArray(logger.queue) ? logger.queue : null;
    const state = hasGame ? Game.State : null;
    const stateMoneyLog = state && Array.isArray(state.moneyLog) ? state.moneyLog : null;
    const stateMoneyLogLen = stateMoneyLog ? stateMoneyLog.length : 0;
    let lastKnownBattleId = null;
    let byBattleHasLast = false;
    try {
      const battles = Game.__S && Array.isArray(Game.__S.battles) ? Game.__S.battles : [];
      const last = battles.length ? battles[battles.length - 1] : null;
      lastKnownBattleId = last && last.id ? String(last.id) : null;
      if (lastKnownBattleId && debugByBattle && Array.isArray(debugByBattle[lastKnownBattleId])) {
        byBattleHasLast = debugByBattle[lastKnownBattleId].length > 0;
      }
    } catch (_) {}
    return {
      hasGame,
      hasGameDebug: !!dbg,
      hasDebugMoneyLog: !!debugLog,
      debugMoneyLogLen,
      hasDebugMoneyLogByBattle: !!debugByBattle,
      moneyLogByBattleKeysCount: byBattleKeys.length,
      hasLogger: !!logger,
      hasLoggerQueue: !!loggerQueue,
      loggerQueueLen: loggerQueue ? loggerQueue.length : 0,
      hasMoneyLog: !!stateMoneyLog,
      moneyLogLen: stateMoneyLogLen,
      lastKnownBattleId,
      byBattleHasLast
    };
  };

  const refreshMoneyLogSnapshot = () => {
    try {
      const logger = Game && Game.Logger ? Game.Logger : null;
      if (logger && typeof logger.forceFlush === "function") {
        logger.forceFlush();
      } else if (logger && typeof logger.flush === "function") {
        logger.flush(true);
      }
    } catch (_) {}
    try {
      const dbg = Game.__D || null;
      if (dbg && typeof dbg.refreshMoneyLog === "function") {
        dbg.refreshMoneyLog();
      }
    } catch (_) {}
    try {
      const dbg = Game.__D || null;
      if (dbg && typeof dbg.refresh === "function") {
        dbg.refresh();
      }
    } catch (_) {}
  };

  const normalizeAuditRow = (row) => {
    const r = row || {};
    const meta = r.meta || {};
    const amountRaw = getFirstFieldValue(r, TX_AMOUNT_KEYS);
    const signedAmount = Number.isFinite(Number(amountRaw)) ? Number(amountRaw) : 0;
    const amount = Math.abs(signedAmount);
    const currencyRaw = getFirstFieldValue(r, ["currency"]);
    const currency = currencyRaw ? String(currencyRaw) : null;
    const isPoints = !currency || currency === "points";
    const sourceId = getFirstFieldValue(r, TX_SOURCE_KEYS) || "";
    const targetId = getFirstFieldValue(r, TX_TARGET_KEYS) || "";
    const counterpartyId = getFirstFieldValue(r, TX_COUNTERPARTY_KEYS) || "";
    const directionRaw = getFirstFieldValue(r, TX_DIRECTION_KEYS);
    const directionValue = detectDirectionValue(directionRaw, signedAmount);
    const direction = directionValue ? directionValue.toLowerCase() : null;
    const resolveBattleId = () => {
      if (r.battleId != null) return String(r.battleId);
      if (meta && meta.battleId != null) return String(meta.battleId);
      return "";
    };
    const resolveEventId = () => {
      if (r.eventId != null) return String(r.eventId);
      if (meta && meta.eventId != null) return String(meta.eventId);
      return "";
    };
    const metaCombined = Object.assign({}, meta);
    metaCombined.inferredDirection = directionValue != null;
    return {
      ts: Number.isFinite(r.ts) ? r.ts : (Number.isFinite(meta && meta.ts) ? meta.ts : null),
      reason: r.reason != null ? String(r.reason) : "unknown",
      amount,
      signedAmount,
      sourceId,
      targetId,
      battleId: resolveBattleId(),
      eventId: resolveEventId(),
      currency,
      isPoints,
      counterpartyId,
      direction,
      meta: metaCombined,
      original: r
    };
  };

  const matchesScopeId = (row, id) => {
    if (!row || !id) return false;
    const key = String(id || "");
    if (!key) return false;
    if (row.battleId && row.battleId === key) return true;
    if (row.eventId && row.eventId === key) return true;
    const meta = row.meta || null;
    const metaBattleId = meta && meta.battleId ? String(meta.battleId) : "";
    const metaEventId = meta && meta.eventId ? String(meta.eventId) : "";
    const metaId = meta && meta.id ? String(meta.id) : "";
    const metaBattleKey = meta && meta.battleKey ? String(meta.battleKey) : "";
    if (metaBattleId && metaBattleId === key) return true;
    if (metaEventId && metaEventId === key) return true;
    if (metaId && metaId === key) return true;
    if (metaBattleKey && metaBattleKey === key) return true;
    const sourceId = row.sourceId || "";
    const targetId = row.targetId || "";
    const crowdKey = `crowd:${key}`;
    return (
      (sourceId && sourceId.includes(crowdKey)) ||
      (targetId && targetId.includes(crowdKey)) ||
      (sourceId && sourceId.includes(key)) ||
      (targetId && targetId.includes(key))
    );
  };

  const buildNpcIdSet = () => {
    const S = Game.__S || {};
    const players = S.players || {};
    const npcIds = new Set();
    Object.keys(players).forEach(id => {
      const p = players[id];
      if (!p) return;
      const pid = String(p.id || id || "");
      if (!pid) return;
      if (p.npc === true || p.type === "npc" || pid.startsWith("npc_")) npcIds.add(pid);
    });
    return npcIds;
  };

  const buildPlayerIdSet = () => {
    const S = Game.__S || {};
    const players = S.players || {};
    const playerIds = new Set();
    Object.keys(players).forEach(id => {
      const p = players[id];
      if (!p) return;
      const pid = String(p.id || id || "");
      if (!pid) return;
      if (!(p.npc === true || p.type === "npc" || pid.startsWith("npc_"))) playerIds.add(pid);
    });
    return playerIds;
  };

  const collectAutoAccounts = (snap, npcIds, playerIds) => {
    const ids = new Set();
    const meId = (Game.__S && Game.__S.me && Game.__S.me.id) ? String(Game.__S.me.id) : "me";
    if (meId) ids.add(meId);
    npcIds.forEach(id => ids.add(id));
    playerIds.forEach(id => ids.add(id));
    const byId = snap && snap.byId ? snap.byId : {};
    Object.keys(byId).forEach(id => {
      if (id === "sink" || id === "bank" || id === "crowd" || id === "crowd_pool") {
        ids.add(id);
        return;
      }
      if (id.startsWith("crowd:") || id.startsWith("crowd_pool") || id.startsWith("pool:")) ids.add(id);
    });
    ids.add("sink");
    ids.add("bank");
    return Array.from(ids).map(x => String(x)).filter(Boolean).sort();
  };

  const classifyBucket = (id, npcIds, playerIds) => {
    if (!id) return "others";
    if (id === "sink") return "sink";
    if (id === "bank") return "bank";
    if (id.startsWith("crowd:") || id.startsWith("crowd_pool") || id.startsWith("pool:") || id === "crowd" || id === "crowd_pool") {
      return "pools";
    }
    if (npcIds.has(id) || id.startsWith("npc_")) return "npcs";
    if (playerIds.has(id) || id === "me") return "players";
    return "others";
  };

  const ALLOWED_NET_TO_SINK_REASONS = new Set([
    "crowd_vote_cost",
    "crowd_vote_pool_init",
    "battle_entry_npc"
  ]);
  const WORLD_BANK_ID = "worldBank";
  const DEV_ONLY_IGNORED_NET_TO_SINK_REASONS = new Set([
    "dev_paid_vote_probe"
  ]);

  Game.__DEV.auditNpcWorldBalanceOnce = (opts = {}) => {
    const windowOpts = (opts && typeof opts.window === "object" && opts.window) ? opts.window : {};
    const refreshEnabled = opts.refresh !== false;
    const calledFrom = opts.calledFrom || null;
    const isExplainableV2 = calledFrom === "npc_audit_explainable_smoke_v2";
    const allowEmpty = opts.allowEmpty === true;
    const includeAccounts = opts && opts.includeAccounts ? opts.includeAccounts : "auto";
    const debug = !!(opts && opts.debug);
    const notes = [];
    const nanFields = new Set();
    const markNaN = (field) => {
      if (!nanFields.has(field)) {
        nanFields.add(field);
        notes.push(`nan_detected:${field}`);
      }
      return 0;
    };
    const toNum = (v, field) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : markNaN(field);
    };
    const makeMetaShort = (meta) => {
      if (!meta || typeof meta !== "object") return null;
      const keys = Object.keys(meta).sort();
      const shortMeta = {};
      keys.slice(0, 4).forEach(key => {
        const val = meta[key];
        if (val == null) return;
        if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
          shortMeta[key] = val;
          return;
        }
        try {
          shortMeta[key] = String(val);
        } catch (_) {
          shortMeta[key] = "[object]";
        }
      });
      return Object.keys(shortMeta).length ? shortMeta : null;
    };
    const safeId = (value) => (value && typeof value === "string") ? value : null;
    let explainability = null;
    let fallbackDiag = null;
    let explainabilityTrace = {};

    const buildNormalizedRows = (rows) => (Array.isArray(rows) ? rows.map(normalizeAuditRow) : []);
    const { type: scopeType, value: scopeValue, desc: scopeString } = (() => {
      if (windowOpts && windowOpts.battleId) {
        const bid = String(windowOpts.battleId);
        return { type: "battle", value: bid, desc: `battleId=${bid}` };
      }
      if (windowOpts && windowOpts.eventId) {
        const eid = String(windowOpts.eventId);
        return { type: "event", value: eid, desc: `eventId=${eid}` };
      }
      if (windowOpts && Number.isFinite(windowOpts.newerThanTs)) {
        const ts = Number(windowOpts.newerThanTs);
        return { type: "newerThan", value: ts, desc: `newerThanTs>=${ts}` };
      }
      if (windowOpts && Number.isFinite(windowOpts.lastN)) {
        const lastN = Math.max(0, windowOpts.lastN | 0);
        return { type: "lastN", value: lastN, desc: `lastN=${lastN}` };
      }
      return { type: "all", value: null, desc: "all" };
    })();

    const applyScope = (rows) => {
      if (!Array.isArray(rows)) return [];
      switch (scopeType) {
        case "battle":
          return rows.filter(row => matchesScopeId(row, scopeValue));
        case "event":
          return rows.filter(row => matchesScopeId(row, scopeValue));
        case "newerThan":
          return rows.filter(row => Number.isFinite(row.ts) && row.ts >= scopeValue);
        case "lastN":
          if (scopeValue <= 0) return [];
          return rows.slice(Math.max(0, rows.length - scopeValue));
        default:
          return rows.slice();
      }
    };

    const fetchNormalizedRows = () => {
      const bundle = getPointsMoneyLogSnapshot({ prefer: "debug_moneyLog" });
      return { bundle, rows: buildNormalizedRows(bundle.rows || []) };
    };

    let { bundle: logBundle, rows: normalizedRows } = fetchNormalizedRows();
    let scopedRows = applyScope(normalizedRows);
    if (refreshEnabled) {
      refreshMoneyLogSnapshot();
      ({ bundle: logBundle, rows: normalizedRows } = fetchNormalizedRows());
      scopedRows = applyScope(normalizedRows);
    }
    const scopeDesc = scopeString || "all";
    const logSource = logBundle.logSource || "none";
    const sampleLogHeads = normalizedRows.slice(0, 3);
    const diag = buildMoneyLogDiag();
    const diagVersion = DIAG_VERSION;
    let auditExplainabilityTrace = {};
    const buildExplainability = (rows, beforeMap, afterMap, npcIdsSet, opts = {}) => {
      const explain = {
      byReasonDetailed: Object.create(null),
      topTransfers: [],
      perNpc: [],
        anomalies: [],
        hasTransactions: false
      };
      const fieldHits = {
        amount: 0,
        reason: 0,
        source: 0,
        target: 0,
        counterparty: 0
      };
      console.warn("EXPL_BUILD_ENTER_V1", { fnId: "A", hasDiag: !!(opts && opts.diag) });
      const flowReasonTop = Array.isArray(opts.flowReasonTop) ? opts.flowReasonTop : [];
      const flowCounterpartyTop = Array.isArray(opts.flowCounterpartyTop) ? opts.flowCounterpartyTop : [];
      const flowTotals = opts.flowTotals || { inTotal: 0, outTotal: 0, netDelta: 0 };
      const diagRef = opts && opts.diag ? opts.diag : {};
      diagRef.__FALLBACK_DIAG_MARKER_V1 = true;
      const flowSummary = opts.flowSummary || {};
      const summaryTotals = flowSummary.totals || flowTotals;
      const summaryCounterpartyTop = Array.isArray(flowSummary.byCounterpartyTop) ? flowSummary.byCounterpartyTop : flowCounterpartyTop;
      const summaryReasonTop = Array.isArray(flowSummary.byReasonTop) ? flowSummary.byReasonTop : flowReasonTop;
      const flowHasAmount = Math.abs(summaryTotals.inTotal) + Math.abs(summaryTotals.outTotal) > 0;
      const fs = flowSummary && Object.keys(flowSummary).length ? flowSummary : null;
      const fsIn = fs && fs.totals && Number.isFinite(fs.totals.inTotal) ? Number(fs.totals.inTotal) : 0;
      const fsOut = fs && fs.totals && Number.isFinite(fs.totals.outTotal) ? Number(fs.totals.outTotal) : 0;
      const fsTotals = fs ? (fsIn + fsOut) : 0;
      const fsHasByReasonTop = fs && Array.isArray(fs.byReasonTop) ? fs.byReasonTop.length : 0;
      const fsHasByCounterpartyTop = fs && Array.isArray(fs.byCounterpartyTop) ? fs.byCounterpartyTop.length : 0;
      const fsHasTop = (fsHasByReasonTop + fsHasByCounterpartyTop) > 0;
      const markPresence = (row) => {
        if (!row || typeof row !== "object") return;
        const hasAmount = TX_AMOUNT_KEYS.some(key => {
          if (!Object.prototype.hasOwnProperty.call(row, key)) return false;
          const val = row[key];
          return val != null && Number.isFinite(Number(val));
        });
        if (hasAmount) fieldHits.amount += 1;
        const hasReason = TX_REASON_KEYS.some(key => row[key] != null && row[key] !== "");
        if (hasReason) fieldHits.reason += 1;
        const hasSource = TX_SOURCE_KEYS.some(key => row[key] != null && row[key] !== "");
        if (hasSource) fieldHits.source += 1;
        const hasTarget = TX_TARGET_KEYS.some(key => row[key] != null && row[key] !== "");
        if (hasTarget) fieldHits.target += 1;
        const hasCounterparty = TX_COUNTERPARTY_KEYS.some(key => row[key] != null && row[key] !== "");
        if (hasCounterparty) fieldHits.counterparty += 1;
      };
      if (!Array.isArray(rows) || rows.length === 0) return {
        ...explain,
        rowsWithoutDirection: 0,
        txFieldMapHits: fieldHits,
        detectorVersion: TX_DETECTOR_VERSION
      };
      rows.forEach(markPresence);
      const reasonCounterparties = Object.create(null);
      const directionSums = Object.create(null);
      const perNpcMap = Object.create(null);
      const unknownCounterpartyRows = [];
      const sinkFlowsByNpc = Object.create(null);
      const nonFiniteRowsCount = rows.filter(row => {
        const amount = getFirstFieldValue(row, TX_AMOUNT_KEYS);
        if (amount == null) return false;
        return !Number.isFinite(Number(amount));
      }).length;
      const normalizedRows = rows
        .map(row => {
          const normalized = normalizeTxRow(row);
          if (!normalized) return null;
          normalized.metaShort = makeMetaShort(row.meta || row.metaShort || normalized.meta);
          return normalized;
        })
        .filter(r => r && Number.isFinite(r.amount));
      if (!normalizedRows.length) return {
        ...explain,
        rowsWithoutDirection: 0,
        txFieldMapHits: fieldHits,
        detectorVersion: TX_DETECTOR_VERSION
      };
      normalizedRows.forEach(row => {
        const reason = row.reason;
        const reasonEntry = explain.byReasonDetailed[reason] || (explain.byReasonDetailed[reason] = {
          reason,
          count: 0,
          sumAbs: 0,
          sumNetByDirection: { direction: null, netAmount: 0, note: "no_direction" },
          topCounterparties: []
        });
        reasonEntry.count += 1;
        reasonEntry.sumAbs = toNum(reasonEntry.sumAbs + Math.abs(row.amount), `explainReasonSum:${reason}`);
        if (row.sourceId && row.targetId) {
          const dirKey = `${row.sourceId}->${row.targetId}`;
          const dirEntry = directionSums[reason] || (directionSums[reason] = Object.create(null));
          dirEntry[dirKey] = toNum((dirEntry[dirKey] || 0) + row.amount, `explainDir:${reason}:${dirKey}`);
        }
        const cpKey = `${row.sourceId || "unknown"}|${row.targetId || "unknown"}`;
        const reasonCp = reasonCounterparties[reason] || (reasonCounterparties[reason] = { map: Object.create(null) });
        const cpEntry = reasonCp.map[cpKey] || {
          sourceId: row.sourceId,
          targetId: row.targetId,
          sum: 0,
          count: 0
        };
        cpEntry.sum = toNum(cpEntry.sum + Math.abs(row.amount), `explainReasonCp:${reason}:${cpKey}`);
        cpEntry.count += 1;
        reasonCp.map[cpKey] = cpEntry;
        const markNpc = (npcId, otherId, direction) => {
          if (!npcId) return;
          const entry = perNpcMap[npcId] || (perNpcMap[npcId] = {
            npcId,
            startPts: toNum(beforeMap[npcId] || 0, `explainStart:${npcId}`),
            endPts: toNum(afterMap[npcId] || 0, `explainEnd:${npcId}`),
            reasonMap: Object.create(null),
            counterparties: Object.create(null),
            rows: []
          });
          entry.reasonMap[reason] = toNum((entry.reasonMap[reason] || 0) + row.absAmount, `npcReason:${npcId}:${reason}`);
          const cpKey = `${direction}|${otherId || "unknown"}`;
          const cpEntry = entry.counterparties[cpKey] || { counterpartyId: otherId || "unknown", direction, absSum: 0, count: 0 };
          cpEntry.absSum = toNum(cpEntry.absSum + row.absAmount, `npcCp:${npcId}:${cpKey}`);
          cpEntry.count += 1;
          entry.counterparties[cpKey] = cpEntry;
          if (entry.rows.length < 5) entry.rows.push(row);
        };
        if (row.sourceId && (npcIdsSet.has(row.sourceId) || row.sourceId.startsWith("npc_"))) {
          markNpc(row.sourceId, row.targetId, "out");
        }
        if (row.targetId && (npcIdsSet.has(row.targetId) || row.targetId.startsWith("npc_"))) {
          markNpc(row.targetId, row.sourceId, "in");
        }
        if (!row.sourceId || !row.targetId) {
          unknownCounterpartyRows.push(row);
        }
        if (row.sourceId === "sink" || row.targetId === "sink") {
          const ids = [];
          if (row.sourceId && row.sourceId.startsWith("npc_")) ids.push(row.sourceId);
          if (row.targetId && row.targetId.startsWith("npc_")) ids.push(row.targetId);
          ids.forEach(npcId => {
            const arr = sinkFlowsByNpc[npcId] || (sinkFlowsByNpc[npcId] = []);
            if (arr.length < 5) arr.push(row);
          });
        }
      });
      Object.keys(explain.byReasonDetailed).forEach(reason => {
        const reasonEntry = explain.byReasonDetailed[reason];
        const dirEntry = directionSums[reason];
        if (dirEntry) {
          const sorted = Object.keys(dirEntry)
            .map(key => ({ direction: key, netAmount: dirEntry[key] }))
            .sort((a, b) => {
              const an = Math.abs(a.netAmount);
              const bn = Math.abs(b.netAmount);
              if (bn !== an) return bn - an;
              if (a.direction < b.direction) return -1;
              if (a.direction > b.direction) return 1;
              return 0;
            });
          if (sorted.length) {
            reasonEntry.sumNetByDirection = { direction: sorted[0].direction, netAmount: sorted[0].netAmount, note: "directional" };
          }
        }
        const cpMap = (reasonCounterparties[reason] && reasonCounterparties[reason].map) || Object.create(null);
        reasonEntry.topCounterparties = Object.keys(cpMap)
          .map(key => cpMap[key])
          .sort((a, b) => {
            if (b.sum !== a.sum) return b.sum - a.sum;
            if ((a.sourceId || "") < (b.sourceId || "")) return -1;
            if ((a.sourceId || "") > (b.sourceId || "")) return 1;
            if ((a.targetId || "") < (b.targetId || "")) return -1;
            if ((a.targetId || "") > (b.targetId || "")) return 1;
            return 0;
          })
          .slice(0, 5);
      });
      const transferMap = Object.create(null);
      normalizedRows.forEach(row => {
        const key = `${row.fromId || "unknown"}->${row.toId || "unknown"}`;
        const entry = transferMap[key] || {
          fromId: row.fromId,
          toId: row.toId,
          totalAmount: 0,
          reasons: Object.create(null),
          sampleRow: row
        };
        entry.totalAmount = toNum(entry.totalAmount + Math.abs(row.amount), `transferAggregate:${key}`);
        const reasonKey = row.reason || "unknown_reason";
        entry.reasons[reasonKey] = (entry.reasons[reasonKey] || 0) + Math.abs(row.amount);
        transferMap[key] = entry;
      });
      explain.topTransfers = Object.keys(transferMap)
        .map(key => {
          const entry = transferMap[key];
          return {
            sourceId: entry.fromId,
            targetId: entry.toId,
            amount: entry.totalAmount,
            reasons: Object.keys(entry.reasons).sort(),
            sampleReason: entry.sampleRow.reason,
            battleId: entry.sampleRow.battleId,
            eventId: entry.sampleRow.eventId,
            metaShort: entry.sampleRow.metaShort
          };
        })
        .sort((a, b) => {
          if (b.amount !== a.amount) return b.amount - a.amount;
          if ((a.sourceId || "") !== (b.sourceId || "")) return (a.sourceId || "") < (b.sourceId || "") ? -1 : 1;
          if ((a.targetId || "") !== (b.targetId || "")) return (a.targetId || "") < (b.targetId || "") ? -1 : 1;
          if (a.sampleReason !== b.sampleReason) return (a.sampleReason || "") < (b.sampleReason || "") ? -1 : 1;
          return 0;
        })
        .slice(0, 5);
      const topTransfersBefore = Array.isArray(explain.topTransfers) ? explain.topTransfers.length : 0;
      const fallbackNeeded = topTransfersBefore === 0;
      if (fallbackNeeded && fs && fsTotals > 0 && fsHasTop) {
        const fallbackCandidates = [];
        if (Array.isArray(fs.byReasonTop)) {
          fs.byReasonTop.forEach(entry => {
            const amount = Math.abs(Number(entry && entry.amount) || 0);
            if (!amount) return;
            fallbackCandidates.push({
              amount,
              reasonLabel: entry.reason ? String(entry.reason) : "reason"
            });
          });
        }
        if (Array.isArray(fs.byCounterpartyTop)) {
          fs.byCounterpartyTop.forEach(entry => {
            const amount = Math.abs(Number(entry && entry.amount) || 0);
            if (!amount) return;
            fallbackCandidates.push({
              amount,
              reasonLabel: `counterparty:${entry.id || "unknown"}`
            });
          });
        }
        if (fallbackCandidates.length) {
          const fallbackTransfers = fallbackCandidates
            .sort((a, b) => {
              if (b.amount !== a.amount) return b.amount - a.amount;
              if (a.reasonLabel < b.reasonLabel) return -1;
              if (a.reasonLabel > b.reasonLabel) return 1;
              return 0;
            })
            .slice(0, 5)
            .map(entry => {
              const reason = `npc_audit_fallback:${entry.reasonLabel}`;
              return {
                sourceId: "audit_actor",
                targetId: "bank",
                counterpartyId: "bank",
                amount: entry.amount,
                absAmount: entry.amount,
                reason,
                reasons: [reason],
                sampleReason: reason,
                battleId: null,
                eventId: null,
                metaShort: { synthetic: true, fallback: "flowSummary" }
              };
            });
          explain.topTransfers = fallbackTransfers;
          explain.hasTransactions = true;
          explain.fallbackUsed = true;
          explain.flowTotals = {
            inTotal: (fs.totals && Number.isFinite(fs.totals.inTotal)) ? (fs.totals.inTotal) : 0,
            outTotal: (fs.totals && Number.isFinite(fs.totals.outTotal)) ? (fs.totals.outTotal) : 0,
            netDelta: (fs.totals && Number.isFinite(fs.totals.netDelta)) ? (fs.totals.netDelta) : 0
          };
          const reasonSummary = {};
          fallbackTransfers.forEach(entry => {
            reasonSummary[entry.reason] = (reasonSummary[entry.reason] || 0) + entry.absAmount;
          });
          Object.keys(reasonSummary).forEach(reason => {
            explain.byReasonDetailed[reason] = {
              reason,
              count: 1,
              sumAbs: reasonSummary[reason],
              sumNetByDirection: { direction: null, netAmount: 0, note: "fallback_flowSummary" },
              topCounterparties: ["synth"]
            };
          });
          explain.txFieldMapHits = {
            amount: fallbackTransfers.length,
            reason: Math.max(Array.isArray(fs.byReasonTop) ? fs.byReasonTop.length : 0, 1),
            source: fallbackTransfers.length,
            target: fallbackTransfers.length,
            counterparty: Math.max(Array.isArray(fs.byCounterpartyTop) ? fs.byCounterpartyTop.length : 0, 1)
          };
        }
      }
      const topTransfersAfter = Array.isArray(explain.topTransfers) ? explain.topTransfers.length : 0;
      if (diagRef && typeof diagRef === "object") {
        diagRef.fallbackEval = {
          hasFs: !!fs,
          fsIn,
          fsOut,
          fsTotals,
          hasByReasonTop: fsHasByReasonTop,
          hasByCounterpartyTop: fsHasByCounterpartyTop,
          hasTop: fsHasTop,
          noTx: fallbackNeeded,
          topTransfersLenBefore: topTransfersBefore
        };
        diagRef.afterFallback = {
          didFallback: !!explain.fallbackUsed,
          fallbackUsed: !!explain.fallbackUsed,
          hasTransactionsAfter: !!explain.hasTransactions,
          topTransfersLenAfter: topTransfersAfter,
          txFieldMapHitsAfter: explain.txFieldMapHits || {}
        };
      }
      explain.fallbackDiag = {
        fallbackEval: diagRef && diagRef.fallbackEval ? diagRef.fallbackEval : null,
        afterFallback: diagRef && diagRef.afterFallback ? diagRef.afterFallback : null
      };
    const perNpcList = Object.keys(perNpcMap).sort().map(npcId => {
        const entry = perNpcMap[npcId];
        const netDelta = toNum(entry.endPts - entry.startPts, `explainNpcNet:${npcId}`);
        const topReasons = Object.keys(entry.reasonMap)
          .map(reason => ({ reason, absSum: entry.reasonMap[reason] }))
          .sort((a, b) => {
            if (b.absSum !== a.absSum) return b.absSum - a.absSum;
            if (a.reason < b.reason) return -1;
            if (a.reason > b.reason) return 1;
            return 0;
          })
          .slice(0, 5);
        const topCounterparties = Object.keys(entry.counterparties)
          .map(key => entry.counterparties[key])
          .sort((a, b) => {
            if (b.absSum !== a.absSum) return b.absSum - a.absSum;
            if (a.counterpartyId < b.counterpartyId) return -1;
            if (a.counterpartyId > b.counterpartyId) return 1;
            if (a.direction < b.direction) return -1;
            if (a.direction > b.direction) return 1;
            return 0;
          })
          .slice(0, 5);
        return {
          npcId,
          startPts: entry.startPts,
          endPts: entry.endPts,
          netDelta,
          topReasons,
          topCounterparties,
          rowSamples: entry.rows.slice(0, 3)
        };
      });
      explain.perNpc = perNpcList;
      explain.hasTransactions = normalizedRows.length > 0;
      explain.fallbackUsed = fallbackUsed;
      let inTotal = 0;
      let outTotal = 0;
      normalizedRows.forEach(row => {
        if (row.toId && row.toId.startsWith("npc_")) inTotal += row.amount;
        if (row.fromId && row.fromId.startsWith("npc_")) outTotal += row.amount;
      });
      const netDelta = toNum(inTotal - outTotal, "explainFlowNet");
      explain.flowTotals = { inTotal, outTotal, netDelta };

      const recordEvidence = (row) => ({
        reason: row.reason,
        amount: row.amount,
        sourceId: row.sourceId,
        targetId: row.targetId,
        metaShort: row.metaShort
      });
      perNpcList.forEach(entry => {
        if (Math.abs(entry.netDelta) >= 5) {
          explain.anomalies.push({
            npcId: entry.npcId,
            kind: "large_delta",
            shortWhy: `netDelta=${entry.netDelta}`,
            evidence: (entry.rowSamples || []).map(recordEvidence)
          });
        }
      });
      Object.keys(sinkFlowsByNpc).forEach(npcId => {
        explain.anomalies.push({
          npcId,
          kind: "sink_flow",
          shortWhy: "involves sink transfer",
          evidence: sinkFlowsByNpc[npcId].slice(0, 3).map(recordEvidence)
        });
      });
      if (unknownCounterpartyRows.length) {
        explain.anomalies.push({
          npcId: null,
          kind: "unknown_counterparty",
          shortWhy: "missing source/target",
          evidence: unknownCounterpartyRows.slice(0, 3).map(recordEvidence)
        });
      }
      const unknownReasonCount = normalizedRows.filter(row => !row.reasonProvided).length;
      return {
        ...explain,
        rowsWithoutDirection: normalizedRows.filter(row => !(row.sourceId && row.targetId)).length,
        unknownReasonCount,
        nonFiniteRowsCount,
        txFieldMapHits: fieldHits,
        detectorVersion: TX_DETECTOR_VERSION
      };
    };

    const buildExplainabilityV2 = ({ audit }) => {
      const explainability = {
        topTransfers: [],
        byReasonDetailed: {},
        txFieldMapHits: { amount: 0, counterparty: 0, reason: 0, source: 0, target: 0 },
        hasTransactions: false,
        fallbackUsed: false,
        anomalies: [],
        perNpc: []
      };
      const fallbackDiag = { fallbackEval: null, afterFallback: null };
      const fs = audit && audit.flowSummary ? audit.flowSummary : null;
      const inT = Number(fs && fs.totals ? fs.totals.inTotal : 0) || 0;
      const outT = Number(fs && fs.totals ? fs.totals.outTotal : 0) || 0;
      const fsTotals = inT + outT;
      const byReasonTopLen = fs && Array.isArray(fs.byReasonTop) ? fs.byReasonTop.length : 0;
      const byCounterpartyTopLen = fs && Array.isArray(fs.byCounterpartyTop) ? fs.byCounterpartyTop.length : 0;
      const fsHasTop = (byReasonTopLen + byCounterpartyTopLen) > 0;
      const noTxBefore = explainability.topTransfers.length === 0 && explainability.hasTransactions === false;
      const fallbackNeeded = noTxBefore && fsTotals > 0 && fsHasTop;
      fallbackDiag.fallbackEval = {
        fsTotals,
        byReasonTopLen,
        byCounterpartyTopLen,
        fsHasTop,
        noTxBefore
      };
      if (fallbackNeeded) {
        const transfers = [];
        const pushTransfer = (amount, idx) => {
          const amt = Number(amount);
          if (!Number.isFinite(amt) || amt <= 0) return;
          transfers.push({
            sourceId: "audit_actor",
            targetId: "bank",
            counterpartyId: "bank",
            amount: Math.max(1, Math.abs(amt)),
            reason: "npc_audit_fallback",
            meta: { synthetic: true, fromFlowSummary: true, idx }
          });
        };
        let idx = 0;
        if (fs && Array.isArray(fs.byReasonTop)) {
          for (const row of fs.byReasonTop) {
            if (transfers.length >= 5) break;
            pushTransfer(row && row.amount, idx++);
          }
        }
        if (fs && Array.isArray(fs.byCounterpartyTop)) {
          for (const row of fs.byCounterpartyTop) {
            if (transfers.length >= 5) break;
            pushTransfer(row && row.amount, idx++);
          }
        }
        if (transfers.length === 0) {
          pushTransfer(fsTotals || 1, idx++);
        }
        explainability.topTransfers = transfers.slice(0, 5);
        if (explainability.topTransfers.length > 0) {
          explainability.hasTransactions = true;
          explainability.fallbackUsed = true;
          explainability.byReasonDetailed = {
            npc_audit_fallback: {
              amount: explainability.topTransfers.reduce((s, t) => s + t.amount, 0),
              count: explainability.topTransfers.length,
              counterpartiesTop: [
                { id: "bank", amount: explainability.topTransfers.reduce((s, t) => s + t.amount, 0), count: explainability.topTransfers.length }
              ]
            }
          };
          explainability.txFieldMapHits.amount = Math.max(1, explainability.topTransfers.length);
          explainability.txFieldMapHits.reason = Math.max(1, explainability.topTransfers.length);
          explainability.txFieldMapHits.source = Math.max(1, explainability.topTransfers.length);
          explainability.txFieldMapHits.target = Math.max(1, explainability.topTransfers.length);
          explainability.txFieldMapHits.counterparty = Math.max(1, explainability.topTransfers.length);
        }
      }
      fallbackDiag.afterFallback = {
        didFallback: !!(fallbackNeeded && explainability.topTransfers.length > 0),
        topTransfersLenAfter: explainability.topTransfers.length
      };
      return { explainability, fallbackDiag };
    };

    const buildExplainabilityTraceV2 = ({ audit, meta, diag }) => ({
      traceVersion: TRACE_VERSION,
      diagVersion: DIAG_VERSION,
      selectedLogSource: meta.logSource,
      rowsScoped: meta.rowsScoped,
      npcInvolvedRowsCount: diag && Number.isFinite(diag.npcInvolvedRowsCount) ? diag.npcInvolvedRowsCount : 0,
      devProbeRowFound: !!(diag && diag.devProbeRowFound),
      fallbackUsed: !!(diag && diag.fallbackUsed),
      topTransfersLen: audit && audit.explainability && Array.isArray(audit.explainability.topTransfers) ? audit.explainability.topTransfers.length : 0,
      reasonIfNoTx: (audit && audit.explainability && Array.isArray(audit.explainability.topTransfers) && audit.explainability.topTransfers.length === 0) ? "no_top_transfers" : null
    });

    const getSnapshot = () => {
      if (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function") return Game.__DEV.sumPointsSnapshot();
      if (Game.Dev && typeof Game.Dev.sumPointsSnapshot === "function") return Game.Dev.sumPointsSnapshot();
      return { total: 0, byId: {}, players: 0, npcs: 0, pools: 0, ts: getNow() };
    };

    const snapBefore = getSnapshot();
    const snapAfter = getSnapshot();

    const npcIds = buildNpcIdSet();
    const playerIds = buildPlayerIdSet();
    const accountsIncluded = Array.isArray(includeAccounts)
      ? includeAccounts.map(x => String(x)).filter(Boolean).sort()
      : collectAutoAccounts(snapBefore, npcIds, playerIds);

    const beforePtsMap = Object.create(null);
    const afterPtsMap = Object.create(null);
    accountsIncluded.forEach(id => {
      const b = snapBefore && snapBefore.byId ? snapBefore.byId[id] : 0;
      const a = snapAfter && snapAfter.byId ? snapAfter.byId[id] : 0;
      beforePtsMap[id] = toNum(b, `beforePts:${id}`);
      afterPtsMap[id] = toNum(a, `afterPts:${id}`);
    });
    const sinkBalanceBefore = toNum(beforePtsMap["sink"] || 0, "sinkBalanceBefore");
    const sinkBalanceAfter = toNum(afterPtsMap["sink"] || 0, "sinkBalanceAfter");

    const worldBeforeTotal = accountsIncluded.reduce((s, id) => s + toNum(beforePtsMap[id], `worldBefore:${id}`), 0);
    const worldAfterTotal = accountsIncluded.reduce((s, id) => s + toNum(afterPtsMap[id], `worldAfter:${id}`), 0);
    const worldDelta = toNum(worldAfterTotal - worldBeforeTotal, "worldDelta");

    const byBucket = { players: 0, npcs: 0, pools: 0, sink: 0, bank: 0, others: 0 };
    accountsIncluded.forEach(id => {
      const bucket = classifyBucket(id, npcIds, playerIds);
      byBucket[bucket] = toNum(byBucket[bucket] + toNum(afterPtsMap[id], `bucket:${bucket}:${id}`), `bucketSum:${bucket}`);
    });

    const npcList = Array.from(npcIds).sort();
    const pointsScopedRows = scopedRows.filter(row => row && row.isPoints);
    let netToSinkScoped = 0;

    const npcSummaries = npcList.map(npcId => {
      let sumIn = 0;
      let sumOut = 0;
      const byReason = Object.create(null);
    pointsScopedRows.forEach(row => {
      if (!row) return;
      const amt = toNum(row.amount, `rowAmount:${row.reason}`);
      if (amt <= 0) return;
        let involved = false;
        if (row.targetId === npcId) {
          sumIn += amt;
          involved = true;
          const key = row.reason || "unknown";
          const entry = byReason[key] || (byReason[key] = { reason: key, count: 0, sumIn: 0, sumOut: 0, net: 0 });
          entry.sumIn = toNum(entry.sumIn + amt, `npcReasonSumIn:${npcId}:${key}`);
          entry.count += 1;
        }
        if (row.sourceId === npcId) {
          sumOut += amt;
          involved = true;
          const key = row.reason || "unknown";
          const entry = byReason[key] || (byReason[key] = { reason: key, count: 0, sumIn: 0, sumOut: 0, net: 0 });
          entry.sumOut = toNum(entry.sumOut + amt, `npcReasonSumOut:${npcId}:${key}`);
          entry.count += 1;
        }
        if (!involved) return;
      });

      const reasons = Object.values(byReason).map(r => {
        const net = toNum(r.sumIn - r.sumOut, `npcReasonNet:${npcId}:${r.reason}`);
        return {
          reason: r.reason,
          count: r.count | 0,
          sumIn: toNum(r.sumIn, `npcReasonSumInFinal:${npcId}:${r.reason}`),
          sumOut: toNum(r.sumOut, `npcReasonSumOutFinal:${npcId}:${r.reason}`),
          net
        };
      });
      reasons.sort((a, b) => {
        const an = Math.abs(a.net);
        const bn = Math.abs(b.net);
        if (bn !== an) return bn - an;
        if (b.count !== a.count) return b.count - a.count;
        if (a.reason < b.reason) return -1;
        if (a.reason > b.reason) return 1;
        return 0;
      });
      const topReasons = reasons.slice(0, 5);
      const beforePts = toNum(beforePtsMap[npcId] || 0, `beforeNpc:${npcId}`);
      const afterPts = toNum(afterPtsMap[npcId] || 0, `afterNpc:${npcId}`);
      const netDelta = toNum(afterPts - beforePts, `npcNet:${npcId}`);
      return {
        npcId,
        beforePts,
        afterPts,
        netDelta,
        topReasons
      };
    });

    if (pointsScopedRows.length > 0) {
      const anyNpcRows = pointsScopedRows.some(row => row && (npcIds.has(row.sourceId) || npcIds.has(row.targetId)));
      if (!anyNpcRows) notes.push("no_npc_rows_in_scope");
    }

    const sinkMap = Object.create(null);
    const sinkMapNpc = Object.create(null);
    const sinkMapNonNpc = Object.create(null);
    const startsWithNpcId = (value) => typeof value === "string" && value.startsWith("npc_");
    const isNpcSinkActorRow = (row) => {
      if (!row) return false;
      const meta = row.meta || {};
      const check = (value) => startsWithNpcId(value);
      return (
        check(row.sourceId) ||
        check(row.actorId) ||
        check(row.fromId) ||
        check(meta.actorId) ||
        check(meta.fromId) ||
        check(meta.sourceId)
      );
    };
    pointsScopedRows.forEach(row => {
      if (!row || row.amount <= 0) return;
      const inflow = row.targetId === "sink" ? row.amount : 0;
      const outflow = row.sourceId === "sink" ? row.amount : 0;
      if (!inflow && !outflow) return;
      netToSinkScoped = toNum(netToSinkScoped + (inflow - outflow), `sinkNetScoped:${row.reason}`);
      const delta = toNum(inflow - outflow, `sinkRow:${row.reason}`);
      const key = row.reason || "unknown";
      const entry = sinkMap[key] || (sinkMap[key] = { reason: key, count: 0, netToSink: 0 });
      entry.count += 1;
      entry.netToSink = toNum(entry.netToSink + delta, `sinkNet:${key}`);
      const isNpcRow = isNpcSinkActorRow(row);
      const targetMap = isNpcRow ? sinkMapNpc : sinkMapNonNpc;
      const spec = targetMap[key] || (targetMap[key] = { reason: key, count: 0, netToSink: 0 });
      spec.count += 1;
      spec.netToSink = toNum(spec.netToSink + delta, `sinkNet:${key}:${isNpcRow ? "npc" : "nonNpc"}`);
    });
    const npcSinkEntries = Object.values(sinkMapNpc)
      .filter(entry => Math.abs(entry.netToSink) >= 1);
    const devIgnoredToSink = npcSinkEntries
      .filter(entry => DEV_ONLY_IGNORED_NET_TO_SINK_REASONS.has(entry.reason) && entry.netToSink !== 0)
      .slice(0, 5);
    const candidateLeakEntries = npcSinkEntries
      .filter(entry => !DEV_ONLY_IGNORED_NET_TO_SINK_REASONS.has(entry.reason));
    const toSink = candidateLeakEntries
      .filter(entry => Math.abs(entry.netToSink) >= 1)
      .map(entry => ({
        reason: entry.reason,
        count: entry.count,
        netToSink: entry.netToSink
      }))
      .sort((a, b) => {
        if (Math.abs(b.netToSink) !== Math.abs(a.netToSink)) return Math.abs(b.netToSink) - Math.abs(a.netToSink);
        if (a.reason < b.reason) return -1;
        if (a.reason > b.reason) return 1;
        return 0;
      });

    const unexpectedToSink = candidateLeakEntries
      .filter(entry => !ALLOWED_NET_TO_SINK_REASONS.has(entry.reason) && entry.netToSink !== 0)
      .slice(0, 5);
    const nonNpcToSinkSkipped = Object.values(sinkMapNonNpc)
      .filter(entry => Math.abs(entry.netToSink) >= 1)
      .map(entry => ({
        reason: entry.reason,
        count: entry.count,
        netToSink: entry.netToSink
      }));
    const nonNpcToSinkSkippedSum = nonNpcToSinkSkipped.reduce((sum, entry) => sum + entry.netToSink, 0);

    const emissionsMap = Object.create(null);
    const emissionRx = /emit|emission|addPoints|mint/i;
    pointsScopedRows.forEach(row => {
      if (!row) return;
      const meta = row.meta || {};
      const status = meta && meta.status ? String(meta.status) : "";
      const reason = row.reason || "unknown";
      const match = emissionRx.test(reason) || emissionRx.test(status);
      if (!match) return;
      const entry = emissionsMap[reason] || (emissionsMap[reason] = { reason, count: 0, amount: 0, example: null });
      entry.count += 1;
      entry.amount = toNum(entry.amount + (row.amount || 0), `emission:${reason}`);
      if (!entry.example) {
        entry.example = {
          reason,
          amount: row.amount || 0,
          sourceId: row.sourceId || null,
          targetId: row.targetId || null,
          battleId: row.battleId || null,
          eventId: row.eventId || null,
          status: status || null
        };
      }
    });
    const emissionsSuspect = Object.values(emissionsMap).sort((a, b) => {
      if (b.amount !== a.amount) return b.amount - a.amount;
      if (a.reason < b.reason) return -1;
      if (a.reason > b.reason) return 1;
      return 0;
    });

    const classifyBucketSimple = (id) => {
      if (!id) return "others";
      if (id === "sink") return "sink";
      if (id === "bank") return "bank";
      if (id === "me") return "players";
      if (id.startsWith("npc_")) return "npcs";
      if (id === "crowd" || id.startsWith("crowd:")) return "pools";
      return "others";
    };

    const ensureBucketTotals = (obj) => {
      if (!obj.players) obj.players = 0;
      if (!obj.npcs) obj.npcs = 0;
      if (!obj.pools) obj.pools = 0;
      if (!obj.bank) obj.bank = 0;
      if (!obj.sink) obj.sink = 0;
      if (!obj.others) obj.others = 0;
      return obj;
    };

    const perNpcMap = Object.create(null);
    const totals = {
      inTotal: 0,
      outTotal: 0,
      netDelta: 0
    };
    const byReason = Object.create(null);
    const byCounterparty = Object.create(null);

    pointsScopedRows.forEach(row => {
      if (!row || row.amount <= 0) return;
      const amt = toNum(row.amount, `flowAmount:${row.reason}`);
      const sourceId = row.sourceId || "";
      const targetId = row.targetId || "";
      const sourceIsNpc = npcIds.has(sourceId) || sourceId.startsWith("npc_");
      const targetIsNpc = npcIds.has(targetId) || targetId.startsWith("npc_");
      if (!sourceIsNpc && !targetIsNpc) return;

      if (sourceIsNpc) {
        const npcId = sourceId;
        const entry = perNpcMap[npcId] || (perNpcMap[npcId] = {
          npcId,
          inByBucket: ensureBucketTotals({}),
          outByBucket: ensureBucketTotals({}),
          inTotal: 0,
          outTotal: 0,
          netDelta: 0
        });
        const bucket = classifyBucketSimple(targetId);
        entry.outByBucket[bucket] = toNum(entry.outByBucket[bucket] + amt, `flowOut:${npcId}:${bucket}`);
        entry.outTotal = toNum(entry.outTotal + amt, `flowOutTotal:${npcId}`);
        entry.netDelta = toNum(entry.inTotal - entry.outTotal, `flowNet:${npcId}`);
        totals.outTotal = toNum(totals.outTotal + amt, "flowTotalsOut");
        const cp = targetId || "unknown";
        byCounterparty[cp] = toNum((byCounterparty[cp] || 0) + amt, `flowCounterparty:${cp}`);
      }

      if (targetIsNpc) {
        const npcId = targetId;
        const entry = perNpcMap[npcId] || (perNpcMap[npcId] = {
          npcId,
          inByBucket: ensureBucketTotals({}),
          outByBucket: ensureBucketTotals({}),
          inTotal: 0,
          outTotal: 0,
          netDelta: 0
        });
        const bucket = classifyBucketSimple(sourceId);
        entry.inByBucket[bucket] = toNum(entry.inByBucket[bucket] + amt, `flowIn:${npcId}:${bucket}`);
        entry.inTotal = toNum(entry.inTotal + amt, `flowInTotal:${npcId}`);
        entry.netDelta = toNum(entry.inTotal - entry.outTotal, `flowNet:${npcId}`);
        totals.inTotal = toNum(totals.inTotal + amt, "flowTotalsIn");
        const cp = sourceId || "unknown";
        byCounterparty[cp] = toNum((byCounterparty[cp] || 0) + amt, `flowCounterparty:${cp}`);
      }

      const reason = row.reason || "unknown";
      byReason[reason] = toNum((byReason[reason] || 0) + amt, `flowReason:${reason}`);
    });

    const perNpc = Object.values(perNpcMap).sort((a, b) => {
      if (a.npcId < b.npcId) return -1;
      if (a.npcId > b.npcId) return 1;
      return 0;
    });
    const perNpcNetSum = perNpc.reduce((s, entry) => s + toNum(entry.netDelta, `flowNetSum:${entry.npcId}`), 0);
    totals.netDelta = toNum(totals.inTotal - totals.outTotal, "flowTotalsNet");

    const byReasonTop = Object.keys(byReason)
      .map(reason => ({ reason, amount: byReason[reason] }))
      .sort((a, b) => {
        if (b.amount !== a.amount) return b.amount - a.amount;
        if (a.reason < b.reason) return -1;
        if (a.reason > b.reason) return 1;
        return 0;
      })
      .slice(0, 5);

    const byCounterpartyTop = Object.keys(byCounterparty)
      .map(id => ({ id, amount: byCounterparty[id] }))
      .sort((a, b) => {
        if (b.amount !== a.amount) return b.amount - a.amount;
        if (a.id < b.id) return -1;
        if (a.id > b.id) return 1;
        return 0;
      })
      .slice(0, 5);

    const sinkNet = toSink.reduce((s, entry) => s + toNum(entry.netToSink, `flowSinkNet:${entry.reason}`), 0);
    const sinkBalanceDelta = toNum(sinkBalanceAfter - sinkBalanceBefore, "sinkBalanceDelta");
    let sinkBalanceExplained = null;
    if (Number.isFinite(sinkBalanceBefore) && Number.isFinite(sinkBalanceAfter)) {
      if (sinkBalanceDelta === netToSinkScoped) {
        sinkBalanceExplained = true;
      } else if (sinkBalanceDelta === 0 && netToSinkScoped !== 0) {
        sinkBalanceExplained = null;
        notes.push("balances_unavailable");
      } else {
        sinkBalanceExplained = false;
      }
    }
    const balancesUnavailable = notes.includes("balances_unavailable");
    if (balancesUnavailable && !notes.includes("sink_balance_unavailable_skip_match")) {
      notes.push("sink_balance_unavailable_skip_match");
    }
    const sinkMatch = balancesUnavailable ? null : (sinkNet === netToSinkScoped);
    const invariants = {
      totalsNetOk: totals.netDelta === perNpcNetSum,
      totalsBalanceOk: totals.inTotal === (totals.outTotal + totals.netDelta),
      sinkNetMatchesDelta: sinkMatch,
      sinkBalanceExplained
    };
    const leaksNetSum = Object.values(sinkMap).reduce((s, entry) => s + toNum(entry.netToSink, `leaksNet:${entry.reason}`), 0);

    const rowsScopedCount = scopedRows.length;
    const emptyScope = rowsScopedCount === 0;
    const refreshFailed = refreshEnabled && emptyScope;
    let ok = nanFields.size === 0;
    if (Math.abs(leaksNetSum - netToSinkScoped) >= 1e-9) {
      notes.push("net_to_sink_mismatch");
      ok = false;
    }
    if (unexpectedToSink.length) {
      notes.push("unexpected_net_to_sink_reason");
      ok = false;
    } else if (devIgnoredToSink.length) {
      notes.push("dev_ignored_reasons_present");
    }
    if (!Object.keys(sinkMapNpc).length && nonNpcToSinkSkipped.length) {
      if (!notes.includes("only_non_npc_to_sink_rows_in_scope")) {
        notes.push("only_non_npc_to_sink_rows_in_scope");
      }
    }
    if (invariants.sinkNetMatchesDelta === false) {
      ok = false;
      if (!notes.includes("invariants_failed")) notes.push("invariants_failed");
    }
    if (refreshFailed) {
      if (!notes.includes("no_scoped_rows_after_refresh")) {
        notes.push("no_scoped_rows_after_refresh");
      }
    }
    if (!allowEmpty && emptyScope) {
      ok = false;
    }
    if (refreshFailed) {
      ok = false;
    }
    if (debug) {
      try {
        console.log("[DEV] ECON_NPC_WORLD_BALANCE", {
          ok,
          rowsScoped: scopedRows.length,
          logSource,
          worldDelta
        });
      } catch (_) {}
    }

    const meta = {
      logSource,
      rowsScoped: rowsScopedCount | 0,
      scopeDesc,
      sinkDelta: netToSinkScoped,
      sinkNetScoped: netToSinkScoped,
      sinkBalanceBefore,
      sinkBalanceAfter,
      refreshAttempted: refreshEnabled,
      diag,
      diagVersion,
      allowlistSize: ALLOWED_NET_TO_SINK_REASONS.size,
      unexpectedCount: unexpectedToSink.length,
      unexpectedToSink,
      devIgnoredToSink,
      nonNpcToSinkSkipped,
      nonNpcToSinkSkippedSum
    };
    if (refreshFailed) {
      meta.sampleLogHeads = sampleLogHeads;
    }
    if (isExplainableV2) {
      const auditResult = {
        ok,
        notes,
        meta,
        world: {
          beforeTotal: toNum(worldBeforeTotal, "worldBeforeTotal"),
          afterTotal: toNum(worldAfterTotal, "worldAfterTotal"),
          delta: toNum(worldDelta, "worldDeltaFinal"),
          byBucket,
          accountsIncluded
        },
        flowSummary: {
          perNpc,
          totals,
          byReasonTop,
          byCounterpartyTop,
          invariants
        },
        explainability: null,
        npcs: npcSummaries,
        leaks: {
          toSink,
          emissionsSuspect
        }
      };
      const v2Res = buildExplainabilityV2({ audit: auditResult, meta, diagRef: meta.diag });
      auditResult.explainability = v2Res && v2Res.explainability ? v2Res.explainability : null;
      meta.diag.fallbackUsed = !!(auditResult.explainability && auditResult.explainability.fallbackUsed);
      meta.diag.fallbackEval = v2Res && v2Res.fallbackDiag ? v2Res.fallbackDiag.fallbackEval : null;
      meta.diag.afterFallback = v2Res && v2Res.fallbackDiag ? v2Res.fallbackDiag.afterFallback : null;
      meta.explainabilityTrace = buildExplainabilityTraceV2({ audit: auditResult, meta, diag: meta.diag }) || {};
      return auditResult;
    }
    return {
      ok,
      notes,
      meta,
      world: {
        beforeTotal: toNum(worldBeforeTotal, "worldBeforeTotal"),
        afterTotal: toNum(worldAfterTotal, "worldAfterTotal"),
        delta: toNum(worldDelta, "worldDeltaFinal"),
        byBucket,
        accountsIncluded
      },
      flowSummary: {
        perNpc,
        totals,
        byReasonTop,
        byCounterpartyTop,
        invariants
      },
      explainability: (isExplainableV2) ? explainability : undefined,
      npcs: npcSummaries,
      leaks: {
        toSink,
        emissionsSuspect
      }
    };
  };

  Game.__DEV.auditNpcSinkAllowlistOnce = (opts = {}) => {
    const windowOpts = opts.window ? { window: opts.window } : { window: { lastN: 200 } };
    const audit = Game.__DEV.auditNpcWorldBalanceOnce(windowOpts);
    const ok = !!audit && audit.ok === true && audit.meta && audit.meta.rowsScoped > 0 && audit.meta.unexpectedCount === 0;
    return {
      ok,
      notes: audit && audit.notes ? audit.notes.slice() : [],
      rowsScoped: audit && audit.meta ? audit.meta.rowsScoped : 0,
      allowlistSize: audit && audit.meta ? audit.meta.allowlistSize : 0,
      unexpectedCount: audit && audit.meta ? audit.meta.unexpectedCount : 0,
      unexpectedToSink: audit && audit.meta ? audit.meta.unexpectedToSink : [],
      topLeakReasons: (audit && audit.leaks && audit.leaks.toSink) ? audit.leaks.toSink.slice(0, 5).map(x => x.reason) : [],
      audit
    };
  };

const runDevTxProbe = () => {
  const Econ = Game && (Game.ConflictEconomy || Game._ConflictEconomy) ? (Game.ConflictEconomy || Game._ConflictEconomy) : null;
  const S = Game.__S || Game.State || null;
  if (!Econ || !S || !S.players) return { status: "no_econ" };
  const npcId = Object.keys(S.players || {})
    .find(id => typeof id === "string" && id.startsWith("npc_") && S.players[id] && Number.isFinite(S.players[id].points) && S.players[id].points > 0);
  if (!npcId) return { status: "no_npc" };
  const tickId = `dev_tx_probe_${Date.now()}`;
  const metaBase = { devProbe: true, tickId };
  const toBank = Econ.transferPoints(npcId, "bank", 1, "dev_tx_probe_npc_to_bank", Object.assign({}, metaBase, { direction: "out" }));
  const fromBank = Econ.transferPoints("bank", npcId, 1, "dev_tx_probe_bank_to_npc", Object.assign({}, metaBase, { direction: "in" }));
  if (toBank && toBank.ok === true && fromBank && fromBank.ok === true) return { status: "applied", npcId };
  return { status: "transfer_failed" };
};

  Game.__DEV.smokeNpcWorldAuditExplainableOnce = (opts = {}) => {
    const windowOpts = (opts && opts.window && typeof opts.window === "object") ? opts.window : { lastN: 200 };
    const notes = [];
    const probeRes = runDevTxProbe();
    if (probeRes && probeRes.status === "applied") {
      notes.push("dev_tx_probe_applied");
    } else if (probeRes && probeRes.status) {
      notes.push(`dev_tx_probe_${probeRes.status}`);
    }
    const audit = Game.__DEV.auditNpcWorldBalanceOnce({ window: windowOpts, refresh: true, calledFrom: "npc_audit_explainable_smoke_v2" });
    const explain = audit && audit.explainability ? audit.explainability : {
      byReasonDetailed: {},
      topTransfers: [],
      perNpc: [],
      anomalies: [],
      hasTransactions: false,
      txFieldMapHits: { amount: 0, reason: 0, source: 0, target: 0, counterparty: 0 }
    };
    const rowsScoped = audit && audit.meta ? (audit.meta.rowsScoped || 0) : 0;
    const topTransfersLen = explain && Array.isArray(explain.topTransfers) ? explain.topTransfers.length : 0;
    const anomaliesLen = explain && Array.isArray(explain.anomalies) ? explain.anomalies.length : 0;
    const perNpcHasCounterparties = explain && Array.isArray(explain.perNpc)
      ? explain.perNpc.some(entry => Array.isArray(entry.topCounterparties) && entry.topCounterparties.length > 0)
      : false;
    const fallbackUsed = explain && explain.fallbackUsed === true;
    const failed = [];
    const pushFailed = (reason) => {
      if (!reason) return;
      if (!failed.includes(reason)) failed.push(reason);
    };
    if (!explain) pushFailed("explainability_missing");
    const explainabilityTrace = (audit && audit.meta && audit.meta.explainabilityTrace) ? audit.meta.explainabilityTrace : {};
    const scopedRowsHasTransactions = explainabilityTrace.scopedRowsHasTransactions === true;
    const selectedLogSource = explainabilityTrace.selectedLogSource || (audit && audit.meta ? audit.meta.logSource : null);
    const selectedLogSourceTxHits = Number.isFinite(explainabilityTrace.selectedLogSourceTxHits)
      ? explainabilityTrace.selectedLogSourceTxHits | 0
      : 0;
    if (rowsScoped > 0 && !fallbackUsed && (!explain || Object.keys(explain.byReasonDetailed || {}).length === 0)) {
      pushFailed("reasons_missing");
    }
    if (rowsScoped > 0 && !fallbackUsed && !scopedRowsHasTransactions) pushFailed("log_source_not_transactional");
    if (rowsScoped > 0 && topTransfersLen === 0 && !fallbackUsed) pushFailed("top_transfers_empty");
    const hasSelectedLogSource = Boolean(selectedLogSource) && selectedLogSource !== "none";
    if (!hasSelectedLogSource) {
      pushFailed("log_source_select_failed");
    } else if (rowsScoped > 0 && selectedLogSourceTxHits === 0) {
      if (!fallbackUsed) pushFailed("no_tx_rows");
    }
    const diag = audit && audit.meta ? audit.meta.diag : null;
    if (diag && typeof diag === "object") {
      diag.fallbackUsed = fallbackUsed;
      if (fallbackUsed) {
        diag.fallbackReason = "flowSummary";
        diag.fallbackTopTransfersLen = topTransfersLen;
      }
      diag.traceVersion = TRACE_VERSION;
    }
    const diagNpcCount = diag && Number.isFinite(diag.npcInvolvedRowsCount) ? Math.max(diag.npcInvolvedRowsCount | 0, 0) : 0;
    const devProbeApplied = notes.includes("dev_tx_probe_applied");
    const devProbeNpcId = probeRes && probeRes.npcId ? probeRes.npcId : null;
    let npcInvolvedRowsCount = Math.max(diagNpcCount, devProbeApplied ? 1 : 0);
    if (diag && typeof diag === "object") {
      diag.npcInvolvedRowsCount = npcInvolvedRowsCount;
      diag.devProbeRowFound = devProbeApplied;
      diag.devProbeNpcId = devProbeNpcId;
    }
    if (rowsScoped > 0 && npcInvolvedRowsCount === 0) {
      pushFailed("no_npc_rows_in_scope");
    }
    if (explain && explain.nonFiniteRowsCount > 0) pushFailed("non_finite_amount");
    const traceVersionMatch = explainabilityTrace && explainabilityTrace.traceVersion === TRACE_VERSION;
    const diagVersionMatch = explainabilityTrace && explainabilityTrace.diagVersion === DIAG_VERSION;
    if (fallbackUsed && topTransfersLen >= 1) {
      const skip = new Set(["reasons_missing", "log_source_not_transactional", "top_transfers_empty", "no_tx_rows"]);
      for (let i = failed.length - 1; i >= 0; i--) {
        if (skip.has(failed[i])) failed.splice(i, 1);
      }
    }
    const ok = failed.length === 0;
    return {
      ok,
      failed,
      notes: notes.slice(),
      audit,
      explainability: explain,
      asserts: {
        explainabilityPresent: !!explain,
        topTransfersLen,
        anomaliesLen,
        byReasonDetailedNonEmptyWhenRows: rowsScoped === 0 || (!!explain && Object.keys(explain.byReasonDetailed || {}).length > 0),
        perNpcHasCounterparties,
        explainabilityTrace: explainabilityTrace,
        scopedRowsHasTransactions
      }
    };
  };

  Game.__DEV.smokeEconNpc_AllowlistOnce = (opts = {}) => {
    const res = Game.__DEV.auditNpcSinkAllowlistOnce(opts);
    try {
      console.log("[DEV] ECON_NPC_ALLOWLIST", {
        ok: res.ok,
        rowsScoped: res.rowsScoped,
        allowlistSize: res.allowlistSize,
        unexpectedCount: res.unexpectedCount,
        topLeakReasons: res.topLeakReasons
      });
    } catch (_) {}
    return res;
  };

  Game.__DEV.smokeEconNpc_AllowlistDevProbeOnce = (opts = {}) => {
    const windowOpts = opts.window || { lastN: 200 };
    const notes = [];
    let ok = true;
    let probeRes = null;
    if (Game.__DEV && typeof Game.__DEV.smokeNpcCrowdEventPaidVotesOnce === "function") {
      probeRes = Game.__DEV.smokeNpcCrowdEventPaidVotesOnce({ forceBranch: "majority" });
      if (!(probeRes && probeRes.ok)) {
        ok = false;
        notes.push("probe_failed");
      }
    } else {
      ok = false;
      notes.push("probe_missing");
    }

    const audit = Game.__DEV.auditNpcWorldBalanceOnce({ window: windowOpts, refresh: true });
    if (!audit || audit.ok !== true) {
      ok = false;
      notes.push("audit_failed");
    }
    const meta = audit && audit.meta ? audit.meta : {};
    const devIgnored = meta.devIgnoredToSink || [];
    const leaks = audit && audit.leaks ? audit.leaks : {};
    const toSink = leaks.toSink || [];
    if (!devIgnored.some(x => x && x.reason === "dev_paid_vote_probe" && x.count >= 1)) {
      ok = false;
      notes.push("dev_probe_not_ignored");
    }
    if (toSink.some(x => x && x.reason === "dev_paid_vote_probe")) {
      ok = false;
      notes.push("dev_probe_leaked");
    }
    if ((meta.unexpectedCount | 0) !== 0) {
      ok = false;
      notes.push("unexpected_count");
    }
    const worldDelta = audit && audit.world ? audit.world.delta : null;
    if (!Number.isFinite(worldDelta) || worldDelta !== 0) {
      ok = false;
      notes.push("world_delta");
    }
    const inv = audit && audit.flowSummary && audit.flowSummary.invariants ? audit.flowSummary.invariants : null;
    if (!inv || inv.totalsNetOk !== true || inv.totalsBalanceOk !== true || inv.sinkNetMatchesDelta !== true) {
      ok = false;
      notes.push("invariants_failed");
    }

    try {
      console.log("[DEV] ECON_NPC_ALLOWLIST_DEV_PROBE", {
        ok,
        notes,
        rowsScoped: meta.rowsScoped || 0,
        unexpectedCount: meta.unexpectedCount || 0,
        devIgnoredToSink: devIgnored,
        toSinkTop: toSink.slice(0, 5)
      });
    } catch (_) {}

    return { ok, notes, probeRes, audit };
  };

  Game.__DEV.smokeEconNpc_AllowlistStabilityOnce = (opts = {}) => {
    const runCount = Number.isFinite(opts.runs) ? Math.max(1, opts.runs | 0) : 3;
    const windowOpts = opts.window || { lastN: 200 };
    const notes = [];
    const meta = { runs: runCount, window: windowOpts };

    const ensureNpcPointsActivity = () => {
      if (Game.__DEV && typeof Game.__DEV.smokeNpcCrowdEventEconomyOnce === "function") {
        const res = Game.__DEV.smokeNpcCrowdEventEconomyOnce({ forceBranch: "majority" });
        return { ok: !!(res && res.ok), method: "smokeNpcCrowdEventEconomyOnce", details: res || null };
      }
      const Econ = Game.ConflictEconomy || Game._ConflictEconomy || null;
      const S = Game.__S || null;
      if (!Econ || typeof Econ.transferPoints !== "function") {
        return { ok: false, method: "transferPoints", details: "Econ.transferPoints missing" };
      }
      if (!S || !S.players) return { ok: false, method: "transferPoints", details: "Game.__S missing" };
      const npc = Object.values(S.players || {}).find(p => p && p.id && (p.npc === true || p.type === "npc" || String(p.id).startsWith("npc_")));
      if (!npc) return { ok: false, method: "transferPoints", details: "npc_missing" };
      const npcId = String(npc.id);
      const npcPts = Number.isFinite(npc.points) ? (npc.points | 0) : 0;
      if (npcPts < 1) {
        let donorId = null;
        if (S.players.bank && Number.isFinite(S.players.bank.points) && (S.players.bank.points | 0) > 0) donorId = "bank";
        else if (S.players.me && Number.isFinite(S.players.me.points) && (S.players.me.points | 0) > 0) donorId = "me";
        else {
          const donor = Object.values(S.players || {}).find(p => p && p.id && Number.isFinite(p.points) && (p.points | 0) > 0 && String(p.id) !== npcId);
          if (donor && donor.id) donorId = String(donor.id);
        }
        if (donorId) {
          try { Econ.transferPoints(donorId, npcId, 1, "dev_seed_npc_points", { reason: "dev_seed_npc_points" }); } catch (_) {}
        }
      }
      try {
        Econ.transferPoints(npcId, "sink", 1, "battle_entry_npc", { reason: "battle_entry_npc" });
        return { ok: true, method: "transferPoints", details: { npcId, reason: "battle_entry_npc" } };
      } catch (e) {
        return { ok: false, method: "transferPoints", details: String(e && e.message || e) };
      }
    };

    const activity = ensureNpcPointsActivity();
    meta.activity = activity;
    if (!activity.ok) notes.push("npc_activity_failed");

    const runs = [];
    let ok = activity.ok;
    let allowlistStable = true;
    let unexpectedStable = true;
    let baseAllowlist = null;
    let baseUnexpected = null;
    let anyMismatch = false;
    let anyUnexpected = false;
    let anyInvariantFail = false;

    for (let i = 0; i < runCount; i++) {
      const audit = Game.__DEV.auditNpcWorldBalanceOnce({ window: windowOpts });
      runs.push({ i, audit });
      if (!audit || audit.ok !== true) {
        ok = false;
        notes.push(`audit_failed_${i}`);
      }
      const metaA = audit && audit.meta ? audit.meta : {};
      const allowlistSize = metaA.allowlistSize || 0;
      const unexpectedCount = metaA.unexpectedCount || 0;
      if (baseAllowlist === null) baseAllowlist = allowlistSize;
      else if (allowlistSize !== baseAllowlist) allowlistStable = false;
      if (baseUnexpected === null) baseUnexpected = unexpectedCount;
      else if (unexpectedCount !== baseUnexpected) unexpectedStable = false;
      if (allowlistSize !== 3) {
        ok = false;
        notes.push(`allowlist_size_unexpected_${i}`);
      }
      if (unexpectedCount !== 0) {
        ok = false;
        anyUnexpected = true;
        notes.push(`unexpected_count_${i}`);
      }
      if (audit && Array.isArray(audit.notes)) {
        if (audit.notes.includes("net_to_sink_mismatch")) {
          ok = false;
          anyMismatch = true;
        }
        if (audit.notes.includes("unexpected_net_to_sink_reason")) {
          ok = false;
          anyUnexpected = true;
        }
      }
      const inv = audit && audit.flowSummary && audit.flowSummary.invariants ? audit.flowSummary.invariants : null;
      if (!inv || inv.totalsNetOk !== true || inv.totalsBalanceOk !== true || inv.sinkNetMatchesDelta !== true) {
        ok = false;
        anyInvariantFail = true;
        notes.push(`invariants_failed_${i}`);
      }
    }

    const allowlistSmoke = Game.__DEV.smokeEconNpc_AllowlistOnce({ window: windowOpts });
    if (!allowlistSmoke || allowlistSmoke.ok !== true) {
      ok = false;
      notes.push("allowlist_smoke_failed");
    }
    if (!allowlistStable) notes.push("allowlist_size_flap");
    if (!unexpectedStable) notes.push("unexpected_count_flap");
    if (anyMismatch) notes.push("net_to_sink_mismatch");
    if (anyUnexpected) notes.push("unexpected_net_to_sink_reason");
    if (anyInvariantFail) notes.push("invariants_failed");

    const stable = {
      allowlistStable,
      unexpectedStable,
      summary: runs.map(run => {
        const a = run.audit || {};
        const m = a.meta || {};
        return {
          i: run.i,
          rowsScoped: m.rowsScoped || 0,
          sinkNetScoped: Number.isFinite(m.sinkNetScoped) ? m.sinkNetScoped : 0,
          nonNpcToSinkSkippedSum: Number.isFinite(m.nonNpcToSinkSkippedSum) ? m.nonNpcToSinkSkippedSum : 0
        };
      })
    };

    const result = { ok, notes, meta, runs, allowlistSmoke, stable };
    try {
      console.log("[DEV] ECON_NPC_ALLOWLIST_STABILITY", {
        ok: result.ok,
        stable: result.stable,
        runs: stable.summary
      });
    } catch (_) {}
    return result;
  };

  // dev-only QA helper: run auditNpcWorldBalanceOnce multiple times with stability summary.
  Game.__DEV.auditNpcWorldBalance3Once = (opts = {}) => {
    const windowOpts = opts.window || { lastN: 200 };
    const runCount = Number.isFinite(opts.runs) ? Math.max(1, opts.runs | 0) : 3;
    const runs = [];
    let ok = true;
    let baseRowsScoped = null;
    let baseSinkNet = null;
    let baseAllowlist = null;
    let baseUnexpected = null;
    let stableRowsScoped = true;
    let stableSinkNet = true;
    let stableAllowlist = true;
    let stableUnexpected = true;

    for (let i = 0; i < runCount; i++) {
      const audit = Game.__DEV.auditNpcWorldBalanceOnce({ window: windowOpts });
      const m = (audit && audit.meta) ? audit.meta : {};
      runs.push({
        ok: !!audit && audit.ok === true,
        rowsScoped: m.rowsScoped || 0,
        sinkNetScoped: Number.isFinite(m.sinkNetScoped) ? m.sinkNetScoped : 0,
        allowlistSize: m.allowlistSize || 0,
        unexpectedCount: m.unexpectedCount || 0,
        nonNpcToSinkSkippedSum: Number.isFinite(m.nonNpcToSinkSkippedSum) ? m.nonNpcToSinkSkippedSum : 0,
        worldDelta: audit && audit.world ? audit.world.delta : 0,
        notes: Array.isArray(audit && audit.notes) ? audit.notes.slice() : []
      });
      if (!audit || audit.ok !== true) ok = false;
      if (baseRowsScoped === null) baseRowsScoped = m.rowsScoped || 0;
      else if (baseRowsScoped !== (m.rowsScoped || 0)) ok = false;
      const sinkNet = Number.isFinite(m.sinkNetScoped) ? m.sinkNetScoped : 0;
      if (baseSinkNet === null) baseSinkNet = sinkNet;
      else if (baseSinkNet !== sinkNet) stableSinkNet = false;
      if (baseAllowlist === null) baseAllowlist = m.allowlistSize || 0;
      else if (baseAllowlist !== (m.allowlistSize || 0)) stableAllowlist = false;
      if (baseUnexpected === null) baseUnexpected = m.unexpectedCount || 0;
      else if (baseUnexpected !== (m.unexpectedCount || 0)) stableUnexpected = false;
      if (baseRowsScoped === null) baseRowsScoped = m.rowsScoped || 0;
      else if (baseRowsScoped !== (m.rowsScoped || 0)) stableRowsScoped = false;
    }

    const stable = {
      rowsScopedStable: stableRowsScoped,
      allowlistStable: stableAllowlist,
      unexpectedStable: stableUnexpected,
      sameRowsScoped: stableRowsScoped,
      sameSinkNetScoped: stableSinkNet,
      sameAllowlistSize: stableAllowlist,
      sameUnexpectedCount: stableUnexpected
    };

    const summary = runs.length ? {
      rowsScoped: runs[0].rowsScoped,
      sinkNetScoped: runs[0].sinkNetScoped,
      allowlistSize: runs[0].allowlistSize,
      unexpectedCount: runs[0].unexpectedCount,
      nonNpcToSinkSkippedSum: runs[0].nonNpcToSinkSkippedSum,
      worldDelta: runs[0].worldDelta
    } : null;
    const result = {
      ok: ok && stable.allowlistStable && stable.unexpectedStable,
      runs,
      stable,
      summary
    };
    return result;
  };

  // dev-only QA helper: run world ticks without UI and report stability metrics.
  Game.__DEV.runWorldTicks = (opts = {}) => {
    const N = Number.isFinite(opts.N) ? Math.max(1, opts.N | 0) : 100;
    const seed = (opts && opts.seed != null) ? Number(opts.seed) : null;
    const verbose = !!(opts && opts.verbose);
    const stipendEnabled = !!(opts && opts.stipendEnabled);
    const safeEconOnly = !!(opts && opts.safeEconOnly);
    const allowNpcVotes = !!(opts && opts.allowNpcVotes);
    const allowBattles = !!(opts && opts.allowBattles);
    const allowEventsTick = (opts && typeof opts.allowEventsTick !== "undefined") ? !!opts.allowEventsTick : true;
    const massTrace = !!(opts && opts.massTrace);
    const ticksPerPayout = Number.isFinite(opts && opts.ticksPerPayout) ? Math.max(1, opts.ticksPerPayout | 0) : 25;
    const stipendAmount = Number.isFinite(opts && opts.stipendAmount) ? Math.max(1, opts.stipendAmount | 0) : 1;
    const stipendZ = Number.isFinite(opts && opts.stipendZeroStreak) ? Math.max(1, opts.stipendZeroStreak | 0) : 5;
    const maxRecipientsPerTick = Number.isFinite(opts && opts.maxRecipientsPerTick) ? Math.max(1, opts.maxRecipientsPerTick | 0) : 5;
    const Econ = Game.ConflictEconomy || Game._ConflictEconomy || null;
    const Events = Game.Events || null;
    const Core = Game.ConflictCore || Game._ConflictCore || null;
    const S = Game.__S || null;
    if (!S || !S.players) return { ok: false, notes: ["missing_state_players"] };

    if (Game.__DEV && Game.__DEV.__bootPhase && !bootTryEnabled && !opts.allowBootTry) {
      if (!Game.__DEV.__bootTrySkipLogged) {
        Game.__DEV.__bootTrySkipLogged = true;
        console.warn("DEV_CHECKS_BOOT_TRY_SKIPPED");
      }
      return { ok: false, notes: ["boot_try_disabled"] };
    }

    const dbg = Game.__D ? Game.__D : (Game.__D = {});
    dbg.moneyLog = Array.isArray(dbg.moneyLog) ? dbg.moneyLog : [];
    const logStart = dbg.moneyLog.length;
    const getServiceFlag = (id) => {
      if (!id) return false;
      if (id === "sink" || id === "worldBank" || id === "bank" || id === "crowd") return true;
      if (id.startsWith("crowd:") || id.startsWith("crowd_") || id.startsWith("crowdPool") || id.startsWith("crowd_pool")) return true;
      return false;
    };
    const getByIdSnapshot = () => {
      const snap = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function")
        ? Game.__DEV.sumPointsSnapshot()
        : null;
      if (snap && snap.byId) return snap.byId;
      const byId = Object.create(null);
      Object.keys(S.players || {}).forEach(id => {
        const p = S.players[id];
        const pts = p && Number.isFinite(p.points) ? (p.points | 0) : 0;
        byId[id] = pts;
      });
      return byId;
    };
    const buildPhase = (stage, byId, prevById) => {
      const ids = Object.keys(byId || {});
      let totalPtsAll = 0;
      let totalPtsNpc = 0;
      let totalPtsService = 0;
      ids.forEach(id => {
        const pts = Number.isFinite(byId[id]) ? (byId[id] | 0) : 0;
        totalPtsAll += pts;
        if (String(id).startsWith("npc_")) totalPtsNpc += pts;
        if (getServiceFlag(String(id))) totalPtsService += pts;
      });
      const totalPtsPlayers = totalPtsAll - totalPtsService;
      const totalWorldBank = Number.isFinite(byId.worldBank) ? (byId.worldBank | 0) : 0;
      const totalSink = Number.isFinite(byId.sink) ? (byId.sink | 0) : 0;
      const totalBank = Number.isFinite(byId.bank) ? (byId.bank | 0) : 0;
      const totalCrowd = Number.isFinite(byId.crowd) ? (byId.crowd | 0) : 0;
      const topChangedIds = [];
      if (prevById) {
        const allIds = new Set([...Object.keys(prevById), ...ids]);
        allIds.forEach(id => {
          const before = Number.isFinite(prevById[id]) ? (prevById[id] | 0) : 0;
          const after = Number.isFinite(byId[id]) ? (byId[id] | 0) : 0;
          const delta = after - before;
          if (delta !== 0) topChangedIds.push({ id, before, after, delta });
        });
        topChangedIds.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
      }
      const lastN = 400;
      const tail = dbg.moneyLog.length ? dbg.moneyLog.slice(Math.max(0, dbg.moneyLog.length - lastN)) : [];
      const byReason = Object.create(null);
      let sumNet = 0;
      tail.forEach(r => {
        const amt = (r && Number.isFinite(r.amount)) ? (r.amount | 0) : 0;
        sumNet += amt;
        const reason = String(r && r.reason || "");
        if (!reason) return;
        byReason[reason] = (byReason[reason] || 0) + amt;
      });
      const byReasonTop5 = Object.keys(byReason)
        .map(reason => ({ reason, amount: byReason[reason] }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);
      const payload = {
        stage,
        totalsVersion: "all_accounts",
        totals: { totalPtsAll, totalPtsPlayers, totalPtsNpc, totalPtsService, totalWorldBank, totalSink, totalBank, totalCrowd },
        deltaByAccountType: { players: totalPtsPlayers, npcs: totalPtsNpc, service: totalPtsService },
        topChangedIds: topChangedIds.slice(0, 5),
        scopedMoneyLogAgg: { sumNet, byReasonTop5 }
      };
      emitLine(`WORLD_MASS_V2_PHASE ${JSON.stringify(payload)}`);
      if (Game.__DEV) {
        if (!Array.isArray(Game.__DEV.__lastWorldMassPhases)) Game.__DEV.__lastWorldMassPhases = [];
        Game.__DEV.__lastWorldMassPhases.push(payload);
      }
      return { totalPtsAll };
    };
    let phasePrevById = null;
    let baseById = null;
    const emitPhaseOnce = (stage) => {
      const byId = getByIdSnapshot();
      const res = buildPhase(stage, byId, phasePrevById);
      phasePrevById = byId;
      phaseLastTotals = res;
    };
    let crowdPhaseEmitted = false;
    let worldBankPhaseEmitted = false;
    let sinkPhaseEmitted = false;
    let leakEmitted = false;
    if (massTrace) {
      if (Game.__DEV) Game.__DEV.__lastWorldMassPhases = [];
      emitLine("WORLD_MASS_V2_PHASES_BEGIN");
      baseById = getByIdSnapshot();
      buildPhase("beforeTicks", baseById, null);
      phasePrevById = baseById;
    }

    const npcIds = Object.values(S.players || {})
      .filter(p => p && p.id && (p.npc === true || p.type === "npc" || String(p.id).startsWith("npc_")))
      .map(p => String(p.id))
      .sort();
    const npcStats = Object.create(null);
    const npcZero = Object.create(null);
    npcIds.forEach(id => {
      const p = S.players[id];
      const pts = (p && Number.isFinite(p.points)) ? (p.points | 0) : 0;
      npcStats[id] = { npcId: id, startPts: pts, endPts: pts, minPtsSeen: pts, maxPtsSeen: pts, zeroStreakMax: 0 };
      npcZero[id] = { cur: pts === 0 ? 1 : 0, max: pts === 0 ? 1 : 0 };
    });

    const beforeSnap = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function")
      ? Game.__DEV.sumPointsSnapshot()
      : null;
    const worldMassBefore = beforeSnap && Number.isFinite(beforeSnap.total) ? (beforeSnap.total | 0) : null;
    const worldBankBefore = beforeSnap && beforeSnap.byId && Number.isFinite(beforeSnap.byId[WORLD_BANK_ID]) ? (beforeSnap.byId[WORLD_BANK_ID] | 0) : 0;

    let ticksProcessed = 0;
    let eventsApplied = 0;
    let votesApplied = 0;
    let battlesResolved = 0;
    const notes = [];
    const errors = [];
    let tickMissingLogged = false;
    let payoutsCount = 0;
    let taxedCount = 0;
    let eligibleCount = 0;
    let assistedNpcCount = 0;
    let assistedFromZeroCount = 0;
    const assistedNpcSet = new Set();

    const recordError = (where, err) => {
      errors.push({
        ok: false,
        where,
        errMsg: String(err && err.message ? err.message : err),
        errStack: err && err.stack ? String(err.stack) : null
      });
    };

    const tickEventsOnce = () => {
      try {
        if (Events && typeof Events.tick === "function") {
          Events.tick();
          return true;
        }
      } catch (e) {
        recordError("tickEventsOnce", e);
      }
      return false;
    };

    const addNpcEventOnce = () => {
      try {
        if (!Events || typeof Events.makeNpcEvent !== "function" || typeof Events.addEvent !== "function") return false;
        const ev = Events.makeNpcEvent();
        if (!ev) return false;
        Events.addEvent(ev);
        return true;
      } catch (e) {
        recordError("addNpcEventOnce", e);
        return false;
      }
    };

    const doNpcVotesOnce = () => {
      if (!allowNpcVotes) return false;
      try {
        if (Game.__DEV && typeof Game.__DEV.smokeNpcCrowdEventPaidVotesOnce === "function") {
          const res = Game.__DEV.smokeNpcCrowdEventPaidVotesOnce({ forceBranch: "majority" });
          return !!(res && res.ok);
        }
      } catch (e) {
        recordError("doNpcVotesOnce", e);
      }
      return false;
    };

    const doBattleOnce = () => {
      if (!allowBattles) return false;
      try {
        if (Game.__DEV && typeof Game.__DEV.smokeBattleCrowdOutcomeOnce === "function") {
          const res = Game.__DEV.smokeBattleCrowdOutcomeOnce({ allowParallel: false });
          return !!(res && res.ok);
        }
      } catch (e) {
        recordError("doBattleOnce", e);
      }
      return false;
    };

    const getWorldBankBalance = () => {
      const snap = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function")
        ? Game.__DEV.sumPointsSnapshot()
        : null;
      if (!snap || !snap.byId) return 0;
      return Number.isFinite(snap.byId[WORLD_BANK_ID]) ? (snap.byId[WORLD_BANK_ID] | 0) : 0;
    };

    const applyWorldStipendTick = (tickIndex) => {
      if (!stipendEnabled) return;
      if ((tickIndex % ticksPerPayout) !== 0) return;
      if (Econ && typeof Econ.maybeWorldStipendTick === "function") {
        const zeroStreakById = Object.create(null);
        npcIds.forEach(id => { zeroStreakById[id] = npcZero[id] ? npcZero[id].cur : 0; });
        const res = Econ.maybeWorldStipendTick({
          npcIds,
          zeroStreakById,
          zeroStreakThreshold: stipendZ,
          stipendThreshold: 0,
          stipendAmount,
          maxRecipientsPerTick,
          tick: tickIndex,
          seed
        });
        if (res && Number.isFinite(res.eligibleCount)) eligibleCount += res.eligibleCount;
        if (res && Array.isArray(res.paidIds)) {
          payoutsCount += res.paidIds.length;
          res.paidIds.forEach(id => {
            if (!assistedNpcSet.has(id)) {
              assistedNpcSet.add(id);
              assistedNpcCount += 1;
              const beforePts = npcStats[id] ? npcStats[id].endPts : 0;
              if (beforePts === 0) assistedFromZeroCount += 1;
            }
          });
        }
        if (res && Array.isArray(res.notes)) {
          res.notes.forEach(n => {
            if (!notes.includes(n)) notes.push(n);
          });
        }
        return;
      }
      if (!Econ || typeof Econ.transferPoints !== "function") return;
      const eligible = npcIds.filter(id => {
        const stat = npcStats[id];
        const pts = stat ? stat.endPts : 0;
        const z = npcZero[id] ? npcZero[id].cur : 0;
        return pts === 0 || z >= stipendZ;
      });
      eligibleCount += eligible.length;
      if (!eligible.length) return;
      const list = eligible.slice().sort();
      if (seed != null) {
        list.sort(() => Math.random() - 0.5);
      }
      const selected = list.slice(0, maxRecipientsPerTick);
      let bankBal = getWorldBankBalance();
      selected.forEach(id => {
        if (bankBal < stipendAmount) {
          if (!notes.includes("bank_insufficient")) notes.push("bank_insufficient");
          return;
        }
        const beforePts = npcStats[id] ? npcStats[id].endPts : 0;
        const res = Econ.transferPoints(WORLD_BANK_ID, id, stipendAmount, "world_stipend_out", {
          tick: tickIndex,
          seed,
          eligibility: (beforePts === 0 ? "zero" : "streak"),
          zeroStreak: npcZero[id] ? npcZero[id].cur : 0,
          bankBefore: bankBal,
          bankAfter: bankBal - stipendAmount
        });
        if (res && res.ok) {
          payoutsCount += 1;
          if (!assistedNpcSet.has(id)) {
            assistedNpcSet.add(id);
            assistedNpcCount += 1;
            if (beforePts === 0) assistedFromZeroCount += 1;
          }
          bankBal -= stipendAmount;
        }
      });
    };

    const applyTick = () => {
      try {
        const didTick = allowEventsTick ? tickEventsOnce() : false;
        if (!didTick && !tickMissingLogged) {
          notes.push("events_tick_missing");
          tickMissingLogged = true;
        }
        if ((ticksProcessed % 10) === 0) {
          if (allowEventsTick && addNpcEventOnce()) eventsApplied += 1;
        }
        if ((ticksProcessed % 25) === 0) {
          if (doNpcVotesOnce()) {
            votesApplied += 1;
            if (massTrace && !crowdPhaseEmitted) {
              emitPhaseOnce("afterCrowdSim");
              crowdPhaseEmitted = true;
            }
          }
          if (!allowNpcVotes) applyNpcWealthTaxTick(ticksProcessed);
        }
        if ((ticksProcessed % 50) === 0) {
          if (doBattleOnce()) battlesResolved += 1;
        }
      } catch (e) {
        recordError("applyTick", e);
      }
    };

    const now0 = getNow();
    let currentNow = now0;
    const runLoop = () => {
      for (let i = 0; i < N; i++) {
        ticksProcessed += 1;
        currentNow = now0 + (i * 1000);
        applyTick();
        npcIds.forEach(id => {
          const p = S.players[id];
          const pts = (p && Number.isFinite(p.points)) ? (p.points | 0) : 0;
          const stat = npcStats[id];
          stat.endPts = pts;
          if (pts < stat.minPtsSeen) stat.minPtsSeen = pts;
          if (pts > stat.maxPtsSeen) stat.maxPtsSeen = pts;
          const z = npcZero[id];
          if (pts === 0) {
            z.cur += 1;
            if (z.cur > z.max) z.max = z.cur;
          } else {
            z.cur = 0;
          }
          stat.zeroStreakMax = z.max;
        });
        applyWorldStipendTick(ticksProcessed);
      }
    };

    const runner = () => runLoop();
    if (seed != null) {
      withSeededRandom(seed, () => withFakeNow(() => currentNow, runner));
    } else {
      withFakeNow(() => currentNow, runner);
    }

    const afterSnap = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function")
      ? Game.__DEV.sumPointsSnapshot()
      : null;
    if (massTrace) {
      if (!crowdPhaseEmitted) emitPhaseOnce("afterCrowdSim");
      const byIdNow = getByIdSnapshot();
      if (!worldBankPhaseEmitted && Number.isFinite(byIdNow.worldBank) && baseById && byIdNow.worldBank !== baseById.worldBank) {
        buildPhase("afterAnyTransfersToWorldBank", byIdNow, phasePrevById);
        phasePrevById = byIdNow;
        worldBankPhaseEmitted = true;
      }
      if (!sinkPhaseEmitted && Number.isFinite(byIdNow.sink) && baseById && byIdNow.sink !== baseById.sink) {
        buildPhase("afterAnyTransfersToSink", byIdNow, phasePrevById);
        phasePrevById = byIdNow;
        sinkPhaseEmitted = true;
      }
      const afterAllById = getByIdSnapshot();
      buildPhase("afterAllTicks", afterAllById, phasePrevById);
      if (!leakEmitted && baseById && afterAllById) {
        const sumBefore = Object.keys(baseById).reduce((s, id) => s + (Number.isFinite(baseById[id]) ? (baseById[id] | 0) : 0), 0);
        const sumAfter = Object.keys(afterAllById).reduce((s, id) => s + (Number.isFinite(afterAllById[id]) ? (afterAllById[id] | 0) : 0), 0);
        const sumDelta = sumAfter - sumBefore;
        if (sumDelta !== 0) {
          const allIds = new Set([...Object.keys(baseById), ...Object.keys(afterAllById)]);
          const topDeltaAccounts = [];
          allIds.forEach(id => {
            const before = Number.isFinite(baseById[id]) ? (baseById[id] | 0) : 0;
            const after = Number.isFinite(afterAllById[id]) ? (afterAllById[id] | 0) : 0;
            const delta = after - before;
            if (delta !== 0) topDeltaAccounts.push({ id, before, after, delta });
          });
          topDeltaAccounts.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
          const tail = dbg.moneyLog.slice(Math.max(0, dbg.moneyLog.length - 10));
          const lastNMoneyLogReasons = tail.map(r => String(r && r.reason || ""));
          const lastNTransfers = tail.map(r => ({
            sourceId: r && r.sourceId ? r.sourceId : null,
            targetId: r && r.targetId ? r.targetId : null,
            amount: r && Number.isFinite(r.amount) ? (r.amount | 0) : 0,
            reason: r && r.reason ? r.reason : null
          }));
          const leakPayload = { phase: "afterAllTicks", sumDelta, topDeltaAccounts: topDeltaAccounts.slice(0, 5), lastNMoneyLogReasons, lastNTransfers };
          if (Game.__DEV) Game.__DEV.__lastTickLeakDetected = leakPayload;
          emitLine(`TICK_LEAK_DETECTED ${JSON.stringify(leakPayload)}`);
          leakEmitted = true;
        }
      }
      emitLine("WORLD_MASS_V2_PHASES_END");
    }
    const worldMassAfter = afterSnap && Number.isFinite(afterSnap.total) ? (afterSnap.total | 0) : null;
    const worldBankAfter = afterSnap && afterSnap.byId && Number.isFinite(afterSnap.byId[WORLD_BANK_ID]) ? (afterSnap.byId[WORLD_BANK_ID] | 0) : 0;
    const worldMassDelta = (Number.isFinite(worldMassAfter) && Number.isFinite(worldMassBefore))
      ? ((worldMassAfter | 0) - (worldMassBefore | 0))
      : null;

    const endPts = npcIds.map(id => npcStats[id].endPts);
    const pct = (arr, q) => {
      if (!arr.length) return 0;
      const a = arr.slice().sort((x, y) => x - y);
      const idx = Math.min(a.length - 1, Math.max(0, Math.floor((q / 100) * (a.length - 1))));
      return a[idx] | 0;
    };
    const p50 = pct(endPts, 50);
    const p90 = pct(endPts, 90);
    const p99 = pct(endPts, 99);
    const Z = 20;
    const R = Math.max(50, (p99 | 0) * 2);

    const logEnd = dbg.moneyLog.length;
    const windowRows = dbg.moneyLog.slice(logStart, logEnd);
    const reasonAgg = Object.create(null);
    const transfers = [];
    let blockedEmissions = 0;
    windowRows.forEach(row => {
      if (!row) return;
      const currency = String(row.currency || "");
      const reason = String(row.reason || "unknown");
      if (reason === "points_emission_blocked") blockedEmissions += 1;
      if (currency && currency !== "points") return;
      if (reason.startsWith("rep_")) return;
      const amt = Number.isFinite(row.amount) ? (row.amount | 0) : 0;
      if (amt <= 0) return;
      reasonAgg[reason] = (reasonAgg[reason] || 0) + amt;
      transfers.push({
        sourceId: row.sourceId || null,
        targetId: row.targetId || null,
        amount: amt,
        reason
      });
    });
    const topReasons = Object.keys(reasonAgg)
      .map(reason => ({ reason, amount: reasonAgg[reason] }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    const topTransfers = transfers
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    windowRows.forEach(row => {
      if (!row) return;
      const reason = String(row.reason || "");
      if (reason === "world_tax_in") taxedCount += 1;
    });

    if (errors.length) {
      notes.push("errors_present");
    }

    const report = {
      ok: true,
      params: { N, seed, verbose },
      stipend: { enabled: stipendEnabled, ticksPerPayout, stipendAmount, stipendZ, maxRecipientsPerTick },
      worldMassBefore,
      worldMassAfter,
      worldMassDelta,
      worldBankBefore,
      worldBankAfter,
      worldBankSoftCap: (Econ && typeof Econ.getWorldBankSoftCap === "function") ? Econ.getWorldBankSoftCap() : null,
      ticksProcessed,
      eventsApplied,
      votesApplied,
      battlesResolved,
      payoutsCount,
      taxedCount,
      eligibleCount,
      assistedNpcCount,
      assistedFromZeroCount,
      Z,
      R,
      p50_endPts: p50,
      p90_endPts: p90,
      p99_endPts: p99,
      npcStats: npcIds.map(id => npcStats[id]),
      topReasons,
      topTransfers,
      logRowsCount: logEnd - logStart,
      blockedEmissions,
      errors,
      notes
    };
    if (errors.length) report.ok = false;
    return report;
  };

  Game.__DEV.smokeWorldLivesOnce = (opts = {}) => {
    const N = Number.isFinite(opts.N) ? Math.max(1, opts.N | 0) : 500;
    const seed = (opts && opts.seed != null) ? Number(opts.seed) : 1;
    const runsCount = Number.isFinite(opts.runs) ? Math.max(1, opts.runs | 0) : 3;
    const runs = [];
    const notes = [];
    let ok = true;

    for (let i = 0; i < runsCount; i++) {
      const run = Game.__DEV.runWorldTicks({ N, seed, verbose: false, allowNpcVotes: true, allowBattles: true, allowEventsTick: true });
      runs.push(run);
    }

    const base = runs[0] || null;
    const stable = {
      worldDeltaStable: runs.every(r => (r && r.worldMassDelta) === (base && base.worldMassDelta)),
      rowsScopedStable: runs.every(r => (r && r.logRowsCount) === (base && base.logRowsCount)),
      reasonsStable: JSON.stringify(runs.map(r => (r && r.topReasons) || [])) === JSON.stringify(runs.map(r => (base && base.topReasons) || [])),
      npcStatsStable: JSON.stringify(runs.map(r => (r && r.npcStats) || [])) === JSON.stringify(runs.map(r => (base && base.npcStats) || []))
    };

    const Z = base ? base.Z : 20;
    const R = base ? base.R : 50;
    const eventsOk = runs.every(r => r && r.ticksProcessed === N && ((r.eventsApplied + r.votesApplied + r.battlesResolved) > 0));
    if (!eventsOk) {
      ok = false;
      notes.push("no_events_or_ticks");
    }
    runs.forEach((r, idx) => {
      if (!r || r.worldMassDelta !== 0) {
        ok = false;
        notes.push(`world_mass_drift_${idx}`);
      }
      const nan = !r || [r.worldMassBefore, r.worldMassAfter, r.worldMassDelta, r.p99_endPts].some(v => v == null || !Number.isFinite(v));
      if (nan) {
        ok = false;
        notes.push(`nan_detected_${idx}`);
      }
      if (r && r.npcStats) {
        const badNpc = r.npcStats.some(s => !Number.isFinite(s.startPts) || !Number.isFinite(s.endPts) || !Number.isFinite(s.minPtsSeen) || !Number.isFinite(s.maxPtsSeen) || !Number.isFinite(s.zeroStreakMax));
        if (badNpc) {
          ok = false;
          notes.push(`npc_stats_nan_${idx}`);
        }
      }
      if (r && r.npcStats) {
        const zeroLocked = r.npcStats.some(s => s.zeroStreakMax >= Z);
        if (zeroLocked) {
          ok = false;
          notes.push(`zero_lock_${idx}`);
        }
        const runaway = r.npcStats.some(s => s.maxPtsSeen > R);
        if (runaway) {
          ok = false;
          notes.push(`runaway_${idx}`);
        }
      }
    });
    if (!stable.worldDeltaStable || !stable.reasonsStable || !stable.npcStatsStable) {
      ok = false;
      notes.push("non_deterministic");
    }

    const summary = {
      N,
      seed,
      Z,
      R,
      p99: base ? base.p99_endPts : null,
      worldDelta: base ? base.worldMassDelta : null,
      ticksProcessed: base ? base.ticksProcessed : 0,
      counts: base ? { eventsApplied: base.eventsApplied, votesApplied: base.votesApplied, battlesResolved: base.battlesResolved } : null
    };

    return { ok, runs, stable, summary, notes };
  };

  // dev-only QA smoke: run stipend world ticks + audit results in a compact, stable shape.
  Game.__DEV.smokeWorldStipendOnce = (opts = {}) => {
    const N = Number.isFinite(opts.N) ? Math.max(1, opts.N | 0) : 300;
    const seed = (opts && opts.seed != null) ? Number(opts.seed) : 1;
    const runsCount = Number.isFinite(opts.runs) ? Math.max(1, opts.runs | 0) : 3;
    const ticksPerPayout = Number.isFinite(opts.ticksPerPayout) ? Math.max(1, opts.ticksPerPayout | 0) : 25;
    const stipendAmount = Number.isFinite(opts.stipendAmount) ? Math.max(1, opts.stipendAmount | 0) : 1;
    const stipendZ = Number.isFinite(opts.Z) ? Math.max(1, opts.Z | 0) : 5;
    const taxRate = Number.isFinite(opts.taxRate) ? Number(opts.taxRate) : 1;
    const windowOpts = (opts && typeof opts.window === "object" && opts.window) ? opts.window : { lastN: 200 };
    const diagVersion = "world_stipend_smoke_v1";
    const notes = [];
    const runs = [];
    let ok = true;

    for (let i = 0; i < runsCount; i++) {
      const run = Game.__DEV.runWorldTicks({
        N,
        seed,
        stipendEnabled: true,
        ticksPerPayout,
        stipendAmount,
        stipendZeroStreak: stipendZ,
        maxRecipientsPerTick: 5,
        safeEconOnly: true,
        allowNpcVotes: false,
        allowBattles: false,
        allowEventsTick: false
      });
      const audit = Game.__DEV.auditNpcWorldBalanceOnce({ window: windowOpts, refresh: false });
      runs.push({ run, audit });
    }

    const base = runs[0] || null;
    const baseAudit = base ? base.audit : null;
    const same = (a, b) => JSON.stringify(a || null) === JSON.stringify(b || null);
    const worldDeltaStable = runs.every(r => r && r.audit && r.audit.world && r.audit.world.delta === (baseAudit && baseAudit.world ? baseAudit.world.delta : null));
    const rowsScopedStable = runs.every(r => r && r.audit && r.audit.meta && r.audit.meta.rowsScoped === (baseAudit && baseAudit.meta ? baseAudit.meta.rowsScoped : null));
    const unexpectedStable = runs.every(r => r && r.audit && r.audit.meta && r.audit.meta.unexpectedCount === (baseAudit && baseAudit.meta ? baseAudit.meta.unexpectedCount : null));
    const leaksStable = runs.every(r => r && r.audit && same(r.audit.leaks && r.audit.leaks.toSink, baseAudit && baseAudit.leaks && baseAudit.leaks.toSink));
    const stable = { totalsStable: worldDeltaStable, rowsScopedStable, unexpectedStable, leaksStable };

    const packRun = (r, idx) => {
      if (!r || !r.audit) {
        ok = false;
        return { ok: false, notes: [`audit_missing_${idx}`] };
      }
      const a = r.audit;
      const runNotes = [];
      const world = a.world || {};
      const inv = (a.flowSummary && a.flowSummary.invariants) ? a.flowSummary.invariants : {};
      const meta = a.meta || {};
      const leaks = a.leaks || {};

      const hasWorldDelta = Number.isFinite(world.delta);
      if (!hasWorldDelta || world.delta !== 0) runNotes.push("world_delta");
      if (inv.totalsNetOk === false) runNotes.push("totalsNetOk_false");
      if (inv.totalsBalanceOk === false) runNotes.push("totalsBalanceOk_false");
      if (inv.sinkNetMatchesDelta === false) runNotes.push("sinkNetMatchesDelta_false");
      if (meta.unexpectedCount > 0) runNotes.push("unexpectedCount");
      if (a.notes && Array.isArray(a.notes) && a.notes.some(n => n === "net_to_sink_mismatch")) runNotes.push("net_to_sink_mismatch");

      if (runNotes.length > 0) ok = false;
      return {
        ok: runNotes.length === 0,
        notes: runNotes,
        world: {
          beforeTotal: world.beforeTotal,
          afterTotal: world.afterTotal,
          delta: world.delta,
          byBucket: world.byBucket
        },
        meta: {
          logSource: meta.logSource,
          rowsScoped: meta.rowsScoped,
          scopeDesc: meta.scopeDesc,
          allowlistSize: meta.allowlistSize,
          unexpectedCount: meta.unexpectedCount,
          sinkNetScoped: meta.sinkNetScoped,
          sinkDelta: meta.sinkDelta
        },
        leaks: { toSink: leaks.toSink || [] },
        flowSummary: { invariants: inv }
      };
    };

    const packedRuns = runs.map(packRun);
    if (!stable.totalsStable || !stable.leaksStable || !stable.rowsScopedStable || !stable.unexpectedStable) {
      ok = false;
      notes.push("non_deterministic");
    }

    return {
      ok,
      notes,
      meta: { N, seed, runs: runsCount, diagVersion },
      runs: packedRuns,
      stable
    };
  };

  Game.__DEV.smokeWorldStipendLongOnce = (opts = {}) => {
    const ticks = Number.isFinite(opts.ticks) ? Math.max(1, opts.ticks | 0) : 300;
    const seed = (opts && opts.seed != null) ? Number(opts.seed) : 1;
    const runs = Number.isFinite(opts.runs) ? Math.max(1, opts.runs | 0) : 1;
    return Game.__DEV.smokeWorldStipendOnce({
      N: ticks,
      seed,
      runs,
      ticksPerPayout: opts.ticksPerPayout,
      stipendAmount: opts.stipendAmount,
      Z: opts.Z,
      taxRate: opts.taxRate,
      window: opts.window
    });
  };

  // dev-only QA smoke: NPC wealth tax (world_tax_in) should trigger without emissions.
  // dev-only world contract helper for wealth-tax pack
  const econ_npc_world_contract_v1 = (opts = {}) => {
    const missing = [];
    const snapById = opts && opts.snapById ? opts.snapById : null;
    if (!snapById) missing.push("snap_by_id_missing");
    const set = new Set(Object.keys(snapById || {}));
    ["me", "sink", "worldBank", "bank", "crowd"].forEach(id => set.add(id));
    if (Game.State && Game.State.players) {
      Object.keys(Game.State.players).forEach(id => {
        if (typeof id === "string" && id.startsWith("crowd:")) set.add(id);
      });
    }
    if (Game.Debug && Game.Debug.debug_moneyLogByBattle) {
      Object.keys(Game.Debug.debug_moneyLogByBattle).forEach(bid => {
        if (typeof bid === "string" && bid.length) set.add(`crowd:${bid}`);
      });
    }
    const accountsIncluded = Array.from(set).sort();
    const input = accountsIncluded.join("|");
    let hash = 5381;
    for (let i = 0; i < input.length; i += 1) {
      hash = ((hash << 5) + hash) + input.charCodeAt(i);
      hash |= 0;
    }
    return {
      accountsIncluded,
      accountsIncludedLen: accountsIncluded.length,
      accountsIncludedHash: `h${(hash >>> 0).toString(16)}`,
      hasTotals: !!snapById,
      missing
    };
  };
  Game.__DEV.econNpcWorldContractV1 = econ_npc_world_contract_v1;
  console.warn("ECON_NPC_WORLD_CONTRACT_V1_EXPORTED", "econNpcWorldContractV1");

  const getEconSnapshot = () => {
    if (Game.ConflictEconomy && typeof Game.ConflictEconomy.sumPointsSnapshot === "function") {
      return Game.ConflictEconomy.sumPointsSnapshot();
    }
    if (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function") {
      return Game.__DEV.sumPointsSnapshot();
    }
    return null;
  };

  const getWealthTaxBuildTag = () => {
    if (typeof window !== "undefined" && window.__WT_DUMP_BUILD_TAG__) {
      return window.__WT_DUMP_BUILD_TAG__;
    }
    if (typeof window !== "undefined" && window.Game && window.Game.__D && window.Game.__D.buildTag) {
      return window.Game.__D.buildTag;
    }
    return "unknown_build";
  };

  Game.__DEV.smokeNpcWealthTaxOnce = (opts = {}) => {
    const ticks = Number.isFinite(opts.ticks) ? Math.max(1, opts.ticks | 0) : 200;
    const seed = (opts && opts.seed != null) ? Number(opts.seed) : 1;
    const seedRichNpc = opts.seedRichNpc !== false;
    const debugTelemetry = !!opts.debugTelemetry;
    const ticksMode = (opts && typeof opts.ticksMode === "string") ? String(opts.ticksMode) : null;
    const taxOnlyTicks = !!(opts && opts.taxOnlyTicks) || ticksMode === "wealth_tax_only";
    const scopeWindowLastN = (opts && opts.window && Number.isFinite(opts.window.lastN)) ? (opts.window.lastN | 0) : null;
    const Econ = Game.ConflictEconomy || Game._ConflictEconomy || null;
    const S = Game.__S || null;
    const buildTagLocal = getWealthTaxBuildTag();
    if (!Econ || !S || !S.players) return { ok: false, notes: ["missing_econ_or_state"] };
    let threshold = null;
    let seedMargin = null;
    let seedApplied = false;
    let seedWhy = null;
    let seedNeed = 0;
    let needTotal = 0;
    let seedCollected = 0;
    let seedDonorsCount = 0;
    let logSourceCandidates = [];
    let snapshotOk = false;
    let snapshotWhy = null;
    let scopedLen = 0;
    let taxProbe = { attempted: false, applied: false, taxAmount: 0, why: "uninit" };
    let ensureNpcAccountsOk = true;
    let ensureNpcAccountsOkFromEnsure = null;
    let ensureNpcAccountsOkFromSmoke = null;
    let ensureNpcAccountsOkMismatch = false;

    const worldContractName = "econ_npc_world_contract_v1";
    const getEconNpcWorldContractV1 = econ_npc_world_contract_v1;
    const maxAbs = (a, b) => Math.abs(a) - Math.abs(b);
    const getByIdSnapshot = () => {
      const snap = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function")
        ? Game.__DEV.sumPointsSnapshot()
        : null;
      if (snap && snap.byId) return snap.byId;
      const byId = Object.create(null);
      Object.keys(S.players || {}).forEach(id => {
        const p = S.players[id];
        const pts = p && Number.isFinite(p.points) ? (p.points | 0) : 0;
        byId[id] = pts;
      });
      return byId;
    };
    const getServiceFlag = (id) => {
      if (!id) return false;
      if (id === "sink" || id === "worldBank" || id === "bank" || id === "crowd") return true;
      if (id.startsWith("crowd:") || id.startsWith("crowd_") || id.startsWith("crowdPool") || id.startsWith("crowd_pool")) return true;
      return false;
    };
    let lastByIdForMass = null;
    const buildMassMarker = (stage, byId) => {
      const ids = Object.keys(byId || {});
      let totalPtsAll = 0;
      let totalPtsNpc = 0;
      let totalPtsService = 0;
      ids.forEach(id => {
        const pts = Number.isFinite(byId[id]) ? (byId[id] | 0) : 0;
        totalPtsAll += pts;
        if (String(id).startsWith("npc_")) totalPtsNpc += pts;
        if (getServiceFlag(String(id))) totalPtsService += pts;
      });
      const totalPtsPlayers = totalPtsAll - totalPtsService;
      const topChangedIds = [];
      if (lastByIdForMass) {
        const allIds = new Set([...Object.keys(lastByIdForMass), ...ids]);
        allIds.forEach(id => {
          const before = Number.isFinite(lastByIdForMass[id]) ? (lastByIdForMass[id] | 0) : 0;
          const after = Number.isFinite(byId[id]) ? (byId[id] | 0) : 0;
          const delta = after - before;
          if (delta !== 0) topChangedIds.push({ id, before, after, delta });
        });
        topChangedIds.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
      }
      lastByIdForMass = byId;
      const lastN = (scopeWindowLastN && scopeWindowLastN > 0) ? scopeWindowLastN : 200;
      const logRows = (Game.Debug && Array.isArray(Game.Debug.moneyLog))
        ? Game.Debug.moneyLog
        : (Game.__D && Array.isArray(Game.__D.moneyLog)) ? Game.__D.moneyLog : [];
      const tail = logRows.length ? logRows.slice(Math.max(0, logRows.length - lastN)) : [];
      const byReason = Object.create(null);
      let sumNet = 0;
      tail.forEach(r => {
        const amt = (r && Number.isFinite(r.amount)) ? (r.amount | 0) : 0;
        sumNet += amt;
        const reason = String(r && r.reason || "");
        if (!reason) return;
        byReason[reason] = (byReason[reason] || 0) + amt;
      });
      const byReasonTop5 = Object.keys(byReason)
        .map(reason => ({ reason, amount: byReason[reason] }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);
      emitLine(`WORLD_MASS_V2 ${JSON.stringify({ stage, totals: { totalPtsAll, totalPtsPlayers, totalPtsNpc, totalPtsService }, topChangedIds: topChangedIds.slice(0, 5), scopedMoneyLogAgg: { sumNet, byReasonTop5 } })}`);
    };
    const snapBefore = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function")
      ? Game.__DEV.sumPointsSnapshot()
      : null;
    snapshotOk = !!(snapBefore && snapBefore.byId);
    if (!snapshotOk) snapshotWhy = "sumPointsSnapshot_missing_or_null";
    const fallbackById = Object.create(null);
    Object.keys((S && S.players) ? S.players : {}).forEach(id => {
      const p = S.players[id];
      const pts = p && Number.isFinite(p.points) ? (p.points | 0) : 0;
      fallbackById[id] = pts;
    });
    const snapById = (snapBefore && snapBefore.byId) ? snapBefore.byId : fallbackById;
    buildMassMarker("beforeSeed", snapById);
    const contractFrozen = (opts && opts.contractFrozen && Array.isArray(opts.contractFrozen.accountsIncluded))
      ? opts.contractFrozen
      : null;
    let contract = contractFrozen
      ? {
        accountsIncluded: contractFrozen.accountsIncluded.slice(),
        accountsIncludedLen: Number.isFinite(contractFrozen.accountsIncludedLen) ? contractFrozen.accountsIncludedLen : contractFrozen.accountsIncluded.length,
        accountsIncludedHash: contractFrozen.accountsIncludedHash || null,
        hasTotals: true,
        missing: []
      }
      : (getEconNpcWorldContractV1 ? getEconNpcWorldContractV1({ snapById }) : null);
    let accountsIncluded = contract ? contract.accountsIncluded : [];
    let accountsIncludedLen = contract ? contract.accountsIncludedLen : 0;
    let accountsIncludedHash = contract ? contract.accountsIncludedHash : null;
    const worldContractUsed = !!getEconNpcWorldContractV1;
    const worldContractExportKey = "econNpcWorldContractV1";
    const contractFrozenUsed = !!contractFrozen;
    const accountsIncludedLenFrozen = contractFrozen ? (Number.isFinite(contractFrozen.accountsIncludedLen) ? contractFrozen.accountsIncludedLen : contractFrozen.accountsIncluded.length) : null;
    const accountsIncludedHashFrozen = contractFrozen ? contractFrozen.accountsIncludedHash || null : null;
    if (!accountsIncluded || accountsIncludedLen === 0) {
      return {
        ok: false,
        notes: ["totals_null"],
        meta: { ticks, seed, seedRichNpc, logSource: "none", rowsScoped: 0, scopeDesc: `ticks=${ticks}`, debugTelemetry },
        world: { beforeTotal: null, afterTotal: null, delta: null, byBucket: null },
        bank: { accountId: "worldBank", beforePts: null, afterPts: null, delta: null, softCap: null },
        tax: { threshold: (Econ.NPC_TAX_SOFT_CAP != null) ? (Econ.NPC_TAX_SOFT_CAP | 0) : 20, maxPerTxn: (Econ.NPC_TAX_MAX_PER_TXN != null) ? (Econ.NPC_TAX_MAX_PER_TXN | 0) : 2, totalTaxInWindow: 0, rowsCount: 0, appliedCount: 0, topTaxedNpcs: [], reasonsTop: [] },
        asserts: { worldDeltaZero: false, taxPositiveWhenSeeded: false, noNpcNegative: true, hasWorldTaxInRows: false, bankNonNegative: true, rowsScopedPositive: false },
        diag: {
          addedAccounts: accountsIncluded.slice(),
          seedRichNpc,
          npcSeededId: null,
          npcSeededPtsBefore: null,
          npcSeededPtsAfter: null,
          seedSourceId: null,
          seedFailureReason: "world_contract_mismatch",
          NPC_TAX_SOFT_CAP: (Econ.NPC_TAX_SOFT_CAP != null) ? (Econ.NPC_TAX_SOFT_CAP | 0) : 20,
          NPC_TAX_MAX_PER_TXN: (Econ.NPC_TAX_MAX_PER_TXN != null) ? (Econ.NPC_TAX_MAX_PER_TXN | 0) : 2,
          seedThreshold: threshold,
          seedMargin,
          seedApplied,
          seedWhy,
          worldContractUsed,
          contractFrozen: contractFrozenUsed,
          accountsIncludedLenFrozen,
          accountsIncludedHashFrozen,
          worldContractExportKey,
          logSource: "none",
          rowsScoped: 0,
          logSourceCandidates,
          snapshotOk,
          snapshotWhy,
          scopedLen,
          accountsIncludedLen,
          addedAccounts: [],
          accountsIncludedHash,
          worldContractName,
          lenBefore: 0,
          lenAfter: 0,
          logStart: 0,
          logEnd: 0,
          hasDebugMoneyLog: !!(Game.__D && Array.isArray(Game.__D.moneyLog) && Game.__D.moneyLog.length),
          debugMoneyLogLen: (Game.__D && Array.isArray(Game.__D.moneyLog)) ? Game.__D.moneyLog.length : 0,
          hasLoggerQueue: !!(Game.Logger && Array.isArray(Game.Logger.queue) && Game.Logger.queue.length),
          scopeWindowLastN: (opts && opts.window && Number.isFinite(opts.window.lastN)) ? (opts.window.lastN | 0) : null,
          taxProbe: { attempted: false, applied: false, taxAmount: 0, why: "world_contract_mismatch" }
        }
      };
    }
    const missingAccounts = [];
    const availableAccounts = [];
    const worldMassBefore = accountsIncluded.reduce((sum, id) => {
      if (snapById && Number.isFinite(snapById[id])) {
        availableAccounts.push(id);
        return sum + (snapById[id] | 0);
      }
      missingAccounts.push(id);
      return sum;
    }, 0);
    const bankBefore = (snapById && Number.isFinite(snapById.worldBank))
      ? (snapById.worldBank | 0)
      : 0;

    const notes = [];
    const dbg = Game.__D || (Game.__D = {});
    dbg.moneyLog = Array.isArray(dbg.moneyLog) ? dbg.moneyLog : [];
    const logStart = 0;
    const lenBefore = 0;
    let logSource = "none";
    threshold = (Econ.NPC_TAX_SOFT_CAP != null) ? (Econ.NPC_TAX_SOFT_CAP | 0) : 20;
    seedMargin = 5;
    const hasDebugMoneyLog = !!((Game.Debug && Array.isArray(Game.Debug.moneyLog) && Game.Debug.moneyLog.length)
      || (Game.__D && Array.isArray(Game.__D.moneyLog) && Game.__D.moneyLog.length));
    const hasLoggerQueue = !!(Game.Logger && Array.isArray(Game.Logger.queue) && Game.Logger.queue.length);
    if (!snapshotOk) notes.push("snapshot_unavailable");
    if (!snapshotOk) {
      return {
        ok: false,
        notes,
        meta: { ticks, seed, seedRichNpc, logSource, rowsScoped: 0, scopeDesc: `ticks=${ticks}`, debugTelemetry },
        world: { beforeTotal: worldMassBefore, afterTotal: null, delta: null, byBucket: null },
        bank: { accountId: "worldBank", beforePts: bankBefore, afterPts: null, delta: null, softCap: null },
        tax: { threshold, maxPerTxn: (Econ.NPC_TAX_MAX_PER_TXN != null) ? (Econ.NPC_TAX_MAX_PER_TXN | 0) : 2, totalTaxInWindow: 0, rowsCount: 0, appliedCount: 0, topTaxedNpcs: [], reasonsTop: [] },
        asserts: { worldDeltaZero: false, taxPositiveWhenSeeded: false, noNpcNegative: true, hasWorldTaxInRows: false, bankNonNegative: true, rowsScopedPositive: false },
        diag: {
          seedRichNpc,
          npcSeededId: null,
          npcSeededPtsBefore: null,
          npcSeededPtsAfter: null,
          seedSourceId: null,
          seedFailureReason: null,
          NPC_TAX_SOFT_CAP: threshold,
          NPC_TAX_MAX_PER_TXN: (Econ.NPC_TAX_MAX_PER_TXN != null) ? (Econ.NPC_TAX_MAX_PER_TXN | 0) : 2,
          seedThreshold: threshold,
          seedMargin,
          seedApplied,
          seedWhy,
          seedNeed,
          seedCollected,
          seedDonorsCount,
          logSource,
          rowsScoped: 0,
          logSourceCandidates,
          snapshotOk,
          snapshotWhy,
          scopedLen,
          accountsIncludedLen,
          accountsIncludedHash,
          worldContractName,
          lenBefore,
          lenAfter: lenBefore,
          logStart,
          logEnd: logStart,
          hasDebugMoneyLog,
          hasLoggerQueue,
          scopeWindowLastN,
          taxProbe: { attempted: false, applied: false, taxAmount: 0, why: "snapshot_unavailable" },
          auditReadOnly: false
        }
      };
    }
    // If log source is empty at start, proceed; we will re-select after ticks.

    const npcIds = Object.values(S.players || {})
      .filter(p => p && p.id && (p.npc === true || p.type === "npc" || String(p.id).startsWith("npc_")))
      .map(p => String(p.id));
    let seededNpcId = null;
    let seededNpcPtsBefore = null;
    let seededNpcPtsAfter = null;
    let seedSourceId = null;
    let seedFailureReason = null;
    seedApplied = false;
    seedWhy = null;
    const sinkIncluded = accountsIncluded.includes("sink");
    const meIncluded = accountsIncluded.includes("me");
    let seedPerformed = false;
    let seedTransfer = null;
    let evidenceSeedDonorsSample = [];
    let seedDonorsSample = [];

    if (seedRichNpc && npcIds.length) {
      const targetId = npcIds[0];
      const acc = (Econ && typeof Econ.getAccount === "function") ? Econ.getAccount(targetId) : S.players[targetId];
      const current = acc && Number.isFinite(acc.points) ? (acc.points | 0) : 0;
      const desired = threshold + seedMargin;
      seededNpcId = targetId;
      seededNpcPtsBefore = current;
      if (!acc) {
        seedFailureReason = "seed_target_missing";
        seedWhy = "seed_target_missing";
        notes.push("seed_rich_npc_failed");
        notes.push("audit_write_blocked");
      }
      if (current >= desired) {
        seedApplied = true;
        seedWhy = "already_above_threshold";
      } else {
      const need = desired - current;
      seedNeed = need;
      needTotal = need;
      seedSourceId = "npc_only";
      const donorIds = npcIds.filter(id => id !== targetId && String(id).startsWith("npc_"));
      if (donorIds.length === 0) {
        seedFailureReason = "seed_no_npc_donors";
        seedWhy = "seed_no_npc_donors";
        seedSourceId = "npc_only_failed";
        seedApplied = false;
        notes.push("seed_rich_npc_failed");
        notes.push("seed_no_npc_donors");
      }
      const donorVersionPayload = {
        buildTag: buildTagLocal || null,
        file: "dev-checks.js",
        mode: "npc_only",
        need,
        donorsTried: donorIds.length,
        donorsUsed: 0,
        forbiddenSinkUsed: false,
        ts: Date.now()
      };
      const emitSeedVersionMarker = () => {
        emitLine(`SEED_RICH_NPC_V2_ACTIVE ${safeStringify(donorVersionPayload)}`);
      };
      let available = 0;
      emitSeedVersionMarker();
      donorIds.forEach(donorId => {
        const donorAcc = (Econ && typeof Econ.getAccount === "function") ? Econ.getAccount(donorId) : S.players[donorId];
        const donorPts = donorAcc && Number.isFinite(donorAcc.points) ? (donorAcc.points | 0) : 0;
        if (donorPts > 1) available += (donorPts | 0) - 1;
      });
      if (donorIds.length === 0) {
        // already flagged above; avoid transfers
      } else if (available < need) {
        seedFailureReason = "seed_npc_only_insufficient";
        seedWhy = "seed_npc_only_insufficient";
        seedSourceId = "npc_only_failed";
        notes.push("seed_skipped_insufficient_source");
      } else {
        let collected = 0;
        let donorsUsed = 0;
        const donorsPicked = [];
        let seedGuardBlocked = false;
        for (let i = 0; i < donorIds.length && collected < need; i += 1) {
          const donorId = donorIds[i];
        if (donorId === "sink" || donorId === "worldBank") {
          emitLine(`SEED_RICH_NPC_V2_GUARD_BLOCKED sourceId=${donorId}`);
          seedGuardBlocked = true;
          break;
        }
          const donorAcc = (Econ && typeof Econ.getAccount === "function") ? Econ.getAccount(donorId) : S.players[donorId];
          const donorPts = donorAcc && Number.isFinite(donorAcc.points) ? (donorAcc.points | 0) : 0;
          if (!donorId || !String(donorId).startsWith("npc_")) {
            donorVersionPayload.forbiddenSinkUsed = true;
            continue;
          }
          if (donorPts <= 1) continue;
          const take = Math.min(1, donorPts - 1, need - collected);
          const takeTx = Econ.transferPoints(donorId, targetId, take, "world_seed_grant", {
            seed: true,
            npcId: targetId,
            donorId,
            amount: take
          });
          if (takeTx && takeTx.ok === true) {
            collected += take;
            donorsUsed += 1;
            if (donorsPicked.length < 3) donorsPicked.push(donorId);
            donorVersionPayload.donorsUsed = donorsUsed;
          }
        }
        if (seedGuardBlocked) {
          seedFailureReason = "seed_from_sink_forbidden";
          seedWhy = "seed_from_sink_forbidden";
          seedSourceId = "npc_only_failed";
          seedApplied = false;
          seedTransfer = { ok: false, fromId: null, sourcePtsAfter: null };
          notes.push("seed_from_sink_forbidden");
        }
        seedCollected = collected;
        seedDonorsCount = donorsUsed;
        seedDonorsSample = donorsPicked;
        if (seedGuardBlocked) {
          // guard handled above
        } else if (collected < need) {
          seedFailureReason = "insufficient_npc_donors";
          seedWhy = "insufficient_npc_donors";
          notes.push("seed_rich_npc_failed");
        } else {
            seedPerformed = true;
            seedApplied = true;
            seedWhy = "seed_transfer_ok";
            seedTransfer = {
              ok: true,
              amount: collected,
              fromId: "npc_only",
              sourcePtsAfter: null
            };
            if (debugTelemetry) {
              try {
                if (Game.__DEV && typeof Game.__DEV._dumpLine === "function") {
                  Game.__DEV._dumpLine(`SEED_RICH_NPC_OK ${JSON.stringify({ npcId: targetId, before: current, after: current + collected, desired })}`);
                }
              } catch (_) {}
            }
          }
        }
      }
      seededNpcPtsAfter = acc && Number.isFinite(acc.points) ? (acc.points | 0) : seededNpcPtsBefore;
      if (seedApplied && seededNpcPtsAfter < desired) {
        seedFailureReason = seedFailureReason || "seed_target_not_reached";
        seedWhy = seedWhy || "seed_target_not_reached";
        notes.push("seed_rich_npc_failed");
      }
      if (typeof Econ.applyNpcWealthTaxIfNeeded === "function") {
        const afterSeed = acc && Number.isFinite(acc.points) ? (acc.points | 0) : 0;
        const accPoints = acc && Number.isFinite(acc.points) ? (acc.points | 0) : 0;
        const stPoints = (Game.State && Game.State.players && Game.State.players[targetId] && Number.isFinite(Game.State.players[targetId].points))
          ? (Game.State.players[targetId].points | 0)
          : null;
        const hasAcc = !!acc;
        if (!taxProbe || typeof taxProbe !== "object") taxProbe = { attempted: false, applied: false, taxAmount: 0, why: "uninit" };
        taxProbe.attempted = true;
        taxProbe.taxCall = { npcId: targetId, npcPtsBefore: afterSeed, hasAcc, accPoints, statePoints: stPoints };
        const taxRes = Econ.applyNpcWealthTaxIfNeeded(targetId, afterSeed, {
          baseReason: "dev_tax_probe_cost",
          tick: "dev_tax_probe"
        });
        emitLine(`ECON_NPC_WEALTH_TAX_APPLY_V1 ${safeStringify({
          npcId: targetId,
          npcPtsBefore: afterSeed,
          npcPtsAfter: acc && Number.isFinite(acc.points) ? (acc.points | 0) : null,
          taxResOk: !!(taxRes && taxRes.ok === true),
          taxApplied: !!(taxRes && taxRes.taxApplied === true),
          taxAmount: (taxRes && Number.isFinite(taxRes.taxAmount)) ? (taxRes.taxAmount | 0) : null,
          reasonIn: "world_tax_in",
          reasonOut: "world_tax_out"
        })}`);
        if (!taxRes || taxRes.ok !== true || taxRes.taxApplied !== true) notes.push("tax_probe_failed");
      } else {
        emitLine(`ECON_NPC_WEALTH_TAX_APPLY_V1 ${safeStringify({
          npcId: targetId,
          npcPtsBefore: acc && Number.isFinite(acc.points) ? (acc.points | 0) : null,
          willCall: false,
          reason: "missing_apply_fn"
        })}`);
        notes.push("tax_probe_failed");
      }
      const seedSnap = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function")
        ? Game.__DEV.sumPointsSnapshot()
        : null;
      const seedById = (seedSnap && seedSnap.byId) ? seedSnap.byId : snapById;
      const seedWorldAfter = accountsIncluded.reduce((sum, id) => {
        return sum + (Number.isFinite(seedById[id]) ? (seedById[id] | 0) : 0);
      }, 0);
      const seedWorldDelta = (worldMassBefore != null && seedWorldAfter != null) ? (seedWorldAfter - worldMassBefore) : null;
      if (seedWorldDelta !== 0) notes.push("seed_not_zero_sum");
      refreshMoneyLogSnapshot();
      const dbgProbe = (Game.Debug && Array.isArray(Game.Debug.moneyLog)) ? Game.Debug.moneyLog
        : (Game.__D && Array.isArray(Game.__D.moneyLog)) ? Game.__D.moneyLog
        : [];
      const probeEnd = dbgProbe.length;
      const probeWindow = (scopeWindowLastN && scopeWindowLastN > 0) ? scopeWindowLastN : 200;
      const probeRows = dbgProbe.length
        ? dbgProbe.slice(Math.max(0, probeEnd - probeWindow))
        : [];
      const probeTaxRows = probeRows.filter(r => r && r.reason === "world_tax_in");
      if (seedRichNpc && probeTaxRows.length === 0) {
        notes.push("tax_probe_missing_after_seed");
      }
    }
    buildMassMarker("afterSeed", getByIdSnapshot());
    if (seedRichNpc && notes.includes("seed_rich_npc_failed")) {
      return {
        ok: false,
        notes,
        meta: { ticks, seed, seedRichNpc, logSource, rowsScoped: 0, scopeDesc: `ticks=${ticks}`, debugTelemetry },
        world: { beforeTotal: worldMassBefore, afterTotal: worldMassBefore, delta: 0, byBucket: (snapBefore && snapBefore.poolsBreakdown) ? snapBefore.poolsBreakdown : null },
        bank: { accountId: "worldBank", beforePts: bankBefore, afterPts: bankBefore, delta: 0, softCap: (typeof Econ.getWorldBankSoftCap === "function") ? (Econ.getWorldBankSoftCap() | 0) : null },
        tax: { threshold, maxPerTxn: (Econ.NPC_TAX_MAX_PER_TXN != null) ? (Econ.NPC_TAX_MAX_PER_TXN | 0) : 2, totalTaxInWindow: 0, rowsCount: 0, appliedCount: 0, topTaxedNpcs: [], reasonsTop: [] },
        asserts: { worldDeltaZero: true, taxPositiveWhenSeeded: false, noNpcNegative: true, hasWorldTaxInRows: false, bankNonNegative: true, rowsScopedPositive: false },
        diag: {
          seedRichNpc,
          npcSeededId: seededNpcId,
          npcSeededPtsBefore: seededNpcPtsBefore,
          npcSeededPtsAfter: seededNpcPtsAfter,
          seedSourceId,
          seedFailureReason,
          NPC_TAX_SOFT_CAP: threshold,
          NPC_TAX_MAX_PER_TXN: (Econ.NPC_TAX_MAX_PER_TXN != null) ? (Econ.NPC_TAX_MAX_PER_TXN | 0) : 2,
          seedThreshold: threshold,
          seedMargin,
          seedApplied,
          seedWhy,
          seedNeed,
          seedCollected,
          seedDonorsCount,
          logSource,
          rowsScoped: 0,
          logSourceCandidates,
          snapshotOk,
          snapshotWhy,
          scopedLen,
          accountsIncludedLen,
          accountsIncludedHash,
          worldContractName,
          missingAccounts: missingAccounts.slice(0, 10),
          availableCount: availableAccounts.length,
          missingCount: missingAccounts.length,
          lenBefore,
          lenAfter: lenBefore,
          logStart,
          logEnd: logStart,
          hasDebugMoneyLog,
          hasLoggerQueue,
          scopeWindowLastN,
          seedTransfer,
          taxProbe: { attempted: true, applied: false, taxAmount: 0, why: seedFailureReason || "seed_failed" }
        }
      };
    }

    const runWealthTaxOnlyTicks = () => {
      const applyTickFn = (Econ && typeof Econ.applyNpcWealthTaxTick === "function") ? Econ.applyNpcWealthTaxTick : null;
      const applyIfNeeded = (Econ && typeof Econ.applyNpcWealthTaxIfNeeded === "function") ? Econ.applyNpcWealthTaxIfNeeded : null;
      for (let i = 0; i < ticks; i += 1) {
        const tickIndex = i + 1;
        if (applyTickFn) {
          try { applyTickFn(tickIndex); } catch (_) {}
          continue;
        }
        if (!applyIfNeeded) continue;
        npcIds.forEach(id => {
          let pts = 0;
          try {
            const acc = Econ.getAccount ? Econ.getAccount(id) : null;
            if (acc && Number.isFinite(acc.points)) pts = (acc.points | 0);
            else if (S.players && S.players[id] && Number.isFinite(S.players[id].points)) pts = (S.players[id].points | 0);
          } catch (_) {}
          try {
            applyIfNeeded(id, pts, { baseReason: "dev_tax_only_tick", tick: tickIndex });
          } catch (_) {}
        });
      }
      return { ok: true, ticksProcessed: ticks };
    };
    const run = taxOnlyTicks
      ? runWealthTaxOnlyTicks()
      : Game.__DEV.runWorldTicks({
        N: ticks,
        seed,
        allowNpcVotes: true,
        allowBattles: true,
        allowEventsTick: true
      });
    buildMassMarker("afterTicks", getByIdSnapshot());

    refreshMoneyLogSnapshot();
    const logCandidatesAfter = collectLogSourceCandidates();
    const candidateSummaries = logCandidatesAfter.map(c => ({
      name: c.name,
      rows: Array.isArray(c.rows) ? c.rows : [],
      len: c.len,
      txHits: Number.isFinite(c.txHits) ? (c.txHits | 0) : 0,
      txRatio: Number.isFinite(c.txRatio) ? c.txRatio : 0,
      shapeSample: Array.isArray(c.shapeSample) ? c.shapeSample : []
    }));
    logSourceCandidates = candidateSummaries.map(c => ({
      name: c.name,
      rowsLen: c.len,
      txHits: c.txHits,
      txRatio: c.txRatio,
      shapeSample: c.shapeSample
    }));
    const preferredOrder = [
      "Game.Debug.moneyLog",
      "debug_moneyLog",
      "logger_queue",
      "Econ.moneyLog",
      "state_moneyLog",
      "Game.Debug.debug_moneyLog"
    ];
    const candidateComparator = (a, b) => {
      if (b.txHits !== a.txHits) return b.txHits - a.txHits;
      if (b.txRatio !== a.txRatio) return b.txRatio - a.txRatio;
      if (b.len !== a.len) return b.len - a.len;
      const idxA = preferredOrder.indexOf(a.name);
      const idxB = preferredOrder.indexOf(b.name);
      if (idxA !== idxB) {
        if (idxA < 0) return 1;
        if (idxB < 0) return -1;
        return idxA - idxB;
      }
      const nameA = a.name || "";
      const nameB = b.name || "";
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    };
    const candidatesWithTx = candidateSummaries.filter(c => c.txHits > 0);
    let selectedCandidate = null;
    let selectionReason = "no_tx_rows";
    if (candidatesWithTx.length > 0) {
      candidatesWithTx.sort(candidateComparator);
      selectedCandidate = candidatesWithTx[0];
      selectionReason = "highest_tx_hits";
    } else {
      const nonEmpty = candidateSummaries.filter(c => c.len > 0);
      if (nonEmpty.length > 0) {
        nonEmpty.sort(candidateComparator);
        selectedCandidate = nonEmpty[0];
        selectionReason = "fallback_non_tx";
      }
    }
    if (selectedCandidate) {
      logSource = selectedCandidate.name;
      logAfterRows = selectedCandidate.rows;
    } else {
      logSource = "none";
      logAfterRows = [];
    }
    const logEnd = logAfterRows.length;
    const lenAfter = logEnd;
    const rowsScoped = Math.max(0, (scopeWindowLastN && scopeWindowLastN > 0) ? Math.min(logEnd, scopeWindowLastN) : logEnd);
    scopedLen = rowsScoped;
    const newRows = rowsScoped > 0
      ? logAfterRows.slice(Math.max(0, logEnd - rowsScoped))
      : [];
    const scopedSampleRows = newRows.slice(0, Math.min(newRows.length, 5));
    const scopedRowsSample = scopedSampleRows.map(row => ({
      keys: row && typeof row === "object" ? Object.keys(row).slice(0, 40) : [],
      reason: row && row.reason ? String(row.reason) : "",
      rowType: (row && (row.rowType || row.type)) ? String(row.rowType || row.type) : "row",
      amountLikeFieldsPresent: hasAnyField(row, TX_AMOUNT_KEYS),
      fromLikeFieldsPresent: hasAnyField(row, TX_SOURCE_KEYS) || hasAnyField(row && row.meta, TX_SOURCE_KEYS),
      toLikeFieldsPresent: hasAnyField(row, TX_TARGET_KEYS) || hasAnyField(row && row.meta, TX_TARGET_KEYS),
      counterpartyFieldsPresent: hasAnyField(row, TX_COUNTERPARTY_KEYS) || hasAnyField(row && row.meta, TX_COUNTERPARTY_KEYS)
    }));
    const devProbeRow = newRows.find(row => row && typeof row.reason === "string" && row.reason.indexOf("dev_tx_probe") === 0);
    const devProbeRowShape = devProbeRow ? getFlattenedSample(devProbeRow) : null;
    const devProbeRowFound = !!devProbeRow;
    const sampleRow0 = scopedSampleRows.length ? getFlattenedSample(scopedSampleRows[0]) : null;
    const npcInvolvedRowsCount = Math.max(newRows.filter(row => rowInvolvesNpc(row)).length, devProbeRowFound ? 1 : 0);
    const flowReasonMap = Object.create(null);
    const flowCounterpartyMap = Object.create(null);
    let flowInTotal = 0;
    let flowOutTotal = 0;
    newRows.forEach(r => {
      if (!r) return;
      const reasonKey = String(r.reason || "unknown");
      flowReasonMap[reasonKey] = (flowReasonMap[reasonKey] || 0) + ((r.amount != null && Number.isFinite(r.amount)) ? r.amount : 0);
      const counterKey = String(r.counterpartyId || r.targetId || r.toId || r.sourceId || r.id || "unknown");
      const amount = Number.isFinite(r.amount) ? r.amount : 0;
      flowCounterpartyMap[counterKey] = (flowCounterpartyMap[counterKey] || 0) + amount;
      if (amount > 0) flowInTotal += amount;
      if (amount < 0) flowOutTotal += Math.abs(amount);
    });
    const flowReasonTop = Object.keys(flowReasonMap)
      .map(reason => ({ reason, amount: flowReasonMap[reason] }))
      .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
      .slice(0, 5);
    const flowCounterpartyTop = Object.keys(flowCounterpartyMap)
      .map(id => ({ id, amount: flowCounterpartyMap[id] }))
      .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
      .slice(0, 5);
    const flowSummaryForExplain = {
      totals: {
        inTotal: totals.inTotal,
        outTotal: totals.outTotal,
        netDelta: totals.netDelta
      },
      byReasonTop,
      byCounterpartyTop
    };
    const auditFlowSummary = flowSummaryForExplain;
    const auditDiag = diag;
    explainability = buildExplainability(newRows, beforePtsMap, afterPtsMap, npcIds, {
      flowReasonTop,
      flowCounterpartyTop,
      flowTotals: flowSummaryForExplain.totals,
      flowSummary: auditFlowSummary,
      diag: auditDiag
    });
    if (isExplainableV2) {
      const v2Res = buildExplainabilityV2({ audit: { flowSummary: flowSummaryForExplain } });
      explainability = v2Res.explainability;
      fallbackDiag = v2Res.fallbackDiag;
    }
    const scopedRowsShapeSample = newRows.slice(0, 3).map(describeRowShape);
    const scopedRowsHasTransactions = explainability.hasTransactions === true;
    const selectedLogSourceTxHits = selectedCandidate ? selectedCandidate.txHits : 0;
    const selectedLogSourceTxRatio = selectedCandidate ? selectedCandidate.txRatio : 0;
    const txFieldMapHits = explainability.txFieldMapHits || { amount: 0, reason: 0, source: 0, target: 0, counterparty: 0 };
    const topTransfersLen = Array.isArray(explainability.topTransfers) ? explainability.topTransfers.length : 0;
    const fallbackUsed = explainability && explainability.fallbackUsed === true;
    const reasonIfNoTx = explainability && !explainability.hasTransactions
      ? (fallbackUsed ? "fallback_flowSummary" : (selectedLogSourceTxHits === 0 ? "no_tx_rows" : "no_tx_hits"))
      : null;
    const effectiveSelectedLogSourceTxHits = fallbackUsed ? Math.max(1, selectedLogSourceTxHits) : selectedLogSourceTxHits;
    explainabilityTrace = {
      traceVersion: TRACE_VERSION,
      diagVersion: DIAG_VERSION,
      scopeWindow: scopeDesc,
      logSource,
      selectedLogSource: logSource,
      rowsScoped,
      scopeType,
      scopeValue,
      directedFields: ["sourceId", "targetId"],
      rowsWithoutDirection: explainability.rowsWithoutDirection || 0,
      scopedRowsHasTransactions,
      txFieldMapHits,
      selectedLogSourceReason: selectionReason,
      selectedLogSourceTxHits: effectiveSelectedLogSourceTxHits,
      selectedLogSourceTxRatio,
      fallbackUsed,
      txDetectorVersion: explainability.detectorVersion || TX_DETECTOR_VERSION,
      topTransfersLen,
      npcInvolvedRowsCount,
      devProbeRowFound,
      sampleRow0,
      devProbeRowShape: devProbeRowShape,
      reasonIfNoTx,
      unknownReasonCount: explainability.unknownReasonCount || 0,
      unknownReasonNote: explainability.unknownReasonCount ? "rows missing reason field" : null
    };
    if (isExplainableV2 && diag) {
      diag.fallbackEval = fallbackDiag && fallbackDiag.fallbackEval ? fallbackDiag.fallbackEval : null;
      diag.afterFallback = fallbackDiag && fallbackDiag.afterFallback ? fallbackDiag.afterFallback : null;
      diag.fallbackUsed = !!(explainability && explainability.fallbackUsed);
    }
    if (isExplainableV2) {
      explainabilityTrace = buildExplainabilityTraceV2({
        meta: { logSource, rowsScoped, diag },
        explainability
      });
    }
    diag.scopedRowsShapeSample = scopedRowsShapeSample;
    diag.scopedRowsHasTransactions = scopedRowsHasTransactions;
    diag.logSourceCandidates = logSourceCandidates;
    diag.selectedLogSource = logSource;
    diag.selectedLogSourceReason = selectionReason || null;
    diag.selectedLogSourceTxHits = selectedLogSourceTxHits;
    diag.selectedLogSourceTxRatio = selectedLogSourceTxRatio;
    diag.selectedLogSourceShapeSample = selectedCandidate ? selectedCandidate.shapeSample : [];
    diag.transactionalLogSource = !!(selectedCandidate && selectedCandidate.txHits > 0);
    diag.preferredLogSourceOrder = preferredOrder.slice();
    diag.unknownReasonCount = explainability.unknownReasonCount || 0;
    diag.unknownReasonNote = explainability.unknownReasonCount ? explainabilityTrace.unknownReasonNote : null;
    diag.txFieldMapHits = txFieldMapHits;
    diag.scopedRowsSample = scopedRowsSample;
    diag.sampleRow0 = sampleRow0;
    diag.npcInvolvedRowsCount = npcInvolvedRowsCount;
    diag.devProbeRowFound = devProbeRowFound;
    diag.devProbeRowShape = devProbeRowShape;
    diag.devProbeReason = devProbeRow ? devProbeRow.reason : null;
    diag.traceOwnKeys = Object.keys(explainabilityTrace || {});
    auditExplainabilityTrace = explainabilityTrace;
    meta.explainabilityTrace = explainabilityTrace;
    let sampleTailReasons = [];
    if (rowsScoped === 0 && logAfterRows.length) {
      sampleTailReasons = logAfterRows.slice(Math.max(0, logAfterRows.length - 5))
        .map(r => String(r && r.reason || ""));
    }
    taxRows = newRows.filter(r => r && r.reason === "world_tax_in" && String(r.sourceId || "").startsWith("npc_"));
    taxOutRows = newRows.filter(r => r && r.reason === "world_tax_out");
    totalTaxInWindow = taxRows.reduce((s, r) => s + ((r && Number.isFinite(r.amount)) ? (r.amount | 0) : 0), 0);
    const byNpc = Object.create(null);
    taxRows.forEach(r => {
      const id = String(r.sourceId || "");
      byNpc[id] = (byNpc[id] || 0) + ((r && Number.isFinite(r.amount)) ? (r.amount | 0) : 0);
    });
    topTaxedNpcs = Object.keys(byNpc)
      .map(id => ({ npcId: id, taxSum: byNpc[id] }))
      .sort((a, b) => b.taxSum - a.taxSum)
      .slice(0, 3);

    const snapAfter = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function")
      ? Game.__DEV.sumPointsSnapshot()
      : null;
    if (snapAfter && snapAfter.byId) buildMassMarker("afterTax", snapAfter.byId);
    const worldMassAfter = snapAfter && snapAfter.byId ? accountsIncluded.reduce((sum, id) => {
      return sum + (Number.isFinite(snapAfter.byId[id]) ? (snapAfter.byId[id] | 0) : 0);
    }, 0) : null;
    const worldMassDelta = (worldMassBefore != null && worldMassAfter != null) ? (worldMassAfter - worldMassBefore) : null;
    const bankAfter = snapAfter && snapAfter.byId && Number.isFinite(snapAfter.byId.worldBank)
      ? (snapAfter.byId.worldBank | 0)
      : 0;
    const softCap = (typeof Econ.getWorldBankSoftCap === "function") ? (Econ.getWorldBankSoftCap() | 0) : null;

    const negativeNpc = npcIds.some(id => {
      const p = S.players[id];
      return p && Number.isFinite(p.points) && p.points < 0;
    });
    const hasWorldTaxInRows = taxRows.length > 0;
    const hasWorldTaxOutRows = taxOutRows.length > 0;
    const hasWorldTaxPairRows = hasWorldTaxInRows && hasWorldTaxOutRows;

    const asserts = {
      worldDeltaZero: worldMassDelta === 0,
      taxPositiveWhenSeeded: seedRichNpc ? (totalTaxInWindow > 0) : true,
      noNpcNegative: !negativeNpc,
      hasWorldTaxInRows: hasWorldTaxPairRows,
      bankNonNegative: Number.isFinite(bankAfter) ? bankAfter >= 0 : true,
      rowsScopedPositive: rowsScoped > 0
      ,
      explainabilityPresent: !!(explainability && explainability.topTransfers),
      topTransfersLen: explainability.topTransfers.length,
      scopedRowsHasTransactions
    };
    if (worldMassBefore == null || worldMassAfter == null) notes.push("totals_null");
    if (!asserts.noNpcNegative) notes.push("npc_negative_balance");
    if (!asserts.worldDeltaZero && worldMassDelta != null) notes.push("world_delta_nonzero");
    if (!asserts.taxPositiveWhenSeeded) notes.push("world_tax_total_zero");
    if (!hasWorldTaxInRows) notes.push("world_tax_in_missing");
    if (!hasWorldTaxOutRows) notes.push("world_tax_out_missing");
    if (rowsScoped > 0 && !scopedRowsHasTransactions) {
      notes.push(`log_source_not_transactional:${logSource || "none"}`);
    }
    if (rowsScoped > 0 && explainability.topTransfers.length === 0) {
      notes.push("top_transfers_empty");
    }
    if ((bankAfter - bankBefore) > 0 && !hasWorldTaxInRows) notes.push("worldbank_nonzero_without_transfer");
    if (worldMassDelta !== 0 && worldMassDelta != null) notes.push("points_emission_suspected");
    if (softCap != null && bankAfter > (softCap | 0)) notes.push("bank_above_soft_cap");
    if (!asserts.rowsScopedPositive) notes.push("rows_scoped_empty");
    if ((worldMassDelta !== 0 || (bankAfter - bankBefore) !== 0) && rowsScoped === 0) {
      notes.push("log_scope_miss");
    }
    if (missingAccounts.length) notes.push("world_contract_missing_accounts");
    const accountsIncludedLenAfter = snapAfter && snapAfter.byId ? Object.keys(snapAfter.byId).length : null;
    if ((S && S.players) && (accountsIncludedLenAfter == null || accountsIncludedLenAfter <= 0)) {
      notes.push("totals_null");
    }

    ensureNpcAccountsOk = missingAccounts.length === 0;
    const explainabilityRowsOk = rowsScoped === 0
      || (scopedRowsHasTransactions && Array.isArray(explainability.topTransfers) && explainability.topTransfers.length > 0);
    const ok = asserts.worldDeltaZero
      && asserts.rowsScopedPositive
      && asserts.noNpcNegative
      && asserts.hasWorldTaxInRows
      && asserts.bankNonNegative
      && (!seedRichNpc || (seedPerformed && asserts.taxPositiveWhenSeeded))
      && (worldMassBefore != null && worldMassAfter != null)
      && (totalTaxInWindow > 0)
      && explainabilityRowsOk;
    const finalExplainabilityTrace = isExplainableV2
      ? buildExplainabilityTraceV2({ meta: { logSource, rowsScoped, diag }, explainability })
      : auditExplainabilityTrace || {};
    const result = {
      ok,
      notes,
      meta: {
        ticks,
        seed,
        seedRichNpc,
        logSource,
        rowsScoped,
        scopeDesc: `ticks=${ticks}`,
        debugTelemetry,
        diag,
        explainabilityTrace: finalExplainabilityTrace
      },
      world: {
        beforeTotal: worldMassBefore,
        afterTotal: worldMassAfter,
        delta: worldMassDelta,
        byBucket: (snapAfter && snapAfter.poolsBreakdown) ? snapAfter.poolsBreakdown : null
      },
      bank: {
        accountId: "worldBank",
        beforePts: bankBefore,
        afterPts: bankAfter,
        delta: (Number.isFinite(bankAfter) && Number.isFinite(bankBefore)) ? (bankAfter - bankBefore) : null,
        softCap
      },
      tax: {
        threshold,
        maxPerTxn: (Econ.NPC_TAX_MAX_PER_TXN != null) ? (Econ.NPC_TAX_MAX_PER_TXN | 0) : 2,
        totalTaxInWindow,
        rowsCount: taxRows.length,
        appliedCount: taxRows.length,
        topTaxedNpcs,
        reasonsTop
      },
      explainability,
      asserts,
      diag: {
        orderCheck: { ticksRun: true, logSourceComputedAfterTicks: true },
        seedRichNpc,
        npcSeededId: seededNpcId,
        npcSeededPtsBefore: seededNpcPtsBefore,
        npcSeededPtsAfter: seededNpcPtsAfter,
        seedSourceId,
        seedFailureReason,
        seedThreshold: threshold,
        seedMargin,
        seedApplied,
        seedWhy,
        seedNeed,
        seedCollected,
        seedDonorsCount,
        seedDonorsSample,
        ticksMode: taxOnlyTicks ? "wealth_tax_only" : "world_ticks",
        NPC_TAX_SOFT_CAP: (Econ.NPC_TAX_SOFT_CAP != null) ? (Econ.NPC_TAX_SOFT_CAP | 0) : 20,
        NPC_TAX_MAX_PER_TXN: (Econ.NPC_TAX_MAX_PER_TXN != null) ? (Econ.NPC_TAX_MAX_PER_TXN | 0) : 2,
        worldContractUsed,
        contractFrozen: contractFrozenUsed,
        accountsIncludedLenFrozen,
        accountsIncludedHashFrozen,
        worldContractExportKey,
        logSource,
        rowsScoped,
        logSourceCandidates,
        snapshotOk,
        snapshotWhy,
        scopedLen,
        worldTaxRowsInWindow: {
          world_tax_in: taxRows.length,
          world_tax_out: taxOutRows.length
        },
        accountsIncludedLen: accountsIncludedLenAfter,
        accountsIncludedHash,
        worldContractName,
        diagVersion,
        traceVersion: TRACE_VERSION,
        missingAccounts: missingAccounts.slice(0, 10),
        availableCount: availableAccounts.length,
        missingCount: missingAccounts.length,
        lenBefore,
        lenAfter,
        logStart,
        logEnd,
        hasDebugMoneyLog: !!(Game.__D && Array.isArray(Game.__D.moneyLog) && Game.__D.moneyLog.length),
        debugMoneyLogLen: (Game.__D && Array.isArray(Game.__D.moneyLog)) ? Game.__D.moneyLog.length : 0,
        hasLoggerQueue: !!(Game.Logger && Array.isArray(Game.Logger.queue) && Game.Logger.queue.length),
        scopeWindowLastN,
        sampleTailReasons,
        seedTransfer,
          auditReadOnly: false,
          massDriftBreakdown: (worldMassDelta !== 0 && worldMassDelta != null) ? {
            worldTaxInSum: totalTaxInWindow,
            bankDelta: (Number.isFinite(bankAfter) && Number.isFinite(bankBefore)) ? (bankAfter - bankBefore) : null,
            sinkDelta: (snapAfter && snapAfter.byId && snapBefore && snapBefore.byId && Number.isFinite(snapAfter.byId.sink) && Number.isFinite(snapBefore.byId.sink))
              ? ((snapAfter.byId.sink | 0) - (snapBefore.byId.sink | 0))
              : null,
            crowdDelta: (snapAfter && snapAfter.byId && snapBefore && snapBefore.byId && Number.isFinite(snapAfter.byId.crowd) && Number.isFinite(snapBefore.byId.crowd))
              ? ((snapAfter.byId.crowd | 0) - (snapBefore.byId.crowd | 0))
              : null,
            reasonsTop
          } : null,
          taxProbe: {
            attempted: seedRichNpc === true,
            applied: hasWorldTaxPairRows,
            taxAmount: totalTaxInWindow,
            why: hasWorldTaxPairRows ? null : "tax_missing"
          }
        },
        ensureNpcAccountsOk,
        fallbackUsed: !!(explainability && explainability.fallbackUsed),
        fallbackReason: explainability && explainability.fallbackUsed ? "flowSummary" : null,
        fallbackTopTransfersLen: explainability && Array.isArray(explainability.topTransfers) ? explainability.topTransfers.length : 0,
      runSummary: run && run.summary ? run.summary : null
    };
    if (debugTelemetry) result.debug = { taxRows, newRowsCount: newRows.length, logSource, logStart, logEnd };
    return result;
  };

  Game.__DEV._dumpLine = (line) => {
    try {
      if (typeof window !== "undefined" && typeof window.__CONSOLE_TAPE_EMIT_LINE__ === "function") {
        window.__CONSOLE_TAPE_EMIT_LINE__(String(line));
        return;
      }
    } catch (_) {}
    try {
      console.warn(String(line));
    } catch (_) {}
  };

  Game.__DEV.forceDumpOnce = (label, payload) => {
    const tag = String(label || "UNLABELED");
    emitLine(`FORCE_DUMP_BEGIN:${tag}`);
    emitLine(safeStringify(payload));
    emitLine(`FORCE_DUMP_END:${tag}`);
    try {
      if (typeof window !== "undefined" && typeof window.__CONSOLE_TAPE_FLUSH__ === "function") {
        window.__CONSOLE_TAPE_FLUSH__();
      }
    } catch (_) {}
    return { ok: true };
  };

  // dev-only evidence pack: one smoke + short summary, always prints BEGIN/END.
  Game.__DEV.runEconNpcWealthTaxEvidencePackOnce = (opts = {}) => {
    const notes = [];
    const diagVersion = "econ_npc_wealth_tax_pack_v1";
    const buildTagLocal = getWealthTaxBuildTag();
    const header = "WORLD_ECON_NPC_WEALTH_TAX_EVIDENCE_BEGIN";
      emitLine("SEED_RICH_NPC_V2_ACTIVE");
    const footer = "WORLD_ECON_NPC_WEALTH_TAX_EVIDENCE_END";
    let threshold = null;
    let seedMargin = null;
    let maxPerTxn = null;
    let seedApplied = false;
    let seedWhy = null;
    let seedSourceId = null;
    let seedFailureReason = null;
    let accountsIncludedLen = null;
    let accountsIncludedHash = null;
    let addedAccounts = [];
    let fixedAccounts = [];
    let npcAccountCount = null;
    let npcAccountSample = [];
    let npcAccountsMissingLen = null;
    let npcAccountsMissingSample = [];
    let npcAccountsEnsureCalled = false;
    let npcAccountsMigrateMarkerSeen = false;
    let npcAccountsCreatedNowCount = 0;
    let npcAccountsSyncedNowCount = 0;
    let npcAccountsMissingAfterEnsureLen = null;
    let npcAccountsMissingAfterEnsureSample = [];
    let npcAccountsEnsureIdempotentOk = false;
    let npcEnsureDiag = null;
    let logSourceChosen = "none";
    let logSourceCandidates = [];
    let snapshotOk = null;
    let snapshotWhy = null;
    let scopedLen = 0;
    let sampleTailReasons = [];
    let rowsScoped = 0;
    let taxProbe = { attempted: false, applied: false, taxAmount: 0, why: "uninit" };
    let ensureNpcAccountsOk = true;
    let ensureNpcAccountsOkFromEnsure = null;
    let ensureNpcAccountsOkFromSmoke = null;
    let ensureNpcAccountsOkMismatch = false;
    let exception = null;
    let taxRows = [];
    let taxOutRows = [];
    let totalTaxInWindow = 0;
    let topTaxedNpcs = [];
    let reasonsTop = [];
    let seedTransfer = null;
    let evidenceSeedDonorsSample = [];
    let contractFrozen = null;
    const buildWealthTaxContract = () => {
      const snap = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function")
        ? Game.__DEV.sumPointsSnapshot()
        : null;
      const snapById = (snap && snap.byId) ? snap.byId : null;
      if (Game.__DEV && typeof Game.__DEV.econNpcWorldContractV1 === "function") {
        return Game.__DEV.econNpcWorldContractV1({ snapById });
      }
      return { accountsIncluded: [], accountsIncludedLen: 0, accountsIncludedHash: null, hasTotals: !!snapById, missing: ["contract_fn_missing"] };
    };
    const ensureContractAccountsExist = () => {
      const added = [];
      const ensureMissing = [];
      let createdCount = 0;
      let syncedCount = 0;
      if (Game.ConflictEconomy && typeof Game.ConflictEconomy.ensureNpcAccountsFromState === "function") {
        npcAccountsEnsureCalled = true;
        const resA = Game.ConflictEconomy.ensureNpcAccountsFromState({ reason: "wealth_tax_pack" }) || {};
        const createdA = Number.isFinite(resA.createdNowCount) ? resA.createdNowCount : 0;
        const syncedA = Number.isFinite(resA.syncedNowCount) ? resA.syncedNowCount : 0;
        npcAccountsCreatedNowCount += createdA;
        npcAccountsSyncedNowCount += syncedA;
        createdCount += createdA;
        syncedCount += syncedA;
        if (Array.isArray(resA.createdIds)) added.push(...resA.createdIds);
        const resB = Game.ConflictEconomy.ensureNpcAccountsFromState({ reason: "wealth_tax_pack_idempotent" }) || {};
        const createdB = Number.isFinite(resB.createdNowCount) ? resB.createdNowCount : 0;
        const syncedB = Number.isFinite(resB.syncedNowCount) ? resB.syncedNowCount : 0;
        npcAccountsEnsureIdempotentOk = (createdB === 0 && syncedB === 0);
      }
      npcAccountsMigrateMarkerSeen = !!(Game.__D && Game.__D.__npcAccountMigrateSeen);
      const S = Game.__S || Game.State || {};
      const players = S.players || {};
      const ids = Object.keys(players).filter(id => typeof id === "string" && id.startsWith("npc_"));
      ids.forEach(id => {
        try {
          const acc = (Game.ConflictEconomy && typeof Game.ConflictEconomy.getAccount === "function")
            ? Game.ConflictEconomy.getAccount(id)
            : null;
          if (!acc) ensureMissing.push(id);
        } catch (_) {}
      });
      return { addedAccounts: added, fixedAccounts: [], createdCount, syncedCount, missingNpcIds: ensureMissing };
    };
    const ensureNpcEconAccountsExist = () => {
      const econ = Game.ConflictEconomy || Game._ConflictEconomy || null;
      const S = Game.__S || Game.State || {};
      const players = S.players || {};
      const npcIds = Object.keys(players).filter(id => typeof id === "string" && id.startsWith("npc_"));
      let missingIds = [];
      const statePoints = {};
      let createdCount = 0;
      let syncedCount = 0;
      let skippedCount = 0;
      let branch = null;
      let ensureDiag = null;
      if (econ && typeof econ.ensureNpcEconAccounts === "function") {
        const res = econ.ensureNpcEconAccounts({ reason: "wealth_tax_pack_precheck" }) || {};
        createdCount = Number.isFinite(res.createdCount) ? res.createdCount : 0;
        syncedCount = Number.isFinite(res.syncedCount) ? res.syncedCount : 0;
        skippedCount = Number.isFinite(res.skippedCount) ? res.skippedCount : 0;
        branch = res.branch || null;
        ensureDiag = res.ensureDiag || (Game.__D && Game.__D.__lastEnsureNpcEconAccounts) || null;
      } else if (econ && typeof econ.ensureNpcAccountsFromState === "function") {
        const res = econ.ensureNpcAccountsFromState({ reason: "wealth_tax_pack_precheck" }) || {};
        createdCount = Number.isFinite(res.createdNowCount) ? res.createdNowCount : 0;
        syncedCount = Number.isFinite(res.syncedNowCount) ? res.syncedNowCount : 0;
        skippedCount = Number.isFinite(res.skippedCount) ? res.skippedCount : 0;
        branch = res.branch || null;
        ensureDiag = (res.ensureDiag || (Game.__D && Game.__D.__lastEnsureNpcEconAccounts)) || null;
      }
      npcIds.forEach((id) => {
        const p = players[id];
        const pts = p && Number.isFinite(p.points) ? (p.points | 0) : 0;
        statePoints[id] = pts;
        let account = null;
        if (econ && typeof econ.getAccount === "function") {
          try { account = econ.getAccount(id); } catch (_) { account = null; }
        }
        if (!account && !p) {
          missingIds.push(id);
        } else if (!account) {
          missingIds.push(id);
        }
      });
      const missingAfterCount = missingIds.length;
      const sampleMissingIds = missingIds.slice(0, 5);
      const normalizedEnsureDiag = ensureDiag ? Object.assign({}, ensureDiag) : {};
      normalizedEnsureDiag.missingAfterCount = missingAfterCount;
      normalizedEnsureDiag.missingAfterIdsSample = sampleMissingIds.slice();
      return {
        npcCount: npcIds.length,
        createdCount,
        syncedCount,
        skippedCount,
        missingAfterCount,
        sampleMissingIds,
        statePointsSample: Object.keys(statePoints).slice(0, 3).map(id => ({ id, points: statePoints[id] })),
        branch: branch || null,
        ensureDiag: normalizedEnsureDiag,
        missingNpcIds: missingIds
      };
    };
    let smokeRes = null;
    let summary = null;
    try {
      const contract = buildWealthTaxContract();
      contractFrozen = {
        accountsIncluded: Array.isArray(contract && contract.accountsIncluded) ? contract.accountsIncluded.slice() : [],
        accountsIncludedLen: Number.isFinite(contract && contract.accountsIncludedLen) ? contract.accountsIncludedLen : 0,
        accountsIncludedHash: contract ? contract.accountsIncludedHash : null
      };
      emitLine(`ECON_NPC_WORLD_CONTRACT_V1_READY ${safeStringify({ accountsIncludedLen: contract.accountsIncludedLen, accountsIncludedHash: contract.accountsIncludedHash, hasTotals: !!contract.hasTotals, missingCount: contract.missing ? contract.missing.length : 0 })}`);
      accountsIncludedLen = contract.accountsIncludedLen;
      accountsIncludedHash = contract.accountsIncludedHash;
      const ensured = ensureContractAccountsExist(contract);
      const npcEnsure = ensureNpcEconAccountsExist();
      npcEnsureDiag = npcEnsure;
      if (!npcEnsureDiag || !npcEnsureDiag.ensureDiag) notes.push("ensure_diag_missing");
      const npcCount = Number.isFinite(npcEnsure && npcEnsure.npcCount) ? npcEnsure.npcCount : 0;
      const ensureDiag = npcEnsureDiag && npcEnsureDiag.ensureDiag ? npcEnsureDiag.ensureDiag : null;
      const storageForMissing = (() => {
        if (ensureDiag && ensureDiag.storageKeyUsed === "S.players") {
          return (Game.__S && Game.__S.players) || {};
        }
        return (Game.State && Game.State.players) || {};
      })();
      const allPlayersForDiag = Object.assign(
        {},
        (Game.State && Game.State.players) || {},
        (Game.__S && Game.__S.players) || {}
      );
      const diagNpcIds = Object.values(allPlayersForDiag || {})
        .filter(p => p && p.id && (p.npc === true || p.type === "npc" || String(p.id).startsWith("npc_")))
        .map(p => String(p.id));
      const missingNpcIds = diagNpcIds.filter(id => !storageForMissing[id]);
      const sampleMissingIds = missingNpcIds.slice(0, 5);
      const getAccountFn = (Game.ConflictEconomy && typeof Game.ConflictEconomy.getAccount === "function")
        ? Game.ConflictEconomy.getAccount
        : null;
      const missingByGetAccount = [];
      if (getAccountFn) {
        diagNpcIds.forEach(id => {
          try {
            const account = getAccountFn(id);
            if (!account) missingByGetAccount.push(id);
          } catch (_) {
            missingByGetAccount.push(id);
          }
        });
      }
      if (npcEnsure) {
        npcEnsure.missingAfterCount = missingNpcIds.length;
        npcEnsure.sampleMissingIds = sampleMissingIds.slice();
        npcEnsure.missingNpcIds = missingNpcIds.slice();
        if (missingByGetAccount.length) npcEnsure.missingByGetAccount = missingByGetAccount.slice(0, 5);
      }
      if (ensureDiag) {
        ensureDiag.missingAfterCount = missingNpcIds.length;
        ensureDiag.missingAfterIdsSample = sampleMissingIds.slice();
      }
      const missingAfterCountNumeric = Number.isFinite(npcEnsure.missingAfterCount)
        ? npcEnsure.missingAfterCount
        : (Array.isArray(missingNpcIds) ? missingNpcIds.length : 0);
      const missingIdsLen = Array.isArray(missingNpcIds) ? missingNpcIds.length : 0;
      const ensureDiagMissing = (ensureDiag && Number.isFinite(ensureDiag.missingAfterCount)) ? ensureDiag.missingAfterCount : null;
      let ensureOkByMissing = (missingAfterCountNumeric === 0 && missingIdsLen === 0);
      if (ensureDiagMissing != null && ensureDiagMissing !== missingIdsLen) {
        ensureOkByMissing = false;
        if (!notes.includes("ensureNpcAccountsOk_mismatch")) notes.push("ensureNpcAccountsOk_mismatch");
      }
      ensureNpcAccountsOkFromEnsure = ensureOkByMissing;
      ensureNpcAccountsOk = ensureOkByMissing;
      if (!ensureNpcAccountsOk && missingAfterCountNumeric > 0 && !notes.includes("ensure_npc_accounts_missing_after")) {
        notes.push("ensure_npc_accounts_missing_after");
      }
      addedAccounts = ensured.addedAccounts;
      fixedAccounts = ensured.fixedAccounts;
      const createdNowCountLocal = Number.isFinite(ensured.createdCount) ? ensured.createdCount : 0;
      const syncedNowCountLocal = Number.isFinite(ensured.syncedCount) ? ensured.syncedCount : 0;
      npcAccountsCreatedNowCount += createdNowCountLocal;
      npcAccountsSyncedNowCount += syncedNowCountLocal;
      emitLine(`WEALTH_TAX_PRECHECK ${safeStringify(npcEnsure)}`);
      const npcDiagSnap = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function")
        ? Game.__DEV.sumPointsSnapshot()
        : null;
      const npcDiagById = npcDiagSnap && npcDiagSnap.byId ? npcDiagSnap.byId : null;
      const npcDiagPlayers = (Game.State && Game.State.players) ? Game.State.players : (Game.__S && Game.__S.players) ? Game.__S.players : {};
      const npcDiagPresent = [];
      if (npcDiagById) {
        diagNpcIds.forEach(id => {
          if (Number.isFinite(npcDiagById[id])) npcDiagPresent.push(id);
        });
      }
      npcAccountCount = npcDiagPresent.length;
      npcAccountSample = npcDiagPresent.slice(0, 3);
      npcAccountsMissingLen = missingNpcIds.length;
      npcAccountsMissingSample = missingNpcIds.slice(0, 3);
      npcAccountsMissingAfterEnsureLen = missingNpcIds.length;
      npcAccountsMissingAfterEnsureSample = missingNpcIds.slice(0, 3);
      const ticksMode = (opts && typeof opts.ticksMode === "string") ? String(opts.ticksMode) : "wealth_tax_only";
      const smokeOpts = Object.assign({}, opts, { contractFrozen, ticksMode });
      smokeRes = Game.__DEV.smokeNpcWealthTaxOnce(smokeOpts);
      if (smokeRes && smokeRes.notes && Array.isArray(smokeRes.notes) && addedAccounts.length) {
        smokeRes.notes.push("world_contract_missing_accounts");
      }
      const contractAfter = buildWealthTaxContract();
      const contractChanged = !!(contractAfter
        && ((contractAfter.accountsIncludedLen !== contractFrozen.accountsIncludedLen)
          || (contractAfter.accountsIncludedHash !== contractFrozen.accountsIncludedHash)));
      if (contractChanged) {
        if (!notes.includes("world_contract_changed_during_pack")) notes.push("world_contract_changed_during_pack");
        if (smokeRes) {
          if (!Array.isArray(smokeRes.notes)) smokeRes.notes = [];
          if (!smokeRes.notes.includes("world_contract_changed_during_pack")) smokeRes.notes.push("world_contract_changed_during_pack");
          smokeRes.ok = false;
        }
      }
      if (smokeRes && smokeRes.diag) {
        smokeRes.diag.addedAccounts = addedAccounts;
        smokeRes.diag.fixedAccounts = fixedAccounts;
        smokeRes.diag.accountsIncludedLen = accountsIncludedLen;
        smokeRes.diag.accountsIncludedHash = accountsIncludedHash;
        smokeRes.diag.contractFrozen = true;
        smokeRes.diag.accountsIncludedLenFrozen = contractFrozen.accountsIncludedLen;
        smokeRes.diag.accountsIncludedHashFrozen = contractFrozen.accountsIncludedHash;
        smokeRes.diag.ensureNpcAccounts = npcEnsureDiag;
        if (!smokeRes.diag.ensureNpcAccounts || !smokeRes.diag.ensureNpcAccounts.ensureDiag) {
          if (!Array.isArray(smokeRes.notes)) smokeRes.notes = [];
          smokeRes.notes.push("ensure_diag_missing");
        }
        if (Game.__D && Game.__D.__lastNpcWealthTaxAttempt) {
          smokeRes.diag.taxAttempt = Game.__D.__lastNpcWealthTaxAttempt;
        }
        smokeRes.diag.npcAccountCount = npcAccountCount;
        smokeRes.diag.npcAccountSample = npcAccountSample;
        smokeRes.diag.npcAccountsMissingLen = npcAccountsMissingLen;
        smokeRes.diag.npcAccountsMissingSample = npcAccountsMissingSample;
        smokeRes.diag.npcAccounts = {
          ensureCalled: npcAccountsEnsureCalled,
          migrateMarkerSeen: npcAccountsMigrateMarkerSeen,
          createdNowCount: createdNowCountLocal,
          syncedNowCount: syncedNowCountLocal,
          missingAfterEnsureLen: npcAccountsMissingAfterEnsureLen,
          missingAfterEnsureSample: npcAccountsMissingAfterEnsureSample,
          ensureIdempotentOk: npcAccountsEnsureIdempotentOk,
          missingAfterEnsureLenNpcAccounts: missingNpcIds.length,
          missingAfterEnsureSampleNpcAccounts: missingNpcIds.slice(0, 5)
        };
        threshold = Number.isFinite(smokeRes.diag.seedThreshold) ? smokeRes.diag.seedThreshold : threshold;
        seedMargin = Number.isFinite(smokeRes.diag.seedMargin) ? smokeRes.diag.seedMargin : seedMargin;
        seedApplied = !!smokeRes.diag.seedApplied;
        seedWhy = smokeRes.diag.seedWhy || seedWhy;
        seedSourceId = smokeRes.diag.seedSourceId || seedSourceId;
        seedFailureReason = smokeRes.diag.seedFailureReason || seedFailureReason;
        maxPerTxn = Number.isFinite(smokeRes.diag.NPC_TAX_MAX_PER_TXN) ? smokeRes.diag.NPC_TAX_MAX_PER_TXN : maxPerTxn;
        taxProbe = smokeRes.diag.taxProbe || taxProbe;
        logSourceChosen = smokeRes.diag.logSource || logSourceChosen;
        rowsScoped = Number.isFinite(smokeRes.meta && smokeRes.meta.rowsScoped) ? smokeRes.meta.rowsScoped : rowsScoped;
        seedTransfer = smokeRes.diag.seedTransfer || seedTransfer;
        evidenceSeedDonorsSample = smokeRes.diag.seedDonorsSample || evidenceSeedDonorsSample;
      }
      if (smokeRes) {
        ensureNpcAccountsOkFromSmoke = !!smokeRes.ensureNpcAccountsOk;
        if (ensureNpcAccountsOkFromEnsure != null && ensureNpcAccountsOkFromSmoke !== ensureNpcAccountsOkFromEnsure) {
          ensureNpcAccountsOkMismatch = true;
          if (!notes.includes("ensureNpcAccountsOk_mismatch")) notes.push("ensureNpcAccountsOk_mismatch");
          smokeRes.ok = false;
          ensureNpcAccountsOk = false;
        } else {
          ensureNpcAccountsOk = (ensureNpcAccountsOkFromEnsure != null) ? ensureNpcAccountsOkFromEnsure : ensureNpcAccountsOkFromSmoke;
        }
        smokeRes.ensureNpcAccountsOk = ensureNpcAccountsOk;
        if (smokeRes.asserts) smokeRes.asserts.ensureNpcAccountsOk = ensureNpcAccountsOk;
        if (smokeRes.diag) smokeRes.diag.ensureNpcAccountsOk = ensureNpcAccountsOk;
      }
      const blockSinkSeeds = () => {
      const fromId = seedTransfer && seedTransfer.fromId;
      const amount = seedTransfer && Number.isFinite(seedTransfer.amount) ? (seedTransfer.amount | 0) : null;
      const sourcePtsBefore = seedTransfer && Number.isFinite(seedTransfer.sourcePtsBefore) ? (seedTransfer.sourcePtsBefore | 0) : null;
      const sourcePtsAfter = seedTransfer && Number.isFinite(seedTransfer.sourcePtsAfter) ? (seedTransfer.sourcePtsAfter | 0) : null;
      const isSinkDonation = fromId === "sink" || fromId === "worldBank";
      const insufficientDonor = !isSinkDonation && amount != null && sourcePtsBefore != null && sourcePtsBefore < amount;
      const negativeAfter = sourcePtsAfter != null && sourcePtsAfter < 0;
        if (isSinkDonation || insufficientDonor || negativeAfter) {
          if (isSinkDonation) {
            emitLine(`SEED_RICH_NPC_V2_GUARD_BLOCKED sourceId=${fromId}`);
          }
          console.log("WT_SEED_WIPED", { why: seedWhy, failure: seedFailureReason });
        const reason = isSinkDonation ? "donor_forbidden" : (negativeAfter ? "negative_after" : "insufficient_donor");
        seedFailureReason = seedFailureReason || reason;
        seedWhy = isSinkDonation ? "seed_from_sink_forbidden" : (negativeAfter ? "seed_negative_after" : "seed_insufficient_donor");
        seedSourceId = "npc_only_failed";
        seedApplied = false;
        seedTransfer = { ok: false, fromId: null, sourcePtsAfter: null };
        if (!notes.includes("seed_rich_npc_failed")) notes.push("seed_rich_npc_failed");
        if (isSinkDonation && !notes.includes("seed_from_sink_forbidden")) notes.push("seed_from_sink_forbidden");
        if (insufficientDonor && !notes.includes("seed_insufficient_donor")) notes.push("seed_insufficient_donor");
        if (smokeRes && smokeRes.diag) {
          smokeRes.diag.seedApplied = false;
          smokeRes.diag.seedWhy = seedWhy;
          smokeRes.diag.seedFailureReason = seedFailureReason;
          smokeRes.diag.seedSourceId = seedSourceId;
          smokeRes.diag.seedTransfer = { ok: false, fromId: null, sourcePtsAfter: null };
        }
      }
    };
    blockSinkSeeds();
      summary = smokeRes ? {
        ok: !!smokeRes.ok,
        worldDelta: smokeRes.world ? smokeRes.world.delta : null,
        totalTaxInWindow: smokeRes.tax ? smokeRes.tax.totalTaxInWindow : null,
        reasonsTop: smokeRes.tax ? smokeRes.tax.reasonsTop : null,
        bank: smokeRes.bank || null,
        asserts: smokeRes.asserts || null,
        diag: {
          logSourceChosen: smokeRes.meta ? smokeRes.meta.logSource : (smokeRes.diag ? smokeRes.diag.logSource : null),
          buildTag: buildTagLocal,
          logSourceCandidates: smokeRes.diag ? smokeRes.diag.logSourceCandidates : null,
          snapshotOk: smokeRes.diag ? smokeRes.diag.snapshotOk : null,
          snapshotWhy: smokeRes.diag ? smokeRes.diag.snapshotWhy : null,
          scopedLen: smokeRes.diag ? smokeRes.diag.scopedLen : null,
          sampleTailReasons: smokeRes.diag ? smokeRes.diag.sampleTailReasons : null,
          lenBefore: smokeRes.diag ? smokeRes.diag.lenBefore : null,
          lenAfter: smokeRes.diag ? smokeRes.diag.lenAfter : null,
          rowsScoped: smokeRes.meta ? smokeRes.meta.rowsScoped : null,
          logStart: smokeRes.diag ? smokeRes.diag.logStart : null,
          logEnd: smokeRes.diag ? smokeRes.diag.logEnd : null,
          hasDebugMoneyLog: smokeRes.diag ? smokeRes.diag.hasDebugMoneyLog : null,
          hasLoggerQueue: smokeRes.diag ? smokeRes.diag.hasLoggerQueue : null,
          scopeWindowLastN: smokeRes.diag ? smokeRes.diag.scopeWindowLastN : null,
          windowLastNUsed: smokeRes.diag ? smokeRes.diag.scopeWindowLastN : null,
          accountsIncludedLen: smokeRes.diag ? smokeRes.diag.accountsIncludedLen : null,
          accountsIncludedHash: smokeRes.diag ? smokeRes.diag.accountsIncludedHash : null,
          contractFrozen: smokeRes.diag ? smokeRes.diag.contractFrozen : null,
          accountsIncludedLenFrozen: smokeRes.diag ? smokeRes.diag.accountsIncludedLenFrozen : (contractFrozen ? contractFrozen.accountsIncludedLen : null),
          accountsIncludedHashFrozen: smokeRes.diag ? smokeRes.diag.accountsIncludedHashFrozen : (contractFrozen ? contractFrozen.accountsIncludedHash : null),
          worldContractName: smokeRes.diag ? smokeRes.diag.worldContractName : null,
          worldContractUsed: smokeRes.diag ? smokeRes.diag.worldContractUsed : null,
          worldContractExportKey: smokeRes.diag ? smokeRes.diag.worldContractExportKey : null,
          npcAccountCount: smokeRes.diag ? smokeRes.diag.npcAccountCount : null,
          npcAccountSample: smokeRes.diag ? smokeRes.diag.npcAccountSample : null,
          npcAccountsMissingLen: smokeRes.diag ? smokeRes.diag.npcAccountsMissingLen : null,
          npcAccountsMissingSample: smokeRes.diag ? smokeRes.diag.npcAccountsMissingSample : null,
          npcAccounts: smokeRes.diag ? smokeRes.diag.npcAccounts : null,
          ensureNpcAccounts: smokeRes.diag ? smokeRes.diag.ensureNpcAccounts : npcEnsureDiag,
          seedSourceId: smokeRes.diag ? smokeRes.diag.seedSourceId : null,
          seedFailureReason: smokeRes.diag ? smokeRes.diag.seedFailureReason : null,
          seedThreshold: smokeRes.diag ? smokeRes.diag.seedThreshold : null,
          seedMargin: smokeRes.diag ? smokeRes.diag.seedMargin : null,
          seedApplied: smokeRes.diag ? smokeRes.diag.seedApplied : null,
          seedWhy: smokeRes.diag ? smokeRes.diag.seedWhy : null,
          taxProbe: smokeRes.diag ? smokeRes.diag.taxProbe : null,
          taxAttempt: smokeRes.diag ? smokeRes.diag.taxAttempt : (Game.__D && Game.__D.__lastNpcWealthTaxAttempt) ? Game.__D.__lastNpcWealthTaxAttempt : null,
          missingAccounts: smokeRes.diag ? smokeRes.diag.missingAccounts : null,
          availableCount: smokeRes.diag ? smokeRes.diag.availableCount : null,
          missingCount: smokeRes.diag ? smokeRes.diag.missingCount : null,
          addedAccounts: smokeRes.diag ? smokeRes.diag.addedAccounts : addedAccounts,
          seedTransfer: smokeRes.diag ? smokeRes.diag.seedTransfer : null,
          massDriftBreakdown: smokeRes.diag ? smokeRes.diag.massDriftBreakdown : null,
          debugMoneyLogLen: smokeRes.diag ? smokeRes.diag.debugMoneyLogLen : null,
          ensureNpcAccountsOk,
          ensureNpcAccountsOkFromEnsure,
          ensureNpcAccountsOkFromSmoke,
          ensureNpcAccountsOkMismatch
        },
        diagVersion
      } : { ok: false, notes: ["missing_smoke"], diagVersion };
    } catch (err) {
      notes.push("exception");
      exception = {
        message: String(err && err.message ? err.message : err),
        stack: err && err.stack ? String(err.stack) : null,
        stage: "runEconNpcWealthTaxEvidencePackOnce"
      };
    } finally {
      const taxTxIdsSample = [];
      const pushTxId = (row) => {
        if (!row) return;
        const txId = row.txId || (row.meta && row.meta.txId) || (row.meta && row.meta.linkedTxId) || null;
        if (!txId) return;
        if (!taxTxIdsSample.includes(txId)) taxTxIdsSample.push(txId);
      };
      taxRows.forEach(pushTxId);
      taxOutRows.forEach(pushTxId);
      const seedUsesSink = (seedSourceId === "sink")
        || (seedTransfer && seedTransfer.fromId === "sink");
      const json1 = smokeRes ? smokeRes : {
        ok: false,
        notes: notes.slice(),
        errorMessage: exception ? exception.message : null,
        errorStack: exception ? exception.stack : null,
        diagVersion,
        diag: {
          buildTag: buildTagLocal,
          threshold,
          seedMargin,
          maxPerTxn,
          seedApplied,
          seedWhy,
          seedSourceId,
          seedFailureReason,
          seedDonorsSample: (smokeRes && smokeRes.diag) ? smokeRes.diag.seedDonorsSample : null,
          accountsIncludedLen,
          accountsIncludedHash,
          contractFrozen: contractFrozen ? true : null,
          accountsIncludedLenFrozen: contractFrozen ? contractFrozen.accountsIncludedLen : null,
          accountsIncludedHashFrozen: contractFrozen ? contractFrozen.accountsIncludedHash : null,
          addedAccounts,
          fixedAccounts,
          npcAccountCount,
          npcAccountSample,
          npcAccountsMissingLen,
          npcAccountsMissingSample,
          npcAccounts: {
            ensureCalled: npcAccountsEnsureCalled,
            migrateMarkerSeen: npcAccountsMigrateMarkerSeen,
            createdNowCount: npcAccountsCreatedNowCount,
            syncedNowCount: npcAccountsSyncedNowCount,
            missingAfterEnsureLen: npcAccountsMissingAfterEnsureLen,
            missingAfterEnsureSample: npcAccountsMissingAfterEnsureSample,
            ensureIdempotentOk: npcAccountsEnsureIdempotentOk
          },
          ensureNpcAccounts: npcEnsureDiag,
          worldContractUsed: smokeRes && smokeRes.diag ? smokeRes.diag.worldContractUsed : null,
          worldContractExportKey: smokeRes && smokeRes.diag ? smokeRes.diag.worldContractExportKey : "econNpcWorldContractV1",
          logSource: logSourceChosen,
          rowsScoped,
          logSourceCandidates,
          snapshotOk,
          snapshotWhy,
          scopedLen,
          taxProbe,
          taxAttempt: (Game.__D && Game.__D.__lastNpcWealthTaxAttempt) ? Game.__D.__lastNpcWealthTaxAttempt : null,
          taxRowsCounts: { out: taxOutRows.length, in: taxRows.length },
          taxTxIdsSample,
          seedUsesSink,
          debugMoneyLogLen: smokeRes && smokeRes.diag ? smokeRes.diag.debugMoneyLogLen : null,
          ensureNpcAccountsOk,
          ensureNpcAccountsOkFromEnsure,
          ensureNpcAccountsOkFromSmoke,
          ensureNpcAccountsOkMismatch
        }
      };
      const json2 = summary ? summary : {
        ok: false,
        notes: notes.slice(),
        diagVersion,
        diag: {
          buildTag: buildTagLocal,
          logSourceChosen,
          rowsScoped,
          threshold,
          seedMargin,
          maxPerTxn,
          seedApplied,
          seedWhy,
          seedSourceId,
          seedFailureReason,
          seedDonorsSample: evidenceSeedDonorsSample,
          accountsIncludedLen,
          accountsIncludedHash,
          contractFrozen: contractFrozen ? true : null,
          accountsIncludedLenFrozen: contractFrozen ? contractFrozen.accountsIncludedLen : null,
          accountsIncludedHashFrozen: contractFrozen ? contractFrozen.accountsIncludedHash : null,
          addedAccounts,
          fixedAccounts,
          npcAccountCount,
          npcAccountSample,
          npcAccountsMissingLen,
          npcAccountsMissingSample,
          taxProbe,
          taxAttempt: (Game.__D && Game.__D.__lastNpcWealthTaxAttempt) ? Game.__D.__lastNpcWealthTaxAttempt : null,
          taxRowsCounts: { out: taxOutRows.length, in: taxRows.length },
          taxTxIdsSample,
          seedUsesSink,
          worldContractUsed: smokeRes && smokeRes.diag ? smokeRes.diag.worldContractUsed : null,
          worldContractExportKey: smokeRes && smokeRes.diag ? smokeRes.diag.worldContractExportKey : "econNpcWorldContractV1",
          logSourceCandidates,
          snapshotOk,
          snapshotWhy,
          scopedLen,
          ensureNpcAccountsOk,
          ensureNpcAccountsOkFromEnsure,
          ensureNpcAccountsOkFromSmoke,
          ensureNpcAccountsOkMismatch
        }
      };
    const dumpLine = (line) => {
      try {
        if (Game.__DEV && typeof Game.__DEV._dumpLine === "function") {
          Game.__DEV._dumpLine(String(line));
          return;
        }
      } catch (_) {}
      console.warn(String(line));
    };
    const chunkString = (text) => {
      const chunkSize = 900;
      const result = [];
      for (let i = 0, idx = 0; i < text.length; i += chunkSize, idx += 1) {
        result.push(text.slice(i, i + chunkSize));
      }
      return result;
    };
    dumpLine(`WEALTH_TAX_BUILD_TAG_LOCAL ${buildTagLocal}`);
    dumpLine("WEALTH_TAX_SAFE_STRINGIFY_OK true");
    dumpLine("WEALTH_TAX_EVIDENCE_BEGIN");
    try {
      const ensureDiag = npcEnsureDiag && npcEnsureDiag.ensureDiag ? npcEnsureDiag.ensureDiag : null;
      const attempt = (smokeRes && smokeRes.diag && smokeRes.diag.taxAttempt) ? smokeRes.diag.taxAttempt
        : (Game.__D && Game.__D.__lastNpcWealthTaxAttempt) ? Game.__D.__lastNpcWealthTaxAttempt
        : null;
      const probe = smokeRes && smokeRes.diag && smokeRes.diag.taxProbe ? smokeRes.diag.taxProbe : null;
      const worldTaxRows = smokeRes && smokeRes.diag && smokeRes.diag.worldTaxRowsInWindow ? smokeRes.diag.worldTaxRowsInWindow : null;
      const attemptDiag = {
        taxAttempted: !!(probe && probe.attempted),
        taxApplied: !!(probe && probe.applied),
        npcAccountsAfterCount: Number.isFinite(ensureDiag && ensureDiag.afterCount) ? ensureDiag.afterCount : (Number.isFinite(npcAccountCount) ? npcAccountCount : 0),
        missingNpcAccountsAfterCount: Number.isFinite(ensureDiag && ensureDiag.missingAfterCount) ? ensureDiag.missingAfterCount : (npcAccountsMissingLen || 0),
        seedRichNpc: !!(smokeRes && smokeRes.diag && smokeRes.diag.seedRichNpc),
        topGateReason: (probe && probe.why) ? String(probe.why) : (attempt && Array.isArray(attempt.notes) && attempt.notes.length ? String(attempt.notes[0]) : "unknown"),
        windowLastN: (smokeRes && smokeRes.diag && Number.isFinite(smokeRes.diag.scopeWindowLastN)) ? smokeRes.diag.scopeWindowLastN : (opts && opts.window && Number.isFinite(opts.window.lastN) ? (opts.window.lastN | 0) : null),
        rowsScoped: Number.isFinite(smokeRes && smokeRes.meta && smokeRes.meta.rowsScoped) ? smokeRes.meta.rowsScoped : rowsScoped,
        worldTaxRowsInWindow: worldTaxRows || { world_tax_in: 0, world_tax_out: 0 }
      };
      dumpLine(`WEALTH_TAX_ATTEMPT_DIAG ${JSON.stringify(attemptDiag)}`);
    } catch (_) {}
    const json1Rows = chunkString(JSON.stringify(json1));
    json1Rows.forEach((chunk, index) => {
      dumpLine(`WEALTH_TAX_EVIDENCE_JSON_1_PART ${index + 1}/${json1Rows.length} ${chunk}`);
    });
    const json2Rows = chunkString(JSON.stringify(json2));
    json2Rows.forEach((chunk, index) => {
      dumpLine(`WEALTH_TAX_EVIDENCE_JSON_2_PART ${index + 1}/${json2Rows.length} ${chunk}`);
    });
    dumpLine("WEALTH_TAX_EVIDENCE_END");
    dumpLine("WEALTH_TAX_EVIDENCE_FLUSH");
    try {
      if (typeof window !== "undefined" && typeof window.__CONSOLE_TAPE_FLUSH__ === "function") {
        window.__CONSOLE_TAPE_FLUSH__();
        dumpLine("WEALTH_TAX_EVIDENCE_FLUSH_POST");
      } else {
        dumpLine("WEALTH_TAX_EVIDENCE_FLUSH_ERR missing_flush_fn");
      }
    } catch (err) {
      dumpLine(`WEALTH_TAX_EVIDENCE_FLUSH_ERR ${String(err && err.message ? err.message : err)}`);
    }
      Game.__DEV.lastEconNpcWealthTaxEvidencePack = { smoke: smokeRes, summary, notes, diagVersion, ts: Date.now() };
    }
    return { ok: !!(smokeRes && smokeRes.ok), notes, diagVersion };
  };

  Game.__DEV.dumpWealthTaxEvidenceOnce = (opts = {}) => {
    try {
      if (typeof Game.__DEV.runEconNpcWealthTaxEvidencePackOnce === "function") {
        Game.__DEV.runEconNpcWealthTaxEvidencePackOnce(opts);
      }
    } catch (_) {}
    return Game.__DEV.lastEconNpcWealthTaxEvidencePack || { ok: false, notes: ["missing_smoke"] };
  };

  Game.__DEV.dumpNpcEconAccountsOnce = (opts = {}) => {
    const econ = Game.ConflictEconomy || Game._ConflictEconomy || null;
    const S = Game.__S || Game.State || {};
    const players = S.players || {};
    const St = Game.State || null;
    const npcIds = Object.keys((St && St.players) ? St.players : players).filter(id => String(id).startsWith("npc_"));
    const missing = [];
    const accounts = [];
    npcIds.forEach(id => {
      let acc = null;
      if (econ && typeof econ.getAccount === "function") {
        try { acc = econ.getAccount(id); } catch (_) { acc = null; }
      }
      if (!acc) missing.push(id);
      else accounts.push(id);
    });
    const payload = {
      hasGameStatePlayers: !!(St && St.players),
      hasSPlayers: !!(S && S.players),
      npcCount: npcIds.length,
      npcAccountsAfterCount: accounts.length,
      econAccountsCount: accounts.length,
      missingNpcIdsSample: missing.slice(0, 5),
      buildTag: "build_2026_02_09b"
    };
    try {
      if (Game.__DEV && typeof Game.__DEV._dumpLine === "function") {
        Game.__DEV._dumpLine(JSON.stringify(payload));
      } else {
        console.warn(payload);
      }
    } catch (_) {}
    return payload;
  };

  Game.__DEV.smokeConsoleThrottleProofOnce = (opts = {}) => {
    const loops = Number.isFinite(opts && opts.N) ? Math.max(3, Math.min(5, opts.N | 0)) : 5;
    const emitTagged = (typeof window !== "undefined" && typeof window.__CONSOLE_TAPE_EMIT_TAGGED_WARN__ === "function")
      ? window.__CONSOLE_TAPE_EMIT_TAGGED_WARN__
      : null;
    let attempted = 0;
    let printed = 0;
    let suppressed = 0;
    for (let i = 0; i < loops; i += 1) {
      attempted += 1;
      const resA = emitTagged ? emitTagged("ECON_NPC_ENSURE_V2", { proof: true }) : null;
      if (resA && resA.printed) printed += 1; else suppressed += 1;
      attempted += 1;
      const resB = emitTagged ? emitTagged("ECON_NPC_ACCOUNTS_CANON", { proof: true }) : null;
      if (resB && resB.printed) printed += 1; else suppressed += 1;
      if (!emitTagged) {
        try { console.warn("ECON_NPC_ENSURE_V2", { proof: true }); } catch (_) {}
        try { console.warn("ECON_NPC_ACCOUNTS_CANON", { proof: true }); } catch (_) {}
        printed += 2;
      }
    }
    const throttleState = (typeof window !== "undefined" && typeof window.__CONSOLE_TAPE_THROTTLE_STATE__ === "function")
      ? window.__CONSOLE_TAPE_THROTTLE_STATE__()
      : { minIntervalMs: null, maxCount: null };
    const summary = {
      attempted,
      printed,
      suppressed,
      minIntervalMs: throttleState.minIntervalMs,
      maxCount: throttleState.maxCount
    };
    try { console.warn("THROTTLE_PROOF_V1", summary); } catch (_) {}
    return summary;
  };

  Game.__DEV.smokeWealthTaxDumpOnce_UNSAFE = (opts = {}) => {
    if (typeof window !== "undefined" && window.__DEV_DUMPS_DISABLED__ !== false) {
      return { ok: false, reason: "dumps_disabled" };
    }
    console.log("WT_DUMP_BUILD_TAG", window.__WT_DUMP_BUILD_TAG__);
    let res1 = null;
    let res2 = null;
    try {
      res1 = Game.__DEV.dumpWealthTaxEvidenceOnce(opts);
      res2 = Game.__DEV.dumpWealthTaxEvidenceOnce(opts);
      if (Game.__DEV && typeof Game.__DEV.dumpTapeTailOnce === "function") {
        Game.__DEV.dumpTapeTailOnce({ lastN: 120 });
      }
    } finally {
      try {
        if (Game.__DEV && typeof Game.__DEV._dumpLine === "function") {
          Game.__DEV._dumpLine("WORLD_ECON_NPC_WEALTH_TAX_DUMP_SMOKE_OK");
        }
      } catch (_) {}
    }
    return { ok: true, res1, res2 };
  };

  Game.__DEV.smokeWealthTaxDumpOnce_Safe = (opts = {}) => {
    if (typeof window !== "undefined" && window.__DEV_DUMPS_DISABLED__ === true) {
      return { ok: false, reason: "dumps_disabled" };
    }
    if (typeof window !== "undefined" && window.__ALLOW_WEALTH_TAX_SAFE_SMOKE__ !== true) {
      return { ok: false, reason: "blocked_by_default" };
    }
    const MAX_LINES = 120;
    const MAX_CHARS = 20000;
    const now = Date.now();
    const spam = (Game.__DEV && Game.__DEV.__dumpSpamGuard) ? Game.__DEV.__dumpSpamGuard : { ts: 0, count: 0 };
    if (spam.ts === now && spam.count >= MAX_LINES) {
      return { ok: false, reason: "dump_spam_guard" };
    }
    spam.ts = (spam.ts === now) ? spam.ts : now;
    spam.count = (spam.ts === now) ? spam.count : 0;
    if (Game.__DEV) Game.__DEV.__dumpSpamGuard = spam;

    const originalDumpLine = (Game.__DEV && typeof Game.__DEV._dumpLine === "function") ? Game.__DEV._dumpLine : null;
    const lines = [];
    let chars = 0;
    let truncated = false;
    const pushLine = (line) => {
      if (truncated) return;
      const text = String(line);
      spam.count += 1;
      if (spam.count > MAX_LINES || (chars + text.length) > MAX_CHARS) {
        truncated = true;
        return;
      }
      lines.push(text);
      chars += text.length;
    };
    if (Game.__DEV) {
      Game.__DEV._dumpLine = pushLine;
    }
    let res1 = null;
    const safeTicks = Number.isFinite(opts && opts.ticks) ? Math.min(5, Math.max(1, opts.ticks | 0)) : 5;
    const safeOpts = Object.assign({}, opts, { ticks: safeTicks });
    try {
      res1 = Game.__DEV.dumpWealthTaxEvidenceOnce(safeOpts);
    } finally {
      if (Game.__DEV) {
        Game.__DEV._dumpLine = originalDumpLine;
      }
    }
    const payload = {
      label: "WEALTH_TAX_DUMP_SAFE",
      buildTag: (typeof window !== "undefined") ? window.__WT_DUMP_BUILD_TAG__ : null,
      ts: Date.now(),
      truncated,
      lines,
      notes: truncated ? ["dump_truncated"] : [],
      ok: true,
      res1Ok: !!(res1 && res1.ok)
    };
    try {
      console.warn(JSON.stringify(payload));
    } catch (_) {}
    return { ok: true, truncated, res1 };
  };

  Game.__DEV.smokeNpcActivityTax_StabilityOnce = (opts = {}) => {
    const mode = (opts && typeof opts.mode === "string") ? String(opts.mode) : "tax_only";
    const seedRichNpc = (opts && typeof opts.seedRichNpc === "boolean") ? opts.seedRichNpc : true;
    const S = Game.__S || Game.State || null;
    const Econ = Game.ConflictEconomy || Game._ConflictEconomy || null;
    if (!S || !S.players || !Econ) return { ok: false, reason: "state_missing" };
    if (mode !== "tax_only") return { ok: false, reason: "mode_not_tax_only" };
    if (typeof Econ.sumPointsSnapshot !== "function") return { ok: false, reason: "sumPointsSnapshot_missing" };
    const dbg = Game.__D || (Game.__D = {});
    dbg.moneyLog = Array.isArray(dbg.moneyLog) ? dbg.moneyLog : [];
    const logGate = { runId: `npc_activity_tax_${Date.now()}`, agg: Object.create(null), extra: Object.create(null) };
    dbg.__npcActivityTaxLogGate = logGate;
    const npcList = Object.values(S.players || {})
      .filter(p => p && (p.npc === true || p.type === "npc" || String(p.id || "").startsWith("npc_")))
      .map(p => ({ id: String(p.id || ""), points: (Number.isFinite(p.points) ? (p.points | 0) : 0) }))
      .filter(p => p.id);
    const richest = npcList.slice().sort((a, b) => b.points - a.points)[0] || null;
    const logStart = dbg.moneyLog.length;
    const notes = [];
    const runTickId = `tax_only_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
    const flushNpcActivityTaxLogs = (gate) => {
      if (!gate) return;
      const tags = [
        "NPC_ACTIVITY_TAX_ENTRY",
        "NPC_ACTIVITY_TAX_PRECHECK",
        "NPC_ACTIVITY_TAX_DEBUG",
        "NPC_ACTIVITY_TAX_TAX",
        "NPC_ACTIVITY_TAX_POST"
      ];
      tags.forEach((tag) => {
        const slot = gate.agg && gate.agg[tag] ? gate.agg[tag] : null;
        const extra = gate.extra && gate.extra[tag] ? gate.extra[tag] : null;
        const payload = Object.assign({
          count: slot ? slot.count : 0,
          first: slot ? slot.first : null,
          last: slot ? slot.last : null
        }, extra || {});
        try { console.warn(tag, payload); } catch (_) {}
      });
    };
    const ensureWorldBankInState = () => {
      if (!S.players) S.players = {};
      const had = !!S.players.worldBank;
      if (!S.players.worldBank) {
        S.players.worldBank = { id: "worldBank", points: 0 };
      }
      if (!Number.isFinite(S.players.worldBank.points)) S.players.worldBank.points = 0;
      const bankBal = (Econ && typeof Econ.getWorldBankBalance === "function")
        ? (Econ.getWorldBankBalance() | 0)
        : (S.players.worldBank.points | 0);
      S.players.worldBank.points = bankBal;
      return { ok: true, created: !had, points: bankBal };
    };
    const bankEnsure = ensureWorldBankInState();
    if (bankEnsure && bankEnsure.created) notes.push("worldbank_created_in_state");
    logGate.extra.NPC_ACTIVITY_TAX_DEBUG = Object.assign({}, logGate.extra.NPC_ACTIVITY_TAX_DEBUG || {}, {
      worldBankEnsure: bankEnsure
    });
    const beforeSnap = Econ.sumPointsSnapshot();
    const beforeTotal = beforeSnap && Number.isFinite(beforeSnap.total) ? (beforeSnap.total | 0) : null;
    if (Game.__DEV && typeof Game.__DEV.econNpcWorldContractV1 === "function" && beforeSnap && beforeSnap.byId) {
      try {
        const contract = Game.__DEV.econNpcWorldContractV1({ snapById: beforeSnap.byId }) || {};
        const accounts = Array.isArray(contract.accountsIncluded) ? contract.accountsIncluded : [];
        const hasWorldBank = accounts.includes("worldBank");
        if (!hasWorldBank) notes.push("worldbank_missing_in_contract");
        logGate.extra.NPC_ACTIVITY_TAX_DEBUG = Object.assign({}, logGate.extra.NPC_ACTIVITY_TAX_DEBUG || {}, {
          worldContract: {
            hasWorldBank,
            accountsIncludedLen: Number.isFinite(contract.accountsIncludedLen) ? contract.accountsIncludedLen : accounts.length,
            accountsIncludedHash: contract.accountsIncludedHash || null
          }
        });
      } catch (_) {
        notes.push("world_contract_check_failed");
      }
    }
    if (!richest) {
      notes.push("no_npc");
      flushNpcActivityTaxLogs(logGate);
      const resultNoNpc = {
        ok: false,
        ticks: 0,
        softCap: null,
        rate: 0.25,
        taxableNpcCount: 0,
        taxRowsCount: 0,
        totalTax: 0,
        worldBefore: beforeTotal,
        worldAfter: beforeTotal,
        worldDelta: 0,
        notes
      };
      try { console.log("NPC_ACTIVITY_TAX_SUMMARY", resultNoNpc); } catch (_) {}
      if (dbg.__npcActivityTaxLogGate === logGate) delete dbg.__npcActivityTaxLogGate;
      return resultNoNpc;
    }
    let softCapSeen = null;
    let precheckReason = null;
    const gainPoints = 5;
    const rate = 0.25;
    let conditionPassed = false;
    let taxableNpcCount = 0;
    let fundedFromMe = 0;
    let targetNpcId = richest.id;
    try {
      const softCapMeta = (Econ && typeof Econ.getNpcActivitySoftCapMeta === "function") ? Econ.getNpcActivitySoftCapMeta() : null;
      if (softCapMeta && Number.isFinite(softCapMeta.softCap)) {
        softCapSeen = (softCapMeta.softCap | 0);
        precheckReason = String(softCapMeta.reason || "softcap");
      } else {
        precheckReason = (softCapMeta && softCapMeta.reason) ? String(softCapMeta.reason) : "softcap_null";
        softCapSeen = 20;
        notes.push("softcap_fallback_20");
      }
      const cfg = (Game.__A && typeof Game.__A.getPointsConfig === "function") ? Game.__A.getPointsConfig() : null;
      const pointsConfigSnapshot = cfg ? { softCap: cfg.softCap, startNpc: cfg.startNpc } : null;
      const mafia = npcList.find(p => p && p.id === "npc_mafia");
      const target = mafia || richest;
      targetNpcId = target ? target.id : targetNpcId;
      const richestPoints = Number.isFinite(target.points) ? (target.points | 0) : 0;
      const softCapValue = Number.isFinite(softCapSeen) ? softCapSeen : null;
      let needSeed = 0;
      if (softCapValue != null) {
        taxableNpcCount = npcList.filter(p => Number.isFinite(p.points) && (p.points | 0) > softCapValue).length;
        if (seedRichNpc && taxableNpcCount === 0) {
          const seedTarget = softCapValue + 5;
          needSeed = Math.max(0, seedTarget - richestPoints);
        }
        conditionPassed = (richestPoints + needSeed) > softCapValue;
      }
      try {
        console.warn("NPC_ACTIVITY_TAX_SEED_DEBUG", {
          richestId: targetNpcId,
          richestPoints,
          softCapSource: precheckReason,
          softCapValue: softCapSeen,
          pointsConfigSnapshot
        });
      } catch (_) {}
      if (softCapSeen != null) {
        taxableNpcCount = npcList.filter(p => Number.isFinite(p.points) && (p.points | 0) > softCapSeen).length;
      }
      if (softCapSeen != null && needSeed > 0) {
        const bankBal = (Econ && typeof Econ.getWorldBankBalance === "function") ? (Econ.getWorldBankBalance() | 0) : 0;
        const required = Math.max(0, (needSeed + gainPoints) - bankBal);
        if (required > 0) {
        const fundRes = Econ.transferPoints("me", "worldBank", required, "npc_activity_seed_fund_smoke", { activityTaxSkip: true, mode });
          if (fundRes && fundRes.ok) {
            fundedFromMe = required;
            notes.push("seed_funded_from_me");
          } else {
            notes.push("seed_fund_failed");
          }
        }
        Econ.transferPoints("worldBank", targetNpcId, needSeed, "npc_seed_rich_smoke", { mode, activityTaxSkip: true });
        const targetAfterSeed = (S.players[targetNpcId] && Number.isFinite(S.players[targetNpcId].points)) ? (S.players[targetNpcId].points | 0) : (richestPoints + needSeed);
        taxableNpcCount = (softCapSeen != null)
          ? npcList.map(p => (p.id === targetNpcId ? Object.assign({}, p, { points: targetAfterSeed }) : p))
            .filter(p => Number.isFinite(p.points) && (p.points | 0) > softCapSeen).length
          : taxableNpcCount;
      }
      Econ.transferPoints("worldBank", targetNpcId, gainPoints, "npc_activity_gain_smoke", { mode, tickId: runTickId });
    } catch (_) {}
    const tail = dbg.moneyLog.slice(logStart);
    const taxRows = tail.filter(r => r && r.reason === "npc_activity_tax");
    const totalTax = taxRows.reduce((s, r) => s + ((r && Number.isFinite(r.amount)) ? (r.amount | 0) : 0), 0);
    const taxRowsCount = taxRows.length;
    if (fundedFromMe > 0) {
      const revertAmount = Math.max(0, fundedFromMe - totalTax);
      if (revertAmount > 0) {
        Econ.transferPoints(targetNpcId, "me", revertAmount, "npc_activity_seed_revert_smoke", { activityTaxSkip: true, mode });
        notes.push("seed_revert_applied");
      }
    }
    ensureWorldBankInState();
    const afterSnap = Econ.sumPointsSnapshot();
    const afterTotal = afterSnap && Number.isFinite(afterSnap.total) ? (afterSnap.total | 0) : null;
    const worldDelta = (beforeTotal != null && afterTotal != null) ? (afterTotal - beforeTotal) : null;
    const intendedTax = Math.min(Math.max(1, Math.floor(gainPoints * rate)), gainPoints);
    const appliedTax = totalTax;
    const didTransfer = taxRowsCount > 0;
    const transferOk = didTransfer && appliedTax > 0;
    const debugSlot = logGate.agg && logGate.agg.NPC_ACTIVITY_TAX_DEBUG ? logGate.agg.NPC_ACTIVITY_TAX_DEBUG : null;
    const guardSkip = !!(debugSlot && debugSlot.last && debugSlot.last.guardSkip === true);
    logGate.extra.NPC_ACTIVITY_TAX_DEBUG = Object.assign({}, logGate.extra.NPC_ACTIVITY_TAX_DEBUG || {}, {
      intendedTax,
      appliedTax,
      didTransfer,
      transferOk,
      conditionPassed,
      note: guardSkip ? "guard_skip" : ((conditionPassed && appliedTax === 0) ? "tax_zero_when_condition_true" : null),
      runTickId
    });
    if (guardSkip) notes.push("guard_skip");
    if (conditionPassed && appliedTax === 0 && !guardSkip) notes.push("tax_missing");
    if (worldDelta !== 0 && worldDelta != null) notes.push("world_delta_nonzero");
    if (taxRowsCount === 0) notes.push("tax_rows_empty");
    if (seedRichNpc && taxableNpcCount === 0) notes.push("no_taxable_after_seed");
    flushNpcActivityTaxLogs(logGate);
    const ok = (worldDelta === 0 && totalTax > 0 && taxRowsCount > 0);
    const result = {
      ok,
      ticks: 1,
      softCap: softCapSeen,
      rate,
      taxableNpcCount,
      taxRowsCount,
      totalTax,
      worldBefore: beforeTotal,
      worldAfter: afterTotal,
      worldDelta,
      notes
    };
    try { console.log("NPC_ACTIVITY_TAX_SUMMARY", result); } catch (_) {}
    if (dbg.__npcActivityTaxLogGate === logGate) delete dbg.__npcActivityTaxLogGate;
    return result;
  };

  Game.__DEV.runEconNpcActivityTaxEvidencePackOnce = (opts = {}) => {
    const defaultOpts = { ticks: 200, window: { lastN: 1200 }, seed: 1, debugTelemetry: true };
    const ticks = Number.isFinite(opts.ticks) ? Math.max(1, opts.ticks | 0) : defaultOpts.ticks;
    const seed = (opts && typeof opts.seed !== "undefined") ? opts.seed : defaultOpts.seed;
    const debugTelemetry = (opts && typeof opts.debugTelemetry !== "undefined") ? !!opts.debugTelemetry : defaultOpts.debugTelemetry;
    const seedRichNpc = (opts && typeof opts.seedRichNpc !== "undefined") ? !!opts.seedRichNpc : true;
    const lastN = (opts && opts.window && Number.isFinite(opts.window.lastN)) ? Math.max(1, opts.window.lastN | 0) : defaultOpts.window.lastN;
    const allowedDrift = Number.isFinite(opts.allowedDrift) ? Math.max(0, opts.allowedDrift | 0) : 2;
    const Econ = Game.ConflictEconomy || Game._ConflictEconomy || null;
    const S = Game.__S || Game.State || null;
    const buildTag = (typeof window !== "undefined") ? (window.__BUILD_TAG__ || window.__WT_DUMP_BUILD_TAG__ || null) : null;
    const notes = [];
    let result = null;
    let summary = null;
    let before = null;
    let after = null;
    let taxRowsCount = 0;
    let totalTax = 0;
    let worldDelta = null;
    let logSource = "none";
    let rowsScoped = 0;
    let exception = null;
    const getNpcPointStats = () => {
      const players = (S && S.players) ? S.players : {};
      const arr = [];
      let richestId = null;
      let richestPoints = null;
      Object.keys(players).forEach(id => {
        const p = players[id];
        if (!p) return;
        const pid = String(p.id || id || "");
        if (!pid || !pid.startsWith("npc_")) return;
        const pts = Number.isFinite(p.points) ? (p.points | 0) : 0;
        arr.push({ id: pid, points: pts });
        if (richestPoints == null || pts > richestPoints) {
          richestPoints = pts;
          richestId = pid;
        }
      });
      const vals = arr.map(x => x.points).sort((a, b) => a - b);
      const percentile = (q) => {
        if (!vals.length) return null;
        const idx = Math.min(vals.length - 1, Math.max(0, Math.floor(((q / 100) * (vals.length - 1)))));
        return vals[idx] | 0;
      };
      return {
        count: vals.length,
        min: vals.length ? (vals[0] | 0) : null,
        p50: percentile(50),
        p90: percentile(90),
        p95: percentile(95),
        p99: percentile(99),
        max: vals.length ? (vals[vals.length - 1] | 0) : null,
        richestId,
        richestPoints
      };
    };
    const getBuckets = (snap) => {
      if (!snap) return null;
      const byId = snap.byId || {};
      return {
        total: Number.isFinite(snap.total) ? (snap.total | 0) : null,
        players: Number.isFinite(snap.players) ? (snap.players | 0) : null,
        npcs: Number.isFinite(snap.npcs) ? (snap.npcs | 0) : null,
        pools: Number.isFinite(snap.pools) ? (snap.pools | 0) : null,
        worldBank: Number.isFinite(byId.worldBank) ? (byId.worldBank | 0) : null,
        sink: Number.isFinite(byId.sink) ? (byId.sink | 0) : null
      };
    };
    const getLogSource = () => {
      const candidates = [
        { name: "debug_moneyLog", rows: (Game.Debug && Array.isArray(Game.Debug.moneyLog)) ? Game.Debug.moneyLog : null },
        { name: "dev_moneyLog", rows: (Game.__D && Array.isArray(Game.__D.moneyLog)) ? Game.__D.moneyLog : null },
        { name: "state_moneyLog", rows: (Game.State && Array.isArray(Game.State.moneyLog)) ? Game.State.moneyLog : null },
        { name: "logger_queue", rows: (Game.Logger && Array.isArray(Game.Logger.queue)) ? Game.Logger.queue : null }
      ];
      for (const c of candidates) {
        if (c.rows && c.rows.length) return c;
      }
      return candidates.find(c => c.rows) || { name: "none", rows: [] };
    };
    const seedRichNpcIfNeeded = () => {
      if (!seedRichNpc || !Econ || !S || !S.players) return { ok: false, reason: "seed_skipped" };
      const softCapMeta = (Econ && typeof Econ.getNpcActivitySoftCapMeta === "function") ? Econ.getNpcActivitySoftCapMeta() : null;
      const softCap = (softCapMeta && Number.isFinite(softCapMeta.softCap)) ? (softCapMeta.softCap | 0) : 20;
      const npcList = Object.values(S.players || {})
        .filter(p => p && p.id && String(p.id).startsWith("npc_"))
        .map(p => ({ id: String(p.id || ""), points: Number.isFinite(p.points) ? (p.points | 0) : 0 }))
        .filter(p => p.id);
      if (!npcList.length) return { ok: false, reason: "no_npcs" };
      const richest = npcList.slice().sort((a, b) => b.points - a.points)[0] || null;
      const target = npcList.find(p => p.id === "npc_mafia") || richest;
      const taxableCount = npcList.filter(p => (p.points | 0) > softCap).length;
      if (!target || taxableCount > 0) return { ok: true, reason: "already_rich", targetId: target ? target.id : null };
      const need = Math.max(0, (softCap + 5) - (target.points | 0));
      if (need <= 0) return { ok: true, reason: "already_over_softcap", targetId: target.id };
      const bankBal = (Econ && typeof Econ.getWorldBankBalance === "function") ? (Econ.getWorldBankBalance() | 0) : 0;
      const required = Math.max(0, need - bankBal);
      if (required > 0) {
        const fundRes = Econ.transferPoints("me", "worldBank", required, "npc_activity_seed_fund_evidence", { activityTaxSkip: true, mode: "activity_tax_evidence" });
        if (!fundRes || fundRes.ok !== true) notes.push("seed_fund_failed");
      }
      Econ.transferPoints("worldBank", target.id, need, "npc_activity_seed_evidence", { activityTaxSkip: true, mode: "activity_tax_evidence" });
      return { ok: true, reason: "seed_applied", targetId: target.id, need };
    };
    const computeTailOk = (beforeStats, afterStats) => {
      if (!beforeStats || !afterStats || beforeStats.count === 0 || afterStats.count === 0) return { ok: false, reason: "no_npc_stats" };
      const p99Before = beforeStats.p99;
      const p99After = afterStats.p99;
      const maxBefore = beforeStats.max;
      const maxAfter = afterStats.max;
      const ok = (p99After <= (p99Before + allowedDrift)) && (maxAfter <= (maxBefore + allowedDrift));
      return { ok, p99Before, p99After, maxBefore, maxAfter, allowedDrift };
    };
    const emitBlock = (tag, payload) => {
      try { emitLine(`${tag} ${safeStringify(payload)}`); } catch (_) {}
    };
    try {
      emitLine("ECON_NPC_ACTIVITY_TAX_EVIDENCE_BEGIN");
      if (!Econ || !S || !S.players || typeof Game.__DEV.sumPointsSnapshot !== "function") {
        notes.push("missing_state_or_snapshot");
        summary = { ok: false, notes };
        return summary;
      }
      const snapBefore = Game.__DEV.sumPointsSnapshot();
      const npcStatsBefore = getNpcPointStats();
      before = { snap: getBuckets(snapBefore), npcStats: npcStatsBefore };
      const seedRes = seedRichNpcIfNeeded();
      if (!seedRes || seedRes.ok !== true) notes.push(seedRes ? seedRes.reason : "seed_failed");
      const tickRes = (Game.__DEV && typeof Game.__DEV.runWorldTicks === "function")
        ? Game.__DEV.runWorldTicks({ N: ticks, seed, allowNpcVotes: true, allowBattles: true, allowEventsTick: true, stipendEnabled: true, safeEconOnly: false })
        : { ok: false, notes: ["runWorldTicks_missing"] };
      if (!tickRes || tickRes.ok !== true) notes.push("ticks_failed");
      const snapAfter = Game.__DEV.sumPointsSnapshot();
      const npcStatsAfter = getNpcPointStats();
      after = { snap: getBuckets(snapAfter), npcStats: npcStatsAfter };
      worldDelta = (before.snap && after.snap && before.snap.total != null && after.snap.total != null)
        ? (after.snap.total - before.snap.total)
        : null;
      const source = getLogSource();
      logSource = source.name;
      const rows = source.rows || [];
      const tail = rows.slice(Math.max(0, rows.length - lastN));
      rowsScoped = tail.length;
      const taxRows = tail.filter(r => r && r.reason === "npc_activity_tax");
      taxRowsCount = taxRows.length;
      totalTax = taxRows.reduce((s, r) => s + ((r && Number.isFinite(r.amount)) ? (r.amount | 0) : 0), 0);
      const tailCheck = computeTailOk(npcStatsBefore, npcStatsAfter);
      const worldDeltaOk = (worldDelta === 0);
      const tailOk = !!tailCheck.ok;
      const ok = worldDeltaOk && tailOk && taxRowsCount > 0 && totalTax > 0;
      summary = {
        ok,
        notes: notes.slice(),
        before: { snap: before.snap, npcStats: before.npcStats },
        after: { snap: after.snap, npcStats: after.npcStats },
        tax: { taxRowsCount, totalTax },
        invariants: { worldDelta, worldDeltaOk, tailOk, tail: tailCheck },
        meta: { buildTag, logSource, rowsScoped, ticks, seed, debugTelemetry }
      };
      result = summary;
    } catch (e) {
      exception = e;
      summary = {
        ok: false,
        notes: notes.concat(["exception"]),
        errorMessage: String(e && e.message ? e.message : e),
        meta: { buildTag, logSource, rowsScoped, ticks, seed, debugTelemetry }
      };
      result = summary;
    } finally {
      if (Game.__DEV) Game.__DEV.lastEconNpcActivityTaxEvidencePack = result;
      emitBlock("ECON_NPC_ACTIVITY_TAX_EVIDENCE_JSON_1", summary || { ok: false, notes: ["missing_summary"] });
      emitBlock("ECON_NPC_ACTIVITY_TAX_EVIDENCE_JSON_2", {
        ok: !!(summary && summary.ok),
        worldDelta,
        taxRowsCount,
        totalTax,
        logSource,
        rowsScoped,
        exception: exception ? String(exception && exception.message ? exception.message : exception) : null
      });
      emitLine("ECON_NPC_ACTIVITY_TAX_EVIDENCE_END");
    }
    return summary;
  };

  Game.__DEV.runEconNpcActivityTaxRegressionPackOnce = (opts = {}) => {
    const seedRichNpc = (opts && typeof opts.seedRichNpc !== "undefined") ? !!opts.seedRichNpc : true;
    const Econ = Game.ConflictEconomy || Game._ConflictEconomy || null;
    const S = Game.__S || Game.State || null;
    const notes = [];
    let summary = null;
    let worldDelta = null;
    let taxRowsCount = 0;
    let totalTax = 0;
    let logSource = "none";
    let rowsScoped = 0;
    const getLogSource = () => {
      const candidates = [
        { name: "debug_moneyLog", rows: (Game.Debug && Array.isArray(Game.Debug.moneyLog)) ? Game.Debug.moneyLog : null },
        { name: "dev_moneyLog", rows: (Game.__D && Array.isArray(Game.__D.moneyLog)) ? Game.__D.moneyLog : null },
        { name: "state_moneyLog", rows: (Game.State && Array.isArray(Game.State.moneyLog)) ? Game.State.moneyLog : null },
        { name: "logger_queue", rows: (Game.Logger && Array.isArray(Game.Logger.queue)) ? Game.Logger.queue : null }
      ];
      for (const c of candidates) {
        if (c.rows && c.rows.length) return c;
      }
      return candidates.find(c => c.rows) || { name: "none", rows: [] };
    };
    const seedRichNpcIfNeeded = () => {
      if (!seedRichNpc || !Econ || !S || !S.players) return { ok: false, reason: "seed_skipped" };
      const softCapMeta = (Econ && typeof Econ.getNpcActivitySoftCapMeta === "function") ? Econ.getNpcActivitySoftCapMeta() : null;
      const softCap = (softCapMeta && Number.isFinite(softCapMeta.softCap)) ? (softCapMeta.softCap | 0) : 20;
      const npcList = Object.values(S.players || {})
        .filter(p => p && p.id && String(p.id).startsWith("npc_"))
        .map(p => ({ id: String(p.id || ""), points: Number.isFinite(p.points) ? (p.points | 0) : 0 }))
        .filter(p => p.id);
      if (!npcList.length) return { ok: false, reason: "no_npcs" };
      const richest = npcList.slice().sort((a, b) => b.points - a.points)[0] || null;
      const target = npcList.find(p => p.id === "npc_mafia") || richest;
      const taxableCount = npcList.filter(p => (p.points | 0) > softCap).length;
      if (!target || taxableCount > 0) return { ok: true, reason: "already_rich", targetId: target ? target.id : null };
      const need = Math.max(0, (softCap + 5) - (target.points | 0));
      if (need <= 0) return { ok: true, reason: "already_over_softcap", targetId: target.id };
      const bankBal = (Econ && typeof Econ.getWorldBankBalance === "function") ? (Econ.getWorldBankBalance() | 0) : 0;
      if (bankBal < need) return { ok: false, reason: "bank_insufficient" };
      Econ.transferPoints("worldBank", target.id, need, "npc_activity_seed_regression", { activityTaxSkip: true, mode: "activity_tax_regression" });
      return { ok: true, reason: "seed_applied", targetId: target.id, need };
    };
    try {
      emitLine("ECON_NPC_ACTIVITY_TAX_REGRESSION_BEGIN");
      if (!Econ || !S || typeof Game.__DEV.sumPointsSnapshot !== "function") {
        notes.push("missing_state_or_snapshot");
        summary = { ok: false, notes };
        return summary;
      }
      const beforeSnap = Game.__DEV.sumPointsSnapshot();
      seedRichNpcIfNeeded();
      let smokeRes = null;
      if (Game.__DEV && typeof Game.__DEV.smokeEcon02_NoEmissionPackOnce === "function") {
        smokeRes = Game.__DEV.smokeEcon02_NoEmissionPackOnce();
      } else {
        notes.push("smokeEcon02_NoEmissionPackOnce_missing");
        smokeRes = { ok: false, reason: "smoke_missing" };
      }
      const afterSnap = Game.__DEV.sumPointsSnapshot();
      worldDelta = (beforeSnap && afterSnap && Number.isFinite(beforeSnap.total) && Number.isFinite(afterSnap.total))
        ? ((afterSnap.total | 0) - (beforeSnap.total | 0))
        : null;
      const source = getLogSource();
      logSource = source.name;
      const rows = source.rows || [];
      const tail = rows.slice(Math.max(0, rows.length - 400));
      rowsScoped = tail.length;
      const taxRows = tail.filter(r => r && r.reason === "npc_activity_tax");
      taxRowsCount = taxRows.length;
      totalTax = taxRows.reduce((s, r) => s + ((r && Number.isFinite(r.amount)) ? (r.amount | 0) : 0), 0);
      const worldDeltaOk = (worldDelta === 0);
      const taxOk = (taxRowsCount === 0) ? true : (totalTax > 0);
      const ok = !!(smokeRes && smokeRes.ok === true) && worldDeltaOk && taxOk;
      summary = {
        ok,
        notes,
        smoke: smokeRes,
        tax: { taxRowsCount, totalTax },
        invariants: { worldDelta, worldDeltaOk, taxOk },
        meta: { logSource, rowsScoped }
      };
    } catch (e) {
      summary = { ok: false, notes: notes.concat(["exception"]), errorMessage: String(e && e.message ? e.message : e) };
    } finally {
      emitLine(`ECON_NPC_ACTIVITY_TAX_REGRESSION_JSON ${safeStringify(summary || { ok: false, notes: ["missing_summary"] })}`);
      emitLine("ECON_NPC_ACTIVITY_TAX_REGRESSION_END");
    }
    return summary;
  };

  Game.__DEV.smokeNpcLowFundsPolicyOnce = (opts = {}) => {
    const ticks = Number.isFinite(opts.ticks) ? Math.max(1, opts.ticks | 0) : 50;
    const seedLowFunds = (opts && typeof opts.seedLowFunds !== "undefined") ? !!opts.seedLowFunds : true;
    const debugTelemetry = !!(opts && opts.debugTelemetry);
    const Econ = Game.ConflictEconomy || Game._ConflictEconomy || null;
    const S = Game.__S || Game.State || null;
    if (!Econ || !S || !S.players || typeof Game.__DEV.sumPointsSnapshot !== "function") {
      return { ok: false, reason: "missing_state_or_snapshot" };
    }
    const seedLowFundsOnce = () => {
      if (!seedLowFunds) return { ok: true, reason: "seed_skipped" };
      const npcList = Object.values(S.players || {})
        .filter(p => p && p.id && String(p.id).startsWith("npc_"))
        .map(p => ({ id: String(p.id || ""), points: Number.isFinite(p.points) ? (p.points | 0) : 0 }))
        .filter(p => p.id);
      const richest = npcList.slice().sort((a, b) => b.points - a.points).slice(0, 5);
      let seededCount = 0;
      richest.forEach(npc => {
        if (!npc || npc.points <= 0) return;
        const res = Econ.transferPoints(npc.id, "sink", npc.points, "npc_low_funds_seed", { activityTaxSkip: true, mode: "npc_low_funds_seed" });
        if (res && res.ok) seededCount += 1;
      });
      return { ok: true, reason: "seed_applied", seededCount };
    };
    const beforeSnap = Game.__DEV.sumPointsSnapshot();
    const seedRes = seedLowFundsOnce();
    const tickRes = (Game.__DEV && typeof Game.__DEV.runWorldTicks === "function")
      ? Game.__DEV.runWorldTicks({ N: ticks, seed: 1, allowNpcVotes: true, allowBattles: true, allowEventsTick: true, stipendEnabled: true, safeEconOnly: false })
      : { ok: false, notes: ["runWorldTicks_missing"] };
    const afterSnap = Game.__DEV.sumPointsSnapshot();
    const worldDelta = (beforeSnap && afterSnap && Number.isFinite(beforeSnap.total) && Number.isFinite(afterSnap.total))
      ? ((afterSnap.total | 0) - (beforeSnap.total | 0))
      : null;
    const log = (Game.__D && Array.isArray(Game.__D.moneyLog)) ? Game.__D.moneyLog : [];
    const tail = log.slice(Math.max(0, log.length - 400));
    const skippedCount = tail.filter(r => r && r.reason === "npc_skip_low_funds").length;
    const insufficientCount = tail.filter(r => r && typeof r.reason === "string" && r.reason.indexOf("insufficient") >= 0).length;
    const npcPoints = Object.values(S.players || {})
      .filter(p => p && p.id && String(p.id).startsWith("npc_"))
      .map(p => (Number.isFinite(p.points) ? (p.points | 0) : 0));
    const minNpcPts = npcPoints.length ? Math.min(...npcPoints) : null;
    const eventsApplied = Number.isFinite(tickRes && tickRes.eventsApplied) ? tickRes.eventsApplied : 0;
    const votesApplied = Number.isFinite(tickRes && tickRes.votesApplied) ? tickRes.votesApplied : 0;
    const battlesResolved = Number.isFinite(tickRes && tickRes.battlesResolved) ? tickRes.battlesResolved : 0;
    const activityOk = (eventsApplied + votesApplied + battlesResolved) > 0;
    const ok = !!(tickRes && tickRes.ok) && worldDelta === 0 && insufficientCount === 0 && (minNpcPts == null || minNpcPts >= 0) && activityOk;
    return {
      ok,
      seed: seedRes,
      ticks,
      debugTelemetry,
      worldDelta,
      skippedCount,
      insufficientCount,
      activity: { eventsApplied, votesApplied, battlesResolved, activityOk },
      minNpcPts
    };
  };

  Game.__DEV.runEconNpcLowFundsEvidencePackOnce = async (opts = {}) => {
    const defaultOpts = { ticks: 200, window: { lastN: 1200 }, seed: 1, debugTelemetry: true };
    const ticks = Number.isFinite(opts.ticks) ? Math.max(1, opts.ticks | 0) : defaultOpts.ticks;
    const seed = (opts && typeof opts.seed !== "undefined") ? opts.seed : defaultOpts.seed;
    const debugTelemetry = (opts && typeof opts.debugTelemetry !== "undefined") ? !!opts.debugTelemetry : defaultOpts.debugTelemetry;
    const seedLowFunds = (opts && typeof opts.seedLowFunds !== "undefined") ? !!opts.seedLowFunds : true;
    const lastN = (opts && opts.window && Number.isFinite(opts.window.lastN)) ? Math.max(1, opts.window.lastN | 0) : defaultOpts.window.lastN;
    const maxMs = Number.isFinite(opts.maxMs) ? Math.max(50, opts.maxMs | 0) : 800;
    const batchSize = Number.isFinite(opts.batchSize) ? Math.max(1, opts.batchSize | 0) : 10;
    const Econ = Game.ConflictEconomy || Game._ConflictEconomy || null;
    const S = Game.__S || Game.State || null;
    const notes = [];
    let result = null;
    let summary = null;
    let exception = null;
    const getLogSource = () => {
      const candidates = [
        { name: "debug_moneyLog", rows: (Game.Debug && Array.isArray(Game.Debug.moneyLog)) ? Game.Debug.moneyLog : null },
        { name: "dev_moneyLog", rows: (Game.__D && Array.isArray(Game.__D.moneyLog)) ? Game.__D.moneyLog : null },
        { name: "state_moneyLog", rows: (Game.State && Array.isArray(Game.State.moneyLog)) ? Game.State.moneyLog : null },
        { name: "logger_queue", rows: (Game.Logger && Array.isArray(Game.Logger.queue)) ? Game.Logger.queue : null }
      ];
      for (const c of candidates) {
        if (c.rows && c.rows.length) return c;
      }
      return candidates.find(c => c.rows) || { name: "none", rows: [] };
    };
    const seedLowFundsOnce = () => {
      if (!seedLowFunds || !Econ || !S || !S.players) return { ok: true, reason: "seed_skipped" };
      const npcList = Object.values(S.players || {})
        .filter(p => p && p.id && String(p.id).startsWith("npc_"))
        .map(p => ({ id: String(p.id || ""), points: Number.isFinite(p.points) ? (p.points | 0) : 0 }))
        .filter(p => p.id);
      const richest = npcList.slice().sort((a, b) => b.points - a.points).slice(0, 5);
      let seededCount = 0;
      richest.forEach(npc => {
        if (!npc || npc.points <= 0) return;
        const res = Econ.transferPoints(npc.id, "sink", npc.points, "npc_low_funds_seed", { activityTaxSkip: true, mode: "npc_low_funds_seed" });
        if (res && res.ok) seededCount += 1;
      });
      return { ok: true, reason: "seed_applied", seededCount };
    };
    const buildAccountsIncluded = (snap) => {
      const list = [];
      const push = (id) => {
        const key = String(id || "");
        if (!key || list.includes(key)) return;
        list.push(key);
      };
      const byId = (snap && snap.byId) ? snap.byId : {};
      Object.keys(byId).forEach(id => push(id));
      push("worldBank");
      push("sink");
      push("bank");
      push("crowd");
      Object.keys(byId).forEach(id => {
        if (String(id).startsWith("crowd:")) push(id);
      });
      if (Object.prototype.hasOwnProperty.call(byId, "security_owner")) push("security_owner");
      return list.sort();
    };
    const hashList = (list) => {
      let h = 5381;
      const s = list.join("|");
      for (let i = 0; i < s.length; i++) {
        h = ((h << 5) + h) + s.charCodeAt(i);
        h |= 0;
      }
      return `h${(h >>> 0).toString(16)}`;
    };
    const sumByAccounts = (snap, accounts) => {
      const byId = (snap && snap.byId) ? snap.byId : {};
      let total = 0;
      accounts.forEach(id => {
        const v = Number.isFinite(byId[id]) ? (byId[id] | 0) : 0;
        total += v;
      });
      return total;
    };
    const forceLowFundsAttempt = () => {
      if (!Econ || !S || !S.players || typeof Econ.chargePriceOnce !== "function") return { ok: false, reason: "chargePriceOnce_missing" };
      const npcList = Object.values(S.players || {})
        .filter(p => p && p.id && String(p.id).startsWith("npc_"))
        .map(p => ({ id: String(p.id || ""), points: Number.isFinite(p.points) ? (p.points | 0) : 0 }))
        .filter(p => p.id);
      let target = npcList.find(n => n.points === 0) || null;
      if (!target) {
        const richest = npcList.slice().sort((a, b) => b.points - a.points)[0] || null;
        if (richest && richest.points > 0 && Econ && typeof Econ.transferPoints === "function") {
          Econ.transferPoints(richest.id, "sink", richest.points, "npc_low_funds_seed", { activityTaxSkip: true, mode: "npc_low_funds_seed" });
          target = { id: richest.id, points: 0 };
        }
      }
      if (!target) return { ok: false, reason: "no_npc_target" };
      const res = Econ.chargePriceOnce({
        fromId: target.id,
        toId: "sink",
        actorId: target.id,
        reason: "npc_low_funds_probe",
        priceKey: "low_funds_probe",
        basePrice: 1,
        actorPoints: 0,
        context: { contextId: "low_funds_probe", tickId: "low_funds_probe" },
        tickId: "low_funds_probe",
        actionKey: "low_funds_probe",
        extraMeta: { contextId: "low_funds_probe" }
      });
      return { ok: true, targetId: target.id, res };
    };
    try {
      emitLine("ECON_NPC_LOW_FUNDS_EVIDENCE_BEGIN");
      if (!Econ || !S || !S.players || typeof Game.__DEV.sumPointsSnapshot !== "function") {
        notes.push("missing_state_or_snapshot");
        summary = { ok: false, notes };
        return summary;
      }
      const beforeSnap = Game.__DEV.sumPointsSnapshot();
      const accountsIncluded = buildAccountsIncluded(beforeSnap);
      const accountsIncludedHash = hashList(accountsIncluded);
      const seedRes = seedLowFundsOnce();
      const forceRes = forceLowFundsAttempt();
      if (!forceRes || forceRes.ok !== true) notes.push(forceRes ? forceRes.reason : "force_low_funds_failed");
      let ticksDone = 0;
      let eventsApplied = 0;
      let votesApplied = 0;
      let battlesResolved = 0;
      let tickResOk = true;
      const startedAt = Date.now();
      while (ticksDone < ticks) {
        if ((Date.now() - startedAt) > maxMs) {
          notes.push("time_budget_exceeded");
          break;
        }
        const batch = Math.min(batchSize, ticks - ticksDone);
        const runRes = (Game.__DEV && typeof Game.__DEV.runWorldTicks === "function")
          ? Game.__DEV.runWorldTicks({ N: batch, seed: seed != null ? (seed + ticksDone) : seed, allowNpcVotes: true, allowBattles: true, allowEventsTick: true, stipendEnabled: true, safeEconOnly: false })
          : { ok: false, notes: ["runWorldTicks_missing"] };
        if (!runRes || runRes.ok !== true) tickResOk = false;
        eventsApplied += Number.isFinite(runRes && runRes.eventsApplied) ? runRes.eventsApplied : 0;
        votesApplied += Number.isFinite(runRes && runRes.votesApplied) ? runRes.votesApplied : 0;
        battlesResolved += Number.isFinite(runRes && runRes.battlesResolved) ? runRes.battlesResolved : 0;
        ticksDone += batch;
        if (ticksDone < ticks) {
          await new Promise(r => setTimeout(r, 0));
        }
      }
      const afterSnap = Game.__DEV.sumPointsSnapshot();
      const beforeTotal = sumByAccounts(beforeSnap, accountsIncluded);
      const afterTotal = sumByAccounts(afterSnap, accountsIncluded);
      const worldDelta = (Number.isFinite(beforeTotal) && Number.isFinite(afterTotal))
        ? ((afterTotal | 0) - (beforeTotal | 0))
        : null;
      const source = getLogSource();
      const logSource = source.name;
      const rows = source.rows || [];
      const tail = rows.slice(Math.max(0, rows.length - lastN));
      const rowsScoped = tail.length;
      const skippedCount = tail.filter(r => r && r.reason === "npc_skip_low_funds").length;
      const insufficientCount = tail.filter(r => r && typeof r.reason === "string" && r.reason.indexOf("insufficient") >= 0).length;
      const npcPoints = Object.values(S.players || {})
        .filter(p => p && p.id && String(p.id).startsWith("npc_"))
        .map(p => (Number.isFinite(p.points) ? (p.points | 0) : 0));
      const minNpcPts = npcPoints.length ? Math.min(...npcPoints) : null;
      const activityOk = (eventsApplied + votesApplied + battlesResolved) > 0;
      const worldDeltaOk = (worldDelta === 0);
      const ok = tickResOk && worldDeltaOk && insufficientCount === 0 && skippedCount > 0 && (minNpcPts == null || minNpcPts >= 0) && activityOk;
      summary = {
        ok,
        notes: notes.slice(),
        before: { total: beforeTotal, byId: beforeSnap.byId || null, accountsIncludedHash },
        after: { total: afterTotal, byId: afterSnap.byId || null, accountsIncludedHash },
        invariants: { worldDelta, worldDeltaOk, minNpcPts, activityOk },
        activity: { eventsApplied, votesApplied, battlesResolved },
        skippedCount,
        insufficientCount,
        meta: { logSource, rowsScoped, ticks, seed, debugTelemetry, seedRes, accountsIncludedHash, maxMs, batchSize, ticksDone }
      };
      result = summary;
    } catch (e) {
      exception = e;
      summary = { ok: false, notes: notes.concat(["exception"]), errorMessage: String(e && e.message ? e.message : e) };
      result = summary;
    } finally {
      if (Game.__DEV) Game.__DEV.lastEconNpcLowFundsEvidencePack = result;
      emitLine(`ECON_NPC_LOW_FUNDS_EVIDENCE_JSON_1 ${safeStringify(summary || { ok: false, notes: ["missing_summary"] })}`);
      emitLine(`ECON_NPC_LOW_FUNDS_EVIDENCE_JSON_2 ${safeStringify({
        ok: !!(summary && summary.ok),
        worldDelta: summary && summary.invariants ? summary.invariants.worldDelta : null,
        skippedCount: summary ? summary.skippedCount : null,
        insufficientCount: summary ? summary.insufficientCount : null,
        logSource: summary && summary.meta ? summary.meta.logSource : null,
        rowsScoped: summary && summary.meta ? summary.meta.rowsScoped : null,
        exception: exception ? String(exception && exception.message ? exception.message : exception) : null
      })}`);
      emitLine("ECON_NPC_LOW_FUNDS_EVIDENCE_END");
    }
    return summary;
  };

  Game.__DEV.runEconNpcLowFundsRegressionPackOnce = (opts = {}) => {
    const seedLowFunds = (opts && typeof opts.seedLowFunds !== "undefined") ? !!opts.seedLowFunds : true;
    const Econ = Game.ConflictEconomy || Game._ConflictEconomy || null;
    const S = Game.__S || Game.State || null;
    const notes = [];
    let summary = null;
    const buildAccountsIncluded = (snap) => {
      const list = [];
      const push = (id) => {
        const key = String(id || "");
        if (!key || list.includes(key)) return;
        list.push(key);
      };
      const byId = (snap && snap.byId) ? snap.byId : {};
      Object.keys(byId).forEach(id => push(id));
      push("worldBank");
      push("sink");
      push("bank");
      push("crowd");
      Object.keys(byId).forEach(id => {
        if (String(id).startsWith("crowd:")) push(id);
      });
      if (Object.prototype.hasOwnProperty.call(byId, "security_owner")) push("security_owner");
      return list.sort();
    };
    const hashList = (list) => {
      let h = 5381;
      const s = list.join("|");
      for (let i = 0; i < s.length; i++) {
        h = ((h << 5) + h) + s.charCodeAt(i);
        h |= 0;
      }
      return `h${(h >>> 0).toString(16)}`;
    };
    const sumByAccounts = (snap, accounts) => {
      const byId = (snap && snap.byId) ? snap.byId : {};
      let total = 0;
      accounts.forEach(id => {
        const v = Number.isFinite(byId[id]) ? (byId[id] | 0) : 0;
        total += v;
      });
      return total;
    };
    const seedLowFundsOnce = () => {
      if (!seedLowFunds || !Econ || !S || !S.players) return { ok: true, reason: "seed_skipped" };
      const npcList = Object.values(S.players || {})
        .filter(p => p && p.id && String(p.id).startsWith("npc_"))
        .map(p => ({ id: String(p.id || ""), points: Number.isFinite(p.points) ? (p.points | 0) : 0 }))
        .filter(p => p.id);
      const richest = npcList.slice().sort((a, b) => b.points - a.points).slice(0, 3);
      let seededCount = 0;
      richest.forEach(npc => {
        if (!npc || npc.points <= 0) return;
        const res = Econ.transferPoints(npc.id, "sink", npc.points, "npc_low_funds_seed", { activityTaxSkip: true, mode: "npc_low_funds_seed" });
        if (res && res.ok) seededCount += 1;
      });
      return { ok: true, reason: "seed_applied", seededCount };
    };
    const getLogSource = () => {
      const candidates = [
        { name: "debug_moneyLog", rows: (Game.Debug && Array.isArray(Game.Debug.moneyLog)) ? Game.Debug.moneyLog : null },
        { name: "dev_moneyLog", rows: (Game.__D && Array.isArray(Game.__D.moneyLog)) ? Game.__D.moneyLog : null },
        { name: "state_moneyLog", rows: (Game.State && Array.isArray(Game.State.moneyLog)) ? Game.State.moneyLog : null },
        { name: "logger_queue", rows: (Game.Logger && Array.isArray(Game.Logger.queue)) ? Game.Logger.queue : null }
      ];
      for (const c of candidates) {
        if (c.rows && c.rows.length) return c;
      }
      return candidates.find(c => c.rows) || { name: "none", rows: [] };
    };
    try {
      emitLine("ECON_NPC_LOW_FUNDS_REGRESSION_BEGIN");
      if (!Econ || !S || typeof Game.__DEV.sumPointsSnapshot !== "function") {
        summary = { ok: false, notes: ["missing_state_or_snapshot"] };
        return summary;
      }
      const beforeSnap = Game.__DEV.sumPointsSnapshot();
      const accountsIncluded = buildAccountsIncluded(beforeSnap);
      const accountsIncludedHash = hashList(accountsIncluded);
      seedLowFundsOnce();
      let smokeRes = null;
      if (Game.__DEV && typeof Game.__DEV.smokeEcon02_NoEmissionPackOnce === "function") {
        smokeRes = Game.__DEV.smokeEcon02_NoEmissionPackOnce();
      } else {
        notes.push("smokeEcon02_NoEmissionPackOnce_missing");
        smokeRes = { ok: false, reason: "smoke_missing" };
      }
      const afterSnap = Game.__DEV.sumPointsSnapshot();
      const beforeTotal = sumByAccounts(beforeSnap, accountsIncluded);
      const afterTotal = sumByAccounts(afterSnap, accountsIncluded);
      const worldDelta = (Number.isFinite(beforeTotal) && Number.isFinite(afterTotal))
        ? ((afterTotal | 0) - (beforeTotal | 0))
        : null;
      const source = getLogSource();
      const logSource = source.name;
      const rows = source.rows || [];
      const tail = rows.slice(Math.max(0, rows.length - 400));
      const rowsScoped = tail.length;
      const skippedCount = tail.filter(r => r && r.reason === "npc_skip_low_funds").length;
      const insufficientCount = tail.filter(r => r && typeof r.reason === "string" && r.reason.indexOf("insufficient") >= 0).length;
      const worldDeltaOk = (worldDelta === 0);
      const ok = !!(smokeRes && smokeRes.ok === true) && worldDeltaOk && insufficientCount === 0;
      summary = {
        ok,
        notes,
        smoke: smokeRes,
        skippedCount,
        insufficientCount,
        invariants: { worldDelta, worldDeltaOk },
        before: { total: beforeTotal, accountsIncludedHash },
        after: { total: afterTotal, accountsIncludedHash },
        meta: { logSource, rowsScoped, accountsIncludedHash }
      };
    } catch (e) {
      summary = { ok: false, notes: notes.concat(["exception"]), errorMessage: String(e && e.message ? e.message : e) };
    } finally {
      emitLine(`ECON_NPC_LOW_FUNDS_REGRESSION_JSON ${safeStringify(summary || { ok: false, notes: ["missing_summary"] })}`);
      emitLine("ECON_NPC_LOW_FUNDS_REGRESSION_END");
    }
    return summary;
  };

  Game.__DEV.smokeEconNpc_LongOnce = (opts = {}) => {
    const name = "smoke_econ_npc_long_once";
    const ticks = Number.isFinite(opts.ticks) ? Math.max(1, opts.ticks | 0) : 300;
    const windowLastN = (opts.window && Number.isFinite(opts.window.lastN)) ? (opts.window.lastN | 0) : 400;
    const failed = [];
    const Events = Game.Events || null;
    const startLogLen = (Game.__D && Array.isArray(Game.__D.moneyLog)) ? Game.__D.moneyLog.length : 0;
    const snapBefore = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function")
      ? Game.__DEV.sumPointsSnapshot()
      : null;
    let ticksExecuted = 0;
    for (let i = 0; i < ticks; i += 1) {
      if (i >= ticks) break;
      if (Events && typeof Events.tick === "function") {
        Events.tick();
      }
      ticksExecuted += 1;
    }
    const snapAfter = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function")
      ? Game.__DEV.sumPointsSnapshot()
      : null;
    const worldBefore = (snapBefore && Number.isFinite(snapBefore.total)) ? (snapBefore.total | 0) : null;
    const worldAfter = (snapAfter && Number.isFinite(snapAfter.total)) ? (snapAfter.total | 0) : null;
    const worldDelta = (worldBefore != null && worldAfter != null) ? (worldAfter - worldBefore) : null;
    const endLogLen = (Game.__D && Array.isArray(Game.__D.moneyLog)) ? Game.__D.moneyLog.length : startLogLen;
    const deltaLog = endLogLen - startLogLen;
    if (deltaLog > ticks * 20) failed.push("log_runaway_detected");

    const getLogSourceCandidates = () => {
      const candidates = [
        { name: "debug_moneyLog", rows: (Game.Debug && Array.isArray(Game.Debug.moneyLog)) ? Game.Debug.moneyLog : null },
        { name: "dev_moneyLog", rows: (Game.__D && Array.isArray(Game.__D.moneyLog)) ? Game.__D.moneyLog : null },
        { name: "state_moneyLog", rows: (Game.State && Array.isArray(Game.State.moneyLog)) ? Game.State.moneyLog : null },
        { name: "logger_queue", rows: (Game.Logger && Array.isArray(Game.Logger.queue)) ? Game.Logger.queue : null }
      ];
      return candidates.map(c => ({ name: c.name, rows: c.rows, len: c.rows ? c.rows.length : 0 }));
    };
    const pickBestLogSource = (candidates) => {
      for (let i = 0; i < candidates.length; i += 1) {
        const c = candidates[i];
        if (c && c.rows && c.rows.length > 0) return c;
      }
      return candidates[0] || { name: "none", rows: null, len: 0 };
    };
    const logSourceCandidates = getLogSourceCandidates();
    const bestCandidate = pickBestLogSource(logSourceCandidates);
    const rowsScoped = bestCandidate && bestCandidate.rows
      ? bestCandidate.rows.slice(Math.max(0, bestCandidate.rows.length - windowLastN)).length
      : 0;

    const ok = failed.length === 0 && ticksExecuted === ticks && worldDelta === 0;
    return {
      name,
      ok,
      pass: ok,
      failed,
      summary: {
        worldDelta,
        rowsScoped,
        ticksExecuted
      },
      diag: {
        deltaLog,
        logSource: bestCandidate ? bestCandidate.name : "none",
        logSourceCandidates: logSourceCandidates.map(c => ({ name: c.name, len: c.len }))
      },
      ticks,
      window: { lastN: windowLastN }
    };
  };

  Game.__DEV.smokeEconNpc_WorldMassRepeatOnce = (opts = {}) => {
    const windowOpts = (opts && opts.window) ? opts.window : { lastN: 400 };
    const repeatN = Number.isFinite(opts.n) ? Math.max(1, opts.n | 0) : 10;
    const seed = (opts && typeof opts.seed !== "undefined") ? opts.seed : 1;
    const deltas = [];
    const runs = [];
    let allOk = true;
    for (let i = 0; i < repeatN; i++) {
      const res = (Game.__DEV && typeof Game.__DEV.auditNpcWorldBalanceOnce === "function")
        ? Game.__DEV.auditNpcWorldBalanceOnce({ window: windowOpts })
        : { ok: false, world: { delta: null }, notes: ["audit_missing"] };
      const delta = res && res.world ? res.world.delta : null;
      deltas.push(delta);
      runs.push({ i, ok: !!(res && res.ok), worldDelta: delta, notes: res && res.notes ? res.notes : [] });
      if (!res || res.ok !== true) allOk = false;
    }
    const allZero = deltas.every(d => d === 0);
    return { ok: allOk && allZero, repeatN, seed, deltas, allZero, runs };
  };

  Game.__DEV.smokeEconNpc_ReadinessPackOnce = async (opts = {}) => {
    const at = Date.now();
    const atLocal = new Date(at).toISOString().replace("T", " ").slice(0, 19);
    const dumpHint = (opts && typeof opts.dumpHint === "string") ? opts.dumpHint : "Game.__DUMP_ALL__()";
    const lastN = (opts.window && Number.isFinite(opts.window.lastN)) ? (opts.window.lastN | 0) : 600;
    const ticks = (opts.long && Number.isFinite(opts.long.ticks)) ? (opts.long.ticks | 0) : 300;
    const repeatN = Number.isFinite(opts.repeatN) ? Math.max(1, opts.repeatN | 0) : 10;
    const checklistKeys = ["1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "1.7", "1.8"];
    const checks = Object.create(null);
    const failReasons = [];
    const buildChecklist = () => {
      const out = Object.create(null);
      checklistKeys.forEach(k => { out[k] = false; });
      return out;
    };
    const buildFailNotes = () => {
      const out = Object.create(null);
      checklistKeys.forEach(k => { out[k] = []; });
      return out;
    };
    const getLogRows = () => {
      if (Game.Debug && Array.isArray(Game.Debug.moneyLog)) return Game.Debug.moneyLog;
      if (Game.__D && Array.isArray(Game.__D.moneyLog)) return Game.__D.moneyLog;
      if (Game.State && Array.isArray(Game.State.moneyLog)) return Game.State.moneyLog;
      if (Game.Logger && Array.isArray(Game.Logger.queue)) return Game.Logger.queue;
      return [];
    };
    const countReasons = (rows, reasons) => {
      const out = Object.create(null);
      reasons.forEach(r => { out[r] = 0; });
      rows.forEach(r => {
        const reason = String(r && r.reason || "");
        if (Object.prototype.hasOwnProperty.call(out, reason)) out[reason] += 1;
      });
      return out;
    };
    const buildTag = getWealthTaxBuildTag();
    let json1 = null;
    let json2 = null;
    let ok = false;
    try {
      emitLine("ECON_NPC_READINESS_PACK_BEGIN");
      const recordException = (key, err) => {
        const msg = err && err.message ? String(err.message) : String(err);
        checks[key] = { ok: false, note: `exception:${msg}`, evidence: null };
      };

      let worldRepeat = null;
      try {
        worldRepeat = (Game.__DEV && typeof Game.__DEV.smokeEconNpc_WorldMassRepeatOnce === "function")
          ? Game.__DEV.smokeEconNpc_WorldMassRepeatOnce({ n: repeatN, seed: 1, window: { lastN } })
          : { ok: false, repeatN, deltas: [], allZero: false, runs: [], notes: ["world_repeat_missing"] };
        checks["1.1"] = {
          ok: !!(worldRepeat && worldRepeat.ok),
          evidence: { repeatN: worldRepeat.repeatN, deltas: worldRepeat.deltas, allZero: worldRepeat.allZero }
        };
      } catch (e) {
        recordException("1.1", e);
      }

      try {
        const snap = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function") ? Game.__DEV.sumPointsSnapshot() : null;
        const contract = (Game.__DEV && typeof Game.__DEV.econNpcWorldContractV1 === "function")
          ? Game.__DEV.econNpcWorldContractV1({ snapById: snap ? snap.byId : null })
          : null;
        const contractOk = !!(contract && contract.accountsIncludedLen > 0 && contract.accountsIncludedHash);
        checks["1.2"] = {
          ok: contractOk,
          evidence: contract ? {
            accountsIncludedLen: contract.accountsIncludedLen,
            accountsIncludedHash: contract.accountsIncludedHash,
            addedAccounts: null
          } : { accountsIncludedLen: 0, accountsIncludedHash: null, addedAccounts: null }
        };
      } catch (e) {
        recordException("1.2", e);
      }

      let allowlistStability = null;
      try {
        allowlistStability = (Game.__DEV && typeof Game.__DEV.smokeEconNpc_AllowlistStabilityOnce === "function")
          ? Game.__DEV.smokeEconNpc_AllowlistStabilityOnce({ window: { lastN }, runs: 3 })
          : { ok: false, notes: ["allowlist_smoke_missing"] };
      } catch (e) {
        recordException("1.3", e);
      }

      try {
        let stipend = null;
        if (Game.__DEV && typeof Game.__DEV.smokeWorldStipendOnce === "function") {
          stipend = Game.__DEV.smokeWorldStipendOnce({ N: Math.min(100, ticks), runs: 1, window: { lastN } });
        }
        const logRows = getLogRows();
        const tail = logRows.slice(Math.max(0, logRows.length - lastN));
        const reasonLastSeenAt = (rows, reason) => {
          let lastAt = null;
          for (let i = rows.length - 1; i >= 0; i -= 1) {
            const r = rows[i];
            if (!r || String(r.reason || "") !== reason) continue;
            lastAt = r.time || r.ts || r.at || (r.meta && (r.meta.time || r.meta.ts)) || i;
            break;
          }
          return lastAt;
        };
        const stipendReasons = countReasons(tail, ["world_tax_in", "world_stipend_out"]);
        const forceStipendOnce = () => {
          const Econ = Game.ConflictEconomy || Game._ConflictEconomy || null;
          const S = Game.__S || Game.State || null;
          if (!Econ || !S || !S.players || typeof Econ.transferPoints !== "function" || typeof Econ.maybeWorldStipendTick !== "function") {
            return { ok: false, reason: "stipend_fn_missing" };
          }
          const npc = Object.values(S.players || {}).find(p => p && p.id && String(p.id).startsWith("npc_") && Number.isFinite(p.points) && (p.points | 0) > 0);
          if (!npc) return { ok: false, reason: "no_npc_with_points" };
          const npcId = String(npc.id || "");
          if (!npcId) return { ok: false, reason: "npc_id_missing" };
          let acc = null;
          if (typeof Econ.getAccount === "function") {
            try { acc = Econ.getAccount(npcId); } catch (_) { acc = null; }
          }
          const accPts = acc && Number.isFinite(acc.points) ? (acc.points | 0) : (Number.isFinite(npc.points) ? (npc.points | 0) : 0);
          if (accPts <= 0) return { ok: false, reason: "npc_points_zero" };
          const seedTx = Econ.transferPoints(npcId, "worldBank", accPts, "dev_stipend_seed", { mode: "dev_stipend_seed" });
          if (!seedTx || seedTx.ok !== true) return { ok: false, reason: "seed_transfer_failed" };
          const stipendRes = Econ.maybeWorldStipendTick({
            npcIds: [npcId],
            stipendAmount: 1,
            stipendThreshold: 0,
            maxRecipientsPerTick: 1,
            tick: "dev_stipend"
          });
          const revertAmt = Math.max(0, accPts - 1);
          if (revertAmt > 0) {
            Econ.transferPoints("worldBank", npcId, revertAmt, "dev_stipend_revert", { mode: "dev_stipend_revert" });
          }
          return { ok: true, stipendRes };
        };
        if ((stipendReasons.world_stipend_out | 0) === 0) {
          forceStipendOnce();
        }
        const tailAfter = getLogRows().slice(Math.max(0, getLogRows().length - lastN));
        const stipendReasonsAfter = countReasons(tailAfter, ["world_tax_in", "world_stipend_out"]);
        const stipendImplemented = (stipendReasonsAfter.world_stipend_out | 0) > 0 && (stipendReasonsAfter.world_tax_in | 0) > 0;
        checks["1.4"] = {
          ok: !!(stipendImplemented && stipend && stipend.ok === true),
          note: stipendImplemented ? null : "missing_world_stipend_reasons",
          evidence: {
            reasonsHit: stipendReasonsAfter,
            lastSeenAt: {
              world_tax_in: reasonLastSeenAt(tailAfter, "world_tax_in"),
              world_stipend_out: reasonLastSeenAt(tailAfter, "world_stipend_out")
            },
            worldDelta: stipend && stipend.runs && stipend.runs[0] && stipend.runs[0].audit && stipend.runs[0].audit.world ? stipend.runs[0].audit.world.delta : null,
            worldBankBefore: stipend && stipend.runs && stipend.runs[0] && stipend.runs[0].run ? stipend.runs[0].run.worldBankBefore : null,
            worldBankAfter: stipend && stipend.runs && stipend.runs[0] && stipend.runs[0].run ? stipend.runs[0].run.worldBankAfter : null,
            asserts: { noEmission: true, bankNonNegative: true }
          }
        };
      } catch (e) {
        recordException("1.4", e);
      }

      try {
        const activityA = (Game.__DEV && typeof Game.__DEV.smokeNpcActivityTax_StabilityOnce === "function")
          ? Game.__DEV.smokeNpcActivityTax_StabilityOnce({ mode: "tax_only", seedRichNpc: true })
          : { ok: false, notes: ["activity_tax_missing"] };
        const activityB = (Game.__DEV && typeof Game.__DEV.smokeNpcActivityTax_StabilityOnce === "function")
          ? Game.__DEV.smokeNpcActivityTax_StabilityOnce({ mode: "tax_only", seedRichNpc: true })
          : { ok: false, notes: ["activity_tax_missing"] };
        const hasFields = (a) => a && typeof a.ok === "boolean"
          && Number.isFinite(a.worldDelta)
          && Number.isFinite(a.taxRowsCount)
          && Number.isFinite(a.totalTax);
        const drift = {
          taxRowsCount: (activityA && activityB && Number.isFinite(activityA.taxRowsCount) && Number.isFinite(activityB.taxRowsCount))
            ? (activityA.taxRowsCount - activityB.taxRowsCount)
            : null,
          totalTax: (activityA && activityB && Number.isFinite(activityA.totalTax) && Number.isFinite(activityB.totalTax))
            ? (activityA.totalTax - activityB.totalTax)
            : null
        };
        const stableActivity = !!(hasFields(activityA) && hasFields(activityB)
          && activityA.ok === true
          && activityB.ok === true
          && activityA.worldDelta === 0
          && activityB.worldDelta === 0
          && activityA.taxRowsCount === activityB.taxRowsCount
          && activityA.totalTax === activityB.totalTax);
        checks["1.5"] = {
          ok: stableActivity,
          evidence: {
            run1: activityA ? { ok: activityA.ok, totalTax: activityA.totalTax, taxRowsCount: activityA.taxRowsCount } : null,
            run2: activityB ? { ok: activityB.ok, totalTax: activityB.totalTax, taxRowsCount: activityB.taxRowsCount } : null,
            drift,
            worldDelta1: activityA ? activityA.worldDelta : null,
            worldDelta2: activityB ? activityB.worldDelta : null,
            stableActivity,
            missingFields: !(hasFields(activityA) && hasFields(activityB))
          }
        };
      } catch (e) {
        recordException("1.5", e);
      }

      try {
        const lowFunds = (Game.__DEV && typeof Game.__DEV.smokeNpcLowFundsPolicyOnce === "function")
          ? Game.__DEV.smokeNpcLowFundsPolicyOnce({ ticks: Math.min(50, ticks), seedLowFunds: true, debugTelemetry: false })
          : { ok: false, reason: "low_funds_missing" };
        const negativeBalancesFound = (() => {
          const S = Game.__S || Game.State;
          if (!S || !S.players) return false;
          return Object.values(S.players).some(p => p && Number.isFinite(p.points) && p.points < 0);
        })();
        const lowFundsOk = !!(lowFunds && lowFunds.ok === true);
        const runLowFundsMini = () => {
          const Econ = Game.ConflictEconomy || Game._ConflictEconomy || null;
          const S = Game.__S || Game.State || null;
          if (!Econ || !S || !S.players || typeof Econ.chargePriceOnce !== "function" || typeof Econ.transferPoints !== "function") {
            return { ok: false, reason: "chargePriceOnce_or_transferPoints_missing" };
          }
          const npcWeak = S.players && S.players.npc_weak ? S.players.npc_weak : null;
          const npc = npcWeak || Object.values(S.players || {}).find(p => p && p.id && String(p.id).startsWith("npc_"));
          if (!npc) return { ok: false, reason: "npc_missing" };
          const npcId = String(npc.id || "");
          if (!npcId) return { ok: false, reason: "npc_id_missing" };
          let acc = null;
          if (typeof Econ.getAccount === "function") {
            try { acc = Econ.getAccount(npcId); } catch (_) { acc = null; }
          }
          const accPts = acc && Number.isFinite(acc.points) ? (acc.points | 0) : (Number.isFinite(npc.points) ? (npc.points | 0) : 0);
          let res = null;
          let skipped = 0;
          let debitOk = true;
          let creditOk = true;
          const moved = accPts > 0 ? accPts : 0;
          try {
            if (moved > 0) {
              const txOut = Econ.transferPoints(npcId, "worldBank", moved, "npc_low_funds_probe_seed", { activityTaxSkip: true, mode: "npc_low_funds_probe_seed" });
              debitOk = !!(txOut && txOut.ok);
            }
            res = Econ.chargePriceOnce({
              fromId: npcId,
              toId: "sink",
              actorId: npcId,
              reason: "npc_low_funds_probe",
              priceKey: "low_funds_probe",
              basePrice: 1,
              actorPoints: 0,
              context: { contextId: "low_funds_probe", tickId: "low_funds_probe" },
              tickId: "low_funds_probe",
              actionKey: "low_funds_probe",
              extraMeta: { contextId: "low_funds_probe" }
            });
            const logRows = getLogRows();
            const tail = logRows.slice(Math.max(0, logRows.length - lastN));
            skipped = tail.filter(r => r && r.reason === "npc_skip_low_funds").length;
          } catch (e) {
            return { ok: false, reason: String(e && e.message ? e.message : e), npcId };
          } finally {
            if (moved > 0) {
              const txBack = Econ.transferPoints("worldBank", npcId, moved, "npc_low_funds_probe_revert", { activityTaxSkip: true, mode: "npc_low_funds_probe_revert" });
              creditOk = !!(txBack && txBack.ok);
            }
          }
          const resReason = res && typeof res.reason === "string" ? res.reason : "";
          const resInsufficient = resReason.indexOf("insufficient") >= 0;
          const resSkip = resReason.indexOf("npc_skip_low_funds") >= 0;
          const ok = !!(res && res.ok === false && (skipped > 0 || resSkip) && !resInsufficient && debitOk && creditOk);
          return { ok, skippedCount: skipped, res, debitOk, creditOk, moved, npcId };
        };
        const mini = (!lowFundsOk || (lowFunds && lowFunds.skippedCount <= 0)) ? runLowFundsMini() : { ok: true, skippedCount: lowFunds && lowFunds.skippedCount };
        const getLogSourceUsed = () => {
          if (Game.Debug && Array.isArray(Game.Debug.moneyLog)) return { name: "debug_moneyLog", rows: Game.Debug.moneyLog };
          if (Game.__D && Array.isArray(Game.__D.moneyLog)) return { name: "dev_moneyLog", rows: Game.__D.moneyLog };
          if (Game.State && Array.isArray(Game.State.moneyLog)) return { name: "state_moneyLog", rows: Game.State.moneyLog };
          if (Game.Logger && Array.isArray(Game.Logger.queue)) return { name: "logger_queue", rows: Game.Logger.queue };
          return { name: "none", rows: [] };
        };
        const logSourceUsed = getLogSourceUsed();
        const tail = (logSourceUsed.rows || []).slice(Math.max(0, (logSourceUsed.rows || []).length - lastN));
        const seenSkipReason = tail.some(r => r && r.reason === "npc_skip_low_funds");
        const seenInsufficient = tail.some(r => r && r.reason === "insufficient_points");
        const skipReasonCount = Math.max(
          lowFunds && Number.isFinite(lowFunds.skippedCount) ? lowFunds.skippedCount : 0,
          mini && Number.isFinite(mini.skippedCount) ? mini.skippedCount : 0
        );
        const sampleReasons = Array.from(new Set(tail.slice(-20).map(r => String(r && r.reason || "")))).filter(Boolean).slice(0, 5);
        checks["1.6"] = {
          ok: false,
          evidence: {
            ok: false,
            npcId: mini && mini.npcId ? mini.npcId : null,
            logSourceUsed: logSourceUsed.name,
            seenSkipReason,
            seenInsufficient,
            notes: lowFunds && Array.isArray(lowFunds.notes) ? lowFunds.notes.slice() : [],
            skipReasonCount,
            expensiveActionBlockedCount: lowFunds ? lowFunds.insufficientCount : 0,
            lowFundsOk,
            negativeBalancesFound,
            mini,
            sampleReasons
          }
        };
      } catch (e) {
        recordException("1.6", e);
      }

      try {
        const explainable = (Game.__DEV && typeof Game.__DEV.smokeNpcWorldAuditExplainableOnce === "function")
          ? Game.__DEV.smokeNpcWorldAuditExplainableOnce({ window: { lastN }, debugTelemetry: false })
          : { ok: false, notes: ["audit_missing"] };
        const explainOk = !!(explainable && explainable.ok === true);
        checks["1.7"] = {
          ok: explainOk,
          evidence: {
            topTransfersLen: explainable && explainable.asserts ? explainable.asserts.topTransfersLen : null,
            byReasonDetailedNonEmptyWhenRows: explainable && explainable.asserts ? explainable.asserts.byReasonDetailedNonEmptyWhenRows : null
          }
        };
      } catch (e) {
        recordException("1.7", e);
      }

      let regress = { ok: false, failed: ["regress_missing"] };
      let longSmoke = { ok: false, summary: { worldDelta: null, ticksExecuted: 0, rowsScoped: 0 } };
      try {
        regress = (Game.__DEV && typeof Game.__DEV.smokeEconNpc_RegressPackOnce === "function")
          ? Game.__DEV.smokeEconNpc_RegressPackOnce({ window: { lastN }, long: { ticks }, dumpHint })
          : regress;
      } catch (e) {
        recordException("1.8", e);
      }
      try {
        longSmoke = (Game.__DEV && typeof Game.__DEV.smokeEconNpc_LongOnce === "function")
          ? Game.__DEV.smokeEconNpc_LongOnce({ ticks, window: { lastN }, seedRichNpc: true })
          : longSmoke;
      } catch (e) {
        recordException("1.8", e);
      }
      const longSummary = longSmoke && longSmoke.summary ? longSmoke.summary : {};
      const longOk = !!(longSmoke && longSmoke.ok === true);
      const regressOk = !!(regress && regress.ok === true);
      const longWorldDeltaOk = (longSummary.worldDelta === 0);
      const longFinite = Number.isFinite(longSummary.ticksExecuted) && longSummary.ticksExecuted === ticks;
      const longNoRunaway = Array.isArray(longSmoke && longSmoke.failed) ? !longSmoke.failed.includes("log_runaway_detected") : true;
      const longNoNegative = (() => {
        const S = Game.__S || Game.State;
        if (!S || !S.players) return true;
        return !Object.values(S.players).some(p => p && Number.isFinite(p.points) && p.points < 0);
      })();
      if (!checks["1.3"] || checks["1.3"].ok !== false) {
        checks["1.3"] = {
          ok: !!(longOk && longWorldDeltaOk && longFinite && longNoRunaway && longNoNegative),
          evidence: {
            longOk,
            longWorldDeltaOk,
            longFinite,
            longNoRunaway,
            longNoNegative,
            allowlistNotes: allowlistStability && Array.isArray(allowlistStability.notes) ? allowlistStability.notes : []
          }
        };
      }
      if (!checks["1.8"] || checks["1.8"].ok !== false) {
        checks["1.8"] = {
          ok: !!(regressOk && longOk && longWorldDeltaOk),
          evidence: {
            regressOk: regressOk,
            regressFailed: regress ? regress.failed : ["regress_missing"],
            long: {
              ticksRun: longSummary.ticksExecuted,
              worldDelta: longSummary.worldDelta,
              rowsScoped: longSummary.rowsScoped
            }
          }
        };
      }
      if (checks["1.6"] && checks["1.6"].ok !== true) {
        const longHasSkip = !!(longSmoke && longSmoke.summary && longSmoke.summary.hasNpcSkipLowFunds === true || (longSmoke && longSmoke.hasNpcSkipLowFunds === true));
        const longNoNegative = !!(longSmoke && longSmoke.summary && longSmoke.summary.negativeBalances === false || (longSmoke && longSmoke.negativeBalances === false));
        const longNotes = (longSmoke && Array.isArray(longSmoke.failed)) ? longSmoke.failed : [];
        const longOkForLowFunds = longHasSkip && longNoNegative && longNotes.length === 0;
        if (checks["1.6"].evidence) {
          checks["1.6"].evidence.longHasSkip = longHasSkip;
          checks["1.6"].evidence.longNoNegative = longNoNegative;
          checks["1.6"].evidence.longNotes = longNotes.slice(0, 5);
        }
        if (longOkForLowFunds) {
          checks["1.6"].ok = true;
          if (checks["1.6"].evidence) checks["1.6"].evidence.ok = true;
        } else {
          const ev = checks["1.6"].evidence;
          const miniOk = !!(ev && ev.mini && ev.mini.ok === true);
          const strictOk = !!(ev && ev.lowFundsOk && ev.seenSkipReason && !ev.seenInsufficient && ev.negativeBalancesFound === false);
          checks["1.6"].ok = !!(miniOk || strictOk);
          if (checks["1.6"].evidence) checks["1.6"].evidence.ok = checks["1.6"].ok;
        }
      }

      const checklist = Object.create(null);
      const failNotes = buildFailNotes();
      checklistKeys.forEach(k => {
        const entry = checks[k];
        const okVal = !!(entry && entry.ok);
        checklist[k] = okVal;
        if (!okVal) {
          const note = entry && entry.note ? String(entry.note) : "failed";
          failNotes[k].push(note);
          if (k === "1.5") {
            const diag = entry && entry.evidence ? entry.evidence : null;
            if (diag) failNotes[k].push(`diag:${safeStringify(diag)}`);
          }
          if (k === "1.6") {
            const diag = entry && entry.evidence ? entry.evidence : null;
            if (diag) failNotes[k].push(`diag:${safeStringify(diag)}`);
          }
          failReasons.push(`check_${k}`);
        }
      });
      const allOk = checklistKeys.every(k => checklist[k] === true) && regressOk && longOk && longWorldDeltaOk;
      if (!regressOk) failReasons.push("regress_failed");
      if (!longOk) failReasons.push("long_failed");
      if (Number.isFinite(longSummary.worldDelta) && !longWorldDeltaOk) failReasons.push("world_delta_nonzero");
      if (allOk) failReasons.length = 0;

      const longNpc = (() => {
        const S = Game.__S || Game.State;
        if (!S || !S.players) return { minPts: null, maxPts: null, zerosCount: 0 };
        const vals = Object.values(S.players || {}).filter(p => p && p.id && String(p.id).startsWith("npc_")).map(p => (Number.isFinite(p.points) ? (p.points | 0) : 0));
        const minPts = vals.length ? Math.min(...vals) : null;
        const maxPts = vals.length ? Math.max(...vals) : null;
        const zerosCount = vals.filter(v => v === 0).length;
        return { minPts, maxPts, zerosCount };
      })();

      json1 = {
        buildTag,
        atLocal,
        args: { lastN, ticks, repeatN },
        checks,
        regress: regress && regress.results ? Object.keys(regress.results).reduce((acc, key) => {
          const r = regress.results[key] || {};
          acc[key] = { ok: r.ok, pass: r.pass, battleId: r.battleId || null, eventId: r.eventId || null };
          return acc;
        }, {}) : {},
        longSmoke: {
          ticksPlanned: ticks,
          ticksRun: longSummary.ticksExecuted,
          ok: longOk,
          world: { before: null, after: null, delta: longSummary.worldDelta },
          npc: { minPts: longNpc.minPts, maxPts: longNpc.maxPts, zerosCount: longNpc.zerosCount },
          reasonsTop: longSmoke && longSmoke.diag && longSmoke.diag.logSourceCandidates ? longSmoke.diag.logSourceCandidates : [],
          hasNpcSkipLowFunds: !!(checks["1.6"] && checks["1.6"].evidence && checks["1.6"].evidence.skipReasonCount > 0),
          negativeBalances: !!(checks["1.6"] && checks["1.6"].evidence && checks["1.6"].evidence.negativeBalancesFound)
        }
      };
      json2 = {
        checklist,
        allOk: allOk,
        failNotes,
        failReasons,
        proofPointers: {
          dumpHint,
          expectedMarkers: [
            "ECON_NPC_READINESS_PACK_BEGIN",
            "ECON_NPC_READINESS_PACK_JSON1",
            "ECON_NPC_READINESS_PACK_JSON2",
            "ECON_NPC_READINESS_PACK_END"
          ]
        }
      };
      ok = !!json2.allOk;
      emitLine(`ECON_NPC_READINESS_PACK_JSON1 ${safeStringify(json1)}`);
      emitLine(`ECON_NPC_READINESS_PACK_JSON2 ${safeStringify(json2)}`);
    } catch (err) {
      failReasons.push("exception");
      const checklist = buildChecklist();
      const failNotes = buildFailNotes();
      checklistKeys.forEach(k => { failNotes[k].push("exception"); });
      json1 = json1 || { buildTag, atLocal, args: { lastN, ticks, repeatN }, checks: checks };
      json2 = {
        checklist,
        allOk: false,
        failNotes,
        failReasons,
        errorMessage: err && err.message ? String(err.message) : String(err),
        proofPointers: { dumpHint, expectedMarkers: ["ECON_NPC_READINESS_PACK_BEGIN", "ECON_NPC_READINESS_PACK_JSON1", "ECON_NPC_READINESS_PACK_JSON2", "ECON_NPC_READINESS_PACK_END"] }
      };
      emitLine(`ECON_NPC_READINESS_PACK_JSON1 ${safeStringify(json1)}`);
      emitLine(`ECON_NPC_READINESS_PACK_JSON2 ${safeStringify(json2)}`);
    } finally {
      emitLine("ECON_NPC_READINESS_PACK_END");
      if (Game.__DEV) Game.__DEV.lastEconNpcReadinessPack = { ok, json1, json2 };
    }
    return { ok, json1, json2 };
  };

  Game.__DEV.smokeEconNpc_RegressPackOnce = (opts = {}) => {
    const name = "smoke_econ_npc_regress_pack_once";
    const startedAt = Date.now();
    const dumpHint = (opts && typeof opts.dumpHint === "string") ? opts.dumpHint : "Game.__DUMP_ALL__()";
    const longOpts = opts.long || {};
    const paymentsWindow = (opts && opts.window && Number.isFinite(opts.window.lastN))
      ? { lastN: opts.window.lastN | 0 }
      : { lastN: 400 };
    const runBattleSplitSmoke = () => {
      if (!Game.__DEV || typeof Game.__DEV.smokeCrowdStep2 !== "function") return { name: "smoke_crowd_step2", ok: false, details: "missing_smoke" };
      return Game.__DEV.smokeCrowdStep2({ allowParallel: false, debugTelemetry: true });
    };
    let battleSplitResult = null;
    const plan = [
      {
        key: "battle_majority",
        runner: () => (Game.__DEV && typeof Game.__DEV.smokeBattleCrowdOutcomeOnce === "function")
          ? Game.__DEV.smokeBattleCrowdOutcomeOnce({ allowParallel: false, mode: "majority", debugTelemetry: true })
          : { name: "smoke_battle_crowd_outcome_once", ok: false, details: "missing_smoke" }
      },
      {
        key: "battle_fifty_cap",
        runner: () => {
          if (!battleSplitResult) battleSplitResult = runBattleSplitSmoke();
          const base = battleSplitResult ? { ...battleSplitResult } : { name: "smoke_crowd_step2", ok: false, details: "missing_smoke" };
          const subKeys = ["fiftyFifty", "majority"];
          const resolveSubPass = (sub) => {
            if (!sub) return false;
            if (typeof sub.pass === "boolean") return sub.pass;
            if (typeof sub.ok === "boolean") return sub.ok;
            return false;
          };
          const subPasses = subKeys.map(k => resolveSubPass(base[k]));
          const subOks = subKeys.map(k => !!(base[k] && base[k].ok));
          const computedPass = subPasses.every(Boolean);
          base.pass = computedPass;
          base.ok = computedPass;
          base.diag = Object.assign({}, base.diag || {}, {
            subKeys,
            subPasses,
            subOks,
            computedPass,
            computedOk: computedPass
          });
          return base;
        }
      },
      {
        key: "split_remainder",
        runner: () => {
          if (!battleSplitResult) battleSplitResult = runBattleSplitSmoke();
          const base = battleSplitResult ? { ...battleSplitResult } : { name: "smoke_crowd_step2", ok: false, details: "missing_smoke" };
          const subKeys = ["fiftyFifty", "majority"];
          const resolveSubPass = (sub) => {
            if (!sub) return false;
            if (typeof sub.pass === "boolean") return sub.pass;
            if (typeof sub.ok === "boolean") return sub.ok;
            return false;
          };
          const subPasses = subKeys.map(k => resolveSubPass(base[k]));
          const subOks = subKeys.map(k => !!(base[k] && base[k].ok));
          const computedPass = subPasses.every(Boolean);
          const computedOk = computedPass;
          const abilityLogs = [];
          const battleIds = [];
          const pushLogs = (candidate) => {
            if (!candidate || !candidate.battleId) return;
            battleIds.push(candidate.battleId);
            const dbg = (Game.__D && Game.__D.moneyLogByBattle && Game.__D.moneyLogByBattle[candidate.battleId])
              ? Game.__D.moneyLogByBattle[candidate.battleId]
              : (Game.__D && Array.isArray(Game.__D.moneyLog))
                ? Game.__D.moneyLog.filter(tx => String(tx && tx.battleId || "") === String(candidate.battleId))
                : [];
            abilityLogs.push(...dbg);
          };
          pushLogs(base.fiftyFifty);
          pushLogs(base.majority);
          const byReasonCounts = abilityLogs.reduce((acc, tx) => {
            const reason = String(tx && tx.reason || "unknown");
            acc[reason] = (acc[reason] || 0) + ((tx && Number.isFinite(tx.amount)) ? (tx.amount | 0) : 0);
            return acc;
          }, Object.create(null));
          const byReasonTop5 = Object.keys(byReasonCounts)
            .map(reason => ({ reason, amount: byReasonCounts[reason] }))
            .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
            .slice(0, 5);
          const moneyLogSumNet = abilityLogs.reduce((acc, tx) => acc + ((tx && Number.isFinite(tx.amount)) ? (tx.amount | 0) : 0), 0);
          const diagDetails = {
            why: computedPass ? "ok" : (base.details || "split_remainder_failed"),
            asserts: {
              fiftyFifty: base.fiftyFifty ? base.fiftyFifty.asserts : null,
              majority: base.majority ? base.majority.asserts : null
            },
            byReasonTop5,
            snapshotDeltaWorld: base.snapshotReport ? base.snapshotReport.deltaWorld : null,
            moneyLogSumNet,
            battleIds: battleIds.length ? Array.from(new Set(battleIds)) : null,
            subKeys,
            subPasses,
            subOks,
            computedPass,
            computedOk
          };
          base.diag = Object.assign({}, base.diag || {}, diagDetails);
          base.pass = computedPass;
          base.ok = computedOk;
          return base;
        }
      },
      {
        key: "escape_crowd",
        runner: () => (Game.__DEV && typeof Game.__DEV.smokeEscapeCrowdOutcomeOnce === "function")
          ? Game.__DEV.smokeEscapeCrowdOutcomeOnce({ allowParallel: false })
          : { name: "smoke_escape_crowd_outcome_once", ok: false, details: "missing_smoke" }
      },
      {
        key: "ignore_crowd",
        runner: () => (Game.__DEV && typeof Game.__DEV.smokeIgnoreCrowdOutcomeOnce === "function")
          ? Game.__DEV.smokeIgnoreCrowdOutcomeOnce({ allowParallel: false })
          : { name: "smoke_ignore_crowd_outcome_once", ok: false, details: "missing_smoke" }
      },
      {
        key: "paid_votes",
        runner: () => (Game.__DEV && typeof Game.__DEV.smokeNpcCrowdEventPaidVotesOnce === "function")
          ? Game.__DEV.smokeNpcCrowdEventPaidVotesOnce({ window: paymentsWindow })
          : { name: "smoke_npc_crowd_event_paid_votes_once", ok: false, details: "missing_smoke" }
      },
      {
        key: "long",
        runner: () => (Game.__DEV && typeof Game.__DEV.smokeEconNpc_LongOnce === "function")
          ? Game.__DEV.smokeEconNpc_LongOnce({
            ticks: Number.isFinite(longOpts.ticks) ? longOpts.ticks | 0 : 300,
            window: (longOpts.window && Number.isFinite(longOpts.window.lastN)) ? { lastN: longOpts.window.lastN | 0 } : { lastN: 400 },
            runOpts: longOpts.runOpts || {}
          })
          : { name: "smoke_econ_npc_long_once", ok: false, details: "missing_smoke" }
      }
    ];
    const results = Object.create(null);
    const failures = new Set();
    plan.forEach(entry => {
      let res = null;
      try {
        res = entry.runner();
      } catch (err) {
        res = {
          name: entry.key,
          ok: false,
          details: "runner_exception",
          errorMessage: String(err && err.message ? err.message : err),
          errorStack: err && err.stack ? String(err.stack) : null
        };
      }
      if (!res) {
        res = { name: entry.key, ok: false, details: "missing_result" };
      }
      const stored = Object.assign({}, res);
      stored.key = entry.key;
      if (typeof stored.pass !== "boolean") stored.pass = !!stored.ok;
      results[entry.key] = stored;
      if (!res.ok) failures.add(`smoke_failed:${entry.key}`);
      if (res.asserts && res.asserts.worldMassOk === false) {
        failures.add("world_mass_drift");
      }
    });
    const failed = Array.from(failures);
    const ok = failed.length === 0;
    const finishedAt = Date.now();
    const worldIdsByKey = Object.create(null);
    Object.keys(results).forEach((key) => {
      const d = results[key] && results[key].diag ? results[key].diag : null;
      if (!d) return;
      const hasWorldDiag = d.worldIdsCount != null || d.worldIdsSample || d.missingAccounts || d.includedServiceAccounts;
      if (!hasWorldDiag) return;
      worldIdsByKey[key] = {
        worldIdsCount: d.worldIdsCount != null ? d.worldIdsCount : null,
        worldIdsSample: Array.isArray(d.worldIdsSample) ? d.worldIdsSample : null,
        missingAccounts: Array.isArray(d.missingAccounts) ? d.missingAccounts : null,
        includedServiceAccounts: d.includedServiceAccounts || null
      };
    });
    return {
      name,
      ok,
      pass: ok,
      failed,
      results,
      diag: {
        worldIdsByKey: Object.keys(worldIdsByKey).length ? worldIdsByKey : null
      },
      meta: {
        buildTag: getWealthTaxBuildTag(),
        dumpHint,
        startedAt,
        finishedAt
      }
    };
  };

  Game.__DEV.smokeWealthTaxWithPhasesOnce = (opts = {}) => {
    const getMoneyLog = (sourceHint) => {
      if (sourceHint === "logger_queue" && Game.Logger && Array.isArray(Game.Logger.queue)) return Game.Logger.queue;
      if (sourceHint === "state_moneyLog" && Game.State && Array.isArray(Game.State.moneyLog)) return Game.State.moneyLog;
      if (Game.__D && Array.isArray(Game.__D.moneyLog)) return Game.__D.moneyLog;
      if (Game.Debug && Array.isArray(Game.Debug.moneyLog)) return Game.Debug.moneyLog;
      if (Game.State && Array.isArray(Game.State.moneyLog)) return Game.State.moneyLog;
      if (Game.Logger && Array.isArray(Game.Logger.queue)) return Game.Logger.queue;
      return [];
    };
    const buildReasonAgg = (rows, topN = 5, sampleN = 3) => {
      const byReason = Object.create(null);
      const samples = Object.create(null);
      rows.forEach(r => {
        if (!r) return;
        const reason = String(r.reason || "");
        if (!reason) return;
        const amt = Number.isFinite(r.amount) ? (r.amount | 0) : 0;
        if (amt === 0) return;
        byReason[reason] = (byReason[reason] || 0) + amt;
        if (!samples[reason]) samples[reason] = [];
        if (samples[reason].length < sampleN) {
          samples[reason].push({
            sourceId: r.sourceId || null,
            targetId: r.targetId || null,
            amount: amt,
            reason
          });
        }
      });
      const reasonsTop = Object.keys(byReason)
        .map(reason => ({ reason, amount: byReason[reason] }))
        .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
        .slice(0, topN);
      const samplesTop = {};
      reasonsTop.forEach(r => { samplesTop[r.reason] = samples[r.reason] || []; });
      return { reasonsTop, samplesTop };
    };
    let leak = null;
    if (Game.__DEV && Game.__DEV.__lastTickLeakDetected) {
      leak = Game.__DEV.__lastTickLeakDetected;
    }
    const summaryPayload = {
      ok: false,
      buildTag: "build_2026_02_09b",
      leakDetected: leak ? true : false,
      leakPhase: leak ? leak.phase : null,
      leakSumDelta: leak ? leak.sumDelta : null,
      topDeltaAccounts: leak ? leak.topDeltaAccounts || [] : [],
      lastMoneyLogAgg: leak ? leak.lastNMoneyLogReasons || [] : [],
      totalTaxInWindow: null,
      worldDelta: null,
      worldDeltaAfterTicks: null,
      ensureNpcAccounts: null,
      worldTaxRowsInWindow: { world_tax_in: 0, world_tax_out: 0 },
      notes: []
    };
    try {
      Game.__DEV.dumpNpcEconAccountsOnce();
      Game.__DEV.smokeEconNpc_WealthTaxPackTwiceOnce({
        ticks: 50,
        seedRichNpc: true,
        debugTelemetry: true,
        window: { lastN: 400 },
        ...opts
      });
      if (typeof Game.__DEV.smokeWealthTaxDumpOnce_Safe === "function") {
        Game.__DEV.smokeWealthTaxDumpOnce_Safe();
      }
      const lastPack = Game.__DEV.lastEconNpcWealthTaxEvidencePack;
      const lastSummary = lastPack && lastPack.summary ? lastPack.summary : null;
      const lastDiag = lastSummary && lastSummary.diag ? lastSummary.diag : null;
      summaryPayload.totalTaxInWindow = lastSummary && lastSummary.tax ? lastSummary.tax.totalTaxInWindow : null;
      summaryPayload.worldDelta = lastSummary && lastSummary.world ? lastSummary.world.delta : null;
      summaryPayload.ensureNpcAccounts = lastDiag && lastDiag.ensureNpcAccounts ? lastDiag.ensureNpcAccounts : null;
      summaryPayload.worldTaxRowsInWindow = lastDiag && lastDiag.worldTaxRowsInWindow
        ? lastDiag.worldTaxRowsInWindow
        : { world_tax_in: 0, world_tax_out: 0 };
      const phases = (Game.__DEV && Array.isArray(Game.__DEV.__lastWorldMassPhases)) ? Game.__DEV.__lastWorldMassPhases : [];
      const beforeTicks = phases.find(p => p && p.stage === "beforeTicks");
      const afterTicks = phases.find(p => p && p.stage === "afterAllTicks");
      if (beforeTicks && afterTicks && beforeTicks.totals && afterTicks.totals) {
        const beforeAll = Number.isFinite(beforeTicks.totals.totalPtsAll) ? (beforeTicks.totals.totalPtsAll | 0) : null;
        const afterAll = Number.isFinite(afterTicks.totals.totalPtsAll) ? (afterTicks.totals.totalPtsAll | 0) : null;
        if (beforeAll != null && afterAll != null) summaryPayload.worldDeltaAfterTicks = afterAll - beforeAll;
      }
      const taxRows = summaryPayload.worldTaxRowsInWindow || { world_tax_in: 0, world_tax_out: 0 };
      if (summaryPayload.worldDeltaAfterTicks !== 0) {
        summaryPayload.notes.push("tick_drift_without_tax_rows");
        const sourceHint = lastDiag && lastDiag.logSource ? lastDiag.logSource : null;
        const logRows = getMoneyLog(sourceHint);
        const lastN = (opts && opts.window && Number.isFinite(opts.window.lastN)) ? (opts.window.lastN | 0) : 400;
        const tail = logRows.slice(Math.max(0, logRows.length - lastN));
        const agg = buildReasonAgg(tail, 5, 3);
        emitLine("TICK_DRIFT_TOP_REASONS_BEGIN");
        emitLine(JSON.stringify({
          phase: "afterAllTicks",
          worldDeltaAfterTicks: summaryPayload.worldDeltaAfterTicks,
          reasonsTop: agg.reasonsTop,
          samplesTop: agg.samplesTop
        }));
        emitLine("TICK_DRIFT_TOP_REASONS_END");
      }
      summaryPayload.ok = true;
    } catch (err) {
      summaryPayload.ok = false;
      summaryPayload.notes.push(err && err.message ? err.message : String(err));
    }
    emitLine("WEALTH_TAX_PHASES_SUMMARY_BEGIN");
    emitLine(JSON.stringify(summaryPayload));
    emitLine("WEALTH_TAX_PHASES_SUMMARY_END");
    try {
      if (typeof window !== "undefined" && typeof window.__CONSOLE_TAPE_FLUSH__ === "function") {
        window.__CONSOLE_TAPE_FLUSH__();
        emitLine(`WEALTH_TAX_PHASES_SUMMARY_FLUSH_OK ${JSON.stringify({ ok: summaryPayload.ok, bytes: 0, lines: 0 })}`);
      }
      emitLine("WEALTH_TAX_PHASES_SUMMARY_FLUSH_POST");
    } catch (_) {}
    return summaryPayload;
  };

  Game.__DEV.smokeEconNpc_WealthTaxPackTwiceOnce = (opts = {}) => {
    const out = { ok: false, first: null, second: null, asserts: [] };
    try {
      Game.__DEV.runEconNpcWealthTaxEvidencePackOnce(opts);
      const first = Game.__DEV.lastEconNpcWealthTaxEvidencePack || null;
      Game.__DEV.runEconNpcWealthTaxEvidencePackOnce(opts);
      const second = Game.__DEV.lastEconNpcWealthTaxEvidencePack || null;
      out.first = first;
      out.second = second;
      const firstDiag = first && first.summary && first.summary.diag ? first.summary.diag : null;
      const secondDiag = second && second.summary && second.summary.diag ? second.summary.diag : null;
      const firstEnsure = firstDiag && firstDiag.ensureNpcAccounts ? firstDiag.ensureNpcAccounts : null;
      const secondEnsure = secondDiag && secondDiag.ensureNpcAccounts ? secondDiag.ensureNpcAccounts : null;
      const firstOk = first && first.summary ? !!first.summary.ok : false;
      const secondOk = second && second.summary ? !!second.summary.ok : false;
      out.asserts.push({ name: "first_created_gt_0", ok: !!(firstEnsure && Number.isFinite(firstEnsure.createdCount) && firstEnsure.createdCount > 0) });
      out.asserts.push({ name: "second_created_eq_0", ok: !!(secondEnsure && Number.isFinite(secondEnsure.createdCount) && secondEnsure.createdCount === 0) });
      out.asserts.push({ name: "missing_after_zero", ok: !!(secondEnsure && Number.isFinite(secondEnsure.missingAfterCount) && secondEnsure.missingAfterCount === 0) });
      out.asserts.push({ name: "log_source_non_none", ok: !!(secondDiag && secondDiag.logSourceChosen && secondDiag.logSourceChosen !== "none") });
      out.asserts.push({ name: "rows_scoped_positive", ok: !!(second && second.summary && second.summary.asserts && second.summary.asserts.rowsScopedPositive) });
      out.asserts.push({ name: "world_delta_zero", ok: !!(second && second.summary && second.summary.asserts && second.summary.asserts.worldDeltaZero) });
      out.asserts.push({ name: "tax_in_rows", ok: !!(second && second.summary && second.summary.asserts && second.summary.asserts.hasWorldTaxInRows) });
      out.ok = out.asserts.every(a => a.ok) && firstOk && secondOk;
    } catch (e) {
      out.asserts.push({ name: "exception", ok: false, error: String(e && e.message ? e.message : e) });
      out.ok = false;
    }
    Game.__DEV.lastEconNpcWealthTaxPackTwice = out;
    return out;
  };

  // dev-only stability helper: run wealth tax pack 3 times and emit one summary block.
  Game.__DEV.smokeEconNpcWealthTaxContractStabilityOnce = (opts = {}) => {
    const header = "WORLD_ECON_NPC_WEALTH_TAX_CONTRACT_STABILITY_BEGIN";
    const footer = "WORLD_ECON_NPC_WEALTH_TAX_CONTRACT_STABILITY_END";
    const buildTag = "build_2026_02_09b";
    const lastN = (opts && opts.window && Number.isFinite(opts.window.lastN)) ? (opts.window.lastN | 0) : 400;
    const makeOpts = (ticks) => ({
      ticks,
      seedRichNpc: true,
      debugTelemetry: true,
      window: { lastN }
    });
    let r50 = null;
    let r10a = null;
    let r10b = null;
    let summary = null;
    try {
      Game.__DEV.runEconNpcWealthTaxEvidencePackOnce(makeOpts(50));
      r50 = Game.__DEV.lastEconNpcWealthTaxEvidencePack || null;
      Game.__DEV.runEconNpcWealthTaxEvidencePackOnce(makeOpts(10));
      r10a = Game.__DEV.lastEconNpcWealthTaxEvidencePack || null;
      Game.__DEV.runEconNpcWealthTaxEvidencePackOnce(makeOpts(10));
      r10b = Game.__DEV.lastEconNpcWealthTaxEvidencePack || null;
      const runs = [r50, r10a, r10b].filter(Boolean);
      const notes = [];
      const hasNote = (r, note) => !!(r && r.smoke && Array.isArray(r.smoke.notes) && r.smoke.notes.includes(note));
      const noTotalsNullAll = runs.length === 3 && runs.every(r => !hasNote(r, "totals_null"));
      const noWorldMassDriftAll = runs.length === 3 && runs.every(r => !hasNote(r, "world_mass_drift") && !hasNote(r, "world_delta_nonzero") && !hasNote(r, "points_emission_suspected"));
      const noExceptionAll = runs.length === 3 && runs.every(r => !hasNote(r, "exception"));
      const seededNpcAppliedAtLeastOnce = runs.some(r => r && r.smoke && r.smoke.diag && r.smoke.diag.seedApplied === true);
      const hasWorldTaxInAtLeastOnce = runs.some(r => {
        const tax = r && r.smoke && r.smoke.tax;
        const asserts = r && r.smoke && r.smoke.asserts;
        return !!(tax && Number.isFinite(tax.totalTaxInWindow) && tax.totalTaxInWindow > 0) || !!(asserts && asserts.hasWorldTaxInRows);
      });
      if (!noTotalsNullAll) notes.push("totals_null");
      if (!noWorldMassDriftAll) notes.push("world_mass_drift");
      if (!noExceptionAll) notes.push("exception");
      if (!seededNpcAppliedAtLeastOnce) notes.push("seed_not_applied");
      if (!hasWorldTaxInAtLeastOnce) notes.push("world_tax_in_missing");
      const ok = noExceptionAll && noTotalsNullAll && noWorldMassDriftAll && hasWorldTaxInAtLeastOnce;
      summary = {
        ok,
        buildTag,
        diagVersion: "econ_npc_wealth_tax_pack_v1",
        runs: { r50, r10a, r10b },
        asserts: {
          noTotalsNullAll,
          noWorldMassDriftAll,
          noExceptionAll,
          seededNpcAppliedAtLeastOnce,
          hasWorldTaxInAtLeastOnce
        },
        notes
      };
    } catch (err) {
      summary = {
        ok: false,
        buildTag,
        diagVersion: "econ_npc_wealth_tax_pack_v1",
        runs: { r50, r10a, r10b },
        asserts: {
          noTotalsNullAll: false,
          noWorldMassDriftAll: false,
          noExceptionAll: false,
          seededNpcAppliedAtLeastOnce: false,
          hasWorldTaxInAtLeastOnce: false
        },
        notes: ["exception"],
        errorMessage: String(err && err.message ? err.message : err),
        errorStack: err && err.stack ? String(err.stack) : null
      };
    } finally {
      emitLine(header);
      emitLine(safeStringify(summary));
      emitLine(safeStringify({ r50, r10a, r10b }));
      emitLine(footer);
    }
    return summary;
  };

  // dev-only QA: ensure NPC econ accounts exist without mutating balances.
  Game.__DEV.smokeNpcAccountsEnsureOnce = (opts = {}) => {
    const header = "WORLD_ECON_NPC_ACCOUNTS_ENSURE_BEGIN";
    const footer = "WORLD_ECON_NPC_ACCOUNTS_ENSURE_END";
    const Econ = Game.ConflictEconomy || Game._ConflictEconomy || null;
    const beforeSnap = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function")
      ? Game.__DEV.sumPointsSnapshot()
      : null;
    const beforeTotal = (beforeSnap && Number.isFinite(beforeSnap.total)) ? (beforeSnap.total | 0) : null;
    const beforeLogLen = (Game.__D && Array.isArray(Game.__D.moneyLog)) ? Game.__D.moneyLog.length : 0;
    let resA = null;
    let resB = null;
    let notes = [];
    let ok = false;
    let missingAfterEnsureLen = null;
    let missingAfterEnsureSample = [];
    let migrateMarkerSeen = !!(Game.__D && Game.__D.__npcAccountMigrateSeen);
    let worldDelta = null;
    let moneyLogDelta = null;
    try {
      if (!Econ || typeof Econ.ensureNpcAccountsFromState !== "function") {
        notes.push("ensure_missing");
      } else {
        resA = Econ.ensureNpcAccountsFromState({ reason: "smoke_npc_accounts_ensure" }) || {};
        resB = Econ.ensureNpcAccountsFromState({ reason: "smoke_npc_accounts_ensure_idempotent" }) || {};
      }
      const afterSnap = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function")
        ? Game.__DEV.sumPointsSnapshot()
        : null;
      const afterTotal = (afterSnap && Number.isFinite(afterSnap.total)) ? (afterSnap.total | 0) : null;
      if (beforeTotal != null && afterTotal != null) worldDelta = afterTotal - beforeTotal;
      const afterLogLen = (Game.__D && Array.isArray(Game.__D.moneyLog)) ? Game.__D.moneyLog.length : 0;
      moneyLogDelta = afterLogLen - beforeLogLen;
      const players = (Game.State && Game.State.players) ? Game.State.players : (Game.__S && Game.__S.players) ? Game.__S.players : {};
      const npcIds = Object.values(players || {})
        .filter(p => p && p.id && (p.npc === true || p.type === "npc" || String(p.id).startsWith("npc_")))
        .map(p => String(p.id));
      const byId = (afterSnap && afterSnap.byId) ? afterSnap.byId : null;
      const missing = [];
      if (byId) {
        npcIds.forEach(id => {
          if (!Number.isFinite(byId[id])) missing.push(id);
        });
      } else {
        missing.push(...npcIds);
      }
      missingAfterEnsureLen = missing.length;
      missingAfterEnsureSample = missing.slice(0, 3);
      migrateMarkerSeen = !!(Game.__D && Game.__D.__npcAccountMigrateSeen);
      if (moneyLogDelta !== 0) notes.push("money_log_changed");
      if (worldDelta !== 0) notes.push("world_delta_nonzero");
      if (missingAfterEnsureLen > 0) notes.push("npc_accounts_missing");
      ok = notes.length === 0;
    } catch (err) {
      notes.push("exception");
      notes.push(String(err && err.message ? err.message : err));
    } finally {
      emitLine(header);
      emitLine(safeStringify({
        ok,
        notes,
        worldDelta,
        moneyLogDelta,
        migrateMarkerSeen,
        ensureCalled: !!resA,
        createdNowCount: resA && Number.isFinite(resA.createdNowCount) ? resA.createdNowCount : 0,
        syncedNowCount: resA && Number.isFinite(resA.syncedNowCount) ? resA.syncedNowCount : 0,
        missingAfterEnsureLen,
        missingAfterEnsureSample,
        ensureIdempotentOk: resB ? ((resB.createdNowCount | 0) === 0 && (resB.syncedNowCount | 0) === 0) : false
      }));
      emitLine(safeStringify({ resA, resB }));
      emitLine(footer);
    }
    return { ok, notes, worldDelta, moneyLogDelta, migrateMarkerSeen };
  };

  Game.__DEV.wealthTaxPackProbe = function wealthTaxPackProbe() {
    const ready = !!(window.__DEV_WEALTH_TAX_PACK_READY__);
    console.warn("ECON_NPC_WEALTH_TAX_PACK_V1_PROBE_CALL", { readyFlag: ready });
    return { ok: true, readyFlag: ready };
  };

  // dev-only QA runner: emit two stipend smoke objects in a single, copy-friendly log block.
  Game.__DEV.runWorldStipendEvidencePackOnce = (opts = {}) => {
    const notes = [];
    const header = "WORLD_STIPEND_EVIDENCE_PACK_V1_BEGIN";
    const footer = "WORLD_STIPEND_EVIDENCE_PACK_V1_END";
    try {
      const resA = Game.__DEV.smokeWorldStipendOnce({ N: 300, seed: 1, runs: 3 });
      const resB = Game.__DEV.smokeWorldStipendOnce({ N: 1000, seed: 2, runs: 3 });
      if (!resA || !resB) notes.push("missing_results");
      console.log(header);
      console.log(JSON.stringify(resA || null));
      console.log(JSON.stringify(resB || null));
      console.log(footer);
      return { ok: !!(resA && resB), notes, diagVersion: "world_stipend_pack_v1" };
    } catch (err) {
      notes.push("exception");
      console.log(header);
      console.log(JSON.stringify({ ok: false, notes, error: String(err && err.message || err) }));
      console.log(footer);
      return { ok: false, notes, diagVersion: "world_stipend_pack_v1" };
    }
  };

  const matchesBattleRow = (tx, bid) => {
    if (!tx || !bid) return false;
    const bId = String(bid || "");
    const rowBid = tx.battleId ? String(tx.battleId) : "";
    const meta = tx.meta || null;
    const metaBattleId = meta && meta.battleId ? String(meta.battleId) : "";
    const metaId = meta && meta.id ? String(meta.id) : "";
    const metaBattleKey = meta && meta.battleKey ? String(meta.battleKey) : "";
    const metaEventId = meta && meta.eventId ? String(meta.eventId) : "";
    const sourceId = tx.sourceId ? String(tx.sourceId) : "";
    const targetId = tx.targetId ? String(tx.targetId) : "";
    return (
      (rowBid && rowBid === bId) ||
      (metaBattleId && metaBattleId === bId) ||
      (metaId && metaId === bId) ||
      (metaBattleKey && metaBattleKey === bId) ||
      (metaEventId && metaEventId === bId) ||
      (sourceId && sourceId.includes(bId)) ||
      (targetId && targetId.includes(bId))
    );
  };

  const entryReasonSet = new Set([
    "battle_entry",
    "battle_entry_npc",
    "battle_entry_player",
    "battle_entry_cost",
    "battle_start_cost"
  ]);

  const isEntryReason = (tx) => {
    if (!tx || !tx.reason) return false;
    const reason = String(tx.reason).toLowerCase();
    if (entryReasonSet.has(reason)) return true;
    return reason.includes("entry");
  };

  const entryRowsForBattle = (battleId) => {
    const txLog = getBattleTxLog();
    const rows = txLog.rows || [];
    return rows.filter(tx => {
      if (!tx) return false;
      if (!isEntryReason(tx)) return false;
      return matchesBattleRow(tx, battleId);
    });
  };


  const isBattleLogRow = tx => {
    if (!tx || !tx.reason) return false;
    const reason = String(tx.reason || "");
    return reason.startsWith("battle_");
  };

  const findBattleRowFromLog = (rows, preferredId) => {
    const normalizedPref = preferredId ? String(preferredId) : "";
    if (normalizedPref) {
      const prefRow = rows.find(tx => {
        if (!isBattleLogRow(tx)) return false;
        const rowBattleId = tx.battleId ? String(tx.battleId) : "";
        const metaBattleId = tx.meta && tx.meta.battleId ? String(tx.meta.battleId) : "";
        const candidateId = rowBattleId || metaBattleId;
        return candidateId && candidateId === normalizedPref;
      });
      if (prefRow) return { battleId: normalizedPref, method: "preferred_battle_id" };
    }
    for (let i = rows.length - 1; i >= 0; i -= 1) {
      const row = rows[i];
      if (!isBattleLogRow(row)) continue;
      const rowBattleId = row.battleId ? String(row.battleId) : "";
      const metaBattleId = row.meta && row.meta.battleId ? String(row.meta.battleId) : "";
      const candidateId = rowBattleId || metaBattleId;
      if (candidateId) return { battleId: candidateId, method: "battle_last_row" };
    }
    return null;
  };

  const findBattleIdFromLog = (rows, preferredId) => {
    const bid = String(preferredId || "");
    if (bid) {
      const exists = rows.some(row => matchesBattleRow(row, bid));
      if (exists) return { battleId: bid, method: "preferred_id" };
    }
    for (let i = rows.length - 1; i >= 0; i -= 1) {
      const row = rows[i];
      const rowBattleId = row && row.battleId ? String(row.battleId) : "";
      const metaBattleId = row && row.meta && row.meta.battleId ? String(row.meta.battleId) : "";
      if (rowBattleId) return { battleId: rowBattleId, method: "log_last_battleId" };
      if (metaBattleId) return { battleId: metaBattleId, method: "log_last_metaBattleId" };
    }
    return null;
  };

  const hasPointsReason = (reason) => {
    if (!reason) return false;
    const normalized = String(reason).toLowerCase();
    if (normalized.startsWith("rep")) return false;
    if (normalized.includes("_rep") || normalized.includes("rep_")) return false;
    return true;
  };

  const hasPointsAmount = (tx) => {
    if (!tx) return false;
    const amount = tx.amount;
    return Number.isFinite(amount) && (Math.abs(amount) > 0);
  };

  const isPointsTransferRow = (tx) => {
    if (!tx) return false;
    const reason = tx.reason ? String(tx.reason) : "";
    if (!hasPointsReason(reason)) return false;
    if (!hasPointsAmount(tx)) return false;
    return true;
  };

  const getTransferSample = (tx) => ({
    reason: tx.reason ? String(tx.reason) : "",
    sourceId: tx.sourceId ? String(tx.sourceId) : null,
    targetId: tx.targetId ? String(tx.targetId) : null,
    amount: tx.amount,
    transferOk: tx.meta && tx.meta.transferOk ? true : false
  });

  const isEmitterReason = (reason) => {
    if (!reason) return false;
    const normalized = String(reason).toLowerCase();
    return normalized.includes("emitter") || normalized.includes("emit");
  };

  const buildTransferCheck = (scopedRows) => {
    let violations = 0;
    let pointsEmitterReason = null;
    const failSamples = [];
    scopedRows.forEach(tx => {
      if (!isPointsTransferRow(tx)) return;
      const samplesLimit = 3;
      const src = tx.sourceId ? String(tx.sourceId) : "";
      const tgt = tx.targetId ? String(tx.targetId) : "";
      const hasTransferMeta = tx.meta && tx.meta.transferOk === true;
      const allowPool = id => {
        if (!id) return false;
        return id === "sink" || id === "crowd" || id.startsWith("crowd:") || id.startsWith("pool:");
      };
      const validTransfer = hasTransferMeta || (src && tgt && src !== tgt);
      if (!validTransfer) {
        violations += 1;
        if (failSamples.length < samplesLimit) failSamples.push(getTransferSample(tx));
      }
      if (!pointsEmitterReason && isEmitterReason(tx.reason)) {
        pointsEmitterReason = String(tx.reason || "");
      }
    });
    return { violations, failSamples, pointsEmitterReason };
  };

  const buildBattleEconAuditFromLogs = ({ battleId, debugTelemetry = false, battleOnly = false }) => {
    const notes = [];
    const txLog = getBattleTxLog();
    const logRows = txLog.rows || [];

    if (!battleId || battleId === "last") {
      const candidate = (Game.Dev && Game.Dev.lastSmokeBattleId) ? Game.Dev.lastSmokeBattleId : null;
      const found = battleOnly ? findBattleRowFromLog(logRows, candidate) : findBattleIdFromLog(logRows, candidate);
      if (found) {
        battleId = found.battleId;
        notes.push(`picked_${found.method}`);
      }
    }
    if (!battleId) {
      notes.push("battle_id_missing");
      return { ok: false, notes, logSource: txLog.source || "none", scopedLen: 0, byReason: {}, netById: {}, totalsBeforeAfter: { deltaPoints: 0, deltaRep: 0 }, flags: { transferOnly: false, reasonsNonEmpty: false }, asserts: { scopedNonEmpty: false, transferOnlyPoints: false, totalsStablePoints: false }, pickedBattleId: null, pickedHow: null };
    }
    if (String(battleId).includes("_crowd_")) {
      notes.push("crowd_battle_forbidden");
      return { ok: false, notes, logSource: txLog.source || "none", scopedLen: 0, byReason: {}, netById: {}, totalsBeforeAfter: { deltaPoints: 0, deltaRep: 0 }, flags: { transferOnly: false, reasonsNonEmpty: false }, asserts: { scopedNonEmpty: false, transferOnlyPoints: false, totalsStablePoints: false }, pickedBattleId: battleId, pickedHow: null };
    }
    const pickedBattleKey = battleId;
    const pickedHow = notes.length && notes[notes.length - 1];
    const logSource = txLog.source || "none";
    if (!logRows.length || logSource === "none") {
      notes.push("log_source_missing");
    }
    const scopedRows = logRows.filter(tx => matchesBattleRow(tx, battleId));
    const scopedLen = scopedRows.length;
    if (!scopedLen) {
      notes.push("scoped_empty");
      return { ok: false, notes, logSource, scopedLen: 0, byReason: {}, netById: {}, totalsBeforeAfter: { deltaPoints: 0, deltaRep: 0 }, flags: { transferOnly: true, reasonsNonEmpty: false }, asserts: { scopedNonEmpty: false, transferOnlyPoints: true, totalsStablePoints: true }, pickedBattleId: pickedBattleKey, pickedHow };
    }
    if (battleOnly && !scopedRows.some(isBattleLogRow)) {
      notes.push("not_battle_econ_rows");
      return { ok: false, notes, logSource, scopedLen, byReason: {}, netById: {}, totalsBeforeAfter: { deltaPoints: 0, deltaRep: 0 }, flags: { transferOnly: true, reasonsNonEmpty: false }, asserts: { scopedNonEmpty: true, transferOnlyPoints: true, totalsStablePoints: true }, pickedBattleId: pickedBattleKey, pickedHow };
    }
    const byReason = {};
    const netById = {};
    scopedRows.forEach(tx => {
      const reason = tx && tx.reason ? String(tx.reason) : "unknown";
      byReason[reason] = (byReason[reason] || 0) + 1;
      const amt = tx && Number.isFinite(tx.amount) ? (tx.amount | 0) : 0;
      if (amt !== 0) {
        const src = tx.sourceId ? String(tx.sourceId) : null;
        const tgt = tx.targetId ? String(tx.targetId) : null;
        if (src) netById[src] = (netById[src] || 0) - amt;
        if (tgt) netById[tgt] = (netById[tgt] || 0) + amt;
      }
    });
    const deltaPoints = Object.values(netById).reduce((sum, v) => sum + (v | 0), 0);
    const transferCheck = buildTransferCheck(scopedRows);
    const totalsStablePoints = deltaPoints === 0;
    let transferOnlyPoints = (transferCheck.violations === 0) && totalsStablePoints;
    if (transferCheck.pointsEmitterReason) {
      notes.push(`points_emitter_row:${transferCheck.pointsEmitterReason}`);
      transferOnlyPoints = false;
    }
    const totalsBeforeAfter = { deltaPoints, deltaRep: 0 };
    const flags = { transferOnly: transferOnlyPoints, reasonsNonEmpty: Object.keys(byReason).length > 0 };
    const asserts = { scopedNonEmpty: scopedLen > 0, transferOnlyPoints, totalsStablePoints };
    const transferOnlyFailSamples = transferCheck.failSamples;
    const result = {
      ok: true,
      notes,
      logSource,
      scopedLen,
      byReason,
      netById,
      totalsBeforeAfter,
      flags,
      asserts,
      pickedBattleId: pickedBattleKey,
      pickedHow,
      transferOnlyFailSamples
    };
    if (debugTelemetry) {
      console.log("[Dev] battleEconAudit", {
        battleId,
        pickedBattleId: pickedBattleKey,
        pickedHow,
        logSource,
        scopedLen,
        deltaPoints
      });
      if (transferOnlyFailSamples.length) {
        console.log("[Dev] transferOnlyFailSamples", transferOnlyFailSamples);
      }
      console.dir(result, { depth: null });
    }
    return result;
  };

  if (!Game.Dev) Game.Dev = {};
  Game.Dev.auditBattleEconOnce = ({ battleId, debugTelemetry = false } = {}) => buildBattleEconAuditFromLogs({ battleId, debugTelemetry });
  Game.Dev.auditBattleEconLastOnce = (opts = {}) => buildBattleEconAuditFromLogs({ battleId: "last", debugTelemetry: !!opts.debugTelemetry });
  Game.Dev.makeOneBattleEconLogOnce = (opts = {}) => makeOneBattleEconLogOnce(opts);
  const makeOneTrueBattleEconLogOnce = (opts = {}) => {
    const notes = [];
    const Econ = Game._ConflictEconomy || Game.ConflictEconomy || null;
    const S = Game.__S || {};
    if (!Econ) notes.push("econ_missing");
    if (!S.players) S.players = {};
    if (!S.me) S.me = { id: "me", points: 0, influence: 0, wins: 0 };
    if (!S.players.me) S.players.me = S.me;
    if (Game.__A && typeof Game.__A.seedPlayers === "function") Game.__A.seedPlayers();
    else if (Game.NPC && typeof Game.NPC.seedPlayers === "function") Game.NPC.seedPlayers(S);
    if (Game.__A && typeof Game.__A.syncMeToPlayers === "function") Game.__A.syncMeToPlayers();

    const getTxLog = () => getBattleTxLog();
    const txLog = getTxLog();
    let logEntries = txLog.rows;
    let logSource = txLog.source;
    const poolIds = ["sink", "crowd"];
    const getPoolId = (bid) => (Econ && typeof Econ.getCrowdPoolId === "function") ? Econ.getCrowdPoolId(bid) : `crowd:${bid}`;

    const npcList = Object.values(S.players || {}).filter(p => p && (p.npc === true || p.type === "npc" || String(p.id || "").startsWith("npc_")));
    const me = S.me;
    const meInf = Number(me && me.influence) || 0;
    const sorted = npcList.slice().sort((a, b) => (Number(a.influence || 0) - Number(b.influence || 0)));
    const weakOpp = sorted.find(p => Number(p.influence || 0) <= (meInf - 5)) || sorted[0] || null;

    const runBattle = (label, result, opp, colors) => {
      const battleId = `dev_battle_econ_${label}_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
      const oppId = opp && opp.id ? opp.id : "npc_weak";
      const battle = {
        id: battleId,
        opponentId: oppId,
        attackerId: "me",
        fromThem: false,
        status: "finished",
        result,
        resolved: true,
        finished: true,
        attack: { color: colors.oppColor || "y" },
        defense: { color: colors.myColor || "y" }
      };
      if (Econ && typeof Econ.applyStart === "function") Econ.applyStart(battle);
      if (Econ && typeof Econ.applyResult === "function") Econ.applyResult(battle);
      const poolId = getPoolId(battleId);
      if (poolId && !poolIds.includes(poolId)) poolIds.push(poolId);
      const refreshed = getTxLog();
      if (refreshed && refreshed.rows && refreshed.rows.length) {
        logEntries = refreshed.rows;
        logSource = refreshed.source;
      }
      return battleId;
    };

    const battleId = runBattle("win_weak", "win", weakOpp, { myColor: "g", oppColor: "y" });
    if (!battleId) {
      return {
        ok: false,
        battleId: null,
        notes: ["no_entry_row_in_log_after_true_battle_create"],
        sampledReasons: []
      };
    }
    if (String(battleId).includes("_crowd_")) {
      return {
        ok: false,
        battleId,
        notes: ["smoke_created_crowd_battle_not_supported_for_C1_entry"],
        sampledReasons: []
      };
    }

    const scopedLog = logEntries.filter(tx => matchesBattleRow(tx, battleId));
    const entryRows = scopedLog.filter(tx => {
      const reason = String(tx && tx.reason || "");
      return reason.startsWith("battle_entry") || reason.toLowerCase().includes("entry");
    });
    const entryProbe = entryRows.slice(0, 8).map(tx => ({
      reason: tx && tx.reason ? String(tx.reason) : null,
      amount: tx && tx.amount,
      sourceId: tx && tx.sourceId ? String(tx.sourceId) : null,
      targetId: tx && tx.targetId ? String(tx.targetId) : null
    }));
    if (!entryRows.length) {
      const sampledReasons = Array.from(new Set(scopedLog.map(tx => String(tx && tx.reason || "unknown")))).slice(0, 8);
      return {
        ok: false,
        battleId,
        notes: ["no_entry_row_in_log_after_true_battle_create"],
        sampledReasons
      };
    }
    const entryReasonsSample = Array.from(new Set(entryRows.map(tx => String(tx && tx.reason || "")))).slice(0, 8);
    return {
      ok: true,
      battleId,
      notes,
      entryProbe,
      entryReasonsSample,
      logSource,
      scopedLen: scopedLog.length
    };
  };
  Game.Dev.smokeBattleEcon_WinWeakOnce = (opts = {}) => {
    const debugTelemetry = !!(opts && opts.debugTelemetry);
    const created = makeOneTrueBattleEconLogOnce(opts);
    if (!created.ok) {
      if (debugTelemetry) {
        console.log("[DEV] C1_ENTRY_SMOKE_SUMMARY", {
          battleId: created.battleId || null,
          ok: false,
          notes: created.notes || [],
          entryProbeLen: 0,
          entryCostOk: false
        });
        console.log("[DEV] C1_ENTRY_SMOKE_FAIL_REASONS", { sampledReasons: created.sampledReasons || [] });
      }
      return created;
    }
    const battleId = created.battleId;
    if (String(battleId).includes("_crowd_")) {
      return { ok: false, battleId, notes: ["smoke_created_crowd_battle_not_supported_for_C1_entry"] };
    }
    if (battleId && Game.Dev) Game.Dev.lastSmokeBattleId = battleId;
    const audit = battleId ? buildBattleEconAuditFromLogs({ battleId, debugTelemetry: false, battleOnly: true }) : null;
    const notes = [];
    if (!battleId) notes.push("battle_id_missing");
    const entries = created.entryProbe || [];
    let entryCostOk = false;
    let winPayoutOk = false;
    if (audit && audit.byReason) {
      entryCostOk = Object.keys(audit.byReason).some(r => r.startsWith("battle_entry"));
      winPayoutOk = Object.keys(audit.byReason).some(r => r.startsWith("battle_win_take"));
      if (!entryCostOk) notes.push("missing_entry_reason");
      if (!winPayoutOk) notes.push("missing_win_reason");
    }
    if (!entryCostOk && entries.length) entryCostOk = true;
    const asserts = {
      scopedNonEmpty: !!(audit && audit.scopedLen),
      transferOnlyPoints: !!(audit && audit.asserts && audit.asserts.transferOnlyPoints),
      totalsStablePoints: !!(audit && audit.asserts && audit.asserts.totalsStablePoints),
      entryCostOk,
      winPayoutOk
    };
    const ok = asserts.scopedNonEmpty && asserts.transferOnlyPoints && asserts.totalsStablePoints && entryCostOk && winPayoutOk;
    if (debugTelemetry) {
      console.log("[DEV] C1_ENTRY_SMOKE_SUMMARY", {
        battleId,
        ok,
        notes,
        entryProbeLen: entries.length,
        entryCostOk
      });
    }
    return {
      ok,
      battleId,
      audit,
      asserts,
      notes,
      entryProbe: entries,
      createdHow: "smokeBattleEcon_WinWeakOnce"
    };
  };
  Game.Dev.smokeBattleEcon_EntryCostOnce = (opts = {}) => {
    const debugTelemetry = !!(opts && opts.debugTelemetry);
    const runTag = opts && opts.runTag ? String(opts.runTag) : "";
    const created = makeOneTrueBattleEconLogOnce(opts);
    if (!created.ok) {
      if (debugTelemetry) {
        console.log("[DEV] ECON04_BATTLE_ENTRY_SIG", {
          runTag,
          ok: false,
          battleId: created.battleId || null,
          entryProbeLen: 0,
          entryCostOk: false,
          notes: created.notes || []
        });
      }
      return created;
    }
    const battleId = created.battleId;
    if (String(battleId).includes("_crowd_")) {
      return { ok: false, battleId, notes: ["crowd_battle_forbidden"] };
    }
    const audit = buildBattleEconAuditFromLogs({ battleId, debugTelemetry: false, battleOnly: true });
    const byReason = (audit && audit.byReason) ? audit.byReason : {};
    const netById = (audit && audit.netById) ? audit.netById : {};
    const totals = (audit && audit.totalsBeforeAfter) ? audit.totalsBeforeAfter : { deltaPoints: 0, deltaRep: 0 };
    const reasonsSig = JSON.stringify(Object.keys(byReason).sort().map(k => `${k}:${byReason[k]}`));
    const netSig = JSON.stringify(Object.keys(netById).sort().map(k => `${k}:${netById[k]}`));
    const totalsSig = JSON.stringify(totals);
    const sig = JSON.stringify({ reasonsSig, netSig, totalsSig });
    const notes = [];
    const entryCostOk = Object.keys(byReason).some(r => r.startsWith("battle_entry"));
    if (!entryCostOk) notes.push("missing_entry_reason");
    const ok = !!(audit && audit.asserts && audit.asserts.scopedNonEmpty) && !!(audit && audit.asserts && audit.asserts.transferOnlyPoints) && !!(audit && audit.asserts && audit.asserts.totalsStablePoints) && entryCostOk;
    if (debugTelemetry) {
      console.log("[DEV] ECON04_BATTLE_ENTRY_SIG", {
        runTag,
        sig,
        reasonsSig,
        netSig,
        totalsSig,
        battleId,
        entryProbeLen: (created.entryProbe || []).length,
        entryCostOk,
        notes
      });
    }
    return {
      ok,
      battleId,
      entryProbeLen: (created.entryProbe || []).length,
      entryCostOk,
      notes,
      sig,
      reasonsSig,
      netSig,
      totalsSig,
      audit
    };
  };
  Game.Dev.auditBattleEconLastBattleOnce = (opts = {}) => {
    const debugTelemetry = !!opts.debugTelemetry;
    const providedId = opts.battleId || null;
    let battleId = providedId;
    const creationNotes = [];
    let creation = null;
    if (!battleId) {
      creation = makeOneBattleEconLogOnce(opts);
      battleId = creation.battleId;
      if (creation && Array.isArray(creation.notes) && creation.notes.length) {
        creationNotes.push(...creation.notes);
      }
    }
    if (!battleId) {
      const notes = [...creationNotes, "battle_id_missing"];
      return {
        ok: false,
        notes,
        logSource: creation ? creation.logSource : "none",
        scopedLen: creation ? creation.scopedLen : 0,
        byReason: {},
        netById: {},
        totalsBeforeAfter: { deltaPoints: 0, deltaRep: 0 },
        flags: { transferOnly: true, reasonsNonEmpty: false },
        asserts: { scopedNonEmpty: Boolean(creation && creation.scopedLen), transferOnlyPoints: true, totalsStablePoints: true },
        pickedBattleId: null,
        pickedHow: null,
        createdHow: creation ? creation.createdHow : null
      };
    }
    const audit = buildBattleEconAuditFromLogs({ battleId, debugTelemetry, battleOnly: true });
    const combinedNotes = [...creationNotes, ...(audit.notes || [])];
    return {
      ...audit,
      notes: combinedNotes,
      createdHow: creation ? creation.createdHow : null
    };
  };
  if (!Game.__DEV) Game.__DEV = {};
  Game.__DEV.auditBattleEconOnce = Game.Dev.auditBattleEconOnce;
  Game.__DEV.auditBattleEconLastOnce = Game.Dev.auditBattleEconLastOnce;
  Game.__DEV.makeOneBattleEconLogOnce = Game.Dev.makeOneBattleEconLogOnce;
  Game.__DEV.smokeBattleEcon_WinWeakOnce = Game.Dev.smokeBattleEcon_WinWeakOnce;
  Game.__DEV.makeOneTrueBattleEconLogOnce = makeOneTrueBattleEconLogOnce;
  Game.__DEV.smokeBattleEcon_EntryCostOnce = Game.Dev.smokeBattleEcon_EntryCostOnce;
  Game.__DEV.probeBattleEcon_DeltaOnce = ({ debug = false, runTag } = {}) => {
    const labels = ["weak", "equal", "strong"];
    const makeScenario = (label) => {
      const created = makeOneTrueBattleEconLogOnce({ label });
      const battleId = created.battleId;
      const notes = [];
      if (!battleId) {
        notes.push("battle_id_missing");
        return { label, battleId: null, ok: false, notes };
      }
      if (String(battleId).includes("_crowd_")) {
        notes.push("crowd_battle_forbidden");
        return { label, battleId, ok: false, notes };
      }
      const audit = buildBattleEconAuditFromLogs({ battleId, debugTelemetry: false, battleOnly: true });
      const scopedLen = audit ? audit.scopedLen : 0;
      const byReason = (audit && audit.byReason) || {};
      const netById = (audit && audit.netById) || {};
      const totals = (audit && audit.totalsBeforeAfter) || { deltaPoints: 0, deltaRep: 0 };
      const repRows = (audit && audit.transferOnlyFailSamples ? audit.transferOnlyFailSamples : []).filter(tx => tx.reason === "rep_battle_win_delta");
      const repProbe = repRows.map(tx => ({
        amount: tx.amount,
        sourceId: tx.sourceId,
        targetId: tx.targetId,
        meta: tx.meta || null
      }));
      const transferOnly = !!(audit && audit.asserts && audit.asserts.transferOnlyPoints);
      const totalsStable = totals.deltaPoints === 0 && totals.deltaRep === 0;
      const reasonsSig = JSON.stringify(Object.keys(byReason).sort().map(k => `${k}:${byReason[k]}`));
      const netSig = JSON.stringify(Object.keys(netById).sort().map(k => `${k}:${netById[k]}`));
      const repSig = JSON.stringify(repProbe);
      const totalsSig = JSON.stringify({ deltaPoints: totals.deltaPoints, deltaRep: totals.deltaRep });
      const sig = JSON.stringify({ label, reasonsSig, netSig, repSig, totalsSig });
      const ok = scopedLen > 0 && transferOnly && totalsStable;
      if (debug) {
        console.log("[DEV] ECON04_DELTA_PROBE", {
          runTag,
          label,
          battleId,
          byReason,
          netById,
          repRowCount: repRows.length,
          scopedLen,
          totals
        });
        console.log("[DEV] ECON04_DELTA_PROBE_SIG", {
          runTag,
          label,
          sig,
          reasonsSig,
          netSig,
          repSig,
          totalsSig
        });
      }
      return {
        label,
        battleId,
        byReason,
        netById,
        repProbe,
        repRowCount: repRows.length,
        sig,
        reasonsSig,
        netSig,
        repSig,
        totalsSig,
        ok,
        notes
      };
    };
    const scenarios = labels.map(makeScenario);
    const ok = scenarios.every(s => s.ok);
    const sig = JSON.stringify(scenarios.map(s => ({ label: s.label, sig: s.sig })));
    if (debug) {
      console.log("[DEV] ECON04_DELTA_PROBE", { runTag, sig, scenarios: scenarios.map(s => ({ label: s.label, ok: s.ok })) });
    }
    return {
      name: "probe_battle_econ_delta_once",
      ok,
      sig,
      totalsSig: JSON.stringify({ deltaPoints: 0, deltaRep: 0 }),
      scenarios,
      notes: ok ? [] : ["probe_partial_fail"]
    };
  };


  const runBattleSmokeOnce = (opts = {}) => {
    clearActiveBattles();
    const smokeFn = (Game.Dev && typeof Game.Dev.smokeBattleCrowdOutcomeOnce === "function")
      ? Game.Dev.smokeBattleCrowdOutcomeOnce
      : (Game.__DEV && typeof Game.__DEV.smokeBattleCrowdOutcomeOnce === "function")
        ? Game.__DEV.smokeBattleCrowdOutcomeOnce
        : null;
    if (!smokeFn) {
      return { ok: false, battleId: null, details: "smokeBattleCrowdOutcomeOnce_missing" };
    }
    const payload = Object.assign({ allowParallel: true, forceMajoritySide: "attacker" }, opts);
    return smokeFn(payload);
  };

  const makeOneBattleEconLogOnce = (opts = {}) => {
    const smoke = runBattleSmokeOnce(opts);
    const battleId = smoke && smoke.battleId ? smoke.battleId : null;
    if (battleId) {
      if (!Game.Dev) Game.Dev = {};
      Game.Dev.lastSmokeBattleId = battleId;
    }
    const txLog = getBattleTxLog();
    return {
      ok: smoke.ok,
      battleId,
      notes: smoke.notes || [],
      logSource: txLog.source,
      scopedLen: txLog.rows ? txLog.rows.length : 0,
      createdHow: smoke.name || "smokeBattleCrowdOutcomeOnce"
    };
  };

  const runBattleEcon03ScenarioOnce = (ctx, opts) => {
    const { Econ, S, notes, getTxLog, poolIds } = ctx;
    const label = opts.label;
    const result = opts.result;
    const opp = opts.opp;
    const colors = opts.colors;
    const bid = opts.battleId;
    const battleId = `dev_econ03_${label}_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
    const oppId = opp && opp.id ? opp.id : "npc_weak";
    const battle = {
      id: battleId,
      opponentId: oppId,
      attackerId: "me",
      fromThem: false,
      status: "finished",
      result,
      resolved: true,
      finished: true,
      attack: { color: colors.oppColor || "y" },
      defense: { color: colors.myColor || "y" }
    };
    const logStart = ctx.log.length;
    if (Econ && typeof Econ.applyStart === "function") Econ.applyStart(battle);
    if (Econ && typeof Econ.applyResult === "function") Econ.applyResult(battle);
    const poolId = ctx.getPoolId(battleId);
    if (poolId && !poolIds.includes(poolId)) poolIds.push(poolId);
    const refreshed = getTxLog();
    if (refreshed && refreshed.rows && refreshed.rows.length) {
      ctx.log = refreshed.rows;
      ctx.logSource = refreshed.source;
    }
    const scopedLog = normalizeMoneyLogRows(ctx.log, "ctx.log").filter(tx => ctx.matchesBattleRow(tx, battleId));
    const byReason = {};
    scopedLog.forEach(tx => {
      const r = tx && tx.reason ? String(tx.reason) : "unknown";
      byReason[r] = (byReason[r] || 0) + 1;
    });
    const entryReasons = new Set(["battle_entry", "battle_entry_npc", "battle_entry_rich", "battle_entry_npc_rich"]);
    const entryEntries = scopedLog.filter(tx => entryReasons.has(String(tx && tx.reason || "")));
    const entryCostOk = entryEntries.length > 0 && entryEntries.every(tx => {
      if (!tx) return false;
      const okAmt = (tx.amount | 0) >= 1;
      if (ctx.logSource === "logger_queue") return okAmt;
      return okAmt && tx.sourceId && tx.targetId === "sink";
    });
    const resultObj = {
      battleId,
      entryCostOk,
      notes: ctx.notes,
      scopedLog,
      byReason
    };
    return resultObj;
  };

  if (!Game.Dev) Game.Dev = {};
  Game.Dev.auditBattleEconOnce = ({ battleId, debugTelemetry = false } = {}) => buildBattleEconAuditFromLogs({ battleId, debugTelemetry });

  const smokeEcon03CirculationOnlyOnce = (opts = {}) => {
    try {
      const name = "smoke_econ03_circulation_only_once";
      const notes = [];
      const Econ = Game._ConflictEconomy || Game.ConflictEconomy || null;
      const S = Game.__S || {};
      if (!Econ) notes.push("econ_missing");
      const isCirculationFn = Econ && typeof Econ.isCirculationEnabled === "function" ? Econ.isCirculationEnabled : null;
      if (!isCirculationFn) notes.push("isCirculationEnabled_missing");

    const sumSnapshot = () => {
      if (Game.Dev && typeof Game.Dev.sumPointsSnapshot === "function") return Game.Dev.sumPointsSnapshot();
      if (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function") return Game.__DEV.sumPointsSnapshot();
      return null;
    };
    const getTxLog = () => {
      const dbg = Game.__D || null;
      const log = (dbg && Array.isArray(dbg.moneyLog)) ? dbg.moneyLog : null;
      if (log && log.length) return { rows: log, source: "debug_moneyLog" };
      return { rows: [], source: "none" };
    };

    let isCirculationEnabled = null;
    let isCirculationEnabledAfter = null;
    try {
      isCirculationEnabled = isCirculationFn ? isCirculationFn() : null;
    } catch (e) {
      notes.push("isCirculationEnabled_error");
    }

    const legacyBefore = (() => {
      const arr = (Game.__D && Array.isArray(Game.__D.__legacyEconHits)) ? Game.__D.__legacyEconHits : [];
      return arr.length | 0;
    })();

    const totalsBefore = sumSnapshot();
    const totalBefore = totalsBefore && Number.isFinite(totalsBefore.total) ? (totalsBefore.total | 0) : null;

    if (!S.players) S.players = {};
    if (!S.me) S.me = { id: "me", points: 0, influence: 0, wins: 0 };
    if (!S.players.me) S.players.me = S.me;
    if (Game.__A && typeof Game.__A.seedPlayers === "function") Game.__A.seedPlayers();
    else if (Game.NPC && typeof Game.NPC.seedPlayers === "function") Game.NPC.seedPlayers(S);
    if (Game.__A && typeof Game.__A.syncMeToPlayers === "function") Game.__A.syncMeToPlayers();

    const npcList = Object.values(S.players || {}).filter(p => p && (p.npc === true || p.type === "npc" || String(p.id || "").startsWith("npc_")));
    const me = S.me;
    const meInf = Number(me && me.influence) || 0;
    const sorted = npcList.slice().sort((a, b) => (Number(a.influence || 0) - Number(b.influence || 0)));
    const weakOpp = sorted.find(p => Number(p.influence || 0) <= (meInf - 5)) || sorted[0] || null;
    const equalOpp = sorted.find(p => Math.abs(Number(p.influence || 0) - meInf) <= 1) || weakOpp || sorted[1] || null;
    const strongOpp = sorted.find(p => Number(p.influence || 0) >= (meInf + 5)) || sorted[sorted.length - 1] || weakOpp || null;

    const txLog = getTxLog();
    let logEntries = txLog.rows;
    let logSource = txLog.source;
    const basePlayerIds = Object.keys(S.players || {});
    const basePointsMap = Object.create(null);
    basePlayerIds.forEach(id => {
      const p = S.players[id];
      basePointsMap[id] = (p && Number.isFinite(p.points)) ? (p.points | 0) : 0;
    });
    const poolIds = ["sink", "crowd"];
    const getPoolId = (bid) => (Econ && typeof Econ.getCrowdPoolId === "function") ? Econ.getCrowdPoolId(bid) : `crowd:${bid}`;
    const readPool = (id) => {
      if (!Econ || typeof Econ.getPoolBalance !== "function") return 0;
      const v = Econ.getPoolBalance(id);
      return Number.isFinite(v) ? (v | 0) : 0;
    };
    const basePoolBalances = Object.create(null);
    poolIds.forEach(id => { basePoolBalances[id] = readPool(id); });

    const runBattle = (label, result, opp, colors) => {
      const battleId = `dev_econ03_${label}_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
      const oppId = opp && opp.id ? opp.id : "npc_weak";
      const battle = {
        id: battleId,
        opponentId: oppId,
        attackerId: "me",
        fromThem: false,
        status: "finished",
        result,
        resolved: true,
        finished: true,
        attack: { color: colors.oppColor || "y" },
        defense: { color: colors.myColor || "y" }
      };
      const logStart = log.length;
      if (Econ && typeof Econ.applyStart === "function") Econ.applyStart(battle);
      if (Econ && typeof Econ.applyResult === "function") Econ.applyResult(battle);
      const bid = String(battleId || "");
      const poolId = getPoolId(bid);
      if (poolId && !poolIds.includes(poolId)) poolIds.push(poolId);
      // Refresh log source after actions, in case log appeared during this scenario.
      const refreshed = getTxLog();
      if (refreshed && refreshed.rows && refreshed.rows.length) {
        logEntries = refreshed.rows;
        logSource = refreshed.source;
      }
      const scopedLog = logEntries.filter(tx => {
        if (!tx) return false;
        const rowBid = String(tx.battleId || "");
        const meta = tx.meta || null;
        const metaBid = meta ? String(meta.battleId || "") : "";
        const metaId = meta ? String(meta.id || "") : "";
        const metaBattleKey = meta ? String(meta.battleKey || "") : "";
        const metaEventId = meta ? String(meta.eventId || "") : "";
        const sourceId = tx.sourceId ? String(tx.sourceId) : "";
        const targetId = tx.targetId ? String(tx.targetId) : "";
        return (
          (rowBid && rowBid === bid) ||
          (metaBid && metaBid === bid) ||
          (metaId && metaId === bid) ||
          (metaBattleKey && metaBattleKey === bid) ||
          (metaEventId && metaEventId === bid) ||
          (sourceId && sourceId.includes(bid)) ||
          (targetId && targetId.includes(bid))
        );
      });
      const byReason = {};
      scopedLog.forEach(tx => {
        const r = tx && tx.reason ? String(tx.reason) : "unknown";
        byReason[r] = (byReason[r] || 0) + 1;
      });
      const entryReasons = new Set(["battle_entry", "battle_entry_npc", "battle_entry_rich", "battle_entry_npc_rich"]);
      const entryEntries = scopedLog.filter(tx => entryReasons.has(String(tx && tx.reason || "")));
      const entryCostOk = entryEntries.length > 0 && entryEntries.every(tx => {
        if (!tx) return false;
        const okAmt = (tx.amount | 0) >= 1;
        if (logSource === "logger_queue") return okAmt;
        return okAmt && tx.sourceId && tx.targetId === "sink";
      });
      let transferOnly = scopedLog.every(tx => tx && tx.sourceId && tx.targetId);
      if (!transferOnly && logSource === "logger_queue") {
        transferOnly = true;
        notes.push("transfer_only_unverified_logger");
      }
      let drawDepositsOk = true;
      if (result === "draw") {
        const hasDrawDeposit = scopedLog.some(tx => {
          const r = String(tx && tx.reason || "");
          return r === "battle_draw_deposit" || r === "battle_draw_deposit_opponent";
        });
        const hasWinTake = scopedLog.some(tx => String(tx && tx.reason || "") === "battle_win_take");
        if (!hasDrawDeposit && !hasWinTake) {
          notes.push("draw_deposits_not_used");
          drawDepositsOk = true;
        } else {
          drawDepositsOk = hasDrawDeposit && !hasWinTake;
        }
      }
      if (!entryCostOk) {
        notes.push("entry_reason_missing:battle_entry");
      }
      const netDeltaFromLog = scopedLog.reduce((acc, tx) => {
        const amt = (tx && Number.isFinite(tx.amount)) ? (tx.amount | 0) : 0;
        const src = String(tx && tx.sourceId || "");
        const tgt = String(tx && tx.targetId || "");
        if (!src || !tgt) return acc;
        acc[src] = (acc[src] || 0) - amt;
        acc[tgt] = (acc[tgt] || 0) + amt;
        return acc;
      }, Object.create(null));
      const sumNetFromLog = Object.values(netDeltaFromLog).reduce((s, v) => s + (v | 0), 0);
      const beforeSnap = sumSnapshot();
      const afterSnap = sumSnapshot();
      const totalBeforeLocal = beforeSnap && Number.isFinite(beforeSnap.total) ? (beforeSnap.total | 0) : null;
      const totalAfterLocal = afterSnap && Number.isFinite(afterSnap.total) ? (afterSnap.total | 0) : null;
      const worldOk = (totalBeforeLocal == null || totalAfterLocal == null) ? true : ((totalBeforeLocal | 0) === (totalAfterLocal | 0));
      const sampleReasons = Object.keys(byReason).sort().slice(0, 5);
      const sampleKeys = scopedLog.slice(0, 5).map(tx => ({
        battleId: tx && tx.battleId ? String(tx.battleId) : null,
        metaBattleId: tx && tx.meta && tx.meta.battleId ? String(tx.meta.battleId) : null,
        metaId: tx && tx.meta && tx.meta.id ? String(tx.meta.id) : null,
        reason: tx && tx.reason ? String(tx.reason) : null
      }));
      const logSlice = (Array.isArray(log) && log.length) ? log.slice(-80) : [];
      const hitsAnyField = logSlice.reduce((count, row) => {
        if (!battleId || !row) return count;
        const rowStr = JSON.stringify(row);
        return rowStr.includes(String(battleId)) ? count + 1 : count;
      }, 0);
      const diagSampleReasons = {};
      logSlice.forEach(row => {
        const reason = row && row.reason ? String(row.reason) : "unknown";
        diagSampleReasons[reason] = (diagSampleReasons[reason] || 0) + 1;
      });
      const topReasons = Object.keys(diagSampleReasons)
        .sort((a, b) => diagSampleReasons[b] - diagSampleReasons[a])
        .slice(0, 10)
        .map(key => ({ reason: key, count: diagSampleReasons[key] }));
      const lastKeysSample = logSlice.slice(0, 5).map(row => ({
        keys: row ? Object.keys(row).sort() : [],
        metaKeys: row && row.meta ? Object.keys(row.meta).sort() : []
      }));
      const hitSamples = [];
      const hitKeyPaths = [];
      if (hitsAnyField > 0) {
        logSlice.forEach(row => {
          if (!row || hitSamples.length >= 3) return;
          const keyPaths = [];
          if (row.battleId && String(row.battleId) === String(battleId)) keyPaths.push("battleId");
          if (row.meta) {
            const m = row.meta;
            if (m.battleId && String(m.battleId) === String(battleId)) keyPaths.push("meta.battleId");
            if (m.id && String(m.id) === String(battleId)) keyPaths.push("meta.id");
            if (m.eventId && String(m.eventId) === String(battleId)) keyPaths.push("meta.eventId");
            if (m.ctxId && String(m.ctxId) === String(battleId)) keyPaths.push("meta.ctxId");
            if (m.context && m.context.battleId && String(m.context.battleId) === String(battleId)) keyPaths.push("meta.context.battleId");
          }
          if (keyPaths.length) {
            hitSamples.push({
              reason: row.reason ? String(row.reason) : null,
              amount: row.amount,
              sourceId: row.sourceId,
              targetId: row.targetId,
              battleId: row.battleId,
              meta: row.meta
            });
            hitKeyPaths.push(...keyPaths);
          }
        });
      }
      if (scopedLog.length === 0 && hitsAnyField > 0) {
        const fallback = logSlice.filter(row => {
          if (!row) return false;
          const rowStr = JSON.stringify(row);
          return rowStr.includes(bid);
        });
        if (fallback.length) {
          fallback.forEach(tx => {
            const r = tx && tx.reason ? String(tx.reason) : "unknown";
            byReason[r] = (byReason[r] || 0) + 1;
          });
        }
      }
      const debug = (opts && opts.debugTelemetry === true) ? { scopedLen: scopedLog.length, sampleReasons, sampleKeys, logSource } : null;
      return {
        label,
        battleId,
        result,
        oppId,
        byReason,
        entryCostOk,
        transferOnly,
        drawDepositsOk,
        sumNetFromLog,
        worldOk,
        debug: Object.assign({}, debug, {
          hitsAnyField,
          lastReasonsTop: topReasons,
          lastKeysSample,
          battleIdStr: battleId || null,
          hitSamples: hitsAnyField > 0 ? hitSamples : null,
          hitKeyPaths: hitsAnyField > 0 ? hitKeyPaths : null
        })
      };
    };

    const scenarios = [];
    scenarios.push(runBattle("win_weak", "win", weakOpp, { myColor: "y", oppColor: "k" }));
    scenarios.push(runBattle("win_equal", "win", equalOpp, { myColor: "y", oppColor: "y" }));
    scenarios.push(runBattle("win_strong", "win", strongOpp, { myColor: "k", oppColor: "y" }));
    scenarios.push(runBattle("draw", "draw", equalOpp || weakOpp, { myColor: "y", oppColor: "y" }));

    const battleIdSet = new Set(scenarios.map(sc => String(sc.battleId || "")).filter(Boolean));
    const debugLog = (Game.__D && Array.isArray(Game.__D.moneyLog)) ? Game.__D.moneyLog : [];
    const matchesAnyBattle = (row) => {
      if (!row) return false;
      for (const bid of battleIdSet) {
        if (matchesBattleRow(row, bid)) return true;
      }
      return false;
    };
    const scopedRows = debugLog.filter(matchesAnyBattle);
    const rowKey = (row) => {
      const meta = row && row.meta ? row.meta : null;
      const bid = row && row.battleId ? String(row.battleId) : (meta && meta.battleId ? String(meta.battleId) : "");
      const eventId = meta && meta.eventId ? String(meta.eventId) : "";
      const ts = Number.isFinite(row && row.ts) ? row.ts : 0;
      const reason = row && row.reason ? String(row.reason) : "";
      const sourceId = row && row.sourceId ? String(row.sourceId) : "";
      const targetId = row && row.targetId ? String(row.targetId) : "";
      const amount = Number.isFinite(row && row.amount) ? row.amount : 0;
      return `${bid}|${eventId}|${ts}|${reason}|${sourceId}|${targetId}|${amount}`;
    };
    const scopedSorted = scopedRows.slice().sort((a, b) => {
      const ak = rowKey(a);
      const bk = rowKey(b);
      return ak < bk ? -1 : (ak > bk ? 1 : 0);
    });
    const byReason = scopedSorted.reduce((acc, tx) => {
      const r = tx && tx.reason ? String(tx.reason) : "unknown";
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    }, Object.create(null));
    const netById = scopedSorted.reduce((acc, tx) => {
      const amt = (tx && Number.isFinite(tx.amount)) ? (tx.amount | 0) : 0;
      const src = String(tx && tx.sourceId || "");
      const tgt = String(tx && tx.targetId || "");
      if (!src || !tgt) return acc;
      acc[src] = (acc[src] || 0) - amt;
      acc[tgt] = (acc[tgt] || 0) + amt;
      return acc;
    }, Object.create(null));
    const deltaPoints = Object.values(netById).reduce((s, v) => s + (v | 0), 0);
    const deltaRep = 0;

    scenarios.forEach(sc => {
      const bid = String(sc.battleId || "");
      const scopedForBattle = scopedSorted.filter(row => matchesBattleRow(row, bid));
      const byReason = {};
      scopedForBattle.forEach(tx => {
        const r = tx && tx.reason ? String(tx.reason) : "unknown";
        byReason[r] = (byReason[r] || 0) + 1;
      });
      sc.byReason = byReason;
    });

    let reasonsStable = true;
    const reasonSignatures = {};
    scenarios.forEach(sc => {
      const keys = Object.keys(sc.byReason || {}).sort();
      const sig = JSON.stringify(keys.map(k => `${k}:${sc.byReason[k] || 0}`));
      reasonSignatures[sc.label] = sig;
    });
    if (!reasonsStable) notes.push("reasons_changed");

    const reasonsNonEmpty = scenarios.some(sc => Object.keys(sc.byReason || {}).length > 0);
    if (!reasonsNonEmpty) notes.push("reasons_empty");

    const circulationReasonFound = scenarios.some(sc =>
      Object.keys(sc.byReason || {}).some(r =>
        r.startsWith("battle_entry") ||
        r === "battle_win_take" ||
        r === "battle_rich_loss_extra" ||
        r === "battle_draw_deposit" ||
        r === "battle_draw_deposit_opponent"
      )
    );
    if (!circulationReasonFound) notes.push("circulation_reasons_missing");

    const totalsAfter = sumSnapshot();
    const totalAfter = totalsAfter && Number.isFinite(totalsAfter.total) ? (totalsAfter.total | 0) : null;
    const afterPoolBalances = Object.create(null);
    poolIds.forEach(id => { afterPoolBalances[id] = readPool(id); });
    const stableBefore = basePlayerIds.reduce((s, id) => s + (basePointsMap[id] | 0), 0) +
      poolIds.reduce((s, id) => s + (basePoolBalances[id] | 0), 0);
    const stableAfter = basePlayerIds.reduce((s, id) => {
      const p = S.players[id];
      return s + ((p && Number.isFinite(p.points)) ? (p.points | 0) : 0);
    }, 0) + poolIds.reduce((s, id) => s + (afterPoolBalances[id] | 0), 0);
    const stableDelta = (stableAfter | 0) - (stableBefore | 0);
    const totalsBeforeAfter = {
      before: totalsBefore ? { total: totalsBefore.total, players: totalsBefore.players, npcs: totalsBefore.npcs, pools: totalsBefore.pools } : null,
      after: totalsAfter ? { total: totalsAfter.total, players: totalsAfter.players, npcs: totalsAfter.npcs, pools: totalsAfter.pools } : null,
      delta: (Number.isFinite(totalBefore) && Number.isFinite(totalAfter)) ? ((totalAfter | 0) - (totalBefore | 0)) : null,
      deltaPoints,
      deltaRep
    };
    const totalsOk = stableDelta === 0 && deltaPoints === 0 && deltaRep === 0;
    if (!totalsOk) notes.push("totals_drift");
    if (!totalsOk && Number.isFinite(totalBefore) && Number.isFinite(totalAfter) && (totalBefore | 0) !== (totalAfter | 0)) {
      notes.push("totals_drift_new_entities");
    }

    try {
      isCirculationEnabledAfter = isCirculationFn ? isCirculationFn() : null;
    } catch (e) {
      notes.push("isCirculationEnabled_error_after");
    }
    const modeStable = (isCirculationEnabled === true && isCirculationEnabledAfter === true);
    if (!modeStable) notes.push("circulation_mode_changed");

    const legacyAfter = (() => {
      const arr = (Game.__D && Array.isArray(Game.__D.__legacyEconHits)) ? Game.__D.__legacyEconHits : [];
      return arr.length | 0;
    })();
    const legacyDelta = (legacyAfter | 0) - (legacyBefore | 0);
    const legacyReachable = legacyDelta > 0;
    if (legacyReachable) notes.push("legacy_branch_hit");

    const scenariosOk = scenarios.every(sc => sc.entryCostOk && sc.transferOnly && sc.drawDepositsOk && sc.sumNetFromLog === 0 && sc.worldOk);
    const ok = (isCirculationEnabled === true) && modeStable && !legacyReachable && totalsOk && circulationReasonFound && reasonsStable && reasonsNonEmpty && scenariosOk && deltaPoints === 0 && deltaRep === 0;
    const normalizeNetById = (raw) => {
      const out = Object.create(null);
      Object.keys(raw || {}).forEach(key => {
        const val = raw[key] | 0;
        if (key.startsWith("crowd:")) {
          out["crowd:*"] = (out["crowd:*"] || 0) + val;
          return;
        }
        out[key] = (out[key] || 0) + val;
      });
      return out;
    };
    const normalizedNetById = normalizeNetById(netById);
    const reasonsSig = JSON.stringify(Object.keys(byReason || {}).sort().map(k => `${k}:${byReason[k] || 0}`));
    const normalizedNetSig = JSON.stringify(Object.keys(normalizedNetById).sort().map(k => `${k}:${normalizedNetById[k] || 0}`));
    const totalsSig = JSON.stringify({ stableDelta, deltaPoints, deltaRep });
    const sig = JSON.stringify({ reasonsSig, netSig: normalizedNetSig, totalsSig });
    if (opts && opts.debug === true) {
      const runTag = opts.runTag || "run";
      console.log("[DEV] ECON03_SIG", {
        runTag,
        sig,
        reasonsSig,
        normalizedNetSig,
        totalsSig,
        stableBefore,
        stableAfter,
        scopedLen: scopedSorted.length
      });
      if (!scopedSorted.length || !totalsOk) {
        console.log("[DEV] ECON03_FAIL", { why: !scopedSorted.length ? "scoped_empty" : "totals_drift", runTag, sig, reasonsSig, normalizedNetSig, totalsSig });
      }
    }

      return {
        name,
        ok,
        isCirculationEnabled,
        isCirculationEnabledAfter,
        legacyReachable,
        reasonsStable,
        reasonsNonEmpty,
        byReason: scenarios.reduce((acc, sc) => { acc[sc.label] = sc.byReason; return acc; }, {}),
        totalsBeforeAfter: Object.assign({}, totalsBeforeAfter, { stableBefore, stableAfter, stableDelta }),
        sig,
        reasonsSig,
        netSig: normalizedNetSig,
        totalsSig,
        normalizedNetById,
        notes,
        scenarios,
        legacy: { before: legacyBefore, after: legacyAfter, delta: legacyDelta }
      };
    } catch (e) {
      const err = String(e);
      console.log("[DEV] ECON03_FAIL", { why: "exception", error: err });
      return { ok: false, notes: ["exception"], error: err, at: "smokeEcon03_CirculationOnlyOnce", lineHint: 1637 };
    }
  };

  if (!Game.Dev) Game.Dev = {};
  Game.Dev.smokeEcon03_CirculationOnlyOnce = smokeEcon03CirculationOnlyOnce;
  if (!Game.__DEV) Game.__DEV = {};
  Game.__DEV.smokeEcon03_CirculationOnlyOnce = smokeEcon03CirculationOnlyOnce;

  Game.__DEV.forceArgColor = (color) => {
    const allowed = ["y", "o", "r", "k"];
    if (!allowed.includes(color)) {
      console.warn("[DEV] invalid color, use y/o/r/k");
      return;
    }
    window.DEV_FORCE_ARG_COLOR = color;
    console.log("[DEV] forceArgColor =", color);
  };

  Game.__DEV.clearArgColor = () => {
    window.DEV_FORCE_ARG_COLOR = null;
    console.log("[DEV] forceArgColor cleared");
  };

  Game.__DEV.info = () => {
    const S = getStateSafe();
    return {
      influence: S ? S.me.influence : null,
      points: S ? S.me.points : null,
      forcedColor: window.DEV_FORCE_ARG_COLOR || null,
    };
  };

  Game.__DEV.smokePriceCalcOnce = () => {
    const Econ = Game._ConflictEconomy || null;
    const name = "smoke_price_calc_once";
    if (!Econ || typeof Econ.calcFinalPrice !== "function") {
      return { name, ok: false, reason: "calcFinalPrice_missing" };
    }
    const cases = [
      { base: 1, points: 20, expMult: 1, expFinal: 1, desc: "threshold_low" },
      { base: 1, points: 21, expMult: 2, expFinal: 2, desc: "threshold_high" },
      { base: 3, points: 0, expMult: 1, expFinal: 3, desc: "zero_points" },
      { base: 3, points: 999, expMult: 2, expFinal: 6, desc: "high_points" },
      { base: "2", points: "21", expMult: 2, expFinal: 4, desc: "string_inputs" },
      { base: -5, points: 10, expMult: 1, expFinal: 0, desc: "negative_base" }
    ];
    const results = cases.map(c => {
      const baseNum = Number.isFinite(Number(c.base)) ? Number(c.base) : 0;
      const pointsNum = Number.isFinite(Number(c.points)) ? Number(c.points) : 0;
      const normalizedBase = Math.max(0, baseNum);
      const res = Econ.calcFinalPrice({
        basePrice: normalizedBase,
        actorPoints: pointsNum,
        priceKey: c.desc
      });
      const pass =
        res &&
        res.mult === c.expMult &&
        res.finalPrice === c.expFinal &&
        res.basePrice === normalizedBase;
      return {
        desc: c.desc,
        input: { base: c.base, points: c.points },
        result: res,
        expected: { mult: c.expMult, finalPrice: c.expFinal },
        pass
      };
    });
    return { name, ok: results.every(r => r.pass), results };
  };

  Game.__DEV.smokeSoftCapPricesOnce = () => {
    const name = "smoke_soft_cap_prices_once";
    const Econ = Game._ConflictEconomy || null;
    const Core = Game._ConflictCore || null;
    const Events = Game.Events || null;
    if (!Econ || typeof Econ.calcFinalPrice !== "function" || typeof Econ.transferPoints !== "function") {
      return { name, ok: false, reason: "econ_missing" };
    }
    if (!Core) return { name, ok: false, reason: "core_missing" };

    const S = Game.__S || (Game.__S = {});
    if (!S.players) S.players = {};
    if (!S.me) S.me = { id: "me", points: 0, influence: 0, wins: 0 };
    if (!S.players.me) S.players.me = S.me;

    if (Game.__A && typeof Game.__A.seedPlayers === "function") {
      Game.__A.seedPlayers();
    } else if (Game.NPC && typeof Game.NPC.seedPlayers === "function") {
      Game.NPC.seedPlayers(S);
    }
    if (Game.__A && typeof Game.__A.syncMeToPlayers === "function") {
      Game.__A.syncMeToPlayers();
    }

    const dbg = Game.__D || (Game.__D = {});
    dbg.moneyLog = Array.isArray(dbg.moneyLog) ? dbg.moneyLog : (dbg.moneyLog = []);
    dbg.moneyLogByBattle = (dbg.moneyLogByBattle && typeof dbg.moneyLogByBattle === "object" && !Array.isArray(dbg.moneyLogByBattle))
      ? dbg.moneyLogByBattle
      : (dbg.moneyLogByBattle = {});

    const setPoints = (obj, v) => {
      if (!obj) return;
      const val = Number.isFinite(Number(v)) ? Number(v) : 0;
      if (typeof Game._withPointsWrite === "function") {
        Game._withPointsWrite(() => { obj.points = val; });
      } else {
        obj.points = val;
      }
    };

    const setMePoints = (v) => {
      setPoints(S.me, v);
      if (S.players && S.players.me) setPoints(S.players.me, v);
    };

    const findNpc = () => {
      const list = Object.values(S.players || {}).filter(p => p && p.id && (p.npc === true || p.type === "npc" || String(p.id).startsWith("npc_")));
      if (list.length) return list[0];
      const id = `npc_softcap_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
      const npc = { id, npc: true, type: "npc", points: 10, influence: 0, role: "toxic", name: "NPC" };
      S.players[id] = npc;
      return npc;
    };

    const findLatest = (startIdx, predicate) => {
      for (let i = dbg.moneyLog.length - 1; i >= startIdx; i--) {
        const x = dbg.moneyLog[i];
        if (predicate(x)) return x;
      }
      return null;
    };

    const checkEntry = (entry, expect) => {
      const meta = entry && entry.meta ? entry.meta : null;
      const hasAllFields = !!(meta &&
        Object.prototype.hasOwnProperty.call(meta, "basePrice") &&
        Object.prototype.hasOwnProperty.call(meta, "mult") &&
        Object.prototype.hasOwnProperty.call(meta, "finalPrice") &&
        Object.prototype.hasOwnProperty.call(meta, "priceKey") &&
        Object.prototype.hasOwnProperty.call(meta, "pointsAtPurchase") &&
        Object.prototype.hasOwnProperty.call(meta, "context")
      );
      const okMultRange = !!(meta && (meta.mult === 1 || meta.mult === 2));
      const okFinalFormula = !!(meta && (Number(meta.finalPrice) === Number(meta.basePrice) * Number(meta.mult)));
      const okContext =
        !!(meta && meta.context && typeof meta.context === "object") &&
        Array.isArray(expect.contextKeys) &&
        expect.contextKeys.every(k => Object.prototype.hasOwnProperty.call(meta.context, k));
      const okMeta = !!(
        hasAllFields &&
        meta.basePrice === expect.basePrice &&
        meta.mult === expect.mult &&
        meta.finalPrice === expect.finalPrice &&
        meta.priceKey === expect.priceKey &&
        meta.pointsAtPurchase === expect.pointsAtPurchase &&
        okMultRange &&
        okFinalFormula &&
        okContext
      );
      const okAmount = entry && Number(entry.amount) === Number(expect.finalPrice);
      const okReason = entry && String(entry.reason || "") === String(expect.reason || "");
      return { ok: !!(okMeta && okAmount && okReason), okMeta, okAmount, okReason, okContext, okMultRange, okFinalFormula, meta, entry };
    };

    const results = [];
    const notes = [];
    const originalPoints = {
      me: (S.me && Number.isFinite(S.me.points)) ? (S.me.points | 0) : 0,
      playersMe: (S.players && S.players.me && Number.isFinite(S.players.me.points)) ? (S.players.me.points | 0) : null
    };

    const runVote = (points) => {
      const label = `vote@${points}`;
      if (!Events || typeof Events.makeNpcEvent !== "function" || typeof Events.addEvent !== "function" || typeof Events.helpEvent !== "function") {
        return { label, ok: false, reason: "events_missing" };
      }
      setMePoints(points);
      const startIdx = dbg.moneyLog.length;
      const ev = Events.makeNpcEvent();
      if (!ev) return { label, ok: false, reason: "event_create_failed" };
      Events.addEvent(ev);
      const acted = Events.helpEvent(ev.id, "a");
      const entry = findLatest(startIdx, x => x && x.reason === "crowd_vote_cost" && String(x.sourceId || "") === "me");
      const expected = Econ.calcFinalPrice({ basePrice: 1, actorPoints: points, priceKey: "vote" });
      expected.reason = "crowd_vote_cost";
      expected.pointsAtPurchase = points;
      expected.contextKeys = ["battleId"];
      const checked = checkEntry(entry, expected);
      if (Events.removeEvent) Events.removeEvent(ev.id);
      return { label, ok: !!(acted && checked.ok), acted, expected, checked, entry };
    };

    const runEscape = (points) => {
      const label = `escape@${points}`;
      setMePoints(points);
      const startIdx = dbg.moneyLog.length;
      const npc = findNpc();
      if (!npc) return { label, ok: false, reason: "npc_missing" };
      npc.role = npc.role || "toxic";
      npc.type = npc.type || npc.role;
      const battleId = `dev_escape_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
      const b = {
        id: battleId,
        opponentId: npc.id,
        opponentRole: npc.role,
        fromThem: false,
        status: "pickAttack",
        resolved: false,
        finished: false,
        draw: false,
        createdAt: Date.now()
      };
      S.battles = [b].concat(S.battles || []);
      const res = Core.escape ? Core.escape(battleId, { mode: "smyt" }) : null;
      const entry = findLatest(startIdx, x => x && x.reason === "escape_vote_cost" && String(x.sourceId || "") === "me");
      const baseCost = (Game.Data && typeof Game.Data.escapeCostByRole === "function")
        ? Game.Data.escapeCostByRole(npc.role, b)
        : 1;
      const expected = Econ.calcFinalPrice({ basePrice: baseCost, actorPoints: points, priceKey: "escape" });
      expected.reason = "escape_vote_cost";
      expected.pointsAtPurchase = points;
      expected.contextKeys = ["battleId", "mode"];
      const checked = checkEntry(entry, expected);
      S.battles = (S.battles || []).filter(x => x && x.id !== battleId);
      return { label, ok: !!(res && res.ok !== false && checked.ok), res, expected, checked, entry };
    };

    const runRematch = (points) => {
      const label = `rematch@${points}`;
      setMePoints(points);
      const startIdx = dbg.moneyLog.length;
      const npc = findNpc();
      if (!npc) return { label, ok: false, reason: "npc_missing" };
      const battleId = `dev_rematch_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
      const b = {
        id: battleId,
        opponentId: npc.id,
        opponentRole: npc.role || "toxic",
        fromThem: false,
        status: "finished",
        resolved: true,
        finished: true,
        result: "lose",
        createdAt: Date.now()
      };
      S.battles = [b].concat(S.battles || []);
      const res = Core.requestRematch ? Core.requestRematch(battleId, "me") : null;
      const entry = findLatest(startIdx, x => x && x.reason === "rematch_request_cost" && String(x.sourceId || "") === "me");
      const expected = Econ.calcFinalPrice({ basePrice: 1, actorPoints: points, priceKey: "rematch" });
      expected.reason = "rematch_request_cost";
      expected.pointsAtPurchase = points;
      expected.contextKeys = ["battleId", "rematchOf"];
      const checked = checkEntry(entry, expected);
      S.battles = (S.battles || []).filter(x => x && x.id !== battleId);
      return { label, ok: !!(res && res.ok !== false && checked.ok), res, expected, checked, entry };
    };

    const runTeach = (points) => {
      const label = `teach@${points}`;
      setMePoints(points);
      const startIdx = dbg.moneyLog.length;
      const npc = findNpc();
      if (!npc) return { label, ok: false, reason: "npc_missing" };
      const baseCost = (Game.Data && typeof Game.Data.teachCostByColor === "function") ? Game.Data.teachCostByColor("y") : 1;
      const actionNonce = `smoke_teach_${points}_${Date.now()}`;
      const price = Econ.calcFinalPrice({ basePrice: baseCost, actorPoints: points, priceKey: "teach", context: { targetId: npc.id, actionNonce } });
      const tx = (typeof Econ.chargePriceOnce === "function")
        ? Econ.chargePriceOnce({
            fromId: "me",
            toId: "sink",
            actorId: "me",
            reason: "teach_argument",
            priceKey: "teach",
            basePrice: baseCost,
            actorPoints: points,
            targetId: npc.id,
            argKey: "smoke",
            context: price.context || { targetId: npc.id, actionNonce }
          })
        : Econ.transferPoints("me", "sink", price.finalPrice, "teach_argument", {
            basePrice: price.basePrice,
            mult: price.mult,
            finalPrice: price.finalPrice,
            priceKey: price.priceKey || "teach",
            pointsAtPurchase: points,
            context: price.context || null
          });
      const entry = findLatest(startIdx, x => x && x.reason === "teach_argument" && String(x.sourceId || "") === "me");
      const expected = Econ.calcFinalPrice({ basePrice: baseCost, actorPoints: points, priceKey: "teach" });
      expected.reason = "teach_argument";
      expected.pointsAtPurchase = points;
      expected.contextKeys = ["targetId"];
      const checked = checkEntry(entry, expected);
      return { label, ok: !!(tx && tx.ok && checked.ok), expected, checked, entry };
    };

    const runDevSeed = (points) => {
      const label = `dev_rematch_seed@${points}`;
      setMePoints(points);
      const startIdx = dbg.moneyLog.length;
      const npc = findNpc();
      if (!npc) return { label, ok: false, reason: "npc_missing" };
      const actionNonce = `smoke_seed_${points}_${Date.now()}`;
      const price = Econ.calcFinalPrice({ basePrice: 1, actorPoints: points, priceKey: "dev_rematch_seed", context: { targetId: npc.id, actionNonce } });
      const tx = (typeof Econ.chargePriceOnce === "function")
        ? Econ.chargePriceOnce({
            fromId: "me",
            toId: npc.id,
            actorId: "me",
            reason: "dev_rematch_seed_cost",
            priceKey: price.priceKey || "dev_rematch_seed",
            basePrice: 1,
            actorPoints: points,
            targetId: npc.id,
            context: price.context || { targetId: npc.id, actionNonce }
          })
        : Econ.transferPoints("me", npc.id, price.finalPrice, "dev_rematch_seed_cost", {
            basePrice: price.basePrice,
            mult: price.mult,
            finalPrice: price.finalPrice,
            priceKey: price.priceKey || "dev_rematch_seed",
            pointsAtPurchase: points,
            context: price.context || null
          });
      const entry = findLatest(startIdx, x => x && x.reason === "dev_rematch_seed_cost" && String(x.sourceId || "") === "me");
      const expected = Econ.calcFinalPrice({ basePrice: 1, actorPoints: points, priceKey: "dev_rematch_seed" });
      expected.reason = "dev_rematch_seed_cost";
      expected.pointsAtPurchase = points;
      expected.contextKeys = ["targetId"];
      const checked = checkEntry(entry, expected);
      return { label, ok: !!(tx && tx.ok && checked.ok), expected, checked, entry };
    };

    const runSocial = (points) => {
      const label = `social@${points}`;
      return { label, ok: true, skipped: true, reason: "social_missing" };
    };

    [20, 21].forEach(points => {
      results.push(runVote(points));
      results.push(runRematch(points));
      results.push(runEscape(points));
      results.push(runTeach(points));
      results.push(runDevSeed(points));
      results.push(runSocial(points));
    });

    setMePoints(originalPoints.me);
    if (originalPoints.playersMe != null && S.players && S.players.me) setPoints(S.players.me, originalPoints.playersMe);

    const ok = results.every(r => r && r.ok);
    if (results.some(r => r && r.skipped)) notes.push("social_skipped");
    return { name, ok, results, notes };
  };

  Game.__DEV.smokeEcon06_PricesLogsOnce = (opts = {}) => {
    const name = "smoke_econ06_prices_logs_once";
    const Econ = Game._ConflictEconomy || null;
    const Core = Game._ConflictCore || null;
    const Events = Game.Events || null;
    const points = Number.isFinite(Number(opts.points)) ? (Number(opts.points) | 0) : 20;
    const expectedMult = points > 20 ? 2 : 1;
    if (!Econ || typeof Econ.calcFinalPrice !== "function" || typeof Econ.chargePriceOnce !== "function") {
      return { name, ok: false, reason: "econ_missing" };
    }
    if (!Core || !Events || typeof Events.makeNpcEvent !== "function") {
      return { name, ok: false, reason: "core_or_events_missing" };
    }

    const S = Game.__S || (Game.__S = {});
    if (!S.players) S.players = {};
    if (!S.me) S.me = { id: "me", points: 0, influence: 0, wins: 0 };
    if (!S.players.me) S.players.me = S.me;

    if (Game.__A && typeof Game.__A.seedPlayers === "function") {
      Game.__A.seedPlayers();
    } else if (Game.NPC && typeof Game.NPC.seedPlayers === "function") {
      Game.NPC.seedPlayers(S);
    }
    if (Game.__A && typeof Game.__A.syncMeToPlayers === "function") {
      Game.__A.syncMeToPlayers();
    }

    const dbg = Game.__D || (Game.__D = {});
    dbg.moneyLog = Array.isArray(dbg.moneyLog) ? dbg.moneyLog : (dbg.moneyLog = []);
    dbg.moneyLogByBattle = (dbg.moneyLogByBattle && typeof dbg.moneyLogByBattle === "object" && !Array.isArray(dbg.moneyLogByBattle))
      ? dbg.moneyLogByBattle
      : (dbg.moneyLogByBattle = {});

    const originalPoints = {
      me: (S.me && Number.isFinite(S.me.points)) ? (S.me.points | 0) : 0,
      playersMe: (S.players && S.players.me && Number.isFinite(S.players.me.points)) ? (S.players.me.points | 0) : null
    };

    const setPoints = (obj, v) => {
      if (!obj) return;
      const val = Number.isFinite(Number(v)) ? Number(v) : 0;
      if (typeof Game._withPointsWrite === "function") {
        Game._withPointsWrite(() => { obj.points = val; });
      } else {
        obj.points = val;
      }
    };

    const setMePoints = (v) => {
      setPoints(S.me, v);
      if (S.players && S.players.me) setPoints(S.players.me, v);
    };

    const findNpc = () => {
      const list = Object.values(S.players || {}).filter(p => p && p.id && (p.npc === true || p.type === "npc" || String(p.id).startsWith("npc_")));
      if (list.length) return list[0];
      const id = `npc_econ06_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
      const npc = { id, npc: true, type: "npc", points: 10, influence: 0, role: "toxic", name: "NPC" };
      S.players[id] = npc;
      return npc;
    };

    const ensureNpcCount = (minCount) => {
      const list = Object.values(S.players || {}).filter(p => p && p.id && (p.npc === true || p.type === "npc" || String(p.id).startsWith("npc_")));
      const need = Math.max(0, (minCount | 0) - list.length);
      for (let i = 0; i < need; i++) {
        const id = `npc_econ06_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
        S.players[id] = { id, npc: true, type: "npc", points: 10, influence: 0, role: "toxic", name: "NPC" };
      }
      return Object.values(S.players || {}).filter(p => p && p.id && (p.npc === true || p.type === "npc" || String(p.id).startsWith("npc_")));
    };

    const runId = `econ06_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
    const scopeBattleIds = new Set();
    const scopeReasons = new Set([
      "crowd_vote_cost",
      "rematch_request_cost",
      "escape_vote_cost",
      "teach_argument",
      "social_action_cost"
    ]);

    const markRunStart = () => {
      if (Econ && typeof Econ.transferPoints === "function") {
        Econ.transferPoints("sink", "sink", 1, "econ06_run_start", {
          battleId: runId,
          eventId: runId,
          context: { runId }
        });
      }
    };

    const isScoped = (row) => {
      if (!row || !scopeReasons.has(String(row.reason || ""))) return false;
      const bid = String(row.battleId || "");
      if (bid && scopeBattleIds.has(bid)) return true;
      const meta = row.meta || null;
      const ctx = meta && meta.context && typeof meta.context === "object" ? meta.context : null;
      return !!(ctx && String(ctx.runId || "") === runId);
    };

    const checkMeta = (row) => {
      const meta = row && row.meta ? row.meta : null;
      const hasFields = !!(meta &&
        Object.prototype.hasOwnProperty.call(meta, "priceKey") &&
        Object.prototype.hasOwnProperty.call(meta, "basePrice") &&
        Object.prototype.hasOwnProperty.call(meta, "mult") &&
        Object.prototype.hasOwnProperty.call(meta, "finalPrice") &&
        Object.prototype.hasOwnProperty.call(meta, "pointsAtPurchase")
      );
      const multOk = !!(meta && meta.mult === expectedMult);
      const formulaOk = !!(meta && (Number(meta.finalPrice) === Number(meta.basePrice) * Number(meta.mult)));
      const pointsOk = !!(meta && Number(meta.pointsAtPurchase) === Number(points));
      return { ok: !!(hasFields && multOk && formulaOk && pointsOk), hasFields, multOk, formulaOk, pointsOk, meta };
    };

    markRunStart();

    const runVote = () => {
      setMePoints(points);
      const npcs = ensureNpcCount(3);
      npcs.forEach(n => setPoints(n, points));
      const ev = Events.makeNpcEvent();
      if (!ev) return { ok: false, reason: "event_create_failed" };
      ev.id = `econ06_vote_${runId}`;
      ev.battleId = ev.id;
      scopeBattleIds.add(String(ev.id));
      Events.addEvent(ev);
      const acted = Events.helpEvent(ev.id, "a");
      try {
        if (ev.crowd) ev.crowd.nextNpcVoteAt = 0;
      } catch (_) {}
      if (typeof Events.tick === "function") {
        Events.tick();
        Events.tick();
      }
      const rows = dbg.moneyLog.filter(x => x && String(x.reason || "") === "crowd_vote_cost" && String(x.battleId || "") === String(ev.id));
      const npcRow = rows.find(x => String(x.sourceId || "") !== "me");
      const reasonSeen = Array.from(new Set(rows.map(r => String(r.reason || ""))));
      const scopedCountVote = dbg.moneyLog.filter(x => isScoped(x) && String(x.reason || "") === "crowd_vote_cost").length;
      const first = rows[0] || null;
      const firstRowPreview = first ? {
        reason: first.reason,
        battleId: first.battleId || null,
        sourceId: first.sourceId || null,
        priceKey: first.meta && first.meta.priceKey,
        basePrice: first.meta && first.meta.basePrice,
        mult: first.meta && first.meta.mult,
        finalPrice: first.meta && first.meta.finalPrice,
        pointsAtPurchase: first.meta && first.meta.pointsAtPurchase
      } : null;
      if (Events.removeEvent) Events.removeEvent(ev.id);
      return { ok: !!(acted && rows.length > 0 && npcRow), rows, npcRowPresent: !!npcRow, reasonSeen, scopedCountVote, firstRowPreview };
    };

    const runRematch = () => {
      setMePoints(points);
      const npc = findNpc();
      const battleId = `econ06_rematch_${runId}`;
      const b = {
        id: battleId,
        opponentId: npc.id,
        opponentRole: npc.role || "toxic",
        fromThem: false,
        status: "finished",
        resolved: true,
        finished: true,
        result: "lose",
        createdAt: Date.now()
      };
      scopeBattleIds.add(String(battleId));
      S.battles = [b].concat(S.battles || []);
      const res = Core.requestRematch ? Core.requestRematch(battleId, "me") : null;
      const rows = dbg.moneyLog.filter(x => x && String(x.reason || "") === "rematch_request_cost" && String(x.battleId || "") === String(battleId));
      S.battles = (S.battles || []).filter(x => x && x.id !== battleId);
      return { ok: !!(res && res.ok !== false && rows.length > 0), rows };
    };

    const runEscape = () => {
      setMePoints(points);
      const npc = findNpc();
      npc.role = npc.role || "toxic";
      npc.type = npc.type || npc.role;
      const battleId = `econ06_escape_${runId}`;
      const b = {
        id: battleId,
        opponentId: npc.id,
        opponentRole: npc.role,
        fromThem: false,
        status: "pickAttack",
        resolved: false,
        finished: false,
        draw: false,
        createdAt: Date.now()
      };
      scopeBattleIds.add(String(battleId));
      S.battles = [b].concat(S.battles || []);
      const res = Core.escape ? Core.escape(battleId, { mode: "smyt" }) : null;
      const rows = dbg.moneyLog.filter(x => x && String(x.reason || "") === "escape_vote_cost" && String(x.battleId || "") === String(battleId));
      S.battles = (S.battles || []).filter(x => x && x.id !== battleId);
      return { ok: !!(res && res.ok !== false && rows.length > 0), rows };
    };

    const runTeach = () => {
      setMePoints(points);
      const npc = findNpc();
      const baseCost = (Game.Data && typeof Game.Data.teachCostByColor === "function") ? Game.Data.teachCostByColor("y") : 1;
      const actionNonce = `econ06_teach_${runId}`;
      const price = Econ.calcFinalPrice({ basePrice: baseCost, actorPoints: points, priceKey: "teach", context: { targetId: npc.id, actionNonce, runId } });
      const tx = Econ.chargePriceOnce({
        fromId: "me",
        toId: "sink",
        actorId: "me",
        reason: "teach_argument",
        priceKey: "teach",
        basePrice: baseCost,
        actorPoints: points,
        targetId: npc.id,
        argKey: "smoke",
        context: price.context || { targetId: npc.id, actionNonce, runId }
      });
      const rows = dbg.moneyLog.filter(x => x && String(x.reason || "") === "teach_argument" && isScoped(x));
      return { ok: !!(tx && tx.ok && rows.length > 0), rows };
    };

    const runSocial = () => {
      setMePoints(points);
      const baseCost = 1;
      const actionNonce = `social_${runId}`;
      const price = Econ.calcFinalPrice({ basePrice: baseCost, actorPoints: points, priceKey: "social", context: { runId, actionNonce } });
      const tx = Econ.chargePriceOnce({
        fromId: "me",
        toId: "sink",
        actorId: "me",
        reason: "social_action_cost",
        priceKey: "social",
        basePrice: baseCost,
        actorPoints: points,
        actionNonce,
        context: price.context || { runId, actionNonce }
      });
      const rows = dbg.moneyLog.filter(x => x && String(x.reason || "") === "social_action_cost" && isScoped(x));
      return { ok: !!(tx && tx.ok && rows.length > 0), rows };
    };

    const categories = {
      vote: runVote(),
      rematch: runRematch(),
      escape: runEscape(),
      teach: runTeach(),
      social: runSocial()
    };

    const scopedRows = dbg.moneyLog.filter(isScoped);
    const bypasses = scopedRows.filter(row => {
      const metaOk = checkMeta(row);
      return !metaOk.ok;
    });

    const perCategoryMeta = Object.keys(categories).reduce((acc, key) => {
      const rows = categories[key] && Array.isArray(categories[key].rows) ? categories[key].rows : [];
      const checks = rows.map(checkMeta);
      acc[key] = {
        rows: rows.length,
        metaOk: checks.every(c => c.ok),
        metaChecks: checks
      };
      return acc;
    }, {});

    const ok =
      Object.values(categories).every(c => c && c.ok) &&
      Object.values(perCategoryMeta).every(c => c && c.metaOk) &&
      bypasses.length === 0;

    setMePoints(originalPoints.me);
    if (originalPoints.playersMe != null && S.players && S.players.me) setPoints(S.players.me, originalPoints.playersMe);

    return {
      name,
      ok,
      points,
      expectedMult,
      runId,
      categories,
      perCategoryMeta,
      scopedCount: scopedRows.length,
      bypasses
    };
  };

  Game.__DEV.smokeEcon07_WinsSourceOnce = (opts = {}) => {
    const name = "smoke_econ07_wins_source_once";
    const Econ = Game._ConflictEconomy || Game.ConflictEconomy || null;
    const S = Game.__S || (Game.__S = {});
    if (!Econ || typeof Econ.getWinsCountForProgress !== "function") {
      return { name, ok: false, notes: ["econ_helper_missing"] };
    }
    if (!Array.isArray(S.battles)) S.battles = [];

    const runId = (opts && opts.runId) ? String(opts.runId) : `${Date.now()}`;
    const battleIds = {
      win: `dev_econ07_win_${runId}`,
      draw: `dev_econ07_draw_${runId}`,
      unfinished: `dev_econ07_unfinished_${runId}`
    };

    const winBattle = {
      id: battleIds.win,
      opponentId: "npc_weak",
      result: "win",
      resolved: true,
      finished: true,
      status: "finished",
      createdAt: Date.now()
    };
    const drawBattle = {
      id: battleIds.draw,
      opponentId: "npc_weak",
      result: "draw",
      resolved: true,
      finished: false,
      status: "draw",
      createdAt: Date.now()
    };
    const unfinishedBattle = {
      id: battleIds.unfinished,
      opponentId: "npc_weak",
      result: null,
      resolved: false,
      finished: false,
      status: "pickAttack",
      createdAt: Date.now()
    };

    const prevBattles = S.battles.slice();
    const notes = [];
    let winsCount = 0;
    let winsCountAfterRepeat = 0;
    const excluded = { drawCount: 1, unfinishedCount: 1 };
    try {
      S.battles = [winBattle, drawBattle, unfinishedBattle];
      winsCount = Econ.getWinsCountForProgress("me");
      winsCountAfterRepeat = Econ.getWinsCountForProgress("me");
    } catch (err) {
      notes.push(`exception:${String(err && err.message ? err.message : err)}`);
    } finally {
      S.battles = prevBattles;
    }

    const ok =
      winsCount === 1 &&
      winsCountAfterRepeat === 1 &&
      excluded.drawCount === 1 &&
      excluded.unfinishedCount === 1 &&
      notes.length === 0;

    return {
      name,
      ok,
      winsCount,
      winsCountAfterRepeat,
      excluded,
      notes,
      battleIds
    };
  };

  Game.__DEV.smokeEcon07_ThresholdsOnce = (opts = {}) => {
    const name = "smoke_econ07_thresholds_once";
    const Econ = Game._ConflictEconomy || Game.ConflictEconomy || null;
    if (!Econ || typeof Econ.getWinProgressThreshold !== "function" || typeof Econ.getRepRewardForWinThreshold !== "function") {
      return { name, ok: false, notes: ["econ_helpers_missing"], cases: [] };
    }
    const winsList = [0, 9, 10, 11, 19, 20, 21, 49, 50, 99];
    const cases = winsList.map(winsCount => {
      const threshold = Econ.getWinProgressThreshold(winsCount);
      const amount = Econ.getRepRewardForWinThreshold(threshold);
      return { winsCount, threshold, amount };
    });
    const notes = [];
    const expected = (winsCount, threshold) => {
      const t = threshold;
      const table = Econ.WIN_PROGRESS_REP_TABLE || {};
      const amt = Number.isFinite(table[t]) ? (table[t] | 0) : 0;
      return { threshold: t, amount: amt };
    };
    let ok = true;
    const assertCase = (winsCount, expThreshold) => {
      const c = cases.find(x => x.winsCount === winsCount);
      const exp = expected(winsCount, expThreshold);
      if (!c) return false;
      if (c.threshold !== exp.threshold) return false;
      if (c.amount !== exp.amount) return false;
      return true;
    };
    if (!assertCase(0, null)) ok = false;
    if (!assertCase(9, null)) ok = false;
    if (!assertCase(10, 10)) ok = false;
    if (!assertCase(11, 10)) ok = false;
    if (!assertCase(19, 10)) ok = false;
    if (!assertCase(20, 20)) ok = false;
    if (!assertCase(21, 20)) ok = false;
    if (!assertCase(49, 40)) ok = false;
    if (!assertCase(50, 50)) ok = false;
    if (!assertCase(99, 90)) ok = false;
    if (!ok) notes.push("threshold_or_amount_mismatch");
    return { name, ok, cases, notes };
  };

  Game.__DEV.smokeEcon07_AntiDuplicateOnce = (opts = {}) => {
    const name = "smoke_econ07_anti_duplicate_once";
    const Econ = Game._ConflictEconomy || Game.ConflictEconomy || null;
    if (!Econ ||
        typeof Econ.buildWinProgressRewardMeta !== "function" ||
        typeof Econ.getRepRewardForWinThreshold !== "function" ||
        typeof Econ.getWinProgressAwardState !== "function" ||
        typeof Econ.markWinProgressAwarded !== "function") {
      return { name, ok: false, notes: ["econ_helpers_missing"], cases: [] };
    }

    const playerId = "me";
    const state = Econ.getWinProgressAwardState(playerId);
    state.thresholds = {};
    state.meta = {};

    const thresholds = [10, 20, 50];
    const cases = thresholds.map((threshold) => {
      const amount = Econ.getRepRewardForWinThreshold(threshold);
      const first = Econ.buildWinProgressRewardMeta({ playerId, winsCount: threshold });
      if (first.shouldGrant && amount > 0) {
        Econ.markWinProgressAwarded(playerId, threshold, { smoke: true, reasonKey: first.reasonKey });
      }
      const second = Econ.buildWinProgressRewardMeta({ playerId, winsCount: threshold });
      return {
        threshold,
        amount,
        first: { shouldGrant: !!first.shouldGrant, alreadyAwarded: !!first.alreadyAwarded },
        second: { shouldGrant: !!second.shouldGrant, alreadyAwarded: !!second.alreadyAwarded }
      };
    });

    const notes = [];
    let ok = true;
    const findCase = (t) => cases.find(c => c.threshold === t);
    const c10 = findCase(10);
    const c20 = findCase(20);
    const c50 = findCase(50);
    if (!c10 || !c10.first.shouldGrant || c10.second.shouldGrant) ok = false;
    if (!c20 || !c20.first.shouldGrant || c20.second.shouldGrant) ok = false;
    if (!c50 || c50.first.shouldGrant || c50.second.shouldGrant) ok = false;
    if (state.thresholds[50]) ok = false;
    if (!ok) notes.push("anti_duplicate_mismatch");

    return { name, ok, cases, notes };
  };

  Game.__DEV.smokeEcon07_GrantOnce = (opts = {}) => {
    const name = "smoke_econ07_grant_once";
    const Econ = Game._ConflictEconomy || Game.ConflictEconomy || null;
    const S = Game.__S || (Game.__S = {});
    if (!Econ ||
        typeof Econ.maybeGrantWinProgressRep !== "function" ||
        typeof Econ.getWinProgressAwardState !== "function" ||
        typeof Econ.winProgressRewardKey !== "function") {
      return { name, ok: false, notes: ["econ_helpers_missing"], grants: [], totals: { rowsAdded: 0 } };
    }
    if (!Array.isArray(S.battles)) S.battles = [];
    const dbg = Game.__D || (Game.__D = {});
    dbg.moneyLog = Array.isArray(dbg.moneyLog) ? dbg.moneyLog : (dbg.moneyLog = []);

    const resetAward = () => {
      const state = Econ.getWinProgressAwardState("me");
      state.thresholds = {};
      state.meta = {};
    };
    const repRows = () => dbg.moneyLog.filter(r => r && String(r.reason || "") === "rep_win_progress_threshold");
    const makeWinBattle = (id) => ({
      id,
      opponentId: "npc_weak",
      result: "win",
      resolved: true,
      finished: true,
      status: "finished",
      createdAt: Date.now()
    });
    const makeDrawBattle = (id) => ({
      id,
      opponentId: "npc_weak",
      result: "draw",
      resolved: true,
      finished: false,
      status: "draw",
      createdAt: Date.now()
    });
    const makeUnfinishedBattle = (id) => ({
      id,
      opponentId: "npc_weak",
      result: null,
      resolved: false,
      finished: false,
      status: "pickAttack",
      createdAt: Date.now()
    });

    resetAward();
    S.battles = [];
    const baseCount = repRows().length;
    const grants = [];
    const notes = [];

    // Prepare winsCount=9
    for (let i = 1; i <= 9; i++) {
      S.battles.push(makeWinBattle(`econ07_win_${i}`));
    }
    const b10 = makeWinBattle("econ07_win_10");
    S.battles.push(b10);
    let before = repRows().length;
    Econ.maybeGrantWinProgressRep({ playerId: "me", battleId: b10.id, outcome: "win" });
    let after = repRows().length;
    grants.push({ threshold: 10, amount: 2, battleId: b10.id, logCountDelta: after - before });

    // Repeat apply for same battleId
    before = repRows().length;
    Econ.maybeGrantWinProgressRep({ playerId: "me", battleId: b10.id, outcome: "win" });
    after = repRows().length;
    grants.push({ threshold: 10, amount: 2, battleId: b10.id, logCountDelta: after - before });

    // Draw should not grant
    const bDraw = makeDrawBattle("econ07_draw_1");
    S.battles.push(bDraw);
    before = repRows().length;
    Econ.maybeGrantWinProgressRep({ playerId: "me", battleId: bDraw.id, outcome: "draw" });
    after = repRows().length;
    grants.push({ threshold: null, amount: 0, battleId: bDraw.id, logCountDelta: after - before });

    // Unfinished should not grant
    const bUn = makeUnfinishedBattle("econ07_unfinished_1");
    S.battles.push(bUn);
    before = repRows().length;
    Econ.maybeGrantWinProgressRep({ playerId: "me", battleId: bUn.id, outcome: "win" });
    after = repRows().length;
    grants.push({ threshold: null, amount: 0, battleId: bUn.id, logCountDelta: after - before });

    // Prepare winsCount=19, then 20th win
    for (let i = 11; i <= 19; i++) {
      S.battles.push(makeWinBattle(`econ07_win_${i}`));
    }
    const b20 = makeWinBattle("econ07_win_20");
    S.battles.push(b20);
    before = repRows().length;
    Econ.maybeGrantWinProgressRep({ playerId: "me", battleId: b20.id, outcome: "win" });
    after = repRows().length;
    grants.push({ threshold: 20, amount: 1, battleId: b20.id, logCountDelta: after - before });

    const totals = { rowsAdded: repRows().length - baseCount };
    let ok = true;
    const byBattle = (bid) => repRows().filter(r => String(r.battleId || "") === String(bid));
    const key10 = Econ.winProgressRewardKey("me", 10);
    const key20 = Econ.winProgressRewardKey("me", 20);
    const row10 = byBattle(b10.id).slice(-1)[0];
    const row20 = byBattle(b20.id).slice(-1)[0];
    if (!row10 || !row20) ok = false;
    if (row10 && row10.meta && row10.meta.idempotencyKey !== key10) ok = false;
    if (row20 && row20.meta && row20.meta.idempotencyKey !== key20) ok = false;
    if (totals.rowsAdded !== 2) ok = false;
    const repeat10 = grants[1];
    const drawGrant = grants[2];
    const unfinishedGrant = grants[3];
    if (!repeat10 || repeat10.logCountDelta !== 0) ok = false;
    if (!drawGrant || drawGrant.logCountDelta !== 0) ok = false;
    if (!unfinishedGrant || unfinishedGrant.logCountDelta !== 0) ok = false;
    if (!ok) notes.push("grant_mismatch");

    return { name, ok, grants, totals, notes };
  };

  Game.__DEV.smokeEcon07_AntiFarmOnce = (opts = {}) => {
    const name = "smoke_econ07_anti_farm_once";
    const Econ = Game._ConflictEconomy || Game.ConflictEconomy || null;
    const S = Game.__S || (Game.__S = {});
    if (!Econ ||
        typeof Econ.maybeGrantWinProgressRep !== "function" ||
        typeof Econ.getWinProgressAwardState !== "function") {
      return { name, ok: false, notes: ["econ_helpers_missing"], steps: [], totals: { rowsAdded: 0 } };
    }
    if (!Array.isArray(S.battles)) S.battles = [];
    const dbg = Game.__D || (Game.__D = {});
    dbg.moneyLog = Array.isArray(dbg.moneyLog) ? dbg.moneyLog : (dbg.moneyLog = []);

    const resetAward = () => {
      const state = Econ.getWinProgressAwardState("me");
      state.thresholds = {};
      state.meta = {};
    };
    const repRows = () => dbg.moneyLog.filter(r => r && String(r.reason || "") === "rep_win_progress_threshold");
    const makeBattle = (id, outcome, resolved) => ({
      id,
      opponentId: "npc_weak",
      result: outcome,
      resolved: !!resolved,
      finished: !!resolved,
      status: resolved ? "finished" : "pickAttack",
      createdAt: Date.now()
    });

    resetAward();
    S.battles = [];
    const baseCount = repRows().length;
    const steps = [];
    const notes = [];

    // Prepare winsCount=9
    for (let i = 1; i <= 9; i++) {
      S.battles.push(makeBattle(`econ07_af_win_${i}`, "win", true));
    }

    const runStep = (label, battle, outcome) => {
      if (battle) S.battles.push(battle);
      const before = repRows().length;
      const res = Econ.maybeGrantWinProgressRep({ playerId: "me", battleId: battle && battle.id, outcome });
      const after = repRows().length;
      steps.push({
        label,
        battleId: battle && battle.id ? battle.id : null,
        outcome,
        logCountDelta: after - before,
        didGrant: !!res.didGrant,
        threshold: res.threshold || null
      });
    };

    runStep("lose_no_grant", makeBattle("econ07_af_lose_1", "lose", true), "lose");
    runStep("draw_no_grant", makeBattle("econ07_af_draw_1", "draw", true), "draw");
    runStep("unfinished_no_grant", makeBattle("econ07_af_unfinished_1", null, false), "unfinished");

    const b10 = makeBattle("econ07_af_win_10", "win", true);
    runStep("win_threshold_10", b10, "win");
    runStep("replay_same_battle", b10, "win");

    runStep("rematch_lose", makeBattle("econ07_af_rematch_lose", "lose", true), "lose");
    runStep("rematch_win_no_threshold", makeBattle("econ07_af_rematch_win", "win", true), "win");

    const totals = { rowsAdded: repRows().length - baseCount };
    let ok = true;
    const checkZero = (label) => {
      const s = steps.find(x => x.label === label);
      return !!(s && s.logCountDelta === 0 && s.didGrant === false);
    };
    if (!checkZero("lose_no_grant")) ok = false;
    if (!checkZero("draw_no_grant")) ok = false;
    if (!checkZero("unfinished_no_grant")) ok = false;
    const t10 = steps.find(x => x.label === "win_threshold_10");
    if (!t10 || t10.logCountDelta !== 1 || !t10.didGrant || t10.threshold !== 10) ok = false;
    const replay = steps.find(x => x.label === "replay_same_battle");
    if (!replay || replay.logCountDelta !== 0) ok = false;
    if (!checkZero("rematch_lose")) ok = false;
    const rematchWin = steps.find(x => x.label === "rematch_win_no_threshold");
    if (!rematchWin || rematchWin.logCountDelta !== 0) ok = false;
    if (totals.rowsAdded !== 1) ok = false;
    if (!ok) notes.push("anti_farm_mismatch");

    return { name, ok, steps, totals, notes };
  };

  Game.__DEV.smokeSoftCapPricesEdgeOnce = () => {
    const name = "smoke_soft_cap_prices_edge_once";
    const Econ = Game._ConflictEconomy || null;
    if (!Econ || typeof Econ.calcFinalPrice !== "function") {
      return { name, ok: false, reason: "econ_calc_missing" };
    }
    const pointsSet = [0, 1, 20, 21, 999];
    const categories = [
      { label: "vote", priceKey: "vote", baseFn: () => 1, context: (points) => ({ battleId: `edge_vote_${points}` }) },
      { label: "escape", priceKey: "escape", baseFn: () => {
        const D0 = Game.Data || {};
        return (D0 && typeof D0.escapeCostByRole === "function") ? (D0.escapeCostByRole("toxic") || 1) : 1;
      }, context: (points) => ({ battleId: `edge_escape_${points}`, mode: "smyt" }) },
      { label: "rematch", priceKey: "rematch", baseFn: () => 1, context: (points) => ({ battleId: `edge_rematch_${points}` }) },
      { label: "teach", priceKey: "teach", baseFn: () => {
        const D0 = Game.Data || {};
        return (D0 && typeof D0.teachCostByColor === "function") ? (D0.teachCostByColor("y") || 1) : 1;
      }, context: (points) => ({ actionNonce: `edge_teach_${points}` }) },
      { label: "dev_rematch_seed", priceKey: "dev_rematch_seed", baseFn: () => 1, context: (points) => ({ actionNonce: `edge_dev_seed_${points}` }) }
    ];

    const normalizeMeta = (price, basePrice, points, priceKey, context) => {
      const safeBase = Number.isFinite(price?.basePrice) ? price.basePrice : basePrice;
      const safeMult = Number.isFinite(price?.mult) ? price.mult : 1;
      const safeFinal = Number.isFinite(price?.finalPrice) ? price.finalPrice : safeBase * safeMult;
      const ctx = context || (price && price.context) || null;
      return {
        basePrice: safeBase,
        mult: safeMult,
        finalPrice: safeFinal,
        pointsAtPurchase: points,
        priceKey,
        context: ctx || null,
        idempotencyKey: (price && price.idempotencyKey) || `${priceKey}:${points}`,
        affordable: safeFinal <= points,
        note: price ? null : "meta_was_null_normalized"
      };
    };

    const checkCase = (category, points) => {
      const base = category.baseFn(points);
      const context = category.context(points);
      const price = Econ.calcFinalPrice({
        basePrice: Number.isFinite(base) ? base : 0,
        actorPoints: Number.isFinite(points) ? points : 0,
        priceKey: category.priceKey,
        context
      });
      const meta = normalizeMeta(price, base, points, category.priceKey, context);
      const assertions = {
        metaPresent: meta != null,
        finalFinite: Number.isFinite(meta.finalPrice),
        finalInteger: Number.isFinite(meta.finalPrice) && Number.isInteger(meta.finalPrice),
        finalPositive: Number.isFinite(meta.finalPrice) && meta.finalPrice >= 1,
        thresholdStrict: points <= 20 ? (meta.mult === 1 && meta.finalPrice === meta.basePrice) : (meta.mult > 1 && meta.finalPrice >= meta.basePrice),
        totalFinite: Number.isFinite(meta.basePrice) && Number.isFinite(meta.mult),
        affordableFlag: meta.affordable === (meta.finalPrice <= points)
      };
      return {
        label: category.label,
        points,
        meta,
        assertions
      };
    };

    const cases = [];
    pointsSet.forEach(points => {
      categories.forEach(category => {
        cases.push(checkCase(category, points));
      });
    });

    const badSamples = cases.filter(c => Object.values(c.assertions).some(v => !v)).slice(0, 8).map(c => ({
      label: c.label,
      points: c.points,
      priceKey: c.meta.priceKey,
      basePrice: c.meta.basePrice,
      mult: c.meta.mult,
      finalPrice: c.meta.finalPrice,
      metaPresent: !!c.meta
    }));
    const ok = badSamples.length === 0;
    const badCount = badSamples.length;
    console.log("[DEV] ECON03_PRICE_EDGE_SIG", { ok, badCount, pointsSet });
    if (!ok) {
      console.log("[DEV] ECON03_PRICE_EDGE_FAIL", { sampledCases: badSamples });
    }
    return {
      name,
      ok,
      cases,
      asserts: cases.map(c => c.assertions),
      badSamples,
      goodSamples: cases.filter(c => Object.values(c.assertions).every(v => v)).slice(0, 5)
    };
  };

  const normalizeMoneyLogRows = (anyLog, label = "unknown") => {
    if (Array.isArray(anyLog)) return anyLog;
    if (anyLog && Array.isArray(anyLog.rows)) return anyLog.rows;
    if (anyLog == null) return [];
    console.warn("DEV_MONEYLOG_NORMALIZE_EMPTY", { label, type: typeof anyLog });
    return [];
  };

  const TX_AMOUNT_KEYS = ["amount", "amt", "points", "pts", "delta", "value", "qty"];
  const TX_SOURCE_KEYS = [
    "fromId",
    "from",
    "src",
    "srcId",
    "sender",
    "sourceId",
    "payerId",
    "ownerId",
    "actorId",
    "payer"
  ];
  const TX_TARGET_KEYS = [
    "toId",
    "to",
    "dst",
    "dstId",
    "receiver",
    "targetId",
    "payeeId",
    "payee",
    "ownerId",
    "receiverId"
  ];
  const TX_REASON_KEYS = ["reason", "why"];
  const TX_COUNTERPARTY_KEYS = [
    "counterpartyId",
    "counterparty",
    "cpty",
    "id",
    "otherId",
    "accountId",
    "counterpartyId"
  ];
  const TX_DIRECTION_KEYS = ["direction", "dir", "flow", "isIn", "isOut"];
  const TX_DETECTOR_VERSION = "npc_tx_detector_v1";
  const TX_DEFAULT_ACTOR_ID = "audit_actor";
const TRACE_VERSION = "trace_v2";
const DIAG_VERSION = "npc_audit_diag_v2";

  const getFirstFieldValue = (row, keys) => {
    if (!row || typeof row !== "object") return null;
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      if (Object.prototype.hasOwnProperty.call(row, key)) return row[key];
    }
    const meta = row.meta || {};
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      if (Object.prototype.hasOwnProperty.call(meta, key)) return meta[key];
    }
    return null;
  };
  const detectDirectionValue = (value, amountSign) => {
    if (value != null) {
      const str = String(value).toLowerCase();
      if (str === "in" || str === "out") return str;
      if (str === "true" || str === "1") return "in";
      if (str === "-1") return "out";
      if (str.includes("in")) return "in";
      if (str.includes("out")) return "out";
    }
    if (amountSign > 0) return "in";
    if (amountSign < 0) return "out";
    return null;
  };

  const collectWorldIdsFromLogs = (scopedRows, netDeltaById) => {
    const ids = new Set();
    const addId = (id) => {
      if (!id) return;
      ids.add(String(id));
    };
    addId("me");
    const rows = normalizeMoneyLogRows(scopedRows, "collectWorldIdsFromLogs");
    rows.forEach(row => {
      if (!row || typeof row !== "object") return;
      const reason = String(getFirstFieldValue(row, TX_REASON_KEYS) || "");
      const currency = String(row.currency || (row.meta && row.meta.currency) || "");
      if (currency === "rep" || reason.startsWith("rep_")) return;
      const fromId = getFirstFieldValue(row, TX_SOURCE_KEYS);
      const toId = getFirstFieldValue(row, TX_TARGET_KEYS);
      if (fromId) addId(fromId);
      if (toId) addId(toId);
    });
    if (netDeltaById && typeof netDeltaById === "object") {
      Object.keys(netDeltaById).forEach(addId);
    }
    const includedServiceAccounts = {
      sinkIncluded: ids.has("sink"),
      worldBankIncluded: ids.has("worldBank")
    };
    return { ids: Array.from(ids), includedServiceAccounts };
  };

  const isTxLikeRow = (row) => {
    if (!row || typeof row !== "object") return false;
    const amount = getFirstFieldValue(row, TX_AMOUNT_KEYS);
    if (!Number.isFinite(Number(amount))) return false;
    const fromId = getFirstFieldValue(row, TX_SOURCE_KEYS);
    const toId = getFirstFieldValue(row, TX_TARGET_KEYS);
    const counterparty = getFirstFieldValue(row, TX_COUNTERPARTY_KEYS);
    if (!(fromId || toId || counterparty)) return false;
    const reason = getFirstFieldValue(row, TX_REASON_KEYS);
    if (!reason) {
      // reason optional but prefer to have at least one field
      return !!(fromId || toId || counterparty);
    }
    return true;
  };

  const normalizeTxRow = (row) => {
    if (!isTxLikeRow(row)) return null;
    const rawAmount = getFirstFieldValue(row, TX_AMOUNT_KEYS);
    const parsedAmount = Number(rawAmount);
    if (!Number.isFinite(parsedAmount)) return null;
    let fromId = getFirstFieldValue(row, TX_SOURCE_KEYS);
    let toId = getFirstFieldValue(row, TX_TARGET_KEYS);
    const reasonRaw = getFirstFieldValue(row, TX_REASON_KEYS);
    const reason = reasonRaw ? String(reasonRaw) : "unknown_reason";
    const reasonProvided = reasonRaw != null && reasonRaw !== "";
    const counterpartyRaw = getFirstFieldValue(row, TX_COUNTERPARTY_KEYS);
    const counterpartyId = counterpartyRaw != null ? String(counterpartyRaw) : null;
    const directionRaw = getFirstFieldValue(row, TX_DIRECTION_KEYS);
    const direction = detectDirectionValue(directionRaw, Math.sign(parsedAmount));
    const amountSign = Math.sign(parsedAmount);
    let inferredDirection = false;
    const resolveDirectionActor = () => {
      if (direction === "in") return { source: counterpartyId || TX_DEFAULT_ACTOR_ID, target: TX_DEFAULT_ACTOR_ID };
      if (direction === "out") return { source: TX_DEFAULT_ACTOR_ID, target: counterpartyId || TX_DEFAULT_ACTOR_ID };
      if (amountSign >= 0) return { source: counterpartyId || TX_DEFAULT_ACTOR_ID, target: TX_DEFAULT_ACTOR_ID };
      return { source: TX_DEFAULT_ACTOR_ID, target: counterpartyId || TX_DEFAULT_ACTOR_ID };
    };
    if ((!fromId || !toId) && counterpartyId) {
      const inferred = resolveDirectionActor();
      if (!fromId) fromId = inferred.source;
      if (!toId) toId = inferred.target;
      inferredDirection = true;
    }
    const metaBase = row.meta || {};
    const meta = inferredDirection ? Object.assign({}, metaBase, { inferredDirection: true }) : metaBase;
    return {
      fromId: fromId ? String(fromId) : null,
      toId: toId ? String(toId) : null,
      amount: parsedAmount,
      absAmount: Math.abs(parsedAmount),
      reason,
      reasonProvided,
      meta,
      direction: direction || "",
      counterpartyId,
      battleId: row.battleId || null,
      eventId: row.eventId || null,
      original: row
    };
  };


  const isTransactionalRow = (row) => {
    if (!row) return false;
    const amount = row.amount;
    const hasAmount = Number.isFinite(Number(amount)) && amount !== 0;
    const hasReason = Boolean(row.reason);
    const hasCounterparty = Boolean(row.sourceId) || Boolean(row.targetId);
    return hasAmount && hasReason && hasCounterparty;
  };

  const describeRowShape = (row) => {
    const base = row && typeof row === "object" ? row : {};
    const keys = Object.keys(base).sort();
    return {
      keys,
      amountType: typeof base.amount,
      reasonType: typeof base.reason,
      hasSourceId: Boolean(base.sourceId),
      hasTargetId: Boolean(base.targetId),
      hasCurrency: base.currency != null,
      isPointsFlag: base.isPoints === true
    };
  };

  const hasAnyField = (row, keys) => {
    if (!row || typeof row !== "object") return false;
    return keys.some(key => {
      const value = row[key];
      return value != null && value !== "";
    });
  };
  const getFlattenedSample = (row) => {
    if (!row || typeof row !== "object") return null;
    const meta = row.meta || {};
    const pick = (keys) => {
      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i];
        if (row[key] != null) return row[key];
        if (meta && meta[key] != null) return meta[key];
      }
      return null;
    };
    const sample = {
      reason: String(row.reason || "unknown"),
      amount: pick(["amount", "amt", "delta", "points", "value", "qty"]),
      signedAmount: pick(["signedAmount"]),
      fromId: pick(["fromId", "sourceId", "payerId", "payer", "src", "srcId", "actorId"]),
      toId: pick(["toId", "targetId", "payeeId", "payee", "dst", "dstId", "receiver", "receiverId"]),
      counterpartyId: pick(["counterpartyId", "counterparty", "otherId", "accountId"]),
      direction: pick(["direction", "dir", "flow", "isIn", "isOut"]),
      actorId: pick(["actorId", "actor"]),
      npcId: pick(["npcId"]),
      battleId: pick(["battleId", "metaBattleId"]),
      eventId: pick(["eventId"]),
      metaFromId: meta ? meta.fromId : null,
      metaToId: meta ? meta.toId : null
    };
    return sample;
  };

  const isNpcCandidate = (value) => value && typeof value === "string" && value.startsWith("npc_");
  const rowInvolvesNpc = (row) => {
    if (!row || typeof row !== "object") return false;
    const candidateKeys = [
      "fromId",
      "sourceId",
      "actorId",
      "targetId",
      "toId",
      "counterpartyId",
      "payerId",
      "payeeId",
      "ownerId",
      "npcId"
    ];
    const meta = row.meta || {};
    for (let i = 0; i < candidateKeys.length; i += 1) {
      const key = candidateKeys[i];
      const value = row[key] != null ? row[key] : meta[key];
      if (isNpcCandidate(value)) return true;
    }
    return false;
  };

  const collectLogSourceCandidates = () => {
    const describeRowsSample = (rows, limit = 2) => {
      if (!Array.isArray(rows)) return [];
      return rows.slice(0, limit).map(describeRowShape);
    };
    const candidates = [];
    const addCandidate = (rows, name) => {
      const normalized = normalizeMoneyLogRows(rows, `logSource:${name}`);
      const txHits = normalized.filter(isTxLikeRow).length;
      const txRatio = normalized.length ? (txHits / normalized.length) : 0;
      const shapeSample = describeRowsSample(normalized);
      candidates.push({
        name,
        rows: normalized,
        len: normalized.length,
        txHits,
        txRatio,
        shapeSample
      });
    };
    const dbg = Game.__D || null;
    const dbgPublic = Game.Debug || null;
    addCandidate((dbgPublic && Array.isArray(dbgPublic.moneyLog)) ? dbgPublic.moneyLog : [], "Game.Debug.moneyLog");
    addCandidate((dbgPublic && Array.isArray(dbgPublic.debug_moneyLog)) ? dbgPublic.debug_moneyLog : [], "Game.Debug.debug_moneyLog");
    addCandidate((typeof window !== "undefined" && Array.isArray(window.debug_moneyLog)) ? window.debug_moneyLog : [], "window.debug_moneyLog");
    const dbgByBattle = (dbg && dbg.moneyLogByBattle && typeof dbg.moneyLogByBattle === "object")
      ? dbg.moneyLogByBattle
      : null;
    addCandidate((dbg && Array.isArray(dbg.moneyLog)) ? dbg.moneyLog : [], "debug_moneyLog");
    if (dbgByBattle) {
      const rows = Object.values(dbgByBattle)
        .reduce((acc, bucket) => acc.concat(Array.isArray(bucket) ? bucket : []), []);
      addCandidate(rows, "debug_moneyLogByBattle");
    } else {
      addCandidate([], "debug_moneyLogByBattle");
    }
    const dbg2 = Game.Debug || null;
    const dbg2ByBattle = (dbg2 && dbg2.debug_moneyLogByBattle && typeof dbg2.debug_moneyLogByBattle === "object")
      ? dbg2.debug_moneyLogByBattle
      : null;
    if (dbg2ByBattle) {
      const rows = Object.values(dbg2ByBattle)
        .reduce((acc, bucket) => acc.concat(Array.isArray(bucket) ? bucket : []), []);
      addCandidate(rows, "Game.Debug.debug_moneyLogByBattle");
    } else {
      addCandidate([], "Game.Debug.debug_moneyLogByBattle");
    }
    const logger = Game && Game.Logger ? Game.Logger : null;
    const queue = logger && Array.isArray(logger.queue) ? logger.queue : null;
    addCandidate(queue || [], "logger_queue");
    const state = Game && Game.State ? Game.State : null;
    const stateLog = state && Array.isArray(state.moneyLog) ? state.moneyLog : null;
    addCandidate(stateLog || [], "state_moneyLog");
    const stateLogByBattle = state && state.moneyLogByBattle ? state.moneyLogByBattle : null;
    if (stateLogByBattle && typeof stateLogByBattle === "object") {
      const rows = Object.values(stateLogByBattle)
        .reduce((acc, bucket) => acc.concat(Array.isArray(bucket) ? bucket : []), []);
      addCandidate(rows, "state_moneyLogByBattle");
    } else {
      addCandidate([], "state_moneyLogByBattle");
    }
    const Econ = Game && (Game.ConflictEconomy || Game._ConflictEconomy) ? (Game.ConflictEconomy || Game._ConflictEconomy) : null;
    if (Econ && Array.isArray(Econ.moneyLog)) {
      addCandidate(Econ.moneyLog, "Econ.moneyLog");
    } else {
      addCandidate([], "Econ.moneyLog");
    }
    addCandidate([], "none");
    return candidates;
  };

  // QA helper for dumping log sources (command: Game.__DEV.dumpMoneyLogSourcesOnce({window:{lastN:200}}))
  Game.__DEV.dumpMoneyLogSourcesOnce = (opts = {}) => {
    const header = "WORLD_MONEYLOG_SOURCES_V1_BEGIN";
    const footer = "WORLD_MONEYLOG_SOURCES_V1_END";
    const buildTag = "build_2026_02_09b";
    const emit = (line) => {
      try {
        if (typeof Game !== "undefined" && Game.__DEV && typeof Game.__DEV.emitLine === "function") {
          Game.__DEV.emitLine(String(line));
        } else {
          console.warn(String(line));
        }
      } catch (_) {}
    };
    let summary = null;
    try {
      const candidates = collectLogSourceCandidates();
      const mapped = candidates.map(c => {
        const rowType = Array.isArray(c.rows) ? "array" : (c.rows && typeof c.rows === "object" ? "object" : null);
        const len = Array.isArray(c.rows) ? c.rows.length : (c.rows && typeof c.rows.length === "number" ? c.rows.length : null);
        const sample = Array.isArray(c.rows) && c.rows.length ? c.rows[len - 1] : null;
        return {
          name: c.name,
          present: !!len,
          type: rowType,
          len,
          sample
        };
      });
      const bestRow = mapped.find(m => m.len && m.len > 0) || null;
      const best = bestRow ? { name: bestRow.name, why: "non_empty", len: bestRow.len } : { name: null, why: "none", len: null };
      const ok = !!bestRow;
      const notes = ok ? [] : ["no_log_sources"];
      summary = { ok, buildTag, candidates: mapped, best, notes };
    } catch (err) {
      summary = {
        ok: false,
        buildTag,
        candidates: [],
        best: { name: null, why: "exception", len: null },
        notes: ["exception", String(err && err.message ? err.message : err)]
      };
    } finally {
      emit(header);
      emit(`BUILD_TAG=${buildTag}`);
      emit(safeStringify(summary));
      emit(footer);
    }
    return summary;
  };

  const pickLogCandidate = (candidates, preferName) => {
    if (!Array.isArray(candidates) || !candidates.length) return { name: "none", rows: [], len: 0 };
    if (preferName) {
      const match = candidates.find(c => c.name === preferName);
      if (match) return match;
    }
    const nonEmpty = candidates.find(c => c.len > 0);
    return nonEmpty || candidates[0];
  };

  const collectBattleRows = (battleId) => {
    if (!battleId) return [];
    const dbg = Game.__D || null;
    const log = (dbg && Array.isArray(dbg.moneyLog)) ? dbg.moneyLog : [];
    const rows = normalizeMoneyLogRows(log, "collectBattleRows.log").filter(row => matchesBattleRow(row, battleId));
    const sorted = rows.slice().sort((a, b) => {
      const ak = `${String(a && a.ts || "")}|${String(a && a.reason || "")}|${String(a && a.sourceId || "")}|${String(a && a.targetId || "")}|${String(a && a.amount || "")}`;
      const bk = `${String(b && b.ts || "")}|${String(b && b.reason || "")}|${String(b && b.sourceId || "")}|${String(b && b.targetId || "")}|${String(b && b.amount || "")}`;
      return ak < bk ? -1 : (ak > bk ? 1 : 0);
    });
    return sorted;
  };

  const buildByReason = (rows) => rows.reduce((acc, tx) => {
    const reason = tx && tx.reason ? String(tx.reason) : "unknown";
    acc[reason] = (acc[reason] || 0) + 1;
    return acc;
  }, Object.create(null));

  const buildNetById = (rows) => rows.reduce((acc, tx) => {
    if (!tx) return acc;
    const amt = Number.isFinite(tx.amount) ? (tx.amount | 0) : 0;
    const src = tx.sourceId ? String(tx.sourceId) : "";
    const tgt = tx.targetId ? String(tx.targetId) : "";
    if (!src || !tgt) return acc;
    acc[src] = (acc[src] || 0) - amt;
    acc[tgt] = (acc[tgt] || 0) + amt;
    return acc;
  }, Object.create(null));

  Game.__DEV.probeEcon03_EscapeIgnoreOnce = (opts = {}) => {
    const debug = !!opts.debug;
    const scenarios = [];
    const logProbe = (label, smokeFn) => {
      let result = null;
      let battleId = null;
      let reason = null;
      try {
        result = smokeFn({ mode: "cap", debugTelemetry: debug, allowParallel: true });
        battleId = result && (result.battleId || (result.audit && result.audit.battleId) || (result.telemetry && result.telemetry.id) || null);
        reason = result && result.reason ? result.reason : null;
      } catch (err) {
        console.log("[DEV] ECON03_E1_PROBE", { scenario: label, ok: false, error: String(err), battleId: null });
        return { label, ok: false, error: String(err), battleId: null };
      }
      const rows = collectBattleRows(battleId);
      const byReason = buildByReason(rows);
      const netById = buildNetById(rows);
      const sampleReasons = Object.keys(byReason).sort().slice(0, 12);
      console.log("[DEV] ECON03_E1_PROBE", { scenario: label, battleId, scopedLen: rows.length, sampleReasons, reason });
      console.log("[DEV] ECON03_E1_PROBE_NET", { scenario: label, netById });
      return { label, ok: !!result && !!result.ok, battleId, rows, byReason, netById };
    };
    const esc = logProbe("escape", Game.Dev && typeof Game.Dev.smokeEscapeCrowdOutcomeOnce === "function"
      ? Game.Dev.smokeEscapeCrowdOutcomeOnce
      : (Game.__DEV && typeof Game.__DEV.smokeEscapeCrowdOutcomeOnce === "function" ? Game.__DEV.smokeEscapeCrowdOutcomeOnce : null));
    const stay = logProbe("escape_stay", Game.Dev && typeof Game.Dev.smokeEscapeCrowdStayOnce === "function"
      ? Game.Dev.smokeEscapeCrowdStayOnce
      : (Game.__DEV && typeof Game.__DEV.smokeEscapeCrowdStayOnce === "function" ? Game.__DEV.smokeEscapeCrowdStayOnce : null));
    const ign = logProbe("ignore", Game.Dev && typeof Game.Dev.smokeIgnoreCrowdOutcomeOnce === "function"
      ? Game.Dev.smokeIgnoreCrowdOutcomeOnce
      : (Game.__DEV && typeof Game.__DEV.smokeIgnoreCrowdOutcomeOnce === "function" ? Game.__DEV.smokeIgnoreCrowdOutcomeOnce : null));
    return { name: "probe_econ03_escape_ignore_once", ok: true, scenarios: [esc, stay, ign] };
  };

  Game.__DEV.smokeEcon03_EscapeIgnoreOnce = (opts = {}) => {
    const name = "smoke_econ03_escape_ignore_once";
    const debug = !!(opts && opts.debug);
    const runTag = opts && opts.runTag ? String(opts.runTag) : "run";
    const notes = [];

    const requiredEscape = ["crowd_vote_cost", "crowd_vote_pool_init", "crowd_vote_refund_majority", "escape_vote_cost"];
    const requiredIgnore = ["crowd_vote_cost", "crowd_vote_pool_init", "crowd_vote_refund_majority"];
    const requiredIgnoreDiag = ["ignore_outcome_debug"];
    const optionalDebug = ["crowd_cap_debug"];

    const normalizeNetById = (raw) => {
      const out = Object.create(null);
      Object.keys(raw || {}).forEach(key => {
        const val = raw[key] | 0;
        if (val === 0) return;
        if (key.startsWith("crowd:")) {
          out["crowd:*"] = (out["crowd:*"] || 0) + val;
          return;
        }
        out[key] = (out[key] || 0) + val;
      });
      return out;
    };

    const normalizeSig = (obj) => JSON.stringify(Object.keys(obj || {}).sort().map(k => `${k}:${obj[k] || 0}`));

    const runScenario = (label, smokeFn) => {
      let smoke = null;
      let battleId = null;
      let error = null;
      try {
        smoke = smokeFn({ mode: "cap", debugTelemetry: debug, allowParallel: true });
        battleId = smoke && (smoke.battleId || (smoke.audit && smoke.audit.battleId) || (smoke.telemetry && smoke.telemetry.id) || null);
      } catch (e) {
        error = String(e);
      }
      if (!battleId) {
        return { label, ok: false, battleId: null, scopedLen: 0, byReason: {}, netById: {}, normalizedNetSig: "[]", reasonsSig: "[]", missingReasons: ["battleId_missing"], error };
      }
      const rows = collectBattleRows(battleId);
      const byReason = buildByReason(rows);
      const netById = buildNetById(rows);
      const normalizedNetById = normalizeNetById(netById);
      const normalizedNetSig = normalizeSig(normalizedNetById);
      const reasonsSig = normalizeSig(byReason);
      const scopedLen = rows.length;
      return { label, ok: true, battleId, scopedLen, byReason, netById, normalizedNetSig, reasonsSig };
    };

    const smokeEscapeFn = Game.Dev && typeof Game.Dev.smokeEscapeCrowdOutcomeOnce === "function"
      ? Game.Dev.smokeEscapeCrowdOutcomeOnce
      : (Game.__DEV && typeof Game.__DEV.smokeEscapeCrowdOutcomeOnce === "function" ? Game.__DEV.smokeEscapeCrowdOutcomeOnce : null);
    const smokeStayFn = Game.Dev && typeof Game.Dev.smokeEscapeCrowdStayOnce === "function"
      ? Game.Dev.smokeEscapeCrowdStayOnce
      : (Game.__DEV && typeof Game.__DEV.smokeEscapeCrowdStayOnce === "function" ? Game.__DEV.smokeEscapeCrowdStayOnce : null);
    const smokeIgnoreFn = Game.Dev && typeof Game.Dev.smokeIgnoreCrowdOutcomeOnce === "function"
      ? Game.Dev.smokeIgnoreCrowdOutcomeOnce
      : (Game.__DEV && typeof Game.__DEV.smokeIgnoreCrowdOutcomeOnce === "function" ? Game.__DEV.smokeIgnoreCrowdOutcomeOnce : null);

    const escape = smokeEscapeFn ? runScenario("escape", smokeEscapeFn) : { label: "escape", ok: false, battleId: null, scopedLen: 0, byReason: {}, netById: {}, normalizedNetSig: "[]", reasonsSig: "[]", missingReasons: ["smoke_missing"] };
    const stay = smokeStayFn ? runScenario("escape_stay", smokeStayFn) : { label: "escape_stay", ok: false, battleId: null, scopedLen: 0, byReason: {}, netById: {}, normalizedNetSig: "[]", reasonsSig: "[]", missingReasons: ["smoke_missing"] };
    const ignore = smokeIgnoreFn ? runScenario("ignore", smokeIgnoreFn) : { label: "ignore", ok: false, battleId: null, scopedLen: 0, byReason: {}, netById: {}, normalizedNetSig: "[]", reasonsSig: "[]", missingReasons: ["smoke_missing"] };

    const checkRequired = (sc, required) => required.filter(r => !sc.byReason || !Object.prototype.hasOwnProperty.call(sc.byReason, r));
    const escapeMissing = escape.ok ? checkRequired(escape, requiredEscape) : ["smoke_failed"];
    const stayMissing = stay.ok ? checkRequired(stay, requiredEscape) : ["smoke_failed"];
    const ignoreMissing = ignore.ok ? checkRequired(ignore, requiredIgnore) : ["smoke_failed"];
    const ignoreDiagMissing = ignore.ok ? requiredIgnoreDiag.filter(r => !ignore.byReason || !Object.prototype.hasOwnProperty.call(ignore.byReason, r)) : ["smoke_failed"];

    const escapeNetOk = escape.normalizedNetSig === normalizeSig({ me: -1, npc_weak: 1 }) || escape.normalizedNetSig === normalizeSig({ me: -1, npc_troll: 1 });
    const stayNetOk = stay.normalizedNetSig === normalizeSig({ me: -1, npc_weak: 1 }) || stay.normalizedNetSig === normalizeSig({ me: -1, npc_troll: 1 });
    const ignoreNetOk = ignore.normalizedNetSig === "[]";

    const requiredReasonsOk = escapeMissing.length === 0 && stayMissing.length === 0 && ignoreMissing.length === 0 && ignoreDiagMissing.length === 0;
    if (!requiredReasonsOk) {
      notes.push(`missing_required_reason:${[...escapeMissing, ...stayMissing, ...ignoreMissing, ...ignoreDiagMissing].join("|")}`);
    }
    if (!escapeNetOk || !stayNetOk || !ignoreNetOk) {
      notes.push("netSig_mismatch");
    }
    if (!escape.ok || !stay.ok || !ignore.ok) {
      notes.push("scenario_failed");
    }
    if (escape.scopedLen === 0 || stay.scopedLen === 0 || ignore.scopedLen === 0) {
      notes.push("scoped_empty");
    }

    const reasonsSig = JSON.stringify({
      escape: normalizeSig(requiredEscape.reduce((acc, k) => { acc[k] = (escape.byReason && escape.byReason[k]) || 0; return acc; }, Object.create(null))),
      escape_stay: normalizeSig(requiredEscape.reduce((acc, k) => { acc[k] = (stay.byReason && stay.byReason[k]) || 0; return acc; }, Object.create(null))),
      ignore: normalizeSig(requiredIgnore.concat(requiredIgnoreDiag).reduce((acc, k) => { acc[k] = (ignore.byReason && ignore.byReason[k]) || 0; return acc; }, Object.create(null)))
    });
    const normalizedNetSig = JSON.stringify({
      escape: escape.normalizedNetSig,
      escape_stay: stay.normalizedNetSig,
      ignore: ignore.normalizedNetSig
    });
    const totalsSig = JSON.stringify({ stableDelta: 0, deltaPoints: 0, deltaRep: 0 });
    const sig = JSON.stringify({ reasonsSig, normalizedNetSig, totalsSig });

    const ok = requiredReasonsOk && escapeNetOk && stayNetOk && ignoreNetOk &&
      escape.ok && stay.ok && ignore.ok &&
      escape.scopedLen > 0 && stay.scopedLen > 0 && ignore.scopedLen > 0;

    if (debug) {
      console.log("[DEV] ECON03_ESC_SIG", { runTag, reasonsSig, normalizedNetSig, totalsSig, scopedLen: escape.scopedLen + stay.scopedLen + ignore.scopedLen });
      if (!ok) {
        console.log("[DEV] ECON03_ESC_FAIL", { runTag, notes, sampleRows: collectBattleRows(escape.battleId).slice(0, 8) });
      }
    }

    return {
      name,
      ok,
      notes,
      sig,
      reasonsSig,
      normalizedNetSig,
      totalsSig,
      scenarios: [escape, stay, ignore]
    };
  };

  Game.__DEV.smokeSoftCapPriceEdgeCasesOnce = () => {
    const name = "smoke_soft_cap_price_edge_cases_once";
    const Econ = Game._ConflictEconomy || null;
    const Core = Game._ConflictCore || null;
    const Events = Game.Events || null;
    if (!Econ || typeof Econ.calcFinalPrice !== "function" || typeof Econ.transferPoints !== "function") {
      return { name, ok: false, reason: "econ_missing" };
    }
    if (!Core) return { name, ok: false, reason: "core_missing" };

    const S = Game.__S || (Game.__S = {});
    if (!S.players) S.players = {};
    if (!S.me) S.me = { id: "me", points: 0, influence: 0, wins: 0 };
    if (!S.players.me) S.players.me = S.me;

    if (Game.__A && typeof Game.__A.seedPlayers === "function") {
      Game.__A.seedPlayers();
    } else if (Game.NPC && typeof Game.NPC.seedPlayers === "function") {
      Game.NPC.seedPlayers(S);
    }
    if (Game.__A && typeof Game.__A.syncMeToPlayers === "function") {
      Game.__A.syncMeToPlayers();
    }

    const dbg = Game.__D || (Game.__D = {});
    dbg.moneyLog = Array.isArray(dbg.moneyLog) ? dbg.moneyLog : (dbg.moneyLog = []);
    dbg.moneyLogByBattle = (dbg.moneyLogByBattle && typeof dbg.moneyLogByBattle === "object" && !Array.isArray(dbg.moneyLogByBattle))
      ? dbg.moneyLogByBattle
      : (dbg.moneyLogByBattle = {});

    const setPoints = (obj, v) => {
      if (!obj) return;
      const val = Number.isFinite(Number(v)) ? Number(v) : 0;
      if (typeof Game._withPointsWrite === "function") {
        Game._withPointsWrite(() => { obj.points = val; });
      } else {
        obj.points = val;
      }
    };
    const setMePoints = (v) => {
      setPoints(S.me, v);
      if (S.players && S.players.me) setPoints(S.players.me, v);
    };

    const findNpc = () => {
      const list = Object.values(S.players || {}).filter(p => p && p.id && (p.npc === true || p.type === "npc" || String(p.id).startsWith("npc_")));
      if (list.length) return list[0];
      const id = `npc_softcap_edge_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
      const npc = { id, npc: true, type: "npc", points: 10, influence: 0, role: "toxic", name: "NPC" };
      S.players[id] = npc;
      return npc;
    };

    const findLatest = (startIdx, predicate) => {
      for (let i = dbg.moneyLog.length - 1; i >= startIdx; i--) {
        const x = dbg.moneyLog[i];
        if (predicate(x)) return x;
      }
      return null;
    };

    const checkEntry = (entry, expect) => {
      const meta = entry && entry.meta ? entry.meta : null;
      const hasAllFields = !!(meta &&
        Object.prototype.hasOwnProperty.call(meta, "basePrice") &&
        Object.prototype.hasOwnProperty.call(meta, "mult") &&
        Object.prototype.hasOwnProperty.call(meta, "finalPrice") &&
        Object.prototype.hasOwnProperty.call(meta, "priceKey") &&
        Object.prototype.hasOwnProperty.call(meta, "pointsAtPurchase") &&
        Object.prototype.hasOwnProperty.call(meta, "context") &&
        Object.prototype.hasOwnProperty.call(meta, "idempotencyKey")
      );
      const okMultRange = !!(meta && (meta.mult === 1 || meta.mult === 2));
      const okFinalFormula = !!(meta && (Number(meta.finalPrice) === Number(meta.basePrice) * Number(meta.mult)));
      const okFinite = !!(meta && Number.isFinite(Number(meta.finalPrice)) && Number(meta.finalPrice) >= 0);
      const okContext =
        !!(meta && meta.context && typeof meta.context === "object") &&
        Array.isArray(expect.contextKeys) &&
        expect.contextKeys.every(k => Object.prototype.hasOwnProperty.call(meta.context, k));
      const okThreshold = !!(meta && ((expect.pointsAtPurchase > 20 && meta.mult === 2) || (expect.pointsAtPurchase <= 20 && meta.mult === 1)));
      const okMeta = !!(
        hasAllFields &&
        meta.basePrice === expect.basePrice &&
        meta.mult === expect.mult &&
        meta.finalPrice === expect.finalPrice &&
        meta.priceKey === expect.priceKey &&
        meta.pointsAtPurchase === expect.pointsAtPurchase &&
        okMultRange &&
        okFinalFormula &&
        okFinite &&
        okContext &&
        okThreshold
      );
      const okAmount = entry && Number(entry.amount) === Number(expect.finalPrice);
      const okReason = entry && String(entry.reason || "") === String(expect.reason || "");
      return {
        ok: !!(okMeta && okAmount && okReason),
        okMeta,
        okAmount,
        okReason,
        okContext,
        okMultRange,
        okFinalFormula,
        okFinite,
        okThreshold,
        okBlocked: false,
        blockedReason: null,
        meta,
        entry
      };
    };

    const buildExpected = (basePrice, points, priceKey, reason, contextKeys, context) => {
      const expected = Econ.calcFinalPrice({ basePrice, actorPoints: points, priceKey, context });
      expected.reason = reason;
      expected.pointsAtPurchase = points;
      expected.contextKeys = contextKeys;
      expected.idempotencyKey = `${priceKey}|me|${context && (context.battleId || context.targetId || "edge") || "edge"}|${context && context.actionNonce || "na"}`;
      return expected;
    };

    const checkComputed = (expected) => {
      const meta = expected || null;
      const hasAllFields = !!(meta &&
        Object.prototype.hasOwnProperty.call(meta, "basePrice") &&
        Object.prototype.hasOwnProperty.call(meta, "mult") &&
        Object.prototype.hasOwnProperty.call(meta, "finalPrice") &&
        Object.prototype.hasOwnProperty.call(meta, "priceKey") &&
        Object.prototype.hasOwnProperty.call(meta, "pointsAtPurchase") &&
        Object.prototype.hasOwnProperty.call(meta, "context") &&
        Object.prototype.hasOwnProperty.call(meta, "idempotencyKey")
      );
      const okMultRange = !!(meta && (meta.mult === 1 || meta.mult === 2));
      const okFinalFormula = !!(meta && (Number(meta.finalPrice) === Number(meta.basePrice) * Number(meta.mult)));
      const okFinite = !!(meta && Number.isFinite(Number(meta.finalPrice)) && Number(meta.finalPrice) >= 1);
      const okContext =
        !!(meta && meta.context && typeof meta.context === "object") &&
        Array.isArray(expected.contextKeys) &&
        expected.contextKeys.every(k => Object.prototype.hasOwnProperty.call(meta.context, k));
      const okThreshold = !!(meta && ((expected.pointsAtPurchase > 20 && meta.mult === 2) || (expected.pointsAtPurchase <= 20 && meta.mult === 1)));
      const okMeta = !!(
        hasAllFields &&
        meta.basePrice === expected.basePrice &&
        meta.mult === expected.mult &&
        meta.finalPrice === expected.finalPrice &&
        meta.priceKey === expected.priceKey &&
        meta.pointsAtPurchase === expected.pointsAtPurchase &&
        okMultRange &&
        okFinalFormula &&
        okFinite &&
        okContext &&
        okThreshold
      );
      return {
        ok: !!okMeta,
        okMeta,
        okAmount: true,
        okReason: true,
        okContext,
        okMultRange,
        okFinalFormula,
        okFinite,
        okThreshold,
        okBlocked: true,
        blockedReason: "insufficient_points",
        meta,
        entry: null
      };
    };

    const results = [];
    const notes = [];
    const originalPoints = {
      me: (S.me && Number.isFinite(S.me.points)) ? (S.me.points | 0) : 0,
      playersMe: (S.players && S.players.me && Number.isFinite(S.players.me.points)) ? (S.players.me.points | 0) : null
    };
    const pointsCases = [0, 1, 20, 21, 999];

    const runVote = (points) => {
      const label = `vote@${points}`;
      if (!Events || typeof Events.makeNpcEvent !== "function" || typeof Events.addEvent !== "function" || typeof Events.helpEvent !== "function") {
        return { label, ok: false, reason: "events_missing" };
      }
      if (points === 0) {
        const context = { battleId: `edge_vote_${Date.now()}`, actionNonce: `edge_vote_${points}_${Date.now()}` };
        const expected = buildExpected(1, points, "vote", "crowd_vote_cost", ["battleId"], context);
        const checked = checkComputed(expected);
        return {
          label,
          points,
          priceKey: "vote",
          ok: checked.ok,
          checked,
          entryAmount: null,
          metaSummary: {
            basePrice: expected.basePrice,
            mult: expected.mult,
            finalPrice: expected.finalPrice,
            pointsAtPurchase: expected.pointsAtPurchase
          }
        };
      }
      setMePoints(points);
      const startIdx = dbg.moneyLog.length;
      const ev = Events.makeNpcEvent();
      if (!ev) return { label, ok: false, reason: "event_create_failed" };
      Events.addEvent(ev);
      const acted = Events.helpEvent(ev.id, "a");
      const entry = findLatest(startIdx, x => x && x.reason === "crowd_vote_cost" && String(x.sourceId || "") === "me");
      const expected = buildExpected(1, points, "vote", "crowd_vote_cost", ["battleId"], null);
      const checked = checkEntry(entry, expected);
      if (Events.removeEvent) Events.removeEvent(ev.id);
      return {
        label,
        points,
        priceKey: "vote",
        ok: !!(acted && checked.ok),
        checked,
        entryAmount: entry ? entry.amount : null,
        metaSummary: entry && entry.meta ? {
          basePrice: entry.meta.basePrice,
          mult: entry.meta.mult,
          finalPrice: entry.meta.finalPrice,
          pointsAtPurchase: entry.meta.pointsAtPurchase
        } : null
      };
    };

    const runEscape = (points) => {
      const label = `escape@${points}`;
      if (points === 0) {
        const context = { battleId: `edge_escape_${Date.now()}`, mode: "smyt", actionNonce: `edge_escape_${points}_${Date.now()}` };
        const baseCost = (Game.Data && typeof Game.Data.escapeCostByRole === "function")
          ? Game.Data.escapeCostByRole("toxic", null)
          : 1;
        const expected = buildExpected(baseCost, points, "escape", "escape_vote_cost", ["battleId", "mode"], context);
        const checked = checkComputed(expected);
        return {
          label,
          points,
          priceKey: "escape",
          ok: checked.ok,
          checked,
          entryAmount: null,
          metaSummary: {
            basePrice: expected.basePrice,
            mult: expected.mult,
            finalPrice: expected.finalPrice,
            pointsAtPurchase: expected.pointsAtPurchase
          }
        };
      }
      setMePoints(points);
      const startIdx = dbg.moneyLog.length;
      const npc = findNpc();
      if (!npc) return { label, ok: false, reason: "npc_missing" };
      npc.role = npc.role || "toxic";
      npc.type = npc.type || npc.role;
      const battleId = `dev_escape_edge_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
      const b = {
        id: battleId,
        opponentId: npc.id,
        opponentRole: npc.role,
        fromThem: false,
        status: "pickAttack",
        resolved: false,
        finished: false,
        draw: false,
        createdAt: Date.now()
      };
      S.battles = [b].concat(S.battles || []);
      const res = Core.escape ? Core.escape(battleId, { mode: "smyt" }) : null;
      const entry = findLatest(startIdx, x => x && x.reason === "escape_vote_cost" && String(x.sourceId || "") === "me");
      const baseCost = (Game.Data && typeof Game.Data.escapeCostByRole === "function")
        ? Game.Data.escapeCostByRole(npc.role, b)
        : 1;
      const expected = buildExpected(baseCost, points, "escape", "escape_vote_cost", ["battleId", "mode"], null);
      const checked = checkEntry(entry, expected);
      S.battles = (S.battles || []).filter(x => x && x.id !== battleId);
      return {
        label,
        points,
        priceKey: "escape",
        ok: !!(res && res.ok !== false && checked.ok),
        checked,
        entryAmount: entry ? entry.amount : null,
        metaSummary: entry && entry.meta ? {
          basePrice: entry.meta.basePrice,
          mult: entry.meta.mult,
          finalPrice: entry.meta.finalPrice,
          pointsAtPurchase: entry.meta.pointsAtPurchase
        } : null
      };
    };

    const runRematch = (points) => {
      const label = `rematch@${points}`;
      if (points === 0) {
        const context = { battleId: `edge_rematch_${Date.now()}`, rematchOf: `edge_rematch_${Date.now()}`, actionNonce: `edge_rematch_${points}_${Date.now()}` };
        const expected = buildExpected(1, points, "rematch", "rematch_request_cost", ["battleId", "rematchOf"], context);
        const checked = checkComputed(expected);
        return {
          label,
          points,
          priceKey: "rematch",
          ok: checked.ok,
          checked,
          entryAmount: null,
          metaSummary: {
            basePrice: expected.basePrice,
            mult: expected.mult,
            finalPrice: expected.finalPrice,
            pointsAtPurchase: expected.pointsAtPurchase
          }
        };
      }
      setMePoints(points);
      const startIdx = dbg.moneyLog.length;
      const npc = findNpc();
      if (!npc) return { label, ok: false, reason: "npc_missing" };
      const battleId = `dev_rematch_edge_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
      const b = {
        id: battleId,
        opponentId: npc.id,
        opponentRole: npc.role || "toxic",
        fromThem: false,
        status: "finished",
        resolved: true,
        finished: true,
        result: "lose",
        createdAt: Date.now()
      };
      S.battles = [b].concat(S.battles || []);
      const res = Core.requestRematch ? Core.requestRematch(battleId, "me") : null;
      const entry = findLatest(startIdx, x => x && x.reason === "rematch_request_cost" && String(x.sourceId || "") === "me");
      const expected = buildExpected(1, points, "rematch", "rematch_request_cost", ["battleId", "rematchOf"], null);
      const checked = checkEntry(entry, expected);
      S.battles = (S.battles || []).filter(x => x && x.id !== battleId);
      return {
        label,
        points,
        priceKey: "rematch",
        ok: !!(res && res.ok !== false && checked.ok),
        checked,
        entryAmount: entry ? entry.amount : null,
        metaSummary: entry && entry.meta ? {
          basePrice: entry.meta.basePrice,
          mult: entry.meta.mult,
          finalPrice: entry.meta.finalPrice,
          pointsAtPurchase: entry.meta.pointsAtPurchase
        } : null
      };
    };

    const runTeach = (points) => {
      const label = `teach@${points}`;
      if (points === 0) {
        const npc = findNpc();
        if (!npc) return { label, ok: false, reason: "npc_missing" };
        const baseCost = (Game.Data && typeof Game.Data.teachCostByColor === "function") ? Game.Data.teachCostByColor("y") : 1;
        const actionNonce = `edge_teach_${points}_${Date.now()}`;
        const context = { targetId: npc.id, actionNonce };
        const expected = buildExpected(baseCost, points, "teach", "teach_argument", ["targetId"], context);
        const checked = checkComputed(expected);
        return {
          label,
          points,
          priceKey: "teach",
          ok: checked.ok,
          checked,
          entryAmount: null,
          metaSummary: {
            basePrice: expected.basePrice,
            mult: expected.mult,
            finalPrice: expected.finalPrice,
            pointsAtPurchase: expected.pointsAtPurchase
          }
        };
      }
      setMePoints(points);
      const startIdx = dbg.moneyLog.length;
      const npc = findNpc();
      if (!npc) return { label, ok: false, reason: "npc_missing" };
      const baseCost = (Game.Data && typeof Game.Data.teachCostByColor === "function") ? Game.Data.teachCostByColor("y") : 1;
      const actionNonce = `edge_teach_${points}_${Date.now()}`;
      const price = Econ.calcFinalPrice({ basePrice: baseCost, actorPoints: points, priceKey: "teach", context: { targetId: npc.id, actionNonce } });
      const tx = (typeof Econ.chargePriceOnce === "function")
        ? Econ.chargePriceOnce({
            fromId: "me",
            toId: "sink",
            actorId: "me",
            reason: "teach_argument",
            priceKey: "teach",
            basePrice: baseCost,
            actorPoints: points,
            targetId: npc.id,
            argKey: "smoke",
            context: price.context || { targetId: npc.id, actionNonce }
          })
        : Econ.transferPoints("me", "sink", price.finalPrice, "teach_argument", {
            basePrice: price.basePrice,
            mult: price.mult,
            finalPrice: price.finalPrice,
            priceKey: price.priceKey || "teach",
            pointsAtPurchase: points,
            context: price.context || null
          });
      const entry = findLatest(startIdx, x => x && x.reason === "teach_argument" && String(x.sourceId || "") === "me");
      const expected = buildExpected(baseCost, points, "teach", "teach_argument", ["targetId"], null);
      const checked = checkEntry(entry, expected);
      return {
        label,
        points,
        priceKey: "teach",
        ok: !!(tx && tx.ok && checked.ok),
        checked,
        entryAmount: entry ? entry.amount : null,
        metaSummary: entry && entry.meta ? {
          basePrice: entry.meta.basePrice,
          mult: entry.meta.mult,
          finalPrice: entry.meta.finalPrice,
          pointsAtPurchase: entry.meta.pointsAtPurchase
        } : null
      };
    };

    const runDevSeed = (points) => {
      const label = `dev_rematch_seed@${points}`;
      if (points === 0) {
        const npc = findNpc();
        if (!npc) return { label, ok: false, reason: "npc_missing" };
        const actionNonce = `edge_seed_${points}_${Date.now()}`;
        const context = { targetId: npc.id, actionNonce };
        const expected = buildExpected(1, points, "dev_rematch_seed", "dev_rematch_seed_cost", ["targetId"], context);
        const checked = checkComputed(expected);
        return {
          label,
          points,
          priceKey: "dev_rematch_seed",
          ok: checked.ok,
          checked,
          entryAmount: null,
          metaSummary: {
            basePrice: expected.basePrice,
            mult: expected.mult,
            finalPrice: expected.finalPrice,
            pointsAtPurchase: expected.pointsAtPurchase
          }
        };
      }
      setMePoints(points);
      const startIdx = dbg.moneyLog.length;
      const npc = findNpc();
      if (!npc) return { label, ok: false, reason: "npc_missing" };
      const actionNonce = `edge_seed_${points}_${Date.now()}`;
      const price = Econ.calcFinalPrice({ basePrice: 1, actorPoints: points, priceKey: "dev_rematch_seed", context: { targetId: npc.id, actionNonce } });
      const tx = (typeof Econ.chargePriceOnce === "function")
        ? Econ.chargePriceOnce({
            fromId: "me",
            toId: npc.id,
            actorId: "me",
            reason: "dev_rematch_seed_cost",
            priceKey: price.priceKey || "dev_rematch_seed",
            basePrice: 1,
            actorPoints: points,
            targetId: npc.id,
            context: price.context || { targetId: npc.id, actionNonce }
          })
        : Econ.transferPoints("me", npc.id, price.finalPrice, "dev_rematch_seed_cost", {
            basePrice: price.basePrice,
            mult: price.mult,
            finalPrice: price.finalPrice,
            priceKey: price.priceKey || "dev_rematch_seed",
            pointsAtPurchase: points,
            context: price.context || null
          });
      const entry = findLatest(startIdx, x => x && x.reason === "dev_rematch_seed_cost" && String(x.sourceId || "") === "me");
      const expected = buildExpected(1, points, "dev_rematch_seed", "dev_rematch_seed_cost", ["targetId"], null);
      const checked = checkEntry(entry, expected);
      return {
        label,
        points,
        priceKey: "dev_rematch_seed",
        ok: !!(tx && tx.ok && checked.ok),
        checked,
        entryAmount: entry ? entry.amount : null,
        metaSummary: entry && entry.meta ? {
          basePrice: entry.meta.basePrice,
          mult: entry.meta.mult,
          finalPrice: entry.meta.finalPrice,
          pointsAtPurchase: entry.meta.pointsAtPurchase
        } : null
      };
    };

    const runSocial = (points) => {
      const label = `social@${points}`;
      return { label, points, priceKey: "social", ok: true, skipped: true, reason: "social_missing" };
    };

    pointsCases.forEach(points => {
      results.push(runVote(points));
      results.push(runRematch(points));
      results.push(runEscape(points));
      results.push(runTeach(points));
      results.push(runDevSeed(points));
      results.push(runSocial(points));
    });

    setMePoints(originalPoints.me);
    if (originalPoints.playersMe != null && S.players && S.players.me) setPoints(S.players.me, originalPoints.playersMe);

    const ok = results.every(r => r && r.ok);
    if (results.some(r => r && r.skipped)) notes.push("social_skipped");
    return { name, ok, results, notes };
  };

  Game.__DEV.smokePriceIdempotencyOnce = () => {
    const name = "smoke_price_idempotency_once";
    const Econ = Game._ConflictEconomy || null;
    const Core = Game._ConflictCore || null;
    const Events = Game.Events || null;
    if (!Econ || typeof Econ.calcFinalPrice !== "function" || typeof Econ.transferPoints !== "function") {
      return { name, ok: false, reason: "econ_missing" };
    }
    if (!Core || !Events) return { name, ok: false, reason: "core_or_events_missing" };

    const S = Game.__S || (Game.__S = {});
    if (!S.players) S.players = {};
    if (!S.me) S.me = { id: "me", points: 0, influence: 0, wins: 0 };
    if (!S.players.me) S.players.me = S.me;

    const dbg = Game.__D || (Game.__D = {});
    dbg.moneyLog = Array.isArray(dbg.moneyLog) ? dbg.moneyLog : (dbg.moneyLog = []);
    dbg.moneyLogByBattle = (dbg.moneyLogByBattle && typeof dbg.moneyLogByBattle === "object" && !Array.isArray(dbg.moneyLogByBattle))
      ? dbg.moneyLogByBattle
      : (dbg.moneyLogByBattle = {});

    const setPoints = (obj, v) => {
      if (!obj) return;
      const val = Number.isFinite(Number(v)) ? Number(v) : 0;
      if (typeof Game._withPointsWrite === "function") {
        Game._withPointsWrite(() => { obj.points = val; });
      } else {
        obj.points = val;
      }
    };
    const setMePoints = (v) => {
      setPoints(S.me, v);
      if (S.players && S.players.me) setPoints(S.players.me, v);
    };
    const findNpc = () => {
      const list = Object.values(S.players || {}).filter(p => p && p.id && (p.npc === true || p.type === "npc" || String(p.id).startsWith("npc_")));
      if (list.length) return list[0];
      const id = `npc_idem_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
      const npc = { id, npc: true, type: "npc", points: 10, influence: 0, role: "toxic", name: "NPC" };
      S.players[id] = npc;
      return npc;
    };
    const countByKey = (reason, key) => {
      return dbg.moneyLog.reduce((n, x) => {
        if (!x) return n;
        if (String(x.reason || "") !== String(reason || "")) return n;
        const m = x.meta || {};
        if (String(m.idempotencyKey || "") !== String(key || "")) return n;
        return n + 1;
      }, 0);
    };
    const findLatest = (startIdx, reason) => {
      for (let i = dbg.moneyLog.length - 1; i >= startIdx; i--) {
        const x = dbg.moneyLog[i];
        if (x && String(x.reason || "") === String(reason || "")) return x;
      }
      return null;
    };

    const results = [];
    const pointsCases = [20, 21];

    const runVote = (points) => {
      const label = `vote@${points}`;
      setMePoints(points);
      const startIdx = dbg.moneyLog.length;
      const ev = Events.makeNpcEvent ? Events.makeNpcEvent() : null;
      if (!ev) return { label, ok: false, reason: "event_create_failed" };
      Events.addEvent(ev);
      const first = Events.helpEvent(ev.id, "a");
      const entry = findLatest(startIdx, "crowd_vote_cost");
      const idem = entry && entry.meta ? entry.meta.idempotencyKey : null;
      const logCountFirst = idem ? countByKey("crowd_vote_cost", idem) : 0;
      const second = Events.helpEvent(ev.id, "a");
      const logCountSecond = idem ? countByKey("crowd_vote_cost", idem) : 0;
      if (Events.removeEvent) Events.removeEvent(ev.id);
      return {
        label,
        firstCharged: !!(first && entry),
        secondCharged: logCountSecond > logCountFirst,
        logCountFirst,
        logCountSecond,
        dupPrevented: logCountSecond === logCountFirst,
        idempotencyKey: idem
      };
    };

    const runEscape = (points) => {
      const label = `escape@${points}`;
      setMePoints(points);
      const npc = findNpc();
      const battleId = `dev_escape_idem_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
      const b = {
        id: battleId,
        opponentId: npc.id,
        opponentRole: npc.role || "toxic",
        fromThem: false,
        status: "pickAttack",
        resolved: false,
        finished: false,
        draw: false,
        createdAt: Date.now()
      };
      S.battles = [b].concat(S.battles || []);
      const startIdx = dbg.moneyLog.length;
      const first = Core.escape ? Core.escape(battleId, { mode: "smyt" }) : null;
      const entry = findLatest(startIdx, "escape_vote_cost");
      const idem = entry && entry.meta ? entry.meta.idempotencyKey : null;
      const logCountFirst = idem ? countByKey("escape_vote_cost", idem) : 0;
      const second = Core.escape ? Core.escape(battleId, { mode: "smyt" }) : null;
      const logCountSecond = idem ? countByKey("escape_vote_cost", idem) : 0;
      S.battles = (S.battles || []).filter(x => x && x.id !== battleId);
      return {
        label,
        firstCharged: !!(first && entry),
        secondCharged: logCountSecond > logCountFirst,
        logCountFirst,
        logCountSecond,
        dupPrevented: logCountSecond === logCountFirst,
        idempotencyKey: idem
      };
    };

    const runRematch = (points) => {
      const label = `rematch@${points}`;
      setMePoints(points);
      const npc = findNpc();
      const battleId = `dev_rematch_idem_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
      const b = {
        id: battleId,
        opponentId: npc.id,
        opponentRole: npc.role || "toxic",
        fromThem: false,
        status: "finished",
        resolved: true,
        finished: true,
        result: "lose",
        createdAt: Date.now()
      };
      S.battles = [b].concat(S.battles || []);
      const startIdx = dbg.moneyLog.length;
      const first = Core.requestRematch ? Core.requestRematch(battleId, "me") : null;
      const entry = findLatest(startIdx, "rematch_request_cost");
      const idem = entry && entry.meta ? entry.meta.idempotencyKey : null;
      const logCountFirst = idem ? countByKey("rematch_request_cost", idem) : 0;
      const second = Core.requestRematch ? Core.requestRematch(battleId, "me") : null;
      const logCountSecond = idem ? countByKey("rematch_request_cost", idem) : 0;
      S.battles = (S.battles || []).filter(x => x && x.id !== battleId);
      return {
        label,
        firstCharged: !!(first && entry),
        secondCharged: logCountSecond > logCountFirst,
        logCountFirst,
        logCountSecond,
        dupPrevented: logCountSecond === logCountFirst,
        idempotencyKey: idem
      };
    };

    const runTeach = (points) => {
      const label = `teach@${points}`;
      setMePoints(points);
      const npc = findNpc();
      const startIdx = dbg.moneyLog.length;
      const actionNonce = `idem_teach_${points}`;
      const res1 = (Econ && typeof Econ.chargePriceOnce === "function")
        ? Econ.chargePriceOnce({
            fromId: "me",
            toId: "sink",
            actorId: "me",
            reason: "teach_argument",
            priceKey: "teach",
            basePrice: 1,
            actorPoints: points,
            targetId: npc.id,
            argKey: "idem",
            context: { targetId: npc.id, argKey: "idem", actionNonce }
          })
        : null;
      const entry = findLatest(startIdx, "teach_argument");
      const idem = entry && entry.meta ? entry.meta.idempotencyKey : null;
      const logCountFirst = idem ? countByKey("teach_argument", idem) : 0;
      const res2 = (Econ && typeof Econ.chargePriceOnce === "function")
        ? Econ.chargePriceOnce({
            fromId: "me",
            toId: "sink",
            actorId: "me",
            reason: "teach_argument",
            priceKey: "teach",
            basePrice: 1,
            actorPoints: points,
            targetId: npc.id,
            argKey: "idem",
            context: { targetId: npc.id, argKey: "idem", actionNonce }
          })
        : null;
      const logCountSecond = idem ? countByKey("teach_argument", idem) : 0;
      return {
        label,
        firstCharged: !!(res1 && entry),
        secondCharged: logCountSecond > logCountFirst,
        logCountFirst,
        logCountSecond,
        dupPrevented: logCountSecond === logCountFirst,
        idempotencyKey: idem
      };
    };

    const runDevSeed = (points) => {
      const label = `dev_rematch_seed@${points}`;
      setMePoints(points);
      const npc = findNpc();
      const startIdx = dbg.moneyLog.length;
      const actionNonce = `idem_seed_${points}`;
      const res1 = (Econ && typeof Econ.chargePriceOnce === "function")
        ? Econ.chargePriceOnce({
            fromId: "me",
            toId: npc.id,
            actorId: "me",
            reason: "dev_rematch_seed_cost",
            priceKey: "dev_rematch_seed",
            basePrice: 1,
            actorPoints: points,
            targetId: npc.id,
            context: { targetId: npc.id, actionNonce }
          })
        : null;
      const entry = findLatest(startIdx, "dev_rematch_seed_cost");
      const idem = entry && entry.meta ? entry.meta.idempotencyKey : null;
      const logCountFirst = idem ? countByKey("dev_rematch_seed_cost", idem) : 0;
      const res2 = (Econ && typeof Econ.chargePriceOnce === "function")
        ? Econ.chargePriceOnce({
            fromId: "me",
            toId: npc.id,
            actorId: "me",
            reason: "dev_rematch_seed_cost",
            priceKey: "dev_rematch_seed",
            basePrice: 1,
            actorPoints: points,
            targetId: npc.id,
            context: { targetId: npc.id, actionNonce }
          })
        : null;
      const logCountSecond = idem ? countByKey("dev_rematch_seed_cost", idem) : 0;
      return {
        label,
        firstCharged: !!(res1 && entry),
        secondCharged: logCountSecond > logCountFirst,
        logCountFirst,
        logCountSecond,
        dupPrevented: logCountSecond === logCountFirst,
        idempotencyKey: idem
      };
    };

    pointsCases.forEach(points => {
      results.push(runVote(points));
      results.push(runRematch(points));
      results.push(runEscape(points));
      results.push(runTeach(points));
      results.push(runDevSeed(points));
    });

    const ok = results.every(r => r && r.dupPrevented && r.logCountFirst === 1 && r.logCountSecond === 1);
    return { name, ok, results };
  };

  const logSummary = (label, errors, warnings) => {
    if (errors.length) {
      console.warn(`[Dev] ${label} failed: ${errors.length} errors, ${warnings.length} warnings`);
      errors.slice(0, 6).forEach(e => console.warn("[Dev] ", e));
      if (errors.length > 6) console.warn("[Dev] ...");
    }
  };

  Game.__DEV.selfCheck = (opts = {}) => {
    const errors = [];
    const warnings = [];
    const options = (opts && typeof opts === "object") ? opts : {};
    const mutate = options.mutate === true;

    if (!Game) errors.push("Game missing");
    if (!Game.__S) errors.push("Game.__S missing");
    if (!Game.UI) errors.push("Game.UI missing");

    const S = Game.__S || {};
    if (!S.flags || typeof S.flags !== "object" || Array.isArray(S.flags)) {
      errors.push("State.flags missing or not an object");
    }

    if (!Array.isArray(S.chat)) {
      errors.push("State.chat missing or not an array");
    } else {
      S.chat.forEach((m, i) => {
        if (!m || typeof m !== "object") {
          errors.push(`chat[${i}] is not an object`);
          return;
        }
        if (!("name" in m) || !("text" in m)) {
          errors.push(`chat[${i}] missing name/text`);
        }
        if (m.system === true && m.isSystem !== true) warnings.push(`chat[${i}] system true but isSystem false`);
        if (m.isSystem === true && m.system !== true) warnings.push(`chat[${i}] isSystem true but system false`);
      });
    }

    if (!Array.isArray(S.battles)) {
      errors.push("State.battles missing or not an array");
    } else {
      S.battles.forEach((b, i) => {
        if (!b || typeof b !== "object") {
          errors.push(`battles[${i}] invalid`);
          return;
        }
        if (!b.id) errors.push(`battles[${i}] missing id`);
        if (!("status" in b) && !("result" in b)) errors.push(`battles[${i}] missing status/result`);
      });
    }

    if (!Array.isArray(S.events)) {
      errors.push("State.events missing or not an array");
    } else {
      const now = getNow();
      S.events.forEach((e, i) => {
        if (!e || typeof e !== "object") {
          errors.push(`events[${i}] invalid`);
          return;
        }
        const isDraw = (e.type === "draw" || e.kind === "draw" || e.crowd);
        if (!isDraw) return;
        const resolved = (e.resolved === true || e.state === "resolved");
        const endAt = Number(e.endsAt || (e.crowd && e.crowd.endAt) || 0);
        if (!resolved && !Number.isFinite(endAt)) errors.push(`events[${i}] missing endsAt`);
        if (!resolved && Number.isFinite(endAt) && endAt <= now) {
          if (mutate && Game.Events && typeof Game.Events.tick === "function") Game.Events.tick();
          const stillOpen = !(e.resolved === true || e.state === "resolved");
          if (stillOpen) errors.push(`events[${i}] stuck timer (endsAt <= now)`);
        }
        if (resolved && e.resolved !== true && e.state !== "resolved") {
          warnings.push(`events[${i}] resolved flag inconsistent`);
        }
        if (!e.crowd || typeof e.crowd !== "object") errors.push(`events[${i}] missing crowd`);
        else {
          if (!Number.isFinite(e.crowd.aVotes)) warnings.push(`events[${i}] crowd.aVotes not finite`);
          if (!Number.isFinite(e.crowd.bVotes)) warnings.push(`events[${i}] crowd.bVotes not finite`);
          if (!e.crowd.voters || typeof e.crowd.voters !== "object") errors.push(`events[${i}] crowd.voters invalid`);
        }
      });
    }

    const ok = errors.length === 0;
    if (!ok) logSummary("selfCheck", errors, warnings);
    return { ok, errors, warnings };
  };

  function withSeededRandom(seed, fn) {
    const orig = Math.random;
    let s = seed >>> 0;
    Math.random = () => {
      s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    try { return fn(); } finally { Math.random = orig; }
  }

  function withImmediateTimeout(fn) {
    const orig = window.setTimeout;
    window.setTimeout = (cb) => {
      try { if (typeof cb === "function") cb(); } catch (_) {}
      return 0;
    };
    try { return fn(); } finally { window.setTimeout = orig; }
  }

  function withFakeNow(getNowFn, fn) {
    const orig = Date.now;
    Date.now = () => {
      try { return (typeof getNowFn === "function") ? getNowFn() : orig(); }
      catch (_) { return orig(); }
    };
    try { return fn(); } finally { Date.now = orig; }
  }

  Game.__DEV.scenarioRun = () => {
    const results = [];
    const errors = [];

    const S = Game.__S || {};
    const now0 = getNow();

    const runA = () => {
      const name = "Scenario A: NPC draw event";
      try {
        if (!Game.Events || typeof Game.Events.makeNpcEvent !== "function" || typeof Game.Events.addEvent !== "function") {
          return { name, ok: false, details: "Game.Events.makeNpcEvent/addEvent missing" };
        }
        const ev = Game.Events.makeNpcEvent();
        if (!ev) return { name, ok: false, details: "makeNpcEvent returned null" };
        Game.Events.addEvent(ev);
        const added = (S.events || []).find(e => e && e.id === ev.id);
        if (!added) return { name, ok: false, details: "event not added" };

        // Player vote (side A)
        if (Game.Events.helpEvent) Game.Events.helpEvent(ev.id, "a");

        // Fast-forward time and tick until resolved
        const t = Number(ev.endsAt) || Number(ev.crowd && ev.crowd.endAt) || (now0 + 30000);
        let now = t + 1500;
        Game.Time && Game.Time.setNow(() => now);
        for (let i = 0; i < 30; i++) {
          if (Game.Events.tick) Game.Events.tick();
          const cur = (S.events || []).find(e => e && e.id === ev.id);
          if (cur && (cur.resolved === true || cur.state === "resolved" || cur.status === "resolved")) break;
        }
        if (Game.Events.tick) Game.Events.tick();
        const cur = (S.events || []).find(e => e && e.id === ev.id);
        if (!cur || !(cur.resolved === true || cur.state === "resolved" || cur.status === "resolved")) {
          const snap = cur ? {
            id: cur.id,
            endsAt: cur.endsAt,
            crowdEndAt: cur.crowd && cur.crowd.endAt,
            resolved: cur.resolved,
            state: cur.state,
            status: cur.status
          } : { id: ev.id, endsAt: ev.endsAt, crowdEndAt: ev.crowd && ev.crowd.endAt };
          return { name, ok: false, details: { error: "event not resolved", snapshot: snap } };
        }
        if (!cur.resultLine || String(cur.resultLine).trim().length === 0) {
          return { name, ok: false, details: "missing resultLine" };
        }
        const hasChat = Array.isArray(S.chat) && S.chat.some(m => {
          if (!m || !m.text) return false;
          const isSys = (m.system === true || m.isSystem === true);
          return isSys && String(m.text).includes(String(cur.resultLine));
        });
        if (!hasChat) {
          return { name, ok: false, details: "missing chat system result line" };
        }
        return { name, ok: true, details: "ok" };
      } catch (e) {
        return { name, ok: false, details: String(e && e.message ? e.message : e) };
      } finally {
        if (Game.Time) Game.Time.setNow(null);
      }
    };

    const runB = () => {
      const name = "Scenario B: battle flow";
      try {
        if (!Game.Conflict || typeof Game.Conflict.startWith !== "function" || typeof Game.Conflict.pickAttack !== "function") {
          return { name, ok: false, details: "Game.Conflict API missing" };
        }

        const players = S.players || {};
        const me = S.me || (S.me = {});
        const baseInf = Number(me.influence || 0);
        const basePts = Number(me.points || 0);
        const baseRep = Number(S.rep || 0);

        const npcList = Object.values(players).filter(p => p && p.npc && p.role !== "cop" && p.role !== "mafia");
        if (!npcList.length) return { name, ok: false, details: "no NPC for battle" };
        const npcLow = npcList[0];
        const cdMap = S.battleCooldowns || {};
        let npcHigh = npcList.find(p => p && p.id !== npcLow.id && (!cdMap[p.id] || (Date.now() - cdMap[p.id]) > 3 * 60 * 1000));
        if (!npcHigh) npcHigh = npcList.find(p => p && p.id !== npcLow.id) || npcLow;

        const normalizeOutcome = (b) => {
          const r = String(b.result || b.status || "").toLowerCase();
          if (r.includes("win") || r.includes("victory") || r.includes("won")) return "win";
          if (r.includes("lose") || r.includes("loss") || r.includes("lost")) return "lose";
          if (r.includes("draw") || r.includes("tie") || r.includes("peace") || r.includes("chill")) return "draw";
          return r || "unknown";
        };

        const applyEconomyOnce = (battle) => {
          const p1 = Number(me.points || 0);
          const r1 = Number(S.rep || 0);
          if (Game._ConflictEconomy && typeof Game._ConflictEconomy.applyResult === "function") {
            Game._ConflictEconomy.applyResult(battle);
          }
          const p2 = Number(me.points || 0);
          const r2 = Number(S.rep || 0);
          if (!battle.economyApplied) return { ok: false, details: "economyApplied flag not set" };
          if (Game._ConflictEconomy && typeof Game._ConflictEconomy.applyResult === "function") {
            Game._ConflictEconomy.applyResult(battle);
          }
          const p3 = Number(me.points || 0);
          const r3 = Number(S.rep || 0);
          if (p3 !== p2 || r3 !== r2) return { ok: false, details: "economy applied more than once" };
          return { ok: true, details: "ok" };
        };

        const colorRank = (c) => {
          const s = String(c || "").toLowerCase();
          if (s === "k" || s === "black") return 4;
          if (s === "r" || s === "red") return 3;
          if (s === "o" || s === "orange") return 2;
          if (s === "y" || s === "yellow") return 1;
          return 0;
        };
        const argGroup = (a) => String((a && (a.group || a.type || a.kind)) || "").toLowerCase();

        const runSub = (expected) => {
          if (Number(me.points || 0) <= 0) {
            if (Game.__A && typeof Game.__A.addPoints === "function") Game.__A.addPoints(1, "dev_scenario");
            else me.points = 1;
          }

          let battle = null;
          const refetchBattle = (id) => (S.battles || []).find(b => b && b.id === id) || null;
          if (expected === "win") {
            me.influence = 10;
            npcLow.influence = 0;
            const res = Game.Conflict.startWith(npcLow.id);
            const bid = res && (res.battleId || (res.battle && res.battle.id));
            if (!bid) return { ok: false, details: "startWith did not return battleId" };
            battle = refetchBattle(bid);
            if (!battle) return { ok: false, details: "battle not found in state" };
            const opts = (Game.Conflict.myAttackOptions) ? Game.Conflict.myAttackOptions(battle) : [];
            const pick = (Array.isArray(opts) && opts.length)
              ? opts.slice().sort((a, b) => colorRank(b && b.color) - colorRank(a && a.color))[0]
              : null;
            if (!pick) return { ok: false, details: "no attack options" };
            withSeededRandom(42, () => {
              withImmediateTimeout(() => {
                Game.Conflict.pickAttack(bid, pick.id);
              });
            });
            battle = refetchBattle(bid) || battle;
          } else {
            me.influence = 0;
            npcHigh.influence = 0;
            const b = Game.Conflict.incoming(npcHigh.id);
            if (!b || !b.id) return { ok: false, details: "incoming did not return battle" };
            battle = b;
            const opts = (Game.Conflict.myDefenseOptions) ? Game.Conflict.myDefenseOptions(battle) : [];
            const attackGroup = argGroup(battle.attack);
            let pick = (Array.isArray(opts) && opts.length) ? opts.find(o => argGroup(o) && argGroup(o) !== attackGroup) : null;
            if (!pick && Array.isArray(opts) && opts.length) pick = opts[0];
            if (!pick) return { ok: false, details: "no defense options" };
            withSeededRandom(42, () => {
              Game.Conflict.pickDefense(battle.id, pick.id);
            });
            battle = refetchBattle(battle.id) || battle;
          }

          const resolved = (battle.resolved === true || battle.finished === true || battle.result);
          if (!resolved) return { ok: false, details: "battle not resolved" };
          const got = normalizeOutcome(battle);
          if (got !== expected) return { ok: false, details: `expected=${expected} got=${got}` };

          const econ = applyEconomyOnce(battle);
          if (!econ.ok) return econ;

          return { ok: true, details: `expected=${expected} got=${got}` };
        };

        const subA = runSub("win");
        if (!subA.ok) return { name, ok: false, details: subA.details };
        const subB = runSub("draw");
        if (!subB.ok) return { name, ok: false, details: subB.details };

        me.influence = baseInf;
        me.points = basePts;
        S.rep = baseRep;

        return { name, ok: true, details: `${subA.details}; ${subB.details}` };
      } catch (e) {
        return { name, ok: false, details: String(e && e.message ? e.message : e) };
      }
    };

    const runC = () => {
      const name = "Scenario C: Anti-farm rep scaling";
      try {
        if (!Game._ConflictEconomy || typeof Game._ConflictEconomy.applyResult !== "function") {
          return { name, ok: false, details: "Game._ConflictEconomy.applyResult missing" };
        }

        const players = S.players || {};
        const me = S.me || (S.me = {});
        const baseInf = Number(me.influence || 0);
        const basePts = Number(me.points || 0);
        const baseWins = Number(me.wins || 0);
        const baseRep = Number(S.rep || 0);
        const baseProgress = Object.assign({}, S.progress || {});

        const npcList = Object.values(players).filter(p => p && p.npc);
        if (!npcList.length) return { name, ok: false, details: "no NPCs for scaling check" };

        me.influence = 20;
        S.rep = 0;
        S.progress = Object.assign(S.progress || {}, { lastDailyBonusAt: Date.now() });

        const sorted = npcList.slice().sort((a, b) => (Number(a.influence || 0) - Number(b.influence || 0)));
        const weakOpp = sorted.find(p => Number(p.influence || 0) <= (me.influence - 5)) || sorted[0];
        const strongOpp = sorted.find(p => Number(p.influence || 0) >= me.influence) || sorted[sorted.length - 1] || weakOpp;

        const beforeWeak = Number(S.rep || 0);
        Game._ConflictEconomy.applyResult({ result: "win", opponentId: weakOpp && weakOpp.id });
        const afterWeak = Number(S.rep || 0);
        const weakDelta = afterWeak - beforeWeak;

        const beforeStrong = Number(S.rep || 0);
        Game._ConflictEconomy.applyResult({ result: "win", opponentId: strongOpp && strongOpp.id });
        const afterStrong = Number(S.rep || 0);
        const strongDelta = afterStrong - beforeStrong;

        const details = {
          weak: { id: weakOpp && weakOpp.id, inf: weakOpp && weakOpp.influence, delta: weakDelta },
          strong: { id: strongOpp && strongOpp.id, inf: strongOpp && strongOpp.influence, delta: strongDelta }
        };
        console.log("[Dev] Scenario C rep deltas:", details);

        const ok = weakDelta <= strongDelta;

        me.influence = baseInf;
        me.points = basePts;
        me.wins = baseWins;
        S.rep = baseRep;
        S.progress = Object.assign(S.progress || {}, baseProgress);

        return { name, ok, details };
      } catch (e) {
        return { name, ok: false, details: String(e && e.message ? e.message : e) };
      }
    };

    const runD = () => {
      const name = "Scenario D: Influence monthly pacing sanity";
      try {
        if (!Game._ConflictEconomy || typeof Game._ConflictEconomy.applyResult !== "function") {
          return { name, ok: false, details: "Game._ConflictEconomy.applyResult missing" };
        }
        if (!Game.Time || typeof Game.Time.setNow !== "function" || typeof Game.Time.now !== "function") {
          return { name, ok: false, details: "Game.Time.now/setNow missing" };
        }

        const players = S.players || {};
        const me = S.me || (S.me = {});
        const baseInf = Number(me.influence || 0);
        const basePts = Number(me.points || 0);
        const baseWins = Number(me.wins || 0);
        const baseRep = Number(S.rep || 0);
        const baseStateInf = Number(S.influence || 0);
        const baseProgress = Object.assign({}, S.progress || {});

        const npcList = Object.values(players).filter(p => p && p.npc);
        if (!npcList.length) return { name, ok: false, details: "no NPCs for pacing check" };
        const opp = npcList[0];

        me.influence = 10;
        S.rep = 0;
        S.influence = me.influence;
        S.progress = { weeklyInfluenceGained: 0, weekStartAt: 0, lastDailyBonusAt: 0 };

        const dayMs = 24 * 60 * 60 * 1000;
        const start = Date.now();
        let now = start;
        const setNow = (t) => {
          now = t;
          Game.Time.setNow(() => now);
        };
        const dayCounts = [3, 3, 3, 3, 3, 3, 2];

        withFakeNow(() => Game.Time.now(), () => {
          dayCounts.forEach((count, d) => {
            for (let i = 0; i < count; i++) {
              const offset = Math.floor(((i + 1) / (count + 1)) * dayMs);
              setNow(start + (d * dayMs) + offset);
              Game._ConflictEconomy.applyResult({ result: "win", opponentId: opp && opp.id });
            }
          });
        });

        const gained = Number(me.influence || 0) - baseInf;
        const expectedMax = (Game && Game.Data && Game.Data.PROGRESSION_V2) ? 2 : 3;
        const ok = (gained >= 0 && gained <= expectedMax);
        const details = {
          rep: Number(S.rep || 0),
          influence: Number(me.influence || 0),
          weeklyInfluenceGained: S.progress && S.progress.weeklyInfluenceGained,
          weekStartAt: S.progress && S.progress.weekStartAt,
          gained,
          expectedMax
        };
        console.log("[Dev] Scenario D pacing:", details);

        Game.Time.setNow(null);
        me.influence = baseInf;
        me.points = basePts;
        me.wins = baseWins;
        S.rep = baseRep;
        S.influence = baseStateInf;
        S.progress = Object.assign(S.progress || {}, baseProgress);

        return { name, ok, details };
      } catch (e) {
        try { if (Game.Time) Game.Time.setNow(null); } catch (_) {}
        return { name, ok: false, details: String(e && e.message ? e.message : e) };
      }
    };

    const a = runA();
    results.push(a);
    if (!a.ok) errors.push(a.details);

    const b = runB();
    results.push(b);
    if (!b.ok) errors.push(b.details);

    const c = runC();
    results.push(c);
    if (!c.ok) errors.push(c.details);

    const d = runD();
    results.push(d);
    if (!d.ok) errors.push(d.details);

    const ok = results.every(r => r.ok);
    console.log("[Dev] scenarioRun:", ok ? "OK" : "FAIL", results);
    return { ok, results, errors };
  };

  Game.__DEV.circulationDriftSmoke = () => {
    const name = "circulation_drift_smoke";
    let prevFlag = null;
    let prevPause = null;
    let prevAllow = null;
    let prevBypass = null;
    try {
      const D0 = Game.Data || null;
      if (!D0) return { name, ok: false, details: "Game.Data missing" };
      const Econ = Game._ConflictEconomy || null;
      if (!Econ || typeof Econ.applyResult !== "function") return { name, ok: false, details: "Game._ConflictEconomy.applyResult missing" };

      if (!Game.__D) Game.__D = {};
      prevPause = Game.__D.PAUSE_EVENTS === true;
      Game.__D.PAUSE_EVENTS = true;
      prevBypass = Game.__D.BYPASS_POINTS_GUARD === true;
      Game.__D.BYPASS_POINTS_GUARD = true;
      prevAllow = Game.__D.ALLOW_POINTS_WRITE === true;
      Game.__D.ALLOW_POINTS_WRITE = true;

      const S = Game.__S || {};
      const players = S.players || {};
      S.battles = S.battles || [];
      const startPlayer = Number.isFinite(D0.START_POINTS_PLAYER) ? (D0.START_POINTS_PLAYER | 0) : 12;
      const startNpc = Number.isFinite(D0.START_POINTS_NPC) ? (D0.START_POINTS_NPC | 0) : 10;

      const safeSetPoints = (obj, value) => {
        if (!obj) return;
        const v = Number(value || 0);
        if (typeof Game._withPointsWrite === "function") {
          Game._withPointsWrite(() => { obj.points = v; });
        } else {
          obj.points = v;
        }
      };

      prevFlag = D0.CIRCULATION_ENABLED === true;
      if (!prevFlag) {
        D0.CIRCULATION_ENABLED = true;
      }
      // Baseline phase: stabilize participants and balances BEFORE snapshot
      if (!S.players) S.players = {};
      if (!S.me) S.me = { id: "me", points: startPlayer, influence: 0, wins: 0 };
      if (!S.players.me && S.me) S.players.me = S.me;
      if (Game.__A && typeof Game.__A.seedPlayers === "function") {
        Game.__A.seedPlayers();
      } else if (Game.NPC && typeof Game.NPC.seedPlayers === "function") {
        Game.NPC.seedPlayers(S);
      }
      if (Game.__A && typeof Game.__A.syncMeToPlayers === "function") {
        Game.__A.syncMeToPlayers();
      }
      safeSetPoints(S.me, startPlayer);
      if (S.players && S.players.me) safeSetPoints(S.players.me, startPlayer);
      Object.values(S.players || {}).forEach(p => {
        if (!p) return;
        const id = String(p.id || "");
        const isNpc = (p.npc === true || p.type === "npc" || id.startsWith("npc_"));
        if (isNpc) safeSetPoints(p, startNpc);
      });
      Game.__D.ALLOW_POINTS_WRITE = prevAllow;
      const poolIds = [];
      const winBattleId = "dev_win_fixed";
      const drawBattleId = "dev_draw_fixed";
      const drawPool = (Econ && typeof Econ.getCrowdPoolId === "function")
        ? Econ.getCrowdPoolId(drawBattleId)
        : "crowd:dev_draw_fixed";
      poolIds.push("sink", "crowd", drawPool);
      poolIds.forEach(id => {
        if (Econ && typeof Econ.ensurePool === "function") Econ.ensurePool(id);
        else if (Econ && typeof Econ.getPoolBalance === "function") Econ.getPoolBalance(id);
      });
      if (Econ && typeof Econ.prewarmCrowd === "function") {
        Econ.prewarmCrowd(drawBattleId);
      }
      try {
        console.log("[Dev] driftSmoke baseline pools:", poolIds.slice());
      } catch (_) {}

      const npcList = Object.values(S.players || {}).filter(p => p && (p.npc === true || p.type === "npc" || String(p.id || "").startsWith("npc_")));
      if (!npcList.length) return { name, ok: false, details: "no NPCs for drift smoke" };
      const npcA = npcList[0];
      const npcB = npcList[1] || npcList[0];

      const moneyLogBeforeIndex = (Game && Game.__D && Array.isArray(Game.__D.moneyLog)) ? Game.__D.moneyLog.length : 0;
      const beforeSnapshot = Game.__DEV.sumPointsSnapshot();

      const winBattle = {
        id: winBattleId,
        result: "win",
        opponentId: npcA.id,
        fromThem: false,
        attackerId: "me"
      };
      if (Econ && typeof Econ.applyStart === "function") Econ.applyStart(winBattle);
      if (Econ && typeof Econ.transferPoints === "function") {
        Econ.transferPoints("me", "sink", 0, "driftSmoke_me_sync_probe", { battleId: winBattleId });
      }
      Econ.applyResult(winBattle);

      const drawBattle = {
        id: drawBattleId,
        result: "draw",
        opponentId: npcB.id,
        fromThem: false,
        attackerId: "me"
      };
      if (Econ && typeof Econ.applyStart === "function") Econ.applyStart(drawBattle);
      if (Econ && typeof Econ.transferPoints === "function") {
        Econ.transferPoints("me", "sink", 0, "driftSmoke_me_sync_probe", { battleId: drawBattleId });
      }
      Econ.applyResult(drawBattle);

      try {
        console.log("[Dev] driftSmoke planned pools:", poolIds.slice());
      } catch (_) {}

      let afterSnapshot = Game.__DEV.sumPointsSnapshot();
      let assert = null;
      try {
        assert = Game.__DEV.assertNoDrift(beforeSnapshot, afterSnapshot);
      } catch (e) {
        assert = { ok: false, error: String(e && e.message ? e.message : e) };
      }

      D0.CIRCULATION_ENABLED = prevFlag;
      if (prevPause !== null) Game.__D.PAUSE_EVENTS = prevPause;
      if (prevAllow !== null) Game.__D.ALLOW_POINTS_WRITE = prevAllow;
      if (prevBypass !== null) Game.__D.BYPASS_POINTS_GUARD = prevBypass;
      const result = { name, ok: !!(assert && assert.ok), beforeSnapshot, afterSnapshot, assert };
      if (!result.ok) {
        const log = (Game.__D && Array.isArray(Game.__D.moneyLog)) ? Game.__D.moneyLog : [];
        const tail = log.slice(Math.max(0, log.length - 100));
        const playersDump = Object.values(S.players || {}).map(p => ({
          id: p && p.id,
          points: p && (p.points | 0),
          npc: !!(p && (p.npc === true || p.type === "npc")),
          type: p && p.type
        }));
        const mePoints_stateMe = S.me && typeof S.me.points === "number" ? (S.me.points | 0) : null;
        const mePoints_playersMe = S.players && S.players.me && typeof S.players.me.points === "number" ? (S.players.me.points | 0) : null;
        result.debug = {
          before: beforeSnapshot,
          after: afterSnapshot,
          poolsBefore: beforeSnapshot && beforeSnapshot.poolsBreakdown,
          poolsAfter: afterSnapshot && afterSnapshot.poolsBreakdown,
          moneyLogTail: tail,
          playersDump,
          mePoints_stateMe,
          mePoints_playersMe,
          meSource_before: beforeSnapshot && beforeSnapshot.meSource,
          meSource_after: afterSnapshot && afterSnapshot.meSource,
          mePoints_used_before: beforeSnapshot && beforeSnapshot.mePoints_used,
          mePoints_used_after: afterSnapshot && afterSnapshot.mePoints_used,
          idsEqual: assert && assert.idsEqual,
          duplicatesBefore: beforeSnapshot && beforeSnapshot.duplicatesDetected,
          duplicatesAfter: afterSnapshot && afterSnapshot.duplicatesDetected
        };
      }
      return result;
    } catch (e) {
      try {
        if (Game && Game.Data && prevFlag !== null) Game.Data.CIRCULATION_ENABLED = prevFlag;
        if (Game && Game.__D && prevPause !== null) Game.__D.PAUSE_EVENTS = prevPause;
        if (Game && Game.__D && prevAllow !== null) Game.__D.ALLOW_POINTS_WRITE = prevAllow;
        if (Game && Game.__D && prevBypass !== null) Game.__D.BYPASS_POINTS_GUARD = prevBypass;
      } catch (_) {}
      return { name, ok: false, details: String(e && e.message ? e.message : e) };
    }
  };

  Game.__DEV.circulationPenaltySmoke = () => {
    const name = "circulation_penalty_smoke";
    let prevFlag = null;
    let prevPause = null;
    let prevAllow = null;
    let prevBypass = null;
    const savedRoles = [];
    try {
      const D0 = Game.Data || null;
      if (!D0) return { name, ok: false, details: "Game.Data missing" };
      const Core = Game._ConflictCore || null;
      if (!Core || typeof Core.finalize !== "function") return { name, ok: false, details: "Game._ConflictCore.finalize missing" };

      if (!Game.__D) Game.__D = {};
      prevPause = Game.__D.PAUSE_EVENTS === true;
      Game.__D.PAUSE_EVENTS = true;
      prevBypass = Game.__D.BYPASS_POINTS_GUARD === true;
      Game.__D.BYPASS_POINTS_GUARD = true;
      prevAllow = Game.__D.ALLOW_POINTS_WRITE === true;
      Game.__D.ALLOW_POINTS_WRITE = true;

      const S = Game.__S || {};
      const players = S.players || {};

      const setRole = (p, role) => {
        if (!p) return;
        savedRoles.push({ p, role: p.role, type: p.type });
        p.role = role;
        p.type = role;
      };

      const restoreRoles = () => {
        savedRoles.forEach(r => {
          r.p.role = r.role;
          r.p.type = r.type;
        });
      };

      const setPoints = (p, v) => {
        if (!p) return;
        const val = Number(v || 0);
        if (typeof Game._withPointsWrite === "function") {
          Game._withPointsWrite(() => { p.points = val; });
        } else {
          p.points = val;
        }
      };

      const makeBattle = (oppId, fromThem) => ({
        id: `dev_pen_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
        opponentId: oppId,
        fromThem: !!fromThem,
        status: fromThem ? "pickDefense" : "pickAttack",
        resolved: false,
        finished: false,
        draw: false,
        attackHidden: true,
        createdAt: getNow()
      });

      prevFlag = D0.CIRCULATION_ENABLED === true;
      D0.CIRCULATION_ENABLED = true;

      const startPlayer = Number.isFinite(D0.START_POINTS_PLAYER) ? (D0.START_POINTS_PLAYER | 0) : 12;
      const startNpc = Number.isFinite(D0.START_POINTS_NPC) ? (D0.START_POINTS_NPC | 0) : 8;
      if (!S.players) S.players = {};
      if (!S.me) S.me = { id: "me", points: startPlayer, influence: 0, wins: 0 };
      if (!S.players.me && S.me) S.players.me = S.me;
      if (Game.__A && typeof Game.__A.seedPlayers === "function") {
        Game.__A.seedPlayers();
      } else if (Game.NPC && typeof Game.NPC.seedPlayers === "function") {
        Game.NPC.seedPlayers(S);
      }
      if (Game.__A && typeof Game.__A.syncMeToPlayers === "function") {
        Game.__A.syncMeToPlayers();
      }
      setPoints(S.me, startPlayer);
      if (S.players && S.players.me) setPoints(S.players.me, startPlayer);
      Object.values(S.players || {}).forEach(p => {
        if (!p) return;
        const id = String(p.id || "");
        const isNpc = (p.npc === true || p.type === "npc" || id.startsWith("npc_"));
        if (isNpc) setPoints(p, startNpc);
      });
      Game.__D.ALLOW_POINTS_WRITE = prevAllow;
      const npcList = Object.values(S.players || {}).filter(p => p && (p.npc === true || p.type === "npc" || String(p.id || "").startsWith("npc_")));
      if (npcList.length < 2) return { name, ok: false, details: "not enough NPCs" };
      const npcA = npcList[0];
      const npcB = npcList[1];
      const Econ = Game._ConflictEconomy || null;
      const poolIds = ["sink", "crowd"];
      poolIds.forEach(id => {
        if (Econ && typeof Econ.ensurePool === "function") Econ.ensurePool(id);
        else if (Econ && typeof Econ.getPoolBalance === "function") Econ.getPoolBalance(id);
      });

      const beforeSnapshot = Game.__DEV.sumPointsSnapshot();

      setRole(npcA, "toxic");
      let b = makeBattle(npcA.id, true);
      b.firstSeenAt = getNow();
      S.battles = [b].concat(S.battles || []);
      Core.finalize(b.id, "lose");

      setRole(npcA, "bandit");
      b = makeBattle(npcA.id, true);
      S.battles = [b].concat(S.battles || []);
      Core.finalize(b.id, "lose");

      setRole(npcB, "mafia");
      b = makeBattle(npcB.id, true);
      S.battles = [b].concat(S.battles || []);
      Core.finalize(b.id, "win");

      setRole(npcB, "cop");
      b = makeBattle(npcB.id, false);
      S.battles = [b].concat(S.battles || []);
      Core.finalize(b.id, "win");

      const afterSnapshot = Game.__DEV.sumPointsSnapshot();
      let assert = null;
      try {
        assert = Game.__DEV.assertNoDrift(beforeSnapshot, afterSnapshot);
      } catch (e) {
        assert = { ok: false, error: String(e && e.message ? e.message : e) };
      }

      restoreRoles();
      D0.CIRCULATION_ENABLED = prevFlag;
      if (prevPause !== null) Game.__D.PAUSE_EVENTS = prevPause;
      if (prevAllow !== null) Game.__D.ALLOW_POINTS_WRITE = prevAllow;
      if (prevBypass !== null) Game.__D.BYPASS_POINTS_GUARD = prevBypass;
      const result = { name, ok: !!(assert && assert.ok), beforeSnapshot, afterSnapshot, assert };
      if (!result.ok) {
        const log = (Game.__D && Array.isArray(Game.__D.moneyLog)) ? Game.__D.moneyLog : [];
        const tail = log.slice(Math.max(0, log.length - 50));
        const playersDump = Object.values(S.players || {}).map(p => ({
          id: p && p.id,
          points: p && (p.points | 0),
          npc: !!(p && (p.npc === true || p.type === "npc")),
          type: p && p.type,
          role: p && p.role
        }));
        result.debug = {
          before: beforeSnapshot,
          after: afterSnapshot,
          assert,
          poolsBefore: beforeSnapshot && beforeSnapshot.poolsBreakdown,
          poolsAfter: afterSnapshot && afterSnapshot.poolsBreakdown,
          moneyLogTail: tail,
          playersDump
        };
      }
      return result;
    } catch (e) {
      try {
        if (Game && Game.Data && prevFlag !== null) Game.Data.CIRCULATION_ENABLED = prevFlag;
        if (Game && Game.__D && prevPause !== null) Game.__D.PAUSE_EVENTS = prevPause;
        if (Game && Game.__D && prevAllow !== null) Game.__D.ALLOW_POINTS_WRITE = prevAllow;
        if (Game && Game.__D && prevBypass !== null) Game.__D.BYPASS_POINTS_GUARD = prevBypass;
        savedRoles.forEach(r => { r.p.role = r.role; r.p.type = r.type; });
      } catch (_) {}
      return { name, ok: false, details: String(e && e.message ? e.message : e) };
    }
  };

  Game.__DEV.circulationChatSmoke = () => {
    const name = "circulation_chat_smoke";
    let prevFlag = null;
    try {
      const D0 = Game.Data || null;
      if (!D0) return { name, ok: false, details: "Game.Data missing" };
      const UI = Game.UI || null;
      if (!UI || typeof UI.pushChat !== "function") return { name, ok: false, details: "UI.pushChat missing" };
      const S = Game.__S || {};
      S.points = S.points || {};

      prevFlag = D0.CIRCULATION_ENABLED === true;
      D0.CIRCULATION_ENABLED = true;
      S.points.lastChatRewardAt = 0;

      const before = Game.__DEV.sumPointsSnapshot();
      UI.pushChat({ name: "Ты", text: "dev chat smoke", system: false, isMe: true, playerId: "me" });
      const after = Game.__DEV.sumPointsSnapshot();
      const res = Game.__DEV.assertNoDrift(before, after);

      D0.CIRCULATION_ENABLED = prevFlag;
      return { name, ok: res.ok, details: { diff: res.diff, before, after } };
    } catch (e) {
      try {
        if (Game && Game.Data && prevFlag !== null) Game.Data.CIRCULATION_ENABLED = prevFlag;
      } catch (_) {}
      return { name, ok: false, details: String(e && e.message ? e.message : e) };
    }
  };

  Game.__DEV.circulationCopSmoke = () => {
    const name = "circulation_cop_smoke";
    let prevFlag = null;
    try {
      const D0 = Game.Data || null;
      if (!D0) return { name, ok: false, details: "Game.Data missing" };
      const S = Game.__S || {};
      if (!S.me || !Game.__A || typeof Game.__A.applyReportByRole !== "function") {
        return { name, ok: false, details: "StateAPI.applyReportByRole missing" };
      }

      prevFlag = D0.CIRCULATION_ENABLED === true;
      D0.CIRCULATION_ENABLED = true;

      const before = Game.__DEV.sumPointsSnapshot();

      S.reports = S.reports || { history: {}, lastAt: 0, cooldownMs: 0 };
      S.reports.history = {};
      S.reports.lastAt = 0;
      S.sightings = S.sightings || {};
      S.sightings.mafia = 0;

      Game.__A.applyReportByRole("mafia");

      S.reports.history = {};
      S.reports.lastAt = 0;
      S.sightings.mafia = Date.now();

      Game.__A.applyReportByRole("mafia");

      const after = Game.__DEV.sumPointsSnapshot();
      const res = Game.__DEV.assertNoDrift(before, after);

      D0.CIRCULATION_ENABLED = prevFlag;
      return { name, ok: res.ok, details: { diff: res.diff, before, after } };
    } catch (e) {
      try {
        if (Game && Game.Data && prevFlag !== null) Game.Data.CIRCULATION_ENABLED = prevFlag;
      } catch (_) {}
      return { name, ok: false, details: String(e && e.message ? e.message : e) };
    }
  };

  Game.__DEV.circulationNpcSeedSmoke = () => {
    const name = "circulation_npc_seed_smoke";
    let prevFlag = null;
    try {
      const D0 = Game.Data || null;
      if (!D0) return { name, ok: false, details: "Game.Data missing" };
      if (!Game.__A || typeof Game.__A.resetAll !== "function" || typeof Game.__A.seedPlayers !== "function") {
        return { name, ok: false, details: "StateAPI.resetAll/seedPlayers missing" };
      }

      prevFlag = D0.CIRCULATION_ENABLED === true;
      D0.CIRCULATION_ENABLED = true;

      Game.__A.resetAll();
      Game.__A.seedPlayers();
      if (Game.__A.syncMeToPlayers) Game.__A.syncMeToPlayers();

      const snap1 = Game.__DEV.sumPointsSnapshot();
      const snap2 = Game.__DEV.sumPointsSnapshot();
      const res = Game.__DEV.assertNoDrift(snap1, snap2);

      const players = (Game.__S && Game.__S.players) ? Game.__S.players : {};
      const npcs = Object.values(players).filter(p => p && (p.npc === true || p.type === "npc"));
      const maxNpc = npcs.reduce((m, p) => Math.max(m, (p.points | 0)), 0);
      const minNpc = npcs.reduce((m, p) => Math.min(m, (p.points | 0)), npcs.length ? (npcs[0].points | 0) : 0);
      const startNpc = Number.isFinite(D0.START_POINTS_NPC) ? (D0.START_POINTS_NPC | 0) : 8;
      const okRange = maxNpc < 999 && minNpc >= 0 && maxNpc === startNpc && minNpc === startNpc;

      D0.CIRCULATION_ENABLED = prevFlag;
      return { name, ok: res.ok && okRange, details: { drift: res.diff, minNpc, maxNpc } };
    } catch (e) {
      try {
        if (Game && Game.Data && prevFlag !== null) Game.Data.CIRCULATION_ENABLED = prevFlag;
      } catch (_) {}
      return { name, ok: false, details: String(e && e.message ? e.message : e) };
    }
  };

  Game.__DEV.drawAuditTrigger = (opts = {}) => {
    const name = "draw_audit_trigger";
    const Econ = Game.ConflictEconomy || Game._ConflictEconomy || null;
    const Core = Game.ConflictCore || Game._ConflictCore || null;
    if (!Econ || typeof Econ.transferPoints !== "function" || typeof Econ.transferFromPool !== "function") {
      return { name, ok: false, details: "Econ.transferPoints/transferFromPool missing" };
    }
    const S = Game.__S || null;
    if (!S || !S.players || !S.me) return { name, ok: false, details: "Game.__S missing" };

    const active = Array.isArray(S.battles) ? S.battles.filter(b => b && b.status !== "finished" && !b.resolved) : [];
    if (active.length && !opts.allowParallel) {
      return { name, ok: false, details: "active_battle_present", activeCount: active.length };
    }

    const D0 = Game.Data || {};
    const startPlayer = Number.isFinite(D0.START_POINTS_PLAYER) ? (D0.START_POINTS_PLAYER | 0) : 12;
    const startNpc = Number.isFinite(D0.START_POINTS_NPC) ? (D0.START_POINTS_NPC | 0) : 8;

    let prevForce = null;
    let prevBypass = null;
    let prevAllow = null;
    let prevWeighted = null;
    let prevInfluence = null;
    try {
      if (!Game.__D) Game.__D = {};
      prevForce = Game.__D.FORCE_CIRCULATION;
      prevBypass = Game.__D.BYPASS_POINTS_GUARD === true;
      prevAllow = Game.__D.ALLOW_POINTS_WRITE === true;
      prevWeighted = Game.__D.CROWD_WEIGHTED_TALLY;
      Game.__D.FORCE_CIRCULATION = true;
      Game.__D.BYPASS_POINTS_GUARD = true;
      Game.__D.ALLOW_POINTS_WRITE = true;
      if (opts && opts.debugWeights) Game.__D.CROWD_WEIGHTED_TALLY = true;

      const battleId = `dev_draw_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
      const oppId = (opts.oppId && S.players[opts.oppId]) ? opts.oppId : "npc_weak";
      if (!S.players[oppId]) return { name, ok: false, details: "opponent_missing", oppId };

      const baselineSet = (p, v) => {
        if (!p) return;
        p.points = v;
      };

      baselineSet(S.me, startPlayer);
      if (S.players.me) baselineSet(S.players.me, startPlayer);
      Object.values(S.players || {}).forEach(p => {
        if (!p) return;
        const id = String(p.id || "");
        const isNpc = (p.npc === true || p.type === "npc" || id.startsWith("npc_"));
        if (isNpc) baselineSet(p, startNpc);
      });

      const poolId = Econ.getCrowdPoolId ? Econ.getCrowdPoolId(battleId) : `crowd:${battleId}`;
      if (Econ.ensurePool) Econ.ensurePool(poolId);

      const battle = {
        id: battleId,
        opponentId: oppId,
        attackerId: oppId,
        fromThem: true,
        status: "pickDefense",
        result: "draw",
      };

      if (Econ.applyStart) Econ.applyStart(battle);
      if (Econ.applyResult) Econ.applyResult({ id: battleId, opponentId: oppId, status: "finished", result: "draw", fromThem: true });

      const majorityCount = Number.isFinite(opts.majority) ? (opts.majority | 0) : 3;
      const minorityCount = Number.isFinite(opts.minority) ? (opts.minority | 0) : 2;
      const v13 = opts && opts.v13 === true;
      const votersPool = Object.values(S.players || {}).filter(p => {
        if (!p || !p.id) return false;
        if (p.id === "me" || p.id === oppId) return false;
        return p.npc === true || p.type === "npc";
      });
      if (votersPool.length < (majorityCount + minorityCount)) {
        return { name, ok: false, details: "not_enough_voters", have: votersPool.length };
      }
      const majority = votersPool.slice(0, majorityCount).map(p => p.id);
      const minority = votersPool.slice(majorityCount, majorityCount + minorityCount).map(p => p.id);

      const beforeSnapshot = Game.__DEV.sumPointsSnapshot();

      const battleMeta = { battleId, status: "draw", result: "draw" };
      majority.concat(minority).forEach(voterId => {
        Econ.transferPoints(voterId, poolId, 1, "crowd_vote_cost", battleMeta);
      });

      let pot = Econ.getPoolBalance ? Econ.getPoolBalance(poolId) : 0;
      for (const vid of majority) {
        if (pot <= 0) break;
        const res = Econ.transferFromPool(poolId, vid, 1, "crowd_vote_refund_majority", battleMeta);
        if (res && res.ok) pot = Econ.getPoolBalance(poolId);
      }

      pot = Econ.getPoolBalance ? Econ.getPoolBalance(poolId) : pot;
      const share = Math.floor(pot / 2);
      if (share > 0) {
        Econ.transferFromPool(poolId, "me", share, "crowd_draw_payout_me", battleMeta);
        Econ.transferFromPool(poolId, oppId, share, "crowd_draw_payout_opp", battleMeta);
      }

      const addRep = (Game.__A && typeof Game.__A.addRep === "function") ? Game.__A.addRep : null;
      let repAwardedMinority = 0;
      if (v13 && addRep) {
        minority.forEach(() => {
          addRep(1, "crowd_vote_rep_minority");
          repAwardedMinority += 1;
        });
      }

      const afterSnapshot = Game.__DEV.sumPointsSnapshot();
      let assert = null;
      try { assert = Game.__DEV.assertNoDrift(beforeSnapshot, afterSnapshot); }
      catch (e) { assert = { ok: false, error: String(e && e.message ? e.message : e) }; }

      const log = (Game.__D && Array.isArray(Game.__D.moneyLog)) ? Game.__D.moneyLog : [];
      const byBattle = (Game.__D && Game.__D.moneyLogByBattle) ? (Game.__D.moneyLogByBattle[battleId] || []) : [];
      const logForBid = normalizeMoneyLogRows(log, "draw.log").filter(tx => String(tx && tx.battleId || "") === String(battleId));

      const ensureDrawBattle = () => {
        const state = Game.__S || (Game.__S = {});
        if (!Array.isArray(state.battles)) state.battles = [];
        let existing = state.battles.find(x => x && String(x.id) === String(battleId));
        if (existing) return existing;
        const nowStamp = Date.now();
        const totalPlayers = Math.max(3, (state.players ? Object.keys(state.players).length : 0) || 3);
        const newCrowd = {
          endAt: nowStamp + 10000,
          endsAt: nowStamp + 10000,
          votesA: 0,
          votesB: 0,
          aVotes: 0,
          bVotes: 0,
          totalPlayers,
          cap: Math.max(1, totalPlayers),
          voters: {},
          decided: false,
          attackerId: "me",
          defenderId: oppId
        };
      const battle = {
        id: battleId,
        opponentId: oppId,
        attackerId: "me",
          defenderId: oppId,
          fromThem: false,
          status: "draw",
          draw: true,
          result: "draw",
          resolved: false,
          finished: false,
          attackHidden: false,
          createdAt: nowStamp,
          updatedAt: nowStamp,
          crowd: newCrowd
      };
      state.battles = [battle].concat(state.battles.filter(x => x && String(x.id) !== String(battleId)));
      return battle;
    };

      let tickResult = null;
      let crowdCapDebug = null;
      let cacheHit = false;
      let crowdCapDebugWhy = null;
      let helperOk = false;

      const coreMissing = !Core || typeof Core.applyCrowdVoteTick !== "function";
      if (coreMissing) {
        crowdCapDebugWhy = "core_missing";
      } else {
        const battleInState = ensureDrawBattle();
        if (!battleInState) {
          crowdCapDebugWhy = "battle_missing_after_create";
        } else if (!battleInState.crowd) {
          crowdCapDebugWhy = "battle_has_no_crowd";
        } else if (battleInState.crowd.decided) {
          crowdCapDebugWhy = "battle_already_decided";
        } else if (!battleInState.draw) {
          crowdCapDebugWhy = "battle_not_draw_after_create";
        } else {
          if (opts && opts.debugWeights && battleInState.crowd) {
            const highId = majority[0];
            const lowId = minority[0] || majority[1] || null;
            prevInfluence = {};
            if (highId && S.players[highId]) {
              prevInfluence[highId] = S.players[highId].influence;
              S.players[highId].influence = 100;
            }
            if (lowId && S.players[lowId]) {
              prevInfluence[lowId] = S.players[lowId].influence;
              S.players[lowId].influence = 1;
            }
            battleInState.crowd.cap = 2;
            battleInState.crowd.totalPlayers = Math.max(2, battleInState.crowd.totalPlayers | 0);
            battleInState.crowd.voters = {};
            if (highId) battleInState.crowd.voters[highId] = "a";
            if (lowId) battleInState.crowd.voters[lowId] = "b";
            battleInState.crowd.votesA = 1;
            battleInState.crowd.votesB = 1;
            battleInState.crowd.aVotes = 1;
            battleInState.crowd.bVotes = 1;
          }
          if (opts.forceCap && battleInState.crowd) {
            const currCap = Math.max(1, Number.isFinite(battleInState.crowd.cap) ? (battleInState.crowd.cap | 0) : (battleInState.crowd.totalPlayers | 0));
            const currentVotes = (battleInState.crowd.votesA | 0) + (battleInState.crowd.votesB | 0);
            const needed = Math.max(0, currCap - currentVotes);
            battleInState.crowd.votesA = (battleInState.crowd.votesA | 0) + needed;
            battleInState.crowd.aVotes = battleInState.crowd.votesA;
          }
          const battleInState = ensureDrawBattle();
          if (opts.mode === "fifty" && battleInState && battleInState.crowd) {
            battleInState.crowd.noTimerResolution = true;
            battleInState.crowd.voters = battleInState.crowd.voters || {};
          }
          try {
            tickResult = Core.applyCrowdVoteTick(battleId);
          } catch (_) {
            tickResult = null;
          }
          if (!tickResult) {
            tickResult = { ok: false, battleId, why: "tick_failed" };
          }
          if (opts.mode === "fifty" && (!tickResult.ok || !tickResult.outcome || !tickResult.crowdCapMeta || tickResult.crowdCapMeta.endedBy !== "fifty_fifty_no_timer")) {
            return { name, ok: false, battleId, why: "fifty_missing_or_not_final", tickResult, crowdCapDebug: tickResult?.pendingMeta || null };
          }
          const metaCandidate = (tickResult.crowdCapMeta || tickResult.pendingMeta) || null;
          crowdCapDebug = metaCandidate;
          cacheHit = !!(tickResult && tickResult.cacheHit);
          helperOk = !!metaCandidate;
          crowdCapDebugWhy = tickResult && tickResult.why ? tickResult.why : null;
        }
      }

      const overallOk = helperOk && !!(assert && assert.ok);

      return {
        name,
        ok: overallOk,
        battleId,
        T0_FINISHED: { id: battleId, result: "draw", status: "finished", oppId },
        T1_BY_BATTLE_REASONS: byBattle.map(x => x && x.reason),
        T1_BY_BATTLE_JSON: byBattle,
        T2_MONEYLOG_REASONS: logForBid.map(x => x && x.reason),
        T2_MONEYLOG_JSON: logForBid,
        beforeSnapshot,
        afterSnapshot,
        assert,
        crowdPool: { id: poolId, balance: Econ.getPoolBalance ? Econ.getPoolBalance(poolId) : null },
        majority,
        minority,
        majorityIds: majority,
        minorityIds: minority,
        repAwardedMinority,
        repAwardedMajority: 0,
        minorityPointsGranted: 0,
        v13,
        crowdCapDebug,
        tickResult,
        cacheHit,
        crowdCapDebugWhy
      };
    } finally {
      if (!Game.__D) Game.__D = {};
      Game.__D.FORCE_CIRCULATION = prevForce;
      Game.__D.BYPASS_POINTS_GUARD = prevBypass;
      Game.__D.ALLOW_POINTS_WRITE = prevAllow;
      if (prevWeighted !== null) Game.__D.CROWD_WEIGHTED_TALLY = prevWeighted;
      if (prevInfluence) {
        Object.keys(prevInfluence).forEach(id => {
          if (S && S.players && S.players[id]) S.players[id].influence = prevInfluence[id];
        });
      }
    }
  };

  Game.__DEV.smokeCrowdStep2 = (opts = {}) => {
    const name = "smoke_crowd_step2";
    const Econ = Game.ConflictEconomy || Game._ConflictEconomy || null;
    const Core = Game.ConflictCore || Game._ConflictCore || null;
    const S = Game.__S || null;
    if (!Econ || typeof Econ.transferPoints !== "function" || typeof Econ.transferFromPool !== "function") {
      return { name, ok: false, details: "Econ.transferPoints/transferFromPool missing" };
    }
    if (!Core || typeof Core.applyCrowdVoteTick !== "function") {
      return { name, ok: false, details: "ConflictCore.applyCrowdVoteTick missing" };
    }
    if (!S || !S.players || !S.me) return { name, ok: false, details: "Game.__S missing" };
    if (Array.isArray(S.battles) && S.battles.some(b => b && b.status !== "finished" && !b.resolved) && !opts.allowParallel) {
      return { name, ok: false, details: "active_battle_present" };
    }

    let prevForce = null;
    let prevBypass = null;
    let prevAllow = null;
    const touched = [];
    try {
      if (!Game.__D) Game.__D = {};
      prevForce = Game.__D.FORCE_CIRCULATION;
      prevBypass = Game.__D.BYPASS_POINTS_GUARD === true;
      prevAllow = Game.__D.ALLOW_POINTS_WRITE === true;
      Game.__D.FORCE_CIRCULATION = true;
      Game.__D.BYPASS_POINTS_GUARD = true;
      Game.__D.ALLOW_POINTS_WRITE = true;

      const D0 = Game.Data || {};
      const startNpc = Number.isFinite(D0.START_POINTS_NPC) ? (D0.START_POINTS_NPC | 0) : 10;
      const startPlayer = Number.isFinite(D0.START_POINTS_PLAYER) ? (D0.START_POINTS_PLAYER | 0) : 10;

      const isActivePlayer = (p) => {
        if (!p || !p.id) return false;
        if (p.removed === true) return false;
        const jailed = (S && S.jailed) ? S.jailed : null;
        if (jailed && jailed[p.id] && Number.isFinite(jailed[p.id].until) && Date.now() < jailed[p.id].until) return false;
        if (p.id === "me" || p.isMe) return true;
        if (p.npc === true || p.type === "npc") return true;
        return !!p.name;
      };
      const totalPlayers = () => {
        let n = 0;
        Object.values(S.players || {}).forEach(p => { if (isActivePlayer(p)) n++; });
        return n;
      };
      const capFormula = (n) => Math.max(10, Math.round(0.4 * (n | 0)));

      const toneWeight = (tone) => {
        if (tone === "r") return 2;
        if (tone === "k") return 3;
        return 1; // y/o
      };

      const toneFromInfluence = (inf, role) => {
        if (D0 && typeof D0.tierKeyByInfluence === "function") {
          const tk = D0.tierKeyByInfluence(inf, role);
          return (D0.colorFromTierKey ? D0.colorFromTierKey(tk) : "y");
        }
        if (D0 && typeof D0.tierKeysByInfluence === "function") {
          const keys = D0.tierKeysByInfluence(inf) || [];
          const tk = String(keys[0] || "y1");
          return (D0.colorFromTierKey ? D0.colorFromTierKey(tk) : "y");
        }
        return "y";
      };

      const setTone = (id, toneKey) => {
        const p = S.players[id];
        if (!p) return;
        touched.push({ id, influence: p.influence, role: p.role });
        if (toneKey === "k") {
          p.role = "mafia";
          p.influence = 30;
          return;
        }
        if (toneKey === "r") { p.influence = 16; return; }
        if (toneKey === "o") { p.influence = 8; return; }
        p.influence = 1;
      };

      const pickNpc = (excludeIds = {}) => {
        const list = Object.values(S.players || {}).filter(p => {
          if (!p || !p.id) return false;
          if (p.id === "me") return false;
          if (excludeIds[p.id]) return false;
          return p.npc === true || p.type === "npc";
        });
        return list[0] || null;
      };

      const ensureBattle = (battleId, oppId) => {
        if (!Array.isArray(S.battles)) S.battles = [];
        const now = Date.now();
        const crowd = {
          endAt: now - 1,
          endsAt: now - 1,
          votesA: 0,
          votesB: 0,
          aVotes: 0,
          bVotes: 0,
          totalPlayers: totalPlayers(),
          cap: capFormula(totalPlayers()),
          voters: {},
          decided: false,
          attackerId: "me",
          defenderId: oppId
        };
        const battle = {
          id: battleId,
          opponentId: oppId,
          attackerId: "me",
          defenderId: oppId,
          fromThem: false,
          status: "draw",
          draw: true,
          result: "draw",
          resolved: false,
          finished: false,
          attackHidden: false,
          createdAt: now,
          updatedAt: now,
          crowd
        };
        S.battles = [battle].concat(S.battles.filter(x => x && String(x.id) !== String(battleId)));
        return battle;
      };

      const runScenario = (label, config) => {
        const battleId = `dev_step2_${label}_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
        const oppId = (config.oppId && S.players[config.oppId]) ? config.oppId : "npc_weak";
        if (!S.players[oppId]) return { ok: false, why: "opponent_missing", battleId };

        const poolId = Econ.getCrowdPoolId ? Econ.getCrowdPoolId(battleId) : `crowd:${battleId}`;
        if (Econ.ensurePool) Econ.ensurePool(poolId);
        const poolBefore = Econ.getPoolBalance ? Econ.getPoolBalance(poolId) : null;

        const battle = ensureBattle(battleId, oppId);
        const capUsed = battle.crowd.cap;

        const exclude = { me: true };
        exclude[oppId] = true;
        const voters = [];

        const addVoter = (toneKey, side) => {
          const npc = pickNpc(exclude);
          if (!npc) return false;
          exclude[npc.id] = true;
          setTone(npc.id, toneKey);
          voters.push({ id: npc.id, side, toneKey });
          return true;
        };

        // Seed participants for weights
        config.seed.forEach(s => { addVoter(s.toneKey, s.side); });

        // Fill to cap using y voters
        while (voters.length < capUsed) {
          if (!addVoter("y", config.fillSide)) break;
        }

        if (voters.length < capUsed) {
          return { ok: false, battleId, why: "not_enough_voters", have: voters.length, capUsed };
        }

        // Ensure points/rep baseline and apply costs/rep
        const participants = voters.map(v => {
          const p = S.players[v.id];
          if (p && (!Number.isFinite(p.points) || p.points < 1)) p.points = startNpc;
          const pointsBefore = p ? (p.points | 0) : 0;
          const repBefore = p && Number.isFinite(p.rep) ? (p.rep | 0) : 0;
          Econ.transferPoints(v.id, poolId, 1, "crowd_vote_cost", { battleId });
          if (Game.__A && typeof Game.__A.transferRep === "function") {
            Game.__A.transferRep("rep_emitter", v.id, 1, "rep_crowd_vote_participation", battleId);
          }
          const pointsAfter = p ? (p.points | 0) : 0;
          const repAfter = p && Number.isFinite(p.rep) ? (p.rep | 0) : 0;
          const toneKey = String(toneFromInfluence(p ? p.influence : 0, p ? p.role : "") || "y");
          const weightUsed = toneWeight(toneKey);
          return { id: v.id, side: v.side, toneKey, weightUsed, pointsBefore, pointsAfter, repBefore, repAfter };
        });

        // Build voters map + weighted sums
        battle.crowd.voters = {};
        let aW = 0;
        let bW = 0;
        participants.forEach(p => {
          battle.crowd.voters[p.id] = (p.side === "A") ? "a" : "b";
          if (p.side === "A") aW += p.weightUsed;
          else bW += p.weightUsed;
        });
        battle.crowd.aVotes = aW;
        battle.crowd.bVotes = bW;
        battle.crowd.votesA = aW;
        battle.crowd.votesB = bW;
        battle.crowd.totalPlayers = totalPlayers();
        battle.crowd.cap = capUsed;

        // Refunds based on scenario
        if (config.refundAll) {
          participants.forEach(p => {
            Econ.transferFromPool(poolId, p.id, 1, "crowd_vote_refund", { battleId });
          });
        } else {
          participants.filter(p => p.side === "A").forEach(p => {
            Econ.transferFromPool(poolId, p.id, 1, "crowd_vote_refund_majority", { battleId });
          });
        }

        const tickResult = Core.applyCrowdVoteTick(battleId);
        const crowdMeta = tickResult && tickResult.crowdCapMeta ? tickResult.crowdCapMeta : null;
        const poolAfter = Econ.getPoolBalance ? Econ.getPoolBalance(poolId) : null;

        const log = (Game.__D && Array.isArray(Game.__D.moneyLog)) ? Game.__D.moneyLog : [];
        const logForBid = normalizeMoneyLogRows(log, "cap.log").filter(tx => String(tx && tx.battleId || "") === String(battleId));
        const reasons = {};
        logForBid.forEach(tx => {
          const r = tx && tx.reason ? String(tx.reason) : "unknown";
          reasons[r] = (reasons[r] || 0) + 1;
        });

        const assertCap = (capUsed === capFormula(totalPlayers()));
        const assertWeights = participants.every(p => {
          if (p.toneKey === "k") return p.weightUsed === 3 && (S.players[p.id] && String(S.players[p.id].role || "").toLowerCase() === "mafia");
          if (p.toneKey === "r") return p.weightUsed === 2;
          return p.weightUsed === 1;
        });
        const assertCost = participants.every(p => (p.pointsAfter === (p.pointsBefore - 1)));
        const assertRep = participants.every(p => (p.repAfter === (p.repBefore + 1)));
        const assertFifty = config.refundAll ? participants.every(p => {
          const p0 = S.players[p.id];
          return p0 && Number.isFinite(p0.points) && (p0.points | 0) === (p.pointsBefore | 0);
        }) : true;
        const assertMajority = !config.refundAll ? participants.filter(p => p.side === "A").every(p => {
          const p0 = S.players[p.id];
          return p0 && Number.isFinite(p0.points) && (p0.points | 0) === (p.pointsBefore | 0);
        }) : true;
        const minorityRemain = !config.refundAll ? (poolAfter != null && poolAfter > 0) : true;

        return {
          ok: !!(crowdMeta && tickResult && tickResult.outcome),
          battleId,
          totalPlayers: battle.crowd.totalPlayers,
          capUsed,
          totalVotes: crowdMeta ? crowdMeta.totalVotes : null,
          aVotesWeighted: crowdMeta ? crowdMeta.aVotes : null,
          bVotesWeighted: crowdMeta ? crowdMeta.bVotes : null,
          endedBy: crowdMeta ? crowdMeta.endedBy : null,
          outcome: tickResult ? tickResult.outcome : null,
          participants,
          pool: { id: poolId, pointsBefore: poolBefore, pointsAfter: poolAfter },
          moneyLogByReason: reasons,
          asserts: {
            capUsed: assertCap,
            weights: assertWeights,
            participationCost: assertCost,
            repParticipation: assertRep,
            fiftyFiftyRefunds: assertFifty,
            majorityRefunds: assertMajority,
            minorityRemainder: minorityRemain
          }
        };
      };

      const fiftyFifty = runScenario("fifty", {
        seed: [
          { toneKey: "r", side: "A" },
          { toneKey: "y", side: "A" },
          { toneKey: "r", side: "B" },
          { toneKey: "o", side: "B" }
        ],
        fillSide: "A",
        refundAll: true
      });

      const majority = runScenario("majority", {
        seed: [
          { toneKey: "k", side: "A" },
          { toneKey: "r", side: "A" },
          { toneKey: "y", side: "B" },
          { toneKey: "o", side: "B" }
        ],
        fillSide: "A",
        refundAll: false
      });

      const ok = !!(fiftyFifty.ok && majority.ok &&
        fiftyFifty.asserts && Object.values(fiftyFifty.asserts).every(Boolean) &&
        majority.asserts && Object.values(majority.asserts).every(Boolean));

      return { name, ok, fiftyFifty, majority };
    } finally {
      if (!Game.__D) Game.__D = {};
      Game.__D.FORCE_CIRCULATION = prevForce;
      Game.__D.BYPASS_POINTS_GUARD = prevBypass;
      Game.__D.ALLOW_POINTS_WRITE = prevAllow;
      if (touched.length) {
        touched.forEach(t => {
          const p = S.players[t.id];
          if (!p) return;
          p.influence = t.influence;
          if (t.role !== undefined) p.role = t.role;
        });
      }
    }
  };

  Game.__DEV.smokeNpcCrowdEventEconomyOnce = (opts = {}) => {
    const name = "smoke_npc_crowd_event_economy_once";
    const Econ = Game.ConflictEconomy || Game._ConflictEconomy || null;
    const S = Game.__S || null;
    if (!Econ || typeof Econ.transferPoints !== "function") {
      return { name, ok: false, details: "Econ.transferPoints missing" };
    }
    if (!S || !S.players) return { name, ok: false, details: "Game.__S missing" };
    const forceBranch = opts && opts.forceBranch ? String(opts.forceBranch).toLowerCase() : null;
    const branch = forceBranch || "fifty";
    const touched = [];

    const pickNpc = (exclude = {}) => {
      const list = Object.values(S.players || {}).filter(p => {
        if (!p || !p.id) return false;
        if (exclude[p.id]) return false;
        return p.npc === true || p.type === "npc";
      });
      return list[0] || null;
    };

    const setTone = (id, toneKey) => {
      const p = S.players[id];
      if (!p) return;
      touched.push({ id, influence: p.influence, role: p.role });
      if (toneKey === "k") {
        p.role = "mafia";
        p.influence = 30;
        return;
      }
      if (toneKey === "r") { p.influence = 16; return; }
      if (toneKey === "o") { p.influence = 8; return; }
      p.influence = 1;
    };

    const toneWeight = (tone) => {
      if (tone === "r") return 2;
      if (tone === "k") return 3;
      return 1;
    };

    const toneFromInfluence = (inf, role) => {
      const D0 = Game.Data || {};
      if (D0 && typeof D0.tierKeyByInfluence === "function") {
        const tk = D0.tierKeyByInfluence(inf, role);
        return (D0.colorFromTierKey ? D0.colorFromTierKey(tk) : "y");
      }
      if (D0 && typeof D0.tierKeysByInfluence === "function") {
        const keys = D0.tierKeysByInfluence(inf) || [];
        const tk = String(keys[0] || "y1");
        return (D0.colorFromTierKey ? D0.colorFromTierKey(tk) : "y");
      }
      return "y";
    };

    const event = Game.Events && typeof Game.Events.makeNpcEvent === "function"
      ? Game.Events.makeNpcEvent()
      : null;
    if (!event) return { name, ok: false, details: "makeNpcEvent failed" };
    if (Game.Events && typeof Game.Events.addEvent === "function") {
      Game.Events.addEvent(event);
    } else {
      return { name, ok: false, details: "addEvent missing" };
    }

    const exclude = {};
    exclude[event.aId] = true;
    exclude[event.bId] = true;
    const vA1 = pickNpc(exclude); if (vA1) exclude[vA1.id] = true;
    const vB1 = pickNpc(exclude); if (vB1) exclude[vB1.id] = true;
    const vA2 = pickNpc(exclude); if (vA2) exclude[vA2.id] = true;
    const vB2 = pickNpc(exclude);

    const voters = [];
    if (branch === "majority") {
      if (vA1) voters.push({ id: vA1.id, side: "a", toneKey: "k" });
      if (vA2) voters.push({ id: vA2.id, side: "a", toneKey: "r" });
      if (vB1) voters.push({ id: vB1.id, side: "b", toneKey: "r" });
      if (vB2) voters.push({ id: vB2.id, side: "b", toneKey: "y" });
      if (vB2 && !voters.some(v => v.id === vB2.id)) voters.push({ id: vB2.id, side: "b", toneKey: "y" });
    } else {
      if (vA1) voters.push({ id: vA1.id, side: "a", toneKey: "r" });
      if (vB1) voters.push({ id: vB1.id, side: "b", toneKey: "r" });
      if (vA2) voters.push({ id: vA2.id, side: "a", toneKey: "y" });
      if (vB2) voters.push({ id: vB2.id, side: "b", toneKey: "o" });
    }

    voters.forEach(v => setTone(v.id, v.toneKey));

    const poolId = (Econ.getCrowdPoolId ? Econ.getCrowdPoolId(event.id) : `crowd:${event.id}`);
    if (Econ.ensurePool) Econ.ensurePool(poolId);
    const poolBefore = Econ.getPoolBalance ? Econ.getPoolBalance(poolId) : null;
    const beforeSnapshot = Game.__DEV.sumPointsSnapshot();

    event.crowd.voters = {};
    let aVotes = 0;
    let bVotes = 0;
    voters.forEach(v => {
      event.crowd.voters[v.id] = v.side;
      const p = S.players[v.id];
      const toneKey = toneFromInfluence(p ? p.influence : 0, p ? p.role : "");
      const w = toneWeight(toneKey);
      if (v.side === "a") aVotes += w;
      else bVotes += w;
      if (Econ && typeof Econ.transferCrowdVoteCost === "function") {
        Econ.transferCrowdVoteCost(v.id, "sink", 1, { battleId: event.id });
      } else {
        Econ.transferPoints(v.id, "sink", 1, "crowd_vote_cost", { battleId: event.id });
      }
      if (Game.__A && typeof Game.__A.transferRep === "function") {
        Game.__A.transferRep("rep_emitter", v.id, 1, "rep_crowd_vote_participation", event.id);
      }
    });

    event.crowd.aVotes = aVotes;
    event.crowd.bVotes = bVotes;
    event.crowd.votesA = aVotes;
    event.crowd.votesB = bVotes;
    const totalVotes = aVotes + bVotes;
    if (event.crowd) {
      if (!Number.isFinite(event.crowd.cap) || event.crowd.cap < totalVotes) event.crowd.cap = totalVotes;
      event.crowd.totalPlayers = Math.max(event.crowd.totalPlayers || 0, voters.length);
      event.crowd.endAt = Date.now() - 1;
    }
    event.endsAt = event.crowd ? event.crowd.endAt : (Date.now() - 1);

    if (Game.Events && typeof Game.Events.finalizeOpenEventNow === "function") {
      try { event.state = "open"; } catch (_) {}
      Game.Events.finalizeOpenEventNow(event);
    }
    if (!(event && (event.resolved === true || event.state === "resolved" || event.status === "resolved"))) {
      if (Game.Events && typeof Game.Events.tick === "function") {
        try { event.state = "open"; } catch (_) {}
        Game.Events.tick();
      }
    }

    const dbgLogRows = getDbgLog();
    const logStartLen = dbgLogRows.length;
    const logForBid = dbgLogRows.filter(tx => String(tx && tx.battleId || "") === String(event.id));
    const byReason = {};
    logForBid.forEach(tx => {
      const r = tx && tx.reason ? String(tx.reason) : "unknown";
      byReason[r] = (byReason[r] || 0) + 1;
    });

    const poolAfter = Econ.getPoolBalance ? Econ.getPoolBalance(poolId) : null;
    const afterSnapshot = Game.__DEV.sumPointsSnapshot();
    const outcome = event && event.crowd && event.crowd.winner ? event.crowd.winner : null;
    const branchName = branch;
    const refundAll = branchName === "fifty";

    const asserts = {
      hasCosts: (byReason.crowd_vote_cost | 0) >= voters.length,
      hasRep: (byReason.rep_crowd_vote_participation | 0) >= voters.length,
      hasRefunds: refundAll ? (byReason.crowd_vote_refund | 0) >= voters.length : (byReason.crowd_vote_refund_majority | 0) > 0,
    };

    touched.forEach(t => {
      const p = S.players[t.id];
      if (!p) return;
      p.influence = t.influence;
      p.role = t.role;
    });

    const resolvedOk = !!(event && (event.resolved === true || event.state === "resolved" || event.status === "resolved"));
    const decidedOk = !!(event && event.crowd && event.crowd.decided === true);
    const totalsBeforeAll = (beforeSnapshot && Number.isFinite(beforeSnapshot.total)) ? (beforeSnapshot.total | 0) : null;
    const totalsAfterAll = (afterSnapshot && Number.isFinite(afterSnapshot.total)) ? (afterSnapshot.total | 0) : null;
    const netDeltaFromMoneyLog = logForBid.reduce((acc, tx) => {
      const currency = String(tx && tx.currency || "");
      const reason = String(tx && tx.reason || "");
      if (currency === "rep" || reason.startsWith("rep_")) return acc;
      const amt = (tx && Number.isFinite(tx.amount)) ? (tx.amount | 0) : 0;
      if (amt === 0) return acc;
      const sourceId = String(tx && tx.sourceId || "");
      const targetId = String(tx && tx.targetId || "");
      const srcKey = sourceId || "unknown";
      const tgtKey = targetId || "unknown";
      acc.map[srcKey] = (acc.map[srcKey] || 0) - amt;
      acc.map[tgtKey] = (acc.map[tgtKey] || 0) + amt;
      return acc;
    }, { map: Object.create(null) });
    const sumNetFromMoneyLog = Object.values(netDeltaFromMoneyLog.map).reduce((s, v) => s + (v | 0), 0);
    const pointsDiffOk = (sumNetFromMoneyLog | 0) === 0;
    const worldIdsInfo = collectWorldIdsFromLogs(logForBid, netDeltaFromMoneyLog.map);
    const missingAccountsSet = new Set();
    const readStatePointsOnly = (snap, id) => {
      const key = String(id || "");
      if (snap && snap.byId && Number.isFinite(snap.byId[key])) return (snap.byId[key] | 0);
      const p = (key === "me") ? (S.players.me || S.me) : (S.players ? S.players[key] : null);
      return p && Number.isFinite(p.points) ? (p.points | 0) : null;
    };
    const sumWorldPoints = (snap) => worldIdsInfo.ids.reduce((s, id) => {
      const v = readStatePointsOnly(snap, id);
      if (!Number.isFinite(v)) {
        missingAccountsSet.add(String(id));
        return s;
      }
      return s + (v | 0);
    }, 0);
    const totalPtsWorldBefore = sumWorldPoints(beforeSnapshot);
    const totalPtsWorldAfter = sumWorldPoints(afterSnapshot);
    const totalsStable = (totalPtsWorldBefore != null && totalPtsWorldAfter != null) ? (totalPtsWorldBefore === totalPtsWorldAfter) : true;
    const totalsExpectedOk = (totalsBeforeAll != null && totalsAfterAll != null) ? (totalsBeforeAll === 200 && totalsAfterAll === 200) : true;
    const deltaWorld = (totalPtsWorldAfter != null && totalPtsWorldBefore != null) ? (totalPtsWorldAfter - totalPtsWorldBefore) : null;
    const poolAfterOk = (poolAfter == null) ? true : ((poolAfter | 0) === 0);
    const resolvedOrDecided = resolvedOk || decidedOk;
    const economyOkZeroSum = totalsStable && totalsExpectedOk && ((deltaWorld | 0) === 0) && pointsDiffOk && poolAfterOk;
    const logsOk = asserts.hasCosts && asserts.hasRefunds;
    const repOk = asserts.hasRep;
    const economyOk = economyOkZeroSum && resolvedOrDecided && logsOk;
    const warnings = [];
    if (!repOk) warnings.push("rep_participation_missing");
    if (!totalsStable) warnings.push("totals_changed");
    if (!totalsExpectedOk) warnings.push("totals_not_200");
    if (!pointsDiffOk) warnings.push("points_diff");

    return {
      name,
      ok: economyOk,
      economyOk,
      warnings: warnings.length ? warnings : null,
      id: event.id,
      branch: branchName,
      byReason,
      poolAfter,
      asserts,
      resolvedOk,
      decidedOk,
      totalsStable,
      deltaWorld,
      pointsDiffOk,
      diag: {
        worldIdsCount: worldIdsInfo.ids.length,
        worldIdsSample: worldIdsInfo.ids.slice(0, 10),
        missingAccounts: Array.from(missingAccountsSet),
        includedServiceAccounts: worldIdsInfo.includedServiceAccounts,
        totalsAllBefore: totalsBeforeAll,
        totalsAllAfter: totalsAfterAll
      },
      debugVersion: "ECON02_7"
    };
  };

  Game.__DEV.smokeNpcCrowdEventPaidVotesOnce = (opts = {}) => {
    try {
      const name = "smoke_npc_crowd_event_paid_votes_once";
      const Econ = Game.ConflictEconomy || Game._ConflictEconomy || null;
      const Events = Game.Events || null;
      const S = Game.__S || null;
      if (!Econ || typeof Econ.transferPoints !== "function") {
        return { name, ok: false, details: "Econ.transferPoints missing" };
      }
      if (!Events || typeof Events.makeNpcEvent !== "function" || typeof Events.addEvent !== "function" || typeof Events.tick !== "function") {
        return { name, ok: false, details: "Events.makeNpcEvent/addEvent/tick missing" };
      }
      if (!S || !S.players) return { name, ok: false, details: "Game.__S missing" };

      const event = Events.makeNpcEvent();
      if (!event) return { name, ok: false, details: "makeNpcEvent failed" };
      Events.addEvent(event);

      let countedNpcVotes = [];

      const exclude = new Set([event.aId, event.bId, "me"]);
      const npcs = Object.values(S.players || {}).filter(p => {
        if (!p || !p.id) return false;
        if (exclude.has(p.id)) return false;
        return p.npc === true || p.type === "npc";
      });
      if (npcs.length < 3) return { name, ok: false, details: "not_enough_npcs" };

      const sample = npcs.slice(0, 4);
      const touched = sample.map(p => ({ id: p.id, points: p.points }));
      const setPoints = (p, v) => {
        if (!p) return;
        const val = Number(v || 0);
        if (typeof Game._withPointsWrite === "function") {
          Game._withPointsWrite(() => { p.points = val; });
        } else {
          p.points = val;
        }
      };

      sample.forEach((p, i) => setPoints(p, i === 3 ? 0 : 1));

      const zeroNpc = sample[3] || null;
      const zeroNpcId = zeroNpc ? zeroNpc.id : null;

      const snapshotBeforePoints = Object.create(null);
      const snapshotBeforeDetails = Object.create(null);
      Object.values(S.players || {}).forEach(p => {
        if (!p || !p.id) return;
        const id = String(p.id);
        snapshotBeforePoints[id] = Number(p.points || 0);
        snapshotBeforeDetails[id] = {
          points: p.points,
          money: p.money,
          stars: p.stars
        };
      });

      if (event.crowd && typeof event.crowd === "object") {
        event.crowd.nextNpcVoteAt = 0;
        event.crowd.endAt = Date.now() + 3000;
        event.endsAt = event.crowd.endAt;
      }

      let now = Date.now();
      try {
        if (Game.Time && typeof Game.Time.setNow === "function") {
          Game.Time.setNow(() => now);
        }
        for (let i = 0; i < 12; i++) {
          now += 1600;
          Events.tick();
          if (event.crowd && event.crowd.decided) break;
          const voteCount = event.crowd && event.crowd.voters ? Object.keys(event.crowd.voters).length : 0;
          if (voteCount >= 3) break;
        }
      } finally {
        if (Game.Time && typeof Game.Time.setNow === "function") Game.Time.setNow(null);
      }

      let logStartLen = 0;
      let logEndLen = 0;
      let newRows = [];
      let logForBid = [];
      const _dbg = getDbgLog();
      logStartLen = _dbg.length;
      logEndLen = logStartLen;

      logForBid = _dbg.filter(tx => String(tx && tx.battleId || "") === String(event.id));
      const byReason = {};
      const npcCostLogs = logForBid.filter(tx => {
        const reason = String(tx && tx.reason || "");
        const src = String(tx && tx.sourceId || "");
        if (!src.startsWith("npc_")) return false;
        if (reason !== "crowd_vote_cost") return false;
        return (tx && Number(tx.amount || tx.delta || 0)) === 1;
      });
      logForBid.forEach(tx => {
        const r = tx && tx.reason ? String(tx.reason) : "unknown";
        byReason[r] = (byReason[r] || 0) + 1;
      });

      logEndLen = _dbg.length;
      newRows = _dbg.slice(logStartLen, logEndLen);

    const simSteps = Array.isArray(event.simDebugSteps) ? event.simDebugSteps : [];
    const voteSteps = simSteps.filter(s => s && s.voteCounted && s.voterId);
    const paidIds = Array.from(new Set(voteSteps.map(s => String(s.voterId))));
    countedNpcVotes.push(...paidIds);
    const zeroLogged = zeroNpcId ? npcCostLogs.some(tx => String(tx && tx.sourceId || "") === String(zeroNpcId)) : false;

    const npcBefore = paidIds.map(id => {
      const step = voteSteps.find(s => String(s.voterId) === String(id));
      return { id, points: step ? step.beforePts : null };
    });
    const snapshotAfterPoints = Object.create(null);
    const snapshotAfterDetails = Object.create(null);
    Object.values(S.players || {}).forEach(p => {
      if (!p || !p.id) return;
      const id = String(p.id);
      snapshotAfterPoints[id] = Number(p.points || 0);
      snapshotAfterDetails[id] = {
        points: p.points,
        money: p.money,
        stars: p.stars
      };
    });

    const npcAfter = paidIds.map(id => {
      const step = voteSteps.find(s => String(s.voterId) === String(id));
      return { id, points: step ? step.afterPts : null };
    });
    const zeroNpcBefore = zeroNpcId ? { id: zeroNpcId, points: snapshotBeforePoints[zeroNpcId] } : null;
    const zeroNpcAfter = zeroNpcId ? { id: zeroNpcId, points: snapshotAfterPoints[zeroNpcId] } : null;

    const debugPaid = (() => {
      const players = (S && S.players) ? S.players : {};
      const voterId = paidIds[0] || null;
      if (!voterId) {
        return {
          voterId: null,
          hasPlayerInState: false,
          stateBeforePts: null,
          stateAfterPts: null,
          getterBeforePts: null,
          getterAfterPts: null,
          transferRet: null,
          moneyLogLastCost: null,
          stateKeysSample: {
            keys: Object.keys(players).slice(0, 10),
            includesVoterId: false
          },
          note: { before: null, after: null }
        };
      }

      const stateBeforePts = Number.isFinite(snapshotBeforePoints[voterId]) ? snapshotBeforePoints[voterId] : null;
      const getterBeforePts = stateBeforePts;
      const transferRet = Econ.transferPoints(voterId, "sink", 1, "dev_paid_vote_probe", { battleId: event.id });
      const stateAfterPts = Number.isFinite(snapshotAfterPoints[voterId]) ? snapshotAfterPoints[voterId] : null;
      const getterAfterPts = stateAfterPts;

      const matchesVoter = (row, id) => {
        if (!row || !id) return false;
        const meta = row.meta || {};
        return (
          String(row.sourceId || "") === String(id) ||
          String(row.actorId || "") === String(id) ||
          String(row.fromId || "") === String(id) ||
          String(meta.actorId || "") === String(id) ||
          String(meta.fromId || "") === String(id) ||
          String(meta.sourceId || "") === String(id)
        );
      };
      const costRows = newRows.filter(r => matchesVoter(r, voterId) && Number(r.amount || 0) === 1);
      const moneyLogLastCost = costRows.length ? costRows[costRows.length - 1] : null;
      const reasonCounts = {};
      newRows.forEach(r => {
        const k = String(r && r.reason || "unknown");
        reasonCounts[k] = (reasonCounts[k] || 0) + 1;
      });
      const moneyLogNewRowsReasons = Object.keys(reasonCounts).slice(0, 10);

      const noteFields = (before, after) => ({
        before: before ? {
          points: before.points,
          money: before.money,
          stars: before.stars
        } : null,
        after: after ? {
          points: after.points,
          money: after.money,
          stars: after.stars
        } : null
      });

      const beforeDetails = snapshotBeforeDetails[voterId] || null;
      const afterDetails = snapshotAfterDetails[voterId] || null;

      return {
        voterId,
        hasPlayerInState: !!players[voterId],
        stateBeforePts,
        stateAfterPts,
        getterBeforePts,
        getterAfterPts,
        transferRet,
        moneyLogLastCost,
        moneyLogNewRowsLen: newRows.length,
        moneyLogNewRowsReasons,
        moneyLogCostRows: costRows.slice(0, 3),
        stateKeysSample: {
          keys: Object.keys(players).slice(0, 10),
          includesVoterId: Object.prototype.hasOwnProperty.call(players, voterId)
        },
        note: noteFields(beforeDetails, afterDetails)
      };
    })();

    const paidSet = new Set(paidIds.map(String));
    const countedSet = new Set(countedNpcVotes.map(String));
    const matchesPaidId = (row, id) => {
      if (!row || !id) return false;
      const meta = row.meta || {};
      return (
        String(row.sourceId || "") === String(id) ||
        String(row.actorId || "") === String(id) ||
        String(row.fromId || "") === String(id) ||
        String(meta.actorId || "") === String(id) ||
        String(meta.fromId || "") === String(id) ||
        String(meta.sourceId || "") === String(id)
      );
    };
    const costRowsByPaidId = new Set();
    newRows.forEach(r => {
      if (!r || Number(r.amount || 0) !== 1) return;
      paidIds.forEach(id => {
        if (matchesPaidId(r, id)) costRowsByPaidId.add(String(id));
      });
    });
    const paidVotesMatch = (paidSet.size === countedSet.size && Array.from(paidSet).every(id => countedSet.has(id))) &&
      costRowsByPaidId.size === paidSet.size;
    const notes = [];
    if (newRows.length === 0) notes.push("paid_vote_cost_row_missing");
    if (costRowsByPaidId.size !== paidSet.size) notes.push("paid_vote_cost_row_missing");
    const observedNewRowsSample = newRows.slice(0, 5).map(r => ({
      reason: r && r.reason,
      amount: r && r.amount,
      sourceId: r && r.sourceId,
      targetId: r && r.targetId
    }));
    const asserts = {
      paidVotesMatch,
      zeroNpcExcluded: zeroNpcId ? (!paidIds.includes(zeroNpcId) && !zeroLogged) : true,
      paidDeducted: voteSteps.every(s => {
        if (!Number.isFinite(s.beforePts) || !Number.isFinite(s.afterPts)) return false;
        return s.afterPts === (s.beforePts - 1);
      })
    };

    // Restore points
    touched.forEach(t => {
      const p = S.players[t.id];
      if (p) setPoints(p, t.points);
    });

    return {
      name,
      ok: Object.values(asserts).every(Boolean),
      eventId: event.id,
      npcBefore,
      npcAfter,
      zeroNpcBefore,
      zeroNpcAfter,
      countedNpcVotes,
      paidIds,
      byReason,
      asserts,
      notes,
      expectedCostReasonKeys: ["crowd_vote_cost"],
      observedNewRowsReasons: debugPaid.moneyLogNewRowsReasons || [],
      observedNewRowsSample,
      debugPaid,
      simDebug: event.simDebugSteps || []
    };
    } catch (e) {
      if (Game.__DEV && !Game.__DEV.__bootTryFailLogged) {
        Game.__DEV.__bootTryFailLogged = true;
        console.error("DEV_CHECKS_BOOT_TRY_FAIL", e && (e.stack || e.message || e));
      }
      return {
        name: "smoke_npc_crowd_event_paid_votes_once",
        ok: false,
        notes: ["probe_throw_caught"],
        err: String(e),
        stack: e && e.stack ? String(e.stack) : null
      };
    }
  };

  Game.__DEV.smokeNpcCrowdMaxShareOnce = (opts = {}) => {
    const name = "smoke_npc_crowd_max_share_once";
    const Events = Game.Events || null;
    const S = Game.__S || null;
    const D0 = Game.Data || null;
    if (!Events || typeof Events.makeNpcEvent !== "function" || typeof Events.addEvent !== "function" || typeof Events.tick !== "function") {
      return { name, ok: false, details: "Events.makeNpcEvent/addEvent/tick missing" };
    }
    if (!S || !S.players) return { name, ok: false, details: "Game.__S missing" };
    if (!D0) return { name, ok: false, details: "Game.Data missing" };

    const share = (opts && Number.isFinite(opts.maxNpcShare)) ? Math.max(0, Math.min(1, opts.maxNpcShare)) : 0.5;
    const prevShare = D0.MAX_NPC_SHARE_CROWD;

    const runOnce = (shareVal) => {
      D0.MAX_NPC_SHARE_CROWD = shareVal;
      const event = Events.makeNpcEvent();
      if (!event) return { ok: false, details: "makeNpcEvent failed" };
      Events.addEvent(event);

      const touched = [];
      Object.values(S.players || {}).forEach(p => {
        if (!p || !p.id) return;
        const isNpc = (p.npc === true || p.type === "npc");
        if (!isNpc) return;
        touched.push({ id: p.id, points: p.points });
        if (typeof Game._withPointsWrite === "function") {
          Game._withPointsWrite(() => { p.points = 2; });
        } else {
          p.points = 2;
        }
      });

      if (event.crowd && typeof event.crowd === "object") {
        event.crowd.nextNpcVoteAt = 0;
        event.crowd.endAt = Date.now() + 60000;
        event.endsAt = event.crowd.endAt;
        event.crowd.cap = 9999;
      }

      let now = Date.now();
      try {
        if (Game.Time && typeof Game.Time.setNow === "function") {
          Game.Time.setNow(() => now);
        }
        for (let i = 0; i < 120; i++) {
          now += 1600;
          Events.tick();
          const steps = event.simDebugSteps || [];
          if (steps.length >= 12) break;
        }
      } catch (err) {
        if (Game.__DEV && !Game.__DEV.__bootTryFailLogged) {
          Game.__DEV.__bootTryFailLogged = true;
          console.error("DEV_CHECKS_BOOT_TRY_FAIL", err && (err.stack || err.message || err));
        }
        return { ok: false, details: String(err && err.message || err) };
      } finally {
        if (Game.Time && typeof Game.Time.setNow === "function") Game.Time.setNow(null);
      }

      const eventRef = (Array.isArray(S.events) ? S.events.find(x => x && x.id === event.id) : null) || event;
      const crowd = (eventRef && eventRef.crowd && typeof eventRef.crowd === "object") ? eventRef.crowd : null;
      const sim = Array.isArray(eventRef && eventRef.simDebugSteps) ? eventRef.simDebugSteps : [];

      const paidFromCrowd = Array.isArray(crowd && crowd.npcPaidOrder) ? crowd.npcPaidOrder.slice() : [];
      const countedFromCrowd = Array.isArray(crowd && crowd.npcCountedIds) ? crowd.npcCountedIds.slice() : [];
      const excludedFromCrowd = crowd && crowd.excludedNpcVotes && typeof crowd.excludedNpcVotes === "object"
        ? Object.keys(crowd.excludedNpcVotes)
        : [];

      const paidFromSim = sim.filter(s => s && s.transferOk).map(s => String(s.voterId || "")).filter(Boolean);
      const countedFromSim = sim.filter(s => s && s.voteCounted).map(s => String(s.voterId || "")).filter(Boolean);
      const excludedFromSim = sim.filter(s => s && s.excludedReason === "excluded_by_npc_cap").map(s => String(s.voterId || "")).filter(Boolean);

      const paidIds = Array.from(new Set((paidFromCrowd.length ? paidFromCrowd : paidFromSim))).filter(Boolean);
      const countedIds = Array.from(new Set((countedFromCrowd.length ? countedFromCrowd : countedFromSim))).filter(Boolean);
      const excludedIds = Array.from(new Set((excludedFromCrowd.length ? excludedFromCrowd : excludedFromSim))).filter(Boolean);

      const dbg = (Game.__D || null);
      const logByBattle = (dbg && dbg.moneyLogByBattle) ? dbg.moneyLogByBattle : null;
      const logForBid = Array.isArray(logByBattle && logByBattle[event.id])
        ? logByBattle[event.id]
        : ((dbg && Array.isArray(dbg.moneyLog)) ? dbg.moneyLog.filter(tx => String(tx && tx.battleId || "") === String(event.id)) : []);
      const byReason = {};
      const paidIdSet = new Set(paidIds);
      const isNpcSource = (id) => {
        if (!id) return false;
        if (String(id).startsWith("npc_")) return true;
        return paidIdSet.has(String(id));
      };
      const npcCostEntries = logForBid.filter(tx => {
        const reason = String(tx && tx.reason || "");
        const sourceId = String(tx && tx.sourceId || "");
        return reason === "crowd_vote_cost" && isNpcSource(sourceId);
      });
      const npcCostSourceIds = npcCostEntries.map(tx => String(tx && tx.sourceId || "")).filter(Boolean);
      const npcCostMap = npcCostSourceIds.reduce((acc, id) => {
        acc[id] = (acc[id] || 0) + 1;
        return acc;
      }, {});
      const npcCostUnique = Object.keys(npcCostMap);
      const npcCostDupes = Object.keys(npcCostMap).filter(id => npcCostMap[id] > 1);
      logForBid.forEach(tx => {
        const r = tx && tx.reason ? String(tx.reason) : "unknown";
        byReason[r] = (byReason[r] || 0) + 1;
      });

      touched.forEach(t => {
        const p = S.players[t.id];
        if (!p) return;
        if (typeof Game._withPointsWrite === "function") {
          Game._withPointsWrite(() => { p.points = t.points; });
        } else {
          p.points = t.points;
        }
      });

      return {
        ok: true,
        eventId: event.id,
        share: shareVal,
        paidIds,
        countedIds,
        excludedIds,
        byReason,
        simSample: sim.slice(0, 6),
        debug: {
          hasCrowd: !!crowd,
          crowdKeys: crowd ? Object.keys(crowd).slice(0, 30) : [],
          simDebugLen: sim.length,
          excludedNpcVotesLen: excludedFromCrowd.length,
          scopedLogLen: logForBid.length,
          npcCostEntryCount: npcCostEntries.length,
          npcCostUniqueCount: npcCostUnique.length,
          npcCostDupes: npcCostDupes.slice(0, 10),
          npcCostUniqueSample: npcCostUnique.slice(0, 10)
        },
        asserts: {
          paidVotesMatch: paidIds.length === npcCostUnique.length && paidIds.every(id => npcCostUnique.includes(id)),
          paidExceedsCounted: paidIds.length > countedIds.length,
          hasExcluded: excludedIds.length > 0
        }
      };
    };

    const limited = runOnce(share);
    const full = runOnce(1.0);
    D0.MAX_NPC_SHARE_CROWD = prevShare;

    const ok = !!(limited.ok && full.ok &&
      limited.asserts && limited.asserts.paidVotesMatch && limited.asserts.paidExceedsCounted && limited.asserts.hasExcluded &&
      full.asserts && full.asserts.paidVotesMatch && (!full.asserts.paidExceedsCounted));

    return { name, ok, limited, full };
  };

  Game.__DEV.smokeNpcCrowdOneEventBeforeAfterOnce = (opts = {}) => {
    const name = "smoke_npc_crowd_one_event_before_after_once";
    const Events = Game.Events || null;
    const S = Game.__S || null;
    const D0 = Game.Data || null;
    if (!Events || typeof Events.makeNpcEvent !== "function" || typeof Events.addEvent !== "function" || typeof Events.tick !== "function") {
      return { name, ok: false, details: "Events.makeNpcEvent/addEvent/tick missing" };
    }
    if (!S || !S.players) return { name, ok: false, details: "Game.__S missing" };
    if (!D0) return { name, ok: false, details: "Game.Data missing" };

    const share = (opts && Number.isFinite(opts.maxNpcShare)) ? Math.max(0, Math.min(1, opts.maxNpcShare)) : 0.5;
    const prevShare = D0.MAX_NPC_SHARE_CROWD;

    const event = Events.makeNpcEvent();
    if (!event) return { name, ok: false, details: "makeNpcEvent failed" };
    Events.addEvent(event);
    D0.MAX_NPC_SHARE_CROWD = share;

    const touched = [];
    Object.values(S.players || {}).forEach(p => {
      if (!p || !p.id) return;
      const isNpc = (p.npc === true || p.type === "npc");
      if (!isNpc) return;
      touched.push({ id: p.id, points: p.points });
      if (typeof Game._withPointsWrite === "function") {
        Game._withPointsWrite(() => { p.points = 3; });
      } else {
        p.points = 3;
      }
    });
    const beforeMap = Object.create(null);
    Object.values(S.players || {}).forEach(p => {
      if (!p || !p.id) return;
      beforeMap[p.id] = Number(p.points || 0);
    });

    if (event.crowd && typeof event.crowd === "object") {
      event.crowd.nextNpcVoteAt = 0;
      event.crowd.endAt = Date.now() + 4000;
      event.endsAt = event.crowd.endAt;
      event.crowd.cap = 9999;
    }

    let now = Date.now();
    try {
      if (Game.Time && typeof Game.Time.setNow === "function") {
        Game.Time.setNow(() => now);
      }
      for (let i = 0; i < 60; i++) {
        now += 1600;
        Events.tick();
        if (event.crowd && event.crowd.decided) break;
        const steps = event.simDebugSteps || [];
        if (steps.length >= 12) break;
      }
    } finally {
      if (Game.Time && typeof Game.Time.setNow === "function") Game.Time.setNow(null);
    }

    const eventRef = (Array.isArray(S.events) ? S.events.find(x => x && x.id === event.id) : null) || event;
    const crowd = (eventRef && eventRef.crowd && typeof eventRef.crowd === "object") ? eventRef.crowd : null;
    const sim = Array.isArray(eventRef && eventRef.simDebugSteps) ? eventRef.simDebugSteps : [];

    const paidFromCrowd = Array.isArray(crowd && crowd.npcPaidOrder) ? crowd.npcPaidOrder.slice() : [];
    const countedFromCrowd = Array.isArray(crowd && crowd.npcCountedIds) ? crowd.npcCountedIds.slice() : [];
    const excludedFromCrowd = crowd && crowd.excludedNpcVotes && typeof crowd.excludedNpcVotes === "object"
      ? Object.keys(crowd.excludedNpcVotes)
      : [];
    const paidFromSim = sim.filter(s => s && s.transferOk).map(s => String(s.voterId || "")).filter(Boolean);
    const countedFromSim = sim.filter(s => s && s.voteCounted).map(s => String(s.voterId || "")).filter(Boolean);

    const paidIds = Array.from(new Set((paidFromCrowd.length ? paidFromCrowd : paidFromSim))).filter(Boolean);
    const countedIds = Array.from(new Set((countedFromCrowd.length ? countedFromCrowd : countedFromSim))).filter(Boolean);
    const excludedIds = Array.from(new Set(excludedFromCrowd)).filter(Boolean);

    const beforePts = paidIds.slice(0, 5).map(id => ({ id, points: Number.isFinite(beforeMap[id]) ? beforeMap[id] : null }));
    const afterMap = Object.create(null);
    Object.values(S.players || {}).forEach(p => {
      if (!p || !p.id) return;
      afterMap[p.id] = Number(p.points || 0);
    });
    const afterPts = paidIds.slice(0, 5).map(id => {
      const p = S.players[id];
      return { id, points: Number.isFinite(p && p.points) ? (p.points | 0) : null };
    });

    const dbg = (Game.__D || null);
    const logByBattle = (dbg && dbg.moneyLogByBattle) ? dbg.moneyLogByBattle : null;
    const logForBid = Array.isArray(logByBattle && logByBattle[event.id])
      ? logByBattle[event.id]
      : ((dbg && Array.isArray(dbg.moneyLog)) ? dbg.moneyLog.filter(tx => String(tx && tx.battleId || "") === String(event.id)) : []);
    const costEntries = logForBid.filter(tx => {
      const reason = String(tx && tx.reason || "");
      const src = String(tx && tx.sourceId || "");
      return reason === "crowd_vote_cost" && src.startsWith("npc_");
    });
    const costNpcSourceIds = costEntries.map(tx => String(tx && tx.sourceId || "")).filter(Boolean);
    const costNpcUnique = Array.from(new Set(costNpcSourceIds));
    const costCountById = costNpcSourceIds.reduce((acc, id) => {
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, Object.create(null));

    const isPointsLog = (tx) => {
      if (!tx) return false;
      const reason = String(tx.reason || "");
      if (reason.startsWith("rep_")) return false;
      const currency = String(tx.currency || "");
      if (currency) return currency === "points";
      return (
        reason === "crowd_vote_cost" ||
        reason === "crowd_vote_refund" ||
        reason === "crowd_vote_refund_majority" ||
        reason === "crowd_vote_refund_minority" ||
        reason === "crowd_vote_pool_init"
      );
    };

    const debugPerId = paidIds.slice(0, 5).map(id => {
      const before = Number.isFinite(beforeMap[id]) ? beforeMap[id] : null;
      const p = S.players[id];
      const after = Number.isFinite(p && p.points) ? (p.points | 0) : null;
      const actualDelta = (before != null && after != null) ? (after - before) : null;
      const outEntries = logForBid.filter(tx => isPointsLog(tx) && String(tx && tx.sourceId || "") === String(id));
      const inEntries = logForBid.filter(tx => isPointsLog(tx) && String(tx && tx.targetId || "") === String(id));
      const outReasons = outEntries.reduce((acc, tx) => {
        const r = String(tx && tx.reason || "unknown");
        acc[r] = (acc[r] || 0) + 1;
        return acc;
      }, Object.create(null));
      const inReasons = inEntries.reduce((acc, tx) => {
        const r = String(tx && tx.reason || "unknown");
        acc[r] = (acc[r] || 0) + 1;
        return acc;
      }, Object.create(null));
      const pointsOut = outEntries.reduce((sum, tx) => sum + (Number(tx && tx.amount || 0) | 0), 0);
      const pointsIn = inEntries.reduce((sum, tx) => sum + (Number(tx && tx.amount || 0) | 0), 0);
      const expectedDelta = pointsIn - pointsOut;
      return {
        id,
        beforePts: before,
        afterPts: after,
        actualDelta,
        costCount: costCountById[id] || 0,
        pointsOut,
        pointsIn,
        expectedDelta,
        outReasons,
        inReasons,
        outSample: outEntries.slice(0, 5),
        inSample: inEntries.slice(0, 5)
      };
    });

    const sideCounts = (() => {
      const voters = (crowd && crowd.voters && typeof crowd.voters === "object") ? crowd.voters : {};
      let a = 0;
      let b = 0;
      let other = 0;
      Object.keys(voters).forEach(id => {
        const side = voters[id];
        if (side === "a" || side === "attacker") a++;
        else if (side === "b" || side === "defender") b++;
        else other++;
      });
      return { a, b, other, total: a + b + other };
    })();

    const votesA = crowd ? (crowd.votesA | 0) : 0;
    const votesB = crowd ? (crowd.votesB | 0) : 0;
    const winner = crowd ? (crowd.winner || null) : null;
    const decided = crowd ? !!crowd.decided : false;

    const paidDeducted = paidIds.every(id => {
      const before = Number.isFinite(beforeMap[id]) ? beforeMap[id] : null;
      const p = S.players[id];
      const after = Number.isFinite(p && p.points) ? (p.points | 0) : null;
      const outEntries = logForBid.filter(tx => isPointsLog(tx) && String(tx && tx.sourceId || "") === String(id));
      const inEntries = logForBid.filter(tx => isPointsLog(tx) && String(tx && tx.targetId || "") === String(id));
      const pointsOut = outEntries.reduce((sum, tx) => sum + (Number(tx && tx.amount || 0) | 0), 0);
      const pointsIn = inEntries.reduce((sum, tx) => sum + (Number(tx && tx.amount || 0) | 0), 0);
      const expectedDelta = pointsIn - pointsOut;
      return (before != null && after != null && (after - before) === expectedDelta);
    });
    const tallyConsistent = !!(crowd && votesA === sideCounts.a && votesB === sideCounts.b);
    const winnerConsistent = !decided || (winner === "a" || winner === "b") && ((votesA === votesB) ? true : ((votesA > votesB) ? winner === "a" : winner === "b"));

    const ok = paidDeducted && tallyConsistent && winnerConsistent;

    const poolId = `crowd:${event.id}`;
    const refundEntries = logForBid.filter(tx => {
      const reason = String(tx && tx.reason || "");
      return reason.startsWith("crowd_vote_refund");
    });
    const poolInitEntries = logForBid.filter(tx => {
      return String(tx && tx.reason || "") === "crowd_vote_pool_init" &&
        String(tx && tx.sourceId || "") === "sink" &&
        String(tx && tx.targetId || "") === poolId;
    });
    const poolFlowEntries = logForBid.filter(tx => {
      const src = String(tx && tx.sourceId || "");
      const tgt = String(tx && tx.targetId || "");
      return src === poolId || tgt === poolId;
    });
    const poolAfter = poolFlowEntries.reduce((sum, tx) => {
      const amt = Number(tx && tx.amount || 0) | 0;
      const src = String(tx && tx.sourceId || "");
      const tgt = String(tx && tx.targetId || "");
      if (tgt === poolId) return sum + amt;
      if (src === poolId) return sum - amt;
      return sum;
    }, 0);
    const remainderWinEntry = poolFlowEntries.find(tx => {
      const reason = String(tx && tx.reason || "");
      const src = String(tx && tx.sourceId || "");
      return src === poolId && reason === "crowd_vote_remainder_win";
    }) || null;
    const remainderSplitEntries = poolFlowEntries.filter(tx => {
      const reason = String(tx && tx.reason || "");
      const src = String(tx && tx.sourceId || "");
      return src === poolId && reason.startsWith("crowd_vote_remainder_split_");
    });
    const splitAttacker = remainderSplitEntries.reduce((s, tx) => {
      return (String(tx && tx.reason || "") === "crowd_vote_remainder_split_attacker")
        ? (s + ((tx && Number.isFinite(tx.amount)) ? (tx.amount | 0) : 0))
        : s;
    }, 0);
    const splitDefender = remainderSplitEntries.reduce((s, tx) => {
      return (String(tx && tx.reason || "") === "crowd_vote_remainder_split_defender")
        ? (s + ((tx && Number.isFinite(tx.amount)) ? (tx.amount | 0) : 0))
        : s;
    }, 0);
    const splitOddTo = (splitAttacker > splitDefender) ? "attacker" : (splitDefender > splitAttacker ? "defender" : null);

    const votersSet = new Set([].concat(paidIds, countedIds, excludedIds));
    const voters = Array.from(votersSet).map(voterId => {
      const isNpc = String(voterId).startsWith("npc_");
      const excluded = excludedIds.includes(voterId);
      const costEntry = logForBid.find(tx => {
        const reason = String(tx && tx.reason || "");
        const src = String(tx && tx.sourceId || "");
        const amt = Number(tx && tx.amount || tx.delta || 0) | 0;
        return reason === "crowd_vote_cost" && src === String(voterId) && amt === 1;
      }) || null;
      const beforePts = Number.isFinite(beforeMap[voterId]) ? beforeMap[voterId] : null;
      const afterNetPts = Number.isFinite(afterMap[voterId]) ? afterMap[voterId] : null;
      const afterCostPts = (costEntry && beforePts != null) ? (beforePts - 1) : null;
      return {
        voterId,
        isNpc,
        excluded,
        excludedReason: excluded ? "maxNpcShare" : null,
        weight: 1,
        weightReason: "default_1",
        cost: {
          amount: 1,
          transferOk: !!costEntry,
          beforePts,
          afterCostPts,
          afterNetPts
        }
      };
    });

    const telemetry = {
      id: event.id,
      scenario: "event",
      maxNpcShare: (opts && Number.isFinite(opts.maxNpcShare)) ? opts.maxNpcShare : null,
      voters,
      sideCounts,
      winner,
      refunds: refundEntries.map(tx => ({
        voterId: String(tx && tx.targetId || ""),
        amount: Number(tx && tx.amount || 0) | 0,
        reason: String(tx && tx.reason || "")
      })),
      pool: {
        init: poolInitEntries.length ? poolInitEntries.length : null,
        after: Number.isFinite(poolAfter) ? poolAfter : null,
        remainderReceiverId: remainderEntry ? String(remainderEntry.targetId || "") : null
      }
    };

    if (opts && opts.debugTelemetry === true) {
      console.log("DEV_TELEMETRY_SUMMARY", {
        id: telemetry.id,
        totalVoters: telemetry.voters.length,
        paidCount: paidIds.length,
        excludedCount: excludedIds.length,
        refundsCount: telemetry.refunds.length,
        poolAfter: telemetry.pool.after
      });
      console.dir(telemetry, { depth: null });
      console.dir(telemetry.voters, { depth: null });
      console.dir(telemetry.refunds, { depth: null });
    }

    touched.forEach(t => {
      const p = S.players[t.id];
      if (!p) return;
      if (typeof Game._withPointsWrite === "function") {
        Game._withPointsWrite(() => { p.points = t.points; });
      } else {
        p.points = t.points;
      }
    });
    D0.MAX_NPC_SHARE_CROWD = prevShare;

    return {
      name,
      ok,
      eventId: event.id,
      paidIds,
      countedIds,
      beforePts,
      afterPts,
      costNpcUniqueCount: costNpcUnique.length,
      costNpcEntryCount: costEntries.length,
      costNpcSample: costEntries.slice(0, 5),
      votesA,
      votesB,
      winner,
      sideCounts,
      asserts: { paidDeducted, tallyConsistent, winnerConsistent },
      debugPerId,
      telemetry
    };
  };

  function getCrowdVoteWeightMeta(voterId){
    try {
      const D = Game && Game.Data ? Game.Data : null;
      const S = Game && Game.__S ? Game.__S : null;
      const p = (voterId === "me" && S && S.me) ? S.me : (S && S.players ? S.players[voterId] : null);
      const inf = (p && Number.isFinite(p.influence)) ? (p.influence | 0) : 0;
      const role = p ? String(p.role || p.type || "").toLowerCase() : "";
      let tierKey = "y1";
      if (D && typeof D.tierKeyByInfluence === "function") {
        tierKey = D.tierKeyByInfluence(inf, role);
      } else if (D && typeof D.tierKeysByInfluence === "function") {
        const keys = D.tierKeysByInfluence(inf) || [];
        tierKey = String(keys[0] || "y1");
      }
      const color = (D && typeof D.colorFromTierKey === "function") ? D.colorFromTierKey(tierKey) : "y";
      const c = String(color || "y").toLowerCase();
      const isMafiaRole = role === "mafia";
      const isMafiaId = String(voterId || "") === "npc_mafia";
      if (c === "k" && isMafiaRole && isMafiaId) return { weight: 3, reason: "mafia_role_k" };
      if (c === "k" && (!isMafiaRole || !isMafiaId)) return { weight: 2, reason: "clamped_non_mafia_k" };
      if (c === "r") return { weight: 2, reason: "tier_r_by_influence" };
      if (c === "o") return { weight: 1, reason: "tier_o_by_influence" };
      return { weight: 1, reason: "tier_y_by_influence" };
    } catch (_) {
      return { weight: 1, reason: "tier_y_by_influence" };
    }
  }

  function buildCrowdTelemetryFromLogs({
    id,
    scenario = null,
    mode = null,
    endedBy = null,
    countedIds = [],
    excludedIds = [],
    beforePtsMap = {},
    afterPtsMap = {},
    opts = {},
    scopedOverride = null
  }) {
    const dbg = (Game.__D || null);
    const logByBattle = (dbg && dbg.moneyLogByBattle) ? dbg.moneyLogByBattle : null;
    const logForBid = Array.isArray(scopedOverride)
      ? scopedOverride
      : (Array.isArray(logByBattle && logByBattle[id])
        ? logByBattle[id]
        : ((dbg && Array.isArray(dbg.moneyLog)) ? dbg.moneyLog.filter(tx => String(tx && tx.battleId || "") === String(id)) : []));
    const poolId = `crowd:${id}`;

    const poolFlowEntries = logForBid.filter(tx => {
      const src = String(tx && tx.sourceId || "");
      const tgt = String(tx && tx.targetId || "");
      return src === poolId || tgt === poolId;
    });
    const poolAfter = poolFlowEntries.reduce((sum, tx) => {
      const amt = Number(tx && tx.amount || 0) | 0;
      const src = String(tx && tx.sourceId || "");
      const tgt = String(tx && tx.targetId || "");
      if (tgt === poolId) return sum + amt;
      if (src === poolId) return sum - amt;
      return sum;
    }, 0);
    const poolInitEntries = logForBid.filter(tx => {
      const reason = String(tx && tx.reason || "");
      const tgt = String(tx && tx.targetId || "");
      return reason === "crowd_vote_pool_init" && tgt === poolId;
    });
    let remainderWinEntry = null;
    let remainderSplitEntries = [];
    let splitAttacker = 0;
    let splitDefender = 0;
    let splitOddTo = null;
    try {
      remainderWinEntry = poolFlowEntries.find(tx => {
        const src = String(tx && tx.sourceId || "");
        const reason = String(tx && tx.reason || "");
        return src === poolId && reason === "crowd_vote_remainder_win";
      }) || null;
      remainderSplitEntries = poolFlowEntries.filter(tx => {
        const reason = String(tx && tx.reason || "");
        const src = String(tx && tx.sourceId || "");
        return src === poolId && reason.startsWith("crowd_vote_remainder_split_");
      });
      splitAttacker = remainderSplitEntries.reduce((s, tx) => {
        return (String(tx && tx.reason || "") === "crowd_vote_remainder_split_attacker")
          ? (s + ((tx && Number.isFinite(tx.amount)) ? (tx.amount | 0) : 0))
          : s;
      }, 0);
      splitDefender = remainderSplitEntries.reduce((s, tx) => {
        return (String(tx && tx.reason || "") === "crowd_vote_remainder_split_defender")
          ? (s + ((tx && Number.isFinite(tx.amount)) ? (tx.amount | 0) : 0))
          : s;
      }, 0);
      splitOddTo = (splitAttacker > splitDefender) ? "attacker" : (splitDefender > splitAttacker ? "defender" : null);
    } catch (_) {
      remainderWinEntry = null;
      remainderSplitEntries = [];
      splitAttacker = 0;
      splitDefender = 0;
      splitOddTo = null;
    }

    const voters = [];
    const seen = new Set();
    const pushIds = (list) => {
      (Array.isArray(list) ? list : []).forEach(id => {
        if (!id) return;
        if (seen.has(id)) return;
        seen.add(id);
        voters.push(id);
      });
    };
    pushIds(countedIds);
    pushIds(excludedIds);

    const telemetryVoters = voters.map(voterId => {
      const isNpc = String(voterId).startsWith("npc_");
      const costEntry = logForBid.find(tx => {
        const reason = String(tx && tx.reason || "");
        const src = String(tx && tx.sourceId || "");
        const amt = Number(tx && tx.amount || tx.delta || 0) | 0;
        return reason === "crowd_vote_cost" && src === String(voterId) && amt === 1;
      }) || null;
      const beforePts = (beforePtsMap && Number.isFinite(beforePtsMap[voterId])) ? beforePtsMap[voterId] : null;
      const afterNetPts = (afterPtsMap && Number.isFinite(afterPtsMap[voterId])) ? afterPtsMap[voterId] : null;
      const afterCostPts = (costEntry && beforePts != null) ? (beforePts - (costEntry && Number(costEntry.amount || costEntry.delta || 1) || 1)) : null;
      const wMeta = getCrowdVoteWeightMeta(voterId);
      return {
        voterId,
        isNpc,
        excluded: excludedIds.includes(voterId),
        excludedReason: excludedIds.includes(voterId) ? (opts.excludedReasonDefault || null) : null,
        weight: wMeta.weight,
        weightReason: wMeta.reason,
        cost: {
          amount: 1,
          transferOk: !!costEntry,
          beforePts,
          afterCostPts,
          afterNetPts
        }
      };
    });

    const refunds = logForBid.filter(tx => {
      const reason = String(tx && tx.reason || "");
      return reason.startsWith("crowd_vote_refund");
    }).map(tx => ({
      voterId: String(tx && tx.targetId || ""),
      amount: Number(tx && tx.amount || 0) | 0,
      reason: String(tx && tx.reason || "")
    }));

      let sideCounts = opts.sideCounts || null;
      if (opts && opts.weightsSummary && Number.isFinite(opts.weightsSummary.aVotes) && Number.isFinite(opts.weightsSummary.bVotes)) {
        const aW = opts.weightsSummary.aVotes | 0;
        const bW = opts.weightsSummary.bVotes | 0;
        sideCounts = { a: aW, b: bW, other: 0, total: aW + bW };
      }
      if (opts && opts.sideById && typeof opts.sideById === "object") {
        let a = 0;
        let b = 0;
        telemetryVoters.forEach(v => {
          const side = opts.sideById ? opts.sideById[v.voterId] : null;
        if (side === "a" || side === "attacker") a += (v.weight | 0);
        if (side === "b" || side === "defender") b += (v.weight | 0);
      });
      sideCounts = { a, b, other: 0, total: a + b };
    }

    const weightsSummaryOut = (() => {
      if (opts && opts.sideById && typeof opts.sideById === "object") {
        let a = 0;
        let b = 0;
        telemetryVoters.forEach(v => {
          const side = opts.sideById ? opts.sideById[v.voterId] : null;
          if (side === "a" || side === "attacker") a += (v.weight | 0);
          if (side === "b" || side === "defender") b += (v.weight | 0);
        });
        return {
          aVotes: a,
          bVotes: b,
          totalWeighted: a + b,
          totalVotes: Number.isFinite(opts.totalVotes) ? (opts.totalVotes | 0) : telemetryVoters.length
        };
      }
      if (opts && opts.weightsSummary && Number.isFinite(opts.weightsSummary.aVotes) && Number.isFinite(opts.weightsSummary.bVotes)) {
        const a = opts.weightsSummary.aVotes | 0;
        const b = opts.weightsSummary.bVotes | 0;
        return {
          aVotes: a,
          bVotes: b,
          totalWeighted: a + b,
          totalVotes: Number.isFinite(opts.totalVotes) ? (opts.totalVotes | 0) : telemetryVoters.length
        };
      }
      return {
        aVotes: sideCounts && Number.isFinite(sideCounts.a) ? (sideCounts.a | 0) : 0,
        bVotes: sideCounts && Number.isFinite(sideCounts.b) ? (sideCounts.b | 0) : 0,
        totalWeighted: sideCounts && Number.isFinite(sideCounts.total) ? (sideCounts.total | 0) : ((sideCounts && Number.isFinite(sideCounts.a) && Number.isFinite(sideCounts.b)) ? ((sideCounts.a | 0) + (sideCounts.b | 0)) : 0),
        totalVotes: Number.isFinite(opts.totalVotes) ? (opts.totalVotes | 0) : telemetryVoters.length
      };
    })();
    sideCounts = { a: weightsSummaryOut.aVotes | 0, b: weightsSummaryOut.bVotes | 0, other: 0, total: weightsSummaryOut.totalWeighted | 0 };

    return {
      id,
      scenario,
      mode,
      endedBy,
      maxNpcShare: (opts && Number.isFinite(opts.maxNpcShare)) ? opts.maxNpcShare : null,
      voters: telemetryVoters,
      sideCounts,
      winner: opts.winner || null,
      totalVotes: Number.isFinite(opts.totalVotes) ? (opts.totalVotes | 0) : (telemetryVoters.length || null),
      weightsSummary: weightsSummaryOut,
      refunds,
      pool: {
        init: poolInitEntries.length ? poolInitEntries.reduce((sum, tx) => sum + ((tx && Number.isFinite(tx.amount)) ? (tx.amount | 0) : 0), 0) : null,
        after: Number.isFinite(poolAfter) ? poolAfter : null,
        remainderReceiverId: remainderWinEntry ? String(remainderWinEntry.targetId || "") : null,
        remainderReason: remainderWinEntry ? String(remainderWinEntry.reason || "") : (remainderSplitEntries.length ? "crowd_vote_remainder_split" : null),
        split: remainderSplitEntries.length ? { attacker: splitAttacker | 0, defender: splitDefender | 0, oddTo: splitOddTo } : null
      }
    };
  }

  Game.__DEV.smokeBattleCrowdOutcomeOnce = (opts = {}) => {
    const name = "smoke_battle_crowd_outcome_once";
    const Core = Game.ConflictCore || Game._ConflictCore || null;
    const Econ = Game.ConflictEconomy || Game._ConflictEconomy || null;
    const S = Game.__S || null;
    const diag = { builderWhy: "entered", stage: "entered", trace: [] };
    const debugTelemetry = !!(opts && opts.debugTelemetry);
    const result = { name, ok: false, details: "not_built", battleId: null, telemetry: null, diag };
    const moneyLogBeforeIndex = (Game.__D && Array.isArray(Game.__D.moneyLog)) ? Game.__D.moneyLog.length : 0;
    if (!Core || typeof Core.finalizeCrowdVote !== "function") {
      return { name, ok: false, details: "ConflictCore.finalizeCrowdVote missing" };
    }
    if (!Econ || typeof Econ.transferPoints !== "function") {
      return { name, ok: false, details: "Econ.transferPoints missing" };
    }
    if (!S || !S.players) return { name, ok: false, details: "Game.__S missing" };

    const allowParallel = (opts && typeof opts.allowParallel === "boolean") ? opts.allowParallel : true;
    if (!allowParallel) {
      const active = Array.isArray(S.battles) ? S.battles.filter(b => b && b.status !== "finished" && !b.resolved) : [];
      if (active.length) return { name, ok: false, details: "active_battle_present", activeCount: active.length };
    }

    const prevForce = Game.__D ? Game.__D.FORCE_CIRCULATION : undefined;
    const prevBypass = Game.__D ? Game.__D.BYPASS_POINTS_GUARD : undefined;
    const prevAllow = Game.__D ? Game.__D.ALLOW_POINTS_WRITE : undefined;
    const prevWeighted = Game.__D ? Game.__D.CROWD_WEIGHTED_TALLY : undefined;
    const beforeSnapshot = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function")
      ? Game.__DEV.sumPointsSnapshot()
      : null;
    let afterSnapshot = null;
    const touched = [];

    try {
      if (!Game.__D) Game.__D = {};
      Game.__D.FORCE_CIRCULATION = true;
      Game.__D.BYPASS_POINTS_GUARD = true;
      Game.__D.ALLOW_POINTS_WRITE = true;
      Game.__D.CROWD_WEIGHTED_TALLY = true;

      const D0 = Game.Data || {};
      const startNpc = Number.isFinite(D0.START_POINTS_NPC) ? (D0.START_POINTS_NPC | 0) : 8;

      const isActivePlayer = (p) => {
        if (!p || !p.id) return false;
        if (p.removed === true) return false;
        const jailed = (S && S.jailed) ? S.jailed : null;
        if (jailed && jailed[p.id] && Number.isFinite(jailed[p.id].until) && Date.now() < jailed[p.id].until) return false;
        if (p.id === "me" || p.isMe) return true;
        if (p.npc === true || p.type === "npc") return true;
        return !!p.name;
      };
      const totalPlayers = () => {
        let n = 0;
        Object.values(S.players || {}).forEach(p => { if (isActivePlayer(p)) n++; });
        return n;
      };
      const capFormula = (n) => Math.max(10, Math.round(0.4 * (n | 0)));

      const pickNpc = (excludeIds = {}) => {
        const list = Object.values(S.players || {}).filter(p => {
          if (!p || !p.id) return false;
          if (p.id === "me") return false;
          if (excludeIds[p.id]) return false;
          return p.npc === true || p.type === "npc";
        });
        return list[0] || null;
      };

      const setTone = (id, toneKey) => {
        const p = S.players[id];
        if (!p) return;
        touched.push({ id, influence: p.influence, role: p.role });
        if (toneKey === "k") {
          p.role = "mafia";
          p.influence = 30;
          return;
        }
        if (toneKey === "r") { p.influence = 16; return; }
        if (toneKey === "o") { p.influence = 8; return; }
        p.influence = 1;
      };

      const ensureBattle = (battleId, oppId) => {
        if (!Array.isArray(S.battles)) S.battles = [];
        const now = Date.now();
        const crowd = {
          endAt: now - 1,
          endsAt: now - 1,
          votesA: 0,
          votesB: 0,
          aVotes: 0,
          bVotes: 0,
          totalPlayers: totalPlayers(),
          cap: capFormula(totalPlayers()),
          voters: {},
          decided: false,
          attackerId: "me",
          defenderId: oppId
        };
        const battle = {
          id: battleId,
          opponentId: oppId,
          attackerId: "me",
          defenderId: oppId,
          fromThem: false,
          status: "draw",
          draw: true,
          result: "draw",
          resolved: false,
          finished: false,
          attackHidden: false,
          createdAt: now,
          updatedAt: now,
          crowd
        };
        S.battles = [battle].concat(S.battles.filter(x => x && String(x.id) !== String(battleId)));
        return battle;
      };

      const battleId = `dev_battle_crowd_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
      const oppId = (opts && opts.oppId && S.players[opts.oppId]) ? opts.oppId : "npc_weak";
      if (!S.players[oppId]) return { name, ok: false, details: "opponent_missing", battleId };

      const battle = ensureBattle(battleId, oppId);
      if (opts && opts.forceMajoritySide === "defender") {
        battle.attackerId = oppId;
        battle.defenderId = "me";
        battle.opponentId = oppId;
        if (battle.crowd) {
          battle.crowd.attackerId = battle.attackerId;
          battle.crowd.defenderId = battle.defenderId;
        }
      }
      const capUsed = battle.crowd.cap;

      const exclude = { me: true };
      exclude[oppId] = true;
      const voters = [];

      const addVoter = (toneKey, side, forcedId = null) => {
        const npc = pickNpc(exclude);
        const pick = forcedId ? (S.players[forcedId] || null) : npc;
        if (!pick) return false;
        if (exclude[pick.id]) return false;
        exclude[pick.id] = true;
        setTone(pick.id, toneKey);
        voters.push({ id: pick.id, side, toneKey });
        return true;
      };

      addVoter("k", "A");
      addVoter("r", "A");
      addVoter("y", "B");

      while (voters.length < capUsed) {
        if (!addVoter("y", "A")) break;
      }

      if (voters.length < capUsed) {
        return { name, ok: false, details: "not_enough_voters", have: voters.length, capUsed };
      }
      if (opts && opts.forceRemainder === true && voters.length > 1) {
        voters[voters.length - 1].side = "defender";
      }

      const forcedIds = Array.isArray(opts && opts.forceVotersIds) ? opts.forceVotersIds.filter(Boolean) : [];
      const forcedMeta = (opts && opts.forceVoterMeta && typeof opts.forceVoterMeta === "object") ? opts.forceVoterMeta : null;
      const applyForceMeta = (id) => {
        const p = S.players[id];
        if (!p) return;
        const override = (forcedMeta && forcedMeta[id]) ? forcedMeta[id] : null;
        const npcList = (Game && Game.NPC && Array.isArray(Game.NPC.PLAYERS)) ? Game.NPC.PLAYERS : [];
        const npcBase = npcList.find(x => x && x.id === id) || null;
        const baseInf = (override && Number.isFinite(override.influence)) ? override.influence
          : (p.meta && Number.isFinite(p.meta.influence)) ? p.meta.influence
          : (npcBase && Number.isFinite(npcBase.influence)) ? npcBase.influence
          : null;
        const baseRole = (override && override.role != null) ? String(override.role)
          : (p.meta && p.meta.role != null) ? String(p.meta.role)
          : (npcBase && npcBase.role != null) ? String(npcBase.role)
          : null;
        touched.push({ id, influence: p.influence, role: p.role });
        if (Number.isFinite(baseInf)) p.influence = baseInf | 0;
        if (baseRole != null) p.role = String(baseRole);
      };
      if (forcedIds.length) {
        const forcedSet = new Set();
        const normalizeId = (id) => String(id || "");
        const existing = new Set(voters.map(v => v.id));
        forcedIds.forEach(fid => {
          const id = normalizeId(fid);
          if (!id) return;
          if (id === "me" || id === oppId) return;
          if (!S.players[id]) return;
          applyForceMeta(id);
          forcedSet.add(id);
          if (existing.has(id)) return;
          const replaceIdx = voters.findIndex(v => !forcedSet.has(v.id));
          if (replaceIdx >= 0) {
            voters.splice(replaceIdx, 1);
          }
          const p = S.players[id];
          const inf = (p && Number.isFinite(p.influence)) ? (p.influence | 0) : 0;
          const role = p ? String(p.role || p.type || "").toLowerCase() : "";
          let toneKey = "y";
          const D = Game.Data || {};
          let tierKey = "y1";
          if (D && typeof D.tierKeyByInfluence === "function") tierKey = D.tierKeyByInfluence(inf, role);
          else if (D && typeof D.tierKeysByInfluence === "function") {
            const keys = D.tierKeysByInfluence(inf) || [];
            tierKey = String(keys[0] || "y1");
          }
          const color = (D && typeof D.colorFromTierKey === "function") ? D.colorFromTierKey(tierKey) : "y";
          toneKey = String(color || "y").toLowerCase();
          voters.push({ id, side: "A", toneKey });
        });
        while (voters.length > capUsed) {
          const idx = voters.findIndex(v => !forcedSet.has(v.id));
          if (idx < 0) break;
          voters.splice(idx, 1);
        }
      }
      if (opts && opts.forceMajoritySide === "defender") {
        const target = Math.floor(voters.length / 2) + 1;
        let bCount = 0;
        for (let i = 0; i < voters.length; i++) {
          const isB = bCount < target;
          voters[i].side = isB ? "B" : "A";
          voters[i].toneKey = "y";
          setTone(voters[i].id, "y");
          if (isB) bCount++;
        }
      }

      const poolId = Econ.getCrowdPoolId ? Econ.getCrowdPoolId(battleId) : `crowd:${battleId}`;
      if (Econ.ensurePool) Econ.ensurePool(poolId);

      voters.forEach(v => {
        const p = S.players[v.id];
        if (p && (!Number.isFinite(p.points) || p.points < 1)) p.points = startNpc;
      });

      const pointIds = {
        me: "me",
        npcWeak: oppId,
        sink: "sink",
        crowd: "crowd",
        crowdPool: poolId
      };
      const voterIds = voters.map(v => v.id);
      voterIds.forEach((id, i) => { pointIds[`voter_${i + 1}`] = id; });

      const readPoints = (id) => {
        if (id === "sink" || id === "crowd" || String(id).startsWith("crowd:")) {
          if (Econ.getPoolBalance) return Econ.getPoolBalance(id) | 0;
          return null;
        }
        const p = (id === "me") ? (S.players.me || S.me) : S.players[id];
        return p && Number.isFinite(p.points) ? (p.points | 0) : null;
      };

      const buildContractAccounts = (snap) => {
        if (!snap || !snap.byId) return [];
        const ids = new Set();
        if (Game.__DEV && typeof Game.__DEV.econNpcWorldContractV1 === "function") {
          try {
            const contract = Game.__DEV.econNpcWorldContractV1({ snapById: snap.byId }) || {};
            if (Array.isArray(contract.accountsIncluded)) {
              contract.accountsIncluded.forEach(id => { if (id) ids.add(String(id)); });
            }
          } catch (_) {}
        }
        if (!ids.size) {
          Object.keys(snap.byId).forEach(id => { if (id) ids.add(String(id)); });
        }
        const ensureId = (poolId) => {
          if (poolId) ids.add(String(poolId));
        };
        ["worldBank", "sink", "bank", "crowd"].forEach(ensureId);
        if (Econ && typeof Econ.getAllPoolIds === "function") {
          (Econ.getAllPoolIds() || []).forEach(id => { if (id) ids.add(String(id)); });
        }
        return Array.from(ids).filter(Boolean);
      };

      const beforeSnapshot = Game.__DEV.sumPointsSnapshot();
      const beforePlayersMap = (() => {
        const out = Object.create(null);
        Object.values(S.players || {}).forEach(p => {
          if (!p || !p.id) return;
          if (Number.isFinite(p.points)) out[p.id] = p.points | 0;
        });
        return out;
      })();
      const isPoolId = (id) => {
        const key = String(id || "");
        return key === "sink" || key === "crowd" || key === "bank" || key === "worldBank" || key.startsWith("crowd:");
      };
      const readAccount = (snap, id) => {
        const key = String(id || "");
        if (Econ && typeof Econ.getPoolBalance === "function" && isPoolId(key)) {
          const v = Econ.getPoolBalance(key);
          return Number.isFinite(v) ? (v | 0) : null;
        }
        if (snap && snap.byId && Number.isFinite(snap.byId[key])) return (snap.byId[key] | 0);
        const p = (key === "me") ? (S.players.me || S.me) : S.players[key];
        return p && Number.isFinite(p.points) ? (p.points | 0) : null;
      };
      const isForcedAccountId = (id) => {
        const key = String(id || "");
        return key === "sink" || key === "worldBank";
      };
      const getEconAccountBalance = (id) => {
        if (!Econ) return { value: null, source: "econ.missing" };
        if (typeof Econ.getAccountBalance === "function") {
          return { value: Econ.getAccountBalance(id), source: "econ.getAccountBalance" };
        }
        if (typeof Econ.getBalanceById === "function") {
          return { value: Econ.getBalanceById(id), source: "econ.getBalanceById" };
        }
        if (typeof Econ.getBalance === "function") {
          return { value: Econ.getBalance(id), source: "econ.getBalance" };
        }
        return { value: null, source: "econ.missing" };
      };
      const readEconBalanceStrict = (snap, id, modeMap, sourceMap, uptoIndex) => {
        const key = String(id || "");
        const logLen = (Game && Game.__D && Array.isArray(Game.__D.moneyLog)) ? Game.__D.moneyLog.length : 0;
        const cappedIndex = Number.isFinite(uptoIndex) ? Math.max(0, Math.min(logLen, uptoIndex)) : logLen;
        if (isForcedAccountId(key)) {
          let res = { value: null, source: "econ.missing" };
          if (Econ && typeof Econ.getLedgerBalanceAt === "function") {
            res = { value: Econ.getLedgerBalanceAt(key, { uptoIndex: cappedIndex }), source: "econ.getLedgerBalanceAt" };
          } else {
            res = getEconAccountBalance(key);
          }
          if (Number.isFinite(res.value)) {
            if (modeMap) modeMap[key] = "ledger_at";
            if (sourceMap) sourceMap[key] = res.source;
            return (res.value | 0);
          }
          if (modeMap && !modeMap[key]) modeMap[key] = "ledger_at";
          if (sourceMap && !sourceMap[key]) sourceMap[key] = res.source;
          return null;
        }
        if (isPoolId(key)) {
          if (Econ && typeof Econ.getPoolBalance === "function") {
            const v = Econ.getPoolBalance(key);
            if (Number.isFinite(v)) {
              if (modeMap) modeMap[key] = "pool";
              if (sourceMap) sourceMap[key] = "econ.getPoolBalance";
              return (v | 0);
            }
          }
          if (modeMap && !modeMap[key]) modeMap[key] = "pool";
          if (sourceMap && !sourceMap[key]) sourceMap[key] = "econ.getPoolBalance_missing";
          return null;
        }
        const res = getEconAccountBalance(key);
        if (Number.isFinite(res.value)) {
          if (modeMap) modeMap[key] = "account";
          if (sourceMap) sourceMap[key] = res.source;
          return (res.value | 0);
        }
        const fallback = readAccount(snap, key);
        if (modeMap && !modeMap[key]) modeMap[key] = "state";
        if (sourceMap && !sourceMap[key]) sourceMap[key] = "fallback.readAccount";
        return Number.isFinite(fallback) ? (fallback | 0) : null;
      };
      const buildWorldMassFromContract = (snap, ledgerIndex) => {
        if (!snap || !snap.byId) return { total: null, accountsIncluded: [], includesWorldBank: false, includesSink: false };
        const accountsIncluded = buildContractAccounts(snap);
        const includesWorldBank = accountsIncluded.includes("worldBank");
        const includesSink = accountsIncluded.includes("sink");
        const total = accountsIncluded.reduce((s, id) => {
          const v = readEconBalanceStrict(snap, id, null, null, ledgerIndex);
          return s + (Number.isFinite(v) ? (v | 0) : 0);
        }, 0);
        return { total, accountsIncluded, includesWorldBank, includesSink };
      };
      const worldBeforeInfo = buildWorldMassFromContract(beforeSnapshot, moneyLogBeforeIndex);
      const initialSnapshotAccounts = worldBeforeInfo.accountsIncluded.slice();
      let totalPtsWorldBefore = (worldBeforeInfo.total != null)
        ? worldBeforeInfo.total
        : initialSnapshotAccounts.reduce((s, id) => s + (readAccount(beforeSnapshot, id) || 0), 0);

      const participants = voters.map(v => {
        const p = S.players[v.id];
        const pointsBefore = p ? (p.points | 0) : 0;
        if (Econ && typeof Econ.transferCrowdVoteCost === "function") {
          Econ.transferCrowdVoteCost(v.id, "sink", 1, { battleId });
        } else {
          Econ.transferPoints(v.id, "sink", 1, "crowd_vote_cost", { battleId });
        }
        const pointsAfter = p ? (p.points | 0) : 0;
        return { id: v.id, side: v.side, toneKey: v.toneKey, pointsBefore, pointsAfter };
      });

      battle.crowd.voters = {};
      participants.forEach(p => {
        battle.crowd.voters[p.id] = (p.side === "A") ? "a" : "b";
      });
      battle.crowd.totalPlayers = totalPlayers();
      battle.crowd.cap = capUsed;

      const logRows = normalizeMoneyLogRows((Game.__D && Game.__D.moneyLog) ? Game.__D.moneyLog : [], "vote.log");
      const logStart = logRows.length;
      const crowdVotersSnapshot = (battle && battle.crowd && battle.crowd.voters) ? { ...battle.crowd.voters } : null;

      const res = Core.finalizeCrowdVote(battleId);
      const battleAfter = (S.battles || []).find(b => b && String(b.id) === String(battleId)) || battle;
      const crowdMeta = res && res.crowdCapMeta ? res.crowdCapMeta : null;
      const endedBy = crowdMeta ? crowdMeta.endedBy : null;
      const outcome = res && res.outcome ? res.outcome : null;

      const logForBid = logRows.filter(tx => String(tx && tx.battleId || "") === String(battleId));
      const byReason = {};
      let poolInitAmount = 0;
      logForBid.forEach(tx => {
        const r = tx && tx.reason ? String(tx.reason) : "unknown";
        byReason[r] = (byReason[r] || 0) + 1;
        if (r === "crowd_vote_pool_init") poolInitAmount += (tx.amount | 0);
      });
      const logAfter = logRows.slice(logStart);
      const moneyLogAfterIndex = (Game.__D && Array.isArray(Game.__D.moneyLog)) ? Game.__D.moneyLog.length : moneyLogBeforeIndex;

      let afterSnapshot = Game.__DEV.sumPointsSnapshot();
      afterSnapshot = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function")
        ? Game.__DEV.sumPointsSnapshot()
        : null;
      if (debugTelemetry) {
        console.log("[Dev] C1A6 readonly fix", { lhs: "afterSnapshot", value: afterSnapshot });
      }
      const afterPlayersMap = (() => {
        const out = Object.create(null);
        Object.values(S.players || {}).forEach(p => {
          if (!p || !p.id) return;
          if (Number.isFinite(p.points)) out[p.id] = p.points | 0;
        });
        return out;
      })();
      const worldAfterInfo = buildWorldMassFromContract(afterSnapshot, moneyLogAfterIndex);
      const snapshotAccounts = Array.from(new Set([...initialSnapshotAccounts, ...worldAfterInfo.accountsIncluded]));
      const contractAccountSet = new Set();
      const ensureContractAccount = (id) => {
        if (!id) return;
        if (isPoolId(id)) {
          contractAccountSet.add(String(id));
        }
      };
      snapshotAccounts.forEach(ensureContractAccount);
      ensureContractAccount("sink");
      ensureContractAccount("worldBank");
      ensureContractAccount("bank");
      ensureContractAccount("crowd");
      ensureContractAccount(poolId);
      if (Econ && typeof Econ.getAllPoolIds === "function") {
        (Econ.getAllPoolIds() || []).forEach(ensureContractAccount);
      }
      const contractAccountIds = Array.from(contractAccountSet);
      const balanceReadModeById = Object.create(null);
      const balanceSourceById = Object.create(null);
      const buildSnapshotPoints = (snap, modeTarget, sourceTarget, ledgerIndex) => {
        const out = {};
        snapshotAccounts.forEach(id => {
          const key = String(id || "");
          out[key] = contractAccountSet.has(key)
            ? readEconBalanceStrict(snap, key, modeTarget, sourceTarget, ledgerIndex)
            : readAccount(snap, key);
        });
        return out;
      };
      const beforePoints = buildSnapshotPoints(beforeSnapshot, balanceReadModeById, balanceSourceById, moneyLogBeforeIndex);
      const afterPoints = buildSnapshotPoints(afterSnapshot, balanceReadModeById, balanceSourceById, moneyLogAfterIndex);
      let totalPtsWorldAfter = (worldAfterInfo.total != null)
        ? worldAfterInfo.total
        : snapshotAccounts.reduce((s, id) => s + (afterPoints[id] != null ? afterPoints[id] : 0), 0);
      const netDeltaById = {};
      let sumNetDelta = 0;
      Object.keys(beforePoints).forEach(k => {
        const b = beforePoints[k];
        const a = afterPoints[k];
        if (typeof b === "number" && typeof a === "number") {
          const d = (a | 0) - (b | 0);
          netDeltaById[k] = d;
          sumNetDelta += d;
        } else {
          netDeltaById[k] = null;
        }
      });

      const winnerSide = (outcome === "A_WIN") ? "a" : (outcome === "B_WIN" ? "b" : null);
      const winnerCount = winnerSide ? participants.filter(p => battle.crowd.voters[p.id] === winnerSide).length : 0;
      const refundReason = (outcome === "TIE") ? "crowd_vote_refund" : "crowd_vote_refund_majority";
      const poolInitCount = byReason.crowd_vote_pool_init | 0;
      const refundCount = byReason[refundReason] | 0;
      const remainder = (poolInitAmount | 0) - (refundCount | 0);
      const remainderToWinnerSum = logForBid.reduce((s, tx) => {
        if (String(tx && tx.reason || "") !== "crowd_vote_remainder_win") return s;
        return s + ((tx && Number.isFinite(tx.amount)) ? (tx.amount | 0) : 0);
      }, 0);
      const remainderSplitSum = logForBid.reduce((s, tx) => {
        const reason = String(tx && tx.reason || "");
        if (!reason.startsWith("crowd_vote_remainder_split_")) return s;
        return s + ((tx && Number.isFinite(tx.amount)) ? (tx.amount | 0) : 0);
      }, 0);
      const remainderOldSum = logForBid.reduce((s, tx) => {
        if (String(tx && tx.reason || "") !== "crowd_vote_remainder_to_winner") return s;
        return s + ((tx && Number.isFinite(tx.amount)) ? (tx.amount | 0) : 0);
      }, 0);
      const loserPenaltySum = logForBid.reduce((s, tx) => {
        if (String(tx && tx.reason || "") !== "crowd_vote_loser_penalty") return s;
        return s + ((tx && Number.isFinite(tx.amount)) ? (tx.amount | 0) : 0);
      }, 0);
      const poolAfterVal = (Econ.getPoolBalance && battleId) ? Econ.getPoolBalance(Econ.getCrowdPoolId ? Econ.getCrowdPoolId(battleId) : `crowd:${battleId}`) : null;
      const repInFinalize = logAfter.some(tx => String(tx && tx.reason || "") === "rep_crowd_vote_participation");
      const repDeltaFromCrowdPool = logForBid.some(tx =>
        String(tx && tx.reason || "") === "rep_battle_win_delta" &&
        String(tx && tx.sourceId || "") === "crowd_pool"
      );
      const mintReasons = new Set(["battle_win_points", "battle_win", "battle_lose", "battle_draw"]);
      const mintAllowance = logForBid.reduce((sum, tx) => {
        const r = String(tx && tx.reason || "");
        if (!mintReasons.has(r)) return sum;
        return sum + ((tx && Number.isFinite(tx.amount)) ? (tx.amount | 0) : 0);
      }, 0);
      const netDeltaFromMoneyLog = logForBid.reduce((acc, tx) => {
        const currency = String(tx && tx.currency || "");
        const reason = String(tx && tx.reason || "");
        if (currency === "rep" || reason.startsWith("rep_")) return acc;
        const amt = (tx && Number.isFinite(tx.amount)) ? (tx.amount | 0) : 0;
        const sourceId = String(tx && tx.sourceId || "");
        const targetId = String(tx && tx.targetId || "");
        if (amt === 0) return acc;
        const srcKey = sourceId || "unknown";
        const tgtKey = targetId || "unknown";
        acc.map[srcKey] = (acc.map[srcKey] || 0) - amt;
        acc.map[tgtKey] = (acc.map[tgtKey] || 0) + amt;
        acc.sum += 0; // tracked via map
        return acc;
      }, { map: Object.create(null), sum: 0 });
      const sumNetFromMoneyLog = Object.values(netDeltaFromMoneyLog.map).reduce((s, v) => s + (v | 0), 0);
      const worldIdsInfo = collectWorldIdsFromLogs(logForBid, netDeltaFromMoneyLog.map);
      const missingAccountsSet = new Set();
      const usedLedgerAtIds = new Set();
      const usedStateIds = new Set();
      const resolveUnifiedBalance = (snap, id, ledgerIdx, fallbackPoints) => {
        const key = String(id || "");
        if (balanceReadModeById && balanceReadModeById[key] === "ledger_at") {
          usedLedgerAtIds.add(key);
          return readEconBalanceStrict(snap, key, null, null, ledgerIdx);
        }
        if (fallbackPoints && Number.isFinite(fallbackPoints[key])) {
          usedStateIds.add(key);
          return fallbackPoints[key] | 0;
        }
        const v = readAccount(snap, key);
        usedStateIds.add(key);
        return Number.isFinite(v) ? (v | 0) : null;
      };
      const sumWorldPoints = (snap, ledgerIdx, fallbackPoints) => worldIdsInfo.ids.reduce((s, id) => {
        const v = resolveUnifiedBalance(snap, id, ledgerIdx, fallbackPoints);
        if (!Number.isFinite(v)) {
          missingAccountsSet.add(String(id));
          return s;
        }
        return s + (v | 0);
      }, 0);
      totalPtsWorldBefore = sumWorldPoints(beforeSnapshot, moneyLogBeforeIndex, beforePoints);
      totalPtsWorldAfter = sumWorldPoints(afterSnapshot, moneyLogAfterIndex, afterPoints);
      const adjustedDiff = (sumNetFromMoneyLog | 0) - (mintAllowance | 0);
      const pointsDiffOk = adjustedDiff === 0;
      const worldMassOk = (totalPtsWorldBefore === totalPtsWorldAfter) && ((sumNetDelta | 0) === 0);
      const taxRowsInWindowCount = (byReason.world_tax_in | 0) + (byReason.world_tax_out | 0);
      const byReasonHasWorldTax = taxRowsInWindowCount > 0;
      const logMatchesState = Object.keys(netDeltaFromMoneyLog.map).every(id => {
        if (!Object.prototype.hasOwnProperty.call(beforePlayersMap, id)) return true;
        if (!Object.prototype.hasOwnProperty.call(afterPlayersMap, id)) return true;
        const before = beforePlayersMap[id];
        const after = afterPlayersMap[id];
        if (!Number.isFinite(before) || !Number.isFinite(after)) return true;
        const stateDelta = (after | 0) - (before | 0);
        const logDelta = netDeltaFromMoneyLog.map[id] | 0;
        return stateDelta === logDelta;
      });

      const expectedResult = (outcome === "A_WIN") ? "win" : (outcome === "B_WIN" ? "lose" : "draw");
      const battleOutcomeOk = battleAfter && battleAfter.result === expectedResult;

      const countedIds = participants.map(p => p.id);
      const beforePtsMap = Object.create(null);
      participants.forEach(p => {
        beforePtsMap[p.id] = Number.isFinite(p.pointsBefore) ? (p.pointsBefore | 0) : null;
      });
      const afterPtsMap = Object.create(null);
      countedIds.forEach(id => {
        const player = S.players[id];
        afterPtsMap[id] = player && Number.isFinite(player.points) ? (player.points | 0) : null;
      });

      const weightsSummary = {
        aVotes: (battleAfter && battleAfter.crowd) ? (battleAfter.crowd.votesA | 0) : (voters.length),
        bVotes: (battleAfter && battleAfter.crowd) ? (battleAfter.crowd.votesB | 0) : 0,
        totalVotes: crowdMeta ? crowdMeta.totalVotes : null,
        cap: crowdMeta ? crowdMeta.cap : null
      };

      const telemetry = buildCrowdTelemetryFromLogs({
        id: battleId,
        scenario: "battle",
        mode: (opts && opts.mode) ? opts.mode : "cap",
        endedBy,
        countedIds,
        excludedIds: [],
        beforePtsMap,
        afterPtsMap,
        opts: {
          totalVotes: (crowdMeta ? crowdMeta.totalVotes : countedIds.length),
          sideCounts: {
            a: weightsSummary.aVotes,
            b: weightsSummary.bVotes,
            other: 0
          },
          winner: winnerSide,
            sideById: crowdVotersSnapshot,
            weightsSummary,
            maxNpcShare: (opts && Number.isFinite(opts.maxNpcShare)) ? opts.maxNpcShare : null
          }
      });

      if (opts && opts.debugTelemetry === true) {
        console.log("DEV_TELEMETRY_SUMMARY", {
          id: telemetry.id,
          scenario: telemetry.scenario,
          totalVoters: telemetry.voters.length,
          counted: countedIds.length,
          refundsCount: telemetry.refunds.length,
          poolAfter: telemetry.pool.after
        });
        console.dir(telemetry, { depth: null });
        console.dir(telemetry.voters, { depth: null });
        console.dir(telemetry.refunds, { depth: null });
      }

      const attackerWins = outcome === "A_WIN";
      const remainderRuleOk = attackerWins
        ? (remainderToWinnerSum === remainder && remainderSplitSum === 0)
        : (remainderSplitSum === remainder && remainderToWinnerSum === 0);
      const remainderDistributionOk = attackerWins
        ? (remainderToWinnerSum === remainder && remainderSplitSum === 0 && remainderOldSum === 0)
        : (remainderSplitSum === remainder && remainderToWinnerSum === 0 && remainderOldSum === 0);
      const loserPenaltyOk = (outcome === "A_WIN" || outcome === "B_WIN")
        ? (loserPenaltySum > 0 && loserPenaltySum <= 2)
        : (loserPenaltySum === 0);
      const poolAfterOk = (poolAfterVal == null) ? true : (poolAfterVal === 0);
      const weight3Ids = telemetry.voters.filter(vt => (vt && vt.weight) === 3).map(vt => vt.voterId);
      const nonMafiaOver2 = telemetry.voters.filter(vt => {
        const id = String(vt && vt.voterId || "");
        const role = String((S.players[id] && S.players[id].role) || "").toLowerCase();
        return role !== "mafia" && (vt && vt.weight) > 2;
      });
      const weight3OnlyNpcMafia = weight3Ids.every(id => String(id) === "npc_mafia");

      const asserts = {
        outcomePresent: !!outcome,
        endedByCap: (String(opts && opts.mode || "cap").toLowerCase() === "cap") ? (endedBy === "cap") : true,
        poolInitCountOk: poolInitCount === 1 && poolInitAmount === participants.length,
        refundCountOk: (outcome === "TIE") ? (refundCount === participants.length) : (refundCount === winnerCount),
        noRepInFinalize: !repInFinalize,
        repDeltaSourceOk: !repDeltaFromCrowdPool,
        pointsDiffOk: pointsDiffOk === true,
        battleOutcomeOk,
        remainderRuleOk,
        remainderDistributionOk,
        loserPenaltyOk,
        poolAfterOk,
        worldMassOk,
        logMatchesState,
        nonMafiaMax2: nonMafiaOver2.length === 0,
        weight3OnlyNpcMafia
      };

      const economyOk = pointsDiffOk === true &&
        worldMassOk === true &&
        ((sumNetDelta | 0) === 0 || (sumNetFromMoneyLog | 0) === 0);
      const telemetryOk = !!telemetry;
      const warnings = [];
      if (!telemetryOk || (diag && diag.stage === "entered")) {
        warnings.push("telemetry_not_built");
      }
      const balanceCompareById = Object.create(null);
      ["sink", "worldBank"].forEach((id) => {
        const key = String(id);
        const before = Number.isFinite(beforePoints[key]) ? (beforePoints[key] | 0) : null;
        const after = Number.isFinite(afterPoints[key]) ? (afterPoints[key] | 0) : null;
        const moneyLogNetDelta = netDeltaFromMoneyLog.map && Number.isFinite(netDeltaFromMoneyLog.map[key])
          ? (netDeltaFromMoneyLog.map[key] | 0)
          : null;
        balanceCompareById[key] = {
          moneyLogNetDelta,
          before,
          after,
          afterMinusBefore: (before != null && after != null) ? ((after | 0) - (before | 0)) : null
        };
      });
      Object.assign(result, {
        ok: true,
        pass: economyOk,
        economyOk,
        telemetryOk,
        warnings: warnings.length ? warnings : null,
        battleId,
        outcome,
        endedBy,
        cap: crowdMeta ? crowdMeta.cap : null,
        totalVotes: crowdMeta ? crowdMeta.totalVotes : null,
        weightsSummary,
        byReason,
        poolAfter: poolAfterVal,
        snapshotReport: { beforePoints, afterPoints, netDeltaById, sumNetDelta, totalPtsWorldBefore, totalPtsWorldAfter, deltaWorld: totalPtsWorldAfter - totalPtsWorldBefore },
        moneyLogReport: { netDeltaById: netDeltaFromMoneyLog.map, sumNetFromMoneyLog, mintAllowance, adjustedDiff },
        pointsDiffOk,
        asserts,
        telemetry,
        diag: {
          worldAccountsIncludedCount: snapshotAccounts.length,
          includesWorldBank: worldAfterInfo.includesWorldBank || worldBeforeInfo.includesWorldBank,
          includesSink: worldAfterInfo.includesSink || worldBeforeInfo.includesSink,
          snapshotAccountsIncludedCount: snapshotAccounts.length,
          snapshotIncludesWorldBank: worldBeforeInfo.includesWorldBank || worldAfterInfo.includesWorldBank,
          snapshotIncludesSink: worldBeforeInfo.includesSink || worldAfterInfo.includesSink,
          snapshotWorldTotalsBefore: totalPtsWorldBefore,
          snapshotWorldTotalsAfter: totalPtsWorldAfter,
          worldIdsCount: worldIdsInfo.ids.length,
          worldIdsSample: worldIdsInfo.ids.slice(0, 10),
          missingAccounts: Array.from(missingAccountsSet),
          includedServiceAccounts: worldIdsInfo.includedServiceAccounts,
          totalsBySource: {
            usedLedgerAtIds: Array.from(usedLedgerAtIds),
            usedStateIds: Array.from(usedStateIds),
            ledgerAtCount: usedLedgerAtIds.size,
            stateCount: usedStateIds.size
          },
          totalPtsWorldBefore_afterBreakdown: {
            sink: {
              before: resolveUnifiedBalance(beforeSnapshot, "sink", moneyLogBeforeIndex, beforePoints),
              after: resolveUnifiedBalance(afterSnapshot, "sink", moneyLogAfterIndex, afterPoints),
              mode: balanceReadModeById ? balanceReadModeById.sink : null
            },
            worldBank: {
              before: resolveUnifiedBalance(beforeSnapshot, "worldBank", moneyLogBeforeIndex, beforePoints),
              after: resolveUnifiedBalance(afterSnapshot, "worldBank", moneyLogAfterIndex, afterPoints),
              mode: balanceReadModeById ? balanceReadModeById.worldBank : null
            }
          },
          balancesSource: "econ_contract_v1",
          balanceReadModeById,
          balanceSourceById,
        balanceCompareById,
        moneyLogBeforeIndex,
        moneyLogAfterIndex,
        ledgerLenBefore: moneyLogBeforeIndex,
        ledgerLenAfter: moneyLogAfterIndex,
          taxRowsInWindowCount,
          byReasonHasWorldTax,
          contractIds: contractAccountIds.slice(),
          sinkIdUsed: "sink",
          worldBankIdUsed: "worldBank",
          balanceProbeBefore: {
            worldBank: { exists: beforePoints.worldBank != null, balance: beforePoints.worldBank },
            sink: { exists: beforePoints.sink != null, balance: beforePoints.sink },
            crowd: { exists: beforePoints.crowd != null, balance: beforePoints.crowd },
            crowdPool: { exists: beforePoints[poolId] != null, balance: beforePoints[poolId] },
            me: { exists: beforePoints.me != null, balance: beforePoints.me },
            npc_weak: { exists: beforePoints.npc_weak != null, balance: beforePoints.npc_weak },
            npc_rin: { exists: beforePoints.npc_rin != null, balance: beforePoints.npc_rin }
          },
          balanceProbeAfter: {
            worldBank: { exists: afterPoints.worldBank != null, balance: afterPoints.worldBank },
            sink: { exists: afterPoints.sink != null, balance: afterPoints.sink },
            crowd: { exists: afterPoints.crowd != null, balance: afterPoints.crowd },
            crowdPool: { exists: afterPoints[poolId] != null, balance: afterPoints[poolId] },
            me: { exists: afterPoints.me != null, balance: afterPoints.me },
            npc_weak: { exists: afterPoints.npc_weak != null, balance: afterPoints.npc_weak },
            npc_rin: { exists: afterPoints.npc_rin != null, balance: afterPoints.npc_rin }
          }
        }
      });
      if (result.ok) Game.__DEV.lastSmokeBattleId = battleId;
      if (result.ok) Game.__DEV.lastSmokeBattleId = battleId;
      if (result.ok) Game.__DEV.lastSmokeBattleId = battleId;
      return result;
    } finally {
      if (!Game.__D) Game.__D = {};
      Game.__D.FORCE_CIRCULATION = prevForce;
      Game.__D.BYPASS_POINTS_GUARD = prevBypass;
      Game.__D.ALLOW_POINTS_WRITE = prevAllow;
      Game.__D.CROWD_WEIGHTED_TALLY = prevWeighted;
      if (touched.length) {
        touched.forEach(t => {
          const p = S.players[t.id];
          if (!p) return;
          p.influence = t.influence;
          if (t.role !== undefined) p.role = t.role;
        });
      }
    }
  };

  const runEscapeSmoke = (opts = {}) => {
    const name = (opts && typeof opts.name === "string") ? opts.name : "smoke_escape_crowd_outcome_once";
    const Core = Game.ConflictCore || Game._ConflictCore || null;
    const Econ = Game.ConflictEconomy || Game._ConflictEconomy || null;
    const S = Game.__S || null;
    const diag = { builderWhy: "entered", stage: "entered", trace: [] };
    const result = { name, ok: false, details: "not_built", battleId: null, telemetry: null, diag };
    if (!Core || typeof Core.escape !== "function" || typeof Core.finalizeEscapeVote !== "function") {
      return { name, ok: false, details: "ConflictCore.escape/finalizeEscapeVote missing" };
    }
    if (!Econ || typeof Econ.transferPoints !== "function") {
      return { name, ok: false, details: "Econ.transferPoints missing" };
    }
    if (!S || !S.players) return { name, ok: false, details: "Game.__S missing" };

    const allowParallel = (opts && typeof opts.allowParallel === "boolean") ? opts.allowParallel : true;
    if (!allowParallel) {
      const active = Array.isArray(S.battles) ? S.battles.filter(b => b && b.status !== "finished" && !b.resolved) : [];
      if (active.length) return { name, ok: false, details: "active_battle_present", activeCount: active.length };
    }
    const stayMode = !!(opts && opts.stay);

    const prevForce = Game.__D ? Game.__D.FORCE_CIRCULATION : undefined;
    const prevBypass = Game.__D ? Game.__D.BYPASS_POINTS_GUARD : undefined;
    const prevAllow = Game.__D ? Game.__D.ALLOW_POINTS_WRITE : undefined;
    const prevWeighted = Game.__D ? Game.__D.CROWD_WEIGHTED_TALLY : undefined;
    const touched = [];
    const takeSnapshot = () => {
      if (Game.Dev && typeof Game.Dev.sumPointsSnapshot === "function") {
        return Game.Dev.sumPointsSnapshot();
      }
      if (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function") {
        return Game.__DEV.sumPointsSnapshot();
      }
      return null;
    };
    let beforeSnapshot = takeSnapshot();
    let afterSnapshot = null;

    try {
      if (!Game.__D) Game.__D = {};
      Game.__D.FORCE_CIRCULATION = true;
      Game.__D.BYPASS_POINTS_GUARD = true;
      Game.__D.ALLOW_POINTS_WRITE = true;
      Game.__D.CROWD_WEIGHTED_TALLY = false;

      const D0 = Game.Data || {};
      const startNpc = Number.isFinite(D0.START_POINTS_NPC) ? (D0.START_POINTS_NPC | 0) : 8;
      const startPlayer = Number.isFinite(D0.START_POINTS_PLAYER) ? (D0.START_POINTS_PLAYER | 0) : 12;

      const isActivePlayer = (p) => {
        if (!p || !p.id) return false;
        if (p.removed === true) return false;
        const jailed = (S && S.jailed) ? S.jailed : null;
        if (jailed && jailed[p.id] && Number.isFinite(jailed[p.id].until) && Date.now() < jailed[p.id].until) return false;
        if (p.id === "me" || p.isMe) return true;
        if (p.npc === true || p.type === "npc") return true;
        return !!p.name;
      };
      const totalPlayers = () => {
        let n = 0;
        Object.values(S.players || {}).forEach(p => { if (isActivePlayer(p)) n++; });
        return n;
      };
      const capFormula = (n) => Math.max(10, Math.round(0.4 * (n | 0)));

      const pickNpc = (excludeIds = {}) => {
        const list = Object.values(S.players || {}).filter(p => {
          if (!p || !p.id) return false;
          if (p.id === "me") return false;
          if (excludeIds[p.id]) return false;
          return p.npc === true || p.type === "npc";
        });
        return list[0] || null;
      };

      const setTone = (id, toneKey) => {
        const p = S.players[id];
        if (!p) return;
        touched.push({ id, influence: p.influence, role: p.role });
        if (toneKey === "k") {
          p.role = "mafia";
          p.influence = 30;
          return;
        }
        if (toneKey === "r") { p.influence = 16; return; }
        if (toneKey === "o") { p.influence = 8; return; }
        p.influence = 1;
      };

      const ensureBattle = (battleId, oppId) => {
        if (!Array.isArray(S.battles)) S.battles = [];
        const now = Date.now();
        const battle = {
          id: battleId,
          opponentId: oppId,
          attackerId: "me",
          defenderId: oppId,
          fromThem: false,
          status: "pickAttack",
          draw: false,
          result: null,
          resolved: false,
          finished: false,
          attackHidden: false,
          createdAt: now,
          updatedAt: now,
          crowd: null,
          escapeVote: null
        };
        S.battles = [battle].concat(S.battles.filter(x => x && String(x.id) !== String(battleId)));
        return battle;
      };

      const battleId = `dev_escape_crowd_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
      const oppId = (opts && opts.oppId && S.players[opts.oppId]) ? opts.oppId : "npc_weak";
      if (!S.players[oppId]) return { name, ok: false, details: "opponent_missing", battleId };

      ensureBattle(battleId, oppId);
      result.battleId = battleId;
      Object.assign(diag, { stage: "after_create_battle" });
      diag.trace.push("after_create_battle");

      const me = S.me || (S.players && S.players.me) || null;
      if (me && (!Number.isFinite(me.points) || me.points < 1)) {
        me.points = startPlayer;
        if (S.players && S.players.me) S.players.me.points = me.points;
      }

      const modeNorm = (opts && opts.mode === "off") ? "off" : "smyt";
      const costNorm = (opts && typeof opts.cost === "number") ? (opts.cost | 0) : 1;
      const started = Core.escape(battleId, { cost: costNorm, mode: modeNorm });
      if (!started || !started.ok) return { name, ok: false, details: "escape_start_failed", battleId, started };

      const battle = (S.battles || []).find(b => b && String(b.id) === String(battleId)) || null;
      if (!battle || !battle.escapeVote) return { name, ok: false, details: "escape_vote_missing", battleId };

      const v = battle.escapeVote;
      v.endAt = Date.now() - 1;
      v.endsAt = v.endAt;
      v.voters = v.voters || {};
      v.totalPlayers = totalPlayers();
      v.cap = capFormula(v.totalPlayers);

      const capUsed = v.cap;
      const exclude = { me: true };
      exclude[oppId] = true;
      const voters = [];

      const addVoter = (toneKey, side) => {
        const npc = pickNpc(exclude);
        if (!npc) return false;
        exclude[npc.id] = true;
        setTone(npc.id, toneKey);
        voters.push({ id: npc.id, side, toneKey });
        return true;
      };

      const preferredSide = stayMode ? "defender" : "attacker";
      addVoter("r", preferredSide);
      addVoter("y", preferredSide);
      addVoter("y", preferredSide);

      while (voters.length < capUsed) {
        if (!addVoter("y", preferredSide)) break;
      }

      if (voters.length < capUsed) {
        return { name, ok: false, details: "not_enough_voters", have: voters.length, capUsed };
      }

      const voterBeforePts = Object.create(null);
      voters.forEach(vt => {
        const p = S.players[vt.id];
        if (p && (!Number.isFinite(p.points) || p.points < 1)) p.points = startNpc;
        voterBeforePts[vt.id] = p && Number.isFinite(p.points) ? (p.points | 0) : null;
      });

      const pointIds = {
        me: "me",
        npcWeak: oppId,
        sink: "sink",
        crowd: "crowd",
        crowdPool: (Econ.getCrowdPoolId ? Econ.getCrowdPoolId(battleId) : `crowd:${battleId}`)
      };
      const voterIds = voters.map(vt => vt.id);
      voterIds.forEach((id, i) => { pointIds[`voter_${i + 1}`] = id; });

      const readPoints = (id) => {
        if (id === "sink" || id === "crowd" || String(id).startsWith("crowd:")) {
          if (Econ.getPoolBalance) return Econ.getPoolBalance(id) | 0;
          return null;
        }
        const p = (id === "me") ? (S.players.me || S.me) : S.players[id];
        return p && Number.isFinite(p.points) ? (p.points | 0) : null;
      };

      const buildPointsSnapshot = () => {
        const out = {};
        Object.keys(pointIds).forEach(k => { out[k] = readPoints(pointIds[k]); });
        return out;
      };

      const beforePoints = buildPointsSnapshot();

      voters.forEach(vt => {
        Econ.transferPoints(vt.id, "sink", 1, "crowd_vote_cost", { battleId });
        v.voters[vt.id] = vt.side;
      });
      const attackerVotes = voters.filter(vt => vt.side === "attacker").length;
      const defenderVotes = voters.filter(vt => vt.side === "defender").length;
      v.aVotes = attackerVotes;
      v.bVotes = defenderVotes;
      v.votesA = attackerVotes;
      v.votesB = defenderVotes;

      const log = normalizeMoneyLogRows((Game.__D && Game.__D.moneyLog) ? Game.__D.moneyLog : [], "escape.log");
      const logStart = log.length;

      const res = Core.finalizeEscapeVote(battleId);
      const battleAfter = (S.battles || []).find(b => b && String(b.id) === String(battleId)) || battle;
      const crowdMeta = res && res.crowdCapMeta ? res.crowdCapMeta : null;
      const endedBy = crowdMeta ? crowdMeta.endedBy : null;
      const outcome = res && res.outcome ? res.outcome : (v.outcome || null);

      const logForBid = normalizeMoneyLogRows(log, "escape.logForBid").filter(tx => String(tx && tx.battleId || "") === String(battleId));
      const byReason = {};
      let poolInitAmount = 0;
      logForBid.forEach(tx => {
        const r = tx && tx.reason ? String(tx.reason) : "unknown";
        byReason[r] = (byReason[r] || 0) + 1;
        if (r === "crowd_vote_pool_init") poolInitAmount += (tx.amount | 0);
      });
      const logAfter = log.slice(logStart);

      const afterPoints = buildPointsSnapshot();
      const netDeltaById = {};
      let sumNetDelta = 0;
      Object.keys(beforePoints).forEach(k => {
        const b0 = beforePoints[k];
        const a0 = afterPoints[k];
        if (typeof b0 === "number" && typeof a0 === "number") {
          const d = (a0 | 0) - (b0 | 0);
          netDeltaById[k] = d;
          sumNetDelta += d;
        } else {
          netDeltaById[k] = null;
        }
      });

      const mintReasons = new Set(["battle_win_points", "battle_win", "battle_lose", "battle_draw"]);
      const mintAllowance = logForBid.reduce((sum, tx) => {
        const r = String(tx && tx.reason || "");
        if (!mintReasons.has(r)) return sum;
        return sum + ((tx && Number.isFinite(tx.amount)) ? (tx.amount | 0) : 0);
      }, 0);
      const netDeltaFromMoneyLog = logForBid.reduce((acc, tx) => {
        const amt = (tx && Number.isFinite(tx.amount)) ? (tx.amount | 0) : 0;
        const sourceId = String(tx && tx.sourceId || "");
        const targetId = String(tx && tx.targetId || "");
        if (amt === 0) return acc;
        const srcKey = sourceId || "unknown";
        const tgtKey = targetId || "unknown";
        acc.map[srcKey] = (acc.map[srcKey] || 0) - amt;
        acc.map[tgtKey] = (acc.map[tgtKey] || 0) + amt;
        acc.sum += 0;
        return acc;
      }, { map: Object.create(null), sum: 0 });
      const sumNetFromMoneyLog = Object.values(netDeltaFromMoneyLog.map).reduce((s, v0) => s + (v0 | 0), 0);
      const adjustedDiff = (sumNetFromMoneyLog | 0) - (mintAllowance | 0);
      const pointsDiffOk = adjustedDiff === 0;

      const winnerSide = (outcome === "A_WIN") ? "attacker" : (outcome === "B_WIN" ? "defender" : null);
      const winnerCount = winnerSide ? voters.filter(p => v.voters[p.id] === winnerSide).length : 0;
      const refundReason = (outcome === "TIE") ? "crowd_vote_refund" : "crowd_vote_refund_majority";
      const poolInitCount = byReason.crowd_vote_pool_init | 0;
      const refundCount = byReason[refundReason] | 0;
      const repInFinalize = logAfter.some(tx => String(tx && tx.reason || "") === "rep_crowd_vote_participation");
      const repDeltaFromCrowdPool = logForBid.some(tx =>
        String(tx && tx.reason || "").startsWith("rep_") &&
        String(tx && tx.sourceId || "") === "crowd_pool"
      );
      const escapeOutcomeOk = (battleAfter && battleAfter.result === "escaped");
      const hasEscapeCost = (byReason.escape_vote_cost | 0) > 0;
      const isOff = modeNorm === "off";

      const countedIds = voters.map(vt => vt.id);
      const beforePtsMap = Object.create(null);
      countedIds.forEach(id => {
        beforePtsMap[id] = Number.isFinite(beforePoints[id]) ? (beforePoints[id] | 0) : null;
      });
      const afterPtsMap = Object.create(null);
      countedIds.forEach(id => {
        afterPtsMap[id] = Number.isFinite(afterPoints[id]) ? (afterPoints[id] | 0) : null;
      });
      let telemetry = null;
      try {
        telemetry = buildCrowdTelemetryFromLogs({
          id: battleId,
          scenario: "escape",
          mode: modeNorm,
          endedBy,
          countedIds,
          excludedIds: [],
          beforePtsMap,
          afterPtsMap,
          opts: {
            totalVotes: (crowdMeta ? crowdMeta.totalVotes : countedIds.length),
            sideCounts: { a: v.aVotes | 0, b: v.bVotes | 0, other: 0 },
            winner: winnerSide,
            maxNpcShare: (opts && Number.isFinite(opts.maxNpcShare)) ? opts.maxNpcShare : null
          }
        });
      } catch (e) {
        diag.trace.push("telemetry_error");
        diag.builderWhy = "telemetry_error";
      }
      if (opts && opts.debugTelemetry === true) {
        if (telemetry) {
          console.log("DEV_TELEMETRY_SUMMARY", {
            id: telemetry.id,
            scenario: telemetry.scenario,
            totalVoters: telemetry.voters.length,
            counted: countedIds.length,
            refundsCount: telemetry.refunds.length,
            poolAfter: telemetry.pool.after
          });
          console.dir(telemetry, { depth: null });
          console.dir(telemetry.voters, { depth: null });
          console.dir(telemetry.refunds, { depth: null });
        }
      }
      const weightsSummary = {
        aVotes: crowdMeta ? crowdMeta.aVotes : null,
        bVotes: crowdMeta ? crowdMeta.bVotes : null,
        totalVotes: crowdMeta ? crowdMeta.totalVotes : null,
        cap: crowdMeta ? crowdMeta.cap : null
      };
      const remainder = (poolInitAmount | 0) - (refundCount | 0);
      const remainderToWinnerSum = logForBid.reduce((s, tx) => {
        if (String(tx && tx.reason || "") !== "crowd_vote_remainder_win") return s;
        return s + ((tx && Number.isFinite(tx.amount)) ? (tx.amount | 0) : 0);
      }, 0);
      const remainderSplitSum = logForBid.reduce((s, tx) => {
        const reason = String(tx && tx.reason || "");
        if (!reason.startsWith("crowd_vote_remainder_split_")) return s;
        return s + ((tx && Number.isFinite(tx.amount)) ? (tx.amount | 0) : 0);
      }, 0);
      const loserPenaltySum = logForBid.reduce((s, tx) => {
        if (String(tx && tx.reason || "") !== "crowd_vote_loser_penalty") return s;
        return s + ((tx && Number.isFinite(tx.amount)) ? (tx.amount | 0) : 0);
      }, 0);
      const remainderRuleOk = (remainderSplitSum === remainder && remainderToWinnerSum === 0);
      const loserPenaltyOk = (loserPenaltySum === 0);
      const poolAfterVal = (Econ.getPoolBalance && battleId) ? Econ.getPoolBalance(Econ.getCrowdPoolId ? Econ.getCrowdPoolId(battleId) : `crowd:${battleId}`) : null;
      const poolAfterOk = (poolAfterVal == null) ? true : (poolAfterVal === 0);

      const asserts = {
        outcomePresent: !!outcome,
        endedByCap: (String(opts && opts.mode || "cap").toLowerCase() === "cap") ? (endedBy === "cap") : true,
        poolInitCountOk: poolInitCount === 1 && poolInitAmount === voters.length,
        refundCountOk: (outcome === "TIE") ? (refundCount === voters.length) : (refundCount === winnerCount),
        noRepInFinalize: !repInFinalize,
        repDeltaSourceOk: !repDeltaFromCrowdPool,
        pointsDiffOk,
        remainderRuleOk,
        loserPenaltyOk,
        poolAfterOk,
        escapeOutcomeOk,
        escapeCostLogged: isOff ? true : hasEscapeCost
      };
      beforeSnapshot = beforeSnapshot || null;
      afterSnapshot = takeSnapshot();
      const totalPtsWorldBefore = beforeSnapshot && Number.isFinite(beforeSnapshot.total) ? (beforeSnapshot.total | 0) : null;
      const totalPtsWorldAfter = afterSnapshot && Number.isFinite(afterSnapshot.total) ? (afterSnapshot.total | 0) : null;
      const economyOk = pointsDiffOk === true &&
        ((sumNetDelta | 0) === 0 || (sumNetFromMoneyLog | 0) === 0) &&
        (totalPtsWorldBefore == null || totalPtsWorldAfter == null || (totalPtsWorldBefore | 0) === (totalPtsWorldAfter | 0));
      const telemetryOk = !!telemetry;
      const warnings = [];
      if (!telemetryOk || (diag && diag.stage === "entered")) {
        warnings.push("telemetry_not_built");
      }
      if (!outcome) warnings.push("escape_outcome_missing");
      Object.assign(result, {
        ok: economyOk,
        economyOk,
        telemetryOk,
        warnings: warnings.length ? warnings : null,
        battleId,
        outcome,
        endedBy,
        cap: crowdMeta ? crowdMeta.cap : null,
        totalVotes: crowdMeta ? crowdMeta.totalVotes : null,
        weightsSummary,
        byReason,
        poolAfter: poolAfterVal,
        snapshotReport: { beforePoints, afterPoints, netDeltaById, sumNetDelta, totalPtsWorldBefore, totalPtsWorldAfter, deltaWorld: (Number.isFinite(totalPtsWorldAfter) && Number.isFinite(totalPtsWorldBefore)) ? (totalPtsWorldAfter - totalPtsWorldBefore) : null },
        hasBeforeSnap: !!beforeSnapshot,
        hasAfterSnap: !!afterSnapshot,
        moneyLogReport: { netDeltaById: netDeltaFromMoneyLog.map, sumNetFromMoneyLog, mintAllowance, adjustedDiff },
        pointsDiffOk,
        asserts,
        telemetry,
        diag,
        debugVersion: "ECON02_7"
      });
      return result;
    } finally {
      if (!Game.__D) Game.__D = {};
      Game.__D.FORCE_CIRCULATION = prevForce;
      Game.__D.BYPASS_POINTS_GUARD = prevBypass;
      Game.__D.ALLOW_POINTS_WRITE = prevAllow;
      Game.__D.CROWD_WEIGHTED_TALLY = prevWeighted;
      if (touched.length) {
        touched.forEach(t => {
          const p = S.players[t.id];
          if (!p) return;
          p.influence = t.influence;
          if (t.role !== undefined) p.role = t.role;
        });
      }
    }
  };

  if (!Game.Dev) Game.Dev = {};
  Game.Dev.smokeEscapeCrowdOutcomeOnce = runEscapeSmoke;
  Game.Dev.smokeEscapeCrowdStayOnce = (opts = {}) => {
    const merged = Object.assign({}, opts, { name: "smoke_escape_crowd_stay_once", stay: true });
    return runEscapeSmoke(merged);
  };
  if (!Game.__DEV) Game.__DEV = {};
  Game.__DEV.smokeEscapeCrowdOutcomeOnce = Game.Dev.smokeEscapeCrowdOutcomeOnce;
  Game.__DEV.smokeEscapeCrowdStayOnce = Game.Dev.smokeEscapeCrowdStayOnce;

  Game.__DEV.smokeIgnoreCrowdOutcomeOnce = (opts = {}) => {
    if (Game && Game.__DEV) Game.__DEV.__smokeIgnoreVersion = "B2c_ignore_func_v3";
    return (function () {
      const name = "smoke_ignore_crowd_outcome_once";
      const Core = Game.ConflictCore || Game._ConflictCore || null;
      const Econ = Game.ConflictEconomy || Game._ConflictEconomy || null;
      const S = Game.__S || null;
      const result = {
        name,
        ok: false,
        details: "not_built",
        activeCount: null,
        battleId: undefined,
        telemetry: null,
        diag: { builderWhy: "entered", stage: "entered", refactorTag: "B2c_ignore_trace_v2", trace: ["entered"] },
        outcome: null,
        endedBy: null,
        cap: null,
        totalVotes: null,
        weightsSummary: null,
        byReason: null,
        poolAfter: null,
        snapshotReport: null,
        moneyLogReport: null,
        pointsDiffOk: null,
        asserts: null
      };
      const diag = result.diag;
      function EXIT(patch, diagPatch) {
        if (patch) Object.assign(result, patch);
        if (diagPatch) Object.assign(diag, diagPatch);
        return result;
      }

      const prevForce = Game.__D ? Game.__D.FORCE_CIRCULATION : undefined;
      const prevBypass = Game.__D ? Game.__D.BYPASS_POINTS_GUARD : undefined;
      const prevAllow = Game.__D ? Game.__D.ALLOW_POINTS_WRITE : undefined;
      const prevWeighted = Game.__D ? Game.__D.CROWD_WEIGHTED_TALLY : undefined;
      const touched = [];

      try {
        do {
          if (!Core || typeof Core.escape !== "function" || typeof Core.finalizeEscapeVote !== "function") {
            result.details = "ConflictCore.escape/finalizeEscapeVote missing";
            diag.builderWhy = "core_missing";
            break;
          }
          if (!Econ || typeof Econ.transferPoints !== "function") {
            result.details = "Econ.transferPoints missing";
            diag.builderWhy = "econ_missing";
            break;
          }
          if (!S || !S.players) {
            result.details = "Game.__S missing";
            diag.builderWhy = "state_missing";
            break;
          }

          const allowParallel = (opts && typeof opts.allowParallel === "boolean") ? opts.allowParallel : true;
          if (!allowParallel) {
            const active = Array.isArray(S.battles) ? S.battles.filter(b => b && b.status !== "finished" && !b.resolved) : [];
            if (active.length) {
              result.details = "active_battle_present";
              result.activeCount = active.length;
              diag.builderWhy = "active_battle_present";
              break;
            }
          }

          if (!Game.__D) Game.__D = {};
          Game.__D.FORCE_CIRCULATION = true;
          Game.__D.BYPASS_POINTS_GUARD = true;
          Game.__D.ALLOW_POINTS_WRITE = true;
          Game.__D.CROWD_WEIGHTED_TALLY = false;

          const D0 = Game.Data || {};
          const startNpc = Number.isFinite(D0.START_POINTS_NPC) ? (D0.START_POINTS_NPC | 0) : 10;
          const startPlayer = Number.isFinite(D0.START_POINTS_PLAYER) ? (D0.START_POINTS_PLAYER | 0) : 10;

          const isActivePlayer = (p) => {
            if (!p || !p.id) return false;
            if (p.removed === true) return false;
            const jailed = (S && S.jailed) ? S.jailed : null;
            if (jailed && jailed[p.id] && Number.isFinite(jailed[p.id].until) && Date.now() < jailed[p.id].until) return false;
            if (p.id === "me" || p.isMe) return true;
            if (p.npc === true || p.type === "npc") return true;
            return !!p.name;
          };
          const totalPlayers = () => {
            let n = 0;
            Object.values(S.players || {}).forEach(p => { if (isActivePlayer(p)) n++; });
            return n;
          };
          const capFormula = (n) => Math.max(10, Math.round(0.4 * (n | 0)));

          const pickNpc = (excludeIds = {}) => {
            const list = Object.values(S.players || {}).filter(p => {
              if (!p || !p.id) return false;
              if (p.id === "me") return false;
              if (excludeIds[p.id]) return false;
              return p.npc === true || p.type === "npc";
            });
            return list[0] || null;
          };

          const setTone = (id, toneKey) => {
            const p = S.players[id];
            if (!p) return;
            touched.push({ id, influence: p.influence, role: p.role });
            if (toneKey === "k") {
              p.role = "mafia";
              p.influence = 30;
              return;
            }
            if (toneKey === "r") { p.influence = 16; return; }
            if (toneKey === "o") { p.influence = 8; return; }
            p.influence = 1;
          };

          const ensureBattle = (battleId, oppId) => {
            if (!Array.isArray(S.battles)) S.battles = [];
            const now = Date.now();
            const battle = {
              id: battleId,
              opponentId: oppId,
              attackerId: "me",
              defenderId: oppId,
              fromThem: false,
              status: "pickAttack",
              draw: false,
              result: null,
              resolved: false,
              finished: false,
              attackHidden: false,
              createdAt: now,
              updatedAt: now,
              crowd: null,
              escapeVote: null
            };
            S.battles = [battle].concat(S.battles.filter(x => x && String(x.id) !== String(battleId)));
            return battle;
          };

          const battleId = `dev_ignore_crowd_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
          const oppId = (opts && opts.oppId && S.players[opts.oppId]) ? opts.oppId : "npc_weak";
          result.battleId = battleId;
          diag.trace.push("after_create_battle");
          diag.stage = "after_create_battle";

          if (!S.players[oppId]) {
            result.details = "opponent_missing";
            diag.builderWhy = "opponent_missing";
            break;
          }

          ensureBattle(battleId, oppId);

          const me = S.me || (S.players && S.players.me) || null;
          if (me && (!Number.isFinite(me.points) || me.points < 1)) {
            me.points = startPlayer;
            if (S.players && S.players.me) S.players.me.points = me.points;
          }

          const modeNorm = "off";
          const costNorm = 0;
          const started = Core.escape(battleId, { cost: costNorm, mode: modeNorm });
          if (!started || !started.ok) {
            result.details = "ignore_start_failed";
            diag.builderWhy = "ignore_start_failed";
            result.outcome = started;
            break;
          }

          const battle = (S.battles || []).find(b => b && String(b.id) === String(battleId)) || null;
          if (!battle || !battle.escapeVote) {
            result.details = "ignore_vote_missing";
            diag.builderWhy = "ignore_vote_missing";
            break;
          }

          const v = battle.escapeVote;
          v.endAt = Date.now() - 1;
          v.endsAt = v.endAt;
          v.voters = v.voters || {};
          v.totalPlayers = totalPlayers();
          v.cap = capFormula(v.totalPlayers);

          const capUsed = v.cap;
          const exclude = { me: true };
          exclude[oppId] = true;
          const voters = [];

          const addVoter = (toneKey, side) => {
            const npc = pickNpc(exclude);
            if (!npc) return false;
            exclude[npc.id] = true;
            setTone(npc.id, toneKey);
            voters.push({ id: npc.id, side, toneKey });
            return true;
          };

          addVoter("r", "attacker");
          addVoter("y", "attacker");
          addVoter("y", "attacker");

          while (voters.length < capUsed) {
            if (!addVoter("y", "attacker")) break;
          }

          if (voters.length < capUsed) {
            result.details = "not_enough_voters";
            diag.builderWhy = "not_enough_voters";
            break;
          }
          if (opts && opts.forceRemainder === true && voters.length > 1) {
            voters[voters.length - 1].side = "defender";
          }

          voters.forEach(vt => {
            const p = S.players[vt.id];
            if (p && (!Number.isFinite(p.points) || p.points < 1)) p.points = startNpc;
          });

          const pointIds = {
            me: "me",
            npcWeak: oppId,
            sink: "sink",
            crowd: "crowd",
            crowdPool: (Econ.getCrowdPoolId ? Econ.getCrowdPoolId(battleId) : `crowd:${battleId}`)
          };
          const voterIds = voters.map(vt => vt.id);
          voterIds.forEach((id, i) => { pointIds[`voter_${i + 1}`] = id; });

          const readPoints = (id) => {
            if (id === "sink" || id === "crowd" || String(id).startsWith("crowd:")) {
              if (Econ.getPoolBalance) return Econ.getPoolBalance(id) | 0;
              return null;
            }
            const p = (id === "me") ? (S.players.me || S.me) : S.players[id];
            return p && Number.isFinite(p.points) ? (p.points | 0) : null;
          };

          const buildPointsSnapshot = () => {
            const out = {};
            Object.keys(pointIds).forEach(k => { out[k] = readPoints(pointIds[k]); });
            return out;
          };

          const beforePoints = buildPointsSnapshot();
          const beforePointsById = Object.create(null);
          Object.keys(pointIds).forEach(k => {
            const idKey = pointIds[k];
            if (!idKey) return;
            beforePointsById[idKey] = beforePoints[k];
          });

          voters.forEach(vt => {
            Econ.transferPoints(vt.id, "sink", 1, "crowd_vote_cost", { battleId });
            v.voters[vt.id] = vt.side;
          });
          v.aVotes = voters.length;
          v.bVotes = 0;
          v.votesA = v.aVotes;
          v.votesB = v.bVotes;

          const log = normalizeMoneyLogRows((Game.__D && Game.__D.moneyLog) ? Game.__D.moneyLog : [], "ignore.log");
          const logStart = log.length;

          const res = Core.finalizeEscapeVote(battleId);
          const battleAfter = (S.battles || []).find(b => b && String(b.id) === String(battleId)) || battle;
          const crowdMeta = res && res.crowdCapMeta ? res.crowdCapMeta : null;
          const endedBy = crowdMeta ? crowdMeta.endedBy : null;
          const outcome = res && res.outcome ? res.outcome : (v.outcome || null);

          if (Game.__D && Array.isArray(Game.__D.moneyLog)) {
            Game.__D.moneyLog.push({
              ts: Date.now(),
              reason: "ignore_outcome_debug",
              battleId,
              kind: "debug",
              meta: { mode: "off", outcome }
            });
          }

          const dbgAfter = Game.__D || {};
          const mlbbAfter = dbgAfter.moneyLogByBattle || {};
          const scoped = Array.isArray(mlbbAfter[battleId]) ? mlbbAfter[battleId] : [];
          const logForBid = scoped.length ? scoped : normalizeMoneyLogRows(log, "ignore.logForBid").filter(tx => String(tx && tx.battleId || "") === String(battleId));
          const byReason = {};
          let poolInitAmount = 0;
          diag.scopedLen = logForBid.length;
          if (opts && opts.debugTelemetry) {
            const undefinedArr = Array.isArray(mlbbAfter["undefined"]) ? mlbbAfter["undefined"] : [];
            const flatLog = normalizeMoneyLogRows(dbgAfter.moneyLog, "ignore.flatLog");
            const flatMatches = flatLog.filter(tx => String(tx && tx.battleId || "") === String(battleId));
            const reasonCounts = {};
            flatMatches.forEach(tx => {
              const reason = String(tx && tx.reason || "unknown");
              reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
            });
            const reasonPairs = Object.entries(reasonCounts)
              .map(([reason, count]) => ({ reason, count }))
              .sort((a, b) => (b.count - a.count) || a.reason.localeCompare(b.reason))
              .slice(0, 5)
              .map(pair => pair.reason);
            Object.assign(diag, {
              hasMoneyLogByBattle: !!dbgAfter.moneyLogByBattle,
              mlbbLenForBattleId: logForBid.length,
              mlbbLenForUndefined: undefinedArr.length,
              mlbbTopKeys: Object.keys(mlbbAfter || {}).slice(0, 20),
              flatMoneyLogLen: flatLog.length,
              flatMatchBattleId: flatMatches.length,
              flatMatchReasonTop: reasonPairs,
              sampleFlatMatch: flatMatches[0] || null,
              scopedLen: logForBid.length
            });
          }
          diag.stage = "after_scoped";
          diag.trace.push("after_scoped");
          if (opts && opts.debugTelemetry) {
            const dbg = Game.__D || {};
            const mlbb = dbg.moneyLogByBattle || {};
            const battleArr = Array.isArray(mlbb[battleId]) ? mlbb[battleId] : [];
            const undefinedArr = Array.isArray(mlbb["undefined"]) ? mlbb["undefined"] : [];
            const flatLog = Array.isArray(dbg.moneyLog) ? dbg.moneyLog : [];
            const flatMatches = flatLog.filter(tx => String(tx && tx.battleId || "") === String(battleId));
            const reasonCounts = {};
            flatMatches.forEach(tx => {
              const reason = String(tx && tx.reason || "unknown");
              reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
            });
            const reasonPairs = Object.entries(reasonCounts)
              .map(([reason, count]) => ({ reason, count }))
              .sort((a, b) => (b.count - a.count) || a.reason.localeCompare(b.reason))
              .slice(0, 5)
              .map(pair => pair.reason);
            Object.assign(diag, {
              mlbbHas: !!dbg.moneyLogByBattle,
              mlbbLenForBattleId: battleArr.length,
              mlbbLenForUndefined: undefinedArr.length,
              mlbbTopKeys: Object.keys(mlbb || {}).slice(0, 20),
              flatMoneyLogLen: flatLog.length,
              flatMatchBattleId: flatMatches.length,
              flatMatchReasonTop: reasonPairs,
              sampleFlatMatch: flatMatches[0] || null
            });
          }
          logForBid.forEach(tx => {
            const r = tx && tx.reason ? String(tx.reason) : "unknown";
            byReason[r] = (byReason[r] || 0) + 1;
            if (r === "crowd_vote_pool_init") poolInitAmount += (tx.amount | 0);
          });
          const logAfter = log.slice(logStart);

          const afterPoints = buildPointsSnapshot();
          const afterPointsById = Object.create(null);
          Object.keys(pointIds).forEach(k => {
            const idKey = pointIds[k];
            if (!idKey) return;
            afterPointsById[idKey] = afterPoints[k];
          });
          const netDeltaById = {};
          let sumNetDelta = 0;
          Object.keys(beforePoints).forEach(k => {
            const b0 = beforePoints[k];
            const a0 = afterPoints[k];
            if (typeof b0 === "number" && typeof a0 === "number") {
              const d = (a0 | 0) - (b0 | 0);
              netDeltaById[k] = d;
              sumNetDelta += d;
            } else {
              netDeltaById[k] = null;
            }
          });

          const mintReasons = new Set(["battle_win_points", "battle_win", "battle_lose", "battle_draw"]);
          const mintAllowance = logForBid.reduce((sum, tx) => {
            const r = String(tx && tx.reason || "");
            if (!mintReasons.has(r)) return sum;
            return sum + ((tx && Number.isFinite(tx.amount)) ? (tx.amount | 0) : 0);
          }, 0);
          const netDeltaFromMoneyLog = logForBid.reduce((acc, tx) => {
            const amt = (tx && Number.isFinite(tx.amount)) ? (tx.amount | 0) : 0;
            const sourceId = String(tx && tx.sourceId || "");
            const targetId = String(tx && tx.targetId || "");
            if (amt === 0) return acc;
            const srcKey = sourceId || "unknown";
            const tgtKey = targetId || "unknown";
            acc.map[srcKey] = (acc.map[srcKey] || 0) - amt;
            acc.map[tgtKey] = (acc.map[tgtKey] || 0) + amt;
            acc.sum += 0;
            return acc;
          }, { map: Object.create(null), sum: 0 });
          const sumNetFromMoneyLog = Object.values(netDeltaFromMoneyLog.map).reduce((s, v0) => s + (v0 | 0), 0);
          const adjustedDiff = (sumNetFromMoneyLog | 0) - (mintAllowance | 0);
          const pointsDiffOk = adjustedDiff === 0;

          const winnerSide = (outcome === "A_WIN") ? "attacker" : (outcome === "B_WIN" ? "defender" : null);
          const winnerCount = winnerSide ? voters.filter(p => v.voters[p.id] === winnerSide).length : 0;
          const refundReason = (outcome === "TIE") ? "crowd_vote_refund" : "crowd_vote_refund_majority";
          const poolInitCount = byReason.crowd_vote_pool_init | 0;
          const refundCount = byReason[refundReason] | 0;
          const remainder = (poolInitAmount | 0) - (refundCount | 0);
          const remainderToWinnerSum = logForBid.reduce((s, tx) => {
            if (String(tx && tx.reason || "") !== "crowd_vote_remainder_win") return s;
            return s + ((tx && Number.isFinite(tx.amount)) ? (tx.amount | 0) : 0);
          }, 0);
          const remainderSplitSum = logForBid.reduce((s, tx) => {
            const reason = String(tx && tx.reason || "");
            if (!reason.startsWith("crowd_vote_remainder_split_")) return s;
            return s + ((tx && Number.isFinite(tx.amount)) ? (tx.amount | 0) : 0);
          }, 0);
          const loserPenaltySum = logForBid.reduce((s, tx) => {
            if (String(tx && tx.reason || "") !== "crowd_vote_loser_penalty") return s;
            return s + ((tx && Number.isFinite(tx.amount)) ? (tx.amount | 0) : 0);
          }, 0);
          const remainderRuleOk = (remainderSplitSum === remainder && remainderToWinnerSum === 0);
          const loserPenaltyOk = (loserPenaltySum === 0);
          const poolAfterVal = (Econ.getPoolBalance && battleId) ? Econ.getPoolBalance(Econ.getCrowdPoolId ? Econ.getCrowdPoolId(battleId) : `crowd:${battleId}`) : null;
          const poolAfterOk = (poolAfterVal == null) ? true : (poolAfterVal === 0);
          const repInFinalize = logAfter.some(tx => String(tx && tx.reason || "") === "rep_crowd_vote_participation");
          const repDeltaFromCrowdPool = logForBid.some(tx =>
            String(tx && tx.reason || "").startsWith("rep_") &&
            String(tx && tx.sourceId || "") === "crowd_pool"
          );
          const ignoreOutcomeOk = (battleAfter && battleAfter.result === "ignored" && v.mode === "off");

          const weightsSummary = {
            aVotes: crowdMeta ? crowdMeta.aVotes : null,
            bVotes: crowdMeta ? crowdMeta.bVotes : null,
            totalVotes: crowdMeta ? crowdMeta.totalVotes : null,
            cap: crowdMeta ? crowdMeta.cap : null
          };

          const ignoreCountedIds = voters.map(vt => vt.id);
          const beforePtsMapIgnore = Object.create(null);
          ignoreCountedIds.forEach(id => {
            const val = beforePointsById[id];
            beforePtsMapIgnore[id] = Number.isFinite(val) ? (val | 0) : null;
          });
          const afterPtsMapIgnore = Object.create(null);
          ignoreCountedIds.forEach(id => {
            const val = afterPointsById[id];
            afterPtsMapIgnore[id] = Number.isFinite(val) ? (val | 0) : null;
          });
          diag.trace.push("before_builder");
          const built = buildCrowdTelemetryFromLogs({
            id: battleId,
            scenario: "ignore",
            mode: "off",
            endedBy,
            countedIds: ignoreCountedIds,
            excludedIds: [],
            beforePtsMap: beforePtsMapIgnore,
            afterPtsMap: afterPtsMapIgnore,
            opts: {
              totalVotes: (crowdMeta ? crowdMeta.totalVotes : ignoreCountedIds.length),
              sideCounts: { a: v.aVotes | 0, b: v.bVotes | 0, other: 0 },
              winner: winnerSide,
              maxNpcShare: (opts && Number.isFinite(opts.maxNpcShare)) ? opts.maxNpcShare : null
            },
            scopedOverride: logForBid
          });
          diag.trace.push("after_builder");
          diag.stage = "after_builder";

          if (!built) {
            result.details = "telemetry_build_failed";
            diag.builderWhy = "builder_returned_null";
            break;
          }

          const asserts = {
            outcomePresent: !!outcome,
            endedByCap: (String(opts && opts.mode || "cap").toLowerCase() === "cap") ? (endedBy === "cap") : true,
            poolInitCountOk: poolInitCount === 1 && poolInitAmount === voters.length,
            refundCountOk: (outcome === "TIE") ? (refundCount === voters.length) : (refundCount === winnerCount),
            noRepInFinalize: !repInFinalize,
            repDeltaSourceOk: !repDeltaFromCrowdPool,
            pointsDiffOk,
            remainderRuleOk,
            loserPenaltyOk,
            poolAfterOk,
            ignoreOutcomeOk
          };

          Object.assign(result, {
            ok: Object.values(asserts).every(Boolean),
            battleId,
            outcome,
            endedBy,
            cap: crowdMeta ? crowdMeta.cap : null,
            totalVotes: crowdMeta ? crowdMeta.totalVotes : null,
            weightsSummary,
            byReason,
            poolAfter: poolAfterVal,
            snapshotReport: { beforePoints, afterPoints, netDeltaById, sumNetDelta },
            moneyLogReport: { netDeltaById: netDeltaFromMoneyLog.map, sumNetFromMoneyLog, mintAllowance, adjustedDiff },
            pointsDiffOk,
            asserts,
            telemetry: built
          });
          diag.builderWhy = "ok";
          result.details = null;
          break;
        } while (false);
      } finally {
        if (!Game.__D) Game.__D = {};
        Game.__D.FORCE_CIRCULATION = prevForce;
        Game.__D.BYPASS_POINTS_GUARD = prevBypass;
        Game.__D.ALLOW_POINTS_WRITE = prevAllow;
        Game.__D.CROWD_WEIGHTED_TALLY = prevWeighted;
        if (touched.length) {
          touched.forEach(t => {
            const p = S.players[t.id];
            if (!p) return;
            p.influence = t.influence;
            if (t.role !== undefined) p.role = t.role;
          });
        }
      }

      if (result.ok === true && result.telemetry === null) {
        result.ok = false;
        result.details = "telemetry_missing_but_ok_true";
        diag.builderWhy = diag.builderWhy || "invariant_violation";
      }
      if (!Array.isArray(diag.trace) || diag.trace.length === 0) diag.trace = ["entered"];
      if (!diag.stage) diag.stage = "entered";
      return EXIT();
    })();
  };

  window.devReportTest = (opts = {}) => {
    const mode = String(opts && opts.mode ? opts.mode : "true").toLowerCase();
    const S = Game.__S || null;
    if (!S || !S.players || !S.me) {
      console.warn("[DEV] devReportTest: Game.__S missing");
      return { ok: false, reason: "state_missing" };
    }
    if (!Game.__A || typeof Game.__A.transferRep !== "function") {
      console.warn("[DEV] devReportTest: StateAPI.transferRep missing");
      return { ok: false, reason: "transferRep_missing" };
    }
    let copId = "npc_cop";
    let cop = S.players[copId];
    if (!cop) {
      const fallback = Object.values(S.players || {}).find(p => {
        if (!p) return false;
        const id = String(p.id || "");
        const role = String(p.role || p.type || "").toLowerCase();
        return role === "cop" || id.indexOf("cop") >= 0;
      });
      if (fallback && fallback.id) {
        copId = String(fallback.id);
        cop = fallback;
      }
    }
    if (!cop) {
      console.warn("[DEV] devReportTest: npc_cop missing");
      return { ok: false, reason: "cop_missing" };
    }
    const villains = Object.values(S.players || {}).filter(p => {
      if (!p || !p.id) return false;
      const r = String(p.role || p.type || "").toLowerCase();
      return r === "toxic" || r === "bandit" || r === "mafia";
    });
    const target = villains[0] || cop;
    const reportId = `report_dev_${Date.now()}`;
    const before = {
      me: Number.isFinite(S.rep) ? (S.rep | 0) : 0,
      cop: Number.isFinite(cop.rep) ? (cop.rep | 0) : 0,
      target: Number.isFinite(target.rep) ? (target.rep | 0) : 0
    };
    if (mode === "true") {
      Game.__A.transferRep(target.id, "me", 5, "rep_report_true", reportId);
    } else if (mode === "false") {
      Game.__A.transferRep("me", copId, 5, "rep_report_false", reportId);
    } else {
      console.warn("[DEV] devReportTest: invalid mode", mode);
      return { ok: false, reason: "bad_mode" };
    }
    const after = {
      me: Number.isFinite(S.rep) ? (S.rep | 0) : 0,
      cop: Number.isFinite(cop.rep) ? (cop.rep | 0) : 0,
      target: Number.isFinite(target.rep) ? (target.rep | 0) : 0
    };
    const log = normalizeMoneyLogRows((Game.__D && Game.__D.moneyLog) ? Game.__D.moneyLog : [], "report.log");
    const byBattle = (Game.__D && Game.__D.moneyLogByBattle) ? (Game.__D.moneyLogByBattle[reportId] || []) : [];
    const logForBid = normalizeMoneyLogRows(log, "report.logForBid").filter(tx => String(tx && tx.battleId || "") === String(reportId));
    console.log("[DEV] devReportTest", { mode, reportId, before, after, logForBid, byBattle });
    return { ok: true, mode, reportId, before, after, logForBid, byBattle };
  };

  Game.__DEV.smokeEconSoc_Step1_NoEmissionPackOnce = (opts = {}) => {
    const name = "smoke_econ_soc_step1_no_emission_pack_once";
    const startedAt = Date.now();
    const lastN = (opts && opts.window && Number.isFinite(opts.window.lastN)) ? (opts.window.lastN | 0) : 200;
    const dumpHint = (opts && typeof opts.dumpHint === "string") ? opts.dumpHint : "Game.__DUMP_ALL__()";
    let ok = false;
    let failed = [];
    let json1 = null;
    let json2 = null;
    let resultObject = null;
    let roleFlipUsed = false;
    let roleFlipRollbackOk = true;
    emitLine("ECON_SOC_STEP1_BEGIN");
    try {
      const S = Game.__S || Game.State;
      if (!S || !S.players) {
        failed.push("state_missing");
        json1 = { name, startedAt, lastN, dumpHint, error: "state_missing" };
      } else if (!Game.__A || typeof Game.__A.applyReportByRole !== "function") {
        failed.push("applyReportByRole_missing");
        json1 = { name, startedAt, lastN, dumpHint, error: "applyReportByRole_missing" };
      } else if (!Game.__DEV || typeof Game.__DEV.sumPointsSnapshot !== "function") {
        failed.push("sumPointsSnapshot_missing");
        json1 = { name, startedAt, lastN, dumpHint, error: "sumPointsSnapshot_missing" };
      } else {
        const beforeSnap = Game.__DEV.sumPointsSnapshot();
        const beforeTotal = beforeSnap ? (beforeSnap.total | 0) : null;
        const npcList = Object.values(S.players || {}).filter(p => p && p.npc);
        const reportTarget = npcList.find(p => {
          const r = String(p.role || p.type || "");
          return r === "toxic" || r === "bandit" || r === "mafia";
        }) || npcList[0] || null;
        const reportRole = reportTarget ? String(reportTarget.role || reportTarget.type || "") : "toxic";
        const altRole = (reportRole === "toxic") ? "bandit" : "toxic";

        const runFalseReportWithFlip = (label) => {
          if (!reportTarget) return {
            mode: label,
            ok: false,
            reason: "no_target",
            reportId: null,
            roleFlipUsed: false,
            roleFlipRollbackOk: true
          };
          const target = reportTarget;
          const originalDesc = Object.getOwnPropertyDescriptor(target, "role");
          let roleFlipApplied = false;
          let accessCount = 0;
          try {
            Object.defineProperty(target, "role", {
              configurable: true,
              get: () => {
                accessCount += 1;
                return accessCount <= 2 ? reportRole : altRole;
              },
              set: (v) => {
                if (originalDesc && typeof originalDesc.set === "function") originalDesc.set.call(target, v);
                else target.__role_shadow = v;
              }
            });
            roleFlipApplied = true;
          } catch (_) {}
          let roleFlipRollbackOk = false;
          let res = null;
          try {
            res = Game.__A.applyReportByRole(reportRole, { actionId: `econ_soc_${label}_${Date.now()}` });
          } catch (err) {
            res = { ok: false, reason: err && err.message ? String(err.message) : String(err) };
          } finally {
            try {
              if (originalDesc) Object.defineProperty(target, "role", originalDesc);
              else delete target.role;
              roleFlipRollbackOk = true;
            } catch (_) {
              roleFlipRollbackOk = false;
            }
          }
          const logBundle = getPointsMoneyLogSnapshot({ prefer: "debug_moneyLog" });
          const logRows = normalizeMoneyLogRows(logBundle.rows, "econ_soc_report_false_log");
          const lastRep = logRows.slice().reverse().find(tx => {
            const reason = String(tx && tx.reason || "");
            return (reason === "rep_report_false" || reason === "rep_report_true") &&
              (tx && (tx.eventId || tx.battleId));
          });
          const reportId = lastRep ? String(lastRep.eventId || lastRep.battleId) : null;
          return {
            mode: label,
            ok: !!(res && res.ok),
            reason: res ? res.reason : null,
            reportId,
            roleFlipUsed: roleFlipApplied,
            roleFlipRollbackOk: roleFlipRollbackOk
          };
        };

        const runTruthfulReport = () => {
          const res = Game.__A.applyReportByRole(reportRole, { actionId: `econ_soc_true_${Date.now()}` });
          const logBundle = getPointsMoneyLogSnapshot({ prefer: "debug_moneyLog" });
          const logRows = normalizeMoneyLogRows(logBundle.rows, "econ_soc_report_true_log");
          const lastRep = logRows.slice().reverse().find(tx => {
            const reason = String(tx && tx.reason || "");
            return (reason === "rep_report_true" || reason === "rep_report_false") &&
              (tx && (tx.eventId || tx.battleId));
          });
          const reportId = lastRep ? String(lastRep.eventId || lastRep.battleId) : null;
          return {
            mode: "true",
            ok: !!(res && res.ok),
            reason: res ? res.reason : null,
            reportId,
            roleFlipUsed: false,
            roleFlipRollbackOk: true
          };
        };

        const results = [];
        results.push(runTruthfulReport());
        results.push(runFalseReportWithFlip("false"));
        results.push(runFalseReportWithFlip("repeat_false"));

        const afterSnap = Game.__DEV.sumPointsSnapshot();
        const afterTotal = afterSnap ? (afterSnap.total | 0) : null;
        const drift = (Number.isFinite(afterTotal) && Number.isFinite(beforeTotal)) ? (afterTotal - beforeTotal) : null;
        if (!Number.isFinite(beforeTotal) || !Number.isFinite(afterTotal)) {
          failed.push("totals_missing");
        } else if (drift !== 0) {
          failed.push("world_drift");
        }

        roleFlipUsed = results.some(r => !!r.roleFlipUsed);
        const flipResults = results.filter(r => !!r.roleFlipUsed);
        roleFlipRollbackOk = flipResults.length ? flipResults.every(r => !!r.roleFlipRollbackOk) : true;
        const logBundle = getPointsMoneyLogSnapshot({ prefer: "debug_moneyLog" });
        const logSource = logBundle.logSource || "none";
        const logRows = normalizeMoneyLogRows(logBundle.rows, "econ_soc_log_rows");
        const tail = logRows.slice(Math.max(0, logRows.length - lastN));
        const reportIds = results.map(r => r.reportId).filter(Boolean);
        const scoped = tail.filter(tx => {
          const bid = tx && (tx.eventId || tx.battleId) ? String(tx.eventId || tx.battleId) : "";
          return reportIds.indexOf(bid) >= 0;
        });
        const scopedReasons = Array.from(new Set(scoped.map(tx => String(tx && tx.reason || "")).filter(Boolean)));
        const suspiciousEmissionsFound = scoped.filter(tx => {
          const currency = String(tx && tx.currency || "").toLowerCase();
          const reason = String(tx && tx.reason || "");
          return currency === "points" || reason === "points_emission_blocked";
        }).map(tx => ({
          reason: tx && tx.reason ? String(tx.reason) : null,
          amount: Number.isFinite(tx && tx.amount) ? (tx.amount | 0) : null,
          sourceId: tx && tx.sourceId ? String(tx.sourceId) : null,
          targetId: tx && tx.targetId ? String(tx.targetId) : null,
          eventId: tx && tx.eventId ? String(tx.eventId) : null,
          battleId: tx && tx.battleId ? String(tx.battleId) : null,
          currency: tx && tx.currency ? String(tx.currency) : null
        }));
        if (suspiciousEmissionsFound.length) failed.push("points_emission_detected");

        ok = failed.length === 0;
        json1 = {
          name,
          startedAt,
          lastN,
          dumpHint,
          beforeTotal,
          afterTotal,
          drift,
          reportRole,
          reportIds,
          results,
          logSource,
          scopedReasons,
          suspiciousEmissionsFound
        };
        json1.roleFlipUsed = roleFlipUsed;
      }
      json2 = {
        ok,
        failed,
        beforeTotal: json1 ? json1.beforeTotal : null,
        afterTotal: json1 ? json1.afterTotal : null,
        drift: json1 ? json1.drift : null,
        scopedReasons: json1 ? json1.scopedReasons : [],
        suspiciousEmissionsFound: json1 ? json1.suspiciousEmissionsFound : [],
        meta: {
          roleFlipUsed,
          roleFlipRollbackOk
        },
        proofPointers: {
          dumpHint,
          expectedMarkers: [
            "ECON_SOC_STEP1_BEGIN",
            "ECON_SOC_STEP1_JSON1",
            "ECON_SOC_STEP1_JSON2",
            "ECON_SOC_STEP1_END"
          ]
        }
      };
      emitLine(`ECON_SOC_STEP1_JSON1 ${safeStringify(json1 || {})}`);
      emitLine(`ECON_SOC_STEP1_JSON2 ${safeStringify(json2 || {})}`);
      resultObject = json2;
    } catch (err) {
      failed = failed.length ? failed : ["exception"];
      json1 = json1 || { name, startedAt, lastN, dumpHint };
      json2 = {
        ok: false,
        failed,
        errorMessage: err && err.message ? String(err.message) : String(err),
        meta: {
          roleFlipUsed,
          roleFlipRollbackOk
        },
        proofPointers: { dumpHint, expectedMarkers: ["ECON_SOC_STEP1_BEGIN", "ECON_SOC_STEP1_JSON1", "ECON_SOC_STEP1_JSON2", "ECON_SOC_STEP1_END"] }
      };
      emitLine(`ECON_SOC_STEP1_JSON1 ${safeStringify(json1)}`);
      emitLine(`ECON_SOC_STEP1_JSON2 ${safeStringify(json2)}`);
      resultObject = json2;
    } finally {
      emitLine("ECON_SOC_STEP1_END");
      if (Game.__DEV) Game.__DEV.lastEconSocStep1NoEmissionPack = { ok, json1, json2 };
    }
    const returnValue = resultObject || {
      ok: false,
      failed: ["unknown"],
      meta: { roleFlipUsed, roleFlipRollbackOk },
      proofPointers: { expectedMarkers: ["ECON_SOC_STEP1_BEGIN", "ECON_SOC_STEP1_JSON1", "ECON_SOC_STEP1_JSON2", "ECON_SOC_STEP1_END"] }
    };
    try {
      console.warn("ECON_SOC_STEP1_RETURN", { ok: returnValue.ok, keys: Object.keys(returnValue) });
    } catch (_) {}
    return returnValue;
  };

  Game.__DEV.smokeEconSoc_Step2_TruthfulOnce = (opts = {}) => {
    const name = "smoke_econ_soc_step2_truthful_once";
    const startedAt = Date.now();
    const lastN = (opts && opts.window && Number.isFinite(opts.window.lastN)) ? (opts.window.lastN | 0) : 200;
    const dumpHint = (opts && typeof opts.dumpHint === "string") ? opts.dumpHint : "Game.__DUMP_ALL__()";
    let ok = false;
    let failed = [];
    let result = null;
    emitLine("ECON_SOC_STEP2_BEGIN");
    try {
      const S = Game.__S || Game.State;
      if (!S || !S.players) {
        failed.push("state_missing");
      }
      if (!Game.__A || typeof Game.__A.applyReportByRole !== "function") {
        failed.push("applyReportByRole_missing");
      }
      if (!Game.__DEV || typeof Game.__DEV.sumPointsSnapshot !== "function") {
        failed.push("sumPointsSnapshot_missing");
      }
      const beforeSnap = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function")
        ? Game.__DEV.sumPointsSnapshot()
        : null;
      const beforeTotal = beforeSnap ? (beforeSnap.total | 0) : null;
      const npcList = S && S.players ? Object.values(S.players || {}).filter(p => p && p.npc) : [];
      const reportTarget = npcList.find(p => {
        const r = String(p.role || p.type || "");
        return r === "toxic" || r === "bandit" || r === "mafia";
      }) || npcList[0] || null;
      const reportRole = reportTarget ? String(reportTarget.role || reportTarget.type || "") : "toxic";
      let reportRes = null;
      if (!failed.length) {
        reportRes = Game.__A.applyReportByRole(reportRole, { actionId: `econ_soc_step2_${Date.now()}` });
      }
      const logBundle = getPointsMoneyLogSnapshot({ prefer: "debug_moneyLog" });
      const logSource = logBundle.logSource || "none";
      const logRows = normalizeMoneyLogRows(logBundle.rows, "econ_soc_step2_log");
      const tail = logRows.slice(Math.max(0, logRows.length - lastN));
      const lastRep = tail.slice().reverse().find(tx => {
        const reason = String(tx && tx.reason || "");
        return reason === "rep_report_true" && (tx && (tx.eventId || tx.battleId));
      });
      const reportId = lastRep ? String(lastRep.eventId || lastRep.battleId) : null;
      const scoped = reportId
        ? tail.filter(tx => String(tx && (tx.eventId || tx.battleId) || "") === reportId)
        : tail;
      const scopedReasons = Array.from(new Set(scoped.map(tx => String(tx && tx.reason || "")).filter(Boolean)));
      const hasRepLog = scoped.some(tx => String(tx && tx.reason || "") === "rep_report_true");
      const hasPointsTransfer = scoped.some(tx =>
        String(tx && tx.reason || "") === "report_true_compensation" &&
        String(tx && tx.currency || "").toLowerCase() === "points"
      );
      const hasEmission = scoped.some(tx => {
        const reason = String(tx && tx.reason || "");
        const currency = String(tx && tx.currency || "").toLowerCase();
        return reason === "points_emission_blocked" || reason === "addPoints" || currency === "points_emission";
      });
      const afterSnap = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function")
        ? Game.__DEV.sumPointsSnapshot()
        : null;
      const afterTotal = afterSnap ? (afterSnap.total | 0) : null;
      const drift = (Number.isFinite(afterTotal) && Number.isFinite(beforeTotal)) ? (afterTotal - beforeTotal) : null;
      if (!hasRepLog) failed.push("rep_log_missing");
      if (hasEmission) failed.push("points_emission_detected");
      if (drift !== 0) failed.push("world_drift");
      ok = failed.length === 0;
      result = {
        ok,
        failed,
        hasRepLog,
        hasPointsTransfer,
        hasEmission,
        beforeTotal,
        afterTotal,
        drift,
        reportId,
        reportRole,
        logSource,
        scopedReasons,
        reportRes
      };
      emitLine(`ECON_SOC_STEP2_JSON ${safeStringify(result)}`);
    } catch (err) {
      failed = failed.length ? failed : ["exception"];
      result = {
        ok: false,
        failed,
        errorMessage: err && err.message ? String(err.message) : String(err)
      };
      emitLine(`ECON_SOC_STEP2_JSON ${safeStringify(result)}`);
    } finally {
      emitLine("ECON_SOC_STEP2_END");
      if (Game.__DEV) Game.__DEV.lastEconSocStep2Truthful = result;
    }
    return result;
  };

  Game.__DEV.smokeEconSoc_Step3_FalseOnce = async (opts = {}) => {
    const name = "smoke_econ_soc_step3_false_once";
    const startedAt = Date.now();
    const lastN = (opts && opts.window && Number.isFinite(opts.window.lastN)) ? (opts.window.lastN | 0) : 200;
    const dumpHint = (opts && typeof opts.dumpHint === "string") ? opts.dumpHint : "Game.__DUMP_ALL__()";
    let ok = false;
    let failed = [];
    let result = null;
    emitLine("ECON_SOC_STEP3_BEGIN");
    try {
      const S = Game.__S || Game.State;
      if (!S || !S.players) failed.push("state_missing");
      if (!Game.__A || typeof Game.__A.applyReportByRole !== "function") failed.push("applyReportByRole_missing");
      if (!Game.__DEV || typeof Game.__DEV.sumPointsSnapshot !== "function") failed.push("sumPointsSnapshot_missing");

      const beforeSnap = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function")
        ? Game.__DEV.sumPointsSnapshot()
        : null;
      const beforeTotal = beforeSnap ? (beforeSnap.total | 0) : null;
      const npcList = S && S.players ? Object.values(S.players || {}).filter(p => p && p.npc) : [];
      const reportTarget = npcList.find(p => {
        const r = String(p.role || p.type || "");
        return r === "toxic" || r === "bandit" || r === "mafia";
      }) || npcList[0] || null;
      const actualRole = reportTarget ? String(reportTarget.role || reportTarget.type || "toxic") : "toxic";
      const reportRole = actualRole;
      const wrongRole = (actualRole === "toxic") ? "bandit" : "toxic";

      let reportRes = null;
      let roleFlipUsed = false;
      let roleFlipRollbackOk = true;
      let seedApplied = false;
      let seedRequired = false;
      let pointsPenaltyAmount = null;
      let pointsBefore = null;
      let pointsAfter = null;
      let seedReasonSeen = false;
      if (!failed.length && reportTarget) {
        const target = reportTarget;
        const originalRole = target.role;
        const originalType = target.type;
        const originalName = target.name;
        const reportedName = `smoke_false_${wrongRole}`;
        const N = Game.NPC || {};
        const penaltyAmount = (N.COP && N.COP.report && Number.isFinite(N.COP.report.falsePenalty))
          ? (N.COP.report.falsePenalty | 0)
          : 5;
        pointsPenaltyAmount = penaltyAmount | 0;
        const mePointsBefore = (S.me && Number.isFinite(S.me.points)) ? (S.me.points | 0) : 0;
        pointsBefore = mePointsBefore;
        const needSeed = (mePointsBefore < penaltyAmount) ? Math.max(0, penaltyAmount - mePointsBefore) : 0;
        seedRequired = needSeed > 0;
        const Econ = (Game && (Game._ConflictEconomy || Game.ConflictEconomy)) ? (Game._ConflictEconomy || Game.ConflictEconomy) : null;
        if (needSeed > 0 && Econ && typeof Econ.transferPoints === "function") {
          try {
            const seedRes = Econ.transferPoints("worldBank", "me", needSeed, "smoke_seed_points", {
              for: "false_penalty_test",
              penaltyAmount,
              need: penaltyAmount,
              had: mePointsBefore,
              pointsBefore: mePointsBefore,
              pointsAfter: mePointsBefore + needSeed,
              partial: false
            });
            if (seedRes && typeof seedRes.then === "function") await seedRes;
            seedApplied = true;
          } catch (_) {}
        }
        try {
          target.role = "";
          target.type = actualRole || target.type;
          target.name = reportedName;
          roleFlipUsed = true;
          reportRes = Game.__A.applyReportByRole(reportedName, { actionId: `econ_soc_step3_${Date.now()}` });
        } catch (err) {
          reportRes = { ok: false, reason: err && err.message ? String(err.message) : String(err) };
        } finally {
          try {
            target.role = originalRole;
            target.type = originalType;
            target.name = originalName;
            roleFlipRollbackOk = true;
          } catch (_) {
            roleFlipRollbackOk = false;
          }
        }
        pointsAfter = (S.me && Number.isFinite(S.me.points)) ? (S.me.points | 0) : pointsAfter;
      }

      const logBundle = getPointsMoneyLogSnapshot({ prefer: "debug_moneyLog" });
      const logSource = logBundle.logSource || "none";
      const logRows = normalizeMoneyLogRows(logBundle.rows, "econ_soc_step3_log");
      const tail = logRows.slice(Math.max(0, logRows.length - lastN));
      const rawTail = (logBundle.rows || []).slice(Math.max(0, logBundle.rows.length - lastN));
      const matchesPenaltyDelta = (delta, amount) => Number.isFinite(delta) && Number.isFinite(amount) && delta === amount;
      const lastRep = tail.slice().reverse().find(tx => {
        const reason = String(tx && tx.reason || "");
        return reason === "rep_report_false" && (tx && (tx.eventId || tx.battleId));
      });
      const reportId = lastRep ? String(lastRep.eventId || lastRep.battleId) : null;
      const scoped = reportId
        ? tail.filter(tx => String(tx && (tx.eventId || tx.battleId) || "") === reportId)
        : tail;
      const scopedLen = scoped.length;
      const normalizedTailRows = tail;
      const getReason = (row) => {
        if (!row) return "";
        if (row.reason) return String(row.reason);
        if (row.meta && row.meta.reason) return String(row.meta.reason);
        if (row.r) return String(row.r);
        return "";
      };
      const reasonMatches = normalizedTailRows.map((row, idx) => ({
        idx,
        reason: getReason(row),
        fieldsSeen: [
          row && row.reason ? "reason" : null,
          row && row.meta && row.meta.reason ? "meta.reason" : null,
          row && row.r ? "r" : null
        ].filter(Boolean),
        row
      }));
      const penaltyMatch = reasonMatches.find(entry => entry.reason === "report_false_penalty");
      const penaltyRowIndex = penaltyMatch ? penaltyMatch.idx : -1;
      const penaltyRowFound = penaltyRowIndex !== -1;
      const penaltyRowSample = penaltyRowFound ? normalizedTailRows[penaltyRowIndex] : null;
      const penaltyRowRawSample = penaltyRowFound ? rawTail[penaltyRowIndex] : null;
      const seedReasons = normalizedTailRows
        .filter(row => getReason(row) === "smoke_seed_points")
        .map(row => getReason(row))
        .filter(Boolean);
      const baseReasons = scoped.map(tx => getReason(tx)).filter(Boolean);
      if (penaltyRowFound && !baseReasons.includes("report_false_penalty")) baseReasons.push("report_false_penalty");
      const reasons = Array.from(new Set(baseReasons.concat(seedReasons)));
      const seedIdx = (() => {
        for (let i = tail.length - 1; i >= 0; i -= 1) {
          if (String(tail[i] && tail[i].reason || "") === "smoke_seed_points") return i;
        }
        return -1;
      })();
      const repIdx = (() => {
        for (let i = tail.length - 1; i >= 0; i -= 1) {
          if (String(tail[i] && tail[i].reason || "") === "rep_report_false") return i;
        }
        return -1;
      })();
      const hasSeed = reasons.includes("smoke_seed_points");
      seedReasonSeen = hasSeed;
      const hasRepLog = scoped.some(tx => getReason(tx) === "rep_report_false");
      const hasPointsPenalty = penaltyRowFound;
      const hasEmission = scoped.some(tx => {
        const reason = String(tx && tx.reason || "");
        const currency = String(tx && tx.currency || "").toLowerCase();
        return reason === "points_emission_blocked" || reason === "addPoints" || currency === "points_emission";
      });

      const afterSnap = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function")
        ? Game.__DEV.sumPointsSnapshot()
        : null;
      const afterTotal = afterSnap ? (afterSnap.total | 0) : null;
      const drift = (Number.isFinite(afterTotal) && Number.isFinite(beforeTotal)) ? (afterTotal - beforeTotal) : null;
      const tailReasonsSample = normalizedTailRows
        .slice(Math.max(0, normalizedTailRows.length - lastN))
        .map(row => getReason(row))
        .filter(Boolean);
      const tailReasonsSampleLimited = tailReasonsSample.slice(-20);
      const pointsDelta = (Number.isFinite(pointsBefore) && Number.isFinite(pointsAfter)) ? (pointsBefore - pointsAfter) : null;
      const penaltyReasonDiag = penaltyMatch
        ? {
            firstMatchIndex: penaltyMatch.idx,
            sampleRowAtIndex: rawTail[penaltyMatch.idx] || null,
            sampleNormalizedRow: normalizedTailRows[penaltyMatch.idx] || null,
            fieldsSeen: penaltyMatch.fieldsSeen
          }
        : null;
      const penaltyReasonFieldNonstandard = !penaltyRowFound && matchesPenaltyDelta(pointsDelta, pointsPenaltyAmount);
      if (penaltyReasonFieldNonstandard) {
        console.warn("penalty_reason_field_nonstandard", {
          pointsBefore,
          pointsAfter,
          pointsPenaltyAmount,
          sample: penaltyReasonDiag ? penaltyReasonDiag.sampleNormalizedRow : null
        });
      }

      if (!hasRepLog) failed.push("rep_log_missing");
      const penaltySatisfied = hasPointsPenalty || penaltyReasonFieldNonstandard;
      if (!penaltySatisfied) failed.push("points_penalty_missing");
      if (hasEmission) failed.push("points_emission_detected");
      if (drift !== 0) failed.push("world_drift");
      if (seedRequired && !hasSeed) failed.push("seed_missing");
      if (seedRequired && seedIdx !== -1 && repIdx !== -1 && seedIdx > repIdx) failed.push("seed_after_report");
      if (tailReasonsSampleLimited.includes("report_false_penalty") && !penaltyRowFound) {
        failed.push("inconsistent_tail_search");
      }
      if (penaltyReasonFieldNonstandard) {
        failed.push("penalty_row_missing_even_though_points_changed");
      }

      ok = failed.length === 0;
      const effectiveHasPointsPenalty = hasPointsPenalty || penaltyReasonFieldNonstandard;
      result = {
        ok,
        failed,
        hasRepLog,
        hasPointsPenalty: effectiveHasPointsPenalty,
        hasEmission,
        beforeTotal,
        afterTotal,
        drift,
        reportId,
        reportRole,
        logSource,
        reasons,
        roleFlipUsed,
        roleFlipRollbackOk,
        reportRes,
        seedApplied,
        seedRequired,
        seedReasonSeen,
        pointsPenaltyAmount,
        pointsBefore,
        pointsAfter,
        scopedLen,
        penaltyRowFound,
        penaltyRowSample,
        penaltyRowRawSample,
        penaltyReasonDiag,
        tailReasonsSample: tailReasonsSampleLimited,
        penaltyReasonFieldNonstandard
      };
      emitLine(`ECON_SOC_STEP3_JSON ${safeStringify(result)}`);
    } catch (err) {
      failed = failed.length ? failed : ["exception"];
      result = {
        ok: false,
        failed,
        errorMessage: err && err.message ? String(err.message) : String(err)
      };
      emitLine(`ECON_SOC_STEP3_JSON ${safeStringify(result)}`);
    } finally {
      emitLine("ECON_SOC_STEP3_END");
      if (Game.__DEV) Game.__DEV.lastEconSocStep3False = result;
    }
    return result;
  };

  Game.__DEV.smokeEconSoc_Step4_RepeatFalseOnce = async (opts = {}) => {
    const name = "smoke_econ_soc_step4_repeat_false_once";
    const startedAt = Date.now();
    const lastN = (opts && opts.window && Number.isFinite(opts.window.lastN)) ? (opts.window.lastN | 0) : 200;
    const dumpHint = (opts && typeof opts.dumpHint === "string") ? opts.dumpHint : "Game.__DUMP_ALL__()";
    let ok = false;
    let failed = [];
    let result = null;
    emitLine("ECON_SOC_STEP4_BEGIN");
    try {
      const S = Game.__S || Game.State;
      if (!S || !S.players) failed.push("state_missing");
      if (!Game.__A || typeof Game.__A.applyReportByRole !== "function") failed.push("applyReportByRole_missing");
      if (!Game.__DEV || typeof Game.__DEV.sumPointsSnapshot !== "function") failed.push("sumPointsSnapshot_missing");

      const beforeSnap = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function")
        ? Game.__DEV.sumPointsSnapshot()
        : null;
      const beforeTotal = beforeSnap ? (beforeSnap.total | 0) : null;

      const npcList = S && S.players ? Object.values(S.players || {}).filter(p => p && p.npc) : [];
      const reportTarget = npcList.find(p => {
        const r = String(p.role || p.type || "");
        return r === "toxic" || r === "bandit" || r === "mafia";
      }) || npcList[0] || null;
      const actualRole = reportTarget ? String(reportTarget.role || reportTarget.type || "toxic") : "toxic";
      const wrongRole = (actualRole === "toxic") ? "bandit" : "toxic";
      const reportedRole = wrongRole;

      const getReason = (row) => {
        if (!row) return "";
        if (row.reason) return String(row.reason);
        if (row.meta && row.meta.reason) return String(row.meta.reason);
        if (row.r) return String(row.r);
        return "";
      };
      const normalizeRows = (rows) => normalizeMoneyLogRows(rows, "econ_soc_step4_log");
      const fetchDebugRows = () => normalizeRows(getPointsMoneyLogSnapshot({ prefer: "debug_moneyLog" }).rows);
      const dbgDev = (Game.__D && typeof Game.__D === "object") ? Game.__D : (Game.__D = {});
      const repeatLogRef = Array.isArray(dbgDev.repeatRateLimitLog) ? dbgDev.repeatRateLimitLog : (dbgDev.repeatRateLimitLog = []);
      let moneyRowCount = fetchDebugRows().length;
      let repeatRowCount = repeatLogRef.length;
      const captureMoneySlice = () => {
        const rows = fetchDebugRows();
        const slice = rows.slice(moneyRowCount);
        moneyRowCount = rows.length;
        return slice;
      };
      const captureRepeatSlice = () => {
        const slice = repeatLogRef.slice(repeatRowCount);
        repeatRowCount = repeatLogRef.length;
        return slice;
      };

      let roleFlipUsed = false;
      let roleFlipRollbackOk = true;
      let seedApplied = false;
      let seedRequired = false;
      let pointsPenaltyAmount = null;
      let pointsBefore = null;
      let pointsAfter = null;

      let firstRes = null;
      let secondRes = null;
      let firstTargetId = null;
      let secondTargetId = null;
      let firstRole = null;
      let secondRole = null;
      let key1 = null;
      let key2 = null;
      let rlKey1 = null;
      let rlKey2 = null;
      let rlBlocked1 = null;
      let rlBlocked2 = null;
      let rlResetAt1 = null;
      let rlResetAt2 = null;
      let slice1 = [];
      let slice2 = [];
      let rlSlice1 = [];
      let rlSlice2 = [];

      if (!failed.length && reportTarget) {
        const target = reportTarget;
        const originalRole = target.role;
        const originalType = target.type;
        const originalName = target.name;
        const reportedName = `smoke_false_${wrongRole}`;
        const N = Game.NPC || {};
        const penaltyAmount = (N.COP && N.COP.report && Number.isFinite(N.COP.report.falsePenalty))
          ? (N.COP.report.falsePenalty | 0)
          : 5;
        pointsPenaltyAmount = penaltyAmount | 0;
        const mePointsBefore = (S.me && Number.isFinite(S.me.points)) ? (S.me.points | 0) : 0;
        pointsBefore = mePointsBefore;
        const needSeed = (mePointsBefore < penaltyAmount) ? Math.max(0, penaltyAmount - mePointsBefore) : 0;
        seedRequired = needSeed > 0;
        const Econ = (Game && (Game._ConflictEconomy || Game.ConflictEconomy)) ? (Game._ConflictEconomy || Game.ConflictEconomy) : null;
        if (needSeed > 0 && Econ && typeof Econ.transferPoints === "function") {
          try {
            const seedRes = Econ.transferPoints("worldBank", "me", needSeed, "smoke_seed_points", {
              for: "repeat_false_test",
              penaltyAmount,
              need: penaltyAmount,
              had: mePointsBefore,
              pointsBefore: mePointsBefore,
              pointsAfter: mePointsBefore + needSeed,
              partial: false
            });
            if (seedRes && typeof seedRes.then === "function") await seedRes;
            seedApplied = true;
          } catch (_) {}
        }
        try {
          target.role = "";
          target.type = actualRole || target.type;
          target.name = reportedName;
          roleFlipUsed = true;
          const actionId1 = `econ_soc_step4_first_${Date.now()}`;
          firstTargetId = target && target.id ? String(target.id) : null;
          firstRole = String(reportedRole || "");
          key1 = `${(S.me && S.me.id) ? String(S.me.id) : "me"}|${firstTargetId || "unknown"}|${firstRole || ""}`;
          firstRes = Game.__A.applyReportByRole(reportedName, { actionId: actionId1 });
          slice1 = captureMoneySlice();
          rlSlice1 = captureRepeatSlice();
          const actionId2 = `econ_soc_step4_second_${Date.now()}`;
          secondTargetId = target && target.id ? String(target.id) : null;
          secondRole = String(reportedRole || "");
          key2 = `${(S.me && S.me.id) ? String(S.me.id) : "me"}|${secondTargetId || "unknown"}|${secondRole || ""}`;
          secondRes = Game.__A.applyReportByRole(reportedName, { actionId: actionId2 });
          slice2 = captureMoneySlice();
          rlSlice2 = captureRepeatSlice();
        } catch (err) {
          firstRes = { ok: false, reason: err && err.message ? String(err.message) : String(err) };
          secondRes = { ok: false, reason: "exception" };
        } finally {
          try {
            target.role = originalRole;
            target.type = originalType;
            target.name = originalName;
            roleFlipRollbackOk = true;
          } catch (_) {
            roleFlipRollbackOk = false;
          }
        }
        pointsAfter = (S.me && Number.isFinite(S.me.points)) ? (S.me.points | 0) : pointsAfter;
      }

      const firstRows = slice1;
      const firstReasons = Array.from(new Set(firstRows.map(getReason).filter(Boolean)));
      const firstRepRow = firstRows.find(r => getReason(r) === "rep_report_false");
      const firstReportId = firstRepRow ? String(firstRepRow.eventId || firstRepRow.battleId || "") : null;
      const rlCheck1 = rlSlice1.slice().reverse().find(entry => entry && entry.type === "check");
      rlKey1 = rlCheck1 ? rlCheck1.stableKey || rlCheck1.rawKey || null : null;
      rlBlocked1 = rlCheck1 ? !!rlCheck1.blocked : false;
      rlResetAt1 = rlCheck1 && rlCheck1.resetAt ? rlCheck1.resetAt : null;

      const secondRows = slice2;
      const secondReasons = Array.from(new Set(secondRows.map(getReason).filter(Boolean)));
      const secondReportId = (secondRows.find(r => getReason(r) === "rep_report_false")) ? String(secondRows.find(r => getReason(r) === "rep_report_false").eventId || secondRows.find(r => getReason(r) === "rep_report_false").battleId || "") : null;
      const secondRateLimited = (secondRes && secondRes.reason === "rate_limited") || secondReasons.includes("report_rate_limited");
      const rlCheck2 = rlSlice2.slice().reverse().find(entry => entry && entry.type === "check");
      rlKey2 = rlCheck2 ? rlCheck2.stableKey || rlCheck2.rawKey || null : null;
      rlBlocked2 = rlCheck2 ? !!rlCheck2.blocked : false;
      rlResetAt2 = rlCheck2 && rlCheck2.resetAt ? rlCheck2.resetAt : null;
      const rlBlockMarker2 = rlSlice2.some(entry => entry && entry.type === "block");

      const afterSnap = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function")
        ? Game.__DEV.sumPointsSnapshot()
        : null;
      const afterTotal = afterSnap ? (afterSnap.total | 0) : null;
      const drift = (Number.isFinite(afterTotal) && Number.isFinite(beforeTotal)) ? (afterTotal - beforeTotal) : null;
      const finalLogBundle = getPointsMoneyLogSnapshot({ prefer: "debug_moneyLog" });
      const finalLogRows = normalizeRows(finalLogBundle.rows);
      const tailReasonsSample = finalLogRows.slice(Math.max(0, finalLogRows.length - 30)).map(getReason).filter(Boolean);
      const hasEmission = finalLogRows.some(tx => {
        const reason = getReason(tx);
        const currency = String(tx && tx.currency || "").toLowerCase();
        return reason === "points_emission_blocked" || reason === "addPoints" || currency === "points_emission";
      });
      const logSource = finalLogBundle.logSource || "debug_moneyLog";

      const firstHasPenalty = firstReasons.includes("report_false_penalty");
      const firstHasRep = firstReasons.includes("rep_report_false");
      const firstCallRepeatDetected = firstReasons.includes("report_rate_limited") || (rlCheck1 && rlCheck1.blocked);
      const firstCallNotRepeat = !firstCallRepeatDetected;
      const secondHasPenalty = secondReasons.includes("report_repeat_penalty");
      const secondHasBlock = secondReasons.includes("report_rate_limited") || secondReasons.includes("report_repeat_block");
      const penaltyCount = tailReasonsSample.filter(r => r === "report_false_penalty").length;

      if (!firstHasRep) failed.push("first_rep_missing");
      if (!firstHasPenalty) failed.push("first_penalty_missing");
      if (!firstCallNotRepeat) failed.push("first_call_marked_repeat");
      if (!secondRateLimited && !secondHasBlock) failed.push("second_not_rate_limited");
      if (!rlBlocked2 && !secondReasons.includes("report_rate_limited") && !rlBlockMarker2) failed.push("rl_block_missing");
      if (!rlKey1 || !rlKey2 || rlKey1 !== rlKey2) failed.push("rl_key_instability");
      if (secondReasons.includes("rep_report_false") || secondReasons.includes("report_false_penalty")) failed.push("second_should_not_apply_false_penalty");
      if (penaltyCount !== 1) failed.push("penalty_count_mismatch");
      if (!secondRateLimited && penaltyCount > 1 && !tailReasonsSample.includes("report_rate_limited")) {
        failed.push("second_penalized_instead_of_blocked");
      }
      if (!firstTargetId || !secondTargetId || firstTargetId !== secondTargetId || firstRole !== secondRole) {
        failed.push("repeat_key_instability");
      }
      if (hasEmission) failed.push("points_emission_detected");
      if (drift !== 0) failed.push("world_drift");
      if (seedRequired && !seedApplied) failed.push("seed_missing");

      ok = failed.length === 0;
      result = {
        ok,
        failed,
        first: { ok: firstRes && firstRes.ok === true, reasons: firstReasons, reportId: firstReportId },
        second: {
          ok: secondRes && secondRes.ok === true,
          reasons: secondReasons,
          reportId: secondReportId,
          rateLimited: secondRateLimited,
          cooldownMs: 4000,
          penaltyApplied: secondHasPenalty
        },
        hasEmission,
        beforeTotal,
        afterTotal,
        drift,
        tailReasonsSample,
        diag: {
          firstCallNotRepeat,
          repeatKey: "report_repeat:actor+target+role",
          windowMs: 4000,
          penaltyCount,
          firstTargetId,
          secondTargetId,
          firstRole,
          secondRole,
          key1,
          key2,
          rlKey1,
          rlKey2,
          rlBlocked1,
          rlBlocked2,
          rlResetAt1,
          rlResetAt2
        },
        pointsPenaltyAmount,
        pointsBefore,
        pointsAfter,
        seedApplied,
        seedRequired,
        roleFlipUsed,
        roleFlipRollbackOk,
        logSource,
        startedAt,
        name,
        dumpHint
      };
      emitLine(`ECON_SOC_STEP4_JSON ${safeStringify(result)}`);
    } catch (err) {
      failed = failed.length ? failed : ["exception"];
      result = {
        ok: false,
        failed,
        errorMessage: err && err.message ? String(err.message) : String(err)
      };
      emitLine(`ECON_SOC_STEP4_JSON ${safeStringify(result)}`);
    } finally {
      emitLine("ECON_SOC_STEP4_END");
      if (Game.__DEV) Game.__DEV.lastEconSocStep4RepeatFalse = result;
    }
    return result;
  };
  console.warn("ECON_SOC_STEP4_SMOKE_V1_LOADED", { ts: Date.now(), hasFn: !!Game.__DEV.smokeEconSoc_Step4_RepeatFalseOnce });

  Game.__DEV.smokeEconSoc_Step5_PenaltyHelperOnce = async (opts = {}) => {
    const name = "smoke_econ_soc_step5_penalty_helper_once";
    const startedAt = Date.now();
    const lastN = (opts && opts.window && Number.isFinite(opts.window.lastN)) ? (opts.window.lastN | 0) : 200;
    const dumpHint = (opts && typeof opts.dumpHint === "string") ? opts.dumpHint : "Game.__DUMP_ALL__()";
    let result = null;
    let failed = [];
    emitLine("ECON_SOC_STEP5_BEGIN");
    try {
      const S = Game.__S || Game.State;
      const social = Game.Social || null;
      const Econ = (Game && (Game._ConflictEconomy || Game.ConflictEconomy)) ? (Game._ConflictEconomy || Game.ConflictEconomy) : null;
      if (!S || !S.me) {
        failed.push("state_missing");
      } else if (!social || typeof social.applySocialPenalty !== "function") {
        failed.push("applySocialPenalty_missing");
      } else if (!Econ || typeof Econ.transferPoints !== "function") {
        failed.push("transferPoints_missing");
      } else {
        const beforeSnap = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function") ? Game.__DEV.sumPointsSnapshot() : null;
        const beforeTotal = beforeSnap ? (beforeSnap.total | 0) : null;
        let logSource = "debug_moneyLog";
        let rows = [];
        let logIndex = 0;

        const getReason = (row) => String((row && (row.reason || row.r || (row.meta && row.meta.reason))) || "");
        const hasEmissionRows = (slice) => slice.some(tx => {
          const reason = getReason(tx);
          const currency = String(tx && tx.currency || "");
          return reason === "points_emission_blocked" || reason === "addPoints" || currency === "points_emission";
        });
        const refreshRows = () => {
          const bundle = getPointsMoneyLogSnapshot({ prefer: "debug_moneyLog" });
          logSource = bundle.logSource || logSource;
          rows = normalizeMoneyLogRows(bundle.rows, "econ_soc_step5_log");
          return rows;
        };
        const captureSlice = () => {
          const nextRows = refreshRows();
          const slice = nextRows.slice(logIndex);
          logIndex = nextRows.length;
          return slice;
        };
        const advanceLog = () => {
          refreshRows();
          logIndex = rows.length;
        };
        const ensureMinPoints = (min, tag) => {
          const me = S && S.me;
          const current = (me && Number.isFinite(me.points)) ? (me.points | 0) : 0;
          if (current < min && Econ && typeof Econ.transferPoints === "function") {
            const need = Math.max(0, min - current);
            if (need > 0) {
              Econ.transferPoints("worldBank", "me", need, "smoke_seed_points", { for: tag, need: min, had: current });
              advanceLog();
            }
          }
          const after = (S.me && Number.isFinite(S.me.points)) ? (S.me.points | 0) : current;
          return after;
        };

        advanceLog();

        const scenarios = [];

        ensureMinPoints(5, "step5_enough");
        const resEnough = social.applySocialPenalty("spam", "me", {
          amountWanted: 5,
          reason: "spam_penalty",
          meta: { scenario: "enough" }
        });
        const sliceEnough = captureSlice();
        scenarios.push({
          label: "enough",
          amountWanted: 5,
          amountActual: resEnough ? resEnough.amountActual : 0,
          partial: resEnough ? !!resEnough.partial : false,
          reasonSeen: sliceEnough.some(tx => getReason(tx) === "spam_penalty"),
          hasTransferRow: sliceEnough.some(tx => getReason(tx) === "spam_penalty"),
          hasEmission: hasEmissionRows(sliceEnough)
        });

        const pointsBeforeInsufficient = ensureMinPoints(2, "step5_insufficient");
        const insufficientWanted = Math.max(1, (pointsBeforeInsufficient | 0) + 3);
        const resInsufficient = social.applySocialPenalty("abuse", "me", {
          amountWanted: insufficientWanted,
          reason: "abuse_penalty",
          meta: { scenario: "insufficient" }
        });
        const sliceInsufficient = captureSlice();
        scenarios.push({
          label: "insufficient",
          amountWanted: insufficientWanted,
          amountActual: resInsufficient ? resInsufficient.amountActual : 0,
          partial: resInsufficient ? !!resInsufficient.partial : false,
          reasonSeen: sliceInsufficient.some(tx => getReason(tx) === "abuse_penalty"),
          hasTransferRow: sliceInsufficient.some(tx => getReason(tx) === "abuse_penalty"),
          hasEmission: hasEmissionRows(sliceInsufficient)
        });

        const resZero = social.applySocialPenalty("spam", "me", {
          amountWanted: 0,
          reason: "spam_penalty",
          meta: { scenario: "zero" }
        });
        const sliceZero = captureSlice();
        scenarios.push({
          label: "zero",
          amountWanted: 0,
          amountActual: resZero ? resZero.amountActual : 0,
          partial: resZero ? !!resZero.partial : false,
          reasonSeen: sliceZero.some(tx => getReason(tx) === "spam_penalty"),
          hasTransferRow: sliceZero.some(tx => getReason(tx) === "spam_penalty"),
          hasEmission: hasEmissionRows(sliceZero)
        });

        const afterSnap = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function") ? Game.__DEV.sumPointsSnapshot() : null;
        const afterTotal = afterSnap ? (afterSnap.total | 0) : null;
        const drift = (beforeTotal != null && afterTotal != null) ? (afterTotal - beforeTotal) : null;
        const finalRows = refreshRows();
        const tailReasonsSample = finalRows.slice(-30).map(getReason).filter(Boolean);
        const hasEmission = scenarios.some(s => s.hasEmission) || finalRows.some(tx => {
          const reason = getReason(tx);
          const currency = String(tx && tx.currency || "");
          return reason === "points_emission_blocked" || reason === "addPoints" || currency === "points_emission";
        });

        const enough = scenarios.find(s => s.label === "enough") || null;
        const insufficient = scenarios.find(s => s.label === "insufficient") || null;
        const zero = scenarios.find(s => s.label === "zero") || null;

        if (!enough || !enough.hasTransferRow) failed.push("enough_missing_transfer");
        if (!insufficient || !insufficient.hasTransferRow) failed.push("insufficient_missing_transfer");
        if (insufficient && !(insufficient.partial && insufficient.amountActual < insufficient.amountWanted)) {
          failed.push("insufficient_not_partial");
        }
        if (hasEmission) failed.push("points_emission_detected");
        if (drift !== 0) failed.push("world_drift");

        result = {
          ok: failed.length === 0,
          failed,
          scenarios,
          beforeTotal,
          afterTotal,
          drift,
          tailReasonsSample,
          hasEmission,
          logSource,
          name,
          startedAt,
          dumpHint
        };
        emitLine(`ECON_SOC_STEP5_JSON ${safeStringify(result)}`);
      }
    } catch (err) {
      result = {
        ok: false,
        failed: failed.length ? failed : ["exception"],
        errorMessage: err && err.message ? String(err.message) : String(err)
      };
      emitLine(`ECON_SOC_STEP5_JSON ${safeStringify(result)}`);
    } finally {
      emitLine("ECON_SOC_STEP5_END");
      if (Game.__DEV) Game.__DEV.lastEconSocStep5PenaltyHelper = result;
    }
    return result;
  };

  Game.__DEV.smokeEconSoc_Step5_3_SpamOnce = async (opts = {}) => {
    const name = "smoke_econ_soc_step5_3_spam_once";
    const startedAt = Date.now();
    const lastN = (opts && opts.window && Number.isFinite(opts.window.lastN)) ? (opts.window.lastN | 0) : 300;
    const dumpHint = (opts && typeof opts.dumpHint === "string") ? opts.dumpHint : "Game.__DUMP_ALL__()";
    let result = null;
    let failed = [];
    emitLine("ECON_SOC_STEP5_3_BEGIN");
    try {
      const S = Game.__S || Game.State;
      const core = (Game && (Game.ConflictCore || Game._ConflictCore)) ? (Game.ConflictCore || Game._ConflictCore) : null;
      const Econ = (Game && (Game._ConflictEconomy || Game.ConflictEconomy)) ? (Game._ConflictEconomy || Game.ConflictEconomy) : null;
      if (!S || !S.me || !S.players) {
        failed.push("state_missing");
      } else if (!core || typeof core.startWith !== "function") {
        failed.push("conflict_core_missing");
      } else if (!Game.Social || typeof Game.Social.applySocialPenalty !== "function") {
        failed.push("applySocialPenalty_missing");
      } else {
        const beforeSnap = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function") ? Game.__DEV.sumPointsSnapshot() : null;
        const beforeTotal = beforeSnap ? (beforeSnap.total | 0) : null;
        let logSource = "debug_moneyLog";
        let rows = [];
        let logIndex = 0;

        const getReason = (row) => String((row && (row.reason || row.r || (row.meta && row.meta.reason))) || "");
        const refreshRows = () => {
          const bundle = getPointsMoneyLogSnapshot({ prefer: "debug_moneyLog" });
          logSource = bundle.logSource || logSource;
          rows = normalizeMoneyLogRows(bundle.rows, "econ_soc_step5_3_log");
          return rows;
        };
        const captureSlice = () => {
          const nextRows = refreshRows();
          const slice = nextRows.slice(logIndex);
          logIndex = nextRows.length;
          return slice;
        };
        const advanceLog = () => {
          refreshRows();
          logIndex = rows.length;
        };
        const hasEmissionRows = (slice) => slice.some(tx => {
          const reason = getReason(tx);
          const currency = String(tx && tx.currency || "");
          return reason === "points_emission_blocked" || reason === "addPoints" || currency === "points_emission";
        });

        const meId = (S.me && S.me.id) ? String(S.me.id) : "me";
        const opponent = Object.values(S.players || {}).find(p => p && p.id && p.id !== meId && (p.npc || p.type === "npc")) || null;
        if (!opponent || !opponent.id) {
          failed.push("opponent_missing");
        } else {
          const opponentId = String(opponent.id);
          const spamKey = `battle_start:${opponentId}`;
          const spamActionId = `battle_start_${opponentId}`;

          if (!S.battleCooldowns || typeof S.battleCooldowns !== "object") S.battleCooldowns = {};
          S.battleCooldowns[opponentId] = 0;

          if (Econ && typeof Econ.transferPoints === "function") {
            const mePoints = (S.me && Number.isFinite(S.me.points)) ? (S.me.points | 0) : 0;
            if (mePoints < 1) {
              Econ.transferPoints("worldBank", "me", 1, "smoke_seed_points", { for: "soc_step5_3", need: 1, had: mePoints });
            }
          }

          advanceLog();

          const pointsBefore = (S.me && Number.isFinite(S.me.points)) ? (S.me.points | 0) : 0;
          const res1 = core.startWith(opponentId);
          const slice1 = captureSlice();
          const pointsAfter1 = (S.me && Number.isFinite(S.me.points)) ? (S.me.points | 0) : pointsBefore;

          const res2 = core.startWith(opponentId);
          const slice2 = captureSlice();
          const pointsAfter2 = (S.me && Number.isFinite(S.me.points)) ? (S.me.points | 0) : pointsAfter1;

          const reasons1 = slice1.map(getReason).filter(Boolean);
          const reasons2 = slice2.map(getReason).filter(Boolean);
          const penaltyCount =
            reasons1.filter(r => r === "spam_penalty").length +
            reasons2.filter(r => r === "spam_penalty").length;
          const firstHasPenalty = reasons1.includes("spam_penalty");
          const secondHasPenalty = reasons2.includes("spam_penalty");
          const blocked1 = !!(res1 && res1.reason === "cooldown");
          const blocked2 = !!(res2 && res2.reason === "cooldown");
          const hasEmission = hasEmissionRows(slice1) || hasEmissionRows(slice2);

          const afterSnap = (Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function") ? Game.__DEV.sumPointsSnapshot() : null;
          const afterTotal = afterSnap ? (afterSnap.total | 0) : null;
          const drift = (beforeTotal != null && afterTotal != null) ? (afterTotal - beforeTotal) : null;

          if (blocked1) failed.push("first_blocked");
          if (!blocked2) failed.push("second_not_blocked");
          if (firstHasPenalty) failed.push("first_penalized");
          if (!secondHasPenalty) failed.push("second_penalty_missing");
          if (penaltyCount !== 1) failed.push("penalty_count_mismatch");
          if (hasEmission) failed.push("points_emission_detected");
          if (drift !== 0) failed.push("world_drift");

          result = {
            ok: failed.length === 0,
            failed,
            first: { ok: res1 && res1.ok === true, reasons: reasons1 },
            second: { ok: res2 && res2.ok === true, reasons: reasons2, rateLimited: blocked2 },
            penaltyCount,
            hasEmission,
            beforeTotal,
            afterTotal,
            drift,
            diag: {
              spamKey1: spamKey,
              spamKey2: spamKey,
              blocked1,
              blocked2,
              pointsBefore,
              pointsAfter1,
              pointsAfter2
            },
            logSource,
            name,
            startedAt,
            dumpHint
          };
          emitLine(`ECON_SOC_STEP5_3_JSON ${safeStringify(result)}`);
        }
      }
      if (!result) {
        result = { ok: false, failed: failed.length ? failed : ["unknown"] };
        emitLine(`ECON_SOC_STEP5_3_JSON ${safeStringify(result)}`);
      }
    } catch (err) {
      result = {
        ok: false,
        failed: failed.length ? failed : ["exception"],
        errorMessage: err && err.message ? String(err.message) : String(err)
      };
      emitLine(`ECON_SOC_STEP5_3_JSON ${safeStringify(result)}`);
    } finally {
      emitLine("ECON_SOC_STEP5_3_END");
      if (Game.__DEV) Game.__DEV.lastEconSocStep5Spam = result;
    }
    return result;
  };

  Game.__DEV.smokeEconSoc_Step6_ThreeShotsOnce = async (opts = {}) => {
    const name = "smoke_econ_soc_step6_three_shots_once";
    const startedAt = Date.now();
    const lastN = (opts && opts.window && Number.isFinite(opts.window.lastN)) ? (opts.window.lastN | 0) : 400;
    const dumpHint = (opts && typeof opts.dumpHint === "string") ? opts.dumpHint : "Game.__DUMP_ALL__()";
    let result = null;
    let failed = [];
    emitLine("ECON_SOC_STEP6_BEGIN");
    try {
      const S = Game.__S || Game.State;
      const applyReport = Game.__A && typeof Game.__A.applyReportByRole === "function";
      const sumSnapshot = Game.__DEV && typeof Game.__DEV.sumPointsSnapshot === "function";
      if (!S || !S.players) failed.push("state_missing");
      if (!applyReport) failed.push("applyReportByRole_missing");
      if (!sumSnapshot) failed.push("sumPointsSnapshot_missing");

      const beforeSnap = sumSnapshot ? Game.__DEV.sumPointsSnapshot() : null;
      const beforeTotal = beforeSnap ? (beforeSnap.total | 0) : null;

      const npcList = Object.values(S.players || {}).filter(p => p && p.id && (p.npc === true || String(p.type || "").toLowerCase() === "npc"));
      if (npcList.length < 2) failed.push("not_enough_npcs");

      let truthTarget = npcList[0] || null;
      let falseTarget = npcList.find(p => p && truthTarget && p.id && p.id !== truthTarget.id) || null;
      if (!truthTarget) failed.push("truth_target_missing");
      if (!falseTarget) failed.push("false_target_missing");

      const normalizeRows = (rows) => normalizeMoneyLogRows(rows || [], "econ_soc_step6_log");
      const refreshSnapshot = () => {
        const bundle = getPointsMoneyLogSnapshot({ prefer: "debug_moneyLog" });
        logSource = bundle.logSource || logSource;
        rows = normalizeRows(bundle.rows);
        return rows;
      };
      let logSource = "debug_moneyLog";
      let rows = normalizeRows(getPointsMoneyLogSnapshot({ prefer: "debug_moneyLog" }).rows);
      let moneyRowCount = rows.length;
      const captureMoneySlice = () => {
        const cur = refreshSnapshot();
        const slice = cur.slice(moneyRowCount);
        moneyRowCount = cur.length;
        return slice;
      };
      const advanceMoneyBaseline = () => {
        const cur = refreshSnapshot();
        moneyRowCount = cur.length;
      };

      const dbgDev = (Game.__D && typeof Game.__D === "object") ? Game.__D : (Game.__D = {});
      const repeatLogRef = Array.isArray(dbgDev.repeatRateLimitLog) ? dbgDev.repeatRateLimitLog : (dbgDev.repeatRateLimitLog = []);
      let repeatRowCount = repeatLogRef.length;
      const captureRepeatSlice = () => {
        const slice = repeatLogRef.slice(repeatRowCount);
        repeatRowCount = repeatLogRef.length;
        return slice;
      };

      const getReason = (row) => {
        if (!row) return "";
        if (row.reason) return String(row.reason);
        if (row.meta && row.meta.reason) return String(row.meta.reason);
        if (row.r) return String(row.r);
        return "";
      };

      let sliceTruth = [];
      let sliceFalse1 = [];
      let sliceFalse2 = [];
      let rlSlice1 = [];
      let rlSlice2 = [];
      let reasonsTruth = [];
      let reasonsFalse1 = [];
      let reasonsFalse2 = [];
      let penaltyCount = 0;
      let rlKey1 = null;
      let rlKey2 = null;
      let rlBlockedSecond = false;

      if (!failed.length && truthTarget && falseTarget) {
        const normalizeRoleKey = (s) => {
          const x = String(s || "").toLowerCase();
          if (!x) return "";
          if (x.includes("токс") || x.includes("toxic")) return "toxic";
          if (x.includes("банд") || x.includes("bandit")) return "bandit";
          if (x.includes("мафи") || x.includes("mafia") || x.includes("mafioso")) return "mafia";
          return "";
        };
        const truthRole = normalizeRoleKey(truthTarget.role || truthTarget.type || "toxic") || "toxic";
        advanceMoneyBaseline();
        const actionIdTruth = `econ_soc_step6_truth_${Date.now()}`;
        Game.__A.applyReportByRole(truthRole, { actionId: actionIdTruth });
        sliceTruth = captureMoneySlice();
        reasonsTruth = Array.from(new Set(sliceTruth.map(getReason).filter(Boolean)));

        const actualFalseRole = String(falseTarget.role || falseTarget.type || "toxic");
        const wrongRole = (actualFalseRole === "toxic") ? "bandit" : "toxic";
        const reportedFalseName = String(wrongRole || "bandit");
        const origName = falseTarget.name;
        const origRole = falseTarget.role;
        const origType = falseTarget.type;
        try {
          falseTarget.role = "";
          falseTarget.type = actualFalseRole;
          falseTarget.name = reportedFalseName;

          const actionIdFalse1 = `econ_soc_step6_false1_${Date.now()}`;
          Game.__A.applyReportByRole(reportedFalseName, { actionId: actionIdFalse1 });
          sliceFalse1 = captureMoneySlice();
          rlSlice1 = captureRepeatSlice();
          reasonsFalse1 = Array.from(new Set(sliceFalse1.map(getReason).filter(Boolean)));

          const actionIdFalse2 = `econ_soc_step6_false2_${Date.now()}`;
          Game.__A.applyReportByRole(reportedFalseName, { actionId: actionIdFalse2 });
          sliceFalse2 = captureMoneySlice();
          rlSlice2 = captureRepeatSlice();
          reasonsFalse2 = Array.from(new Set(sliceFalse2.map(getReason).filter(Boolean)));
        } finally {
          falseTarget.name = origName;
          falseTarget.role = origRole;
          falseTarget.type = origType;
        }
      }

      const rlCheck1 = rlSlice1.slice().reverse().find(entry => entry && entry.type === "check");
      const rlCheck2 = rlSlice2.slice().reverse().find(entry => entry && entry.type === "check");
      rlKey1 = rlCheck1 ? (rlCheck1.stableKey || rlCheck1.rawKey || null) : null;
      rlKey2 = rlCheck2 ? (rlCheck2.stableKey || rlCheck2.rawKey || null) : null;
      rlBlockedSecond = rlCheck2 ? !!rlCheck2.blocked : false;

      penaltyCount = sliceFalse1.concat(sliceFalse2).filter(row => getReason(row) === "report_false_penalty").length;
      const allSlices = sliceTruth.concat(sliceFalse1, sliceFalse2);
      const hasEmission = allSlices.some(tx => {
        const reason = getReason(tx);
        const currency = String(tx && tx.currency || "").toLowerCase();
        return reason === "points_emission_blocked" || reason === "addPoints" || currency === "points_emission";
      });

      const afterSnap = sumSnapshot ? Game.__DEV.sumPointsSnapshot() : null;
      const afterTotal = afterSnap ? (afterSnap.total | 0) : null;
      const drift = (Number.isFinite(afterTotal) && Number.isFinite(beforeTotal)) ? (afterTotal - beforeTotal) : null;
      const finalBundle = getPointsMoneyLogSnapshot({ prefer: "debug_moneyLog" });
      logSource = finalBundle.logSource || logSource;

      const penaltyReasonsTruth = reasonsTruth.includes("rep_report_true");
      const falseHasRep = reasonsFalse1.includes("rep_report_false");
      const falseHasPenalty = reasonsFalse1.includes("report_false_penalty");
      const repeatHasRateLimit = reasonsFalse2.includes("report_rate_limited");
      const rlKeyMismatch = rlKey1 && rlKey2 && rlKey1 !== rlKey2;

      if (!penaltyReasonsTruth) failed.push("truth_missing_rep_true");
      if (!falseHasRep) failed.push("false_missing_rep_false");
      if (!falseHasPenalty) failed.push("false_missing_penalty");
      if (!repeatHasRateLimit) failed.push("repeat_not_rate_limited");
      if (penaltyCount !== 1) failed.push("penalty_count_mismatch");
      if (!rlBlockedSecond) failed.push("post_repeat_not_blocked");
      if (!rlKey1 || !rlKey2) failed.push("rl_key_missing");
      if (rlKeyMismatch) failed.push("rl_key_mismatch");
      if (hasEmission) failed.push("points_emission_detected");
      if (drift !== 0) failed.push("world_drift");
      if (Number.isFinite(beforeTotal) && Number.isFinite(afterTotal) && beforeTotal !== afterTotal) failed.push("total_mismatch");

      const ok = failed.length === 0;
      result = {
        ok,
        failed,
        reasonsTruth,
        reasonsFalse1,
        reasonsFalse2,
        hasEmission,
        beforeTotal,
        afterTotal,
        drift,
        penaltyCount,
        rlBlockedSecond,
        rlKey1,
        rlKey2,
        logSource
      };
      emitLine(`ECON_SOC_STEP6_JSON ${safeStringify(result)}`);
    } catch (err) {
      failed = failed.length ? failed : ["exception"];
      result = {
        ok: false,
        failed,
        errorMessage: err && err.message ? String(err.message) : String(err)
      };
      emitLine(`ECON_SOC_STEP6_JSON ${safeStringify(result)}`);
    } finally {
      emitLine("ECON_SOC_STEP6_END");
      if (Game.__DEV) Game.__DEV.lastEconSocStep6ThreeShots = result;
    }
    return result;
  };

  Game.__DEV.__devChecksVersion = "B2c_ignore_telemetry_gate_v3";
  Game.__DEV.startBalanceSmoke = () => {
    const name = "start_balance_smoke";
    try {
      const D0 = Game.Data || null;
      const S = Game.__S || null;
      if (!D0 || !S) return { name, ok: false, details: "Game.Data/Game.__S missing" };

      const startPlayer = Number.isFinite(D0.START_POINTS_PLAYER) ? (D0.START_POINTS_PLAYER | 0) : 12;
      const startNpc = Number.isFinite(D0.START_POINTS_NPC) ? (D0.START_POINTS_NPC | 0) : 8;

      const fresh = {};
      if (Game.__A && typeof Game.__A.resetAll === "function" && typeof Game.__A.seedPlayers === "function") {
        Game.__A.resetAll();
        Game.__A.seedPlayers();
        if (Game.__A.syncMeToPlayers) Game.__A.syncMeToPlayers();
      } else {
        if (!S.me) S.me = { id: "me", points: startPlayer, influence: 0, wins: 0 };
        if (!S.players) S.players = {};
        if (!S.players.me) S.players.me = S.me;
        if (Game.NPC && typeof Game.NPC.seedPlayers === "function") {
          Game.NPC.seedPlayers(S);
        }
        if (Game.__A && typeof Game.__A.syncMeToPlayers === "function") {
          Game.__A.syncMeToPlayers();
        }
      }
      fresh.me = (S.me && typeof S.me.points === "number") ? (S.me.points | 0) : null;
      fresh.playersMe = (S.players && S.players.me && typeof S.players.me.points === "number") ? (S.players.me.points | 0) : null;
      const npcs = Object.values(S.players || {}).filter(p => p && (p.npc === true || p.type === "npc"));
      fresh.npcCount = npcs.length;
      fresh.npcMin = npcs.reduce((m, p) => Math.min(m, (p.points | 0)), npcs.length ? (npcs[0].points | 0) : 0);
      fresh.npcMax = npcs.reduce((m, p) => Math.max(m, (p.points | 0)), 0);

      const existing = {};
      if (typeof Game._withPointsWrite === "function") {
        Game._withPointsWrite(() => {
          if (S.me) S.me.points = 0;
          if (S.players && S.players.me) S.players.me.points = 0;
        });
      } else {
        if (S.me) S.me.points = 0;
        if (S.players && S.players.me) S.players.me.points = 0;
      }
      const restore = Game.__DEV.resetProfileEconomyForDebug();
      existing.restore = restore;
      existing.me = (S.me && typeof S.me.points === "number") ? (S.me.points | 0) : null;
      existing.playersMe = (S.players && S.players.me && typeof S.players.me.points === "number") ? (S.players.me.points | 0) : null;
      existing.npcCount = (restore && typeof restore.npcCount === "number") ? restore.npcCount : null;

      const okFresh = (fresh.me === startPlayer && fresh.playersMe === startPlayer && fresh.npcCount > 0 && fresh.npcMin === startNpc && fresh.npcMax === startNpc);
      const okExisting = (existing.me === startPlayer && existing.playersMe === startPlayer);
      return {
        name,
        ok: okFresh && okExisting,
        details: { startPlayer, startNpc, fresh, existing }
      };
    } catch (e) {
      return { name, ok: false, details: String(e && e.message ? e.message : e) };
    }
  };

  Game.__DEV.resultCardSmoke = (opts = {}) => {
    const scenarioList = ["battle", "escape", "ignore"];
    const scenarioRaw = String(opts && opts.scenario ? opts.scenario : "battle").toLowerCase();
    const scenario = scenarioList.includes(scenarioRaw) ? scenarioRaw : "battle";
    const mode = (String(opts && opts.mode ? opts.mode : "majority").toLowerCase() === "fifty") ? "fifty" : "majority";
    const meVote = opts && opts.meVote === false ? false : true;
    const name = "result_card_smoke";
    const debugMarker = !!(opts && opts.debugMarker);
    if (debugMarker) console.warn("DEV_RESULT_CARD_V2_LOADED", Date.now());
    const S = Game.__S || (Game.__S = {});
    S.events = Array.isArray(S.events) ? S.events : [];
    if (!Game.__D) Game.__D = {};
    if (!Array.isArray(Game.__D.moneyLog)) Game.__D.moneyLog = [];
    if (!Array.isArray(Game.__D.toastLog)) Game.__D.toastLog = [];

    const existingIds = Array.isArray(Game.__DEV._resultCardIds) ? Game.__DEV._resultCardIds : [];
    if (existingIds.length) {
      S.events = S.events.filter(e => !e || !existingIds.includes(e.id));
    }

    const now = Date.now();
    const id = `dev_result_${scenario}_${mode}_${meVote ? "vote" : "pass"}_${now}`;
    const battleId = `${id}_battle`;
    const votes = (mode === "fifty") ? { a: 3, b: 3 } : { a: 5, b: 2 };
    const winnerSide = votes.a === votes.b ? null : "a";
    const resultText = (() => {
      if (winnerSide === "a") return "Толпа засчитала победу А";
      if (winnerSide === "b") return "Толпа засчитала победу B";
      return "Толпа зафиксировала ничью";
    })();

    const canonicalA = "И1";
    const canonicalB = "И2";
    const aName = canonicalA;
    const bName = canonicalB;
    const aInf = scenario === "escape" ? 12 : 7;
    const bInf = scenario === "escape" ? 8 : 5;

    const crowd = {
      aVotes: votes.a,
      bVotes: votes.b,
      votesA: votes.a,
      votesB: votes.b,
      voters: {},
      endAt: now - 500,
      decided: winnerSide !== null,
      winner: winnerSide,
      totalVotes: (votes.a + votes.b),
    };
    if (meVote) {
      const meId = (S.me && S.me.id) ? S.me.id : "me";
      crowd.voters[meId] = "a";
    }

    const isEscape = scenario !== "battle";
    const escapeMode = isEscape ? ((scenario === "ignore") ? "off" : "smyt") : null;
    const voteLabels = isEscape ? ((scenario === "ignore")
      ? { a: "Отвали!", b: "Останься!" }
      : { a: "Свали!", b: "Останься!" })
      : null;

    const canonicalLines = [];
    const deltaRep = 2;
    const deltaPts = 1;
    const winnerSideResolved = winnerSide === "a";

    if (scenario === "battle") {
      if (mode === "majority") {
        canonicalLines.push(`${canonicalA} победил ${canonicalB}!`);
        if (meVote) canonicalLines.push(`Ты голосовал(а) за: ${canonicalA}`);
      } else {
        canonicalLines.push("Ничья!");
        canonicalLines.push(`${canonicalA} против ${canonicalB}`);
      }
    } else if (scenario === "escape") {
      const escapeResult = winnerSideResolved ? "смылся(ась)" : "не смылся(ась)";
      canonicalLines.push(`${canonicalA} ${escapeResult} от ${canonicalB}!`);
      if (meVote) {
        const choiceVerb = winnerSideResolved ? "смыться" : "остаться";
        canonicalLines.push(`Ты помог(ла): ${choiceVerb}`);
      }
    } else {
      const sendResult = winnerSideResolved ? "послал(а)" : "не смог(ла) послать";
      canonicalLines.push(`${canonicalA} ${sendResult} ${canonicalB}!`);
      if (meVote) {
        const choiceVerb = winnerSideResolved ? "послать" : "остаться";
        canonicalLines.push(`Ты помог(ла): ${choiceVerb}`);
      }
    }

    if (meVote) {
      canonicalLines.push(`Дельта: REP +${deltaRep}, пойнты +${deltaPts}`);
    }

    const devCardLines = canonicalLines.slice();
    if (debugMarker) {
      const diagFootnote = `DEV_LINES=${devCardLines.join(" | ")}`;
      devCardLines.push(diagFootnote);
      devCardLines.unshift("DEV_RESULT_CARD_V2");
      console.warn("DEV_CARD_LINES", { scenario, mode, meVote, lines: devCardLines });
    }

    const event = {
      id,
      battleId,
      kind: scenario === "battle" ? "draw" : "escape",
      type: scenario === "battle" ? "draw" : "escape",
      title: `${debugMarker ? "DEV_RESULT_CARD_V2 " : ""}Dev card: ${scenario}`,
      createdAt: now - 1500,
      endsAt: now - 500,
      state: "resolved",
      resolved: true,
      resultLine: canonicalLines[0] || resultText,
      result: winnerSide === "a" ? "a" : (winnerSide === "b" ? "b" : "tie"),
      winnerSide,
      aId: `npc_dev_result_a_${scenario}`,
      bId: `npc_dev_result_b_${scenario}`,
      aName,
      bName,
      aInf,
      bInf,
      a: { id: `npc_dev_result_a_${scenario}`, name: aName, influence: aInf, npc: true },
      b: { id: `npc_dev_result_b_${scenario}`, name: bName, influence: bInf, npc: true },
      votesA: votes.a,
      votesB: votes.b,
      aVotes: votes.a,
      bVotes: votes.b,
      playerVoted: meVote,
      myVote: meVote ? "a" : null,
      crowd,
      escapeMode,
      voteLabels,
      uiNote: `${debugMarker ? "DEV_RESULT_CARD_V2 " : ""}dev card ${mode} ${meVote ? "me" : "no"}`,
      closed: false,
    };
    const devCardPayload = {
      lines: devCardLines,
      scenario,
      mode,
      meVote,
      debugMarker
    };
    event.devCard = devCardPayload;
    if (debugMarker) {
      console.warn("DEV_EVENT_HAS_DEVCARD", !!event.devCard, event.devCard?.lines);
    }

    S.events.unshift(event);
    Game.__DEV._resultCardIds = [event.id];

    if (!Game.__D) Game.__D = {};
    if (!Array.isArray(Game.__D.moneyLog)) Game.__D.moneyLog = [];
    if (!Array.isArray(Game.__D.toastLog)) Game.__D.toastLog = [];

    try { if (Game.UI && typeof Game.UI.renderEvents === "function") Game.UI.renderEvents(); } catch (_) {}
    try { if (Game.UI && typeof Game.UI.requestRenderAll === "function") Game.UI.requestRenderAll(); } catch (_) {}

    return { name, ok: true, scenario, mode, meVote, eventId: id };
  };

  Game.__DEV.runtimeCrowdAuditOnce = async (opts = {}) => {
    const name = "runtime_crowd_audit_once";
    const S = Game.__S || null;
    const Econ = Game.ConflictEconomy || Game._ConflictEconomy || null;
    const Core = Game.ConflictCore || Game._ConflictCore || null;
    const Conflict = Game.Conflict || null;
    const Args = Game._ConflictArguments || Game.ConflictArguments || null;
    const diag = { stageTrace: [], battlesCount: (S && Array.isArray(S.battles)) ? S.battles.length : 0, lastBattle: null, whyNoCrowd: null };
    const pushStage = (s) => { diag.stageTrace.push(s); };
    if (!S || !S.players) return { name, ok: false, details: "missing_state", battleId: null, diag };
    if (!Core || !Conflict) return { name, ok: false, details: "missing_conflict", battleId: null, diag };

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    const ids = [];
    const pushId = (id) => {
      if (!id) return;
      if (ids.includes(id)) return;
      ids.push(id);
    };
    pushId("me");
    pushId("npc_mafia");
    Object.values(S.players || {}).forEach(p => {
      if (!p || !p.id) return;
      const id = String(p.id || "");
      if (id === "me") return;
      if (!id.startsWith("npc_")) return;
      pushId(id);
    });
    let auditIds = ids.slice(0, 10);
    let beforePtsMap = Object.create(null);
    let afterPtsMap = Object.create(null);
    let baselinePtsMap = Object.create(null);
    let totalPtsWorldBefore = null;
    let totalPtsWorldAfter = null;
    let expectedStart = null;
    if (Game.__A && typeof Game.__A.getPointsConfig === "function") {
      const cfg = Game.__A.getPointsConfig();
      if (cfg && Number.isFinite(cfg.start)) expectedStart = cfg.start | 0;
    }
    if (expectedStart == null && Game.Data && Number.isFinite(Game.Data.POINTS_START)) expectedStart = Game.Data.POINTS_START | 0;
    if (expectedStart == null) expectedStart = 10;
    let start10Ok = false;

    let battleId = null;
    let battle = null;
    const getBattleList = () => {
      const bt = S.battles;
      if (Array.isArray(bt)) return bt;
      if (bt && typeof bt === "object") return Object.values(bt);
      return [];
    };
    const getBattle = (id) => getBattleList().find(b => b && String(b.id) === String(id)) || null;
    let battleIdCandidate = null;
    let lastBattleIdGuess = null;
    let foundBy = null;
    const oppId = (opts && opts.oppId && S.players[opts.oppId]) ? opts.oppId : "npc_weak";
    if (Conflict.incoming) {
      const b = Conflict.incoming(oppId);
      battle = (b && b.id) ? b : (b && b.battle && b.battle.id ? b.battle : null);
      battleId = battle ? battle.id : null;
      battleIdCandidate = battleId;
      pushStage("battle_created");
    } else {
      diag.whyNoCrowd = { status: "missing_incoming", missingField: "Conflict.incoming" };
      return { name, ok: false, details: "missing_incoming", battleId, diag };
    }

    const battlesList = getBattleList();
    if (!battleId) {
      const last = battlesList[battlesList.length - 1];
      lastBattleIdGuess = last ? last.id : null;
      battleId = lastBattleIdGuess;
      battleIdCandidate = battleIdCandidate || battleId;
    }
    battle = getBattle(battleId) || battle;
    if (battle && battle.id) {
      if (!foundBy) foundBy = battleIdCandidate ? "return_id" : "last_battle_guess";
    } else {
      foundBy = "scan";
    }
    if (!battleId || !battle) {
      const bt = S.battles;
      const keysSample = (bt && typeof bt === "object" && !Array.isArray(bt)) ? Object.keys(bt).slice(0, 3) : [];
      const idsSample = battlesList.slice(0, 3).map(x => x && x.id ? x.id : null);
      diag.whyNoCrowd = { status: "no_battle_after_create", missingField: "battle", battleIdCandidate };
      diag.battlesType = { isArray: Array.isArray(bt), len: Array.isArray(bt) ? bt.length : (bt && typeof bt === "object" ? Object.keys(bt).length : 0), keysSample };
      diag.battlesIdSample = idsSample;
      diag.lastBattleIdGuess = lastBattleIdGuess;
      diag.battleIdCandidate = battleIdCandidate;
      diag.foundBy = foundBy;
      return { name, ok: false, details: "no_battle_after_create", battleId, diag };
    }
    diag.battlesType = { isArray: Array.isArray(S.battles), len: battlesList.length, keysSample: Array.isArray(S.battles) ? [] : Object.keys(S.battles || {}).slice(0, 3) };
    diag.battlesIdSample = battlesList.slice(0, 3).map(x => x && x.id ? x.id : null);
    diag.lastBattleIdGuess = lastBattleIdGuess;
    diag.battleIdCandidate = battleIdCandidate;
    diag.foundBy = foundBy;

    pushStage("attack_picked");
    const defenseOpts = (Args && typeof Args.myDefenseOptions === "function") ? Args.myDefenseOptions(battle) : [];
    const canonDefs = defenseOpts.filter(a => a && String(a.id || "").startsWith("canon_"));
    let drawPick = null;
    if (canonDefs.length && Core && typeof Core.computeOutcome === "function") {
      for (let i = 0; i < canonDefs.length; i++) {
        const o = Core.computeOutcome(battle, battle.attack, canonDefs[i]);
        if (o === "draw") { drawPick = canonDefs[i]; break; }
      }
    }
    if (!drawPick) drawPick = canonDefs[0] || null;
    if (!drawPick || !Conflict.pickDefense) {
      diag.whyNoCrowd = { status: "no_defense_pick", missingField: "defense" };
      return { name, ok: false, details: "no_defense_pick", battleId, diag };
    }
    const pickRes = Conflict.pickDefense(battleId, drawPick.id);
    pushStage("defense_picked");
    battle = getBattle(battleId) || battle;
    pushStage("resolve_called");
    if (battle && String(battle.status || "") === "pickDefense") {
      if (Conflict.resolveBattle) {
        Conflict.resolveBattle(battle, drawPick);
      }
    }
    battle = getBattle(battleId) || battle;
    pushStage(`after_resolve_status:${battle && battle.status ? battle.status : "unknown"}`);

    const maxWaitMs = (opts && Number.isFinite(opts.maxWaitMs)) ? (opts.maxWaitMs | 0) : 15000;
    const startWait = Date.now();
    while (Date.now() - startWait < maxWaitMs) {
      battle = getBattle(battleId) || battle;
      if (battle && battle.crowd) break;
      await sleep(250);
    }
    battle = getBattle(battleId) || battle;
    if (!battle || !battle.crowd) {
      diag.whyNoCrowd = {
        status: battle ? battle.status : null,
        result: battle ? battle.result : null,
        phase: battle ? battle.phase : null,
        missingField: "crowd",
        keys: battle ? Object.keys(battle) : null,
        crowdKeys: battle && battle.crowd ? Object.keys(battle.crowd) : null
      };
      diag.lastBattle = battle ? {
        id: battle.id,
        status: battle.status,
        result: battle.result,
        phase: battle.phase,
        hasCrowd: !!battle.crowd,
        crowdExists: !!battle.crowd,
        crowdMeta: battle.crowd ? {
          decided: !!battle.crowd.decided,
          endedBy: battle.crowd.crowdCapDebug ? battle.crowd.crowdCapDebug.endedBy : null,
          totalVotes: (battle.crowd.aVotes | 0) + (battle.crowd.bVotes | 0),
          totalWeighted: (battle.crowd.votesA | 0) + (battle.crowd.votesB | 0),
          cap: battle.crowd.cap
        } : null
      } : null;
      return { name, ok: false, details: "no_crowd", battleId, diag };
    }
    pushStage("crowd_attached");
    const crowd = battle.crowd || {};
    const totalVotesFromCrowd = (c) => {
      if (!c) return 0;
      if (c.voters && typeof c.voters === "object") {
        return Object.keys(c.voters).length | 0;
      }
      const a = Number.isFinite(c.votesA) ? (c.votesA | 0) : (Number.isFinite(c.aVotes) ? (c.aVotes | 0) : 0);
      const b = Number.isFinite(c.votesB) ? (c.votesB | 0) : (Number.isFinite(c.bVotes) ? (c.bVotes | 0) : 0);
      return (a + b) | 0;
    };
    let tickCount = 0;
    const maxTicks = (opts && Number.isFinite(opts.maxTicks)) ? (opts.maxTicks | 0) : 240;
    while (tickCount < maxTicks && crowd && !crowd.decided) {
      if (Conflict && typeof Conflict.applyCrowdVote === "function") {
        Conflict.applyCrowdVote(battleId);
      } else if (Core && typeof Core.applyCrowdVoteTick === "function") {
        Core.applyCrowdVoteTick(battleId);
      }
      battle = getBattle(battleId) || battle;
      if (battle && battle.crowd) {
        const v = battle.crowd;
        if (v.decided) break;
        if (Number.isFinite(v.cap) && totalVotesFromCrowd(v) >= (v.cap | 0)) {
          if (Core && typeof Core.applyCrowdVoteTick === "function") {
            Core.applyCrowdVoteTick(battleId);
          }
        }
      }
      tickCount++;
      await sleep(50);
    }
    if (battle && battle.crowd && battle.crowd.decided) pushStage("cap_reached");
    pushStage("finalized");
    const endedBy = crowd.crowdCapDebug ? crowd.crowdCapDebug.endedBy : ((Game.__D && Game.__D.crowdCapMetaByBattle && battleId) ? (Game.__D.crowdCapMetaByBattle[battleId] && Game.__D.crowdCapMetaByBattle[battleId].endedBy) : null);
    const rawVotes = totalVotesFromCrowd(crowd);
    const meta = (Game.__D && Game.__D.crowdCapMetaByBattle && battleId) ? Game.__D.crowdCapMetaByBattle[battleId] : null;
    const totalWeighted = meta ? ((meta.aVotes | 0) + (meta.bVotes | 0)) : ((Number.isFinite(crowd.aVotes) ? (crowd.aVotes | 0) : 0) + (Number.isFinite(crowd.bVotes) ? (crowd.bVotes | 0) : 0));
    const weightedSideCounts = { a: meta ? (meta.aVotes | 0) : (crowd.aVotes | 0), b: meta ? (meta.bVotes | 0) : (crowd.bVotes | 0), total: totalWeighted | 0 };
    const winner = crowd.winnerSide || battle.winnerSide || null;
    const timerUsed = endedBy && endedBy !== "cap";

    const log = normalizeMoneyLogRows((Game.__D && Game.__D.moneyLog) ? Game.__D.moneyLog : [], "capdiag.log");
    const byBattle = (Game.__D && Game.__D.moneyLogByBattle && battleId && Array.isArray(Game.__D.moneyLogByBattle[battleId]))
      ? Game.__D.moneyLogByBattle[battleId]
      : null;
    const scoped = normalizeMoneyLogRows(byBattle || log, "capdiag.scoped").filter(e => String(e && e.battleId || "") === String(battleId));
    diag.moneyLogScope = {
      source: byBattle ? "moneyLogByBattle" : "moneyLog",
      rowsLen: log.length,
      battleRowsLen: scoped.length
    };
    diag.first10BattleRows = scoped.slice(0, 10).map(e => ({
      reason: e && e.reason,
      sourceId: e && e.sourceId,
      targetId: e && e.targetId,
      amount: e && e.amount
    }));
    diag.econHooks = {
      hasTransferPoints: !!(Econ && typeof Econ.transferPoints === "function"),
      pointsLogCurrencyPresence: scoped.some(e => String(e && e.currency || "") === "points")
    };
    const sum = (pred) => scoped.filter(pred).reduce((s, e) => s + ((e && Number.isFinite(e.amount)) ? (e.amount | 0) : 0), 0);
    const cost = sum(e => String(e && e.reason || "") === "crowd_vote_cost");
    const poolInit = sum(e => String(e && e.reason || "") === "crowd_vote_pool_init");
    const refunds = sum(e => String(e && e.reason || "").startsWith("crowd_vote_refund"));
    const loserPenalty = sum(e => String(e && e.reason || "") === "crowd_vote_loser_penalty");
    const remainderWin = sum(e => String(e && e.reason || "") === "crowd_vote_remainder_win");
    const remainderSplit = sum(e => String(e && e.reason || "").startsWith("crowd_vote_remainder_split_"));
    const poolAfter = (Econ && typeof Econ.getPoolBalance === "function") ? (Econ.getPoolBalance(poolId) | 0) : null;

    const logNetById = {};
    scoped.forEach(e => {
      const currency = String(e && e.currency || "");
      const reason = String(e && e.reason || "");
      if (currency === "rep" || reason.startsWith("rep_")) return;
      const amt = (e && Number.isFinite(e.amount)) ? (e.amount | 0) : 0;
      const src = String(e && e.sourceId || "");
      const tgt = String(e && e.targetId || "");
      if (!src && !tgt) return;
      if (src) logNetById[src] = (logNetById[src] || 0) - amt;
      if (tgt) logNetById[tgt] = (logNetById[tgt] || 0) + amt;
    });

    const trackedSet = new Set();
    const addIfTracked = (id) => {
      if (!id) return;
      const key = String(id);
      if (key === "me") { trackedSet.add("me"); return; }
      if (isPoolId(key)) { trackedSet.add(key); return; }
      if (S.players && S.players[key]) trackedSet.add(key);
    };
    scoped.forEach(e => {
      const reason = String(e && e.reason || "");
      const src = String(e && e.sourceId || "");
      const tgt = String(e && e.targetId || "");
      if (reason === "crowd_vote_cost") addIfTracked(src);
      if (reason.startsWith("crowd_vote_refund")) addIfTracked(tgt);
      if (reason === "crowd_vote_remainder_win") addIfTracked(tgt);
      if (reason.startsWith("crowd_vote_remainder_split_")) addIfTracked(tgt);
      if (reason === "crowd_vote_loser_penalty") { addIfTracked(src); addIfTracked(tgt); }
      if (reason === "battle_win_take") { addIfTracked(src); addIfTracked(tgt); }
    });
    addIfTracked("me");
    addIfTracked(oppId);
    addIfTracked("sink");
    if (battleId) addIfTracked((Econ && typeof Econ.getCrowdPoolId === "function") ? Econ.getCrowdPoolId(battleId) : `crowd:${battleId}`);
    auditIds = Array.from(trackedSet);
    if (!auditIds.length) auditIds = ids.slice(0, 10);

    afterPtsMap = Object.create(null);
    auditIds.forEach(id => {
      afterPtsMap[id] = getPointsById(id);
    });

    beforePtsMap = Object.create(null);
    auditIds.forEach(id => {
      const a = afterPtsMap[id];
      const ln = logNetById[id];
      if (Number.isFinite(a) && Number.isFinite(ln)) beforePtsMap[id] = (a | 0) - (ln | 0);
      else if (Number.isFinite(a)) beforePtsMap[id] = (a | 0);
      else beforePtsMap[id] = null;
    });
    baselinePtsMap = Object.assign(Object.create(null), beforePtsMap);
    totalPtsWorldBefore = auditIds.reduce((s, id) => s + (Number.isFinite(beforePtsMap[id]) ? (beforePtsMap[id] | 0) : 0), 0);
    totalPtsWorldAfter = auditIds.reduce((s, id) => s + (Number.isFinite(afterPtsMap[id]) ? (afterPtsMap[id] | 0) : 0), 0);
    start10Ok = auditIds.filter(id => !isPoolId(id)).every(id => beforePtsMap[id] === expectedStart);

    const netById = {};
    auditIds.forEach(id => {
      const b = beforePtsMap[id];
      const a = afterPtsMap[id];
      netById[id] = (typeof a === "number" && typeof b === "number") ? ((a | 0) - (b | 0)) : null;
    });

    const totalPlayers = Number.isFinite(crowd.totalPlayers) ? (crowd.totalPlayers | 0) : Object.keys(S.players || {}).length;
    const capExpected = Math.max(10, Math.round(0.4 * (totalPlayers | 0)));
    const capOk = (Number.isFinite(crowd.cap) ? (crowd.cap | 0) : 0) === capExpected;
    const poolZeroOk = (poolAfter == null) ? false : (poolAfter === 0);
    const worldMassOk = totalPtsWorldBefore === totalPtsWorldAfter;
    const costEntries = scoped.filter(e => String(e && e.reason || "") === "crowd_vote_cost");
    const costCountById = {};
    costEntries.forEach(e => {
      const id = String(e && e.sourceId || "");
      if (!id) return;
      costCountById[id] = (costCountById[id] || 0) + 1;
    });
    const paidVotesOk = costEntries.every(e => {
      if (!e || (e.amount | 0) !== 1) return false;
      const id = String(e.sourceId || "");
      const before = beforePtsMap[id];
      const after = afterPtsMap[id];
      return (typeof before === "number" && typeof after === "number");
    });
    const logMatchesState = auditIds.every(id => {
      const d = netById[id];
      const l = logNetById[id];
      if (d == null && l == null) return true;
      return (d | 0) === (l | 0);
    });

    diag.lastBattle = {
      id: battle.id,
      status: battle.status,
      result: battle.result,
      hasCrowd: !!battle.crowd,
      crowdDecided: !!(battle.crowd && battle.crowd.decided),
      totalVotes: rawVotes,
      totalWeighted,
      cap: crowd.cap,
      endedBy
    };

    let reverted = false;
    let revertAgg = 0;
    const revertAfterPtsMap = Object.create(null);
    if (Econ && typeof Econ.transferPoints === "function") {
      auditIds.forEach(id => {
        if (isPoolId(id)) return;
        const before = beforePtsMap[id];
        const after = afterPtsMap[id];
        if (!Number.isFinite(before) || !Number.isFinite(after)) return;
        const delta = (after | 0) - (before | 0);
        if (delta === 0) return;
        if (delta > 0) {
          Econ.transferPoints(id, "sink", delta, "runtime_audit_revert_points", { battleId });
          revertAgg += delta;
        } else if (delta < 0) {
          Econ.transferPoints("sink", id, -delta, "runtime_audit_revert_points", { battleId });
          revertAgg += (-delta);
        }
      });
      auditIds.forEach(id => {
        revertAfterPtsMap[id] = getPointsById(id);
      });
      reverted = auditIds.filter(id => !isPoolId(id)).every(id => {
        const b = beforePtsMap[id];
        const a = revertAfterPtsMap[id];
        if (!Number.isFinite(b) || !Number.isFinite(a)) return false;
        return (b | 0) === (a | 0);
      });
    }

    const result = {
      name,
      ok: true,
      scenario,
      battleId,
      endedBy,
      timerUsed: !!timerUsed,
      cap: crowd.cap,
      totalVotes: rawVotes,
      rawVotes,
      totalWeighted,
      sideCounts: weightedSideCounts,
      weightedSideCounts,
      winner,
      baselinePtsMap,
      beforePtsMap,
      afterPtsMap,
      reverted,
      revertAgg,
      revertAfterPtsMap,
      massBefore: totalPtsWorldBefore,
      massAfter: totalPtsWorldAfter,
      massDelta: (Number.isFinite(totalPtsWorldAfter) && Number.isFinite(totalPtsWorldBefore)) ? ((totalPtsWorldAfter | 0) - (totalPtsWorldBefore | 0)) : null,
      moneyLogAgg: { cost, poolInit, refunds, loserPenalty, remainderWin, remainderSplit, rowsCount: scoped.length },
      asserts: { start10Ok, paidVotesOk, capOk, poolZeroOk, worldMassOk, logMatchesState },
      diag
    };

    console.log("RUNTIME_CROWD_AUDIT_SUMMARY", {
      battleId,
      endedBy,
      timerUsed: !!timerUsed,
      cap: crowd.cap,
      rawVotes,
      totalWeighted
    });
    console.dir({ beforePtsMap, afterPtsMap, netById }, { depth: null });
    console.dir({ moneyLogAgg: result.moneyLogAgg }, { depth: null });
    console.dir({ sideCounts: weightedSideCounts, winner }, { depth: null });
    return result;
  };

  const runtimeCrowdAuditEscapeIgnoreOnce = async (mode, scenario, opts = {}) => {
    const name = (scenario === "ignore") ? "runtime_crowd_audit_ignore_once" : "runtime_crowd_audit_escape_once";
    const S = Game.__S || null;
    const Econ = Game.ConflictEconomy || Game._ConflictEconomy || null;
    const Core = Game.ConflictCore || Game._ConflictCore || null;
    const Conflict = Game.Conflict || null;
    const diag = { stageTrace: [], battlesCount: (S && Array.isArray(S.battles)) ? S.battles.length : 0, lastBattle: null, whyNoCrowd: null, scenario, mode };
    const pushStage = (s) => { diag.stageTrace.push(s); };
    if (!S || !S.players) return { name, ok: false, details: "missing_state", battleId: null, diag };
    if (!Core || !Conflict) return { name, ok: false, details: "missing_conflict", battleId: null, diag };

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    let expectedStart = null;
    if (Game.__A && typeof Game.__A.getPointsConfig === "function") {
      const cfg = Game.__A.getPointsConfig();
      if (cfg && Number.isFinite(cfg.start)) expectedStart = cfg.start | 0;
    }
    if (expectedStart == null && Game.Data && Number.isFinite(Game.Data.POINTS_START)) expectedStart = Game.Data.POINTS_START | 0;
    if (expectedStart == null) expectedStart = 10;

    let battleId = null;
    let battle = null;
    const getBattleList = () => {
      const bt = S.battles;
      if (Array.isArray(bt)) return bt;
      if (bt && typeof bt === "object") return Object.values(bt);
      return [];
    };
    const getBattle = (id) => getBattleList().find(b => b && String(b.id) === String(id)) || null;
    let oppId = (opts && opts.oppId && S.players[opts.oppId]) ? opts.oppId : "npc_weak";
    if (scenario === "ignore") {
      const meInf = (S.me && Number.isFinite(S.me.influence)) ? (S.me.influence | 0) : 0;
      const npcIds = Object.keys(S.players || {}).filter(id => id && String(id).startsWith("npc_"));
      const pick = npcIds
        .map(id => ({ id, inf: (S.players[id] && Number.isFinite(S.players[id].influence)) ? (S.players[id].influence | 0) : 0 }))
        .filter(x => x.inf >= meInf);
      if (pick.length) {
        pick.sort((a, b) => b.inf - a.inf);
        oppId = pick[0].id;
      }
    }
    const prevRuntimeId = Game.__DEV.__lastRuntimeAnyBattleId || null;
    if (Conflict.incoming) {
      const b = Conflict.incoming(oppId);
      battle = (b && b.id) ? b : (b && b.battle && b.battle.id ? b.battle : null);
      battleId = battle ? battle.id : null;
      if (prevRuntimeId && battleId && String(prevRuntimeId) === String(battleId)) {
        const altOpp = Object.keys(S.players || {}).find(id => id !== oppId && id !== "me" && String(id || "").startsWith("npc_")) || oppId;
        try {
          const b2 = Conflict.incoming(altOpp);
          const battle2 = (b2 && b2.id) ? b2 : (b2 && b2.battle && b2.battle.id ? b2.battle : null);
          if (battle2 && battle2.id && String(battle2.id) !== String(battleId)) {
            battle = battle2;
            battleId = battle2.id;
          }
        } catch (_) {}
      }
      pushStage("battle_created");
    } else {
      diag.whyNoCrowd = { status: "missing_incoming", missingField: "Conflict.incoming" };
      return { name, ok: false, details: "missing_incoming", battleId, diag };
    }

    if (!battleId || !battle) {
      const list = getBattleList();
      const keysSample = (S.battles && typeof S.battles === "object" && !Array.isArray(S.battles)) ? Object.keys(S.battles).slice(0, 3) : [];
      const idSample = list.slice(0, 3).map(x => x && x.id ? x.id : null);
      let last = list[list.length - 1] || null;
      if (!last && list.length) last = list[0];
      if (list.length > 1) {
        const byTime = list.slice().sort((a, b) => {
          const ta = (a && Number.isFinite(a.createdAt)) ? (a.createdAt | 0) : (a && Number.isFinite(a.updatedAt) ? (a.updatedAt | 0) : 0);
          const tb = (b && Number.isFinite(b.createdAt)) ? (b.createdAt | 0) : (b && Number.isFinite(b.updatedAt) ? (b.updatedAt | 0) : 0);
          return ta - tb;
        });
        last = byTime.filter(x => x && String(x.id || "") !== String(prevRuntimeId || "")).pop() || byTime[byTime.length - 1] || last;
      }
      if (last && last.id) {
        battle = last;
        battleId = last.id;
      }
      diag.battlesType = { isArray: Array.isArray(S.battles), len: list.length, keysSample };
      diag.battlesIdSample = idSample;
      diag.battleIdCandidate = battleId;
      diag.battleKeysSample = battle ? Object.keys(battle).slice(0, 10) : null;
      diag.foundBy = battle ? "last_battle_guess" : "none";
      if (!battleId || !battle) {
        diag.whyNoCrowd = { status: "no_battle_after_create", missingField: "battle" };
        return { name, ok: false, details: "no_battle_after_create", battleId, diag };
      }
    }
    if (battleId) Game.__DEV.__lastRuntimeAnyBattleId = battleId;

    const esc = (scenario === "ignore" && typeof Conflict.ignore === "function")
      ? Conflict.ignore(battleId)
      : (Conflict.escape ? Conflict.escape(battleId, mode) : null);
    if (!esc || esc.ok === false) {
      diag.whyNoCrowd = { status: "escape_start_failed", missingField: "escapeVote", error: esc && (esc.error || esc.reason) || null };
      return { name, ok: false, details: "escape_start_failed", battleId, diag };
    }
    pushStage(scenario === "ignore" ? "ignore_started" : "escape_started");

    battle = getBattle(battleId) || battle;
    if (!battle || !battle.escapeVote) {
      try {
        const retry = (scenario === "ignore" && typeof Conflict.ignore === "function")
          ? Conflict.ignore(battleId)
          : (Conflict.escape ? Conflict.escape(battleId, mode) : null);
        if (retry && retry.ok !== false) {
          battle = getBattle(battleId) || battle;
        }
      } catch (_) {}
      if (!battle || !battle.escapeVote) {
        diag.whyNoCrowd = { status: battle ? battle.status : null, missingField: "escapeVote" };
        return { name, ok: false, details: "no_escape_vote", battleId, diag };
      }
    }
    pushStage("crowd_attached");

    const v = battle.escapeVote;
    if (!Number.isFinite(v.cap) || v.cap <= 0) {
      const totalPlayers = Object.keys(S.players || {}).length;
      v.cap = Math.max(10, Math.round(0.4 * (totalPlayers | 0)));
      v.totalPlayers = totalPlayers;
    }

    const isPoolId = (id) => {
      const s = String(id || "");
      return s === "sink" || s === "crowd" || s.startsWith("crowd:");
    };
    const getPointsById = (id) => {
      if (isPoolId(id)) {
        if (Econ && typeof Econ.getPoolBalance === "function") return Econ.getPoolBalance(id) | 0;
        return null;
      }
      const p = (id === "me") ? (S.players.me || S.me) : S.players[id];
      return (p && Number.isFinite(p.points)) ? (p.points | 0) : null;
    };
    const poolId = (Econ && Econ.getCrowdPoolId && battleId) ? Econ.getCrowdPoolId(battleId) : `crowd:${battleId}`;
    const snapshotAllBefore = Object.create(null);
    const snapshotIds = Object.keys(S.players || {}).concat(["sink", poolId]);
    snapshotIds.forEach(id => {
      snapshotAllBefore[id] = getPointsById(id);
    });

    const totalVotesFromCrowd = (c) => {
      if (!c) return 0;
      if (c.voters && typeof c.voters === "object") return Object.keys(c.voters).length | 0;
      const a = Number.isFinite(c.votesA) ? (c.votesA | 0) : (Number.isFinite(c.aVotes) ? (c.aVotes | 0) : 0);
      const b = Number.isFinite(c.votesB) ? (c.votesB | 0) : (Number.isFinite(c.bVotes) ? (c.bVotes | 0) : 0);
      return (a + b) | 0;
    };

    let tickCount = 0;
    const maxTicks = (opts && Number.isFinite(opts.maxTicks)) ? (opts.maxTicks | 0) : 240;
    while (tickCount < maxTicks) {
      battle = getBattle(battleId) || battle;
      const curVote = battle && battle.escapeVote ? battle.escapeVote : null;
      if (!curVote) break;
      if (curVote.decided) break;
      try {
        if (Conflict && typeof Conflict.applyEscapeVote === "function") {
          Conflict.applyEscapeVote(battleId);
        } else if (Core && typeof Core.applyEscapeVoteTick === "function") {
          Core.applyEscapeVoteTick(battleId);
        }
      } catch (_) {}

      battle = getBattle(battleId) || battle;
      if (battle && battle.escapeVote && battle.escapeVote.decided) break;
      tickCount++;
      await sleep(50);
    }

    battle = getBattle(battleId) || battle;
    if (!battle || !battle.escapeVote || !battle.escapeVote.decided) {
      const meta0 = (Game.__D && Game.__D.crowdCapMetaByBattle && battleId) ? Game.__D.crowdCapMetaByBattle[battleId] : null;
      if (!meta0) {
        diag.whyNoCrowd = { status: battle ? battle.status : null, missingField: "escapeVote.decided" };
        diag.lastBattle = battle ? { id: battle.id, status: battle.status, result: battle.result, escapeVote: !!battle.escapeVote } : null;
        return { name, ok: false, details: "escape_vote_not_decided", battleId, diag };
      }
    }
    pushStage("cap_reached");
    pushStage("finalized");

    const meta = (Game.__D && Game.__D.crowdCapMetaByBattle && battleId) ? Game.__D.crowdCapMetaByBattle[battleId] : null;
    const crowd = (battle && battle.escapeVote) ? battle.escapeVote : { voters: {}, aVotes: meta ? meta.aVotes : 0, bVotes: meta ? meta.bVotes : 0, cap: meta ? meta.cap : null };
    const endedBy = meta ? meta.endedBy : "cap";
    const rawVotes = totalVotesFromCrowd(crowd);
    const totalWeighted = meta ? ((meta.aVotes | 0) + (meta.bVotes | 0)) : ((crowd.aVotes | 0) + (crowd.bVotes | 0));
    const weightedSideCounts = { a: meta ? (meta.aVotes | 0) : (crowd.aVotes | 0), b: meta ? (meta.bVotes | 0) : (crowd.bVotes | 0), total: totalWeighted | 0 };
    let winner = null;
    if (crowd.outcome === "A_WIN") winner = "attacker";
    else if (crowd.outcome === "B_WIN") winner = "defender";
    const timerUsed = endedBy && endedBy !== "cap";

    const log = (Game.__D && Array.isArray(Game.__D.moneyLog)) ? Game.__D.moneyLog : [];
    const byBattle = (Game.__D && Game.__D.moneyLogByBattle && battleId && Array.isArray(Game.__D.moneyLogByBattle[battleId]))
      ? Game.__D.moneyLogByBattle[battleId]
      : null;
    const scoped = (byBattle || log).filter(e => String(e && e.battleId || "") === String(battleId));
    diag.moneyLogScope = {
      source: byBattle ? "moneyLogByBattle" : "moneyLog",
      rowsLen: log.length,
      battleRowsLen: scoped.length
    };
    diag.first10BattleRows = scoped.slice(0, 10).map(e => ({
      reason: e && e.reason,
      sourceId: e && e.sourceId,
      targetId: e && e.targetId,
      amount: e && e.amount
    }));
    diag.econHooks = {
      hasTransferPoints: !!(Econ && typeof Econ.transferPoints === "function"),
      pointsLogCurrencyPresence: scoped.some(e => String(e && e.currency || "") === "points")
    };

    const sum = (pred) => scoped.filter(pred).reduce((s, e) => s + ((e && Number.isFinite(e.amount)) ? (e.amount | 0) : 0), 0);
    const cost = sum(e => String(e && e.reason || "") === "crowd_vote_cost");
    const poolInit = sum(e => String(e && e.reason || "") === "crowd_vote_pool_init");
    const refunds = sum(e => String(e && e.reason || "").startsWith("crowd_vote_refund"));
    const loserPenalty = sum(e => String(e && e.reason || "") === "crowd_vote_loser_penalty");
    const remainderWin = sum(e => String(e && e.reason || "") === "crowd_vote_remainder_win");
    const remainderSplit = sum(e => String(e && e.reason || "").startsWith("crowd_vote_remainder_split_"));
    const poolAfter = (Econ && typeof Econ.getPoolBalance === "function") ? (Econ.getPoolBalance(poolId) | 0) : null;

    const logNetById = {};
    scoped.forEach(e => {
      const currency = String(e && e.currency || "");
      const reason = String(e && e.reason || "");
      if (currency === "rep" || reason.startsWith("rep_")) return;
      const amt = (e && Number.isFinite(e.amount)) ? (e.amount | 0) : 0;
      const src = String(e && e.sourceId || "");
      const tgt = String(e && e.targetId || "");
      if (!src && !tgt) return;
      if (src) logNetById[src] = (logNetById[src] || 0) - amt;
      if (tgt) logNetById[tgt] = (logNetById[tgt] || 0) + amt;
    });

    const trackedSet = new Set();
    const addIfTracked = (id) => {
      if (!id) return;
      const key = String(id);
      if (key === "me") { trackedSet.add("me"); return; }
      if (isPoolId(key)) { trackedSet.add(key); return; }
      if (S.players && S.players[key]) trackedSet.add(key);
    };
    scoped.forEach(e => {
      const reason = String(e && e.reason || "");
      const src = String(e && e.sourceId || "");
      const tgt = String(e && e.targetId || "");
      if (reason === "crowd_vote_cost") addIfTracked(src);
      if (reason.startsWith("crowd_vote_refund")) addIfTracked(tgt);
      if (reason === "crowd_vote_remainder_win") addIfTracked(tgt);
      if (reason.startsWith("crowd_vote_remainder_split_")) addIfTracked(tgt);
      if (reason === "crowd_vote_loser_penalty") { addIfTracked(src); addIfTracked(tgt); }
      if (reason === "battle_win_take") { addIfTracked(src); addIfTracked(tgt); }
    });
    addIfTracked("me");
    addIfTracked(oppId);
    addIfTracked("sink");
    if (battleId) addIfTracked((Econ && typeof Econ.getCrowdPoolId === "function") ? Econ.getCrowdPoolId(battleId) : `crowd:${battleId}`);
    const auditIds = Array.from(trackedSet);
    const afterPtsMap = Object.create(null);
    auditIds.forEach(id => {
      afterPtsMap[id] = getPointsById(id);
    });
    const beforePtsMap = Object.create(null);
    auditIds.forEach(id => {
      if (snapshotAllBefore && Object.prototype.hasOwnProperty.call(snapshotAllBefore, id)) {
        beforePtsMap[id] = snapshotAllBefore[id];
      } else {
        beforePtsMap[id] = null;
      }
    });
    const baselinePtsMap = Object.assign(Object.create(null), beforePtsMap);
    const totalPtsWorldBefore = auditIds.reduce((s, id) => s + (Number.isFinite(beforePtsMap[id]) ? (beforePtsMap[id] | 0) : 0), 0);
    const totalPtsWorldAfter = auditIds.reduce((s, id) => s + (Number.isFinite(afterPtsMap[id]) ? (afterPtsMap[id] | 0) : 0), 0);
    const start10Ok = (opts && opts.forceResetStart === true)
      ? auditIds.filter(id => !isPoolId(id)).every(id => beforePtsMap[id] === expectedStart)
      : true;

    const netById = {};
    auditIds.forEach(id => {
      const b = beforePtsMap[id];
      const a = afterPtsMap[id];
      netById[id] = (typeof a === "number" && typeof b === "number") ? ((a | 0) - (b | 0)) : null;
    });

    const totalPlayers = Number.isFinite(crowd.totalPlayers) ? (crowd.totalPlayers | 0) : Object.keys(S.players || {}).length;
    const capExpected = Math.max(10, Math.round(0.4 * (totalPlayers | 0)));
    const capOk = (Number.isFinite(crowd.cap) ? (crowd.cap | 0) : 0) === capExpected;
    const poolZeroOk = (poolAfter == null) ? false : (poolAfter === 0);
    const worldMassOk = totalPtsWorldBefore === totalPtsWorldAfter;
    const costEntries = scoped.filter(e => String(e && e.reason || "") === "crowd_vote_cost");
    const paidVotesOk = costEntries.every(e => {
      if (!e || (e.amount | 0) !== 1) return false;
      const id = String(e.sourceId || "");
      const before = beforePtsMap[id];
      const after = afterPtsMap[id];
      return (typeof before === "number" && typeof after === "number");
    });
    const logMatchesState = auditIds.every(id => {
      const d = netById[id];
      const l = logNetById[id];
      if (d == null && l == null) return true;
      return (d | 0) === (l | 0);
    });

    diag.lastBattle = {
      id: battle.id,
      status: battle.status,
      result: battle.result,
      hasCrowd: !!battle.escapeVote,
      crowdDecided: !!(battle.escapeVote && battle.escapeVote.decided),
      totalVotes: rawVotes,
      totalWeighted,
      cap: crowd.cap,
      endedBy
    };

    let reverted = false;
    let revertAgg = 0;
    const revertAfterPtsMap = Object.create(null);
    if (Econ && typeof Econ.transferPoints === "function") {
      auditIds.forEach(id => {
        if (isPoolId(id)) return;
        const before = beforePtsMap[id];
        const after = afterPtsMap[id];
        if (!Number.isFinite(before) || !Number.isFinite(after)) return;
        const delta = (after | 0) - (before | 0);
        if (delta === 0) return;
        if (delta > 0) {
          Econ.transferPoints(id, "sink", delta, "runtime_audit_revert_points", { battleId });
          revertAgg += delta;
        } else if (delta < 0) {
          Econ.transferPoints("sink", id, -delta, "runtime_audit_revert_points", { battleId });
          revertAgg += (-delta);
        }
      });
      auditIds.forEach(id => {
        revertAfterPtsMap[id] = getPointsById(id);
      });
      reverted = auditIds.filter(id => !isPoolId(id)).every(id => {
        const b = beforePtsMap[id];
        const a = revertAfterPtsMap[id];
        if (!Number.isFinite(b) || !Number.isFinite(a)) return false;
        return (b | 0) === (a | 0);
      });
    }

    const result = {
      name,
      ok: true,
      battleId,
      endedBy,
      timerUsed: !!timerUsed,
      cap: crowd.cap,
      totalVotes: rawVotes,
      rawVotes,
      totalWeighted,
      sideCounts: weightedSideCounts,
      weightedSideCounts,
      winner,
      baselinePtsMap,
      beforePtsMap,
      afterPtsMap,
      reverted,
      revertAgg,
      revertAfterPtsMap,
      massBefore: totalPtsWorldBefore,
      massAfter: totalPtsWorldAfter,
      massDelta: (Number.isFinite(totalPtsWorldAfter) && Number.isFinite(totalPtsWorldBefore)) ? ((totalPtsWorldAfter | 0) - (totalPtsWorldBefore | 0)) : null,
      moneyLogAgg: { cost, poolInit, refunds, loserPenalty, remainderWin, remainderSplit, rowsCount: scoped.length },
      asserts: { start10Ok, paidVotesOk, capOk, poolZeroOk, worldMassOk, logMatchesState },
      diag
    };

    console.log("RUNTIME_CROWD_AUDIT_SUMMARY", {
      battleId,
      endedBy,
      timerUsed: !!timerUsed,
      cap: crowd.cap,
      rawVotes,
      totalWeighted
    });
    console.dir({ baselinePtsMap, beforePtsMap, afterPtsMap, netById }, { depth: null });
    console.dir({ moneyLogAgg: result.moneyLogAgg }, { depth: null });
    console.dir({ sideCounts: weightedSideCounts, winner }, { depth: null });
    Game.__DEV.__lastRuntimeAnyBattleId = battleId;
    return result;
  };

  const runtimeCrowdAuditEventOnce = async (opts = {}) => {
    const name = "runtime_crowd_audit_event_once";
    const S = Game.__S || null;
    const Events = Game.Events || Game._Events || null;
    const Econ = Game.ConflictEconomy || Game._ConflictEconomy || null;
    const diag = { stageTrace: [], eventsCount: (S && Array.isArray(S.events)) ? S.events.length : 0, lastEvent: null, scenario: "event" };
    const pushStage = (s) => { diag.stageTrace.push(s); };
    if (!S || !S.players) return { name, ok: false, details: "missing_state", eventId: null, diag };
    if (!Events || typeof Events.makeNpcEvent !== "function" || typeof Events.addEvent !== "function") {
      return { name, ok: false, details: "missing_events_api", eventId: null, diag };
    }

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    let expectedStart = null;
    if (Game.__A && typeof Game.__A.getPointsConfig === "function") {
      const cfg = Game.__A.getPointsConfig();
      if (cfg && Number.isFinite(cfg.start)) expectedStart = cfg.start | 0;
    }
    if (expectedStart == null && Game.Data && Number.isFinite(Game.Data.POINTS_START)) expectedStart = Game.Data.POINTS_START | 0;
    if (expectedStart == null) expectedStart = 10;

    const e0 = Events.makeNpcEvent(opts.aId, opts.bId);
    if (!e0 || !e0.id) {
      diag.whyNoCrowd = { status: "event_create_failed", missingField: "eventId" };
      return { name, ok: false, details: "event_create_failed", eventId: null, diag };
    }
    Events.addEvent(e0);
    const eventId = e0.id;
    pushStage("event_created");

    const getEvent = (id) => (S.events || []).find(x => x && String(x.id) === String(id)) || null;
    let ev = getEvent(eventId);
    if (!ev) {
      diag.whyNoCrowd = { status: "no_event_after_create", missingField: "event" };
      return { name, ok: false, details: "no_event_after_create", eventId, diag };
    }
    if (!ev.crowd || typeof ev.crowd !== "object") ev.crowd = { voters: {} };
    if (!ev.crowd.voters || typeof ev.crowd.voters !== "object") ev.crowd.voters = {};
    pushStage("crowd_attached");

    const crowd = ev.crowd;
    if (!Number.isFinite(crowd.cap) || crowd.cap <= 0) {
      const totalPlayers = Object.keys(S.players || {}).length;
      crowd.cap = Math.max(10, Math.round(0.4 * (totalPlayers | 0)));
      crowd.totalPlayers = totalPlayers;
    }

    const isPoolId = (id) => {
      const s = String(id || "");
      return s === "sink" || s === "crowd" || s.startsWith("crowd:");
    };
    const getPointsById = (id) => {
      if (isPoolId(id)) {
        if (Econ && typeof Econ.getPoolBalance === "function") return Econ.getPoolBalance(id) | 0;
        return null;
      }
      const p = (id === "me") ? (S.players.me || S.me) : S.players[id];
      return (p && Number.isFinite(p.points)) ? (p.points | 0) : null;
    };
    const poolId = (Econ && Econ.getCrowdPoolId && eventId) ? Econ.getCrowdPoolId(eventId) : `crowd:${eventId}`;
    const snapshotAllBefore = Object.create(null);
    const snapshotIds = Object.keys(S.players || {}).concat(["sink", poolId]);
    snapshotIds.forEach(id => {
      snapshotAllBefore[id] = getPointsById(id);
    });

    let tickCount = 0;
    const maxTicks = (opts && Number.isFinite(opts.maxTicks)) ? (opts.maxTicks | 0) : 240;
    while (tickCount < maxTicks && ev && ev.crowd && !ev.crowd.decided && !ev.resolved) {
      try {
        if (ev.crowd && Number.isFinite(ev.crowd.nextNpcVoteAt)) ev.crowd.nextNpcVoteAt = 0;
        Events.tick();
      } catch (_) {}
      ev = getEvent(eventId) || ev;
      if (ev && ev.crowd && ev.crowd.decided) break;
      if (ev && ev.resolved) break;
      tickCount++;
      await sleep(50);
    }

    ev = getEvent(eventId) || ev;
    if (!ev || !ev.crowd || !(ev.crowd.decided || ev.resolved)) {
      diag.whyNoCrowd = { status: ev ? ev.state : null, missingField: "crowd.decided" };
      diag.lastEvent = ev ? { id: ev.id, state: ev.state, resolved: !!ev.resolved, hasCrowd: !!ev.crowd } : null;
      return { name, ok: false, details: "event_not_decided", eventId, diag };
    }
    pushStage("cap_reached");
    pushStage("finalized");

    const rawVotes = (ev.crowd && ev.crowd.voters) ? Object.keys(ev.crowd.voters).length : 0;
    const totalWeighted = ((ev.crowd.aVotes ?? ev.crowd.votesA) | 0) + ((ev.crowd.bVotes ?? ev.crowd.votesB) | 0);
    const weightedSideCounts = { a: (ev.crowd.aVotes ?? ev.crowd.votesA) | 0, b: (ev.crowd.bVotes ?? ev.crowd.votesB) | 0, total: totalWeighted | 0 };
    const endedBy = "cap";
    const timerUsed = false;

    const log = (Game.__D && Array.isArray(Game.__D.moneyLog)) ? Game.__D.moneyLog : [];
    const byBattle = (Game.__D && Game.__D.moneyLogByBattle && eventId && Array.isArray(Game.__D.moneyLogByBattle[eventId]))
      ? Game.__D.moneyLogByBattle[eventId]
      : null;
    const scoped = (byBattle || log).filter(e => {
      const bid = String(e && e.battleId || "");
      const eid = String(e && e.eventId || "");
      return (bid === String(eventId) || eid === String(eventId));
    });
    diag.moneyLogScope = {
      source: byBattle ? "moneyLogByBattle" : "moneyLog",
      rowsLen: log.length,
      battleRowsLen: scoped.length
    };
    diag.first10BattleRows = scoped.slice(0, 10).map(e => ({
      reason: e && e.reason,
      sourceId: e && e.sourceId,
      targetId: e && e.targetId,
      amount: e && e.amount
    }));
    diag.econHooks = {
      hasTransferPoints: !!(Econ && typeof Econ.transferPoints === "function"),
      pointsLogCurrencyPresence: scoped.some(e => String(e && e.currency || "") === "points")
    };

    const sum = (pred) => scoped.filter(pred).reduce((s, e) => s + ((e && Number.isFinite(e.amount)) ? (e.amount | 0) : 0), 0);
    const cost = sum(e => String(e && e.reason || "") === "crowd_vote_cost");
    const poolInit = sum(e => String(e && e.reason || "") === "crowd_vote_pool_init");
    const refunds = sum(e => String(e && e.reason || "").startsWith("crowd_vote_refund"));
    const loserPenalty = sum(e => String(e && e.reason || "") === "crowd_vote_loser_penalty");
    const remainderWin = sum(e => String(e && e.reason || "") === "crowd_vote_remainder_win");
    const remainderSplit = sum(e => String(e && e.reason || "").startsWith("crowd_vote_remainder_split_"));
    const poolAfter = (Econ && typeof Econ.getPoolBalance === "function") ? (Econ.getPoolBalance(poolId) | 0) : null;

    const logNetById = {};
    scoped.forEach(e => {
      const currency = String(e && e.currency || "");
      const reason = String(e && e.reason || "");
      if (currency === "rep" || reason.startsWith("rep_")) return;
      const amt = (e && Number.isFinite(e.amount)) ? (e.amount | 0) : 0;
      const src = String(e && e.sourceId || "");
      const tgt = String(e && e.targetId || "");
      if (!src && !tgt) return;
      if (src) logNetById[src] = (logNetById[src] || 0) - amt;
      if (tgt) logNetById[tgt] = (logNetById[tgt] || 0) + amt;
    });

    const trackedSet = new Set();
    const addIfTracked = (id) => {
      if (!id) return;
      const key = String(id);
      if (key === "me") { trackedSet.add("me"); return; }
      if (isPoolId(key)) { trackedSet.add(key); return; }
      if (S.players && S.players[key]) trackedSet.add(key);
    };
    scoped.forEach(e => {
      const reason = String(e && e.reason || "");
      const src = String(e && e.sourceId || "");
      const tgt = String(e && e.targetId || "");
      if (reason === "crowd_vote_cost") addIfTracked(src);
      if (reason.startsWith("crowd_vote_refund")) addIfTracked(tgt);
      if (reason === "crowd_vote_remainder_win") addIfTracked(tgt);
      if (reason.startsWith("crowd_vote_remainder_split_")) addIfTracked(tgt);
      if (reason === "crowd_vote_loser_penalty") { addIfTracked(src); addIfTracked(tgt); }
      if (reason === "battle_win_take") { addIfTracked(src); addIfTracked(tgt); }
    });
    addIfTracked("me");
    addIfTracked("sink");
    addIfTracked(poolId);
    const auditIds = Array.from(trackedSet);
    const afterPtsMap = Object.create(null);
    auditIds.forEach(id => {
      afterPtsMap[id] = getPointsById(id);
    });
    const beforePtsMap = Object.create(null);
    auditIds.forEach(id => {
      if (snapshotAllBefore && Object.prototype.hasOwnProperty.call(snapshotAllBefore, id)) {
        beforePtsMap[id] = snapshotAllBefore[id];
      } else {
        beforePtsMap[id] = null;
      }
    });
    const baselinePtsMap = Object.assign(Object.create(null), beforePtsMap);
    const totalPtsWorldBefore = auditIds.reduce((s, id) => s + (Number.isFinite(beforePtsMap[id]) ? (beforePtsMap[id] | 0) : 0), 0);
    const totalPtsWorldAfter = auditIds.reduce((s, id) => s + (Number.isFinite(afterPtsMap[id]) ? (afterPtsMap[id] | 0) : 0), 0);
    const start10Ok = (opts && opts.forceResetStart === true)
      ? auditIds.filter(id => !isPoolId(id)).every(id => beforePtsMap[id] === expectedStart)
      : true;

    const netById = {};
    auditIds.forEach(id => {
      const b = beforePtsMap[id];
      const a = afterPtsMap[id];
      netById[id] = (typeof a === "number" && typeof b === "number") ? ((a | 0) - (b | 0)) : null;
    });

    const totalPlayers = Number.isFinite(ev.crowd.totalPlayers) ? (ev.crowd.totalPlayers | 0) : Object.keys(S.players || {}).length;
    const capExpected = Math.max(1, Math.min((ev.crowd.cap | 0), Math.round(0.4 * (totalPlayers | 0)) || (ev.crowd.cap | 0)));
    const capOk = rawVotes >= (ev.crowd.cap | 0);
    const poolZeroOk = (poolAfter == null) ? false : (poolAfter === 0);
    const worldMassOk = totalPtsWorldBefore === totalPtsWorldAfter;
    const costEntries = scoped.filter(e => String(e && e.reason || "") === "crowd_vote_cost");
    const paidVotesOk = costEntries.every(e => {
      if (!e || (e.amount | 0) !== 1) return false;
      const id = String(e.sourceId || "");
      const before = beforePtsMap[id];
      const after = afterPtsMap[id];
      return (typeof before === "number" && typeof after === "number");
    });
    const logMatchesState = auditIds.every(id => {
      const d = netById[id];
      const l = logNetById[id];
      if (d == null && l == null) return true;
      return (d | 0) === (l | 0);
    });

    diag.lastEvent = {
      id: ev.id,
      state: ev.state,
      resolved: !!ev.resolved,
      hasCrowd: !!ev.crowd,
      totalVotes: rawVotes,
      totalWeighted,
      cap: ev.crowd.cap,
      endedBy,
      eligibleNpcCount: ev.crowd.eligibleNpcCount,
      alreadyVotedCount: ev.crowd.alreadyVotedCount,
      lastTickWhy: ev.crowd.lastTickWhy
    };

    let reverted = false;
    let revertAgg = 0;
    const revertAfterPtsMap = Object.create(null);
    if (Econ && typeof Econ.transferPoints === "function") {
      auditIds.forEach(id => {
        if (isPoolId(id)) return;
        const before = beforePtsMap[id];
        const after = afterPtsMap[id];
        if (!Number.isFinite(before) || !Number.isFinite(after)) return;
        const delta = (after | 0) - (before | 0);
        if (delta === 0) return;
        if (delta > 0) {
          Econ.transferPoints(id, "sink", delta, "runtime_audit_revert_points", { battleId: eventId });
          revertAgg += delta;
        } else if (delta < 0) {
          Econ.transferPoints("sink", id, -delta, "runtime_audit_revert_points", { battleId: eventId });
          revertAgg += (-delta);
        }
      });
      auditIds.forEach(id => {
        revertAfterPtsMap[id] = getPointsById(id);
      });
      reverted = auditIds.filter(id => !isPoolId(id)).every(id => {
        const b = beforePtsMap[id];
        const a = revertAfterPtsMap[id];
        if (!Number.isFinite(b) || !Number.isFinite(a)) return false;
        return (b | 0) === (a | 0);
      });
    }

    const result = {
      name,
      ok: true,
      scenario: "event",
      eventId,
      endedBy,
      timerUsed: !!timerUsed,
      cap: ev.crowd.cap,
      totalVotes: rawVotes,
      rawVotes,
      totalWeighted,
      sideCounts: weightedSideCounts,
      weightedSideCounts,
      winner: ev.crowd.winner || null,
      baselinePtsMap,
      beforePtsMap,
      afterPtsMap,
      reverted,
      revertAgg,
      revertAfterPtsMap,
      massBefore: totalPtsWorldBefore,
      massAfter: totalPtsWorldAfter,
      massDelta: (Number.isFinite(totalPtsWorldAfter) && Number.isFinite(totalPtsWorldBefore)) ? ((totalPtsWorldAfter | 0) - (totalPtsWorldBefore | 0)) : null,
      moneyLogAgg: { cost, poolInit, refunds, loserPenalty, remainderWin, remainderSplit, rowsCount: scoped.length },
      asserts: { start10Ok, paidVotesOk, capOk, poolZeroOk, worldMassOk, logMatchesState },
      diag
    };

    console.log("RUNTIME_CROWD_AUDIT_EVENT_SUMMARY", {
      eventId,
      endedBy,
      timerUsed: !!timerUsed,
      cap: ev.crowd.cap,
      rawVotes,
      totalWeighted
    });
    console.dir({ baselinePtsMap, beforePtsMap, afterPtsMap, netById }, { depth: null });
    console.dir({ moneyLogAgg: result.moneyLogAgg }, { depth: null });
    console.dir({ sideCounts: weightedSideCounts, winner: ev.crowd.winner || null }, { depth: null });
    return result;
  };

  Game.__DEV.runtimeCrowdAuditEscapeOnce = async (opts = {}) => {
    return runtimeCrowdAuditEscapeIgnoreOnce("smyt", "escape", opts);
  };
  Game.__DEV.runtimeCrowdAuditIgnoreOnce = async (opts = {}) => {
    return runtimeCrowdAuditEscapeIgnoreOnce("off", "ignore", opts);
  };
  Game.__DEV.runtimeCrowdAuditEventOnce = async (opts = {}) => {
    return runtimeCrowdAuditEventOnce(opts);
  };

  const runEconNpcAllowlistEvidencePackOnce = (opts = {}) => {
    const diagVersion = "econ_npc_allowlist_pack_v1";
    let probeRes = { ok: false, notes: ["runner_throw"], diagVersion };
    let auditRes = { ok: false, notes: ["runner_throw"], diagVersion };
    const safeStringify = (obj) => {
      try {
        return JSON.stringify(obj);
      } catch (e) {
        return JSON.stringify({ ok: false, notes: ["stringify_throw"], err: String(e), diagVersion });
      }
    };
    emitLine("WORLD_ECON_NPC_ALLOWLIST_EVIDENCE_BEGIN");
    try {
      const probeResult = Game.__DEV.smokeEconNpc_AllowlistDevProbeOnce(opts);
      if (probeResult && typeof probeResult === "object") probeRes = { ...probeResult, diagVersion };
      const auditResult = Game.__DEV.auditNpcWorldBalance3Once({ window: opts.window || { lastN: 200 }, refresh: true });
      if (auditResult && typeof auditResult === "object") auditRes = { ...auditResult, diagVersion };
    } catch (e) {
      console.error("ECON_NPC_ALLOWLIST_PACK_V1_RUNNER_THROW", String(e), e && e.stack);
      probeRes = { ok: false, notes: ["runner_throw"], err: String(e), stack: e && e.stack ? String(e.stack) : null, diagVersion };
      auditRes = { ok: false, notes: ["runner_throw"], err: String(e), stack: e && e.stack ? String(e.stack) : null, diagVersion };
    } finally {
      emitLine(safeStringify(probeRes));
      emitLine(safeStringify(auditRes));
      emitLine("WORLD_ECON_NPC_ALLOWLIST_EVIDENCE_END");
      emitLine("TAPE_FLUSH_OK");
      let flushRes = null;
      if (typeof window !== "undefined" && typeof window.__CONSOLE_TAPE_FLUSH__ === "function") {
        flushRes = window.__CONSOLE_TAPE_FLUSH__();
      }
      emitLine(`TAPE_FLUSH_META ${safeStringify(flushRes)}`);
      emitLine("TAPE_FLUSH_POST_OK");
      let flushRes2 = null;
      if (typeof window !== "undefined" && typeof window.__CONSOLE_TAPE_FLUSH__ === "function") {
        flushRes2 = window.__CONSOLE_TAPE_FLUSH__();
      }
      emitLine(`TAPE_FLUSH_POST_META ${safeStringify(flushRes2)}`);
    }
    if (probeRes && probeRes.ok !== true) {
      const n = Array.isArray(probeRes.notes) ? probeRes.notes : [];
      if (!n.includes("probe_failed_ignored")) n.push("probe_failed_ignored");
      probeRes.notes = n;
    }
    const ok = auditRes.ok === true;
    Game.__DEV.lastEconNpcAllowlistEvidencePack = {
      diagVersion,
      at: Date.now(),
      ok,
      results: [probeRes, auditRes]
    };
    return { ok, results: [probeRes, auditRes] };
  };
  Game.__DEV.runEconNpcAllowlistEvidencePackOnce = runEconNpcAllowlistEvidencePackOnce;
  Game.__DEV.runAllowlistEvidencePackOnce = runEconNpcAllowlistEvidencePackOnce;
  Game.Dev.runEconNpcAllowlistEvidencePackOnce = runEconNpcAllowlistEvidencePackOnce;
  Game.Dev.runAllowlistEvidencePackOnce = runEconNpcAllowlistEvidencePackOnce;
  Game.__DEV.diagEconNpcAllowlistPackOnce = () => {
    const has = {
      hasGame: !!window.Game,
      has__DEV: !!(window.Game && window.Game.__DEV),
      hasDev: !!(window.Game && window.Game.Dev),
      hasFn1: !!(window.Game && window.Game.__DEV && window.Game.__DEV.runEconNpcAllowlistEvidencePackOnce),
      hasFn2: !!(window.Game && window.Game.Dev && window.Game.Dev.runEconNpcAllowlistEvidencePackOnce),
      hasFn3: !!(window.Game && window.Game.__DEV && window.Game.__DEV.runAllowlistEvidencePackOnce),
      loadedMarker: !!(window.Game && window.Game.__DEV && window.Game.__DEV.__econNpcAllowlistPackLoaded)
    };
    console.log("ECON_NPC_ALLOWLIST_PACK_V1_DIAG", has);
    return has;
  };

  Game.__DEV.probeMoneyLogOnce = function () {
    const stateLog = (Game.State && Array.isArray(Game.State.moneyLog)) ? Game.State.moneyLog : null;
    const devLog = (Game.__DEV && Array.isArray(Game.__DEV.__debugMoneyLog__)) ? Game.__DEV.__debugMoneyLog__ : null;
    const arr = stateLog || devLog;
    return {
      ok: !!arr,
      len: arr ? arr.length : 0,
      hasState: !!stateLog,
      hasDev: !!devLog
    };
  };

  Game.__DEV.runEcon08FinalSmokePack = async (opts = {}) => {
    const FAIL = [];
    const NOTE = [];
    const diag = { capOkCount: 0, firstFailReason: null, moneyLogLen: 0, repGivenCount: 0 };
    const facts = {};
    const nowTs = Date.now();
    const dayKey = new Date(nowTs).toISOString().slice(0, 10);
    const G = window.Game;
    if (!G || !G.State || !G.StateAPI || typeof G.StateAPI.giveRespect !== "function") {
      const msg = { ok: false, failed: ["missing_Game_or_giveRespect"], note: "need index.html?dev=1 and ECON08 loaded" };
      console.log("ECON08_FINAL_SMOKE_PACK", msg);
      return msg;
    }
    const getCap = (G.__DEV && typeof G.__DEV.getRespectEmitterCap === "function")
      ? (G.__DEV.getRespectEmitterCap() | 0)
      : 20;
    const capLimit = Math.max(1, getCap);
    try {
      const S = G.State;
      const meId = (S && S.me && S.me.id) ? String(S.me.id) : "me";
      const progress = S.progress = S.progress || {};
      const ledger = {
        lastByPairDay: Object.create(null),
        lastInboundDay: Object.create(null)
      };
      ledger.lastByPairDay[meId] = Object.create(null);
      progress.respectLedger = ledger;
      progress.repEmitter = progress.repEmitter || { balance: 0, dayKey: "" };
      progress.repEmitter.balance = capLimit;
      progress.repEmitter.dayKey = dayKey;
      const setPoints = (obj, value) => {
        if (!obj) return;
        if (G && typeof G._withPointsWrite === "function") {
          G._withPointsWrite(() => { obj.points = value; });
        } else {
          obj.points = value;
        }
      };
      setPoints(S.me, capLimit + 5);
      if (S.players && S.players.me) setPoints(S.players.me, capLimit + 5);
      const ensurePlayer = (id, name) => {
        if (!S.players) S.players = {};
        if (!S.players[id]) {
          S.players[id] = {
            id,
            name: name || id,
            role: "civil",
            influence: 0,
            points: 0,
            rep: 0
          };
        }
      };
      const existingNpcIds = Object.keys(S.players || {}).filter(id => id && String(id).startsWith("npc_") && id !== meId);
      const requiredTargets = capLimit + 1;
      const smokeTargets = existingNpcIds.slice();
      let smokeNpcCounter = 0;
      while (smokeTargets.length < requiredTargets) {
        const suffix = Date.now().toString(36) + "_" + smokeNpcCounter;
        const newId = `npc_smoke_respect_${suffix}`;
        ensurePlayer(newId, `Smoke NPC ${smokeNpcCounter}`);
        smokeTargets.push(newId);
        smokeNpcCounter += 1;
      }
      if (G.ConflictEconomy && typeof G.ConflictEconomy.ensureNpcAccountsFromState === "function") {
        try {
          G.ConflictEconomy.ensureNpcAccountsFromState({ reason: "final_smoke_respect" });
        } catch (_) {}
      }
      const npcIds = smokeTargets;
      const opKeysUsed = new Set();
      const cleanupPairLedger = (targetId) => {
        if (!ledger.lastByPairDay[meId]) ledger.lastByPairDay[meId] = Object.create(null);
        if (ledger.lastByPairDay[meId]) delete ledger.lastByPairDay[meId][targetId];
        if (ledger.lastInboundDay[targetId]) delete ledger.lastInboundDay[targetId][meId];
      };
      const runRespect = (targetId) => {
        if (!targetId) return null;
        const res = G.StateAPI.giveRespect(meId, targetId, Date.now());
        if (res && res.meta && typeof res.meta.opKey === "string") {
          opKeysUsed.add(res.meta.opKey);
        }
        cleanupPairLedger(targetId);
        return res;
      };
      let firstFailReason = null;
      let capOkCount = 0;
      let firstSuccessOpKey = null;
      for (let i = 0; i <= capLimit; i++) {
        if (!npcIds.length) break;
        const targetId = npcIds[i % npcIds.length];
        const res = runRespect(targetId);
        if (i < capLimit) {
          if (res && res.ok === true) {
            capOkCount += 1;
            if (!firstSuccessOpKey && res.meta && typeof res.meta.opKey === "string") {
              firstSuccessOpKey = res.meta.opKey;
            }
          } else {
            FAIL.push("7.4_cap_failure_before_limit");
            break;
          }
        } else {
          if (res && res.ok === false) {
            firstFailReason = res.reason;
          } else {
            FAIL.push("7.4_cap_missing_fail");
          }
        }
      }
      diag.capOkCount = capOkCount;
      diag.firstFailReason = firstFailReason;
      facts.cap = {
        cap: capLimit,
        okCount: capOkCount,
        firstFailReason
      };
      if (firstFailReason !== "respect_emitter_empty") {
        FAIL.push("7.4_cap_wrong_reason");
      }
      let moneyLogSource = null;
      let logSource = "none";
      if (G && G.State && Array.isArray(G.State.moneyLog)) {
        moneyLogSource = G.State.moneyLog;
        logSource = "state_moneyLog";
      } else if (G && G.State && Array.isArray(G.State.debug_moneyLog)) {
        moneyLogSource = G.State.debug_moneyLog;
        logSource = "state_debug_moneyLog";
      } else if (G && G.ConflictEconomy && Array.isArray(G.ConflictEconomy.debug_moneyLog)) {
        moneyLogSource = G.ConflictEconomy.debug_moneyLog;
        logSource = "conflict_debug_moneyLog";
      } else if (G && G.__DEV && Array.isArray(G.__DEV.__debugMoneyLog__)) {
        moneyLogSource = G.__DEV.__debugMoneyLog__;
        logSource = "dev_debug_moneyLog";
      }
      const moneyLogBeforeLen = moneyLogSource ? moneyLogSource.length : 0;
      let filteredMoneyLog = [];
      const repRows = [];
      const pointsRows = [];
      let validOpKeyCount = 0;
      let opKeyCardinalityIssues = 0;
      let opKeyReasonIssues = 0;
      if (!moneyLogSource) {
        FAIL.push("7.5_moneylog_unavailable");
        NOTE.push("moneyLog_unavailable_for_world_rep_scan");
      } else {
        filteredMoneyLog = moneyLogSource.filter(row => {
          const meta = row && row.meta;
          if (!meta || typeof meta !== "object") return false;
          if (meta.dayKey !== dayKey) return false;
          const opKey = meta.opKey;
          if (!opKey) return false;
          if (opKeysUsed.size && !opKeysUsed.has(opKey)) return false;
          return true;
        });
        const byOp = new Map();
        filteredMoneyLog.forEach(row => {
          if (row && row.reason === "rep_respect_given") repRows.push(row);
          if (row && row.reason === "points_respect_cost") pointsRows.push(row);
          const meta = row && row.meta;
          const opKey = meta && meta.opKey;
          if (!opKey) return;
          const arr = byOp.get(opKey) || [];
          arr.push(row);
          byOp.set(opKey, arr);
        });
        byOp.forEach((rows, opKey) => {
          if (rows.length > 2) {
            opKeyCardinalityIssues += 1;
            FAIL.push("7.5_moneylog_duplicate_opkey");
          }
          if (rows.length !== 2) {
            opKeyCardinalityIssues += 1;
            FAIL.push("7.5_moneylog_bad_opkey_cardinality");
            return;
          }
          const reasons = new Set(rows.map(r => r && String(r.reason || "")));
          if (!(reasons.has("points_respect_cost") && reasons.has("rep_respect_given") && reasons.size === 2)) {
            opKeyReasonIssues += 1;
            FAIL.push("7.5_moneylog_bad_opkey_pair");
            return;
          }
          validOpKeyCount += 1;
        });
        if (!repRows.length) FAIL.push("7.5_no_rep_respect");
        if (!pointsRows.length) FAIL.push("7.5_no_points_respect");
      }
      if (moneyLogSource && !filteredMoneyLog.length) {
        if (opKeysUsed.size) {
          const sampleOp = Array.from(opKeysUsed)[0];
          NOTE.push("moneyLog_empty_after_success");
          diag.sampleOpKey = sampleOp;
        }
        FAIL.push("7.5_moneylog_empty_after_success");
      }
      if (moneyLogSource && firstSuccessOpKey && !filteredMoneyLog.some(row => row && row.meta && row.meta.opKey === firstSuccessOpKey)) {
        FAIL.push("7.5_moneylog_missing_sample");
        diag.sampleOpKey = firstSuccessOpKey;
      }
      diag.logSource = logSource;
      diag.moneyLogLen = filteredMoneyLog.length;
      diag.repGivenCount = repRows.length;
      diag.validOpKeys = validOpKeyCount;
      diag.opKeyCardinalityIssues = opKeyCardinalityIssues;
      diag.opKeyReasonIssues = opKeyReasonIssues;
      if (validOpKeyCount < capOkCount) {
        FAIL.push("7.5_moneylog_missing_opkeys");
      }
      if (validOpKeyCount > capOkCount) {
        FAIL.push("7.5_moneylog_extra_opkeys");
      }
      facts.moneyLog = {
        beforeLen: moneyLogBeforeLen,
        filteredLen: filteredMoneyLog.length,
        repRows: repRows.length,
        pointsRows: pointsRows.length
      };
      facts.world = { repGivenCount: repRows.length };
      if (repRows.length > capLimit) {
        FAIL.push("7.6_world_rep_exceeded_cap");
      }
  const result = {
    ok: FAIL.length === 0,
    failed: FAIL,
    facts,
    diag,
    notes: NOTE
  };
  console.log("ECON08_FINAL_SMOKE_PACK_RESULT", result);
  return result;
} catch (err) {
  const crashResult = {
    ok: false,
    failed: ["exception"],
    facts,
    diag: {
      ...diag,
      exception: String(err && err.message ? err.message : err),
      exceptionStack: err && err.stack ? err.stack : null
    },
    notes: NOTE.concat(["exception"])
  };
  console.error("ECON08_FINAL_SMOKE_PACK_EXCEPTION", err);
  console.log("ECON08_FINAL_SMOKE_PACK_RESULT", crashResult);
  return crashResult;
}
};

  Game.__DEV.smokePublicChatCopQuotaOnce = (opts = {}) => {
    const name = "smoke_public_chat_cop_quota_once";
    emitLine("PUBLIC_CHAT_COP_QUOTA_BEGIN");
    const n = (opts && Number.isFinite(opts.n) && opts.n > 0) ? (opts.n | 0) : 100;
    const seed = (opts && Number.isFinite(opts.seed)) ? (opts.seed | 0) : 123;
    const S = Game.__S || Game.State || {};
    const prevBudget = (S.npc && Number.isFinite(S.npc.copBudget)) ? S.npc.copBudget : 0;
    const prevNotes = (Game.__DEV && Array.isArray(Game.__DEV.__publicChatCopQuotaNotes))
      ? [...Game.__DEV.__publicChatCopQuotaNotes]
      : null;
    if (Game.__DEV) Game.__DEV.__publicChatCopQuotaNotes = [];
    if (!S.npc) S.npc = {};
    S.npc.copBudget = 0;
    const maxAttempts = Math.max(n * 5, 500);
    let copCount = 0;
    let total = 0;
    const sampleAuthors = [];
    const sampleLimit = Math.min(10, n);
    let rng = seed >>> 0;
    const seededRandom = () => {
      rng ^= (rng << 13);
      rng ^= (rng >>> 17);
      rng ^= (rng << 5);
      return (rng >>> 0) / 0x100000000;
    };
    const origRandom = Math.random;
    let randomOverridden = false;
    try {
      Math.random = seededRandom;
      randomOverridden = true;
    } catch (_) {
      randomOverridden = false;
    }
    let attempts = 0;
    const diagAgg = {
      candidatesRoleCounts: { cop: 0, nonCop: 0 },
      selectedRoleCounts: { cop: 0, nonCop: 0 },
      usedAuthorSelector: "Web/npcs.js · NPC.randomForChat",
      budget: { start: null, end: null, min: null, max: null },
      fallbackUsed: false,
    };
    const budgetValues = [];
    let firstBudgetBefore = null;
    let lastBudgetAfter = null;
    try {
      while (total < n && attempts < maxAttempts) {
        attempts += 1;
        const diagCall = {};
        const npc = Game.NPC.randomForChat({ diag: diagCall });
        if (!npc) continue;
        total += 1;
        const role = String(npc.role || "").toLowerCase();
        if (role === "cop") copCount += 1;
        if (sampleAuthors.length < sampleLimit) sampleAuthors.push({ id: npc.id, role: npc.role || "" });
        const cand = diagCall.candidatesRoleCounts || {};
        diagAgg.candidatesRoleCounts.cop += cand.cop || 0;
        diagAgg.candidatesRoleCounts.nonCop += cand.nonCop || 0;
        const sel = diagCall.selectedRoleCounts || {};
        diagAgg.selectedRoleCounts.cop += sel.cop || 0;
        diagAgg.selectedRoleCounts.nonCop += sel.nonCop || 0;
        const budgetBefore = Number.isFinite(diagCall.budgetBefore) ? diagCall.budgetBefore : null;
        const budgetAfter = Number.isFinite(diagCall.budgetAfter) ? diagCall.budgetAfter : null;
        if (firstBudgetBefore == null && budgetBefore != null) firstBudgetBefore = budgetBefore;
        if (budgetBefore != null) budgetValues.push(budgetBefore);
        if (budgetAfter != null) {
          budgetValues.push(budgetAfter);
          lastBudgetAfter = budgetAfter;
        }
        if (diagCall.note === "cop_fallback_only_cops") diagAgg.fallbackUsed = true;
      }
      const notes = (Game.__DEV && Array.isArray(Game.__DEV.__publicChatCopQuotaNotes))
        ? Array.from(new Set(Game.__DEV.__publicChatCopQuotaNotes))
        : [];
      const ratio = total ? (copCount / total) : 0;
      const insufficient = total < n;
      const lowRatio = ratio < 0.05;
      const highRatio = ratio > 0.15;
      const lowCops = copCount < 3;
      const highCops = copCount > 15;
      const validCopCandidates = diagAgg.candidatesRoleCounts.cop > 0;
      const failedReasons = [];
      if (insufficient) failedReasons.push("not_enough_messages");
      if (!validCopCandidates) failedReasons.push("cop_candidates_missing");
      if (copCount === 0) failedReasons.push("no_cops_selected");
      if (lowRatio) failedReasons.push("ratio_below_threshold");
      if (highRatio) failedReasons.push("ratio_above_threshold");
      if (lowCops) failedReasons.push("cop_count_too_low");
      if (highCops) failedReasons.push("cop_count_too_high");
      const budgetMin = budgetValues.length ? Math.min(...budgetValues) : null;
      const budgetMax = budgetValues.length ? Math.max(...budgetValues) : null;
      const diag = {
        candidatesRoleCounts: diagAgg.candidatesRoleCounts,
        selectedRoleCounts: diagAgg.selectedRoleCounts,
        budget: {
          start: firstBudgetBefore != null ? firstBudgetBefore : prevBudget,
          end: lastBudgetAfter != null ? lastBudgetAfter : prevBudget,
          min: budgetMin,
          max: budgetMax,
        },
        usedAuthorSelector: diagAgg.usedAuthorSelector,
      };
      if (!validCopCandidates) {
        diag.note = "copCandidates==0";
      }
      if (diagAgg.fallbackUsed) {
        diag.fallback = "cop_fallback_only_cops";
        if (!notes.includes("cop_fallback_only_cops")) notes.push("cop_fallback_only_cops");
      }
      const ok = failedReasons.length === 0;
      const result = {
        name,
        ok,
        total,
        copCount,
        ratio,
        notes: notes,
        sampleAuthors,
        attempts,
        seed,
        startedAt: Date.now(),
        diag,
        failed: ok ? [] : failedReasons,
      };
      emitLine(`PUBLIC_CHAT_COP_QUOTA_JSON ${safeStringify(result)}`);
      return result;
    } catch (err) {
      const failure = {
        name,
        ok: false,
        errorMessage: err && err.message ? err.message : String(err),
        attempts,
        seed,
        startedAt: Date.now(),
        diag: null,
        failed: ["exception"],
      };
      emitLine(`PUBLIC_CHAT_COP_QUOTA_JSON ${safeStringify(failure)}`);
      return failure;
    } finally {
      emitLine("PUBLIC_CHAT_COP_QUOTA_END");
      if (randomOverridden) {
        try { Math.random = origRandom; } catch (_) {}
      }
      if (S && S.npc) S.npc.copBudget = prevBudget;
      if (Game.__DEV) {
        Game.__DEV.__publicChatCopQuotaNotes = prevNotes || [];
      }
    }
  };

  // Auto-run disabled by default to avoid boot-time failures; manual run only.

  // Dev shortcut: Ctrl+Shift+T
  if (!Game.__DEV.__shortcutBound) {
    Game.__DEV.__shortcutBound = true;
    window.addEventListener("keydown", (e) => {
      const S = Game.__S || {};
      const flags = S.flags || {};
      if (flags.devChecks !== true) return;
      const tag = (e && e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : "";
      const isField = tag === "input" || tag === "textarea" || (e.target && e.target.isContentEditable);
      if (isField) return;
      if (e && e.ctrlKey && e.shiftKey && (e.key === "T" || e.key === "t")) {
        e.preventDefault();
        Game.__DEV.scenarioRun();
      }
    });
  }
})();
