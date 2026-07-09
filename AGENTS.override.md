# Asynchronia Protocol 3.3 Override

OVERRIDE_VERSION: ORCHESTRATION_3_3
BRIDGE_PROTOCOL: 3.3
ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN
VERIFIED_NO_DELTA: ALLOWED_WITH_EVIDENCE
REMOTE_REF_FRESHNESS: FAIL_CLOSED
MACHINE_STATE: .ai-bridge/STATE.json

Read root `AGENTS.md` fully. Its project, canon, safety and ownership rules remain binding. This override replaces the bridge-command, model-selection and process-resume clauses in lower-precedence documents whenever they conflict.

## 1. Authority order

1. `AGENTS.override.md`
2. `PROCESS_ROOT_SYNC.md`
3. `ORCHESTRATION.md`
4. `BRIDGE.md`
5. current `tools/bridge-slot-envelope.py`
6. mailbox `.ai-bridge/PUBLICATION_POLICY.md`
7. mailbox `.ai-bridge/STATE.json`
8. the exact inbox and claim named by STATE.json
9. historical artifacts for audit only

Repository files are authoritative for implementation state. Google Drive memory is authoritative for cross-chat context but never overrides newer repository facts.

## 2. Numbered bridge commands

The exact trimmed commands `мост 1`, `мост 2`, and `мост 3` select one fixed slot.

Before any terminal response Codex must:

1. refresh `origin/main` and `origin/coordination/chatgpt-codex-bridge` with explicit destination refspecs;
2. prove both local remote-tracking SHAs equal `git ls-remote --heads`;
3. run `tools/bridge-slot-envelope.py --slot N --mode resolve` from current remote main;
4. use only the returned current thread, task, epoch, baseline, inbox, claim, expected outbox and `contractDigest`;
5. execute from clean task-owned and mailbox worktrees;
6. rerun resolver mode `resolve` immediately before publication;
7. publish only when the digest is unchanged;
8. run resolver mode `verify-outbox` after the push;
9. return success only after `OUTBOX_VERIFIED`.

A conversation, local mailbox copy, `FETCH_HEAD`, old claim, old inbox, historical outbox or previously printed SHA is never authority.

## 3. Exact remote refresh

The required fetch form is:

`git fetch --no-tags --prune origin +refs/heads/main:refs/remotes/origin/main +refs/heads/coordination/chatgpt-codex-bridge:refs/remotes/origin/coordination/chatgpt-codex-bridge`

Source-only fetch arguments are forbidden because they may leave the remote-tracking refs used by later commands stale.

If the resolver cannot prove ref freshness, return `BLOCKED_STALE_REMOTE_REF`. Do not continue from `FETCH_HEAD` or guessed SHAs.

## 4. Machine contract

`.ai-bridge/STATE.json` is the canonical machine state. `STATE.md` is a human mirror and cannot override JSON.

The resolver verifies:

- Protocol 3.3;
- requested slot;
- mailbox generation and state revision;
- thread, lane, task and execution epoch;
- current baseline;
- exact inbox, claim and expected outbox;
- matching metadata across JSON, inbox and claim;
- state, inbox and claim blob SHAs;
- deterministic contract digest.

A mismatch returns `BLOCKED_CONTRACT_MISMATCH`.

## 5. Publication

Primary publication must be one exact-scope direct child of the resolved baseline and a fast-forward push to `refs/heads/main`.

Mailbox publication must:

- use the latest freshly resolved mailbox head as parent;
- change only the exact expected outbox path;
- include `CONTRACT_DIGEST`, `STATE_BLOB_SHA`, `INBOX_BLOB_SHA`, `CLAIM_BLOB_SHA`, `MAILBOX_PARENT`, fetched primary identity and validations;
- push only to `refs/heads/coordination/chatgpt-codex-bridge`;
- pass resolver mode `verify-outbox`.

Historical outboxes cannot satisfy a current epoch. Manual SHA transcription is forbidden.

Legal success states are:

- `PASS_PUSHED` for an actual primary delta;
- `PASS_VERIFIED_NO_DELTA` only when the current contract explicitly allows it.

A prose-only return is `FAIL_NO_EXECUTION_EVIDENCE`.

## 6. Model recommendation boundary

Only `plugins/asynchronia/skills/model-selector/SKILL.md` may originate, rank or name a Codex model and reasoning recommendation.

The recommendation is informational. It must not pause, block, authorize or resume a numbered lane. The user alone selects the actual interface model. Unless externally verified, report `USER_SELECTED_UNVERIFIED`.

A material scope change causes recommendation recomputation in the same execution response. No continuation token or model-selection round trip is part of the bridge.

## 7. Thread rotation and stale work

When STATE.json requires thread rotation, prior Codex conversation ownership is void. A fresh conversation adopts only the current claim named by STATE.json.

If STATE.json, mailbox generation or contract digest changes during execution, stop with `BLOCKED_MAILBOX_EPOCH_MOVED`. Do not publish stale work.

## 8. Runtime and acceptance

Scope isolation, exact ownership, stable-read dependencies, mirror ownership and shared wiring remain real safety gates. Git publication is not Safari PASS. User Safari evidence remains user-owned.

## 9. Root synchronization

Every reusable process defect triggers `PROCESS_ROOT_SYNC.md`. Root synchronization is incomplete until affected authority, validator, workflow, mailbox policy, STATE.json, current contract and live Google Drive memory agree and both remote refs are independently verified.
