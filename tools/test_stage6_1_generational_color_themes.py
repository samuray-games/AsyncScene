#!/usr/bin/env python3
"""Static regression for Stage 6.1 generational color themes."""

from __future__ import annotations

import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "AsyncScene" / "Web"
DEPLOYED = ROOT / "docs"
PROJECT = ROOT / "AsyncScene" / "AsyncScene.xcodeproj" / "project.pbxproj"
PROFILES = ("boomer", "genX", "millennial", "zoomer", "alpha")
PRESERVED_BASE_GIT_BLOB_SHA1 = "738398815ed6ca310a5e3dee0dbea2cd24729e89"
REQUIRED_VARS = (
    "--bg",
    "--panel",
    "--panel2",
    "--panelSolid",
    "--line",
    "--text",
    "--muted",
    "--muted2",
    "--shadow",
    "--r",
    "--profile-accent",
    "--profile-accent-soft",
    "--profile-accent-border",
    "--profile-accent-text",
    "--profile-focus",
    "--profile-control-radius",
    "--profile-card-radius",
    "--profile-start-radius",
)
FORBIDDEN_SEMANTIC_VARS = ("--y", "--o", "--rcol", "--ybd", "--obd", "--rbd")
EXPECTED_IMPORTS = (
    '@import url("style-base.css?v=stage6_1_generational_color_themes_20260804a");',
    '@import url("ui-profile-themes.css?v=stage6_1_generational_color_themes_20260804a");',
)
REQUIRED_LOADER_RULES = (
    "body[data-ui-profile] .mention-item.active",
    "body[data-ui-profile] .dmLine.focusFlash",
    "body[data-ui-profile] .chatResizeHandle:focus-visible",
)
XCODE_RESOURCES = {
    "style-base.css": ("A61100012F00000100000001", "A61100022F00000100000001"),
    "ui-profile-themes.css": ("A61100032F00000100000001", "A61100042F00000100000001"),
}


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def git_blob_sha1(path: Path) -> str:
    content = path.read_bytes()
    framed = f"blob {len(content)}\0".encode("ascii") + content
    return hashlib.sha1(framed).hexdigest()


def profile_block(css: str, profile: str) -> str:
    selector = re.escape(f'body[data-ui-profile="{profile}"]')
    match = re.search(rf"{selector}\s*\{{(?P<body>.*?)\n\}}", css, flags=re.S)
    assert match, f"missing profile selector: {profile}"
    return match.group("body")


def declarations(block: str) -> dict[str, str]:
    return {
        key: value.strip()
        for key, value in re.findall(r"(--[A-Za-z0-9_-]+)\s*:\s*([^;]+);", block)
    }


def pbx_section(project: str, name: str) -> str:
    start = f"/* Begin {name} section */"
    end = f"/* End {name} section */"
    assert project.count(start) == 1 and project.count(end) == 1, f"invalid {name} section markers"
    return project.split(start, 1)[1].split(end, 1)[0]


def relative_luminance(hex_color: str) -> float:
    assert re.fullmatch(r"#[0-9a-fA-F]{6}", hex_color), f"contrast color must be six-digit hex: {hex_color}"
    channels = [int(hex_color[index:index + 2], 16) / 255 for index in (1, 3, 5)]
    linear = [channel / 12.92 if channel <= 0.04045 else ((channel + 0.055) / 1.055) ** 2.4 for channel in channels]
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]


def contrast_ratio(first: str, second: str) -> float:
    high, low = sorted((relative_luminance(first), relative_luminance(second)), reverse=True)
    return (high + 0.05) / (low + 0.05)


def main() -> None:
    source_loader = SOURCE / "style.css"
    deployed_loader = DEPLOYED / "style.css"
    source_base = SOURCE / "style-base.css"
    deployed_base = DEPLOYED / "style-base.css"
    source_theme = SOURCE / "ui-profile-themes.css"
    deployed_theme = DEPLOYED / "ui-profile-themes.css"

    assert source_loader.read_bytes() == deployed_loader.read_bytes(), "style loader mirrors differ"
    assert source_base.read_bytes() == deployed_base.read_bytes(), "base style mirrors differ"
    assert source_theme.read_bytes() == deployed_theme.read_bytes(), "theme mirrors differ"

    loader = read(source_loader)
    imports = tuple(line.strip() for line in loader.splitlines() if line.strip().startswith("@import"))
    assert imports == EXPECTED_IMPORTS, f"unexpected loader imports: {imports!r}"
    assert loader.index(EXPECTED_IMPORTS[0]) < loader.index(EXPECTED_IMPORTS[1]), "base must load before themes"
    missing_loader_rules = [rule for rule in REQUIRED_LOADER_RULES if rule not in loader]
    assert not missing_loader_rules, f"missing legacy accent overrides: {missing_loader_rules}"

    base = read(source_base)
    assert ":root{" in base, "preserved base stylesheet is missing its root token block"
    assert "@import" not in base, "preserved base stylesheet must not become another loader"
    assert git_blob_sha1(source_base) == PRESERVED_BASE_GIT_BLOB_SHA1, "source base stylesheet no longer matches accepted original bytes"
    assert git_blob_sha1(deployed_base) == PRESERVED_BASE_GIT_BLOB_SHA1, "deployed base stylesheet no longer matches accepted original bytes"

    css = read(source_theme)
    rows: dict[str, dict[str, str]] = {}
    contrasts: dict[str, dict[str, float]] = {}
    for profile in PROFILES:
        block = profile_block(css, profile)
        row = declarations(block)
        missing = [name for name in REQUIRED_VARS if name not in row]
        assert not missing, f"{profile} missing variables: {missing}"
        forbidden = [name for name in FORBIDDEN_SEMANTIC_VARS if name in row]
        assert not forbidden, f"{profile} overrides semantic variables: {forbidden}"
        main_contrast = contrast_ratio(row["--text"], row["--panel"])
        primary_contrast = contrast_ratio(row["--profile-accent-text"], row["--profile-accent"])
        assert main_contrast >= 7.0, f"{profile} main text contrast below 7:1: {main_contrast:.2f}"
        assert primary_contrast >= 4.5, f"{profile} primary action contrast below 4.5:1: {primary_contrast:.2f}"
        rows[profile] = row
        contrasts[profile] = {"main": round(main_contrast, 2), "primary": round(primary_contrast, 2)}

    signatures = {
        profile: (
            row["--bg"],
            row["--panel"],
            row["--profile-accent"],
            row["--profile-control-radius"],
            row["--profile-card-radius"],
        )
        for profile, row in rows.items()
    }
    assert len(set(signatures.values())) == len(PROFILES), f"theme signatures are not distinct: {signatures}"

    required_rules = (
        "body[data-ui-profile] .btn.primary",
        "body[data-ui-profile] #startCard",
        "body[data-ui-profile] #startScreen",
        "body[data-ui-profile] .eventVoteBtn.selected",
        "body[data-ui-profile] .mention.me",
        "body[data-ui-profile] .bubble.sys",
        "body[data-ui-profile] #chatInput:focus",
        "@media (prefers-reduced-motion:reduce)",
        "@media (forced-colors:active)",
    )
    missing_rules = [rule for rule in required_rules if rule not in css]
    assert not missing_rules, f"missing required theme rules: {missing_rules}"

    source_profile_js = read(SOURCE / "ui" / "ui-profile-visual-tone-repair.js")
    deployed_profile_js = read(DEPLOYED / "ui" / "ui-profile-visual-tone-repair.js")
    assert source_profile_js == deployed_profile_js, "profile wiring mirrors differ"
    wiring = 'document.body.dataset.uiProfile = activeProfile()'
    assert wiring in source_profile_js, "body data-ui-profile synchronization is missing"

    project = read(PROJECT)
    file_refs = pbx_section(project, "PBXFileReference")
    build_files = pbx_section(project, "PBXBuildFile")
    groups = pbx_section(project, "PBXGroup")
    resources = pbx_section(project, "PBXResourcesBuildPhase")
    for filename, (file_ref, build_ref) in XCODE_RESOURCES.items():
        assert file_refs.count(f"{file_ref} /* {filename} */") == 1, f"{filename} file reference missing or duplicated"
        assert f'path = "{filename}";' in file_refs, f"{filename} path missing"
        assert build_files.count(f"{build_ref} /* {filename} in Resources */") == 1, f"{filename} build file missing or duplicated"
        assert f"fileRef = {file_ref} /* {filename} */" in build_files, f"{filename} build file points elsewhere"
        assert groups.count(f"{file_ref} /* {filename} */") == 1, f"{filename} Web group membership missing or duplicated"
        assert resources.count(f"{build_ref} /* {filename} in Resources */") == 1, f"{filename} Resources phase membership missing or duplicated"

    print(
        "STAGE6_1_GENERATIONAL_COLOR_THEMES_STATIC_PASS",
        {
            "profiles": list(PROFILES),
            "loaderSha256": digest(source_loader),
            "baseGitBlobSha1": git_blob_sha1(source_base),
            "themeSha256": digest(source_theme),
            "xcodeResources": list(XCODE_RESOURCES),
            "contrasts": contrasts,
            "signatures": signatures,
        },
    )


if __name__ == "__main__":
    main()
