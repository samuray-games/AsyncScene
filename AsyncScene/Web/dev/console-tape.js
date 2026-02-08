(() => {
  if (typeof window === "undefined") return;
  if (window.__CONSOLE_TAPE_INSTALLED__) return;
  window.__CONSOLE_TAPE_INSTALLED__ = true;
  const STORE_KEY = "__CONSOLE_TAPE__V1";
  const MAX_CHARS = 2_000_000;
  const safeStorage = () => {
    try {
      return window.localStorage;
    } catch (_err) {
      return null;
    }
  };
  const read = () => {
    const store = safeStorage();
    if (!store) return "";
    const raw = store.getItem(STORE_KEY);
    return typeof raw === "string" ? raw : "";
  };
  const write = (value) => {
    const store = safeStorage();
    if (!store) return;
    try {
      store.setItem(STORE_KEY, value);
    } catch (_) {}
  };
  let linesCount = 0;
  let lastLine = "";
  const appendLine = (line) => {
    const text = String(line);
    lastLine = text;
    linesCount += 1;
    const current = read();
    const next = current + text + "\n";
    if (next.length > MAX_CHARS) {
      write(next.slice(-MAX_CHARS));
    } else {
      write(next);
    }
  };
  const flushTape = () => {
    try {
      const current = read();
      write(current);
      return { ok: true, bytes: current.length, lines: linesCount };
    } catch (e) {
      if (origConsole && origConsole.log) {
        origConsole.log("TAPE_FLUSH_FAIL", String(e), e && e.stack ? String(e.stack) : null);
      }
      return { ok: false, bytes: 0, lines: linesCount, err: String(e) };
    }
  };
  const formatArg = (arg) => {
    try {
      if (typeof arg === "string") return arg;
      if (typeof arg === "undefined") return "undefined";
      if (arg === null) return "null";
      if (arg instanceof Error) return arg.stack || arg.message || String(arg);
      if (typeof arg === "object") return JSON.stringify(arg);
      return String(arg);
    } catch (_) {
      return "[Unserializable Object]";
    }
  };
  const origConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
    debug: console.debug
  };
  const patch = (method) => {
    const orig = origConsole[method];
    console[method] = function (...args) {
      if (!args.length) {
        appendLine(`[${method}]`);
      } else {
        args.forEach(arg => appendLine(`[${method}] ${formatArg(arg)}`));
      }
      if (orig) {
        orig.apply(console, args);
      }
    };
  };
  ["log", "warn", "error", "info", "debug"].forEach(patch);
  const dump = () => {
    try {
      if (typeof window !== "undefined" && typeof window.__CONSOLE_TAPE_FLUSH__ === "function") {
        window.__CONSOLE_TAPE_FLUSH__();
      }
    } catch (e) {
      if (origConsole && origConsole.log) {
        origConsole.log("TAPE_FLUSH_FAIL", String(e), e && e.stack ? String(e.stack) : null);
      }
    }
    let text = "";
    let lines = [];
    let tail = [];
    let meta = { linesCount: 0, lastLine: "(missing)" };
    try {
      text = read();
      lines = text.split("\n").filter(Boolean);
      tail = lines.slice(-5);
      meta = { linesCount: lines.length, lastLine: (tail[tail.length - 1] || lastLine || "(missing)").replace(/\n/g, "\\n") };
    } catch (e) {
      if (origConsole && origConsole.log) {
        origConsole.log("TAPE_READ_FAIL", String(e), e && e.stack ? String(e.stack) : null);
      }
    }
    const tailBlock = [
      "CONSOLE_DUMP_INCLUDED_TAPE_TAIL_BEGIN",
      `[CONSOLE_DUMP_INCLUDED_TAPE_TAIL count=${meta.linesCount} lastLine=${meta.lastLine}]`,
      `[TAPE_TAIL_1] ${tail[0] || ""}`,
      `[TAPE_TAIL_2] ${tail[1] || ""}`,
      `[TAPE_TAIL_3] ${tail[2] || ""}`,
      `[TAPE_TAIL_4] ${tail[3] || ""}`,
      `[TAPE_TAIL_5] ${tail[4] || ""}`,
      "CONSOLE_DUMP_INCLUDED_TAPE_TAIL_END"
    ].join("\n");
    const base = text || "";
    const payload = base + (base.endsWith("\n") || base.length === 0 ? "" : "\n") + tailBlock + "\n";
    if (navigator && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(payload).catch(() => {});
    }
    return payload;
  };
  const clear = () => {
    write("");
    return "";
  };
  const emitLine = (line) => {
    const text = String(line);
    try {
      appendLine(text);
    } catch (e) {
      if (origConsole && origConsole.log) {
        origConsole.log("TAPE_APPEND_FAIL", String(e), e && e.stack ? String(e.stack) : null);
      }
    }
    if (origConsole && origConsole.log) origConsole.log(text);
  };
  const installGameAliases = () => {
    if (typeof window.Game === "undefined") return false;
    let ok = false;
    if (window.Game && !window.Game.__DUMP_ALL__) {
      window.Game.__DUMP_ALL__ = dump;
      ok = true;
    }
    if (window.Game && !window.Game.__DUMP_CLEAR__) {
      window.Game.__DUMP_CLEAR__ = clear;
      ok = true;
    }
    return ok;
  };
  window.__CONSOLE_TAPE_EMIT_LINE__ = emitLine;
  window.__CONSOLE_TAPE_READ__ = read;
  window.__CONSOLE_TAPE_FLUSH__ = flushTape;
  window.__CONSOLE_TAPE_LAST__ = () => ({ lastLine, linesCount });
  window.__DUMP_ALL__ = dump;
  window.__DUMP_CLEAR__ = clear;
  appendLine("CONSOLE_TAPE_V1_READY");
  console.warn("CONSOLE_TAPE_V1_READY");
  const triggerAlias = () => {
    const installed = installGameAliases();
    if (installed) {
      console.warn("DUMP_ALIAS_OK", safeStringify({ hasGame: !!window.Game, gameDumpAll: !!(window.Game && window.Game.__DUMP_ALL__), gameDumpClear: !!(window.Game && window.Game.__DUMP_CLEAR__) }));
    }
    return installed;
  };
  if (!triggerAlias()) {
    setTimeout(() => {
      if (!triggerAlias()) {
        setTimeout(() => {
          triggerAlias();
        }, 50);
      }
    }, 0);
  }
  const safeStringify = (value) => {
    try {
      if (typeof value === "function") return "[function]";
      if (typeof value === "undefined") return "undefined";
      if (value === null) return "null";
      return JSON.stringify(value);
    } catch (_) {
      return String(value);
    }
  };

  window.__RUN__ = function (src) {
    console.warn("[repl] >", String(src));
    let value;
    try {
      value = (0, eval)(String(src));
    } catch (e) {
      const name = e && e.name ? String(e.name) : "Error";
      const message = e && e.message ? String(e.message) : String(e);
      console.error(`[repl] < ERROR ${name}: ${message}`);
      if (e && e.stack) console.error(String(e.stack));
      const result = { ok: false, error: { name, message, stack: e && e.stack ? String(e.stack) : null } };
      console.log("[repl] <", safeStringify(result));
      return result;
    }
    console.log("[repl] <", safeStringify(value));
    return value;
  };
  console.warn("REPL_TAPE_V1_READY use __RUN__(\"...\") to capture manual commands");
})();
