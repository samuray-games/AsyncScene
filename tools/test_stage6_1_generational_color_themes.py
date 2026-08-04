#!/usr/bin/env python3
"""Static regression for Stage 6.1 generational color themes."""

from __future__ import annotations

import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "AsyncScene" / "Web"
DEPLOYED = ROOT / "docs"
PROFILES = ("boomer", "genX", "millennial", "zoomer", "alpha")
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


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


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

    base = read(source_base)
    assert ":root{" in base, "preserved base stylesheet is missing its root token block"
    assert "@import" not in base, "preserved base stylesheet must not become another loader"

    css = read(source_theme)
    rows: dict[str, dict[str, str]] = {}
    for profile in PROFILES:
        block = profile_block(css, profile)
        row = declarations(block)
        missing = [name for name in REQUIRED_VARS if name not in row]
        assert not missing, f"{profile} missing variables: {missing}"
        forbidden = [name for name in FORBIDDEN_SEMANTIC_VARS if name in row]
        assert not forbidden, f"{profile} overrides semantic variables: {forbidden}"
        rows[profile] = row

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

    print(
        "STAGE6_1_GENERATIONAL_COLOR_THEMES_STATIC_PASS",
        {
            "profiles": list(PROFILES),
            "loaderSha256": digest(source_loader),
            "baseSha256": digest(source_base),
            "themeSha256": digest(source_theme),
            "signatures": signatures,
        },
    )


if __name__ == "__main__":
    main()
