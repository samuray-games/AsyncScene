(() => {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const isDevMode = (() => {
    try {
      const flag = window.__DEV__ === true || window.DEV === true;
      if (flag) return true;
      if (typeof location !== "undefined" && location.search) {
        const params = new URLSearchParams(location.search);
        return params.get("dev") === "1";
      }
    } catch (_) {}
    return false;
  })();
  if (!isDevMode) return;

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
      <button data-panel-run-dump>Run+Dump</button>
      <button data-panel-dump>Dump</button>
      <button data-panel-clear>Clear Tape</button>
    </div>
  `;
  document.body.appendChild(panel);

  const textarea = panel.querySelector("[data-panel-input]");
  const buttonRun = panel.querySelector("[data-panel-run]");
  const buttonRunDump = panel.querySelector("[data-panel-run-dump]");
  const buttonDump = panel.querySelector("[data-panel-dump]");
  const buttonClear = panel.querySelector("[data-panel-clear]");
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

  const runCommand = async (dumpAfter = false) => {
    const code = textarea.value.trim();
    if (!code) return;
    const runId = `panel_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    console.warn("CONSOLE_PANEL_RUN_BEGIN id=" + runId, code);
    pushHistory(code);
    let result;
    let failed = false;
    try {
      if (typeof window.__RUN__ === "function") {
        result = await window.__RUN__(code);
      } else if (typeof window.__EVAL__ === "function") {
        result = await window.__EVAL__(() => eval(code));
      } else {
        throw new Error("Run helper missing");
      }
      if (result && result.ok === false) {
        const wantsPanelError = result && result.showPanel === true;
        if (wantsPanelError) {
          failed = true;
          const errorPreview = result.error || result;
          console.error("CONSOLE_PANEL_RUN_ERR id=" + runId, errorPreview);
        } else {
          const preview = result;
          console.warn("CONSOLE_PANEL_RUN_OK id=" + runId, preview);
        }
      } else {
        const preview = result;
        console.warn("CONSOLE_PANEL_RUN_OK id=" + runId, preview);
      }
    } catch (err) {
      failed = true;
      console.error("CONSOLE_PANEL_RUN_ERR id=" + runId, err);
    } finally {
      if (dumpAfter && typeof window.__DUMP_ALL__ === "function") {
        await window.__DUMP_ALL__();
      }
    }
  };

  const runAndDump = () => runCommand(true);
  const justDump = async () => {
    if (typeof window.__DUMP_ALL__ === "function") await window.__DUMP_ALL__();
  };

  buttonRun.addEventListener("click", () => runCommand(false));
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

  const showPanel = () => panel.classList.remove("hidden");
  const togglePanel = () => panel.classList.toggle("hidden");
  window.toggleConsolePanel = togglePanel;
  window.showConsolePanel = showPanel;
  console.warn("CONSOLE_PANEL_V1_READY");
})();
