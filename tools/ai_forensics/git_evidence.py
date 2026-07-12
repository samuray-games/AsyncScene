"""Read-only git evidence collection."""

from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
import re
import subprocess
from typing import Any

from . import schema

MAX_OUTPUT_BYTES = 32768


def _timestamp() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def strip_remote_credentials(text: str) -> str:
    return re.sub(r"(https?://)([^/\s:@]+):([^/\s@]+)@", r"\1<redacted>@", text)


def run_git(repo_root: Path, args: list[str]) -> dict[str, Any]:
    completed = subprocess.run(
        ["git", *args],
        cwd=repo_root,
        text=True,
        capture_output=True,
        check=False,
    )
    stdout = strip_remote_credentials(completed.stdout[:MAX_OUTPUT_BYTES])
    stderr = strip_remote_credentials(completed.stderr[:MAX_OUTPUT_BYTES])
    return {
        "command": ["git", *args],
        "exitCode": completed.returncode,
        "stdout": stdout,
        "stderr": stderr,
        "observedAtUtc": _timestamp(),
    }


def collect_git_evidence(repo_root: str | Path, refs: list[str] | None = None) -> dict[str, Any]:
    root = Path(repo_root).resolve()
    refs = refs or []
    commands = [
        ["rev-parse", "--show-toplevel"],
        ["rev-parse", "--abbrev-ref", "HEAD"],
        ["rev-parse", "HEAD"],
        ["status", "--porcelain=v2", "--branch"],
        ["log", "--oneline", "--decorate", "-n", "5"],
        ["worktree", "list", "--porcelain"],
        ["remote", "-v"],
    ]
    commands.extend([["rev-parse", ref] for ref in refs])
    results = [run_git(root, args) for args in commands]
    branch = next((item["stdout"].strip() for item in results if item["command"][1:] == ["rev-parse", "--abbrev-ref", "HEAD"]), "HEAD")
    head = next((item["stdout"].strip() for item in results if item["command"][1:] == ["rev-parse", "HEAD"]), "")
    return {
        "observedAtUtc": _timestamp(),
        "repositoryRoot": str(root),
        "cwd": str(root),
        "branch": branch,
        "head": head,
        "refs": refs,
        "commands": results,
    }
