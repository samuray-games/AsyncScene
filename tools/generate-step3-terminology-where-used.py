#!/usr/bin/env python3
from __future__ import annotations

import csv
from collections import defaultdict
from pathlib import Path
import sys

BUILD_MARKER = "STEP3_TERMINOLOGY_WHERE_USED_V1"
COLUMNS = [
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


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as fh:
        return list(csv.DictReader(fh))


def split_pipe(value: str) -> list[str]:
    return [part.strip() for part in str(value or "").split("|") if part.strip()]


def component_from_file(source_file: str) -> str:
    path = source_file.strip()
    if not path:
        return "unknown"
    parts = path.split("/")
    if "/ui/" in path:
        return "ui"
    if "/data/" in path:
        return "data"
    if path.endswith("state.js"):
        return "state"
    if path.endswith("events.js"):
        return "events"
    if path.endswith("economy.js"):
        return "economy"
    if path.endswith("battle.js") or path.endswith("battle-engine.js"):
        return "battle"
    if path.endswith("conflict-old.js"):
        return "legacy-conflict"
    if len(parts) >= 3:
        return parts[-2] if parts[-2] not in {"Web", "docs"} else "root"
    return "root"


def build_where_used(root: Path) -> list[dict[str, str]]:
    inventory = read_csv(root / "docs/terminology/STEP3_TERMINOLOGY_INVENTORY.csv")
    canon = read_csv(root / "docs/terminology/STEP3_TERMINOLOGY_CANON.csv")
    table = read_csv(root / "docs/terminology/STEP3_TERMINOLOGY_TABLE_V1.csv")
    taxonomy = read_csv(root / "docs/terminology/STEP3_UI_TAXONOMY_V1.csv")

    inventory_by_id = {row.get("TERM_ID", "").strip(): row for row in inventory if row.get("TERM_ID", "").strip()}
    table_by_concept = {row.get("ConceptId", "").strip(): row for row in table if row.get("ConceptId", "").strip()}
    taxonomy_by_term = {row.get("termId", "").strip(): row for row in taxonomy if row.get("termId", "").strip()}

    rows: list[dict[str, str]] = []
    used_keys: set[str] = set()
    for concept in canon:
        concept_id = concept.get("conceptId", "").strip()
        canonical = concept.get("canonicalTerm", "").strip()
        forbidden = split_pipe(concept.get("forbiddenSynonyms", ""))
        source_ids = [term_id for term_id in split_pipe(concept.get("sourceTermIds", "")) if term_id in inventory_by_id]
        source_texts = {term_id: inventory_by_id[term_id].get("currentText", "") for term_id in source_ids}
        mapped_forbidden: dict[str, list[str]] = defaultdict(list)
        for synonym in forbidden:
            for term_id, text in source_texts.items():
                if synonym and synonym in text:
                    mapped_forbidden[synonym].append(term_id)
        historical = [synonym for synonym in forbidden if synonym not in mapped_forbidden]
        first_term_id = source_ids[0] if source_ids else ""
        table_row = table_by_concept.get(concept_id, {})
        for term_id in source_ids:
            source = inventory_by_id[term_id]
            taxonomy_row = taxonomy_by_term.get(term_id, {})
            current_text = source.get("currentText", "").strip()
            source_file = source.get("sourceFile", "").strip()
            key_base = f"{concept_id}__{term_id}"
            key = key_base
            n = 2
            while key in used_keys:
                key = f"{key_base}__{n}"
                n += 1
            used_keys.add(key)
            text_forbidden = [synonym for synonym in forbidden if synonym and synonym in current_text]
            notes = [
                BUILD_MARKER,
                "replacement_map_only_no_ui_change",
                f"inventoryCategory={source.get('category', '').strip() or 'UNKNOWN'}",
                f"taxonomyCategory={taxonomy_row.get('taxonomyCategory', '').strip() or table_row.get('TaxonomyCategory', '').strip() or 'UNKNOWN'}",
            ]
            source_notes = source.get("notes", "").strip()
            if source_notes:
                notes.append(f"inventoryNotes={source_notes}")
            if text_forbidden:
                notes.append("forbiddenSynonymMapped=" + "|".join(text_forbidden))
            if term_id == first_term_id and historical:
                notes.append("forbiddenSynonymNotCurrentlyPresent=" + "|".join(historical))
            rows.append({
                "Key": key,
                "ConceptId": concept_id,
                "CanonicalTermRU": canonical,
                "CurrentTextOrVariant": current_text,
                "SourceTermId": term_id,
                "SourceFile": source_file,
                "SourceKeyOrFunction": source.get("sourceKeyOrFunction", "").strip() or "UNKNOWN",
                "ComponentOrModule": component_from_file(source_file),
                "ContextOrScreen": source.get("screenOrFeature", "").strip() or table_row.get("ContextOrScreen", "").strip() or "UNKNOWN",
                "TriggerCondition": source.get("triggerCondition", "").strip() or table_row.get("TriggerCondition", "").strip() or "UNKNOWN",
                "ReplacementTarget": canonical,
                "Notes": "; ".join(notes),
            })
    return rows


def write_csv(path: Path, rows: list[dict[str, str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as fh:
        writer = csv.DictWriter(fh, fieldnames=COLUMNS)
        writer.writeheader()
        writer.writerows(rows)


def main(argv: list[str]) -> int:
    root = Path(argv[1]) if len(argv) > 1 else Path.cwd()
    rows = build_where_used(root)
    destinations = [
        root / "docs/terminology/STEP3_TERMINOLOGY_WHERE_USED_V1.csv",
        root / "AsyncScene/Web/terminology/STEP3_TERMINOLOGY_WHERE_USED_V1.csv",
    ]
    for destination in destinations:
        write_csv(destination, rows)
    print(f"Generated {len(rows)} {BUILD_MARKER} rows into {len(destinations)} files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
