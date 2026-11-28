# Чат09Б V129 - CANCEL / anti-farm / terminal compatibility bridge

ATOM: CHAT09B-V129-CANCEL-ANTIFARM-TERMINAL-COMPAT

This is an **isolated, offline, proposed adapter contract**, not real 05C, real issuer, D1, ledger, Worker, PR, integration or production runtime. V128 original bytes remain intact in its own private Drive archive. The exact original V128 fixture module and tests live unchanged under `vendor/v128/`. Root `product-model.mjs` is a NEW V129 strict entrypoint; it never exports the legacy synthetic termination function. DO NOT import `vendor/v128/product-model.mjs` into gameplay or any trusted consumer.

## Strict consumer entry point

`import {initial, clone, step, applyCommitted05CTerminal} from './product-model.mjs'`

* `step(s,command)`: nonterminal synthetic fixture actions work; `FINAL` and `CANCEL` always deny with `DENY_VERIFIED_05C_REQUIRED`. A client-supplied `trustedFinalReceipt` or `trustedTerminalReceipt` is never a verified terminal.
* `await applyCommitted05CTerminal(state, request, {readCommittedTerminal})` accepts only the result of a **server-owned** callback. It cannot authenticate that callback or check live 05C: the integration owner must supply an immutable, authorized 05C lookup, not an API argument, client JSON, or a fake `verified` boolean. Missing / throwing / uncommitted callback returns a denial and preserves state.
* `request` is `{battleId, terminalReceiptId, terminalKind:'TERMINAL_FINAL'|'TERMINAL_CANCELLED', pairAttemptId, participants:[{participantId,personId,generation},...]}`. Two distinct participants and person IDs, exact integer reservation generations, order-independent.
* The active state must carry authoritative prebound `battle.tenantId`, `battle.pairAttemptId`, `battle.participants` and `battle.people` mapped to the same two person/generations, plus the exact single `history.pairAttempts` record. This is an **unimplemented 09A/admission binding** in production. Fixture tests add it explicitly. Missing/stale binding => STOP, not inference from a stranger's receipt.
* Authorized `readCommittedTerminal({tenantId,battleId,terminalReceiptId})` must return a uniquely committed, issuer-checked 05C terminal fact with `sourceSystem:'05C'`, `committed:true`, `uniqueTerminal:true`, `issuerId`, `sourceEventId`, `commitFence`, exact `tenantId`,`battleId`,`terminalReceiptId`,`terminalKind`,`pairAttemptId`, and the exact two `participants` with person generations. All identifiers/fences are cross-checks. **Their appearance in an object is NOT issuer verification**.
* For cancellation require `combatResult:'NO_COMBAT_RESULT'`, `rewardDisposition:'NO_REWARD'`, `settlementIntent:null`. No results or rewards are written. Only the two exact active occupied generations are released after lookup; history/pair attempts/cooldowns/newcomer/anti-farm/ledger remain byte-semantically identical. Client timeouts/logouts never release.
* Terminal replay re-reads the 05C committed fact: same immutable receipt/fence => `REUSED`, changed receipt/contradictory kind => conflict, without extra release. Foreign B2 command, receipt, person, participant, attempt, stale generation, third occupant, or failed resolver => no mutation. Concurrent B1/B2 tests are independent in-memory states; no claim of global durable CAS.

## Current limits

This module does not implement 05C unique terminal CAS / `battle.finalized` issuer / receipt ACK / native D1 / rollback witness / 09A person-wide locks. The callback is mocked by in-memory fixtures in tests and must be replaced with a real privately authenticated lookup by a separately authorized integrator. V128 36/36 tests remain valid *for V128 synthetic module*, whereas V129 strict entry intentionally denies direct synthetic termination. No independent critical reviewer has approved this code.

## Reproduce

```sh
node --check product-model.mjs
node --check terminal-bridge.mjs
node --check terminal-bridge.test.mjs
node --test vendor/v128/acceptance.test.mjs vendor/v128/binding-regression.test.mjs vendor/v128/baseline-v127-repro.test.mjs terminal-bridge.test.mjs
```

V128 tests import the unchanged vendored V128 `vendor/v128/product-model.mjs`; V129 tests import the strict root `product-model.mjs`. Distinguish the two modes in all evidence.
