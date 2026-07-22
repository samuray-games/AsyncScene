// Stage 6 final visual tone separation repair v2.
// Presentation-only: fixes visible profile routing without changing gameplay/state/economy.
// Preserves the accepted PR #245 Alpha frozen-copy keys exactly.
window.Game = window.Game || {};

(function installStage6VisualToneRepairV2() {
  const Game = window.Game;
  const Data = Game.Data;
  const UI = Game.UI;
  const System = Game.System;

  if (!Data || !UI || !System) {
    console.error("STAGE6_VISUAL_TONE_REPAIR_V2_INSTALL_FAILED", {
      hasData: !!Data,
      hasUI: !!UI,
      hasSystem: !!System
    });
    return;
  }

  Game.__DEV = Game.__DEV || {};
  if (Game.__DEV.__stage6VisualToneRepairV2Installed) return;

  const BUILD_TAG = "build_2026_07_22_stage6_final_visual_tone_repair_v2";
  const SMOKE_VERSION = "stage6_final_visual_tone_repair_v20260722_002";
  const PROFILE_KEYS = Object.freeze(["millennial", "zoomer", "alpha", "boomer"]);

  const CONTROL_COPY = Object.freeze({
    millennial: Object.freeze({
      chatPlaceholder: "Напиши сообщение.",
      chatSend: "Отправить",
      dmPlaceholder: "Напиши в личку.",
      dmSend: "Отправить",
      dmHeader: "Личка",
      battlesHeader: "Баттлы",
      menu: "Меню",
      attackBadge: "Аргумент",
      defenseBadge: "Ответ",
      dismiss: "Отойти",
      escape: "Уйти"
    }),
    zoomer: Object.freeze({
      chatPlaceholder: "Пиши по теме.",
      chatSend: "Заслать",
      dmPlaceholder: "Пиши в личку.",
      dmSend: "Заслать",
      dmHeader: "Личка",
      battlesHeader: "Баттлы",
      menu: "Меню",
      attackBadge: "Вброс",
      defenseBadge: "Ответка",
      dismiss: "Отвали",
      escape: "Свалить"
    }),
    alpha: Object.freeze({
      chatPlaceholder: "Сообщение",
      chatSend: "Отправить",
      dmPlaceholder: "Личное сообщение",
      dmSend: "Отправить",
      dmHeader: "Личка",
      battlesHeader: "Бои",
      menu: "Меню",
      attackBadge: "Аргумент",
      defenseBadge: "Ответ",
      dismiss: "Стоп",
      escape: "Уйти"
    }),
    boomer: Object.freeze({
      chatPlaceholder: "Введите сообщение.",
      chatSend: "Отправить",
      dmPlaceholder: "Введите личное сообщение.",
      dmSend: "Отправить",
      dmHeader: "Сообщения",
      battlesHeader: "Конфликты",
      menu: "Меню",
      attackBadge: "Аргумент",
      defenseBadge: "Ответ",
      dismiss: "Отказаться",
      escape: "Выйти"
    })
  });

  // Only inherited/shared visible keys are realigned here.
  // Alpha frozen keys from PR #245 are intentionally NOT listed:
  // escape_button_label, teach_sent_dm, teach_sent_chat, invite_open_hint, invite_invalid.
  const TEXT_OVERRIDES = Object.freeze({
    millennial: Object.freeze({
      escape_button_label: "Уйти −{X} 💰",
      events_header: "События",
      events_title: "События ({count})",
      battle_invite_title: "Вызов",
      battle_action_accept: "Принять",
      battle_action_decline: "Отклонить",
      battle_action_attack: "Атаковать",
      battle_action_rematch: "Реванш",
      battle_action_report: "Пожаловаться",
      dm_empty: "Пока пусто.",
      dm_action_unavailable: "Недоступно."
    }),
    zoomer: Object.freeze({
      escape_button_label: "Свалить −{X} 💰",
      events_header: "Движ",
      events_title: "Движ ({count})",
      battle_invite_title: "Залёт",
      battle_action_accept: "Вписаться",
      battle_action_decline: "Скипнуть",
      battle_action_attack: "Влететь",
      battle_action_rematch: "Ещё раунд",
      battle_action_report: "Сдать копу",
      dm_empty: "Личка молчит.",
      dm_action_unavailable: "Пока закрыто."
    }),
    alpha: Object.freeze({
      tie_start: "Голосование",
      tie_call_to_action: "Выбрать",
      tie_click_name_hint: "Имя",
      vote_ok: "Голос учтён",
      vote_already: "Уже",
      vote_fail: "Недоступно",
      events_header: "События",
      events_title: "События {count}",
      events_empty: "Нет событий.",
      events_panel_hint: "Последние события.",
      battles_empty: "Нет боёв.",
      battle_invite_title: "Бой",
      battle_action_accept: "Принять",
      battle_action_decline: "Отказ",
      battle_action_attack: "Атака",
      battle_action_rematch: "Ещё",
      battle_action_report: "Сообщить",
      dm_empty: "Нет сообщений.",
      dm_action_unavailable: "Недоступно.",
      battle_energy_locked_hint: "Нужно ⚡{energy}",
      events_close_extra: "Свернуть",
      events_clear_all: "Очистить",
      events_clear: "Очистить",
      events_done: "Готово",
      events_left: "{sec} сек",
      menu_title: "Меню",
      return_to_start: "На старт",
      menu_unavailable: "Недоступно.",
      goal_label: "Цель"
    }),
    boomer: Object.freeze({
      escape_button_label: "Выйти −{X} 💰",
      events_header: "События",
      events_title: "События: {count}",
      battle_invite_title: "Вызов",
      battle_action_accept: "Принять",
      battle_action_decline: "Отказаться",
      battle_action_attack: "Атаковать",
      battle_action_rematch: "Реванш",
      battle_action_report: "Сообщить",
      dm_empty: "Сообщений пока нет.",
      dm_action_unavailable: "Действие недоступно."
    })
  });

  // These are only routes that leak shared slang/ambiguous copy for non-Alpha profiles.
  // Alpha is deliberately left to the accepted frozen-copy routing already in system.js.
  const SYSTEM_ROUTE_OVERRIDES = Object.freeze({
    millennial: Object.freeze({
      "warnings.escapeNeedsPoints": "Не хватает 💰, чтобы уйти.",
      "notifications.escapePaid": "Уход: −1 💰.",
      "notifications.escapeVoteCost": "Уход: −{escapeCost} 💰.",
      "notifications.trainingSent": "Аргумент передан: {teacher} → {student}."
    }),
    zoomer: Object.freeze({
      "warnings.escapeNeedsPoints": "Мало 💰, чтобы свалить.",
      "notifications.escapePaid": "Свалил: −1 💰.",
      "notifications.escapeVoteCost": "Свалить: −{escapeCost} 💰.",
      "notifications.trainingSent": "Аргумент залетел: {teacher} → {student}."
    }),
    alpha: Object.freeze({}),
    boomer: Object.freeze({
      "warnings.escapeNeedsPoints": "Недостаточно 💰, чтобы выйти.",
      "notifications.escapePaid": "Выход: −1 💰.",
      "notifications.escapeVoteCost": "Выход: −{escapeCost} 💰.",
      "notifications.trainingSent": "Аргумент передан: {teacher} → {student}."
    })
  });

  const ALPHA_FROZEN_EXPECTED = Object.freeze({
    escape_button_label: "Уйти: −{X}💰",
    teach_sent_dm: "{student}: {arg}. -{cost}💰.",
    teach_sent_chat: "{teacher} → {student}: аргумент.",
    invite_open_hint: "Указать имя",
    invite_invalid: "Игрок: нет"
  });

  function activeProfile() {
    const raw = typeof Data.getUiProfile === "function" ? Data.getUiProfile() : Data.UI_PROFILE;
    const normalized = typeof Data.normalizeUiProfile === "function"
      ? Data.normalizeUiProfile(raw)
      : String(raw || "").trim().toLowerCase();
    return PROFILE_KEYS.includes(normalized) ? normalized : "millennial";
  }

  function renderSimpleTemplate(template, ctx) {
    const vars = ctx && typeof ctx === "object" ? ctx : {};
    return String(template || "").replace(/\{([A-Za-z0-9_]+)\}/g, (_, key) => {
      return Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : "";
    }).replace(/\s+([.,!?;:])/g, "$1").trim();
  }

  function patchProfileDictionaries() {
    const texts = Data.TEXTS || (Data.TEXTS = {});
    const millennialBase = texts.millennial || texts.genz || {};
    const zoomerBase = texts.zoomer || texts.alpha || millennialBase;
    const alphaBase = texts.alpha || zoomerBase;
    const boomerBase = texts.boomer || millennialBase;

    texts.millennial = Object.freeze({ ...millennialBase, ...TEXT_OVERRIDES.millennial });
    texts.default = texts.millennial;
    texts.zoomer = Object.freeze({ ...zoomerBase, ...TEXT_OVERRIDES.zoomer });
    texts.alpha = Object.freeze({ ...alphaBase, ...TEXT_OVERRIDES.alpha });
    texts.boomer = Object.freeze({ ...boomerBase, ...TEXT_OVERRIDES.boomer });
  }

  function installSystemRoutingRepair() {
    if (System.say && System.say.__stage6VisualToneRepairV2Wrapped) return;
    const originalSay = System.say;
    const kindAliases = {
      error: "errors",
      errors: "errors",
      warning: "warnings",
      warnings: "warnings",
      notification: "notifications",
      notifications: "notifications",
      event: "systemEvents",
      events: "systemEvents",
      systemEvent: "systemEvents",
      systemEvents: "systemEvents"
    };
    const wrapped = function stage6ProfileAwareSystemSayV2(kind, code, ctx) {
      const group = kindAliases[String(kind || "").trim()] || String(kind || "").trim();
      const key = `${group}.${String(code || "").trim()}`;
      const bucket = SYSTEM_ROUTE_OVERRIDES[activeProfile()] || SYSTEM_ROUTE_OVERRIDES.millennial;
      if (Object.prototype.hasOwnProperty.call(bucket, key)) {
        return renderSimpleTemplate(bucket[key], ctx);
      }
      return originalSay.call(this, kind, code, ctx);
    };
    wrapped.__stage6VisualToneRepairV2Wrapped = true;
    wrapped.__stage6VisualToneRepairOriginal = originalSay;
    System.say = wrapped;
  }

  function cleanOwnStatIcon(kind, text) {
    const icons = { influence: "⚡", rep: "⭐", points: "💰", wins: "🏆" };
    const icon = icons[String(kind || "").trim()];
    const source = String(text == null ? "" : text);
    if (!icon || !source.includes(icon)) return source;
    const cleaned = source
      .replace(icon, "")
      .replace(/\s{2,}/g, " ")
      .replace(/\s+([.,!?;:])/g, "$1")
      .trim();
    return cleaned || source;
  }

  function stripRenderedDeltaIcon(kind) {
    const icons = { influence: "⚡", rep: "⭐", points: "💰", wins: "🏆" };
    const icon = icons[String(kind || "").trim()];
    if (!icon || typeof document === "undefined") return;
    const nodes = Array.from(document.querySelectorAll(`.statToast--delta[data-delta-kind="${String(kind)}"]`));
    nodes.forEach((node) => {
      const text = String(node.textContent || "");
      if (!text.includes(icon)) return;
      const cleaned = text
        .replace(icon, "")
        .replace(/\s{2,}/g, " ")
        .replace(/\s+([.,!?;:])/g, "$1")
        .trim();
      if (cleaned) node.textContent = cleaned;
    });
  }

  function installToastRepair() {
    if (typeof UI.showStatToast === "function" && !UI.showStatToast.__stage6VisualToneRepairV2Wrapped) {
      const original = UI.showStatToast;
      const wrapped = function stage6StatToastWithoutAnchorDuplicateV2(kind, text) {
        return original.call(this, kind, cleanOwnStatIcon(kind, text));
      };
      wrapped.__stage6VisualToneRepairV2Wrapped = true;
      wrapped.__stage6VisualToneRepairOriginal = original;
      UI.showStatToast = wrapped;
    }

    if (typeof UI.emitStatDelta === "function" && !UI.emitStatDelta.__stage6VisualToneRepairV2Wrapped) {
      const original = UI.emitStatDelta;
      const wrapped = function stage6DeltaToastWithoutAnchorDuplicateV2(kind, delta, opts) {
        const result = original.call(this, kind, delta, opts);
        stripRenderedDeltaIcon(kind);
        return result;
      };
      wrapped.__stage6VisualToneRepairV2Wrapped = true;
      wrapped.__stage6VisualToneRepairOriginal = original;
      UI.emitStatDelta = wrapped;
    }
  }

  const LABEL_VARIANTS = Object.freeze({
    attack: new Set(["Вброс", "Аргумент", "Атака"]),
    defense: new Set(["Ответка", "Ответ"]),
    dismiss: new Set(["Отвали", "Отойти", "Отказаться", "Стоп"]),
    escape: new Set(["Свалить", "Уйти", "Выйти"])
  });

  function replaceSemanticExactText(el, variants, target) {
    if (!el || !target) return;
    const current = String(el.textContent || "").trim();
    if (variants.has(current) && current !== target) el.textContent = target;
  }

  function syncHardcodedControls() {
    if (typeof document === "undefined") return;
    const profile = activeProfile();
    const copy = CONTROL_COPY[profile] || CONTROL_COPY.millennial;

    const chatInput = document.getElementById("chatInput");
    if (chatInput && chatInput.placeholder !== copy.chatPlaceholder) chatInput.placeholder = copy.chatPlaceholder;
    const btnSend = document.getElementById("btnSend");
    if (btnSend && btnSend.textContent !== copy.chatSend) btnSend.textContent = copy.chatSend;

    const dmInput = document.getElementById("dmInput");
    if (dmInput && dmInput.placeholder !== copy.dmPlaceholder) dmInput.placeholder = copy.dmPlaceholder;
    const dmSend = document.getElementById("dmSend");
    if (dmSend && dmSend.textContent !== copy.dmSend) dmSend.textContent = copy.dmSend;

    const btnMenu = document.getElementById("btnMenu");
    if (btnMenu && btnMenu.textContent !== copy.menu) btnMenu.textContent = copy.menu;

    const dmHeader = document.querySelector("#dmBlock .headerTitleText");
    if (dmHeader && dmHeader.textContent !== copy.dmHeader) dmHeader.textContent = copy.dmHeader;
    const battlesHeader = document.querySelector("#battlesBlock .battleTitleText");
    if (battlesHeader && battlesHeader.textContent !== copy.battlesHeader) battlesHeader.textContent = copy.battlesHeader;
    const eventsHeader = document.querySelector("#eventsBlock .headerTitleText");
    const eventsText = typeof Data.t === "function" ? Data.t("events_header") : "События";
    if (eventsHeader && eventsHeader.textContent !== eventsText) eventsHeader.textContent = eventsText;

    document.querySelectorAll("#teachPanel .badge").forEach((el) => {
      replaceSemanticExactText(el, LABEL_VARIANTS.attack, copy.attackBadge);
      replaceSemanticExactText(el, LABEL_VARIANTS.defense, copy.defenseBadge);
    });

    const root = document.getElementById("app");
    if (!root) return;
    root.querySelectorAll("button, .miniBtn").forEach((el) => {
      replaceSemanticExactText(el, LABEL_VARIANTS.dismiss, copy.dismiss);
      replaceSemanticExactText(el, LABEL_VARIANTS.escape, copy.escape);
    });
  }

  function canonicalizeEventText(text) {
    return String(text || "")
      .replace(/ пытается прекратить контакт с /g, " пытается Отвали ")
      .replace(/ пытается отойти от /g, " пытается Отвали ")
      .replace(/ пытается остановить контакт с /g, " пытается Отвали ")
      .replace(/: не удалось прекратить контакт с /g, ": Отвали не прошел ")
      .replace(/: не удалось отойти от /g, ": Отвали не прошел ")
      .replace(/: не удалось остановить контакт с /g, ": Отвали не прошел ")
      .replace(/: прекратил контакт с /g, ": Отвали ")
      .replace(/: отошёл от /g, ": Отвали ")
      .replace(/: остановил контакт с /g, ": Отвали ")
      .replace(/ пытается выйти из конфликта с /g, " пытается Свалить ")
      .replace(/ пытается уйти от /g, " пытается Свалить ")
      .replace(/: не удалось выйти из конфликта с /g, ": Свалить не удалось ")
      .replace(/: не удалось уйти от /g, ": Свалить не удалось ")
      .replace(/: вышел из конфликта с /g, ": Свалить ")
      .replace(/: ушёл от /g, ": Свалить ");
  }

  function eventTextForProfile(text, profile) {
    const out = canonicalizeEventText(text);
    if (profile === "zoomer") return out;

    if (profile === "boomer") {
      return out
        .replace(/ пытается Отвали /g, " пытается прекратить контакт с ")
        .replace(/: Отвали не прошел /g, ": не удалось прекратить контакт с ")
        .replace(/: Отвали /g, ": прекратил контакт с ")
        .replace(/ пытается Свалить /g, " пытается выйти из конфликта с ")
        .replace(/: Свалить не удалось /g, ": не удалось выйти из конфликта с ")
        .replace(/: Свалить /g, ": вышел из конфликта с ");
    }

    if (profile === "alpha") {
      return out
        .replace(/ пытается Отвали /g, " пытается остановить контакт с ")
        .replace(/: Отвали не прошел /g, ": не удалось остановить контакт с ")
        .replace(/: Отвали /g, ": остановил контакт с ")
        .replace(/ пытается Свалить /g, " пытается выйти из конфликта с ")
        .replace(/: Свалить не удалось /g, ": не удалось выйти из конфликта с ")
        .replace(/: Свалить /g, ": вышел из конфликта с ");
    }

    return out
      .replace(/ пытается Отвали /g, " пытается отойти от ")
      .replace(/: Отвали не прошел /g, ": не удалось отойти от ")
      .replace(/: Отвали /g, ": отошёл от ")
      .replace(/ пытается Свалить /g, " пытается уйти от ")
      .replace(/: Свалить не удалось /g, ": не удалось уйти от ")
      .replace(/: Свалить /g, ": ушёл от ");
  }

  function syncEventCopy() {
    if (typeof document === "undefined" || typeof NodeFilter === "undefined") return;
    const root = document.getElementById("eventsBody");
    if (!root) return;
    const profile = activeProfile();
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      const before = String(node.nodeValue || "");
      const after = eventTextForProfile(before, profile);
      if (after !== before) node.nodeValue = after;
      node = walker.nextNode();
    }
  }

  let syncing = false;
  function syncVisibleProfileCopy() {
    if (syncing) return;
    syncing = true;
    try {
      if (typeof document !== "undefined" && document.body) document.body.dataset.uiProfile = activeProfile();
      syncHardcodedControls();
      syncEventCopy();
    } finally {
      syncing = false;
    }
  }

  let syncQueued = false;
  function queueSync() {
    if (syncQueued) return;
    syncQueued = true;
    const run = () => {
      syncQueued = false;
      syncVisibleProfileCopy();
    };
    if (typeof queueMicrotask === "function") queueMicrotask(run);
    else setTimeout(run, 0);
  }

  function installProfileChangeHook() {
    if (typeof Data.setUiProfile !== "function" || Data.setUiProfile.__stage6VisualToneRepairV2Wrapped) return;
    const original = Data.setUiProfile;
    const wrapped = function stage6ProfileSetWithVisualSyncV2(profile) {
      const result = original.call(this, profile);
      queueSync();
      return result;
    };
    wrapped.__stage6VisualToneRepairV2Wrapped = true;
    wrapped.__stage6VisualToneRepairOriginal = original;
    Data.setUiProfile = wrapped;
  }

  function installScopedObserver() {
    if (typeof MutationObserver !== "function" || typeof document === "undefined") return null;
    const root = document.getElementById("app");
    if (!root) return null;
    const observer = new MutationObserver(() => queueSync());
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    return observer;
  }

  patchProfileDictionaries();
  installSystemRoutingRepair();
  installToastRepair();
  installProfileChangeHook();
  const observer = installScopedObserver();
  syncVisibleProfileCopy();

  Game.__DEV.__stage6VisualToneRepairV2Installed = true;
  Game.__DEV.__stage6VisualToneRepairV2Observer = observer;
  Game.__DEV.previewStage6VisualToneProfileV2 = function previewStage6VisualToneProfileV2(profile) {
    const key = PROFILE_KEYS.includes(String(profile || "").trim().toLowerCase())
      ? String(profile).trim().toLowerCase()
      : "millennial";
    return {
      profile: key,
      controls: CONTROL_COPY[key],
      text: Data.TEXTS && Data.TEXTS[key] ? {
        events_header: Data.TEXTS[key].events_header,
        battle_action_attack: Data.TEXTS[key].battle_action_attack,
        battle_action_decline: Data.TEXTS[key].battle_action_decline,
        escape_button_label: Data.TEXTS[key].escape_button_label,
        dm_empty: Data.TEXTS[key].dm_empty,
        teach_sent_dm: Data.TEXTS[key].teach_sent_dm,
        teach_sent_chat: Data.TEXTS[key].teach_sent_chat,
        invite_open_hint: Data.TEXTS[key].invite_open_hint,
        invite_invalid: Data.TEXTS[key].invite_invalid
      } : null,
      systemOverrides: SYSTEM_ROUTE_OVERRIDES[key]
    };
  };

  Game.__DEV.smokeStage6FinalVisualToneRepairOnce = function smokeStage6FinalVisualToneRepairOnce() {
    const previews = Object.fromEntries(PROFILE_KEYS.map((profile) => [
      profile,
      Game.__DEV.previewStage6VisualToneProfileV2(profile)
    ]));
    const signatures = PROFILE_KEYS.map((profile) => JSON.stringify(previews[profile]));
    const alphaZoomerDiffCount = (() => {
      const z = { ...(Data.TEXTS.zoomer || {}) };
      const a = { ...(Data.TEXTS.alpha || {}) };
      const keys = new Set([...Object.keys(z), ...Object.keys(a)]);
      let count = 0;
      keys.forEach((key) => {
        if (String(z[key]) !== String(a[key])) count += 1;
      });
      return count;
    })();
    const alpha = Data.TEXTS && Data.TEXTS.alpha ? Data.TEXTS.alpha : {};
    const alphaFrozenCopyPreserved = Object.keys(ALPHA_FROZEN_EXPECTED).every((key) => (
      String(alpha[key] == null ? "" : alpha[key]) === ALPHA_FROZEN_EXPECTED[key]
    ));
    const boomerPreview = JSON.stringify(previews.boomer || {}).toLowerCase();
    const checks = {
      installed: Game.__DEV.__stage6VisualToneRepairV2Installed === true,
      fourDistinctProfiles: new Set(signatures).size === 4,
      alphaFrozenCopyPreserved,
      millennialEscapeCurrencyClear: /💰/.test(String(Data.TEXTS.millennial && Data.TEXTS.millennial.escape_button_label || "")),
      zoomerAlphaMeaningfullyDistinct: alphaZoomerDiffCount >= 12,
      boomerPreviewNoObservedSlang: !/(отвали|свалить|вброс|заслать|пиши по теме)/i.test(boomerPreview),
      hardcodedControlsDistinct: new Set(PROFILE_KEYS.map((key) => JSON.stringify(CONTROL_COPY[key]))).size === 4,
      systemRoutingWrapped: !!(System.say && System.say.__stage6VisualToneRepairV2Wrapped),
      statToastWrapped: !!(UI.showStatToast && UI.showStatToast.__stage6VisualToneRepairV2Wrapped),
      statDeltaWrapped: !!(UI.emitStatDelta && UI.emitStatDelta.__stage6VisualToneRepairV2Wrapped),
      profileChangeWrapped: !!(Data.setUiProfile && Data.setUiProfile.__stage6VisualToneRepairV2Wrapped)
    };
    const failures = Object.keys(checks).filter((key) => checks[key] !== true);
    return {
      ok: failures.length === 0,
      buildTag: BUILD_TAG,
      smokeVersion: SMOKE_VERSION,
      activeProfile: activeProfile(),
      checks,
      failures,
      alphaZoomerDiffCount,
      previews
    };
  };

  console.warn("STAGE6_FINAL_VISUAL_TONE_REPAIR_INSTALLED_V2", {
    buildTag: BUILD_TAG,
    smokeVersion: SMOKE_VERSION,
    activeProfile: activeProfile(),
    observer: !!observer
  });
})();
