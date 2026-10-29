const ERRORS = Object.freeze({
  UNAUTHORIZED: "Ключ игрока неверный или больше не действует.",
  FORBIDDEN: "У этого ключа нет доступа к бою.",
  ORIGIN_FORBIDDEN: "Локальный сервер не разрешил подключение с этой страницы.",
  BATTLE_NOT_FOUND: "Бой не найден. Проверь номер боя.",
  NOT_FOUND: "Бой не найден. Проверь номер боя.",
  INVALID_BATTLE_ID: "Неверный номер боя.",
  INVALID_CAPABILITY: "Ключ игрока неверный.",
  CAPABILITY_REVOKED: "Ключ игрока отозван.",
  INVALID_SELECTION: "Проверь выбранные действия.",
  EXPIRED: "Время для хода истекло.",
  BATTLE_EXPIRED: "Время для хода истекло.",
  ALREADY_COMMITTED: "Твой ход уже принят.",
  COMMIT_IMMUTABLE: "Твой ход уже принят и его нельзя изменить.",
  CONFLICT_RETRY_EXHAUSTED: "Состояние боя изменилось. Обнови его и повтори действие.",
});
const COLORS = Object.freeze({ y: "Жёлтый", o: "Оранжевый", r: "Красный" });
const ATTACK_ACTIONS = Object.freeze({
  N: Object.freeze({ name: "Наезд", explanation: "Сильное прямое давление." }),
  P: Object.freeze({
    name: "Предъява",
    explanation: "Последовательно требует от соперника ответа по существу.",
  }),
  T: Object.freeze({
    name: "Подкол",
    explanation: "Пытается вывести соперника из себя; особенно действует против Агрессии.",
  }),
});
const DEFENSE_ACTIONS = Object.freeze({
  S: Object.freeze({
    name: "Спокойная защита",
    explanation: "Помогает удержать удар, снижая собственное давление.",
  }),
  C: Object.freeze({
    name: "Контратака",
    explanation: "Нейтральный ответ без усиления атаки или защиты.",
  }),
  G: Object.freeze({
    name: "Агрессия",
    explanation: "Усиливает давление ценой ослабленной защиты.",
  }),
});

export function participantSide(view) {
  const self = view?.participants?.self;
  const opponent = view?.participants?.opponent;
  if (typeof self !== "string" || typeof opponent !== "string") return null;
  const selfMatch = /^synthetic-([AB])-[A-Za-z0-9-]+$/.exec(self);
  const opponentMatch = /^synthetic-([AB])-[A-Za-z0-9-]+$/.exec(opponent);
  if (!selfMatch || !opponentMatch || selfMatch[1] === opponentMatch[1]) return null;
  return selfMatch[1];
}

export function participantDescription(view) {
  const side = participantSide(view);
  if (!side) {
    return "Не удалось определить сторону по ответу сервера. Результат не будет приписан игроку.";
  }
  const other = side === "A" ? "Б" : "А";
  return "Ты - Игрок " + (side === "A" ? "А" : "Б") + ". Соперник - Игрок " + other + ".";
}

export function battleProgressText(view) {
  if (!view || typeof view !== "object") return "Состояние боя пока недоступно.";
  if (view.phase === "expired") return "Время для хода истекло.";
  if (view.revealed === true || view.phase === "revealed" || view.phase === "final") {
    return "Бой завершён.";
  }
  if (view.selfCommitted === true && view.opponentCommitted === true) {
    return "Оба хода получены.";
  }
  if (view.selfCommitted === true) {
    return "Твой ход принят. Ожидаем ход соперника.";
  }
  if (view.opponentCommitted === true) {
    return "Соперник сделал ход. Теперь твой ход.";
  }
  if (["created", "waiting", "committed"].includes(view.phase)) {
    return "Ожидаем твой ход.";
  }
  return "Состояние боя пока неизвестно.";
}

export function attackActionInfo(code) {
  return Object.prototype.hasOwnProperty.call(ATTACK_ACTIONS, code) ? ATTACK_ACTIONS[code] : null;
}

export function defenseActionInfo(code) {
  return Object.prototype.hasOwnProperty.call(DEFENSE_ACTIONS, code) ? DEFENSE_ACTIONS[code] : null;
}

export function formatActionLine(actions) {
  if (!actions || typeof actions.attack !== "string" || typeof actions.defense !== "string") return "";
  return "Атака: " + actions.attack + " Защита: " + actions.defense;
}

export function moveStatus(committed) {
  return committed === true ? "Ход принят" : "Ход ещё не отправлен";
}

export function readableError(error) {
  const message = String(error?.message || "");
  if (Object.prototype.hasOwnProperty.call(ERRORS, message)) return ERRORS[message];
  if (/valid battle ID/i.test(message)) return "Введи корректный номер боя.";
  if (/43-character player token/i.test(message)) return "Введи полный ключ игрока.";
  if (/fetch|network|load failed|offline/i.test(message)) {
    return "Нет связи с локальным сервером. Проверь окно Терминала с запущенным боем.";
  }
  if (/invalid json|request failed/i.test(message)) {
    return "Локальный сервер вернул неожиданный ответ. Обнови страницу.";
  }
  return "Не удалось выполнить действие. Проверь данные и соединение с локальным сервером.";
}

function colorText(value) {
  return Object.prototype.hasOwnProperty.call(COLORS, value) ? COLORS[value] : "цвет не распознан";
}

function actionSummary(selection) {
  if (!selection || typeof selection !== "object") return null;
  const attackType = attackActionInfo(selection.attackType);
  const defenseType = defenseActionInfo(selection.defenseType);
  if (!attackType || !defenseType ||
      !Object.prototype.hasOwnProperty.call(COLORS, selection.attackColor) ||
      !Object.prototype.hasOwnProperty.call(COLORS, selection.defenseColor)) return null;
  return {
    attack: colorText(selection.attackColor) + "; " + attackType.name + ". " + attackType.explanation,
    defense: colorText(selection.defenseColor) + "; " + defenseType.name + ". " + defenseType.explanation,
  };
}

function finite(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function resultExplanation(code, outcome, pressureA, pressureB) {
  if (code === "BOTH_DEFENSES_HELD") {
    return "Оба удара отражены. Ни один игрок не пробил защиту противника.";
  }
  if (code === "A_ONLY_HIT") return "Игрок А пробил защиту соперника, а игрок Б не пробил.";
  if (code === "B_ONLY_HIT") return "Игрок Б пробил защиту соперника, а игрок А не пробил.";
  if (code === "BOTH_HIT" && outcome === "DRAW" && pressureA === pressureB) {
    return "Оба удара пробили защиту, но сила атак оказалась одинаковой.";
  }
  if (code === "BOTH_HIT") {
    return "Оба удара пробили защиту. Победила атака с большей силой.";
  }
  return "Итог определён сервером; подробное объяснение для этого результата недоступно.";
}

export function describeResult(view) {
  if (!view || view.revealed !== true) return null;
  const side = participantSide(view);
  const resolution = view.resolution;
  const outcome = view.mechanicalOutcome;
  if (!side || !resolution || resolution.ok !== true ||
      !["DRAW", "A_WIN", "B_WIN"].includes(outcome) ||
      (resolution.mechanicalOutcome && resolution.mechanicalOutcome !== outcome)) {
    return {
      title: "Результат недоступен",
      explanation: "Не удалось безопасно подтвердить итог и сторону игрока по ответу сервера.",
      stats: null,
      actions: null,
    };
  }

  const reasonCode = resolution.explanation?.code;
  const pressureA = finite(resolution.pressureA);
  const pressureB = finite(resolution.pressureB);
  const defenseA = finite(resolution.defenseA);
  const defenseB = finite(resolution.defenseB);
  if ((reasonCode === "BOTH_DEFENSES_HELD" && outcome !== "DRAW") ||
      (reasonCode === "A_ONLY_HIT" && outcome !== "A_WIN") ||
      (reasonCode === "B_ONLY_HIT" && outcome !== "B_WIN") ||
      (reasonCode === "BOTH_HIT" &&
        ((outcome === "DRAW" && pressureA !== pressureB) ||
         (outcome === "A_WIN" && !(pressureA > pressureB)) ||
         (outcome === "B_WIN" && !(pressureB > pressureA))))) {
    return {
      title: "Результат недоступен",
      explanation: "Ответ сервера содержит несогласованные сведения об исходе.",
      stats: null,
      actions: null,
    };
  }

  const winner = outcome === "A_WIN" ? "A" : outcome === "B_WIN" ? "B" : null;
  const title = winner === null ? "Ничья" : winner === side ? "Победа" : "Поражение";
  const actions = view.selections && {
    A: actionSummary(view.selections.A),
    B: actionSummary(view.selections.B),
  };
  if ([pressureA, pressureB, defenseA, defenseB].some(value => value === null) ||
      !actions?.A || !actions?.B) {
    return {
      title: "Результат недоступен",
      explanation: "Сервер вернул неполные данные о действиях или силах игроков.",
      stats: null,
      actions: null,
    };
  }
  return {
    title,
    explanation: resultExplanation(reasonCode, outcome, pressureA, pressureB),
    stats: {
      A: { attack: pressureA, defense: defenseA },
      B: { attack: pressureB, defense: defenseB },
    },
    actions: actions && actions.A && actions.B ? actions : null,
  };
}

export function localDate(value) {
  const date = new Date(value);
  return Number.isFinite(date.valueOf())
    ? date.toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" })
    : "Не указано";
}
