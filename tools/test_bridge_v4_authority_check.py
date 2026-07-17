from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from tools.bridge_v4_authority_check import FILES, REQUIRED_MARKERS, validate_authority


class BridgeV4AuthorityCheckTests(unittest.TestCase):
    def write_authority(self, root: Path, *, stale_agents: bool = False) -> None:
        common = "\n".join(REQUIRED_MARKERS) + "\n"
        for relative in FILES:
            text = common
            if stale_agents and relative == "AGENTS.md":
                text = text.replace("BRIDGE_PROTOCOL: 4.0", "BRIDGE_PROTOCOL: 3.3")
                text += "fetch `origin/main` and `origin/coordination/chatgpt-codex-bridge`\n"
            (root / relative).write_text(text, encoding="utf-8")

    def test_current_v4_authority_passes(self) -> None:
        self.assertEqual(validate_authority(), [])

    def test_stale_agents_protocol_fails(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            self.write_authority(root, stale_agents=True)
            errors = validate_authority(root)
            self.assertTrue(any("FAIL_AUTHORITY_STALE_MARKER" in error for error in errors))
            self.assertTrue(any("FAIL_AUTHORITY_REQUIRED_MARKER" in error for error in errors))

    def test_missing_root_document_fails(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            self.write_authority(root)
            (root / "BRIDGE.md").unlink()
            self.assertIn("FAIL_AUTHORITY_MISSING: BRIDGE.md", validate_authority(root))

    def test_missing_canonical_policy_marker_fails(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            self.write_authority(root)
            (root / "BRIDGE.md").write_text("BRIDGE_PROTOCOL: 4.0\n", encoding="utf-8")
            self.assertTrue(any("BRIDGE_PUBLICATION_POLICY.md" in error for error in validate_authority(root)))


if __name__ == "__main__":
    unittest.main()
