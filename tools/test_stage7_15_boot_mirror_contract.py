#!/usr/bin/env python3
"""Validate only the authoritative Stage 7.15 ui-boot mirror slices.

The source and docs ui-boot.js files intentionally contain unrelated legacy
differences. The Stage 7.15 boot repair slices must remain exact matches.
"""
from pathlib import Path
import difflib
import sys


def extract(text: str, start: str, end: str) -> str:
    left = text.find(start)
    if left < 0:
        raise AssertionError(f"missing start marker: {start!r}")
    right = text.find(end, left)
    if right < 0:
        raise AssertionError(f"missing end marker: {end!r}")
    return text[left:right]


def main() -> int:
    root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parents[1]
    source = (root / "AsyncScene/Web/ui/ui-boot.js").read_text(encoding="utf-8")
    docs = (root / "docs/ui/ui-boot.js").read_text(encoding="utf-8")
    slices = {
        "fresh_start_claim": (
            "const stage715Demo = G.Stage715Demo;",
            "  function startGame(UI) {",
        ),
        "resume_gate": (
            "      const stage715ActiveForResume = G.Stage715Demo",
            "        const firstExperience = G.Stage7FirstExperience;",
        ),
        "auto_resume_boot": (
            "    const stage715Demo = G.Stage715Demo;\n    const autoResumeStage715 =",
            "    if (!autoResumeStage715) keepFreshStartScreenVisible(UI);",
        ),
    }
    failures = []
    for name, (start, end) in slices.items():
        try:
            left = extract(source, start, end)
            right = extract(docs, start, end)
        except AssertionError as error:
            failures.append(f"{name}: {error}")
            continue
        if left != right:
            diff = "".join(difflib.unified_diff(left.splitlines(True), right.splitlines(True), n=2))
            failures.append(f"{name}: source/docs Stage 7.15 slice differs\n{diff[:3000]}")
    if failures:
        print("FAIL_STAGE7_15_BOOT_MIRROR_CONTRACT")
        print("\n".join(failures))
        return 1
    print("PASS_STAGE7_15_BOOT_MIRROR_CONTRACT")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
