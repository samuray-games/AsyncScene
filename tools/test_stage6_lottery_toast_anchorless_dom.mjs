import assert from "node:assert/strict";
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 960, height: 640 } });
  await page.goto("http://127.0.0.1:8094/blank.html").catch(() => {});
  await page.evaluate(() => {
    window.Game = { UI: { S: { flags: {}, me: { points: 0 } } }, Data: {
      t: () => "Лотерея недоступна",
      getUiProfile: () => "millennial"
    } };
  });
  await page.addScriptTag({ url: "http://127.0.0.1:8094/ui/ui-menu.js" });
  await page.waitForFunction(() => typeof window.Game?.UI?.lottery === "function");

  const result = await page.evaluate(async () => {
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const run = async (withAnchor) => {
      document.getElementById("lotteryToast")?.remove();
      document.getElementById("btnLotteryTop")?.remove();
      if (withAnchor) {
        const anchor = document.createElement("button");
        anchor.id = "btnLotteryTop";
        anchor.style.cssText = "position:fixed;left:100px;top:100px;width:80px;height:30px";
        document.body.appendChild(anchor);
      }
      window.Game.UI.lottery();
      const toast = document.getElementById("lotteryToast");
      const initial = toast && {
        visible: toast.style.display === "block",
        left: toast.style.left,
        top: toast.style.top,
        transform: toast.style.transform
      };
      await wait(1100);
      const persistent = !!toast && toast.style.display === "block";
      toast?.click();
      return { initial, persistent, dismissed: !document.getElementById("lotteryToast") || toast.style.display === "none" };
    };
    return { anchored: await run(true), fallback: await run(false) };
  });

  for (const key of ["anchored", "fallback"]) {
    assert.equal(result[key].initial.visible, true, `${key} toast visible`);
    assert.equal(result[key].persistent, true, `${key} toast persists`);
    assert.equal(result[key].dismissed, true, `${key} toast click dismisses`);
    assert.notEqual(result[key].initial.left, "", `${key} toast has deterministic left`);
    assert.notEqual(result[key].initial.top, "", `${key} toast has deterministic top`);
  }
  assert.equal(result.anchored.initial.transform, "translateX(-50%)");
  assert.equal(result.fallback.initial.transform, "translateX(-50%)");
  console.log("STAGE6_LOTTERY_TOAST_ANCHOR_PRESENT_ABSENT_DOM_PASS", result);
} finally {
  await browser.close();
}
