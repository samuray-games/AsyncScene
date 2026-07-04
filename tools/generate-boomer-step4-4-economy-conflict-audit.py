#!/usr/bin/env python3
"""Generate the Step 4.4A boomer economy/conflict terminology audit."""
from __future__ import annotations

import hashlib
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
BUILD_MARKER = "UI_PROFILE_BOOMER_STEP_4_4_ECONOMY_CONFLICT_TERMINOLOGY_AUDIT"
SMOKE_VERSION = "BOOMER-STEP4_4A-ECONOMY-CONFLICT-AUDIT-STATIC-v1"
STATIC_PASS = "STATIC_PASS / READY_FOR_RUNTIME_SMOKE"
STATIC_FAIL = "STATIC_FAIL / UNTRANSLATED_OR_UNMAPPED_ENTITIES_FOUND"

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

FAIL_CLASSIFICATIONS = {"forbidden", "unmapped", "wrong_profile", "placeholder_mismatch"}


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


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", unicodedata.normalize("NFC", str(value or "")).strip())


def comparison_key(value: str) -> str:
    return normalize_text(value).casefold()


def extract_placeholders(value: str) -> list[str]:
    return sorted(set(re.findall(r"\{([^{}]+)\}", normalize_text(value))))


def markdown_escape(value: str) -> str:
    return str(value).replace("|", "\\|").replace("\n", "<br>")


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
        value = bytes(match.group(2), "utf-8").decode("unicode_escape")
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
            rows.append(normalize_text(bytes(item.group(1), "utf-8").decode("unicode_escape")))
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
        marker = "Object.freeze(["
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
            normalize_text(bytes(item.group(1), "utf-8").decode("unicode_escape"))
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
    for line in path.read_text(encoding="utf-8").splitlines():
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


def taboo_hit(text: str, taboo_phrases: list[str]) -> str | None:
    haystack = normalize_text(text)
    for phrase in taboo_phrases:
        pattern = rf"(?<![0-9A-Za-zА-Яа-яЁё_]){re.escape(phrase)}(?![0-9A-Za-zА-Яа-яЁё_])"
        if re.search(pattern, haystack, flags=re.IGNORECASE):
            return phrase
    return None


def resolve_expected_target(
    source_term: str,
    current_text: str,
    step43_mapping: dict[str, str],
    current_to_boomer: dict[str, str],
    allowed_boomer: set[str],
) -> tuple[str, str]:
    normalized_source = normalize_text(source_term)
    normalized_current = normalize_text(current_text)
    if normalized_source in step43_mapping:
        return step43_mapping[normalized_source], "step4_3_mapping"
    if normalized_source in current_to_boomer:
        return current_to_boomer[normalized_source], "allowed_lexicon_current"
    if normalized_current in step43_mapping:
        return step43_mapping[normalized_current], "step4_3_mapping_current"
    if normalized_current in current_to_boomer:
        return current_to_boomer[normalized_current], "allowed_lexicon_current"
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
    override_block = find_matching_block(data_text, "const COP_TEMPLATES_BOOMER = applyCopTemplateOverrides(COP_TEMPLATES_MILLENNIAL, {", "{", "}")
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
        reason = "No accepted Boomer target exists for this live surface in the Step 4.3 mapping or the Boomer allowed lexicon."
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


def build_manual_specs(
    system_copy: dict[str, dict[str, str]],
    system_profile_texts: dict[str, str],
    route_map: dict[str, str],
) -> list[ManualSurfaceSpec]:
    rendered = lambda kind, code: render_system_route(system_copy, system_profile_texts, route_map, kind, code)
    return [
        ManualSurfaceSpec("points", "system", "Game.System.say(errors, insufficientPoints)", "resolver", "Game.System.say -> SYSTEM_PROFILE_TEXT_ROUTE_MAP -> activeSystemTextProfile=millennial", "runtime_resolved", rendered("errors", "insufficientPoints"), "Не хватает 💰.", ("errors.insufficientPoints", "not_enough_money"), True),
        ManualSurfaceSpec("points", "system", "Game.System.say(errors, pointsLowBattle)", "resolver", "Game.System.say -> SystemCopy.errors.pointsLowBattle", "runtime_resolved", rendered("errors", "pointsLowBattle"), "Мало 💰 на баттл.", ("errors.pointsLowBattle",), False),
        ManualSurfaceSpec("reports", "system", "Game.System.say(errors, reportNo)", "resolver", "Game.System.say -> SystemCopy.errors.reportNo", "runtime_resolved", rendered("errors", "reportNo"), "Коп: донос пустой, -5💰.", ("errors.reportNo",), False),
        ManualSurfaceSpec("points", "system", "Game.System.say(notifications, pointsDeltaPlusOne)", "system_notification", "Game.System.say -> SystemCopy.notifications.pointsDeltaPlusOne", "runtime_resolved", rendered("notifications", "pointsDeltaPlusOne"), "+1💰", ("notifications.pointsDeltaPlusOne",), False),
        ManualSurfaceSpec("rep", "system", "Game.System.say(notifications, repDeltaPlusOne)", "system_notification", "Game.System.say -> SystemCopy.notifications.repDeltaPlusOne", "runtime_resolved", rendered("notifications", "repDeltaPlusOne"), "+1⭐", ("notifications.repDeltaPlusOne",), False),
        ManualSurfaceSpec("points", "ui_dm", "UI.showStatToast(points, respectPaid)", "toast", "Game.System.say -> SystemCopy.notifications.respectPaid", "runtime_resolved", rendered("notifications", "respectPaid"), "Ты отдал 1💰", ("notifications.respectPaid", "respectPaidText"), False),
        ManualSurfaceSpec("rep", "ui_dm", "UI.showStatToast(rep, respectTargetRep)", "toast", "Game.System.say -> SystemCopy.notifications.respectTargetRep", "runtime_resolved", rendered("notifications", "respectTargetRep"), "Цель получила +1 ⭐", ("notifications.respectTargetRep", "respectTargetRepText"), False),
        ManualSurfaceSpec("reports", "ui_dm", "Game.__A.pushDm(... reportPending ...)", "dm", "Game.System.say -> SystemCopy.notifications.reportPending", "runtime_resolved", rendered("notifications", "reportPending"), "Проверяю.", ("notifications.reportPending",), False),
        ManualSurfaceSpec("reports", "data", "Data.SYS.reportOk(name)", "system_notification", "Game.System.say -> SystemCopy.notifications.reportOk", "runtime_resolved", rendered("notifications", "reportOk"), "Коп: {name} сдан, +2💰.", ("notifications.reportOk",), False),
        ManualSurfaceSpec("rematch", "ui_battles", "rematchRequested route", "toast", "Game.System.say -> SystemCopy.notifications.rematchRequested", "runtime_resolved", rendered("notifications", "rematchRequested"), "{name} зовёт на реванш.", ("notifications.rematchRequested",), False),
        ManualSurfaceSpec("rematch", "system", "Game.System.say(notifications, rematchCost)", "system_notification", "Game.System.say -> SystemCopy.notifications.rematchCost", "runtime_resolved", rendered("notifications", "rematchCost"), "Реванш: -{rematchCost}💰.", ("notifications.rematchCost",), False),
        ManualSurfaceSpec("points", "ui_battles", "escapePaid route", "toast", "Game.System.say -> SystemCopy.notifications.escapePaid", "runtime_resolved", rendered("notifications", "escapePaid"), "Свалить за 1💰.", ("notifications.escapePaid",), False),
        ManualSurfaceSpec("voting", "events", "Game.System.say(notifications, pointsDeltaVoteCost)", "system_notification", "Game.System.say -> SystemCopy.notifications.pointsDeltaVoteCost", "runtime_resolved", rendered("notifications", "pointsDeltaVoteCost"), "-{voteCost}💰", ("notifications.pointsDeltaVoteCost",), False),
        ManualSurfaceSpec("voting", "events", "Game.System.say(notifications, pointsDeltaRefund)", "system_notification", "Game.System.say -> SystemCopy.notifications.pointsDeltaRefund", "runtime_resolved", rendered("notifications", "pointsDeltaRefund"), "+1💰 возврат.", ("notifications.pointsDeltaRefund",), False),
        ManualSurfaceSpec("majority_minority", "events", "Game.System.say(notifications, pointsDeltaRefundMajority)", "system_notification", "Game.System.say -> SystemCopy.notifications.pointsDeltaRefundMajority", "runtime_resolved", rendered("notifications", "pointsDeltaRefundMajority"), "+1💰 возврат большинству.", ("notifications.pointsDeltaRefundMajority",), False),
        ManualSurfaceSpec("majority_minority", "events", "Game.System.say(notifications, pointsDeltaRemainderWin)", "system_notification", "Game.System.say -> SystemCopy.notifications.pointsDeltaRemainderWin", "runtime_resolved", rendered("notifications", "pointsDeltaRemainderWin"), "+1💰 остаток победителю.", ("notifications.pointsDeltaRemainderWin",), False),
        ManualSurfaceSpec("voting", "events", "Game.System.say(systemEvents, crowdStart)", "system_notification", "Game.System.say -> SystemCopy.systemEvents.crowdStart", "runtime_resolved", rendered("systemEvents", "crowdStart"), "Толпа решает.", ("systemEvents.crowdStart",), False),
        ManualSurfaceSpec("majority_minority", "events", "Game.System.say(systemEvents, crowdResolved)", "system_notification", "Game.System.say -> SystemCopy.systemEvents.crowdResolved", "runtime_resolved", rendered("systemEvents", "crowdResolved"), "Толпа: {name} {aVotes}:{bVotes}.", ("systemEvents.crowdResolved",), False),
        ManualSurfaceSpec("dm", "ui_dm", "UI.pushSystem(... dmReaction ...)", "system_notification", "Game.System.say -> SystemCopy.systemEvents.dmReaction", "runtime_resolved", rendered("systemEvents", "dmReaction"), "{name} ↔ {target}: реакция.", ("systemEvents.dmReaction",), False),
        ManualSurfaceSpec("dm", "ui_dm", "UI.pushSystem(... dmInvite ...)", "system_notification", "Game.System.say -> SystemCopy.systemEvents.dmInvite", "runtime_resolved", rendered("systemEvents", "dmInvite"), "{name}: +{guest} к {target}.", ("systemEvents.dmInvite",), False),
        ManualSurfaceSpec("npc_vs_npc", "events", "Game.System.say(systemEvents, battleWin)", "system_notification", "Game.System.say -> SystemCopy.systemEvents.battleWin", "runtime_resolved", rendered("systemEvents", "battleWin"), "{winner} победил. {loser} проиграл.", ("systemEvents.battleWin",), False),
        ManualSurfaceSpec("conflict_results", "system", "Game.System.say(systemEvents, battleDraw)", "system_notification", "Game.System.say -> SystemCopy.systemEvents.battleDraw", "runtime_resolved", rendered("systemEvents", "battleDraw"), "{a} и {b}: ничья.", ("systemEvents.battleDraw",), False),
        ManualSurfaceSpec("conflict_results", "conflict_core", "pushSystem(... battleResult ...)", "generated_runtime_text", "battleResultText -> Game.System.say(systemEvents, battleResult)", "generated_runtime_text", rendered("systemEvents", "battleResult"), "Баттл с {oppName}: {text}.", ("systemEvents.battleResult", "pushSystem(systemSay(\"systemEvents\", \"battleResult\""), False),
        ManualSurfaceSpec("voting", "ui_events", "__smokeBoomerTermsStep42Events.voteDisabled", "toast", "literal boomer branch in ui-events.js", "runtime_resolved", "Вы уже проголосовали.", "Ты уже проголосовал.", ("voteDisabled", "Вы уже проголосовали."), False),
        ManualSurfaceSpec("points", "ui_events", "__smokeBoomerTermsStep42Events.voteNoPoints", "toast", "literal boomer branch in ui-events.js", "runtime_resolved", "Недостаточно 💰.", "Не хватает 💰.", ("voteNoPoints", "Недостаточно 💰."), False),
        ManualSurfaceSpec("rematch", "ui_battles", "__smokeBoomerTermsStep42Battles.rematchAlreadyRequested", "toast", "literal boomer branch in ui-battles.js", "runtime_resolved", "Реванш уже запрошен.", "Реванш уже запрошен.", ("rematchAlreadyRequested",), False),
        ManualSurfaceSpec("rematch", "ui_battles", "__smokeBoomerTermsStep42Battles.rematchNotEligible", "toast", "literal boomer branch in ui-battles.js", "runtime_resolved", "Повторный спор недоступен: текущий спор ещё не завершён.", "Недоступно. Баттл не завершён.", ("rematchNotEligible",), False),
        ManualSurfaceSpec("rematch", "ui_battles", "__smokeBoomerTermsStep42Battles.rematchNotFound", "toast", "literal boomer branch in ui-battles.js", "runtime_resolved", "Повторный спор для этого конфликта недоступен.", "Недоступно.", ("rematchNotFound",), False),
        ManualSurfaceSpec("points", "ui_dm", "__smokeBoomerTermsStep42Dm.respect_pair_daily", "toast", "literal boomer branch in ui-dm.js", "runtime_resolved", "Сегодня вы уже выразили уважение этому персонажу.", "Уже было уважение сегодня этому персонажу.", ("respect_pair_daily",), False),
        ManualSurfaceSpec("rep", "ui_dm", "__smokeBoomerTermsStep42Dm.respect_no_chain", "toast", "literal boomer branch in ui-dm.js", "runtime_resolved", "Сегодня нельзя сначала выразить уважение персонажу, а затем получить уважение от него в ответ.", "Цепочка A->B->A сегодня не работает.", ("respect_no_chain",), False),
        ManualSurfaceSpec("rep", "ui_dm", "__smokeBoomerTermsStep42Dm.respect_emitter_empty", "toast", "literal boomer branch in ui-dm.js", "runtime_resolved", "Дневной лимит выражения уважения исчерпан.", "Лимит уважения на сегодня исчерпан.", ("respect_emitter_empty",), False),
        ManualSurfaceSpec("dm", "ui_dm", "DM_ACTION_LABEL_BASE.dm.battle", "direct_literal", "shared DM_ACTION_LABEL_BASE object reused for boomer", "static_reachable", "баттл", "баттл", ("\"dm.battle\": \"баттл\"",), False),
        ManualSurfaceSpec("reports", "ui_dm", "DM_ACTION_LABEL_BASE.dm.report.open", "direct_literal", "shared DM_ACTION_LABEL_BASE object reused for boomer", "static_reachable", "Сдать", "Сдать", ("\"dm.report.open\": \"Сдать\"",), False),
        ManualSurfaceSpec("reports", "ui_dm", "DM_REPORT_SUBMIT_LABELS.pending", "direct_literal", "shared DM_REPORT_SUBMIT_LABELS object reused for boomer", "static_reachable", "Проверяю...", "Проверяю...", ("pending: \"Проверяю...\"",), False),
        ManualSurfaceSpec("reports", "ui_dm", "DM_REPORT_SUBMIT_LABELS.cooldown", "direct_literal", "shared DM_REPORT_SUBMIT_LABELS object reused for boomer", "static_reachable", "Занят", "Занят", ("cooldown: \"Занят\"",), False),
        ManualSurfaceSpec("influence", "index", "title=Влияние", "dom_label", "static HTML title attribute", "static_reachable", "Влияние", "Влияние", ("title=\"Влияние\"",), False),
        ManualSurfaceSpec("rep", "index", "title=⭐", "dom_label", "static HTML title attribute", "static_reachable", "⭐", "⭐", ("title=\"⭐\"",), False),
        ManualSurfaceSpec("points", "index", "title=💰", "dom_label", "static HTML title attribute", "static_reachable", "💰", "💰", ("title=\"💰\"",), False),
        ManualSurfaceSpec("reports", "index", "reportInput.placeholder", "dom_label", "static HTML placeholder", "static_reachable", "Ник бандита или токсика.", "Ник бандита или токсика.", ("placeholder=\"Ник бандита или токсика.\"",), False),
        ManualSurfaceSpec("reports", "index", "reportBtn.textContent", "dom_label", "static HTML button label", "static_reachable", "Сдать", "Сдать", ("<button id=\"reportBtn\" class=\"btn\">Сдать</button>",), False),
        ManualSurfaceSpec("reports", "index", "reportHint.textContent", "dom_label", "static HTML hint", "static_reachable", "Сдай токсика, бандита или мафиози.", "Сдай токсика, бандита или мафиози.", ("<span class=\"pill\" id=\"reportHint\">Сдай токсика, бандита или мафиози.</span>",), False),
        ManualSurfaceSpec("conflict_results", "conflict_core", "battleResultText.draw_fallback", "generated_runtime_text", "literal fallback in conflict-core.js", "generated_runtime_text", "Толпа решает", "Толпа решает", ("return conflictResultText(\"conflict_draw\") || \"Толпа решает\";",), False),
        ManualSurfaceSpec("conflict_results", "conflict_core", "battleResultText.escaped_fallback", "generated_runtime_text", "literal fallback in conflict-core.js", "generated_runtime_text", "Свалить", "Свалить", ("if (r === \"escaped\") return \"Свалить\";",), False),
        ManualSurfaceSpec("conflict_results", "conflict_core", "battleResultText.ignored_fallback", "generated_runtime_text", "literal fallback in conflict-core.js", "generated_runtime_text", "Отвали", "Отвали", ("if (r === \"ignored\") return \"Отвали\";",), False),
    ]


def build_audit(root: Path) -> dict[str, object]:
    source_texts = {key: (root / rel_path).read_text(encoding="utf-8") for key, rel_path in SOURCE_FILES.items()}
    current_to_boomer, allowed_boomer = parse_allowed_lexicon(root / ALLOWED_LEXICON)
    step43_mapping = parse_step43_mapping(root / STEP43_MAPPING)
    taboo_phrases = parse_taboo_phrases(root / TABOO_LIST)

    genz_texts, boomer_texts = build_data_texts(source_texts["data"])
    cap_millennial, cap_boomer = build_cap_messages(source_texts["data"])
    cop_millennial, cop_boomer = build_cop_templates(source_texts["data"])
    npc_zoomer, npc_boomer = build_npc_event_templates(source_texts["data"])
    system_copy = build_system_copy(source_texts["system"])
    system_profile_texts = build_system_profile_texts(source_texts["system"])
    route_map = build_system_route_map(source_texts["system"])

    rows: list[dict[str, str]] = []
    failures: list[str] = []
    seen_keys: set[tuple[str, str, str]] = set()
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
    ) -> None:
        nonlocal row_id
        ensure_evidence(file_key, evidence, locator)
        expected_target, authority = resolve_expected_target(source_term, current_text, step43_mapping, current_to_boomer, allowed_boomer)
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
        dedupe_key = (row["sourceFile"], row["sourceLocator"], row["currentText"])
        if dedupe_key in seen_keys:
            failures.append(f"Duplicate evidence row detected for {row['sourceFile']} :: {row['sourceLocator']} :: {row['currentText']}")
        seen_keys.add(dedupe_key)
        rows.append(row)
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
            (f"{cap_key}: \"{cap_boomer[cap_key]}\"",),
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
        )

    classification_counts: dict[str, int] = {}
    feature_counts: dict[str, int] = {}
    fail_rows = 0
    for row in rows:
        classification_counts[row["classification"]] = classification_counts.get(row["classification"], 0) + 1
        feature_counts[row["featureZone"]] = feature_counts.get(row["featureZone"], 0) + 1
        if row["classification"] in FAIL_CLASSIFICATIONS:
            fail_rows += 1

    status = STATIC_PASS if fail_rows == 0 and not failures else STATIC_FAIL
    summary_lines = [
        f"# {BUILD_MARKER}",
        "",
        "## Scope",
        "",
        "- Static-only Step 4.4A audit.",
        "- No runtime JavaScript, HTML entrypoint, dev-check, smoke registry, or production copy change is part of this artifact.",
        "- Step 4.4B remains a separate targeted runtime aggregate smoke and is not executed here.",
        "",
        "## Contract",
        "",
        f"- buildMarker: {BUILD_MARKER}",
        f"- smokeVersion: {SMOKE_VERSION}",
        f"- auditStatus: {status}",
        f"- auditedRowCount: {len(rows)}",
        f"- failRowCount: {fail_rows}",
        f"- passRowCount: {len(rows) - fail_rows}",
        f"- structuralFailureCount: {len(failures)}",
        f"- requiresStep4_4B: {'true' if status == STATIC_PASS else 'false until Fix1'}",
        "",
        "## Criteria",
        "",
        f"- STATIC_PASS condition: no live row classified as {', '.join(sorted(FAIL_CLASSIFICATIONS))} and no structural audit failure.",
        "- STATIC_FAIL condition: one or more live rows are untranslated, unmapped, taboo, wrong-profile, or placeholder-broken, or a required production surface cannot be proven statically.",
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
    for row in rows:
        summary_lines.append(
            "| {id} | {featureZone} | {currentText} | {acceptedBoomerTarget} | {sourceFile} | {sourceLocator} | {sourceKind} | {runtimeReachability} | {profileResolutionPath} | {placeholders} | {authority} | {classification} | {verdict} | {reason} |".format(
                **{key: markdown_escape(value) for key, value in row.items()}
            )
        )

    text = "\n".join(summary_lines).rstrip() + "\n"
    return {
        "status": status,
        "rows": rows,
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
    print(f"{audit['status']} rows={len(audit['rows'])} structuralFailures={len(audit['failures'])}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
