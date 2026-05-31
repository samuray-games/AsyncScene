(() => {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const DEV_MODE_STORAGE_KEY = "asyncscene.devModeUnlocked";
  const isDevMode = () => {
    try {
      return window.localStorage && window.localStorage.getItem(DEV_MODE_STORAGE_KEY) === "1";
    } catch (_) {
      return false;
    }
  };
  if (isDevMode()) {
    window.__ASYNC_SCENE_DEV_MODE_UNLOCKED__ = true;
    window.__DEV__ = true;
  }

  const CONSOLE_TAPE_SCRIPT_SRC = "dev/console-tape.js";
  const hasRunHelper = () => (
    typeof window.__RUN__ === "function" ||
    typeof window.RUN === "function" ||
    typeof window.__EVAL__ === "function" ||
    typeof window.EVAL === "function"
  );
  const ensureConsoleTapeLoaded = () => {
    if (!isDevMode()) return Promise.resolve(false);
    if (hasRunHelper()) return Promise.resolve(true);
    if (window.__ASYNC_SCENE_CONSOLE_TAPE_PROMISE__) {
      return window.__ASYNC_SCENE_CONSOLE_TAPE_PROMISE__.then(() => hasRunHelper());
    }
    window.__ASYNC_SCENE_CONSOLE_TAPE_PROMISE__ = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-asyncscene-console-tape="1"]');
      if (existing) {
        if (existing.dataset.asyncsceneConsoleTapeLoaded === "1" || hasRunHelper()) {
          resolve();
          return;
        }
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Console tape failed to load")), { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = `${CONSOLE_TAPE_SCRIPT_SRC}?v=20260531_run_helper_gate_1`;
      script.defer = true;
      script.dataset.asyncsceneConsoleTape = "1";
      script.onload = () => {
        script.dataset.asyncsceneConsoleTapeLoaded = "1";
        resolve();
      };
      script.onerror = () => reject(new Error("Console tape failed to load"));
      document.head.appendChild(script);
    }).then(() => {
      if (!hasRunHelper()) throw new Error("Run helper missing after console tape load");
      return true;
    }).catch((err) => {
      window.__ASYNC_SCENE_CONSOLE_TAPE_PROMISE__ = null;
      throw err;
    });
    return window.__ASYNC_SCENE_CONSOLE_TAPE_PROMISE__;
  };

  const PANEL_ID = "consolePanel";
  if (document.getElementById(PANEL_ID)) return;

  const style = document.createElement("style");
  style.textContent = `
    .console-panel {
      position: fixed;
      bottom: 12px;
      right: 12px;
      width: 420px;
      max-height: 70vh;
      background: rgba(5,5,10,0.95);
      color: #f5f5f5;
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 10px;
      padding: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.6);
      font-family: "IBM Plex Mono", "SF Mono", monospace;
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 9999;
    }
    .console-panel.hidden {
      display: none;
    }
    .console-panel textarea {
      width: 100%;
      min-height: 120px;
      background: rgba(0,0,0,0.4);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 6px;
      color: inherit;
      padding: 8px;
      resize: vertical;
      font-family: inherit;
    }
    .console-panel .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
    }
    .console-panel .panel-header button {
      border: none;
      background: transparent;
      color: inherit;
      font-size: 18px;
      cursor: pointer;
    }
    .console-panel .button-row {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .console-panel button {
      flex: 1;
      padding: 6px 8px;
      border-radius: 5px;
      border: 1px solid rgba(255,255,255,0.3);
      background: rgba(255,255,255,0.1);
      color: inherit;
      cursor: pointer;
    }
    .console-panel .history-row {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #aaa;
    }
    .console-panel .history-row span {
      cursor: pointer;
      text-decoration: underline;
    }
    .console-panel .panel-output {
      max-height: 120px;
      margin: 0;
      padding: 8px;
      overflow: auto;
      white-space: pre-wrap;
      word-break: break-word;
      background: rgba(0,0,0,0.28);
      border: 1px solid rgba(255,255,255,0.14);
      border-radius: 6px;
      color: #d7f7ff;
      font-size: 11px;
    }
    .console-panel .panel-status {
      min-height: 14px;
      font-size: 11px;
      color: #9ef7b9;
    }
  `;
  document.head.appendChild(style);

  const panel = document.createElement("div");
  panel.id = PANEL_ID;
  panel.className = "console-panel hidden";
  panel.innerHTML = `
    <div class="panel-header">
      <span>Console Panel</span>
      <button type="button" data-panel-close>×</button>
    </div>
    <textarea data-panel-input placeholder="Type JS expression..."></textarea>
    <div class="history-row">
      <span data-panel-history-prev>↑ History</span>
      <span data-panel-history-next>↓ History</span>
    </div>
    <div class="button-row">
      <button data-panel-run>Run</button>
      <button data-panel-run-copy>Run+Copy</button>
      <button data-panel-run-dump>Run+Dump</button>
      <button data-panel-dump>Dump</button>
      <button data-panel-clear>Clear Tape</button>
    </div>
    <pre class="panel-output" data-panel-output aria-live="polite"></pre>
    <div class="panel-status" data-panel-status aria-live="polite"></div>
  `;
  document.body.appendChild(panel);

  const textarea = panel.querySelector("[data-panel-input]");
  const buttonRun = panel.querySelector("[data-panel-run]");
  const buttonRunCopy = panel.querySelector("[data-panel-run-copy]");
  const buttonRunDump = panel.querySelector("[data-panel-run-dump]");
  const buttonDump = panel.querySelector("[data-panel-dump]");
  const buttonClear = panel.querySelector("[data-panel-clear]");
  const outputNode = panel.querySelector("[data-panel-output]");
  const statusNode = panel.querySelector("[data-panel-status]");
  const closeButton = panel.querySelector("[data-panel-close]");
  const historyPrev = panel.querySelector("[data-panel-history-prev]");
  const historyNext = panel.querySelector("[data-panel-history-next]");

  const historyStore = window.__CONSOLE_PANEL_HISTORY__ = window.__CONSOLE_PANEL_HISTORY__ || [];
  const HISTORY_LIMIT = 60;
  let historyIndex = -1;

  const serializePreview = (value) => {
    if (typeof window.__CONSOLE_PANEL_PRETTY__ === "function") {
      return window.__CONSOLE_PANEL_PRETTY__(value);
    }
    return String(value);
  };

  const renderMarkers = (runId, cmd, mode, payload) => {
    const prefix = `CONSOLE_PANEL_RUN_${mode}`;
    const preview = payload ? serializePreview(payload) : "";
    if (mode === "BEGIN") {
      console.warn(`${prefix} id=${runId}`, cmd);
    } else if (mode === "OK") {
      console.warn(`${prefix} id=${runId}`, preview);
    } else {
      console.error(`${prefix} id=${runId}`, preview);
    }
  };

  const pushHistory = (cmd) => {
    if (!cmd) return;
    if (historyStore[0] === cmd) return;
    historyStore.unshift(cmd);
    if (historyStore.length > HISTORY_LIMIT) historyStore.pop();
    historyIndex = -1;
  };

  const cycleHistory = (direction) => {
    if (!historyStore.length) return;
    if (historyIndex === -1) {
      historyIndex = 0;
    } else {
      historyIndex = (historyIndex + direction + historyStore.length) % historyStore.length;
    }
    textarea.value = historyStore[historyIndex];
  };

  const setCopyStatus = (message, failed = false) => {
    if (!statusNode) return;
    statusNode.textContent = message || "";
    statusNode.style.color = failed ? "#ffb3b3" : "#9ef7b9";
  };

  const setOutputText = (text) => {
    if (outputNode) outputNode.textContent = text || "";
  };

  const copyTextFallback = (text) => {
    const copyBox = document.createElement("textarea");
    copyBox.value = text;
    copyBox.setAttribute("readonly", "");
    copyBox.style.position = "fixed";
    copyBox.style.left = "-9999px";
    copyBox.style.top = "0";
    document.body.appendChild(copyBox);
    copyBox.focus();
    copyBox.select();
    copyBox.setSelectionRange(0, copyBox.value.length);
    let ok = false;
    try {
      ok = document.execCommand && document.execCommand("copy");
    } catch (_) {
      ok = false;
    }
    document.body.removeChild(copyBox);
    return !!ok;
  };

  const copyText = async (text) => {
    const nav = window.navigator || {};
    if (nav.clipboard && typeof nav.clipboard.writeText === "function") {
      try {
        await nav.clipboard.writeText(text);
        return true;
      } catch (_) {}
    }
    return copyTextFallback(text);
  };

  const runCommand = async (dumpAfter = false) => {
    if (!isDevMode()) {
      closePanel();
      return null;
    }
    const code = textarea.value.trim();
    if (!code) return null;
    setCopyStatus("");
    const runId = `panel_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    console.warn("CONSOLE_PANEL_RUN_BEGIN id=" + runId, code);
    pushHistory(code);
    let result;
    let failed = false;
    let outputText = "";
    try {
      await ensureConsoleTapeLoaded();
      if (typeof window.__RUN__ === "function") {
        result = await window.__RUN__(code);
      } else if (typeof window.RUN === "function") {
        result = await window.RUN(code);
      } else if (typeof window.__EVAL__ === "function") {
        result = await window.__EVAL__(() => eval(code));
      } else if (typeof window.EVAL === "function") {
        result = await window.EVAL(() => eval(code));
      } else {
        throw new Error("Run helper missing");
      }
      const evalType = typeof result;
      const evalKeys = (result && typeof result === "object" && !Array.isArray(result)) ? Object.keys(result) : [];
      const panelPreview = serializePreview(result);
      outputText = panelPreview;
      console.warn("CONSOLE_PANEL_EVAL_RESULT_V1", {
        type: evalType,
        isPromise: 0,
        keys: evalKeys,
        preview: panelPreview
      });
      if (typeof result === "undefined") {
        result = { ok: true, value: undefined };
      }
      if (result && result.ok === false) {
        const wantsPanelError = result && result.showPanel === true;
        if (wantsPanelError) {
          failed = true;
          const errorPreview = result.error || result;
          outputText = serializePreview(errorPreview);
          console.error("CONSOLE_PANEL_RUN_ERR id=" + runId, errorPreview);
        } else {
          const preview = result;
          outputText = serializePreview(preview);
          console.warn("CONSOLE_PANEL_RUN_OK id=" + runId, preview);
        }
      } else {
        const preview = result;
        outputText = serializePreview(preview);
        console.warn("CONSOLE_PANEL_RUN_OK id=" + runId, preview);
      }
    } catch (err) {
      failed = true;
      outputText = serializePreview(err && (err.stack || err.message) ? (err.stack || err.message) : err);
      console.error("CONSOLE_PANEL_RUN_ERR id=" + runId, err);
    } finally {
      setOutputText(outputText);
      if (dumpAfter && typeof window.__DUMP_ALL__ === "function") {
        await window.__DUMP_ALL__();
      }
    }
    return { failed, text: outputText };
  };

  const runAndCopy = async () => {
    const runResult = await runCommand(false);
    if (!runResult) return;
    const copied = await copyText(runResult.text);
    setCopyStatus(copied ? "Copied" : "Copy failed", !copied);
  };

  const runAndDump = () => runCommand(true);
  const justDump = async () => {
    if (!isDevMode()) {
      closePanel();
      return;
    }
    if (typeof window.__DUMP_ALL__ === "function") await window.__DUMP_ALL__();
  };

  buttonRun.addEventListener("click", () => runCommand(false));
  buttonRunCopy.addEventListener("click", runAndCopy);
  buttonRunDump.addEventListener("click", () => runCommand(true));
  buttonDump.addEventListener("click", justDump);
  buttonClear.addEventListener("click", () => {
    if (typeof window.__TAPE_CLEAR__ === "function") {
      window.__TAPE_CLEAR__();
      console.warn("CONSOLE_PANEL_TAPE_CLEARED");
    }
  });
  textarea.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      cycleHistory(-1);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      cycleHistory(1);
    }
  });
  historyPrev.addEventListener("click", () => cycleHistory(-1));
  historyNext.addEventListener("click", () => cycleHistory(1));
  closeButton.addEventListener("click", () => panel.classList.add("hidden"));

  const closePanel = () => panel.classList.add("hidden");
  const showPanel = () => {
    if (!isDevMode()) {
      closePanel();
      return;
    }
    ensureConsoleTapeLoaded().catch((err) => {
      console.error("CONSOLE_PANEL_TAPE_LOAD_ERR", err);
      setCopyStatus("Console tape load failed", true);
    });
    panel.classList.remove("hidden");
  };
  const togglePanel = () => {
    if (!isDevMode()) {
      closePanel();
      return;
    }
    if (panel.classList.contains("hidden")) {
      showPanel();
    } else {
      panel.classList.add("hidden");
    }
  };
  window.__ASYNC_SCENE_ENSURE_CONSOLE_TAPE__ = ensureConsoleTapeLoaded;
  window.closeConsolePanel = closePanel;
  window.toggleConsolePanel = togglePanel;
  window.showConsolePanel = showPanel;
  console.warn("CONSOLE_PANEL_V1_READY");
})();
