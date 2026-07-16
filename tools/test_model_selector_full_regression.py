from __future__ import annotations

import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / "tools/fixtures/test_model_selector_snapshot_1_0_13_full.py"


class FullSelectorRegressionTests(unittest.TestCase):
    def test_full_1_0_13_suite_runs_against_1_0_14_in_attached_clone(self) -> None:
        self.assertTrue(FIXTURE.exists(), "full selector regression fixture is missing")
        with tempfile.TemporaryDirectory(prefix="asynchronia-full-selector-regression-") as directory:
            repo = Path(directory) / "repo"
            subprocess.run(["git", "init", "-q", str(repo)], check=True, capture_output=True, text=True)
            subprocess.run(
                ["git", "-C", str(repo), "fetch", "-q", "--no-tags", str(ROOT), "HEAD"],
                check=True,
                capture_output=True,
                text=True,
            )
            subprocess.run(
                ["git", "-C", str(repo), "checkout", "-qb", "test/full-selector-regression", "FETCH_HEAD"],
                check=True,
                capture_output=True,
                text=True,
            )

            fixture = repo / "tools/fixtures/test_model_selector_snapshot_1_0_13_full.py"
            transformed = fixture.read_text(encoding="utf-8")
            transformed = transformed.replace(
                "from plugins.asynchronia.model_selector import (  # noqa: E402",
                "from plugins.asynchronia.model_selector_runtime import (  # noqa: E402",
                1,
            )
            transformed = transformed.replace('"1.0.13"', '"1.0.14"')
            transformed = transformed.replace("manifest version: 1.0.13", "manifest version: 1.0.14")
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
                "full legacy regression failed against 1.0.14\nSTDOUT:\n"
                + result.stdout
                + "\nSTDERR:\n"
                + result.stderr,
            )


if __name__ == "__main__":
    unittest.main()
