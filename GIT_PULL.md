# Automatic Remote-First Bridge Sync Protocol

PROTOCOL_VERSION: GIT_PULL_3_1
ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN

For every numbered bridge command:

1. fetch remote main and mailbox before replying;
2. read current STATE, inbox, claim and execution epoch;
3. use clean task-owned worktrees at the exact authorized refs;
4. treat older claims, outboxes and conversational completion as historical only;
5. when STATE requires thread rotation, use a fresh Codex conversation and the replacement claim;
6. return `BLOCKED_MAIN_BASELINE_MOVED` if remote main differs from the authorized baseline.

Local main state is not a prerequisite and must not be rewritten.

Standalone `пул` remains only for explicit non-bridge maintenance.
