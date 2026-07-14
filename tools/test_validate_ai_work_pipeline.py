#!/usr/bin/env python3
from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from tools import validate_ai_work_pipeline as validator


class PipelineValidatorTests(unittest.TestCase):
    def _codex_task_text(self, *body_lines: str) -> str:
        sections = "\n".join(
            f"### {section}\nvalue"
            for section in validator.REQUIRED_SECTIONS["03-codex-task.md"]
        )
        return (
            "Use @asynchronia plugin.\n"
            "TASK_ID: TASK-1\n"
            "PIPELINE_VERSION: 1.0.0\n"
            "PHASE: CODEX_TASK\n"
            "STATUS: READY_FOR_CODEX\n"
            "CREATED_AT: 2026-07-12T00:00:00Z\n"
            "AUTHOR_ROLE: WORK\n"
            "SOURCE_REVISION: test\n"
            + "\n".join(body_lines)
            + ("\n" if body_lines else "")
            + f"{sections}\n"
        )

    def test_header_parser(self) -> None:
        parsed = validator.parse_header("TASK_ID: TASK-1\nCURRENT_STATUS: READY_FOR_WORK\n")
        self.assertEqual(parsed["TASK_ID"], "TASK-1")
        self.assertEqual(parsed["CURRENT_STATUS"], "READY_FOR_WORK")

    def test_allowed_status_contract(self) -> None:
        self.assertIn("ACCEPTED", validator.ALLOWED_STATUSES)
        self.assertNotIn("CODEX_ACCEPTED", validator.ALLOWED_STATUSES)

    def test_historical_terminal_status_contract(self) -> None:
        self.assertIn(
            "FINAL_MAIN_AND_MEMORY_SYNC_COMPLETE",
            validator.HISTORICAL_TERMINAL_STATUSES,
        )

    def test_bridge_paths_are_forbidden_in_codex_write_scope(self) -> None:
        self.assertIn(".ai-bridge/STATE.md", validator.BRIDGE_FORBIDDEN_PATHS)
        self.assertIn(".ai-bridge/outbox/", validator.BRIDGE_FORBIDDEN_PATHS)

    def test_exact_plugin_invocation_is_accepted_for_active_codex_artifact(self) -> None:
        text = self._codex_task_text()
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "03-codex-task.md"
            path.write_text(text, encoding="utf-8")
            errors = validator.validate_file(
                path,
                "TASK-1",
                enforce_active_codex_rules=True,
            )
        self.assertEqual(errors, [])

    def test_active_codex_prompt_rejects_non_first_content_invocation(self) -> None:
        text = (
            "TASK_ID: TASK-1\n"
            "PIPELINE_VERSION: 1.0.0\n"
            "PHASE: CODEX_TASK\n"
            "STATUS: READY_FOR_CODEX\n"
            "CREATED_AT: 2026-07-12T00:00:00Z\n"
            "AUTHOR_ROLE: WORK\n"
            "SOURCE_REVISION: test\n"
            "Use @asynchronia plugin.\n"
            + "\n".join(
                f"### {section}\nvalue"
                for section in validator.REQUIRED_SECTIONS["03-codex-task.md"]
            )
            + "\n"
        )
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "03-codex-task.md"
            path.write_text(text, encoding="utf-8")
            errors = validator.validate_file(
                path,
                "TASK-1",
                enforce_active_codex_rules=True,
            )
        self.assertTrue(
            any("active executable Codex prompt must start" in error for error in errors)
        )

    def test_leading_whitespace_or_blank_line_before_plugin_invocation_is_rejected(self) -> None:
        for prefix in ("\n", "   "):
            with self.subTest(prefix=prefix):
                text = prefix + self._codex_task_text("Use @asynchronia task-router.")
                with tempfile.TemporaryDirectory() as directory:
                    path = Path(directory) / "03-codex-task.md"
                    path.write_text(text, encoding="utf-8")
                    errors = validator.validate_file(
                        path,
                        "TASK-1",
                        enforce_active_codex_rules=True,
                    )
                self.assertTrue(
                    any("active executable Codex prompt must start" in error for error in errors)
                )

    def test_task_router_skill_reference_remains_valid_for_active_codex_artifact(self) -> None:
        text = self._codex_task_text("Use @asynchronia task-router.")
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "03-codex-task.md"
            path.write_text(text, encoding="utf-8")
            errors = validator.validate_file(
                path,
                "TASK-1",
                enforce_active_codex_rules=True,
            )
        self.assertEqual(errors, [])

    def test_terminal_historical_task_is_not_revalidated_against_new_phase_schema(self) -> None:
        state = (
            "TASK_ID: TASK-1\n"
            "PIPELINE_VERSION: 1.0.0\n"
            "CURRENT_STATUS: FINAL_MAIN_AND_MEMORY_SYNC_COMPLETE\n"
            "CURRENT_PHASE: SERIALIZED_MAIN_INTEGRATION_AND_FINAL_MEMORY_SYNC_COMPLETE\n"
            "CURRENT_ARTIFACT: infra/example@0123456789abcdef\n"
            "NEXT_ROLE: NONE_FOR_THIS_TASK\n"
            "NEXT_ACTION: No further action required.\n"
            "UPDATED_AT: 2026-07-12\n"
        )
        with tempfile.TemporaryDirectory() as directory:
            task_dir = Path(directory) / "TASK-1"
            task_dir.mkdir()
            (task_dir / "STATE.md").write_text(state, encoding="utf-8")
            # Deliberately add an old-schema artifact. The accepted terminal
            # record must not be rewritten or reinterpreted under a newer schema.
            (task_dir / "01-chat-brief.md").write_text("historical old schema\n", encoding="utf-8")
            errors = validator.validate_task(task_dir)
        self.assertEqual(errors, [])

    def test_historical_non_active_artifact_is_not_revalidated_as_active_prompt(self) -> None:
        state = (
            "TASK_ID: TASK-1\n"
            "PIPELINE_VERSION: 1.0.0\n"
            "CURRENT_STATUS: ACCEPTED_SOURCE_PENDING_INTEGRATION\n"
            "CURRENT_PHASE: INDEPENDENT_REVIEW_ACCEPTED\n"
            "CURRENT_ARTIFACT: N/A\n"
            "NEXT_ROLE: CODEX\n"
            "NEXT_ACTION: Historical evidence only.\n"
            "UPDATED_AT: 2026-07-12\n"
        )
        historical_text = (
            "TASK_ID: TASK-1\n"
            "PIPELINE_VERSION: 1.0.0\n"
            "PHASE: REVIEW_REPORT\n"
            "STATUS: ACCEPTED_SOURCE_PENDING_INTEGRATION\n"
            "CREATED_AT: 2026-07-12T00:00:00Z\n"
            "AUTHOR_ROLE: WORK\n"
            "SOURCE_REVISION: test\n"
            "Historical evidence only.\n"
            + "\n".join(
                f"### {section}\nvalue"
                for section in validator.REQUIRED_SECTIONS["04-review-report.md"]
            )
            + "\n"
        )
        with tempfile.TemporaryDirectory() as directory:
            task_dir = Path(directory) / "TASK-1"
            task_dir.mkdir()
            (task_dir / "STATE.md").write_text(state, encoding="utf-8")
            (task_dir / "04-review-report.md").write_text(historical_text, encoding="utf-8")
            errors = validator.validate_task(task_dir)
        self.assertEqual(errors, [])

    def test_terminal_historical_task_requires_no_next_role(self) -> None:
        state = (
            "TASK_ID: TASK-1\n"
            "PIPELINE_VERSION: 1.0.0\n"
            "CURRENT_STATUS: FINAL_MAIN_AND_MEMORY_SYNC_COMPLETE\n"
            "CURRENT_PHASE: SERIALIZED_MAIN_INTEGRATION_AND_FINAL_MEMORY_SYNC_COMPLETE\n"
            "CURRENT_ARTIFACT: infra/example@0123456789abcdef\n"
            "NEXT_ROLE: CODEX\n"
            "NEXT_ACTION: Incorrect reopen.\n"
            "UPDATED_AT: 2026-07-12\n"
        )
        with tempfile.TemporaryDirectory() as directory:
            task_dir = Path(directory) / "TASK-1"
            task_dir.mkdir()
            (task_dir / "STATE.md").write_text(state, encoding="utf-8")
            errors = validator.validate_task(task_dir)
        self.assertTrue(any("NONE_FOR_THIS_TASK" in error for error in errors))

    def test_unknown_current_status_is_rejected(self) -> None:
        state = (
            "TASK_ID: TASK-1\n"
            "PIPELINE_VERSION: 1.0.0\n"
            "CURRENT_STATUS: BANANA_ON_FIRE\n"
            "CURRENT_PHASE: CODEX_TASK\n"
            "CURRENT_ARTIFACT: N/A\n"
            "NEXT_ROLE: CODEX\n"
            "NEXT_ACTION: Invalid status.\n"
            "UPDATED_AT: 2026-07-12\n"
        )
        with tempfile.TemporaryDirectory() as directory:
            task_dir = Path(directory) / "TASK-1"
            task_dir.mkdir()
            (task_dir / "STATE.md").write_text(state, encoding="utf-8")
            errors = validator.validate_task(task_dir)
        self.assertTrue(any("invalid CURRENT_STATUS" in error for error in errors))

    def test_missing_state_fails(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            task_dir = Path(directory) / "TASK-1"
            task_dir.mkdir()
            self.assertEqual(validator.validate_task(task_dir), [f"{task_dir}: missing STATE.md"])


if __name__ == "__main__":
    unittest.main()
