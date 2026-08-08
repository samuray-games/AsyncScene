"""Markdown-driven Asynchronia model selection and same-thread authorization."""

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

from .model_selector_inventory import canonical_hash, canonical_snapshot_payload, normalize_effort_identifier, normalize_model_identifier, parse_inventory_markdown
from .model_selector_costs import CostAuthority, CostAuthorityError, exact_vector_text, load_cost_authority, selection_key, tier_for_model


AUTHORITY_MANIFEST_PATH = Path(__file__).with_name("model-selector-authority.json")
SNAPSHOT_PATH = Path(__file__).with_name("snapshots") / "confirmed-model-effort-snapshot.json"
SNAPSHOT_STATUS = "PENDING_CONFIRMATION"
SNAPSHOT_SCHEMA_VERSION = "1.0.11"
PLUGIN_VERSION = "1.0.18"
MAINTENANCE_TASK_ID = "TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20260801"
DEFAULT_STATE_DIR = Path(os.environ.get("ASYNCHRONIA_SELECTOR_STATE_DIR", Path.home() / ".asynchronia" / "model-selector-state"))
STATE_TTL_SECONDS = 24 * 60 * 60
IDENTIFIER = re.compile(r"^[a-z0-9][a-z0-9._-]*$")
TASK_FIELDS = (
    "taskId", "taskType", "objective", "readScope", "writeScope", "affectedSystems",
    "runtimeSensitivity", "architectureImpact", "securityImpact", "economyImpact",
    "releaseImpact", "validationComplexity", "expectedImplementationSize",
    "ambiguityNovelty", "concurrencyBranchRisk",
)
LEVELS = {"low": 1, "medium": 2, "high": 3, "critical": 4}
SIZE_LEVELS = {"small": 1, "medium": 2, "large": 3, "very_large": 4}
MODEL_STABLE_FLOOR_RANKS = {
    "gpt-5.4-mini": -1,
    "gpt-5.4": -1,
    "gpt-5.5": -1,
    "gpt-5.6-luna": 0,
    "gpt-5.6-terra": 1,
    "gpt-5.6-sol": 2,
}
EFFORT_FLOOR_ORDER = ("light", "medium", "high", "extra-high", "max", "ultra")
EFFORT_FLOOR_RENDER = {
    "light": "Light",
    "medium": "Medium",
    "high": "High",
    "extra-high": "Extra High",
    "max": "Max",
    "ultra": "Ultra",
}


class SnapshotError(ValueError):
    pass


class TaskDescriptionError(ValueError):
    pass


class AuthorizationError(ValueError):
    pass


@dataclass(frozen=True)
class Candidate:
    modelLabel: str
    effortLabel: str
    modelIdentifier: str
    effortIdentifier: str
    ordinal: int


@dataclass(frozen=True)
class PairEvaluation:
    modelLabel: str
    effortLabel: str
    modelIdentifier: str
    effortIdentifier: str
    verdict: str
    rejectionReason: str | None
    retryRisk: str
    escalationRisk: str
    costClass: str
    costVector: tuple[str, str, str]
    costTierIndex: int
    capabilityScore: int
    requiredScore: int
    candidateOrdinal: int


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
    report: EvaluationReport | None
    output: str
    thread_id: str | None = None


@dataclass(frozen=True)
class PluginRuntimeEvidence:
    pluginRoot: str
    manifestPath: str
    manifestVersion: str
    manifestSha256: str


def _canonical_bytes(value: object) -> bytes:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode("utf-8")


def _sha256(value: object) -> str:
    return "sha256:" + hashlib.sha256(_canonical_bytes(value)).hexdigest()


def _require_identifier(value: object, label: str) -> str:
    if not isinstance(value, str) or not IDENTIFIER.fullmatch(value):
        raise SnapshotError(f"invalid {label}: {value!r}")
    return value


def _manifest() -> dict[str, object]:
    try:
        manifest = json.loads(AUTHORITY_MANIFEST_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise SnapshotError(f"unable to read authority manifest: {AUTHORITY_MANIFEST_PATH}") from exc
    if not isinstance(manifest, dict):
        raise SnapshotError("authority manifest must be an object")
    required = {"inventoryArtifactPath", "inventoryParser", "provenanceType", "lastAcceptedBlobSha", "currentSnapshotRevision"}
    if not required.issubset(manifest):
        raise SnapshotError("authority manifest is missing required fields")
    return manifest


def _inventory_artifact_path() -> Path:
    manifest = _manifest()
    path = Path(manifest["inventoryArtifactPath"])
    if not path.is_absolute():
        path = Path(__file__).resolve().parents[2] / path
    return path


def _resolve_git_worktree_root() -> Path:
    try:
        result = subprocess.run(["git", "-C", str(Path(__file__).resolve().parent), "rev-parse", "--show-toplevel"], check=True, capture_output=True, text=True)
    except (OSError, subprocess.CalledProcessError) as exc:
        raise AuthorizationError("unable to resolve git worktree root") from exc
    worktree = Path(result.stdout.strip())
    if not worktree.is_absolute():
        raise AuthorizationError("resolved git worktree root is not absolute")
    return worktree


def _resolve_plugin_manifest(plugin_root: Path) -> tuple[Path, dict[str, object], bytes]:
    if not plugin_root.is_absolute():
        raise AuthorizationError("plugin root must be an absolute path")
    manifest_path = plugin_root / ".codex-plugin" / "plugin.json"
    if not manifest_path.exists():
        raise AuthorizationError("installed plugin manifest is missing")
    try:
        manifest_bytes = manifest_path.read_bytes()
        manifest = json.loads(manifest_bytes.decode("utf-8"))
    except (OSError, UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise AuthorizationError("installed plugin manifest is malformed") from exc
    if not isinstance(manifest, Mapping):
        raise AuthorizationError("installed plugin manifest is malformed")
    if manifest.get("name") != "asynchronia":
        raise AuthorizationError("installed plugin manifest does not match the executing package")
    version = manifest.get("version")
    if not isinstance(version, str) or not version.strip():
        raise AuthorizationError("installed plugin manifest version is missing")
    if version != PLUGIN_VERSION:
        raise AuthorizationError("installed plugin manifest version is inconsistent with the executing package")
    return manifest_path, dict(manifest), manifest_bytes


def _read_plugin_runtime_evidence(plugin_root: Path | None) -> PluginRuntimeEvidence:
    if plugin_root is None:
        raise AuthorizationError("plugin root is required for read-only runtime evidence")
    manifest_path, manifest, manifest_bytes = _resolve_plugin_manifest(plugin_root)
    manifest_sha256 = "sha256:" + hashlib.sha256(manifest_bytes).hexdigest()
    return PluginRuntimeEvidence(str(plugin_root), str(manifest_path), str(manifest["version"]), manifest_sha256)


def _validate_branch_argument(selected_branch: str | None) -> str:
    checked_out = current_branch()
    if selected_branch is not None and selected_branch != checked_out:
        raise AuthorizationError("explicit branch argument does not match checked-out branch")
    return checked_out


def _snapshot_payload_path() -> Path:
    return SNAPSHOT_PATH


def _build_snapshot_from_inventory() -> dict[str, object]:
    manifest = _manifest()
    artifact_path = _inventory_artifact_path()
    parsed = parse_inventory_markdown(artifact_path)
    return canonical_snapshot_payload(
        snapshot_revision=str(manifest["currentSnapshotRevision"]),
        confirmed_timestamp="2026-08-01T05:31:00Z",
        confirmation_source="USER_CONFIRMED_CODEX_DESKTOP_PICKER_INVENTORY",
        application_surface="CODEX_DESKTOP_APP",
        supersedes="20260722.1",
        source_artifact_path=str(manifest["inventoryArtifactPath"]),
        source_artifact_blob_sha=str(manifest["lastAcceptedBlobSha"]),
        status=SNAPSHOT_STATUS,
        models=list(parsed.models),
        notes=[
            "This snapshot is generated from the authoritative repository Markdown inventory.",
            "It is pending same-thread confirmation until the user responds INVENTORY_OK.",
        ],
    )


def _snapshot_from_file(path: Path = SNAPSHOT_PATH) -> dict[str, object]:
    try:
        snapshot = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise SnapshotError(f"unable to read snapshot: {path}") from exc
    return validate_snapshot(snapshot)


def _git_blob_sha(path: Path) -> str:
    result = subprocess.run(["git", "hash-object", str(path)], check=True, capture_output=True, text=True)
    return result.stdout.strip()


def _validate_authority_binding(snapshot: Mapping[str, object]) -> None:
    manifest = _manifest()
    artifact_path = _inventory_artifact_path()
    try:
        parsed = parse_inventory_markdown(artifact_path)
        if manifest["inventoryParser"] != "markdown-bullet-inventory-v1":
            raise SnapshotError("unsupported inventory parser")
        if snapshot["sourceArtifact"]["path"] != manifest["inventoryArtifactPath"]:
            raise SnapshotError("snapshot source artifact path does not match authority manifest")
        if snapshot["sourceArtifact"]["provenanceType"] != manifest["provenanceType"]:
            raise SnapshotError("snapshot provenance type does not match authority manifest")
        if snapshot["snapshotRevision"] != manifest["currentSnapshotRevision"]:
            raise SnapshotError("snapshot revision does not match authority manifest")
        if snapshot["sourceArtifact"]["blobSha"] != manifest["lastAcceptedBlobSha"]:
            raise SnapshotError("snapshot source blob sha does not match authority manifest")
        actual_blob_sha = _git_blob_sha(artifact_path)
        if actual_blob_sha != manifest["lastAcceptedBlobSha"]:
            raise SnapshotError("authority artifact bytes do not match expected blob sha")
        if parsed.model_count != snapshot["completeModelCount"] or parsed.pair_count != snapshot["completeModelEffortPairCount"]:
            raise SnapshotError("authority artifact counts do not match snapshot counts")
        parsed_models = list(parsed.models)
        if len(parsed_models) != len(snapshot["models"]):
            raise SnapshotError("authority artifact model count does not match snapshot model count")
        for snapshot_model, parsed_model in zip(snapshot["models"], parsed_models):
            if snapshot_model["modelLabel"] != parsed_model["modelLabel"]:
                raise SnapshotError("authority artifact model labels do not match snapshot labels")
            if snapshot_model["modelIdentifier"] != parsed_model["modelIdentifier"]:
                raise SnapshotError("authority artifact model identifiers do not match snapshot identifiers")
            snapshot_efforts = snapshot_model["supportedEfforts"]
            parsed_efforts = parsed_model["supportedEfforts"]
            if len(snapshot_efforts) != len(parsed_efforts):
                raise SnapshotError("authority artifact effort counts do not match snapshot counts")
            for snapshot_effort, parsed_effort in zip(snapshot_efforts, parsed_efforts):
                if snapshot_effort["effortLabel"] != parsed_effort["effortLabel"]:
                    raise SnapshotError("authority artifact effort labels do not match snapshot labels")
                if snapshot_effort["effortIdentifier"] != parsed_effort["effortIdentifier"]:
                    raise SnapshotError("authority artifact effort identifiers do not match snapshot identifiers")
    except (OSError, subprocess.CalledProcessError, FileNotFoundError) as exc:
        raise SnapshotError(f"authority binding failed: {exc}") from exc



def validate_snapshot(snapshot: Mapping[str, object], *, require_hash: bool = True) -> dict[str, object]:
    if not isinstance(snapshot, Mapping):
        raise SnapshotError("snapshot must be an object")
    required_fields = {
        "schemaVersion", "snapshotRevision", "confirmedTimestamp", "confirmationSource",
        "applicationSurface", "sourceArtifact", "models", "completeModelCount",
        "completeModelEffortPairCount", "canonicalContentHash", "status", "supersedes", "notes",
    }
    if set(snapshot) != required_fields:
        raise SnapshotError(f"snapshot fields mismatch; missing={sorted(required_fields - set(snapshot))}, extra={sorted(set(snapshot) - required_fields)}")
    if snapshot["schemaVersion"] != SNAPSHOT_SCHEMA_VERSION:
        raise SnapshotError("unsupported snapshot schema version")
    for field in ("snapshotRevision", "confirmedTimestamp", "confirmationSource", "applicationSurface"):
        if not isinstance(snapshot[field], str) or not snapshot[field].strip():
            raise SnapshotError(f"{field} must be a non-empty string")
    source_artifact = snapshot["sourceArtifact"]
    if not isinstance(source_artifact, Mapping) or set(source_artifact) != {"path", "blobSha", "provenanceType"}:
        raise SnapshotError("sourceArtifact must contain path, blobSha, and provenanceType")
    if not isinstance(source_artifact["path"], str) or not source_artifact["path"].strip():
        raise SnapshotError("sourceArtifact.path must be a non-empty string")
    if not isinstance(source_artifact["blobSha"], str) or not re.fullmatch(r"[0-9a-f]{40}", source_artifact["blobSha"]):
        raise SnapshotError("sourceArtifact.blobSha must be a blob sha")
    if source_artifact["provenanceType"] != "repository-markdown":
        raise SnapshotError("unsupported provenance type")
    if snapshot["status"] != SNAPSHOT_STATUS:
        raise SnapshotError("snapshot is not pending confirmation")
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
        if not isinstance(model, Mapping) or set(model) != {"modelLabel", "modelIdentifier", "supportedEfforts"}:
            raise SnapshotError("each model must contain modelLabel, modelIdentifier, supportedEfforts")
        model_label = model["modelLabel"]
        if not isinstance(model_label, str) or not model_label.strip():
            raise SnapshotError("modelLabel must be a non-empty string")
        model_id = _require_identifier(model["modelIdentifier"], "model identifier")
        if model_id in seen_models:
            raise SnapshotError(f"duplicate model identifier: {model_id}")
        if model_id != normalize_model_identifier(model_label):
            raise SnapshotError(f"model identifier mismatch for {model_label}")
        seen_models.add(model_id)
        efforts = model["supportedEfforts"]
        if not isinstance(efforts, list) or not efforts:
            raise SnapshotError(f"empty effort list for model: {model_label}")
        seen_efforts: set[str] = set()
        ordered_efforts: list[dict[str, str]] = []
        for effort in efforts:
            if not isinstance(effort, Mapping) or set(effort) != {"effortLabel", "effortIdentifier"}:
                raise SnapshotError("each supported effort must contain effortLabel and effortIdentifier")
            effort_label = effort["effortLabel"]
            if not isinstance(effort_label, str) or not effort_label.strip():
                raise SnapshotError("effortLabel must be a non-empty string")
            effort_id = _require_identifier(effort["effortIdentifier"], f"effort identifier for {model_label}")
            if effort_id in seen_efforts:
                raise SnapshotError(f"duplicate effort identifier for {model_label}: {effort_id}")
            if effort_id != normalize_effort_identifier(effort_label):
                raise SnapshotError(f"effort identifier mismatch for {model_label} / {effort_label}")
            seen_efforts.add(effort_id)
            ordered_efforts.append({"effortLabel": effort_label, "effortIdentifier": effort_id})
        normalized_models.append({"modelLabel": model_label, "modelIdentifier": model_id, "supportedEfforts": ordered_efforts})
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
    snapshot = _snapshot_from_file(path)
    _validate_authority_binding(snapshot)
    return snapshot


def build_candidate_matrix(snapshot: Mapping[str, object]) -> tuple[Candidate, ...]:
    valid = validate_snapshot(snapshot)
    candidates: list[Candidate] = []
    ordinal = 0
    for model in valid["models"]:
        for effort in model["supportedEfforts"]:
            candidates.append(
                Candidate(
                    modelLabel=model["modelLabel"],
                    effortLabel=effort["effortLabel"],
                    modelIdentifier=model["modelIdentifier"],
                    effortIdentifier=effort["effortIdentifier"],
                    ordinal=ordinal,
                )
            )
            ordinal += 1
    return tuple(candidates)


def _validate_task(task: Mapping[str, object]) -> dict[str, object]:
    if not isinstance(task, Mapping) or set(task) != set(TASK_FIELDS):
        raise TaskDescriptionError("task description must contain exactly the required fields")
    normalized = dict(task)
    for field in ("taskId", "taskType", "objective"):
        if not isinstance(normalized[field], str) or not normalized[field].strip():
            raise TaskDescriptionError(f"{field} must be a non-empty string")
    for field in ("readScope", "affectedSystems"):
        if not isinstance(normalized[field], list) or not normalized[field] or not all(isinstance(item, str) and item.strip() for item in normalized[field]):
            raise TaskDescriptionError(f"{field} must be a non-empty string list")
    write_scope = normalized["writeScope"]
    if not isinstance(write_scope, list):
        raise TaskDescriptionError("writeScope must be a list")
    if write_scope and not all(isinstance(item, str) and item.strip() for item in write_scope):
        raise TaskDescriptionError("writeScope must contain only non-empty strings")
    for field in ("runtimeSensitivity", "architectureImpact", "securityImpact", "economyImpact", "releaseImpact", "validationComplexity", "ambiguityNovelty", "concurrencyBranchRisk"):
        if normalized[field] not in LEVELS:
            raise TaskDescriptionError(f"{field} must be one of {sorted(LEVELS)}")
    if normalized["expectedImplementationSize"] not in SIZE_LEVELS:
        raise TaskDescriptionError(f"expectedImplementationSize must be one of {sorted(SIZE_LEVELS)}")
    return normalized


def _normalized_write_scope(task: Mapping[str, object]) -> tuple[str, ...]:
    normalized = _validate_task(task)
    write_scope = normalized["writeScope"]
    if write_scope == ["NONE_READ_ONLY"]:
        return tuple()
    return tuple(write_scope)


def _is_read_only_task(task: Mapping[str, object]) -> bool:
    return len(_normalized_write_scope(task)) == 0


def _is_docs_only_mutation(task: Mapping[str, object]) -> bool:
    normalized = _validate_task(task)
    write_scope = normalized["writeScope"]
    if not write_scope:
        return False
    if normalized["expectedImplementationSize"] != "small":
        return False
    if any(normalized[field] != "low" for field in (
        "runtimeSensitivity", "architectureImpact", "securityImpact", "economyImpact",
        "releaseImpact", "validationComplexity", "ambiguityNovelty", "concurrencyBranchRisk",
    )):
        return False
    return all(isinstance(path, str) and path.endswith((".md", ".txt")) for path in write_scope)


def _is_preflight_self_task(task: Mapping[str, object]) -> bool:
    """Identify the narrowly-scoped policy repair that owns this gate.

    A preflight repair must not require the gate it is changing, but this is
    intentionally limited to the selector/CLI policy surface and its explicit
    plugin-policy task type.  Runtime and ordinary plugin changes retain the
    normal authorization path.
    """
    normalized = _validate_task(task)
    if normalized["taskType"] != "PLUGIN_POLICY":
        return False
    owned_paths = {
        "plugins/asynchronia/model_selector.py",
        "plugins/asynchronia/model_selector_runtime.py",
        "tools/run-asynchronia-model-preflight.py",
    }
    return bool(set(normalized["writeScope"]) & owned_paths)


def _is_bridge_task(task: Mapping[str, object]) -> bool:
    task_type = str(task["taskType"])
    return task_type.startswith(("BRIDGE_", "STAGE_6", "STAGE7_")) or task_type in {"MAILBOX_PUBLICATION", "BRIDGE_CANARY", "NO_MAIN_DELTA_TRANSPORT_CANARY"}


def _model_floor_index(model_identifier: str) -> int:
    if model_identifier in MODEL_STABLE_FLOOR_RANKS:
        return MODEL_STABLE_FLOOR_RANKS[model_identifier]
    raise TaskDescriptionError(f"unknown model floor: {model_identifier}")


def _effort_floor_index(effort_identifier: str) -> int:
    normalized = effort_identifier.lower().replace("_", "-")
    try:
        return EFFORT_FLOOR_ORDER.index(normalized)
    except ValueError as exc:
        raise TaskDescriptionError(f"unknown effort floor: {effort_identifier}") from exc


def _policy_floor(task: Mapping[str, object], required_score: int) -> tuple[str | None, str | None]:
    normalized = _validate_task(task)
    if _is_read_only_task(normalized):
        return (None, None)
    if _is_docs_only_mutation(normalized):
        return ("gpt-5.6-luna", "light")
    if required_score < 10 or required_score > 39:
        raise TaskDescriptionError("required score must be between 10 and 39")
    model_floor = "gpt-5.6-luna"
    if required_score <= 19:
        effort_floor = "light"
    elif required_score <= 29:
        effort_floor = "medium"
    elif required_score <= 37:
        effort_floor = "high"
    elif required_score <= 39:
        effort_floor = "max"
    broad_cross_cutting = (
        normalized["expectedImplementationSize"] in {"large", "very_large"}
        and len(normalized["affectedSystems"]) >= 3
        and sum(1 for field in (
            "architectureImpact", "securityImpact", "economyImpact", "releaseImpact", "validationComplexity", "concurrencyBranchRisk",
        ) if normalized[field] in {"high", "critical"}) >= 3
    )
    if broad_cross_cutting:
        model_floor = "gpt-5.6-sol"
    if normalized["runtimeSensitivity"] in {"high", "critical"}:
        effort_floor = max(effort_floor, "high", key=_effort_floor_index)
    if normalized["architectureImpact"] in {"high", "critical"}:
        effort_floor = max(effort_floor, "high", key=_effort_floor_index)
    if normalized["securityImpact"] in {"high", "critical"}:
        model_floor = max(model_floor, "gpt-5.6-terra", key=_model_floor_index)
        effort_floor = max(effort_floor, "light", key=_effort_floor_index)
    if normalized["economyImpact"] in {"high", "critical"}:
        model_floor = max(model_floor, "gpt-5.6-terra", key=_model_floor_index)
        effort_floor = max(effort_floor, "light", key=_effort_floor_index)
    if normalized["ambiguityNovelty"] in {"high", "critical"} and normalized["concurrencyBranchRisk"] in {"high", "critical"}:
        model_floor = max(model_floor, "gpt-5.6-terra", key=_model_floor_index)
        effort_floor = max(effort_floor, "medium", key=_effort_floor_index)
    return model_floor, effort_floor


def _authority_validation_result(snapshot: Mapping[str, object] | None = None) -> str:
    try:
        loaded = snapshot if snapshot is not None else load_snapshot()
    except (SnapshotError, OSError, subprocess.CalledProcessError, FileNotFoundError) as exc:
        return f"FAIL: {exc}"
    return f"PASS: {loaded['snapshotRevision']} {loaded['canonicalContentHash']}"


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


def _ordinal(snapshot: Mapping[str, object], candidate: Candidate) -> int:
    for model_index, model in enumerate(snapshot["models"]):
        if model["modelIdentifier"] != candidate.modelIdentifier:
            continue
        for effort_index, effort in enumerate(model["supportedEfforts"]):
            if effort["effortIdentifier"] == candidate.effortIdentifier:
                return model_index * 100 + effort_index
    raise TaskDescriptionError("candidate not present in snapshot")


def _cost_authority(snapshot: Mapping[str, object]) -> CostAuthority:
    try:
        root = _resolve_git_worktree_root()
        return load_cost_authority(inventory_model_ids=[model["modelIdentifier"] for model in snapshot["models"]], repository_root=root)
    except CostAuthorityError as exc:
        raise SnapshotError(str(exc)) from exc


def _effort_index(snapshot: Mapping[str, object], candidate: Candidate) -> int:
    model = next(model for model in snapshot["models"] if model["modelIdentifier"] == candidate.modelIdentifier)
    return next(index for index, effort in enumerate(model["supportedEfforts"]) if effort["effortIdentifier"] == candidate.effortIdentifier)


def evaluate_task(snapshot: Mapping[str, object], task: Mapping[str, object], evaluator: Callable[[Candidate, Mapping[str, object], int], str] | None = None) -> EvaluationReport:
    valid_task = _validate_task(task)
    candidates = build_candidate_matrix(snapshot)
    authority = _cost_authority(snapshot)
    required = _required_score(valid_task)
    model_floor, effort_floor = _policy_floor(valid_task, required)
    if model_floor is None:
        raise TaskDescriptionError("read-only tasks do not produce recommendations")
    if not 10 <= required <= 39:
        raise TaskDescriptionError("required score must be between 10 and 39")
    evaluations: list[PairEvaluation] = []
    for candidate in candidates:
        model_index = next(index for index, model in enumerate(snapshot["models"]) if model["modelIdentifier"] == candidate.modelIdentifier)
        effort_index = next(index for index, effort in enumerate(next(model for model in snapshot["models"] if model["modelIdentifier"] == candidate.modelIdentifier)["supportedEfforts"]) if effort["effortIdentifier"] == candidate.effortIdentifier)
        capability = (model_index + 1) * 10 + effort_index * 2
        injected = evaluator(candidate, valid_task, required) if evaluator else None
        policy_suitable = (
            _model_floor_index(candidate.modelIdentifier) >= _model_floor_index(model_floor)
            and _effort_floor_index(candidate.effortIdentifier) >= _effort_floor_index(effort_floor)
        )
        if not policy_suitable:
            verdict = "INSUFFICIENT"
        elif injected == "SUITABLE" or injected is None:
            verdict = "SUITABLE" if capability >= required else "INSUFFICIENT"
        else:
            verdict = injected
        if verdict == "SUITABLE":
            reason = None
        elif not policy_suitable:
            reason = f"policy floors require at least {model_floor} / {EFFORT_FLOOR_RENDER[effort_floor]}"
        else:
            reason = f"capability score {capability} is below task requirement {required}"
        risk = "LOW" if capability >= required + 3 else ("MEDIUM" if capability >= required else "HIGH")
        escalation = "LOW" if capability >= required + 2 else ("MEDIUM" if capability >= required else "HIGH")
        tier = tier_for_model(authority, candidate.modelIdentifier)
        vector = authority.models[candidate.modelIdentifier]
        evaluations.append(PairEvaluation(
            candidate.modelLabel, candidate.effortLabel, candidate.modelIdentifier, candidate.effortIdentifier,
            verdict, reason, risk, escalation, f"TIER_{tier.index}",
            (vector.inputCredits, vector.cachedInputCredits, vector.outputCredits), tier.index,
            capability, required, candidate.ordinal,
        ))
    suitable = [evaluation for evaluation in evaluations if evaluation.verdict == "SUITABLE"]
    if not suitable:
        raise TaskDescriptionError("no candidate satisfies the reliability constraint")
    def key(item: PairEvaluation) -> tuple[object, ...]:
        candidate = Candidate(item.modelLabel, item.effortLabel, item.modelIdentifier, item.effortIdentifier, item.candidateOrdinal)
        return selection_key(item, authority, _effort_index(snapshot, candidate), candidate.ordinal)

    recommendation = min(suitable, key=key)
    rejected = [evaluation for evaluation in evaluations if evaluation.verdict != "SUITABLE"]
    cheapest_rejected = min(rejected, key=key, default=None)
    next_more_capable = min(
        (evaluation for evaluation in suitable if evaluation.capabilityScore > recommendation.capabilityScore),
        key=key,
        default=None,
    )
    matrix_hash = _sha256([asdict(evaluation) for evaluation in evaluations])
    return EvaluationReport(tuple(evaluations), recommendation, cheapest_rejected, next_more_capable, matrix_hash, required)


def _now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _parse_time(value: str) -> float:
    return datetime.fromisoformat(value.replace("Z", "+00:00")).timestamp()


def current_branch() -> str:
    result = subprocess.run(["git", "-C", str(_resolve_git_worktree_root()), "branch", "--show-current"], check=True, capture_output=True, text=True)
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
    authority = _cost_authority(snapshot)
    return {
        "taskId": task["taskId"], "threadId": thread_id, "branch": branch, "baselineSha": baseline,
        "snapshotRevision": snapshot["snapshotRevision"], "snapshotHash": snapshot["canonicalContentHash"],
        "taskDescriptionHash": task_hash(task), "completeMatrixHash": report.matrixHash,
        "costAuthorityRevision": authority.authorityRevision,
        "costAuthorityHash": authority.canonicalContentHash,
        "pricingBasis": authority.pricingBasis,
        "recommendation": {"modelIdentifier": report.recommendation.modelIdentifier, "effortIdentifier": report.recommendation.effortIdentifier},
    }


def _assert_identity(state: Mapping[str, object], task: Mapping[str, object], snapshot: Mapping[str, object], report: EvaluationReport, thread_id: str, branch: str, baseline: str) -> None:
    expected = _identity(task, snapshot, report, thread_id, branch, baseline)
    for field, value in expected.items():
        if state.get(field) != value:
            raise AuthorizationError(f"stale authorization: {field} differs")


def mutation_authorization_guard(thread_id: str, task: Mapping[str, object], baseline: str, *, branch: str | None = None, state_dir: Path = DEFAULT_STATE_DIR, path: Path = SNAPSHOT_PATH) -> Mapping[str, object]:
    snapshot = load_snapshot(path)
    valid_task = _validate_task(task)
    if _is_read_only_task(valid_task):
        raise AuthorizationError("read-only tasks are not authorized for mutation")
    selected_branch = branch if branch is not None else current_branch()
    report = evaluate_task(snapshot, valid_task)
    state = _read_state(thread_id, state_dir)
    _assert_identity(state, valid_task, snapshot, report, thread_id, selected_branch, baseline)
    if state.get("state") != "IMPLEMENTATION_ALLOWED":
        raise AuthorizationError("mutation authorization requires IMPLEMENTATION_ALLOWED")
    if state.get("stateHistory", [])[-1:] != ["IMPLEMENTATION_ALLOWED"]:
        raise AuthorizationError("mutation authorization state is stale")
    if state.get("invalidatedAt"):
        raise AuthorizationError("mutation authorization state is invalidated")
    return state


def _output(snapshot: Mapping[str, object], report: EvaluationReport, status: str, next_response: str) -> str:
    authority = _cost_authority(snapshot)
    lines = [
        f"status: {status}",
        f"authorization path: {'MUTATION_PREFLIGHT_REQUIRED' if status != 'READ_ONLY_ALLOWED' else 'READ_ONLY_ALLOWED'}",
        f"snapshot revision: {snapshot['snapshotRevision']}",
        f"snapshot hash: {snapshot['canonicalContentHash']}",
        f"source artifact: {snapshot['sourceArtifact']['path']}",
        f"cost authority revision: {authority.authorityRevision}",
        f"cost authority hash: {authority.canonicalContentHash}",
        f"pricing basis: {authority.pricingBasis}",
        f"official cost source artifact: {authority.sourceArtifactPath}",
        "Standard-speed assumption: exact official token credits; no effort multiplier",
        "ordered cost tiers: " + " | ".join(f"{tier.index}={','.join(tier.modelIdentifiers)}" for tier in authority.tiers),
        "recommendation selection policy: policy floors, cost tier, lowest sufficient effort, retry risk, escalation risk, capability margin, stable candidate ordinal",
        f"model count: {snapshot['completeModelCount']}",
        f"model-effort pair count: {snapshot['completeModelEffortPairCount']}",
        f"evaluated pair count: {len(report.evaluations)}/{snapshot['completeModelEffortPairCount']}",
        f"required capability score: {report.requiredScore}",
        "evaluation matrix:",
    ]
    for evaluation in report.evaluations:
        reason = f"; reason={evaluation.rejectionReason}" if evaluation.rejectionReason else ""
        lines.append(f"- {evaluation.modelLabel} / {evaluation.effortLabel}: {evaluation.verdict}; retry={evaluation.retryRisk}; escalation={evaluation.escalationRisk}; cost={evaluation.costClass}; cost-tier={evaluation.costTierIndex}; credits={'/'.join(evaluation.costVector)}{reason}")
    lines.append(f"cheapest rejected pair: {report.cheapestRejected.modelLabel} / {report.cheapestRejected.effortLabel}; reason={report.cheapestRejected.rejectionReason}" if report.cheapestRejected else "cheapest rejected pair: none")
    lines.append(f"recommended pair: {report.recommendation.modelLabel} / {report.recommendation.effortLabel}")
    lines.append(f"next more capable plausible pair: {report.nextMoreCapable.modelLabel} / {report.nextMoreCapable.effortLabel}" if report.nextMoreCapable else "next more capable plausible pair: none")
    lines.append(f"exact next response: {next_response}")
    return "\n".join(lines)


def _read_only_output(task: Mapping[str, object], snapshot: Mapping[str, object], baseline: str, plugin_root: Path | None) -> str:
    evidence = _read_plugin_runtime_evidence(plugin_root)
    authority = _cost_authority(snapshot)
    worktree_root = _resolve_git_worktree_root()
    lines = [
        "status: READ_ONLY_ALLOWED",
        "authorization path: READ_ONLY_ALLOWED",
        f"plugin root: {evidence.pluginRoot}",
        f"plugin manifest path: {evidence.manifestPath}",
        f"manifest version: {evidence.manifestVersion}",
        f"manifest sha256: {evidence.manifestSha256}",
        f"current branch: {current_branch()}",
        f"absolute worktree path: {worktree_root}",
        f"baseline sha: {baseline}",
        f"authority validation result: {_authority_validation_result(snapshot)}",
        f"cost authority validation result: PASS {authority.authorityRevision} {authority.canonicalContentHash}",
        f"read-only scope: {task['readScope']}",
        "next response: none",
    ]
    return "\n".join(lines)


def start_preflight(task: Mapping[str, object], thread_id: str, baseline: str, *, branch: str | None = None, state_dir: Path = DEFAULT_STATE_DIR, path: Path = SNAPSHOT_PATH, plugin_root: Path | None = None) -> PreflightResult:
    valid_task = _validate_task(task)
    selected_branch = branch if branch is not None else current_branch()
    if branch is not None and branch != current_branch():
        raise AuthorizationError("explicit branch argument does not match checked-out branch")
    if _is_read_only_task(valid_task):
        snapshot = load_snapshot(path)
        output = _read_only_output(valid_task, snapshot, baseline, plugin_root)
        return PreflightResult("READ_ONLY_ALLOWED", snapshot, valid_task, tuple(), None, output, thread_id)
    inventory_known = True
    try:
        snapshot = load_snapshot(path)
    except SnapshotError:
        # Keep the selector fail-closed when the authority artifact is new or
        # unknown, but expose the required confirmation state instead of
        # converting a recoverable inventory change into a generic error.
        snapshot = _snapshot_from_file(path)
        inventory_known = False
    report = evaluate_task(snapshot, valid_task)
    state = _identity(valid_task, snapshot, report, thread_id, selected_branch, baseline)
    bypass_inventory_gate = inventory_known and not _is_bridge_task(valid_task) and (_is_preflight_self_task(valid_task) or snapshot["status"] == SNAPSHOT_STATUS)
    initial_state = "WAITING_FOR_MODEL_SELECTION" if bypass_inventory_gate else "WAITING_FOR_INVENTORY_CONFIRMATION"
    history = ["PREFLIGHT_REQUIRED", "MUTATION_PREFLIGHT_REQUIRED", initial_state]
    if bypass_inventory_gate:
        history.insert(2, "INVENTORY_CONFIRMED_UNCHANGED")
    state.update({"authorizationPath": "MUTATION_PREFLIGHT_REQUIRED", "state": initial_state, "stateHistory": history, "createdAt": _now(), "inventoryConfirmedAt": _now() if bypass_inventory_gate else None, "expiresAfterSeconds": STATE_TTL_SECONDS})
    _write_state(state, state_dir)
    candidates = build_candidate_matrix(snapshot)
    if bypass_inventory_gate:
        output = _output(snapshot, report, "WAITING_FOR_MODEL_SELECTION", "CONTINUE")
        return PreflightResult("WAITING_FOR_MODEL_SELECTION", snapshot, valid_task, candidates, report, output, thread_id)
    output = _output(snapshot, report, "WAITING_FOR_INVENTORY_CONFIRMATION", "INVENTORY_OK or INVENTORY_CHANGED")
    return PreflightResult("WAITING_FOR_INVENTORY_CONFIRMATION", snapshot, valid_task, candidates, report, output, thread_id)


def record_inventory_ok(thread_id: str, task: Mapping[str, object], baseline: str, *, branch: str | None = None, state_dir: Path = DEFAULT_STATE_DIR, path: Path = SNAPSHOT_PATH) -> PreflightResult:
    snapshot = load_snapshot(path)
    valid_task = _validate_task(task)
    selected_branch = branch if branch is not None else current_branch()
    if branch is not None and branch != current_branch():
        raise AuthorizationError("explicit branch argument does not match checked-out branch")
    report = evaluate_task(snapshot, valid_task)
    state = _read_state(thread_id, state_dir)
    _assert_identity(state, valid_task, snapshot, report, thread_id, selected_branch, baseline)
    if state["state"] == "WAITING_FOR_MODEL_SELECTION" and state.get("inventoryConfirmedAt"):
        return PreflightResult("WAITING_FOR_MODEL_SELECTION", snapshot, valid_task, build_candidate_matrix(snapshot), report, _output(snapshot, report, "WAITING_FOR_MODEL_SELECTION", "CONTINUE"), thread_id)
    if state["state"] != "WAITING_FOR_INVENTORY_CONFIRMATION":
        raise AuthorizationError("INVENTORY_OK is invalid in the current state")
    state["stateHistory"].append("INVENTORY_CONFIRMED")
    state["state"] = "WAITING_FOR_MODEL_SELECTION"
    state["stateHistory"].append("WAITING_FOR_MODEL_SELECTION")
    state["inventoryConfirmedAt"] = _now()
    _write_state(state, state_dir)
    return PreflightResult("WAITING_FOR_MODEL_SELECTION", snapshot, valid_task, build_candidate_matrix(snapshot), report, _output(snapshot, report, "WAITING_FOR_MODEL_SELECTION", "CONTINUE"), thread_id)


def _authority_report(snapshot: Mapping[str, object], updated_snapshot: Mapping[str, object]) -> str:
    lines = [
        "status: INVENTORY_CHANGED",
        f"authority artifact: {snapshot['sourceArtifact']['path']}",
        f"authority blob sha: {snapshot['sourceArtifact']['blobSha']}",
        f"current snapshot revision: {snapshot['snapshotRevision']}",
        f"current snapshot hash: {snapshot['canonicalContentHash']}",
        f"new snapshot revision: {updated_snapshot['snapshotRevision']}",
        f"new snapshot hash: {updated_snapshot['canonicalContentHash']}",
        f"model diff: {snapshot['completeModelCount']} -> {updated_snapshot['completeModelCount']}",
        f"pair diff: {snapshot['completeModelEffortPairCount']} -> {updated_snapshot['completeModelEffortPairCount']}",
        f"maintenance task: {MAINTENANCE_TASK_ID}",
    ]
    return "\n".join(lines)


def record_inventory_changed(thread_id: str, *, state_dir: Path = DEFAULT_STATE_DIR) -> str:
    state = _read_state(thread_id, state_dir)
    snapshot = load_snapshot()
    updated_snapshot = _build_snapshot_from_inventory()
    if state["snapshotRevision"] != snapshot["snapshotRevision"] or state["snapshotHash"] != snapshot["canonicalContentHash"]:
        raise AuthorizationError("current state is not bound to the canonical snapshot")
    state["state"] = "BLOCKED_MODEL_INVENTORY_CHANGED"
    state["blockedAt"] = _now()
    state["maintenanceTask"] = MAINTENANCE_TASK_ID
    _write_state(state, state_dir)
    return _authority_report(snapshot, updated_snapshot)


def record_continue(thread_id: str, token: str, task: Mapping[str, object], baseline: str, *, branch: str | None = None, state_dir: Path = DEFAULT_STATE_DIR, path: Path = SNAPSHOT_PATH) -> str:
    if token.strip() != "CONTINUE":
        raise AuthorizationError("exact CONTINUE is required")
    snapshot = load_snapshot(path)
    valid_task = _validate_task(task)
    selected_branch = branch if branch is not None else current_branch()
    if branch is not None and branch != current_branch():
        raise AuthorizationError("explicit branch argument does not match checked-out branch")
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


def run_preflight(user_response: str | None = None, *, thread_id: str | None = None, path: Path = SNAPSHOT_PATH, task: Mapping[str, object] | None = None, baseline: str = "", branch: str = "", plugin_root: Path | None = None) -> PreflightResult:
    if task is None:
        raise TaskDescriptionError("structured task description is required")
    if not thread_id or not baseline or not branch:
        raise AuthorizationError("thread, baseline, and branch are required")
    result = start_preflight(task, thread_id, baseline, branch=branch, path=path, state_dir=DEFAULT_STATE_DIR, plugin_root=plugin_root)
    if result.status == "READ_ONLY_ALLOWED":
        return result
    if user_response is None:
        return result
    if user_response.strip() == "INVENTORY_CHANGED":
        return PreflightResult("BLOCKED_MODEL_INVENTORY_CHANGED", result.snapshot, result.task, result.candidates, result.report, result.output + f"\nmaintenance task: {MAINTENANCE_TASK_ID}", thread_id)
    if user_response.strip() == "INVENTORY_OK":
        return record_inventory_ok(thread_id, task, baseline, branch=branch, path=path, state_dir=DEFAULT_STATE_DIR)
    raise AuthorizationError("expected exact INVENTORY_OK or INVENTORY_CHANGED")
