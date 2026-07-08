# Bridge Autopilot Policy

POLICY_VERSION: CODEX_AUTOPILOT_2026_07_08_ROOT_CI_GATE
STATUS: ACTIVE
ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN
DEFAULT_PUBLICATION_MODE: CODEX_AUTO_PULL_PUSH

## Fresh execution

Every numbered command must freshly fetch main and mailbox, then read current STATE, inbox, claim and `EXECUTION_EPOCH` before replying.

Old conversation state, claims, inboxes and outboxes are historical only.

## Thread rotation

When STATE says `THREAD_ROTATION_REQUIRED: true`, the previous Codex conversation is superseded. A fresh Codex conversation adopts the replacement claim named by STATE and executes immediately on the matching numbered command.

## Success gate

`PASS_PUSHED` is valid only when:

- the current expected outbox exists remotely;
- mailbox head contains it;
- primary-write work advanced remote main from baseline;
- remote main equals the reported SHA;
- parent and exact paths are verified;
- required checks passed;
- outbox contains machine-derived fetched SHA and parent.

A return-to-ChatGPT line without this evidence is `FAIL_NO_EXECUTION_EVIDENCE`.

## Root policy CI gate

- Root process changes must pass `tools/validate-orchestration-policy.py` before a lane is reissued.
- `.github/workflows/orchestration-policy.yml` must cover every root file read by that validator for both push and pull_request events.
- A failing current `orchestration-policy` run blocks lane execution and requires root correction before a new baseline and execution epoch are issued.
- Historical failed runs remain audit evidence only and do not override a newer successful run on current main.
- Root corrections should be grouped and prevalidated to avoid noisy sequences of preventable CI failures.

## Publication

Primary and mailbox commits must be fast-forward, exact-scope and remotely refetched. Manual SHA transcription is forbidden.

If main moved, return `BLOCKED_MAIN_BASELINE_MOVED`. If write access still fails after one repair, return `BLOCKED_PUSH_AUTH` with complete evidence.

Codex never edits STATE.
