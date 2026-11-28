# Asynchronia Repository Policy

ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN
DIRECT_TASK_WRITES_TO_MAIN: FORBIDDEN
LOCAL_WORKTREE_SAFETY: CONDITIONAL

## GitHub-only workflow

- Ordinary work starts from the current fetched `main` on an isolated remote GitHub branch.
- A local/Codex worktree is optional execution infrastructure and is not required for ordinary work.
- Changes enter `main` only through a reviewed pull request.
- Required GitHub checks and independent review must pass for the exact PR head. Merge is owner-only.
- Preserve unrelated or concurrent work; never reset, clean, stash, force-push or rewrite history without explicit authorization.
- Runtime changes require source/deployed mirror checks and remain subject to user-owned Safari acceptance.

## Project identity and roles

- Project: Asynchronia; legacy repository paths may use `AsyncScene`.
- Architecture: static HTML and JavaScript.
- The owner decides product policy, grants approval for sensitive operations, owns merge and decides user acceptance.
- ChatGPT provides technical leadership. It sets architecture and technical priorities, coordinates scope and integration order, and routes independent review.
- Claude Code and Codex are peer implementers. Either can implement and validate an authorized atomic task under the same scope, safety and review rules.
- GitHub is current authority for implementation, refs, tasks and ownership. The canonical Notion page ASYNCHRONIA - PROJECT MEMORY is product authority. Fetch it during the task, report the top-level MEMORY_REV and identify any conflict with current repository evidence.

## Mandatory context

Before planning or editing, read `AGENTS.override.md`, `AGENTS.md`, `TASKS.md`, `PROJECT_MEMORY.md` and applicable path rules. Inspect exact target files and the current Git status/diff. Distinguish authorized task changes from pre-existing or concurrent work. Follow `ORCHESTRATION.md` for risk, review and evidence requirements.

## Scope isolation

Every task has one atomic goal, baseline, branch, read scope, write scope, stable-read dependencies, validation commands and stop conditions. If local execution is used, it additionally has one disclosed worktree. Confirm write ownership and locks before edits, including stable reads and shared dependencies. Use an atomic reservation where required and verify the current state before transfer or publication. Overlapping writes, runtime mirrors, shared wiring, migrations and shared contracts require serialization. Do not mix UI, logic or unrelated cleanup.

## Canonical mechanics

- Argument families are ABOUT, WHO, WHERE and YN; WHERE and YN use `там, где {PLACE}` and YN forbids `здесь`.
- Participation is `+1 REP / -1 point`; majority is `+2 REP / +1 point`; minority is `-2 REP / +0 points`.
- The loser pays rematch cost; rematch does not change REP.
- `moneyLog`, or its current equivalent ledger, is authoritative and every transfer records source, receiver, amount, reason and related event.
- Millennial is base UI; Zoomer and Alpha are text-only derivatives and cannot add runtime logic or economy rules.

## Economy, canon and mirrors

No silent or untraceable economy deltas, duplicate settlements, lost remainders or invalid refunds. Accepted canon outranks stale plans. Source and deployed counterparts are one mirror-ownership group; byte, semantic, wiring and deployment evidence are separate. Runtime acceptance remains user-controlled.

## Owner decisions carried forward

- **R292.** Chat03 is the sole responsible integrator for shared game-server modules. Shared writes require verified ownership, locks and handoffs, independent critical review and the applicable separate owner authorization.
- **R293.** Preserve game events and consequences after account deletion. Erase or properly anonymize personal data and prevent a new account from resetting those consequences. Retention, erasure and restore designs need their own approval.
- **R294.** A public battle can expose confirmed game names and outcomes, public voting outcome and safe editorial text. Keep mechanical and public outcomes distinct. A draw has no winner. Keep individual votes, hidden tactics, messages, internal identifiers and private evidence confidential. Restrict nonpublic battles to authorized recipients. Publish only server-confirmed, allowed fields.
- **R295.** NPC knowledge distinguishes confirmed fact, received rumor and confirmed utterance. Preserve authorized provenance and separate relay receipts, record subsequent confirmation separately, deduplicate effects per NPC and event and preserve existing fixtures and snapshots. Rumors and utterances do not change numeric reputation in the first slice. An authorized confirmed outcome may affect NPC attitude under its policy.
- **R296.** Chat04.5 may edit the short in-feed and expanded narrative in the selected communication style. Keep mechanical outcome, social support and recognized result distinct. Use recorded facts and the R294 projection when writing consequences and narrative.
- **R297.** Preserve approved sticker `046-0004`, its original asset and ID. Public chat and direct-message use remains subject to delivery authorization, abuse moderation, documented distribution rights and applicable age and platform requirements.
- **R298.** Removing dependence on a particular Mac is open. Preserve the authorized read-only recovery process for original 08B V127 and verify any owner-private checkpoint by raw bytes. Demonstrate recovery, reproducible tests, native D1 and independent review on approved infrastructure without that Mac before closing this gate.
- **R302.** Read the applicable Social Loop Risk Register entries when designing, reviewing or accepting affected work. Record controls, evidence and residual risk in the existing report when materially changed.
- **R56.** Dispatch remains `UNKNOWN` pending authoritative resolution. Leave the request and any overlapping scope reserved. A generic review receipt does not close the task. Do not resend it or claim it ran.

## Ordinary routing

Use GPT-6.2 Sol at Medium for ordinary development. Raise its reasoning effort to High for complex or high-risk decisions. Use GPT-6.2 Astra at High only for unusually difficult work and only when it appears in the current Codex model catalog. Either implementer follows the shared repository policy and risk-based independent review requirements in `ORCHESTRATION.md`. Ordinary work requires no user-operated selector handshake.

## Parallel work

Handle small tasks directly. Delegate substantial, independent routine research, test execution, or large-log analysis to the existing Luna Low roles only when that saves time or resources; do not spawn an agent for every small task. Keep no more than two subagents active per session. Serialize shared registries, boot wiring, smoke exports, runtime mirrors and documentation ownership. Do not merge, rebase or absorb another lane without an explicit integration task.

Subagents inherit the parent session's permission mode. A `sandbox_mode` entry in an agent TOML does not create a separate sandbox. Select and verify `tester-read-only-loopback` as the effective parent profile before spawning `tester`; it keeps the repository read-only, allows temporary output under `$TMPDIR` and `/tmp`, and permits only the allowlisted loopback hosts. Check whether a loaded legacy `sandbox_mode` setting prevents named profiles from taking effect. Use the `:read-only` parent profile for review agents and verify it is effective. If a required profile cannot be selected, or a check requires repository writes or broader network access, stop and report that requirement rather than assuming or widening permissions.

## Safety and acceptance

Verify effective hooks and publishers before local execution or publication. Stop the affected lane if private evidence could be published by an active hook or publisher. Keep credentials, personal data, raw logs and protected checkpoints out of public artifacts. Use approved owner-private storage and verify raw bytes, identity and access for required recovery evidence.

Production, infrastructure access, credentials, billing, paid automation, deployments and destructive or privileged changes require separate explicit owner authorization for the exact operation. Scope, ownership, review and recovery requirements continue to apply.

Record the evidence separately for static checks, GitHub publication, deployment readiness and Safari acceptance. The owner provides required runtime evidence and decides final acceptance.
