import test from 'node:test';
import assert from 'node:assert/strict';
import { MockRepository } from '../src/data/mock-repository.js';
import { renderScreens } from '../src/ui/pages.js';

test('deleting and restoring a scheme preserves its layout and project data', async () => {
  const repo = new MockRepository({ getItem:()=>null, setItem(){}, removeItem(){} });
  const before = await repo.read();
  const screen = before.screens[0];
  await repo.archiveScreen(screen.id);
  const archived = await repo.read();
  assert.equal(archived.screens.find(row=>row.id===screen.id).archived, true);
  assert.deepEqual(archived.projects, before.projects);
  await repo.restoreScreen(screen.id);
  assert.deepEqual((await repo.read()).screens.find(row=>row.id===screen.id), screen);
  await assert.rejects(repo.archiveScreen('missing'));
});

test('scheme library keeps every saved scheme available beyond the first sixteen', () => {
  const screens = Array.from({length:19}, (_,i)=>({id:`screen-${i}`,name:`方案${i}`,version:1,pages:[{}],archived:i===18}));
  const html = renderScreens({screens});
  assert.equal((html.match(/data-screen-id=/g)||[]).length,18);
  assert.equal((html.match(/data-action="delete-screen"/g)||[]).length,18);
  assert.match(html, /data-action="restore-screen"/);
  assert.match(html, /方案17/);
});
