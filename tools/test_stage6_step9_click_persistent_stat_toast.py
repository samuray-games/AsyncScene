import json
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
VISUAL_PATHS = (
    ROOT / "AsyncScene" / "Web" / "ui" / "ui-profile-visual-tone-repair.js",
    ROOT / "docs" / "ui" / "ui-profile-visual-tone-repair.js",
)


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def run_toast_harness(source: str) -> dict[str, object]:
    script = """
const source = __SOURCE__;

const microtasks = [];
const observers = [];
const resizeListeners = [];
let now = 1_000_000;
let nextTimerId = 1;
const timers = new Map();
const intervals = new Map();

function queueMicrotaskFake(fn) {{
  microtasks.push(fn);
}}

function flushMicrotasks(limit = 1000) {{
  let steps = 0;
  while (microtasks.length) {{
    const fn = microtasks.shift();
    fn();
    steps += 1;
    if (steps > limit) throw new Error("microtask_overflow");
  }}
}}

function setTimeoutFake(fn, delay = 0) {{
  const id = nextTimerId++;
  timers.set(id, {{ fn, at: now + Number(delay || 0) }});
  return id;
}}

function clearTimeoutFake(id) {{
  timers.delete(id);
}}

function setIntervalFake(fn, delay = 0) {{
  const id = nextTimerId++;
  intervals.set(id, {{ fn, delay: Number(delay || 0) }});
  return id;
}}

function advance(ms) {{
  now += Number(ms || 0);
  let progressed = true;
  let guard = 0;
  while (progressed) {{
    progressed = false;
    const due = Array.from(timers.entries())
      .filter(([, timer]) => timer.at <= now)
      .sort((a, b) => a[1].at - b[1].at || a[0] - b[0]);
    for (const [id, timer] of due) {{
      timers.delete(id);
      timer.fn();
      flushMicrotasks();
      progressed = true;
    }}
    guard += 1;
    if (guard > 1000) throw new Error("timer_overflow");
  }}
}}

class FakeTextNode {{
  constructor(value, parent = null) {{
    this.nodeType = 3;
    this.parentElement = parent;
    this._nodeValue = String(value || "");
  }}
  get nodeValue() {{
    return this._nodeValue;
  }}
  set nodeValue(next) {{
    this._nodeValue = String(next || "");
  }}
}}

class FakeElement {{
  constructor(documentRef, id = "", tagName = "div") {{
    this.ownerDocument = documentRef;
    this.id = id;
    this.tagName = String(tagName || "div").toUpperCase();
    this.nodeType = 1;
    this.style = {{}};
    this.dataset = {{}};
    this.className = "";
    this.placeholder = "";
    this.value = "";
    this.onclick = null;
    this.parentNode = null;
    this.parentElement = null;
    this.childNodes = [];
    this.__textContent = "";
    this.isConnected = false;
    this.classList = {{
      add: () => {{}},
      remove: () => {{}},
      toggle: () => {{}},
      contains: () => false,
    }};
    if (this.id) this.ownerDocument.register(this);
  }}
  appendChild(child) {{
    child.parentNode = this;
    child.parentElement = this;
    child.isConnected = this.isConnected;
    this.childNodes.push(child);
    if (child.id) this.ownerDocument.register(child);
    return child;
  }}
  remove() {{
    this.style.display = "none";
    this.isConnected = false;
    if (this.id) this.ownerDocument.unregister(this.id);
  }}
  contains(target) {{
    if (target === this) return true;
    return this.childNodes.includes(target);
  }}
  closest() {{
    return null;
  }}
  querySelectorAll() {{
    return [];
  }}
  querySelector() {{
    return null;
  }}
  getBoundingClientRect() {{
    return {{ left: 120, width: 80, bottom: 40 }};
  }}
  set textContent(next) {{
    this.__textContent = String(next || "");
    this.childNodes = [new FakeTextNode(this.__textContent, this)];
  }}
  get textContent() {{
    if (this.childNodes.length) {{
      return this.childNodes.map((node) => String(node.nodeValue || "")).join("");
    }}
    return this.__textContent;
  }}
}}

class FakeDocument {{
  constructor() {{
    this.elements = new Map();
    this.body = new FakeElement(this, "body", "body");
    this.body.isConnected = true;
  }}
  register(element) {{
    this.elements.set(element.id, element);
    element.isConnected = true;
  }}
  unregister(id) {{
    this.elements.delete(id);
  }}
  createElement(tagName) {{
    return new FakeElement(this, "", tagName);
  }}
  getElementById(id) {{
    return this.elements.get(String(id)) || null;
  }}
  querySelectorAll() {{
    return [];
  }}
  querySelector(selector) {{
    if (selector === "#dmBlock .headerTitleText") return null;
    if (selector === "#battlesBlock .battleTitleText") return null;
    if (selector === "#eventsBlock .headerTitleText") return null;
    return null;
  }}
  createTreeWalker() {{
    return {{ nextNode: () => null }};
  }}
}

class FakeMutationObserver {{
  constructor(callback) {{
    this.callback = callback;
    observers.push(this);
  }}
  observe() {{}}
}

const document = new FakeDocument();
const app = new FakeElement(document, "app", "div");
const balance = new FakeElement(document, "balance", "div");
document.body.appendChild(app);
document.body.appendChild(balance);

const window = {{
  Game: {{
    __DEV: {{}},
    Data: {{
      TEXTS: {{}},
      START_SCREEN_PROFILE_TEXTS: {{}},
      UI_PROFILE: "millennial",
      getUiProfile() {{
        return this.UI_PROFILE;
      }},
      normalizeUiProfile(value) {{
        return String(value || "").trim();
      }},
      setUiProfile(value) {{
        this.UI_PROFILE = String(value || "");
        return this.UI_PROFILE;
      }},
      t(key) {{
        return String(key || "");
      }},
    }},
    UI: {{
      renderCalls: [],
      renderChat() {{ this.renderCalls.push("renderChat"); }},
      renderDM() {{ this.renderCalls.push("renderDM"); }},
      renderEvents() {{ this.renderCalls.push("renderEvents"); }},
      renderBattles() {{ this.renderCalls.push("renderBattles"); }},
      requestRenderAll() {{ this.renderCalls.push("requestRenderAll"); }},
      renderAll() {{ this.renderCalls.push("renderAll"); }},
    }},
    System: {{
      say() {{
        return "";
      }},
      profileText() {{
        return "";
      }},
      deliveryPolicy() {{
        return {{ panel: false, toast: false, chat: false, statKind: "points", kind: "", code: "", text: "" }};
      }},
    }},
  }},
  addEventListener(type, fn) {{
    if (type === "resize") resizeListeners.push(fn);
  }},
}};

const context = {{
  window,
  Game: window.Game,
  document,
  console: {{ log() {{}}, warn() {{}}, error() {{}} }},
  Date: class FakeDate extends Date {{
    constructor(...args) {{
      super(...(args.length ? args : [now]));
    }}
    static now() {{
      return now;
    }}
  }},
  Math,
  Node: {{ TEXT_NODE: 3 }},
  NodeFilter: {{ SHOW_TEXT: 4 }},
  MutationObserver: FakeMutationObserver,
  queueMicrotask: queueMicrotaskFake,
  setTimeout: setTimeoutFake,
  clearTimeout: clearTimeoutFake,
  setInterval: setIntervalFake,
  clearInterval: () => {{}},
}};

import vm from "vm";
vm.createContext(context);
vm.runInContext(source, context, {{ filename: "ui-profile-visual-tone-repair.js" }});

window.Game.UI.emitStatDelta("points", 2);
window.Game.UI.emitStatDelta("rep", 1);
advance(200);
flushMicrotasks();

const toast = document.getElementById("stage6UnifiedStatToast");
const beforeText = toast ? toast.textContent : "";
const beforePosition = toast ? {{ left: toast.style.left || "", top: toast.style.top || "", display: toast.style.display || "" }} : null;

advance(120_000);
window.Game.UI.renderChat();
window.Game.UI.renderDM();
window.Game.UI.renderEvents();
window.Game.UI.renderBattles();
window.Game.UI.requestRenderAll();
window.Game.UI.renderAll();

window.Game.Data.setUiProfile("alpha");
for (const observer of observers) observer.callback([]);
flushMicrotasks();
for (const [, interval] of intervals.entries()) interval.fn();
flushMicrotasks();
for (const listener of resizeListeners) listener();
flushMicrotasks();

const afterText = toast ? toast.textContent : "";
const afterPosition = toast ? {{ left: toast.style.left || "", top: toast.style.top || "", display: toast.style.display || "" }} : null;
const timersBeforeClick = timers.size;
if (toast && typeof toast.onclick === "function") toast.onclick();
flushMicrotasks();
const afterClickDisplay = toast ? toast.style.display || "" : "";
const afterClickText = toast ? toast.textContent : "";
window.Game.Data.setUiProfile("millennial");
for (const [, interval] of intervals.entries()) interval.fn();
flushMicrotasks();

console.log(JSON.stringify({{
  beforeText,
  beforePosition,
  afterText,
  afterPosition,
  afterClickDisplay,
  afterClickText,
  renderCalls: window.Game.UI.renderCalls,
  pendingTimers: timers.size,
  timersBeforeClick,
  intervalCount: intervals.size,
  observerCount: observers.length,
  resizeListenerCount: resizeListeners.length,
}}));
""".replace("__SOURCE__", json.dumps(source)).replace("{{", "{").replace("}}", "}")
    completed = subprocess.run(
        ["node", "--input-type=module", "-e", script],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
    )
    if completed.returncode != 0:
        raise AssertionError(
            "toast harness failed\n"
            f"stdout:\n{completed.stdout}\n"
            f"stderr:\n{completed.stderr}"
        )
    return json.loads(completed.stdout)


class ClickPersistentStatToastTests(unittest.TestCase):
    def test_unified_toast_is_click_persistent_across_mirrors(self) -> None:
        for path in VISUAL_PATHS:
            source = read(path)
            watcher = source[source.index("function installProfileWatcher") : source.index("function visibleRoleLabel")]
            self.assertNotIn('toastState.visible = { deltas: Object.create(null), messages: [], lastUpdateAt: 0 };', watcher)
            self.assertNotIn('toast.style.display = "none"', watcher)

            result = run_toast_harness(source)

            self.assertIn("Баланс: +2.", result["beforeText"])
            self.assertIn("Репутация +1.", result["beforeText"])
            self.assertEqual(result["beforePosition"]["display"], "block")
            self.assertIn("+2💰", result["afterText"])
            self.assertIn("+1⭐", result["afterText"])
            self.assertEqual(result["afterPosition"]["display"], "block")
            self.assertEqual(result["beforePosition"]["left"], result["afterPosition"]["left"])
            self.assertEqual(result["beforePosition"]["top"], result["afterPosition"]["top"])
            self.assertEqual(result["afterText"].count("+2💰"), 1)
            self.assertEqual(result["afterText"].count("+1⭐"), 1)
            self.assertEqual(
                result["renderCalls"],
                ["renderChat", "renderDM", "renderEvents", "renderBattles", "requestRenderAll", "renderAll"],
            )
            self.assertEqual(result["timersBeforeClick"], 0)
            self.assertEqual(result["pendingTimers"], 0)
            self.assertEqual(result["afterClickDisplay"], "none")
            self.assertEqual(result["afterClickText"], result["afterText"])
            self.assertEqual(result["intervalCount"], 1)
            self.assertEqual(result["observerCount"], 1)
            self.assertEqual(result["resizeListenerCount"], 1)


if __name__ == "__main__":
    unittest.main()
