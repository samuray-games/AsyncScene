"""CHAT05C V129: isolated trusted terminal receipt seam (not a production issuer).

A caller must inject trusted issuer, closed-05B, binding and independently durable
witness implementations. The bridge contains no default issuer, login or admin path.
SQLite is a disposable, single-authority *proposal*, not native Cloudflare D1.
"""
from __future__ import annotations
import hashlib
import json
import sqlite3


class Denied(RuntimeError):
    pass


class WitnessBlocked(Denied):
    pass


def canonical(obj):
    return json.dumps(obj, sort_keys=True, ensure_ascii=False, separators=(',', ':'))


def digest(obj):
    return hashlib.sha256(canonical(obj).encode('utf-8')).hexdigest()


FIELDS = (
    'battle_id','kind','source_system','canonical_event_id','commit_identity',
    'command_id','fingerprint','receipt_digest','issuer_proof_digest',
    'expected_version','battle_generation','side_a_person_id','side_b_person_id',
    'side_a_binding_epoch','side_b_binding_epoch','side_a_occupancy_generation',
    'side_b_occupancy_generation','vote_id','social_choice',
    'mechanical_outcome','recognized_outcome','trusted_now_ms',
)


class TerminalSeam:
    """One privileged server-side writer, with all trust verifiers injected.

    issuer.verify(request, db_context) -> verified dict with event, commit, identity,
    proof and authority metadata. Real issuer MUST NOT trust caller-supplied claims.
    sidecar.verify(request, db_closed_snapshot) -> verified source digest, or raises.
    binding.verify(request, db_binding_snapshot) -> verified digest, or raises.
    witness.get(battle_id) -> sealed digest or None; witness.seal(id,digest) -> ack;
    witness.verify(id,digest) -> True or raises. No default implementation exists.
    """
    def __init__(self, db:sqlite3.Connection, *, issuer, sidecar, binding, witness, clock):
        if any(x is None for x in (db,issuer,sidecar,binding,witness,clock)):
            raise Denied('MISSING_TRUSTED_BOUNDARY')
        self.db=db
        self.issuer=issuer
        self.sidecar=sidecar
        self.binding=binding
        self.witness=witness
        self.clock=clock

    def _database_context(self, battle_id):
        row=self.db.execute('SELECT version,phase,state_json FROM gameplay_battles WHERE battle_id=?',(battle_id,)).fetchone()
        if row is None: raise Denied('BATTLE_NOT_FOUND')
        try: state=json.loads(row[2])
        except (TypeError,ValueError) as err: raise Denied('BATTLE_STATE_INVALID') from err
        return {'version':row[0],'phase':row[1],'state':state,'battle_id':battle_id}

    def _binding_context(self, battle_id):
        row=self.db.execute('''SELECT battle_generation,side_a_person_id,side_b_person_id,
        side_a_binding_epoch,side_b_binding_epoch,side_a_occupancy_generation,side_b_occupancy_generation
        FROM v128_binding_fixture WHERE battle_id=?''',(battle_id,)).fetchone()
        if row is None:raise Denied('BINDING_ABSENT')
        names=('battle_generation','side_a_person_id','side_b_person_id','side_a_binding_epoch',
               'side_b_binding_epoch','side_a_occupancy_generation','side_b_occupancy_generation')
        return dict(zip(names,row))

    def _sidecar_context(self, battle_id, kind):
        rows=self.db.execute('''SELECT d.vote_id,d.status,d.final_choice,d.count_a,d.count_b,
            d.human_count,d.npc_count,d.quorum,d.deadline_at_ms,d.closed_at_ms
            FROM gameplay_social_votes v JOIN gameplay_social_vote_deadlines d ON d.vote_id=v.vote_id
            WHERE v.battle_id=?''',(battle_id,)).fetchall()
        if len(rows)!=1:raise Denied('VOTE_CARDINALITY_NOT_ONE')
        names=('vote_id','status','final_choice','count_a','count_b','human_count',
               'npc_count','quorum','deadline_at_ms','closed_at_ms')
        x=dict(zip(names,rows[0]))
        if kind=='FINAL':
            if x['status']!='closed' or x['final_choice'] not in ('A','B'):
                raise Denied('CLOSED_SIDECAR_REQUIRED')
            n=self.db.execute('''SELECT
            (SELECT count(*) FROM gameplay_social_ballots WHERE vote_id=? AND choice='A')+
            (SELECT count(*) FROM gameplay_social_npc_ballots WHERE vote_id=? AND choice='A'),
            (SELECT count(*) FROM gameplay_social_ballots WHERE vote_id=? AND choice='B')+
            (SELECT count(*) FROM gameplay_social_npc_ballots WHERE vote_id=? AND choice='B')''',
            (x['vote_id'],)*4).fetchone()
            if n!=(x['count_a'],x['count_b']) or x['count_a']+x['count_b']!=x['quorum']:
                raise Denied('CLOSED_SIDECAR_TALLY_MISMATCH')
            if x['count_a']==x['count_b'] or x['final_choice']!=('A' if x['count_a']>x['count_b'] else 'B'):
                raise Denied('CLOSED_SIDECAR_WINNER_MISMATCH')
            if x['human_count']+x['npc_count']!=x['quorum']:
                raise Denied('CLOSED_SIDECAR_QUORUM_MISMATCH')
        return x

    @staticmethod
    def _verified_dict(value, name):
        if not isinstance(value,dict) or value.get('verified') is not True:
            raise Denied('UNVERIFIED_'+name)
        return value

    def _make_envelope(self, request, *, on_replay=False):
        battle_id=request.get('battle_id')
        kind=request.get('kind')
        if not isinstance(battle_id,str) or not battle_id or kind not in ('FINAL','CANCEL'):
            raise Denied('BAD_TERMINAL_REQUEST')
        context=self._database_context(battle_id)
        b=self._binding_context(battle_id)
        s=self._sidecar_context(battle_id,kind)
        current=self._verified_dict(self.binding.verify(request,dict(b)), 'BINDING')
        if current.get('digest')!=digest(b):raise Denied('BINDING_PROOF_MISMATCH')
        if kind=='FINAL':
            side=self._verified_dict(self.sidecar.verify(request,dict(s)),'SIDECAR')
            if side.get('digest')!=digest(s):raise Denied('SIDECAR_PROOF_MISMATCH')
            side_digest=side['digest']
            if context['state'].get('mechanicalOutcome')!='DRAW':
                raise Denied('NON_DRAW_OUTCOME_MAPPING_NOT_APPROVED')
            recognized='A_WIN' if s['final_choice']=='A' else 'B_WIN'
        else:
            side_digest=None
            recognized=None
        verified=self._verified_dict(self.issuer.verify(request,{'battle':context,'binding':b,'sidecar':s}), 'ISSUER')
        for field in ('canonical_event_id','commit_identity','issuer_proof_digest','proof_sha256'):
            if not isinstance(verified.get(field),str) or not verified[field]:
                raise Denied('ISSUER_FIELD_MISSING:'+field)
        if verified.get('battle_id')!=battle_id or verified.get('kind')!=kind:
            raise Denied('ISSUER_BATTLE_KIND_MISMATCH')
        if verified.get('source_system')!='gameplay-server':raise Denied('ISSUER_SOURCE_MISMATCH')
        if verified.get('battle_generation')!=b['battle_generation']:
            raise Denied('ISSUER_GENERATION_MISMATCH')
        if verified.get('recognized_outcome')!=recognized:
            raise Denied('ISSUER_OUTCOME_MISMATCH')
        if verified.get('vote_id')!=s['vote_id']:
            raise Denied('ISSUER_VOTE_MISMATCH')
        if verified.get('command_id')!=request.get('command_id') or verified.get('fingerprint')!=request.get('fingerprint'):
            raise Denied('ISSUER_COMMAND_MISMATCH')
        if verified.get('expected_version')!=request.get('expected_version'):
            raise Denied('ISSUER_EXPECTED_VERSION_MISMATCH')
        if verified.get('binding_digest')!=current['digest'] or verified.get('sidecar_digest')!=side_digest:
            raise Denied('ISSUER_EVIDENCE_BINDING_MISMATCH')
        if verified.get('mechanical_outcome')!=context['state'].get('mechanicalOutcome'):
            raise Denied('ISSUER_MECHANICAL_MISMATCH')
        # Real issuer proof MUST be verified by injected provider, never by this flag or SQLite.
        if verified.get('proof_sha256')!=digest({'issuer_proof_digest':verified['issuer_proof_digest'],
                                                 'eventId':verified['canonical_event_id']}):
            raise Denied('ISSUER_ATTESTATION_DIGEST_MISMATCH')
        expected_version=verified['expected_version']
        if not on_replay and (context['phase']!='revealed' or context['version']!=expected_version):
            raise Denied('BATTLE_CAS_PRECONDITION')
        fields={'battle_id':battle_id,'kind':kind,'source_system':'gameplay-server',
            'canonical_event_id':verified['canonical_event_id'],
            'commit_identity':verified['commit_identity'],'command_id':verified['command_id'],
            'fingerprint':verified['fingerprint'],'issuer_proof_digest':verified['issuer_proof_digest'],
            'expected_version':expected_version,'battle_generation':b['battle_generation'],
            'vote_id':s['vote_id'],'social_choice':s['final_choice'] if kind=='FINAL' else None,
            'mechanical_outcome':verified['mechanical_outcome'],'recognized_outcome':recognized,
            'trusted_now_ms':int(self.clock())}
        fields.update(b)
        payload={'battleId':battle_id,'terminalKind':kind,
            'sourceSystem':'gameplay-server','canonicalEventId':fields['canonical_event_id'],
            'commitIdentity':fields['commit_identity'],'commandId':fields['command_id'],
            'fingerprint':fields['fingerprint'],'voteId':fields['vote_id'],
            'issuerProofDigest':fields['issuer_proof_digest'],
            'issuerAttestationDigest':verified['proof_sha256'],
            'sidecarAttestationDigest':side_digest,'bindingAttestationDigest':current['digest'],
            'mechanicalOutcome':fields['mechanical_outcome'],'recognizedOutcome':recognized,
            'expectedVersion':expected_version,'receiptVersion':expected_version+1,
            'battleGeneration':b['battle_generation'],
            'sideAPersonId':b['side_a_person_id'],'sideBPersonId':b['side_b_person_id'],
            'sideABindingEpoch':b['side_a_binding_epoch'],'sideBBindingEpoch':b['side_b_binding_epoch'],
            'sideAOccupancyGeneration':b['side_a_occupancy_generation'],
            'sideBOccupancyGeneration':b['side_b_occupancy_generation']}
        receipt_digest=digest(payload)
        fields['receipt_digest']=receipt_digest
        assert set(fields)==set(FIELDS),(set(fields)^set(FIELDS))
        return fields,payload,verified['proof_sha256'],side_digest,current['digest']

    def commit(self, request):
        """Returns sealed exact receipt only after independent witness ACK.

        A post-DB-commit witness failure returns WitnessBlocked. A retry can
        safely seal/verify the *same* receipt but cannot commit another terminal.
        """
        if self.db.in_transaction:raise Denied('NESTED_TRANSACTION_NOT_ALLOWED')
        battle_id=request.get('battle_id')
        if not isinstance(battle_id,str) or not battle_id:raise Denied('BAD_BATTLE_ID')
        try:
            self.db.execute('BEGIN IMMEDIATE')
            existing=self.db.execute('''SELECT receipt_json,receipt_sha256 FROM v129_terminal_receipts
                                          WHERE battle_id=?''',(battle_id,)).fetchone()
            prior=self.witness.get(battle_id) # external high-water must not share rollback domain
            if prior is not None and (existing is None or existing[1]!=prior):
                raise WitnessBlocked('ROLLBACK_WITNESS_CONFLICT')
            # Revalidate signed issuer/sidecar/binding on retries. The snapshot
            # is still readable after legitimate terminal release.
            fields,payload,issuer_sha,side_sha,binding_sha=self._make_envelope(request,on_replay=existing is not None)
            expected_receipt=canonical(payload)
            if existing is not None:
                if existing!=(expected_receipt,fields['receipt_digest']):
                    raise Denied('TERMINAL_REPLAY_IDENTITY_CONFLICT')
                receipt=payload
                receipt_hash=fields['receipt_digest']
                self.db.execute('COMMIT')
            else:
                self.db.execute('''INSERT INTO v129_seam_commands
                    (battle_id,canonical_event_id,envelope_json,receipt_json,receipt_sha256,
                      issuer_attestation_sha256,sidecar_attestation_sha256,binding_attestation_sha256)
                    VALUES (?,?,?,?,?,?,?,?)''',
                    (battle_id,fields['canonical_event_id'],canonical(fields),expected_receipt,
                     fields['receipt_digest'],issuer_sha,side_sha,binding_sha))
                stored=self.db.execute('''SELECT receipt_json,receipt_sha256 FROM v129_terminal_receipts
                                          WHERE battle_id=?''',(battle_id,)).fetchone()
                if stored!=(expected_receipt,fields['receipt_digest']):
                    raise Denied('RECEIPT_SEAM_DID_NOT_COMMIT')
                receipt=payload
                receipt_hash=fields['receipt_digest']
                self.db.execute('COMMIT')
        except BaseException:
            if self.db.in_transaction:self.db.execute('ROLLBACK')
            raise
        # Egress/reward must be downstream of this external durable witness.
        # If it fails, the DB stays committed, result is NOT publishable.
        try:
            self.witness.seal(battle_id,receipt_hash)
            if self.witness.verify(battle_id,receipt_hash) is not True:
                raise WitnessBlocked('WITNESS_READBACK_MISMATCH')
        except BaseException as ex:
            raise WitnessBlocked('WITNESS_PENDING_FAIL_CLOSED') from ex
        return {'status':'SEALED_REPLAY' if existing else 'SEALED_COMMITTED',
                'receipt':receipt,'receipt_sha256':receipt_hash}
