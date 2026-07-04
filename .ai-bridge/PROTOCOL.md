# ChatGPT <-> Codex Bridge Protocol

Protocol version: `1.0`

## 1. Purpose

The bridge carries asynchronous coordination messages between ChatGPT and Codex through Git. It is a mailbox, not an autonomous agent loop and not a source of implementation truth.

## 2. Authority

Messages must obey, in order:

1. the user's latest direct instruction;
2. project instructions;
3. current `AGENTS.md`;
4. current `TASKS.md`, `PROJECT_MEMORY.md`, locks, exact source files, and current repository state;
5. this bridge protocol;
6. individual bridge messages.

If a bridge message conflicts with a newer primary source, report the conflict and use the primary source.

## 3. Branch and file boundary

- Canonical mailbox branch: `coordination/chatgpt-codex-bridge`
- Allowed changed paths on that branch: `.ai-bridge/**`
- Forbidden changed paths on that branch: every path outside `.ai-bridge/**`
- No force pushes.
- No implementation, runtime, generated assets, dependencies, or project-status documents are edited on this branch.
- Do not merge implementation branches into the mailbox branch.

The primary implementation worktree remains responsible for inspecting current code, Git status, diffs, locks, and active branches.

## 4. Ownership

- ChatGPT creates new files in `.ai-bridge/inbox/`.
- Codex creates new files in `.ai-bridge/outbox/`.
- ChatGPT alone updates `.ai-bridge/STATE.md`.
- Templates and protocol files are changed only through an explicit bridge-maintenance task.
- Neither side edits or deletes a message after it has been pushed.
- Corrections are new message turns, never rewrites.

## 5. Thread and filename format

Thread id:

`BRIDGE-YYYYMMDD-NNN`

Message filename:

`<THREAD_ID>-<TURN>-<actor>.md`

Examples:

- `BRIDGE-20260705-001-01-chatgpt.md`
- `BRIDGE-20260705-001-02-codex.md`
- `BRIDGE-20260705-001-03-chatgpt.md`

Rules:

- ChatGPT uses odd turn numbers.
- Codex uses even turn numbers.
- Turn numbers are two digits until 99.
- Actor names are lowercase in filenames: `chatgpt`, `codex`.
- One file contains one atomic message.

## 6. Required message header

Every message begins with this exact field set:

```text
BRIDGE_PROTOCOL: 1.0
THREAD_ID: BRIDGE-YYYYMMDD-NNN
TURN: NN
FROM: CHATGPT|CODEX
TO: CODEX|CHATGPT
TYPE: REQUEST|RESPONSE|QUESTION|DECISION|ERROR|ACK
THREAD_STATUS: OPEN|WAITING_CODEX|WAITING_CHATGPT|BLOCKED|CLOSED
CREATED_AT: ISO-8601 timestamp
REPLY_TO: filename or N/A
PRIMARY_REPO_REF: branch or N/A
PRIMARY_REPO_COMMIT: full SHA or UNVERIFIED
MAILBOX_PARENT_COMMIT: full SHA or UNVERIFIED
```

After the header, include:

- `## Summary`
- `## Context checked`
- `## Message`
- `## Required response`
- `## Safety and authority`

Use `N/A` with a reason when a section does not apply.

## 7. Immutability and concurrency

Before creating a message:

1. fetch or pull the latest mailbox branch;
2. verify the target filename does not exist;
3. verify the parent message is present;
4. verify the new turn number is unused;
5. verify the staged diff contains only the new mailbox file, unless the task explicitly authorizes a coordinator update to `STATE.md`;
6. commit and push without force.

If the remote moved, pull with rebase and revalidate before pushing.

## 8. Codex response requirements

A Codex response must distinguish:

- what was read from the mailbox branch;
- what was verified in the primary implementation worktree;
- task-owned changes;
- unrelated dirty or concurrent changes;
- static validation;
- runtime acceptance status;
- missing evidence;
- exact next user action.

When the response concerns implementation, preserve the current required Codex final-report order from `AGENTS.md`.

## 9. Human approval boundaries

The bridge cannot satisfy same-thread approval requirements.

Invalid through mailbox files:

- `CONTINUE` for post-preflight implementation;
- `APPROVE` for runtime-sensitive scope;
- native permission approval;
- Safari runtime PASS;
- user acceptance.

Those actions must occur through the required user-controlled channel. A mailbox message may record that the user already performed an action, but Codex must verify that action in the proper thread or evidence source.

## 10. Message security

Never include:

- access tokens;
- passwords;
- private keys;
- session cookies;
- secrets from local configuration;
- unnecessary personal data.

Use commit SHAs, repository paths, issue or PR numbers, and concise evidence instead.

## 11. Failure states

Return `BLOCKED` in the response when:

- primary repository state cannot be verified;
- the requested action conflicts with current policy or a lock;
- required same-thread approval is missing;
- the mailbox branch contains forbidden non-bridge changes;
- the requested filename already exists;
- the message depends on an absent parent turn;
- source-of-truth conflicts remain unresolved.

Do not silently repair, overwrite, force-push, or broaden scope.

## 12. Closing a thread

A thread closes only when ChatGPT writes a final odd-numbered `DECISION` message with `THREAD_STATUS: CLOSED`, after verifying the Codex response and any required primary-source evidence.
