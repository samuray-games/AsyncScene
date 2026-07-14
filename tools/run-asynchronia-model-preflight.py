#!/usr/bin/env python3
"""Run the production confirmed-snapshot Asynchronia model preflight."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from plugins.asynchronia.model_selector import SnapshotError, run_preflight  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--thread-id", required=True)
    parser.add_argument("--response", choices=("INVENTORY_OK", "INVENTORY_CHANGED"))
    args = parser.parse_args()
    try:
        result = run_preflight(args.response, thread_id=args.thread_id)
    except SnapshotError as exc:
        print(f"BLOCKED_MODEL_INVENTORY_SNAPSHOT: {exc}", file=sys.stderr)
        return 1
    print(f"status: {result.status}")
    print(result.output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
