// Web/conflict/conflict-economy.js
(function () {
  const E = {};
  const pools = {
    crowd: { id: "crowd", points: 0 },
    sink: { id: "sink", points: 0 },
    crowdMap: Object.create(null),
    crowdPaid: Object.create(null),
  };
  const startCostAppliedById = Object.create(null);

  function getData(){
    return (Game && Game.Data) ? Game.Data : null;
  }

  function isCirculationEnabled(){
    const D = getData();
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

  function ensureDebugStore(){
    if (!Game.Debug || typeof Game.Debug !== "object") Game.Debug = {};
    if (Game.Debug.moneyLog == null) {
      Game.Debug.moneyLog = [];
    } else if (!Array.isArray(Game.Debug.moneyLog)) {
      try {
        const prev = Game.Debug.moneyLog;
        console.warn("[DEV] Econ moneyLog reset (was non-array)", typeof prev, prev && Object.keys(prev || {}).slice(0, 5));
      } catch (_) {}
      Game.Debug.moneyLog = [];
    }
    if (Game.Debug.moneyLogByBattle == null) {
      Game.Debug.moneyLogByBattle = {};
    } else if (typeof Game.Debug.moneyLogByBattle !== "object" || Array.isArray(Game.Debug.moneyLogByBattle)) {
      try {
        const prev = Game.Debug.moneyLogByBattle;
        console.warn("[DEV] Econ moneyLogByBattle reset (was non-object)", typeof prev);
      } catch (_) {}
      Game.Debug.moneyLogByBattle = {};
    }
    return Game.Debug;
  }

  function normalizeCrowdKey(poolId){
    const id = String(poolId || "");
    if (!id) return "";
    return id.startsWith("crowd:") ? id.slice("crowd:".length) : id;
  }

  function logTransfer(entry){
    const dbg = ensureDebugStore();
    const log = dbg.moneyLog;
    const bid = entry ? String(entry.battleId || (entry.meta && entry.meta.battleId) || "") : "";
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
    const S = Game.State || null;
    if (!S) return null;
    if (key === "me") {
      if (S.players && S.players.me && typeof S.players.me.points === "number") return S.players.me;
      if (S.me) return S.me;
    }
    if (S.players && S.players[key]) return S.players[key];
    if (S.me && S.me.id === key) return S.me;
    return null;
  }

  function withPointsWrite(fn){
    if (Game && typeof Game._withPointsWrite === "function") return Game._withPointsWrite(fn);
    return fn();
  }

  E.getCrowdPoolId = function (battleId){
    if (!battleId) return "crowd";
    return `crowd:${battleId}`;
  };

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
    const ids = ["sink","crowd"];
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
    const S = Game.State || {};
    const players = S.players || {};
    let playersSum = 0;
    let npcsSum = 0;
    const countedPlayerIds = [];
    const countedNpcIds = [];
    const countedPoolIds = [];
    const duplicatesDetected = [];
    const seen = new Set();

    Object.values(players).forEach(p => {
      if (!p) return;
      const id = String(p.id || "");
      const isNpc = (p.npc === true || p.type === "npc" || p.isNpc === true || id.startsWith("npc_"));
      if (id) {
        if (seen.has(id)) duplicatesDetected.push(id);
        seen.add(id);
      }
      if (isNpc) {
        npcsSum += (p.points | 0);
        if (id) countedNpcIds.push(id);
      } else {
        playersSum += (p.points | 0);
        if (id) countedPlayerIds.push(id);
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
        playersSum += (S.me.points | 0);
        if (mid) countedPlayerIds.push(mid);
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
      npcsSum += (n.points | 0);
      if (id) countedNpcIds.push(id);
    });

    const sink = (pools.sink && typeof pools.sink.points === "number") ? (pools.sink.points | 0) : 0;
    const crowd = (pools.crowd && typeof pools.crowd.points === "number") ? (pools.crowd.points | 0) : 0;
    let crowdMapTotal = 0;
    const crowdById = {};
    if (pools.sink) countedPoolIds.push("sink");
    if (pools.crowd) countedPoolIds.push("crowd");
    Object.keys(pools.crowdMap || {}).forEach(k => {
      const acc = pools.crowdMap[k];
      const v = acc && typeof acc.points === "number" ? (acc.points | 0) : 0;
      crowdMapTotal += v;
      crowdById[k] = v;
      countedPoolIds.push(k);
    });

    const poolsSum = sink + crowd + crowdMapTotal;
    return {
      total: playersSum + npcsSum + poolsSum,
      players: playersSum,
      npcs: npcsSum,
      pools: poolsSum,
      poolsBreakdown: { sink, crowd, crowdMap: crowdMapTotal, crowdById },
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

  E.transferPoints = function (fromId, toId, amount, reason, meta = {}) {
    ensureDebugStore();
    const n = Number(amount || 0);
    if (!Number.isFinite(n) || n <= 0) return { ok: false, reason: "bad_amount" };
    try {
      const r = String(reason || "");
      if (r.startsWith("battle_") && (!meta || !meta.battleId)) {
        if (Game && Game.Debug && Game.Debug.FORCE_CIRCULATION === true) {
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
    // IMPORTANT: any points write must happen inside withPointsWrite() while circulation is enabled.
    // Otherwise State's points-guard may reject the assignment (even for internal sync like S.players.me -> S.me).
    withPointsWrite(() => {
      from.points = Math.max(0, (from.points | 0) - amt);
      to.points = (to.points | 0) + amt;

      // Keep UI source-of-truth in sync:
      // UI reads points from State.me, while Econ often mutates State.players.me.
      try {
        if (isCirculationEnabled()) {
          const S = Game.State || null;
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
    return { ok: true };
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

  // Start cost: starting a battle costs 1 point.
  // Applied exactly once per battle, and only when the player initiates the battle.
  E.applyStart = function (battle) {
    if (!battle) return;
    if (battle.startCostApplied) return;
    if (battle.id && startCostAppliedById[battle.id]) return;
    battle.startCostApplied = true;
    if (battle.id) startCostAppliedById[battle.id] = true;

    const me = Game.State && Game.State.me ? Game.State.me : null;
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
      E.transferPoints(initiatorId, "sink", amount, reason, { battleId: battle.id || battle.battleId || null, status: battle.status || null, phase: battle.phase || null });
      return;
    }

    // If the battle is incoming (NPC attacked), there is no start cost in legacy mode.
    if (battle.fromThem === true) return;
    const spend = (Game.StateAPI && typeof Game.StateAPI.spendPoints === "function")
      ? Game.StateAPI.spendPoints
      : null;
    if (spend) spend(1, "battle_start");
    else {
      if (typeof me.points !== "number") me.points = 0;
      me.points = Math.max(0, me.points - 1);
    }

    try {
      if (Game.StateAPI && typeof Game.StateAPI.ensureNonNegativePoints === "function") {
        Game.StateAPI.ensureNonNegativePoints();
      }
      if (Game.StateAPI && typeof Game.StateAPI.syncMeToPlayers === "function") {
        Game.StateAPI.syncMeToPlayers();
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
      } else if (Game.StateAPI && typeof Game.StateAPI.pushChat === "function") {
        // keep perfect punctuation for system lines
        Game.StateAPI.pushChat("Система", line, { system: true });
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

    const me = Game.State && Game.State.me ? Game.State.me : null;
    if (!me) return;

    if (typeof me.points !== "number") me.points = 0;
    if (typeof me.wins !== "number") me.wins = 0;
    if (typeof me.influence !== "number") me.influence = 0;
    if (typeof me.winsSinceInfluence !== "number") me.winsSinceInfluence = 0;

    const res = String(battle.result || "");

    const D = (Game && Game.Data) ? Game.Data : null;
    const addPts = (Game.StateAPI && typeof Game.StateAPI.addPoints === "function")
      ? Game.StateAPI.addPoints
      : null;

    const transferRep = (Game.StateAPI && typeof Game.StateAPI.transferRep === "function")
      ? Game.StateAPI.transferRep
      : null;
    const dailyBonus = (Game.StateAPI && typeof Game.StateAPI.maybeDailyRepBonus === "function")
      ? Game.StateAPI.maybeDailyRepBonus
      : null;

    function syncAndRenderNow(){
      try {
        if (Game.StateAPI && typeof Game.StateAPI.syncMeToPlayers === "function") {
          Game.StateAPI.syncMeToPlayers();
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
        try { me.wins = (me.wins | 0) + 1; } catch (_) { try { me.wins += 1; } catch (_) {} }
        try { maybeUnlocks(me); } catch (_) {}
        
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
      const prog = getProgression();

      const PRESSURE_HIGH_TONE = new Set(["r", "k"]);
      const PRESSURE_WEAK_TONE = new Set(["y", "o"]);
      const INF_PRESSURE_WIN_COST = 1;
      const REP_PRESSURE_WIN_CAP = 0;
      const REP_PRESSURE_WIN_REASON = "rep_pressure_win_cap";

      // Rewards
      const gain = (D && Number.isFinite(D.POINTS_WIN)) ? (D.POINTS_WIN | 0) : 3;
      if (addPts) addPts(gain, "battle_win");
      else me.points = Math.max(0, me.points + gain);
      me.wins += 1;
      
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
        const opp = (Game.State && Game.State.players && battle.opponentId) ? Game.State.players[battle.opponentId] : null;
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
          me.influence = Math.max(0, (me.influence | 0) - (INF_PRESSURE_WIN_COST | 0));
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
        if (Game.StateAPI && typeof Game.StateAPI.syncMeToPlayers === "function") {
          Game.StateAPI.syncMeToPlayers();
        }
      } catch (_) {}

      // Force immediate UI update (fixes instant stats/toasts)
      try {
        if (Game.UI && typeof Game.UI.requestRenderAll === "function") {
          Game.UI.requestRenderAll();
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
        
        // Task A: REP за исход по разнице сил Δ (поражение)
        if (transferRep) {
          const delta = getToneDelta(battle);
          if (delta <= -2) {
            // Проиграл более сильному: +1 REP
            transferRep("crowd_pool", "me", 1, "rep_battle_lose_delta", battle.id || battle.battleId || null);
          } else if (Math.abs(delta) <= 1) {
            // Проиграл равному: -1 REP
            transferRep("me", "crowd_pool", 1, "rep_battle_lose_delta", battle.id || battle.battleId || null);
          } else if (delta >= 2) {
            // Проиграл более слабому: -2 REP
            transferRep("me", "crowd_pool", 2, "rep_battle_lose_delta", battle.id || battle.battleId || null);
          }
        }
        
        syncAndRenderNow();
        if (dailyBonus) dailyBonus();
        return;
      } else {
      const gain = (D && Number.isFinite(D.POINTS_LOSE)) ? (D.POINTS_LOSE | 0) : 1;
      if (addPts) addPts(gain, "battle_lose");
      else me.points = Math.max(0, me.points + gain);

      // Task A: REP за исход по разнице сил Δ (поражение, legacy режим)
      if (transferRep && battle.opponentId) {
        const delta = getToneDelta(battle);
        if (delta <= -2) {
          // Проиграл более сильному: +1 REP
          transferRep("crowd_pool", "me", 1, "rep_battle_lose_delta", battle.id || battle.battleId || null);
        } else if (Math.abs(delta) <= 1) {
          // Проиграл равному: -1 REP
          transferRep("me", "crowd_pool", 1, "rep_battle_lose_delta", battle.id || battle.battleId || null);
        } else if (delta >= 2) {
          // Проиграл более слабому: -2 REP
          transferRep("me", "crowd_pool", 2, "rep_battle_lose_delta", battle.id || battle.battleId || null);
        }
      }

      if (dailyBonus) dailyBonus();

      try {
        if (Game.StateAPI && typeof Game.StateAPI.syncMeToPlayers === "function") {
          Game.StateAPI.syncMeToPlayers();
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
        syncAndRenderNow();
        if (dailyBonus) dailyBonus();
        return;
      } else {
      const gain = (D && Number.isFinite(D.POINTS_DRAW)) ? (D.POINTS_DRAW | 0) : 2;
      if (addPts) addPts(gain, "battle_draw");
      else me.points = Math.max(0, me.points + gain);
      
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
    const me = Game.State && Game.State.me ? Game.State.me : null;
    if (!me) return;
    maybeUnlocks(me);
  };

  E.isCirculationEnabled = E.isCirculationEnabled || isCirculationEnabled;
  E._logTx = E._logTx || logTransfer;
  Game._ConflictEconomy = E;
  Game.ConflictEconomy = E;
})();
