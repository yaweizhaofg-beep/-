/** Production-owned events are read-only on the management web application. */
export function latestHandoff(data,projectId) {
  return (data.productionHandoffs||[]).filter(row=>row.projectId===projectId).sort((a,b)=>b.version-a.version||String(b.confirmedAt||'').localeCompare(String(a.confirmedAt||'')))[0]||null;
}
export function validBaiduUrl(value) {
  try {const url=new URL(value);return url.protocol==='https:'&&(url.hostname==='pan.baidu.com'||url.hostname.endsWith('.pan.baidu.com'));}catch{return false;}
}
export function productionCompletedAt(data,projectId) {
  const handoff=latestHandoff(data,projectId);
  return validHandoff(handoff)?handoff.confirmedAt:null;
}
function validHandoff(handoff) {
 return Boolean(handoff?.approved&&Number.isFinite(Date.parse(handoff.confirmedAt))&&validBaiduUrl(handoff.finalUrl)&&Array.isArray(handoff.employeeDurations)&&handoff.employeeDurations.every(row=>Number.isFinite(row.seconds)&&row.seconds>=0)&&handoff.employeeDurations.some(row=>row.seconds>0));
}
export function deadlineState(data,project) {
  const finished=productionCompletedAt(data,project.id);
  const due=new Date(`${project.plannedEnd}T23:59:59+08:00`).getTime();
  const elapsed=new Date(finished||data.now).getTime()-due;
  if(!Number.isFinite(due))return {label:'尚未设置计划',tone:'neutral'};
  if(finished)return {label:elapsed>0?'逾期交付':'按期交付',tone:elapsed>0?'warning':'success'};
  if(elapsed>0)return {label:`已超时${Math.ceil(elapsed/86400000)}天`,tone:'error'};
  return {label:-elapsed<=86400000?'24小时内到期':`距交付${Math.ceil(-elapsed/86400000)}天`,tone:-elapsed<=86400000?'warning':'neutral'};
}
/** Retry attempts do not inflate storyboard output; the latest current successful owner wins. */
export function generationShots(data,projectId,episodeId=null) {
  const shots=new Map();
  for(const row of data.generationRecords||[]) {
    if(row.projectId!==projectId||(episodeId&&row.episodeId!==episodeId)||row.status!=='succeeded'||row.current===false)continue;
    const key=`${row.projectId}:${row.episodeId}:${row.shotId}`;
    const previous=shots.get(key);
    if(!previous||row.generatedAt>previous.generatedAt||(row.generatedAt===previous.generatedAt&&row.id>previous.id))shots.set(key,row);
  }
  return [...shots.values()].sort((a,b)=>a.shotNumber-b.shotNumber);
}
export function shotRanges(shots) {
  const values=[...new Set(shots.map(row=>row.shotNumber))].sort((a,b)=>a-b);
  const ranges=[];
  for(const value of values){const last=ranges.at(-1);if(last&&value===last[1]+1)last[1]=value;else ranges.push([value,value]);}
  return ranges.map(([start,end])=>start===end?`${start}`:`${start}—${end}`).join('、')||'—';
}
export function generatedPeople(data,projectId,episodeId=null) {
  const shots=generationShots(data,projectId,episodeId), people=new Map();
  for(const shot of shots){if(!people.has(shot.employeeId))people.set(shot.employeeId,[]);people.get(shot.employeeId).push(shot);}
  const latest=new Map();
  for(const ledger of (data.ledgers||[]).filter(row=>row.projectId===projectId&&row.confirmed&&(!episodeId||row.episodeId===episodeId))){const old=latest.get(ledger.episodeId);if(!old||ledger.version>old.version)latest.set(ledger.episodeId,ledger);}
  const effective=episodeId?[...latest.values()].flatMap(row=>row.rows):effectiveDurationRows(data,projectId);
  for(const row of effective)if(row.employeeId&&!people.has(row.employeeId))people.set(row.employeeId,[]);
  return [...people].map(([employeeId,records])=>({employeeId,count:records.length,ranges:shotRanges(records),firstAt:records.map(row=>row.generatedAt).sort()[0],lastAt:records.map(row=>row.generatedAt).sort().at(-1),seconds:effective.filter(row=>row.employeeId===employeeId).reduce((sum,row)=>sum+row.seconds,0),uploads:(data.productionUploads||[]).filter(row=>row.projectId===projectId&&row.employeeId===employeeId&&(!episodeId||row.episodeId===episodeId))}));
}
export function firstProductionCompletedAt(data,projectId) {
 return (data.productionHandoffs||[]).filter(row=>row.projectId===projectId&&validHandoff(row)).map(row=>row.confirmedAt).sort()[0]||null;
}
/** Final leader values replace stage values; matching ledgers retain their per-episode dates. */
export function effectiveDurationRows(data,projectId) {
 const latest=new Map();
 for(const ledger of (data.ledgers||[]).filter(row=>row.projectId===projectId&&row.confirmed)){const old=latest.get(ledger.episodeId);if(!old||ledger.version>old.version)latest.set(ledger.episodeId,ledger);}
 const stage=[...latest.values()].flatMap(ledger=>ledger.rows.map(row=>({...row,episodeId:ledger.episodeId,projectId})));
 const handoff=latestHandoff(data,projectId);
 if(!productionCompletedAt(data,projectId))return stage;
 const ids=new Set([...stage.map(row=>row.employeeId),...handoff.employeeDurations.map(row=>row.employeeId)]);
 const equal=[...ids].every(id=>Math.abs(stage.filter(row=>row.employeeId===id).reduce((sum,row)=>sum+row.seconds,0)-handoff.employeeDurations.filter(row=>row.employeeId===id).reduce((sum,row)=>sum+row.seconds,0))<.001);
 return equal?stage:handoff.employeeDurations.map(row=>({...row,projectId,episodeId:null,leaderId:handoff.leaderId,groupId:row.groupId||handoff.groupId||null,producedOn:row.producedOn||handoff.confirmedAt.slice(0,10)}));
}
/** Whole-project progress comes from the software aggregate, not partial detail pages. */
export function productionGenerationProgress(data,projectId) {
 const source=(data.productionProgress||[]).find(row=>row.projectId===projectId);
 const shots=generationShots(data,projectId);
 const generated=Number.isInteger(source?.generatedShots)&&source.generatedShots>=0?source.generatedShots:shots.length;
 const total=Number.isInteger(source?.totalShots)&&source.totalShots>0?source.totalShots:null;
 const percentage=total!==null&&generated<=total?generated/total*100:null;
 const grouped=new Map();
 for(const shot of shots)grouped.set(shot.employeeId,(grouped.get(shot.employeeId)||0)+1);
 const people=Array.isArray(source?.employees)?source.employees.map(row=>({employeeId:row.employeeId,count:row.generatedShots})):[...grouped].map(([employeeId,count])=>({employeeId,count}));
 const validPeople=people.every(row=>Number.isInteger(row.count)&&row.count>=0)&&people.reduce((sum,row)=>sum+row.count,0)===generated;
 return {generated,total,percentage,aggregate:Boolean(source),people:validPeople?people.filter(row=>row.count>0):[],invalid:total!==null&&generated>total};
}
