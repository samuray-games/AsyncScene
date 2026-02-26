// conflict-arguments.js
//
//  conflict-arguments.js
//  AsyncScene
//
//  Created by Ray on 2025/12/18.
//

// conflict/conflict-arguments.js
(function () {
  const A = {};
  const _argsCtxMissingOnce = new Set();
  try {
    console.warn("CONFLICT_ARGUMENTS_PARSE_OK_V1", {
      ts: Date.now(),
      buildTag: (typeof Game !== "undefined" && Game && Game.__buildTag) ? Game.__buildTag : null
    });
  } catch (_) {}
  try {
    console.warn("ARGS_PARSE_OK_V2", { ts: Date.now(), tag: "ctx_dup_fix_1" });
  } catch (_) {}

  function safeList(arr) {
    return Array.isArray(arr) ? arr : [];
  }

  // Accept arrays or arbitrarily nested objects of arrays.
  // Examples supported:
  // - [ {..}, {..} ]
  // - { yesno:[..], who:[..] }
  // - { yesno:{ y:[..], o:[..] }, who:{ y:[..] } }
  function flattenArgs(src) {
    const out = [];

    const walk = (v) => {
      if (!v) return;
      if (Array.isArray(v)) {
        for (const item of v) out.push(item);
        return;
      }
      if (typeof v === "object") {
        for (const vv of Object.values(v)) walk(vv);
      }
    };

    walk(src);
    return out;
  }

  function getUtil() {
    // Support both window.Util and Game.Util
    if (typeof window !== "undefined" && window.Util && typeof window.Util.pickN === "function") return window.Util;
    if (typeof Game !== "undefined" && Game && Game.Util && typeof Game.Util.pickN === "function") return Game.Util;
    return null;
  }

  function pickN(pool, n) {
    const src = safeList(pool).slice();
    const U = getUtil();
    if (U) {
      // Some Util.pickN implementations return [] when pool < n.
      // We want "up to n" here and we will pad later.
      const out = U.pickN(src, Math.min(n, src.length));
      return safeList(out);
    }
    // Fallback: simple shuffle, take n.
    for (let i = src.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [src[i], src[j]] = [src[j], src[i]];
    }
    return src.slice(0, Math.min(n, src.length));
  }

  function padToN(list, n) {
    const out = safeList(list).slice();
    if (n <= 0) return [];
    if (out.length === 0) return [];
    const base = out.slice();
    let i = 0;
    while (out.length < n) {
      out.push(base[i % base.length]);
      i++;
    }
    return out.slice(0, n);
  }

  function makeFallbackDefense(group, color) {
    const g = normGroup(group) || "yn";
    const c = (color === "k" || color === "r" || color === "o" || color === "y") ? color : "y";

    const mk = (idx, text) => ({
      id: `__fallback_def_${g}_${c}_${idx}`,
      color: c,
      group: g,
      text
    });

    if (g === "where") {
      return [
        mk(1, "Извините, кажется, где-то рядом, но я не уверен."),
        mk(2, "Возможно, у входа или около площади."),
        mk(3, "Проверьте, пожалуйста, рядом с вывеской или у перекрестка.")
      ];
    }
    if (g === "who") {
      return [
        mk(1, "Извините, возможно, это кто-то из местных."),
        mk(2, "Похоже, это человек из толпы, но я не уверен."),
        mk(3, "Кажется, это кто-то знакомый, но я не ручаюсь.")
      ];
    }
    // yn
    return [
      mk(1, "Эм... да, наверное."),
      mk(2, "Скорее да, но я не уверен."),
      mk(3, "Наверное нет... простите, я сомневаюсь.")
    ];
  }

  function getCore() {
    if (typeof Game === "undefined" || !Game) return null;
    return Game._ConflictCore || Game.ConflictCore || null;
  }

  function getProgressionUnlocks() {
    const P = (typeof Game !== "undefined" && Game && Game.Data && Game.Data.PROGRESSION) ? Game.Data.PROGRESSION : null;
    const U = (P && P.unlockInfluence) ? P.unlockInfluence : null;
    const strong = (U && Number.isFinite(U.strong)) ? (U.strong | 0) : 5;
    const power = (U && Number.isFinite(U.power)) ? (U.power | 0) : 10;
    const absolute = (U && Number.isFinite(U.absolute)) ? (U.absolute | 0) : 100;
    return {
      strong: Math.max(0, strong),
      power: Math.max(0, power),
      absolute: Math.max(0, absolute),
    };
  }

  function unlockFromColor(color) {
    // Single source of truth: Game.Data.PROGRESSION.unlockInfluence
    // y: weak (0), o: strong, r: powerful, k: absolute
    const U = getProgressionUnlocks();
    if (color === "k") return U.absolute;
    if (color === "r") return U.power;
    if (color === "o") return U.strong;
    return 0; // y
  }

  function currentTierColor(level) {
    const inf = Number(level);
    const U = getProgressionUnlocks();
    if (Number.isFinite(inf) && inf >= U.absolute) return "k"; // absolute
    if (Number.isFinite(inf) && inf >= U.power) return "r";    // powerful
    if (Number.isFinite(inf) && inf >= U.strong) return "o";   // strong
    return "y"; // weak
  }

  function onlyTier(list, tier) {
    const t = tier || "y";
    return safeList(list).filter(a => a && a.color === t);
  }

  function isUnlocked(arg, level) {
    if (!arg) return false;
    // Prefer explicit unlock if present, otherwise derive from color
    const req = (arg.unlock != null) ? Number(arg.unlock) : unlockFromColor(arg.color);
    return (Number.isFinite(req) ? req : 0) <= level;
  }

  function normGroup(raw) {
    const s = String(raw || "").trim().toLowerCase();
    if (!s) return null;
    // Project canonical groups: yn | who | where
    if (s === "yn" || s === "yesno" || s === "yes-no" || s === "yes_no" || s === "да/нет" || s === "да-нет") return "yn";
    if (s === "about" || s === "topic" || s === "о чем" || s === "о-чем" || s === "о_чем") return "about";
    if (s === "who" || s === "what" || s === "who/what" || s === "who-what" || s === "кто" || s === "что" || s === "кто/что" || s === "кто-что") return "who";
    if (s === "where" || s === "где") return "where";
    return s; // allow future groups
  }

  function getGroup(arg) {
    if (!arg) return null;
    // Prefer `type` (used by attacks), then `group` (used by defense pool), then other aliases.
    return normGroup(arg.type || arg.group || arg.qtype || arg.kind || arg.questionType || null);
  }

  function lowestUnlockOfSameGroup(all, group, need, level) {
    const g = normGroup(group);
    const src = safeList(all)
      .filter(a => a && getGroup(a) === g)
      .slice();

    // Sort by required influence (explicit unlock wins, else from color)
    src.sort((a, b) => {
      const au = (a && a.unlock != null) ? Number(a.unlock) : unlockFromColor(a && a.color);
      const bu = (b && b.unlock != null) ? Number(b.unlock) : unlockFromColor(b && b.color);
      return (au || 0) - (bu || 0);
    });

    const unlocked = src.filter(a => isUnlocked(a, level));
    const locked = src.filter(a => !isUnlocked(a, level));

    const merged = unlocked.concat(locked);
    return merged.slice(0, need);
  }

  function normalizeInfluence(battle) {
    const me = (Game && Game.__S && Game.__S.me) ? Game.__S.me : { influence: 0 };
    const base = Number(me.influence);
    const boost = battle && Number.isFinite(battle.tempInfluenceBoost) ? (battle.tempInfluenceBoost | 0) : 0;
    const inf = (Number.isFinite(base) ? base : 0) + boost;
    return Number.isFinite(inf) ? inf : 0;
  }

  function hasExplicitDevQueryParam() {
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

  function isDevFlag() {
    return (
      (typeof window !== "undefined" && (window.__DEV__ === true || window.DEV === true)) ||
      hasExplicitDevQueryParam()
    );
  }

  function getForcedColor() {
    if (!isDevFlag()) return null;
    const raw = (typeof window !== "undefined") ? window.DEV_FORCE_ARG_COLOR : null;
    if (raw == null) return null;
    const v = String(raw).toLowerCase();
    if (v === "y" || v === "o" || v === "r" || v === "k") {
      console.log("[DEV] forcedColor applied:", v);
      return v;
    }
    console.log("[DEV] forcedColor ignored:", raw);
    return null;
  }

  function normalizeAttackType(arg) {
    const raw = (arg && (arg.type || arg.group || arg.pool || arg.qtype || arg.kind || arg.questionType))
      ? String(arg.type || arg.group || arg.pool || arg.qtype || arg.kind || arg.questionType)
      : "";
    const s = raw.trim().toLowerCase();
    if (!s) return "";
    if (s === "yesno" || s === "yes-no" || s === "yes_no" || s === "да/нет" || s === "да-нет") return "yn";
    if (s === "about" || s === "topic" || s === "о чем" || s === "о-чем" || s === "о_чем") return "about";
    if (s === "who" || s === "what" || s === "who/what" || s === "кто" || s === "что" || s === "кто/что") return "who";
    if (s === "where" || s === "где") return "where";
    return s;
  }

  function normalizeFinalText(text) {
    return String(text || "").replace(/\s+/g, " ").trim();
  }

  function allowedToneSet(toneInfo){
    if (!toneInfo) return null;
    try {
      if (typeof toneInfo === "string") {
        const s = String(toneInfo || "").toLowerCase().trim();
        if (!s) return null;
        return s.includes("/") ? s.split("/").map(x => x.trim()).filter(Boolean) : [s];
      }
      if (typeof toneInfo === "object") {
        if (Array.isArray(toneInfo.allowed) && toneInfo.allowed.length) {
          return toneInfo.allowed.map(x => String(x || "").toLowerCase().trim()).filter(Boolean);
        }
        if (typeof toneInfo.label === "string" && toneInfo.label.trim()) {
          const s = toneInfo.label.toLowerCase().trim();
          return s.includes("/") ? s.split("/").map(x => x.trim()).filter(Boolean) : [s];
        }
      }
    } catch (_) {}
    return null;
  }

  function logAttackPool(level, tier, basePool, typesWanted) {
    try {
      if (!Game || !Game.DEBUG_ATTACK_CHOICES) return;
      const counts = { about: 0, who: 0, where: 0, yn: 0, other: 0 };
      for (const it of (basePool || [])) {
        const t = normalizeAttackType(it);
        if (t === "about") counts.about++;
        else if (t === "who") counts.who++;
        else if (t === "where") counts.where++;
        else if (t === "yn") counts.yn++;
        else counts.other++;
      }
      const head = (basePool || []).slice(0, 5).map(it => ({
        id: it && it.id,
        type: it && it.type,
        group: it && it.group,
        text: it && it.text
      }));
      console.log("[AttackChoices] tier:", tier, "level:", level);
      console.log("[AttackChoices] basePool.length:", (basePool || []).length);
      console.log("[AttackChoices] counts:", counts, "typesWanted:", typesWanted);
      console.log("[AttackChoices] head:", head);
    } catch (_) {}
  }

  function pickUniqueAttackOptionsByType(poolTier, poolUnlocked, poolAll, typesWanted) {
    const usedIds = new Set();
    const usedTexts = new Set();
    const out = [];

    const byType = (list) => {
      const map = {};
      (list || []).forEach(it => {
        if (!it) return;
        const t = normalizeAttackType(it);
        if (!t) return;
        if (!map[t]) map[t] = [];
        map[t].push(it);
      });
      return map;
    };

    const mapTier = byType(poolTier);
    const mapUnlocked = byType(poolUnlocked);
    const mapAll = byType(poolAll);

    const pickFrom = (arr) => {
      const list = (arr || []).slice();
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }
      for (const it of list) {
        const id = it.id;
        const text = normalizeFinalText(it.text);
        if (id && usedIds.has(id)) continue;
        if (text && usedTexts.has(text)) continue;
        if (id) usedIds.add(id);
        if (text) usedTexts.add(text);
        return it;
      }
      return null;
    };

    for (const t of typesWanted) {
      let pick = pickFrom(mapTier[t]);
      if (!pick) pick = pickFrom(mapUnlocked[t]);
      if (!pick) pick = pickFrom(mapAll[t]);
      if (pick) out.push(pick);
    }

    if (out.length < 3) {
      const merged = poolTier.concat(poolUnlocked).concat(poolAll);
      for (let i = merged.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [merged[i], merged[j]] = [merged[j], merged[i]];
      }
      for (const it of merged) {
        if (!it || out.length >= 3) break;
        const id = it.id;
        const text = normalizeFinalText(it.text);
        if (id && usedIds.has(id)) continue;
        if (text && usedTexts.has(text)) continue;
        if (id) usedIds.add(id);
        if (text) usedTexts.add(text);
        out.push(it);
      }
    }

    return out;
  }

  function buildAttackOptions(battle) {
    const debugFlag = !!(Game && Game.DEBUG_ATTACK_CHOICES);
    if (debugFlag) console.log("[AttackChoices] myAttackOptions invoked");
    const level = normalizeInfluence(battle);
    const forced = getForcedColor();
    const D = (Game && Game.Data) ? Game.Data : null;
    const typesWanted = ["about", "who", "where", "yn"];

    const canonSubKeysByColor = (color) => {
      if (color === "k") return ["K"];
      if (color === "r") return ["R1", "R2", "R3", "R4"];
      if (color === "o") return ["O1", "O2", "O3"];
      return ["Y1", "Y2"];
    };

    const canonSubFromTierKey = (tierKey) => {
      const s = String(tierKey || "").trim();
      if (!s) return "Y1";
      const low = s.toLowerCase();
      if (low === "k" || low === "k1") return "K";
      if (low.startsWith("y")) return ("Y" + low.slice(1)).toUpperCase();
      if (low.startsWith("o")) return ("O" + low.slice(1)).toUpperCase();
      if (low.startsWith("r")) return ("R" + low.slice(1)).toUpperCase();
      return s.toUpperCase();
    };

    const canonColorFromSub = (subKey) => {
      const s = String(subKey || "").toUpperCase();
      if (s.startsWith("K")) return "k";
      if (s.startsWith("R")) return "r";
      if (s.startsWith("O")) return "o";
      return "y";
    };

    const pickCanonSub = () => {
      if (forced) {
        const subs = canonSubKeysByColor(forced);
        return pickN(subs, 1)[0] || subs[0] || "Y1";
      }
      // Variant 2: influence -> tierKeysByInfluence -> tierKey -> subKey.
      // "k" is allowed ONLY for mafia.
      const isPlayerAttack = !(battle && battle.fromThem === true);
      let myRole = "";
      let playerInf = 0;
      try {
        const me = (Game && Game.__S && Game.__S.me) ? Game.__S.me : null;
        playerInf = (me && Number.isFinite(me.influence)) ? (me.influence | 0) : 0;
        myRole = (me && me.role) ? String(me.role) : "";
      } catch (_) { myRole = ""; }
      let tierKey = "y1";
      try {
        const sourceInf = isPlayerAttack ? playerInf : level;
        const sourceRole = isPlayerAttack ? myRole : "";
        if (D && typeof D.tierKeyByInfluence === "function") {
          tierKey = D.tierKeyByInfluence(sourceInf, sourceRole);
        } else if (D && typeof D.tierKeysByInfluence === "function") {
          const keys = D.tierKeysByInfluence(sourceInf) || [];
          tierKey = String(keys[0] || "y1");
          if (String(tierKey).toLowerCase() === "k" && String(sourceRole || "").toLowerCase() !== "mafia") tierKey = "r4";
        }
      } catch (_) { tierKey = "y1"; }
      return canonSubFromTierKey(tierKey);
    };

    const subKey = pickCanonSub();
    const tierColor = forced || canonColorFromSub(subKey);
    const usedTexts = new Set();
    const usedPairs = new Set();
    const out = [];

    const fillText = (text, ctx) => {
      if (D && typeof D.fillPlaceholders === "function") return D.fillPlaceholders(text, ctx);
      return String(text || "");
    };

    const hasHere = (s) => {
      try { return String(s || "").toLowerCase().includes("здесь"); } catch (_) { return false; }
    };

    const pickCanonItem = (type) => {
      const list = (D && typeof D.getArgCanonGroup === "function")
        ? D.getArgCanonGroup(subKey, String(type || "").toUpperCase())
        : [];
      if (!list || list.length === 0) return null;
      const picked = pickN(list, 1)[0] || list[0];
      return picked || null;
    };

    const ctx = { usedNames: new Set(), usedPlaces: new Set(), role: null };

    const shuffledTypes = pickN(typesWanted, typesWanted.length);
    const want = shuffledTypes.slice(0, 3);

    for (const t of want) {
      let chosen = null;
      const list = (D && typeof D.getArgCanonGroup === "function")
        ? D.getArgCanonGroup(subKey, String(t || "").toUpperCase())
        : [];
      const shuffled = pickN(list, list.length);
      for (const item of shuffled) {
        if (!item || !item.q) continue;
        // Drop the whole pair if either side contains "здесь" (raw or filled)
        try {
          if (hasHere(item.q) || hasHere(item.a)) continue;
        } catch (_) {}
        const text = normalizeFinalText(fillText(item.q, ctx));
        if (hasHere(text)) continue;
        try {
          const aText = item && item.a ? normalizeFinalText(fillText(item.a, ctx)) : "";
          if (aText && hasHere(aText)) continue;
        } catch (_) {}
        // Rule: if text contains the interrogative "кто", it cannot be an "about" (про) type.
        try {
          if (/\bкто\b/iu.test(text) && String(t || "").toLowerCase() === "about") continue;
        } catch (_) {}
        const key = `${subKey}|${t}|${text}`;
        if (usedTexts.has(text) || usedPairs.has(key)) continue;
        usedTexts.add(text);
        usedPairs.add(key);
        chosen = { item, text };
        break;
      }
      if (!chosen) {
        const fallback = pickCanonItem(t);
        if (fallback && fallback.q) {
          try {
            if (hasHere(fallback.q) || hasHere(fallback.a)) {
              // skip
            } else {
              const text = normalizeFinalText(fillText(fallback.q, ctx));
              if (!hasHere(text)) {
                const aText = fallback && fallback.a ? normalizeFinalText(fillText(fallback.a, ctx)) : "";
                if (!aText || !hasHere(aText)) chosen = { item: fallback, text };
              }
            }
          } catch (_) {}
        }
      }
      if (chosen) {
        out.push({
          id: `canon_${subKey}_${t}_${Math.random().toString(36).slice(2, 8)}`,
          color: tierColor,
          group: t,
          type: t,
          text: chosen.text,
          _canonQ: chosen.item && chosen.item.q ? String(chosen.item.q) : null,
          _sub: subKey
        });
      }
    }

    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }

    // Canon-only invariant: if we cannot produce a full set, return empty (caller must degrade to draw).
    if (out.length < 3) return [];
    return out.slice(0, 3);
  }

  A.myAttackOptions = function (battle) {
    return buildAttackOptions(battle);
  };

  // Зафиксировать генератор атак, чтобы поздние адаптеры не перезаписывали инварианты.
  (function lockAttackOptions(){
    try {
      const desc = Object.getOwnPropertyDescriptor(A, "myAttackOptions");
      if (desc && typeof desc.get === "function") return;
      Object.defineProperty(A, "myAttackOptions", {
        configurable: true,
        enumerable: true,
        get() { return buildAttackOptions; },
        set(_) {}
      });
    } catch (_) {}
  })();

  function buildDefenseOptions(attackArg) {
    const battleCtx = (attackArg && (attackArg.attack || attackArg.opponentRole)) ? attackArg : null;
    const level = normalizeInfluence(battleCtx);
    const forced = getForcedColor();
    const D = (Game && Game.Data) ? Game.Data : null;
    const types = ["about", "who", "where", "yn"];
    const opponentRoleRaw = (battleCtx && (battleCtx.opponentRole || (battleCtx.opponent && battleCtx.opponent.role)))
      ? String(battleCtx.opponentRole || (battleCtx.opponent && battleCtx.opponent.role)).toLowerCase()
      : "";
    const attackGroup = (attackArg && getGroup(attackArg)) ? String(getGroup(attackArg)).toLowerCase() : null;
    const desiredGroup = attackGroup && types.includes(attackGroup) ? attackGroup : null;

    const canonSubKeysByColor = (color) => {
      if (color === "k") return ["K"];
      if (color === "r") return ["R1", "R2", "R3", "R4"];
      if (color === "o") return ["O1", "O2", "O3"];
      return ["Y1", "Y2"];
    };

    const canonSubFromTierKey = (tierKey) => {
      const s = String(tierKey || "").trim();
      if (!s) return "Y1";
      const low = s.toLowerCase();
      if (low === "k" || low === "k1") return "K";
      if (low.startsWith("y")) return ("Y" + low.slice(1)).toUpperCase();
      if (low.startsWith("o")) return ("O" + low.slice(1)).toUpperCase();
      if (low.startsWith("r")) return ("R" + low.slice(1)).toUpperCase();
      return s.toUpperCase();
    };

    const canonColorFromSub = (subKey) => {
      const s = String(subKey || "").toUpperCase();
      if (s.startsWith("K")) return "k";
      if (s.startsWith("R")) return "r";
      if (s.startsWith("O")) return "o";
      return "y";
    };

    if (typeof window !== "undefined" && window.location && String(window.location.search || "").includes("dev=1")) {
      try {
        console.warn("ARGS_FINGERPRINT_V3", "buildDefenseOptions_battle_fix_1", { ts: Date.now(), hasBattleCtx: !!battleCtx, battleId: battleCtx && battleCtx.id });
      } catch (_) {}
    }

    const pickCanonSub = () => {
      if (forced) {
        const subs = canonSubKeysByColor(forced);
        return pickN(subs, 1)[0] || subs[0] || "Y1";
      }
      // Variant 2:
      // - Incoming battle (fromThem=true): build defense options for ME (use my influence).
      // - Outgoing battle (fromThem=false): used by ConflictAPI to pick NPC defense (use opponent influence).
      let chooserInf = level;
      let chooserRole = "";
      try {
        const incoming = !!(battleCtx && battleCtx.fromThem === true);
        if (incoming) {
          chooserInf = level;
          chooserRole = (Game && Game.__S && Game.__S.me && Game.__S.me.role) ? String(Game.__S.me.role) : "";
        } else {
          // Opponent chooser: battle.opponent may be missing; fall back to players lookup by opponentId.
          const oppObj =
            (battleCtx && battleCtx.opponent) ? battleCtx.opponent :
            ((battleCtx && battleCtx.opponentId && Game && Game.__S && Game.__S.players) ? Game.__S.players[battleCtx.opponentId] : null);
          chooserInf = (oppObj && Number.isFinite(oppObj.influence)) ? (oppObj.influence | 0) : 0;
          chooserRole = opponentRoleRaw || (oppObj && oppObj.role ? String(oppObj.role) : "");
        }
      } catch (_) {
        chooserInf = level;
        chooserRole = "";
      }

      let tierKey = "y1";
      try {
        if (D && typeof D.tierKeyByInfluence === "function") {
          tierKey = D.tierKeyByInfluence(chooserInf, chooserRole);
        } else if (D && typeof D.tierKeysByInfluence === "function") {
          const keys = D.tierKeysByInfluence(chooserInf) || [];
          tierKey = String(keys[0] || "y1");
          if (String(tierKey).toLowerCase() === "k" && String(chooserRole || "").toLowerCase() !== "mafia") tierKey = "r4";
        }
      } catch (_) { tierKey = "y1"; }

      return canonSubFromTierKey(tierKey);
    };

    const subKey = pickCanonSub();
    const tierColor = forced || canonColorFromSub(subKey);
      const battleAttackGroup = getGroup(battleCtx && battleCtx.attack ? battleCtx.attack : attackArg) || "yn";
    const correctType = types.includes(battleAttackGroup) ? battleAttackGroup : "yn";

    const wrongTypes = types.filter(t => t !== correctType);
    const pickedWrong = pickN(wrongTypes, 2);
    const wanted = [correctType].concat(pickedWrong);

    const usedTexts = new Set();
    const ctx = { usedNames: new Set(), usedPlaces: new Set(), role: null };

    const fillText = (text) => {
      if (D && typeof D.fillPlaceholders === "function") return D.fillPlaceholders(text, ctx);
      return String(text || "");
    };

    const hasHere = (s) => {
      try { return String(s || "").toLowerCase().includes("здесь"); } catch (_) { return false; }
    };

    const normalizeKyn = (text) => {
      const s = String(text || "").trim();
      if (/нет/iu.test(s)) return "Нет.";
      return "Да.";
    };

    const pickDefenseText = (type) => {
      const list = (D && typeof D.getArgCanonGroup === "function")
        ? D.getArgCanonGroup(subKey, String(type || "").toUpperCase())
        : [];
      const shuffled = pickN(list, list.length);
      for (const item of shuffled) {
        if (!item || !item.a) continue;
        // Drop the whole pair if either side contains "здесь" (raw or filled)
        try {
          if (hasHere(item.q) || hasHere(item.a)) continue;
        } catch (_) {}
        let text = normalizeFinalText(fillText(item.a));
        if (hasHere(text)) continue;
        try {
          const qText = item && item.q ? normalizeFinalText(fillText(item.q)) : "";
          if (qText && hasHere(qText)) continue;
        } catch (_) {}
        if (subKey === "K" && String(type || "").toLowerCase() === "yn") {
          text = normalizeKyn(text);
        }
        // Enforce: if text asks "кто", defenses of type "about" ("про") are invalid.
        try {
          if (/\bкто\b/iu.test(text) && String(type || "").toLowerCase() === "about") continue;
        } catch (_) {}
        if (usedTexts.has(text)) continue;
        usedTexts.add(text);
        return { text, canonA: String(item.a) };
      }
      return null;
    };

    const out = [];
    for (const t of wanted) {
      const picked = pickDefenseText(t);
      if (picked && picked.text) {
        out.push({
          id: `canon_${subKey}_${t}_${Math.random().toString(36).slice(2, 8)}`,
          color: tierColor,
          group: t,
          type: t,
          text: picked.text,
          _canonA: picked.canonA || null,
          _sub: subKey
        });
      }
    }

    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }

    // Canon-only invariant: no base/fallback defenses. If missing, return empty (caller must degrade to draw).
    if (out.length < 3) return [];
    return out.slice(0, 3);
  }

  // Canon-only incoming attack picker for core (used to avoid Data.ARGUMENTS/base fallbacks).
  A.pickIncomingAttack = function (opponentId, battle, ctx) {
    const battleCtx = battle || (ctx && (ctx.battle || ctx.battleCtx)) || null;
    if (!battleCtx) {
      try {
        const key = "missing_battle_ctx";
        if (!_argsCtxMissingOnce.has(key)) {
          _argsCtxMissingOnce.add(key);
          console.warn("ARGS_CTX_MISSING_V1", { ts: Date.now() });
        }
      } catch (_) {}
      return { ok: false, reason: "missing_battle_ctx" };
    }
    const D = (Game && Game.Data) ? Game.Data : null;
    if (!D || typeof D.getArgCanonGroup !== "function") return null;
    const opp = (Game.__S && Game.__S.players && opponentId) ? Game.__S.players[opponentId] : null;
    // NPC with 0 points/balance cannot initiate a battle
    try {
      if (opp && (opp.npc === true || opp.type === "npc")) {
        const pts = Number.isFinite(opp.points) ? (opp.points | 0) : 0;
        const bal = Number.isFinite(opp.balance) ? (opp.balance | 0) : null;
        if (pts <= 0 || (bal != null && bal <= 0)) return null;
      }
    } catch (_) {}
    const inf = opp ? (opp.influence || 0) : 0;
    const canonSubKeysByColor = (color) => {
      if (color === "k") return ["K"];
      if (color === "r") return ["R1", "R2", "R3", "R4"];
      if (color === "o") return ["O1", "O2", "O3"];
      return ["Y1", "Y2"];
    };
    const subKey = (function(){
      // Variant 2: tierKeysByInfluence is the ONLY source of tone.
      // "k" is allowed ONLY for mafia.
      let tierKey = "y1";
      try {
        if (D && typeof D.tierKeyByInfluence === "function") {
          tierKey = D.tierKeyByInfluence(inf, opp && opp.role);
        } else if (D && typeof D.tierKeysByInfluence === "function") {
          const keys = D.tierKeysByInfluence(inf) || [];
          tierKey = String(keys[0] || "y1");
          if (String(tierKey).toLowerCase() === "k" && String((opp && opp.role) || "").toLowerCase() !== "mafia") tierKey = "r4";
        }
      } catch (_) { tierKey = "y1"; }

      const s = String(tierKey || "").trim();
      if (!s) return "Y1";
      const low = s.toLowerCase();
      if (low === "k" || low === "k1") return "K";
      if (low.startsWith("y")) return ("Y" + low.slice(1)).toUpperCase();
      if (low.startsWith("o")) return ("O" + low.slice(1)).toUpperCase();
      if (low.startsWith("r")) return ("R" + low.slice(1)).toUpperCase();
      return s.toUpperCase();
    })();
    const canonColorFromSub = (sk) => {
      const s = String(sk || "").toUpperCase();
      if (s.startsWith("K")) return "k";
      if (s.startsWith("R")) return "r";
      if (s.startsWith("O")) return "o";
      return "y";
    };
    const tierColor = canonColorFromSub(subKey);
    const baseTypes = ["about", "who", "where", "yn"];
    const battleAttackGroup = getGroup(battleCtx && battleCtx.attack ? battleCtx.attack : null) || "yn";
    const desiredGroup = battleAttackGroup && baseTypes.includes(battleAttackGroup) ? battleAttackGroup : null;
    if (battleCtx && battleCtx.id && String(battleCtx.id).startsWith("dev_")) {
      try {
        console.warn("DEV_ARGS_DESIRED_GROUP_V1", {
          battleId: battleCtx.id,
          attackType: battleAttackGroup,
          desiredGroup
        });
      } catch (_) {}
    }
    if (battleCtx && battleCtx.id && String(battleCtx.id).startsWith("dev_")) {
      try {
        console.warn("DEV_ARGS_BATTLE_IN_SCOPE_V1", {
          hasBattle: !!battleCtx,
          hasBattleCtx: !!battleCtx,
          battleId: battleCtx.id
        });
      } catch (_) {}
    }
    const devBattleMatch = battleCtx && String(battleCtx.id || "").startsWith("dev_smoke_");
    const devFlagMatch = (typeof window !== "undefined" && window.location && String(window.location.search || "").includes("dev=1"));
    if (devBattleMatch || devFlagMatch) {
      try {
        console.warn("ARGS_FINGERPRINT_V1", "line768_fix_1", { ts: Date.now() });
      } catch (_) {}
    }
    if (devFlagMatch) {
      try {
        console.warn("ARGS_FINGERPRINT_V2", "desiredGroup_fix_1", { ts: Date.now(), hasDesiredGroup: typeof desiredGroup !== "undefined" });
      } catch (_) {}
    }
    const typesWanted = desiredGroup ? [desiredGroup] : baseTypes;
    const attackCtx = { usedNames: new Set(), usedPlaces: new Set(), role: null };
    const fillText = (text) => (D && typeof D.fillPlaceholders === "function") ? D.fillPlaceholders(text, attackCtx) : String(text || "");

    const t = pickN(typesWanted, 1)[0] || "yn";
    const list = D.getArgCanonGroup(subKey, String(t).toUpperCase()) || [];
    if (!list.length) return null;
    const picked = pickN(list, 1)[0] || list[0];
    if (!picked || !picked.q) return null;
    // Drop the whole pair if either side contains "здесь" (raw or filled)
    const hasHere = (s) => {
      try { return String(s || "").toLowerCase().includes("здесь"); } catch (_) { return false; }
    };
    try {
      if (hasHere(picked.q) || hasHere(picked.a)) return null;
    } catch (_) {}
    const q = normalizeFinalText(fillText(picked.q));
    try { if (hasHere(q)) return null; } catch (_) {}
    try {
      const aText = picked && picked.a ? normalizeFinalText(fillText(picked.a)) : "";
      if (aText && hasHere(aText)) return null;
    } catch (_) {}
    
    // P0-1: Runtime assert для YN-ответов с "в {PLACE}"
    if (t === "yn" && q && q.match(/\b(в|на|у)\s*\{?[А-Я][а-я]+\}?/i)) {
      try {
        if (Game.__D && Game.__D.WARN_YN_PLACE) {
          console.warn(`[YN_PLACE_BUG] YN answer contains location preposition: "${q}" (battleId: ${attackCtx.battleId || "unknown"})`);
        }
      } catch (_) {}
    }
    
    return {
      id: `canon_${subKey}_${t}_${Math.random().toString(36).slice(2, 8)}`,
      type: t,
      group: t,
      text: q,
      _canonQ: String(picked.q),
      _sub: subKey,
      _color: tierColor,
    };
  };

  A.myDefenseOptions = function (attackArg) {
    return buildDefenseOptions(attackArg);
  };

  // Защитные варианты должны сохранять инварианты (3 разных типа, 1 правильный).
  // Фиксируем на уровне модуля, чтобы внешний адаптер не перезаписывал логику.
  (function lockDefenseOptions(){
    try {
      const desc = Object.getOwnPropertyDescriptor(A, "myDefenseOptions");
      if (desc && typeof desc.get === "function") return;
      Object.defineProperty(A, "myDefenseOptions", {
        configurable: true,
        enumerable: true,
        get() { return buildDefenseOptions; },
        set(_) {}
      });
    } catch (_) {}
  })();

  A.resolve = function (battle, defenseArg) {
    battle.defense = defenseArg;

    const a = battle.attack;
    const d = defenseArg;

    // If something is badly missing, default to draw so UI never explodes.
    if (!a || !d) {
      // Reveal attack color after the choice (even if it was missing).
      if (battle.attack && battle.attack.color == null && battle.attack._color) {
        battle.attack.color = battle.attack._color;
      }

      const core = getCore();
      if (core && typeof core.finalize === "function") {
        core.finalize(battle.id, "draw");
      } else {
        battle.result = "draw";
        battle.status = "draw";
        battle.draw = true;
      }
      return "draw";
    }

    const aG = getGroup(a) || "yn";
    const dG = getGroup(d) || "yn";

    const core = getCore();

    // Let core decide the real outcome (handles special roles, colors, neighbor rules, black rules, etc.)
    let outcome = null;
    if (core && typeof core.computeOutcome === "function") {
      outcome = core.computeOutcome(battle, a, d);
    } else {
      // Fallback must NOT grant win/lose based on type. Without core rules (colors, roles, neighbor steps),
      // the only safe resolution is a draw that can be handled by crowd logic.
      outcome = "draw";
    }

    // IMPORTANT: reveal the attack color only AFTER the player chose a defense.
    // Our attack keeps hidden strength in `_color` until this moment.
    if (battle.attack && battle.attack.color == null && battle.attack._color) {
      battle.attack.color = battle.attack._color;
    }
    battle.attackRevealed = true;

    if (core && typeof core.finalize === "function") {
      core.finalize(battle.id, outcome);
    } else {
      battle.result = outcome || "draw";
      battle.resultLine = (battle.result === "draw") ? "Толпа решает" : (battle.result === "win" ? "Победа" : "Поражение");
      if (battle.result === "draw") {
        battle.status = "draw";
        battle.draw = true;
      } else {
        battle.status = "finished";
        battle.resolved = true;
      }
    }

    return outcome || "draw";
  };

  Game._ConflictArguments = A;
  Game.ConflictArguments = A;

  const markArgumentsLoaded = () => {
    try {
      console.warn("CONFLICT_ARGUMENTS_LOADED_V1", {
        ts: Date.now(),
        buildTag: (typeof Game !== "undefined" && Game && Game.__buildTag) ? Game.__buildTag : null
      });
    } catch (_) {}
  };
  markArgumentsLoaded();
  console.log("[AttackChoices] conflict-arguments loaded", Date.now());
})();
