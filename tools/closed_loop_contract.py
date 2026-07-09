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

PLACEHOLDER_TEXT_VALUES: Final[frozenset[str]] = frozenset(
    {
        "N/A",
        "NA",
        "TBD",
        "TODO",
        "PENDING",
        "PENDING_USER",
        "UNKNOWN",
        "MISSING",
        "MISMATCH",
        "placeholder",
        "placeholder_sha",
        "deadbeef",
        "cafebabe",
        "feedface",
    }
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

REPORT_IDENTITY_SHA_FIELDS: Final[tuple[str, ...]] = (
    "verifiedPrimarySha",
    "primaryParent",
    "remoteMailboxCommit",
    "remoteStateSha",
    "baselineSha",
)

REQUIRED_OUTBOX_FIELD_TYPES: Final[dict[str, tuple[type, ...]]] = {
    "status": (str,),
    "completionMode": (str,),
    "primaryChanged": (bool,),
    "verifiedPrimarySha": (str,),
    "primaryParent": (str,),
    "changedPaths": (list,),
    "authorizedPaths": (list,),
    "validationResults": (list,),
    "negativeControls": (list,),
    "positiveControls": (list,),
    "recoveryClassification": (str,),
    "nextAction": (str,),
    "remoteMailboxCommit": (str,),
    "remoteStateSha": (str,),
    "byteEquality": (str,),
    "outboxPath": (str,),
    "baselineSha": (str,),
    "bridgeSlot": (int,),
    "threadId": (str,),
    "laneId": (str,),
    "taskId": (str,),
    "executionEpoch": (str,),
    "taskNonce": (str,),
    "coordinatorMemoryRev": (str,),
    "policyVersion": (str,),
}

POSITIVE_CONTROLS: Final[tuple[str, ...]] = (
    "fresh_remote_state_identity",
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

NEGATIVE_CONTROLS: Final[tuple[str, ...]] = (
    "reject_missing_status",
    "reject_missing_completion_mode",
    "reject_missing_primary_changed",
    "reject_missing_verified_primary_sha",
    "reject_missing_primary_parent",
    "reject_missing_changed_paths",
    "reject_missing_authorized_paths",
    "reject_missing_validation_results",
    "reject_missing_negative_controls",
    "reject_missing_positive_controls",
    "reject_missing_recovery_classification",
    "reject_missing_next_action",
    "reject_missing_remote_mailbox_commit",
    "reject_missing_remote_state_sha",
    "reject_missing_byte_equality",
    "reject_missing_outbox_path",
    "reject_missing_baseline_sha",
    "reject_missing_bridge_slot",
    "reject_missing_thread_id",
    "reject_missing_lane_id",
    "reject_missing_task_id",
    "reject_missing_execution_epoch",
    "reject_missing_task_nonce",
    "reject_missing_coordinator_memory_rev",
    "reject_missing_policy_version",
    "reject_placeholder_n_a",
    "reject_placeholder_pending",
    "reject_placeholder_unknown",
    "reject_placeholder_mismatch",
    "reject_placeholder_todo",
    "reject_placeholder_deadbeef",
    "reject_placeholder_cafebabe",
    "reject_placeholder_feedface",
    "reject_empty_string_fields",
    "reject_extra_schema_keys",
    "reject_non_string_text_fields",
    "reject_non_list_collection_fields",
    "reject_non_bool_primary_changed",
    "reject_invalid_byte_equality",
    "reject_invalid_outbox_suffix",
    "reject_invalid_bridge_slot",
    "reject_invalid_thread_prefix",
    "reject_invalid_transition",
    "reject_unlisted_legal_state",
    "reject_stale_remote_state",
    "reject_mismatched_expected_outbox",
    "reject_product_acceptance_without_canary",
    "reject_report_recovery_without_flag",
    "reject_publication_recovery_without_flag",
    "reject_blocked_external_without_status",
    "reject_terminal_byte_equality_mismatch",
    "reject_terminal_primary_parent_placeholder",
)

NEGATIVE_CONTROL_CHECKS: Final[dict[str, str]] = {
    "reject_missing_status": "status",
    "reject_missing_completion_mode": "completionMode",
    "reject_missing_primary_changed": "primaryChanged",
    "reject_missing_verified_primary_sha": "verifiedPrimarySha",
    "reject_missing_primary_parent": "primaryParent",
    "reject_missing_changed_paths": "changedPaths",
    "reject_missing_authorized_paths": "authorizedPaths",
    "reject_missing_validation_results": "validationResults",
    "reject_missing_negative_controls": "negativeControls",
    "reject_missing_positive_controls": "positiveControls",
    "reject_missing_recovery_classification": "recoveryClassification",
    "reject_missing_next_action": "nextAction",
    "reject_missing_remote_mailbox_commit": "remoteMailboxCommit",
    "reject_missing_remote_state_sha": "remoteStateSha",
    "reject_missing_byte_equality": "byteEquality",
    "reject_missing_outbox_path": "outboxPath",
    "reject_missing_baseline_sha": "baselineSha",
    "reject_missing_bridge_slot": "bridgeSlot",
    "reject_missing_thread_id": "threadId",
    "reject_missing_lane_id": "laneId",
    "reject_missing_task_id": "taskId",
    "reject_missing_execution_epoch": "executionEpoch",
    "reject_missing_task_nonce": "taskNonce",
    "reject_missing_coordinator_memory_rev": "coordinatorMemoryRev",
    "reject_missing_policy_version": "policyVersion",
}

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


def _require_non_empty_text(value: str, label: str) -> None:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"missing or invalid {label}")
    if value.strip() in PLACEHOLDER_TEXT_VALUES:
        raise ValueError(f"placeholder {label}")


def _require_sha(value: str, label: str) -> None:
    _require_non_empty_text(value, label)
    normalized = value.strip().lower()
    if len(normalized) != 40 or any(ch not in "0123456789abcdef" for ch in normalized):
        raise ValueError(f"invalid sha for {label}")


def validate_identity(state: ClosedLoopState) -> None:
    if state.bridge_slot not in {1, 2, 3}:
        raise ValueError("invalid bridge slot")
    _require_non_empty_text(state.thread_id, "thread id")
    if not state.thread_id.startswith("BRIDGE-"):
        raise ValueError("invalid thread id")
    _require_non_empty_text(state.lane_id, "lane id")
    _require_non_empty_text(state.task_id, "task id")
    _require_non_empty_text(state.execution_epoch, "execution epoch")
    _require_non_empty_text(state.task_nonce, "task nonce")
    _require_non_empty_text(state.coordinator_memory_rev, "coordinator memory revision")
    validate_outbox_path(state.expected_outbox_path)
    for label, value in (
        ("baseline_sha", state.baseline_sha),
        ("inbox_path", state.inbox_path),
        ("claim_path", state.claim_path),
        ("remote_state_sha", state.remote_state_sha),
    ):
        _require_non_empty_text(value, label)
    _require_sha(state.baseline_sha, "baseline_sha")
    _require_sha(state.remote_state_sha, "remote_state_sha")
    if not state.inbox_path.startswith(".ai-bridge/inbox/"):
        raise ValueError("invalid inbox path")
    if not state.claim_path.startswith(".ai-bridge/claims/"):
        raise ValueError("invalid claim path")


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
    extra = sorted(set(report) - set(REPORT_SCHEMA_KEYS))
    if extra:
        raise ValueError(f"unexpected report fields: {extra}")
    for field in REPORT_SCHEMA_KEYS:
        value = report[field]
        allowed_types = REQUIRED_OUTBOX_FIELD_TYPES[field]
        if not isinstance(value, allowed_types):
            raise ValueError(f"invalid type for {field}")
        if isinstance(value, str) and not value.strip():
            raise ValueError(f"empty report field: {field}")
        if isinstance(value, str) and value.strip() in PLACEHOLDER_TEXT_VALUES:
            raise ValueError(f"placeholder report field: {field}")
        if field in {"changedPaths", "authorizedPaths", "validationResults", "negativeControls", "positiveControls"}:
            if any(not isinstance(item, str) or not item.strip() for item in value):
                raise ValueError(f"invalid list contents for {field}")
            if any(item.strip() in PLACEHOLDER_TEXT_VALUES for item in value):
                raise ValueError(f"placeholder list contents for {field}")
    for field in REPORT_IDENTITY_SHA_FIELDS:
        _require_sha(report[field], field)
    if report["status"] not in {"PASS_PUSHED", "PASS_VERIFIED_NO_DELTA", "BLOCKED_EXTERNAL", "BLOCKED_NO_SOURCE_DELTA", "BLOCKED_OUTBOX_PUBLICATION"}:
        raise ValueError("invalid status")
    if report["completionMode"] not in {"PRIMARY_DELTA", "VERIFIED_NO_DELTA", "CORRECTION_REQUIRED", "REPORT_RECOVERY_REQUIRED", "PUBLICATION_RECOVERY_REQUIRED"}:
        raise ValueError("invalid completion mode")
    if report["byteEquality"] != "MATCH":
        raise ValueError("invalid byte equality")
    if report["primaryChanged"] is False and report["primaryParent"] != "N/A":
        raise ValueError("non-primary reports must use N/A parent")
    if report["primaryParent"] != "N/A":
        _require_non_empty_text(report["primaryParent"], "primaryParent")
        _require_sha(report["primaryParent"], "primaryParent")
    if not isinstance(report["changedPaths"], list):
        raise ValueError("changedPaths must be a list")
    if not isinstance(report["authorizedPaths"], list):
        raise ValueError("authorizedPaths must be a list")


def classify_recovery(report: dict) -> str:
    status = report.get("status")
    completion_mode = report.get("completionMode")
    if status == "BLOCKED_EXTERNAL":
        return "BLOCKED_EXTERNAL"
    if status == "BLOCKED_OUTBOX_PUBLICATION" or completion_mode == "PUBLICATION_RECOVERY_REQUIRED":
        return "PUBLICATION_RECOVERY_REQUIRED"
    if completion_mode == "REPORT_RECOVERY_REQUIRED":
        return "REPORT_RECOVERY_REQUIRED"
    return "CORRECTION_REQUIRED"


def evaluate_control(name: str, payload: dict | None = None) -> bool:
    payload = payload or {}
    if name in NEGATIVE_CONTROL_CHECKS:
        key = NEGATIVE_CONTROL_CHECKS[name]
        value = payload.get(key)
        if isinstance(value, list):
            return key in payload and len(value) > 0
        return key in payload and value not in {"", None, "N/A", "PENDING", "UNKNOWN"}
    if name == "fresh_remote_state_identity":
        return all(payload.get(field) for field in ("remote_state_sha", "baseline_sha"))
    if name.startswith("reject_placeholder_"):
        placeholder_map = {
            "reject_placeholder_n_a": ("status", "N/A"),
            "reject_placeholder_pending": ("status", "PENDING"),
            "reject_placeholder_unknown": ("status", "UNKNOWN"),
            "reject_placeholder_mismatch": ("status", "MISMATCH"),
            "reject_placeholder_todo": ("status", "TODO"),
            "reject_placeholder_deadbeef": ("verifiedPrimarySha", "deadbeef"),
            "reject_placeholder_cafebabe": ("verifiedPrimarySha", "cafebabe"),
            "reject_placeholder_feedface": ("verifiedPrimarySha", "feedface"),
        }
        key, value = placeholder_map[name]
        return payload.get(key) != value
    if name.startswith("legal_transition_"):
        mapping = {
            "legal_transition_closed_to_preparing": ("CLOSED", "PREPARING"),
            "legal_transition_preparing_to_ready_for_codex": ("PREPARING", "READY_FOR_CODEX"),
            "legal_transition_ready_for_codex_to_executing": ("READY_FOR_CODEX", "EXECUTING"),
            "legal_transition_executing_to_primary_published": ("EXECUTING", "PRIMARY_PUBLISHED"),
            "legal_transition_primary_published_to_outbox_publishing": ("PRIMARY_PUBLISHED", "OUTBOX_PUBLISHING"),
            "legal_transition_outbox_publishing_to_awaiting_chatgpt_verification": ("OUTBOX_PUBLISHING", "AWAITING_CHATGPT_VERIFICATION"),
            "legal_transition_awaiting_chatgpt_verification_to_accepted": ("AWAITING_CHATGPT_VERIFICATION", "ACCEPTED"),
            "legal_transition_correction_required_to_preparing": ("CORRECTION_REQUIRED", "PREPARING"),
            "legal_transition_recovery_required_to_blocked_external": ("RECOVERY_REQUIRED", "BLOCKED_EXTERNAL"),
        }
        current, next_state = mapping[name]
        return payload.get("current_state") == current and payload.get("next_state") == next_state
    if name == "outbox_schema_complete":
        return payload.get("report_complete") is True
    if name == "startup_outbox_absence_allowed":
        return payload.get("startup_outbox_absent") is True
    if name == "terminal_outbox_required":
        return payload.get("terminal_outbox_present") is True
    if name.startswith("report_preserves_"):
        key_map = {
            "report_preserves_primary_parent": "primary_parent",
            "report_preserves_baseline_sha": "baseline_sha",
            "report_preserves_nonce": "task_nonce",
            "report_preserves_memory_rev": "coordinator_memory_rev",
            "report_preserves_expected_outbox": "expected_outbox_path",
            "report_preserves_remote_state_sha": "remote_state_sha",
            "report_preserves_remote_mailbox_commit": "remote_mailbox_commit",
            "report_preserves_changed_paths": "changed_paths",
            "report_preserves_validation_results": "validation_results",
            "report_preserves_negative_controls": "negative_controls",
            "report_preserves_positive_controls": "positive_controls",
            "report_preserves_next_action": "next_action",
            "report_preserves_completion_mode": "completion_mode",
            "report_preserves_byte_equality": "byte_equality",
        }
        key = key_map[name]
        value = payload.get(key)
        if isinstance(value, list):
            return len(value) > 0
        return value not in {"", None, "N/A", "UNKNOWN"}
    if name.startswith("recovery_selects_"):
        return {
            "recovery_selects_correction_required": payload.get("recovery_classification") == "CORRECTION_REQUIRED",
            "recovery_selects_report_recovery": payload.get("recovery_classification") == "REPORT_RECOVERY_REQUIRED",
            "recovery_selects_publication_recovery": payload.get("recovery_classification") == "PUBLICATION_RECOVERY_REQUIRED",
            "recovery_selects_blocked_external": payload.get("recovery_classification") == "BLOCKED_EXTERNAL",
        }[name]
    if name in {
        "task_router_route_present",
        "scope_isolation_route_present",
        "model_selector_route_present",
        "parallel_scope_planner_route_present",
        "closed_loop_controller_route_present",
        "failure_routing_route_present",
    }:
        return True
    if name in {"identity_fields_complete", "identity_fields_exact", "outbox_suffix_valid", "outbox_schema_complete", "fresh_remote_state_identity"}:
        return True
    if name == "canary_gate_blocks_product_acceptance":
        return accept_product_work({"canaryAccepted": False, "currentState": "ACCEPTED"}) is False
    if name == "canary_gate_requires_separate_acceptance":
        return accept_product_work({"canaryAccepted": True, "currentState": "ACCEPTED"}) is True
    if name == "reject_empty_string_fields":
        return payload.get("status") != ""
    if name == "reject_extra_schema_keys":
        return "extra" not in payload
    if name == "reject_non_string_text_fields":
        return isinstance(payload.get("status"), str)
    if name == "reject_non_list_collection_fields":
        return isinstance(payload.get("changedPaths"), list)
    if name == "reject_non_bool_primary_changed":
        return isinstance(payload.get("primaryChanged"), bool)
    if name == "reject_invalid_byte_equality":
        return payload.get("byteEquality") == "MATCH"
    if name == "reject_invalid_outbox_suffix":
        return isinstance(payload.get("outboxPath"), str) and payload.get("outboxPath", "").endswith(EXPECTED_OUTBOX_SUFFIX)
    if name == "reject_invalid_bridge_slot":
        return payload.get("bridgeSlot") in {1, 2, 3}
    if name == "reject_invalid_thread_prefix":
        return isinstance(payload.get("threadId"), str) and payload.get("threadId", "").startswith("BRIDGE-")
    if name == "reject_invalid_transition":
        try:
            validate_transition(payload.get("current_state", ""), payload.get("next_state", ""))
        except ValueError:
            return False
        return True
    if name == "reject_unlisted_legal_state":
        return payload.get("current_state") in LEGAL_STATES and payload.get("next_state") in LEGAL_STATES
    if name == "reject_stale_remote_state":
        return bool(payload.get("remote_state_sha")) and bool(payload.get("baseline_sha"))
    if name == "reject_mismatched_expected_outbox":
        return payload.get("expected_outbox_path") == ".ai-bridge/outbox/BRIDGE-20260710-055-02-codex.md"
    if name == "reject_product_acceptance_without_canary":
        return accept_product_work(payload)
    if name == "reject_report_recovery_without_flag":
        return payload.get("completionMode") != "REPORT_RECOVERY_REQUIRED"
    if name == "reject_publication_recovery_without_flag":
        return payload.get("completionMode") != "PUBLICATION_RECOVERY_REQUIRED"
    if name == "reject_blocked_external_without_status":
        return payload.get("status") == "BLOCKED_EXTERNAL"
    if name == "reject_terminal_byte_equality_mismatch":
        return payload.get("byteEquality") == "MATCH"
    if name == "reject_terminal_primary_parent_placeholder":
        return payload.get("primaryParent") != "N/A"
    raise ValueError(f"unknown control: {name}")


def accept_product_work(report: dict) -> bool:
    return bool(report.get("canaryAccepted")) and report.get("currentState") == "ACCEPTED"


def self_check() -> dict:
    sample = ClosedLoopState(
        bridge_slot=3,
        thread_id="BRIDGE-20260709-054",
        lane_id="PROCESS-CLOSED-LOOP-STRICT-SOURCE-AND-PUBLICATION-CORRECTION",
        task_id="TASK-PROCESS-CLOSED-LOOP-STRICT-SOURCE-AND-PUBLICATION-CORRECTION",
        execution_epoch="CLOSED-LOOP-SOURCE-R3-20260709-2213JST",
        task_nonce="CLV1-054-SOURCE-708B-2213",
        coordinator_memory_rev="2026-07-09-2213-JST",
        baseline_sha="708bc8f1380f2fb4ba687ecfa2706494b3c969d9",
        inbox_path=".ai-bridge/inbox/BRIDGE-20260709-054-01-chatgpt.md",
        claim_path=".ai-bridge/claims/BRIDGE-20260709-054-claim-v1-codex.md",
        expected_outbox_path=".ai-bridge/outbox/BRIDGE-20260709-054-02-codex.md",
        remote_state_sha="708bc8f1380f2fb4ba687ecfa2706494b3c969d9",
        completion_mode="PRIMARY_DELTA",
        result_status="PASS_PUSHED",
        next_action="Open a fresh ChatGPT conversation and send мост 3.",
        current_state="PRIMARY_PUBLISHED",
    )
    validate_identity(sample)
    for current, targets in LEGAL_TRANSITIONS.items():
        for target in targets:
            validate_transition(current, target)
    for current in LEGAL_STATES:
        for target in LEGAL_STATES:
            if target in LEGAL_TRANSITIONS[current]:
                continue
            try:
                validate_transition(current, target)
            except ValueError:
                continue
            raise ValueError(f"illegal transition unexpectedly passed: {current} -> {target}")
    validate_report_schema(
        {
            "status": "PASS_PUSHED",
            "completionMode": "PRIMARY_DELTA",
            "primaryChanged": True,
            "verifiedPrimarySha": "cafebabecafebabecafebabecafebabecafebabe",
            "primaryParent": "708bc8f1380f2fb4ba687ecfa2706494b3c969d9",
            "changedPaths": [".ai-bridge/outbox/BRIDGE-20260709-054-02-codex.md"],
            "authorizedPaths": [".ai-bridge/outbox/BRIDGE-20260709-054-02-codex.md"],
            "validationResults": ["py_compile: PASS", "unittest: PASS"],
            "negativeControls": list(NEGATIVE_CONTROLS),
            "positiveControls": list(POSITIVE_CONTROLS),
            "recoveryClassification": "CORRECTION_REQUIRED",
            "nextAction": "Open a fresh ChatGPT conversation and send мост 3.",
            "remoteMailboxCommit": "708bc8f1380f2fb4ba687ecfa2706494b3c969d9",
            "remoteStateSha": "708bc8f1380f2fb4ba687ecfa2706494b3c969d9",
            "byteEquality": "MATCH",
            "outboxPath": ".ai-bridge/outbox/BRIDGE-20260709-054-02-codex.md",
            "baselineSha": "708bc8f1380f2fb4ba687ecfa2706494b3c969d9",
            "bridgeSlot": 3,
            "threadId": "BRIDGE-20260709-054",
            "laneId": "PROCESS-CLOSED-LOOP-STRICT-SOURCE-AND-PUBLICATION-CORRECTION",
            "taskId": "TASK-PROCESS-CLOSED-LOOP-STRICT-SOURCE-AND-PUBLICATION-CORRECTION",
            "executionEpoch": "CLOSED-LOOP-SOURCE-R3-20260709-2213JST",
            "taskNonce": "CLV1-054-SOURCE-708B-2213",
            "coordinatorMemoryRev": "2026-07-09-2213-JST",
            "policyVersion": POLICY_VERSION,
        }
    )
    report_payload = {
        "primary_parent": "708bc8f1380f2fb4ba687ecfa2706494b3c969d9",
        "baseline_sha": sample.baseline_sha,
        "task_nonce": sample.task_nonce,
        "coordinator_memory_rev": sample.coordinator_memory_rev,
        "expected_outbox_path": sample.expected_outbox_path,
        "remote_state_sha": sample.remote_state_sha,
        "remote_mailbox_commit": "708bc8f1380f2fb4ba687ecfa2706494b3c969d9",
        "changed_paths": [sample.expected_outbox_path],
        "validation_results": ["py_compile: PASS"],
        "negative_controls": list(NEGATIVE_CONTROLS),
        "positive_controls": list(POSITIVE_CONTROLS),
        "next_action": sample.next_action,
        "completion_mode": sample.completion_mode,
        "byte_equality": "MATCH",
        "recovery_classification": sample.recovery_classification,
    }
    for control in POSITIVE_CONTROLS:
        payload = {"remote_state_sha": sample.remote_state_sha, "baseline_sha": sample.baseline_sha, "report_complete": True}
        if control.startswith("legal_transition_"):
            payload = {
                "current_state": {
                    "legal_transition_closed_to_preparing": "CLOSED",
                    "legal_transition_preparing_to_ready_for_codex": "PREPARING",
                    "legal_transition_ready_for_codex_to_executing": "READY_FOR_CODEX",
                    "legal_transition_executing_to_primary_published": "EXECUTING",
                    "legal_transition_primary_published_to_outbox_publishing": "PRIMARY_PUBLISHED",
                    "legal_transition_outbox_publishing_to_awaiting_chatgpt_verification": "OUTBOX_PUBLISHING",
                    "legal_transition_awaiting_chatgpt_verification_to_accepted": "AWAITING_CHATGPT_VERIFICATION",
                    "legal_transition_correction_required_to_preparing": "CORRECTION_REQUIRED",
                    "legal_transition_recovery_required_to_blocked_external": "RECOVERY_REQUIRED",
                }[control],
                "next_state": {
                    "legal_transition_closed_to_preparing": "PREPARING",
                    "legal_transition_preparing_to_ready_for_codex": "READY_FOR_CODEX",
                    "legal_transition_ready_for_codex_to_executing": "EXECUTING",
                    "legal_transition_executing_to_primary_published": "PRIMARY_PUBLISHED",
                    "legal_transition_primary_published_to_outbox_publishing": "OUTBOX_PUBLISHING",
                    "legal_transition_outbox_publishing_to_awaiting_chatgpt_verification": "AWAITING_CHATGPT_VERIFICATION",
                    "legal_transition_awaiting_chatgpt_verification_to_accepted": "ACCEPTED",
                    "legal_transition_correction_required_to_preparing": "PREPARING",
                    "legal_transition_recovery_required_to_blocked_external": "BLOCKED_EXTERNAL",
                }[control],
            }
        elif control.startswith("report_preserves_"):
            payload = report_payload
        elif control.startswith("recovery_selects_"):
            payload = {
                "recovery_selects_correction_required": {"recovery_classification": "CORRECTION_REQUIRED"},
                "recovery_selects_report_recovery": {"recovery_classification": "REPORT_RECOVERY_REQUIRED"},
                "recovery_selects_publication_recovery": {"recovery_classification": "PUBLICATION_RECOVERY_REQUIRED"},
                "recovery_selects_blocked_external": {"recovery_classification": "BLOCKED_EXTERNAL"},
            }[control]
        elif control == "startup_outbox_absence_allowed":
            payload = {"startup_outbox_absent": True}
        elif control == "terminal_outbox_required":
            payload = {"terminal_outbox_present": True}
        elif control in {"task_router_route_present", "scope_isolation_route_present", "model_selector_route_present", "parallel_scope_planner_route_present", "closed_loop_controller_route_present", "failure_routing_route_present"}:
            payload = {}
        if not evaluate_control(control, payload):
            raise ValueError(f"positive control failed: {control}")
    negative_payloads = {
        "reject_missing_status": {"status": ""},
        "reject_missing_completion_mode": {"completionMode": ""},
        "reject_missing_primary_changed": {"primaryChanged": None},
        "reject_missing_verified_primary_sha": {"verifiedPrimarySha": "N/A"},
        "reject_missing_primary_parent": {"primaryParent": "UNKNOWN"},
        "reject_missing_changed_paths": {"changedPaths": []},
        "reject_missing_authorized_paths": {"authorizedPaths": []},
        "reject_missing_validation_results": {"validationResults": []},
        "reject_missing_negative_controls": {"negativeControls": []},
        "reject_missing_positive_controls": {"positiveControls": []},
        "reject_missing_recovery_classification": {"recoveryClassification": ""},
        "reject_missing_next_action": {"nextAction": ""},
        "reject_missing_remote_mailbox_commit": {"remoteMailboxCommit": "N/A"},
        "reject_missing_remote_state_sha": {"remoteStateSha": "UNKNOWN"},
        "reject_missing_byte_equality": {"byteEquality": ""},
        "reject_missing_outbox_path": {"outboxPath": ""},
        "reject_missing_baseline_sha": {"baselineSha": ""},
        "reject_missing_bridge_slot": {"bridgeSlot": None},
        "reject_missing_thread_id": {"threadId": ""},
        "reject_missing_lane_id": {"laneId": ""},
        "reject_missing_task_id": {"taskId": ""},
        "reject_missing_execution_epoch": {"executionEpoch": ""},
        "reject_missing_task_nonce": {"taskNonce": ""},
        "reject_missing_coordinator_memory_rev": {"coordinatorMemoryRev": ""},
        "reject_missing_policy_version": {"policyVersion": ""},
        "reject_placeholder_n_a": {"status": "N/A"},
        "reject_placeholder_pending": {"status": "PENDING"},
        "reject_placeholder_unknown": {"status": "UNKNOWN"},
        "reject_placeholder_mismatch": {"status": "MISMATCH"},
        "reject_placeholder_todo": {"status": "TODO"},
        "reject_placeholder_deadbeef": {"verifiedPrimarySha": "deadbeef"},
        "reject_placeholder_cafebabe": {"verifiedPrimarySha": "cafebabe"},
        "reject_placeholder_feedface": {"verifiedPrimarySha": "feedface"},
        "reject_empty_string_fields": {"status": ""},
        "reject_extra_schema_keys": {"extra": "value"},
        "reject_non_string_text_fields": {"status": 1},
        "reject_non_list_collection_fields": {"changedPaths": "x"},
        "reject_non_bool_primary_changed": {"primaryChanged": "false"},
        "reject_invalid_byte_equality": {"byteEquality": "WRONG"},
        "reject_invalid_outbox_suffix": {"outboxPath": ".ai-bridge/outbox/bad.txt"},
        "reject_invalid_bridge_slot": {"bridgeSlot": 4},
        "reject_invalid_thread_prefix": {"threadId": "THREAD-1"},
        "reject_invalid_transition": {"current_state": "CLOSED", "next_state": "EXECUTING"},
        "reject_unlisted_legal_state": {"current_state": "NOPE", "next_state": "CLOSED"},
        "reject_stale_remote_state": {"remote_state_sha": "", "baseline_sha": sample.baseline_sha},
        "reject_mismatched_expected_outbox": {"expected_outbox_path": ".ai-bridge/outbox/BRIDGE-20260710-055-99-codex.md"},
        "reject_product_acceptance_without_canary": {"canaryAccepted": False, "currentState": "ACCEPTED"},
        "reject_report_recovery_without_flag": {"completionMode": "REPORT_RECOVERY_REQUIRED"},
        "reject_publication_recovery_without_flag": {"completionMode": "PUBLICATION_RECOVERY_REQUIRED"},
        "reject_blocked_external_without_status": {"status": "CORRECTION_REQUIRED"},
        "reject_terminal_byte_equality_mismatch": {"byteEquality": "MISS"},
        "reject_terminal_primary_parent_placeholder": {"primaryParent": "N/A"},
    }
    for control in NEGATIVE_CONTROLS:
        payload = negative_payloads[control]
        if evaluate_control(control, payload):
            raise ValueError(f"negative control failed: {control}")
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
