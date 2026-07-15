#!/usr/bin/env python3
"""Fail-closed validator for Asynchronia Bridge v4 slot isolation."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

SLOTS = (1, 2, 3)
FORBIDDEN_SHARED_FIELDS = {"OPEN_SLOT_COUNT", "PRIMARY_ACTIVE_SLOT"}
POLICY_VERSION = "1"
MERGE_MARKERS = ("<<<<<<<", "=======", ">>>>>>>")


def mailbox_ref(slot: int) -> str:
    _validate_slot(slot)
    return f"coordination/chatgpt-codex-bridge-{slot}"


def task_branch_prefix(slot: int) -> str:
    _validate_slot(slot)
    return f"bridge/{slot}/"


def memory_path(slot: int) -> str:
    _validate_slot(slot)
    return f".ai-memory/bridges/{slot}.md"


def render_slot_policy(slot: int) -> str:
    _validate_slot(slot)
    return "\n".join((
        f"BRIDGE_PUBLICATION_POLICY_VERSION: {POLICY_VERSION}",
        "BRIDGE_PROTOCOL: 4.0",
        f"SLOT: {slot}",
        f"BRANCH_MAILBOX: {mailbox_ref(slot)}",
        "CANONICAL_POLICY: BRIDGE_PUBLICATION_POLICY.md",
        "",
    ))


def _validate_slot(slot: int) -> None:
    if slot not in SLOTS:
        raise ValueError(f"slot must be one of {SLOTS}, got {slot!r}")


def validate_command(slot: int, selected_mailbox_ref: str, task_branch: str) -> list[str]:
    errors: list[str] = []
    try:
        expected_ref = mailbox_ref(slot)
        expected_prefix = task_branch_prefix(slot)
    except ValueError as exc:
        return [str(exc)]

    if selected_mailbox_ref != expected_ref:
        errors.append(
            f"FAIL_CROSS_SLOT_MAILBOX: slot {slot} requires {expected_ref}, got {selected_mailbox_ref}"
        )
    if not task_branch.startswith(expected_prefix) or task_branch == expected_prefix:
        errors.append(
            f"FAIL_TASK_BRANCH: slot {slot} requires non-empty branch under {expected_prefix}, got {task_branch}"
        )
    if task_branch == "main" or task_branch.endswith("/main"):
        errors.append("FAIL_DIRECT_MAIN_PUBLICATION")
    return errors


def parse_state_fields(text: str) -> dict[str, str]:
    result: dict[str, str] = {}
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or ":" not in line:
            continue
        key, value = line.split(":", 1)
        key = key.strip()
        if re.fullmatch(r"[A-Z][A-Z0-9_]*", key):
            result[key] = value.strip()
    return result


def duplicate_uppercase_fields(text: str) -> list[str]:
    counts: dict[str, int] = {}
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or ":" not in line:
            continue
        key, _value = line.split(":", 1)
        key = key.strip()
        if re.fullmatch(r"[A-Z][A-Z0-9_]*", key):
            counts[key] = counts.get(key, 0) + 1
    return sorted(key for key, count in counts.items() if count > 1)


def unresolved_merge_markers(text: str) -> bool:
    return any(marker in text for marker in MERGE_MARKERS)


def validate_state(slot: int, text: str) -> list[str]:
    errors: list[str] = []
    try:
        _validate_slot(slot)
    except ValueError as exc:
        return [str(exc)]

    if unresolved_merge_markers(text):
        errors.append("FAIL_UNRESOLVED_MERGE_MARKERS")
    for key in duplicate_uppercase_fields(text):
        errors.append(f"FAIL_DUPLICATE_UPPERCASE_FIELD: {key}")
    fields = parse_state_fields(text)
    for field in sorted(FORBIDDEN_SHARED_FIELDS.intersection(fields)):
        errors.append(f"FAIL_SHARED_ACTIVATION_POINTER: {field}")

    state_slot = fields.get("SLOT")
    if state_slot != str(slot):
        errors.append(f"FAIL_STATE_SLOT: expected SLOT: {slot}, got {state_slot!r}")

    branch_mailbox = fields.get("BRANCH_MAILBOX")
    if branch_mailbox != mailbox_ref(slot):
        errors.append(
            f"FAIL_STATE_MAILBOX: expected {mailbox_ref(slot)}, got {branch_mailbox!r}"
        )

    task_branch = fields.get("BRANCH_TASK") or fields.get("BRANCH_CODEX")
    if not task_branch or not task_branch.startswith(task_branch_prefix(slot)):
        errors.append(
            f"FAIL_STATE_TASK_BRANCH: expected prefix {task_branch_prefix(slot)}, got {task_branch!r}"
        )

    other_slots = [other for other in SLOTS if other != slot]
    for key, value in fields.items():
        upper_value = value.upper()
        for other in other_slots:
            if key.endswith(f"_SLOT_{other}") or f"BRIDGE-{other}" in upper_value:
                errors.append(f"FAIL_CROSS_SLOT_STATE: {key} references slot {other}")
    return errors


def validate_policy(slot: int, policy_text: str, state_text: str | None = None) -> list[str]:
    try:
        _validate_slot(slot)
    except ValueError as exc:
        return [str(exc)]
    errors: list[str] = []
    if unresolved_merge_markers(policy_text):
        errors.append("FAIL_UNRESOLVED_MERGE_MARKERS")
    for key in duplicate_uppercase_fields(policy_text):
        errors.append(f"FAIL_DUPLICATE_UPPERCASE_FIELD: {key}")
    if policy_text != render_slot_policy(slot):
        errors.append("FAIL_POLICY_RENDER_MISMATCH")
    fields = parse_state_fields(policy_text)
    if fields.get("SLOT") != str(slot):
        errors.append(f"FAIL_POLICY_SLOT: expected SLOT: {slot}")
    if fields.get("BRANCH_MAILBOX") != mailbox_ref(slot):
        errors.append(f"FAIL_POLICY_MAILBOX: expected {mailbox_ref(slot)}")
    for other in SLOTS:
        if other != slot and f"bridge-{other}" in policy_text.lower():
            errors.append(f"FAIL_POLICY_CROSS_SLOT_REFERENCE: slot {other}")
    if state_text is not None:
        if unresolved_merge_markers(state_text):
            errors.append("FAIL_UNRESOLVED_MERGE_MARKERS")
        for key in duplicate_uppercase_fields(state_text):
            errors.append(f"FAIL_DUPLICATE_UPPERCASE_FIELD: {key}")
        state = parse_state_fields(state_text)
        if state.get("SLOT") != fields.get("SLOT") or state.get("BRANCH_MAILBOX") != fields.get("BRANCH_MAILBOX"):
            errors.append("FAIL_POLICY_STATE_IDENTITY_MISMATCH")
    return errors


def validate_snapshot(slot: int, snapshot_text: str, state_text: str) -> list[str]:
    _validate_slot(slot)
    errors: list[str] = []
    if unresolved_merge_markers(snapshot_text):
        errors.append("FAIL_UNRESOLVED_MERGE_MARKERS")
    for key in duplicate_uppercase_fields(snapshot_text):
        errors.append(f"FAIL_DUPLICATE_UPPERCASE_FIELD: {key}")
    if unresolved_merge_markers(state_text):
        errors.append("FAIL_UNRESOLVED_MERGE_MARKERS")
    for key in duplicate_uppercase_fields(state_text):
        errors.append(f"FAIL_DUPLICATE_UPPERCASE_FIELD: {key}")
    snapshot, state = parse_state_fields(snapshot_text), parse_state_fields(state_text)
    if snapshot.get("SLOT") != str(slot) or snapshot.get("BRANCH_MAILBOX") != mailbox_ref(slot):
        errors.append("FAIL_SNAPSHOT_IDENTITY")
    if snapshot.get("CURRENT_THREAD") != state.get("THREAD"):
        errors.append("FAIL_SNAPSHOT_STATE_THREAD_MISMATCH")
    if snapshot.get("CURRENT_TASK_BRANCH") != state.get("BRANCH_TASK"):
        errors.append("FAIL_SNAPSHOT_STATE_BRANCH_MISMATCH")
    if snapshot.get("STATUS") != state.get("STATUS"):
        errors.append("FAIL_SNAPSHOT_STATE_STATUS_MISMATCH")
    if state.get("STATUS") == "AVAILABLE":
        if state.get("THREAD") != "NONE" or state.get("TASK") != "NONE" or state.get("BRANCH_TASK") != f"bridge/{slot}/AVAILABLE":
            errors.append("FAIL_AVAILABLE_STATE_IDENTITY")
    return errors


def validate_publication(slot: int, target_ref: str, changed_paths: list[str]) -> list[str]:
    errors = validate_command(slot, target_ref, f"bridge/{slot}/validation")
    allowed_prefix = f".ai-bridge/"
    if not changed_paths:
        errors.append("FAIL_EMPTY_PUBLICATION")
    for path in changed_paths:
        if not path.startswith(allowed_prefix):
            errors.append(f"FAIL_MAILBOX_PATH: {path}")
    return errors


def validate_cross_slot_immutability(before: dict[int, str], after: dict[int, str], mutated_slot: int) -> list[str]:
    _validate_slot(mutated_slot)
    errors: list[str] = []
    for slot in SLOTS:
        if slot == mutated_slot:
            continue
        if before.get(slot) != after.get(slot):
            errors.append(f"FAIL_CROSS_SLOT_MUTATION: slot {slot} changed while mutating slot {mutated_slot}")
    return errors


def _print_result(errors: list[str]) -> int:
    if errors:
        for error in errors:
            print(error)
        return 1
    print("PASS_BRIDGE_V4_ISOLATION")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="command", required=True)

    command_parser = subparsers.add_parser("validate-command")
    command_parser.add_argument("--slot", type=int, required=True)
    command_parser.add_argument("--mailbox-ref", required=True)
    command_parser.add_argument("--task-branch", required=True)

    state_parser = subparsers.add_parser("validate-state")
    state_parser.add_argument("--slot", type=int, required=True)
    state_parser.add_argument("--file", type=Path, required=True)

    policy_parser = subparsers.add_parser("validate-policy")
    policy_parser.add_argument("--slot", type=int, required=True)
    policy_parser.add_argument("--policy-file", type=Path, required=True)
    policy_parser.add_argument("--state-file", type=Path)

    snapshot_parser = subparsers.add_parser("validate-snapshot")
    snapshot_parser.add_argument("--slot", type=int, required=True)
    snapshot_parser.add_argument("--snapshot-file", type=Path, required=True)
    snapshot_parser.add_argument("--state-file", type=Path, required=True)

    args = parser.parse_args(argv)
    if args.command == "validate-command":
        return _print_result(validate_command(args.slot, args.mailbox_ref, args.task_branch))
    if args.command == "validate-state":
        return _print_result(validate_state(args.slot, args.file.read_text(encoding="utf-8")))
    if args.command == "validate-policy":
        state_text = args.state_file.read_text(encoding="utf-8") if args.state_file else None
        return _print_result(validate_policy(args.slot, args.policy_file.read_text(encoding="utf-8"), state_text))
    if args.command == "validate-snapshot":
        return _print_result(validate_snapshot(args.slot, args.snapshot_file.read_text(encoding="utf-8"), args.state_file.read_text(encoding="utf-8")))
    return 2


if __name__ == "__main__":
    sys.exit(main())
