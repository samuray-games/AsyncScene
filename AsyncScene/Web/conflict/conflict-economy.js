// Web/conflict/conflict-economy.js
(function () {
  const E = {};
  const BANK_ACCOUNT_ID = "bank";
  const WORLD_BANK_ID = "worldBank";
  const WORLD_BANK_SOFT_CAP = 20;
  const NPC_TAX_SOFT_CAP = 20;
  const NPC_TAX_MAX_PER_TXN = 2;
  const NPC_ACTIVITY_TAX_RATE = 0.25;
  const pools = {
    crowd: { id: "crowd", points: 0 },
    sink: { id: "sink", points: 0 },
    bank: { id: BANK_ACCOUNT_ID, points: 0 },
    worldBank: { id: WORLD_BANK_ID, points: 0 },
    crowdMap: Object.create(null),
    crowdPaid: Object.create(null),
  };
  const startCostAppliedById = Object.create(null);

  function getData(){
    return (Game && Game.Data) ? Game.Data : null;
  }

  function markLegacyEconHit(tag){
    try {
      const dbg = (Game && Game.__D) ? Game.__D : (Game.__D = {});
      const arr = Array.isArray(dbg.__legacyEconHits) ? dbg.__legacyEconHits : (dbg.__legacyEconHits = []);
      arr.push({ time: Date.now(), tag: String(tag || "legacy") });
    } catch (_) {}
  }

  function isCirculationEnabled(){
    return true;
  }

  function ensureDebugStore(){
    if (!Game.__D || typeof Game.__D !== "object") Game.__D = {};
    if (Game.__D.moneyLog == null) {
      Game.__D.moneyLog = [];
    } else if (!Array.isArray(Game.__D.moneyLog)) {
      try {
        const prev = Game.__D.moneyLog;
        console.warn("[DEV] Econ moneyLog reset (was non-array)", typeof prev, prev && Object.keys(prev || {}).slice(0, 5));
      } catch (_) {}
      Game.__D.moneyLog = [];
    }
    if (Game.__D.moneyLogByBattle == null) {
      Game.__D.moneyLogByBattle = {};
    } else if (typeof Game.__D.moneyLogByBattle !== "object" || Array.isArray(Game.__D.moneyLogByBattle)) {
      try {
        const prev = Game.__D.moneyLogByBattle;
        console.warn("[DEV] Econ moneyLogByBattle reset (was non-object)", typeof prev);
      } catch (_) {}
      Game.__D.moneyLogByBattle = {};
    }
    const DEV = Game.__DEV || (Game.__DEV = {});
    if (!DEV.__moneyLogExportedV1Done__) {
      exportMoneyLog();
      DEV.__moneyLogExportedV1Done__ = true;
    }
    return Game.__D;
  }

  function exportMoneyLog(){
    if (!Game) return [];
    const DEV = Game.__DEV || (Game.__DEV = {});
    if (DEV.__moneyLogExportInProgress__) {
      return DEV.__moneyLogExportedMoneyLog__ || [];
    }
    DEV.__moneyLogExportCalls__ = (DEV.__moneyLogExportCalls__ || 0) + 1;
    if (DEV.__moneyLogExportCalls__ > 200) {
      if (!DEV.__moneyLogExportCallcapLogged__) {
        console.error("ECON_MONEYLOG_EXPORT_CALLCAP_V1", { calls: DEV.__moneyLogExportCalls__ });
        DEV.__moneyLogExportCallcapLogged__ = true;
      }
      return DEV.__moneyLogExportedMoneyLog__ || [];
    }
    DEV.__moneyLogExportInProgress__ = true;
    try {
      const dbg = ensureDebugStore();
      const moneyLogArr = dbg.moneyLog || [];
      if (!Game.State) Game.State = {};
      const sameRef = Game.State.moneyLog === moneyLogArr;
      Game.State.moneyLog = moneyLogArr;
      DEV.__debugMoneyLog__ = moneyLogArr;
      DEV.__moneyLogExportedMoneyLog__ = moneyLogArr;
      if (!DEV.__moneyLogExportedV1Logged__) {
        console.warn("ECON_MONEYLOG_EXPORTED_V1", {
          len: moneyLogArr.length,
          ts: Date.now(),
          sameRef,
          calls: DEV.__moneyLogExportCalls__
        });
        DEV.__moneyLogExportedV1Logged__ = true;
      }
      return moneyLogArr;
    } finally {
      DEV.__moneyLogExportInProgress__ = false;
    }
  }

  function normalizeCrowdKey(poolId){
    const id = String(poolId || "");
    if (!id) return "";
    return id.startsWith("crowd:") ? id.slice("crowd:".length) : id;
  }

  function getStateHandle(){
    if (Game && Game.__S) return Game.__S;
    if (Game && Game.State) return Game.State;
    if (typeof State !== "undefined") return State;
    return null;
  }

  function isNpcId(id){
    const s = String(id || "");
    return s.startsWith("npc_");
  }

  function getNpcPointsArray(){
    const S = getStateHandle();
    const players = (S && S.players) ? S.players : {};
    const pts = [];
    Object.keys(players).forEach((id) => {
      const p = players[id];
      const pid = String(id || "");
      if (!pid) return;
      const isNpc = pid.startsWith("npc_") || (p && (p.npc === true || p.type === "npc" || p.isNpc === true));
      if (!isNpc) return;
      const v = (p && Number.isFinite(p.points)) ? (p.points | 0) : 0;
      pts.push(v);
    });
    return pts;
  }

  function percentileSorted(arr, q){
    if (!arr.length) return 0;
    const idx = Math.min(arr.length - 1, Math.max(0, Math.floor(((q / 100) * (arr.length - 1)))));
    return arr[idx] | 0;
  }

  function getNpcSoftCapP90(){
    const pts = getNpcPointsArray();
    if (!pts.length) return NPC_TAX_SOFT_CAP;
    pts.sort((a, b) => a - b);
    const p90 = percentileSorted(pts, 90);
    return Number.isFinite(p90) ? (p90 | 0) : NPC_TAX_SOFT_CAP;
  }

  function resolveNpcActivitySoftCap(softCapOverride){
    if (Number.isFinite(softCapOverride)) return { softCap: (softCapOverride | 0), reason: "override" };
    const p90 = getNpcSoftCapP90();
    if (Number.isFinite(p90)) return { softCap: (p90 | 0), reason: "p90" };
    try {
      const cfg = (Game && Game.__A && typeof Game.__A.getPointsConfig === "function") ? Game.__A.getPointsConfig() : null;
      if (cfg && Number.isFinite(cfg.softCap)) return { softCap: (cfg.softCap | 0), reason: "points_config" };
    } catch (_) {}
    return { softCap: 20, reason: "fallback_static_20" };
  }

  let applyingNpcActivityTax = false;
  let npcActivityTaxGuardTick = null;
  let npcActivityTaxGuardSeen = null;
  function shouldSkipNpcActivityTaxForTick(tickId, npcId){
    if (tickId == null) return false;
    const t = String(tickId);
    if (npcActivityTaxGuardTick !== t) {
      npcActivityTaxGuardTick = t;
      npcActivityTaxGuardSeen = Object.create(null);
    }
    if (npcActivityTaxGuardSeen && npcActivityTaxGuardSeen[npcId]) return true;
    if (npcActivityTaxGuardSeen) npcActivityTaxGuardSeen[npcId] = true;
    return false;
  }

  function npcActivityTaxLog(tag, payload){
    const gate = (Game && Game.__D && Game.__D.__npcActivityTaxLogGate) ? Game.__D.__npcActivityTaxLogGate : null;
    if (gate && gate.runId) {
      const agg = gate.agg || (gate.agg = Object.create(null));
      const slot = agg[tag] || (agg[tag] = { count: 0, first: null, last: null });
      slot.count += 1;
      if (!slot.first) slot.first = payload;
      slot.last = payload;
      return;
    }
    console.warn(tag, payload);
  }
  function maybeApplyNpcActivityTax(toId, gainPoints, toBefore, reason, meta, softCapOverride){
    const id = String(toId || "");
    const r = String(reason || "");
    const gain = Number(gainPoints || 0);
    const softCapMeta = resolveNpcActivitySoftCap(softCapOverride);
    const softCapNpc = softCapMeta.softCap;
    const acc = id ? getAccount(id) : null;
    const isNpcTarget = !!(acc && (acc.npc === true || acc.type === "npc" || id.startsWith("npc_")));
    const before = Number.isFinite(toBefore) ? (toBefore | 0) : (acc && Number.isFinite(acc.points) ? (acc.points | 0) : 0);
    if (applyingNpcActivityTax) return { ok: false, skipped: true, reason: "reentrant" };
    if (!Number.isFinite(gain) || gain <= 0) return { ok: false, skipped: true, reason: "no_gain" };
    if (!id) return { ok: false, skipped: true, reason: "no_id" };
    if (r === "npc_activity_tax" || r.startsWith("world_tax_")) return { ok: false, skipped: true, reason: "skip_reason" };
    if (r === "bank_deposit" || r === "bank_withdraw") return { ok: false, skipped: true, reason: "skip_reason" };
    if (r.startsWith("npc_account_") || r.startsWith("world_seed_")) return { ok: false, skipped: true, reason: "skip_reason" };
    if (meta && meta.activityTaxSkip) return { ok: false, skipped: true, reason: "skip_meta" };
    if (!isNpcTarget) return { ok: false, skipped: true, reason: "not_npc" };
    const logEnabled = (r === "npc_activity_tax") || (meta && meta.activityTaxMode === true);
    if (logEnabled) {
      try {
        npcActivityTaxLog("NPC_ACTIVITY_TAX_PRECHECK", {
          mode: meta && meta.mode ? String(meta.mode) : null,
          targetId: id || null,
          softCap: softCapNpc,
          softCapReason: softCapMeta.reason
        });
      } catch (_) {}
      if (gain > 0) {
        try {
          npcActivityTaxLog("NPC_ACTIVITY_TAX_DEBUG", {
            targetId: id || null,
            gainPoints: (gain | 0),
            npcPointsBefore: before,
            softCapBefore: softCapNpc,
            conditionPassed: (isNpcTarget && (gain | 0) > 0 && before > softCapNpc)
          });
        } catch (_) {}
      }
    }
    if (before <= softCapNpc) return { ok: false, skipped: true, reason: "below_softcap" };
    const tickId = (meta && meta.tickId != null) ? meta.tickId
      : (meta && Number.isFinite(meta.tick)) ? (meta.tick | 0)
        : null;
    if (shouldSkipNpcActivityTaxForTick(tickId, id)) {
      if (logEnabled) {
        try {
          npcActivityTaxLog("NPC_ACTIVITY_TAX_DEBUG", {
            targetId: id || null,
            tickId: tickId != null ? String(tickId) : null,
            guardSkip: true
          });
        } catch (_) {}
      }
      return { ok: false, skipped: true, reason: "tick_guard" };
    }
    const overCap = Math.max(0, (before | 0) - (softCapNpc | 0));
    const rawTax = Math.floor(overCap * NPC_ACTIVITY_TAX_RATE);
    const tax = Math.min(Math.max(1, rawTax), (before | 0));
    if (!Number.isFinite(tax) || tax <= 0) return { ok: false, skipped: true, reason: "tax_zero" };
    const taxMeta = Object.assign({}, meta || {}, {
      kind: "npc_activity_tax",
      cap: softCapNpc,
      rate: NPC_ACTIVITY_TAX_RATE,
      npcPtsBefore: before,
      softCapNpc,
      npcPointsBefore: before,
      gainPoints: (gainPoints | 0),
      taxRate: NPC_ACTIVITY_TAX_RATE,
      tax,
      sourceReason: r || null,
      activityTaxSkip: true,
      idempotencyKey: (tickId != null) ? `npc_activity_tax|${String(tickId)}|${id}` : null
    });
    applyingNpcActivityTax = true;
    try {
      if (logEnabled) {
        try {
          npcActivityTaxLog("NPC_ACTIVITY_TAX_TAX", {
            targetId: id,
            gainPoints: (gain | 0),
            npcPointsBefore: before,
            softCapBefore: softCapNpc,
            taxAmount: tax
          });
        } catch (_) {}
      }
      const res = E.transferPoints(id, WORLD_BANK_ID, tax, "npc_activity_tax", taxMeta);
      if (logEnabled) {
        try {
          const accAfter = getAccount(id);
          const bankAfter = getAccount(WORLD_BANK_ID);
          npcActivityTaxLog("NPC_ACTIVITY_TAX_POST", {
            targetId: id,
            npcPointsAfter: accAfter && Number.isFinite(accAfter.points) ? (accAfter.points | 0) : null,
            worldBankAfter: bankAfter && Number.isFinite(bankAfter.points) ? (bankAfter.points | 0) : null
          });
        } catch (_) {}
      }
      return res;
    } finally {
      applyingNpcActivityTax = false;
    }
  }

  let ensuringNpcAccounts = false;

  function ensureNpcEconAccount(npcId, opts = {}){
    const id = String(npcId || "");
    if (!id || !isNpcId(id)) return { ok: false, why: "not_npc", npcId: id };
    const S = getStateHandle();
    if (!S) return { ok: false, why: "state_missing", npcId: id };
    if (!S.players) S.players = {};
    let hadToCreate = false;
    if (!S.players[id]) {
      S.players[id] = { id, points: 0, npc: true };
      hadToCreate = true;
    }
    if (!Number.isFinite(S.players[id].points)) S.players[id].points = 0;
    return { ok: true, npcId: id, pointsSynced: (S.players[id].points | 0), hadToCreate };
  }

  function ensureNpcEconAccounts(opts = {}){
    const S = getStateHandle();
    const St = (Game && Game.State) ? Game.State : null;
    if (Game && !Game.__D) Game.__D = {};
    const ensureDiag = {
      called: true,
      branch: null,
      returnReason: null,
      storageKey: null,
      storageKeyUsed: null,
      hasGameStatePlayers: !!(St && St.players),
      hasSPlayers: !!(S && S.players),
      playersKeyCountGame: St && St.players ? Object.keys(St.players).length : 0,
      playersKeyCountS: S && S.players ? Object.keys(S.players).length : 0,
      npcIdsSeenCount: 0,
      npcIdsSeenSample: [],
      createdIdsCount: 0,
      createdIdsSample: [],
      missingAfterCount: 0,
      missingAfterIdsSample: [],
      econAccountKeysCountS: S && S.players ? Object.keys(S.players).length : 0,
      afterCount: 0,
      whyNotCreated: null
    };
    if (Game && Game.__D) Game.__D.__lastEnsureNpcEconAccounts = ensureDiag;
    if (!S) {
      ensureDiag.returnReason = "state_missing";
      ensureDiag.branch = "skip_no_players";
      ensureDiag.storageKey = "none";
      ensureDiag.storageKeyUsed = "none";
      return { ok: false, reason: "state_missing", branch: "skip_no_players", ensureDiag };
    }
    let playersCreated = false;
    if (!S.players) {
      if (St && St.players) {
        S.players = St.players;
        ensureDiag.storageKey = "S.players<-Game.State.players(link)";
        ensureDiag.storageKeyUsed = "Game.State.players";
      } else {
        S.players = {};
        ensureDiag.storageKey = "S.players(empty)";
        ensureDiag.storageKeyUsed = "S.players";
      }
      playersCreated = true;
    } else {
      if (St && St.players && S.players !== St.players) {
        S.players = St.players;
        ensureDiag.storageKey = "S.players<-Game.State.players(link)";
        ensureDiag.storageKeyUsed = "Game.State.players";
      } else {
        ensureDiag.storageKey = "S.players";
        ensureDiag.storageKeyUsed = "S.players";
      }
    }
    const sourcePlayers = (St && St.players) ? St.players : S.players;
    const npcIds = Object.keys(sourcePlayers || {}).filter(id => {
      const p = sourcePlayers[id];
      const pid = String(id || "");
      return pid.startsWith("npc_") || (p && (p.npc === true || p.type === "npc"));
    });
    ensureDiag.npcIdsSeenCount = npcIds.length;
    ensureDiag.npcIdsSeenSample = npcIds.slice(0, 5);
    ensureDiag.playersKeyCountS = S.players ? Object.keys(S.players).length : 0;
    ensureDiag.econAccountKeysCountS = ensureDiag.playersKeyCountS;
    if (npcIds.length === 0) {
      ensureDiag.branch = "skip_no_players";
      ensureDiag.afterCount = ensureDiag.econAccountKeysCountS;
      ensureDiag.whyNotCreated = "no_npc_ids";
      return { ok: true, npcCount: 0, createdCount: 0, syncedCount: 0, skippedCount: 0, sampleIds: [], createdIds: [], syncedIds: [], skippedIds: [], errors: [], beforeTotal: null, afterTotal: null, delta: null, missingAfterCount: 0, branch: "skip_no_players", ensureDiag };
    }
    const createdIds = [];
    const syncedIds = [];
    const skippedIds = [];
    const errors = [];
    const missingBefore = [];
    const econAccountsBefore = Object.keys(S.players || {}).filter(k => isNpcId(k)).length;
    const beforeSnap = (E && typeof E.sumPointsSnapshot === "function") ? E.sumPointsSnapshot() : null;
    const beforeTotal = (beforeSnap && Number.isFinite(beforeSnap.total)) ? (beforeSnap.total | 0) : null;
    if (ensuringNpcAccounts) {
      ensureDiag.returnReason = "reentrant";
      ensureDiag.branch = "already_ok";
      ensureDiag.whyNotCreated = "reentrant_guard";
      ensureDiag.afterCount = ensureDiag.econAccountKeysCountS;
      return { ok: false, reason: "reentrant", ensureDiag };
    }
    ensuringNpcAccounts = true;
    try {
      npcIds.forEach(id => {
        const pid = String(id || "");
        if (!pid) return;
        if (!S.players[pid]) missingBefore.push(pid);
        E.transferPoints("sink", pid, 0, "npc_account_init", { npcId: pid, reason: String(opts.reason || "ensure_npc_accounts") });
      });
      npcIds.forEach(id => {
        const pid = String(id || "");
        if (!pid) return;
        if (!S.players[pid]) {
          S.players[pid] = { id: pid, points: 0, npc: true };
          createdIds.push(pid);
        }
        const acc = S.players[pid];
        if (!Number.isFinite(acc.points)) acc.points = 0;
        const stPts = (sourcePlayers && sourcePlayers[pid] && Number.isFinite(sourcePlayers[pid].points))
          ? (sourcePlayers[pid].points | 0)
          : 0;
        const cur = (acc.points | 0);
        if (cur === stPts) {
          skippedIds.push(pid);
          return;
        }
        const diff = stPts - cur;
        const meta = {
          npcId: pid,
          desiredPts: stPts,
          beforePts: cur,
          reason: String(opts.reason || "ensure_npc_accounts")
        };
        let tx = null;
        if (diff > 0) tx = E.transferPoints("sink", pid, diff, "npc_account_sync", meta);
        else if (diff < 0) tx = E.transferPoints(pid, "sink", -diff, "npc_account_sync", meta);
        if (tx && tx.ok === true) syncedIds.push(pid);
        else errors.push({ npcId: pid, diff, reason: (tx && tx.reason) || "transfer_failed" });
      });
    } finally {
      ensuringNpcAccounts = false;
    }
    const afterSnap = (E && typeof E.sumPointsSnapshot === "function") ? E.sumPointsSnapshot() : null;
    const afterTotal = (afterSnap && Number.isFinite(afterSnap.total)) ? (afterSnap.total | 0) : null;
    const delta = (beforeTotal != null && afterTotal != null) ? (afterTotal - beforeTotal) : null;
    const missingAfterIds = npcIds.filter(id => {
      const pid = String(id || "");
      return !S.players[pid];
    });
    const missingAfterCount = missingAfterIds.length;
    ensureDiag.missingAfterCount = missingAfterCount;
    ensureDiag.missingAfterIdsSample = missingAfterIds.slice(0, 5);
    const createdCount = missingBefore.filter(id => !missingAfterIds.includes(id)).length;
    let branch = "already_ok";
    if (playersCreated) branch = "created_s_players";
    if (missingBefore.length > 0) branch = "created_missing_npc_accounts";
    ensureDiag.branch = branch;
    ensureDiag.createdIdsCount = createdCount;
    ensureDiag.createdIdsSample = missingBefore.slice(0, 5);
    ensureDiag.econAccountKeysCountS = S.players ? Object.keys(S.players).length : 0;
    ensureDiag.afterCount = ensureDiag.econAccountKeysCountS;
    if (createdCount === 0) {
      ensureDiag.whyNotCreated = (missingBefore.length === 0) ? "already_present" : "create_failed";
    }
    if (isDevFlag()) {
      try {
        const econAccountsAfter = Object.keys(S.players || {}).filter(k => isNpcId(k)).length;
        console.warn("ECON_NPC_ENSURE_V2", {
          called: true,
          npcIdsSeen: npcIds.length,
          econAccountsBefore,
          econAccountsAfter,
          createdIds: createdIds.slice(0, 5),
          createdCount,
          syncedCount: syncedIds.length,
          skippedCount: skippedIds.length,
          beforeTotal,
          afterTotal,
          delta,
          missingAfterCount,
          branch,
          reason: String(opts.reason || "ensure_npc_accounts")
        });
        console.warn("ECON_NPC_ACCOUNTS_CANON", {
          npcSeen: npcIds.length,
          createdCount,
          afterCount: econAccountsAfter,
          missingAfterCount,
          storageKeyUsed: ensureDiag.storageKeyUsed || ensureDiag.storageKey || "unknown"
        });
      } catch (_) {}
    }
    return {
      ok: true,
      npcCount: npcIds.length,
      createdCount,
      syncedCount: syncedIds.length,
      skippedCount: skippedIds.length,
      sampleIds: npcIds.slice(0, 5),
      createdIds,
      syncedIds,
      skippedIds,
      errors,
      beforeTotal,
      afterTotal,
      delta,
      missingAfterCount,
      branch,
      ensureDiag
    };
  }

  function ensureNpcAccountFromState(id){
    const key = String(id || "");
    if (!key) return null;
    const S = getStateHandle();
    if (!S) return null;
    if (!S.players) S.players = {};
    if (S.players[key]) {
      if (!Number.isFinite(S.players[key].points)) S.players[key].points = 0;
      return S.players[key];
    }
    const St = (Game && Game.State) ? Game.State : null;
    if (St && St.players && St.players[key]) {
      S.players[key] = St.players[key];
      if (!Number.isFinite(S.players[key].points)) {
        const stPts = St.players[key] && Number.isFinite(St.players[key].points) ? (St.players[key].points | 0) : 0;
        S.players[key].points = stPts;
      }
      return S.players[key];
    }
    S.players[key] = { id: key, points: 0, npc: true };
    return S.players[key];
  }

  let npcAccountMigrateLogged = false;
  function ensureNpcAccountsFromState(opts = {}){
    const S = getStateHandle();
    if (!S || !S.players) return { ok: false, reason: "state_missing" };
    const St = (Game && Game.State) ? Game.State : null;
    const res = ensureNpcEconAccounts({ reason: opts.reason || "ensure_all" }) || {};
    if (isDevFlag() && ((res.createdCount || 0) || (res.syncedCount || 0)) && !npcAccountMigrateLogged) {
      npcAccountMigrateLogged = true;
      try {
        console.warn("ECON_NPC_ACCOUNT_MIGRATE_V1", {
          count: (res.createdCount || 0) + (res.syncedCount || 0),
          movedTotal: 0,
          mode: (St && St.players) ? "sync" : "migrate"
        });
        if (Game.__D) Game.__D.__npcAccountMigrateSeen = true;
      } catch (_) {}
    }
    return {
      ok: true,
      createdNowCount: Number.isFinite(res.createdCount) ? res.createdCount : 0,
      syncedNowCount: Number.isFinite(res.syncedCount) ? res.syncedCount : 0,
      createdIds: Array.isArray(res.createdIds) ? res.createdIds : [],
      syncedIds: Array.isArray(res.syncedIds) ? res.syncedIds : []
    };
  }

  function logTransfer(entry){
    const dbg = ensureDebugStore();
    const log = dbg.moneyLog;
    const meta = entry && entry.meta ? entry.meta : null;
    if (meta && meta.txId && !entry.txId) entry.txId = meta.txId;
    let bid = entry ? String(entry.battleId || (meta && meta.battleId) || entry.eventId || (meta && meta.eventId) || "") : "";
    if (!bid && entry) {
      const src = String(entry.sourceId || "");
      const tgt = String(entry.targetId || "");
      if (src.startsWith("crowd:")) bid = src.slice("crowd:".length);
      else if (tgt.startsWith("crowd:")) bid = tgt.slice("crowd:".length);
    }
    if (!bid && entry) {
      const reason = String(entry.reason || "");
      if (reason.startsWith("crowd_vote_")) {
        const last = dbg && dbg.lastCrowdCapMeta ? dbg.lastCrowdCapMeta : null;
        if (last && last.battleId) bid = String(last.battleId);
      }
    }
    if (bid && entry && !entry.battleId) entry.battleId = bid;
    log.push(entry);
    if (bid) {
      if (!Array.isArray(dbg.moneyLogByBattle[bid])) {
        dbg.moneyLogByBattle[bid] = [];
      }
      const arr = dbg.moneyLogByBattle[bid];
      arr.push(entry);
      if (arr.length > 200) arr.shift();
    }
    if (log.length > 200) log.shift();
  }

  function getAccount(id){
    if (!id) return null;
    const key = String(id);
    if (key.startsWith("crowd:")) {
      const bid = normalizeCrowdKey(key);
      if (!pools.crowdMap[bid]) pools.crowdMap[bid] = { id: key, points: 0, battleId: bid };
      return pools.crowdMap[bid];
    }
    if (key === "crowd") return pools.crowd;
    if (key === "sink") return pools.sink;
    if (key === BANK_ACCOUNT_ID) return pools.bank;
    if (key === WORLD_BANK_ID) return pools.worldBank;
    const S = getStateHandle();
    if (!S) return null;
    if (key === "me") {
      if (S.players && S.players.me && typeof S.players.me.points === "number") return S.players.me;
      if (S.me) return S.me;
    }
    if (S.players && S.players[key]) return S.players[key];
    if (S.me && S.me.id === key) return S.me;
    if (isNpcId(key)) {
      if (!ensuringNpcAccounts) {
        try { ensureNpcAccountsFromState({ reason: "getAccount" }); } catch (_) {}
      }
      const ensured = ensureNpcEconAccount(key, { reason: "getAccount" });
      if (ensured && ensured.ok === true && S.players && S.players[key]) return S.players[key];
      return ensureNpcAccountFromState(key);
    }
    const St = (Game && Game.State) ? Game.State : null;
    if (St && St.players && St.players[key]) {
      S.players = S.players || {};
      S.players[key] = St.players[key];
      return S.players[key];
    }
    return null;
  }

  function getWorldBankBalance(){
    if (pools.worldBank && Number.isFinite(pools.worldBank.points)) return (pools.worldBank.points | 0);
    return 0;
  }

  function withPointsWrite(fn){
    if (Game && typeof Game._withPointsWrite === "function") return Game._withPointsWrite(fn);
    return fn();
  }

  function getPriceMultiplier(points){
    const p = Number.isFinite(points) ? points : 0;
    return p > 20 ? 2 : 1;
  }

  function calcFinalPrice(opts = {}){
    const baseRaw = Number.isFinite(opts.basePrice) ? (opts.basePrice | 0) : 0;
    const pointsRaw = Number.isFinite(opts.actorPoints) ? (opts.actorPoints | 0) : 0;
    const base = Math.max(0, baseRaw);
    const points = Math.max(0, pointsRaw);
    const multiplier = getPriceMultiplier(points);
    const finalPrice = base * multiplier;
    return {
      basePrice: base,
      mult: multiplier,
      finalPrice,
      priceKey: opts.priceKey || null,
      context: opts.context || null
    };
  }

  const TRAINING_BASE_PRICE = 1;
  function getTrainingBasePrice(){
    return TRAINING_BASE_PRICE;
  }

  function sanitizeNonNegativeInt(v){
    if (!Number.isFinite(v)) return 0;
    const n = (v | 0);
    return n < 0 ? 0 : n;
  }

  function computeTrainingLevel(xp){
    const n = sanitizeNonNegativeInt(xp);
    return Math.floor(n / 3);
  }

  function getDayIndex(){
    const S = Game.__S || {};
    const d = Number.isFinite(S.dayIndex) ? (S.dayIndex | 0) : 0;
    if (!Number.isFinite(S.dayIndex)) S.dayIndex = d;
    return d;
  }

  function ensureTrainingState(){
    const S = Game.__S || {};
    let t = S.training;
    if (!t || typeof t !== "object") {
      if (Game.TrainingState && typeof Game.TrainingState.normalize === "function") {
        t = Game.TrainingState.normalize(t);
      } else {
        t = { version: 1, byArgKey: {}, counters: { totalTrains: 0, todayTrains: 0, lastTrainDay: 0 } };
      }
      S.training = t;
    }
    if (!t.byArgKey || typeof t.byArgKey !== "object") t.byArgKey = {};
    if (!t.counters || typeof t.counters !== "object") {
      t.counters = { totalTrains: 0, todayTrains: 0, lastTrainDay: 0 };
    }
    t.counters.totalTrains = sanitizeNonNegativeInt(t.counters.totalTrains);
    t.counters.todayTrains = sanitizeNonNegativeInt(t.counters.todayTrains);
    t.counters.lastTrainDay = sanitizeNonNegativeInt(t.counters.lastTrainDay);
    return t;
  }

  function ensureTrainingEntry(argKey){
    const t = ensureTrainingState();
    const key = String(argKey || "").trim();
    if (!key) return null;
    let e = t.byArgKey[key];
    if (!e || typeof e !== "object") e = {};
    e.level = sanitizeNonNegativeInt(e.level);
    e.xp = sanitizeNonNegativeInt(e.xp);
    e.lastTrainedAt = sanitizeNonNegativeInt(e.lastTrainedAt);
    e.cooldownUntil = sanitizeNonNegativeInt(e.cooldownUntil);
    t.byArgKey[key] = e;
    return e;
  }

  function isDevFlag(){
    try {
      if (typeof window !== "undefined" && (window.__DEV__ === true || window.DEV === true)) return true;
    } catch (_) {}
    try {
      if (typeof location !== "undefined" && location && location.search) {
        const params = new URLSearchParams(location.search);
        return params.get("dev") === "1";
      }
    } catch (_) {}
    return false;
  }

  function buildIdempotencyKey(opts){
    const key = String(opts && opts.priceKey || "price");
    const actorId = String(opts && opts.actorId || "");
    const ctx = (opts && opts.context && typeof opts.context === "object") ? opts.context : {};
    const battleId = String(ctx.battleId || opts.battleId || "");
    const rematchOf = String(ctx.rematchOf || opts.rematchOf || "");
    const mode = String(ctx.mode || opts.mode || "");
    const targetId = String(ctx.targetId || opts.targetId || "");
    const argKey = String(ctx.argKey || opts.argKey || "");
    const actionNonce = String(ctx.actionNonce || opts.actionNonce || "");
    const parts = [key, actorId, battleId, rematchOf, mode, targetId, argKey, actionNonce].filter(Boolean);
    return parts.join("|");
  }

  function findDupEntry(reason, idempotencyKey, battleId){
    const dbg = Game && Game.__D ? Game.__D : null;
    if (!dbg) return null;
    const bid = battleId ? String(battleId) : "";
    const list = bid && dbg.moneyLogByBattle && Array.isArray(dbg.moneyLogByBattle[bid])
      ? dbg.moneyLogByBattle[bid]
      : (Array.isArray(dbg.moneyLog) ? dbg.moneyLog : []);
    for (let i = list.length - 1; i >= 0; i--) {
      const x = list[i];
      if (!x) continue;
      if (String(x.reason || "") !== String(reason || "")) continue;
      const m = x.meta || {};
      if (String(m.idempotencyKey || "") === String(idempotencyKey || "")) return x;
    }
    return null;
  }

  function logNpcSkipLowFunds(meta = {}){
    const npcId = String(meta.npcId || "");
    if (!npcId) return { ok: false, reason: "no_npc" };
    const tickId = (meta.tickId != null) ? String(meta.tickId) : "";
    const actionKey = String(meta.actionKey || "");
    const idempotencyKey = meta.idempotencyKey || `npc_skip_low_funds|${tickId}|${npcId}|${actionKey}`;
    const contextId = meta.contextId ? String(meta.contextId) : "";
    const existing = findDupEntry("npc_skip_low_funds", idempotencyKey, contextId);
    if (existing) return { ok: true, dedup: true, idempotencyKey, existing };
    const entry = {
      time: Date.now(),
      sourceId: npcId,
      targetId: "sink",
      amount: 0,
      reason: "npc_skip_low_funds",
      battleId: contextId || null,
      meta: Object.assign({}, meta, { idempotencyKey })
    };
    logTransfer(entry);
    return { ok: true, logged: true, idempotencyKey };
  }

  function chargePriceOnce(opts = {}){
    const fromId = (opts && opts.fromId != null) ? String(opts.fromId) : "me";
    const toId = (opts && opts.toId != null) ? String(opts.toId) : "sink";
    const actorId = (opts && opts.actorId != null) ? String(opts.actorId) : fromId;
    const reason = String(opts.reason || "price_charge");
    const battleId = opts.battleId ? String(opts.battleId) : null;
    const context = (opts.context && typeof opts.context === "object") ? opts.context : {};
    const idempotencyKey = opts.idempotencyKey || buildIdempotencyKey({
      priceKey: opts.priceKey,
      actorId,
      battleId,
      rematchOf: opts.rematchOf,
      mode: opts.mode,
      targetId: opts.targetId,
      argKey: opts.argKey,
      context
    });
    const existing = findDupEntry(reason, idempotencyKey, battleId || context.battleId);
    if (existing) {
      return { ok: true, dedup: true, charged: false, idempotencyKey, existing };
    }
    const price = calcFinalPrice({
      basePrice: opts.basePrice,
      actorPoints: opts.actorPoints,
      priceKey: opts.priceKey,
      context
    });
    const acc = getAccount(actorId);
    const ptsBefore = Number.isFinite(opts.actorPoints)
      ? (opts.actorPoints | 0)
      : (acc && Number.isFinite(acc.points) ? (acc.points | 0) : 0);
    const amount = price.finalPrice;
    const meta = {
      battleId: battleId || (context && context.battleId ? context.battleId : null),
      basePrice: price.basePrice,
      mult: price.mult,
      finalPrice: price.finalPrice,
      priceKey: price.priceKey || opts.priceKey || null,
      pointsAtPurchase: Number.isFinite(opts.actorPoints) ? opts.actorPoints : 0,
      context,
      idempotencyKey
    };
    const isNpcActor = acc && (acc.npc === true || acc.type === "npc" || String(actorId).startsWith("npc_"));
    if (isNpcActor && (ptsBefore <= 0 || ptsBefore < amount)) {
      const tickId = (opts && opts.tickId != null)
        ? opts.tickId
        : (context && context.tickId != null)
          ? context.tickId
          : (opts && opts.tick != null)
            ? opts.tick
            : null;
      const actionKey = String(opts.actionKey || price.priceKey || reason || "");
      logNpcSkipLowFunds({
        npcId: actorId,
        ptsBefore,
        need: amount,
        actionKey,
        priceKey: price.priceKey || opts.priceKey || null,
        mult: price.mult,
        contextId: meta.battleId || null,
        tickId,
        idempotencyKey: `npc_skip_low_funds|${String(tickId || "")}|${actorId}|${actionKey}`
      });
      return { ok: false, skipped: true, reason: "npc_skip_low_funds", idempotencyKey, meta };
    }
    if (opts.rematchOf) meta.rematchOf = opts.rematchOf;
    if (opts.extraMeta && typeof opts.extraMeta === "object") {
      Object.keys(opts.extraMeta).forEach(k => { meta[k] = opts.extraMeta[k]; });
    }
    const tx = E.transferPoints(fromId, toId, amount, reason, meta);
    if (!tx || tx.ok !== true) return { ok: false, reason: (tx && tx.reason) || "transfer_failed", idempotencyKey, meta };
    return { ok: true, charged: true, idempotencyKey, meta, price };
  }

  E.getCrowdPoolId = function (battleId){
    if (!battleId) return "crowd";
    return `crowd:${battleId}`;
  };

  E.getPriceMultiplier = getPriceMultiplier;
  E.calcFinalPrice = calcFinalPrice;
  E.chargePriceOnce = chargePriceOnce;
  E.logNpcSkipLowFunds = logNpcSkipLowFunds;
  E.getTrainingBasePrice = getTrainingBasePrice;

  E.ensurePool = function (poolId){
    const id = String(poolId || "");
    if (!id) return null;
    if (id === "sink") return pools.sink;
    if (id === "crowd") return pools.crowd;
    if (id.startsWith("crowd:")) {
      const bid = normalizeCrowdKey(id);
      if (!pools.crowdMap[bid]) pools.crowdMap[bid] = { id, points: 0, battleId: bid };
      return pools.crowdMap[bid];
    }
    return null;
  };

  E.getAllPoolIds = function (){
    const ids = ["sink","crowd", BANK_ACCOUNT_ID, WORLD_BANK_ID];
    Object.keys(pools.crowdMap || {}).forEach(k => ids.push(k));
    return ids;
  };

  E.prewarmCrowd = function (battleId){
    if (!battleId) return null;
    return getAccount(`crowd:${battleId}`);
  };

  E.getPoolBalance = function (poolId){
    const acc = getAccount(poolId);
    return acc ? (acc.points | 0) : 0;
  };
  E.getAccountBalance = function (accountId){
    const acc = getAccount(accountId);
    return acc ? (acc.points | 0) : 0;
  };
  if (typeof E.getBalanceById !== "function") {
    E.getBalanceById = function (accountId){
      return E.getAccountBalance(accountId);
    };
  }
  E.getLedgerBalanceAt = function (accountId, opts = {}){
    const log = (Game && Game.__D && Array.isArray(Game.__D.moneyLog)) ? Game.__D.moneyLog : [];
    const total = log.length;
    const upto = Number.isFinite(opts.uptoIndex)
      ? Math.max(0, Math.min(total, opts.uptoIndex))
      : total;
    let bal = 0;
    const key = String(accountId || "");
    for (let i = 0; i < upto; i += 1) {
      const tx = log[i];
      if (!tx) continue;
      const currency = String(tx.currency || "");
      const reason = String(tx.reason || "");
      if (currency === "rep" || reason.startsWith("rep_")) continue;
      const amt = Number(tx.amount || 0);
      if (!Number.isFinite(amt) || amt === 0) continue;
      const src = String(tx.sourceId || "");
      const tgt = String(tx.targetId || "");
      if (src === key) bal -= amt;
      if (tgt === key) bal += amt;
    }
    return bal | 0;
  };
  if (typeof E.getLedgerBalance !== "function") {
    E.getLedgerBalance = function (accountId){
      return E.getLedgerBalanceAt(accountId);
    };
  }

  E.transferFromPool = function (poolId, toId, amount, reason, meta){
    return E.transferPoints(poolId, toId, amount, reason, meta);
  };

  E.isCrowdPaid = function (poolId){
    return !!pools.crowdPaid[String(poolId || "")];
  };

  E.markCrowdPaid = function (poolId){
    pools.crowdPaid[String(poolId || "")] = true;
  };

  E.sumPointsSnapshot = function (){
    const S = Game.__S || {};
    const players = S.players || {};
    let playersSum = 0;
    let npcsSum = 0;
    const countedPlayerIds = [];
    const countedNpcIds = [];
    const countedPoolIds = [];
    const duplicatesDetected = [];
    const byId = Object.create(null);
    const seen = new Set();

    const addById = (id, pts, bucket) => {
      const key = String(id || "");
      if (!key) return false;
      if (Object.prototype.hasOwnProperty.call(byId, key)) {
        duplicatesDetected.push(key);
        return false;
      }
      const val = (pts | 0);
      byId[key] = val;
      if (bucket === "npc") {
        npcsSum += val;
        countedNpcIds.push(key);
      } else if (bucket === "player") {
        playersSum += val;
        countedPlayerIds.push(key);
      } else if (bucket === "pool") {
        if (key === "sink" || key === "crowd" || key === BANK_ACCOUNT_ID) countedPoolIds.push(key);
        else if (key.startsWith("crowd:")) countedPoolIds.push(key.slice("crowd:".length));
      }
      return true;
    };

    Object.values(players).forEach(p => {
      if (!p) return;
      const id = String(p.id || "");
      const isNpc = (p.npc === true || p.type === "npc" || p.isNpc === true || id.startsWith("npc_"));
      if (id) {
        if (seen.has(id)) duplicatesDetected.push(id);
        seen.add(id);
      }
      if (isNpc) {
        addById(id, p.points, "npc");
      } else {
        addById(id, p.points, "player");
      }
    });

    let meSource = "";
    let mePoints_stateMe = null;
    let mePoints_playersMe = null;
    let mePoints_used = null;
    if (S.me && typeof S.me.points === "number") mePoints_stateMe = (S.me.points | 0);
    if (players.me && typeof players.me.points === "number") mePoints_playersMe = (players.me.points | 0);
    if (S.me) {
      const mid = String(S.me.id || "me");
      const inPlayers = players.me || (mid && players[mid]);
      if (!inPlayers) {
        if (mid) {
          if (seen.has(mid)) duplicatesDetected.push(mid);
          seen.add(mid);
        }
        addById(mid, S.me.points, "player");
        meSource = "state.me";
        mePoints_used = (S.me.points | 0);
      } else {
        meSource = "players.me";
        mePoints_used = (players.me && typeof players.me.points === "number")
          ? (players.me.points | 0)
          : (mid && players[mid] && typeof players[mid].points === "number")
            ? (players[mid].points | 0)
            : null;
      }
    }

    const list = (Game.NPC && typeof Game.NPC.getAll === "function")
      ? Game.NPC.getAll()
      : (Game.NPC && typeof Game.NPC.list === "function")
        ? Game.NPC.list()
        : [];
    list.forEach(n => {
      if (!n) return;
      const id = String(n.id || "");
      if (id) {
        if (seen.has(id)) return;
        seen.add(id);
      }
      addById(id, n.points, "npc");
    });

    const sink = (pools.sink && typeof pools.sink.points === "number") ? (pools.sink.points | 0) : 0;
    const crowd = (pools.crowd && typeof pools.crowd.points === "number") ? (pools.crowd.points | 0) : 0;
    const bank = (pools.bank && typeof pools.bank.points === "number") ? (pools.bank.points | 0) : 0;
    const worldBank = (pools.worldBank && typeof pools.worldBank.points === "number") ? (pools.worldBank.points | 0) : 0;
    let crowdMapTotal = 0;
    const crowdById = {};
    if (pools.sink) addById("sink", sink, "pool");
    if (pools.crowd) addById("crowd", crowd, "pool");
    if (pools.bank) addById(BANK_ACCOUNT_ID, bank, "pool");
    if (pools.worldBank) addById(WORLD_BANK_ID, worldBank, "pool");
    Object.keys(pools.crowdMap || {}).forEach(k => {
      const acc = pools.crowdMap[k];
      const v = acc && typeof acc.points === "number" ? (acc.points | 0) : 0;
      crowdMapTotal += v;
      crowdById[k] = v;
      addById(`crowd:${k}`, v, "pool");
    });

    const poolsSum = sink + crowd + bank + worldBank + crowdMapTotal;
    const total = Object.values(byId).reduce((s, v) => s + (v | 0), 0);
    return {
      total,
      byId,
      players: playersSum,
      npcs: npcsSum,
      pools: poolsSum,
      poolsBreakdown: { sink, crowd, bank, worldBank, crowdMap: crowdMapTotal, crowdById },
      countedPlayerIds,
      countedNpcIds,
      countedPoolIds,
      countedCrowdPoolIdsPrefixed: Object.keys(pools.crowdMap || {}).map(k => `crowd:${k}`),
      duplicatesDetected,
      mePoints_stateMe,
      mePoints_playersMe,
      mePoints_used,
      meSource,
      ts: Date.now()
    };
  };

  E.getNpcActivitySoftCapMeta = function(){
    return resolveNpcActivitySoftCap();
  };

  E.transferPoints = function (fromId, toId, amount, reason, meta = {}) {
    ensureDebugStore();
    try {
      const toKey = String(toId || "");
      const r0 = String(reason || "");
      const logEnabled = (r0 === "npc_activity_tax") || (meta && meta.activityTaxMode === true);
      if (logEnabled) {
        npcActivityTaxLog("NPC_ACTIVITY_TAX_ENTRY", {
          sourceId: String(fromId || ""),
          targetId: toKey,
          reason: r0,
          amount: Number(amount || 0)
        });
      }
    } catch (_) {}
    const n = Number(amount || 0);
    const r0 = String(reason || "");
    if (!Number.isFinite(n) || n <= 0) {
      if (n === 0 && r0 === "npc_account_init") {
        const from = getAccount(fromId);
        const to = getAccount(toId);
        if (!from || !to) return { ok: false, reason: "bad_account" };
        logTransfer({
          time: Date.now(),
          sourceId: String(fromId),
          targetId: String(toId),
          amount: 0,
          reason: r0,
          battleId: meta && meta.battleId ? meta.battleId : null,
          meta: meta || null
        });
        return { ok: true, noop: true, reason: "npc_account_init" };
      }
      return { ok: false, reason: "bad_amount" };
    }
    try {
      const r = r0;
      if (r.startsWith("battle_") && (!meta || !meta.battleId)) {
        if (Game && Game.__D && Game.__D.FORCE_CIRCULATION === true) {
          let stackHead = "";
          try {
            const err = new Error();
            const s = String(err && err.stack ? err.stack : "");
            const lines = s.split("\n").map(x => x.trim()).filter(Boolean);
            if (lines.length > 1) stackHead = `${lines[1] || ""}${lines[2] ? " | " + lines[2] : ""}`;
          } catch (_) {}
          console.warn("[DEV] Econ.transferPoints missing battleId for", r, stackHead);
        }
      }
    } catch (_) {}
    const from = getAccount(fromId);
    const to = getAccount(toId);
    if (!from || !to) return { ok: false, reason: "bad_account" };
    if (String(fromId) === String(toId)) {
      logTransfer({
        time: Date.now(),
        sourceId: String(fromId),
        targetId: String(toId),
        amount: n | 0,
        reason: reason || "noop",
        battleId: meta && meta.battleId ? meta.battleId : null
      });
      return { ok: true, noop: true };
    }
    const fromPts = (from.points | 0);
    const toBefore = (to.points | 0);
    let amt = (n | 0);
    if (isCirculationEnabled()) {
      const fromKey = String(fromId || "");
      const isPool = (fromKey === "sink" || fromKey === "crowd" || fromKey.startsWith("crowd:"));
      const isNpc = !!(from && (from.npc === true || from.type === "npc"));
      // Canon: points may reach 0 (never below 0). No hidden "keep 1 💰" reserve for players.
      if (!isPool) {
        if (amt > fromPts) amt = fromPts;
      }
      if (amt <= 0) return { ok: false, reason: "insufficient", have: fromPts, need: (n | 0) };
    } else {
      if (fromPts < amt) return { ok: false, reason: "insufficient", have: fromPts, need: amt };
    }
    const softCapBefore = (String(toId || "").startsWith("npc_")) ? getNpcSoftCapP90() : null;
    // IMPORTANT: any points write must happen inside withPointsWrite() while circulation is enabled.
    // Otherwise State's points-guard may reject the assignment (even for internal sync like S.players.me -> S.me).
    withPointsWrite(() => {
      from.points = Math.max(0, (from.points | 0) - amt);
      to.points = (to.points | 0) + amt;

      // Keep UI source-of-truth in sync:
      // UI reads points from State.me, while Econ often mutates State.players.me.
      try {
        if (isCirculationEnabled()) {
          const S = Game.__S || null;
          const touchMe = (String(fromId) === "me") || (String(toId) === "me");
          if (touchMe && S && S.me && S.players && S.players.me && typeof S.players.me.points === "number") {
            S.me.points = S.players.me.points;
          }
        }
      } catch (_) {}
    });
    logTransfer({
      time: Date.now(),
      sourceId: String(fromId),
      targetId: String(toId),
      amount: amt,
      reason: reason || "",
      battleId: meta && meta.battleId ? meta.battleId : null,
      status: meta && meta.status ? meta.status : null,
      phase: meta && meta.phase ? meta.phase : null,
      meta: meta || null
    });
    try {
      const toKey = String(toId || "");
      const probeIsNpcTarget = !!(toKey.startsWith("npc_"));
      const logEnabled = (r0 === "npc_activity_tax") || (meta && meta.activityTaxMode === true);
      if (logEnabled) {
        npcActivityTaxLog("NPC_ACTIVITY_TAX_V1_PROBE", {
          sourceId: String(fromId || ""),
          targetId: toKey,
          reason: r0,
          gainPoints: amt,
          isNpcTarget: probeIsNpcTarget,
          softCapBefore
        });
      }
      maybeApplyNpcActivityTax(toId, amt, toBefore, r0, meta, softCapBefore);
    } catch (_) {}
    // Emit delta toast immediately for player points (no aggregation, no render-tick delay).
    try {
      const touchMe = (String(fromId) === "me") || (String(toId) === "me");
      if (touchMe && Game && Game.__A && typeof Game.__A.emitStatDelta === "function") {
        const d = ((String(toId) === "me") ? (amt | 0) : 0) - ((String(fromId) === "me") ? (amt | 0) : 0);
        if (d) {
          Game.__A.emitStatDelta("points", d, { reason: reason || "points_transfer", battleId: meta && meta.battleId ? meta.battleId : null });
        }
      }
    } catch (_) {}
    return { ok: true };
  };

  E.transferCrowdVoteCost = function (fromId, toId, amount, meta = {}) {
    const cost = Number(amount || 0);
    if (!Number.isFinite(cost) || cost <= 0) return { ok: false, reason: "bad_amount" };
    const fromAcc = getAccount(fromId);
    const isNpc = fromAcc && (fromAcc.npc === true || fromAcc.type === "npc" || String(fromId || "").startsWith("npc_"));
    const ptsBefore = fromAcc && Number.isFinite(fromAcc.points) ? (fromAcc.points | 0) : 0;
    if (isNpc && (ptsBefore <= 0 || ptsBefore < cost)) {
      const actionKey = "crowd_vote_cost";
      const tickId = (meta && meta.tickId != null) ? meta.tickId : (meta && meta.tick != null) ? meta.tick : null;
      logNpcSkipLowFunds({
        npcId: String(fromId || ""),
        ptsBefore,
        need: cost,
        actionKey,
        priceKey: meta && meta.priceKey ? String(meta.priceKey) : "vote",
        mult: meta && Number.isFinite(meta.mult) ? (meta.mult | 0) : 1,
        contextId: meta && meta.battleId ? String(meta.battleId) : null,
        tickId,
        idempotencyKey: `npc_skip_low_funds|${String(tickId || "")}|${String(fromId || "")}|${actionKey}`
      });
      return { ok: false, skipped: true, reason: "npc_skip_low_funds" };
    }
    let taxAmount = cost >= 1 ? 1 : 0;
    const bankBal = getWorldBankBalance();
    if (taxAmount > 0 && bankBal >= WORLD_BANK_SOFT_CAP) taxAmount = 0;
    const netCost = Math.max(0, (cost | 0) - taxAmount);
    const baseMeta = Object.assign({}, meta || {});
    const taxMeta = Object.assign({}, baseMeta, {
      kind: "world_tax",
      fromReason: "crowd_vote_cost",
      taxKind: "fixed",
      taxAmount,
      originalCost: cost
    });
    if (taxAmount === 0 && cost >= 1 && bankBal >= WORLD_BANK_SOFT_CAP) {
      taxMeta.skipReason = "bank_soft_cap";
      taxMeta.bankSoftCap = WORLD_BANK_SOFT_CAP;
      taxMeta.bankBalance = bankBal;
    }
    if (baseMeta && baseMeta.battleId) taxMeta.battleId = baseMeta.battleId;
    const netMeta = Object.assign({}, baseMeta, {
      originalCost: cost,
      netCost,
      taxAmount,
      taxKind: "fixed"
    });
    let taxRes = { ok: true, skipped: true };
    if (taxAmount > 0) {
      taxRes = E.transferPoints(fromId, WORLD_BANK_ID, taxAmount, "world_tax_in", taxMeta);
      if (!taxRes || taxRes.ok !== true) return taxRes;
    }
    if (netCost > 0) {
      return E.transferPoints(fromId, toId, netCost, "crowd_vote_cost", netMeta);
    }
    return { ok: true, taxOnly: true, taxAmount, netCost };
  };

  function applyNpcWealthTaxIfNeeded(npcId, npcPtsBefore, ctx = {}) {
    const res = {
      ok: true,
      taxApplied: false,
      taxAmount: 0,
      threshold: NPC_TAX_SOFT_CAP,
      npcPtsBefore: Number.isFinite(npcPtsBefore) ? (npcPtsBefore | 0) : 0,
      notes: []
    };
    const id = String(npcId || "");
    if (!id) {
      res.notes.push("npc_missing");
      res.taxAttempt = { npcId: id, npcPtsBefore: 0, softCapHit: false, notes: res.notes.slice(), eligibleNpcCount: ctx.eligibleNpcCount ?? null, taxedNpcCount: ctx.taxedNpcCount ?? null, totalTaxInWindow: ctx.totalTaxInWindow ?? null };
      if (Game && Game.__D) Game.__D.__lastNpcWealthTaxAttempt = res.taxAttempt;
      return res;
    }
    try {
      if (typeof ensureNpcEconAccounts === "function") {
        const ensureRes = ensureNpcEconAccounts({ reason: "wealth_tax" }) || null;
        if (ensureRes && Number.isFinite(ensureRes.missingAfterCount) && ensureRes.missingAfterCount > 0) {
          res.notes.push("npc_accounts_missing_after_ensure");
          res.ensureMissingAfterCount = ensureRes.missingAfterCount;
          res.taxAttempt = { npcId: id, npcPtsBefore: res.npcPtsBefore, softCapHit: false, notes: res.notes.slice(), eligibleNpcCount: ctx.eligibleNpcCount ?? null, taxedNpcCount: ctx.taxedNpcCount ?? null, totalTaxInWindow: ctx.totalTaxInWindow ?? null };
          if (Game && Game.__D) Game.__D.__lastNpcWealthTaxAttempt = res.taxAttempt;
          return res;
        }
      } else {
        ensureNpcAccountsFromState();
      }
    } catch (e) {
      res.notes.push("npc_account_migrate_failed");
      res.error = String(e && e.message ? e.message : e);
      res.taxAttempt = { npcId: id, npcPtsBefore: res.npcPtsBefore, softCapHit: false, notes: res.notes.slice(), eligibleNpcCount: ctx.eligibleNpcCount ?? null, taxedNpcCount: ctx.taxedNpcCount ?? null, totalTaxInWindow: ctx.totalTaxInWindow ?? null };
      if (Game && Game.__D) Game.__D.__lastNpcWealthTaxAttempt = res.taxAttempt;
      return res;
    }
    const acc = getAccount(id);
    if (!acc) {
      res.notes.push("npc_account_missing");
      res.stage = "npc_account_missing";
      res.taxAttempt = { npcId: id, npcPtsBefore: res.npcPtsBefore, softCapHit: false, notes: res.notes.slice(), eligibleNpcCount: ctx.eligibleNpcCount ?? null, taxedNpcCount: ctx.taxedNpcCount ?? null, totalTaxInWindow: ctx.totalTaxInWindow ?? null };
      if (Game && Game.__D) Game.__D.__lastNpcWealthTaxAttempt = res.taxAttempt;
      return res;
    }
    const isNpc = !!(acc.npc === true || acc.type === "npc" || id.startsWith("npc_"));
    if (!isNpc) {
      res.notes.push("not_npc");
      res.taxAttempt = { npcId: id, npcPtsBefore: res.npcPtsBefore, softCapHit: false, notes: res.notes.slice(), eligibleNpcCount: ctx.eligibleNpcCount ?? null, taxedNpcCount: ctx.taxedNpcCount ?? null, totalTaxInWindow: ctx.totalTaxInWindow ?? null };
      if (Game && Game.__D) Game.__D.__lastNpcWealthTaxAttempt = res.taxAttempt;
      return res;
    }
    let before = Number.isFinite(npcPtsBefore) ? (npcPtsBefore | 0) : (acc.points | 0);
    if (!Number.isFinite(npcPtsBefore) || npcPtsBefore <= 0) {
      before = acc.points | 0;
    }
    res.npcPtsBefore = before;
    if (before <= NPC_TAX_SOFT_CAP) {
      res.notes.push("below_threshold");
      res.taxAttempt = { npcId: id, npcPtsBefore: before, softCapHit: false, notes: res.notes.slice(), eligibleNpcCount: ctx.eligibleNpcCount ?? null, taxedNpcCount: ctx.taxedNpcCount ?? null, totalTaxInWindow: ctx.totalTaxInWindow ?? null };
      if (Game && Game.__D) Game.__D.__lastNpcWealthTaxAttempt = res.taxAttempt;
      return res;
    }
    const bankBal = getWorldBankBalance();
    if (bankBal >= WORLD_BANK_SOFT_CAP) {
      res.notes.push("bank_soft_cap");
      res.bankBalance = bankBal;
      res.taxAttempt = { npcId: id, npcPtsBefore: before, softCapHit: true, notes: res.notes.slice(), eligibleNpcCount: ctx.eligibleNpcCount ?? null, taxedNpcCount: ctx.taxedNpcCount ?? null, totalTaxInWindow: ctx.totalTaxInWindow ?? null };
      if (Game && Game.__D) Game.__D.__lastNpcWealthTaxAttempt = res.taxAttempt;
      return res;
    }
    let taxAmount = 1;
    if (before >= (NPC_TAX_SOFT_CAP + 10)) taxAmount = Math.min(NPC_TAX_MAX_PER_TXN, 2);
    if (taxAmount <= 0) {
      res.notes.push("tax_zero");
      res.taxAttempt = { npcId: id, npcPtsBefore: before, softCapHit: false, notes: res.notes.slice(), eligibleNpcCount: ctx.eligibleNpcCount ?? null, taxedNpcCount: ctx.taxedNpcCount ?? null, totalTaxInWindow: ctx.totalTaxInWindow ?? null };
      if (Game && Game.__D) Game.__D.__lastNpcWealthTaxAttempt = res.taxAttempt;
      return res;
    }
    const curPts = (acc.points | 0);
    if (curPts < taxAmount) {
      res.notes.push("npc_insufficient");
      res.taxAttempt = { npcId: id, npcPtsBefore: before, softCapHit: false, notes: res.notes.slice(), eligibleNpcCount: ctx.eligibleNpcCount ?? null, taxedNpcCount: ctx.taxedNpcCount ?? null, totalTaxInWindow: ctx.totalTaxInWindow ?? null };
      if (Game && Game.__D) Game.__D.__lastNpcWealthTaxAttempt = res.taxAttempt;
      return res;
    }
    const txId = (ctx && ctx.txId) ? ctx.txId : `npc_tax_${Date.now()}_${id}`;
    const meta = Object.assign({}, ctx || {}, {
      kind: "npc_activity_tax",
      threshold: NPC_TAX_SOFT_CAP,
      taxAmount,
      npcPtsBefore: before,
      bankSoftCap: WORLD_BANK_SOFT_CAP,
      bankBalance: bankBal,
      txId
    });
    const metaOut = Object.assign({}, meta, { phase: "tax", direction: "out" });
    const metaIn = Object.assign({}, meta, { phase: "tax", direction: "in", mirror: true });
    const txOut = E.transferPoints(id, WORLD_BANK_ID, taxAmount, "world_tax_out", metaOut);
    if (!txOut || txOut.ok !== true) {
      res.ok = false;
      res.notes.push("tax_transfer_failed");
      res.taxAttempt = { npcId: id, npcPtsBefore: before, softCapHit: false, notes: res.notes.slice(), eligibleNpcCount: ctx.eligibleNpcCount ?? null, taxedNpcCount: ctx.taxedNpcCount ?? null, totalTaxInWindow: ctx.totalTaxInWindow ?? null };
      if (Game && Game.__D) Game.__D.__lastNpcWealthTaxAttempt = res.taxAttempt;
      return res;
    }
    try {
      if (typeof E._logTx === "function") {
        E._logTx({
          time: Date.now(),
          sourceId: String(id),
          targetId: String(WORLD_BANK_ID),
          amount: taxAmount,
          reason: "world_tax_in",
          battleId: metaIn && metaIn.battleId ? metaIn.battleId : null,
          status: metaIn && metaIn.status ? metaIn.status : null,
          phase: metaIn && metaIn.phase ? metaIn.phase : null,
          meta: metaIn
        });
      }
    } catch (_) {}
    res.taxApplied = true;
    res.taxAmount = taxAmount;
    res.taxAttempt = { npcId: id, npcPtsBefore: before, softCapHit: false, notes: res.notes.slice(), eligibleNpcCount: ctx.eligibleNpcCount ?? null, taxedNpcCount: ctx.taxedNpcCount ?? null, totalTaxInWindow: ctx.totalTaxInWindow ?? null };
    if (Game && Game.__D) Game.__D.__lastNpcWealthTaxAttempt = res.taxAttempt;
    return res;
  }

  E.getWorldBankBalance = function (){
    return getWorldBankBalance();
  };

  E.getWorldBankSoftCap = function (){
    return WORLD_BANK_SOFT_CAP;
  };

  E.ensureNpcEconAccounts = function (opts = {}) {
    return ensureNpcEconAccounts(opts);
  };

  E.ensureNpcAccountsFromState = function (opts = {}) {
    return ensureNpcAccountsFromState(opts);
  };

  E.maybeWorldStipendTick = function (opts = {}) {
    const npcIds = Array.isArray(opts.npcIds) ? opts.npcIds.map(id => String(id)) : [];
    const stipendAmount = Number.isFinite(opts.stipendAmount) ? Math.max(1, opts.stipendAmount | 0) : 1;
    const stipendThreshold = Number.isFinite(opts.stipendThreshold) ? (opts.stipendThreshold | 0) : 0;
    const zeroStreakById = (opts.zeroStreakById && typeof opts.zeroStreakById === "object") ? opts.zeroStreakById : null;
    const zeroStreakThreshold = Number.isFinite(opts.zeroStreakThreshold) ? Math.max(1, opts.zeroStreakThreshold | 0) : null;
    const maxRecipients = Number.isFinite(opts.maxRecipientsPerTick) ? Math.max(1, opts.maxRecipientsPerTick | 0) : 5;
    const tick = Number.isFinite(opts.tick) ? (opts.tick | 0) : null;
    const seed = (opts.seed != null) ? opts.seed : null;
    const notes = [];
    const bankBefore = getWorldBankBalance();
    if (bankBefore < stipendAmount) {
      notes.push("bank_empty");
      return { ok: true, notes, paidIds: [], eligibleCount: 0, bankBefore, bankAfter: bankBefore };
    }
    if (!npcIds.length) {
      notes.push("no_npcs");
      return { ok: true, notes, paidIds: [], eligibleCount: 0, bankBefore, bankAfter: bankBefore };
    }

    const eligible = [];
    for (const id of npcIds) {
      const acc = getAccount(id);
      const pts = acc && Number.isFinite(acc.points) ? (acc.points | 0) : 0;
      const z = zeroStreakById ? (zeroStreakById[id] | 0) : 0;
      if (pts <= stipendThreshold) {
        eligible.push(id);
        continue;
      }
      if (zeroStreakById && zeroStreakThreshold != null && z >= zeroStreakThreshold) {
        eligible.push(id);
      }
    }
    if (!eligible.length) {
      notes.push("no_eligible");
      return { ok: true, notes, paidIds: [], eligibleCount: 0, bankBefore, bankAfter: bankBefore };
    }

    const list = eligible.slice();
    if (seed != null) list.sort(() => Math.random() - 0.5);
    const selected = list.slice(0, maxRecipients);
    let bankBal = bankBefore;
    const paidIds = [];
    selected.forEach(id => {
      if (bankBal < stipendAmount) {
        if (!notes.includes("bank_insufficient")) notes.push("bank_insufficient");
        return;
      }
      const acc = getAccount(id);
      const pts = acc && Number.isFinite(acc.points) ? (acc.points | 0) : 0;
      const z = zeroStreakById ? (zeroStreakById[id] | 0) : 0;
      const res = E.transferPoints(WORLD_BANK_ID, id, stipendAmount, "world_stipend_out", {
        tick,
        seed,
        threshold: stipendThreshold,
        amount: stipendAmount,
        eligibility: (pts <= stipendThreshold ? "zero" : "streak"),
        zeroStreak: zeroStreakById ? z : null,
        bankBefore: bankBal,
        bankAfter: bankBal - stipendAmount
      });
      if (res && res.ok) {
        paidIds.push(id);
        bankBal -= stipendAmount;
      }
    });
    const bankAfter = getWorldBankBalance();
    return { ok: true, notes, paidIds, eligibleCount: eligible.length, bankBefore, bankAfter };
  };

  function getProgression() {
    const P = (Game.Data && Game.Data.PROGRESSION) ? Game.Data.PROGRESSION : null;
    const winsPerInfluence = (P && Number.isFinite(P.winsPerInfluence)) ? (P.winsPerInfluence | 0) : 5;
    const unlock = (P && P.unlockInfluence) ? P.unlockInfluence : {};
    const strong = (unlock && Number.isFinite(unlock.strong)) ? (unlock.strong | 0) : 5;
    const power = (unlock && Number.isFinite(unlock.power)) ? (unlock.power | 0) : 10;
    const absolute = (unlock && Number.isFinite(unlock.absolute)) ? (unlock.absolute | 0) : 100;
    return {
      winsPerInfluence: Math.max(1, winsPerInfluence),
      unlockInfluence: {
        strong: Math.max(0, strong),
        power: Math.max(0, power),
        absolute: Math.max(0, absolute),
      }
    };
  }

  function getWinsCountForProgress(playerId){
    const S = Game.__S || null;
    const list = (S && Array.isArray(S.battles)) ? S.battles : [];
    if (!list.length) return 0;
    const pid = (playerId != null) ? String(playerId) : "me";
    let wins = 0;
    for (const b of list) {
      if (!b) continue;
      const resolved = !!(b.finished || b.resolved || b.status === "finished");
      if (!resolved) continue;
      const outcome = String(b.result || "").toLowerCase();
      if (!outcome || outcome === "draw") continue;
      if (outcome !== "win" && outcome !== "lose") continue;
      if (pid === "me") {
        if (outcome === "win") wins += 1;
      } else {
        const oppId = b.opponentId != null ? String(b.opponentId) : "";
        if (oppId && oppId === pid && outcome === "lose") wins += 1;
      }
    }
    return wins;
  }

  const WIN_PROGRESS_REP_TABLE = Object.freeze({
    10: 2,
    20: 1,
    30: 1,
    40: 1,
    50: 0
  });

  function getWinProgressThreshold(winsCount){
    const wins = Number.isFinite(winsCount) ? (winsCount | 0) : 0;
    if (wins < 10) return null;
    const threshold = Math.floor(wins / 10) * 10;
    return threshold >= 10 ? threshold : null;
  }

  function getRepRewardForWinThreshold(threshold){
    const key = Number.isFinite(threshold) ? (threshold | 0) : 0;
    if (!key) return 0;
    return Number.isFinite(WIN_PROGRESS_REP_TABLE[key]) ? (WIN_PROGRESS_REP_TABLE[key] | 0) : 0;
  }

  function buildWinProgressRewardMeta({ playerId, winsCount } = {}){
    const pid = (playerId != null) ? String(playerId) : "me";
    const wins = Number.isFinite(winsCount) ? (winsCount | 0) : getWinsCountForProgress(pid);
    const threshold = getWinProgressThreshold(wins);
    const amount = getRepRewardForWinThreshold(threshold);
    const state = getWinProgressAwardState(pid);
    const alreadyAwarded = !!(state && state.thresholds && state.thresholds[threshold]);
    const shouldGrant = !!(threshold && amount > 0 && !alreadyAwarded);
    return {
      eligible: !!(threshold && amount > 0),
      threshold,
      amount,
      alreadyAwarded,
      shouldGrant,
      reasonKey: "rep_win_progress_threshold",
      notes: []
    };
  }

  function winProgressRewardKey(playerId, threshold){
    const pid = (playerId != null) ? String(playerId) : "me";
    const t = Number.isFinite(threshold) ? (threshold | 0) : 0;
    return `win_progress|${pid}|${t}`;
  }

  function getWinProgressAwardState(playerId){
    const S = Game.__S || (Game.__S = {});
    if (!S.progress || typeof S.progress !== "object") S.progress = {};
    const store = S.progress.winProgressAwarded && typeof S.progress.winProgressAwarded === "object"
      ? S.progress.winProgressAwarded
      : (S.progress.winProgressAwarded = {});
    const pid = (playerId != null) ? String(playerId) : "me";
    const entry = (store[pid] && typeof store[pid] === "object") ? store[pid] : (store[pid] = {});
    if (!entry.thresholds || typeof entry.thresholds !== "object") entry.thresholds = {};
    if (!entry.meta || typeof entry.meta !== "object") entry.meta = {};
    return entry;
  }

  function markWinProgressAwarded(playerId, threshold, meta){
    const t = Number.isFinite(threshold) ? (threshold | 0) : 0;
    if (!t) return false;
    const state = getWinProgressAwardState(playerId);
    state.thresholds[t] = true;
    const info = Object.assign({}, meta || {});
    if (!info.ts) info.ts = Date.now();
    state.meta[t] = info;
    return true;
  }

  function maybeGrantWinProgressRep({ playerId, battleId, outcome } = {}){
    const pid = (playerId != null) ? String(playerId) : "me";
    const out = String(outcome || "").toLowerCase();
    const result = { didGrant: false, threshold: null, amount: 0, reason: "rep_win_progress_threshold", idempotencyKey: null, notes: [] };
    if (out !== "win") return result;
    const bid = battleId != null ? String(battleId) : "";
    if (!bid) {
      result.notes.push("missing_battleId");
      return result;
    }
    if (bid) {
      const S = Game.__S || null;
      const list = (S && Array.isArray(S.battles)) ? S.battles : [];
      const b = list.find(x => x && String(x.id || x.battleId || "") === bid) || null;
      if (b && !(b.finished || b.resolved || b.status === "finished")) {
        result.notes.push("battle_not_resolved");
        return result;
      }
    }
    const meta = buildWinProgressRewardMeta({ playerId: pid });
    result.threshold = meta.threshold;
    result.amount = meta.amount | 0;
    result.idempotencyKey = winProgressRewardKey(pid, meta.threshold);
    if (!meta.shouldGrant) {
      result.notes.push(meta.alreadyAwarded ? "already_awarded" : "not_eligible");
      return result;
    }
    if (!(meta.amount > 0)) return result;
    const transferRep = (Game.__A && typeof Game.__A.transferRep === "function")
      ? Game.__A.transferRep
      : null;
    if (!transferRep) {
      result.notes.push("transferRep_missing");
      return result;
    }
    const winsCount = getWinsCountForProgress(pid);
    const grantMeta = {
      playerId: pid,
      battleId: bid || null,
      winsCount,
      threshold: meta.threshold,
      amount: meta.amount,
      idempotencyKey: result.idempotencyKey
    };
    const tx = transferRep("rep_emitter", pid, meta.amount, result.reason, bid || null, grantMeta);
    if (tx && tx.ok === false) {
      result.notes.push("transferRep_failed");
      return result;
    }
    markWinProgressAwarded(pid, meta.threshold, { battleId: bid || null, winsCount });
    result.didGrant = true;
    return result;
  }

  // Start cost: starting a battle costs 1 point.
  // Applied exactly once per battle, and only when the player initiates the battle.
  E.applyStart = function (battle) {
    if (!battle) return;
    if (battle.startCostApplied) return;
    if (battle.id && startCostAppliedById[battle.id]) return;
    battle.startCostApplied = true;
    if (battle.id) startCostAppliedById[battle.id] = true;

    const me = Game.__S && Game.__S.me ? Game.__S.me : null;
    if (!me) return;

    if (isCirculationEnabled()) {
      const D = getData();
      const base = (D && Number.isFinite(D.BATTLE_ENTRY_COST)) ? (D.BATTLE_ENTRY_COST | 0) : 1;
      const richAt = (D && Number.isFinite(D.RICH_THRESHOLD)) ? (D.RICH_THRESHOLD | 0) : 20;
      const richExtra = 1;
      const fromThem =
        battle.fromThem === true ||
        battle.incoming === true ||
        (battle.status === "pickDefense" && !battle.attackerId);
      let initiatorId = battle.attackerId || null;
      if (fromThem) initiatorId = battle.opponentId || initiatorId;
      if (!initiatorId) initiatorId = "me";
      const initiator = getAccount(initiatorId);
      if (!initiator) return;
      const before = (initiator.points | 0);
      const rich = before >= richAt;
      let amount = rich ? (base + richExtra) : base;
      amount = Math.max(1, amount | 0);
      if (before <= 0) return;
      if (amount > before) amount = before;
      const idStr = String(initiatorId || "");
      const isNpc = initiatorId !== "me" && (initiator.npc === true || initiator.type === "npc" || idStr.startsWith("npc_"));
      const reason = rich
        ? (isNpc ? "battle_entry_npc_rich" : "battle_entry_rich")
        : (isNpc ? "battle_entry_npc" : "battle_entry");
      const required = rich ? (base + richExtra) : base;
      const tickId = (battle && battle.tickId != null)
        ? battle.tickId
        : (battle && battle.tick != null)
          ? battle.tick
          : null;
      if (isNpc && (before <= 0 || before < required)) {
        logNpcSkipLowFunds({
          npcId: initiatorId,
          ptsBefore: before,
          need: required,
          actionKey: "battle_entry",
          priceKey: reason,
          mult: 1,
          contextId: battle.id || battle.battleId || null,
          tickId,
          idempotencyKey: `npc_skip_low_funds|${String(tickId || "")}|${String(initiatorId || "")}|battle_entry`
        });
        return;
      }
      E.transferPoints(initiatorId, "sink", amount, reason, { battleId: battle.id || battle.battleId || null, status: battle.status || null, phase: battle.phase || null });
      if (isNpc) {
        applyNpcWealthTaxIfNeeded(initiatorId, before, {
          sourceReason: reason,
          battleId: battle.id || battle.battleId || null,
          status: battle.status || null,
          phase: battle.phase || null
        });
      }
      return;
    }

    markLegacyEconHit("conflict_economy.applyStart.legacy");
    // If the battle is incoming (NPC attacked), there is no start cost in legacy mode.
    if (battle.fromThem === true) return;
    const spend = (Game.__A && typeof Game.__A.spendPoints === "function")
      ? Game.__A.spendPoints
      : null;
    if (spend) spend(1, "battle_start");
    else {
      if (typeof me.points !== "number") me.points = 0;
      const before = (me.points | 0);
      const after = Math.max(0, before - 1);
      me.points = after;
      try {
        if (Game && Game.__A && typeof Game.__A.emitStatDelta === "function") {
          Game.__A.emitStatDelta("points", (after - before) | 0, { reason: "battle_start", battleId: battle && (battle.id || battle.battleId || null) });
        }
      } catch (_) {}
    }

    try {
      if (Game.__A && typeof Game.__A.ensureNonNegativePoints === "function") {
        Game.__A.ensureNonNegativePoints();
      }
      if (Game.__A && typeof Game.__A.syncMeToPlayers === "function") {
        Game.__A.syncMeToPlayers();
      }
    } catch (_) {}
  };

  function sysText(key, fallback) {
    try {
      const SYS = Game.Data && Game.Data.SYS ? Game.Data.SYS : null;
      if (SYS && typeof SYS[key] === "string") return SYS[key];
    } catch (_) {}
    return fallback;
  }

  function pushSystem(line) {
    try {
      if (Game.UI && typeof Game.UI.pushSystem === "function") {
        Game.UI.pushSystem(line);
      } else if (Game.__A && typeof Game.__A.pushChat === "function") {
        // keep perfect punctuation for system lines
        Game.__A.pushChat("Система", line, { system: true });
      }
    } catch (_) {}
  }

  function ensureUnlockFlags(me) {
    if (!me) return;
    if (typeof me.unlockOrange !== "boolean") me.unlockOrange = false;
    if (typeof me.unlockRed !== "boolean") me.unlockRed = false;
    if (typeof me.unlockBlack !== "boolean") me.unlockBlack = false;
    if (typeof me.winsSinceInfluence !== "number") me.winsSinceInfluence = 0;
  }

  function maybeUnlocks(me) {
    if (!me) return;
    ensureUnlockFlags(me);

    const prog = getProgression();
    const inf = me.influence | 0;

    // Strong (orange)
    if (!me.unlockOrange && inf >= prog.unlockInfluence.strong) {
      me.unlockOrange = true;
      pushSystem(sysText("unlockOrange", "Твои аргументы стали сильными."));
    }

    // Powerful (red)
    if (!me.unlockRed && inf >= prog.unlockInfluence.power) {
      me.unlockRed = true;
      pushSystem(sysText("unlockRed", "Твои аргументы стали мощными."));
    }

    // Absolute (black)
    if (!me.unlockBlack && inf >= prog.unlockInfluence.absolute) {
      me.unlockBlack = true;
      pushSystem(sysText("unlockBlack", "Твои аргументы стали абсолютными."));
    }
  }

  // Apply economy based on battle result.
  // Must be applied exactly once per battle (battle.economyApplied).
  // Task A: функция вычисления разницы сил по тону
  function getToneDelta(battle) {
    const tonePower = { y: 1, o: 2, r: 3, k: 4 };
    const normColor = (c) => {
      if (!c) return "y";
      const s = String(c).toLowerCase();
      if (s === "yellow") return "y";
      if (s === "orange") return "o";
      if (s === "red") return "r";
      if (s === "black") return "k";
      return s.charAt(0);
    };
    
    const myColor = battle.defense && battle.defense.color 
      ? normColor(battle.defense.color) 
      : (battle.myColor ? normColor(battle.myColor) : "y");
    const oppColor = battle.attack && battle.attack.color 
      ? normColor(battle.attack.color)
      : (battle.oppColor ? normColor(battle.oppColor) : "y");
    
    const myPower = tonePower[myColor] || 1;
    const oppPower = tonePower[oppColor] || 1;
    
    return myPower - oppPower;
  }

  E.applyResult = function (battle) {
    if (!battle) return;
    if (battle.economyApplied) return;
    battle.economyApplied = true;

    const me = Game.__S && Game.__S.me ? Game.__S.me : null;
    if (!me) return;

    if (typeof me.points !== "number") me.points = 0;
    if (typeof me.wins !== "number") me.wins = 0;
    if (typeof me.influence !== "number") me.influence = 0;
    if (typeof me.winsSinceInfluence !== "number") me.winsSinceInfluence = 0;

    const res = String(battle.result || "");

    const D = (Game && Game.Data) ? Game.Data : null;
    const addPts = (Game.__A && typeof Game.__A.addPoints === "function")
      ? Game.__A.addPoints
      : null;

    const transferRep = (Game.__A && typeof Game.__A.transferRep === "function")
      ? Game.__A.transferRep
      : null;
    const dailyBonus = (Game.__A && typeof Game.__A.maybeDailyRepBonus === "function")
      ? Game.__A.maybeDailyRepBonus
      : null;

    function syncAndRenderNow(){
      try {
        if (Game.__A && typeof Game.__A.syncMeToPlayers === "function") {
          Game.__A.syncMeToPlayers();
        }
      } catch (_) {}
      // Force immediate UI update so stat counters + delta-toasts update instantly.
      try {
        if (Game.UI && typeof Game.UI.requestRenderAll === "function") {
          Game.UI.requestRenderAll();
        }
      } catch (_) {}
    }

    if (res === "win") {
      if (isCirculationEnabled()) {
        const D0 = getData();
        const take = (D0 && Number.isFinite(D0.BATTLE_WIN_TAKE)) ? (D0.BATTLE_WIN_TAKE | 0) : 2;
        const richAt = (D0 && Number.isFinite(D0.RICH_THRESHOLD)) ? (D0.RICH_THRESHOLD | 0) : 20;
        const richExtra = (D0 && Number.isFinite(D0.RICH_LOSS_EXTRA)) ? (D0.RICH_LOSS_EXTRA | 0) : 1;
        const oppId = battle.opponentId || null;
        const winnerId = "me";
        const loserId = oppId || "opponent";
        const loser = getAccount(loserId);
        const before = loser ? (loser.points | 0) : 0;
        if (loser && before > 0) {
          let amount = take > 0 ? take : 1;
          if (amount > before) amount = before;
          E.transferPoints(loserId, winnerId, amount, "battle_win_take", { battleId: battle.id || battle.battleId || null, status: battle.status || null, result: battle.result || null });
          if (before >= richAt && richExtra > 0) {
            const after = (loser.points | 0);
            let extra = richExtra;
            if (extra > after) extra = after;
            if (extra > 0) {
              E.transferPoints(loserId, winnerId, extra, "battle_rich_loss_extra", { battleId: battle.id || battle.battleId || null, status: battle.status || null, result: battle.result || null });
            }
          }
        }
        // Wins are progression; must increment in both economy modes.
        try {
          const beforeWins = (me.wins | 0);
          me.wins = beforeWins + 1;
          if (Game && Game.__A && typeof Game.__A.emitStatDelta === "function") {
            Game.__A.emitStatDelta("wins", 1, { reason: "battle_win", battleId: battle.id || battle.battleId || null });
          }
        } catch (_) { try { me.wins += 1; } catch (_) {} }
        try { maybeUnlocks(me); } catch (_) {}
        try {
          maybeGrantWinProgressRep({
            playerId: "me",
            battleId: battle.id || battle.battleId || null,
            outcome: "win"
          });
        } catch (_) {}
        
        // Task A: REP за исход по разнице сил Δ (победа)
        if (transferRep) {
          const delta = getToneDelta(battle);
          let repGain = 0;
          if (delta >= 2) repGain = 0;
          else if (Math.abs(delta) <= 1) repGain = 1;
          else if (delta <= -2) repGain = 2;
          if (repGain > 0) {
            transferRep("crowd_pool", "me", repGain, "rep_battle_win_delta", battle.id || battle.battleId || null);
          }
        }
        
        syncAndRenderNow();
        if (dailyBonus) dailyBonus();
        return;
      } else {
      markLegacyEconHit("conflict_economy.applyResult.win.legacy");
      const prog = getProgression();

      const PRESSURE_HIGH_TONE = new Set(["r", "k"]);
      const PRESSURE_WEAK_TONE = new Set(["y", "o"]);
      const INF_PRESSURE_WIN_COST = 1;
      const REP_PRESSURE_WIN_CAP = 0;
      const REP_PRESSURE_WIN_REASON = "rep_pressure_win_cap";

      // Rewards
      const gain = (D && Number.isFinite(D.POINTS_WIN)) ? (D.POINTS_WIN | 0) : 3;
      if (addPts) addPts(gain, "battle_win");
      else {
        const beforePts = (me.points | 0);
        me.points = Math.max(0, beforePts + gain);
        try {
          if (Game && Game.__A && typeof Game.__A.emitStatDelta === "function") {
            Game.__A.emitStatDelta("points", (me.points | 0) - beforePts, { reason: "battle_win", battleId: battle.id || battle.battleId || null });
          }
        } catch (_) {}
      }
      try {
        me.wins = (me.wins | 0) + 1;
        if (Game && Game.__A && typeof Game.__A.emitStatDelta === "function") {
          Game.__A.emitStatDelta("wins", 1, { reason: "battle_win", battleId: battle.id || battle.battleId || null });
        }
      } catch (_) { try { me.wins += 1; } catch (_) {} }
      
      // Task F: убрать тост "Победа!" (оставлен только для legacy режима, но закомментирован)
      // try {
      //   if (Game.UI && typeof Game.UI.pushSystem === "function") {
      //     Game.UI.pushSystem(`🏆 Победа!`);
      //   }
      // } catch (_) {}

      // Task A: REP за исход по разнице сил Δ (победа, legacy режим)
      let repGain = 0;
      const delta = getToneDelta(battle);
      if (delta >= 2) repGain = 0;
      else if (Math.abs(delta) <= 1) repGain = 1;
      else if (delta <= -2) repGain = 2;
      try {
        const opp = (Game.__S && Game.__S.players && battle.opponentId) ? Game.__S.players[battle.opponentId] : null;
        const oppInf = (opp && Number.isFinite(opp.influence)) ? (opp.influence | 0) : 0;
        const myInf = (me && Number.isFinite(me.influence)) ? (me.influence | 0) : 0;
        const tierDiff = oppInf - myInf;
        
        // Bonus for beating stronger opponent
        if (tierDiff > 0) {
          const bonus = (D && Number.isFinite(D.REP_WIN_TIER_BONUS)) ? (D.REP_WIN_TIER_BONUS | 0) : 3;
          repGain = bonus;
        }
      } catch (_) {}

      // Wave 4: tone as pressure (pressure-on-win) for me.
      try {
        const myArg = (battle.fromThem === true) ? battle.defense : battle.attack;
        const oppArg = (battle.fromThem === true) ? battle.attack : battle.defense;
        const myColor = myArg ? String(myArg._color != null ? myArg._color : myArg.color || "").toLowerCase() : "";
        const oppColor = oppArg ? String(oppArg._color != null ? oppArg._color : oppArg.color || "").toLowerCase() : "";
        const isHighTone = PRESSURE_HIGH_TONE.has(myColor);
        const isWeakOpp = PRESSURE_WEAK_TONE.has(oppColor);
        if (isHighTone && isWeakOpp) {
          const beforeInf = (me.influence | 0);
          const afterInf = Math.max(0, beforeInf - (INF_PRESSURE_WIN_COST | 0));
          me.influence = afterInf;
          try {
            if (Game && Game.__A && typeof Game.__A.emitStatDelta === "function") {
              Game.__A.emitStatDelta("influence", (afterInf - beforeInf) | 0, { reason: "inf_pressure_win", battleId: battle.id || battle.battleId || null });
            }
          } catch (_) {}
          if (repGain > REP_PRESSURE_WIN_CAP) repGain = REP_PRESSURE_WIN_CAP;
          if (repGain <= 0) {
            logTransfer({
              time: Date.now(),
              sourceId: String(battle.opponentId || "opponent"),
              targetId: "me",
              amount: 0,
              reason: REP_PRESSURE_WIN_REASON,
              battleId: battle.id || battle.battleId || null,
              currency: "rep",
              meta: { cap: REP_PRESSURE_WIN_CAP, myColor, oppColor }
            });
          }
        }
      } catch (_) {}

      if (transferRep && repGain > 0 && battle.opponentId) {
        transferRep("crowd_pool", "me", repGain, "rep_battle_win", battle.id || battle.battleId || null);
      }
      
      maybeUnlocks(me);
      try {
        maybeGrantWinProgressRep({
          playerId: "me",
          battleId: battle.id || battle.battleId || null,
          outcome: "win"
        });
      } catch (_) {}

      try {
        if (Game.__A && typeof Game.__A.syncMeToPlayers === "function") {
          Game.__A.syncMeToPlayers();
        }
      } catch (_) {}

      // Force immediate UI update (fixes instant stats/toasts)
      try {
        if (Game.UI && typeof Game.UI.requestRenderAll === "function") {
          Game.UI.requestRenderAll();
        }
      } catch (_) {}

      // Award +2 points on victory (legacy): contributes to overPoints / badge
      try {
        if (addPts) {
          addPts(2, "battle_win_points");
        } else if (Game && Game.__A && typeof Game.__A.addPoints === "function") {
          Game.__A.addPoints(2, "battle_win_points");
        }
      } catch (_) {}

      if (dailyBonus) dailyBonus();
      return;
      }
      return;
    }

    if (res === "lose") {
      if (isCirculationEnabled()) {
        const D0 = getData();
        const take = (D0 && Number.isFinite(D0.BATTLE_WIN_TAKE)) ? (D0.BATTLE_WIN_TAKE | 0) : 2;
        const richAt = (D0 && Number.isFinite(D0.RICH_THRESHOLD)) ? (D0.RICH_THRESHOLD | 0) : 20;
        const richExtra = (D0 && Number.isFinite(D0.RICH_LOSS_EXTRA)) ? (D0.RICH_LOSS_EXTRA | 0) : 1;
        const oppId = battle.opponentId || null;
        const winnerId = oppId || "opponent";
        const loserId = "me";
        const winner = getAccount(winnerId);
        const winnerBefore = winner ? (winner.points | 0) : 0;
        const loser = getAccount(loserId);
        const before = loser ? (loser.points | 0) : 0;
        if (loser && before > 0) {
          let amount = take > 0 ? take : 1;
          if (amount > before) amount = before;
          E.transferPoints(loserId, winnerId, amount, "battle_win_take", { battleId: battle.id || battle.battleId || null, status: battle.status || null, result: battle.result || null });
          if (before >= richAt && richExtra > 0) {
            const after = (loser.points | 0);
            let extra = richExtra;
            if (extra > after) extra = after;
            if (extra > 0) {
              E.transferPoints(loserId, winnerId, extra, "battle_rich_loss_extra", { battleId: battle.id || battle.battleId || null, status: battle.status || null, result: battle.result || null });
            }
          }
        }
        if (winner && (winner.npc === true || winner.type === "npc" || String(winnerId).startsWith("npc_"))) {
          applyNpcWealthTaxIfNeeded(winnerId, winnerBefore, {
            sourceReason: "battle_win_take",
            battleId: battle.id || battle.battleId || null,
            status: battle.status || null,
            result: battle.result || null
          });
        }
        
        // Task A: REP за исход по разнице сил Δ (поражение)
        if (transferRep) {
          const delta = getToneDelta(battle);
          if (delta <= -2) {
            // Проиграл более сильному: +1 REP
            transferRep("crowd_pool", "me", 1, "rep_battle_lose_delta", battle.id || battle.battleId || null);
          } else if (Math.abs(delta) <= 1) {
            // Проиграл равному: -1 REP (only if available)
            if ((Game && Game.__S && Number.isFinite(Game.__S.rep)) ? (Game.__S.rep | 0) : 0 >= 1) {
              transferRep("me", "crowd_pool", 1, "rep_battle_lose_delta", battle.id || battle.battleId || null);
            }
          } else if (delta >= 2) {
            // Проиграл более слабому: -2 REP (only if available)
            if ((Game && Game.__S && Number.isFinite(Game.__S.rep)) ? (Game.__S.rep | 0) : 0 >= 2) {
              transferRep("me", "crowd_pool", 2, "rep_battle_lose_delta", battle.id || battle.battleId || null);
            }
          }
        }
        
        syncAndRenderNow();
        if (dailyBonus) dailyBonus();
        return;
      } else {
      markLegacyEconHit("conflict_economy.applyResult.lose.legacy");
      const gain = (D && Number.isFinite(D.POINTS_LOSE)) ? (D.POINTS_LOSE | 0) : 1;
      if (addPts) addPts(gain, "battle_lose");
      else {
        const beforePts = (me.points | 0);
        me.points = Math.max(0, beforePts + gain);
        try {
          if (Game && Game.__A && typeof Game.__A.emitStatDelta === "function") {
            Game.__A.emitStatDelta("points", (me.points | 0) - beforePts, { reason: "battle_lose", battleId: battle.id || battle.battleId || null });
          }
        } catch (_) {}
      }

      // Task A: REP за исход по разнице сил Δ (поражение, legacy режим)
      if (transferRep && battle.opponentId) {
        const delta = getToneDelta(battle);
        if (delta <= -2) {
          // Проиграл более сильному: +1 REP
          transferRep("crowd_pool", "me", 1, "rep_battle_lose_delta", battle.id || battle.battleId || null);
        } else if (Math.abs(delta) <= 1) {
          // Проиграл равному: -1 REP (only if available)
          if ((Game && Game.__S && Number.isFinite(Game.__S.rep)) ? (Game.__S.rep | 0) : 0 >= 1) {
            transferRep("me", "crowd_pool", 1, "rep_battle_lose_delta", battle.id || battle.battleId || null);
          }
        } else if (delta >= 2) {
          // Проиграл более слабому: -2 REP (only if available)
          if ((Game && Game.__S && Number.isFinite(Game.__S.rep)) ? (Game.__S.rep | 0) : 0 >= 2) {
            transferRep("me", "crowd_pool", 2, "rep_battle_lose_delta", battle.id || battle.battleId || null);
          }
        }
      }

      if (dailyBonus) dailyBonus();

      try {
        if (Game.__A && typeof Game.__A.syncMeToPlayers === "function") {
          Game.__A.syncMeToPlayers();
        }
      } catch (_) {}

      // Force immediate UI update (fixes instant stats/toasts)
      try {
        if (Game.UI && typeof Game.UI.requestRenderAll === "function") {
          Game.UI.requestRenderAll();
        }
      } catch (_) {}

      return;
      }
      return;
    }

    if (res === "draw") {
      if (isCirculationEnabled()) {
        const D0 = getData();
        const deposit = (D0 && Number.isFinite(D0.DRAW_CROWD_DEPOSIT)) ? (D0.DRAW_CROWD_DEPOSIT | 0) : 1;
        const oppId = battle.opponentId || null;
        const poolId = E.getCrowdPoolId(battle.id || battle.battleId || null);
        const meAcc = getAccount("me");
        const oppAcc = getAccount(oppId || "opponent");
        if (meAcc) {
          let amt = deposit > 0 ? deposit : 1;
          const before = (meAcc.points | 0);
          if (before > 0) {
            if (amt > before) amt = before;
            E.transferPoints("me", poolId, amt, "battle_draw_deposit", { battleId: battle.id || battle.battleId || null, status: battle.status || null, result: battle.result || null });
          }
        }
        if (oppAcc && oppId) {
          let amt = deposit > 0 ? deposit : 1;
          const before = (oppAcc.points | 0);
          if (before > 0) {
            if (amt > before) amt = before;
            E.transferPoints(oppId, poolId, amt, "battle_draw_deposit_opponent", { battleId: battle.id || battle.battleId || null, status: battle.status || null, result: battle.result || null });
          }
        }
        // Circulation mode: also grant REP for draw if configured (mirror legacy behavior).
        try {
          const repGain = (D0 && Number.isFinite(D0.REP_DRAW)) ? (D0.REP_DRAW | 0) : 0;
          if (repGain > 0 && Game && Game.__A && typeof Game.__A.transferRep === "function") {
            Game.__A.transferRep("crowd_pool", "me", repGain, "rep_battle_draw", battle.id || battle.battleId || null);
          }
        } catch (_) {}
        syncAndRenderNow();
        if (dailyBonus) dailyBonus();
        return;
      } else {
      markLegacyEconHit("conflict_economy.applyResult.draw.legacy");
      const gain = (D && Number.isFinite(D.POINTS_DRAW)) ? (D.POINTS_DRAW | 0) : 2;
      if (addPts) addPts(gain, "battle_draw");
      else {
        const beforePts = (me.points | 0);
        me.points = Math.max(0, beforePts + gain);
        try {
          if (Game && Game.__A && typeof Game.__A.emitStatDelta === "function") {
            Game.__A.emitStatDelta("points", (me.points | 0) - beforePts, { reason: "battle_draw", battleId: battle.id || battle.battleId || null });
          }
        } catch (_) {}
      }
      
      // REP v2 economy: draw reward
      const repGain = (D && Number.isFinite(D.REP_DRAW)) ? (D.REP_DRAW | 0) : 1;
      if (transferRep && repGain > 0 && battle.opponentId) {
        transferRep("crowd_pool", "me", repGain, "rep_battle_draw", battle.id || battle.battleId || null);
      }

      if (dailyBonus) dailyBonus();
      return;
      }
      return;
    }

    // escaped / unresolved: no base economy changes here
  };

  // Expose helper for UI if needed
  E.maybeUnlocks = function () {
    const me = Game.__S && Game.__S.me ? Game.__S.me : null;
    if (!me) return;
    maybeUnlocks(me);
  };

  E.getWinsCountForProgress = getWinsCountForProgress;
  E.getWinProgressThreshold = getWinProgressThreshold;
  E.getRepRewardForWinThreshold = getRepRewardForWinThreshold;
  E.buildWinProgressRewardMeta = buildWinProgressRewardMeta;
  E.winProgressRewardKey = winProgressRewardKey;
  E.getWinProgressAwardState = getWinProgressAwardState;
  E.markWinProgressAwarded = markWinProgressAwarded;
  E.maybeGrantWinProgressRep = maybeGrantWinProgressRep;
  E.WIN_PROGRESS_REP_TABLE = WIN_PROGRESS_REP_TABLE;
  E.applyNpcWealthTaxIfNeeded = applyNpcWealthTaxIfNeeded;
  E.NPC_TAX_SOFT_CAP = NPC_TAX_SOFT_CAP;
  E.isCirculationEnabled = E.isCirculationEnabled || isCirculationEnabled;
  E._logTx = E._logTx || logTransfer;
  Game._ConflictEconomy = E;
  Game.ConflictEconomy = E;
  Game.Econ = Game.Econ || {};
  Game.Econ.requestP2PTransfer = function ({ sourceId, targetId, amount } = {}) {
    const amt = Number(amount || 0);
    const src = String(sourceId || "");
    const tgt = String(targetId || "");
    const details = { sourceId: src, targetId: tgt, amount: amt, allowNpc: true };
    const isSystemAccountId = (id) => (
      id === "sink"
      || id === "crowd"
      || id === BANK_ACCOUNT_ID
      || id === WORLD_BANK_ID
      || id.startsWith("crowd:")
    );
    if (!Number.isFinite(amt) || amt <= 0) return { ok: false, reason: "p2p_invalid_amount", details };
    if (!src || !tgt) return { ok: false, reason: "p2p_invalid_amount", details };
    if (src === tgt) return { ok: false, reason: "p2p_self_transfer_forbidden", details };
    if (Game && Game.Rules && typeof Game.Rules.isP2PTransfersEnabled === "function") {
      if (!Game.Rules.isP2PTransfersEnabled()) return { ok: false, reason: "p2p_disabled", details };
    }
    const srcIsPlayer = !isNpcId(src) && !isSystemAccountId(src);
    const tgtIsPlayer = !isNpcId(tgt) && !isSystemAccountId(tgt);
    const playerToPlayerAllowed = (Game && Game.Rules && typeof Game.Rules.isP2PPlayerToPlayerEnabled === "function")
      ? Game.Rules.isP2PPlayerToPlayerEnabled()
      : false;
    if (srcIsPlayer && tgtIsPlayer && !playerToPlayerAllowed) {
      ensureDebugStore();
      logTransfer({
        time: Date.now(),
        sourceId: src,
        targetId: tgt,
        amount: 0,
        reason: "p2p_transfer_attempt_blocked",
        meta: { sourceId: src, targetId: tgt, why: "player_to_player_disabled" }
      });
      return { ok: false, reason: "p2p_player_to_player_disabled", details };
    }
    const srcAcc = getAccount(src);
    const tgtAcc = getAccount(tgt);
    if (!srcAcc || !tgtAcc) return { ok: false, reason: "p2p_invalid_amount", details };
    const srcBal = (srcAcc.points | 0);
    details.sourceBalance = srcBal;
    if (srcBal < (amt | 0)) return { ok: false, reason: "p2p_insufficient_points", details };
    const rlKey = `p2p:${src}->${tgt}`;
    const windowMs = 60000;
    const limit = 1;
    const now = Date.now();
    if (!E._p2pRateLimit) E._p2pRateLimit = new Map();
    const last = E._p2pRateLimit.get(rlKey);
    if (Number.isFinite(last) && (now - last) < windowMs) {
      const retryInMs = Math.max(0, windowMs - (now - last));
      ensureDebugStore();
      logTransfer({
        time: now,
        sourceId: src,
        targetId: tgt,
        amount: 0,
        reason: "p2p_transfer_rate_limited",
        meta: {
          sourceId: src,
          targetId: tgt,
          rlKey,
          windowMs,
          limit,
          retryInMs
        }
      });
      return { ok: false, reason: "p2p_transfer_rate_limited", rlKey, retryInMs };
    }
    const tx = E.transferPoints(src, tgt, amt, "p2p_transfer", {});
    if (tx && typeof tx === "object") {
      if (!tx.meta) tx.meta = {};
      tx.meta.allowNpc = true;
    }
    if (tx && tx.ok === true) {
      E._p2pRateLimit.set(rlKey, now);
    }
    return tx;
  };

  try { ensureNpcAccountsFromState({ reason: "init" }); } catch (_) {}

  const bankState = { override: null };

  function readDevBankConfigFlag(){
    if (!isDevFlag()) return null;
    try {
      const devCfg = (Game && Game.Dev && Game.Dev.config) ? Game.Dev.config : null;
      if (devCfg && typeof devCfg.bankEnabled !== "undefined") {
        return devCfg.bankEnabled === true;
      }
    } catch (_) {}
    try {
      const devSurf = (Game && Game.__DEV) ? Game.__DEV : null;
      if (devSurf && typeof devSurf.bankEnabled !== "undefined") {
        return devSurf.bankEnabled === true;
      }
    } catch (_) {}
    try {
      if (typeof window !== "undefined" && window.__DEV_CONFIG__ && typeof window.__DEV_CONFIG__.bankEnabled !== "undefined") {
        return window.__DEV_CONFIG__.bankEnabled === true;
      }
    } catch (_) {}
    return null;
  }

  function resolveBankEnabled(){
    if (bankState.override != null) return bankState.override === true;
    const configFlag = readDevBankConfigFlag();
    if (configFlag != null) return configFlag === true;
    return false;
  }

  function logBankDisabledAttempt(operation, ctx = {}){
    try {
      const fromId = String(ctx.fromId || ctx.sourceId || "me");
      const toId = String(ctx.toId || ctx.targetId || BANK_ACCOUNT_ID);
      const logMeta = Object.assign({}, ctx.meta || {});
      logMeta.operation = operation;
      logMeta.status = "bank_disabled";
      logMeta.bankEnabled = false;
      if (typeof ctx.amount !== "undefined") logMeta.amount = ctx.amount;
      logTransfer({
        time: Date.now(),
        sourceId: fromId,
        targetId: toId,
        amount: 0,
        reason: "bank_disabled_attempt",
        meta: logMeta
      });
    } catch (_) {}
  }

  const Bank = {
    get enabled(){
      return resolveBankEnabled();
    },
    isEnabled(){
      return this.enabled;
    },
    setEnabledForDev(value){
      if (!isDevFlag()) return { ok: false, reason: "not_dev" };
      bankState.override = value === true;
      return { ok: true, enabled: this.enabled };
    },
    clearOverride(){
      if (!isDevFlag()) return { ok: false, reason: "not_dev" };
      bankState.override = null;
      return { ok: true, enabled: this.enabled };
    },
    transfer(fromId, toId, amount, reason, meta){
      if (!this.enabled) {
        logBankDisabledAttempt("transfer", { fromId, toId, amount, meta });
        return { ok: false, reason: "bank_disabled" };
      }
      return E.transferPoints(fromId, toId, amount, reason, meta);
    },
    deposit(opts = {}){
      const ownerId = String(opts.ownerId || opts.actorId || "me");
      const rawAmount = Number.isFinite(opts.amount) ? (opts.amount | 0) : null;
      if (rawAmount == null) {
        return { ok: false, reason: "invalid_amount" };
      }
      const amount = rawAmount < 0 ? 0 : rawAmount;
      if (amount < 1) {
        return { ok: false, reason: "invalid_amount" };
      }
      if (!this.enabled) {
        logBankDisabledAttempt("deposit", { fromId: ownerId, amount, meta: opts.meta });
        return { ok: false, reason: "bank_disabled" };
      }
      const ownerAcc = getAccount(ownerId);
      const ownerPoints = ownerAcc && Number.isFinite(ownerAcc.points) ? (ownerAcc.points | 0) : 0;
      if (ownerPoints < amount) {
        return { ok: false, reason: "insufficient_points", have: ownerPoints, need: amount };
      }

      const transferMeta = Object.assign({}, opts.meta || {}, {
        amount,
        ownerId,
        bankAccountId: BANK_ACCOUNT_ID
      });
      const userReason = String(opts.reason || "").trim();
      if (userReason) transferMeta.userReason = userReason;

      return E.transferPoints(ownerId, BANK_ACCOUNT_ID, amount, "bank_deposit", transferMeta);
    },
    withdraw(opts = {}){
      const ownerId = String(opts.ownerId || opts.actorId || "me");
      const rawAmount = Number.isFinite(opts.amount) ? (opts.amount | 0) : null;
      if (rawAmount == null) {
        return { ok: false, reason: "invalid_amount" };
      }
      const amount = rawAmount < 0 ? 0 : rawAmount;
      if (amount < 1) {
        return { ok: false, reason: "invalid_amount" };
      }
      if (!this.enabled) {
        logBankDisabledAttempt("withdraw", { fromId: BANK_ACCOUNT_ID, toId: ownerId, amount, meta: opts.meta });
        return { ok: false, reason: "bank_disabled" };
      }
      const snap = (E && typeof E.sumPointsSnapshot === "function") ? E.sumPointsSnapshot() : null;
      const bankBalance = snap && snap.byId && typeof snap.byId === "object" && Number.isFinite(snap.byId[BANK_ACCOUNT_ID])
        ? (snap.byId[BANK_ACCOUNT_ID] | 0)
        : 0;
      if (bankBalance < amount) {
        return { ok: false, reason: "insufficient_bank_funds", have: bankBalance, need: amount };
      }

      const transferMeta = Object.assign({}, opts.meta || {}, {
        amount,
        ownerId,
        bankAccountId: BANK_ACCOUNT_ID
      });
      const userReason = String(opts.reason || "").trim();
      if (userReason) transferMeta.userReason = userReason;

      return E.transferPoints(BANK_ACCOUNT_ID, ownerId, amount, "bank_withdraw", transferMeta);
    },
    snapshot(opts = {}){
      const ownerId = String(opts.ownerId || "me");
      const snap = (E && typeof E.sumPointsSnapshot === "function") ? E.sumPointsSnapshot() : null;
      let bankBalance = 0;
      if (snap && snap.byId && typeof snap.byId === "object" && Number.isFinite(snap.byId[BANK_ACCOUNT_ID])) {
        bankBalance = snap.byId[BANK_ACCOUNT_ID] | 0;
      }
      const ownerAcc = getAccount(ownerId);
      const ownerPoints = ownerAcc && Number.isFinite(ownerAcc.points) ? (ownerAcc.points | 0) : 0;
      return {
        ok: true,
        bankEnabled: this.enabled,
        bankBalance,
        ownerId,
        ownerPoints,
        snapshot: snap || null
      };
    }
  };

  Game._Bank = Bank;
  Game.Bank = Bank;

  const TrainingAPI = {
    status: (opts = {}) => {
      const argKey = String(opts.argKey || "").trim();
      if (!argKey) return { ok: false, reason: "argKey_missing" };

      const entry = ensureTrainingEntry(argKey);
      if (!entry) return { ok: false, reason: "argKey_missing" };
      const t = ensureTrainingState();
      const counters = t.counters || { totalTrains: 0, todayTrains: 0, lastTrainDay: 0 };
      const dayIndex = getDayIndex();
      const actorId = "me";
      const meAcc = getAccount(actorId);
      const actorPoints = meAcc && Number.isFinite(meAcc.points) ? (meAcc.points | 0) : 0;
      const basePrice = getTrainingBasePrice();
      const price = calcFinalPrice({ basePrice, actorPoints, priceKey: "training", context: { argKey } });

      const cooldownUntilDay = sanitizeNonNegativeInt(entry.cooldownUntil);
      const onCooldown = dayIndex < cooldownUntilDay;
      const insufficient = actorPoints < price.finalPrice;
      const canTrain = !onCooldown && !insufficient;
      let whyBlocked = null;
      if (insufficient) whyBlocked = "insufficient_points";
      else if (onCooldown) whyBlocked = "cooldown";

      const todayTrains = (counters.lastTrainDay === dayIndex) ? (counters.todayTrains | 0) : 0;
      const xp = sanitizeNonNegativeInt(entry.xp);
      const level = computeTrainingLevel(xp);

      return {
        ok: true,
        argKey,
        dayIndex,
        price: price.finalPrice,
        priceMeta: price,
        canTrain,
        whyBlocked,
        cooldownUntilDay,
        remainingDays: onCooldown ? (cooldownUntilDay - dayIndex) : 0,
        progress: { xp, level },
        counters: {
          totalTrains: sanitizeNonNegativeInt(counters.totalTrains),
          todayTrains,
          lastTrainDay: sanitizeNonNegativeInt(counters.lastTrainDay)
        }
      };
    },
    trainCost: (opts = {}) => {
      const argKey = String(opts.argKey || "").trim();
      const trainId = String(opts.trainId || "").trim();
      if (!argKey) return { ok: false, reason: "argKey_missing" };
      if (!trainId) return { ok: false, reason: "trainId_missing" };

      const actorId = "me";
      const meAcc = getAccount(actorId);
      const actorPoints = meAcc && Number.isFinite(meAcc.points) ? (meAcc.points | 0) : 0;
      const basePrice = getTrainingBasePrice();
      const idempotencyKey = `training|${actorId}|${trainId}`;
      const context = { argKey, trainId };
      const extraMeta = { argKey, trainId };

      const res = chargePriceOnce({
        fromId: actorId,
        toId: "sink",
        actorId,
        priceKey: "training",
        basePrice,
        actorPoints,
        reason: "training_cost",
        context,
        idempotencyKey,
        extraMeta
      });

      if (!res || res.ok !== true) {
        return { ok: false, reason: (res && res.reason) || "transfer_failed" };
      }
      return {
        ok: true,
        charged: !!res.charged,
        cacheHit: !!res.dedup,
        idempotencyKey: res.idempotencyKey,
        price: res.price || null,
        meta: res.meta || null
      };
    },
    train: (opts = {}) => {
      const argKey = String(opts.argKey || "").trim();
      const trainId = String(opts.trainId || "").trim();
      if (!argKey) return { ok: false, reason: "argKey_missing" };
      if (!trainId) return { ok: false, reason: "trainId_missing" };

      const dedupKey = `training|me|${trainId}`;
      const existing = findDupEntry("training_cost", dedupKey, null);
      if (existing) {
        const snap = TrainingAPI.status({ argKey });
        return {
          ok: true,
          charged: false,
          cacheHit: true,
          status: snap,
          cost: { ok: true, charged: false, cacheHit: true, idempotencyKey: dedupKey, existing },
          snapshotAfter: snap
        };
      }

      const status = TrainingAPI.status({ argKey });
      if (!status.ok) return { ok: false, reason: status.reason || "status_failed", status };
      if (!status.canTrain) return { ok: false, reason: status.whyBlocked, status };

      const costRes = TrainingAPI.trainCost({ argKey, trainId });
      if (!costRes || costRes.ok !== true) {
        return { ok: false, reason: (costRes && costRes.reason) || "cost_failed", status };
      }
      if (costRes.cacheHit) {
        return { ok: true, charged: false, cacheHit: true, status, cost: costRes, snapshotAfter: TrainingAPI.status({ argKey }) };
      }

      const t = ensureTrainingState();
      const entry = ensureTrainingEntry(argKey);
      const counters = t.counters;
      const dayIndex = getDayIndex();

      const xpBefore = sanitizeNonNegativeInt(entry.xp);
      const levelBefore = computeTrainingLevel(xpBefore);
      const xpAfter = xpBefore + 1;
      const levelAfter = computeTrainingLevel(xpAfter);

      entry.xp = xpAfter;
      entry.level = levelAfter;
      entry.lastTrainedAt = dayIndex;
      entry.cooldownUntil = dayIndex + 1;

      if (counters.lastTrainDay !== dayIndex) counters.todayTrains = 0;
      counters.totalTrains = sanitizeNonNegativeInt(counters.totalTrains) + 1;
      counters.todayTrains = sanitizeNonNegativeInt(counters.todayTrains) + 1;
      counters.lastTrainDay = dayIndex;

      if (isDevFlag()) {
        const dbg = ensureDebugStore();
        if (!Array.isArray(dbg.trainingLog)) dbg.trainingLog = [];
        dbg.trainingLog.push({
          reason: "training_progress",
          meta: {
            argKey,
            trainId,
            xpBefore,
            xpAfter,
            levelBefore,
            levelAfter,
            dayIndex
          }
        });
        if (dbg.trainingLog.length > 200) dbg.trainingLog.shift();
      }

      return {
        ok: true,
        charged: true,
        cacheHit: false,
        status,
        cost: costRes,
        snapshotAfter: TrainingAPI.status({ argKey })
      };
    }
  };
  Game.TrainingAPI = Object.assign(Game.TrainingAPI || {}, TrainingAPI);
})();
