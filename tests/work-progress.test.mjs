import test from 'node:test';
import assert from 'node:assert/strict';
import { employeeProjectStage, employeeWorkRows, ipDeliveryState } from '../src/domain/work-progress.js';
import { workProgressDetails, workProgressPreview, projectWorkTasks } from '../src/ui/work-progress.js';
import { createFixtures } from '../src/data/fixtures.js';

const project={id:'p',displayName:'案例剧',approvedAt:'2026-10-01T09:00:00+08:00',leaderId:'lead',members:['lead']};
const base=()=>({projects:[structuredClone(project)],employees:[{id:'a',name:'小明',active:true},{id:'lead',name:'组长',active:true},{id:'old',name:'离职员工',active:false}],groups:[{id:'g',name:'一组',memberIds:['a','lead']}],tasks:[],productionAssignments:[],generationRecords:[],productionUploads:[],productionHandoffs:[]});

test('work carousel includes every active member once, one slide per group and group controls',()=>{
  const data=createFixtures();
  const html=workProgressPreview(data);
  assert.equal((html.match(/data-work-group=/g)||[]).length,4);
  assert.equal((html.match(/data-group-employee=/g)||[]).length,32);
  assert.equal((html.match(/data-group-employee="li"/g)||[]).length,1);
  assert.match(html,/data-interval="15"/);
  assert.match(html,/aria-label="下一组"/);
  assert.match(workProgressPreview(data,{intervalSeconds:30}),/data-interval="30"/);
});

test('project task tab uses the same employee milestones as progress details and excludes other projects',()=>{
  const data=createFixtures();
  const rows=employeeWorkRows(data).filter(row=>row.projectId==='echo');
  const html=projectWorkTasks(data,'echo');
  for(const row of rows)assert.ok(html.includes(row.label));
  assert.equal((html.match(/<tr>/g)||[]).length,rows.length+1);
  assert.doesNotMatch(html,/月亮的来信|长安拾梦|执行中|待执行|当前剧组|task-filter/);
});

test('IP overdue days use Shanghai calendar dates and freeze on confirmed delivery',()=>{
  const data=base();data.now='2026-10-15T12:00:00+08:00';
  const p={...project,plannedEnd:'2026-10-14'};
  assert.equal(ipDeliveryState(data,p).label,'逾期1天');
  p.plannedEnd='2026-10-15';
  assert.equal(ipDeliveryState(data,p).label,'正常生产中');
  data.productionHandoffs.push({projectId:'p',version:1,approved:true,confirmedAt:'2026-10-16T01:00:00+08:00',finalUrl:'https://pan.baidu.com/s/final',employeeDurations:[{employeeId:'a',seconds:60}]});
  data.now='2026-10-20T12:00:00+08:00';
  assert.equal(ipDeliveryState(data,p).label,'逾期1天交付');
  p.plannedEnd='2026-10-17';
  assert.equal(ipDeliveryState(data,p).label,'已按期完成');
  delete p.plannedEnd;
  assert.equal(ipDeliveryState(data,p).planned,'待设置');
});

test('employee progresses only through software assignment, inference, upload and leader handoff',()=>{
  const data=base(), p=data.projects[0];
  assert.equal(employeeProjectStage(data,p,'a').label,'剧本与资产拆分中');
  data.productionAssignments.push({projectId:'p',employeeId:'a',assignedAt:'2026-10-02T09:00:00+08:00'});
  assert.equal(employeeProjectStage(data,p,'a').status,'pending');
  data.tasks.push({projectId:'p',assigneeId:'a',status:'completed'});
  assert.equal(employeeProjectStage(data,p,'a').status,'pending');
  data.generationRecords.push({projectId:'p',employeeId:'a',status:'running',inferenceStartedAt:'2026-10-03T09:00:00+08:00'});
  assert.equal(employeeProjectStage(data,p,'a').status,'running');
  data.productionUploads.push({projectId:'p',employeeId:'a',url:'https://pan.baidu.com/s/demo',uploadedAt:'2026-10-04T09:00:00+08:00'});
  assert.equal(employeeProjectStage(data,p,'a').status,'review');
  data.productionHandoffs.push({projectId:'p',version:1,approved:true,confirmedAt:'2026-10-05T09:00:00+08:00',finalUrl:'https://pan.baidu.com/s/final',employeeDurations:[{employeeId:'a',seconds:60}]});
  assert.equal(employeeProjectStage(data,p,'a').label,'项目已完成 · 进入运营');
  data.productionHandoffs[0].finalUrl='';
  assert.equal(employeeProjectStage(data,p,'a').status,'review');
});

test('new inference after upload returns employee to making; queued request is not inference',()=>{
  const data=base(), p=data.projects[0];p.members.push('a');
  data.generationRecords.push({projectId:'p',employeeId:'a',status:'queued'});
  assert.equal(employeeProjectStage(data,p,'a').status,'pending');
  data.productionUploads.push({projectId:'p',employeeId:'a',url:'https://example.com/wrong',uploadedAt:'2026-10-04'});
  assert.equal(employeeProjectStage(data,p,'a').status,'pending');
  data.productionUploads[0].url='https://pan.baidu.com/s/demo';
  data.generationRecords.push({projectId:'p',employeeId:'a',status:'running',startedAt:'2026-10-05'});
  assert.equal(employeeProjectStage(data,p,'a').status,'running');
});

test('group table includes active idle members and separate rows for multiple projects',()=>{
  const data=base();data.projects[0].members.push('a');
  data.projects.push({...project,id:'p2',displayName:'第二部',members:['a']});
  data.employees.push({id:'idle',name:'空闲员工',active:true});
  const rows=employeeWorkRows(data);
  assert.equal(rows.filter(row=>row.employeeId==='a').length,2);
  assert.equal(rows.find(row=>row.employeeId==='idle').label,'待分配');
  assert.equal(rows.some(row=>row.employeeId==='old'),false);
  assert.match(workProgressDetails(data),/当前节点/);
  const html=workProgressDetails(data);
  assert.equal((html.match(/data-work-employee="a"/g)||[]).length,1);
  assert.match(html,/class="work-progress-group" open/);
  assert.doesNotMatch(html,/<th>项目组长<\/th>/);
  assert.doesNotMatch(workProgressDetails(data),/截止日期|任务类型|离职员工/);
});
