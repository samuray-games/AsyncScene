#!/usr/bin/env python3
"""Validate ordinary repository policy and retired control-plane removal."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REQUIRED_FILES = (
    "AGENTS.md",
    "AGENTS.override.md",
    "ORCHESTRATION.md",
    ".ai-work/SCHEMA.md",
    "tools/validate_ai_work_pipeline.py",
)
RETIRED_PATHS = (
    ".ai-bridge",
    ".ai-memory/bridges",
    "BRIDGE.md",
    "BRIDGE_PUBLICATION_POLICY.md",
    "BRIDGE_REPAIR_MANIFEST_20260714.md",
    "CODEX_BRIDGE_BOOTSTRAP.md",
    "CODEX_BRIDGE_RECOVERY.md",
    "PROCESS_ROOT_SYNC.md",
    "STAGE6_PARALLEL_EXECUTION_PLAN.md",
    "tools/bridge_v4_authority_check.py",
    "tools/bridge_v4_contract.py",
    "tools/closed_loop_contract.py",
    "tools/repository_bridge_authority.py",
    "plugins/asynchronia/bridge_task_descriptor.py",
)
RETIRED_ALIASES = ("мост 1", "мост 2", "мост 3", "chatgpt-codex-bridge")
TEXT_EXTENSIONS = {".md", ".py", ".yml", ".yaml", ".json", ".txt", ".toml"}


def path_exists(relative: str) -> bool:
    return (ROOT / relative).exists()


def active_text_files() -> list[Path]:
    relative_paths = (
        "AGENTS.md",
        "AGENTS.override.md",
        "ORCHESTRATION.md",
        ".ai-work/README.md",
        ".ai-work/SCHEMA.md",
        ".github/workflows/orchestration-policy.yml",
    )
    return [ROOT / relative for relative in relative_paths if (ROOT / relative).is_file()]


def main() -> int:
    failures: list[str] = []
    for relative in REQUIRED_FILES:
        if not path_exists(relative):
            failures.append(f"missing required policy file: {relative}")
    for relative in RETIRED_PATHS:
        if path_exists(relative):
            failures.append(f"retired control-plane path remains: {relative}")
    for path in active_text_files():
        text = path.read_text(encoding="utf-8", errors="replace")
        for alias in RETIRED_ALIASES:
            if alias in text:
                failures.append(f"retired bridge reference remains active: {path.relative_to(ROOT)}: {alias}")
    if failures:
        for failure in failures:
            print(f"FAIL_REPOSITORY_POLICY: {failure}")
        return 1
    print("PASS_REPOSITORY_POLICY")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
