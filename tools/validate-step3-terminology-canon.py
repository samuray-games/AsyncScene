#!/usr/bin/env python3
"""Validate Step 3 terminology inventory/canonical governance artifacts."""
from __future__ import annotations

import csv
import sys
from collections import Counter, defaultdict
from pathlib import Path

REQUIRED_INVENTORY_COLUMNS = [
    "TERM_ID", "category", "currentText", "screenOrFeature", "sourceFile",
    "sourceKeyOrFunction", "triggerCondition", "notes",
]
REQUIRED_CANON_COLUMNS = [
    "conceptId", "category", "canonicalTerm", "forbiddenSynonyms",
    "sourceTermIds", "screens", "notes",
]
BUILD_MARKER = "STEP3_TERMINOLOGY_CANON_V1"


def read_csv(path: Path) -> tuple[list[str], list[dict[str, str]]]:
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        return list(reader.fieldnames or []), list(reader)


def split_pipe(value: str) -> list[str]:
    return [part.strip() for part in str(value or "").split("|") if part.strip()]


def validate(inventory_path: Path, canon_path: Path) -> dict:
    failures: list[dict | str] = []
    inv_header, inventory_rows = read_csv(inventory_path)
    canon_header, canon_rows = read_csv(canon_path)

    for col in REQUIRED_INVENTORY_COLUMNS:
        if col not in inv_header:
            failures.append({"code": "inventory_missing_required_column", "column": col})
    for col in REQUIRED_CANON_COLUMNS:
        if col not in canon_header:
            failures.append({"code": "canon_missing_required_column", "column": col})

    inventory_ids = {str(row.get("TERM_ID", "")).strip() for row in inventory_rows if str(row.get("TERM_ID", "")).strip()}
    concept_counts: Counter[str] = Counter()
    synonym_to_canon: dict[str, str] = {}
    source_to_concepts: defaultdict[str, list[str]] = defaultdict(list)
    duplicate_concepts: list[str] = []
    empty_canon: list[str] = []
    missing_sources: list[dict[str, str]] = []
    synonym_conflicts: list[dict[str, str]] = []
    multi_canon_concepts: list[dict[str, list[str]]] = []

    concept_to_canons: defaultdict[str, set[str]] = defaultdict(set)
    for row_num, row in enumerate(canon_rows, start=2):
        concept_id = str(row.get("conceptId", "")).strip()
        canonical = str(row.get("canonicalTerm", "")).strip()
        concept_counts[concept_id] += 1
        if not concept_id:
            failures.append({"code": "empty_conceptId", "row": row_num})
            continue
        if not canonical:
            empty_canon.append(concept_id)
            failures.append({"code": "empty_canonicalTerm", "conceptId": concept_id, "row": row_num})
        concept_to_canons[concept_id].add(canonical)
        synonyms = split_pipe(row.get("forbiddenSynonyms", ""))
        if not synonyms:
            failures.append({"code": "empty_forbiddenSynonyms", "conceptId": concept_id, "row": row_num})
        for synonym in synonyms:
            if synonym == canonical:
                failures.append({"code": "forbidden_synonym_equals_canonical", "conceptId": concept_id, "synonym": synonym})
            previous = synonym_to_canon.get(synonym.casefold())
            if previous and previous != canonical:
                conflict = {"synonym": synonym, "previousCanonicalTerm": previous, "canonicalTerm": canonical, "conceptId": concept_id}
                synonym_conflicts.append(conflict)
                failures.append({"code": "forbidden_synonym_maps_to_multiple_canon_terms", **conflict})
            synonym_to_canon[synonym.casefold()] = canonical
        source_ids = split_pipe(row.get("sourceTermIds", ""))
        if len(source_ids) < 2:
            failures.append({"code": "duplicate_group_requires_multiple_sourceTermIds", "conceptId": concept_id, "count": len(source_ids)})
        for term_id in source_ids:
            source_to_concepts[term_id].append(concept_id)
            if term_id not in inventory_ids:
                missing = {"conceptId": concept_id, "termId": term_id}
                missing_sources.append(missing)
                failures.append({"code": "source_TERM_ID_missing_from_inventory", **missing})
        if not str(row.get("screens", "")).strip():
            failures.append({"code": "empty_screens", "conceptId": concept_id})
        if BUILD_MARKER not in str(row.get("notes", "")):
            failures.append({"code": "missing_build_marker_in_notes", "conceptId": concept_id})

    for concept_id, count in concept_counts.items():
        if concept_id and count > 1:
            duplicate_concepts.append(concept_id)
            failures.append({"code": "duplicate_conceptId", "conceptId": concept_id, "count": count})
    for concept_id, canons in concept_to_canons.items():
        non_empty = sorted(c for c in canons if c)
        if len(non_empty) > 1:
            multi = {"conceptId": concept_id, "canonicalTerms": non_empty}
            multi_canon_concepts.append(multi)
            failures.append({"code": "concept_has_multiple_canonicalTerms", **multi})

    return {
        "ok": not failures,
        "failures": failures,
        "inventoryRowCount": len(inventory_rows),
        "conceptCount": len(canon_rows),
        "duplicateConceptIds": sorted(duplicate_concepts),
        "emptyCanonicalConceptIds": sorted(empty_canon),
        "missingSourceTermIds": missing_sources,
        "synonymConflictCount": len(synonym_conflicts),
        "mappedForbiddenSynonymCount": len(synonym_to_canon),
        "buildMarker": BUILD_MARKER,
    }


def main() -> int:
    inventory = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("docs/terminology/STEP3_TERMINOLOGY_INVENTORY.csv")
    canon = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("docs/terminology/STEP3_TERMINOLOGY_CANON.csv")
    result = validate(inventory, canon)
    print(result)
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
