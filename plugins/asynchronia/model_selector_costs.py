"""Versioned official Codex-credit authority for selector cost ordering."""

from __future__ import annotations

import hashlib
import json
import re
import subprocess
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation
from pathlib import Path
from typing import Mapping, Sequence


COST_AUTHORITY_PATH = Path(__file__).with_name("model-selector-cost-authority.json")
PRICING_BASIS = "CODEX_CREDITS_PER_1M_TOKENS_STANDARD_SPEED"
AUTHORITY_REVISION = "20260801.1"
STATUS = "ACTIVE"
DECIMAL_RE = re.compile(r"^(?:0|[1-9][0-9]*)(?:\.[0-9]+)?$")


class CostAuthorityError(ValueError):
    pass


@dataclass(frozen=True)
class CostVector:
    inputCredits: str
    cachedInputCredits: str
    outputCredits: str

    def decimals(self) -> tuple[Decimal, Decimal, Decimal]:
        return tuple(Decimal(value) for value in (self.inputCredits, self.cachedInputCredits, self.outputCredits))  # type: ignore[return-value]


@dataclass(frozen=True)
class CostTier:
    index: int
    modelIdentifiers: tuple[str, ...]
    vector: CostVector


@dataclass(frozen=True)
class CostAuthority:
    schemaVersion: str
    authorityRevision: str
    pricingBasis: str
    standardSpeed: str
    confirmedTimestamp: str
    officialSourceUrl: str
    sourceArtifactPath: str
    sourceArtifactBlobSha: str
    models: Mapping[str, CostVector]
    tiers: tuple[CostTier, ...]
    status: str
    canonicalContentHash: str


def _canonical_payload(value: Mapping[str, object]) -> bytes:
    payload = dict(value)
    payload.pop("canonicalContentHash", None)
    return json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode("utf-8")


def canonical_hash(value: Mapping[str, object]) -> str:
    return "sha256:" + hashlib.sha256(_canonical_payload(value)).hexdigest()


def _decimal(value: object, label: str) -> str:
    if not isinstance(value, str) or not DECIMAL_RE.fullmatch(value):
        raise CostAuthorityError(f"invalid decimal value for {label}")
    try:
        parsed = Decimal(value)
    except InvalidOperation as exc:
        raise CostAuthorityError(f"invalid decimal value for {label}") from exc
    if not parsed.is_finite() or parsed < 0:
        raise CostAuthorityError(f"negative or non-finite value for {label}")
    return value


def _blob_sha(path: Path) -> str:
    try:
        result = subprocess.run(["git", "hash-object", str(path)], check=True, capture_output=True, text=True)
    except (OSError, subprocess.CalledProcessError) as exc:
        raise CostAuthorityError(f"unable to hash source artifact: {path}") from exc
    return result.stdout.strip()


def _vector_from_record(record: Mapping[str, object], model_id: str) -> CostVector:
    required = {"modelIdentifier", "inputCredits", "cachedInputCredits", "outputCredits"}
    if set(record) != required or record.get("modelIdentifier") != model_id:
        raise CostAuthorityError(f"malformed cost record for {model_id}")
    return CostVector(
        _decimal(record["inputCredits"], f"{model_id}.inputCredits"),
        _decimal(record["cachedInputCredits"], f"{model_id}.cachedInputCredits"),
        _decimal(record["outputCredits"], f"{model_id}.outputCredits"),
    )


def _dominates(left: CostVector, right: CostVector) -> bool:
    a = left.decimals()
    b = right.decimals()
    return all(x <= y for x, y in zip(a, b)) and any(x < y for x, y in zip(a, b))


def _compare_vectors(left: CostVector, right: CostVector) -> int:
    if left.decimals() == right.decimals():
        return 0
    if _dominates(left, right):
        return -1
    if _dominates(right, left):
        return 1
    raise CostAuthorityError("AMBIGUOUS_COST_ORDER: incomparable cost vectors")


def build_cost_tiers(models: Mapping[str, CostVector]) -> tuple[CostTier, ...]:
    identifiers = list(models)
    for index, left_id in enumerate(identifiers):
        for right_id in identifiers[index + 1 :]:
            _compare_vectors(models[left_id], models[right_id])
    unique: list[tuple[CostVector, list[str]]] = []
    for model_id in identifiers:
        vector = models[model_id]
        match = next((entry for entry in unique if entry[0].decimals() == vector.decimals()), None)
        if match:
            match[1].append(model_id)
        else:
            unique.append((vector, [model_id]))
    remaining = list(unique)
    ordered: list[tuple[CostVector, list[str]]] = []
    while remaining:
        minimal = [entry for entry in remaining if not any(_dominates(other[0], entry[0]) for other in remaining if other is not entry)]
        if len(minimal) != 1:
            raise CostAuthorityError("AMBIGUOUS_COST_ORDER: cost tiers cannot be ordered")
        chosen = minimal[0]
        ordered.append(chosen)
        remaining.remove(chosen)
    return tuple(CostTier(index + 1, tuple(model_ids), vector) for index, (vector, model_ids) in enumerate(ordered))


def validate_authority(authority: Mapping[str, object], *, repository_root: Path | None = None, inventory_model_ids: Sequence[str] | None = None) -> CostAuthority:
    required = {
        "schemaVersion", "authorityRevision", "pricingBasis", "standardSpeed", "confirmedTimestamp",
        "officialSourceUrl", "sourceArtifactPath", "sourceArtifactBlobSha", "models", "derivedCostTiers",
        "status", "canonicalContentHash",
    }
    if set(authority) != required:
        raise CostAuthorityError("cost authority schema fields mismatch")
    if authority["authorityRevision"] != AUTHORITY_REVISION or authority["pricingBasis"] != PRICING_BASIS:
        raise CostAuthorityError("unsupported cost authority identity")
    if authority["standardSpeed"] != "Standard" or authority["status"] != STATUS:
        raise CostAuthorityError("unsupported cost authority speed or status")
    if not isinstance(authority["sourceArtifactPath"], str) or not authority["sourceArtifactPath"].strip():
        raise CostAuthorityError("source artifact path is missing")
    if not isinstance(authority["sourceArtifactBlobSha"], str) or not re.fullmatch(r"[0-9a-f]{40}", authority["sourceArtifactBlobSha"]):
        raise CostAuthorityError("source artifact blob sha is malformed")
    if not isinstance(authority["officialSourceUrl"], str) or not authority["officialSourceUrl"].startswith("https://help.openai.com/"):
        raise CostAuthorityError("cost authority provenance is not official")
    if authority["canonicalContentHash"] != canonical_hash(authority):
        raise CostAuthorityError("cost authority canonical hash mismatch")
    records = authority["models"]
    if not isinstance(records, list) or not records:
        raise CostAuthorityError("cost authority models must be a non-empty list")
    models: dict[str, CostVector] = {}
    for record in records:
        if not isinstance(record, Mapping):
            raise CostAuthorityError("cost authority model record is malformed")
        model_id = record.get("modelIdentifier")
        if not isinstance(model_id, str) or not model_id or model_id in models:
            raise CostAuthorityError("duplicate or malformed cost model")
        models[model_id] = _vector_from_record(record, model_id)
    if inventory_model_ids is not None and set(models) != set(inventory_model_ids):
        raise CostAuthorityError("cost authority model set does not match active inventory")
    tiers = build_cost_tiers(models)
    serialized_tiers = [list(tier.modelIdentifiers) for tier in tiers]
    if authority["derivedCostTiers"] != serialized_tiers:
        raise CostAuthorityError("derived cost tiers do not match cost vectors")
    if repository_root is not None:
        artifact = Path(authority["sourceArtifactPath"])
        if not artifact.is_absolute():
            artifact = repository_root / artifact
        if not artifact.is_file() or _blob_sha(artifact) != authority["sourceArtifactBlobSha"]:
            raise CostAuthorityError("source artifact blob verification failed")
    return CostAuthority(
        str(authority["schemaVersion"]), str(authority["authorityRevision"]), str(authority["pricingBasis"]),
        str(authority["standardSpeed"]), str(authority["confirmedTimestamp"]), str(authority["officialSourceUrl"]),
        str(authority["sourceArtifactPath"]), str(authority["sourceArtifactBlobSha"]), models, tiers,
        str(authority["status"]), str(authority["canonicalContentHash"]),
    )


def load_cost_authority(path: Path = COST_AUTHORITY_PATH, *, repository_root: Path | None = None, inventory_model_ids: Sequence[str] | None = None) -> CostAuthority:
    try:
        authority = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise CostAuthorityError(f"unable to read cost authority: {path}") from exc
    if not isinstance(authority, Mapping):
        raise CostAuthorityError("cost authority must be an object")
    return validate_authority(authority, repository_root=repository_root, inventory_model_ids=inventory_model_ids)


def tier_for_model(authority: CostAuthority, model_identifier: str) -> CostTier:
    for tier in authority.tiers:
        if model_identifier in tier.modelIdentifiers:
            return tier
    raise CostAuthorityError(f"model is missing from cost tiers: {model_identifier}")


def selection_key(evaluation: object, authority: CostAuthority, effort_index: int, ordinal: int) -> tuple[object, ...]:
    model_identifier = getattr(evaluation, "modelIdentifier")
    tier = tier_for_model(authority, model_identifier)
    retry_rank = {"LOW": 0, "MEDIUM": 1, "HIGH": 2}.get(getattr(evaluation, "retryRisk"), 99)
    escalation_rank = {"LOW": 0, "MEDIUM": 1, "HIGH": 2}.get(getattr(evaluation, "escalationRisk"), 99)
    return (tier.index, effort_index, retry_rank, escalation_rank, -getattr(evaluation, "capabilityScore"), ordinal)


def exact_vector_text(vector: CostVector) -> str:
    return f"{vector.inputCredits}/{vector.cachedInputCredits}/{vector.outputCredits}"
