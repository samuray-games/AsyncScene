---
name: acceptance-evidence-gate
description: Determine whether supplied evidence is sufficient, authoritative, fresh, and correctly owned to promote a task, smoke, milestone, or release to an accepted status.
---

# Acceptance Evidence Gate

Use this skill to decide whether a proposed acceptance status is justified by the exact required evidence for the requested acceptance scope.

This skill is read-only. It does not:

- manufacture evidence
- reinterpret missing evidence as supplied evidence
- claim user Safari acceptance
- repair code, deployment, or packaging defects
- bypass exact scope isolation

## 1. Core rule

No acceptance status may be promoted merely because:

- implementation code exists
- Codex reports success
- static checks pass
- documentation says `PASS`
- a commit exists
- deployment returns HTTP 200
- one component audit passes
- an earlier version passed
- a user smoke exists for a different artifact
- an expected nested component failure is copied into the enclosing verdict

The gate must evaluate the exact acceptance contract.

## 2. Acceptance scopes

Support at least these acceptance scopes:

- `CONTRACT_ACCEPTANCE`
- `STATIC_ACCEPTANCE`
- `IMPLEMENTATION_ACCEPTANCE`
- `DEPLOYMENT_ACCEPTANCE`
- `RUNTIME_ACCEPTANCE`
- `USER_ACCEPTANCE`
- `PACKAGE_ACCEPTANCE`
- `RELEASE_ACCEPTANCE`
- `FINAL_MILESTONE_ACCEPTANCE`

### Acceptance scope boundaries

- `CONTRACT_ACCEPTANCE`: verify that the contract or skill definition itself is complete, internally consistent, and matches required structure and output semantics.
- `STATIC_ACCEPTANCE`: verify file contents, diffs, manifests, schema, and other non-runtime evidence.
- `IMPLEMENTATION_ACCEPTANCE`: verify that the implemented artifact meets the acceptance contract, but do not infer deployment or user acceptance.
- `DEPLOYMENT_ACCEPTANCE`: verify publication, deployed artifact identity, entrypoint freshness, and rollout state, but not user Safari acceptance.
- `RUNTIME_ACCEPTANCE`: verify runtime behavior evidence for the exact current artifact and environment.
- `USER_ACCEPTANCE`: verify user-owned Safari evidence for the exact current artifact and acceptance attempt.
- `PACKAGE_ACCEPTANCE`: verify package identity, manifest identity, version identity, and hash identity for the exact package subject.
- `RELEASE_ACCEPTANCE`: verify the complete release chain, including required static, deployment, runtime, and user-owned evidence.
- `FINAL_MILESTONE_ACCEPTANCE`: verify that the milestone’s full acceptance contract has been satisfied and nothing required remains pending.

## 3. Evidence classes

Support and distinguish at least these evidence classes:

- direct user instruction
- Codex static validation
- deterministic local command output
- local or simulated runtime output
- specialized audit output
- smoke-orchestrator output
- deployment-verifier output
- deployed entrypoint evidence
- user Safari evidence
- package manifest and hash evidence
- repository documentation
- historical acceptance evidence
- self-reported model or execution metadata

### Evidence class rules

- repository documentation records evidence but does not create it
- historical evidence applies only to the same accepted subject and artifact identity
- self-reported model identity is not proof of the active model
- local runtime evidence is not automatically deployed runtime evidence
- deployment evidence is not automatically runtime-behavior evidence
- user Safari evidence belongs to the user
- Codex must never claim user-owned evidence

## 4. Evidence dimensions

For every required evidence item, evaluate:

- requirement
- supplied or missing
- evidence class
- evidence owner
- authority
- subject identity
- artifact identity
- environment
- entrypoint
- timestamp or freshness
- expected output contract
- actual output contract
- scope coverage
- contradictions
- acceptance relevance

Do not require dimensions that are genuinely inapplicable.

Use `N/A` only with an exact reason.

## 5. Gate verdicts

Use this finite set:

- `ACCEPT`
- `REJECT`
- `BLOCKED`
- `PENDING_USER`
- `INSUFFICIENT_EVIDENCE`
- `STALE_EVIDENCE`

### Verdict meanings

- `ACCEPT`: every mandatory criterion is satisfied by authoritative, matching, and fresh evidence.
- `REJECT`: current authoritative evidence proves one or more acceptance criteria failed.
- `BLOCKED`: the acceptance contract, subject, ownership, or authoritative expectation is unresolved or contradictory.
- `PENDING_USER`: all non-user prerequisites are satisfied, but required user-owned evidence has not been supplied.
- `INSUFFICIENT_EVIDENCE`: required non-user evidence is missing or unverifiable.
- `STALE_EVIDENCE`: evidence exists but belongs to another artifact, environment, entrypoint, revision, or acceptance attempt.

Only `ACCEPT` authorizes status promotion.

## 6. Status promotion rules

The skill must explicitly enforce:

- static `PASS` does not authorize runtime `PASS`
- implementation `PASS` does not authorize deployment `PASS`
- deployment `PASS` does not authorize user acceptance
- user acceptance does not apply to a different build or smoke identity
- child-step `PASS` does not automatically authorize parent milestone `PASS`
- one successful audit does not authorize final acceptance when other required evidence remains
- documentation may be updated only after the relevant acceptance gate returns `ACCEPT`
- `READY_FOR_RUNTIME_SMOKE` is not runtime acceptance
- `PENDING_USER` must remain pending until matching user evidence is supplied
- a task without any runtime surface may correctly use Safari `N/A` with an exact reason

## 7. Artifact identity

When applicable, compare:

- task or milestone ID
- source revision
- full commit SHA
- `buildTag`
- `smokeVersion`
- package version
- artifact hash
- environment
- entrypoint
- deployment revision
- loaded asset identity
- timestamp
- acceptance attempt identity

A match on only one marker is insufficient when the contract requires multiple markers.

### Full SHA rule

When commit identity is required:

- require the full commit SHA
- a branch, short alias, step label, or cache-bust token alone is insufficient
- documentation quoting a SHA does not prove the running artifact contains it

## 8. User evidence rules

User-owned evidence may authorize user or runtime acceptance only when:

- it was supplied by the user
- it refers to the current acceptance attempt
- required artifact markers match
- required environment and entrypoint match
- required output fields are present
- required success fields satisfy the contract
- failure, missing-coverage, or forbidden arrays are empty when the contract requires them
- no fresher contradictory evidence exists

Codex-generated summaries of user evidence must preserve the original result and must not upgrade it.

## 9. Contradictory evidence

When authoritative evidence conflicts:

1. compare subject and artifact identity
2. compare freshness
3. compare evidence ownership
4. compare environment and entrypoint
5. compare source authority
6. require `canon-audit` if the expected acceptance rule itself is ambiguous

Do not silently select the more convenient result.

Return:

- `STALE_EVIDENCE` when the contradiction is explained by an older or mismatched artifact
- `BLOCKED` when equally authoritative current evidence remains unresolved
- `REJECT` when current authoritative evidence proves the acceptance criteria failed

## 10. Nested verdict rule

The gate must preserve the difference between:

- component verdict
- smoke workflow verdict
- acceptance gate verdict

Example:

- `mirror-audit` returns expected `FAIL` for a negative fixture.
- `smoke-orchestrator` returns `PASS` because that expected failure was detected correctly.
- `acceptance-evidence-gate` may return `ACCEPT` for the contract-smoke milestone when all required evidence is complete.

Never promote or reject acceptance by copying one inner verdict without checking the enclosing acceptance contract.

## 11. Boundary with other skills

- Scope isolation determines whether the exact scope is isolated or colliding.
- Task Router selects the workflow.
- specialized audits provide domain evidence.
- Smoke Orchestrator evaluates smoke workflow outcomes.
- Deployment Verifier evaluates publication and deployed artifact identity.
- Acceptance Evidence Gate decides whether the supplied evidence authorizes status promotion.

The gate must consume those results without duplicating or overriding their contracts.

## 12. Required workflow

Use a workflow equivalent to:

1. Identify proposed status promotion.
2. Identify acceptance scope and exact subject.
3. Apply scope-isolation classification.
4. Identify authoritative acceptance criteria.
5. List required evidence.
6. Classify supplied evidence and owners.
7. Verify subject and artifact identity.
8. Verify environment and entrypoint.
9. Verify freshness.
10. Evaluate specialized audit, smoke, and deployment results.
11. Detect missing, stale, invalid, or contradictory evidence.
12. Calculate gate verdict.
13. State whether promotion is authorized.
14. Report the exact next action without implementing a fix.

## 13. Output contract

Return all of these fields:

- `status: ACCEPTANCE_EVIDENCE_GATE`
- task objective
- proposed status promotion
- current status
- acceptance scope
- subject under acceptance
- authorized scope
- scope-isolation result
- authoritative acceptance criteria
- required evidence
- supplied evidence
- evidence classes
- evidence owners
- subject identity result
- artifact identity result
- environment result
- entrypoint result
- freshness result
- scope coverage result
- specialized audit results
- smoke-orchestrator result
- deployment-verifier result
- component verdicts
- user Safari status
- contradictions
- stale or mismatched evidence
- invalid evidence
- missing evidence
- failures
- blocked conditions
- gate verdict
- status promotion authorized: `YES` or `NO`
- preserved pre-existing changes
- assumptions
- confidence
- exact next user action

## 14. Field guidance

- `status` must be `ACCEPTANCE_EVIDENCE_GATE`.
- `gate verdict` must be one of the defined gate verdicts.
- `status promotion authorized` must be `YES` only when `gate verdict` is `ACCEPT`.
- `user Safari status` must be `PENDING_USER` when required user-owned evidence is outstanding.
- `user Safari status` may be `N/A` when Safari is not relevant, with an exact reason.
- `component verdicts` must preserve the distinction between nested component, smoke, deployment, and gate results.
- `stale or mismatched evidence` must identify the exact artifact or attempt mismatch.
- `invalid evidence` must identify evidence that is malformed, inapplicable, or not owned by the right party.
- `missing evidence` must name the absent evidence and the owner responsible for it.
- `exact next user action` must be the next concrete step, not a fix unless the contract explicitly asks for one.

## 15. Block conditions

Return `BLOCKED` when:

- proposed status or acceptance subject is ambiguous
- acceptance criteria are contradictory
- authoritative expected behavior is unresolved
- evidence ownership is disputed
- current equal-authority evidence conflicts
- implementation and acceptance evaluation are mixed
- the request asks the skill to manufacture evidence
- the request asks Codex to claim user acceptance
- required scope-isolation evidence is absent for a proposed sensitive write

## 16. Contract smoke examples

### Smoke A: complete contract-only acceptance

If the acceptance scope is `CONTRACT_ACCEPTANCE`, the subject is an isolated plugin skill, the proposed promotion is implementation step to `PASS`, exactly one authorized `SKILL.md` changed, frontmatter and all required sections validate, required positive and negative contract smokes passed, forbidden-write check passed, no runtime, deployment, or user-facing surface exists, and Safari is not required, then:

- gate verdict: `ACCEPT`
- status promotion authorized: `YES`
- user Safari status: `N/A` with exact reason
- missing evidence: none
- stale evidence: none
- contradictions: none

### Smoke B: stale user acceptance evidence

If the acceptance scope is `RUNTIME_ACCEPTANCE`, source and deployed artifact B are verified current, required current full SHA, `buildTag`, and `smokeVersion` identify artifact B, supplied user Safari output belongs to artifact A, artifact A markers do not match artifact B, static validation and deployment verification for B passed, and no fresh user Safari result exists for B, then:

- gate verdict: `STALE_EVIDENCE`
- status promotion authorized: `NO`
- user Safari status: `PENDING_USER` for artifact B
- static and deployment evidence remain `PASS`
- stale evidence identifies artifact A exactly
- missing evidence identifies fresh user Safari output for artifact B
- do not return `ACCEPT`
- do not classify this as a new code failure
- exact next action: run the required Safari smoke against verified artifact B and return its complete output
