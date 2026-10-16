import test from 'node:test';
import assert from 'node:assert/strict';
import { createFixtures } from '../src/data/fixtures.js';
import { MockRepository } from '../src/data/mock-repository.js';
import { activeEmployees, contribution, cumulativePoints, monthlyMetrics, percentages, projectSummary, teamStats } from '../src/domain/metrics.js';
import { dailySnapshotDate, latestReleaseRows } from '../src/domain/releases.js';
import { groupSummaries, groupOfEmployee } from '../src/domain/groups.js';
import { defaultLayout, placeWidget, validateLayout } from '../src/domain/layout.js';

const fresh = () => new MockRepository({ getItem: () => null, setItem() {}, removeItem() {} });

test('cumulative demo points reconcile opening balance, charges and refunds', async () => {
  const repo = fresh();
  assert.equal(cumulativePoints(await repo.read()).points, 6000000);
  await repo.demoUpdate();
  assert.equal(cumulativePoints(await repo.read()).points, 6000040);
});

test('daily release update runs after 08:00 Shanghai and remains idempotent', async () => {
  assert.equal(dailySnapshotDate('2026-10-15T07:59:59+08:00'), '2026-10-14');
  assert.equal(dailySnapshotDate('2026-10-15T08:00:00+08:00'), '2026-10-15');
  const repo = fresh();
  await repo.refreshDailyReleases(new Date('2026-10-15T08:00:00+08:00'));
  const first = await repo.read();
  assert.equal(first.releaseHistory.length, 4);
  assert.equal(first.releases.length, 4);
  assert.equal(first.releases.every(row => row.snapshotAt.startsWith('2026-10-15')), true);
  await repo.refreshDailyReleases(new Date('2026-10-15T18:00:00+08:00'));
  assert.deepEqual((await repo.read()).releases, first.releases);
  assert.equal((await repo.read()).releaseHistory.length, 4);
});

test('published charts use latest cumulative work snapshot without duplicate counting', () => {
  const data = createFixtures();
  data.releases.push({ ...data.releases[0], id: 'new-snapshot', views: 999999, snapshotAt: '2026-10-15T08:00:00+08:00' });
  const latest = latestReleaseRows(data);
  assert.equal(latest.length, 4);
  assert.equal(latest.find(row => row.projectId === 'changan').views, 999999);
});

test('share rounding is stable and totals exactly 100.0%', () => {
  assert.deepEqual(percentages([1, 1, 1]), [33.4, 33.3, 33.3]);
  assert.deepEqual(percentages([0, 0]), [0, 0]);
});

test('project adoption time and monthly grouping are separate from cost and status', () => {
  const data = createFixtures();
  assert.equal(contribution(data, 'echo').total, 2160);
  assert.deepEqual(contribution(data, 'echo').rows.map(row => row.share), [50, 30, 20]);
  assert.equal(projectSummary(data, data.projects.find(project => project.id === 'echo')).unitCost, 11.666666666666666);
  assert.deepEqual(monthlyMetrics(data, '2026-10'), { launched: 3, active: 2, completed: 1, minutes: 104, cost: 1100, averageDays: 9 });
});

test('historical team attribution stays attached to each adopted row after team changes', async () => {
  const repo = fresh();
  await repo.updateTeam('echo', { leaderId: 'lead-xu', members: ['ming', 'li', 'zhao'], transferTo: 'lead-xu' });
  const data = await repo.read();
  assert.equal(data.projects.find(row => row.id === 'echo').leaderId, 'lead-xu');
  assert.equal(teamStats(data, '2026-10').find(row => row.id === 'lead-lin').minutes, 36);
  assert.equal(teamStats(data, '2026-10').find(row => row.id === 'lead-xu').minutes, 60);
});

test('ledger confirmation replaces one episode version and rejects stale versions', async () => {
  const repo = fresh();
  const old = (await repo.read()).ledgers.find(row => row.episodeId === 'echo-ep1');
  const input = { projectId: 'echo', episodeId: 'echo-ep1', total: 600, version: 1, rows: [
    { employeeId: 'ming', seconds: 300, producedOn: '2026-10-05', leaderId: 'lead-lin' },
    { employeeId: 'li', seconds: 180, producedOn: '2026-10-05', leaderId: 'lead-lin' },
    { employeeId: 'zhao', seconds: 120, producedOn: '2026-10-05', leaderId: 'lead-lin' },
  ] };
  await repo.confirmLedger(input);
  let data = await repo.read();
  assert.equal(data.ledgers.filter(row => row.episodeId === 'echo-ep1').length, 1);
  assert.equal(data.ledgers.find(row => row.episodeId === 'echo-ep1').version, 2);
  assert.equal(contribution(data, 'echo').total, 2040);
  await assert.rejects(() => repo.confirmLedger(input), { code: 'VERSION_CONFLICT' });
  assert.equal(old.version, 1);
});

test('active people listing excludes former employees while preserving historical contribution', () => {
  const data = createFixtures();
  data.projects[0].members.push('former');
  data.ledgers[0].rows.push({ employeeId: 'former', seconds: 60, leaderId: 'lead-lin', producedOn: '2026-10-05' });
  assert.equal(activeEmployees(data).some(person => person.id === 'former'), false);
  assert.equal(contribution(data, 'echo').rows.some(row => row.id === 'historical'), true);
});

test('screen grid resolves collisions without overlap and rolls back invalid bounds', () => {
  const layout = [
    { ...defaultLayout()[1], y: 0 },
    { ...defaultLayout()[2], y: 0 },
  ];
  assert.equal(validateLayout(layout), true);
  const changed = placeWidget(layout, { ...layout[0], x: 8, y: 0 });
  assert.ok(changed);
  assert.equal(validateLayout(changed), true);
  assert.equal(placeWidget(layout, { ...layout[0], x: 20, y: 0 }), null);
  assert.equal(validateLayout(layout), true);
});

test('four groups start with eight distinct active employees each', () => {
  const data=createFixtures();
  assert.deepEqual(data.groups.map(group=>group.memberIds.length),[8,8,8,8]);
  assert.equal(new Set(data.groups.flatMap(group=>group.memberIds)).size,32);
  assert.equal(groupSummaries(data,'2026-10').every(group=>group.projects.length===1),true);
});

test('employee transfer preserves source identity, original project crew and historical attribution', async () => {
  const repo=fresh();
  const before=await repo.read();
  await repo.updateGroupMember('group-1','ming',{version:1,targetGroupId:'group-3',targetVersion:1,groupRole:'视频负责人'});
  const data=await repo.read();
  assert.equal(groupOfEmployee(data,'ming').id,'group-3');
  assert.equal(data.groups[0].memberIds.includes('ming'),false);
  assert.equal(data.employees.find(row=>row.id==='ming').role,'视频制作');
  assert.deepEqual(data.projects.find(row=>row.id==='echo').members,before.projects.find(row=>row.id==='echo').members);
  assert.equal(groupSummaries(data,'2026-10')[0].points,2800);
  assert.equal(groupSummaries(data,'2026-10')[0].minutes,36);
  await repo.syncDirectory();
  assert.equal(groupOfEmployee(await repo.read(),'ming').id,'group-3');
});

test('removing a member keeps employee in pool and adding to a new group is reversible', async () => {
  const repo=fresh();
  await repo.removeGroupMember('group-1','ming',1);
  let data=await repo.read();
  assert.equal(groupOfEmployee(data,'ming'),undefined);
  assert.equal(data.employees.some(row=>row.id==='ming'&&row.active),true);
  await repo.saveGroup({name:'测试五组',version:0});
  data=await repo.read();
  const group=data.groups.at(-1);
  await repo.addGroupMembers(group.id,['ming'],group.version);
  data=await repo.read();
  assert.equal(groupOfEmployee(data,'ming').id,group.id);
  await assert.rejects(()=>repo.addGroupMembers(group.id,['former'],2),{code:'EMPLOYEE_NOT_ACTIVE'});
  await assert.rejects(()=>repo.removeGroupMember(group.id,'ming',1),{code:'VERSION_CONFLICT'});
});


test('overview module selections fit the screen without overlap; overflow paginates', async () => {
  const {autoLayout, OVERVIEW_MODULES, swapModules, moveModule}=await import('../src/domain/layout.js');
  const items=OVERVIEW_MODULES.map((type,i)=>({id:`test-${i}`,type,scope:'inherit'}));
  for(let mask=1;mask<64;mask++) {
    const selected=items.filter((_,index)=>mask&(1<<index));
    const pages=autoLayout(selected);
    assert.ok(pages.every(page=>validateLayout(page.components)));
    assert.deepEqual(pages.flatMap(page=>page.components.map(item=>item.id)),selected.map(item=>item.id));
  }
  const initial=autoLayout(items);
  assert.equal(initial.length,1);
  const moved=moveModule(initial[0].components,'test-1','right');
  assert.ok(moved.every(page=>validateLayout(page.components)));
  assert.equal(moved[0].components.find(item=>item.id==='test-1').x,12);
  assert.ok(swapModules(initial[0].components,'test-1','test-2').every(page=>validateLayout(page.components)));
  assert.equal(initial[0].components.find(item=>item.id==='test-1').x,0);
  assert.ok(autoLayout([...items,...items.map(item=>({...item,id:`copy-${item.id}`}))]).length>1);
  const repo=fresh();
  await assert.rejects(repo.createScreen('空方案','overview',[]));
  const screen=await repo.createScreen('选择模块','overview',['project','release']);
  assert.deepEqual(screen.pages.flatMap(page=>page.components.map(item=>item.type)),['project','release']);
});

test('screen project multi-selection scopes every dataset without leaking global opening points', async()=>{
  const {screenProjectIds,scopedScreenData,rotationSeconds}=await import('../src/domain/screen-scope.js');
  const data=createFixtures();
  const ids=screenProjectIds(data,{projectIds:['echo','moon','missing']});
  assert.deepEqual(ids,['echo','moon']);
  const scoped=scopedScreenData(data,ids);
  for(const key of ['projects','episodes','ledgers','charges','tasks','releases'])assert.ok(scoped[key].every(row=>ids.includes(key==='projects'?row.id:row.projectId)));
  assert.equal(scoped.consumptionOpening.points,0);
  assert.equal(data.consumptionOpening.points,5991760);
  assert.equal(screenProjectIds(data,{template:'overview'}).length,4);
  assert.deepEqual(screenProjectIds(data,{template:'project',projectId:'echo'}),['echo']);
  assert.equal(rotationSeconds(15),15);assert.equal(rotationSeconds(30),30);assert.equal(rotationSeconds('60'),60);assert.equal(rotationSeconds(0),15);
});

test('saved screen retains multiple projects and rotation interval and rejects invalid scope', async()=>{
 const repo=fresh();const screen=await repo.createScreen('多剧投屏','overview',['project','release']);
 const saved=await repo.saveScreen({...screen,projectIds:['echo','moon'],rotationSeconds:15});
 const read=await repo.read();const found=read.screens.find(row=>row.id===saved.id);
 assert.deepEqual(found.projectIds,['echo','moon']);assert.equal(found.rotationSeconds,15);
 await assert.rejects(repo.saveScreen({...saved,projectIds:[]}));
 await assert.rejects(repo.saveScreen({...saved,rotationSeconds:1}));
});
