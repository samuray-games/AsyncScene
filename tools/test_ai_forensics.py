from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from tools.ai_forensics import schema
from tools.ai_forensics.codex_hook import capture_event, normalize_hook_event
from tools.ai_forensics.git_evidence import strip_remote_credentials
from tools.ai_forensics.package import build_package_files, truncate_text
from tools.ai_forensics.publish import publish_staged_run, stage_run_package
from tools.ai_forensics.redact import sanitize_json_compatible, sanitize_text


class SchemaTests(unittest.TestCase):
    def test_run_id_is_unique_and_actor_prefixed(self) -> None:
        first = schema.generate_run_id("CODEX", "session-a")
        second = schema.generate_run_id("CODEX", "session-a")
        self.assertNotEqual(first, second)
        self.assertTrue(first.startswith("CODEX-"))

    def test_manifest_rejects_missing_and_extra_keys(self) -> None:
        manifest = schema.build_manifest(
            actor="WORK",
            run_id=schema.generate_run_id("WORK", "task"),
            status="UPLOAD_PENDING",
            repository="samuray-games/AsyncScene",
            branch="work/test",
            task_id="TASK-1",
        )
        broken = dict(manifest)
        broken.pop("branch")
        broken["unexpected"] = "value"
        errors = schema.validate_manifest(broken)
        self.assertTrue(any("missing manifest keys" in error for error in errors))
        self.assertTrue(any("unexpected manifest keys" in error for error in errors))

    def test_manifest_rejects_placeholder_and_wrong_type(self) -> None:
        manifest = schema.build_manifest(
            actor="WORK",
            run_id=schema.generate_run_id("WORK", "task"),
            status="UPLOAD_PENDING",
            repository="samuray-games/AsyncScene",
            branch="work/test",
            task_id="TASK-1",
        )
        manifest["repository"] = "TODO"
        manifest["taskId"] = 7
        errors = schema.validate_manifest(manifest)
        self.assertTrue(any("placeholder" in error for error in errors))
        self.assertTrue(any("wrong type" in error for error in errors))


class RedactionTests(unittest.TestCase):
    def test_redacts_headers_urls_env_and_home_paths(self) -> None:
        text = (
            "Authorization: Bearer sk-live-abc\n"
            "Cookie: session=abcd\n"
            "API_KEY=secret-value\n"
            "url=https://user:pass@example.com/path?token=abc123\n"
            f"path={Path.home()}/project\n"
        )
        result = sanitize_text(text)
        self.assertIn("<redacted>", result.text)
        self.assertIn("<HOME>", result.text)
        self.assertFalse(result.blocked)

    def test_redacts_private_keys_and_json_secret_values(self) -> None:
        payload = {
            "token": "ghp_1234567890abcdefghijklmnop",
            "nested": {"private_key": "-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----"},
        }
        sanitized, replacements, reasons, blocked = sanitize_json_compatible(payload)
        self.assertEqual(sanitized["token"], "<redacted>")
        self.assertIn("<redacted:private-key>", sanitized["nested"]["private_key"])
        self.assertIn("json-secret-value", replacements)
        self.assertFalse(reasons)
        self.assertFalse(blocked)

    def test_does_not_over_redact_commit_sha(self) -> None:
        text = "commit=c78ad941b1e9034eef8d0a46e08f9d25be29a405\nbranch=infra/ai-forensics-autolog-20260712\n"
        result = sanitize_text(text)
        self.assertIn("c78ad941b1e9034eef8d0a46e08f9d25be29a405", result.text)

    def test_malformed_private_key_blocks(self) -> None:
        result = sanitize_text("-----BEGIN PRIVATE KEY-----\nabc\n")
        self.assertTrue(result.blocked)


class PackageTests(unittest.TestCase):
    def test_truncation_records_sha(self) -> None:
        text = "a" * (schema.MAX_TEXT_FILE_BYTES + 10)
        truncated, metadata = truncate_text("summary.json", text)
        self.assertIsNotNone(metadata)
        self.assertLessEqual(len(truncated.encode("utf-8")), schema.MAX_TEXT_FILE_BYTES)

    def test_build_package_files_contains_required_layout(self) -> None:
        manifest = schema.build_manifest(
            actor="CODEX",
            run_id=schema.generate_run_id("CODEX", "layout"),
            status="UPLOAD_PENDING",
            repository="samuray-games/AsyncScene",
            branch="infra/test",
            task_id="TASK-1",
        )
        files, _ = build_package_files(
            manifest=manifest,
            events=[{"event": "Stop"}],
            summary={"status": "ok"},
            git_evidence={"branch": "HEAD"},
            redaction_report={"blocked": False, "replacements": []},
        )
        for required in schema.REQUIRED_PACKAGE_FILES:
            self.assertIn(required, files)


class HookTests(unittest.TestCase):
    def test_normalize_hook_event(self) -> None:
        event = normalize_hook_event("PostToolUse", {"session_id": "s1", "tool_name": "exec"})
        self.assertEqual(event["sessionId"], "s1")
        self.assertEqual(event["toolName"], "exec")

    def test_capture_event_stages_stop_run(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            repo_root = root / "repo"
            repo_root.mkdir()
            self.assertTrue((repo_root).exists())
            spool_root = root / "spool"
            capture_event("SessionStart", {"session_id": "s1", "cwd": str(repo_root)}, repo_root, spool_root, launch_publisher=False)
            result = capture_event(
                "Stop",
                {"session_id": "s1", "cwd": str(repo_root), "last_assistant_message": "done"},
                repo_root,
                spool_root,
                launch_publisher=False,
            )
            self.assertTrue(Path(result["runDir"]).exists())


class PublishTests(unittest.TestCase):
    def test_strip_git_credentials(self) -> None:
        self.assertEqual(
            strip_remote_credentials("https://user:pass@example.com/repo.git"),
            "https://<redacted>@example.com/repo.git",
        )

    def test_stage_and_dry_run_publish(self) -> None:
        manifest = schema.build_manifest(
            actor="WORK",
            run_id=schema.generate_run_id("WORK", "dry-run"),
            status="UPLOAD_PENDING",
            repository="samuray-games/AsyncScene",
            branch="work/test",
            task_id="TASK-1",
        )
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            repo_root = root / "repo"
            repo_root.mkdir()
            run_dir = stage_run_package(
                manifest=manifest,
                events=[{"event": "Stop"}],
                summary={"status": "ok"},
                git_evidence={"branch": "HEAD"},
                redaction_report={"blocked": False, "replacements": []},
                spool_root=root / "spool",
            )
            metadata = publish_staged_run(run_dir, repo_root=repo_root, dry_run=True)
            self.assertTrue(metadata["dryRun"])

    def test_marker_strings_are_stable(self) -> None:
        self.assertEqual(schema.RUN_INDEX_MARKER, "<!-- AI_FORENSICS_RUN_V1 -->")
        self.assertEqual(schema.ANALYSIS_CURSOR_MARKER, "<!-- AI_FORENSICS_ANALYSIS_CURSOR_V1 -->")


if __name__ == "__main__":
    unittest.main()
