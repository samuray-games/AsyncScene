# Asynchronia Repository Policy

ROOT_CAUSE_SYNC: REQUIRED
NO_OP_COMPLETION: FORBIDDEN
DIRECT_TASK_WRITES_TO_MAIN: FORBIDDEN
WORKTREE_LIFECYCLE: REQUIRED

## GitHub-only workflow

- Ordinary work starts from the current fetched `main` on a dedicated branch.
- Changes enter `main` only through a reviewed pull request.
- Required GitHub checks must pass before merge.
- Preserve unrelated or concurrent work; never reset, clean, stash, force-push or rewrite history without explicit authorization.
- Runtime changes require source/deployed mirror checks and remain subject to user-owned Safari acceptance.

## Project identity and roles

- Project: Asynchronia; legacy repository paths may use `AsyncScene`.
- Architecture: static HTML and JavaScript.
- Codex implements isolated changes and static validation.
- ChatGPT coordinates tasks and review.
- Codex must not claim user runtime acceptance.

## Mandatory context

Before planning or editing, read `AGENTS.md`, `TASKS.md`, `PROJECT_MEMORY.md`, inspect exact target files, check Git status/diff, and distinguish task-owned from unrelated changes.

## Scope isolation

Every task has one atomic goal, baseline, branch/worktree, read scope, write scope, stable-read dependencies, validation commands and stop conditions. Overlapping writes, runtime mirrors and shared wiring require serialization. Do not mix UI, logic or unrelated cleanup.

## Canonical mechanics

- Argument families are ABOUT, WHO, WHERE and YN; WHERE and YN use `там, где {PLACE}` and YN forbids `здесь`.
- Participation is `+1 REP / -1 point`; majority is `+2 REP / +1 point`; minority is `-2 REP / +0 points`.
- The loser pays rematch cost; rematch does not change REP.
- `moneyLog`, or its current equivalent ledger, is authoritative and every transfer records source, receiver, amount, reason and related event.
- Millennial is base UI; Zoomer and Alpha are text-only derivatives and cannot add runtime logic or economy rules.

## Economy, canon and mirrors

No silent or untraceable economy deltas, duplicate settlements, lost remainders or invalid refunds. Accepted canon outranks stale plans. Source and deployed counterparts are one mirror-ownership group; byte, semantic, wiring and deployment evidence are separate. Runtime acceptance remains user-controlled.

## Ordinary routing

Configured Codex agent-team/model routing is the ordinary mechanism. No user-operated selector handshake or special continuation command is required for ordinary work.

## Parallel work

Use the configured scope-planning mechanism when multiple tasks exist. Serialize shared registries, boot wiring, smoke exports, runtime mirrors and documentation ownership. Do not merge, rebase or absorb another lane without an explicit integration task.

## Acceptance

Static checks, GitHub publication, deployment readiness and Safari acceptance are separate truth levels. A passing build or push is never Safari acceptance.
