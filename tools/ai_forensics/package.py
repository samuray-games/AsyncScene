"""Immutable package construction helpers."""

from __future__ import annotations

from dataclasses import dataclass
import json
from typing import Any

from . import schema
from .redact import scan_text_for_private_content


@dataclass(frozen=True)
class PackagedFile:
    path: str
    content: bytes


def _append_truncation(
    truncations: list[dict[str, Any]],
    *,
    path: str,
    original_bytes: int,
    published_bytes: int,
    sha256: str,
) -> None:
    truncations.append(
        {
            "path": path,
            "originalBytes": original_bytes,
            "publishedBytes": published_bytes,
            "sha256": sha256,
        }
    )


def truncate_text(path: str, text: str) -> tuple[str, schema.TruncationMetadata | None]:
    raw = text.encode("utf-8")
    if len(raw) <= schema.MAX_TEXT_FILE_BYTES:
        return text, None
    truncated_bytes = raw[: schema.MAX_TEXT_FILE_BYTES]
    truncated_text = truncated_bytes.decode("utf-8", errors="ignore")
    metadata = schema.TruncationMetadata(
        path=path,
        original_bytes=len(raw),
        published_bytes=len(truncated_text.encode("utf-8")),
        sha256=schema.sha256_bytes(raw),
    )
    return truncated_text, metadata


def _json_truncation_envelope(path: str, payload: Any, raw: bytes) -> dict[str, Any]:
    envelope: dict[str, Any] = {
        "truncated": True,
        "path": path,
        "reason": "exceeds MAX_TEXT_FILE_BYTES",
        "originalBytes": len(raw),
        "sha256": schema.sha256_bytes(raw),
        "topLevelType": type(payload).__name__,
    }
    if isinstance(payload, dict):
        envelope["topLevelKeyCount"] = len(payload)
        envelope["topLevelKeys"] = sorted(str(key) for key in payload)[:64]
    elif isinstance(payload, list):
        envelope["itemCount"] = len(payload)
    return envelope


def _bounded_json_bytes(path: str, payload: Any, truncations: list[dict[str, Any]]) -> bytes:
    text = schema.deterministic_json_dumps(payload)
    raw = text.encode("utf-8")
    if len(raw) <= schema.MAX_TEXT_FILE_BYTES:
        return raw
    envelope = _json_truncation_envelope(path, payload, raw)
    bounded = schema.deterministic_json_dumps(envelope).encode("utf-8")
    _append_truncation(
        truncations,
        path=path,
        original_bytes=len(raw),
        published_bytes=len(bounded),
        sha256=schema.sha256_bytes(raw),
    )
    return bounded


def _bounded_event_line(event: dict[str, Any], index: int, truncations: list[dict[str, Any]]) -> bytes:
    line = schema.compact_json_dumps(event) + "\n"
    raw = line.encode("utf-8")
    if len(raw) <= schema.MAX_TEXT_FILE_BYTES:
        return raw
    replacement = {
        "truncated": True,
        "kind": "oversize-event",
        "eventIndex": index,
        "originalBytes": len(raw),
        "sha256": schema.sha256_bytes(raw),
        "reason": "serialized event exceeded MAX_TEXT_FILE_BYTES",
    }
    bounded = (schema.compact_json_dumps(replacement) + "\n").encode("utf-8")
    _append_truncation(
        truncations,
        path=f"events.jsonl#event-{index}",
        original_bytes=len(raw),
        published_bytes=len(bounded),
        sha256=schema.sha256_bytes(raw),
    )
    return bounded


def _omitted_events_line(omitted: list[bytes], first_index: int) -> bytes:
    payload = {
        "truncated": True,
        "kind": "omitted-events-tail",
        "firstOmittedEventIndex": first_index,
        "omittedEventCount": len(omitted),
        "originalBytes": sum(len(item) for item in omitted),
        "sha256": schema.sha256_bytes(b"".join(omitted)),
        "reason": "events.jsonl exceeded MAX_TEXT_FILE_BYTES",
    }
    return (schema.compact_json_dumps(payload) + "\n").encode("utf-8")


def _bounded_events_jsonl(events: list[dict[str, Any]], truncations: list[dict[str, Any]]) -> bytes:
    candidate_lines = [_bounded_event_line(event, index, truncations) for index, event in enumerate(events)]
    raw = b"".join(candidate_lines)
    if len(raw) <= schema.MAX_TEXT_FILE_BYTES:
        return raw

    kept_count = len(candidate_lines)
    while kept_count > 0:
        omitted = candidate_lines[kept_count:]
        omission_line = _omitted_events_line(omitted, kept_count) if omitted else b""
        kept = candidate_lines[:kept_count]
        published = b"".join(kept) + omission_line
        if len(published) <= schema.MAX_TEXT_FILE_BYTES:
            _append_truncation(
                truncations,
                path="events.jsonl",
                original_bytes=len(raw),
                published_bytes=len(published),
                sha256=schema.sha256_bytes(raw),
            )
            return published
        kept_count -= 1

    omission_only = _omitted_events_line(candidate_lines, 0)
    _append_truncation(
        truncations,
        path="events.jsonl",
        original_bytes=len(raw),
        published_bytes=len(omission_only),
        sha256=schema.sha256_bytes(raw),
    )
    return omission_only


def build_package_files(
    *,
    manifest: dict[str, Any],
    events: list[dict[str, Any]],
    summary: dict[str, Any],
    git_evidence: dict[str, Any],
    redaction_report: dict[str, Any],
    extras: dict[str, Any] | None = None,
) -> tuple[dict[str, bytes], list[dict[str, Any]]]:
    truncations: list[dict[str, Any]] = []
    files: dict[str, bytes] = {}
    extras = extras or {}

    def add_json(path: str, payload: Any) -> None:
        files[path] = _bounded_json_bytes(path, payload, truncations)

    add_json("manifest.json", manifest)
    files["events.jsonl"] = _bounded_events_jsonl(events, truncations)

    add_json("summary.json", summary)
    add_json("git-evidence.json", git_evidence)
    add_json("redaction-report.json", redaction_report)

    for path, payload in extras.items():
        if isinstance(payload, bytes):
            try:
                decoded = payload.decode("utf-8")
            except UnicodeDecodeError as exc:
                raise ValueError(f"binary or non-UTF-8 extra rejected: {path}") from exc
            trimmed, extra_truncation = truncate_text(path, decoded)
            content = trimmed.encode("utf-8")
            if extra_truncation is not None:
                truncations.append(
                    {
                        "path": extra_truncation.path,
                        "originalBytes": extra_truncation.original_bytes,
                        "publishedBytes": extra_truncation.published_bytes,
                        "sha256": extra_truncation.sha256,
                    }
                )
        elif isinstance(payload, str):
            trimmed, extra_truncation = truncate_text(path, payload)
            content = trimmed.encode("utf-8")
            if extra_truncation is not None:
                truncations.append(
                    {
                        "path": extra_truncation.path,
                        "originalBytes": extra_truncation.original_bytes,
                        "publishedBytes": extra_truncation.published_bytes,
                        "sha256": extra_truncation.sha256,
                    }
                )
        else:
            content = _bounded_json_bytes(path, payload, truncations)
        files[path] = content

    checksums = {
        path: {
            "bytes": len(content),
            "sha256": schema.sha256_bytes(content),
        }
        for path, content in sorted(files.items())
    }
    files["checksums.json"] = schema.deterministic_json_dumps(checksums).encode("utf-8")

    errors = schema.ensure_package_files(files)
    for path, content in files.items():
        try:
            text = content.decode("utf-8")
        except UnicodeDecodeError:
            errors.append(f"non-UTF-8 package file: {path}")
            continue
        if path.endswith(".json"):
            try:
                json.loads(text)
            except json.JSONDecodeError as exc:
                errors.append(f"{path} is invalid JSON: {exc}")
        findings = scan_text_for_private_content(text)
        if findings:
            errors.append(f"private content scan failed for {path}: {findings}")
    for line_number, line in enumerate(files.get("events.jsonl", b"").decode("utf-8").splitlines(), start=1):
        if not line.strip():
            continue
        try:
            json.loads(line)
        except json.JSONDecodeError as exc:
            errors.append(f"events.jsonl line {line_number} is invalid JSON: {exc}")
    if errors:
        raise ValueError("; ".join(errors))
    return files, truncations
