---
name: deployment-verifier
description: Verify deployment lineage, served artifact identity, entrypoint freshness, and publication state without modifying the deployment, manufacturing evidence, or claiming user runtime acceptance.
---

# Deployment Verifier

Use this skill to verify whether the intended source revision became the artifact actually served through the real deployed application entrypoint.

This skill is read-only. It does not:

- modify deployment files
- deploy or publish assets
- repair wiring
- manufacture evidence
- execute game runtime
- claim Safari acceptance
- bypass exact scope isolation

## 1. Core purpose

The verifier answers one question: did the intended source identity become the actual served deployment, with the expected entrypoint, loaded assets, freshness, and release metadata?

It must:

- identify the intended deployment target
- identify the source revision or accepted artifact identity
- identify the deployment provider or deployment surface when supplied
- identify the real application entrypoint
- identify all relevant loaded assets
- verify publication lineage from source to served artifact
- verify entrypoint-to-asset wiring
- verify served artifact freshness
- compare `buildTag`, commit, `smokeVersion`, and hashes when applicable
- distinguish repository state from public deployment state
- distinguish direct asset freshness from application-entrypoint freshness
- detect stale, mixed, partial, or unverifiable deployments
- distinguish deployment failure from code failure
- identify required `mirror-audit` or `smoke-orchestrator` participation
- report the exact next action without implementing a fix

## 2. Verification modes

Support at least these verification modes:

- `SOURCE_TO_ARTIFACT`
- `ARTIFACT_TO_DEPLOYMENT`
- `DEPLOYED_ENTRYPOINT`
- `DEPLOYED_ASSET`
- `RELEASE_LINEAGE`
- `CACHE_BUST`
- `ROLLOUT_STATE`
- `RUNTIME_MARKER_LINKAGE`

### Verification mode meanings

- `SOURCE_TO_ARTIFACT`: verify that a source revision or committed artifact identity corresponds to the expected build artifact identity.
- `ARTIFACT_TO_DEPLOYMENT`: verify that a known artifact identity is what the deployment surface is publishing.
- `DEPLOYED_ENTRYPOINT`: verify what the real application entrypoint loads, including the effective script or import path.
- `DEPLOYED_ASSET`: verify a direct served asset independently of the app entrypoint.
- `RELEASE_LINEAGE`: verify the full chain from source identity to artifact to deployment to served runtime markers.
- `CACHE_BUST`: verify that cache-busting values actually caused the entrypoint to load the intended fresh asset.
- `ROLLOUT_STATE`: verify whether publication is complete, pending, partial, mixed, or unverified.
- `RUNTIME_MARKER_LINKAGE`: verify that runtime markers exposed by the served app match the expected release identity.

## 3. Deployment states

Use this finite deployment-state set:

- `CURRENT`
- `PENDING_PUBLICATION`
- `STALE_ASSET`
- `STALE_ENTRYPOINT`
- `WIRING_MISSING`
- `MIXED_REVISION`
- `UNVERIFIED`

### Deployment state meanings

- `CURRENT`: source identity, artifact identity, deployed entrypoint, loaded assets, and release markers are coherent and fresh for the requested contract.
- `PENDING_PUBLICATION`: publication is known to be in progress, incomplete, or not yet observable through the intended deployment surface.
- `STALE_ASSET`: the direct served asset is old relative to the requested identity, even if other evidence appears newer.
- `STALE_ENTRYPOINT`: the real application entrypoint still loads an older asset or older markers than the requested identity.
- `WIRING_MISSING`: the deployment target exists, but the expected entrypoint, script inclusion, import path, or release wiring is absent.
- `MIXED_REVISION`: different required deployment surfaces expose different release identities that do not describe one coherent release.
- `UNVERIFIED`: the available evidence is too weak, incomplete, or untrusted to determine actual deployment state.

## 4. Verdicts

Use exactly these verdicts:

- `PASS`
- `FAIL`
- `BLOCKED`
- `PENDING_DEPLOYMENT`
- `INSUFFICIENT_EVIDENCE`

### Verdict meanings

- `PASS`: all required deployment identity, wiring, and freshness conditions are verified.
- `FAIL`: supplied evidence proves the deployed state violates the expected identity, wiring, or freshness contract.
- `BLOCKED`: scope, ownership, target, or authoritative expected identity is unresolved; or the request mixes implementation and verification; or the request asks for deployment repair, evidence fabrication, or a claim of user acceptance.
- `PENDING_DEPLOYMENT`: publication is known to be in progress or not yet observable through the required deployment surface.
- `INSUFFICIENT_EVIDENCE`: the evidence is too weak to classify the actual deployment.

Rules:

- Do not convert missing evidence into `FAIL` unless the contract explicitly defines absence as failure.
- Do not convert `PENDING_DEPLOYMENT` into `PASS`.
- Do not copy a `mirror-audit` or `smoke-orchestrator` verdict without evaluating this skill's own deployment contract.

## 5. Required workflow

Use a workflow equivalent to:

1. Identify verification mode.
2. Confirm atomic target and authorized scope.
3. Apply scope-isolation classification.
4. Determine expected deployment identity.
5. Determine the real deployment entrypoint.
6. Collect source, artifact, entrypoint, and served-asset evidence.
7. Verify publication lineage.
8. Verify wiring and loaded-asset identity.
9. Verify release metadata coherence.
10. Classify deployment state.
11. Calculate the deployment verdict.
12. Identify `mirror-audit` and `smoke-orchestrator` dependencies.
13. Report missing or stale evidence.
14. Report the exact next action without modifying deployment.

Do not skip entrypoint checks when the contract requires the deployed application surface.

## 6. Scope isolation precedence

Scope isolation has priority over every deployment decision.

If the subject under test requires any runtime-sensitive file, exact scope isolation must be resolved before writes. Runtime-sensitive includes:

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

If exact scope isolation is absent, the deployment verifier may report the block but must not proceed as if isolation exists.

## 7. Deployment identity

When applicable, verify:

- repository or source revision
- full commit SHA
- deployment revision
- artifact path
- artifact hash
- public asset URL class
- application entrypoint URL class
- script or import URL loaded by the entrypoint
- cache-bust token
- `buildTag`
- `smokeVersion`
- runtime commit marker
- publication timestamp
- deployment provider status
- expected release metadata
- actual served release metadata

Do not require fields that are genuinely inapplicable.

Use `N/A` only with an exact reason.

### Full SHA rule

When a release or smoke contract requires a commit identity:

- require the full commit SHA
- a symbolic label, branch name, step name, or human-readable alias is not sufficient
- a cache-bust token alone is not proof of source identity
- an HTTP 200 response alone is not proof of artifact identity

## 8. Entrypoint truth

The real application entrypoint is authoritative for what the application loads.

Therefore:

- a current direct asset does not prove a current application deployment
- repository parity does not prove public deployment
- deployed file presence does not prove entrypoint reachability
- a fresh query parameter does not prove fresh content
- the entrypoint must resolve to the expected asset identity
- the loaded asset must expose matching release markers when those markers are part of the contract

## 9. Stale deployment rules

Classify stale deployment when evidence shows any of the following:

- direct asset is current but the application entrypoint loads an older asset
- entrypoint contains an old cache-bust token
- entrypoint is current but the served asset content or markers are old
- source and deployed repository mirrors match but the public application serves an older revision
- user runtime output contains old `buildTag`, commit, or `smokeVersion` after a claimed deployment
- the same old output repeats after a claimed change without fresh artifact evidence

Do not propose another code fix until deployment, cache, and wiring have been distinguished from code behavior.

## 10. Mixed deployment rules

Use `MIXED_REVISION` when:

- different required assets expose different release identities
- entrypoint and loaded asset belong to different revisions
- public nodes or supplied fetches show inconsistent artifact identities
- `buildTag`, full commit SHA, and `smokeVersion` do not describe one coherent release

A mixed deployment cannot return `PASS`.

## 11. Pending publication rules

Use `PENDING_PUBLICATION` with verdict `PENDING_DEPLOYMENT` only when supplied evidence shows a known deployment or publication operation has not completed or propagated sufficiently.

Do not use it merely because evidence is absent.

## 12. Mirror audit routing

Require `mirror-audit` when the question includes:

- source/deployed file parity
- missing counterpart
- wiring parity
- boot registration
- source versus deployed reachability
- release metadata parity between repository representations

`Deployment Verifier` may consume a `mirror-audit` result but must not duplicate or override its contract.

## 13. Smoke orchestrator relation

`Deployment Verifier` returns the deployment component result.

`Smoke Orchestrator` determines whether that result satisfies an enclosing smoke's expected outcome.

Example:

- `Deployment Verifier` returns `FAIL` for a deliberately stale entrypoint fixture.
- The enclosing contract smoke may return `PASS` because the verifier correctly detected the stale deployment.

## 14. User Safari boundary

- Deployment verification may be complete without Safari when only publication identity is being verified.
- Actual runtime acceptance remains `PENDING_USER` until the user supplies required Safari evidence.
- Safari evidence with mismatched deployment identity is stale or invalid evidence.
- The skill must never invent, upgrade, or reinterpret missing user evidence.
- Plugin-contract work may use Safari status `N/A` with an exact reason.

## 15. Deployment line evaluation

The verifier must distinguish:

- source repository state
- artifact generation state
- deployment provider state
- actual public entrypoint state
- loaded asset state
- runtime marker state

Do not collapse these into one undifferentiated “deployed” label.

## 16. Output contract

Return all of these fields:

- `status: DEPLOYMENT_VERIFICATION`
- verification mode
- task objective
- authorized scope
- expected deployment target
- expected source identity
- expected artifact identity
- actual deployment surface
- actual entrypoint
- actual loaded assets
- source revision result
- publication lineage result
- entrypoint result
- asset identity result
- wiring result
- cache-bust result
- buildTag result
- commit marker result
- smokeVersion result
- release metadata coherence result
- mirror audit requirement
- mirror audit result
- smoke orchestrator relation
- deployment state
- verdict
- user Safari status
- stale or mismatched evidence
- missing evidence
- failures
- blocked conditions
- preserved pre-existing changes
- assumptions
- confidence
- exact next user action

## 17. Field guidance

- `status` must be `DEPLOYMENT_VERIFICATION`.
- `deployment state` must be one of the defined deployment states.
- `verdict` must reflect the deployment component result only.
- `smoke orchestrator relation` must explain how an enclosing smoke would use, but not overwrite, the deployment component result.
- `user Safari status` must be `PENDING_USER` when user-owned runtime evidence is still required.
- `user Safari status` may be `N/A` when Safari is not relevant, such as pure publication identity verification.
- `stale or mismatched evidence` must identify the identity conflict and why it invalidates freshness.
- `missing evidence` must name what is absent and who owns it.
- `exact next user action` must be the next concrete step, not a deployment fix unless the contract explicitly asks for one.

## 18. Block conditions

Return `BLOCKED` when any of these apply:

- expected deployment target is ambiguous
- source or artifact identity is unresolved
- ownership of the deployment surface is unresolved
- application entrypoint is unknown when entrypoint verification is required
- contradictory release identities cannot be resolved
- implementation and verification objectives are mixed
- the request asks the skill to deploy, repair, or manufacture evidence
- required scope-isolation evidence is absent for a proposed runtime write
- the request asks Codex to claim user runtime acceptance

## 19. Contract smoke examples

### Smoke A: current deployment

If the verification mode is `RELEASE_LINEAGE`, the expected full source SHA is `1111111111111111111111111111111111111111`, the expected `buildTag` and `smokeVersion` are both `deployment-verifier-smoke-a`, the deployment provider reports publication complete, the real application entrypoint loads `/dev-checks.js?v=deployment-verifier-smoke-a`, the served asset hash matches the expected artifact hash, the served runtime markers contain the expected full SHA, `buildTag`, and `smokeVersion`, and Mirror Audit evidence reports parity, wiring, and reachability `PASS`, then:

- deployment state: `CURRENT`
- verdict: `PASS`
- user Safari status: `N/A`
- stale evidence: none
- missing evidence: none

### Smoke B: current direct asset, stale entrypoint

If the verification mode is `DEPLOYED_ENTRYPOINT`, the expected source and direct deployed asset identify revision B, the direct asset fetch is current, the application entrypoint still loads revision A through an older script URL, the runtime markers reached through the real entrypoint identify revision A, publication is complete, and no evidence of an active rollout remains, then:

- deployment state: `STALE_ENTRYPOINT`
- verdict: `FAIL`
- direct asset result: `PASS`
- entrypoint result: `FAIL`
- loaded-asset identity result: `FAIL`
- do not classify this as code behavior failure
- do not propose a code fix
- exact next action: correct or republish entrypoint wiring, then collect fresh deployment evidence
- user Safari status: `N/A`
