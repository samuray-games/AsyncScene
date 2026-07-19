"""Fail-closed GitHub transport helpers for read and publication paths.

The module deliberately keeps transport policy separate from repository policy:
callers provide exact refs, leases, and repository identity while this layer
classifies bounded transport failures and resolves ambiguous publication state.
"""

from __future__ import annotations

from dataclasses import dataclass
import json
from pathlib import Path
import re
import subprocess
import time
from typing import Callable, Sequence

DEFAULT_BACKOFF_SECONDS = 0.25

STATE_EXTERNAL_VERIFICATION_REQUIRED = "EXTERNAL_GITHUB_VERIFICATION_REQUIRED"
STATE_AMBIGUOUS_PUSH_RESOLVED_SUCCESS = "AMBIGUOUS_PUSH_RESOLVED_SUCCESS"
STATE_SAFE_RETRY_ALLOWED = "SAFE_RETRY_ALLOWED"
STATE_BLOCKED_REMOTE_MOVED = "BLOCKED_REMOTE_MOVED"
STATE_PUSH_SUCCEEDED = "PUSH_SUCCEEDED"
STATE_PUSH_FAILED = "PUSH_FAILED"
STATE_FETCH_SUCCEEDED = "FETCH_SUCCEEDED"
STATE_FETCH_FAILED = "FETCH_FAILED"
STATE_INVENTORY_SUCCEEDED = "INVENTORY_SUCCEEDED"
STATE_INVENTORY_FAILED = "INVENTORY_FAILED"
STATE_REMOTE_REF_MISSING = "REMOTE_REF_MISSING"

TRANSPORT_CONNECTION_RESET = "CONNECTION_RESET"
TRANSPORT_TLS_HANDSHAKE_TIMEOUT = "TLS_HANDSHAKE_TIMEOUT"
TRANSPORT_NETWORK_UNAVAILABLE = "NETWORK_UNAVAILABLE"
TRANSPORT_UNKNOWN = "UNKNOWN_TRANSPORT_ERROR"

Runner = Callable[[Sequence[str], Path], "CommandResult"]


@dataclass(frozen=True)
class CommandResult:
    argv: tuple[str, ...]
    returncode: int
    stdout: str = ""
    stderr: str = ""


@dataclass(frozen=True)
class Attempt:
    method: str
    command: tuple[str, ...]
    exit_code: int
    transport_error: str | None
    stderr: str

    def as_dict(self) -> dict[str, object]:
        return {
            "method": self.method,
            "command": list(self.command),
            "exitCode": self.exit_code,
            "transportError": self.transport_error,
            "stderr": self.stderr,
        }


@dataclass(frozen=True)
class RemoteRef:
    name: str
    sha: str
    kind: str
    peeled: bool = False

    def as_dict(self) -> dict[str, object]:
        return {"name": self.name, "sha": self.sha, "kind": self.kind, "peeled": self.peeled}


@dataclass(frozen=True)
class InventoryResult:
    state: str
    refs: tuple[RemoteRef, ...]
    default_branch: str | None
    attempts: tuple[Attempt, ...]

    def as_dict(self) -> dict[str, object]:
        return {
            "state": self.state,
            "defaultBranch": self.default_branch,
            "refs": [ref.as_dict() for ref in self.refs],
            "attempts": [attempt.as_dict() for attempt in self.attempts],
        }


@dataclass(frozen=True)
class OperationResult:
    state: str
    attempts: tuple[Attempt, ...]
    remote_sha: str | None = None
    resolution_state: str | None = None
    retried: bool = False

    def as_dict(self) -> dict[str, object]:
        return {
            "state": self.state,
            "remoteSha": self.remote_sha,
            "resolutionState": self.resolution_state,
            "retried": self.retried,
            "attempts": [attempt.as_dict() for attempt in self.attempts],
        }


def _subprocess_runner(argv: Sequence[str], cwd: Path) -> CommandResult:
    completed = subprocess.run(argv, cwd=cwd, text=True, capture_output=True, check=False)
    return CommandResult(tuple(argv), completed.returncode, completed.stdout, completed.stderr)


def classify_transport_error(output: str) -> str | None:
    """Return a stable category for errors that can be retried safely."""

    text = output.lower()
    if "connection reset by peer" in text or "recv failure" in text:
        return TRANSPORT_CONNECTION_RESET
    if "tls handshake timeout" in text or "handshake timeout" in text:
        return TRANSPORT_TLS_HANDSHAKE_TIMEOUT
    if any(marker in text for marker in ("could not resolve host", "network is unreachable", "connection timed out")):
        return TRANSPORT_NETWORK_UNAVAILABLE
    return None


def _attempt(method: str, result: CommandResult) -> Attempt:
    return Attempt(
        method=method,
        command=result.argv,
        exit_code=result.returncode,
        transport_error=classify_transport_error(result.stderr + "\n" + result.stdout),
        stderr=result.stderr.strip(),
    )


def _backoff(seconds: float) -> None:
    if seconds > 0:
        time.sleep(seconds)


def _parse_ref_line(line: str) -> tuple[str, str] | None:
    fields = line.split()
    if len(fields) != 2:
        return None
    sha, name = fields
    if not re.fullmatch(r"[0-9a-fA-F]{40}|[0-9a-fA-F]{64}", sha):
        return None
    return sha, name


def parse_ls_remote(output: str) -> tuple[tuple[RemoteRef, ...], str | None]:
    refs: list[RemoteRef] = []
    default_branch: str | None = None
    for line in output.splitlines():
        line = line.strip()
        if not line:
            continue
        if line.startswith("ref: ") and line.endswith(" HEAD"):
            target = line[5:-5]
            if target.startswith("refs/heads/"):
                default_branch = target.removeprefix("refs/heads/")
            continue
        parsed = _parse_ref_line(line)
        if parsed is None:
            continue
        sha, name = parsed
        if name == "HEAD":
            continue
        if name.startswith("refs/heads/"):
            refs.append(RemoteRef(name=name.removeprefix("refs/heads/"), sha=sha, kind="branch"))
        elif name.startswith("refs/tags/"):
            peeled = name.endswith("^{}")
            clean_name = name.removeprefix("refs/tags/")
            if peeled:
                clean_name = clean_name[:-3]
            refs.append(RemoteRef(name=clean_name, sha=sha, kind="tag", peeled=peeled))
    refs.sort(key=lambda ref: (ref.kind, ref.name, ref.peeled, ref.sha))
    return tuple(refs), default_branch


def _parse_rest_refs(stdout: str, kind: str) -> list[RemoteRef]:
    refs: list[RemoteRef] = []
    for line in stdout.splitlines():
        fields = line.rstrip("\n").split("\t")
        if len(fields) != 2 or not fields[0] or not fields[1]:
            continue
        refs.append(RemoteRef(name=fields[0], sha=fields[1], kind=kind))
    return refs


def _github_rest_inventory(
    repo: Path,
    repository: str,
    runner: Runner,
) -> tuple[list[RemoteRef], list[Attempt]]:
    attempts: list[Attempt] = []
    refs: list[RemoteRef] = []
    failed = False
    for kind, endpoint in (
        ("branch", f"repos/{repository}/branches?per_page=100"),
        ("tag", f"repos/{repository}/tags?per_page=100"),
    ):
        command = (
            "gh",
            "api",
            endpoint,
            "--paginate",
            "--jq",
            ".[] | [.name, .commit.sha] | @tsv",
        )
        result = runner(command, repo)
        attempts.append(_attempt(f"rest-{kind}s", result))
        if result.returncode != 0:
            failed = True
            continue
        refs.extend(_parse_rest_refs(result.stdout, kind))
    return ([] if failed else refs), attempts


def inventory(
    repo: str | Path,
    *,
    remote: str = "origin",
    repository: str | None = None,
    ssh_remote: str | None = None,
    runner: Runner | None = None,
    backoff_seconds: float = DEFAULT_BACKOFF_SECONDS,
) -> InventoryResult:
    """Enumerate refs without moving local remote-tracking refs or fetching objects."""

    root = Path(repo).resolve()
    run = runner or _subprocess_runner
    attempts: list[Attempt] = []
    commands = [
        (
            "https",
            ("git", "ls-remote", "--symref", "--heads", "--tags", remote),
        ),
        (
            "https-http11",
            ("git", "-c", "http.version=HTTP/1.1", "ls-remote", "--symref", "--heads", "--tags", remote),
        ),
    ]
    for method, command in commands:
        result = run(command, root)
        attempts.append(_attempt(method, result))
        if result.returncode == 0:
            refs, default_branch = parse_ls_remote(result.stdout)
            return InventoryResult(STATE_INVENTORY_SUCCEEDED, refs, default_branch, tuple(attempts))
        if method == "https" and classify_transport_error(result.stderr + "\n" + result.stdout) is None:
            break
        if method == "https":
            _backoff(backoff_seconds)

    if repository:
        refs, rest_attempts = _github_rest_inventory(root, repository, run)
        attempts.extend(rest_attempts)
        if refs or all(attempt.exit_code == 0 for attempt in rest_attempts):
            refs.sort(key=lambda ref: (ref.kind, ref.name, ref.peeled, ref.sha))
            return InventoryResult(STATE_INVENTORY_SUCCEEDED, tuple(refs), None, tuple(attempts))

    if ssh_remote:
        command = ("git", "ls-remote", "--symref", "--heads", "--tags", ssh_remote)
        result = run(command, root)
        attempts.append(_attempt("ssh", result))
        if result.returncode == 0:
            refs, default_branch = parse_ls_remote(result.stdout)
            return InventoryResult(STATE_INVENTORY_SUCCEEDED, refs, default_branch, tuple(attempts))

    return InventoryResult(STATE_EXTERNAL_VERIFICATION_REQUIRED, (), None, tuple(attempts))


def fetch_exact_refs(
    repo: str | Path,
    refspecs: Sequence[str],
    *,
    remote: str = "origin",
    runner: Runner | None = None,
    depth: int | None = None,
    backoff_seconds: float = DEFAULT_BACKOFF_SECONDS,
) -> OperationResult:
    """Fetch only caller-supplied refspecs, with one bounded transport fallback."""

    if not refspecs:
        raise ValueError("at least one exact refspec is required")
    root = Path(repo).resolve()
    run = runner or _subprocess_runner
    fetch_options = ("--depth", str(depth)) if depth is not None else ()
    base = ("git", "fetch", *fetch_options, "--no-tags", remote, *refspecs)
    attempts: list[Attempt] = []
    result = run(base, root)
    attempts.append(_attempt("fetch", result))
    if result.returncode == 0:
        return OperationResult(STATE_FETCH_SUCCEEDED, tuple(attempts))
    if classify_transport_error(result.stderr + "\n" + result.stdout) is not None:
        _backoff(backoff_seconds)
        fallback = ("git", "-c", "http.version=HTTP/1.1", "fetch", *fetch_options, "--no-tags", remote, *refspecs)
        result = run(fallback, root)
        attempts.append(_attempt("fetch-http11", result))
        if result.returncode == 0:
            return OperationResult(STATE_FETCH_SUCCEEDED, tuple(attempts), resolution_state=STATE_SAFE_RETRY_ALLOWED, retried=True)
    return OperationResult(STATE_FETCH_FAILED, tuple(attempts), retried=len(attempts) > 1)


def _remote_ref_line(ref: str) -> str:
    if ref.startswith("refs/"):
        return ref
    return f"refs/heads/{ref}"


def verify_ref(
    repo: str | Path,
    ref: str,
    *,
    remote: str = "origin",
    runner: Runner | None = None,
    backoff_seconds: float = DEFAULT_BACKOFF_SECONDS,
) -> tuple[str | None, OperationResult]:
    """Read one remote ref without updating local refs."""

    root = Path(repo).resolve()
    run = runner or _subprocess_runner
    remote_ref = _remote_ref_line(ref)
    command = ("git", "ls-remote", remote, remote_ref)
    result = run(command, root)
    attempts = [_attempt("verify-ref", result)]
    if result.returncode != 0 and classify_transport_error(result.stderr + "\n" + result.stdout) is not None:
        _backoff(backoff_seconds)
        fallback = ("git", "-c", "http.version=HTTP/1.1", "ls-remote", remote, remote_ref)
        result = run(fallback, root)
        attempts.append(_attempt("verify-ref-http11", result))
    if result.returncode != 0:
        return None, OperationResult(STATE_EXTERNAL_VERIFICATION_REQUIRED, tuple(attempts), retried=len(attempts) > 1)
    sha: str | None = None
    for line in result.stdout.splitlines():
        parsed = _parse_ref_line(line)
        if parsed and parsed[1] == remote_ref:
            sha = parsed[0]
            break
    if sha is None:
        return None, OperationResult(STATE_REMOTE_REF_MISSING, tuple(attempts), retried=len(attempts) > 1)
    return sha, OperationResult(
        STATE_INVENTORY_SUCCEEDED,
        tuple(attempts),
        remote_sha=sha,
        resolution_state=STATE_SAFE_RETRY_ALLOWED if len(attempts) > 1 else None,
        retried=len(attempts) > 1,
    )


def _push_command(
    remote: str,
    source: str,
    ref: str,
    *,
    expected_old_sha: str | None,
    force_with_lease: bool,
    http11: bool = False,
) -> tuple[str, ...]:
    command: list[str] = ["git"]
    if http11:
        command.extend(["-c", "http.version=HTTP/1.1"])
    command.extend(["push", remote, f"{source}:{ref}"])
    if force_with_lease:
        if not expected_old_sha:
            raise ValueError("force-with-lease requires expected_old_sha")
        command.append(f"--force-with-lease={ref}:{expected_old_sha}")
    return tuple(command)


def push_ref(
    repo: str | Path,
    *,
    remote: str,
    source: str,
    ref: str,
    expected_old_sha: str | None,
    expected_new_sha: str,
    force_with_lease: bool = False,
    runner: Runner | None = None,
    backoff_seconds: float = DEFAULT_BACKOFF_SECONDS,
) -> OperationResult:
    """Push once, resolve ambiguous state, and retry at most once after an exact lease read."""

    root = Path(repo).resolve()
    run = runner or _subprocess_runner
    attempts: list[Attempt] = []
    command = _push_command(
        remote,
        source,
        ref,
        expected_old_sha=expected_old_sha,
        force_with_lease=force_with_lease,
    )
    result = run(command, root)
    attempts.append(_attempt("push", result))
    if result.returncode == 0:
        return OperationResult(STATE_PUSH_SUCCEEDED, tuple(attempts), remote_sha=expected_new_sha)
    if classify_transport_error(result.stderr + "\n" + result.stdout) is None:
        return OperationResult(STATE_PUSH_FAILED, tuple(attempts))

    _backoff(backoff_seconds)
    remote_sha, verification = verify_ref(
        repo,
        ref,
        remote=remote,
        runner=run,
        backoff_seconds=backoff_seconds,
    )
    attempts.extend(verification.attempts)
    if remote_sha == expected_new_sha:
        return OperationResult(
            STATE_AMBIGUOUS_PUSH_RESOLVED_SUCCESS,
            tuple(attempts),
            remote_sha=remote_sha,
            resolution_state=STATE_AMBIGUOUS_PUSH_RESOLVED_SUCCESS,
        )
    if expected_old_sha is None or remote_sha != expected_old_sha:
        return OperationResult(
            STATE_BLOCKED_REMOTE_MOVED,
            tuple(attempts),
            remote_sha=remote_sha,
            resolution_state=STATE_BLOCKED_REMOTE_MOVED,
        )

    retry_command = _push_command(
        remote,
        source,
        ref,
        expected_old_sha=expected_old_sha,
        force_with_lease=force_with_lease,
        http11=True,
    )
    _backoff(backoff_seconds)
    retry = run(retry_command, root)
    attempts.append(_attempt("push-http11-retry", retry))
    if retry.returncode == 0:
        return OperationResult(
            STATE_PUSH_SUCCEEDED,
            tuple(attempts),
            remote_sha=expected_new_sha,
            resolution_state=STATE_SAFE_RETRY_ALLOWED,
            retried=True,
        )

    final_sha, final_verification = verify_ref(
        repo,
        ref,
        remote=remote,
        runner=run,
        backoff_seconds=backoff_seconds,
    )
    attempts.extend(final_verification.attempts)
    if final_sha == expected_new_sha:
        return OperationResult(
            STATE_AMBIGUOUS_PUSH_RESOLVED_SUCCESS,
            tuple(attempts),
            remote_sha=final_sha,
            resolution_state=STATE_AMBIGUOUS_PUSH_RESOLVED_SUCCESS,
            retried=True,
        )
    if final_sha != expected_old_sha:
        return OperationResult(
            STATE_BLOCKED_REMOTE_MOVED,
            tuple(attempts),
            remote_sha=final_sha,
            resolution_state=STATE_BLOCKED_REMOTE_MOVED,
            retried=True,
        )
    return OperationResult(
        STATE_PUSH_FAILED,
        tuple(attempts),
        remote_sha=final_sha,
        resolution_state=STATE_SAFE_RETRY_ALLOWED,
        retried=True,
    )


def result_json(result: InventoryResult | OperationResult) -> str:
    return json.dumps(result.as_dict(), ensure_ascii=True, sort_keys=True, indent=2)
