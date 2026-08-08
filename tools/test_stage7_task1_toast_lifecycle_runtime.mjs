import assert from "node:assert/strict";
import { chromium } from "playwright";

const url = process.env.ASYNC_SCENE_TOAST_TEST_URL || "http://127.0.0.1:8092/index.html";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
page.on("console", (message) => { if (message.type() === "error") errors.push(`console: ${message.text()}`); });

const visible = async (selector) => page.locator(selector).evaluateAll((nodes) => nodes.some((node) => {
  const style = getComputedStyle(node);
  const rect = node.getBoundingClientRect();
  return node.isConnected && style.display !== "none" && style.visibility !== "hidden" && Number(rect.width) > 0 && Number(rect.height) > 0;
}));
const waitVisible = async (selector, label) => {
  await page.locator(selector).first().waitFor({ state: "visible", timeout: 3000 });
  assert(await visible(selector), `${label || selector} is not visibly rendered`);
};
const waitGone = async (selector, label) => {
  await page.waitForFunction((sel) => !Array.from(document.querySelectorAll(sel)).some((node) => {
    const style = getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    return node.isConnected && style.display !== "none" && style.visibility !== "hidden" && Number(rect.width) > 0 && Number(rect.height) > 0;
  }), selector, { timeout: 3000 });
  assert(!(await visible(selector)), `${label || selector} was not dismissed by click/tap`);
};
const clickAndDismiss = async (selector, label) => {
  await page.locator(selector).first().dispatchEvent("click");
  await waitGone(selector, label);
};
const assertPersistsThroughRenders = async (selector, label, show) => {
  await show();
  await waitVisible(selector, label);
  await page.evaluate(() => window.Game?.UI?.renderAll?.());
  await page.evaluate(() => window.Game?.UI?.requestRenderAll?.());
  await page.waitForTimeout(1200);
  await page.clock.fastForward(30000);
  assert(await visible(selector), `${label} disappeared without user interaction`);
  await clickAndDismiss(selector, label);
};
const assertOneClickFullyDismissesDelta = async (kind) => {
  const deltaSelector = `#stage6DeltaToast_${kind}`;
  const nameSelector = `#stage6DeltaNameToast_${kind}`;
  await page.evaluate((key) => window.Game.UI.emitStatDelta(key, 1), kind);
  await waitVisible(deltaSelector, `${kind} numeric delta toast`);
  await page.locator(deltaSelector).click({ force: true });
  await waitGone(deltaSelector, `${kind} numeric delta toast`);
  assert(!(await visible(nameSelector)), `${kind} delta dismissal created a replacement name toast`);
  await page.evaluate(() => window.Game?.UI?.renderAll?.());
  await page.evaluate(() => window.Game?.UI?.requestRenderAll?.());
  await page.waitForTimeout(1200);
  await page.clock.fastForward(30000);
  assert(!(await visible(nameSelector)), `${kind} replacement name toast appeared after rerender`);
};

try {
  await page.route("**/AsyncScene/**", (route) => {
    const requestUrl = new URL(route.request().url());
    if (requestUrl.hostname === "127.0.0.1") {
      const rewritten = requestUrl.toString().replace("/AsyncScene/", "/");
      return route.continue({ url: rewritten });
    }
    return route.continue();
  });
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    window.__stage7StartupLayoutEvidence = [];
    window.addEventListener("stage7:player-entered-game", () => {
      const target = document.querySelector("#meRep");
      if (target) window.__stage7StartupLayoutEvidence.push(target.getBoundingClientRect().toJSON());
    });
  });
  await page.locator("#btnStart").click({ force: true });
  await page.waitForFunction(() => {
    const node = document.getElementById("startScreen");
    return node && (node.hidden || node.classList.contains("hidden") || getComputedStyle(node).display === "none");
  }, null, { timeout: 5000 });
  await page.waitForTimeout(220);
  await page.clock.install();

  const startup = page.locator("#stage6StartupNameToast");
  await waitVisible("#stage6StartupNameToast", "startup reputation toast");
  const startupGeometry = await startup.evaluate((toast) => {
    const kind = toast.dataset.statKind;
    const target = document.querySelector(kind === "rep" ? "#meRep" : "#mePoints");
    const tr = toast.getBoundingClientRect();
    const rr = target.getBoundingClientRect();
    return { kind, toast: tr.toJSON(), target: rr.toJSON(), centerDelta: Math.abs((tr.left + tr.width / 2) - (rr.left + rr.width / 2)) };
  });
  assert.equal(startupGeometry.kind, "rep");
  assert(startupGeometry.toast.bottom < startupGeometry.target.top, "startup reputation toast is not above its visible stat value");
  assert(startupGeometry.centerDelta <= 2, "startup reputation toast is not centered over its visible stat value");
  const repReflow = await page.evaluate(() => {
    const evidence = window.__stage7StartupLayoutEvidence || [];
    const target = document.querySelector("#meRep");
    const current = target ? target.getBoundingClientRect().toJSON() : null;
    return { initial: evidence[0] || null, current };
  });
  assert(repReflow.initial && repReflow.current, "startup reflow evidence is missing");
  assert(Math.abs(repReflow.initial.left - repReflow.current.left) > 1 || Math.abs(repReflow.initial.top - repReflow.current.top) > 1,
    "real post-start render did not move the reputation target");
  const repAfterReflow = await startup.evaluate((toast) => {
    const target = document.querySelector("#meRep");
    const tr = toast.getBoundingClientRect();
    const rr = target.getBoundingClientRect();
    return { toast: tr.toJSON(), target: rr.toJSON(), centerDelta: Math.abs((tr.left + tr.width / 2) - (rr.left + rr.width / 2)) };
  });
  assert(repAfterReflow.toast.bottom < repAfterReflow.target.top, "repositioned reputation toast is not above the moved target");
  assert(repAfterReflow.centerDelta <= 2, "repositioned reputation toast is not centered over the moved target");
  await page.clock.fastForward(30000);
  assert(await visible("#stage6StartupNameToast"), "startup reputation toast disappeared before user dismissal");
  await page.locator("#stage6StartupNameToast").click({ force: true });
  await waitVisible("#stage6StartupNameToast", "startup balance toast");
  assert.equal(await page.locator("#stage6StartupNameToast").getAttribute("data-stat-kind"), "points");
  const balanceGeometry = await page.locator("#stage6StartupNameToast").evaluate((toast) => {
    const target = document.querySelector("#mePoints");
    const tr = toast.getBoundingClientRect();
    const rr = target.getBoundingClientRect();
    return { toast: tr.toJSON(), target: rr.toJSON(), centerDelta: Math.abs((tr.left + tr.width / 2) - (rr.left + rr.width / 2)) };
  });
  assert(balanceGeometry.toast.bottom < balanceGeometry.target.top, "startup balance toast is not above its visible stat value");
  assert(balanceGeometry.centerDelta <= 2, "startup balance toast is not centered over its visible stat value");
  const pointsReflow = await page.evaluate(() => {
    const target = document.querySelector("#mePoints");
    const initial = target ? target.getBoundingClientRect().toJSON() : null;
    const state = window.Game?.__S;
    if (state?.me) state.me.name = "РайханИгрокСОченьДлиннымИменемДляПроверкиПерестройки";
    window.Game?.UI?.renderAll?.();
    const current = target ? target.getBoundingClientRect().toJSON() : null;
    return { initial, current };
  });
  assert(pointsReflow.initial && pointsReflow.current, "balance reflow evidence is missing");
  assert(Math.abs(pointsReflow.initial.left - pointsReflow.current.left) > 1 || Math.abs(pointsReflow.initial.top - pointsReflow.current.top) > 1,
    "real post-start render did not move the balance target");
  const pointsAfterReflow = await page.locator("#stage6StartupNameToast").evaluate((toast) => {
    const target = document.querySelector("#mePoints");
    const tr = toast.getBoundingClientRect();
    const rr = target.getBoundingClientRect();
    return { toast: tr.toJSON(), target: rr.toJSON(), centerDelta: Math.abs((tr.left + tr.width / 2) - (rr.left + rr.width / 2)) };
  });
  assert(pointsAfterReflow.toast.bottom < pointsAfterReflow.target.top, "repositioned balance toast is not above the moved target");
  assert(pointsAfterReflow.centerDelta <= 2, "repositioned balance toast is not centered over the moved target");
  await page.clock.fastForward(30000);
  assert(await visible("#stage6StartupNameToast"), "startup balance toast disappeared before user dismissal");
  await clickAndDismiss("#stage6StartupNameToast", "startup balance toast");

  await assertPersistsThroughRenders("#stage6DeltaNameToast_rep", "manual stat-tap name toast", async () => {
    await page.locator('[data-profile-stat="rep"]').dispatchEvent("click");
  });
  await assertOneClickFullyDismissesDelta("rep");
  await assertPersistsThroughRenders("#stage6UnifiedStatToast", "unified stat toast", async () => {
    await page.evaluate(() => window.Game.UI.showStatToast("points", "Проверка unified toast"));
  });
  const actionAnchor = await page.evaluate(() => {
    const button = document.createElement("button");
    button.id = "stage7ToastActionProbe";
    button.textContent = "probe";
    document.body.appendChild(button);
    return button.id;
  });
  assert.equal(actionAnchor, "stage7ToastActionProbe");
  await assertPersistsThroughRenders("#actionToast_stage7ToastActionProbe", "action toast", async () => {
    await page.evaluate(() => window.Game.UI.showActionToast(document.getElementById("stage7ToastActionProbe"), "Проверка action toast"));
  });
  await assertPersistsThroughRenders("#lotteryToast", "lottery/menu toast", async () => {
    await page.evaluate(() => window.Game.UI.lottery());
  });

  await page.evaluate(() => {
    window.Game.Conflict.incoming("npc_stage7_ken", { devSmoke: true, lowEconomyFree: true, silent: true });
    window.Game.UI.renderBattles();
  });
  const battleButtons = await page.locator("#battlesBlock button").evaluateAll((buttons) => buttons.map((button) => ({ text: button.textContent.trim(), cls: button.className })));
  const dismissButton = page.locator("#battlesBlock button[aria-disabled=\"true\"]").first();
  assert(await dismissButton.count(), `battle dismiss button missing: ${JSON.stringify(battleButtons)}`);
  await dismissButton.dispatchEvent("mouseenter");
  await assertPersistsThroughRenders(".btnToastRight", "battle button/chip toast", async () => {});

  await page.evaluate(() => {
    const chip = document.querySelector("#battlesBlock .chip.hiddenPower");
    if (!chip) throw new Error("battle hidden-power chip missing");
    chip.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
  await assertPersistsThroughRenders(".chipToast", "battle chip toast", async () => {});

  await page.evaluate(() => {
    const event = window.Game.Events.makeNpcEvent("npc_stage7_ken", "npc_stage7_mika");
    if (!event) throw new Error("event factory returned no event");
    event.id = "stage7-toast-event";
    event.closed = false;
    event.crowd = event.crowd || {};
    event.crowd.voters = { me: "a" };
    window.Game.Events.addEvent(event);
    window.Game.UI.renderEvents();
  });
  const voteButton = page.locator(".eventVoteBtn").first();
  assert(await voteButton.count(), "event/vote button missing");
  await voteButton.dispatchEvent("click");
  await assertPersistsThroughRenders(".voteBtnToast", "event/vote toast", async () => {});

  assert(errors.length === 0, `browser errors during toast regression: ${errors.join(" | ")}`);
  console.log("PASS_STAGE7_TASK1_TOAST_GEOMETRY_AND_CLICK_ONLY_RUNTIME");
} finally {
  await browser.close();
}
