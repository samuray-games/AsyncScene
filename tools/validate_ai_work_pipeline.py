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
    "ACCEPTED_SOURCE_PENDING_INTEGRATION",
    "CORRECTION_REQUIRED",
    "BLOCKED",
    "ACCEPTED",
    "CANCELLED",
}

# These records were finalized under an earlier task schema and are immutable.
# Revalidating their phase artifacts against a newer schema would turn harmless
# validator evolution into repository-wide historical breakage.
HISTORICAL_TERMINAL_STATUSES = {
    "FINAL_MAIN_AND_MEMORY_SYNC_COMPLETE",
}

# These known lifecycle states are evidence-only in the task-package validator:
# they are allowed as current status values, but their phase artifacts are not
# revalidated as active prompt material.
EVIDENCE_ONLY_STATUSES = {
    "READY_FOR_REVIEW",
    "ACCEPTED_SOURCE_PENDING_INTEGRATION",
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

SUPPORTED_SKILLS_ROOT = ROOT / "plugins" / "asynchronia" / "skills"
PLUGIN_INVOCATION = "Use @asynchronia plugin."
SKILL_REFERENCE_RE = re.compile(r"Use @asynchronia ([A-Za-z0-9-]+)\.")


def parse_header(text: str) -> dict[str, str]:
    result: dict[str, str] = {}
    for line in text.splitlines():
        match = re.match(r"^([A-Z][A-Z0-9_]*):\s*(.+?)\s*$", line)
        if match:
            result[match.group(1)] = match.group(2)
    return result


def supported_skill_names() -> set[str]:
    return {
        path.name
        for path in SUPPORTED_SKILLS_ROOT.iterdir()
        if path.is_dir() and (path / "SKILL.md").exists()
    }


def validate_file(
    path: Path,
    task_id: str,
    *,
    phase_name: str | None = None,
    enforce_active_codex_rules: bool = False,
) -> list[str]:
    errors: list[str] = []
    text = path.read_text(encoding="utf-8")
    header = parse_header(text)
    missing = COMMON_KEYS - header.keys()
    if missing:
        errors.append(f"{path}: missing header keys {sorted(missing)}")
    if header.get("TASK_ID") != task_id:
        errors.append(f"{path}: TASK_ID does not match directory")

    schema_name = phase_name or path.name
    for section in REQUIRED_SECTIONS[schema_name]:
        if f"### {section}" not in text:
            errors.append(f"{path}: missing section {section!r}")

    if schema_name == "03-codex-task.md" and enforce_active_codex_rules:
        lines = text.splitlines()
        if not lines or lines[0] != PLUGIN_INVOCATION:
            errors.append(f"{path}: active executable Codex prompt must start with {PLUGIN_INVOCATION!r}")
            return errors

        for skill_name in SKILL_REFERENCE_RE.findall("\n".join(lines[1:])):
            if skill_name not in supported_skill_names():
                errors.append(f"{path}: unsupported skill reference in active task: {skill_name}")
        write_section = text.split("### Allowed writes", 1)[-1].split("### Forbidden changes", 1)[0]
        for forbidden in BRIDGE_FORBIDDEN_PATHS:
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

    current_status = state.get("CURRENT_STATUS")
    if current_status not in ALLOWED_STATUSES and current_status not in HISTORICAL_TERMINAL_STATUSES:
        errors.append(f"{state_path}: invalid CURRENT_STATUS")

    if current_status in HISTORICAL_TERMINAL_STATUSES:
        if state.get("NEXT_ROLE") != "NONE_FOR_THIS_TASK":
            errors.append(f"{state_path}: terminal historical task must have NEXT_ROLE NONE_FOR_THIS_TASK")
        # The CURRENT_ARTIFACT may intentionally be an immutable remote commit
        # identity rather than a path in the present checkout. Do not reinterpret
        # or rewrite accepted historical phase artifacts under the current schema.
        return errors

    if current_status in EVIDENCE_ONLY_STATUSES:
        return errors

    current_artifact = state.get("CURRENT_ARTIFACT")
    resolved_current: Path | None = None
    if current_artifact and current_artifact != "N/A":
        resolved_current = ROOT / current_artifact
        if not resolved_current.exists():
            errors.append(f"{state_path}: CURRENT_ARTIFACT does not exist: {current_artifact}")

    seen_gap = False
    standard_paths: set[Path] = set()
    for name in PHASE_FILES:
        path = task_dir / name
        standard_paths.add(path)
        if not path.exists():
            seen_gap = True
            continue
        if seen_gap:
            errors.append(f"{task_dir}: phase file {name} exists after a missing earlier phase")
        errors.extend(
            validate_file(
                path,
                task_id,
                enforce_active_codex_rules=(resolved_current == path and name == "03-codex-task.md"),
            )
        )

    if resolved_current and resolved_current.exists() and resolved_current not in standard_paths:
        if resolved_current.name.startswith("03-codex-task-r") and resolved_current.suffix == ".md":
            errors.extend(
                validate_file(
                    resolved_current,
                    task_id,
                    phase_name="03-codex-task.md",
                    enforce_active_codex_rules=True,
                )
            )
        else:
            errors.append(f"{state_path}: unsupported corrected CURRENT_ARTIFACT: {current_artifact}")

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
