#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXPECTED_PLUGIN_VERSION = "1.0.8"


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def read_json(path: str) -> object:
    return json.loads(read(path))


def require(condition: bool, message: str, failures: list[str]) -> None:
    if not condition:
        failures.append(message)


@dataclass(frozen=True)
class ResumeAttempt:
    thread: str
    token: str
    task: str
    scope: tuple[str, ...]
    baseline: str
    claim: str
    inventory_hash: str
    blocked: bool = False
    authority_verified: bool = False


class PreflightContract:
    THREAD = "BRIDGE-20260711-087"
    TASK = "TASK-ASYNCHRONIA-PREFLIGHT-RESIDUAL-SYNC"
    SCOPE = (
        "AGENTS.md",
        "plugins/asynchronia/skills/model-selector/SKILL.md",
        "tools/validate-asynchronia-auto-model-preflight.py",
    )
    BASELINE = "26493abe8b66dfe29b0dd799129c1f11acb77238"
    CLAIM = ".ai-bridge/claims/BRIDGE-20260711-087-claim-v1-codex.md"
    INVENTORY_HASH = "sha256:live-picker-visible-inventory"

    def __init__(self) -> None:
        self.state = "NEW_TASK"

    def discover(self) -> None:
        if self.state != "NEW_TASK":
            raise ValueError("invalid discovery transition")
        self.state = "MODEL_INVENTORY_DISCOVERY"

    def verify_inventory(self) -> None:
        if self.state != "MODEL_INVENTORY_DISCOVERY":
            raise ValueError("invalid inventory transition")
        self.state = "MODEL_INVENTORY_VERIFIED"

    def analyze(self) -> None:
        if self.state != "MODEL_INVENTORY_VERIFIED":
            raise ValueError("invalid analysis transition")
        self.state = "TASK_ANALYSIS_COMPLETE"

    def pause(self) -> None:
        if self.state != "TASK_ANALYSIS_COMPLETE":
            raise ValueError("invalid pause transition")
        self.state = "WAITING_FOR_MODEL_SELECTION"

    def resume(self, attempt: ResumeAttempt) -> tuple[str, bool, bool]:
        if self.state != "WAITING_FOR_MODEL_SELECTION":
            return "REJECTED_WRONG_STATE", False, False
        if attempt.blocked:
            return "REJECTED_BLOCKED_STATE", False, False
        if any(char in attempt.token for char in ('"', "'", "`")):
            return "REJECTED_QUOTED_TOKEN", False, False
        if re.search(r"\S+\s+CONTINUE|CONTINUE\s+\S+", attempt.token):
            return "REJECTED_EMBEDDED_TOKEN", False, False
        if attempt.token.strip() != "CONTINUE":
            return "REJECTED_WRONG_TOKEN", False, False
        if (
            attempt.thread != self.THREAD
            or attempt.task != self.TASK
            or attempt.scope != self.SCOPE
            or attempt.baseline != self.BASELINE
            or attempt.claim != self.CLAIM
            or attempt.inventory_hash != self.INVENTORY_HASH
        ):
            return "STALE_RECOMMENDATION", False, True
        if not attempt.authority_verified:
            return "REJECTED_AUTHORITY_NOT_REFRESHED", False, False
        self.state = "IMPLEMENTATION_ALLOWED"
        return "IMPLEMENTATION_ALLOWED", True, False

    def mutate(self) -> None:
        if self.state != "IMPLEMENTATION_ALLOWED":
            raise ValueError("no mutation before exact same-thread CONTINUE")


@dataclass(frozen=True)
class Candidate:
    model: str
    effort: str
    effort_index: int


def build_candidates(inventory: list[dict[str, object]]) -> list[Candidate]:
    result: list[Candidate] = []
    seen: set[tuple[str, str]] = set()
    for model in inventory:
        if bool(model.get("hidden", False)):
            continue
        model_id = str(model.get("id", ""))
        efforts = model.get("supportedReasoningEfforts")
        if not model_id or not isinstance(efforts, list) or not efforts:
            raise ValueError("incomplete visible model inventory")
        for index, item in enumerate(efforts):
            if not isinstance(item, dict):
                raise ValueError("malformed effort")
            effort = str(item.get("reasoningEffort", ""))
            key = (model_id, effort)
            if not effort or key in seen:
                raise ValueError("empty or duplicate model-effort pair")
            seen.add(key)
            result.append(Candidate(model_id, effort, index))
    if not result:
        raise ValueError("empty candidate matrix")
    return result


def adjacent_pairs(candidates: list[Candidate]) -> set[tuple[str, str, str]]:
    by_model: dict[str, list[Candidate]] = {}
    for candidate in candidates:
        by_model.setdefault(candidate.model, []).append(candidate)
    result: set[tuple[str, str, str]] = set()
    for model, values in by_model.items():
        ordered = sorted(values, key=lambda value: value.effort_index)
        result.update((model, lower.effort, higher.effort) for lower, higher in zip(ordered, ordered[1:]))
    return result


def validate_manifests(failures: list[str]) -> dict[str, object]:
    manifest = read_json("plugins/asynchronia/.codex-plugin/plugin.json")
    marketplace = read_json(".agents/plugins/marketplace.json")
    require(isinstance(manifest, dict), "manifest must be an object", failures)
    require(isinstance(marketplace, dict), "marketplace must be an object", failures)
    if not isinstance(manifest, dict) or not isinstance(marketplace, dict):
        return {"manifest": manifest, "marketplace": marketplace}
    require(manifest.get("name") == "asynchronia", "manifest name mismatch", failures)
    require(manifest.get("version") == EXPECTED_PLUGIN_VERSION, "manifest version mismatch", failures)
    require(manifest.get("skills") == "./skills/", "manifest skills path mismatch", failures)
    plugins = marketplace.get("plugins")
    entries = [item for item in plugins if isinstance(item, dict) and item.get("name") == "asynchronia"] if isinstance(plugins, list) else []
    require(len(entries) == 1, "marketplace must have one asynchronia entry", failures)
    if entries:
        require(entries[0].get("version") == EXPECTED_PLUGIN_VERSION, "marketplace version mismatch", failures)
        require(entries[0].get("source") == {"source": "local", "path": "./plugins/asynchronia"}, "marketplace source mismatch", failures)
    interface = manifest.get("interface")
    require(isinstance(interface, dict), "manifest interface missing", failures)
    if isinstance(interface, dict):
        text = "\n".join(str(value) for value in interface.get("defaultPrompt", []))
        for needle in ("codex app-server", "model/list", "supportedReasoningEfforts", "every available model-effort pair", "adjacent efforts", "same-thread CONTINUE"):
            require(needle in text, f"manifest prompt missing {needle}", failures)
    return {"manifest": manifest, "marketplace": marketplace}


def validate_live_contract(failures: list[str]) -> None:
    selector = read("plugins/asynchronia/skills/model-selector/SKILL.md")
    agents = read("AGENTS.md")
    for needle in (
        "MODEL_INVENTORY_DISCOVERY",
        "codex app-server",
        '"model/list"',
        '"includeHidden":false',
        "nextCursor",
        "supportedReasoningEfforts",
        "evaluated model-effort pair count: N/N",
        "Mandatory adjacent-effort comparison",
        "lowest effort for that model that meets the reliability threshold",
        "MINIMIZE_EXPECTED_TOTAL_CREDITS_WITH_RETRY_RISK",
        "BLOCKED_MODEL_INVENTORY_UNAVAILABLE",
        "FAIL_INCOMPLETE_PAIR_MATRIX",
        "FAIL_ADJACENT_EFFORT_COMPARISON_MISSING",
        "USER_SELECTED_UNVERIFIED",
    ):
        require(needle in selector, f"selector missing {needle}", failures)
    for needle in (
        "Static repository model whitelists, static effort whitelists, and fixed model-effort pair counts are forbidden.",
        "start the local `codex app-server` over stdio",
        "call `model/list` with `includeHidden: false`",
        "complete matrix of every returned model-effort pair",
        "immediately lower and higher returned neighbor",
        "evaluated model-effort pair count: N/N",
        "MINIMIZE_EXPECTED_TOTAL_CREDITS_WITH_RETRY_RISK",
    ):
        require(needle in agents, f"AGENTS missing {needle}", failures)
    for stale in (
        "Available Codex models are exactly:",
        "Available reasoning levels are exactly Light, Medium, High and Extra High.",
        "Only these model names are valid:",
        "Only these reasoning levels are valid:",
        "evaluated pair count: `12/12`",
        "evaluated pair count: `18/18`",
    ):
        require(stale not in selector, f"stale selector text remains: {stale}", failures)
        require(stale not in agents, f"stale AGENTS text remains: {stale}", failures)
    require("no global cartesian product" in selector, "global cartesian product guard missing", failures)
    require("Do not invent an effort ordering from names." in selector, "live effort order guard missing", failures)


def validate_matrix_fixture(failures: list[str]) -> None:
    inventory = [
        {"id": "a", "hidden": False, "supportedReasoningEfforts": [{"reasoningEffort": "low"}, {"reasoningEffort": "medium"}, {"reasoningEffort": "high"}]},
        {"id": "b", "hidden": False, "supportedReasoningEfforts": [{"reasoningEffort": "medium"}, {"reasoningEffort": "xhigh"}]},
        {"id": "hidden", "hidden": True, "supportedReasoningEfforts": [{"reasoningEffort": "high"}]},
    ]
    try:
        candidates = build_candidates(inventory)
    except ValueError as exc:
        failures.append(f"valid inventory rejected: {exc}")
        return
    require(len(candidates) == 5, "complete visible pair enumeration failed", failures)
    require(adjacent_pairs(candidates) == {("a", "low", "medium"), ("a", "medium", "high"), ("b", "medium", "xhigh")}, "adjacent effort ordering failed", failures)
    for invalid in (
        [{"id": "a", "hidden": False, "supportedReasoningEfforts": []}],
        [{"id": "", "hidden": False, "supportedReasoningEfforts": [{"reasoningEffort": "low"}]}],
        [{"id": "a", "hidden": False, "supportedReasoningEfforts": [{"reasoningEffort": "low"}, {"reasoningEffort": "low"}]}],
    ):
        try:
            build_candidates(invalid)
        except ValueError:
            pass
        else:
            failures.append("invalid inventory accepted")


def validate_state_machine(failures: list[str]) -> None:
    contract = PreflightContract()
    contract.discover(); contract.verify_inventory(); contract.analyze(); contract.pause()
    valid = ResumeAttempt(contract.THREAD, "  CONTINUE  ", contract.TASK, contract.SCOPE, contract.BASELINE, contract.CLAIM, contract.INVENTORY_HASH, authority_verified=True)
    status, allowed, repeated = contract.resume(valid)
    require((status, allowed, repeated) == ("IMPLEMENTATION_ALLOWED", True, False), "valid continuation rejected", failures)
    contract.mutate()
    variants = {
        "wrong_thread": {"thread": "other"},
        "wrong_task": {"task": "other"},
        "wrong_scope": {"scope": ("AGENTS.md",)},
        "wrong_baseline": {"baseline": "deadbeef"},
        "wrong_claim": {"claim": "other"},
        "wrong_inventory": {"inventory_hash": "sha256:stale"},
        "wrong_token": {"token": "GO"},
        "embedded": {"token": "PLEASE CONTINUE"},
        "quoted": {"token": '"CONTINUE"'},
        "blocked": {"blocked": True},
        "authority": {"authority_verified": False},
    }
    for name, changes in variants.items():
        data = dict(valid.__dict__); data.update(changes)
        test = PreflightContract(); test.discover(); test.verify_inventory(); test.analyze(); test.pause()
        status, allowed, repeated = test.resume(ResumeAttempt(**data))
        require(not allowed, f"{name} allowed implementation", failures)
        if name.startswith("wrong_") and name not in {"wrong_token"}:
            require(status == "STALE_RECOMMENDATION" and repeated, f"{name} did not invalidate recommendation", failures)
    pre = PreflightContract(); pre.discover()
    try:
        pre.mutate()
        failures.append("mutation before CONTINUE accepted")
    except ValueError:
        pass


def validate_terminal_fence(failures: list[str]) -> None:
    pattern = re.compile(r"(?s)\A.*\n```[a-zA-Z0-9_-]*\nCONTINUE\n```\Z")
    require(pattern.match("status: WAITING_FOR_MODEL_SELECTION\n\n```text\nCONTINUE\n```") is not None, "valid CONTINUE fence rejected", failures)
    for sample in ("status: WAITING_FOR_MODEL_SELECTION", "```text\nPLEASE CONTINUE\n```", "```text\n\"CONTINUE\"\n```", "```text\nCONTINUE\n```\nextra"):
        require(pattern.match(sample) is None, "invalid CONTINUE fence accepted", failures)


def main() -> int:
    failures: list[str] = []
    state = validate_manifests(failures)
    validate_live_contract(failures)
    validate_matrix_fixture(failures)
    validate_state_machine(failures)
    validate_terminal_fence(failures)
    if failures:
        print(json.dumps({"status": "FAIL_AUTO_MODEL_PREFLIGHT", "expectedPluginVersion": EXPECTED_PLUGIN_VERSION, "failureCount": len(failures), "failures": failures}, indent=2))
        return 1
    manifest = state["manifest"]
    marketplace = state["marketplace"]
    print(json.dumps({
        "status": "PASS_AUTO_MODEL_PREFLIGHT",
        "pluginVersion": EXPECTED_PLUGIN_VERSION,
        "manifestVersion": manifest["version"],
        "marketplaceVersion": marketplace["plugins"][0]["version"],
        "liveModelInventoryContract": "PASS",
        "pickerVisibleOnly": "PASS",
        "completePairEnumeration": "PASS",
        "adjacentEffortComparison": "PASS",
        "retryAdjustedCostObjective": "PASS",
        "inventorySnapshotBoundResume": "PASS",
        "terminalContinueFence": "PASS"
    }, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
