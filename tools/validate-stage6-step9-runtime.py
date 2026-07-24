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
PROFILES = ("boomer", "genX", "millennial", "zoomer", "alpha")
TOUCHED_MIRRORS = (
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


def fail(code: str, detail: object) -> None:
    print(f"FAIL {code}: {detail}", file=sys.stderr)
    raise SystemExit(1)


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def assert_contains(path: str, needle: str) -> None:
    text = read(path)
    if needle not in text:
        fail("missing_literal", {"path": path, "needle": needle})


def placeholders(value: str) -> set[str]:
    return set(re.findall(r"\{[A-Za-z0-9_]+\}", value))


def main() -> None:
    raw = FROZEN_JSON.read_bytes()
    actual_sha = hashlib.sha256(raw).hexdigest()
    if actual_sha != FROZEN_SHA256:
        fail("frozen_json_sha256_changed", actual_sha)

    frozen = json.loads(raw)
    if "sha256" in frozen or "frozen_json_sha256" in frozen:
      fail("self_hash_field_present", sorted(frozen.keys()))

    coverage = frozen["coverage"]
    semantic = coverage["semantic_families"]
    for family, expected_count in (("A", 16), ("B", 14), ("C", 14)):
        rows = semantic[family]
        if len(rows) != expected_count:
            fail("coverage_count", {"family": family, "actual": len(rows), "expected": expected_count})
        for row in rows:
            for profile in PROFILES:
                if profile not in row or not str(row[profile]):
                    fail("missing_profile_value", {"family": family, "text_id": row.get("text_id"), "profile": profile})

    shared_rows = frozen["shared_intentionally"]
    if len(shared_rows) != 4:
        fail("shared_accessibility_count", len(shared_rows))
    excluded_rows = frozen["excluded_rows"]
    if len(excluded_rows) != 6:
        fail("excluded_row_count", len(excluded_rows))

    data = read("AsyncScene/Web/data.js")
    if 'supported: Object.freeze(["default", "boomer", "genX", "millennial", "zoomer", "alpha"])' not in data:
        fail("supported_profile_registry", "genX/five-profile registry not found")
    if 'min: 1965, max: 1980, profile: "genX"' not in data:
        fail("genx_birth_band", "1965-1980 not found")
    if 'if (normalized === "genX") return "genX";' not in data:
        fail("genx_text_routing", "explicit genX routing missing")

    system = read("AsyncScene/Web/system.js")
    if 'profile === "genx" ? "genX" : profile' not in system:
        fail("system_genx_route", "system profile canonicalization missing")

    visual = read("AsyncScene/Web/ui/ui-profile-visual-tone-repair.js")
    if 'const PROFILE_KEYS = Object.freeze(["boomer", "genX", "millennial", "zoomer", "alpha"])' not in visual:
        fail("visual_profile_keys", "five profile keys missing")
    for row in semantic["A"] + semantic["B"] + semantic["C"]:
        for profile in PROFILES:
            value = row[profile]
            if placeholders(value) and value not in visual:
                fail("placeholder_row_not_bound", {"text_id": row["text_id"], "profile": profile, "value": value})
    for literal in (
        "Личка",
        "Стычки",
        "асинхронная игра · играй когда хочешь",
        "−1💰 / цели +1⭐",
        "опять мимо 💀 −{rep}⭐",
    ):
        if literal not in visual and literal not in data:
            fail("frozen_literal_missing", literal)
    for row in coverage["npc_visible_role_labels"]:
        for profile in PROFILES:
            if row[profile] not in visual:
                fail("npc_role_label_missing", {"role": row["role"], "profile": profile, "value": row[profile]})

    core = read("AsyncScene/Web/ui/ui-core.js")
    if "HIDE_DISABLED_P2P_BLOCK_UNTIL_FEATURE_ENABLED" not in core:
        fail("p2p_hidden_marker_missing", "ui-core")
    if "Почему?" in core:
        fail("p2p_dead_why_exposed", "ui-core")
    dm = read("AsyncScene/Web/ui/ui-dm.js")
    if "if (!p2pEnabled) return;" not in dm:
        fail("p2p_dm_controls_not_hidden", "ui-dm")

    for source, mirror in TOUCHED_MIRRORS:
        source_bytes = (ROOT / source).read_bytes()
        mirror_bytes = (ROOT / mirror).read_bytes()
        if source_bytes != mirror_bytes:
            fail("mirror_mismatch", {"source": source, "mirror": mirror})
    boot_source = read("AsyncScene/Web/ui/ui-boot.js")
    boot_docs = read("docs/ui/ui-boot.js")
    for literal in (
        'const mode = low === "genx" ? "genX"',
        'const tables = { boomer, genX, millennial, zoomer, alpha };',
        'birth_digits_label: "Две последние цифры года рождения"',
        'async_value: "асинхронная игра · играй когда хочешь"',
    ):
        if literal not in boot_source or literal not in boot_docs:
            fail("ui_boot_targeted_mirror_missing", literal)

    active_npc_arrest = []
    for path in list((ROOT / "AsyncScene/Web").rglob("*.js")) + list((ROOT / "docs").rglob("*.js")):
        rel = path.relative_to(ROOT).as_posix()
        text = path.read_text(encoding="utf-8")
        if "npcArrest" in text and rel not in ACTIVE_NPC_ARREST_ALLOWLIST:
            active_npc_arrest.append(rel)
    if active_npc_arrest:
        fail("npc_arrest_active_callsites", active_npc_arrest)

    print("PASS stage6_step9_runtime_static_validation")
    print(f"frozen_json_sha256={actual_sha}")
    print("profiles=" + ",".join(PROFILES))
    print("coverage=A16,B14,C14")
    print("npc_roles=BANDIT,TOXIC,COP,CROWD,MAFIA")
    print("p2p_hidden=true")
    print("npcArrest_active_template_gate=preserved")


if __name__ == "__main__":
    main()
