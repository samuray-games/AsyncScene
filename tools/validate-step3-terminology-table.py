#!/usr/bin/env python3
"""Validate STEP3_TERMINOLOGY_TABLE_V1 against canon and taxonomy."""
from __future__ import annotations

import csv
import json
from collections import Counter
from pathlib import Path
import sys

BUILD_MARKER = "STEP3_TERMINOLOGY_TABLE_V1"
REQUIRED_COLUMNS = ["Key", "Category", "CanonicalTermRU", "ContextOrScreen", "TriggerCondition", "ForbiddenVariants", "Notes"]
RECOMMENDED_COLUMNS = ["ConceptId", "SourceTermIds", "TaxonomyCategory", "StyleGuideRefs"]


def read_csv(path: Path) -> tuple[list[str], list[dict[str, str]]]:
    with path.open(newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        return list(reader.fieldnames or []), list(reader)


def split_pipe(value: str) -> list[str]:
    return [part.strip() for part in str(value or "").split("|") if part.strip()]


def validate(table_path: Path, canon_path: Path, taxonomy_path: Path | None = None) -> dict:
    table_header, table_rows = read_csv(table_path)
    canon_header, canon_rows = read_csv(canon_path)
    taxonomy_concepts: set[str] = set()
    if taxonomy_path and taxonomy_path.exists():
        _, taxonomy_rows = read_csv(taxonomy_path)
        taxonomy_concepts = {row.get("conceptId", "").strip() for row in taxonomy_rows if row.get("conceptId", "").strip()}

    failures: list[dict | str] = []
    for column in REQUIRED_COLUMNS:
        if column not in table_header:
            failures.append({"code": "missing_required_column", "column": column})
    for column in RECOMMENDED_COLUMNS:
        if column not in table_header:
            failures.append({"code": "missing_recommended_column", "column": column})

    required_canon_columns = ["conceptId", "category", "canonicalTerm", "forbiddenSynonyms", "sourceTermIds"]
    for column in required_canon_columns:
        if column not in canon_header:
            failures.append({"code": "canon_missing_required_column", "column": column})

    canon_by_id = {row.get("conceptId", "").strip(): row for row in canon_rows if row.get("conceptId", "").strip()}
    canon_ids = set(canon_by_id)
    counts = Counter(row.get("ConceptId", row.get("Key", "")).strip() for row in table_rows)

    duplicate_concepts = sorted([concept_id for concept_id, count in counts.items() if concept_id and count > 1])
    for concept_id in duplicate_concepts:
        failures.append({"code": "duplicate_concept", "conceptId": concept_id, "count": counts[concept_id]})

    table_ids = {concept_id for concept_id in counts if concept_id}
    missing_concepts = sorted(canon_ids - table_ids)
    extra_concepts = sorted(table_ids - canon_ids)
    for concept_id in missing_concepts:
        failures.append({"code": "canon_concept_missing_from_table", "conceptId": concept_id})
    for concept_id in extra_concepts:
        failures.append({"code": "table_references_missing_canon_concept", "conceptId": concept_id})

    forbidden_synonym_count = 0
    for idx, row in enumerate(table_rows, start=2):
        concept_id = row.get("ConceptId", row.get("Key", "")).strip()
        key = row.get("Key", "").strip()
        for column in REQUIRED_COLUMNS:
            if column in table_header and not row.get(column, "").strip():
                failures.append({"code": f"empty_{column}", "row": idx, "conceptId": concept_id or key})
        if not concept_id:
            failures.append({"code": "empty_ConceptId", "row": idx, "key": key})
            continue
        canon = canon_by_id.get(concept_id)
        if not canon:
            continue
        if row.get("CanonicalTermRU", "").strip() != canon.get("canonicalTerm", "").strip():
            failures.append({"code": "canonical_term_mismatch", "conceptId": concept_id})
        if row.get("Category", "").strip() != canon.get("category", "").strip():
            failures.append({"code": "category_mismatch", "conceptId": concept_id})
        canon_forbidden = split_pipe(canon.get("forbiddenSynonyms", ""))
        table_forbidden = split_pipe(row.get("ForbiddenVariants", ""))
        forbidden_synonym_count += len(table_forbidden)
        missing_synonyms = sorted(set(canon_forbidden) - set(table_forbidden))
        if missing_synonyms:
            failures.append({"code": "missing_forbidden_synonyms", "conceptId": concept_id, "synonyms": missing_synonyms})
        if any(s == canon.get("canonicalTerm", "").strip() for s in table_forbidden):
            failures.append({"code": "forbidden_synonym_equals_canonical", "conceptId": concept_id})
        if row.get("SourceTermIds", "").strip() != canon.get("sourceTermIds", "").strip():
            failures.append({"code": "source_term_ids_mismatch", "conceptId": concept_id})
        if BUILD_MARKER not in row.get("Notes", ""):
            failures.append({"code": "missing_build_marker_in_notes", "conceptId": concept_id})
        if taxonomy_concepts and concept_id not in taxonomy_concepts:
            failures.append({"code": "concept_missing_from_taxonomy", "conceptId": concept_id})

    return {
        "ok": not failures,
        "buildMarker": BUILD_MARKER,
        "tableRowCount": len(table_rows),
        "canonConceptCount": len(canon_ids),
        "duplicateConcepts": duplicate_concepts,
        "missingConcepts": missing_concepts,
        "extraConcepts": extra_concepts,
        "forbiddenSynonymCount": forbidden_synonym_count,
        "failures": failures,
    }


def main(argv: list[str]) -> int:
    if len(argv) < 3:
        print("usage: validate-step3-terminology-table.py TABLE.csv CANON.csv [TAXONOMY.csv]", file=sys.stderr)
        return 2
    table_path = Path(argv[1])
    canon_path = Path(argv[2])
    taxonomy_path = Path(argv[3]) if len(argv) > 3 else None
    result = validate(table_path, canon_path, taxonomy_path)
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
