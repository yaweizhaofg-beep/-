import test from 'node:test';
import assert from 'node:assert/strict';
import { startApplication } from '../src/domain/startup.js';

test('home renders even if the daily update never resolves', async () => {
  const painted=[];
  await startApplication({read:async()=>({ready:true}),render:data=>painted.push(data),update:()=>new Promise(()=>{}),onUpdateError:()=>{}});
  assert.deepEqual(painted,[{ready:true}]);
});
test('failed background update preserves the rendered home and reports failure', async () => {
  const painted=[], errors=[];
  const job=await startApplication({read:async()=>({ready:true}),render:data=>painted.push(data),update:async()=>{throw new Error('offline');},onUpdateError:error=>errors.push(error.message)});
  await job.background;
  assert.equal(painted.length,1);
  assert.deepEqual(errors,['offline']);
});
