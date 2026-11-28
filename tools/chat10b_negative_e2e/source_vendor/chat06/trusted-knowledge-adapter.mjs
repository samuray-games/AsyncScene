/**
 * CHAT06-V123 isolated, offline projection of *trusted provider records* to
 * existing CHAT06-JUDGE-V1 {input,snapshot} fields.
 *
 * This module does NOT authenticate an issuer, signature, grant database or
 * live 07B knowledge delivery. `authority` MUST be injected by an independently
 * trusted server boundary. The test harness supplies a synthetic registry.
 */

export class TrustedJudgeProofError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'TrustedJudgeProofError';
    this.code = code;
  }
}

const ROOT_NS = 'gameplay.battle.finalized/v1'; // V118 proposed, not approved
const ACTION_NS = 'npc.action/v1'; // V118 proposed, not approved
const KINDS = new Set(['VERIFIED_OUTCOME', 'VERIFIED_UTTERANCE', 'HEARD_CLAIM']);
const nonempty = value => typeof value === 'string' && value.length > 0;
const stop = (code, msg) => { throw new TrustedJudgeProofError(code, msg); };
const required = (value, code) => { if (!nonempty(value)) stop(code, `${code}: expected nonempty string`); return value; };
const time = (v, code) => {
  required(v, code);
  const ms = Date.parse(v);
  if (!Number.isFinite(ms)) stop(code, `${code}: invalid timestamp`);
  return ms;
};
const own = (v, key) => v != null && Object.hasOwn(v, key);
const keyOf = (namespace, id) => JSON.stringify([namespace, id]);
function assertDataOnly(value, seen = new Set(), path = 'data') {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
  if (typeof value === 'number' && Number.isFinite(value)) return;
  if (typeof value !== 'object' || seen.has(value)) stop('INVALID_DATA_OBJECT', `${path}: invalid or cyclic data`);
  seen.add(value);
  if (Array.isArray(value)) {
    if (Object.getPrototypeOf(value) !== Array.prototype) stop('INVALID_DATA_OBJECT', `${path}: non-plain array`);
    for (let i = 0; i < value.length; i++) {
      if (!Object.hasOwn(value,i)) stop('INVALID_DATA_OBJECT', `${path}: sparse array`);
    }
  } else if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) {
    stop('INVALID_DATA_OBJECT', `${path}: non-plain object`);
  }
  for (const k of Reflect.ownKeys(value)) {
    if (Array.isArray(value) && k === 'length') continue;
    if (typeof k !== 'string' || (Array.isArray(value) && (!/^(0|[1-9][0-9]*)$/.test(k) || Number(k) >= value.length))) {
      stop('INVALID_DATA_OBJECT', `${path}: unsupported property`);
    }
    const d = Object.getOwnPropertyDescriptor(value,k);
    if (!d.enumerable || !Object.hasOwn(d,'value')) stop('INVALID_DATA_OBJECT', `${path}: descriptor rejected`);
    assertDataOnly(d.value,seen,`${path}.${k}`);
  }
  seen.delete(value);
}
const freezeDeep = v => {
  if (v && typeof v === 'object' && !Object.isFrozen(v)) {
    for (const child of Object.values(v)) freezeDeep(child);
    Object.freeze(v);
  }
  return v;
};

/**
 * @param {object} request - Frozen original PR452 input/snapshot and 07B typed evidence refs.
 * @param {object} authority - Privileged, PRIVATE *read-only* verified lookups.
 * @returns {{input: object, snapshot: object, privateEvidenceManifest: object}}
 *
 * Provider records are deliberately not self-attesting: only a trusted issuer,
 * ACL and durable knowledge service can implement these lookups in production.
 * Never expose this function with caller-controlled `authority` over HTTP.
 */
export function projectTrustedJudgeFacts({ input, snapshot, evidenceRefs }, authority) {
  if (!input || !snapshot || !Array.isArray(input.lines) || input.lines.length !== 4 ||
      !Array.isArray(evidenceRefs) || typeof authority?.getSource !== 'function' ||
      typeof authority?.getKnowledge !== 'function' || typeof authority?.getGrant !== 'function' ||
      typeof authority?.getAssertion !== 'function' || typeof authority?.approvedIssuerFor !== 'function') {
    stop('INVALID_ADAPTER_CONTEXT', 'input, four lines, evidence refs and four trusted lookups are required');
  }
  assertDataOnly(input);
  assertDataOnly(snapshot);
  assertDataOnly(evidenceRefs);
  const judgeId = required(snapshot.judgeId, 'INVALID_JUDGE_ID');
  const snapshotTime = time(snapshot.snapshotAt, 'INVALID_SNAPSHOT_TIME');
  required(input.battleId, 'INVALID_BATTLE_ID');
  required(input.voteId, 'INVALID_VOTE_ID');
  if (!Array.isArray(input.participantIds) || input.participantIds.length !== 2 ||
      input.participantIds[0] === input.participantIds[1]) stop('INVALID_PARTICIPANTS', 'two distinct participants required');

  // Do NOT spread untrusted claims/knownFacts into the scorer. The authorized
  // provider is the only route that may reclassify a claim as positive.
  const original = structuredClone(input);
  const copiedSnapshot = structuredClone(snapshot);
  if (!Array.isArray(copiedSnapshot.knownFacts)) stop('INVALID_KNOWN_FACTS', 'array required');
  copiedSnapshot.knownFacts = [];
  const claimsById = new Map();
  for (const line of original.lines) {
    if (!Array.isArray(line.claims)) stop('INVALID_CLAIMS', 'claims must be an array');
    for (const claim of line.claims) {
      required(claim.claimId, 'INVALID_CLAIM_ID');
      required(claim.provenance, 'INVALID_CLAIM_PROVENANCE');
      if (claimsById.has(claim.claimId)) stop('DUPLICATE_CLAIM_ID', 'a claim appears twice in revealed lines');
      time(claim.availableAt, 'INVALID_CLAIM_TIME');
      claimsById.set(claim.claimId, claim);
      claim.status = 'unknown';
      claim.supportUnits = 0;
    }
  }

  const positive = new Map();
  const canonicalAssertions = new Map();
  const seenReceipts = new Map();
  const seenRelayReceipts = new Map();
  const audit = [];
  for (const ref of evidenceRefs) {
    if (!ref || !KINDS.has(ref.knowledgeKind)) stop('UNSUPPORTED_KNOWLEDGE_KIND', 'unknown knowledge kind');
    for (const field of ['knowledgeKey', 'sourceNamespace', 'sourceId', 'sourceReceiptId',
      'sourceDigest', 'recipientNpcId', 'grantId', 'firstLearnedAtServer', 'knowledgeReceiptDigest']) {
      required(ref[field], 'INVALID_EVIDENCE_REF');
    }
    if (ref.recipientNpcId !== judgeId) stop('FOREIGN_RECIPIENT', 'recipient is not the judge');
    const knowledge = authority.getKnowledge(ref.knowledgeKey);
    if (!knowledge) stop('KNOWLEDGE_UNAVAILABLE', 'no authorized durable knowledge receipt');
    for (const field of ['knowledgeKind', 'sourceNamespace', 'sourceId', 'sourceReceiptId',
      'sourceDigest', 'recipientNpcId', 'grantId', 'firstLearnedAtServer',
      'knowledgeReceiptDigest']) {
      if (knowledge[field] !== ref[field]) stop('ALTERED_KNOWLEDGE_RECEIPT', `${field} differs from trusted receipt`);
    }
    if (knowledge.recipientId !== judgeId || knowledge.recipientNpcId !== judgeId ||
        knowledge.recipientRole !== 'judge') stop('FOREIGN_RECIPIENT', 'recipient binding mismatch');
    if (!Number.isSafeInteger(ref.grantGeneration) || ref.grantGeneration < 1 ||
        !Number.isSafeInteger(ref.accessEpoch) || ref.accessEpoch < 0) {
      stop('INVALID_GRANT_EPOCH', 'grant generation and access epoch must be canonical integers');
    }
    if (knowledge.grantGeneration !== ref.grantGeneration ||
        knowledge.accessEpoch !== ref.accessEpoch) stop('STALE_GRANT', 'grant epoch mismatch');
    if (knowledge.knowledgeKind !== ref.knowledgeKind) stop('FORGED_KIND', 'knowledge classification mismatch');
    if (!own(knowledge, 'sourceOriginKey') || !nonempty(knowledge.sourceOriginKey)) {
      stop('ORIGIN_UNAVAILABLE', 'sourceOriginKey missing from trusted receipt');
    }
    const grant = authority.getGrant(ref.grantId);
    if (!grant || grant.id !== ref.grantId || grant.recipientNpcId !== judgeId || !grant.active ||
        grant.generation !== ref.grantGeneration || grant.accessEpoch !== ref.accessEpoch) {
      stop('GRANT_DENIED', 'grant missing, revoked or stale');
    }
    if (grant.revokedAt != null ||
        time(grant.activatedAt, 'INVALID_GRANT_TIME') > snapshotTime ||
        (grant.expiresAt != null && time(grant.expiresAt, 'INVALID_GRANT_TIME') <= snapshotTime)) {
      stop('GRANT_DENIED', 'grant not active at snapshot');
    }
    const requiredScope = ref.knowledgeKind === 'VERIFIED_OUTCOME' ? 'battle.outcome'
      : ref.knowledgeKind === 'VERIFIED_UTTERANCE' ? 'npc.public_support' : 'npc.relay';
    if (!Array.isArray(grant.fieldScope) || !grant.fieldScope.includes(requiredScope) ||
        knowledge.fieldScope !== requiredScope) stop('FIELD_SCOPE_DENIED', 'field not authorized');

    const source = authority.getSource(ref.sourceNamespace, ref.sourceId);
    if (!source) stop('SOURCE_UNAVAILABLE', 'no verified authoritative source');
    if (source.namespace !== ref.sourceNamespace || source.id !== ref.sourceId ||
        source.receiptId !== ref.sourceReceiptId || source.digest !== ref.sourceDigest ||
        source.originKey !== knowledge.sourceOriginKey) {
      stop('ALTERED_SOURCE_RECEIPT', 'source identity or proof does not match trusted registry');
    }
    const allowedIssuer = authority.approvedIssuerFor(ref.sourceNamespace);
    if (!nonempty(allowedIssuer) || source.issuerId !== allowedIssuer) {
      stop('ISSUER_UNTRUSTED', 'source issuer is not approved for this namespace');
    }
    const sourceTime = time(source.occurredAtServer, 'INVALID_SOURCE_TIME');
    const firstLearned = time(knowledge.firstLearnedAtServer, 'INVALID_LEARNED_TIME');
    if (sourceTime > firstLearned) stop('KNOWLEDGE_BEFORE_SOURCE', 'learned before source existed');
    if (firstLearned > snapshotTime) stop('LATE_KNOWLEDGE', 'knowledge not known at snapshot');

    if (seenReceipts.has(ref.knowledgeKey)) {
      const earlier = seenReceipts.get(ref.knowledgeKey);
      if (earlier !== ref.knowledgeReceiptDigest) stop('CONFLICTING_REPLAY', 'changed receipt on replay');
      continue; // exact replay is read-only and idempotent
    }
    seenReceipts.set(ref.knowledgeKey, ref.knowledgeReceiptDigest);

    if (ref.knowledgeKind === 'VERIFIED_OUTCOME') {
      if (ref.sourceNamespace !== ROOT_NS || source.authorityClass !== 'BATTLE_TERMINAL_FINAL' ||
          source.eventKind !== 'battle.finalized' || source.terminalCount !== 1 ||
          source.canonicalEventId !== `${source.battleId}:final` ||
          source.battleId === input.battleId || source.verifiedFinal !== true) {
        stop('UNTRUSTED_FINAL_ORIGIN', 'source is not a single independently verified historic final');
      }
      if (!['WIN','DRAW'].includes(source.outcome)) stop('INVALID_FINAL_OUTCOME', 'unsupported outcome');
      if (source.outcome === 'DRAW') {
        if (source.winnerId != null || source.loserId != null) stop('DRAW_WINNER_FORBIDDEN', 'draw has no winner');
      } else if (!Array.isArray(source.participantIds) || source.participantIds.length !== 2 ||
                 !source.participantIds.includes(source.winnerId) ||
                 !source.participantIds.includes(source.loserId) || source.winnerId === source.loserId) {
        stop('INVALID_FINAL_WINNER', 'winner and loser must be actual distinct participants');
      }
      const assertionId = required(knowledge.assertionId, 'ASSERTION_UNAVAILABLE');
      const assertion = authority.getAssertion(assertionId);
      if (!assertion || assertion.sourceNamespace !== ROOT_NS || assertion.sourceId !== source.id ||
          !['WINNER','DRAW'].includes(assertion.propositionKind) || assertion.approved !== true) {
        stop('ASSERTION_UNAPPROVED', 'no approved bound assertion mapping');
      }
      if ((source.outcome === 'DRAW' && assertion.propositionKind !== 'DRAW') ||
          (source.outcome === 'WIN' && assertion.propositionKind !== 'WINNER') ||
          (assertion.propositionKind === 'WINNER' && assertion.winnerId !== source.winnerId)) {
        stop('ASSERTION_OUTCOME_CONFLICT', 'assertion contradicts finalized outcome');
      }
      const claim = claimsById.get(assertion.claimId);
      if (!claim || claim.provenance !== assertion.provenance ||
          !['confirmed','mixed'].includes(assertion.status) ||
          !Number.isInteger(assertion.supportUnits) || assertion.supportUnits < 1 ||
          assertion.supportUnits > 100) {
        stop('ASSERTION_MAPPING_CONFLICT', 'claim or positive units do not match trusted policy');
      }
      const canonicalAssertionId = required(assertion.canonicalAssertionId, 'ASSERTION_IDENTITY_MISSING');
      const semanticKey = JSON.stringify([ROOT_NS, source.id, canonicalAssertionId]);
      const priorSemantic = canonicalAssertions.get(semanticKey);
      if (priorSemantic && (priorSemantic.claimId !== assertion.claimId || priorSemantic.provenance !== assertion.provenance)) {
        stop('DUPLICATE_SEMANTIC_ASSERTION', 'one semantic fact cannot acquire extra claim IDs');
      }
      canonicalAssertions.set(semanticKey, {claimId:assertion.claimId,provenance:assertion.provenance});
      const existing = positive.get(assertion.claimId);
      if (existing && (existing.assertionId !== assertionId || existing.firstLearnedAt !== knowledge.firstLearnedAtServer ||
                       existing.provenance !== assertion.provenance)) {
        stop('CONFLICTING_ASSERTION', 'same claim from conflicting proof or time');
      }
      if (!existing) positive.set(assertion.claimId, {
        assertionId, canonicalAssertionId, sourceKey: keyOf(source.namespace, source.id), firstLearnedAt: knowledge.firstLearnedAtServer,
        provenance: assertion.provenance, status: assertion.status, supportUnits: assertion.supportUnits,
      });
    } else if (ref.knowledgeKind === 'VERIFIED_UTTERANCE') {
      if (ref.sourceNamespace !== ACTION_NS || source.authorityClass !== 'NPC_ACTION_DERIVATIVE' ||
          source.actionKind !== 'PUBLIC_SUPPORT' || source.routeClass !== 'AUTHORIZED_PUBLIC' ||
          !nonempty(source.publicTextDigest) || !nonempty(knowledge.observationReceiptId) ||
          time(knowledge.observedAtServer, 'INVALID_OBSERVATION_TIME') > firstLearned ||
          time(knowledge.observedAtServer, 'INVALID_OBSERVATION_TIME') < sourceTime) {
        stop('UNTRUSTED_UTTERANCE', 'not an authorized observed public support');
      }
      // No positive scoring - proof is ONLY that the action occurred.
    } else {
      if (ref.sourceNamespace !== ACTION_NS || source.authorityClass !== 'NPC_ACTION_DERIVATIVE' ||
          source.actionKind !== 'PUBLIC_SUPPORT' || source.routeClass !== 'AUTHORIZED_PUBLIC' ||
          knowledge.deliveryIssuerClass !== 'SERVER_RELAY_RECEIPT' ||
          !nonempty(knowledge.relayReceiptId) ||
          knowledge.relayReceiptId !== ref.relayReceiptId) {
        stop('UNTRUSTED_RELAY', 'no verified relay to this recipient');
      }
      const relayReceiptKey = JSON.stringify([judgeId, knowledge.relayReceiptId]);
      const priorRelay = seenRelayReceipts.get(relayReceiptKey);
      const relayBinding = JSON.stringify([ref.sourceNamespace, ref.sourceId, knowledge.sourceDigest]);
      if (priorRelay && priorRelay !== relayBinding) {
        stop('CONFLICTING_RELAY', 'one relay receipt was rebound to a different source');
      }
      if (priorRelay) continue; // one delivered receipt is one observation, even across different knowledge keys
      seenRelayReceipts.set(relayReceiptKey, relayBinding);
      // HEARD_CLAIM is never promoted by the number of receipts or witnesses.
    }
    audit.push({
      knowledgeKind: ref.knowledgeKind,
      sourceKey: keyOf(ref.sourceNamespace, ref.sourceId),
      knowledgeKey: ref.knowledgeKey,
      firstLearnedAtServer: knowledge.firstLearnedAtServer,
      sourceReceiptId: source.receiptId,
      grantId: grant.id,
      grantGeneration: grant.generation,
      accessEpoch: grant.accessEpoch,
    });
  }
  for (const [claimId, proof] of positive) {
    const claim = claimsById.get(claimId);
    claim.status = proof.status;
    claim.supportUnits = proof.supportUnits;
    claim.availableAt = proof.firstLearnedAt;
    copiedSnapshot.knownFacts.push({ claimId, provenance: proof.provenance, availableAt: proof.firstLearnedAt });
  }
  copiedSnapshot.knownFacts.sort((a,b) => a.claimId < b.claimId ? -1 : a.claimId > b.claimId ? 1 : 0);
  audit.sort((a,b) => a.knowledgeKey < b.knowledgeKey ? -1 : a.knowledgeKey > b.knowledgeKey ? 1 : 0);
  const verifiedPositiveFacts = Array.from(positive.entries()).map(([claimId,p])=>({
    claimId, canonicalAssertionId:p.canonicalAssertionId, assertionId:p.assertionId,
    sourceKey:p.sourceKey, firstLearnedAtServer:p.firstLearnedAt, provenance:p.provenance,
  })).sort((a,b)=>a.claimId.localeCompare(b.claimId,'en'));
  return freezeDeep({
    input: original,
    snapshot: copiedSnapshot,
    privateEvidenceManifest: { stage: 'OFFLINE_FIXTURE_ONLY', judgeId, snapshotAt: snapshot.snapshotAt, receipts: audit, verifiedPositiveFacts },
  });
}
