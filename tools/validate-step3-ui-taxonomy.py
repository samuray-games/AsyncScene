#!/usr/bin/env python3
"""Validate the Step 3 strict UI taxonomy artifact."""
from __future__ import annotations

import csv
import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

BUILD_MARKER = "STEP3_UI_TAXONOMY_V1"
REQUIRED_COLUMNS = ["termId", "conceptId", "currentText", "originalCategory", "taxonomyCategory", "sourceFile", "screenOrFeature", "notes"]
ALLOWED_CATEGORIES = {"Button", "BlockTitle", "Status", "Hint", "Error", "ResourceName", "ActionName", "ReasonName", "CooldownLabel"}
FORBIDDEN_OVERLAPS = {
    frozenset(("Button", "Status")),
    frozenset(("Error", "Hint")),
    frozenset(("Status", "BlockTitle")),
}


def split_allowed_categories(notes: str) -> bool:
    lower = (notes or "").lower()
    return "taxonomy-multicategory-allowed" in lower and "reason=" in lower


def validate(path: Path) -> dict:
    result = {
        "ok": False,
        "buildMarker": BUILD_MARKER,
        "path": str(path),
        "rowCount": 0,
        "failures": [],
        "duplicateTermIds": [],
        "invalidCategories": [],
        "emptyTaxonomyCategoryRows": [],
        "forbiddenOverlapViolations": [],
        "conceptCategoryDrift": [],
        "currentTextCategoryDrift": [],
    }
    if not path.exists():
        result["failures"].append({"code": "taxonomy_file_missing", "path": str(path)})
        return result
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        header = reader.fieldnames or []
        for column in REQUIRED_COLUMNS:
            if column not in header:
                result["failures"].append({"code": "missing_required_column", "column": column})
        rows = list(reader)
    result["rowCount"] = len(rows)
    term_counts = Counter((row.get("termId") or "").strip() for row in rows)
    result["duplicateTermIds"] = sorted(term_id for term_id, count in term_counts.items() if term_id and count > 1)
    for term_id in result["duplicateTermIds"]:
        result["failures"].append({"code": "duplicate_termId", "termId": term_id})
    concept_categories: dict[str, set[str]] = defaultdict(set)
    concept_notes: dict[str, list[str]] = defaultdict(list)
    text_categories: dict[str, set[str]] = defaultdict(set)
    for index, row in enumerate(rows, start=2):
        term_id = (row.get("termId") or "").strip()
        taxonomy = (row.get("taxonomyCategory") or "").strip()
        concept = (row.get("conceptId") or "").strip()
        current_text = (row.get("currentText") or "").strip()
        notes = row.get("notes") or ""
        if not term_id:
            result["failures"].append({"code": "empty_termId", "rowNum": index})
        if not concept:
            result["failures"].append({"code": "empty_conceptId", "rowNum": index, "termId": term_id})
        if not taxonomy:
            result["emptyTaxonomyCategoryRows"].append({"rowNum": index, "termId": term_id})
            result["failures"].append({"code": "empty_taxonomyCategory", "rowNum": index, "termId": term_id})
        elif taxonomy not in ALLOWED_CATEGORIES:
            item = {"rowNum": index, "termId": term_id, "taxonomyCategory": taxonomy}
            result["invalidCategories"].append(item)
            result["failures"].append({"code": "invalid_taxonomyCategory", **item})
        if "|" in taxonomy or "," in taxonomy:
            result["failures"].append({"code": "multiple_taxonomy_categories_in_row", "rowNum": index, "termId": term_id, "taxonomyCategory": taxonomy})
        if BUILD_MARKER not in notes:
            result["failures"].append({"code": "missing_build_marker_in_notes", "rowNum": index, "termId": term_id})
        if concept and taxonomy:
            concept_categories[concept].add(taxonomy)
            concept_notes[concept].append(notes)
        if current_text and taxonomy:
            text_categories[current_text].add(taxonomy)
    for concept, categories in sorted(concept_categories.items()):
        if len(categories) > 1 and not any(split_allowed_categories(note) for note in concept_notes[concept]):
            item = {"conceptId": concept, "taxonomyCategories": sorted(categories)}
            result["conceptCategoryDrift"].append(item)
            result["failures"].append({"code": "concept_mapped_to_multiple_taxonomy_categories", **item})
        for pair in FORBIDDEN_OVERLAPS:
            if pair.issubset(categories):
                item = {"scope": "concept", "conceptId": concept, "taxonomyCategories": sorted(pair)}
                result["forbiddenOverlapViolations"].append(item)
                result["failures"].append({"code": "forbidden_category_overlap", **item})
    for current_text, categories in sorted(text_categories.items()):
        if len(categories) > 1:
            result["currentTextCategoryDrift"].append({"currentText": current_text, "taxonomyCategories": sorted(categories)})
        for pair in FORBIDDEN_OVERLAPS:
            if pair.issubset(categories):
                item = {"scope": "currentText", "currentText": current_text, "taxonomyCategories": sorted(pair)}
                result["forbiddenOverlapViolations"].append(item)
                result["failures"].append({"code": "forbidden_category_overlap", **item})
    result["ok"] = len(result["failures"]) == 0
    return result


def main() -> int:
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("docs/terminology/STEP3_UI_TAXONOMY_V1.csv")
    result = validate(path)
    print(json.dumps(result, ensure_ascii=False, sort_keys=True))
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
