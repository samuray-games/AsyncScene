#!/usr/bin/env python3
from pathlib import Path
import subprocess


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

require("const STAGE715_DEMO_FRESH_START_ENABLED = true;" in fresh, "fresh-start rollout switch missing")
require("S.flags.stage715Demo = true;" in fresh, "fresh-start activation flag missing")
require(fresh.index("S.flags.stage715Demo = true;") < fresh.index("stage715Demo.isActive"), "activation must precede fresh isActive check")
require("S.flags.stage715Demo = true;" not in resume, "resume must not implicitly activate demo")
require("S.flags.stage715Demo = true;" in docs_fresh, "docs fresh-start activation flag missing")
require("firstExperience.claimFreshStart" in boot, "legacy fresh fallback must remain")
require("firstExperience.claimResume" in boot, "legacy resume fallback must remain")

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
