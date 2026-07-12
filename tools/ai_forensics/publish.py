"""Stage and publish immutable AI forensics packages."""

from __future__ import annotations

from argparse import ArgumentParser
from datetime import datetime, timezone
from pathlib import Path
import json
import os
import shutil
import subprocess
import sys
import tempfile
from typing import Any

if __package__ in {None, ""}:
    sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
    from tools.ai_forensics import package as package_builder  # type: ignore[import-not-found]
    from tools.ai_forensics import schema  # type: ignore[import-not-found]
else:
    from . import package as package_builder
    from . import schema

DEFAULT_REPO = "samuray-games/AsyncScene"
DEFAULT_BRANCH = "forensics/ai-runs"


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def default_spool_root() -> Path:
    codex_home = os.environ.get("CODEX_HOME")
    if codex_home:
        return Path(codex_home).expanduser() / "forensics-spool"
    return Path.home() / ".codex" / "forensics-spool"


def _write_json(path: Path, payload: Any) -> None:
    path.write_text(schema.deterministic_json_dumps(payload), encoding="utf-8")


def _read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def stage_run_package(
    *,
    manifest: dict[str, Any],
    events: list[dict[str, Any]],
    summary: dict[str, Any],
    git_evidence: dict[str, Any],
    redaction_report: dict[str, Any],
    extras: dict[str, Any] | None = None,
    spool_root: Path | None = None,
    repository: str = DEFAULT_REPO,
    branch: str = DEFAULT_BRANCH,
    issue_number: int = schema.RUN_INDEX_ISSUE,
) -> Path:
    errors = schema.validate_manifest(manifest)
    if errors:
        raise ValueError("; ".join(errors))

    spool_root = spool_root or default_spool_root()
    run_dir = spool_root / "runs" / manifest["runId"]
    package_dir = run_dir / "package"
    package_dir.mkdir(parents=True, exist_ok=True)

    files, truncations = package_builder.build_package_files(
        manifest=manifest,
        events=events,
        summary=summary,
        git_evidence=git_evidence,
        redaction_report=redaction_report,
        extras=extras,
    )

    for relative_path, content in files.items():
        target = package_dir / relative_path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(content)

    metadata = {
        "repository": repository,
        "branch": branch,
        "issueNumber": issue_number,
        "manifest": manifest,
        "truncations": truncations,
        "state": "UPLOAD_PENDING",
        "createdAtUtc": utc_now_iso(),
        "commentUrl": None,
        "packageCommit": None,
    }
    _write_json(run_dir / "metadata.json", metadata)
    return run_dir


def build_issue_comment(metadata: dict[str, Any]) -> str:
    manifest = metadata["manifest"]
    lines = [
        schema.RUN_INDEX_MARKER,
        f"actor: {manifest['actor']}",
        f"runId: {manifest['runId']}",
        f"taskId: {manifest['taskId'] or 'N/A'}",
        f"status: {manifest['status']}",
        f"repository: {manifest['repository']}",
        f"branch: {manifest['branch']}",
        f"packagePath: {manifest['packagePath']}",
        f"createdAtUtc: {manifest['createdAtUtc']}",
        f"createdAtJst: {manifest['createdAtJst']}",
        f"packageCommit: {metadata.get('packageCommit') or 'PENDING'}",
        f"redactionStatus: {metadata.get('redactionStatus', 'SANITIZED')}",
        f"uploadState: {metadata.get('state', 'UPLOAD_PENDING')}",
    ]
    return "\n".join(lines) + "\n"


def _run(command: list[str], *, cwd: Path, check: bool = True) -> subprocess.CompletedProcess[str]:
    completed = subprocess.run(
        command,
        cwd=cwd,
        text=True,
        capture_output=True,
        check=False,
    )
    if check and completed.returncode != 0:
        raise RuntimeError(
            f"command failed ({completed.returncode}): {' '.join(command)}\n{completed.stderr}"
        )
    return completed


def _origin_url(repo_root: Path) -> str:
    result = _run(["git", "config", "--get", "remote.origin.url"], cwd=repo_root)
    return result.stdout.strip()


def _prepare_publication_repo(temp_root: Path, origin_url: str, branch: str) -> Path:
    _run(["git", "init"], cwd=temp_root)
    _run(["git", "remote", "add", "origin", origin_url], cwd=temp_root)
    _run(["git", "fetch", "origin", branch], cwd=temp_root)
    _run(["git", "checkout", "-B", "publish", "FETCH_HEAD"], cwd=temp_root)
    _run(["git", "config", "user.name", "Codex"], cwd=temp_root)
    _run(["git", "config", "user.email", "codex@local.invalid"], cwd=temp_root)
    return temp_root


def _copy_package(run_dir: Path, temp_root: Path, package_path: str) -> None:
    source_root = run_dir / "package"
    for source in source_root.rglob("*"):
        if source.is_dir():
            continue
        relative = source.relative_to(source_root)
        destination = temp_root / package_path / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)


def _commit_package(temp_root: Path, run_id: str, package_path: str) -> str:
    _run(["git", "add", package_path], cwd=temp_root)
    _run(["git", "commit", "-m", f"AI_FORENSICS_V1 {run_id}"], cwd=temp_root)
    return _run(["git", "rev-parse", "HEAD"], cwd=temp_root).stdout.strip()


def _push_package(temp_root: Path, branch: str) -> tuple[bool, str]:
    completed = _run(
        ["git", "push", "origin", f"HEAD:{branch}"],
        cwd=temp_root,
        check=False,
    )
    if completed.returncode == 0:
        return True, completed.stdout + completed.stderr
    if "non-fast-forward" in completed.stderr or "[rejected]" in completed.stderr:
        return False, "NON_FAST_FORWARD"
    if "Authentication failed" in completed.stderr or "permission denied" in completed.stderr.lower():
        raise PermissionError(completed.stderr.strip())
    raise RuntimeError(completed.stderr.strip() or completed.stdout.strip())


def _verify_remote_package(temp_root: Path, branch: str, package_path: str, run_dir: Path) -> None:
    _run(["git", "fetch", "origin", branch], cwd=temp_root)
    package_root = run_dir / "package"
    for source in package_root.rglob("*"):
        if source.is_dir():
            continue
        relative = source.relative_to(package_root).as_posix()
        remote_path = f"{package_path}/{relative}"
        remote = _run(["git", "show", f"FETCH_HEAD:{remote_path}"], cwd=temp_root)
        if source.read_bytes() != remote.stdout.encode("utf-8"):
            raise RuntimeError(f"remote verification mismatch for {remote_path}")


def _post_issue_comment(repo: str, issue_number: int, body: str) -> tuple[int | None, str | None]:
    with tempfile.TemporaryDirectory(prefix="ai-forensics-comment-") as directory:
        payload_path = Path(directory) / "payload.json"
        payload_path.write_text(json.dumps({"body": body}), encoding="utf-8")
        completed = subprocess.run(
            [
                "gh",
                "api",
                f"repos/{repo}/issues/{issue_number}/comments",
                "--method",
                "POST",
                "--input",
                str(payload_path),
            ],
            text=True,
            capture_output=True,
            check=False,
        )
        if completed.returncode != 0:
            raise RuntimeError(completed.stderr.strip() or completed.stdout.strip())
        response = json.loads(completed.stdout)
        return response.get("id"), response.get("html_url")


def publish_staged_run(
    run_dir: Path,
    *,
    repo_root: Path,
    dry_run: bool = False,
) -> dict[str, Any]:
    metadata_path = run_dir / "metadata.json"
    metadata = _read_json(metadata_path)
    manifest = metadata["manifest"]

    if metadata.get("commentUrl") and metadata.get("packageCommit"):
        return metadata

    if dry_run:
        metadata["state"] = "UPLOAD_PENDING"
        metadata["dryRun"] = True
        _write_json(metadata_path, metadata)
        return metadata

    origin_url = _origin_url(repo_root)
    branch = metadata["branch"]
    package_path = manifest["packagePath"]
    commit_sha = None
    with tempfile.TemporaryDirectory(prefix="ai-forensics-publish-") as directory:
        temp_root = Path(directory)
        for _ in range(3):
            if temp_root.exists():
                for child in temp_root.iterdir():
                    if child.is_dir():
                        shutil.rmtree(child)
                    else:
                        child.unlink()
            _prepare_publication_repo(temp_root, origin_url, branch)
            _copy_package(run_dir, temp_root, package_path)
            commit_sha = _commit_package(temp_root, manifest["runId"], package_path)
            pushed, detail = _push_package(temp_root, branch)
            if pushed:
                break
            if detail != "NON_FAST_FORWARD":
                raise RuntimeError(detail)
        else:
            raise RuntimeError("bounded non-fast-forward retry exhausted")

        _verify_remote_package(temp_root, branch, package_path, run_dir)

    metadata["packageCommit"] = commit_sha
    metadata["state"] = "UPLOADED"
    body = build_issue_comment(metadata)
    comment_id, comment_url = _post_issue_comment(metadata["repository"], metadata["issueNumber"], body)
    metadata["commentId"] = comment_id
    metadata["commentUrl"] = comment_url
    _write_json(metadata_path, metadata)
    return metadata


def flush_pending(
    *,
    repo_root: Path,
    spool_root: Path | None = None,
    dry_run: bool = False,
) -> list[dict[str, Any]]:
    spool_root = spool_root or default_spool_root()
    runs_root = spool_root / "runs"
    if not runs_root.exists():
        return []
    results: list[dict[str, Any]] = []
    for run_dir in sorted(path for path in runs_root.iterdir() if path.is_dir()):
        metadata = _read_json(run_dir / "metadata.json")
        if metadata.get("state") == "UPLOADED" and metadata.get("commentUrl"):
            results.append(metadata)
            continue
        try:
            results.append(publish_staged_run(run_dir, repo_root=repo_root, dry_run=dry_run))
        except PermissionError:
            metadata["state"] = "UPLOAD_BLOCKED_AUTH"
            _write_json(run_dir / "metadata.json", metadata)
            results.append(metadata)
        except Exception as exc:  # pragma: no cover - exercised in self-test paths
            metadata["state"] = "UPLOAD_FAILED"
            metadata["failure"] = str(exc)
            _write_json(run_dir / "metadata.json", metadata)
            results.append(metadata)
    return results


def run_self_test() -> int:
    manifest = schema.build_manifest(
        actor="CODEX",
        run_id=schema.generate_run_id("CODEX", "self-test"),
        status="UPLOAD_PENDING",
        repository=DEFAULT_REPO,
        branch="infra/test",
        task_id="TASK-SELF-TEST",
    )
    with tempfile.TemporaryDirectory(prefix="ai-forensics-selftest-") as directory:
        spool_root = Path(directory) / "spool"
        repo_root = Path(directory) / "repo"
        repo_root.mkdir()
        _run(["git", "init"], cwd=repo_root)
        _run(["git", "config", "user.name", "Codex"], cwd=repo_root)
        _run(["git", "config", "user.email", "codex@local.invalid"], cwd=repo_root)
        _run(["git", "remote", "add", "origin", "https://example.invalid/repo.git"], cwd=repo_root)
        run_dir = stage_run_package(
            manifest=manifest,
            events=[{"event": "Stop", "observedAtUtc": utc_now_iso()}],
            summary={"status": "ok"},
            git_evidence={"branch": "HEAD"},
            redaction_report={"blocked": False, "replacements": []},
            spool_root=spool_root,
        )
        metadata = publish_staged_run(run_dir, repo_root=repo_root, dry_run=True)
        if metadata.get("state") != "UPLOAD_PENDING":
            raise RuntimeError("dry-run publish should preserve UPLOAD_PENDING state")
    print("AI_FORENSICS_PUBLISH_SELF_TEST_PASS")
    return 0


def main() -> int:
    parser = ArgumentParser()
    parser.add_argument("--repo", default=".")
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--flush-pending", action="store_true")
    args = parser.parse_args()

    if args.self_test:
        return run_self_test()

    if args.flush_pending:
        results = flush_pending(repo_root=Path(args.repo).resolve(), dry_run=args.dry_run)
        print(schema.deterministic_json_dumps({"results": results}))
        return 0

    parser.error("no action selected")
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
