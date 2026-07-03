#!/usr/bin/env python3
"""Generate the canonical Step 4.3 boomer terminology mapping artifact."""
from __future__ import annotations

import hashlib
import json
import re
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
BUILD_MARKER = "UI_PROFILE_BOOMER_STEP_4_3_MILLENNIAL_TO_BOOMER_MAPPING"
INTRO4_OVERRIDE_AUTHORITY = "task_intro4_override_2026_07_03"
ALLOWED_LEXICON_AUTHORITY = "docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md"
CANON_MECHANICS_INVARIANT = "No mechanic, state, persistence, economy, routing, resolver, NPC, or runtime behavior changes."
REQUIRED_BUCKETS = ["buttons", "statuses", "errors", "hints", "economy", "battles", "DM"]
LEGACY_STORED_NORMALIZED_UNIQUE_SOURCE_TEXTS = 122

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
        if len(parts) != 3:
            raise ValueError(f"Malformed allowed lexicon row: {line}")
        rows[parts[0]] = {"currentText": parts[1], "boomerText": parts[2]}
    return rows


def parse_historical_mapping(path: Path) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if not re.match(r"^\| MAP_\d{4} \|", line):
            continue
        parts = [part.strip() for part in line.strip()[2:-2].split(" | ")]
        if len(parts) != 6:
            raise ValueError(f"Malformed historical mapping row: {line}")
        rows.append(
            {
                "legacyMappingId": parts[0],
                "millennialTerm": parts[1],
                "boomerTerm": parts[2],
                "legacyType": parts[3],
                "semanticInvariant": parts[4],
                "mechanicsInvariant": parts[5],
            }
        )
    return rows


def bucket_for_category(raw_category: str) -> str | None:
    return RAW_TO_BUCKET.get(raw_category.strip())


def semantic_key(term: str, variables: list[str]) -> str:
    seed = f"{comparison_key(term)}||{','.join(variables)}"
    return "SEM_" + hashlib.sha1(seed.encode("utf-8")).hexdigest()[:12]


def first_source_id_sort_key(source_ids: set[str]) -> int:
    return min(int(source_id.split("_")[1]) for source_id in source_ids)


def authoritative_boomer_target(source_text: str, default_target: str) -> tuple[str, str]:
    normalized_source = normalize_display(source_text)
    if normalized_source in INTRO4_EXPECTED:
        return INTRO4_EXPECTED[normalized_source], INTRO4_OVERRIDE_AUTHORITY
    return default_target, ALLOWED_LEXICON_AUTHORITY


def meaning_for_group(source_occurrence_count: int, source_surfaces: set[str]) -> str:
    if source_occurrence_count == 1:
        return "Single canonical millennial term occurrence."
    return f"Canonical aggregation of {source_occurrence_count} repeated source occurrences across {len(source_surfaces)} surfaces."


def aggregate_inventory(
    inventory_rows: list[dict[str, object]],
    allowed_by_id: dict[str, dict[str, str]],
) -> tuple[list[dict[str, object]], dict[str, object], list[dict[str, object]]]:
    groups: dict[tuple[str, tuple[str, ...]], dict[str, object]] = {}
    conflicting_targets: list[dict[str, object]] = []
    intro4_verification: list[dict[str, object]] = []

    for entry in inventory_rows:
        source_id = str(entry.get("id", "")).strip()
        source_text = normalize_display(str(entry.get("currentText", "")).strip())
        raw_category = str(entry.get("category", "")).strip()
        bucket = bucket_for_category(raw_category)
        source_surface = str(entry.get("surface", "")).strip()
        source_key = str(entry.get("key", "")).strip()
        variables = extract_placeholders(source_text)

        if not source_id:
            raise ValueError("Inventory row missing id")
        if source_id not in allowed_by_id:
            raise ValueError(f"Allowed lexicon missing {source_id}")
        allowed_row = allowed_by_id[source_id]
        if normalize_display(allowed_row["currentText"]) != source_text:
            raise ValueError(f"Inventory/allowed currentText mismatch for {source_id}")

        boomer_text, authority = authoritative_boomer_target(source_text, normalize_display(allowed_row["boomerText"]))
        boomer_text = normalize_display(boomer_text)
        key = (comparison_key(source_text), tuple(variables))

        if key not in groups:
            groups[key] = {
                "millennialTerm": source_text,
                "sourceIds": set(),
                "sourceSurfaces": set(),
                "categories": set(),
                "rawCategories": set(),
                "boomerTargets": set(),
                "boomerAuthorities": set(),
                "placeholderSet": tuple(variables),
            }
        group = groups[key]
        group["sourceIds"].add(source_id)
        group["sourceSurfaces"].add(f"{source_surface}:{source_key}")
        if bucket:
            group["categories"].add(bucket)
        group["rawCategories"].add(raw_category)
        group["boomerTargets"].add(boomer_text)
        group["boomerAuthorities"].add(authority)

    canonical_rows: list[dict[str, object]] = []
    sorted_groups = sorted(groups.values(), key=lambda group: first_source_id_sort_key(group["sourceIds"]))
    for index, group in enumerate(sorted_groups, start=1):
        millennial_term = group["millennialTerm"]
        variables = list(group["placeholderSet"])
        boomer_targets = sorted(group["boomerTargets"])
        if len(boomer_targets) > 1:
            conflicting_targets.append(
                {
                    "millennialTerm": millennial_term,
                    "variables": variables,
                    "boomerTargets": boomer_targets,
                    "sourceIds": sorted(group["sourceIds"], key=lambda source_id: int(source_id.split("_")[1])),
                }
            )
        boomer_term = boomer_targets[0]
        source_ids = sorted(group["sourceIds"], key=lambda source_id: int(source_id.split("_")[1]))
        source_surfaces = sorted(group["sourceSurfaces"])
        categories = sorted(group["categories"])
        row = {
            "id": f"MAP_{index:04d}",
            "semanticKey": semantic_key(millennial_term, variables),
            "millennialTerm": millennial_term,
            "boomerTerm": boomer_term,
            "operation": "NO_OP" if millennial_term == boomer_term else "REPLACE",
            "meaning": meaning_for_group(len(source_ids), set(source_surfaces)),
            "categories": categories,
            "variables": variables,
            "sourceIds": source_ids,
            "sourceSurfaces": source_surfaces,
            "sourceOccurrenceCount": len(source_ids),
            "boomerAuthority": "; ".join(sorted(group["boomerAuthorities"])),
            "mechanicsInvariant": CANON_MECHANICS_INVARIANT,
        }
        canonical_rows.append(row)

    intro4_by_term = {row["millennialTerm"]: row for row in canonical_rows if row["millennialTerm"] in INTRO4_EXPECTED}
    for term, expected_target in INTRO4_EXPECTED.items():
        row = intro4_by_term.get(term)
        intro4_verification.append(
            {
                "millennialTerm": term,
                "expectedBoomerTerm": expected_target,
                "actualBoomerTerm": row["boomerTerm"] if row else None,
                "ok": bool(row and row["boomerTerm"] == expected_target),
            }
        )

    category_counts = Counter()
    for row in canonical_rows:
        for category in row["categories"]:
            category_counts[category] += 1

    metadata = {
        "rawInventoryRowCount": len(inventory_rows),
        "canonicalMillennialTermCount": len(canonical_rows),
        "aggregatedDuplicateOccurrenceCount": len(inventory_rows) - len(canonical_rows),
        "mappingRowCount": len(canonical_rows),
        "coveredSourceIdCount": sum(row["sourceOccurrenceCount"] for row in canonical_rows),
        "requiredCategoryCounts": {category: category_counts.get(category, 0) for category in REQUIRED_BUCKETS},
        "conflictingBoomerTargets": conflicting_targets,
        "intro4Verification": intro4_verification,
    }
    return canonical_rows, metadata, conflicting_targets


def reconcile_legacy_rows(
    legacy_rows: list[dict[str, str]],
    canonical_rows: list[dict[str, object]],
) -> tuple[list[dict[str, str]], dict[str, int], list[str]]:
    canonical_by_source: dict[str, dict[str, object]] = {
        comparison_key(row["millennialTerm"]): row for row in canonical_rows
    }
    pair_seen: Counter[tuple[str, str]] = Counter()
    reconciliation_rows: list[dict[str, str]] = []
    counts: Counter[str] = Counter()
    unreconciled: list[str] = []

    for legacy_row in legacy_rows:
        source_term = normalize_display(legacy_row["millennialTerm"])
        boomer_term = normalize_display(legacy_row["boomerTerm"])
        pair = (comparison_key(source_term), comparison_key(boomer_term))
        pair_seen[pair] += 1
        canonical_row = canonical_by_source.get(comparison_key(source_term))

        if pair_seen[pair] > 1:
            outcome = "COLLAPSED_DUPLICATE"
            canonical_id = canonical_row["id"] if canonical_row else ""
        elif source_term in INTRO4_EXPECTED and boomer_term == normalize_display(INTRO4_STALE[source_term]):
            outcome = "REJECTED_STALE"
            canonical_id = canonical_row["id"] if canonical_row else ""
        elif canonical_row is None:
            outcome = "REJECTED_INCORRECT_SOURCE"
            canonical_id = ""
        elif comparison_key(boomer_term) == comparison_key(canonical_row["boomerTerm"]):
            outcome = "REUSED"
            canonical_id = canonical_row["id"]
        elif source_term in INTRO4_EXPECTED:
            outcome = "REJECTED_CANON_CONFLICT"
            canonical_id = canonical_row["id"]
        else:
            outcome = "SUPERSEDED_BY_STEP_4_2"
            canonical_id = canonical_row["id"]

        counts[outcome] += 1
        reconciliation_rows.append(
            {
                "legacyMappingId": legacy_row["legacyMappingId"],
                "millennialTerm": source_term,
                "legacyBoomerTerm": boomer_term,
                "reconciliation": outcome,
                "canonicalMappingId": canonical_id,
            }
        )

    for row in reconciliation_rows:
        if not row["reconciliation"]:
            unreconciled.append(row["legacyMappingId"])
    return reconciliation_rows, dict(sorted(counts.items())), unreconciled


def build_document(
    canonical_rows: list[dict[str, object]],
    metadata: dict[str, object],
    legacy_rows: list[dict[str, str]],
    legacy_counts: dict[str, int],
) -> str:
    lines: list[str] = []
    lines.append(f"# {BUILD_MARKER}")
    lines.append("")
    lines.append("## Scope")
    lines.append("")
    lines.append("- Source rows come from the accepted Step 4.2 exact inventory bundle.")
    lines.append("- Canonical identity uses NFC text, trimmed text, collapsed whitespace, casefolded comparison form, and the exact placeholder set.")
    lines.append("- Repeated source occurrences are aggregated into one canonical millennial term row.")
    lines.append("- The four Intro4 terms use the current task-authoritative Boomer override instead of stale pre-Step-4.2 Boomer wording.")
    lines.append("- Runtime copy replacement is not part of this step.")
    lines.append("")
    lines.append("## Contract")
    lines.append("")
    lines.append(f"- smokeVersion: {SMOKE_VERSION}")
    lines.append(f"- buildMarker: {BUILD_MARKER}")
    lines.append(f"- rawInventoryRowCount: {metadata['rawInventoryRowCount']}")
    lines.append(f"- canonicalMillennialTermCount: {metadata['canonicalMillennialTermCount']}")
    lines.append(f"- aggregatedDuplicateOccurrenceCount: {metadata['aggregatedDuplicateOccurrenceCount']}")
    lines.append(f"- mappingRowCount: {metadata['mappingRowCount']}")
    lines.append(f"- coveredSourceIdCount: {metadata['coveredSourceIdCount']}")
    lines.append(f"- legacyStoredNormalizedUniqueSourceTexts: {LEGACY_STORED_NORMALIZED_UNIQUE_SOURCE_TEXTS}")
    lines.append(f"- legacyMetricAlgorithmDocumented: false")
    lines.append(f"- legacyMetricReproducible: false")
    lines.append(f"- legacyMetricUsedForAcceptance: false")
    lines.append("")
    lines.append("## Required category coverage")
    lines.append("")
    for category in REQUIRED_BUCKETS:
        lines.append(f"- {category}: {metadata['requiredCategoryCounts'][category]}")
    lines.append("")
    lines.append("## Intro4 authoritative overrides")
    lines.append("")
    lines.append("| millennialTerm | boomerTerm | authority |")
    lines.append("| --- | --- | --- |")
    for term, target in INTRO4_EXPECTED.items():
        lines.append(f"| {term} | {target} | {INTRO4_OVERRIDE_AUTHORITY} |")
    lines.append("")
    lines.append("## Legacy reconciliation summary")
    lines.append("")
    lines.append(f"- legacyRowsTotal: {len(legacy_rows)}")
    lines.append(f"- legacyRowsReconciled: {len(legacy_rows)}")
    for outcome in [
        "REUSED",
        "SUPERSEDED_BY_STEP_4_2",
        "COLLAPSED_DUPLICATE",
        "REJECTED_STALE",
        "REJECTED_INCORRECT_SOURCE",
        "REJECTED_CANON_CONFLICT",
    ]:
        lines.append(f"- {outcome}: {legacy_counts.get(outcome, 0)}")
    lines.append("")
    lines.append("## Legacy reconciliation table")
    lines.append("")
    lines.append("| legacyMappingId | millennialTerm | legacyBoomerTerm | reconciliation | canonicalMappingId |")
    lines.append("| --- | --- | --- | --- | --- |")
    for row in legacy_rows:
        lines.append(
            f"| {row['legacyMappingId']} | {row['millennialTerm']} | {row['legacyBoomerTerm']} | "
            f"{row['reconciliation']} | {row['canonicalMappingId']} |"
        )
    lines.append("")
    lines.append("## Exact canonical mapping table")
    lines.append("")
    lines.append("| id | semanticKey | millennialTerm | boomerTerm | operation | meaning | categories | variables | sourceIds | sourceSurfaces | sourceOccurrenceCount | boomerAuthority | mechanicsInvariant |")
    lines.append("| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |")
    for row in canonical_rows:
        categories = ", ".join(row["categories"])
        variables = ", ".join(row["variables"])
        source_ids = ", ".join(row["sourceIds"])
        source_surfaces = "; ".join(row["sourceSurfaces"])
        lines.append(
            f"| {row['id']} | {row['semanticKey']} | {row['millennialTerm']} | {row['boomerTerm']} | "
            f"{row['operation']} | {row['meaning']} | {categories} | {variables} | {source_ids} | "
            f"{source_surfaces} | {row['sourceOccurrenceCount']} | {row['boomerAuthority']} | {row['mechanicsInvariant']} |"
        )
    lines.append("")
    lines.append("## Deferred work")
    lines.append("")
    lines.append("- Runtime replacement is deferred.")
    lines.append("- Runtime validation is not part of this step.")
    lines.append("- Gameplay, state, persistence, economy, handlers, routing, resolvers, and NPC behavior are unchanged.")
    return "\n".join(lines) + "\n"


def write_outputs(root: Path, document: str) -> None:
    for output in [root / ROOT_DOC, root / DOCS_DOC]:
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(document, encoding="utf-8")


def main(argv: list[str]) -> int:
    root = Path(argv[1]) if len(argv) > 1 else Path.cwd()
    inventory_rows = parse_inventory(root / INVENTORY_JSON)
    allowed_by_id = parse_allowed_lexicon(root / ALLOWED_LEXICON)
    legacy_mapping_rows = parse_historical_mapping(root / HISTORICAL_MAPPING)

    canonical_rows, metadata, conflicting_targets = aggregate_inventory(inventory_rows, allowed_by_id)
    legacy_reconciliation_rows, legacy_counts, legacy_unreconciled = reconcile_legacy_rows(legacy_mapping_rows, canonical_rows)
    if conflicting_targets:
        raise ValueError(f"Conflicting boomer targets detected: {conflicting_targets}")
    if legacy_unreconciled:
        raise ValueError(f"Legacy unreconciled rows detected: {legacy_unreconciled}")

    document = build_document(canonical_rows, metadata, legacy_reconciliation_rows, legacy_counts)
    write_outputs(root, document)
    print(
        json.dumps(
            {
                "ok": True,
                "smokeVersion": SMOKE_VERSION,
                "rawInventoryRowCount": metadata["rawInventoryRowCount"],
                "canonicalMillennialTermCount": metadata["canonicalMillennialTermCount"],
                "aggregatedDuplicateOccurrenceCount": metadata["aggregatedDuplicateOccurrenceCount"],
                "mappingRowCount": metadata["mappingRowCount"],
                "coveredSourceIdCount": metadata["coveredSourceIdCount"],
                "legacyRowsTotal": len(legacy_mapping_rows),
                "legacyRowsReconciled": len(legacy_reconciliation_rows),
                "outputFiles": [ROOT_DOC, DOCS_DOC],
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
