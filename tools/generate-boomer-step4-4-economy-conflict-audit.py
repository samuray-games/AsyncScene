#!/usr/bin/env python3
"""Generate the Step 4.4A boomer economy/conflict terminology audit."""
from __future__ import annotations

import json
import re
import unicodedata
from dataclasses import dataclass
from pathlib import Path
import sys

ROOT_DOC = "UI_PROFILE_BOOMER_STEP_4_4_ECONOMY_CONFLICT_TERMINOLOGY_AUDIT.md"
DOCS_DOC = "docs/UI_PROFILE_BOOMER_STEP_4_4_ECONOMY_CONFLICT_TERMINOLOGY_AUDIT.md"
ALLOWED_LEXICON = "docs/UI_PROFILE_BOOMER_ALLOWED_LEXICON.md"
TABOO_LIST = "docs/UI_PROFILE_BOOMER_TABOO_LIST.md"
STEP43_MAPPING = "docs/UI_PROFILE_BOOMER_STEP_4_3_MILLENNIAL_TO_BOOMER_MAPPING.md"
NEW_FEATURE_COVERAGE = "docs/UI_PROFILE_BOOMER_NEW_FEATURE_COVERAGE.md"
RUNTIME_GAPS = "docs/UI_PROFILE_BOOMER_RUNTIME_GAPS.md"
RUNTIME_GAP_TARGETS = "docs/UI_PROFILE_BOOMER_RUNTIME_GAP_TARGETS.md"
RUNTIME_GAP_COPY_DECISIONS = "docs/UI_PROFILE_BOOMER_RUNTIME_GAP_COPY_DECISIONS.md"
BUILD_MARKER = "UI_PROFILE_BOOMER_STEP_4_4_ECONOMY_CONFLICT_TERMINOLOGY_AUDIT"
SMOKE_VERSION = "BOOMER-STEP4_4A-ECONOMY-CONFLICT-AUDIT-STATIC-v1"
STATIC_PASS = "STATIC_PASS / READY_FOR_RUNTIME_SMOKE"
STATIC_FAIL = "STATIC_FAIL / UNTRANSLATED_OR_UNMAPPED_ENTITIES_FOUND"
NON_LIVE_VERDICT = "EXCLUDED"

SOURCE_FILES = {
    "system": "AsyncScene/Web/system.js",
    "data": "AsyncScene/Web/data.js",
    "events": "AsyncScene/Web/events.js",
    "ui_events": "AsyncScene/Web/ui/ui-events.js",
    "ui_battles": "AsyncScene/Web/ui/ui-battles.js",
    "ui_dm": "AsyncScene/Web/ui/ui-dm.js",
    "state": "AsyncScene/Web/state.js",
    "conflict_core": "AsyncScene/Web/conflict/conflict-core.js",
    "conflict_economy": "AsyncScene/Web/conflict/conflict-economy.js",
    "index": "AsyncScene/Web/index.html",
}

FAIL_CLASSIFICATIONS = {
    "forbidden",
    "mapped_exact",
    "unmapped",
    "wrong_profile",
    "placeholder_mismatch",
}
PASS_CLASSIFICATIONS = {"allowed_exact"}


@dataclass(frozen=True)
class ManualSurfaceSpec:
    feature_zone: str
    source_file_key: str
    source_locator: str
    source_kind: str
    resolution_path: str
    runtime_reachability: str
    current_text: str
    source_term: str
    evidence: tuple[str, ...]
    wrong_profile: bool = False
    is_live: bool = True
    non_live_classification: str = "dev_only"
    non_live_reason: str = ""


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", unicodedata.normalize("NFC", str(value or "")).strip())


def extract_placeholders(value: str) -> list[str]:
    return sorted(set(re.findall(r"\{([^{}]+)\}", normalize_text(value))))


def markdown_escape(value: str) -> str:
    return str(value).replace("|", "\\|").replace("\n", "<br>")


def js_unescape(raw: str) -> str:
    try:
        return json.loads(f'"{raw}"')
    except json.JSONDecodeError:
        return (
            raw.replace("\\\\", "\\")
            .replace('\\"', '"')
            .replace("\\n", "\n")
            .replace("\\r", "\r")
            .replace("\\t", "\t")
        )


def find_matching_block(text: str, marker: str, open_char: str, close_char: str) -> str:
    start = text.find(marker)
    if start < 0:
        raise ValueError(f"Marker not found: {marker}")
    search_start = start + len(marker) - (1 if marker.endswith(open_char) else 0)
    open_index = text.find(open_char, search_start)
    if open_index < 0:
        raise ValueError(f"Opening {open_char!r} not found after marker {marker!r}")
    depth = 0
    in_string = False
    escaped = False
    for index in range(open_index, len(text)):
        char = text[index]
        if in_string:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == '"':
                in_string = False
            continue
        if char == '"':
            in_string = True
            continue
        if char == open_char:
            depth += 1
        elif char == close_char:
            depth -= 1
            if depth == 0:
                return text[open_index + 1 : index]
    raise ValueError(f"Unclosed block for marker {marker!r}")


def parse_js_string_object(block: str) -> dict[str, str]:
    rows: dict[str, str] = {}
    pattern = re.compile(r'^\s*([A-Za-z0-9_"\[\].]+)\s*:\s*"((?:[^"\\]|\\.)*)"', re.MULTILINE)
    for match in pattern.finditer(block):
        key = match.group(1).strip().strip('"')
        value = js_unescape(match.group(2))
        rows[key] = normalize_text(value)
    return rows


def parse_override_array_object(block: str) -> dict[str, list[str]]:
    result: dict[str, list[str]] = {}
    category_pattern = re.compile(r"^\s*([A-Za-z0-9_]+)\s*:\s*\[", re.MULTILINE)
    search_pos = 0
    while True:
        match = category_pattern.search(block, search_pos)
        if not match:
            break
        category = match.group(1)
        open_index = block.find("[", match.start())
        depth = 0
        in_string = False
        escaped = False
        end_index = -1
        for index in range(open_index, len(block)):
            char = block[index]
            if in_string:
                if escaped:
                    escaped = False
                elif char == "\\":
                    escaped = True
                elif char == '"':
                    in_string = False
                continue
            if char == '"':
                in_string = True
                continue
            if char == "[":
                depth += 1
            elif char == "]":
                depth -= 1
                if depth == 0:
                    end_index = index
                    break
        if end_index < 0:
            raise ValueError(f"Unclosed override array for {category}")
        content = block[open_index + 1 : end_index]
        rows = []
        for item in re.finditer(r'\[\s*\d+\s*,\s*"((?:[^"\\]|\\.)*)"\s*\]', content):
            rows.append(normalize_text(js_unescape(item.group(1))))
        result[category] = rows
        search_pos = end_index + 1
    return result


def parse_array_object(block: str) -> dict[str, list[str]]:
    result: dict[str, list[str]] = {}
    category_pattern = re.compile(r"^\s*([A-Za-z0-9_]+)\s*:\s*Object\.freeze\(\[", re.MULTILINE)
    search_pos = 0
    while True:
        match = category_pattern.search(block, search_pos)
        if not match:
            break
        category = match.group(1)
        open_index = block.find("[", match.start())
        depth = 0
        in_string = False
        escaped = False
        end_index = -1
        for index in range(open_index, len(block)):
            char = block[index]
            if in_string:
                if escaped:
                    escaped = False
                elif char == "\\":
                    escaped = True
                elif char == '"':
                    in_string = False
                continue
            if char == '"':
                in_string = True
                continue
            if char == "[":
                depth += 1
            elif char == "]":
                depth -= 1
                if depth == 0:
                    end_index = index
                    break
        if end_index < 0:
            raise ValueError(f"Unclosed array block for {category}")
        content = block[open_index + 1 : end_index]
        values = [
            normalize_text(js_unescape(item.group(1)))
            for item in re.finditer(r'"((?:[^"\\]|\\.)*)"', content)
        ]
        result[category] = values
        search_pos = end_index + len("])")
    return result


def parse_allowed_lexicon(path: Path) -> tuple[dict[str, str], set[str]]:
    current_to_boomer: dict[str, str] = {}
    allowed_boomer = set()
    for line in path.read_text(encoding="utf-8").splitlines():
        if not re.match(r"^\| TXT_\d{4} \|", line):
            continue
        parts = [part.strip() for part in line.strip()[2:-2].split(" | ")]
        if len(parts) != 3:
            continue
        current = normalize_text(parts[1])
        boomer = normalize_text(parts[2])
        current_to_boomer[current] = boomer
        allowed_boomer.add(boomer)
    return current_to_boomer, allowed_boomer


def parse_step43_mapping(path: Path) -> dict[str, str]:
    mapping: dict[str, str] = {}
    text = path.read_text(encoding="utf-8")
    start = text.find("## Exact canonical mapping table")
    if start < 0:
        raise ValueError("Unable to isolate Step 4.3 exact canonical mapping table")
    section = text[start:]
    for line in section.splitlines():
        if not re.match(r"^\| MAP_\d{4} \|", line):
            continue
        parts = [part.strip() for part in line.strip()[2:-2].split(" | ")]
        if len(parts) < 4:
            continue
        mapping[normalize_text(parts[2])] = normalize_text(parts[3])
    return mapping


def parse_taboo_phrases(path: Path) -> list[str]:
    phrases: list[str] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.startswith("- "):
            continue
        phrase = normalize_text(line[2:])
        if phrase:
            phrases.append(phrase)
    return phrases


def parse_runtime_gap_targets(path: Path) -> dict[str, tuple[str, str]]:
    targets: dict[str, tuple[str, str]] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        if not re.match(r"^\| BRT_\d{4} \|", line):
            continue
        parts = [part.strip() for part in line.strip()[2:-2].split(" | ")]
        if len(parts) < 2:
            continue
        target_id = parts[0]
        approved_text = normalize_text(parts[1])
        if approved_text:
            targets[approved_text] = (approved_text, f"runtime_gap_target:{target_id}")
    return targets


def parse_runtime_gap_copy_decisions(path: Path) -> tuple[dict[str, tuple[str, str]], list[str]]:
    mapping: dict[str, tuple[str, str]] = {}
    failures: list[str] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        if not re.match(r"^\| GAP_\d{4} \|", line):
            continue
        parts = [part.strip() for part in line.strip()[2:-2].split(" | ")]
        if len(parts) < 11:
            continue
        gap_id = parts[0]
        raw_text = normalize_text(parts[4])
        approved_text = normalize_text(parts[7])
        status = normalize_text(parts[10])
        if status != "APPROVED" or not raw_text or not approved_text:
            continue
        existing = mapping.get(raw_text)
        value = (approved_text, f"runtime_gap_decision:{gap_id}")
        if existing and existing[0] != approved_text:
            failures.append(
                f"Conflicting approved runtime-gap targets for raw text {raw_text!r}: {existing[0]!r} vs {approved_text!r}."
            )
            continue
        mapping[raw_text] = value
    return mapping, failures


def taboo_hit(text: str, taboo_phrases: list[str]) -> str | None:
    haystack = normalize_text(text)
    for phrase in taboo_phrases:
        pattern = rf"(?<![0-9A-Za-zА-Яа-яЁё_]){re.escape(phrase)}(?![0-9A-Za-zА-Яа-яЁё_])"
        if re.search(pattern, haystack):
            return phrase
    return None


def resolve_expected_target(
    source_term: str,
    current_text: str,
    step43_mapping: dict[str, str],
    current_to_boomer: dict[str, str],
    battle_fallback_targets: dict[str, tuple[str, str]],
    allowed_boomer: set[str],
    runtime_gap_targets: dict[str, tuple[str, str]],
    runtime_gap_copy_decisions: dict[str, tuple[str, str]],
) -> tuple[str, str]:
    normalized_source = normalize_text(source_term)
    normalized_current = normalize_text(current_text)

    if normalized_source in step43_mapping:
        return step43_mapping[normalized_source], "step4_3_mapping"
    if normalized_source in battle_fallback_targets:
        return battle_fallback_targets[normalized_source]
    if normalized_source in current_to_boomer:
        return current_to_boomer[normalized_source], "allowed_lexicon_current"
    if normalized_source in runtime_gap_copy_decisions:
        return runtime_gap_copy_decisions[normalized_source]
    if normalized_current in step43_mapping:
        return step43_mapping[normalized_current], "step4_3_mapping_current"
    if normalized_current in battle_fallback_targets:
        return battle_fallback_targets[normalized_current]
    if normalized_current in current_to_boomer:
        return current_to_boomer[normalized_current], "allowed_lexicon_current"
    if normalized_current in runtime_gap_targets:
        return runtime_gap_targets[normalized_current]
    if normalized_current in runtime_gap_copy_decisions:
        return runtime_gap_copy_decisions[normalized_current]
    if normalized_current in allowed_boomer:
        return normalized_current, "allowed_lexicon_exact"
    return "", ""


def build_data_texts(data_text: str) -> tuple[dict[str, str], dict[str, str]]:
    genz_block = find_matching_block(data_text, "genz: {", "{", "}")
    boomer_block = find_matching_block(data_text, "Data.TEXTS.boomer = Object.freeze({", "{", "}")
    genz = parse_js_string_object(genz_block)
    boomer_overrides = parse_js_string_object(boomer_block)
    boomer = dict(genz)
    boomer.update(boomer_overrides)
    return genz, boomer


def build_cap_messages(data_text: str) -> tuple[dict[str, str], dict[str, str]]:
    millennial_block = find_matching_block(data_text, "const CAP_MESSAGES_MILLENNIAL = Object.freeze({", "{", "}")
    boomer_block = find_matching_block(data_text, "const CAP_MESSAGES_BOOMER = Object.freeze({", "{", "}")
    return parse_js_string_object(millennial_block), parse_js_string_object(boomer_block)


def build_cop_templates(data_text: str) -> tuple[dict[str, list[str]], dict[str, list[str]]]:
    base_block = find_matching_block(data_text, "const COP_TEMPLATES_MILLENNIAL = Object.freeze({", "{", "}")
    override_block = find_matching_block(
        data_text,
        "const COP_TEMPLATES_BOOMER = applyCopTemplateOverrides(COP_TEMPLATES_MILLENNIAL, {",
        "{",
        "}",
    )
    return parse_array_object(base_block), parse_override_array_object(override_block)


def build_npc_event_templates(data_text: str) -> tuple[dict[str, list[str]], dict[str, list[str]]]:
    boomer_block = find_matching_block(data_text, "boomer: Object.freeze({", "{", "}")
    zoomer_block = find_matching_block(data_text, "zoomer: Object.freeze({", "{", "}")
    return parse_array_object(zoomer_block), parse_array_object(boomer_block)


def build_system_copy(system_text: str) -> dict[str, dict[str, str]]:
    start = system_text.find("const SYSTEM_COPY_RU = Object.freeze({")
    end = system_text.find("const SYSTEM_COPY_LOCALES = Object.freeze({")
    if start < 0 or end < 0 or end <= start:
        raise ValueError("Unable to isolate SYSTEM_COPY_RU section")
    section = system_text[start:end]
    result = {}
    for group in ("errors", "warnings", "notifications", "systemEvents"):
        group_block = find_matching_block(section, f"{group}: Object.freeze({{", "{", "}")
        result[group] = parse_js_string_object(group_block)
    return result


def build_system_profile_texts(system_text: str) -> dict[str, str]:
    start = system_text.find("const SYSTEM_PROFILE_TEXT_COPY = Object.freeze({")
    end = system_text.find("const SYSTEM_PROFILE_TEXT_ROUTE_MAP = Object.freeze({")
    if start < 0 or end < 0 or end <= start:
        raise ValueError("Unable to isolate SYSTEM_PROFILE_TEXT_COPY section")
    section = system_text[start:end]
    millennial_block = find_matching_block(section, "millennial: Object.freeze({", "{", "}")
    return parse_js_string_object(millennial_block)


def build_system_route_map(system_text: str) -> dict[str, str]:
    start = system_text.find("const SYSTEM_PROFILE_TEXT_ROUTE_MAP = Object.freeze({")
    end = system_text.find("const SYSTEM_TEXT_TEMPLATES_RU = Object.freeze({")
    if start < 0 or end < 0 or end <= start:
        raise ValueError("Unable to isolate SYSTEM_PROFILE_TEXT_ROUTE_MAP section")
    section = system_text[start:end]
    route_block = find_matching_block(section, "const SYSTEM_PROFILE_TEXT_ROUTE_MAP = Object.freeze({", "{", "}")
    return parse_js_string_object(route_block)


def build_battle_fallback_targets(conflict_text: str) -> dict[str, tuple[str, str]]:
    start = conflict_text.find("const BATTLE_FALLBACK_TEXTS = Object.freeze({")
    end = conflict_text.find("function now(){ return Date.now(); }")
    if start < 0 or end < 0 or end <= start:
        raise ValueError("Unable to isolate BATTLE_FALLBACK_TEXTS section")
    section = conflict_text[start:end]
    default_block = find_matching_block(section, "default: Object.freeze({", "{", "}")
    millennial_block = find_matching_block(section, "millennial: Object.freeze({", "{", "}")
    boomer_block = find_matching_block(section, "boomer: Object.freeze({", "{", "}")
    default_texts = parse_js_string_object(default_block)
    millennial_texts = parse_js_string_object(millennial_block)
    boomer_texts = parse_js_string_object(boomer_block)
    targets: dict[str, tuple[str, str]] = {}
    for semantic_key, boomer_text in boomer_texts.items():
        canonical_boomer = normalize_text(boomer_text)
        for source_text in (
            default_texts.get(semantic_key, ""),
            millennial_texts.get(semantic_key, ""),
        ):
            normalized_source = normalize_text(source_text)
            if normalized_source and normalized_source not in targets:
                targets[normalized_source] = (canonical_boomer, f"battle_fallback_registry:{semantic_key}")
    return targets


def render_system_route(
    system_copy: dict[str, dict[str, str]],
    system_profile_texts: dict[str, str],
    route_map: dict[str, str],
    kind: str,
    code: str,
) -> str:
    route_key = f"{kind}.{code}"
    if route_key in route_map:
        profile_key = route_map[route_key]
        if profile_key in system_profile_texts:
            return normalize_text(system_profile_texts[profile_key])
    return normalize_text(system_copy[kind][code])


def make_row(
    row_id: int,
    feature_zone: str,
    source_file: str,
    source_locator: str,
    source_kind: str,
    resolution_path: str,
    runtime_reachability: str,
    current_text: str,
    source_term: str,
    expected_target: str,
    authority: str,
    taboo_phrases: list[str],
    wrong_profile: bool,
) -> dict[str, str]:
    current = normalize_text(current_text)
    source = normalize_text(source_term)
    expected = normalize_text(expected_target)
    current_placeholders = extract_placeholders(current)
    expected_placeholders = extract_placeholders(expected) if expected else []
    taboo = taboo_hit(current, taboo_phrases)

    if not expected:
        classification = "unmapped"
        verdict = "FAIL"
        reason = (
            "No accepted Boomer target exists for this live surface in the Step 4.3 mapping, "
            "the accepted runtime-gap targets, or the Boomer allowed lexicon."
        )
    elif current_placeholders != expected_placeholders:
        classification = "placeholder_mismatch"
        verdict = "FAIL"
        reason = f"Current placeholders {current_placeholders} differ from accepted placeholders {expected_placeholders}."
    elif wrong_profile:
        classification = "wrong_profile"
        verdict = "FAIL"
        reason = "Boomer UI resolves this live surface through a non-Boomer profile path."
    elif taboo:
        classification = "forbidden"
        verdict = "FAIL"
        reason = f"Current live text contains taboo phrase: {taboo}."
    elif current == expected:
        classification = "allowed_exact"
        verdict = "PASS"
        reason = "Current live text matches the accepted Boomer target exactly."
    else:
        classification = "mapped_exact"
        verdict = "FAIL"
        reason = "Accepted Boomer target is known, but the current live text does not match it exactly."

    return {
        "id": f"AUD_{row_id:04d}",
        "featureZone": feature_zone,
        "sourceFile": source_file,
        "sourceLocator": source_locator,
        "sourceKind": source_kind,
        "currentText": current,
        "sourceTerm": source,
        "runtimeReachability": runtime_reachability,
        "profileResolutionPath": resolution_path,
        "placeholders": ", ".join(current_placeholders),
        "acceptedBoomerTarget": expected,
        "authority": authority,
        "classification": classification,
        "verdict": verdict,
        "reason": reason,
    }


def make_non_live_row(
    row_id: int,
    feature_zone: str,
    source_file: str,
    source_locator: str,
    source_kind: str,
    resolution_path: str,
    runtime_reachability: str,
    current_text: str,
    source_term: str,
    expected_target: str,
    authority: str,
    classification: str,
    reason: str,
) -> dict[str, str]:
    current = normalize_text(current_text)
    source = normalize_text(source_term)
    expected = normalize_text(expected_target)
    current_placeholders = extract_placeholders(current)
    return {
        "id": f"AUD_{row_id:04d}",
        "featureZone": feature_zone,
        "sourceFile": source_file,
        "sourceLocator": source_locator,
        "sourceKind": source_kind,
        "currentText": current,
        "sourceTerm": source,
        "runtimeReachability": runtime_reachability,
        "profileResolutionPath": resolution_path,
        "placeholders": ", ".join(current_placeholders),
        "acceptedBoomerTarget": expected,
        "authority": authority,
        "classification": classification,
        "verdict": NON_LIVE_VERDICT,
        "reason": reason,
    }


def build_manual_specs(
    system_copy: dict[str, dict[str, str]],
    system_profile_texts: dict[str, str],
    route_map: dict[str, str],
) -> list[ManualSurfaceSpec]:
    rendered = lambda kind, code: render_system_route(system_copy, system_profile_texts, route_map, kind, code)
    return [
        ManualSurfaceSpec(
            "points",
            "system",
            "Game.System.say(errors, insufficientPoints)",
            "resolver",
            "Game.System.say -> SYSTEM_PROFILE_TEXT_ROUTE_MAP -> activeSystemTextProfile=millennial",
            "runtime_resolved",
            rendered("errors", "insufficientPoints"),
            "Не хватает 💰.",
            ("errors.insufficientPoints", "not_enough_money"),
            True,
        ),
        ManualSurfaceSpec(
            "points",
            "system",
            "Game.System.say(errors, pointsLowBattle)",
            "resolver",
            "Game.System.say -> SystemCopy.errors.pointsLowBattle",
            "runtime_resolved",
            rendered("errors", "pointsLowBattle"),
            "Мало 💰 на баттл.",
            ("errors.pointsLowBattle",),
        ),
        ManualSurfaceSpec(
            "reports",
            "data",
            "Data.SYS.reportNo",
            "resolver",
            "Data.SYS.reportNo -> Game.System.say(errors, reportNo)",
            "runtime_resolved",
            rendered("errors", "reportNo"),
            "Коп: донос пустой, -5💰.",
            ('reportNo: systemSay("errors", "reportNo")',),
        ),
        ManualSurfaceSpec(
            "points",
            "system",
            "Game.System.say(notifications, pointsDeltaPlusOne)",
            "system_notification",
            "Game.System.say -> SystemCopy.notifications.pointsDeltaPlusOne",
            "runtime_resolved",
            rendered("notifications", "pointsDeltaPlusOne"),
            "+1💰",
            ("notifications.pointsDeltaPlusOne",),
        ),
        ManualSurfaceSpec(
            "rep",
            "system",
            "Game.System.say(notifications, repDeltaPlusOne)",
            "system_notification",
            "Game.System.say -> SystemCopy.notifications.repDeltaPlusOne",
            "runtime_resolved",
            rendered("notifications", "repDeltaPlusOne"),
            "+1⭐",
            ("notifications.repDeltaPlusOne",),
        ),
        ManualSurfaceSpec(
            "points",
            "ui_dm",
            "UI.showStatToast(points, respectPaid)",
            "toast",
            "Game.System.say -> SystemCopy.notifications.respectPaid",
            "runtime_resolved",
            rendered("notifications", "respectPaid"),
            "Ты отдал 1💰",
            ('systemSay("notifications", "respectPaid")',),
        ),
        ManualSurfaceSpec(
            "rep",
            "ui_dm",
            "UI.showStatToast(rep, respectTargetRep)",
            "toast",
            "Game.System.say -> SystemCopy.notifications.respectTargetRep",
            "runtime_resolved",
            rendered("notifications", "respectTargetRep"),
            "Цель получила +1 ⭐",
            ('systemSay("notifications", "respectTargetRep")',),
        ),
        ManualSurfaceSpec(
            "reports",
            "ui_dm",
            "Game.__A.pushDm(... reportPending ...)",
            "dm",
            "Game.System.say -> SystemCopy.notifications.reportPending",
            "runtime_resolved",
            rendered("notifications", "reportPending"),
            "Проверяю.",
            ('systemSay("notifications", "reportPending")',),
        ),
        ManualSurfaceSpec(
            "reports",
            "data",
            "Data.SYS.reportOk(name)",
            "system_notification",
            "Data.SYS.reportOk -> Game.System.say(notifications, reportOk)",
            "runtime_resolved",
            rendered("notifications", "reportOk"),
            "Коп: {name} сдан, +2💰.",
            ('reportOk: (name) => systemSay("notifications", "reportOk", { name })',),
        ),
        ManualSurfaceSpec(
            "rematch",
            "system",
            "Game.System.say(notifications, rematchCost)",
            "system_notification",
            "Game.System.say -> SystemCopy.notifications.rematchCost",
            "runtime_resolved",
            rendered("notifications", "rematchCost"),
            "Реванш: -{rematchCost}💰.",
            ("notifications.rematchCost",),
        ),
        ManualSurfaceSpec(
            "points",
            "ui_battles",
            "leaveBtn.textContent",
            "toast",
            "Game.System.say -> SystemCopy.notifications.escapePaid",
            "runtime_resolved",
            rendered("notifications", "escapePaid"),
            "Свалить за 1💰.",
            ('systemSay("notifications", "escapePaid")',),
        ),
        ManualSurfaceSpec(
            "voting",
            "events",
            "Game.UI.pushSystem(systemSay(notifications, pointsDeltaVoteCost))",
            "system_notification",
            "Game.System.say -> SystemCopy.notifications.pointsDeltaVoteCost",
            "runtime_resolved",
            rendered("notifications", "pointsDeltaVoteCost"),
            "-{voteCost}💰",
            ('systemSay("notifications", "pointsDeltaVoteCost", { voteCost })',),
        ),
        ManualSurfaceSpec(
            "voting",
            "system",
            "SYSTEM_ECONOMY_TEXT_REASON_CONTRACT.crowd_vote_refund",
            "system_notification",
            "SYSTEM_ECONOMY_TEXT_REASON_CONTRACT -> SystemCopy.notifications.pointsDeltaRefund",
            "generated_runtime_text",
            rendered("notifications", "pointsDeltaRefund"),
            "+1💰 возврат.",
            ("crowd_vote_refund", "pointsDeltaRefund"),
        ),
        ManualSurfaceSpec(
            "majority_minority",
            "system",
            "SYSTEM_ECONOMY_TEXT_REASON_CONTRACT.crowd_vote_refund_majority",
            "system_notification",
            "SYSTEM_ECONOMY_TEXT_REASON_CONTRACT -> SystemCopy.notifications.pointsDeltaRefundMajority",
            "generated_runtime_text",
            rendered("notifications", "pointsDeltaRefundMajority"),
            "+1💰 возврат большинству.",
            ("crowd_vote_refund_majority", "pointsDeltaRefundMajority"),
        ),
        ManualSurfaceSpec(
            "majority_minority",
            "system",
            "SYSTEM_ECONOMY_TEXT_REASON_CONTRACT.crowd_vote_remainder_*",
            "system_notification",
            "SYSTEM_ECONOMY_TEXT_REASON_CONTRACT -> SystemCopy.notifications.pointsDeltaRemainderWin",
            "generated_runtime_text",
            rendered("notifications", "pointsDeltaRemainderWin"),
            "+1💰 остаток победителю.",
            ("crowd_vote_remainder_win", "pointsDeltaRemainderWin"),
        ),
        ManualSurfaceSpec(
            "dm",
            "ui_dm",
            "UI.pushSystem(... dmReaction ...)",
            "system_notification",
            "Game.System.say -> SystemCopy.systemEvents.dmReaction",
            "runtime_resolved",
            rendered("systemEvents", "dmReaction"),
            "{name} ↔ {target}: реакция.",
            ('systemSay("systemEvents", "dmReaction"',),
        ),
        ManualSurfaceSpec(
            "dm",
            "ui_dm",
            "UI.pushSystem(... dmInvite ...)",
            "system_notification",
            "Game.System.say -> SystemCopy.systemEvents.dmInvite",
            "runtime_resolved",
            rendered("systemEvents", "dmInvite"),
            "{name}: +{guest} к {target}.",
            ('systemSay("systemEvents", "dmInvite"',),
        ),
        ManualSurfaceSpec(
            "npc_vs_npc",
            "data",
            "Data.SYS.npcBattleEndWin",
            "template",
            "Data.SYS.npcBattleEndWin",
            "runtime_resolved",
            "{winner} победил. {loser} проиграл.",
            "{winner} победил. {loser} проиграл.",
            ('npcBattleEndWin: (winner, loser) => `${winner} победил. ${loser} проиграл.`',),
        ),
        ManualSurfaceSpec(
            "conflict_results",
            "data",
            "Data.SYS.npcBattleEndDraw",
            "template",
            "Data.SYS.npcBattleEndDraw",
            "runtime_resolved",
            "{a} и {b}: ничья.",
            "{a} и {b}: ничья.",
            ('npcBattleEndDraw: (a, b) => `${a} и ${b}: ничья.`',),
        ),
        ManualSurfaceSpec(
            "conflict_results",
            "conflict_core",
            "pushSystem(... battleResult ...)",
            "generated_runtime_text",
            "battleResultText -> Game.System.say(systemEvents, battleResult)",
            "generated_runtime_text",
            rendered("systemEvents", "battleResult"),
            "Баттл с {oppName}: {text}.",
            ('systemSay("systemEvents", "battleResult"',),
        ),
        ManualSurfaceSpec(
            "voting",
            "ui_events",
            "__smokeBoomerTermsStep42Events.voteDisabled",
            "toast",
            "literal boomer branch in ui-events.js",
            "runtime_resolved",
            "Вы уже проголосовали.",
            "Ты уже проголосовал.",
            ("voteDisabled", "Вы уже проголосовали."),
            is_live=False,
            non_live_reason="Game.__DEV smoke-only fixture; excluded from live production evidence and audit status.",
        ),
        ManualSurfaceSpec(
            "points",
            "ui_events",
            "__smokeBoomerTermsStep42Events.voteNoPoints",
            "toast",
            "literal boomer branch in ui-events.js",
            "runtime_resolved",
            "Недостаточно 💰.",
            "Не хватает 💰.",
            ("voteNoPoints", "Недостаточно 💰."),
            is_live=False,
            non_live_reason="Game.__DEV smoke-only fixture; excluded from live production evidence and audit status.",
        ),
        ManualSurfaceSpec(
            "rematch",
            "ui_battles",
            "__smokeBoomerTermsStep42Battles.rematchAlreadyRequested",
            "toast",
            "literal boomer branch in ui-battles.js",
            "runtime_resolved",
            "Реванш уже запрошен.",
            "Реванш уже запрошен.",
            ("rematchAlreadyRequested",),
            is_live=False,
            non_live_reason="Game.__DEV smoke-only fixture; excluded from live production evidence and audit status.",
        ),
        ManualSurfaceSpec(
            "rematch",
            "ui_battles",
            "__smokeBoomerTermsStep42Battles.rematchNotEligible",
            "toast",
            "literal boomer branch in ui-battles.js",
            "runtime_resolved",
            "Повторный спор недоступен: текущий спор ещё не завершён.",
            "Недоступно. Баттл не завершён.",
            ("rematchNotEligible",),
            is_live=False,
            non_live_reason="Game.__DEV smoke-only fixture; excluded from live production evidence and audit status.",
        ),
        ManualSurfaceSpec(
            "rematch",
            "ui_battles",
            "__smokeBoomerTermsStep42Battles.rematchNotFound",
            "toast",
            "literal boomer branch in ui-battles.js",
            "runtime_resolved",
            "Повторный спор для этого конфликта недоступен.",
            "Недоступно.",
            ("rematchNotFound",),
            is_live=False,
            non_live_reason="Game.__DEV smoke-only fixture; excluded from live production evidence and audit status.",
        ),
        ManualSurfaceSpec(
            "points",
            "ui_dm",
            "__smokeBoomerTermsStep42Dm.respect_pair_daily",
            "toast",
            "literal boomer branch in ui-dm.js",
            "runtime_resolved",
            "Сегодня вы уже выразили уважение этому персонажу.",
            "Уже было уважение сегодня этому персонажу.",
            ("respect_pair_daily",),
            is_live=False,
            non_live_reason="Game.__DEV smoke-only fixture; excluded from live production evidence and audit status.",
        ),
        ManualSurfaceSpec(
            "rep",
            "ui_dm",
            "__smokeBoomerTermsStep42Dm.respect_no_chain",
            "toast",
            "literal boomer branch in ui-dm.js",
            "runtime_resolved",
            "Сегодня нельзя сначала выразить уважение персонажу, а затем получить уважение от него в ответ.",
            "Цепочка A->B->A сегодня не работает.",
            ("respect_no_chain",),
            is_live=False,
            non_live_reason="Game.__DEV smoke-only fixture; excluded from live production evidence and audit status.",
        ),
        ManualSurfaceSpec(
            "rep",
            "ui_dm",
            "__smokeBoomerTermsStep42Dm.respect_emitter_empty",
            "toast",
            "literal boomer branch in ui-dm.js",
            "runtime_resolved",
            "Дневной лимит выражения уважения исчерпан.",
            "Лимит уважения на сегодня исчерпан.",
            ("respect_emitter_empty",),
            is_live=False,
            non_live_reason="Game.__DEV smoke-only fixture; excluded from live production evidence and audit status.",
        ),
        ManualSurfaceSpec(
            "dm",
            "ui_dm",
            "DM_ACTION_LABEL_BASE.dm.battle",
            "direct_literal",
            "shared DM_ACTION_LABEL_BASE object reused for boomer",
            "static_reachable",
            "баттл",
            "баттл",
            ('"dm.battle": "баттл"',),
        ),
        ManualSurfaceSpec(
            "reports",
            "ui_dm",
            "DM_ACTION_LABEL_BASE.dm.report.open",
            "direct_literal",
            "shared DM_ACTION_LABEL_BASE object reused for boomer",
            "static_reachable",
            "Сдать",
            "Сдать",
            ('"dm.report.open": "Сдать"',),
        ),
        ManualSurfaceSpec(
            "reports",
            "ui_dm",
            "DM_REPORT_SUBMIT_LABELS.pending",
            "direct_literal",
            "shared DM_REPORT_SUBMIT_LABELS object reused for boomer",
            "static_reachable",
            "Проверяю...",
            "Проверяю...",
            ('pending: "Проверяю..."',),
        ),
        ManualSurfaceSpec(
            "reports",
            "ui_dm",
            "DM_REPORT_SUBMIT_LABELS.cooldown",
            "direct_literal",
            "shared DM_REPORT_SUBMIT_LABELS object reused for boomer",
            "static_reachable",
            "Занят",
            "Занят",
            ('cooldown: "Занят"',),
        ),
        ManualSurfaceSpec(
            "influence",
            "index",
            "title=Влияние",
            "dom_label",
            "static HTML title attribute",
            "static_reachable",
            "Влияние",
            "Влияние",
            ('title="Влияние"',),
        ),
        ManualSurfaceSpec(
            "rep",
            "index",
            "title=⭐",
            "dom_label",
            "static HTML title attribute",
            "static_reachable",
            "⭐",
            "⭐",
            ('title="⭐"',),
        ),
        ManualSurfaceSpec(
            "points",
            "index",
            "title=💰",
            "dom_label",
            "static HTML title attribute",
            "static_reachable",
            "💰",
            "💰",
            ('title="💰"',),
        ),
        ManualSurfaceSpec(
            "reports",
            "index",
            "reportInput.placeholder",
            "dom_label",
            "static HTML placeholder",
            "static_reachable",
            "Ник бандита или токсика.",
            "Ник бандита или токсика.",
            ('placeholder="Ник бандита или токсика."',),
        ),
        ManualSurfaceSpec(
            "reports",
            "index",
            "reportBtn.textContent",
            "dom_label",
            "static HTML button label",
            "static_reachable",
            "Сдать",
            "Сдать",
            ('<button id="reportBtn" class="btn">Сдать</button>',),
        ),
        ManualSurfaceSpec(
            "reports",
            "index",
            "reportHint.textContent",
            "dom_label",
            "static HTML hint",
            "static_reachable",
            "Сдай токсика, бандита или мафиози.",
            "Сдай токсика, бандита или мафиози.",
            ('<span class="pill" id="reportHint">Сдай токсика, бандита или мафиози.</span>',),
        ),
        ManualSurfaceSpec(
            "conflict_results",
            "conflict_core",
            "battleResultText.draw_fallback",
            "generated_runtime_text",
            "BATTLE_FALLBACK_TEXTS -> battleFallbackText(\"battle.draw_fallback\") -> resolveUiTextProfileName()",
            "generated_runtime_text",
            "Решает голосование",
            "Толпа решает",
            (
                '"battle.draw_fallback": "Решает голосование",',
                'if (r === "draw") return battleFallbackText("battle.draw_fallback") || "Толпа решает";',
            ),
        ),
        ManualSurfaceSpec(
            "conflict_results",
            "conflict_core",
            "battleResultText.escaped_fallback",
            "generated_runtime_text",
            "BATTLE_FALLBACK_TEXTS -> battleFallbackText(\"battle.escaped_fallback\") -> resolveUiTextProfileName()",
            "generated_runtime_text",
            "Выйти",
            "Свалить",
            (
                '"battle.escaped_fallback": "Выйти",',
                'if (r === "escaped") return battleFallbackText("battle.escaped_fallback") || "Свалить";',
            ),
        ),
        ManualSurfaceSpec(
            "conflict_results",
            "conflict_core",
            "battleResultText.ignored_fallback",
            "generated_runtime_text",
            "BATTLE_FALLBACK_TEXTS -> battleFallbackText(\"battle.ignored_fallback\") -> resolveUiTextProfileName()",
            "generated_runtime_text",
            "Вызов отклонён",
            "Отвали",
            (
                '"battle.ignored_fallback": "Вызов отклонён"',
                'if (r === "ignored") return battleFallbackText("battle.ignored_fallback") || "Отвали";',
            ),
        ),
    ]


def build_audit(root: Path) -> dict[str, object]:
    source_texts = {key: (root / rel_path).read_text(encoding="utf-8") for key, rel_path in SOURCE_FILES.items()}
    current_to_boomer, allowed_boomer = parse_allowed_lexicon(root / ALLOWED_LEXICON)
    step43_mapping = parse_step43_mapping(root / STEP43_MAPPING)
    taboo_phrases = parse_taboo_phrases(root / TABOO_LIST)
    runtime_gap_targets = parse_runtime_gap_targets(root / RUNTIME_GAP_TARGETS)
    runtime_gap_copy_decisions, runtime_gap_decision_failures = parse_runtime_gap_copy_decisions(
        root / RUNTIME_GAP_COPY_DECISIONS
    )

    genz_texts, boomer_texts = build_data_texts(source_texts["data"])
    cap_millennial, cap_boomer = build_cap_messages(source_texts["data"])
    cop_millennial, cop_boomer = build_cop_templates(source_texts["data"])
    npc_zoomer, npc_boomer = build_npc_event_templates(source_texts["data"])
    battle_fallback_targets = build_battle_fallback_targets(source_texts["conflict_core"])
    system_copy = build_system_copy(source_texts["system"])
    system_profile_texts = build_system_profile_texts(source_texts["system"])
    route_map = build_system_route_map(source_texts["system"])

    live_rows: list[dict[str, str]] = []
    non_live_rows: list[dict[str, str]] = []
    failures: list[str] = list(runtime_gap_decision_failures)
    seen_ids: set[str] = set()
    seen_live_locators: set[tuple[str, str]] = set()
    row_id = 1

    def ensure_evidence(file_key: str, evidence: tuple[str, ...], locator: str) -> None:
        haystack = source_texts[file_key]
        for snippet in evidence:
            if snippet not in haystack:
                failures.append(f"Missing production evidence in {SOURCE_FILES[file_key]} for {locator}: {snippet}")

    def add_row(
        feature_zone: str,
        file_key: str,
        locator: str,
        source_kind: str,
        resolution_path: str,
        runtime_reachability: str,
        current_text: str,
        source_term: str,
        evidence: tuple[str, ...],
        wrong_profile: bool = False,
        is_live: bool = True,
        non_live_classification: str = "dev_only",
        non_live_reason: str = "",
    ) -> None:
        nonlocal row_id
        ensure_evidence(file_key, evidence, locator)
        expected_target, authority = resolve_expected_target(
            source_term,
            current_text,
            step43_mapping,
            current_to_boomer,
            battle_fallback_targets,
            allowed_boomer,
            runtime_gap_targets,
            runtime_gap_copy_decisions,
        )
        if is_live:
            row = make_row(
                row_id,
                feature_zone,
                SOURCE_FILES[file_key],
                locator,
                source_kind,
                resolution_path,
                runtime_reachability,
                current_text,
                source_term,
                expected_target,
                authority,
                taboo_phrases,
                wrong_profile,
            )
            locator_key = (row["sourceFile"], row["sourceLocator"])
            if locator_key in seen_live_locators:
                failures.append(f"Duplicate live source locator detected: {row['sourceFile']} :: {row['sourceLocator']}")
            seen_live_locators.add(locator_key)
            live_rows.append(row)
        else:
            row = make_non_live_row(
                row_id,
                feature_zone,
                SOURCE_FILES[file_key],
                locator,
                source_kind,
                resolution_path,
                runtime_reachability,
                current_text,
                source_term,
                expected_target,
                authority,
                non_live_classification,
                non_live_reason
                or "Non-live evidence is excluded from the Step 4.4A live audit totals and final status.",
            )
            non_live_rows.append(row)
        if row["id"] in seen_ids:
            failures.append(f"Duplicate row id detected: {row['id']}")
        seen_ids.add(row["id"])
        row_id += 1

    relevant_data_keys = [
        "tie_start",
        "tie_call_to_action",
        "tie_click_name_hint",
        "vote_ok",
        "vote_already",
        "vote_fail",
        "tie_timer",
        "tie_end_winner",
        "tie_end_draw",
        "tie_chat_start",
        "tie_chat_end_winner",
        "tie_chat_end_draw",
        "battle_action_accept",
        "battle_action_decline",
        "battle_action_attack",
        "battle_action_rematch",
        "battle_action_report",
        "battle_energy_locked_hint",
        "battle_invite_title",
        "battles_empty",
        "dm_empty",
        "conflict_win",
        "conflict_loss",
        "conflict_draw",
        "supported_majority",
        "supported_minority",
        "majority_won",
        "minority_lost",
        "conflict_finished",
        "battle_not_enough_points",
        "escape_button_label",
        "invite_open_hint",
        "invite_invalid",
    ]
    key_feature_zone = {
        "tie_start": "voting",
        "tie_call_to_action": "voting",
        "tie_click_name_hint": "voting",
        "vote_ok": "voting",
        "vote_already": "voting",
        "vote_fail": "voting",
        "tie_timer": "voting",
        "tie_end_winner": "majority_minority",
        "tie_end_draw": "conflict_results",
        "tie_chat_start": "voting",
        "tie_chat_end_winner": "majority_minority",
        "tie_chat_end_draw": "conflict_results",
        "battle_action_accept": "conflict_results",
        "battle_action_decline": "conflict_results",
        "battle_action_attack": "conflict_results",
        "battle_action_rematch": "rematch",
        "battle_action_report": "reports",
        "battle_energy_locked_hint": "influence",
        "battle_invite_title": "conflict_results",
        "battles_empty": "conflict_results",
        "dm_empty": "dm",
        "conflict_win": "conflict_results",
        "conflict_loss": "conflict_results",
        "conflict_draw": "conflict_results",
        "supported_majority": "majority_minority",
        "supported_minority": "majority_minority",
        "majority_won": "majority_minority",
        "minority_lost": "majority_minority",
        "conflict_finished": "conflict_results",
        "battle_not_enough_points": "points",
        "escape_button_label": "points",
        "invite_open_hint": "dm",
        "invite_invalid": "dm",
    }
    for key in relevant_data_keys:
        if key not in boomer_texts or key not in genz_texts:
            failures.append(f"Missing Data.TEXTS key for Step 4.4A audit: {key}")
            continue
        add_row(
            key_feature_zone[key],
            "data",
            f"Data.TEXTS.boomer.{key}",
            "profile_dictionary",
            "Data.t -> resolveUiTextProfileName -> Data.TEXTS.boomer",
            "runtime_resolved",
            boomer_texts[key],
            genz_texts[key],
            (f"{key}:", boomer_texts[key]),
        )

    for cap_key in ("rep", "points"):
        add_row(
            cap_key,
            "data",
            f"Data.CAP_MESSAGES.boomer.{cap_key}",
            "profile_dictionary",
            "Data.CAP_MESSAGES getter -> resolveUiTextProfileName -> CAP_MESSAGES_BOOMER",
            "runtime_resolved",
            cap_boomer[cap_key],
            cap_millennial[cap_key],
            (f'{cap_key}: "{cap_boomer[cap_key]}"',),
        )

    for category, values in cop_boomer.items():
        base_values = cop_millennial.get(category, [])
        for index, current_text in enumerate(values):
            source_term = base_values[index] if index < len(base_values) else current_text
            add_row(
                "reports" if category in {"thanks", "scolds", "warnings"} else "dm",
                "data",
                f"Data.COP_TEMPLATES_PROFILE_TEXTS.boomer.{category}[{index}]",
                "profile_dictionary",
                "Data.COP_TEMPLATES getter -> resolveUiTextProfileName -> COP_TEMPLATES_BOOMER",
                "runtime_resolved",
                current_text,
                source_term,
                (current_text,),
            )

    for category, values in npc_boomer.items():
        source_values = npc_zoomer.get(category, [])
        for index, current_text in enumerate(values):
            source_term = source_values[index] if index < len(source_values) else current_text
            add_row(
                "npc_vs_npc",
                "data",
                f"Data.NPC_EVENT_TEMPLATES_PROFILE_TEXTS.boomer.{category}[{index}]",
                "profile_dictionary",
                "Data.resolveNpcEventTemplateText -> resolveUiTextProfileName -> NPC_EVENT_TEMPLATES_PROFILE_TEXTS.boomer",
                "generated_runtime_text",
                current_text,
                source_term,
                (current_text,),
            )

    for spec in build_manual_specs(system_copy, system_profile_texts, route_map):
        add_row(
            spec.feature_zone,
            spec.source_file_key,
            spec.source_locator,
            spec.source_kind,
            spec.resolution_path,
            spec.runtime_reachability,
            spec.current_text,
            spec.source_term,
            spec.evidence,
            wrong_profile=spec.wrong_profile,
            is_live=spec.is_live,
            non_live_classification=spec.non_live_classification,
            non_live_reason=spec.non_live_reason,
        )

    classification_counts: dict[str, int] = {}
    feature_counts: dict[str, int] = {}
    fail_rows = 0
    pass_rows = 0
    for row in live_rows:
        classification_counts[row["classification"]] = classification_counts.get(row["classification"], 0) + 1
        feature_counts[row["featureZone"]] = feature_counts.get(row["featureZone"], 0) + 1
        if row["verdict"] == "FAIL":
            fail_rows += 1
        elif row["verdict"] == "PASS":
            pass_rows += 1
        else:
            failures.append(f"Live row has unsupported verdict {row['verdict']!r}: {row['id']}")

    for row in live_rows:
        if row["classification"] in FAIL_CLASSIFICATIONS and row["verdict"] != "FAIL":
            failures.append(f"Fail classification without FAIL verdict: {row['id']} -> {row['classification']}")
        if row["classification"] in PASS_CLASSIFICATIONS and row["verdict"] != "PASS":
            failures.append(f"Pass classification without PASS verdict: {row['id']} -> {row['classification']}")
        if row["verdict"] == "FAIL" and row["classification"] not in FAIL_CLASSIFICATIONS:
            failures.append(f"FAIL verdict missing fail classification: {row['id']} -> {row['classification']}")
        if row["verdict"] == "PASS" and row["classification"] not in PASS_CLASSIFICATIONS:
            failures.append(f"PASS verdict missing pass classification: {row['id']} -> {row['classification']}")

    for row in non_live_rows:
        if row["verdict"] != NON_LIVE_VERDICT:
            failures.append(f"Non-live row must use {NON_LIVE_VERDICT}: {row['id']}")
        if row["classification"] not in {"dev_only", "diagnostic_only", "stale_artifact_only", "dead_or_unreachable"}:
            failures.append(f"Non-live row has unsupported classification: {row['id']} -> {row['classification']}")

    audited_row_count = len(live_rows)
    structural_failure_count = len(failures)
    if audited_row_count != len(live_rows):
        failures.append("auditedRowCount does not match the live row table.")
    if fail_rows != sum(1 for row in live_rows if row["verdict"] == "FAIL"):
        failures.append("failRowCount does not match the count of live FAIL verdicts.")
    if pass_rows != sum(1 for row in live_rows if row["verdict"] == "PASS"):
        failures.append("passRowCount does not match the count of live PASS verdicts.")
    if fail_rows + pass_rows != audited_row_count:
        failures.append("Live PASS/FAIL totals do not add up to auditedRowCount.")

    status = STATIC_PASS if fail_rows == 0 and not failures else STATIC_FAIL
    if status == STATIC_PASS and any(row["verdict"] != "PASS" for row in live_rows):
        failures.append("STATIC_PASS is invalid while a live row still has verdict FAIL.")
        status = STATIC_FAIL
    if status == STATIC_PASS and structural_failure_count != 0:
        failures.append("STATIC_PASS is invalid while structuralFailureCount is non-zero.")
        status = STATIC_FAIL

    structural_failure_count = len(failures)
    step4_4b_requirement = "true" if status == STATIC_PASS else "blocked until STATIC_PASS"

    summary_lines = [
        f"# {BUILD_MARKER}",
        "",
        "## Scope",
        "",
        "- Static-only Step 4.4A audit.",
        "- No runtime JavaScript, HTML entrypoint, dev-check, smoke registry, or production copy change is part of this artifact.",
        "- `Game.__DEV`, `Game.Dev`, and smoke-only helpers are excluded from live totals and shown only in the non-live appendix.",
        "- Step 4.4B remains a separate targeted runtime aggregate smoke and is not executed here.",
        "",
        "## Contract",
        "",
        f"- buildMarker: {BUILD_MARKER}",
        f"- smokeVersion: {SMOKE_VERSION}",
        f"- auditStatus: {status}",
        f"- auditedRowCount: {audited_row_count}",
        f"- failRowCount: {fail_rows}",
        f"- passRowCount: {pass_rows}",
        f"- structuralFailureCount: {structural_failure_count}",
        f"- nonLiveEvidenceCount: {len(non_live_rows)}",
        f"- requiresStep4_4B: {step4_4b_requirement}",
        "",
        "## Criteria",
        "",
        f"- STATIC_PASS condition: every live row is PASS, every live classification is outside {', '.join(sorted(FAIL_CLASSIFICATIONS))}, and structuralFailureCount is zero.",
        "- STATIC_FAIL condition: one or more live rows are untranslated, unmapped, taboo, wrong-profile, mapped-but-not-exact, or placeholder-broken, or a required production surface cannot be proven statically.",
        "",
        "## Classification Counts",
        "",
    ]
    for key in sorted(classification_counts):
        summary_lines.append(f"- {key}: {classification_counts[key]}")
    summary_lines.extend(
        [
            "",
            "## Feature Coverage Counts",
            "",
        ]
    )
    for key in sorted(feature_counts):
        summary_lines.append(f"- {key}: {feature_counts[key]}")
    summary_lines.extend(
        [
            "",
            "## Structural Failures",
            "",
        ]
    )
    if failures:
        for failure in failures:
            summary_lines.append(f"- {failure}")
    else:
        summary_lines.append("- none")
    summary_lines.extend(
        [
            "",
            "## Audit Table",
            "",
            "| id | featureZone | currentText | acceptedBoomerTarget | sourceFile | sourceLocator | sourceKind | runtimeReachability | profileResolutionPath | placeholders | authority | classification | verdict | reason |",
            "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
        ]
    )
    for row in live_rows:
        summary_lines.append(
            "| {id} | {featureZone} | {currentText} | {acceptedBoomerTarget} | {sourceFile} | {sourceLocator} | {sourceKind} | {runtimeReachability} | {profileResolutionPath} | {placeholders} | {authority} | {classification} | {verdict} | {reason} |".format(
                **{key: markdown_escape(value) for key, value in row.items()}
            )
        )

    summary_lines.extend(
        [
            "",
            "## Non-Live Evidence Appendix",
            "",
            "| id | featureZone | currentText | acceptedBoomerTarget | sourceFile | sourceLocator | sourceKind | runtimeReachability | profileResolutionPath | placeholders | authority | classification | verdict | reason |",
            "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
        ]
    )
    if non_live_rows:
        for row in non_live_rows:
            summary_lines.append(
                "| {id} | {featureZone} | {currentText} | {acceptedBoomerTarget} | {sourceFile} | {sourceLocator} | {sourceKind} | {runtimeReachability} | {profileResolutionPath} | {placeholders} | {authority} | {classification} | {verdict} | {reason} |".format(
                    **{key: markdown_escape(value) for key, value in row.items()}
                )
            )
    else:
        summary_lines.append("| none | — | — | — | — | — | — | — | — | — | — | — | — | — |")

    text = "\n".join(summary_lines).rstrip() + "\n"
    return {
        "status": status,
        "rows": live_rows,
        "liveRows": live_rows,
        "nonLiveRows": non_live_rows,
        "classificationCounts": classification_counts,
        "featureCounts": feature_counts,
        "auditedRowCount": audited_row_count,
        "failRowCount": fail_rows,
        "passRowCount": pass_rows,
        "structuralFailureCount": structural_failure_count,
        "failures": failures,
        "text": text,
    }


def write_outputs(root: Path) -> dict[str, object]:
    audit = build_audit(root)
    (root / ROOT_DOC).write_text(audit["text"], encoding="utf-8")
    (root / DOCS_DOC).write_text(audit["text"], encoding="utf-8")
    return audit


def main(argv: list[str]) -> int:
    root = Path(argv[1]).resolve() if len(argv) > 1 else Path.cwd().resolve()
    audit = write_outputs(root)
    print(
        f"{audit['status']} rows={len(audit['rows'])} nonLiveRows={len(audit['nonLiveRows'])} structuralFailures={len(audit['failures'])}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
