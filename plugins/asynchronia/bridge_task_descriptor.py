"""Derive selector task descriptions from authoritative slot-local bridge artifacts."""

from __future__ import annotations

import hashlib
import json
import re
import subprocess
from dataclasses import dataclass
from pathlib import Path, PurePosixPath
from typing import Callable, Mapping

from .model_selector import AuthorizationError, TaskDescriptionError

HEADER_RE = re.compile(r"^(?P<key>[A-Z][A-Z0-9_]*):\s*(?P<value>.*)$")
PROFILE_VERSION = "BRIDGE_TASK_PROFILE_1"

NO_MAIN_DELTA_PROFILE: dict[str, str] = {
    "runtimeSensitivity": "low",
    "architectureImpact": "high",
    "securityImpact": "high",
    "economyImpact": "low",
    "releaseImpact": "medium",
    "validationComplexity": "high",
    "expectedImplementationSize": "small",
    "ambiguityNovelty": "low",
    "concurrencyBranchRisk": "critical",
}

NO_MAIN_DELTA_REASONS: dict[str, str] = {
    "runtimeSensitivity": "RUNTIME_SCOPE is NONE_INFRASTRUCTURE_ONLY and runtime or game writes are forbidden.",
    "architectureImpact": "The task exercises bridge control-plane authorization and publication contracts.",
    "securityImpact": "The task can publish to a remote mailbox ref and must preserve same-thread authorization.",
    "economyImpact": "The frozen scope contains no economy, ledger, balance, or settlement files.",
    "releaseImpact": "The task publishes infrastructure evidence but does not release product runtime code.",
    "validationComplexity": "Acceptance requires identity agreement, ref readback, exact paths, and cross-slot immutability proof.",
    "expectedImplementationSize": "The frozen mutation scope contains exactly one outbox and one receipt.",
    "ambiguityNovelty": "The claim type and canary scope are registered and exact; unknown claim types fail closed.",
    "concurrencyBranchRisk": "The task must prove that two independent mailbox refs did not move while publishing one slot.",
}

STAGE_6_TASK_PROFILE: dict[str, str] = {
    "runtimeSensitivity": "high",
    "architectureImpact": "high",
    "securityImpact": "high",
    "economyImpact": "medium",
    "releaseImpact": "medium",
    "validationComplexity": "high",
    "expectedImplementationSize": "medium",
    "ambiguityNovelty": "medium",
    "concurrencyBranchRisk": "critical",
}

STAGE_6_TASK_REASONS: dict[str, str] = {
    "runtimeSensitivity": "The issuing authority explicitly names a Stage 6 task lane; runtime semantics remain outside this descriptor.",
    "architectureImpact": "The registered profile may change project-owned files while preserving bridge identity and branch isolation.",
    "securityImpact": "The task still requires same-thread model authorization and cannot write main or mailbox control-plane files.",
    "economyImpact": "The bridge layer does not infer economy behavior; the authority-owned scope is the only project surface admitted.",
    "releaseImpact": "The task is a project implementation lane and does not itself publish product release artifacts.",
    "validationComplexity": "Acceptance requires selector identity, exact scope, branch lineage, continuation, and task-local validation evidence.",
    "expectedImplementationSize": "The authority-owned write scope determines the implementation surface; the registered profile uses the medium-size class.",
    "ambiguityNovelty": "Only the exact registered profile and authority-supplied objective and scopes are accepted.",
    "concurrencyBranchRisk": "Stage 6 lanes require dedicated bridge/<slot>/<thread-id> branches and collision-free slot-local execution.",
}

REGISTERED_REAL_BRIDGE_PROFILES: dict[str, dict[str, object]] = {
    "STAGE_6_TASK_LANE": {
        "task": STAGE_6_TASK_PROFILE,
        "reasons": STAGE_6_TASK_REASONS,
        "runtimeScope": "STAGE_6_TASK_LANE",
        "affectedSystems": ["bridge-control-plane-authorization", "task-branch-execution", "stage-6-lane-isolation"],
    },
}

REGISTERED_BRIDGE_TASK_TYPES = frozenset(
    {"NO_MAIN_DELTA_TRANSPORT_CANARY", "BRIDGE_TRANSPORT_CANARY", *REGISTERED_REAL_BRIDGE_PROFILES}
)
RESERVED_BRIDGE_TASK_TYPES = REGISTERED_BRIDGE_TASK_TYPES
BRIDGE_TASK_TYPE_PREFIXES = ("BRIDGE_", "STAGE_6_")
COMPLETED_EPOCH_STATUSES = frozenset(
    {"COMPLETED", "PASS_TASK_BRANCH_PUSHED", "PASS_VERIFIED_NO_DELTA", "ACCEPTED", "DONE"}
)


@dataclass(frozen=True)
class BridgeTaskDescriptor:
    task: Mapping[str, object]
    evidence: Mapping[str, object]
    state: Mapping[str, str]
    claim: Mapping[str, str]
    inbox: Mapping[str, str]

    def render_evidence(self) -> str:
        lines = [
            "task descriptor source: BRIDGE_AUTHORITY_DERIVED",
            f"task profile: {self.evidence['profileVersion']}",
            f"mailbox ref: {self.evidence['mailboxRef']}",
            f"mailbox head: {self.evidence['mailboxHead']}",
            f"state path: {self.evidence['statePath']}",
            f"inbox path: {self.evidence['inboxPath']}",
            f"claim path: {self.evidence['claimPath']}",
            f"descriptor input hash: {self.evidence['inputHash']}",
            "deterministic task classification:",
        ]
        reasons = self.evidence["classificationReasons"]
        for field in reasons:
            lines.append(f"- {field}: {self.task[field]}; reason={reasons[field]}")
        return "\n".join(lines)


def parse_bridge_headers(text: str, label: str) -> dict[str, str]:
    headers: dict[str, str] = {}
    for line in text.splitlines():
        match = HEADER_RE.match(line)
        if not match:
            continue
        key = match.group("key")
        value = match.group("value").strip()
        if key in headers:
            raise TaskDescriptionError(f"duplicate {key} in {label}")
        headers[key] = value
    if not headers:
        raise TaskDescriptionError(f"no bridge headers found in {label}")
    return headers


def _required(headers: Mapping[str, str], key: str, label: str) -> str:
    value = headers.get(key)
    if not value:
        raise TaskDescriptionError(f"missing {key} in {label}")
    return value


def _same(field: str, sources: Mapping[str, Mapping[str, str]]) -> str:
    values = {label: _required(headers, field, label) for label, headers in sources.items()}
    unique = set(values.values())
    if len(unique) != 1:
        raise TaskDescriptionError(f"bridge identity mismatch for {field}: {values}")
    return next(iter(unique))


def _sha256_text(text: str) -> str:
    return "sha256:" + hashlib.sha256(text.encode("utf-8")).hexdigest()


def _canonical_hash(value: object) -> str:
    encoded = json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode("utf-8")
    return "sha256:" + hashlib.sha256(encoded).hexdigest()


def _same_scope(field: str, sources: Mapping[str, Mapping[str, str]]) -> list[str]:
    raw = _same(field, sources)
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise TaskDescriptionError(f"{field} must be a JSON array") from exc
    if not isinstance(parsed, list) or any(not isinstance(item, str) or not item.strip() for item in parsed):
        raise TaskDescriptionError(f"{field} must be a JSON array of non-empty strings")
    values = [item.strip() for item in parsed]
    if len(values) != len(set(values)):
        raise TaskDescriptionError(f"duplicate path in {field}")
    for value in values:
        path = PurePosixPath(value)
        if path.is_absolute() or ".." in path.parts or ".ai-bridge" in path.parts or ".git" in path.parts:
            raise TaskDescriptionError(f"{field} contains a forbidden path: {value}")
    return values


def _bool_true(value: str, field: str) -> None:
    if value.lower() != "true":
        raise TaskDescriptionError(f"{field} must be true")


def _canonical_mailbox_ref(slot: int) -> str:
    if slot not in (1, 2, 3):
        raise TaskDescriptionError("slot must be 1, 2, or 3")
    return f"coordination/chatgpt-codex-bridge-{slot}"


def _normalize_mailbox_ref(slot: int, mailbox_ref: str) -> tuple[str, str]:
    canonical = _canonical_mailbox_ref(slot)
    if mailbox_ref == canonical:
        return canonical, canonical
    if mailbox_ref == f"origin/{canonical}":
        return canonical, mailbox_ref
    raise TaskDescriptionError(f"mailbox ref must be {canonical} or origin/{canonical}")


def derive_bridge_task_from_texts(
    *,
    slot: int,
    mailbox_ref: str,
    mailbox_head: str,
    selected_branch: str,
    baseline: str,
    thread_id: str,
    state_text: str,
    claim_text: str,
    inbox_text: str,
    state_path: str = ".ai-bridge/STATE.md",
) -> BridgeTaskDescriptor:
    canonical_mailbox, display_mailbox = _normalize_mailbox_ref(slot, mailbox_ref)
    state = parse_bridge_headers(state_text, "STATE")
    claim = parse_bridge_headers(claim_text, "claim")
    inbox = parse_bridge_headers(inbox_text, "inbox")
    sources = {"STATE": state, "claim": claim, "inbox": inbox}

    if state.get("STATUS") in COMPLETED_EPOCH_STATUSES:
        raise TaskDescriptionError(
            f"COMPLETED_BRIDGE_EPOCH_REISSUE_REQUIRED: STATUS={state['STATUS']} is terminal"
        )

    for field in ("TASK_ID", "SLOT", "THREAD", "GENERATION", "BRANCH_TASK", "EXECUTION_EPOCH", "NONCE", "AUTHORIZED_BASELINE"):
        _same(field, sources)
    if int(_required(state, "SLOT", "STATE")) != slot:
        raise TaskDescriptionError("requested slot does not match STATE")
    if _required(state, "THREAD", "STATE") != thread_id:
        raise TaskDescriptionError("requested thread does not match STATE")
    expected_branch = f"bridge/{slot}/{thread_id}"
    if selected_branch != expected_branch:
        raise TaskDescriptionError(f"selected branch must be {expected_branch}")
    if _required(state, "BRANCH_TASK", "STATE") != selected_branch:
        raise TaskDescriptionError("selected branch does not match STATE")
    if _required(state, "AUTHORIZED_BASELINE", "STATE") != baseline:
        raise TaskDescriptionError("baseline does not match STATE")
    if _required(state, "BRANCH_MAILBOX", "STATE") != canonical_mailbox:
        raise TaskDescriptionError("STATE mailbox branch does not match selected slot")
    if _required(inbox, "MAILBOX_OWNERSHIP", "inbox") != canonical_mailbox:
        raise TaskDescriptionError("inbox mailbox ownership does not match selected slot")

    inbox_path = _required(state, "INBOX", "STATE")
    claim_path = _required(state, "CLAIM", "STATE")
    expected_outbox = _required(state, "EXPECTED_OUTBOX", "STATE")
    expected_receipt = _required(state, "EXPECTED_RECEIPT", "STATE")
    if _required(claim, "INBOX", "claim") != inbox_path:
        raise TaskDescriptionError("claim inbox path does not match STATE")
    if _required(claim, "EXPECTED_OUTBOX", "claim") != expected_outbox:
        raise TaskDescriptionError("claim outbox path does not match STATE")
    if _required(claim, "EXPECTED_RECEIPT", "claim") != expected_receipt:
        raise TaskDescriptionError("claim receipt path does not match STATE")
    if expected_outbox not in inbox_text or expected_receipt not in inbox_text:
        raise TaskDescriptionError("inbox prose does not contain the frozen output paths")

    claim_type = _required(claim, "CLAIM_TYPE", "claim")
    if claim_type != "NO_MAIN_DELTA_TRANSPORT_CANARY" and claim_type not in REGISTERED_REAL_BRIDGE_PROFILES:
        raise TaskDescriptionError(f"unregistered bridge task profile: CLAIM_TYPE={claim_type}")

    for label, headers in sources.items():
        if _required(headers, "STATUS", label) != "READY_FOR_MODEL_PREFLIGHT":
            raise TaskDescriptionError(f"{label} is not READY_FOR_MODEL_PREFLIGHT")
        if _required(headers, "CONTINUATION_STATUS", label) != "SAME_THREAD_CONTINUE_REQUIRED":
            raise TaskDescriptionError(f"{label} does not require same-thread continuation")
        if claim_type == "NO_MAIN_DELTA_TRANSPORT_CANARY":
            _bool_true(_required(headers, "ALLOW_VERIFIED_NO_DELTA", label), f"{label}.ALLOW_VERIFIED_NO_DELTA")
            if _required(headers, "STAGE_6_STATUS", label) != "PAUSED_BY_USER":
                raise TaskDescriptionError(f"{label} does not preserve the Stage 6 pause")
        elif _required(headers, "ALLOW_VERIFIED_NO_DELTA", label).lower() != "false":
            raise TaskDescriptionError(f"{label}.ALLOW_VERIFIED_NO_DELTA must be false for a real task lane")
        _bool_true(_required(headers, "NO_MAIN_WRITE", label), f"{label}.NO_MAIN_WRITE")

    if _required(state, "MODEL_PREFLIGHT_STATUS", "STATE") != "REQUIRED":
        raise TaskDescriptionError("STATE does not require model preflight")
    if claim_type == "NO_MAIN_DELTA_TRANSPORT_CANARY" and _required(state, "RUNTIME_SCOPE", "STATE") != "NONE_INFRASTRUCTURE_ONLY":
        raise TaskDescriptionError("unsupported runtime scope for no-main-delta canary")

    if claim_type == "NO_MAIN_DELTA_TRANSPORT_CANARY":
        canary_scope = _required(claim, "CANARY_SCOPE", "claim")
        if canary_scope != "NO_MAIN_DELTA_TRANSPORT":
            raise TaskDescriptionError(
                f"unregistered bridge task profile: CLAIM_TYPE={claim_type}, CANARY_SCOPE={canary_scope}"
            )
        objective = (
            f"Verify Slot {slot} no-main-delta bridge transport authority at mailbox head {mailbox_head} "
            "and publish only the frozen slot-local outbox and receipt after complete model authorization."
        )
        read_scope = [
            "AGENTS.override.md",
            "AGENTS.md",
            "PROCESS_ROOT_SYNC.md",
            "ORCHESTRATION.md",
            "BRIDGE.md",
            "BRIDGE_PUBLICATION_POLICY.md",
            f"{display_mailbox}@{mailbox_head}:.ai-bridge/PUBLICATION_POLICY.md",
            f"{display_mailbox}@{mailbox_head}:{inbox_path}",
            f"{display_mailbox}@{mailbox_head}:{claim_path}",
            f"origin/main@{baseline}",
            f"{selected_branch}@{baseline}",
            f"policy:{PROFILE_VERSION}",
        ]
        write_scope = [expected_outbox, expected_receipt]
        classification = NO_MAIN_DELTA_PROFILE
        classification_reasons = NO_MAIN_DELTA_REASONS
        affected_systems = ["bridge-control-plane", f"slot-{slot}-mailbox-publication", "model-selector-authorization"]
    else:
        profile = REGISTERED_REAL_BRIDGE_PROFILES.get(claim_type)
        if profile is None:
            raise TaskDescriptionError(f"unregistered bridge task profile: CLAIM_TYPE={claim_type}")
        profile_name = _same("BRIDGE_TASK_PROFILE", sources)
        if profile_name != claim_type:
            raise TaskDescriptionError(
                f"bridge task profile mismatch: CLAIM_TYPE={claim_type}, BRIDGE_TASK_PROFILE={profile_name}"
            )
        for field, expected in {
            "RUNTIME_SCOPE": profile["runtimeScope"],
            "ALLOW_VERIFIED_NO_DELTA": "false",
            "NO_MAIN_WRITE": "true",
        }.items():
            if _same(field, sources) != expected:
                raise TaskDescriptionError(f"registered profile {claim_type} requires {field}: {expected}")
        for label, headers in sources.items():
            if _required(headers, "STAGE_6_STATUS", label) not in {"AUTHORIZED_BY_USER", "ACTIVE_BY_USER"}:
                raise TaskDescriptionError(f"{label}.STAGE_6_STATUS must be AUTHORIZED_BY_USER or ACTIVE_BY_USER")
        objective = _same("OBJECTIVE", sources)
        read_scope = _same_scope("READ_SCOPE", sources)
        write_scope = _same_scope("WRITE_SCOPE", sources)
        classification = profile["task"]
        classification_reasons = profile["reasons"]
        affected_systems = profile["affectedSystems"]

    task: dict[str, object] = {
        "taskId": _required(state, "TASK_ID", "STATE"),
        "taskType": claim_type,
        "objective": objective,
        "readScope": [
            "AGENTS.override.md",
            "AGENTS.md",
            "PROCESS_ROOT_SYNC.md",
            "ORCHESTRATION.md",
            "BRIDGE.md",
            "BRIDGE_PUBLICATION_POLICY.md",
            f"{display_mailbox}@{mailbox_head}:.ai-bridge/PUBLICATION_POLICY.md",
            f"{display_mailbox}@{mailbox_head}:{state_path}",
            f"{display_mailbox}@{mailbox_head}:{inbox_path}",
            f"{display_mailbox}@{mailbox_head}:{claim_path}",
            f"origin/main@{baseline}",
            f"{selected_branch}@{baseline}",
            f"policy:{PROFILE_VERSION}",
            *read_scope,
        ],
        "writeScope": write_scope,
        "affectedSystems": affected_systems,
        **classification,
    }
    evidence: dict[str, object] = {
        "profileVersion": PROFILE_VERSION,
        "mailboxRef": display_mailbox,
        "mailboxHead": mailbox_head,
        "statePath": state_path,
        "inboxPath": inbox_path,
        "claimPath": claim_path,
        "stateSha256": _sha256_text(state_text),
        "claimSha256": _sha256_text(claim_text),
        "inboxSha256": _sha256_text(inbox_text),
        "classificationReasons": dict(classification_reasons),
    }
    evidence["inputHash"] = _canonical_hash(
        {
            "slot": slot,
            "mailboxRef": display_mailbox,
            "mailboxHead": mailbox_head,
            "selectedBranch": selected_branch,
            "baseline": baseline,
            "threadId": thread_id,
            "state": evidence["stateSha256"],
            "claim": evidence["claimSha256"],
            "inbox": evidence["inboxSha256"],
            "profileVersion": PROFILE_VERSION,
        }
    )
    return BridgeTaskDescriptor(task, evidence, state, claim, inbox)


def _git(root: Path, *args: str) -> str:
    try:
        result = subprocess.run(["git", "-C", str(root), *args], check=True, capture_output=True, text=True)
    except (OSError, subprocess.CalledProcessError) as exc:
        stderr = getattr(exc, "stderr", "") or ""
        raise AuthorizationError(f"git {' '.join(args)} failed: {stderr.strip()}") from exc
    return result.stdout.strip()


def derive_bridge_task(
    *,
    slot: int,
    mailbox_ref: str,
    selected_branch: str,
    baseline: str,
    thread_id: str,
    repository_root: Path,
    reader: Callable[[str, str], str] | None = None,
    execution_phase: str = "start",
) -> BridgeTaskDescriptor:
    if execution_phase not in {"start", "continuation"}:
        raise TaskDescriptionError("execution phase must be start or continuation")
    canonical_mailbox, display_mailbox = _normalize_mailbox_ref(slot, mailbox_ref)
    mailbox_head = _git(repository_root, "rev-parse", display_mailbox)
    main_head = _git(repository_root, "rev-parse", "origin/main")
    task_head = _git(repository_root, "rev-parse", selected_branch)
    if main_head != baseline and execution_phase == "start":
        raise TaskDescriptionError(
            "STALE_BRIDGE_AUTHORITY_REISSUE_REQUIRED: "
            f"origin/main head {main_head} does not match authorized baseline {baseline}; "
            f"fresh bridge-start requires origin/main={baseline} and a newly issued epoch"
        )
    if task_head != baseline:
        raise TaskDescriptionError(f"task branch head {task_head} does not match authorized baseline {baseline}")

    def default_reader(ref: str, path: str) -> str:
        return _git(repository_root, "show", f"{ref}:{path}")

    read = reader or default_reader
    state_path = ".ai-bridge/STATE.md"
    state_text = read(display_mailbox, state_path)
    state_headers = parse_bridge_headers(state_text, "STATE")
    if _required(state_headers, "BRANCH_MAILBOX", "STATE") != canonical_mailbox:
        raise TaskDescriptionError("STATE mailbox branch does not match selected slot")
    inbox_path = _required(state_headers, "INBOX", "STATE")
    claim_path = _required(state_headers, "CLAIM", "STATE")
    expected_outbox = _required(state_headers, "EXPECTED_OUTBOX", "STATE")
    expected_receipt = _required(state_headers, "EXPECTED_RECEIPT", "STATE")
    descriptor = derive_bridge_task_from_texts(
        slot=slot,
        mailbox_ref=display_mailbox,
        mailbox_head=mailbox_head,
        selected_branch=selected_branch,
        baseline=baseline,
        thread_id=thread_id,
        state_text=state_text,
        claim_text=read(display_mailbox, claim_path),
        inbox_text=read(display_mailbox, inbox_path),
        state_path=state_path,
    )
    completed = []
    for artifact_path in (expected_outbox, expected_receipt):
        try:
            read(display_mailbox, artifact_path)
        except (AuthorizationError, TaskDescriptionError, OSError, KeyError):
            continue
        completed.append(artifact_path)
    if completed:
        raise TaskDescriptionError(
            "COMPLETED_BRIDGE_EPOCH_REISSUE_REQUIRED: expected completion artifact exists: "
            + ", ".join(completed)
        )
    return descriptor
