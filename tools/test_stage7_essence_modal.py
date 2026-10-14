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
CSS_RESOURCE_VERSION = "start_essence_human_copy_20261014a"
JS_RESOURCE_VERSION = "start_essence_human_copy_20261014b"
CSS_TAG = f'<link rel="stylesheet" href="ui/ui-stage7-essence.css?v={CSS_RESOURCE_VERSION}" />'
JS_TAG = f'<script defer src="ui/ui-stage7-essence.js?v={JS_RESOURCE_VERSION}"></script>'
BOOT_TAG = f'<script defer src="ui/ui-boot.js?v={JS_RESOURCE_VERSION}"></script>'
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
BOOMER_BLOCKS = (
    {
        "heading": "Здесь всё крутится вокруг людей.",
        "body": "Знакомства, ссоры, поддержка, конфликты. Вы решаете, в какие истории вмешиваться и как себя вести."
    },
    {
        "heading": "У каждого поступка есть последствия.",
        "body": "Помогли одному - нажили врага в другом. Не всегда получится угадать, чем закончится разговор."
    },
    {
        "heading": "Играйте в своём ритме.",
        "body": "Не нужно собираться всем одновременно. Заходите, когда удобно."
    },
)
ALPHA_BLOCKS = (
    {"heading": "всё начинается с людей", "body": "знакомства, ссоры, поддержка, конфликты. выбирай, куда вмешаться и как себя вести."},
    {"heading": "у поступков есть последствия", "body": "помог одному - нажил врага среди других. итог разговора не всегда угадаешь."},
    {"heading": "играй когда удобно", "body": "заходи, когда удобно. всем быть онлайн сразу не нужно."},
)
START_COPY = {
    "boomer": ("Здесь легко оказаться в центре чужого конфликта.", "Кому верить, кого поддержать и как ответить - решать вам."),
    "genX": ("Здесь легко оказаться в центре чужого конфликта.", "Кому верить, кого поддержать и как ответить - решать тебе."),
    "millennial": ("Здесь легко оказаться в центре чужого конфликта.", "Кому верить, кого поддержать и как ответить - решать тебе."),
    "zoomer": ("Здесь легко оказаться в центре чужого конфликта.", "Кому верить, кого поддержать и как ответить - решать тебе."),
    "alpha": ("Легко попасть в чужой конфликт.", "Кого поддержать и что ответить - решать тебе."),
}


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def _profile_object(source: str, profile: str) -> str:
    if "const START_PROFILE_OVERRIDES = Object.freeze({" in source or "Data.START_SCREEN_PROFILE_TEXTS = Object.freeze({" in source:
        marker = "const START_PROFILE_OVERRIDES = Object.freeze({" if "const START_PROFILE_OVERRIDES = Object.freeze({" in source else "Data.START_SCREEN_PROFILE_TEXTS = Object.freeze({"
        root = source.index(marker)
        start = source.index(f"    {profile}: Object.freeze({{", root)
        end = source.index("\n    }),", start) + len("\n    }),")
        return source[start:end]
    root = source.index("function resolveStartScreenText")
    start = source.index(f"    const {profile} = {{", root)
    following = [
        source.find(f"    const {name} = {{", start + 1)
        for name in ("millennial", "boomer", "genX", "zoomer", "alpha")
    ]
    following = [position for position in following if position >= 0]
    end = min(following) if following else source.index("    const tables =", start)
    return source[start:end]


def _profile_value(block: str, key: str) -> str:
    match = re.search(rf'\b{re.escape(key)}:\s*"([^"]*)"', block)
    assert match, f"missing literal profile field {key}"
    return match.group(1)


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
const rows = {};
for (const profile of profiles) {
  Game.Data = { UI_PROFILE: profile, getUiProfile() { return this.UI_PROFILE; } };
  rows[profile] = Game.UI.getStage7EssenceCopy(Game.Data.getUiProfile());
}
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

    expected_blocks = {
        "boomer": list(BOOMER_BLOCKS),
        "genX": list(BLOCKS),
        "millennial": list(BLOCKS),
        "zoomer": list(BLOCKS),
        "alpha": list(ALPHA_BLOCKS),
    }
    modal_copy = {}
    for profile in PROFILES:
        row = rows[profile]
        assert row["profile"] == profile
        assert row["title"] == TITLE, (profile, row)
        assert row["blocks"] == expected_blocks[profile], (profile, row["blocks"])
        assert len(row["blocks"]) == 3, (profile, row["blocks"])
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
        modal_copy[profile] = full

    boomer_modal = " ".join(part for block in rows["boomer"]["blocks"] for part in block.values())
    assert "Вы решаете" in boomer_modal
    assert "Помогли одному - нажили врага в другом." in boomer_modal
    assert "Заходите, когда удобно." in boomer_modal
    assert not re.search(r"\b(?:ты|тебе|тебя|твой|твоя|твои|заходи)\b", boomer_modal, re.IGNORECASE), boomer_modal
    assert not re.search(r"\bиграй\b", boomer_modal, re.IGNORECASE), boomer_modal

    alpha_modal = " ".join(part for block in rows["alpha"]["blocks"] for part in block.values())
    assert alpha_modal == alpha_modal.lower(), alpha_modal
    assert len(alpha_modal) < len(boomer_modal), "Alpha modal must be shorter than Boomer"
    assert len(rows["alpha"]["blocks"]) == 3
    assert all(rows["alpha"]["blocks"][i]["heading"] and rows["alpha"]["blocks"][i]["body"] for i in range(3))
    assert rows["genX"]["blocks"] == rows["millennial"]["blocks"] == rows["zoomer"]["blocks"] == list(BLOCKS)
    assert all(rows[p]["title"] == TITLE and rows[p]["close"] == "Вернуться" for p in PROFILES)

    start_sources = (
        SOURCE / "system.js",
        SOURCE / "data.js",
        SOURCE / "ui" / "ui-boot.js",
        SOURCE / "ui" / "ui-profile-visual-tone-repair.js",
    )
    start_text = "\n".join(read(path) for path in start_sources)
    for phrase in ("Что за игра?", "Продолжить игру", "Легко попасть в чужой конфликт.", "решать вам."):
        assert phrase in start_text, f"missing start-screen copy or resume wording: {phrase}"
    for phrase in (
        "Асинхронная онлайн-игра", "Не нужно совпадать по расписанию",
        "Не надо ждать всех онлайн", "Не надо ждать остальных онлайн",
    ):
        assert phrase not in start_text, f"old start-screen pitch remains in an active text layer: {phrase}"

    data = read(SOURCE / "data.js")
    assert "Data.START_SCREEN_TEXT_MAX_LENGTH = 96;" in data
    assert '"btnRules"' in start_block and '"startBirthYearPicker"' in start_block

    start_harness = r'''
const fs = require("fs");
const vm = require("vm");
global.window = global;
global.Game = {};
const log = console.log;
console.log = () => {};
vm.runInThisContext(fs.readFileSync(process.argv[2], "utf8"), { filename: process.argv[2] });
vm.runInThisContext(fs.readFileSync(process.argv[3], "utf8"), { filename: process.argv[3] });
console.log = log;
const data = Game.Data;
const profiles = ["boomer", "genX", "millennial", "zoomer", "alpha"];
const rows = {};
for (const profile of profiles) {
  data.setUiProfile(profile);
  rows[profile] = {
    profile: data.getUiProfile(),
    title: data.resolveStartScreenText("start_title"),
    intro: [data.resolveStartScreenText("async_value"), data.resolveStartScreenText("no_simultaneous_required")],
    start: data.resolveStartScreenText("start_start"),
    startAction: data.resolveStartScreenText("start_action"),
    rules: data.resolveStartScreenText("rules_action"),
    resume: data.resolveStartScreenText("start_continue"),
  };
}
process.stdout.write(JSON.stringify(rows));
process.exit(0);
'''
    with tempfile.TemporaryDirectory() as directory:
        harness_path = Path(directory) / "start-harness.js"
        harness_path.write_text(start_harness, encoding="utf-8")
        completed = subprocess.run(
            ["node", str(harness_path), str(SOURCE / "system.js"), str(SOURCE / "data.js")],
            check=True,
            capture_output=True,
            text=True,
        )
    start_rows = json.loads(completed.stdout)
    for profile in PROFILES:
        row = start_rows[profile]
        assert row["profile"] == profile, row
        assert row["title"] == "Асинхрония", (profile, row)
        assert tuple(row["intro"]) == START_COPY[profile], (profile, row)
        assert row["start"] == row["startAction"] == "Начать", (profile, row)
        assert row["rules"] == "Что за игра?", (profile, row)
        assert row["resume"] == "Продолжить игру", (profile, row)
    assert not re.search(r"\b(?:ты|тебе|тебя|твой|твоя|твои|заходи)\b", " ".join(start_rows["boomer"]["intro"]), re.IGNORECASE)
    assert start_rows["alpha"]["intro"][0] == "Легко попасть в чужой конфликт."
    assert len(" ".join(start_rows["alpha"]["intro"])) < len(" ".join(start_rows["boomer"]["intro"]))

    boot = read(SOURCE / "ui" / "ui-boot.js")
    tone = read(SOURCE / "ui" / "ui-profile-visual-tone-repair.js")
    for source_name, source_text in (("ui-boot", boot), ("profile tone", tone)):
        assert "решать вам." in source_text, f"{source_name} fallback misses Boomer formality"
        assert "Легко попасть в чужой конфликт." in source_text, f"{source_name} fallback misses Alpha intro"
        assert "Кого поддержать и что ответить - решать тебе." in source_text, f"{source_name} fallback misses Alpha stake"
    assert 'startProfiles.alpha.async_value === "Легко попасть в чужой конфликт."' in tone
    assert 'startProfiles.alpha.no_simultaneous_required === "Кого поддержать и что ответить - решать тебе."' in tone
    assert 'startProfiles.alpha.async_value === "Здесь легко оказаться в центре чужого конфликта."' not in tone
    assert "Кому верить, кого поддержать и как ответить - решать тебе." not in _profile_object(boot, "alpha")
    assert "Кому верить, кого поддержать и как ответить - решать тебе." not in _profile_object(tone, "alpha")
    assert not re.search(r"\b(?:ты|тебе|тебя|твой|твоя|твои|заходи)\b", _profile_object(boot, "boomer"), re.IGNORECASE)
    assert not re.search(r"\b(?:ты|тебе|тебя|твой|твоя|твои|заходи)\b", _profile_object(tone, "boomer"), re.IGNORECASE)

    for profile in PROFILES:
        expected_intro = START_COPY[profile]
        data_block = _profile_object(data, profile)
        tone_block = _profile_object(tone, profile)
        boot_block = _profile_object(boot, profile)
        for source_name, block in (("data", data_block), ("profile tone", tone_block), ("ui-boot", boot_block)):
            title_key = "title" if source_name == "profile tone" else "start_title"
            assert _profile_value(block, title_key) == "Асинхрония", (source_name, profile, block)
            assert _profile_value(block, "async_value") == expected_intro[0], (source_name, profile, block)
            assert _profile_value(block, "no_simultaneous_required") == expected_intro[1], (source_name, profile, block)
            assert _profile_value(block, "start_start") == "Начать", (source_name, profile, block)
            assert _profile_value(block, "start_continue") == "Продолжить игру", (source_name, profile, block)
            if source_name != "data":
                assert _profile_value(block, "rules_action") == "Что за игра?", (source_name, profile, block)

    for relative in ("system.js", "data.js", "ui/ui-profile-visual-tone-repair.js"):
        assert (SOURCE / relative).read_bytes() == (DEPLOYED / relative).read_bytes(), (
            f"source/docs mirror differs: {relative}"
        )
    for root in (SOURCE, DEPLOYED):
        boot = read(root / "ui" / "ui-boot.js")
        for phrase in ("решать вам.", "Легко попасть в чужой конфликт.", "Кого поддержать и что ответить - решать тебе."):
            assert phrase in boot, f"profile start copy missing from {root}: {phrase}"
        assert "Кому верить, кого поддержать и как ответить - решать тебе." not in _profile_object(boot, "alpha")
        assert not re.search(r"\b(?:ты|тебе|тебя|твой|твоя|твои|заходи)\b", _profile_object(boot, "boomer"), re.IGNORECASE)
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
