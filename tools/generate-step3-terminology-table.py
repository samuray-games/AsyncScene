#!/usr/bin/env python3
"""Generate STEP3_TERMINOLOGY_TABLE_V1 from Step 3 inventory/canon/taxonomy artifacts."""
from __future__ import annotations

import csv
from collections import Counter, defaultdict
from pathlib import Path
import sys

BUILD_MARKER = "STEP3_TERMINOLOGY_TABLE_V1"
COLUMNS = [
    "Key",
    "ConceptId",
    "Category",
    "CanonicalTermRU",
    "ContextOrScreen",
    "TriggerCondition",
    "ForbiddenVariants",
    "SourceTermIds",
    "TaxonomyCategory",
    "StyleGuideRefs",
    "Notes",
]

STYLE_REFS = "STYLE_GUIDE_MILLENNIAL_V1:vocabulary|tone|cta|errors|validationContract"


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as fh:
        return list(csv.DictReader(fh))


def split_pipe(value: str) -> list[str]:
    return [part.strip() for part in str(value or "").split("|") if part.strip()]


def join_counts(counter: Counter[str], limit: int | None = None) -> str:
    items = sorted(counter.items(), key=lambda kv: (-kv[1], kv[0]))
    if limit is not None:
        items = items[:limit]
    return ", ".join(f"{key}({count})" for key, count in items if key)


def build_table(inventory_path: Path, canon_path: Path, taxonomy_path: Path) -> list[dict[str, str]]:
    inventory = read_csv(inventory_path)
    canon = read_csv(canon_path)
    taxonomy = read_csv(taxonomy_path)

    inventory_by_id = {row.get("TERM_ID", "").strip(): row for row in inventory if row.get("TERM_ID", "").strip()}
    taxonomy_by_concept: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in taxonomy:
        concept_id = row.get("conceptId", "").strip()
        if concept_id:
            taxonomy_by_concept[concept_id].append(row)

    rows: list[dict[str, str]] = []
    for row in canon:
        concept_id = row.get("conceptId", "").strip()
        source_ids = split_pipe(row.get("sourceTermIds", ""))
        source_rows = [inventory_by_id[term_id] for term_id in source_ids if term_id in inventory_by_id]
        taxonomy_rows = taxonomy_by_concept.get(concept_id, [])

        screen_counter = Counter()
        trigger_counter = Counter()
        file_counter = Counter()
        key_counter = Counter()
        inventory_category_counter = Counter()
        for source in source_rows:
            for screen in split_pipe(source.get("screenOrFeature", "").replace(",", "|")):
                screen_counter[screen] += 1
            trigger = source.get("triggerCondition", "").strip()
            if trigger:
                trigger_counter[trigger] += 1
            source_file = source.get("sourceFile", "").strip()
            if source_file:
                file_counter[source_file] += 1
            source_key = source.get("sourceKeyOrFunction", "").strip()
            if source_key:
                key_counter[source_key] += 1
            inv_category = source.get("category", "").strip()
            if inv_category:
                inventory_category_counter[inv_category] += 1

        taxonomy_counter = Counter(r.get("taxonomyCategory", "").strip() for r in taxonomy_rows if r.get("taxonomyCategory", "").strip())
        canon_screens = split_pipe(row.get("screens", ""))
        screens = sorted(set(canon_screens) | set(screen_counter.keys()))
        context_parts = [f"screens={ '|'.join(screens) }" if screens else "screens=UNKNOWN"]
        if file_counter:
            context_parts.append(f"topSourceFiles={join_counts(file_counter, 5)}")
        if key_counter:
            context_parts.append(f"topSourceKeys={join_counts(key_counter, 5)}")

        trigger_parts = []
        if trigger_counter:
            trigger_parts.append(f"inventoryTriggers={join_counts(trigger_counter)}")
        else:
            trigger_parts.append("inventoryTriggers=UNKNOWN")
        if taxonomy_rows:
            trigger_parts.append(f"taxonomyInstances={len(taxonomy_rows)}")
        trigger_parts.append("governanceUse=apply canonical term whenever this concept appears in matching UI contexts")

        notes = [
            BUILD_MARKER,
            f"sourceTermCount={len(source_ids)}",
            f"taxonomyInstanceCount={len(taxonomy_rows)}",
        ]
        if inventory_category_counter:
            notes.append(f"inventoryCategories={join_counts(inventory_category_counter)}")
        canon_notes = row.get("notes", "").strip()
        if canon_notes:
            notes.append(f"canonNotes={canon_notes}")

        rows.append({
            "Key": concept_id,
            "ConceptId": concept_id,
            "Category": row.get("category", "").strip(),
            "CanonicalTermRU": row.get("canonicalTerm", "").strip(),
            "ContextOrScreen": "; ".join(context_parts),
            "TriggerCondition": "; ".join(trigger_parts),
            "ForbiddenVariants": row.get("forbiddenSynonyms", "").strip(),
            "SourceTermIds": "|".join(source_ids),
            "TaxonomyCategory": "|".join(sorted(taxonomy_counter.keys())),
            "StyleGuideRefs": STYLE_REFS,
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
    inventory = root / "docs/terminology/STEP3_TERMINOLOGY_INVENTORY.csv"
    canon = root / "docs/terminology/STEP3_TERMINOLOGY_CANON.csv"
    taxonomy = root / "docs/terminology/STEP3_UI_TAXONOMY_V1.csv"
    rows = build_table(inventory, canon, taxonomy)
    destinations = [
        root / "docs/terminology/STEP3_TERMINOLOGY_TABLE_V1.csv",
        root / "AsyncScene/Web/terminology/STEP3_TERMINOLOGY_TABLE_V1.csv",
    ]
    for destination in destinations:
        write_csv(destination, rows)
    print(f"Generated {len(rows)} {BUILD_MARKER} rows into {len(destinations)} files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
