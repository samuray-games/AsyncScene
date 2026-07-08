# Asynchronia Orchestration Protocol

ORCHESTRATION_VERSION: 3.1
BRIDGE_PROTOCOL: 3.1
ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN
STATUS: ACTIVE

## Authority

Use current remote `AGENTS.override.md`, `AGENTS.md`, `PROCESS_ROOT_SYNC.md`, `ORCHESTRATION.md`, `BRIDGE.md`, Git policies, mailbox publication policy, STATE, current inbox and current claim. Historical artifacts are audit-only.

## Canonical loop

`ChatGPT contract -> мост N in Codex -> fresh fetch -> execute -> validate -> push main -> push outbox -> мост N in ChatGPT -> verify/root-sync`

Previous conversational completion never satisfies a new numbered command.

## Execution epoch

Every open slot has one current `EXECUTION_EPOCH` recorded identically in STATE, inbox and claim.

A numbered command executes only that epoch. Old claims, inboxes and outboxes cannot satisfy it.

## Thread rotation

When STATE says `THREAD_ROTATION_REQUIRED: true`:

- the prior Codex conversation is superseded;
- a fresh Codex conversation adopts the replacement claim named by STATE;
- logical bridge thread id remains unchanged for audit history;
- execution starts on the first matching numbered command;
- no preflight, `CONTINUE`, `APPROVE`, `пул` or `пуш` is required.

## Codex execution

On `мост N`, Codex must before any terminal response:

1. fetch main and mailbox;
2. read current remote authority, STATE, inbox and claim;
3. verify epoch, slot, task, phase, baseline, scope and expected outbox;
4. use clean implementation and mailbox worktrees;
5. execute and validate;
6. publish a direct-child primary commit when authorized;
7. refetch main and machine-derive SHA and parent;
8. publish the exact current outbox;
9. refetch mailbox;
10. return `PASS_PUSHED` with evidence and one next action.

## No-op guard

Codex may return the user to ChatGPT only when the exact current expected outbox exists remotely and, for primary-write work, remote main advanced from baseline and equals the reported SHA. Actual parent, exact paths and validations must also be proven.

A one-line return without this evidence is `FAIL_NO_EXECUTION_EVIDENCE`.

If work cannot proceed, return one explicit blocker instead.

## Phases

- `CLOSED`
- `SCOPE_FREEZE`
- `READY_FOR_CODEX`
- `EXECUTE_AND_PUBLISH`
- `OUTBOX_PUBLISHED_AWAITING_CHATGPT`
- `CORRECTION_REQUIRED`
- `READY_FOR_SAFARI`
- `AWAITING_SAFARI`
- `PASS_ACCEPTED`
- `BLOCKED_EXTERNAL`

`CORRECTION_REQUIRED` executes on the next matching numbered command.

## Publication

Primary publication is direct-child, exact-scope, fast-forward and remotely verified. If main moved, return `BLOCKED_MAIN_BASELINE_MOVED`.

Mailbox publication uses the exact expected outbox path, latest mailbox parent, fast-forward push and fresh verification. Outbox SHA and parent are machine-derived from fetched main. Manual SHA transcription is forbidden.

## Safety

Never merge, rebase, reset, stash, clean, amend, cherry-pick or force-push user work. Local divergence is not a blocker.

After one non-interactive auth repair, failure returns `BLOCKED_PUSH_AUTH` with complete recovery evidence. Never request credentials.

## Root synchronization

A reusable process defect must be fixed in every affected authority, validator, mailbox policy, STATE, current contract and live memory before the next action.

## Acceptance

Remote publication, static acceptance, deployment readiness and user Safari acceptance are separate tiers. Git publication is not Safari PASS.
