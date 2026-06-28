---
name: smoke-orchestrator
description: Plan the smallest sufficient smoke workflow, define evidence ownership and pass conditions, and evaluate supplied smoke evidence without confusing an expected nested failure with failure of the enclosing integration smoke.
---

# Smoke Orchestrator

Use this skill to plan and evaluate smoke workflows.

This skill is read-only. It does not:

- implement fixes
- execute implementation work
- manufacture evidence
- reinterpret missing evidence as present evidence
- claim user runtime acceptance
- bypass the Runtime Safety Gate

## 1. Core purpose

The orchestrator answers one question: given a smoke objective and the evidence on hand, what is the smallest sufficient workflow and what is the correct enclosing verdict?

It must:

- classify the smoke objective
- identify the exact subject under test
- identify prerequisites and authoritative pass conditions
- identify the required environment and entrypoint
- identify evidence ownership
- identify evidence freshness requirements
- distinguish static, local runtime, deployed runtime, and user acceptance evidence
- route required specialized audits without replacing them
- preserve Runtime Safety Gate precedence
- distinguish nested component verdicts from the enclosing smoke verdict
- detect missing, stale, mismatched, or unverifiable evidence
- report the exact next action without implementing a fix

## 2. Supported smoke classes

Support at least these smoke classes:

- `CONTRACT_SMOKE`
- `STATIC_SMOKE`
- `INTEGRATION_SMOKE`
- `LOCAL_RUNTIME_SMOKE`
- `DEPLOYED_RUNTIME_SMOKE`
- `USER_ACCEPTANCE_SMOKE`
- `RELEASE_ACCEPTANCE_SMOKE`

### Smoke class meanings

- `CONTRACT_SMOKE`: validate a contract, skill interface, manifest, or expected output schema against explicit requirements.
- `STATIC_SMOKE`: validate files, diffs, manifests, declarations, or other non-runtime evidence.
- `INTEGRATION_SMOKE`: validate that routed components, wiring, and reporting produce the expected enclosing result.
- `LOCAL_RUNTIME_SMOKE`: validate local command output, local browser output, or simulated runtime evidence on the Codex machine.
- `DEPLOYED_RUNTIME_SMOKE`: validate the actual deployed entrypoint and its deployed assets or route.
- `USER_ACCEPTANCE_SMOKE`: validate user-owned Safari evidence supplied by the user.
- `RELEASE_ACCEPTANCE_SMOKE`: validate release readiness across the required static, mirror, runtime, and user-acceptance layers.

## 3. Required workflow

Use this workflow in order:

1. Classify the smoke.
2. Confirm the atomic subject and authorized scope.
3. Apply Runtime Safety Gate classification.
4. Identify prerequisites.
5. Define the expected result.
6. Define evidence sources and owners.
7. Check artifact identity and freshness.
8. Invoke or require specialized audits in dependency order.
9. Compare actual evidence with pass conditions.
10. Calculate the enclosing smoke verdict.
11. Report missing evidence and the exact next action.

Do not skip steps just because a nested component already failed or passed.

## 4. Runtime Safety Gate precedence

Runtime Safety Gate has priority over every smoke decision.

If the subject under test requires any runtime-sensitive file, runtime approval must be resolved before writes. Runtime-sensitive includes:

- game or UI runtime JavaScript
- economy
- battle systems
- NPC systems
- persistence
- state and save systems
- routing
- shared smoke registries
- every `dev-checks.js` copy
- `Game.__DEV`
- `Game.Dev`
- boot logic
- exports
- globals
- smoke visibility

If runtime approval is absent, the smoke is not free to proceed as if the approval existed.

## 5. Evidence ownership

Evidence boundaries are strict.

- Codex may provide static analysis, local command output, and deterministic contract evidence.
- Local browser or simulated runtime evidence is not automatically deployed evidence.
- Deployed runtime evidence must come from the actual deployed entrypoint.
- User Safari evidence belongs to the user.
- Codex must never manufacture, reinterpret, or promote missing user evidence.
- Documentation-only and plugin-contract work may correctly use Safari status `N/A`.
- Required user runtime evidence remains `PENDING_USER` until supplied by the user.

## 6. Evidence identity and freshness

When applicable, require and compare:

- task or smoke identifier
- environment
- entrypoint or URL class
- source revision or commit
- `buildTag`
- `smokeVersion`
- artifact or script identity
- timestamp or freshness evidence
- expected output contract
- actual output contract

Do not require a field when it is genuinely inapplicable.

Use `N/A` only when the reason is explicit and exact.

Freshness must be checked for:

- buildTag or smokeVersion mismatch with the requested artifact
- deployed entrypoint loading an older asset identity
- repeated output after a claimed change without new artifact evidence
- current source state with unproven deployed wiring or asset freshness
- current direct asset with an older real application entrypoint

If freshness is uncertain, report it. Do not jump directly to a code-fix conclusion.

## 7. Specialized audit routing

The orchestrator may require these specialized audits:

- `canon-audit`
- `economy-invariant-audit`
- `mirror-audit`

Rules:

- routing to an audit does not mean the audit passed
- Canon Audit precedes dependent economy or semantic validation
- Economy Invariant Audit validates conservation and traceability
- Mirror Audit validates source, deployed, wiring, and reachability evidence
- the orchestrator aggregates evidence but does not replace audit contracts
- user Safari smoke remains last when actual runtime acceptance requires it

## 8. Nested verdict rule

The orchestrator must distinguish:

- the verdict produced by the component under test
- the verdict of the enclosing smoke workflow

An expected nested failure can be correct evidence for the smoke.

Examples:

- a Mirror Audit returning `FAIL` for deliberately missing deployed wiring can be the expected component result
- the integration smoke can still be `PASS` when routing and reporting correctly produce that expected `FAIL`

Never copy an inner `FAIL`, `BLOCKED`, or other negative fixture result into the outer smoke verdict without evaluating the enclosing pass conditions.

## 9. Verdict set

Use a clear finite set of orchestrator verdicts:

- `PASS`
- `FAIL`
- `BLOCKED`
- `PENDING_USER`
- `INSUFFICIENT_EVIDENCE`

### Verdict meanings

- `PASS`: all authoritative enclosing pass conditions are satisfied.
- `FAIL`: required evidence is present, but the evidence contradicts the authoritative pass conditions, or the pass conditions explicitly define the missing condition as failure.
- `BLOCKED`: the smoke cannot be defined or evaluated safely because the subject is ambiguous, pass conditions conflict, required runtime approval is absent, ownership is unresolved, an authoritative canon conflict prevents defining the expected result, the request asks for fabricated evidence, or the request asks Codex to claim user acceptance.
- `PENDING_USER`: required user-owned evidence remains outstanding.
- `INSUFFICIENT_EVIDENCE`: the evidence set is incomplete or unverifiable, but the situation is not yet a user-owned acceptance gap and not yet a defined failure.

`PENDING_USER` must be used only when required user-owned evidence remains outstanding.

`INSUFFICIENT_EVIDENCE` must not be silently converted into `FAIL` unless a required pass condition explicitly treats missing evidence as failure.

## 10. Block conditions

Return `BLOCKED` when any of these apply:

- the smoke subject is ambiguous
- pass conditions are contradictory
- implementation and smoke objectives are mixed
- required runtime approval is absent
- source or deployed ownership is unresolved
- an authoritative canon conflict prevents defining the expected result
- the request asks the skill to manufacture evidence
- the request asks Codex to claim user acceptance

## 11. Evaluation rules

The orchestrator must separate evidence types:

- static evidence proves files, manifests, contracts, and local inspections
- local runtime evidence proves a local execution or local browser result only
- deployed runtime evidence proves the deployed entrypoint and deployed wiring
- user acceptance evidence proves user-owned Safari runtime acceptance only

Do not promote evidence across those boundaries.

If a deployed runtime smoke is needed, the actual deployed entrypoint must be identified. If a user acceptance smoke is needed, the user-owned Safari result must be identified separately from any deployed or local evidence.

## 12. Output contract

Return all of these fields:

- `status: SMOKE_ORCHESTRATION`
- smoke class
- subject under test
- task objective
- authorized scope
- runtime gate requirement
- prerequisites
- authoritative pass conditions
- expected component result
- evidence sources
- evidence owners
- environment
- entrypoint
- identity and freshness requirements
- specialized audits required
- audit order
- component verdicts
- enclosing smoke verdict
- user Safari status
- missing evidence
- stale or mismatched evidence
- failures
- blocked conditions
- preserved pre-existing changes
- assumptions
- confidence
- exact next user action

## 13. Field guidance

- `status` must be `SMOKE_ORCHESTRATION`.
- `user Safari status` must be `PENDING_USER` when user-owned Safari evidence is still required.
- `user Safari status` may be `N/A` when Safari evidence is not applicable, such as documentation-only or plugin-contract work.
- `missing evidence` must name what is absent and who owns it.
- `stale or mismatched evidence` must identify the mismatch and why it matters.
- `component verdicts` must record the inner verdict separately from the enclosing verdict.
- `enclosing smoke verdict` must be computed from the full smoke contract, not copied from one nested audit result.
- `exact next user action` must be the next concrete step, not a code fix unless the smoke contract itself asks for one.

## 14. Contract smoke examples

### Example A: expected nested failure

If the smoke class is `INTEGRATION_SMOKE`, the component under test is `Mirror Audit`, the expected component verdict is `FAIL`, and the supplied evidence correctly reports missing deployed wiring, then the orchestrator can still return `PASS` when routing, evidence ownership, identity, and output contract are all correct and no Safari evidence is required.

### Example B: missing user evidence

If the smoke class is `USER_ACCEPTANCE_SMOKE`, the runtime surface changed, static validation passed, no user Safari result was supplied, and no fresh deployed entrypoint evidence was supplied, then the enclosing smoke verdict is `PENDING_USER`.

In that case:

- do not return `PASS`
- do not invent Safari evidence
- report the exact required user evidence
- distinguish missing deployed evidence from missing user acceptance evidence
