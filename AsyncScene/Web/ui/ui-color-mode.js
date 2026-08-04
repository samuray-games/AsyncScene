/* Stage 6.2 light/dark color-mode controller.
   Presentation-only local preference. Never reads or mutates game state. */
(() => {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (window.__ASYNC_SCENE_COLOR_MODE__?.installed) return;

  const STORAGE_KEY = "asyncscene.uiColorMode";
  const PREFERENCES = Object.freeze(["system", "light", "dark"]);
  const LABELS = Object.freeze({
    system: "Авто",
    light: "Светлая",
    dark: "Тёмная"
  });
  const RESOLVED_LABELS = Object.freeze({
    light: "светлая",
    dark: "тёмная"
  });
  const root = document.documentElement;
  const media = typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

  const normalizePreference = (value) => {
    const normalized = String(value || "").trim().toLowerCase();
    return PREFERENCES.includes(normalized) ? normalized : "system";
  };

  const readPreference = () => {
    try {
      return normalizePreference(window.localStorage?.getItem(STORAGE_KEY));
    } catch (_) {
      return "system";
    }
  };

  let preference = readPreference();

  const resolvedMode = () => {
    if (preference === "light" || preference === "dark") return preference;
    return media?.matches ? "dark" : "light";
  };

  const snapshot = () => ({
    preference,
    mode: resolvedMode()
  });

  const syncControls = () => {
    const wrap = document.getElementById("uiColorModeControls");
    if (!wrap) return;

    const current = snapshot();
    wrap.dataset.preference = current.preference;
    wrap.dataset.mode = current.mode;

    const resolved = wrap.querySelector(".uiColorModeResolved");
    if (resolved) resolved.textContent = `Сейчас: ${RESOLVED_LABELS[current.mode]}`;

    wrap.querySelectorAll("[data-ui-color-preference]").forEach((button) => {
      const active = button.dataset.uiColorPreference === current.preference;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  };

  const dispatchChange = (reason) => {
    if (typeof window.CustomEvent !== "function") return;
    const current = snapshot();
    window.dispatchEvent(new CustomEvent("asyncscene:color-mode-change", {
      detail: {
        preference: current.preference,
        mode: current.mode,
        reason: String(reason || "apply")
      }
    }));
  };

  const apply = (reason) => {
    const current = snapshot();
    root.dataset.uiColorPreference = current.preference;
    root.dataset.uiColorMode = current.mode;
    root.style.colorScheme = current.mode;
    syncControls();
    dispatchChange(reason);
    return current;
  };

  const writePreference = (value) => {
    try {
      if (!window.localStorage) return;
      if (value === "system") window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, value);
    } catch (_) {}
  };

  const setPreference = (value) => {
    preference = normalizePreference(value);
    writePreference(preference);
    return apply("preference");
  };

  const ensureControls = () => {
    const menuBody = document.getElementById("menuBody");
    if (!menuBody) return null;

    let wrap = document.getElementById("uiColorModeControls");
    if (!wrap) {
      wrap = document.createElement("section");
      wrap.id = "uiColorModeControls";
      wrap.className = "uiColorModeControls";
      wrap.setAttribute("aria-label", "Оформление");

      const header = document.createElement("div");
      header.className = "uiColorModeHeader";

      const label = document.createElement("div");
      label.className = "uiColorModeLabel";
      label.textContent = "Оформление";

      const resolved = document.createElement("div");
      resolved.className = "uiColorModeResolved";
      resolved.setAttribute("aria-live", "polite");

      const choices = document.createElement("div");
      choices.className = "uiColorModeChoices";
      choices.setAttribute("role", "group");
      choices.setAttribute("aria-label", "Цветовая тема");

      PREFERENCES.forEach((value) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "btn small uiColorModeButton";
        button.dataset.uiColorPreference = value;
        button.textContent = LABELS[value];
        button.title = value === "system"
          ? "Следовать системному оформлению"
          : `Всегда использовать ${RESOLVED_LABELS[value]} оформление`;
        button.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          setPreference(value);
        });
        choices.appendChild(button);
      });

      header.appendChild(label);
      header.appendChild(resolved);
      wrap.appendChild(header);
      wrap.appendChild(choices);
      menuBody.prepend(wrap);
    }

    syncControls();
    return wrap;
  };

  const installUiHooks = () => {
    window.Game = window.Game || {};
    const UI = window.Game.UI;
    if (!UI || typeof UI !== "object") return false;

    UI.getColorModePreference = () => preference;
    UI.getResolvedColorMode = () => resolvedMode();
    UI.setColorModePreference = (value) => setPreference(value);
    UI.ensureColorModeControls = ensureControls;

    if (typeof UI.renderMenu === "function" && !UI.renderMenu.__stage6_2ColorModeWrapped) {
      const original = UI.renderMenu;
      const wrapped = function stage6_2RenderMenuWithColorMode(...args) {
        const result = original.apply(this, args);
        ensureControls();
        return result;
      };
      wrapped.__stage6_2ColorModeWrapped = true;
      wrapped.__stage6_2ColorModeOriginal = original;
      UI.renderMenu = wrapped;
    }

    ensureControls();

    const menuBody = document.getElementById("menuBody");
    if (menuBody && typeof window.MutationObserver === "function") {
      const observer = new MutationObserver(() => {
        if (!document.getElementById("uiColorModeControls")) ensureControls();
      });
      observer.observe(menuBody, { childList: true });
      window.__ASYNC_SCENE_COLOR_MODE__.observer = observer;
    }

    const menuButton = document.getElementById("btnMenu");
    menuButton?.addEventListener("click", () => {
      window.setTimeout(ensureControls, 0);
    });

    return true;
  };

  const installWhenReady = () => {
    if (installUiHooks()) return;
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      if (installUiHooks() || attempts >= 100) window.clearInterval(timer);
    }, 25);
  };

  const onSystemModeChange = () => {
    if (preference === "system") apply("system");
  };

  if (media) {
    if (typeof media.addEventListener === "function") media.addEventListener("change", onSystemModeChange);
    else if (typeof media.addListener === "function") media.addListener(onSystemModeChange);
  }

  window.__ASYNC_SCENE_COLOR_MODE__ = {
    installed: true,
    storageKey: STORAGE_KEY,
    preferences: PREFERENCES,
    getPreference: () => preference,
    getResolvedMode: () => resolvedMode(),
    setPreference,
    apply,
    ensureControls,
    observer: null
  };

  apply("bootstrap");

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installWhenReady, { once: true });
  } else {
    installWhenReady();
  }
})();
