import { API_ORIGIN, API_ORIGIN_APPROVED } from "./config.mjs";
import { createIndexedDbStorage, makeTransport, sanitizeSelection, visibleBattleState } from "./client.mjs";

const $ = id => document.getElementById(id);
const storage = createIndexedDbStorage();
const transport = makeTransport({ apiOrigin: API_ORIGIN, originApproved: API_ORIGIN_APPROVED, storage });
const connectForm = $("connect-form");
const battleForm = $("commit-form");
const tokenInput = $("token");
const battleInput = $("battle-id");
const status = $("status");
let activeToken = null;
let activeBattleId = null;
let ownSelection = null;
let retryPendingMode = false;
let lastView = null;
let polling = null;

const messages = {
  CLIENT_NOT_CONFIGURED: "Подключение закрыто: точный утверждённый API origin не настроен.",
  INVALID_BATTLE_ID: "Проверьте ID боя.",
  INVALID_TOKEN: "Проверьте свой ключ участника.",
  CAPABILITY_REJECTED: "Ключ недействителен, отозван или не имеет доступа к этому бою.",
  NETWORK_UNCERTAIN: "Связь прервалась. Если отправлялся ход, повторите исходную команду.",
  COMMAND_CONFLICT: "Сервер не принял повтор команды. Сохраните экран и обратитесь к владельцу.",
  PENDING_COMMAND_EXISTS: "Есть неподтверждённый ход. Повторите его с прежним номером команды.",
  STORAGE_UNAVAILABLE: "Локальное хранилище Safari недоступно; отправка не начата.",
};

function show(codeOrText) {
  status.textContent = messages[codeOrText] || codeOrText;
}

function display(view) {
  lastView = view;
  const state = visibleBattleState(view, ownSelection);
  $("battle").hidden = false;
  $("own-state").textContent = state.selfCommitted
    ? `Ваш статус: ход подтверждён${state.ownSelection ? ` (${state.ownSelection.attackType}/${state.ownSelection.defenseType})` : ""}.`
    : "Ваш статус: ход ещё не подтверждён.";
  $("opponent-state").textContent = state.opponentCommitted
    ? "Соперник уже подтвердил ход. Его выбор пока скрыт сервером."
    : "Ожидание хода соперника.";
  $("result").hidden = !state.result;
  if (state.result) {
    const result = state.result;
    $("result").textContent = `Результат: ${result.mechanicalOutcome || "раскрыт"}. ` +
      `Атаки раскрыты: ${result.selections.A.attackType}/${result.selections.B.attackType}. ` +
      `Исход: ${result.recognizedOutcome || result.socialOutcome || "определяется сервером"}.`;
  }
  battleForm.hidden = (state.selfCommitted || Boolean(state.result)) && !retryPendingMode;
  for (const field of battleForm.querySelectorAll("select,input")) {
    field.disabled = retryPendingMode || state.selfCommitted || Boolean(state.result);
    if (ownSelection && retryPendingMode) field.value = ownSelection[field.name];
  }
  $("commit-button").textContent = retryPendingMode ? "Повторить исходную команду" : "Подтвердить скрытый ход";
}

async function refresh() {
  if (!activeBattleId || !activeToken) return;
  try {
    const view = await transport.connect(activeBattleId, activeToken);
    display(view);
    show("Состояние обновлено с сервера.");
  } catch (error) { show(error.message); }
}

connectForm.addEventListener("submit", async event => {
  event.preventDefault();
  if (!transport.ready) return show("CLIENT_NOT_CONFIGURED");
  const battleId = battleInput.value.trim();
  const token = tokenInput.value.trim();
  try {
    const view = await transport.connect(battleId, token);
    activeBattleId = battleId;
    activeToken = token;
    const pending = await storage.getPending(battleId, token);
    ownSelection = pending?.selection || null;
    retryPendingMode = Boolean(pending);
    display(view);
    $("remember").disabled = false;
    show("Подключено. Токен остаётся только в памяти до отдельного согласия на сохранение.");
    if (polling) clearInterval(polling);
    polling = setInterval(refresh, 8000);
  } catch (error) { activeToken = null; show(error.message); }
});

$("remember").addEventListener("click", async () => {
  if (!activeToken || !activeBattleId) return;
  try {
    await storage.saveToken(activeToken, activeBattleId);
    show("Ваш ключ сохранён на этом устройстве по вашему согласию.");
  } catch (error) { show(error.message); }
});

battleForm.addEventListener("submit", async event => {
  event.preventDefault();
  if (!activeToken || !activeBattleId) return show("Сначала подключитесь к бою.");
  let selection = ownSelection;
  if (!retryPendingMode) {
    const data = new FormData(battleForm);
    try { selection = sanitizeSelection(Object.fromEntries(data.entries())); }
    catch { return show("Проверьте параметры хода."); }
  }
  const button = $("commit-button");
  button.disabled = true;
  try {
    let response;
    if (retryPendingMode) {
      response = await transport.retryPending(activeBattleId, activeToken);
    } else {
      const pending = await transport.prepareCommit(activeBattleId, activeToken, selection);
      ownSelection = pending.selection;
      retryPendingMode = true;
      if (lastView) display(lastView);
      response = await transport.sendPending(activeBattleId, activeToken, pending);
    }
    ownSelection = ownSelection || selection;
    retryPendingMode = false;
    display(response.view);
    show("Ход принят. Чужой выбор останется скрытым до серверного раскрытия.");
  } catch (error) {
    if (retryPendingMode && lastView) display(lastView);
    show(error.message === "NETWORK_UNCERTAIN" || error.message === "COMMIT_ACKNOWLEDGED_PENDING_RETAINED"
      ? "Связь или локальное подтверждение прервались. Исходный выбор и номер команды сохранены; повторите эту же команду."
      : error.message);
    button.disabled = false;
  }
});

$("forget").addEventListener("click", async () => {
  if (polling) clearInterval(polling);
  polling = null;
  activeToken = null;
  activeBattleId = null;
  ownSelection = null;
  retryPendingMode = false;
  lastView = null;
  tokenInput.value = "";
  battleInput.value = "";
  $("battle").hidden = true;
  $("remember").disabled = true;
  try { await storage.forget(); show("Локально сохранённый ключ удалён. Номер незавершённой команды сохранён для безопасного повтора. Серверный ключ не отозван."); }
  catch { show("Память страницы очищена, но удалить запись из IndexedDB не удалось. Повторите операцию в настройках браузера."); }
});

if (!transport.ready) {
  connectForm.querySelectorAll("input,button").forEach(element => { element.disabled = true; });
  show("CLIENT_NOT_CONFIGURED");
} else {
  (async () => {
    try {
      const saved = await storage.getCredential?.();
      if (saved?.token && saved.battleId) {
        activeToken = saved.token;
        activeBattleId = saved.battleId;
        battleInput.value = saved.battleId;
        tokenInput.value = saved.token;
        const view = await transport.connect(saved.battleId, saved.token);
        const pending = await storage.getPending(saved.battleId, saved.token);
        ownSelection = pending?.selection || null;
        retryPendingMode = Boolean(pending);
        display(view);
        show("Вы восстановили сохранённый ключ этого устройства.");
        polling = setInterval(refresh, 8000);
      }
    } catch (error) { activeToken = null; show(error.message); }
  })();
}
