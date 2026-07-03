#!/usr/bin/env python3
"""Validate the Step 4.3 boomer terminology mapping artifact."""
from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from pathlib import Path
import sys

ROOT_DOC = "UI_PROFILE_BOOMER_STEP_4_3_MILLENNIAL_TO_BOOMER_MAPPING.md"
DOCS_DOC = "docs/UI_PROFILE_BOOMER_STEP_4_3_MILLENNIAL_TO_BOOMER_MAPPING.md"
INVENTORY_JSON = ".codex-input/boomer_step_4_2B/boomer_step_4_2_exact_inventory.txt"
ALLOWED_LEXICON = "docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md"
BUILD_MARKER = "UI_PROFILE_BOOMER_STEP_4_3_MILLENNIAL_TO_BOOMER_MAPPING"


def normalize_text(value: str) -> str:
    normalized = re.sub(r"\s+", " ", value.strip())
    return normalized.casefold()


def extract_variables(value: str) -> list[str]:
    return sorted(set(re.findall(r"\{([^{}]+)\}", value)))


def parse_inventory(path: Path) -> list[dict[str, object]]:
    data = json.loads(path.read_text(encoding="utf-8"))
    entries = data.get("entries")
    if not isinstance(entries, list):
        raise ValueError(f"Inventory {path} does not contain an entries list")
    return entries


def parse_allowed_lexicon(path: Path) -> dict[str, dict[str, str]]:
    rows: dict[str, dict[str, str]] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        if not re.match(r"^\| TXT_\d{4} \|", line):
            continue
        parts = [part.strip() for part in line.strip()[2:-2].split(" | ")]
        if len(parts) != 3:
            raise ValueError(f"Malformed allowed lexicon row: {line}")
        rows[parts[0]] = {"currentText": parts[1], "boomerText": parts[2]}
    return rows


def parse_mapping_rows(text: str) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for line in text.splitlines():
        if not re.match(r"^\| MAP_\d{4} \|", line):
            continue
        parts = [part.strip() for part in line.strip()[2:-2].split(" | ")]
        if len(parts) != 10:
            raise ValueError(f"Malformed mapping row: {line}")
        rows.append(
            {
                "mappingId": parts[0],
                "sourceInventoryId": parts[1],
                "sourceProfile": parts[2],
                "category": parts[3],
                "surface": parts[4],
                "key": parts[5],
                "sourceText": parts[6],
                "boomerText": parts[7],
                "mappingMode": parts[8],
                "variables": parts[9],
            }
        )
    return rows


def validate(root: Path) -> dict[str, object]:
    failures: list[dict[str, object]] = []

    root_path = root / ROOT_DOC
    docs_path = root / DOCS_DOC
    root_text = root_path.read_text(encoding="utf-8")
    docs_text = docs_path.read_text(encoding="utf-8")
    if root_text != docs_text:
        failures.append({"code": "mirror_mismatch", "files": [ROOT_DOC, DOCS_DOC]})

    if BUILD_MARKER not in root_text:
        failures.append({"code": "missing_build_marker", "file": ROOT_DOC})

    mapping_rows = parse_mapping_rows(root_text)
    inventory_rows = parse_inventory(root / INVENTORY_JSON)
    allowed_by_id = parse_allowed_lexicon(root / ALLOWED_LEXICON)
    inventory_by_id = {str(row.get("id", "")).strip(): row for row in inventory_rows}

    mapping_ids = Counter(row["mappingId"] for row in mapping_rows)
    source_ids = Counter(row["sourceInventoryId"] for row in mapping_rows)
    for mapping_id, count in mapping_ids.items():
        if count != 1:
            failures.append({"code": "duplicate_mapping_id", "mappingId": mapping_id, "count": count})
    for source_id, count in source_ids.items():
        if count != 1:
            failures.append({"code": "duplicate_source_inventory_id", "sourceInventoryId": source_id, "count": count})

    expected_source_ids = set(inventory_by_id)
    actual_source_ids = set(source_ids)
    for missing in sorted(expected_source_ids - actual_source_ids):
        failures.append({"code": "missing_mapping", "sourceInventoryId": missing})
    for extra in sorted(actual_source_ids - expected_source_ids):
        failures.append({"code": "unexpected_mapping_source", "sourceInventoryId": extra})

    semantic_groups: defaultdict[str, set[str]] = defaultdict(set)
    for row in mapping_rows:
        source_id = row["sourceInventoryId"]
        inventory_row = inventory_by_id.get(source_id)
        allowed_row = allowed_by_id.get(source_id)
        if inventory_row is None:
            continue
        if allowed_row is None:
            failures.append({"code": "allowed_lexicon_missing_source_id", "sourceInventoryId": source_id})
            continue
        expected_source_text = str(inventory_row.get("currentText", "")).strip()
        if row["sourceText"] != expected_source_text:
            failures.append({"code": "source_text_mismatch", "sourceInventoryId": source_id})
        if row["boomerText"] != allowed_row["boomerText"]:
            failures.append({"code": "boomer_target_drift", "sourceInventoryId": source_id})
        expected_mode = "identity" if row["sourceText"] == row["boomerText"] else "changed"
        if row["mappingMode"] != expected_mode:
            failures.append({"code": "mapping_mode_mismatch", "sourceInventoryId": source_id, "expected": expected_mode})

        source_variables = extract_variables(row["sourceText"])
        target_variables = extract_variables(row["boomerText"])
        if row["variables"] != (f"[{','.join(source_variables)}]" if source_variables else "[]"):
            failures.append({"code": "variables_column_mismatch", "sourceInventoryId": source_id})
        if target_variables != source_variables:
            failures.append({"code": "placeholder_mismatch", "sourceInventoryId": source_id})

        semantic_groups[normalize_text(row["sourceText"])].add(normalize_text(row["boomerText"]))

    for normalized_source, normalized_targets in sorted(semantic_groups.items()):
        if len(normalized_targets) > 1:
            failures.append(
                {
                    "code": "semantic_ambiguity",
                    "normalizedSource": normalized_source,
                    "normalizedTargetCount": len(normalized_targets),
                }
            )

    return {
        "ok": not failures,
        "buildMarker": BUILD_MARKER,
        "mappingCount": len(mapping_rows),
        "sourceInventoryEntryCount": len(inventory_rows),
        "coveragePercent": 100 if mapping_rows and len(mapping_rows) == len(inventory_rows) else 0,
        "changedMappingCount": sum(1 for row in mapping_rows if row["mappingMode"] == "changed"),
        "identityMappingCount": sum(1 for row in mapping_rows if row["mappingMode"] == "identity"),
        "semanticAmbiguityCount": sum(1 for item in failures if item["code"] == "semantic_ambiguity"),
        "placeholderMismatchCount": sum(1 for item in failures if item["code"] == "placeholder_mismatch"),
        "duplicateMappingsCount": sum(
            1 for item in failures if item["code"] in {"duplicate_mapping_id", "duplicate_source_inventory_id"}
        ),
        "failures": failures,
    }


def main(argv: list[str]) -> int:
    root = Path(argv[1]) if len(argv) > 1 else Path.cwd()
    result = validate(root)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
