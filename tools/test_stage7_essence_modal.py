#!/usr/bin/env python3
"""Regression for the shared, compact Stage 7 game-introduction modal."""

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
RESOURCE_VERSION = "start_essence_human_copy_20261014a"
CSS_TAG = f'<link rel="stylesheet" href="ui/ui-stage7-essence.css?v={RESOURCE_VERSION}" />'
JS_TAG = f'<script defer src="ui/ui-stage7-essence.js?v={RESOURCE_VERSION}"></script>'
BOOT_TAG = f'<script defer src="ui/ui-boot.js?v={RESOURCE_VERSION}"></script>'
TITLE = "Что за игра?"
BLOCKS = (
    {
        "heading": "Здесь всё крутится вокруг людей.",
        "body": "Знакомства, ссоры, поддержка, конфликты. Ты решаешь, в какие истории вмешиваться и как себя вести."
    },
    {
        "heading": "У каждого поступка есть последствия.",
        "body": "Помог одному - нажил врага в другом. Не всегда получится угадать, чем закончится разговор."
    },
    {
        "heading": "Играй в своём ритме.",
        "body": "Не нужно собираться всем одновременно. Заходи, когда удобно."
    },
)


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
const rows = Object.fromEntries(profiles.map((profile) => [profile, Game.UI.getStage7EssenceCopy(profile)]));
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
    for tag in (CSS_TAG, JS_TAG, BOOT_TAG):
        assert index.count(tag) == 1, f"resource tag missing or duplicated: {tag}"
    assert index.index(CSS_TAG) < index.index("</head>"), "essence CSS must load in head"
    assert index.index(BOOT_TAG) < index.index(JS_TAG), "essence JS must load after ui-boot"

    start_block = extract_start_block(index)
    actual_start_hash = hashlib.sha256(start_block.encode("utf-8")).hexdigest()
    assert actual_start_hash == START_BLOCK_SHA256, (
        "existing start-screen controls or fields changed: "
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
        'body.id = "stage7EssenceLead"',
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

    for profile in PROFILES:
        row = rows[profile]
        assert row["profile"] == profile
        assert row["title"] == TITLE, (profile, row)
        assert row["blocks"] == list(BLOCKS), (profile, row["blocks"])
        assert row["close"] == "Вернуться", (profile, row["close"])
        full = " ".join([row["title"], *(part for block in row["blocks"] for part in block.values()), row["close"]])
        forbidden = (
            "Asynchronia", "asynchronia", "мультиплеер", "социальная стратегия",
            "синхронный онлайн", "обычный онлайн", "привязки к чужому расписанию",
            "автономные NPC", "долговременные союзы", "социальная память",
        )
        assert not any(term.casefold() in full.casefold() for term in forbidden), (
            f"unsupported or retired player-facing wording in {profile}: {full}"
        )

    start_sources = (
        SOURCE / "system.js",
        SOURCE / "data.js",
        SOURCE / "ui" / "ui-boot.js",
        SOURCE / "ui" / "ui-profile-visual-tone-repair.js",
    )
    start_text = "\n".join(read(path) for path in start_sources)
    expected_start_copy = (
        "Здесь легко оказаться в центре чужого конфликта.",
        "Кому верить, кого поддержать и как ответить - решать тебе.",
        "Что за игра?",
        "Продолжить игру",
    )
    for phrase in expected_start_copy:
        assert phrase in start_text, f"missing start-screen copy or resume wording: {phrase}"
    for phrase in (
        "Асинхронная онлайн-игра", "Не нужно совпадать по расписанию",
        "Не надо ждать всех онлайн", "Не надо ждать остальных онлайн",
    ):
        assert phrase not in start_text, f"old start-screen pitch remains in an active text layer: {phrase}"

    data = read(SOURCE / "data.js")
    assert "Data.START_SCREEN_TEXT_MAX_LENGTH = 96;" in data
    assert '"btnRules"' in start_block and '"startBirthYearPicker"' in start_block

    for relative in ("system.js", "data.js", "ui/ui-profile-visual-tone-repair.js"):
        assert (SOURCE / relative).read_bytes() == (DEPLOYED / relative).read_bytes(), (
            f"source/docs mirror differs: {relative}"
        )
    for root in (SOURCE, DEPLOYED):
        boot = read(root / "ui" / "ui-boot.js")
        for phrase in expected_start_copy[:3]:
            assert phrase in boot, f"start copy missing from {root}: {phrase}"
        for phrase in ("Асинхронная онлайн-игра", "Не нужно совпадать по расписанию"):
            assert phrase not in boot, f"old start pitch remains in {root}: {phrase}"

    css = read(source_css)
    required_css = (
        ".stage7EssenceModal[hidden]",
        ".stage7EssenceDialog",
        ".stage7EssenceComparison",
        ".stage7EssenceBlockText",
        'body[data-ui-profile="boomer"] .stage7EssenceDialog',
        'body[data-ui-profile="genX"] .stage7EssenceDialog',
        'body[data-ui-profile="millennial"] .stage7EssenceDialog',
        'body[data-ui-profile="zoomer"] .stage7EssenceDialog',
        'body[data-ui-profile="alpha"] .stage7EssenceDialog',
        "@media (max-width:680px)",
        "@media (max-height:520px)",
        "@media (prefers-reduced-motion:reduce)",
        "@media (forced-colors:active)",
    )
    missing_css = [token for token in required_css if token not in css]
    assert not missing_css, f"missing essence CSS contract: {missing_css}"
    assert ".stage7EssenceSideSync" not in css and ".stage7EssenceSideAsync" not in css
    assert css.count("{") == css.count("}"), "unbalanced essence CSS braces"
    assert "overflow-wrap:anywhere" in css, "long copy may overflow narrow screens"

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
        "modalTitle": TITLE,
        "meaningBlocks": len(BLOCKS),
        "startBlockSha256": actual_start_hash,
        "indexMirror": True,
        "jsMirror": True,
        "cssMirror": True,
        "nodeSyntax": True,
        "xcodeUiSynchronizedGroup": True,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
