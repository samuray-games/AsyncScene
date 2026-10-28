import { API_ORIGIN, API_ORIGIN_APPROVED } from "./config.mjs";
import { createIndexedDbStorage, makeTransport, sanitizeSelection, visibleBattleState } from "./client.mjs";

export function createRemoteClientApp({
  document: doc,
  storage,
  transport,
  FormDataImpl = globalThis.FormData,
  setIntervalImpl = globalThis.setInterval,
  clearIntervalImpl = globalThis.clearInterval,
}) {
  if (!doc || !storage || !transport) throw new Error("APP_DEPENDENCIES_REQUIRED");

  const $ = id => doc.getElementById(id);
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
  let sessionEpoch = 0;
  let viewRequestEpoch = 0;
  let highestViewVersion = -1;
  let commitInFlight = false;
  let credentialMutations = Promise.resolve();

  const messages = {
    CLIENT_NOT_CONFIGURED: "Подключение закрыто: точный утверждённый API origin не настроен.",
    INVALID_BATTLE_ID: "Проверьте ID боя.",
    INVALID_TOKEN: "Проверьте свой ключ участника.",
    CAPABILITY_REJECTED: "Ключ недействителен, отозван или не имеет доступа к этому бою.",
    NETWORK_UNCERTAIN: "Связь прервалась. Если отправлялся ход, повторите исходную команду.",
    COMMAND_CONFLICT: "Сервер не принял повтор команды. Сохраните экран и обратитесь к владельцу.",
    PENDING_COMMAND_EXISTS: "Есть неподтверждённый ход. Повторите его с прежним номером команды.",
    STORAGE_UNAVAILABLE: "Локальное хранилище Safari недоступно; отправка не начата.",
    BATTLE_EXPIRED: "Срок боя истёк. Проверяю авторитетное состояние, чтобы закрыть неподтверждённый ход безопасно.",
    BATTLE_FINAL: "Бой завершён. Проверяю авторитетное состояние команды.",
    COMMITS_CLOSED: "Сервер закрыл приём ходов. Проверяю авторитетное состояние команды.",
    COMMIT_ALREADY_ACCEPTED: "Сервер уже подтвердил ваш ход в другой вкладке. Сверяю своё состояние.",
  };

  function show(codeOrText) {
    status.textContent = messages[codeOrText] || codeOrText;
  }

  function isCurrent(epoch) {
    return epoch === sessionEpoch;
  }

  function isCurrentSession(epoch, token, battleId) {
    return isCurrent(epoch) && activeToken === token && activeBattleId === battleId;
  }

  function stopPolling() {
    if (polling !== null) clearIntervalImpl(polling);
    polling = null;
  }

  function clearSessionUi({ clearInputs = false } = {}) {
    activeToken = null;
    activeBattleId = null;
    ownSelection = null;
    retryPendingMode = false;
    lastView = null;
    commitInFlight = false;
    stopPolling();
    $("battle").hidden = true;
    $("own-state").textContent = "";
    $("opponent-state").textContent = "";
    $("result").textContent = "";
    $("result").hidden = true;
    $("remember").disabled = true;
    $("commit-button").disabled = false;
    if (clearInputs) {
      tokenInput.value = "";
      battleInput.value = "";
    }
  }

  function invalidateSession(options) {
    sessionEpoch += 1;
    viewRequestEpoch += 1;
    highestViewVersion = -1;
    clearSessionUi(options);
    return sessionEpoch;
  }

  function queueCredentialMutation(operation) {
    const next = credentialMutations.then(operation, operation);
    credentialMutations = next.catch(() => {});
    return next;
  }

  function display(view) {
    if (Number.isSafeInteger(view?.version)) highestViewVersion = Math.max(highestViewVersion, view.version);
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
    const terminal = ["expired", "final"].includes(state.phase);
    battleForm.hidden = (state.selfCommitted || Boolean(state.result) || terminal) &&
      !(retryPendingMode && state.selfCommitted);
    for (const field of battleForm.querySelectorAll("select,input")) {
      field.disabled = retryPendingMode || state.selfCommitted || Boolean(state.result) || terminal;
      if (ownSelection && retryPendingMode) field.value = ownSelection[field.name];
    }
    $("commit-button").disabled = commitInFlight;
    $("commit-button").textContent = retryPendingMode ? "Повторить исходную команду" : "Подтвердить скрытый ход";
  }

  async function discardUncommittedTerminalPending(view, token, battleId, pending, isCurrent) {
    if (!pending || !["expired", "final"].includes(view.phase) || view.selfCommitted) return pending;
    if (storage.clearPendingIfCommand) {
      await storage.clearPendingIfCommand(battleId, token, pending.commandId, isCurrent);
    } else {
      await storage.clearPending(battleId, token);
    }
    return null;
  }

  async function refresh(epoch = sessionEpoch, token = activeToken, battleId = activeBattleId) {
    if (!token || !battleId || !isCurrentSession(epoch, token, battleId)) return;
    const requestEpoch = ++viewRequestEpoch;
    try {
      const view = await transport.connect(battleId, token);
      if (!isCurrentSession(epoch, token, battleId) || requestEpoch !== viewRequestEpoch ||
          (Number.isSafeInteger(view.version) && view.version < highestViewVersion)) return;
      if (retryPendingMode && ["expired", "final"].includes(view.phase) && !view.selfCommitted) {
        const pending = await storage.getPending(battleId, token);
        if (!isCurrentSession(epoch, token, battleId) || requestEpoch !== viewRequestEpoch) return;
        if (pending) {
          if (storage.clearPendingIfCommand) await storage.clearPendingIfCommand(battleId, token, pending.commandId, () => isCurrentSession(epoch, token, battleId));
          else await storage.clearPending(battleId, token);
          if (!isCurrentSession(epoch, token, battleId) || requestEpoch !== viewRequestEpoch) return;
        }
        retryPendingMode = false;
        ownSelection = null;
      }
      display(view);
      show("Состояние обновлено с сервера.");
    } catch (error) {
      if (isCurrentSession(epoch, token, battleId)) show(error.message);
    }
  }

  function startPolling(epoch, token, battleId) {
    stopPolling();
    polling = setIntervalImpl(() => refresh(epoch, token, battleId), 8000);
  }

  async function restoreRememberedSession() {
    const epoch = sessionEpoch;
    try {
      const saved = await storage.getCredential?.();
      if (!isCurrent(epoch) || !saved?.token || !saved.battleId) return;

      const view = await transport.connect(saved.battleId, saved.token);
      if (!isCurrent(epoch)) return;
      let pending = await storage.getPending(saved.battleId, saved.token);
      if (!isCurrent(epoch)) return;
      pending = await discardUncommittedTerminalPending(view, saved.token, saved.battleId, pending, () => isCurrent(epoch));
      if (!isCurrent(epoch)) return;

      activeToken = saved.token;
      activeBattleId = saved.battleId;
      tokenInput.value = saved.token;
      battleInput.value = saved.battleId;
      ownSelection = pending?.selection || null;
      retryPendingMode = Boolean(pending);
      highestViewVersion = Number.isSafeInteger(view.version) ? view.version : -1;
      display(view);
      show("Вы восстановили сохранённый ключ этого устройства.");
      startPolling(epoch, saved.token, saved.battleId);
    } catch (error) {
      if (!isCurrent(epoch)) return;
      show(error.message);
    }
  }

  connectForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (!transport.ready) return show("CLIENT_NOT_CONFIGURED");
    const battleId = battleInput.value.trim();
    const token = tokenInput.value.trim();
    const epoch = invalidateSession();
    viewRequestEpoch += 1;
    highestViewVersion = -1;
    try {
      const view = await transport.connect(battleId, token);
      if (!isCurrent(epoch)) return;
      let pending = await storage.getPending(battleId, token);
      if (!isCurrent(epoch)) return;
      pending = await discardUncommittedTerminalPending(view, token, battleId, pending, () => isCurrent(epoch));
      if (!isCurrent(epoch)) return;

      activeBattleId = battleId;
      activeToken = token;
      ownSelection = pending?.selection || null;
      retryPendingMode = Boolean(pending);
      highestViewVersion = Number.isSafeInteger(view.version) ? view.version : -1;
      display(view);
      $("remember").disabled = false;
      show("Подключено. Токен остаётся только в памяти до отдельного согласия на сохранение.");
      startPolling(epoch, token, battleId);
    } catch (error) {
      if (!isCurrent(epoch)) return;
      activeToken = null;
      activeBattleId = null;
      show(error.message);
    }
  });

  $("remember").addEventListener("click", async () => {
    const epoch = sessionEpoch;
    const token = activeToken;
    const battleId = activeBattleId;
    if (!token || !battleId || !isCurrentSession(epoch, token, battleId)) return;
    const isCurrentRemember = () => isCurrentSession(epoch, token, battleId);
    try {
      await queueCredentialMutation(() => {
        if (!isCurrentRemember()) throw new Error("SESSION_EXPIRED");
        return storage.saveToken(token, battleId, isCurrentRemember);
      });
      if (!isCurrentRemember()) return;
      show("Ваш ключ сохранён на этом устройстве по вашему согласию.");
    } catch (error) {
      if (isCurrentRemember()) show(error.message);
    }
  });

  battleForm.addEventListener("submit", async event => {
    event.preventDefault();
    const epoch = sessionEpoch;
    const token = activeToken;
    const battleId = activeBattleId;
    const isCurrentCommit = () => isCurrentSession(epoch, token, battleId);
    if (!token || !battleId || !isCurrentCommit()) return show("Сначала подключитесь к бою.");
    let selection = ownSelection;
    if (!retryPendingMode) {
      const data = new FormDataImpl(battleForm);
      try { selection = sanitizeSelection(Object.fromEntries(data.entries())); }
      catch { return show("Проверьте параметры хода."); }
    }
    const button = $("commit-button");
    let submittedPending = null;
    commitInFlight = true;
    button.disabled = true;
    try {
      let response;
      if (retryPendingMode) {
        submittedPending = await storage.getPending(battleId, token);
        if (!isCurrentCommit()) return;
        if (!submittedPending) throw new Error("NO_PENDING_COMMAND");
        response = await transport.sendPending(battleId, token, submittedPending, { isCurrent: isCurrentCommit });
      } else {
        const pending = await transport.prepareCommit(battleId, token, selection, { isCurrent: isCurrentCommit });
        if (!isCurrentCommit()) return;
        submittedPending = pending;
        ownSelection = pending.selection;
        retryPendingMode = true;
        if (lastView) display(lastView);
        response = await transport.sendPending(battleId, token, pending, { isCurrent: isCurrentCommit });
      }
      if (!isCurrentCommit()) return;
      ownSelection = ownSelection || selection;
      const state = visibleBattleState(response.view, ownSelection);
      if (["expired", "final"].includes(state.phase) && !state.selfCommitted) {
        retryPendingMode = false;
        ownSelection = null;
        display(response.view);
        show("Срок хода завершён. Сервер не принял команду; исходная запись очищена после подтверждённого состояния.");
        return;
      }
      if (!state.selfCommitted) throw new Error("COMMIT_ACKNOWLEDGED_PENDING_RETAINED");
      retryPendingMode = false;
      viewRequestEpoch += 1;
      display(response.view);
      show("Ход принят. Чужой выбор останется скрытым до серверного раскрытия.");
    } catch (error) {
      if (!isCurrentCommit()) return;
      if (error.message === "COMMIT_ALREADY_ACCEPTED") {
        try {
          const view = await transport.connect(battleId, token);
          if (!isCurrentCommit()) return;
          if (view.selfCommitted && submittedPending) {
            const pending = await storage.getPending(battleId, token);
            if (!isCurrentCommit()) return;
            if (pending?.commandId === submittedPending.commandId) {
              if (storage.clearPendingIfCommand) await storage.clearPendingIfCommand(
                battleId, token, submittedPending.commandId, isCurrentCommit);
              else await storage.clearPending(battleId, token);
              if (!isCurrentCommit()) return;
            } else if (pending) {
              retryPendingMode = true;
              ownSelection = null;
              viewRequestEpoch += 1;
              display(view);
              show("Сервер уже подтвердил другой ход. Другая неподтверждённая команда сохранена с прежним номером для сверки.");
              return;
            }
            retryPendingMode = false;
            ownSelection = null;
            viewRequestEpoch += 1;
            display(view);
            show("Сервер подтвердил ход этого участника ранее. Отклонённая команда этой вкладки удалена; чужой ход остаётся скрытым до разрешённого раскрытия.");
            return;
          }
        } catch {
          if (!isCurrentCommit()) return;
        }
        if (retryPendingMode && lastView) display(lastView);
        show("Сервер сообщил о ранее подтверждённом ходе, но безопасный readback пока недоступен. Исходная команда сохранена.");
        return;
      }
      if (["BATTLE_EXPIRED", "BATTLE_FINAL", "COMMITS_CLOSED"].includes(error.message)) {
        await refresh(epoch, token, battleId);
        if (isCurrentCommit()) show(messages[error.message]);
        return;
      }
      if (retryPendingMode && lastView) display(lastView);
      show(error.message === "NETWORK_UNCERTAIN" || error.message === "COMMIT_ACKNOWLEDGED_PENDING_RETAINED"
        ? "Связь или локальное подтверждение прервались. Исходный выбор и номер команды сохранены; повторите эту же команду."
        : error.message);
    } finally {
      if (isCurrentCommit()) {
        commitInFlight = false;
        button.disabled = false;
      }
    }
  });

  $("forget").addEventListener("click", async () => {
    const forgetEpoch = invalidateSession({ clearInputs: true });
    show("Сессия закрыта. Удаляю локально сохранённый ключ...");
    try {
      await queueCredentialMutation(() => storage.forget());
      if (isCurrent(forgetEpoch)) {
        show("Локально сохранённый ключ удалён. Номер незавершённой команды сохранён для безопасного повтора. Серверный ключ не отозван.");
      }
    } catch {
      if (isCurrent(forgetEpoch)) show("Память страницы очищена, но удалить запись из IndexedDB не удалось. Повторите операцию в настройках браузера.");
    }
  });

  if (!transport.ready) {
    connectForm.querySelectorAll("input,button").forEach(element => { element.disabled = true; });
    show("CLIENT_NOT_CONFIGURED");
  }

  const restorePromise = transport.ready ? restoreRememberedSession() : Promise.resolve();
  return { restorePromise, refresh };
}

if (globalThis.document) {
  const storage = createIndexedDbStorage();
  const transport = makeTransport({ apiOrigin: API_ORIGIN, originApproved: API_ORIGIN_APPROVED, storage });
  createRemoteClientApp({ document: globalThis.document, storage, transport });
}
