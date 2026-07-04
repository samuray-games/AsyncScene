#!/usr/bin/env python3
"""Validate the Step 4.4A boomer economy/conflict terminology audit."""
from __future__ import annotations

import hashlib
import importlib.util
from pathlib import Path
import subprocess
import sys

sys.dont_write_bytecode = True

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
STATIC_FAIL = "STATIC_FAIL / UNTRANSLATED_OR_UNMAPPED_ENTITIES_FOUND"


def load_generator(root: Path):
    path = root / GENERATOR
    spec = importlib.util.spec_from_file_location("boomer_step44a_generator", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to import generator from {path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
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


def count_by_classification(rows: list[dict[str, str]]) -> dict[str, int]:
    counts: dict[str, int] = {}
    for row in rows:
        counts[row["classification"]] = counts.get(row["classification"], 0) + 1
    return counts


def count_by_feature(rows: list[dict[str, str]]) -> dict[str, int]:
    counts: dict[str, int] = {}
    for row in rows:
        counts[row["featureZone"]] = counts.get(row["featureZone"], 0) + 1
    return counts


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

    live_rows = audit["liveRows"]
    rows = audit["rows"]
    non_live_rows = audit["nonLiveRows"]

    if rows != live_rows:
        failures.append("Audit rows must equal the live row table exactly.")

    seen_ids = set()
    seen_live_locators = set()
    for row in live_rows:
        row_id = row["id"]
        locator_key = (row["sourceFile"], row["sourceLocator"])
        if row_id in seen_ids:
            failures.append(f"Duplicate row id detected: {row_id}")
        if locator_key in seen_live_locators:
            failures.append(f"Duplicate live source locator detected: {locator_key[0]} :: {locator_key[1]}")
        seen_ids.add(row_id)
        seen_live_locators.add(locator_key)
        if row["verdict"] not in {"PASS", "FAIL"}:
            failures.append(f"Live row must use PASS/FAIL verdict: {row_id} -> {row['verdict']}")
        if row["verdict"] == "FAIL" and row["classification"] not in set(generator.FAIL_CLASSIFICATIONS):
            failures.append(f"Unexpected FAIL classification for {row_id}: {row['classification']}")
        if row["verdict"] == "PASS" and row["classification"] in set(generator.FAIL_CLASSIFICATIONS):
            failures.append(f"FAIL classification contributed to PASS row {row_id}: {row['classification']}")
        if row["classification"] == "allowed_exact" and row["currentText"] != row["acceptedBoomerTarget"]:
            failures.append(f"allowed_exact row mismatch for {row_id}")
        if row["verdict"] == "FAIL" and not row["reason"]:
            failures.append(f"Fail row missing reason for {row_id}")

    for row in non_live_rows:
        row_id = row["id"]
        if row_id in seen_ids:
            failures.append(f"Duplicate row id detected across live/non-live tables: {row_id}")
        seen_ids.add(row_id)
        if row["verdict"] != generator.NON_LIVE_VERDICT:
            failures.append(f"Non-live row must use {generator.NON_LIVE_VERDICT}: {row_id}")
        if row["classification"] not in {"dev_only", "diagnostic_only", "stale_artifact_only", "dead_or_unreachable"}:
            failures.append(f"Non-live row has unsupported classification: {row_id} -> {row['classification']}")

    fail_row_count = sum(1 for row in live_rows if row["verdict"] == "FAIL")
    pass_row_count = sum(1 for row in live_rows if row["verdict"] == "PASS")
    classification_counts = count_by_classification(live_rows)
    feature_counts = count_by_feature(live_rows)

    if audit["auditedRowCount"] != len(live_rows):
        failures.append("auditedRowCount does not equal len(liveRows).")
    if audit["failRowCount"] != fail_row_count:
        failures.append("failRowCount does not equal count(verdict == FAIL).")
    if audit["passRowCount"] != pass_row_count:
        failures.append("passRowCount does not equal count(verdict == PASS).")
    if fail_row_count + pass_row_count != audit["auditedRowCount"]:
        failures.append("failRowCount + passRowCount does not equal auditedRowCount.")
    if audit["classificationCounts"] != classification_counts:
        failures.append("Classification counts do not match the live row table.")
    if audit["featureCounts"] != feature_counts:
        failures.append("Feature counts do not match the live row table.")
    if any(row["verdict"] in {"PASS", "FAIL"} for row in non_live_rows):
        failures.append("Non-live rows must not contribute PASS/FAIL verdicts.")

    expected_status = STATIC_PASS if fail_row_count == 0 and audit["structuralFailureCount"] == 0 else STATIC_FAIL
    if audit["status"] != expected_status:
        failures.append(f"Audit status mismatch: expected {expected_status}, got {audit['status']}")
    if audit["status"] == STATIC_PASS and any(row["verdict"] == "FAIL" for row in live_rows):
        failures.append("STATIC_PASS is invalid while a live row still has verdict FAIL.")
    if audit["status"] == STATIC_PASS and audit["structuralFailureCount"] != 0:
        failures.append("STATIC_PASS is invalid while structuralFailureCount is non-zero.")
    if audit["structuralFailureCount"] != len(audit["failures"]):
        failures.append("structuralFailureCount does not equal len(failures).")

    for failure in audit["failures"]:
        failures.append(f"Generator structural failure: {failure}")

    for path in changed_paths(root):
        if path not in ALLOWED_SCOPE:
            failures.append(f"Forbidden changed path outside approved Step 4.4A scope: {path}")

    if failures:
        for failure in failures:
            print(f"FAIL: {failure}")
        return 1

    print(
        f"PASS: {audit['status']} liveRows={len(live_rows)} nonLiveRows={len(non_live_rows)} structuralFailures={audit['structuralFailureCount']}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
