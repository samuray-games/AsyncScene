# Asynchronia Codex Bridge Entry Point

BRIDGE_PROTOCOL: 3.3
ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN
VERIFIED_NO_DELTA: ALLOWED_WITH_EVIDENCE
REMOTE_REF_FRESHNESS: FAIL_CLOSED
STATE_AUTHORITY: .ai-bridge/STATE.json

## 1. Commands

The only numbered bridge commands are `мост 1`, `мост 2`, and `мост 3`. Each command resolves and executes the complete current remote contract for one slot.

Previous conversation state is never authority.

## 2. Canonical resolver

Codex must run the current remote `tools/bridge-slot-envelope.py` before any terminal response.

The resolver:

- performs an exact destination-refspec fetch;
- compares remote-tracking refs with `git ls-remote`;
- reads `.ai-bridge/STATE.json` from the proved mailbox head;
- reads the exact inbox and claim named by JSON;
- verifies all identity fields and blob SHAs;
- emits a deterministic `contractDigest`.

Only `BRIDGE_CONTRACT_RESOLVED` permits execution. A freshness failure returns `BLOCKED_STALE_REMOTE_REF`.

## 3. Exact fetch

Required:

`git fetch --no-tags --prune origin +refs/heads/main:refs/remotes/origin/main +refs/heads/coordination/chatgpt-codex-bridge:refs/remotes/origin/coordination/chatgpt-codex-bridge`

Forbidden:

`git fetch origin <source-branch> <source-branch>`

The forbidden form may refresh `FETCH_HEAD` without refreshing the remote-tracking refs later read by `git show` and `git rev-parse`.

## 4. Execution

After resolution Codex verifies scope isolation, invokes the selector as informational evidence, executes only the resolved contract, validates, and chooses one legal completion mode.

- Primary delta: one direct-child exact-scope commit.
- Verified no delta: only when `allowVerifiedNoDelta` is true.

Empty primary commits are forbidden.

## 5. Publication preflight

Immediately before mailbox publication rerun resolver mode `resolve`.

- unchanged digest: publication may continue;
- changed digest or mailbox generation: `BLOCKED_MAILBOX_EPOCH_MOVED`;
- changed main baseline: `BLOCKED_MAIN_BASELINE_MOVED`.

## 6. Outbox

The outbox must be the exact path returned by the resolver and a direct child of the freshly resolved mailbox head. It must be the only changed mailbox path and contain:

- `THREAD_ID`
- `EXECUTION_EPOCH`
- `EXPECTED_OUTBOX`
- `CONTRACT_DIGEST`
- `STATE_BLOB_SHA`
- `INBOX_BLOB_SHA`
- `CLAIM_BLOB_SHA`
- `MAILBOX_PARENT`
- `COMPLETION_MODE`
- `PRIMARY_COMMIT`
- `PRIMARY_PARENT`
- exact changed paths and validations

After push, run resolver mode `verify-outbox`. Only `OUTBOX_VERIFIED` permits `PASS_PUSHED` or `PASS_VERIFIED_NO_DELTA`.

Historical outboxes do not satisfy a new epoch. Manual SHA transcription is forbidden.

## 7. Thread rotation

When STATE.json sets `threadRotationRequired:true`, previous Codex conversation ownership is void. A fresh conversation adopts only the current JSON-named claim and starts on the first matching numbered command.

## 8. Model recommendation

Only the plugin `model-selector` may originate or name a recommendation. It is informational and non-blocking. `USER_SELECTED_UNVERIFIED` remains the truthful active-model status unless externally verified.

## 9. ChatGPT acceptance

When ChatGPT receives `мост N` or a Codex success report, it reloads live memory, reads current main and mailbox state, runs the equivalent independent checks, and accepts only current remote evidence. Codex prose alone is never acceptance evidence.

## 10. Root synchronization

A reusable routing, ref freshness, identity, publication or acceptance defect triggers full root synchronization before any product task resumes.
