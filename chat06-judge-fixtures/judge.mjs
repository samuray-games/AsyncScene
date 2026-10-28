import { createHash } from 'node:crypto';

export const ALGORITHM_VERSION = 'CHAT06-JUDGE-V1';
const TIE_DOMAIN = Buffer.from('CHAT06-JUDGE-V1-TIE\0', 'utf8');
const FEAR_VALUES = Object.freeze({ support: 1, neutral: 0, resist: -1 });
const LINE_IDS = Object.freeze(['A1', 'B1', 'A2', 'B2']);
const PUBLIC_REASON_CODES = new Set(['DETERMINISTIC_TIE_BREAK', 'JUDGE_SUPPORTED_PARTICIPANT', 'EXPOSED_LINES_CONSIDERED']);
const RESULT_FIELDS = Object.freeze([
  'schemaVersion', 'voteId', 'battleId', 'judgeId', 'winnerId', 'profileVersion', 'featureVersion',
  'algorithmVersion', 'explanationVersion', 'scores', 'lineScores', 'relationshipScores', 'tieBreak',
  'internalReasonCodes', 'publicReasonCodes', 'fullInputHash', 'resultIntegrityHash',
]);

export class JudgeInputError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'JudgeInputError';
    this.code = code;
  }
}

function fail(code, message) { throw new JudgeInputError(code, message); }
function isObject(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function isWellFormedUnicode(value) {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(i + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) return false;
      i += 1;
    } else if (code >= 0xdc00 && code <= 0xdfff) return false;
  }
  return true;
}
function requiredString(value, path) {
  if (typeof value !== 'string' || value.length === 0 || !isWellFormedUnicode(value)) fail('INVALID_STRING', `${path} must be a non-empty well-formed Unicode string`);
}
function integerIn(value, min, max, path) {
  if (!Number.isInteger(value) || value < min || value > max) fail('INVALID_INTEGER', `${path} must be an integer in ${min}..${max}`);
}
function own(value, key, path) {
  if (!isObject(value)) fail('INVALID_OBJECT', `${path} must be an object`);
  if (!Object.hasOwn(value, key)) fail('MISSING_FIELD', `${path}.${key} is required`);
  return value[key];
}
function timestamp(value, path) {
  requiredString(value, path);
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) fail('INVALID_TIMESTAMP', `${path} must be a valid timestamp`);
  return ms;
}

// All contract numbers are small integers; sorted UTF-16 object keys and JSON
// scalar encoding therefore implement the RFC 8785 subset used by this schema.
export function canonicalJson(value) {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) fail('NON_CANONICAL_NUMBER', 'JCS does not accept non-finite numbers');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (!isObject(value)) fail('NON_CANONICAL_VALUE', 'Value is outside the supported JSON data model');
  return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
}

function validateProfile(profile) {
  if (!isObject(profile)) fail('INVALID_PROFILE', 'profile must be an object');
  requiredString(own(profile, 'judgeId', 'profile'), 'profile.judgeId');
  integerIn(own(profile, 'profileVersion', 'profile'), 1, Number.MAX_SAFE_INTEGER, 'profile.profileVersion');
  for (const key of ['aggressionCalm', 'factsEmotions', 'humorSeriousness']) integerIn(own(profile, key, 'profile'), -2, 2, `profile.${key}`);
  const response = own(profile, 'fearResponse', 'profile');
  if (!Object.hasOwn(FEAR_VALUES, response)) fail('INVALID_FEAR_RESPONSE', 'profile.fearResponse must be support, neutral, or resist');
  return profile;
}

function validateInput(input, snapshot) {
  if (!isObject(input)) fail('INVALID_INPUT', 'input must be an object');
  for (const key of ['voteId', 'battleId', 'algorithmVersion']) requiredString(own(input, key, 'input'), `input.${key}`);
  if (input.algorithmVersion !== ALGORITHM_VERSION) fail('UNSUPPORTED_ALGORITHM', `algorithmVersion must be ${ALGORITHM_VERSION}`);
  const participants = own(input, 'participantIds', 'input');
  if (!Array.isArray(participants) || participants.length !== 2 || participants.some(id => typeof id !== 'string' || !id.length) || participants[0] === participants[1]) {
    fail('INVALID_PARTICIPANTS', 'participantIds must contain exactly two distinct non-empty strings in A/B order');
  }
  participants.forEach((id, index) => requiredString(id, `input.participantIds[${index}]`));
  integerIn(own(input, 'featureVersion', 'input'), 1, Number.MAX_SAFE_INTEGER, 'input.featureVersion');
  const snapshotAt = timestamp(own(snapshot, 'snapshotAt', 'snapshot'), 'snapshot.snapshotAt');
  const profile = validateProfile(own(snapshot, 'profile', 'snapshot'));
  if (profile.judgeId !== own(snapshot, 'judgeId', 'snapshot')) fail('JUDGE_ID_MISMATCH', 'snapshot judgeId must match profile.judgeId');
  integerIn(own(snapshot, 'profileVersion', 'snapshot'), 1, Number.MAX_SAFE_INTEGER, 'snapshot.profileVersion');
  if (snapshot.profileVersion !== profile.profileVersion) fail('PROFILE_VERSION_MISMATCH', 'snapshot profileVersion must match profile.profileVersion');
  requiredString(own(snapshot, 'seed', 'snapshot'), 'snapshot.seed');

  const relationships = own(snapshot, 'relationships', 'snapshot');
  if (!isObject(relationships)) fail('INVALID_RELATIONSHIPS', 'relationships must be an object');
  for (const [side, participantId] of [['A', participants[0]], ['B', participants[1]]]) {
    const relation = own(relationships, side, 'snapshot.relationships');
    if (!isObject(relation) || relation.participantId !== participantId) fail('RELATIONSHIP_PARTICIPANT_MISMATCH', `relationship ${side} must identify ${participantId}`);
    for (const key of ['sympathy', 'resentment', 'fear']) integerIn(own(relation, key, `relationships.${side}`), 0, 2, `relationships.${side}.${key}`);
  }

  const lines = own(input, 'lines', 'input');
  if (!Array.isArray(lines) || lines.length !== 4) fail('INVALID_LINES', 'exactly four revealed lines are required');
  const claimById = new Map();
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!isObject(line) || line.lineId !== LINE_IDS[i]) fail('INVALID_LINE_ORDER', 'lines must be A1, B1, A2, B2 in that order');
    const expectedSpeaker = i % 2 === 0 ? participants[0] : participants[1];
    if (line.speakerId !== expectedSpeaker) fail('LINE_SPEAKER_MISMATCH', `${line.lineId} speakerId must match its participant`);
    for (const key of ['aggression', 'factsEmotions', 'humor']) integerIn(own(line, key, `lines.${line.lineId}`), -2, 2, `lines.${line.lineId}.${key}`);
    const claims = own(line, 'claims', `lines.${line.lineId}`);
    if (!Array.isArray(claims)) fail('INVALID_CLAIMS', `${line.lineId}.claims must be an array`);
    for (const claim of claims) {
      if (!isObject(claim)) fail('INVALID_CLAIM', `${line.lineId} claim must be an object`);
      requiredString(own(claim, 'claimId', 'claim'), 'claim.claimId');
      requiredString(own(claim, 'provenance', 'claim'), 'claim.provenance');
      const availableAt = timestamp(own(claim, 'availableAt', 'claim'), 'claim.availableAt');
      if (availableAt > snapshotAt) fail('FUTURE_CLAIM', `${claim.claimId} was not available at the judge snapshot`);
      if (!['confirmed', 'unknown', 'refuted', 'mixed'].includes(own(claim, 'status', 'claim'))) fail('INVALID_CLAIM_STATUS', `${claim.claimId} has an invalid status`);
      integerIn(own(claim, 'supportUnits', 'claim'), 0, 100, `claim.${claim.claimId}.supportUnits`);
      if (claim.status === 'confirmed' && claim.supportUnits < 1) fail('INVALID_CONFIRMED_CLAIM', 'confirmed claims need positive supportUnits');
      if ((claim.status === 'unknown' || claim.status === 'refuted') && claim.supportUnits !== 0) fail('UNTRUSTED_SUPPORT', 'unknown and refuted claims must have zero supportUnits');
      if (claim.status === 'mixed' && claim.supportUnits < 1) fail('INVALID_MIXED_CLAIM', 'mixed claims need positive confirmed-part supportUnits');
      if (claimById.has(claim.claimId)) fail('DUPLICATE_CLAIM_ID', `duplicate claimId ${claim.claimId}`);
      claimById.set(claim.claimId, claim);
    }
  }

  const knownFacts = own(snapshot, 'knownFacts', 'snapshot');
  if (!Array.isArray(knownFacts)) fail('INVALID_KNOWN_FACTS', 'knownFacts must be an array');
  const knownById = new Map();
  for (const known of knownFacts) {
    if (!isObject(known)) fail('INVALID_KNOWN_FACT', 'known fact must be an object');
    requiredString(own(known, 'claimId', 'knownFact'), 'knownFact.claimId');
    requiredString(own(known, 'provenance', 'knownFact'), 'knownFact.provenance');
    const availableAt = timestamp(own(known, 'availableAt', 'knownFact'), 'knownFact.availableAt');
    if (availableAt > snapshotAt) fail('FUTURE_KNOWLEDGE', `${known.claimId} was not known at the judge snapshot`);
    if (knownById.has(known.claimId)) fail('DUPLICATE_KNOWN_FACT', `duplicate known fact ${known.claimId}`);
    knownById.set(known.claimId, known);
  }

  return { input, snapshot, snapshotAt, profile, participants, lines, knownById };
}

function validatedSupport(line, knownById) {
  let support = 0;
  for (const claim of line.claims) {
    const known = knownById.get(claim.claimId);
    if (!known || known.provenance !== claim.provenance) continue;
    if (claim.status === 'confirmed' || claim.status === 'mixed') support += claim.supportUnits;
  }
  return Math.min(support, line.factsEmotions);
}

function relationshipBonus(relation, fearResponse) {
  return 2 * relation.sympathy - 2 * relation.resentment + relation.fear * FEAR_VALUES[fearResponse];
}

function tieBreak(input, judgeId, seed) {
  const participantIds = [...input.participantIds].sort();
  const canonical = canonicalJson({
    voteId: input.voteId,
    judgeId,
    seed,
    algorithmVersion: input.algorithmVersion,
    participantIds,
  });
  const digest = createHash('sha256').update(TIE_DOMAIN).update(canonical, 'utf8').digest();
  return { digest: digest.toString('hex'), winnerId: participantIds[(digest[0] & 0x80) === 0 ? 0 : 1] };
}

function deepFreeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

export function evaluateJudge(input, snapshot) {
  const v = validateInput(input, snapshot);
  const { profile, participants, lines, knownById } = v;
  const perLine = lines.map(line => {
    const facts = line.factsEmotions < 0 ? line.factsEmotions : validatedSupport(line, knownById);
    const cleanZero = value => value === 0 ? 0 : value;
    const aggressionPoints = cleanZero(profile.aggressionCalm * line.aggression);
    const factualStylePoints = cleanZero(profile.factsEmotions * facts);
    const humorPoints = cleanZero(profile.humorSeriousness * line.humor);
    return { lineId: line.lineId, speakerId: line.speakerId, aggressionPoints, factualStylePoints, humorPoints, total: aggressionPoints + factualStylePoints + humorPoints };
  });
  const relations = {
    [participants[0]]: relationshipBonus(snapshot.relationships.A, profile.fearResponse),
    [participants[1]]: relationshipBonus(snapshot.relationships.B, profile.fearResponse),
  };
  const lineTotals = { [participants[0]]: 0, [participants[1]]: 0 };
  for (const scored of perLine) lineTotals[scored.speakerId] += scored.total;
  const scores = { [participants[0]]: lineTotals[participants[0]] + relations[participants[0]], [participants[1]]: lineTotals[participants[1]] + relations[participants[1]] };
  const tie = scores[participants[0]] === scores[participants[1]] ? tieBreak(input, profile.judgeId, snapshot.seed) : null;
  const winnerId = tie ? tie.winnerId : scores[participants[0]] > scores[participants[1]] ? participants[0] : participants[1];
  const withoutRelationshipsWinner = lineTotals[participants[0]] === lineTotals[participants[1]] ? null : lineTotals[participants[0]] > lineTotals[participants[1]] ? participants[0] : participants[1];
  const relationshipDecisive = !tie && (withoutRelationshipsWinner === null
    ? relations[participants[0]] !== relations[participants[1]]
    : withoutRelationshipsWinner !== winnerId);
  const internalReasonCodes = [relationshipDecisive ? 'FROZEN_RELATIONSHIP_DECISIVE' : 'EXPOSED_LINES_SCORED', ...(tie ? ['DETERMINISTIC_TIE_BREAK'] : [])];
  const publicReasonCodes = tie ? ['DETERMINISTIC_TIE_BREAK'] : relationshipDecisive ? ['JUDGE_SUPPORTED_PARTICIPANT'] : ['EXPOSED_LINES_CONSIDERED'];
  const fullInputHash = createHash('sha256').update(canonicalJson({ input, snapshot }), 'utf8').digest('hex');
  const record = {
    schemaVersion: 1,
    voteId: input.voteId,
    battleId: input.battleId,
    judgeId: profile.judgeId,
    winnerId,
    profileVersion: profile.profileVersion,
    featureVersion: input.featureVersion,
    algorithmVersion: input.algorithmVersion,
    explanationVersion: 1,
    scores,
    lineScores: perLine,
    relationshipScores: relations,
    tieBreak: tie ? { applied: true, digest: tie.digest, winnerId: tie.winnerId } : { applied: false, digest: null, winnerId: null },
    internalReasonCodes,
    publicReasonCodes,
    fullInputHash,
  };
  record.resultIntegrityHash = createHash('sha256').update(canonicalJson(record), 'utf8').digest('hex');
  return deepFreeze(record);
}

function validateClosedResult(closedResult) {
  if (!isObject(closedResult) || closedResult.schemaVersion !== 1 || closedResult.algorithmVersion !== ALGORITHM_VERSION) fail('INVALID_CLOSED_RESULT', 'closed result is invalid');
  const keys = Object.keys(closedResult).sort();
  if (canonicalJson(keys) !== canonicalJson([...RESULT_FIELDS].sort())) fail('INVALID_CLOSED_RESULT', 'closed result fields do not match schemaVersion 1');
  for (const key of ['voteId', 'battleId', 'judgeId', 'winnerId', 'fullInputHash', 'resultIntegrityHash']) requiredString(closedResult[key], `closedResult.${key}`);
  if (!/^[0-9a-f]{64}$/.test(closedResult.fullInputHash) || !/^[0-9a-f]{64}$/.test(closedResult.resultIntegrityHash)) fail('INVALID_CLOSED_RESULT', 'closed result hashes must be lowercase SHA-256 digests');
  if (!Array.isArray(closedResult.publicReasonCodes) || closedResult.publicReasonCodes.some(code => !PUBLIC_REASON_CODES.has(code))) fail('INVALID_PUBLIC_REASON', 'closed result contains an unsupported public reason code');
  if (!Array.isArray(closedResult.internalReasonCodes)) fail('INVALID_CLOSED_RESULT', 'internalReasonCodes must be an array');
  const { resultIntegrityHash, ...unsigned } = closedResult;
  const expected = createHash('sha256').update(canonicalJson(unsigned), 'utf8').digest('hex');
  if (expected !== resultIntegrityHash) fail('CLOSED_RESULT_INTEGRITY_MISMATCH', 'closed result integrity digest does not match its content');
  return closedResult;
}

export function toPublicResult(closedResult) {
  validateClosedResult(closedResult);
  const tie = closedResult.tieBreak?.applied === true;
  return deepFreeze({
    voteId: closedResult.voteId,
    battleId: closedResult.battleId,
    judgeId: closedResult.judgeId,
    winnerId: closedResult.winnerId,
    algorithmVersion: closedResult.algorithmVersion,
    explanationVersion: closedResult.explanationVersion,
    reasonCodes: [...closedResult.publicReasonCodes],
    explanation: tie
      ? `Равенство разрешено установленным правилом; судья поддержал участника ${closedResult.winnerId}.`
      : closedResult.publicReasonCodes.includes('JUDGE_SUPPORTED_PARTICIPANT')
        ? `Судья поддержал участника ${closedResult.winnerId}.`
        : `Судья поддержал участника ${closedResult.winnerId} по раскрытым репликам.`,
  });
}

export function serializeClosedResult(closedResult) {
  return JSON.stringify(closedResult);
}

export function restoreClosedResult(serialized) {
  let value;
  try { value = JSON.parse(serialized); } catch { fail('INVALID_SERIALIZED_RESULT', 'closed result is not valid JSON'); }
  try { validateClosedResult(value); }
  catch (error) {
    if (error instanceof JudgeInputError) fail('INVALID_SERIALIZED_RESULT', error.message);
    throw error;
  }
  return deepFreeze(value);
}

export function evaluateRoster(input, snapshots, { minimum = 1 } = {}) {
  if (!Array.isArray(snapshots)) fail('INVALID_ROSTER', 'snapshots must be an array');
  integerIn(minimum, 1, 100, 'minimum');
  const results = [];
  const rejected = [];
  const seen = new Set();
  for (const snapshot of snapshots) {
    const judgeId = snapshot?.judgeId ?? snapshot?.profile?.judgeId ?? '(unknown)';
    if (seen.has(judgeId)) {
      rejected.push({ judgeId, code: 'DUPLICATE_JUDGE' });
      continue;
    }
    seen.add(judgeId);
    try { results.push(evaluateJudge(input, snapshot)); }
    catch (error) {
      if (!(error instanceof JudgeInputError)) throw error;
      rejected.push({ judgeId, code: error.code });
    }
  }
  if (results.length < minimum) fail('INSUFFICIENT_JUDGE_ROSTER', `need ${minimum} valid judge snapshots; received ${results.length}`);
  return deepFreeze({ votes: results, rejected });
}

export function tieBreakForTest(input, judgeId, seed) { return tieBreak(input, judgeId, seed); }
