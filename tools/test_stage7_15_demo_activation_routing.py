#!/usr/bin/env python3
from pathlib import Path
import subprocess
import textwrap


ROOT = Path(__file__).resolve().parents[1]
WEB_BOOT = ROOT / "AsyncScene/Web/ui/ui-boot.js"
DOCS_BOOT = ROOT / "docs/ui/ui-boot.js"
STAGE715 = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js"
STAGE715_DOCS = ROOT / "docs/ui/ui-stage7-first-experience.js"


def require(condition, message):
    if not condition:
        raise AssertionError(message)


for path in (WEB_BOOT, DOCS_BOOT):
    subprocess.run(["node", "--check", str(path)], cwd=ROOT, check=True)

boot = WEB_BOOT.read_text(encoding="utf-8")
docs_boot = DOCS_BOOT.read_text(encoding="utf-8")
stage715 = STAGE715.read_text(encoding="utf-8")
stage715_docs = STAGE715_DOCS.read_text(encoding="utf-8")
fresh = boot[boot.index("// Stage 7.15 demo is the public fresh-start entry"):]
resume = boot[boot.index("if (resumeMode"):boot.index("if (S.flags.started")]
docs_fresh = docs_boot[docs_boot.index("// Stage 7.15 demo is the public fresh-start entry"):]
helper_start = boot.index("  function claimStage715FreshStart")
helper_end = boot.index("\n\n  function startGame", helper_start)
fresh_route_start = boot.index("const STAGE715_DEMO_FRESH_START_ENABLED")
fresh_route_end = boot.index("// Welcome", fresh_route_start)
fresh_route = boot[fresh_route_start:fresh_route_end]

require("const STAGE715_DEMO_FRESH_START_ENABLED = true;" in fresh, "fresh-start rollout switch missing")
require("S.flags.stage715Demo = true;" in fresh, "fresh-start activation flag missing")
require(fresh.index("S.flags.stage715Demo = true;") < fresh.index("claimStage715FreshStart(G, UI, S, name, startNormalWorld)"), "activation must precede fresh routing")
require("claimStage715Resume(G, UI, S, name, startNormalWorld)" in resume, "resume must claim the canonical Stage 7.15 corridor first")
require("flags.stage715Demo = true;" in boot[boot.index("  function claimStage715Resume"):helper_end], "resume activation must restore the existing activation flag")
require("stage715FirstIndependentBattleComplete === true" in resume, "resume must preserve Stage 7.15 completion semantics")
require("S.flags.stage715Demo = true;" in docs_fresh, "docs fresh-start activation flag missing")
require("queryEnabled()" in stage715 and "DEMO_QUERY = \"stage715demo\"" in stage715, "query activation behavior must remain available")
require(stage715 == stage715_docs, "Stage 7.15 controller mirror differs")
require("firstExperience.claimResume" in boot, "legacy resume fallback must remain")
require("Stage7FirstExperience.claimFreshStart" not in fresh_route, "legacy fresh PRELUDE fallback must be absent")
require("firstExperience.claimFreshStart" not in fresh_route, "legacy fresh PRELUDE fallback must be absent")

docs_helper_start = docs_boot.index("  function claimStage715FreshStart")
docs_helper_end = docs_boot.index("\n\n  function startGame", docs_helper_start)
require(boot[helper_start:helper_end] == docs_boot[docs_helper_start:docs_helper_end], "routing helper mirror differs")
baseline_boot = subprocess.check_output(
    ["git", "show", "origin/main:AsyncScene/Web/ui/ui-boot.js"], cwd=ROOT, text=True
)
baseline_resume = baseline_boot[baseline_boot.index("if (resumeMode"):baseline_boot.index("if (S.flags.started")]
require(resume != baseline_resume, "resume routing was not repaired")

run_start = boot[boot.index("  function startGame(UI)"):boot.index("\n\n  function installOnboardingDevHooks", boot.index("  function startGame(UI)"))]
run_start_handler = boot[boot.index("    const runStart = (source, e) =>"):boot.index("\n\n    // Bind only direct button handlers", boot.index("    const runStart = (source, e) =>"))]
require("persistFirstUiProfileSelection(UI, uiProfile);" not in run_start_handler, "start handler persists profile before classification")
require(run_start.index("const resumeMode = getOnboardingSeen(UI);") < run_start.index("if (resumeMode"), "resume mode must be classified before routing")
require(run_start.index("if (resumeMode") < run_start.index("persistFirstUiProfileSelection(UI, uiProfile);"), "resume persistence must follow classification")
require("onboardingSeen: false" in run_start, "fresh reset must keep onboardingSeen false before routing")
require(run_start.index("claimStage715FreshStart(G, UI, S, name, startNormalWorld)") < run_start.index("persistFirstUiProfileSelection(UI, uiProfile);", run_start.index("claimStage715FreshStart(G, UI, S, name, startNormalWorld)")), "fresh persistence must follow routing")

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

start_source = run_start
start_runtime_harness = textwrap.dedent(f"""
  const events = [];
  function markBootDiag() {{}}
  function getStartName() {{ return "Test"; }}
  function getAuthorizedStateTargets(UI) {{ return [UI.S]; }}
  function getOnboardingSeen(UI) {{ return UI.S.progress.onboardingSeen === true; }}
  function setOnboardingSeen(UI, value) {{ UI.S.progress.onboardingSeen = value === true; events.push("setOnboardingSeen:" + value); }}
  function applyUiProfileBeforeEnter() {{ return "zoomer"; }}
  function readUiProfileResolverValue() {{ return "zoomer"; }}
  function persistFirstUiProfileSelection(UI) {{ events.push("persist:" + UI.S.progress.onboardingSeen); UI.S.progress.onboardingSeen = true; }}
  function ensureStartScreenHidden() {{}}
  function claimStage715FreshStart(G, UI, S, name, startNormalWorld) {{
    const demo = G.Stage715Demo;
    if (demo && demo.isActive({{ UI, state: S }}) && typeof demo.claimFreshStart === "function") {{
      const claim = demo.claimFreshStart({{ UI, state: S, playerName: name, startNormalWorld }});
      return !!(claim && claim.claimed === true);
    }}
    return false;
  }}
  const window = {{ Game: {{ Data: {{ START_POINTS_PLAYER: 0 }}, Stage715Demo: {{}}, Stage7FirstExperience: {{}} }} }};
  const document = {{ getElementById: () => ({{ textContent: "", style: {{}} }}) }};
  function makeUI(onboardingSeen) {{
    const S = {{ flags: {{}}, progress: {{ onboardingSeen }}, me: {{}}, players: {{}} }};
    return {{ S, $: () => ({{ textContent: "", style: {{}} }}), buildPlayers() {{}}, renderAll() {{}}, startLoops() {{}}, applyMobilePanelDefaults() {{}}, closeDM() {{}}, pushSystem() {{}}, pushChat() {{}} }};
  }}
  {helper_source}
  {start_source}

  let UI = makeUI(false);
  window.Game.Stage715Demo = {{
    isActive: () => true,
    claimFreshStart: () => {{
      events.push("demo.claimFreshStart:" + UI.S.progress.onboardingSeen);
      return {{ claimed: true }};
    }}
  }};
  window.Game.Stage7FirstExperience = {{ claimResume: () => {{ events.push("legacy.claimResume"); return {{ claimed: true }}; }} }};
  startGame(UI);
  if (events.indexOf("demo.claimFreshStart:false") < 0) throw new Error("fresh demo did not see onboardingSeen=false: " + events.join(","));
  if (events.indexOf("legacy.claimResume") >= 0) throw new Error("fresh path called legacy resume: " + events.join(","));
  if (UI.S.progress.onboardingSeen !== true) throw new Error("fresh profile was not persisted after routing");

  events.length = 0;
  UI = makeUI(true);
  window.Game.Stage715Demo = {{
    isActive: () => false,
    claimResume: () => {{ events.push("demo.claimResume:" + UI.S.flags.stage715Demo); return {{ claimed: true }}; }}
  }};
  window.Game.Stage7FirstExperience = {{ claimResume: () => {{ events.push("legacy.claimResume:" + UI.S.progress.onboardingSeen); return {{ claimed: true }}; }} }};
  startGame(UI);
  if (events.join(",") !== "persist:true,demo.claimResume:true") throw new Error("unfinished resume did not claim Stage 7.15: " + events.join(","));
  if (UI.S.flags.stage715Demo !== true) throw new Error("unfinished resume did not restore the Stage 7.15 activation flag");

  events.length = 0;
  UI = makeUI(true);
  UI.S.flags.stage715Demo = true;
  window.Game.Stage715Demo = {{
    isActive: () => true,
    claimResume: () => {{ events.push("demo.claimResume.active"); return {{ claimed: true }}; }}
  }};
  window.Game.Stage7FirstExperience = {{ claimResume: () => {{ events.push("legacy.claimResume"); return {{ claimed: true }}; }} }};
  startGame(UI);
  if (events.join(",") !== "persist:true,demo.claimResume.active") throw new Error("active Stage 7.15 was not resumed exactly once: " + events.join(","));

  events.length = 0;
  UI = makeUI(true);
  UI.S.flags.stage715FirstIndependentBattleComplete = true;
  window.Game.Stage715Demo = {{
    isActive: () => true,
    claimResume: () => {{ events.push("demo.claimResume.completed"); return {{ claimed: true }}; }}
  }};
  window.Game.Stage7FirstExperience = {{ claimResume: () => {{ events.push("legacy.claimResume.completed"); return {{ claimed: true }}; }} }};
  startGame(UI);
  if (events.join(",") !== "persist:true") throw new Error("completed Stage 7.15 restarted or fell into legacy onboarding: " + events.join(","));

  events.length = 0;
  UI = makeUI(true);
  window.Game.Stage715Demo = {{ isActive: () => false }};
  window.Game.Stage7FirstExperience = {{ claimResume: () => {{ events.push("legacy.claimResume:" + UI.S.progress.onboardingSeen); return {{ claimed: true }}; }} }};
  startGame(UI);
  if (events.join(",") !== "persist:true,legacy.claimResume:true") throw new Error("legitimate legacy resume fallback changed: " + events.join(","));
  console.log("PASS_STAGE7_15_START_CLASSIFICATION");
""")

subprocess.run(["node", "-e", start_runtime_harness], cwd=ROOT, check=True)

changed = set(subprocess.check_output(
    ["git", "diff", "--name-only", "HEAD"], cwd=ROOT, text=True
).splitlines())
changed = {path for path in changed if not path.startswith((".playwright-cli/", "output/playwright/"))}
allowed = {
    "AsyncScene/Web/ui/ui-boot.js",
    "docs/ui/ui-boot.js",
    "tools/test_stage7_15_demo_activation_routing.py",
}
require(changed <= allowed, f"scope widened: {sorted(changed - allowed)}")

print("PASS_STAGE7_15_DEMO_ACTIVATION_ROUTING")
