#!/usr/bin/env python3
"""Run the confirmed-snapshot Asynchronia preflight state machine."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from plugins.asynchronia.model_selector import (  # noqa: E402
    AuthorizationError,
    DEFAULT_STATE_DIR,
    SNAPSHOT_PATH,
    SnapshotError,
    TaskDescriptionError,
    current_branch,
    inspect_state,
    invalidate_state,
    load_task,
    record_continue,
    record_inventory_changed,
    record_inventory_ok,
    start_preflight,
)


def _common(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--thread-id", required=True)
    parser.add_argument("--state-dir", type=Path, default=DEFAULT_STATE_DIR)
    parser.add_argument("--snapshot", type=Path, default=None)
    parser.add_argument("--plugin-root", type=Path, default=None, help="absolute installed plugin root for read-only canary execution")


def _identity(parser: argparse.ArgumentParser) -> None:
    _common(parser)
    parser.add_argument("--task-file", type=Path, required=True)
    parser.add_argument("--baseline", required=True)
    parser.add_argument("--branch", default=None)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    start = commands.add_parser("start", help="start preflight from a structured task file")
    _identity(start)
    ok = commands.add_parser("inventory-ok", help="record exact INVENTORY_OK")
    _identity(ok)
    changed = commands.add_parser("inventory-changed", help="record exact INVENTORY_CHANGED")
    _common(changed)
    cont = commands.add_parser("continue", help="record exact same-thread CONTINUE")
    _identity(cont)
    cont.add_argument("--token", required=True)
    inspect = commands.add_parser("inspect", help="inspect state without mutation")
    _common(inspect)
    invalidate = commands.add_parser("invalidate", help="invalidate existing state")
    _common(invalidate)
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        if args.command == "start":
            result = start_preflight(load_task(args.task_file), args.thread_id, args.baseline, branch=args.branch or current_branch(), state_dir=args.state_dir, path=args.snapshot or SNAPSHOT_PATH, plugin_root=args.plugin_root)
            print(result.output)
        elif args.command == "inventory-ok":
            result = record_inventory_ok(args.thread_id, load_task(args.task_file), args.baseline, branch=args.branch or current_branch(), state_dir=args.state_dir, path=args.snapshot or SNAPSHOT_PATH)
            print(result.output)
        elif args.command == "inventory-changed":
            print(record_inventory_changed(args.thread_id, state_dir=args.state_dir))
        elif args.command == "continue":
            print(record_continue(args.thread_id, args.token, load_task(args.task_file), args.baseline, branch=args.branch or current_branch(), state_dir=args.state_dir, path=args.snapshot or SNAPSHOT_PATH))
        elif args.command == "inspect":
            print(json.dumps(inspect_state(args.thread_id, state_dir=args.state_dir), indent=2, sort_keys=True))
        elif args.command == "invalidate":
            print(json.dumps(invalidate_state(args.thread_id, state_dir=args.state_dir), indent=2, sort_keys=True))
        return 0
    except (AuthorizationError, SnapshotError, TaskDescriptionError, OSError, json.JSONDecodeError) as exc:
        print(f"BLOCKED_MODEL_PREFLIGHT: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
