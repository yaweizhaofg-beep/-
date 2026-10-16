/** Independent fictional output counts; costs reconcile to the demonstration billing ledger. */
export function modelUsageFixtures(data) {
 const counts={'echo:2026-10-05':18,'echo:2026-10-06':22,'echo:2026-10-07':20,'changan:2026-10-05':64,'changan:2026-10-06':70,'changan:2026-10-07':62,'changan:2026-10-08':66,'changan:2026-10-09':71,'changan:2026-10-10':67,'moon:2026-10-05':11};
 const grouped=new Map();
 for(const charge of data.charges.filter(row=>row.kind==='video'||row.kind==='refund')){
  const seedance=charge.model==='Seedance';
  const modelId=seedance?'seedance-2.0':'sora',modelName=seedance?'Seedance 2.0':'Sora';
  const date=charge.postedAt.slice(0,10),key=`${charge.projectId}:${date}:${modelId}`;
  if(!grouped.has(key))grouped.set(key,{date,projectId:charge.projectId,modelId,modelName,mediaType:'video',successfulVideos:counts[`${charge.projectId}:${date}`]||0,consumedPoints:0,refundedPoints:0,source:'fictional-model-aggregate'});
  const row=grouped.get(key);row.consumedPoints+=Math.max(0,charge.points);row.refundedPoints+=Math.max(0,-charge.points);
 }
 return [...grouped.values()];
}
