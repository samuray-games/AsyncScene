#!/usr/bin/env python3
"""Static and executable regression for Stage 6.2 five-by-two color modes."""

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
MODES = ("light", "dark")
PREFERENCES = ("system", "light", "dark")

ACCEPTED_STAGE6_1_BLOBS = {
    "style.css": "dcb1c31d565dd48b51d0bfb8538b384686cbcc40",
    "style-base.css": "738398815ed6ca310a5e3dee0dbea2cd24729e89",
    "ui-profile-themes.css": "184b697663e2c2da2443c532bf7488398cf35913",
}

REQUIRED_VARS = (
    "--bg", "--panel", "--panel2", "--panelSolid", "--line", "--text",
    "--muted", "--muted2", "--shadow", "--r", "--surface", "--surfaceSoft",
    "--surfaceHover", "--panelGradTop", "--panelGradTopAlt", "--panelGradBottom",
    "--cardBg", "--sys", "--sysText", "--profile-accent",
    "--profile-accent-soft", "--profile-accent-border", "--profile-accent-text",
    "--profile-focus", "--profile-glow-1", "--profile-glow-2",
    "--profile-glow-3", "--profile-screen-mask", "--profile-header-gradient",
    "--profile-control-radius", "--profile-card-radius",
    "--profile-start-radius", "--profile-accent-shadow",
)
FORBIDDEN_SEMANTIC_VARS = ("--y", "--o", "--rcol", "--ybd", "--obd", "--rbd")

ACCEPTED_VARIANTS = {
    ("boomer", "light"): {
        "--bg": "#f1e6d0", "--panel": "#fff9ec", "--text": "#28231e",
        "--profile-accent": "#7a3030", "--profile-accent-text": "#fff9ec",
        "--profile-control-radius": "8px", "--profile-card-radius": "12px",
        "--profile-start-radius": "16px",
    },
    ("genX", "dark"): {
        "--bg": "#171a1f", "--panel": "#262b32", "--text": "#ece8df",
        "--profile-accent": "#ad472d", "--profile-accent-text": "#fff8ee",
        "--profile-control-radius": "7px", "--profile-card-radius": "8px",
        "--profile-start-radius": "10px",
    },
    ("millennial", "light"): {
        "--bg": "#f6f3f0", "--panel": "#ffffff", "--text": "#292734",
        "--profile-accent": "#645fd8", "--profile-accent-text": "#ffffff",
        "--profile-control-radius": "14px", "--profile-card-radius": "18px",
        "--profile-start-radius": "26px",
    },
    ("zoomer", "dark"): {
        "--bg": "#0e0b16", "--panel": "#1b1628", "--text": "#f7f4ff",
        "--profile-accent": "#8848e0", "--profile-accent-text": "#ffffff",
        "--profile-control-radius": "13px", "--profile-card-radius": "16px",
        "--profile-start-radius": "22px",
    },
    ("alpha", "light"): {
        "--bg": "#eef9ff", "--panel": "#ffffff", "--text": "#17243a",
        "--profile-accent": "#00a7d6", "--profile-accent-text": "#17243a",
        "--profile-control-radius": "18px", "--profile-card-radius": "24px",
        "--profile-start-radius": "32px",
    },
}


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def git_blob_sha1(path: Path) -> str:
    content = path.read_bytes()
    framed = f"blob {len(content)}\0".encode("ascii") + content
    return hashlib.sha1(framed).hexdigest()


def mode_block(css: str, profile: str, mode: str) -> str:
    selector = re.escape(
        f'html[data-ui-color-mode="{mode}"] body[data-ui-profile="{profile}"]'
    )
    match = re.search(rf"{selector}\s*\{{(?P<body>.*?)\n\}}", css, flags=re.S)
    assert match, f"missing color-mode selector: {profile}/{mode}"
    return match.group("body")


def declarations(block: str) -> dict[str, str]:
    return {
        key: value.strip()
        for key, value in re.findall(r"(--[A-Za-z0-9_-]+)\s*:\s*([^;]+);", block)
    }


def relative_luminance(hex_color: str) -> float:
    assert re.fullmatch(r"#[0-9a-fA-F]{6}", hex_color), (
        f"contrast color must be six-digit hex: {hex_color}"
    )
    channels = [int(hex_color[index:index + 2], 16) / 255 for index in (1, 3, 5)]
    linear = [
        channel / 12.92 if channel <= 0.04045
        else ((channel + 0.055) / 1.055) ** 2.4
        for channel in channels
    ]
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]


def contrast_ratio(first: str, second: str) -> float:
    high, low = sorted(
        (relative_luminance(first), relative_luminance(second)),
        reverse=True,
    )
    return (high + 0.05) / (low + 0.05)


def run_controller_harness(controller: Path) -> dict[str, object]:
    harness = r'''
const fs = require("fs");
const vm = require("vm");

const source = fs.readFileSync(process.argv[2], "utf8");
const storage = new Map();
const listeners = new Map();
const root = { dataset: {}, style: {} };
const media = {
  matches: false,
  callback: null,
  addEventListener(type, callback) {
    if (type === "change") this.callback = callback;
  },
  addListener(callback) {
    this.callback = callback;
  }
};

global.window = global;
global.document = {
  documentElement: root,
  readyState: "loading",
  getElementById() { return null; },
  addEventListener(type, callback) {
    listeners.set(type, callback);
  }
};
global.localStorage = {
  getItem(key) { return storage.has(key) ? storage.get(key) : null; },
  setItem(key, value) { storage.set(key, String(value)); },
  removeItem(key) { storage.delete(key); }
};
global.matchMedia = () => media;
global.CustomEvent = class CustomEvent {
  constructor(type, init) {
    this.type = type;
    this.detail = init?.detail;
  }
};
global.dispatchEvent = () => true;
global.setInterval = () => 1;
global.clearInterval = () => {};
global.setTimeout = (callback) => {
  callback();
  return 1;
};

vm.runInThisContext(source, { filename: process.argv[2] });

const api = global.__ASYNC_SCENE_COLOR_MODE__;
const rows = [];
const snap = (name) => rows.push({
  name,
  preference: api.getPreference(),
  mode: api.getResolvedMode(),
  rootPreference: root.dataset.uiColorPreference,
  rootMode: root.dataset.uiColorMode,
  colorScheme: root.style.colorScheme,
  stored: storage.has(api.storageKey) ? storage.get(api.storageKey) : null
});

snap("bootstrap");
api.setPreference("dark");
snap("explicit-dark");
media.matches = true;
media.callback?.({ matches: true });
snap("explicit-dark-system-change");
api.setPreference("system");
snap("system-dark");
media.matches = false;
media.callback?.({ matches: false });
snap("system-light");
api.setPreference("invalid");
snap("invalid-normalizes-system");

console.log(JSON.stringify({
  rows,
  preferences: Array.from(api.preferences),
  storageKey: api.storageKey
}));
'''
    with tempfile.TemporaryDirectory() as directory:
        script = Path(directory) / "harness.js"
        script.write_text(harness, encoding="utf-8")
        completed = subprocess.run(
            ["node", str(script), str(controller)],
            check=True,
            capture_output=True,
            text=True,
        )
    return json.loads(completed.stdout)


def main() -> None:
    source_index = SOURCE / "index.html"
    deployed_index = DEPLOYED / "index.html"
    source_controller = SOURCE / "ui" / "ui-color-mode.js"
    deployed_controller = DEPLOYED / "ui" / "ui-color-mode.js"
    source_modes = SOURCE / "ui" / "ui-color-modes.css"
    deployed_modes = DEPLOYED / "ui" / "ui-color-modes.css"

    assert source_index.read_bytes() == deployed_index.read_bytes(), "index mirrors differ"
    assert source_controller.read_bytes() == deployed_controller.read_bytes(), (
        "color-mode controller mirrors differ"
    )
    assert source_modes.read_bytes() == deployed_modes.read_bytes(), (
        "color-mode stylesheet mirrors differ"
    )

    for filename, expected in ACCEPTED_STAGE6_1_BLOBS.items():
        source_path = SOURCE / filename
        deployed_path = DEPLOYED / filename
        assert source_path.read_bytes() == deployed_path.read_bytes(), (
            f"accepted Stage 6.1 mirror drift: {filename}"
        )
        assert git_blob_sha1(source_path) == expected, (
            f"accepted Stage 6.1 source bytes changed: {filename}"
        )
        assert git_blob_sha1(deployed_path) == expected, (
            f"accepted Stage 6.1 deployed bytes changed: {filename}"
        )

    index = read(source_index)
    controller_tag = (
        '<script src="ui/ui-color-mode.js?'
        'v=stage6_2_five_by_two_color_modes_20260804a"></script>'
    )
    base_style_tag = (
        '<link rel="stylesheet" '
        'href="style.css?v=stage6_2_five_by_two_color_modes_20260804a" />'
    )
    modes_style_tag = (
        '<link rel="stylesheet" '
        'href="ui/ui-color-modes.css?'
        'v=stage6_2_five_by_two_color_modes_20260804a" />'
    )
    assert index.count(controller_tag) == 1, "early color-mode controller tag missing/duplicated"
    assert index.count(base_style_tag) == 1, "base stylesheet tag missing/duplicated"
    assert index.count(modes_style_tag) == 1, "mode stylesheet tag missing/duplicated"
    assert index.index(controller_tag) < index.index(base_style_tag) < index.index(modes_style_tag), (
        "controller must run before base and mode stylesheets"
    )
    assert 'defer src="ui/ui-color-mode.js' not in index, (
        "color-mode controller must run before stylesheet paint"
    )

    css = read(source_modes)
    rows: dict[tuple[str, str], dict[str, str]] = {}
    contrasts: dict[str, dict[str, float]] = {}
    signatures: dict[str, tuple[str, ...]] = {}

    for profile in PROFILES:
        geometry = None
        for mode in MODES:
            row = declarations(mode_block(css, profile, mode))
            missing = [name for name in REQUIRED_VARS if name not in row]
            assert not missing, f"{profile}/{mode} missing variables: {missing}"
            forbidden = [name for name in FORBIDDEN_SEMANTIC_VARS if name in row]
            assert not forbidden, f"{profile}/{mode} overrides semantic variables: {forbidden}"

            main_contrast = contrast_ratio(row["--text"], row["--panel"])
            primary_contrast = contrast_ratio(
                row["--profile-accent-text"],
                row["--profile-accent"],
            )
            assert main_contrast >= 7.0, (
                f"{profile}/{mode} main text contrast below 7:1: {main_contrast:.2f}"
            )
            assert primary_contrast >= 4.5, (
                f"{profile}/{mode} primary contrast below 4.5:1: {primary_contrast:.2f}"
            )

            current_geometry = (
                row["--r"],
                row["--profile-control-radius"],
                row["--profile-card-radius"],
                row["--profile-start-radius"],
            )
            if geometry is None:
                geometry = current_geometry
            else:
                assert current_geometry == geometry, (
                    f"{profile} geometry changes between light/dark: "
                    f"{geometry!r} != {current_geometry!r}"
                )

            key = (profile, mode)
            rows[key] = row
            label = f"{profile}/{mode}"
            contrasts[label] = {
                "main": round(main_contrast, 2),
                "primary": round(primary_contrast, 2),
            }
            signatures[label] = (
                row["--bg"],
                row["--panel"],
                row["--text"],
                row["--profile-accent"],
                row["--profile-accent-text"],
                row["--profile-control-radius"],
                row["--profile-card-radius"],
            )

    assert len(rows) == 10, f"expected ten profile/mode rows, got {len(rows)}"
    assert len(set(signatures.values())) == 10, (
        f"five-by-two signatures are not distinct: {signatures}"
    )

    for key, expected in ACCEPTED_VARIANTS.items():
        actual = rows[key]
        mismatch = {
            name: (expected_value, actual.get(name))
            for name, expected_value in expected.items()
            if actual.get(name) != expected_value
        }
        assert not mismatch, f"accepted Stage 6.1 variant drift at {key}: {mismatch}"

    required_css = (
        "#uiColorModeControls",
        ".uiColorModeChoices",
        ".uiColorModeButton.is-active",
        "@media (forced-colors:active)",
        'html[data-ui-color-mode="dark"] body[data-ui-profile="genX"]',
        'html[data-ui-color-mode="light"] body[data-ui-profile="genX"]',
    )
    missing_css = [token for token in required_css if token not in css]
    assert not missing_css, f"missing mode CSS contract: {missing_css}"

    controller = read(source_controller)
    required_controller = (
        'const STORAGE_KEY = "asyncscene.uiColorMode"',
        'Object.freeze(["system", "light", "dark"])',
        'window.matchMedia("(prefers-color-scheme: dark)")',
        "root.dataset.uiColorPreference",
        "root.dataset.uiColorMode",
        "UI.getColorModePreference",
        "UI.getResolvedColorMode",
        "UI.setColorModePreference",
        "UI.ensureColorModeControls",
        '"Авто"',
        '"Светлая"',
        '"Тёмная"',
        '"asyncscene:color-mode-change"',
    )
    missing_controller = [token for token in required_controller if token not in controller]
    assert not missing_controller, f"missing controller contract: {missing_controller}"

    forbidden_controller = (
        "Game.State", "Game.state", "UI.S", "moneyLog",
        "mePoints", "meRep", "battle", "economy",
    )
    present_forbidden = [token for token in forbidden_controller if token in controller]
    assert not present_forbidden, (
        f"presentation-only controller touches game state/mechanics: {present_forbidden}"
    )

    subprocess.run(["node", "--check", str(source_controller)], check=True)

    harness = run_controller_harness(source_controller)
    assert harness["storageKey"] == "asyncscene.uiColorMode"
    assert harness["preferences"] == list(PREFERENCES)
    observed = {row["name"]: row for row in harness["rows"]}
    assert observed["bootstrap"] == {
        "name": "bootstrap", "preference": "system", "mode": "light",
        "rootPreference": "system", "rootMode": "light",
        "colorScheme": "light", "stored": None,
    }
    assert observed["explicit-dark"]["mode"] == "dark"
    assert observed["explicit-dark"]["stored"] == "dark"
    assert observed["explicit-dark-system-change"]["mode"] == "dark"
    assert observed["system-dark"]["preference"] == "system"
    assert observed["system-dark"]["mode"] == "dark"
    assert observed["system-dark"]["stored"] is None
    assert observed["system-light"]["mode"] == "light"
    assert observed["invalid-normalizes-system"]["preference"] == "system"
    assert observed["invalid-normalizes-system"]["stored"] is None

    project = read(PROJECT)
    sync_group = "CEF3D28F2EF39DA8002A0BCD /* ui */"
    assert project.count(f"{sync_group} = {{") == 1, "ui synchronized root missing"
    assert "isa = PBXFileSystemSynchronizedRootGroup;" in project
    target_fragment = project.split("fileSystemSynchronizedGroups = (", 1)[1].split(");", 1)[0]
    assert sync_group in target_fragment, "ui synchronized root is not in target membership"
    assert "ui-color-mode.js" not in project and "ui-color-modes.css" not in project, (
        "synchronized ui files must not be duplicated as explicit PBX resources"
    )

    print(
        "STAGE6_2_FIVE_BY_TWO_COLOR_MODES_STATIC_PASS",
        {
            "profiles": list(PROFILES),
            "modes": list(MODES),
            "variants": len(rows),
            "contrasts": contrasts,
            "signatures": signatures,
            "controllerGitBlobSha1": git_blob_sha1(source_controller),
            "modeCssGitBlobSha1": git_blob_sha1(source_modes),
            "indexGitBlobSha1": git_blob_sha1(source_index),
            "harness": harness,
        },
    )


if __name__ == "__main__":
    main()
