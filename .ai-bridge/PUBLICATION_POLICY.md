# Bridge Autopilot Policy

POLICY_VERSION: CODEX_AUTOPILOT_2026_07_08_ROOT_SYNC
STATUS: ACTIVE
DEFAULT_PUBLICATION_MODE: CODEX_AUTO_PULL_PUSH
ROOT_CAUSE_SYNC: REQUIRED

## Canonical numbered bridge loop

1. ChatGPT writes the task inbox, claim and STATE.
2. The user sends the matching numbered bridge command.
3. Codex fetches remote refs, reads current authority, executes, validates, pushes the primary commit, writes and pushes the immutable outbox, and verifies both refs.
4. The user sends the same numbered command to ChatGPT.
5. ChatGPT independently verifies and accepts or corrects.
6. A reusable process defect triggers `PROCESS_ROOT_SYNC.md` before the next project action.
7. Repeat.

The user does not send separate `пул`, `пуш`, payload-copy, file-body export or authentication-retry commands in the normal loop.

## Required startup

On every numbered command Codex must:

1. fetch main and mailbox;
2. read current STATE;
3. read the current inbox and claim named by STATE;
4. verify repository, slot, thread, task, claim, phase and baseline;
5. use a clean worktree from the exact authorized main baseline.

Local main state is irrelevant. Never merge, rebase, reset, stash, clean or repair it.

## Primary publication

Codex must:

1. implement only authorized paths;
2. run all checks;
3. create one atomic direct-child primary commit;
4. fetch `origin/main` immediately before push;
5. return `BLOCKED_MAIN_BASELINE_MOVED` if the baseline changed;
6. push fast-forward without force;
7. fetch again and prove `origin/main` equals the commit;
8. derive the exact primary SHA and actual parent from the fetched remote commit.

Automatic patch rebuilding on a moved baseline is forbidden under the old contract.

## Outbox publication

Only after remote primary verification Codex must:

1. fetch mailbox again;
2. use a clean mailbox worktree;
3. write exactly the expected immutable outbox;
4. include the machine-derived fetched primary SHA and actual parent;
5. include exact paths, validations, runtime and Safari status;
6. commit only the outbox path;
7. push fast-forward;
8. fetch and verify the remote outbox commit and path.

Manual SHA transcription is forbidden.

A SHA mismatch is not `PASS_PUSHED`.

Codex never edits STATE.

## Final Codex response

A successful run returns `PASS_PUSHED` with:

- thread, lane and task IDs;
- selected model status;
- fetched remote primary SHA and actual parent;
- fetched remote mailbox outbox SHA;
- exact changed paths;
- validation results and failures;
- runtime and Safari status;
- one next action.

A local-only commit, SHA-only package, connector payload or unpushed outbox is not success.

## Authentication

Codex may run one configured non-interactive authentication repair.

If write access still fails, return `BLOCKED_PUSH_AUTH` with the complete recovery bundle from `ORCHESTRATION.md`.

Never ask the user for credentials.

Connector publication is emergency recovery only.

## Root-cause synchronization

When publication, evidence, validator, STATE or baseline behavior exposes a reusable process defect, ChatGPT must:

1. publish the task correction;
2. update all affected root process authorities and validator;
3. update this mailbox policy;
4. update STATE and the current inbox;
5. create a replacement claim when main moved;
6. update Google Drive memory;
7. verify all remote refs.

Project execution resumes only after synchronization is complete.

## Safety prohibitions

Never:

- force-push;
- amend published commits;
- merge or rebase unrelated work;
- stage broad paths;
- absorb another slot;
- modify STATE from Codex;
- claim publication before fetching both refs;
- ask for separate `пул` or `пуш`;
- manually transcribe reported commit SHAs.
