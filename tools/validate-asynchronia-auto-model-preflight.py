#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
import tempfile
from pathlib import Path

from chatgpt_live_host_inventory import (
    SOURCE_APP_SERVER,
    SOURCE_LIVE,
    SOURCE_SNAPSHOT,
    extract_inventory,
    locate_renderer_asset,
    parse_live_page,
)


ROOT = Path(__file__).resolve().parents[1]
EXPECTED_PLUGIN_VERSION = "1.0.10"


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def require(condition: bool, message: str, failures: list[str]) -> None:
    if not condition:
        failures.append(message)


def fixture_pages() -> list[object]:
    return [
        {"data": {"models": [
            {"model": "model-one", "hidden": False, "isDefault": True, "defaultReasoningEffort": "effort-a", "supportedReasoningEfforts": ["effort-a", "effort-b"]},
            {"model": "model-hidden", "hidden": True, "isDefault": False, "defaultReasoningEffort": "secret", "supportedReasoningEfforts": ["secret"]},
        ], "nextCursor": "page-two"}},
        {"data": {"models": [
            {"model": "model-two", "hidden": False, "isDefault": False, "defaultReasoningEffort": "effort-c", "supportedReasoningEfforts": [{"reasoningEffort": "effort-c"}, {"reasoningEffort": "effort-d"}]},
        ], "nextCursor": None}},
    ]


def consume(pages: list[object]):
    index = 0
    calls: list[dict[str, object]] = []

    def query(arguments: dict[str, object]) -> object:
        nonlocal index
        calls.append(arguments)
        value = pages[index]
        index += 1
        return value

    return query, calls


def validate_manifests(failures: list[str]) -> None:
    manifest = json.loads(read("plugins/asynchronia/.codex-plugin/plugin.json"))
    marketplace = json.loads(read(".agents/plugins/marketplace.json"))
    require(manifest.get("version") == EXPECTED_PLUGIN_VERSION, "manifest version mismatch", failures)
    entries = [entry for entry in marketplace.get("plugins", []) if entry.get("name") == "asynchronia"]
    require(len(entries) == 1 and entries[0].get("version") == EXPECTED_PLUGIN_VERSION, "marketplace version mismatch", failures)
    prompt = "\n".join(manifest.get("interface", {}).get("defaultPrompt", []))
    for token in ("list-models-for-host", "includeHidden true", "use_hidden_models", "raw/filtered hash", "same-thread CONTINUE"):
        require(token in prompt, f"manifest prompt missing {token}", failures)


def validate_skill_contract(failures: list[str]) -> None:
    selector = read("plugins/asynchronia/skills/model-selector/SKILL.md")
    agents = read("AGENTS.md")
    for text in (selector, agents):
        for token in ("list-models-for-host", "includeHidden: true", "use_hidden_models", "available_models", "default_model", "raw inventory hash", "filtered inventory hash", "BLOCKED_MODEL_INVENTORY_UNAVAILABLE", "CONTINUE"):
            require(token in text, f"live host contract missing {token}", failures)
    for stale in ("model/list", "codex app-server", "app-server-only models"):
        require(stale not in selector, f"stale selector authority remains: {stale}", failures)
    require("permanent renderer asset filenames are forbidden" in selector, "dynamic renderer guard missing", failures)
    require("selected model remains unchanged" in selector, "selected model mutation guard missing", failures)


def validate_response_parsing_and_pagination(failures: list[str]) -> None:
    entries, cursor = parse_live_page(fixture_pages()[0])
    require(cursor == "page-two" and entries[0].model == "model-one", "live response parsing failed", failures)
    query, calls = consume(fixture_pages())
    result = extract_inventory(host_id="host-current", query_page=query, settings={"available_models": True, "use_hidden_models": False, "default_model": "model-one"})
    require(result["status"] == "MODEL_INVENTORY_VERIFIED", "live source not verified", failures)
    require([item["model"] for item in result["completeInventory"]] == ["model-one", "model-hidden", "model-two"], "returned model order changed", failures)
    require(calls == [
        {"hostId": "host-current", "includeHidden": True, "cursor": None, "limit": 100},
        {"hostId": "host-current", "includeHidden": True, "cursor": "page-two", "limit": 100},
    ], "pagination query arguments changed", failures)
    require(result["visibleModelCount"] == 2, "visible model count is not dynamic", failures)
    require(result["supportedModelEffortPairCount"] == 4, "pair count is not dynamic", failures)
    require(result["candidateMatrix"] == [
        {"model": "model-one", "effort": "effort-a"},
        {"model": "model-one", "effort": "effort-b"},
        {"model": "model-two", "effort": "effort-c"},
        {"model": "model-two", "effort": "effort-d"},
    ], "per-model effort matrix changed", failures)
    require(result["selectedModelMutation"] == "NONE", "discovery changes the selected model", failures)
    require(result["rawInventoryHash"].startswith("sha256:") and result["filteredInventoryHash"].startswith("sha256:"), "inventory hashes missing", failures)


def validate_hidden_and_fallback_behavior(failures: list[str]) -> None:
    query, _ = consume(fixture_pages())
    hidden = extract_inventory(host_id="host-current", query_page=query, settings={"use_hidden_models": True})
    require(hidden["visibleModelCount"] == 3 and hidden["supportedModelEffortPairCount"] == 5, "use_hidden_models behavior failed", failures)
    query, _ = consume(fixture_pages())
    fallback = extract_inventory(host_id="host-current", query_page=query, settings={}, source=SOURCE_SNAPSHOT)
    require(fallback["status"] == "MODEL_INVENTORY_FALLBACK" and fallback["fallback"] is True, "fallback labeling failed", failures)
    query, _ = consume(fixture_pages())
    app_server_fallback = extract_inventory(host_id="host-current", query_page=query, settings={}, source=SOURCE_APP_SERVER)
    require(app_server_fallback["source"] == SOURCE_APP_SERVER and app_server_fallback["fallback"] is True, "app-server fallback labeling failed", failures)
    blocked = extract_inventory(host_id="host-current", query_page=None, settings={})
    require(blocked["status"] == "BLOCKED_MODEL_INVENTORY_UNAVAILABLE", "missing authority did not block", failures)


def validate_dynamic_renderer_locator(failures: list[str]) -> None:
    payload = b"const query='list-models-for-host'; const a='available_models'; const b='use_hidden_models';"
    header = {"files": {"webview": {"files": {"assets": {"files": {"dynamic-name.js": {"size": len(payload), "offset": "0"}}}}}}}
    encoded = json.dumps(header, separators=(",", ":")).encode("utf-8")
    header_size = 16 + len(encoded)
    with tempfile.TemporaryDirectory() as directory:
        asar = Path(directory) / "app.asar"
        asar.write_bytes(
            b"\x04\x00\x00\x00"
            + (header_size - 8).to_bytes(4, "little")
            + (header_size - 12).to_bytes(4, "little")
            + len(encoded).to_bytes(4, "little")
            + encoded
            + payload
        )
        require(locate_renderer_asset(asar) == "webview/assets/dynamic-name.js", "renderer was not located dynamically", failures)


def main() -> int:
    failures: list[str] = []
    validate_manifests(failures)
    validate_skill_contract(failures)
    validate_response_parsing_and_pagination(failures)
    validate_hidden_and_fallback_behavior(failures)
    validate_dynamic_renderer_locator(failures)
    if failures:
        print(json.dumps({"status": "FAIL_AUTO_MODEL_PREFLIGHT", "failures": failures}, indent=2))
        return 1
    print(json.dumps({
        "status": "PASS_AUTO_MODEL_PREFLIGHT",
        "pluginVersion": EXPECTED_PLUGIN_VERSION,
        "liveInventoryResponseParsing": "PASS",
        "pagination": "PASS",
        "hiddenFiltering": "PASS",
        "useHiddenModels": "PASS",
        "exactEffortPreservation": "PASS",
        "perModelEffortMatrix": "PASS",
        "dynamicCounts": "PASS",
        "noStaticCatalog": "PASS",
        "noFixedPairCount": "PASS",
        "sourceProvenance": "PASS",
        "rawAndFilteredHashes": "PASS",
        "fallbackLabeling": "PASS",
        "blockedWithoutAuthority": "PASS",
        "selectedModelUnchanged": "PASS",
        "preflightPause": "PASS",
    }, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
