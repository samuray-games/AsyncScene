#!/usr/bin/env python3
"""Static Step 6 Step 9 five-profile runtime validation."""

from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FROZEN_JSON = ROOT / "stage6_step9_five_profile_copy_frozen.json"
FROZEN_SHA256 = "6aa42c46c4bc594d234894dd92f57fd31292cce31953dab78343b653cfbdd45f"
FROZEN_BLOB = "9eb1a891d640d2958b3b29faf0954dac3eb642dc"
PROFILES = ("boomer", "genX", "millennial", "zoomer", "alpha")
BYTE_PARITY_MIRRORS = (
    ("AsyncScene/Web/data.js", "docs/data.js"),
    ("AsyncScene/Web/system.js", "docs/system.js"),
    ("AsyncScene/Web/ui/ui-core.js", "docs/ui/ui-core.js"),
    ("AsyncScene/Web/ui/ui-dm.js", "docs/ui/ui-dm.js"),
    ("AsyncScene/Web/ui/ui-profile-visual-tone-repair.js", "docs/ui/ui-profile-visual-tone-repair.js"),
)
ACTIVE_NPC_ARREST_ALLOWLIST = {
    "AsyncScene/Web/data.js",
    "AsyncScene/Web/system.js",
    "docs/data.js",
    "docs/system.js",
}


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def placeholders(value: str) -> set[str]:
    return set(re.findall(r"\{[A-Za-z0-9_]+\}", value))


def js_unescape(value: str) -> str:
    return bytes(value, "utf-8").decode("unicode_escape") if "\\" in value else value


def balanced_block(source: str, anchor: str) -> str:
    start = source.find(anchor)
    if start < 0:
        raise AssertionError(f"anchor not found: {anchor}")
    brace = source.find("{", start)
    if brace < 0:
        raise AssertionError(f"opening brace not found: {anchor}")
    depth = 0
    in_string = False
    escape = False
    for i in range(brace, len(source)):
        ch = source[i]
        if in_string:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == '"':
                in_string = False
            continue
        if ch == '"':
            in_string = True
        elif ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return source[brace + 1:i]
    raise AssertionError(f"unterminated block: {anchor}")


def parse_profile_object(block: str, profile: str) -> dict[str, str]:
    profile_anchor = f"{profile}: Object.freeze("
    body = balanced_block(block, profile_anchor)
    values: dict[str, str] = {}
    string_pair = re.compile(r'(?:"([^"]+)"|([A-Za-z_][A-Za-z0-9_]*))\s*:\s*"((?:\\.|[^"])*)"')
    for match in string_pair.finditer(body):
        key = match.group(1) or match.group(2)
        values[key] = js_unescape(match.group(3))
    return values


def parse_profile_table(source: str, const_name: str) -> dict[str, dict[str, str]]:
    block = balanced_block(source, f"const {const_name} = Object.freeze(")
    return {profile: parse_profile_object(block, profile) for profile in PROFILES}


def parse_string_object(block: str) -> dict[str, str]:
    values: dict[str, str] = {}
    string_pair = re.compile(r'(?:"([^"]+)"|([A-Za-z_][A-Za-z0-9_]*))\s*:\s*"((?:\\.|[^"])*)"')
    for match in string_pair.finditer(block):
        key = match.group(1) or match.group(2)
        values[key] = js_unescape(match.group(3))
    return values


def parse_data_start_profiles(data_source: str) -> dict[str, dict[str, str]]:
    block = balanced_block(data_source, "Data.START_SCREEN_PROFILE_TEXTS = Object.freeze(")
    return {profile: parse_profile_object(block, profile) for profile in PROFILES}


def parse_format_delta_templates(visual_source: str) -> dict[str, dict[str, dict[str, str]]]:
    function_body = balanced_block(visual_source, "function formatDelta")
    block = balanced_block(function_body, "const templates = Object.freeze(")
    result: dict[str, dict[str, dict[str, str]]] = {}
    ternary = re.compile(r'([A-Za-z_][A-Za-z0-9_]*)\s*:\s*value\s*>\s*0\s*\?\s*"((?:\\.|[^"])*)"\s*:\s*"((?:\\.|[^"])*)"')
    for profile in PROFILES:
        profile_body = balanced_block(block, f"{profile}: Object.freeze(")
        result[profile] = {}
        for match in ternary.finditer(profile_body):
            result[profile][match.group(1)] = {
                "gain": js_unescape(match.group(2)),
                "loss": js_unescape(match.group(3)),
            }
    return result


def flatten_expected(frozen: dict[str, object]) -> list[dict[str, str]]:
    coverage = frozen["coverage"]["semantic_families"]
    rows: list[dict[str, str]] = []
    covered = set()
    for family in ("A", "B", "C"):
        for row in coverage[family]:
            rows.append(row)
            covered.add(row["text_id"])

    implemented_core = {
        "dm.placeholder",
        "dm.send",
        "battle.attack_badge",
        "battle.defense_badge",
        "battle.opponent_argument",
        "battle.my_answer",
        "economy.not_enough_rep",
        "empty.dm",
        "empty.events",
        "empty.battles",
    }
    for row in frozen["rows"]:
        text_id = row.get("text_id")
        if text_id in implemented_core and text_id not in covered:
            rows.append(row)
    return rows


def actual_runtime_bindings(data_source: str, visual_source: str) -> dict[str, dict[str, dict[str, str]]]:
    start = parse_profile_table(visual_source, "START_PROFILE_OVERRIDES")
    controls = parse_profile_table(visual_source, "CONTROL_COPY")
    texts = parse_profile_table(visual_source, "TEXT_OVERRIDES")
    profile_texts = parse_profile_table(visual_source, "PROFILE_TEXT_OVERRIDES")
    system_routes = parse_profile_table(visual_source, "SYSTEM_ROUTE_OVERRIDES")
    combined = parse_string_object(balanced_block(visual_source, "const COMBINED_RESPECT_COPY = Object.freeze("))
    deltas = parse_format_delta_templates(visual_source)

    bindings: dict[str, dict[str, dict[str, str]]] = {}

    def bind(text_id: str, profile: str, value: str | None, surface: str) -> None:
        bindings.setdefault(text_id, {})[profile] = {"actual": value, "surface": surface}

    start_key = {
        "start.title": "title",
        "start.birth_digits_label": "birth_digits_label",
        "start.profile_helper": "profile_helper",
        "start.continue": "start_action",
        "start.rules": "rules_action",
        "start.async_value": "async_value",
        "start.no_simultaneous_required": "no_simultaneous_required",
    }
    control_key = {
        "chat.placeholder": "chatPlaceholder",
        "chat.send": "chatSend",
        "dm.header": "dmHeader",
        "panel.battles": "battlesHeader",
        "panel.events": "eventsHeader",
        "dm.placeholder": "dmPlaceholder",
        "dm.send": "dmSend",
        "battle.attack_badge": "attackBadge",
        "battle.defense_badge": "defenseBadge",
        "battle.opponent_argument": "opponentArgLabel",
        "battle.my_answer": "ownDefenseLabel",
    }
    text_key = {
        "battle.accept": "battle_action_accept",
        "battle.decline": "battle_action_decline",
        "battle.attack_action": "battle_action_attack",
        "battle.report": "battle_action_report",
        "battle.rematch": "battle_action_rematch",
        "cost.confirm_generic": "cost_confirm_generic",
        "battle.boost_action": "battle_boost_action",
        "argument.reroll_action": "argument_reroll_action",
        "hint.weakness_action": "hint_weakness_action",
        "conflict.intervene_action": "conflict_intervene_action",
        "npc.force_event_action": "npc_force_event_action",
        "dismiss.action": "dismiss_action",
        "report.false_repeat": "report_false_repeat",
        "empty.dm": "dm_empty",
        "empty.events": "events_empty",
        "empty.battles": "battles_empty",
        "result.win": "result_win",
        "result.loss": "result_loss",
        "result.draw": "result_draw",
        "vote.majority": "vote_majority",
        "vote.minority": "vote_minority",
    }
    profile_text_key = {
        "economy.not_enough_money": "not_enough_money",
        "economy.not_enough_rep": "not_enough_stars",
        "economy.purchase_success": "purchase_success",
        "rep.recovered": "reputation_recovered",
        "respect.gained": "respect_gained",
    }
    system_key = {
        "event.joined": "systemEvents.joined",
        "event.moved": "systemEvents.moved",
        "event.battle_challenge": "systemEvents.battleChallenge",
        "event.npc_battle_start": "systemEvents.npcBattleStart",
        "unlock.black": "systemEvents.unlockBlack",
    }

    for profile in PROFILES:
        for text_id, key in start_key.items():
            bind(text_id, profile, start.get(profile, {}).get(key), f"START_PROFILE_OVERRIDES.{profile}.{key} -> Data.START_SCREEN_PROFILE_TEXTS")
        for text_id, key in control_key.items():
            bind(text_id, profile, controls.get(profile, {}).get(key), f"CONTROL_COPY.{profile}.{key}")
        for text_id, key in text_key.items():
            bind(text_id, profile, texts.get(profile, {}).get(key), f"TEXT_OVERRIDES.{profile}.{key}")
        for text_id, key in profile_text_key.items():
            bind(text_id, profile, profile_texts.get(profile, {}).get(key), f"PROFILE_TEXT_OVERRIDES.{profile}.{key}")
        for text_id, key in system_key.items():
            bind(text_id, profile, system_routes.get(profile, {}).get(key), f"SYSTEM_ROUTE_OVERRIDES.{profile}.{key}")

        bind("toast.money_gain", profile, deltas.get(profile, {}).get("points", {}).get("gain"), f"formatDelta.{profile}.points.gain")
        bind("toast.money_loss", profile, deltas.get(profile, {}).get("points", {}).get("loss"), f"formatDelta.{profile}.points.loss")
        bind("toast.rep_gain", profile, deltas.get(profile, {}).get("rep", {}).get("gain"), f"formatDelta.{profile}.rep.gain")
        bind("toast.rep_loss", profile, deltas.get(profile, {}).get("rep", {}).get("loss"), f"formatDelta.{profile}.rep.loss")
        bind("toast.influence_gain", profile, deltas.get(profile, {}).get("influence", {}).get("gain"), f"formatDelta.{profile}.influence.gain")
        bind("toast.combined_respect", profile, combined.get(profile), f"COMBINED_RESPECT_COPY.{profile}")

    return bindings


def validate_exact_runtime_rows(frozen: dict[str, object], data_source: str, visual_source: str) -> list[dict[str, object]]:
    actual = actual_runtime_bindings(data_source, visual_source)
    mismatches: list[dict[str, object]] = []
    for row in flatten_expected(frozen):
        text_id = row["text_id"]
        for profile in PROFILES:
            expected = row[profile]
            info = actual.get(text_id, {}).get(profile, {"actual": None, "surface": "UNMAPPED"})
            if info["actual"] != expected:
                mismatches.append({
                    "text_id": text_id,
                    "profile": profile,
                    "expected": expected,
                    "actual": info["actual"],
                    "surface": info["surface"],
                })
    return mismatches


def main() -> None:
    raw = FROZEN_JSON.read_bytes()
    actual_sha = hashlib.sha256(raw).hexdigest()
    if actual_sha != FROZEN_SHA256:
        print(json.dumps({"ok": False, "error": "frozen_json_sha256_changed", "actual": actual_sha}, ensure_ascii=False))
        raise SystemExit(1)

    frozen_blob = None
    try:
        import subprocess
        frozen_blob = subprocess.check_output(["git", "hash-object", str(FROZEN_JSON)], cwd=ROOT, text=True).strip()
    except Exception as exc:  # pragma: no cover - surfaced in command output
        print(json.dumps({"ok": False, "error": "frozen_json_blob_check_failed", "detail": str(exc)}, ensure_ascii=False))
        raise SystemExit(1)
    if frozen_blob != FROZEN_BLOB:
        print(json.dumps({"ok": False, "error": "frozen_json_blob_changed", "actual": frozen_blob}, ensure_ascii=False))
        raise SystemExit(1)

    frozen = json.loads(raw)
    if "sha256" in frozen or "frozen_json_sha256" in frozen:
        print(json.dumps({"ok": False, "error": "self_hash_field_present", "keys": sorted(frozen.keys())}, ensure_ascii=False))
        raise SystemExit(1)

    coverage = frozen["coverage"]
    semantic = coverage["semantic_families"]
    for family, expected_count in (("A", 16), ("B", 14), ("C", 14)):
        rows = semantic[family]
        if len(rows) != expected_count:
            print(json.dumps({"ok": False, "error": "coverage_count", "family": family, "actual": len(rows), "expected": expected_count}, ensure_ascii=False))
            raise SystemExit(1)
        for row in rows:
            for profile in PROFILES:
                if profile not in row or not str(row[profile]):
                    print(json.dumps({"ok": False, "error": "missing_profile_value", "family": family, "text_id": row.get("text_id"), "profile": profile}, ensure_ascii=False))
                    raise SystemExit(1)

    if len(frozen["shared_intentionally"]) != 4:
        print(json.dumps({"ok": False, "error": "shared_accessibility_count", "actual": len(frozen["shared_intentionally"])}, ensure_ascii=False))
        raise SystemExit(1)
    if len(frozen["excluded_rows"]) != 6:
        print(json.dumps({"ok": False, "error": "excluded_row_count", "actual": len(frozen["excluded_rows"])}, ensure_ascii=False))
        raise SystemExit(1)

    data = read("AsyncScene/Web/data.js")
    system = read("AsyncScene/Web/system.js")
    visual = read("AsyncScene/Web/ui/ui-profile-visual-tone-repair.js")

    static_failures = []
    if 'supported: Object.freeze(["default", "boomer", "genX", "millennial", "zoomer", "alpha"])' not in data:
        static_failures.append({"error": "supported_profile_registry"})
    if 'min: 1965, max: 1980, profile: "genX"' not in data:
        static_failures.append({"error": "genx_birth_band"})
    if 'if (normalized === "genX") return "genX";' not in data:
        static_failures.append({"error": "genx_text_routing"})
    if 'profile === "genx" ? "genX" : profile' not in system:
        static_failures.append({"error": "system_genx_route"})
    if 'const PROFILE_KEYS = Object.freeze(["boomer", "genX", "millennial", "zoomer", "alpha"])' not in visual:
        static_failures.append({"error": "visual_profile_keys"})
    if (
        'const canonicalizeUiProfileId = (profile) => {' not in data
        or 'const supported = UI_PROFILE_REGISTRY.supported.find((value) => String(value).toLowerCase() === lowered);' not in data
        or 'return supported || lowered;' not in data
        or 'const value = canonicalizeUiProfileId(profile);' not in data
        or 'if (UI_PROFILE_REGISTRY.supported.includes(value)) return value;' not in data
    ):
        static_failures.append({"error": "future_hook_genx_canonicalization_missing", "surface": "UI_PROFILE_FUTURE_HOOK.resolve"})

    mismatches = validate_exact_runtime_rows(frozen, data, visual)
    if static_failures or mismatches:
        print(json.dumps({
            "ok": False,
            "error": "frozen_runtime_mismatch",
            "static_failures": static_failures,
            "unresolved_mismatch_count": len(mismatches),
            "mismatches": mismatches,
        }, ensure_ascii=False, indent=2))
        raise SystemExit(1)

    for row in coverage["npc_visible_role_labels"]:
        for profile in PROFILES:
            if row[profile] not in visual:
                print(json.dumps({"ok": False, "error": "npc_role_label_missing", "role": row["role"], "profile": profile, "value": row[profile]}, ensure_ascii=False))
                raise SystemExit(1)

    core = read("AsyncScene/Web/ui/ui-core.js")
    if "HIDE_DISABLED_P2P_BLOCK_UNTIL_FEATURE_ENABLED" not in core or "Почему?" in core:
        print(json.dumps({"ok": False, "error": "p2p_hidden_check_failed"}, ensure_ascii=False))
        raise SystemExit(1)
    dm = read("AsyncScene/Web/ui/ui-dm.js")
    if "if (!p2pEnabled) return;" not in dm:
        print(json.dumps({"ok": False, "error": "p2p_dm_controls_not_hidden"}, ensure_ascii=False))
        raise SystemExit(1)

    for source, mirror in BYTE_PARITY_MIRRORS:
        if (ROOT / source).read_bytes() != (ROOT / mirror).read_bytes():
            print(json.dumps({"ok": False, "error": "mirror_mismatch", "source": source, "mirror": mirror}, ensure_ascii=False))
            raise SystemExit(1)
    boot_source = read("AsyncScene/Web/ui/ui-boot.js")
    boot_docs = read("docs/ui/ui-boot.js")
    for literal in (
        'const mode = low === "genx" ? "genX"',
        'const tables = { boomer, genX, millennial, zoomer, alpha };',
        'birth_digits_label: "Две последние цифры года рождения"',
        'async_value: "асинхронная игра · играй когда хочешь"',
    ):
        if literal not in boot_source or literal not in boot_docs:
            print(json.dumps({"ok": False, "error": "ui_boot_targeted_mirror_missing", "literal": literal}, ensure_ascii=False))
            raise SystemExit(1)

    active_npc_arrest = []
    for path in list((ROOT / "AsyncScene/Web").rglob("*.js")) + list((ROOT / "docs").rglob("*.js")):
        rel = path.relative_to(ROOT).as_posix()
        if "npcArrest" in path.read_text(encoding="utf-8") and rel not in ACTIVE_NPC_ARREST_ALLOWLIST:
            active_npc_arrest.append(rel)
    if active_npc_arrest:
        print(json.dumps({"ok": False, "error": "npc_arrest_active_callsites", "paths": active_npc_arrest}, ensure_ascii=False))
        raise SystemExit(1)

    print(json.dumps({
        "ok": True,
        "status": "PASS stage6_step9_runtime_static_validation",
        "frozen_json_sha256": actual_sha,
        "frozen_json_blob": frozen_blob,
        "profiles": list(PROFILES),
        "coverage": "A16,B14,C14",
        "unresolved_mismatch_count": 0,
        "npc_roles": ["BANDIT", "TOXIC", "COP", "CROWD", "MAFIA"],
        "p2p_hidden": True,
        "npcArrest_active_template_gate": "preserved",
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
