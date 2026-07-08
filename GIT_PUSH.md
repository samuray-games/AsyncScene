# Automatic Safe Bridge Publication Protocol

PROTOCOL_VERSION: GIT_PUSH_3_2
ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN
VERIFIED_NO_DELTA: ALLOWED_WITH_EVIDENCE

A numbered bridge result is successful only in one of two modes.

## Primary delta

1. the current execution epoch was freshly read;
2. one authorized direct-child primary commit was pushed and remote main was refetched;
3. the exact current outbox was pushed and remote mailbox was refetched;
4. reported SHA and parent were derived from fetched remote main;
5. exact changed paths and validations were verified.

Result: `PASS_PUSHED`.

## Verified no delta

This mode requires `ALLOW_VERIFIED_NO_DELTA: true` in the current inbox or claim.

1. remote main still equals the authorized baseline;
2. required generation and validators pass;
3. deterministic regeneration produces zero diff;
4. exact changed paths are empty;
5. protected blobs are unchanged;
6. the exact evidence outbox is pushed and remote mailbox is refetched;
7. the outbox contains `completionMode: VERIFIED_NO_DELTA`, `primaryChanged:false`, `primaryParent:N/A` and `changedPaths:[]`.

Result: `PASS_VERIFIED_NO_DELTA`.

Empty primary commits are forbidden.

A prior outbox cannot satisfy a new execution epoch.

A return-to-ChatGPT response without the current evidence package is `FAIL_NO_EXECUTION_EVIDENCE`.

If main moved, return `BLOCKED_MAIN_BASELINE_MOVED`. If authenticated publication still fails after one repair, return `BLOCKED_PUSH_AUTH` with complete evidence.

No force-push, amend, rebase, reset, stash, clean, broad staging or unrelated merge.

Standalone `пуш` remains only for explicit non-bridge maintenance.
