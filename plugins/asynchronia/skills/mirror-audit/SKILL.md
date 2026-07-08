---
name: mirror-audit
description: Audit source and deployed representations of Asynchronia for mirror completeness, parity, ownership, wiring, and release consistency without modifying files or approving runtime work.
---

# Mirror Audit

Use this skill to audit source and deployed representations of Asynchronia for mirror completeness, parity, ownership, wiring, and release consistency.

The skill is read-only.

It must:

- identify mirror ownership groups
- distinguish source files from deployed files
- detect missing, stale, one-sided, or incorrectly wired mirrors
- audit byte parity when byte identity is required
- audit semantic parity when accepted transformations exist
- audit runtime wiring separately from file-content parity
- detect deployment metadata drift
- preserve serialized ownership of each mirror group

It must not:

- modify mirrors
- copy files
- run deployment
- approve runtime writes
- invent mirror relationships
- declare canon
- prove economy conservation
- claim Safari acceptance
- broaden task scope

## 1. Mandatory repository context

Before auditing:

1. Read `AGENTS.md`, `TASKS.md`, and `PROJECT_MEMORY.md`.
2. Inspect the exact authorized scope and every cited source path, deployed path, route, entrypoint, asset, module, or smoke result.
3. Check current Git status and relevant scoped diffs.
4. Preserve unrelated dirty or concurrent changes.
5. Record all inspected paths, mirror groups, and evidence sources.

## 2. Audit modes

Support exactly:

- `PROPOSAL_AUDIT`
- `DIFF_AUDIT`
- `DEPLOYMENT_AUDIT`
- `SMOKE_RESULT_AUDIT`

If the mode cannot be determined, return `BLOCKED`.

## 3. Verdicts

Use exactly:

- `PASS`
- `FAIL`
- `BLOCKED`
- `NOT_APPLICABLE`

`PASS` requires positive evidence for every applicable mirror dimension.

Absence of an observed mismatch is not sufficient evidence.

## 4. Mirror ownership

Treat each source or deployed mirror group as one serialized ownership lane.

For this repository, files under:

- `AsyncScene/Web/**`
- `docs/**`

must not be treated as independent parallel tasks when they represent the same deployed behavior.

The audit must:

- identify the source path
- identify every required deployed counterpart
- identify the ownership group
- identify the canonical editing side
- identify the synchronization mechanism
- identify accepted transformations
- identify required validation after synchronization

When ownership cannot be resolved:

- return `BLOCKED`
- do not guess which side is canonical

## 5. Parity dimensions

Audit all applicable dimensions.

### 1. Mirror membership

Verify:

- every required counterpart exists
- no required deployed copy is omitted
- no unexpected duplicate claims ownership
- generated files are linked to their generator or source

### 2. Content parity

Use byte parity only when exact identity is required.

Report:

- hashes or exact-diff evidence
- matching or differing lines
- unexplained one-sided edits

Do not declare semantic failure solely because bytes differ when an accepted transformation exists.

### 3. Semantic parity

When transformations are accepted, verify that source and deployed forms preserve:

- behavior
- constants
- rules
- exports
- identifiers
- routes
- event names
- resource values
- feature flags
- security constraints

Any unexplained behavioral difference is `FAIL`.

### 4. Wiring parity

Audit separately from content parity:

- script inclusion
- module imports
- export or import names
- boot registration
- route registration
- entrypoint references
- asset paths
- load order
- global exposure
- dev or smoke registration

Matching file contents do not prove wiring parity.

### 5. Dependency parity

Verify that required:

- scripts
- styles
- assets
- data files
- manifests
- modules
- workers
- generated outputs

exist and are referenced from the deployed surface.

### 6. Release metadata parity

When applicable, verify consistency of:

- buildTag
- smokeVersion
- plugin or app version
- deployment marker
- asset version or cache-busting token
- release manifest

A stale release marker is not automatically content parity.

### 7. Scope parity

Verify that the proposed or completed synchronization changed exactly the authorized mirror group and did not absorb unrelated dirty files.

### 8. Freshness

Detect:

- source newer than deployed counterpart
- deployed file changed without matching source change
- stale generated output
- deployment performed before final source change
- partial synchronization

Do not rely only on filesystem timestamps when diff, hash, manifest, or repository evidence is available.

### 9. Runtime reachability

Verify that the deployed counterpart is actually reachable through the expected route, entrypoint, or boot chain.

A present but unreachable file is `FAIL`.

### 10. Smoke linkage

Identify which validation proves:

- source behavior
- deployed behavior
- wiring
- user-visible runtime result

Mirror Audit may inspect smoke evidence but cannot replace user Safari smoke.

## 6. Accepted transformations

An accepted transformation must have:

- an authoritative definition
- a known source
- a known output
- deterministic behavior
- validation evidence

Examples may include:

- generated bundles
- path rewriting
- minification
- environment-specific configuration
- documented wrapper differences

If transformation rules are missing or ambiguous:

- return `BLOCKED`
- report `CANON_AUDIT_REQUIRED` when intended behavior is unclear

## 7. Fail conditions

Return `FAIL` when evidence shows:

- required counterpart missing
- unexplained one-sided change
- stale deployed mirror
- byte mismatch where exact identity is required
- semantic drift
- wiring mismatch
- missing dependency
- unreachable deployed file
- wrong load order
- wrong route or entrypoint
- export or import mismatch
- stale generated output
- partial mirror synchronization
- release metadata mismatch that invalidates deployment evidence
- source and deployed files modified as unrelated parallel lanes

Return `BLOCKED` when:

- mirror ownership is unresolved
- canonical editing side is unknown
- required counterpart mapping is unavailable
- accepted transformation is undefined
- authorized scope is missing
- required diff, hash, manifest, or wiring evidence is unavailable
- concurrent ownership overlaps cannot be serialized
- intended semantic behavior requires Canon Audit first

## 8. Canon interaction

Mirror Audit verifies parity, not intended behavior.

When source and deployed copies differ semantically and the intended rule is unclear:

- report `CANON_AUDIT_REQUIRED`
- return `BLOCKED`
- do not choose the canonical behavior

If Canon Audit already establishes the intended rule:

- use it as semantic-parity evidence
- do not repeat or replace Canon Audit

## 9. Economy interaction

Mirror Audit does not prove conservation or trace completeness.

When economy behavior differs across mirrors:

- report `ECONOMY_AUDIT_REQUIRED`
- list the differing economy paths and rules
- require Canon Audit first if the intended rule is ambiguous

## 10. Runtime precedence

Mirror Audit cannot approve runtime writes.

When synchronization would modify runtime-sensitive source or deployed files:

- report `RUNTIME_GATE_REQUIRED`
- require scope-isolation-check approval before writes
- keep user Safari smoke as `PENDING_USER`

## 11. Parallel planner interaction

The source file and every deployed counterpart in one mirror group must be assigned to one serialized implementation lane.

Do not approve a plan that:

- assigns source and deployed copies to different concurrent workers
- lets shared deployment files have multiple owners
- edits shared smoke registries concurrently
- edits shared documentation concurrently without a final owner

## 12. Output contract

Return:

- `status: MIRROR_AUDIT`
- audit mode
- verdict
- task objective
- authorized scope
- mirror ownership groups
- canonical editing sides
- source paths
- deployed counterpart paths
- synchronization mechanisms
- accepted transformations
- mirror membership result
- byte parity result
- semantic parity result
- wiring parity result
- dependency parity result
- release metadata result
- scope parity result
- freshness result
- runtime reachability result
- smoke linkage result
- missing counterparts
- stale counterparts
- unexplained differences
- canon audit requirement
- economy audit requirement
- runtime gate requirement
- serialization requirement
- validation still required
- user smoke status
- preserved pre-existing changes
- failures
- missing evidence
- assumptions
- confidence: `low`, `medium`, or `high`
- exact next user action

## 13. Truthfulness

Never claim:

- byte parity without comparison evidence
- semantic parity from matching filenames alone
- wiring parity from matching contents alone
- deployment freshness from timestamps alone
- Canon Audit passed
- Economy Invariant Audit passed
- scope isolation exists
- active model is verified
- Safari smoke passed without user evidence
- unrelated dirty files belong to the task

Use:

- `USER_SELECTED_UNVERIFIED`
- `CANON_AUDIT_REQUIRED`
- `ECONOMY_AUDIT_REQUIRED`
- `RUNTIME_GATE_REQUIRED`
- `SERIAL_REQUIRED`
- `PENDING_USER`
- `NOT_REQUIRED`
