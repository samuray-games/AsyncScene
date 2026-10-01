Warning: truncated output (original token count: 13837)
Total output lines: 1038

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
from typing import Callable, Iterable, Mapping, Sequence

from .model_selector_inventory import canonical_hash, canonical_snapshot_payload, normalize_effort_identifier, normalize_model_identifier, parse_inventory_markdown, parse_inventory_metadata
from .model_selector_costs import CostAuthority, CostAuthorityError, exact_vector_text, load_cost_authority, selection_key, tier_for_model


AUTHORITY_MANIFEST_PATH = Path(__file__).with_name("model-selector-authority.json")
SNAPSHOT_PATH = Path(__file__).with_name("snapshots") / "confirmed-model-effort-snapshot.json"
SNAPSHOT_STATUS = "PENDING_CONFIRMATION"
SNAPSHOT_SCHEMA_VERSION = "1.0.11"
PLUGIN_VERSION = "1.0.18"
MAINTENANCE_TASK_ID = "TASK-INFRA-MODEL-SNAPSHOT-MAINTENANCE-20261001"
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
def extend_model_stable_floor_ranks(ordered_model_ids: Sequence[str], anchors: Mapping[str, int]) -> dict[str, int]:
    """Extend fixed floor-rank anchors over an ordered inventory without changing anchors."""
    ordered = list(ordered_model_ids)
    if not ordered or len(set(ordered)) != len(ordered):
        raise TaskDescriptionError("model-floor inventory order must be non-empty and unique")
    if not anchors or not set(anchors).issubset(ordered):
        raise TaskDescriptionError("model-floor anchors must be non-empty and present in inventory order")
    if any(not isinstance(rank, int) or isinstance(rank, bool) for rank in anchors.values()):
        raise TaskDescriptionError("model-floor anchor ranks must be integers")
    anchor_positions = sorted((ordered.index(model_id), model_id, rank) for model_id, rank in anchors.items())
    if any(left[2] < right[2] for left, right in zip(anchor_positions, anchor_positions[1:])):
        raise TaskDescriptionError("model-floor anchors contradict ordered inventory")

    result: dict[str, int] = {}
    first_position, first_model, first_rank = anchor_positions[0]
    for position in range(first_position):
        result[ordered[position]] = first_rank + first_position - position
    result[first_model] = first_rank
    for (left_position, left_model, left_rank), (right_position, right_model, right_rank) in zip(anchor_positions, anchor_positions[1:]):
        result[left_model] = left_rank
        for position in range(left_position + 1, right_position):
            result[ordered[position]] = left_rank
        result[right_model] = right_rank
    last_position, last_model, last_rank = anchor_positions[-1]
    result[last_model] = last_rank
    for position in range(last_position + 1, len(ordered)):
        result[ordered[position]] = last_rank - (position - last_position)
    return {model_id: result[model_id] for model_id in ordered}


MODEL_STABLE_FLOOR_RANKS = {
    # Larger values satisfy stronger minimum-model floors; ties are valid.
    # Existing anchors stay fixed. New inventory runs inherit the preceding
    # anchor between ranks, or extend by one rank per model outside the anchors.
    "gpt-6.1-sol": 4,
    "gpt-6-astra": 3,
    "gpt-6-sol": 3,
    "gpt-6-luna": 3,
    "gpt-5.6-sol": 2,
    "gpt-5.6-terra": 1,
    "gpt-5.6-luna": 0,
    "gpt-5.5": -1,
}
MODEL_STABLE_FLOOR_RANK_POLICY = (
    "ordered-inventory; larger-rank-is-stronger; preserve existing anchors; "
    "leading and trailing runs extend one rank per model; interior runs inherit the preceding anchor"
)
MODEL_STABLE_FLOOR_RANK_ANCHORS = {
    "gpt-6-astra": 3,
    "gpt-5.6-sol": 2,
    "gpt-5.6-terra": 1,
    "gpt-5.6-luna": 0,
    "gpt-5.5": -1,
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
    required = {
        "inventoryArtifactPath", "inventoryParser", "provenanceType", "lastAcceptedBlobSha",
        "currentSnapshotRevision", "modelStableFloorRanks", "modelStableFloorRankAnchors", "modelStableFloorRankPolicy",
    }
    if not required.issubset(manifest):
        raise SnapshotError("authority manifest is missing required fields")
    if manifest["modelStableFloorRanks"] != MODEL_STABLE_FLOOR_RANKS:
        raise SnapshotError("authority manifest model floor ranks do not match selector policy")
    if manifest["modelStableFloorRankAnchors"] != MODEL_STABLE_FLOOR_RANK_ANCHORS:
        raise SnapshotError("authority manifest model floor rank anchors do not match selector policy")
    if manifest["modelStableFloorRankPolicy"] != MODEL_STABLE_FLOOR_RANK_POLICY:
        raise SnapshotError("authority manifest model floor rank policy is unsupported")
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
    try:
        parsed = parse_inventory_markdown(artifact_path)
        metadata = parse_inventory_metadata(artifact_path)
    except (OSError, ValueError) as exc:
        raise SnapshotError(f"unable to parse inventory source: {artifact_path}") from exc
    if metadata["SNAPSHOT_REVISION"] != manifest["currentSnapshotRevision"]:
        raise SnapshotError("inventory metadata revision does not match authority manifest")
    if metadata["STATUS"] != SNAPSHOT_STATUS:
        raise SnapshotError("inventory metadata status does not match selector snapshot status")
    return canonical_snapshot_payload(
        snapshot_revision=metadata["SNAPSHOT_REVISION"],
        confirmed_timestamp=metadata["CONFIRMED_TIMESTAMP"],
        confirmation_source=metadata["CONFIRMATION_SOURCE"],
        application_surface=metadata["APPLICATION_SURFACE"],
        supersedes=metadata["SUPERSEDES"],
        source_artifact_path=str(manifest["inventoryArtifactPath"]),
        source_artifact_blob_sha=str(manifest["lastAcceptedBlobSha"]),
        status=metadata["STATUS"],
        models=list(parsed.models),
        notes=[
            "This snapshot is generated from the authoritative repository Markdown inventory.",
            "Snapshot status is pending confirmation under the current selector snapshot contract.",
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
        raise SnapshotError("notes must be a no…4837 tokens truncated…ect], task: Mapping[str, object], snapshot: Mapping[str, object], report: EvaluationReport, thread_id: str, branch: str, baseline: str) -> None:
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


def _inventory_output(snapshot: Mapping[str, object], next_response: str) -> str:
    lines = [
        "status: WAITING_FOR_INVENTORY_CONFIRMATION",
        "authorization path: MUTATION_PREFLIGHT_REQUIRED",
        f"snapshot revision: {snapshot['snapshotRevision']}",
        f"snapshot hash: {snapshot['canonicalContentHash']}",
        f"source artifact: {snapshot['sourceArtifact']['path']}",
        f"source artifact blob sha: {snapshot['sourceArtifact']['blobSha']}",
        f"model count: {snapshot['completeModelCount']}",
        f"model-effort pair count: {snapshot['completeModelEffortPairCount']}",
        "complete authoritative inventory:",
    ]
    for model in snapshot["models"]:
        efforts = ", ".join(effort["effortLabel"] for effort in model["supportedEfforts"])
        lines.append(f"- {model['modelLabel']} ({model['modelIdentifier']}): efforts={efforts}")
    lines.append(f"exact next response: {next_response}")
    return "\n".join(lines)


def _validate_inventory_phase_output(snapshot: Mapping[str, object], output: str) -> None:
    lines = output.splitlines()
    required = (
        "status: WAITING_FOR_INVENTORY_CONFIRMATION",
        "authorization path: MUTATION_PREFLIGHT_REQUIRED",
        f"snapshot revision: {snapshot['snapshotRevision']}",
        f"snapshot hash: {snapshot['canonicalContentHash']}",
        f"source artifact: {snapshot['sourceArtifact']['path']}",
        f"source artifact blob sha: {snapshot['sourceArtifact']['blobSha']}",
        f"model count: {snapshot['completeModelCount']}",
        f"model-effort pair count: {snapshot['completeModelEffortPairCount']}",
        "complete authoritative inventory:",
        "exact next response: INVENTORY_OK or INVENTORY_CHANGED",
    )
    missing = [line for line in required if line not in lines]
    inventory_lines = [line for line in lines if line.startswith("- ")]
    expected_inventory = [
        f"- {model['modelLabel']} ({model['modelIdentifier']}): efforts="
        + ", ".join(effort["effortLabel"] for effort in model["supportedEfforts"])
        for model in snapshot["models"]
    ]
    forbidden = (
        "evaluated pair count:", "required capability score:", "evaluation matrix:",
        "cheapest rejected pair:", "recommended pair:", "next more capable plausible pair:",
    )
    leaked = [prefix for prefix in forbidden if any(line.startswith(prefix) for line in lines)]
    if missing or inventory_lines != expected_inventory or leaked:
        raise AuthorizationError(
            "invalid WAITING_FOR_INVENTORY_CONFIRMATION relay block: "
            f"missing={missing}; inventory_match={inventory_lines == expected_inventory}; leaked={leaked}"
        )


def _validate_recommendation_phase_output(snapshot: Mapping[str, object], report: EvaluationReport, output: str) -> None:
    lines = output.splitlines()
    required_prefixes = (
        "status: WAITING_FOR_MODEL_SELECTION",
        "authorization path: MUTATION_PREFLIGHT_REQUIRED",
        "snapshot revision:", "snapshot hash:", "source artifact:",
        "cost authority revision:", "cost authority hash:", "pricing basis:",
        "official cost source artifact:", "ordered cost tiers:",
        "recommendation selection policy:", "model count:", "model-effort pair count:",
        "evaluated pair count:", "required capability score:", "evaluation matrix:",
        "cheapest rejected pair:", "recommended pair:",
        "next more capable plausible pair:", "exact next response: CONTINUE",
    )
    missing = [prefix for prefix in required_prefixes if not any(line.startswith(prefix) for line in lines)]
    matrix_lines = [line for line in lines if line.startswith("- ")]
    matrix_pairs = [f"- {item.modelLabel} / {item.effortLabel}:" for item in report.evaluations]
    matrix_match = len(matrix_lines) == snapshot["completeModelEffortPairCount"] and all(
        line.startswith(prefix) for line, prefix in zip(matrix_lines, matrix_pairs)
    )
    recommendation_line = f"recommended pair: {report.recommendation.modelLabel} / {report.recommendation.effortLabel}"
    if missing or not matrix_match or recommendation_line not in lines:
        raise AuthorizationError(
            "invalid WAITING_FOR_MODEL_SELECTION relay block: "
            f"missing={missing}; matrix_match={matrix_match}; recommendation_match={recommendation_line in lines}"
        )


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
    snapshot = load_snapshot(path)
    valid_task = _validate_task(task)
    selected_branch = branch if branch is not None else current_branch()
    if branch is not None and branch != current_branch():
        raise AuthorizationError("explicit branch argument does not match checked-out branch")
    if _is_read_only_task(valid_task):
        output = _read_only_output(valid_task, snapshot, baseline, plugin_root)
        return PreflightResult("READ_ONLY_ALLOWED", snapshot, valid_task, tuple(), None, output, thread_id)
    output = _inventory_output(snapshot, "INVENTORY_OK or INVENTORY_CHANGED")
    _validate_inventory_phase_output(snapshot, output)
    state = _preliminary_identity(valid_task, snapshot, thread_id, selected_branch, baseline)
    state["inventoryRelayOutputHash"] = _sha256(output)
    state.update({"authorizationPath": "MUTATION_PREFLIGHT_REQUIRED", "state": "WAITING_FOR_INVENTORY_CONFIRMATION", "stateHistory": ["PREFLIGHT_REQUIRED", "MUTATION_PREFLIGHT_REQUIRED", "WAITING_FOR_INVENTORY_CONFIRMATION"], "createdAt": _now(), "inventoryConfirmedAt": None, "expiresAfterSeconds": STATE_TTL_SECONDS})
    _write_state(state, state_dir)
    candidates = build_candidate_matrix(snapshot)
    return PreflightResult("WAITING_FOR_INVENTORY_CONFIRMATION", snapshot, valid_task, candidates, None, output, thread_id)


def record_inventory_ok(thread_id: str, task: Mapping[str, object], baseline: str, *, branch: str | None = None, state_dir: Path = DEFAULT_STATE_DIR, path: Path = SNAPSHOT_PATH) -> PreflightResult:
    snapshot = load_snapshot(path)
    valid_task = _validate_task(task)
    selected_branch = branch if branch is not None else current_branch()
    if branch is not None and branch != current_branch():
        raise AuthorizationError("explicit branch argument does not match checked-out branch")
    state = _read_state(thread_id, state_dir)
    _assert_preliminary_identity(state, valid_task, snapshot, thread_id, selected_branch, baseline)
    if state["state"] != "WAITING_FOR_INVENTORY_CONFIRMATION":
        raise AuthorizationError("INVENTORY_OK is invalid in the current state")
    inventory_output = _inventory_output(snapshot, "INVENTORY_OK or INVENTORY_CHANGED")
    _validate_inventory_phase_output(snapshot, inventory_output)
    if state.get("inventoryRelayOutputHash") != _sha256(inventory_output):
        raise AuthorizationError("INVENTORY_OK requires the complete inventory relay block")
    report = evaluate_task(snapshot, valid_task)
    output = _output(snapshot, report, "WAITING_FOR_MODEL_SELECTION", "CONTINUE")
    _validate_recommendation_phase_output(snapshot, report, output)
    state.update(_identity(valid_task, snapshot, report, thread_id, selected_branch, baseline))
    state["recommendationRelayOutputHash"] = _sha256(output)
    state["stateHistory"].append("INVENTORY_CONFIRMED")
    state["state"] = "WAITING_FOR_MODEL_SELECTION"
    state["stateHistory"].append("WAITING_FOR_MODEL_SELECTION")
    state["inventoryConfirmedAt"] = _now()
    _write_state(state, state_dir)
    return PreflightResult("WAITING_FOR_MODEL_SELECTION", snapshot, valid_task, build_candidate_matrix(snapshot), report, output, thread_id)


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
    recommendation_output = _output(snapshot, report, "WAITING_FOR_MODEL_SELECTION", "CONTINUE")
    _validate_recommendation_phase_output(snapshot, report, recommendation_output)
    if state.get("recommendationRelayOutputHash") != _sha256(recommendation_output):
        raise AuthorizationError("CONTINUE requires the complete recommendation relay block")
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
