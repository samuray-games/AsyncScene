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

  function ensureState(){
    Game.State ||= {};
    Game.State.events ||= [];
  }

  function getEcon(){
    return (Game && Game._ConflictEconomy) ? Game._ConflictEconomy : null;
  }

  function isCirculationEnabled(){
    const Econ = (Game && (Game.ConflictEconomy || Game._ConflictEconomy)) ? (Game.ConflictEconomy || Game._ConflictEconomy) : null;
    if (Econ && typeof Econ.isCirculationEnabled === "function") return Econ.isCirculationEnabled();
    const D0 = Game && Game.Data ? Game.Data : null;
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
    const v = D0 && D0.CIRCULATION_ENABLED;
    return v === true || v === 1 || v === "true" || v === "1";
  }

  function getCrowdPoolId(e){
    const Econ = getEcon();
    if (!Econ || typeof Econ.getCrowdPoolId !== "function") return "crowd";
    const bid = e && (e.battleId || e.relatedBattleId || e.refId || e.id || null);
    return Econ.getCrowdPoolId(bid);
  }

  function transferToCrowd(fromId, amount, reason, e){
    const Econ = getEcon();
    if (!Econ || typeof Econ.transferPoints !== "function") return { ok: false, reason: "no_econ" };
    const poolId = getCrowdPoolId(e);
    return Econ.transferPoints(fromId, poolId, amount, reason, { battleId: e && (e.battleId || e.relatedBattleId || e.refId || null) });
  }

  function payoutCrowdPool(e, winnerSide){
    if (!isCirculationEnabled()) return;
    const Econ = getEcon();
    if (!Econ || typeof Econ.getPoolBalance !== "function" || typeof Econ.transferFromPool !== "function") return;
    const poolId = getCrowdPoolId(e);
    if (Econ.isCrowdPaid && Econ.isCrowdPaid(poolId)) return;
    const crowd = e && e.crowd;
    const voters = crowd && crowd.voters ? crowd.voters : {};
    const aVotes = crowd ? ((crowd.aVotes ?? crowd.votesA) | 0) : 0;
    const bVotes = crowd ? ((crowd.bVotes ?? crowd.votesB) | 0) : 0;
    const allMajority = (aVotes === bVotes);
    const majoritySide = aVotes > bVotes ? "a" : (bVotes > aVotes ? "b" : null);
    const majority = [];
    const minority = [];
    Object.keys(voters || {}).forEach(id => {
      const side = voters[id];
      if (allMajority || side === majoritySide) majority.push(id);
      else minority.push(id);
    });
    const battleId = e && (e.battleId || e.relatedBattleId || e.refId || null);
    let pot = Econ.getPoolBalance(poolId);
    if (pot > 0 && majority.length) {
      for (const vid of majority) {
        if (pot <= 0) break;
        const res = Econ.transferFromPool(poolId, vid, 1, "crowd_vote_refund_majority", { battleId });
        if (res && res.ok) pot = Econ.getPoolBalance(poolId);
      }
    }
    pot = Econ.getPoolBalance(poolId);
    const share = Math.floor(pot / 2);
    const aId = e && e.aId;
    const bId = e && e.bId;
    if (share > 0 && aId) {
      Econ.transferFromPool(poolId, aId, share, "crowd_draw_payout_me", { battleId });
    }
    if (share > 0 && bId) {
      Econ.transferFromPool(poolId, bId, share, "crowd_draw_payout_opp", { battleId });
    }
    if (minority.length || majority.length) {
      const transferRep = (Game.StateAPI && typeof Game.StateAPI.transferRep === "function") ? Game.StateAPI.transferRep : null;
      const repEventId = e && (e.id || e.eventId || e.refId || e.battleId || e.relatedBattleId || null);
      if (transferRep) {
        // Task B: outcome REP - ТОЛЬКО результат (участие уже начислено при клике в helpEvent)
        // +2 for majority, -2 for minority
        for (const vid of majority) {
          transferRep("crowd_pool", vid, 2, "rep_crowd_vote_majority", repEventId);
        }
        for (const vid of minority) {
          transferRep(vid, "crowd_pool", 2, "rep_crowd_vote_minority", repEventId);
        }
        
        // P0-3: показать тосты результата для игрока + мгновенное обновление (символами)
        const meId = (Game.State && Game.State.me && Game.State.me.id) ? Game.State.me.id : "me";
        if (majority.includes(meId)) {
          try {
            if (Game.UI && typeof Game.UI.pushSystem === "function") {
              Game.UI.pushSystem(`+2⭐ +1💰`);
            }
            if (Game.UI && typeof Game.UI.requestRenderAll === "function") {
              Game.UI.requestRenderAll();
            }
          } catch (_) {}
        } else if (minority.includes(meId)) {
          try {
            if (Game.UI && typeof Game.UI.pushSystem === "function") {
              Game.UI.pushSystem(`-2⭐ +0💰`);
            }
            if (Game.UI && typeof Game.UI.requestRenderAll === "function") {
              Game.UI.requestRenderAll();
            }
          } catch (_) {}
        }
      }
    }
    if (Econ.markCrowdPaid) Econ.markCrowdPaid(poolId);
  }

  function isMeId(id){
    if (!id) return false;
    if (id === "me") return true;
    const me = Game.State && Game.State.me;
    return !!(me && me.id && id === me.id);
  }

  function getPlayerById(id){
    return (Game.State && Game.State.players && id) ? Game.State.players[id] : null;
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
    const players = (Game.State && Game.State.players) ? Game.State.players : {};
    return Object.values(players).filter(p => p && (p.npc === true || p.type === "npc"));
  }

  function npcVoteWeight(npc){
    if (!npc) return 1;
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

    const me = Game.State && Game.State.me ? Game.State.me : null;
    const meId = (me && me.id) ? me.id : "me";
    const prevVote = e.myVote;
    const hadPlayerVote = !!e.playerVoted;

    e.crowd.voters = {};
    e.crowd.aVotes = 0;
    e.crowd.bVotes = 0;
    e.crowd.votesA = 0;
    e.crowd.votesB = 0;

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
    e.state = "open";
    mirrorCrowdVotesToEvent(e);
  }

  function applyBetOutcome(e, winnerSide){
    if (!e || e.pickRewardApplied) return;
    if (!e.playerVoted || !e.myVote) return;

    const win = (winnerSide && e.myVote === winnerSide);
    const addPts = (Game.StateAPI && typeof Game.StateAPI.addPoints === "function")
      ? Game.StateAPI.addPoints
      : null;
    const transferRep = (Game.StateAPI && typeof Game.StateAPI.transferRep === "function")
      ? Game.StateAPI.transferRep
      : null;
    const repEventId = e && (e.id || e.eventId || e.refId || e.battleId || e.relatedBattleId || null);

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
        if (addPts) addPts(1, "tie_pick_win");
        e.betMessage = "Итог зафиксирован.";
      }
      if (transferRep) transferRep("crowd_pool", "me", 2, "rep_tie_win", repEventId);
    } else {
      if (transferRep) transferRep("crowd_pool", "me", 1, "rep_tie_lose", repEventId);
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

    const endAt = Number(crowd.endAt || e.endsAt || 0);
    if (!endAt) return false;
    if (now >= endAt) return false;
    if (crowd.decided) return false;
    // IMPORTANT: player voting must NOT stop NPC voting. We only stop on time (endAt) or decision.
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

    function pickVoter(allowRepeat){
      // Prefer a fresh voter (not yet in crowd.voters). If everyone already voted, allow repeats.
      const voters = crowd.voters || {};

      // Build eligible list once for a deterministic fallback.
      const eligible = npcs.filter(p => p && p.id && p.id !== aId && p.id !== bId);
      if (!eligible.length) return null;

      if (!allowRepeat) {
        // Try random sampling first.
        for (let i = 0; i < Math.max(10, eligible.length); i++){
          const cand = eligible[Math.floor(Math.random() * eligible.length)];
          if (!cand || !cand.id) continue;
          if (voters[cand.id]) continue;
          return cand;
        }
        // Deterministic fallback: first not-yet-voted.
        for (const cand of eligible){
          if (!voters[cand.id]) return cand;
        }
        return null;
      }

      // allowRepeat = true
      return eligible[Math.floor(Math.random() * eligible.length)];
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

    let voted = false;
    let votesEmitted = 0;

    // Emit as many votes as needed to catch up, but cap per tick.
    while (votesEmitted < maxVotesPerTick) {
      if (now < crowd.nextNpcVoteAt) break;

      // Ensure crowd.voters exists
      if (!crowd.voters || typeof crowd.voters !== "object") crowd.voters = {};

      // First try: require fresh voter. If exhausted, allow repeats so voting continues until endAt.
      let voter = pickVoter(false);
      let allowRepeat = false;
      if (!voter) {
        voter = pickVoter(true);
        allowRepeat = true;
      }
      if (!voter || !voter.id) break;

      const side = decideSide();
      const w = npcVoteWeight(voter);
      if (isCirculationEnabled()) {
        const Econ = getEcon();
        const poolId = getCrowdPoolId(e);
        const ok = Econ && typeof Econ.transferPoints === "function"
          ? Econ.transferPoints(voter.id, poolId, 1, "crowd_vote_cost", { battleId: e && (e.battleId || e.relatedBattleId || e.refId || null) })
          : null;
        if (!ok || !ok.ok) {
          votesEmitted++;
          continue;
        }
      }

      // Record voter side only if it is a fresh vote.
      // For repeats we still count votes, but do not overwrite the original side in voters map.
      if (!allowRepeat) {
        crowd.voters[voter.id] = side;
      }

      if (side === "a") crowd.aVotes = (crowd.aVotes|0) + w;
      else crowd.bVotes = (crowd.bVotes|0) + w;

      mirrorCrowdVotesToEvent(e);

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
          if (!allowRepeat && voter && voter.id) {
            b.crowd.voters[voter.id] = side;
          }
          
          // Trigger immediate UI update (fixes DUM-030)
          try {
            if (Game.UI && typeof Game.UI.updateBattleCounters === "function") {
              Game.UI.updateBattleCounters(battleId);
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
    if (Game.StateAPI && typeof Game.StateAPI.pushSystem === "function") {
      Game.StateAPI.pushSystem(msg);
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
    while (Game.State.events.length > max) Game.State.events.pop();
  }

  function hasEventByBattleId(battleId){
    ensureState();
    return Game.State.events.some(e => e && (e.type === "draw" || e.kind === "draw") && e.battleId === battleId);
  }

  function removeEvent(id){
    ensureState();
    Game.State.events = Game.State.events.filter(x => x.id !== id);
    requestRender();
  }

  // ------------------------------
  // NPC vs NPC event generator
  // ------------------------------

  function makeNpcEvent(aId, bId){
    ensureState();
    if (Game && Game.Debug && Game.Debug.PAUSE_EVENTS === true) return null;

    const players = (Game.State && Game.State.players) ? Game.State.players : {};

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
    const players = (Game.State && Game.State.players) ? Game.State.players : {};
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

    Game.State.events.unshift(e);
    capEvents();

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

    const e = Game.State.events.find(x => x.id === eventId);
    if (!e || e.state !== "open") return false;

    // Voting must never stop NPC simulation. playerVoted only blocks a second player vote.
    ensureEventCrowd(e);

    e.note = "";

    if (side === "skip"){
      removeEvent(eventId);
      return true;
    }

    // Block only a second player vote, but keep the event open for NPC votes until endsAt.
    if (e.playerVoted) {
      e.note = "Ты уже вписался в эту ничью.";
      requestRender();
      return false;
    }

    const spend = (Game.StateAPI && typeof Game.StateAPI.spendPoints === "function")
      ? Game.StateAPI.spendPoints
      : null;
    const voteCost = 1;

    // Record the player's vote into the crowd (weight = 1).
    const me = (Game.State && Game.State.me) ? Game.State.me : null;
    const meId = (me && me.id) ? me.id : "me";
    ensureEventCrowd(e);
    const crowd = e.crowd;
    crowd.voters ||= {};

    // If somehow already present, treat as already voted.
    if (crowd.voters[meId]) {
      e.playerVoted = true;
      e.myVote = crowd.voters[meId];
      e.bet = { side: e.myVote };
      e.reveal = true;
      e.note = "Ты уже вписался в эту ничью.";
      requestRender();
      return false;
    }

    if (isCirculationEnabled()) {
      const Econ = getEcon();
      const ok = Econ && typeof Econ.transferPoints === "function"
        ? Econ.transferPoints("me", getCrowdPoolId(e), voteCost, "crowd_vote_cost", { battleId: e && (e.battleId || e.relatedBattleId || e.refId || null) })
        : null;
      if (!ok || !ok.ok) {
        e.note = "Недоступно.";
        requestRender();
        return false;
      }
    } else if (spend) {
      if (!spend(voteCost, "tie_vote")) {
        e.note = "Недоступно.";
        requestRender();
        return false;
      }
    } else {
      const me2 = Game.State && Game.State.me ? Game.State.me : null;
      if (!me2 || (me2.points | 0) < voteCost) {
        e.note = "Недоступно.";
        requestRender();
        return false;
      }
      me2.points = clamp0((me2.points | 0) - voteCost);
    }

    crowd.voters[meId] = side;
    crowd.aVotes = (crowd.aVotes | 0);
    crowd.bVotes = (crowd.bVotes | 0);
    crowd.votesA = (crowd.votesA ?? crowd.aVotes) | 0;
    crowd.votesB = (crowd.votesB ?? crowd.bVotes) | 0;

    if (side === "a") crowd.aVotes = (crowd.aVotes | 0) + 1;
    else crowd.bVotes = (crowd.bVotes | 0) + 1;

    // Keep mirrored fields consistent for UI
    mirrorCrowdVotesToEvent(e);

    // Task B: начислить +1 REP за участие сразу
    try {
      const transferRep = (Game.StateAPI && typeof Game.StateAPI.transferRep === "function")
        ? Game.StateAPI.transferRep
        : null;
      if (transferRep) {
        transferRep("crowd_pool", "me", 1, "rep_crowd_vote_participation", e.id || e.battleId || e.refId || null);
      }
    } catch (_) {}

    // P0-3: показать тост участия сразу "+1⭐ -1💰" и мгновенно обновить UI
    try {
      if (Game.UI && typeof Game.UI.pushSystem === "function") {
        Game.UI.pushSystem(`+1⭐ -1💰`);
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
    const battleId = e.battleId || e.relatedBattleId || e.refId;
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
      }
    }

    // Mark local UI flags
    e.playerVoted = true;
    e.myVote = side;
    e.bet = { side, cost: voteCost };
    e.reveal = true;
    e.voteRewardApplied = true;

    requestRender();
    return true;
  }

  function addExtraVote(eventId, side){
    ensureState();
    const e = Game.State.events.find(x => x && x.id === eventId);
    if (!e || e.state !== "open") return false;

    const spend = (Game.StateAPI && typeof Game.StateAPI.spendPoints === "function")
      ? Game.StateAPI.spendPoints
      : null;
    const D0 = Game.Data || {};
    const cost = Number.isFinite(D0.COST_CROWD_EXTRA_VOTE) ? (D0.COST_CROWD_EXTRA_VOTE | 0) : 2;
    if (isCirculationEnabled()) {
      const Econ = getEcon();
      const ok = Econ && typeof Econ.transferPoints === "function"
        ? Econ.transferPoints("me", getCrowdPoolId(e), cost, "crowd_vote_cost", { battleId: e && (e.battleId || e.relatedBattleId || e.refId || null) })
        : null;
      if (!ok || !ok.ok) {
        e.note = "Не прокает: нет P.";
        requestRender();
        return false;
      }
    } else if (spend && !spend(cost, "tie_extra_vote")) {
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

    // Sync to battle-backed crowd too
    const battleId = e.battleId || e.relatedBattleId || e.refId;
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
    }

    requestRender();
    return true;
  }

  function activateVoteShield(eventId){
    ensureState();
    const e = Game.State.events.find(x => x && x.id === eventId);
    if (!e || e.state !== "open") return false;
    if (e.voteShielded) return true;

    const spend = (Game.StateAPI && typeof Game.StateAPI.spendPoints === "function")
      ? Game.StateAPI.spendPoints
      : null;
    const D0 = Game.Data || {};
    const cost = Number.isFinite(D0.COST_VOTE_SHIELD) ? (D0.COST_VOTE_SHIELD | 0) : 1;
    if (isCirculationEnabled()) {
      const Econ = getEcon();
      const ok = Econ && typeof Econ.transferPoints === "function"
        ? Econ.transferPoints("me", getCrowdPoolId(e), cost, "crowd_vote_cost", { battleId: e && (e.battleId || e.relatedBattleId || e.refId || null) })
        : null;
      if (!ok || !ok.ok) {
        e.note = "Не прокает: нет P.";
        requestRender();
        return false;
      }
    } else if (spend && !spend(cost, "tie_vote_shield")) {
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
    Game.State.events = Game.State.events.filter(e => {
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
    const list = (Game.State && Array.isArray(Game.State.battles)) ? Game.State.battles : [];
    return list.find(b => b && (b.id === battleId || b.battleId === battleId)) || null;
  }

  function formatCrowdStatusLine(aName, aInf, bName, bInf, crowd){
    // System text: keep punctuation perfect. No NPC chat normalization here.
    const vA = crowd ? ((crowd.aVotes ?? crowd.votesA) | 0) : 0;
    const vB = crowd ? ((crowd.bVotes ?? crowd.votesB) | 0) : 0;
    const endAt = crowd ? (crowd.endAt||0) : 0;
    const leftMs = endAt ? Math.max(0, endAt - now()) : 0;
    const leftS = Math.ceil(leftMs / 1000);

    const timePart = endAt ? ` Ещё ${leftS} сек.` : "";
    return `Толпа решает: ${aName} [${aInf}] и ${bName} [${bInf}]. Голоса: ${vA}-${vB}.${timePart}`;
  }

  function decideCrowdWinner(aInf, bInf, crowd){
    const vA = crowd ? ((crowd.aVotes ?? crowd.votesA) | 0) : 0;
    const vB = crowd ? ((crowd.bVotes ?? crowd.votesB) | 0) : 0;
    if (vA > vB) return "a";
    if (vB > vA) return "b";
    // Tie-break: higher influence wins, otherwise random
    const ia = Number(aInf || 0);
    const ib = Number(bInf || 0);
    if (ia > ib) return "a";
    if (ib > ia) return "b";
    return (Math.random() < 0.5) ? "a" : "b";
  }
  function finalizeOpenEventIfExpired(e){
    if (!e || e.state !== "open") return false;
    const crowd = e.crowd;
    if (!crowd || typeof crowd !== "object") return false;
    const kind = e.type || e.kind;

    const endAt = Number(crowd.endAt || e.endsAt || 0);
    if (!endAt) return false;

    const nowTs = now();
    if (nowTs < endAt) return false;

    // Mirror vote fields
    const aVotes = ((crowd.aVotes ?? crowd.votesA) | 0);
    const bVotes = ((crowd.bVotes ?? crowd.votesB) | 0);
    crowd.aVotes = aVotes;
    crowd.bVotes = bVotes;
    crowd.votesA = aVotes;
    crowd.votesB = bVotes;
    e.aVotes = aVotes;
    e.bVotes = bVotes;
    e.votesA = aVotes;
    e.votesB = bVotes;
    if (!Number.isFinite(e.resolveAt) || !e.resolveAt) e.resolveAt = nowTs;

    // Decide
    const aName = e.aName || "Игрок A";
    const bName = e.bName || "Игрок B";
    const aInf = Number(e.aInf ?? 0);
    const bInf = Number(e.bInf ?? 0);

    if (aVotes === bVotes) {
      restartEventCrowd(e);
      return true;
    }

    const winner = (aVotes > bVotes) ? "a" : "b";
    crowd.decided = true;
    crowd.winner = winner;

    const winnerName = (winner === "a") ? aName : bName;
    const loserName = (winner === "a") ? bName : aName;

    let finalLine = sysNpcDrawResolvedLine(winnerName, loserName);
    if (kind === "escape") {
      const lines = npcEscapeResolvedLines(e, winner);
      finalLine = lines.chatLine;
      e.resultLine = lines.cardLine;
    } else {
      e.resultLine = finalLine;
    }
    e.text = finalLine;
    e.meta = `${aName} [${aInf}] - ${bName} [${bInf}]`;
    e.state = "resolved";
    e.resolveAt = nowTs;

    if (!e._broadcastResolved) {
      e._broadcastResolved = true;
      pushSystem(finalLine);
    }

    payoutCrowdPool(e, winner);
    if (!isCirculationEnabled()) applyBetOutcome(e, winner);

    return true;
  }

  function tick(){
    ensureState();

    // First, sync from battle-backed draws
    try { syncDrawEvents(); } catch (_) {}

    // Then, finalize any standalone open draw events
    let changed = false;
    for (const e of Game.State.events) {
      if (!e) continue;
      const kind = e.type || e.kind;
      const isCrowd = (kind === "draw" || kind === "escape");
      if (!isCrowd) continue;
      if (finalizeOpenEventIfExpired(e)) changed = true;
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

    if (changed) requestRender();
  }

  function syncDrawEvents(){
    ensureState();
    const evs = Game.State.events;
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

      const a = Game.State.players && aId ? Game.State.players[aId] : null;
      const bb = Game.State.players && bId ? Game.State.players[bId] : null;

      const aName = e.aName || b.aName || (a && a.name) || "Игрок A";
      const bName = e.bName || b.bName || (bb && bb.name) || "Игрок B";
      const aInf = Number(e.aInf ?? b.aInf ?? (a && a.influence) ?? 0);
      const bInf = Number(e.bInf ?? b.bInf ?? (bb && bb.influence) ?? 0);

      if (b.crowd && b.status === "draw" && b.draw === true && !b.crowd.decided) {
        const endAt = (b.crowd.endAt || 0);
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

        if (endAt && nowTs >= endAt) {
          const aVotes = (b.crowd.aVotes ?? b.crowd.votesA) | 0;
          const bVotes = (b.crowd.bVotes ?? b.crowd.votesB) | 0;

          if (aVotes === bVotes) {
            restartEventCrowd(e);
            b.crowd.endAt = e.crowd.endAt;
            b.crowd.endsAt = e.crowd.endAt;
            b.crowd.aVotes = e.crowd.aVotes;
            b.crowd.bVotes = e.crowd.bVotes;
            b.crowd.votesA = e.crowd.votesA;
            b.crowd.votesB = e.crowd.votesB;
            b.crowd.voters = e.crowd.voters;
            b.crowd.decided = false;
            b.crowd.winner = null;
            continue;
          }

          // Finalize
          const winner = (aVotes > bVotes) ? "a" : "b";
          b.crowd.decided = true;
          b.crowd.winner = winner;

          const winnerName = (winner === "a") ? aName : bName;
          const loserName = (winner === "a") ? bName : aName;

          const finalLine = sysNpcDrawResolvedLine(winnerName, loserName);

          e.text = finalLine;
          e.resultLine = finalLine;
          e.meta = `${aName} [${aInf}] - ${bName} [${bInf}]`;
          e.state = "resolved";

          // One-time broadcast to chat/system
          if (!e._broadcastResolved) {
            e._broadcastResolved = true;
            pushSystem(finalLine);
          }
          payoutCrowdPool(e, winner);
          if (!isCirculationEnabled()) applyBetOutcome(e, winner);
        } else {
          const line = formatCrowdStatusLine(aName, aInf, bName, bInf, b.crowd);
          e.text = line;
          e.resultLine = line;
          e.meta = `${aName} [${aInf}] - ${bName} [${bInf}]`;
          e.state = "open";
        }
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
    const a = Game.State.players && Game.State.players[aId];
    const b = Game.State.players && Game.State.players[bId];

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

    Game.State.events.unshift(e);
    // Normalize mirrors for UI (endsAt + votes fields)
    ensureEventCrowd(e);
    mirrorCrowdVotesToEvent(e);
    // Safety: remove any older duplicates that might have slipped in
    Game.State.events = Game.State.events.filter((x, i, arr) => {
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
    return Game.State.events.slice();
  };

  Events.getCount = () => {
    ensureState();
    return Game.State.events.length;
  };

  Game.Events = Events;
})();
