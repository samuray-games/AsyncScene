from __future__ import annotations

import io
import os
import subprocess
import sys
import tarfile
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CANONICAL_TEST = ROOT / "tools/test_model_selector_snapshot.py"


def run(*args: str, cwd: Path, check: bool = True) -> subprocess.CompletedProcess:
    return subprocess.run(args, cwd=cwd, check=check, capture_output=True)


class FullSelectorRegressionTests(unittest.TestCase):
    def test_full_1_0_13_suite_runs_against_1_0_14_in_attached_clone(self) -> None:
        self.assertTrue(CANONICAL_TEST.exists(), "canonical full selector regression is missing")
        with tempfile.TemporaryDirectory(prefix="asynchronia-full-selector-regression-") as directory:
            repo = Path(directory) / "repo"
            repo.mkdir()

            archive = run("git", "archive", "--format=tar", "HEAD", cwd=ROOT)
            with tarfile.open(fileobj=io.BytesIO(archive.stdout), mode="r:") as payload:
                payload.extractall(repo, filter="data")

            run("git", "init", "-q", cwd=repo)
            run("git", "config", "user.name", "Selector Regression", cwd=repo)
            run("git", "config", "user.email", "selector-regression@local.invalid", cwd=repo)
            run("git", "add", ".", cwd=repo)
            run("git", "commit", "-qm", "full selector regression fixture", cwd=repo)
            run("git", "branch", "-M", "test/full-selector-regression", cwd=repo)

            canonical = repo / "tools/test_model_selector_snapshot.py"
            transformed = canonical.read_text(encoding="utf-8")
            transformed = transformed.replace(
                "from plugins.asynchronia.model_selector import (  # noqa: E402",
                "from plugins.asynchronia.model_selector_runtime import (  # noqa: E402",
                1,
            )
            transformed = transformed.replace('"1.0.13"', '"1.0.14"')
            transformed = transformed.replace("manifest version: 1.0.13", "manifest version: 1.0.14")
            transformed = transformed.replace("INSTALLED_PLUGIN_VERSION: 1.0.8", "INSTALLED_PLUGIN_VERSION: 1.0.13")
            transformed = transformed.replace('self.assertIn("1.0.8", project_memory)', 'self.assertIn("1.0.13", project_memory)')
            target = repo / "tools/test_model_selector_snapshot_legacy_runtime.py"
            target.write_text(transformed, encoding="utf-8")

            env = dict(os.environ)
            env["PYTHONDONTWRITEBYTECODE"] = "1"
            env.pop("ASYNCHRONIA_SELECTOR_STATE_DIR", None)
            result = subprocess.run(
                [sys.executable, "-m", "unittest", "tools.test_model_selector_snapshot_legacy_runtime"],
                cwd=repo,
                env=env,
                capture_output=True,
                text=True,
                check=False,
            )
            self.assertEqual(
                result.returncode,
                0,
                "full canonical selector regression failed against 1.0.14\nSTDOUT:\n"
                + result.stdout
                + "\nSTDERR:\n"
                + result.stderr,
            )


if __name__ == "__main__":
    unittest.main()
