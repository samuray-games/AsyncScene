#!/usr/bin/env python3
"""Validate the Chat -> Work -> Codex -> Review task packages.

Documentation/process-only validator. It never reads or writes .ai-bridge state.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORK_ROOT = ROOT / ".ai-work"
TASKS_ROOT = WORK_ROOT / "tasks"

ALLOWED_STATUSES = {
    "DRAFT_CHAT",
    "READY_FOR_WORK",
    "READY_FOR_CODEX",
    "IMPLEMENTING",
    "READY_FOR_REVIEW",
    "CORRECTION_REQUIRED",
    "BLOCKED",
    "ACCEPTED",
    "CANCELLED",
}

REQUIRED_STATE_KEYS = {
    "TASK_ID",
    "PIPELINE_VERSION",
    "CURRENT_STATUS",
    "CURRENT_PHASE",
    "CURRENT_ARTIFACT",
    "NEXT_ROLE",
    "NEXT_ACTION",
    "UPDATED_AT",
}

COMMON_KEYS = {
    "TASK_ID",
    "PIPELINE_VERSION",
    "PHASE",
    "STATUS",
    "CREATED_AT",
    "AUTHOR_ROLE",
    "SOURCE_REVISION",
}

PHASE_FILES = (
    "01-chat-brief.md",
    "02-work-plan.md",
    "03-codex-task.md",
    "04-review-report.md",
)

REQUIRED_SECTIONS = {
    "01-chat-brief.md": (
        "Goal",
        "Non-goals",
        "Accepted decisions",
        "Constraints",
        "Acceptance criteria",
        "Open questions",
        "Output required from Work",
    ),
    "02-work-plan.md": (
        "Repository evidence inspected",
        "Current implementation state",
        "Conflict check",
        "Dependency map",
        "Atomic task decomposition",
        "Read scope",
        "Write scope",
        "Risk controls",
        "Validation plan",
        "Codex prompt strategy",
        "Blockers",
    ),
    "03-codex-task.md": (
        "Atomic goal",
        "Exact baseline",
        "Allowed reads",
        "Allowed writes",
        "Forbidden changes",
        "Dependencies",
        "Implementation requirements",
        "Validation commands",
        "Required final report",
        "Stop conditions",
    ),
    "04-review-report.md": (
        "Evidence inspected",
        "Scope verification",
        "Acceptance criteria results",
        "Test results",
        "Runtime status",
        "Findings",
        "Verdict",
        "Exact next action",
    ),
}

BRIDGE_FORBIDDEN_PATHS = (
    ".ai-bridge/STATE.md",
    ".ai-bridge/inbox/",
    ".ai-bridge/outbox/",
    ".ai-bridge/receipts/",
)


def parse_header(text: str) -> dict[str, str]:
    result: dict[str, str] = {}
    for line in text.splitlines():
        match = re.match(r"^([A-Z][A-Z0-9_]*):\s*(.+?)\s*$", line)
        if match:
            result[match.group(1)] = match.group(2)
    return result


def validate_file(path: Path, task_id: str) -> list[str]:
    errors: list[str] = []
    text = path.read_text(encoding="utf-8")
    header = parse_header(text)
    missing = COMMON_KEYS - header.keys()
    if missing:
        errors.append(f"{path}: missing header keys {sorted(missing)}")
    if header.get("TASK_ID") != task_id:
        errors.append(f"{path}: TASK_ID does not match directory")
    for section in REQUIRED_SECTIONS[path.name]:
        if f"### {section}" not in text:
            errors.append(f"{path}: missing section {section!r}")
    if path.name == "03-codex-task.md":
        if "Use @asynchronia runtime-safety-gate." not in text:
            errors.append(f"{path}: missing mandatory runtime safety gate line")
        for forbidden in BRIDGE_FORBIDDEN_PATHS:
            write_section = text.split("### Allowed writes", 1)[-1].split("### Forbidden changes", 1)[0]
            if forbidden in write_section:
                errors.append(f"{path}: bridge path appears in allowed writes: {forbidden}")
    return errors


def validate_task(task_dir: Path) -> list[str]:
    errors: list[str] = []
    task_id = task_dir.name
    state_path = task_dir / "STATE.md"
    if not state_path.exists():
        return [f"{task_dir}: missing STATE.md"]

    state_text = state_path.read_text(encoding="utf-8")
    state = parse_header(state_text)
    missing = REQUIRED_STATE_KEYS - state.keys()
    if missing:
        errors.append(f"{state_path}: missing keys {sorted(missing)}")
    if state.get("TASK_ID") != task_id:
        errors.append(f"{state_path}: TASK_ID does not match directory")
    if state.get("CURRENT_STATUS") not in ALLOWED_STATUSES:
        errors.append(f"{state_path}: invalid CURRENT_STATUS")

    seen_gap = False
    for name in PHASE_FILES:
        path = task_dir / name
        if not path.exists():
            seen_gap = True
            continue
        if seen_gap:
            errors.append(f"{task_dir}: phase file {name} exists after a missing earlier phase")
        errors.extend(validate_file(path, task_id))

    current_artifact = state.get("CURRENT_ARTIFACT")
    if current_artifact and current_artifact != "N/A":
        resolved = ROOT / current_artifact
        if not resolved.exists():
            errors.append(f"{state_path}: CURRENT_ARTIFACT does not exist: {current_artifact}")
    return errors


def main() -> int:
    errors: list[str] = []
    for required in (WORK_ROOT / "README.md", WORK_ROOT / "SCHEMA.md", WORK_ROOT / "templates" / "TASK_PACKAGE.md"):
        if not required.exists():
            errors.append(f"missing required pipeline file: {required}")

    if TASKS_ROOT.exists():
        for task_dir in sorted(path for path in TASKS_ROOT.iterdir() if path.is_dir()):
            errors.extend(validate_task(task_dir))

    if errors:
        print("AI_WORK_PIPELINE_FAIL")
        for error in errors:
            print(f"- {error}")
        return 1

    print("AI_WORK_PIPELINE_PASS")
    print("bridge_scope=UNCHANGED")
    print(f"task_count={sum(1 for p in TASKS_ROOT.iterdir() if p.is_dir()) if TASKS_ROOT.exists() else 0}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
