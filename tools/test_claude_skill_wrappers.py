#!/usr/bin/env python3
"""Parity tests: every canonical plugin skill has exactly one thin Claude wrapper.

The canonical content stays in plugins/asynchronia/skills/<name>/SKILL.md.
The wrapper under .claude/skills/<name>/SKILL.md only points to it and must
not duplicate its body, widen permissions or change model routing.
"""

from __future__ import annotations

import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "plugins" / "asynchronia" / "skills"
WRAPPERS = ROOT / ".claude" / "skills"
EXPECTED_COUNT = 14
ALLOWED_WRAPPER_FIELDS = {"name", "description", "disable-model-invocation"}
REFERENCE_ONLY = {"model-selector"}
MAX_WRAPPER_LINES = 30
MIN_SHARED_LINE = 40


def split(path: Path) -> tuple[dict[str, str], str]:
    text = path.read_text(encoding="utf-8")
    match = re.match(r"^---\n(.*?)\n---\n(.*)$", text, re.S)
    if not match:
        raise AssertionError(f"no frontmatter: {path}")
    fields: dict[str, str] = {}
    for line in match.group(1).splitlines():
        key, sep, value = line.partition(":")
        if not sep:
            raise AssertionError(f"bad frontmatter line in {path}: {line!r}")
        fields[key.strip()] = value.strip()
    return fields, match.group(2)


def source_names() -> list[str]:
    return sorted(p.name for p in SOURCE.iterdir() if (p / "SKILL.md").is_file())


class SkillWrapperParityTests(unittest.TestCase):
    def test_one_wrapper_per_canonical_skill(self) -> None:
        names = source_names()
        self.assertEqual(len(names), EXPECTED_COUNT)
        wrappers = sorted(p.name for p in WRAPPERS.iterdir() if p.is_dir())
        self.assertEqual(wrappers, names)
        for name in names:
            files = sorted(f.name for f in (WRAPPERS / name).iterdir())
            self.assertEqual(files, ["SKILL.md"], name)

    def test_name_and_description_match_source(self) -> None:
        for name in source_names():
            src, _ = split(SOURCE / name / "SKILL.md")
            wrap, _ = split(WRAPPERS / name / "SKILL.md")
            self.assertEqual(wrap["name"], name)
            self.assertEqual(src["name"], name)
            self.assertEqual(wrap["description"], src["description"], name)

    def test_wrappers_do_not_widen_permissions_or_route_models(self) -> None:
        for name in source_names():
            wrap, _ = split(WRAPPERS / name / "SKILL.md")
            extra = set(wrap) - ALLOWED_WRAPPER_FIELDS
            self.assertFalse(extra, f"{name} declares {extra}")
            if name in REFERENCE_ONLY:
                self.assertEqual(wrap.get("disable-model-invocation"), "true", name)
            else:
                self.assertNotIn("disable-model-invocation", wrap, name)

    def test_wrapper_points_to_canonical_file_and_keeps_codex_specific_rules(self) -> None:
        for name in source_names():
            _, body = split(WRAPPERS / name / "SKILL.md")
            self.assertIn(f"`plugins/asynchronia/skills/{name}/SKILL.md`", body)
            self.assertIn("Read that file in full", body)
            self.assertIn("Do not substitute product names mechanically", body)
            self.assertIn("remain Codex-specific", body)
            self.assertIn("not technical permission boundaries", body)

    def test_wrapper_is_thin_and_does_not_copy_canonical_body(self) -> None:
        for name in source_names():
            _, src_body = split(SOURCE / name / "SKILL.md")
            wrap_text = (WRAPPERS / name / "SKILL.md").read_text(encoding="utf-8")
            self.assertLessEqual(len(wrap_text.splitlines()), MAX_WRAPPER_LINES, name)
            src_lines = {l.strip() for l in src_body.splitlines() if len(l.strip()) >= MIN_SHARED_LINE}
            _, wrap_body = split(WRAPPERS / name / "SKILL.md")
            shared = [l for l in wrap_body.splitlines() if l.strip() in src_lines]
            self.assertEqual(shared, [], f"{name} duplicates canonical lines")

    def test_canonical_skills_still_describe_codex_routing(self) -> None:
        # The source plugin stays the Codex-format authority and is not rewritten.
        self.assertTrue((ROOT / "plugins" / "asynchronia" / ".codex-plugin" / "plugin.json").is_file())
        _, body = split(SOURCE / "model-selector" / "SKILL.md")
        self.assertIn("Codex", body)


if __name__ == "__main__":
    unittest.main()
