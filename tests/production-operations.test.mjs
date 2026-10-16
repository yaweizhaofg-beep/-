import test from 'node:test';
import assert from 'node:assert/strict';
import { createFixtures } from '../src/data/fixtures.js';
import { MockRepository } from '../src/data/mock-repository.js';
import { generationShots, generatedPeople, productionCompletedAt, effectiveDurationRows, deadlineState } from '../src/domain/production.js';
import { contribution, monthlyMetrics } from '../src/domain/metrics.js';
import { workforceEfficiency } from '../src/domain/workforce.js';
const fresh=()=>new MockRepository({getItem:()=>null,setItem(){},removeItem(){}});
const operation={projectId:'changan',handoffId:'handoff-changan-v1',operationId:'',version:0,platform:'红果',workId:'DEMO-HG-1001',publishedAt:'2026-10-12T10:00',publishUrl:'https://example.com/demo-changan',views:400000,likes:18000,saves:6000,note:'演示运营回填'};

test('storyboard ownership counts inclusive ranges, excludes missing numbers and retries',()=>{
 const data=createFixtures(),people=generatedPeople(data,'echo','echo-ep1');
 assert.equal(people.find(row=>row.employeeId==='ming').count,100);
 assert.equal(people.find(row=>row.employeeId==='li').count,301);
 assert.equal(people.find(row=>row.employeeId==='li').ranges,'200—500');
 assert.equal(people.find(row=>row.employeeId==='li').seconds,216);
 assert.equal(generationShots(data,'echo','echo-ep1').length,461);
 const first=generationShots(data,'echo','echo-ep1')[0];
 data.generationRecords.push({...first,id:'latest-owner',employeeId:'zhao',generatedAt:'2026-10-06T12:00:00+08:00'});
 assert.equal(generatedPeople(data,'echo','echo-ep1').find(row=>row.employeeId==='ming').count,99);
 assert.equal(generationShots(data,'echo','echo-ep1').length,461);
});
test('all episodes approved does not finish production until final duration and Baidu link are submitted',()=>{
 const data=createFixtures();data.productionHandoffs=[];
 assert.ok(data.episodes.filter(row=>row.projectId==='changan').every(row=>row.approved));
 assert.equal(productionCompletedAt(data,'changan'),null);
 assert.equal(monthlyMetrics(data,'2026-10').completed,0);
 assert.equal(deadlineState(data,data.projects.find(row=>row.id==='changan')).tone,'error');
 const handoff=createFixtures().productionHandoffs[0];data.productionHandoffs.push({...handoff,finalUrl:''});
 assert.equal(productionCompletedAt(data,'changan'),null);
 data.productionHandoffs[0].finalUrl=handoff.finalUrl;
 assert.equal(productionCompletedAt(data,'changan'),handoff.confirmedAt);
});
test('final corrected durations replace stage totals consistently in contribution, monthly totals and employee efficiency',()=>{
 const data=createFixtures();data.productionHandoffs[0].employeeDurations=[{employeeId:'yue',seconds:1200},{employeeId:'li',seconds:1200},{employeeId:'hao',seconds:600}];
 assert.equal(contribution(data,'changan').total,3000);
 assert.equal(effectiveDurationRows(data,'changan').reduce((sum,row)=>sum+row.seconds,0),3000);
 assert.equal(monthlyMetrics(data,'2026-10').minutes,94);
 assert.equal(workforceEfficiency(data,'2026-10').find(row=>row.id==='yue').minutes,22.4);
});
test('handoff receipt is idempotent and incomplete production cannot enter operations',async()=>{
 const repo=fresh();await assert.rejects(repo.receiveHandoff('missing'));
 await repo.receiveHandoff(operation.handoffId);await repo.receiveHandoff(operation.handoffId);
 assert.equal((await repo.read()).operationReceipts.length,1);
});
test('operations reject missing receipt, early publish time, invalid counts and stale versions',async()=>{
 const repo=fresh();await assert.rejects(repo.saveOperation(operation),{code:'RECEIPT_REQUIRED'});
 await repo.receiveHandoff(operation.handoffId);
 await assert.rejects(repo.saveOperation({...operation,publishedAt:'2026-10-10T09:00'}),{code:'INVALID_PUBLISH_TIME'});
 await assert.rejects(repo.saveOperation({...operation,views:-1}),{code:'INVALID_OPERATION'});
 await assert.rejects(repo.saveOperation({...operation,publishUrl:'javascript:alert(1)'}),{code:'INVALID_PUBLISH_URL'});
 assert.equal((await repo.read()).operations.length,0);
});
test('operator publication updates one platform snapshot, preserves history and never modifies production timestamps',async()=>{
 const repo=fresh();await repo.receiveHandoff(operation.handoffId);const before=await repo.read();
 const record=await repo.saveOperation(operation);const saved=await repo.read();
 assert.equal(saved.operations.length,1);assert.equal(saved.operations[0].handoffId,operation.handoffId);
 assert.equal(saved.releases.filter(row=>row.projectId==='changan'&&row.platform==='红果'&&row.workId===operation.workId).length,1);
 assert.equal(saved.releases.find(row=>row.projectId==='changan').views,400000);
 assert.equal(saved.releaseHistory.length,before.releaseHistory.length+1);
 assert.deepEqual(saved.productionHandoffs,before.productionHandoffs);assert.deepEqual(saved.productionUploads,before.productionUploads);
 await assert.rejects(repo.saveOperation(operation),{code:'DUPLICATE_OPERATION'});
 await assert.rejects(repo.saveOperation({...operation,operationId:record.id,version:0}),{code:'VERSION_CONFLICT'});
 await repo.saveOperation({...operation,operationId:record.id,version:record.version,views:450000});
 assert.equal((await repo.read()).operations.length,1);
});
test('a superseding software handoff invalidates an open operator form',async()=>{
 const repo=fresh();await repo.receiveHandoff(operation.handoffId);
 const previous=repo.state.productionHandoffs[0];repo.state.productionHandoffs.push({...previous,id:'handoff-changan-v2',version:2,confirmedAt:'2026-10-13T10:00:00+08:00'});
 await assert.rejects(repo.saveOperation(operation),{code:'STALE_HANDOFF'});
 assert.equal(repo.state.operations.length,0);
});

test('unfinished carousel uses complete software aggregate rather than partial generation detail',async()=>{
 const {productionGenerationProgress}=await import('../src/domain/production.js');
 const data=createFixtures();const echo=productionGenerationProgress(data,'echo');
 assert.equal(echo.generated,780);assert.equal(echo.total,1200);assert.equal(echo.percentage,65);
 assert.equal(generationShots(data,'echo').length,461);
 assert.equal(echo.people.reduce((sum,row)=>sum+row.count,0),780);
 const pending=productionGenerationProgress({...data,productionProgress:[]},'echo');
 assert.equal(pending.percentage,null);assert.equal(pending.total,null);
 assert.equal(productionGenerationProgress(data,'mist').percentage,0);
 const invalid=productionGenerationProgress({...data,productionProgress:[{projectId:'echo',generatedShots:1201,totalShots:1200,employees:[]}]},'echo');
 assert.equal(invalid.percentage,null);assert.equal(invalid.invalid,true);
 assert.ok(productionCompletedAt(data,'changan'));
});
