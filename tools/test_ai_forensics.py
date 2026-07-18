from __future__ import annotations

import json
import os
import subprocess
import tempfile
import threading
import unittest
from pathlib import Path
from typing import Any
from unittest import mock

from tools.ai_forensics import schema
from tools.ai_forensics import codex_hook
from tools.ai_forensics import github_event
from tools.ai_forensics import publish
from tools.ai_forensics import public_surface_audit
from tools.ai_forensics.codex_hook import capture_event, normalize_hook_event
from tools.ai_forensics.git_evidence import strip_remote_credentials
from tools.ai_forensics.package import build_package_files, truncate_text
from tools.ai_forensics.publish import build_issue_comment, flush_pending, publish_staged_run, stage_run_package
from tools.ai_forensics.redact import scan_text_for_private_content, sanitize_json_compatible, sanitize_text


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

    def test_redacts_foreign_machine_home_paths(self) -> None:
        samples = (
            "/Users/foreign_mac_fixture/project/file",
            "/home/foreign_linux_fixture/project/file",
            "/root/private/file",
            r"C:\Users\foreign_windows_fixture\project\file",
            "C:/Users/foreign_windows_fixture/project/file",
        )
        for sample in samples:
            result = sanitize_text(sample)
            self.assertIn("<HOME>", result.text)
            self.assertIn("home-path", result.replacements)
            self.assertEqual(scan_text_for_private_content(sample), ["home-path"])

    def test_sanitizes_nested_home_paths_and_preserves_safe_suffix(self) -> None:
        payload = {
            "json": {"path": "/Users/foreign_json_fixture/summary.json"},
            "array": ["/home/foreign_array_fixture/events.jsonl"],
            "event": {"cwd": r"C:\Users\foreign_event_fixture\run"},
            "summary": "C:/Users/foreign_summary_fixture/report.txt",
            "gitEvidence": {"repositoryRoot": "/root/foreign_git_fixture/repo"},
            "textExtra": "https://example.com/public and /Users/foreign_text_fixture/final.txt",
        }
        sanitized, _replacements, _reasons, blocked = sanitize_json_compatible(payload)
        rendered = json.dumps(sanitized)
        self.assertFalse(blocked)
        self.assertEqual(rendered.count("<HOME>"), 6)
        self.assertNotIn("foreign_json_fixture", rendered)
        self.assertIn("<HOME>/summary.json", rendered)
        self.assertIn("https://example.com/public", rendered)

    def test_home_scanner_has_no_false_positives(self) -> None:
        clean = "repo/Users/foreign/path https://example.com/Users/foreign/path commit=c78ad941b1e9034eef8d0a46e08f9d25be29a405"
        self.assertEqual(scan_text_for_private_content(clean), [])


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

    def test_over_limit_jsonl_remains_line_valid_and_bounded(self) -> None:
        manifest = schema.build_manifest(
            actor="CODEX",
            run_id=schema.generate_run_id("CODEX", "jsonl-bounded"),
            status="UPLOAD_PENDING",
            repository="samuray-games/AsyncScene",
            branch="infra/test",
            task_id="TASK-1",
        )
        huge_event = {"event": "Stop", "payload": "x" * (schema.MAX_TEXT_FILE_BYTES + 1024)}
        repeated_event = {"event": "Tool", "payload": "y" * 1_100_000}
        files, truncations = build_package_files(
            manifest=manifest,
            events=[huge_event, repeated_event, repeated_event],
            summary={"status": "ok"},
            git_evidence={"branch": "HEAD"},
            redaction_report={"blocked": False, "replacements": []},
        )
        self.assertLessEqual(len(files["events.jsonl"]), schema.MAX_TEXT_FILE_BYTES)
        lines = files["events.jsonl"].decode("utf-8").splitlines()
        parsed = [json.loads(line) for line in lines]
        self.assertTrue(parsed[0]["truncated"])
        self.assertEqual(parsed[0]["kind"], "oversize-event")
        self.assertEqual(parsed[-1]["kind"], "omitted-events-tail")
        self.assertTrue(any(item["path"] == "events.jsonl" for item in truncations))

    def test_over_limit_json_payloads_remain_valid_json_and_bounded(self) -> None:
        manifest = schema.build_manifest(
            actor="CODEX",
            run_id=schema.generate_run_id("CODEX", "json-bounded"),
            status="UPLOAD_PENDING",
            repository="samuray-games/AsyncScene",
            branch="infra/test",
            task_id="TASK-1",
        )
        files, truncations = build_package_files(
            manifest=manifest,
            events=[{"event": "Stop"}],
            summary={"blob": "s" * (schema.MAX_TEXT_FILE_BYTES + 4096)},
            git_evidence={"blob": "g" * (schema.MAX_TEXT_FILE_BYTES + 4096)},
            redaction_report={"blocked": False, "replacements": []},
            extras={"event.json": {"blob": "e" * (schema.MAX_TEXT_FILE_BYTES + 4096)}},
        )
        for path in ("summary.json", "git-evidence.json", "event.json"):
            self.assertLessEqual(len(files[path]), schema.MAX_TEXT_FILE_BYTES)
            payload = json.loads(files[path].decode("utf-8"))
            self.assertTrue(payload["truncated"])
            self.assertEqual(payload["path"], path)
        truncated_paths = {item["path"] for item in truncations}
        self.assertIn("summary.json", truncated_paths)
        self.assertIn("git-evidence.json", truncated_paths)
        self.assertIn("event.json", truncated_paths)

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
                events=[{"event": "Stop", "cwd": "/Users/foreign_package_fixture/private"}],
                summary={"path": "/Users/foreign_package_fixture/private-summary"},
                git_evidence={"repositoryRoot": "/Users/foreign_package_fixture/private-git"},
                redaction_report={"blocked": False, "replacements": []},
                extras={"final-response.txt": "/Users/foreign_package_fixture/private-final"},
                spool_root=Path(directory),
            )
            for path in (run_dir / "package").rglob("*"):
                if path.is_file():
                    self.assertNotIn("/Users/foreign_package_fixture", path.read_text(encoding="utf-8"))

    def test_final_scan_rejects_supported_home_path_that_survives(self) -> None:
        manifest = schema.build_manifest(
            actor="CODEX",
            run_id=schema.generate_run_id("CODEX", "foreign-home-final-scan"),
            status="UPLOAD_PENDING",
            repository="samuray-games/AsyncScene",
            branch="infra/test",
            task_id="TASK-1",
        )
        with self.assertRaisesRegex(ValueError, "private content scan failed"):
            build_package_files(
                manifest=manifest,
                events=[{"event": "Stop"}],
                summary={"status": "ok"},
                git_evidence={"branch": "HEAD"},
                redaction_report={"blocked": False, "replacements": []},
                extras={"final-response.txt": "/home/foreign_survivor_fixture/private"},
            )

    def test_final_scan_secret_fixture_creates_blocked_metadata_without_package(self) -> None:
        manifest = schema.build_manifest(
            actor="CODEX",
            run_id=schema.generate_run_id("CODEX", "final-scan"),
            status="UPLOAD_PENDING",
            repository="samuray-games/AsyncScene",
            branch="infra/test",
            task_id="TASK-1",
        )
        with tempfile.TemporaryDirectory() as directory:
            run_dir = stage_run_package(
                manifest=manifest,
                events=[{"event": "Stop"}],
                summary={"status": "ok"},
                git_evidence={"branch": "HEAD"},
                redaction_report={"blocked": False, "replacements": []},
                extras={"final-response.txt": "-----END PRIVATE KEY-----"},
                spool_root=Path(directory),
            )
            metadata = json.loads((run_dir / "metadata.json").read_text(encoding="utf-8"))
            self.assertEqual(metadata["state"], "UPLOAD_BLOCKED_REDACTION_FAIL")
            self.assertEqual(metadata["redactionStatus"], "BLOCKED_FINAL_SCAN")
            self.assertIn("private content scan failed", metadata["failure"])
            self.assertFalse((run_dir / "package").exists())

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


class PublicSurfaceAuditTests(unittest.TestCase):
    def _git(self, repo: Path, *args: str) -> str:
        result = subprocess.run(
            ["git", *args], cwd=repo, text=True, capture_output=True, check=True
        )
        return result.stdout.strip()

    def _new_repo(self, content: str | None) -> tuple[Path, str | None]:
        directory = tempfile.TemporaryDirectory()
        repo = Path(directory.name)
        self.addCleanup(directory.cleanup)
        self._git(repo, "init", "--quiet")
        self._git(repo, "config", "user.name", "Synthetic Audit")
        self._git(repo, "config", "user.email", "audit@example.invalid")
        if content is None:
            return repo, None
        (repo / "evidence.txt").write_text(content, encoding="utf-8")
        self._git(repo, "add", "evidence.txt")
        self._git(repo, "commit", "--quiet", "-m", "synthetic evidence")
        return repo, self._git(repo, "rev-parse", "HEAD")

    def test_audit_finds_historical_home_path_without_raw_content(self) -> None:
        private_path = "/Users/audit_historical_fixture/private"
        repo, commit_sha = self._new_repo(private_path + "\n")
        assert commit_sha is not None
        blob_sha = self._git(repo, "rev-parse", "HEAD:evidence.txt")
        findings = public_surface_audit.audit_refs(repo, ["HEAD"])
        self.assertEqual(len(findings), 1)
        finding = findings[0]
        self.assertEqual(finding.category, "home-path")
        self.assertEqual(finding.commit_sha, commit_sha)
        self.assertEqual(finding.blob_sha, blob_sha)
        self.assertEqual(finding.path, "evidence.txt")
        self.assertEqual(finding.line, 1)
        rendered = json.dumps([item.as_dict() for item in findings], sort_keys=True)
        self.assertNotIn(private_path, rendered)
        self.assertTrue(finding.fingerprint.startswith("sha256:"))

    def test_audit_deduplicates_same_blob_across_commits_and_refs(self) -> None:
        repo, commit_sha = self._new_repo("/home/audit_duplicate_fixture/private\n")
        assert commit_sha is not None
        self._git(repo, "branch", "duplicate-ref", commit_sha)
        findings = public_surface_audit.audit_refs(repo, ["HEAD", "duplicate-ref"])
        self.assertEqual(len(findings), 1)
        self.assertEqual(findings[0].commit_sha, commit_sha)

    def test_audit_cli_returns_nonzero_and_never_prints_raw_content(self) -> None:
        private_path = "C:/Users/audit_cli_fixture/private"
        repo, _commit_sha = self._new_repo(private_path + "\n")
        result = subprocess.run(
            [
                "python3",
                str(Path(__file__).with_name("ai_forensics") / "public_surface_audit.py"),
                "--repo",
                str(repo),
                "--ref",
                "HEAD",
                "--json",
            ],
            cwd=Path(__file__).parents[1],
            text=True,
            capture_output=True,
            check=False,
        )
        self.assertEqual(result.returncode, 1)
        self.assertNotIn(private_path, result.stdout)
        self.assertIn('"category": "home-path"', result.stdout)

    def test_clean_audit_returns_zero(self) -> None:
        repo, _commit_sha = self._new_repo("repo/Users/ordinary/path https://example.com/Users/ordinary/path\n")
        findings = public_surface_audit.audit_refs(repo, ["HEAD"])
        self.assertEqual(findings, [])


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
            capture_event(
                "PostToolUse",
                {"session_id": "s1", "cwd": str(repo_root), "tool_name": "marker-one"},
                repo_root,
                spool_root,
                launch_publisher=False,
            )
            first = capture_event(
                "Stop",
                {"session_id": "s1", "cwd": str(repo_root), "last_assistant_message": "one"},
                repo_root,
                spool_root,
                launch_publisher=False,
            )
            capture_event(
                "PostToolUse",
                {"session_id": "s1", "cwd": str(repo_root), "tool_name": "marker-two"},
                repo_root,
                spool_root,
                launch_publisher=False,
            )
            second = capture_event(
                "Stop",
                {"session_id": "s1", "cwd": str(repo_root), "last_assistant_message": "two"},
                repo_root,
                spool_root,
                launch_publisher=False,
            )
            self.assertNotEqual(first["runDir"], second["runDir"])
            first_manifest = json.loads((Path(first["runDir"]) / "package" / "manifest.json").read_text(encoding="utf-8"))
            second_manifest = json.loads((Path(second["runDir"]) / "package" / "manifest.json").read_text(encoding="utf-8"))
            self.assertNotEqual(first_manifest["packagePath"], second_manifest["packagePath"])
            first_final = (Path(first["runDir"]) / "package" / "final-response.txt").read_text(encoding="utf-8")
            second_final = (Path(second["runDir"]) / "package" / "final-response.txt").read_text(encoding="utf-8")
            self.assertEqual(first_final, "one")
            self.assertEqual(second_final, "two")
            first_events = (Path(first["runDir"]) / "package" / "events.jsonl").read_text(encoding="utf-8")
            second_events = (Path(second["runDir"]) / "package" / "events.jsonl").read_text(encoding="utf-8")
            self.assertIn("marker-one", first_events)
            self.assertNotIn("marker-two", first_events)
            self.assertIn("marker-two", second_events)
            self.assertNotIn("marker-one", second_events)
            self.assertNotIn('"finalAssistantMessage":"one"', second_events)

    def test_event_boundaries_survive_restart_between_turns(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            repo_root = root / "repo"
            repo_root.mkdir()
            spool_root = root / "spool"
            capture_event("SessionStart", {"session_id": "s1", "cwd": str(repo_root)}, repo_root, spool_root, launch_publisher=False)
            first = capture_event(
                "Stop",
                {"session_id": "s1", "cwd": str(repo_root), "last_assistant_message": "one"},
                repo_root,
                spool_root,
                launch_publisher=False,
            )
            session_json = json.loads((spool_root / "sessions" / "s1" / "session.json").read_text(encoding="utf-8"))
            self.assertEqual(session_json["nextEventIndex"], 2)

            capture_event(
                "PostToolUse",
                {"session_id": "s1", "cwd": str(repo_root), "tool_name": "marker-after-restart"},
                repo_root,
                spool_root,
                launch_publisher=False,
            )
            second = capture_event(
                "Stop",
                {"session_id": "s1", "cwd": str(repo_root), "last_assistant_message": "two"},
                repo_root,
                spool_root,
                launch_publisher=False,
            )
            first_summary = json.loads((Path(first["runDir"]) / "package" / "summary.json").read_text(encoding="utf-8"))
            second_summary = json.loads((Path(second["runDir"]) / "package" / "summary.json").read_text(encoding="utf-8"))
            self.assertEqual(first_summary["sessionEventWindow"], "0:2")
            self.assertEqual(second_summary["sessionEventWindow"], "2:4")
            self.assertEqual(second_summary["turnSequence"], 2)

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
                mock.patch.object(
                    publish,
                    "_prepare_publication_repo",
                    side_effect=lambda temp, _origin, _branch, bootstrap_repo=None: temp,
                ),
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
                mock.patch.object(
                    publish,
                    "_prepare_publication_repo",
                    side_effect=lambda temp, _origin, _branch, bootstrap_repo=None: temp,
                ),
                mock.patch.object(publish, "_verify_remote_package"),
                mock.patch.object(publish, "_commit_package") as mocked_commit_again,
                mock.patch.object(publish, "_find_existing_index_comment", return_value=(None, None)),
                mock.patch.object(publish, "_post_issue_comment", return_value=(123, "https://example.invalid/comment/123")),
            ):
                retry = publish_staged_run(run_dir, repo_root=repo_root)
            mocked_commit_again.assert_not_called()
            self.assertEqual(retry["state"], "UPLOAD_COMPLETE_INDEXED")
            self.assertEqual(retry["commentId"], 123)

    def test_concurrent_publishers_converge_on_one_commit_and_comment(self) -> None:
        manifest = schema.build_manifest(
            actor="WORK",
            run_id=schema.generate_run_id("WORK", "concurrent"),
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
                git_evidence={"branch": "HEAD", "head": "a" * 40},
                redaction_report={"blocked": False, "replacements": []},
                spool_root=root / "spool",
            )
            results: list[dict[str, Any]] = []
            with (
                mock.patch.object(publish, "_origin_url", return_value="https://github.com/samuray-games/AsyncScene.git"),
                mock.patch.object(
                    publish,
                    "_prepare_publication_repo",
                    side_effect=lambda temp, _origin, _branch, bootstrap_repo=None: temp,
                ),
                mock.patch.object(publish, "_remote_package_commit_if_identical", return_value=None),
                mock.patch.object(publish, "_copy_package"),
                mock.patch.object(publish, "_commit_package", return_value="commit-one") as mocked_commit,
                mock.patch.object(publish, "_push_package", return_value=(True, "")),
                mock.patch.object(publish, "_verify_remote_package"),
                mock.patch.object(publish, "_find_existing_index_comment", return_value=(None, None)),
                mock.patch.object(publish, "_post_issue_comment", return_value=(123, "https://example.invalid/comment/123")) as mocked_comment,
            ):
                threads = [
                    threading.Thread(target=lambda: results.append(publish_staged_run(run_dir, repo_root=repo_root))),
                    threading.Thread(target=lambda: results.append(publish_staged_run(run_dir, repo_root=repo_root))),
                ]
                for thread in threads:
                    thread.start()
                for thread in threads:
                    thread.join()
            self.assertEqual(mocked_commit.call_count, 1)
            self.assertEqual(mocked_comment.call_count, 1)
            self.assertEqual(len(results), 2)
            self.assertTrue(all(result["state"] == "UPLOAD_COMPLETE_INDEXED" for result in results))

    def test_remote_identical_package_is_recovered_without_commit(self) -> None:
        manifest = schema.build_manifest(
            actor="WORK",
            run_id=schema.generate_run_id("WORK", "recovered"),
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
                git_evidence={"branch": "HEAD", "head": "b" * 40},
                redaction_report={"blocked": False, "replacements": []},
                spool_root=root / "spool",
            )
            with (
                mock.patch.object(publish, "_origin_url", return_value="https://github.com/samuray-games/AsyncScene.git"),
                mock.patch.object(
                    publish,
                    "_prepare_publication_repo",
                    side_effect=lambda temp, _origin, _branch, bootstrap_repo=None: temp,
                ),
                mock.patch.object(publish, "_remote_package_commit_if_identical", return_value="existing-commit") as mocked_remote,
                mock.patch.object(publish, "_commit_package") as mocked_commit,
                mock.patch.object(publish, "_verify_remote_package"),
                mock.patch.object(publish, "_find_existing_index_comment", return_value=(None, None)),
                mock.patch.object(publish, "_post_issue_comment", return_value=(123, "https://example.invalid/comment/123")),
            ):
                metadata = publish_staged_run(run_dir, repo_root=repo_root)
            mocked_commit.assert_not_called()
            self.assertTrue(mocked_remote.called)
            self.assertEqual(metadata["packageCommit"], "existing-commit")
            self.assertEqual(metadata["commentId"], 123)
            self.assertIn("existing remote package verified", metadata["observedResult"])

    def test_non_fast_forward_retry_refreshes_from_live_remote(self) -> None:
        manifest = schema.build_manifest(
            actor="WORK",
            run_id=schema.generate_run_id("WORK", "nff-refresh"),
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
                git_evidence={"branch": "HEAD", "head": "c" * 40},
                redaction_report={"blocked": False, "replacements": []},
                spool_root=root / "spool",
            )
            bootstrap_args: list[Path | None] = []

            def fake_prepare(temp: Path, _origin: str, _branch: str, bootstrap_repo: Path | None = None) -> Path:
                bootstrap_args.append(bootstrap_repo)
                return temp

            with (
                mock.patch.object(publish, "_origin_url", return_value="https://github.com/samuray-games/AsyncScene.git"),
                mock.patch.object(publish, "_prepare_publication_repo", side_effect=fake_prepare),
                mock.patch.object(publish, "_remote_package_commit_if_identical", return_value=None),
                mock.patch.object(publish, "_copy_package"),
                mock.patch.object(publish, "_commit_package", return_value="commit-one"),
                mock.patch.object(publish, "_push_package", side_effect=[(False, "NON_FAST_FORWARD"), (True, "")]),
                mock.patch.object(publish, "_verify_remote_package"),
                mock.patch.object(publish, "_find_existing_index_comment", return_value=(None, None)),
                mock.patch.object(publish, "_post_issue_comment", return_value=(123, "https://example.invalid/comment/123")),
            ):
                metadata = publish_staged_run(run_dir, repo_root=repo_root)
            self.assertEqual(bootstrap_args, [repo_root, None])
            self.assertEqual(metadata["state"], "UPLOAD_COMPLETE_INDEXED")

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

    def test_github_push_record_populates_source_and_result_sha(self) -> None:
        manifest, events, summary, extras, metadata_updates = github_event.build_record(
            "push",
            {
                "before": "1111111111111111111111111111111111111111",
                "after": "2222222222222222222222222222222222222222",
                "inputs": {"task_id": "TASK-1"},
            },
            {
                "GITHUB_REPOSITORY": "samuray-games/AsyncScene",
                "GITHUB_REF_NAME": "infra/ai-forensics-autolog-20260712",
                "GITHUB_RUN_ID": "42",
                "GITHUB_SHA": "3333333333333333333333333333333333333333",
            },
        )
        self.assertEqual(events[0]["event"], "push")
        self.assertEqual(summary["sourceSha"], "1111111111111111111111111111111111111111")
        self.assertEqual(summary["resultSha"], "2222222222222222222222222222222222222222")
        self.assertEqual(metadata_updates["sourceShaSemantics"], "push.before")
        self.assertEqual(metadata_updates["resultShaSemantics"], "push.after")
        self.assertEqual(manifest["taskId"], "TASK-1")
        self.assertIn("payload", extras)

    def test_flush_pending_preserves_comment_pending_after_comment_failure(self) -> None:
        manifest = schema.build_manifest(
            actor="WORK",
            run_id=schema.generate_run_id("WORK", "pending"),
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
            with mock.patch.object(
                publish,
                "publish_staged_run",
                side_effect=RuntimeError("comment failed"),
            ):
                metadata_path = run_dir / "metadata.json"
                metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
                metadata["packageCommit"] = "commit-one"
                metadata["state"] = "PACKAGE_UPLOADED_COMMENT_PENDING"
                metadata["manifest"]["status"] = "PACKAGE_UPLOADED_COMMENT_PENDING"
                metadata_path.write_text(json.dumps(metadata), encoding="utf-8")
                results = flush_pending(repo_root=repo_root, spool_root=root / "spool")
            self.assertEqual(results[0]["state"], "PACKAGE_UPLOADED_COMMENT_PENDING")
            self.assertEqual(results[0]["failure"], "comment failed")

    def test_marker_strings_are_stable(self) -> None:
        self.assertEqual(schema.RUN_INDEX_MARKER, "<!-- AI_FORENSICS_RUN_V1 -->")
        self.assertEqual(schema.ANALYSIS_CURSOR_MARKER, "<!-- AI_FORENSICS_ANALYSIS_CURSOR_V1 -->")


if __name__ == "__main__":
    unittest.main()
