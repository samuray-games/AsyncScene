#!/usr/bin/env python3
"""Repository-native, fail-closed bridge authority and continuation guard."""

from __future__ import annotations

from dataclasses import dataclass
import re
from typing import Mapping, Sequence

SLOTS = (1, 2, 3)
SHA_RE = re.compile(r"^[0-9a-f]{40}$")
CONTINUATION_TOKEN = "CONTINUE"


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


def _fail(errors: list[str], message: str) -> None:
    errors.append(message)


def validate_authority(authority: BridgeAuthority, current: BridgeAuthority | None = None) -> list[str]:
    """Validate a current authority snapshot, optionally against a fresh snapshot."""
    errors: list[str] = []
    if authority.slot not in SLOTS:
        _fail(errors, "FAIL_SLOT_IDENTITY")
    expected_mailbox = f"coordination/chatgpt-codex-bridge-{authority.slot}"
    expected_prefix = f"bridge/{authority.slot}/"
    if authority.mailbox_ref != expected_mailbox:
        _fail(errors, "FAIL_MAILBOX_REF")
    if not authority.mailbox_head or not SHA_RE.fullmatch(authority.mailbox_head):
        _fail(errors, "FAIL_MAILBOX_HEAD")
    if not authority.thread_id or not authority.task_id or not authority.execution_epoch or authority.generation < 0:
        _fail(errors, "FAIL_TASK_IDENTITY")
    if not authority.task_branch.startswith(expected_prefix) or authority.task_branch == expected_prefix:
        _fail(errors, "FAIL_TASK_BRANCH")
    if not SHA_RE.fullmatch(authority.authorized_baseline):
        _fail(errors, "FAIL_AUTHORIZED_BASELINE")
    if not authority.claim_path.startswith(".ai-bridge/claims/") or authority.claim_identity not in authority.claim_path:
        _fail(errors, "FAIL_CLAIM_IDENTITY")
    if not authority.inbox_path.startswith(".ai-bridge/inbox/") or authority.inbox_identity not in authority.inbox_path:
        _fail(errors, "FAIL_INBOX_IDENTITY")
    if not authority.authorized_write_scope:
        _fail(errors, "FAIL_EMPTY_WRITE_SCOPE")
    if authority.publication_target == "main" or authority.publication_target.endswith("/main"):
        _fail(errors, "FAIL_DIRECT_MAIN_PUBLICATION")
    all_values = " ".join((authority.mailbox_ref, authority.task_branch, authority.claim_path, authority.inbox_path, *authority.authorized_write_scope)).lower()
    for slot in SLOTS:
        if slot != authority.slot and (f"bridge-{slot}" in all_values or f"bridge/{slot}/" in all_values):
            _fail(errors, "FAIL_CROSS_SLOT_CONTAMINATION")
    if current is not None:
        for field in ("slot", "mailbox_ref", "mailbox_head", "thread_id", "task_id", "execution_epoch", "generation", "task_branch", "authorized_baseline", "claim_path", "claim_identity", "inbox_path", "inbox_identity", "authorized_write_scope", "publication_target", "requires_continuation"):
            if getattr(authority, field) != getattr(current, field):
                _fail(errors, f"FAIL_AUTHORITY_MOVED: {field}")
    return errors


def validate_continuation(authority: BridgeAuthority, token: str, thread_id: str) -> list[str]:
    errors = validate_authority(authority)
    if authority.requires_continuation and token != CONTINUATION_TOKEN:
        _fail(errors, "FAIL_CONTINUATION_TOKEN")
    if authority.requires_continuation and thread_id != authority.thread_id:
        _fail(errors, "FAIL_CONTINUATION_THREAD")
    return errors


def authority_from_mapping(data: Mapping[str, object]) -> BridgeAuthority:
    """Build an authority snapshot without loading any external package."""
    scope = data.get("authorized_write_scope", ())
    if not isinstance(scope, Sequence) or isinstance(scope, (str, bytes)):
        raise ValueError("authorized_write_scope must be a sequence")
    return BridgeAuthority(
        slot=int(data["slot"]), mailbox_ref=str(data["mailbox_ref"]), mailbox_head=str(data["mailbox_head"]),
        thread_id=str(data["thread_id"]), task_id=str(data["task_id"]), execution_epoch=str(data["execution_epoch"]),
        generation=int(data["generation"]), task_branch=str(data["task_branch"]), authorized_baseline=str(data["authorized_baseline"]),
        claim_path=str(data["claim_path"]), claim_identity=str(data["claim_identity"]), inbox_path=str(data["inbox_path"]),
        inbox_identity=str(data["inbox_identity"]), authorized_write_scope=tuple(str(item) for item in scope),
        publication_target=str(data["publication_target"]), requires_continuation=bool(data.get("requires_continuation", False)),
    )
