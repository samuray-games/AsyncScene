#!/usr/bin/env python3
"""Validate and explicitly replace the Asynchronia confirmed model snapshot."""

from __future__ import annotations

import argparse
import difflib
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from plugins.asynchronia.model_selector import AUTHORITY_MANIFEST_PATH, SNAPSHOT_PATH, SnapshotError, _build_snapshot_from_inventory, validate_snapshot  # noqa: E402


def canonical_text(snapshot: dict[str, object]) -> str:
    return json.dumps(snapshot, indent=2, ensure_ascii=True) + "\n"


def prepare(path: Path) -> tuple[dict[str, object], dict[str, object]]:
    candidate = _build_snapshot_from_inventory()
    return candidate, validate_snapshot(candidate)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("replacement", type=Path)
    parser.add_argument("--confirm", action="store_true", help="replace the canonical snapshot after validation")
    parser.add_argument("--snapshot", type=Path, default=SNAPSHOT_PATH)
    args = parser.parse_args()
    try:
        replacement, _ = prepare(args.replacement)
        old = json.loads(args.snapshot.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError, SnapshotError) as exc:
        print(f"SNAPSHOT_REPLACEMENT_REJECTED: {exc}", file=sys.stderr)
        return 1
    diff = difflib.unified_diff(canonical_text(old).splitlines(True), canonical_text(replacement).splitlines(True), fromfile="old", tofile="new")
    print("".join(diff), end="")
    print(f"calculated model count: {replacement['completeModelCount']}")
    print(f"calculated pair count: {replacement['completeModelEffortPairCount']}")
    print(f"canonical hash: {replacement['canonicalContentHash']}")
    print(f"authority manifest: {AUTHORITY_MANIFEST_PATH}")
    if not args.confirm:
        print("EXPLICIT_CONFIRMATION_REQUIRED: rerun with --confirm after reviewing the diff")
        return 2
    args.snapshot.write_text(canonical_text(replacement), encoding="utf-8")
    print(f"SNAPSHOT_REPLACED: {args.snapshot}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
