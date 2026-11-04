// Чат 04.6: самостоятельный каталог и панель выбора.
// Не подключать к общему редактору сообщений без одобренной серверной доставки.
const RECORDS = [
  ["046-0001", "Блик", "О, свои!", "Блик_01_Привет.png", "Блик широко улыбается и показывает на собеседника, рядом выглядывает чёрный кот."],
  ["046-0002", "Блик", "АХАХА!", "Блик_02_Смех.png", "Блик хохочет с зажмуренными глазами и показывает два больших пальца."],
  ["046-0003", "Блик", "Фигасе!", "Блик_03_Удивление.png", "Блик удивлённо таращит глаза, открывает рот и вскидывает руки."],
  ["046-0004", "Искра", "Ага, щас!", "Искра_01_Дразнит.png", "Искра вызывающе усмехается с пузырём жвачки и показывает средний палец."],
  ["046-0005", "Искра", "ДААА!", "Искра_02_Победа.png", "Искра ликует и радостно поднимает оба кулака."],
  ["046-0006", "Искра", "Ну привет...", "Искра_03_Флирт.png", "Искра хитро улыбается, положив подбородок на руку; рядом сердечки."],
  ["046-0007", "Штиль", "Да и ладно.", "Штиль_01_Чай.png", "Штиль невозмутимо держит кружку с изображением кота."],
  ["046-0008", "Штиль", "Мой дзен.", "Штиль_02_Кот.png", "Штиль бережно обнимает чёрного кота и слегка улыбается."],
  ["046-0009", "Штиль", "Кайф.", "Штиль_03_Музыка.png", "Штиль спокойно слушает музыку, подперев щёку рукой."],
  ["046-0010", "Эхо", "Для тебя.", "Эхо_01_Сердечко.png", "Эхо задумчиво подпирает щёку; рядом сердечко и чёрный кот."],
  ["046-0011", "Эхо", "Иди обниму.", "Эхо_02_Обнимает.png", "Эхо с закрытыми глазами нежно обнимает чёрного кота, вокруг сердечки."],
  ["046-0012", "Эхо", "Я в домике.", "Эхо_03_Уют.png", "Эхо уютно укрылась в капюшоне рядом с чёрным котом."]
];
export const STICKERS = Object.freeze(RECORDS.map(([id, character, title, filename, alt]) =>
  Object.freeze({ id, character, title, filename, alt })
));
const BY_ID = new Map(STICKERS.map(sticker => [sticker.id, sticker]));

export function stickerById(id) {
  return BY_ID.get(id) || null;
}

// Для будущего POST /v1/messages: передавать только ID, не текст, имя автора или награды.
// Сервер обязан отдельно проверить личность, адресата, права и допустимость ID.
export function stickerPayload(id) {
  if (!BY_ID.has(id)) throw new RangeError("Неизвестный стикер");
  return { stickerId: id };
}

// Изолированная панель: не меняет Game.UI, не пишет в историю и не вызывает игровые события.
// canSend=false по умолчанию. Передача разрешается только после появления реальной доставки.
export function createStickerPicker({ mount, assetBase = "", canSend = false, onSend } = {}) {
  if (!mount || typeof mount.attachShadow !== "function" || mount.shadowRoot) {
    throw new TypeError("Нужен свободный контейнер для панели");
  }
  const shadow = mount.attachShadow({ mode: "open" });
  const documentRef = mount.ownerDocument;
  const element = (tag, className, text) => {
    const node = documentRef.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const style = element("style");
  style.textContent = `
    :host{display:block;color:#f1f2f5;font:15px/1.4 system-ui,sans-serif}
    *{box-sizing:border-box}button,input{font:inherit}button{cursor:pointer}
    button:focus-visible,input:focus-visible{outline:3px solid #f1ca54;outline-offset:2px}
    .panel{background:#171923;border:1px solid #434755;border-radius:16px;padding:14px}
    .heading{font-size:20px;font-weight:750;margin:0 0 10px}
    .filters{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}
    .filters button{background:#292d39;border:1px solid #545968;color:inherit;border-radius:10px;padding:9px}
    .filters button[aria-pressed=true]{background:#665425;border-color:#edc85c}
    .search{width:100%;padding:10px;background:#232733;border:1px solid #686c77;border-radius:10px;color:inherit}
    .status{min-height:1.5em;color:#ccc;font-size:13px;margin:8px 0}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(135px,1fr));gap:10px}
    .card{border:1px solid #414653;border-radius:12px;padding:9px;background:#242833;min-width:0}
    .art{display:grid;place-items:center;min-height:112px;background:#323746;border-radius:8px}
    .art img{height:112px;width:112px;object-fit:contain}
    .art span{padding:12px;text-align:center;font-size:13px;color:#ddd}
    .name{margin:7px 0 4px;font-weight:700}
    .character{font-size:12px;color:#c3c7d2}
    .actions{display:flex;gap:5px;margin-top:7px;flex-wrap:wrap}
    .actions button{border:1px solid #606878;background:#383d4b;color:inherit;border-radius:8px;padding:7px;flex:1}
    .actions button:disabled{opacity:.5;cursor:not-allowed}
    @media(max-width:370px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
  `;
  shadow.append(style);
  const panel = element("section", "panel");
  const heading = element("h2", "heading", "Стикеры");
  panel.append(heading);
  const search = element("input", "search");
  search.type = "search";
  search.placeholder = "Найти стикер";
  search.setAttribute("aria-label", "Поиск по стикерам");
  panel.append(search);
  const filters = element("div", "filters");
  panel.append(filters);
  const status = element("p", "status");
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  panel.append(status);
  const grid = element("div", "grid");
  panel.append(grid);
  shadow.append(panel);
  const recent = [];
  const favorites = new Set();
  const tabs = [["all", "Все"], ["recent", "Недавние"], ["favorites", "Избранные"]];
  let tab = "all";
  const transportReady = canSend === true && typeof onSend === "function";
  const imagesAvailable = assetBase.trim().length > 0;
  const showStatus = (message) => { status.textContent = message; };
  if (!transportReady) showStatus("Просмотр набора. Отправка пока недоступна.");
  else if (!imagesAvailable) showStatus("Изображения не опубликованы. Отправка пока не выполняется.");
  const safeToSend = transportReady && imagesAvailable;
  function render() {
    filters.replaceChildren();
    for (const [id, label] of tabs) {
      const button = element("button", "", label);
      button.type = "button";
      button.setAttribute("aria-pressed", String(tab === id));
      button.addEventListener("click", () => { tab = id; render(); });
      filters.append(button);
    }
    grid.replaceChildren();
    const query = search.value.trim().toLocaleLowerCase("ru");
    const source = tab === "recent" ? recent.map(id => BY_ID.get(id)).filter(Boolean)
      : tab === "favorites" ? STICKERS.filter(s => favorites.has(s.id)) : STICKERS;
    const list = source.filter(s => [s.character, s.title, s.alt, s.filename].join(" ").toLocaleLowerCase("ru").includes(query));
    if (!list.length) {
      grid.append(element("p", "", "Ничего не найдено."));
      return;
    }
    for (const sticker of list) {
      const card = element("article", "card");
      const art = element("div", "art");
      const placeholder = element("span", "", sticker.title);
      art.append(placeholder);
      if (imagesAvailable) {
        const image = element("img");
        image.alt = sticker.alt;
        image.loading = "lazy";
        image.decoding = "async";
        image.addEventListener("load", () => { placeholder.hidden = true; });
        image.addEventListener("error", () => { image.remove(); placeholder.hidden = false; });
        image.src = assetBase.replace(/\/$/, "") + "/" + encodeURIComponent(sticker.filename);
        art.append(image);
      }
      card.append(art);
      card.append(element("div", "name", sticker.title));
      card.append(element("div", "character", sticker.character));
      const actions = element("div", "actions");
      const favorite = element("button", "", favorites.has(sticker.id) ? "Убрать из избранного" : "В избранное");
      favorite.type = "button";
      favorite.setAttribute("aria-pressed", String(favorites.has(sticker.id)));
      favorite.addEventListener("click", () => {
        if (favorites.has(sticker.id)) favorites.delete(sticker.id);
        else favorites.add(sticker.id);
        render();
      });
      actions.append(favorite);
      const send = element("button", "", "Отправить");
      send.type = "button";
      send.disabled = !safeToSend;
      send.title = safeToSend ? "Отправить стикер" : "Отправка пока недоступна";
      send.addEventListener("click", async () => {
        if (!safeToSend || send.disabled) return;
        send.disabled = true;
        try {
          await onSend(stickerPayload(sticker.id));
          const previous = recent.indexOf(sticker.id);
          if (previous !== -1) recent.splice(previous, 1);
          recent.unshift(sticker.id);
          if (recent.length > 12) recent.length = 12;
          showStatus("Стикер отправлен.");
        } catch {
          showStatus("Не удалось отправить. Проверьте соединение.");
        } finally {
          send.disabled = false;
        }
      });
      actions.append(send);
      card.append(actions);
      grid.append(card);
    }
  }
  search.addEventListener("input", render);
  render();
  return Object.freeze({
    getFavorites: () => [...favorites],
    getRecent: () => [...recent],
    destroy: () => { shadow.replaceChildren(); }
  });
}
