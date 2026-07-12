#!/usr/bin/env python3
from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from tools import validate_ai_work_pipeline as validator


class PipelineValidatorTests(unittest.TestCase):
    def test_header_parser(self) -> None:
        parsed = validator.parse_header("TASK_ID: TASK-1\nCURRENT_STATUS: READY_FOR_WORK\n")
        self.assertEqual(parsed["TASK_ID"], "TASK-1")
        self.assertEqual(parsed["CURRENT_STATUS"], "READY_FOR_WORK")

    def test_allowed_status_contract(self) -> None:
        self.assertIn("ACCEPTED", validator.ALLOWED_STATUSES)
        self.assertNotIn("CODEX_ACCEPTED", validator.ALLOWED_STATUSES)

    def test_bridge_paths_are_forbidden_in_codex_write_scope(self) -> None:
        self.assertIn(".ai-bridge/STATE.md", validator.BRIDGE_FORBIDDEN_PATHS)
        self.assertIn(".ai-bridge/outbox/", validator.BRIDGE_FORBIDDEN_PATHS)

    def test_obsolete_runtime_safety_gate_is_forbidden(self) -> None:
        self.assertIn(
            "Use @asynchronia runtime-safety-gate.",
            validator.OBSOLETE_CODEX_DIRECTIVES,
        )

    def test_missing_state_fails(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            task_dir = Path(directory) / "TASK-1"
            task_dir.mkdir()
            self.assertEqual(validator.validate_task(task_dir), [f"{task_dir}: missing STATE.md"])


if __name__ == "__main__":
    unittest.main()
