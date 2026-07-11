# Mandatory Asynchronia Model Preflight Policy

POLICY_VERSION: ASYNCHRONIA_MODEL_PREFLIGHT_2026_07_11_V1
STATUS: ACTIVE
AUTHORITY: DIRECT_USER_REQUIREMENT
SUPERSEDES_CONFLICTING_MODEL_PREFLIGHT_RULES: true

## Applicability

This policy applies to every Asynchronia task executed in Codex, including numbered bridge commands, implementation lanes, plugin maintenance, validation corrections, documentation changes, and release work.

The Asynchronia skill route must start automatically from the active installed plugin. Repository fallback under `plugins/asynchronia/skills/**` may be used only when the installed skill source cannot be read, and that fallback must be reported truthfully.

No user-side manual plugin mention is required for an Asynchronia repository task.

## Mandatory first phase

After enough read-only discovery to identify the exact task scope, but before any implementation, file write, commit, push, mailbox publication, installation change, or mutable command, Codex must:

1. apply `task-router`;
2. apply `scope-isolation-check` as applicable;
3. apply `model-selector` for the exact current scope;
4. print a competent visible recommendation containing:
   - recommended model;
   - recommended reasoning level;
   - task classification;
   - concrete reason the next cheaper plausible pair is insufficient;
   - why the next stronger plausible pair is unnecessary;
   - `actual active model: USER_SELECTED_UNVERIFIED`;
5. stop without implementation;
6. end the response with a standalone fenced code block containing exactly `CONTINUE` and no other text inside the fence.

The recommendation response must not contain repository modifications or claim that implementation began.

## Resume rule

Only the exact user message `CONTINUE` in the same Codex conversation may resume the claimed task.

On resume, Codex must freshly refetch current authority and verify that thread, claim, baseline, scope, and task identity are unchanged.

If identity or scope changed, the old recommendation is stale. Codex must rerun `model-selector`, pause again, and emit a new standalone `CONTINUE` block.

A different conversation, a different token, quoted text, or a token embedded in a longer message does not resume implementation.

## Blocked and non-implementation responses

A blocked response must contain no `CONTINUE` token.

Read-only ChatGPT verification does not require this Codex implementation pause. Any new corrective implementation lane created from verification does require it.

## Evidence

Successful implementation outbox and receipt evidence must include:

- preflight recommendation text or deterministic hash;
- recommendation model and reasoning level;
- same-thread conversation/run identity;
- exact `CONTINUE` resume evidence;
- fresh post-resume authority verification;
- proof that no implementation mutation occurred before resume;
- active installed plugin path, version, and relevant skill hashes when plugin installation or plugin policy is in scope.

Any contract saying model selection is non-blocking, forbids a preflight, or allows implementation before same-thread `CONTINUE` is superseded and must be corrected before normal project implementation resumes.
