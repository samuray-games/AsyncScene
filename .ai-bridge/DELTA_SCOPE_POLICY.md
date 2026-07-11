# Delta Scope Policy

POLICY_VERSION: DELTA_SCOPE_2026_07_11_V1
STATUS: ACTIVE

## Core distinction

`AUTHORIZED_WRITE_SCOPE` is the maximum set of primary paths that may be changed by a task. It is not automatically the set of paths that must appear in the final commit.

`TARGET_STATE_PATHS` is the set of paths whose final content and runtime identity must be verified.

`ACTUAL_CHANGED_PATHS` is the exact non-empty subset of authorized paths whose blobs differ between the authorized baseline and the final primary commit.

A task may require every authorized path to change only when its active inbox explicitly proves that every baseline blob is objectively wrong and declares `REQUIRE_COMPLETE_SCOPE_DELTA: true`.

Absent that declaration:

- actual changed paths must be a non-empty subset of authorized write scope;
- no unrelated path may change;
- a target path omitted from the commit must have explicit no-delta proof that its baseline blob already satisfies the target state;
- empty or cosmetic commits are forbidden;
- a correct three-path delta must not be expanded artificially to four paths.

## Target no-delta proof

For each target path absent from `ACTUAL_CHANGED_PATHS`, evidence must include:

- baseline blob SHA;
- candidate target blob SHA or deterministic target-content hash;
- equality result;
- required identity, cache-bust, mirror, or wiring checks proving the baseline content already satisfies the target;
- reason the path is not part of the commit.

## Validator sequencing

Validators that inspect `git status --short` must run only after the final primary commit exists in a clean task-owned worktree.

A validator's working-tree allowlist is not authority for the final commit's historical changed-path set unless that validator explicitly accepts baseline and commit arguments and evaluates them.

If such a validator fails from a genuinely clean committed tree, evidence must preserve:

- exact command;
- current HEAD;
- `git status --short` output;
- exit code;
- complete stdout;
- complete stderr.

Running a working-tree validator before committing the task delta is invalid validation evidence.

## Status consistency

`BLOCKED_NO_SOURCE_DELTA` is legal only when the baseline-to-candidate diff is empty.

When one or more authorized paths differ, the result is not `NO_SOURCE_DELTA`. Any genuine blocker must name the actual conflict, validation failure, missing authority, or publication error.
