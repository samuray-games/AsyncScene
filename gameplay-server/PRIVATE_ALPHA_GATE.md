# Chat03 private-alpha operator and staging decision gate

**Status: PROPOSAL / NOT APPROVED / NO DEPLOYMENT AUTHORIZATION**  
**Prepared:** 2026-10-28  
**Repository baseline:** main 1e05ffd7b65bdd5d775638e5e524e125a9ce0f07 (after docs-only PR #447).  
**Scope:** One read-only policy/decision document for the next Chat03 checkpoint. No source code, SQL migration, Cloudflare resource, secret or deployment changes.

## 1. Verified baseline and limits

- PRs #440-#446 are merged. The final gameplay-source baseline is 3f3455a713c446880daf7fde3341dbd8d6c4bedf; PR #447 later merged memory documentation into main 1e05ffd7b65bdd5d775638e5e524e125a9ce0f07.
- Final exact-gameplay-main GitHub Actions all passed: [private API 40659349212](https://github.com/samuray-games/AsyncScene/actions/runs/40659349212), [CAS SQL 40659349376](https://github.com/samuray-games/AsyncScene/actions/runs/40659349376), [AI forensics 40659349224](https://github.com/samuray-games/AsyncScene/actions/runs/40659349224), [automatic Pages 40659348204](https://github.com/samuray-games/AsyncScene/actions/runs/40659348204). The private local harness applied gameplay migrations 0001-0007 and finished CHAT03B2_LOCAL_PRIVATE_API_PASS (NOT PRODUCTION_AUTH_PASS); SQL discovery passed 61/61. These are local/offline evidence, not authenticated hosted-D1 acceptance.
- gameplay-server/src/worker.js is an **undeployed** private-alpha prototype. It mints battle-and-side-scoped random bearer capabilities for participants, stores digests, and uses a distinct server-side ADMIN_CONTROL_TOKEN for privileged battle creation and capability revoke/replace. A battle token is **not** a stable human account, an invitation, or independent proof of player identity.
- Current environment contract in gameplay-server/CHAT03B2.md: dedicated gameplay DB binding, ADMIN_CONTROL_TOKEN, CREATE_RECOVERY_KEYS, CREATE_RECOVERY_KEY_CURRENT, COMMIT_WINDOW_MS, and exact ALLOWED_ORIGIN. The documented admin creation path is server-to-server; browser CORS currently does not permit its Idempotency-Key header. CORS is defense in depth, not authentication.
- The migration 0006 recovery lifecycle closes and clears live ciphertext on the relevant transitions; migration 0007 introduces guarded operator token revoke/replace and digest history. Historical backups may still contain older encrypted recovery material. A lost successful replace response is **not** safe to blindly retry; a trusted operator must verify generation and explicitly revoke or replace the unknown bearer.
- Production/hosted gameplay Worker, dedicated gameplay D1, private-alpha identity and trust policy, protected backup/restore, key custody, data retention, user-owned Safari acceptance and Chat05 social-result gate are **not approved or evidenced**. Automatic GitHub Pages publication is separate from gameplay Worker deployment.
- The existing telemetry-receiver D1 is for privacy-restricted analytics only, and must never be reused for battle state, player-authored text, credentials or gameplay retention.

## 2. Decisions requiring explicit owner approval

The recommendations below are **candidates**, not accepted policy. Do not silently fill in the TBD values.

| ID | Decision to approve | Narrow recommended starting point | Status |
| --- | --- | --- | --- |
| PA-01 | Private-alpha audience, entry and human trust | Owner-curated invitation roster only; identify who may administer invites and revoke access. Do not invite actual users until an enforceable access control is reviewed. | OPEN |
| PA-02 | Real player identity, impersonation and second device | Distinguish owner roster identity from battle-scoped bearer possession. Reconnection via token possession is technical behavior, not an approved cross-device account model. Choose whether second-device transfer is prohibited pending account authentication. | OPEN |
| PA-03 | Admin secret custody, distribution and emergency rotation | One accountable operator, server-only ADMIN_CONTROL_TOKEN, separate from telemetry credentials. Approve secret store access, emergency disable, offboarding and audit before remote access. No admin secret in browser, repo, Notion, CI logs or screenshots. | OPEN |
| PA-04 | Participant capability handoff and recovery | Define secure private delivery, loss reporting, revocation/replacement, compromised token handling and the no-blind-retry lost-response protocol. No plaintext token logging or analytics. | OPEN |
| PA-05 | Recovery keyring lifecycle | Approve named custody/backup owners and protected storage, previous-version decrypt-only handling, restore test, removal criteria and failure response. Never publish CREATE_RECOVERY_KEYS. | OPEN |
| PA-06 | Gameplay data privacy and retention | Specify purposes, data categories, explicit retention periods and purge/erasure expectations for battles, receipts, outbox, creation idempotency rows, tombstones, token digest history, backups and logs. **No retention number is implicitly approved.** | OPEN |
| PA-07 | Isolated staging resources and deployment permissions | Dedicated staging Worker plus dedicated gameplay D1, explicitly identified account/binding/resource, least-privilege credentials, separate from telemetry and production. An owner must authorize actual create/query/delete/deploy. | OPEN |
| PA-08 | Checkpoint, protected backup, recovery and stop authority | Name restore owner and backup location/verification, require a demonstrable isolated restore, fail-closed access disable operation, migration rollback/runbook, and a STOP authority for uncertainty. | OPEN |
| PA-09 | Browser and release acceptance | Plan authenticated remote synthetic exercises, owner-run iPhone Safari and desktop checks, and eventual Chat05 recognition/voting gate. No real-alpha invitation based on local CI alone. | OPEN |

**No-go default:** any unresolved PA-01 through PA-08 prevents real-user alpha and operational hosted migration. PA-09 controls final browser/user acceptance; it does not authorize the earlier gates by itself.

## 3. Sequential gates and evidence

### G0 - Source integration checkpoint: PASS

- Authoritative repository: samuray-games/AsyncScene; exact main baseline above. Existing reviewed PRs #440-447 merged. No local worktree is used by this planning document.
- Exact source, SQL and local Worker/D1 evidence is linked in section 1. The local test results must not be renamed HOSTED_D1_PASS, AUTH_PASS or SAFARI_PASS.
- Required next actions are policy and separate staging approval, not an automatic code refactor.

### G1 - Policy and ownership: BLOCKED_OWNER_DECISIONS

- Owner explicitly accepts or amends PA-01 through PA-08 with responsible roles and implementation work items. Document unresolved tradeoffs and the user-visible trust/privacy notice.
- A separate technical review validates how the chosen identity/access model is actually enforced by Worker, not merely written in a policy. If it requires code, open a distinct scoped implementation PR with synthetic tests and exact-head review.
- Establish who may request a backup, who may restore, who may disable access, and who independently witnesses the restore exercise. Do not record actual secrets or personal invitee lists in GitHub.

### G2 - Isolated staging authorization: BLOCKED_NO_EXPLICIT_PERMISSION

- Obtain separate owner permission naming the exact planned Cloudflare account/environment, isolated gameplay Worker and gameplay D1 purpose, actions permitted (create, query, deploy and any deletion), access controls, and cleanup obligations.
- Reconcile up-to-date Cloudflare API semantics and billing before mutation. Do not run a historical hosted preflight merely because an opt-in environment variable can be set.
- Establish a resource inventory and exact identifiers using authenticated provider confirmation; never guess or reuse telemetry D1 names/IDs. Treat missing or ambiguous create/delete responses as STOP, not a reason for blind retry.

### G3 - Data, backup and keyring recovery: BLOCKED_NO_BACKUP_RESTORE_PROOF

Before any potentially destructive hosted migration, rollout, deletion or key rotation:

1. Identify the exact data resource, environment, schema versions, owner and expected blast radius. For fresh empty staging, record that evidence explicitly; do not invent a populated backup.
2. Create an owner-approved, access-controlled recoverable snapshot/export of the **correct gameplay resource** when data could be at risk. Record only non-secret resource identifiers and verification evidence in the handoff.
3. Keep the recovery keyring separately protected and ensure that the corresponding required versions remain available for any ciphertext that must be recoverable. Backups of D1 alone are insufficient.
4. Test restoration on a separate isolated disposable destination and check record integrity, migrations, foreign keys, versioned receipts/outbox, fail-closed unknown credentials and absence of access after revoke. Obtain operator review.
5. Verify a rehearsed disable-access/rollback procedure. A Git commit or Notion entry is not a backup of D1 or keys.
6. If any identity, backup integrity, key version or restore result is uncertain: **BLOCKED_DATA_MIGRATION / STOP**. No destructive repair, direct privileged SQL workaround, automatic rerun or guessed deletion.

### G4 - Authenticated remote synthetic acceptance: NOT_STARTED

Only after G1-G3 and separate permission:
- Apply the reviewed migration sequence to the **identified isolated gameplay staging** resource, not telemetry. Verify expected schema version and exact hash/test manifest.
- Exercise authenticated synthetic admin create and participant A/B commit, both-order reveal, replay, concurrent CAS, immutable receipt/outbox, deadline/expiry, revoke/replace, stale-token denial, recovery closed/tombstone behavior, restart, and failure after successful write but lost HTTP response.
- Verify admin routes reject browser Origin/preflight, no participant can impersonate another battle/side, and no secret appears in public views, telemetry or logs. Ensure operator controls do not use a privileged raw SQL bypass.
- Test error behavior, disable-access and verified restore with exact resource identity; record actual PASS/FAIL for the remote environment. Never infer HOSTED_AUTH_PASS from local workerd results.

### G5 - Human/real-player acceptance: NOT_STARTED

- Obtain explicit invite/trust/privacy and retention acceptance. Complete dedicated browser integration, owner-run Safari and desktop testing, and documented incident/onboarding support.
- Preserve Chat05 recognition/vote and social-result dependencies. Source integration does not imply the web gameplay client is connected or game outcomes are finalized.
- Only a subsequent explicit owner release decision can turn a staging experiment into private-alpha access. Do not alter current live telemetry or Stage 7.15.

## 4. Operational STOP / recovery examples

| Condition | Required safe response |
| --- | --- |
| Unknown or mismatched Cloudflare account / D1 UUID | STOP; read the verified owner inventory, do not query/mutate arbitrary resources |
| Create/delete response lost | Record an ambiguous-operation checkpoint; inspect exact provider resource identity; no blind retry or bulk deletion |
| Backup/restore fails or the keyring version is unavailable | Disable writes/access via a separately reviewed operation; preserve evidence; do not guess keys, downgrade encryption or replay stale credentials |
| Operator rotate/replace response lost | Do not repeat the same mutation blindly. Inspect current generation using trusted administration and deliberately replace/revoke at that generation after confirming current state |
| Participant token suspected leaked | Stop issuing invites for affected scope; use the reviewed admin revoke/replace flow; do not treat browser CORS as a token boundary |
| SQL auth or data restore violates invariants | STOP, protect snapshots and logs without tokens, require a new reviewed fix PR and fresh acceptance |
| Any hosted acceptance test uses real player content or telemetry D1 | STOP immediately; do not relabel as synthetic PASS |

## 5. Accountability and next checkpoint

- **ChatGPT:** coordinates independent evidence review, maintains the decision ledger and validates exact source references; cannot approve policy or actual-player Safari on behalf of the owner.
- **Codex:** may implement a separately authorized, isolated local code task under repository policies, publishes remote checkpoint + exact-HEAD CI and requests review; does not merge or deploy.
- **Owner:** accepts the decision ledger, names accountable operators and explicitly authorizes any hosted staging/create/delete/migration/deploy; runs or accepts user-owned browser/runtime tests; manually merges reviewed PRs.
- **Independent reviewer:** checks the exact policy/implementation diff, authorization boundaries, remote test evidence and restore runbook without upgrading unobserved evidence to PASS.

**Handoff checkpoint:** propose owner decisions PA-01..PA-09, then a separate staged operator/restore runbook review and owner authorization. Until then: **PRIVATE_ALPHA_BLOCKED_POLICY / HOSTED_GAMEPLAY_NOT_AUTHORIZED**.

## References

- [Canonical Chat03 tracking issue #439](https://github.com/samuray-games/AsyncScene/issues/439)
- [Chat03 gameplay-server implementation](https://github.com/samuray-games/AsyncScene/tree/1e05ffd7b65bdd5d775638e5e524e125a9ce0f07/gameplay-server)
- [Chat03B2 Worker prototype contract](https://github.com/samuray-games/AsyncScene/blob/1e05ffd7b65bdd5d775638e5e524e125a9ce0f07/gameplay-server/CHAT03B2.md)
- [Approved Chat plan and Checkpoint + Recovery gates](https://app.notion.com/p/3fa815ae752f810187b9eeeabdab6d2b)
- [Canonical project memory](https://app.notion.com/p/3a0815ae752f8139945ee38dfefbb111), top MEMORY_REV read 2026-10-28-CHAT03-PR441-MERGED-PR442-DRAFT-BLOCKED-R199, stale for merge status; Notion update deferred after connector safety block.
