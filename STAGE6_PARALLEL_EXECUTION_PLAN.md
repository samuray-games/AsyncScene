# Asynchronia Stage 6 Parallel Execution Plan

PLAN_VERSION: S6-PARALLEL-2026-07-07-01
STAGE: Stage 6 - Интерактивный язык / Tone Profiles
COORDINATOR: ChatGPT
BRIDGE_PROTOCOL: 2.0
MAX_CONCURRENT_CODEX_LANES: 3
BASE_PROGRESS: accepted 40/100, working readiness 52/100

## 1. Objective

Finish Stage 6 safely while running independent evidence and preparation work concurrently. Parallelism reduces waiting but never weakens runtime safety, mirror ownership, dependency order, mailbox verification or user Safari acceptance.

## 2. Fixed progress scale

Weights do not change during execution.

- A - Accepted foundation: 20/20 accepted.
- B - Bridge and traceability: 0/10 accepted.
- C - Boomer lane: 0/22 accepted.
- D - Alpha lane: 0/18 accepted.
- E - UI Profile Selection: 20/20 accepted.
- F - Final integration and closure: 0/10 accepted.

Current accepted total: 40/100.
Current working readiness: 52/100.

## 3. Parallelism rules

1. Maximum three active Codex implementation/evidence lanes.
2. Every lane has one immutable claim, one atomic goal, one baseline, one exact read set, one exact write set and one outbox.
3. Bare command `мост` atomically claims the first eligible unclaimed lane.
4. Read-only lanes may run concurrently when they do not depend on mutable output from another lane.
5. Source and deployed mirrors are one ownership group.
6. Any overlap in write files serializes the affected lanes.
7. `dev-checks.js`, smoke registries, exports, globals, boot/cache-bust and aggregate smoke are singleton serialized lanes.
8. Runtime-sensitive writes require model preflight, frozen scope, same-thread `APPROVE`, exact deployment evidence and user Safari smoke.
9. Shared `TASKS.md` and `PROJECT_MEMORY.md` are updated by one documentation owner after each accepted wave.
10. Mailbox claim/outbox commits remain sequential direct children on the mailbox branch even while task work runs concurrently.

## 4. Lane classes

### P - Policy and bridge infrastructure

Serialized. Owns `AGENTS.md`, `BRIDGE.md`, `CODEX_BRIDGE_BOOTSTRAP.md`, mailbox protocol and claim behavior.

### T - Traceability and read-only evidence

May run concurrently with profile evidence lanes. No primary writes unless a later documentation task explicitly authorizes a generated report.

### B - Boomer

Read-only evidence and creative decision preparation may run concurrently with Alpha. Runtime implementation serializes by exact mirror/file ownership.

### A - Alpha

Read-only evidence and creative decision preparation may run concurrently with Boomer. Runtime implementation serializes by exact mirror/file ownership.

### R - Runtime singleton

Owns shared resolver, `dev-checks.js`, registries, exports, globals, boot/cache-bust or aggregate smoke. Exactly one active runtime singleton lane.

### D - Documentation and integration

One owner per wave. Updates shared status documents and integrates accepted lane results.

## 5. Wave roadmap and checklist

### Wave P0 - Parallel bridge bootstrap

- [x] P0.1 Change root alias to `мост`.
- [x] P0.2 Define Bridge Protocol 2.0.
- [x] P0.3 Add atomic first-free lane claims.
- [x] P0.4 Preserve fail-closed mailbox branch guard.
- [x] P0.5 Update user-level bootstrap specification to V2.
- [x] P0.6 Create repository-tracked parallel Stage 6 plan.
- [ ] P0.7 Install/migrate the local user-level Codex alias on the user's Mac.
- [ ] P0.8 Run a real three-chat claim smoke and independently verify three unique claims.

Acceptance effect: infrastructure only. No Stage 6 accepted percentage until B0 bridge acceptance criteria are fully met.

### Wave 1 - Three concurrent read-only lanes

These three lanes are opened together after P0 policy publication.

#### Lane T1 - B1 current-state traceability

- [ ] T1.1 Inventory every Stage 6 PDF/substep and repository artifact.
- [ ] T1.2 Record source path and deployed mirror path.
- [ ] T1.3 Record exact implementation/status commit.
- [ ] T1.4 Record helper/generator/validator identity.
- [ ] T1.5 Record static verdict.
- [ ] T1.6 Record Safari verdict and exact artifact identity.
- [ ] T1.7 Classify every item PASS, FAIL, PENDING, RUNTIME_REQUIRED or proven N/A.
- [ ] T1.8 Produce contradiction list for stale `TASKS.md`, `PROJECT_MEMORY.md`, plan or memory entries.

Expected accepted weight after independent closure: B1 = 7 points.

#### Lane B1 - C1 Boomer exact evidence

- [ ] B1.1 Reproduce current 4.4A audit from main.
- [ ] B1.2 Confirm audited 147, fail 32, pass 115, structural 0.
- [ ] B1.3 Resolve exact identity of 3 forbidden rows.
- [ ] B1.4 Resolve exact identity of 11 mapped-exact rows.
- [ ] B1.5 Resolve exact identity of 17 unmapped rows.
- [ ] B1.6 Resolve exact wrong-profile resolver row.
- [ ] B1.7 Record placeholders, protected tokens, source emitter and mirror for each row.
- [ ] B1.8 Cross-check the Boomer decision workbook evidence without inventing copy.

Expected accepted weight after independent closure: C1 = 3 points.

#### Lane A1 - D1 Alpha exact evidence

- [ ] A1.1 Confirm PASS surfaces: attack, rematch, P2P give, P2P request, cop flow.
- [ ] A1.2 Resolve exact FAIL surfaces for escape.
- [ ] A1.3 Resolve exact FAIL surfaces for teach.
- [ ] A1.4 Resolve exact FAIL surfaces for social actions.
- [ ] A1.5 Resolve exact runtime-required surfaces for vote.
- [ ] A1.6 Resolve exact runtime-required surfaces for report.
- [ ] A1.7 Record placeholders, action IDs, handlers, source emitters and mirrors.
- [ ] A1.8 Produce a no-copy evidence package for ChatGPT decision work.

Expected accepted weight after independent closure: D1 = 3 points.

### Wave 2 - Parallel decision packages, ChatGPT-owned

No Codex creative copy generation.

#### Boomer decisions

- [ ] B2.1 Reconcile workbook with lane B1 evidence.
- [ ] B2.2 Confirm prepared decisions.
- [ ] B2.3 Resolve every genuinely ambiguous product decision with the user.
- [ ] B2.4 Freeze `TEXT_ID -> exact Boomer target` table.
- [ ] B2.5 Verify placeholders, tokens, numbers and emoji contracts.

Expected accepted weight: C2 = 4 points.

#### Alpha decisions

- [ ] A2.1 Create exact replacements for FAIL surfaces.
- [ ] A2.2 Define exact runtime evidence requirements for vote/report.
- [ ] A2.3 Freeze `TEXT_ID/action surface -> exact Alpha target` table.
- [ ] A2.4 Verify ultra-direct wording without infantilism or semantic loss.
- [ ] A2.5 Verify placeholders, tokens, numbers and action IDs.

Expected accepted weight: D2 = 3 points.

Boomer and Alpha decision work may proceed concurrently.

### Wave 3 - Parallel static validation and collision map

- [ ] B3.1 Codex validates frozen Boomer table against current main.
- [ ] A3.1 Codex validates frozen Alpha table against current main.
- [ ] X3.1 Coordinator produces exact write-file intersection matrix.
- [ ] X3.2 Split non-overlapping implementation units into parallel lanes.
- [ ] X3.3 Route overlapping resolver/shared/runtime files to serialized singleton lanes.
- [ ] X3.4 Freeze branch/worktree and mirror ownership for every write lane.

Expected accepted weights: C3 = 2 points, D3 = 2 points.

### Wave 4 - Implementation lanes

#### Non-overlapping profile writes

- [ ] B4.1 Apply approved Boomer copy only in Boomer-owned files/mirrors.
- [ ] A4.1 Apply approved Alpha presentation only in Alpha-owned files/mirrors.
- [ ] B4.2 Run scoped syntax, generator and validator checks.
- [ ] A4.2 Run scoped syntax, semantic and handler checks.

These may run concurrently only when the intersection matrix proves no overlap.

#### Serialized runtime singleton work

- [ ] R4.1 Correct shared profile resolver paths.
- [ ] R4.2 Update shared smoke or dev-check wiring only if required.
- [ ] R4.3 Update exports/globals and boot/cache-bust only if required.
- [ ] R4.4 Verify source/deployed mirror and served entrypoint identity.

Expected accepted weights after independent static closure: C4 = 5 points, D4 = 5 points.

### Wave 5 - Profile acceptance

#### Boomer

- [ ] B5.1 Repeat 4.4A audit.
- [ ] B5.2 Require failRowCount 0 and structuralFailureCount 0.
- [ ] B5.3 Reach `STATIC_PASS / READY_FOR_RUNTIME_SMOKE`.
- [ ] B5.4 Run Boomer 4.4B aggregate on exact deployed artifact.
- [ ] B5.5 User iPhone Safari PASS.

Expected weights: C5 = 3 points, C6 = 5 points.

#### Alpha

- [ ] A5.1 Run Alpha static aggregate.
- [ ] A5.2 Run required vote/report runtime evidence.
- [ ] A5.3 Run Alpha aggregate on exact deployed artifact.
- [ ] A5.4 User iPhone Safari PASS.

Expected weight: D5 = 5 points.

Boomer and Alpha Safari preparations may overlap, but shared deployed artifact publication and shared smoke wiring serialize.

### Wave 6 - Final integration

- [ ] F1.1 Final PDF traceability audit.
- [ ] F1.2 Close every contradiction and missing artifact identity.
- [ ] F2.1 Deploy one exact cross-profile artifact.
- [ ] F2.2 Run Millennial regression.
- [ ] F2.3 Run Zoomer regression without rewriting accepted Zoomer docs.
- [ ] F2.4 Run Boomer aggregate.
- [ ] F2.5 Run Alpha aggregate.
- [ ] F2.6 Run Profile Selection persistence/replacement regression.
- [ ] F2.7 User iPhone Safari cross-profile PASS.
- [ ] F3.1 Update `TASKS.md` and `PROJECT_MEMORY.md` through one documentation owner.
- [ ] F3.2 Update live memory and Control Board.
- [ ] F3.3 Close all bridge lanes, claims, locks and temporary branches.
- [ ] F3.4 Confirm PR/branch state and mark Stage 6 COMPLETE.

Expected weights: F1 = 3 points, F2 = 5 points, F3 = 2 points.

## 6. User operating procedure

After local alias V2 is installed and the parallel lanes are open:

1. open three separate Codex chats in the AsyncScene project;
2. write only `мост` in each chat;
3. each chat must claim a different lane and return its own preflight;
4. select the model/reasoning recommended in each chat;
5. send `CONTINUE` in each same chat;
6. later write `мост` to ChatGPT once to verify all lane claims and outboxes together.

Do not manually assign lane IDs. Do not copy Codex reports between systems unless the mailbox failed and ChatGPT explicitly asks for the final response.

## 7. Stop conditions

Stop a lane immediately when:

- claim or mailbox ancestry cannot be verified;
- baseline changed and the inbox does not authorize rebasing;
- a read-only lane discovers required writes;
- an undeclared file overlap appears;
- a runtime-sensitive file lacks frozen approval;
- source/mirror ownership conflicts;
- plugin-load evidence is missing;
- primary or mailbox write scope is exceeded.

## 8. Current launch set

The first launch set after Protocol 2.0 publication is:

1. `S6-T1-TRACEABILITY` - read-only.
2. `S6-B1-BOOMER-EVIDENCE` - read-only.
3. `S6-A1-ALPHA-EVIDENCE` - read-only.

All three use the same exact primary baseline and no primary write scope. Their claims and outboxes are independent immutable mailbox files.
