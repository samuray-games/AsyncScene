#!/usr/bin/env python3
"""Resolve and verify the current Asynchronia mailbox contract from remote refs."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import subprocess
from pathlib import Path
from typing import Any

PROTOCOL = "3.3"
MAIN_REF = "refs/heads/main"
MAILBOX_REF = "refs/heads/coordination/chatgpt-codex-bridge"
MAIN_TRACKING = "refs/remotes/origin/main"
MAILBOX_TRACKING = "refs/remotes/origin/coordination/chatgpt-codex-bridge"
STATE_PATH = ".ai-bridge/STATE.json"
EXPECTED_REPOSITORY = "samuray-games/AsyncScene"
EXACT_FETCH_REFSPECS = (
    f"+{MAIN_REF}:{MAIN_TRACKING}",
    f"+{MAILBOX_REF}:{MAILBOX_TRACKING}",
)


class BridgeError(RuntimeError):
    def __init__(self, code: str, message: str, details: dict[str, Any] | None = None):
        super().__init__(message)
        self.code = code
        self.details = details or {}


def fail(code: str, message: str, **details: Any) -> None:
    raise BridgeError(code, message, details)


def run_git(repo: Path, *args: str) -> str:
    env = os.environ.copy()
    env.setdefault("GIT_TERMINAL_PROMPT", "0")
    proc = subprocess.run(
        ["git", "-C", str(repo), *args],
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env=env,
        check=False,
    )
    if proc.returncode != 0:
        fail(
            "GIT_COMMAND_FAILED",
            f"git {' '.join(args)} failed",
            returnCode=proc.returncode,
            stderr=proc.stderr.strip(),
        )
    return proc.stdout.strip()


def normalize_origin(url: str) -> str:
    value = url.strip().removesuffix(".git")
    value = value.replace("git@github.com:", "https://github.com/")
    value = value.replace("ssh://git@github.com/", "https://github.com/")
    return value.rstrip("/")


def verify_repository(repo: Path) -> None:
    root = Path(run_git(repo, "rev-parse", "--show-toplevel")).resolve()
    origin = normalize_origin(run_git(root, "remote", "get-url", "origin"))
    if not origin.endswith(EXPECTED_REPOSITORY):
        fail("BLOCKED_WRONG_REPOSITORY", "origin is not the Asynchronia repository", origin=origin)


def ls_remote(repo: Path) -> dict[str, str]:
    output = run_git(repo, "ls-remote", "--heads", "origin", MAIN_REF, MAILBOX_REF)
    found: dict[str, str] = {}
    for line in output.splitlines():
        if not line.strip():
            continue
        sha, ref = line.split("\t", 1)
        found[ref] = sha
    missing = [ref for ref in (MAIN_REF, MAILBOX_REF) if ref not in found]
    if missing:
        fail("BLOCKED_REMOTE_REF_MISSING", "required remote ref is missing", missing=missing)
    return found


def refresh_remote_tracking(repo: Path) -> tuple[str, str]:
    last: dict[str, Any] = {}
    for _ in range(3):
        before = ls_remote(repo)
        run_git(repo, "fetch", "--no-tags", "--prune", "origin", *EXACT_FETCH_REFSPECS)
        after = ls_remote(repo)
        local_main = run_git(repo, "rev-parse", MAIN_TRACKING)
        local_mailbox = run_git(repo, "rev-parse", MAILBOX_TRACKING)
        last = {
            "remoteBefore": before,
            "remoteAfter": after,
            "localMain": local_main,
            "localMailbox": local_mailbox,
        }
        if local_main == after[MAIN_REF] and local_mailbox == after[MAILBOX_REF]:
            return local_main, local_mailbox
    fail(
        "BLOCKED_STALE_REMOTE_REF",
        "remote-tracking refs do not match current ls-remote after exact fetch",
        **last,
    )


def git_show(repo: Path, commit: str, path: str) -> str:
    return run_git(repo, "show", f"{commit}:{path}")


def blob_sha(repo: Path, commit: str, path: str) -> str:
    return run_git(repo, "rev-parse", f"{commit}:{path}")


def parse_metadata(text: str) -> dict[str, str]:
    result: dict[str, str] = {}
    for raw in text.splitlines():
        line = raw.strip()
        match = re.match(r"^([A-Z][A-Z0-9_]*)\s*:\s*(.*?)\s*$", line)
        if not match:
            continue
        key, value = match.groups()
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] == "`":
            value = value[1:-1]
        result[key] = value
    return result


def canonical_digest(payload: dict[str, Any]) -> str:
    encoded = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def require_equal(actual: Any, expected: Any, label: str) -> None:
    if actual != expected:
        fail("BLOCKED_CONTRACT_MISMATCH", f"{label} mismatch", actual=actual, expected=expected)


def load_state(repo: Path, mailbox_head: str) -> tuple[dict[str, Any], str]:
    try:
        raw = git_show(repo, mailbox_head, STATE_PATH)
    except BridgeError as exc:
        fail("BLOCKED_STATE_JSON_MISSING", f"{STATE_PATH} is required by Protocol {PROTOCOL}", cause=exc.code)
    try:
        state = json.loads(raw)
    except json.JSONDecodeError as exc:
        fail("BLOCKED_STATE_JSON_INVALID", "STATE.json is not valid JSON", error=str(exc))
    if not isinstance(state, dict):
        fail("BLOCKED_STATE_JSON_INVALID", "STATE.json root must be an object")
    require_equal(str(state.get("bridgeProtocol")), PROTOCOL, "bridgeProtocol")
    return state, blob_sha(repo, mailbox_head, STATE_PATH)


def resolve_contract(repo: Path, slot_number: int, require_current_baseline: bool) -> dict[str, Any]:
    verify_repository(repo)
    main_head, mailbox_head = refresh_remote_tracking(repo)
    state, state_blob = load_state(repo, mailbox_head)
    slots = state.get("slots")
    if not isinstance(slots, dict):
        fail("BLOCKED_STATE_SCHEMA", "STATE.json slots must be an object")
    slot = slots.get(str(slot_number))
    if not isinstance(slot, dict):
        fail("BRIDGE_SLOT_UNAVAILABLE", "requested slot is absent", slot=slot_number)
    status = str(slot.get("status", ""))
    if status in {"CLOSED", "UNAVAILABLE", ""}:
        fail("BRIDGE_SLOT_UNAVAILABLE", "requested slot is not open", slot=slot_number, status=status)

    required_slot_fields = (
        "threadId",
        "laneId",
        "taskId",
        "executionEpoch",
        "phase",
        "inboxPath",
        "claimPath",
        "expectedOutboxPath",
        "baseline",
    )
    missing = [key for key in required_slot_fields if not slot.get(key)]
    if missing:
        fail("BLOCKED_STATE_SCHEMA", "open slot is missing required fields", missing=missing)

    inbox_path = str(slot["inboxPath"])
    claim_path = str(slot["claimPath"])
    inbox = parse_metadata(git_show(repo, mailbox_head, inbox_path))
    claim = parse_metadata(git_show(repo, mailbox_head, claim_path))

    expected = {
        "BRIDGE_PROTOCOL": PROTOCOL,
        "THREAD_ID": str(slot["threadId"]),
        "LANE_ID": str(slot["laneId"]),
        "TASK_ID": str(slot["taskId"]),
        "EXECUTION_EPOCH": str(slot["executionEpoch"]),
        "EXPECTED_OUTBOX": str(slot["expectedOutboxPath"]),
    }
    for key, value in expected.items():
        require_equal(inbox.get(key), value, f"inbox {key}")
        require_equal(claim.get(key), value, f"claim {key}")
    require_equal(inbox.get("BRIDGE_SLOT"), str(slot_number), "inbox BRIDGE_SLOT")
    require_equal(claim.get("SLOT"), str(slot_number), "claim SLOT")
    require_equal(inbox.get("REMOTE_MAIN_BASELINE"), str(slot["baseline"]), "inbox baseline")
    require_equal(claim.get("BASELINE"), str(slot["baseline"]), "claim baseline")
    if require_current_baseline:
        require_equal(str(slot["baseline"]), main_head, "current remote main baseline")

    digest_input = {
        "bridgeProtocol": PROTOCOL,
        "mailboxGeneration": state.get("mailboxGeneration"),
        "stateRevision": state.get("stateRevision"),
        "slot": slot_number,
        "status": status,
        "threadId": slot["threadId"],
        "laneId": slot["laneId"],
        "taskId": slot["taskId"],
        "executionEpoch": slot["executionEpoch"],
        "phase": slot["phase"],
        "baseline": slot["baseline"],
        "inboxPath": inbox_path,
        "claimPath": claim_path,
        "expectedOutboxPath": slot["expectedOutboxPath"],
        "stateBlobSha": state_blob,
        "inboxBlobSha": blob_sha(repo, mailbox_head, inbox_path),
        "claimBlobSha": blob_sha(repo, mailbox_head, claim_path),
    }
    return {
        "ok": True,
        "status": "BRIDGE_CONTRACT_RESOLVED",
        "bridgeProtocol": PROTOCOL,
        "mainHead": main_head,
        "mailboxHead": mailbox_head,
        **digest_input,
        "contractDigest": canonical_digest(digest_input),
        "primaryWriteRequired": bool(slot.get("primaryWriteRequired", False)),
        "allowVerifiedNoDelta": bool(slot.get("allowVerifiedNoDelta", False)),
        "threadRotationRequired": bool(slot.get("threadRotationRequired", False)),
        "safariStatus": slot.get("safariStatus"),
    }


def verify_outbox(repo: Path, slot_number: int) -> dict[str, Any]:
    envelope = resolve_contract(repo, slot_number, require_current_baseline=False)
    mailbox_head = str(envelope["mailboxHead"])
    outbox_path = str(envelope["expectedOutboxPath"])
    try:
        outbox_text = git_show(repo, mailbox_head, outbox_path)
    except BridgeError as exc:
        fail("FAIL_NO_EXECUTION_EVIDENCE", "current expected outbox is absent", path=outbox_path, cause=exc.code)
    outbox = parse_metadata(outbox_text)
    parent = run_git(repo, "rev-parse", f"{mailbox_head}^")
    changed = [p for p in run_git(repo, "diff-tree", "--no-commit-id", "--name-only", "-r", mailbox_head).splitlines() if p]
    require_equal(changed, [outbox_path], "mailbox commit changed paths")
    require_equal(outbox.get("EXPECTED_OUTBOX"), outbox_path, "outbox expected path")
    require_equal(outbox.get("MAILBOX_PARENT"), parent, "outbox mailbox parent")
    require_equal(outbox.get("CONTRACT_DIGEST"), envelope["contractDigest"], "outbox contract digest")
    require_equal(outbox.get("STATE_BLOB_SHA"), envelope["stateBlobSha"], "outbox state blob")
    require_equal(outbox.get("INBOX_BLOB_SHA"), envelope["inboxBlobSha"], "outbox inbox blob")
    require_equal(outbox.get("CLAIM_BLOB_SHA"), envelope["claimBlobSha"], "outbox claim blob")
    require_equal(outbox.get("THREAD_ID"), envelope["threadId"], "outbox thread")
    require_equal(outbox.get("EXECUTION_EPOCH"), envelope["executionEpoch"], "outbox epoch")

    primary_commit = outbox.get("PRIMARY_COMMIT")
    completion_mode = outbox.get("COMPLETION_MODE")
    if completion_mode == "PRIMARY_DELTA":
        require_equal(primary_commit, envelope["mainHead"], "outbox primary commit")
        actual_parent = run_git(repo, "rev-parse", f"{primary_commit}^")
        require_equal(outbox.get("PRIMARY_PARENT"), actual_parent, "outbox primary parent")
        require_equal(actual_parent, envelope["baseline"], "primary direct-child baseline")
    elif completion_mode == "VERIFIED_NO_DELTA":
        require_equal(primary_commit, envelope["baseline"], "verified-no-delta primary commit")
        require_equal(outbox.get("PRIMARY_PARENT"), "N/A", "verified-no-delta primary parent")
    else:
        fail("BLOCKED_OUTBOX_SCHEMA", "unsupported completion mode", completionMode=completion_mode)

    return {
        **envelope,
        "status": "OUTBOX_VERIFIED",
        "mailboxParent": parent,
        "outboxPath": outbox_path,
        "outboxBlobSha": blob_sha(repo, mailbox_head, outbox_path),
        "completionMode": completion_mode,
        "primaryCommit": primary_commit,
        "primaryParent": outbox.get("PRIMARY_PARENT"),
    }


def self_test() -> dict[str, Any]:
    sample = "BRIDGE_PROTOCOL: 3.3\nTHREAD_ID: `T-1`\nSLOT: 1\n"
    assert parse_metadata(sample) == {"BRIDGE_PROTOCOL": "3.3", "THREAD_ID": "T-1", "SLOT": "1"}
    assert canonical_digest({"b": 2, "a": 1}) == canonical_digest({"a": 1, "b": 2})
    assert EXACT_FETCH_REFSPECS == (
        "+refs/heads/main:refs/remotes/origin/main",
        "+refs/heads/coordination/chatgpt-codex-bridge:refs/remotes/origin/coordination/chatgpt-codex-bridge",
    )
    return {
        "ok": True,
        "status": "SELF_TEST_PASS",
        "protocol": PROTOCOL,
        "fetchRefspecs": list(EXACT_FETCH_REFSPECS),
        "statePath": STATE_PATH,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", default=".")
    parser.add_argument("--slot", type=int, choices=(1, 2, 3))
    parser.add_argument("--mode", choices=("resolve", "verify-outbox"), default="resolve")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    try:
        if args.self_test:
            result = self_test()
        else:
            if args.slot is None:
                fail("USAGE_ERROR", "--slot is required unless --self-test is used")
            repo = Path(args.repo).resolve()
            result = resolve_contract(repo, args.slot, require_current_baseline=True) if args.mode == "resolve" else verify_outbox(repo, args.slot)
        print(json.dumps(result, ensure_ascii=False, sort_keys=True, indent=2))
        return 0
    except BridgeError as exc:
        print(json.dumps({"ok": False, "status": exc.code, "message": str(exc), **exc.details}, ensure_ascii=False, sort_keys=True, indent=2))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
