//
//  ui-chat.js
//  AsyncScene
//
//  Created by Ray on 2025/12/17.
//

// ui-chat.js
window.Game = window.Game || {};

(() => {
  const Game = window.Game;
  if (!Game.UI) return;
  const UI = Game.UI;

  // IMPORTANT: do not capture UI.S at module-load time.
  // ui-chat.js can load before ui-core.js finishes initializing UI.S.
  const getS = () => (Game.State || UI.S || (UI.S = {}));

  // Ensure chat container exists.
  const S = getS();
  S.chat = S.chat || [];

  const $ = UI.$;
  const escapeHtml = UI.escapeHtml;
  const nameHTMLWithPill = UI.nameHTMLWithPill;

  const escapeRe = (s) => String(s || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const isSystemMsg = (msg) => {
    try {
      return !!(msg && (msg.system || msg.isSystem));
    } catch (_) {
      return false;
    }
  };

  const getPlayerByNameSafe = (name) => {
    if (!name) return null;
    if (UI.getPlayerByName) return UI.getPlayerByName(name);
    const ps = (Game.State && Game.State.players) ? Object.values(Game.State.players) : [];
    return ps.find(p => p && p.name === name) || null;
  };

  // Detect NPC messages (for styling rules)
  const isNpcSpeaker = (msg) => {
    try {
      if (!msg || isSystemMsg(msg)) return false;
      // Prefer speakerId lookup
      if (msg.speakerId && Game.State && Game.State.players && Game.State.players[msg.speakerId]) {
        const p = Game.State.players[msg.speakerId];
        if (p && p.npc) return true;
      }
      // Fallback by name vs NPC list
      if (msg.name && Game.NPC && typeof Game.NPC.getAll === "function") {
        const nn = String(msg.name);
        return Game.NPC.getAll().some(x => x && x.name === nn);
      }
      return false;
    } catch (_) {
      return false;
    }
  };

  const isCopSpeaker = (msg) => {
    try {
      if (!msg || isSystemMsg(msg)) return false;
      // Prefer speakerId lookup
      if (msg.speakerId && Game.State && Game.State.players && Game.State.players[msg.speakerId]) {
        const p = Game.State.players[msg.speakerId];
        return p && p.npc && (p.role === "cop" || p.role === "police");
      }
      // Fallback by name vs NPC list
      if (msg.name && Game.NPC && typeof Game.NPC.getAll === "function") {
        const nn = String(msg.name);
        return Game.NPC.getAll().some(x => x && x.name === nn && (x.role === "cop" || x.role === "police"));
      }
      return false;
    } catch (_) {
      return false;
    }
  };

  const isMafiaSpeaker = (msg) => {
    try {
      if (!msg || isSystemMsg(msg)) return false;
      // Prefer speakerId lookup
      if (msg.speakerId && Game.State && Game.State.players && Game.State.players[msg.speakerId]) {
        const p = Game.State.players[msg.speakerId];
        return p && p.npc && (p.role === "mafia" || p.role === "mafioso");
      }
      // Fallback by name vs NPC list
      if (msg.name && Game.NPC && typeof Game.NPC.getAll === "function") {
        const nn = String(msg.name);
        return Game.NPC.getAll().some(x => x && x.name === nn && (x.role === "mafia" || x.role === "mafioso"));
      }
      return false;
    } catch (_) {
      return false;
    }
  };

  // Normalize ONLY NPC chat text (system text must keep perfect punctuation)
  const normalizeNpcChatText = (s) => {
    const raw = (s == null) ? "" : String(s);
    let t = raw.trim();
    t = t.toLowerCase();
    t = t.replace(/[.!?]+/g, "");
    t = t.replace(/[,;:]+$/g, "");
    t = t.replace(/\s+/g, " ").trim();
    return t;
  };

  // Bubble click fallbacks
  if (!UI.openDMByName) {
    UI.openDMByName = (name) => {
      if (!name) return;

      // If UI.openDM exists, prefer it (it expects playerId).
      if (typeof UI.openDM === "function") {
        const p = getPlayerByNameSafe(name);
        if (p && p.id) UI.openDM(p.id);
        return;
      }

      // Soft fallback: store target in state and ask ui-dm to render.
      if (!S.dm) S.dm = {};
      S.dm.peerName = name;
      const p2 = getPlayerByNameSafe(name);
      if (p2 && p2.id) S.dm.withId = p2.id;
      S.dm.open = true;
      const dmBlock = $("dmBlock");
      if (dmBlock) dmBlock.classList.remove("hidden");
      if (typeof UI.renderDM === "function") {
        try { UI.renderDM(); } catch (e) {}
      }
    };
  }

  const pick = (arr) => (arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : "");

  const getRandomPlace = () => {
    // Prefer explicit places list, then locations names, then a small default.
    const D = Game.Data || {};
    const places = D.PLACES || D.PLACES_LIST || D.PLACES_WORDS || null;
    if (places && Array.isArray(places) && places.length) return pick(places);
    if (D.LOCATIONS && Array.isArray(D.LOCATIONS) && D.LOCATIONS.length) return pick(D.LOCATIONS.map(x => x && x.name).filter(Boolean));
    return pick(["площадь", "переулок", "уголок", "набережная", "метро", "двор"]);
  };

  const getRandomName = () => {
    const D = Game.Data || {};
    const names = D.RANDOM_NAMES || D.NAMES || null;
    if (names && Array.isArray(names) && names.length) return pick(names);
    // fall back to known players
    const ps = (Game.State && Game.State.players) ? Object.values(Game.State.players) : [];
    const pool = ps.map(p => p && p.name).filter(Boolean);
    return pool.length ? pick(pool) : pick(["мирка", "кай", "рин", "юна", "сора", "алекс", "сен"]);
  };

  const expandTemplates = (raw) => {
    const txt = String(raw || "");
    if (!txt.includes("{")) return txt;

    // Support case variants: {name}/{Name}/{NAME}, {place}/{Place}/{PLACE}
    let out = txt
      .replace(/\{\s*name\s*\}/gi, getRandomName())
      .replace(/\{\s*place\s*\}/gi, getRandomPlace());

    // Remove any other leftover {tokens} entirely (do not show raw braces)
    out = out.replace(/\{[^}]*\}/g, "");

    // Cleanup double spaces that can appear after token removal
    out = out.replace(/\s{2,}/g, " ").trim();
    return out;
  };

  // Mentions rendering (always used here):
  // - converts @nick into a highlighted nick (the @ disappears)
  // - highlights mentions of me and other players (case-insensitive)
  const renderMentionsLocal = (rawText, opts = {}) => {
    const S = getS();
    const me = (S.me && S.me.name) ? String(S.me.name) : "";
    const speakerName = opts && opts.speakerName ? String(opts.speakerName) : "";
    const text = String(rawText || "").replace(/__mention_\\d+__/gi, "");

    const matches = [];
    const nameMap = Object.create(null);
    try {
      if (me) nameMap[me.toLowerCase()] = me;
      if (Game.State && Game.State.players) {
        Object.values(Game.State.players).forEach(p => {
          if (!p || !p.name) return;
          const nm = String(p.name);
          nameMap[nm.toLowerCase()] = nm;
        });
      }
    } catch (_) {}

    const overlaps = (start, end) => {
      return matches.some(m => !(end <= m.start || start >= m.end));
    };

    // 1) @mentions (highest priority)
    const atRe = /(^|\s)@([\p{L}0-9_\-]{1,24})/gu;
    let m;
    while ((m = atRe.exec(text)) !== null) {
      const prefixLen = (m[1] || "").length;
      const atPos = m.index + prefixLen;
      const nick = m[2] || "";
      const canon = nameMap[String(nick).toLowerCase()] || nick;
      const start = atPos;
      const end = atPos + 1 + nick.length;
      if (!overlaps(start, end)) {
        matches.push({ start, end, type: "at", name: canon });
      }
    }

    const addNameMatches = (name, type) => {
      if (!name) return;
      const escaped = escapeRe(name);
      const re = new RegExp(`(^|[^\\p{L}0-9_\\-])(${escaped})(?=[^\\p{L}0-9_\\-]|$)`, "giu");
      let mm;
      while ((mm = re.exec(text)) !== null) {
        const pre = mm[1] || "";
        const start = mm.index + pre.length;
        const end = start + (mm[2] || "").length;
        if (!overlaps(start, end)) {
          matches.push({ start, end, type, name });
        }
      }
    };

    // 2) me-name mentions
    if (me) addNameMatches(me, "me");

    // 3) other player mentions
    try {
      const names = [];
      if (Game.State && Game.State.players) {
        Object.values(Game.State.players).forEach(p => {
          if (!p || !p.name) return;
          const nm = String(p.name);
          if (nm === me) return;
          if (speakerName && nm === speakerName) return;
          if (!names.includes(nm)) names.push(nm);
        });
      }
      names.sort((a, b) => b.length - a.length);
      names.forEach(nm => addNameMatches(nm, "other"));
    } catch (_) {}

    if (!matches.length) return escapeHtml(text);

    matches.sort((a, b) => a.start - b.start);
    let out = "";
    let idx = 0;
    for (const mt of matches) {
      if (mt.start < idx) continue;
      out += escapeHtml(text.slice(idx, mt.start));
      let seg = mt.name || text.slice(mt.start, mt.end);
      if (mt.type === "at") seg = String(mt.name || "").trim() || text.slice(mt.start + 1, mt.end);
      let cls = "mention";
      if (mt.type === "me") cls += " me";
      else if (mt.type === "other") cls += " other";
      else if (mt.type === "at" && me && seg.toLowerCase() === me.toLowerCase()) cls += " me";
      out += `<span class="${cls}">${escapeHtml(seg)}</span>`;
      idx = mt.end;
    }
    out += escapeHtml(text.slice(idx));
    return out;
  };

  // ---- Mentions autocomplete (@) ----
  let mentionOpen = false;
  let mentionQuery = "";
  let mentionIndex = -1;

  const getAllMentionNames = () => {
    const S = getS();
    const names = [];
    if (S.me && S.me.name) names.push(S.me.name);
    if (Game.State && Game.State.players) {
      Object.values(Game.State.players).forEach(p => {
        if (p && p.name && !names.includes(p.name)) names.push(p.name);
      });
    }
    return names;
  };

  const filterMentionNames = (q) => {
    const qq = q.toLowerCase();
    return getAllMentionNames().filter(n => n.toLowerCase().startsWith(qq));
  };

  const closeMention = () => {
    mentionOpen = false;
    mentionQuery = "";
    mentionIndex = -1;
    const el = $("mentionList");
    if (el) el.remove();
  };

  const renderMentionList = (items) => {
    closeMention();
    if (!items || !items.length) return;
    const list = document.createElement("div");
    list.id = "mentionList";
    list.className = "mention-list";
    list.style.position = "fixed"; // Fixed positioning to escape parent overflow
    list.style.zIndex = "9999"; // High z-index to appear above all elements
    list.style.maxHeight = "200px";
    list.style.overflowY = "auto";
    
    items.forEach((name, i) => {
      const it = document.createElement("div");
      it.className = "mention-item" + (i === mentionIndex ? " active" : "");
      it.textContent = name;
      it.onclick = () => applyMention(name);
      list.appendChild(it);
    });
    
    // Position below chatInput
    const inp = $("chatInput");
    if (inp) {
      const rect = inp.getBoundingClientRect();
      list.style.left = `${rect.left}px`;
      list.style.top = `${rect.bottom + 4}px`;
      list.style.width = `${Math.max(rect.width, 200)}px`;
    }
    
    document.body.appendChild(list);
    mentionOpen = true;
  };

  const applyMention = (name) => {
    const inp = $("chatInput");
    if (!inp) return;
    const v = String(inp.value || "");
    const at = v.lastIndexOf("@");
    if (at >= 0) {
      // Replace only the @token (keeps the rest of the message intact).
      const afterAt = v.slice(at + 1);
      const ws = afterAt.search(/\s/);
      const tokenEnd = (ws >= 0) ? (at + 1 + ws) : v.length;
      const before = v.slice(0, at + 1);
      const after = v.slice(tokenEnd);
      // Ensure we keep a trailing space after a mention if it was at the end.
      const needSpace = after.length === 0 || !/^\s/.test(after);
      inp.value = before + String(name || "").trim() + (needSpace ? " " : "") + after;
    } else {
      // No @ in the input: append a mention-like token (do not destroy typed text).
      const trimmed = v.trim();
      const sep = trimmed.length === 0 ? "" : (/\s$/.test(v) ? "" : " ");
      inp.value = v + sep + "@" + String(name || "").trim() + " ";
    }
    closeMention();
    inp.focus();
  };

  if (!UI.pinBattleToTop) {
    UI.pinBattleToTop = (battleId) => {
      const arr = (Game.State && Game.State.battles) ? Game.State.battles : (S.battles || null);
      if (!arr || !Array.isArray(arr)) return;
      const i = arr.findIndex(b => b && b.id === battleId);
      if (i <= 0) return;
      const [b] = arr.splice(i, 1);
      arr.unshift(b);
      if (UI.renderBattles) UI.renderBattles();
      if (UI.renderAll) UI.renderAll();
    };
  }

  if (!UI.openBattlesAndScroll) {
    UI.openBattlesAndScroll = () => {
      if (typeof UI.setPanelSize === "function") {
        UI.setPanelSize("battles", "medium");
      }
      const el = $("battlesBody") || $("battlesBlock");
      if (el && el.scrollTo) el.scrollTo({ top: 0, behavior: "smooth" });
    };
  }

  const renderNameWithInfluence = (msgName, isSystem = false) => {
    // System label in meta stays clean (no influence pill)
    if (isSystem) {
      const n = String(msgName || "").trim().toLowerCase();
      const label = (!n || n === "sys" || n === "system" || n === "система") ? "Система" : msgName;
      return `${escapeHtml(label || "Система")}`;
    }

    const p = getPlayerByNameSafe(msgName);
    // Prefer shared helper (keeps format identical across chat/battles/events/dm)
    if (p && typeof nameHTMLWithPill === "function") return nameHTMLWithPill(p);

    const inf = p ? (p.influence || 0) : 0;
    return `${escapeHtml(msgName)} <span class="badge">[${escapeHtml(String(inf))}]</span>`;
  };

  // ---- System text helpers (used by conflict/events/UI to build correctly punctuated lines) ----
  // These helpers return PLAIN TEXT (not HTML) so they can be safely passed into UI.pushSystem
  // and then rendered/escaped by chat renderer.

  const getPlayerByIdSafe = (id) => {
    if (!id) return null;
    const p = (Game.State && Game.State.players) ? Game.State.players[id] : null;
    return p || null;
  };

  const nameWithInfText = (playerOrIdOrName) => {
    let p = null;
    if (typeof playerOrIdOrName === "string") {
      // try id first, then name
      p = getPlayerByIdSafe(playerOrIdOrName) || getPlayerByNameSafe(playerOrIdOrName);
    } else if (playerOrIdOrName && typeof playerOrIdOrName === "object") {
      p = playerOrIdOrName;
    }
    const n = p
      ? (UI.displayName ? UI.displayName(p) : (p.name || ""))
      : String(playerOrIdOrName || "");
    const inf = p ? (p.influence || 0) : 0;
    return `${n} [${inf}]`;
  };

  // Public helpers for other modules
  // Example output:
  // "Между Иваном [12] и Токсиком [9] возникла ничья. Решает толпа."
  if (!UI.formatTieSystemLine) {
    UI.formatTieSystemLine = (aIdOrName, bIdOrName) => {
      const a = nameWithInfText(aIdOrName);
      const b = nameWithInfText(bIdOrName);
      return `Между ${a} и ${b} возникла ничья. Решает толпа.`;
    };
  }

  // Variant for challenges (system line that can be used with action=battle)
  if (!UI.formatChallengeSystemLine) {
    UI.formatChallengeSystemLine = (challengerIdOrName, targetIdOrName) => {
      const a = nameWithInfText(challengerIdOrName);
      const b = nameWithInfText(targetIdOrName);
      return `${a} вызывает ${b} на баттл.`;
    };
  }

  // Chat scroll behavior:
  // - if at bottom: stick to bottom
  // - if user scrolled up: keep viewport anchored (no jumps)
  let autoScroll = true;

  const chatBox = $("chatLog");
  if (chatBox && !chatBox.__autoScrollBound) {
    chatBox.addEventListener("scroll", () => {
      const nearBottom = (chatBox.scrollHeight - (chatBox.scrollTop + chatBox.clientHeight)) < 40;
      autoScroll = nearBottom;
    });
    chatBox.__autoScrollBound = true;
  }

  UI.renderChatSmart = () => {
    const box = $("chatLog");
    if (!box) return;
    const S = getS();
    S.chat = S.chat || [];

    const prevScrollTop = box.scrollTop;
    const prevScrollHeight = box.scrollHeight;

    const nearBottom = (box.scrollHeight - (box.scrollTop + box.clientHeight)) < 40;
    if (nearBottom) autoScroll = true;

    box.innerHTML = "";
    S.chat.forEach(m => {
      const el = document.createElement("div");
      const sys = isSystemMsg(m);
      el.className = "bubble" + (sys ? " sys" : "");
      el.dataset.msgId = m.id;
      if (m.speakerId) el.dataset.speakerId = m.speakerId;

      if (m.action) el.dataset.action = m.action;
      if (m.battleId) el.dataset.battleId = m.battleId;
      if (m.eventId) el.dataset.eventId = m.eventId;

      let expanded = expandTemplates(m.text);
      // Enforce NPC chat style at render-time (safety net)
      // Cop and Mafioso messages must keep perfect punctuation and casing.
      if (isNpcSpeaker(m) && !isCopSpeaker(m) && !isMafiaSpeaker(m)) {
        const hasMentions = Array.isArray(m.mentions) && m.mentions.length > 0;
        if (!hasMentions) {
          expanded = normalizeNpcChatText(expanded);
        }
      }
      const rendered = renderMentionsLocal(expanded, { speakerName: m.name });

      // Mark bubble if it mentions me
      const S = getS();
      const meName = (S.me && S.me.name) ? S.me.name : "";
      const mentionsMe = meName ? new RegExp(`(^|[^\\p{L}0-9_\-])${escapeRe(meName)}([^\\p{L}0-9_\-]|$)`, "iu").test(expanded) : false;
      if (mentionsMe) el.className += " meMention";

      el.innerHTML = `
        <div class="meta">
          <span class="name">${renderNameWithInfluence(m.name, sys)}</span>
          <span class="time">${escapeHtml(m.t)}</span>
        </div>
        <div class="txt">${rendered}</div>
      `;

      el.onclick = () => {
        // For system bubbles: allow battle navigation, but do not open DM.
        const isSystem = sys;

        if (!isSystem) {
          if (m.speakerId && typeof UI.openDMBySpeakerId === "function") {
            UI.openDMBySpeakerId(m.speakerId);
          } else if (m.name && typeof UI.openDMByName === "function") {
            UI.openDMByName(m.name);
          }
        }

        // optional: jump to battle if explicitly marked
        if (m.battleId && m.action === "battle" && typeof UI.pinBattleToTop === "function") {
          UI.pinBattleToTop(m.battleId);
          if (typeof UI.openBattlesAndScroll === "function") {
            UI.openBattlesAndScroll();
          }
        }
        // jump to related event (e.g., draw)
        if (m.eventId) {
          const evId = m.eventId;

          // Ensure state flags exist
          try {
            const SS = getS();
            SS.flags = SS.flags || {};
            SS.flags.eventsOpen = true;
            SS.flags.eventsCollapsed = false;
            SS.flags.activeEventId = evId;
            SS.flags.selectedEventId = evId;
            SS.flags.highlightEventId = evId;
          } catch (_) {}

          // Prefer explicit UI helpers if present
          try {
            if (typeof UI.openEventsPanel === "function") UI.openEventsPanel();
          } catch (_) {}

          try {
            if (typeof UI.selectEvent === "function") UI.selectEvent(evId);
            else if (typeof UI.setActiveEvent === "function") UI.setActiveEvent(evId);
          } catch (_) {}

          try {
            if (typeof UI.scrollToEvent === "function") UI.scrollToEvent(evId);
          } catch (_) {}

          // Ensure UI updates (avoid double-click feel)
          try {
            if (typeof UI.requestRenderAll === "function") UI.requestRenderAll();
            else if (typeof UI.renderAll === "function") UI.renderAll();
          } catch (_) {}
        }
      };

      box.appendChild(el);
    });

    if (autoScroll) {
      box.scrollTop = box.scrollHeight;
    } else {
      const newScrollHeight = box.scrollHeight;
      const delta = newScrollHeight - prevScrollHeight;
      box.scrollTop = prevScrollTop + Math.max(0, delta);
    }
  };

  const bindMentionInput = () => {
    const inp = $("chatInput");
    if (!inp || inp.__mentionBound) return;

    const updateMentionListFromInput = (forceOpen = false) => {
      const v = String(inp.value || "");
      const at = v.lastIndexOf("@");
      let q = "";
      if (at >= 0) {
        const afterAt = v.slice(at + 1);
        const ws = afterAt.search(/\s/);
        q = (ws >= 0) ? afterAt.slice(0, ws) : afterAt;
      } else {
        // If dropdown is open (user explicitly clicked/focused), filter by last word.
        const parts = v.trim().split(/\s+/).filter(Boolean);
        q = parts.length ? parts[parts.length - 1] : "";
      }
      mentionQuery = String(q || "");
      mentionIndex = 0;
      const items = filterMentionNames(mentionQuery);
      if (forceOpen || mentionOpen || at >= 0) renderMentionList(items);
    };

    inp.addEventListener("keydown", (e) => {
      if (mentionOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        e.preventDefault();
        const items = filterMentionNames(mentionQuery);
        if (!items.length) return;
        mentionIndex = (mentionIndex + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
        renderMentionList(items);
        return;
      }
      if (mentionOpen && e.key === "Enter") {
        e.preventDefault();
        const items = filterMentionNames(mentionQuery);
        if (items[mentionIndex]) applyMention(items[mentionIndex]);
        return;
      }
      if (e.key === "Escape") {
        closeMention();
      }
    });

    inp.addEventListener("input", () => {
      // While dropdown is open (or user typed @), keep it updated.
      updateMentionListFromInput(false);
    });

    // Click/focus in input should show the list (even if query is empty).
    inp.addEventListener("focus", () => {
      updateMentionListFromInput(true);
    });
    inp.addEventListener("click", (e) => {
      // Don't let click-outside handler instantly close it.
      try { e.stopPropagation(); } catch (_) {}
      updateMentionListFromInput(true);
    });

    // Click outside to hide dropdown
    const handleClickOutside = (e) => {
      if (!mentionOpen) return;
      const mentionList = $("mentionList");
      if (!mentionList) return;
      if (!inp.contains(e.target) && !mentionList.contains(e.target)) {
        closeMention();
      }
    };
    document.addEventListener("click", handleClickOutside, true);

    inp.__mentionBound = true;
  };

  UI.sendChat = () => {
    const S = getS();
    S.chat = S.chat || [];
    if (!S.me || !S.me.name) return;

    const inp = $("chatInput");
    const txt = (inp ? (inp.value || "").trim() : "");
    if (!txt) return;

    if (inp) inp.value = "";
    // Remove trailing @ if present (user typed "hi @" and sent)
    let sendText = txt.replace(/\s*@\s*$/, "").trim();
    UI.pushChat({ name: S.me.name, text: sendText, system: false });
    // Mention UI (autocomplete) is handled by ui-core/ui-boot; keep optional.

    // If a specific NPC is mentioned, let them reply.
    try {
      const candidates = (Game.StateAPI && typeof Game.StateAPI.getAllMentionCandidates === "function")
        ? Game.StateAPI.getAllMentionCandidates()
        : Object.values(S.players || {}).map(p => ({
          id: p && p.id,
          name: p && p.name,
          npc: !!(p && p.npc)
        }));
      const textLower = String(sendText || "").toLowerCase();
      const mentionedNpc = (candidates || []).find(c => {
        if (!c || !c.npc || !c.name) return false;
        const nm = String(c.name).toLowerCase();
        if (!nm) return false;
        const reAt = new RegExp(`(^|\\s)@${escapeRe(nm)}(?=\\s|$)`, "iu");
        const reBare = new RegExp(`(^|\\s)${escapeRe(nm)}(?=\\s|$)`, "iu");
        return reAt.test(textLower) || reBare.test(textLower);
      });
      if (mentionedNpc && Game.NPC && typeof Game.NPC.generateReactionToMe === "function") {
        const npc = (S.players && mentionedNpc.id) ? S.players[mentionedNpc.id] : null;
        if (npc && npc.name) {
          try {
            if (Game.StateAPI && typeof Game.StateAPI.isNpcJailed === "function" && Game.StateAPI.isNpcJailed(npc.id)) {
              return;
            }
          } catch (_) {}
          const reply = Game.NPC.generateReactionToMe(npc, S.me.name);
          if (reply && String(reply).trim().length) {
            UI.pushChat({ name: npc.name, text: String(reply), system: false });
          }
        }
      }
    } catch (_) {}

    // Chat activity reward (cooldown-based)
    try {
      const D0 = Game.Data || {};
      const gain = Number.isFinite(D0.POINTS_CHAT_REPLY) ? (D0.POINTS_CHAT_REPLY | 0) : 1;
      const now = Date.now();
      S.points = S.points || { lastChatRewardAt: 0 };
      const last = Number(S.points.lastChatRewardAt || 0);
      if ((now - last) >= 10000) {
        const cir = !!(D0 && D0.CIRCULATION_ENABLED === true);
        if (cir) {
          try {
            if (Game.StateAPI && typeof Game.StateAPI.pushSystem === "function") {
              Game.StateAPI.pushSystem("Сейчас без бонусов.");
            } else if (Game.UI && typeof Game.UI.pushSystem === "function") {
              Game.UI.pushSystem("Сейчас без бонусов.");
            }
          } catch (_) {}
        } else if (Game.StateAPI && typeof Game.StateAPI.addPoints === "function") {
          Game.StateAPI.addPoints(gain, "chat_reply");
        } else if (S.me) {
          S.me.points = (S.me.points || 0) + gain;
        }
        S.points.lastChatRewardAt = now;
      }
    } catch (_) {}
  };

  // ---- System CTA: tie event bubble ----
  // Creates a system bubble bound to an events card via eventId.
  // Other modules (events/conflict) can call this to notify the chat.
  if (!UI.pushTieCtaToChat) {
    UI.pushTieCtaToChat = (eventId, extraText) => {
      const S = getS();
      S.chat = S.chat || [];

      const t = (Game.Data && typeof Game.Data.t === "function") ? Game.Data.t : (k) => String(k || "");
      const base = t("tie_chat_start");
      const call = t("tie_call_to_action");
      const tail = (call && call !== "tie_call_to_action")
        ? (" " + String(call).trim())
        : (extraText ? (" " + String(extraText).trim()) : "");

      // Always push through UI.pushChat to preserve eventId for click navigation.
      const msg = {
        name: "Система",
        text: (String(base || "") + tail).trim(),
        system: true,
        isSystem: true,
        eventId: eventId || null,
        action: "event"
      };

      if (typeof UI.pushChat === "function") {
        UI.pushChat(msg);
      } else {
        S.chat.push(msg);
      }

      // Soft-open events panel so the user immediately sees where to click.
      try {
        const SS = getS();
        SS.flags = SS.flags || {};
        SS.flags.eventsOpen = true;
        SS.flags.eventsCollapsed = false;
      } catch (_) {}

      try {
        if (typeof UI.requestRenderAll === "function") UI.requestRenderAll();
        else if (typeof UI.renderChatSmart === "function") UI.renderChatSmart();
        else if (typeof UI.renderAll === "function") UI.renderAll();
      } catch (_) {}
    };
  }

  // Expose helpers
  UI.nameWithInfText = nameWithInfText;

  // expose for other UI modules
  UI.renderChat = UI.renderChatSmart;

  // Bind mentions autocomplete on load/render
  setTimeout(bindMentionInput, 0);
})();
