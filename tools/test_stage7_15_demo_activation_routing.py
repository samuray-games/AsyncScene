#!/usr/bin/env python3
from pathlib import Path
import subprocess
import textwrap


ROOT = Path(__file__).resolve().parents[1]
WEB_BOOT = ROOT / "AsyncScene/Web/ui/ui-boot.js"
DOCS_BOOT = ROOT / "docs/ui/ui-boot.js"


def require(condition, message):
    if not condition:
        raise AssertionError(message)


for path in (WEB_BOOT, DOCS_BOOT):
    subprocess.run(["node", "--check", str(path)], cwd=ROOT, check=True)

boot = WEB_BOOT.read_text(encoding="utf-8")
docs_boot = DOCS_BOOT.read_text(encoding="utf-8")
fresh = boot[boot.index("// Stage 7.15 demo is the public fresh-start entry"):]
resume = boot[boot.index("if (resumeMode"):boot.index("if (S.flags.started")]
docs_fresh = docs_boot[docs_boot.index("// Stage 7.15 demo is the public fresh-start entry"):]
helper_start = boot.index("  function claimStage715FreshStart")
helper_end = boot.index("\n\n  function startGame", helper_start)

require("const STAGE715_DEMO_FRESH_START_ENABLED = true;" in fresh, "fresh-start rollout switch missing")
require("S.flags.stage715Demo = true;" in fresh, "fresh-start activation flag missing")
require(fresh.index("S.flags.stage715Demo = true;") < fresh.index("claimStage715FreshStart(G, UI, S, name, startNormalWorld)"), "activation must precede fresh routing")
require("S.flags.stage715Demo = true;" not in resume, "resume must not implicitly activate demo")
require("S.flags.stage715Demo = true;" in docs_fresh, "docs fresh-start activation flag missing")
require("firstExperience.claimResume" in boot, "legacy resume fallback must remain")

docs_helper_start = docs_boot.index("  function claimStage715FreshStart")
docs_helper_end = docs_boot.index("\n\n  function startGame", docs_helper_start)
require(boot[helper_start:helper_end] == docs_boot[docs_helper_start:docs_helper_end], "routing helper mirror differs")
baseline_boot = subprocess.check_output(
    ["git", "show", "origin/main:AsyncScene/Web/ui/ui-boot.js"], cwd=ROOT, text=True
)
baseline_resume = baseline_boot[baseline_boot.index("if (resumeMode"):baseline_boot.index("if (S.flags.started")]
require(resume == baseline_resume, "resume routing changed")

helper_source = boot[helper_start:helper_end]

runtime_harness = textwrap.dedent(f"""
  const calls = [];
  const state = {{ flags: {{}}, progress: {{ onboardingSeen: false }}, me: {{}}, players: {{}} }};
  const UI = {{ renderAll() {{}} }};
  const G = {{ Stage715Demo: {{
    isActive: () => true,
    claimFreshStart: () => {{ calls.push("demo.claimFreshStart"); return {{ claimed: true }}; }},
  }}, Stage7FirstExperience: {{
    claimFreshStart: () => {{ calls.push("legacy.claimFreshStart"); return {{ claimed: true }}; }},
  }} }};
  {helper_source}
  claimStage715FreshStart(G, UI, state, "Test", () => {{}});
  if (calls.join(",") !== "demo.claimFreshStart") throw new Error("fresh route called legacy PRELUDE: " + calls.join(","));
  console.log("PASS_RUNTIME_ROUTING");
""")

subprocess.run(["node", "-e", runtime_harness], cwd=ROOT, check=True)

changed = set(subprocess.check_output(
    ["git", "diff", "--name-only", "origin/main"], cwd=ROOT, text=True
).splitlines())
allowed = {
    "AsyncScene/Web/ui/ui-boot.js",
    "docs/ui/ui-boot.js",
    "tools/test_stage7_15_demo_activation_routing.py",
}
require(changed <= allowed, f"scope widened: {sorted(changed - allowed)}")

print("PASS_STAGE7_15_DEMO_ACTIVATION_ROUTING")
