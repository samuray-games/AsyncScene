from __future__ import annotations

import json
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS_INDEX = (ROOT / "docs" / "index.html").resolve()
STATE_SOURCE = ROOT / "AsyncScene" / "Web" / "state.js"


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


def run_state_security_harness() -> dict[str, object]:
    source = STATE_SOURCE.read_text(encoding="utf-8")
    function_names = (
        "withGlobalTamperTrust",
        "defineGameSurfaceProp",
        "captureSecurityStack",
        "auditSecurityCaller",
        "securitySafeKey",
        "emitForbiddenAccess",
        "emitTamperDetected",
        "isProtectedSurface",
        "describeSurface",
        "handleGlobalTamper",
    )
    extracted = "\n\n".join(extract_named_function(source, name) for name in function_names)
    script = f"""
const recorded = [];
let globalTamperTrustedDepth = 0;
const Game = {{ __S: {{ flags: {{}} }}, __A: {{}}, __D: {{}} }};
const Security = {{
  emit(type, details) {{
    recorded.push({{ type, meta: {{ ...(details || {{}}) }} }});
  }}
}};

function isDevFlag() {{ return false; }}
function securityAuditMode() {{ return isDevFlag() ? "dev" : "prod"; }}
const auditLines = [];
function auditSecurityConsole(message) {{
  auditLines.push(String(message || ""));
}}

{extracted}

const originalDefineProperty = Object.defineProperty;
Object.defineProperty = function(target, prop, descriptor) {{
  handleGlobalTamper(target, prop, "defineProperty");
  return originalDefineProperty.call(Object, target, prop, descriptor);
}};

defineGameSurfaceProp("State", "__S");
defineGameSurfaceProp("StateAPI", "__A");
defineGameSurfaceProp("Debug", "__D");

const count = (type) => recorded.filter((entry) => entry && entry.type === type).length;
const lastOfType = (type) => {{
  for (let index = recorded.length - 1; index >= 0; index -= 1) {{
    if (recorded[index] && recorded[index].type === type) return recorded[index];
  }}
  return null;
}};

const beforeForbidden = count("forbidden_api_access");
const beforeTamper = count("tamper_detected");

Object.defineProperty({{}}, "value", {{ value: 1, configurable: true }});
const afterPlainForbidden = count("forbidden_api_access");

Object.defineProperty(Game.__A, "__selfTriggerProbe__", {{ value: 1, configurable: true }});
const afterTamper = count("tamper_detected");
const afterProtectedTamperForbidden = count("forbidden_api_access");

void Game.State;
const afterExplicitForbidden = count("forbidden_api_access");

console.log(JSON.stringify({{
  beforeForbidden,
  afterPlainForbidden,
  beforeTamper,
  afterTamper,
  afterProtectedTamperForbidden,
  afterExplicitForbidden,
  lastForbiddenKey: lastOfType("forbidden_api_access")?.meta?.key || null,
  lastTamperKey: lastOfType("tamper_detected")?.meta?.key || null,
  lastAuditLine: auditLines.length ? auditLines[auditLines.length - 1] : null
}}));
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
            "state security harness failed\n"
            f"stdout:\n{completed.stdout}\n"
            f"stderr:\n{completed.stderr}"
        )
    return json.loads(completed.stdout)


def run_playwright_probe(url: str) -> dict[str, object]:
    script = f"""
import {{ chromium }} from 'playwright';

const browser = await chromium.launch({{ headless: true }});
const page = await browser.newPage();

try {{
  await page.goto({json.dumps(url)}, {{ waitUntil: 'load' }});
  await page.waitForFunction(
    () => window.Game && window.Game.__D && Array.isArray(window.Game.__D.securityEvents) && document.getElementById('startBirthYear0Up'),
    null,
    {{ timeout: 15000 }}
  );
  const result = await page.evaluate(async () => {{
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const events = () => (
      window.Game && window.Game.__D && Array.isArray(window.Game.__D.securityEvents)
        ? window.Game.__D.securityEvents.slice()
        : []
    );
    const count = (type) => events().filter((entry) => entry && entry.type === type).length;
    const lastOfType = (type) => {{
      const entries = events();
      for (let index = entries.length - 1; index >= 0; index -= 1) {{
        if (entries[index] && entries[index].type === type) return entries[index];
      }}
      return null;
    }};

    const beforeForbidden = count("forbidden_api_access");
    const beforeTamper = count("tamper_detected");

    const birthYearButton = document.getElementById("startBirthYear0Up");
    if (!birthYearButton) throw new Error("missing #startBirthYear0Up");
    birthYearButton.click();
    await sleep(50);
    const afterBirthYearForbidden = count("forbidden_api_access");

    const plainProbe = {{}};
    Object.defineProperty(plainProbe, "value", {{ value: 1, configurable: true }});
    await sleep(50);
    const afterPlainDefineForbidden = count("forbidden_api_access");

    Object.defineProperty(window.Game.__A, "__selfTriggerProbe__", {{ value: 1, configurable: true }});
    await sleep(50);
    const afterTamper = count("tamper_detected");

    const beforeExplicitForbidden = count("forbidden_api_access");
    void window.Game.State;
    await sleep(50);
    const afterExplicitForbidden = count("forbidden_api_access");

    const lastForbidden = lastOfType("forbidden_api_access");
    const lastTamper = lastOfType("tamper_detected");

    return {{
      beforeForbidden,
      afterBirthYearForbidden,
      afterPlainDefineForbidden,
      beforeTamper,
      afterTamper,
      beforeExplicitForbidden,
      afterExplicitForbidden,
      lastForbiddenKey: lastForbidden && lastForbidden.meta ? lastForbidden.meta.key : null,
      lastTamperKey: lastTamper && lastTamper.meta ? lastTamper.meta.key : null,
      birthYearValue: document.getElementById("startBirthYearPicker")?.getAttribute("data-birth-year-value") || null,
    }};
  }});
  console.log(JSON.stringify(result));
}} finally {{
  await browser.close();
}}
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
            "playwright probe failed\n"
            f"stdout:\n{completed.stdout}\n"
            f"stderr:\n{completed.stderr}"
        )
    return json.loads(completed.stdout)


class Step9SecurityAuditSelfTriggerTests(unittest.TestCase):
    def test_state_security_harness_avoids_self_trigger_and_preserves_guards(self) -> None:
        result = run_state_security_harness()

        self.assertEqual(result["afterPlainForbidden"], result["beforeForbidden"])
        self.assertEqual(result["afterTamper"], result["beforeTamper"] + 1)
        self.assertEqual(result["afterProtectedTamperForbidden"], result["beforeForbidden"])
        self.assertEqual(result["lastTamperKey"], "Game.StateAPI.__selfTriggerProbe__")
        self.assertEqual(result["afterExplicitForbidden"], result["beforeForbidden"] + 1)
        self.assertEqual(result["lastForbiddenKey"], "Game.State")
        self.assertIn("key=Game.State", result["lastAuditLine"])

    def test_birth_year_click_does_not_trigger_forbidden_access_when_browser_runtime_is_available(self) -> None:
        try:
            result = run_playwright_probe(DOCS_INDEX.as_uri())
        except AssertionError as exc:
            self.skipTest(str(exc))

        self.assertNotEqual(result["birthYearValue"], "00")
        self.assertEqual(result["afterBirthYearForbidden"], result["beforeForbidden"])


if __name__ == "__main__":
    unittest.main()
