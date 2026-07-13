#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXPECTED_PLUGIN_VERSION = "1.0.9"


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
    SURFACE = "codex-desktop"
    LAUNCH = "sha256:launch-and-inventory-snapshot"
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

    def record_app_server_catalog_evidence(self) -> None:
        if self.state != "MODEL_INVENTORY_DISCOVERY":
            raise ValueError("invalid app-server catalog transition")
        self.state = "APP_SERVER_CATALOG_EVIDENCE_RECORDED"

    def require_reconciliation(self) -> None:
        if self.state != "APP_SERVER_CATALOG_EVIDENCE_RECORDED":
            raise ValueError("invalid reconciliation transition")
        self.state = "MODEL_INVENTORY_RECONCILIATION_REQUIRED"

    def require_ui_inventory(self) -> None:
        if self.state != "MODEL_INVENTORY_RECONCILIATION_REQUIRED":
            raise ValueError("invalid UI request transition")
        self.state = "USER_UI_INVENTORY_REQUIRED"

    def receive_ui_inventory(self) -> None:
        if self.state != "USER_UI_INVENTORY_REQUIRED":
            raise ValueError("invalid UI receipt transition")
        self.state = "USER_UI_INVENTORY_RECEIVED"

    def verify_inventory(self) -> None:
        if self.state != "USER_UI_INVENTORY_RECEIVED":
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


@dataclass(frozen=True)
class UiInventory:
    thread: str
    surface: str
    task: str
    launch: str
    current: bool
    complete: bool
    models: tuple[tuple[str, tuple[str, ...]], ...]


@dataclass(frozen=True)
class ReconciliationResult:
    status: str
    source: str
    candidates: tuple[Candidate, ...] = ()


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


def build_ui_candidates(
    inventory: UiInventory,
    *,
    expected_thread: str,
    expected_surface: str,
    expected_task: str,
    expected_launch: str,
) -> list[Candidate]:
    if (
        inventory.thread != expected_thread
        or inventory.surface != expected_surface
        or inventory.task != expected_task
        or inventory.launch != expected_launch
        or not inventory.current
        or not inventory.complete
    ):
        raise ValueError("stale or incomplete UI inventory")
    result: list[Candidate] = []
    seen: set[tuple[str, str]] = set()
    for model_name, efforts in inventory.models:
        if not model_name or not efforts:
            raise ValueError("incomplete UI model inventory")
        for index, effort in enumerate(efforts):
            if not effort:
                raise ValueError("empty UI effort")
            key = (model_name, effort)
            if key in seen:
                raise ValueError("duplicate UI model-effort pair")
            seen.add(key)
            result.append(Candidate(model_name, effort, index))
    if not result:
        raise ValueError("empty UI candidate matrix")
    return result


def app_server_signature(inventory: list[dict[str, object]]) -> tuple[tuple[str, tuple[str, ...]], ...]:
    signature: list[tuple[str, tuple[str, ...]]] = []
    for model in inventory:
        if bool(model.get("hidden", False)):
            continue
        model_id = str(model.get("id", ""))
        efforts = model.get("supportedReasoningEfforts")
        if not isinstance(efforts, list):
            continue
        effort_ids = tuple(str(item.get("reasoningEffort", "")) for item in efforts if isinstance(item, dict))
        signature.append((model_id, effort_ids))
    return tuple(signature)


def reconcile_inventory(
    *,
    app_server_inventory: list[dict[str, object]] | None,
    app_server_error: str | None,
    ui_inventory: UiInventory | None,
    expected_thread: str,
    expected_surface: str,
    expected_task: str,
    expected_launch: str,
) -> ReconciliationResult:
    if app_server_inventory is None and not app_server_error:
        return ReconciliationResult("BLOCKED_MODEL_INVENTORY_UNAVAILABLE", "app-server-evidence-missing")
    if ui_inventory is None:
        if app_server_error:
            return ReconciliationResult("BLOCKED_MODEL_INVENTORY_UNAVAILABLE", "app-server-error")
        return ReconciliationResult("BLOCKED_MODEL_INVENTORY_MISMATCH", "ui-inventory-required")
    try:
        ui_candidates = build_ui_candidates(
            ui_inventory,
            expected_thread=expected_thread,
            expected_surface=expected_surface,
            expected_task=expected_task,
            expected_launch=expected_launch,
        )
    except ValueError:
        return ReconciliationResult("BLOCKED_MODEL_INVENTORY_MISMATCH", "stale-or-incomplete-ui-inventory")
    if app_server_error:
        return ReconciliationResult("MODEL_INVENTORY_VERIFIED", "user-confirmed-ui-after-app-server-error", tuple(ui_candidates))
    app_signature = app_server_signature(app_server_inventory or [])
    ui_signature = ui_inventory.models
    if app_signature == ui_signature:
        return ReconciliationResult("MODEL_INVENTORY_VERIFIED", "matched-app-server-and-ui", tuple(ui_candidates))
    return ReconciliationResult("MODEL_INVENTORY_VERIFIED", "user-confirmed-ui-reconciled-mismatch", tuple(ui_candidates))


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
        for needle in ("codex app-server", "model/list", "active Codex desktop UI picker", "app-server-only models", "authority-confirmed model-effort pair", "adjacent efforts", "same-thread CONTINUE"):
            require(needle in text, f"manifest prompt missing {needle}", failures)
    return {"manifest": manifest, "marketplace": marketplace}


def validate_live_contract(failures: list[str]) -> None:
    selector = read("plugins/asynchronia/skills/model-selector/SKILL.md")
    agents = read("AGENTS.md")
    for needle in (
        "MODEL_INVENTORY_DISCOVERY",
        "APP_SERVER_CATALOG_EVIDENCE_RECORDED",
        "MODEL_INVENTORY_RECONCILIATION_REQUIRED",
        "USER_UI_INVENTORY_REQUIRED",
        "USER_UI_INVENTORY_RECEIVED",
        "codex app-server",
        '"model/list"',
        '"includeHidden":false',
        "nextCursor",
        "supportedReasoningEfforts",
        "active desktop UI picker evidence controls actual selectability",
        "Never merge app-server-only models or efforts into a UI-authoritative matrix.",
        "User-confirmed UI inventory must be explicit, complete, current, same-thread, surface-specific",
        "Do not normalize `Light` to `low`, `Extra High` to `xhigh`",
        "evaluated model-effort pair count: N/N",
        "Mandatory adjacent-effort comparison",
        "lowest effort for that model that meets the reliability threshold",
        "MINIMIZE_EXPECTED_TOTAL_CREDITS_WITH_RETRY_RISK",
        "BLOCKED_MODEL_INVENTORY_UNAVAILABLE",
        "BLOCKED_MODEL_INVENTORY_MISMATCH",
        "FAIL_INCOMPLETE_PAIR_MATRIX",
        "FAIL_ADJACENT_EFFORT_COMPARISON_MISSING",
        "USER_SELECTED_UNVERIFIED",
    ):
        require(needle in selector, f"selector missing {needle}", failures)
    for needle in (
        "Static repository model whitelists, static effort whitelists, and fixed model-effort pair counts are forbidden.",
        "start the local `codex app-server` over stdio",
        "call `model/list` with `includeHidden: false` and follow every `nextCursor` page as supporting catalog evidence",
        "for Codex Desktop, treat actual active UI picker evidence as the authority for model and effort selectability",
        "MODEL_INVENTORY_RECONCILIATION_REQUIRED",
        "BLOCKED_MODEL_INVENTORY_MISMATCH",
        "Never add app-server-only models or efforts to a UI-authoritative candidate matrix.",
        "preserve UI display labels exactly",
        "complete matrix of every authority-confirmed model-effort pair",
        "immediately lower and higher authority-confirmed neighbor",
        "evaluated model-effort pair count: N/N",
        "MINIMIZE_EXPECTED_TOTAL_CREDITS_WITH_RETRY_RISK",
    ):
        require(needle in agents, f"AGENTS missing {needle}", failures)
    for stale in (
        "Available Codex models are exactly:",
        "Available reasoning levels are exactly Light, Medium, High and Extra High.",
        "Only these model names are valid:",
        "Only these reasoning levels are valid:",
        "use only picker-visible models returned by that live client",
        "model/list output alone is authoritative picker evidence",
        "evaluated pair count: `12/12`",
        "evaluated pair count: `18/18`",
    ):
        require(stale not in selector, f"stale selector text remains: {stale}", failures)
        require(stale not in agents, f"stale AGENTS text remains: {stale}", failures)
    require("no global cartesian product" in selector, "global cartesian product guard missing", failures)
    require("Do not invent an effort ordering from names." in selector, "live effort order guard missing", failures)
    require("static fallback catalog" not in selector.lower(), "static fallback catalog text introduced", failures)
    require("static model inventory" not in agents.lower(), "static model inventory text introduced", failures)


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


def validate_reconciliation_fixtures(failures: list[str]) -> None:
    thread = "thread-current"
    surface = "codex-desktop"
    task = "task-current"
    launch = "launch-current"
    app = [
        {"id": "ui-model-a", "hidden": False, "supportedReasoningEfforts": [{"reasoningEffort": "Light"}, {"reasoningEffort": "High"}]},
        {"id": "ui-model-b", "hidden": False, "supportedReasoningEfforts": [{"reasoningEffort": "Light"}, {"reasoningEffort": "Ultra"}]},
    ]
    matching_ui = UiInventory(thread, surface, task, launch, True, True, (("ui-model-a", ("Light", "High")), ("ui-model-b", ("Light", "Ultra"))))
    subset_ui = UiInventory(thread, surface, task, launch, True, True, (("ui-model-a", ("Light", "High")), ("ui-model-b", ("Light", "Ultra")), ("ui-model-c", ("Light", "Ultra"))))
    superset_app = app + [{"id": "server-only", "hidden": False, "supportedReasoningEfforts": [{"reasoningEffort": "High"}]}]
    stale_ui = UiInventory(thread, surface, task, launch, False, True, (("ui-model-a", ("Light", "High")),))
    incomplete_ui = UiInventory(thread, surface, task, launch, True, False, (("ui-model-a", ("Light", "High")),))
    cross_thread_ui = UiInventory("other-thread", surface, task, launch, True, True, (("ui-model-a", ("Light", "High")),))
    cross_task_ui = UiInventory(thread, surface, "other-task", launch, True, True, (("ui-model-a", ("Light", "High")),))
    wrong_launch_ui = UiInventory(thread, surface, task, "other-launch", True, True, (("ui-model-a", ("Light", "High")),))
    for name, result, expected_source, expected_count in (
        ("matching", reconcile_inventory(app_server_inventory=app, app_server_error=None, ui_inventory=matching_ui, expected_thread=thread, expected_surface=surface, expected_task=task, expected_launch=launch), "matched-app-server-and-ui", 4),
        ("app_subset", reconcile_inventory(app_server_inventory=app, app_server_error=None, ui_inventory=subset_ui, expected_thread=thread, expected_surface=surface, expected_task=task, expected_launch=launch), "user-confirmed-ui-reconciled-mismatch", 6),
        ("app_superset", reconcile_inventory(app_server_inventory=superset_app, app_server_error=None, ui_inventory=matching_ui, expected_thread=thread, expected_surface=surface, expected_task=task, expected_launch=launch), "user-confirmed-ui-reconciled-mismatch", 4),
        ("cache_error", reconcile_inventory(app_server_inventory=None, app_server_error="unknown variant max", ui_inventory=matching_ui, expected_thread=thread, expected_surface=surface, expected_task=task, expected_launch=launch), "user-confirmed-ui-after-app-server-error", 4),
    ):
        require(result.status == "MODEL_INVENTORY_VERIFIED", f"{name} did not verify inventory", failures)
        require(result.source == expected_source, f"{name} source mismatch", failures)
        require(len(result.candidates) == expected_count, f"{name} candidate count mismatch", failures)
    blocked = reconcile_inventory(app_server_inventory=app, app_server_error=None, ui_inventory=None, expected_thread=thread, expected_surface=surface, expected_task=task, expected_launch=launch)
    require(blocked.status == "BLOCKED_MODEL_INVENTORY_MISMATCH", "mismatch without UI inventory did not block", failures)
    missing_app_server = reconcile_inventory(app_server_inventory=None, app_server_error=None, ui_inventory=matching_ui, expected_thread=thread, expected_surface=surface, expected_task=task, expected_launch=launch)
    require(missing_app_server.status == "BLOCKED_MODEL_INVENTORY_UNAVAILABLE", "UI inventory without app-server evidence accepted", failures)
    cross_thread = reconcile_inventory(app_server_inventory=app, app_server_error=None, ui_inventory=cross_thread_ui, expected_thread=thread, expected_surface=surface, expected_task=task, expected_launch=launch)
    require(cross_thread.status == "BLOCKED_MODEL_INVENTORY_MISMATCH", "cross-thread UI inventory accepted", failures)
    cross_task = reconcile_inventory(app_server_inventory=app, app_server_error=None, ui_inventory=cross_task_ui, expected_thread=thread, expected_surface=surface, expected_task=task, expected_launch=launch)
    require(cross_task.status == "BLOCKED_MODEL_INVENTORY_MISMATCH", "cross-task UI inventory accepted", failures)
    wrong_launch = reconcile_inventory(app_server_inventory=app, app_server_error=None, ui_inventory=wrong_launch_ui, expected_thread=thread, expected_surface=surface, expected_task=task, expected_launch=launch)
    require(wrong_launch.status == "BLOCKED_MODEL_INVENTORY_MISMATCH", "wrong-launch UI inventory accepted", failures)
    incomplete = reconcile_inventory(app_server_inventory=app, app_server_error=None, ui_inventory=incomplete_ui, expected_thread=thread, expected_surface=surface, expected_task=task, expected_launch=launch)
    require(incomplete.status == "BLOCKED_MODEL_INVENTORY_MISMATCH", "incomplete UI inventory accepted", failures)
    stale = reconcile_inventory(app_server_inventory=app, app_server_error=None, ui_inventory=stale_ui, expected_thread=thread, expected_surface=surface, expected_task=task, expected_launch=launch)
    require(stale.status == "BLOCKED_MODEL_INVENTORY_MISMATCH", "stale cross-thread UI inventory accepted", failures)
    labels = [candidate.effort for candidate in reconcile_inventory(app_server_inventory=app, app_server_error=None, ui_inventory=matching_ui, expected_thread=thread, expected_surface=surface, expected_task=task, expected_launch=launch).candidates]
    require("Light" in labels and "High" in labels and "low" not in labels and "xhigh" not in labels, "UI labels were not preserved exactly", failures)


def validate_state_machine(failures: list[str]) -> None:
    contract = PreflightContract()
    contract.discover(); contract.record_app_server_catalog_evidence(); contract.require_reconciliation(); contract.require_ui_inventory(); contract.receive_ui_inventory(); contract.verify_inventory(); contract.analyze(); contract.pause()
    valid = ResumeAttempt(contract.THREAD, "  CONTINUE  ", contract.TASK, contract.SCOPE, contract.BASELINE, contract.CLAIM, contract.INVENTORY_HASH, authority_verified=True)
    status, allowed, repeated = contract.resume(valid)
    require((status, allowed, repeated) == ("IMPLEMENTATION_ALLOWED", True, False), "valid continuation rejected", failures)
    contract.mutate()
    direct = PreflightContract(); direct.discover()
    try:
        direct.verify_inventory()
        failures.append("direct discovery-to-verified transition accepted")
    except ValueError:
        pass
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
        test = PreflightContract(); test.discover(); test.record_app_server_catalog_evidence(); test.require_reconciliation(); test.require_ui_inventory(); test.receive_ui_inventory(); test.verify_inventory(); test.analyze(); test.pause()
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
    validate_reconciliation_fixtures(failures)
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
        "appServerCatalogEvidence": "PASS",
        "desktopUiPickerAuthority": "PASS",
        "uiMismatchReconciliation": "PASS",
        "directDiscoveryToVerifiedRejected": "PASS",
        "missingAppServerEvidenceRejected": "PASS",
        "crossTaskUiInventoryRejected": "PASS",
        "wrongLaunchUiInventoryRejected": "PASS",
        "staleUiInventoryRejected": "PASS",
        "incompleteUiInventoryRejected": "PASS",
        "exactUiLabelPreservation": "PASS",
        "noAppServerOnlyCandidates": "PASS",
        "completePairEnumeration": "PASS",
        "adjacentEffortComparison": "PASS",
        "retryAdjustedCostObjective": "PASS",
        "inventorySnapshotBoundResume": "PASS",
        "terminalContinueFence": "PASS"
    }, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
