# Automatic Safe Bridge Publication Protocol

PROTOCOL_VERSION: GIT_PUSH_3_1
ROOT_CAUSE_SYNC: REQUIRED
ORCHESTRATION: `ORCHESTRATION.md`
ROOT_SYNC: `PROCESS_ROOT_SYNC.md`

## Numbered bridge lanes

For `мост 1`, `мост 2` or `мост 3`, publication is automatic. The user does not send a separate `пуш`.

After validation Codex publishes:

1. the exact authorized primary commit;
2. the exact immutable mailbox outbox.

## Primary publication

Codex must:

- use a clean worktree at the exact authorized baseline;
- stage only authorized paths;
- inspect the staged diff;
- run all required checks;
- create one task-specific direct-child commit;
- prove exact paths and ancestry;
- push fast-forward without force;
- refetch and prove `origin/main` equals the commit;
- derive the reported SHA and parent from the fetched remote commit.

If main moved, return `BLOCKED_MAIN_BASELINE_MOVED`. Do not rebuild, merge, rebase or rewrite history under the old contract.

## Outbox publication

Codex must:

- fetch the latest mailbox head;
- use a separate clean mailbox worktree;
- create exactly the expected immutable outbox;
- write the machine-derived fetched primary SHA and actual parent;
- commit only the outbox path;
- push fast-forward;
- refetch and verify the remote mailbox head and outbox path.

Manual SHA transcription is forbidden.

A primary SHA mismatch is automatic rejection even when the implementation diff is correct.

## Mailbox race

After a mailbox race, rebuild the same payload from the new head and retry up to three times.

## Authentication

Codex may attempt one configured non-interactive authentication repair.

If write access still fails, return `BLOCKED_PUSH_AUTH` with the complete recovery bundle required by `ORCHESTRATION.md`. Never ask the user for credentials.

The bundle must include complete file bodies, not only SHA values.

## Root-cause propagation

A publication or evidence defect that can recur triggers `PROCESS_ROOT_SYNC.md`.

The task correction, root authority, validator, mailbox policy, STATE and live memory must be synchronized before the next project action.

## Standalone `пуш`

Standalone `пуш` remains only for explicit non-bridge maintenance with exact publication authority.

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
- no local-only publication claims.

## Result

A successful numbered bridge report contains fetched remote primary and mailbox SHAs, the actual primary parent, exact paths, validations and exactly one next action.

Git publication proves publication only. It does not prove deployment or Safari acceptance.
