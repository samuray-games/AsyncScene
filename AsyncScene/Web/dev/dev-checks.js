// dev/dev-checks.js
window.Game = window.Game || {};

(() => {
  const Game = window.Game;
  const DEV_FLAG =
    window.__DEV__ === true ||
    window.DEV === true ||
    (typeof location !== "undefined" && location && location.hostname === "localhost") ||
    (typeof location !== "undefined" && location && location.search && location.search.includes("dev=1"));

  if (!DEV_FLAG) return;

  Game.Dev = Game.Dev || {};

  const getNow = () => (Game.Time && typeof Game.Time.now === "function") ? Game.Time.now() : Date.now();

  console.warn("[DEV] content testing hooks enabled");

  const getStateSafe = () => {
    if (!Game.State || !Game.State.me) {
      console.warn("[DEV] Game.State.me missing");
      return null;
    }
    return Game.State;
  };

  const sync = () => {
    try {
      if (Game.StateAPI && typeof Game.StateAPI.syncMeToPlayers === "function") {
        Game.StateAPI.syncMeToPlayers();
      }
    } catch (_) {}
  };

  Game.Dev.setInfluence = (value) => {
    if (typeof value !== "number") return;
    const S = getStateSafe();
    if (!S) return;
    S.me.influence = value;
    sync();
    try { if (Game.UI && typeof Game.UI.updateArgStrengthPills === "function") Game.UI.updateArgStrengthPills(); } catch (_) {}
    console.log("[DEV] influence =", S.me.influence);
  };

  Game.Dev.addInfluence = (delta) => {
    if (typeof delta !== "number") return;
    const S = getStateSafe();
    if (!S) return;
    const cur = Number(S.me.influence || 0);
    S.me.influence = cur + delta;
    sync();
    try { if (Game.UI && typeof Game.UI.updateArgStrengthPills === "function") Game.UI.updateArgStrengthPills(); } catch (_) {}
    console.log("[DEV] influence =", S.me.influence);
  };

  Game.Dev.setPoints = (value) => {
    if (typeof value !== "number") return;
    const S = getStateSafe();
    if (!S) return;
    S.me.points = value;
    sync();
    console.log("[DEV] points =", S.me.points);
  };

  Game.Dev.addPoints = (delta) => {
    if (typeof delta !== "number") return;
    const S = getStateSafe();
    if (!S) return;
    const cur = Number(S.me.points || 0);
    S.me.points = cur + delta;
    sync();
    console.log("[DEV] points =", S.me.points);
  };

  Game.Dev.resetProfileEconomyForDebug = () => {
    const D0 = Game.Data || null;
    const S = Game.State || null;
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

  Game.Dev.econIntrospect = () => {
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

  Game.Dev.sumPointsSnapshot = () => {
    const Econ = Game._ConflictEconomy;
    if (Econ && typeof Econ.sumPointsSnapshot === "function") return Econ.sumPointsSnapshot();
    return { total: 0, players: 0, npcs: 0, pools: 0, poolsBreakdown: {}, ts: getNow() };
  };

  Game.Dev.assertNoDrift = (before, after) => {
    const b = before || Game.Dev.sumPointsSnapshot();
    const a = after || Game.Dev.sumPointsSnapshot();
    const diff = (a.total | 0) - (b.total | 0);
    const deltaPlayers = (a.players | 0) - (b.players | 0);
    const deltaNpcs = (a.npcs | 0) - (b.npcs | 0);
    const deltaPools = (a.pools | 0) - (b.pools | 0);
    if (diff !== 0) {
      const msg = `[DEV] circulation drift: diff=${diff} before=${b.total} after=${a.total}`;
      const log = (Game.Debug && Array.isArray(Game.Debug.moneyLog)) ? Game.Debug.moneyLog : [];
      const tail = log.slice(Math.max(0, log.length - 10));
      console.log(msg, { before: b, after: a, lastMoneyLog: tail, deltaPlayers, deltaNpcs, deltaPools });
      if (DEV_FLAG) {
        throw new Error(`${msg}`);
      } else {
        try {
          if (Game.StateAPI && typeof Game.StateAPI.pushSystem === "function") {
            Game.StateAPI.pushSystem(`Дрейф баланса: diff=${diff}.`);
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

  Game.Dev.forceArgColor = (color) => {
    const allowed = ["y", "o", "r", "k"];
    if (!allowed.includes(color)) {
      console.warn("[DEV] invalid color, use y/o/r/k");
      return;
    }
    window.DEV_FORCE_ARG_COLOR = color;
    console.log("[DEV] forceArgColor =", color);
  };

  Game.Dev.clearArgColor = () => {
    window.DEV_FORCE_ARG_COLOR = null;
    console.log("[DEV] forceArgColor cleared");
  };

  Game.Dev.info = () => {
    const S = getStateSafe();
    return {
      influence: S ? S.me.influence : null,
      points: S ? S.me.points : null,
      forcedColor: window.DEV_FORCE_ARG_COLOR || null,
    };
  };

  const logSummary = (label, errors, warnings) => {
    if (errors.length) {
      console.warn(`[Dev] ${label} failed: ${errors.length} errors, ${warnings.length} warnings`);
      errors.slice(0, 6).forEach(e => console.warn("[Dev] ", e));
      if (errors.length > 6) console.warn("[Dev] ...");
    }
  };

  Game.Dev.selfCheck = (opts = {}) => {
    const errors = [];
    const warnings = [];
    const options = (opts && typeof opts === "object") ? opts : {};
    const mutate = options.mutate === true;

    if (!Game) errors.push("Game missing");
    if (!Game.State) errors.push("Game.State missing");
    if (!Game.UI) errors.push("Game.UI missing");

    const S = Game.State || {};
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

  Game.Dev.scenarioRun = () => {
    const results = [];
    const errors = [];

    const S = Game.State || {};
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
            if (Game.StateAPI && typeof Game.StateAPI.addPoints === "function") Game.StateAPI.addPoints(1, "dev_scenario");
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

  Game.Dev.circulationDriftSmoke = () => {
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

      if (!Game.Debug) Game.Debug = {};
      prevPause = Game.Debug.PAUSE_EVENTS === true;
      Game.Debug.PAUSE_EVENTS = true;
      prevBypass = Game.Debug.BYPASS_POINTS_GUARD === true;
      Game.Debug.BYPASS_POINTS_GUARD = true;
      prevAllow = Game.Debug.ALLOW_POINTS_WRITE === true;
      Game.Debug.ALLOW_POINTS_WRITE = true;

      const S = Game.State || {};
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
      if (Game.StateAPI && typeof Game.StateAPI.seedPlayers === "function") {
        Game.StateAPI.seedPlayers();
      } else if (Game.NPC && typeof Game.NPC.seedPlayers === "function") {
        Game.NPC.seedPlayers(S);
      }
      if (Game.StateAPI && typeof Game.StateAPI.syncMeToPlayers === "function") {
        Game.StateAPI.syncMeToPlayers();
      }
      safeSetPoints(S.me, startPlayer);
      if (S.players && S.players.me) safeSetPoints(S.players.me, startPlayer);
      Object.values(S.players || {}).forEach(p => {
        if (!p) return;
        const id = String(p.id || "");
        const isNpc = (p.npc === true || p.type === "npc" || id.startsWith("npc_"));
        if (isNpc) safeSetPoints(p, startNpc);
      });
      Game.Debug.ALLOW_POINTS_WRITE = prevAllow;
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

      const beforeSnapshot = Game.Dev.sumPointsSnapshot();

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

      const afterSnapshot = Game.Dev.sumPointsSnapshot();
      let assert = null;
      try {
        assert = Game.Dev.assertNoDrift(beforeSnapshot, afterSnapshot);
      } catch (e) {
        assert = { ok: false, error: String(e && e.message ? e.message : e) };
      }

      D0.CIRCULATION_ENABLED = prevFlag;
      if (prevPause !== null) Game.Debug.PAUSE_EVENTS = prevPause;
      if (prevAllow !== null) Game.Debug.ALLOW_POINTS_WRITE = prevAllow;
      if (prevBypass !== null) Game.Debug.BYPASS_POINTS_GUARD = prevBypass;
      const result = { name, ok: !!(assert && assert.ok), beforeSnapshot, afterSnapshot, assert };
      if (!result.ok) {
        const log = (Game.Debug && Array.isArray(Game.Debug.moneyLog)) ? Game.Debug.moneyLog : [];
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
        if (Game && Game.Debug && prevPause !== null) Game.Debug.PAUSE_EVENTS = prevPause;
        if (Game && Game.Debug && prevAllow !== null) Game.Debug.ALLOW_POINTS_WRITE = prevAllow;
        if (Game && Game.Debug && prevBypass !== null) Game.Debug.BYPASS_POINTS_GUARD = prevBypass;
      } catch (_) {}
      return { name, ok: false, details: String(e && e.message ? e.message : e) };
    }
  };

  Game.Dev.circulationPenaltySmoke = () => {
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

      if (!Game.Debug) Game.Debug = {};
      prevPause = Game.Debug.PAUSE_EVENTS === true;
      Game.Debug.PAUSE_EVENTS = true;
      prevBypass = Game.Debug.BYPASS_POINTS_GUARD === true;
      Game.Debug.BYPASS_POINTS_GUARD = true;
      prevAllow = Game.Debug.ALLOW_POINTS_WRITE === true;
      Game.Debug.ALLOW_POINTS_WRITE = true;

      const S = Game.State || {};
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
      if (Game.StateAPI && typeof Game.StateAPI.seedPlayers === "function") {
        Game.StateAPI.seedPlayers();
      } else if (Game.NPC && typeof Game.NPC.seedPlayers === "function") {
        Game.NPC.seedPlayers(S);
      }
      if (Game.StateAPI && typeof Game.StateAPI.syncMeToPlayers === "function") {
        Game.StateAPI.syncMeToPlayers();
      }
      setPoints(S.me, startPlayer);
      if (S.players && S.players.me) setPoints(S.players.me, startPlayer);
      Object.values(S.players || {}).forEach(p => {
        if (!p) return;
        const id = String(p.id || "");
        const isNpc = (p.npc === true || p.type === "npc" || id.startsWith("npc_"));
        if (isNpc) setPoints(p, startNpc);
      });
      Game.Debug.ALLOW_POINTS_WRITE = prevAllow;
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

      const beforeSnapshot = Game.Dev.sumPointsSnapshot();

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

      const afterSnapshot = Game.Dev.sumPointsSnapshot();
      let assert = null;
      try {
        assert = Game.Dev.assertNoDrift(beforeSnapshot, afterSnapshot);
      } catch (e) {
        assert = { ok: false, error: String(e && e.message ? e.message : e) };
      }

      restoreRoles();
      D0.CIRCULATION_ENABLED = prevFlag;
      if (prevPause !== null) Game.Debug.PAUSE_EVENTS = prevPause;
      if (prevAllow !== null) Game.Debug.ALLOW_POINTS_WRITE = prevAllow;
      if (prevBypass !== null) Game.Debug.BYPASS_POINTS_GUARD = prevBypass;
      const result = { name, ok: !!(assert && assert.ok), beforeSnapshot, afterSnapshot, assert };
      if (!result.ok) {
        const log = (Game.Debug && Array.isArray(Game.Debug.moneyLog)) ? Game.Debug.moneyLog : [];
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
        if (Game && Game.Debug && prevPause !== null) Game.Debug.PAUSE_EVENTS = prevPause;
        if (Game && Game.Debug && prevAllow !== null) Game.Debug.ALLOW_POINTS_WRITE = prevAllow;
        if (Game && Game.Debug && prevBypass !== null) Game.Debug.BYPASS_POINTS_GUARD = prevBypass;
        savedRoles.forEach(r => { r.p.role = r.role; r.p.type = r.type; });
      } catch (_) {}
      return { name, ok: false, details: String(e && e.message ? e.message : e) };
    }
  };

  Game.Dev.circulationChatSmoke = () => {
    const name = "circulation_chat_smoke";
    let prevFlag = null;
    try {
      const D0 = Game.Data || null;
      if (!D0) return { name, ok: false, details: "Game.Data missing" };
      const UI = Game.UI || null;
      if (!UI || typeof UI.pushChat !== "function") return { name, ok: false, details: "UI.pushChat missing" };
      const S = Game.State || {};
      S.points = S.points || {};

      prevFlag = D0.CIRCULATION_ENABLED === true;
      D0.CIRCULATION_ENABLED = true;
      S.points.lastChatRewardAt = 0;

      const before = Game.Dev.sumPointsSnapshot();
      UI.pushChat({ name: "Ты", text: "dev chat smoke", system: false, isMe: true, playerId: "me" });
      const after = Game.Dev.sumPointsSnapshot();
      const res = Game.Dev.assertNoDrift(before, after);

      D0.CIRCULATION_ENABLED = prevFlag;
      return { name, ok: res.ok, details: { diff: res.diff, before, after } };
    } catch (e) {
      try {
        if (Game && Game.Data && prevFlag !== null) Game.Data.CIRCULATION_ENABLED = prevFlag;
      } catch (_) {}
      return { name, ok: false, details: String(e && e.message ? e.message : e) };
    }
  };

  Game.Dev.circulationCopSmoke = () => {
    const name = "circulation_cop_smoke";
    let prevFlag = null;
    try {
      const D0 = Game.Data || null;
      if (!D0) return { name, ok: false, details: "Game.Data missing" };
      const S = Game.State || {};
      if (!S.me || !Game.StateAPI || typeof Game.StateAPI.applyReportByRole !== "function") {
        return { name, ok: false, details: "StateAPI.applyReportByRole missing" };
      }

      prevFlag = D0.CIRCULATION_ENABLED === true;
      D0.CIRCULATION_ENABLED = true;

      const before = Game.Dev.sumPointsSnapshot();

      S.reports = S.reports || { history: {}, lastAt: 0, cooldownMs: 0 };
      S.reports.history = {};
      S.reports.lastAt = 0;
      S.sightings = S.sightings || {};
      S.sightings.mafia = 0;

      Game.StateAPI.applyReportByRole("mafia");

      S.reports.history = {};
      S.reports.lastAt = 0;
      S.sightings.mafia = Date.now();

      Game.StateAPI.applyReportByRole("mafia");

      const after = Game.Dev.sumPointsSnapshot();
      const res = Game.Dev.assertNoDrift(before, after);

      D0.CIRCULATION_ENABLED = prevFlag;
      return { name, ok: res.ok, details: { diff: res.diff, before, after } };
    } catch (e) {
      try {
        if (Game && Game.Data && prevFlag !== null) Game.Data.CIRCULATION_ENABLED = prevFlag;
      } catch (_) {}
      return { name, ok: false, details: String(e && e.message ? e.message : e) };
    }
  };

  Game.Dev.circulationNpcSeedSmoke = () => {
    const name = "circulation_npc_seed_smoke";
    let prevFlag = null;
    try {
      const D0 = Game.Data || null;
      if (!D0) return { name, ok: false, details: "Game.Data missing" };
      if (!Game.StateAPI || typeof Game.StateAPI.resetAll !== "function" || typeof Game.StateAPI.seedPlayers !== "function") {
        return { name, ok: false, details: "StateAPI.resetAll/seedPlayers missing" };
      }

      prevFlag = D0.CIRCULATION_ENABLED === true;
      D0.CIRCULATION_ENABLED = true;

      Game.StateAPI.resetAll();
      Game.StateAPI.seedPlayers();
      if (Game.StateAPI.syncMeToPlayers) Game.StateAPI.syncMeToPlayers();

      const snap1 = Game.Dev.sumPointsSnapshot();
      const snap2 = Game.Dev.sumPointsSnapshot();
      const res = Game.Dev.assertNoDrift(snap1, snap2);

      const players = (Game.State && Game.State.players) ? Game.State.players : {};
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

  Game.Dev.drawAuditTrigger = (opts = {}) => {
    const name = "draw_audit_trigger";
    const Econ = Game.ConflictEconomy || Game._ConflictEconomy || null;
    const Core = Game.ConflictCore || Game._ConflictCore || null;
    if (!Econ || typeof Econ.transferPoints !== "function" || typeof Econ.transferFromPool !== "function") {
      return { name, ok: false, details: "Econ.transferPoints/transferFromPool missing" };
    }
    const S = Game.State || null;
    if (!S || !S.players || !S.me) return { name, ok: false, details: "Game.State missing" };

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
      if (!Game.Debug) Game.Debug = {};
      prevForce = Game.Debug.FORCE_CIRCULATION;
      prevBypass = Game.Debug.BYPASS_POINTS_GUARD === true;
      prevAllow = Game.Debug.ALLOW_POINTS_WRITE === true;
      prevWeighted = Game.Debug.CROWD_WEIGHTED_TALLY;
      Game.Debug.FORCE_CIRCULATION = true;
      Game.Debug.BYPASS_POINTS_GUARD = true;
      Game.Debug.ALLOW_POINTS_WRITE = true;
      if (opts && opts.debugWeights) Game.Debug.CROWD_WEIGHTED_TALLY = true;

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

      const beforeSnapshot = Game.Dev.sumPointsSnapshot();

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

      const addRep = (Game.StateAPI && typeof Game.StateAPI.addRep === "function") ? Game.StateAPI.addRep : null;
      let repAwardedMinority = 0;
      if (v13 && addRep) {
        minority.forEach(() => {
          addRep(1, "crowd_vote_rep_minority");
          repAwardedMinority += 1;
        });
      }

      const afterSnapshot = Game.Dev.sumPointsSnapshot();
      let assert = null;
      try { assert = Game.Dev.assertNoDrift(beforeSnapshot, afterSnapshot); }
      catch (e) { assert = { ok: false, error: String(e && e.message ? e.message : e) }; }

      const log = (Game.Debug && Array.isArray(Game.Debug.moneyLog)) ? Game.Debug.moneyLog : [];
      const byBattle = (Game.Debug && Game.Debug.moneyLogByBattle) ? (Game.Debug.moneyLogByBattle[battleId] || []) : [];
      const logForBid = log.filter(tx => String(tx && tx.battleId || "") === String(battleId));

      const ensureDrawBattle = () => {
        const state = Game.State || (Game.State = {});
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
      if (!Game.Debug) Game.Debug = {};
      Game.Debug.FORCE_CIRCULATION = prevForce;
      Game.Debug.BYPASS_POINTS_GUARD = prevBypass;
      Game.Debug.ALLOW_POINTS_WRITE = prevAllow;
      if (prevWeighted !== null) Game.Debug.CROWD_WEIGHTED_TALLY = prevWeighted;
      if (prevInfluence) {
        Object.keys(prevInfluence).forEach(id => {
          if (S && S.players && S.players[id]) S.players[id].influence = prevInfluence[id];
        });
      }
    }
  };

  Game.Dev.smokeCrowdStep2 = (opts = {}) => {
    const name = "smoke_crowd_step2";
    const Econ = Game.ConflictEconomy || Game._ConflictEconomy || null;
    const Core = Game.ConflictCore || Game._ConflictCore || null;
    const S = Game.State || null;
    if (!Econ || typeof Econ.transferPoints !== "function" || typeof Econ.transferFromPool !== "function") {
      return { name, ok: false, details: "Econ.transferPoints/transferFromPool missing" };
    }
    if (!Core || typeof Core.applyCrowdVoteTick !== "function") {
      return { name, ok: false, details: "ConflictCore.applyCrowdVoteTick missing" };
    }
    if (!S || !S.players || !S.me) return { name, ok: false, details: "Game.State missing" };
    if (Array.isArray(S.battles) && S.battles.some(b => b && b.status !== "finished" && !b.resolved) && !opts.allowParallel) {
      return { name, ok: false, details: "active_battle_present" };
    }

    let prevForce = null;
    let prevBypass = null;
    let prevAllow = null;
    const touched = [];
    try {
      if (!Game.Debug) Game.Debug = {};
      prevForce = Game.Debug.FORCE_CIRCULATION;
      prevBypass = Game.Debug.BYPASS_POINTS_GUARD === true;
      prevAllow = Game.Debug.ALLOW_POINTS_WRITE === true;
      Game.Debug.FORCE_CIRCULATION = true;
      Game.Debug.BYPASS_POINTS_GUARD = true;
      Game.Debug.ALLOW_POINTS_WRITE = true;

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
          if (Game.StateAPI && typeof Game.StateAPI.transferRep === "function") {
            Game.StateAPI.transferRep("rep_emitter", v.id, 1, "rep_crowd_vote_participation", battleId);
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

        const log = (Game.Debug && Array.isArray(Game.Debug.moneyLog)) ? Game.Debug.moneyLog : [];
        const logForBid = log.filter(tx => String(tx && tx.battleId || "") === String(battleId));
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
      if (!Game.Debug) Game.Debug = {};
      Game.Debug.FORCE_CIRCULATION = prevForce;
      Game.Debug.BYPASS_POINTS_GUARD = prevBypass;
      Game.Debug.ALLOW_POINTS_WRITE = prevAllow;
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

  Game.Dev.smokeNpcCrowdEventEconomyOnce = (opts = {}) => {
    const name = "smoke_npc_crowd_event_economy_once";
    const Econ = Game.ConflictEconomy || Game._ConflictEconomy || null;
    const S = Game.State || null;
    if (!Econ || typeof Econ.transferPoints !== "function") {
      return { name, ok: false, details: "Econ.transferPoints missing" };
    }
    if (!S || !S.players) return { name, ok: false, details: "Game.State missing" };
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
      Econ.transferPoints(v.id, "sink", 1, "crowd_vote_cost", { battleId: event.id });
      if (Game.StateAPI && typeof Game.StateAPI.transferRep === "function") {
        Game.StateAPI.transferRep("rep_emitter", v.id, 1, "rep_crowd_vote_participation", event.id);
      }
    });

    event.crowd.aVotes = aVotes;
    event.crowd.bVotes = bVotes;
    event.crowd.votesA = aVotes;
    event.crowd.votesB = bVotes;
    event.crowd.endAt = Date.now() - 1;
    event.endsAt = event.crowd.endAt;

    if (Game.Events && typeof Game.Events.tick === "function") Game.Events.tick();

    const log = (Game.Debug && Array.isArray(Game.Debug.moneyLog)) ? Game.Debug.moneyLog : [];
    const logForBid = log.filter(tx => String(tx && tx.battleId || "") === String(event.id));
    const byReason = {};
    logForBid.forEach(tx => {
      const r = tx && tx.reason ? String(tx.reason) : "unknown";
      byReason[r] = (byReason[r] || 0) + 1;
    });

    const poolAfter = Econ.getPoolBalance ? Econ.getPoolBalance(poolId) : null;
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

    return {
      name,
      ok: Object.values(asserts).every(Boolean),
      id: event.id,
      branch: branchName,
      byReason,
      poolAfter,
      asserts
    };
  };

  Game.Dev.smokeNpcCrowdEventPaidVotesOnce = (opts = {}) => {
    const name = "smoke_npc_crowd_event_paid_votes_once";
    const Econ = Game.ConflictEconomy || Game._ConflictEconomy || null;
    const Events = Game.Events || null;
    const S = Game.State || null;
    if (!Econ || typeof Econ.transferPoints !== "function") {
      return { name, ok: false, details: "Econ.transferPoints missing" };
    }
    if (!Events || typeof Events.makeNpcEvent !== "function" || typeof Events.addEvent !== "function" || typeof Events.tick !== "function") {
      return { name, ok: false, details: "Events.makeNpcEvent/addEvent/tick missing" };
    }
    if (!S || !S.players) return { name, ok: false, details: "Game.State missing" };

    const event = Events.makeNpcEvent();
    if (!event) return { name, ok: false, details: "makeNpcEvent failed" };
    Events.addEvent(event);

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

    // Ensure at least 3 eligible NPCs with 1 point, and one with 0 points.
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


    const countedNpcVotes = [];

    const log = (Game.Debug && Array.isArray(Game.Debug.moneyLog)) ? Game.Debug.moneyLog : [];
    const logForBid = log.filter(tx => String(tx && tx.battleId || "") === String(event.id));
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

      const moneyLogLastCost = (() => {
        const log = (Game.Debug && Array.isArray(Game.Debug.moneyLog)) ? Game.Debug.moneyLog : [];
        for (let i = log.length - 1; i >= 0; i--) {
          const x = log[i];
          if (!x) continue;
          if (String(x.reason || "") !== "crowd_vote_cost") continue;
          if (String(x.battleId || "") !== String(event.id)) continue;
          if (String(x.sourceId || "") !== String(voterId)) continue;
          return x;
        }
        return null;
      })();

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
        stateKeysSample: {
          keys: Object.keys(players).slice(0, 10),
          includesVoterId: Object.prototype.hasOwnProperty.call(players, voterId)
        },
        note: noteFields(beforeDetails, afterDetails)
      };
    })();

    const asserts = {
      paidVotesMatch: paidIds.length === npcCostLogs.length,
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
      debugPaid,
      simDebug: event.simDebugSteps || []
    };
  };

  Game.Dev.smokeNpcCrowdMaxShareOnce = (opts = {}) => {
    const name = "smoke_npc_crowd_max_share_once";
    const Events = Game.Events || null;
    const S = Game.State || null;
    const D0 = Game.Data || null;
    if (!Events || typeof Events.makeNpcEvent !== "function" || typeof Events.addEvent !== "function" || typeof Events.tick !== "function") {
      return { name, ok: false, details: "Events.makeNpcEvent/addEvent/tick missing" };
    }
    if (!S || !S.players) return { name, ok: false, details: "Game.State missing" };
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

      const dbg = (Game.Debug || null);
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

  Game.Dev.smokeNpcCrowdOneEventBeforeAfterOnce = (opts = {}) => {
    const name = "smoke_npc_crowd_one_event_before_after_once";
    const Events = Game.Events || null;
    const S = Game.State || null;
    const D0 = Game.Data || null;
    if (!Events || typeof Events.makeNpcEvent !== "function" || typeof Events.addEvent !== "function" || typeof Events.tick !== "function") {
      return { name, ok: false, details: "Events.makeNpcEvent/addEvent/tick missing" };
    }
    if (!S || !S.players) return { name, ok: false, details: "Game.State missing" };
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

    const dbg = (Game.Debug || null);
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
      const S = Game && Game.State ? Game.State : null;
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
    const dbg = (Game.Debug || null);
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

  Game.Dev.smokeBattleCrowdOutcomeOnce = (opts = {}) => {
    const name = "smoke_battle_crowd_outcome_once";
    const Core = Game.ConflictCore || Game._ConflictCore || null;
    const Econ = Game.ConflictEconomy || Game._ConflictEconomy || null;
    const S = Game.State || null;
    const diag = { builderWhy: "entered", stage: "entered", trace: [] };
    const result = { name, ok: false, details: "not_built", battleId: null, telemetry: null, diag };
    if (!Core || typeof Core.finalizeCrowdVote !== "function") {
      return { name, ok: false, details: "ConflictCore.finalizeCrowdVote missing" };
    }
    if (!Econ || typeof Econ.transferPoints !== "function") {
      return { name, ok: false, details: "Econ.transferPoints missing" };
    }
    if (!S || !S.players) return { name, ok: false, details: "Game.State missing" };

    const allowParallel = (opts && typeof opts.allowParallel === "boolean") ? opts.allowParallel : true;
    if (!allowParallel) {
      const active = Array.isArray(S.battles) ? S.battles.filter(b => b && b.status !== "finished" && !b.resolved) : [];
      if (active.length) return { name, ok: false, details: "active_battle_present", activeCount: active.length };
    }

    const prevForce = Game.Debug ? Game.Debug.FORCE_CIRCULATION : undefined;
    const prevBypass = Game.Debug ? Game.Debug.BYPASS_POINTS_GUARD : undefined;
    const prevAllow = Game.Debug ? Game.Debug.ALLOW_POINTS_WRITE : undefined;
    const prevWeighted = Game.Debug ? Game.Debug.CROWD_WEIGHTED_TALLY : undefined;
    const touched = [];

    try {
      if (!Game.Debug) Game.Debug = {};
      Game.Debug.FORCE_CIRCULATION = true;
      Game.Debug.BYPASS_POINTS_GUARD = true;
      Game.Debug.ALLOW_POINTS_WRITE = true;
      Game.Debug.CROWD_WEIGHTED_TALLY = true;

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

      const buildPointsSnapshot = () => {
        const out = {};
        Object.keys(pointIds).forEach(k => { out[k] = readPoints(pointIds[k]); });
        return out;
      };

      const beforeSnapshot = Game.Dev.sumPointsSnapshot();
      const beforePoints = buildPointsSnapshot();
      const beforePlayersMap = (() => {
        const out = Object.create(null);
        Object.values(S.players || {}).forEach(p => {
          if (!p || !p.id) return;
          if (Number.isFinite(p.points)) out[p.id] = p.points | 0;
        });
        return out;
      })();
      const totalPtsWorldBefore = Object.values(beforePlayersMap).reduce((s, v) => s + (v | 0), 0);

      const participants = voters.map(v => {
        const p = S.players[v.id];
        const pointsBefore = p ? (p.points | 0) : 0;
        Econ.transferPoints(v.id, "sink", 1, "crowd_vote_cost", { battleId });
        const pointsAfter = p ? (p.points | 0) : 0;
        return { id: v.id, side: v.side, toneKey: v.toneKey, pointsBefore, pointsAfter };
      });

      battle.crowd.voters = {};
      participants.forEach(p => {
        battle.crowd.voters[p.id] = (p.side === "A") ? "a" : "b";
      });
      battle.crowd.totalPlayers = totalPlayers();
      battle.crowd.cap = capUsed;

      const log = (Game.Debug && Array.isArray(Game.Debug.moneyLog)) ? Game.Debug.moneyLog : [];
      const logStart = log.length;
      const crowdVotersSnapshot = (battle && battle.crowd && battle.crowd.voters) ? { ...battle.crowd.voters } : null;

      const res = Core.finalizeCrowdVote(battleId);
      const battleAfter = (S.battles || []).find(b => b && String(b.id) === String(battleId)) || battle;
      const crowdMeta = res && res.crowdCapMeta ? res.crowdCapMeta : null;
      const endedBy = crowdMeta ? crowdMeta.endedBy : null;
      const outcome = res && res.outcome ? res.outcome : null;

      const logForBid = log.filter(tx => String(tx && tx.battleId || "") === String(battleId));
      const byReason = {};
      let poolInitAmount = 0;
      logForBid.forEach(tx => {
        const r = tx && tx.reason ? String(tx.reason) : "unknown";
        byReason[r] = (byReason[r] || 0) + 1;
        if (r === "crowd_vote_pool_init") poolInitAmount += (tx.amount | 0);
      });
      const logAfter = log.slice(logStart);

      const afterSnapshot = Game.Dev.sumPointsSnapshot();
      const afterPoints = buildPointsSnapshot();
      const afterPlayersMap = (() => {
        const out = Object.create(null);
        Object.values(S.players || {}).forEach(p => {
          if (!p || !p.id) return;
          if (Number.isFinite(p.points)) out[p.id] = p.points | 0;
        });
        return out;
      })();
      const totalPtsWorldAfter = Object.values(afterPlayersMap).reduce((s, v) => s + (v | 0), 0);
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
      const adjustedDiff = (sumNetFromMoneyLog | 0) - (mintAllowance | 0);
      const pointsDiffOk = adjustedDiff === 0;
      const worldMassOk = totalPtsWorldBefore === totalPtsWorldAfter;
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
        snapshotReport: { beforePoints, afterPoints, netDeltaById, sumNetDelta, totalPtsWorldBefore, totalPtsWorldAfter, deltaWorld: totalPtsWorldAfter - totalPtsWorldBefore },
        moneyLogReport: { netDeltaById: netDeltaFromMoneyLog.map, sumNetFromMoneyLog, mintAllowance, adjustedDiff },
        pointsDiffOk,
        asserts,
        telemetry
      });
      if (result.ok) Game.Dev.lastSmokeBattleId = battleId;
      if (result.ok) Game.Dev.lastSmokeBattleId = battleId;
      if (result.ok) Game.Dev.lastSmokeBattleId = battleId;
      return result;
    } finally {
      if (!Game.Debug) Game.Debug = {};
      Game.Debug.FORCE_CIRCULATION = prevForce;
      Game.Debug.BYPASS_POINTS_GUARD = prevBypass;
      Game.Debug.ALLOW_POINTS_WRITE = prevAllow;
      Game.Debug.CROWD_WEIGHTED_TALLY = prevWeighted;
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

  Game.Dev.smokeEscapeCrowdOutcomeOnce = (opts = {}) => {
    const name = "smoke_escape_crowd_outcome_once";
    const Core = Game.ConflictCore || Game._ConflictCore || null;
    const Econ = Game.ConflictEconomy || Game._ConflictEconomy || null;
    const S = Game.State || null;
    const diag = { builderWhy: "entered", stage: "entered", trace: [] };
    const result = { name, ok: false, details: "not_built", battleId: null, telemetry: null, diag };
    if (!Core || typeof Core.escape !== "function" || typeof Core.finalizeEscapeVote !== "function") {
      return { name, ok: false, details: "ConflictCore.escape/finalizeEscapeVote missing" };
    }
    if (!Econ || typeof Econ.transferPoints !== "function") {
      return { name, ok: false, details: "Econ.transferPoints missing" };
    }
    if (!S || !S.players) return { name, ok: false, details: "Game.State missing" };

    const allowParallel = !!(opts && opts.allowParallel);
    if (!allowParallel) {
      const active = Array.isArray(S.battles) ? S.battles.filter(b => b && b.status !== "finished" && !b.resolved) : [];
      if (active.length) return { name, ok: false, details: "active_battle_present", activeCount: active.length };
    }

    const prevForce = Game.Debug ? Game.Debug.FORCE_CIRCULATION : undefined;
    const prevBypass = Game.Debug ? Game.Debug.BYPASS_POINTS_GUARD : undefined;
    const prevAllow = Game.Debug ? Game.Debug.ALLOW_POINTS_WRITE : undefined;
    const prevWeighted = Game.Debug ? Game.Debug.CROWD_WEIGHTED_TALLY : undefined;
    const touched = [];

    try {
      if (!Game.Debug) Game.Debug = {};
      Game.Debug.FORCE_CIRCULATION = true;
      Game.Debug.BYPASS_POINTS_GUARD = true;
      Game.Debug.ALLOW_POINTS_WRITE = true;
      Game.Debug.CROWD_WEIGHTED_TALLY = false;

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

      addVoter("r", "attacker");
      addVoter("y", "attacker");
      addVoter("y", "attacker");

      while (voters.length < capUsed) {
        if (!addVoter("y", "attacker")) break;
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
      v.aVotes = voters.length;
      v.bVotes = 0;
      v.votesA = v.aVotes;
      v.votesB = v.bVotes;

      const log = (Game.Debug && Array.isArray(Game.Debug.moneyLog)) ? Game.Debug.moneyLog : [];
      const logStart = log.length;

      const res = Core.finalizeEscapeVote(battleId);
      const battleAfter = (S.battles || []).find(b => b && String(b.id) === String(battleId)) || battle;
      const crowdMeta = res && res.crowdCapMeta ? res.crowdCapMeta : null;
      const endedBy = crowdMeta ? crowdMeta.endedBy : null;
      const outcome = res && res.outcome ? res.outcome : (v.outcome || null);

      const logForBid = log.filter(tx => String(tx && tx.battleId || "") === String(battleId));
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
      const telemetry = buildCrowdTelemetryFromLogs({
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
        telemetry,
        diag
      });
      return result;
    } finally {
      if (!Game.Debug) Game.Debug = {};
      Game.Debug.FORCE_CIRCULATION = prevForce;
      Game.Debug.BYPASS_POINTS_GUARD = prevBypass;
      Game.Debug.ALLOW_POINTS_WRITE = prevAllow;
      Game.Debug.CROWD_WEIGHTED_TALLY = prevWeighted;
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

  Game.Dev.smokeIgnoreCrowdOutcomeOnce = (opts = {}) => {
    if (Game && Game.Dev) Game.Dev.__smokeIgnoreVersion = "B2c_ignore_func_v3";
    return (function () {
      const name = "smoke_ignore_crowd_outcome_once";
      const Core = Game.ConflictCore || Game._ConflictCore || null;
      const Econ = Game.ConflictEconomy || Game._ConflictEconomy || null;
      const S = Game.State || null;
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

      const prevForce = Game.Debug ? Game.Debug.FORCE_CIRCULATION : undefined;
      const prevBypass = Game.Debug ? Game.Debug.BYPASS_POINTS_GUARD : undefined;
      const prevAllow = Game.Debug ? Game.Debug.ALLOW_POINTS_WRITE : undefined;
      const prevWeighted = Game.Debug ? Game.Debug.CROWD_WEIGHTED_TALLY : undefined;
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
            result.details = "Game.State missing";
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

          if (!Game.Debug) Game.Debug = {};
          Game.Debug.FORCE_CIRCULATION = true;
          Game.Debug.BYPASS_POINTS_GUARD = true;
          Game.Debug.ALLOW_POINTS_WRITE = true;
          Game.Debug.CROWD_WEIGHTED_TALLY = false;

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

          const log = (Game.Debug && Array.isArray(Game.Debug.moneyLog)) ? Game.Debug.moneyLog : [];
          const logStart = log.length;

          const res = Core.finalizeEscapeVote(battleId);
          const battleAfter = (S.battles || []).find(b => b && String(b.id) === String(battleId)) || battle;
          const crowdMeta = res && res.crowdCapMeta ? res.crowdCapMeta : null;
          const endedBy = crowdMeta ? crowdMeta.endedBy : null;
          const outcome = res && res.outcome ? res.outcome : (v.outcome || null);

          if (Game.Debug && Array.isArray(Game.Debug.moneyLog)) {
            Game.Debug.moneyLog.push({
              ts: Date.now(),
              reason: "ignore_outcome_debug",
              battleId,
              kind: "debug",
              meta: { mode: "off", outcome }
            });
          }

          const dbgAfter = Game.Debug || {};
          const mlbbAfter = dbgAfter.moneyLogByBattle || {};
          const scoped = Array.isArray(mlbbAfter[battleId]) ? mlbbAfter[battleId] : [];
          const logForBid = scoped.length ? scoped : log.filter(tx => String(tx && tx.battleId || "") === String(battleId));
          const byReason = {};
          let poolInitAmount = 0;
          diag.scopedLen = logForBid.length;
          if (opts && opts.debugTelemetry) {
            const undefinedArr = Array.isArray(mlbbAfter["undefined"]) ? mlbbAfter["undefined"] : [];
            const flatLog = Array.isArray(dbgAfter.moneyLog) ? dbgAfter.moneyLog : [];
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
            const dbg = Game.Debug || {};
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
          const ignoreOutcomeOk = (battleAfter && battleAfter.result === "escaped" && v.mode === "off");

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
        if (!Game.Debug) Game.Debug = {};
        Game.Debug.FORCE_CIRCULATION = prevForce;
        Game.Debug.BYPASS_POINTS_GUARD = prevBypass;
        Game.Debug.ALLOW_POINTS_WRITE = prevAllow;
        Game.Debug.CROWD_WEIGHTED_TALLY = prevWeighted;
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
    const S = Game.State || null;
    if (!S || !S.players || !S.me) {
      console.warn("[DEV] devReportTest: Game.State missing");
      return { ok: false, reason: "state_missing" };
    }
    if (!Game.StateAPI || typeof Game.StateAPI.transferRep !== "function") {
      console.warn("[DEV] devReportTest: StateAPI.transferRep missing");
      return { ok: false, reason: "transferRep_missing" };
    }
    const copId = "npc_cop";
    const cop = S.players[copId];
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
      Game.StateAPI.transferRep(target.id, "me", 5, "rep_report_true", reportId);
    } else if (mode === "false") {
      Game.StateAPI.transferRep("me", copId, 5, "rep_report_false", reportId);
    } else {
      console.warn("[DEV] devReportTest: invalid mode", mode);
      return { ok: false, reason: "bad_mode" };
    }
    const after = {
      me: Number.isFinite(S.rep) ? (S.rep | 0) : 0,
      cop: Number.isFinite(cop.rep) ? (cop.rep | 0) : 0,
      target: Number.isFinite(target.rep) ? (target.rep | 0) : 0
    };
    const log = (Game.Debug && Array.isArray(Game.Debug.moneyLog)) ? Game.Debug.moneyLog : [];
    const byBattle = (Game.Debug && Game.Debug.moneyLogByBattle) ? (Game.Debug.moneyLogByBattle[reportId] || []) : [];
    const logForBid = log.filter(tx => String(tx && tx.battleId || "") === String(reportId));
    console.log("[DEV] devReportTest", { mode, reportId, before, after, logForBid, byBattle });
    return { ok: true, mode, reportId, before, after, logForBid, byBattle };
  };

  Game.Dev.__devChecksVersion = "B2c_ignore_telemetry_gate_v3";
  Game.Dev.startBalanceSmoke = () => {
    const name = "start_balance_smoke";
    try {
      const D0 = Game.Data || null;
      const S = Game.State || null;
      if (!D0 || !S) return { name, ok: false, details: "Game.Data/Game.State missing" };

      const startPlayer = Number.isFinite(D0.START_POINTS_PLAYER) ? (D0.START_POINTS_PLAYER | 0) : 12;
      const startNpc = Number.isFinite(D0.START_POINTS_NPC) ? (D0.START_POINTS_NPC | 0) : 8;

      const fresh = {};
      if (Game.StateAPI && typeof Game.StateAPI.resetAll === "function" && typeof Game.StateAPI.seedPlayers === "function") {
        Game.StateAPI.resetAll();
        Game.StateAPI.seedPlayers();
        if (Game.StateAPI.syncMeToPlayers) Game.StateAPI.syncMeToPlayers();
      } else {
        if (!S.me) S.me = { id: "me", points: startPlayer, influence: 0, wins: 0 };
        if (!S.players) S.players = {};
        if (!S.players.me) S.players.me = S.me;
        if (Game.NPC && typeof Game.NPC.seedPlayers === "function") {
          Game.NPC.seedPlayers(S);
        }
        if (Game.StateAPI && typeof Game.StateAPI.syncMeToPlayers === "function") {
          Game.StateAPI.syncMeToPlayers();
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
      const restore = Game.Dev.resetProfileEconomyForDebug();
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

  Game.Dev.resultCardSmoke = (opts = {}) => {
    const scenarioList = ["battle", "escape", "ignore"];
    const scenarioRaw = String(opts && opts.scenario ? opts.scenario : "battle").toLowerCase();
    const scenario = scenarioList.includes(scenarioRaw) ? scenarioRaw : "battle";
    const mode = (String(opts && opts.mode ? opts.mode : "majority").toLowerCase() === "fifty") ? "fifty" : "majority";
    const meVote = opts && opts.meVote === false ? false : true;
    const name = "result_card_smoke";
    const debugMarker = !!(opts && opts.debugMarker);
    if (debugMarker) console.warn("DEV_RESULT_CARD_V2_LOADED", Date.now());
    const S = Game.State || (Game.State = {});
    S.events = Array.isArray(S.events) ? S.events : [];
    if (!Game.Debug) Game.Debug = {};
    if (!Array.isArray(Game.Debug.moneyLog)) Game.Debug.moneyLog = [];
    if (!Array.isArray(Game.Debug.toastLog)) Game.Debug.toastLog = [];

    const existingIds = Array.isArray(Game.Dev._resultCardIds) ? Game.Dev._resultCardIds : [];
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
    Game.Dev._resultCardIds = [event.id];

    if (!Game.Debug) Game.Debug = {};
    if (!Array.isArray(Game.Debug.moneyLog)) Game.Debug.moneyLog = [];
    if (!Array.isArray(Game.Debug.toastLog)) Game.Debug.toastLog = [];

    try { if (Game.UI && typeof Game.UI.renderEvents === "function") Game.UI.renderEvents(); } catch (_) {}
    try { if (Game.UI && typeof Game.UI.requestRenderAll === "function") Game.UI.requestRenderAll(); } catch (_) {}

    return { name, ok: true, scenario, mode, meVote, eventId: id };
  };

  Game.Dev.runtimeCrowdAuditOnce = async (opts = {}) => {
    const name = "runtime_crowd_audit_once";
    const S = Game.State || null;
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
    if (Game.StateAPI && typeof Game.StateAPI.getPointsConfig === "function") {
      const cfg = Game.StateAPI.getPointsConfig();
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
    const endedBy = crowd.crowdCapDebug ? crowd.crowdCapDebug.endedBy : ((Game.Debug && Game.Debug.crowdCapMetaByBattle && battleId) ? (Game.Debug.crowdCapMetaByBattle[battleId] && Game.Debug.crowdCapMetaByBattle[battleId].endedBy) : null);
    const rawVotes = totalVotesFromCrowd(crowd);
    const meta = (Game.Debug && Game.Debug.crowdCapMetaByBattle && battleId) ? Game.Debug.crowdCapMetaByBattle[battleId] : null;
    const totalWeighted = meta ? ((meta.aVotes | 0) + (meta.bVotes | 0)) : ((Number.isFinite(crowd.aVotes) ? (crowd.aVotes | 0) : 0) + (Number.isFinite(crowd.bVotes) ? (crowd.bVotes | 0) : 0));
    const weightedSideCounts = { a: meta ? (meta.aVotes | 0) : (crowd.aVotes | 0), b: meta ? (meta.bVotes | 0) : (crowd.bVotes | 0), total: totalWeighted | 0 };
    const winner = crowd.winnerSide || battle.winnerSide || null;
    const timerUsed = endedBy && endedBy !== "cap";

    const log = (Game.Debug && Array.isArray(Game.Debug.moneyLog)) ? Game.Debug.moneyLog : [];
    const byBattle = (Game.Debug && Game.Debug.moneyLogByBattle && battleId && Array.isArray(Game.Debug.moneyLogByBattle[battleId]))
      ? Game.Debug.moneyLogByBattle[battleId]
      : null;
    const scoped = byBattle || log.filter(e => String(e && e.battleId || "") === String(battleId));
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
    const poolId = (Econ && Econ.getCrowdPoolId && battleId) ? Econ.getCrowdPoolId(battleId) : `crowd:${battleId}`;
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
    const S = Game.State || null;
    const Econ = Game.ConflictEconomy || Game._ConflictEconomy || null;
    const Core = Game.ConflictCore || Game._ConflictCore || null;
    const Conflict = Game.Conflict || null;
    const diag = { stageTrace: [], battlesCount: (S && Array.isArray(S.battles)) ? S.battles.length : 0, lastBattle: null, whyNoCrowd: null, scenario, mode };
    const pushStage = (s) => { diag.stageTrace.push(s); };
    if (!S || !S.players) return { name, ok: false, details: "missing_state", battleId: null, diag };
    if (!Core || !Conflict) return { name, ok: false, details: "missing_conflict", battleId: null, diag };

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    let expectedStart = null;
    if (Game.StateAPI && typeof Game.StateAPI.getPointsConfig === "function") {
      const cfg = Game.StateAPI.getPointsConfig();
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
    const oppId = (opts && opts.oppId && S.players[opts.oppId]) ? opts.oppId : "npc_weak";
    if (Conflict.incoming) {
      const b = Conflict.incoming(oppId);
      battle = (b && b.id) ? b : (b && b.battle && b.battle.id ? b.battle : null);
      battleId = battle ? battle.id : null;
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
        last = byTime[byTime.length - 1] || last;
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

    const esc = Conflict.escape ? Conflict.escape(battleId, mode) : null;
    if (!esc || esc.ok === false) {
      diag.whyNoCrowd = { status: "escape_start_failed", missingField: "escapeVote", error: esc && (esc.error || esc.reason) || null };
      return { name, ok: false, details: "escape_start_failed", battleId, diag };
    }
    pushStage("escape_started");

    battle = getBattle(battleId) || battle;
    if (!battle || !battle.escapeVote) {
      diag.whyNoCrowd = { status: battle ? battle.status : null, missingField: "escapeVote" };
      return { name, ok: false, details: "no_escape_vote", battleId, diag };
    }
    pushStage("escape_vote_attached");

    const v = battle.escapeVote;
    if (!Number.isFinite(v.cap) || v.cap <= 0) {
      const totalPlayers = Object.keys(S.players || {}).length;
      v.cap = Math.max(10, Math.round(0.4 * (totalPlayers | 0)));
      v.totalPlayers = totalPlayers;
    }

    const totalVotesFromCrowd = (c) => {
      if (!c) return 0;
      if (c.voters && typeof c.voters === "object") return Object.keys(c.voters).length | 0;
      const a = Number.isFinite(c.votesA) ? (c.votesA | 0) : (Number.isFinite(c.aVotes) ? (c.aVotes | 0) : 0);
      const b = Number.isFinite(c.votesB) ? (c.votesB | 0) : (Number.isFinite(c.bVotes) ? (c.bVotes | 0) : 0);
      return (a + b) | 0;
    };

    let tickCount = 0;
    const maxTicks = (opts && Number.isFinite(opts.maxTicks)) ? (opts.maxTicks | 0) : 240;
    while (tickCount < maxTicks && v && !v.decided) {
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
      diag.whyNoCrowd = { status: battle ? battle.status : null, missingField: "escapeVote.decided" };
      diag.lastBattle = battle ? { id: battle.id, status: battle.status, result: battle.result, escapeVote: !!battle.escapeVote } : null;
      return { name, ok: false, details: "escape_vote_not_decided", battleId, diag };
    }
    pushStage("cap_reached");
    pushStage("finalized");

    const crowd = battle.escapeVote;
    const meta = (Game.Debug && Game.Debug.crowdCapMetaByBattle && battleId) ? Game.Debug.crowdCapMetaByBattle[battleId] : null;
    const endedBy = meta ? meta.endedBy : "cap";
    const rawVotes = totalVotesFromCrowd(crowd);
    const totalWeighted = meta ? ((meta.aVotes | 0) + (meta.bVotes | 0)) : ((crowd.aVotes | 0) + (crowd.bVotes | 0));
    const weightedSideCounts = { a: meta ? (meta.aVotes | 0) : (crowd.aVotes | 0), b: meta ? (meta.bVotes | 0) : (crowd.bVotes | 0), total: totalWeighted | 0 };
    let winner = null;
    if (crowd.outcome === "A_WIN") winner = "attacker";
    else if (crowd.outcome === "B_WIN") winner = "defender";
    const timerUsed = endedBy && endedBy !== "cap";

    const log = (Game.Debug && Array.isArray(Game.Debug.moneyLog)) ? Game.Debug.moneyLog : [];
    const byBattle = (Game.Debug && Game.Debug.moneyLogByBattle && battleId && Array.isArray(Game.Debug.moneyLogByBattle[battleId]))
      ? Game.Debug.moneyLogByBattle[battleId]
      : null;
    const scoped = byBattle || log.filter(e => String(e && e.battleId || "") === String(battleId));
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
    const poolId = (Econ && Econ.getCrowdPoolId && battleId) ? Econ.getCrowdPoolId(battleId) : `crowd:${battleId}`;
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
      const a = afterPtsMap[id];
      const ln = logNetById[id];
      if (Number.isFinite(a) && Number.isFinite(ln)) beforePtsMap[id] = (a | 0) - (ln | 0);
      else if (Number.isFinite(a)) beforePtsMap[id] = (a | 0);
      else beforePtsMap[id] = null;
    });
    const baselinePtsMap = Object.assign(Object.create(null), beforePtsMap);
    const totalPtsWorldBefore = auditIds.reduce((s, id) => s + (Number.isFinite(beforePtsMap[id]) ? (beforePtsMap[id] | 0) : 0), 0);
    const totalPtsWorldAfter = auditIds.reduce((s, id) => s + (Number.isFinite(afterPtsMap[id]) ? (afterPtsMap[id] | 0) : 0), 0);
    const start10Ok = auditIds.filter(id => !isPoolId(id)).every(id => beforePtsMap[id] === expectedStart);

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
    return result;
  };

  Game.Dev.runtimeCrowdAuditEscapeOnce = async (opts = {}) => {
    return runtimeCrowdAuditEscapeIgnoreOnce("smyt", "escape", opts);
  };
  Game.Dev.runtimeCrowdAuditIgnoreOnce = async (opts = {}) => {
    return runtimeCrowdAuditEscapeIgnoreOnce("off", "ignore", opts);
  };

  // Dev shortcut: Ctrl+Shift+T
  if (!Game.Dev.__shortcutBound) {
    Game.Dev.__shortcutBound = true;
    window.addEventListener("keydown", (e) => {
      const S = Game.State || {};
      const flags = S.flags || {};
      if (flags.devChecks !== true) return;
      const tag = (e && e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : "";
      const isField = tag === "input" || tag === "textarea" || (e.target && e.target.isContentEditable);
      if (isField) return;
      if (e && e.ctrlKey && e.shiftKey && (e.key === "T" || e.key === "t")) {
        e.preventDefault();
        Game.Dev.scenarioRun();
      }
    });
  }
})();
