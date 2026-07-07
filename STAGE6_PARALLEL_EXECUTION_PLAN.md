# Asynchronia Stage 6 Parallel Execution Plan

PLAN_VERSION: S6-PARALLEL-2026-07-07-02-NUMBERED
STAGE: Stage 6 - Интерактивный язык / Tone Profiles
COORDINATOR: ChatGPT
BRIDGE_PROTOCOL: 2.1
MAX_CONCURRENT_CODEX_LANES: 3
BASE_PROGRESS: accepted 40/100, working readiness 52/100

## 1. Objective

Finish Stage 6 with three persistent user-facing bridge slots. Independent evidence and preparation work run concurrently. Shared runtime, mirror ownership, integration, mailbox publication and Safari acceptance remain serialized where required.

## 2. Fixed bridge commands

- `мост 1` - Bridge Slot 1.
- `мост 2` - Bridge Slot 2.
- `мост 3` - Bridge Slot 3.

The former bare `мост` command is superseded.

ChatGPT assigns one atomic task to each slot by writing the exact inbox, expected claim, expected outbox, baseline, dependencies and scope into mailbox `STATE.md`.

For each assigned task ChatGPT tells the user:

- create a new Codex thread;
- write the exact numbered command for that slot;
- choose the model/reasoning recommended by that thread;
- send `CONTINUE` in the same thread.

When Codex completes a slot, its exact next user action is to return to ChatGPT and write the same numbered command. ChatGPT then independently verifies only that slot and either closes it, corrects it, or assigns the next compatible task to that slot.

## 3. Fixed progress scale

Weights never change during execution.

- A - Accepted foundation: 20/20 accepted.
- B - Bridge and traceability: 0/10 accepted.
- C - Boomer lane: 0/22 accepted.
- D - Alpha lane: 0/18 accepted.
- E - UI Profile Selection: 20/20 accepted.
- F - Final integration and closure: 0/10 accepted.

Current accepted total: 40/100.
Current working readiness: 52/100.

## 4. Parallel safety rules

1. Maximum three active Codex lanes, one per numbered slot.
2. Every slot has one atomic task, one immutable claim, one baseline, one exact read scope, one exact write scope and one expected outbox.
3. A numbered command selects only its fixed slot. It never falls through to another slot.
4. Read-only lanes may run concurrently when they do not depend on mutable outputs from another lane.
5. Source and deployed mirrors are one ownership group.
6. Any overlap in write files serializes the affected lanes.
7. `dev-checks.js`, smoke registries, exports, globals, shared resolvers, boot/cache-bust and aggregate smoke are singleton serialized lanes.
8. Runtime-sensitive writes require MODEL_PREFLIGHT_ONLY, same-thread `CONTINUE`, frozen scope, same-thread `APPROVE`, deployment evidence and user Safari smoke.
9. Shared `TASKS.md` and `PROJECT_MEMORY.md` have one documentation owner per wave.
10. Mailbox claims and outboxes remain sequential direct-child commits even while task work runs concurrently.
11. ChatGPT accepts each slot independently. One slot's PASS never promotes another slot.

## 5. Slot roles

The slot numbers are stable, but their tasks may advance after acceptance.

### Bridge Slot 1 - Traceability and integration preparation

Initial task: Stage 6 current-state traceability.
Later tasks: contradiction closure, write-collision matrix, final PDF traceability and final integration preparation.

### Bridge Slot 2 - Boomer lane

Initial task: exact evidence for all 32 current Boomer failures.
Later tasks: frozen-table validation, isolated implementation, repeated static audit and Boomer runtime preparation.

### Bridge Slot 3 - Alpha lane

Initial task: exact evidence for Alpha FAIL and RUNTIME_REQUIRED surfaces.
Later tasks: frozen-table validation, isolated implementation and Alpha runtime preparation.

A slot may be temporarily idle or receive a different compatible read-only/integration task after its previous task is independently accepted.

## 6. Parallel roadmap and user checklist

### Wave P0 - Numbered bridge infrastructure

- [x] P0.1 Publish initial Parallel Bridge Protocol 2.0.
- [x] P0.2 Open three read-only Stage 6 lanes.
- [x] P0.3 Preserve fail-closed serialized mailbox writes.
- [x] P0.4 Create repository-tracked parallel plan.
- [ ] P0.5 Publish Protocol 2.1 with commands `мост 1`, `мост 2`, `мост 3`.
- [ ] P0.6 Update root AGENTS, BRIDGE, bootstrap and pull verification.
- [ ] P0.7 Update mailbox STATE and all three baseline inbox turns.
- [ ] P0.8 Install/migrate the local user-level Codex managed block to V2.1.
- [ ] P0.9 Run three real fixed-slot claim smokes and independently verify unique claims.

Acceptance effect: infrastructure only. B0 is accepted only after numbered command routing and real claim/outbox verification pass.

### Wave 1 - Three concurrent read-only tasks

#### `мост 1` - B1 current-state traceability

- [ ] T1.1 Inventory every Stage 6 PDF/substep and repository artifact.
- [ ] T1.2 Record source and deployed mirror paths.
- [ ] T1.3 Record exact implementation and status commits.
- [ ] T1.4 Record generators, validators and runtime helpers.
- [ ] T1.5 Record static status.
- [ ] T1.6 Record Safari status and exact artifact identity.
- [ ] T1.7 Classify every item PASS, FAIL, PENDING, RUNTIME_REQUIRED or proven N/A.
- [ ] T1.8 List contradictions among repository status, plans, board and memory.

Expected accepted weight after independent closure: B1 = 7 points.

#### `мост 2` - C1 Boomer exact evidence

- [ ] B1.1 Reproduce current 4.4A audit from main.
- [ ] B1.2 Confirm audited 147, fail 32, pass 115, structural 0.
- [ ] B1.3 Identify the 3 forbidden rows.
- [ ] B1.4 Identify the 11 mapped-exact rows.
- [ ] B1.5 Identify the 17 unmapped rows.
- [ ] B1.6 Identify the wrong-profile resolver row.
- [ ] B1.7 Record placeholders, protected tokens, source emitter and mirror for every row.
- [ ] B1.8 Cross-check the Boomer decision workbook without inventing copy.

Expected accepted weight after independent closure: C1 = 3 points.

#### `мост 3` - D1 Alpha exact evidence

- [ ] A1.1 Confirm PASS surfaces: attack, rematch, P2P give, P2P request and cop flow.
- [ ] A1.2 Identify exact escape FAIL surfaces.
- [ ] A1.3 Identify exact teach FAIL surfaces.
- [ ] A1.4 Identify exact social-action FAIL surfaces.
- [ ] A1.5 Identify exact vote RUNTIME_REQUIRED surfaces.
- [ ] A1.6 Identify exact report RUNTIME_REQUIRED surfaces.
- [ ] A1.7 Record placeholders, action IDs, handlers, emitters and mirrors.
- [ ] A1.8 Produce a no-copy evidence package for ChatGPT decisions.

Expected accepted weight after independent closure: D1 = 3 points.

### Wave 2 - Parallel ChatGPT decision packages

Boomer and Alpha decisions may proceed concurrently after their evidence slots pass.

#### Boomer decisions

- [ ] B2.1 Reconcile workbook with verified evidence.
- [ ] B2.2 Confirm prepared decisions.
- [ ] B2.3 Resolve every genuine product ambiguity with the user.
- [ ] B2.4 Freeze `TEXT_ID -> exact Boomer target`.
- [ ] B2.5 Verify placeholders, tokens, numbers and emoji contracts.

Expected accepted weight: C2 = 4 points.

#### Alpha decisions

- [ ] A2.1 Create exact replacements for FAIL surfaces.
- [ ] A2.2 Define exact runtime evidence for vote/report.
- [ ] A2.3 Freeze `TEXT_ID/action surface -> exact Alpha target`.
- [ ] A2.4 Verify ultra-direct wording without infantilism or semantic loss.
- [ ] A2.5 Verify placeholders, tokens, numbers and action IDs.

Expected accepted weight: D2 = 3 points.

### Wave 3 - Parallel validation and collision map

- [ ] V3.1 Slot 2 validates frozen Boomer table against current main.
- [ ] V3.2 Slot 3 validates frozen Alpha table against current main.
- [ ] V3.3 Slot 1 builds the exact write-file intersection matrix.
- [ ] V3.4 Split non-overlapping implementation units into parallel tasks.
- [ ] V3.5 Route overlapping/shared files to serialized singleton tasks.
- [ ] V3.6 Freeze branch/worktree and mirror ownership.

Expected accepted weights: C3 = 2 points, D3 = 2 points.

### Wave 4 - Implementation

Non-overlapping Boomer and Alpha writes may execute in parallel only after the intersection matrix proves independence.

- [ ] I4.1 Apply approved Boomer copy in Boomer-owned files and mirrors.
- [ ] I4.2 Apply approved Alpha presentation in Alpha-owned files and mirrors.
- [ ] I4.3 Run scoped static checks for both lanes.
- [ ] I4.4 Serialize shared resolver corrections.
- [ ] I4.5 Serialize `dev-checks.js`, registries, exports, globals and boot/cache-bust changes.
- [ ] I4.6 Verify source/deployed parity and served artifact identity.

Expected accepted weights after independent closure: C4 = 5 points, D4 = 5 points.

### Wave 5 - Profile acceptance

#### Boomer

- [ ] B5.1 Repeat 4.4A audit.
- [ ] B5.2 Require failRowCount 0 and structuralFailureCount 0.
- [ ] B5.3 Reach `STATIC_PASS / READY_FOR_RUNTIME_SMOKE`.
- [ ] B5.4 Run Boomer 4.4B on the exact deployed artifact.
- [ ] B5.5 User iPhone Safari PASS.

Expected weights: C5 = 3 points, C6 = 5 points.

#### Alpha

- [ ] A5.1 Run Alpha static aggregate.
- [ ] A5.2 Run vote/report runtime evidence.
- [ ] A5.3 Run Alpha aggregate on the exact deployed artifact.
- [ ] A5.4 User iPhone Safari PASS.

Expected weight: D5 = 5 points.

Safari preparation may overlap, but shared publication and shared smoke wiring remain serialized.

### Wave 6 - Final integration

- [ ] F1.1 Final PDF traceability audit.
- [ ] F1.2 Close every contradiction and missing artifact identity.
- [ ] F2.1 Deploy one exact cross-profile artifact.
- [ ] F2.2 Millennial regression.
- [ ] F2.3 Zoomer regression without rewriting accepted Zoomer docs.
- [ ] F2.4 Boomer aggregate.
- [ ] F2.5 Alpha aggregate.
- [ ] F2.6 Profile Selection persistence/replacement regression.
- [ ] F2.7 User iPhone Safari cross-profile PASS.
- [ ] F3.1 One documentation owner updates `TASKS.md` and `PROJECT_MEMORY.md`.
- [ ] F3.2 Update live memory and Control Board.
- [ ] F3.3 Close bridge slots, claims, locks and temporary branches.
- [ ] F3.4 Confirm PR/branch state and mark Stage 6 COMPLETE.

Expected weights: F1 = 3 points, F2 = 5 points, F3 = 2 points.

## 7. User operating procedure

When three tasks are assigned:

1. create three separate Codex threads in the AsyncScene project;
2. in thread 1 write only `мост 1`;
3. in thread 2 write only `мост 2`;
4. in thread 3 write only `мост 3`;
5. choose the independently recommended model/reasoning in each thread;
6. send `CONTINUE` in each same thread;
7. when Codex 1 finishes, return to ChatGPT and write `мост 1`;
8. when Codex 2 finishes, return to ChatGPT and write `мост 2`;
9. when Codex 3 finishes, return to ChatGPT and write `мост 3`.

Do not paste reports unless mailbox publication failed and ChatGPT explicitly requests the final response.

## 8. Stop conditions

Stop a slot immediately when:

- claim or mailbox ancestry cannot be verified;
- the assigned baseline changed without an authorized baseline update;
- a read-only lane discovers required writes;
- an undeclared file overlap appears;
- a runtime-sensitive file lacks frozen approval;
- source/mirror ownership conflicts;
- plugin-load evidence is missing;
- primary or mailbox write scope is exceeded.

## 9. Current launch set

- Bridge Slot 1 / `мост 1`: `S6-T1-TRACEABILITY`, read-only.
- Bridge Slot 2 / `мост 2`: `S6-B1-BOOMER-EVIDENCE`, read-only.
- Bridge Slot 3 / `мост 3`: `S6-A1-ALPHA-EVIDENCE`, read-only.

All three use one exact primary baseline, have primary write scope `NONE`, and may execute concurrently. Their mailbox claims and outboxes are separate immutable files, while mailbox commits remain serialized.
