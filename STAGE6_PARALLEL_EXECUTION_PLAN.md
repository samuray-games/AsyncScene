# Asynchronia Stage 6 Parallel Execution Plan

PLAN_VERSION: S6-PARALLEL-2026-07-07-03-TRACEABILITY-CLOSED
STAGE: Stage 6 - Интерактивный язык / Tone Profiles
COORDINATOR: ChatGPT
BRIDGE_PROTOCOL: 3.3
ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN
MAX_CONCURRENT_CODEX_LANES: 3
BASE_PROGRESS: accepted 47/100, working readiness 59/100
CURRENT_PRIMARY_BASELINE: pending publication of this plan update
TRACEABILITY_CLOSURE: BRIDGE-20260705-027 / mailbox outbox commit 8f34086d6abce2c0ea48458c1ec3329edbf560d7
STATUS_CORRECTIONS: STAGE6_TRACEABILITY_CORRECTIONS.md

## 1. Objective

Finish Stage 6 with three persistent bridge slots. Independent evidence and preparation work run concurrently. Shared runtime, mirrors, integration, mailbox publication and Safari acceptance remain serialized where required.

## 2. Fixed commands

- `мост 1` - traceability and integration preparation.
- `мост 2` - Boomer lane.
- `мост 3` - Alpha lane.

A number always selects only its fixed slot. After Codex finishes, the user returns to ChatGPT and writes the same numbered command.

## 3. Slot metadata authority

For mutable slot fields, the current mailbox `STATE.md` and its named `Current baseline inbox` supersede historical task inbox values. The original task inbox remains authoritative only for the atomic objective and evidence requirements not replaced by the current baseline inbox.

Historical baseline or protocol drift is evidence to record, not a blocker when current STATE, current baseline inbox, claim and `origin/main` agree.

## 4. Fixed progress scale

- A - Accepted foundation: 20/20.
- B - Bridge and traceability: 7/10.
- C - Boomer lane: 0/22.
- D - Alpha lane: 0/18.
- E - UI Profile Selection: 20/20.
- F - Final integration and closure: 0/10.

Current accepted total: 47/100.
Current working readiness: 59/100.

## 5. Parallel safety rules

1. Maximum three active Codex lanes, one per slot.
2. Every slot has one atomic task, immutable claim, current baseline, exact read scope, exact write scope and expected outbox.
3. Read-only lanes may run concurrently when they do not depend on mutable outputs from another lane.
4. Source and deployed mirrors are one ownership group.
5. Any overlapping write files serialize the affected lanes.
6. `dev-checks.js`, smoke registries, exports, globals, shared resolvers, boot/cache-bust and aggregate smoke are singleton lanes.
7. A frozen collision-free runtime lane executes immediately after current STATE, inbox, claim, baseline, scope, and dependency verification. Scope isolation determines collisions; it is not an approval protocol.
8. Shared `TASKS.md` and `PROJECT_MEMORY.md` have one documentation owner per wave.
9. Mailbox claims and outboxes remain sequential direct-child commits.
10. ChatGPT accepts each slot independently.
11. A stale existing mailbox worktree is ignored; a fresh detached worktree may publish the authorized path.
12. ChatGPT may issue a recovery claim for the same logical thread when Codex lacks Git credentials or was blocked only by stale historical metadata.

## 6. Slot roles

### Slot 1 - Traceability and integration preparation

Initial task: accepted complete.
Later tasks: contradiction closure, write-collision matrix, final traceability and integration preparation.

### Slot 2 - Boomer lane

Initial task: exact evidence for all 32 current Boomer failures.
Later tasks: frozen-table validation, isolated implementation, repeated static audit and Boomer runtime preparation.

### Slot 3 - Alpha lane

Initial task: exact evidence for Alpha FAIL and RUNTIME_REQUIRED surfaces.
Later tasks: frozen-table validation, isolated implementation and Alpha runtime preparation.

## 7. Wave P0 - Numbered bridge infrastructure

- [x] P0.1 Publish initial Parallel Bridge Protocol 2.0.
- [x] P0.2 Open three read-only Stage 6 lanes.
- [x] P0.3 Preserve serialized fail-closed mailbox writes.
- [x] P0.4 Create repository-tracked parallel plan.
- [x] P0.5 Publish numbered commands `мост 1`, `мост 2`, `мост 3`.
- [x] P0.6 Publish remote-first policy and self-healing alias rules.
- [x] P0.7 Publish Protocol 2.4 metadata precedence and recovery-claim rules.
- [x] P0.8 Confirm the installed remote-first V2.2 user alias is forward-compatible.
- [ ] P0.9 Verify all three real claim/outbox paths. Current result: Slot 1 claim and outbox verified; Slots 2 and 3 pending.

B0 remains partially open until Slots 2 and 3 complete real remote mailbox publication.

## 8. Wave 1 - Concurrent read-only evidence

### `мост 1` - B1 current-state traceability

- [x] T1.1 Inventory Stage 6 artifacts and substeps.
- [x] T1.2 Record source and deployed mirror paths.
- [x] T1.3 Record implementation and status identities.
- [x] T1.4 Record generators, validators and runtime helpers.
- [x] T1.5 Record static verdicts.
- [x] T1.6 Record Safari status and artifact identity.
- [x] T1.7 Classify PASS, FAIL, PENDING, RUNTIME_REQUIRED or N/A.
- [x] T1.8 List contradictions among repository status, plans, board and memory.

Accepted weight: B1 = 7.
Evidence: claim commit `71f9b4d466ad6f6707c34f73568786d5f7e6f1bf`; outbox commit `8f34086d6abce2c0ea48458c1ec3329edbf560d7`.

### `мост 2` - C1 Boomer exact evidence

- [ ] B1.1 Reproduce current 4.4A audit from main.
- [ ] B1.2 Confirm audited 147, fail 32, pass 115, structural 0.
- [ ] B1.3 Identify 3 forbidden rows.
- [ ] B1.4 Identify 11 mapped-exact rows.
- [ ] B1.5 Identify 17 unmapped rows.
- [ ] B1.6 Identify the wrong-profile resolver row.
- [ ] B1.7 Record placeholders, protected tokens, source emitter and mirror for every FAIL row.
- [ ] B1.8 Cross-check the Boomer decision workbook without inventing copy.

Expected accepted weight: C1 = 3.

### `мост 3` - D1 Alpha exact evidence

- [ ] A1.1 Confirm PASS surfaces: attack, rematch, P2P give, P2P request and cop flow.
- [ ] A1.2 Identify exact escape FAIL surfaces.
- [ ] A1.3 Identify exact teach FAIL surfaces.
- [ ] A1.4 Identify exact social-action FAIL surfaces.
- [ ] A1.5 Identify exact vote RUNTIME_REQUIRED surfaces.
- [ ] A1.6 Identify exact report RUNTIME_REQUIRED surfaces.
- [ ] A1.7 Record placeholders, action IDs, handlers, emitters and mirrors.
- [ ] A1.8 Produce a no-copy evidence package for ChatGPT decisions.

Expected accepted weight: D1 = 3.

## 9. Wave 2 - Parallel decision packages

### Boomer

- [ ] Reconcile workbook with verified evidence.
- [ ] Confirm prepared decisions.
- [ ] Resolve genuine product ambiguities with the user.
- [ ] Freeze `TEXT_ID -> exact Boomer target`.
- [ ] Verify placeholders, tokens, numbers and emoji.

Expected weight: C2 = 4.

### Alpha

- [ ] Create exact replacements for FAIL surfaces.
- [ ] Define runtime evidence for vote/report.
- [ ] Freeze `TEXT_ID/action surface -> exact Alpha target`.
- [ ] Verify ultra-direct wording without infantilism or semantic loss.
- [ ] Verify placeholders, tokens, numbers and action IDs.

Expected weight: D2 = 3.

## 10. Wave 3 - Validation and collision map

- [ ] Slot 2 validates the frozen Boomer table.
- [ ] Slot 3 validates the frozen Alpha table.
- [ ] Slot 1 builds the exact write-file intersection matrix.
- [ ] Split non-overlapping implementation units into parallel tasks.
- [ ] Route shared/runtime files to serialized singleton tasks.
- [ ] Freeze branch/worktree and mirror ownership.

Expected weights: C3 = 2, D3 = 2.

## 11. Wave 4 - Implementation

- [ ] Apply approved Boomer copy only in Boomer-owned files and mirrors.
- [ ] Apply Alpha presentation only in Alpha-owned files and mirrors.
- [ ] Permit parallel writes only with zero intersection.
- [ ] Fix shared resolver sequentially.
- [ ] Change `dev-checks`, registries, exports, globals and boot sequentially.
- [ ] Verify source/docs parity and served artifact identity.

Expected weights: C4 = 5, D4 = 5.

## 12. Wave 5 - Profile acceptance

### Boomer

- [ ] Repeat 4.4A.
- [ ] Reach failRowCount 0 and structuralFailureCount 0.
- [ ] Reach `STATIC_PASS / READY_FOR_RUNTIME_SMOKE`.
- [ ] Run Boomer 4.4B on the exact deployed artifact.
- [ ] Obtain user iPhone Safari PASS.

Expected weights: C5 = 3, C6 = 5.

### Alpha

- [ ] Pass Alpha static aggregate.
- [ ] Verify vote/report runtime evidence.
- [ ] Run Alpha exact deployed aggregate.
- [ ] Obtain user iPhone Safari PASS.

Expected weight: D5 = 5.

## 13. Wave 6 - Final integration

- [ ] Final traceability audit.
- [ ] Close all contradictions.
- [ ] Produce one exact deployed artifact.
- [ ] Run Millennial regression.
- [ ] Run Zoomer regression without rewriting accepted docs.
- [ ] Run Boomer aggregate.
- [ ] Run Alpha aggregate.
- [ ] Run Profile Selection regression.
- [ ] Obtain final user iPhone Safari PASS.
- [ ] One owner updates shared status documents.
- [ ] Close slots, claims, locks and temporary branches.
- [ ] Stage 6 COMPLETE.

Expected weights: F1 = 3, F2 = 5, F3 = 2.
