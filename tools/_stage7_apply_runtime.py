#!/usr/bin/env python3
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
SOURCE_INDEX = ROOT / "AsyncScene/Web/index.html"
DOCS_INDEX = ROOT / "docs/index.html"
SOURCE_BOOT = ROOT / "AsyncScene/Web/ui/ui-boot.js"
DOCS_BOOT = ROOT / "docs/ui/ui-boot.js"
SOURCE_JS = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.js"
DOCS_JS = ROOT / "docs/ui/ui-stage7-first-experience.js"
SOURCE_CSS = ROOT / "AsyncScene/Web/ui/ui-stage7-first-experience.css"
DOCS_CSS = ROOT / "docs/ui/ui-stage7-first-experience.css"


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if new in text:
        return text
    if old not in text:
        raise SystemExit(f"missing {label} anchor")
    return text.replace(old, new, 1)


shutil.copyfile(SOURCE_JS, DOCS_JS)
shutil.copyfile(SOURCE_CSS, DOCS_CSS)
shutil.copyfile(SOURCE_BOOT, DOCS_BOOT)

if SOURCE_INDEX.read_bytes() != DOCS_INDEX.read_bytes():
    raise SystemExit("index mirrors differ before patch")

index = SOURCE_INDEX.read_text(encoding="utf-8")
css_anchor = '  <link rel="stylesheet" href="ui/ui-stage7-essence.css?v=stage7_essence_modal_20260805a" />\n'
css_block = css_anchor + '  <link rel="stylesheet" href="ui/ui-stage7-first-experience.css?v=stage7_first_causal_slice_20260805a" />\n'
index = replace_once(index, css_anchor, css_block, "index CSS")

script_anchor = "".join([
    '  <script defer src="ui/ui-loops.js?v=stage6_step9_five_profile_runtime_repair_20260727a"></script>\n',
    '  <script defer src="ui/ui-boot.js?v=stage6_step9_five_profile_runtime_repair_20260727a"></script>\n',
])
script_block = "".join([
    '  <script defer src="ui/ui-loops.js?v=stage6_step9_five_profile_runtime_repair_20260727a"></script>\n',
    '  <script defer src="ui/ui-stage7-first-experience.js?v=stage7_first_causal_slice_20260805a"></script>\n',
    '  <script defer src="ui/ui-boot.js?v=stage6_step9_five_profile_runtime_repair_20260727a"></script>\n',
])
index = replace_once(index, script_anchor, script_block, "index script")
SOURCE_INDEX.write_text(index, encoding="utf-8")
DOCS_INDEX.write_text(index, encoding="utf-8")

boot = SOURCE_BOOT.read_text(encoding="utf-8")
resume_anchor = "\n".join([
    "        if (UI.applyMobilePanelDefaults) UI.applyMobilePanelDefaults();",
    "        if (UI.startLoops) UI.startLoops();",
    "        UI.renderAll && UI.renderAll();",
    "        ensureStartScreenHidden(UI);",
    "        return;",
    "",
])
resume_block = "\n".join([
    "        if (UI.applyMobilePanelDefaults) UI.applyMobilePanelDefaults();",
    "        let normalWorldStarted = false;",
    "        const startNormalWorld = () => {",
    "          if (normalWorldStarted) return;",
    "          normalWorldStarted = true;",
    "          if (UI.startLoops) UI.startLoops();",
    "          UI.renderAll && UI.renderAll();",
    "        };",
    "        const firstExperience = G.Stage7FirstExperience;",
    '        if (firstExperience && typeof firstExperience.claimResume === "function") {',
    "          const claim = firstExperience.claimResume({ UI, state: S, playerName: name, startNormalWorld });",
    "          if (claim && claim.claimed === true) {",
    "            UI.renderAll && UI.renderAll();",
    "            ensureStartScreenHidden(UI);",
    "            return;",
    "          }",
    "        }",
    "        startNormalWorld();",
    "        ensureStartScreenHidden(UI);",
    "        return;",
    "",
])
boot = replace_once(boot, resume_anchor, resume_block, "resume boot")

fresh_anchor = "\n".join([
    "      // Hide start again before rendering so later UI work cannot re-show it.",
    "      ensureStartScreenHidden(UI);",
    "",
    "      // Welcome",
    "",
])
fresh_block = "\n".join([
    "      // Hide start again before rendering so later UI work cannot re-show it.",
    "      ensureStartScreenHidden(UI);",
    "",
    "      let normalWorldStarted = false;",
    "      const startNormalWorld = () => {",
    "        if (normalWorldStarted) return;",
    "        normalWorldStarted = true;",
    "        if (UI.startLoops) UI.startLoops();",
    "        UI.renderAll && UI.renderAll();",
    "      };",
    "      const firstExperience = G.Stage7FirstExperience;",
    '      if (firstExperience && typeof firstExperience.claimFreshStart === "function") {',
    "        const claim = firstExperience.claimFreshStart({ UI, state: S, playerName: name, startNormalWorld });",
    "        if (claim && claim.claimed === true) {",
    "          UI.renderAll && UI.renderAll();",
    "          ensureStartScreenHidden(UI);",
    "          return;",
    "        }",
    "      }",
    "",
    "      // Welcome",
    "",
])
boot = replace_once(boot, fresh_anchor, fresh_block, "fresh boot")
SOURCE_BOOT.write_text(boot, encoding="utf-8")
DOCS_BOOT.write_text(boot, encoding="utf-8")

print("PASS_STAGE7_RUNTIME_PATCH_APPLIED")
