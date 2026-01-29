 (function () {
   if (!window.Game) {
     console.error("[ConflictAPI] Game is not defined");
     return;
   }

   // Support both old and new module names.
   const Core = Game._ConflictCore || Game.ConflictCore || null;
   const Args = Game._ConflictArguments || Game.ConflictArguments || Game._ConflictArgs || null;

   if (!Core) {
     console.error("[ConflictAPI] Missing core module", { core: !!Core });
     return;
   }
   // Args can be optional (we can still resolve using Core.resolveBattleOutcome), but warn.
   if (!Args) {
     console.warn("[ConflictAPI] Arguments module not found, will fallback to Core.resolveBattleOutcome()");
   }

   // If API already exists, do not recreate.
   if (Game.Conflict && Game.Conflict.__ready) {
     return;
   }

  function render() {
    try {
      if (Game.UI && typeof Game.UI.renderBattles === "function") {
        Game.UI.renderBattles();
        if (Game.UI && typeof Game.UI.renderEvents === "function") Game.UI.renderEvents();
        try {
          const S = Game.__S || {};
          const me = S.me || {};
          const mi = document.getElementById("meInfluence");
          const mp = document.getElementById("mePoints");
          const mw = document.getElementById("meWins");
          const mr = document.getElementById("meRep");
          const mneed = document.getElementById("meRepNeed");
          const capNote = document.getElementById("weeklyCapNote");
          if (mi) mi.textContent = String(me.influence || 0);
          if (mp) mp.textContent = String(me.points || 0);
          if (mw) mw.textContent = String(me.wins || 0);
          if (mr) mr.textContent = String((Game.__S && Game.__S.rep) || 0);
          if (mneed) {
            const need = (Game.__A && typeof Game.__A.repNeedForNextInfluence === "function")
              ? Game.__A.repNeedForNextInfluence()
              : 0;
            mneed.textContent = String(need || 0);
          }
        if (capNote) capNote.textContent = "";
        } catch (_) {}
        if (Game.UI && typeof Game.UI.updateRightScroll === "function") Game.UI.updateRightScroll();
        return;
      }
      if (Game.UI && typeof Game.UI.requestRenderAll === "function") return Game.UI.requestRenderAll();
      if (Game.UI && typeof Game.UI.renderAll === "function") {
        // Avoid synchronous re-render inside click handlers.
        return setTimeout(() => {
          try { Game.UI.renderAll(); } catch (_) {}
        }, 0);
      }
     } catch (_) {}
   }

  const _argWarned = Object.create(null);
  function argSourceSummary() {
    const D = Game.Data || {};
    const pools = D.ARG_POOLS || null;
    const poolSizes = {};
    if (pools && typeof pools === "object") {
      Object.keys(pools).forEach(k => {
        const v = pools[k];
        poolSizes[k] = Array.isArray(v) ? v.length : 0;
      });
    }
    const pack = (D.ARGUMENTS || D.PHRASES) || null;
    const attackLen = (pack && Array.isArray(pack.attack)) ? pack.attack.length : 0;
    const defenseLen = (pack && Array.isArray(pack.defense)) ? pack.defense.length : 0;
    return { hasPools: !!pools, poolSizes, attackLen, defenseLen };
  }

  function logEmptyArgs(kind, reason, extra) {
    const key = `${kind}:${reason}`;
    if (_argWarned[key]) return;
    _argWarned[key] = true;
    console.warn(`[ConflictAPI] ${kind} options empty: ${reason}`, extra || argSourceSummary());
  }

  function filterValidArgs(list, kind) {
    const src = Array.isArray(list) ? list : [];
    if (!src.length) {
      logEmptyArgs(kind, "no_options");
      return [];
    }
    const out = [];
    for (const a of src) {
      if (!a || !a.id) continue;
      const text = (a.text || a.t || a.line || a.value || "");
      if (!String(text).trim()) continue;
      out.push(a);
    }
    if (!out.length) {
      logEmptyArgs(kind, "no_valid_entries", { count: src.length, sample: src[0] || null });
    }
    return out;
  }

   function findBattle(battleId) {
     const list = (Game.__S && Array.isArray(Game.__S.battles)) ? Game.__S.battles : [];
     return list.find(b => b && b.id === battleId) || null;
   }

   function pinBattleToTop(battleId) {
     try {
       const S = Game.__S || null;
       if (!S || !Array.isArray(S.battles) || !battleId) return false;

       const idx = S.battles.findIndex(b => b && b.id === battleId);
       if (idx < 0) return false;

       const b = S.battles[idx];
       // Keep only ACTIVE battles pinned (do not reorder finished history on every render)
       const isFinished = !!(b && (b.finished || b.resolved || b.status === "finished"));
       if (isFinished) return false;

       // Move to front
       S.battles.splice(idx, 1);
       S.battles.unshift(b);
       return true;
     } catch (_) {
       return false;
     }
   }

   function isDrawWithCrowd(b) {
     return !!(b && b.status === "draw" && b.draw === true && b.crowd && !b.crowd.decided);
   }

   function applyNpcVotesToBattle(battle) {
     try {
       if (!isDrawWithCrowd(battle)) return 0;
      if (!Game.NPC || typeof Game.NPC.getAll !== "function" || typeof Game.NPC.voteInDraw !== "function") return 0;
      const Econ = (Game && (Game.ConflictEconomy || Game._ConflictEconomy)) ? (Game.ConflictEconomy || Game._ConflictEconomy) : null;
      if (!Econ || typeof Econ.transferPoints !== "function") return 0;

       const now = Date.now();
       const endAt = battle.crowd.endAt || 0;
       if (endAt && now >= endAt) return 0;

       // Vote budget per tick: small and steady, scaled by how many NPCs exist.
       const npcs = Game.NPC.getAll().filter(x => {
         if (!x || !x.id) return false;
         if (x.role === "cop" || x.role === "police") return false;
         if (x.role === "toxic") return Number.isFinite(x.influence) && x.influence >= 40;
         if (x.role === "bandit") return Number.isFinite(x.influence) && x.influence >= 70;
         return true;
       });
       if (!npcs.length) return 0;

       const budget = 1;
       let applied = 0;

      const battleId = battle.id || battle.battleId || null;
      const crowd = battle.crowd || (battle.crowd = {});
      crowd.voters ||= {};

      const countCrowdVoteCostLogs = (voterId, bid) => {
        const dbg = (Game && Game.__D) ? Game.__D : null;
        if (!dbg || !Array.isArray(dbg.moneyLog)) return 0;
        return dbg.moneyLog.reduce((count, x) => {
          if (!x) return count;
          if (String(x.reason || "") !== "crowd_vote_cost") return count;
          if (String(x.battleId || "") !== String(bid)) return count;
          if (String(x.sourceId || "") !== String(voterId)) return count;
          return count + 1;
        }, 0);
      };

      const removeCrowdVoteCostLog = (voterId, bid) => {
        const dbg = (Game && Game.__D) ? Game.__D : null;
        if (!dbg || !Array.isArray(dbg.moneyLog)) return 0;
        let removed = 0;
        const match = (x) =>
          x &&
          String(x.reason || "") === "crowd_vote_cost" &&
          String(x.sourceId || "") === String(voterId || "") &&
          String(x.battleId || "") === String(bid || "");
        for (let i = dbg.moneyLog.length - 1; i >= 0; i--) {
          if (match(dbg.moneyLog[i])) { dbg.moneyLog.splice(i, 1); removed++; }
        }
        const byBattle = dbg.moneyLogByBattle && dbg.moneyLogByBattle[bid];
        if (Array.isArray(byBattle)) {
          for (let i = byBattle.length - 1; i >= 0; i--) {
            if (match(byBattle[i])) { byBattle.splice(i, 1); }
          }
        }
        return removed;
      };

       for (let i = 0; i < budget; i++) {
         const voter = npcs[Math.floor(Math.random() * npcs.length)];
         if (!voter) continue;

         const v = Game.NPC.voteInDraw(battle, voter);
         if (!v || !v.side || !v.weight) continue;

        const voterId = v.voterId || voter.id;
        if (!voterId) continue;
        if (crowd.voters && crowd.voters[voterId]) continue;
        const stateNpc = (Game.__S && Game.__S.players) ? Game.__S.players[voterId] : null;
        const beforePts = Number.isFinite(stateNpc && stateNpc.points) ? (stateNpc.points | 0) : 0;
        if (beforePts <= 0) continue;
        const costCountBefore = countCrowdVoteCostLogs(voterId, battleId);
        const ok = Econ.transferPoints(voterId, "sink", 1, "crowd_vote_cost", { battleId });
        const stateNpcAfter = (Game.__S && Game.__S.players) ? Game.__S.players[voterId] : stateNpc;
        const afterPts = Number.isFinite(stateNpcAfter && stateNpcAfter.points) ? (stateNpcAfter.points | 0) : 0;
        const costCountAfter = countCrowdVoteCostLogs(voterId, battleId);
        if (!ok || !ok.ok || (afterPts !== (beforePts - 1))) {
          if (ok && ok.ok && (afterPts !== (beforePts - 1))) {
            removeCrowdVoteCostLog(voterId, battleId);
          }
          continue;
        }

        crowd.voters[voterId] = (v.side === "attacker") ? "a" : "b";
        let w = 1;
        if (Core && typeof Core.getVoteWeight === "function") {
          w = Core.getVoteWeight(voterId) | 0;
          if (w <= 0) w = 1;
        } else {
          w = Math.max(1, v.weight | 0);
        }
        if (crowd.voters) {
          if (v.side === "attacker") crowd.votesA = (crowd.votesA | 0) + w;
          if (v.side === "defender") crowd.votesB = (crowd.votesB | 0) + w;
        }
        applied++;
       }

       return applied;
     } catch (_) {
       return 0;
     }
   }

   // --- Crowd vote loop orchestration (API-side safety net) ---
   const _crowdLoops = Object.create(null); // battleId -> intervalId

   function _getCrowdEndAt(b) {
     if (!b || !b.crowd) return 0;
     return (b.crowd.endAt || b.crowd.endsAt || 0) | 0;
   }

   function stopCrowdVoteLoop(battleId) {
     const t = _crowdLoops[battleId];
     if (t) {
       try { clearInterval(t); } catch (_) {}
       delete _crowdLoops[battleId];
     }
   }

   function ensureCrowdVoteLoop(battleId) {
     const b = findBattle(battleId);
     if (!b || !isDrawWithCrowd(b)) {
       stopCrowdVoteLoop(battleId);
       return false;
     }

     // Ensure timer exists in core, but keep API resilient.
     if (typeof Core.startCrowdVoteTimer === "function") {
       try { Core.startCrowdVoteTimer(battleId); } catch (_) {}
     }

     if (_crowdLoops[battleId]) return true;

     _crowdLoops[battleId] = setInterval(() => {
       try {
         const cur = findBattle(battleId);
         if (!cur || !isDrawWithCrowd(cur)) {
           stopCrowdVoteLoop(battleId);
           return;
         }

         // Apply a few NPC votes each tick.
         applyNpcVotesToBattle(cur);

         // Let core do any bookkeeping it wants.
         if (typeof Core.applyCrowdVoteTick === "function") {
           try { Core.applyCrowdVoteTick(battleId); } catch (_) {}
         }

         const endAt = _getCrowdEndAt(cur);
         if (endAt && Date.now() >= endAt) {
           // No timer-based finalize; cap-only logic.
         }

         if (!(cur.crowd && cur.crowd.uiOnly)) render();
       } catch (e) {
         console.error("[ConflictAPI] crowd loop tick failed", e);
         stopCrowdVoteLoop(battleId);
       }
     }, 1000);

     return true;
   }

   function ensureCrowdVoteStarted(battleId) {
     const b = findBattle(battleId);
     if (!b) return false;

     // Some core impls mark draw via flags.
     if (b.status !== "draw" && (b.result === "draw" || b.outcome === "draw" || b.draw === true)) {
       b.status = "draw";
       b.draw = true;
     }

     if (!isDrawWithCrowd(b)) return false;

     if (!b.crowd) b.crowd = {};
     if (!Number.isFinite(b.crowd.votesA)) b.crowd.votesA = b.crowd.votesA | 0;
     if (!Number.isFinite(b.crowd.votesB)) b.crowd.votesB = b.crowd.votesB | 0;
     if (!b.crowd.voters) b.crowd.voters = {};
     if (!b.crowd.decided) b.crowd.decided = false;

     return ensureCrowdVoteLoop(battleId);
   }

   function normalizeOutcome(result) {
     // Returns { outcome: "win"|"lose"|"draw", explicit: boolean }
     // explicit=true only when Args/core explicitly provided an outcome-like field.
     let out = result;
     let explicit = false;

     if (out && typeof out === "object") {
       if (typeof out.outcome === "string") { out = out.outcome; explicit = true; }
       else if (typeof out.result === "string") { out = out.result; explicit = true; }
       else if (typeof out.status === "string") { out = out.status; explicit = true; }
       else if (typeof out.kind === "string") { out = out.kind; explicit = true; }
       else if (typeof out.type === "string") { out = out.type; explicit = true; }
       else {
         out = null;
       }
     }

     if (typeof out !== "string") return { outcome: "draw", explicit: false };

     const s = out.toLowerCase();
     if (s.includes("win")) return { outcome: "win", explicit: true };
     if (s.includes("lose") || s.includes("loss")) return { outcome: "lose", explicit: true };
     if (s.includes("draw") || s.includes("tie")) return { outcome: "draw", explicit: true };
     return { outcome: "draw", explicit: explicit };
   }

   function getEscapeCostForBattle(battle) {
     const data = Game.Data || {};

     // Resolve opponent role as reliably as possible
     let role = "";
     if (battle) {
       role = String(battle.opponentRole || battle.role || (battle.opponent && battle.opponent.role) || "").trim();
       if (!role && battle.opponentId && Game.__S && Game.__S.players) {
         const opp = Game.__S.players[battle.opponentId];
         if (opp && opp.role) role = String(opp.role).trim();
       }
     }
     role = role.toLowerCase();

     // Preferred: a single function source of truth if provided by Data
     if (typeof data.escapeCostByRole === "function") {
       const v = data.escapeCostByRole(role, battle || null);
       if (Number.isFinite(v)) return Math.max(0, v | 0);
     }

     // Then explicit tables
     const costs =
       data.ESCAPE_COSTS ||
       data.ESCAPE_COST ||
       (data.RULES && data.RULES.escapeCosts) ||
       null;

     if (costs && typeof costs === "object") {
       const v = costs[role];
       if (Number.isFinite(v)) return Math.max(0, v | 0);
       const def = costs.default;
       if (Number.isFinite(def)) return Math.max(0, def | 0);
     }

     // Minimal fallbacks (only if Data is missing)
     switch (role) {
       case "toxic": return 1;
       case "bandit": return 2;
       case "mafia": return 3;
       default: return 1;
     }
   }

   function canPay(cost) {
     const pts = (Game.__S && Game.__S.me && Number.isFinite(Game.__S.me.points)) ? Game.__S.me.points : 0;
     return pts >= cost;
   }

   Game.Conflict = {
     __ready: true,

     // Public wrappers (core owns state + economy)
     startWith(opponentId) {
       // Ensure opponent role is resolved and cached before delegating to Core
       let resolvedOpponentRole = null;
       if (Game.__S && Game.__S.players && opponentId) {
         const opp = Game.__S.players[opponentId];
         if (opp && opp.role) resolvedOpponentRole = opp.role;
       }
       // Economy + creation live in Core. API only coordinates UI/state.
       let res = Core.startWith(opponentId);

       // Keep newly created battle at the top (active battles should be visible immediately).
       const bid = (res && res.battle && res.battle.id) ? res.battle.id : (res && res.battleId) ? res.battleId : null;
       if (bid) pinBattleToTop(bid);

       // Ensure opponentRole is set on the battle object
       if (res && res.battle) {
         const b = res.battle;
         if (!b.opponentRole) {
           const opp = (Game.__S && Game.__S.players && b.opponentId) ? Game.__S.players[b.opponentId] : null;
           if (opp && opp.role) b.opponentRole = opp.role;
         }
       }
       render();
       return res;
     },

     incoming(opponentId) {
       // Ensure opponent role is resolved and cached before delegating to Core
       let resolvedOpponentRole = null;
       if (Game.__S && Game.__S.players && opponentId) {
         const opp = Game.__S.players[opponentId];
         if (opp && opp.role) resolvedOpponentRole = opp.role;
       }
       // Cop must not initiate NPC-NPC battles
       const oppCheck = (Game.__S && Game.__S.players && opponentId) ? Game.__S.players[opponentId] : null;
       if (oppCheck && (oppCheck.role === "cop" || oppCheck.role === "police")) {
         return null;
       }
       // Economy + creation live in Core. API only coordinates UI/state.
       let b = Core.incoming(opponentId);

       // Keep newly created incoming battle at the top (active battles should be visible immediately).
       if (b && b.id) pinBattleToTop(b.id);

       // Incoming attack must start with hidden color: keep true color in _color, expose color only after defense is chosen.
       if (b && b.attack && b.attack.color != null && b.fromThem !== false) {
         b.attack._color = b.attack._color || b.attack.color;
         b.attack.color = null;
         b.attackHidden = true;
       }
       // Ensure opponentRole is set on the battle object
       if (b && !b.opponentRole) {
         const opp = (Game.__S && Game.__S.players && b.opponentId) ? Game.__S.players[b.opponentId] : null;
         if (opp && opp.role) b.opponentRole = opp.role;
       }
       render();
       return b;
     },

     escape(battleId, mode) {
       const battle = findBattle(battleId);
       if (!battle) return { ok: false, error: "no_battle" };

       if (!battle.opponentRole) {
         const opp = (Game.__S && Game.__S.players && battle.opponentId) ? Game.__S.players[battle.opponentId] : null;
         if (opp && opp.role) battle.opponentRole = String(opp.role);
       }
       // Normalize role casing for consistent cost lookups
       if (battle.opponentRole) battle.opponentRole = String(battle.opponentRole).toLowerCase();
       const isFree = String(mode || "") === "off";
       const cost = isFree ? 0 : getEscapeCostForBattle(battle);
       if (!canPay(cost)) {
         return { ok: false, error: "not_enough_points", cost };
       }

       const res = Core.escape(battleId, { cost, mode });
       render();
       return { ok: true, cost, battle: res };
     },

     ignore(battleId) {
       return this.escape(battleId, "off");
     },

     requestRematch(battleId, requesterId) {
       // Support NPC auto-rematch requests: ui-loops may call requestRematch(battleId, npcId).
       const rid = (requesterId != null) ? requesterId : "me";
       const res = Core.requestRematch ? Core.requestRematch(battleId, rid) : { ok: false, reason: "no_core" };
       const bid = (res && res.battleId) ? res.battleId : battleId;
       if (bid) pinBattleToTop(bid);
       render();
       return res;
     },

    respondRematch(battleId, accept, responderId) {
      const rid = (responderId != null) ? responderId : "me";
      const res = Core.respondRematch ? Core.respondRematch(battleId, !!accept, rid) : { ok: false, reason: "no_core" };
      const nbid = (res && res.battle && res.battle.id) ? res.battle.id : null;
      if (nbid) pinBattleToTop(nbid);
      render();
      return res;
    },

     escapeAll() {
       const battles = (Game.__S && Array.isArray(Game.__S.battles))
         ? Game.__S.battles.filter(b => b && !b.resolved && !b.finished && b.status !== "finished")
         : [];

       let totalCost = 0;
       for (const b of battles) {
         if (!b.opponentRole) {
           const opp = (Game.__S && Game.__S.players && b.opponentId) ? Game.__S.players[b.opponentId] : null;
           if (opp && opp.role) b.opponentRole = String(opp.role);
         }
         if (b.opponentRole) b.opponentRole = String(b.opponentRole).toLowerCase();
         totalCost += getEscapeCostForBattle(b);
       }

       if (!canPay(totalCost)) {
         return { ok: false, error: "not_enough_points", cost: totalCost };
       }

       const res = Core.escapeAll({ totalCost });
       render();
       return { ok: true, cost: totalCost, battles: res };
     },

    myAttackOptions(battle) {
       if (!Args) {
         logEmptyArgs("attack", "args_module_missing");
         return [];
       }
       let list = [];
       if (typeof Args.myAttackOptions === "function") {
         try {
           list = Args.myAttackOptions(battle || null) || [];
         } catch (e) {
           logEmptyArgs("attack", "exception", { error: String(e && e.message ? e.message : e) });
           list = [];
         }
       }
       const filtered = filterValidArgs(list, "attack").filter(a => a && String(a.id || "").startsWith("canon_"));
       if (battle && battle.id && filtered.length < 3) {
         try {
           console.warn("[CANON] attack options missing canon set → draw", { battleId: battle.id, have: filtered.length });
           if (Core && typeof Core.finalize === "function") Core.finalize(battle.id, "draw");
         } catch (_) {}
       }
       return filtered;
    },

    myDefenseOptions(battle) {
       if (!Args) {
         logEmptyArgs("defense", "args_module_missing");
         return [];
       }
       let list = [];
       if (typeof Args.myDefenseOptions === "function") {
         try {
           list = Args.myDefenseOptions(battle || null) || [];
         } catch (e) {
           logEmptyArgs("defense", "exception", { error: String(e && e.message ? e.message : e) });
           list = [];
         }
       }
       const filtered = filterValidArgs(list, "defense").filter(a => a && String(a.id || "").startsWith("canon_"));
       if (battle && battle.id && filtered.length < 3) {
         try {
           console.warn("[CANON] defense options missing canon set → draw", { battleId: battle.id, have: filtered.length });
           if (Core && typeof Core.finalize === "function") Core.finalize(battle.id, "draw");
         } catch (_) {}
       }
       return filtered;
    },

     // Crowd vote controls (core already has the implementation).
     // These are thin wrappers for debugging/manual calls.
     startCrowdVote(battleId) {
       const b = findBattle(battleId);
       if (!b) return { ok: false, error: "no_battle" };
       ensureCrowdVoteStarted(battleId);
       render();
       return { ok: true };
     },

     applyCrowdVote(battleId) {
       const b = findBattle(battleId);
       // Let NPCs vote a little each tick while the draw is active.
       if (b) applyNpcVotesToBattle(b);
       if (typeof Core.applyCrowdVoteTick === "function") Core.applyCrowdVoteTick(battleId);
       render();
       return { ok: true };
     },

     applyEscapeVote(battleId) {
       if (typeof Core.applyEscapeVoteTick === "function") Core.applyEscapeVoteTick(battleId);
       render();
       return { ok: true };
     },

     npcVoteBurst(battleId) {
       const b = findBattle(battleId);
       if (!b) return { ok: false, error: "no_battle" };
       const n = applyNpcVotesToBattle(b);
       render();
       return { ok: true, votes: n, votesA: b.crowd ? b.crowd.votesA : 0, votesB: b.crowd ? b.crowd.votesB : 0 };
     },

    finalizeCrowdVote(battleId) {
       if (typeof Core.finalizeCrowdVote === "function") Core.finalizeCrowdVote(battleId);
       const cur = findBattle(battleId);
       if (cur && cur.crowd && !cur.crowd.decided) {
         ensureCrowdVoteLoop(battleId);
       } else {
         stopCrowdVoteLoop(battleId);
       }
       render();
       return { ok: true };
    },

     finalizeEscapeVote(battleId) {
       if (typeof Core.finalizeEscapeVote === "function") Core.finalizeEscapeVote(battleId);
       render();
       return { ok: true };
     },

     // ---- Picking helpers (UI expects these) ----
     _findArgById(list, id) {
       if (!Array.isArray(list) || !id) return null;
       return list.find(a => a && a.id === id) || null;
     },

     // Player starts an outgoing battle by choosing an ATTACK argument.
     // UI typically calls: Game.Conflict.pickAttack(battleId, attackArgId)
     pickAttack(battleId, attackArgId) {
       const battle = findBattle(battleId);
       if (!battle) return { ok: false, error: "no_battle" };

       // Outgoing only.
       battle.fromThem = false;

       // Get options from arguments module.
       const opts = (Args && typeof Args.myAttackOptions === "function")
         ? Args.myAttackOptions(battle)
         : [];

      let picked = this._findArgById(opts, attackArgId);
      if (!picked && Array.isArray(battle._attackChoices)) {
        picked = this._findArgById(battle._attackChoices.filter(a => a && !a._pad), attackArgId);
      }
      if (!picked) return { ok: false, error: "no_attack_arg" };
      if (!String(picked.id || "").startsWith("canon_")) {
        try { console.warn("[CANON] non-canon attack picked blocked", { battleId, attackArgId }); } catch (_) {}
        try { if (Core && typeof Core.finalize === "function") Core.finalize(battleId, "draw"); } catch (_) {}
        return { ok: false, error: "non_canon_attack" };
      }

       // Persist chosen attack. Keep power/color for logic, but UI should hide it until resolved.
       battle.attack = picked ? { ...picked } : picked;
       battle.attackId = picked.id;
       battle.attackType = picked.type || battle.attackType || null;
      battle.attackColor = picked.color || battle.attackColor || null;
      battle.attackHidden = false; // Outgoing battle: player sees the color of their own throw

       // IMPORTANT: Outgoing battle must NOT enter pickDefense.
       // After choosing attack, opponent "thinks" and then responds.
       battle.status = "waiting";
       battle.opponentThinking = true;
       battle.resolved = false;
       battle.finished = false;
       battle.result = null;
       battle.note = "";

       // Schedule simulated opponent response.
       const opp0 = (Game.__S && Game.__S.players && battle.opponentId) ? Game.__S.players[battle.opponentId] : null;
       const oppRole0 = (battle.opponentRole || (opp0 && opp0.role) || "").toString().toLowerCase();
       const forceLose = (oppRole0 === "toxic" || oppRole0 === "bandit");
       const delayMs = forceLose ? 0 : (900 + Math.floor(Math.random() * 700));
       battle.waitUntil = Date.now() + delayMs;

       // Make sure we don't stack multiple timers for the same battle.
       if (battle._opponentTimer) {
         try { clearTimeout(battle._opponentTimer); } catch (_) {}
       }

       if (forceLose) {
         const roleLower = String(oppRole0 || "");
         try {
           if (Core && typeof Core.applyVillainPenalty === "function") {
             Core.applyVillainPenalty(battle, "outgoing");
           }
           if (Core && typeof Core.resolveBattleOutcome === "function") {
             Core.resolveBattleOutcome(battle.id, null, { forceOutcome: "lose" });
           } else if (Core && typeof Core.finalize === "function") {
             Core.finalize(battle.id, "lose");
           } else {
             battle.resolved = true;
             battle.finished = true;
             battle.result = "lose";
             battle.status = "finished";
             battle.resultLine = "Поражение";
           }
           if (Game.UI && typeof Game.UI.pushSystem === "function") {
             const line = roleLower === "bandit" ? "Ты напоролся на бандита." : "Ты напоролся на токсика.";
             Game.UI.pushSystem(line);
           }
         } catch (_) {}
         try { if (Game.UI && typeof Game.UI.requestRenderAll === "function") Game.UI.requestRenderAll(); } catch (_) {}
         return { ok: true, battleId: battle.id, outcome: "lose", role: oppRole0 };
       }

       battle._opponentTimer = setTimeout(() => {
         try {
           const b = findBattle(battleId);
           if (!b || b.resolved || b.finished) return;
           if (b.status !== "waiting") return;

          // --- choose opponent defense (CANON ONLY) ---

           function pickOne(arr) {
             if (!Array.isArray(arr) || !arr.length) return null;
             return arr[Math.floor(Math.random() * arr.length)];
           }

           // Determine opponent power tier and role
           const opp = (Game.__S && Game.__S.players && b.opponentId) ? Game.__S.players[b.opponentId] : null;
           const oppRole = (b.opponentRole || (opp && opp.role) || "").toString();
          const usable = (Args && typeof Args.myDefenseOptions === "function") ? (Args.myDefenseOptions(b) || []) : [];
          if (!usable.length) {
            try { console.warn("[CANON] npc defense options empty → draw", { battleId: b.id }); } catch (_) {}
            if (typeof Core.finalize === "function") Core.finalize(b.id, "draw");
            return;
          }

           // Choose whether opponent answers with correct type.
          const types = ["about", "yn", "who", "where"];
          const atkType = (b.attackType || (b.attack && b.attack.type) || "yn").toString().toLowerCase();
          const normType = (atkType === "yesno") ? "yn" : atkType;
           const otherTypes = types.filter(t => t !== normType);

           let correctChance = 0.62;
           if (oppRole === "toxic") correctChance = 0.70;
           if (oppRole === "bandit") correctChance = 0.78;
           if (oppRole === "mafia") correctChance = 0.92;

          const useCorrect = (Math.random() < correctChance);
          const wantType = useCorrect ? normType : pickOne(otherTypes);

          const candidates = usable.filter(it => String(it && (it.type || it.group) || "").toLowerCase() === String(wantType || "").toLowerCase());
          let defensePicked = pickOne(candidates) || pickOne(usable);
          if (!defensePicked || !String(defensePicked.id || "").startsWith("canon_")) {
            try { console.warn("[CANON] npc picked non-canon defense → draw", { battleId: b.id }); } catch (_) {}
            if (typeof Core.finalize === "function") Core.finalize(b.id, "draw");
            return;
          }
          defensePicked = { ...defensePicked };

           // Persist opponent defense and resolve via core.
           b.defense = defensePicked || null;
           b.npcDefenseId = defensePicked ? defensePicked.id : null;
           b.npcDefenseText = defensePicked ? defensePicked.text : null;
           b.npcDefenseChoice = defensePicked ? {
             id: defensePicked.id,
             text: defensePicked.text,
             type: defensePicked.type || defensePicked.group || null,
             group: defensePicked.group || defensePicked.type || null,
             color: defensePicked.color || null
           } : null;
           b.lastNpcChoice = defensePicked ? {
             kind: "defense",
             id: defensePicked.id,
             text: defensePicked.text,
             at: Date.now()
           } : null;
           b.opponentThinking = false;

           try {
             // DEV NOTE:
             // Console spam can freeze UI when DevTools is open.
             // Log ConflictAPI internals ONLY when explicitly enabled.
             const devOn = !!(Game && Game.UI && Game.UI.S && Game.UI.S.flags && Game.UI.S.flags.devChecks);
             const verbose = !!(typeof window !== "undefined" && window.__LOG_CONFLICT_API === true) ||
               !!(Game && Game.__D && Game.__D.LOG_CONFLICT_API === true);
             if (devOn && verbose && console && typeof console.debug === "function") {
               console.debug("[ConflictAPI] npc defense pick", {
                 battleId: b.id,
                 phase: b.status,
                 npcId: b.opponentId || null,
                 chosenDefenseId: b.npcDefenseId,
                 chosenText: b.npcDefenseText,
                 fields: {
                   defense: b.defense ? { id: b.defense.id, text: b.defense.text } : null,
                   npcDefenseId: b.npcDefenseId,
                   npcDefenseText: b.npcDefenseText,
                   npcDefenseChoice: b.npcDefenseChoice,
                   lastNpcChoice: b.lastNpcChoice
                 }
               });
             }
           } catch (_) {}

           let outcome = "draw";
           let resolution = null;
           if (Core && typeof Core.resolveBattleOutcome === "function") {
             resolution = Core.resolveBattleOutcome(b.id, defensePicked);
             if (resolution && resolution.ok && resolution.outcome) {
               outcome = resolution.outcome;
             }
           }

           if (!resolution || (resolution && resolution.ok === false)) {
             if (typeof Core.finalize === "function") {
               Core.finalize(b.id, outcome);

               // Some core implementations may overwrite/normalize battle fields on finalize.
               const bb = findBattle(b.id);
               if (bb) {
                 if (!bb.attack && b.attack) bb.attack = b.attack;
                 if (!bb.defense) bb.defense = defensePicked || null;
                 if (bb.npcDefenseId == null) bb.npcDefenseId = b.npcDefenseId || null;
                 if (bb.npcDefenseText == null) bb.npcDefenseText = b.npcDefenseText || null;
                 if (bb.npcDefenseChoice == null && b.npcDefenseChoice) bb.npcDefenseChoice = b.npcDefenseChoice;
                 if (bb.lastNpcChoice == null && b.lastNpcChoice) bb.lastNpcChoice = b.lastNpcChoice;
               }
               ensureCrowdVoteStarted(b.id);
             } else {
               b.resolved = true;
               b.finished = true;
               b.status = "finished";
               b.result = outcome;
             }
           } else {
             ensureCrowdVoteStarted(b.id);
           }

           render();
         } catch (e) {
           console.error("[ConflictAPI] opponent response failed", e);
         }
       }, delayMs);

       render();
       return { ok: true, battle };
     },

     // Player responds to an incoming battle by choosing a DEFENSE argument.
     // UI typically calls: Game.Conflict.pickDefense(battleId, defenseArgId)
     pickDefense(battleId, defenseArgId) {
       const battle = findBattle(battleId);
       if (!battle) return { ok: false, error: "no_battle" };

       // Defense picking is only valid for INCOMING battles.
       // If this is an outgoing battle (fromThem === false), UI must not be able to resolve it as incoming.
       if (battle.fromThem === false && battle.status !== "pickDefense") {
         return { ok: false, error: "not_incoming" };
       }

       if (battle.fromThem !== true) battle.fromThem = true;

       const opts = (Args && typeof Args.myDefenseOptions === "function")
         ? Args.myDefenseOptions(battle)
         : [];

      let picked = null;
      if (Array.isArray(battle._defenseChoices)) {
        picked = this._findArgById(battle._defenseChoices.filter(a => a && !a._pad), defenseArgId);
      }
      if (!picked) picked = this._findArgById(opts, defenseArgId);
      if (!picked) return { ok: false, error: "no_defense_arg" };
      if (!String(picked.id || "").startsWith("canon_")) {
        try { console.warn("[CANON] non-canon defense picked blocked", { battleId, defenseArgId }); } catch (_) {}
        try { if (Core && typeof Core.finalize === "function") Core.finalize(battleId, "draw"); } catch (_) {}
        return { ok: false, error: "non_canon_defense" };
      }
       // Delegate to resolver (applies economy + draw logic in Core.finalize).
       const res = this.resolveBattle(battle, picked);
       render();
       return res;
     },

     // Common aliases (older UI names / safety)
     chooseAttack(battleId, attackArgId) { return this.pickAttack(battleId, attackArgId); },
     chooseDefense(battleId, defenseArgId) { return this.pickDefense(battleId, defenseArgId); },
     selectAttack(battleId, attackArgId) { return this.pickAttack(battleId, attackArgId); },
     selectDefense(battleId, defenseArgId) { return this.pickDefense(battleId, defenseArgId); },
     pick(battleId, side, argId) {
       if (side === "attack") return this.pickAttack(battleId, argId);
       if (side === "defense") return this.pickDefense(battleId, argId);
       return { ok: false, error: "bad_side" };
     },

     // Resolve a battle after the player picked a defense argument.
     // IMPORTANT: economy is applied inside Core.finalize.
     resolveBattle(battle, defenseArg) {
       if (!battle || !battle.id) {
         console.warn("[ConflictAPI] resolveBattle called without a battle or battle.id", battle);
         return { ok: false, error: "no_battle" };
       }

       // Always persist the chosen defense on the battle object.
       battle.defense = defenseArg ? { ...defenseArg } : null;

       // For UI stability: once a choice is made, stop any "thinking" state.
       battle.opponentThinking = false;

       // Prefer Args.resolve if present (it may also set extra fields), but do not require it.
       let result = null;
       if (Args && typeof Args.resolve === "function") {
         result = Args.resolve(battle, defenseArg);
       }

       const norm = normalizeOutcome(result);
       const forcedOutcome = norm.explicit ? norm.outcome : null;
       let resolution = null;
       if (Core && typeof Core.resolveBattleOutcome === "function") {
         resolution = Core.resolveBattleOutcome(battle.id, defenseArg, { forceOutcome: forcedOutcome });
         if (resolution && resolution.ok === false) resolution = null;
       }
       const fallbackOutcome = forcedOutcome || "draw";
       if (!resolution) {
         if (Core && typeof Core.finalize === "function") {
           Core.finalize(battle.id, fallbackOutcome);
           resolution = { ok: true, outcome: fallbackOutcome };
         } else {
           battle.resolved = true;
           battle.finished = true;
           battle.status = (fallbackOutcome === "draw") ? "draw" : "finished";
           battle.result = fallbackOutcome;
           battle.draw = (fallbackOutcome === "draw");
           if (!battle.resultLine) {
             battle.resultLine = (fallbackOutcome === "draw")
               ? "Толпа решает"
               : (fallbackOutcome === "win")
                 ? "Победа"
                 : "Поражение";
           }
           resolution = { ok: true, outcome: fallbackOutcome };
         }
       }

       ensureCrowdVoteStarted(battle.id);
       render();
       return result || resolution;
    }
   };

  // --- Replace all random NPC selection for battle initiation with the preferred biased picker ---
  // Utility for preferred NPC selection for battle initiation:
  Game.Conflict._pickNpcForBattle = function () {
    // Cop and Mafioso must never initiate NPC battles
    if (Game.NPC && typeof Game.NPC.randomForBattle === "function") {
      return Game.NPC.randomForBattle();
    }
    return null;
  };

   console.log("[ConflictAPI] ready");
 })();
