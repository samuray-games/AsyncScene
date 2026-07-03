#!/usr/bin/env python3
"""Generate the Step 4.3 boomer terminology mapping artifact."""
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
HISTORICAL_MAPPING = "docs/UI_PROFILE_BOOMER_LEXICAL_MAPPING.md"
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
        row_id, current_text, boomer_text = parts
        rows[row_id] = {
            "currentText": current_text,
            "boomerText": boomer_text,
        }
    return rows


def parse_historical_mapping(path: Path) -> dict[tuple[str, str], str]:
    rows: dict[tuple[str, str], str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        if not re.match(r"^\| MAP_\d{4} \|", line):
            continue
        parts = [part.strip() for part in line.strip()[2:-2].split(" | ")]
        if len(parts) != 6:
            raise ValueError(f"Malformed historical mapping row: {line}")
        _, source_text, target_text, *_rest = parts
        key = (normalize_text(source_text), normalize_text(target_text))
        rows[key] = target_text
    return rows


def build_rows(root: Path) -> tuple[list[dict[str, str]], dict[str, object]]:
    inventory_rows = parse_inventory(root / INVENTORY_JSON)
    allowed_by_id = parse_allowed_lexicon(root / ALLOWED_LEXICON)
    historical_pairs = parse_historical_mapping(root / HISTORICAL_MAPPING)

    mapping_rows: list[dict[str, str]] = []
    profile_counts: Counter[str] = Counter()
    duplicate_target_groups: defaultdict[str, list[str]] = defaultdict(list)
    source_to_targets: defaultdict[str, set[str]] = defaultdict(set)
    lexical_alignment_count = 0

    for index, entry in enumerate(inventory_rows, start=1):
        source_id = str(entry.get("id", "")).strip()
        source_text = str(entry.get("currentText", "")).strip()
        source_profile = str(entry.get("profile", "")).strip()
        category = str(entry.get("category", "")).strip()
        surface = str(entry.get("surface", "")).strip()
        key = str(entry.get("key", "")).strip()
        literal_source_variables = extract_variables(source_text)

        if not source_id:
            raise ValueError(f"Inventory row {index} has no id")
        if source_id not in allowed_by_id:
            raise ValueError(f"Allowed lexicon is missing source id {source_id}")

        allowed = allowed_by_id[source_id]
        if allowed["currentText"] != source_text:
            raise ValueError(
                f"Source text mismatch for {source_id}: inventory={source_text!r} allowed={allowed['currentText']!r}"
            )

        boomer_text = allowed["boomerText"]
        literal_target_variables = extract_variables(boomer_text)
        if literal_source_variables != literal_target_variables:
            raise ValueError(f"Boomer placeholder mismatch for {source_id}")

        mapping_mode = "identity" if source_text == boomer_text else "changed"
        mapping_rows.append(
            {
                "mappingId": f"MAP_{index:04d}",
                "sourceInventoryId": source_id,
                "sourceProfile": source_profile,
                "category": category,
                "surface": surface,
                "key": key,
                "sourceText": source_text,
                "boomerText": boomer_text,
                "mappingMode": mapping_mode,
                "variables": f"[{','.join(literal_source_variables)}]" if literal_source_variables else "[]",
            }
        )
        profile_counts[source_profile] += 1
        duplicate_target_groups[normalize_text(boomer_text)].append(source_id)
        source_to_targets[normalize_text(source_text)].add(normalize_text(boomer_text))
        if (normalize_text(source_text), normalize_text(boomer_text)) in historical_pairs:
            lexical_alignment_count += 1

    extra_allowed_ids = sorted(set(allowed_by_id) - {row["sourceInventoryId"] for row in mapping_rows})
    if extra_allowed_ids:
        raise ValueError(f"Allowed lexicon contains unexpected ids not present in inventory: {extra_allowed_ids[:10]}")

    source_unique_text_count = len({normalize_text(row["sourceText"]) for row in mapping_rows})
    semantic_ambiguities = {
        source_text: sorted(targets)
        for source_text, targets in source_to_targets.items()
        if len(targets) > 1
    }
    if semantic_ambiguities:
        raise ValueError(f"Semantic ambiguities detected: {semantic_ambiguities}")

    metadata = {
        "sourceInventoryEntryCount": len(mapping_rows),
        "sourceUniqueTextCount": source_unique_text_count,
        "mappingCount": len(mapping_rows),
        "changedMappingCount": sum(1 for row in mapping_rows if row["mappingMode"] == "changed"),
        "identityMappingCount": sum(1 for row in mapping_rows if row["mappingMode"] == "identity"),
        "coveragePercent": 100 if mapping_rows else 0,
        "duplicateMappingsCount": 0,
        "placeholderMismatchCount": 0,
        "semanticAmbiguityCount": 0,
        "conflictingBoomerTargetCount": 0,
        "lexicalMappingAlignmentCount": lexical_alignment_count,
        "historicalMappingCoverageCount": len(historical_pairs),
        "runtimeCopyChanged": "false",
        "mappingApplied": "false",
        "profileCounts": dict(sorted(profile_counts.items())),
    }
    return mapping_rows, metadata


def build_document(rows: list[dict[str, str]], metadata: dict[str, object]) -> str:
    lines: list[str] = []
    lines.append(f"# {BUILD_MARKER}")
    lines.append("")
    lines.append("## Scope")
    lines.append("")
    lines.append("- Source rows come from the accepted Step 4.2 exact inventory bundle.")
    lines.append("- Boomer targets come from the current accepted boomer allowed lexicon.")
    lines.append("- Historical boomer mapping rows are reconciliation inputs only; they do not override the accepted boomer target.")
    lines.append("- Every authoritative source row has exactly one resolved boomer equivalent.")
    lines.append("- Runtime copy replacement is not part of this step.")
    lines.append("")
    lines.append("## Contract")
    lines.append("")
    lines.append(f"- buildMarker: {BUILD_MARKER}")
    lines.append(f"- sourceInventoryEntryCount: {metadata['sourceInventoryEntryCount']}")
    lines.append(f"- sourceUniqueTextCount: {metadata['sourceUniqueTextCount']}")
    lines.append(f"- mappingCount: {metadata['mappingCount']}")
    lines.append(f"- changedMappingCount: {metadata['changedMappingCount']}")
    lines.append(f"- identityMappingCount: {metadata['identityMappingCount']}")
    lines.append(f"- coveragePercent: {metadata['coveragePercent']}")
    lines.append(f"- duplicateMappingsCount: {metadata['duplicateMappingsCount']}")
    lines.append(f"- semanticAmbiguityCount: {metadata['semanticAmbiguityCount']}")
    lines.append(f"- conflictingBoomerTargetCount: {metadata['conflictingBoomerTargetCount']}")
    lines.append(f"- placeholderMismatchCount: {metadata['placeholderMismatchCount']}")
    lines.append(f"- lexicalMappingAlignmentCount: {metadata['lexicalMappingAlignmentCount']}")
    lines.append(f"- historicalMappingCoverageCount: {metadata['historicalMappingCoverageCount']}")
    lines.append(f"- runtimeCopyChanged: {metadata['runtimeCopyChanged']}")
    lines.append(f"- mappingApplied: {metadata['mappingApplied']}")
    lines.append("")
    lines.append("## Source profile counts")
    lines.append("")
    for profile, count in metadata["profileCounts"].items():
        lines.append(f"- {profile}: {count}")
    lines.append("")
    lines.append("## Exact mapping table")
    lines.append("")
    lines.append("| mappingId | sourceInventoryId | sourceProfile | category | surface | key | sourceText | boomerText | mappingMode | variables |")
    lines.append("| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |")
    for row in rows:
        lines.append(
            f"| {row['mappingId']} | {row['sourceInventoryId']} | {row['sourceProfile']} | {row['category']} | "
            f"{row['surface']} | {row['key']} | {row['sourceText']} | {row['boomerText']} | {row['mappingMode']} | {row['variables']} |"
        )
    lines.append("")
    lines.append("## Validation contract")
    lines.append("")
    lines.append("Static validation must fail on:")
    lines.append("")
    lines.append("- missing mappings")
    lines.append("- duplicate mapping ids")
    lines.append("- duplicate source inventory ids")
    lines.append("- placeholder mismatch")
    lines.append("- semantic ambiguity for the same normalized source text")
    lines.append("- conflicting boomer targets for the same normalized source text")
    lines.append("- root/docs mirror mismatch")
    lines.append("- drift from the accepted boomer allowed lexicon")
    lines.append("")
    lines.append("## Deferred work")
    lines.append("")
    lines.append("- Runtime replacement is deferred.")
    lines.append("- Runtime validation is not part of this step.")
    lines.append("- Gameplay, state, persistence, economy, handlers, routing, resolvers, and NPC behavior are unchanged.")
    return "\n".join(lines) + "\n"


def write_outputs(root: Path, document: str) -> None:
    outputs = [root / ROOT_DOC, root / DOCS_DOC]
    for output in outputs:
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(document, encoding="utf-8")


def main(argv: list[str]) -> int:
    root = Path(argv[1]) if len(argv) > 1 else Path.cwd()
    rows, metadata = build_rows(root)
    document = build_document(rows, metadata)
    write_outputs(root, document)
    print(
        json.dumps(
            {
                "ok": True,
                "buildMarker": BUILD_MARKER,
                "mappingCount": metadata["mappingCount"],
                "changedMappingCount": metadata["changedMappingCount"],
                "identityMappingCount": metadata["identityMappingCount"],
                "outputFiles": [ROOT_DOC, DOCS_DOC],
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
