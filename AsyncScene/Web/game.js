// game.js
// Оркестратор: логин, старт, тикеры, события, NPC баттлы каждые 30с, чат-поток 0-10с.
window.Game = window.Game || {};
(() => {
  const Game = window.Game;
  if (!Game.Data) {
    console.error("[game.js] Game.Data is undefined. data.js is not loaded or failed.");
    return;
  }
  if (!Game.UI) {
    console.error("[game.js] Game.UI is undefined. UI core is not loaded.");
    return;
  }
  if (!Game.NPC) {
    console.error("[game.js] Game.NPC is undefined. npcs.js is not loaded.");
    return;
  }
  const D = Game.Data;
  const FLOW_STALE_SINCE = 1772946669418;
  const flowRefIds = new WeakMap();
  let flowRefSeq = 0;
  function flowRefId(obj){
    if (!obj || typeof obj !== "object") return "null";
    let id = flowRefIds.get(obj);
    if (!id) {
      flowRefSeq += 1;
      id = `game_ref_${flowRefSeq}`;
      flowRefIds.set(obj, id);
    }
    return id;
  }
  function flowAuditGameState(source){
    const src = String(source || "game.js");
    const s = (Game && Game.__S && typeof Game.__S === "object") ? Game.__S : null;
    const hasFlags = !!(s && s.securityFlags && typeof s.securityFlags === "object");
    const keys = hasFlags ? Object.keys(s.securityFlags).length : 0;
    try {
      console.log(`[FLOW_AUDIT] game-state-store source=${src} stateRef=${flowRefId(s)} hasSecurityFlags=${hasFlags ? "true" : "false"} keys=${keys}`);
    } catch (_) {}
    if (hasFlags) {
      const me = s.securityFlags.me;
      const since = Number(me && me.since);
      if (Number.isFinite(since) && since === FLOW_STALE_SINCE) {
        try {
          console.log(`[FLOW_AUDIT] stale-flag-fingerprint since=${FLOW_STALE_SINCE} action=return source=${src}`);
        } catch (_) {}
      }
    }
  }

  function flowAuditSecurityPolicy(source){
    const src = String(source || "game.js");
    const policy = (Game && Game.SecurityPolicy && typeof Game.SecurityPolicy === "object") ? Game.SecurityPolicy : null;
    if (!policy) return;
    const keys = Object.keys(policy).sort().join(",");
    const hasInspectFlag = (typeof policy.inspectFlag === "function");
    const hasInspectText = hasInspectFlag ? "true" : "false";
    const policyId = policy.__flowAuditId ? String(policy.__flowAuditId) : "unknown";
    try {
      console.log(`[FLOW_AUDIT] securitypolicy-export keys=${keys || "none"} hasInspectFlag=${hasInspectText}`);
    } catch (_) {}
    try {
      console.log(`[FLOW_AUDIT] policy-runtime-version source=${src} policyId=${policyId}`);
    } catch (_) {}
    if (!hasInspectFlag) {
      try {
        Game.__FLOW_AUDIT_POLICY_EXPORT_MISSING__ = { source: src, policyId, at: Date.now() };
      } catch (_) {}
      try {
        console.log(`[FLOW_AUDIT] inspectFlag-export-missing source=${src}`);
      } catch (_) {}
    }
  }

  Game.__S = {
    me: null,
    isStarted: false,
    locationId: "square",

    players: {},

    chat: [],
    dm: { open:false, partnerId:null, partnerName:null },
    dmMessages: [],

    battles: [],
    events: [],

    ui: { battlesOpen:true, eventsOpen:true },

    timers: { chat:null, npcBattle:null, events:null }
  };
  flowAuditGameState("game.js:init");
  flowAuditSecurityPolicy("game.js:init");

  function $(id){ return document.getElementById(id); }

  // Events subsystem lives in events.js.
  // Here we only call Game.Events APIs if they exist.
  Game.Events = Game.Events || {};

  // Core
  Game.Core = {
    login(name){
      flowAuditGameState("Game.Core.login:before");
      flowAuditSecurityPolicy("Game.Core.login:before");
      const nick = String(name||"").trim().toLowerCase();
      if (!nick) return false;

      // init players
      if (Game.NPC && typeof Game.NPC.seedPlayers === "function") {
        Game.NPC.seedPlayers(Game.__S);
      } else {
        console.error("[game.js] Game.NPC.seedPlayers is missing.");
        return false;
      }

      // IMPORTANT: `players` is the single source of truth. `me` must live inside it.
      const pStart = (Game.Data && Number.isFinite(Game.Data.START_POINTS_PLAYER))
        ? (Game.Data.START_POINTS_PLAYER | 0)
        : (Game.Data && Number.isFinite(Game.Data.POINTS_START))
          ? (Game.Data.POINTS_START | 0)
          : 0;
      Game.__S.players.me = {
        id: "me",
        name: nick,
        points: pStart,
        influence: 0,
        wins: 0,
        winsSinceInfluence: 0,
      };
      Game.__S.me = Game.__S.players.me;
      // Initialize REP via transferRep to keep moneyLog consistent (avoid direct writes).
      try {
        const cur = (Game && Game.__S && Number.isFinite(Game.__S.rep)) ? (Game.__S.rep | 0) : 0;
        if (cur > 0 && Game.__A && typeof Game.__A.transferRep === "function") {
          Game.__A.transferRep("me", "crowd_pool", cur, "rep_init_reset", null);
        } else {
          // If transferRep unavailable, avoid direct Game.__S.rep writes here.
          // Leave initialization to State layer / StateAPI to preserve logging invariants.
        }
      } catch (_) {
        // Swallow: avoid direct Game.__S.rep writes in catch to keep transferRep as single source of truth.
      }
      Game.__S.influence = 0;
      Game.__S.progress = { weeklyInfluenceGained: 0, weekStartAt: 0, lastDailyBonusAt: 0 };

      Game.__S.locationId = "square";
      Game.__S.chat = [];
      Game.__S.dmMessages = [];
      Game.__S.battles = [];
      Game.__S.events = [];

      Game.__S.isStarted = true;

      // show game, hide overlay
      $("screenLogin").classList.remove("active");
      $("screenLogin").style.display = "none";
      $("screenGame").hidden = false;

      // system join
      if (Game.UI && typeof Game.UI.pushSystem === "function") {
        Game.UI.pushSystem(D.SYS.join(nick));
      } else {
        console.error("[game.js] Game.UI.pushSystem is missing.");
      }

      // start tickers
      this.startTickers();

      if (Game.Events && typeof Game.Events.start === "function") {
        Game.Events.start();
      }

      // init UI safely
      if (Game.UI && typeof Game.UI.initAfterLogin === "function") {
        Game.UI.initAfterLogin();
      }
      if (Game.UI && typeof Game.UI.renderAll === "function") {
        Game.UI.renderAll();
      }
      flowAuditGameState("Game.Core.login:after");
      flowAuditSecurityPolicy("Game.Core.login:after");

      return true;
    },

    startTickers(){
      // Safety: never double-start tickers
      try{
        if (Game.__S.timers.chat) clearTimeout(Game.__S.timers.chat);
        if (Game.__S.timers.npcBattle) clearInterval(Game.__S.timers.npcBattle);
        if (Game.__S.timers.events) clearInterval(Game.__S.timers.events);
      }catch(_){ }

      // Chat поток NPC 0-10 сек
      const scheduleChat = () => {
        const ms = Math.floor(Math.random()*10001);
        Game.__S.timers.chat = setTimeout(() => {
          // random npc message
          const all = Object.values(Game.__S.players).filter(p => p && p.id !== "me");
          if (all.length && Game.UI && typeof Game.UI.pushChat === "function" && Game.NPC && typeof Game.NPC.npcTalkLine === "function"){
            const npc = all[Math.floor(Math.random()*all.length)];
            Game.UI.pushChat(npc.name, npc.influence, Game.NPC.npcTalkLine(npc), false);
          }
          scheduleChat();
        }, ms);
      };
      scheduleChat();

      // NPC вызывает на баттл каждые 30 сек
      Game.__S.timers.npcBattle = setInterval(() => {
        const ids = Object.keys(Game.__S.players).filter(id => id !== "me");
        if (!ids.length) return;
        // чаще гопник и бандит
        let pool = ids.slice();
        pool = pool.concat(ids.filter(id => id.startsWith("gop_")));
        pool = pool.concat(ids.filter(id => id.startsWith("ban_")));
        const oppId = pool[Math.floor(Math.random()*pool.length)];
        if (Game.Conflict && typeof Game.Conflict.incoming === "function") {
          Game.Conflict.incoming(oppId);
        }
      }, 30000);

      // События иногда (темп снижен)
      Game.__S.timers.events = setInterval(() => {
        if (Game.Events && typeof Game.Events.spawnNpcBattle === "function") {
          if (Math.random() < 0.7) Game.Events.spawnNpcBattle();
        }
      }, 20000);
    },

    maybeNpcRespond(){
      // лёгкий шанс, что кто-то в ответ вкинет
      if (Math.random() < 0.45){
        const all = Object.values(Game.__S.players).filter(p => p && p.id !== "me");
        const npc = all.length ? all[Math.floor(Math.random()*all.length)] : null;
        if (!npc) return;
        if (Game.UI && typeof Game.UI.pushChat === "function" && Game.NPC && typeof Game.NPC.npcTalkLine === "function") {
          Game.UI.pushChat(npc.name, npc.influence, Game.NPC.npcTalkLine(npc), false);
        }
      }
    },

    resetAll(){
      flowAuditGameState("Game.Core.resetAll:before");
      flowAuditSecurityPolicy("Game.Core.resetAll:before");
      // мягкий ресет в рамках страницы
      try{
        clearTimeout(Game.__S.timers.chat);
        clearInterval(Game.__S.timers.npcBattle);
        clearInterval(Game.__S.timers.events);
      }catch(_){}

      Game.__S.isStarted = false;

      location.reload();
    }
  };

  // Login bindings
  function bindLogin(){
    const start = () => {
      const ok = Game.Core.login($("inNick").value);
      if (!ok) $("inNick").focus();
    };

    $("btnStart").onclick = start;
    $("btnRandomNick").onclick = () => {
      const nicks = ["aki","neo","rin","kai","yuna","sora","mika","tori","niko","hara"];
      $("inNick").value = nicks[Math.floor(Math.random()*nicks.length)];
    };
    $("inNick").addEventListener("keydown", (e) => { if (e.key === "Enter") start(); });
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("btnStart")) {
      bindLogin();
    }
  });
})();
