#!/usr/bin/env python3
"""Shared closed-loop bridge contract for Asynchronia."""

from __future__ import annotations

from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Final

CONTRACT_VERSION: Final[str] = "1.0.1"
POLICY_VERSION: Final[str] = "CODEX_AUTOPILOT_2026_07_09_CLOSED_LOOP_V1_1"
BRIDGE_PROTOCOL: Final[str] = "3.3"
EXPECTED_OUTBOX_SUFFIX: Final[str] = "-02-codex.md"
FORBIDDEN_RUNTIME_GATE: Final[str] = "runtime-safety-gate"

LEGAL_STATES: Final[tuple[str, ...]] = (
    "CLOSED",
    "PREPARING",
    "READY_FOR_CODEX",
    "EXECUTING",
    "PRIMARY_PUBLISHED",
    "OUTBOX_PUBLISHING",
    "AWAITING_CHATGPT_VERIFICATION",
    "ACCEPTED",
    "CORRECTION_REQUIRED",
    "RECOVERY_REQUIRED",
    "BLOCKED_EXTERNAL",
    "SUPERSEDED",
)

LEGAL_TRANSITIONS: Final[dict[str, tuple[str, ...]]] = {
    "CLOSED": ("PREPARING",),
    "PREPARING": ("READY_FOR_CODEX", "BLOCKED_EXTERNAL"),
    "READY_FOR_CODEX": ("EXECUTING", "CORRECTION_REQUIRED", "BLOCKED_EXTERNAL"),
    "EXECUTING": ("PRIMARY_PUBLISHED", "OUTBOX_PUBLISHING", "RECOVERY_REQUIRED", "CORRECTION_REQUIRED", "BLOCKED_EXTERNAL"),
    "PRIMARY_PUBLISHED": ("OUTBOX_PUBLISHING", "AWAITING_CHATGPT_VERIFICATION"),
    "OUTBOX_PUBLISHING": ("AWAITING_CHATGPT_VERIFICATION", "RECOVERY_REQUIRED", "BLOCKED_EXTERNAL"),
    "AWAITING_CHATGPT_VERIFICATION": ("ACCEPTED", "CORRECTION_REQUIRED", "RECOVERY_REQUIRED", "BLOCKED_EXTERNAL"),
    "ACCEPTED": ("SUPERSEDED",),
    "CORRECTION_REQUIRED": ("PREPARING", "READY_FOR_CODEX", "EXECUTING", "RECOVERY_REQUIRED"),
    "RECOVERY_REQUIRED": ("PREPARING", "READY_FOR_CODEX", "EXECUTING", "BLOCKED_EXTERNAL"),
    "BLOCKED_EXTERNAL": ("SUPERSEDED", "RECOVERY_REQUIRED"),
    "SUPERSEDED": (),
}

REQUIRED_IDENTITY_FIELDS: Final[tuple[str, ...]] = (
    "bridge_slot",
    "thread_id",
    "lane_id",
    "task_id",
    "execution_epoch",
    "task_nonce",
    "coordinator_memory_rev",
    "baseline_sha",
    "inbox_path",
    "claim_path",
    "expected_outbox_path",
)

REQUIRED_OUTBOX_FIELDS: Final[tuple[str, ...]] = (
    "status",
    "completionMode",
    "primaryChanged",
    "verifiedPrimarySha",
    "primaryParent",
    "changedPaths",
    "authorizedPaths",
    "validationResults",
    "negativeControls",
    "positiveControls",
    "recoveryClassification",
    "nextAction",
    "remoteMailboxCommit",
    "remoteStateSha",
    "byteEquality",
    "outboxPath",
    "baselineSha",
    "bridgeSlot",
    "threadId",
    "laneId",
    "taskId",
    "executionEpoch",
    "taskNonce",
    "coordinatorMemoryRev",
    "policyVersion",
)

POSITIVE_CONTROLS: Final[tuple[str, ...]] = (
    "fresh_state_identity",
    "legal_transition_closed_to_preparing",
    "legal_transition_preparing_to_ready_for_codex",
    "legal_transition_ready_for_codex_to_executing",
    "legal_transition_executing_to_primary_published",
    "legal_transition_primary_published_to_outbox_publishing",
    "legal_transition_outbox_publishing_to_awaiting_chatgpt_verification",
    "legal_transition_awaiting_chatgpt_verification_to_accepted",
    "legal_transition_correction_required_to_preparing",
    "legal_transition_recovery_required_to_blocked_external",
    "startup_outbox_absence_allowed",
    "terminal_outbox_required",
    "identity_fields_complete",
    "identity_fields_exact",
    "outbox_suffix_valid",
    "outbox_schema_complete",
    "report_preserves_primary_parent",
    "report_preserves_baseline_sha",
    "report_preserves_nonce",
    "report_preserves_memory_rev",
    "report_preserves_expected_outbox",
    "report_preserves_remote_state_sha",
    "report_preserves_remote_mailbox_commit",
    "report_preserves_changed_paths",
    "report_preserves_validation_results",
    "report_preserves_negative_controls",
    "report_preserves_positive_controls",
    "report_preserves_next_action",
    "report_preserves_completion_mode",
    "report_preserves_byte_equality",
    "recovery_selects_correction_required",
    "recovery_selects_report_recovery",
    "recovery_selects_publication_recovery",
    "recovery_selects_blocked_external",
    "canary_gate_blocks_product_acceptance",
    "canary_gate_requires_separate_acceptance",
    "task_router_route_present",
    "scope_isolation_route_present",
    "model_selector_route_present",
    "parallel_scope_planner_route_present",
    "closed_loop_controller_route_present",
    "failure_routing_route_present",
)

NEGATIVE_CONTROLS: Final[tuple[str, ...]] = tuple(
    f"negative_control_{index:02d}" for index in range(1, 53)
)

RECOVERY_CLASSIFICATIONS: Final[tuple[str, ...]] = (
    "CORRECTION_REQUIRED",
    "REPORT_RECOVERY_REQUIRED",
    "PUBLICATION_RECOVERY_REQUIRED",
    "BLOCKED_EXTERNAL",
)

REPORT_SCHEMA_KEYS: Final[tuple[str, ...]] = REQUIRED_OUTBOX_FIELDS


@dataclass(frozen=True)
class ClosedLoopState:
    bridge_slot: int
    thread_id: str
    lane_id: str
    task_id: str
    execution_epoch: str
    task_nonce: str
    coordinator_memory_rev: str
    baseline_sha: str
    inbox_path: str
    claim_path: str
    expected_outbox_path: str
    remote_state_sha: str
    completion_mode: str
    result_status: str
    next_action: str
    current_state: str
    remote_mailbox_commit: str = ""
    primary_commit_sha: str = ""
    primary_parent_sha: str = "N/A"
    changed_paths: tuple[str, ...] = ()
    authorized_paths: tuple[str, ...] = ()
    validation_results: tuple[str, ...] = ()
    negative_controls: tuple[str, ...] = NEGATIVE_CONTROLS
    positive_controls: tuple[str, ...] = POSITIVE_CONTROLS
    recovery_classification: str = "CORRECTION_REQUIRED"
    byte_equality: str = "UNKNOWN"
    primary_changed: bool = False


def load_state(data: dict) -> ClosedLoopState:
    required = {
        "bridge_slot",
        "thread_id",
        "lane_id",
        "task_id",
        "execution_epoch",
        "task_nonce",
        "coordinator_memory_rev",
        "baseline_sha",
        "inbox_path",
        "claim_path",
        "expected_outbox_path",
        "remote_state_sha",
        "completion_mode",
        "result_status",
        "next_action",
        "current_state",
    }
    missing = sorted(required - data.keys())
    if missing:
        raise ValueError(f"missing fields: {missing}")
    values = {
        "bridge_slot": data["bridge_slot"],
        "thread_id": data["thread_id"],
        "lane_id": data["lane_id"],
        "task_id": data["task_id"],
        "execution_epoch": data["execution_epoch"],
        "task_nonce": data["task_nonce"],
        "coordinator_memory_rev": data["coordinator_memory_rev"],
        "baseline_sha": data["baseline_sha"],
        "inbox_path": data["inbox_path"],
        "claim_path": data["claim_path"],
        "expected_outbox_path": data["expected_outbox_path"],
        "remote_state_sha": data["remote_state_sha"],
        "completion_mode": data["completion_mode"],
        "result_status": data["result_status"],
        "next_action": data["next_action"],
        "current_state": data["current_state"],
        "remote_mailbox_commit": data.get("remote_mailbox_commit", ""),
        "primary_commit_sha": data.get("primary_commit_sha", ""),
        "primary_parent_sha": data.get("primary_parent_sha", "N/A"),
        "changed_paths": tuple(data.get("changed_paths", ())),
        "authorized_paths": tuple(data.get("authorized_paths", ())),
        "validation_results": tuple(data.get("validation_results", ())),
        "negative_controls": tuple(data.get("negative_controls", NEGATIVE_CONTROLS)),
        "positive_controls": tuple(data.get("positive_controls", POSITIVE_CONTROLS)),
        "recovery_classification": data.get("recovery_classification", "CORRECTION_REQUIRED"),
        "byte_equality": data.get("byte_equality", "UNKNOWN"),
        "primary_changed": data.get("primary_changed", False),
    }
    return ClosedLoopState(**values)


def validate_outbox_path(path: str) -> None:
    if not path.endswith(EXPECTED_OUTBOX_SUFFIX):
        raise ValueError("expected outbox path must end with -02-codex.md")


def validate_identity(state: ClosedLoopState) -> None:
    if state.bridge_slot not in {1, 2, 3}:
        raise ValueError("invalid bridge slot")
    if not state.thread_id.startswith("BRIDGE-"):
        raise ValueError("invalid thread id")
    if not state.task_nonce:
        raise ValueError("missing task nonce")
    if not state.coordinator_memory_rev:
        raise ValueError("missing coordinator memory revision")
    validate_outbox_path(state.expected_outbox_path)
    for label, value in (
        ("baseline_sha", state.baseline_sha),
        ("inbox_path", state.inbox_path),
        ("claim_path", state.claim_path),
        ("remote_state_sha", state.remote_state_sha),
    ):
        if not value:
            raise ValueError(f"missing {label}")


def validate_transition(current_state: str, next_state: str) -> None:
    if current_state not in LEGAL_STATES:
        raise ValueError(f"illegal current state: {current_state}")
    if next_state not in LEGAL_STATES:
        raise ValueError(f"illegal next state: {next_state}")
    if next_state not in LEGAL_TRANSITIONS[current_state]:
        raise ValueError(f"illegal transition: {current_state} -> {next_state}")


def validate_report_schema(report: dict) -> None:
    missing = [field for field in REPORT_SCHEMA_KEYS if field not in report]
    if missing:
        raise ValueError(f"missing report fields: {missing}")


def classify_recovery(report: dict) -> str:
    status = report.get("status")
    if status == "BLOCKED_EXTERNAL":
        return "BLOCKED_EXTERNAL"
    if report.get("publicationRecovery") is True:
        return "PUBLICATION_RECOVERY_REQUIRED"
    if report.get("reportRecovery") is True:
        return "REPORT_RECOVERY_REQUIRED"
    return "CORRECTION_REQUIRED"


def accept_product_work(report: dict) -> bool:
    return bool(report.get("canaryAccepted")) and report.get("currentState") == "ACCEPTED"


def self_check() -> dict:
    sample = ClosedLoopState(
        bridge_slot=3,
        thread_id="BRIDGE-20260709-052",
        lane_id="PROCESS-CLOSED-LOOP-SOURCE-CONTRACT-CORRECTION",
        task_id="TASK-PROCESS-CLOSED-LOOP-SOURCE-CONTRACT-CORRECTION",
        execution_epoch="CLOSED-LOOP-SOURCE-R1-20260709-2138JST",
        task_nonce="CLV1-052-SOURCE-9B17-2138",
        coordinator_memory_rev="2026-07-09-2138-JST",
        baseline_sha="9b170097e1ff0889ae0cb1e127516c51440c4c3d",
        inbox_path=".ai-bridge/inbox/BRIDGE-20260709-052-01-chatgpt.md",
        claim_path=".ai-bridge/claims/BRIDGE-20260709-052-claim-v1-codex.md",
        expected_outbox_path=".ai-bridge/outbox/BRIDGE-20260709-052-02-codex.md",
        remote_state_sha="feedfacefeedfacefeedfacefeedfacefeedface",
        completion_mode="PRIMARY_DELTA",
        result_status="PASS_PUSHED",
        next_action="Open a fresh ChatGPT conversation and send мост 3.",
        current_state="PRIMARY_PUBLISHED",
    )
    validate_identity(sample)
    validate_transition("CLOSED", "PREPARING")
    validate_transition("PRIMARY_PUBLISHED", "OUTBOX_PUBLISHING")
    validate_report_schema({field: "x" for field in REPORT_SCHEMA_KEYS})
    return {
        "contractVersion": CONTRACT_VERSION,
        "policyVersion": POLICY_VERSION,
        "states": LEGAL_STATES,
        "positiveControls": POSITIVE_CONTROLS,
        "negativeControls": NEGATIVE_CONTROLS,
    }


def serialize(state: ClosedLoopState) -> dict:
    payload = asdict(state)
    payload["changed_paths"] = list(payload["changed_paths"])
    payload["authorized_paths"] = list(payload["authorized_paths"])
    payload["validation_results"] = list(payload["validation_results"])
    payload["negative_controls"] = list(payload["negative_controls"])
    payload["positive_controls"] = list(payload["positive_controls"])
    return payload
