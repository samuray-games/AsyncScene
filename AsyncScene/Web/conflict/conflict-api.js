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
   // Args can be optional (we can still resolve using Core.computeOutcome), but warn.
   if (!Args) {
     console.warn("[ConflictAPI] Arguments module not found, will fallback to Core.computeOutcome()");
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
          const S = Game.State || {};
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
          if (mr) mr.textContent = String((Game.State && Game.State.rep) || 0);
          if (mneed) {
            const need = (Game.StateAPI && typeof Game.StateAPI.repNeedForNextInfluence === "function")
              ? Game.StateAPI.repNeedForNextInfluence()
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
     const list = (Game.State && Array.isArray(Game.State.battles)) ? Game.State.battles : [];
     return list.find(b => b && b.id === battleId) || null;
   }

   function pinBattleToTop(battleId) {
     try {
       const S = Game.State || null;
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

       for (let i = 0; i < budget; i++) {
         const voter = npcs[Math.floor(Math.random() * npcs.length)];
         if (!voter) continue;

         const v = Game.NPC.voteInDraw(battle, voter);
         if (!v || !v.side || !v.weight) continue;

         const w = Math.max(1, v.weight | 0);
         if (v.side === "attacker") battle.crowd.votesA = (battle.crowd.votesA | 0) + w;
         if (v.side === "defender") battle.crowd.votesB = (battle.crowd.votesB | 0) + w;
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

     // Normalize endAt/endsAt for UI + for our loop.
     if (b.crowd) {
       if (b.crowd.endAt && !b.crowd.endsAt) b.crowd.endsAt = b.crowd.endAt;
       if (b.crowd.endsAt && !b.crowd.endAt) b.crowd.endAt = b.crowd.endsAt;
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
           if (typeof Core.finalizeCrowdVote === "function") {
             try { Core.finalizeCrowdVote(battleId); } catch (_) {}
           }
           const cur2 = findBattle(battleId);
           if (!(cur2 && cur2.crowd && cur2.crowd.decided)) {
             return;
           }
           stopCrowdVoteLoop(battleId);
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

     const endAt = _getCrowdEndAt(b);
     if (!endAt) {
       const t = Date.now() + 30000;
       b.crowd.endAt = t;
       b.crowd.endsAt = t;
     }

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
       if (!role && battle.opponentId && Game.State && Game.State.players) {
         const opp = Game.State.players[battle.opponentId];
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
     const pts = (Game.State && Game.State.me && Number.isFinite(Game.State.me.points)) ? Game.State.me.points : 0;
     return pts >= cost;
   }

   Game.Conflict = {
     __ready: true,

     // Public wrappers (core owns state + economy)
     startWith(opponentId) {
       // Ensure opponent role is resolved and cached before delegating to Core
       let resolvedOpponentRole = null;
       if (Game.State && Game.State.players && opponentId) {
         const opp = Game.State.players[opponentId];
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
           const opp = (Game.State && Game.State.players && b.opponentId) ? Game.State.players[b.opponentId] : null;
           if (opp && opp.role) b.opponentRole = opp.role;
         }
       }
       render();
       return res;
     },

     incoming(opponentId) {
       // Ensure opponent role is resolved and cached before delegating to Core
       let resolvedOpponentRole = null;
       if (Game.State && Game.State.players && opponentId) {
         const opp = Game.State.players[opponentId];
         if (opp && opp.role) resolvedOpponentRole = opp.role;
       }
       // Cop must not initiate NPC-NPC battles
       const oppCheck = (Game.State && Game.State.players && opponentId) ? Game.State.players[opponentId] : null;
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
         const opp = (Game.State && Game.State.players && b.opponentId) ? Game.State.players[b.opponentId] : null;
         if (opp && opp.role) b.opponentRole = opp.role;
       }
       render();
       return b;
     },

     escape(battleId, mode) {
       const battle = findBattle(battleId);
       if (!battle) return { ok: false, error: "no_battle" };

       if (!battle.opponentRole) {
         const opp = (Game.State && Game.State.players && battle.opponentId) ? Game.State.players[battle.opponentId] : null;
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

     requestRematch(battleId) {
       const res = Core.requestRematch ? Core.requestRematch(battleId, "me") : { ok: false, reason: "no_core" };
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
       const battles = (Game.State && Array.isArray(Game.State.battles))
         ? Game.State.battles.filter(b => b && !b.resolved && !b.finished && b.status !== "finished")
         : [];

       let totalCost = 0;
       for (const b of battles) {
         if (!b.opponentRole) {
           const opp = (Game.State && Game.State.players && b.opponentId) ? Game.State.players[b.opponentId] : null;
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
       return filterValidArgs(list, "attack");
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
       return filterValidArgs(list, "defense");
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
       const opp0 = (Game.State && Game.State.players && battle.opponentId) ? Game.State.players[battle.opponentId] : null;
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
           if (Core && typeof Core.finalize === "function") {
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

           // --- choose opponent defense ---
           const data = Game.Data || {};
           const A = data.ARGUMENTS || data.PHRASES || null;

           // Helper: power tier by influence (fallback rule)
           function powerByInfluence(inf) {
             const v = Number.isFinite(inf) ? inf : 0;
             const P = (Game && Game.Data && Game.Data.PROGRESSION) ? Game.Data.PROGRESSION : null;
             const U = (P && P.unlockInfluence) ? P.unlockInfluence : null;
             const strong = (U && Number.isFinite(U.strong)) ? (U.strong | 0) : 5;
             const power = (U && Number.isFinite(U.power)) ? (U.power | 0) : 10;
             const absolute = (U && Number.isFinite(U.absolute)) ? (U.absolute | 0) : 100;

             if (v >= absolute) return "k";
             if (v >= power) return "r";
             if (v >= strong) return "o";
             return "y";
           }

           // Helper: collect defense pool for a given power tier
           function collectDefensePool(power) {
             const pool = [];
             if (!A) return pool;

             // Accept multiple possible shapes:
             // 1) A.defense[power] = [ ...items ]
             // 2) A.defense[power][type] = [ ...items ]
             // 3) A.defense[type][power] = [ ...items ]
             const D = A.defense || A.DEFENSE || null;
             if (!D) return pool;

             // Flat array shape (current Data): A.defense = [ {id,color,group,text}, ... ]
             if (Array.isArray(D)) {
               for (const it of D) {
                 if (!it || typeof it !== "object") continue;
                 if (it.color !== power) continue;
                 pool.push(it);
               }
               return pool;
             }

             const byPower = D[power];
             if (Array.isArray(byPower)) {
               for (const it of byPower) if (it) pool.push(it);
               return pool;
             }
             if (byPower && typeof byPower === "object") {
               for (const k of Object.keys(byPower)) {
                 const arr = byPower[k];
                 if (Array.isArray(arr)) for (const it of arr) if (it) pool.push(it);
               }
               if (pool.length) return pool;
             }

             // Type-first shape
             for (const t of ["yn", "who", "where", "yesno"]) {
               const node = D[t];
               if (!node) continue;
               const arr = node[power];
               if (Array.isArray(arr)) for (const it of arr) if (it) pool.push(it);
             }
             return pool;
           }

           function pickOne(arr) {
             if (!Array.isArray(arr) || !arr.length) return null;
             return arr[Math.floor(Math.random() * arr.length)];
           }

           // Determine opponent power tier and role
           const opp = (Game.State && Game.State.players && b.opponentId) ? Game.State.players[b.opponentId] : null;
           const oppRole = (b.opponentRole || (opp && opp.role) || "").toString();
           const oppInf = (opp && Number.isFinite(opp.influence)) ? opp.influence : 0;
           const oppPower = powerByInfluence(oppInf);

           const pool = collectDefensePool(oppPower);
           // If pool is empty, fall back down the tiers.
           const fallbackTiers = oppPower === "k" ? ["k", "r", "o", "y"] : (oppPower === "r" ? ["r", "o", "y"] : (oppPower === "o" ? ["o", "y"] : ["y"]));
           let usable = pool;
           if (!usable.length) {
             for (const tier of fallbackTiers) {
               const p = collectDefensePool(tier);
               if (p.length) { usable = p; break; }
             }
           }

           // Choose whether opponent answers with correct type.
           const types = ["yn", "who", "where"];
           const atkType = (b.attackType || (b.attack && b.attack.type) || "yn").toString();
           const normType = (atkType === "yesno") ? "yn" : atkType;
           const otherTypes = types.filter(t => t !== normType);

           let correctChance = 0.62;
           if (oppRole === "toxic") correctChance = 0.70;
           if (oppRole === "bandit") correctChance = 0.78;
           if (oppRole === "mafia") correctChance = 0.92;

           const useCorrect = (Math.random() < correctChance);
           const wantType = useCorrect ? normType : pickOne(otherTypes);

           const candidates = usable.filter(it => {
             const t = (it.type || it.group || it.kind || "").toString();
             const tt = (t === "yesno") ? "yn" : t;
             return tt === wantType;
           });

           function normalizeArg(it, fallbackColor) {
             if (!it || typeof it !== "object") return null;

             // Work on a copy to avoid mutating Data tables.
             const obj = { ...it };

             // Ensure UI-visible text.
             if (typeof obj.text !== "string" || !obj.text.trim()) {
               const t = (typeof obj.phrase === "string" && obj.phrase.trim()) ? obj.phrase
                 : (typeof obj.line === "string" && obj.line.trim()) ? obj.line
                 : (typeof obj.value === "string" && obj.value.trim()) ? obj.value
                 : (typeof obj.name === "string" && obj.name.trim()) ? obj.name
                 : "";
               if (t) obj.text = t;
             }

             // Ensure color exists (some Data.defense buckets imply tier by container).
             if ((!obj.color || typeof obj.color !== "string") && fallbackColor) obj.color = fallbackColor;

             // Normalize type/group naming.
             if (!obj.type && obj.group) obj.type = obj.group;
             if (!obj.group && obj.type) obj.group = obj.type;

             // Ensure id exists (some data lines may not have one).
             if (!obj.id) {
               const uid = (Game && Game.Util && typeof Game.Util.uid === "function")
                 ? Game.Util.uid("arg")
                 : ("arg_" + Math.random().toString(36).slice(2));
               obj.id = uid;
             }

             // If we still don't have UI-visible text, treat as unusable.
             if (typeof obj.text !== "string" || !obj.text.trim()) return null;

             return obj;
           }

           let defensePicked = pickOne(candidates);
           if (!defensePicked) defensePicked = pickOne(usable);
           defensePicked = normalizeArg(defensePicked, oppPower);
           if (defensePicked) defensePicked = { ...defensePicked };

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
             const devOn = !!(Game && Game.UI && Game.UI.S && Game.UI.S.flags && Game.UI.S.flags.devChecks);
             if (devOn && console && typeof console.debug === "function") {
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

           // Determine outcome: prefer core compute if available.
           let outcome = "draw";
           if (typeof Core.computeOutcome === "function") {
             const raw = Core.computeOutcome(b, b.attack, defensePicked);
             outcome = normalizeOutcome(raw).outcome;
           } else {
             // Worst-case fallback: if same type -> lose for attacker, else draw
             const dt = (defensePicked && (defensePicked.type || defensePicked.group)) ? String(defensePicked.type || defensePicked.group) : "";
             const dtn = (dt === "yesno") ? "yn" : dt;
             outcome = (dtn === normType) ? "lose" : "draw";
           }

           if (typeof Core.finalize === "function") {
             Core.finalize(b.id, outcome);

             // Some core implementations may overwrite/normalize battle fields on finalize.
             // Ensure we keep the opponent's chosen defense for UI (including draw state).
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
      try {
        const opp = (Game.State && Game.State.players) ? Game.State.players[battle.opponentId] : null;
        const oppRole = String((opp && (opp.role || opp.type)) || "").toLowerCase();
        if (battle.fromThem && (oppRole === "toxic" || oppRole === "bandit")) {
          if (Game._ConflictCore && typeof Game._ConflictCore.computeOutcome === "function") {
            const outcome = Game._ConflictCore.computeOutcome(battle, battle.attack, picked);
            if (outcome === "lose" && Game._ConflictCore.applyVillainPenalty) {
              Game._ConflictCore.applyVillainPenalty(battle, "defense");
            } else if (outcome === "draw" && oppRole === "toxic") {
              // Block instant toxic hit when the answer type was correct.
              battle.toxicHitApplied = true;
            }
          }
        }
      } catch (_) {}

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

       // Determine outcome.
       const norm = normalizeOutcome(result);
       let outcome = norm.outcome;

       // If Args.resolve did not explicitly provide an outcome, compute from core.
       if ((!result || !norm.explicit) && typeof Core.computeOutcome === "function") {
         outcome = Core.computeOutcome(battle, battle.attack, defenseArg);
       }

       // Finalize in core (this will also start crowd vote for draws).
       if (typeof Core.finalize === "function") {
         Core.finalize(battle.id, outcome);

         // Ensure chosen defense remains attached for UI (draw vote still needs to show it).
         const bb = findBattle(battle.id);
         if (bb && !bb.defense) bb.defense = defenseArg || null;
         ensureCrowdVoteStarted(battle.id);
       } else {
         // Minimal fallback
         battle.resolved = true;
         battle.finished = true;
         battle.status = "finished";
         battle.result = outcome;
       }

       render();
       // Always return a minimal outcome payload if Args did not return anything.
       return result || { ok: true, outcome };
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
