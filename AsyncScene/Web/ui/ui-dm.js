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
  const getS = () => (Game.State || UI.S);

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
    S.dm.logs = S.dm.logs || {};
    S.dm.logs[whoId] = S.dm.logs[whoId] || [];
    S.dm.logs[whoId].push({ t: UI.nowHHMM(), from, text });
  }
  UI.dmPushLine = dmPushLine;

  function closeDM() {
    const S = getS();
    S.dm.open = false;
    S.dm.withId = null;
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
    S.dm = S.dm || { open:false, withId:null, logs:{}, inviteOpen:false };
    S.dm.open = true;
    S.dm.withId = playerId;
    S.dm.logs = S.dm.logs || {};
    S.dm.logs[playerId] = S.dm.logs[playerId] || [];

    const dmBlock = $("dmBlock");
    if (dmBlock) dmBlock.classList.remove("hidden");

    if (UI.setPanelSize) UI.setPanelSize("dm", "medium");
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

        const spend = (Game.StateAPI && typeof Game.StateAPI.spendPoints === "function")
          ? Game.StateAPI.spendPoints
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
    S.dm = S.dm || { open:false, withId:null, logs:{}, inviteOpen:false };

    const withId = S.dm.withId;
    const dmBlock = $("dmBlock");
    if (dmBlock) dmBlock.classList.toggle("hidden", !S.dm.open);

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

        const btnCollapse = ensureBtn("dmBtnCollapse", "—", "Свернуть", (ev) => { stop(ev); setSizeHeader("collapsed"); });
        const btnMax = ensureBtn("dmBtnMax", "□", "Развернуть", (ev) => { stop(ev); setSizeHeader("max"); });
        const btnMed = ensureBtn("dmBtnMed", "⧉", "Стандартный размер", (ev) => { stop(ev); setSizeHeader("medium"); });

        try {
          const cur = (UI && typeof UI.getPanelSize === "function")
            ? UI.getPanelSize("dm")
            : getDmSize();
          btnCollapse.classList.toggle("is-active", cur === "collapsed");
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
          closeBtn.title = "Свернуть";
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
      }
    }

    // DM must be hidden until explicitly opened by user action (bubble click / UI.openDM).
    if (!S.dm.open || !withId) {
      if (dmBlock) dmBlock.classList.add("hidden");
      return;
    }

    if (dmBlock) dmBlock.classList.remove("hidden");

    const dmBody = dmBlock ? (dmBlock.querySelector(".panelBody") || dmBlock.querySelector(".blockBody")) : null;
    if (dmBody && !dmBody.classList.contains("scroll")) dmBody.classList.add("scroll");

    const box = $("dmLog");
    if (!box) return;
    if (!box.classList.contains("dmLog")) box.classList.add("dmLog");

    const target = getS().players[withId];
    if (!target) return;

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
    const dmIds = Object.keys(logsById).filter(id => logsById[id] && logsById[id].length);
    if (dmIds.length > 1) {
      listWrap.classList.remove("hidden");
      listWrap.innerHTML = "";
      dmIds.forEach((id) => {
        const p = getS().players[id] || {};
        const row = document.createElement("div");
        row.className = "dmTabRow";

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "pill dmTab" + (id === withId ? " active" : "");
        btn.textContent = (UI.displayName ? UI.displayName(p) : String(p.name || id));
        btn.onclick = (e) => { stop(e); UI.openDM(id); };

        const close = document.createElement("button");
        close.type = "button";
        close.className = "pill dmTabClose";
        close.textContent = "✕";
        close.title = "Закрыть";
        close.onclick = (e) => {
          stop(e);
          try { if (S.dm && S.dm.logs) delete S.dm.logs[id]; } catch (_) {}
          if (id === withId) {
            const rest = Object.keys(S.dm.logs || {});
            if (rest.length) UI.openDM(rest[0]);
            else UI.closeDM();
          } else {
            UI.renderDM();
          }
        };

        row.appendChild(btn);
        row.appendChild(close);
        listWrap.appendChild(row);
      });
    } else {
      listWrap.classList.add("hidden");
    }

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
      if (!Game.State.battles || Game.State.battles.length === 0) return;

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
        document.body.appendChild(listEl);
      }

      let inviteItems = [];
      let inviteActive = 0;

      function getRealPlayersForInvite(){
        // Prefer StateAPI candidates, fallback to UI candidates, fallback to S.players.
        let cand = [];
        try {
          if (Game.StateAPI && typeof Game.StateAPI.getAllMentionCandidates === "function") cand = Game.StateAPI.getAllMentionCandidates();
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
          // Mafioso replies politely with ideal punctuation.
          const N = Game.NPC || null;
          const pick = (Game.Data && typeof Game.Data.pick === "function") ? Game.Data.pick : null;

          let base = "";
          if (N && N.SAY && N.SAY.mafia) {
            const pool = (N.SAY.mafia.m || N.SAY.mafia.f || []);
            if (pool && pool.length) base = pool[Math.floor(Math.random() * pool.length)];
          }

          if (!base) {
            base = "Добрый день. Если сомневаетесь, лучше уйдите";
          }

          const lineFn = (N && typeof N.normalizeCopLine === "function") ? N.normalizeCopLine : null;
          const reply = lineFn ? lineFn(base) : base;

          dmPushLine(curId, target.name, reply);
          dmInput.value = "";
          UI.renderDM();
          requestAll();
          return;
        }
        if (target && target.npc && target.role !== "cop" && target.role !== "mafia") {
          try {
            if (Game.StateAPI && typeof Game.StateAPI.isNpcJailed === "function" && Game.StateAPI.isNpcJailed(target.id)) {
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

    const reportInput = $("reportInput");
    const reportBtn = $("reportBtn");
    if (reportInput && reportBtn && !reportInput.__enterHooked) {
      reportInput.__enterHooked = true;
      reportInput.dataset.enterMode = "custom";
      reportBtn.onclick = () => {
        const q0 = (reportInput.value || "").trim();
        if (!q0) return;
        if (!Game.StateAPI || typeof Game.StateAPI.applyReportByRole !== "function") return;

        Game.StateAPI.applyReportByRole(q0);
        reportInput.value = "";
        UI.renderDM();
        requestAll();
      };
      reportInput.addEventListener("keydown", (e) => {
        if (e.key !== "Enter") return;
        stop(e);
        // First Enter picks highlighted name, second Enter submits
        const list = (UI._reportInvite && Array.isArray(UI._reportInvite.list)) ? UI._reportInvite.list : [];
        if (list.length > 0) {
          const idx = Math.max(0, Math.min(UI._reportInvite.sel || 0, list.length - 1));
          const nextName = String(list[idx].name || "");
          if (String(reportInput.value || "") !== nextName) {
            reportInput.value = nextName;
            UI._reportInvite.q = nextName;
            renderReportList();
            stop(e);
            return;
          }
        }
        reportBtn.click();
      }, true);
    }

    // Cop report autocomplete list (NPC toxic/bandit/mafia)
    if (reportInput) {
      UI._reportInvite = UI._reportInvite || { open:false, q:"", sel:0, list:[] };

      const listWrap = document.getElementById("reportList") || document.createElement("div");
      listWrap.id = "reportList";
      listWrap.className = "mention-list";

      const isReportable = (p) => {
        if (!p || !p.name) return false;
        if (p.isMe || p.id === "me") return false;
        try {
          if (Game.StateAPI && typeof Game.StateAPI.isNpcJailed === "function") {
            if (Game.StateAPI.isNpcJailed(p.id)) return false;
          }
          if (Game.StateAPI && typeof Game.StateAPI.hasReported === "function") {
            const role = String(p.role || "");
            if (role === "toxic" || role === "bandit" || role === "mafia") {
              if (Game.StateAPI.hasReported(p.id)) return false;
            }
          }
        } catch (_) {}
        return true;
      };

      const getReportables = () => {
        const ps = Object.values(getS().players || {}).filter(isReportable);
        return ps;
      };

      const renderReportList = () => {
        const q = String(UI._reportInvite.q || "").trim().toLowerCase();
        const base = getReportables();
        const list = q
          ? base.filter(p => String(p.name || "").toLowerCase().includes(q))
          : base;
        UI._reportInvite.list = list;
        listWrap.innerHTML = "";

        if (!list.length) {
          const it = document.createElement("div");
          it.className = "mention-item";
          it.textContent = "Тут пусто.";
          listWrap.appendChild(it);
          return;
        }

        UI._reportInvite.sel = Math.max(0, Math.min(UI._reportInvite.sel || 0, list.length - 1));
        list.forEach((p, idx) => {
          const it = document.createElement("div");
          it.className = "mention-item" + (idx === (UI._reportInvite.sel || 0) ? " active" : "");
          it.textContent = String(p.name || "");
          it.onclick = (e) => {
            stop(e);
            UI._reportInvite.q = String(p.name || "");
            reportInput.value = UI._reportInvite.q;
            UI._reportInvite.sel = idx;
            renderReportList();
            reportInput.focus();
          };
          listWrap.appendChild(it);
        });
      };

      reportInput.addEventListener("focus", () => {
        UI._reportInvite.open = true;
        UI._reportInvite.q = String(reportInput.value || "");
        UI._reportInvite.sel = 0;
        renderReportList();
      });

      reportInput.addEventListener("input", () => {
        UI._reportInvite.open = true;
        UI._reportInvite.q = String(reportInput.value || "");
        UI._reportInvite.sel = 0;
        renderReportList();
      });

      reportInput.addEventListener("keydown", (e) => {
        if (!UI._reportInvite.open) return;
        if (e.key === "ArrowDown") { stop(e); UI._reportInvite.sel = (UI._reportInvite.sel || 0) + 1; renderReportList(); }
        if (e.key === "ArrowUp") { stop(e); UI._reportInvite.sel = Math.max(0, (UI._reportInvite.sel || 0) - 1); renderReportList(); }
      });

      const extra = $("dmExtraRow");
      if (extra && !extra.contains(listWrap)) {
        extra.appendChild(listWrap);
      }
      if (UI._reportInvite.open) renderReportList();
    }

    const extra = $("dmExtraRow");
    const hint = $("reportHint");

    if (isCop) {
      if (extra) extra.classList.remove("hidden");
      if (hint) hint.textContent = "Сообщить о токсике, бандите или мафиози.";
    } else {
      if (extra) extra.classList.add("hidden");
    }
  };

})();
