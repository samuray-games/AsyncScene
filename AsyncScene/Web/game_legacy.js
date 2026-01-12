// game.js (offline, single-file MVP engine)
// Next step: we can split this into data.js, ui.js, conflict.js, npcs.js when you say so.

(() => {
  const $ = (id) => document.getElementById(id);

  const onClick = (id, fn) => {
    const el = $(id);
    if (el) el.onclick = fn;
    return el;
  };

  const onEnter = (id, fn) => {
    const el = $(id);
    if (!el) return el;
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") fn();
    });
    return el;
  };

  const safeText = (s) => String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

  const nowHHMM = () => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const norm = (s) => String(s || "").toLowerCase().trim();

  // ----------------------------
  // DATA (later -> data.js)
  // ----------------------------
  const LOCATIONS = {
    square: {
      name: "Площадь",
      desc: "Главный чат. Здесь видно всех. Здесь начинается ⚡.",
      tags: ["Общая лента", "Социальный хаб"],
      npcs: [
        { name: "Алекс", note: "любит доминировать" },
        { name: "Мира", note: "намекает кусками" },
        { name: "Кай", note: "проверяет на прочность" },
        { name: "Юна", note: "смеется метко" },
        { name: "Сора", note: "слушает, потом режет правдой" },
      ],
    },
    bar: {
      name: "Ночной бар",
      desc: "Тусклый свет. Музыка давит, разговоры наслаиваются. Здесь любят проверять границы.",
      tags: ["Напряжение", "Густая толпа"],
      npcs: [
        { name: "Алекс", note: "заводит людей" },
        { name: "Мира", note: "говорит намеками" },
      ],
    },
    backroom: {
      name: "Задняя комната",
      desc: "Тише, плотнее, ближе. Здесь сделки звучат как шепот, а шутки как пароли.",
      tags: ["Секретно", "Доступ по нити"],
      npcs: [
        { name: "Бармен", note: "коротко и по делу" },
        { name: "Охранник", note: "у него всегда есть второй путь" },
      ],
    },
    rooftop: {
      name: "Крыша",
      desc: "Ветер сносит слова быстрее, чем мысли. Здесь легче говорить честно, но больнее слышать правду.",
      tags: ["Тише", "Честнее"],
      npcs: [
        { name: "Сора", note: "молчит дольше всех" },
        { name: "Юна", note: "улыбка как нож" },
      ],
    },
    arcade: {
      name: "Аркада",
      desc: "Неон, автоматы и маленькие победы. Здесь конфликт часто выглядит как игра, пока не становится настоящим.",
      tags: ["Шумно", "Быстрые реакции"],
      npcs: [
        { name: "Кай", note: "любит правила" },
        { name: "Рин", note: "появляется вовремя" },
      ],
    },
  };

  // Phrase colors (strength bands). No stats UI needed.
  const PHRASES = [
    { id: "p_y_1", color: "yellow", label: "Уточняю спокойно", power: 2, kind: "phrase" },
    { id: "p_y_2", color: "yellow", label: "Задаю простой вопрос", power: 1, kind: "phrase" },
    { id: "p_o_1", color: "orange", label: "Ставлю границу", power: 4, kind: "phrase" },
    { id: "p_o_2", color: "orange", label: "Ловлю на противоречии", power: 5, kind: "phrase" },
    { id: "p_r_1", color: "red", label: "Режу по сути", power: 7, kind: "phrase" },
    { id: "p_r_2", color: "red", label: "Срываю маску", power: 8, kind: "phrase" },
  ];

  const COUNTERS = [
    { id: "c_y_1", color: "yellow", label: "Смягчаю", power: 2, kind: "counter" },
    { id: "c_y_2", color: "yellow", label: "Перевожу в шутку", power: 3, kind: "counter" },
    { id: "c_o_1", color: "orange", label: "Парирую фактами", power: 5, kind: "counter" },
    { id: "c_o_2", color: "orange", label: "Зеркалю", power: 4, kind: "counter" },
    { id: "c_r_1", color: "red", label: "Контратака", power: 8, kind: "counter" },
    { id: "c_r_2", color: "red", label: "Обнуляю позицию", power: 7, kind: "counter" },
  ];

  // Special cards (Exploding Kitten vibes, later)
  const SPECIALS = [
    { id: "s_nope", label: "НЕТЬ", desc: "Отменяет ход" },
    { id: "s_bail", label: "СЛИНЯЙ", desc: "Закрывает конфликт без победителя" },
  ];

  const CREATE_CHOICES = {
    act: ["Говорю прямо", "Наблюдаю и жду", "Провоцирую", "Сглаживаю", "Поддерживаю", "Иду против течения"],
    tense: ["Выйти вперед", "Остаться в тени", "Перевести в шутку", "Защитить кого-то", "Уйти молча"],
    tone: ["Спокойный", "Ироничный", "Резкий", "Теплый", "Сдержанный"],
  };

  // ----------------------------
  // STATE
  // ----------------------------
  const state = {
    me: { name: "", status: "Новый", act: "", tense: "", tone: "" },
    startLocation: "random",
    locationId: "square",

    unlocked: {
      square: true,
      bar: true,
      arcade: true,
      backroom: false,
      rooftop: false,
    },

    impulses: 0,
    influence: {}, // name -> int
    activity: { square: 60, bar: 55, backroom: 30, rooftop: 35, arcade: 45 },

    chat: [],
    sys: [],

    // conflict flow
    conflict: {
      stage: "idle", // idle | pickTarget | pending | choosePhrase | chooseCounter | resolved
      challenger: null,
      target: null,
      phrase: null,
      counter: null,
      lastResult: null,
    },

    // UI selection helpers
    selectedTargetName: null,
  };

  // ----------------------------
  // UI helpers (later -> ui.js)
  // ----------------------------
  const screens = {
    create: $("screenCreate"),
    scene: $("screenScene"),
    details: $("screenDetails"),
    sw: $("screenSwitch"),
    road: $("screenRoad"),
  };

  function show(which) {
    Object.values(screens).forEach((s) => s && s.classList.remove("active"));
    if (screens[which]) screens[which].classList.add("active");

    const title = $("leftTitle");
    if (!title) return;

    title.textContent =
      which === "create" ? "Создание персонажа" :
      which === "details" ? "Локация (детали)" :
      which === "sw" ? "Смена локации" :
      which === "road" ? "Портал" :
      "Игра";
  }

  function logSys(text) {
    state.sys.unshift({ t: nowHHMM(), text: String(text) });
    renderSys();
  }

  function pushChat(name, text) {
    state.chat.push({ t: nowHHMM(), name: String(name), text: String(text) });
    renderChat();
  }

  function ensureInfluence(name) {
    if (state.influence[name] == null) state.influence[name] = 5; // baseline
    return state.influence[name];
  }

  function incInfluence(name, delta) {
    ensureInfluence(name);
    state.influence[name] = Math.max(0, state.influence[name] + delta);
  }

  function colorLabel(color) {
    if (color === "yellow") return "Желтая";
    if (color === "orange") return "Оранжевая";
    if (color === "red") return "Красная";
    return "Серая";
  }

  function renderSys() {
    const box = $("sysLog");
    if (!box) return;

    box.innerHTML = "";
    state.sys.slice(0, 10).forEach((i) => {
      const el = document.createElement("div");
      el.className = "bubble";
      el.innerHTML =
        `<div class="meta"><span class="name">Система</span><span class="time">${safeText(i.t)}</span></div>` +
        `<div>${safeText(i.text)}</div>`;
      box.appendChild(el);
    });
  }

  function renderChat() {
    const box = $("chatLog");
    if (!box) return;

    box.innerHTML = "";

    state.chat.slice(-120).forEach((m) => {
      const el = document.createElement("div");
      el.className = "bubble";

      const nameBtn = document.createElement("button");
      nameBtn.className = "btn ghost";
      nameBtn.style.padding = "2px 8px";
      nameBtn.style.borderRadius = "999px";
      nameBtn.style.fontSize = "12px";
      nameBtn.textContent = m.name;

      // Click name -> target selection for conflict
      nameBtn.onclick = () => {
        if (!state.me.name) {
          logSys("Сначала создай персонажа.");
          return;
        }
        if (m.name === state.me.name) {
          logSys("Сам с собой спорить можно, но позже. Выбери другого.");
          return;
        }
        state.selectedTargetName = m.name;
        openConflictCard();
        renderConflictCard();
      };

      const meta = document.createElement("div");
      meta.className = "meta";

      const nameWrap = document.createElement("span");
      nameWrap.className = "name";
      nameWrap.appendChild(nameBtn);

      const time = document.createElement("span");
      time.className = "time";
      time.textContent = m.t;

      meta.appendChild(nameWrap);
      meta.appendChild(time);

      const body = document.createElement("div");
      body.innerHTML = safeText(m.text);

      el.appendChild(meta);
      el.appendChild(body);

      box.appendChild(el);
    });

    box.scrollTop = box.scrollHeight;
  }

  function renderChoiceGroup(containerId, values, onPick, pickedValue) {
    const box = $(containerId);
    if (!box) return;
    box.innerHTML = "";

    values.forEach((v) => {
      const b = document.createElement("button");
      b.className = "btn" + (v === pickedValue ? " primary" : "");
      b.textContent = v;
      b.onclick = () => {
        onPick(v);
        renderCreateUI();
      };
      box.appendChild(b);
    });
  }

  function renderStartLocationPicker() {
    const box = $("startLocation");
    if (!box) return;
    box.innerHTML = "";

    const startable = ["square", "bar", "arcade"];

    startable.forEach((id) => {
      const b = document.createElement("button");
      b.className = "btn" + (state.startLocation === id ? " primary" : "");
      b.textContent = LOCATIONS[id].name;
      b.onclick = () => {
        state.startLocation = id;
        renderCreateUI();
      };
      box.appendChild(b);
    });

    const r = document.createElement("button");
    r.className = "btn" + (state.startLocation === "random" ? " primary" : "");
    r.textContent = "Случайно";
    r.onclick = () => {
      state.startLocation = "random";
      renderCreateUI();
    };
    box.appendChild(r);
  }

  function renderCreateUI() {
    renderChoiceGroup("actStyle", CREATE_CHOICES.act, (v) => { state.me.act = v; }, state.me.act);
    renderChoiceGroup("tenseStyle", CREATE_CHOICES.tense, (v) => { state.me.tense = v; }, state.me.tense);
    renderChoiceGroup("toneStyle", CREATE_CHOICES.tone, (v) => { state.me.tone = v; }, state.me.tone);
    renderStartLocationPicker();
  }

  function renderDetailsPanel() {
    const loc = LOCATIONS[state.locationId];
    if (!loc) return;

    const atmos = $("detailAtmos");
    if (atmos) {
      atmos.innerHTML = "";
      (loc.tags || []).forEach((t) => {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.innerHTML = `Метка: <span class="k">${safeText(t)}</span>`;
        atmos.appendChild(tag);
      });
    }

    const ppl = $("detailPeople");
    if (ppl) {
      ppl.innerHTML = "";

      const list = [...(loc.npcs || [])].map((n) => ({
        name: n.name,
        status: `⚡ ${ensureInfluence(n.name)}`,
        note: n.note || "",
      }));

      if (state.me.name) {
        list.push({
          name: state.me.name,
          status: `⚡ ${ensureInfluence(state.me.name)}`,
          note: "ты",
        });
      }

      list.forEach((p) => {
        const el = document.createElement("div");
        el.className = "bubble";
        el.innerHTML =
          `<div class="meta"><span class="name">${safeText(p.name)}</span><span class="time">${safeText(p.status)}</span></div>` +
          `<div class="muted">${safeText(p.note)}</div>`;
        ppl.appendChild(el);
      });
    }
  }

  function renderLocation() {
    const loc = LOCATIONS[state.locationId];
    if (!loc) return;

    const sceneName = $("sceneName");
    if (sceneName) sceneName.textContent = loc.name;

    const sceneTitle = $("sceneTitle");
    if (sceneTitle) sceneTitle.textContent = loc.name;

    const sceneClock = $("sceneClock");
    if (sceneClock) sceneClock.textContent = nowHHMM();

    const meName = $("meName");
    if (meName) meName.textContent = state.me.name || "-";

    const meStatus = $("meStatus");
    if (meStatus) meStatus.textContent = state.me.status || "-";

    const pill = $("pillUser");
    if (pill) {
      pill.textContent = state.me.name
        ? `${state.me.name} - ${state.me.status} - ${loc.name}`
        : "Не в игре";
    }

    const desc = $("sceneDesc");
    if (desc) desc.textContent = loc.desc;

    const meta = $("sceneMeta");
    if (meta) {
      meta.innerHTML = "";
      (loc.tags || []).forEach((t) => {
        const tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = t;
        meta.appendChild(tag);
      });

      const a = document.createElement("span");
      a.className = "tag";
      a.innerHTML = `Движуха: <span class="k">${safeText(String(state.activity[state.locationId] ?? 0))}</span>`;
      meta.appendChild(a);

      if (state.me.name) {
        const inf = document.createElement("span");
        inf.className = "tag";
        inf.innerHTML = `⚡: <span class="k">${safeText(String(ensureInfluence(state.me.name)))}</span>`;
        meta.appendChild(inf);
      }
    }

    const locks = $("sceneLocks");
    if (locks) {
      locks.innerHTML = "";

      const items = Object.keys(LOCATIONS).filter((k) => k !== state.locationId);
      const lockedCount = items.filter((k) => !state.unlocked[k]).length;

      const t1 = document.createElement("span");
      t1.className = "tag";
      t1.innerHTML = `Открыто локаций: <span class="k">${safeText(String(items.length - lockedCount + 1))}</span>`;
      locks.appendChild(t1);

      const t2 = document.createElement("span");
      t2.className = "tag";
      t2.innerHTML = `Импульс: <span class="k">${safeText(String(state.impulses))}</span>`;
      locks.appendChild(t2);
    }

    const prog = $("sceneProgress");
    if (prog) {
      prog.innerHTML = "";

      const hint = document.createElement("span");
      hint.className = "tag";
      hint.innerHTML = `Подсказка: <span class="k">нажми на имя в чате</span>`;
      prog.appendChild(hint);
    }

    // Event text stays simple for now
    const eventText = $("eventText");
    if (eventText) {
      const lines = [
        `В ${loc.name} кто-то слишком внимательно читает чат.`,
        `В ${loc.name} слова цепляются друг за друга. Сейчас можно поднять волну.`,
        `В ${loc.name} заметно: кто-то ищет повод для спора.`,
      ];
      eventText.textContent = pick(lines);
    }

    const microHint = $("microHint");
    if (microHint) {
      microHint.textContent = "Главная механика: вызови кого-то на конфликт кликом по имени в чате.";
    }

    const threadHint = $("threadHint");
    if (threadHint) {
      threadHint.textContent = "МVP: конфликты дают ⚡. Позже добавим нити, комнаты и доступы.";
    }

    renderDetailsPanel();
    renderConflictCard();
  }

  // ----------------------------
  // Conflict UI injection (no index change needed)
  // ----------------------------
  function openConflictCard() {
    let card = $("conflictCard");
    if (card) {
      card.style.display = "block";
      return;
    }

    // Insert under active event bubble (after initiativeCard if exists, else after event bubble)
    const sceneScreen = $("screenScene");
    if (!sceneScreen) return;

    card = document.createElement("div");
    card.id = "conflictCard";
    card.className = "bubble";
    card.style.marginTop = "12px";

    card.innerHTML =
      `<div class="meta"><span class="name">Конфликт</span><span class="time" id="conflictClock">--:--</span></div>` +
      `<div id="conflictBody"></div>` +
      `<div class="sep"></div>` +
      `<div class="choice" id="conflictActions"></div>`;

    // Place it after initiativeCard if it exists
    const init = $("initiativeCard");
    if (init && init.parentNode === sceneScreen) {
      init.insertAdjacentElement("afterend", card);
    } else {
      sceneScreen.appendChild(card);
    }
  }

  function closeConflictCard() {
    const card = $("conflictCard");
    if (card) card.style.display = "none";
    state.selectedTargetName = null;
    state.conflict.stage = "idle";
    state.conflict.challenger = null;
    state.conflict.target = null;
    state.conflict.phrase = null;
    state.conflict.counter = null;
  }

  function renderConflictCard() {
    const card = $("conflictCard");
    if (!card) return;

    const clock = $("conflictClock");
    if (clock) clock.textContent = nowHHMM();

    const body = $("conflictBody");
    const actions = $("conflictActions");
    if (!body || !actions) return;

    // Hide card if nothing selected and not in conflict
    if (!state.selectedTargetName && state.conflict.stage === "idle") {
      card.style.display = "none";
      return;
    }

    card.style.display = "block";
    actions.innerHTML = "";

    const me = state.me.name;
    const target = state.selectedTargetName || state.conflict.target;

    if (!me) {
      body.textContent = "Сначала создай персонажа.";
      const b = document.createElement("button");
      b.className = "btn";
      b.textContent = "Закрыть";
      b.onclick = closeConflictCard;
      actions.appendChild(b);
      return;
    }

    // Stage 1: pick target and send challenge
    if (state.conflict.stage === "idle" || state.conflict.stage === "pickTarget") {
      const tName = target;
      body.innerHTML =
        `Цель: <b>${safeText(tName || "не выбрана")}</b><br>` +
        `Вызов на конфликт отправит приглашение. Победа забирает <b>1 ⚡</b>.`;

      const b1 = document.createElement("button");
      b1.className = "btn primary";
      b1.textContent = "Вызвать";
      b1.disabled = !tName;
      b1.onclick = () => beginChallenge(me, tName);
      actions.appendChild(b1);

      const b2 = document.createElement("button");
      b2.className = "btn";
      b2.textContent = "Отмена";
      b2.onclick = closeConflictCard;
      actions.appendChild(b2);
      return;
    }

    // Stage 2: choose phrase (attacker)
    if (state.conflict.stage === "choosePhrase") {
      body.innerHTML =
        `Ты вызвал: <b>${safeText(state.conflict.target)}</b><br>` +
        `Выбери фразу (цвет = риск и сила).`;

      PHRASES.forEach((p) => {
        const b = document.createElement("button");
        b.className = "btn" + (p.color === "red" ? " primary" : "");
        b.textContent = `${colorLabel(p.color)} - ${p.label}`;
        b.onclick = () => {
          state.conflict.phrase = p;
          state.conflict.stage = "chooseCounter";
          renderConflictCard();
          simulateNpcCounter();
        };
        actions.appendChild(b);
      });

      const b2 = document.createElement("button");
      b2.className = "btn";
      b2.textContent = "Отмена";
      b2.onclick = closeConflictCard;
      actions.appendChild(b2);
      return;
    }

    // Stage 3: waiting / chooseCounter handled by npc (offline)
    if (state.conflict.stage === "chooseCounter") {
      const p = state.conflict.phrase;
      body.innerHTML =
        `Твоя фраза: <b>${safeText(p ? p.label : "?")}</b><br>` +
        `Ждем контрфразу от <b>${safeText(state.conflict.target)}</b>...`;

      const b2 = document.createElement("button");
      b2.className = "btn";
      b2.textContent = "СЛИНЯЙ";
      b2.onclick = () => {
        logSys("Ты закрыл конфликт картой СЛИНЯЙ.");
        pushChat("Система", "Конфликт закрыт без победителя.");
        closeConflictCard();
        renderLocation();
      };
      actions.appendChild(b2);
      return;
    }

    // Stage 4: resolved
    if (state.conflict.stage === "resolved") {
      const r = state.conflict.lastResult;
      body.innerHTML = safeText(r || "Готово.");

      const b1 = document.createElement("button");
      b1.className = "btn primary";
      b1.textContent = "Ок";
      b1.onclick = () => {
        closeConflictCard();
        renderLocation();
      };
      actions.appendChild(b1);
      return;
    }
  }

  // ----------------------------
  // Conflict engine (later -> conflict.js)
  // ----------------------------
  function beginChallenge(challengerName, targetName) {
    if (!challengerName || !targetName) return;

    ensureInfluence(challengerName);
    ensureInfluence(targetName);

    state.conflict.stage = "choosePhrase";
    state.conflict.challenger = challengerName;
    state.conflict.target = targetName;
    state.conflict.phrase = null;
    state.conflict.counter = null;
    state.conflict.lastResult = null;

    logSys(`Вызов: ${challengerName} -> ${targetName}.`);
    pushChat("Система", `${challengerName} вызывает ${targetName} на конфликт.`);
    renderConflictCard();
  }

  function simulateNpcCounter() {
    // Offline: target is always NPC for now, so it counters automatically after a short delay.
    // No setTimeout loops. One shot is enough.
    const target = state.conflict.target;
    if (!target) return;

    const counter = pick(COUNTERS);
    state.conflict.counter = counter;

    const p = state.conflict.phrase;
    const c = counter;

    // small randomness for drama
    const rollA = Math.floor(Math.random() * 3); // 0..2
    const rollB = Math.floor(Math.random() * 3);

    const atk = (p ? p.power : 0) + rollA;
    const def = (c ? c.power : 0) + rollB;

    const me = state.conflict.challenger;
    const opp = target;

    pushChat(opp, `Контрфраза: ${c.label}.`);
    logSys(`Контрфраза от ${opp}: ${colorLabel(c.color)}.`);

    // Resolve
    let winner = null;
    let loser = null;

    if (atk > def) {
      winner = me;
      loser = opp;
    } else if (def > atk) {
      winner = opp;
      loser = me;
    } else {
      // tie -> nobody wins, slight heat gain
      state.activity[state.locationId] = clamp((state.activity[state.locationId] ?? 40) + 3, 10, 95);
      state.conflict.stage = "resolved";
      state.conflict.lastResult =
        `Ничья. Фразы столкнулись лбами и погасли.\n` +
        `Ты: ${p.label} (${atk})\n` +
        `${opp}: ${c.label} (${def})`;
      pushChat("Система", "Ничья. ⚡ не изменилось.");
      renderConflictCard();
      renderLocation();
      return;
    }

    // Transfer influence
    incInfluence(winner, +1);
    incInfluence(loser, -1);

    // activity bump
    state.activity[state.locationId] = clamp((state.activity[state.locationId] ?? 40) + 7, 10, 95);

    // impulse reward for engaging
    state.impulses = Math.min(9, state.impulses + 1);

    const resultText =
      `Результат: победил ${winner}.\n` +
      `Ты: ${p.label} (${atk})\n` +
      `${opp}: ${c.label} (${def})\n` +
      `⚡: ${winner} +1, ${loser} -1.`;

    state.conflict.stage = "resolved";
    state.conflict.lastResult = resultText;

    pushChat("Система", `Победа: ${winner}. ⚡ перешло.`);
    logSys(`Победа: ${winner}. Импульс +1.`);
    renderConflictCard();
    renderLocation();
  }

  // ----------------------------
  // Movement, portal, switching
  // ----------------------------
  function tickActivity() {
    Object.keys(state.activity).forEach((id) => {
      const base = state.activity[id] ?? 40;
      const drift = Math.floor((Math.random() * 11) - 5); // -5..+5
      state.activity[id] = clamp(base + drift, 10, 95);
    });
  }

  function bestUnlockedLocationId() {
    let bestId = state.locationId;
    let bestScore = -1;

    Object.keys(LOCATIONS).forEach((id) => {
      if (!state.unlocked[id]) return;
      const score = state.activity[id] ?? 0;
      if (score > bestScore) {
        bestScore = score;
        bestId = id;
      }
    });

    return bestId;
  }

  function renderPortal() {
    const box = $("roadStatus");
    if (!box) return;

    box.innerHTML = "";

    const tag1 = document.createElement("span");
    tag1.className = "tag";
    tag1.innerHTML = `Импульс: <span class="k">${safeText(String(state.impulses))}</span>`;
    box.appendChild(tag1);

    const tag2 = document.createElement("span");
    tag2.className = "tag";
    tag2.innerHTML = `⚡: <span class="k">${safeText(String(state.me.name ? ensureInfluence(state.me.name) : 0))}</span>`;
    box.appendChild(tag2);

    const hint = document.createElement("div");
    hint.className = "small";
    hint.style.marginTop = "8px";
    hint.textContent = "Портал: быстрые ходы и ускорение. Сейчас быстрый ход дает импульс.";
    box.appendChild(hint);
  }

  // ----------------------------
  // Start / Reset
  // ----------------------------
  function seedChatForLocation(locId) {
    const loc = LOCATIONS[locId];
    if (!loc) return;

    // Place a few lines so user has targets to click immediately.
    const names = (loc.npcs || []).map((n) => n.name);
    if (!names.length) return;

    const lines = [
      "Кто сегодня держит слово?",
      "Тут слишком тихо, это подозрительно.",
      "Я вижу, кто читает, но не пишет.",
      "Ну что, начинаем?",
      "Слабые фразы сюда не приносят.",
    ];

    // Always include at least 2 NPC messages
    pushChat(pick(names), pick(lines));
    pushChat(pick(names), pick(lines));
    if (Math.random() < 0.6) pushChat(pick(names), pick(lines));
  }

  function startGame() {
    const nameEl = $("inName");
    const name = nameEl ? nameEl.value.trim() : "";
    if (!name) {
      if (nameEl) nameEl.focus();
      return;
    }

    state.me.name = name;
    state.me.status = "Новый";

    ensureInfluence(name);

    // also seed influence for all NPC names
    Object.values(LOCATIONS).forEach((l) => (l.npcs || []).forEach((n) => ensureInfluence(n.name)));

    // choose start location
    const startable = ["square", "bar", "arcade"];
    if (state.startLocation && state.startLocation !== "random") state.locationId = state.startLocation;
    else state.locationId = pick(startable);

    // reset runtime stuff
    state.chat = [];
    state.sys = [];
    state.selectedTargetName = null;
    closeConflictCard();

    state.impulses = 0;
    state.activity = { square: 60, bar: 55, backroom: 30, rooftop: 35, arcade: 45 };
    state.unlocked = { square: true, bar: true, arcade: true, backroom: false, rooftop: false };

    logSys(`Персонаж создан: ${name}.`);
    logSys(`Ты вошел в локацию "${LOCATIONS[state.locationId].name}".`);
    seedChatForLocation(state.locationId);

    renderLocation();
    show("scene");
  }

  function resetAll() {
    state.me = { name: "", status: "Новый", act: "", tense: "", tone: "" };
    state.startLocation = "random";
    state.locationId = "square";
    state.unlocked = { square: true, bar: true, arcade: true, backroom: false, rooftop: false };
    state.impulses = 0;
    state.influence = {};
    state.activity = { square: 60, bar: 55, backroom: 30, rooftop: 35, arcade: 45 };
    state.chat = [];
    state.sys = [];
    state.selectedTargetName = null;
    closeConflictCard();

    const nameEl = $("inName");
    if (nameEl) nameEl.value = "";

    const pill = $("pillUser");
    if (pill) pill.textContent = "Не в игре";

    const sceneName = $("sceneName");
    if (sceneName) sceneName.textContent = "-";

    renderCreateUI();
    renderChat();
    renderSys();
    renderPortal();
    show("create");
  }

  // ----------------------------
  // Chat actions
  // ----------------------------
  function sendChat() {
    const input = $("chatInput");
    const txt = input ? input.value.trim() : "";
    if (!txt) return;

    if (!state.me.name) {
      logSys("Сначала создай персонажа.");
      return;
    }

    if (input) input.value = "";

    pushChat(state.me.name, txt);

    // small activity increase for speaking
    tickActivity();
    state.activity[state.locationId] = clamp((state.activity[state.locationId] ?? 40) + 4, 10, 95);

    // NPC reactions
    const npcs = LOCATIONS[state.locationId]?.npcs || [];
    if (npcs.length && Math.random() < 0.55) {
      const npc = pick(npcs).name;

      // if user asks "как пройти дальше", drop a simple tease (future: threads)
      const t = norm(txt);
      if (t.includes("как пройти") || t.includes("дальше")) {
        pushChat(npc, "Дальше проходят не просьбой. Проходят силой слова.");
      } else {
        pushChat(npc, pick(["Интересно.", "Смело.", "Посмотрим.", "Продолжай.", "Не факт."]));
      }
    }

    renderLocation();
  }

  // ----------------------------
  // Buttons wiring
  // ----------------------------
  onClick("btnStart", startGame);

  onClick("btnRandom", () => {
    const nameEl = $("inName");
    if (nameEl) nameEl.value = pick(["Рай", "Нико", "Сора", "Юки", "Мика", "Аки", "Тори", "Рин", "Кай", "Юна"]);
    state.me.act = pick(CREATE_CHOICES.act);
    state.me.tense = pick(CREATE_CHOICES.tense);
    state.me.tone = pick(CREATE_CHOICES.tone);
    renderCreateUI();
  });

  onClick("btnSend", sendChat);
  onEnter("chatInput", sendChat);

  onClick("btnPrimaryAction", () => {
    if (!state.me.name) {
      logSys("Сначала создай персонажа.");
      return;
    }
    state.me.status = "На виду";
    state.impulses = Math.min(9, state.impulses + 1);
    tickActivity();
    state.activity[state.locationId] = clamp((state.activity[state.locationId] ?? 40) + 6, 10, 95);
    logSys("Ты вмешался. Импульс +1.");
    renderLocation();
  });

  onClick("btnSecondaryAction", () => {
    if (!state.me.name) {
      logSys("Сначала создай персонажа.");
      return;
    }
    state.me.status = "В тени";
    tickActivity();
    logSys("Ты переждал. Мир не останавливается.");
    renderLocation();
  });

  onClick("btnViewScene", () => {
    if (!state.me.name) {
      logSys("Сначала создай персонажа.");
      return;
    }
    renderDetailsPanel();
    show("details");
  });

  onClick("btnBackToScene", () => show("scene"));

  // Switch locations: show all, disable locked
  onClick("btnSwitch", () => {
    if (!state.me.name) {
      logSys("Сначала создай персонажа.");
      return;
    }
    show("sw");

    const picker = $("scenePicker");
    if (!picker) return;

    picker.innerHTML = "";

    Object.entries(LOCATIONS).forEach(([locId, loc]) => {
      const isUnlocked = !!state.unlocked[locId];
      const b = document.createElement("button");
      b.className = "btn" + (locId === state.locationId ? " primary" : "");
      b.disabled = !isUnlocked;

      const lockTxt = isUnlocked ? "" : " (закрыто)";
      const tags = Array.isArray(loc.tags) ? loc.tags.join(" - ") : "";
      b.innerHTML = `<div class="k">${safeText(loc.name)}${safeText(lockTxt)}</div><div class="small">${safeText(tags)}</div>`;

      b.onclick = () => {
        if (!isUnlocked) return;
        state.locationId = locId;
        logSys(`Ты переместился в "${LOCATIONS[locId].name}".`);
        seedChatForLocation(locId);
        renderLocation();
        show("scene");
      };

      picker.appendChild(b);
    });
  });

  onClick("btnBackFromSwitch", () => {
    renderLocation();
    show("scene");
  });

  // Find party
  onClick("btnFind", () => {
    if (!state.me.name) {
      logSys("Сначала создай персонажа.");
      return;
    }
    tickActivity();
    const target = bestUnlockedLocationId();
    if (target !== state.locationId) {
      state.locationId = target;
      logSys(`Найти движуху: ты переместился в "${LOCATIONS[target].name}".`);
      seedChatForLocation(target);
      renderLocation();
      show("scene");
    } else {
      logSys("Найти движуху: ты уже там, где жарче всего.");
      renderLocation();
    }
  });

  // Portal
  onClick("btnRoad", () => {
    if (!state.me.name) {
      logSys("Сначала создай персонажа.");
      return;
    }
    show("road");
    renderPortal();
  });

  onClick("btnRoadBack", () => {
    renderLocation();
    show("scene");
  });

  onClick("btnRoadPulse", () => {
    if (!state.me.name) {
      logSys("Сначала создай персонажа.");
      return;
    }
    tickActivity();
    state.impulses = Math.min(9, state.impulses + 1);
    state.activity.square = clamp((state.activity.square ?? 60) + 4, 10, 95);
    logSys("Портал: быстрый ход. Импульс +1.");
    renderPortal();
    renderLocation();
  });

  onClick("btnRoadSpend", () => {
    if (!state.me.name) {
      logSys("Сначала создай персонажа.");
      return;
    }
    if (state.impulses < 2) {
      logSys("Нужно 2 импульса.");
      renderPortal();
      return;
    }
    state.impulses -= 2;
    tickActivity();
    state.activity[state.locationId] = clamp((state.activity[state.locationId] ?? 40) + 8, 10, 95);
    logSys("Портал: ты подтолкнул события. Движухи стало больше.");

    // tiny unlock tease (future: threads). Offline: unlock backroom at random when spending in bar.
    if (!state.unlocked.backroom && state.locationId === "bar" && Math.random() < 0.6) {
      state.unlocked.backroom = true;
      logSys(`Открыта локация: ${LOCATIONS.backroom.name}`);
      pushChat("Система", "Кто-то приоткрыл дверь. Теперь можно зайти в заднюю комнату.");
    }

    renderPortal();
    renderLocation();
  });

  onClick("btnRoadCreate", () => {
    if (!state.me.name) {
      logSys("Сначала создай персонажа.");
      return;
    }
    if (state.impulses < 3) {
      logSys("Для создания локации нужно 3 импульса.");
      renderPortal();
      return;
    }
    state.impulses -= 3;

    const id = `custom_${Date.now()}`;
    const name = `Личная локация ${Object.keys(LOCATIONS).length + 1}`;

    LOCATIONS[id] = {
      name,
      desc: "Локация, созданная игроком. Здесь пока пусто, но тут можно выращивать ⚡.",
      tags: ["Личное", "Создано игроком"],
      npcs: [],
    };

    state.unlocked[id] = true;
    state.activity[id] = 35;

    logSys(`Ты создал новую локацию: "${name}".`);
    state.locationId = id;
    renderPortal();
    renderLocation();
    show("scene");
  });

  onClick("btnRoadInitiative", () => {
    if (!state.me.name) {
      logSys("Сначала создай персонажа.");
      return;
    }
    if (state.impulses < 1) {
      logSys("Чтобы начать затею, нужен 1 импульс.");
      renderPortal();
      return;
    }
    state.impulses -= 1;

    const input = $("inInitiative");
    const custom = input ? input.value.trim() : "";
    if (input) input.value = "";

    const idea = custom || pick([
      "Я предлагаю сыграть по новым правилам прямо сейчас.",
      "Давайте решим вопрос одним конфликтом.",
      "Кто сильнее словом, тот и прав.",
    ]);

    pushChat("Система", `Затея: ${idea}`);
    logSys("Затея создана. Теперь люди будут реагировать.");
    state.activity[state.locationId] = clamp((state.activity[state.locationId] ?? 40) + 6, 10, 95);

    renderPortal();
    renderLocation();
  });

  onClick("btnReset", resetAll);

  // ----------------------------
  // Boot
  // ----------------------------
  renderCreateUI();
  renderChat();
  renderSys();
  renderPortal();
  show("create");
})();
