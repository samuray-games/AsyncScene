// Stage 7 - profile-adapted essence modal.
// The existing profile-specific rules action opens the game's short introduction.
window.Game = window.Game || {};

(() => {
  "use strict";

  const Game = window.Game;
  Game.UI = Game.UI || {};

  const MODAL_ID = "stage7EssenceModal";
  const PROFILES = Object.freeze(["boomer", "genX", "millennial", "zoomer", "alpha"]);
  const COPY = Object.freeze({
    boomer: Object.freeze({ title: "Что за игра?", blocks: Object.freeze([
      Object.freeze({ heading: "Здесь всё решают отношения.", body: "Люди спорят, поддерживают друг друга и меняют мнение. Вы выбираете, когда вмешаться и чью сторону занять." }),
      Object.freeze({ heading: "За поступками следуют последствия.", body: "Поддержали одного — другой может обидеться. Даже выигранный спор не всегда означает, что всё улажено." }),
      Object.freeze({ heading: "Играйте без спешки.", body: "Не нужно договариваться о времени встречи. Заходите, когда вам удобно." })
    ]), close: "Вернуться" }),
    genX: Object.freeze({ title: "Что за игра?", blocks: Object.freeze([
      Object.freeze({ heading: "Тут каждый за кого-то.", body: "Один спорит, другой вступается, третий подливает масла. Вмешиваться или нет — сам решай." }),
      Object.freeze({ heading: "За слова отвечают.", body: "Помог одному — нажил недовольного. Бывает, выиграл спор, а неприятности остались." }),
      Object.freeze({ heading: "Без обязательных сборов.", body: "Зашёл, сделал своё дело, вышел. Ждать, пока все появятся онлайн, не требуется." })
    ]), close: "Вернуться" }),
    millennial: Object.freeze({ title: "Что за игра?", blocks: Object.freeze([
      Object.freeze({ heading: "Здесь чат быстро становится личным.", body: "Кто-то спорит, кто-то зовёт на помощь. План был просто посмотреть, но ты уже выбираешь сторону." }),
      Object.freeze({ heading: "Карма без кнопки «отменить».", body: "Поддержал одного — второй обиделся. Даже выигранный спор иногда запускает следующий." }),
      Object.freeze({ heading: "Никакой вечерней переклички.", body: "Заходишь, когда есть время. Сделал выбор, вернулся позже — игра не требует собирать всех к одному часу." })
    ]), close: "Вернуться" }),
    zoomer: Object.freeze({ title: "Что за игра?", blocks: Object.freeze([
      Object.freeze({ heading: "Здесь легко влететь в чужой движ.", body: "Споры, вбросы, просьбы о помощи. Можешь вписаться, можешь остаться в стороне." }),
      Object.freeze({ heading: "За вброс прилетит ответ.", body: "Поддержал одного — другой уже косится. Победа в споре не всегда закрывает конфликт." }),
      Object.freeze({ heading: "Без «все онлайн в девять».", body: "Залетел, выбрал, вышел. Никого караулить не надо." })
    ]), close: "Вернуться" }),
    alpha: Object.freeze({ title: "Что за игра?", blocks: Object.freeze([
      Object.freeze({ heading: "тут у всех своё мнение", body: "один спорит. другой зовёт помочь. ты за кого?" }),
      Object.freeze({ heading: "влез — будет ответ", body: "кого-то поддержал — другой может обидеться. даже победа не всегда финал." }),
      Object.freeze({ heading: "зашёл. выбрал. вышел.", body: "все онлайн сразу не нужны. вернёшься потом." })
    ]), close: "Вернуться" }),
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
      title: source.title,
      blocks: source.blocks.map((block) => ({ ...block })),
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

  const focusableInside = (root) => Array.from(root.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )).filter((node) => !node.hidden && node.getAttribute("aria-hidden") !== "true");

  const closeModal = () => {
    const root = document.getElementById(MODAL_ID);
    if (!root || root.hidden) return;
    root.hidden = true;
    document.body.classList.remove("stage7EssenceOpen");
    if (Game.Telemetry && typeof Game.Telemetry.clearModal === "function") {
      Game.Telemetry.clearModal("user_close");
    }
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
      <section class="stage7EssenceDialog" role="dialog" aria-modal="true" aria-labelledby="stage7EssenceTitle" aria-describedby="stage7EssenceLead" data-telemetry-modal="stage7.essence">
        <button class="stage7EssenceX" type="button" data-stage7-essence-close aria-label="Закрыть">×</button>
        <h2 id="stage7EssenceTitle" class="stage7EssenceTitle"></h2>
        <div class="stage7EssenceComparison"></div>
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
    setText(root, ".stage7EssenceTitle", copy.title);
    const blocks = root.querySelector(".stage7EssenceComparison");
    if (blocks) {
      blocks.textContent = "";
      copy.blocks.forEach((block, index) => {
        const article = document.createElement("article");
        article.className = "stage7EssenceSide";
        const heading = document.createElement("h3");
        heading.textContent = block.heading;
        const body = document.createElement("p");
        body.className = "stage7EssenceBlockText";
        if (index === 0) body.id = "stage7EssenceLead";
        body.textContent = block.body;
        article.append(heading, body);
        blocks.appendChild(article);
      });
    }
    setText(root, ".stage7EssenceReturn", copy.close);
  };

  const openModal = () => {
    const root = ensureModal();
    renderModal(root, activeProfile());
    lastFocus = document.activeElement;
    root.hidden = false;
    document.body.classList.add("stage7EssenceOpen");
    if (Game.Telemetry && typeof Game.Telemetry.setModal === "function") {
      Game.Telemetry.setModal("stage7.essence");
    }
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
