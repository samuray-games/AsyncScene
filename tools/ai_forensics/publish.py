"""Stage and publish immutable AI forensics packages."""

from __future__ import annotations

from argparse import ArgumentParser
from datetime import datetime, timezone
from pathlib import Path
import fcntl
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
    from tools.ai_forensics.redact import sanitize_json_compatible, sanitize_text  # type: ignore[import-not-found]
else:
    from . import package as package_builder
    from . import schema
    from .redact import sanitize_json_compatible, sanitize_text

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
    schema.atomic_write_json(path, payload)


def _read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def _fsync_directory(path: Path) -> None:
    try:
        fd = os.open(path, os.O_RDONLY)
    except OSError:
        return
    try:
        os.fsync(fd)
    except OSError:
        pass
    finally:
        os.close(fd)


class PublicationLock:
    def __init__(self, path: Path) -> None:
        self.path = path
        self.handle: Any | None = None

    def __enter__(self) -> "PublicationLock":
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.handle = self.path.open("a+", encoding="utf-8")
        fcntl.flock(self.handle.fileno(), fcntl.LOCK_EX)
        return self

    def __exit__(self, exc_type: Any, exc: Any, traceback: Any) -> None:
        if self.handle is None:
            return
        fcntl.flock(self.handle.fileno(), fcntl.LOCK_UN)
        self.handle.close()


def _default_source_metadata(manifest: dict[str, Any], git_evidence: dict[str, Any]) -> dict[str, Any]:
    head = git_evidence.get("head") if isinstance(git_evidence.get("head"), str) else None
    branch = git_evidence.get("branch") if isinstance(git_evidence.get("branch"), str) else manifest["branch"]
    metadata = {
        "sourceBranch": branch or manifest["branch"],
        "sourceSha": head,
        "sourceShaSemantics": "captured_head" if head else None,
        "resultSha": head,
        "resultShaSemantics": "captured_head" if head else None,
    }
    return metadata


def _sanitize_package_payloads(
    *,
    manifest: dict[str, Any],
    events: list[dict[str, Any]],
    summary: dict[str, Any],
    git_evidence: dict[str, Any],
    redaction_report: dict[str, Any],
    extras: dict[str, Any],
) -> tuple[dict[str, Any], list[dict[str, Any]], dict[str, Any], dict[str, Any], dict[str, Any], dict[str, Any], bool]:
    replacements: list[str] = []
    reasons: list[str] = []
    blocked = False

    def sanitize_json(value: Any) -> Any:
        nonlocal blocked
        sanitized, item_replacements, item_reasons, item_blocked = sanitize_json_compatible(value)
        replacements.extend(item_replacements)
        reasons.extend(item_reasons)
        blocked = blocked or item_blocked
        return sanitized

    sanitized_manifest = sanitize_json(manifest)
    sanitized_events = sanitize_json(events)
    sanitized_summary = sanitize_json(summary)
    sanitized_git_evidence = sanitize_json(git_evidence)
    sanitized_redaction_report = sanitize_json(redaction_report)
    sanitized_extras: dict[str, Any] = {}
    for path, value in extras.items():
        safe_path_result = sanitize_text(path)
        replacements.extend(safe_path_result.replacements)
        reasons.extend(safe_path_result.reasons)
        blocked = blocked or safe_path_result.blocked
        if isinstance(value, bytes):
            try:
                decoded = value.decode("utf-8")
            except UnicodeDecodeError:
                blocked = True
                reasons.append(f"non-utf8 extra: {path}")
                continue
            value_result = sanitize_text(decoded)
            sanitized_extras[safe_path_result.text] = value_result.text
            replacements.extend(value_result.replacements)
            reasons.extend(value_result.reasons)
            blocked = blocked or value_result.blocked
        elif isinstance(value, str):
            value_result = sanitize_text(value)
            sanitized_extras[safe_path_result.text] = value_result.text
            replacements.extend(value_result.replacements)
            reasons.extend(value_result.reasons)
            blocked = blocked or value_result.blocked
        else:
            sanitized_extras[safe_path_result.text] = sanitize_json(value)

    sanitized_redaction_report = dict(sanitized_redaction_report)
    sanitized_redaction_report["blocked"] = bool(sanitized_redaction_report.get("blocked") or blocked)
    sanitized_redaction_report["replacements"] = sorted(set(sanitized_redaction_report.get("replacements", []) + replacements))
    sanitized_redaction_report["reasons"] = sorted(set(sanitized_redaction_report.get("reasons", []) + reasons))
    return (
        sanitized_manifest,
        sanitized_events,
        sanitized_summary,
        sanitized_git_evidence,
        sanitized_redaction_report,
        sanitized_extras,
        bool(sanitized_redaction_report["blocked"]),
    )


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
    metadata_updates: dict[str, Any] | None = None,
) -> Path:
    errors = schema.validate_manifest(manifest)
    if errors:
        raise ValueError("; ".join(errors))

    spool_root = spool_root or default_spool_root()
    run_dir = spool_root / "runs" / manifest["runId"]
    package_dir = run_dir / "package"
    metadata_path = run_dir / "metadata.json"
    if metadata_path.exists():
        existing = _read_json(metadata_path)
        if existing.get("state") in {"PACKAGE_UPLOADED_COMMENT_PENDING", "UPLOADED", "UPLOAD_COMPLETE_INDEXED"}:
            raise FileExistsError(f"refusing to restage completed run: {manifest['runId']}")

    (
        sanitized_manifest,
        sanitized_events,
        sanitized_summary,
        sanitized_git_evidence,
        sanitized_redaction_report,
        sanitized_extras,
        blocked,
    ) = _sanitize_package_payloads(
        manifest=manifest,
        events=events,
        summary=summary,
        git_evidence=git_evidence,
        redaction_report=redaction_report,
        extras=extras or {},
    )
    if blocked:
        sanitized_manifest = dict(sanitized_manifest)
        sanitized_manifest["status"] = "UPLOAD_BLOCKED_REDACTION_FAIL"

    metadata = {
        "repository": repository,
        "branch": branch,
        "issueNumber": issue_number,
        "manifest": sanitized_manifest,
        "truncations": [],
        "state": "UPLOAD_BLOCKED_REDACTION_FAIL" if blocked else "UPLOAD_PENDING",
        "captureState": "LOCAL_CAPTURED",
        "createdAtUtc": utc_now_iso(),
        "commentUrl": None,
        "commentId": None,
        "packageCommit": None,
        "packageVerifiedAtUtc": None,
        "redactionStatus": "BLOCKED" if blocked else "SANITIZED",
        "observedResult": "redaction blocked before upload" if blocked else "package staged and awaiting upload",
    }
    metadata.update(_default_source_metadata(sanitized_manifest, sanitized_git_evidence))
    if metadata_updates:
        metadata.update(metadata_updates)

    try:
        files, truncations = package_builder.build_package_files(
            manifest=sanitized_manifest,
            events=sanitized_events,
            summary=sanitized_summary,
            git_evidence=sanitized_git_evidence,
            redaction_report=sanitized_redaction_report,
            extras=sanitized_extras,
        )
    except ValueError as exc:
        run_dir.mkdir(parents=True, exist_ok=True)
        metadata["state"] = "UPLOAD_BLOCKED_REDACTION_FAIL"
        metadata["manifest"] = dict(sanitized_manifest)
        metadata["manifest"]["status"] = "UPLOAD_BLOCKED_REDACTION_FAIL"
        metadata["redactionStatus"] = "BLOCKED_FINAL_SCAN"
        metadata["failure"] = str(exc)
        metadata["observedResult"] = "final package privacy scan blocked publication before upload"
        _write_json(metadata_path, metadata)
        return run_dir

    staging_dir = run_dir / f".package.tmp-{os.getpid()}"
    if staging_dir.exists():
        shutil.rmtree(staging_dir)
    staging_dir.mkdir(parents=True, exist_ok=False)
    for relative_path, content in files.items():
        target = staging_dir / relative_path
        target.parent.mkdir(parents=True, exist_ok=True)
        with target.open("wb") as handle:
            handle.write(content)
            handle.flush()
            try:
                os.fsync(handle.fileno())
            except OSError:
                pass
    if package_dir.exists():
        shutil.rmtree(package_dir)
    os.replace(staging_dir, package_dir)
    _fsync_directory(run_dir)
    metadata["truncations"] = truncations
    _write_json(metadata_path, metadata)
    return run_dir


def build_issue_comment(metadata: dict[str, Any]) -> str:
    manifest = metadata["manifest"]
    lines = [
        schema.RUN_INDEX_MARKER,
        f"actor: {manifest['actor']}",
        f"runId: {manifest['runId']}",
        f"taskId: {manifest['taskId'] or 'N/A'}",
        f"manifestStatus: {manifest['status']}",
        f"repository: {manifest['repository']}",
        f"branch: {manifest['branch']}",
        f"sourceBranch: {metadata.get('sourceBranch') or manifest['branch']}",
        f"sourceSha: {metadata.get('sourceSha') or 'UNKNOWN'}",
        f"sourceShaSemantics: {metadata.get('sourceShaSemantics') or 'unspecified'}",
        f"resultSha: {metadata.get('resultSha') or metadata.get('packageCommit') or 'UNKNOWN'}",
        f"resultShaSemantics: {metadata.get('resultShaSemantics') or 'unspecified'}",
        f"packagePath: {manifest['packagePath']}",
        f"createdAtUtc: {manifest['createdAtUtc']}",
        f"createdAtJst: {manifest['createdAtJst']}",
        f"packageCommit: {metadata.get('packageCommit') or 'UNKNOWN'}",
        f"redactionStatus: {metadata.get('redactionStatus', 'SANITIZED')}",
        f"uploadState: {metadata.get('state', 'PACKAGE_UPLOADED_COMMENT_PENDING')}",
        f"observedResult: {metadata.get('observedResult') or 'remote package verified; index comment pending'}",
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


def _configure_actions_auth(temp_root: Path, origin_url: str, env: dict[str, str] | None = None) -> bool:
    env = env or os.environ
    token = env.get("GITHUB_TOKEN")
    if not token or not origin_url.startswith("https://github.com/"):
        return False
    _run(
        ["git", "config", "--local", "http.https://github.com/.extraheader", "AUTHORIZATION: basic ***"],
        cwd=temp_root,
    )
    encoded = __import__("base64").b64encode(f"x-access-token:{token}".encode("utf-8")).decode("ascii")
    config_path = temp_root / ".git" / "config"
    text = config_path.read_text(encoding="utf-8")
    text = text.replace("AUTHORIZATION: basic ***", f"AUTHORIZATION: basic {encoded}")
    config_path.write_text(text, encoding="utf-8")
    return True


def _prepare_publication_repo(
    temp_root: Path,
    origin_url: str,
    branch: str,
    *,
    bootstrap_repo: Path | None = None,
) -> Path:
    _run(["git", "init"], cwd=temp_root)
    _run(["git", "remote", "add", "origin", origin_url], cwd=temp_root)
    _configure_actions_auth(temp_root, origin_url)
    local_ref = f"refs/remotes/origin/{branch}"
    if bootstrap_repo is not None:
        bootstrap_path = str(bootstrap_repo.resolve())
        local_ref_check = _run(["git", "show-ref", "--verify", "--quiet", local_ref], cwd=bootstrap_repo, check=False)
        if local_ref_check.returncode == 0:
            _run(["git", "fetch", "--no-tags", bootstrap_path, local_ref], cwd=temp_root)
        else:
            _run(["git", "fetch", "--depth", "1", "--no-tags", "origin", branch], cwd=temp_root)
    else:
        _run(["git", "fetch", "--depth", "1", "--no-tags", "origin", branch], cwd=temp_root)
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
    completed = _run(["git", "commit", "-m", f"AI_FORENSICS_V1 {run_id}"], cwd=temp_root, check=False)
    if completed.returncode != 0:
        output = (completed.stdout + completed.stderr).strip()
        if "nothing to commit" in output:
            raise FileExistsError("remote identical package already present")
        raise RuntimeError(output)
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


def _remote_package_commit_if_identical(temp_root: Path, package_path: str, run_dir: Path) -> str | None:
    listed = _run(
        ["git", "ls-tree", "-r", "--name-only", "FETCH_HEAD", package_path],
        cwd=temp_root,
        check=False,
    )
    if listed.returncode != 0:
        return None
    remote_paths = sorted(line.strip() for line in listed.stdout.splitlines() if line.strip())
    package_root = run_dir / "package"
    local_paths = sorted(path.relative_to(package_root).as_posix() for path in package_root.rglob("*") if path.is_file())
    expected_remote = [f"{package_path}/{relative}" for relative in local_paths]
    if remote_paths != expected_remote:
        return None
    for relative in local_paths:
        remote_path = f"{package_path}/{relative}"
        remote = _run(["git", "show", f"FETCH_HEAD:{remote_path}"], cwd=temp_root, check=False)
        if remote.returncode != 0:
            return None
        if (package_root / relative).read_bytes() != remote.stdout.encode("utf-8"):
            return None
    commit = _run(["git", "log", "--format=%H", "-n", "1", "FETCH_HEAD", "--", package_path], cwd=temp_root).stdout.strip()
    if commit:
        return commit
    return _run(["git", "rev-parse", "FETCH_HEAD"], cwd=temp_root).stdout.strip()


def _verify_remote_package(temp_root: Path, branch: str, package_path: str, run_dir: Path) -> None:
    _run(["git", "fetch", "--depth", "1", "--no-tags", "origin", branch], cwd=temp_root)
    if not _remote_package_commit_if_identical(temp_root, package_path, run_dir):
        raise RuntimeError(f"remote verification mismatch for {package_path}")


def _find_existing_index_comment(repo: str, issue_number: int, run_id: str) -> tuple[int | None, str | None]:
    completed = subprocess.run(
        [
            "gh",
            "api",
            f"repos/{repo}/issues/{issue_number}/comments",
            "--paginate",
            "--jq",
            f".[] | select(.body | contains(\"{schema.RUN_INDEX_MARKER}\") and contains(\"runId: {run_id}\")) | [.id, .html_url] | @tsv",
        ],
        text=True,
        capture_output=True,
        check=False,
    )
    if completed.returncode != 0 or not completed.stdout.strip():
        return None, None
    first = completed.stdout.strip().splitlines()[0].split("\t")
    return int(first[0]), first[1] if len(first) > 1 else None


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
    with PublicationLock(run_dir / "publish.lock"):
        metadata = _read_json(metadata_path)
        manifest = metadata["manifest"]

        if metadata.get("state") == "UPLOAD_BLOCKED_REDACTION_FAIL":
            return metadata

        if metadata.get("commentUrl") and metadata.get("packageCommit"):
            metadata["state"] = "UPLOAD_COMPLETE_INDEXED"
            metadata["manifest"]["status"] = "UPLOAD_COMPLETE_INDEXED"
            _write_json(metadata_path, metadata)
            return metadata

        if dry_run:
            metadata["state"] = metadata.get("state", "UPLOAD_PENDING")
            metadata["dryRun"] = True
            _write_json(metadata_path, metadata)
            return metadata

        origin_url = _origin_url(repo_root)
        branch = metadata["branch"]
        package_path = manifest["packagePath"]
        if not metadata.get("packageCommit"):
            commit_sha = None
            reused_remote = False
            with tempfile.TemporaryDirectory(prefix="ai-forensics-publish-") as directory:
                temp_root = Path(directory)
                for attempt in range(3):
                    if temp_root.exists():
                        for child in temp_root.iterdir():
                            if child.is_dir():
                                shutil.rmtree(child)
                            else:
                                child.unlink()
                    bootstrap = repo_root if attempt == 0 else None
                    _prepare_publication_repo(temp_root, origin_url, branch, bootstrap_repo=bootstrap)
                    commit_sha = _remote_package_commit_if_identical(temp_root, package_path, run_dir)
                    if commit_sha:
                        reused_remote = True
                        break
                    _copy_package(run_dir, temp_root, package_path)
                    try:
                        commit_sha = _commit_package(temp_root, manifest["runId"], package_path)
                    except FileExistsError:
                        commit_sha = _remote_package_commit_if_identical(temp_root, package_path, run_dir)
                        if commit_sha:
                            reused_remote = True
                            break
                        raise
                    pushed, detail = _push_package(temp_root, branch)
                    if pushed:
                        break
                    if detail != "NON_FAST_FORWARD":
                        raise RuntimeError(detail)
                else:
                    raise RuntimeError("bounded non-fast-forward retry exhausted")

                _verify_remote_package(temp_root, branch, package_path, run_dir)

            metadata["packageCommit"] = commit_sha
            metadata["packageVerifiedAtUtc"] = utc_now_iso()
            metadata["state"] = "PACKAGE_UPLOADED_COMMENT_PENDING"
            metadata["manifest"]["status"] = "PACKAGE_UPLOADED_COMMENT_PENDING"
            metadata["observedResult"] = (
                "existing remote package verified; index comment pending"
                if reused_remote
                else "remote package verified; index comment pending"
            )
            _write_json(metadata_path, metadata)
        else:
            with tempfile.TemporaryDirectory(prefix="ai-forensics-verify-") as directory:
                temp_root = _prepare_publication_repo(Path(directory), origin_url, branch, bootstrap_repo=repo_root)
                _verify_remote_package(temp_root, branch, package_path, run_dir)

        existing_id, existing_url = _find_existing_index_comment(metadata["repository"], metadata["issueNumber"], manifest["runId"])
        if existing_id:
            metadata["commentId"] = existing_id
            metadata["commentUrl"] = existing_url
            metadata["state"] = "UPLOAD_COMPLETE_INDEXED"
            metadata["manifest"]["status"] = "UPLOAD_COMPLETE_INDEXED"
            metadata["observedResult"] = "remote package verified and existing index comment reused"
            _write_json(metadata_path, metadata)
            return metadata

        comment_ready = dict(metadata)
        comment_ready["state"] = "UPLOAD_COMPLETE_INDEXED"
        comment_ready["manifest"] = dict(metadata["manifest"])
        comment_ready["manifest"]["status"] = "UPLOAD_COMPLETE_INDEXED"
        comment_ready["observedResult"] = (
            "existing remote package verified and index comment created"
            if str(metadata.get("observedResult", "")).startswith("existing remote package verified")
            else "remote package verified and index comment created"
        )
        body = build_issue_comment(comment_ready)
        comment_id, comment_url = _post_issue_comment(metadata["repository"], metadata["issueNumber"], body)
        metadata["commentId"] = comment_id
        metadata["commentUrl"] = comment_url
        metadata["state"] = "UPLOAD_COMPLETE_INDEXED"
        metadata["manifest"]["status"] = "UPLOAD_COMPLETE_INDEXED"
        metadata["observedResult"] = comment_ready["observedResult"]
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
        if metadata.get("state") == "UPLOAD_BLOCKED_REDACTION_FAIL":
            results.append(metadata)
            continue
        if metadata.get("state") in {"UPLOADED", "UPLOAD_COMPLETE_INDEXED"} and metadata.get("commentUrl"):
            results.append(metadata)
            continue
        try:
            results.append(publish_staged_run(run_dir, repo_root=repo_root, dry_run=dry_run))
        except PermissionError:
            latest = _read_json(run_dir / "metadata.json")
            latest["state"] = "UPLOAD_BLOCKED_AUTH"
            _write_json(run_dir / "metadata.json", latest)
            results.append(latest)
        except Exception as exc:  # pragma: no cover - exercised in self-test paths
            latest = _read_json(run_dir / "metadata.json")
            latest["failure"] = str(exc)
            if latest.get("packageCommit") and not latest.get("commentUrl"):
                latest["state"] = "PACKAGE_UPLOADED_COMMENT_PENDING"
                latest["manifest"]["status"] = "PACKAGE_UPLOADED_COMMENT_PENDING"
            else:
                latest["state"] = "UPLOAD_RETRYABLE_FAILURE"
            _write_json(run_dir / "metadata.json", latest)
            results.append(latest)
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
        if _configure_actions_auth(repo_root, "https://github.com/samuray-games/AsyncScene.git", {"GITHUB_TOKEN": "fake-token"}):
            config_text = (repo_root / ".git" / "config").read_text(encoding="utf-8")
            if "fake-token" in config_text:
                raise RuntimeError("token leaked into inspectable config text")
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
