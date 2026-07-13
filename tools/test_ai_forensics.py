from __future__ import annotations

import json
import os
import subprocess
import tempfile
import threading
import unittest
from pathlib import Path
from unittest import mock

from tools.ai_forensics import schema
from tools.ai_forensics import codex_hook
from tools.ai_forensics import publish
from tools.ai_forensics.codex_hook import capture_event, normalize_hook_event
from tools.ai_forensics.git_evidence import strip_remote_credentials
from tools.ai_forensics.package import build_package_files, truncate_text
from tools.ai_forensics.publish import build_issue_comment, flush_pending, publish_staged_run, stage_run_package
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

    def test_redacts_standalone_tokens(self) -> None:
        text = (
            "sk-proj-abc1234567890abcdefABCDEF "
            "ghp_abcdefghijklmnopqrstuvwxyz123456 "
            "AKIA1234567890ABCDEF "
            "Bearer abcdefghijklmnopqrstuvwxyz123456"
        )
        result = sanitize_text(text)
        self.assertNotIn("sk-proj-", result.text)
        self.assertNotIn("ghp_", result.text)
        self.assertNotIn("AKIA1234567890ABCDEF", result.text)
        self.assertNotIn("abcdefghijklmnopqrstuvwxyz123456", result.text)


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

    def test_events_jsonl_is_one_parseable_object_per_line(self) -> None:
        manifest = schema.build_manifest(
            actor="CODEX",
            run_id=schema.generate_run_id("CODEX", "jsonl"),
            status="UPLOAD_PENDING",
            repository="samuray-games/AsyncScene",
            branch="infra/test",
            task_id="TASK-1",
        )
        files, _ = build_package_files(
            manifest=manifest,
            events=[{"event": "A", "n": 1}, {"event": "B", "n": 2}],
            summary={"status": "ok"},
            git_evidence={"branch": "HEAD"},
            redaction_report={"blocked": False, "replacements": []},
        )
        lines = files["events.jsonl"].decode("utf-8").splitlines()
        self.assertEqual(len(lines), 2)
        self.assertEqual([json.loads(line)["event"] for line in lines], ["A", "B"])

    def test_home_paths_removed_from_whole_package(self) -> None:
        manifest = schema.build_manifest(
            actor="CODEX",
            run_id=schema.generate_run_id("CODEX", "privacy"),
            status="UPLOAD_PENDING",
            repository="samuray-games/AsyncScene",
            branch="infra/test",
            task_id="TASK-1",
        )
        with tempfile.TemporaryDirectory() as directory:
            run_dir = stage_run_package(
                manifest=manifest,
                events=[{"event": "Stop", "cwd": "/Users/User/private"}],
                summary={"path": "/Users/User/private-summary"},
                git_evidence={"repositoryRoot": "/Users/User/private-git"},
                redaction_report={"blocked": False, "replacements": []},
                extras={"final-response.txt": "/Users/User/private-final"},
                spool_root=Path(directory),
            )
            for path in (run_dir / "package").rglob("*"):
                if path.is_file():
                    self.assertNotIn("/Users/User", path.read_text(encoding="utf-8"))

    def test_byte_extras_must_be_utf8(self) -> None:
        manifest = schema.build_manifest(
            actor="CODEX",
            run_id=schema.generate_run_id("CODEX", "bytes"),
            status="UPLOAD_PENDING",
            repository="samuray-games/AsyncScene",
            branch="infra/test",
            task_id="TASK-1",
        )
        with self.assertRaises(ValueError):
            build_package_files(
                manifest=manifest,
                events=[{"event": "Stop"}],
                summary={"status": "ok"},
                git_evidence={"branch": "HEAD"},
                redaction_report={"blocked": False, "replacements": []},
                extras={"binary.bin": b"\xff\xfe"},
            )


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

    def test_two_stop_events_create_distinct_turn_packages(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            repo_root = root / "repo"
            repo_root.mkdir()
            spool_root = root / "spool"
            capture_event("SessionStart", {"session_id": "s1", "cwd": str(repo_root)}, repo_root, spool_root, launch_publisher=False)
            first = capture_event("Stop", {"session_id": "s1", "cwd": str(repo_root), "last_assistant_message": "one"}, repo_root, spool_root, launch_publisher=False)
            second = capture_event("Stop", {"session_id": "s1", "cwd": str(repo_root), "last_assistant_message": "two"}, repo_root, spool_root, launch_publisher=False)
            self.assertNotEqual(first["runDir"], second["runDir"])
            first_manifest = json.loads((Path(first["runDir"]) / "package" / "manifest.json").read_text(encoding="utf-8"))
            second_manifest = json.loads((Path(second["runDir"]) / "package" / "manifest.json").read_text(encoding="utf-8"))
            self.assertNotEqual(first_manifest["packagePath"], second_manifest["packagePath"])

    def test_stop_stages_before_publisher_launch(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            repo_root = root / "repo"
            repo_root.mkdir()
            spool_root = root / "spool"
            observed: list[bool] = []

            def fake_launch(_repo_root: Path) -> None:
                observed.append(any((spool_root / "runs").glob("*/package/manifest.json")))

            with mock.patch.object(codex_hook, "_launch_detached_publisher", side_effect=fake_launch):
                capture_event("SessionStart", {"session_id": "s1"}, repo_root, spool_root, launch_publisher=False)
                capture_event("Stop", {"session_id": "s1", "last_assistant_message": "done"}, repo_root, spool_root, launch_publisher=True)
            self.assertEqual(observed, [True])

    def test_concurrent_hook_events_preserve_valid_jsonl(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            repo_root = root / "repo"
            repo_root.mkdir()
            spool_root = root / "spool"
            capture_event("SessionStart", {"session_id": "s1"}, repo_root, spool_root, launch_publisher=False)

            def worker(index: int) -> None:
                capture_event("PostToolUse", {"session_id": "s1", "tool_name": f"tool-{index}"}, repo_root, spool_root, launch_publisher=False)

            threads = [threading.Thread(target=worker, args=(index,)) for index in range(20)]
            for thread in threads:
                thread.start()
            for thread in threads:
                thread.join()
            events_path = spool_root / "sessions" / "s1" / "events.raw.jsonl"
            lines = events_path.read_text(encoding="utf-8").splitlines()
            self.assertEqual(len(lines), 21)
            for line in lines:
                self.assertIsInstance(json.loads(line), dict)


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

    def test_redaction_blocked_run_is_not_published_or_commented(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            repo_root = root / "repo"
            repo_root.mkdir()
            spool_root = root / "spool"
            capture_event("SessionStart", {"session_id": "s1"}, repo_root, spool_root, launch_publisher=False)
            capture_event("Stop", {"session_id": "s1", "last_assistant_message": "-----BEGIN PRIVATE KEY-----\nabc\n"}, repo_root, spool_root, launch_publisher=False)
            with mock.patch.object(publish, "publish_staged_run") as mocked_publish:
                results = flush_pending(repo_root=repo_root, spool_root=spool_root)
            self.assertEqual(len(results), 1)
            self.assertEqual(results[0]["state"], "UPLOAD_BLOCKED_REDACTION_FAIL")
            mocked_publish.assert_not_called()

    def test_comment_failure_retry_does_not_recommit_or_duplicate(self) -> None:
        manifest = schema.build_manifest(
            actor="WORK",
            run_id=schema.generate_run_id("WORK", "retry"),
            status="UPLOAD_PENDING",
            repository="samuray-games/AsyncScene",
            branch="forensics/ai-runs",
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
            with (
                mock.patch.object(publish, "_origin_url", return_value="https://github.com/samuray-games/AsyncScene.git"),
                mock.patch.object(publish, "_prepare_publication_repo", side_effect=lambda temp, _origin, _branch: temp),
                mock.patch.object(publish, "_copy_package"),
                mock.patch.object(publish, "_commit_package", return_value="commit-one") as mocked_commit,
                mock.patch.object(publish, "_push_package", return_value=(True, "")),
                mock.patch.object(publish, "_verify_remote_package"),
                mock.patch.object(publish, "_find_existing_index_comment", return_value=(None, None)),
                mock.patch.object(publish, "_post_issue_comment", side_effect=RuntimeError("comment failed")),
            ):
                with self.assertRaises(RuntimeError):
                    publish_staged_run(run_dir, repo_root=repo_root)
                self.assertEqual(mocked_commit.call_count, 1)
            metadata = json.loads((run_dir / "metadata.json").read_text(encoding="utf-8"))
            self.assertEqual(metadata["state"], "PACKAGE_UPLOADED_COMMENT_PENDING")

            with (
                mock.patch.object(publish, "_origin_url", return_value="https://github.com/samuray-games/AsyncScene.git"),
                mock.patch.object(publish, "_prepare_publication_repo", side_effect=lambda temp, _origin, _branch: temp),
                mock.patch.object(publish, "_verify_remote_package"),
                mock.patch.object(publish, "_commit_package") as mocked_commit_again,
                mock.patch.object(publish, "_find_existing_index_comment", return_value=(None, None)),
                mock.patch.object(publish, "_post_issue_comment", return_value=(123, "https://example.invalid/comment/123")),
            ):
                retry = publish_staged_run(run_dir, repo_root=repo_root)
            mocked_commit_again.assert_not_called()
            self.assertEqual(retry["state"], "UPLOAD_COMPLETE_INDEXED")
            self.assertEqual(retry["commentId"], 123)

    def test_actions_auth_setup_does_not_print_or_store_raw_token(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            repo = Path(directory)
            subprocess.run(["git", "init"], cwd=repo, check=True, capture_output=True)
            configured = publish._configure_actions_auth(
                repo,
                "https://github.com/samuray-games/AsyncScene.git",
                {"GITHUB_TOKEN": "fake-token-for-test"},
            )
            self.assertTrue(configured)
            config = (repo / ".git" / "config").read_text(encoding="utf-8")
            self.assertNotIn("fake-token-for-test", config)

    def test_issue_comment_contains_required_index_evidence(self) -> None:
        manifest = schema.build_manifest(
            actor="CODEX",
            run_id=schema.generate_run_id("CODEX", "comment"),
            status="UPLOAD_COMPLETE_INDEXED",
            repository="samuray-games/AsyncScene",
            branch="infra/test",
            task_id="TASK-1",
        )
        body = build_issue_comment(
            {
                "manifest": manifest,
                "sourceBranch": "infra/test",
                "sourceSha": "before-sha",
                "resultSha": "after-sha",
                "packageCommit": "package-sha",
                "state": "UPLOAD_COMPLETE_INDEXED",
                "observedResult": "remote package verified and index comment created",
            }
        )
        self.assertIn("sourceSha: before-sha", body)
        self.assertIn("resultSha: after-sha", body)
        self.assertIn("observedResult: remote package verified", body)

    def test_marker_strings_are_stable(self) -> None:
        self.assertEqual(schema.RUN_INDEX_MARKER, "<!-- AI_FORENSICS_RUN_V1 -->")
        self.assertEqual(schema.ANALYSIS_CURSOR_MARKER, "<!-- AI_FORENSICS_ANALYSIS_CURSOR_V1 -->")


if __name__ == "__main__":
    unittest.main()
