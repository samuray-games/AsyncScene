# Bridge Autopilot Policy

POLICY_VERSION: CODEX_AUTOPILOT_2026_07_08
STATUS: ACTIVE
DEFAULT_PUBLICATION_MODE: CODEX_AUTO_PULL_PUSH

## Canonical numbered-bridge loop

For every numbered bridge lane, the normal workflow is exactly:

1. ChatGPT writes the task inbox, claim and current mailbox STATE.
2. The user sends `мост 1`, `мост 2` or `мост 3` to the matching Codex slot.
3. Codex automatically synchronizes remote refs, reads current STATE/inbox/claim, executes the task, validates it, commits it, pushes the primary commit, writes and pushes the immutable outbox.
4. The user sends the same numbered bridge command to ChatGPT.
5. ChatGPT independently verifies remote commits, scope, evidence and acceptance, then publishes the next inbox.
6. Repeat.

The user must not need separate `пул`, `пуш`, payload-copy, file-body export or authentication-retry commands during the normal loop.

## Required Codex startup sequence

On every numbered bridge command Codex must:

1. run `git fetch --prune origin main coordination/chatgpt-codex-bridge`;
2. read `origin/coordination/chatgpt-codex-bridge:.ai-bridge/STATE.md`;
3. read the current inbox and claim named by STATE directly from the remote mailbox ref;
4. verify repository, slot, thread, task, claim, phase and current remote baseline;
5. use a clean dedicated worktree created from the exact current `origin/main` commit.

Codex must never rely on a dirty, ahead, behind or diverged local `main`. It must not merge, rebase, reset or repair the user's ordinary working branch. Local branch state is irrelevant to bridge execution.

## Execution and primary publication

After confirmation requirements are satisfied, Codex must:

1. implement only the authorized scope in the clean task worktree;
2. run all required tests and exact changed-path checks;
3. create one atomic primary commit;
4. fetch `origin/main` again immediately before publication;
5. push only when the primary commit is a fast-forward descendant of the current remote baseline;
6. use `git push origin HEAD:refs/heads/main`;
7. fetch and verify that `origin/main` equals the pushed primary commit.

If `origin/main` moved without overlapping the authorized paths, Codex may automatically rebuild the same exact patch once on a fresh worktree at the new baseline, rerun validation and push the rebuilt direct child.

If the moved baseline overlaps the authorized paths or changes task assumptions, return `BLOCKED_BASELINE_COLLISION` with exact conflicting paths. Never force-push.

## Outbox publication

Only after the primary commit is remotely verified, Codex must:

1. fetch `origin/coordination/chatgpt-codex-bridge` again;
2. create a clean mailbox worktree from that remote ref;
3. write exactly the expected immutable outbox path named by STATE/inbox;
4. include the verified primary commit SHA, parent, exact changed paths, validations, runtime/Safari status and one next action;
5. commit only the outbox path;
6. push `HEAD:refs/heads/coordination/chatgpt-codex-bridge` as a fast-forward;
7. fetch and verify the remote outbox commit and path.

Codex must not edit mailbox STATE. ChatGPT owns STATE and closure records.

## Final Codex response

A successful numbered bridge run returns:

`PASS_PUSHED`

with:

- thread, lane and task IDs;
- selected model/reasoning;
- verified remote primary SHA and parent;
- verified remote mailbox outbox SHA;
- exact changed paths;
- validation results and failure arrays;
- runtime/Safari status;
- exactly one next action: return to ChatGPT and send the same numbered bridge command.

A local-only commit, SHA-only package, connector payload or unpushed outbox is not a successful bridge result.

## Authentication

Codex is expected to use the repository's already configured authenticated Git transport automatically.

It may inspect `git remote -v`, `gh auth status` and configured credential transport without prompting the user during a normal successful run.

It must not repeatedly retry authentication or offer multiple recovery paths.

If no authenticated GitHub write transport exists, return exactly one hard blocker:

`BLOCKED_GIT_AUTH_ONE_TIME_SETUP`

with the failing command and transport. This is an environment blocker, not a task failure. After credentials are repaired once, the canonical automatic loop resumes.

ChatGPT connector publication is emergency recovery only when the user explicitly chooses it after an authentication blocker. It is not the default numbered-bridge route.

## Safety prohibitions

Never:

- force-push;
- amend published commits;
- merge or rebase unrelated local work;
- stage broad or unrelated paths;
- absorb another slot's work;
- modify STATE from Codex;
- claim publication before fetching and verifying both remote refs;
- ask the user for separate `пул` or `пуш` commands in the normal loop.
