---
name: canon-audit
description: Audit a proposal, diff, implementation result, or smoke result against accepted Asynchronia canon without editing implementation or approving runtime work.
---

# Canon Audit

Use this skill to audit a proposal, diff, implementation result, or smoke result against accepted Asynchronia canon.

The skill is read-only.

It must:

- identify authoritative accepted rules
- distinguish accepted canon from proposals, examples, comments, and stale plans
- detect contradictions, silent mechanic drift, renamed concepts, missing exceptions, and unauthorized behavior
- explain every conflict precisely
- block work when canon cannot be resolved safely

It must not:

- edit implementation
- invent canon
- choose between conflicting authoritative rules
- approve runtime work
- declare economy conservation
- declare mirror parity
- claim Safari acceptance
- broaden task scope

## 1. Mandatory repository context

Before auditing:

1. Read `AGENTS.md`, `TASKS.md`, and `PROJECT_MEMORY.md`.
2. Inspect the exact authorized scope and every cited canon-related file, diff, implementation surface, or smoke result.
3. Check current Git status and relevant scoped diffs.
4. Preserve unrelated dirty or concurrent changes.
5. Record all inspected paths, source paths, and evidence sources.

## 2. Audit modes

Support exactly:

- `PROPOSAL_AUDIT`
- `DIFF_AUDIT`
- `IMPLEMENTATION_AUDIT`
- `SMOKE_RESULT_AUDIT`

If the mode cannot be determined, return `BLOCKED`.

## 3. Verdicts

Use exactly:

- `PASS`
- `FAIL`
- `BLOCKED`
- `NOT_APPLICABLE`

`PASS` requires positive evidence that all applicable canonical rules were checked.

## 4. Authoritative source order

Resolve canon using the narrowest applicable accepted source, in this order:

1. explicit current user instruction for the exact task
2. `AGENTS.md` repository policy
3. accepted current rules in `PROJECT_MEMORY.md`
4. active accepted contract in `TASKS.md`
5. dedicated accepted specification documents
6. accepted tests and implementation behavior
7. examples and comments only as supporting evidence

Do not treat these as authoritative when they conflict with accepted sources:

- stale roadmap entries
- unchecked proposals
- historical notes
- examples
- comments
- temporary smoke fixtures
- Codex self-generated summaries
- current code that is already known to violate canon

If two authoritative sources conflict:

- return `BLOCKED`
- quote or precisely identify both rules
- report their source paths
- request explicit user resolution
- do not silently select one

## 5. Canon domains

Audit all applicable domains:

- terminology and exact labels
- mechanic rules
- player actions
- NPC actions
- player/NPC parity
- arguments and phrase construction
- economy outcomes
- battle lifecycle
- crowd eligibility and voting
- caps and anti-loop protections
- rematch rules
- visibility and information limits
- onboarding simplifications
- persistence behavior
- security and access restrictions
- user acceptance ownership

## 6. Canon checks

### 1. Rule identity

- identify every applicable accepted rule
- include source and scope

### 2. Behavioral parity

- intended behavior matches accepted behavior
- player and NPC differences require explicit canonical justification

### 3. Terminology

- canonical names are preserved
- aliases, translations, UI labels, and internal identifiers do not silently change meaning

### 4. Preconditions and eligibility

- required conditions remain intact
- forbidden targets and actions remain forbidden

### 5. Outcomes and consequences

- rewards, penalties, state changes, visibility, and continuation hooks match canon

### 6. Caps and boundaries

- cooldowns, limits, repeat-opponent caps, war-chain caps, and bounded recovery remain intact

### 7. Lifecycle

- initiation, active state, settlement, terminal state, rematch, timeout, and recovery remain coherent

### 8. Exceptions

- every exception must be explicitly canonical
- undocumented exceptions are `FAIL`

### 9. Regression surface

- identify existing accepted mechanics that could be altered indirectly

### 10. Scope discipline

- do not accept unrelated mechanic changes hidden inside the audited task

## 7. Economy interaction

Canon Audit may confirm what the canonical economy rule is.

It must not claim that balances conserve value or traces are complete.

When economy mutations are involved:

- report `ECONOMY_AUDIT_REQUIRED`
- list the canonical economy rules that Economy Invariant Audit must verify

If canon itself is ambiguous:

- verdict is `BLOCKED`
- do not route ambiguous behavior into Economy Invariant Audit as though the rule were known

## 8. Mirror interaction

Canon Audit may identify which source behavior is canonical.

It must not declare deployed parity.

When source or deployed copies are involved:

- report `MIRROR_AUDIT_REQUIRED`
- list probable mirror ownership groups

## 9. Runtime precedence

This skill cannot approve runtime work.

For runtime-sensitive scope:

- report `RUNTIME_GATE_REQUIRED`
- require scope-isolation-check approval before writes
- keep user Safari smoke as `PENDING_USER`

## 10. Fail conditions

Return `FAIL` when evidence shows:

- direct contradiction of an accepted rule
- silent mechanic drift
- unauthorized terminology change
- removed prerequisite or restriction
- changed outcome without accepted authorization
- player/NPC parity violation
- missing cap or boundary
- undocumented exception
- lifecycle contradiction
- unrelated mechanic bundled into scope
- smoke result presented as `PASS` despite canonical mismatch

Return `BLOCKED` when:

- authoritative sources conflict
- accepted rule cannot be identified
- authorized scope is missing
- the audit combines unrelated mechanics
- required evidence is unavailable
- ownership is unresolved
- the request asks the auditor to invent or choose canon

## 11. Output contract

Return:

- `status: CANON_AUDIT`
- audit mode
- verdict
- task objective
- authorized scope
- canon domains audited
- authoritative rules used
- source hierarchy applied
- compliant rules
- violated rules
- conflicting rules
- terminology result
- behavior result
- player and NPC parity result
- prerequisites and eligibility result
- outcomes and consequences result
- caps and boundaries result
- lifecycle result
- exceptions result
- regression surface
- economy audit requirement
- mirror audit requirement
- runtime gate requirement
- validation still required
- user smoke status
- preserved pre-existing changes
- failures
- missing evidence
- assumptions
- confidence: `low`, `medium`, or `high`
- exact next user action

## 12. Truthfulness

Never claim:

- canon is resolved when authoritative sources conflict
- current code automatically defines canon
- economy conservation passed
- mirror parity passed
- scope isolation exists
- active model is verified
- Safari smoke passed without user evidence
- unrelated dirty files belong to the task

Use:

- `USER_SELECTED_UNVERIFIED`
- `RUNTIME_GATE_REQUIRED`
- `ECONOMY_AUDIT_REQUIRED`
- `MIRROR_AUDIT_REQUIRED`
- `PENDING_USER`
- `NOT_REQUIRED`
