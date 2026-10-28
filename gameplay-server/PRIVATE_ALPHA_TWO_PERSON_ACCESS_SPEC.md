# Chat03 Two-Person Access Contract V1

**Status: DESIGN PROPOSAL / NOT APPROVED / NO DEPLOYMENT AUTHORIZATION**  
**Prepared:** 2026-10-28  
**Repository baseline:** `main@31b7a077820914e92de81239e5ab4099e3dfa558` (after merged PR #448).  
**Related pending work:** PR #449, `de6a6130622097d7123b3f4d6ce2da18bea1d9d3`, open and Ready for review, not merged. Its owner-reported Safari PASS is for the local synthetic two-window harness only.  
**Scope:** Proposed accountless access contract for exactly the project owner (A) and one trusted invitee (B, Керил). It proposes a next implementation atom; it changes no runtime, SQL, UI, Worker, Cloudflare resource, secret, or policy.

This document is a concrete design for owner review. Its recommendations do not approve any PA gate, retention period, operator assignment, staging access, deployment, or real-person invitation.

## 1. Recommendation

For a first, deliberately small pilot, use **two separately minted, battle-and-side-scoped bearer capabilities**, one for A and one for B, with an owner-mediated invitation over an already-known end-to-end encrypted channel. Before sending B's capability, the owner confirms the recipient using a second known channel (for example, a short live voice/video check against the message account). The invite is one-to-one and manually issued; there is no public signup, discoverable lobby, or general account system.

Treat possession of the bearer as authority to act for that side. A delivery-channel identity check reduces misdelivery and casual impersonation; it does **not** cryptographically distinguish Керил from someone who later steals his bearer. The current Worker cannot make that distinction. If the owner requires protection against a stolen bearer being used by its holder, adopt the stricter passkey-bound identity option in section 3 before remote access.

Keep each capability on its participant's designated device, never in a URL, telemetry, logs, screenshots, shared clipboard, or the other participant's browser. Reconnection on that device uses the same capability. A lost device or suspected disclosure is handled by the operator's explicit revoke/replace path; a new device receives a fresh capability only after the owner re-verifies the person out of band. This is a manual recovery boundary, not cross-device account recovery.

Use only a dedicated HTTPS gameplay Worker and dedicated gameplay D1 if a later, separately authorized staging step is approved. The remote gameplay client must call that Worker; it must not host privileged operations. The telemetry D1 is never a gameplay transport or store.

## 2. Invite, join, and reconnect flow

### 2.1 One-time owner invitation

1. The owner records A and B as the only two intended people in an owner-controlled roster outside the repository. The roster and contact details are not stored in GitHub, Notion, Worker state, or analytics. This is a proposed human procedure; current code does not enforce a roster.
2. The owner contacts B through a known end-to-end encrypted channel and confirms the same person using a second previously known channel. The invitation identifies the game and asks B to accept. No invite URL containing a bearer token is sent.
3. After acceptance, the owner creates one battle through the trusted operator path: `POST /v1/admin/battles`. A is side A and B is side B. Use a fresh high-entropy `Idempotency-Key` for that creation intent and persist it before the request. If the create response is ambiguous, recover that same intent using the same key and identical participant payload; do not mint a second battle blindly.
4. The server returns the battle ID and distinct A/B capabilities only to the trusted operator. A matching retry using the same idempotency key can recover and re-disclose that original result, so the key and response remain sensitive. The operator must send only A's token to A and only B's token to B, through the verified private channel. Do not paste both tokens into either browser or a shared chat. The operator must not use browser JavaScript or the public client to call the admin endpoint.
5. Each participant opens the same approved HTTPS game origin on their own device, enters the battle ID, and supplies only their own capability through the client. The browser calls `GET /v1/battles/{battleId}` and `POST /v1/battles/{battleId}/commit` with that capability in the Authorization bearer header. The server derives side and participant identity from the active capability; client-supplied side, actor, role, version, or server time cannot choose another identity.
6. There are exactly two participant records in the battle. A third person cannot join through this contract. Replacing B means owner action against B's existing capability record, not a third parallel participant.

Current source does not implement this onboarding UX or deliver the invite. The browser harness in PR #449 is loopback-only and cannot connect two remote devices.

### 2.2 Device persistence and recovery

- On the designated device, the future client may persist that side's bearer in origin-scoped browser storage so a Safari close, reload, or network loss does not destroy the session. Store only that participant's token, provide a clear local sign-out/delete control, and never sync it into app logs or telemetry.
- Persistent browser storage is a bearer-secret store, not a trusted identity proof. Same-origin script compromise, device compromise, shared-device access, browser backup/sync, and someone with device unlock may expose it. CSP and HTTPS reduce exposure paths but do not make browser storage theft-proof. A memory-only token fails the reload/restart requirement; device-local persistence needs owner approval.
- After Safari closes or reloads, the participant reopens the same origin, selects/enters the battle ID, and the client reuses that device's own capability. After network loss, it retries safe reads and uses the existing command idempotency/receipt behavior for an ambiguous commit; it must not create a new battle or invent a new command ID for a retry of the same intent.
- Moving to a replacement device is not silent token export. The owner re-verifies the participant through the out-of-band roster contact, then uses the operator replace flow for that side and delivers the new capability to the replacement device. The prior generation is denied. The prior device should delete its local copy. If the replace response is lost after the server may have committed, stop: the procedure is BLOCKED until a verified current-generation readback path exists (see section 5).
- If the participant loses the token and the owner cannot authenticate the person through the agreed independent channel, access remains unavailable. A battle bearer alone cannot recover itself safely after loss.

## 3. Identity choices and recommendation boundary

| Option | What the server proves | Benefit | Limit |
| --- | --- | --- | --- |
| **A. Curated bearer pilot (recommended starting point)** | Caller possesses the active random capability for one battle and side. Operator separately checks the invitee over known channels before delivery. | Reuses the existing capability lifecycle, avoids building accounts, keeps A/B isolated, and is proportionate to two trusted people when both accept bearer-theft risk. | Worker cannot tell Керил from a thief holding B's token. Human delivery checks do not fix later token theft. Device recovery is operator-mediated. |
| **B. Passkey-bound person identity (stricter)** | Caller proves control of a registered passkey for the roster identity; Worker authorizes that identity for the assigned side, in addition to or instead of the bearer. | A copied bearer alone is insufficient if every request also requires a valid person-bound proof; supports explicit new-device reauthentication and auditable enrollment/revocation. | New identity/enrollment/session code, challenge storage, registration/recovery ceremony, device-loss policy, and dedicated security review/tests are required. Passkey recovery still depends on the authenticator's account/recovery model. |

**Recommendation:** Option A only for a controlled pilot where the owner accepts that a stolen active bearer is indistinguishable from its intended holder and can immediately revoke it. If that limit is unacceptable, do not invite B using bearer-only authentication; select Option B and implement it as its own reviewed atom first. A roster label such as `Keril`, a participant ID, IP address, CORS rule, or possession of an emailed link is not person authentication.

## 4. Trust boundaries and threat model

### Protected assets

- Battle state, unrevealed selections, participant-authored values, command receipts and event/outbox records.
- A and B's individual bearer capabilities, their digests, the encrypted create-recovery result, and recovery-key versions.
- `ADMIN_CONTROL_TOKEN`, which can create battles and revoke/replace participant capabilities.

### Boundaries and controls

1. **Participant browser -> gameplay Worker:** untrusted device and network. HTTPS protects transport in transit. The participant bearer is sent in an Authorization header, never query parameters. Worker maps token digest to a single battle, side, participant ID, active status, and generation.
2. **A browser vs B browser:** separate capabilities. A is not allowed to choose B's side by request input. Side/participant mismatch and stale generation must fail closed. A participant reads only the public view authorized for that participant.
3. **Operator -> admin API:** high-privilege server-to-server boundary. Keep `ADMIN_CONTROL_TOKEN` only in a protected operator secret store/server binding. Admin requests must be issued by a trusted operator process, not browser UI. CORS is not authentication and must not be treated as the security boundary.
4. **Worker -> gameplay D1:** private persistence boundary. D1 stores capability SHA-256 digests, not plaintext bearer values; creation recovery stores an AES-GCM encrypted result. Recovery keys remain server-side, versioned, and separately backed up under PA-05.
5. **Gameplay service vs telemetry:** separate resources and credentials. No battle state, bearer, player text, admin credential, invite roster, or gameplay recovery data may be sent to or stored in telemetry D1.
6. **Owner/operator human verification and delivery channel:** out-of-band trust dependency. A compromised or misidentified channel can deliver B's token to an attacker. The second-channel identity check reduces but cannot eliminate that risk.

### Explicit residual threats

A stolen capability, compromised participant device/origin, malicious same-origin script, operator account compromise, leaked admin/recovery secret, and an authorized operator intentionally misassigning B are not prevented by the bearer design. The Worker has no stable human identity registry or cryptographic binding to Керил. Browser IP, user-agent, CORS, display names, and a secret invite URL cannot repair this gap. Revoke/replace limits future use but cannot retract data already read or cancel a response already in flight.

## 5. API and lifecycle fit to current source

| Need | Existing mechanism | What it currently guarantees | Missing for this contract |
| --- | --- | --- | --- |
| Create the single battle | `POST /v1/admin/battles` in `gameplay-server/src/worker.js`; requires admin bearer and an `Idempotency-Key`. | Server builds authoritative initial state, mints separate random 256-bit capabilities, stores only their digests in capability records, and atomically records battle/genesis/outbox/idempotency state. Repeated identical creation intent can recover its original result; changed payload under the same key conflicts. | Owner roster, invite acceptance, person verification, and safe per-person delivery are manual/proposed. Admin route is not a browser invitation endpoint. |
| Join/read one battle | `GET /v1/battles/{battleId}`. | Active participant capability authorizes a participant-specific public view. | Remote client integration; current PR #449 harness is loopback-only. |
| Submit hidden move | `POST /v1/battles/{battleId}/commit`. | Worker takes actor/side from capability authorization, checks participant consistency and generation, and uses the authoritative lifecycle/CAS path. | Authenticated remote two-device tests and the final client flow. |
| Reveal | Existing lifecycle reveal transition, automatically attempted after both sides commit; scheduled recovery can complete committed battles. | Public reveal follows the server lifecycle when both commits exist; a participant cannot request the other side's submitted value before that gate. | Verify this invariant through exact-head remote synthetic tests before any acceptance claim. |
| Revoke one side | `POST /v1/admin/battles/{battleId}/capabilities/{A|B}/revoke`, admin bearer, body with `expectedGeneration`. | Guarded state transition marks capability revoked and increments generation; old bearer cannot authorize after the revocation linearizes. | Explicit operator identity, audit/alert path, and policy for emergency response. |
| Replace one side | Same path with `/replace`, `expectedGeneration`. | Guarded transition replaces the digest and increments generation. Fresh bearer is disclosed only in the successful replace response; old generation is invalidated. | Safe delivery to the re-verified person and documented lost-response handling. |
| Restore a lost create result | Same `POST /v1/admin/battles` and same persisted `Idempotency-Key` plus byte-equivalent semantic participant payload. | Existing encrypted creation-recovery record may return the original battle ID/deadline/tokens while that record remains eligible and decryptable. | Approved key custody/retention and a tested operator recovery path. |
| Recover from a lost replace response | No current read-only operator HTTP endpoint exists. | A successful replace may already have invalidated the old token and generated a new unknown bearer. Generation-guarded replace rejects stale expected generations, but does not reveal the current generation or recover the lost bearer. | **BLOCKED / STOP** until a verified readback mechanism is available. Do not retry replace with guessed/currently remembered generation or use an unreviewed privileged SQL path. |

**Hidden-move invariant:** each commit is accepted for only the caller's capability-derived side. The public result is not revealed until both commits have been accepted and the lifecycle transitions to the committed/revealed phase. The participant endpoint returns a view filtered for the authorized participant; no admin or browser shortcut may expose the other pending selection. Tests must prove A's first commit, B's first commit, retries, and concurrent first commits do not expose the opponent's uncommitted choice.

**Admin-key invariant:** `ADMIN_CONTROL_TOKEN` exists only in server/operator secret bindings. The browser never creates a battle, reads the admin secret, or calls an admin route. The operator tool sends server-to-server requests. Never add the key to HTML/JS, localStorage/IndexedDB, URLs, client-visible environment, GitHub, Notion, screenshots, or telemetry.

### Lost replace response: mandatory BLOCKED / STOP

The current Worker has generation-guarded `revoke` and `replace` operations, but it has **no read-only operator HTTP endpoint** to inspect the current capability generation/status. The comment in `mutateCapability` that says to inspect through trusted D1 administration describes an intended operator action; it is not a shipped endpoint, verified runbook, or approval to issue privileged SQL. The public admin API currently supports create, revoke, and replace, not readback.

If the `replace` response may have been lost after a successful server-side write, the operator cannot know from the existing API whether the old bearer is still active or which generation is current. Mark the recovery **BLOCKED / STOP**. Do not retry the request blindly, guess a generation, let either participant inspect operator state, or disclose the admin credential to a browser. Stop issuing access and do not claim recovery until one of the following future options is separately reviewed and available:

1. **Minimal-privilege operator readback endpoint (preferred implementation option):** add a non-browser, operator-authenticated, read-only route for one exact battle and side. It returns only the current generation and capability status, never a token, digest, recovery ciphertext, or unrelated participant data. Use a distinct restricted operator credential/scope if the platform boundary supports it; audit access without logging secrets; verify authorization, no mutation, fixed query scope, and failure behavior with tests and a security review. This endpoint does not currently exist and this spec does not authorize adding it.
2. **Formally approved emergency D1 read-only procedure (separate operational option):** only after the owner approves it under PA-03/07/08 and G3/G4, verify a genuinely read-only access method/credential, exact account and gameplay D1 identity, fixed SELECT-only query, operator identity, audit trail, and recovery runbook. Do not use an unreviewed `wrangler d1 execute`, broad write-capable credentials, guessed resource identifiers, or an improvised SQL workaround. This procedure is not currently approved or verified.

After a supported readback is used and reviewed, the operator may deliberately replace from the observed generation (thereby invalidating any unknown bearer) or revoke, then securely deliver any new token after re-verifying the participant. Until then, no retry and no recovery claim.

## 6. Two-device test matrix for the implementation stage

Run on a dedicated, separately authorized staging gameplay Worker/D1 only after PA-01..08 and gates G1-G3 are satisfied. Use synthetic identities and tokens; never real invitees for these tests. The matrix is a contract, not evidence that these tests have run.

| Case | Device/network action | Expected result |
| --- | --- | --- |
| T01 | A and B open the same battle ID on separate devices and networks, each with its own bearer. | Both read their authorized public view; neither sees credentials or raw private state. |
| T02 | A submits first while B has not committed. | A sees waiting/pending state only; B's hidden selection is absent. |
| T03 | B submits second. | Server transitions and reveals according to lifecycle; both see the same authoritative resolved state. |
| T04 | B token used against A side, wrong battle, wrong participant, or forged `side/actorId/role/version/now` fields. | 403/404 or schema rejection; no state change, receipt disclosure, or identity switch. |
| T05 | Copy A token into B's browser, then use A's token from a second browser. | It still acts as A if active. This is the documented bearer limitation; server cannot label the human. Alert/replace procedure is exercised, not an identity PASS. |
| T06 | Close Safari, reopen same device; reload page; background/foreground browser. | Designated-device storage restores only that side's token and reconnects. No second battle is created. |
| T07 | Drop network before request, during response, and after server commit but before response arrives. | Read reconnects. Same command intent reuses the same command ID/receipt and cannot double-apply. Ambiguous writes are read back before a new intent. |
| T08 | Submit the same commit command twice with same command ID/payload; then same ID with changed payload. | Identical retry returns stored receipt/idempotent outcome; changed fingerprint conflicts; no duplicate transition. |
| T09 | Lose B token; owner re-verifies B and replaces B capability at observed generation. | Old token denied; fresh token works only for B and that battle; A remains valid. |
| T10 | Replace B may have succeeded but its response is dropped. | With current code, recovery is **BLOCKED / STOP** because there is no read-only generation-inspection endpoint and no approved D1 readback procedure. Do not retry or guess. After a separately reviewed readback option exists, verify current generation/status and test a deliberate new replace or revoke; old B bearer must remain denied, and a fresh token must be disclosed only to the operator. |
| T11 | Deliver B's invite/token to a wrong address or simulate stolen bearer. | B must not be claimed as cryptographically identified. Owner stops and revokes/replaces; new delivery requires independent identity re-check. |
| T12 | Browser attempts `POST /v1/admin/battles` or capability revoke/replace, with/without Origin and guessed/missing admin token. | No admin action without server-side admin bearer; browser CORS/preflight does not grant authority; admin secret is absent from client and response. |
| T13 | One party loses network while the other commits; reconnect after the confirmation deadline. | Server-authoritative phase/deadline applies; no client clock can extend window or forge completion. |
| T14 | Return an error, malformed JSON, stale generation, or unknown capability. | Fail closed, no sensitive token/body echoed, no state mutation; operator can correlate with non-secret request ID only. |

## 7. PA-01..09 dependency and decision list

PR #448's `gameplay-server/PRIVATE_ALPHA_GATE.md` remains the owner-policy authority for the existing nine OPEN decisions. This spec narrows their relevance to the two-person pilot; it does not close, replace, or silently approve any gate.

| Gate | Relevance here | Recommended owner decision for this pilot | Status |
| --- | --- | --- | --- |
| PA-01 audience/trust | Who exactly may receive B's access; who may invite/revoke. | Exactly owner A and one named, owner-verified B; no self-service invites; name the accountable inviter. | OPEN |
| PA-02 identity/impersonation/device | Whether possession alone is sufficient and what device changes mean. | Accept Option A residual bearer risk only for the two trusted people; one designated device each; manual identity re-check for device replacement. Otherwise require passkeys first. | OPEN |
| PA-03 admin key custody | Who can create/revoke/replace, how current generation can be inspected after ambiguous replace, and where credentials live. | One named operator; server-side secret store only; separately approve a narrowly scoped readback endpoint or audited D1 read-only procedure; never expose admin key or operator credential to either browser. | OPEN |
| PA-04 token handoff/recovery | Individual delivery, lost token, compromised token, lost response. | E2E delivery plus second-channel verification; use generation-guarded revoke/replace; no blind retry after an ambiguous replace. | OPEN |
| PA-05 recovery keyring | Whether encrypted create recovery can be restored. | Name custodians, protected backup location, decrypt-only prior versions, and verify restore before staging. No key values in this document. | OPEN |
| PA-06 data retention | How long battle data, receipts, outbox, digests, tombstones, backups, and logs persist. | Owner must set explicit periods/purges after inventory. This spec sets **no** duration. | OPEN |
| PA-07 staging/deploy permissions | Whether a dedicated Worker/D1 may be created and changed. | Separate explicit authorization naming account, resources, permitted operations, and cleanup; never telemetry D1. | OPEN |
| PA-08 backup/recovery/stop authority | Who restores, verifies, disables, reads back generation after lost replace response, and can stop. | Name restore owner and independent witness; require protected export plus isolated restore proof; formally approve any emergency read-only D1 method; lost replace response without verified readback means BLOCKED / STOP. | OPEN |
| PA-09 browser/release acceptance | What proves remote access works for humans and does not leak hidden moves. | Remote synthetic matrix first, then owner-run Safari and desktop acceptance; later release also depends on Chat05 outcome-recognition gate. | OPEN |

The minimum owner answers before a later staging request are: (1) accept bearer-only identity risk or require passkeys, (2) approve the invitee verification and delivery procedure, (3) name operator/admin-secret custody, (4) approve device-local token persistence and cross-device replacement behavior, (5) assign recovery-key/backup/restore roles, (6) set retention/deletion rules, (7) separately authorize exact dedicated staging resources and operations, and (8) name browser acceptance and STOP owners. These decisions are distinct from permission to deploy or invite a real person.

## 8. Next narrow implementation atom after contract approval

**First atom:** `CHAT03-TWO-PERSON-REMOTE-CLIENT-TRANSPORT` (new scoped PR after owner decisions).

Implement only the participant-facing remote transport over the existing API: explicitly configured HTTPS Worker origin, one battle ID plus that device's one participant capability, safe same-device persistence and local deletion, reload/network reconnect, and idempotent retry of an ambiguous commit. The client must have no admin credential, admin route, public signup, invite roster, or third-player flow. Preserve the existing loopback harness as a development fixture. Add synthetic tests for A/B side isolation, wrong-battle/side attempts, hidden first commit, reload, network interruption, duplicate command, stale/revoked capability, and absence of admin material. Do not deploy or change SQL.

The owner must first approve Option A or B, the token-storage risk and replacement flow, and the exact intended client origin/CSP policy. The current browser client cannot call a remote Worker; this is the smallest code atom that turns the existing API into a two-device participant connection without mixing in account enrollment.

**Follow-on operator atoms:** (a) implement and security-review a minimally privileged read-only generation/status endpoint, or obtain formal owner approval and independently verify an emergency read-only D1 procedure; neither exists as an approved recovery path today. Until one is available, lost replace responses remain BLOCKED / STOP. (b) separately document/implement a server-only owner invitation and per-person handoff command using the existing admin create/idempotency API. Neither atom may run in the participant browser; review against PA-03..08 before use.

Any staging creation, migration, deployment, or real-person invitation requires its own explicit authorization and the applicable PA gates. Do not use telemetry D1; do not touch Stage 7.15, Chat04, Chat05, or PR #449.

## 9. Non-approval and acceptance boundary

This spec is a proposed contract, not accepted policy. PR #448's PA decisions remain OPEN. No Cloudflare Worker/D1 was inspected or changed, no hosted or staging resource was created, no real user was invited, and no gameplay Worker, SQL, CSP, token implementation, UI, telemetry, or Stage 7.15/Chat04/Chat05 code was changed. A documentation PR, local CI, or PR #449's local Safari PASS cannot be called remote multiplayer, production authentication, or private-alpha acceptance.
