# Bridge 123 Revalidation Repair Manifest

TASK_ID: TASK-INFRA-BRIDGE-123-REVALIDATION-REPAIR-20260714
BRIDGE_PROTOCOL: 4.0
STATUS: PENDING_INDEPENDENT_REVIEW
SAFARI_STATUS: N/A

## Observed Heads

- main: `cab386d0d5229036e0a14d04412c713f2b34a204` (refetched after continuation)
- Slot 1: `6727450e193053c8da8162f427404b1473f85d70`
- Slot 2: `7421761f12126e88047fb2e6cd1c89490129a9c9`
- Slot 3: `f9ebb33c7319b498307669c0d240f9eb05db8494`

## Preserved History

- Slot 1 stale identity remains historical: generation 1, thread
  `BRIDGE-20260711-101`, epoch `S6-TRACEABILITY-READONLY-B1-20260711-OPEN`.
- Slot 2 rejected identity remains historical: generation 14, thread
  `BRIDGE-20260711-091`, epoch `S6-BOOMER-4_4B-FIX4-R4-20260711-2322JST`,
  rejected head `baf51aeb1407a3b288d7afd0d07966e1a323bc8a`.

## Fresh Read-Only Canaries

These identities are new, immutable manifest definitions.  They do not resume
Stage 6 and must each receive a fresh model preflight and same-thread CONTINUE.

| Slot | Generation | Thread | Task branch | Execution epoch |
| --- | --- | --- | --- | --- |
| 1 | 2 | `BRIDGE-20260714-123-101` | `bridge/1/BRIDGE-20260714-123-101` | `BRIDGE-123-S1-CANARY-G2-20260714` |
| 2 | 15 | `BRIDGE-20260714-123-091` | `bridge/2/BRIDGE-20260714-123-091` | `BRIDGE-123-S2-CANARY-G15-20260714` |
| 3 | 1 | `BRIDGE-20260714-123-301` | `bridge/3/BRIDGE-20260714-123-301` | `BRIDGE-123-S3-CANARY-G1-20260714` |

## Serialized Post-Review Order

1. Independent ChatGPT review accepts this repository diff and validation evidence.
2. ChatGPT publishes the Slot 1 rendered policy and fresh canary artifacts, then refetches and proves Slots 2 and 3 did not move.
3. Repeat for Slot 2, then Slot 3; each publication is a separate fast-forward commit on its own numbered ref.
4. Run and independently review each fresh read-only canary in the same Slot 1, Slot 2, Slot 3 order.
5. Only after all three independent canary reviews pass may ChatGPT change each affected STATE to `AVAILABLE`.
6. After verified mailbox publication, one final owner synchronizes repository snapshots in Slot 1, Slot 2, Slot 3 order, then synchronizes live memory from those verified snapshots.

Repository snapshots must not change before verified mailbox publication.  This
manifest neither publishes mailbox artifacts nor authorizes Stage 6.
