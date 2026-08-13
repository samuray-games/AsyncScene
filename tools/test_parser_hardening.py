from __future__ import annotations

import json
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "AsyncScene" / "Web"
DOCS = ROOT / "docs"

MIRROR_PAIRS = (
    ("util.js", "util.js"),
    ("conflict/conflict-core.js", "conflict/conflict-core.js"),
    ("conflict/conflict-arguments.js", "conflict/conflict-arguments.js"),
    ("conflict/conflict-economy.js", "conflict/conflict-economy.js"),
    ("ui/logger.js", "ui/logger.js"),
    ("ui/ui-profile-visual-tone-repair.js", "ui/ui-profile-visual-tone-repair.js"),
)


def extract_named_function(source: str, name: str) -> str:
    anchor = f"function {name}("
    start = source.find(anchor)
    if start < 0:
        raise AssertionError(f"missing function {name}")
    brace = source.find("{", start)
    if brace < 0:
        raise AssertionError(f"missing body for {name}")
    depth = 0
    quote = ""
    escaped = False
    for index in range(brace, len(source)):
        char = source[index]
        if quote:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == quote:
                quote = ""
            continue
        if char in ("'", '"', "`"):
            quote = char
        elif char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return source[start:index + 1]
    raise AssertionError(f"unterminated function {name}")


def run_node(script: str) -> None:
    completed = subprocess.run(
        ["node", "--input-type=module", "-e", script],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
    )
    if completed.returncode != 0:
        raise AssertionError(
            "node parser harness failed\n"
            f"stdout:\n{completed.stdout}\n"
            f"stderr:\n{completed.stderr}"
        )


class ParserHardeningTests(unittest.TestCase):
    def test_changed_runtime_mirrors_are_byte_identical(self) -> None:
        for source_path, docs_path in MIRROR_PAIRS:
            with self.subTest(path=source_path):
                self.assertEqual(
                    (SOURCE / source_path).read_bytes(),
                    (DOCS / docs_path).read_bytes(),
                )

    def test_shared_parser_matrix_and_valid_input_equivalence(self) -> None:
        util_source = (SOURCE / "util.js").read_text(encoding="utf-8")
        script = f"""
import vm from "node:vm";
import assert from "node:assert/strict";
const context = {{ window: {{}}, URLSearchParams }};
vm.createContext(context);
vm.runInContext({json.dumps(util_source)}, context, {{ filename: "util.js" }});
const U = context.window.Game.Util;
const fallback = Symbol("fallback");

assert.equal(JSON.stringify(U.parseJsonObject('{{"ok":true}}', fallback)), '{{"ok":true}}');
assert.equal(JSON.stringify(U.parseJson('[1,2]', fallback)), '[1,2]');
for (const raw of [null, undefined, "", " ", "{{", "null", "1", '"x"', "true", "[]"]) {{
  assert.equal(U.parseJsonObject(raw, fallback), fallback);
}}

const finiteCases = [
  [0, 0], [12, 12], [-3, -3], ["0", 0], ["12", 12], ["-3", -3],
  ["1.5", 1.5], [".5", 0.5], ["1.", 1], ["1e3", 1000]
];
for (const [raw, expected] of finiteCases) assert.equal(U.parseFiniteNumber(raw, fallback), expected);
for (const raw of ["", " ", "NaN", "Infinity", "-Infinity", "garbage", NaN, Infinity, -Infinity, null, undefined]) {{
  assert.equal(U.parseFiniteNumber(raw, fallback), fallback);
}}
assert.equal(U.parseInteger("0", fallback), 0);
assert.equal(U.parseInteger("-2", fallback), -2);
assert.equal(U.parseInteger("1.5", fallback), fallback);
assert.equal(U.parseInteger(1.5, fallback), fallback);

assert.equal(U.parseSearchFlag("?dev=1", "dev", ["1"]), true);
assert.equal(U.parseSearchFlag("?dev=0", "dev", ["1"]), false);
assert.equal(U.parseSearchFlag("?nodev=1", "dev", ["1"]), false);
assert.equal(U.parseSearchFlag("", "dev", ["1"]), false);
assert.equal(U.parseSearchFlag("?logSink=true", "logSink", ["1", "true"]), true);
for (const [raw, expected] of [["true", true], ["false", false], ["1", true], ["0", false], ["unknown", false], ["", false]]) {{
  assert.equal(U.parseSearchFlag(`?flag=${{raw}}`, "flag"), expected);
}}

for (const raw of ["0", "+1", "-1", "1.5", ".5", "1.", "1e3"]) {{
  assert.equal(U.parseFiniteNumber(raw, fallback), Number(raw));
}}
for (const search of ["?dev=1", "?dev=0", "?dev=", "?other=1"]) {{
  const oldResult = new URLSearchParams(search).get("dev") === "1";
  assert.equal(U.parseSearchFlag(search, "dev", ["1"]), oldResult);
}}
"""
        run_node(script)

    def test_startup_session_storage_rejects_wrong_json_shapes(self) -> None:
        util_source = (SOURCE / "util.js").read_text(encoding="utf-8")
        profile_source = (SOURCE / "ui" / "ui-profile-visual-tone-repair.js").read_text(encoding="utf-8")
        function = extract_named_function(profile_source, "startupNameSessionState")
        script = f"""
import vm from "node:vm";
import assert from "node:assert/strict";
const context = {{ window: {{}}, URLSearchParams }};
vm.createContext(context);
vm.runInContext({json.dumps(util_source)}, context, {{ filename: "util.js" }});
const Util = context.window.Game.Util;
const STARTUP_NAME_STORAGE_KEY = "stage7_startup_stat_name_toasts_v5";
let raw = null;
const window = {{ sessionStorage: {{ getItem: () => raw }} }};
{function}

const empty = {{ repDismissed: false, pointsDismissed: false, completed: false }};
for (const value of [null, "", " ", "{{", "null", "[]", "1", '"x"', "true"]) {{
  raw = value;
  assert.deepEqual(startupNameSessionState(), empty);
}}
raw = "completed";
assert.deepEqual(startupNameSessionState(), {{ repDismissed: true, pointsDismissed: true, completed: true }});
raw = '{{"repDismissed":true,"pointsDismissed":false,"completed":false}}';
assert.deepEqual(startupNameSessionState(), {{ repDismissed: true, pointsDismissed: false, completed: false }});
raw = '{{"repDismissed":"true","pointsDismissed":1,"completed":0,"stale":"field"}}';
assert.deepEqual(startupNameSessionState(), empty);
"""
        run_node(script)


if __name__ == "__main__":
    unittest.main()
