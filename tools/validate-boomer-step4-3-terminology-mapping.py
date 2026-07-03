#!/usr/bin/env python3
"""Validate the canonical Step 4.3 boomer terminology mapping artifact."""
from __future__ import annotations

import hashlib
import json
import re
import subprocess
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path
import sys

ROOT_DOC = "UI_PROFILE_BOOMER_STEP_4_3_MILLENNIAL_TO_BOOMER_MAPPING.md"
DOCS_DOC = "docs/UI_PROFILE_BOOMER_STEP_4_3_MILLENNIAL_TO_BOOMER_MAPPING.md"
INVENTORY_JSON = ".codex-input/boomer_step_4_2B/boomer_step_4_2_exact_inventory.txt"
ALLOWED_LEXICON = "docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md"
HISTORICAL_MAPPING = "docs/UI_PROFILE_BOOMER_LEXICAL_MAPPING.md"
SMOKE_VERSION = "BOOMER-STEP4_3-TERMINOLOGY-MAPPING-STATIC-v2"
ALLOWED_SCOPE = {
    ROOT_DOC,
    DOCS_DOC,
    "tools/generate-boomer-step4-3-terminology-mapping.py",
    "tools/validate-boomer-step4-3-terminology-mapping.py",
    "TASKS.md",
    "PROJECT_MEMORY.md",
}
REQUIRED_BUCKETS = ["buttons", "statuses", "errors", "hints", "economy", "battles", "DM"]
LEGACY_STORED_NORMALIZED_UNIQUE_SOURCE_TEXTS = 122
INTRO4_OVERRIDE_AUTHORITY = "task_intro4_override_2026_07_03"
ALLOWED_LEXICON_AUTHORITY = "docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md"
CANON_MECHANICS_INVARIANT = "No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes."

INTRO4_EXPECTED = {
    "Оппонент задаёт риск.": "Соперник определяет уровень риска.",
    "Ставка списывает ресурс.": "Выбранная ставка списывается из запаса монет 💰.",
    "Итог виден сразу.": "Результат показывается сразу.",
    "Цена и итог сразу.": "Стоимость действия и его результат показываются сразу.",
}

INTRO4_STALE = {
    "Оппонент задаёт риск.": "Оппонент задаёт риск действия.",
    "Ставка списывает ресурс.": "Ставка списывает ресурс.",
    "Итог виден сразу.": "Итог виден сразу после действия.",
    "Цена и итог сразу.": "Цена и итог показаны заранее.",
}

RAW_TO_BUCKET = {
    "button": "buttons",
    "menu": "buttons",
    "label": "statuses",
    "notification": "statuses",
    "start_screen": "statuses",
    "error": "errors",
    "warning": "errors",
    "placeholder": "errors",
    "toast": "errors",
    "tooltip": "hints",
    "economy": "economy",
    "p2p": "economy",
    "respect": "economy",
    "battle": "battles",
    "event": "battles",
    "system_message": "battles",
    "training": "battles",
    "cop_flow": "DM",
    "npc_say": "DM",
    "npc_dm": "DM",
    "report": "DM",
    "conflict_feed": "DM",
}


def normalize_display(value: str) -> str:
    value = unicodedata.normalize("NFC", value)
    return re.sub(r"\s+", " ", value.strip())


def comparison_key(value: str) -> str:
    return normalize_display(value).casefold()


def extract_placeholders(value: str) -> list[str]:
    return sorted(set(re.findall(r"\{([^{}]+)\}", normalize_display(value))))


def semantic_key(term: str, variables: list[str]) -> str:
    seed = f"{comparison_key(term)}||{','.join(variables)}"
    return "SEM_" + hashlib.sha1(seed.encode("utf-8")).hexdigest()[:12]


def parse_inventory(path: Path) -> list[dict[str, object]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    entries = payload.get("entries")
    if not isinstance(entries, list):
        raise ValueError(f"Inventory {path} does not contain an entries list")
    return entries


def parse_allowed_lexicon(path: Path) -> dict[str, dict[str, str]]:
    rows: dict[str, dict[str, str]] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        if not re.match(r"^\| TXT_\d{4} \|", line):
            continue
        parts = [part.strip() for part in line.strip()[2:-2].split(" | ")]
        rows[parts[0]] = {"currentText": normalize_display(parts[1]), "boomerText": normalize_display(parts[2])}
    return rows


def parse_historical_mapping(path: Path) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if not re.match(r"^\| MAP_\d{4} \|", line):
            continue
        parts = [part.strip() for part in line.strip()[2:-2].split(" | ")]
        rows.append({"legacyMappingId": parts[0], "millennialTerm": normalize_display(parts[1]), "boomerTerm": normalize_display(parts[2])})
    return rows


def parse_mapping_rows(path: Path) -> list[dict[str, object]]:
    rows: list[dict[str, object]] = []
    in_exact_mapping_table = False
    for line in path.read_text(encoding="utf-8").splitlines():
        if line.strip() == "## Exact canonical mapping table":
            in_exact_mapping_table = True
            continue
        if in_exact_mapping_table and line.startswith("## "):
            break
        if not in_exact_mapping_table:
            continue
        if not re.match(r"^\| MAP_\d{4} \|", line):
            continue
        parts = [part.strip() for part in line.strip()[2:-2].split(" | ")]
        if len(parts) != 13:
            raise ValueError(f"Malformed mapping row: {line}")
        rows.append(
            {
                "id": parts[0],
                "semanticKey": parts[1],
                "millennialTerm": normalize_display(parts[2]),
                "boomerTerm": normalize_display(parts[3]),
                "operation": parts[4],
                "meaning": parts[5],
                "categories": [value.strip() for value in parts[6].split(",") if value.strip()],
                "variables": [value.strip() for value in parts[7].split(",") if value.strip()],
                "sourceIds": [value.strip() for value in parts[8].split(",") if value.strip()],
                "sourceSurfaces": [value.strip() for value in parts[9].split(";") if value.strip()],
                "sourceOccurrenceCount": int(parts[10]),
                "boomerAuthority": parts[11],
                "mechanicsInvariant": parts[12],
            }
        )
    return rows


def bucket_for_category(raw_category: str) -> str | None:
    return RAW_TO_BUCKET.get(raw_category.strip())


def authoritative_boomer_target(source_text: str, default_target: str) -> tuple[str, str]:
    normalized_source = normalize_display(source_text)
    if normalized_source in INTRO4_EXPECTED:
        return normalize_display(INTRO4_EXPECTED[normalized_source]), INTRO4_OVERRIDE_AUTHORITY
    return normalize_display(default_target), ALLOWED_LEXICON_AUTHORITY


def aggregate_authoritative_inventory(
    inventory_rows: list[dict[str, object]],
    allowed_by_id: dict[str, dict[str, str]],
) -> dict[tuple[str, tuple[str, ...]], dict[str, object]]:
    groups: dict[tuple[str, tuple[str, ...]], dict[str, object]] = {}
    for entry in inventory_rows:
        source_id = str(entry.get("id", "")).strip()
        source_text = normalize_display(str(entry.get("currentText", "")).strip())
        placeholders = tuple(extract_placeholders(source_text))
        key = (comparison_key(source_text), placeholders)
        default_target = allowed_by_id[source_id]["boomerText"]
        boomer_target, authority = authoritative_boomer_target(source_text, default_target)
        bucket = bucket_for_category(str(entry.get("category", "")).strip())

        group = groups.setdefault(
            key,
            {
                "millennialTerm": source_text,
                "boomerTargets": set(),
                "sourceIds": set(),
                "categories": set(),
                "sourceSurfaces": set(),
                "variables": list(placeholders),
                "authorities": set(),
            },
        )
        group["boomerTargets"].add(boomer_target)
        group["sourceIds"].add(source_id)
        if bucket:
            group["categories"].add(bucket)
        group["sourceSurfaces"].add(f"{str(entry.get('surface', '')).strip()}:{str(entry.get('key', '')).strip()}")
        group["authorities"].add(authority)
    return groups


def changed_paths(root: Path) -> list[str]:
    result = subprocess.run(
        ["git", "status", "--short"],
        cwd=root,
        check=True,
        capture_output=True,
        text=True,
    )
    paths: list[str] = []
    for line in result.stdout.splitlines():
        if not line.strip():
            continue
        paths.append(line[3:].strip())
    return paths


def validate(root: Path) -> dict[str, object]:
    validator_failures: list[dict[str, object]] = []
    inventory_rows = parse_inventory(root / INVENTORY_JSON)
    allowed_by_id = parse_allowed_lexicon(root / ALLOWED_LEXICON)
    legacy_rows = parse_historical_mapping(root / HISTORICAL_MAPPING)
    authoritative_groups = aggregate_authoritative_inventory(inventory_rows, allowed_by_id)
    root_doc = root / ROOT_DOC
    docs_doc = root / DOCS_DOC
    root_rows = parse_mapping_rows(root_doc)
    docs_rows = parse_mapping_rows(docs_doc)

    raw_inventory_row_count = len(inventory_rows)
    canonical_millennial_term_count = len(authoritative_groups)
    aggregated_duplicate_occurrence_count = raw_inventory_row_count - canonical_millennial_term_count
    mapping_row_count = len(root_rows)

    root_sha = hashlib.sha256(root_doc.read_bytes()).hexdigest()
    docs_sha = hashlib.sha256(docs_doc.read_bytes()).hexdigest()
    markdown_mirror_parity = root_doc.read_bytes() == docs_doc.read_bytes()

    duplicate_ids = sorted([mapping_id for mapping_id, count in Counter(row["id"] for row in root_rows).items() if count > 1])
    duplicate_semantic_keys = sorted([key for key, count in Counter(row["semanticKey"] for row in root_rows).items() if count > 1])
    duplicate_millennial_terms = sorted(
        [term for term, count in Counter(comparison_key(row["millennialTerm"]) for row in root_rows).items() if count > 1]
    )
    duplicate_pairs = sorted(
        [
            f"{millennial} => {boomer}"
            for (millennial, boomer), count in Counter(
                (comparison_key(row["millennialTerm"]), comparison_key(row["boomerTerm"])) for row in root_rows
            ).items()
            if count > 1
        ]
    )

    source_id_counter = Counter()
    duplicate_source_ids: list[str] = []
    missing_source_ids: list[str] = []
    conflicting_boomer_targets: list[dict[str, object]] = []
    ambiguous_millennial_terms: list[dict[str, object]] = []
    placeholder_mismatches: list[dict[str, object]] = []
    invalid_operations: list[dict[str, object]] = []
    unclassified_rows: list[str] = []
    mechanics_invariant_failures: list[str] = []
    intro4_mismatches: list[dict[str, object]] = []
    stale_intro4_targets_remaining: list[dict[str, object]] = []

    row_by_key: dict[tuple[str, tuple[str, ...]], dict[str, object]] = {}
    for row in root_rows:
        key = (comparison_key(row["millennialTerm"]), tuple(sorted(row["variables"])))
        if key in row_by_key:
            ambiguous_millennial_terms.append(
                {
                    "semanticKey": row["semanticKey"],
                    "millennialTerm": row["millennialTerm"],
                    "rows": [row_by_key[key]["id"], row["id"]],
                }
            )
        row_by_key[key] = row

        expected_semantic_key = semantic_key(row["millennialTerm"], row["variables"])
        if row["semanticKey"] != expected_semantic_key:
            validator_failures.append({"code": "semantic_key_mismatch", "rowId": row["id"], "expected": expected_semantic_key})

        source_placeholders = extract_placeholders(row["millennialTerm"])
        target_placeholders = extract_placeholders(row["boomerTerm"])
        if source_placeholders != row["variables"] or target_placeholders != row["variables"]:
            placeholder_mismatches.append(
                {
                    "rowId": row["id"],
                    "sourcePlaceholders": source_placeholders,
                    "targetPlaceholders": target_placeholders,
                    "rowVariables": row["variables"],
                }
            )

        expected_operation = "NO_OP" if row["millennialTerm"] == row["boomerTerm"] else "REPLACE"
        if row["operation"] != expected_operation:
            invalid_operations.append({"rowId": row["id"], "actual": row["operation"], "expected": expected_operation})

        if not row["categories"]:
            unclassified_rows.append(row["id"])
        for category in row["categories"]:
            if category not in REQUIRED_BUCKETS:
                unclassified_rows.append(row["id"])

        if row["mechanicsInvariant"] != CANON_MECHANICS_INVARIANT:
            mechanics_invariant_failures.append(row["id"])

        if row["sourceOccurrenceCount"] != len(row["sourceIds"]):
            validator_failures.append(
                {
                    "code": "source_occurrence_count_mismatch",
                    "rowId": row["id"],
                    "actual": row["sourceOccurrenceCount"],
                    "expected": len(row["sourceIds"]),
                }
            )

        for source_id in row["sourceIds"]:
            source_id_counter[source_id] += 1

    duplicate_source_ids = sorted([source_id for source_id, count in source_id_counter.items() if count > 1])
    missing_source_ids = sorted(
        source_id for source_id in (str(entry["id"]).strip() for entry in inventory_rows) if source_id_counter[source_id] == 0
    )
    covered_source_id_count = sum(1 for source_id, count in source_id_counter.items() if count == 1)

    for key, group in authoritative_groups.items():
        if len(group["boomerTargets"]) > 1:
            conflicting_boomer_targets.append(
                {
                    "millennialTerm": group["millennialTerm"],
                    "boomerTargets": sorted(group["boomerTargets"]),
                    "sourceIds": sorted(group["sourceIds"], key=lambda source_id: int(source_id.split("_")[1])),
                }
            )

        row = row_by_key.get(key)
        if row is None:
            continue
        expected_target = sorted(group["boomerTargets"])[0]
        if row["boomerTerm"] != expected_target:
            conflicting_boomer_targets.append(
                {
                    "millennialTerm": row["millennialTerm"],
                    "expectedBoomerTarget": expected_target,
                    "actualBoomerTarget": row["boomerTerm"],
                    "rowId": row["id"],
                }
            )

    required_category_counts = Counter()
    for row in root_rows:
        for category in set(row["categories"]):
            required_category_counts[category] += 1
    uncovered_required_categories = [category for category in REQUIRED_BUCKETS if required_category_counts.get(category, 0) == 0]

    for term, expected_target in INTRO4_EXPECTED.items():
        key = (comparison_key(term), tuple(extract_placeholders(term)))
        row = row_by_key.get(key)
        if row is None or row["boomerTerm"] != normalize_display(expected_target):
            intro4_mismatches.append(
                {
                    "millennialTerm": term,
                    "expectedBoomerTerm": normalize_display(expected_target),
                    "actualBoomerTerm": row["boomerTerm"] if row else None,
                }
            )
        if row and row["boomerTerm"] == normalize_display(INTRO4_STALE[term]):
            stale_intro4_targets_remaining.append({"millennialTerm": term, "staleBoomerTerm": row["boomerTerm"], "rowId": row["id"]})

    pair_seen: Counter[tuple[str, str]] = Counter()
    canonical_by_source = {comparison_key(row["millennialTerm"]): row for row in root_rows}
    legacy_rows_unreconciled: list[str] = []
    legacy_reconciliation_counts: Counter[str] = Counter()
    for legacy_row in legacy_rows:
        source_term = legacy_row["millennialTerm"]
        boomer_term = legacy_row["boomerTerm"]
        pair = (comparison_key(source_term), comparison_key(boomer_term))
        pair_seen[pair] += 1
        canonical_row = canonical_by_source.get(comparison_key(source_term))
        if pair_seen[pair] > 1:
            outcome = "COLLAPSED_DUPLICATE"
        elif source_term in INTRO4_EXPECTED and boomer_term == normalize_display(INTRO4_STALE[source_term]):
            outcome = "REJECTED_STALE"
        elif canonical_row is None:
            outcome = "REJECTED_INCORRECT_SOURCE"
        elif comparison_key(canonical_row["boomerTerm"]) == comparison_key(boomer_term):
            outcome = "REUSED"
        elif source_term in INTRO4_EXPECTED:
            outcome = "REJECTED_CANON_CONFLICT"
        else:
            outcome = "SUPERSEDED_BY_STEP_4_2"
        legacy_reconciliation_counts[outcome] += 1
        if outcome not in {
            "REUSED",
            "SUPERSEDED_BY_STEP_4_2",
            "COLLAPSED_DUPLICATE",
            "REJECTED_STALE",
            "REJECTED_INCORRECT_SOURCE",
            "REJECTED_CANON_CONFLICT",
        }:
            legacy_rows_unreconciled.append(legacy_row["legacyMappingId"])

    forbidden_files_changed = sorted(path for path in changed_paths(root) if path not in ALLOWED_SCOPE)

    if not markdown_mirror_parity:
        validator_failures.append({"code": "markdown_mirror_parity_failed", "rootSha256": root_sha, "docsSha256": docs_sha})
    if docs_rows != root_rows:
        validator_failures.append({"code": "mirror_row_mismatch"})
    if duplicate_ids:
        validator_failures.append({"code": "duplicate_ids_present", "duplicateIds": duplicate_ids})
    if duplicate_semantic_keys:
        validator_failures.append({"code": "duplicate_semantic_keys_present", "duplicateSemanticKeys": duplicate_semantic_keys})
    if duplicate_millennial_terms:
        validator_failures.append({"code": "duplicate_millennial_terms_present", "duplicateMillennialTerms": duplicate_millennial_terms})
    if duplicate_pairs:
        validator_failures.append({"code": "duplicate_pairs_present", "duplicatePairs": duplicate_pairs})
    if ambiguous_millennial_terms:
        validator_failures.append({"code": "ambiguous_millennial_terms_present", "ambiguousMillennialTerms": ambiguous_millennial_terms})
    if conflicting_boomer_targets:
        validator_failures.append({"code": "conflicting_boomer_targets_present", "conflictingBoomerTargets": conflicting_boomer_targets})
    if placeholder_mismatches:
        validator_failures.append({"code": "placeholder_mismatches_present", "placeholderMismatches": placeholder_mismatches})
    if invalid_operations:
        validator_failures.append({"code": "invalid_operations_present", "invalidOperations": invalid_operations})
    if unclassified_rows:
        validator_failures.append({"code": "unclassified_rows_present", "unclassifiedRows": sorted(set(unclassified_rows))})
    if uncovered_required_categories:
        validator_failures.append({"code": "uncovered_required_categories", "uncoveredRequiredCategories": uncovered_required_categories})
    if intro4_mismatches:
        validator_failures.append({"code": "intro4_mismatches_present", "intro4Mismatches": intro4_mismatches})
    if stale_intro4_targets_remaining:
        validator_failures.append({"code": "stale_intro4_targets_remaining", "staleIntro4TargetsRemaining": stale_intro4_targets_remaining})
    if legacy_rows_unreconciled:
        validator_failures.append({"code": "legacy_rows_unreconciled", "legacyRowsUnreconciled": legacy_rows_unreconciled})
    if forbidden_files_changed:
        validator_failures.append({"code": "forbidden_files_changed", "forbiddenFilesChanged": forbidden_files_changed})
    if covered_source_id_count != 164 or missing_source_ids or duplicate_source_ids:
        validator_failures.append(
            {
                "code": "source_id_coverage_failed",
                "coveredSourceIdCount": covered_source_id_count,
                "missingSourceIds": missing_source_ids,
                "duplicateSourceIds": duplicate_source_ids,
            }
        )
    if raw_inventory_row_count != 164:
        validator_failures.append({"code": "raw_inventory_row_count_unexpected", "actual": raw_inventory_row_count})
    if canonical_millennial_term_count != 142:
        validator_failures.append({"code": "canonical_millennial_term_count_unexpected", "actual": canonical_millennial_term_count})
    if aggregated_duplicate_occurrence_count != 22:
        validator_failures.append({"code": "aggregated_duplicate_occurrence_count_unexpected", "actual": aggregated_duplicate_occurrence_count})
    if mapping_row_count != canonical_millennial_term_count:
        validator_failures.append({"code": "mapping_row_count_mismatch", "mappingRowCount": mapping_row_count, "canonicalMillennialTermCount": canonical_millennial_term_count})

    result = {
        "smokeVersion": SMOKE_VERSION,
        "rawInventoryRowCount": raw_inventory_row_count,
        "canonicalMillennialTermCount": canonical_millennial_term_count,
        "aggregatedDuplicateOccurrenceCount": aggregated_duplicate_occurrence_count,
        "mappingRowCount": mapping_row_count,
        "coveredSourceIdCount": covered_source_id_count,
        "missingSourceIds": missing_source_ids,
        "duplicateSourceIds": duplicate_source_ids,
        "duplicateIds": duplicate_ids,
        "duplicateSemanticKeys": duplicate_semantic_keys,
        "duplicateMillennialTerms": duplicate_millennial_terms,
        "duplicatePairs": duplicate_pairs,
        "ambiguousMillennialTerms": ambiguous_millennial_terms,
        "conflictingBoomerTargets": conflicting_boomer_targets,
        "placeholderMismatches": placeholder_mismatches,
        "invalidOperations": invalid_operations,
        "unclassifiedRows": sorted(set(unclassified_rows)),
        "uncoveredRequiredCategories": uncovered_required_categories,
        "intro4Mismatches": intro4_mismatches,
        "staleIntro4TargetsRemaining": stale_intro4_targets_remaining,
        "legacyRowsTotal": len(legacy_rows),
        "legacyRowsReconciled": len(legacy_rows) - len(legacy_rows_unreconciled),
        "legacyRowsUnreconciled": legacy_rows_unreconciled,
        "legacyStoredNormalizedUniqueSourceTexts": LEGACY_STORED_NORMALIZED_UNIQUE_SOURCE_TEXTS,
        "legacyMetricAlgorithmDocumented": False,
        "legacyMetricReproducible": False,
        "legacyMetricUsedForAcceptance": False,
        "markdownMirrorParity": markdown_mirror_parity,
        "mechanicsInvariantFailures": mechanics_invariant_failures,
        "forbiddenFilesChanged": forbidden_files_changed,
        "validatorFailures": validator_failures,
        "requiredCategoryCounts": {category: required_category_counts.get(category, 0) for category in REQUIRED_BUCKETS},
        "legacyReconciliationCounts": {
            "REUSED": legacy_reconciliation_counts.get("REUSED", 0),
            "SUPERSEDED_BY_STEP_4_2": legacy_reconciliation_counts.get("SUPERSEDED_BY_STEP_4_2", 0),
            "COLLAPSED_DUPLICATE": legacy_reconciliation_counts.get("COLLAPSED_DUPLICATE", 0),
            "REJECTED_STALE": legacy_reconciliation_counts.get("REJECTED_STALE", 0),
            "REJECTED_INCORRECT_SOURCE": legacy_reconciliation_counts.get("REJECTED_INCORRECT_SOURCE", 0),
            "REJECTED_CANON_CONFLICT": legacy_reconciliation_counts.get("REJECTED_CANON_CONFLICT", 0),
        },
        "rootSha256": root_sha,
        "docsSha256": docs_sha,
    }
    result["ok"] = (
        raw_inventory_row_count == 164
        and canonical_millennial_term_count == 142
        and aggregated_duplicate_occurrence_count == 22
        and mapping_row_count == canonical_millennial_term_count
        and covered_source_id_count == 164
        and not missing_source_ids
        and not duplicate_source_ids
        and not duplicate_ids
        and not duplicate_semantic_keys
        and not duplicate_millennial_terms
        and not duplicate_pairs
        and not ambiguous_millennial_terms
        and not conflicting_boomer_targets
        and not placeholder_mismatches
        and not invalid_operations
        and not result["unclassifiedRows"]
        and not uncovered_required_categories
        and not intro4_mismatches
        and not stale_intro4_targets_remaining
        and len(legacy_rows) == 93
        and len(legacy_rows_unreconciled) == 0
        and markdown_mirror_parity
        and not mechanics_invariant_failures
        and not forbidden_files_changed
        and not validator_failures
    )
    return result


def main(argv: list[str]) -> int:
    root = Path(argv[1]) if len(argv) > 1 else Path.cwd()
    result = validate(root)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
