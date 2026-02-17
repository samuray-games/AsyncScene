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
  // Важно: не перетираем уже существующий Game.__S (его могли создать другие модули).
  // Вместо этого заполняем отсутствующие поля дефолтами.
  const S = Game.__S = Game.__S || {};

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
  if (!("collapsedCounters" in S.flags)) S.flags.collapsedCounters = {};

  // Дефолты DM
  if (!("dm" in S) || !S.dm) S.dm = {};
  if (!("open" in S.dm)) S.dm.open = false;
  if (!("withId" in S.dm)) S.dm.withId = null;
  // DM tabs (chips): multiple open threads in one DM panel
  if (!("openIds" in S.dm) || !Array.isArray(S.dm.openIds)) S.dm.openIds = [];
  if (!("activeId" in S.dm)) S.dm.activeId = null;
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
      if (Game && Game.__D && Game.__D.SHOW_NPC_BALANCES === true) return true;
      if (typeof window !== "undefined") {
        if (window.__DEV__ === true || window.DEV === true) return true;
        if (_hasExplicitDevQueryParam()) return true;
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
  Game.Rules = Game.Rules || {};
  Game.Rules.isP2PTransfersEnabled = function() {
    try {
      if (Game.Data && typeof Game.Data.isP2PTransfersEnabled === "function") {
        return !!Game.Data.isP2PTransfersEnabled();
      }
      const rules = (Game.Data && Game.Data.RULES) ? Game.Data.RULES : null;
      return !!(rules && rules.p2pTransfersEnabled);
    } catch (_) {
      return false;
    }
  };
  Game.Rules.setP2PTransfersEnabled = function(value) {
    if (Game.Data && typeof Game.Data.setP2PTransfersEnabled === "function") {
      return Game.Data.setP2PTransfersEnabled(value);
    }
    if (!Game.Data) Game.Data = {};
    if (!Game.Data.RULES) Game.Data.RULES = {};
    Game.Data.RULES.p2pTransfersEnabled = !!value;
    return Game.Data.RULES.p2pTransfersEnabled;
  };
  Game.Rules.isP2PPlayerToPlayerEnabled = function() {
    try {
      if (Game.Data && typeof Game.Data.isP2PPlayerToPlayerEnabled === "function") {
        return !!Game.Data.isP2PPlayerToPlayerEnabled();
      }
      const rules = (Game.Data && Game.Data.RULES) ? Game.Data.RULES : null;
      return !!(rules && rules.p2pPlayerToPlayerEnabled);
    } catch (_) {
      return false;
    }
  };
  Game.Rules.setP2PPlayerToPlayerEnabled = function(value) {
    if (Game.Data && typeof Game.Data.setP2PPlayerToPlayerEnabled === "function") {
      return Game.Data.setP2PPlayerToPlayerEnabled(value);
    }
    if (!Game.Data) Game.Data = {};
    if (!Game.Data.RULES) Game.Data.RULES = {};
    Game.Data.RULES.p2pPlayerToPlayerEnabled = !!value;
    return Game.Data.RULES.p2pPlayerToPlayerEnabled;
  };
  const P2P_BACKLOG_TITLE = "Передача пойнтов: пока недоступна.";
  const P2P_BACKLOG_REASON = "Причина: анти-абуз и баланс.";
  const P2P_BACKLOG_EXPLAIN = "Передача пока отключена из-за анти-абуза и баланса.";
  Game.Rules.isP2PBacklogActive = function() {
    const transfersEnabled = Game.Rules.isP2PTransfersEnabled();
    const playerToPlayerEnabled = Game.Rules.isP2PPlayerToPlayerEnabled();
    return !transfersEnabled || !playerToPlayerEnabled;
  };
  UI.createP2PBacklogBlock = function({ onExplain }) {
    const wrapper = document.createElement("div");
    wrapper.className = "p2pBacklogBlock";
    const title = document.createElement("div");
    title.className = "p2pBacklogBlock__title";
    title.textContent = P2P_BACKLOG_TITLE;
    const reason = document.createElement("div");
    reason.className = "p2pBacklogBlock__reason";
    reason.textContent = P2P_BACKLOG_REASON;
    const explain = document.createElement("button");
    explain.type = "button";
    explain.className = "p2pBacklogBlock__link";
    explain.textContent = "Почему?";
    explain.style.cursor = "pointer";
    explain.style.border = "none";
    explain.style.background = "none";
    explain.style.padding = "0";
    explain.style.textDecoration = "underline";
    explain.style.color = "inherit";
    explain.setAttribute("aria-role", "button");
    explain.addEventListener("click", () => {
      if (typeof onExplain === "function") onExplain(P2P_BACKLOG_EXPLAIN);
    });
    wrapper.appendChild(title);
    wrapper.appendChild(reason);
    wrapper.appendChild(explain);
    return wrapper;
  };



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

  function _hasExplicitDevQueryParam(){
    if (typeof location === "undefined" || !location) return false;
    const search = location.search;
    if (!search) return false;
    try {
      const params = new URLSearchParams(search);
      return params.get("dev") === "1";
    } catch (_) {
      return false;
    }
  }

  function _isDevFlag(){
    try {
      if (typeof window !== "undefined") {
        if (window.__DEV__ === true || window.DEV === true) return true;
        if (_hasExplicitDevQueryParam()) return true;
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
    const __logToneHUD = (() => {
      try {
        // Console spam can freeze input when DevTools is open. Log only when explicitly enabled.
        return (_isDevFlag() && (window.__LOG_TONEHUD === true || (Game && Game.__D && Game.__D.LOG_TONEHUD === true)));
      } catch (_) { return false; }
    })();

    if (!nextSubKey) {
      dom.next.innerHTML = `Предел: <span style="${colorStyleForTierKey(colorKey)}font-weight:900;">${escapeHtml(subLabel)}</span>`;
      if (__logToneHUD) {
        console.log(`[ToneHUD] influence=${inf} cur=${subKey} next=K remaining=0`);
      }
      return;
    }

    const remaining = Math.max(1, (left == null ? 1 : left));
    dom.next.innerHTML = `До <span style="${colorStyleForTierKey(nextColorKey)}font-weight:900;">${escapeHtml(nextLabel)}</span>: ${remaining} ⚡`;
    if (__logToneHUD) {
      console.log(`[ToneHUD] influence=${inf} cur=${subKey} next=${nextSubKey} remaining=${remaining}`);
    }
  };

  function _wrapInfluenceSync(){
    if (UI._argPillSyncWrapped) return;
    try {
      if (Game.__A && typeof Game.__A.syncMeToPlayers === "function") {
        const orig = Game.__A.syncMeToPlayers;
        if (!orig._argPillWrapped) {
          Game.__A.syncMeToPlayers = function(...args){
            const res = orig.apply(this, args);
            try { if (UI && typeof UI.updateArgStrengthPills === "function") UI.updateArgStrengthPills(); } catch (_) {}
            return res;
          };
          Game.__A.syncMeToPlayers._argPillWrapped = true;
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
        const inf = Number(S?.me?.influence ?? 0);
        const forced = (typeof window !== "undefined") ? window.DEV_FORCE_ARG_COLOR : null;
        if (inf === lastInf && forced === lastForced) return;
        lastInf = inf;
        lastForced = forced;
        if (UI && typeof UI.updateArgStrengthPills === "function") {
          UI.updateArgStrengthPills();
        }
      } catch (_) {}
    }, 500);
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
    // Track stat values for UI, but do NOT generate delta-toasts here.
    // Delta-toasts must be emitted at the moment the stat changes (see UI.emitStatDelta),
    // not deferred until a render pass (no batching / no aggregation).
    UI.__prevStats = UI.__prevStats || { influence: 0, points: 0, rep: 0, wins: 0 };
    const prev = UI.__prevStats;
    
    const stats = ["influence", "points", "rep", "wins"];
    for (const key of stats) {
      const cur = (next && Number.isFinite(next[key])) ? (next[key] | 0) : 0;
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

  const activeDeltaToasts = {};

  function dismissDeltaToast(kind){
    const prev = activeDeltaToasts[kind];
    if (prev && prev.el) {
      try { prev.el.remove(); } catch (_) { try { prev.el.style.display = "none"; } catch (_) {} }
    }
    delete activeDeltaToasts[kind];
  }

  function showDeltaToastInstant(kind, delta){
    const d = (delta | 0);
    if (!kind || !d) return;
    const anchor = statAnchor(kind);
    if (!anchor) return;

    const icons = { influence: "⚡", rep: "⭐", points: "💰", wins: "🏆" };
    const icon = icons[kind] || "";
    const prev = activeDeltaToasts[kind];
    const value = (prev && typeof prev.value === "number") ? (prev.value | 0) : 0;
    const nextValue = value + d;
    const sign = nextValue > 0 ? "+" : "";
    const text = `${icon} ${sign}${nextValue}`;

    const r = anchor.getBoundingClientRect();
    const left = Math.round(r.left + (r.width / 2));
    const top = Math.round(r.bottom + 8);

    let toast = prev ? prev.el : null;
    if (!toast) {
      toast = document.createElement("div");
      toast.id = `statToast_delta_${kind}`;
      toast.className = "statToast statToast--delta";
      toast.dataset.deltaKind = kind;
      toast.onclick = () => dismissDeltaToast(kind);
      document.body.appendChild(toast);
    }

    toast.textContent = text;
    toast.style.left = `${left}px`;
    toast.style.top = `${top}px`;
    toast.style.display = "block";
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%)";

    activeDeltaToasts[kind] = { el: toast, value: nextValue };
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

  UI.emitStatDelta = (kind, delta, opts) => {
    if (!kind || !Number.isFinite(Number(delta || 0)) || (delta | 0) === 0) return;
    // Must be immediate: same tick as the stat mutation, without batching/aggregation.
    showDeltaToastInstant(kind, (delta | 0));
  };

  // De-dup stat toasts by text (hide previous identical ones).
  (function(){
    if (UI.__statToastDedupPatched) return;
    UI.__statToastDedupPatched = true;
    const prev = UI.showStatToast;
    UI.showStatToast = (kind, text) => {
      try {
        const msg = String(text || "");
        const existing = Array.from(document.querySelectorAll(".statToast"));
        for (const el of existing) {
          try {
            // Do not de-dup delta-toasts: each delta must be visible separately.
            if (el && el.classList && el.classList.contains("statToast--delta")) continue;
            if (el && el.textContent === msg) el.style.display = "none";
          } catch (_) {}
        }
      } catch (_) {}
      return prev(kind, text);
    };
  })();

  // Action toast anchored to any element (e.g., button near an input).
  // Used for "Выбери игрока." under submit buttons.
  UI.showActionToast = (anchorEl, text) => {
    if (!anchorEl || !anchorEl.getBoundingClientRect) return;
    const id = `actionToast_${String(anchorEl.id || "anon")}`;
    let toast = document.getElementById(id);
    if (!toast) {
      toast = document.createElement("div");
      toast.id = id;
      toast.className = "statToast";
      toast.onclick = () => { toast.style.display = "none"; };
      document.body.appendChild(toast);
    }
    toast.textContent = String(text || "");
    const r = anchorEl.getBoundingClientRect();
    const left = Math.round(r.left + (r.width / 2));
    const top = Math.round(r.bottom + 8);
    toast.style.left = `${left}px`;
    toast.style.top = `${top}px`;
    toast.style.display = "block";
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%)";
  };

  // Hide all but the newest identical toast (prevents piling duplicates).
  (function(){
    if (UI.__toastDedupPatched) return;
    UI.__toastDedupPatched = true;
    const prev = UI.showActionToast;
    UI.showActionToast = (anchorEl, text) => {
      try {
        const msg = String(text || "");
        const existing = Array.from(document.querySelectorAll(".statToast"));
        for (const el of existing) {
          try {
            if (el && el.textContent === msg) el.style.display = "none";
          } catch (_) {}
        }
      } catch (_) {}
      return prev(anchorEl, text);
    };
  })();

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
  UI.withPointsWrite = (fn) => {
    if (typeof fn !== "function") return;
    if (typeof Game._withPointsWrite === "function") {
      Game._withPointsWrite(fn);
    } else {
      fn();
    }
  };

  UI.buildPlayers = () => {
    S.players = S.players || {};
    if (S.me) {
      UI.withPointsWrite(() => {
        S.players["me"] = S.players["me"] || {
          id:"me",
          name: S.me.name,
          influence: Number.isFinite(S.me.influence) ? S.me.influence : (parseInt(S.me.influence,10) || 0),
          points: Number.isFinite(S.me.points) ? S.me.points : (parseInt(S.me.points,10) || 0),
          wins: Number.isFinite(S.me.wins) ? S.me.wins : (parseInt(S.me.wins,10) || 0),
          role:"me"
        };
      });
    }

    const npcs = (Game.NPC && Game.NPC.getAll) ? Game.NPC.getAll() : [];
    npcs.forEach(n => {
      if (!S.players[n.id]) {
        UI.withPointsWrite(() => {
          S.players[n.id] = { ...n };
        });
      } else {
        UI.withPointsWrite(() => {
          Object.assign(S.players[n.id], n);
        });
      }
    });
    UI.requestRenderAll();
  };

  // ------------------------------
  // Mentions: centralized candidates list for UI modules.
  // Important: ui-core MUST NOT install global key handlers that could intercept "@".
  UI.getAllMentionCandidates = function(){
    // Prefer StateAPI if it exists (single source of truth).
    if (Game.__A && typeof Game.__A.getAllMentionCandidates === "function") {
      try { return Game.__A.getAllMentionCandidates(); } catch(_) {}
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
  // Ensure utility UI affordances (like clear buttons) exist after any render.
  UI.ensureClearButtons = function(root){
    const r = root || document;
    if (!r || !r.querySelectorAll) return;
    const inputs = Array.from(r.querySelectorAll("input, textarea"));
    for (const el of inputs) {
      try {
        if (!el || el.__clearBtnAdded) continue;
        try { if (el.dataset && (el.dataset.noAutoClear === "1" || el.dataset.noAutoClear === "true")) continue; } catch(_) {}
        const tag = String(el.tagName || "").toLowerCase();
        if (tag !== "input" && tag !== "textarea") continue;
        if (tag === "input") {
          const type = String(el.type || "text").toLowerCase();
          // Only for text-like inputs
          if (!["text","search","tel","url","email","password","number"].includes(type)) continue;
        }
        // Skip readonly/disabled fields
        if (el.disabled) continue;

        // Wrap input with a flex-safe container (same logic as ui-boot).
        const parent = el.parentNode;
        if (!parent) continue;

        // If already wrapped by our wrapper, just mark and continue.
        const p = el.parentElement;
        if (p && p.dataset && p.dataset.clearWrap === "1") {
          el.__clearBtnAdded = true;
          continue;
        }

        el.__clearBtnAdded = true;

        const wrapper = document.createElement("div");
        wrapper.className = "inputClearWrap";
        wrapper.dataset.clearWrap = "1";
        wrapper.style.position = "relative";
        wrapper.style.display = "flex";
        wrapper.style.alignItems = "center";
        wrapper.style.width = "auto";
        try {
          const cs = window.getComputedStyle ? getComputedStyle(el) : null;
          const flex = cs ? cs.flex : "";
          const minw = cs ? cs.minWidth : "";
          if (flex) wrapper.style.flex = flex;
          if (minw) wrapper.style.minWidth = minw;
        } catch (_) {}

        parent.insertBefore(wrapper, el);
        wrapper.appendChild(el);

        el.style.paddingRight = "28px";
        el.style.flex = el.style.flex || "1 1 auto";
        el.style.width = "100%";

        const clearBtn = document.createElement("button");
        clearBtn.type = "button";
        clearBtn.textContent = "×";
        clearBtn.className = "btn small";
        try { clearBtn.dataset.enterIgnore = "1"; } catch (_) {}
        clearBtn.style.position = "absolute";
        clearBtn.style.right = "4px";
        clearBtn.style.top = "50%";
        clearBtn.style.transform = "translateY(-50%)";
        clearBtn.style.padding = "0 6px";
        clearBtn.style.minWidth = "0";
        clearBtn.style.background = "transparent";
        clearBtn.style.border = "none";
        clearBtn.style.cursor = "pointer";
        clearBtn.style.fontSize = "18px";
        clearBtn.style.lineHeight = "1";
        clearBtn.style.display = (String(el.value || "").trim()) ? "" : "none";
        clearBtn.onclick = (e) => {
          try { e.preventDefault(); e.stopPropagation(); } catch (_) {}
          try {
            el.value = "";
            clearBtn.style.display = "none";
            el.focus();
            el.dispatchEvent(new Event("input", { bubbles: true }));
          } catch (_) {}
        };
        wrapper.appendChild(clearBtn);

        el.addEventListener("input", () => {
          try { clearBtn.style.display = (String(el.value || "").trim()) ? "" : "none"; } catch (_) {}
        });
      } catch (_) {}
    }
  };

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
        const overflow = Number.isFinite(S.overPoints)
          ? (S.overPoints | 0)
          : ((S.points && Number.isFinite(S.points.overflow)) ? (S.points.overflow | 0) : 0);
        if (pts > cap) {
          mp.textContent = String(pts);
          mp.classList.add("points-softcap");
          mp.style.color = "#ff3b30";
        } else {
          mp.textContent = String(pts);
          mp.classList.remove("points-softcap");
          mp.style.color = "";
        }
        if (mpOverflow) {
          const val = overflow > 0 ? `×${String(Math.min(overflow, 5))}` : "";
          mpOverflow.textContent = val;
          // Small badge (black/white via var(--text))
          mpOverflow.style.display = val ? "inline-block" : "none";
          mpOverflow.style.marginLeft = "6px";
          mpOverflow.style.padding = "1px 6px";
          mpOverflow.style.borderRadius = "999px";
          mpOverflow.style.fontSize = "11px";
          mpOverflow.style.lineHeight = "14px";
          mpOverflow.style.fontWeight = "900";
          mpOverflow.style.color = "var(--text)";
          mpOverflow.style.border = "1px solid rgba(127,127,127,0.35)";
          mpOverflow.style.background = "transparent";
        }
        if (pointsNote) {
          pointsNote.textContent = "";
          pointsNote.style.display = "none";
        }
        // Hover: show cap message when at cap (use Data.CAP_MESSAGES.points)
        try {
          const capMsg = (Game.Data && Game.Data.CAP_MESSAGES && typeof Game.Data.CAP_MESSAGES.points === "string")
            ? String(Game.Data.CAP_MESSAGES.points)
            : "";
          const wrap = mp.closest(".pointsWrap");
          if (wrap) {
            if (pts >= cap && capMsg) wrap.setAttribute("title", capMsg);
            else wrap.removeAttribute("title");
          }
          if (mpOverflow) {
            if (pts >= cap && capMsg) mpOverflow.setAttribute("title", capMsg);
            else mpOverflow.removeAttribute("title");
          }
          if (mp) {
            if (pts >= cap && capMsg) mp.setAttribute("title", capMsg);
            else mp.removeAttribute("title");
          }
        } catch (_) {}
      }
      if (mr) mr.textContent = String(S.rep || 0);
      if (mneed) {
        const need = (Game.__A && typeof Game.__A.repNeedForNextInfluence === "function")
          ? Game.__A.repNeedForNextInfluence()
          : 0;
        mneed.textContent = String(need || 0);
        const capActive = (Game.__A && typeof Game.__A.weeklyCapActive === "function")
          ? Game.__A.weeklyCapActive()
          : false;
        if (capActive) {
          mneed.classList.add("is-cap");
          mneed.style.color = "#ff3b30";
          try {
            const capMsg = (Game.Data && Game.Data.CAP_MESSAGES && typeof Game.Data.CAP_MESSAGES.rep === "string")
              ? String(Game.Data.CAP_MESSAGES.rep)
              : "";
            if (capMsg) mneed.setAttribute("title", capMsg);
            else mneed.removeAttribute("title");
          } catch (_) { mneed.removeAttribute("title"); }
        } else {
          mneed.classList.remove("is-cap");
          mneed.removeAttribute("title");
          mneed.style.color = "";
        }
      }
      if (capNote) capNote.textContent = "";
      if (capLine) {
        let text = "";
        try {
          const active = (Game.__A && typeof Game.__A.weeklyCapActive === "function")
            ? Game.__A.weeklyCapActive()
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
      try { if (UI.ensureClearButtons) UI.ensureClearButtons(document); } catch (_) {}

      // Safety: keep overlay-pointer-events state consistent every full render.
      // Prevents rare "everything is unclickable" when DOM was rebuilt without re-applying panel classes.
      try { if (UI.updatePanelOverlayState) UI.updatePanelOverlayState(); } catch (_) {}

      // If any module requested another render during this run, it will be queued.
    } finally {
      UI.__renderAllRunning = false;
    }
  };


  UI.normalizePublic = normalizePublic;

  // ------------------------------
  // Step 10: Panel sizes (collapsed / medium / max) - centralized helpers
  // Source of truth: Game.__A (preferred) -> S.flags fallback
  const __PANEL_ORDER = ["collapsed", "medium", "max"];

  function __normalizePanelSize(size){
    const s = String(size || "").toLowerCase().trim();
    return (s === "collapsed" || s === "medium" || s === "max") ? s : "medium";
  }

  function __getSizesFromState(){
    // Preferred source: Game.__A (state.js)
    try{
      if (Game.__A && typeof Game.__A.getPanelSizes === "function") {
        const z = Game.__A.getPanelSizes();
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

    const applyNow = () => {
      try {
        const map = { dm: "dmBlock", battles: "battlesBlock", events: "eventsBlock", locations: "locationsBlock" };
        const id = map[k] || null;
        const el = id ? document.getElementById(id) : null;
        if (el && typeof UI.applyPanelSizeClasses === "function") {
          UI.applyPanelSizeClasses(el, k);
        }
      } catch (_) {}
    };

    // Preferred: StateAPI setter
    try{
      if (Game.__A && typeof Game.__A.setPanelSize === "function") {
        Game.__A.setPanelSize(k, s);
        applyNow();
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
    try {
      if (typeof UI.resetCollapsedCounter === "function" && s !== "collapsed") UI.resetCollapsedCounter(k);
    } catch (_) {}
    applyNow();
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

  UI.__panelHeaderCounts = UI.__panelHeaderCounts || {};
  UI.pulsePanelHeader = function(key, header, count, duration = 650){
    if (!key || !header) return;
    const prev = UI.__panelHeaderCounts[key] || 0;
    UI.__panelHeaderCounts[key] = count;
    if (count > prev) {
      header.classList.remove("panelHeader--hot");
      header.classList.add("panelHeader--hot");
      if (duration > 0) {
        setTimeout(() => {
          try { header.classList.remove("panelHeader--hot"); } catch (_) {}
        }, duration);
      }
    }
  };

  function __getPanelCounterMap() {
    if (!S.flags) S.flags = {};
    if (!S.flags.collapsedCounters) S.flags.collapsedCounters = {};
    return S.flags.collapsedCounters;
  }

  UI.getCollapsedCounter = function(key){
    if (!key) return 0;
    const map = __getPanelCounterMap();
    const value = map[key];
    if (Number.isFinite(value)) return value;
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  UI.bumpCollapsedCounter = function(key){
    if (!key) return 0;
    const map = __getPanelCounterMap();
    const current = (Number.isFinite(map[key]) ? map[key] : parseInt(map[key], 10) || 0) + 1;
    map[key] = current;
    return current;
  };

  UI.resetCollapsedCounter = function(key){
    const map = __getPanelCounterMap();
    if (key) {
      map[key] = 0;
    } else {
      Object.keys(map).forEach(k => { map[k] = 0; });
    }
    try { if (typeof UI.requestRenderAll === "function") UI.requestRenderAll(); } catch (_) {}
  };

  UI.isPanelCollapsed = function(key){
    if (!key) return false;
    try {
      if (typeof UI.getPanelSize === "function") {
        return UI.getPanelSize(key) === "collapsed";
      }
    } catch (_) {}
    return false;
  };

  function __hasVisibleMaxPanel(blocks){
    const list = Array.from(blocks.querySelectorAll(".block.panel--full, .panel.panel--full, .block.size-max, .panel.size-max"));
    return list.some(el => {
      try {
        if (!el || el.isConnected !== true) return false;
        const cs = window.getComputedStyle ? window.getComputedStyle(el) : null;
        if (cs && (cs.display === "none" || cs.visibility === "hidden")) return false;
        if (cs && Number.isFinite(parseFloat(cs.opacity)) && parseFloat(cs.opacity) <= 0) return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      } catch (_) { return false; }
    });
  }

  UI.updatePanelOverlayState = function(){
    try {
      const right = document.getElementById("right");
      const blocks = document.getElementById("blocks");
      if (!right || !blocks) return;
      // Only treat as overlay if there is a VISIBLE max panel.
      // Otherwise we can get stuck in a state where everything becomes unclickable
      // (pointer-events:none on all blocks except a hidden/removed max panel).
      const hasMax = __hasVisibleMaxPanel(blocks);
      right.classList.toggle("has-overlay-panel", !!hasMax);
      blocks.classList.toggle("has-overlay-panel", !!hasMax);
    } catch (_) {}
  };

  UI.ensureOverlayClean = function(){
    try {
      const right = document.getElementById("right");
      const blocks = document.getElementById("blocks");
      if (!right || !blocks) return;
      if (!right.classList.contains("has-overlay-panel") && !blocks.classList.contains("has-overlay-panel")) return;
      const hasMax = __hasVisibleMaxPanel(blocks);
      if (!hasMax) {
        right.classList.remove("has-overlay-panel");
        blocks.classList.remove("has-overlay-panel");
      }
    } catch (_) {}
  };

  // Watchdog: if overlay class is stuck but no visible max panel exists, clear it.
  // This avoids rare "scroll works but nothing is clickable" freezes.
  try {
    if (!window.__overlayWatchdogBound) {
      window.__overlayWatchdogBound = true;
      setInterval(() => {
        try {
          const right = document.getElementById("right");
          const blocks = document.getElementById("blocks");
          if (!right || !blocks) return;
          if (!blocks.classList.contains("has-overlay-panel") && !right.classList.contains("has-overlay-panel")) return;
          const hasVisible = __hasVisibleMaxPanel(blocks);
          if (!hasVisible) {
            right.classList.remove("has-overlay-panel");
            blocks.classList.remove("has-overlay-panel");
          }
        } catch (_) {}
      }, 500);
    }
  } catch (_) {}

  // Debug helpers (console-first): identify what blocks clicks.
  try {
    if (!window.__uiInputBlockerDebugBound) {
      window.__uiInputBlockerDebugBound = true;

      window.__dumpInputBlockers = function(x, y){
        try {
          const vx = Number.isFinite(x) ? x : (window.innerWidth / 2);
          const vy = Number.isFinite(y) ? y : (window.innerHeight / 2);
          const el = document.elementFromPoint(vx, vy);
          const stack = (document.elementsFromPoint ? document.elementsFromPoint(vx, vy) : (el ? [el] : [])) || [];
          const right = document.getElementById("right");
          const blocks = document.getElementById("blocks");
          const st = document.getElementById("startScreen");
          const info = (node) => {
            if (!node) return null;
            const cs = window.getComputedStyle(node);
            return {
              tag: node.tagName,
              id: node.id || null,
              cls: node.className || null,
              pe: cs.pointerEvents,
              pos: cs.position,
              z: cs.zIndex,
              disp: cs.display,
              op: cs.opacity,
              rect: node.getBoundingClientRect ? (() => {
                const r = node.getBoundingClientRect();
                return { left: Math.round(r.left), top: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height) };
              })() : null
            };
          };
          const summarize = (x) => {
            if (!x) return "";
            const id = x.id ? `#${x.id}` : "";
            const cls = x.cls ? `.${String(x.cls).trim().split(/\s+/).slice(0, 4).join(".")}` : "";
            const z = (x.z != null && x.z !== "" && x.z !== "auto") ? ` z=${x.z}` : "";
            return `${x.tag || "?"}${id}${cls} pe=${x.pe} pos=${x.pos}${z} disp=${x.disp} op=${x.op}`;
          };
          return {
            at: { x: Math.round(vx), y: Math.round(vy) },
            topElement: info(el),
            stack: stack.slice(0, 12).map(info),
            topSummary: summarize(info(el)),
            stackSummary: stack.slice(0, 12).map(n => summarize(info(n))),
            overlay: {
              rightHasOverlay: !!(right && right.classList.contains("has-overlay-panel")),
              blocksHasOverlay: !!(blocks && blocks.classList.contains("has-overlay-panel")),
            },
            startScreen: info(st),
          };
        } catch (e) {
          return { ok:false, error: String(e && e.message ? e.message : e) };
        }
      };

      // Optional live logging: enable with `window.__LOG_INPUT_BLOCKERS = true`
      document.addEventListener("pointerdown", (ev) => {
        try {
          if (!window.__LOG_INPUT_BLOCKERS) return;
          const x = ev && typeof ev.clientX === "number" ? ev.clientX : null;
          const y = ev && typeof ev.clientY === "number" ? ev.clientY : null;
          // Throttle to avoid console-induced freezes
          const now = Date.now();
          if (window.__lastInputBlockersLogAt && (now - window.__lastInputBlockersLogAt) < 200) return;
          window.__lastInputBlockersLogAt = now;
          console.log("[inputBlockers]", window.__dumpInputBlockers(x, y));
        } catch (_) {}
      }, true);
    }
  } catch (_) {}

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

      if (!Game.__S || !Game.__S.flags) return;
      Game.__S.flags.menuOpen = !Game.__S.flags.menuOpen;

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
          // Ignore buttons that explicitly opt-out from Enter-triggered actions.
          try { if (b.dataset && (b.dataset.enterIgnore === "1" || b.dataset.enterIgnore === "true")) return false; } catch(_) {}
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
        const firstEnabled = Array.from(candidates).find(b => {
          try { if (b.dataset && (b.dataset.enterIgnore === "1" || b.dataset.enterIgnore === "true")) return false; } catch(_) {}
          return b && !b.disabled;
        });
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
