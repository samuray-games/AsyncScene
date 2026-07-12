"""Schema helpers for immutable AI forensics packages."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from hashlib import sha256
from pathlib import Path
import json
import re
import secrets
from typing import Any
from zoneinfo import ZoneInfo

SCHEMA_VERSION = "AI_FORENSICS_V1"
RUN_INDEX_MARKER = "<!-- AI_FORENSICS_RUN_V1 -->"
ANALYSIS_CURSOR_MARKER = "<!-- AI_FORENSICS_ANALYSIS_CURSOR_V1 -->"
RUN_INDEX_ISSUE = 224
ACTORS = ("CODEX", "WORK", "GITHUB", "CHATGPT_ANALYSIS")
UPLOAD_STATUSES = (
    "LOCAL_CAPTURED",
    "UPLOAD_PENDING",
    "UPLOADED",
    "UPLOAD_BLOCKED_REDACTION_FAIL",
    "UPLOAD_BLOCKED_AUTH",
    "UPLOAD_FAILED",
)
MAX_TEXT_FILE_BYTES = 2 * 1024 * 1024
MAX_PACKAGE_BYTES = 8 * 1024 * 1024
JST = ZoneInfo("Asia/Tokyo")
REQUIRED_PACKAGE_FILES = (
    "manifest.json",
    "events.jsonl",
    "summary.json",
    "git-evidence.json",
    "redaction-report.json",
    "checksums.json",
)

SECRET_PLACEHOLDERS = {
    "",
    "TODO",
    "TBD",
    "REPLACE_ME",
    "PLACEHOLDER",
    "N/A",
}

MANIFEST_FIELDS: dict[str, type[Any] | tuple[type[Any], ...]] = {
    "schemaVersion": str,
    "actor": str,
    "runId": str,
    "taskId": (str, type(None)),
    "status": str,
    "repository": str,
    "branch": str,
    "packagePath": str,
    "createdAtUtc": str,
    "createdAtJst": str,
}


@dataclass(frozen=True)
class TruncationMetadata:
    path: str
    original_bytes: int
    published_bytes: int
    sha256: str


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def utc_now_iso() -> str:
    return utc_now().replace(microsecond=0).isoformat().replace("+00:00", "Z")


def to_jst_display(utc_timestamp: str) -> str:
    instant = parse_utc(utc_timestamp)
    return instant.astimezone(JST).strftime("%Y-%m-%d %H:%M:%S JST")


def parse_utc(value: str) -> datetime:
    normalized = value.replace("Z", "+00:00")
    return datetime.fromisoformat(normalized).astimezone(timezone.utc)


def deterministic_json_dumps(payload: Any) -> str:
    return json.dumps(payload, ensure_ascii=False, sort_keys=True, indent=2) + "\n"


def sha256_bytes(payload: bytes) -> str:
    return sha256(payload).hexdigest()


def sha256_text(payload: str) -> str:
    return sha256_bytes(payload.encode("utf-8"))


def stable_slug(value: str) -> str:
    collapsed = re.sub(r"[^a-zA-Z0-9._-]+", "-", value.strip())
    collapsed = re.sub(r"-{2,}", "-", collapsed).strip("-")
    return collapsed or "unknown"


def generate_run_id(actor: str, identity: str = "") -> str:
    if actor not in ACTORS:
        raise ValueError(f"unsupported actor: {actor}")
    now = utc_now()
    stamp = now.strftime("%Y%m%dT%H%M%SZ")
    suffix = stable_slug(identity)[:24] if identity else "none"
    nonce = secrets.token_hex(4)
    return f"{actor}-{stamp}-{suffix}-{nonce}"


def package_path_for(actor: str, run_id: str, created_at_utc: str) -> str:
    instant = parse_utc(created_at_utc)
    return (
        f"runs/{instant:%Y/%m/%d}/{actor}/{run_id}"
    )


def build_manifest(
    *,
    actor: str,
    run_id: str,
    status: str,
    repository: str,
    branch: str,
    task_id: str | None,
    created_at_utc: str | None = None,
) -> dict[str, Any]:
    if actor not in ACTORS:
        raise ValueError(f"unsupported actor: {actor}")
    if status not in UPLOAD_STATUSES:
        raise ValueError(f"unsupported upload status: {status}")
    created_at_utc = created_at_utc or utc_now_iso()
    return {
        "schemaVersion": SCHEMA_VERSION,
        "actor": actor,
        "runId": run_id,
        "taskId": task_id,
        "status": status,
        "repository": repository,
        "branch": branch,
        "packagePath": package_path_for(actor, run_id, created_at_utc),
        "createdAtUtc": created_at_utc,
        "createdAtJst": to_jst_display(created_at_utc),
    }


def validate_manifest(manifest: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if set(manifest) != set(MANIFEST_FIELDS):
        missing = sorted(set(MANIFEST_FIELDS) - set(manifest))
        extra = sorted(set(manifest) - set(MANIFEST_FIELDS))
        if missing:
            errors.append(f"missing manifest keys: {missing}")
        if extra:
            errors.append(f"unexpected manifest keys: {extra}")
    for key, expected_type in MANIFEST_FIELDS.items():
        value = manifest.get(key)
        if key not in manifest:
            continue
        if not isinstance(value, expected_type):
            errors.append(f"manifest key {key!r} has wrong type")
            continue
        if isinstance(value, str):
            trimmed = value.strip()
            if not trimmed:
                errors.append(f"manifest key {key!r} is empty")
            if trimmed in SECRET_PLACEHOLDERS:
                errors.append(f"manifest key {key!r} uses placeholder value")
    if manifest.get("schemaVersion") != SCHEMA_VERSION:
        errors.append("manifest schemaVersion mismatch")
    if manifest.get("actor") not in ACTORS:
        errors.append("manifest actor is unsupported")
    if manifest.get("status") not in UPLOAD_STATUSES:
        errors.append("manifest status is unsupported")
    package_path = manifest.get("packagePath", "")
    actor = manifest.get("actor")
    run_id = manifest.get("runId")
    if actor and run_id:
        expected_fragment = f"/{actor}/{run_id}"
        if expected_fragment not in package_path:
            errors.append("manifest packagePath does not match actor/runId")
    return errors


def ensure_package_files(files: dict[str, bytes]) -> list[str]:
    errors: list[str] = []
    for required in REQUIRED_PACKAGE_FILES:
        if required not in files:
            errors.append(f"missing package file: {required}")
    total_bytes = sum(len(value) for value in files.values())
    if total_bytes > MAX_PACKAGE_BYTES:
        errors.append("package exceeds MAX_PACKAGE_BYTES")
    return errors


def write_json(path: Path, payload: Any) -> None:
    path.write_text(deterministic_json_dumps(payload), encoding="utf-8")

