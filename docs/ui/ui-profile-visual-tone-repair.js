// Stage 6 final visual tone separation repair.
// Presentation-only: profile copy/routing/UI labels. No gameplay/economy/state semantics.
window.Game = window.Game || {};

(function installStage6VisualToneRepair() {
  const Game = window.Game;
  const Data = Game.Data;
  const UI = Game.UI;
  const System = Game.System;

  if (!Data || !UI || !System) {
    console.error("STAGE6_VISUAL_TONE_REPAIR_INSTALL_FAILED", {
      hasData: !!Data,
      hasUI: !!UI,
      hasSystem: !!System
    });
    return;
  }

  if (Game.__DEV && Game.__DEV.__stage6VisualToneRepairInstalled) return;

  const BUILD_TAG = "build_2026_07_22_stage6_final_visual_tone_repair_v1";
  const SMOKE_VERSION = "stage6_final_visual_tone_repair_v20260722_001";
  const PROFILE_KEYS = ["millennial", "zoomer", "alpha", "boomer"];

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
      chatPlaceholder: "СООБЩЕНИЕ",
      chatSend: "→",
      dmPlaceholder: "DM",
      dmSend: "→",
      dmHeader: "DM",
      battlesHeader: "БОИ",
      menu: "MENU",
      attackBadge: "АТК",
      defenseBadge: "ОТВ",
      dismiss: "СТОП",
      escape: "ВЫХОД"
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
      tie_start: "ГОЛОС",
      tie_call_to_action: "ЖМИ",
      tie_click_name_hint: "ИМЯ",
      vote_ok: "✓",
      vote_already: "✓ ЕСТЬ",
      vote_fail: "✕",
      events_header: "EVENTS",
      events_title: "EVENTS {count}",
      events_empty: "0 событий",
      events_panel_hint: "События здесь.",
      battles_empty: "0 боёв",
      battle_invite_title: "БОЙ",
      battle_action_accept: "ДА",
      battle_action_decline: "НЕТ",
      battle_action_attack: "АТАКА",
      battle_action_rematch: "ЕЩЁ",
      battle_action_report: "РЕПОРТ",
      dm_empty: "0 сообщений",
      dm_action_unavailable: "НЕТ",
      battle_energy_locked_hint: "⚡{energy}",
      events_close_extra: "−",
      events_clear_all: "CLR",
      events_clear: "CLR",
      events_done: "OK",
      events_left: "⏳{sec}",
      escape_button_label: "ВЫХОД −{X}💰",
      invite_open_hint: "НИК",
      invite_invalid: "НЕТ",
      menu_title: "MENU",
      return_to_start: "СТАРТ",
      menu_unavailable: "НЕТ",
      goal_label: "ЦЕЛЬ"
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

  const START_ALPHA_OVERRIDES = Object.freeze({
    start_title: "AsyncScene",
    birth_digits_label: "2 ЦИФРЫ",
    digit_up_first: "▲ 1",
    digit_down_first: "▼ 1",
    digit_up_second: "▲ 2",
    digit_down_second: "▼ 2",
    profile_helper: "Только стиль. Можно сменить.",
    fantasy_birth_label: "МОЙ ГОД",
    start_continue: "→",
    start_start: "СТАРТ",
    start_reset: "СБРОС",
    rules_action: "ПРАВИЛА",
    start_action: "ВХОД",
    "introLines[0]": "РИСК = СОПЕРНИК",
    "introLines[1]": "СТАВКА = 💰",
    "introLines[2]": "ИТОГ СРАЗУ",
    economyHonestyLine: "Цена и итог сразу."
  });

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
    alpha: Object.freeze({
      "warnings.escapeNeedsPoints": "0 💰 ДЛЯ ВЫХОДА",
      "notifications.escapePaid": "ВЫХОД −1 💰",
      "notifications.escapeVoteCost": "ВЫХОД −{escapeCost} 💰",
      "notifications.trainingSent": "ARG {teacher}→{student}"
    }),
    boomer: Object.freeze({
      "warnings.escapeNeedsPoints": "Недостаточно 💰, чтобы выйти.",
      "notifications.escapePaid": "Выход: −1 💰.",
      "notifications.escapeVoteCost": "Выход: −{escapeCost} 💰.",
      "notifications.trainingSent": "Аргумент передан: {teacher} → {student}."
    })
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

    const startTables = Data.START_SCREEN_PROFILE_TEXTS || {};
    const startMillennial = startTables.millennial || {};
    const startZoomer = startTables.zoomer || startMillennial;
    const startBoomer = startTables.boomer || startMillennial;
    Data.START_SCREEN_PROFILE_TEXTS = Object.freeze({
      ...startTables,
      millennial: startMillennial,
      boomer: startBoomer,
      zoomer: startZoomer,
      alpha: Object.freeze({ ...startZoomer, ...START_ALPHA_OVERRIDES })
    });
  }

  function installSystemRoutingRepair() {
    if (System.say && System.say.__stage6VisualToneRepairWrapped) return;
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
    const wrapped = function stage6ProfileAwareSystemSay(kind, code, ctx) {
      const group = kindAliases[String(kind || "").trim()] || String(kind || "").trim();
      const key = `${group}.${String(code || "").trim()}`;
      const bucket = SYSTEM_ROUTE_OVERRIDES[activeProfile()] || SYSTEM_ROUTE_OVERRIDES.millennial;
      if (Object.prototype.hasOwnProperty.call(bucket, key)) {
        return renderSimpleTemplate(bucket[key], ctx);
      }
      return originalSay.call(this, kind, code, ctx);
    };
    wrapped.__stage6VisualToneRepairWrapped = true;
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
    if (typeof UI.showStatToast === "function" && !UI.showStatToast.__stage6VisualToneRepairWrapped) {
      const original = UI.showStatToast;
      const wrapped = function stage6StatToastWithoutAnchorDuplicate(kind, text) {
        return original.call(this, kind, cleanOwnStatIcon(kind, text));
      };
      wrapped.__stage6VisualToneRepairWrapped = true;
      wrapped.__stage6VisualToneRepairOriginal = original;
      UI.showStatToast = wrapped;
    }

    if (typeof UI.emitStatDelta === "function" && !UI.emitStatDelta.__stage6VisualToneRepairWrapped) {
      const original = UI.emitStatDelta;
      const wrapped = function stage6DeltaToastWithoutAnchorDuplicate(kind, delta, opts) {
        const result = original.call(this, kind, delta, opts);
        stripRenderedDeltaIcon(kind);
        return result;
      };
      wrapped.__stage6VisualToneRepairWrapped = true;
      wrapped.__stage6VisualToneRepairOriginal = original;
      UI.emitStatDelta = wrapped;
    }
  }

  function replaceExactText(el, from, to) {
    if (!el || !to) return;
    if (String(el.textContent || "").trim() === from && el.textContent !== to) el.textContent = to;
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

    const root = document.getElementById("app");
    if (!root) return;
    const labels = root.querySelectorAll("button, .badge, .miniBtn");
    labels.forEach((el) => {
      replaceExactText(el, "Вброс", copy.attackBadge);
      replaceExactText(el, "Ответка", copy.defenseBadge);
      replaceExactText(el, "Отвали", copy.dismiss);
      replaceExactText(el, "Свалить", copy.escape);
    });
  }

  function eventTextForProfile(text, profile) {
    let out = String(text || "");
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
        .replace(/ пытается Отвали /g, ": СТОП → ")
        .replace(/: Отвали не прошел /g, ": СТОП ✕ ")
        .replace(/: Отвали /g, ": СТОП ✓ ")
        .replace(/ пытается Свалить /g, ": ВЫХОД → ")
        .replace(/: Свалить не удалось /g, ": ВЫХОД ✕ ")
        .replace(/: Свалить /g, ": ВЫХОД ✓ ");
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
      if (document && document.body) document.body.dataset.uiProfile = activeProfile();
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
    if (typeof Data.setUiProfile !== "function" || Data.setUiProfile.__stage6VisualToneRepairWrapped) return;
    const original = Data.setUiProfile;
    const wrapped = function stage6ProfileSetWithVisualSync(profile) {
      const result = original.call(this, profile);
      queueSync();
      return result;
    };
    wrapped.__stage6VisualToneRepairWrapped = true;
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

  Game.__DEV = Game.__DEV || {};
  Game.__DEV.__stage6VisualToneRepairInstalled = true;
  Game.__DEV.__stage6VisualToneRepairObserver = observer;
  Game.__DEV.previewStage6VisualToneProfile = function previewStage6VisualToneProfile(profile) {
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
        dm_empty: Data.TEXTS[key].dm_empty
      } : null,
      system: SYSTEM_ROUTE_OVERRIDES[key]
    };
  };

  Game.__DEV.smokeStage6FinalVisualToneRepairOnce = function smokeStage6FinalVisualToneRepairOnce() {
    const previews = Object.fromEntries(PROFILE_KEYS.map((profile) => [
      profile,
      Game.__DEV.previewStage6VisualToneProfile(profile)
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
    const boomerPreview = JSON.stringify(previews.boomer || {}).toLowerCase();
    const checks = {
      installed: Game.__DEV.__stage6VisualToneRepairInstalled === true,
      fourDistinctProfiles: new Set(signatures).size === 4,
      millennialEscapeCurrencyClear: /💰/.test(String(Data.TEXTS.millennial && Data.TEXTS.millennial.escape_button_label || "")),
      zoomerAlphaMeaningfullyDistinct: alphaZoomerDiffCount >= 12,
      boomerPreviewNoObservedSlang: !/(отвали|свалить|вброс|заслать|пиши по теме)/i.test(boomerPreview),
      alphaUltraDirectControls: CONTROL_COPY.alpha.chatSend === "→" && CONTROL_COPY.alpha.battlesHeader === "БОИ",
      systemRoutingWrapped: !!(System.say && System.say.__stage6VisualToneRepairWrapped),
      statToastWrapped: !!(UI.showStatToast && UI.showStatToast.__stage6VisualToneRepairWrapped),
      statDeltaWrapped: !!(UI.emitStatDelta && UI.emitStatDelta.__stage6VisualToneRepairWrapped),
      profileChangeWrapped: !!(Data.setUiProfile && Data.setUiProfile.__stage6VisualToneRepairWrapped)
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

  console.warn("STAGE6_FINAL_VISUAL_TONE_REPAIR_INSTALLED_V1", {
    buildTag: BUILD_TAG,
    smokeVersion: SMOKE_VERSION,
    activeProfile: activeProfile(),
    observer: !!observer
  });
})();
