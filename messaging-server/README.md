# Messaging server contract module

This directory currently contains a pure, dependency-free contract module for creating public text-message requests and validating server-shaped acknowledgements.

The module contract accepts ordinary JSON values after the HTTP request body has been safely parsed. It does not promise safe handling of arbitrary JavaScript objects with getters or proxies. A future HTTP adapter must safely parse requests, enforce a request-body size limit, and handle network and parsing errors at the transport boundary.

Run its offline Node tests with:

```sh
node --test --test-isolation=none --test-reporter=tap messaging-server/test/message-contract.test.mjs
node --check messaging-server/src/message-contract.mjs
node --check messaging-server/test/message-contract.test.mjs
```

## Scope and security boundary

The functions check request shape, allowed message type and fields, text length, operation-key syntax, message structure, and canonical serialization. They reject client-supplied authorship, session/authorization fields, and system or domain-event spoofing fields. The message formatter takes `authorActorId`, display name, timestamp, and `messageId` as server-side inputs; it does not establish that those inputs are trusted.

`actorId` represents stable identity while `authorDisplayName` may change. `messageId` is the message entity ID and is distinct from `battleId`, `voteId`, and `eventId`. `clientOperationId` identifies an attempted operation only; it grants no authority. Canonicalization provides a deterministic representation that a future server may compare for idempotency conflicts.

These pure functions do **not** authenticate a server session, authorize a conversation, persist messages, allocate globally unique IDs, provide durable idempotency/deduplication, rate-limit, or expose an HTTP API. A real server and its storage must bind authorship to the authenticated session and atomically return the original acknowledgement for a repeated operation key, rejecting key reuse with different canonical content. No battle database or Cloudflare dependency is present.
