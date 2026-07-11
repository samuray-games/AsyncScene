#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def require(text: str, needle: str, label: str, failures: list[str]) -> None:
    if needle not in text:
        failures.append(f"MISSING {label}: {needle}")


def forbid(text: str, needle: str, label: str, failures: list[str]) -> None:
    if needle in text:
        failures.append(f"FORBIDDEN {label}: {needle}")


def main() -> int:
    failures: list[str] = []

    override = read("AGENTS.override.md")
    selector = read("plugins/asynchronia/skills/model-selector/SKILL.md")
    manifest_text = read("plugins/asynchronia/.codex-plugin/plugin.json")

    try:
        manifest = json.loads(manifest_text)
    except json.JSONDecodeError as exc:
        failures.append(f"INVALID plugin.json: {exc}")
        manifest = {}

    required_override = [
        "PLUGIN_AUTO_ROUTING: REQUIRED",
        "MODEL_PREFLIGHT_PAUSE: REQUIRED",
        "## 11. Mandatory automatic Asynchronia plugin preflight",
        "status `WAITING_FOR_MODEL_SELECTION`",
        "only content is `CONTINUE`",
        "FAIL_IMPLEMENTED_BEFORE_CONTINUE",
        "repository skill source under `plugins/asynchronia/skills/` as the mandatory fallback",
    ]
    for item in required_override:
        require(override, item, "AGENTS.override.md contract", failures)

    required_selector = [
        "Use this skill automatically for every Asynchronia task",
        "WAITING_FOR_MODEL_SELECTION",
        "CONTINUE_RECEIVED",
        "IMPLEMENTATION_ALLOWED",
        "same Codex conversation",
        "FAIL_MODEL_PREFLIGHT_NOT_PAUSED",
        "FAIL_CONTINUE_BLOCK_MISSING",
        "FAIL_IMPLEMENTED_BEFORE_CONTINUE",
        "FAIL_PLUGIN_ROUTING_SKIPPED",
        "evaluated pair count: `12/12`",
        "actual active model: `USER_SELECTED_UNVERIFIED`",
        "```text\nCONTINUE\n```",
    ]
    for item in required_selector:
        require(selector, item, "model-selector contract", failures)

    forbidden_selector = [
        "informational only and must never create a pause",
        "must never create a pause, stop, continuation token, or execution prerequisite",
        "it is not a required approval stop",
    ]
    for item in forbidden_selector:
        forbid(selector, item, "obsolete non-blocking contract", failures)

    if manifest.get("name") != "asynchronia":
        failures.append("plugin name must be asynchronia")
    if manifest.get("version") != "1.0.6":
        failures.append("plugin version must be 1.0.6")
    if manifest.get("skills") != "./skills/":
        failures.append("plugin skills path must remain ./skills/")

    interface = manifest.get("interface") or {}
    capabilities = interface.get("capabilities") or []
    for capability in [
        "Automatic repository task routing",
        "Mandatory blocking model preflight",
        "Same-thread CONTINUE resume contract",
    ]:
        if capability not in capabilities:
            failures.append(f"missing manifest capability: {capability}")

    prompts = "\n".join(interface.get("defaultPrompt") or [])
    require(prompts, "mandatory model preflight", "manifest default prompt", failures)
    require(prompts, "same-thread CONTINUE", "manifest default prompt", failures)

    if failures:
        print("FAIL_AUTO_MODEL_PREFLIGHT")
        for failure in failures:
            print(f"- {failure}")
        return 1

    print("PASS_AUTO_MODEL_PREFLIGHT")
    print("pluginVersion=1.0.6")
    print("pluginAutoRouting=REQUIRED")
    print("modelPreflightPause=REQUIRED")
    print("resumeToken=CONTINUE")
    print("sameThreadRequired=true")
    return 0


if __name__ == "__main__":
    sys.exit(main())
