// Chat04.1 public timeline shell. It is read-only until a messaging service is wired.
(() => {
  const panel = document.getElementById("generalChatPanel");
  if (!panel) return;

  const feed = panel.querySelector("[data-chat-feed]");
  const status = panel.querySelector("[data-chat-status]");
  const notice = panel.querySelector("[data-chat-notice]");
  const error = panel.querySelector("[data-chat-error]");
  const olderButton = panel.querySelector('[data-chat-action="older"]');
  const demoButton = panel.querySelector('[data-chat-action="demo"]');
  const errorButton = panel.querySelector('[data-chat-action="error"]');
  const pageStatus = panel.querySelector("[data-chat-page-status]");
  const modeButtons = Array.from(document.querySelectorAll("[data-chat-mode]"));
  const legacy = ["chatLog", "chatInputRow", "chatResizeHandle"]
    .map((id) => document.getElementById(id)).filter(Boolean);

  const FIXTURES = Object.freeze([
    ["text", "fixture-message-001", "Мира · тестовый игрок", "10:01", "Тестовое сообщение 01: привет, это синтетическая история.", 1001],
    ["system", "fixture-event-001", "Система · тестовые данные", "10:02", "Тестовое событие: открыта демонстрационная лента.", 1002],
    ["text", "fixture-message-002", "Кай · тестовый игрок", "10:03", "Тестовое сообщение 02: старые сообщения загружаются сверху.", 1003],
    ["text", "fixture-message-003", "Рин · тестовый игрок", "10:04", "Тестовое сообщение 03: порядок задан серверной публикацией в фикстуре.", 1004],
    ["system", "fixture-event-002", "Система · тестовые данные", "10:05", "Тестовый системный маркер: данные не доставлены другим игрокам.", 1005],
    ["text", "fixture-message-004", "Юна · тестовый игрок", "10:06", "Тестовое сообщение 04: каждое сообщение имеет свой messageId.", 1006],
    ["text", "fixture-message-005", "Алекс · тестовый игрок", "10:07", "Тестовое сообщение 05: тестовая история восстанавливается из встроенной фикстуры.", 1007],
    ["text", "fixture-message-006", "Сора · тестовый игрок", "10:08", "Тестовое сообщение 06.", 1008],
    ["system", "fixture-event-003", "Система · тестовые данные", "10:09", "Тестовый системный маркер: компактная запись в общей ленте.", 1009],
    ["text", "fixture-message-007", "Мира · тестовый игрок", "10:10", "Тестовое сообщение 07.", 1010],
    ["text", "fixture-message-008", "Кай · тестовый игрок", "10:11", "Тестовое сообщение 08.", 1011],
    ["text", "fixture-message-009", "Рин · тестовый игрок", "10:12", "Тестовое сообщение 09.", 1012],
    ["system", "fixture-event-004", "Система · тестовые данные", "10:13", "Тестовый системный маркер: хронология упорядочена.", 1013],
    ["text", "fixture-message-010", "Юна · тестовый игрок", "10:14", "Тестовое сообщение 10.", 1014],
    ["text", "fixture-message-011", "Алекс · тестовый игрок", "10:15", "Тестовое сообщение 11.", 1015],
    ["text", "fixture-message-012", "Сора · тестовый игрок", "10:16", "Тестовое сообщение 12.", 1016],
    ["system", "fixture-event-005", "Система · тестовые данные", "10:17", "Тестовый системный маркер: тестовая страница истории.", 1017],
    ["text", "fixture-message-013", "Мира · тестовый игрок", "10:18", "Тестовое сообщение 13.", 1018],
    ["text", "fixture-message-014", "Кай · тестовый игрок", "10:19", "Тестовое сообщение 14.", 1019],
    ["text", "fixture-message-015", "Рин · тестовый игрок", "10:20", "Тестовое сообщение 15.", 1020],
    ["system", "fixture-event-006", "Система · тестовые данные", "10:21", "Тестовый системный маркер: ни одна запись не создаёт серверный эффект.", 1021],
    ["text", "fixture-message-016", "Юна · тестовый игрок", "10:22", "Тестовое сообщение 16.", 1022],
    ["text", "fixture-message-017", "Алекс · тестовый игрок", "10:23", "Тестовое сообщение 17.", 1023],
    ["text", "fixture-message-018", "Сора · тестовый игрок", "10:24", "Тестовое сообщение 18: конец встроенной тестовой истории.", 1024],
  ].map(([kind, entityId, author, time, text, publishedOrder]) => Object.freeze({
    kind, entityId, author, time, text, publishedOrder, testData: true,
  })));

  const PAGE_SIZE = 8;
  const state = { demo: false, error: false, loading: false, start: Math.max(0, FIXTURES.length - PAGE_SIZE), visible: [] };
  const escapeText = (value) => String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[char]));

  const orderedFixtures = () => FIXTURES.slice().sort((a, b) =>
    a.publishedOrder - b.publishedOrder || a.entityId.localeCompare(b.entityId));

  const setMode = (mode) => {
    const publicMode = mode === "public";
    panel.hidden = !publicMode;
    legacy.forEach((node) => { node.hidden = publicMode; });
    modeButtons.forEach((button) => {
      const selected = button.dataset.chatMode === mode;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    if (publicMode) feed.focus({ preventScroll: true });
  };

  const render = ({ preserveScroll = false } = {}) => {
    error.hidden = !state.error;
    error.textContent = state.error
      ? "Не удалось показать тестовую историю. Это локальная демонстрационная ошибка; запрос к серверу не выполнялся."
      : "";
    notice.hidden = state.demo;
    status.textContent = state.demo
      ? "ДЕМО · встроенные тестовые данные · отправки и доставки нет"
      : "Сервер общего чата не подключён";
    status.dataset.mode = state.demo ? "demo" : "unavailable";
    demoButton.textContent = state.demo ? "Выключить демо" : "Показать фикстуры";
    errorButton.hidden = !state.demo;
    errorButton.textContent = state.error ? "Скрыть ошибку демо" : "Проверить ошибку демо";

    if (!state.demo) {
      feed.replaceChildren();
      feed.innerHTML = '<div class="generalChatEmpty"><strong>Общий чат пока недоступен</strong><span>После подключения messaging backend здесь появится авторизованная история.</span></div>';
      olderButton.disabled = true;
      olderButton.textContent = "История недоступна без backend";
      pageStatus.textContent = "";
      return;
    }

    const oldHeight = feed.scrollHeight;
    const oldTop = feed.scrollTop;
    state.visible = orderedFixtures().slice(state.start);
    feed.innerHTML = state.visible.map((item) => `
      <article class="generalChatMessage ${item.kind === "system" ? "isSystem" : ""}" data-kind="${item.kind}" data-entity-id="${escapeText(item.entityId)}" data-test-data="true">
        ${item.kind === "system" ? "" : `<div class="generalChatMessageMeta"><strong>${escapeText(item.author)}</strong><time>${escapeText(item.time)}</time></div>`}
        <div class="generalChatMessageText">${escapeText(item.text)}</div>
        <span class="generalChatTestBadge">ТЕСТОВЫЕ ДАННЫЕ</span>
      </article>`).join("");
    olderButton.disabled = state.start === 0 || state.loading;
    olderButton.textContent = state.loading ? "Подготовка тестовой страницы…" : (olderButton.disabled ? "Начало тестовой истории" : "Загрузить старые тестовые сообщения");
    pageStatus.textContent = `Показано ${state.visible.length} из ${FIXTURES.length} тестовых записей`;
    if (preserveScroll) feed.scrollTop = oldTop + Math.max(0, feed.scrollHeight - oldHeight);
    else feed.scrollTop = feed.scrollHeight;
  };

  modeButtons.forEach((button) => button.addEventListener("click", () => setMode(button.dataset.chatMode)));
  demoButton.addEventListener("click", () => {
    state.demo = !state.demo;
    state.error = false;
    state.loading = false;
    state.start = state.demo ? Math.max(0, FIXTURES.length - PAGE_SIZE) : 0;
    render();
  });
  errorButton.addEventListener("click", () => { state.error = !state.error; render({ preserveScroll: true }); });
  olderButton.addEventListener("click", () => {
    if (!state.demo || state.start === 0 || state.loading) return;
    state.loading = true;
    render({ preserveScroll: true });
    window.setTimeout(() => {
      state.start = Math.max(0, state.start - PAGE_SIZE);
      state.loading = false;
      render({ preserveScroll: true });
    }, 120);
  });

  const switchButtons = document.querySelectorAll("[data-chat-mode]");
  switchButtons.forEach((button, index) => button.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    switchButtons[(index + (event.key === "ArrowRight" ? 1 : switchButtons.length - 1)) % switchButtons.length].click();
    switchButtons[(index + (event.key === "ArrowRight" ? 1 : switchButtons.length - 1)) % switchButtons.length].focus();
  }));

  render();
  window.Game = window.Game || {};
  window.Game.UI = window.Game.UI || {};
  window.Game.UI.generalChat = Object.freeze({ setMode, render, getState: () => ({ ...state }) });
})();
