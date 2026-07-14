from __future__ import annotations

import hashlib
import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


MODEL_LINE_RE = re.compile(r"^- (?P<label>[^:]+): (?P<efforts>.+)$")


@dataclass(frozen=True)
class ParsedInventory:
    models: tuple[dict[str, object], ...]
    model_count: int
    pair_count: int


def normalize_model_identifier(label: str) -> str:
    return "gpt-" + label.strip().lower().replace(" ", "-")


def normalize_effort_identifier(label: str) -> str:
    return label.strip().lower().replace(" ", "-")


def parse_inventory_markdown(path: Path) -> ParsedInventory:
    models: list[dict[str, object]] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        match = MODEL_LINE_RE.match(line)
        if not match:
            continue
        model_label = match.group("label").strip()
        effort_labels = [item.strip().rstrip(";").rstrip(".") for item in match.group("efforts").split(",")]
        models.append(
            {
                "modelLabel": model_label,
                "modelIdentifier": normalize_model_identifier(model_label),
                "supportedEfforts": [
                    {
                        "effortLabel": effort_label,
                        "effortIdentifier": normalize_effort_identifier(effort_label),
                    }
                    for effort_label in effort_labels
                ],
            }
        )
    return ParsedInventory(tuple(models), len(models), sum(len(model["supportedEfforts"]) for model in models))


def canonical_snapshot_payload(*, snapshot_revision: str, confirmed_timestamp: str, confirmation_source: str, application_surface: str, supersedes: str | None, source_artifact_path: str, source_artifact_blob_sha: str, status: str, models: Iterable[dict[str, object]], notes: list[str]) -> dict[str, object]:
    model_list = [dict(model) for model in models]
    payload = {
        "schemaVersion": "1.0.11",
        "snapshotRevision": snapshot_revision,
        "confirmedTimestamp": confirmed_timestamp,
        "confirmationSource": confirmation_source,
        "applicationSurface": application_surface,
        "sourceArtifact": {
            "path": source_artifact_path,
            "blobSha": source_artifact_blob_sha,
            "provenanceType": "repository-markdown",
        },
        "models": model_list,
        "completeModelCount": len(model_list),
        "completeModelEffortPairCount": sum(len(model["supportedEfforts"]) for model in model_list),
        "canonicalContentHash": "PLACEHOLDER",
        "status": status,
        "supersedes": supersedes,
        "notes": notes,
    }
    payload["canonicalContentHash"] = canonical_hash(payload)
    return payload


def canonical_hash(snapshot: dict[str, object]) -> str:
    payload = dict(snapshot)
    payload.pop("canonicalContentHash", None)
    return "sha256:" + hashlib.sha256(json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode("utf-8")).hexdigest()
