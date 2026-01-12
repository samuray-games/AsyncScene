// conflict.js
window.Game = window.Game || {};

(() => {
  const Conflict = {};
  const clamp0 = (n) => Math.max(0, n);

  // ---------- safe state bootstrap ----------
  function ensureState() {
    Game.State = Game.State || {};
    const S = Game.State;

    S.battles = Array.isArray(S.battles) ? S.battles : [];
    S.players = S.players || {};

    // Me lives in TWO places by design:
    // - State.me: удобные поля профиля
    // - State.players.me: чтобы весь движок работал одинаково для "me" и NPC
    S.me = S.me || {};
    S.me.id = "me";
    S.me.name = S.me.name || "Ты";
    S.me.points = clamp0(S.me.points ?? 0);
    S.me.influence = S.me.influence ?? 0;
    S.me.wins = S.me.wins ?? 0;
    S.me.oneShots = Array.isArray(S.me.oneShots) ? S.me.oneShots : [];

    // Track which unlock notifications were already emitted.
    // Keys: 5 | 10 | 100
    S.me.unlockNotified = (S.me.unlockNotified && typeof S.me.unlockNotified === "object") ? S.me.unlockNotified : {};

    // sync players.me (reference, not copy)
    S.players.me = S.me;

    return S;
  }

  function uiCall(fnName, ...args) {
    if (!Game.UI) return;
    const fn = Game.UI[fnName];
    if (typeof fn === "function") fn(...args);
  }

  function pushSystemPersonal(msg) {
    if (!msg) return;
    if (Game.UI && typeof Game.UI.pushSystemPersonal === "function") return Game.UI.pushSystemPersonal(msg);
    if (Game.UI && typeof Game.UI.pushSystem === "function") return Game.UI.pushSystem(msg);
  }

  function pushSystemPublic(msg) {
    if (!msg) return;
    if (Game.UI && typeof Game.UI.pushSystemPublic === "function") return Game.UI.pushSystemPublic(msg);
    if (Game.UI && typeof Game.UI.pushSystem === "function") return Game.UI.pushSystem(msg);
  }

  function unlockLinesForInfluence(inf, name) {
    const n = name || "Кто-то";
    if (inf === 5) {
      return {
        me: "Твои аргументы стали сильными.",
        all: `Аргументы ${n} стали сильными.`,
      };
    }
    if (inf === 10) {
      return {
        me: "Твои аргументы стали мощными.",
        all: `Аргументы ${n} стали мощными.`,
      };
    }
    if (inf === 100) {
      return {
        me: "Твои аргументы стали супермощными.",
        all: `Аргументы ${n} стали супермощными.`,
      };
    }
    return null;
  }

  // ---------- data access (ARGUMENTS is source of truth, but keep fallback) ----------
  function normalizeArgumentList(src) {
    if (!src) return [];
    if (Array.isArray(src)) return src;
    if (typeof src === "object") {
      const out = [];
      for (const k of Object.keys(src)) {
        const v = src[k];
        if (Array.isArray(v)) out.push(...v);
      }
      return out;
    }
    return [];
  }

  function getDataAttackList() {
    // preferred
    const a = Game.Data?.ARGUMENTS?.attack;
    if (a) return normalizeArgumentList(a);
    // fallback legacy
    const p = Game.Data?.PHRASES?.attack;
    return normalizeArgumentList(p);
  }

  function getDataDefenseList() {
    const d = Game.Data?.ARGUMENTS?.defense;
    if (d) return normalizeArgumentList(d);
    const p = Game.Data?.PHRASES?.defense;
    return normalizeArgumentList(p);
  }

  function pickOne(list) {
    if (!Array.isArray(list) || list.length === 0) return null;
    return list[Math.floor(Math.random() * list.length)];
  }

  // ---------- pairing meta (intuitive question-answer) ----------
  // Group: "yn" | "who" | "where" (data.js should set this)
  // Pair: optional exact binding (strongest).
  function getPairId(p) {
    return p?.pairId ?? p?.pair ?? p?.pair_id ?? null;
  }

  function normalizeGroupValue(g) {
    if (!g) return null;
    const s = String(g).trim().toLowerCase();

    // canonical groups: yn | who | where
    if (s === "yn" || s === "yesno" || s === "yes/no" || s.includes("да/нет") || s.includes("да-нет")) return "yn";

    if (s === "who" || s === "who/what" || s.includes("кто") || s.includes("что") || s.includes("who") || s.includes("what")) return "who";

    if (s === "where" || s.includes("где") || s.includes("мест") || s.includes("куда") || s.includes("where")) return "where";

    if (s.startsWith("yn")) return "yn";
    if (s.startsWith("who")) return "who";
    if (s.startsWith("where")) return "where";

    return s;
  }

  function getGroup(p) {
    return normalizeGroupValue(p?.group ?? p?.qType ?? p?.qtype ?? null);
  }

  function defenseCountersAttack(def, atk) {
    const ap = getPairId(atk);
    const dp = getPairId(def);

    // If the attack has a pairId, ONLY an exact pairId match is considered a correct counter.
    if (ap) return !!(dp && dp === ap);

    // Otherwise fall back to group matching (yn/who/where).
    const ag = getGroup(atk);
    const dg = getGroup(def);
    if (ag && dg) return ag === dg;

    return false;
  }

  // ---------- strength / tiers ----------
  function allowedColorsForInfluence(inf) {
    const set = new Set(["y"]);
    if ((inf || 0) >= 5) set.add("o");
    if ((inf || 0) >= 10) set.add("r");
    if ((inf || 0) >= 100) set.add("k");
    return set;
  }

  function myAllowedColors() {
    const S = ensureState();
    return allowedColorsForInfluence(S.me.influence || 0);
  }

  function powerOf(arg) {
    if (!arg) return 1;

    const fallback = { y: 1, o: 2, r: 3, k: 4 };

    // Attack can be stored with color hidden (color:null). Use _color for calculations.
    const realColor = (arg.color != null) ? arg.color : (arg._color != null ? arg._color : "y");

    const table = Game.Data?.ARGUMENT_POWER;

    if (table && Object.prototype.hasOwnProperty.call(table, realColor)) {
      const n = Number(table[realColor]);
      if (Number.isFinite(n) && n > 0) return n;
    }

    return fallback[realColor] || 1;
  }

  function markOneShotUsedIfNeeded(arg) {
    const S = ensureState();
    if (!arg || !arg.oneShot) return;
    const os = (S.me.oneShots || []).find(x => x.id === arg.id);
    if (os) os.used = true;
  }

  function myAttackOptions() {
    const S = ensureState();
    const allowed = myAllowedColors();

    const base = getDataAttackList();
    let list = base.filter(a => allowed.has(a.color)).slice();

    const ones = (S.me.oneShots || []).filter(x => x.kind === "attack" && !x.used && allowed.has(x.color));
    for (const x of ones) {
      list.push({
        id: x.id,
        color: x.color,
        text: x.text,
        oneShot: true,
        pairId: x.pairId ?? null,
        group: x.group ?? x.qType ?? null,
      });
    }

    return list;
  }

  function myDefenseOptions(filterMeta = null) {
    const S = ensureState();
    const allowed = myAllowedColors();

    const base = getDataDefenseList();
    let list = base.filter(a => allowed.has(a.color)).slice();

    const ones = (S.me.oneShots || []).filter(x => x.kind === "defense" && !x.used && allowed.has(x.color));
    for (const x of ones) {
      list.push({
        id: x.id,
        color: x.color,
        text: x.text,
        oneShot: true,
        pairId: x.pairId ?? null,
        group: x.group ?? x.qType ?? null,
      });
    }

    if (filterMeta && (filterMeta.pairId || filterMeta.group)) {
      const pairId = filterMeta.pairId || null;
      const group = filterMeta.group || null;

      let filtered = list;

      if (pairId) {
        filtered = filtered.filter(d => getPairId(d) === pairId);
      }

      if ((!pairId || filtered.length === 0) && group) {
        filtered = list.filter(d => getGroup(d) === group);
      }

      if (filtered.length > 0) list = filtered;
    }

    return list;
  }

  function normalizePickedArg(a, fallback) {
    if (!a) return fallback;
    return {
      id: a.id || a.argId || a.key || (fallback?.id || "npc_arg"),
      color: a.color || a.col || (fallback?.color || "y"),
      text: a.text || a.label || (fallback?.text || "Да."),
      group: getGroup(a),
      pairId: getPairId(a),
    };
  }

  function npcFallbackAttack() {
    return { id: "npc_atk_fallback", color: "y", text: "Да?", group: "yn", pairId: "yn_0" };
  }

  function npcFallbackDefense() {
    return { id: "npc_def_fallback", color: "y", text: "Да, думаю так.", group: "yn", pairId: "yn_0" };
  }

  function npcPickAttackByInfluence(inf) {
    const allowed = allowedColorsForInfluence(inf || 0);
    const pool = getDataAttackList().filter(a => allowed.has(a.color));
    const pick = pickOne(pool);
    if (pick) return normalizePickedArg(pick, npcFallbackAttack());

    const N = Game.NPC;
    if (!N) return npcFallbackAttack();
    if (typeof N.pickAttack === "function") return normalizePickedArg(N.pickAttack(inf), npcFallbackAttack());
    if (typeof N.pickAttackByInfluence === "function") return normalizePickedArg(N.pickAttackByInfluence(inf), npcFallbackAttack());
    if (typeof N.pickAttackForInfluence === "function") return normalizePickedArg(N.pickAttackForInfluence(inf), npcFallbackAttack());

    return npcFallbackAttack();
  }

  function npcPickDefenseSmart(inf, attackArg) {
    const allowed = allowedColorsForInfluence(inf || 0);
    const pool = getDataDefenseList().filter(d => allowed.has(d.color));
    if (pool.length === 0) return npcFallbackDefense();

    const atkGroup = getGroup(attackArg);
    const atkPair = getPairId(attackArg);

    const matched = pool.filter(d => {
      const dp = getPairId(d);
      const dg = getGroup(d);
      if (atkPair && dp && dp === atkPair) return true;
      if (atkGroup && dg && dg === atkGroup) return true;
      return false;
    });

    const pMatch = Math.max(0.30, Math.min(0.60, 0.30 + (inf / 100) * 0.30));

    if (matched.length > 0 && Math.random() < pMatch) {
      return normalizePickedArg(pickOne(matched), npcFallbackDefense());
    }

    return normalizePickedArg(pickOne(pool), npcFallbackDefense());
  }

  function hideAttackColor(arg) {
    if (!arg) return null;
    if (arg.color == null && arg._color != null) return { ...arg };
    if (arg.color != null && arg._color == null) return { ...arg, _color: arg.color, color: null };
    if (arg._color == null) return { ...arg, _color: arg.color ?? "y", color: null };
    return { ...arg, color: null };
  }

  function revealAttackColor(b) {
    if (!b || !b.attack) return;
    if (b.attack.color == null && b.attack._color != null) b.attack.color = b.attack._color;
  }

  // ---------- economy / progress ----------
  function winForMe() {
    const S = ensureState();

    S.me.wins = (S.me.wins || 0) + 1;
    S.me.influence = S.me.wins;

    const inf = S.me.influence;
    const lines = unlockLinesForInfluence(inf, S.me.name);
    if (!lines) return;

    if (S.me.unlockNotified && S.me.unlockNotified[String(inf)]) return;
    if (S.me.unlockNotified) S.me.unlockNotified[String(inf)] = true;

    if (inf === 5) {
      pushSystemPersonal(Game.Data?.SYS?.unlockStrongMe || lines.me);
      pushSystemPublic(Game.Data?.SYS?.unlockStrongAll || lines.all);
      return;
    }

    if (inf === 10) {
      pushSystemPersonal(Game.Data?.SYS?.unlockMightyMe || lines.me);
      pushSystemPublic(Game.Data?.SYS?.unlockMightyAll || lines.all);
      return;
    }

    if (inf === 100) {
      pushSystemPersonal(Game.Data?.SYS?.unlockSuperMe || lines.me);
      pushSystemPublic(Game.Data?.SYS?.unlockSuperAll || lines.all);
      return;
    }
  }

  function applyBattleEconomy(winnerId, loserId) {
    const S = ensureState();
    const w = S.players[winnerId];
    const l = S.players[loserId];
    if (!w || !l) return;

    w.points = (w.points || 0) + 2;
    l.points = clamp0((l.points || 0) - 1);

    if (winnerId !== "me") {
      w.wins = (w.wins || 0) + 1;
      w.influence = w.wins;
    }

    if (loserId !== "me") {
      l.wins = l.wins || 0;
      l.influence = l.influence ?? l.wins;
    }
  }

  // ---------- battle lifecycle ----------
  function newBattle(opponentId, fromThem, pinned = false) {
    const id = `b_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
    return {
      id,
      opponentId,
      fromThem: !!fromThem,
      pinned: !!pinned,

      status: fromThem ? "pickDefense" : "pickAttack",

      attack: null,
      defense: null,

      attackHidden: true,

      resolved: false,
      result: null,
      resultLine: "",
      inlineNote: "",

      tieVote: null,
    };
  }

  function addBattle(b) {
    const S = ensureState();

    if (b.pinned) {
      S.battles.unshift(b);
    } else {
      const firstNonPinned = S.battles.findIndex(x => !x.pinned);
      if (firstNonPinned === -1) S.battles.push(b);
      else S.battles.splice(firstNonPinned, 0, b);
    }

    uiCall("renderAll");
  }

  function findBattle(id) {
    const S = ensureState();
    return S.battles.find(x => x.id === id) || null;
  }

  function removeBattle(id) {
    const S = ensureState();
    S.battles = S.battles.filter(x => x.id !== id);
    uiCall("renderAll");
  }

  // ---------- API (required) ----------
  Conflict.incoming = (opponentId, opts = {}) => {
    const S = ensureState();
    const opp = S.players[opponentId];
    if (!opp) return null;

    const b = newBattle(opponentId, true, !!opts.pinned);
    b.attack = hideAttackColor(npcPickAttackByInfluence(opp.influence || 0));
    b.attackHidden = true;

    addBattle(b);

    uiCall("onIncomingBattleCreated", b.id);
    return b.id;
  };

  Conflict.startWith = (opponentId, opts = {}) => {
    const S = ensureState();

    if ((S.me.points || 0) <= 0) {
      return { ok: false, reason: "no_points" };
    }

    const opp = S.players[opponentId];
    if (!opp) return { ok: false, reason: "no_target" };

    S.me.points = clamp0((S.me.points || 0) - 1);

    const pinned = (opts && Object.prototype.hasOwnProperty.call(opts, "pinned")) ? !!opts.pinned : true;
    const b = newBattle(opponentId, false, pinned);

    b.attackHidden = true;
    b.status = "pickAttack";

    addBattle(b);

    uiCall("onOutgoingBattleCreated", b.id);
    return { ok: true, battleId: b.id };
  };

  Conflict.escape = (battleId, mode) => {
    const S = ensureState();
    const b = findBattle(battleId);
    if (!b) return;

    const opp = S.players[b.opponentId];
    const canFreeOff = (S.me.influence || 0) >= 5;

    if (mode === "off") {
      if (!canFreeOff) return;
      uiCall("pushSystem", `Ты отшил(а) ${opp ? opp.name : "кого-то"}.`);
      removeBattle(battleId);
      return;
    }

    if ((S.me.points || 0) < 1) {
      b.inlineNote = Game.Data?.SYS?.needEscapePointsInline || "Не хватает 💰.";
      uiCall("renderAll");
      return;
    }

    S.me.points = clamp0((S.me.points || 0) - 1);
    uiCall("pushSystem", `Ты смылся(ась) от ${opp ? opp.name : "кого-то"}.`);
    removeBattle(battleId);
  };

  Conflict.escapeAll = (mode) => {
    const S = ensureState();
    const active = S.battles.filter(b => !b.resolved);
    const count = active.length;
    if (count <= 0) return;

    const canFreeOff = (S.me.influence || 0) >= 5;

    if (mode === "off") {
      if (!canFreeOff) return;
      S.battles = S.battles.filter(b => b.resolved);
      uiCall("pushSystem", "Ты отшил(а) всех активных. Площадь выдохнула.");
      uiCall("renderAll");
      return;
    }

    if ((S.me.points || 0) < count) {
      uiCall("pushSystem", "Не хватает 💰, чтобы смыться от всех активных.");
      return;
    }

    S.me.points = clamp0((S.me.points || 0) - count);
    S.battles = S.battles.filter(b => b.resolved);
    uiCall("pushSystem", `Ты смылся(ась) от всех активных за ${count} 💰. Чисто.`);
    uiCall("renderAll");
  };

  Conflict.pickAttack = (battleId, attackId) => {
    const S = ensureState();
    const b = findBattle(battleId);
    if (!b || b.status !== "pickAttack") return;

    const opp = S.players[b.opponentId];
    if (!opp) return;

    const options = myAttackOptions();
    const atk = options.find(p => p.id === attackId);
    if (!atk) return;

    markOneShotUsedIfNeeded(atk);

    if (!b.fromThem && (opp.role === "bandit" || opp.role === "toxic" || opp.role === "gopnik")) {
      b.attack = hideAttackColor(atk);
      b.attackHidden = false;
      revealAttackColor(b);
      b.status = "resolved";
      b.resolved = true;

      if (opp.role === "bandit") {
        S.me.points = 0;
        b.resultLine = Game.Data?.SYS?.banditRobbed || "Тебя обнесли в ноль.";
      } else {
        S.me.points = clamp0((S.me.points || 0) - 3);
        b.resultLine = Game.Data?.SYS?.gopnikStealLine || "С тебя дернули 3 💰.";
      }

      applyBattleEconomy(b.opponentId, "me");

      uiCall("renderAll");
      return;
    }

    b.attack = hideAttackColor(atk);
    b.attackHidden = true;
    b.status = "waitingOpponent";
    b.inlineNote = "Ждем ответку...";

    uiCall("renderAll");

    const waitMs = 1000 + Math.floor(Math.random() * 9001);
    setTimeout(() => {
      const cur = findBattle(battleId);
      if (!cur || cur.status !== "waitingOpponent") return;

      const opp2 = S.players[cur.opponentId];
      if (!opp2) return;

      cur.defense = npcPickDefenseSmart(opp2.influence || 0, cur.attack);

      cur.attackHidden = false;
      revealAttackColor(cur);

      cur.status = "resolved";
      cur.inlineNote = "";

      resolveBattle(cur);
      uiCall("renderAll");
    }, waitMs);
  };

  Conflict.pickDefense = (battleId, defenseId) => {
    const S = ensureState();
    const b = findBattle(battleId);
    if (!b || b.status !== "pickDefense") return;

    const options = myDefenseOptions();
    const def = options.find(p => p.id === defenseId);
    if (!def) return;

    markOneShotUsedIfNeeded(def);

    b.defense = def;
    b.attackHidden = false;
    revealAttackColor(b);
    b.status = "resolved";
    b.inlineNote = "";

    resolveBattle(b);
    uiCall("renderAll");
  };

  // ---------- tie vote (fallback only) ----------
  function startTieVote(b) {
    const endsAt = Date.now() + 30000;
    b.tieVote = { endsAt, aVotes: 0, bVotes: 0, decided: false };

    const tick = () => {
      const cur = findBattle(b.id);
      if (!cur || !cur.tieVote || cur.tieVote.decided) return;

      if (Date.now() >= cur.tieVote.endsAt) {
        cur.tieVote.decided = true;
        finishTieVote(cur);
        uiCall("renderAll");
        return;
      }

      if (Math.random() < 0.50) {
        if (Math.random() < 0.5) cur.tieVote.aVotes += 1;
        else cur.tieVote.bVotes += 1;
        uiCall("renderAll");
      }

      setTimeout(tick, 450 + Math.floor(Math.random() * 700));
    };

    setTimeout(tick, 500);
  }

  function finishTieVote(b) {
    const S = ensureState();
    const v = b.tieVote;
    if (!v) return;
    if (b.economyApplied) return;
    b.economyApplied = true;

    let winnerSide = "a";
    if (v.aVotes > v.bVotes) winnerSide = "a";
    else if (v.bVotes > v.aVotes) winnerSide = "b";
    else winnerSide = (Math.random() < 0.5) ? "a" : "b";

    const attackerId = b.fromThem ? b.opponentId : "me";
    const defenderId = b.fromThem ? "me" : b.opponentId;

    const winnerId = (winnerSide === "a") ? attackerId : defenderId;
    const loserId = (winnerSide === "a") ? defenderId : attackerId;

    const opp = S.players[b.opponentId];
    const me = S.players.me;

    if (winnerId === "me") {
      b.resultLine = `${me.name} забрал(а) раунд.`;
      applyBattleEconomy("me", b.opponentId);
      winForMe();
    } else {
      b.resultLine = `${opp ? opp.name : "Кто-то"} забрал(а) раунд.`;
      applyBattleEconomy(b.opponentId, "me");
    }

    b.result = { winnerId, loserId, kind: "tie_vote" };
    b.resolved = true;
  }

  // ---------- resolve ----------
  function resolveBattle(b) {
    const S = ensureState();
    const me = S.players.me;
    const opp = S.players[b.opponentId];
    if (!me || !opp) return;
    if (b.economyApplied) return;

    if (opp.role === "bandit" && b.fromThem && b.defense) {
      b.economyApplied = true;
      S.me.points = 0;
      b.resultLine = Game.Data?.SYS?.banditRobbed || "Тебя обнесли в ноль.";
      applyBattleEconomy(b.opponentId, "me");
      b.result = { winnerId: b.opponentId, loserId: "me", kind: "trap_bandit" };
      b.resolved = true;
      return;
    }

    if ((opp.role === "toxic" || opp.role === "gopnik") && b.fromThem && b.defense) {
      b.economyApplied = true;
      S.me.points = clamp0((S.me.points || 0) - 3);
      b.resultLine = Game.Data?.SYS?.gopnikStealLine || "С тебя дернули 3 💰.";
      b.result = { winnerId: b.opponentId, loserId: "me", kind: opp.role === "toxic" ? "trap_toxic" : "trap_gopnik" };
      applyBattleEconomy(b.opponentId, "me");
      b.resolved = true;
      return;
    }

    const atkP = powerOf(b.attack);
    const defP = powerOf(b.defense);

    const isPaired = defenseCountersAttack(b.defense, b.attack);
    const effAtk = atkP;
    const effDef = defP + (isPaired ? 1 : 0);

    // Equal after bonuses:
    // - if paired: defender wins (no vote)
    // - else: crowd vote
    if (effAtk === effDef) {
      if (isPaired) {
        const winnerId = b.fromThem ? "me" : b.opponentId;
        const loserId  = b.fromThem ? b.opponentId : "me";

        if (winnerId === "me") {
          b.resultLine = `${me.name} забрал(а) раунд.`;
          b.economyApplied = true;
          applyBattleEconomy("me", b.opponentId);
          winForMe();
        } else {
          b.resultLine = `${opp.name} забрал(а) раунд.`;
          b.economyApplied = true;
          applyBattleEconomy(b.opponentId, "me");
        }

        b.result = { winnerId, loserId, kind: "paired_tie_break" };
        b.resolved = true;
        return;
      }

      b.resultLine = "Ничья. Площадь решает.";
      b.result = { winnerId: null, loserId: null, kind: "tie_pending" };
      startTieVote(b);
      b.resolved = true;
      return;
    }

    const attackSideWins = effAtk > effDef;

    const winnerId = b.fromThem
      ? (attackSideWins ? b.opponentId : "me")
      : (attackSideWins ? "me" : b.opponentId);
    const loserId = b.fromThem
      ? (attackSideWins ? "me" : b.opponentId)
      : (attackSideWins ? b.opponentId : "me");

    if (winnerId === "me") {
      b.resultLine = `${me.name} забрал(а) раунд.`;
      b.economyApplied = true;
      applyBattleEconomy("me", b.opponentId);
      winForMe();
    } else {
      b.resultLine = `${opp.name} забрал(а) раунд.`;
      b.economyApplied = true;
      applyBattleEconomy(b.opponentId, "me");
    }

    b.result = { winnerId, loserId, kind: isPaired ? "paired_power" : "power" };
    b.resolved = true;
    return;
  }

  // Provide exactly N defense choices tailored to the current battle attack.
  // Hard rule for your new system:
  // - The 3 defense choices must ALWAYS be from the same question group as the attack (yn/who/where).
  // - If variety is low, repeats are allowed, but still same group.
  Conflict.getDefenseChoicesForBattle = (battleId, count = 3) => {
    const S = ensureState();
    const b = findBattle(battleId);
    if (!b) return [];

    const atk = b.attack;
    const atkGroup = getGroup(atk);
    const atkPair = getPairId(atk);

    const all = myDefenseOptions(null);
    if (!Array.isArray(all) || all.length === 0) return [];

    const sameGroup = atkGroup ? all.filter(d => getGroup(d) === atkGroup) : all.slice();
    if (sameGroup.length === 0) return [];

    let correct = null;
    if (atkPair) {
      const exact = sameGroup.filter(d => getPairId(d) === atkPair);
      if (exact.length > 0) correct = pickOne(exact);
    }

    const picks = [];
    const used = new Set();
    const keyOf = (x) => x?.id || `${x?.color}:${x?.text}`;

    const pushUnique = (x) => {
      if (!x) return false;
      const k = keyOf(x);
      if (used.has(k)) return false;
      used.add(k);
      picks.push(x);
      return true;
    };

    if (correct) pushUnique(correct);

    const distractorPool = (() => {
      if (!atkPair) return sameGroup;
      const diff = sameGroup.filter(d => getPairId(d) !== atkPair);
      return diff.length ? diff : sameGroup;
    })();

    let guard = 0;
    while (picks.length < count && guard < 5000) {
      guard += 1;
      const item = pickOne(distractorPool);
      if (!pushUnique(item)) continue;
    }

    // If we still cannot reach count due to low variety, allow repeats (still same group).
    guard = 0;
    while (picks.length < count && guard < 5000) {
      guard += 1;
      const item = pickOne(sameGroup);
      if (!item) break;
      picks.push(item);
    }

    for (let i = picks.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = picks[i];
      picks[i] = picks[j];
      picks[j] = tmp;
    }

    return picks.slice(0, count);
  };

  // exports
  Conflict.myAttackOptions = myAttackOptions;
  Conflict.myDefenseOptions = myDefenseOptions;
  Conflict.allowedColorsForInfluence = allowedColorsForInfluence;

  // bootstrap
  ensureState();
  Game.Conflict = Conflict;
})();
