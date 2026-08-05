// Stage 7.1 deterministic first causal experience.
window.Game = window.Game || {};

(() => {
  const G = window.Game;
  const STORAGE_KEY = "AsyncScene_first_experience_v1";
  const SCENARIO_ID = "first_experience_personal_conflict_v1";
  const WORLD_ADVANCE_DELAY_MS = 45_000;
  const PRELUDE_MIN_GAP_MS = 800;
  const STATES = ["accusation", "answer", "reaction", "vote", "consequence", "rematch", "completed", "main_unlocked"];
  const RESPONSE_IDS = ["deny", "accuse_ken", "pay"];
  const PRELUDE = [
    { id: "room_entered", at: 1000, name: "System", text: "Ты вошёл в комнату.", system: true },
    { id: "mika_missing_money", at: 3500, name: "Мика", text: "Из общей кассы пропали деньги." },
    { id: "oleg_context", at: 6500, name: "Олег", text: "Пропажу заметили ещё до появления новичка?" },
    { id: "ken_hint", at: 9500, name: "Кен", text: "Новичок пришёл - и деньги исчезли. Странное совпадение." },
    { id: "mika_brake", at: 12500, name: "Мика", text: "Без доказательств никого не обвиняем." },
    { id: "ken_accusation", at: 15000, name: "Кен", text: "Это сделал ты. Деньги пропали после твоего появления." },
  ];
  const BRANCHES = {
    deny: {
      id: "deny",
      label: "Отрицать",
      player: "Я ничего не крал.",
      reaction: "Кен не показал доказательств. Остальные должны решить, кому верить.",
      result: "Большинство встало на твою сторону.",
      consequence: "Репутация выросла. Кен потерял поддержку.",
      vote: [1, 0, 1, 1, 0],
      change: "Кен убедил одного человека поддержать его.",
      cause: "После твоего отрицания он начал искать подтверждение своей версии.",
      hook: "Мика просит доказательство. Сначала ответить ей или поговорить с Олегом?",
    },
    accuse_ken: {
      id: "accuse_ken",
      label: "Обвинить Кена",
      player: "Это Кен пытается свалить кражу на меня.",
      reaction: "Теперь вы обвиняете друг друга. Остальные должны решить, кому верить.",
      result: "Большинство встало на твою сторону.",
      consequence: "Репутация выросла. Конфликт обострился.",
      vote: [0, 1, 1, 0, 1],
      change: "Кен объявил, что добьётся публичного реванша.",
      cause: "Твоё встречное обвинение превратило спор в личную борьбу.",
      hook: "Подготовить доказательства или попытаться лишить Кена поддержки?",
    },
    pay: {
      id: "pay",
      label: "Заплатить",
      player: "Я возмещу пропажу, но кражу не признаю.",
      reaction: "Оплата вернёт деньги, но не докажет вину. Остальные должны решить, кому верить.",
      result: "Большинство решило, что обвинение не доказано.",
      consequence: "Деньги уменьшились. Репутация не пострадала.",
      vote: [1, 0, 0, 1, 1],
      change: "Олег рассказал другим, что на тебя можно давить.",
      cause: "Ты заплатил, чтобы закрыть ущерб, и он запомнил этот способ.",
      hook: "Объясниться с Микой или потребовать от Олега молчания?",
    },
  };

  let context = null;
  let snapshot = null;
  let scheduler = null;
  let lastTickAt = 0;
  let nextPreludeEligibleAt = 0;
  let voteTimer = null;
  let interactionLock = false;
  let normalWorldReleased = false;
  let visibilityBound = false;

  function clone(value) {
    try { return JSON.parse(JSON.stringify(value)); } catch (_) { return null; }
  }

  function defaultSnapshot() {
    return {
      schemaVersion: 1,
      scenarioId: SCENARIO_ID,
      stateId: "accusation",
      preludeComplete: false,
      branchId: null,
      shownMessageIds: [],
      foregroundElapsedMs: 0,
      selectedAt: null,
      settlementId: null,
      settled: false,
      voteStep: 0,
      voteStarted: false,
      cycleCompletedAt: null,
      freedomCardShown: false,
      freedomCardDismissed: false,
      awaitingWorldAdvance: false,
      worldAdvanceDueAt: null,
      worldAdvanceId: null,
      worldAdvanceSettled: false,
      worldAdvancePresented: false,
      worldAdvancePresentationMode: null,
      lastHiddenAt: null,
      npcMemory: {},
      telemetry: [],
      telemetrySeq: 0,
    };
  }

  function sanitize(raw) {
    const base = defaultSnapshot();
    if (!raw || typeof raw !== "object") return base;
    const stateId = STATES.includes(raw.stateId) ? raw.stateId : "accusation";
    const branchId = RESPONSE_IDS.includes(raw.branchId) ? raw.branchId : null;
    const shown = Array.from(new Set(Array.isArray(raw.shownMessageIds) ? raw.shownMessageIds.map(String) : []));
    const voteStep = Math.max(0, Math.min(5, Number(raw.voteStep) | 0));
    return Object.assign(base, raw, {
      schemaVersion: 1,
      scenarioId: SCENARIO_ID,
      stateId,
      branchId,
      shownMessageIds: shown,
      foregroundElapsedMs: Math.max(0, Number(raw.foregroundElapsedMs) || 0),
      voteStep,
      preludeComplete: raw.preludeComplete === true || shown.includes("ken_accusation"),
      voteStarted: raw.voteStarted === true,
      settled: raw.settled === true && typeof raw.settlementId === "string" && raw.settlementId.length > 0,
      awaitingWorldAdvance: raw.awaitingWorldAdvance === true,
      worldAdvanceSettled: raw.worldAdvanceSettled === true && typeof raw.worldAdvanceId === "string" && raw.worldAdvanceId.length > 0,
      worldAdvancePresented: raw.worldAdvancePresented === true,
      freedomCardShown: raw.freedomCardShown === true,
      freedomCardDismissed: raw.freedomCardDismissed === true,
      npcMemory: raw.npcMemory && typeof raw.npcMemory === "object" ? raw.npcMemory : {},
      telemetry: Array.isArray(raw.telemetry) ? raw.telemetry.slice(-80) : [],
    });
  }

  function loadSnapshot() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return sanitize(JSON.parse(raw));
    } catch (_) {
      return null;
    }
  }

  function saveSnapshot() {
    if (!snapshot) return false;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      return true;
    } catch (_) {
      return false;
    }
  }

  function telemetry(name, meta) {
    if (!snapshot) return;
    snapshot.telemetrySeq = (snapshot.telemetrySeq | 0) + 1;
    snapshot.telemetry = Array.isArray(snapshot.telemetry) ? snapshot.telemetry : [];
    snapshot.telemetry.push({ seq: snapshot.telemetrySeq, name, at: Date.now(), meta: meta || null });
    if (snapshot.telemetry.length > 80) snapshot.telemetry.splice(0, snapshot.telemetry.length - 80);
    saveSnapshot();
  }

  function getState() {
    return context && context.state ? context.state : (G.__S || (G.UI && G.UI.S) || G.State || null);
  }

  function ensureScenarioPlayers() {
    const S = getState();
    if (!S) return;
    S.players = S.players || {};
    const startNpcPoints = G.Data && Number.isFinite(G.Data.START_POINTS_NPC)
      ? (G.Data.START_POINTS_NPC | 0)
      : (G.Data && Number.isFinite(G.Data.POINTS_START_NPC) ? (G.Data.POINTS_START_NPC | 0) : 10);
    if (!S.players.npc_stage7_ken) S.players.npc_stage7_ken = { id: "npc_stage7_ken", name: "Кен", role: "crowd", npc: true, points: startNpcPoints, meta: {} };
    if (!S.players.npc_stage7_mika) S.players.npc_stage7_mika = { id: "npc_stage7_mika", name: "Мика", role: "crowd", npc: true, points: startNpcPoints, meta: {} };
    if (!S.players.npc_bandit) S.players.npc_bandit = { id: "npc_bandit", name: "Олег", role: "bandit", npc: true, points: startNpcPoints, meta: {} };
    ["npc_stage7_ken", "npc_stage7_mika", "npc_bandit"].forEach((id) => {
      const player = S.players[id];
      if (!player) return;
      player.meta = player.meta && typeof player.meta === "object" ? player.meta : {};
      player.meta.stage7FirstExperience = Object.assign(
        {},
        player.meta.stage7FirstExperience || {},
        snapshot && snapshot.npcMemory && snapshot.npcMemory[id] || {}
      );
    });
  }

  function pushLine(entry) {
    if (!entry || !context || !context.UI) return;
    const UI = context.UI;
    if (entry.system && typeof UI.pushSystem === "function") UI.pushSystem(entry.text);
    else if (typeof UI.pushChat === "function") UI.pushChat({ name: entry.name, text: entry.text, system: false });
    if (typeof UI.requestRenderAll === "function") UI.requestRenderAll();
    else if (typeof UI.renderAll === "function") UI.renderAll();
  }

  function emitPrelude(entry) {
    if (!snapshot || snapshot.shownMessageIds.includes(entry.id)) return false;
    snapshot.shownMessageIds.push(entry.id);
    if (entry.id === "ken_accusation") {
      snapshot.preludeComplete = true;
      snapshot.stateId = "accusation";
    }
    saveSnapshot();
    pushLine(entry);
    telemetry("first_experience.prelude_message_shown", { messageId: entry.id });
    if (entry.id === "room_entered") telemetry("first_experience.room_entered");
    if (entry.id === "ken_accusation") telemetry("first_experience.accusation_triggered");
    render();
    return true;
  }

  function ensurePanel() {
    let panel = document.getElementById("stage7FirstExperiencePanel");
    if (panel) return panel;
    const blocks = document.getElementById("blocks");
    if (!blocks) return null;
    panel = document.createElement("section");
    panel.id = "stage7FirstExperiencePanel";
    panel.className = "block panel stage7FirstExperiencePanel";
    panel.setAttribute("aria-live", "polite");
    panel.addEventListener("click", onPanelClick);
    blocks.insertBefore(panel, blocks.firstChild || null);
    return panel;
  }

  function setControlledMode(active) {
    const root = document.documentElement;
    if (root) root.classList.toggle("stage7-first-experience-active", !!active);
  }

  function actionButton(label, action, extra) {
    return `<button class="btn primary stage7FirstExperienceAction" type="button" data-stage7-action="${action}" ${extra || ""}>${label}</button>`;
  }

  function renderVotes(branch) {
    return `<div class="stage7VoteRow" aria-label="Пять голосов">${branch.vote.map((side, index) => {
      const resolved = index < snapshot.voteStep;
      const cls = !resolved ? "pending" : (side ? "player" : "ken");
      const text = !resolved ? "•" : (side ? "За тебя" : "За Кена");
      return `<span class="stage7VoteMarker ${cls}" data-vote-index="${index}">${text}</span>`;
    }).join("")}</div>`;
  }

  function renderFreedomCard(panel) {
    if (!snapshot.freedomCardShown) telemetry("first_experience.freedom_card_shown");
    snapshot.freedomCardShown = true;
    saveSnapshot();
    panel.innerHTML = `
      <div class="stage7FreedomCard" role="dialog" aria-modal="true" aria-labelledby="stage7FreedomTitle">
        <h2 id="stage7FreedomTitle">Мир живёт дальше</h2>
        <p>Первый конфликт завершён. Можешь продолжить исследовать игру или заняться своими делами. Мир будет жить дальше и меняться из-за твоего выбора, даже когда тебя нет в игре. Когда вернёшься, увидишь, к чему всё привело.</p>
        ${actionButton("Продолжить исследовать", "dismiss-freedom")}
        <div class="stage7Support">Можно закрыть игру в любой момент. Всё сохранено.</div>
      </div>`;
  }

  function renderWorldAdvance(panel) {
    const branch = BRANCHES[snapshot.branchId];
    if (!branch) return;
    const header = snapshot.worldAdvancePresentationMode === "return" ? "Пока тебя не было..." : "События продолжились";
    panel.innerHTML = `
      <div class="stage7WorldAdvance">
        <h2>${header}</h2>
        <p><strong>${branch.change}</strong></p>
        <p>${branch.cause}</p>
        <p class="stage7DecisionHook">${branch.hook}</p>
        ${actionButton("Продолжить", "ack-world-advance")}
      </div>`;
  }

  function render() {
    if (!snapshot) return;
    const panel = ensurePanel();
    if (!panel) return;
    const branch = snapshot.branchId ? BRANCHES[snapshot.branchId] : null;

    if (snapshot.worldAdvancePresented && !snapshot.worldAdvanceSettled) {
      panel.hidden = false;
      setControlledMode(true);
      renderWorldAdvance(panel);
      return;
    }

    if (!snapshot.preludeComplete) {
      panel.hidden = true;
      panel.innerHTML = "";
      setControlledMode(true);
      return;
    }

    panel.hidden = false;
    const controlled = snapshot.stateId !== "main_unlocked" || !snapshot.freedomCardDismissed;
    setControlledMode(controlled);

    if (snapshot.stateId === "main_unlocked") {
      if (!snapshot.freedomCardDismissed) {
        renderFreedomCard(panel);
      } else {
        setControlledMode(false);
        panel.innerHTML = `<div class="stage7Waiting"><h2>Мир живёт дальше</h2><p>Последствия твоего решения уже развиваются.</p><div class="stage7Support">Всё сохранено. Продолжение появится само.</div></div>`;
      }
      return;
    }
    if (snapshot.stateId === "accusation") {
      panel.innerHTML = `<h2>Кен обвиняет тебя в краже.</h2><p>Все это видят.</p>${actionButton("Ответить", "open-answer")}`;
      return;
    }
    if (snapshot.stateId === "answer") {
      panel.innerHTML = `<h2>Что ответить?</h2><div class="stage7ChoiceGrid">
        ${actionButton("Отрицать", "choose", 'data-branch="deny"')}
        ${actionButton("Обвинить Кена", "choose", 'data-branch="accuse_ken"')}
        ${actionButton("Заплатить", "choose", 'data-branch="pay"')}
      </div>`;
      return;
    }
    if (!branch) {
      panel.innerHTML = `<h2>Первый конфликт</h2><p>Восстанавливаем сохранённое состояние.</p>`;
      return;
    }
    if (snapshot.stateId === "reaction") {
      panel.innerHTML = `<h2>Твой ответ</h2><p>${branch.player}</p>${actionButton("Посмотреть реакцию", "show-reaction")}`;
      return;
    }
    if (snapshot.stateId === "vote") {
      const complete = snapshot.voteStep >= 5;
      panel.innerHTML = `<h2>Реакция Мики</h2><p>${branch.reaction}</p>
        ${renderVotes(branch)}
        ${complete
          ? `<p class="stage7Result">${branch.result}</p>${actionButton("Принять последствие", "accept-consequence")}`
          : (snapshot.voteStarted
            ? `<div class="stage7Support">Голоса появляются по очереди.</div>`
            : actionButton("Увидеть голосование", "start-vote"))}`;
      return;
    }
    if (snapshot.stateId === "consequence") {
      panel.innerHTML = `<h2>${branch.result}</h2><p>${branch.consequence}</p><p class="stage7KenLine">Кен: Это ещё не конец. Я требую реванша.</p>${actionButton("Ответить на реванш", "accept-rematch")}`;
      return;
    }
    if (snapshot.stateId === "rematch") {
      panel.innerHTML = `<h2>Первый раунд завершён.</h2><p>Конфликт продолжается.</p>${actionButton("Исследовать мир", "explore-world")}`;
    }
  }

  function getMoneyLogRows() {
    const stores = [G.__D && G.__D.moneyLog, G.State && G.State.moneyLog, G.__S && G.__S.moneyLog];
    return stores.find(Array.isArray) || [];
  }

  function ledgerHasMoneySettlement(id) {
    return getMoneyLogRows().some((row) => row && row.meta && (
      row.meta.settlementId === id || row.meta.idempotencyKey === id
    ));
  }

  function applySettlement() {
    if (!snapshot || !snapshot.branchId) return false;
    const branchId = snapshot.branchId;
    const settlementId = snapshot.settlementId || `first_experience_settlement_v1:${branchId}`;
    snapshot.settlementId = settlementId;
    saveSnapshot();
    if (snapshot.settled || (branchId === "pay" && ledgerHasMoneySettlement(settlementId))) {
      snapshot.settled = true;
      saveSnapshot();
      return true;
    }
    const meta = {
      scenarioId: SCENARIO_ID,
      branchId,
      settlementId,
      actionId: settlementId,
      idempotencyKey: settlementId,
    };
    let result = null;
    if (branchId === "pay") {
      const S = getState();
      const currentPoints = S && S.me && Number.isFinite(S.me.points) ? (S.me.points | 0) : 0;
      if (currentPoints < 3) return false;
      const economy = G.ConflictEconomy || G._ConflictEconomy;
      if (!economy || typeof economy.transferPoints !== "function") return false;
      result = economy.transferPoints("me", "sink", 3, "first_experience_compensation", meta);
    } else {
      if (!G.__A || typeof G.__A.transferRep !== "function") return false;
      result = G.__A.transferRep("crowd_pool", "me", 2, "first_experience_reputation_result", settlementId, meta);
    }
    if (result && result.ok === false && result.reason !== "duplicate") return false;
    snapshot.settled = true;
    if (branchId === "accuse_ken") {
      snapshot.npcMemory.npc_stage7_ken = Object.assign({}, snapshot.npcMemory.npc_stage7_ken || {}, { ken_escalation: 1 });
    }
    saveSnapshot();
    telemetry("first_experience.settlement_applied", { branchId, settlementId });
    if (context && context.UI && typeof context.UI.requestRenderAll === "function") context.UI.requestRenderAll();
    return true;
  }

  function scheduleVoteStep() {
    if (voteTimer || !snapshot || snapshot.stateId !== "vote" || !snapshot.voteStarted || snapshot.voteStep >= 5) return;
    voteTimer = setTimeout(() => {
      voteTimer = null;
      if (!snapshot || snapshot.stateId !== "vote") return;
      if (document.hidden) {
        scheduleVoteStep();
        return;
      }
      snapshot.voteStep = Math.min(5, (snapshot.voteStep | 0) + 1);
      saveSnapshot();
      render();
      if (snapshot.voteStep >= 5) telemetry("first_experience.vote_completed", { branchId: snapshot.branchId });
      else scheduleVoteStep();
    }, 500);
  }

  function completeCycle() {
    if (!snapshot || !snapshot.branchId) return;
    snapshot.stateId = "completed";
    snapshot.cycleCompletedAt = Date.now();
    snapshot.awaitingWorldAdvance = true;
    snapshot.worldAdvanceDueAt = snapshot.cycleCompletedAt + WORLD_ADVANCE_DELAY_MS;
    snapshot.worldAdvanceId = `first_experience_world_advance_v1:${snapshot.branchId}`;
    snapshot.worldAdvanceSettled = false;
    snapshot.worldAdvancePresented = false;
    saveSnapshot();
    telemetry("first_experience.completed", { branchId: snapshot.branchId });
    snapshot.stateId = "main_unlocked";
    saveSnapshot();
    telemetry("first_experience.main_unlocked", { branchId: snapshot.branchId });
    render();
  }

  function presentWorldAdvance(mode) {
    if (!snapshot || snapshot.worldAdvanceSettled || snapshot.worldAdvancePresented || !snapshot.awaitingWorldAdvance) return false;
    snapshot.worldAdvancePresented = true;
    snapshot.worldAdvancePresentationMode = mode === "return" ? "return" : "foreground";
    saveSnapshot();
    telemetry("first_experience.world_advance_presented", {
      mode: snapshot.worldAdvancePresentationMode,
      worldAdvanceId: snapshot.worldAdvanceId,
    });
    render();
    return true;
  }

  function hydrateBranchMemory() {
    if (!snapshot) return;
    if (snapshot.branchId === "deny") {
      snapshot.npcMemory.npc_stage7_ken = Object.assign({}, snapshot.npcMemory.npc_stage7_ken || {}, { rebuildingSupport: 1 });
      snapshot.npcMemory.npc_stage7_mika = Object.assign({}, snapshot.npcMemory.npc_stage7_mika || {}, { asksForEvidence: 1 });
    } else if (snapshot.branchId === "accuse_ken") {
      snapshot.npcMemory.npc_stage7_ken = Object.assign({}, snapshot.npcMemory.npc_stage7_ken || {}, { ken_escalation: 1, publicRematch: 1 });
    } else if (snapshot.branchId === "pay") {
      snapshot.npcMemory.npc_bandit = Object.assign({}, snapshot.npcMemory.npc_bandit || {}, { pressureWorked: 1 });
      snapshot.npcMemory.npc_stage7_mika = Object.assign({}, snapshot.npcMemory.npc_stage7_mika || {}, { uncertainMotive: 1 });
    }
    ensureScenarioPlayers();
  }

  function releaseNormalWorldOnce() {
    if (normalWorldReleased) return;
    normalWorldReleased = true;
    setControlledMode(false);
    const panel = document.getElementById("stage7FirstExperiencePanel");
    if (panel) panel.remove();
    if (context && typeof context.startNormalWorld === "function") context.startNormalWorld();
  }

  function acknowledgeWorldAdvance() {
    if (!snapshot || snapshot.worldAdvanceSettled) return;
    hydrateBranchMemory();
    snapshot.awaitingWorldAdvance = false;
    snapshot.worldAdvanceSettled = true;
    snapshot.worldAdvancePresented = false;
    saveSnapshot();
    telemetry("first_experience.world_advance_settled", { worldAdvanceId: snapshot.worldAdvanceId });
    releaseNormalWorldOnce();
  }

  function runAction(action, button) {
    if (!snapshot) return;
    if (action === "open-answer" && snapshot.stateId === "accusation") {
      snapshot.stateId = "answer";
      saveSnapshot();
      telemetry("first_experience.answer_opened");
      render();
    } else if (action === "choose" && snapshot.stateId === "answer") {
      const branchId = button && button.getAttribute("data-branch");
      if (!RESPONSE_IDS.includes(branchId)) return;
      snapshot.branchId = branchId;
      snapshot.selectedAt = Date.now();
      snapshot.stateId = "reaction";
      saveSnapshot();
      pushLine({ name: context && context.playerName || "Игрок", text: BRANCHES[branchId].player });
      telemetry("first_experience.answer_selected", { branchId });
      render();
    } else if (action === "show-reaction" && snapshot.stateId === "reaction") {
      pushLine({ name: "Мика", text: BRANCHES[snapshot.branchId].reaction });
      snapshot.stateId = "vote";
      saveSnapshot();
      telemetry("first_experience.reaction_shown", { branchId: snapshot.branchId });
      render();
    } else if (action === "start-vote" && snapshot.stateId === "vote" && snapshot.voteStep < 5) {
      snapshot.voteStarted = true;
      saveSnapshot();
      telemetry("first_experience.vote_started", { branchId: snapshot.branchId });
      render();
      scheduleVoteStep();
    } else if (action === "accept-consequence" && snapshot.stateId === "vote" && snapshot.voteStep >= 5) {
      if (!applySettlement()) return;
      snapshot.stateId = "consequence";
      saveSnapshot();
      telemetry("first_experience.consequence_shown", { branchId: snapshot.branchId });
      render();
    } else if (action === "accept-rematch" && snapshot.stateId === "consequence") {
      snapshot.stateId = "rematch";
      saveSnapshot();
      telemetry("first_experience.rematch_shown", { branchId: snapshot.branchId });
      render();
    } else if (action === "explore-world" && snapshot.stateId === "rematch") {
      completeCycle();
    } else if (action === "dismiss-freedom" && snapshot.stateId === "main_unlocked") {
      snapshot.freedomCardDismissed = true;
      saveSnapshot();
      telemetry("first_experience.freedom_card_dismissed");
      if (snapshot.awaitingWorldAdvance && Date.now() >= Number(snapshot.worldAdvanceDueAt || 0)) {
        presentWorldAdvance("foreground");
      } else {
        render();
      }
    } else if (action === "ack-world-advance" && snapshot.worldAdvancePresented) {
      acknowledgeWorldAdvance();
    }
  }

  function onPanelClick(event) {
    const button = event.target && event.target.closest ? event.target.closest("button[data-stage7-action]") : null;
    if (!button || interactionLock) return;
    event.preventDefault();
    interactionLock = true;
    button.disabled = true;
    try { runAction(button.getAttribute("data-stage7-action"), button); }
    finally { interactionLock = false; }
  }

  function schedulerTick() {
    if (!snapshot || !context) return;
    const nowMono = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
    if (!lastTickAt) lastTickAt = nowMono;
    if (!document.hidden && !snapshot.preludeComplete) {
      const delta = Math.max(0, Math.min(1000, nowMono - lastTickAt));
      snapshot.foregroundElapsedMs += delta;
      const due = PRELUDE.find((entry) => !snapshot.shownMessageIds.includes(entry.id) && snapshot.foregroundElapsedMs >= entry.at);
      if (due && Date.now() >= nextPreludeEligibleAt) {
        emitPrelude(due);
        nextPreludeEligibleAt = Date.now() + PRELUDE_MIN_GAP_MS;
      }
      saveSnapshot();
    }
    lastTickAt = nowMono;
    const worldDue = snapshot.stateId === "main_unlocked"
      && snapshot.awaitingWorldAdvance
      && !snapshot.worldAdvanceSettled
      && !snapshot.worldAdvancePresented
      && Date.now() >= Number(snapshot.worldAdvanceDueAt || 0);
    if (!document.hidden && worldDue && snapshot.freedomCardDismissed) presentWorldAdvance("foreground");
  }

  function startScheduler() {
    if (scheduler) return;
    lastTickAt = 0;
    scheduler = setInterval(schedulerTick, 250);
    if (!visibilityBound) {
      document.addEventListener("visibilitychange", () => {
        lastTickAt = 0;
        if (!snapshot) return;
        if (document.hidden) {
          snapshot.lastHiddenAt = Date.now();
          saveSnapshot();
          return;
        }
        const due = snapshot.stateId === "main_unlocked"
          && snapshot.awaitingWorldAdvance
          && !snapshot.worldAdvanceSettled
          && Date.now() >= Number(snapshot.worldAdvanceDueAt || 0);
        if (due) {
          presentWorldAdvance("return");
        } else {
          snapshot.lastHiddenAt = null;
          saveSnapshot();
        }
      });
      visibilityBound = true;
    }
  }

  function attach(nextContext) {
    context = nextContext || {};
    normalWorldReleased = false;
    ensureScenarioPlayers();
    startScheduler();
    if (snapshot && snapshot.stateId === "vote" && snapshot.voteStarted && snapshot.voteStep < 5) scheduleVoteStep();
    render();
  }

  function claimFreshStart(nextContext) {
    const existing = loadSnapshot();
    if (existing && existing.worldAdvanceSettled) {
      return { claimed: false, mode: "complete", stateId: existing.stateId, releaseNormalWorld: () => {} };
    }
    snapshot = existing || defaultSnapshot();
    attach(nextContext);
    telemetry("first_experience.entry_opened", { mode: existing ? "fresh_resume" : "fresh" });
    telemetry("first_experience.year_submitted");
    if (!snapshot.preludeComplete) telemetry("first_experience.prelude_started");
    return { claimed: true, mode: existing ? "fresh_resume" : "fresh", stateId: snapshot.stateId, releaseNormalWorld: releaseNormalWorldOnce };
  }

  function claimResume(nextContext) {
    const existing = loadSnapshot();
    if (!existing || existing.worldAdvanceSettled) {
      return { claimed: false, mode: existing ? "complete" : "not_applicable", stateId: existing && existing.stateId || null, releaseNormalWorld: () => {} };
    }
    snapshot = existing;
    if (snapshot.stateId === "completed") snapshot.stateId = "main_unlocked";
    const dueOnReturn = snapshot.stateId === "main_unlocked"
      && snapshot.awaitingWorldAdvance
      && Date.now() >= Number(snapshot.worldAdvanceDueAt || 0);
    if (dueOnReturn) {
      snapshot.worldAdvancePresented = true;
      snapshot.worldAdvancePresentationMode = "return";
    } else if (snapshot.stateId === "main_unlocked" && snapshot.freedomCardShown && !snapshot.freedomCardDismissed) {
      snapshot.freedomCardDismissed = true;
    }
    saveSnapshot();
    attach(nextContext);
    telemetry("first_experience.entry_opened", { mode: "resume" });
    if (dueOnReturn) telemetry("first_experience.world_advance_presented", { mode: "return", worldAdvanceId: snapshot.worldAdvanceId });
    return { claimed: true, mode: "resume", stateId: snapshot.stateId, releaseNormalWorld: releaseNormalWorldOnce };
  }

  function isPending() {
    const current = snapshot || loadSnapshot();
    return !!(current && !current.worldAdvanceSettled);
  }

  function getSnapshot() {
    return clone(snapshot || loadSnapshot());
  }

  function resetForDev() {
    destroy();
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    snapshot = null;
    const panel = document.getElementById("stage7FirstExperiencePanel");
    if (panel) panel.remove();
    setControlledMode(false);
    return true;
  }

  function advanceForegroundForDev(ms) {
    if (!snapshot) snapshot = loadSnapshot();
    if (!snapshot) return null;
    snapshot.foregroundElapsedMs += Math.max(0, Number(ms) || 0);
    PRELUDE.forEach((entry) => {
      if (!snapshot.shownMessageIds.includes(entry.id) && snapshot.foregroundElapsedMs >= entry.at) emitPrelude(entry);
    });
    saveSnapshot();
    render();
    return getSnapshot();
  }

  function settleWorldAdvanceForDev() {
    if (!snapshot) snapshot = loadSnapshot();
    if (!snapshot) return false;
    snapshot.worldAdvanceDueAt = Date.now() - 1;
    snapshot.freedomCardDismissed = true;
    saveSnapshot();
    return presentWorldAdvance("foreground");
  }

  function destroy() {
    if (scheduler) clearInterval(scheduler);
    if (voteTimer) clearTimeout(voteTimer);
    scheduler = null;
    voteTimer = null;
    context = null;
    lastTickAt = 0;
    nextPreludeEligibleAt = 0;
  }

  G.Stage7FirstExperience = {
    claimFreshStart,
    claimResume,
    isPending,
    getSnapshot,
    resetForDev,
    advanceForegroundForDev,
    destroy,
  };

  if (!G.__DEV || typeof G.__DEV !== "object") G.__DEV = {};
  G.__DEV.getStage7FirstExperienceSnapshot = getSnapshot;
  G.__DEV.resetStage7FirstExperience = resetForDev;
  G.__DEV.advanceStage7FirstExperienceForeground = advanceForegroundForDev;
  G.__DEV.settleStage7FirstExperienceWorldAdvance = settleWorldAdvanceForDev;
  G.__DEV.smokeStage7FirstCausalVerticalSlice = () => ({
    ok: !!G.Stage7FirstExperience,
    storageKey: STORAGE_KEY,
    scenarioId: SCENARIO_ID,
    states: STATES.slice(),
    responses: RESPONSE_IDS.slice(),
    worldAdvanceDelayMs: WORLD_ADVANCE_DELAY_MS,
  });
})();
