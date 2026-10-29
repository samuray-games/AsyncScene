import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

class Element {
  constructor(name) {
    this.name = name;
    this.hidden = false;
    this.disabled = false;
    this.dataset = {};
    this.handlers = {};
    this.attributes = {};
    this.textContent = "";
    this.tabIndex = 0;
    this.scrollTop = 0;
    this.clientHeight = 300;
    this._innerHTML = "";
  }
  addEventListener(name, callback) { this.handlers[name] = callback; }
  setAttribute(name, value) { this.attributes[name] = value; }
  getAttribute(name) { return this.attributes[name] ?? null; }
  focus() { this.focused = true; }
  replaceChildren() { this._innerHTML = ""; }
  set innerHTML(value) { this._innerHTML = value; }
  get innerHTML() { return this._innerHTML; }
  get scrollHeight() { return (this._innerHTML.match(/<article /g) || []).length * 64; }
  querySelector(selector) { return this.children?.[selector] || null; }
  click() { if (!this.disabled && this.handlers.click) this.handlers.click({}); }
}

const selectors = [
  "[data-chat-feed]", "[data-chat-status]", "[data-chat-notice]", "[data-chat-error]",
  '[data-chat-action="older"]', '[data-chat-action="demo"]', '[data-chat-action="error"]',
  "[data-chat-page-status]",
];
const panel = new Element("panel");
panel.hidden = true;
panel.children = Object.fromEntries(selectors.map((selector) => [selector, new Element(selector)]));
const modeButtons = [new Element("game tab"), new Element("public tab")];
modeButtons[0].dataset.chatMode = "game";
modeButtons[0].setAttribute("aria-selected", "true");
modeButtons[1].dataset.chatMode = "public";
modeButtons[1].setAttribute("aria-selected", "false");
const legacy = [new Element("legacy log"), new Element("legacy composer"), new Element("resize handle")];
const ids = { generalChatPanel: panel, chatLog: legacy[0], chatInputRow: legacy[1], chatResizeHandle: legacy[2] };
const timers = [];
const document = {
  getElementById: (id) => ids[id] || null,
  querySelectorAll: (selector) => selector === "[data-chat-mode]" ? modeButtons : [],
};
const window = { Game: {}, setTimeout: (callback) => { timers.push(callback); } };
vm.runInNewContext(fs.readFileSync(new URL("./chat04_1_general_chat.js", import.meta.url), "utf8"), { document, window });

const child = (selector) => panel.children[selector];
const matches = () => [...child("[data-chat-feed]").innerHTML.matchAll(/data-entity-id="([^"]+)"/g)].map((match) => match[1]);
const check = (condition, label) => { assert.ok(condition, label); process.stdout.write(`PASS ${label}\n`); };

check(child("[data-chat-status]").textContent === "Сервер общего чата не подключён", "live mode reports backend unavailable");
check(child("[data-chat-feed]").innerHTML.includes("Общий чат пока недоступен"), "empty state renders");
check(!child("[data-chat-feed]").innerHTML.includes("data-entity-id"), "live state does not fabricate timeline records");
check(legacy.every((element) => !element.hidden), "game chat remains visible by default");
check(modeButtons[0].tabIndex === 0 && modeButtons[1].tabIndex === -1, "initial tab focus order matches selected tab");
modeButtons[1].click();
check(!panel.hidden && legacy.every((element) => element.hidden), "public tab is isolated from game chat");
child('[data-chat-action="demo"]').click();
check(child("[data-chat-status]").textContent.startsWith("ДЕМО"), "fixture mode is explicitly labelled");
check(matches().length === 8, "fixture mode restores the latest page of eight fixture records");
check(matches()[0] === "fixture-event-005" && matches().at(-1) === "fixture-message-018", "fixture page is sorted by publication order");
check(child('[data-chat-action="older"]').disabled === false, "older fixture page is available");

const feed = child("[data-chat-feed]");
feed.scrollTop = 17;
child('[data-chat-action="older"]').click();
check(child('[data-chat-action="older"]').textContent.includes("Подготовка"), "fixture pagination loading state is explicit");
timers.shift()();
check(matches().length === 16, "pagination prepends one older fixture page");
check(matches()[0] === "fixture-event-003", "older page is prepended in chronological order");
check(feed.scrollTop === 17 + 512, "scroll anchor is retained when older fixtures are prepended");
child('[data-chat-action="older"]').click();
timers.shift()();
check(matches().length === 24 && child('[data-chat-action="older"]').disabled, "pagination stops at the beginning of fixture history");

child('[data-chat-action="error"]').click();
check(!child("[data-chat-error]").hidden && child("[data-chat-error]").textContent.includes("запрос к серверу не выполнялся"), "error state is local and does not imply a network request");
child('[data-chat-action="demo"]').click();
check(matches().length === 0 && child("[data-chat-notice]").hidden === false, "leaving demo returns to the honest unavailable state");
check(panel.hidden === false, "public tab opens its panel");
modeButtons[0].click();
check(panel.hidden && legacy.every((element) => !element.hidden), "tab navigation returns to the separate game feed");

const html = fs.readFileSync(new URL("./chat04_1_general_chat_preview.html", import.meta.url), "utf8");
check(/<textarea[^>]*disabled/.test(html) && /<button type="button" disabled>Отправить/.test(html), "composer controls are disabled until backend exists");
check(html.includes("тестовые данные и ничего не отправляет"), "demo mode explicitly disclaims sending and delivery");

process.stdout.write("CHAT04_1_UI_FIXTURES_PASS\n");
