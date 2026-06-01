#!/usr/bin/env python3
"""Generate the Step 3 strict UI taxonomy artifact from inventory/canon artifacts."""
from __future__ import annotations

import csv
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BUILD_MARKER = "STEP3_UI_TAXONOMY_V1"
INVENTORY = ROOT / "docs/terminology/STEP3_TERMINOLOGY_INVENTORY.csv"
CANON = ROOT / "docs/terminology/STEP3_TERMINOLOGY_CANON.csv"
OUTS = [
    ROOT / "docs/terminology/STEP3_UI_TAXONOMY_V1.csv",
    ROOT / "AsyncScene/Web/terminology/STEP3_UI_TAXONOMY_V1.csv",
]
FIELDS = ["termId", "conceptId", "currentText", "originalCategory", "taxonomyCategory", "sourceFile", "screenOrFeature", "notes"]

# Strict UI taxonomy categories required by Step 3 [4]. Broader inventory categories
# collapse into these values while retaining originalCategory for provenance.
INVENTORY_TO_TAXONOMY = {
    "Button": "Button",
    "BlockTitle": "BlockTitle",
    "Status": "Status",
    "Hint": "Hint",
    "Error": "Error",
    "ResourceName": "ResourceName",
    "EconomyReason": "ReasonName",
    "Cooldown": "CooldownLabel",
    "Toast": "Status",
    "ResultCard": "Status",
    "EmptyState": "Status",
    "ChatLine": "Status",
    "DMLine": "Status",
    "SystemLine": "Status",
    "Other": "Status",
}
CANON_TO_TAXONOMY = {
    **INVENTORY_TO_TAXONOMY,
    # Canon Button concepts are action names (escape, ignore, report, train, battle),
    # not necessarily concrete clickable controls.
    "Button": "ActionName",
}
FORBIDDEN_TEXT_RESOLUTION_PRIORITY = {
    "Button": 0,
    "BlockTitle": 0,
    "Error": 0,
    "Hint": 1,
    "Status": 2,
}
FORBIDDEN_OVERLAPS = {
    frozenset(("Button", "Status")),
    frozenset(("Error", "Hint")),
    frozenset(("Status", "BlockTitle")),
}

# Step 3 [4] requires one category per visible text unless the taxonomy
# artifact documents why the same surface text is truly multiple concepts.
# These are source-artifact taxonomy cleanups only; no gameplay strings change.
CURRENT_TEXT_CATEGORY_RESOLUTIONS = {
    "$1там, где {PLACE}": ("Status", "single_surface_text_is_runtime_status_template"),
    "Лимит уважения на сегодня исчерпан.": ("Status", "single_surface_text_is_user_visible_limit_status"),
    "Принял. Сейчас разберёмся.": ("Status", "single_surface_text_is_user_visible_pending_status"),
    "Сейчас не получилось. Попробуй позже.": ("Status", "single_surface_text_is_user_visible_retry_status"),
    "вброс": ("ReasonName", "single_surface_text_is_economy_reason_name"),
    "обучаю": ("Status", "single_surface_text_is_style_lexeme_not_resource_name"),
    "ошибка": ("Error", "single_surface_text_is_error_lexeme"),
    "ты должен": ("Status", "single_surface_text_is_style_lexeme_not_resource_name"),
    "урок": ("Status", "single_surface_text_is_style_lexeme_not_resource_name"),
}
CURRENT_TEXT_CATEGORY_ALLOWLIST = {
    "Уйти за 1💰": "same_surface_text_is_both_escape_action_label_and_currency_cost_evidence",
}

CONCEPT_PRIORITY = {
    "Error": 0,
    "Button": 1,
    "EconomyReason": 2,
    "Cooldown": 3,
    "Status": 4,
    "ResourceName": 5,
}


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def build_canon_index(rows: list[dict[str, str]]) -> dict[str, list[dict[str, str]]]:
    by_term: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in rows:
        for term_id in str(row.get("sourceTermIds", "")).split("|"):
            term_id = term_id.strip()
            if term_id:
                by_term[term_id].append(row)
    return by_term


def choose_concept(candidates: list[dict[str, str]], original_category: str) -> dict[str, str] | None:
    if not candidates:
        return None
    exact = [row for row in candidates if row.get("category", "") == original_category]
    pool = exact or candidates
    return sorted(pool, key=lambda row: (CONCEPT_PRIORITY.get(row.get("category", ""), 99), row.get("conceptId", "")))[0]


def main() -> int:
    inventory_rows = read_csv(INVENTORY)
    canon_rows = read_csv(CANON)
    canon_by_term = build_canon_index(canon_rows)
    output_rows: list[dict[str, str]] = []
    for row in inventory_rows:
        term_id = row.get("TERM_ID", "").strip()
        original_category = row.get("category", "").strip()
        concept = choose_concept(canon_by_term.get(term_id, []), original_category)
        if concept:
            concept_id = concept.get("conceptId", "").strip()
            taxonomy_category = CANON_TO_TAXONOMY.get(concept.get("category", "").strip(), "Status")
            concept_note = f"canonConcept={concept_id}; canonCategory={concept.get('category', '').strip()}"
        else:
            concept_id = f"TERM_{term_id}"
            taxonomy_category = INVENTORY_TO_TAXONOMY.get(original_category, "Status")
            concept_note = "canonConcept=unmapped_inventory_term"
        source_note = row.get("notes", "").strip()
        notes = "; ".join(part for part in [source_note, concept_note, BUILD_MARKER] if part)
        output_rows.append({
            "termId": term_id,
            "conceptId": concept_id,
            "currentText": row.get("currentText", ""),
            "originalCategory": original_category,
            "taxonomyCategory": taxonomy_category,
            "sourceFile": row.get("sourceFile", ""),
            "screenOrFeature": row.get("screenOrFeature", ""),
            "notes": notes,
        })
    category_counts_by_text: dict[str, Counter[str]] = defaultdict(Counter)
    for row in output_rows:
        current_text = row["currentText"].strip()
        if current_text:
            category_counts_by_text[current_text][row["taxonomyCategory"]] += 1
    forced_text_categories: dict[str, str] = {}
    for current_text, counts in category_counts_by_text.items():
        categories = set(counts)
        if any(pair.issubset(categories) for pair in FORBIDDEN_OVERLAPS):
            forced_text_categories[current_text] = sorted(
                categories,
                key=lambda category: (-counts[category], FORBIDDEN_TEXT_RESOLUTION_PRIORITY.get(category, 99), category),
            )[0]
    for row in output_rows:
        current_text = row["currentText"].strip()
        forced_category = forced_text_categories.get(current_text)
        if forced_category and row["taxonomyCategory"] != forced_category:
            row["notes"] = f"{row['notes']}; taxonomyTextDriftResolvedFrom={row['taxonomyCategory']}; taxonomyTextDriftReason=forbidden_overlap_prevention"
            row["taxonomyCategory"] = forced_category
        resolved = CURRENT_TEXT_CATEGORY_RESOLUTIONS.get(current_text)
        if resolved:
            resolved_category, resolved_reason = resolved
            if row["taxonomyCategory"] != resolved_category:
                row["notes"] = f"{row['notes']}; taxonomyCurrentTextDriftResolvedFrom={row['taxonomyCategory']}; taxonomyCurrentTextDriftReason={resolved_reason}"
                row["taxonomyCategory"] = resolved_category
        allow_reason = CURRENT_TEXT_CATEGORY_ALLOWLIST.get(current_text)
        if allow_reason:
            row["notes"] = f"{row['notes']}; taxonomy-current-text-drift-allowed; reason={allow_reason}"

    for out in OUTS:
        out.parent.mkdir(parents=True, exist_ok=True)
        with out.open("w", newline="", encoding="utf-8") as handle:
            writer = csv.DictWriter(handle, fieldnames=FIELDS, lineterminator="\n")
            writer.writeheader()
            writer.writerows(output_rows)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
