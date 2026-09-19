#!/usr/bin/env python3
"""Static contract checks for the external Stage 7.15 acceptance launcher."""

from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
SCRIPT = (ROOT / "tools" / "run_stage715_external_acceptance.sh").read_text()


def require(text: str) -> None:
    if text not in SCRIPT:
        raise SystemExit(f"FAIL: runner contract missing: {text}")


require('PR_REF="refs/pull/${PR_NUMBER}/head"')
require('git fetch --no-tags "$REMOTE_NAME" "$PR_REF"')
require('REMOTE_SHA="$(git rev-parse FETCH_HEAD^{commit})"')
require('git worktree add --detach "$WORKTREE" "$REMOTE_SHA"')
require('[[ "$(git -C "$WORKTREE" rev-parse HEAD)" == "$REMOTE_SHA" ]]')
require('[[ -z "$(git -C "$WORKTREE" status --porcelain)" ]]')
if 'invoking checkout is not PR #403 candidate head' in SCRIPT:
    raise SystemExit("FAIL: launcher still requires invoking checkout to equal candidate")
if 'EXPECTED_SHA="30a52505e95aff36dacad201ce35dbf07ddefbda"' in SCRIPT:
    raise SystemExit("FAIL: runner still hardcodes obsolete candidate SHA")

print("PASS_STAGE715_EXTERNAL_RUNNER_REMOTE_HEAD_CONTRACT")
