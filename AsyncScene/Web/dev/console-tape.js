(() => {
  if (typeof window === "undefined") return;
  if (window.__CONSOLE_TAPE_MODULE_V1__) return;
  window.__CONSOLE_TAPE_MODULE_V1__ = true;

  const DEFAULT_CAPACITY = 5000;
  const tape = window.__CONSOLE_TAPE__ || {
    buf: [],
    cap: DEFAULT_CAPACITY
  };
  if (!Array.isArray(tape.buf)) {
    tape.buf = [];
  }
  if (!Number.isFinite(tape.cap) || tape.cap <= 0) {
    tape.cap = DEFAULT_CAPACITY;
  }
  const ensureCapacity = () => {
    if (tape.buf.length > tape.cap) {
      tape.buf.splice(0, tape.buf.length - tape.cap);
    }
  };
  if (typeof tape.push !== "function") {
    tape.push = (level, args = []) => {
      const entry = { ts: Date.now(), level, args: Array.from(args) };
      tape.buf.push(entry);
      ensureCapacity();
      return entry;
    };
  }

  const SERIALIZE_DEFAULTS = {
    depth: 4,
    maxKeys: 50,
    maxArray: 50,
    maxString: 500,
    maxBytes: 4000
  };
  const SERIALIZE_BLOCK_DEFAULTS = {
    depth: 6,
    maxKeys: 100,
    maxArray: 100,
    maxString: 2000,
    maxBytes: 12000
  };
  const clampString = (value, maxLen) => {
    const text = String(value);
    if (text.length <= maxLen) return text;
    return `${text.slice(0, maxLen)}…`;
  };
  const capBytes = (text, maxBytes) => {
    if (!maxBytes || text.length <= maxBytes) return text;
    return `${text.slice(0, maxBytes)}…(truncated)`;
  };
  const describeDom = (node) => {
    const tag = node.nodeName ? String(node.nodeName).toLowerCase() : "dom";
    const id = node.id ? `#${node.id}` : "";
    const cls = node.className ? `.${String(node.className).split(/\s+/).filter(Boolean).join(".")}` : "";
    return `<DOM ${tag}${id}${cls}>`;
  };
  const serializeArg = (value, opts = SERIALIZE_DEFAULTS, ctx = { seen: new WeakSet(), depth: opts.depth }) => {
    const type = typeof value;
    if (value === null) return "null";
    if (type === "string") return clampString(value, opts.maxString);
    if (type === "number" || type === "boolean") return String(value);
    if (type === "undefined") return "undefined";
    if (type === "bigint") return `<bigint:${value.toString()}>`;
    if (type === "symbol") return value.toString();
    if (type === "function") return `<function ${value.name || "anonymous"}>`;
    if (value instanceof Error) {
      const header = `${value.name || "Error"}: ${value.message || ""}`.trim();
      const stack = value.stack ? String(value.stack) : "";
      const combined = stack && !stack.includes(header) ? `${header}\n${stack}` : (stack || header);
      return capBytes(combined, opts.maxBytes);
    }
    if (value && typeof value === "object") {
      if (value.nodeType && value.nodeName) {
        return describeDom(value);
      }
      if (ctx.seen.has(value)) return "[Circular]";
      if (ctx.depth <= 0) {
        return `[MaxDepth ${value.constructor && value.constructor.name ? value.constructor.name : "Object"}]`;
      }
      ctx.seen.add(value);
      const nextCtx = { seen: ctx.seen, depth: ctx.depth - 1 };
      let text;
      if (Array.isArray(value)) {
        const limit = Math.min(value.length, opts.maxArray);
        const parts = [];
        for (let i = 0; i < limit; i += 1) {
          parts.push(serializeArg(value[i], opts, nextCtx));
        }
        if (value.length > limit) {
          parts.push(`…(+${value.length - limit})`);
        }
        text = `[${parts.join(", ")}]`;
      } else {
        const keys = Object.keys(value).sort();
        const limit = Math.min(keys.length, opts.maxKeys);
        const parts = [];
        for (let i = 0; i < limit; i += 1) {
          const key = keys[i];
          const valText = serializeArg(value[key], opts, nextCtx);
          parts.push(`${key}: ${valText}`);
        }
        if (keys.length > limit) {
          parts.push(`…(+${keys.length - limit} keys)`);
        }
        const label = value.constructor && value.constructor.name ? value.constructor.name : "Object";
        text = `${label}{${parts.join(", ")}}`;
      }
      ctx.seen.delete(value);
      return capBytes(text, opts.maxBytes);
    }
    return clampString(String(value), opts.maxString);
  };
  const serializeArgPretty = (value, opts = SERIALIZE_BLOCK_DEFAULTS) => {
    const seen = new WeakSet();
    const indentStep = "  ";
    const render = (val, depth, indent) => {
      const type = typeof val;
      if (val === null) return "null";
      if (type === "string") return clampString(val, opts.maxString);
      if (type === "number" || type === "boolean") return String(val);
      if (type === "undefined") return "undefined";
      if (type === "bigint") return `<bigint:${val.toString()}>`;
      if (type === "symbol") return val.toString();
      if (type === "function") return `<function ${val.name || "anonymous"}>`;
      if (val instanceof Error) {
        const header = `${val.name || "Error"}: ${val.message || ""}`.trim();
        const stack = val.stack ? String(val.stack) : "";
        const combined = stack && !stack.includes(header) ? `${header}\n${stack}` : (stack || header);
        return capBytes(combined, opts.maxBytes);
      }
      if (val && typeof val === "object") {
        if (val.nodeType && val.nodeName) return describeDom(val);
        if (seen.has(val)) return "[Circular]";
        if (depth <= 0) {
          return `[MaxDepth ${val.constructor && val.constructor.name ? val.constructor.name : "Object"}]`;
        }
        seen.add(val);
        const nextDepth = depth - 1;
        if (Array.isArray(val)) {
          const limit = Math.min(val.length, opts.maxArray);
          const rows = [];
          for (let i = 0; i < limit; i += 1) {
            rows.push(`${indent}${indentStep}${render(val[i], nextDepth, indent + indentStep)}`);
          }
          if (val.length > limit) {
            rows.push(`${indent}${indentStep}…(+${val.length - limit})`);
          }
          seen.delete(val);
          return `[\n${rows.join("\n")}\n${indent}]`;
        }
        const keys = Object.keys(val).sort();
        const limit = Math.min(keys.length, opts.maxKeys);
        const rows = [];
        for (let i = 0; i < limit; i += 1) {
          const key = keys[i];
          rows.push(`${indent}${indentStep}${key}: ${render(val[key], nextDepth, indent + indentStep)}`);
        }
        if (keys.length > limit) {
          rows.push(`${indent}${indentStep}…(+${keys.length - limit} keys)`);
        }
        const label = val.constructor && val.constructor.name ? val.constructor.name : "Object";
        seen.delete(val);
        return `${label}{\n${rows.join("\n")}\n${indent}}`;
      }
      return clampString(String(val), opts.maxString);
    };
    return capBytes(render(value, opts.depth, ""), opts.maxBytes);
  };

  const formatRecord = (record) => {
    const args = Array.isArray(record.args) ? record.args : [];
    const formattedArgs = args.map((arg) => serializeArg(arg, SERIALIZE_DEFAULTS));
    const joinArgs = (prefix) => [prefix, ...formattedArgs].join(" ").trim();
    switch (record.level) {
      case "groupCollapsed":
        return joinArgs("GROUP:collapsed");
      case "group":
        return joinArgs("GROUP");
      case "groupEnd":
        return "ENDGROUP";
      case "error":
        return joinArgs("ERROR");
      case "warn":
        return joinArgs("WARN");
      case "info":
        return joinArgs("INFO");
      case "debug":
        return joinArgs("DEBUG");
      case "log":
        return joinArgs("LOG");
      case "onerror":
        return joinArgs("ERROR_EVENT");
      case "unhandledrejection":
        return joinArgs("UNHANDLED_REJECTION");
      default:
        return joinArgs(String(record.level).toUpperCase());
    }
  };

  const PROOF_URL = "/__dev/console-dump-proof";
  let proofCache = null;
  let proofPromise = null;

  const requestProof = async () => {
    const url = `${PROOF_URL}?v=${Date.now()}`;
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: { Accept: "application/json" }
    });
    const rawText = await response.text().catch(() => "");
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (_) {
      data = { ok: false, err: "proof_non_json", raw: rawText.slice(0, 300) };
    }
    const proofValue = data && data.proof ? data.proof : "no-proof";
    console.warn("CONSOLE_DUMP_PROOF_OK", { status: response.status, proof: proofValue, ok: !!(data && data.ok) });
    if (response.status !== 200 || !data || !data.ok) {
      throw { status: response.status, payload: data, proof: proofValue };
    }
    return { status: response.status, proof: proofValue, data };
  };

  const ensureProof = async () => {
    if (proofCache && proofCache.ok) return proofCache;
    if (proofPromise) return proofPromise;
    proofPromise = requestProof()
      .then((result) => {
        proofCache = { ok: true, ...result };
        proofPromise = null;
        return proofCache;
      })
      .catch((err) => {
        proofPromise = null;
        throw err;
      });
    return proofPromise;
  };

  ensureProof().catch(() => {});

  const snapshotAllText = () => {
    const entries = tape.buf.slice();
    const lines = entries.map(formatRecord).filter(Boolean);
    return lines.join("\n").trimEnd();
  };

  let dumpInFlight = false;
  let lastOkRunId = null;

  const sendDump = async () => {
    const runId = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    if (dumpInFlight) {
      const duplicate = { ok: false, err: "dump_in_flight", runId };
      if (lastOkRunId !== runId) {
        console.warn("CONSOLE_DUMP_WRITE_FAIL", duplicate);
      }
      return duplicate;
    }
    try {
      await ensureProof();
    } catch (proofError) {
      const status = proofError && proofError.status ? proofError.status : 0;
      const failure = { ok: false, err: "dump_endpoint_missing", status, runId };
      if (lastOkRunId !== runId) {
        console.warn("CONSOLE_DUMP_WRITE_FAIL", failure);
      }
      return failure;
    }
    const payload = snapshotAllText();
    let body = payload;
    if (typeof body !== "string") {
      if (body && typeof body.text === "string") {
        body = body.text;
      } else if (body && typeof body.payload === "string") {
        body = body.payload;
      } else {
        body = "";
      }
    }
    if (!body || !body.trim()) {
      const failure = { ok: false, err: "empty_dump_payload_client", runId };
      if (lastOkRunId !== runId) {
        console.warn("CONSOLE_DUMP_WRITE_FAIL", failure);
      }
      return failure;
    }
    const url = `/__dev/console-dump?v=${Date.now()}`;
    dumpInFlight = true;
    try {
      console.warn("CONSOLE_DUMP_POSTING_TO", url, runId);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Accept": "application/json",
          "X-Dump-Run-Id": runId
        },
        cache: "no-store",
        body
      });
      const rawText = await response.text().catch(() => "");
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (parseError) {
        data = {
          ok: false,
          err: "non_json_response",
          status: response.status,
          raw: rawText.slice(0, 300)
        };
      }
      const proof = data && data.proof ? data.proof : "no-proof";
      const logEntry = { proof, status: response.status, runId, ...data };
      if (data && data.ok) {
        lastOkRunId = runId;
        console.warn("CONSOLE_DUMP_WRITE_OK", logEntry);
      } else if (lastOkRunId !== runId) {
        console.warn("CONSOLE_DUMP_WRITE_FAIL", logEntry);
      }
      return data;
    } catch (error) {
      const failure = { ok: false, err: String(error), runId };
      if (lastOkRunId !== runId) {
        console.warn("CONSOLE_DUMP_WRITE_FAIL", failure);
      }
      return failure;
    } finally {
      dumpInFlight = false;
    }
  };

  const clearBuffer = () => {
    tape.buf.length = 0;
  };
  const markTape = (tag, obj) => {
    const payload = obj ? serializeArg(obj, SERIALIZE_DEFAULTS) : "";
    tape.push("log", [`[TAPE_MARK] ${tag}${payload ? " " + payload : ""}`]);
    return payload;
  };

  window.__CONSOLE_TAPE_SNAPSHOT_ALL_TEXT__ = snapshotAllText;
  window.__CONSOLE_TAPE_SEND_DUMP__ = sendDump;
  window.__DUMP_ALL__ = sendDump;
  window.__DUMP_CLEAR__ = clearBuffer;
  window.__TAPE_CLEAR__ = clearBuffer;
  window.__TAPE_MARK__ = markTape;
  window.__CONSOLE_PANEL_SERIALIZE__ = (value) => serializeArg(value, SERIALIZE_DEFAULTS);
  window.__CONSOLE_PANEL_PRETTY__ = (value) => serializeArgPretty(value, SERIALIZE_BLOCK_DEFAULTS);

  const installGameAliases = () => {
    if (typeof window.Game !== "object" || window.Game === null) return false;
    let updated = false;
    if (window.Game.__DUMP_ALL__ !== sendDump) {
      window.Game.__DUMP_ALL__ = sendDump;
      updated = true;
    }
    if (window.Game.__DUMP_CLEAR__ !== clearBuffer) {
      window.Game.__DUMP_CLEAR__ = clearBuffer;
      updated = true;
    }
    return updated;
  };

  const scheduleAlias = () => {
    if (installGameAliases()) return;
    setTimeout(scheduleAlias, 200);
  };
  scheduleAlias();

  const wrapConsole = () => {
    if (window.__CONSOLE_TAPE_WRAP_V1__) return;
    window.__CONSOLE_TAPE_WRAP_V1__ = true;
    const orig = window.__CONSOLE_TAPE_ORIG__ || {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug,
      group: console.group,
      groupCollapsed: console.groupCollapsed,
      groupEnd: console.groupEnd
    };
    const shouldExpand = (arg, inline) => {
      if (!arg || typeof arg !== "object") return false;
      if (arg instanceof Error) return true;
      if (Array.isArray(arg)) return inline.length > 200 || arg.length > 5;
      return inline.length > 200;
    };
    const emitExpandBlock = (method, arg, index, runId) => {
      const pretty = serializeArgPretty(arg, SERIALIZE_BLOCK_DEFAULTS);
      const header = `BEGIN CONSOLE_EXPAND_V1 arg${index + 1}`;
      const footer = "END CONSOLE_EXPAND_V1";
      tape.push("log", [header]);
      tape.push("log", [pretty]);
      tape.push("log", [footer]);
      if (typeof orig[method] === "function") {
        orig[method].call(console, header);
        orig[method].call(console, pretty);
        orig[method].call(console, footer);
      }
    };
    const patchMethod = (method, label) => {
      if (typeof console[method] !== "function") return;
      console[method] = function (...args) {
        tape.push(method, args);
        const inline = args.map((arg) => serializeArg(arg, SERIALIZE_DEFAULTS));
        const line = `${label}${inline.length ? " " + inline.join(" ") : ""}`;
        if (typeof orig[method] === "function") {
          orig[method].call(console, line);
        }
        args.forEach((arg, idx) => {
          if (shouldExpand(arg, inline[idx] || "")) {
            emitExpandBlock(method, arg, idx);
          }
        });
      };
    };
    patchMethod("log", "LOG");
    patchMethod("info", "INFO");
    patchMethod("warn", "WARN");
    patchMethod("error", "ERROR");
    patchMethod("debug", "DEBUG");
    patchMethod("group", "GROUP");
    patchMethod("groupCollapsed", "GROUP:collapsed");
    patchMethod("groupEnd", "ENDGROUP");
  };
  wrapConsole();

  const runEval = async (src) => {
    const input = String(src);
    console.warn("[repl] >", input);
    try {
      let result = (0, eval)(input);
      if (result && typeof result.then === "function") {
        result = await result;
      }
      console.log("[repl] <", result);
      return result;
    } catch (err) {
      console.error("[repl] < ERROR", err);
      return {
        ok: false,
        error: {
          name: err && err.name ? String(err.name) : "Error",
          message: err && err.message ? String(err.message) : String(err),
          stack: err && err.stack ? String(err.stack) : null
        }
      };
    }
  };
  const evalFn = async (fn) => {
    if (typeof fn !== "function") {
      console.error("[repl] < ERROR", "Expected function");
      return { ok: false, error: { name: "TypeError", message: "Expected function", stack: null } };
    }
    try {
      let result = fn();
      if (result && typeof result.then === "function") {
        result = await result;
      }
      console.log("[repl] <", result);
      return result;
    } catch (err) {
      console.error("[repl] < ERROR", err);
      return {
        ok: false,
        error: {
          name: err && err.name ? String(err.name) : "Error",
          message: err && err.message ? String(err.message) : String(err),
          stack: err && err.stack ? String(err.stack) : null
        }
      };
    }
  };
  window.__RUN__ = runEval;
  window.__EVAL__ = evalFn;

  if (window.Game && typeof window.Game === "object") {
    window.Game.__RUN__ = runEval;
    window.Game.__EVAL__ = evalFn;
  }

  console.warn("CONSOLE_TAPE_V1_READY");
})();
