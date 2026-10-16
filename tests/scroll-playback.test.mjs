import test from 'node:test';
import assert from 'node:assert/strict';
import { scrollPlayback } from '../src/domain/scroll-playback.js';

test('employee playback waits then scrolls down without clipping the last employee',()=>{
  assert.equal(scrollPlayback(1000,220,15000).offset,0);
  assert.equal(scrollPlayback(7000,220,15000).offset,110);
  assert.equal(scrollPlayback(14000,220,15000).offset,220);
  assert.equal(scrollPlayback(15000,220,15000).duration,15000);
  assert.equal(scrollPlayback(0,1100,15000).duration,54000);
  assert.deepEqual(scrollPlayback(90000,0,15000),{offset:0,duration:15000});
});
