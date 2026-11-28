#!/usr/bin/env node
// V127: attest original source bytes; run exact old suites as REGRESSION, plus
// direct-source read-only V127 deltas. Never claims server/Worker/D1 acceptance.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const dir=dirname(fileURLToPath(import.meta.url));
const sha256=x=>createHash('sha256').update(x).digest('hex');
const raw=p=>readFileSync(join(dir,p));
const verified=[];
function verify(p,expected,len){const b=raw(p);if(sha256(b)!==expected||(len!=null&&b.length!==len))throw new Error(`SOURCE_SHA_MISMATCH:${p}`);verified.push({path:p,sha256:expected,bytes:b.length});}
function verifyOriginals(){
  const v125=raw('evidence/v125-byte-manifest.json');
  const v125Manifest=JSON.parse(v125);
  if(v125Manifest.atom!=='CHAT10B-V125-SOURCE-ADAPTER-PROVENANCE'||v125Manifest.fileCount!==21||v125Manifest.files.length!==21)throw Error('INVALID_V125_MANIFEST');
  for(const f of v125Manifest.files){
    const prefix='tools/chat10b_negative_e2e/';
    if(!f.path.startsWith(prefix))throw Error('V125_PATH_ESCAPE');
    verify(f.path.slice(prefix.length),f.sha256,f.bytes);
  }
  // Fixed digest of original manifest itself to defend against editing both manifest and source.
  const pinnedV125Manifest='88888c8c0d162b998222ec088c8bea1cc7bd102f6c3b48b3d3522bf00ba0afa8';
  if(sha256(v125)!==pinnedV125Manifest)throw Error('V125_MANIFEST_REPLACED');
  const report=JSON.parse(raw('evidence/v125-source-provenance.json'));
  if(report.originals[2]?.expectedNotionSha256!=='faf25936b205d5ad30033f22653842afb2fc90cf7198a1b123a33f58e14a5ece')throw Error('CHAT09B_ORIGIN_NOT_PINNED');
  const imported09=JSON.parse(raw('source_vendor/chat09b/manifest.json'));
  if(imported09.atom!=='CHAT09B-V123-CANCEL-ANTIFARM-IMPLEMENT'||imported09.files.length!==4)throw Error('INVALID_CHAT09B_ORIGINAL');
  for(const f of imported09.files){if(!/^(product-model\.mjs|acceptance\.test\.mjs|README\.md|test-results\.tap)$/.test(f.path))throw Error('CHAT09B_WRONG_PATH');verify('source_vendor/chat09b/'+f.path,f.sha256,f.size);}
  verify('source_vendor/chat09b/manifest.json','dc0fe2ba3014db32ba88643dafa32bd265f26a9ec6f11aa714334065ae272f93',918);
  const jb=raw('source_vendor/chat06/judge.mjs');
  const blobsha=createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${jb.length}\0`),jb])).digest('hex');
  if(blobsha!=='12ece4f21b9a57004a8c52f67c14c9f4481f7aac')throw Error('PR452_JUDGE_BLOB_MISMATCH');
  verified.push({path:'source_vendor/chat06/judge.mjs',sha256:sha256(jb),gitBlobSha1:blobsha,bytes:jb.length});
}
const cases=[
 {id:'V123_ORIGINAL_STUB_REGRESSION',file:'test/negative.test.mjs',provenance:'STUB_ONLY',newWork:false},
 {id:'CHAT06_ORIGINAL_REGRESSION_PR452_SMOKE',file:'source_vendor/chat06/trusted-knowledge-adapter.test.mjs',provenance:'REAL_SOURCE_OFFLINE',newWork:false},
 {id:'CHAT10B_V125_REGRESSION',file:'test/source-chat06.test.mjs',provenance:'REAL_SOURCE_OFFLINE',newWork:false},
 {id:'CHAT10B_V127_WRONG_RECIPIENT',file:'test/source-chat06-recipient-v127.test.mjs',provenance:'REAL_SOURCE_OFFLINE',newWork:true},
 {id:'CHAT09B_ORIGINAL_REGRESSION',file:'source_vendor/chat09b/acceptance.test.mjs',provenance:'REAL_SOURCE_OFFLINE',newWork:false},
 {id:'CHAT10B_V127_CHAT09B_DIRECT_SOURCE_NEGATIVES',file:'test/source-chat09b-v127.test.mjs',provenance:'REAL_SOURCE_OFFLINE',newWork:true},
];
const num=(tap,k)=>Number(tap.match(new RegExp(`^# ${k} (\\d+)`,'m'))?.[1]??-1);
let results=[],fatal=null;
try{verifyOriginals();}catch(e){fatal=e.message;}
if(!fatal){for(const c of cases){const r=spawnSync(process.execPath,['--test','--test-reporter=tap',c.file],{cwd:dir,encoding:'utf8',timeout:35000,maxBuffer:4_000_000,env:{PATH:process.env.PATH??'',TZ:'UTC'}});const tap=(r.stdout??'')+(r.stderr??'');const counts={tests:num(tap,'tests'),pass:num(tap,'pass'),fail:num(tap,'fail'),skip:num(tap,'skipped')};results.push({...c,counts,exitCode:r.status,tapSha256:sha256(tap),failedAssertions:tap.split('\n').filter(x=>x.startsWith('not ok ')).map(x=>x.slice(0,150))});if(counts.tests<0||counts.tests!==counts.pass+counts.fail+counts.skip||r.error)fatal='INVALID_TAP_RESULT:'+c.id;}}
const totals=results.reduce((a,x)=>({tests:a.tests+x.counts.tests,pass:a.pass+x.counts.pass,fail:a.fail+x.counts.fail,skip:a.skip+x.counts.skip}),{tests:0,pass:0,fail:0,skip:0});
const delta=results.filter(r=>r.newWork).reduce((a,x)=>({tests:a.tests+x.counts.tests,pass:a.pass+x.counts.pass,fail:a.fail+x.counts.fail,skip:a.skip+x.counts.skip}),{tests:0,pass:0,fail:0,skip:0});
const output={atom:'CHAT10B-V127-SOURCE-PROVENANCE-REVIEW-AND-09B-IMPORT-GATE',level:'LOCAL_REAL_SOURCE_OFFLINE_AND_STUB_REGRESSION_ONLY',originalV125ZipSha256:'e0fa09d468d04e7c82d59760457e375643a59c7167dd85eb19437f073a4794f0',original09bZipSha256:'faf25936b205d5ad30033f22653842afb2fc90cf7198a1b123a33f58e14a5ece',originalsVerified:!fatal,verifiedByteFiles:verified.length,stages:results,totals,delta,blockingFindings:results.filter(x=>x.counts.fail>0).flatMap(x=>x.failedAssertions),independentCriticalReview:'NOT_EXECUTED_ROLE_UNAVAILABLE',authorStaticReview:'FAIL_CHAT09B_RECEIPT_BATTLE_BINDING',skips:{oldChat06Evaluator:'RESOLVED_BY_EXACT_PR452_GIT_BLOB',httpLostAck:'SKIP_NO_REAL_HTTP_OR_PERSISTENT_RECEIPT',finalCancelCAS:'SKIP_NO_NATIVE_ATOMIC_TERMINAL_AUTHORITY'},serverRuntimePass:false,crossWorkerE2EPass:false,acceptancePass:false,integrityError:fatal};
if(process.argv.includes('--json'))process.stdout.write(JSON.stringify(output,null,2)+'\n');else process.stdout.write(`V127 ${totals.pass} PASS / ${totals.fail} FAIL / ${totals.skip} SKIP; DELTA ${delta.pass} PASS / ${delta.fail} FAIL; crossWorkerRuntimePass=false\n`);
if(fatal||totals.fail>0||totals.skip>0||results.length!==cases.length)process.exitCode=1;
