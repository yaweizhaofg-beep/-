import test from 'node:test';
import assert from 'node:assert/strict';
import { createFixtures } from '../src/data/fixtures.js';
import { workforceEfficiency, groupEfficiency, memberWorkState } from '../src/domain/workforce.js';

test('employee efficiency uses net monthly points, latest confirmed duration and ascending competition ranks',()=>{
 const data=createFixtures();
 const rows=workforceEfficiency(data,'2026-10');
 const ming=rows.find(row=>row.id==='ming');
 assert.equal(ming.minutes,18);assert.equal(ming.points,1360);assert.equal(ming.ratio,1360/18);
 const ranked=rows.filter(row=>row.rank!==null);
 assert.ok(ranked.every((row,i)=>!i||row.ratio>=ranked[i-1].ratio));
 assert.ok(rows.filter(row=>row.minutes===0).every(row=>row.rank===null&&row.ratio===null));
 assert.ok(rows.every(row=>data.employees.some(person=>person.id===row.id&&person.active)));
 data.charges.push({id:'later',employeeId:'ming',projectId:'echo',points:9000,postedAt:'2026-11-01'});
 assert.equal(workforceEfficiency(data,'2026-10').find(row=>row.id==='ming').points,1360);
 const first=data.ledgers.find(row=>row.projectId==='echo');
 data.ledgers.push({...structuredClone(first),version:2});
 assert.equal(workforceEfficiency(data,'2026-10').find(row=>row.id==='ming').minutes,18);
});
test('missing cost, refunds and zero duration are not silently ranked as cheap output',()=>{
 const data=createFixtures();
 data.charges=data.charges.filter(row=>row.employeeId!=='ming');
 assert.equal(workforceEfficiency(data,'2026-10').find(row=>row.id==='ming').reason,'消耗待同步');
 data.charges.push({id:'refund',employeeId:'ming',projectId:'echo',points:-10,postedAt:'2026-10-08'});
 assert.equal(workforceEfficiency(data,'2026-10').find(row=>row.id==='ming').rank,null);
 assert.equal(workforceEfficiency(data,'2026-10').find(row=>row.id==='ming').reason,'退款冲销中');
});
test('editing, review, blocked and finished states derive from tasks across project crews',()=>{
 const data=createFixtures();
 data.tasks=[{id:'editing',assigneeId:'ming',projectId:'moon',type:'剪辑制作',status:'running',due:'2026-10-16'}, {id:'review',assigneeId:'ming',projectId:'echo',type:'视频制作',status:'review',due:'2026-10-16'}];
 assert.deepEqual(memberWorkState(data,'ming','2026-10').states.map(row=>row.label),['剪辑中','待确认']);
 data.tasks[0].status='completed';data.tasks[1].status='completed';
 assert.equal(memberWorkState(data,'ming','2026-10').states[0].label,'已完成');
 assert.equal(memberWorkState(data,'li','2026-10').states[0].label,'待分配');
 data.tasks[0].status='blocked';assert.equal(memberWorkState(data,'ming','2026-10').states[0].label,'受阻');
});
test('a transfer changes displayed current group, not group efficiency historical attribution',()=>{
 const data=createFixtures();const before=groupEfficiency(data,'2026-10');
 data.groups[0].memberIds=data.groups[0].memberIds.filter(id=>id!=='ming');data.groups[1].memberIds.push('ming');
 assert.deepEqual(groupEfficiency(data,'2026-10'),before);
 assert.equal(workforceEfficiency(data,'2026-10').find(row=>row.id==='ming').groupName,data.groups[1].name);
});

test('project bar ranking excludes cost and duration from other dramas',async()=>{
 const {projectEmployeeEfficiency}=await import('../src/domain/workforce.js');
 const data=createFixtures();const rows=projectEmployeeEfficiency(data,'echo');
 const li=rows.find(row=>row.id==='li');assert.equal(li.minutes,10.8);assert.equal(li.points,864);assert.equal(li.ratio,80);
 const ming=rows.find(row=>row.id==='ming');assert.equal(ming.rank,1);assert.equal(ming.ratio,1360/18);
 assert.equal(rows.find(row=>row.id==='lead-lin').rank,null);
 assert.ok(!rows.some(row=>row.id==='hao'));
});
