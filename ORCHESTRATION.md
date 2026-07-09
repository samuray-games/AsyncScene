# Asynchronia Orchestration Protocol

ORCHESTRATION_VERSION: 3.3
BRIDGE_PROTOCOL: 3.3
ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN
VERIFIED_NO_DELTA: ALLOWED_WITH_EVIDENCE
STATUS: ACTIVE

## Authority

Use current remote `AGENTS.override.md`, `PROCESS_ROOT_SYNC.md`, `ORCHESTRATION.md`, `BRIDGE.md`, the canonical resolver, mailbox publication policy, `.ai-bridge/STATE.json`, and the exact inbox and claim named by JSON. Historical artifacts are audit-only.

## Canonical loop

`ChatGPT contract -> current STATE.json -> мост N in Codex -> exact remote refresh -> contract resolver -> execute -> validate -> publish -> verify-outbox -> мост N in ChatGPT -> independent acceptance/root-sync`

## Machine state

Every open slot has one current execution epoch in `.ai-bridge/STATE.json`. JSON is canonical. Human Markdown mirrors may explain state but may not route work.

The state contains a monotonically increasing `mailboxGeneration` and `stateRevision`. A slot contains exact thread, lane, task, epoch, phase, baseline, inbox, claim, expected outbox and completion permissions.

## Remote freshness

The resolver must prove remote-tracking refs equal `ls-remote` after exact destination-refspec fetch. A source-only fetch is not sufficient evidence.

Failure returns `BLOCKED_STALE_REMOTE_REF`.

## Contract identity

The current contract identity is the resolver-produced `contractDigest`, a SHA-256 digest over state revision, mailbox generation, slot identity, task identity, baseline, paths and state/inbox/claim blob SHAs.

Execution and publication must use the same digest. If it changes, return `BLOCKED_MAILBOX_EPOCH_MOVED`.

## Execution

A numbered command:

1. resolves the current contract;
2. verifies exact scope and dependencies;
3. records the selector recommendation without stopping;
4. executes only the resolved objective;
5. validates exact changed paths;
6. refreshes and re-resolves before publication;
7. publishes primary and mailbox changes as applicable;
8. verifies the current outbox remotely.

## Completion modes

### Primary delta

Publish one direct-child exact-scope commit and the exact outbox.

### Verified no delta

Allowed only when the resolved contract says `allowVerifiedNoDelta:true`. It publishes no primary commit and must prove the baseline already satisfies the objective.

Empty primary commits are forbidden.

## Publication

Primary pushes target `refs/heads/main` explicitly. Mailbox pushes target `refs/heads/coordination/chatgpt-codex-bridge` explicitly. Both are fast-forward only.

The mailbox outbox commit changes exactly one path and records the contract digest, authority blob SHAs, actual parent, primary identity, changed paths and validations.

Resolver mode `verify-outbox` is mandatory after publication.

## Model boundary

Only `model-selector` may originate, rank or name a recommendation. The recommendation is informational and cannot become a pause, authorization or resume gate. Scope changes cause same-response recomputation. The truthful active status remains `USER_SELECTED_UNVERIFIED` unless externally verified.

## Phases

- `CLOSED`
- `SCOPE_FREEZE`
- `READY_FOR_CODEX`
- `EXECUTE_AND_PUBLISH`
- `OUTBOX_PUBLISHED_AWAITING_CHATGPT`
- `VERIFIED_NO_DELTA_AWAITING_CHATGPT`
- `CORRECTION_REQUIRED`
- `READY_FOR_SAFARI`
- `AWAITING_SAFARI`
- `PASS_ACCEPTED`
- `BLOCKED_EXTERNAL`

## Acceptance

Remote publication, static acceptance, deployment readiness and user Safari acceptance are separate tiers. Git publication is not Safari PASS.

## Root synchronization

Reusable defects are repaired across authority, resolver, validator, workflow, mailbox policy, STATE.json, active contract and live memory before product work resumes.
