# Asynchronia Orchestration Protocol

ORCHESTRATION_VERSION: 4.1
STATUS: ACTIVE
DIRECT_TASK_WRITES_TO_MAIN: FORBIDDEN
NO_OP_COMPLETION: FORBIDDEN

## Canonical loop

`owner scope -> ChatGPT technical direction -> current main -> isolated remote branch -> Claude Code or Codex implementation -> checks -> independent review of exact HEAD -> owner merge`

Deployment verification and owner runtime acceptance follow when applicable and separately authorized.

## Execution

Every task records its baseline, branch, exact read/write scope, stable-read dependencies, owner or lock, risk, validation commands and stop conditions. ChatGPT coordinates one assigned implementer per atomic task. A local worktree is optional. Use it under the repository's worktree safety rules when the execution surface needs it.

The disabled Control Room's slots, scheduled preflights, sender assignments and automation receipts are historical procedures. Ordinary work uses repository-native task handoffs. Preserve unique task identity, ownership, atomic reservation and evidence of actual execution. R56 remains subject to its no-duplicate rule.

## Risk and independent review

Classify risk before implementation and update it when scope changes.

| Risk | Typical scope | Required checks |
| --- | --- | --- |
| Routine | Documentation and isolated, low-impact changes | Targeted static and scope checks, followed by independent standard review. |
| Medium | Ordinary behavior or CI changes with bounded impact | Targeted regressions and relevant contract or mirror checks, followed by independent standard review. |
| High | Security, authorization, privacy, economy or ledger, persistence, migrations, shared-server integration, or changes to safety and approval controls | Applicable threat, invariant, rollback and recovery checks, plus independent critical review. Confirm ownership and applicable raw-byte checkpoints and owner approvals. |

Use a reviewer agent separate from the author and its implementation session. Claude Code and Codex can review each other's code. In Codex, route standard work to `reviewer` and high-risk work to `critical_reviewer`. A critical review on any surface requires the corresponding independent, read-only critical-review capability. If that capability is unavailable, record the gap and block promotion. A standard review cannot satisfy it.

The reviewer reads the diff and relevant context at the exact base and HEAD, verifies scope and available checks, and records the reviewer/session identity, base SHA, full HEAD SHA, evidence, findings and verdict. A new HEAD invalidates the previous verdict. Keep the PR pending until an independent verdict covers the current HEAD and required checks have passed. The owner decides merge.

## Completion modes

### Primary delta

Use one task-owned commit with exact changed paths, passing checks and a remotely verified branch head.

### Verified no delta

Allowed only when the objective is already satisfied on the current baseline and evidence proves zero authorized changes, protected content unchanged and required checks passing. Empty commits are forbidden.

## Safety

Never merge, rebase, reset, stash, clean, amend, cherry-pick or force-push user work without explicit authorization. A Git push is not deployment or runtime acceptance.

## Acceptance tiers

Record remote publication, static validation, independent review, deployment readiness and Safari evidence separately. Runtime acceptance is `PENDING_USER` until the owner supplies the required evidence and accepts the result. Draft publication, process changes and fixture checks alone do not advance game progress.
