(() => {
  if (typeof window === "undefined") return;
  if (window.__CONSOLE_TAPE_INSTALLED__) return;
  window.__CONSOLE_TAPE_INSTALLED__ = true;
  const STORE_KEY = "__CONSOLE_TAPE__V1";
  const DUMP_STATE_KEY = "DEV_CONSOLE_DUMP_STATE_V1";
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
  const tapeRecords = [];
  const MAX_RECORDS = 2000;
  const serializeArg = (arg, seen = new WeakSet()) => {
    try {
      if (typeof arg === "string") return arg;
      if (typeof arg === "number" || typeof arg === "boolean") return String(arg);
      if (arg === null) return "null";
      if (typeof arg === "undefined") return "undefined";
      if (typeof arg === "bigint") return `${arg.toString()}n`;
      if (typeof arg === "symbol") return arg.toString();
      if (typeof arg === "function") return `[Function ${arg.name || "anonymous"}]`;
      if (arg instanceof Error) return arg.stack || arg.message || String(arg);
      if (typeof arg === "object") {
        if (seen.has(arg)) return "[Circular]";
        seen.add(arg);
        const primitive = JSON.stringify(arg);
        seen.delete(arg);
        if (primitive !== undefined) return primitive;
        return `[Unserializable ${arg.constructor && arg.constructor.name ? arg.constructor.name : "Object"}]`;
      }
      return String(arg);
    } catch (_) {
      return `[Unserializable ${arg && arg.constructor ? arg.constructor.name : "Unknown"}]`;
    }
  };
  const recordEntry = (level, args = [], meta = {}) => {
    const entry = {
      ts: Date.now(),
      level,
      args: args.map(arg => serializeArg(arg)),
      ...meta
    };
    tapeRecords.push(entry);
    if (tapeRecords.length > MAX_RECORDS) {
      tapeRecords.shift();
    }
    return entry;
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
    debug: console.debug,
    group: console.group,
    groupCollapsed: console.groupCollapsed ? console.groupCollapsed : null,
    groupEnd: console.groupEnd ? console.groupEnd : null
  };
  const throttleState = window.__CONSOLE_TAPE_THROTTLE__ || (window.__CONSOLE_TAPE_THROTTLE__ = {
    minIntervalMs: 400,
    maxCount: 20,
    keys: Object.create(null)
  });
  const shouldSuppress = (args, method) => {
    if (!args || !args.length) return false;
    const key = (typeof args[0] === "string") ? args[0] : null;
    if (key !== "ECON_NPC_ENSURE_V2" && key !== "ECON_NPC_ACCOUNTS_CANON") return false;
    const now = Date.now();
    const entry = throttleState.keys[key] || { lastTs: 0, count: 0, suppressed: false };
    if (entry.count >= throttleState.maxCount || (now - entry.lastTs) < throttleState.minIntervalMs) {
      if (!entry.suppressed) {
        entry.suppressed = true;
        if (origConsole && origConsole.warn) {
          origConsole.warn(`${key}_THROTTLED`, { max: throttleState.maxCount, minIntervalMs: throttleState.minIntervalMs });
        }
      }
      throttleState.keys[key] = entry;
      return true;
    }
    entry.lastTs = now;
    entry.count += 1;
    throttleState.keys[key] = entry;
    return false;
  };
  const patch = (method) => {
    const orig = origConsole[method];
    console[method] = function (...args) {
      if (shouldSuppress(args, method)) return;
      if (method === "groupCollapsed") {
        appendLine(args.length ? `[GROUP_START] ${formatArg(args[0])}` : "[GROUP_START]");
        recordEntry("groupCollapsed", args);
      } else if (method === "group") {
        appendLine(args.length ? `[GROUP_START] ${formatArg(args[0])}` : "[GROUP_START]");
        recordEntry("group", args);
      } else if (method === "groupEnd") {
        appendLine("[GROUP_END]");
        recordEntry("groupEnd");
      } else if (!args.length) {
        appendLine(`[${method}]`);
        recordEntry(method, []);
      } else {
        args.forEach(arg => appendLine(`[${method}] ${formatArg(arg)}`));
        recordEntry(method, args);
      }
      if (orig) {
        orig.apply(console, args);
      }
    };
  };
  ["log", "warn", "error", "info", "debug", "group", "groupCollapsed", "groupEnd"].forEach((method) => {
    if (method === "groupCollapsed" && !origConsole.groupCollapsed) return;
    if (method === "groupEnd" && !origConsole.groupEnd) return;
    patch(method);
  });
  window.addEventListener("error", (event) => {
    recordEntry("onerror", [event.message, event.filename, event.lineno, event.colno, event.error]);
  });
  window.addEventListener("unhandledrejection", (event) => {
    recordEntry("unhandledrejection", [event.reason]);
  });
  const snapshotTape = () => tapeRecords.slice();

  const formatRecord = (record) => {
    const parts = record.args.length ? record.args : [];
    switch (record.level) {
      case "groupCollapsed":
        return `GROUP:collapsed ${parts[0] || ""}`.trim();
      case "group":
        return `GROUP ${parts[0] || ""}`.trim();
      case "groupEnd":
        return "ENDGROUP";
      case "error":
        return `ERROR ${parts.join(" ")}`.trim();
      case "warn":
        return `WARN ${parts.join(" ")}`.trim();
      case "info":
        return `INFO ${parts.join(" ")}`.trim();
      case "debug":
        return `DEBUG ${parts.join(" ")}`.trim();
      case "log":
        return `LOG ${parts.join(" ")}`.trim();
      case "onerror":
        return `ERROR_EVENT ${parts.join(" ")}`.trim();
      case "unhandledrejection":
        return `UNHANDLED_REJECTION ${parts.join(" ")}`.trim();
      default:
        return `${record.level.toUpperCase()} ${parts.join(" ")}`.trim();
    }
  };

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
    try {
      // ensure tape flush ensures all entries recorded
    } catch (_) {}
    const records = snapshotTape();
    const payloadLines = records.map(formatRecord);
    const payload = payloadLines.join("\n");
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
  window.__CONSOLE_TAPE_SNAPSHOT__ = snapshotTape;
  const dumpTapeTailOnce = (opts = {}) => {
    const lastN = (opts && Number.isFinite(opts.lastN)) ? Math.max(1, opts.lastN | 0) : 50;
    let lines = [];
    try {
      lines = read().split("\n").filter(Boolean);
    } catch (_) {}
    const tail = lines.slice(-lastN);
    tail.forEach(line => {
      if (origConsole && origConsole.log) origConsole.log(line);
    });
    return { ok: true, lastN, lines: tail.length };
  };
  window.__CONSOLE_TAPE_DUMP_TAIL_ONCE__ = dumpTapeTailOnce;
  const emitTaggedWarn = (tag, payload) => {
    const args = [tag, payload];
    if (shouldSuppress(args, "warn")) return { printed: false, suppressed: true };
    args.forEach(arg => appendLine(`[warn] ${formatArg(arg)}`));
    if (origConsole && origConsole.warn) origConsole.warn(tag, payload);
    return { printed: true, suppressed: false };
  };
  window.__CONSOLE_TAPE_EMIT_TAGGED_WARN__ = emitTaggedWarn;
  window.__CONSOLE_TAPE_THROTTLE_STATE__ = () => ({
    minIntervalMs: throttleState.minIntervalMs,
    maxCount: throttleState.maxCount
  });
  window.__DUMP_ALL__ = dump;
  window.__DUMP_CLEAR__ = clear;
  appendLine("CONSOLE_TAPE_V1_READY");
  console.warn("CONSOLE_TAPE_V1_READY");
  const triggerAlias = () => {
    const installed = installGameAliases();
    if (installed) {
      console.warn("DUMP_ALIAS_OK", safeStringify({ hasGame: !!window.Game, gameDumpAll: !!(window.Game && window.Game.__DUMP_ALL__), gameDumpClear: !!(window.Game && window.Game.__DUMP_CLEAR__) }));
    }
    try {
      if (window.Game && window.Game.__DEV && typeof window.Game.__DEV.dumpTapeTailOnce !== "function") {
        window.Game.__DEV.dumpTapeTailOnce = dumpTapeTailOnce;
      }
    } catch (_) {}
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
