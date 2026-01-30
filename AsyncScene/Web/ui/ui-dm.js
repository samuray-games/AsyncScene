//
//  ui-dm.js
//  AsyncScene
//
//  Created by Ray on 2025/12/17.
//


// ui-dm.js
window.Game = window.Game || {};

(() => {
  const UI = Game.UI;
  const $ = UI.$;
  const escapeHtml = UI.escapeHtml;
  const renderMentions = (t, opts) => {
    if (UI.renderMentionsLocal) return UI.renderMentionsLocal(t, opts);
    return escapeHtml(t);
  };
  const getS = () => (Game.__S || UI.S);

  const requestAll = () => {
    try {
      if (UI && typeof UI.requestRenderAll === "function") return UI.requestRenderAll();
      if (UI && typeof UI.renderAll === "function") return UI.renderAll();
    } catch (_) {}
  };

  const escapeRe = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  function getPlayerByNameSafe(name){
    if (!name) return null;
    if (UI.getPlayerByName) return UI.getPlayerByName(name);
    return Object.values(getS().players || {}).find(p => p && p.name === name) || null;
  }

  function stop(ev){
    try { ev.preventDefault(); } catch(_) {}
    try { ev.stopPropagation(); } catch(_) {}
  }

  function getDmSize(){
    const S = getS();
    return (S.flags && S.flags.dmSize) || "medium";
  }

  function setDmSize(next){
    const S = getS();
    S.flags = S.flags || {};
    S.flags.dmSize = next;
    if (UI && typeof UI.setPanelSize === "function") {
      // If centralized panel sizing exists, use it.
      try { UI.setPanelSize("dm", next); } catch(_) {}
    }
  }

  function applyDmSizeClass(dmBlock, size){
    if (!dmBlock) return;

    // Prefer centralized helper if present
    if (UI && typeof UI.applyPanelSizeClasses === "function") {
      try { UI.applyPanelSizeClasses(dmBlock, "dm"); } catch(_) {}
      return;
    }

    dmBlock.classList.remove("panel--collapsed","panel--medium","panel--full");
    const s = (size === "collapsed" || size === "medium" || size === "max") ? size : "medium";
    const cls =
      s === "collapsed" ? "panel--collapsed" :
      s === "max" ? "panel--full" :
      "panel--medium";
    dmBlock.classList.add(cls);
  }

  function findDmHeader(dmBlock){
    if (!dmBlock) return null;
    return dmBlock.querySelector(".blockHeader") || null;
  }

  function ensureHeaderRight(headerEl){
    if (!headerEl) return null;
    let right = headerEl.querySelector(".righty");
    if (!right) {
      right = document.createElement("div");
      right.className = "righty";
      headerEl.appendChild(right);
    }
    return right;
  }

  function getEscapeCostForRole(role){
    const D = (Game && Game.Data) ? Game.Data : null;
    const r = String(role || "").toLowerCase();

    // Prefer a function if it exists
    if (D && typeof D.escapeCostByRole === "function") {
      const v = D.escapeCostByRole(r);
      return Number.isFinite(v) ? (v | 0) : ((D && D.ESCAPE_COST && Number.isFinite(D.ESCAPE_COST.default)) ? (D.ESCAPE_COST.default | 0) : 1);
    }

    // Then a table (including default)
    if (D && D.ESCAPE_COST && typeof D.ESCAPE_COST === "object") {
      const v = D.ESCAPE_COST[r];
      if (Number.isFinite(v)) return (v | 0);
      if (Number.isFinite(D.ESCAPE_COST.default)) return (D.ESCAPE_COST.default | 0);
    }

    // Final fallback (only if Data is missing)
    return 1;
  }

  function dmPushLine(whoId, from, text) {
    const S = getS();
    S.dm = S.dm || { logs:{} };
    // DM tabs: ensure state shape
    if (!Array.isArray(S.dm.openIds)) S.dm.openIds = [];
    if (!("activeId" in S.dm)) S.dm.activeId = null;
    if (!("unread" in S.dm)) S.dm.unread = {};
    S.dm.logs = S.dm.logs || {};
    S.dm.logs[whoId] = S.dm.logs[whoId] || [];
    S.dm.logs[whoId].push({ t: UI.nowHHMM(), from, text });
    // Keep thread available as a tab, but do NOT force-open here (caller decides).
    try {
      const id = String(whoId || "");
      if (id && !S.dm.openIds.includes(id)) S.dm.openIds.push(id);
      if (!S.dm.activeId) {
        S.dm.activeId = id || null;
        S.dm.withId = S.dm.activeId;
      }
    } catch (_) {}
  }
  UI.dmPushLine = dmPushLine;

  function closeDM() {
    const S = getS();
    S.dm.open = false;
    S.dm.activeId = null;
    S.dm.withId = null;
    S.dm.openIds = [];
    S.dm.inviteOpen = false;

    const dmBlock = $("dmBlock");
    if (dmBlock) dmBlock.classList.add("hidden");

    const panel = $("teachPanel");
    if (panel) {
      panel.classList.add("hidden");
      panel.innerHTML = "";
    }

    const extra = $("dmExtraRow");
    if (extra) extra.classList.add("hidden");
  }

  UI.closeDM = closeDM;

  UI.openDM = (playerId) => {
    const S = getS();
    const myId = (S && S.me && S.me.id) ? S.me.id : "me";
    if (!playerId || playerId === myId || playerId === "me") return false;
    if (!getS().players[playerId]) return false;
    S.dm = S.dm || { open:false, withId:null, openIds:[], activeId:null, logs:{}, inviteOpen:false };
    if (!Array.isArray(S.dm.openIds)) S.dm.openIds = [];
    S.dm.logs = S.dm.logs || {};
    S.dm.logs[playerId] = S.dm.logs[playerId] || [];

    const id = String(playerId);
    if (!S.dm.openIds.includes(id)) S.dm.openIds.push(id);
    S.dm.activeId = id;
    S.dm.withId = id; // compat alias
    S.dm.open = true;

    // Ensure the DM becomes a visible tab even before any incoming messages.
    // This enables "open second DM while first stays available" behavior.
    try {
      const arr = S.dm.logs[playerId];
      if (Array.isArray(arr) && arr.length === 0) {
        arr.push({ t: UI.nowHHMM(), from: "Система", text: "Окно открыто." });
      }
    } catch (_) {}

    const dmBlock = $("dmBlock");
    if (dmBlock) dmBlock.classList.remove("hidden");

    if (UI.setPanelSize) UI.setPanelSize("dm", "medium");
    try { if (typeof UI.renderDM === "function") UI.renderDM(); } catch (_) {}
    requestAll();
  };

  function mkBtn(label, fn, cls="btn small") {
    const b = document.createElement("button");
    b.className = cls;
    b.textContent = label;
    b.onclick = fn;
    return b;
  }

  function myAllowedColors() {
    const inf = (getS().me && getS().me.influence) ? (getS().me.influence | 0) : 0;

    const D = (Game && Game.Data) ? Game.Data : null;
    if (D && typeof D.allowedColorsByInfluence === "function") {
      const codes = D.allowedColorsByInfluence(inf) || [];
      return new Set(codes.map(c => (D.normalizeColor ? D.normalizeColor(c) : c)));
    }

    // Fallback from Data.PROGRESSION if available (no magic numbers here)
    const set = new Set(["y"]);

    const P = D && D.PROGRESSION ? D.PROGRESSION : null;
    const U = P && (P.unlockInfluence || P.unlocks || P.UNLOCKS) ? (P.unlockInfluence || P.unlocks || P.UNLOCKS) : null;

    const oAt = U && Number.isFinite(U.orange) ? (U.orange | 0) : null;
    const rAt = U && Number.isFinite(U.red) ? (U.red | 0) : null;
    const kAt = U && Number.isFinite(U.black) ? (U.black | 0) : null;

    if (oAt != null && inf >= oAt) set.add("o");
    if (rAt != null && inf >= rAt) set.add("r");
    if (kAt != null && inf >= kAt) set.add("k");

    return set;
  }

  function teachCostByColor(color) {
    const D = (Game && Game.Data) ? Game.Data : null;
    if (D && typeof D.teachCostByColor === "function") return D.teachCostByColor(color) || 0;
    // Fallback from Data table if present
    if (D && D.TEACH_COST && typeof D.TEACH_COST === "object") {
      const s0 = String(color || "").toLowerCase();
      const key =
        (s0 === "yellow") ? "y" :
        (s0 === "orange") ? "o" :
        (s0 === "red") ? "r" :
        (s0 === "black") ? "k" :
        s0;
      const v = D.TEACH_COST[key];
      if (Number.isFinite(v)) return (v | 0);
    }

    // Legacy fallback (only if Data is missing)
    const s = String(color || "").toLowerCase();
    if (s === "y" || s === "yellow") return 1;
    if (s === "o" || s === "orange") return 2;
    if (s === "r" || s === "red") return 3;
    return 0;
  }

  function openTeachPanel(targetId) {
    const panel = $("teachPanel");
    if (!panel) return;

    panel.classList.remove("hidden");
    panel.innerHTML = "";

    const title = document.createElement("div");
    title.className = "pill";
    title.textContent = "Выбери аргумент. У получателя он будет одноразовый. Это платно.";
    panel.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "teachList";
    panel.appendChild(grid);

    const row = document.createElement("div");
    row.className = "choiceRow";
    grid.appendChild(row);

    const allowed = myAllowedColors();
    const all = [];
    const D = (Game && Game.Data) ? Game.Data : null;

    const PACK = (Game.Data && (Game.Data.PHRASES || Game.Data.ARGUMENTS)) ? (Game.Data.PHRASES || Game.Data.ARGUMENTS) : null;
    if (PACK) {
      (PACK.attack || []).forEach(p => {
        const code = D && D.normalizeColor ? D.normalizeColor(p && p.color) : (p && p.color);
        if (code && allowed.has(code) && code !== "k") all.push({ ...p, kind:"attack", _code: code });
      });
      (PACK.defense || []).forEach(p => {
        const code = D && D.normalizeColor ? D.normalizeColor(p && p.color) : (p && p.color);
        if (code && allowed.has(code) && code !== "k") all.push({ ...p, kind:"defense", _code: code });
      });
    }

    const clsMap = { yellow:"y", orange:"o", red:"r", black:"k", y:"y", o:"o", r:"r", k:"k" };

    all.forEach(p => {
      const cost = teachCostByColor(p._code || p.color);
      const chip = document.createElement("div");
      const c = clsMap[p._code || p.color] || "y";
      chip.className = `chip ${c}`;
      chip.innerHTML = `${escapeHtml(p.text)} <span class="badge">${p.kind === "attack" ? "Вброс" : "Ответка"}</span>`;

      chip.onclick = () => {
        const to = getS().players[targetId];
        if (!to) return;

        if (!cost || cost <= 0) {
          dmPushLine(targetId, "Система", "Так нельзя.");
          UI.renderDM();
          return;
        }

        const spend = (Game.__A && typeof Game.__A.spendPoints === "function")
          ? Game.__A.spendPoints
          : null;

          if (spend) {
            const ok = spend(cost, "teach_argument");
            if (!ok) {
              if (UI && typeof UI.showStatToast === "function") {
                UI.showStatToast("points", "Недоступно.");
              }
              UI.renderDM();
              return;
            }
          } else if ((getS().me.points || 0) < cost) {
            if (UI && typeof UI.showStatToast === "function") {
              UI.showStatToast("points", "Недоступно.");
            }
            UI.renderDM();
            return;
          } else {
            getS().me.points = Math.max(0, (getS().me.points || 0) - cost);
          }

        to.singleUseArgs = to.singleUseArgs || [];
        to.singleUseArgs.push({
          id: `sua_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
          kind: p.kind,
          color: (p._code || (D && D.normalizeColor ? D.normalizeColor(p.color) : p.color)),
          text: p.text,
          used: false,
          source: "teach"
        });

        const teacherName = (getS().me && getS().me.name) ? getS().me.name : "Ты";
        const t = (Game.Data && typeof Game.Data.t === "function") ? Game.Data.t : (k, v) => String(k || "");
        dmPushLine(targetId, "Система", t("teach_sent_dm", { student: to.name, arg: p.text, cost }));
        UI.pushSystem(t("teach_sent_chat", { teacher: teacherName, student: to.name }));

        panel.classList.add("hidden");
        panel.innerHTML = "";
        requestAll();
        UI.renderDM();
      };

      row.appendChild(chip);
    });

    if (all.length === 0) {
      const empty = document.createElement("div");
      empty.className = "pill";
      empty.textContent = "Пока без мувов.";
      panel.appendChild(empty);
    }
  }

  UI.openDMByName = (name) => {
    if (!name || name === "Система") return;
    const playerId = Object.keys(getS().players || {}).find(
      pid => getS().players[pid] && getS().players[pid].name === name
    );
    if (!playerId) return;
    UI.openDM(playerId);
  };

  // Used by chat bubble clicks: open DM by speakerId and ensure the panel is expanded.
  UI.openDMBySpeakerId = (speakerId) => {
    if (!speakerId) return;
    const S = getS();
    const p = (S && S.players) ? S.players[speakerId] : null;
    if (!p) return;
    UI.openDM(speakerId);
    // Always expand DM when opened from chat.
    if (UI.setPanelSize) UI.setPanelSize("dm", "medium");
    requestAll();
  };

  UI.renderDM = () => {
    const S = getS();
    S.dm = S.dm || { open:false, withId:null, openIds:[], activeId:null, logs:{}, inviteOpen:false };
    if (!Array.isArray(S.dm.openIds)) S.dm.openIds = [];
    if (!("activeId" in S.dm)) S.dm.activeId = null;
    // compat alias
    if (S.dm.activeId && !S.dm.withId) S.dm.withId = S.dm.activeId;
    if (S.dm.withId && !S.dm.activeId) S.dm.activeId = S.dm.withId;

    // Source of truth: activeId
    const withId = S.dm.activeId;
    if (withId) {
      S.dm.unread = S.dm.unread || {};
      S.dm.unread[String(withId)] = 0;
    }
    const dmBlock = $("dmBlock");
    if (dmBlock) dmBlock.classList.toggle("hidden", !S.dm.open);

    const dmBlockHeader = $("dmBlockHeader");
    const dmHeaderCount = $("dmHeaderCount");
    const collapsedCount = (UI && typeof UI.getCollapsedCounter === "function") ? UI.getCollapsedCounter("dm") : 0;
    const unreadMap = (S.dm && S.dm.unread) ? S.dm.unread : {};
    const totalUnread = Object.values(unreadMap).reduce((sum, v) => sum + ((Number(v) || 0)), 0);
    const displayCount = Math.max(collapsedCount, totalUnread);
    if (dmHeaderCount) dmHeaderCount.textContent = displayCount ? ` (${displayCount})` : "";
    if (dmBlockHeader) {
      if (displayCount > 0) dmBlockHeader.classList.add("panelHeader--hot");
      UI.pulsePanelHeader && UI.pulsePanelHeader("dm", dmBlockHeader, displayCount, 0);
    }

    // Apply 3-size layout classes and header controls (cycler + close)
    if (dmBlock) {
      const size = getDmSize();
      applyDmSizeClass(dmBlock, size);
      try {
        const legacyClose = document.getElementById("dmClose");
        if (legacyClose) legacyClose.remove();
      } catch (_) {}

      const header = findDmHeader(dmBlock);
      const right = ensureHeaderRight(header);
      if (header) {
        header.onclick = (ev) => {
          try {
            header.classList.remove("panelHeader--hot");
            if (UI && typeof UI.resetCollapsedCounter === "function") UI.resetCollapsedCounter("dm");
          } catch (_) {}
          const t = ev && ev.target;
          if (t && (t.tagName === "BUTTON" || (t.closest && t.closest("button")))) return;
          const current = (UI && typeof UI.getPanelSize === "function") ? UI.getPanelSize("dm") : "medium";
          const next = (current === "collapsed") ? "medium" : "collapsed";
          try {
            if (UI && typeof UI.setPanelSize === "function") UI.setPanelSize("dm", next);
          } catch (_) {}
        };
      }

      if (right) {
        if (!right.__controlsBuilt) {
          right.__controlsBuilt = true;
          right.textContent = "";
        }

        const setSizeHeader = (next) => {
          try {
            if (UI && typeof UI.setPanelSize === "function") UI.setPanelSize("dm", next);
            else { S.flags = S.flags || {}; S.flags.dmSize = next; }
          } catch (_) {}
          const S2 = getS();
          S2.dm = S2.dm || {};
          if (next !== "collapsed") S2.dm.open = true;
          requestAll();
        };

        const ensureBtn = (id, glyph, title, onClick) => {
          let btn = document.getElementById(id);
          if (!btn) {
            btn = document.createElement("button");
            btn.id = id;
            btn.type = "button";
            btn.className = "panelCtrlBtn";
            btn.title = title;
            btn.textContent = glyph;
            btn.onclick = onClick;
            right.appendChild(btn);
          } else if (!right.contains(btn)) {
            right.appendChild(btn);
          }
          return btn;
        };

        const btnMax = ensureBtn("dmBtnMax", "□", "Развернуть", (ev) => { stop(ev); setSizeHeader("max"); });
        const btnMed = ensureBtn("dmBtnMed", "⧉", "Стандартный размер", (ev) => { stop(ev); setSizeHeader("medium"); });

        try {
          const cur = (UI && typeof UI.getPanelSize === "function")
            ? UI.getPanelSize("dm")
            : getDmSize();
          btnMed.classList.toggle("is-active", cur === "medium");
          btnMax.classList.toggle("is-active", cur === "max");
        } catch(_) {}

        // Close X button (menu style)
        let closeBtn = document.getElementById("dmCloseX");
        if (!closeBtn) {
          closeBtn = document.createElement("button");
          closeBtn.id = "dmCloseX";
          closeBtn.type = "button";
          closeBtn.className = "btn closeX";
          closeBtn.title = "Закрыть";
          closeBtn.textContent = "×";
          closeBtn.onclick = (ev) => {
            stop(ev);
            closeDM();
            requestAll();
          };
          right.appendChild(closeBtn);
        } else if (!right.contains(closeBtn)) {
          right.appendChild(closeBtn);
        }

        // Prevent header click collapsing when interacting with buttons
        if (header && !header.__dmHeaderGuard) {
          header.__dmHeaderGuard = true;
          header.addEventListener("click", (ev) => {
            const t = ev && ev.target;
            if (t && (t.tagName === "BUTTON" || (t.closest && t.closest("button")))) {
              ev.stopPropagation();
            }
          }, false);
        }
        try {
          const collapsedCount = (UI && typeof UI.getCollapsedCounter === "function") ? UI.getCollapsedCounter("dm") : 0;
          let badgeEl = header.querySelector(".panelBadge.dmBadge");
          if (!badgeEl) {
            badgeEl = document.createElement("span");
            badgeEl.className = "badge panelBadge dmBadge";
          }
          badgeEl.textContent = collapsedCount ? `(${collapsedCount})` : "";
          badgeEl.style.display = collapsedCount ? "" : "none";
          if (right && badgeEl.parentNode !== header) {
            header.insertBefore(badgeEl, right);
          } else if (!right && badgeEl.parentNode !== header) {
            header.appendChild(badgeEl);
          }
        } catch (_) {}
      }
    }

    // If activeId is missing but we have open tabs, select the last one.
    if (!withId && S.dm.openIds.length) {
      S.dm.activeId = S.dm.openIds[S.dm.openIds.length - 1] || null;
      S.dm.withId = S.dm.activeId;
    }

    // DM must be hidden until explicitly opened by user action (bubble click / UI.openDM),
    // OR until an incoming DM opens the panel.
    if (!S.dm.open || !S.dm.activeId) {
      if (dmBlock) dmBlock.classList.add("hidden");
      return;
    }

    if (dmBlock) dmBlock.classList.remove("hidden");

    const dmBody = dmBlock ? (dmBlock.querySelector(".panelBody") || dmBlock.querySelector(".blockBody")) : null;
    if (dmBody && !dmBody.classList.contains("scroll")) dmBody.classList.add("scroll");

    const box = $("dmLog");
    if (!box) return;
    if (!box.classList.contains("dmLog")) box.classList.add("dmLog");

    let target = getS().players[withId];
    if (!target) {
      const fallbackName = (S.dm && S.dm.names && S.dm.names[withId]) ? S.dm.names[withId] : String(withId);
      target = {
        id: withId,
        name: fallbackName,
        influence: 0,
        role: "system",
        npc: false,
      };
    }

    // --- Tabs (chips) inside DM header ---
    try {
      const dmHeader = document.getElementById("dmHeader");
      if (dmHeader) {
        let tabs = document.getElementById("dmTabs");
        if (!tabs) {
          tabs = document.createElement("div");
          tabs.id = "dmTabs";
          // Reuse existing DM tabs styling
          tabs.className = "dmList";
          // Put tabs right after the title
          const titleEl = document.getElementById("dmTitle");
          if (titleEl && titleEl.parentNode === dmHeader) {
            titleEl.insertAdjacentElement("afterend", tabs);
          } else {
            dmHeader.appendChild(tabs);
          }
        }
        tabs.innerHTML = "";

        const openIds = Array.isArray(S.dm.openIds) ? S.dm.openIds.slice() : [];
        const activeId = String(S.dm.activeId || "");
        openIds.forEach((id) => {
          const p = S.players && S.players[id] ? S.players[id] : null;
          const name = p ? (UI.displayName ? UI.displayName(p) : p.name) : String(id);

          const chip = document.createElement("div");
          chip.className = "pill dmTab" + (String(id) === activeId ? " active" : "");
          chip.title = String(name || "");
          chip.onclick = (ev) => {
            stop(ev);
            S.dm.activeId = String(id);
            S.dm.withId = S.dm.activeId;
            S.dm.open = true;
            S.dm.unread = S.dm.unread || {};
            S.dm.unread[String(id)] = 0;
            try { UI.renderDM(); } catch (_) {}
            requestAll();
          };

          const row = document.createElement("div");
          row.className = "dmTabRow";
          chip.appendChild(row);

          const label = document.createElement("span");
          label.className = "dmTabLabel";
          label.textContent = String(name || "");
          row.appendChild(label);
          const unreadCount = (S.dm.unread && S.dm.unread[id]) ? S.dm.unread[id] : 0;
          if (unreadCount > 0) {
            const badgeDot = document.createElement("span");
            badgeDot.className = "badge dmTabBadge";
            badgeDot.textContent = String(unreadCount);
            row.appendChild(badgeDot);
          }

          const x = document.createElement("button");
          x.type = "button";
          x.className = "btn small dmTabClose";
          x.textContent = "×";
          x.title = "Закрыть";
          x.onclick = (ev) => {
            stop(ev);
            const i = S.dm.openIds.indexOf(String(id));
            if (i >= 0) S.dm.openIds.splice(i, 1);
            // If closing active: pick neighbor, else keep current
            if (String(id) === String(S.dm.activeId || "")) {
              const left = S.dm.openIds[i - 1] || null;
              const right = S.dm.openIds[i] || null;
              const next = right || left || null;
              S.dm.activeId = next;
              S.dm.withId = next;
              if (!next) {
                S.dm.open = false;
                const dmBlock0 = $("dmBlock");
                if (dmBlock0) dmBlock0.classList.add("hidden");
              }
            }
            try { UI.renderDM(); } catch (_) {}
            requestAll();
          };
          row.appendChild(x);

          tabs.appendChild(chip);
        });
      }
    } catch (_) {}

    const dmTitle = $("dmTitle");
    if (dmTitle) {
      const tname = (UI.displayName ? UI.displayName(target) : target.name);
      dmTitle.innerHTML = `Личка: ${escapeHtml(tname)} <span class="pill">[${escapeHtml(String(target.influence || 0))}]</span>`;
    }

    const listWrap = $("dmList") || document.createElement("div");
    listWrap.id = "dmList";
    listWrap.className = "dmList";
    if (!listWrap.parentNode && box.parentNode) {
      box.parentNode.insertBefore(listWrap, box);
    }
    const logsById = (S.dm && S.dm.logs) ? S.dm.logs : {};
    listWrap.classList.add("hidden");
    listWrap.innerHTML = "";

    box.innerHTML = "";
    const lines = ((S.dm && S.dm.logs && S.dm.logs[withId]) ? S.dm.logs[withId] : []);
    lines.slice(-120).forEach(l => {
      const d = document.createElement("div");
      d.className = "dmLine";

      const fromName = (l && (l.from || l.name)) ? String(l.from || l.name) : "???";
      const fromP = getPlayerByNameSafe(fromName);
      const fromLabel = fromP
        ? `${escapeHtml(UI.displayName ? UI.displayName(fromP) : fromP.name)} <span class="pill">[${escapeHtml(String(fromP.influence || 0))}]</span>`
        : escapeHtml(fromName);

      const textHtml = renderMentions(String(l.text || ""), { speakerName: fromName });
      d.innerHTML = `<b>${fromLabel}:</b> ${textHtml}`;
      box.appendChild(d);
    });
    box.scrollTop = box.scrollHeight;

    const actions = $("dmActions");
    if (!actions) return;
    actions.innerHTML = "";

    const isCop = target.role === "cop";
    const isBad = target.role === "bandit" || target.role === "toxic";
    const isMafia = target.role === "mafia";
    const cdMap = S.battleCooldowns || {};
    const cdMs = 3 * 60 * 1000;
    const cdLast = cdMap[withId] || 0;
    const cdActive = cdLast && (Date.now() - cdLast) < cdMs;

    const btnBattle = mkBtn("Забаттлить", () => {
      if ((getS().me.points || 0) <= 0) {
        const msg = "Недоступно.";
        if (UI && typeof UI.showStatToast === "function") {
          UI.showStatToast("points", msg);
        }
        UI.renderDM();
        return;
      }
      if (isCop) {
        // Cop can be battled. No penalty here.
        // Penalty (-5) must apply ONLY when player presses an attack (вброс) in conflict-core.js.
        const res = Game.Conflict.startWith(withId);
        if (!res || !res.ok) {
          dmPushLine(withId, "Система", (res && res.reason === "cooldown") ? "Дай человеку передохнуть." : "Не залетело.");
          UI.renderDM();
          return;
        }
        if (res.battleId && UI.pinBattleToTop) UI.pinBattleToTop(res.battleId);
        if (UI.openBattlesAndScroll) UI.openBattlesAndScroll();
        requestAll();
        return;
      }

      // Mafioso: allow battle, but it should behave like an incoming threat.
      // This ensures the fatal rule applies unless the player escapes.
      if (isMafia && Game.Conflict && typeof Game.Conflict.incoming === "function") {
        const b = Game.Conflict.incoming(withId);
        if (!b) {
          dmPushLine(withId, "Система", "Не залетело.");
          UI.renderDM();
          return;
        }
        if (UI.openBattlesAndScroll) UI.openBattlesAndScroll();
        requestAll();
        return;
      }

      const res = Game.Conflict.startWith(withId);
      if (!res.ok) {
        dmPushLine(withId, "Система", (res && res.reason === "cooldown") ? "Дай человеку передохнуть." : "Не залетело.");
        UI.renderDM();
        return;
      }
      if (!Game.__S.battles || Game.__S.battles.length === 0) return;

      if (res.battleId && UI.pinBattleToTop) UI.pinBattleToTop(res.battleId);
      if (UI.openBattlesAndScroll) UI.openBattlesAndScroll();
      requestAll();
    });
    if (cdActive) {
      btnBattle.disabled = true;
      btnBattle.title = "Дай человеку передохнуть.";
    }

    const canTeach = !isCop && !isMafia;
    const btnTeach = mkBtn("Обучить аргументу", () => {
      getS().dm.teachOpen = !getS().dm.teachOpen;
      UI.renderDM();
    });
    btnTeach.disabled = !canTeach;

    const btnEscape = null;

    const btnInvite = mkBtn("Позвать", () => {
      getS().dm.inviteOpen = !getS().dm.inviteOpen;
      UI.renderDM();
    });

    const btnLike = mkBtn("Лайк", () => {
      dmPushLine(withId, getS().me.name, "❤️");
      dmPushLine(withId, target.name, isCop ? "Засчитано." : (Game.Data && Game.Data.pick ? Game.Data.pick(["каеф","ну норм","хех","ладно"]) : "каеф"));
      UI.pushSystem(`${getS().me.name} перекинулся(ась) реакцией с ${target.name}.`);
      requestAll();
    });

    const btnGift = mkBtn("Недоступно", () => {});
    btnGift.disabled = true;

    const btnAsk = mkBtn("Недоступно", () => {});
    btnAsk.disabled = true;

    actions.appendChild(btnBattle);
    if (btnEscape) actions.appendChild(btnEscape);
    actions.appendChild(btnLike);
    actions.appendChild(btnGift);
    actions.appendChild(btnAsk);
    actions.appendChild(btnTeach);
    actions.appendChild(btnInvite);

    const teachPanel = $("teachPanel");
    if (teachPanel) {
      if (getS().dm.teachOpen && canTeach) {
        openTeachPanel(withId);
      } else {
        teachPanel.classList.add("hidden");
        teachPanel.innerHTML = "";
      }
    }

    if (getS().dm.inviteOpen) {
      const row = document.createElement("div");
      row.className = "battleRow";
      row.style.marginTop = "10px";

      const inp = document.createElement("input");
      inp.id = "inviteInput";
      inp.placeholder = "Ник игрока...";
      inp.autocomplete = "off";
      inp.style.flex = "1";
      inp.style.minWidth = "220px";
      inp.style.background = "#0f1116";
      inp.style.border = "1px solid rgba(255,255,255,0.10)";
      inp.style.borderRadius = "10px";
      inp.style.color = "var(--text)";
      inp.style.padding = "10px 12px";
      inp.style.outline = "none";

      const send = document.createElement("button");
      send.className = "miniBtn";
      send.textContent = "Позвать";

      // Autocomplete dropdown (DM scope)
      let listEl = document.getElementById("dmInviteList");
      if (!listEl) {
        listEl = document.createElement("div");
        listEl.id = "dmInviteList";
        listEl.className = "mention-list";
        listEl.style.display = "none";
        listEl.style.position = "fixed"; // Fixed positioning to escape parent overflow
        listEl.style.zIndex = "9999"; // High z-index to appear above all elements
        document.body.appendChild(listEl);
      }

      let inviteItems = [];
      let inviteActive = 0;

      function getRealPlayersForInvite(){
        // Prefer StateAPI candidates, fallback to UI candidates, fallback to S.players.
        let cand = [];
        try {
          if (Game.__A && typeof Game.__A.getAllMentionCandidates === "function") cand = Game.__A.getAllMentionCandidates();
          else if (UI.getAllMentionCandidates) cand = UI.getAllMentionCandidates();
        } catch(_) {}

        if (!Array.isArray(cand) || cand.length === 0) {
          cand = Object.values(getS().players || {}).map(p => ({
            id: p && p.id,
            name: p && p.name,
            npc: !!(p && p.npc),
            isMe: (p && (p.id === "me" || p.isMe)),
            influence: (p && p.influence) || 0
          }));
        }

        return (cand || [])
          .filter(x => x && x.name)
          .filter(x => !x.npc)            // only real players
          .filter(x => !x.isMe)           // not me
          .map(x => ({ id: x.id, name: String(x.name) }));
      }

      function normalizeName(s){
        return String(s || "").trim().toLowerCase();
      }

      function positionInviteList(){
        const r = inp.getBoundingClientRect();
        listEl.style.left = `${Math.max(12, Math.floor(r.left))}px`;
        listEl.style.bottom = "auto";
        listEl.style.top = `${Math.floor(r.bottom + 8)}px`;
        listEl.style.width = `${Math.max(220, Math.floor(r.width))}px`;
      }

      function closeInviteList(){
        listEl.style.display = "none";
        listEl.innerHTML = "";
        inviteItems = [];
        inviteActive = 0;
        // Clean up global click listener (prevents listener leaks across renders)
        try {
          if (inp && inp.__dmInviteOutsideHandler) {
            document.removeEventListener("click", inp.__dmInviteOutsideHandler, true);
            inp.__dmInviteOutsideHandler = null;
          }
        } catch (_) {}
      }

      function renderInviteList(filter){
        const all = getRealPlayersForInvite();
        const f = normalizeName(filter);
        inviteItems = all
          .filter(x => !f || normalizeName(x.name).startsWith(f))
          .slice(0, 12);

        if (!inviteItems.length) {
          closeInviteList();
          return;
        }

        inviteActive = Math.max(0, Math.min(inviteActive, inviteItems.length - 1));
        positionInviteList();
        listEl.innerHTML = "";

        inviteItems.forEach((it, idx) => {
          const d = document.createElement("div");
          d.className = "mention-item" + (idx === inviteActive ? " active" : "");
          d.textContent = it.name;
          d.onmousedown = (e) => { e.preventDefault(); }; // keep focus
          d.onclick = () => {
            inp.value = it.name;
            closeInviteList();
            inp.focus();
          };
          listEl.appendChild(d);
        });

        listEl.style.display = "block";
      }

      function resolveInviteTargetId(inputText){
        const q = normalizeName(inputText);
        if (!q) return null;
        const all = getRealPlayersForInvite();
        const found = all.find(x => normalizeName(x.name) === q);
        return found ? (found.id || null) : null;
      }

      function doInvite(){
        const q = (inp.value || "").trim();
        const targetId2 = resolveInviteTargetId(q);

        // If not exact match (case-insensitive) - do not invite.
        if (!targetId2) {
          dmPushLine(withId, "Система", "Игрок не найден.");
          UI.renderDM();
          return;
        }

        const p2 = getS().players[targetId2];
        const cleanName = p2 && p2.name ? String(p2.name) : q;

        dmPushLine(withId, "Система", `Ты позвал(а) ${cleanName} в личку.`);
        UI.pushSystem(`${getS().me.name} позвал(а) ${cleanName} в личку к ${target.name}.`);

        getS().dm.inviteOpen = false;
        closeInviteList();
        UI.renderDM();
      }

      send.onclick = doInvite;

      inp.addEventListener("input", () => {
        renderInviteList(inp.value || "");
      });

      inp.addEventListener("focus", () => {
        renderInviteList(inp.value || "");
      });

      inp.addEventListener("blur", () => {
        // Delay so click on list registers
        setTimeout(() => closeInviteList(), 120);
      });

      // Click outside to hide dropdown
      const handleClickOutside = (e) => {
        if (!listEl || listEl.isConnected !== true || !inp || inp.isConnected !== true) {
          closeInviteList();
          return;
        }
        if (listEl.style.display === "none") return;
        if (!inp.contains(e.target) && !listEl.contains(e.target)) {
          closeInviteList();
        }
      };
      // Replace any previous handler to avoid accumulation
      try {
        if (inp && inp.__dmInviteOutsideHandler) {
          document.removeEventListener("click", inp.__dmInviteOutsideHandler, true);
        }
        inp.__dmInviteOutsideHandler = handleClickOutside;
      } catch (_) {}
      document.addEventListener("click", handleClickOutside, true);

      inp.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          closeInviteList();
          return;
        }
        if (e.key === "ArrowDown") {
          if (inviteItems.length) {
            inviteActive = Math.min(inviteItems.length - 1, inviteActive + 1);
            renderInviteList(inp.value || "");
            e.preventDefault();
          }
          return;
        }
        if (e.key === "ArrowUp") {
          if (inviteItems.length) {
            inviteActive = Math.max(0, inviteActive - 1);
            renderInviteList(inp.value || "");
            e.preventDefault();
          }
          return;
        }
        if (e.key === "Enter") {
          if (inviteItems.length) {
            const it = inviteItems[inviteActive] || null;
            if (it) inp.value = it.name;
            closeInviteList();
            e.preventDefault();
          }
          doInvite();
          return;
        }
      });

      row.appendChild(inp);
      row.appendChild(send);
      actions.appendChild(row);

      setTimeout(() => {
        inp.focus();
        renderInviteList(inp.value || "");
      }, 0);
    }

    const dmInput = $("dmInput");
    const dmSend = $("dmSend");
    if (dmInput && dmSend && !dmInput.__enterHooked) {
      dmInput.__enterHooked = true;
      dmSend.onclick = () => {
        const text = (dmInput.value || "").trim();
        if (!text) return;
        const curId = (getS().dm && getS().dm.withId) ? getS().dm.withId : withId;
        if (!curId) return;
        const target = getS().players[curId];
        dmPushLine(curId, getS().me.name, text);

        // --- Агрессия toxic/bandit в DM ---
        (function() {
          // 1. Проверка агрессии: только если target.role === "toxic" или "bandit", и это первое сообщение игрока в личке, и не было агрессии ранее
          const S = getS();
          const target = S.players[curId];
          S.dm.agroStarted = S.dm.agroStarted || {};
          if ((target && (target.role === "toxic" || target.role === "bandit"))
              && !S.dm.agroStarted[curId]) {
            // Считаем количество сообщений от me в этой DM
            const logs = (S.dm.logs && S.dm.logs[curId]) || [];
            const myName = S.me && S.me.name;
            let countMine = 0;
            for (let i = 0; i < logs.length; ++i) {
              if (logs[i] && logs[i].from === myName) countMine++;
            }
            if (countMine === 1) {
              // Только на первое сообщение!
              // Запрещаем повторную агрессию
              S.dm.agroStarted[curId] = true;
              // Инициируем конфликт
              // Для bandit: обчистить 💰 до нуля происходит НЕ здесь, а в conflict-core.js при ответке (fromThem === true)
              // чтобы не было дублирования логики в DM.
              if (Game.Conflict && typeof Game.Conflict.incoming === "function") {
                Game.Conflict.incoming(curId);
              } else if (Game.Conflict && typeof Game.Conflict.startWith === "function") {
                Game.Conflict.startWith(curId);
              }
              if (UI.openBattlesAndScroll) UI.openBattlesAndScroll();
              requestAll();
            }
          }
        })();
        // --- END агрессия toxic/bandit ---

        if (target && target.role === "cop" && Game.NPC && typeof Game.NPC.generateCopReply === "function") {
          const reply = Game.NPC.generateCopReply(text);
          if (reply) {
            dmPushLine(curId, target.name, reply);
          }
          dmInput.value = "";
          UI.renderDM();
          requestAll();
          return;
        }
        if (target && target.role === "mafia") {
          // Per spec: mafia immediate trap DM and start battle
          const mafiaName = "Аркадий Петрович";
          const reply = "Ты мне пишешь? Тогда поговорим лично.";
          dmPushLine(curId, mafiaName, reply);
          dmInput.value = "";
          UI.renderDM();
          // Start incoming battle with mafia
          try {
            if (Game.Conflict && typeof Game.Conflict.incoming === "function") {
              Game.Conflict.incoming(curId);
            } else if (Game.Conflict && typeof Game.Conflict.startWith === "function") {
              Game.Conflict.startWith(curId);
            }
          } catch (_) {}
          requestAll();
          return;
        }
        if (target && target.npc && target.role !== "cop" && target.role !== "mafia") {
          try {
            if (Game.__A && typeof Game.__A.isNpcJailed === "function" && Game.__A.isNpcJailed(target.id)) {
              UI.renderDM();
              dmInput.value = "";
              requestAll();
              return;
            }
          } catch (_) {}
          const N = Game.NPC || null;
          let reply = "";
          if (N) {
            const S2 = getS();
            const vq = S2.dm && S2.dm.villainQuestion ? S2.dm.villainQuestion : null;
            const hasQuestion = vq && vq[curId];
            if ((target.role === "toxic" || target.role === "bandit") && hasQuestion) {
              reply = (typeof N.generateVillainChallenge === "function") ? N.generateVillainChallenge(target) : "";
              if (vq) vq[curId] = false;
            } else if (target.role === "toxic" || target.role === "bandit") {
              reply = (typeof N.generateAggroDMLine === "function") ? N.generateAggroDMLine(target) : "";
            } else if (typeof N.generateDmLine === "function") {
              reply = N.generateDmLine(target);
            }
          }
          if (reply) dmPushLine(curId, target.name, reply);
        }
        UI.renderDM();
        dmInput.value = "";
      };
      dmInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") dmSend.click();
      });
    }

    const extra = $("dmExtraRow");
    const hint = $("reportHint");

    if (isCop) {
      // Cop report flow: button → input with dropdown → submit → collapse and scroll to cop message.
      UI._copReport = UI._copReport || { open:false, q:"", sel:0, list:[], dropdownOpen:false };

      if (extra) extra.classList.remove("hidden");
      if (hint) hint.textContent = "Сообщить о токсике, бандите или мафиози.";

      if (extra) {
        extra.innerHTML = "";
        extra.style.display = "flex";
        extra.style.gap = "8px";
        extra.style.alignItems = "center";
        extra.style.flexWrap = "wrap";

        const state = UI._copReport;

        const closeDropdown = () => {
          state.dropdownOpen = false;
          const el = document.getElementById("reportList");
          if (el) el.style.display = "none";
        };

        const ensureDropdown = (inputEl) => {
          let listWrap = document.getElementById("reportList");
          if (!listWrap) {
            listWrap = document.createElement("div");
            listWrap.id = "reportList";
            listWrap.className = "mention-list";
            listWrap.style.position = "fixed";
            listWrap.style.zIndex = "9999";
            document.body.appendChild(listWrap);
          }
          const isReportable = (p) => {
            if (!p || !p.name) return false;
            if (p.isMe || p.id === "me") return false;
            try {
              if (Game.__A && typeof Game.__A.isNpcJailed === "function") {
                if (Game.__A.isNpcJailed(p.id)) return false;
              }
              if (Game.__A && typeof Game.__A.hasReported === "function") {
                const role = String(p.role || "");
                if (role === "toxic" || role === "bandit" || role === "mafia") {
                  if (Game.__A.hasReported(p.id)) return false;
                }
              }
            } catch (_) {}
            return true;
          };
          const getReportables = () => Object.values(getS().players || {}).filter(isReportable);
          const position = () => {
            if (!inputEl) return;
            const rect = inputEl.getBoundingClientRect();
            listWrap.style.left = `${rect.left}px`;
            listWrap.style.top = `${rect.bottom + 4}px`;
            listWrap.style.width = `${Math.max(rect.width, 220)}px`;
          };
          const render = () => {
            const q = String(state.q || "").trim().toLowerCase();
            const base = getReportables();
            const list = q ? base.filter(p => String(p.name || "").toLowerCase().includes(q)) : base;
            state.list = list;
            state.sel = Math.max(0, Math.min(state.sel || 0, Math.max(0, list.length - 1)));
            listWrap.innerHTML = "";

            if (!list.length) {
              const it = document.createElement("div");
              it.className = "mention-item";
              it.textContent = "Тут пусто.";
              listWrap.appendChild(it);
              listWrap.style.display = "block";
              position();
              return;
            }

            list.forEach((p, idx) => {
              const it = document.createElement("div");
              it.className = "mention-item" + (idx === (state.sel || 0) ? " active" : "");
              it.textContent = String(p.name || "");
              it.onclick = (e) => {
                stop(e);
                state.q = String(p.name || "");
                state.sel = idx;
                if (inputEl) inputEl.value = state.q;
                // Ensure local clear button becomes visible immediately (no chat render needed).
                try {
                  const cb = document.getElementById("reportClearBtn");
                  if (cb) cb.style.display = state.q.trim() ? "" : "none";
                } catch (_) {}
                state.dropdownOpen = false;
                listWrap.style.display = "none";
              };
              listWrap.appendChild(it);
            });
            listWrap.style.display = "block";
            position();
          };

          // Replace outside click handler (avoid leaks)
          const handleOutside = (e) => {
            if (!state.dropdownOpen) return;
            if (!inputEl || inputEl.isConnected !== true || !listWrap || listWrap.isConnected !== true) {
              closeDropdown();
              return;
            }
            if (!inputEl.contains(e.target) && !listWrap.contains(e.target)) {
              closeDropdown();
            }
          };
          try {
            if (state._outsideHandler) document.removeEventListener("click", state._outsideHandler, true);
          } catch (_) {}
          state._outsideHandler = handleOutside;
          document.addEventListener("click", handleOutside, true);

          return { listWrap, render, position };
        };

        const focusCopLine = () => {
          try {
            const box = $("dmLog");
            if (!box) return;
            box.scrollTop = 0;
            const copName = String(target && target.name ? target.name : "Коп");
            const lines = Array.from(box.querySelectorAll(".dmLine"));
            const hit = lines.slice().reverse().find(el => {
              const t = String(el.textContent || "").trim().toLowerCase();
              return copName && t.startsWith(copName.toLowerCase() + ":");
            }) || null;
            if (hit) {
              try { hit.classList.remove("focusFlash"); } catch (_) {}
              hit.scrollIntoView({ block: "start", behavior: "smooth" });
              hit.classList.add("focusFlash");
              setTimeout(() => { try { hit.classList.remove("focusFlash"); } catch (_) {} }, 1200);
            }
          } catch (_) {}
        };

        if (!state.open) {
          const openBtn = document.createElement("button");
          openBtn.id = "reportOpenBtn";
          openBtn.type = "button";
          openBtn.className = "btn";
          openBtn.textContent = "Сдать";
          openBtn.onclick = (e) => {
            stop(e);
            state.open = true;
            state.dropdownOpen = true;
            state.sel = 0;
            UI.renderDM();
            requestAll();
            setTimeout(() => {
              try {
                const inp = document.getElementById("reportInput");
                if (inp) inp.focus();
                // Open list immediately
                state.dropdownOpen = true;
                const dd = ensureDropdown(inp);
                if (dd) dd.render();
              } catch (_) {}
            }, 0);
          };
          extra.appendChild(openBtn);
        } else {
          const inputWrap = document.createElement("div");
          inputWrap.style.position = "relative";
          inputWrap.style.display = "flex";
          inputWrap.style.alignItems = "center";
          inputWrap.style.flex = "1";
          inputWrap.style.minWidth = "220px";

          const input = document.createElement("input");
          input.id = "reportInput";
          input.type = "text";
          input.className = "input";
          input.placeholder = "Ник бандита или токсика.";
          input.autocomplete = "off";
          input.value = String(state.q || "");
          // Prevent global auto-clear wrapper (we provide an in-field clear)
          try { input.dataset.noAutoClear = "1"; } catch (_) {}
          try { input.__clearBtnAdded = true; } catch (_) {}
          input.style.paddingRight = "28px";
          input.style.flex = "1";
          input.style.minWidth = "0";

          const clearBtn = document.createElement("button");
          clearBtn.id = "reportClearBtn";
          clearBtn.type = "button";
          clearBtn.className = "btn small";
          clearBtn.textContent = "×";
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
          clearBtn.style.display = input.value.trim() ? "" : "none";
          clearBtn.onclick = (e) => {
            stop(e);
            state.q = "";
            input.value = "";
            clearBtn.style.display = "none";
            state.dropdownOpen = true;
            const dd = ensureDropdown(input);
            if (dd) dd.render();
            input.focus();
          };

          inputWrap.appendChild(input);
          inputWrap.appendChild(clearBtn);
          extra.appendChild(inputWrap);

          const submitBtn = document.createElement("button");
          submitBtn.id = "reportBtn";
          submitBtn.type = "button";
          submitBtn.className = "btn";
          submitBtn.textContent = "Сдать";
          submitBtn.onclick = (e) => {
            stop(e);
            const q0 = String(input.value || "").trim();
            if (!q0) {
              if (UI && typeof UI.showActionToast === "function") UI.showActionToast(submitBtn, "Выбери игрока.");
              return;
            }
            if (!Game.__A || typeof Game.__A.applyReportByRole !== "function") return;
            // IMPORTANT: report is bound to the конкретному копу этой лички (per-cop cooldowns).
            const copId = (target && target.id) ? target.id : withId;
            const result = Game.__A.applyReportByRole(q0, { copId });

            // Collapse back to the "Сдать" button
            state.open = false;
            state.q = "";
            state.sel = 0;
            state.dropdownOpen = false;
            closeDropdown();

            // If jail applied, update battles immediately
            try {
              if (result && result.ok && UI && typeof UI.renderBattles === "function") UI.renderBattles();
            } catch (_) {}

            UI.renderDM();
            requestAll();
            setTimeout(() => focusCopLine(), 0);
          };
          extra.appendChild(submitBtn);

          // Keep hint at the end of the row (as a pill)
          if (hint) extra.appendChild(hint);

          // Dropdown behavior
          const dd = ensureDropdown(input);
          const renderNow = () => { try { if (dd && dd.render) dd.render(); } catch (_) {} };

          input.addEventListener("focus", () => {
            state.dropdownOpen = true;
            renderNow();
          });
          input.addEventListener("click", (e) => {
            stop(e);
            state.dropdownOpen = true;
            renderNow();
          });
          input.addEventListener("input", () => {
            state.q = String(input.value || "");
            clearBtn.style.display = input.value.trim() ? "" : "none";
            state.dropdownOpen = true;
            renderNow();
          });
          input.addEventListener("keydown", (e) => {
            if (e.key === "Escape") { stop(e); state.dropdownOpen = false; closeDropdown(); return; }
            if (e.key === "ArrowDown") { stop(e); state.sel = (state.sel || 0) + 1; renderNow(); return; }
            if (e.key === "ArrowUp") { stop(e); state.sel = Math.max(0, (state.sel || 0) - 1); renderNow(); return; }
            if (e.key === "Enter") {
              stop(e);
              // If dropdown has items and current value differs from selected, snap to it first.
              const list = Array.isArray(state.list) ? state.list : [];
              if (list.length > 0) {
                const idx = Math.max(0, Math.min(state.sel || 0, list.length - 1));
                const nextName = String(list[idx] && list[idx].name ? list[idx].name : "");
                if (nextName && String(input.value || "") !== nextName) {
                  state.q = nextName;
                  input.value = nextName;
                  clearBtn.style.display = nextName.trim() ? "" : "none";
                  state.dropdownOpen = false;
                  closeDropdown();
                  return;
                }
              }
              // Otherwise submit
              submitBtn.click();
            }
          });

          // Initial open: show list immediately
          if (state.dropdownOpen) {
            try { renderNow(); } catch (_) {}
          }
        }
      }
    } else {
      if (extra) extra.classList.add("hidden");
    }
  };

})();
