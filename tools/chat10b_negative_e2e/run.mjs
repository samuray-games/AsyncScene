#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { CASES, SOURCE_PINS, assertProvenance } from './provenance.mjs';

const cwd=dirname(fileURLToPath(import.meta.url));
assertProvenance();
const result=spawnSync(process.execPath, ['--test','--test-reporter=tap','./test/negative.test.mjs'], {
  cwd, encoding:'utf8', timeout:20000, env: { PATH: process.env.PATH ?? '' },
});
const output=(result.stdout??'')+(result.stderr??'');
const find=n=>Number(output.match(new RegExp(`^# ${n} (\\d+)`, 'm'))?.[1]??-1);
const complete=result.status===0 && find('tests')===11 && find('pass')===11 && find('fail')===0;
const report={
  atom:'CHAT10B-V123-NEGATIVE-E2E-RUNNER',
  runner:'node:test', status:complete?'STUB_CONTRACT_PASS':'STUB_CONTRACT_FAIL',
  totalTests:find('tests'), passed:find('pass'), failed:find('fail'),
  negativeCaseCount:CASES.length, cases:CASES,
  provenance:'STUB_ONLY',sourcePins:SOURCE_PINS,
  localStubExecuted:true, workerRuntimePass:false, d1RuntimePass:false, authRuntimePass:false,
  endToEndRuntimePass:false, independentCriticalReviewPass:false,cloudCheckpointVerified:false,
  exitCode:complete?0:(result.status||1),
  tapSha256:createHash('sha256').update(output).digest('hex'),
};
if(process.argv.includes('--json')) console.log(JSON.stringify(report,null,2));
else {process.stdout.write(output);console.log(`STUB CONTRACT: ${report.status}; server runtime PASS=false`);}
process.exitCode=report.exitCode;
