#!/usr/bin/env python3
"""Regression for the Stage 7 essence modal stacking above the start screen."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "AsyncScene" / "Web"
DEPLOYED = ROOT / "docs"


def read(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def declaration(css: str, selector: str, property_name: str) -> str:
    match = re.search(
        rf"{re.escape(selector)}\s*\{{(?P<body>.*?)\n\}}",
        css,
        flags=re.S,
    )
    assert match, f"missing selector: {selector}"
    prop = re.search(
        rf"{re.escape(property_name)}\s*:\s*([^;]+);",
        match.group("body"),
    )
    assert prop, f"missing {property_name} in {selector}"
    return prop.group(1).strip()


def main() -> None:
    source_css = SOURCE / "ui" / "ui-stage7-essence.css"
    deployed_css = DEPLOYED / "ui" / "ui-stage7-essence.css"
    base_css = SOURCE / "style-base.css"
    source_js = SOURCE / "ui" / "ui-stage7-essence.js"

    assert source_css.read_bytes() == deployed_css.read_bytes(), (
        "essence CSS mirrors differ"
    )

    essence = read(source_css)
    base = read(base_css)
    js = read(source_js)

    start_z = declaration(base, "#startScreen", "z-index")
    modal_z = declaration(essence, ".stage7EssenceModal", "z-index")

    assert start_z == "2147483647", f"unexpected start-screen z-index: {start_z}"
    assert modal_z == start_z, (
        "essence modal must share the maximum root stacking level with the "
        f"start screen: modal={modal_z}, start={start_z}"
    )

    # The modal is appended after the static start screen. Equal positioned
    # z-index values therefore use DOM order, placing the modal above it.
    assert "document.body.appendChild(root);" in js
    assert 'id="startScreen"' in read(SOURCE / "index.html")

    print(json.dumps({
        "ok": True,
        "startScreenZIndex": start_z,
        "essenceModalZIndex": modal_z,
        "modalAppendedAfterStartScreen": True,
        "cssMirror": True,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
