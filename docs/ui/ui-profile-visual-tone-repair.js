// Stage 6 final visual tone separation repair v3.
// Presentation-only. Preserves gameplay/state/economy and PR #245 Alpha frozen keys.
window.Game = window.Game || {};

(function installStage6VisualToneRepairV3() {
  const Game = window.Game;
  const Data = Game.Data;
  const UI = Game.UI;
  const System = Game.System;

  if (!Data || !UI || !System) {
    console.error("STAGE6_VISUAL_TONE_REPAIR_V3_INSTALL_FAILED", {
      hasData: !!Data,
      hasUI: !!UI,
      hasSystem: !!System
    });
    return;
  }

  Game.__DEV = Game.__DEV || {};
  if (Game.__DEV.__stage6VisualToneRepairV3Installed) return;

  const BUILD_TAG = "build_2026_07_22_stage6_visual_tone_repair_v3";
  const SMOKE_VERSION = "stage6_visual_tone_repair_v20260722_003";
  const PROFILE_KEYS = Object.freeze(["millennial", "zoomer", "alpha", "boomer"]);
  const STAT_ICONS = Object.freeze({ influence: "⚡", rep: "⭐", points: "💰", wins: "🏆" });

  const CONTROL_COPY = Object.freeze({
    millennial: Object.freeze({
      chatPlaceholder: "Напиши сообщение.", chatSend: "Отправить",
      dmPlaceholder: "Напиши в личку.", dmSend: "Отправить", dmHeader: "Личка",
      battlesHeader: "Баттлы", menu: "Меню", attackBadge: "Аргумент", defenseBadge: "Ответ",
      dismiss: "Отойти", escape: "Уйти"
    }),
    zoomer: Object.freeze({
      chatPlaceholder: "Пиши по теме.", chatSend: "Заслать",
      dmPlaceholder: "Пиши в личку.", dmSend: "Заслать", dmHeader: "Личка",
      battlesHeader: "Баттлы", menu: "Меню", attackBadge: "Вброс", defenseBadge: "Ответка",
      dismiss: "Отвали", escape: "Свалить"
    }),
    alpha: Object.freeze({
      chatPlaceholder: "Сообщение", chatSend: "Отпр.",
      dmPlaceholder: "ЛС", dmSend: "Отпр.", dmHeader: "ЛС",
      battlesHeader: "Бои", menu: "Меню", attackBadge: "Атк", defenseBadge: "Ответ",
      dismiss: "Стоп", escape: "Уйти"
    }),
    boomer: Object.freeze({
      chatPlaceholder: "Введите сообщение.", chatSend: "Отправить",
      dmPlaceholder: "Введите личное сообщение.", dmSend: "Отправить", dmHeader: "Сообщения",
      battlesHeader: "Конфликты", menu: "Меню", attackBadge: "Аргумент", defenseBadge: "Ответ",
      dismiss: "Отказаться", escape: "Выйти"
    })
  });

  const TEXT_OVERRIDES = Object.freeze({
    millennial: Object.freeze({
      escape_button_label: "Уйти −{X} 💰",
      events_header: "События", events_title: "События ({count})",
      battle_invite_title: "Вызов", battle_action_accept: "Принять",
      battle_action_decline: "Отклонить", battle_action_attack: "Атаковать",
      battle_action_rematch: "Реванш", battle_action_report: "Пожаловаться",
      dm_empty: "Пока пусто.", dm_action_unavailable: "Недоступно."
    }),
    zoomer: Object.freeze({
      escape_button_label: "Свалить −{X} 💰",
      events_header: "Движ", events_title: "Движ ({count})",
      battle_invite_title: "Залёт", battle_action_accept: "Вписаться",
      battle_action_decline: "Скипнуть", battle_action_attack: "Влететь",
      battle_action_rematch: "Ещё раунд", battle_action_report: "Сдать копу",
      dm_empty: "Личка молчит.", dm_action_unavailable: "Пока закрыто."
    }),
    alpha: Object.freeze({
      tie_start: "Голос", tie_call_to_action: "Выбрать", tie_click_name_hint: "Имя",
      vote_ok: "Учтён", vote_already: "Уже", vote_fail: "Нет",
      events_header: "События", events_title: "События {count}", events_empty: "Пусто.",
      events_panel_hint: "Последние события.", battles_empty: "Пусто.", battle_invite_title: "Бой",
      battle_action_accept: "Да", battle_action_decline: "Нет", battle_action_attack: "Атака",
      battle_action_rematch: "Ещё", battle_action_report: "Сообщить", dm_empty: "Пусто.",
      dm_action_unavailable: "Нет.", battle_energy_locked_hint: "⚡{energy}",
      events_close_extra: "Свернуть", events_clear_all: "Очистить", events_clear: "Очистить",
      events_done: "Готово", events_left: "{sec} сек", menu_title: "Меню",
      return_to_start: "На старт", menu_unavailable: "Нет.", goal_label: "Цель"
    }),
    boomer: Object.freeze({
      escape_button_label: "Выйти −{X} 💰",
      events_header: "События", events_title: "События: {count}",
      battle_invite_title: "Вызов", battle_action_accept: "Принять",
      battle_action_decline: "Отказаться", battle_action_attack: "Атаковать",
      battle_action_rematch: "Реванш", battle_action_report: "Сообщить",
      dm_empty: "Сообщений пока нет.", dm_action_unavailable: "Действие недоступно."
    })
  });

  const START_ALPHA_OVERRIDES = Object.freeze({
    birth_digits_label: "2 цифры года",
    profile_helper: "Только интерфейс. Можно сменить.",
    fantasy_birth_label: "Год по ощущению",
    start_continue: "Дальше",
    start_start: "Старт",
    start_reset: "Сброс",
    rules_action: "Правила",
    start_action: "Старт"
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
    return String(template || "").replace(/\{([A-Za-z0-9_]+)\}/g, (_, key) => (
      Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : ""
    )).replace(/\s+([.,!?;:])/g, "$1").trim();
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

    const starts = Data.START_SCREEN_PROFILE_TEXTS || {};
    const z = starts.zoomer || starts.millennial || {};
    Data.START_SCREEN_PROFILE_TEXTS = Object.freeze({
      ...starts,
      alpha: Object.freeze({ ...z, ...START_ALPHA_OVERRIDES })
    });
  }

  function installSystemRoutingRepair() {
    if (System.say && System.say.__stage6VisualToneRepairV3Wrapped) return;
    const originalSay = System.say;
    const kindAliases = {
      error: "errors", errors: "errors", warning: "warnings", warnings: "warnings",
      notification: "notifications", notifications: "notifications",
      event: "systemEvents", events: "systemEvents", systemEvent: "systemEvents", systemEvents: "systemEvents"
    };
    const wrapped = function stage6ProfileAwareSystemSayV3(kind, code, ctx) {
      const group = kindAliases[String(kind || "").trim()] || String(kind || "").trim();
      const key = `${group}.${String(code || "").trim()}`;
      const bucket = SYSTEM_ROUTE_OVERRIDES[activeProfile()] || SYSTEM_ROUTE_OVERRIDES.millennial;
      if (Object.prototype.hasOwnProperty.call(bucket, key)) return renderSimpleTemplate(bucket[key], ctx);
      return originalSay.call(this, kind, code, ctx);
    };
    wrapped.__stage6VisualToneRepairV3Wrapped = true;
    wrapped.__stage6VisualToneRepairOriginal = originalSay;
    System.say = wrapped;
  }

  function stripOwnStatIcon(kind, text) {
    const icon = STAT_ICONS[String(kind || "").trim()];
    let value = String(text == null ? "" : text).trim();
    if (!icon || !value.includes(icon)) return value;
    value = value.split(icon).join("")
      .replace(/\s{2,}/g, " ")
      .replace(/\s+([.,!?;:])/g, "$1")
      .trim();
    return value;
  }

  function normalizedDeltaToastText(kind, text, delta) {
    const cleaned = stripOwnStatIcon(kind, text);
    if (cleaned) return cleaned;
    const d = Number(delta || 0) | 0;
    if (!d) return "";
    return `${d > 0 ? "+" : ""}${d}`;
  }

  function normalizeRenderedDeltaToast(kind, delta) {
    if (typeof document === "undefined") return;
    const nodes = Array.from(document.querySelectorAll(`.statToast--delta[data-delta-kind="${String(kind)}"]`));
    nodes.forEach((node) => {
      const nodeDelta = Number(node.dataset && node.dataset.delta != null ? node.dataset.delta : delta) | 0;
      const normalized = normalizedDeltaToastText(kind, node.textContent, nodeDelta);
      if (normalized) node.textContent = normalized;
      else node.remove();
    });
  }

  function installToastRepair() {
    if (typeof UI.showStatToast === "function" && !UI.showStatToast.__stage6VisualToneRepairV3Wrapped) {
      const original = UI.showStatToast;
      const wrapped = function stage6StatToastNoOwnIconV3(kind, text) {
        const normalized = stripOwnStatIcon(kind, text);
        if (!normalized) return null;
        return original.call(this, kind, normalized);
      };
      wrapped.__stage6VisualToneRepairV3Wrapped = true;
      wrapped.__stage6VisualToneRepairOriginal = original;
      UI.showStatToast = wrapped;
    }

    if (typeof UI.emitStatDelta === "function" && !UI.emitStatDelta.__stage6VisualToneRepairV3Wrapped) {
      const original = UI.emitStatDelta;
      const wrapped = function stage6DeltaToastNoOwnIconV3(kind, delta, opts) {
        const result = original.call(this, kind, delta, opts);
        normalizeRenderedDeltaToast(kind, delta);
        return result;
      };
      wrapped.__stage6VisualToneRepairV3Wrapped = true;
      wrapped.__stage6VisualToneRepairOriginal = original;
      UI.emitStatDelta = wrapped;
    }
  }

  const LABEL_VARIANTS = Object.freeze({
    attack: new Set(["Вброс", "Аргумент", "Атака", "Атк"]),
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
    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el && String(el.textContent || "") !== value) el.textContent = value;
    };
    const setPlaceholder = (id, value) => {
      const el = document.getElementById(id);
      if (el && el.placeholder !== value) el.placeholder = value;
    };

    setPlaceholder("chatInput", copy.chatPlaceholder);
    setText("btnSend", copy.chatSend);
    setPlaceholder("dmInput", copy.dmPlaceholder);
    setText("dmSend", copy.dmSend);
    setText("btnMenu", copy.menu);

    const dmHeader = document.querySelector("#dmBlock .headerTitleText");
    if (dmHeader && dmHeader.textContent !== copy.dmHeader) dmHeader.textContent = copy.dmHeader;
    const dmTitle = document.getElementById("dmTitle");
    if (dmTitle && dmTitle.textContent !== copy.dmHeader) dmTitle.textContent = copy.dmHeader;
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
    if (root) {
      root.querySelectorAll("button, .miniBtn").forEach((el) => {
        replaceSemanticExactText(el, LABEL_VARIANTS.dismiss, copy.dismiss);
        replaceSemanticExactText(el, LABEL_VARIANTS.escape, copy.escape);
      });
    }

    if (profile === "alpha") {
      const tier = document.getElementById("argTierPill");
      if (tier && /^Твой тон:/i.test(String(tier.textContent || ""))) {
        const first = Array.from(tier.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
        if (first) first.nodeValue = String(first.nodeValue || "").replace(/^Твой тон:/i, "Тон:");
      }
    }
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
    if (profile === "boomer") return out
      .replace(/ пытается Отвали /g, " пытается прекратить контакт с ")
      .replace(/: Отвали не прошел /g, ": не удалось прекратить контакт с ")
      .replace(/: Отвали /g, ": прекратил контакт с ")
      .replace(/ пытается Свалить /g, " пытается выйти из конфликта с ")
      .replace(/: Свалить не удалось /g, ": не удалось выйти из конфликта с ")
      .replace(/: Свалить /g, ": вышел из конфликта с ");
    if (profile === "alpha") return out
      .replace(/ пытается Отвали /g, " пытается остановить контакт с ")
      .replace(/: Отвали не прошел /g, ": контакт не остановлен: ")
      .replace(/: Отвали /g, ": контакт остановлен: ")
      .replace(/ пытается Свалить /g, " пытается уйти от ")
      .replace(/: Свалить не удалось /g, ": уйти не удалось: ")
      .replace(/: Свалить /g, ": ушёл от ");
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
    const run = () => { syncQueued = false; syncVisibleProfileCopy(); };
    if (typeof queueMicrotask === "function") queueMicrotask(run);
    else setTimeout(run, 0);
  }

  function installProfileChangeHook() {
    if (typeof Data.setUiProfile !== "function" || Data.setUiProfile.__stage6VisualToneRepairV3Wrapped) return;
    const original = Data.setUiProfile;
    const wrapped = function stage6ProfileSetWithVisualSyncV3(profile) {
      const result = original.call(this, profile);
      queueSync();
      return result;
    };
    wrapped.__stage6VisualToneRepairV3Wrapped = true;
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

  function installProfileWatcher() {
    let last = activeProfile();
    return setInterval(() => {
      const current = activeProfile();
      if (current === last) return;
      last = current;
      queueSync();
    }, 250);
  }

  patchProfileDictionaries();
  installSystemRoutingRepair();
  installToastRepair();
  installProfileChangeHook();
  const observer = installScopedObserver();
  const profileWatcher = installProfileWatcher();
  syncVisibleProfileCopy();

  Game.__DEV.__stage6VisualToneRepairV3Installed = true;
  Game.__DEV.__stage6VisualToneRepairV3Observer = observer;
  Game.__DEV.__stage6VisualToneRepairV3ProfileWatcher = profileWatcher;

  Game.__DEV.previewStage6VisualToneProfileV3 = function previewStage6VisualToneProfileV3(profile) {
    const key = PROFILE_KEYS.includes(String(profile || "").trim().toLowerCase())
      ? String(profile).trim().toLowerCase()
      : "millennial";
    const layer = Data.TEXTS && Data.TEXTS[key] ? Data.TEXTS[key] : {};
    return {
      profile: key,
      controls: CONTROL_COPY[key],
      text: {
        events_header: layer.events_header,
        battle_action_accept: layer.battle_action_accept,
        battle_action_decline: layer.battle_action_decline,
        battle_action_attack: layer.battle_action_attack,
        escape_button_label: layer.escape_button_label,
        dm_empty: layer.dm_empty,
        teach_sent_dm: layer.teach_sent_dm,
        teach_sent_chat: layer.teach_sent_chat,
        invite_open_hint: layer.invite_open_hint,
        invite_invalid: layer.invite_invalid
      }
    };
  };

  Game.__DEV.smokeStage6FinalVisualToneRepairOnce = function smokeStage6FinalVisualToneRepairOnce() {
    const alpha = Data.TEXTS && Data.TEXTS.alpha ? Data.TEXTS.alpha : {};
    const alphaFrozenCopyPreserved = Object.keys(ALPHA_FROZEN_EXPECTED).every((key) => (
      String(alpha[key] == null ? "" : alpha[key]) === ALPHA_FROZEN_EXPECTED[key]
    ));
    const z = CONTROL_COPY.zoomer;
    const a = CONTROL_COPY.alpha;
    const persistentKeys = ["chatPlaceholder", "chatSend", "dmPlaceholder", "dmSend", "dmHeader", "battlesHeader", "attackBadge", "defenseBadge", "dismiss", "escape"];
    const persistentDiffCount = persistentKeys.filter((key) => z[key] !== a[key]).length;
    const zoomerChars = persistentKeys.reduce((sum, key) => sum + String(z[key] || "").length, 0);
    const alphaChars = persistentKeys.reduce((sum, key) => sum + String(a[key] || "").length, 0);
    const boomerPreview = JSON.stringify(Game.__DEV.previewStage6VisualToneProfileV3("boomer")).toLowerCase();
    const checks = {
      installed: Game.__DEV.__stage6VisualToneRepairV3Installed === true,
      alphaFrozenCopyPreserved,
      persistentZoomerAlphaDiffCount: persistentDiffCount >= 8,
      alphaPersistentChromeShorter: alphaChars < zoomerChars,
      millennialEscapeCurrencyClear: /💰/.test(String(Data.TEXTS.millennial && Data.TEXTS.millennial.escape_button_label || "")),
      boomerNoObservedSlang: !/(отвали|свалить|вброс|заслать|пиши по теме)/i.test(boomerPreview),
      iconOnlyRepBecomesDelta: normalizedDeltaToastText("rep", "⭐", 1) === "+1",
      iconPlusDeltaLosesOwnIcon: normalizedDeltaToastText("points", "💰 +2", 2) === "+2",
      nonOwnTextPreserved: normalizedDeltaToastText("rep", "Репутация выросла.", 1) === "Репутация выросла.",
      systemRoutingWrapped: !!(System.say && System.say.__stage6VisualToneRepairV3Wrapped),
      statToastWrapped: !!(UI.showStatToast && UI.showStatToast.__stage6VisualToneRepairV3Wrapped),
      statDeltaWrapped: !!(UI.emitStatDelta && UI.emitStatDelta.__stage6VisualToneRepairV3Wrapped),
      profileChangeWrapped: !!(Data.setUiProfile && Data.setUiProfile.__stage6VisualToneRepairV3Wrapped),
      profileWatcherInstalled: !!profileWatcher
    };
    const failures = Object.keys(checks).filter((key) => checks[key] !== true);
    return {
      ok: failures.length === 0,
      buildTag: BUILD_TAG,
      smokeVersion: SMOKE_VERSION,
      activeProfile: activeProfile(),
      checks,
      failures,
      persistentDiffCount,
      zoomerChars,
      alphaChars,
      previews: Object.fromEntries(PROFILE_KEYS.map((profile) => [profile, Game.__DEV.previewStage6VisualToneProfileV3(profile)]))
    };
  };

  console.warn("STAGE6_VISUAL_TONE_REPAIR_V3_INSTALLED", {
    buildTag: BUILD_TAG,
    smokeVersion: SMOKE_VERSION,
    activeProfile: activeProfile(),
    observer: !!observer,
    profileWatcher: !!profileWatcher
  });
})();
