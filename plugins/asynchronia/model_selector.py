"""Production model-selector support for the confirmed picker snapshot.

This module deliberately has no live-host or Desktop integration. The snapshot is
user-confirmed input and is only replaced by the explicit maintenance workflow.
"""

from __future__ import annotations

import hashlib
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Iterable, Mapping


SNAPSHOT_PATH = Path(__file__).with_name("snapshots") / "confirmed-model-effort-snapshot.json"
SNAPSHOT_STATUS = "USER_CONFIRMED"
SNAPSHOT_SCHEMA_VERSION = "1.0.10"
MAINTENANCE_TASK_ID = "TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20260714"
REQUIRED_FIELDS = {
    "schemaVersion",
    "snapshotRevision",
    "confirmedTimestamp",
    "confirmationSource",
    "applicationSurface",
    "models",
    "completeModelCount",
    "completeModelEffortPairCount",
    "canonicalContentHash",
    "status",
    "supersedes",
    "notes",
}
IDENTIFIER = re.compile(r"^[a-z0-9][a-z0-9._-]*$")


class SnapshotError(ValueError):
    """Raised when a snapshot is malformed, stale, or not user-confirmed."""


@dataclass(frozen=True)
class Candidate:
    model: str
    effort: str
    ordinal: int


@dataclass(frozen=True)
class PreflightResult:
    status: str
    snapshot: Mapping[str, object]
    candidates: tuple[Candidate, ...]
    recommendation: Candidate | None
    output: str
    thread_id: str | None = None


def _canonical_payload(snapshot: Mapping[str, object]) -> bytes:
    payload = dict(snapshot)
    payload.pop("canonicalContentHash", None)
    return json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode("utf-8")


def canonical_hash(snapshot: Mapping[str, object]) -> str:
    return "sha256:" + hashlib.sha256(_canonical_payload(snapshot)).hexdigest()


def _require_identifier(value: object, label: str) -> str:
    if not isinstance(value, str) or not IDENTIFIER.fullmatch(value):
        raise SnapshotError(f"invalid {label}: {value!r}")
    return value


def validate_snapshot(snapshot: Mapping[str, object], *, require_hash: bool = True) -> dict[str, object]:
    if not isinstance(snapshot, Mapping):
        raise SnapshotError("snapshot must be an object")
    if set(snapshot) != REQUIRED_FIELDS:
        missing = sorted(REQUIRED_FIELDS - set(snapshot))
        extra = sorted(set(snapshot) - REQUIRED_FIELDS)
        raise SnapshotError(f"snapshot fields mismatch; missing={missing}, extra={extra}")
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
    expected_hash = canonical_hash(snapshot)
    if require_hash and snapshot["canonicalContentHash"] != expected_hash:
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


def evaluate_all_pairs(candidates: Iterable[Candidate], evaluator: Callable[[Candidate], str] | None = None) -> tuple[tuple[Candidate, str], ...]:
    """Evaluate every pair; an injected evaluator can apply task-specific policy."""
    evaluate = evaluator or (lambda _candidate: "RELIABLE")
    evaluations = tuple((candidate, evaluate(candidate)) for candidate in candidates)
    if not evaluations:
        raise SnapshotError("candidate matrix is empty")
    return evaluations


def _inventory_text(snapshot: Mapping[str, object], evaluations: tuple[tuple[Candidate, str], ...], recommendation: Candidate) -> str:
    lines = [
        "confirmed model-effort inventory:",
        f"snapshot revision: {snapshot['snapshotRevision']}",
        f"confirmed timestamp: {snapshot['confirmedTimestamp']}",
        f"source: {snapshot['confirmationSource']}",
        f"model count: {snapshot['completeModelCount']}",
        f"model-effort pair count: {snapshot['completeModelEffortPairCount']}",
        "candidate matrix:",
    ]
    for candidate, result in evaluations:
        lines.append(f"- {candidate.model} / {candidate.effort}: {result}")
    lines.append(f"recommended lowest reliable pair: {recommendation.model} / {recommendation.effort}")
    return "\n".join(lines)


def run_preflight(user_response: str | None = None, *, thread_id: str | None = None, path: Path = SNAPSHOT_PATH) -> PreflightResult:
    snapshot = load_snapshot(path)
    candidates = build_candidate_matrix(snapshot)
    evaluations = evaluate_all_pairs(candidates)
    recommendation = next(candidate for candidate, result in evaluations if result == "RELIABLE")
    output = _inventory_text(snapshot, evaluations, recommendation)
    if user_response is None:
        return PreflightResult("WAITING_FOR_INVENTORY_CONFIRMATION", snapshot, candidates, recommendation, output, thread_id)
    response = user_response.strip()
    if response == "INVENTORY_CHANGED":
        return PreflightResult("BLOCKED_MODEL_INVENTORY_CHANGED", snapshot, candidates, None, output + f"\nmaintenance task: {MAINTENANCE_TASK_ID}", thread_id)
    if response != "INVENTORY_OK":
        raise SnapshotError("expected exact same-thread INVENTORY_OK or INVENTORY_CHANGED")
    return PreflightResult("WAITING_FOR_MODEL_SELECTION", snapshot, candidates, recommendation, output + "\nINVENTORY_OK recorded for this thread; exact CONTINUE is required before mutation.", thread_id)


def authorize_continue(preflight: PreflightResult, token: str, *, thread_id: str) -> str:
    if preflight.status != "WAITING_FOR_MODEL_SELECTION" or preflight.thread_id != thread_id or token.strip() != "CONTINUE":
        raise SnapshotError("mutation remains blocked until exact same-thread CONTINUE")
    return "IMPLEMENTATION_ALLOWED"
