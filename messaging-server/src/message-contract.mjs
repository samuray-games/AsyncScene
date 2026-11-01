/** Pure validation and shaping helpers for the first public text-message contract.
 * These functions do not authenticate a session, persist messages, or deduplicate operations.
 */

export const MESSAGE_SCHEMA_VERSION = 1;
export const MAX_MESSAGE_TEXT_LENGTH = 2000;
export const CLIENT_OPERATION_ID_PATTERN = /^[A-Za-z0-9_-]{16,128}$/;

const REQUEST_KEYS = new Set(['type', 'clientOperationId', 'content']);
const TEXT_KEYS = new Set(['text']);
const ACK_KEYS = new Set(['ok', 'clientOperationId', 'message']);
const MESSAGE_KEYS = new Set([
  'messageId', 'schemaVersion', 'conversationId', 'channel', 'authorActorId',
  'authorDisplayName', 'kind', 'content', 'createdAtServer', 'revision', 'state',
]);

function result(ok, errors = []) {
  return Object.freeze({ ok, errors: Object.freeze(errors) });
}

function issue(code, field, message) {
  return { code, field, message };
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function isValidServerTimestamp(value) {
  if (typeof value !== 'string') return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?Z$/.exec(value);
  if (!match || match[0] !== value) return false;

  const [, yearText, monthText, dayText, hourText, minuteText, secondText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth[month - 1]
    && hour <= 23 && minute <= 59 && second <= 59;
}

function unknownFields(value, allowed, prefix = '') {
  return Object.keys(value).filter((key) => !allowed.has(key)).map((key) =>
    issue('UNKNOWN_FIELD', prefix ? `${prefix}.${key}` : key, 'Field is not allowed.'));
}

export function validateClientOperationId(value) {
  if (typeof value !== 'string' || !CLIENT_OPERATION_ID_PATTERN.test(value)) {
    return result(false, [issue('INVALID_CLIENT_OPERATION_ID', 'clientOperationId',
      'Expected 16–128 ASCII letters, digits, underscores, or hyphens.')]);
  }
  return result(true);
}

export function validatePublicTextMessage(value, fieldPrefix = 'content') {
  if (!isRecord(value)) return result(false, [issue('INVALID_OBJECT', 'content', 'Expected an object.')]);
  const errors = unknownFields(value, TEXT_KEYS, fieldPrefix);
  if (!hasOwn(value, 'text')) errors.push(issue('MISSING_FIELD', `${fieldPrefix}.text`, 'Field must be an own property.'));
  if (typeof value.text !== 'string') {
    errors.push(issue('INVALID_TEXT', `${fieldPrefix}.text`, 'Text must be a string.'));
  } else {
    if (value.text.trim().length === 0) errors.push(issue('EMPTY_TEXT', `${fieldPrefix}.text`, 'Text must not be empty.'));
    if (value.text.length > MAX_MESSAGE_TEXT_LENGTH) errors.push(issue('TEXT_TOO_LONG', `${fieldPrefix}.text`, `Text must not exceed ${MAX_MESSAGE_TEXT_LENGTH} UTF-16 code units.`));
  }
  return result(errors.length === 0, errors);
}

/** Accepts only a public text create request. Actor/authorship fields and system events are forbidden. */
export function validatePublicMessageRequest(value) {
  if (!isRecord(value)) return result(false, [issue('INVALID_OBJECT', 'request', 'Expected an object.')]);
  const errors = unknownFields(value, REQUEST_KEYS);
  for (const field of REQUEST_KEYS) {
    if (!hasOwn(value, field)) errors.push(issue('MISSING_FIELD', field, 'Field must be an own property.'));
  }
  if (value.type !== 'message.create') errors.push(issue('INVALID_TYPE', 'type', 'Expected message.create.'));
  const operation = validateClientOperationId(value.clientOperationId);
  errors.push(...operation.errors);
  const content = validatePublicTextMessage(value.content);
  errors.push(...content.errors);
  return result(errors.length === 0, errors);
}

/** Stable JSON representation of the validated client operation, suitable as a future dedupe comparison value. */
export function canonicalizePublicMessageOperation(request) {
  const validation = validatePublicMessageRequest(request);
  if (!validation.ok) return result(false, validation.errors);
  const canonical = JSON.stringify({
    type: 'message.create',
    clientOperationId: request.clientOperationId,
    content: { text: request.content.text },
  });
  return Object.freeze({ ok: true, errors: Object.freeze([]), canonical });
}

/** Builds a wire message using server supplied identity and metadata. This is shaping, not authorization. */
export function createPublicMessage(input = {}) {
  if (!isRecord(input)) return result(false, [issue('INVALID_OBJECT', 'message', 'Expected an object.')]);
  const { messageId, conversationId, authorActorId, authorDisplayName, createdAtServer, content, revision = 1 } = input;
  const errors = [];
  for (const [field, value] of Object.entries({ messageId, conversationId, authorActorId })) {
    if (typeof value !== 'string' || value.trim() === '') errors.push(issue('INVALID_SERVER_VALUE', field, `${field} must be a non-empty string.`));
  }
  if (typeof authorDisplayName !== 'string' || authorDisplayName.trim() === '') errors.push(issue('INVALID_SERVER_VALUE', 'authorDisplayName', 'authorDisplayName must be a non-empty string.'));
  if (!isValidServerTimestamp(createdAtServer)) errors.push(issue('INVALID_SERVER_VALUE', 'createdAtServer', 'Expected a valid UTC server timestamp.'));
  if (!Number.isSafeInteger(revision) || revision < 1) errors.push(issue('INVALID_SERVER_VALUE', 'revision', 'revision must be a positive safe integer.'));
  const contentResult = validatePublicTextMessage(content);
  errors.push(...contentResult.errors);
  if (errors.length) return result(false, errors);
  return Object.freeze({ ok: true, errors: Object.freeze([]), message: Object.freeze({
    messageId, schemaVersion: MESSAGE_SCHEMA_VERSION, conversationId, channel: 'public',
    authorActorId, authorDisplayName, kind: 'text', content: Object.freeze({ text: content.text }),
    createdAtServer, revision, state: 'active',
  }) });
}

export function validateMessageAcknowledgement(value) {
  if (!isRecord(value)) return result(false, [issue('INVALID_OBJECT', 'acknowledgement', 'Expected an object.')]);
  const errors = unknownFields(value, ACK_KEYS);
  for (const field of ACK_KEYS) {
    if (!hasOwn(value, field)) errors.push(issue('MISSING_FIELD', field, 'Field must be an own property.'));
  }
  if (value.ok !== true) errors.push(issue('INVALID_ACK', 'ok', 'Expected ok: true.'));
  errors.push(...validateClientOperationId(value.clientOperationId).errors);
  if (!isRecord(value.message)) {
    errors.push(issue('INVALID_MESSAGE', 'message', 'Expected a message object.'));
  } else {
    errors.push(...unknownFields(value.message, MESSAGE_KEYS, 'message'));
    const m = value.message;
    for (const field of MESSAGE_KEYS) {
      if (!hasOwn(m, field)) errors.push(issue('MISSING_FIELD', `message.${field}`, 'Field must be an own property.'));
    }
    for (const field of ['messageId', 'conversationId', 'authorActorId', 'authorDisplayName']) {
      if (typeof m[field] !== 'string' || !m[field].trim()) errors.push(issue('INVALID_MESSAGE', `message.${field}`, 'Expected a non-empty string.'));
    }
    if (!isValidServerTimestamp(m.createdAtServer)) errors.push(issue('INVALID_MESSAGE', 'message.createdAtServer', 'Expected a valid UTC timestamp.'));
    if (m.schemaVersion !== MESSAGE_SCHEMA_VERSION) errors.push(issue('INVALID_MESSAGE', 'message.schemaVersion', 'Unsupported schema version.'));
    if (m.channel !== 'public' || m.kind !== 'text' || m.state !== 'active') errors.push(issue('INVALID_MESSAGE', 'message', 'Expected an active public text message.'));
    if (!Number.isSafeInteger(m.revision) || m.revision < 1) errors.push(issue('INVALID_MESSAGE', 'message.revision', 'Expected a positive safe integer.'));
    if (!isRecord(m.content)) errors.push(issue('INVALID_MESSAGE', 'message.content', 'Expected content object.'));
    else errors.push(...validatePublicTextMessage(m.content, 'message.content').errors);
  }
  return result(errors.length === 0, errors);
}
