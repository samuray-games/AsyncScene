#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

ROOT = Path(__file__).resolve().parents[1]
EXPECTED_PLUGIN_VERSION = "1.0.7"


def read(rel_path: str) -> str:
    return (ROOT / rel_path).read_text(encoding="utf-8")


def read_json(rel_path: str) -> object:
    return json.loads(read(rel_path))


@dataclass(frozen=True)
class TextContract:
    path: str
    required: tuple[str, ...]
    forbidden: tuple[str, ...] = ()


@dataclass(frozen=True)
class ResumeAttempt:
    thread: str
    token: str
    task: str
    scope: tuple[str, ...]
    baseline: str
    claim: str
    blocked: bool = False
    authority_verified: bool = False


@dataclass(frozen=True)
class ResumeResult:
    status: str
    implementation_allowed: bool
    repeated_preflight: bool
    failure_mode: str | None = None


class PreflightContract:
    VALID_THREAD = "BRIDGE-20260711-087"
    VALID_TASK = "TASK-ASYNCHRONIA-PREFLIGHT-RESIDUAL-SYNC"
    VALID_SCOPE = (
        "AGENTS.md",
        "ORCHESTRATION.md",
        "BRIDGE.md",
        "CODEX_BRIDGE_BOOTSTRAP.md",
        "CODEX_BRIDGE_RECOVERY.md",
        ".agents/plugins/marketplace.json",
        "plugins/asynchronia/.codex-plugin/plugin.json",
        "plugins/asynchronia/skills/task-router/SKILL.md",
        "plugins/asynchronia/skills/acceptance-pipeline-controller/SKILL.md",
        "plugins/asynchronia/skills/pipeline-state-and-resume-contract/SKILL.md",
        "tools/validate-asynchronia-auto-model-preflight.py",
    )
    VALID_BASELINE = "26493abe8b66dfe29b0dd799129c1f11acb77238"
    VALID_CLAIM = ".ai-bridge/claims/BRIDGE-20260711-087-claim-v1-codex.md"
    VALID_TOKEN = "CONTINUE"

    def __init__(self) -> None:
        self.state = "NEW_TASK"
        self.mutation_started = False

    def start_discovery(self) -> None:
        if self.state != "NEW_TASK":
            raise ValueError("invalid transition: NEW_TASK -> PREFLIGHT_DISCOVERY only")
        self.state = "PREFLIGHT_DISCOVERY"

    def pause_for_model_selection(self) -> None:
        if self.state != "PREFLIGHT_DISCOVERY":
            raise ValueError(
                "invalid transition: PREFLIGHT_DISCOVERY -> WAITING_FOR_MODEL_SELECTION only"
            )
        self.state = "WAITING_FOR_MODEL_SELECTION"

    def resume(self, attempt: ResumeAttempt) -> ResumeResult:
        if self.state == "IMPLEMENTATION_ALLOWED":
            return ResumeResult(
                status="ALREADY_RESUMED",
                implementation_allowed=False,
                repeated_preflight=False,
                failure_mode="second resume attempt after implementation start",
            )
        if self.state != "WAITING_FOR_MODEL_SELECTION":
            return ResumeResult(
                status="REJECTED_WRONG_STATE",
                implementation_allowed=False,
                repeated_preflight=False,
                failure_mode="resume is only legal from WAITING_FOR_MODEL_SELECTION",
            )
        if attempt.blocked:
            return ResumeResult(
                status="REJECTED_BLOCKED_STATE",
                implementation_allowed=False,
                repeated_preflight=False,
                failure_mode="blocked responses cannot resume and cannot contain CONTINUE",
            )

        if any(ch in attempt.token for ch in ('"', "'", "`")):
            return ResumeResult(
                status="REJECTED_QUOTED_TOKEN",
                implementation_allowed=False,
                repeated_preflight=False,
                failure_mode="quoted token",
            )
        if re.search(r"\S+\s+CONTINUE|CONTINUE\s+\S+", attempt.token):
            return ResumeResult(
                status="REJECTED_EMBEDDED_TOKEN",
                implementation_allowed=False,
                repeated_preflight=False,
                failure_mode="embedded token",
            )
        normalized = attempt.token.strip()
        if normalized != self.VALID_TOKEN:
            return ResumeResult(
                status="REJECTED_WRONG_TOKEN",
                implementation_allowed=False,
                repeated_preflight=False,
                failure_mode="wrong token",
            )

        if (
            attempt.thread != self.VALID_THREAD
            or attempt.task != self.VALID_TASK
            or tuple(attempt.scope) != self.VALID_SCOPE
            or attempt.baseline != self.VALID_BASELINE
            or attempt.claim != self.VALID_CLAIM
        ):
            return ResumeResult(
                status="STALE_RECOMMENDATION",
                implementation_allowed=False,
                repeated_preflight=True,
                failure_mode="changed thread, task, scope, baseline, or claim",
            )
        if not attempt.authority_verified:
            return ResumeResult(
                status="REJECTED_AUTHORITY_NOT_REFRESHED",
                implementation_allowed=False,
                repeated_preflight=False,
                failure_mode="fresh authority verification before first mutation is missing",
            )

        self.state = "IMPLEMENTATION_ALLOWED"
        self.mutation_started = False
        return ResumeResult(
            status="IMPLEMENTATION_ALLOWED",
            implementation_allowed=True,
            repeated_preflight=False,
        )

    def start_mutation(self) -> None:
        if self.state != "IMPLEMENTATION_ALLOWED":
            raise ValueError("no mutable action before exact same-thread CONTINUE")
        self.mutation_started = True


def assert_true(condition: bool, message: str, failures: list[str]) -> None:
    if not condition:
        failures.append(message)


def validate_text_contract(contract: TextContract, failures: list[str]) -> None:
    text = read(contract.path)
    for needle in contract.required:
        if needle not in text:
            failures.append(f"MISSING {contract.path}: {needle}")
    for needle in contract.forbidden:
        if needle in text:
            failures.append(f"FORBIDDEN {contract.path}: {needle}")


def validate_terminal_continue_block(failures: list[str]) -> None:
    samples = {
        "valid": "status: WAITING_FOR_MODEL_SELECTION\n\n```text\nCONTINUE\n```",
        "embedded": "status: WAITING_FOR_MODEL_SELECTION\n\n```text\nPLEASE CONTINUE\n```",
        "quoted": "status: WAITING_FOR_MODEL_SELECTION\n\n```text\n\"CONTINUE\"\n```",
        "trailing": "status: WAITING_FOR_MODEL_SELECTION\n\n```text\nCONTINUE\n```\nextra",
        "missing": "status: WAITING_FOR_MODEL_SELECTION",
    }
    pattern = re.compile(r"(?s)\A.*\n```[a-zA-Z0-9_-]*\nCONTINUE\n```\Z")
    assert_true(pattern.match(samples["valid"]) is not None, "valid fenced CONTINUE block must match", failures)
    for name in ("embedded", "quoted", "trailing", "missing"):
        assert_true(
            pattern.match(samples[name]) is None,
            f"{name} fenced CONTINUE sample must be rejected",
            failures,
        )


def validate_manifest_and_marketplace(failures: list[str]) -> dict[str, object]:
    manifest = read_json("plugins/asynchronia/.codex-plugin/plugin.json")
    marketplace = read_json(".agents/plugins/marketplace.json")
    assert_true(isinstance(manifest, dict), "plugin manifest must be a JSON object", failures)
    assert_true(isinstance(marketplace, dict), "marketplace manifest must be a JSON object", failures)
    if not isinstance(manifest, dict) or not isinstance(marketplace, dict):
        return {"manifest": manifest, "marketplace": marketplace}

    assert_true(manifest.get("name") == "asynchronia", "plugin manifest name must be asynchronia", failures)
    assert_true(
        manifest.get("version") == EXPECTED_PLUGIN_VERSION,
        f"plugin manifest version must be {EXPECTED_PLUGIN_VERSION}",
        failures,
    )
    assert_true(manifest.get("skills") == "./skills/", "plugin skills path must remain ./skills/", failures)

    plugins = marketplace.get("plugins")
    assert_true(isinstance(plugins, list), "marketplace plugins must be a list", failures)
    plugin_entry = None
    if isinstance(plugins, list):
        matches = [item for item in plugins if isinstance(item, dict) and item.get("name") == "asynchronia"]
        assert_true(len(matches) == 1, "marketplace must contain exactly one asynchronia entry", failures)
        if matches:
            plugin_entry = matches[0]

    if plugin_entry:
        assert_true(
            plugin_entry.get("version") == EXPECTED_PLUGIN_VERSION,
            f"marketplace version must be {EXPECTED_PLUGIN_VERSION}",
            failures,
        )
        source = plugin_entry.get("source")
        assert_true(isinstance(source, dict), "marketplace source must be an object", failures)
        if isinstance(source, dict):
            assert_true(source.get("source") == "local", "marketplace source.source must remain local", failures)
            assert_true(source.get("path") == "./plugins/asynchronia", "marketplace source.path must remain ./plugins/asynchronia", failures)

    interface = manifest.get("interface")
    assert_true(isinstance(interface, dict), "plugin interface must be an object", failures)
    if isinstance(interface, dict):
        capabilities = interface.get("capabilities")
        prompts = interface.get("defaultPrompt")
        assert_true(isinstance(capabilities, list), "manifest capabilities must be a list", failures)
        assert_true(isinstance(prompts, list), "manifest defaultPrompt must be a list", failures)
        if isinstance(capabilities, list):
            for capability in (
                "Automatic repository task routing",
                "Mandatory blocking model preflight",
                "Same-thread CONTINUE resume contract",
            ):
                assert_true(capability in capabilities, f"missing manifest capability: {capability}", failures)
        if isinstance(prompts, list):
            prompt_text = "\n".join(str(item) for item in prompts)
            for snippet in (
                "mandatory model preflight",
                "same-thread CONTINUE",
                "before any edits",
            ):
                assert_true(snippet in prompt_text, f"missing manifest prompt snippet: {snippet}", failures)

    return {"manifest": manifest, "marketplace": marketplace}


def validate_transition_contract(failures: list[str]) -> None:
    contract = PreflightContract()
    contract.start_discovery()
    contract.pause_for_model_selection()

    accepted = contract.resume(
        ResumeAttempt(
            thread=PreflightContract.VALID_THREAD,
            token="  CONTINUE  ",
            task=PreflightContract.VALID_TASK,
            scope=PreflightContract.VALID_SCOPE,
            baseline=PreflightContract.VALID_BASELINE,
            claim=PreflightContract.VALID_CLAIM,
            authority_verified=True,
        )
    )
    assert_true(accepted.status == "IMPLEMENTATION_ALLOWED", "trimmed exact CONTINUE must resume", failures)
    assert_true(accepted.implementation_allowed, "accepted CONTINUE must allow implementation", failures)

    contract.start_mutation()
    second = contract.resume(
        ResumeAttempt(
            thread=PreflightContract.VALID_THREAD,
            token="CONTINUE",
            task=PreflightContract.VALID_TASK,
            scope=PreflightContract.VALID_SCOPE,
            baseline=PreflightContract.VALID_BASELINE,
            claim=PreflightContract.VALID_CLAIM,
            authority_verified=True,
        )
    )
    assert_true(second.status == "ALREADY_RESUMED", "second resume attempt must not duplicate transition", failures)

    cases = {
        "wrong_thread": ResumeAttempt(
            thread="BRIDGE-OTHER",
            token="CONTINUE",
            task=PreflightContract.VALID_TASK,
            scope=PreflightContract.VALID_SCOPE,
            baseline=PreflightContract.VALID_BASELINE,
            claim=PreflightContract.VALID_CLAIM,
            authority_verified=True,
        ),
        "wrong_token": ResumeAttempt(
            thread=PreflightContract.VALID_THREAD,
            token="GO",
            task=PreflightContract.VALID_TASK,
            scope=PreflightContract.VALID_SCOPE,
            baseline=PreflightContract.VALID_BASELINE,
            claim=PreflightContract.VALID_CLAIM,
            authority_verified=True,
        ),
        "embedded_token": ResumeAttempt(
            thread=PreflightContract.VALID_THREAD,
            token="PLEASE CONTINUE",
            task=PreflightContract.VALID_TASK,
            scope=PreflightContract.VALID_SCOPE,
            baseline=PreflightContract.VALID_BASELINE,
            claim=PreflightContract.VALID_CLAIM,
            authority_verified=True,
        ),
        "quoted_token": ResumeAttempt(
            thread=PreflightContract.VALID_THREAD,
            token='"CONTINUE"',
            task=PreflightContract.VALID_TASK,
            scope=PreflightContract.VALID_SCOPE,
            baseline=PreflightContract.VALID_BASELINE,
            claim=PreflightContract.VALID_CLAIM,
            authority_verified=True,
        ),
        "blocked": ResumeAttempt(
            thread=PreflightContract.VALID_THREAD,
            token="CONTINUE",
            task=PreflightContract.VALID_TASK,
            scope=PreflightContract.VALID_SCOPE,
            baseline=PreflightContract.VALID_BASELINE,
            claim=PreflightContract.VALID_CLAIM,
            blocked=True,
            authority_verified=True,
        ),
        "changed_scope": ResumeAttempt(
            thread=PreflightContract.VALID_THREAD,
            token="CONTINUE",
            task=PreflightContract.VALID_TASK,
            scope=PreflightContract.VALID_SCOPE[:-1],
            baseline=PreflightContract.VALID_BASELINE,
            claim=PreflightContract.VALID_CLAIM,
            authority_verified=True,
        ),
        "changed_baseline": ResumeAttempt(
            thread=PreflightContract.VALID_THREAD,
            token="CONTINUE",
            task=PreflightContract.VALID_TASK,
            scope=PreflightContract.VALID_SCOPE,
            baseline="deadbeef",
            claim=PreflightContract.VALID_CLAIM,
            authority_verified=True,
        ),
        "changed_claim": ResumeAttempt(
            thread=PreflightContract.VALID_THREAD,
            token="CONTINUE",
            task=PreflightContract.VALID_TASK,
            scope=PreflightContract.VALID_SCOPE,
            baseline=PreflightContract.VALID_BASELINE,
            claim="other-claim",
            authority_verified=True,
        ),
        "authority_missing": ResumeAttempt(
            thread=PreflightContract.VALID_THREAD,
            token="CONTINUE",
            task=PreflightContract.VALID_TASK,
            scope=PreflightContract.VALID_SCOPE,
            baseline=PreflightContract.VALID_BASELINE,
            claim=PreflightContract.VALID_CLAIM,
            authority_verified=False,
        ),
    }
    expected_status = {
        "wrong_thread": "STALE_RECOMMENDATION",
        "wrong_token": "REJECTED_WRONG_TOKEN",
        "embedded_token": "REJECTED_EMBEDDED_TOKEN",
        "quoted_token": "REJECTED_QUOTED_TOKEN",
        "blocked": "REJECTED_BLOCKED_STATE",
        "changed_scope": "STALE_RECOMMENDATION",
        "changed_baseline": "STALE_RECOMMENDATION",
        "changed_claim": "STALE_RECOMMENDATION",
        "authority_missing": "REJECTED_AUTHORITY_NOT_REFRESHED",
    }
    for name, attempt in cases.items():
        case_contract = PreflightContract()
        case_contract.start_discovery()
        case_contract.pause_for_model_selection()
        result = case_contract.resume(attempt)
        assert_true(
            result.status == expected_status[name],
            f"{name} must yield {expected_status[name]}",
            failures,
        )

    blocked_contract = PreflightContract()
    blocked_contract.start_discovery()
    try:
        blocked_contract.start_mutation()
        failures.append("no mutable action before resume must raise")
    except ValueError:
        pass


def validate_texts(failures: list[str]) -> None:
    contracts: Iterable[TextContract] = (
        TextContract(
            "AGENTS.override.md",
            required=(
                "PLUGIN_AUTO_ROUTING: REQUIRED",
                "MODEL_PREFLIGHT_PAUSE: REQUIRED",
                "WAITING_FOR_MODEL_SELECTION",
                "same Codex conversation",
                "FAIL_MODEL_PREFLIGHT_NOT_PAUSED",
                "FAIL_IMPLEMENTED_BEFORE_CONTINUE",
                "repository skill source under `plugins/asynchronia/skills/` as the mandatory fallback",
            ),
        ),
        TextContract(
            "plugins/asynchronia/skills/model-selector/SKILL.md",
            required=(
                "Use this skill automatically for every Asynchronia task",
                "`WAITING_FOR_MODEL_SELECTION`",
                "`CONTINUE_RECEIVED`",
                "`IMPLEMENTATION_ALLOWED`",
                "actual active model: `USER_SELECTED_UNVERIFIED`",
            ),
            forbidden=(
                "must never create a pause, stop, continuation token, or execution prerequisite",
            ),
        ),
        TextContract(
            "AGENTS.md",
            required=(
                "blocking pre-implementation gate",
                "`WAITING_FOR_MODEL_SELECTION`",
                "exact same-thread `CONTINUE`",
            ),
            forbidden=(
                "informational and non-blocking, and it must not become an execution prerequisite, pause, or resume token",
            ),
        ),
        TextContract(
            "ORCHESTRATION.md",
            required=(
                "mandatory automatic model preflight",
                "exact same-thread `CONTINUE`",
                "`WAITING_FOR_MODEL_SELECTION`",
            ),
            forbidden=("no preflight or separate bridge token is required.",),
        ),
        TextContract(
            "BRIDGE.md",
            required=(
                "automatic model preflight",
                "exact same-thread `CONTINUE`",
                "Separate claim tokens are not required.",
            ),
            forbidden=("no preflight or continuation token is allowed.",),
        ),
        TextContract(
            "CODEX_BRIDGE_BOOTSTRAP.md",
            required=(
                "ASYNCHRONIA_CODEX_BRIDGE_ALIAS_V2_4",
                "WAITING_FOR_MODEL_SELECTION",
                "same-thread `CONTINUE`",
                "PASS_BRIDGE_ALIAS_V2_4_INSTALLED",
            ),
            forbidden=("SOURCE_PLUGIN_FALLBACK_BOOTSTRAP",),
        ),
        TextContract(
            "CODEX_BRIDGE_RECOVERY.md",
            required=(
                "ASYNCHRONIA_BRIDGE_RECOVERY_V2_4",
                "same-thread `CONTINUE`",
                "PASS_BRIDGE_ALIAS_V2_4_INSTALLED",
            ),
        ),
        TextContract(
            "plugins/asynchronia/skills/task-router/SKILL.md",
            required=(
                "blocking pre-implementation gate",
                "`WAITING_FOR_MODEL_SELECTION`",
                "same-thread fenced `CONTINUE` token",
            ),
            forbidden=(
                "it is not a required approval stop",
                "It must not originate, alter, or turn the recommendation into an execution prerequisite, pause, or resume token.",
            ),
        ),
        TextContract(
            "plugins/asynchronia/skills/acceptance-pipeline-controller/SKILL.md",
            required=(
                "blocking pre-implementation gate",
                "`WAITING_FOR_MODEL_SELECTION`",
                "exact same-thread `CONTINUE`",
            ),
            forbidden=(
                "Do not emit `WAITING_FOR_MODEL_SELECTION`, `CONTINUE`, or any equivalent pause for model selection.",
                "model-selector output is informational only and cannot authorize, pause, or resume the pipeline",
            ),
        ),
        TextContract(
            "plugins/asynchronia/skills/pipeline-state-and-resume-contract/SKILL.md",
            required=(
                "same-thread `CONTINUE` resume state",
                "blocking same-thread preflight gate",
                "reject stale or foreign resume attempts",
            ),
            forbidden=(
                "model recommendation evidence is serialized as evidence only and must not be represented as a blocking preflight gate",
            ),
        ),
    )
    for contract in contracts:
        validate_text_contract(contract, failures)


def main() -> int:
    failures: list[str] = []

    json_state = validate_manifest_and_marketplace(failures)
    validate_texts(failures)
    validate_transition_contract(failures)
    validate_terminal_continue_block(failures)

    if failures:
        print(
            json.dumps(
                {
                    "status": "FAIL_AUTO_MODEL_PREFLIGHT",
                    "expectedPluginVersion": EXPECTED_PLUGIN_VERSION,
                    "failureCount": len(failures),
                    "failures": failures,
                },
                indent=2,
            )
        )
        return 1

    print(
        json.dumps(
            {
                "status": "PASS_AUTO_MODEL_PREFLIGHT",
                "pluginVersion": EXPECTED_PLUGIN_VERSION,
                "manifestVersion": json_state["manifest"]["version"],
                "marketplaceVersion": json_state["marketplace"]["plugins"][0]["version"],
                "transitionContract": {
                    "newTaskToDiscovery": "PASS",
                    "discoveryToWaiting": "PASS",
                    "sameThreadContinue": "PASS",
                    "adversarialFixtures": "PASS",
                    "noMutationBeforeResume": "PASS",
                    "freshAuthorityBeforeMutation": "PASS",
                    "secondResumeNoDuplicate": "PASS",
                },
                "terminalContinueFence": "PASS",
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
