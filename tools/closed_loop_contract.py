#!/usr/bin/env python3
"""Shared closed-loop bridge contract for Asynchronia."""

from __future__ import annotations

from dataclasses import dataclass, asdict
from pathlib import Path

CONTRACT_VERSION = "1.0.0"
POLICY_VERSION = "CODEX_AUTOPILOT_2026_07_09_CLOSED_LOOP_V1"
BRIDGE_PROTOCOL = "3.3"
EXPECTED_OUTBOX_SUFFIX = "-02-codex.md"
FORBIDDEN_RUNTIME_GATE = "runtime-safety-gate"


@dataclass(frozen=True)
class ClosedLoopState:
    bridge_slot: int
    thread_id: str
    lane_id: str
    task_id: str
    execution_epoch: str
    baseline_sha: str
    expected_outbox: str
    remote_state_sha: str
    completion_mode: str
    result_status: str
    next_action: str


def load_state(data: dict) -> ClosedLoopState:
    required = {
        "bridge_slot",
        "thread_id",
        "lane_id",
        "task_id",
        "execution_epoch",
        "baseline_sha",
        "expected_outbox",
        "remote_state_sha",
        "completion_mode",
        "result_status",
        "next_action",
    }
    missing = sorted(required - data.keys())
    if missing:
        raise ValueError(f"missing fields: {missing}")
    return ClosedLoopState(**{key: data[key] for key in required})


def validate_outbox_path(path: str) -> None:
    if not path.endswith(EXPECTED_OUTBOX_SUFFIX):
        raise ValueError("expected outbox path must end with -02-codex.md")


def serialize(state: ClosedLoopState) -> dict:
    return asdict(state)

