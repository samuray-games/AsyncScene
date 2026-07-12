"""Immutable package construction helpers."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from . import schema


@dataclass(frozen=True)
class PackagedFile:
    path: str
    content: bytes


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
        text = schema.deterministic_json_dumps(payload)
        text, truncated = truncate_text(path, text)
        files[path] = text.encode("utf-8")
        if truncated is not None:
            truncations.append(
                {
                    "path": truncated.path,
                    "originalBytes": truncated.original_bytes,
                    "publishedBytes": truncated.published_bytes,
                    "sha256": truncated.sha256,
                }
            )

    add_json("manifest.json", manifest)

    events_text = "".join(
        schema.deterministic_json_dumps(event) for event in events
    )
    events_text, truncated = truncate_text("events.jsonl", events_text)
    files["events.jsonl"] = events_text.encode("utf-8")
    if truncated is not None:
        truncations.append(
            {
                "path": truncated.path,
                "originalBytes": truncated.original_bytes,
                "publishedBytes": truncated.published_bytes,
                "sha256": truncated.sha256,
            }
        )

    add_json("summary.json", summary)
    add_json("git-evidence.json", git_evidence)
    add_json("redaction-report.json", redaction_report)

    for path, payload in extras.items():
        if isinstance(payload, bytes):
            content = payload
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
            encoded = schema.deterministic_json_dumps(payload)
            encoded, extra_truncation = truncate_text(path, encoded)
            content = encoded.encode("utf-8")
            if extra_truncation is not None:
                truncations.append(
                    {
                        "path": extra_truncation.path,
                        "originalBytes": extra_truncation.original_bytes,
                        "publishedBytes": extra_truncation.published_bytes,
                        "sha256": extra_truncation.sha256,
                    }
                )
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
    if errors:
        raise ValueError("; ".join(errors))
    return files, truncations
