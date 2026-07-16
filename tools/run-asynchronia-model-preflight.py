#!/usr/bin/env python3
"""Run Asynchronia model preflight with generic or bridge-authority-derived tasks."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from plugins.asynchronia.bridge_task_descriptor import (  # noqa: E402
    RESERVED_BRIDGE_TASK_TYPES,
    derive_bridge_task,
)
from plugins.asynchronia.model_selector import (  # noqa: E402
    AuthorizationError,
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
    resolve_default_state_dir,
    start_preflight,
)


def _state_options(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--state-dir", type=Path, default=None)
    parser.add_argument("--snapshot", type=Path, default=None)


def _generic_identity(parser: argparse.ArgumentParser) -> None:
    _state_options(parser)
    parser.add_argument("--thread-id", required=True)
    parser.add_argument("--task-file", type=Path, required=True)
    parser.add_argument("--baseline", required=True)
    parser.add_argument("--branch", default=None)
    parser.add_argument("--plugin-root", type=Path, default=None)


def _bridge_identity(parser: argparse.ArgumentParser) -> None:
    _state_options(parser)
    parser.add_argument("--slot", type=int, choices=(1, 2, 3), required=True)
    parser.add_argument("--mailbox-ref", default=None)
    parser.add_argument("--thread-id", required=True)
    parser.add_argument("--baseline", required=True)
    parser.add_argument("--branch", required=True)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)

    start = commands.add_parser("start", help="start preflight from a non-bridge structured JSON task")
    _generic_identity(start)
    ok = commands.add_parser("inventory-ok", help="record exact INVENTORY_OK for a non-bridge task")
    _generic_identity(ok)
    changed = commands.add_parser("inventory-changed", help="record exact INVENTORY_CHANGED")
    _state_options(changed)
    changed.add_argument("--thread-id", required=True)
    cont = commands.add_parser("continue", help="record exact same-thread CONTINUE for a non-bridge task")
    _generic_identity(cont)
    cont.add_argument("--token", required=True)

    bridge_start = commands.add_parser("bridge-start", help="derive the task from slot-local bridge authority and start preflight")
    _bridge_identity(bridge_start)
    bridge_ok = commands.add_parser("bridge-inventory-ok", help="derive the same bridge task and record INVENTORY_OK")
    _bridge_identity(bridge_ok)
    bridge_cont = commands.add_parser("bridge-continue", help="derive the same bridge task and record CONTINUE")
    _bridge_identity(bridge_cont)
    bridge_cont.add_argument("--token", required=True)

    inspect = commands.add_parser("inspect", help="inspect selector state without mutation")
    _state_options(inspect)
    inspect.add_argument("--thread-id", required=True)
    invalidate = commands.add_parser("invalidate", help="invalidate selector state")
    _state_options(invalidate)
    invalidate.add_argument("--thread-id", required=True)
    return parser


def _state_dir(args: argparse.Namespace) -> Path:
    return args.state_dir if args.state_dir is not None else resolve_default_state_dir(ROOT)


def _snapshot(args: argparse.Namespace) -> Path:
    return args.snapshot or SNAPSHOT_PATH


def _generic_task(args: argparse.Namespace) -> dict[str, object]:
    task = load_task(args.task_file)
    if str(task["taskType"]) in RESERVED_BRIDGE_TASK_TYPES or str(task["taskType"]).startswith("BRIDGE_"):
        raise TaskDescriptionError("reserved bridge tasks must use bridge-start, bridge-inventory-ok, or bridge-continue")
    return task


def _bridge(args: argparse.Namespace):
    mailbox_ref = args.mailbox_ref or f"origin/coordination/chatgpt-codex-bridge-{args.slot}"
    descriptor = derive_bridge_task(
        slot=args.slot,
        mailbox_ref=mailbox_ref,
        selected_branch=args.branch,
        baseline=args.baseline,
        thread_id=args.thread_id,
        repository_root=ROOT,
    )
    print(descriptor.render_evidence())
    return descriptor


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        state_dir = _state_dir(args)
        if args.command == "start":
            task = _generic_task(args)
            result = start_preflight(
                task,
                args.thread_id,
                args.baseline,
                branch=args.branch or current_branch(),
                state_dir=state_dir,
                path=_snapshot(args),
                plugin_root=args.plugin_root,
            )
            print(f"state directory: {state_dir}")
            print(result.output)
        elif args.command == "inventory-ok":
            task = _generic_task(args)
            result = record_inventory_ok(
                args.thread_id,
                task,
                args.baseline,
                branch=args.branch or current_branch(),
                state_dir=state_dir,
                path=_snapshot(args),
            )
            print(f"state directory: {state_dir}")
            print(result.output)
        elif args.command == "inventory-changed":
            print(f"state directory: {state_dir}")
            print(record_inventory_changed(args.thread_id, state_dir=state_dir))
        elif args.command == "continue":
            task = _generic_task(args)
            print(f"state directory: {state_dir}")
            print(
                record_continue(
                    args.thread_id,
                    args.token,
                    task,
                    args.baseline,
                    branch=args.branch or current_branch(),
                    state_dir=state_dir,
                    path=_snapshot(args),
                )
            )
        elif args.command == "bridge-start":
            descriptor = _bridge(args)
            result = start_preflight(
                descriptor.task,
                args.thread_id,
                args.baseline,
                branch=args.branch,
                state_dir=state_dir,
                path=_snapshot(args),
            )
            print(f"state directory: {state_dir}")
            print(result.output)
        elif args.command == "bridge-inventory-ok":
            descriptor = _bridge(args)
            result = record_inventory_ok(
                args.thread_id,
                descriptor.task,
                args.baseline,
                branch=args.branch,
                state_dir=state_dir,
                path=_snapshot(args),
            )
            print(f"state directory: {state_dir}")
            print(result.output)
        elif args.command == "bridge-continue":
            descriptor = _bridge(args)
            print(f"state directory: {state_dir}")
            print(
                record_continue(
                    args.thread_id,
                    args.token,
                    descriptor.task,
                    args.baseline,
                    branch=args.branch,
                    state_dir=state_dir,
                    path=_snapshot(args),
                )
            )
        elif args.command == "inspect":
            print(f"state directory: {state_dir}")
            print(json.dumps(inspect_state(args.thread_id, state_dir=state_dir), indent=2, sort_keys=True))
        elif args.command == "invalidate":
            print(f"state directory: {state_dir}")
            print(json.dumps(invalidate_state(args.thread_id, state_dir=state_dir), indent=2, sort_keys=True))
        return 0
    except (AuthorizationError, SnapshotError, TaskDescriptionError, OSError, json.JSONDecodeError) as exc:
        print(f"BLOCKED_MODEL_PREFLIGHT: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
