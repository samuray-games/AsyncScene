---
name: evidence-bundle-and-artifact-identity
description: Define the evidence bundle shape, artifact identity semantics, truth levels, freshness, provenance, lineage, and fail-closed mismatch rules for Asynchronia acceptance workflows without implementing storage, orchestration, or acceptance policy.
---

# Evidence Bundle and Artifact Identity

Use this skill to define the contract for evidence bundles and canonical artifact identity for one exact Asynchronia acceptance attempt.

This skill is a contract definition only.

It does not:

- implement storage or persistence
- implement orchestration
- collect evidence
- create or update locks
- approve runtime work
- select a model
- execute smokes
- route failures
- manufacture acceptance
- replace the acceptance-pipeline-controller
- duplicate the acceptance-evidence-gate

## 1. Core objective

Define one bounded evidence contract that:

- identifies one exact pipeline run, contract step, scope, and artifact subject
- defines what counts as one evidence bundle
- separates claimed, observed, verified, and user-accepted evidence
- defines minimum identity for each evidence record
- defines freshness, provenance, lineage, and verification status
- rejects stale, foreign, malformed, mismatched, duplicate, superseded, or ambiguous identity
- supports acceptance-readiness review without making the final acceptance decision
- fails closed when identity or ownership cannot be proven

## 2. Boundary rules

This contract is subordinate to the acceptance controller and must not replace its orchestration role.

### 5.1 Acceptance Pipeline Controller

- `5.1` owns orchestration, stage composition, and top-level workflow sequencing.
- `5.1` may consume this contract to interpret current evidence identity and bundle completeness.
- `5.1` must remain the authoritative controller for workflow progression.

### 5.2 Pipeline State and Resume Contract

- `5.2` owns serialized pipeline state, checkpoint semantics, and deterministic resume behavior.
- `5.2` may reference artifact identity fields from this contract.
- `5.2` does not define the full evidence bundle schema.

### 5.3 This contract

- `5.3` owns evidence-bundle structure, artifact identity, truth levels, lineage, provenance, freshness, completeness, and mismatch semantics.
- `5.3` defines what evidence must exist and how it is classified.
- `5.3` does not decide final acceptance promotion.

### 5.4 Failure Routing and Corrective Loop

- `5.4` owns failure routing, corrective-loop policy, and remediation branching.
- `5.3` may expose deterministic failure reasons, but it must not implement routing policy.

### Acceptance evidence gate

- `acceptance-evidence-gate` remains the decision authority for status promotion.
- `5.3` is a schema and identity contract consumed by that gate.
- `5.3` must not duplicate or contradict the gate's acceptance-decision authority.

## 3. What one evidence bundle is

One evidence bundle is a finite, bounded set of evidence records and identity markers for one exact acceptance attempt.

A valid bundle must describe exactly one:

- pipeline run identity
- contract step identity
- authorized scope
- primary artifact subject or artifact family
- evidence freshness window
- evaluation attempt or observation sequence

A bundle is not valid if it silently mixes:

- multiple pipeline runs
- multiple acceptance attempts
- multiple authoritative scopes
- multiple unrelated artifact families
- unrelated runtime environments
- unrelated deployment surfaces

## 4. Minimum identity for a bundle

Every bundle must carry, at minimum, the following identity fields:

- `pipelineRunId`
- `contractStepId`
- `scopeIdentity`
- `artifactType`
- `canonicalArtifactLocator`
- `artifactVersion` when applicable
- `contentDigest` or equivalent immutable content identity
- `producerIdentity` or origin
- `observedAt` or creation timestamp
- `verificationMethod`
- `verificationStatus`

### Minimum identity meaning

- `pipelineRunId` identifies one exact attempt of one exact pipeline subject.
- `contractStepId` identifies the exact contract or milestone step that owns the bundle.
- `scopeIdentity` identifies the bounded authorized scope the evidence was collected for.
- `artifactType` identifies the class of artifact, such as source, package, installed, smoke, runtime, or user acceptance.
- `canonicalArtifactLocator` identifies the authoritative path, URL, manifest locator, or other canonical reference for that artifact type.
- `artifactVersion` identifies the version marker when the artifact type has a version.
- `contentDigest` identifies immutable content identity such as a hash, digest, or equivalent stable fingerprint.
- `producerIdentity` identifies who or what produced the evidence.
- `observedAt` identifies when the evidence was created or observed.
- `verificationMethod` identifies how the evidence was produced or checked.
- `verificationStatus` identifies the current truth level or verification state.

## 5. Evidence truth levels

This contract separates evidence truth into four distinct levels:

- claimed
- observed
- verified
- user_accepted

### Truth-level rules

- `claimed` means a party asserts the evidence exists or should exist.
- `observed` means the evidence was directly observed, but not yet independently verified.
- `verified` means the evidence was checked against the required identity and freshness rules.
- `user_accepted` means the user supplied the authoritative acceptance evidence for the exact current artifact and attempt.

These truth levels are not interchangeable.

- Claimed evidence does not become verified by documentation alone.
- Observed evidence does not become user-accepted by Codex summary.
- Verified evidence does not become user-accepted unless the user supplied it.
- User-accepted evidence must remain tied to the exact current artifact identity.

## 6. Supported evidence classes

The bundle must support at least these evidence classes:

- source artifact
- packaged artifact
- installed artifact
- commit identity
- `buildTag`
- `smokeVersion`
- static test result
- runtime smoke result
- Safari evidence
- user acceptance
- lock evidence reference
- approval evidence reference

### Evidence class rules

- Source artifact evidence identifies the repository source revision or accepted source snapshot.
- Packaged artifact evidence identifies a build output, plugin package, archive, or other distributable artifact.
- Installed artifact evidence identifies the artifact currently installed or loaded into the active environment.
- Commit identity evidence must use the full commit SHA when commit identity is required.
- `buildTag` and `smokeVersion` are release identity markers, not standalone proof of current runtime freshness.
- Static test result evidence includes deterministic local checks, diffs, schema validation, and contract validation.
- Runtime smoke result evidence includes local or deployed runtime execution evidence.
- Safari evidence is user-owned evidence and must stay user-owned.
- User acceptance evidence is only valid when the user supplied the matching current result for the exact current artifact.
- Lock evidence reference and approval evidence reference are pointers to external gate evidence, not substitutes for artifact identity.

## 7. Bundle completeness and acceptance readiness

A bundle is complete only when it contains every required identity marker for the exact subject and acceptance scope.

A bundle is acceptance-ready only when:

- the required identity markers are present
- the markers are coherent with one another
- the evidence is fresh for the current attempt
- the evidence is owned by the correct party
- the evidence is not stale, superseded, or foreign
- all mandatory evidence classes for the scope are present
- no authoritative contradiction remains unresolved

Incomplete bundles are not acceptance-ready.

Partial bundles may be useful for inspection, but they must not be promoted as complete.

## 8. Identity relationships

This contract defines a canonical identity ladder:

- source identity
- package identity
- installed identity
- smoke identity
- runtime identity
- user-acceptance identity

### Identity ladder rules

- Source identity is the root identity for authored content.
- Package identity must trace back to a source identity or deterministic source transform.
- Installed identity must trace back to the exact package identity that produced it.
- Smoke identity must trace back to the exact artifact under test and the exact smoke attempt.
- Runtime identity must trace back to the served artifact and deployed entrypoint actually used.
- User-acceptance identity must trace back to the exact current artifact and the exact user-supplied acceptance attempt.

If any step in the ladder changes, downstream evidence tied to the older identity becomes stale until revalidated.

## 9. Exact-match versus compatible-match

Exact match is required when the contract needs authoritative identity.

Compatible match is allowed only when a deterministic, explicitly accepted transformation is defined.

### Exact-match rules

- Exact match is required for pipeline run identity, contract step identity, scope identity, full commit SHA, `buildTag`, `smokeVersion`, package version, artifact hash, canonical locator, and acceptance attempt identity when those markers are applicable.
- Exact match means the marker refers to the same current subject, not merely a similar or derived one.

### Compatible-match rules

- Compatible match may be used only for explicit deterministic transforms, such as a source artifact that deterministically produces a package artifact or an installed artifact.
- Compatible match must be defined by a higher-level accepted contract or documented transformation rule.
- Compatible match never upgrades itself into exact match.
- If the contract requires exact identity, compatible match is not enough.

## 10. Freshness, lineage, provenance, and immutability

### Freshness

- Fresh evidence is evidence observed for the current attempt and current identity.
- Older evidence becomes stale when the subject artifact, scope, deployment surface, or acceptance attempt changes.
- Freshness must be checked against the exact requested subject and environment.

### Lineage

- Each evidence record must point to its source or origin.
- Each downstream identity must preserve the chain from its upstream identity.
- Lineage must be explicit enough to explain how the artifact under acceptance was derived.

### Provenance

- Provenance identifies who produced the evidence, how it was produced, and from what source or environment it arose.
- Provenance must be sufficient to distinguish user-owned evidence from Codex-owned evidence and from repository documentation.

### Immutability

- Identity markers are append-only once observed or recorded.
- Corrections must be represented as new records that supersede older ones, not by silently rewriting history.
- A revised identity must create a new lineage edge rather than overwriting the older one.

## 11. Mismatch, stale, foreign, duplicate, superseded, and unverifiable rules

### Missing evidence

- Missing mandatory evidence means the bundle is not complete.
- Missing evidence fails closed.

### Partial evidence

- Partial evidence may identify a candidate subject but cannot prove acceptance readiness.
- Partial evidence may require revalidation rather than acceptance.

### Stale evidence

- Evidence is stale when it belongs to an older artifact, older scope, older deployment surface, older environment, or older acceptance attempt.
- Stale evidence must not be treated as current evidence.

### Foreign-run evidence

- Evidence from a different pipeline run, acceptance attempt, or artifact family is foreign.
- Foreign evidence must be rejected unless an explicit current linkage proves it is still authoritative for the current subject.

### Changed artifact identity

- When the artifact identity changes, all downstream evidence tied to the prior identity becomes stale until revalidated.
- A changed identity may require a new bundle instead of a patch to the old bundle.

### Changed scope

- When the authorized scope changes, the prior bundle is no longer authoritative for the new scope.
- Scope expansion or contraction requires revalidation.

### Conflicting identities

- If two authoritative records describe incompatible identities for the same subject, the bundle is unresolved.
- Unresolved identity fails closed rather than guessing.

### Unverifiable claims

- Claims that cannot be tied to a verifiable artifact or provenance source remain claims only.
- Unverifiable claims are insufficient for readiness.

### Duplicate evidence

- Duplicate evidence records do not create additional authority.
- Duplicates should be deduplicated by identity, observation time, and truth level while preserving traceability.

### Superseded evidence

- Superseded evidence remains part of history but loses current authority.
- A superseding record must identify the record it supersedes.

## 12. Deterministic reasons for accept, reject, or revalidate

This contract must provide deterministic reasons for the bundle state.

### Accept reasons

- all required identity markers are present
- all required markers match the current subject
- freshness is current
- provenance is authoritative
- lineage is intact
- no unresolved contradiction remains
- all required evidence classes for the scope are present

### Reject reasons

- missing mandatory identity marker
- mismatched artifact identity
- foreign-run evidence
- stale evidence
- malformed locator or digest
- unverifiable claim treated as fact
- duplicate or superseded record used as current authority
- conflicting provenance or ownership
- ambiguous current subject

### Revalidate reasons

- source identity changed
- package identity changed
- installed identity changed
- smoke identity changed
- runtime identity changed
- user-acceptance identity changed
- scope changed
- transform definition changed
- freshness window expired

## 13. Auditability and fail-closed behavior

The bundle must be explainable enough to answer all of the following:

- what was proven
- by which evidence
- for which artifact
- under which scope
- at what time
- with which verification status

### Required audit fields

Every bundle record set must preserve:

- identity fields
- truth level
- provenance
- timestamp
- source or origin
- verification method
- verification status
- supersedes or lineage reference when applicable

### Fail-closed rules

- Unknown identity fails closed.
- Malformed identity fails closed.
- Ambiguous identity fails closed.
- Mismatched identity fails closed.
- Stale identity fails closed for current readiness.
- Foreign identity fails closed unless explicitly authorized by a current deterministic linkage.

Do not infer current authority from partial overlap.

## 14. Boundary with other skills

- `5.1` owns orchestration and top-level workflow, not evidence semantics.
- `5.2` owns pipeline state and resume semantics, not full evidence schema.
- `5.3` owns evidence bundle and artifact identity semantics, not orchestration or routing.
- `5.4` owns failure routing and corrective policy, not artifact identity.
- `acceptance-evidence-gate` consumes this contract to decide whether supplied evidence authorizes promotion.
- `smoke-orchestrator` consumes this contract to evaluate evidence freshness and smoke identity.
- `deployment-verifier` consumes this contract to compare deployed identity and release markers.

If any of those contracts conflict with this one, authoritative canon resolution is required rather than silent drift.

## 15. Output contract

When this skill is used as a report contract, it must return all of these fields:

- `status: EVIDENCE_BUNDLE_AND_ARTIFACT_IDENTITY`
- task objective
- bundle subject
- pipeline run identity
- contract step identity
- scope identity
- artifact identity
- evidence classes
- truth levels
- completeness result
- freshness result
- lineage result
- provenance result
- mismatch result
- acceptance-readiness result
- deterministic reason
- missing evidence
- stale evidence
- superseded evidence
- exact next action

### Output contract rules

- `status` must identify this contract family.
- `completeness result` must distinguish complete, partial, and missing evidence.
- `freshness result` must distinguish current, stale, and unknown freshness.
- `lineage result` must distinguish intact, broken, and unresolved lineage.
- `provenance result` must distinguish authoritative, weak, and unverifiable provenance.
- `mismatch result` must identify exact identity conflicts rather than vague failure labels.
- `acceptance-readiness result` must say whether the bundle is ready for downstream acceptance review.
- `exact next action` must be the next concrete step, not a fix unless the caller explicitly requests a fix.

