# Bridge Publication Policy

BRIDGE_PUBLICATION_POLICY_VERSION: 1
BRIDGE_PROTOCOL: 4.0
CANONICAL_SOURCE: REPOSITORY

This document is the sole canonical source for numbered mailbox publication
policy.  A mailbox contains a rendered copy at `.ai-bridge/PUBLICATION_POLICY.md`.
The rendered copy must be byte-identical to `render_slot_policy(slot)` from
`tools/bridge_v4_contract.py`; hand-authored variants are invalid.

## Rendered Slot Identity

For slot `N` in `1, 2, 3`, the renderer emits exactly:

```text
BRIDGE_PUBLICATION_POLICY_VERSION: 1
BRIDGE_PROTOCOL: 4.0
SLOT: N
BRANCH_MAILBOX: coordination/chatgpt-codex-bridge-N
CANONICAL_POLICY: BRIDGE_PUBLICATION_POLICY.md
```

The selected mailbox ref must be freshly fetched, must be the parent of its
publication commit, and may change only its authorized slot-local artifact.
Publishing a rendered policy, inbox, claim, outbox, receipt, or STATE on a
different numbered ref fails closed.  A rendered policy must not refer to any
other slot, mailbox ref, task, claim, or state.

## State And Snapshot Gate

Before a mailbox publication, the rendered policy and STATE must agree on slot
and mailbox ref.  Repository snapshots are checked against the corresponding
STATE before they are promoted.  `STATUS: AVAILABLE` is valid only with
`THREAD: NONE`, `TASK: NONE`, and `BRANCH_TASK: bridge/N/AVAILABLE`.

Mailbox publication and bridge snapshot synchronization are separate phases.
This repository policy never authorizes a `.ai-bridge/**` write.
