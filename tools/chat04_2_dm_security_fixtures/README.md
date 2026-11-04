# Chat04.2 isolated DM security scenario fixtures

This directory contains a deterministic, declarative catalog for the previously approved DM-01..DM-24 scenarios. It uses only synthetic actor, session, message, and conversation labels.

## Run

```sh
node --test tools/chat04_2_dm_security_fixtures/test/scenario-catalog.test.mjs
```

## What a passing check means

`ISOLATED_FIXTURE_PASS` means the catalog contains all 24 scenarios, has stable synthetic identities, includes expected outcomes and failure conditions, covers the required categories, and labels every server-dependent scenario `BLOCKED_NOT_EXECUTABLE`.

The tests do not create a messaging backend, make network calls, simulate persistence, or execute ACL, delivery, retry, notification, cursor, or UI behavior. Therefore they do not establish DM privacy, authorization, delivery, persistence, Safari, desktop, or runtime acceptance. The catalog is ready to be bound to a future real server adapter, but no such adapter exists in this package.

## Server-dependent status

All scenarios DM-01..DM-24 remain `BLOCKED_NOT_EXECUTABLE` in this package. DM-23 requires future shared UI integration. DM-24 requires a real server and separate iPhone Safari and desktop evidence. No integration status is green merely because catalog self-checks pass.

## Scope

No server, authentication, storage, D1, shared UI, renderer, composer, or public-message contract is implemented here. No real user data, session tokens, credentials, or private message text are included.
