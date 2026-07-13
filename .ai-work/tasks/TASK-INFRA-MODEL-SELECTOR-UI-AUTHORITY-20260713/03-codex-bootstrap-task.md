TASK_ID: TASK-INFRA-MODEL-SELECTOR-UI-AUTHORITY-20260713
PHASE: CODEX_BOOTSTRAP_TASK
STATUS: READY_FOR_USER_MODEL_SELECTION
TARGET_BRANCH: infra/model-selector-ui-authority-20260713
PRESERVES_PLAN: 02-work-plan.md

## Authorization

The current user authorizes one remote Codex execution because ChatGPT Work is unavailable remotely and the component under repair is the model-selection gate itself.

Before launch, the user selects `5.5 High` in the active Codex UI.

For this task only, the launch prompt is the model authorization. Do not run the broken inventory-selection workflow and do not request a second continuation token.

This exception applies only to this task id, branch, launch SHA, current thread, and exact write scope. It must not appear in final root policy, plugin skill, manifests, validator behavior, or future tasks.

## Execution

1. Fetch main, both selector-task branches, and the blocked AI Forensics branch.
2. Prove the implementation branch equals the exact launch SHA supplied by ChatGPT.
3. Read `AGENTS.override.md`, `AGENTS.md`, `TASKS.md`, `PROJECT_MEMORY.md`, this file, `01-chat-brief.md`, `02-work-plan.md`, `STATE.md`, and every target file through `git show` from that SHA.
4. Create a clean task-owned worktree.
5. Execute `02-work-plan.md` exactly.
6. Run all required validators and exact-scope checks.
7. Commit and push only to `infra/model-selector-ui-authority-20260713`.
8. Refetch and prove the final remote head.
9. Return `READY_FOR_REVIEW` only.

## Final requirements

- implement desktop UI and app-server reconciliation;
- bump plugin, marketplace, and validator expectation to 1.0.9;
- preserve dynamic inventory and ordinary future selection gates;
- leave no permanent bootstrap exception;
- do not write main, bridges, AI Forensics implementation, hooks, Stage 6, runtime, economy, persistence, deployment, or mirrors.
