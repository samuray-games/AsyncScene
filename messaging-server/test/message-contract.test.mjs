import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canonicalizePublicMessageOperation, createPublicMessage,
  validateMessageAcknowledgement, validatePublicMessageRequest,
  validatePublicTextMessage,
} from '../src/message-contract.mjs';

const validRequest = () => ({ type: 'message.create', clientOperationId: 'operation_key_0001', content: { text: 'Привет' } });
const message = () => createPublicMessage({
  messageId: 'msg_server_0001', conversationId: 'public-main', authorActorId: 'actor_stable_01',
  authorDisplayName: 'Ник', createdAtServer: '2026-10-31T10:00:00.000Z', content: { text: 'Привет' },
}).message;

test('accepts a public text request and preserves text', () => {
  assert.equal(validatePublicMessageRequest(validRequest()).ok, true);
  assert.equal(validatePublicTextMessage({ text: '  hello  ' }).ok, true);
});

test('rejects empty, whitespace-only, non-string, and oversized text', () => {
  for (const content of [{ text: '' }, { text: ' \n ' }, { text: 5 }, { text: 'x'.repeat(2001) }]) {
    assert.equal(validatePublicTextMessage(content).ok, false);
  }
});

test('rejects unknown request/content fields and client supplied authorship or authorization', () => {
  for (const field of ['actorId', 'authorActorId', 'author', 'session', 'token', 'isSystem', 'eventId', 'battleId', 'voteId']) {
    assert.equal(validatePublicMessageRequest({ ...validRequest(), [field]: 'forged' }).ok, false, field);
  }
  assert.equal(validatePublicTextMessage({ text: 'hello', kind: 'system' }).ok, false);
});

test('rejects inherited request fields and inherited content text', () => {
  const inheritedRequest = Object.create({
    type: 'message.create', clientOperationId: 'operation_key_0001', content: { text: 'forged' },
  });
  assert.equal(validatePublicMessageRequest(inheritedRequest).ok, false);

  for (const missingField of ['type', 'clientOperationId', 'content']) {
    const request = validRequest();
    delete request[missingField];
    Object.setPrototypeOf(request, { [missingField]: validRequest()[missingField] });
    assert.equal(validatePublicMessageRequest(request).ok, false, missingField);
  }

  const inheritedText = Object.create({ text: 'forged' });
  assert.equal(validatePublicTextMessage(inheritedText).ok, false);
});

test('rejects wrong operation types and malformed operation identifiers', () => {
  assert.equal(validatePublicMessageRequest({ ...validRequest(), type: 'system.event' }).ok, false);
  for (const id of ['', 'short', 'contains spaces 000', 'x'.repeat(129), 'é'.repeat(16)]) {
    assert.equal(validatePublicMessageRequest({ ...validRequest(), clientOperationId: id }).ok, false, id);
  }
});

test('canonical operation is stable and distinct content under the same key remains distinguishable', () => {
  const a = canonicalizePublicMessageOperation(validRequest());
  const b = canonicalizePublicMessageOperation({ content: { text: 'Привет' }, clientOperationId: 'operation_key_0001', type: 'message.create' });
  const c = canonicalizePublicMessageOperation({ ...validRequest(), content: { text: 'Другое' } });
  assert.equal(a.ok, true);
  assert.equal(a.canonical, b.canonical);
  assert.notEqual(a.canonical, c.canonical);
  assert.match(a.canonical, /"type":"message.create"/);
  assert.equal(canonicalizePublicMessageOperation({ ...validRequest(), authorActorId: 'forged' }).ok, false);
});

test('formats server message with stable actor, mutable display name, and server message ID', () => {
  const built = createPublicMessage({
    messageId: 'msg_1', conversationId: 'public-main', authorActorId: 'actor_1', authorDisplayName: 'Новый ник',
    createdAtServer: '2026-10-31T10:00:00Z', content: { text: 'hello' },
  });
  assert.equal(built.ok, true);
  assert.deepEqual(built.message, {
    messageId: 'msg_1', schemaVersion: 1, conversationId: 'public-main', channel: 'public',
    authorActorId: 'actor_1', authorDisplayName: 'Новый ник', kind: 'text', content: { text: 'hello' },
    createdAtServer: '2026-10-31T10:00:00Z', revision: 1, state: 'active',
  });
  assert.equal(createPublicMessage({ content: { text: 'x' } }).ok, false);
});

test('accepts a strict UTC timestamp and preserves its input spelling', () => {
  const timestamp = '2026-10-31T10:00:00.123Z';
  const built = createPublicMessage({
    messageId: 'msg_1', conversationId: 'public-main', authorActorId: 'actor_1', authorDisplayName: 'Ник',
    createdAtServer: timestamp, content: { text: 'hello' },
  });
  assert.equal(built.ok, true);
  assert.equal(built.message.createdAtServer, timestamp);
  const acknowledgment = { ok: true, clientOperationId: 'operation_key_0001', message: { ...built.message } };
  assert.equal(validateMessageAcknowledgement(acknowledgment).ok, true);
});

test('accepts February 29 in a Gregorian leap year', () => {
  const built = createPublicMessage({
    messageId: 'msg_1', conversationId: 'public-main', authorActorId: 'actor_1', authorDisplayName: 'Ник',
    createdAtServer: '2024-02-29T23:59:59Z', content: { text: 'hello' },
  });
  assert.equal(built.ok, true);
});

test('rejects an impossible February 31 timestamp in both contract paths', () => {
  const timestamp = '2026-02-31T10:00:00Z';
  const built = createPublicMessage({
    messageId: 'msg_1', conversationId: 'public-main', authorActorId: 'actor_1', authorDisplayName: 'Ник',
    createdAtServer: timestamp, content: { text: 'hello' },
  });
  assert.equal(built.ok, false);
  const acknowledgment = { ok: true, clientOperationId: 'operation_key_0001', message: { ...message(), createdAtServer: timestamp } };
  assert.equal(validateMessageAcknowledgement(acknowledgment).ok, false);
});

test('rejects a date without a time', () => {
  const acknowledgment = { ok: true, clientOperationId: 'operation_key_0001', message: { ...message(), createdAtServer: '2026-10-31' } };
  assert.equal(validateMessageAcknowledgement(acknowledgment).ok, false);
});

test('rejects a timezone offset instead of the required Z', () => {
  const acknowledgment = { ok: true, clientOperationId: 'operation_key_0001', message: { ...message(), createdAtServer: '2026-10-31T10:00:00+00:00' } };
  assert.equal(validateMessageAcknowledgement(acknowledgment).ok, false);
});

test('rejects trailing line breaks and fractional seconds longer than three digits', () => {
  for (const timestamp of ['2026-10-31T10:00:00Z\n', '2026-10-31T10:00:00.1234Z']) {
    const acknowledgment = { ok: true, clientOperationId: 'operation_key_0001', message: { ...message(), createdAtServer: timestamp } };
    assert.equal(validateMessageAcknowledgement(acknowledgment).ok, false, JSON.stringify(timestamp));
  }
});

test('rejects a non-string server timestamp in both contract paths', () => {
  const built = createPublicMessage({
    messageId: 'msg_1', conversationId: 'public-main', authorActorId: 'actor_1', authorDisplayName: 'Ник',
    createdAtServer: 123, content: { text: 'hello' },
  });
  assert.equal(built.ok, false);
  const acknowledgment = { ok: true, clientOperationId: 'operation_key_0001', message: { ...message(), createdAtServer: 123 } };
  assert.equal(validateMessageAcknowledgement(acknowledgment).ok, false);
});

test('validates acknowledgement shape and requires a persistent messageId field', () => {
  const acknowledgment = { ok: true, clientOperationId: 'operation_key_0001', message: message() };
  assert.equal(validateMessageAcknowledgement(acknowledgment).ok, true);
  const withoutId = structuredClone(acknowledgment);
  delete withoutId.message.messageId;
  assert.equal(validateMessageAcknowledgement(withoutId).ok, false);
  assert.equal(validateMessageAcknowledgement({ ...acknowledgment, extra: true }).ok, false);
  assert.equal(validateMessageAcknowledgement({ ...acknowledgment, message: { ...message(), battleId: 'wrong-id' } }).ok, false);
  assert.equal(validateMessageAcknowledgement({ ...acknowledgment, message: { ...message(), authorActorId: '' } }).ok, false);
});

test('reports an unknown acknowledgement content field exactly once', () => {
  const acknowledgment = {
    ok: true,
    clientOperationId: 'operation_key_0001',
    message: { ...message(), content: { text: 'ok', ghost: 1 } },
  };
  const unknownErrors = validateMessageAcknowledgement(acknowledgment).errors
    .filter((error) => error.code === 'UNKNOWN_FIELD');
  assert.deepEqual(unknownErrors.map(({ field }) => field), ['message.content.ghost']);
});

test('rejects acknowledgement fields inherited from its prototype', () => {
  const valid = { ok: true, clientOperationId: 'operation_key_0001', message: message() };
  for (const field of ['ok', 'clientOperationId', 'message']) {
    const acknowledgment = { ...valid };
    delete acknowledgment[field];
    Object.setPrototypeOf(acknowledgment, { [field]: valid[field] });
    assert.equal(validateMessageAcknowledgement(acknowledgment).ok, false, field);
  }
});

test('rejects required message fields inherited from its prototype', () => {
  const valid = message();
  for (const field of ['messageId', 'schemaVersion', 'authorActorId', 'content']) {
    const nestedMessage = { ...valid };
    delete nestedMessage[field];
    Object.setPrototypeOf(nestedMessage, { [field]: valid[field] });
    const acknowledgment = { ok: true, clientOperationId: 'operation_key_0001', message: nestedMessage };
    assert.equal(validateMessageAcknowledgement(acknowledgment).ok, false, field);
  }
});

test('rejects an acknowledgement timestamp object without throwing', () => {
  const acknowledgment = { ok: true, clientOperationId: 'operation_key_0001', message: message() };
  const invalidDateObject = structuredClone(acknowledgment);
  invalidDateObject.message.createdAtServer = { toString: 1 };
  assert.doesNotThrow(() => assert.equal(validateMessageAcknowledgement(invalidDateObject).ok, false));
});

test('serialization is deterministic and identity fields do not alias battle, vote, or event IDs', () => {
  const msg = message();
  const ack = { ok: true, clientOperationId: 'operation_key_0001', message: msg };
  const encoded = JSON.stringify(ack);
  assert.equal(JSON.stringify(JSON.parse(encoded)), encoded);
  assert.equal(validateMessageAcknowledgement(JSON.parse(encoded)).ok, true);
  assert.ok(msg.messageId.startsWith('msg_'));
  assert.equal(msg.messageId, 'msg_server_0001');
  assert.equal('battleId' in msg, false);
  assert.equal('voteId' in msg, false);
  assert.equal('eventId' in msg, false);
});

test('returns a structured validation failure when message formatting has no argument', () => {
  assert.deepEqual(createPublicMessage(), {
    ok: false,
    errors: [
      { code: 'INVALID_SERVER_VALUE', field: 'messageId', message: 'messageId must be a non-empty string.' },
      { code: 'INVALID_SERVER_VALUE', field: 'conversationId', message: 'conversationId must be a non-empty string.' },
      { code: 'INVALID_SERVER_VALUE', field: 'authorActorId', message: 'authorActorId must be a non-empty string.' },
      { code: 'INVALID_SERVER_VALUE', field: 'authorDisplayName', message: 'authorDisplayName must be a non-empty string.' },
      { code: 'INVALID_SERVER_VALUE', field: 'createdAtServer', message: 'Expected a valid UTC server timestamp.' },
      { code: 'INVALID_OBJECT', field: 'content', message: 'Expected an object.' },
    ],
  });
  assert.equal(createPublicMessage(null).ok, false);
  assert.equal(createPublicMessage('bad input').ok, false);
});
