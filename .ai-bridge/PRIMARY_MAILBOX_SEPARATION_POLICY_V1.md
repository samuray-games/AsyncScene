# Primary and Mailbox Branch Separation Policy

POLICY_ID: PRIMARY_MAILBOX_SEPARATION_V1
STATUS: ACTIVE_WHEN_REFERENCED_BY_STATE

- Primary source commits are published only to `main`.
- Inbox, claim, STATE and outbox artifacts are published only to `coordination/chatgpt-codex-bridge`.
- `.ai-bridge/inbox/**`, `.ai-bridge/claims/**`, `.ai-bridge/outbox/**` and `.ai-bridge/STATE.md` are forbidden in a primary task commit unless the task explicitly authorizes primary cleanup by deleting a previously leaked mailbox artifact.
- Publishing an outbox to `main` is a scope and branch violation even when its path and thread identity are otherwise correct.
- A terminal outbox must contain actual remote mailbox commit, actual STATE blob SHA and `byteEquality: MATCH`. `N/A_NOT_YET_PUSHED`, `PENDING_REMOTE_PUSH`, placeholders and future instructions are invalid terminal evidence.
- Primary publication and mailbox publication are separate transactions and separate commits on their respective branches.
