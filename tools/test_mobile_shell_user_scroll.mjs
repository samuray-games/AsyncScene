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
let reportPage;

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
  const totalMatch = fullRunner.match(/TOTAL (\d+)\/(\d+) PASS/);
  assert(totalMatch && totalMatch[1] === totalMatch[2] && ["320x568", "360x640", "390x844", "430x932", "768x1024", "1280x720", "1440x900"].every((size) => fullRunner.includes(`PASS ${size}`)), `complete seven-size runner passes: ${fullRunner.slice(-1600)}`);

  await page.goto(`${origin}/tools/test_mobile_shell_regressions.html?view=0`, { waitUntil: "load" });
  await page.waitForFunction(() => document.querySelector("#report")?.textContent.includes("TOTAL "), null, { timeout: 120000 });
  const frame = page.frames().find((candidate) => candidate.url().includes("/AsyncScene/index.html?mobileShellRegression=0"));
  assert(frame, "320x568 app fixture frame loaded");
  await frame.waitForFunction(() => window.Game?.UI?.renderDM && window.Game?.__S, null, { timeout: 30000 });

  await frame.evaluate(() => {
    const game = window.Game;
    const ui = game.UI;
    const state = game.__S;
    const recipients = [];
    for (let index = 0; index < 3; index++) {
      const id = `pr431-user-scroll-thread-${index}`;
      state.players[id] = { id, name: `Длинное имя собеседника для прокрутки ${index + 1}`, role: "citizen", npc: true };
      recipients.push(id);
    }
    state.dm = { open: true, activeId: recipients[0], withId: recipients[0], openIds: recipients.slice(), logs: {}, unread: {} };
    recipients.forEach((id, thread) => {
      state.dm.logs[id] = Array.from({ length: 36 }, (_, index) => ({
        t: "12:00",
        from: index % 2 ? String(state.me?.name || "Тестовый игрок") : String(state.players[id].name),
        text: `Проверка прокрутки личной переписки ${thread + 1}, сообщение ${index + 1}`,
      }));
    });
    ui.renderDM();
    game.__DEV.mobileInterface.selectTab("battles", false);
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

  const ordinaryDmEvidence = await frame.evaluate(() => {
    const panel = document.querySelector("#dmBlock > .panelBody");
    const log = document.getElementById("dmLog");
    const tabs = document.getElementById("dmTabs");
    const row = document.getElementById("dmInputRow");
    const send = document.getElementById("dmSend");
    const logRect = log.getBoundingClientRect();
    const point = document.elementFromPoint(Math.floor(logRect.left + logRect.width / 2), Math.floor(logRect.top + Math.min(24, logRect.height / 2)));
    const sendRect = send.getBoundingClientRect();
    const sendHit = document.elementFromPoint(Math.floor(sendRect.left + sendRect.width / 2), Math.floor(sendRect.top + sendRect.height / 2));
    return {
      reportListExists: !!document.getElementById("reportList"),
      point: point && { id: point.id, className: String(point.className) },
      pointInDm: !!point && document.getElementById("dmBlock").contains(point),
      tabs: { width: tabs.clientWidth, scroll: tabs.scrollWidth, max: tabs.scrollWidth - tabs.clientWidth, overflowX: getComputedStyle(tabs).overflowX },
      log: { height: log.clientHeight, scroll: log.scrollHeight, max: log.scrollHeight - log.clientHeight, overflowY: getComputedStyle(log).overflowY },
      composer: { input: document.getElementById("dmInput").getBoundingClientRect().toJSON(), row: row.getBoundingClientRect().toJSON(), send: sendRect.toJSON(), sendHit: sendHit && { id: sendHit.id, className: String(sendHit.className) }, reachable: sendHit === send || send.contains(sendHit) },
      panel: panel.getBoundingClientRect().toJSON(),
    };
  });
  assert(!ordinaryDmEvidence.reportListExists && ordinaryDmEvidence.pointInDm && ordinaryDmEvidence.tabs.max > 1
    && ordinaryDmEvidence.log.max > 1 && ordinaryDmEvidence.composer.reachable,
  `ordinary DM screen has no report overlay, scrollable threads/history and reachable composer: ${JSON.stringify(ordinaryDmEvidence)}`);
  await frame.locator("#dmTabs").hover();
  await page.mouse.wheel(300, 0);
  await page.waitForTimeout(80);
  const threadScrollAfter = await frame.locator("#dmTabs").evaluate((node) => ({ left: node.scrollLeft, max: node.scrollWidth - node.clientWidth }));
  assert(threadScrollAfter.left > 0 && threadScrollAfter.max > 0, `trusted horizontal wheel scrolls the long conversation list: ${JSON.stringify(threadScrollAfter)}`);

  const dmInput = frame.locator("#dmInput");
  const panelBefore = await frame.locator("#dmBlock > .panelBody").evaluate((node) => ({ top: node.scrollTop, max: node.scrollHeight - node.clientHeight }));
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
    return {
      scrollTop: panel.scrollTop,
      trustedWheel: panel.__trustedWheel,
      logIntersects: logBox.bottom > visibleTop && logBox.top < visibleBottom,
      logInsidePanel: logBox.top >= visibleTop - 1 && logBox.bottom <= visibleBottom + 1,
      panelMax: panel.scrollHeight - panel.clientHeight,
    };
  });
  assert(panelReveal.trustedWheel && panelReveal.logIntersects && panelReveal.logInsidePanel,
  `after a user wheel over the composer, the DM log remains wholly in the visible panel while history scrolls independently: ${JSON.stringify({ panelBefore, panelReveal })}`);

  const logBefore = await frame.locator("#dmLog").evaluate((node) => ({ top: node.scrollTop, max: node.scrollHeight - node.clientHeight }));
  assert(logBefore.max > 1, `DM log contains naturally scrollable messages: ${JSON.stringify(logBefore)}`);
  await frame.locator("#dmLog").hover();
  await page.mouse.wheel(0, -500);
  await page.waitForTimeout(100);
  const logAfter = await frame.locator("#dmLog").evaluate((node) => ({ top: node.scrollTop, trustedWheel: node.__trustedWheel }));
  assert(logAfter.trustedWheel && logAfter.top < logBefore.top, `trusted wheel scrolls to older DM messages: ${JSON.stringify({ before: logBefore, after: logAfter })}`);

  reportPage = await browser.newPage({ viewport: { width: 320, height: 568 } });
  await reportPage.route("**/*", (route) => {
    const request = route.request();
    if (new URL(request.url()).origin === origin && request.method() === "GET") return route.continue();
    blocked.add(new URL(request.url()).origin + " " + request.method());
    return route.abort("blockedbyclient");
  });
  await reportPage.goto(`${origin}/tools/test_mobile_shell_regressions.html?view=0`, { waitUntil: "load" });
  await reportPage.waitForFunction(() => document.querySelector("#report")?.textContent.includes("TOTAL "), null, { timeout: 120000 });
  const reportFrame = reportPage.frames().find((candidate) => candidate.url().includes("/AsyncScene/index.html?mobileShellRegression=0"));
  assert(reportFrame, "isolated 320x568 complaint scenario screen loaded");
  await reportFrame.waitForFunction(() => window.Game?.UI?.renderDM && window.Game?.__S, null, { timeout: 30000 });
  await reportFrame.evaluate(() => {
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
  await reportFrame.locator("#reportOpenBtn").click();
  await reportFrame.locator("#reportInput").waitFor({ state: "visible" });
  await reportFrame.locator("#reportList").waitFor({ state: "visible" });
  const reportPanel = reportFrame.locator("#dmBlock > .panelBody");
  const panelRange = await reportPanel.evaluate((node) => {
    node.__trustedWheel = false;
    node.addEventListener("wheel", (event) => { if (event.isTrusted) node.__trustedWheel = true; }, { passive: true });
    return { top: node.scrollTop, max: node.scrollHeight - node.clientHeight };
  });
  assert(panelRange.max > 1, `complaint form panel has a scroll range: ${JSON.stringify(panelRange)}`);
  await reportFrame.locator("#reportInput").hover();
  await reportPage.mouse.wheel(0, panelRange.top < panelRange.max ? 300 : -300);
  await page.waitForTimeout(100);
  const reportAfterPanelScroll = await reportFrame.evaluate(() => {
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

  const reportBefore = await reportFrame.locator("#reportList").evaluate((node) => {
    node.__trustedWheel = false;
    node.addEventListener("wheel", (event) => { if (event.isTrusted) node.__trustedWheel = true; }, { passive: true });
    return { top: node.scrollTop, max: node.scrollHeight - node.clientHeight, options: node.querySelectorAll('[role="option"]').length, overflowY: getComputedStyle(node).overflowY, bottom: node.style.bottom, computedBottom: getComputedStyle(node).bottom, height: node.getBoundingClientRect().height, topEdge: node.getBoundingClientRect().top, bottomEdge: node.getBoundingClientRect().bottom, inputFocus: document.activeElement === document.getElementById("reportInput") };
  });
  assert(reportBefore.options >= 20 && reportBefore.max > 1 && reportBefore.overflowY === "auto" && reportBefore.bottom === "auto" && reportBefore.inputFocus,
    `report suggestions are bounded independently of the public-chat bottom anchor and keep input focus: ${JSON.stringify(reportBefore)}`);
  await reportFrame.locator("#reportList").hover();
  for (let gesture = 0; gesture < 6; gesture++) {
    await reportPage.mouse.wheel(0, 500);
    await page.waitForTimeout(50);
    const lastChoiceVisible = await reportFrame.locator("#reportList").evaluate((node) => {
      const options = node.querySelectorAll('[role="option"]');
      const last = options[options.length - 1];
      const choice = last.getBoundingClientRect();
      const box = node.getBoundingClientRect();
      return choice.bottom > box.top && choice.top < box.bottom;
    });
    if (lastChoiceVisible) break;
  }
  const reportAfter = await reportFrame.locator("#reportList").evaluate((node) => {
    const options = [...node.querySelectorAll('[role="option"]')];
    const last = options.at(-1);
    const rect = last.getBoundingClientRect();
    const box = node.getBoundingClientRect();
    return { top: node.scrollTop, trustedWheel: node.__trustedWheel, lastOptionVisible: rect.bottom > box.top && rect.top < box.bottom, lastOption: last.textContent };
  });
  assert(reportAfter.trustedWheel && reportAfter.top > reportBefore.top && reportAfter.lastOptionVisible, `trusted wheel reaches the last report choice: ${JSON.stringify({ before: reportBefore, after: reportAfter })}`);
  await reportFrame.locator("#reportList [role=option]").last().click();
  const selected = await reportFrame.locator("#reportInput").evaluate((node) => ({ value: node.value, focused: document.activeElement === node }));
  assert(selected.focused && selected.value === reportAfter.lastOption, `the scrolled-to report choice can be selected: ${JSON.stringify(selected)}`);
  const reportSubmit = await reportFrame.evaluate(() => {
    const input = document.getElementById("reportInput");
    const button = document.getElementById("reportBtn");
    const rect = button.getBoundingClientRect();
    const hit = document.elementFromPoint(Math.floor(rect.left + rect.width / 2), Math.floor(rect.top + rect.height / 2));
    const viewportTop = window.visualViewport.offsetTop;
    const viewportBottom = viewportTop + window.visualViewport.height;
    return { disabled: button.disabled, rect: rect.toJSON(), input: input.getBoundingClientRect().toJSON(), insideViewport: rect.top >= viewportTop && rect.bottom <= viewportBottom, hit: hit && { id: hit.id, className: String(hit.className) }, receivesHit: hit === button || button.contains(hit), inputFocused: document.activeElement === input };
  });
  assert(!reportSubmit.disabled && reportSubmit.insideViewport && reportSubmit.receivesHit && reportSubmit.inputFocused,
    `complaint input and submit button remain visible and hit-testable after selection: ${JSON.stringify(reportSubmit)}`);

  console.log(JSON.stringify({
    result: "PASS",
    viewport: "320x568",
    fullRunner: totalMatch[0] + " across all seven viewports",
    checks: ["ordinary DM and report scenario use separate test pages", "ordinary DM screen has no report overlay and composer hit target remains reachable", "trusted wheel scrolls the long conversation list", "trusted wheel reveals the DM log through the panel scrollport", "trusted wheel scrolls older DM messages", "report screen popup is bounded with bottom:auto", "trusted wheel keeps the report list anchored while its panel scrolls", "trusted wheel reaches the last complaint option", "last complaint option remains selectable with input focus", "complaint submit button remains hit-testable after selection"],
    blockedRequests: [...blocked],
  }, null, 2));
} finally {
  if (browser) await browser.close();
  await new Promise((resolveClose) => server.close(resolveClose));
}
