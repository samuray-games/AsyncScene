// events.js
// NPC vs NPC события. Можно вписаться за сторону за 1 💰.
// Если твоя сторона выиграла - получаешь 2 💰.
// Отдельно: сюда попадают только ЧУЖИЕ ничьи (NPC-NPC или игрок-игрок без участия me).

window.Game ||= {};

(() => {
  const Game = window.Game;
  const U = Game.Util;
  const D = Game.Data;
  const now = () => (Game.Time && typeof Game.Time.now === "function") ? Game.Time.now() : Date.now();
  const pickOne = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return null;
    if (U && typeof U.pick === "function") return U.pick(arr);
    return arr[Math.floor(Math.random() * arr.length)];
  };

  const DRAW_VOTE_DURATION_MS = 10000; // 10с на голосование толпы
  // Slower NPC voting pace so the crowd feels calmer and UI updates are less noisy.
  // NOTE: larger numbers = slower voting.
  const NPC_VOTE_PACE_MIN_MS = 1200;
  const NPC_VOTE_PACE_MAX_MS = 2000;

  function powerMap(){
    // Backward compatible: prefer ARGUMENT_POWER, fall back to PHRASE_POWER.
    return (D && (D.ARGUMENT_POWER || D.PHRASE_POWER)) || { y:1, o:2, r:3, k:4 };
  }

  function normColor(c){
    // Accept legacy names and normalize to y/o/r/k.
    if (!c) return "y";
    if (c === "yellow") return "y";
    if (c === "orange") return "o";
    if (c === "red") return "r";
    if (c === "black") return "k";
    return c; // assume already y/o/r/k
  }

  function argPower(color){
    const m = powerMap();
    return m[normColor(color)] || 1;
  }

  const Events = {};
  let diagCrowdOutcomeRepLogged = false;

  function ensureState(){
    Game.__S ||= {};
    Game.__S.events ||= [];
  }

  function bumpEventBadgeIfCollapsed(){
    try {
      if (Game.UI && typeof Game.UI.isPanelCollapsed === "function" && Game.UI.isPanelCollapsed("events")) {
        if (typeof Game.UI.bumpCollapsedCounter === "function") Game.UI.bumpCollapsedCounter("events");
      }
    } catch (_) {}
  }

  function getEcon(){
    return (Game && Game._ConflictEconomy) ? Game._ConflictEconomy : null;
  }

  function calcFinalPrice(opts = {}){
    const Econ = getEcon();
    const base = Number.isFinite(opts.basePrice) ? (opts.basePrice | 0) : 0;
    const points = Number.isFinite(opts.actorPoints) ? (opts.actorPoints | 0) : 0;
    const baseNorm = Math.max(0, base);
    const pointsNorm = Math.max(0, points);
    if (Econ && typeof Econ.calcFinalPrice === "function") {
      return Econ.calcFinalPrice({
        basePrice: baseNorm,
        actorPoints: pointsNorm,
        priceKey: opts.priceKey,
        context: opts.context
      });
    }
    return {
      basePrice: baseNorm,
      mult: 1,
      finalPrice: baseNorm,
      priceKey: opts.priceKey || null,
      context: opts.context || null
    };
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

  function getCrowdPoolId(e){
    const Econ = getEcon();
    if (!Econ || typeof Econ.getCrowdPoolId !== "function") return "crowd";
    const bid = e && (e.battleId || e.relatedBattleId || e.refId || e.id || null);
    return Econ.getCrowdPoolId(bid);
  }

  function resolveCrowdCore(crowd, ctx, participants){
    const Core = (Game && (Game.ConflictCore || Game._ConflictCore)) ? (Game.ConflictCore || Game._ConflictCore) : null;
    if (Core && typeof Core.resolveCrowdCore === "function") return Core.resolveCrowdCore(crowd, ctx, participants);
    const out = {
      outcome: "TIE",
      decided: false,
      sideStats: {
        a: { count: 0, weight: 0 },
        b: { count: 0, weight: 0 },
        total: { count: 0, weight: 0 },
        totalPlayers: Array.isArray(participants) ? participants.length : 0
      }
    };
    if (!crowd || typeof crowd !== "object") return out;
    const aCount = Number.isFinite(crowd.aVotes) ? (crowd.aVotes | 0)
      : (Number.isFinite(crowd.votesA) ? (crowd.votesA | 0) : 0);
    const bCount = Number.isFinite(crowd.bVotes) ? (crowd.bVotes | 0)
      : (Number.isFinite(crowd.votesB) ? (crowd.votesB | 0) : 0);
    const aWeight = aCount | 0;
    const bWeight = bCount | 0;
    out.sideStats.a.count = aCount;
    out.sideStats.a.weight = aWeight;
    out.sideStats.b.count = bCount;
    out.sideStats.b.weight = bWeight;
    out.sideStats.total.count = (aCount + bCount) | 0;
    out.sideStats.total.weight = (aWeight + bWeight) | 0;
    if (aWeight > bWeight) {
      out.outcome = "A_WIN";
      out.decided = true;
    } else if (bWeight > aWeight) {
      out.outcome = "B_WIN";
      out.decided = true;
    } else {
      out.outcome = "TIE";
      out.decided = false;
    }
    return out;
  }

  function awardCrowdVoteRep(voterId, e){
    if (!voterId) return;
    const transferRep = (Game.__A && typeof Game.__A.transferRep === "function")
      ? Game.__A.transferRep
      : null;
    if (!transferRep) return;
    const repEventId = e && (e.id || e.eventId || e.refId || e.battleId || e.relatedBattleId || null);
    const res = transferRep("rep_emitter", voterId, 1, "rep_crowd_vote_participation", repEventId);
    if (!res || !res.ok) return;
    const me = (Game.__S && Game.__S.me) ? Game.__S.me : null;
    if (me && me.id && me.id === voterId) {
      try {
        if (Game.UI && typeof Game.UI.pushSystem === "function") {
          Game.UI.pushSystem(`+1⭐`);
        }
      } catch (_) {}
    }
  }

  function applyCrowdVoteOutcomeRep(e, res, opts){
    if (!e || !res) return;
    const crowd = e.crowd;
    if (!crowd || typeof crowd !== "object") return;
    const outcome = res.outcome;
    const decided = !!res.decided;
    const resolved = !!e.resolved;
    const winnerSide = (outcome === "A_WIN") ? "a" : (outcome === "B_WIN") ? "b" : null;
    const votersMap = (crowd.voters && typeof crowd.voters === "object") ? crowd.voters : {};
    const voterIds = Object.keys(votersMap);
    const voterSideCount = voterIds.reduce((count, id) => {
      const side = votersMap[id];
      return (side === "a" || side === "b") ? count + 1 : count;
    }, 0);
    const alreadyApplied = !!crowd._repOutcomeApplied;

    const transferRep = (Game.__A && typeof Game.__A.transferRep === "function")
      ? Game.__A.transferRep
      : null;
    const dev = (Game && Game.__DEV) ? Game.__DEV : null;
    const diagEnabled = !!((opts && opts.debugCrowdRep) || (dev && dev.debugCrowdRep));
    if (diagEnabled && !diagCrowdOutcomeRepLogged) {
      const eventId = e && (e.id || e.eventId || e.refId || null);
      const battleId = e && (e.battleId || e.relatedBattleId || e.refId || e.id || null);
      const diagWinnerSide = winnerSide || "tie";
      try {
        console.warn(`CROWD_OUTCOME_REP_DIAG eventId=${String(eventId || "")} battleId=${String(battleId || "")} decided=${decided} resolved=${resolved} winnerSide=${diagWinnerSide} voters=${voterIds.length} hasSide=${voterSideCount} alreadyApplied=${alreadyApplied}`);
      } catch (_) {}
      diagCrowdOutcomeRepLogged = true;
    }
    if (alreadyApplied) return;
    if (!transferRep) return;

    if (outcome !== "A_WIN" && outcome !== "B_WIN") {
      if (!crowd._repOutcomeSeen) crowd._repOutcomeSeen = true;
      return;
    }
    if (!voterSideCount) return;

    const battleId = e && (e.battleId || e.relatedBattleId || e.refId || e.id || null);
    let applied = false;
    const winner = winnerSide;
    voterIds.forEach(voterId => {
      if (!voterId) return;
      const side = votersMap[voterId];
      if (side !== "a" && side !== "b") return;
      const isWinner = (side === winner);
      const reason = isWinner ? "rep_crowd_vote_majority" : "rep_crowd_vote_minority";
      const delta = isWinner ? 2 : -2;
      let transferRes = null;
      try {
        transferRes = transferRep("rep_emitter", voterId, delta, reason, battleId);
      } catch (_) {}
      if (transferRes && transferRes.ok) applied = true;
    });
    if (applied) {
      crowd._repOutcomeApplied = true;
      crowd._repOutcomeSeen = true;
    }
  }

  function transferToCrowd(fromId, amount, reason, e){
    const Econ = getEcon();
    if (!Econ || typeof Econ.transferPoints !== "function") return { ok: false, reason: "no_econ" };
    const poolId = getCrowdPoolId(e);
    return Econ.transferPoints(fromId, poolId, amount, reason, { battleId: e && (e.battleId || e.relatedBattleId || e.refId || null) });
  }

  function payoutCrowdPool(e, winnerSide){
    // Vote economy (pool burns, no distributions):
    // - click: -1💰 immediately (see helpEvent)
    // - REP already awarded at vote time; after resolve +1💰 refund if player's side won
    if (!e || e.voteOutcomeApplied) return;
    if (!e.playerVoted || !e.myVote) return;

    const win = (winnerSide && e.myVote === winnerSide);
    if (win) {
      try {
        if (isCirculationEnabled()) {
          const Econ = getEcon();
          const battleId = e && (e.battleId || e.relatedBattleId || e.refId || null);
          if (Econ && typeof Econ.transferPoints === "function") {
            const res = Econ.transferPoints("sink", "me", 1, "crowd_vote_refund", { battleId });
            // Fallback logging if econ path didn't emit moneyLog entries
            try {
              const dbg = (Game && Game.__D) ? Game.__D : (window.Game.__D = window.Game.__D || {});
              dbg.moneyLog = Array.isArray(dbg.moneyLog) ? dbg.moneyLog : (dbg.moneyLog = dbg.moneyLog || []);
              const existsPts = dbg.moneyLog.some(x => x && (String(x.reason || "") === "crowd_vote_refund") && String(x.eventId||x.battleId||"") === String(e && (e.id||battleId) || ""));
              if (!existsPts) {
                const touchEntry = {
                  time: Date.now(),
                  reason: "crowd_vote_refund",
                  currency: "points",
                  amount: 1,
                  sourceId: "sink",
                  targetId: "me",
                  eventId: e && (e.id || null),
                  battleId: battleId || null,
                  meta: { context: "crowd_vote_refund" }
                };
                touchEntry.txId = touchEntry.txId || `tx_${Date.now()}_${Math.random().toString(16).slice(2)}`;
                const ref = (typeof dbg.pushMoneyLogRow === "function")
                  ? dbg.pushMoneyLogRow(touchEntry)
                  : (() => { dbg.moneyLog.push(touchEntry); return { txId: touchEntry.txId || null, logIndex: dbg.moneyLog.length - 1 }; })();
                if (ref && typeof dbg.pushEconToastFromLogRef === "function") {
                  dbg.pushEconToastFromLogRef(ref, "+1💰");
                }
              }
            } catch (_) {}
          } else {
            markLegacyEconHit("events.payoutCrowdPool.legacy");
            const addPts = (Game.__A && typeof Game.__A.addPoints === "function") ? Game.__A.addPoints : null;
            if (addPts) {
              addPts(1, "crowd_vote_refund");
            } else {
              // Fallback: ensure debug logs reflect the refund
              try {
                const dbg = (Game && Game.__D) ? Game.__D : (window.Game.__D = window.Game.__D || {});
                dbg.moneyLog = Array.isArray(dbg.moneyLog) ? dbg.moneyLog : (dbg.moneyLog = dbg.moneyLog || []);
                const touchEntry = {
                  time: Date.now(),
                  reason: "crowd_vote_refund",
                  currency: "points",
                  amount: 1,
                  sourceId: "system",
                  targetId: "me",
                  eventId: e && e.id || null,
                  meta: { context: "legacy_crowd_vote_refund" }
                };
                touchEntry.txId = touchEntry.txId || `tx_${Date.now()}_${Math.random().toString(16).slice(2)}`;
                const ref = (typeof dbg.pushMoneyLogRow === "function")
                  ? dbg.pushMoneyLogRow(touchEntry)
                  : (() => { dbg.moneyLog.push(touchEntry); return { txId: touchEntry.txId || null, logIndex: dbg.moneyLog.length - 1 }; })();
                if (ref && typeof dbg.pushEconToastFromLogRef === "function") {
                  dbg.pushEconToastFromLogRef(ref, "+1💰");
                }
              } catch (_) {}
            }
          }
        }
      } catch (_) {}
      try {
        if (Game.UI && typeof Game.UI.pushSystem === "function") {
          Game.UI.pushSystem(`+1💰`);
        }
      } catch (_) {}
    }

    e.voteOutcomeApplied = true;
    try { requestRender(); } catch (_) {}
    try { if (Game.UI && typeof Game.UI.requestRenderAll === "function") Game.UI.requestRenderAll(); } catch (_) {}
  }

  function applyEventCrowdEconomy(e, res){
    if (!e || !res) return;
    const crowd = e.crowd;
    if (!crowd || typeof crowd !== "object") return;
    if (crowd._econApplied) return;
    crowd._econApplied = true;

    if (!isCirculationEnabled()) return;
    const Econ = getEcon();
    if (!Econ || typeof Econ.transferPoints !== "function") return;

    const battleId = e && (e.id || e.battleId || e.relatedBattleId || e.refId || null);
    const voters = (crowd.voters && typeof crowd.voters === "object")
      ? Object.keys(crowd.voters)
      : [];
    const poolId = getCrowdPoolId(e);
    if (Econ.ensurePool) Econ.ensurePool(poolId);

    if (!crowd._poolInit && voters.length) {
      voters.forEach(() => {
        Econ.transferPoints("sink", poolId, 1, "crowd_vote_pool_init", { battleId });
      });
      crowd._poolInit = true;
    }

    const refundAll = (res.outcome === "TIE");
    const winnerSide = (res.outcome === "A_WIN") ? "a" : (res.outcome === "B_WIN" ? "b" : null);
    const refundReason = refundAll ? "crowd_vote_refund" : "crowd_vote_refund_majority";
    const transferFromPool = (Econ && typeof Econ.transferFromPool === "function") ? Econ.transferFromPool : null;

    voters.forEach(id => {
      if (!refundAll && crowd.voters && crowd.voters[id] !== winnerSide) return;
      if (transferFromPool) transferFromPool(poolId, id, 1, refundReason, { battleId });
      else Econ.transferPoints(poolId, id, 1, refundReason, { battleId });
    });

    // Distribute any remainder in the pool (events follow split rule).
    if (!crowd._remainderApplied && Econ.getPoolBalance) {
      const bal = Econ.getPoolBalance(poolId) | 0;
      if (bal > 0) {
        const aId = e.aId || null;
        const bId = e.bId || null;
        const half = Math.floor(bal / 2);
        let aPart = half;
        let bPart = half;
        const odd = (bal % 2);
        if (odd) {
          if (winnerSide === "a") aPart += 1;
          else if (winnerSide === "b") bPart += 1;
          else aPart += 1;
        }
        if (aId && aPart > 0) {
          if (transferFromPool) transferFromPool(poolId, aId, aPart, "crowd_vote_remainder_split_a", { battleId });
          else Econ.transferPoints(poolId, aId, aPart, "crowd_vote_remainder_split_a", { battleId });
        }
        if (bId && bPart > 0) {
          if (transferFromPool) transferFromPool(poolId, bId, bPart, "crowd_vote_remainder_split_b", { battleId });
          else Econ.transferPoints(poolId, bId, bPart, "crowd_vote_remainder_split_b", { battleId });
        }
        crowd._remainderApplied = true;
      }
    }
  }

  function isMeId(id){
    if (!id) return false;
    if (id === "me") return true;
    const me = Game.__S && Game.__S.me;
    return !!(me && me.id && id === me.id);
  }

  function getPlayerById(id){
    return (Game.__S && Game.__S.players && id) ? Game.__S.players[id] : null;
  }

  function isVillainRole(p){
    if (!p) return false;
    const r = (p.subtype || p.role || "").toString().toLowerCase();
    return r === "toxic" || r === "bandit";
  }

  function isCopRole(p){
    if (!p) return false;
    const r = (p.subtype || p.role || "").toString().toLowerCase();
    return r === "cop" || r === "police";
  }

  function clamp0(n){
    return Math.max(0, Number(n || 0));
  }

  function getAllNpcs(){
    const players = (Game.__S && Game.__S.players) ? Game.__S.players : {};
    return Object.values(players).filter(p => p && (p.npc === true || p.type === "npc"));
  }

  function isActivePlayer(p){
    if (!p || !p.id) return false;
    if (p.removed === true) return false;
    const jailed = (Game.__S && Game.__S.jailed) ? Game.__S.jailed : null;
    if (jailed && jailed[p.id] && Number.isFinite(jailed[p.id].until) && now() < jailed[p.id].until) return false;
    if (p.id === "me" || p.isMe) return true;
    if (p.npc === true || p.type === "npc") return true;
    return !!p.name;
  }

  function getTotalPlayersCount(){
    const players = (Game.__S && Game.__S.players) ? Game.__S.players : {};
    let n = 0;
    for (const p of Object.values(players)) {
      if (isActivePlayer(p)) n++;
    }
    return n;
  }

  function getCrowdVoteCap(totalPlayers){
    const base = Math.round(0.4 * (totalPlayers | 0));
    return Math.max(10, base);
  }

  function getMaxNpcShare(){
    const D0 = Game && Game.Data ? Game.Data : null;
    const raw = (D0 && Number.isFinite(D0.MAX_NPC_SHARE_CROWD)) ? D0.MAX_NPC_SHARE_CROWD : 1;
    if (!Number.isFinite(raw)) return 1;
    return Math.max(0, Math.min(1, raw));
  }

  function ensureCrowdCap(e){
    if (!e || !e.crowd) return;
    if (!Number.isFinite(e.crowd.cap) || e.crowd.cap <= 0) {
      let eligible = 0;
      try {
        const npcs = getAllNpcs();
        const aId = e.aId;
        const bId = e.bId;
        if (Array.isArray(npcs)) {
          eligible += npcs.filter(p => {
            if (!p || !p.id) return false;
            if (p.id === aId || p.id === bId) return false;
            const pts = Number.isFinite(p.points) ? (p.points | 0) : 0;
            return pts > 0;
          }).length;
        }
        const me = Game.__S && Game.__S.me ? Game.__S.me : null;
        if (me && Number.isFinite(me.points) && (me.points | 0) > 0) eligible += 1;
      } catch (_) {}
      const total = eligible > 0 ? eligible : getTotalPlayersCount();
      let cap = getCrowdVoteCap(total);
      if (eligible > 0 && cap > eligible) cap = eligible;
      e.crowd.cap = cap;
      e.crowd.totalPlayers = total;
    }
  }

  function getCrowdTotalVotes(crowd){
    if (!crowd) return 0;
    if (crowd.voters && typeof crowd.voters === "object") return Object.keys(crowd.voters).length;
    const a = Number.isFinite(crowd.aVotes) ? (crowd.aVotes | 0) : (Number.isFinite(crowd.votesA) ? (crowd.votesA | 0) : 0);
    const b = Number.isFinite(crowd.bVotes) ? (crowd.bVotes | 0) : (Number.isFinite(crowd.votesB) ? (crowd.votesB | 0) : 0);
    return (a + b) | 0;
  }

  function getCrowdCountsFromVoters(crowd){
    if (!crowd || !crowd.voters || typeof crowd.voters !== "object") return null;
    let a = 0;
    let b = 0;
    for (const id of Object.keys(crowd.voters)) {
      const side = crowd.voters[id];
      if (side === "a" || side === "attacker") a++;
      else if (side === "b" || side === "defender") b++;
    }
    return { a, b };
  }

  function npcVoteWeight(npc){
    if (!npc) return 1;
    // NPC with 0 points/balance cannot vote
    try {
      const pts = Number.isFinite(npc.points) ? (npc.points | 0) : 0;
      const bal = Number.isFinite(npc.balance) ? (npc.balance | 0) : null;
      if (pts <= 0 || (bal != null && bal <= 0)) return 0;
    } catch (_) {}
    return 1;
  }

  function ensureEventCrowd(e){
    e.crowd ||= { voters: {} };
    if (typeof e.crowd !== "object") e.crowd = { voters: {} };
    e.crowd.voters ||= {};

    if (!Number.isFinite(e.crowd.aVotes) && Number.isFinite(e.crowd.votesA)) e.crowd.aVotes = e.crowd.votesA;
    if (!Number.isFinite(e.crowd.bVotes) && Number.isFinite(e.crowd.votesB)) e.crowd.bVotes = e.crowd.votesB;
    if (!Number.isFinite(e.crowd.votesA) && Number.isFinite(e.crowd.aVotes)) e.crowd.votesA = e.crowd.aVotes;
    if (!Number.isFinite(e.crowd.votesB) && Number.isFinite(e.crowd.bVotes)) e.crowd.votesB = e.crowd.bVotes;

    if (!Number.isFinite(e.crowd.aVotes)) e.crowd.aVotes = 0;
    if (!Number.isFinite(e.crowd.bVotes)) e.crowd.bVotes = 0;
    if (!Number.isFinite(e.crowd.votesA)) e.crowd.votesA = e.crowd.aVotes;
    if (!Number.isFinite(e.crowd.votesB)) e.crowd.votesB = e.crowd.bVotes;

    // Mirror fields for UI
    if (!Number.isFinite(e.aVotes)) e.aVotes = e.crowd.aVotes;
    if (!Number.isFinite(e.bVotes)) e.bVotes = e.crowd.bVotes;
    if (!Number.isFinite(e.votesA)) e.votesA = e.crowd.votesA;
    if (!Number.isFinite(e.votesB)) e.votesB = e.crowd.votesB;

    // Timer canon
    if (!Number.isFinite(e.endsAt)) e.endsAt = Number(e.crowd.endAt || 0);
    if (!Number.isFinite(e.crowd.endAt)) e.crowd.endAt = Number(e.endsAt || 0);
    ensureCrowdCap(e);

    if (!Number.isFinite(e.crowd.eligibleNpcCount)) e.crowd.eligibleNpcCount = 0;
    if (!Number.isFinite(e.crowd.alreadyVotedCount)) e.crowd.alreadyVotedCount = 0;
    if (typeof e.crowd.endedBy === "undefined") e.crowd.endedBy = null;
    if (typeof e.crowd._crowdDecisionDiagLogged !== "boolean") e.crowd._crowdDecisionDiagLogged = false;

    if (typeof e.crowd._repOutcomeSeen !== "boolean") e.crowd._repOutcomeSeen = false;
  }

  function mirrorCrowdVotesToEvent(e){
    if (!e || !e.crowd) return;
    const aVotes = ((e.crowd.aVotes ?? e.crowd.votesA) | 0);
    const bVotes = ((e.crowd.bVotes ?? e.crowd.votesB) | 0);
    e.crowd.aVotes = aVotes;
    e.crowd.bVotes = bVotes;
    e.crowd.votesA = aVotes;
    e.crowd.votesB = bVotes;
    e.aVotes = aVotes;
    e.bVotes = bVotes;
    e.votesA = aVotes;
    e.votesB = bVotes;
  }

  function restartEventCrowd(e){
    if (!e) return;
    ensureEventCrowd(e);

    const me = Game.__S && Game.__S.me ? Game.__S.me : null;
    const meId = (me && me.id) ? me.id : "me";
    const prevVote = e.myVote;
    const hadPlayerVote = !!e.playerVoted;

    e.crowd.voters = {};
    e.crowd.aVotes = 0;
    e.crowd.bVotes = 0;
    e.crowd.votesA = 0;
    e.crowd.votesB = 0;
    e.crowd._econApplied = false;
    e.crowd._poolInit = false;
    e.crowd._repOutcomeApplied = false;
    e.crowd._repOutcomeSeen = false;
    e.crowd.eligibleNpcCount = 0;
    e.crowd.alreadyVotedCount = 0;
    e.crowd.endedBy = null;
    e.crowd._crowdDecisionDiagLogged = false;

    if (hadPlayerVote && prevVote) {
      e.crowd.voters[meId] = prevVote;
      if (prevVote === "a") e.crowd.aVotes = 1;
      else if (prevVote === "b") e.crowd.bVotes = 1;
      e.crowd.votesA = e.crowd.aVotes;
      e.crowd.votesB = e.crowd.bVotes;
    }

    const nextEnd = now() + DRAW_VOTE_DURATION_MS;
    e.endsAt = nextEnd;
    e.crowd.endAt = nextEnd;
    e.crowd.decided = false;
    e.crowd.winner = null;
    e.state = "open";
    mirrorCrowdVotesToEvent(e);
    ensureCrowdCap(e);
  }

  function applyBetOutcome(e, winnerSide){
    if (!e || e.pickRewardApplied) return;
    if (!e.playerVoted || !e.myVote) return;

    const win = (winnerSide && e.myVote === winnerSide);
    const addPts = (Game.__A && typeof Game.__A.addPoints === "function")
      ? Game.__A.addPoints
      : null;
    if (win) {
      if (isCirculationEnabled()) {
        const Econ = getEcon();
        const poolId = getCrowdPoolId(e);
        const balance = (Econ && typeof Econ.getPoolBalance === "function") ? Econ.getPoolBalance(poolId) : 0;
        const pay = balance > 0 ? 1 : 0;
        if (pay > 0 && Econ && typeof Econ.transferFromPool === "function") {
          Econ.transferFromPool(poolId, "me", pay, "tie_pick_win", { battleId: e && (e.battleId || e.relatedBattleId || e.refId || null) });
          e.betMessage = "Итог зафиксирован.";
        } else {
          e.betMessage = "Итог зафиксирован.";
        }
      } else {
        markLegacyEconHit("events.applyBetOutcome.legacy");
        if (addPts) addPts(1, "tie_pick_win");
        e.betMessage = "Итог зафиксирован.";
      }
   } else {
      e.betMessage = "Итог зафиксирован.";
    }
    e.betOutcome = win ? "win" : "lose";
    e.pickRewardApplied = true;
  }

  function simulateNpcVotesForOpenDrawEvent(e, now){
    // Adds NPC votes over time so it never stays at 0s with 0-0 forever.
    // Only applies to standalone Events draws and battle-backed draws that have a crowd.
    if (!e || e.state !== "open") return false;

    ensureEventCrowd(e);
    const crowd = e.crowd;
    const Econ = getEcon();
    if (!Econ || typeof Econ.transferPoints !== "function") return false;

    if (crowd.decided) return false;
    // IMPORTANT: player voting must NOT stop NPC voting. We only stop on decision/cap.
    // Do NOT add checks like `if (e.playerVoted) return` here.

    // Throttle NPC voting per event
    if (!Number.isFinite(crowd.nextNpcVoteAt)) crowd.nextNpcVoteAt = 0;
    if (!Number.isFinite(crowd.lastNpcVoteAt)) crowd.lastNpcVoteAt = 0;

    // If ticks are sparse, catch up by emitting multiple votes per tick.
    // This prevents the illusion of "freeze" when UI shows time decreasing but votes stop.
    const maxVotesPerTick = 2;

    const npcs = getAllNpcs();
    if (!npcs.length) return false;

    // Exclude participants themselves from being counted as crowd voters
    const aId = e.aId;
    const bId = e.bId;

    const npcPaidSet = (crowd.npcPaidSet && typeof crowd.npcPaidSet === "object")
      ? crowd.npcPaidSet
      : (crowd.npcPaidSet = Object.create(null));
    if (Array.isArray(crowd.npcPaidOrder)) {
      crowd.npcPaidOrder.forEach(id => {
        if (id) npcPaidSet[id] = true;
      });
    }

    function pickVoter(){
      // Prefer a fresh voter (not yet in crowd.voters).
      const voters = crowd.voters || {};

      // Build eligible list once for a deterministic fallback.
      const eligible = npcs.filter(p => {
        if (!p || !p.id || p.id === aId || p.id === bId) return false;
        if (npcPaidSet[p.id]) return false;
        if (voters[p.id]) return false;
        // NPC with 0 points/balance cannot vote
        const pts = Number.isFinite(p.points) ? (p.points | 0) : 0;
        const bal = Number.isFinite(p.balance) ? (p.balance | 0) : null;
        return pts > 0 && (bal == null || bal > 0);
      });
      if (!eligible.length) {
        crowd.lastTickWhy = "no_eligible_voter";
        crowd.eligibleNpcCount = 0;
        crowd.alreadyVotedCount = Object.keys(voters).length | 0;
        return null;
      }
      crowd.eligibleNpcCount = eligible.length;
      crowd.alreadyVotedCount = Object.keys(voters).length | 0;

      // Try random sampling first.
      for (let i = 0; i < Math.max(10, eligible.length); i++){
        const cand = eligible[Math.floor(Math.random() * eligible.length)];
        if (!cand || !cand.id) continue;
        if (npcPaidSet[cand.id]) continue;
        if (voters[cand.id]) continue;
        return cand;
      }
      // Deterministic fallback: first not-yet-voted.
      for (const cand of eligible){
        if (!npcPaidSet[cand.id] && !voters[cand.id]) return cand;
      }
      return null;
    }

    function decideSide(){
      // Decide side: slight bias to higher influence, otherwise random
      const aInf = Number(e.aInf ?? 0);
      const bInf = Number(e.bInf ?? 0);
      if (aInf === bInf) return (Math.random() < 0.5) ? "a" : "b";
      const bias = 0.55; // gentle
      if (aInf > bInf) return (Math.random() < bias) ? "a" : "b";
      return (Math.random() < bias) ? "b" : "a";
    }

    function paceNext(){
      crowd.lastNpcVoteAt = now;
      crowd.nextNpcVoteAt = now + NPC_VOTE_PACE_MIN_MS + Math.floor(Math.random() * (NPC_VOTE_PACE_MAX_MS - NPC_VOTE_PACE_MIN_MS));
    }

    function countCrowdVoteCostLogs(voterId, battleId){
      const dbg = (Game && Game.__D) ? Game.__D : null;
      if (!dbg || !Array.isArray(dbg.moneyLog)) return 0;
      return dbg.moneyLog.reduce((count, x) => {
        if (!x) return count;
        if (String(x.reason || "") !== "crowd_vote_cost") return count;
        if (String(x.battleId || "") !== String(battleId)) return count;
        if (String(x.sourceId || "") !== String(voterId)) return count;
        return count + 1;
      }, 0);
    }

    function removeCrowdVoteCostLog(voterId, battleId){
      const dbg = (Game && Game.__D) ? Game.__D : null;
      if (!dbg || !Array.isArray(dbg.moneyLog)) return 0;
      let removed = 0;
      const match = (x) =>
        x &&
        String(x.reason || "") === "crowd_vote_cost" &&
        String(x.sourceId || "") === String(voterId || "") &&
        String(x.battleId || "") === String(battleId || "");
      for (let i = dbg.moneyLog.length - 1; i >= 0; i--) {
        if (match(dbg.moneyLog[i])) { dbg.moneyLog.splice(i, 1); removed++; }
      }
      const byBattle = dbg.moneyLogByBattle && dbg.moneyLogByBattle[battleId];
      if (Array.isArray(byBattle)) {
        for (let i = byBattle.length - 1; i >= 0; i--) {
          if (match(byBattle[i])) { byBattle.splice(i, 1); }
        }
      }
      return removed;
    }

    const simDebugSteps = [];
    if (e && typeof e === "object") {
      e.simDebugSteps = simDebugSteps;
    }
    let voted = false;
    let votesEmitted = 0;

    // Emit as many votes as needed to catch up, but cap per tick.
    while (votesEmitted < maxVotesPerTick) {
      if (now < crowd.nextNpcVoteAt) break;

      // Ensure crowd.voters exists
      if (!crowd.voters || typeof crowd.voters !== "object") crowd.voters = {};

      // Require a fresh voter; stop when exhausted.
      const voter = pickVoter();
      if (!voter || !voter.id) {
        const totalVotes = getCrowdTotalVotes(crowd);
        if (Number.isFinite(crowd.cap) && totalVotes < crowd.cap) {
          crowd.cap = totalVotes | 0;
          finalizeOpenEventByCap(e);
        }
        break;
      }

      const side = decideSide();
      const w = npcVoteWeight(voter);
      const voterId = voter.id;
      const stateNpc = getPlayerById(voterId) || voter;
      const beforePts = Number.isFinite(stateNpc && stateNpc.points) ? (stateNpc.points | 0) : 0;
      const voteBattleId = e && (e.battleId || e.relatedBattleId || e.refId || e.id || null);
      const actionNonce = `npc_vote_${voterId}_${votesEmitted}_${Date.now()}`;
      const price = calcFinalPrice({ basePrice: 1, actorPoints: beforePts, priceKey: "vote", context: { battleId: voteBattleId, actionNonce } });
      const cost = price.finalPrice;
      const costCountBefore = countCrowdVoteCostLogs(voterId, voteBattleId);
      const ok = (Econ && typeof Econ.transferCrowdVoteCost === "function")
        ? Econ.transferCrowdVoteCost(voterId, "sink", cost, {
          battleId: voteBattleId,
          basePrice: price.basePrice,
          mult: price.mult,
          finalPrice: price.finalPrice,
          priceKey: price.priceKey || "vote",
          pointsAtPurchase: beforePts,
          context: price.context || { battleId: voteBattleId, actionNonce }
        })
        : Econ.transferPoints(voterId, "sink", cost, "crowd_vote_cost", {
          battleId: voteBattleId,
          basePrice: price.basePrice,
          mult: price.mult,
          finalPrice: price.finalPrice,
          priceKey: price.priceKey || "vote",
          pointsAtPurchase: beforePts,
          context: price.context || { battleId: voteBattleId, actionNonce }
        });
      const stateNpcAfter = getPlayerById(voterId) || stateNpc;
      const afterPts = Number.isFinite(stateNpcAfter && stateNpcAfter.points) ? (stateNpcAfter.points | 0) : 0;
      const costCountAfter = countCrowdVoteCostLogs(voterId, voteBattleId);
      if (!ok || !ok.ok || (afterPts !== (beforePts - cost))) {
        crowd.lastTickWhy = "payment_failed";
        const cleanupAttempted = !!(ok && ok.ok);
        let cleanupRemoved = false;
        if (ok && ok.ok && (afterPts !== (beforePts - 1))) {
          cleanupRemoved = !!removeCrowdVoteCostLog(voterId, voteBattleId);
        }
        simDebugSteps.push({
          voterId,
          beforePts,
          afterPts,
          costCountBefore,
          costCountAfter,
          transferOk: !!(ok && ok.ok),
          cleanupAttempted,
          cleanupRemoved,
          excludedReason: "payment_failed",
          voteCounted: false
        });
        votesEmitted++;
        continue;
      }

      if (!npcPaidSet[voterId]) {
        npcPaidSet[voterId] = true;
      }
      crowd.npcPaidOrder = Array.isArray(crowd.npcPaidOrder) ? crowd.npcPaidOrder : [];
      if (!crowd.npcPaidOrder.includes(voterId)) crowd.npcPaidOrder.push(voterId);

      const maxNpcShare = getMaxNpcShare();
      const totalPlayers = Number.isFinite(crowd.totalPlayers) ? (crowd.totalPlayers | 0) : getTotalPlayersCount();
      const npcCap = Math.floor(maxNpcShare * totalPlayers);
      crowd.npcCountedIds = Array.isArray(crowd.npcCountedIds) ? crowd.npcCountedIds : [];
      const countedSoFar = crowd.npcCountedIds.length | 0;
      if (npcCap <= 0 || countedSoFar >= npcCap) {
        crowd.lastTickWhy = "excluded_by_npc_cap";
        crowd.excludedNpcVotes = crowd.excludedNpcVotes || {};
        crowd.excludedNpcVotes[voterId] = "excluded_by_npc_cap";
        simDebugSteps.push({
          voterId,
          beforePts,
          afterPts,
          costCountBefore,
          costCountAfter,
          transferOk: true,
          cleanupAttempted: false,
          cleanupRemoved: false,
          excludedReason: "excluded_by_npc_cap",
          voteCounted: false,
          npcCap,
          countedSoFar
        });
        votesEmitted++;
        paceNext();
        continue;
      }

      // Record voter side and award REP (paid vote only).
      crowd.voters[voterId] = side;
      awardCrowdVoteRep(voterId, e);
      crowd.npcCountedIds.push(voterId);

      if (side === "a") crowd.aVotes = (crowd.aVotes|0) + w;
      else crowd.bVotes = (crowd.bVotes|0) + w;
      crowd.lastTickWhy = "vote_counted";

      mirrorCrowdVotesToEvent(e);
      const costCountAfterOk = countCrowdVoteCostLogs(voterId, voteBattleId);
      simDebugSteps.push({
        voterId,
        beforePts,
        afterPts,
        costCountBefore,
        costCountAfter: costCountAfterOk,
        transferOk: true,
        cleanupAttempted: false,
        cleanupRemoved: false,
        excludedReason: null,
        voteCounted: true
      });
      if (finalizeOpenEventByCap(e)) return true;

      // Sync NPC votes into battle.crowd too (fixes DUM-024)
      const battleId = e.battleId || e.relatedBattleId || e.refId;
      if (battleId) {
        const b = findBattleById(battleId);
        if (b && b.crowd && typeof b.crowd === "object") {
          b.crowd.aVotes = (crowd.aVotes | 0);
          b.crowd.bVotes = (crowd.bVotes | 0);
          b.crowd.votesA = (crowd.votesA | 0);
          b.crowd.votesB = (crowd.votesB | 0);
          // Sync voters map too
          b.crowd.voters = b.crowd.voters || {};
        if (voter && voter.id) {
          b.crowd.voters[voter.id] = side;
        }
          
          // Trigger immediate UI update (fixes DUM-030)
          try {
            if (Game.UI && typeof Game.UI.updateBattleCounters === "function") {
              Game.UI.updateBattleCounters(battleId);
            }
          } catch (_) {}
          // Immediate cap check for battle-backed draw.
          try {
            const Core = (Game && (Game.ConflictCore || Game._ConflictCore)) ? (Game.ConflictCore || Game._ConflictCore) : null;
            if (Core && typeof Core.applyCrowdVoteTick === "function") {
              Core.applyCrowdVoteTick(battleId);
            }
          } catch (_) {}
        }
      }

      voted = true;
      votesEmitted++;

      // Advance pacing for the next NPC vote.
      paceNext();

      // Re-check time bound in case we emitted late.
      if (now >= endAt) break;
    }

    return voted;
  }

  function pushSystem(msg){
    // Prefer UI system log if available, fall back to console.
    if (Game.UI && typeof Game.UI.pushSystem === "function") {
      Game.UI.pushSystem(msg);
      return;
    }
    if (Game.__A && typeof Game.__A.pushSystem === "function") {
      Game.__A.pushSystem(msg);
      return;
    }
    console.log(msg);
  }

  // Guard against recursive render calls (prevents infinite loop)
  let _renderPending = false;
  function requestRender(){
    if (_renderPending) return; // Already scheduled, skip
    _renderPending = true;
    // Use setTimeout to break synchronous call chain and prevent recursion
    setTimeout(() => {
      _renderPending = false;
      try {
        if (Game.UI && typeof Game.UI.renderEvents === "function") return Game.UI.renderEvents();
        if (Game.UI && typeof Game.UI.requestRenderAll === "function") return Game.UI.requestRenderAll();
        if (Game.UI && typeof Game.UI.renderAll === "function") {
          return setTimeout(() => { try { Game.UI.renderAll(); } catch (_) {} }, 0);
        }
      } catch (_) {}
    }, 0);
  }

  function sysNpcDrawStartLine(aName, aInf, bName, bInf){
    const fallback = `Тут ничья!!! ${aName} [${aInf ?? "?"}] vs ${bName} [${bInf ?? "?"}]. Выбирай, за кого топишь.`;
    const fn = D && D.SYS && D.SYS.npcDrawCallToAction;
    if (typeof fn === "function") {
      try { return fn(aName, aInf, bName, bInf) || fallback; } catch (_) { return fallback; }
    }
    return fallback;
  }

  function sysNpcDrawResolvedLine(winnerName, loserName){
    const fallback = `Всё, финал. Затащил ${winnerName}. ${loserName} проигрывает.`;
    const fn = D && D.SYS && D.SYS.npcDrawResolved;
    if (typeof fn === "function") {
      try {
        const s = fn(winnerName, loserName);
        return s ? s : fallback;
      } catch (_) {
        return fallback;
      }
    }
    return fallback;
  }

  function npcEscapeResolvedLines(e, winner){
    const aName = e.aName || "Игрок A";
    const bName = e.bName || "Игрок B";
    const mode = e.escapeMode || "smyt";
    const aWins = (winner === "a");
    if (mode === "off") {
      const cardLine = aWins ? `${aName} послал ${bName}` : `${aName} не послал ${bName}`;
      const chatLine = aWins
        ? `Решением толпы ${aName} послал ${bName}.`
        : `Решением толпы ${aName} не смог послать ${bName}.`;
      return { cardLine, chatLine };
    }
    const cardLine = aWins
      ? `${aName} свалил от ${bName}`
      : `${aName} не свалил от ${bName}`;
    const chatLine = aWins
      ? `Решением толпы ${aName} свалил от ${bName}.`
      : `Решением толпы ${aName} не смог свалить от ${bName}.`;
    return { cardLine, chatLine };
  }

  function capEvents(max = 12){
    ensureState();
    while (Game.__S.events.length > max) Game.__S.events.pop();
  }

  function hasEventByBattleId(battleId){
    ensureState();
    return Game.__S.events.some(e => e && (e.type === "draw" || e.kind === "draw") && e.battleId === battleId);
  }

  function removeEvent(id){
    ensureState();
    Game.__S.events = Game.__S.events.filter(x => x.id !== id);
    requestRender();
  }

  // ------------------------------
  // NPC vs NPC event generator
  // ------------------------------

  function makeNpcEvent(aId, bId){
    ensureState();
    if (Game && Game.__D && Game.__D.PAUSE_EVENTS === true) return null;

    const players = (Game.__S && Game.__S.players) ? Game.__S.players : {};

    // Only NPC participants, exclude cop (cop never battles) and keep it generic.
    const npcs = Object.values(players).filter(p => {
      if (!p) return false;
      const isNpc = (p.npc === true || p.type === "npc");
      if (!isNpc) return false;
      if (isCopRole(p)) return false; // cop never battles
      return true;
    });

    if (npcs.length < 2) return null;

    const isValidNpc = (p) => p && (p.npc === true || p.type === "npc") && !isCopRole(p);
    let a = (aId && players[aId]) ? players[aId] : null;
    let b = (bId && players[bId]) ? players[bId] : null;
    if (!isValidNpc(a)) a = null;
    if (!isValidNpc(b)) b = null;
    if (a && b && a.id === b.id) b = null;

    if (!a) a = pickOne(npcs);
    if (!b) b = pickOne(npcs);
    let tries = 0;
    while (b && a && b.id === a.id && tries < 8){
      b = pickOne(npcs);
      tries++;
    }
    if (!a || !b || a.id === b.id) return null;

    const id = `ed_npc_${now()}_${Math.floor(Math.random() * 9999)}`;
    const resolveIn = DRAW_VOTE_DURATION_MS;
    const endAt = now() + resolveIn;

    const aName = a.name || "Игрок A";
    const bName = b.name || "Игрок B";
    const aInf = Number(a.influence || 0);
    const bInf = Number(b.influence || 0);

    const line = `Толпа решает: ${aName} [${aInf}] и ${bName} [${bInf}].`;

    return {
      id,

      // Canonical draw event shape
      kind: "draw",
      type: "draw",
      title: "Толпа решает",

      aId: a.id,
      bId: b.id,
      aName,
      bName,
      aInf,
      bInf,

      // Voting state (keep backward-compatible fields too)
      votesA: 0,
      votesB: 0,
      aVotes: 0,
      bVotes: 0,
      playerVoted: false,
      myVote: null,

      // Timer state
      createdAt: now(),
      endsAt: endAt,
      state: "open",
      resolveAt: 0,
      crowd: {
        votesA: 0,
        votesB: 0,
        aVotes: 0,
        bVotes: 0,
        endAt,
        decided: false,
        nextNpcVoteAt: 0,
        winner: null,
        voters: {},
        eligibleNpcCount: 0,
        alreadyVotedCount: 0,
        endedBy: null,
      },

      // UI text
      meta: `${aName} [${aInf}] - ${bName} [${bInf}]`,
      text: line,
      resultLine: "",
      note: "",

      // No navigation target for generated NPC-NPC draws
      action: "event",
      refId: id,
    };
  }

  function makeNpcEscapeEvent(aId, bId){
    ensureState();
    const players = (Game.__S && Game.__S.players) ? Game.__S.players : {};
    const isValidNpc = (p) => p && (p.npc === true || p.type === "npc") && !isCopRole(p);
    let a = (aId && players[aId]) ? players[aId] : null;
    let b = (bId && players[bId]) ? players[bId] : null;
    if (!isValidNpc(a)) a = null;
    if (!isValidNpc(b)) b = null;
    if (a && b && a.id === b.id) b = null;
    const npcs = Object.values(players).filter(isValidNpc);
    if (!a) a = pickOne(npcs);
    if (!b) b = pickOne(npcs);
    let tries = 0;
    while (b && a && b.id === a.id && tries < 8){
      b = pickOne(npcs);
      tries++;
    }
    if (!a || !b || a.id === b.id) return null;

    const id = `ed_escape_${now()}_${Math.floor(Math.random() * 9999)}`;
    const resolveIn = DRAW_VOTE_DURATION_MS;
    const endAt = now() + resolveIn;

    const aInf = Number(a.influence || 0);
    const bInf = Number(b.influence || 0);
    const isStrong = bInf >= 5;
    const escapeMode = isStrong ? "off" : "smyt";
    const voteLabels = isStrong
      ? { a: "Отвали!", b: "Останься!" }
      : { a: "Свали!", b: "Останься!" };

    const title = isStrong
      ? `${a.name} хочет, чтобы ${b.name} отвалил`
      : `${a.name} хочет свалить от ${b.name}`;
    const line = isStrong
      ? `Толпа решает: ${a.name} хочет, чтобы ${b.name} отвалил.`
      : `Толпа решает: ${a.name} хочет свалить от ${b.name}.`;

    return {
      id,
      kind: "escape",
      type: "escape",
      title,

      aId: a.id,
      bId: b.id,
      aName: a.name || "NPC A",
      bName: b.name || "NPC B",
      aInf,
      bInf,
      escapeMode,

      voteLabels,
      votesA: 0,
      votesB: 0,
      aVotes: 0,
      bVotes: 0,
      playerVoted: false,
      myVote: null,

      createdAt: now(),
      endsAt: endAt,
      state: "open",
      resolveAt: 0,
      crowd: {
        votesA: 0,
        votesB: 0,
        aVotes: 0,
        bVotes: 0,
        endAt,
        decided: false,
        nextNpcVoteAt: 0,
        winner: null,
        voters: {},
        eligibleNpcCount: 0,
        alreadyVotedCount: 0,
        endedBy: null,
      },

      meta: `${voteLabels.a} / ${voteLabels.b}`,
      text: line,
      resultLine: "",
      note: "",

      action: "event",
      refId: id,
    };
  }

  function addEvent(e){
    ensureState();

    if (!e) return;

    // Events = only foreign NPC-NPC draws. Never include me.
    const kind = e.kind || e.type;
    const res = e.result || e.status;
    const isDrawEvent = (kind === "draw") || (res === "draw") || (res === "tie");
    const isEscapeEvent = (kind === "escape");
    if (!isDrawEvent && !isEscapeEvent) return;

    // Must have 2 participants
    if (!e.aId || !e.bId) return;
    if (isMeId(e.aId) || isMeId(e.bId)) return;

    const pa = getPlayerById(e.aId);
    const pb = getPlayerById(e.bId);
    const aIsNpc = pa && (pa.npc === true || pa.type === "npc");
    const bIsNpc = pb && (pb.npc === true || pb.type === "npc");
    if (!aIsNpc || !bIsNpc) return;

    // Cop never battles, so cop must not appear in events
    if (isCopRole(pa) || isCopRole(pb)) return;

    // Normalize vote/timer fields for UI (ui-events reads these)
    e.crowd ||= { voters: {} };
    if (typeof e.crowd !== "object") e.crowd = { voters: {} };
    e.crowd.voters ||= {};
    if (!Number.isFinite(e.crowd.nextNpcVoteAt)) e.crowd.nextNpcVoteAt = 0;

    if (!Number.isFinite(e.crowd.aVotes) && Number.isFinite(e.crowd.votesA)) e.crowd.aVotes = e.crowd.votesA;
    if (!Number.isFinite(e.crowd.bVotes) && Number.isFinite(e.crowd.votesB)) e.crowd.bVotes = e.crowd.votesB;
    if (!Number.isFinite(e.crowd.votesA) && Number.isFinite(e.crowd.aVotes)) e.crowd.votesA = e.crowd.aVotes;
    if (!Number.isFinite(e.crowd.votesB) && Number.isFinite(e.crowd.bVotes)) e.crowd.votesB = e.crowd.bVotes;

    if (!Number.isFinite(e.crowd.aVotes)) e.crowd.aVotes = 0;
    if (!Number.isFinite(e.crowd.bVotes)) e.crowd.bVotes = 0;
    if (!Number.isFinite(e.crowd.votesA)) e.crowd.votesA = e.crowd.aVotes;
    if (!Number.isFinite(e.crowd.votesB)) e.crowd.votesB = e.crowd.bVotes;

    if (!Number.isFinite(e.votesA)) e.votesA = e.crowd.votesA;
    if (!Number.isFinite(e.votesB)) e.votesB = e.crowd.votesB;
    if (!Number.isFinite(e.aVotes)) e.aVotes = e.crowd.aVotes;
    if (!Number.isFinite(e.bVotes)) e.bVotes = e.crowd.bVotes;

    // Ensure end timestamp exists in one canonical place
    if (!Number.isFinite(e.endsAt)) e.endsAt = Number(e.crowd.endAt || 0);
    if (!Number.isFinite(e.crowd.endAt)) e.crowd.endAt = Number(e.endsAt || 0);

    e.state ||= "open";
    if (!Number.isFinite(e.resolveAt)) e.resolveAt = 0;

    Game.__S.events.unshift(e);
    capEvents();
    bumpEventBadgeIfCollapsed();

    // NPC-NPC события должны звучать как SYS с идеальной пунктуацией.
    if (e && e.aName && e.bName && !e.announced && !e.uiAnnounced && !e.skipSys) {
      const line = isEscapeEvent
        ? (e.text || `Толпа решает: ${e.aName} и ${e.bName}.`)
        : sysNpcDrawStartLine(e.aName, e.aInf, e.bName, e.bInf);
      pushSystem(line);
      e.announced = true;
    }

    requestRender();
  }

  function helpEvent(eventId, side){
    ensureState();

    const e = Game.__S.events.find(x => x.id === eventId);
    if (!e || e.state !== "open") return false;

    // Voting must never stop NPC simulation. playerVoted only blocks a second player vote.
    ensureEventCrowd(e);

    const me = (Game.__S && Game.__S.me) ? Game.__S.me : null;
    const meId = (me && me.id) ? me.id : "me";
    if (Game.SecurityPolicy && Game.SecurityPolicy.isActionBlocked(meId, "vote")) {
      const flag = (Game.SecurityPolicy && typeof Game.SecurityPolicy.getFlag === "function")
        ? Game.SecurityPolicy.getFlag(meId)
        : null;
      const blockerText = flag ? (flag.reason || flag.type || "security_flag") : "security_flag";
      const hint = `Служба безопасности блокирует голосование.${blockerText ? ` Причина: ${blockerText}` : ""}`;
      e.note = hint;
      requestRender();
      try {
        console.log(`[FLOW_AUDIT] startup-blocker action=vote blocker=${blockerText}`);
      } catch (_) {}
      try {
        console.log(`[UX_AUDIT] action-disabled-hint action=vote reason=${blockerText}`);
      } catch (_) {}
      return false;
    }

    e.note = "";

    if (side === "skip"){
      removeEvent(eventId);
      return true;
    }

    // Block only a second player vote, but keep the event open for NPC votes until endsAt.
    if (e.playerVoted) {
      e.note = "Ты уже проголосовал.";
      requestRender();
      return false;
    }

    const spend = (Game.__A && typeof Game.__A.spendPoints === "function")
      ? Game.__A.spendPoints
      : null;
    const basePrice = 1;
    const battleId = e && (e.battleId || e.relatedBattleId || e.refId || null);
    const mePoints = (me && Number.isFinite(me.points)) ? (me.points | 0) : 0;
    const price = calcFinalPrice({ basePrice, actorPoints: mePoints, priceKey: "vote", context: { battleId } });
    const voteCost = price.finalPrice;

    // Record the player's vote into the crowd (weight = 1).
    ensureEventCrowd(e);
    const crowd = e.crowd;
    crowd.voters ||= {};

    // If somehow already present, treat as already voted.
    if (crowd.voters[meId]) {
      e.playerVoted = true;
      e.myVote = crowd.voters[meId];
      e.bet = { side: e.myVote };
      e.reveal = true;
      e.note = "Ты уже проголосовал.";
      requestRender();
      return false;
    }

    if (isCirculationEnabled()) {
      const Econ = getEcon();
      const ok = Econ && typeof Econ.chargePriceOnce === "function"
        ? Econ.chargePriceOnce({
            fromId: "me",
            toId: "sink",
            actorId: "me",
            reason: "crowd_vote_cost",
            priceKey: price.priceKey || "vote",
            basePrice: basePrice,
            actorPoints: mePoints,
            battleId,
            context: price.context || { battleId }
          })
        : null;
      if (!ok || !ok.ok) {
        e.note = "Не хватает пойнтов.";
        requestRender();
        return false;
      }
    } else if (spend) {
      markLegacyEconHit("events.voteCost.spendPoints");
      if (!spend(voteCost, "crowd_vote_cost")) {
        e.note = "Не хватает пойнтов.";
        requestRender();
        return false;
      }
    } else {
      markLegacyEconHit("events.voteCost.directPoints");
      const me2 = Game.__S && Game.__S.me ? Game.__S.me : null;
      if (!me2 || (me2.points | 0) < voteCost) {
        e.note = "Не хватает пойнтов.";
        requestRender();
        return false;
      }
      const beforePts = (me2.points | 0);
      const afterPts = clamp0(beforePts - voteCost);
      me2.points = afterPts;
      try {
        if (Game && Game.__A && typeof Game.__A.emitStatDelta === "function") {
          Game.__A.emitStatDelta("points", (afterPts - beforePts) | 0, { reason: "crowd_vote_cost", battleId: e && (e.battleId || e.relatedBattleId || e.refId || null) });
        }
      } catch (_) {}
    }

    crowd.voters[meId] = side;
    crowd.aVotes = (crowd.aVotes | 0);
    crowd.bVotes = (crowd.bVotes | 0);
    crowd.votesA = (crowd.votesA ?? crowd.aVotes) | 0;
    crowd.votesB = (crowd.votesB ?? crowd.bVotes) | 0;

    if (side === "a") crowd.aVotes = (crowd.aVotes | 0) + 1;
    else crowd.bVotes = (crowd.bVotes | 0) + 1;

    awardCrowdVoteRep(meId, e);

    // Keep mirrored fields consistent for UI
    mirrorCrowdVotesToEvent(e);

    if (finalizeOpenEventByCap(e)) {
      requestRender();
      return true;
    }

    // Toast on click: reflect price (REP participation is applied on resolve)
    try {
      if (Game.UI && typeof Game.UI.pushSystem === "function") {
        Game.UI.pushSystem(`-${voteCost}💰`);
      }
      if (Game.UI && typeof Game.UI.requestRenderAll === "function") {
        Game.UI.requestRenderAll();
      }
    } catch (_) {}

    // Player vote must NOT stop NPC votes. Nudge the NPC vote timer so simulation continues.
    if (e.crowd && typeof e.crowd === "object") {
      e.crowd.nextNpcVoteAt = 0;
    }

    // Persist into battle crowd too, if this event is backed by a battle.
    const battleCrowdId = e.battleId || e.relatedBattleId || e.refId;
    if (battleId) {
      const b = findBattleById(battleId);
      if (b && b.crowd && typeof b.crowd === "object") {
        b.crowd.voters ||= {};
        if (!b.crowd.voters[meId]) {
          b.crowd.voters[meId] = side;
          b.crowd.aVotes = ((b.crowd.aVotes ?? b.crowd.votesA) | 0);
          b.crowd.bVotes = ((b.crowd.bVotes ?? b.crowd.votesB) | 0);
          if (side === "a") b.crowd.aVotes = (b.crowd.aVotes|0) + 1;
          else b.crowd.bVotes = (b.crowd.bVotes|0) + 1;
          b.crowd.votesA = (b.crowd.aVotes|0);
          b.crowd.votesB = (b.crowd.bVotes|0);

          // Keep NPC voting running even after the player's vote.
          b.crowd.nextNpcVoteAt = 0;
        }
        // Immediate cap check for battle-backed draw.
        try {
          const Core = (Game && (Game.ConflictCore || Game._ConflictCore)) ? (Game.ConflictCore || Game._ConflictCore) : null;
        if (Core && typeof Core.applyCrowdVoteTick === "function") {
          Core.applyCrowdVoteTick(battleCrowdId);
        }
        } catch (_) {}
      }
    }

    // Mark local UI flags
    e.playerVoted = true;
    e.myVote = side;
    e.bet = { side, cost: voteCost };
    e.reveal = true;
    e.voteRewardApplied = false;

    requestRender();
    return true;
  }

  function addExtraVote(eventId, side){
    ensureState();
    const e = Game.__S.events.find(x => x && x.id === eventId);
    if (!e || e.state !== "open") return false;

    const spend = (Game.__A && typeof Game.__A.spendPoints === "function")
      ? Game.__A.spendPoints
      : null;
    const D0 = Game.Data || {};
    const basePrice = Number.isFinite(D0.COST_CROWD_EXTRA_VOTE) ? (D0.COST_CROWD_EXTRA_VOTE | 0) : 2;
    const eventBattleId = e && (e.battleId || e.relatedBattleId || e.refId || null);
    const me = (Game.__S && Game.__S.me) ? Game.__S.me : null;
    const mePoints = (me && Number.isFinite(me.points)) ? (me.points | 0) : 0;
    const price = calcFinalPrice({ basePrice, actorPoints: mePoints, priceKey: "vote_extra", context: { battleId: eventBattleId } });
    const cost = price.finalPrice;
    if (isCirculationEnabled()) {
      const Econ = getEcon();
      const ok = Econ && typeof Econ.chargePriceOnce === "function"
        ? Econ.chargePriceOnce({
            fromId: "me",
            toId: "sink",
            actorId: "me",
            reason: "crowd_vote_cost",
            priceKey: price.priceKey || "vote_extra",
            basePrice: basePrice,
            actorPoints: mePoints,
            battleId: eventBattleId,
            context: price.context || { battleId: eventBattleId, eventId: e && e.id ? e.id : null }
          })
        : null;
      if (!ok || !ok.ok) {
        e.note = "Не прокает: нет P.";
        requestRender();
        return false;
      }
    } else if (spend && !spend(cost, "crowd_vote_cost")) {
      markLegacyEconHit("events.addExtraVote.spendPoints");
      e.note = "Не прокает: нет P.";
      requestRender();
      return false;
    }

    ensureEventCrowd(e);
    const crowd = e.crowd;
    crowd.aVotes = (crowd.aVotes | 0);
    crowd.bVotes = (crowd.bVotes | 0);

    if (side === "a") crowd.aVotes = (crowd.aVotes | 0) + 1;
    else crowd.bVotes = (crowd.bVotes | 0) + 1;

    mirrorCrowdVotesToEvent(e);
    if (finalizeOpenEventByCap(e)) {
      requestRender();
      return true;
    }

    // Sync to battle-backed crowd too
    const battleRef = e.battleId || e.relatedBattleId || e.refId;
    if (battleId) {
      const b = findBattleById(battleId);
      if (b && b.crowd && typeof b.crowd === "object") {
        b.crowd.aVotes = ((b.crowd.aVotes ?? b.crowd.votesA) | 0);
        b.crowd.bVotes = ((b.crowd.bVotes ?? b.crowd.votesB) | 0);
        if (side === "a") b.crowd.aVotes = (b.crowd.aVotes | 0) + 1;
        else b.crowd.bVotes = (b.crowd.bVotes | 0) + 1;
        b.crowd.votesA = (b.crowd.aVotes | 0);
        b.crowd.votesB = (b.crowd.bVotes | 0);
      }
      // Immediate cap check for battle-backed draw.
      try {
        const Core = (Game && (Game.ConflictCore || Game._ConflictCore)) ? (Game.ConflictCore || Game._ConflictCore) : null;
        if (Core && typeof Core.applyCrowdVoteTick === "function") {
          Core.applyCrowdVoteTick(battleRef);
        }
      } catch (_) {}
    }

    requestRender();
    return true;
  }

  function activateVoteShield(eventId){
    ensureState();
    const e = Game.__S.events.find(x => x && x.id === eventId);
    if (!e || e.state !== "open") return false;
    if (e.voteShielded) return true;

    const spend = (Game.__A && typeof Game.__A.spendPoints === "function")
      ? Game.__A.spendPoints
      : null;
    const D0 = Game.Data || {};
    const basePrice = Number.isFinite(D0.COST_VOTE_SHIELD) ? (D0.COST_VOTE_SHIELD | 0) : 1;
    const battleId = e && (e.battleId || e.relatedBattleId || e.refId || null);
    const me = (Game.__S && Game.__S.me) ? Game.__S.me : null;
    const mePoints = (me && Number.isFinite(me.points)) ? (me.points | 0) : 0;
    const price = calcFinalPrice({ basePrice, actorPoints: mePoints, priceKey: "vote_shield", context: { battleId } });
    const cost = price.finalPrice;
    if (isCirculationEnabled()) {
      const Econ = getEcon();
      const ok = Econ && typeof Econ.chargePriceOnce === "function"
        ? Econ.chargePriceOnce({
            fromId: "me",
            toId: getCrowdPoolId(e),
            actorId: "me",
            reason: "crowd_vote_cost",
            priceKey: price.priceKey || "vote_shield",
            basePrice: basePrice,
            actorPoints: mePoints,
            battleId,
            context: price.context || { battleId }
          })
        : null;
      if (!ok || !ok.ok) {
        e.note = "Не прокает: нет P.";
        requestRender();
        return false;
      }
    } else if (spend && !spend(cost, "tie_vote_shield")) {
      markLegacyEconHit("events.activateVoteShield.spendPoints");
      e.note = "Не прокает: нет P.";
      requestRender();
      return false;
    }
    e.voteShielded = true;
    e.note = "Щит голоса активен.";
    requestRender();
    return true;
  }

  function resolveEvent(e){
    if (!e || e.state !== "open") return;

    e.state = "resolved";
    e.reveal = true;
    e.note = "";

    let pA = argPower(e.atkA && e.atkA.color);
    let pB = argPower(e.defB && e.defB.color);

    if (e.bet && e.bet.side === "a") pA += 1;
    if (e.bet && e.bet.side === "b") pB += 1;

    e.pA = pA;
    e.pB = pB;

    if (pA === pB){
      e.result = "tie";
      const line = (D && D.SYS && typeof D.SYS.npcBattleEndDraw === "function")
        ? D.SYS.npcBattleEndDraw(e.aName, e.bName)
        : `Силы равны. ${e.aName} и ${e.bName} расходятся под шум площади.`;
      e.resultLine = line;
      pushSystem(line);
      return;
    }

    e.result = (pA > pB) ? "a" : "b";
    const winnerName = (e.result === "a") ? e.aName : e.bName;
    const loserName = (e.result === "a") ? e.bName : e.aName;

    const line = (D && D.SYS && typeof D.SYS.npcBattleEndWin === "function")
      ? D.SYS.npcBattleEndWin(winnerName, loserName)
      : `Исход решён. ${winnerName} одержал(а) верх над ${loserName}.`;

    e.resultLine = line;
    pushSystem(line);

    if (e.bet) applyBetOutcome(e, e.result);
  }

  function pruneResolved(){
    ensureState();
    const nowTs = now();
    Game.__S.events = Game.__S.events.filter(e => {
      if (e.state !== "resolved") return true;
      const ra = Number(e.resolveAt || 0);
      if (!ra) return true;
      return (nowTs - ra) < 2500;
    });
  }

  // ------------------------------
  // Foreign draw events (NO 'me')
  // ------------------------------

  function battleIsDraw(battle){
    if (!battle) return false;
    const s = battle.status;
    const r = battle.result;
    return battle.draw === true || s === "draw" || s === "tie" || r === "draw" || r === "tie";
  }

  function getBattleParticipants(battle){
    // Try multiple model shapes.
    const aId = battle.aId || battle.attackerId || battle.playerAId || battle.p1Id || battle.p1 || null;
    const bId = battle.bId || battle.defenderId || battle.playerBId || battle.p2Id || battle.p2 || null;

    // Classic me-vs-opponent battles in this project often have opponentId.
    const oppId = battle.opponentId || null;

    // If it is the classic model, treat it as mine.
    if (oppId) {
      return { aId: "me", bId: oppId, isClassicMeBattle: true };
    }

    // If there is an explicit flag fromThem, it is also the classic model.
    if (typeof battle.fromThem === "boolean") {
      return { aId: "me", bId: battle.opponentId || bId || aId || null, isClassicMeBattle: true };
    }

    return { aId, bId, isClassicMeBattle: false };
  }

  function findBattleById(battleId){
    const list = (Game.__S && Array.isArray(Game.__S.battles)) ? Game.__S.battles : [];
    return list.find(b => b && (b.id === battleId || b.battleId === battleId)) || null;
  }

  function formatCrowdStatusLine(aName, aInf, bName, bInf, crowd){
    // System text: keep punctuation perfect. No NPC chat normalization here.
    let vA = 0;
    let vB = 0;
    if (crowd && crowd.voters && typeof crowd.voters === "object") {
      for (const id of Object.keys(crowd.voters)) {
        const side = crowd.voters[id];
        if (side === "a") vA++;
        else if (side === "b") vB++;
      }
    } else {
      vA = crowd ? ((crowd.aVotes ?? crowd.votesA) | 0) : 0;
      vB = crowd ? ((crowd.bVotes ?? crowd.votesB) | 0) : 0;
    }
    const total = (vA + vB) | 0;
    const cap = (crowd && Number.isFinite(crowd.cap)) ? (crowd.cap | 0) : 0;
    const capPart = cap > 0 ? ` Лимит: ${cap}.` : "";
    return `Толпа решает: ${aName} [${aInf}] и ${bName} [${bInf}]. Голоса: ${vA}-${vB} (всего ${total}${cap ? "/" + cap : ""}).${capPart}`;
  }

  function decideCrowdWinner(aInf, bInf, crowd){
    const participants = (Game && Game.__S && Game.__S.players) ? Object.values(Game.__S.players) : [];
    const res = resolveCrowdCore(crowd, { kind: "event" }, participants);
    if (res && res.outcome === "A_WIN") return "a";
    if (res && res.outcome === "B_WIN") return "b";
    return "tie";
  }

  function getEventsArray(){
    const stateSurface = (Game && Game.__S) ? Game.__S : ((Game && Game.State) ? Game.State : null);
    if (!stateSurface) return [];
    if (Array.isArray(stateSurface.events)) return stateSurface.events;
    if (stateSurface.events && Array.isArray(stateSurface.events.list)) return stateSurface.events.list;
    return [];
  }

  function findEventById(id){
    if (!id) return null;
    ensureState();
    const events = getEventsArray();
    for (const ev of events) {
      if (ev && ev.id === id) return ev;
    }
    return null;
  }

  function determineCrowdDecisionReason(e, res){
    if (!e || !e.crowd) return null;
    const crowd = e.crowd;
    const totalVotes = getCrowdTotalVotes(crowd);
    ensureCrowdCap(e);
    const cap = Number.isFinite(crowd.cap) ? (crowd.cap | 0) : 0;
    const eligible = Number.isFinite(crowd.eligibleNpcCount) ? (crowd.eligibleNpcCount | 0) : null;
    const already = (crowd.voters && typeof crowd.voters === "object")
      ? Object.keys(crowd.voters).length
      : totalVotes | 0;
    crowd.alreadyVotedCount = already;
    if (cap > 0 && totalVotes >= cap) return "cap";
    if (eligible !== null && eligible > 0 && already >= eligible) return "eligible";
    if (eligible === 0 && totalVotes === 0) return "no_eligible_voter";
    if (res && res.decided) return "majority";
    return null;
  }

  function logCrowdDecisionDiag(e, reason, opts){
    if (!e || !e.crowd) return;
    const crowd = e.crowd;
    const dev = (Game && Game.__DEV) ? Game.__DEV : null;
    const diagEnabled = !!((opts && opts.debugCrowdRep) || (dev && dev.debugCrowdRep));
    if (!diagEnabled) return;
    if (crowd._crowdDecisionDiagLogged) return;
    crowd._crowdDecisionDiagLogged = true;
    const eventId = e && (e.id || e.eventId || e.refId || null);
    const cap = Number.isFinite(crowd.cap) ? (crowd.cap | 0) : 0;
    const already = Number.isFinite(crowd.alreadyVotedCount) ? (crowd.alreadyVotedCount | 0) : getCrowdTotalVotes(crowd);
    const eligible = Number.isFinite(crowd.eligibleNpcCount) ? (crowd.eligibleNpcCount | 0) : 0;
    const winner = crowd.winner || null;
    try {
      console.warn(`EVENT_CROWD_DECIDED id=${String(eventId || "")} decided=${!!crowd.decided} winner=${winner || "null"} endedBy=${reason || ""} cap=${cap} alreadyVotedCount=${already} eligibleNpcCount=${eligible}`);
    } catch (_) {}
  }

  function finalizeOpenEventNow(target, opts){
    const dev = (Game && Game.__DEV) ? Game.__DEV : null;
    const diagFinalize = !!((opts && opts.debugFinalize) || (dev && dev.debugFinalize));
    const attemptedId = (typeof target === "string")
      ? target
      : (target && typeof target === "object" ? (target.id || null) : null);
    let e = (typeof target === "string") ? findEventById(target) : target;
    const diagId = (e && e.id) ? e.id : (attemptedId || "");
    if (diagFinalize) {
      try {
        console.warn(`EVENT_FINALIZE_API_CALLED name=finalizeOpenEventNow id=${String(diagId || "")}`);
      } catch (_) {}
    }
    if (!e || typeof e !== "object") {
      if (diagFinalize) {
        try {
          console.warn(`EVENT_FINALIZE_GUARD_BLOCKED id=${String(diagId || "")} state=${String(undefined)} resolved=${String(undefined)} status=${String(undefined)}`);
        } catch (_) {}
      }
      return false;
    }
    const guardState = (typeof e.state !== "undefined") ? e.state : undefined;
    const guardResolved = (typeof e.resolved !== "undefined") ? e.resolved : undefined;
    const guardStatus = (typeof e.status !== "undefined") ? e.status : undefined;
    const stateToken = (typeof guardState !== "undefined") ? guardState
      : (typeof guardResolved !== "undefined") ? guardResolved
      : guardStatus;
    const normalized = (typeof stateToken === "string") ? stateToken : (stateToken != null ? String(stateToken) : "");
    const isOpen = normalized.toLowerCase() === "open";
    if (!isOpen) {
      if (diagFinalize) {
        try {
          console.warn(`EVENT_FINALIZE_GUARD_BLOCKED id=${String(diagId || "")} state=${String(guardState)} resolved=${String(guardResolved)} status=${String(guardStatus)}`);
        } catch (_) {}
      }
      return false;
    }
    ensureEventCrowd(e);
    const crowd = e.crowd;
    if (!crowd || typeof crowd !== "object") return false;
    const kind = e.type || e.kind;
    const nowTs = (opts && Number.isFinite(opts.nowTs)) ? opts.nowTs : now();

    const voterCounts = getCrowdCountsFromVoters(crowd);
    if (voterCounts) {
      crowd.aVotes = voterCounts.a;
      crowd.bVotes = voterCounts.b;
      crowd.votesA = voterCounts.a;
      crowd.votesB = voterCounts.b;
    }

    const participants = (Game && Game.__S && Game.__S.players) ? Object.values(Game.__S.players) : [];
    const res = resolveCrowdCore(crowd, { kind, eventId: e.id || e.eventId || e.refId || null, aId: e.aId, bId: e.bId }, participants);
    const aVotes = (res && res.sideStats && res.sideStats.a) ? (res.sideStats.a.count | 0) : ((crowd.aVotes ?? crowd.votesA) | 0);
    const bVotes = (res && res.sideStats && res.sideStats.b) ? (res.sideStats.b.count | 0) : ((crowd.bVotes ?? crowd.votesB) | 0);
    crowd.aVotes = aVotes;
    crowd.bVotes = bVotes;
    crowd.votesA = aVotes;
    crowd.votesB = bVotes;
    e.aVotes = aVotes;
    e.bVotes = bVotes;
    e.votesA = aVotes;
    e.votesB = bVotes;
    if (!Number.isFinite(e.resolveAt) || !e.resolveAt) e.resolveAt = nowTs;

    const aName = e.aName || "Игрок A";
    const bName = e.bName || "Игрок B";
    const aInf = Number(e.aInf ?? 0);
    const bInf = Number(e.bInf ?? 0);

    const decisionReason = determineCrowdDecisionReason(e, res);
    if (!decisionReason) {
      if (res && res.outcome === "TIE") {
        applyEventCrowdEconomy(e, res);
        restartEventCrowd(e);
        e.playerVoted = false;
        e.myVote = null;
        e.bet = null;
        e.reveal = false;
        e.voteRewardApplied = false;
        e.voteOutcomeApplied = false;
        return true;
      }
      return false;
    }

    const winner = (res && res.outcome === "A_WIN") ? "a" : (res && res.outcome === "B_WIN") ? "b" : null;
    const winnerName = (winner === "a") ? aName : ((winner === "b") ? bName : null);
    const loserName = (winner === "a") ? bName : ((winner === "b") ? aName : null);
    let finalLine;
    if (winner) {
      finalLine = sysNpcDrawResolvedLine(winnerName, loserName);
      if (kind === "escape") {
        const lines = npcEscapeResolvedLines(e, winner);
        finalLine = lines.chatLine;
        e.resultLine = lines.cardLine;
      } else {
        e.resultLine = finalLine;
      }
    } else {
      finalLine = `Голосование толпы закончилось ничьей между ${aName} и ${bName}.`;
      e.resultLine = finalLine;
    }
    e.text = finalLine;
    e.meta = `${aName} [${aInf}] - ${bName} [${bInf}]`;
    e.state = "resolved";
    e.resolved = true;
    e.resolveAt = nowTs;

    crowd.decided = true;
    crowd.winner = winner;
    crowd.endedBy = decisionReason;
    crowd.lastTickWhy = decisionReason;

    if (!e._broadcastResolved) {
      e._broadcastResolved = true;
      pushSystem(finalLine);
    }

    applyEventCrowdEconomy(e, res);
    applyCrowdVoteOutcomeRep(e, res, opts);
    logCrowdDecisionDiag(e, decisionReason, opts);
    return true;
  }

  function finalizeOpenEventByCap(e){
    if (!e || e.state !== "open") return false;
    ensureCrowdCap(e);
    const crowd = e.crowd;
    const totalVotes = getCrowdTotalVotes(crowd);
    if (Number.isFinite(crowd.cap) && totalVotes >= crowd.cap) {
      return finalizeOpenEventNow(e);
    }
    return false;
  }

  function finalizeOpenEventIfExpired(e){
    return false;
  }

  function tick(){
    ensureState();

    // First, sync from battle-backed draws
    try { syncDrawEvents(); } catch (_) {}

    // Then, finalize any standalone open draw events
    let changed = false;
    for (const e of Game.__S.events) {
      if (!e) continue;
      const kind = e.type || e.kind;
      const isCrowd = (kind === "draw" || kind === "escape");
      if (!isCrowd) continue;
      if (finalizeOpenEventByCap(e)) changed = true;
      else if (finalizeOpenEventIfExpired(e)) changed = true;
      else {
        // NPC crowd voting simulation while the draw is open
        try {
          if (simulateNpcVotesForOpenDrawEvent(e, now())) changed = true;
        } catch (_) {}

        // Keep mirrors fresh for UI
        if (e.crowd && typeof e.crowd === "object") {
          mirrorCrowdVotesToEvent(e);
          if (!Number.isFinite(e.endsAt)) e.endsAt = Number(e.crowd.endAt || 0);
        }
      }
    }

    // Cop chatter tick (per-cop cooldown + templates live in State)
    try {
      if (Game.__A && typeof Game.__A.tickCops === "function") {
        const did = !!Game.__A.tickCops(now());
        if (did) changed = true;
      }
    } catch (_) {}

    // World stipend tick (transfer-only) for low/zero NPCs
    try {
      const Econ = Game.ConflictEconomy || Game._ConflictEconomy || null;
      const S = Game.__S || null;
      if (Econ && typeof Econ.maybeWorldStipendTick === "function" && S && S.players) {
        const npcIds = Object.keys(S.players).filter(id => typeof id === "string" && id.startsWith("npc_"));
        if (npcIds.length) {
          Econ.maybeWorldStipendTick({
            npcIds,
            stipendAmount: 1,
            stipendThreshold: 0,
            maxRecipientsPerTick: 1,
            tick: now()
          });
        }
      }
    } catch (_) {}

    if (changed) requestRender();
  }

  function syncDrawEvents(){
    ensureState();
    const evs = Game.__S.events;
    if (!Array.isArray(evs) || !evs.length) return;

    for (const e of evs) {
      if (!e) continue;
      const isDraw = (e.type === "draw" || e.kind === "draw");
      if (!isDraw) continue;
      const battleId = e.battleId || e.refId;
      if (!battleId) continue;

      const b = findBattleById(battleId);
      if (!b) continue;

      // Only foreign draws live here, but keep it safe anyway.
      const { aId, bId, isClassicMeBattle } = getBattleParticipants(b);
      if (isClassicMeBattle || isMeId(aId) || isMeId(bId)) continue;

      const a = Game.__S.players && aId ? Game.__S.players[aId] : null;
      const bb = Game.__S.players && bId ? Game.__S.players[bId] : null;

      const aName = e.aName || b.aName || (a && a.name) || "Игрок A";
      const bName = e.bName || b.bName || (bb && bb.name) || "Игрок B";
      const aInf = Number(e.aInf ?? b.aInf ?? (a && a.influence) ?? 0);
      const bInf = Number(e.bInf ?? b.bInf ?? (bb && bb.influence) ?? 0);

      if (b.crowd && b.status === "draw" && b.draw === true && !b.crowd.decided) {
        const nowTs = now();

        // Keep event vote mirrors in sync (UI reads event fields)
        e.votesA = (b.crowd.votesA|0);
        e.votesB = (b.crowd.votesB|0);
        e.aVotes = (b.crowd.aVotes ?? b.crowd.votesA) | 0;
        e.bVotes = (b.crowd.bVotes ?? b.crowd.votesB) | 0;
        b.crowd.aVotes = e.aVotes;
        b.crowd.bVotes = e.bVotes;

        // If battles crowd voting isn't running elsewhere, simulate it here too.
        // This ensures the timer doesn't sit at 0-0 until expiry.
        try {
          // Reuse event simulation but apply to the battle crowd via mirrors.
          e.crowd = b.crowd;
          simulateNpcVotesForOpenDrawEvent(e, nowTs);
          // Copy back after possible changes
          b.crowd.votesA = (b.crowd.aVotes|0);
          b.crowd.votesB = (b.crowd.bVotes|0);
          e.votesA = (b.crowd.votesA|0);
          e.votesB = (b.crowd.votesB|0);
          e.aVotes = (b.crowd.aVotes|0);
          e.bVotes = (b.crowd.bVotes|0);
        } catch (_) {}

        const line = formatCrowdStatusLine(aName, aInf, bName, bInf, b.crowd);
        e.text = line;
        e.resultLine = line;
        e.meta = `${aName} [${aInf}] - ${bName} [${bInf}]`;
        e.state = "open";
      } else {
        // Crowd decided or battle finished: keep event but freeze a clean final line.
        const base = `Всё, финал: ничья между ${aName} и ${bName}.`;
        e.text = base;
        e.resultLine = base;
        e.meta = `${aName} [${aInf}] - ${bName} [${bInf}]`;
        e.state = "resolved";
      }
    }
  }

  function addDrawEventFromBattle(battle){
    ensureState();
    if (!battleIsDraw(battle)) return;

    const battleId = battle.id || battle.battleId;
    if (!battleId) return;
    if (hasEventByBattleId(battleId)) return;

    const { aId, bId, isClassicMeBattle } = getBattleParticipants(battle);

    // Own draws stay in battles only (do not create Events for me).
    if (isClassicMeBattle) return;
    if (isMeId(aId) || isMeId(bId)) return;

    // NOTE: toxic/bandit are allowed to appear in Events ONLY for draw events.

    // Must have two participants to be meaningful.
    if (!aId || !bId) return;

    // Events = only NPC-NPC draws (no real players, no me).
    const a = Game.__S.players && Game.__S.players[aId];
    const b = Game.__S.players && Game.__S.players[bId];

    const aIsNpc = a && (a.npc === true || a.type === "npc");
    const bIsNpc = b && (b.npc === true || b.type === "npc");
    if (!aIsNpc || !bIsNpc) return;

    // Cop never battles, so cop must not appear in events.
    if (isCopRole(a) || isCopRole(b)) return;

    const aName = battle.aName || a?.name || "Игрок A";
    const bName = battle.bName || b?.name || "Игрок B";
    const aInf = Number(battle.aInf ?? a?.influence ?? 0);
    const bInf = Number(battle.bInf ?? b?.influence ?? 0);

    const id = `ed_${battleId}`;
    // Ensure battle-backed draws always have a working crowd timer.
    if (!battle.crowd || typeof battle.crowd !== "object") battle.crowd = { voters: {} };
    if (!Number.isFinite(battle.crowd.endAt) || !battle.crowd.endAt) battle.crowd.endAt = now() + DRAW_VOTE_DURATION_MS;
    if (!Number.isFinite(battle.crowd.nextNpcVoteAt)) battle.crowd.nextNpcVoteAt = 0;
    battle.crowd.voters ||= {};

    // Canonical, UI-friendly shape (keep backward-compatible fields too)
    const line = `Толпа решает: ${aName} [${aInf}] и ${bName} [${bInf}].`;

    const e = {
      id,

      // Backward-compatible
      type: "draw",
      battleId,
      relatedBattleId: battleId,
      relatedChatId: battle.chatId || battle.chatMessageId || battle.messageId || battle.sysChatId || null,
      aId,
      bId,
      aName,
      bName,
      aInf,
      bInf,

      // Voting state (mirrors crowd)
      votesA: (battle.crowd && (battle.crowd.votesA|0)) || 0,
      votesB: (battle.crowd && (battle.crowd.votesB|0)) || 0,
      playerVoted: false,
      myVote: null,

      // Timer snapshot (if the battle has crowd)
      crowd: battle.crowd ? {
        votesA: (battle.crowd.votesA|0),
        votesB: (battle.crowd.votesB|0),
        endAt: battle.crowd.endAt,
        decided: !!battle.crowd.decided,
        winner: battle.crowd.winner || null,
        voters: (battle.crowd && battle.crowd.voters) ? battle.crowd.voters : {},
      } : null,

      // UI-friendly
      kind: "draw",
      title: "Толпа решает",
      meta: `${aName} [${aInf}] - ${bName} [${bInf}]`,
      text: line,

      createdAt: now(),
      state: "open",
      note: "",
      resultLine: line,

      // For anchor / navigation
      action: "battle",
      refId: battleId,
    };

    Game.__S.events.unshift(e);
    // Normalize mirrors for UI (endsAt + votes fields)
    ensureEventCrowd(e);
    mirrorCrowdVotesToEvent(e);
    // Safety: remove any older duplicates that might have slipped in
    Game.__S.events = Game.__S.events.filter((x, i, arr) => {
      if (!x) return false;
      if (x.id === id) return arr.findIndex(y => y && y.id === id) === i;
      if (x.type === "draw" && x.battleId === battleId) {
        return arr.findIndex(y => y && y.type === "draw" && y.battleId === battleId) === i;
      }
      return true;
    });

    capEvents();

    // SYS call-to-action in chat (skip if battle already announced)
    if (!battle.sysAnnounced && !battle.uiAnnounced) {
      pushSystem(sysNpcDrawStartLine(aName, aInf, bName, bInf));
    }

    requestRender();
  }

  // ------------------------------
  // Public API
  // ------------------------------

  Events.makeNpcEvent = makeNpcEvent;
  Events.makeNpcEscapeEvent = makeNpcEscapeEvent;
  Events.addEvent = addEvent;
  Events.removeEvent = removeEvent;
  Events.helpEvent = helpEvent;
  Events.addExtraVote = addExtraVote;
  Events.activateVoteShield = activateVoteShield;
  Events.resolveEvent = resolveEvent;
  Events.finalizeOpenEventNow = finalizeOpenEventNow;
  Events.tick = tick;
  Events.pruneResolved = () => {
    syncDrawEvents();
    tick();
    pruneResolved();
  };
  Events.addDrawEventFromBattle = addDrawEventFromBattle;

  Events.getAll = () => {
    ensureState();
    syncDrawEvents();
    return Game.__S.events.slice();
  };

  Events.getCount = () => {
    ensureState();
    return Game.__S.events.length;
  };

  Game.Events = Events;
})();
