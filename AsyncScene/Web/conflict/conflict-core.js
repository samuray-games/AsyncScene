// conflict-core.js
//
//  conflict-core.js
//  AsyncScene
//
//  Created by Ray on 2025/12/18.
//

// conflict/conflict-core.js
(function () {
  const C = {};

  // Local helpers
  function now(){ return Date.now(); }
  function clamp0(n){ return Math.max(0, n|0); }
  const DRAW_VOTE_DURATION_MS = 10000;
  function getPlayer(id){ return (Game.State.players && Game.State.players[id]) || null; }
  function pickRandom(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
  function isActivePlayer(p){
    if (!p || !p.id) return false;
    if (p.removed === true) return false;
    const jailed = (Game.State && Game.State.jailed) ? Game.State.jailed : null;
    if (jailed && jailed[p.id] && Number.isFinite(jailed[p.id].until) && now() < jailed[p.id].until) return false;
    if (p.id === "me" || p.isMe) return true;
    if (p.npc === true || p.type === "npc") return true;
    return !!p.name;
  }
  function getTotalPlayersCount(){
    const players = (Game.State && Game.State.players) ? Game.State.players : {};
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
  const warnOnce = (() => {
    const seen = Object.create(null);
    return (key, msg, extra) => {
      if (seen[key]) return;
      seen[key] = true;
      if (extra !== undefined) console.warn(msg, extra);
      else console.warn(msg);
    };
  })();

  // Decide argument tier by influence (y=weak, o=strong, r=power, k=absolute)
  // Single source of truth: Game.Data.PROGRESSION.unlockInfluence (strong/power/absolute).
  function tierByInfluence(inf){
    const v = (inf || 0) | 0;
    const P = (Game && Game.Data && Game.Data.PROGRESSION) ? Game.Data.PROGRESSION : null;
    const U = (P && P.unlockInfluence) ? P.unlockInfluence : null;

    const strongAt = (U && Number.isFinite(U.strong)) ? (U.strong | 0) : 5;
    const powerAt = (U && Number.isFinite(U.power)) ? (U.power | 0) : 10;
    const absoluteAt = (U && Number.isFinite(U.absolute)) ? (U.absolute | 0) : 100;

    if (v >= absoluteAt) return "k";
    if (v >= powerAt) return "r";
    if (v >= strongAt) return "o";
    return "y";
  }

  // =============================
  // Argument rules (type + color)
  // =============================
  function colorToStrength(c){
    const s = String(c || "").toLowerCase();
    if (s === "y" || s === "yellow") return 1;
    if (s === "o" || s === "orange") return 2;
    if (s === "r" || s === "red") return 3;
    if (s === "k" || s === "black" || s === "absolute") return 4;
    return 1;
  }

  function normalizeColor(c){
    const s = String(c || "").toLowerCase();
    if (s === "yellow" || s === "y") return "y";
    if (s === "orange" || s === "o") return "o";
    if (s === "red" || s === "r") return "r";
    if (s === "black" || s === "k" || s === "absolute") return "k";
    return "y";
  }

  function normalizeGroup(g){
    const s = String(g || "").toLowerCase();
    // accept aliases
    if (s === "yn" || s === "yesno" || s === "yes-no" || s === "da-net" || s === "да/нет" || s === "да-нет") return "yn";
    if (s === "who" || s === "who/what" || s === "whowhat" || s === "кто" || s === "что" || s === "кто/что") return "who";
    if (s === "where" || s === "где") return "where";
    return s || "yn";
  }

  function bumpBattleBadgeIfCollapsed() {
    try {
      if (Game.UI && typeof Game.UI.isPanelCollapsed === "function" && Game.UI.isPanelCollapsed("battles")) {
        if (typeof Game.UI.bumpCollapsedCounter === "function") Game.UI.bumpCollapsedCounter("battles");
      }
    } catch (_) {}
  }

  function argGroup(arg){
    if (!arg) return "yesno";
    return normalizeGroup(arg.type || arg.group || arg.g || arg.kindGroup || "yesno");
  }

  function argColor(arg){
    if (!arg) return "y";
    // IMPORTANT: also read hidden color stored in _color for attacks
    return normalizeColor(arg.color || arg.c || arg._color || arg.power || "y");
  }

  function isCorrectType(attackArg, defenseArg){
    return argGroup(attackArg) === argGroup(defenseArg);
  }

  function getRole(id){
    const p = getPlayer(id);
    return p ? String(p.role || p.type || "").toLowerCase() : "";
  }

  function getEcon(){
    return (Game && Game._ConflictEconomy) ? Game._ConflictEconomy : null;
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

  function econTransfer(fromId, toId, amount, reason, meta){
    const Econ = getEcon();
    if (Econ && typeof Econ.transferPoints === "function") {
      return Econ.transferPoints(fromId, toId, amount, reason, meta || {});
    }
    return { ok: false, reason: "no_econ" };
  }

  function attackerDefenderIds(b){
    const attackerId = b.fromThem ? b.opponentId : "me";
    const defenderId = b.fromThem ? "me" : b.opponentId;
    return { attackerId, defenderId };
  }

  function ensurePointsField(p){
    if (!p) return;
    if (typeof p.points !== "number") p.points = 0;
  }

  function getName(id){
    const p = getPlayer(id);
    return p ? String(p.name || p.title || id) : String(id || "");
  }

  function pushSystem(line){
    try {
      if (Game.StateAPI && typeof Game.StateAPI.pushChat === "function") {
        Game.StateAPI.pushChat("Система", line, { system: true });
      }
    } catch (_) {}
  }

  function recordVillainHarm(role, loss, opponentId){
    try {
      if (!role) return;
      const st = Game.State || {};
      st.victimByRole = st.victimByRole || {};
      st.victimByRole[role] = {
        at: now(),
        loss: Math.max(0, loss | 0),
        opponentId: opponentId || null
      };
      st.sightings = st.sightings || {};
      st.sightings[role] = now();
    } catch (_) {}
  }

  function battleResultText(b){
    if (!b) return "";
    if (b.resultLine && String(b.resultLine).trim()) return String(b.resultLine).trim();
    const r = String(b.result || "").toLowerCase();
    if (r === "win") return "Победа";
    if (r === "lose") return "Поражение";
    if (r === "draw") return "Толпа решает";
    if (r === "escaped") return "Свалил";
    if (r === "ignored") return "Отвалил";
    if (r === "stay" || r === "blocked") return "Остался";
    return "Итог";
  }

  function announceBattleResult(b){
    try {
      if (!b || b.chatResultAnnounced) return;
      const oppName = getName(b.opponentId) || "Оппонент";
      const text = battleResultText(b);
      if (!text) return;
      pushSystem(`Баттл с ${oppName}: ${text}.`);
      b.chatResultAnnounced = true;
    } catch (_) {}
  }

  function applyVillainPenalty(b, action){
    try {
      if (!b) return;
      const role = getRole(b.opponentId);
      if (role !== "toxic" && role !== "bandit") return;

      const me = Game.State && Game.State.me;
      if (!me) return;
      ensurePointsField(me);

      if (role === "toxic") {
        if (b.toxicHitApplied) return;
        const before = me.points | 0;
        const cost = 5;
        if (isCirculationEnabled()) {
          const oppId = b.opponentId || "sink";
          econTransfer("me", oppId, cost, "toxicHit", { battleId: b.id || b.battleId || null });
        } else {
          const afterPts = clamp0(before - cost);
          me.points = afterPts;
          try {
            if (Game && Game.StateAPI && typeof Game.StateAPI.emitStatDelta === "function") {
              Game.StateAPI.emitStatDelta("points", (afterPts - before) | 0, { reason: "toxicHit", battleId: b.id || b.battleId || null });
            }
          } catch (_) {}
        }
        b.toxicHitApplied = true;
        b.toxicHitMs = now();
        const actual = Math.max(0, before - me.points);
        recordVillainHarm("toxic", actual || cost, b.opponentId);
        
        // REP падение при ограблении токсиком — REP v2 economy
        try {
          if (Game.StateAPI && typeof Game.StateAPI.transferRep === "function") {
            const D = (Game && Game.Data) ? Game.Data : null;
            const repLoss = (D && Number.isFinite(D.REP_TOXIC_ROBBERY)) ? (D.REP_TOXIC_ROBBERY | 0) : 2;
            const repFloor = (D && Number.isFinite(D.REP_FLOOR)) ? (D.REP_FLOOR | 0) : 1;
            const currentRep = (Game.State && Number.isFinite(Game.State.rep)) ? (Game.State.rep | 0) : 0;
            const actualLoss = Math.min(repLoss, Math.max(0, currentRep - repFloor));
            if (actualLoss > 0) {
              Game.StateAPI.transferRep("me", "crowd_pool", actualLoss, "rep_toxic_robbery", b.id || b.battleId || null);
            }
          }
        } catch (_) {}
        
        const line = (Game.Data && Game.Data.SYS && typeof Game.Data.SYS.toxicStealLine === "function")
          ? Game.Data.SYS.toxicStealLine(actual || cost)
          : `Токсик снял у тебя ${actual || cost} 💰. Все видели.`;
        if (actual > 0) pushSystem(line);
      }

      if (role === "bandit") {
        if (b.banditRobbed) return;
        const before = me.points | 0;
        const keepOne = 1;
        const stolen = Math.max(0, before - keepOne);
        if (isCirculationEnabled()) {
          const oppId = b.opponentId || "sink";
          econTransfer("me", oppId, stolen, "bandit_robbery", { battleId: b.id || b.battleId || null });
        } else {
          const afterPts = Math.max(0, keepOne);
          me.points = afterPts;
          try {
            if (Game && Game.StateAPI && typeof Game.StateAPI.emitStatDelta === "function") {
              Game.StateAPI.emitStatDelta("points", (afterPts - before) | 0, { reason: "bandit_robbery", battleId: b.id || b.battleId || null });
            }
          } catch (_) {}
        }
        b.banditRobbed = true;
        recordVillainHarm("bandit", stolen, b.opponentId);
        
        // REP падение при ограблении бандитом — REP v2 economy
        try {
          if (Game.StateAPI && typeof Game.StateAPI.transferRep === "function") {
            const D = (Game && Game.Data) ? Game.Data : null;
            const repLoss = (D && Number.isFinite(D.REP_BANDIT_ROBBERY)) ? (D.REP_BANDIT_ROBBERY | 0) : 3;
            const repFloor = (D && Number.isFinite(D.REP_FLOOR)) ? (D.REP_FLOOR | 0) : 1;
            const currentRep = (Game.State && Number.isFinite(Game.State.rep)) ? (Game.State.rep | 0) : 0;
            const actualLoss = Math.min(repLoss, Math.max(0, currentRep - repFloor));
            if (actualLoss > 0) {
              Game.StateAPI.transferRep("me", "crowd_pool", actualLoss, "rep_bandit_robbery", b.id || b.battleId || null);
            }
          }
        } catch (_) {}
        
        const line = (Game.Data && Game.Data.SYS && Game.Data.SYS.banditRobbed)
          ? Game.Data.SYS.banditRobbed
          : `Бандит забрал у тебя ${stolen} 💰. Все видели.`;
        if (stolen > 0) pushSystem(line);
      }

      try {
        if (Game.StateAPI && typeof Game.StateAPI.ensureNonNegativePoints === "function") {
          Game.StateAPI.ensureNonNegativePoints();
        }
        if (Game.StateAPI && typeof Game.StateAPI.syncMeToPlayers === "function") {
          Game.StateAPI.syncMeToPlayers();
        }
      } catch (_) {}
    } catch (_) {}
  }

  function notifyCopViolation(opponentId, penalty){
    try {
      const name = getName(opponentId) || "Коп";
      const pen = (penalty|0) || 5;
      const dmTextRaw = `Вы попытались забатлить ${name}. Это нарушение порядка. Штраф -${pen} 💰.`;
      const chatTextRaw = `Нарушение порядка. За попытку вброса списан штраф -${pen} 💰.`;

      const N = (Game && Game.NPC) ? Game.NPC : null;
      const dmText = (N && typeof N.normalizeCopLine === "function") ? N.normalizeCopLine(dmTextRaw) : dmTextRaw;
      const chatText = (N && typeof N.normalizeCopLine === "function") ? N.normalizeCopLine(chatTextRaw) : chatTextRaw;

      // DM first (if supported)
      const UI = (Game && Game.UI) ? Game.UI : null;
      if (UI) {
        if (typeof UI.pushDM === "function") {
          UI.pushDM({ fromId: opponentId, toId: "me", name, text: dmText, system: false });
        } else if (typeof UI.pushWhisper === "function") {
          UI.pushWhisper({ fromId: opponentId, toId: "me", name, text: dmText });
        } else if (typeof UI.pushPrivate === "function") {
          UI.pushPrivate({ fromId: opponentId, toId: "me", name, text: dmText });
        } else if (typeof UI.pushChat === "function") {
          // Fallback: mark as DM-like in chat if no DM channel exists
          UI.pushChat({ name, text: dmText, system: false, speakerId: opponentId, dm: true });
        }

        // Public chat notice
        if (typeof UI.pushChat === "function") {
          UI.pushChat({ name, text: chatText, system: false, speakerId: opponentId });
        }
      }
    } catch (_) {}
  }

  // Toxic instant hit: if Toxic attacked and you answered quickly, apply immediate point damage.
  // This must not affect non-toxic battles and must apply at most once per battle.
  // Timing source: prefer b.firstSeenAt (set by UI), then b.presentedAt, then createdAt.
  function maybeApplyToxicInstantHit(b){
    try {
      if (!b || !b.fromThem) return;
      if (b.toxicHitApplied) return;
      const role = getRole(b.opponentId);
      if (role !== "toxic") return;

      const base =
        (typeof b.firstSeenAt === "number" && b.firstSeenAt > 0) ? b.firstSeenAt :
        (typeof b.presentedAt === "number" && b.presentedAt > 0) ? b.presentedAt :
        (typeof b.createdAt === "number" && b.createdAt > 0) ? b.createdAt :
        0;

      const dt = base ? (now() - base) : 999999;

      // "answered immediately" threshold (ms)
      const TH = 2500;
      if (dt > TH) return;

      const me = Game.State && Game.State.me;
      if (!me) return;
      if (isCirculationEnabled()) {
        const oppId = b.opponentId || "sink";
        econTransfer("me", oppId, 1, "toxicHit", { battleId: b.id || b.battleId || null });
      } else {
        const beforePts = (me.points || 0) | 0;
        const afterPts = clamp0(beforePts - 1);
        me.points = afterPts;
        try {
          if (Game && Game.StateAPI && typeof Game.StateAPI.emitStatDelta === "function") {
            Game.StateAPI.emitStatDelta("points", (afterPts - beforePts) | 0, { reason: "toxicHit", battleId: b.id || b.battleId || null });
          }
        } catch (_) {}
      }

      b.toxicHitApplied = true;
      b.toxicHitMs = dt;
    } catch (_) {}
  }

  // Bandit robbery: if Bandit attacked and you answered (not escaped),
  // wipe all player points. Apply at most once per battle.
  // NOTE: per rules, DO NOT wipe on draw. Call only on definitive lose.
  function maybeApplyBanditRobbery(b){
    try {
      if (!b || !b.fromThem) return;
      if (b.banditRobbed) return;
      const role = getRole(b.opponentId);
      if (role !== "bandit") return;

      const me = Game.State && Game.State.me;
      if (!me) return;

      if (isCirculationEnabled()) {
        const before = me.points | 0;
        const oppId = b.opponentId || "sink";
        econTransfer("me", oppId, before, "bandit_robbery", { battleId: b.id || b.battleId || null });
      } else {
        const beforePts = (me.points || 0) | 0;
        me.points = 0;
        try {
          if (Game && Game.StateAPI && typeof Game.StateAPI.emitStatDelta === "function") {
            Game.StateAPI.emitStatDelta("points", (0 - beforePts) | 0, { reason: "bandit_robbery", battleId: b.id || b.battleId || null });
          }
        } catch (_) {}
      }
      b.banditRobbed = true;
    } catch (_) {}
  }

  // Mafioso humiliation: if Mafioso attacked and player made ANY action except escape,
  // wipe ALL player influence. Apply once per battle.
  function maybeApplyMafiaHumiliation(b){
    try {
      if (!b) return;
      if (b.mafiaHumiliated) return;
      const role = getRole(b.opponentId);
      if (role !== "mafia") return;

      const me = Game.State && Game.State.me;
      if (!me) return;

      {
        const beforeInf = (me.influence || 0) | 0;
        me.influence = 0;
        try {
          if (Game && Game.StateAPI && typeof Game.StateAPI.emitStatDelta === "function") {
            Game.StateAPI.emitStatDelta("influence", (0 - beforeInf) | 0, { reason: "mafia_humiliation", battleId: b.id || b.battleId || null });
          }
        } catch (_) {}
      }
      if (isCirculationEnabled()) {
        const before = me.points | 0;
        econTransfer("me", "sink", before, "mafia_humiliation", { battleId: b.id || b.battleId || null });
      } else {
        const beforePts = (me.points || 0) | 0;
        me.points = 0;
        try {
          if (Game && Game.StateAPI && typeof Game.StateAPI.emitStatDelta === "function") {
            Game.StateAPI.emitStatDelta("points", (0 - beforePts) | 0, { reason: "mafia_humiliation", battleId: b.id || b.battleId || null });
          }
        } catch (_) {}
      }
      // IMPORTANT: do not modify Game.State.rep directly — always use transferRep to log REP moves.
      try {
        const cur = (Game && Game.State && Number.isFinite(Game.State.rep)) ? (Game.State.rep | 0) : 0;
        if (cur > 0 && Game.StateAPI && typeof Game.StateAPI.transferRep === "function") {
          Game.StateAPI.transferRep("me", "crowd_pool", cur, "rep_mafia_humiliation_reset", b.id || b.battleId || null);
        }
      } catch (_) {}
      {
        const beforeWins = (me.wins || 0) | 0;
        me.wins = 0;
        try {
          if (Game && Game.StateAPI && typeof Game.StateAPI.emitStatDelta === "function") {
            Game.StateAPI.emitStatDelta("wins", (0 - beforeWins) | 0, { reason: "mafia_humiliation", battleId: b.id || b.battleId || null });
          }
        } catch (_) {}
      }
      if (typeof me.winsSinceInfluence === "number") me.winsSinceInfluence = 0;
      if (Game.State.progress) {
        Game.State.progress.weeklyInfluenceGained = 0;
        Game.State.progress.weekStartAt = Date.now();
      }
      me.unlockOrange = false;
      me.unlockRed = false;
      me.unlockBlack = false;
      b.mafiaHumiliated = true;
      try {
        if (Game.StateAPI && typeof Game.StateAPI.syncMeToPlayers === "function") {
          Game.StateAPI.syncMeToPlayers();
        }
      } catch (_) {}
    } catch (_) {}
  }

  // Ensure incoming attack always has:
  // - attack.text
  // - attack.type: yn|who|where
  // - NO public color field before choice (store as _color)
  function sanitizeAttack(raw, fallbackType){
    const ft = normalizeGroup(fallbackType || "yesno");
    if (!raw) {
      // Canon-only: do not inject non-canon fallback strings.
      // Try to fall back to a canonical template; if unavailable, return null.
      try {
        const D = Game.Data || null;
        const typeU = String(ft || "yn").toUpperCase();
        const list = (D && typeof D.getArgCanonGroup === "function") ? D.getArgCanonGroup("Y1", typeU) : [];
        const item = (Array.isArray(list) && list.length) ? (list[0] || null) : null;
        if (item && item.q) {
          return {
            id: "canon_Y1_" + String(ft || "yn") + "_" + Math.random().toString(36).slice(2, 6),
            type: ft,
            group: ft,
            text: String(item.q),
            _canonQ: String(item.q),
            _sub: "Y1",
            _color: "y"
          };
        }
      } catch (_) {}
      return null;
    }

    const text = String(raw.text || raw.t || raw.line || raw.value || raw.msg || "").trim();
    const type = normalizeGroup(raw.type || raw.group || raw.g || raw.kindGroup || ft);
    const id = String(raw.id || raw.key || raw.tag || ("atk_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 6)));
    // IMPORTANT: some producers (conflict-arguments.js) store hidden power in `_color`.
    // If we ignore it, incoming NPC attacks silently downgrade to yellow.
    const color = normalizeColor(raw._color || raw.color || raw.c || raw.power || "y");

    return {
      id,
      type,
      text: text || "ты тут?",
      _color: color
    };
  }

  function escapeCostForBattle(b){
    // Default escape costs 1. Special roles cost more.
    // Source of truth: Game.Data.ESCAPE_COST
    const role = getRole(b && b.opponentId);
    const D = (Game && Game.Data) ? Game.Data : null;
    const map = D && D.ESCAPE_COST ? D.ESCAPE_COST : null;

    if (map && role && Object.prototype.hasOwnProperty.call(map, role)) {
      const v = map[role];
      const n = (typeof v === "number") ? v : parseInt(v, 10);
      return (Number.isFinite(n) && n > 0) ? (n|0) : 1;
    }

    // Safe fallback if data is missing.
    return 1;
  }

  // Core outcome rules for battles.
  // Returns one of: "win" | "lose" | "draw" (relative to ME).
  // IMPORTANT (agreed rules):
  // - Same color: correct type => defender wins (guaranteed); wrong type => draw (crowd decides; attacker can still win).
  // - Adjacent colors (y-o, o-r): if attacker is stronger and defender answers correct type => draw; otherwise stronger wins.
  // - Two-step gap (y-r): red wins always (no draw).
  // - Black is unbeatable vs non-black: black side wins automatically. Black-black follows same rules as other colors.
  // - Toxic/Bandit: wrong type => loss; correct type => draw (caller may apply role-specific punishments).
  // - Mafia: outcome is handled in finalize (fatal influence wipe on any action except escape when mafia attacked).
  C.computeOutcome = function(battle, attackArg, defenseArg){
    const b0 = battle || {};
    // Persist arguments on the REAL battle in state (callers may pass a copy).
    const b = (b0 && b0.id && Game && Game.State && Array.isArray(Game.State.battles))
      ? (Game.State.battles.find(x => x && x.id === b0.id) || b0)
      : b0;

    try {
      if (attackArg && !b.attack) b.attack = attackArg;
      if (defenseArg && !b.defense) b.defense = defenseArg;
    } catch (_) {}

    const { attackerId, defenderId } = attackerDefenderIds(b);
    const oppRole = getRole(b.opponentId);

    const aColor = argColor(attackArg);
    const dColor = argColor(defenseArg);
    const aS = colorToStrength(aColor);
    const dS = colorToStrength(dColor);

    const correct = isCorrectType(attackArg, defenseArg);
    
    // Task D: dev-log для проверки типов
    try {
      if (Game.Debug && Game.Debug.LOG_TYPE_CHECK) {
        const attackType = argGroup(attackArg);
        const defenseType = argGroup(defenseArg);
        console.log(`[TYPE_CHECK] attack=${attackType} defense=${defenseType} correct=${correct} reason=${correct ? "type_match" : "type_mismatch"}`);
      }
    } catch (_) {}

    // Black logic
    if (aColor === "k" || dColor === "k") {
      if (aColor === "k" && dColor === "k") {
        // black-black: follow normal rules below
      } else {
        // black vs non-black: black wins automatically
        const attackerWins = (aColor === "k");
        const meWins = (attackerId === "me") ? attackerWins : !attackerWins;
        return meWins ? "win" : "lose";
      }
    }

    // Two-step gap: red beats yellow always
    if ((aS === 3 && dS === 1) || (aS === 1 && dS === 3)) {
      const attackerWins = aS > dS;
      const meWins = (attackerId === "me") ? attackerWins : !attackerWins;
      return meWins ? "win" : "lose";
    }

    // Special roles: Toxic/Bandit (meaningful when THEY attacked and ME defended)
    // Always a loss (no crowd) if they attacked.
    if (b.fromThem && defenderId === "me" && (oppRole === "toxic" || oppRole === "bandit")) {
      return "lose";
    }

    // Same color
    if (aS === dS) {
      if (correct) {
        // Correct type guarantees victory (only for same color)
        const meWins = (defenderId === "me");
        return meWins ? "win" : "lose";
      }
      // Wrong type => draw (crowd vote)
      return "draw";
    }

    // Adjacent colors (y-o, o-r): allow draw if
    // - stronger is attacker and weaker defended correctly
    // - stronger is defender but answered wrong (bad strong defense -> draw)
    const diff = Math.abs(aS - dS);
    if (diff === 1) {
      const attackerIsStronger = aS > dS;
      const defenderIsStronger = dS > aS;
      if (attackerIsStronger && correct) {
        // Weaker correct defense earns a draw chance via crowd
        return "draw";
      }
      if (defenderIsStronger && !correct) {
        // Wrong strong defense should not auto-win in adjacent colors
        return "draw";
      }
      // Otherwise stronger wins
      const attackerWins = aS > dS;
      const meWins = (attackerId === "me") ? attackerWins : !attackerWins;
      return meWins ? "win" : "lose";
    }

    // Any other gap - stronger wins
    const attackerWins = aS > dS;
    const meWins = (attackerId === "me") ? attackerWins : !attackerWins;
    return meWins ? "win" : "lose";
  };

  // Pick an incoming attack argument for an opponent (kept hidden in UI until player answers)
  function pickIncomingAttack(opponentId){
    const opp = getPlayer(opponentId);
    const inf = opp ? (opp.influence || 0) : 0;

    // Prefer NPC picker if available (influence-based, uses current data)
    if (Game.NPC && typeof Game.NPC.pickAttackByInfluence === "function") {
      try {
        const a = Game.NPC.pickAttackByInfluence(inf, opp && opp.role);
        // Canon-only: accept NPC pick only if it already looks canonical.
        if (a && (String(a.id || "").startsWith("canon_") || a._canonQ)) return sanitizeAttack(a);
      } catch (e) {
        warnOnce("npc_pick_attack_error", "[ConflictCore] NPC.pickAttackByInfluence failed", e);
      }
    }

    // Prefer a dedicated picker if the arguments module exposes one.
    const A = Game.ConflictArguments || Game._ConflictArguments || null;
    if (A && typeof A.pickIncomingAttack === "function") {
      const a = A.pickIncomingAttack(opponentId);
      if (a) return sanitizeAttack(a);
    }
    // Canon-only: no base/data fallbacks.
    return null;
  }

  // Economy + progress: SINGLE source of truth is Web/conflict/conflict-economy.js (Game._ConflictEconomy).
  // conflict-core.js must not mutate points/wins/influence directly to avoid double-charges and inconsistent unlock logic.
  function applyEconomyForOutcome(outcome, battle){
    try {
      const Econ = (Game && Game._ConflictEconomy) ? Game._ConflictEconomy : null;
      if (!Econ || typeof Econ.applyResult !== "function") return;

      const b = battle || {};
      const role = getRole(b.opponentId);

      // Mafia battles: humiliation wipes influence, but base win/lose economy should NOT auto-apply here.
      // (Keep economy clean and predictable.)
      if (role === "mafia") return;

      // Build a minimal battle-like object expected by economy:
      const battleLike = {
        result: String(outcome || ""),
        opponentId: b.opponentId || null,
        fromThem: !!b.fromThem,
        economyApplied: false,
        id: b.id || b.battleId || null,
        status: b.status || null,
      };

      Econ.applyResult(battleLike);
    } catch (_) {}
  }

  function getBattleCrowdPoolId(b){
    const Econ = getEcon();
    const bid = b && (b.id || b.battleId || null);
    if (Econ && typeof Econ.getCrowdPoolId === "function") return Econ.getCrowdPoolId(bid);
    return bid ? `crowd:${bid}` : "crowd";
  }

  function applyBattleCrowdEconomy(b, res, crowdOverride){
    const crowd = crowdOverride || (b ? b.crowd : null);
    if (!b || !crowd || !res) return;
    if (crowd._econApplied) return;
    crowd._econApplied = true;
    if (!isCirculationEnabled()) return;

    const Econ = getEcon();
    if (!Econ || typeof Econ.transferPoints !== "function") return;

    const battleId = b.id || b.battleId || (crowd && (crowd.battleId || crowd.eventId)) || null;
    if (battleId && crowd && !crowd.battleId) crowd.battleId = battleId;
    const voters = (crowd.voters && typeof crowd.voters === "object")
      ? Object.keys(crowd.voters)
      : [];
    const poolId = getBattleCrowdPoolId(b);
    if (Econ.ensurePool) Econ.ensurePool(poolId);

    if (!crowd._poolInit && voters.length) {
      econTransfer("sink", poolId, voters.length, "crowd_vote_pool_init", { battleId });
      crowd._poolInit = true;
    }

    const refundAll = (res.outcome === "TIE");
    const winnerSide = (res.outcome === "A_WIN") ? "a" : (res.outcome === "B_WIN" ? "b" : null);
    const winnerAlt = (winnerSide === "a") ? "attacker" : (winnerSide === "b" ? "defender" : null);
    const refundReason = refundAll ? "crowd_vote_refund" : "crowd_vote_refund_majority";
    const transferFromPool = (Econ && typeof Econ.transferFromPool === "function") ? Econ.transferFromPool : null;

    voters.forEach(id => {
      if (!refundAll) {
        const side = crowd.voters ? crowd.voters[id] : null;
        if (side !== winnerSide && side !== winnerAlt) return;
      }
      if (transferFromPool) transferFromPool(poolId, id, 1, refundReason, { battleId });
      else econTransfer(poolId, id, 1, refundReason, { battleId });
    });

    try {
      const ids = attackerDefenderIds(b);
      const attackerId = ids.attackerId || null;
      const defenderId = ids.defenderId || null;
      const attackerWins = (res && res.outcome === "A_WIN");
      const defenderWins = (res && res.outcome === "B_WIN");
      const isEscapeVote = !!(crowd && crowd.mode != null);
      if (Econ && typeof Econ.getPoolBalance === "function") {
        const remainder = Econ.getPoolBalance(poolId) | 0;
          const splitRemainder = (extraToAttacker) => {
            if (!attackerId && !defenderId) return;
            if (!attackerId || !defenderId) {
              const onlyId = attackerId || defenderId;
              if (onlyId) {
                const onlyReason = (onlyId === attackerId) ? "crowd_vote_remainder_split_attacker" : "crowd_vote_remainder_split_defender";
                if (transferFromPool) transferFromPool(poolId, onlyId, remainder, onlyReason, { battleId });
                else econTransfer(poolId, onlyId, remainder, onlyReason, { battleId });
              }
              return;
            }
            const hi = Math.ceil(remainder / 2);
            const lo = remainder - hi;
            const firstId = extraToAttacker ? attackerId : defenderId;
            const secondId = extraToAttacker ? defenderId : attackerId;
            const firstReason = extraToAttacker ? "crowd_vote_remainder_split_attacker" : "crowd_vote_remainder_split_defender";
            const secondReason = extraToAttacker ? "crowd_vote_remainder_split_defender" : "crowd_vote_remainder_split_attacker";
            if (hi > 0) {
              if (transferFromPool) transferFromPool(poolId, firstId, hi, firstReason, { battleId });
              else econTransfer(poolId, firstId, hi, firstReason, { battleId });
            }
            if (lo > 0) {
              if (transferFromPool) transferFromPool(poolId, secondId, lo, secondReason, { battleId });
              else econTransfer(poolId, secondId, lo, secondReason, { battleId });
            }
          };
        if (remainder > 0) {
          if (!isEscapeVote && attackerWins) {
            if (attackerId) {
              if (transferFromPool) transferFromPool(poolId, attackerId, remainder, "crowd_vote_remainder_win", { battleId });
              else econTransfer(poolId, attackerId, remainder, "crowd_vote_remainder_win", { battleId });
            }
          } else if (isEscapeVote || defenderWins) {
            splitRemainder(attackerWins);
          } else {
            splitRemainder(attackerWins);
          }
        }
        if (!isEscapeVote && attackerId && defenderId && (attackerWins || defenderWins)) {
          const winnerId = attackerWins ? attackerId : defenderId;
          const loserId = attackerWins ? defenderId : attackerId;
          econTransfer(loserId, winnerId, 2, "crowd_vote_loser_penalty", { battleId });
        }
      }
    } catch (_) {}
  }

  function withRepSourceOverride(fn){
    try {
      const API = (Game && Game.StateAPI) ? Game.StateAPI : null;
      if (!API || typeof API.transferRep !== "function") return fn();
      const orig = API.transferRep;
      API.transferRep = function(fromId, toId, amount, reason, battleId){
        const src = (String(fromId || "") === "crowd_pool") ? "rep_emitter" : fromId;
        return orig.call(this, src, toId, amount, reason, battleId);
      };
      try { return fn(); }
      finally { API.transferRep = orig; }
    } catch (_) {
      return fn();
    }
  }

  function logCrowdCapDebugRaw(meta){
    if (!meta) return;
    const dbg = Game.Debug || (Game.Debug = {});
    const log = Array.isArray(dbg.moneyLog) ? dbg.moneyLog : (dbg.moneyLog = []);
    log.push({
      ts: now(),
      reason: "crowd_cap_debug",
      battleId: meta.battleId,
      kind: "debug",
      meta
    });
    const cache = ensureCrowdCapMetaCache();
    if (meta && meta.battleId) {
      cache[String(meta.battleId)] = meta;
    }
    dbg.lastCrowdCapMeta = meta;
  }

  // Safety: ensure the state shape exists before we touch it.
  Game.State = Game.State || {};
  Game.State.me = Game.State.me || { points: 0, influence: 0, wins: 0 };
  Game.State.battles = Game.State.battles || [];
  Game.State.players = Game.State.players || {};

  function createBattle({ opponentId, fromThem }) {
    return {
      id: (function(){
        const U = (typeof Util !== "undefined" && Util) || (Game && Game.Util) || null;
        if (U && typeof U.uid === "function") return U.uid("battle");
        return "battle_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
      })(),
      opponentId,
      fromThem,
      status: fromThem ? "pickDefense" : "pickAttack",
      attack: null, // must become { id, type: yn|who|where, text, _color }
      attackHidden: true,
      draw: false,
      crowd: null,
      pinned: false,
      defense: null,
      result: null,
      resolved: false,
      finished: false,
      createdAt: now(),
      updatedAt: now()
    };
  }

  function isBattleInDraw(b){
    return !!(b && b.draw && b.crowd && !b.crowd.decided);
  }

  function useWeightedTally(){
    const dbg = Game && Game.Debug ? Game.Debug : null;
    const D = Game && Game.Data ? Game.Data : null;
    if (dbg && dbg.CROWD_WEIGHTED_TALLY === true) return true;
    if (D && D.CROWD_WEIGHTED_TALLY === true) return true;
    return false;
  }

  function getVoteWeight(voterId){
    try {
      const D = Game && Game.Data ? Game.Data : null;
      const p = (voterId === "me" && Game && Game.State && Game.State.me)
        ? Game.State.me
        : getPlayer(voterId);
      const inf = (p && Number.isFinite(p.influence)) ? (p.influence | 0) : 0;
      const role = p ? String(p.role || p.type || "") : "";
      let tierKey = "y1";
      if (D && typeof D.tierKeyByInfluence === "function") {
        tierKey = D.tierKeyByInfluence(inf, role);
      } else if (D && typeof D.tierKeysByInfluence === "function") {
        const keys = D.tierKeysByInfluence(inf) || [];
        tierKey = String(keys[0] || "y1");
      }
      const color = (D && typeof D.colorFromTierKey === "function") ? D.colorFromTierKey(tierKey) : "y";
      const c = String(color || "y").toLowerCase();
      const roleLower = String(role || "").toLowerCase();
      const isMafiaRole = roleLower === "mafia";
      const isMafiaId = String(voterId || "") === "npc_mafia";
      if (c === "k" && isMafiaRole && isMafiaId) return 3;
      if (c === "r") return 2;
      return 1;
    } catch (_) {
      return 1;
    }
  }

  function getWeightedVotesFromCrowd(crowd){
    if (!crowd || !crowd.voters || typeof crowd.voters !== "object") return null;
    let a = 0;
    let b = 0;
    for (const vid of Object.keys(crowd.voters)) {
      const side = crowd.voters[vid];
      const w = getVoteWeight(vid);
      if (side === "a" || side === "attacker") a += w;
      else if (side === "b" || side === "defender") b += w;
    }
    return { a, b };
  }

  function resolveCrowdCore(crowd, ctx, participants){
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
    let aCount = 0;
    let bCount = 0;
    const weighted = useWeightedTally() ? getWeightedVotesFromCrowd(crowd) : null;
    if (weighted) {
      aCount = weighted.a | 0;
      bCount = weighted.b | 0;
    } else {
      aCount = Number.isFinite(crowd.aVotes) ? (crowd.aVotes | 0)
        : (Number.isFinite(crowd.votesA) ? (crowd.votesA | 0) : 0);
      bCount = Number.isFinite(crowd.bVotes) ? (crowd.bVotes | 0)
        : (Number.isFinite(crowd.votesB) ? (crowd.votesB | 0) : 0);
    }
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

  function ensureBattleCrowdCap(v){
    if (!v) return;
    if (!Number.isFinite(v.cap) || v.cap <= 0) {
      const total = getTotalPlayersCount();
      v.cap = getCrowdVoteCap(total);
      v.totalPlayers = total;
    }
  }

  function getCrowdTotalVotes(v){
    if (!v) return 0;
    if (v.voters && typeof v.voters === "object" && Object.keys(v.voters).length > 0) {
      return Object.keys(v.voters).length;
    }
    const a = Number.isFinite(v.votesA) ? (v.votesA | 0) : (Number.isFinite(v.aVotes) ? (v.aVotes | 0) : 0);
    const b = Number.isFinite(v.votesB) ? (v.votesB | 0) : (Number.isFinite(v.bVotes) ? (v.bVotes | 0) : 0);
    return (a + b) | 0;
  }

  function createCrowdCapMeta(b, endedBy){
    if (!b || !b.crowd) return null;
    const v = b.crowd;
    const totalPlayers = Number.isFinite(v.totalPlayers) ? (v.totalPlayers | 0) : getTotalPlayersCount();
    const cap = Number.isFinite(v.cap) ? (v.cap | 0) : 0;
    const totalVotes = getCrowdTotalVotes(v);
    let aVotes = 0;
    let bVotes = 0;
    const weighted = useWeightedTally() ? getWeightedVotesFromCrowd(v) : null;
    if (weighted) {
      aVotes = weighted.a | 0;
      bVotes = weighted.b | 0;
    } else {
      aVotes = Number.isFinite(v.aVotes) ? (v.aVotes | 0) : (Number.isFinite(v.votesA) ? (v.votesA | 0) : 0);
      bVotes = Number.isFinite(v.bVotes) ? (v.bVotes | 0) : (Number.isFinite(v.votesB) ? (v.votesB | 0) : 0);
    }
    return {
      battleId: b.id || b.battleId || null,
      totalPlayers,
      cap,
      totalVotes,
      aVotes,
      bVotes,
      endedBy
    };
  }

  function getOutcomeFromCapMeta(meta){
    if (!meta) return null;
    const a = Number.isFinite(meta.aVotes) ? (meta.aVotes | 0) : 0;
    const b = Number.isFinite(meta.bVotes) ? (meta.bVotes | 0) : 0;
    if (a === b) return "TIE";
    return (a > b) ? "A_WIN" : "B_WIN";
  }

  function ensureCrowdCapMetaCache(){
    const dbg = Game.Debug || (Game.Debug = {});
    if (!dbg.crowdCapMetaByBattle) dbg.crowdCapMetaByBattle = Object.create(null);
    return dbg.crowdCapMetaByBattle;
  }

  function logCrowdCapDebug(b, meta){
    if (!b || !b.crowd) return;
    if (!meta) return;
    const dbg = Game.Debug || (Game.Debug = {});
    const log = Array.isArray(dbg.moneyLog) ? dbg.moneyLog : (dbg.moneyLog = []);
    log.push({
      ts: now(),
      reason: "crowd_cap_debug",
      battleId: meta.battleId,
      kind: "debug",
      meta
    });
    const cache = ensureCrowdCapMetaCache();
    if (meta && meta.battleId) {
      cache[String(meta.battleId)] = meta;
    }
  }

  function applyCrowdVoteTick(b, battleIdFallback){
    const cache = ensureCrowdCapMetaCache();
    const battleId = (b && (b.id || b.battleId)) || battleIdFallback || null;
    const cacheKey = battleId ? String(battleId) : null;
    let pendingMeta = null;
    if (b && b.crowd && b.crowd.noTimerResolution) {
      const res = finalizeCrowdVote(b, { force: true, fiftyFifty: true });
      const meta = res ? res.crowdCapMeta : null;
      if (!meta) {
        return {
          ok: false,
          battleId,
          crowdCapMeta: null,
          pendingMeta: null,
          cacheHit: false,
          why: "fifty_missing_meta"
        };
      }
      return {
        ok: true,
        battleId,
        outcome: (res && res.outcome) ? res.outcome : null,
        crowdCapMeta: meta,
        pendingMeta: null,
        cacheHit: true,
        why: null
      };
    }
    if (b && b.crowd) {
      pendingMeta = createCrowdCapMeta(b, "pending");
    }
    if (!isBattleInDraw(b)) {
      const cachedMeta = cacheKey ? cache[cacheKey] || null : null;
      return {
        ok: false,
        battleId,
        crowdCapMeta: cachedMeta,
        pendingMeta,
        cacheHit: !!cachedMeta,
        why: cachedMeta ? null : "battle_not_draw"
      };
    }
    if (b && b.crowd && b.crowd.noTimerResolution) {
      const res = finalizeCrowdVote(b, { force: true, fiftyFifty: true });
      const meta = res ? res.crowdCapMeta : null;
      if (meta && cacheKey) cache[cacheKey] = meta;
      return {
        ok: !!(res && res.outcome),
        battleId,
        outcome: (res && res.outcome) ? res.outcome : null,
        crowdCapMeta: meta,
        pendingMeta,
        cacheHit: !!(meta && cacheKey && cache[cacheKey]),
        why: meta ? null : "finalize_missing_meta"
      };
    }
    if (b && b.crowd) {
      ensureBattleCrowdCap(b.crowd);
      const totalVotes = getCrowdTotalVotes(b.crowd);
      if (Number.isFinite(b.crowd.cap) && totalVotes >= b.crowd.cap) {
        const res = finalizeCrowdVote(b, { force: true });
        const meta = res ? res.crowdCapMeta : null;
        if (meta && cacheKey) cache[cacheKey] = meta;
        return {
          ok: !!(res && res.outcome),
          battleId,
          outcome: (res && res.outcome) ? res.outcome : null,
          crowdCapMeta: meta,
          pendingMeta,
          cacheHit: !!(meta && cacheKey && cache[cacheKey]),
          why: meta ? null : "finalize_missing_meta"
        };
      }
    }
    if (b) b.updatedAt = now();
    const cachedMeta = cacheKey ? cache[cacheKey] || null : null;
    return {
      ok: false,
      battleId,
      crowdCapMeta: cachedMeta,
      pendingMeta,
      cacheHit: !!cachedMeta,
      why: pendingMeta ? null : "cap_not_reached"
    };
  }

  function finalizeCrowdVote(b, opts){
    if (!isBattleInDraw(b)) return null;
    const v = b.crowd;
    const force = !!(opts && opts.force);
    if (!v) return null;
    ensureBattleCrowdCap(v);
    if (!force) {
      const totalVotes = getCrowdTotalVotes(v);
      if (!Number.isFinite(v.cap) || totalVotes < (v.cap | 0)) return null;
    }
    const participants = (Game && Game.State && Game.State.players) ? Object.values(Game.State.players) : [];
    const relate = { kind: "battle", battleId: b.id || b.battleId || null, aId: v.attackerId, bId: v.defenderId };
    const res = resolveCrowdCore(v, relate, participants);
    const totalVotes = getCrowdTotalVotes(v);
    let endedBy = "cap";
    if (force) endedBy = "cap";
    const fiftyFifty = !!(opts && opts.fiftyFifty);
    if (fiftyFifty) {
      endedBy = "fifty_fifty_no_timer";
      const outcome = (Math.random() < 0.5) ? "A_WIN" : "B_WIN";
      res.outcome = outcome;
      res.decided = true;
    }
    const crowdCapMeta = createCrowdCapMeta(b, endedBy);
    if (crowdCapMeta) {
      v.crowdCapDebug = crowdCapMeta;
      logCrowdCapDebug(b, crowdCapMeta);
      const dbg = Game.Debug || (Game.Debug = {});
      dbg.lastCrowdCapMeta = crowdCapMeta;
    }
    const votesA = (res && res.sideStats && res.sideStats.a) ? (res.sideStats.a.count | 0) : (v.votesA | 0);
    const votesB = (res && res.sideStats && res.sideStats.b) ? (res.sideStats.b.count | 0) : (v.votesB | 0);
    v.votesA = votesA;
    v.votesB = votesB;
    v.aVotes = votesA;
    v.bVotes = votesB;
    if (res && res.outcome === "TIE") {
      // Restart the crowd vote on exact tie.
      v.endAt = now() + DRAW_VOTE_DURATION_MS;
      v.endsAt = v.endAt;
      v.votesA = 0;
      v.votesB = 0;
      v.aVotes = 0;
      v.bVotes = 0;
      v.voters = {};
      v.decided = false;
      v.winnerSide = null;
      v.winnerId = null;
      ensureBattleCrowdCap(v);
      b.result = "draw";
      b.resultLine = "Толпа решает";
      b.note = "Поровну, без перевеса. Ещё круг.";
      b.updatedAt = now();
      return { outcome: "TIE", crowdCapMeta };
    }

    v.decided = true;
    // Mirror vote counters for UIs that read a grouped structure.
    v.votes = { attacker: votesA, defender: votesB };

    const attackerWins = res && res.outcome === "A_WIN";
    const defenderWins = res && res.outcome === "B_WIN";

    const { attackerId, defenderId } = attackerDefenderIds(b);
    const iAmAttacker = attackerId === "me";
    const iAmDefender = defenderId === "me";

    const oppRole = getRole(b.opponentId);
    const isVillain = (oppRole === "toxic" || oppRole === "bandit");

    b.attackHidden = false;
    b.finished = true;
    b.status = "finished";

    if (isVillain) {
      // No standard economy on villain draws. Only apply robbery if villain wins.
      const iLose = (iAmAttacker && defenderWins) || (iAmDefender && attackerWins);
      const role = oppRole;
      b.result = iLose ? "lose" : "win";
      b.note = attackerWins ? "Толпа решила: атакующий затащил." : "Толпа решила: защитник отбился.";
      if (iLose) {
        if (role === "bandit") {
          b.resultLine = (Game.Data && Game.Data.SYS && Game.Data.SYS.banditRobbed)
            ? Game.Data.SYS.banditRobbed
            : "Бандит вынес тебя в ноль. Все видели.";
        } else {
          b.resultLine = (Game.Data && Game.Data.SYS && typeof Game.Data.SYS.toxicStealLine === "function")
            ? Game.Data.SYS.toxicStealLine(5)
            : "Токсик снял у тебя 5 💰. Все видели.";
        }
        applyVillainPenalty(b, "crowd");
      } else {
        b.resultLine = "Победа";
        withRepSourceOverride(() => applyEconomyForOutcome(b.result, b));
      }
    } else if (attackerWins) {
      b.result = iAmAttacker ? "win" : (iAmDefender ? "lose" : "win");
      if (iAmAttacker) withRepSourceOverride(() => applyEconomyForOutcome("win", b));
      if (iAmDefender) withRepSourceOverride(() => applyEconomyForOutcome("lose", b));
      b.note = "Толпа решила: атакующий затащил.";
      b.resultLine = (b.result === "win") ? "Победа" : "Поражение";
    } else {
      b.result = iAmDefender ? "win" : (iAmAttacker ? "lose" : "lose");
      if (iAmDefender) withRepSourceOverride(() => applyEconomyForOutcome("win", b));
      if (iAmAttacker) withRepSourceOverride(() => applyEconomyForOutcome("lose", b));
      b.note = "Толпа решила: защитник отбился.";
      b.resultLine = (b.result === "win") ? "Победа" : "Поражение";
    }

    // Persist winner metadata for UI/events.
    v.winnerSide = attackerWins ? "attacker" : "defender";
    v.winnerId = attackerWins ? (v.attackerId || null) : (v.defenderId || null);
    v.finalizedAt = now();

    b.draw = false;
    b.updatedAt = now();
    if (b.tempInfluenceBoost) b.tempInfluenceBoost = 0;
    applyBattleCrowdEconomy(b, res);
    announceBattleResult(b);

    return {
      outcome: (res && res.outcome) ? res.outcome : null,
      crowdCapMeta
    };
  }

  function isEscapeVote(b){
    return !!(b && b.escapeVote && !b.escapeVote.decided);
  }

  function finalizeEscapeVote(b){
    if (!isEscapeVote(b)) return;
    const v = b.escapeVote;
    if (!v) return;
    ensureBattleCrowdCap(v);
    const totalVotesNow = getCrowdTotalVotes(v);
    if (!Number.isFinite(v.cap) || totalVotesNow < (v.cap | 0)) return;
    const participants = (Game && Game.State && Game.State.players) ? Object.values(Game.State.players) : [];
    const relate = { kind: "escape", battleId: b.id || b.battleId || null, aId: v.attackerId, bId: v.defenderId };
    const res = resolveCrowdCore(v, relate, participants);
    const votesA = (res && res.sideStats && res.sideStats.a) ? (res.sideStats.a.count | 0) : (v.votesA | 0);
    const votesB = (res && res.sideStats && res.sideStats.b) ? (res.sideStats.b.count | 0) : (v.votesB | 0);
    v.votesA = votesA;
    v.votesB = votesB;
    v.aVotes = votesA;
    v.bVotes = votesB;
    const totalVotes = getCrowdTotalVotes(v);
    const endedBy = "cap";
    const totalPlayers = Number.isFinite(v.totalPlayers) ? (v.totalPlayers | 0) : getTotalPlayersCount();
    const crowdCapMeta = {
      battleId: b.id || b.battleId || null,
      totalPlayers,
      cap: Number.isFinite(v.cap) ? (v.cap | 0) : 0,
      totalVotes,
      aVotes: votesA,
      bVotes: votesB,
      endedBy
    };
    logCrowdCapDebugRaw(crowdCapMeta);

    const allow = !!(res && res.outcome === "A_WIN");
    v.outcome = (res && res.outcome) ? res.outcome : null;

    v.decided = true;
    v.allowed = allow;
    v.finalizedAt = now();

    // Canon (variant B): escape/dismiss click applies -1 ⭐ once; successful escape refunds +1 ⭐.
    // No additional REP penalties on finalize.
    const REP_ESCAPE_PENALTY_OK = 0;
    const REP_ESCAPE_PENALTY_STAY = 0;
    const INF_ESCAPE_PENALTY_OK = 1;
    const INF_ESCAPE_PENALTY_STAY = 2;

    const applyEscapeEconomyPenalties = (repPenalty, repReason, infPenalty) => {
      try {
        const me = Game.State && Game.State.me ? Game.State.me : null;
        const oppId = b.opponentId || null;

        if (me && Number.isFinite(me.influence)) {
          const before = me.influence | 0;
          const after = Math.max(0, before - (infPenalty | 0));
          me.influence = after;
          try {
            if (Game && Game.StateAPI && typeof Game.StateAPI.emitStatDelta === "function") {
              Game.StateAPI.emitStatDelta("influence", (after - before) | 0, { reason: "inf_escape_vote", battleId: b.id || null });
            }
          } catch (_) {}
        }

        // REP penalties are handled on click only (see C.escape)
      } catch (_) {}
    };

    applyBattleCrowdEconomy(b, res, v);

    if (allow) {
      const mode = (v.mode || "smyt");
      b.result = (mode === "off") ? "ignored" : "escaped";
      b.note = (mode === "off") ? "Толпа решила: отвалил." : "Толпа решила: свалил.";
      b.resultLine = (mode === "off") ? "Отвалил" : "Свалил";
      applyEscapeEconomyPenalties(REP_ESCAPE_PENALTY_OK, "rep_escape_ok_penalty", INF_ESCAPE_PENALTY_OK);
      // Refund +1 ⭐ on success (once)
      try {
        if (!b._repEscapeRefundApplied && Game.StateAPI && typeof Game.StateAPI.transferRep === "function") {
          b._repEscapeRefundApplied = true;
        }
      } catch (_) {}
    } else {
      // Restore previous battle state when escape is denied.
      const prev = b._escapePrev || null;
      if (prev) {
        b.status = prev.status;
        b.result = prev.result;
        b.note = prev.note;
        b.resultLine = prev.resultLine;
        b.finished = prev.finished;
        b.resolved = prev.resolved;
        b.draw = prev.draw;
        b.crowd = prev.crowd;
        b.attackHidden = prev.attackHidden;
        b.opponentThinking = prev.opponentThinking;
      }
      b.inlineNote = (v && v.mode === "off") ? "Не отвалил." : "Не смог свалить.";
      b.escapeVote = null;
      b._escapePrev = null;
      b.updatedAt = now();
      applyEscapeEconomyPenalties(REP_ESCAPE_PENALTY_STAY, "rep_escape_stay_penalty", INF_ESCAPE_PENALTY_STAY);
      return { outcome: v.outcome, crowdCapMeta };
    }

    b.attackHidden = false;
    b.resolved = true;
    b.finished = true;
    b.status = "finished";
    b.draw = false;
    b.crowd = null;
    b._escapePrev = null;
    b.updatedAt = now();

    try {
      if (Game.StateAPI && typeof Game.StateAPI.ensureNonNegativePoints === "function") {
        Game.StateAPI.ensureNonNegativePoints();
      }
      if (Game.StateAPI && typeof Game.StateAPI.syncMeToPlayers === "function") {
        Game.StateAPI.syncMeToPlayers();
      }
    } catch (_) {}

    announceBattleResult(b);
    return { outcome: v.outcome, crowdCapMeta };
  }

  function applyEscapeVoteTick(b){
    if (!isEscapeVote(b)) return { ok: false, reason: "not_escape_vote" };
    const v = b.escapeVote;
    if (!v || v.decided) return { ok: false, reason: "decided" };
    ensureBattleCrowdCap(v);

    try {
      if (Game.NPC && typeof Game.NPC.voteInDraw === "function") {
        const res = Game.NPC.voteInDraw(b);
        const voterId = res && res.voterId ? String(res.voterId) : "";
        const side = res && res.side ? res.side : null;
        if (voterId && side) {
          v.voters ||= {};
          if (!v.voters[voterId]) {
            const Econ = getEcon();
            const battleId = b.id || b.battleId || null;
            const beforePts = (getPlayer(voterId) && Number.isFinite(getPlayer(voterId).points)) ? (getPlayer(voterId).points | 0) : 0;
            const ok = (Econ && typeof Econ.transferPoints === "function")
              ? Econ.transferPoints(voterId, "sink", 1, "crowd_vote_cost", { battleId })
              : { ok: false };
            const afterPts = (getPlayer(voterId) && Number.isFinite(getPlayer(voterId).points)) ? (getPlayer(voterId).points | 0) : 0;
            if (ok && ok.ok && (afterPts === (beforePts - 1))) {
              v.voters[voterId] = (side === "attacker") ? "a" : "b";
              let w = 1;
              if (typeof getVoteWeight === "function") {
                w = getVoteWeight(voterId) | 0;
                if (w <= 0) w = 1;
              } else if (res && Number.isFinite(res.weight)) {
                w = Math.max(1, res.weight | 0);
              }
              if (side === "attacker") v.votesA = (v.votesA|0) + w;
              else if (side === "defender") v.votesB = (v.votesB|0) + w;
            } else if (ok && ok.ok && (afterPts !== (beforePts - 1))) {
              try {
                const dbg = Game && Game.Debug ? Game.Debug : null;
                if (dbg && Array.isArray(dbg.moneyLog)) {
                  for (let i = dbg.moneyLog.length - 1; i >= 0; i--) {
                    const x = dbg.moneyLog[i];
                    if (!x) continue;
                    if (String(x.reason || "") !== "crowd_vote_cost") continue;
                    if (String(x.sourceId || "") !== voterId) continue;
                    if (String(x.battleId || "") !== String(battleId || "")) continue;
                    dbg.moneyLog.splice(i, 1);
                    break;
                  }
                }
                if (dbg && dbg.moneyLogByBattle && Array.isArray(dbg.moneyLogByBattle[battleId])) {
                  const arr = dbg.moneyLogByBattle[battleId];
                  for (let i = arr.length - 1; i >= 0; i--) {
                    const x = arr[i];
                    if (!x) continue;
                    if (String(x.reason || "") !== "crowd_vote_cost") continue;
                    if (String(x.sourceId || "") !== voterId) continue;
                    arr.splice(i, 1);
                    break;
                  }
                }
              } catch (_) {}
            }
          }
        }
      }
    } catch (_) {}

    const totalVotes = getCrowdTotalVotes(v);
    if (Number.isFinite(v.cap) && totalVotes >= (v.cap | 0)) {
      finalizeEscapeVote(b);
      return { ok: true, decided: true, totalVotes };
    }
    try {
      if (Game && Game.NPC && typeof Game.NPC.getVotingPool === "function") {
        const pool = Game.NPC.getVotingPool(b) || [];
        if (pool.length > 0 && totalVotes >= pool.length) {
          v.cap = totalVotes | 0;
          finalizeEscapeVote(b);
          return { ok: true, decided: true, totalVotes };
        }
      }
    } catch (_) {}
    return { ok: true, decided: false, totalVotes };
  }

  function startEscapeVoteTimer(b){
    if (!isEscapeVote(b)) return;
    if (b._escapeTimer) return;

    const tickMs = 700;

    b._escapeTimer = setInterval(() => {
      const cur = Game.State.battles.find(x => x.id === b.id);
      if (!cur || !isEscapeVote(cur)) {
        clearInterval(b._escapeTimer);
        b._escapeTimer = null;
        return;
      }

      const v = cur.escapeVote;
      if (!v) return;

      try { applyEscapeVoteTick(cur); } catch (_) {}

      try {
        ensureBattleCrowdCap(v);
        const totalVotes = getCrowdTotalVotes(v);
        if (Number.isFinite(v.cap) && totalVotes >= v.cap) {
          clearInterval(cur._crowdTimer || b._crowdTimer);
          cur._crowdTimer = null;
          b._crowdTimer = null;
          finalizeEscapeVote(cur);
          return;
        }
        try {
          if (Game && Game.NPC && typeof Game.NPC.getVotingPool === "function") {
            const pool = Game.NPC.getVotingPool(cur) || [];
            if (pool.length > 0 && totalVotes >= pool.length) {
              v.cap = totalVotes | 0;
              finalizeEscapeVote(cur);
              return;
            }
          }
        } catch (_) {}
      } catch (_) {}
    }, tickMs);
  }

  function startEscapeVote(b, mode, cost){
    if (!b || b.resolved) return { ok: false, reason: "already_resolved" };
    if (isEscapeVote(b)) return { ok: true, pending: true };
    const { attackerId, defenderId } = attackerDefenderIds(b);
    b.attackerId = attackerId;
    b.defenderId = defenderId;
    if (!b._escapePrev) {
      b._escapePrev = {
        status: b.status,
        result: b.result,
        note: b.note,
        resultLine: b.resultLine,
        finished: b.finished,
        resolved: b.resolved,
        draw: b.draw,
        crowd: b.crowd,
        attackHidden: b.attackHidden,
        opponentThinking: b.opponentThinking
      };
    }
    const modeNorm = mode || "smyt";
    const costNorm = (cost != null) ? (cost | 0) : escapeCostForBattle(b);
    if (modeNorm !== "off" && costNorm > 0) {
      const me = Game.State && Game.State.me;
      const opp = getPlayer(b.opponentId);
      ensurePointsField(me);
      ensurePointsField(opp);
      if (isCirculationEnabled()) {
        if (me && opp && opp.id) {
          econTransfer("me", opp.id, costNorm, "escape_vote_cost", { battleId: b.id || b.battleId || null });
        }
      } else {
        if (me) {
          const beforePts = (me.points | 0);
          const afterPts = clamp0(beforePts - costNorm);
          me.points = afterPts;
          try {
            if (Game && Game.StateAPI && typeof Game.StateAPI.emitStatDelta === "function") {
              Game.StateAPI.emitStatDelta("points", (afterPts - beforePts) | 0, { reason: "escape_vote_cost", battleId: b.id || b.battleId || null });
            }
          } catch (_) {}
        }
        if (opp) opp.points = clamp0((opp.points|0) + costNorm);
      }
    }
    b.escapeVote = {
      endAt: null,
      endsAt: null,
      votesA: 0,
      votesB: 0,
      voters: {},
      decided: false,
      mode: modeNorm,
      cost: costNorm,
      attackerId,
      defenderId
    };
    b.status = "escape_vote";
    b.result = "escape_vote";
    b.note = (modeNorm === "off") ? "Толпа решает, отвалить ли." : "Толпа решает, свалить ли.";
    b.resultLine = (modeNorm === "off") ? "Отвалить?" : "Свалить?";
    b.updatedAt = now();
    startEscapeVoteTimer(b);
    return { ok: true, pending: true };
  }

  function startCrowdVoteTimer(b){
    if (!isBattleInDraw(b)) return;
    if (b._crowdTimer) return;

    const tickMs = 700;

    b._crowdTimer = setInterval(() => {
      const cur = Game.State.battles.find(x => x.id === b.id);
      if (!cur || !isBattleInDraw(cur)) {
        clearInterval(b._crowdTimer);
        b._crowdTimer = null;
        return;
      }

      const v = cur.crowd;

      // Normalize timer field names and repair invalid timers to avoid "0s forever".
      if (v && typeof v.endsAt !== "number" && typeof v.endAt === "number") v.endsAt = v.endAt;
      if (v && typeof v.endAt !== "number" && typeof v.endsAt === "number") v.endAt = v.endsAt;
      if (!v || typeof v.endAt !== "number" || !Number.isFinite(v.endAt) || v.endAt <= now()) {
        // If UI/other code created an invalid crowd timer, give it a sane default window.
        if (v) {
          v.endAt = now() + DRAW_VOTE_DURATION_MS;
          v.endsAt = v.endAt;
        }
      }

      if (now() >= (v && v.endAt ? v.endAt : 0)) {
        if (v) {
          v.endAt = now() + DRAW_VOTE_DURATION_MS;
          v.endsAt = v.endAt;
        }
      }

      applyCrowdVoteTick(cur);
    }, tickMs);
  }

  C.startWith = function (opponentId) {
    const me = Game.State.me;
    ensurePointsField(me);

    // Canon: points may be 0; only negative is forbidden.
    // Allow starting a battle with 1 point (cost is applied elsewhere).
    if ((me.points|0) <= 0) {
      return { ok: false, reason: "no_points" };
    }
    // NOTE: start cost is applied by conflict-economy.js, not here

    // Cooldown: prevent spamming the same opponent
    try {
      const cdMs = 3 * 60 * 1000;
      const cdMap = Game.State.battleCooldowns || (Game.State.battleCooldowns = {});
      const last = cdMap[opponentId] || 0;
      const nowTs = now();
      if (last && (nowTs - last) < cdMs) {
        const leftMs = cdMs - (nowTs - last);
        const oppName = getName(opponentId) || "Он";
        if (Game.StateAPI && typeof Game.StateAPI.pushDm === "function") {
          Game.StateAPI.pushDm(opponentId, oppName, "дай передохнуть а", { isSystem: false, playerId: opponentId });
        }
        return { ok: false, reason: "cooldown", leftMs };
      }
    } catch (_) {}

    const battle = createBattle({
      opponentId,
      fromThem: false
    });

    battle.pinned = true;
    Game.State.battles.unshift(battle);
    bumpBattleBadgeIfCollapsed();
    try {
      const cdMap = Game.State.battleCooldowns || (Game.State.battleCooldowns = {});
      cdMap[opponentId] = now();
    } catch (_) {}

    // Battle start cost lives in conflict-economy.js (single source of truth)
    try {
      if (Game._ConflictEconomy && typeof Game._ConflictEconomy.applyStart === "function") {
        Game._ConflictEconomy.applyStart(battle);
      }
    } catch (_) {}

    return { ok: true, battle };
  };

  C.incoming = function (opponentId) {
    try {
      if (Game.StateAPI && typeof Game.StateAPI.isNpcJailed === "function") {
        if (Game.StateAPI.isNpcJailed(opponentId)) return null;
      }
    } catch (_) {}
    // NPC with 0 points/balance cannot initiate a battle
    try {
      const opp = getPlayer(opponentId);
      if (opp && (opp.npc === true || opp.type === "npc")) {
        const pts = Number.isFinite(opp.points) ? (opp.points | 0) : 0;
        const bal = Number.isFinite(opp.balance) ? (opp.balance | 0) : null;
        if (pts <= 0 || (bal != null && bal <= 0)) return null;
      }
    } catch (_) {}
    try {
      const cdMs = 3 * 60 * 1000;
      const cdMap = Game.State.battleCooldowns || (Game.State.battleCooldowns = {});
      const last = cdMap[opponentId] || 0;
      const nowTs = now();
      if (last && (nowTs - last) < cdMs) {
        const oppName = getName(opponentId) || "Он";
        if (Game.StateAPI && typeof Game.StateAPI.pushDm === "function") {
          Game.StateAPI.pushDm(opponentId, oppName, "дай передохнуть а", { isSystem: false, playerId: opponentId });
        }
        return null;
      }
    } catch (_) {}

    const battle = createBattle({
      opponentId,
      fromThem: true
    });

    battle.attack = pickIncomingAttack(opponentId);
    battle.attackHidden = true;

    // Timing hint for "answered immediately" mechanics (UI may overwrite with firstSeenAt)
    battle.presentedAt = now();

    // Canon-only: if we cannot build a canonical incoming attack, degrade to draw.
    if (!battle.attack || !battle.attack.text) {
      Game.State.battles.unshift(battle);
      bumpBattleBadgeIfCollapsed();
      if (!battle.attackerId) battle.attackerId = opponentId;
      try { if (typeof C.finalize === "function") C.finalize(battle.id, "draw"); } catch (_) {}
      return battle;
    }

    Game.State.battles.unshift(battle);
    bumpBattleBadgeIfCollapsed();
    try {
      const cdMap = Game.State.battleCooldowns || (Game.State.battleCooldowns = {});
      cdMap[opponentId] = now();
    } catch (_) {}
    if (!battle.attackerId) battle.attackerId = opponentId;
    try {
      if (Game._ConflictEconomy && typeof Game._ConflictEconomy.applyStart === "function") {
        Game._ConflictEconomy.applyStart(battle);
      }
    } catch (_) {}
    return battle;
  };

  // Public helpers for UI (cost previews)
  C.escapeCost = function(battleId){
    const b = (typeof battleId === "string")
      ? Game.State.battles.find(x => x && x.id === battleId)
      : battleId;
    if (!b) return 0;
    if (b.resolved) return 0;
    return escapeCostForBattle(b);
  };

  C.escapeAllCost = function(){
    const me = Game.State.me;
    if (!me) return 0;
    const active = Game.State.battles.filter(b => b && !b.resolved);
    let total = 0;
    for (const b of active) total += escapeCostForBattle(b);
    return total;
  };

  C.escape = function (battleId, opts) {
    const b = Game.State.battles.find(x => x.id === battleId);
    if (!b) return { ok: false, reason: "not_found" };
    if (b.resolved) return { ok: false, reason: "already_resolved" };

    const me = Game.State.me;
    ensurePointsField(me);

    const mode = (typeof opts === "string")
      ? String(opts)
      : (opts && opts.mode ? String(opts.mode) : "smyt");

    // Canon: escape click accounted once per battle (REP via participation, not pool)
    try {
      if (!b._repEscapeClickApplied) {
        b._repEscapeClickApplied = true;
      }
    } catch (_) {}

    if (mode === "off") {
      const opp = getPlayer(b.opponentId);
      const meInf = (me && Number.isFinite(me.influence)) ? (me.influence | 0) : 0;
      const oppInf = (opp && Number.isFinite(opp.influence)) ? (opp.influence | 0) : 0;
      if (meInf > oppInf) {
        b.resolved = true;
        b.finished = true;
        b.result = "ignored";
        b.status = "finished";
        b.note = "Отвалил.";
        b.resultLine = "Отвалил";
        b.attackHidden = false;
        b.draw = false;
        b.crowd = null;
        b.updatedAt = now();
        // Refund +1 ⭐ on immediate success (once)
        try {
          if (!b._repEscapeRefundApplied && Game.StateAPI && typeof Game.StateAPI.transferRep === "function") {
            b._repEscapeRefundApplied = true;
          }
        } catch (_) {}
        announceBattleResult(b);
        return { ok: true, battleId: b.id, outcome: "ignored", mode };
      }
    }
    const cost = (mode === "off") ? 0 : ((opts && typeof opts.cost === "number") ? (opts.cost | 0) : escapeCostForBattle(b));
    if (mode !== "off" && (me.points|0) <= 0) return { ok: false, reason: "no_points", cost, have: (me.points|0) };
    if ((me.points|0) < cost) return { ok: false, reason: "no_points", cost, have: (me.points|0) };

    return startEscapeVote(b, mode, cost);
  };

  C.escapeAll = function () {
    const me = Game.State.me;
    ensurePointsField(me);

    const active = Game.State.battles.filter(b => b && !b.resolved);
    if (!active.length) return { ok: true, closed: 0, failed: [] };

    // Compute total cost first.
    let total = 0;
    for (const b of active) total += escapeCostForBattle(b);

    if (total > 0 && (me.points|0) <= 0) {
      return { ok: false, reason: "no_points", cost: total, have: (me.points|0) };
    }
    if ((me.points|0) < total) {
      // Not enough for all - close as many as possible from top to bottom.
      const failed = [];
      let closed = 0;
      for (const b of active) {
        const cost = escapeCostForBattle(b);
        if ((me.points|0) < cost) {
          failed.push({ battleId: b.id, cost });
          continue;
        }
        const started = startEscapeVote(b, "smyt", cost);
        if (started && started.ok) closed++;
      }
      return { ok: failed.length === 0, closed, failed, totalNeeded: total, have: (me.points|0) };
    }

    // Enough for all.
    for (const b of active) {
      const cost = escapeCostForBattle(b);
      startEscapeVote(b, "smyt", cost);
    }

    return { ok: true, closed: active.length, failed: [] };
  };

  C.finalize = function (battleId, outcome) {
    const b = Game.State.battles.find(x => x.id === battleId);
    if (!b || b.resolved) return;

    // outcome: "win" | "lose" | "draw" (relative to ME), or "escaped"
    // Cop rule (agreed): штраф -5 только если ты нажал "вброс" (то есть совершил действие в батле),
    // а не при самом старте батла. Поэтому применяем штраф здесь, в finalize.
    if (!b.fromThem) {
      const role = getRole(b.opponentId);
      if ((role === "cop" || role === "police") && outcome !== "escaped") {
        if (!b.copPenaltyApplied) {
          const me = Game.State && Game.State.me;
          ensurePointsField(me);
          const penalty = 5;
          if (me) {
            if (isCirculationEnabled()) {
              econTransfer("me", "sink", penalty, "cop_penalty", { battleId: b.id || b.battleId || null });
            } else {
              const beforePts = (me.points | 0);
              const afterPts = clamp0(beforePts - penalty);
              me.points = afterPts;
              try {
                if (Game && Game.StateAPI && typeof Game.StateAPI.emitStatDelta === "function") {
                  Game.StateAPI.emitStatDelta("points", (afterPts - beforePts) | 0, { reason: "cop_penalty", battleId: b.id || b.battleId || null });
                }
              } catch (_) {}
            }
          }
          b.copPenaltyApplied = true;

          // notify Cop in DM + public chat (ideal punctuation is handled by normalizeCopLine)
          notifyCopViolation(b.opponentId, penalty);

          // finalize immediately: no battle economy, no crowd
          b.resolved = true;
          b.attackHidden = false;
          b.draw = false;
          b.crowd = null;
          b.finished = true;
          b.result = "cop_penalty";
          b.status = "finished";
          b.note = `Нарушение порядка. Штраф -${penalty} 💰.`;
          b.resultLine = "Штраф";
          b.updatedAt = now();

          // sync mirrors if available
          try {
            if (Game.StateAPI && typeof Game.StateAPI.ensureNonNegativePoints === "function") {
              Game.StateAPI.ensureNonNegativePoints();
            }
            if (Game.StateAPI && typeof Game.StateAPI.syncMeToPlayers === "function") {
              Game.StateAPI.syncMeToPlayers();
            }
          } catch (_) {}

          if (b.pinned) {
            Game.State.battles = [b].concat(Game.State.battles.filter(x => x.id !== b.id));
          }
          return;
        }
      }
    }

    b.resolved = true;
    b.updatedAt = now();

    // Reveal attack only after we have an outcome.
    b.attackHidden = false;

  // Special rule: Toxic can deal immediate damage if you answer quickly.
  // Applies only when Toxic attacked (fromThem) and only once per battle.
  if (outcome !== "escaped") {
    maybeApplyToxicInstantHit(b);
  }

    // Special rule: Mafioso humiliation applies on ANY action except escape, only if mafia attacked.
    if (outcome !== "escaped") {
      maybeApplyMafiaHumiliation(b);
    }

    // Special rule: Bandit wipes all points ONLY on definitive loss (not escaped, not draw).
    // Applies only when Bandit attacked (fromThem) and only once per battle.
  if (outcome === "lose" && !b.draw) {
    maybeApplyBanditRobbery(b);
  }

    if (outcome === "draw") {
      b.draw = true;
      b.wasDraw = true;
      b.result = "draw";
      b.status = "draw";
      b.resultLine = "Толпа решает";
      b.finished = false;

      const { attackerId, defenderId } = attackerDefenderIds(b);
      b.crowd = {
        // Timer fields (keep both names, different UI modules may read either one)
        endAt: now() + DRAW_VOTE_DURATION_MS,
        endsAt: null,

        // Vote counters (also mirrored into crowd.votes later)
        votesA: 0,   // attacker side
        votesB: 0,   // defender side

        // Optional map to enforce "vote once" at the event/battle level (API/UI may also enforce)
        voters: {},

        decided: false,
        cap: getCrowdVoteCap(getTotalPlayersCount()),
        totalPlayers: getTotalPlayersCount(),
        attackerId,
        defenderId
      };
      // Keep alias in sync
      b.crowd.endsAt = b.crowd.endAt;

      startCrowdVoteTimer(b);

      // Events: create a draw event so chat can navigate to it.
      let evId = null;
      try {
        if (Game.Events && typeof Game.Events.addDrawEventFromBattle === "function") {
          const ev = Game.Events.addDrawEventFromBattle(b);
          evId = (ev && (ev.id || ev.eventId)) ? (ev.id || ev.eventId) : (typeof ev === "string" ? ev : null);
        }
      } catch (_) {}

      if (evId) {
        b.eventId = evId;
        if (b.crowd) b.crowd.eventId = evId;
      }

      // Push a SYS chat line about draw with links to battleId and eventId.
      try {
        const UI = (Game && Game.UI) ? Game.UI : null;
        if (UI && typeof UI.pushChat === "function") {
          const sysText = (Game && Game.Data && Game.Data.SYS && typeof Game.Data.SYS.drawCrowd === "string" && Game.Data.SYS.drawCrowd.trim())
            ? Game.Data.SYS.drawCrowd.trim()
            : "Толпа решает.";
          UI.pushChat({
            name: "Система",
            text: sysText,
            system: true,
            battleId: b.id,
            eventId: b.eventId || null
          });
          b.sysAnnounced = true;
        }
      } catch (_) {}

      return;
    }

    // Non-draw outcomes finalize immediately.
    b.draw = false;
    b.crowd = null;
    b.finished = true;
    b.result = outcome;
    b.status = "finished";
    if (b.tempInfluenceBoost) b.tempInfluenceBoost = 0;

    // Mafioso: keep "Поражение" label, but economy is intentionally skipped (see applyEconomyForOutcome).
    if (getRole(b.opponentId) === "mafia" && outcome !== "escaped") {
      b.note = "Унижение. ⚡ обнулено.";
      b.resultLine = "Поражение";
      if (outcome === "lose" && !b.mafiaShameAnnounced) {
        const meName = (Game.State && Game.State.me && Game.State.me.name) ? Game.State.me.name : "Игрок";
        pushSystem(`${meName} бросил вызов мафиози и остался униженным в ноль.`);
        b.mafiaShameAnnounced = true;
      }
    } else {
      b.note = (outcome === "win") ? "Победа." : (outcome === "escaped" ? "Свалил." : "Поражение.");
      b.resultLine = (outcome === "win") ? "Победа" : (outcome === "escaped" ? "Свалил" : "Поражение");
    }

    if (outcome !== "escaped") applyEconomyForOutcome(outcome, b);

    // Keep me mirror clean
    try {
      if (Game.StateAPI && typeof Game.StateAPI.ensureNonNegativePoints === "function") {
        Game.StateAPI.ensureNonNegativePoints();
      }
      if (Game.StateAPI && typeof Game.StateAPI.syncMeToPlayers === "function") {
        Game.StateAPI.syncMeToPlayers();
      }
    } catch (_) {}

    if (b.pinned) {
      Game.State.battles = [b].concat(Game.State.battles.filter(x => x.id !== b.id));
    }

    announceBattleResult(b);
  };

  C.startCrowdVoteTimer = function(battleId){
    const b = Game.State.battles.find(x => x.id === battleId);
    if (!b) return;
    startCrowdVoteTimer(b);
  };

  C.applyCrowdVoteTick = function(battleId){
    const b = Game.State.battles.find(x => x.id === battleId);
    return applyCrowdVoteTick(b, battleId);
  };

  C.applyEscapeVoteTick = function(battleId){
    const b = Game.State.battles.find(x => x.id === battleId);
    return applyEscapeVoteTick(b);
  };

  C.finalizeCrowdVote = function(battleId){
    const b = Game.State.battles.find(x => x.id === battleId);
    if (!b) {
      const helperCore = (Game.ConflictCore || Game._ConflictCore);
      const snap = helperCore ? helperCore.applyCrowdVoteTick(battleId) : null;
      const debug = {
        __snapDebug: {
          hasSnap: !!snap,
          hasCap: !!(snap && snap.crowdCapMeta),
          hasPending: !!(snap && snap.pendingMeta),
          capEndedBy: snap && snap.crowdCapMeta ? snap.crowdCapMeta.endedBy : null,
          pendingEndedBy: snap && snap.pendingMeta ? snap.pendingMeta.endedBy : null
        }
      };
      if (!snap || (!snap.crowdCapMeta && !snap.pendingMeta)) {
        return Object.assign({
          ok: false,
          battleId
        }, debug);
      }
      const meta = snap.crowdCapMeta || snap.pendingMeta || null;
      const fallbackOutcome = getOutcomeFromCapMeta(meta);
      return Object.assign({
        ok: false,
        battleId,
        outcome: fallbackOutcome || null,
        crowdCapMeta: snap.crowdCapMeta || null,
        pendingMeta: snap.pendingMeta || null,
        cacheHit: !!snap.cacheHit,
        why: snap.why || null
      }, debug);
    }
    const snap = applyCrowdVoteTick(b, battleId);
    const res = finalizeCrowdVote(b);
    if (res && res.crowdCapMeta) {
      return {
        ok: true,
        battleId: b.id || battleId,
        outcome: res.outcome || null,
        crowdCapMeta: res.crowdCapMeta
      };
    }
    if (snap && (snap.crowdCapMeta || snap.pendingMeta)) {
      const metaForOutcome = snap.crowdCapMeta ? snap.crowdCapMeta : (snap.pendingMeta || null);
      const fallbackOutcome = metaForOutcome ? getOutcomeFromCapMeta(metaForOutcome) : null;
      return {
        ok: false,
        battleId,
        outcome: fallbackOutcome || null,
        crowdCapMeta: snap.crowdCapMeta || null,
        pendingMeta: snap.pendingMeta || null,
        cacheHit: !!snap.cacheHit,
        why: snap.why || null
      };
    }
    return res || null;
  };

  C.finalizeEscapeVote = function(battleId){
    const b = Game.State.battles.find(x => x.id === battleId);
    if (!b) return;
    return finalizeEscapeVote(b);
  };

  function getRematchSides(b){
    if (!b) return null;
    if (!b.finished && !b.resolved) return null;
    if (b.result !== "win" && b.result !== "lose") return null;
    const oppId = b.opponentId || null;
    if (!oppId) return null;
    if (b.result === "win") return { winnerId: "me", loserId: oppId };
    return { winnerId: oppId, loserId: "me" };
  }

  function repAvailable(id){
    try {
      if (id === "me") {
        return Math.max(0, (Game.State && Number.isFinite(Game.State.rep) ? (Game.State.rep | 0) : 0));
      }
      const p = (Game.State && Game.State.players && id) ? Game.State.players[id] : null;
      return Math.max(0, (p && Number.isFinite(p.rep) ? (p.rep | 0) : 0));
    } catch (_) {
      return 0;
    }
  }

  C.requestRematch = function(battleId, requesterId){
    const b = Game.State.battles.find(x => x && x.id === battleId);
    if (!b) return { ok: false, reason: "not_found" };
    // Allow multiple rematch requests with escalating cost: only block if there's an undecided request.
    if (b.rematch && b.rematch.requestedAt && b.rematch.decided !== true) {
      return { ok: false, reason: "already_requested" };
    }
    const sides = getRematchSides(b);
    if (!sides) return { ok: false, reason: "not_eligible" };

    const reqId = requesterId || "me";
    if (reqId !== sides.loserId) return { ok: false, reason: "not_loser", expected: sides.loserId };

    const winnerId = sides.winnerId;
    const loserId = sides.loserId;

    // Escalating cost: track rematch request count on the battle.
    b.rematchRequestCount = (b.rematchRequestCount || 0) + 1;
    const cost = b.rematchRequestCount;

    // Cost: escalating point transfer loser -> winner. Must be loggable with battleId.
    try {
      const tx = econTransfer(loserId, winnerId, cost, "rematch_request_cost", { battleId: b.id, rematchOf: b.id });
      if (!tx || tx.ok !== true) {
        // If econ is present but refuses due to insufficient points, do NOT apply legacy fallback.
        const have =
          (loserId === "me")
            ? ((Game.State && Game.State.me && Number.isFinite(Game.State.me.points)) ? (Game.State.me.points | 0) : 0)
            : ((getPlayer(loserId) && Number.isFinite(getPlayer(loserId).points)) ? (getPlayer(loserId).points | 0) : 0);

        if (tx && tx.reason && tx.reason !== "no_econ") {
          return { ok: false, reason: "no_points", cost, have };
        }

        // No econ: apply safe legacy transfer with a strict funds check.
        const loser = (loserId === "me") ? (Game.State && Game.State.me) : getPlayer(loserId);
        const winner = (winnerId === "me") ? (Game.State && Game.State.me) : getPlayer(winnerId);
        ensurePointsField(loser);
        ensurePointsField(winner);
        if (!loser || !winner) return { ok: false, reason: "no_points", cost, have };
        if ((loser.points | 0) < cost) return { ok: false, reason: "no_points", cost, have: (loser.points | 0) };
        loser.points = clamp0((loser.points | 0) - cost);
        winner.points = clamp0((winner.points | 0) + cost);
      }
    } catch (_) {}

    // REP penalty: rematch request should NOT remove REP. 
    // Fixed: removed Game.StateAPI.transferRep call here.
    // try {
    //   const repPay = Math.max(0, Math.min(1, repAvailable(loserId)));
    //   if (repPay > 0 && Game.StateAPI && typeof Game.StateAPI.transferRep === "function") {
    //     Game.StateAPI.transferRep(loserId, winnerId, repPay, "rep_rematch_request", b.id);
    //   }
    // } catch (_) {}

    b.rematch = {
      requestedAt: now(),
      requestedBy: loserId,
      opponentId: winnerId,
      decided: false,
      accepted: null
    };
    b.updatedAt = now();
    return { ok: true, battleId: b.id, requestedBy: loserId, opponentId: winnerId };
  };

  C.respondRematch = function(battleId, accept, responderId){
    const b = Game.State.battles.find(x => x && x.id === battleId);
    if (!b) return { ok: false, reason: "not_found" };
    if (!b.rematch || !b.rematch.requestedAt) return { ok: false, reason: "no_request" };
    if (b.rematch.decided) return { ok: false, reason: "already_decided" };

    const sides = getRematchSides(b);
    if (!sides) return { ok: false, reason: "not_eligible" };

    const winnerId = sides.winnerId;
    const loserId = sides.loserId;
    const responder = responderId || "me";
    if (responder !== winnerId) return { ok: false, reason: "not_responder", expected: winnerId };

    const ok = (accept === true);
    b.rematch.decided = true;
    b.rematch.accepted = ok;
    b.rematch.decidedAt = now();

    if (!ok) {
      // Decline keeps point transfer as-is; rematch should NOT remove REP.
      // Fixed: removed Game.StateAPI.transferRep call here.
      // try {
      //   const repPay = Math.max(0, Math.min(1, repAvailable(winnerId)));
      //   if (repPay > 0 && Game.StateAPI && typeof Game.StateAPI.transferRep === "function") {
      //     Game.StateAPI.transferRep(winnerId, loserId, repPay, "rep_rematch_decline", b.id);
      //   }
      // } catch (_) {}
      b.updatedAt = now();
      return { ok: true, battleId: b.id, accepted: false };
    }

    // Accept: create a new battle and replace the old one at the same position.
    const fromThem = (loserId !== "me");
    const nb = createBattle({ opponentId: b.opponentId, fromThem });
    nb.rematchOf = b.id;
    nb.pinned = true;
    // INVARIANT: rematch counter persists across battles (each loss against same opponent costs +1💰)
    nb.rematchRequestCount = b.rematchRequestCount || 0;

    // IMPORTANT: an incoming battle must have an attack argument immediately,
    // otherwise UI gets stuck in pickDefense with empty args.
    // Mirror Core.incoming() initialization, but do NOT touch economy here.
    if (fromThem) {
      nb.attack = pickIncomingAttack(nb.opponentId);
      nb.attackHidden = true;
      nb.presentedAt = now();
      // Canon-only: if no canonical incoming attack, degrade to draw.
      if (!nb.attack || !nb.attack.text) {
        try { if (typeof C.finalize === "function") C.finalize(nb.id, "draw"); } catch (_) {}
      }
      if (!nb.attackerId) nb.attackerId = nb.opponentId;
      try {
        const cdMap = Game.State.battleCooldowns || (Game.State.battleCooldowns = {});
        cdMap[nb.opponentId] = now();
      } catch (_) {}
    }
    
    // Replace old battle at the same index (not unshift to top).
    const oldIndex = Game.State.battles.indexOf(b);
    if (oldIndex >= 0) {
      Game.State.battles.splice(oldIndex, 1, nb);
    } else {
      // Fallback: if old battle not found, add new one to top.
      Game.State.battles.unshift(nb);
      bumpBattleBadgeIfCollapsed();
    }

    return { ok: true, accepted: true, battle: nb };
  };

  C.applyVillainPenalty = applyVillainPenalty;
  C.resolveCrowdCore = resolveCrowdCore;
  C.getVoteWeight = getVoteWeight;

  // Export ONLY the internal core. Public API must live in conflict-api.js.
  // This avoids double-definitions and accidental overwrites.
  Game._ConflictCore = C;
  Game.ConflictCore = C;
})();
