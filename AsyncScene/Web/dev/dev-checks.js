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

    const startPlayer = Number.isFinite(D0.START_POINTS_PLAYER) ? (D0.START_POINTS_PLAYER | 0) : 12;
    const startNpc = Number.isFinite(D0.START_POINTS_NPC) ? (D0.START_POINTS_NPC | 0) : 8;

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
      const startNpc = Number.isFinite(D0.START_POINTS_NPC) ? (D0.START_POINTS_NPC | 0) : 8;

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
    try {
      if (!Game.Debug) Game.Debug = {};
      prevForce = Game.Debug.FORCE_CIRCULATION;
      prevBypass = Game.Debug.BYPASS_POINTS_GUARD === true;
      prevAllow = Game.Debug.ALLOW_POINTS_WRITE === true;
      Game.Debug.FORCE_CIRCULATION = true;
      Game.Debug.BYPASS_POINTS_GUARD = true;
      Game.Debug.ALLOW_POINTS_WRITE = true;

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
          if (opts.forceCap && battleInState.crowd) {
            const currCap = Math.max(1, Number.isFinite(battleInState.crowd.cap) ? (battleInState.crowd.cap | 0) : (battleInState.crowd.totalPlayers | 0));
            const currentVotes = (battleInState.crowd.votesA | 0) + (battleInState.crowd.votesB | 0);
            const needed = Math.max(0, currCap - currentVotes);
            battleInState.crowd.votesA = (battleInState.crowd.votesA | 0) + needed;
            battleInState.crowd.aVotes = battleInState.crowd.votesA;
          }
          try {
            tickResult = Core.applyCrowdVoteTick(battleId);
          } catch (_) {
            tickResult = null;
          }
          if (!tickResult) {
            tickResult = { ok: false, battleId, why: "tick_failed" };
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
    }
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
