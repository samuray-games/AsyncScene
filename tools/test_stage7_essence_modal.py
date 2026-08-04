#!/usr/bin/env python3
"""Focused regression for the Stage 7 profile-adapted essence modal."""

from __future__ import annotations

import hashlib
import json
import re
import subprocess
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "AsyncScene" / "Web"
DEPLOYED = ROOT / "docs"
PROJECT = ROOT / "AsyncScene" / "AsyncScene.xcodeproj" / "project.pbxproj"

PROFILES = ("boomer", "genX", "millennial", "zoomer", "alpha")
START_BLOCK_SHA256 = "4a1698e9112486e3895196682e9dfd7a174238d914f48bec0db026011841be22"
CSS_TAG = '<link rel="stylesheet" href="ui/ui-stage7-essence.css?v=stage7_essence_modal_20260805a" />'
JS_TAG = '<script defer src="ui/ui-stage7-essence.js?v=stage7_essence_modal_20260805a"></script>'
BOOT_TAG = '<script defer src="ui/ui-boot.js?v=stage6_step9_five_profile_runtime_repair_20260727a"></script>'


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def extract_start_block(index: str) -> str:
    start = index.index('  <div id="startScreen">')
    end = index.index('\n\n  <script defer src="util.js', start)
    return index[start:end]


def run_copy_harness(script: Path) -> dict[str, object]:
    harness = r'''
const fs = require("fs");
const vm = require("vm");

global.window = global;
global.Game = { UI: {} };
const source = fs.readFileSync(process.argv[2], "utf8");
vm.runInThisContext(source, { filename: process.argv[2] });

const profiles = Game.UI.getStage7EssenceProfiles();
const rows = Object.fromEntries(profiles.map((profile) => [
  profile,
  Game.UI.getStage7EssenceCopy(profile)
]));
console.log(JSON.stringify({ profiles, rows }));
'''
    with tempfile.TemporaryDirectory() as directory:
        harness_path = Path(directory) / "harness.js"
        harness_path.write_text(harness, encoding="utf-8")
        completed = subprocess.run(
            ["node", str(harness_path), str(script)],
            check=True,
            capture_output=True,
            text=True,
        )
    return json.loads(completed.stdout)


def main() -> None:
    source_index = SOURCE / "index.html"
    deployed_index = DEPLOYED / "index.html"
    source_js = SOURCE / "ui" / "ui-stage7-essence.js"
    deployed_js = DEPLOYED / "ui" / "ui-stage7-essence.js"
    source_css = SOURCE / "ui" / "ui-stage7-essence.css"
    deployed_css = DEPLOYED / "ui" / "ui-stage7-essence.css"

    assert source_index.read_bytes() == deployed_index.read_bytes(), "index mirrors differ"
    assert source_js.read_bytes() == deployed_js.read_bytes(), "essence JS mirrors differ"
    assert source_css.read_bytes() == deployed_css.read_bytes(), "essence CSS mirrors differ"

    index = read(source_index)
    assert index.count(CSS_TAG) == 1, "essence stylesheet tag missing or duplicated"
    assert index.count(JS_TAG) == 1, "essence script tag missing or duplicated"
    assert index.count(BOOT_TAG) == 1, "ui-boot tag missing or duplicated"
    assert index.index(CSS_TAG) < index.index("</head>"), "essence CSS must load in head"
    assert index.index(BOOT_TAG) < index.index(JS_TAG), "essence JS must load after ui-boot"

    start_block = extract_start_block(index)
    actual_start_hash = hashlib.sha256(start_block.encode("utf-8")).hexdigest()
    assert actual_start_hash == START_BLOCK_SHA256, (
        "accepted start-screen markup changed: "
        f"{actual_start_hash} != {START_BLOCK_SHA256}"
    )

    js = read(source_js)
    required_js = (
        'const MODAL_ID = "stage7EssenceModal"',
        'Object.freeze(["boomer", "genX", "millennial", "zoomer", "alpha"])',
        'role="dialog"',
        'aria-modal="true"',
        'aria-labelledby="stage7EssenceTitle"',
        'aria-describedby="stage7EssenceLead"',
        'event.key === "Escape"',
        'event.key !== "Tab"',
        'restore.focus({ preventScroll: true })',
        'event.stopImmediatePropagation()',
        'new MutationObserver(() => bindButton())',
        'Game.UI.getStage7EssenceCopy',
        'Game.UI.openStage7Essence',
        'Game.UI.closeStage7Essence',
    )
    missing_js = [token for token in required_js if token not in js]
    assert not missing_js, f"missing essence JS contract: {missing_js}"

    subprocess.run(["node", "--check", str(source_js)], check=True, capture_output=True, text=True)
    payload = run_copy_harness(source_js)
    assert tuple(payload["profiles"]) == PROFILES, payload["profiles"]
    rows = payload["rows"]
    assert set(rows) == set(PROFILES), rows.keys()
    assert len({rows[profile]["title"] for profile in PROFILES}) == 5, "profile titles are not distinct"
    assert len({rows[profile]["lead"] for profile in PROFILES}) == 5, "profile leads are not distinct"

    for profile in PROFILES:
        row = rows[profile]
        assert row["profile"] == profile
        assert len(row["synchronousPoints"]) == 3
        assert len(row["asynchronousPoints"]) == 3
        full = " ".join(
            [
                row["eyebrow"], row["title"], row["lead"],
                row["synchronousLabel"], *row["synchronousPoints"],
                row["asynchronousLabel"], *row["asynchronousPoints"],
                row["closer"], row["close"],
            ]
        )
        forbidden = (
            "Tone Profile", "generation mapping", "internal_id",
            "хуй", "пизд", "говно", "ебат",
        )
        assert not any(term.lower() in full.lower() for term in forbidden), (
            f"forbidden player-facing term in {profile}: {full}"
        )

    boomer_text = " ".join(
        [rows["boomer"]["lead"], *rows["boomer"]["asynchronousPoints"], rows["boomer"]["closer"]]
    ).lower()
    assert "вы " in boomer_text or "вам" in boomer_text, "Boomer copy is not explicitly formal"
    assert not re.search(r"\b(?:ты|тебе|тебя|твой|твоя|твои|заходи)\b", boomer_text), (
        "Boomer copy contains informal second-person wording"
    )

    alpha_text = " ".join(
        [rows["alpha"]["eyebrow"], rows["alpha"]["title"], rows["alpha"]["lead"],
         *rows["alpha"]["synchronousPoints"], *rows["alpha"]["asynchronousPoints"],
         rows["alpha"]["closer"], rows["alpha"]["close"]]
    )
    assert alpha_text == alpha_text.lower(), "Alpha copy must stay direct and lowercase"
    assert len(alpha_text) < len(boomer_text), "Alpha copy is not materially compressed"

    css = read(source_css)
    required_css = (
        ".stage7EssenceModal[hidden]",
        ".stage7EssenceDialog",
        ".stage7EssenceComparison",
        ".stage7EssenceSideSync",
        ".stage7EssenceSideAsync",
        'body[data-ui-profile="boomer"] .stage7EssenceDialog',
        'body[data-ui-profile="genX"] .stage7EssenceDialog',
        'body[data-ui-profile="millennial"] .stage7EssenceDialog',
        'body[data-ui-profile="zoomer"] .stage7EssenceDialog',
        'body[data-ui-profile="alpha"] .stage7EssenceDialog',
        "@media (max-width:680px)",
        "@media (prefers-reduced-motion:reduce)",
        "@media (forced-colors:active)",
    )
    missing_css = [token for token in required_css if token not in css]
    assert not missing_css, f"missing essence CSS contract: {missing_css}"
    assert css.count("{") == css.count("}"), "unbalanced essence CSS braces"

    try:
        import tinycss2  # type: ignore
    except ImportError:
        tinycss2 = None
    if tinycss2 is not None:
        errors = [
            node
            for node in tinycss2.parse_stylesheet(css, skip_comments=False, skip_whitespace=False)
            if getattr(node, "type", "") == "error"
        ]
        assert not errors, f"essence CSS parse errors: {errors}"

    project = read(PROJECT)
    assert "PBXFileSystemSynchronizedRootGroup" in project
    assert "CEF3D28F2EF39D1D002A0BCD /* ui */" in project
    assert "fileSystemSynchronizedGroups = (" in project
    assert "ui-stage7-essence.js" not in project, "ui child should use synchronized-group discovery"
    assert "ui-stage7-essence.css" not in project, "ui child should use synchronized-group discovery"

    print(json.dumps({
        "ok": True,
        "profiles": list(PROFILES),
        "startBlockSha256": actual_start_hash,
        "indexMirror": True,
        "jsMirror": True,
        "cssMirror": True,
        "nodeSyntax": True,
        "xcodeUiSynchronizedGroup": True,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
