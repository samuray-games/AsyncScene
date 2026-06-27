---
name: economy-invariant-audit
description: Audit a proposed, implemented, or tested Asynchronia economy change against canonical economy invariants without editing implementation or approving runtime work.
---

# Economy Invariant Audit

Use this skill to audit a proposed, implemented, or tested economy change against Asynchronia economy invariants.

The skill is read-only.

It may:

- inspect repository context
- inspect an authorized diff
- inspect economy traces and smoke output
- identify violations
- produce required validation
- block unsafe or unexplained economy work

It must not:

- edit implementation files
- approve runtime work
- execute implementation
- invent canonical economy rules
- declare Safari runtime acceptance
- silently repair missing accounting
- broaden task scope

## 1. Mandatory repository context

Before auditing:

1. Read `AGENTS.md`, `TASKS.md`, and `PROJECT_MEMORY.md`.
2. Inspect the exact authorized scope and any cited economy files, tests, traces, or smoke results.
3. Check current Git status and relevant scoped diffs.
4. Preserve unrelated dirty or concurrent changes.
5. Record all inspected paths and evidence sources.

## 2. Audit modes

Support exactly these modes:

- `PROPOSAL_AUDIT`
- `DIFF_AUDIT`
- `TRACE_AUDIT`
- `SMOKE_RESULT_AUDIT`

If the mode cannot be determined, return `BLOCKED`.

## 3. Authoritative sources

Resolve economy rules from the narrowest authoritative repository sources available, in this order:

1. `AGENTS.md`
2. explicit accepted rules in `PROJECT_MEMORY.md`
3. active `TASKS.md` contract for the exact mechanic
4. exact implementation and tests for already accepted behavior
5. user-provided task contract

Do not treat these as authoritative when they conflict with accepted sources:

- comments
- stale plans
- examples
- unaccepted proposals
- Codex self-generated explanations

If authoritative economy rules conflict or remain ambiguous:

- return `BLOCKED`
- identify the conflicting rules
- require Canon Audit or explicit user resolution

## 4. Core invariants

Audit all applicable invariants.

### 1. Conservation

For a closed transfer operation:

`total_before = total_after`

Account for every:

- debit
- credit
- refund
- fee
- stake
- reward
- remainder
- rollback
- cancellation
- rematch payment
- crowd contribution

Do not permit silent creation or destruction of value.

An explicit source or sink is valid only when:

- canon defines it
- it has a stable identifier
- its amount is recorded
- its reason is recorded
- it appears in the audit balance

### 2. Traceability

Every economy mutation must identify, when applicable:

- transaction or trace id
- source
- receiver
- amount
- currency or resource type
- reason
- mechanic
- battle, event, or action linkage
- tick or timestamp
- before value
- after value
- refund or reversal linkage

Missing required fields must not be treated as `PASS`.

### 3. Atomic settlement

Audit that one logical outcome settles exactly once.

Detect:

- duplicate rewards
- duplicate debits
- retry duplication
- repeated callback settlement
- rematch double charge
- refund after already completed settlement
- partial settlement followed by a second full settlement

### 4. Remainders and rounding

Every remainder must be:

- deterministically assigned
- explicitly retained in a named pool
- refunded
- or handled by an accepted canonical rule

No fractional or integer remainder may disappear silently.

### 5. Bounds and balances

Audit:

- negative balances
- spending beyond available balance
- cap bypass
- refund beyond original payment
- reward beyond authorized pool
- transfer to missing entity
- transfer from missing entity
- self-transfer when canon forbids it
- overflow, `NaN`, `Infinity`, or invalid numeric state

### 6. Cross-resource separation

Do not treat different resources as interchangeable.

Audit separate accounting for resources such as:

- money or points
- `REP`
- Influence
- crowd pools
- stakes
- fees

A valid change in one resource must not conceal an unexplained change in another.

### 7. Causal linkage

Each economy outcome must be explainable from:

- initiating action
- rule applied
- participants
- amount calculation
- settlement result
- resulting balances

The audit must be able to reconstruct:

`cause -> rule -> transfer -> resulting state`

### 8. Failure and rollback

Audit that failed, cancelled, timed-out, or rolled-back operations do not leave:

- partial debits
- orphan credits
- duplicate refunds
- stale reservations
- unresolved stakes
- settlement without a terminal outcome

### 9. Player and NPC parity

When player and NPC systems use the same mechanic, audit equivalent economy rules unless canon explicitly defines a difference.

Do not accept decorative NPC economy that bypasses real transfers or trace records.

### 10. Long-run stability

When long-run or N-tick evidence is available, audit:

- total value drift
- accumulation in orphan pools
- unresolved battles
- repeated settlement
- unbounded rewards
- lost remainders
- trace gaps

## 5. Runtime precedence

This skill does not approve runtime work.

When the audited task changes runtime-sensitive economy files:

- report `RUNTIME_GATE_REQUIRED`
- require runtime-safety-gate approval before writes
- keep Safari smoke as `PENDING_USER`
- do not claim implementation acceptance

## 6. Canon precedence

If the audit cannot determine what the economy should do:

- do not infer desired behavior from current code alone
- return `BLOCKED`
- route the conflict to Canon Audit

## 7. Mirror interaction

Economy Invariant Audit may identify required mirrored files.

It must not declare mirror parity `PASS`.

When deployed mirrors are involved:

- report `MIRROR_AUDIT_REQUIRED`
- list probable mirror ownership groups
- defer byte, semantic, wiring, and deployment parity to Mirror Audit

## 8. Verdicts

Use exactly one:

- `PASS`
- `FAIL`
- `BLOCKED`
- `NOT_APPLICABLE`

`PASS` requires positive evidence.

Absence of an observed error is not sufficient evidence.

## 9. Output contract

Return:

- `status: ECONOMY_AUDIT`
- audit mode
- verdict
- task objective
- authorized scope
- authoritative rules used
- resources audited
- conservation equation
- transaction and trace coverage
- atomic settlement result
- remainder and rounding result
- bounds and balance result
- cross-resource result
- causal linkage result
- rollback result
- player and NPC parity result
- long-run stability result
- identified sources and sinks
- unexplained deltas
- runtime gate requirement
- canon audit requirement
- mirror audit requirement
- validation still required
- user smoke status
- preserved pre-existing changes
- failures
- missing evidence
- assumptions
- confidence: `low`, `medium`, or `high`
- exact next user action

## 10. Fail conditions

Return `FAIL` when evidence shows:

- unexplained emission or destruction
- conservation mismatch
- missing debit or credit
- duplicate settlement
- invalid refund
- lost remainder
- unauthorized source or sink
- missing required traceability
- negative or invalid balance
- inconsistent resource accounting
- economy change without causal linkage
- player and NPC parity violation without canonical justification

Return `BLOCKED` when:

- authorized scope is missing
- economy rules conflict
- required trace data is unavailable
- the task combines unrelated mechanics
- ownership is unresolved
- runtime files are proposed without an identified scope
- the requested audit requires a Canon Audit first
- evidence is insufficient for `PASS` or `FAIL`

## 11. Truthfulness

Never claim:

- runtime approval exists when it does not
- the active Codex model is verified
- mirror parity was audited by this skill
- Safari smoke passed without user evidence
- conservation passed without before, after, and accounted delta evidence
- unrelated dirty files belong to the audited task

Use:

- `USER_SELECTED_UNVERIFIED`
- `PENDING_USER`
- `NOT_REQUIRED`
- `RUNTIME_GATE_REQUIRED`
- `CANON_AUDIT_REQUIRED`
- `MIRROR_AUDIT_REQUIRED`
