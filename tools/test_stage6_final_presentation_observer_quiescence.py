from __future__ import annotations

import json
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
BASELINE_SHA = "a3361932229ce1b6ee77a6d01e297367eaf05f6f"
VISUAL_CASES = {
    "source": "AsyncScene/Web/ui/ui-profile-visual-tone-repair.js",
    "docs": "docs/ui/ui-profile-visual-tone-repair.js",
}


def read(relative_path: str) -> str:
    return (ROOT / relative_path).read_text(encoding="utf-8")


def git_show(revision: str, relative_path: str) -> str:
    completed = subprocess.run(
        ["git", "show", f"{revision}:{relative_path}"],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
    )
    if completed.returncode != 0:
        raise AssertionError(
            "git show failed\n"
            f"stdout:\n{completed.stdout}\n"
            f"stderr:\n{completed.stderr}"
        )
    return completed.stdout


def extract_named_function(source: str, name: str) -> str:
    anchor = f"function {name}("
    start = source.find(anchor)
    if start < 0:
        raise AssertionError(f"missing function {name}")
    brace = source.find("{", start)
    if brace < 0:
        raise AssertionError(f"missing function body for {name}")
    depth = 0
    in_string = False
    string_char = ""
    escaped = False
    for index in range(brace, len(source)):
        ch = source[index]
        if in_string:
            if escaped:
                escaped = False
            elif ch == "\\":
                escaped = True
            elif ch == string_char:
                in_string = False
            continue
        if ch in ("'", '"', "`"):
            in_string = True
            string_char = ch
            continue
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return source[start:index + 1]
    raise AssertionError(f"unterminated function {name}")


def extract_const_block(source: str, anchor: str) -> str:
    start = source.find(anchor)
    if start < 0:
        raise AssertionError(f"missing const block: {anchor}")
    brace = source.find("{", start)
    if brace < 0:
        raise AssertionError(f"missing block body: {anchor}")
    depth = 0
    in_string = False
    string_char = ""
    escaped = False
    for index in range(brace, len(source)):
        ch = source[index]
        if in_string:
            if escaped:
                escaped = False
            elif ch == "\\":
                escaped = True
            elif ch == string_char:
                in_string = False
            continue
        if ch in ("'", '"', "`"):
            in_string = True
            string_char = ch
            continue
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                end = source.find(";", index)
                if end < 0:
                    raise AssertionError(f"unterminated const block: {anchor}")
                return source[start:end + 1]
    raise AssertionError(f"unterminated const block: {anchor}")


def build_runtime_snippet(source: str) -> str:
    function_names = (
        "activeProfile",
        "replaceSemanticExactText",
        "routeScopedNodeText",
        "syncHardcodedControls",
        "eventTextForProfile",
        "syncEventCopy",
        "syncVisibleProfileCopy",
        "queueSync",
        "installScopedObserver",
    )
    parts = [
        extract_const_block(source, "const PROFILE_KEYS = Object.freeze("),
        extract_const_block(source, "const CONTROL_COPY = Object.freeze("),
        extract_const_block(source, "const LABEL_VARIANTS = Object.freeze("),
        "let syncing = false;",
        "let syncQueued = false;",
    ]
    parts.extend(extract_named_function(source, name) for name in function_names)
    return "\n\n".join(parts)


def run_observer_harness(source: str, initial_dm_title: str, max_microtasks: int = 24) -> dict[str, object]:
    runtime = build_runtime_snippet(source)
    script = f"""
const mutationLog = [];
const microtasks = [];
const observerEntries = [];

globalThis.queueMicrotask = (fn) => {{
  microtasks.push(fn);
}};

const Node = {{ ELEMENT_NODE: 1, TEXT_NODE: 3 }};
const NodeFilter = {{ SHOW_TEXT: 4 }};
globalThis.Node = Node;
globalThis.NodeFilter = NodeFilter;

class FakeTextNode {{
  constructor(value, parent) {{
    this.nodeType = Node.TEXT_NODE;
    this.parentNode = parent;
    this.parentElement = parent && parent.nodeType === Node.ELEMENT_NODE ? parent : null;
    this._nodeValue = String(value || "");
  }}

  get nodeValue() {{
    return this._nodeValue;
  }}

  set nodeValue(next) {{
    const previous = this._nodeValue;
    this._nodeValue = String(next || "");
    mutationLog.push({{
      type: "characterData",
      previous,
      next: this._nodeValue,
      same: previous === this._nodeValue,
    }});
    notifyMutation(this);
  }}
}}

class FakeElement {{
  constructor(id, text) {{
    this.nodeType = Node.ELEMENT_NODE;
    this.id = id || "";
    this.parentNode = null;
    this.parentElement = null;
    this.childNodes = [];
    this.dataset = {{}};
    this.placeholder = "";
    this._querySelectorMap = new Map();
    this._querySelectorAllMap = new Map();
    if (text !== undefined) this.appendText(text);
  }}

  appendText(text) {{
    const node = new FakeTextNode(text, this);
    this.childNodes.push(node);
    return node;
  }}

  get textContent() {{
    return this.childNodes.map((node) => String(node.nodeValue || "")).join("");
  }}

  set textContent(value) {{
    const next = String(value || "");
    if (this.childNodes.length === 1 && this.childNodes[0].nodeType === Node.TEXT_NODE) {{
      this.childNodes[0].nodeValue = next;
      return;
    }}
    this.childNodes = [new FakeTextNode(next, this)];
    notifyMutation(this.childNodes[0]);
  }}

  closest() {{
    return null;
  }}

  querySelector(selector) {{
    return this._querySelectorMap.get(selector) || null;
  }}

  querySelectorAll(selector) {{
    return this._querySelectorAllMap.get(selector) || [];
  }}

  setQuerySelector(selector, value) {{
    this._querySelectorMap.set(selector, value);
  }}

  setQuerySelectorAll(selector, value) {{
    this._querySelectorAllMap.set(selector, Array.from(value || []));
  }}
}}

function collectTextNodes(root) {{
  const results = [];
  function visit(node) {{
    if (!node) return;
    if (node.nodeType === Node.TEXT_NODE) {{
      results.push(node);
      return;
    }}
    if (Array.isArray(node.childNodes)) {{
      node.childNodes.forEach(visit);
    }}
  }}
  visit(root);
  return results;
}}

function createTreeWalker(root) {{
  const nodes = collectTextNodes(root);
  let index = 0;
  return {{
    nextNode() {{
      if (index >= nodes.length) return null;
      return nodes[index++];
    }}
  }};
}}

function isDescendant(node, root) {{
  let current = node;
  while (current) {{
    if (current === root) return true;
    current = current.parentNode;
  }}
  return false;
}}

const observers = [];
class MutationObserver {{
  constructor(callback) {{
    this.callback = callback;
    this.root = null;
    this.pending = false;
  }}

  observe(root) {{
    this.root = root;
    observers.push(this);
  }}
}}
globalThis.MutationObserver = MutationObserver;

function notifyMutation(target) {{
  observers.forEach((observer) => {{
    if (!observer.root || !isDescendant(target, observer.root) || observer.pending) return;
    observer.pending = true;
    queueMicrotask(() => {{
      observer.pending = false;
      observerEntries.push({{ targetId: target.parentElement && target.parentElement.id ? target.parentElement.id : null }});
      observer.callback([{{ type: "characterData", target }}]);
    }});
  }});
}}

const app = new FakeElement("app");
const body = new FakeElement("body");
body.dataset = {{}};
app.parentNode = body;
app.parentElement = body;

const chatInput = new FakeElement("chatInput");
chatInput.placeholder = "чат...";
const btnSend = new FakeElement("btnSend", "Отправить");
const dmInput = new FakeElement("dmInput");
dmInput.placeholder = "в личку...";
const dmSend = new FakeElement("dmSend", "Отправить");
const btnMenu = new FakeElement("btnMenu", "Меню");
const dmHeaderTitle = new FakeElement("dmHeaderTitle", "Личка");
const dmTitle = new FakeElement("dmTitle", {json.dumps(initial_dm_title)});
const battlesTitle = new FakeElement("battlesTitle", "Бои");
const eventsTitle = new FakeElement("eventsTitle", "Ивенты");
const dmBlock = new FakeElement("dmBlock");
const dmHeader = new FakeElement("dmHeader");
const battlesBlock = new FakeElement("battlesBlock");
const teachPanel = new FakeElement("teachPanel");
const dmActions = new FakeElement("dmActions");
const eventsBody = new FakeElement("eventsBody");

[
  chatInput, btnSend, dmInput, dmSend, btnMenu,
  dmBlock, battlesBlock, teachPanel, dmActions, eventsBody
].forEach((child) => {{
  child.parentNode = app;
  child.parentElement = app;
  app.childNodes.push(child);
}});

dmHeader.parentNode = dmBlock;
dmHeader.parentElement = dmBlock;
dmBlock.childNodes.push(dmHeader);
dmTitle.parentNode = dmHeader;
dmTitle.parentElement = dmHeader;
dmHeader.childNodes.push(dmTitle);

const idMap = new Map([
  ["app", app],
  ["chatInput", chatInput],
  ["btnSend", btnSend],
  ["dmInput", dmInput],
  ["dmSend", dmSend],
  ["btnMenu", btnMenu],
  ["dmBlock", dmBlock],
  ["dmHeader", dmHeader],
  ["dmTitle", dmTitle],
  ["battlesBlock", battlesBlock],
  ["teachPanel", teachPanel],
  ["dmActions", dmActions],
  ["eventsBody", eventsBody],
]);

const queryMap = new Map([
  ["#dmBlock .headerTitleText", dmHeaderTitle],
  ["#battlesBlock .battleTitleText", battlesTitle],
  ["#eventsBlock .headerTitleText", eventsTitle],
]);

const document = {{
  body,
  getElementById(id) {{
    return idMap.get(id) || null;
  }},
  querySelector(selector) {{
    return queryMap.get(selector) || null;
  }},
  querySelectorAll() {{
    return [];
  }},
  createTreeWalker(root) {{
    return createTreeWalker(root);
  }},
}};
globalThis.document = document;

const window = globalThis;
window.Game = {{
  Data: {{
    UI_PROFILE: "alpha",
    getUiProfile() {{
      return "alpha";
    }},
    normalizeUiProfile(value) {{
      return String(value || "").trim().toLowerCase() === "genx" ? "genX" : String(value || "").trim();
    }},
  }},
  UI: {{}},
  System: {{}},
}};
const Game = window.Game;
const Data = Game.Data;
const UI = Game.UI;

{runtime}

let syncCount = 0;
const originalSyncVisibleProfileCopy = syncVisibleProfileCopy;
syncVisibleProfileCopy = function wrappedSyncVisibleProfileCopy() {{
  syncCount += 1;
  return originalSyncVisibleProfileCopy();
}};

function runQueuedMicrotasks(limit) {{
  let steps = 0;
  while (microtasks.length && steps < limit) {{
    const task = microtasks.shift();
    steps += 1;
    task();
  }}
  return {{
    steps,
    quiesced: microtasks.length === 0,
    remaining: microtasks.length,
  }};
}}

syncVisibleProfileCopy();
const afterInitial = dmTitle.textContent;
const initialMutationCount = mutationLog.length;

mutationLog.length = 0;
observerEntries.length = 0;
syncCount = 0;

installScopedObserver();
queueSync();
const observerRun = runQueuedMicrotasks({max_microtasks});
const result = {{
  initialDmTitle: {json.dumps(initial_dm_title)},
  afterInitial,
  initialMutationCount,
  syncCount,
  mutationCount: mutationLog.length,
  sameValueMutationCount: mutationLog.filter((entry) => entry.same).length,
  observerCallbackCount: observerEntries.length,
  quiesced: observerRun.quiesced,
  remainingMicrotasks: observerRun.remaining,
  processedMicrotasks: observerRun.steps,
  finalDmTitle: dmTitle.textContent,
  dmHeaderText: dmHeaderTitle.textContent,
  battlesHeaderText: battlesTitle.textContent,
  eventsHeaderText: eventsTitle.textContent,
}};

console.log(JSON.stringify(result));
"""
    completed = subprocess.run(
        ["node", "--input-type=module", "-e", script],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
    )
    if completed.returncode != 0:
        raise AssertionError(
            "observer harness failed\n"
            f"stdout:\n{completed.stdout}\n"
            f"stderr:\n{completed.stderr}"
        )
    return json.loads(completed.stdout)


class Stage6FinalPresentationObserverQuiescenceTests(unittest.TestCase):
    def test_baseline_reproduces_non_quiescent_self_trigger_loop_in_both_mirrors(self) -> None:
        results = {}
        for label, relative_path in VISUAL_CASES.items():
            baseline_source = git_show(BASELINE_SHA, relative_path)
            results[label] = run_observer_harness(baseline_source, initial_dm_title="Личка")

        for result in results.values():
            self.assertEqual(result["afterInitial"], "Личка")
            self.assertGreater(result["sameValueMutationCount"], 0)
            self.assertGreater(result["observerCallbackCount"], 0)
            self.assertGreater(result["syncCount"], 1)
            self.assertFalse(result["quiesced"])
            self.assertGreater(result["remainingMicrotasks"], 0)
            self.assertEqual(result["finalDmTitle"], "Личка")

        self.assertEqual(results["source"], results["docs"])

    def test_patched_mirrors_quiesce_for_stable_dm_title(self) -> None:
        results = {}
        for label, relative_path in VISUAL_CASES.items():
            results[label] = run_observer_harness(read(relative_path), initial_dm_title="Личка")

        for result in results.values():
            self.assertEqual(result["afterInitial"], "Личка")
            self.assertTrue(result["quiesced"])
            self.assertEqual(result["remainingMicrotasks"], 0)
            self.assertEqual(result["sameValueMutationCount"], 0)
            self.assertEqual(result["observerCallbackCount"], 0)
            self.assertEqual(result["syncCount"], 1)
            self.assertEqual(result["finalDmTitle"], "Личка")
            self.assertEqual(result["dmHeaderText"], "Личка")
            self.assertEqual(result["battlesHeaderText"], "Бои")
            self.assertEqual(result["eventsHeaderText"], "Ивенты")

        self.assertEqual(results["source"], results["docs"])

    def test_patched_mirrors_update_once_then_stabilize_without_text_drift(self) -> None:
        results = {}
        for label, relative_path in VISUAL_CASES.items():
            results[label] = run_observer_harness(read(relative_path), initial_dm_title="ЛС: 2")

        for result in results.values():
            self.assertEqual(result["afterInitial"], "Личка: 2")
            self.assertEqual(result["initialMutationCount"], 1)
            self.assertTrue(result["quiesced"])
            self.assertEqual(result["remainingMicrotasks"], 0)
            self.assertEqual(result["sameValueMutationCount"], 0)
            self.assertEqual(result["observerCallbackCount"], 0)
            self.assertEqual(result["syncCount"], 1)
            self.assertEqual(result["finalDmTitle"], "Личка: 2")

        self.assertEqual(results["source"], results["docs"])


if __name__ == "__main__":
    unittest.main()
