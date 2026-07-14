#!/usr/bin/env python3
"""Non-mutating ChatGPT Desktop host inventory extraction primitives."""
from __future__ import annotations

import hashlib
import json
import plistlib
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Iterable


QUERY_NAME = "list-models-for-host"
SOURCE_LIVE = "CHATGPT_DESKTOP_LIVE_HOST_QUERY"
SOURCE_SNAPSHOT = "USER_CONFIRMED_SNAPSHOT"
SOURCE_APP_SERVER = "APP_SERVER_EVIDENCE"
SOURCE_CACHE = "HISTORICAL_CACHE_HINT"
FALLBACK_SOURCES = {SOURCE_SNAPSHOT, SOURCE_APP_SERVER, SOURCE_CACHE}


@dataclass(frozen=True)
class ModelInventoryEntry:
    model: str
    hidden: bool
    is_default: bool
    default_reasoning_effort: str | None
    supported_reasoning_efforts: tuple[str, ...]


def canonical_hash(value: object) -> str:
    encoded = json.dumps(value, ensure_ascii=True, separators=(",", ":"), sort_keys=True).encode("utf-8")
    return "sha256:" + hashlib.sha256(encoded).hexdigest()


def chatgpt_version(app_path: Path) -> str | None:
    info = app_path / "Contents" / "Info.plist"
    if not info.is_file():
        return None
    payload = plistlib.loads(info.read_bytes())
    version = payload.get("CFBundleShortVersionString")
    return version if isinstance(version, str) else None


def read_asar_header(asar_path: Path) -> tuple[dict[str, Any], int]:
    """Read Electron's JSON header without extracting the application bundle."""
    with asar_path.open("rb") as handle:
        prefix = handle.read(16)
        if len(prefix) != 16:
            raise ValueError("truncated asar header")
        json_size = int.from_bytes(prefix[12:16], "little")
        if json_size <= 0:
            raise ValueError("invalid asar JSON header size")
        encoded = handle.read(json_size)
    decoder = json.JSONDecoder()
    header, _ = decoder.raw_decode(encoded.decode("utf-8"))
    if not isinstance(header, dict):
        raise ValueError("asar header is not an object")
    return header, 16 + json_size


def iter_asar_files(node: dict[str, Any], prefix: str = "") -> Iterable[tuple[str, dict[str, Any]]]:
    files = node.get("files")
    if not isinstance(files, dict):
        return
    for name, child in files.items():
        if not isinstance(name, str) or not isinstance(child, dict):
            continue
        path = f"{prefix}/{name}" if prefix else name
        if "files" in child:
            yield from iter_asar_files(child, path)
        elif "size" in child and "offset" in child:
            yield path, child


def read_asar_file(asar_path: Path, body_offset: int, entry: dict[str, Any]) -> bytes:
    offset = entry.get("offset")
    size = entry.get("size")
    if not isinstance(offset, str) or not isinstance(size, int) or size < 0:
        raise ValueError("malformed asar file entry")
    with asar_path.open("rb") as handle:
        handle.seek(body_offset + int(offset))
        content = handle.read(size)
    if len(content) != size:
        raise ValueError("truncated asar file content")
    return content


def locate_renderer_asset(asar_path: Path) -> str:
    """Locate the current renderer chunk by its mechanism, never a hashed filename."""
    header, body_offset = read_asar_header(asar_path)
    matches: list[str] = []
    for path, entry in iter_asar_files(header):
        if not path.endswith(".js"):
            continue
        content = read_asar_file(asar_path, body_offset, entry)
        if QUERY_NAME.encode() in content and b"available_models" in content and b"use_hidden_models" in content:
            matches.append(path)
    if len(matches) != 1:
        raise ValueError(f"renderer mechanism match count is {len(matches)}")
    return matches[0]


def query_arguments(host_id: str, cursor: str | None, limit: int) -> dict[str, object]:
    if not host_id:
        raise ValueError("hostId is required")
    if limit <= 0:
        raise ValueError("limit must be positive")
    return {"hostId": host_id, "includeHidden": True, "cursor": cursor, "limit": limit}


def _find_first(payload: object, keys: tuple[str, ...]) -> Any:
    if isinstance(payload, dict):
        for key in keys:
            if key in payload:
                return payload[key]
        for value in payload.values():
            found = _find_first(value, keys)
            if found is not None:
                return found
    elif isinstance(payload, list):
        for value in payload:
            found = _find_first(value, keys)
            if found is not None:
                return found
    return None


def _effort_identifier(value: object) -> str:
    if isinstance(value, str) and value:
        return value
    if isinstance(value, dict):
        for key in ("reasoningEffort", "effort", "id"):
            candidate = value.get(key)
            if isinstance(candidate, str) and candidate:
                return candidate
    raise ValueError("malformed reasoning effort")


def parse_live_page(payload: object) -> tuple[list[ModelInventoryEntry], str | None]:
    models = _find_first(payload, ("models", "available_models"))
    if not isinstance(models, list):
        raise ValueError("live query response has no model list")
    entries: list[ModelInventoryEntry] = []
    for item in models:
        if not isinstance(item, dict):
            raise ValueError("malformed model response")
        model = item.get("model")
        efforts = item.get("supportedReasoningEfforts")
        if not isinstance(model, str) or not model or not isinstance(efforts, list) or not efforts:
            raise ValueError("incomplete model response")
        default_effort = item.get("defaultReasoningEffort")
        if default_effort is not None and not isinstance(default_effort, str):
            raise ValueError("malformed default reasoning effort")
        entries.append(ModelInventoryEntry(
            model=model,
            hidden=bool(item.get("hidden", False)),
            is_default=bool(item.get("isDefault", False)),
            default_reasoning_effort=default_effort,
            supported_reasoning_efforts=tuple(_effort_identifier(effort) for effort in efforts),
        ))
    cursor = _find_first(payload, ("nextCursor", "next_cursor"))
    if cursor is not None and not isinstance(cursor, str):
        raise ValueError("malformed pagination cursor")
    return entries, cursor


def extract_inventory(
    *,
    host_id: str,
    query_page: Callable[[dict[str, object]], object] | None,
    settings: dict[str, object] | None,
    source: str = SOURCE_LIVE,
    limit: int = 100,
) -> dict[str, object]:
    """Collect all pages and produce a selectable, ordered matrix without mutation."""
    if query_page is None:
        return {"status": "BLOCKED_MODEL_INVENTORY_UNAVAILABLE", "source": "NO_AUTHORITATIVE_INVENTORY"}
    if source not in {SOURCE_LIVE, *FALLBACK_SOURCES}:
        raise ValueError("unknown inventory source")
    raw_pages: list[object] = []
    entries: list[ModelInventoryEntry] = []
    cursor: str | None = None
    seen_cursors: set[str | None] = set()
    while cursor not in seen_cursors:
        seen_cursors.add(cursor)
        arguments = query_arguments(host_id, cursor, limit)
        page = query_page(arguments)
        raw_pages.append(page)
        page_entries, cursor = parse_live_page(page)
        entries.extend(page_entries)
        if cursor is None:
            break
    else:
        raise ValueError("pagination cursor repeated")

    use_hidden_models = bool((settings or {}).get("use_hidden_models", False))
    selectable = [entry for entry in entries if use_hidden_models or not entry.hidden]
    if not selectable:
        return {"status": "BLOCKED_MODEL_INVENTORY_UNAVAILABLE", "source": source, "reason": "no selectable models"}
    inventory = [asdict(entry) for entry in entries]
    filtered = [asdict(entry) for entry in selectable]
    matrix = [
        {"model": entry.model, "effort": effort}
        for entry in selectable
        for effort in entry.supported_reasoning_efforts
    ]
    checked_at = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    return {
        "status": "MODEL_INVENTORY_VERIFIED" if source == SOURCE_LIVE else "MODEL_INVENTORY_FALLBACK",
        "source": source,
        "fallback": source in FALLBACK_SOURCES,
        "discoveredAtUtc": checked_at,
        "sourceMechanism": QUERY_NAME,
        "queryArguments": query_arguments(host_id, None, limit),
        "settings": {
            "available_models": (settings or {}).get("available_models"),
            "use_hidden_models": use_hidden_models,
            "default_model": (settings or {}).get("default_model"),
        },
        "completeInventory": inventory,
        "selectableInventory": filtered,
        "visibleModelCount": len(selectable),
        "supportedModelEffortPairCount": len(matrix),
        "candidateMatrix": matrix,
        "rawInventoryHash": canonical_hash(raw_pages),
        "filteredInventoryHash": canonical_hash(filtered),
        "selectedModelMutation": "NONE",
    }
