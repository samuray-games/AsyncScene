// Русские подписи для отдельного локального теста. Без доступа к токенам или сети.
const PHASES = Object.freeze({
  created: "Ожидание ходов",
  waiting: "Ожидание второго хода",
  revealed: "Ходы раскрыты",
  final: "Бой завершён",
  expired: "Время боя истекло",
});
const ERRORS = Object.freeze({
  UNAUTHORIZED: "Неверный ключ игрока или доступ отозван.",
  FORBIDDEN: "У этого игрока нет доступа к бою.",
  ORIGIN_FORBIDDEN: "Сервер не разрешает подключение с этой страницы.",
  BATTLE_NOT_FOUND: "Бой не найден. Проверь номер боя.",
  NOT_FOUND: "Бой не найден. Проверь номер боя.",
  INVALID_BATTLE_ID: "Неверный номер боя.",
  INVALID_CAPABILITY: "Неверный ключ игрока.",
  CAPABILITY_REVOKED: "Ключ игрока отозван.",
  INVALID_SELECTION: "Проверь выбранные действия.",
  EXPIRED: "Время для хода истекло.",
  BATTLE_EXPIRED: "Время для хода истекло.",
  ALREADY_COMMITTED: "Твой ход уже отправлен.",
  CONFLICT_RETRY_EXHAUSTED: "Бой изменился. Обнови состояние и повтори попытку.",
});

export function phaseText(phase) {
  return PHASES[phase] || "Состояние боя неизвестно";
}

export function moveStatus(committed) {
  return committed === true ? "Ход отправлен" : "Ход ещё не сделан";
}

export function readableError(error) {
  // Никогда не показываем неизвестный серверный ответ: в нём может оказаться приватная информация.
  const message = String(error?.message || "");
  if (Object.prototype.hasOwnProperty.call(ERRORS, message)) return ERRORS[message];
  if (/valid battle ID/i.test(message)) return "Введи корректный номер боя.";
  if (/43-character player token/i.test(message)) return "Введи полный ключ игрока (43 символа).";
  if (/fetch|network|load failed|offline/i.test(message)) return "Нет связи с локальным сервером. Проверь первый Терминал.";
  if (/invalid json|request failed/i.test(message)) return "Сервер вернул неожиданный ответ. Обнови страницу.";
  return "Не удалось выполнить действие. Проверь данные и соединение с локальным сервером.";
}

export function opponentSide(side) {
  return side === "A" ? "B" : side === "B" ? "A" : null;
}

export function describeResult(view, side) {
  if (!view || view.revealed !== true || !opponentSide(side)) return null;
  const outcome = view.mechanicalOutcome;
  const resolution = view.resolution;
  if (!resolution || resolution.ok !== true ||
      !["DRAW", "A_WIN", "B_WIN"].includes(outcome) ||
      (resolution.mechanicalOutcome && resolution.mechanicalOutcome !== outcome)) {
    return { title: "Результат недоступен", explanation: "Сервер вернул неполный результат.", stats: null };
  }

  const winner = outcome === "A_WIN" ? "A" : outcome === "B_WIN" ? "B" : null;
  const title = !winner ? "Ничья" : winner === side ? "Победа!" : "Поражение";
  const reason = resolution.explanation?.code;
  let explanation;
  if (reason === "BOTH_DEFENSES_HELD") {
    explanation = "Оба удара отражены: никто не пробил защиту соперника.";
  } else if (reason === "A_ONLY_HIT") {
    explanation = "Игрок А пробил защиту, а игрок Б не смог.";
  } else if (reason === "B_ONLY_HIT") {
    explanation = "Игрок Б пробил защиту, а игрок А не смог.";
  } else if (reason === "BOTH_HIT" && !winner) {
    explanation = "Оба пробили защиту и набрали одинаковую силу атаки.";
  } else if (reason === "BOTH_HIT") {
    explanation = "Оба пробили защиту, но у победителя сила атаки выше.";
  } else {
    explanation = "Итог определён игровым сервером.";
  }

  const finite = value => typeof value === "number" && Number.isFinite(value) ? value : null;
  const stats = {
    A: { attack: finite(resolution.pressureA), defense: finite(resolution.defenseA) },
    B: { attack: finite(resolution.pressureB), defense: finite(resolution.defenseB) },
  };
  return { title, explanation, stats };
}

export function localDate(value) {
  const date = new Date(value);
  return Number.isFinite(date.valueOf())
    ? date.toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" })
    : "Неизвестно";
}
