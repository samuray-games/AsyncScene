//
//  ui-loops.js
//  AsyncScene
//
//  Created by Ray on 2025/12/17.
//

// ui-loops.js
window.Game = window.Game || {};

(() => {
  function boot() {
    // Wait until UI core exists (prevents "loops never attached" when script order changes).
    if (!window.Game || !Game.UI || !Game.UI.S) {
      setTimeout(boot, 60);
      return;
    }

    const UI = Game.UI;
    const S = UI.S;

    // Guard: ensure exactly one NPC reaction per player message
    let lastReactedMsgId = null;

    // Prevent duplicate loop scheduling if boot() runs more than once.
    if (UI._loopsBound) return;

    // Wait until chat append API exists (prevents crashing wrapper & silent chat)
    if (typeof UI.pushChat !== "function") {
      setTimeout(boot, 60);
      return;
    }

    UI._loopsBound = true;


    if (!Game.Events) {
      console.warn("Game.Events is not ready, ui-loops will use fallback event maker.");
    }

    let npcChatTimer = null;
    let npcBattleTimer = null;
    let npcEventTimer = null;
    let npcEventTickTimer = null;
    let npcDmTimer = null;
    let npcRematchTimer = null;
    let npcRematchRequestTimer = null;

    // Rate-limited warn helper (prevents console spam but keeps visibility)
    const _warnAt = Object.create(null);
    function warnOnce(key, msg, err) {
      const now = Date.now();
      if (_warnAt[key] && (now - _warnAt[key]) < 5000) return;
      _warnAt[key] = now;
      try {
        if (err) console.warn(msg, err);
        else console.warn(msg);
      } catch (_) {}
    }

    function getStateSafe() {
      return (window.Game && Game.State) ? Game.State : null;
    }

    function getNpcRuntime() {
      const st = getStateSafe();
      if (!st) return null;
      if (!st.npc) st.npc = {};
      return st.npc;
    }

    function canNpcEventAct() {
      const npc = getNpcRuntime();
      if (!npc) return true;
      const cd = Number.isFinite(npc.eventCooldownMs) ? npc.eventCooldownMs : 24000;
      return Date.now() - (npc.lastEventAt || 0) >= cd;
    }

    function markNpcEventAct() {
      const npc = getNpcRuntime();
      if (!npc) return;
      npc.lastEventAt = Date.now();
    }

    function canNpcBattleAct() {
      const npc = getNpcRuntime();
      if (!npc) return true;
      const cd = Number.isFinite(npc.battleCooldownMs) ? npc.battleCooldownMs : 25000;
      return Date.now() - (npc.lastBattleAt || 0) >= cd;
    }

    function markNpcBattleAct() {
      const npc = getNpcRuntime();
      if (!npc) return;
      npc.lastBattleAt = Date.now();
    }

    function getEventsArraySafe() {
      const st = getStateSafe();
      if (st && Array.isArray(st.events)) return st.events;
      if (st && st.S && Array.isArray(st.S.events)) return st.S.events;
      if (S && Array.isArray(S.events)) return S.events;
      return null;
    }

    function isActiveTieEvent(ev) {
      if (!ev) return false;

      // Player vote must NEVER stop NPC voting. Only time/end or explicit resolution should.
      // (We intentionally do not look at ev.playerVoted here.)

      const kind = ev.kind ? String(ev.kind) : "";
      const status = ev.status ? String(ev.status) : "";
      const isTieKind = kind === "tie" || kind === "draw" || kind === "crowd" || kind === "npcTie" || kind === "escape";

      const crowd = ev.crowd || ev.vote || ev.votes;
      const endsAt = ev.endsAt || ev.endsAtMs || ev.until || ev.deadlineAt;
      const now = Date.now();
      const endsAtMs = (typeof endsAt === "number") ? endsAt : NaN;

      // If endsAt is missing, we cannot safely auto-vote.
      if (!Number.isFinite(endsAtMs)) return false;

      // After deadline - no more voting.
      if (endsAtMs <= now) return false;

      // If explicitly resolved/decided, stop voting even if endsAt is in the future.
      // IMPORTANT: do not confuse "playerVoted" with resolution.
      const resolvedFlag = !!(ev.resolved || ev.isResolved || ev.done || ev.finalized);
      const crowdDecided = !!(crowd && (crowd.decided || crowd.isDecided || crowd.winnerId));
      if (resolvedFlag || crowdDecided) return false;

      // Some implementations set status to "closed"/"resolved" immediately after the player clicks.
      // We still want NPC votes to continue until endsAt unless the event is truly resolved.
      const statusLower = status ? status.toLowerCase() : "";
      const isActiveStatus = statusLower === "active" || statusLower === "open" || statusLower === "voting" || statusLower === "crowd";

      // If we have a crowd container and we are before endsAt, treat as active voting.
      // Prefer tie kind or explicit isTie marker, but do not hard-fail on status changes.
      return !!crowd && (isTieKind || !!ev.isTie || isActiveStatus);
    }

    function ensureCrowdShape(ev) {
      // Normalise a minimal crowd/vote container without breaking existing schema.
      if (!ev) return null;
      if (!ev.crowd && (ev.vote || ev.votes)) ev.crowd = ev.vote || ev.votes;
      if (!ev.crowd) ev.crowd = {};
      const c = ev.crowd;
      if (c.votesA == null && c.aVotes != null) c.votesA = c.aVotes;
      if (c.votesB == null && c.bVotes != null) c.votesB = c.bVotes;
      if (typeof c.votesA !== "number") c.votesA = 0;
      if (typeof c.votesB !== "number") c.votesB = 0;
      if (!c.voters) c.voters = {};
      return c;
    }

    function getNpcPoolSafe() {
      try {
        if (Game.NPC && typeof Game.NPC.getAll === "function") return Game.NPC.getAll() || [];
      } catch (_) {}
      const st = getStateSafe();
      if (st && st.players) {
        return Object.keys(st.players)
          .map(id => ({ id, ...(st.players[id] || {}) }))
          .filter(p => p && p.id && p.id !== "me" && p.name);
      }
      return [];
    }

    function shouldNpcVoteForEvent(ev) {
      // Rate limit NPC voting per event to avoid bursts and UI spam.
      const now = Date.now();
      const last = ev._npcVoteTickAt || 0;
      // NOTE: playerVoted must NOT be used here as a stop-flag (it only blocks repeat player votes in UI).
      // At most one batch per ~900ms.
      if (now - last < 900) return false;
      ev._npcVoteTickAt = now;
      return true;
    }

    function autoNpcVoteFallback() {
      const eventsArr = getEventsArraySafe();
      if (!eventsArr || eventsArr.length === 0) return;

      const npcPool = getNpcPoolSafe();
      if (!npcPool || npcPool.length === 0) return;

      const now = Date.now();
      for (const ev of eventsArr) {
        if (!isActiveTieEvent(ev)) continue;
        if (!shouldNpcVoteForEvent(ev)) continue;

        const c = ensureCrowdShape(ev);
        if (!c) continue;

        // Determine sides identifiers (best-effort)
        const aId = c.aId || ev.aId || ev.leftId || (ev.a && ev.a.id) || ev.a;
        const bId = c.bId || ev.bId || ev.rightId || (ev.b && ev.b.id) || ev.b;
        if (!aId || !bId) continue;

        // Decide how many NPC votes to add this tick: 1-3, but keep it light.
        const toAdd = 1;

        for (let i = 0; i < toAdd; i++) {
          // Pick a random NPC voter that hasn't voted yet in this event.
          let voter = null;
          for (let tries = 0; tries < 6; tries++) {
            const cand = npcPool[Math.floor(Math.random() * npcPool.length)];
            const vid = cand && (cand.id || cand.npcId || cand.speakerId || cand.name);
            if (!vid) continue;
            if (c.voters && c.voters[vid]) continue;
            voter = cand;
            break;
          }
          if (!voter) break;

          const vid = voter.id || voter.npcId || voter.speakerId || voter.name;
          const inf = (typeof voter.influence === "number") ? voter.influence : (typeof voter.power === "number" ? voter.power : 0);

          // Weighted leaning: higher influence slightly more likely to vote for higher influence side.
          // Compute side influence best-effort from state.
          let aInf = 0;
          let bInf = 0;
          try {
            const st = getStateSafe();
            if (st && st.players) {
              const ap = st.players[aId];
              const bp = st.players[bId];
              aInf = ap && typeof ap.influence === "number" ? ap.influence : 0;
              bInf = bp && typeof bp.influence === "number" ? bp.influence : 0;
            }
          } catch (_) {}

          const bias = (aInf === bInf) ? 0.5 : (aInf > bInf ? 0.55 : 0.45);
          // Add a tiny randomness based on voter influence so crowd feels alive.
          const wobble = Math.max(-0.08, Math.min(0.08, (Math.random() - 0.5) * (0.12 + Math.min(0.18, inf / 200))));
          const pA = Math.max(0.1, Math.min(0.9, bias + wobble));

          const voteForA = Math.random() < pA;
          if (voteForA) c.votesA += 1;
          else c.votesB += 1;

          c.voters[vid] = voteForA ? aId : bId;
        }

        // Mark for UI to re-render counts immediately.
        ev._dirty = true;
      }

      // Keep Events UI updating without full-page rerender (prevents battles flicker).
      try {
        if (Game.UI && typeof Game.UI.renderEvents === "function") Game.UI.renderEvents();
        else if (Game.UI && typeof Game.UI.requestRenderAll === "function") Game.UI.requestRenderAll();
        else if (Game.UI && typeof Game.UI.renderAll === "function") Game.UI.renderAll();
      } catch (_) {}
    }

    // Helper: is the session started (prefer canonical Game.State)
    const isLive = () => {
      const st = (window.Game && Game.State) ? Game.State : null;
      if (st && st.me && st.me.name) return true;
      return !!(S && S.me && S.me.name);
    };

    // Helper: avoid re-rendering the UI only while the player is actively choosing a button.
    // IMPORTANT: do NOT block during draw/crowd/crowdVote, otherwise timers freeze at "0s".
    const isInBattleDecision = () => {
      const st = (window.Game && Game.State) ? Game.State : null;
      const battles = st && Array.isArray(st.battles) ? st.battles : null;
      if (!battles || battles.length === 0) return false;
      return battles.some(b => {
        const s = b && b.status ? String(b.status) : "";
        return s === "pickAttack" || s === "pickDefense";
      });
    };

    // Separate guard: any battle state at all (used only where we truly must pause spam)
    const hasAnyBattleState = () => {
      const st = (window.Game && Game.State) ? Game.State : null;
      const battles = st && Array.isArray(st.battles) ? st.battles : null;
      if (!battles || battles.length === 0) return false;
      return battles.some(b => !!(b && b.status));
    };

    UI.stopLoops = () => {
      if (npcChatTimer) clearTimeout(npcChatTimer);
      if (npcBattleTimer) clearTimeout(npcBattleTimer);
      if (npcEventTimer) clearTimeout(npcEventTimer);
      if (npcEventTickTimer) clearTimeout(npcEventTickTimer);
      if (npcDmTimer) clearTimeout(npcDmTimer);
      if (npcRematchTimer) clearTimeout(npcRematchTimer);
      if (npcRematchRequestTimer) clearTimeout(npcRematchRequestTimer);

      npcChatTimer = null;
      npcBattleTimer = null;
      npcEventTimer = null;
      npcEventTickTimer = null;
      npcDmTimer = null;
      npcRematchTimer = null;
      npcRematchRequestTimer = null;
    };

    UI.startLoops = () => {
      UI.stopLoops();

      // If called before login, keep retrying until the player appears.
      if (!isLive()) {
        npcChatTimer = setTimeout(() => UI.startLoops(), 250);
        return;
      }

      // Apply canonical NPC cooldowns (tempo reduced x2 vs v1.0)
      try {
        if (Game.StateAPI && typeof Game.StateAPI.setNpcCooldowns === "function") {
          // Chat roughly 3-20s, actions roughly 25-55s (x2 activity)
          Game.StateAPI.setNpcCooldowns({ chatMs: 3000, actionMs: 25000 });
        }
      } catch (_) {}
      try {
        const npc = getNpcRuntime();
        if (npc) {
          if (!Number.isFinite(npc.eventCooldownMs)) npc.eventCooldownMs = 24000;
          if (!Number.isFinite(npc.battleCooldownMs)) npc.battleCooldownMs = 25000;
        }
      } catch (_) {}

      scheduleNpcEventTick();
      scheduleNpcEvent();
      scheduleNpcChat();
      scheduleNpcDm();
      scheduleNpcBattle();
      scheduleNpcRematchResponse();
      scheduleNpcRematchRequest();
    };

    // Auto-start loops once they are defined. startLoops() will self-retry until player name exists.
    try {
      UI.startLoops();
    } catch (_) {}

    function scheduleNpcChat() {
      // Chat tempo: 3-20s (x2 activity).
      const delay = 3000 + Math.floor(Math.random() * 17001);

      npcChatTimer = setTimeout(() => {
        // If we are not live anymore, do not die: retry.
        if (!isLive()) {
          scheduleNpcChat();
          return;
        }

        // Don't inject NPC chat while the player is clicking battle options.
        if (isInBattleDecision()) {
          npcChatTimer = setTimeout(() => scheduleNpcChat(), 1200);
          return;
        }

        // Global NPC chat cooldown guard (prevents bursts across restarts)
        try {
          if (Game.StateAPI && typeof Game.StateAPI.canNpcChat === "function" && !Game.StateAPI.canNpcChat()) {
            npcChatTimer = setTimeout(() => scheduleNpcChat(), 1200);
            return;
          }
        } catch (_) {}

        if (!S.lastPlayerMessageAt || Date.now() - S.lastPlayerMessageAt > 1200) {
          try {
            if (Game.NPC && typeof Game.NPC.randomAny === "function" && typeof Game.NPC.generateChatLine === "function") {
              let npc = (typeof Game.NPC.randomForChat === "function") ? Game.NPC.randomForChat() : Game.NPC.randomAny();
              // Ensure cop appears occasionally in public chat.
              if (Game.NPC.getCop && Math.random() < 0.12) {
                const cop = Game.NPC.getCop();
                if (cop) npc = cop;
              }
              // Bandit speaks rarer than Toxic; Mafioso is extremely rare and event-like
              if (npc && npc.role === "bandit" && Math.random() < 0.5) {
                scheduleNpcChat();
                return;
              }
              if (npc && npc.role === "mafia" && Math.random() < 0.85) {
                scheduleNpcChat();
                return;
              }
              if (npc && npc.name) {
                try {
                  if (Game.StateAPI && typeof Game.StateAPI.isNpcJailed === "function" && Game.StateAPI.isNpcJailed(npc.id)) {
                    scheduleNpcChat();
                    return;
                  }
                } catch (_) {}
                const text = Game.NPC.generateChatLine(npc);
                if (text != null && String(text).trim().length > 0) {
                  UI.pushChat({ name: npc.name, text: String(text), system: false });
                  try { if (Game.StateAPI && typeof Game.StateAPI.markNpcChat === "function") Game.StateAPI.markNpcChat(); } catch (_) {}
                }
              }
            }
          } catch (e) {
            // Keep loops alive, but surface errors occasionally.
            warnOnce("npcChat", "[ui-loops] NPC chat loop error", e);
          }
        }

        scheduleNpcChat();
      }, delay);
    }

    function scheduleNpcDm() {
      const delay = 70_000 + Math.floor(Math.random() * 50_000);
      npcDmTimer = setTimeout(() => {
        if (!isLive()) {
          scheduleNpcDm();
          return;
        }
        try {
          const st = getStateSafe();
          if (!st) { scheduleNpcDm(); return; }
          st.npc = st.npc || {};
          const last = st.npc.lastDmAt || 0;
          if (Date.now() - last < 60_000) { scheduleNpcDm(); return; }

          const npc = (Game.NPC && typeof Game.NPC.pickReactingNpc === "function")
            ? Game.NPC.pickReactingNpc()
            : null;
          if (!npc || !npc.id || !npc.name) { scheduleNpcDm(); return; }
          if (Game.StateAPI && typeof Game.StateAPI.isNpcJailed === "function" && Game.StateAPI.isNpcJailed(npc.id)) {
            scheduleNpcDm();
            return;
          }

          let text = "";
          if (Game.NPC) {
            if (npc.role === "toxic" || npc.role === "bandit") {
              text = (typeof Game.NPC.generateVillainQuestion === "function")
                ? Game.NPC.generateVillainQuestion(npc)
                : "";
              st.dm = st.dm || {};
              st.dm.villainQuestion = st.dm.villainQuestion || {};
              if (text) st.dm.villainQuestion[npc.id] = true;
            } else if (typeof Game.NPC.generateDmLine === "function") {
              text = Game.NPC.generateDmLine(npc);
            }
          }
          if (text && Game.StateAPI && typeof Game.StateAPI.pushDm === "function") {
            Game.StateAPI.pushDm(npc.id, npc.name, String(text), { isSystem: false, playerId: npc.id });
            st.npc.lastDmAt = Date.now();
            if (UI && typeof UI.openDMBySpeakerId === "function") UI.openDMBySpeakerId(npc.id);
            if (UI && typeof UI.setPanelSize === "function") UI.setPanelSize("dm", "medium");
          }
        } catch (_) {}
        scheduleNpcDm();
      }, delay);
    }

    function pickBattleOpponentId(excludeIds) {
      const st = (window.Game && Game.State) ? Game.State : null;
      const players = st && st.players ? st.players : null;
      if (!players) return null;

      const ids = Object.keys(players).filter(id => {
        if (!id || id === "me") return false;
        if (excludeIds && excludeIds.has(id)) return false;
        return true;
      });
      if (ids.length === 0) return null;

      // Exclude only roles that should not auto-start battles.
      const eligible = ids.filter(id => {
        const p = players[id];
        const isNpc = !!(p && (p.npc === true || p.type === "npc"));
        if (!isNpc) return false;
        const role = (p && (p.role || p.type)) ? String(p.role || p.type) : "";
        try {
          if (Game.StateAPI && typeof Game.StateAPI.isNpcJailed === "function" && Game.StateAPI.isNpcJailed(id)) return false;
        } catch (_) {}
        try {
          const cdMap = st.battleCooldowns || {};
          const last = cdMap[id] || 0;
          if (last && (Date.now() - last) < 3 * 60 * 1000) return false;
        } catch (_) {}
        return role !== "cop" && role !== "police" && role !== "mafioso" && role !== "mafia";
      });

      const pool = eligible.length ? eligible : ids;
      if (!pool.length) return null;

      // Weighted pick: Toxic is more likely to be selected as an initiator, but no spam.
      // Uses Util.pickWeighted if present.
      const meInf = st && st.me && Number.isFinite(st.me.influence) ? (st.me.influence | 0) : 0;
      const revengeUntil = (st && st.revengeUntil) ? (st.revengeUntil | 0) : 0;
      const revengeOn = Date.now() < revengeUntil;

      const w = pool.map(id => {
        const p = players[id];
        const role = (p && (p.role || p.type)) ? String(p.role || p.type) : "";
        const oppInf = (p && Number.isFinite(p.influence)) ? (p.influence | 0) : 0;
        let weight = 1;
        if (role === "toxic") weight = 1.0;
        else if (role === "bandit") weight = 0.8;
        else if (role === "cop" || role === "police") weight = 0;

        // If my influence is much higher, reduce chances from weaker NPCs.
        const diff = meInf - oppInf;
        if (diff >= 10) weight *= 0.1;
        else if (diff >= 6) weight *= 0.3;
        else if (diff >= 3) weight *= 0.6;

        // Revenge spike after jail: toxic/bandit appear more often.
        if (revengeOn && (role === "toxic" || role === "bandit")) weight *= 2.0;
        return { item: id, weight };
      }).filter(x => x.weight > 0);

      if (!w.length) return pool[Math.floor(Math.random() * pool.length)];

      if (Game.Util && typeof Game.Util.pickWeighted === "function") {
        return Game.Util.pickWeighted(w);
      }

      // Fallback weighted pick
      let sum = 0;
      for (const x of w) sum += x.weight;
      let r = Math.random() * sum;
      for (const x of w) {
        r -= x.weight;
        if (r <= 0) return x.item;
      }
      return w[w.length - 1].item;
    }

    function scheduleNpcRematchResponse() {
      // Check pending rematch requests every 3-8s and auto-respond from NPC side
      const delay = 3000 + Math.floor(Math.random() * 5001);
      npcRematchTimer = setTimeout(() => {
        if (!isLive()) {
          scheduleNpcRematchResponse();
          return;
        }

        try {
          const st = getStateSafe();
          if (!st || !Array.isArray(st.battles)) {
            scheduleNpcRematchResponse();
            return;
          }

          // Find battles with pending rematch requests where responder is NPC
          for (const b of st.battles) {
            if (!b || !b.rematch) continue;
            const rem = b.rematch;
            if (!rem.requestedAt || rem.decided === true) continue;

            // Check if responder (opponentId) is NPC
            const responderId = rem.opponentId || null;
            if (!responderId || responderId === "me") continue;

            const responder = (st.players && st.players[responderId]) ? st.players[responderId] : null;
            const isNpc = !!(responder && (responder.npc === true || responder.type === "npc"));
            if (!isNpc) continue;

            // Check if enough time passed since request (2-5s delay for realism)
            const elapsed = Date.now() - (rem.requestedAt || 0);
            const minDelay = 2000 + Math.floor(Math.random() * 3001);
            if (elapsed < minDelay) continue;

            // NPC decision: accept with some probability (70% accept, 30% decline)
            const acceptProb = 0.7;
            const accept = Math.random() < acceptProb;

            // Call respondRematch via API (pass responderId for NPC)
            if (Game.Conflict && typeof Game.Conflict.respondRematch === "function") {
              try {
                const result = Game.Conflict.respondRematch(b.id, accept, responderId);
                if (result && result.ok) {
                  // Optional: add NPC chat line about rematch decision
                  try {
                    if (responder && responder.name && UI && typeof UI.pushChat === "function") {
                      const line = accept ? "давай ещё раз" : "не, хватит";
                      UI.pushChat({ name: responder.name, text: line, system: false });
                    }
                  } catch (_) {}
                }
              } catch (e) {
                warnOnce("npcRematch", "[ui-loops] NPC rematch response error", e);
              }
            }
          }
        } catch (e) {
          warnOnce("npcRematchLoop", "[ui-loops] NPC rematch loop error", e);
        }

        scheduleNpcRematchResponse();
      }, delay);
    }

    function scheduleNpcRematchRequest() {
      // NPCs request rematch after losing (with escalating cost) every 10-20s
      const delay = 10000 + Math.floor(Math.random() * 10001);
      npcRematchRequestTimer = setTimeout(() => {
        if (!isLive()) {
          scheduleNpcRematchRequest();
          return;
        }

        try {
          const st = getStateSafe();
          if (!st || !Array.isArray(st.battles)) {
            scheduleNpcRematchRequest();
            return;
          }

          // Find resolved battles where NPC lost (eligible for rematch).
          const eligibleBattles = st.battles.filter(b => {
            if (!b || !b.resolved || b.rematchOf) return false;
            // NPC lost if: result="win" and fromThem=true (player won incoming battle)
            // OR result="lose" and fromThem=false (player won outgoing battle)
            const npcLost = (b.result === "win" && b.fromThem === true) || (b.result === "lose" && b.fromThem === false);
            if (!npcLost) return false;

            // Check if opponent is NPC
            const npcId = b.opponentId;
            if (!npcId || npcId === "me") return false;
            const npc = (st.players && st.players[npcId]) ? st.players[npcId] : null;
            const isNpc = !!(npc && (npc.npc === true || npc.type === "npc"));
            if (!isNpc) return false;

            // Skip if there's already an undecided rematch request
            if (b.rematch && b.rematch.requestedAt && b.rematch.decided !== true) return false;

            return true;
          });

          if (eligibleBattles.length === 0) {
            scheduleNpcRematchRequest();
            return;
          }

          // Pick a random eligible battle
          const b = eligibleBattles[Math.floor(Math.random() * eligibleBattles.length)];
          const npcId = b.opponentId;
          const npc = (st.players && st.players[npcId]) ? st.players[npcId] : null;

          // 40% chance to request rematch
          if (Math.random() < 0.4) {
            try {
              if (Game.Conflict && typeof Game.Conflict.requestRematch === "function") {
                const result = Game.Conflict.requestRematch(b.id, npcId);
                if (result && result.ok) {
                  // Optional: add NPC chat line about requesting rematch
                  try {
                    if (npc && npc.name && UI && typeof UI.pushChat === "function") {
                      const lines = ["ещё раз?", "давай по новой", "не сдаюсь", "реванш"];
                      const line = lines[Math.floor(Math.random() * lines.length)];
                      UI.pushChat({ name: npc.name, text: line, system: false });
                    }
                  } catch (_) {}
                }
              }
            } catch (e) {
              warnOnce("npcRematchReq", "[ui-loops] NPC rematch request error", e);
            }
          }
        } catch (e) {
          warnOnce("npcRematchReqLoop", "[ui-loops] NPC rematch request loop error", e);
        }

        scheduleNpcRematchRequest();
      }, delay);
    }

    function scheduleNpcBattle() {
      // Battle tempo: 50-110s (slower cadence x2).
      npcBattleTimer = setTimeout(() => {
        if (!isLive()) {
          scheduleNpcBattle();
          return;
        }

        // Don't start new incoming battles while the player is choosing in an active battle.
        if (isInBattleDecision()) {
          npcBattleTimer = setTimeout(() => scheduleNpcBattle(), 1500);
          return;
        }

        // Global NPC action cooldown guard
        if (!canNpcBattleAct()) {
          npcBattleTimer = setTimeout(() => scheduleNpcBattle(), 1500);
          return;
        }

        if (!Game.Conflict || typeof Game.Conflict.incoming !== "function") {
          warnOnce("noIncoming", "[ui-loops] Game.Conflict.incoming is not available yet (check script order)");
        }

        try {
          if (Game.Conflict && typeof Game.Conflict.incoming === "function") {
            const tried = new Set();
            let battle = null;
            let oppId = null;
            for (let i = 0; i < 3; i++) {
              oppId = pickBattleOpponentId(tried);
              if (!oppId) break;
              tried.add(oppId);
              // Compatibility: some builds accept (id) only
              try {
                battle = Game.Conflict.incoming(oppId, { pinned: false });
              } catch (_) {
                battle = Game.Conflict.incoming(oppId);
              }
              if (battle) break;
            }

            if (battle && oppId) {
              markNpcBattleAct();
              try { if (Game.StateAPI && typeof Game.StateAPI.markNpcAction === "function") Game.StateAPI.markNpcAction(); } catch (_) {}
              // If Bandit initiated, add a short local cooldown to avoid clustering
              try {
                const st2 = (window.Game && Game.State) ? Game.State : null;
                const p2 = st2 && st2.players ? st2.players[oppId] : null;
                if (p2 && p2.role === "bandit" && Game.StateAPI && typeof Game.StateAPI.markNpcAction === "function") {
                  // extra mark to space out bandit appearances
                  Game.StateAPI.markNpcAction();
                }
              } catch (_) {}
              // Extra spacing for Mafioso to avoid clustering
              try {
                const st3 = (window.Game && Game.State) ? Game.State : null;
                const p3 = st3 && st3.players ? st3.players[oppId] : null;
                if (p3 && p3.role === "mafia" && Game.StateAPI && typeof Game.StateAPI.markNpcAction === "function") {
                  // double mark to extend cooldown window
                  Game.StateAPI.markNpcAction();
                }
              } catch (_) {}

              // Optional: add a short NPC line when a battle is created.
              const st = (window.Game && Game.State) ? Game.State : null;
              const p = st && st.players ? st.players[oppId] : null;
              if (p && p.name) {
                try {
                  if (Game.NPC && typeof Game.NPC.generateChatLine === "function") {
                    const line = Game.NPC.generateChatLine(p);
                    if (line != null && String(line).trim().length > 0) {
                      UI.pushChat({ name: p.name, text: String(line), system: false });
                    }
                  }
                } catch (_) {}
              }
            }
          }
        } catch (e) {
          warnOnce("npcBattle", "[ui-loops] NPC battle loop error", e);
        }

        scheduleNpcBattle();
      }, 25000 + Math.floor(Math.random() * 30001));
    }

    function pickSafeEventNpc() {
      // Prefer deterministic list if available
      if (Game.NPC && typeof Game.NPC.getAll === "function") {
        const all = Game.NPC.getAll() || [];
        const safe = all.filter(p => {
          const roleRaw = (p && (p.role || p.type)) ? String(p.role || p.type) : "";
          const role = roleRaw.trim().toLowerCase();
          const name = (p && p.name) ? String(p.name).trim().toLowerCase() : "";
          // Exclude special/trap roles from events by default (normalize role + name fallbacks)
          if (role === "cop" || role === "police") return false;
          if (role === "bandit" || role === "toxic") return false;
          if (role === "mafioso" || role === "mafia") return false;
          // Name-based fallback (in case role is missing)
          if (name === "cop" || name === "коп" || name.includes("коп")) return false;
          return true;
        });
        if (safe.length >= 2) return safe[Math.floor(Math.random() * safe.length)];
        if (safe.length === 1) return safe[0];
      }
      // Fallback
      if (Game.NPC && typeof Game.NPC.randomNonCop === "function") return Game.NPC.randomNonCop();
      if (Game.NPC && typeof Game.NPC.randomAny === "function") return Game.NPC.randomAny();
      return null;
    }

    function scheduleNpcEventTick() {
      // Keep Events timers moving so NPC-NPC draw votes can resolve.
      // Very light cadence, and pauses while player is choosing battle options.
      npcEventTickTimer = setTimeout(() => {
        try {
          if (!isLive()) {
            scheduleNpcEventTick();
            return;
          }
          if (Game && Game.Debug && Game.Debug.PAUSE_EVENTS === true) {
            scheduleNpcEventTick();
            return;
          }
          // Tick events (timers, resolution) on every cadence.
          if (Game.Events && typeof Game.Events.tick === "function") {
            Game.Events.tick();
          }

          // Some builds split vote ticking into a separate function.
          // If present, keep it running regardless of whether the player already voted.
          if (Game.Events && typeof Game.Events.tickVotes === "function") {
            Game.Events.tickVotes();
          }

          // IMPORTANT:
          // Do NOT duplicate NPC voting simulation here.
          // `events.js/Events.tick()` already simulates NPC votes and requests render when needed.
          // Duplicating it here causes render storms and can freeze Safari (especially with DevTools open).
        } catch (e) {
          warnOnce("eventsTick", "[ui-loops] Events.tick error", e);
        }
        scheduleNpcEventTick();
      }, 600);
    }

    function makeNpcEventFallback(aId, bId) {
      // If a dedicated events module is missing, create a basic tie-vote event via UI.
      // This prevents "events silent" when Game.Events is not wired yet.
      const endsAtMs = Date.now() + 30000;
      if (typeof UI.signalTieBetween === "function") {
        UI.signalTieBetween(aId, bId, endsAtMs);
      }
    }

    function scheduleNpcEvent() {
      // Events cadence: fixed 24s (x2 activity).
      npcEventTimer = setTimeout(() => {
        if (!isLive()) {
          scheduleNpcEvent();
          return;
        }
        if (Game && Game.Debug && Game.Debug.PAUSE_EVENTS === true) {
          scheduleNpcEvent();
          return;
        }

        // Don't create/announce events only while the player is actively choosing a button.
        // Draw/crowd votes are fine and must not freeze timers.
        if (isInBattleDecision()) {
          npcEventTimer = setTimeout(() => scheduleNpcEvent(), 1500);
          return;
        }

        // Global NPC action cooldown guard
        if (!canNpcEventAct()) {
          npcEventTimer = setTimeout(() => scheduleNpcEvent(), 1500);
          return;
        }

        const a = pickSafeEventNpc();
        let b = pickSafeEventNpc();

        if (!a || !b) {
          scheduleNpcEvent();
          return;
        }

        // Avoid duplicates
        if (b.id === a.id) {
          let tries = 0;
          while (tries < 6 && b && a && b.id === a.id) {
            b = pickSafeEventNpc();
            tries += 1;
          }
        }

        if (!a || !b || a.id === b.id) {
          scheduleNpcEvent();
          return;
        }

        try {
          let createdEventId = null;

          let added = false;
          if (Game.Events && typeof Game.Events.makeNpcEvent === "function") {
            const useEscape = Math.random() < 0.35;
            let ev = null;
            if (useEscape && typeof Game.Events.makeNpcEscapeEvent === "function") {
              ev = Game.Events.makeNpcEscapeEvent(a.id, b.id);
            }
            if (!ev) ev = Game.Events.makeNpcEvent(a.id, b.id);
            if (ev) {
              createdEventId = ev.id || ev.eventId || null;
              if (Game.Events && typeof Game.Events.addEvent === "function") {
                Game.Events.addEvent(ev);
              }
              added = !!(createdEventId && Game.State && Array.isArray(Game.State.events)
                && Game.State.events.some(x => x && x.id === createdEventId));
            }
          } else {
            // Fallback maker might not return an id
            makeNpcEventFallback(a.id, b.id);
            added = true;
          }

          // Announce the tie in chat with a clickable CTA bound to eventId (if available)
          try {
            if (added) {
              const aName = a && a.name ? String(a.name) : "";
              const bName = b && b.name ? String(b.name) : "";
              const ev = createdEventId ? (Game.State.events || []).find(x => x && (x.id === createdEventId)) : null;
              const isEscape = !!(ev && (ev.kind === "escape" || ev.type === "escape"));
              const extra = (aName && bName)
                ? ("выбирай, за кого топишь: " + aName + " или " + bName + ".")
                : "выбирай, за кого топишь.";
              if (!isEscape && createdEventId && UI && typeof UI.pushTieCtaToChat === "function") {
                UI.pushTieCtaToChat(createdEventId, extra);
              } else if (UI && typeof UI.pushChat === "function") {
                const text = isEscape
                  ? (ev && ev.text ? String(ev.text) : "Толпа решает: свалить или остаться.")
                  : ("Тут ничья!!! " + extra);
                UI.pushChat({ name: "Система", text, system: true, isSystem: true, eventId: createdEventId || null });
              }
            }
          } catch (_) {}

          // Nudge the events system to compute initial remaining time immediately
          try {
            if (Game.Events && typeof Game.Events.tick === "function") Game.Events.tick();
          } catch (_) {}

          if (added) {
            markNpcEventAct();
            try { if (Game.StateAPI && typeof Game.StateAPI.markNpcAction === "function") Game.StateAPI.markNpcAction(); } catch (_) {}
          }
        } catch (e) {
          warnOnce("npcEvent", "[ui-loops] NPC event loop error", e);
        }

        scheduleNpcEvent();
      }, 24000);
    }

    // Hook into player chat sending to add exactly one NPC reaction per player message
    const originalPushChat = UI.pushChat;
    UI.pushChat = function(msg) {
      // Always append the message first
      try {
        originalPushChat.call(UI, msg);
      } catch (e) {
        warnOnce("pushChatWrap", "[ui-loops] UI.pushChat wrapper failed (originalPushChat)", e);
        return;
      }

      try {
        // Detect player message robustly using the pushed msg + current state
        const meName = (S && S.me && S.me.name) ? String(S.me.name) : "";
        const isMeMsg = !!(msg && (
          msg.from === "me" ||
          msg.speakerId === "me" ||
          (meName && String(msg.name || "") === meName && !msg.system)
        ));

        if (!isMeMsg) return;

        const msgId = (msg && msg.id != null) ? String(msg.id) : ("me-" + Date.now() + "-" + Math.random().toString(16).slice(2));
        if (msgId === lastReactedMsgId) return;
        lastReactedMsgId = msgId;
        S.lastPlayerMessageAt = Date.now();

        if (!(Game.NPC && typeof Game.NPC.generateReactionToMe === "function")) return;

        // Pick reacting NPC (prefer dedicated picker, else fallback)
        let npc = null;
        try {
          if (Game.NPC.pickReactingNpc) npc = Game.NPC.pickReactingNpc();
          else if (Game.NPC.randomForChat) npc = Game.NPC.randomForChat();
          else if (Game.NPC.randomAny) npc = Game.NPC.randomAny();
        } catch (_) {}

        if (!npc || !npc.name) return;

        const text = Game.NPC.generateReactionToMe(npc, meName);
        if (text != null && String(text).trim().length > 0) {
          // Avoid recursive reaction: this call will go through wrapper but won't match isMeMsg
          UI.pushChat({ name: npc.name, text: String(text), system: false, speakerId: npc.id });
        }
      } catch (_) {}
    };

  }

  boot();
})();
