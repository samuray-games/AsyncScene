//
//  ui-core.js
//  AsyncScene
//
//  Created by Ray on 2025/12/17.
//


// ui-core.js
window.Game = window.Game || {};

(() => {
  const Game = window.Game;
  const $ = (id) => document.getElementById(id);

  const UI = {};
  Game.UI = UI;

  // Safe no-op fallbacks (prevent silent breaks if module not loaded yet)
  UI.renderChatSmart = UI.renderChatSmart || function(){};
  UI.renderBattles = UI.renderBattles || function(){};
  UI.renderEvents = UI.renderEvents || function(){};
  UI.renderLocations = UI.renderLocations || function(){};
  UI.renderDM = UI.renderDM || function(){};
  UI.renderMenu = UI.renderMenu || function(){};

  // State
  // Важно: не перетираем уже существующий Game.State (его могли создать другие модули).
  // Вместо этого заполняем отсутствующие поля дефолтами.
  const S = Game.State = Game.State || {};

  // Дефолты верхнего уровня
  if (!("me" in S)) S.me = null; // создаётся ТОЛЬКО в ui-boot.js после старта
  if (!("locationId" in S)) S.locationId = "square";
  if (!("players" in S)) S.players = {};
  if (!("chat" in S)) S.chat = [];
  if (!("battles" in S)) S.battles = [];
  if (!("events" in S)) S.events = [];
  if (!("flags" in S) || !S.flags) S.flags = {};
  if (!("highlightEventId" in S.flags)) S.flags.highlightEventId = null;
  if (!("eventsCollapsed" in S.flags)) S.flags.eventsCollapsed = false;
  if (!("menuOpen" in S.flags)) S.flags.menuOpen = false;

  // Дефолты DM
  if (!("dm" in S) || !S.dm) S.dm = {};
  if (!("open" in S.dm)) S.dm.open = false;
  if (!("withId" in S.dm)) S.dm.withId = null;
  if (!("logs" in S.dm) || !S.dm.logs) S.dm.logs = {};
  if (!("inviteOpen" in S.dm)) S.dm.inviteOpen = false;
  if (!("copSilent" in S.dm)) S.dm.copSilent = true;
  if (!("aggro" in S.dm) || !S.dm.aggro) S.dm.aggro = {};

  function nowHHMM() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  }

  function escapeHtml(s){
    return String(s)
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;");
  }

  function getPlayerByName(name) {
    return Object.values(S.players || {}).find(p => p && p.name === name) || null;
  }

  function getPlayerById(id) {
    return (S.players && S.players[id]) ? S.players[id] : null;
  }

  function isCopSpeaker(name) {
    // Если имя совпало у нескольких, считаем копом только если найденный игрок именно role=cop
    const p = getPlayerByName(name);
    return !!(p && p.role === "cop");
  }

  // --- Name + influence pill helpers (Единый формат: Имя [12]) ---
  function influenceOfPlayer(p){
    if (!p) return 0;
    const v = (typeof p.influence === "number") ? p.influence : (typeof p.influence === "string" ? parseInt(p.influence,10) : 0);
    return Number.isFinite(v) ? v : 0;
  }

  function pointsOfPlayer(p){
    if (!p) return 0;
    const v = (typeof p.points === "number") ? p.points : (typeof p.points === "string" ? parseInt(p.points,10) : 0);
    return Number.isFinite(v) ? v : 0;
  }

  function isDevBalanceEnabled(){
    try {
      if (Game && Game.Debug && Game.Debug.SHOW_NPC_BALANCES === true) return true;
      if (typeof window !== "undefined") {
        if (window.__DEV__ === true || window.DEV === true) return true;
        if (typeof location !== "undefined" && location && location.hostname === "localhost") return true;
        if (typeof location !== "undefined" && location && location.search && location.search.includes("dev=1")) return true;
      }
    } catch (_) {}
    return false;
  }

  function devBalanceSuffix(p){
    if (!isDevBalanceEnabled()) return "";
    const pts = pointsOfPlayer(p);
    return ` 💰${Number.isFinite(pts) ? pts : 0}`;
  }

  function displayName(p){
    if (!p) return "";
    const base = String(p.name || "").trim();
    return base ? `${base}${devBalanceSuffix(p)}` : base;
  }

  function displayNameByIdOrName(pOrIdOrName){
    if (!pOrIdOrName) return "";
    if (typeof pOrIdOrName === "object") return displayName(pOrIdOrName);
    const p = getPlayerById(pOrIdOrName) || getPlayerByName(pOrIdOrName);
    if (p) return displayName(p);
    return String(pOrIdOrName || "");
  }

  // --- Progression (single source of truth: Game.Data.PROGRESSION) ---
  function getProgression(){
    const P = (Game.Data && Game.Data.PROGRESSION) ? Game.Data.PROGRESSION : null;
    const winsPerInfluence = (P && Number.isFinite(P.winsPerInfluence)) ? (P.winsPerInfluence | 0) : 5;
    const unlock = (P && P.unlockInfluence) ? P.unlockInfluence : {};
    const strong = (unlock && Number.isFinite(unlock.strong)) ? (unlock.strong | 0) : 5;
    const power = (unlock && Number.isFinite(unlock.power)) ? (unlock.power | 0) : 10;
    const absolute = (unlock && Number.isFinite(unlock.absolute)) ? (unlock.absolute | 0) : 100;
    return {
      winsPerInfluence: Math.max(1, winsPerInfluence),
      unlock: {
        strong: Math.max(0, strong),
        power: Math.max(0, power),
        absolute: Math.max(0, absolute),
      }
    };
  }

  function sysText(key, fallback){
    try{
      const SYS = (Game.Data && Game.Data.SYS) ? Game.Data.SYS : null;
      if (!SYS) return fallback;
      const v = SYS[key];
      if (typeof v === "string") return v;
    }catch(_){}
    return fallback;
  }

  // Returns plain text: "Имя [12]"
  function formatNameWithInfluence(pOrId){
    const p = (typeof pOrId === "string") ? getPlayerById(pOrId) : pOrId;
    const n = displayName(p);
    const inf = influenceOfPlayer(p);
    if (!n) return `[${inf}]`;
    return `${n} [${inf}]`;
  }

  // Returns HTML for meta header usage: name + pill span
  function nameHTMLWithPill(pOrId){
    const p = (typeof pOrId === "string") ? getPlayerById(pOrId) : pOrId;
    const n = escapeHtml(displayName(p));
    const inf = influenceOfPlayer(p);
    return `${n} <span class="badge">[${inf}]</span>`;
  }

  // --- Added helper for backward compatibility and convenience ---
  UI.getNameWithInfluenceHTMLById = function(id) {
    return nameHTMLWithPill(id);
  };

  // Expose unified name helpers for all UI modules
  UI.formatNameWithInfluence = formatNameWithInfluence;
  UI.nameHTMLWithPill = nameHTMLWithPill;
  UI.displayName = displayName;
  UI.displayNameByIdOrName = displayNameByIdOrName;

  // --- Top name pill (always show player's nickname) ---
  function ensureMeNamePillDOM(){
    const topBar = $("topBar");
    if (!topBar) return null;

    // Prefer placing name pill at the very left of topBar
    let pill = document.getElementById("meNamePill");
    if (!pill) {
      pill = document.createElement("div");
      pill.id = "meNamePill";
      pill.className = "pill";
      pill.style.fontWeight = "900";
      pill.style.whiteSpace = "nowrap";
      topBar.insertBefore(pill, topBar.firstChild);
    }

    // Prune accidental duplicates (legacy versions may have created extra name pills)
    document.querySelectorAll("#meNamePill2,.meNamePill,.topNamePill").forEach(el => el && el.remove());

    return pill;
  }

  UI.updateMeNamePill = function(){
    const pill = ensureMeNamePillDOM();
    if (!pill) return;
    const name = displayName(S.me) || "Ты";
    pill.textContent = name;
  };

  // --- Argument strength pills (2 lines, stacked, colored word) ---
  function argTierByInfluence(inf){
    const prog = getProgression();
    const v = Number(inf || 0);
    if (v >= prog.unlock.absolute) return { key:"k", label:"абсолютные" };
    if (v >= prog.unlock.power) return { key:"r", label:"мощные" };
    if (v >= prog.unlock.strong) return { key:"o", label:"сильные" };
    return { key:"y", label:"слабые" };
  }

  function _canonSubFromTierKey(tierKey){
    const s = String(tierKey || "").trim().toLowerCase();
    if (!s) return "Y1";
    if (s === "k" || s === "k1") return "K";
    if (s.startsWith("y")) return ("Y" + s.slice(1)).toUpperCase();
    if (s.startsWith("o")) return ("O" + s.slice(1)).toUpperCase();
    if (s.startsWith("r")) return ("R" + s.slice(1)).toUpperCase();
    return String(tierKey || "").toUpperCase();
  }

  function _argSubKeyByInfluence(inf){
    const v = Number(inf || 0);
    if (v >= 27) return "K";
    if (v >= 24) return "R4";
    if (v >= 21) return "R3";
    if (v >= 18) return "R2";
    if (v >= 15) return "R1";
    if (v >= 12) return "O3";
    if (v >= 9) return "O2";
    if (v >= 6) return "O1";
    if (v >= 3) return "Y2";
    return "Y1";
  }

  function _argNextSubKey(subKey){
    const order = ["Y1","Y2","O1","O2","O3","R1","R2","R3","R4","K"];
    const idx = order.indexOf(String(subKey || "").toUpperCase());
    if (idx < 0) return "";
    return order[idx + 1] || "";
  }

  function _argNextStartBySubKey(nextSubKey){
    const key = String(nextSubKey || "").toUpperCase();
    if (key === "Y2") return 3;
    if (key === "O1") return 6;
    if (key === "O2") return 9;
    if (key === "O3") return 12;
    if (key === "R1") return 15;
    if (key === "R2") return 18;
    if (key === "R3") return 21;
    if (key === "R4") return 24;
    if (key === "K") return 27;
    return null;
  }

  function _argSubLabel(subKey){
    const map = {
      Y1: "очень скромный",
      Y2: "скромный",
      O1: "вежливый",
      O2: "довольно обычный",
      O3: "обычный",
      R1: "уверенный",
      R2: "очень уверенный",
      R3: "дерзкий",
      R4: "грубый",
      K: "приказной"
    };
    return map[subKey] || "";
  }

  function _argSubLabelGenitiveSingular(subKey){
    const map = {
      Y1: "очень скромного",
      Y2: "скромного",
      O1: "вежливого",
      O2: "довольно обычного",
      O3: "обычного",
      R1: "уверенного",
      R2: "очень уверенного",
      R3: "дерзкого",
      R4: "грубого",
      K: "приказного"
    };
    return map[subKey] || "";
  }

  function _argSubLabelInstrumental(subKey){
    const map = {
      Y1: "очень скромным",
      Y2: "скромным",
      O1: "вежливым",
      O2: "довольно обычным",
      O3: "обычным",
      R1: "уверенным",
      R2: "очень уверенным",
      R3: "дерзким",
      R4: "грубым",
      K: "приказным"
    };
    return map[subKey] || "";
  }

  function _argColorKeyFromSub(subKey){
    const s = String(subKey || "").toUpperCase();
    if (s.startsWith("K")) return "k";
    if (s.startsWith("R")) return "r";
    if (s.startsWith("O")) return "o";
    return "y";
  }

  function _isDevFlag(){
    try {
      if (typeof window !== "undefined") {
        if (window.__DEV__ === true || window.DEV === true) return true;
        if (typeof location !== "undefined" && location && location.search && location.search.includes("dev=1")) return true;
        if (typeof location !== "undefined" && location && location.hostname === "localhost") return true;
      }
    } catch (_) {}
    return false;
  }

  function colorStyleForTierKey(k){
    // Use CSS variables from style.css when available
    if (k === "y") return "color:var(--y); text-shadow:var(--y-shadow, none);";
    if (k === "o") return "color:var(--o);";
    if (k === "r") return "color:var(--rcol);";
    // black tier word should remain readable
    return "color:rgba(255,255,255,.92);"; // default for dark backgrounds
  }

  function nextTierTargetInfluence(inf){
    const prog = getProgression();
    const v = Number(inf || 0);
    if (v < prog.unlock.strong) return prog.unlock.strong;
    if (v < prog.unlock.power) return prog.unlock.power;
    if (v < prog.unlock.absolute) return prog.unlock.absolute;
    return null;
  }

  function winsToReachInfluence(targetInf){
    // ⚡ растёт от побед: winsPerInfluence побед дают +1 ⚡.
    // K считаем от общего числа побед игрока (S.me.wins), чтобы UI всегда был консистентен.
    const prog = getProgression();
    const target = Number(targetInf || 0);
    if (!Number.isFinite(target) || target <= 0) return 0;

    const winsNow = Number(S.me?.wins || 0);
    const targetWins = Math.max(0, target * prog.winsPerInfluence);
    const left = targetWins - (Number.isFinite(winsNow) ? winsNow : 0);
    return Math.max(0, left);
  }

  function influenceWord(n){
    const v = Math.abs(Number(n || 0));
    const mod100 = v % 100;
    const mod10 = v % 10;
    if (mod100 >= 11 && mod100 <= 14) return "⚡";
    if (mod10 === 1) return "⚡";
    if (mod10 >= 2 && mod10 <= 4) return "⚡";
    return "⚡";
  }

  function ensureArgPillsDOM(){
    // Prefer an existing container with class .topPills (see style.css)
    let holder = document.querySelector(".topPills");
    // Hard guarantee: top pills are always exactly 2 lines, stacked, no duplicates.
    // If some older UI created extra pills, we remove them here.
    const pruneHolder = () => {
      if (!holder) return;
      // Keep exactly two pills in a stable order: tier then next.
      const tierEl = document.getElementById('argTierPill');
      const nextEl = document.getElementById('argNextPill');

      // Remove everything else from holder.
      Array.from(holder.children).forEach(ch => {
        if (!ch) return;
        if (tierEl && ch === tierEl) return;
        if (nextEl && ch === nextEl) return;
        ch.remove();
      });

      // Re-append in correct order if needed.
      if (tierEl && tierEl.parentElement !== holder) holder.appendChild(tierEl);
      if (nextEl && nextEl.parentElement !== holder) holder.appendChild(nextEl);
      if (tierEl && nextEl) {
        if (holder.firstChild !== tierEl) holder.insertBefore(tierEl, holder.firstChild);
        if (tierEl.nextSibling !== nextEl) holder.insertBefore(nextEl, tierEl.nextSibling);
      }
    };
    if (!holder) {
      // fallback: create inside topBar, left side
      const topBar = $("topBar");
      if (!topBar) return null;
      holder = document.createElement("div");
      holder.className = "topPills";
      holder.style.display = "flex";
      holder.style.flexDirection = "column";
      holder.style.gap = "6px";

      // Place top pills right AFTER the nickname pill, so they are strictly stacked under it.
      const mePill = document.getElementById("meNamePill") || ensureMeNamePillDOM();
      if (mePill && mePill.parentElement === topBar) {
        topBar.insertBefore(holder, mePill.nextSibling);
      } else {
        topBar.insertBefore(holder, topBar.firstChild);
      }

      pruneHolder();
    }

    let tier = document.getElementById("argTierPill");
    if (!tier) {
      tier = document.createElement("div");
      tier.id = "argTierPill";
      tier.className = "pill";
      holder.appendChild(tier);
      pruneHolder();
    }

    let next = document.getElementById("argNextPill");
    if (!next) {
      next = document.createElement("div");
      next.id = "argNextPill";
      next.className = "pill";
      holder.appendChild(next);
      pruneHolder();
    }

    // Also remove any legacy "wins to next" lines that might exist outside of .topPills
    // (older UI versions sometimes rendered them near the wins counter).
    const legacySelectors = [
      "#winsToNext", "#winsToStrong", "#winsToPower",
      ".winsToNext", ".winsToStrong", ".winsToPower",
      "#argNextPill2", "#argTierPill2"
    ];
    legacySelectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        // Never remove our canonical pills
        if (el && (el.id === "argTierPill" || el.id === "argNextPill")) return;
        el.remove();
      });
    });

    // Aggressive prune: remove any other pills that look like argument progress lines
    // (we keep ONLY our canonical 2 pills: argTierPill + argNextPill).
    try {
      document.querySelectorAll('.pill').forEach(el => {
        if (!el || el.id === 'argTierPill' || el.id === 'argNextPill') return;
        const txt = (el.textContent || '').trim();
        // Typical duplicates contain these phrases.
        if (/^До\s+/i.test(txt) && /аргумент/i.test(txt)) {
          el.remove();
          return;
        }
        if (/Твои\s+аргумент/i.test(txt) && /(слаб|сильн|мощн|абсолют)/i.test(txt)) {
          // Sometimes older UI rendered this as a separate pill.
          el.remove();
          return;
        }
        if (/Ты\s+на\s+пути\s+к/i.test(txt) && /аргумент/i.test(txt)) {
          el.remove();
          return;
        }
      });
    } catch (_) {}

    // Final prune (in case legacy nodes were appended during creation)
    pruneHolder();

    return { holder, tier, next };
  }

  // --- Absolute argument helpers ---
  function _parseRGBA(str){
    const m = String(str||"").match(/rgba?\(([^)]+)\)/i);
    if (!m) return null;
    const parts = m[1].split(",").map(s=>s.trim());
    const r = Number(parts[0]);
    const g = Number(parts[1]);
    const b = Number(parts[2]);
    const a = parts.length >= 4 ? Number(parts[3]) : 1;
    if (![r,g,b,a].every(v => Number.isFinite(v))) return null;
    return {r,g,b,a};
  }

  function _luminance255(r,g,b){
    // relative luminance approximation in 0..255
    return 0.2126*r + 0.7152*g + 0.0722*b;
  }

  function _wordColorForBackground(el){
    // Pick black on light backgrounds, white on dark backgrounds.
    // If background is transparent/unknown, default to white (dark UI).
    try{
      if (!el) return "rgba(255,255,255,.92)";
      const cs = getComputedStyle(el);
      const bg = cs.backgroundColor;
      const rgba = _parseRGBA(bg);
      if (!rgba) return "rgba(255,255,255,.92)";
      // Treat low-alpha backgrounds as dark UI default.
      if (rgba.a < 0.25) return "rgba(255,255,255,.92)";
      const L = _luminance255(rgba.r, rgba.g, rgba.b);
      return (L >= 140) ? "#000" : "rgba(255,255,255,.92)";
    }catch(_){
      return "rgba(255,255,255,.92)";
    }
  }

  function _absoluteWordHTML(word, hostEl){
    const c = _wordColorForBackground(hostEl);
    return `<span style="color:${c};font-weight:900;">${escapeHtml(word)}</span>`;
  }

  UI.updateArgStrengthPills = function(){
    if (!S.me) return;
    const dom = ensureArgPillsDOM();
    if (!dom) return;

    const inf = Number(S.me.influence || 0);
    const tier = argTierByInfluence(inf);
    let subKey = _argSubKeyByInfluence(inf);
    let nextSubKey = _argNextSubKey(subKey);
    let subLabel = _argSubLabel(subKey) || tier.label;
    let nextLabel = _argSubLabelGenitiveSingular(nextSubKey) || _argSubLabelGenitiveSingular(subKey) || tier.label;
    let colorKey = _argColorKeyFromSub(subKey) || tier.key;
    dom.tier.innerHTML = `Твой тон: <span style="${colorStyleForTierKey(colorKey)}font-weight:900;">${escapeHtml(subLabel)}</span>`;

    const computeLeft = (nxtSub) => {
      const target = _argNextStartBySubKey(nxtSub);
      if (target == null) return null;
      return Math.max(0, (target | 0) - (inf | 0));
    };

    let left = computeLeft(nextSubKey);
    let advanced = false;
    while (left != null && left <= 0 && nextSubKey) {
      subKey = nextSubKey;
      nextSubKey = _argNextSubKey(subKey);
      subLabel = _argSubLabel(subKey) || tier.label;
      nextLabel = _argSubLabelGenitiveSingular(nextSubKey) || _argSubLabelGenitiveSingular(subKey) || tier.label;
      colorKey = _argColorKeyFromSub(subKey) || tier.key;
      dom.tier.innerHTML = `Твой тон: <span style="${colorStyleForTierKey(colorKey)}font-weight:900;">${escapeHtml(subLabel)}</span>`;
      left = computeLeft(nextSubKey);
      advanced = true;
    }

    if (advanced) {
      const toastLabel = _argSubLabelInstrumental(subKey);
      if (toastLabel && UI && typeof UI.showStatToast === "function") {
        const key = `${subKey}|${inf}`;
        if (UI._argToneToastKey !== key) {
          UI._argToneToastKey = key;
          UI.showStatToast("influence", `Твой тон стал ${toastLabel}`);
        }
      }
    }

    const nextColorKey = _argColorKeyFromSub(nextSubKey) || colorKey;
    dom.next.style.display = "";
    if (!nextSubKey) {
      dom.next.innerHTML = `Предел: <span style="${colorStyleForTierKey(colorKey)}font-weight:900;">${escapeHtml(subLabel)}</span>`;
      if (_isDevFlag()) {
        console.log(`[ToneHUD] influence=${inf} cur=${subKey} next=K remaining=0`);
      }
      return;
    }

    const remaining = Math.max(1, (left == null ? 1 : left));
    dom.next.innerHTML = `До <span style="${colorStyleForTierKey(nextColorKey)}font-weight:900;">${escapeHtml(nextLabel)}</span>: ${remaining} ⚡`;
    if (_isDevFlag()) {
      console.log(`[ToneHUD] influence=${inf} cur=${subKey} next=${nextSubKey} remaining=${remaining}`);
    }
  };

  function _wrapInfluenceSync(){
    if (UI._argPillSyncWrapped) return;
    try {
      if (Game.StateAPI && typeof Game.StateAPI.syncMeToPlayers === "function") {
        const orig = Game.StateAPI.syncMeToPlayers;
        if (!orig._argPillWrapped) {
          Game.StateAPI.syncMeToPlayers = function(...args){
            const res = orig.apply(this, args);
            try { if (UI && typeof UI.updateArgStrengthPills === "function") UI.updateArgStrengthPills(); } catch (_) {}
            return res;
          };
          Game.StateAPI.syncMeToPlayers._argPillWrapped = true;
        }
        UI._argPillSyncWrapped = true;
        return;
      }
    } catch (_) {}
    setTimeout(_wrapInfluenceSync, 200);
  }

  _wrapInfluenceSync();

  function _startArgPillWatcher(){
    if (UI._argPillWatcher) return;
    UI._argPillWatcher = true;
    let lastInf = null;
    let lastForced = null;
    setInterval(() => {
      try {
        const inf = Number(Game?.State?.me?.influence ?? 0);
        const forced = (typeof window !== "undefined") ? window.DEV_FORCE_ARG_COLOR : null;
        if (inf === lastInf && forced === lastForced) return;
        lastInf = inf;
        lastForced = forced;
        if (UI && typeof UI.updateArgStrengthPills === "function") {
          UI.updateArgStrengthPills();
        }
      } catch (_) {}
    }, 200);
  }

  _startArgPillWatcher();

  // Chat normalization:
  // - system: untouched
  // - cop: untouched punctuation
  // - npc + player in public chat: lowercase, no trailing punctuation
  function normalizePublic(text) {
    let t = String(text || "").trim();
    t = t.replace(/[.。!?]+$/g, "");
    if (t.length > 1) t = t[0].toLowerCase() + t.slice(1);
    return t;
  }

  function pushChat({ name, text, system=false, id=null, action=null, battleId=null }) {
    let msgName = name;
    if (system) {
      const n = String(msgName || "").trim().toLowerCase();
      if (!n || n === "sys" || n === "system" || n === "система") msgName = "Система";
    }
    const msg = {
      id: id || `m_${Date.now()}_${Math.floor(Math.random()*9999)}`,
      t: nowHHMM(),
      name: msgName,
      // keep both flags for compatibility across UI modules
      system: !!system,
      isSystem: !!system,
      action: action || null,
      battleId: battleId || null,
      text: system ? String(text || "") : (isCopSpeaker(name) ? String(text || "") : normalizePublic(text)),
    };
    // Attach resolved speakerId for reliable influence pill rendering
    const speaker = getPlayerByName(name);
    if (speaker && speaker.id) {
      msg.speakerId = speaker.id;
    } else {
      msg.speakerId = null;
    }
    S.chat.push(msg);

    UI.requestRenderAll();
  }

  UI.pushChat = pushChat;

  UI.pushSystem = (text, opts={}) => {
    const msg = String(text || "");
    // Route stat-related system messages to top toasts.
    if (msg.includes("💰")) {
      if (UI.showStatToast) { UI.showStatToast("points", msg); return; }
    }
    if (msg.includes("⚡")) {
      if (UI.showStatToast) { UI.showStatToast("influence", msg); return; }
    }
    if (msg.includes("⭐")) {
      if (UI.showStatToast) { UI.showStatToast("rep", msg); return; }
    }
    if (msg.includes("🏆")) {
      if (UI.showStatToast) { UI.showStatToast("wins", msg); return; }
    }
    pushChat({ name:"Система", text: msg, system:true, action:opts.action||null, battleId:opts.battleId||null });
  };

  UI.pushCop = (text) => {
    const cop = Object.values(S.players).find(p => p && p.role === "cop");
    if (!cop) {
      UI.pushSystem(text);
      return;
    }
    pushChat({ name: cop.name, text: String(text || ""), system:false });
  };

  UI.$ = $;
  UI.S = S;
  UI.nowHHMM = nowHHMM;
  UI.escapeHtml = escapeHtml;

  function statAnchor(kind){
    const bal = $("balance");
    if (!bal) return null;
    if (kind === "points") return bal.querySelector('span[title="Пойнты"]');
    if (kind === "rep") return bal.querySelector('span[title="Репутация"]');
    if (kind === "wins") return bal.querySelector('span[title="Победы"]');
    return bal.querySelector('span[title="Влияние"]');
  }

  function maybeQueueStatDeltaFromState(next){
    // Track and show toasts for all stat changes (fixes DUM-009)
    UI.__prevStats = UI.__prevStats || { influence: 0, points: 0, rep: 0, wins: 0 };
    const prev = UI.__prevStats;
    
    const stats = ["influence", "points", "rep", "wins"];
    for (const key of stats) {
      const cur = (next && Number.isFinite(next[key])) ? (next[key] | 0) : 0;
      const old = Number.isFinite(prev[key]) ? (prev[key] | 0) : 0;
      const delta = cur - old;
      
      if (delta !== 0 && old !== 0) {  // old !== 0 to skip initial render
        queueDeltaToast(key, delta);
      }
      
      prev[key] = cur;
    }
  }

  function parseDeltaFromText(text){
    const m = String(text || "").match(/([+-]\s*\d+)/);
    if (!m) return null;
    const n = parseInt(m[1].replace(/\s+/g, ""), 10);
    return Number.isFinite(n) ? n : null;
  }

  function isDeltaToast(kind, text){
    const n = parseDeltaFromText(text);
    if (!Number.isFinite(n)) return false;
    return (kind === "influence" || kind === "rep" || kind === "points" || kind === "wins");
  }

  function queueDeltaToast(kind, delta){
    UI.__statDelta = UI.__statDelta || { influence: 0, rep: 0, points: 0, wins: 0 };
    UI.__statDelta[kind] = (UI.__statDelta[kind] || 0) + (delta | 0);
    if (UI.__statDeltaTimer) clearTimeout(UI.__statDeltaTimer);
    UI.__statDeltaTimer = setTimeout(() => {
      UI.__statDeltaTimer = null;
      showDeltaToast();
    }, 80);
  }

  function showDeltaToast(){
    if (!UI.__statDelta) return;
    const order = ["influence", "rep", "points", "wins"];
    const icons = { influence: "⚡", rep: "⭐", points: "💰", wins: "🏆" };
    
    // Show separate toast under each stat (fixes DUM-011)
    for (const k of order) {
      const v = UI.__statDelta[k] | 0;
      if (!v) continue;
      
      const anchor = statAnchor(k);
      if (!anchor) continue;
      
      const sign = v > 0 ? "+" : "";
      const text = `${icons[k]} ${sign}${v}`;
      const id = `statToast_delta_${k}`;
      
      let toast = document.getElementById(id);
      if (!toast) {
        toast = document.createElement("div");
        toast.id = id;
        toast.className = "statToast";
        toast.onclick = () => { toast.style.display = "none"; };
        document.body.appendChild(toast);
      }
      
      toast.textContent = text;
      const r = anchor.getBoundingClientRect();
      const left = Math.round(r.left + (r.width / 2));
      const top = Math.round(r.bottom + 8);
      toast.style.left = `${left}px`;
      toast.style.top = `${top}px`;
      toast.style.display = "block";
      toast.style.opacity = "1";
      toast.style.transform = "translateX(-50%)";
    }
    
    UI.__statDelta = { influence: 0, rep: 0, points: 0, wins: 0 };
  }

  UI.showStatToast = (kind, text) => {
    if (isDeltaToast(kind, text)) {
      return;
    }
    const anchor = statAnchor(kind);
    if (!anchor) return;
    const id = `statToast_${kind}`;
    let toast = document.getElementById(id);
    if (!toast) {
      toast = document.createElement("div");
      toast.id = id;
      toast.className = "statToast";
      toast.onclick = () => { toast.style.display = "none"; };
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    const r = anchor.getBoundingClientRect();
    const left = Math.round(r.left + (r.width / 2));
    const top = Math.round(r.bottom + 8);
    toast.style.left = `${left}px`;
    toast.style.top = `${top}px`;
    toast.style.display = "block";
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%)";
  };

  UI.showInfluenceToast = (text) => {
    UI.showStatToast("influence", text);
  };
  UI.getPlayerByName = getPlayerByName;
  UI.getPlayerById = getPlayerById;
  UI.displayName = displayName;

  // Events collapsed state helpers (single source of truth in S.flags)
  UI.getEventsCollapsed = function(){
    return !!(S.flags && S.flags.eventsCollapsed);
  };

  UI.setEventsCollapsed = function(v){
    if (!S.flags) S.flags = {};
    S.flags.eventsCollapsed = !!v;
  };

  UI.ensureEventsExpanded = function(){
    UI.setEventsCollapsed(false);
    const body = $("eventsBody");
    if (body) body.classList.remove("hidden");
  };

  // ------------------------------
  // Render scheduler / batch mode
  // Goal: after mass actions (escapeAll / sendAll etc) UI updates once, without jitter.
  UI.__renderQueued = false;
  UI.__renderLock = 0;
  UI.__renderAllRunning = false;

  UI.requestRenderAll = function(){
    if (UI.__renderLock > 0) return;
    if (UI.__renderQueued) return;
    UI.__renderQueued = true;
    requestAnimationFrame(() => {
      UI.__renderQueued = false;
      if (UI.renderAll) UI.renderAll();
    });
  };

  UI.batch = function(fn){
    UI.__renderLock++;
    try { fn && fn(); } finally {
      UI.__renderLock = Math.max(0, UI.__renderLock - 1);
    }
    UI.requestRenderAll();
  };

  UI.openDMByName = UI.openDMByName || function(name){
    let p = getPlayerByName(name);
    if (!p && name) {
      const n = String(name).trim().toLowerCase();
      const list = Object.values(S.players || {}).filter(x => x && x.name && String(x.name).toLowerCase() === n);
      if (list.length > 1) {
        p = list.find(x => x.role === "cop") || list[0];
      } else if (list.length === 1) {
        p = list[0];
      }
    }
    const myId = (S && S.me && S.me.id) ? S.me.id : "me";
    if (!p || p.id === myId || p.id === "me") return;
    S.dm.open = true;
    S.dm.withId = p.id;
    S.dm.inviteOpen = false;
    if (!S.dm.logs[p.id]) S.dm.logs[p.id] = [];
    UI.requestRenderAll();
  };

  UI.openDMBySpeakerId = function(id){
    const myId = (S && S.me && S.me.id) ? S.me.id : "me";
    if (!id || id === myId || id === "me") return;
    const p = getPlayerById(id);
    if (!p) return;
    S.dm.open = true;
    S.dm.withId = p.id;
    S.dm.inviteOpen = false;
    if (!S.dm.logs[p.id]) S.dm.logs[p.id] = [];
    UI.requestRenderAll();
  };

  UI.pushEvent = UI.pushEvent || function(evt){
    if (!evt) return;
    evt.id = evt.id || `e_${Date.now()}_${Math.floor(Math.random()*9999)}`;
    S.events.push(evt);
    UI.requestRenderAll();
  };

  // Players
  UI.buildPlayers = () => {
    S.players = S.players || {};
    if (S.me) {
      S.players["me"] = S.players["me"] || {
        id:"me",
        name: S.me.name,
        influence: Number.isFinite(S.me.influence) ? S.me.influence : (parseInt(S.me.influence,10) || 0),
        points: Number.isFinite(S.me.points) ? S.me.points : (parseInt(S.me.points,10) || 0),
        wins: Number.isFinite(S.me.wins) ? S.me.wins : (parseInt(S.me.wins,10) || 0),
        role:"me"
      };
    }

    const npcs = (Game.NPC && Game.NPC.getAll) ? Game.NPC.getAll() : [];
    npcs.forEach(n => {
      if (!S.players[n.id]) {
        S.players[n.id] = { ...n };
      } else {
        // Мягкое обновление полей NPC
        Object.assign(S.players[n.id], n);
      }
    });
    UI.requestRenderAll();
  };

  // ------------------------------
  // Mentions: centralized candidates list for UI modules.
  // Important: ui-core MUST NOT install global key handlers that could intercept "@".
  UI.getAllMentionCandidates = function(){
    // Prefer StateAPI if it exists (single source of truth).
    if (Game.StateAPI && typeof Game.StateAPI.getAllMentionCandidates === "function") {
      try { return Game.StateAPI.getAllMentionCandidates(); } catch(_) {}
    }
    // Fallback: derive from S.players.
    const out = [];
    Object.values(S.players || {}).forEach(p => {
      if (!p || !p.name) return;
      out.push({
        id: p.id || null,
        name: String(p.name),
        influence: Number.isFinite(p.influence) ? p.influence : (parseInt(p.influence,10) || 0),
        isMe: (p.id === "me" || p.role === "me"),
        npc: !!p.npc,
        role: p.role || "",
      });
    });
    // Stable sort: me first, then influence desc, then name asc.
    out.sort((a,b) => {
      if (a.isMe !== b.isMe) return a.isMe ? -1 : 1;
      if ((b.influence||0) !== (a.influence||0)) return (b.influence||0) - (a.influence||0);
      return String(a.name).localeCompare(String(b.name), "ru");
    });
    return out;
  };


  UI.getMentionNames = function(){
    const list = UI.getAllMentionCandidates();
    return list.map(x => x.name);
  };

  // ------------------------------
  // Mentions: apply colors from Game.Data to CSS variables (single source of truth).
  // This avoids "magic colors" in CSS while keeping styling fully in Data.
  let __mentionVarsApplied = false;

  function applyMentionCSSVarsOnce(){
    if (__mentionVarsApplied) return;
    __mentionVarsApplied = true;

    try{
      const root = document.documentElement;
      const getVars = (Game.Data && typeof Game.Data.getMentionCSSVars === "function")
        ? Game.Data.getMentionCSSVars
        : null;

      const vars = getVars ? getVars() : null;
      if (vars && root && root.style) {
        Object.entries(vars).forEach(([k, v]) => {
          if (!k) return;
          root.style.setProperty(k, String(v));
        });
      }
    }catch(_){}
  }

  function ensureMentionStyles(){
    // Inject a tiny override stylesheet that uses the vars.
    // This makes mentions consistent even if style.css still has older hardcoded values.
    if (document.getElementById("mentionVarsStyle")) return;
    const st = document.createElement("style");
    st.id = "mentionVarsStyle";
    st.textContent = `
      .mention{ color:var(--mention-color); font-weight:900; }
      .mention.me{
        background:var(--mention-me-bg);
        border:1px solid var(--mention-me-border);
        padding:0 6px;
        border-radius:10px;
      }
      .bubble.meMention{
        background:var(--mention-bubble-bg);
        border-color:var(--mention-bubble-border);
      }
    `;
    document.head.appendChild(st);
  }

  // ------------------------------
  // Step 9: Menu block (non-overlay) layout helper
  function getMenuBlockEl(){
    return document.getElementById("menuBlock")
        || document.getElementById("menu")
        || document.getElementById("menuWrap")
        || document.getElementById("rightMenu");
  }

  function applyMenuOpenState(){
    const el = getMenuBlockEl();
    if (!el) return;

    const open = !!(S.flags && S.flags.menuOpen);
    // Toggle menu-open class on document.body
    if (open) {
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
    }
    if (open) {
      el.classList.remove("hidden");
      el.classList.add("menu-open");
    } else {
      el.classList.add("hidden");
      el.classList.remove("menu-open");
    }
  }

  function ensureRightScrollBar(){
    const right = document.getElementById("right");
    const blocks = document.getElementById("blocks");
    if (!right || !blocks) return;

    let bar = document.getElementById("rightScroll");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "rightScroll";
      bar.className = "rightScroll";

      const thumb = document.createElement("div");
      thumb.className = "rightScrollThumb";
      bar.appendChild(thumb);
      right.appendChild(bar);

      let dragging = false;
      let dragStartY = 0;
      let startScrollTop = 0;

      const sync = () => {
        const rightRect = right.getBoundingClientRect();
        const blocksRect = blocks.getBoundingClientRect();
        const top = Math.max(0, Math.round(blocksRect.top - rightRect.top));
        const height = Math.max(0, Math.round(blocksRect.height));
        right.style.setProperty("--right-scroll-top", `${top}px`);
        right.style.setProperty("--right-scroll-height", `${height}px`);

        const scrollHeight = blocks.scrollHeight;
        const clientHeight = blocks.clientHeight;
        if (scrollHeight <= clientHeight + 2) {
          bar.classList.add("is-hidden");
          return;
        }
        bar.classList.remove("is-hidden");

        const ratio = clientHeight / scrollHeight;
        const thumbHeight = Math.max(32, Math.floor(clientHeight * ratio));
        const track = Math.max(1, clientHeight - thumbHeight);
        const scrollable = Math.max(1, scrollHeight - clientHeight);
        const topOffset = Math.round((blocks.scrollTop / scrollable) * track);

        thumb.style.height = `${thumbHeight}px`;
        thumb.style.transform = `translateY(${topOffset}px)`;
      };

      UI.updateRightScroll = sync;

      const onPointerMove = (e) => {
        if (!dragging) return;
        const scrollHeight = blocks.scrollHeight;
        const clientHeight = blocks.clientHeight;
        const ratio = clientHeight / scrollHeight;
        const thumbHeight = Math.max(32, Math.floor(clientHeight * ratio));
        const track = Math.max(1, clientHeight - thumbHeight);
        const scrollable = Math.max(1, scrollHeight - clientHeight);

        const startTop = (scrollable > 0) ? ((startScrollTop / scrollable) * track) : 0;
        const delta = e.clientY - dragStartY;
        const nextTop = Math.max(0, Math.min(track, startTop + delta));
        blocks.scrollTop = (nextTop / track) * scrollable;
      };

      const onPointerUp = () => {
        if (!dragging) return;
        dragging = false;
        bar.classList.remove("dragging");
      };

      thumb.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        dragging = true;
        dragStartY = e.clientY;
        startScrollTop = blocks.scrollTop;
        bar.classList.add("dragging");
        try { thumb.setPointerCapture(e.pointerId); } catch (_) {}
      });

      bar.addEventListener("pointerdown", (e) => {
        if (e.target === thumb) return;
        const rect = bar.getBoundingClientRect();
        const clickY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
        const scrollHeight = blocks.scrollHeight;
        const clientHeight = blocks.clientHeight;
        const scrollable = Math.max(1, scrollHeight - clientHeight);
        const ratio = clickY / Math.max(1, rect.height);
        blocks.scrollTop = ratio * scrollable;
      });

      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", onPointerUp);
      blocks.addEventListener("scroll", sync);
      window.addEventListener("resize", sync);
    }

    if (UI.updateRightScroll) UI.updateRightScroll();
  }

  // Render-all (shell). Реальные рендеры подключатся из модулей.
  UI.renderAll = () => {
    applyMentionCSSVarsOnce();
    ensureMentionStyles();
    // Prevent nested / repeated full renders from tearing scroll position.
    // If a render is already running, queue exactly one more for the next frame.
    if (UI.__renderAllRunning) {
      UI.requestRenderAll();
      return;
    }
    UI.__renderAllRunning = true;

      // --- Layout enforcement: left chat full height ---
      const chatWrap = document.getElementById("chatWrap") || document.getElementById("chat");
      const dmWrap = document.getElementById("dmWrap") || document.getElementById("dm");

      if (chatWrap) {
        chatWrap.style.height = "100vh";
        chatWrap.style.display = "flex";
        chatWrap.style.flexDirection = "column";
        chatWrap.style.overflow = "hidden";
      }

      const chatLog = document.getElementById("chatLog");
      if (chatLog) {
        chatLog.style.flex = "1 1 auto";
        chatLog.style.overflowY = "auto";
      }

    try {
      if (!S.players) return;
      // Always keep top bar consistent, even before player is created.
      UI.updateMeNamePill();
      UI.updateArgStrengthPills();
      if (!S.me) return;
      UI.bindChatBubbleClicks();

      if (S.me && S.players && S.players["me"]) {
        S.players["me"].name = S.me.name;
        S.players["me"].influence = Number.isFinite(S.me.influence) ? S.me.influence : (parseInt(S.me.influence, 10) || 0);
        S.players["me"].wins = Number.isFinite(S.me.wins) ? S.me.wins : (parseInt(S.me.wins, 10) || 0);
      }

      const mi = $("meInfluence");
      const mp = $("mePoints");
      const mw = $("meWins");
      const mr = $("meRep");
      const mneed = $("meRepNeed");
      const capNote = $("weeklyCapNote");
      const capLine = $("weeklyCapLine");
      const mpOverflow = $("mePointsOverflow");
      const pointsNote = $("pointsCapNote");

      if (mi) mi.textContent = String(S.me.influence || 0);
      if (mp) {
        const cap = (Game.Data && Number.isFinite(Game.Data.POINTS_SOFT_CAP))
          ? (Game.Data.POINTS_SOFT_CAP | 0)
          : 20;
        const pts = Number.isFinite(S.me.points) ? (S.me.points | 0) : 0;
        const overflow = (S.points && Number.isFinite(S.points.overflow)) ? (S.points.overflow | 0) : 0;
        const pointsTitle = "";
        if (pts >= cap) {
          mp.textContent = String(cap);
          mp.classList.add("is-cap");
        } else {
          mp.textContent = String(pts);
          mp.classList.remove("is-cap");
        }
        if (mpOverflow) {
          mpOverflow.textContent = overflow > 0 ? String(Math.min(overflow, 5)) : "";
        }
        if (pointsNote) {
          pointsNote.textContent = "";
          pointsNote.style.display = "none";
        }
        if (mp) mp.removeAttribute("title");
        if (mpOverflow) mpOverflow.removeAttribute("title");
        try {
          const wrap = mp.closest(".pointsWrap");
          if (wrap) wrap.removeAttribute("title");
        } catch (_) {}
      }
      if (mr) mr.textContent = String(S.rep || 0);
      if (mneed) {
        const need = (Game.StateAPI && typeof Game.StateAPI.repNeedForNextInfluence === "function")
          ? Game.StateAPI.repNeedForNextInfluence()
          : 0;
        mneed.textContent = String(need || 0);
        const capActive = (Game.StateAPI && typeof Game.StateAPI.weeklyCapActive === "function")
          ? Game.StateAPI.weeklyCapActive()
          : false;
        if (capActive) {
          mneed.classList.add("is-cap");
          mneed.removeAttribute("title");
        } else {
          mneed.classList.remove("is-cap");
          mneed.removeAttribute("title");
        }
      }
      if (capNote) capNote.textContent = "";
      if (capLine) {
        let text = "";
        try {
          const active = (Game.StateAPI && typeof Game.StateAPI.weeklyCapActive === "function")
            ? Game.StateAPI.weeklyCapActive()
            : false;
          if (active && S.progress && S.progress.weekStartAt) {
            text = "";
          }
        } catch (_) {}
        capLine.textContent = text;
        capLine.removeAttribute("title");
      }
      if (mw) {
        const wins = Number(S.me.wins || 0);
        mw.textContent = String(wins);
      }
      maybeQueueStatDeltaFromState({
        influence: (S.me && Number.isFinite(S.me.influence)) ? (S.me.influence | 0) : 0,
        rep: (S && Number.isFinite(S.rep)) ? (S.rep | 0) : 0,
        points: (S.me && Number.isFinite(S.me.points)) ? (S.me.points | 0) : 0,
        wins: (S.me && Number.isFinite(S.me.wins)) ? (S.me.wins | 0) : 0,
      });
      UI.updateMeNamePill();
      UI.updateArgStrengthPills();

      if (UI.ensureLotteryControls) UI.ensureLotteryControls();

      // Menu is a block (not an overlay). Render it early so layout can flow.
      if (UI.renderMenu) UI.renderMenu();
      applyMenuOpenState();

      // Render order matters. These calls are allowed to rebuild DOM,
      // but state must remain stable. Scroll anchoring for battles is handled inside ui-battles.js.
      if (UI.renderChatSmart) UI.renderChatSmart();
      if (UI.renderBattles) UI.renderBattles();
      if (UI.renderEvents) UI.renderEvents();

      // Restore events collapsed state after events render
      try{
        const body = $("eventsBody");
        const collapsed = UI.getEventsCollapsed ? UI.getEventsCollapsed() : false;
        if (body) body.classList.toggle("hidden", !!collapsed);
      }catch(_){}

      if (UI.renderLocations) UI.renderLocations();
      if (UI.renderDM && S.dm.open) UI.renderDM();
      ensureRightScrollBar();

      // If any module requested another render during this run, it will be queued.
    } finally {
      UI.__renderAllRunning = false;
    }
  };


  UI.normalizePublic = normalizePublic;

  // ------------------------------
  // Step 10: Panel sizes (collapsed / medium / max) - centralized helpers
  // Source of truth: Game.StateAPI (preferred) -> S.flags fallback
  const __PANEL_ORDER = ["collapsed", "medium", "max"];

  function __normalizePanelSize(size){
    const s = String(size || "").toLowerCase().trim();
    return (s === "collapsed" || s === "medium" || s === "max") ? s : "medium";
  }

  function __getSizesFromState(){
    // Preferred source: Game.StateAPI (state.js)
    try{
      if (Game.StateAPI && typeof Game.StateAPI.getPanelSizes === "function") {
        const z = Game.StateAPI.getPanelSizes();
        if (z && typeof z === "object") return z;
      }
    }catch(_){}
    // Fallback: S.flags
    const f = (S && S.flags) ? S.flags : {};
    return {
      dm: f.dmSize || "medium",
      battles: f.battlesSize || "medium",
      events: f.eventsSize || "medium",
      locations: f.locationsSize || "medium",
    };
  }

  UI.getPanelSize = function(key){
    const sizes = __getSizesFromState();
    const k = String(key || "").toLowerCase();
    const v = sizes[k] || "medium";
    return __normalizePanelSize(v);
  };

  UI.setPanelSize = function(key, size){
    const k = String(key || "").toLowerCase();
    const s = __normalizePanelSize(size);

    // Preferred: StateAPI setter
    try{
      if (Game.StateAPI && typeof Game.StateAPI.setPanelSize === "function") {
        Game.StateAPI.setPanelSize(k, s);
        UI.requestRenderAll();
        return;
      }
    }catch(_){}

    // Fallback: write into S.flags
    if (!S.flags) S.flags = {};
    if (k === "dm") S.flags.dmSize = s;
    if (k === "battles") S.flags.battlesSize = s;
    if (k === "events") S.flags.eventsSize = s;
    if (k === "locations") S.flags.locationsSize = s;
    UI.requestRenderAll();
  };

  UI.cyclePanelSize = function(key){
    const cur = UI.getPanelSize(key);
    const idx = Math.max(0, __PANEL_ORDER.indexOf(cur));
    const next = __PANEL_ORDER[(idx + 1) % __PANEL_ORDER.length];
    UI.setPanelSize(key, next);
    return next;
  };

  UI.ensurePanelExpanded = function(key){
    // If collapsed, bump to medium.
    const cur = UI.getPanelSize(key);
    if (cur === "collapsed") UI.setPanelSize(key, "medium");
  };

  UI.ensurePanelMax = function(key){
    UI.setPanelSize(key, "max");
  };

  UI.isPanelMax = function(key){
    return UI.getPanelSize(key) === "max";
  };

  // Applies panel size CSS classes to an element.
  // Modules can call this after they render their panel wrapper.
  UI.applyPanelSizeClasses = function(el, key){
    if (!el) return;
    const size = UI.getPanelSize(key);
    el.classList.toggle("panel--collapsed", size === "collapsed");
    el.classList.toggle("panel--medium", size === "medium");
    el.classList.toggle("panel--full", size === "max");
    try { if (UI.updatePanelOverlayState) UI.updatePanelOverlayState(); } catch (_) {}
  };

  UI.updatePanelOverlayState = function(){
    try {
      const right = document.getElementById("right");
      const blocks = document.getElementById("blocks");
      if (!right || !blocks) return;
      const hasMax = !!blocks.querySelector(".block.panel--full, .panel.panel--full, .block.size-max, .panel.size-max");
      right.classList.toggle("has-overlay-panel", !!hasMax);
      blocks.classList.toggle("has-overlay-panel", !!hasMax);
    } catch (_) {}
  };

  // Updates a resize button visual state (for CSS to color max red).
  // Expects a button element and a panel key.
  UI.applyResizeButtonState = function(btn, key){
    if (!btn) return;
    const max = UI.isPanelMax(key);
    btn.classList.toggle("is-max", !!max);
    // Keep the glyph stable. Direction can be handled by CSS if desired.
    if (!btn.textContent || btn.textContent.trim() === "") btn.textContent = "⤢";
  };

  // ------------------------------
  // Step 8: Bubble click -> event (scroll + highlight)
  // Contract (best-effort, tolerant):
  // - Chat bubbles may carry data-battle-id and/or data-event-id.
  // - Events UI may render DOM nodes with:
  //   - id="event_<eventId>" or id="evt_<eventId>"
  //   - and/or attribute data-event-id="<eventId>"
  //   - and/or attribute data-battle-id="<battleId>"
  // This module provides resilient helpers so ui-chat.js can stay simple.

  UI.findEventIdByBattleId = function(battleId){
    if (!battleId) return null;
    const ev = (S.events || []).find(e => e && (e.battleId === battleId || e.id === battleId));
    return ev ? (ev.id || null) : null;
  };

  UI.highlightEventById = function(eventId, ms=2200){
    if (!eventId) return;

    // Ensure events block is visible before scrolling to an event
    try { if (UI.ensureEventsExpanded) UI.ensureEventsExpanded(); } catch(_){}

    // Store flag for ui-events.js to optionally use
    S.flags.highlightEventId = eventId;

    // Try to find an element right now (ui-events.js may have rendered it)
    const el =
      document.getElementById(`event_${eventId}`) ||
      document.getElementById(`evt_${eventId}`) ||
      document.querySelector(`[data-event-id="${eventId}"]`);

    if (el) {
      el.classList.add("highlight");
      el.scrollIntoView({ block:"nearest", behavior:"smooth" });
      setTimeout(() => { el.classList.remove("highlight"); }, ms);
    } else {
      // If not found yet, request a full render and try once more shortly
      if (UI.requestRenderAll) UI.requestRenderAll();
      setTimeout(() => {
        const el2 =
          document.getElementById(`event_${eventId}`) ||
          document.getElementById(`evt_${eventId}`) ||
          document.querySelector(`[data-event-id="${eventId}"]`);
        if (el2) {
          el2.classList.add("highlight");
          el2.scrollIntoView({ block:"nearest", behavior:"smooth" });
          setTimeout(() => { el2.classList.remove("highlight"); }, ms);
        }
      }, 60);
    }

    // Clear flag a bit позже, чтобы не залипало
    setTimeout(() => {
      if (S.flags && S.flags.highlightEventId === eventId) S.flags.highlightEventId = null;
    }, ms + 200);
  };

  UI.scrollToEventByBattleId = function(battleId){
    if (!battleId) return;

    // First try DOM by battleId directly
    const elByBattle =
      document.querySelector(`[data-battle-id="${battleId}"]`) ||
      document.getElementById(`battleEvent_${battleId}`);

    if (elByBattle) {
      elByBattle.classList.add("highlight");
      elByBattle.scrollIntoView({ block:"nearest", behavior:"smooth" });
      setTimeout(() => { elByBattle.classList.remove("highlight"); }, 2200);
      return;
    }

    // Otherwise map battleId -> eventId from state
    const eventId = UI.findEventIdByBattleId(battleId);
    if (eventId) UI.highlightEventById(eventId);
  };

  // Compatibility helper used by conflict.js in earlier iterations
  UI.signalTieFromBattle = function(battleId){
    // Only meaningful if that tie exists as an event (usually чужая ничья)
    UI.scrollToEventByBattleId(battleId);
  };

  // Global, single chat bubble click handler (delegated)
  // - If bubble contains a battleId, we scroll/highlight the corresponding event.
  // - If bubble contains a name (data-open-dm-name), we open DM.
  // This keeps behavior consistent even if ui-chat.js changes.
  UI.bindChatBubbleClicks = function(){
    const log = $("chatLog");
    if (!log) return;
    if (log.__bubbleClicksBound) return;
    log.__bubbleClicksBound = true;

    log.addEventListener("click", (e) => {
      const bubble = e.target.closest(".bubble");
      if (!bubble) return;
      // Do not interfere with mentions autocomplete dropdown clicks.
      if (e.target && (e.target.closest && e.target.closest("#mentionList"))) return;

      // Prefer explicit datasets
      const battleId = bubble.dataset ? (bubble.dataset.battleId || bubble.dataset.battleid) : null;
      const eventId  = bubble.dataset ? (bubble.dataset.eventId || bubble.dataset.eventid) : null;
      const speakerId = bubble.dataset ? (bubble.dataset.speakerId || bubble.dataset.speakerid) : null;
      const dmName    = bubble.dataset ? (bubble.dataset.openDmName || bubble.dataset.opendmname) : null;

      if (speakerId) {
        UI.openDMBySpeakerId(speakerId);
        return;
      }
      if (dmName) {
        UI.openDMByName(dmName);
        return;
      }

      if (eventId) {
        UI.highlightEventById(eventId);
        return;
      }

      if (battleId) {
        UI.scrollToEventByBattleId(battleId);
        return;
      }

      // Fallback: if bubble was rendered from msg in state, try to resolve by text attributes
      const msgId = bubble.dataset ? (bubble.dataset.msgId || bubble.dataset.msgid) : null;
      if (msgId) {
        const m = (S.chat || []).find(x => x && x.id === msgId);
        if (m && m.battleId) UI.scrollToEventByBattleId(m.battleId);
      }
    });
  };

  // Bind immediately when possible
  setTimeout(() => UI.bindChatBubbleClicks(), 0);

  // Apply mention vars/styles as early as possible (safe no-op if Data not ready yet).
  setTimeout(() => { applyMentionCSSVarsOnce(); ensureMentionStyles(); }, 0);

  // Global delegated handler for Menu button (survives re-renders)
  (function bindMenuToggleOnce(){
    if (document.__menuToggleBound) return;
    document.__menuToggleBound = true;

    document.addEventListener("click", (e) => {
      const btn =
        e.target.closest &&
        (e.target.closest("#btnMenu") ||
         e.target.closest("[data-action='menu']") ||
         e.target.closest(".btn-menu"));
      if (!btn) return;

      e.preventDefault();
      e.stopPropagation();

      if (!Game.State || !Game.State.flags) return;
      Game.State.flags.menuOpen = !Game.State.flags.menuOpen;

      if (Game.UI && typeof Game.UI.requestRenderAll === "function") {
        Game.UI.requestRenderAll();
      } else if (Game.UI && typeof Game.UI.renderAll === "function") {
        Game.UI.renderAll();
      }
    }, true);
  })();

  // Global Enter helper
  // Goal: Enter works anywhere it should (start button, send message, DM actions, etc.)
  // Priority:
  // 1) data-enter-target="<buttonId>" (explicit)
  // 2) nearest button[type=submit] inside the same form
  // 3) nearest clickable button in the same panel header/body (best-effort)
  (function bindEnterHelperOnce(){
    if (document.__enterHelperBound) return;
    document.__enterHelperBound = true;

    function findNearbyActionButton(inputEl){
      if (!inputEl) return null;

      // Explicit mapping always wins
      const targetId = inputEl.dataset ? inputEl.dataset.enterTarget : null;
      if (targetId) {
        const btn = document.getElementById(String(targetId));
        if (btn) return btn;
      }

      // If inside a form, prefer submit button
      const form = inputEl.closest && inputEl.closest("form");
      if (form) {
        const submit = form.querySelector('button[type="submit"],input[type="submit"],button[data-primary="1"]');
        if (submit) return submit;
      }

      // Panel-scoped fallback: try to find a primary action in the same UI block
      const panel = inputEl.closest && (inputEl.closest(".panel") || inputEl.closest(".card") || inputEl.closest("#boot") || inputEl.closest("#dm") || inputEl.closest("#chat") || inputEl.closest("#menu") || inputEl.closest("#battles"));
      if (panel) {
        const candidates = panel.querySelectorAll("button");
        // Prefer obvious primary buttons by id/class/text
        const preferred = Array.from(candidates).find(b => {
          if (!b) return false;
          if (b.disabled) return false;
          const id = String(b.id || "");
          const cls = String(b.className || "");
          const txt = String(b.textContent || "").trim().toLowerCase();
          if (/start|begin|go|send|submit|ok|done|apply|attack|battle|забаттл|начать|отправ/i.test(id)) return true;
          if (/primary|main|submit/i.test(cls)) return true;
          if (/^(начать|отправить|ok|готово|принять)$/i.test(txt)) return true;
          return false;
        });
        if (preferred) return preferred;

        // Otherwise take the first enabled button
        const firstEnabled = Array.from(candidates).find(b => b && !b.disabled);
        if (firstEnabled) return firstEnabled;
      }

      return null;
    }

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;

      const t = e.target;
      if (!t) return;

      const tag = String(t.tagName || "").toLowerCase();
      if (tag !== "input" && tag !== "textarea") return;
      if (t.dataset && t.dataset.enterMode === "custom") return;

      // Textareas: allow Shift+Enter for newline, otherwise treat Enter as action.
      if (tag === "textarea" && e.shiftKey) return;

      const btn = findNearbyActionButton(t);
      if (!btn) return;

      // Prevent accidental form submit / double actions
      e.preventDefault();
      e.stopPropagation();

      try { btn.click(); } catch (_) {}
    }, true);
  })();

  // Convenience helper for modules to mark an input with a target button id.
  UI.bindEnterTo = function(inputEl, targetButtonId){
    if (!inputEl || !targetButtonId) return;
    try { inputEl.dataset.enterTarget = String(targetButtonId); } catch (_) {}
  };

  window.__S = S;
})();
