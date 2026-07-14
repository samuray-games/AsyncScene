"""Confirmed-snapshot model selection and durable same-thread authorization.

The production selector has one inventory authority: the user-confirmed snapshot
owned by the Asynchronia plugin. Runtime state is stored outside the repository.
No live Desktop or app-server inventory is consulted here.
"""

from __future__ import annotations

import hashlib
import json
import os
import re
import subprocess
import time
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable, Iterable, Mapping


SNAPSHOT_PATH = Path(__file__).with_name("snapshots") / "confirmed-model-effort-snapshot.json"
SNAPSHOT_STATUS = "USER_CONFIRMED"
SNAPSHOT_SCHEMA_VERSION = "1.0.10"
MAINTENANCE_TASK_ID = "TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20260714"
DEFAULT_STATE_DIR = Path(os.environ.get("ASYNCHRONIA_SELECTOR_STATE_DIR", Path.home() / ".asynchronia" / "model-selector-state"))
STATE_TTL_SECONDS = 24 * 60 * 60
IDENTIFIER = re.compile(r"^[a-z0-9][a-z0-9._-]*$")
REQUIRED_SNAPSHOT_FIELDS = {
    "schemaVersion", "snapshotRevision", "confirmedTimestamp", "confirmationSource",
    "applicationSurface", "models", "completeModelCount", "completeModelEffortPairCount",
    "canonicalContentHash", "status", "supersedes", "notes",
}
TASK_FIELDS = (
    "taskId", "taskType", "objective", "readScope", "writeScope", "affectedSystems",
    "runtimeSensitivity", "architectureImpact", "securityImpact", "economyImpact",
    "releaseImpact", "validationComplexity", "expectedImplementationSize",
    "ambiguityNovelty", "concurrencyBranchRisk",
)
LEVELS = {"low": 1, "medium": 2, "high": 3, "critical": 4}
SIZE_LEVELS = {"small": 1, "medium": 2, "large": 3, "very_large": 4}


class SnapshotError(ValueError):
    """Raised when a snapshot is malformed, stale, or not user-confirmed."""


class TaskDescriptionError(ValueError):
    """Raised when task-specific analysis input is absent or malformed."""


class AuthorizationError(ValueError):
    """Raised when durable preflight identity or freshness validation fails."""


@dataclass(frozen=True)
class Candidate:
    model: str
    effort: str
    ordinal: int


@dataclass(frozen=True)
class PairEvaluation:
    model: str
    effort: str
    verdict: str
    rejectionReason: str | None
    retryRisk: str
    escalationRisk: str
    costClass: str
    capabilityScore: int
    requiredScore: int


@dataclass(frozen=True)
class EvaluationReport:
    evaluations: tuple[PairEvaluation, ...]
    recommendation: PairEvaluation
    cheapestRejected: PairEvaluation | None
    nextMoreCapable: PairEvaluation | None
    matrixHash: str
    requiredScore: int


@dataclass(frozen=True)
class PreflightResult:
    status: str
    snapshot: Mapping[str, object]
    task: Mapping[str, object]
    candidates: tuple[Candidate, ...]
    report: EvaluationReport
    output: str
    thread_id: str | None = None


def _canonical_bytes(value: object) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode("utf-8")


def _sha256(value: object) -> str:
    return "sha256:" + hashlib.sha256(_canonical_bytes(value)).hexdigest()


def _canonical_snapshot_payload(snapshot: Mapping[str, object]) -> bytes:
    payload = dict(snapshot)
    payload.pop("canonicalContentHash", None)
    return _canonical_bytes(payload)


def canonical_hash(snapshot: Mapping[str, object]) -> str:
    return "sha256:" + hashlib.sha256(_canonical_snapshot_payload(snapshot)).hexdigest()


def _require_identifier(value: object, label: str) -> str:
    if not isinstance(value, str) or not IDENTIFIER.fullmatch(value):
        raise SnapshotError(f"invalid {label}: {value!r}")
    return value


def validate_snapshot(snapshot: Mapping[str, object], *, require_hash: bool = True) -> dict[str, object]:
    if not isinstance(snapshot, Mapping):
        raise SnapshotError("snapshot must be an object")
    if set(snapshot) != REQUIRED_SNAPSHOT_FIELDS:
        raise SnapshotError(f"snapshot fields mismatch; missing={sorted(REQUIRED_SNAPSHOT_FIELDS - set(snapshot))}, extra={sorted(set(snapshot) - REQUIRED_SNAPSHOT_FIELDS)}")
    if snapshot["schemaVersion"] != SNAPSHOT_SCHEMA_VERSION:
        raise SnapshotError("unsupported snapshot schema version")
    for field in ("snapshotRevision", "confirmedTimestamp", "confirmationSource", "applicationSurface"):
        if not isinstance(snapshot[field], str) or not snapshot[field].strip():
            raise SnapshotError(f"{field} must be a non-empty string")
    if snapshot["status"] != SNAPSHOT_STATUS:
        raise SnapshotError("snapshot is not USER_CONFIRMED")
    if snapshot["supersedes"] is not None and not isinstance(snapshot["supersedes"], str):
        raise SnapshotError("supersedes must be null or a string")
    if not isinstance(snapshot["notes"], list) or not snapshot["notes"] or not all(isinstance(note, str) and note.strip() for note in snapshot["notes"]):
        raise SnapshotError("notes must be a non-empty string list")
    models = snapshot["models"]
    if not isinstance(models, list) or not models:
        raise SnapshotError("models must be a non-empty ordered list")
    seen_models: set[str] = set()
    normalized_models: list[dict[str, object]] = []
    for model in models:
        if not isinstance(model, Mapping) or set(model) != {"modelIdentifier", "supportedEfforts"}:
            raise SnapshotError("each model must contain only modelIdentifier and supportedEfforts")
        model_id = _require_identifier(model["modelIdentifier"], "model identifier")
        if model_id in seen_models:
            raise SnapshotError(f"duplicate model identifier: {model_id}")
        seen_models.add(model_id)
        efforts = model["supportedEfforts"]
        if not isinstance(efforts, list) or not efforts:
            raise SnapshotError(f"empty effort list for model: {model_id}")
        seen_efforts: set[str] = set()
        ordered_efforts: list[str] = []
        for effort in efforts:
            effort_id = _require_identifier(effort, f"effort identifier for {model_id}")
            if effort_id in seen_efforts:
                raise SnapshotError(f"duplicate effort identifier for {model_id}: {effort_id}")
            seen_efforts.add(effort_id)
            ordered_efforts.append(effort_id)
        normalized_models.append({"modelIdentifier": model_id, "supportedEfforts": ordered_efforts})
    model_count = len(normalized_models)
    pair_count = sum(len(model["supportedEfforts"]) for model in normalized_models)
    if snapshot["completeModelCount"] != model_count or snapshot["completeModelEffortPairCount"] != pair_count:
        raise SnapshotError("snapshot counts do not match its complete ordered inventory")
    if require_hash and snapshot["canonicalContentHash"] != canonical_hash(snapshot):
        raise SnapshotError("canonical content hash mismatch")
    result = dict(snapshot)
    result["models"] = normalized_models
    return result


def load_snapshot(path: Path = SNAPSHOT_PATH) -> dict[str, object]:
    try:
        snapshot = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise SnapshotError(f"unable to read snapshot: {path}") from exc
    return validate_snapshot(snapshot)


def build_candidate_matrix(snapshot: Mapping[str, object]) -> tuple[Candidate, ...]:
    valid = validate_snapshot(snapshot)
    candidates: list[Candidate] = []
    ordinal = 0
    for model in valid["models"]:
        for effort in model["supportedEfforts"]:
            candidates.append(Candidate(model["modelIdentifier"], effort, ordinal))
            ordinal += 1
    return tuple(candidates)


def _validate_task(task: Mapping[str, object]) -> dict[str, object]:
    if not isinstance(task, Mapping) or set(task) != set(TASK_FIELDS):
        raise TaskDescriptionError("task description must contain exactly the required fields")
    normalized = dict(task)
    for field in ("taskId", "taskType", "objective"):
        if not isinstance(normalized[field], str) or not normalized[field].strip():
            raise TaskDescriptionError(f"{field} must be a non-empty string")
    for field in ("readScope", "writeScope", "affectedSystems"):
        if not isinstance(normalized[field], list) or not normalized[field] or not all(isinstance(item, str) and item.strip() for item in normalized[field]):
            raise TaskDescriptionError(f"{field} must be a non-empty string list")
    for field in ("runtimeSensitivity", "architectureImpact", "securityImpact", "economyImpact", "releaseImpact", "validationComplexity", "ambiguityNovelty", "concurrencyBranchRisk"):
        if normalized[field] not in LEVELS:
            raise TaskDescriptionError(f"{field} must be one of {sorted(LEVELS)}")
    if normalized["expectedImplementationSize"] not in SIZE_LEVELS:
        raise TaskDescriptionError(f"expectedImplementationSize must be one of {sorted(SIZE_LEVELS)}")
    return normalized


def load_task(path: Path) -> dict[str, object]:
    try:
        task = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise TaskDescriptionError(f"unable to read task description: {path}") from exc
    return _validate_task(task)


def task_hash(task: Mapping[str, object]) -> str:
    return _sha256(_validate_task(task))


def _required_score(task: Mapping[str, object]) -> int:
    valid = _validate_task(task)
    score = sum(LEVELS[valid[field]] for field in (
        "runtimeSensitivity", "architectureImpact", "securityImpact", "economyImpact",
        "releaseImpact", "validationComplexity", "ambiguityNovelty", "concurrencyBranchRisk",
    ))
    score += SIZE_LEVELS[valid["expectedImplementationSize"]]
    score += min(3, len(valid["affectedSystems"]))
    return score


def _cost_class(model_index: int, effort_index: int) -> str:
    ordinal = model_index * 4 + effort_index
    if ordinal <= 3:
        return "LOW"
    if ordinal <= 9:
        return "MEDIUM"
    if ordinal <= 16:
        return "HIGH"
    return "VERY_HIGH"


def evaluate_task(snapshot: Mapping[str, object], task: Mapping[str, object], evaluator: Callable[[Candidate, Mapping[str, object], int], str] | None = None) -> EvaluationReport:
    valid_task = _validate_task(task)
    candidates = build_candidate_matrix(snapshot)
    required = _required_score(valid_task)
    evaluations: list[PairEvaluation] = []
    for candidate in candidates:
        model_index = next(index for index, model in enumerate(snapshot["models"]) if model["modelIdentifier"] == candidate.model)
        effort_index = next(index for index, effort in enumerate(next(model for model in snapshot["models"] if model["modelIdentifier"] == candidate.model)["supportedEfforts"]) if effort == candidate.effort)
        capability = (model_index + 1) * 10 + effort_index * 2
        injected = evaluator(candidate, valid_task, required) if evaluator else None
        verdict = injected or ("RELIABLE" if capability >= required else "INSUFFICIENT")
        reason = None if verdict == "RELIABLE" else f"capability score {capability} is below task requirement {required}"
        risk = "LOW" if capability >= required + 3 else ("MEDIUM" if capability >= required else "HIGH")
        escalation = "LOW" if capability >= required + 2 else ("MEDIUM" if capability >= required else "HIGH")
        evaluations.append(PairEvaluation(candidate.model, candidate.effort, verdict, reason, risk, escalation, _cost_class(model_index, effort_index), capability, required))
    reliable = [evaluation for evaluation in evaluations if evaluation.verdict == "RELIABLE"]
    if not reliable:
        raise TaskDescriptionError("no candidate satisfies the reliability constraint")
    recommendation = min(reliable, key=lambda item: next(index for index, evaluation in enumerate(evaluations) if evaluation == item))
    rejected = [evaluation for evaluation in evaluations if evaluation.verdict != "RELIABLE"]
    cheapest_rejected = max(rejected, key=lambda item: next(index for index, evaluation in enumerate(evaluations) if evaluation == item), default=None)
    recommendation_index = evaluations.index(recommendation)
    next_more_capable = next((evaluation for evaluation in evaluations[recommendation_index + 1:] if evaluation.verdict == "RELIABLE"), None)
    matrix_hash = _sha256([asdict(evaluation) for evaluation in evaluations])
    return EvaluationReport(tuple(evaluations), recommendation, cheapest_rejected, next_more_capable, matrix_hash, required)


def _now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _parse_time(value: str) -> float:
    return datetime.fromisoformat(value.replace("Z", "+00:00")).timestamp()


def current_branch() -> str:
    result = subprocess.run(["git", "branch", "--show-current"], check=True, capture_output=True, text=True)
    branch = result.stdout.strip()
    if not branch:
        raise AuthorizationError("detached HEAD is not an authorized branch")
    return branch


def _state_path(thread_id: str, state_dir: Path = DEFAULT_STATE_DIR) -> Path:
    if not thread_id or any(char in thread_id for char in "/\\"):
        raise AuthorizationError("invalid thread id")
    return state_dir / (hashlib.sha256(thread_id.encode("utf-8")).hexdigest() + ".json")


def _write_state(state: Mapping[str, object], state_dir: Path) -> None:
    state_dir.mkdir(parents=True, exist_ok=True)
    path = _state_path(state["threadId"], state_dir)
    temporary = path.with_suffix(".tmp")
    temporary.write_text(json.dumps(state, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    temporary.replace(path)


def _read_state(thread_id: str, state_dir: Path) -> dict[str, object]:
    path = _state_path(thread_id, state_dir)
    try:
        state = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise AuthorizationError("preflight state is absent or malformed") from exc
    if not isinstance(state, dict):
        raise AuthorizationError("preflight state is malformed")
    if time.time() - _parse_time(state["createdAt"]) > STATE_TTL_SECONDS:
        raise AuthorizationError("preflight state is stale")
    return state


def _identity(task: Mapping[str, object], snapshot: Mapping[str, object], report: EvaluationReport, thread_id: str, branch: str, baseline: str) -> dict[str, object]:
    return {
        "taskId": task["taskId"], "threadId": thread_id, "branch": branch, "baselineSha": baseline,
        "snapshotRevision": snapshot["snapshotRevision"], "snapshotHash": snapshot["canonicalContentHash"],
        "taskDescriptionHash": task_hash(task), "completeMatrixHash": report.matrixHash,
        "recommendation": {"model": report.recommendation.model, "effort": report.recommendation.effort},
    }


def _assert_identity(state: Mapping[str, object], task: Mapping[str, object], snapshot: Mapping[str, object], report: EvaluationReport, thread_id: str, branch: str, baseline: str) -> None:
    expected = _identity(task, snapshot, report, thread_id, branch, baseline)
    for field, value in expected.items():
        if state.get(field) != value:
            raise AuthorizationError(f"stale authorization: {field} differs")


def _output(snapshot: Mapping[str, object], report: EvaluationReport, status: str, next_response: str) -> str:
    lines = [
        f"status: {status}",
        f"snapshot revision: {snapshot['snapshotRevision']}",
        f"snapshot hash: {snapshot['canonicalContentHash']}",
        f"model count: {snapshot['completeModelCount']}",
        f"model-effort pair count: {snapshot['completeModelEffortPairCount']}",
        f"evaluated pair count: {len(report.evaluations)}/{snapshot['completeModelEffortPairCount']}",
        f"required capability score: {report.requiredScore}",
        "evaluation matrix:",
    ]
    for evaluation in report.evaluations:
        reason = f"; reason={evaluation.rejectionReason}" if evaluation.rejectionReason else ""
        lines.append(f"- {evaluation.model} / {evaluation.effort}: {evaluation.verdict}; retry={evaluation.retryRisk}; escalation={evaluation.escalationRisk}; cost={evaluation.costClass}{reason}")
    lines.append(f"cheapest rejected pair: {report.cheapestRejected.model} / {report.cheapestRejected.effort}; reason={report.cheapestRejected.rejectionReason}" if report.cheapestRejected else "cheapest rejected pair: none")
    lines.append(f"recommended pair: {report.recommendation.model} / {report.recommendation.effort}")
    lines.append(f"next more capable plausible pair: {report.nextMoreCapable.model} / {report.nextMoreCapable.effort}" if report.nextMoreCapable else "next more capable plausible pair: none")
    lines.append(f"exact next response: {next_response}")
    return "\n".join(lines)


def start_preflight(task: Mapping[str, object], thread_id: str, baseline: str, *, branch: str | None = None, state_dir: Path = DEFAULT_STATE_DIR, path: Path = SNAPSHOT_PATH) -> PreflightResult:
    snapshot = load_snapshot(path)
    valid_task = _validate_task(task)
    selected_branch = branch or current_branch()
    report = evaluate_task(snapshot, valid_task)
    state = _identity(valid_task, snapshot, report, thread_id, selected_branch, baseline)
    state.update({"state": "WAITING_FOR_INVENTORY_CONFIRMATION", "stateHistory": ["PREFLIGHT_REQUIRED", "WAITING_FOR_INVENTORY_CONFIRMATION"], "createdAt": _now(), "inventoryConfirmedAt": None, "expiresAfterSeconds": STATE_TTL_SECONDS})
    _write_state(state, state_dir)
    candidates = build_candidate_matrix(snapshot)
    return PreflightResult("WAITING_FOR_INVENTORY_CONFIRMATION", snapshot, valid_task, candidates, report, _output(snapshot, report, "WAITING_FOR_INVENTORY_CONFIRMATION", "INVENTORY_OK or INVENTORY_CHANGED"), thread_id)


def record_inventory_ok(thread_id: str, task: Mapping[str, object], baseline: str, *, branch: str | None = None, state_dir: Path = DEFAULT_STATE_DIR, path: Path = SNAPSHOT_PATH) -> PreflightResult:
    snapshot = load_snapshot(path)
    valid_task = _validate_task(task)
    selected_branch = branch or current_branch()
    report = evaluate_task(snapshot, valid_task)
    state = _read_state(thread_id, state_dir)
    _assert_identity(state, valid_task, snapshot, report, thread_id, selected_branch, baseline)
    if state["state"] != "WAITING_FOR_INVENTORY_CONFIRMATION":
        raise AuthorizationError("INVENTORY_OK is invalid in the current state")
    state["stateHistory"].append("INVENTORY_CONFIRMED")
    state["state"] = "WAITING_FOR_MODEL_SELECTION"
    state["stateHistory"].append("WAITING_FOR_MODEL_SELECTION")
    state["inventoryConfirmedAt"] = _now()
    _write_state(state, state_dir)
    return PreflightResult("WAITING_FOR_MODEL_SELECTION", snapshot, valid_task, build_candidate_matrix(snapshot), report, _output(snapshot, report, "WAITING_FOR_MODEL_SELECTION", "CONTINUE"), thread_id)


def record_inventory_changed(thread_id: str, *, state_dir: Path = DEFAULT_STATE_DIR) -> str:
    state = _read_state(thread_id, state_dir)
    state["state"] = "BLOCKED_MODEL_INVENTORY_CHANGED"
    state["blockedAt"] = _now()
    state["maintenanceTask"] = MAINTENANCE_TASK_ID
    _write_state(state, state_dir)
    return f"status: BLOCKED_MODEL_INVENTORY_CHANGED\nmaintenance task: {MAINTENANCE_TASK_ID}"


def record_continue(thread_id: str, token: str, task: Mapping[str, object], baseline: str, *, branch: str | None = None, state_dir: Path = DEFAULT_STATE_DIR, path: Path = SNAPSHOT_PATH) -> str:
    if token.strip() != "CONTINUE":
        raise AuthorizationError("exact CONTINUE is required")
    snapshot = load_snapshot(path)
    valid_task = _validate_task(task)
    selected_branch = branch or current_branch()
    report = evaluate_task(snapshot, valid_task)
    state = _read_state(thread_id, state_dir)
    _assert_identity(state, valid_task, snapshot, report, thread_id, selected_branch, baseline)
    if state["state"] != "WAITING_FOR_MODEL_SELECTION" or not state.get("inventoryConfirmedAt"):
        raise AuthorizationError("inventory confirmation is required before CONTINUE")
    state["state"] = "CONTINUE_RECEIVED"
    state["stateHistory"].append("CONTINUE_RECEIVED")
    state["continueReceivedAt"] = _now()
    state["state"] = "SCOPE_REVALIDATED"
    state["stateHistory"].append("SCOPE_REVALIDATED")
    state["scopeRevalidatedAt"] = _now()
    state["state"] = "IMPLEMENTATION_ALLOWED"
    state["stateHistory"].append("IMPLEMENTATION_ALLOWED")
    state["implementationAllowedAt"] = _now()
    _write_state(state, state_dir)
    return "status: IMPLEMENTATION_ALLOWED\nexact same-thread CONTINUE authorized; mutation may proceed"


def inspect_state(thread_id: str, *, state_dir: Path = DEFAULT_STATE_DIR) -> dict[str, object]:
    return _read_state(thread_id, state_dir)


def invalidate_state(thread_id: str, *, state_dir: Path = DEFAULT_STATE_DIR) -> dict[str, object]:
    state = _read_state(thread_id, state_dir)
    state["state"] = "PREFLIGHT_REQUIRED"
    state["invalidatedAt"] = _now()
    _write_state(state, state_dir)
    return state


def run_preflight(user_response: str | None = None, *, thread_id: str | None = None, path: Path = SNAPSHOT_PATH, task: Mapping[str, object] | None = None, baseline: str = "", branch: str = "") -> PreflightResult:
    if task is None:
        raise TaskDescriptionError("structured task description is required")
    if not thread_id or not baseline or not branch:
        raise AuthorizationError("thread, baseline, and branch are required")
    result = start_preflight(task, thread_id, baseline, branch=branch, path=path, state_dir=DEFAULT_STATE_DIR)
    if user_response is None:
        return result
    if user_response.strip() == "INVENTORY_CHANGED":
        return PreflightResult("BLOCKED_MODEL_INVENTORY_CHANGED", result.snapshot, result.task, result.candidates, result.report, result.output + f"\nmaintenance task: {MAINTENANCE_TASK_ID}", thread_id)
    if user_response.strip() == "INVENTORY_OK":
        return record_inventory_ok(thread_id, task, baseline, branch=branch, path=path, state_dir=DEFAULT_STATE_DIR)
    raise AuthorizationError("expected exact INVENTORY_OK or INVENTORY_CHANGED")
