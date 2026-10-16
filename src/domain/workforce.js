import { effectiveDurationRows } from './production.js';
import { activeEmployees, latestLedgers, monthOf, sum } from './metrics.js';
import { groupOfEmployee, groupSummaries } from './groups.js';

/** A person can work across project crews; organisation membership never filters their workload. */
export function memberWorkState(data, employeeId, month) {
  const tasks=data.tasks.filter(task=>task.assigneeId===employeeId&&task.status!=='cancelled'&&(monthOf(task.completedAt||task.due||task.createdAt)===month||(monthOf(data.now)===month&&['running','review','blocked'].includes(task.status))));
  const labels=new Map();
  for(const task of tasks.filter(task=>['running','review','blocked'].includes(task.status))) {
    const label=task.status==='blocked'?'受阻':task.status==='review'?'待确认':/剪辑|精剪|后期/.test(`${task.type} ${task.name}`)?'剪辑中':'制作中';
    labels.set(label,(labels.get(label)||0)+1);
  }
  if(!labels.size) {
    if(tasks.some(task=>task.status==='pending'))labels.set('待开始',tasks.filter(task=>task.status==='pending').length);
    else if(tasks.length&&tasks.every(task=>task.status==='completed'))labels.set('已完成',tasks.length);
    else labels.set('待分配',0);
  }
  return {states:[...labels].map(([label,count])=>({label,count})),tasks};
}
function efficiency(points, minutes, hasCharges) {
  if(minutes<=0)return {ratio:null,reason:points>0?'尚无有效产出':'暂无有效时长'};
  if(!hasCharges)return {ratio:null,reason:'消耗待同步'};
  if(points<0)return {ratio:null,reason:'退款冲销中'};
  return {ratio:points/minutes,reason:''};
}
function ranked(rows) {
  const sorted=rows.sort((a,b)=>(a.ratio??Infinity)-(b.ratio??Infinity)||b.minutes-a.minutes||a.id.localeCompare(b.id));
  let rank=0,previous=null;
  return sorted.map((row,index)=>{
    if(row.ratio!==null){if(previous===null||Math.abs(row.ratio-previous)>1e-9)rank=index+1;previous=row.ratio;}
    return {...row,rank:row.ratio===null?null:rank};
  });
}
export function workforceEfficiency(data,month) {
  const rows=data.projects.flatMap(project=>effectiveDurationRows(data,project.id)).filter(row=>monthOf(row.producedOn)===month);
  return ranked(activeEmployees(data).map(person=>{
    const charges=data.charges.filter(row=>row.employeeId===person.id&&monthOf(row.postedAt)===month);
    const points=sum(charges.map(row=>row.points));
    const minutes=sum(rows.filter(row=>row.employeeId===person.id).map(row=>row.seconds))/60;
    return {id:person.id,name:person.name,groupName:groupOfEmployee(data,person.id)?.name||'待分配',points,minutes,...efficiency(points,minutes,charges.length>0)};
  }));
}
export function groupEfficiency(data,month) {
  return ranked(groupSummaries(data,month).map(group=>({id:group.id,name:group.name,points:group.points,minutes:group.minutes,...efficiency(group.points,group.minutes,group.charges.length>0)})));
}
/** Project detail ranks only this project's recorded cost and confirmed effective duration. */
export function projectEmployeeEfficiency(data,projectId) {
 const rows=effectiveDurationRows(data,projectId);
 const charges=data.charges.filter(row=>row.projectId===projectId);
 const project=data.projects.find(row=>row.id===projectId);
 const ids=new Set([...(project?.members||[]),...rows.map(row=>row.employeeId),...charges.map(row=>row.employeeId)]);
 return ranked(activeEmployees(data).filter(person=>ids.has(person.id)).map(person=>{
   const ownCharges=charges.filter(row=>row.employeeId===person.id);
   const points=sum(ownCharges.map(row=>row.points));
   const minutes=sum(rows.filter(row=>row.employeeId===person.id).map(row=>row.seconds))/60;
   return {id:person.id,name:person.name,points,minutes,...efficiency(points,minutes,ownCharges.length>0)};
 }));
}
