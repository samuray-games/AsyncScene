#!/usr/bin/env python3
from __future__ import annotations

import csv
from collections import Counter, defaultdict
from pathlib import Path
import sys

BUILD_MARKER = "STEP3_TERMINOLOGY_WHERE_USED_V1"
REQUIRED_COLUMNS = [
    "Key",
    "ConceptId",
    "CanonicalTermRU",
    "CurrentTextOrVariant",
    "SourceTermId",
    "SourceFile",
    "SourceKeyOrFunction",
    "ComponentOrModule",
    "ContextOrScreen",
    "TriggerCondition",
    "ReplacementTarget",
    "Notes",
]


def read_csv(path: Path) -> tuple[list[str], list[dict[str, str]]]:
    with path.open(newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        return list(reader.fieldnames or []), list(reader)


def split_pipe(value: str) -> list[str]:
    return [part.strip() for part in str(value or "").split("|") if part.strip()]


def validate(root: Path, where_used_path: Path | None = None) -> dict[str, object]:
    where_used_path = where_used_path or root / "docs/terminology/STEP3_TERMINOLOGY_WHERE_USED_V1.csv"
    header, rows = read_csv(where_used_path)
    _, inventory = read_csv(root / "docs/terminology/STEP3_TERMINOLOGY_INVENTORY.csv")
    _, table = read_csv(root / "docs/terminology/STEP3_TERMINOLOGY_TABLE_V1.csv")
    _, taxonomy = read_csv(root / "docs/terminology/STEP3_UI_TAXONOMY_V1.csv")

    failures: list[str] = []
    details: list[str] = []
    def fail(code: str, detail: str = "") -> None:
        failures.append(code)
        if detail:
            details.append(f"{code}: {detail}")

    for column in REQUIRED_COLUMNS:
        if column not in header:
            fail("missing_required_column", column)

    inventory_ids = {row.get("TERM_ID", "").strip() for row in inventory if row.get("TERM_ID", "").strip()}
    table_concepts = {row.get("ConceptId", "").strip(): row for row in table if row.get("ConceptId", "").strip()}
    concept_rows: dict[str, list[dict[str, str]]] = defaultdict(list)
    duplicate_counter: Counter[tuple[str, str]] = Counter()
    source_ids_seen: set[str] = set()

    for index, row in enumerate(rows, start=2):
        concept_id = row.get("ConceptId", "").strip()
        source_term_id = row.get("SourceTermId", "").strip()
        replacement = row.get("ReplacementTarget", "").strip()
        if concept_id:
            concept_rows[concept_id].append(row)
        if source_term_id:
            source_ids_seen.add(source_term_id)
        if source_term_id not in inventory_ids:
            fail("source_term_id_missing_from_inventory", f"row {index} {source_term_id}")
        if not row.get("SourceFile", "").strip():
            fail("empty_source_file", f"row {index}")
        if not replacement:
            fail("empty_replacement_target", f"row {index}")
        duplicate_counter[(source_term_id, replacement)] += 1

    duplicate_pairs = [pair for pair, count in duplicate_counter.items() if count > 1]
    for source_term_id, replacement in duplicate_pairs:
        fail("duplicate_source_term_id_replacement_target", f"{source_term_id}+{replacement}")

    for concept_id, table_row in table_concepts.items():
        if not concept_rows.get(concept_id):
            fail("table_concept_missing_where_used_rows", concept_id)
        for term_id in split_pipe(table_row.get("SourceTermIds", "")):
            if term_id in inventory_ids and term_id not in source_ids_seen:
                fail("mapped_inventory_source_term_missing_where_used_row", f"{concept_id}:{term_id}")
        notes_blob = "\n".join(row.get("Notes", "") for row in concept_rows.get(concept_id, []))
        text_blob = "\n".join(row.get("CurrentTextOrVariant", "") for row in concept_rows.get(concept_id, []))
        for synonym in split_pipe(table_row.get("ForbiddenVariants", "")):
            documented = f"forbiddenSynonymNotCurrentlyPresent=" in notes_blob and synonym in notes_blob
            mapped = synonym in text_blob or f"forbiddenSynonymMapped=" in notes_blob and synonym in notes_blob
            if not (mapped or documented):
                fail("forbidden_synonym_unmapped_and_undocumented", f"{concept_id}:{synonym}")

    runtime_concepts = {
        row.get("conceptId", "").strip()
        for row in taxonomy
        if row.get("conceptId", "").strip() and not row.get("conceptId", "").strip().startswith("TERM_")
    }
    for concept_id in runtime_concepts:
        if concept_id in table_concepts and not concept_rows.get(concept_id):
            fail("runtime_facing_concept_missing_where_used_rows", concept_id)

    return {
        "ok": not failures,
        "buildMarker": BUILD_MARKER,
        "rowCount": len(rows),
        "conceptCount": len(concept_rows),
        "inventorySourceTermReferenceCount": len(source_ids_seen),
        "failures": failures,
        "details": details[:50],
    }


def main(argv: list[str]) -> int:
    root = Path(argv[1]) if len(argv) > 1 else Path.cwd()
    result = validate(root)
    print(result)
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
