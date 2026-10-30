import assert from "node:assert/strict";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { readFile, stat } from "node:fs/promises";
import { chromium } from "playwright";

const root = resolve(process.cwd());
const mime = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};
const server = createServer(async (request, response) => {
  try {
    assert.equal(request.method, "GET", "fixture server accepts static GET only");
    const url = new URL(request.url || "/", "http://127.0.0.1");
    const pathname = decodeURIComponent(url.pathname);
    const mappedPath = pathname.startsWith("/AsyncScene/")
      ? `/AsyncScene/Web/${pathname.slice("/AsyncScene/".length)}`
      : pathname;
    const file = resolve(root, `.${mappedPath}`);
    assert(file === root || file.startsWith(root + sep), "fixture path stays inside checkout");
    const info = await stat(file);
    assert(info.isFile(), "fixture request must resolve to a static file");
    response.writeHead(200, { "content-type": mime[extname(file)] || "application/octet-stream" });
    response.end(await readFile(file));
  } catch {
    response.writeHead(404);
    response.end("not found");
  }
});

await new Promise((resolveListen, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolveListen);
});
const address = server.address();
const origin = `http://127.0.0.1:${address.port}`;
let browser;

try {
  browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage({ viewport: { width: 320, height: 568 } });
  const blocked = new Set();
  await page.route("**/*", (route) => {
    const request = route.request();
    if (new URL(request.url()).origin === origin && request.method() === "GET") return route.continue();
    blocked.add(new URL(request.url()).origin + " " + request.method());
    return route.abort("blockedbyclient");
  });

  await page.goto(`${origin}/tools/test_mobile_shell_regressions.html`, { waitUntil: "load" });
  await page.waitForFunction(() => document.querySelector("#report")?.textContent.includes("TOTAL "), null, { timeout: 120000 });
  const fullRunner = await page.locator("#report").innerText();
  assert(fullRunner.includes("TOTAL 176/176 PASS") && ["320x568", "360x640", "390x844", "430x932", "768x1024", "1280x720", "1440x900"].every((size) => fullRunner.includes(`PASS ${size}`)), `complete seven-size runner passes: ${fullRunner.slice(-1200)}`);

  await page.goto(`${origin}/tools/test_mobile_shell_regressions.html?view=0`, { waitUntil: "load" });
  await page.waitForFunction(() => document.querySelector("#report")?.textContent.includes("TOTAL "), null, { timeout: 120000 });
  const frame = page.frames().find((candidate) => candidate.url().includes("/AsyncScene/index.html?mobileShellRegression=0"));
  assert(frame, "320x568 app fixture frame loaded");
  await frame.waitForFunction(() => window.Game?.UI?.renderDM && window.Game?.__S, null, { timeout: 30000 });

  await frame.evaluate(() => {
    const game = window.Game;
    const ui = game.UI;
    const state = game.__S;
    const target = Object.values(state.players).find((player) => player && player.id !== state.me?.id && player.role !== "cop");
    if (!target) throw new Error("no DM target in mobile fixture");
    ui.openDM(target.id);
    state.dm.logs[target.id] = Array.from({ length: 36 }, (_, index) => ({
      t: "12:00",
      from: index % 2 ? String(state.me?.name || "Тестовый игрок") : String(target.name || "Собеседник"),
      text: `Проверка прокрутки личной переписки ${index + 1}`,
    }));
    ui.renderDM();
    game.__DEV.mobileInterface.selectTab("dm", false);
    ui.hideMenu();
    Object.defineProperty(window, "visualViewport", {
      configurable: true,
      value: { height: 388, offsetTop: 24, offsetLeft: 0, width: 320, scale: 1, addEventListener() {}, removeEventListener() {} },
    });
    document.getElementById("dmInput").focus();
    ui.ensureMobilePinnedChatLayout();
    const log = document.getElementById("dmLog");
    log.__trustedWheel = false;
    log.addEventListener("wheel", (event) => { if (event.isTrusted) log.__trustedWheel = true; }, { passive: true });
    const panel = document.querySelector("#dmBlock > .panelBody");
    panel.__trustedWheel = false;
    panel.addEventListener("wheel", (event) => { if (event.isTrusted) panel.__trustedWheel = true; }, { passive: true });
  });
  await page.waitForTimeout(120);

  const dmInput = frame.locator("#dmInput");
  const panelBefore = await frame.locator("#dmBlock > .panelBody").evaluate((node) => node.scrollTop);
  await dmInput.hover();
  await page.mouse.wheel(0, -500);
  await page.waitForTimeout(100);
  const panelReveal = await frame.evaluate(() => {
    const panel = document.querySelector("#dmBlock > .panelBody");
    const log = document.getElementById("dmLog");
    const box = panel.getBoundingClientRect();
    const visibleTop = box.top + panel.clientTop;
    const visibleBottom = visibleTop + panel.clientHeight;
    const logBox = log.getBoundingClientRect();
    return { scrollTop: panel.scrollTop, trustedWheel: panel.__trustedWheel, logIntersects: logBox.bottom > visibleTop && logBox.top < visibleBottom };
  });
  assert(panelReveal.trustedWheel && panelReveal.scrollTop < panelBefore && panelReveal.logIntersects, `trusted wheel reveals the DM log in its panel: ${JSON.stringify({ panelBefore, panelReveal })}`);

  const logBefore = await frame.locator("#dmLog").evaluate((node) => ({ top: node.scrollTop, max: node.scrollHeight - node.clientHeight }));
  assert(logBefore.max > 1, `DM log contains naturally scrollable messages: ${JSON.stringify(logBefore)}`);
  await frame.locator("#dmLog").hover();
  await page.mouse.wheel(0, -500);
  await page.waitForTimeout(100);
  const logAfter = await frame.locator("#dmLog").evaluate((node) => ({ top: node.scrollTop, trustedWheel: node.__trustedWheel }));
  assert(logAfter.trustedWheel && logAfter.top < logBefore.top, `trusted wheel scrolls to older DM messages: ${JSON.stringify({ before: logBefore, after: logAfter })}`);

  await frame.evaluate(() => {
    const game = window.Game;
    const ui = game.UI;
    const state = game.__S;
    let cop = Object.values(state.players).find((player) => player && player.role === "cop");
    if (!cop) {
      cop = { id: "pr431-user-scroll-cop", name: "Проверочный коп", role: "cop", npc: true };
      state.players[cop.id] = cop;
    }
    for (let index = 0; index < 24; index++) {
      const id = `pr431-user-scroll-citizen-${index}`;
      state.players[id] = { id, name: `Вариант жалобы ${String(index + 1).padStart(2, "0")}`, role: "citizen", npc: true };
    }
    ui.openDM(cop.id);
    ui.renderDM();
    game.__DEV.mobileInterface.selectTab("dm", false);
    document.getElementById("dmInput").focus();
    ui.ensureMobilePinnedChatLayout();
  });
  await frame.locator("#reportOpenBtn").click();
  await frame.locator("#reportInput").waitFor({ state: "visible" });
  await frame.locator("#reportList").waitFor({ state: "visible" });
  const reportPanel = frame.locator("#dmBlock > .panelBody");
  const panelRange = await reportPanel.evaluate((node) => {
    node.__trustedWheel = false;
    node.addEventListener("wheel", (event) => { if (event.isTrusted) node.__trustedWheel = true; }, { passive: true });
    return { top: node.scrollTop, max: node.scrollHeight - node.clientHeight };
  });
  assert(panelRange.max > 1, `complaint form panel has a scroll range: ${JSON.stringify(panelRange)}`);
  await frame.locator("#reportInput").hover();
  await page.mouse.wheel(0, panelRange.top < panelRange.max ? 300 : -300);
  await page.waitForTimeout(100);
  const reportAfterPanelScroll = await frame.evaluate(() => {
    const panel = document.querySelector("#dmBlock > .panelBody");
    const input = document.getElementById("reportInput");
    const list = document.getElementById("reportList");
    const inputRect = input.getBoundingClientRect();
    const listRect = list.getBoundingClientRect();
    const viewportTop = window.visualViewport.offsetTop;
    const viewportBottom = viewportTop + window.visualViewport.height;
    return {
      top: panel.scrollTop,
      trustedWheel: panel.__trustedWheel,
      input: { top: inputRect.top, bottom: inputRect.bottom },
      list: { top: listRect.top, bottom: listRect.bottom },
      anchored: listRect.bottom <= inputRect.top + 1 || listRect.top >= inputRect.bottom - 1,
      insideViewport: listRect.top >= viewportTop && listRect.bottom <= viewportBottom,
      inputInsideViewport: inputRect.top >= viewportTop && inputRect.bottom <= viewportBottom,
    };
  });
  assert(reportAfterPanelScroll.trustedWheel && reportAfterPanelScroll.top !== panelRange.top
    && reportAfterPanelScroll.anchored && reportAfterPanelScroll.insideViewport && reportAfterPanelScroll.inputInsideViewport,
  `trusted panel wheel keeps the complaint list positioned beside its visible input: ${JSON.stringify({ before: panelRange, after: reportAfterPanelScroll })}`);

  const reportBefore = await frame.locator("#reportList").evaluate((node) => {
    node.__trustedWheel = false;
    node.addEventListener("wheel", (event) => { if (event.isTrusted) node.__trustedWheel = true; }, { passive: true });
    return { top: node.scrollTop, max: node.scrollHeight - node.clientHeight, options: node.querySelectorAll('[role="option"]').length, overflowY: getComputedStyle(node).overflowY };
  });
  assert(reportBefore.options >= 20 && reportBefore.max > 1 && reportBefore.overflowY === "auto", `report suggestions have a real scroll range: ${JSON.stringify(reportBefore)}`);
  await frame.locator("#reportList").hover();
  for (let gesture = 0; gesture < 6; gesture++) {
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(50);
    const lastChoiceVisible = await frame.locator("#reportList").evaluate((node) => {
      const options = node.querySelectorAll('[role="option"]');
      const last = options[options.length - 1];
      const choice = last.getBoundingClientRect();
      const box = node.getBoundingClientRect();
      return choice.bottom > box.top && choice.top < box.bottom;
    });
    if (lastChoiceVisible) break;
  }
  const reportAfter = await frame.locator("#reportList").evaluate((node) => {
    const options = [...node.querySelectorAll('[role="option"]')];
    const last = options.at(-1);
    const rect = last.getBoundingClientRect();
    const box = node.getBoundingClientRect();
    return { top: node.scrollTop, trustedWheel: node.__trustedWheel, lastOptionVisible: rect.bottom > box.top && rect.top < box.bottom, lastOption: last.textContent };
  });
  assert(reportAfter.trustedWheel && reportAfter.top > reportBefore.top && reportAfter.lastOptionVisible, `trusted wheel reaches the last report choice: ${JSON.stringify({ before: reportBefore, after: reportAfter })}`);
  await frame.locator("#reportList [role=option]").last().click();
  const selected = await frame.locator("#reportInput").evaluate((node) => ({ value: node.value, focused: document.activeElement === node }));
  assert(selected.focused && selected.value === reportAfter.lastOption, `the scrolled-to report choice can be selected: ${JSON.stringify(selected)}`);

  console.log(JSON.stringify({
    result: "PASS",
    viewport: "320x568",
    fullRunner: "176/176 PASS across all seven viewports",
    checks: ["trusted wheel reveals the DM log through the panel scrollport", "trusted wheel moves the DM log to older messages", "trusted wheel keeps the report list anchored while its panel scrolls", "trusted wheel reaches the last complaint option", "last complaint option remains selectable with input focus"],
    blockedRequests: [...blocked],
  }, null, 2));
} finally {
  if (browser) await browser.close();
  await new Promise((resolveClose) => server.close(resolveClose));
}
