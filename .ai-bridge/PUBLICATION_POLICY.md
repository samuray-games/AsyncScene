# Bridge Autopilot Policy

POLICY_VERSION: CODEX_AUTOPILOT_2026_07_09_RUNTIME_APPROVAL
STATUS: ACTIVE
ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN
VERIFIED_NO_DELTA: ALLOWED_WITH_EVIDENCE
DEFAULT_PUBLICATION_MODE: CODEX_AUTO_PULL_PUSH

## Fresh execution

Every numbered command freshly fetches main and mailbox and reads current STATE, inbox, claim and execution epoch. Old artifacts are historical only.

## Runtime approval

When the frozen scope is runtime-sensitive, `RUNTIME_SAFETY_GATE_REQUIRED` is a valid intermediate state. It creates no primary commit and no outbox.

The exact serialized slot remains reserved. The user continues in the same Codex conversation with the repository-defined runtime confirmation token. After confirmation, Codex completes implementation, validation, primary publication and the expected outbox publication in the same execution epoch.

A runtime gate response must not tell the user to open another serialized slot when STATE already records that slot as open and reserved.

## Completion modes

### Primary delta

When authorized source changes exist, Codex publishes one direct-child exact-scope primary commit and the exact current outbox, then returns `PASS_PUSHED`.

### Verified no delta

When the current inbox or claim contains `ALLOW_VERIFIED_NO_DELTA: true`, Codex may return `PASS_VERIFIED_NO_DELTA` after proving that the current baseline already satisfies the frozen objective.

Required evidence:

- baseline remains current remote main;
- required generator and validators pass;
- deterministic regeneration produces zero diff;
- exact changed paths are empty;
- protected blobs are unchanged;
- the current outbox is published and refetched;
- outbox contains `completionMode: VERIFIED_NO_DELTA`, `primaryChanged:false`, `primaryParent:N/A`, `changedPaths:[]`, scope blob SHAs and validation results.

Empty primary commits are forbidden.

A bare return without the current evidence package is `FAIL_NO_EXECUTION_EVIDENCE`. A valid `RUNTIME_SAFETY_GATE_REQUIRED` response is not a bare return and remains pending rather than complete.

ChatGPT may independently close a pre-policy `BLOCKED_NO_SOURCE_DELTA` result after verifying the same baseline evidence and recording closure in STATE and live memory.

## Root policy CI gate

Root process changes must pass `tools/validate-orchestration-policy.py`. Historical failed runs are audit evidence only and do not override a newer valid current state.

## Publication

Primary and mailbox commits are fast-forward, exact-scope and remotely refetched. Manual SHA transcription is forbidden.

If main moved, return `BLOCKED_MAIN_BASELINE_MOVED`. If write access still fails after one repair, return `BLOCKED_PUSH_AUTH` with complete evidence.

Codex never edits STATE.