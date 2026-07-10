#!/usr/bin/env python3
"""Executable closed-loop bridge contract for PR-mode bridge 062."""

from __future__ import annotations

from dataclasses import asdict, dataclass
from pathlib import PurePosixPath
import re
from typing import Any, Final

CONTRACT_VERSION: Final[str] = "2.0.0"
POLICY_VERSION: Final[str] = "CLOUD_PR_CLOSED_LOOP_20260710_BRIDGE_062"
BRIDGE_PROTOCOL: Final[str] = "3.3"
BASE_COMMIT: Final[str] = "32513f02daf5943c41f24328e1ae251d6bc85ccc"
SUCCESS_ACTION_CODE: Final[str] = "OPEN_FRESH_CHATGPT_VERIFIER_AND_SEND_SAME_BRIDGE_COMMAND"
SUCCESS_ACTION_TEXT: Final[str] = "Open a fresh ChatGPT verifier and send the same bridge command."
PR_NEXT_ACTION_CODE: Final[str] = "RETURN_TO_CHATGPT_FOR_INDEPENDENT_PR_VERIFICATION"
SHA_RE: Final[re.Pattern[str]] = re.compile(r"[0-9a-f]{40}")
REPEATED_SHA_RE: Final[re.Pattern[str]] = re.compile(r"([0-9a-f])\1{39}")
SYNTHETIC_SHA_VALUES: Final[frozenset[str]] = frozenset({chunk * 5 for chunk in ("cafebabe", "deadbeef", "feedface")}) | frozenset({char * 40 for char in "0123456789abcdef"})

ACTIVE_IDENTITY: Final[dict[str, Any]] = {
    "cycle": "CYCLE-20260709-001",
    "generation": 17,
    "slot": 3,
    "threadId": "BRIDGE-20260710-062",
    "laneId": "PROCESS-CLOSED-LOOP-CLOUD-PR-HANDOFF",
    "taskId": "TASK-PROCESS-CLOSED-LOOP-CORE-COMPLETION",
    "executionEpoch": "CLOSED-LOOP-CLOUD-PR-R1-20260710-1348JST",
    "taskNonce": "CLV1-062-PR-3251-1348",
    "coordinatorMemoryRevision": "2026-07-10-1348-JST",
    "baseline": BASE_COMMIT,
    "inboxPath": ".ai-bridge/inbox/BRIDGE-20260710-062-01-chatgpt.md",
    "claimPath": ".ai-bridge/claims/BRIDGE-20260710-062-claim-v1-codex.md",
    "expectedOutboxPath": ".ai-bridge/outbox/BRIDGE-20260710-062-02-chatgpt.md",
    "expectedReceiptPath": ".ai-bridge/receipts/BRIDGE-20260710-062-03-chatgpt.md",
}

AUTHORIZED_PATHS: Final[tuple[str, ...]] = (
    "AGENTS.md", "AGENTS.override.md", "PROCESS_ROOT_SYNC.md", "ORCHESTRATION.md", "BRIDGE.md",
    "CODEX_BRIDGE_BOOTSTRAP.md", "CODEX_BRIDGE_RECOVERY.md", "CLOSED_LOOP_PROTOCOL.md",
    "tools/closed_loop_contract.py", "tools/test_closed_loop_contract.py", "tools/validate-orchestration-policy.py",
    "TASKS.md", "PROJECT_MEMORY.md",
)
ABSENT_ON_MAIN_PREFIXES: Final[tuple[str, ...]] = (".ai-bridge/inbox/", ".ai-bridge/claims/", ".ai-bridge/outbox/", ".ai-bridge/receipts/")
ILLEGAL_PRIMARY_REQUIRED_STATUSES: Final[frozenset[str]] = frozenset({"BLOCKED_NO_REMOTE_OUTBOX", "BLOCKED_NO_SOURCE_DELTA", "BLOCKED_PLUGIN_UNAVAILABLE"})
LEGAL_STATES: Final[tuple[str, ...]] = (
    "CLOSED", "PREPARING", "READY_FOR_CODEX", "EXECUTING", "PRIMARY_PUBLISHED", "OUTBOX_PUBLISHING",
    "AWAITING_CHATGPT_VERIFICATION", "ACCEPTED", "CORRECTION_REQUIRED", "RECOVERY_REQUIRED", "BLOCKED_EXTERNAL", "SUPERSEDED",
)
LEGAL_TRANSITIONS: Final[dict[str, tuple[str, ...]]] = {
    "CLOSED": ("PREPARING",),
    "PREPARING": ("READY_FOR_CODEX", "BLOCKED_EXTERNAL"),
    "READY_FOR_CODEX": ("EXECUTING", "CORRECTION_REQUIRED", "BLOCKED_EXTERNAL"),
    "EXECUTING": ("PRIMARY_PUBLISHED", "RECOVERY_REQUIRED", "CORRECTION_REQUIRED", "BLOCKED_EXTERNAL"),
    "PRIMARY_PUBLISHED": ("OUTBOX_PUBLISHING",),
    "OUTBOX_PUBLISHING": ("AWAITING_CHATGPT_VERIFICATION", "RECOVERY_REQUIRED", "BLOCKED_EXTERNAL"),
    "AWAITING_CHATGPT_VERIFICATION": ("ACCEPTED", "CORRECTION_REQUIRED", "RECOVERY_REQUIRED", "BLOCKED_EXTERNAL"),
    "ACCEPTED": ("SUPERSEDED",),
    "CORRECTION_REQUIRED": ("PREPARING", "READY_FOR_CODEX", "EXECUTING", "RECOVERY_REQUIRED"),
    "RECOVERY_REQUIRED": ("PREPARING", "READY_FOR_CODEX", "EXECUTING", "BLOCKED_EXTERNAL"),
    "BLOCKED_EXTERNAL": ("SUPERSEDED", "RECOVERY_REQUIRED"),
    "SUPERSEDED": (),
}
TRANSITION_ORACLE: Final[frozenset[tuple[str, str]]] = frozenset({
    ("CLOSED", "PREPARING"),
    ("PREPARING", "READY_FOR_CODEX"), ("PREPARING", "BLOCKED_EXTERNAL"),
    ("READY_FOR_CODEX", "EXECUTING"), ("READY_FOR_CODEX", "CORRECTION_REQUIRED"), ("READY_FOR_CODEX", "BLOCKED_EXTERNAL"),
    ("EXECUTING", "PRIMARY_PUBLISHED"), ("EXECUTING", "RECOVERY_REQUIRED"), ("EXECUTING", "CORRECTION_REQUIRED"), ("EXECUTING", "BLOCKED_EXTERNAL"),
    ("PRIMARY_PUBLISHED", "OUTBOX_PUBLISHING"),
    ("OUTBOX_PUBLISHING", "AWAITING_CHATGPT_VERIFICATION"), ("OUTBOX_PUBLISHING", "RECOVERY_REQUIRED"), ("OUTBOX_PUBLISHING", "BLOCKED_EXTERNAL"),
    ("AWAITING_CHATGPT_VERIFICATION", "ACCEPTED"), ("AWAITING_CHATGPT_VERIFICATION", "CORRECTION_REQUIRED"), ("AWAITING_CHATGPT_VERIFICATION", "RECOVERY_REQUIRED"), ("AWAITING_CHATGPT_VERIFICATION", "BLOCKED_EXTERNAL"),
    ("ACCEPTED", "SUPERSEDED"),
    ("CORRECTION_REQUIRED", "PREPARING"), ("CORRECTION_REQUIRED", "READY_FOR_CODEX"), ("CORRECTION_REQUIRED", "EXECUTING"), ("CORRECTION_REQUIRED", "RECOVERY_REQUIRED"),
    ("RECOVERY_REQUIRED", "PREPARING"), ("RECOVERY_REQUIRED", "READY_FOR_CODEX"), ("RECOVERY_REQUIRED", "EXECUTING"), ("RECOVERY_REQUIRED", "BLOCKED_EXTERNAL"),
    ("BLOCKED_EXTERNAL", "SUPERSEDED"), ("BLOCKED_EXTERNAL", "RECOVERY_REQUIRED"),
})

TERMINAL_TUPLES: Final[dict[str, tuple[str, str, str, str, str, str]]] = {
    "PASS_PUSHED": ("PRIMARY_DELTA", "AWAITING_CHATGPT_VERIFICATION", "SOURCE_IMPLEMENTATION_PENDING_CHATGPT", "NONE", SUCCESS_ACTION_CODE, SUCCESS_ACTION_TEXT),
    "PASS_VERIFIED_NO_DELTA": ("VERIFIED_NO_DELTA", "AWAITING_CHATGPT_VERIFICATION", "SOURCE_IMPLEMENTATION_PENDING_CHATGPT", "NONE", SUCCESS_ACTION_CODE, SUCCESS_ACTION_TEXT),
    "BLOCKED_EXTERNAL": ("BLOCKED", "BLOCKED_EXTERNAL", "BLOCKED", "EXTERNAL", "RESOLVE_EXTERNAL_BLOCKER", "Resolve the external blocker and rerun the same bridge command."),
    "BLOCKED_OUTBOX_PUBLICATION": ("PUBLICATION_RECOVERY_REQUIRED", "RECOVERY_REQUIRED", "FAILED", "PUBLICATION", "REPAIR_OUTBOX_PUBLICATION", "Repair outbox publication and rerun the same bridge command."),
    "CORRECTION_REQUIRED": ("CORRECTION_REQUIRED", "CORRECTION_REQUIRED", "FAILED", "SOURCE", "IMPLEMENT_CORRECTION_AND_RERUN", "Implement the correction and rerun the same bridge command."),
}

@dataclass(frozen=True)
class ClosedLoopState:
    cycle: str
    generation: int
    slot: int
    threadId: str
    laneId: str
    taskId: str
    executionEpoch: str
    taskNonce: str
    coordinatorMemoryRevision: str
    baseline: str
    inboxPath: str
    claimPath: str
    expectedOutboxPath: str
    expectedReceiptPath: str


def active_state() -> ClosedLoopState:
    return ClosedLoopState(**ACTIVE_IDENTITY)


def require_sha(value: str, label: str) -> None:
    if not isinstance(value, str) or not SHA_RE.fullmatch(value):
        raise ValueError(f"{label} must be a strict lowercase 40-hex sha")
    if REPEATED_SHA_RE.fullmatch(value) or value in SYNTHETIC_SHA_VALUES:
        raise ValueError(f"{label} must not be a repeated synthetic sha")


def validate_identity(candidate: ClosedLoopState | dict[str, Any], active: ClosedLoopState | dict[str, Any] | None = None) -> None:
    expected = asdict(active or active_state()) if isinstance(active or active_state(), ClosedLoopState) else dict(active)  # type: ignore[arg-type]
    actual = asdict(candidate) if isinstance(candidate, ClosedLoopState) else dict(candidate)
    if set(actual) != set(expected):
        raise ValueError(f"identity fields mismatch: missing={sorted(set(expected)-set(actual))} extra={sorted(set(actual)-set(expected))}")
    for key, expected_value in expected.items():
        if actual[key] != expected_value:
            raise ValueError(f"identity mismatch for {key}")
    require_sha(actual["baseline"], "baseline")


def validate_transition(current_state: str, next_state: str) -> None:
    if current_state not in LEGAL_STATES or next_state not in LEGAL_STATES:
        raise ValueError("transition state is outside canonical 12-state set")
    if (current_state, next_state) not in TRANSITION_ORACLE:
        raise ValueError(f"illegal transition: {current_state} -> {next_state}")


def _require_exact_keys(payload: dict[str, Any], keys: tuple[str, ...], schema_name: str) -> None:
    missing = sorted(set(keys) - set(payload))
    extra = sorted(set(payload) - set(keys))
    if missing or extra:
        raise ValueError(f"{schema_name} keys mismatch: missing={missing} extra={extra}")


def _validate_path_list(paths: list[str], label: str, *, exact_scope: bool, allow_empty: bool = False) -> None:
    if (not allow_empty and not paths) or any(not isinstance(p, str) or not p for p in paths):
        raise ValueError(f"{label} must be a non-empty list of paths")
    if any(PurePosixPath(p).is_absolute() or ".." in PurePosixPath(p).parts for p in paths):
        raise ValueError(f"{label} contains unsafe path")
    if exact_scope and tuple(sorted(paths)) != tuple(sorted(AUTHORIZED_PATHS)):
        raise ValueError(f"{label} must equal frozen authorized scope")
    protected = sorted(set(paths) - set(AUTHORIZED_PATHS))
    if protected:
        raise ValueError(f"{label} contains protected paths: {protected}")
    if any(p.startswith(".ai-bridge/") for p in paths):
        raise ValueError(f"{label} must not include mailbox artifacts")


def validate_changed_paths(actual: list[str], authorized: list[str], *, allow_no_delta: bool = False) -> None:
    _validate_path_list(actual, "changedPaths", exact_scope=False, allow_empty=allow_no_delta)
    _validate_path_list(authorized, "authorizedPaths", exact_scope=True)
    expected = () if allow_no_delta else tuple(sorted(authorized))
    if tuple(sorted(actual)) != expected:
        raise ValueError("changedPaths must be empty for verified no-delta or exactly equal authorizedPaths for primary delta")


def validate_main_absence(paths: list[str], *, main_tree_paths: list[str] | None = None, main_commit: str | None = None) -> None:
    if main_commit is not None:
        require_sha(main_commit, "mainCommit")
    candidates = list(paths)
    if main_tree_paths is not None:
        candidates.extend(main_tree_paths)
    forbidden = [p for p in candidates if p.startswith(ABSENT_ON_MAIN_PREFIXES)]
    if forbidden:
        raise ValueError(f"active bridge artifacts must remain absent from main: {forbidden}")


OUTBOX_PRE_PUBLICATION_SCHEMA: Final[tuple[str, ...]] = (
    "status", "completionMode", "phase", "verifierClassification", "recoveryClassification", "nextActionCode", "nextActionText",
    "activeIdentity", "stateBlobSha", "mailboxParentCommit", "primaryCommitSha", "primaryParent", "changedPaths", "authorizedPaths", "validationResults",
)
VERIFIED_NO_DELTA_OUTBOX_SCHEMA: Final[tuple[str, ...]] = (
    "status", "completionMode", "phase", "verifierClassification", "recoveryClassification", "nextActionCode", "nextActionText",
    "activeIdentity", "stateBlobSha", "mailboxParentCommit", "primaryCommitSha", "primaryParent", "changedPaths", "authorizedPaths", "validationResults", "reasonNoSourceDelta",
)
RECEIPT_SCHEMA: Final[tuple[str, ...]] = (
    "status", "completionMode", "phase", "verifierClassification", "recoveryClassification", "nextActionCode", "nextActionText",
    "activeIdentity", "stateBlobSha", "mailboxParentCommit", "outboxPublicationCommit", "outboxBlobSha", "primaryCommitSha", "primaryParent", "changedPaths", "authorizedPaths", "validationResults",
)

def validate_terminal_tuple(payload: dict[str, Any]) -> None:
    status = payload.get("status")
    if status in ILLEGAL_PRIMARY_REQUIRED_STATUSES:
        raise ValueError(f"illegal primary-required status: {status}")
    if status not in TERMINAL_TUPLES:
        raise ValueError(f"unknown status: {status}")
    keys = ("completionMode", "phase", "verifierClassification", "recoveryClassification", "nextActionCode", "nextActionText")
    if tuple(payload.get(k) for k in keys) != TERMINAL_TUPLES[status]:
        raise ValueError(f"terminal tuple mismatch for {status}")


def validate_outbox(payload: dict[str, Any], *, post_publication: bool = False) -> None:
    if post_publication:
        raise ValueError("outbox is always pre-publication; publication evidence belongs only in receipt")
    status = payload.get("status")
    schema = VERIFIED_NO_DELTA_OUTBOX_SCHEMA if status == "PASS_VERIFIED_NO_DELTA" else OUTBOX_PRE_PUBLICATION_SCHEMA
    _require_exact_keys(payload, schema, "outbox")
    if "outboxPublicationCommit" in payload or "outboxBlobSha" in payload:
        raise ValueError("outbox must not contain publication evidence")
    validate_identity(payload["activeIdentity"])
    validate_terminal_tuple(payload)
    for field in ("stateBlobSha", "mailboxParentCommit", "primaryCommitSha"):
        require_sha(payload[field], field)
    if payload["primaryParent"] != "N/A":
        require_sha(payload["primaryParent"], "primaryParent")
    validate_changed_paths(payload["changedPaths"], payload["authorizedPaths"], allow_no_delta=status == "PASS_VERIFIED_NO_DELTA")
    validate_main_absence(payload["changedPaths"])


def validate_receipt(payload: dict[str, Any]) -> None:
    _require_exact_keys(payload, RECEIPT_SCHEMA, "receipt")
    validate_identity(payload["activeIdentity"])
    validate_terminal_tuple(payload)
    for field in ("stateBlobSha", "mailboxParentCommit", "outboxPublicationCommit", "outboxBlobSha", "primaryCommitSha"):
        require_sha(payload[field], field)
    if payload["primaryParent"] != "N/A":
        require_sha(payload["primaryParent"], "primaryParent")
    validate_changed_paths(payload["changedPaths"], payload["authorizedPaths"], allow_no_delta=payload.get("status") == "PASS_VERIFIED_NO_DELTA")
    validate_main_absence(payload["changedPaths"])


def accept_closed_loop_source(report: dict[str, Any]) -> bool:
    return report.get("sourceImplementationAccepted") is True and report.get("canaryAccepted") is True


def evaluate_control(name: str, payload: dict[str, Any]) -> bool:
    controls = {
        "identity": lambda: validate_identity(payload["identity"]) is None,
        "outbox": lambda: validate_outbox(payload["outbox"]) is None,
        "receipt": lambda: validate_receipt(payload["receipt"]) is None,
        "transition": lambda: validate_transition(payload["current"], payload["next"]) is None,
        "changed_paths": lambda: validate_changed_paths(payload["changedPaths"], payload["authorizedPaths"]) is None,
        "main_absence": lambda: validate_main_absence(payload["pathsOnMain"]) is None,
        "terminal_tuple": lambda: validate_terminal_tuple(payload["terminal"]) is None,
        "sha": lambda: require_sha(payload["sha"], "sha") is None,
        "acceptance": lambda: accept_closed_loop_source(payload["report"]),
    }
    if name not in controls:
        raise ValueError(f"unknown control: {name}")
    return bool(controls[name]())


def serialize(state: ClosedLoopState) -> dict[str, Any]:
    return asdict(state)


def load_state(data: dict[str, Any]) -> ClosedLoopState:
    state = ClosedLoopState(**data)
    validate_identity(state)
    return state


def self_check() -> dict[str, Any]:
    validate_identity(active_state())
    implementation_edges = frozenset((s, t) for s, targets in LEGAL_TRANSITIONS.items() for t in targets)
    if implementation_edges != TRANSITION_ORACLE:
        raise ValueError("implementation transition table diverges from immutable oracle")
    for current in LEGAL_STATES:
        for target in LEGAL_STATES:
            legal = (current, target) in TRANSITION_ORACLE
            try:
                validate_transition(current, target)
            except ValueError:
                if legal:
                    raise
            else:
                if not legal:
                    raise ValueError(f"oracle mismatch: {current}->{target}")
    return {"contractVersion": CONTRACT_VERSION, "activeIdentity": ACTIVE_IDENTITY, "states": LEGAL_STATES, "authorizedPaths": AUTHORIZED_PATHS}
