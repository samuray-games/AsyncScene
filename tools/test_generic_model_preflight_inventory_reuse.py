from __future__ import annotations

import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def preflight_repair_task() -> dict[str, object]:
    return {
        "taskId": "TASK-TEST-GENERIC-INVENTORY-REUSE",
        "taskType": "PLUGIN_POLICY",
        "objective": "repair the generic model preflight inventory handshake",
        "readScope": ["tools/run-asynchronia-model-preflight.py", "plugins/asynchronia"],
        "writeScope": ["tools/run-asynchronia-model-preflight.py"],
        "affectedSystems": ["selector", "preflight"],
        "runtimeSensitivity": "low",
        "architectureImpact": "low",
        "securityImpact": "low",
        "economyImpact": "low",
        "releaseImpact": "low",
        "validationComplexity": "medium",
        "expectedImplementationSize": "small",
        "ambiguityNovelty": "low",
        "concurrencyBranchRisk": "low",
    }


def run(*args: str, cwd: Path, check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(args, cwd=cwd, capture_output=True, text=True, check=check)


def attached_repo(root: Path) -> Path:
    repo = root / "repo"
    repo.mkdir()
    tracked_and_untracked = run(
        "git",
        "ls-files",
        "-co",
        "--exclude-standard",
        cwd=ROOT,
    ).stdout.splitlines()
    for relative in tracked_and_untracked:
        source = ROOT / relative
        target = repo / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
    run("git", "init", "-q", cwd=repo)
    run("git", "config", "user.name", "Generic Preflight Regression", cwd=repo)
    run("git", "config", "user.email", "generic-preflight-regression@local.invalid", cwd=repo)
    run("git", "add", ".", cwd=repo)
    run("git", "commit", "-qm", "generic preflight regression fixture", cwd=repo)
    run("git", "branch", "-M", "test/generic-preflight-inventory-reuse", cwd=repo)
    return repo


def run_cli(repo: Path, *args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, str(repo / "tools/run-asynchronia-model-preflight.py"), *args],
        cwd=repo,
        capture_output=True,
        text=True,
        check=False,
    )


class GenericModelPreflightHandshakeTests(unittest.TestCase):
    def test_real_generic_entrypoint_requires_full_two_phase_handshake(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            repo = attached_repo(root)
            task_file = root / "task.json"
            state_dir = root / "state"
            task_file.write_text(json.dumps(preflight_repair_task()), encoding="utf-8")

            start = run_cli(
                repo,
                "start",
                "--thread-id",
                "generic-inventory-reuse",
                "--task-file",
                str(task_file),
                "--baseline",
                "a" * 40,
                "--state-dir",
                str(state_dir),
            )

            self.assertEqual(start.returncode, 0, start.stderr or start.stdout)
            self.assertIn("status: WAITING_FOR_INVENTORY_CONFIRMATION", start.stdout)
            self.assertIn("complete authoritative inventory:", start.stdout)
            self.assertEqual(sum(line.startswith("- ") for line in start.stdout.splitlines()), 6)
            self.assertIn("model count: 6", start.stdout)
            self.assertIn("model-effort pair count: 29", start.stdout)
            for forbidden in (
                "evaluated pair count:", "evaluation matrix:", "required capability score:",
                "cheapest rejected pair:", "recommended pair:", "next more capable plausible pair:",
            ):
                self.assertNotIn(forbidden, start.stdout)
            self.assertIn("exact next response: INVENTORY_OK or INVENTORY_CHANGED", start.stdout)

            inspected = run_cli(
                repo,
                "inspect",
                "--thread-id",
                "generic-inventory-reuse",
                "--state-dir",
                str(state_dir),
            )
            self.assertEqual(inspected.returncode, 0, inspected.stderr or inspected.stdout)
            payload = json.loads(inspected.stdout.split("\n", 1)[1])
            self.assertEqual(payload["state"], "WAITING_FOR_INVENTORY_CONFIRMATION")
            self.assertIsNone(payload["inventoryConfirmedAt"])
            for forbidden in ("completeMatrixHash", "recommendation", "requiredCapabilityScore", "evaluatedPairCount"):
                self.assertNotIn(forbidden, payload)

            common = [
                "--thread-id", "generic-inventory-reuse",
                "--task-file", str(task_file),
                "--baseline", "a" * 40,
                "--state-dir", str(state_dir),
            ]
            early_continue = run_cli(repo, "continue", *common, "--token", "CONTINUE")
            self.assertNotEqual(early_continue.returncode, 0)
            self.assertIn("BLOCKED_MODEL_PREFLIGHT", early_continue.stderr)

            inventory_ok = run_cli(repo, "inventory-ok", *common)
            self.assertEqual(inventory_ok.returncode, 0, inventory_ok.stderr or inventory_ok.stdout)
            self.assertIn("status: WAITING_FOR_MODEL_SELECTION", inventory_ok.stdout)
            self.assertIn("evaluated pair count: 29/29", inventory_ok.stdout)
            self.assertEqual(sum(line.startswith("- ") for line in inventory_ok.stdout.splitlines()), 29)
            for required in (
                "required capability score:", "cheapest rejected pair:", "recommended pair:",
                "next more capable plausible pair:", "exact next response: CONTINUE",
            ):
                self.assertIn(required, inventory_ok.stdout)

            allowed = run_cli(repo, "continue", *common, "--token", "CONTINUE")
            self.assertEqual(allowed.returncode, 0, allowed.stderr or allowed.stdout)
            self.assertIn("status: IMPLEMENTATION_ALLOWED", allowed.stdout)

    def test_changed_or_invalid_snapshot_fails_closed_before_inventory_pause(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            repo = attached_repo(root)
            task_file = root / "task.json"
            state_dir = root / "state"
            bad_snapshot = root / "snapshot.json"
            task_file.write_text(json.dumps(preflight_repair_task()), encoding="utf-8")

            snapshot_path = repo / "plugins/asynchronia/snapshots/confirmed-model-effort-snapshot.json"
            snapshot = json.loads(snapshot_path.read_text(encoding="utf-8"))
            snapshot["canonicalContentHash"] = "sha256:" + ("0" * 64)
            bad_snapshot.write_text(json.dumps(snapshot), encoding="utf-8")

            result = run_cli(
                repo,
                "start",
                "--thread-id",
                "generic-invalid-inventory",
                "--task-file",
                str(task_file),
                "--baseline",
                "b" * 40,
                "--state-dir",
                str(state_dir),
                "--snapshot",
                str(bad_snapshot),
            )

            self.assertNotEqual(result.returncode, 0)
            self.assertIn("BLOCKED_MODEL_PREFLIGHT", result.stderr)
            self.assertNotIn("AUTO_REUSED_CANONICAL_SNAPSHOT", result.stdout)


if __name__ == "__main__":
    unittest.main()
