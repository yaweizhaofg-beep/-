const calendarDay=value=>/^\d{4}-\d{2}-\d{2}$/.test(value||'')&&Number.isFinite(Date.parse(`${value}T00:00:00Z`))&&new Date(`${value}T00:00:00Z`).toISOString().slice(0,10)===value;
export function shanghaiDay(value=new Date()) {
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(value));
 const get=type=>parts.find(part=>part.type===type).value;
 return `${get('year')}-${get('month')}-${get('day')}`;
}
export function modelDateRange(month,options={},now=new Date()) {
 const period=options.period||'month';
 if(period==='day'){const date=shanghaiDay(now);return {period,start:date,end:date};}
 if(period==='custom'){
  if(!calendarDay(options.start)||!calendarDay(options.end)||options.start>options.end)throw new Error('请选择有效的起止日期，结束日期不能早于开始日期。');
  return {period,start:options.start,end:options.end};
 }
 const [year,m]=month.split('-').map(Number);
 if(!Number.isInteger(year)||!Number.isInteger(m)||m<1||m>12)throw new Error('请选择有效月份。');
 return {period:'month',start:`${month}-01`,end:`${month}-${new Date(Date.UTC(year,m,0)).getUTCDate()}`};
}
/** Successful videos come from output aggregation. Billing rows are never counted as videos. */
export function modelConsumption(data,range) {
 const ids=new Set(data.projects.map(project=>project.id));
 let source=data.modelUsageDaily;
 if(!Array.isArray(source))source=data.charges.filter(row=>row.kind==='video'||row.kind==='refund').map(row=>({date:shanghaiDay(row.postedAt),projectId:row.projectId,modelId:row.model||'unknown',modelName:row.model||'未知模型',mediaType:'video',consumedPoints:Math.max(0,row.points),refundedPoints:Math.max(0,-row.points),successfulVideos:null}));
 const records=source.filter(row=>row.mediaType==='video'&&ids.has(row.projectId)&&row.date>=range.start&&row.date<=range.end);
 const grouped=new Map();
 for(const row of records){
  const key=row.modelId||row.modelName||'unknown';
  if(!grouped.has(key))grouped.set(key,{id:key,name:row.modelName||row.modelId||'未知模型',consumed:0,refunds:0,videos:0});
  const model=grouped.get(key);model.consumed+=Number(row.consumedPoints)||0;model.refunds+=Number(row.refundedPoints)||0;
  if(!Number.isInteger(row.successfulVideos)||row.successfulVideos<0)model.videos=null;else if(model.videos!==null)model.videos+=row.successfulVideos;
 }
 const consumed=[...grouped.values()].reduce((sum,row)=>sum+row.consumed,0),refunds=[...grouped.values()].reduce((sum,row)=>sum+row.refunds,0);
 const rows=[...grouped.values()].map(row=>({...row,net:row.consumed-row.refunds,share:consumed>0?row.consumed/consumed*100:0})).sort((a,b)=>b.consumed-a.consumed||a.id.localeCompare(b.id));
 const videos=rows.some(row=>row.videos===null)?null:rows.reduce((sum,row)=>sum+row.videos,0);
 const catalog=[...new Map(source.filter(row=>row.mediaType==='video'&&ids.has(row.projectId)).map(row=>[row.modelId||row.modelName,{id:row.modelId||row.modelName,name:row.modelName||row.modelId}])).values()];
 return {rows,records,catalog,consumed,refunds,net:consumed-refunds,videos};
}
