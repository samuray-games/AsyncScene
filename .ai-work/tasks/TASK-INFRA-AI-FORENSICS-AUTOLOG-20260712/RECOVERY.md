TASK_ID: TASK-INFRA-AI-FORENSICS-AUTOLOG-20260712
RECOVERY_VERSION: 1.0.0
STATUS: READY_FOR_SAME_THREAD_CODEX_RECOVERY
CREATED_AT: 2026-07-12T22:32:00+09:00
AUTHOR_ROLE: CHATGPT_ONLY_CONTENT_AUTHORSHIP_WITH_REPOSITORY_EVIDENCE
SOURCE_RESULT: CODEX_LOCAL_IMPLEMENTATION_BLOCKED_BEFORE_COMMIT_BY_UNRELATED_HISTORICAL_VALIDATOR_FAILURE

## Established facts

- Codex completed the mandatory model inventory preflight and evaluated `29/29` model-effort pairs.
- The user selected the recommended `gpt-5.4` with `high` effort and supplied the required same-thread `CONTINUE`.
- Codex implemented the AI forensics stack locally in `/private/tmp/AsyncScene_forensics_r2.Jr5kdB`.
- Codex made no implementation commit, remote push, forensic package publication, or Issue `#224` comment.
- All AI forensics-specific tests and self-tests reported PASS.
- The only reported blocker was `python3 tools/validate_ai_work_pipeline.py` failing on the already closed historical task `TASK-INFRA-MODEL-SELECTOR-LIVE-CATALOG-20260712`.
- Repository inspection proved that the closed task uses immutable terminal status `FINAL_MAIN_AND_MEMORY_SYNC_COMPLETE`, an external immutable commit identity as `CURRENT_ARTIFACT`, and older phase heading structure.
- The validator and tests were corrected on the Work branch so immutable terminal records are not reinterpreted under a newer active-task schema.

## Recovery authorization

This recovery is authorized only in the same Codex thread that already completed model preflight and received exact `CONTINUE`.

- Do not run another model preflight.
- Do not request another `CONTINUE`.
- Do not invoke or reference the removed safety directive.
- Do not discard, clean, reset, overwrite, or delete `/private/tmp/AsyncScene_forensics_r2.Jr5kdB` before the local implementation has been preserved.
- Do not resume from the old detached baseline directly because the remote implementation branch now contains the validator lifecycle correction.

## Exact recovery procedure

1. Fetch exactly:
   - `origin/main`
   - `origin/work/ai-forensics-autolog-20260712`
   - `origin/infra/ai-forensics-autolog-20260712`
   - `origin/forensics/ai-runs`
2. Prove fetched `origin/infra/ai-forensics-autolog-20260712` equals the exact recovery head supplied in the ChatGPT launch message.
3. Read this file, `03-codex-task-r2.md`, and current `STATE.md` from that fetched head with `git show`.
4. Verify the fetched head contains the terminal-record validator correction and its regression tests.
5. In the old local worktree, preserve only the AI forensics implementation delta. Exclude:
   - `tools/validate_ai_work_pipeline.py`
   - `tools/test_validate_ai_work_pipeline.py`
   - `.ai-work/tasks/TASK-INFRA-AI-FORENSICS-AUTOLOG-20260712/STATE.md`
   - `.ai-work/tasks/TASK-INFRA-AI-FORENSICS-AUTOLOG-20260712/04-review-report.md`
6. A safe preservation method is:
   - run `git add -N` only for the allowed implementation paths listed below;
   - create one binary patch with `git diff --binary -- <allowed implementation paths>`;
   - verify the patch contains no excluded or forbidden path.
7. Create a new isolated clean worktree at the exact fetched recovery head.
8. Apply the preserved implementation patch only in the new worktree.
9. Recreate `04-review-report.md` from current evidence and update `STATE.md` only after all validations and publication smoke finish.
10. Verify the complete diff contains only the allowed implementation paths plus the two task status/report files.
11. Run every validation command from `03-codex-task-r2.md`, including `python3 tools/validate_ai_work_pipeline.py`.
12. If all validations pass, commit the implementation, push fast-forward to `infra/ai-forensics-autolog-20260712`, refetch, and prove the remote head.
13. Run the controlled synthetic publication smoke, verify immutable package readback on `forensics/ai-runs`, and add the approved Issue `#224` index comment only after remote package verification.
14. Set the task only to `READY_FOR_REVIEW`, never `ACCEPTED`.
15. Return the full required report, including `/hooks` trust-review handoff.

## Allowed implementation paths to preserve

- `.codex/hooks.json`
- `.ai-forensics/**`
- `tools/ai_forensics/**`
- `tools/test_ai_forensics.py`
- `.github/workflows/ai-forensics-evidence.yml`
- `.ai-memory/WORKFLOWS.md`

After validation, Codex may also write only:

- `.ai-work/tasks/TASK-INFRA-AI-FORENSICS-AUTOLOG-20260712/04-review-report.md`
- `.ai-work/tasks/TASK-INFRA-AI-FORENSICS-AUTOLOG-20260712/STATE.md`

## Forbidden recovery behavior

- No `.ai-bridge/**` access or mutation.
- No bridge ref, reset, routing, claim, inbox, outbox, receipt, or canary work.
- No Stage 6 continuation.
- No game, runtime, UI, economy, persistence, deployment mirror, or `main` mutation.
- No force push, destructive reset, repository clean, broad stash, or deletion of the old worktree before successful remote verification.
- No publication of raw transcripts, secrets, tokens, credentials, cookies, private keys, `.env` values, authorization headers, or private user paths.
- No waiver of a failing validator. A failure must be fixed within authority or reported as a blocker.

## Stop conditions

Stop and report the exact blocker if:

- the old worktree no longer exists or its implementation delta cannot be preserved exactly;
- the fetched recovery head does not equal the ChatGPT-supplied SHA;
- the recovered diff contains an unauthorized path;
- the terminal-record validator regression test fails;
- any required validator or AI forensics test fails;
- publication requires force push or uncertain redaction;
- remote package or Issue index verification fails.
