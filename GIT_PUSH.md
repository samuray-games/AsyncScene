# Automatic Safe Bridge Publication Protocol

PROTOCOL_VERSION: GIT_PUSH_3_1
ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN

A numbered bridge result is successful only when:

1. the current execution epoch was freshly read;
2. the authorized primary commit was pushed and remote main was refetched;
3. the exact current outbox was pushed and remote mailbox was refetched;
4. reported SHA and parent were derived from fetched remote main;
5. exact changed paths and validations were verified.

A prior outbox cannot satisfy a new execution epoch.

A return-to-ChatGPT response without the current remote outbox is `FAIL_NO_EXECUTION_EVIDENCE`.

If main moved, return `BLOCKED_MAIN_BASELINE_MOVED`. If authenticated publication still fails after one repair, return `BLOCKED_PUSH_AUTH` with complete evidence.

No force-push, amend, rebase, reset, stash, clean, broad staging or unrelated merge.

Standalone `пуш` remains only for explicit non-bridge maintenance.
