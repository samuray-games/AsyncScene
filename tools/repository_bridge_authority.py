#!/usr/bin/env python3
"""Repository-native fail-closed guard for current bridge authority snapshots."""
from __future__ import annotations
from dataclasses import dataclass
import re
from typing import Mapping, Sequence

SLOTS = (1, 2, 3)
SHA_RE = re.compile(r"^[0-9a-f]{40}$")

@dataclass(frozen=True)
class BridgeAuthority:
    slot: int
    mailbox_ref: str
    mailbox_head: str
    thread_id: str
    task_id: str
    execution_epoch: str
    generation: int
    task_branch: str
    authorized_baseline: str
    claim_path: str
    claim_identity: str
    inbox_path: str
    inbox_identity: str
    authorized_write_scope: tuple[str, ...]
    publication_target: str
    requires_continuation: bool = False

def validate_authority(a: BridgeAuthority, current: BridgeAuthority | None = None) -> list[str]:
    errors = []
    if a.slot not in SLOTS: errors.append("FAIL_SLOT_IDENTITY")
    if a.mailbox_ref != f"coordination/chatgpt-codex-bridge-{a.slot}": errors.append("FAIL_MAILBOX_REF")
    if not SHA_RE.fullmatch(a.mailbox_head): errors.append("FAIL_MAILBOX_HEAD")
    if not a.thread_id or not a.task_id or not a.execution_epoch or a.generation < 0: errors.append("FAIL_TASK_IDENTITY")
    if not a.task_branch.startswith(f"bridge/{a.slot}/") or a.task_branch.endswith("/"): errors.append("FAIL_TASK_BRANCH")
    if not SHA_RE.fullmatch(a.authorized_baseline): errors.append("FAIL_AUTHORIZED_BASELINE")
    if not a.claim_path.startswith(".ai-bridge/claims/") or a.claim_identity not in a.claim_path: errors.append("FAIL_CLAIM_IDENTITY")
    if not a.inbox_path.startswith(".ai-bridge/inbox/") or a.inbox_identity not in a.inbox_path: errors.append("FAIL_INBOX_IDENTITY")
    if not a.authorized_write_scope: errors.append("FAIL_EMPTY_WRITE_SCOPE")
    if a.publication_target == "main" or a.publication_target.endswith("/main"): errors.append("FAIL_DIRECT_MAIN_PUBLICATION")
    values = " ".join((a.mailbox_ref, a.task_branch, a.claim_path, a.inbox_path, *a.authorized_write_scope)).lower()
    if any(f"bridge-{slot}" in values or f"bridge/{slot}/" in values for slot in SLOTS if slot != a.slot): errors.append("FAIL_CROSS_SLOT_CONTAMINATION")
    if current is not None:
        for field in ("slot", "mailbox_ref", "mailbox_head", "thread_id", "task_id", "execution_epoch", "generation", "task_branch", "authorized_baseline", "claim_path", "claim_identity", "inbox_path", "inbox_identity", "authorized_write_scope", "publication_target", "requires_continuation"):
            if getattr(a, field) != getattr(current, field): errors.append(f"FAIL_AUTHORITY_MOVED: {field}")
    return errors

def validate_continuation(a: BridgeAuthority, token: str, thread_id: str) -> list[str]:
    errors = validate_authority(a)
    if a.requires_continuation and token != "CONTINUE": errors.append("FAIL_CONTINUATION_TOKEN")
    if a.requires_continuation and thread_id != a.thread_id: errors.append("FAIL_CONTINUATION_THREAD")
    return errors

def authority_from_mapping(data: Mapping[str, object]) -> BridgeAuthority:
    scope = data.get("authorized_write_scope", ())
    if not isinstance(scope, Sequence) or isinstance(scope, (str, bytes)): raise ValueError("authorized_write_scope must be a sequence")
    return BridgeAuthority(int(data["slot"]), str(data["mailbox_ref"]), str(data["mailbox_head"]), str(data["thread_id"]), str(data["task_id"]), str(data["execution_epoch"]), int(data["generation"]), str(data["task_branch"]), str(data["authorized_baseline"]), str(data["claim_path"]), str(data["claim_identity"]), str(data["inbox_path"]), str(data["inbox_identity"]), tuple(str(x) for x in scope), str(data["publication_target"]), bool(data.get("requires_continuation", False)))
