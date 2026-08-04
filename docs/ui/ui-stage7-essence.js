// Stage 7 - profile-adapted essence modal.
// The accepted start screen remains unchanged. This module only gives the
// existing profile-specific essence/rules action real content and behavior.
window.Game = window.Game || {};

(() => {
  "use strict";

  const Game = window.Game;
  Game.UI = Game.UI || {};

  const MODAL_ID = "stage7EssenceModal";
  const PROFILES = Object.freeze(["boomer", "genX", "millennial", "zoomer", "alpha"]);
  const COPY = Object.freeze({
    boomer: Object.freeze({
      eyebrow: "Почему это удобно",
      title: "Онлайн-игра без привязки к чужому расписанию",
      lead: "В обычной сетевой игре всем приходится собираться одновременно и оставаться до конца сессии. В Asynchronia каждый действует тогда, когда ему удобно, а мир сохраняет последствия.",
      synchronousLabel: "Обычная онлайн-игра",
      synchronousPoints: Object.freeze([
        "Нужно заранее согласовать время со всеми.",
        "Приходится ждать опоздавших или пропускать общую сессию.",
        "После выхода партия часто останавливается для вас."
      ]),
      asynchronousLabel: "Asynchronia",
      asynchronousPoints: Object.freeze([
        "Вы заходите в удобное время и сразу делаете свой ход.",
        "Другие участники отвечают позже, когда смогут.",
        "Конфликты, союзы и репутация продолжают развиваться между вашими входами."
      ]),
      closer: "Не нужно освобождать целый вечер. Несколько осмысленных действий меняют живой мир, и при следующем входе вы видите их последствия.",
      close: "Вернуться к началу"
    }),
    genX: Object.freeze({
      eyebrow: "Без созвонов и сборов",
      title: "Онлайн без чужого расписания",
      lead: "Обычный мультиплеер требует собрать всех в одно время и не выпадать из сессии. Здесь это не нужно.",
      synchronousLabel: "Обычный онлайн",
      synchronousPoints: Object.freeze([
        "Дождись всех.",
        "Выдели вечер.",
        "Вышел - выпал из происходящего."
      ]),
      asynchronousLabel: "Asynchronia",
      asynchronousPoints: Object.freeze([
        "Зашёл, сделал ход, вышел.",
        "Остальные ответят позже.",
        "Решения, конфликты и репутация останутся в мире."
      ]),
      closer: "Игра не держит у экрана. Но всё, что ты сделал, продолжает работать против кого-то или на тебя.",
      close: "Назад"
    }),
    millennial: Object.freeze({
      eyebrow: "Социальная стратегия в твоём ритме",
      title: "Мультиплеер, который помещается в жизнь",
      lead: "Большинство онлайн-игр просит подстроить вечер под общую сессию. Asynchronia подстраивает взаимодействие под реальное расписание людей.",
      synchronousLabel: "Синхронный онлайн",
      synchronousPoints: Object.freeze([
        "Все должны быть онлайн одновременно.",
        "Нужно ждать команду и оставаться до конца.",
        "Пропустил сессию - пропустил события."
      ]),
      asynchronousLabel: "Asynchronia",
      asynchronousPoints: Object.freeze([
        "Каждый играет в своё время.",
        "Ответы приходят позже, но история не останавливается.",
        "Выборы меняют отношения, репутацию и будущие конфликты."
      ]),
      closer: "Ты не просто ставишь игру на паузу. Ты оставляешь решение в мире и возвращаешься посмотреть, что оно запустило.",
      close: "Вернуться"
    }),
    zoomer: Object.freeze({
      eyebrow: "Онлайн без обязаловки",
      title: "Игра, которая не съедает вечер",
      lead: "Без «все в 21:00», ожидания пати и страха выйти раньше.",
      synchronousLabel: "Обычный онлайн",
      synchronousPoints: Object.freeze([
        "Собери всех онлайн.",
        "Жди и не выпадай.",
        "Пропустил сессию - пропустил движ."
      ]),
      asynchronousLabel: "Asynchronia",
      asynchronousPoints: Object.freeze([
        "Зашёл когда удобно.",
        "Сделал ход и вышел.",
        "Мир, конфликты и репутация двигаются дальше."
      ]),
      closer: "Ты не караулишь игру. Игра караулит последствия твоих решений.",
      close: "Назад"
    }),
    alpha: Object.freeze({
      eyebrow: "твой ритм",
      title: "мир играет дальше",
      lead: "не жди пати. не держи игру открытой.",
      synchronousLabel: "обычный онлайн",
      synchronousPoints: Object.freeze([
        "все должны быть здесь сейчас",
        "ждёшь других",
        "вышел - всё мимо"
      ]),
      asynchronousLabel: "asynchronia",
      asynchronousPoints: Object.freeze([
        "зашёл → сделал ход → вышел",
        "ответы придут позже",
        "твой выбор меняет конфликт и репу"
      ]),
      closer: "удобно. живо. последствия уже пошли.",
      close: "назад"
    })
  });

  const normalizeProfile = (value) => {
    const raw = String(value || "").trim().toLowerCase();
    if (raw === "genx") return "genX";
    return PROFILES.includes(raw) ? raw : "millennial";
  };

  const activeProfile = () => {
    try {
      if (Game.Data && typeof Game.Data.getUiProfile === "function") {
        return normalizeProfile(Game.Data.getUiProfile());
      }
    } catch (_) {}
    try {
      if (document.body && document.body.dataset.uiProfile) {
        return normalizeProfile(document.body.dataset.uiProfile);
      }
    } catch (_) {}
    return normalizeProfile(Game.Data && (Game.Data.UI_PROFILE || Game.Data.TEXT_MODE));
  };

  const copyFor = (profile) => {
    const key = normalizeProfile(profile);
    const source = COPY[key] || COPY.millennial;
    return {
      profile: key,
      eyebrow: source.eyebrow,
      title: source.title,
      lead: source.lead,
      synchronousLabel: source.synchronousLabel,
      synchronousPoints: Array.from(source.synchronousPoints),
      asynchronousLabel: source.asynchronousLabel,
      asynchronousPoints: Array.from(source.asynchronousPoints),
      closer: source.closer,
      close: source.close
    };
  };

  Game.UI.getStage7EssenceCopy = copyFor;
  Game.UI.getStage7EssenceProfiles = () => Array.from(PROFILES);

  if (typeof document === "undefined") return;

  let lastFocus = null;
  let keyHandlerInstalled = false;
  const boundButtons = new WeakSet();

  const setText = (root, selector, value) => {
    const node = root.querySelector(selector);
    if (node) node.textContent = String(value || "");
  };

  const fillList = (root, selector, values) => {
    const list = root.querySelector(selector);
    if (!list) return;
    list.textContent = "";
    values.forEach((value) => {
      const item = document.createElement("li");
      item.textContent = value;
      list.appendChild(item);
    });
  };

  const focusableInside = (root) => Array.from(root.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )).filter((node) => !node.hidden && node.getAttribute("aria-hidden") !== "true");

  const closeModal = () => {
    const root = document.getElementById(MODAL_ID);
    if (!root || root.hidden) return;
    root.hidden = true;
    document.body.classList.remove("stage7EssenceOpen");
    const restore = lastFocus;
    lastFocus = null;
    if (restore && typeof restore.focus === "function" && document.contains(restore)) {
      restore.focus({ preventScroll: true });
    }
  };

  const handleKeydown = (event) => {
    const root = document.getElementById(MODAL_ID);
    if (!root || root.hidden) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = focusableInside(root);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const ensureModal = () => {
    let root = document.getElementById(MODAL_ID);
    if (root) return root;

    root = document.createElement("div");
    root.id = MODAL_ID;
    root.className = "stage7EssenceModal";
    root.hidden = true;
    root.innerHTML = `
      <section class="stage7EssenceDialog" role="dialog" aria-modal="true" aria-labelledby="stage7EssenceTitle" aria-describedby="stage7EssenceLead">
        <button class="stage7EssenceX" type="button" data-stage7-essence-close aria-label="Закрыть">×</button>
        <div class="stage7EssenceEyebrow"></div>
        <h2 id="stage7EssenceTitle" class="stage7EssenceTitle"></h2>
        <p id="stage7EssenceLead" class="stage7EssenceLead"></p>
        <div class="stage7EssenceComparison">
          <article class="stage7EssenceSide stage7EssenceSideSync">
            <h3 class="stage7EssenceSyncLabel"></h3>
            <ul class="stage7EssenceSyncPoints"></ul>
          </article>
          <article class="stage7EssenceSide stage7EssenceSideAsync">
            <h3 class="stage7EssenceAsyncLabel"></h3>
            <ul class="stage7EssenceAsyncPoints"></ul>
          </article>
        </div>
        <p class="stage7EssenceCloser"></p>
        <button class="btn primary stage7EssenceReturn" type="button" data-stage7-essence-close></button>
      </section>`;

    root.addEventListener("click", (event) => {
      if (event.target === root || event.target.closest("[data-stage7-essence-close]")) {
        event.preventDefault();
        closeModal();
      }
    });
    document.body.appendChild(root);

    if (!keyHandlerInstalled) {
      document.addEventListener("keydown", handleKeydown, true);
      keyHandlerInstalled = true;
    }
    return root;
  };

  const renderModal = (root, profile) => {
    const copy = copyFor(profile);
    root.dataset.uiProfile = copy.profile;
    const dialog = root.querySelector(".stage7EssenceDialog");
    if (dialog) dialog.dataset.uiProfile = copy.profile;
    setText(root, ".stage7EssenceEyebrow", copy.eyebrow);
    setText(root, ".stage7EssenceTitle", copy.title);
    setText(root, ".stage7EssenceLead", copy.lead);
    setText(root, ".stage7EssenceSyncLabel", copy.synchronousLabel);
    setText(root, ".stage7EssenceAsyncLabel", copy.asynchronousLabel);
    fillList(root, ".stage7EssenceSyncPoints", copy.synchronousPoints);
    fillList(root, ".stage7EssenceAsyncPoints", copy.asynchronousPoints);
    setText(root, ".stage7EssenceCloser", copy.closer);
    setText(root, ".stage7EssenceReturn", copy.close);
    const closeButton = root.querySelector(".stage7EssenceX");
    if (closeButton) closeButton.setAttribute("aria-label", copy.profile === "boomer" ? "Закрыть описание игры" : "Закрыть");
  };

  const openModal = () => {
    const root = ensureModal();
    renderModal(root, activeProfile());
    lastFocus = document.activeElement;
    root.hidden = false;
    document.body.classList.add("stage7EssenceOpen");
    const focusTarget = root.querySelector(".stage7EssenceX") || root.querySelector(".stage7EssenceDialog");
    const focus = () => {
      if (focusTarget && typeof focusTarget.focus === "function") focusTarget.focus({ preventScroll: true });
    };
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(focus);
    else setTimeout(focus, 0);
  };

  const bindButton = () => {
    const button = document.getElementById("btnRules");
    if (!button || boundButtons.has(button)) return !!button;
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      openModal();
    }, true);
    button.dataset.stage7EssenceBound = "true";
    boundButtons.add(button);
    return true;
  };

  const install = () => {
    bindButton();
    if (typeof MutationObserver === "function") {
      const observer = new MutationObserver(() => bindButton());
      observer.observe(document.documentElement, { childList: true, subtree: true });
    }
  };

  Game.UI.openStage7Essence = openModal;
  Game.UI.closeStage7Essence = closeModal;
  Game.UI.installStage7Essence = install;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
  } else {
    install();
  }
})();
