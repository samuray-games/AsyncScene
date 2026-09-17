# Asynchronia Repository Execution Override

OVERRIDE_VERSION: REPOSITORY_NATIVE_EXECUTION_2
ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN
DIRECT_TASK_WRITES_TO_MAIN: FORBIDDEN
LOCAL_WORKTREE_SAFETY: CONDITIONAL
WORKTREE_DISCLOSURE: REQUIRED_WHEN_USED

Read root `AGENTS.md` fully. Explicit user instructions have precedence over this file.

## Branch and optional local-worktree safety

- Ordinary work uses an isolated remote GitHub branch from current `main`; no local worktree is a prerequisite.
- When local execution is used, inspect occupancy before reuse or creation, use one exact branch and one exact task per worktree, and disclose the exact branch and absolute path.
- Preserve dirty or unknown work. Never use force removal, reset, clean, checkout-over-dirty or history rewriting without explicit authorization.
- When local execution is used, inspect status before completion, preserve or publish authorized commits, and remove only a clean disposable worktree. Never require local cleanup to complete ordinary work.

## Publication

- Publish only the authorized task branch.
- Verify parent, exact changed paths, checks and remote head after pushing.
- Do not merge or claim runtime acceptance; return the exact next review action.

## Validation

Run the smallest sufficient static and policy checks for the changed scope. Keep runtime code and Stage 7.15 outside policy-only cleanup.
