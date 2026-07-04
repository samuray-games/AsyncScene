#!/usr/bin/env python3
"""Validate the Step 4.4A boomer economy/conflict terminology audit."""
from __future__ import annotations

import hashlib
import importlib.util
from pathlib import Path
import subprocess
import sys

ROOT_DOC = "UI_PROFILE_BOOMER_STEP_4_4_ECONOMY_CONFLICT_TERMINOLOGY_AUDIT.md"
DOCS_DOC = "docs/UI_PROFILE_BOOMER_STEP_4_4_ECONOMY_CONFLICT_TERMINOLOGY_AUDIT.md"
GENERATOR = "tools/generate-boomer-step4-4-economy-conflict-audit.py"
VALIDATOR = "tools/validate-boomer-step4-4-economy-conflict-audit.py"
ALLOWED_SCOPE = {
    ROOT_DOC,
    DOCS_DOC,
    GENERATOR,
    VALIDATOR,
    "TASKS.md",
    "PROJECT_MEMORY.md",
}
STATIC_PASS = "STATIC_PASS / READY_FOR_RUNTIME_SMOKE"


def load_generator(root: Path):
    path = root / GENERATOR
    spec = importlib.util.spec_from_file_location("boomer_step44a_generator", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to import generator from {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def changed_paths(root: Path) -> list[str]:
    result = subprocess.run(
        ["git", "status", "--short"],
        cwd=root,
        check=True,
        capture_output=True,
        text=True,
    )
    paths = []
    for line in result.stdout.splitlines():
        if not line.strip():
            continue
        paths.append(line[3:].strip())
    return paths


def main(argv: list[str]) -> int:
    root = Path(argv[1]).resolve() if len(argv) > 1 else Path.cwd().resolve()
    generator = load_generator(root)
    audit = generator.build_audit(root)

    failures: list[str] = []

    root_doc = root / ROOT_DOC
    docs_doc = root / DOCS_DOC
    expected_text = audit["text"]
    actual_root = root_doc.read_text(encoding="utf-8")
    actual_docs = docs_doc.read_text(encoding="utf-8")

    if actual_root != expected_text:
        failures.append("Root audit artifact drifted from deterministic generator output.")
    if actual_docs != expected_text:
        failures.append("Docs audit artifact drifted from deterministic generator output.")
    if actual_root != actual_docs:
        failures.append("Root/docs Step 4.4A audit mirrors differ.")

    root_sha = hashlib.sha256(root_doc.read_bytes()).hexdigest()
    docs_sha = hashlib.sha256(docs_doc.read_bytes()).hexdigest()
    if root_sha != docs_sha:
        failures.append("Root/docs Step 4.4A audit mirror hashes differ.")

    rows = audit["rows"]
    seen_ids = set()
    seen_locators = set()
    for row in rows:
        row_id = row["id"]
        locator_key = (row["sourceFile"], row["sourceLocator"])
        if row_id in seen_ids:
            failures.append(f"Duplicate row id detected: {row_id}")
        if locator_key in seen_locators:
            failures.append(f"Duplicate source locator detected: {locator_key[0]} :: {locator_key[1]}")
        seen_ids.add(row_id)
        seen_locators.add(locator_key)
        if row["verdict"] == "FAIL" and row["classification"] not in generator.FAIL_CLASSIFICATIONS:
            failures.append(f"Unexpected fail classification for {row_id}: {row['classification']}")
        if row["classification"] == "allowed_exact" and row["currentText"] != row["acceptedBoomerTarget"]:
            failures.append(f"allowed_exact row mismatch for {row_id}")
        if row["classification"] in generator.FAIL_CLASSIFICATIONS and not row["reason"]:
            failures.append(f"Fail row missing reason for {row_id}")

    for failure in audit["failures"]:
        failures.append(f"Generator structural failure: {failure}")

    for path in changed_paths(root):
        if path not in ALLOWED_SCOPE:
            failures.append(f"Forbidden changed path outside approved Step 4.4A scope: {path}")

    if audit["status"] != STATIC_PASS:
        failures.append(f"Audit outcome is not STATIC_PASS: {audit['status']}")

    if failures:
        for failure in failures:
            print(f"FAIL: {failure}")
        return 1

    print(f"PASS: {audit['status']} rows={len(rows)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
