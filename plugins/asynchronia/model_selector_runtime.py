"""Asynchronia 1.0.15 runtime facade over the stable selector core.

The executable CLI is the production entrypoint. This facade binds the installed
package version and provides sandbox-safe Git-private durable state storage while
preserving the accepted snapshot and evaluation engine.
"""

from __future__ import annotations

import os
import subprocess
from pathlib import Path

from . import model_selector as core

PLUGIN_VERSION = "1.0.15"
core.PLUGIN_VERSION = PLUGIN_VERSION

AUTHORITY_MANIFEST_PATH = core.AUTHORITY_MANIFEST_PATH
SNAPSHOT_PATH = core.SNAPSHOT_PATH
MAINTENANCE_TASK_ID = core.MAINTENANCE_TASK_ID
AuthorizationError = core.AuthorizationError
SnapshotError = core.SnapshotError
TaskDescriptionError = core.TaskDescriptionError

_build_snapshot_from_inventory = core._build_snapshot_from_inventory
build_candidate_matrix = core.build_candidate_matrix
canonical_hash = core.canonical_hash
current_branch = core.current_branch
evaluate_task = core.evaluate_task
inspect_state = core.inspect_state
invalidate_state = core.invalidate_state
load_snapshot = core.load_snapshot
load_task = core.load_task
mutation_authorization_guard = core.mutation_authorization_guard
record_continue = core.record_continue
record_inventory_changed = core.record_inventory_changed
record_inventory_ok = core.record_inventory_ok
start_preflight = core.start_preflight
task_hash = core.task_hash
validate_snapshot = core.validate_snapshot


def resolve_default_state_dir(repository_root: Path | None = None) -> Path:
    """Resolve durable state inside the Git common directory, not the legacy home path."""
    configured = os.environ.get("ASYNCHRONIA_SELECTOR_STATE_DIR")
    if configured:
        path = Path(configured).expanduser()
        if not path.is_absolute():
            raise AuthorizationError("ASYNCHRONIA_SELECTOR_STATE_DIR must be absolute")
        return path.resolve(strict=False)

    if repository_root is None:
        try:
            root_result = subprocess.run(
                ["git", "rev-parse", "--show-toplevel"],
                check=True,
                capture_output=True,
                text=True,
            )
        except (OSError, subprocess.CalledProcessError) as exc:
            raise AuthorizationError("unable to resolve Git worktree root") from exc
        root = Path(root_result.stdout.strip()).resolve(strict=False)
    else:
        root = repository_root.resolve(strict=False)

    try:
        state_result = subprocess.run(
            ["git", "-C", str(root), "rev-parse", "--git-path", "asynchronia/model-selector-state"],
            check=True,
            capture_output=True,
            text=True,
        )
        common_result = subprocess.run(
            ["git", "-C", str(root), "rev-parse", "--git-common-dir"],
            check=True,
            capture_output=True,
            text=True,
        )
    except (OSError, subprocess.CalledProcessError) as exc:
        raise AuthorizationError("unable to resolve Git-private selector state directory") from exc

    state_path = Path(state_result.stdout.strip())
    common_dir = Path(common_result.stdout.strip())
    if not state_path.is_absolute():
        state_path = root / state_path
    if not common_dir.is_absolute():
        common_dir = root / common_dir
    state_path = state_path.resolve(strict=False)
    common_dir = common_dir.resolve(strict=False)
    if state_path != common_dir and common_dir not in state_path.parents:
        raise AuthorizationError("resolved selector state directory is outside Git-private storage")
    return state_path
