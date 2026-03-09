import { chromium } from "playwright";
import fs from "fs/promises";
import path from "path";
import process from "process";

const DEFAULT_URL = "https://samuray-games.github.io/AsyncScene/";
const PAGE_LOAD_TIMEOUT_MS = 45000;
const WAIT_GAME_TIMEOUT_MS = 30000;
const WAIT_DEV_TIMEOUT_MS = 30000;
const SMOKE_TIMEOUT_MS = 30000;

const smokeName = process.argv[2];
const targetUrl = process.env.ASYNCSCENE_SMOKE_URL || DEFAULT_URL;
const headful = process.env.HEADFUL === "1";
const slowMo = process.env.SLOWMO ? Number(process.env.SLOWMO) : 0;
const logJson = process.env.SMOKE_LOG_JSON === "1";

const timeTag = new Date().toISOString().replace(/[:.]/g, "-");
const logsDir = path.resolve("logs");

const consoleMessages = [];
const pageErrors = [];

function toErrorObject(err) {
  if (!err) {
    return null;
  }
  if (err instanceof Error) {
    return { name: err.name, message: err.message, stack: err.stack || null };
  }
  return { name: "Error", message: String(err), stack: null };
}

async function ensureLogsDir() {
  try {
    await fs.mkdir(logsDir, { recursive: true });
  } catch {
    // ignore
  }
}

function safeSerialize(value) {
  const seen = new WeakSet();
  function walk(v) {
    if (v === null) return null;
    if (v === undefined) return { __type: "undefined" };
    const t = typeof v;
    if (t === "string" || t === "number" || t === "boolean") return v;
    if (t === "bigint") return { __type: "bigint", value: v.toString() };
    if (t === "symbol") return { __type: "symbol", value: String(v) };
    if (t === "function") return `[Function${v.name ? `: ${v.name}` : ""}]`;
    if (v instanceof Date) return { __type: "date", value: v.toISOString() };
    if (v instanceof RegExp) return { __type: "regexp", value: v.toString() };
    if (v instanceof Error) {
      return { name: v.name, message: v.message, stack: v.stack || null };
    }
    if (Array.isArray(v)) return v.map(walk);
    if (t === "object") {
      if (seen.has(v)) return "[Circular]";
      seen.add(v);
      if (v instanceof Map) {
        return { __type: "map", value: Array.from(v.entries()).map(([k, val]) => [walk(k), walk(val)]) };
      }
      if (v instanceof Set) {
        return { __type: "set", value: Array.from(v.values()).map(walk) };
      }
      const out = {};
      for (const key of Object.keys(v)) {
        out[key] = walk(v[key]);
      }
      return out;
    }
    return String(v);
  }
  return walk(value);
}

function sortKeys(value) {
  if (Array.isArray(value)) {
    return value.map(sortKeys);
  }
  if (value && typeof value === "object") {
    const keys = Object.keys(value).sort();
    const out = {};
    for (const key of keys) {
      out[key] = sortKeys(value[key]);
    }
    return out;
  }
  return value;
}

function stableStringify(value) {
  return JSON.stringify(sortKeys(value), null, 2);
}

async function writeJsonLog(payload) {
  if (!logJson) return;
  await ensureLogsDir();
  const logPath = path.join(logsDir, `asyncscene-smoke-${timeTag}.json`);
  try {
    await fs.writeFile(logPath, payload, "utf8");
  } catch {
    // ignore
  }
}

async function captureScreenshot(page, label) {
  if (!page) return null;
  await ensureLogsDir();
  const screenshotPath = path.join(logsDir, `asyncscene-smoke-${timeTag}-${label}.png`);
  try {
    await page.screenshot({ path: screenshotPath, fullPage: true });
    return screenshotPath;
  } catch {
    return null;
  }
}

async function finalize(result, exitCode) {
  const payload = stableStringify(safeSerialize(result));
  process.stdout.write(`BEGIN_SMOKE_RESULT\n${payload}\nEND_SMOKE_RESULT\n`);
  await writeJsonLog(payload);
  // Выходим с кодом 0 только если smoke реально выполнен; инфраструктурные сбои — non-zero.
  process.exit(exitCode);
}

async function run() {
  if (!smokeName) {
    await finalize(
      {
        ok: false,
        reason: "arg_missing",
        phase: "browser",
        smokeName: null,
        pageTitle: null,
        pageUrl: targetUrl,
        consoleMessages,
        pageErrors,
      },
      2
    );
    return;
  }

  let browser = null;
  let page = null;
  let pageTitle = null;
  let pageUrl = targetUrl;

  try {
    browser = await chromium.launch({
      headless: !headful,
      slowMo: Number.isFinite(slowMo) && slowMo > 0 ? slowMo : undefined,
    });
    page = await browser.newPage();

    page.on("console", (msg) => {
      consoleMessages.push({ type: msg.type(), text: msg.text() });
    });
    page.on("pageerror", (err) => {
      pageErrors.push({ message: err.message, stack: err.stack || null });
    });

    try {
      await page.goto(targetUrl, { waitUntil: "load", timeout: PAGE_LOAD_TIMEOUT_MS });
      pageTitle = await page.title().catch(() => null);
      pageUrl = page.url();
    } catch (err) {
      const screenshotPath = await captureScreenshot(page, "page_load");
      await finalize(
        {
          ok: false,
          reason: "page_load_failed",
          phase: "page_load",
          smokeName,
          pageTitle,
          pageUrl,
          consoleMessages,
          pageErrors,
          error: toErrorObject(err),
          screenshotPath,
        },
        1
      );
      return;
    }

    try {
      await page.waitForFunction(() => window.Game, { timeout: WAIT_GAME_TIMEOUT_MS });
    } catch (err) {
      const screenshotPath = await captureScreenshot(page, "wait_game");
      await finalize(
        {
          ok: false,
          reason: "game_missing",
          phase: "wait_game",
          smokeName,
          pageTitle,
          pageUrl,
          consoleMessages,
          pageErrors,
          error: toErrorObject(err),
          screenshotPath,
        },
        1
      );
      return;
    }

    try {
      await page.waitForFunction(() => window.Game && (window.Game.__DEV || window.Game.Dev), {
        timeout: WAIT_DEV_TIMEOUT_MS,
      });
    } catch (err) {
      const screenshotPath = await captureScreenshot(page, "wait_dev");
      await finalize(
        {
          ok: false,
          reason: "dev_missing",
          phase: "wait_dev",
          smokeName,
          pageTitle,
          pageUrl,
          consoleMessages,
          pageErrors,
          error: toErrorObject(err),
          screenshotPath,
        },
        1
      );
      return;
    }

    let devMeta;
    try {
      devMeta = await page.evaluate((name) => {
        const dev = window.Game?.__DEV || null;
        const legacy = window.Game?.Dev || null;
        const devKeys = dev ? Object.keys(dev) : [];
        const devLegacyKeys = legacy ? Object.keys(legacy) : [];
        const hasDevFn = dev && typeof dev[name] === "function";
        const hasLegacyFn = legacy && typeof legacy[name] === "function";
        return { devKeys, devLegacyKeys, hasDevFn, hasLegacyFn };
      }, smokeName);
    } catch (err) {
      const screenshotPath = await captureScreenshot(page, "invoke_smoke");
      await finalize(
        {
          ok: false,
          reason: "dev_inspect_failed",
          phase: "invoke_smoke",
          smokeName,
          pageTitle,
          pageUrl,
          consoleMessages,
          pageErrors,
          error: toErrorObject(err),
          screenshotPath,
        },
        1
      );
      return;
    }

    if (!devMeta.hasDevFn && !devMeta.hasLegacyFn) {
      await finalize(
        {
          ok: false,
          reason: "smoke_not_found",
          phase: "invoke_smoke",
          smokeName,
          pageTitle,
          pageUrl,
          consoleMessages,
          pageErrors,
          devKeys: devMeta.devKeys,
          devLegacyKeys: devMeta.devLegacyKeys,
        },
        1
      );
      return;
    }

    let evalResult;
    try {
      evalResult = await page.evaluate(async ({ name, timeoutMs }) => {
        const safeSerialize = (value) => {
          const seen = new WeakSet();
          const walk = (v) => {
            if (v === null) return null;
            if (v === undefined) return { __type: "undefined" };
            const t = typeof v;
            if (t === "string" || t === "number" || t === "boolean") return v;
            if (t === "bigint") return { __type: "bigint", value: v.toString() };
            if (t === "symbol") return { __type: "symbol", value: String(v) };
            if (t === "function") return `[Function${v.name ? `: ${v.name}` : ""}]`;
            if (v instanceof Date) return { __type: "date", value: v.toISOString() };
            if (v instanceof RegExp) return { __type: "regexp", value: v.toString() };
            if (v instanceof Error) {
              return { name: v.name, message: v.message, stack: v.stack || null };
            }
            if (Array.isArray(v)) return v.map(walk);
            if (t === "object") {
              if (seen.has(v)) return "[Circular]";
              seen.add(v);
              if (v instanceof Map) {
                return { __type: "map", value: Array.from(v.entries()).map(([k, val]) => [walk(k), walk(val)]) };
              }
              if (v instanceof Set) {
                return { __type: "set", value: Array.from(v.values()).map(walk) };
              }
              const out = {};
              for (const key of Object.keys(v)) {
                out[key] = walk(v[key]);
              }
              return out;
            }
            return String(v);
          };
          return walk(value);
        };

        const dev = window.Game?.__DEV || null;
        const legacy = window.Game?.Dev || null;
        const fn = (dev && dev[name]) || (legacy && legacy[name]);
        const start = Date.now();
        let timeoutId;
        const timeoutPromise = new Promise((resolve) => {
          timeoutId = setTimeout(() => {
            resolve({
              ok: false,
              reason: "smoke_timeout",
              error: { message: `Smoke timeout after ${timeoutMs}ms`, stack: null },
              durationMs: Date.now() - start,
            });
          }, timeoutMs);
        });
        const invokePromise = (async () => {
          try {
            const output = fn();
            const value = output && typeof output.then === "function" ? await output : output;
            return { ok: true, value: safeSerialize(value), durationMs: Date.now() - start };
          } catch (err) {
            return {
              ok: false,
              reason: "smoke_exception",
              error: { message: err?.message || String(err), stack: err?.stack || null },
              durationMs: Date.now() - start,
            };
          }
        })();
        try {
          return await Promise.race([invokePromise, timeoutPromise]);
        } finally {
          clearTimeout(timeoutId);
        }
      }, { name: smokeName, timeoutMs: SMOKE_TIMEOUT_MS });
    } catch (err) {
      const screenshotPath = await captureScreenshot(page, "invoke_smoke");
      await finalize(
        {
          ok: false,
          reason: "evaluate_failed",
          phase: "invoke_smoke",
          smokeName,
          pageTitle,
          pageUrl,
          consoleMessages,
          pageErrors,
          error: toErrorObject(err),
          screenshotPath,
        },
        1
      );
      return;
    }

    if (!evalResult.ok && evalResult.reason === "smoke_exception") {
      await finalize(
        {
          ok: false,
          reason: "smoke_exception",
          phase: "invoke_smoke",
          smokeName,
          pageTitle,
          pageUrl,
          consoleMessages,
          pageErrors,
          error: evalResult.error || null,
          smokeDurationMs: evalResult.durationMs ?? null,
        },
        1
      );
      return;
    }

    if (!evalResult.ok && evalResult.reason === "smoke_timeout") {
      await finalize(
        {
          ok: false,
          reason: "smoke_timeout",
          phase: "invoke_smoke",
          smokeName,
          pageTitle,
          pageUrl,
          consoleMessages,
          pageErrors,
          error: evalResult.error || null,
          smokeDurationMs: evalResult.durationMs ?? null,
        },
        1
      );
      return;
    }

    await finalize(
      {
        ok: true,
        phase: "invoke_smoke",
        smokeName,
        pageTitle,
        pageUrl,
        consoleMessages,
        pageErrors,
        smokeResult: evalResult.value,
        smokeDurationMs: evalResult.durationMs ?? null,
      },
      0
    );
  } catch (err) {
    const screenshotPath = await captureScreenshot(page, "browser");
    await finalize(
      {
        ok: false,
        reason: "browser_failed",
        phase: "browser",
        smokeName,
        pageTitle,
        pageUrl,
        consoleMessages,
        pageErrors,
        error: toErrorObject(err),
        screenshotPath,
      },
      1
    );
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {
        // ignore
      }
    }
  }
}

run();
