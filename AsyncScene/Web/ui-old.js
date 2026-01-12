// ui.js
window.Game = window.Game || {};

(() => {
  const $ = (id) => document.getElementById(id);

  const UI = {};
  Game.UI = UI;

  const S = Game.State = Game.State || {
    me: { id:"me", name:"", influence:0, points:10, wins:0, winsSinceInfluence:0, oneShots:[] },
    locationId: "square",
    players: {},
    chat: [],
    dm: { open:false, withId:null, logs:{}, inviteOpen:false, copSilent:true, aggro:{} },
    battles: [],
    events: [],
    flags: { highlightEventId:null },
  };

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

  function nameWithInf(name) {
    const p = getPlayerByName(name);
    if (!p) return name;
    return `${p.name} <span class="pill">[${escapeHtml(String(p.influence || 0))}]</span>`;
  }

  function nameTextWithInf(name) {
    const p = getPlayerByName(name);
    if (!p) return name;
    return `${p.name} [${p.influence || 0}]`;
  }

  // Players
  function buildPlayers() {
    S.players = S.players || {};
    S.players["me"] = S.players["me"] || { id:"me", name:S.me.name || "Ты", influence:S.me.influence||0, points:S.me.points||0, wins:S.me.wins||0, role:"me" };

    const npcs = (Game.NPC && Game.NPC.getAll) ? Game.NPC.getAll() : [];
    npcs.forEach(n => {
      S.players[n.id] = { ...n, points: 10, wins: 0, oneShots: [] };
    });
  }

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

  function isCopSpeaker(name) {
    const p = getPlayerByName(name);
    return !!(p && p.role === "cop");
  }

  function pushChat({ name, text, system=false, id=null, action=null, battleId=null }) {
    const msg = {
      id: id || `m_${Date.now()}_${Math.floor(Math.random()*9999)}`,
      t: nowHHMM(),
      name,
      system: !!system,
      action: action || null,
      battleId: battleId || null,
      text: system ? String(text || "") : (isCopSpeaker(name) ? String(text || "") : normalizePublic(text)),
    };
    S.chat.push(msg);
    UI.renderChatSmart();
  }

  UI.pushSystem = (text, opts={}) => {
    pushChat({ name:"Система", text:String(text||""), system:true, action:opts.action||null, battleId:opts.battleId||null });
  };

  UI.pushCop = (text) => {
    const cop = Object.values(S.players).find(p => p && p.role === "cop");
    if (!cop) {
      // fallback as system if no cop exists
      UI.pushSystem(text);
      return;
    }
    pushChat({ name: cop.name, text: String(text || ""), system:false });
  };

  // Chat scroll behavior:
  // - if at bottom: stick to bottom
  // - if user scrolled up: keep viewport anchored (no jumps)
  let autoScroll = true;

  UI.renderChatSmart = () => {
    const box = $("chatLog");
    if (!box) return;

    const prevScrollTop = box.scrollTop;
    const prevScrollHeight = box.scrollHeight;

    const nearBottom = (box.scrollHeight - box.scrollTop - box.clientHeight) < 40;
    if (nearBottom) autoScroll = true;

    box.innerHTML = "";
    S.chat.forEach(m => {
      const el = document.createElement("div");
      el.className = "bubble" + (m.system ? " system" : "");
      el.dataset.msgId = m.id;
      if (m.action) el.dataset.action = m.action;
      if (m.battleId) el.dataset.battleId = m.battleId;

      el.innerHTML = `
        <div class="meta">
          <span class="name">${m.system ? escapeHtml(m.name) : `${escapeHtml(m.name)} <span class="pill">[${escapeHtml(String(getPlayerByName(m.name)?.influence || 0))}]</span>`}</span>
          <span class="time">${escapeHtml(m.t)}</span>
        </div>
        <div class="text">${escapeHtml(m.text)}</div>
      `;

      el.onclick = () => {
        if (m.system && m.action === "pinBattle" && m.battleId) {
          UI.pinBattleToTop(m.battleId);
          UI.openBattlesAndScroll();
          return;
        }
        if (m.system) return;
        UI.openDMByName(m.name);
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

  // Pin battle
  UI.pinBattleToTop = (battleId) => {
    const b = S.battles.find(x => x.id === battleId);
    if (!b) return;
    b.pinned = true;

    // move to front
    S.battles = [b].concat(S.battles.filter(x => x.id !== battleId));
    UI.renderAll();
  };

  UI.openBattlesAndScroll = () => {
    const body = $("battlesBody");
    const arrow = $("battlesArrow");
    if (body && arrow) {
      body.classList.remove("hidden");
      arrow.textContent = "Свернуть";
    }

    const scroller = $("blocks");
    const block = $("battlesBlock");
    if (scroller && block) {
      scroller.scrollTo({ top: Math.max(0, block.offsetTop - 10), behavior: "smooth" });
    }
  };

  // DM open
  UI.openDMByName = (name) => {
    if (!S.me.name) return;
    if (!name || name === "Система") return;

    const playerId = Object.keys(S.players).find(pid => (S.players[pid]?.name === name));
    if (!playerId) return;

    S.dm.open = true;
    S.dm.withId = playerId;
    S.dm.logs[playerId] = S.dm.logs[playerId] || [];

    const dmBlock = $("dmBlock");
    if (dmBlock) dmBlock.classList.remove("hidden");

    renderDM();
    renderAll();
  };

  function dmPushLine(whoId, from, text) {
    S.dm.logs[whoId] = S.dm.logs[whoId] || [];
    S.dm.logs[whoId].push({ t: nowHHMM(), from, text });
  }

  function closeDM() {
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

  function mkBtn(label, fn, cls="miniBtn") {
    const b = document.createElement("button");
    b.className = cls;
    b.textContent = label;
    b.onclick = fn;
    return b;
  }

  function myAllowedColors() {
    const inf = S.me.influence || 0;
    const set = new Set(["yellow"]);
    if (inf >= 5) set.add("orange");
    if (inf >= 10) set.add("red");
    return set;
  }

  function teachCostByColor(color) {
    if (color === "yellow") return 1;
    if (color === "orange") return 2;
    if (color === "red") return 3;
    return 1;
  }

  function openTeachPanel(targetId) {
    const panel = $("teachPanel");
    if (!panel) return;

    panel.classList.remove("hidden");
    panel.innerHTML = "";

    const title = document.createElement("div");
    title.className = "pill";
    title.textContent = "Выбери фразу. У получателя она будет одноразовая. Это платно.";
    panel.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "phraseGrid";
    panel.appendChild(grid);

    // only phrases allowed by my influence
    const allowed = myAllowedColors();
    const all = [];
    Game.Data.PHRASES.attack.forEach(p => { if (allowed.has(p.color)) all.push({ ...p, kind:"attack" }); });
    Game.Data.PHRASES.defense.forEach(p => { if (allowed.has(p.color)) all.push({ ...p, kind:"defense" }); });

    all.forEach(p => {
      const cost = teachCostByColor(p.color);
      const card = document.createElement("div");
      card.className = `phraseCard ${p.color}`;
      card.innerHTML = `
        ${escapeHtml(p.text)}
        <span class="sub">${p.kind === "attack" ? "вброс" : "ответка"} | цена: ${cost}</span>
      `;

      card.onclick = () => {
        const to = S.players[targetId];
        if (!to) return;

        if ((S.me.points || 0) < cost) {
          dmPushLine(targetId, "Система", "Не хватает 💰 на обучение.");
          renderDM();
          return;
        }

        S.me.points = Math.max(0, (S.me.points || 0) - cost);

        to.oneShots = to.oneShots || [];
        to.oneShots.push({
          id: `os_${Date.now()}_${Math.floor(Math.random()*9999)}`,
          kind: p.kind,
          color: p.color,
          text: p.text,
          used: false
        });

        // DM line + duplicate to chat
        dmPushLine(targetId, "Система", Game.Data.SYS.youTaughtDm(to.name, p.text, cost));
        UI.pushSystem(Game.Data.SYS.teachGiven(to.name, p.text, cost));

        panel.classList.add("hidden");
        panel.innerHTML = "";
        renderAll();
        renderDM();
      };

      grid.appendChild(card);
    });

    if (all.length === 0) {
      const empty = document.createElement("div");
      empty.className = "pill";
      empty.textContent = "Пока нет доступных фраз по твоему ⚡.";
      panel.appendChild(empty);
    }
  }

  function toggleDMBody() {
    const dm = $("dmBlock");
    if (!dm) return;
    const body = dm.querySelector(".blockBody");
    const righty = dm.querySelector(".blockHeader .righty");
    if (!body || !righty) return;

    const hidden = body.classList.contains("hidden");
    if (hidden) {
      body.classList.remove("hidden");
      righty.textContent = "Свернуть";
    } else {
      body.classList.add("hidden");
      righty.textContent = "Развернуть";
    }
  }

  function renderDM() {
    const withId = S.dm.withId;
    const target = S.players[withId];
    if (!target) return;

    const dmTitle = $("dmTitle");
    if (dmTitle) dmTitle.innerHTML = `Личка: ${escapeHtml(target.name)} <span class="pill">[${escapeHtml(String(target.influence || 0))}]</span>`;

    const box = $("dmLog");
    if (!box) return;

    box.innerHTML = "";
    const lines = (S.dm.logs[withId] || []);
    lines.slice(-120).forEach(l => {
      const d = document.createElement("div");
      d.className = "dmLine";

      // name + influence everywhere
      const fromP = getPlayerByName(l.from);
      const fromLabel = fromP ? `${escapeHtml(fromP.name)} <span class="pill">[${escapeHtml(String(fromP.influence || 0))}]</span>` : escapeHtml(l.from);

      d.innerHTML = `<b>${fromLabel}:</b> ${escapeHtml(l.text)}`;
      box.appendChild(d);
    });
    box.scrollTop = box.scrollHeight;

    const actions = $("dmActions");
    if (!actions) return;
    actions.innerHTML = "";

    const isCop = target.role === "cop";
    const isBad = target.role === "bandit" || target.role === "gopnik";

    const btnBattle = mkBtn("Забаттлить", () => {
      if ((S.me.points || 0) <= 0) {
        dmPushLine(withId, "Система", Game.Data.SYS.pointsLow);
        renderDM();
        return;
      }
      if (isCop) {
        dmPushLine(withId, "Коп", "Не провоцируйте конфликт. Сообщайте подозрительных лиц.");
        renderDM();
        return;
      }

      const res = Game.Conflict.startWith(withId, { pinned:true });
      if (!res.ok && res.reason === "no_points") {
        dmPushLine(withId, "Система", Game.Data.SYS.pointsLow);
        renderDM();
        return;
      }

      if (res.ok && res.battleId) {
        UI.pinBattleToTop(res.battleId);
        UI.openBattlesAndScroll();
      }
      renderAll();
    });

    const btnTeach = mkBtn("Научить фразе", () => openTeachPanel(withId));

    // Invite: toggle inline input panel
    const btnInvite = mkBtn("Позвать", () => {
      S.dm.inviteOpen = !S.dm.inviteOpen;
      renderDM();
    });

    // Like always ok
    const btnLike = mkBtn("Лайк", () => {
      dmPushLine(withId, S.me.name, "❤️");
      dmPushLine(withId, target.name, isCop ? "Принято." : Game.Data.pick(["каеф","ну норм","хех","ладно"]));
      UI.pushSystem(`${S.me.name} перекинулся(ась) реакцией с ${target.name}.`);
      renderAll();
    });

    // Gift/Ask disabled for cop/bandit/gopnik
    const btnGift = mkBtn("Подкинуть 💰", () => {
      if ((S.me.points || 0) <= 0) {
        dmPushLine(withId, "Система", "Не хватает 💰.");
        renderDM();
        return;
      }
      if (isCop || isBad) return;

      S.me.points = Math.max(0, S.me.points - 1);
      dmPushLine(withId, S.me.name, "подкинул(а) 💰");
      dmPushLine(withId, target.name, Game.Data.pick(["ок","каеф","неожиданно","спасибо"]));
      UI.pushSystem(`${S.me.name} подкинул(а) 💰 ${target.name}.`);
      renderAll();
    });
    if (isCop || isBad) btnGift.disabled = true;

    const btnAsk = mkBtn("Попросить 💰", () => {
      if (isCop || isBad) return;
      dmPushLine(withId, S.me.name, "подкинь 💰?");
      const ok = Math.random() < 0.30;
      if (ok) {
        dmPushLine(withId, target.name, "держи");
        S.me.points = (S.me.points || 0) + 1;
        UI.pushSystem(`${target.name} подкинул(а) 💰 ${S.me.name}.`);
      } else {
        dmPushLine(withId, target.name, "неа");
      }
      renderAll();
    });
    if (isCop || isBad) btnAsk.disabled = true;

    actions.appendChild(btnBattle);
    actions.appendChild(btnLike);
    actions.appendChild(btnGift);
    actions.appendChild(btnAsk);
    actions.appendChild(btnTeach);
    actions.appendChild(btnInvite);

    // Invite panel
    if (S.dm.inviteOpen) {
      const row = document.createElement("div");
      row.className = "battleRow";
      row.style.marginTop = "10px";

      const inp = document.createElement("input");
      inp.id = "inviteInput";
      inp.placeholder = "Ник, которого позвать.";
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
      send.onclick = () => {
        const q = (inp.value || "").trim();
        if (!q) return;
        dmPushLine(withId, "Система", `Ты позвал(а) ${q} в личку.`);
        UI.pushSystem(`${S.me.name} позвал(а) ${q} в личку к ${target.name}.`);
        S.dm.inviteOpen = false;
        renderDM();
      };

      inp.addEventListener("keydown", (e) => { if (e.key === "Enter") send.click(); });

      row.appendChild(inp);
      row.appendChild(send);
      actions.appendChild(row);

      setTimeout(() => inp.focus(), 0);
    }

    // Cop extra row
    const extra = $("dmExtraRow");
    const hint = $("reportHint");

    if (isCop) {
      if (extra) extra.classList.remove("hidden");
      if (hint) hint.textContent = "Сдать бандита или гопника за вознаграждение в 2 💰. Ложный донос: штраф -1 💰.";
    } else {
      if (extra) extra.classList.add("hidden");
    }
  }

  // Battles rendering with pinned-first ordering
  function sortedBattles() {
    const pinned = S.battles.filter(b => b.pinned);
    const rest = S.battles.filter(b => !b.pinned);
    return pinned.concat(rest);
  }

  function renderBattles() {
    const body = $("battlesBody");
    const countEl = $("battleCount");
    if (!body || !countEl) return;

    countEl.textContent = String(S.battles.length);
    body.innerHTML = "";

    if (S.battles.length === 0) {
      const empty = document.createElement("div");
      empty.className = "pill";
      empty.textContent = "Пока тихо. Но это ненадолго.";
      body.appendChild(empty);
      return;
    }

    const row = document.createElement("div");
    row.className = "battleRow";

    const canFreeOff = (S.me.influence || 0) >= 5;

    const btnAll = document.createElement("button");
    btnAll.className = "miniBtn danger";
    btnAll.textContent = `Свалить от всех за ${S.battles.length}`;
    btnAll.onclick = () => Game.Conflict.escapeAll("smyt");
    row.appendChild(btnAll);

    if (canFreeOff) {
      const btnOff = document.createElement("button");
      btnOff.className = "miniBtn";
      btnOff.textContent = "Отшить всех";
      btnOff.onclick = () => Game.Conflict.escapeAll("off");
      row.appendChild(btnOff);
    } else {
      const hint = document.createElement("span");
      hint.className = "pill";
      hint.textContent = "Отвали откроется на ⚡ 5.";
      row.appendChild(hint);
    }

    body.appendChild(row);

    sortedBattles().forEach(b => {
      const opp = S.players[b.opponentId];
      const card = document.createElement("div");
      card.className = "battleCard";

      const top = document.createElement("div");
      top.className = "battleTop";
      top.innerHTML = `
        <div class="title">
          ${escapeHtml(opp ? opp.name : "???")}
          <span class="pill">[${escapeHtml(String(opp ? opp.influence : 0))}]</span>
          ${b.pinned ? `<span class="pill">PIN</span>` : ""}
        </div>
        <div class="meta">Твое ⚡: <b>${escapeHtml(String(S.me.influence || 0))}</b></div>
      `;
      card.appendChild(top);

      const line = document.createElement("div");
      line.className = "battleLine";

      if (!b.resolved) {
        if (b.status === "pickDefense") line.textContent = `${opp ? opp.name : "Кто-то"} забаттлил(а) тебя. Выбери ответку!`;
        else if (b.status === "pickAttack") line.textContent = `Выбери вброс, чтобы забаттлить ${opp ? opp.name : "кого-то"}.`;
        else line.textContent = "Ждем ответку...";
      } else {
        line.textContent = b.resultLine || "Результат готов.";
      }
      card.appendChild(line);

      if (!b.resolved) {
        if (b.status === "pickAttack") {
          const grid = document.createElement("div");
          grid.className = "phraseGrid";

          Game.Conflict.myAttackOptions().forEach(p => {
            const ph = document.createElement("div");
            ph.className = `phraseCard ${p.color}`;
            ph.innerHTML = `${escapeHtml(p.text)}<span class="sub">вброс</span>`;
            ph.onclick = () => Game.Conflict.pickAttack(b.id, p.id);
            grid.appendChild(ph);
          });

          card.appendChild(grid);
        }

        if (b.status === "pickDefense") {
          const grid = document.createElement("div");
          grid.className = "phraseGrid";

          Game.Conflict.myDefenseOptions().forEach(p => {
            const ph = document.createElement("div");
            ph.className = `phraseCard ${p.color}`;
            ph.innerHTML = `${escapeHtml(p.text)}<span class="sub">ответка</span>`;
            ph.onclick = () => Game.Conflict.pickDefense(b.id, p.id);
            grid.appendChild(ph);
          });

          card.appendChild(grid);
        }

        const row2 = document.createElement("div");
        row2.className = "battleRow";

        const sm = document.createElement("button");
        sm.className = "miniBtn danger";
        sm.textContent = "Свалить за 1 💰";
        sm.onclick = () => Game.Conflict.escape(b.id, "smyt");
        row2.appendChild(sm);

        if ((S.me.influence || 0) >= 5) {
          const off = document.createElement("button");
          off.className = "miniBtn";
          off.textContent = "Отвали";
          off.onclick = () => Game.Conflict.escape(b.id, "off");
          row2.appendChild(off);
        } else {
          const hint = document.createElement("span");
          hint.className = "pill";
          hint.textContent = "Отвали откроется на ⚡ 5.";
          row2.appendChild(hint);
        }

        card.appendChild(row2);

        if (b.inlineNote) {
          const note = document.createElement("div");
          note.className = "battleInline";
          note.textContent = b.inlineNote;
          card.appendChild(note);
        }
      } else {
        if (b.attack) {
          const showA = document.createElement("div");
          showA.className = `phraseCard ${b.attack.color}`;
          showA.innerHTML = `${escapeHtml(b.attack.text)}<span class="sub">вброс</span>`;
          card.appendChild(showA);
        }
        if (b.defense) {
          const showD = document.createElement("div");
          showD.className = `phraseCard ${b.defense.color}`;
          showD.innerHTML = `${escapeHtml(b.defense.text)}<span class="sub">ответка</span>`;
          card.appendChild(showD);
        }

        if (b.tieVote && !b.tieVote.decided) {
          const v = b.tieVote;
          const sec = Math.max(0, Math.ceil((v.endsAt - Date.now()) / 1000));
          const vote = document.createElement("div");
          vote.className = "eventCard";
          vote.innerHTML = `
            <div class="eventTop">
              <div class="title">Голос толпы</div>
              <div class="meta">Осталось: <b>${sec}s</b></div>
            </div>
            <div class="eventRow">
              <span class="pill">Атака: <b>${v.aVotes}</b></span>
              <span class="pill">Защита: <b>${v.bVotes}</b></span>
            </div>
          `;
          card.appendChild(vote);
        }

        const res = document.createElement("div");
        res.className = "battleResult";
        res.textContent = b.resultLine || "Разошлись на чиле.";
        card.appendChild(res);

        const closeRow = document.createElement("div");
        closeRow.className = "battleRow";

        const closeBtn = document.createElement("button");
        closeBtn.className = "miniBtn";
        closeBtn.textContent = "Закрыть";
        closeBtn.onclick = () => {
          S.battles = S.battles.filter(x => x.id !== b.id);
          renderAll();
        };
        closeRow.appendChild(closeBtn);
        card.appendChild(closeRow);
      }

      body.appendChild(card);
    });
  }

  // Events
  function renderEvents() {
    const body = $("eventsBody");
    const header = $("eventsHeader");
    if (!body || !header) return;

    const active = S.events.filter(e => !e.closed && !e.resolved);
    const rest = S.events.filter(e => !e.closed && e.resolved);

    // header count
    const titleDiv = header.querySelector("div");
    if (titleDiv) titleDiv.textContent = `События (${active.length + rest.length})`;

    body.innerHTML = "";

    // close/clear button row
    const topRow = document.createElement("div");
    topRow.className = "eventRow";

    const btn = document.createElement("button");
    btn.className = "miniBtn danger";
    btn.textContent = "Закрыть лишнее";

    btn.onclick = () => {
      let anyClosed = false;
      S.events.forEach(e => {
        if (!e.closed && e.resolved) { e.closed = true; anyClosed = true; }
      });
      if (anyClosed) {
        btn.textContent = "Очистить";
        btn.onclick = () => {
          S.events.forEach(e => e.closed = true);
          renderAll();
        };
      }
      renderAll();
    };

    topRow.appendChild(btn);
    body.appendChild(topRow);

    const renderList = (list) => {
      list.forEach(e => {
        const card = document.createElement("div");
        card.className = "eventCard";

        const sec = e.resolved ? 0 : Math.max(0, Math.ceil((e.endsAt - Date.now()) / 1000));
        card.innerHTML = `
          <div class="eventTop">
            <div class="title">${escapeHtml(e.title)}</div>
            <div class="meta">${e.resolved ? "Готово" : `Осталось: <b>${sec}s</b>`}</div>
          </div>
        `;

        if (!e.resolved) {
          const row = document.createElement("div");
          row.className = "eventRow";

          const b1 = document.createElement("button");
          b1.className = "miniBtn";
          b1.textContent = `Вписаться за ${e.a.name}`;
          b1.disabled = !!e.myPick;
          b1.onclick = () => pickEventSide(e.id, "a");

          const b2 = document.createElement("button");
          b2.className = "miniBtn";
          b2.textContent = `Вписаться за ${e.b.name}`;
          b2.disabled = !!e.myPick;
          b2.onclick = () => pickEventSide(e.id, "b");

          const b3 = document.createElement("button");
          b3.className = "miniBtn";
          b3.textContent = "Промолчу";
          b3.disabled = !!e.myPick;
          b3.onclick = () => pickEventSide(e.id, "none");

          row.appendChild(b1);
          row.appendChild(b2);
          row.appendChild(b3);

          const rule = document.createElement("div");
          rule.className = "pill";
          rule.textContent = "Помощь стоит 1 💰. Если твоя сторона выиграет, получишь 2.";

          card.appendChild(row);
          card.appendChild(rule);
        } else {
          const res = document.createElement("div");
          res.className = "pill";
          res.textContent = e.resultLine || "Событие закончилось. Площадь уже переключилась.";
          card.appendChild(res);

          const closeBtn = document.createElement("button");
          closeBtn.className = "miniBtn";
          closeBtn.textContent = "Закрыть";
          closeBtn.onclick = () => { e.closed = true; renderAll(); };
          card.appendChild(closeBtn);
        }

        if (S.flags.highlightEventId && S.flags.highlightEventId === e.id) {
          card.style.outline = "2px solid rgba(191,195,255,0.65)";
          card.style.boxShadow = "0 0 0 4px rgba(191,195,255,0.10)";
        }

        body.appendChild(card);
      });
    };

    if (active.length) renderList(active);
    if (rest.length) renderList(rest);

    if (!active.length && !rest.length) {
      const empty = document.createElement("div");
      empty.className = "pill";
      empty.textContent = "Событий пока нет. Но чат живет сам по себе.";
      body.appendChild(empty);
    }
  }

  function pickEventSide(eventId, side) {
    const e = S.events.find(x => x.id === eventId);
    if (!e || e.resolved) return;

    e.myPick = side;

    if (side === "none") {
      e.myHelp = 0;
      UI.pushSystem("Ты решил(а) не вписываться. Иногда это тоже ход.");
      renderAll();
      return;
    }

    if ((S.me.points || 0) < 1) {
      UI.pushSystem("Не хватает 💰, чтобы вписаться.");
      e.myPick = null;
      renderAll();
      return;
    }

    S.me.points = Math.max(0, (S.me.points || 0) - 1);
    e.myHelp = 1;

    UI.pushSystem("Ты вписался(ась) в событие. Теперь ждем исход.");
    renderAll();
  }

  // Locations
  const LOCS = [
    { id:"square", name:"Площадь" },
    { id:"bar", name:"Ночной бар" },
    { id:"arcade", name:"Аркада" },
    { id:"roof", name:"Крыша" },
  ];

  function renderLocations() {
    const body = $("locationsBody");
    if (!body) return;

    body.innerHTML = "";

    LOCS.forEach(l => {
      const b = document.createElement("button");
      b.className = "miniBtn";
      b.textContent = l.name;
      b.onclick = () => {
        S.locationId = l.id;
        const locPill = $("locPill");
        if (locPill) locPill.textContent = `Локация: ${l.name}`;
        UI.pushSystem(`Ты переместился(ась): ${l.name}.`);
      };
      body.appendChild(b);
    });
  }

  // Menu: close label
  function toggleMenu() {
    const el = $("menuBlock");
    if (!el) return;
    el.classList.toggle("hidden");
  }

  function ensureLotteryControls() {
    const body = $("menuBody");
    if (!body) return;
    if ($("lotteryBet")) return;

    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.gap = "8px";
    wrap.style.alignItems = "center";
    wrap.style.flexWrap = "wrap";

    const inp = document.createElement("input");
    inp.id = "lotteryBet";
    inp.placeholder = "Ставка 1-10";
    inp.inputMode = "numeric";
    inp.style.width = "120px";
    inp.style.background = "#0f1116";
    inp.style.border = "1px solid rgba(255,255,255,0.10)";
    inp.style.borderRadius = "10px";
    inp.style.color = "var(--text)";
    inp.style.padding = "10px 12px";
    inp.style.outline = "none";
    inp.value = "1";

    wrap.appendChild(inp);

    const btn = $("btnLottery");
    if (btn) {
      body.insertBefore(wrap, btn);
    } else {
      body.appendChild(wrap);
    }
  }

  function lottery() {
    ensureLotteryControls();

    const betRaw = ($("lotteryBet")?.value || "1").trim();
    let bet = parseInt(betRaw, 10);
    if (!Number.isFinite(bet)) bet = 1;
    bet = Math.max(1, Math.min(10, bet));

    if ((S.me.points || 0) < bet) {
      UI.pushSystem("Не хватает 💰 на такую ставку.");
      return;
    }

    S.me.points = Math.max(0, (S.me.points || 0) - bet);

    const maxWin = bet * 10; // 10..100
    let win = 0;

    if (Math.random() < 0.72) {
      win = 0;
    } else {
      win = Math.floor(Math.random() * (maxWin + 1)); // may still be 0
      if (win === 0) win = 1;
    }

    if (win <= 0) UI.pushSystem(Game.Data.SYS.lotteryZero);
    else {
      S.me.points += win;
      UI.pushSystem(Game.Data.SYS.lotteryWin(win));
    }

    renderAll();
  }

  // Tie -> create event + highlight
  UI.signalTieFromBattle = (battleId) => {
    const b = S.battles.find(x => x.id === battleId);
    if (!b) return;

    const opp = S.players[b.opponentId];
    const me = S.players["me"];

    const id = `e_tie_${Date.now()}_${Math.floor(Math.random()*9999)}`;
    const e = {
      id,
      title: `Ничья: ${me.name} [${me.influence || 0}] vs ${opp ? `${opp.name} [${opp.influence || 0}]` : "???"}`,
      a: { id:"me", name: `${me.name}` },
      b: { id:b.opponentId, name: opp ? `${opp.name}` : "???" },
      endsAt: Date.now() + 30000,
      myPick: null,
      myHelp: 0,
      resolved: false,
      resultLine: "",
      closed: false,
    };

    S.events.unshift(e);
    S.flags.highlightEventId = id;

    const body = $("eventsBody");
    const arrow = $("eventsArrow");
    if (body && arrow) {
      body.classList.remove("hidden");
      arrow.textContent = "Свернуть";
    }

    renderAll();
  };

  // Called by Conflict on tie
  UI.onTieBattle = (battleId) => {
    const b = S.battles.find(x => x.id === battleId);
    if (!b) return;

    const me = S.players["me"];
    const opp = S.players[b.opponentId];

    const line = Game.Data.SYS.tieAlertLine(me.name, me.influence || 0, opp ? opp.name : "???", opp ? opp.influence || 0 : 0);
    UI.pushSystem(line, { action:"pinBattle", battleId });
  };

  // Called by Conflict on battle creation
  UI.onIncomingBattleCreated = (battleId) => {
    const b = S.battles.find(x => x.id === battleId);
    if (!b) return;

    const opp = S.players[b.opponentId];
    if (!opp) return;

    // warnings by Cop, not System
    if (opp.role === "bandit") UI.pushCop("Внимание. Похоже, тут бандит. В конфликт лучше не лезть: смывайтесь или отшивайте, если можете.");
    if (opp.role === "gopnik") UI.pushCop("Внимание. Похоже, тут гопник. Лучше смыться или отшить: иначе утащит 💰.");

    const line = Game.Data.SYS.challengedLine(opp.name, opp.influence || 0);
    UI.pushSystem(line, { action:"pinBattle", battleId });
  };

  UI.onOutgoingBattleCreated = (battleId) => {
    // no public message needed here
    return;
  };

  // NPC loops
  let npcChatTimer = null;
  function scheduleNpcChat() {
    if (!S.me.name) return;

    const delay = Math.floor(Math.random() * 10001);
    npcChatTimer = setTimeout(() => {
      if (!S.me.name) return;

      const npc = Game.NPC.randomAny();
      const text = Game.NPC.generateChatLine(npc);
      pushChat({ name: npc.name, text, system:false });

      scheduleNpcChat();
    }, delay);
  }

  let npcBattleTimer = null;
  function scheduleNpcBattle() {
    if (!S.me.name) return;

    npcBattleTimer = setTimeout(() => {
      if (!S.me.name) return;

      const npc = Game.NPC.randomNonCop();
      const bid = Game.Conflict.incoming(npc.id, { pinned:false });

      // provocation in chat
      pushChat({ name: npc.name, text: Game.NPC.generateChatLine(npc), system:false });

      scheduleNpcBattle();
    }, 30000);
  }

  let npcEventTimer = null;
  function scheduleNpcEvent() {
    if (!S.me.name) return;

    npcEventTimer = setTimeout(() => {
      if (!S.me.name) return;

      const a = Game.NPC.randomNonCop();
      let b = Game.NPC.randomNonCop();
      if (b.id === a.id) b = Game.NPC.randomNonCop();

      const id = `e_${Date.now()}_${Math.floor(Math.random()*9999)}`;
      S.events.unshift({
        id,
        title: `Баттл на площади: ${a.name} [${a.influence || 0}] vs ${b.name} [${b.influence || 0}]`,
        a: { id:a.id, name:a.name },
        b: { id:b.id, name:b.name },
        endsAt: Date.now() + (8000 + Math.floor(Math.random()*6000)),
        myPick: null,
        myHelp: 0,
        resolved: false,
        resultLine: "",
        closed: false,
      });

      renderAll();
      scheduleNpcEvent();
    }, 12000);
  }

  let eventTick = null;
  function startEventTicker() {
    if (eventTick) clearInterval(eventTick);

    eventTick = setInterval(() => {
      if (!S.me.name) return;
      const now = Date.now();
      let changed = false;

      S.events.forEach(e => {
        if (e.closed || e.resolved) return;
        if (now < e.endsAt) return;

        const a = S.players[e.a.id];
        const b = S.players[e.b.id];
        const aInf = a ? a.influence : 1;
        const bInf = b ? b.influence : 1;

        let aScore = aInf + (e.myPick === "a" ? 2 : 0) + Math.floor(Math.random() * 4);
        let bScore = bInf + (e.myPick === "b" ? 2 : 0) + Math.floor(Math.random() * 4);

        let winner = "a";
        if (bScore > aScore) winner = "b";
        else if (bScore === aScore) winner = (Math.random() < 0.5) ? "a" : "b";

        const w = winner === "a" ? e.a : e.b;

        e.resolved = true;

        if (e.myHelp === 1) {
          if (e.myPick === winner) {
            S.me.points = (S.me.points || 0) + 2;
            e.resultLine = `${w.name} победил(а). Ты поднял(а) +2 💰.`;
          } else {
            e.resultLine = `${w.name} победил(а). Ты не поднял(а) ничего.`;
          }
        } else {
          e.resultLine = `${w.name} победил(а).`;
        }

        changed = true;
      });

      if (changed) renderAll();
    }, 500);
  }

  // Start screen
  function startGame() {
    const name = ($("nameInput")?.value || "").trim();
    if (!name) return;

    S.me.name = name;
    S.me.points = 10;
    S.me.influence = 0;
    S.me.wins = 0;
    S.me.winsSinceInfluence = 0;
    S.me.oneShots = [];

    buildPlayers();

    S.players["me"].name = name;
    S.players["me"].influence = 0;
    S.players["me"].points = 10;
    S.players["me"].wins = 0;

    S.locationId = "square";

    const locPill = $("locPill");
    if (locPill) locPill.textContent = "Локация: Площадь";

    const meBar = $("meBar");
    if (meBar) meBar.textContent = "Площадь";

    S.chat = [];
    S.dm = { open:false, withId:null, logs:{}, inviteOpen:false, copSilent:true, aggro:{} };
    S.battles = [];
    S.events = [];
    S.flags.highlightEventId = null;

    closeDM();

    const st = $("startScreen");
    if (st) {
      st.style.display = "none";
      st.style.pointerEvents = "none";
    }

    UI.pushSystem(Game.Data.SYS.joined(name));

    // initial lines
    pushChat({ name:"Мемолог", text:"ну че кто первый вбросит", system:false });
    pushChat({ name:"Троль", text:"ща всех вынесу", system:false });

    const cop = Object.values(S.players).find(p => p && p.role === "cop");
    if (cop) pushChat({ name: cop.name, text: Game.NPC.generateChatLine(cop), system:false });

    scheduleNpcEvent();
    scheduleNpcChat();
    scheduleNpcBattle();
    startEventTicker();

    renderAll();
  }

  function sendChat() {
    if (!S.me.name) return;

    const inp = $("chatInput");
    const txt = (inp ? (inp.value || "").trim() : "");
    if (!txt) return;

    if (inp) inp.value = "";
    pushChat({ name:S.me.name, text: txt, system:false });

    if (Math.random() < 0.35) {
      const npc = Game.NPC.randomAny();
      pushChat({ name:npc.name, text: Game.NPC.generateChatLine(npc), system:false });
    }
  }

  function toggleAccordion(bodyId, arrowId) {
    const body = $(bodyId);
    const arrow = $(arrowId);
    if (!body || !arrow) return;

    const isHidden = body.classList.contains("hidden");
    if (isHidden) {
      body.classList.remove("hidden");
      arrow.textContent = "Свернуть";
    } else {
      body.classList.add("hidden");
      arrow.textContent = "Развернуть";
    }
  }

  function bindUI() {
    const btnStart = $("btnStart");
    const btnRandom = $("btnRandom");
    const btnSend = $("btnSend");
    const chatInput = $("chatInput");
    const btnMenu = $("btnMenu");
    const dmClose = $("dmClose");
    const dmSend = $("dmSend");
    const dmInput = $("dmInput");
    const reportBtn = $("reportBtn");
    const reportInput = $("reportInput");
    const btnLottery = $("btnLottery");

    // menu "Закрыть"
    const menuRight = $("menuBlock")?.querySelector(".blockHeader .righty");
    if (menuRight) menuRight.textContent = "Закрыть";

    const menuHeader = $("menuBlock")?.querySelector(".blockHeader");
    if (menuHeader) menuHeader.onclick = toggleMenu;

    if (btnMenu) btnMenu.onclick = toggleMenu;

    if (btnRandom) btnRandom.onclick = () => {
      const ni = $("nameInput");
      if (ni) ni.value = Game.Data.pick(Game.Data.RANDOM_NAMES);
    };

    if (btnStart) btnStart.onclick = startGame;

    if (btnSend) btnSend.onclick = sendChat;
    if (chatInput) chatInput.addEventListener("keydown", (e) => { if (e.key === "Enter") sendChat(); });

    if (btnLottery) btnLottery.onclick = lottery;

    const battlesHeader = $("battlesHeader");
    const eventsHeader = $("eventsHeader");
    if (battlesHeader) battlesHeader.onclick = () => toggleAccordion("battlesBody", "battlesArrow");
    if (eventsHeader) eventsHeader.onclick = () => toggleAccordion("eventsBody", "eventsArrow");

    // DM header collapse toggle
    const dmHeader = $("dmBlock")?.querySelector(".blockHeader");
    if (dmHeader) dmHeader.onclick = toggleDMBody;

    if (dmClose) dmClose.onclick = closeDM;

    if (dmSend) dmSend.onclick = () => {
      const withId = S.dm.withId;
      const t = (dmInput ? (dmInput.value || "").trim() : "");
      if (!withId || !t) return;

      if (dmInput) dmInput.value = "";

      const target = S.players[withId];
      dmPushLine(withId, S.me.name, t);

      // Cop: silent until user speaks
      if (target && target.role === "cop") {
        dmPushLine(withId, "Коп", "Совет: распознавайте гопника и бандита по стилю сообщений. Они провоцируют и давят.");
        dmPushLine(withId, "Коп", "Лучше не вступать в конфликт. Гопник утащит 💰, бандит обнулит. Безопаснее смыться или отшить, если можете.");
      }

      // Bandit/Gopnik: after first user msg, they rage and challenge
      if (target && (target.role === "bandit" || target.role === "gopnik")) {
        const key = withId;
        if (!S.dm.aggro[key]) {
          S.dm.aggro[key] = true;
          dmPushLine(withId, target.name, target.role === "bandit" ? "ты че, самый смелый? ща разберемся" : "слыш, не умничай, выходи на баттл");
          const bid = Game.Conflict.incoming(withId, { pinned:true });
          if (bid) {
            UI.pinBattleToTop(bid);
            UI.openBattlesAndScroll();
          }
        } else {
          // extra provocation
          if (Math.random() < 0.65) {
            dmPushLine(withId, target.name, Game.NPC.generateChatLine(target));
          }
        }
      } else {
        // normal npc reply sometimes (not cop)
        if (target && target.role !== "cop" && Math.random() < 0.55) {
          dmPushLine(withId, target.name, Game.NPC.generateChatLine(target));
        }
      }

      // duplicate to public as system small note
      UI.pushSystem(`${S.me.name} написал(а) в личку ${target ? target.name : "кому-то"}.`);

      renderDM();
      renderAll();
    };

    if (dmInput) dmInput.addEventListener("keydown", (e) => { if (e.key === "Enter") { const b = $("dmSend"); if (b) b.click(); } });

    if (reportBtn) reportBtn.onclick = () => {
      const withId = S.dm.withId;
      const target = S.players[withId];
      if (!target || target.role !== "cop") return;

      const nick = (reportInput ? (reportInput.value || "").trim() : "");
      if (!nick) return;

      if (reportInput) reportInput.value = "";

      const suspectId = Object.keys(S.players).find(pid => (S.players[pid]?.name || "").toLowerCase() === nick.toLowerCase());
      const suspect = suspectId ? S.players[suspectId] : null;

      if (suspect && (suspect.role === "bandit" || suspect.role === "gopnik")) {
        S.me.points = (S.me.points || 0) + 2;
        UI.pushSystem(Game.Data.SYS.reportOk(suspect.name));
        dmPushLine(withId, "Коп", `Принято. ${suspect.name} отмечен(а).`);
      } else {
        S.me.points = Math.max(0, (S.me.points || 0) - 1);
        UI.pushSystem(Game.Data.SYS.reportNo);
        dmPushLine(withId, "Коп", "Ложный вызов. Штраф оформлен.");
      }

      renderAll();
      renderDM();
    };

    if (reportInput) reportInput.addEventListener("keydown", (e) => { if (e.key === "Enter") { const b = $("reportBtn"); if (b) b.click(); } });
  }

  function renderAll() {
    S.players["me"].name = S.me.name;
    S.players["me"].influence = S.me.influence;
    S.players["me"].points = S.me.points;
    S.players["me"].wins = S.me.wins;

    const mi = $("meInfluence");
    const mp = $("mePoints");
    const mw = $("meWins");

    if (mi) mi.textContent = String(S.me.influence || 0);
    if (mp) mp.textContent = String(S.me.points || 0);
    if (mw) mw.textContent = String(S.me.wins || 0);

    ensureLotteryControls();

    UI.renderChatSmart();
    renderBattles();
    renderEvents();
    renderLocations();

    if (S.dm.open) renderDM();
  }

  UI.renderAll = renderAll;

  // Boot
  function boot() {
    buildPlayers();
    bindUI();
    renderLocations();
    UI.renderChatSmart();
    renderBattles();
    renderEvents();
  }

  boot();
  window.__S = S;
})();
