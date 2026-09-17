# Asynchronia Repository Execution Override

OVERRIDE_VERSION: REPOSITORY_NATIVE_WORKTREE_1
ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN
DIRECT_TASK_WRITES_TO_MAIN: FORBIDDEN
WORKTREE_LIFECYCLE: REQUIRED
WORKTREE_DISCLOSURE: IMMEDIATE_AND_CLIENT_INDEPENDENT

Read root `AGENTS.md` fully. Explicit user instructions have precedence over this file.

## Branch and worktree safety

- Before branch reuse, checkout or worktree creation, inspect canonical worktree occupancy.
- Use one exact branch and one exact task per worktree.
- Disclose the exact branch and absolute path immediately after creating or discovering a worktree.
- Preserve dirty or unknown work. Never use force removal, reset, clean, checkout-over-dirty or history rewriting without explicit authorization.
- Before completion, inspect worktree status, preserve or publish authorized commits, remove only a clean disposable worktree, prune safely and verify branch availability from the canonical checkout.

## Publication

- Publish only the authorized task branch.
- Verify parent, exact changed paths, checks and remote head after pushing.
- Do not merge or claim runtime acceptance; return the exact next review action.

## Validation

Run the smallest sufficient static and policy checks for the changed scope. Keep runtime code and Stage 7.15 outside policy-only cleanup.
