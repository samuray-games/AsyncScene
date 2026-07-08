# Automatic Safe Bridge Publication Protocol

PROTOCOL_VERSION: GIT_PUSH_3_1
ORCHESTRATION: `ORCHESTRATION.md`

## Numbered bridge lanes

For `мост 1`, `мост 2` or `мост 3`, publication is automatic. The user does not send a separate `пуш`.

After successful validation, Codex must publish both parts of the current slot when authorized:

1. the exact primary implementation commit;
2. the exact immutable mailbox outbox.

## Primary publication

Codex must:

- work from a clean task-owned worktree at the exact authorized remote main baseline;
- stage only authorized paths;
- inspect the staged diff;
- run all required checks;
- create one task-specific direct-child commit;
- prove there are no unrelated paths or outgoing commits;
- push fast-forward without force to the exact authorized primary ref;
- refetch and prove the remote ref equals the published commit.

If remote main moved before publication, return `BLOCKED_MAIN_BASELINE_MOVED`. Do not merge, rebase or rewrite history.

## Mailbox outbox publication

Codex must:

- fetch the latest mailbox head;
- use a separate clean mailbox worktree;
- create exactly the expected immutable outbox path;
- commit it as a direct child of the fetched mailbox head;
- prove the diff contains only the outbox path;
- push fast-forward without force;
- refetch and prove the remote mailbox head equals the outbox commit.

After a mailbox race, rebuild the same immutable payload from the new head and retry up to three times.

## Authentication

Codex may attempt the repository's configured non-interactive authentication repair once.

If write access still fails, return `BLOCKED_PUSH_AUTH` with the complete recovery bundle required by `ORCHESTRATION.md`. Never ask the user to reveal credentials.

The bundle must include complete file bodies, not only SHA values.

## Standalone `пуш`

The explicit `пуш` command remains available only for standalone non-bridge Git maintenance with exact publication authority.

## Forbidden actions

- no force or force-with-lease;
- no amend;
- no rebase;
- no reset;
- no stash;
- no clean;
- no broad staging;
- no unrelated merge;
- no automatic conflict resolution;
- no treating a local-only commit as publication.

## Result

A successful numbered bridge report contains verified remote primary and mailbox SHAs and exactly one next action: return to ChatGPT and write the same `мост N`.

Git publication proves publication only. It does not prove deployment or Safari acceptance.
