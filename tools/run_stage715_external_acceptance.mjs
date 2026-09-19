import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

const url = process.argv[2];
const evidenceDir = process.env.STAGE715_EVIDENCE_DIR;
const candidateSha = process.env.STAGE715_CANDIDATE_SHA;
const checkpoints = [];
const consoleMessages = [];
const pageErrors = [];
let page;
let context;
let browserIdentity = null;
let firstDivergence = null;

const expected = {
  rayhan: "всем привет в этом чатике!",
  nastya: "Приветик!",
  oleg: "здарова)",
  rayhanBattle: "Извините, кто тут дерзкий?? Выберите ответ быстренько!",
  nastyaBattle: "Ты на проблемы нарываешься?",
  olegBattle: "Где будем разбираться?",
  olegDm: "дам тебе ещё один шанс",
  independent: "Слабак",
};

async function writeJson(name, value) {
  await fs.writeFile(path.join(evidenceDir, name), JSON.stringify(value, null, 2) + "\n", "utf8");
}

async function bodyText() {
  return page.evaluate(() => document.body?.innerText || "");
}

async function inspectCanonicalFreshStart() {
  return page.evaluate(() => {
    const root = document.querySelector("#startScreen");
    const button = root && root.querySelector("#btnStart");
    const style = button ? getComputedStyle(button) : null;
    const rect = button ? button.getBoundingClientRect() : null;
    const visible = Boolean(button && style && !button.hidden && style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity || "1") > 0 && rect && rect.width > 0 && rect.height > 0);
    const inViewport = Boolean(rect && rect.bottom > 0 && rect.right > 0 && rect.top < window.innerHeight && rect.left < window.innerWidth);
    const center = rect ? [rect.left + rect.width / 2, rect.top + rect.height / 2] : null;
    const hit = center ? document.elementFromPoint(center[0], center[1]) : null;
    const notCovered = Boolean(button && hit && (hit === button || button.contains(hit)));
    return {
      rootPresent: Boolean(root),
      rootVisible: Boolean(root && getComputedStyle(root).display !== "none" && getComputedStyle(root).visibility !== "hidden"),
      tag: button ? button.tagName : null,
      text: button ? String(button.textContent || "").trim() : null,
      id: button ? button.id : null,
      className: button ? button.className : null,
      ariaLabel: button ? button.getAttribute("aria-label") : null,
      disabled: Boolean(button && button.disabled),
      visible,
      inViewport,
      notCovered,
      rect: rect ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height } : null,
      bodyText: document.body?.innerText || "",
    };
  });
}

async function capture(label) {
  const safe = label.replace(/[^a-zA-Z0-9_-]+/g, "_");
  const screenshotPath = path.join(evidenceDir, `${String(checkpoints.length + 1).padStart(2, "0")}-${safe}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
  const state = await page.evaluate(() => {
    const game = window.Game || {};
    return {
      url: location.href,
      bodyText: document.body?.innerText || "",
      stage715: (() => { try { return game.Stage715Demo?.getSnapshot?.() || null; } catch (_) { return null; } })(),
      state: game.__S || null,
    };
  }).catch((error) => ({ error: String(error) }));
  await writeJson(`${String(checkpoints.length + 1).padStart(2, "0")}-${safe}.state.json`, state);
  return screenshotPath;
}

async function fail(label, expectedVisible, observed, reason = "visible_divergence") {
  const screenshotPath = await capture(label);
  firstDivergence = { checkpoint: label, expected: expectedVisible, observed, reason, screenshotPath };
  throw new Error(`FIRST_VISIBLE_DIVERGENCE ${label}: expected=${expectedVisible} observed=${observed.slice(0, 500)}`);
}

async function checkpoint(label, expectedVisible, predicate, timeout = 30000) {
  const start = Date.now();
  let observed = "";
  while (Date.now() - start < timeout) {
    observed = await bodyText();
    if (await predicate(observed)) {
      const screenshotPath = await capture(label);
      checkpoints.push({ label, expected: expectedVisible, reached: true, at: new Date().toISOString(), screenshotPath });
      return;
    }
    await page.waitForTimeout(250);
  }
  await fail(label, expectedVisible, observed);
}

async function clickText(text, label) {
  try {
    const candidates = page.getByText(text, { exact: true });
    let locator = null;
    for (let i = 0; i < await candidates.count(); i += 1) {
      const candidate = candidates.nth(i);
      if (await candidate.isVisible().catch(() => false)) { locator = candidate; break; }
    }
    if (!locator) throw new Error(`visible control not found: ${text}`);
    await locator.click();
  } catch (error) {
    await fail(label, `visible control ${text}`, await bodyText(), `click_failed:${error.message}`);
  }
}

async function sendChat(text, label) {
  try {
    await page.locator("#chatInput").fill(text);
    await page.locator("#btnSend").click();
  } catch (error) {
    await fail(label, "chat input/send", await bodyText(), `chat_failed:${error.message}`);
  }
}

async function sendDm(text, label) {
  try {
    await page.locator("#dmInput").fill(text);
    await page.locator("#dmSend").click();
  } catch (error) {
    await fail(label, "DM input/send", await bodyText(), `dm_failed:${error.message}`);
  }
}

async function chooseBattle(label, exactText = null) {
  try {
    const scope = page.locator("#battlesBody");
    const candidates = exactText ? scope.getByText(exactText, { exact: true }) : scope.locator("[data-battle-id] button");
    let control = null;
    const started = Date.now();
    while (!control && Date.now() - started < 20000) {
      for (let i = 0; i < await candidates.count(); i += 1) {
        const candidate = candidates.nth(i);
        if (await candidate.isVisible().catch(() => false) && await candidate.isEnabled().catch(() => false)) { control = candidate; break; }
      }
      if (!control) await page.waitForTimeout(250);
    }
    if (!control) throw new Error(`visible battle control not found: ${exactText || "any"}`);
    await control.click();
  } catch (error) {
    await fail(label, exactText || "visible battle answer", await bodyText(), `battle_choice_failed:${error.message}`);
  }
}

async function runCorridor() {
  await checkpoint("fresh_start", "visible canonical Start control", async () => {
    const start = await inspectCanonicalFreshStart();
    return start.text === "Старт" && start.visible && start.inViewport && start.notCovered && !start.disabled;
  });
  await clickText("Старт", "fresh_start_click");
  await checkpoint("rayhan_greeting", expected.rayhan, (t) => t.includes(expected.rayhan));
  await checkpoint("nastya_greeting", expected.nastya, (t) => t.includes(expected.nastya));
  await checkpoint("oleg_greeting", expected.oleg, (t) => t.includes(expected.oleg));
  await checkpoint("rayhan_prompt", "Rayhan asks for a reply", (t) => t.includes("привет,"));
  await sendChat("привет", "rayhan_first_reply");
  await checkpoint("rayhan_tone_prompt", "Rayhan tone prompt", (t) => t.includes("силу и цвет твоего тона"));
  await sendChat("очень скромный желтый", "rayhan_tone_reply");
  await checkpoint("rayhan_battle", expected.rayhanBattle, (t) => t.includes(expected.rayhanBattle));
  await chooseBattle("rayhan_correct_answer", "Похоже, ты…");
  await checkpoint("rayhan_post_result", "Rayhan post-result", (t) => t.includes("репутация выросла") || t.includes("первая появилась"));
  await sendChat("готово", "rayhan_post_result_reply");
  await checkpoint("nastya_battle", expected.nastyaBattle, (t) => t.includes(expected.nastyaBattle));
  await chooseBattle("nastya_answer", "Кажется, нет…");
  await checkpoint("nastya_completion", "Nastya completion/vote", (t) => t.includes("Настя") && (t.includes("Толпа") || t.includes("репутация")));
  await sendChat("понял", "nastya_completion_reply");
  await checkpoint("oleg_battle", expected.olegBattle, (t) => t.includes(expected.olegBattle));
  await chooseBattle("oleg_first_loss");
  for (let i = 1; i <= 3; i += 1) {
    await checkpoint(`oleg_rematch_${i}`, "Реванш!", (t) => t.includes("Реванш"));
    await clickText("Реванш!", `oleg_rematch_click_${i}`);
    await chooseBattle(`oleg_rematch_answer_${i}`);
  }
  await checkpoint("oleg_dm", expected.olegDm, (t) => t.includes(expected.olegDm));
  await sendDm("понял", "oleg_dm_reply");
  await checkpoint("oleg_escape", "Уйти", (t) => t.includes("Уйти"));
  await clickText("Уйти", "oleg_escape_first");
  await checkpoint("oleg_escape_failed", "first escape failure", (t) => t.includes("не получилось уйти") || t.includes("трусишка"));
  await clickText("Уйти", "oleg_escape_second");
  await checkpoint("oleg_escape_success", "second escape success", (t) => t.includes("получилось уйти"));
  await sendDm("дальше", "oleg_instruction_reply");
  await checkpoint("progressive_disclosure", "first independent battle instruction", (t) => t.includes("самого слабого") || t.includes("Слабак"));
  await page.locator("#battlesHeader").click().catch(() => {});
  await page.locator("#battleInviteInput").fill("Слабак");
  await clickText("Вызвать", "first_independent_battle_start");
  await checkpoint("first_independent_battle", expected.independent, (t) => t.includes(expected.independent));
  await chooseBattle("first_independent_battle_answer");
  await checkpoint("first_independent_completion", "first independent battle completion", async (t) => {
    const complete = await page.evaluate(() => Boolean(window.Game?.__S?.flags?.stage715FirstIndependentBattleComplete));
    return complete && /побед|заверш|репутац/.test(t);
  });
  await checkpoint("m82_first_event_entry", "visible First Event entry/control", async (t) => {
    const entry = await page.locator('[data-entry-id="stage715-first-event-entry"]').isVisible().catch(() => false);
    return entry || t.includes("Первое событие") || t.includes("First Event");
  });
}

async function main() {
  if (!url || !evidenceDir || !candidateSha) throw new Error("runner environment is incomplete");
  await fs.mkdir(evidenceDir, { recursive: true });
  const profile = await fs.mkdtemp(path.join(os.tmpdir(), "asyncscene-stage715-browser-"));
  context = await chromium.launchPersistentContext(profile, {
    headless: false,
    viewport: { width: 1440, height: 1000 },
    args: ["--no-first-run", "--no-default-browser-check"],
  });
  browserIdentity = { browser: "Chromium via Playwright persistent context", version: context.browser()?.version?.() || null, headless: false, profile };
  page = await context.newPage();
  page.on("console", (message) => consoleMessages.push({ type: message.type(), text: message.text() }));
  page.on("pageerror", (error) => pageErrors.push({ message: error.message, stack: error.stack || null }));
  await page.goto(url, { waitUntil: "load", timeout: 45000 });
  await page.evaluate(async () => {
    try { localStorage.clear(); } catch (_) {}
    try { sessionStorage.clear(); } catch (_) {}
    try {
      if (indexedDB && typeof indexedDB.databases === "function") {
        const databases = await indexedDB.databases();
        await Promise.all(databases.map((db) => db && db.name ? new Promise((resolve) => {
          const request = indexedDB.deleteDatabase(db.name);
          request.onsuccess = request.onerror = request.onblocked = () => resolve();
        }) : Promise.resolve()));
      }
    } catch (_) {}
  });
  await page.reload({ waitUntil: "load", timeout: 45000 });
  await runCorridor();
}

const result = {
  candidateCommit: candidateSha,
  servedFileHashes: "candidate-hashes.json and served-* files in evidence directory",
  browserRuntimeIdentity: null,
  startTimestamp: process.env.STAGE715_START_UTC || new Date().toISOString(),
  canonicalCheckpointsReached: checkpoints,
  firstDivergence: null,
  expectedVisibleResult: "Fresh Start through M82 visible First Event entry/control",
  observedVisibleResult: null,
  screenshotPath: null,
  finalStatus: "FULL_CANON_RUNTIME_START_TO_M82=FAIL",
};

try {
  await main();
  result.browserRuntimeIdentity = browserIdentity;
  result.observedVisibleResult = "all checkpoints reached";
  result.finalStatus = "FULL_CANON_RUNTIME_START_TO_M82=PASS";
  result.screenshotPath = checkpoints.at(-1)?.screenshotPath || null;
} catch (error) {
  result.browserRuntimeIdentity = browserIdentity;
  result.firstDivergence = firstDivergence || { checkpoint: "runner", expected: "external browser execution", observed: error.message, reason: "external_or_runner_failure" };
  result.observedVisibleResult = error.message;
  result.screenshotPath = firstDivergence?.screenshotPath || null;
  process.exitCode = 1;
} finally {
  await writeJson("evidence.json", result);
  await writeJson("console-and-page-errors.json", { consoleMessages, pageErrors });
  if (context) await context.close().catch(() => {});
}

console.log(JSON.stringify(result, null, 2));
