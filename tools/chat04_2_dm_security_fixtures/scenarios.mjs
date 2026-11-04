/**
 * Chat04.2 security scenario catalog. This is a declarative test plan only.
 * There is intentionally no transport, store, backend, or simulated message service.
 */

export const ACTORS = Object.freeze({
  A: Object.freeze({ actorId: 'actor_A', sessionId: 'session_A', role: 'sender' }),
  B: Object.freeze({ actorId: 'actor_B', sessionId: 'session_B', role: 'recipient' }),
  C: Object.freeze({ actorId: 'actor_C', sessionId: 'session_C', role: 'outsider' }),
});

export const FIXTURE_IDS = Object.freeze({
  conversationAB: 'conv_AB',
  privateMessageAB: 'msg_AB_01',
  privateSentinel: 'PRIVATE_AB_SENTINEL_01',
  publicMessageA: 'msg_PUBLIC_01',
});

const blocked = 'BLOCKED_NOT_EXECUTABLE';

/**
 * expectedAssertions describe what a future real adapter must demonstrate.
 * `executionStatus` is deliberately blocked until that adapter exists.
 */
export const SCENARIOS = Object.freeze([
  { id: 'DM-01', group: 'membership', executionStatus: blocked, actors: ['A', 'B'], action: 'A sends B a DM; A and B read the conversation.', expectedAssertions: ['one canonical conversation', 'one stable messageId', 'server-derived author is A', 'A and B can read the permitted message'], failWhen: ['duplicate message entities', 'client-selected authorship', 'either participant cannot read the permitted message'] },
  { id: 'DM-02', group: 'membership', executionStatus: blocked, actors: ['A', 'B', 'C'], action: 'A and B open feed and DM views; C opens the public feed.', expectedAssertions: ['A and B see the same messageId in both permitted views', 'C sees public control data only'], failWhen: ['a second ID is created for the DM', 'C receives any DM trace'] },
  { id: 'DM-03', group: 'known-id-access', executionStatus: blocked, actors: ['C'], action: 'C requests the known private messageId directly.', expectedAssertions: ['deny without message content or private fields', 'response does not reveal whether the message exists'], failWhen: ['content, actors, timestamp, revision, or existence signal is returned'] },
  { id: 'DM-04', group: 'known-id-access', executionStatus: blocked, actors: ['C'], action: 'C requests the known conversationId and its messages.', expectedAssertions: ['deny without participants, counts, IDs, or partial history'], failWhen: ['any conversation data or existence signal is returned'] },
  { id: 'DM-05', group: 'known-id-access', executionStatus: blocked, actors: ['C'], action: 'C requests edits, revisions, or alternate representations of the known private message.', expectedAssertions: ['every read route enforces the same membership check'], failWhen: ['an alternate route returns private content or metadata'] },
  { id: 'DM-06', group: 'identity-spoofing', executionStatus: blocked, actors: ['A', 'B'], action: 'A submits senderId or authorActorId claiming to be B.', expectedAssertions: ['client-supplied authorship is rejected or ignored', 'stored author remains server-bound to A'], failWhen: ['message is attributed to B'] },
  { id: 'DM-07', group: 'identity-spoofing', executionStatus: blocked, actors: ['A', 'B', 'C'], action: 'A changes a nickname, supplies another conversationId, or alters recipient fields.', expectedAssertions: ['authorization uses trusted actor identity and authorized conversation membership', 'nickname alone grants no rights'], failWhen: ['request reaches another pair or changes authenticated identity'] },
  { id: 'DM-08', group: 'session-revocation', executionStatus: blocked, actors: ['A'], action: 'Read and send with missing, invalid, or revoked session; include revocation racing with persistence.', expectedAssertions: ['no private response or unauthorized durable write', 'session validity is checked at the protected server boundary'], failWhen: ['revoked or invalid session reads private data or commits a message'] },
  { id: 'DM-09', group: 'blocking', executionStatus: blocked, actors: ['A', 'B'], action: 'B blocks A; A attempts a new DM to B.', expectedAssertions: ['server denies send', 'no message, receipt, or recipient notification is created'], failWhen: ['new message is stored or delivered'] },
  { id: 'DM-10', group: 'blocking', executionStatus: blocked, actors: ['A', 'B', 'C'], action: 'After B blocks A, A and B read existing history and C probes it.', expectedAssertions: ['existing authorized history is not silently deleted', 'C remains denied'], failWhen: ['history is silently lost or exposed to C'] },
  { id: 'DM-11', group: 'blocking-race', executionStatus: blocked, actors: ['A', 'B'], action: 'Race A-to-B send against B blocking A.', expectedAssertions: ['authoritative serialization decides order', 'sends after block takes effect are denied'], failWhen: ['a post-block send succeeds or result depends only on UI timing'] },
  { id: 'DM-12', group: 'idempotency', executionStatus: blocked, actors: ['A', 'B'], action: 'A retries the same operationId and same content after losing the first response.', expectedAssertions: ['original receipt and messageId are returned', 'one durable message and one logical delivery'], failWhen: ['a second messageId, message, or new-message notification appears'] },
  { id: 'DM-13', group: 'concurrent-send', executionStatus: blocked, actors: ['A', 'B'], action: 'Two A devices concurrently submit the same operation.', expectedAssertions: ['one canonical operation wins', 'both valid acknowledgements reference its result'], failWhen: ['duplicate durable records or divergent IDs appear'] },
  { id: 'DM-14', group: 'operation-key-misuse', executionStatus: blocked, actors: ['A', 'B'], action: 'A reuses an existing operationId with changed text.', expectedAssertions: ['explicit conflict', 'original stored message is unchanged'], failWhen: ['content is overwritten or another message is created'] },
  { id: 'DM-15', group: 'operation-key-misuse', executionStatus: blocked, actors: ['A', 'B', 'C'], action: 'A reuses an operationId with a different recipient; C tries A’s operationId.', expectedAssertions: ['recipient and channel participate in canonical comparison', 'C cannot obtain A’s receipt or authority'], failWhen: ['operation is redirected or another actor gets a private receipt'] },
  { id: 'DM-16', group: 'history-reload', executionStatus: blocked, actors: ['A', 'B', 'C'], action: 'A and B reload and reopen their permitted views; C reopens its own view.', expectedAssertions: ['same conversationId, messageId, content, and authoritative order persist', 'C remains denied'], failWhen: ['history vanishes, duplicates, changes identity, or leaks to C'] },
  { id: 'DM-17', group: 'history-cursor', executionStatus: blocked, actors: ['A', 'B', 'C'], action: 'A/B resume history sync with cursors after reconnect; attempt a cursor from another actor.', expectedAssertions: ['authorized history resumes without duplicates', 'cursor does not grant authority'], failWhen: ['authorized records are lost/duplicated or another conversation is exposed'] },
  { id: 'DM-18', group: 'account-switch-cache', executionStatus: blocked, actors: ['A', 'C'], action: 'A signs out on a device and C signs in on that device.', expectedAssertions: ['C receives only C-authorized server data', 'A private cache, previews, and unread state are cleared or isolated'], failWhen: ['C sees A’s private history or stale account state'] },
  { id: 'DM-19', group: 'metadata-privacy', executionStatus: blocked, actors: ['A', 'B', 'C'], action: 'Compare C’s list, feed, search, unread count, and total counts before and after A-B DM creation.', expectedAssertions: ['C gets no foreign IDs, counts, ordering signals, or search matches'], failWhen: ['any observable response reveals the private conversation'] },
  { id: 'DM-20', group: 'error-oracle', executionStatus: blocked, actors: ['C'], action: 'Compare C’s request for an existing foreign messageId with a nonexistent messageId.', expectedAssertions: ['application-level status, body, headers, and error fields are indistinguishable'], failWhen: ['response reveals existence or private attributes'] },
  { id: 'DM-21', group: 'notifications', executionStatus: blocked, actors: ['A', 'B', 'C'], action: 'Observe C’s sync, push, and real-time events while A sends B a DM.', expectedAssertions: ['C receives no event, ID, unread delta, payload, or activity signal'], failWhen: ['any event or metadata indicates the A-B conversation'] },
  { id: 'DM-22', group: 'side-channel-privacy', executionStatus: blocked, actors: ['A', 'B', 'C'], action: 'Inspect C-accessible network responses, cursors, cache headers, logs, and error output.', expectedAssertions: ['no foreign private trace in response/cache/log projection', 'cache is authorization-scoped'], failWhen: ['content or metadata leaks through any side channel'] },
  { id: 'DM-23', group: 'ui-channel-contract', executionStatus: blocked, actors: ['A', 'B'], action: 'Open DM and @mention actions separately from a message.', expectedAssertions: ['DM addresses a visible recipient in the private composer', 'private composer uses the approved blue frame and envelope icon', 'mention inserts a nickname only into public composer', 'channel never switches silently'], failWhen: ['wrong recipient, public send, missing blue frame, missing envelope icon, or visual-only privacy claim'] },
  { id: 'DM-24', group: 'future-safari-e2e', executionStatus: blocked, actors: ['A', 'B', 'C'], action: 'After a real server integration, rerun DM-01..DM-22 on iPhone Safari and desktop with network and durable storage evidence.', expectedAssertions: ['server and UI state agree across reload, focus, input, scroll, and return to chat', 'evidence is bound to exact server build and test configuration'], failWhen: ['leak, loss, duplicate, server/UI mismatch, or PASS without required device evidence'] },
]);

export const REQUIRED_GROUPS = Object.freeze([
  'membership', 'known-id-access', 'identity-spoofing', 'session-revocation',
  'blocking', 'blocking-race', 'idempotency', 'concurrent-send',
  'operation-key-misuse', 'history-reload', 'history-cursor',
  'account-switch-cache', 'metadata-privacy', 'error-oracle',
  'notifications', 'side-channel-privacy', 'ui-channel-contract', 'future-safari-e2e',
]);

export const ACCEPTANCE_BOUNDARY = Object.freeze({
  adapterPresent: false,
  serverExecutable: false,
  runtimePassClaimed: false,
  isolatedFixturePassMeans: 'scenario catalog is complete and consistently marked; it says nothing about a real server',
  missingAdapterStatus: blocked,
});
