#!/usr/bin/env node
// Chat10B-owned source provenance runner. No network, D1, Worker or upstream mutations.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root=dirname(fileURLToPath(import.meta.url));
const sha256=b=>createHash('sha256').update(b).digest('hex');
const sourcePins=Object.freeze({
  main:'f256228a2a57e5b8144a42a72a240a7455a76417',
  v123Zip:'89a23460a513cf059098f9bbcd3ceca845954b003de3119c7addabf7d96ee286',
  chat06CloudZipV2:'c88782307a95e5ddbf3fc3a1f63f724844a04816cb8d80d1feb1c6bcb604c6a8',
  chat06Adapter:'d5a3d4b5cb4e4988a3527e7195d3016eef61f9646338c10e4028c0c6032f1e09',
  chat06Test:'77a18a4f2c0f3b1f6f4325bd1790ae83999fbf4671b7da89df336c9a354b5b50',
  chat06Doc:'e94d2209b8c11c46387dba946635759d97e32841de6fd81077c3c16333d495d8',
  githubPr452JudgeBlob:'12ece4f21b9a57004a8c52f67c14c9f4481f7aac',
  chat09bUnverifiedOriginalZip:'faf25936b205d5ad30033f22653842afb2fc90cf7198a1b123a33f58e14a5ece',
});
function verify(){
  const manifest=JSON.parse(readFileSync(join(root,'evidence/sha256-manifest.json'),'utf8'));
  for(const f of manifest.files){
    if(!f.path.startsWith('tools/chat10b_negative_e2e/'))throw Error('unexpected original path');
    const b=readFileSync(join(root,f.path.slice('tools/chat10b_negative_e2e/'.length)));
    if(b.length!==f.bytes||sha256(b)!==f.sha256)throw Error(`original V123 content changed: ${f.path}`);
  }
  const cm=JSON.parse(readFileSync(join(root,'source_vendor/chat06/checkpoint-manifest.json'),'utf8'));
  const pinned=new Map([
    ['trusted-knowledge-adapter.mjs',sourcePins.chat06Adapter],
    ['trusted-knowledge-adapter.test.mjs',sourcePins.chat06Test],
    ['TRUSTED_KNOWLEDGE_ADAPTER.md',sourcePins.chat06Doc],
  ]);
  if(cm.snapshot_version!=='v2-after-static-self-review')throw Error('wrong Cloud V2 checkpoint');
  for(const f of cm.files){
    const name=f.path.replace('chat06-judge-fixtures/','');
    if(!pinned.has(name))throw Error(`unexpected Chat06 path: ${f.path}`);
    const b=readFileSync(join(root,'source_vendor/chat06',name));
    if(b.length!==f.bytes||sha256(b)!==f.sha256||sha256(b)!==pinned.get(name))throw Error(`Chat06 source provenance conflict: ${name}`);
  }
  if(cm.files.length!==pinned.size)throw Error('incomplete Chat06 checkpoint');
  return {v123FilesVerified:manifest.files.length,chat06FilesVerified:cm.files.length,chat06OriginalBytesReproduced:true};
}
const provenance=verify();
const stages=[
  {id:'V123_STUB_CASES',file:'test/negative.test.mjs',kind:'STUB_ONLY',expected:{tests:11,pass:11,skip:0}},
  {id:'CHAT06_ORIGINAL_TESTS',file:'source_vendor/chat06/trusted-knowledge-adapter.test.mjs',kind:'REAL_SOURCE_OFFLINE',expected:{tests:30,pass:29,skip:1}},
  {id:'CHAT10B_V125_SOURCE_CUTSET',file:'test/source-chat06.test.mjs',kind:'REAL_SOURCE_OFFLINE',expected:{tests:12,pass:10,skip:2}},
];
const num=(raw,name)=>Number(raw.match(new RegExp(`^# ${name} (\\d+)`, 'm'))?.[1]??-1);
const reports=[];
for(const stage of stages){
  const r=spawnSync(process.execPath,['--test','--test-reporter=tap',stage.file],{
    cwd:root,encoding:'utf8',timeout:25000,maxBuffer:8_000_000,
    env:{PATH:process.env.PATH??'',TZ:'UTC'},
  });
  const tap=(r.stdout??'')+(r.stderr??'');
  const counts={tests:num(tap,'tests'),pass:num(tap,'pass'),fail:num(tap,'fail'),skip:num(tap,'skipped')};
  const verified=r.status===0&&Object.entries(stage.expected).every(([k,v])=>counts[k]===v)&&counts.fail===0;
  reports.push({id:stage.id,kind:stage.kind,testFile:stage.file,counts,verified,
    tapSHA256:sha256(tap),negativeCaseEvidence:stage.id==='CHAT10B_V125_SOURCE_CUTSET'?{
      supported:['issuer-invalid','grant-revoke','stale-regrant','knowledge-replay','altered-source-receipt','false-winner','duplicate-final-origin','cancel-is-not-final','public-support-nonscoring'],
      notImplemented:['network-lost-ack','terminal-final-cancel-CAS'],
    }:undefined});
  if(!verified){if(!process.argv.includes('--json'))process.stderr.write(tap);process.exitCode=1;break;}
}
const totals=reports.reduce((a,r)=>({tests:a.tests+r.counts.tests,pass:a.pass+r.counts.pass,fail:a.fail+r.counts.fail,skip:a.skip+r.counts.skip}),{tests:0,pass:0,fail:0,skip:0});
const result={atom:'CHAT10B-V125-SOURCE-ADAPTER-PROVENANCE',level:'OFFLINE_FIXTURE_AND_REAL_SOURCE_CONSUMER_ONLY',verified:reports.length===3&&reports.every(r=>r.verified),
  sourcePins,provenance,stages:reports,totals,
  chat09b:{status:'BLOCKED_ORIGINAL_CLOUD_CHECKPOINT_NOT_VERIFIED',sourceImportExecuted:false,claimedPreviousLocalTests:'14 PASS from Chat09B V123 Notion only'},
  missingAuthorities:['04.0 authoritative revoke/admission+SEND','04.1B durable session/binding/consent epochs','04.2 real messaging transport','05B closed vote authority','05C canonical final and issuer','07A verified source projection','07B real recipient grant knowledge sink','08A durable effects','08B atomic source cap','09A global occupancy','09B verified terminal cancellation','independent rollback witness'],
  cases:{STUB_ONLY:10,REAL_SOURCE_OFFLINE:10,REAL_RUNTIME:0,unsupportedServerCases:['ACK-delivery readback','final/cancel CAS','cross-store revocation','D1 rollback','server restore']},
  workerRuntimePass:false,d1RuntimePass:false,hostedRuntimePass:false,realServerTestPass:false,independentCriticalReviewerPass:false,
  cloudByteVerificationOfNewArchive:false,
};
if(process.argv.includes('--json'))console.log(JSON.stringify(result,null,2));
else console.log(`CHAT10B V125: ${totals.pass}/${totals.tests} PASS, ${totals.skip} SKIP, ${totals.fail} FAIL. Source verified=${result.verified}; SERVER_RUNTIME_PASS=false; Chat09B=BLOCKED`);
if(!result.verified)process.exitCode=1;
