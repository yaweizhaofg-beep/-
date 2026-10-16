/** Fictional production-software payload; no requests to Baidu or real publishing platforms. */
export function productionFixtures(data) {
  const generationRecords=[];
  const generate=(projectId,episodeId,employeeId,start,end,date)=>{
    for(let shotNumber=start;shotNumber<=end;shotNumber++)generationRecords.push({id:`gen-${projectId}-${episodeId}-${shotNumber}`,projectId,episodeId,shotId:`shot-${shotNumber}`,shotNumber,employeeId,status:'succeeded',current:true,generatedAt:`${date}T${String(9+Math.floor((shotNumber-start)/60)%8).padStart(2,'0')}:${String((shotNumber-start)%60).padStart(2,'0')}:00+08:00`,videoSeconds:5,source:'production-software'});
  };
  generate('echo','echo-ep1','ming',1,100,'2026-10-05');
  generate('echo','echo-ep1','li',200,500,'2026-10-05');
  generate('echo','echo-ep1','zhao',501,560,'2026-10-05');
  generate('changan','changan-ep1','yue',1,90,'2026-10-05');
  generate('changan','changan-ep1','li',91,140,'2026-10-05');
  generate('changan','changan-ep1','hao',141,180,'2026-10-05');
  generate('moon','moon-ep1','zhao',1,70,'2026-10-10');
  generate('moon','moon-ep1','yue',71,100,'2026-10-10');
  generationRecords.push({...generationRecords[0],id:'gen-echo-old-retry',current:false,generatedAt:'2026-10-04T15:00:00+08:00'});
  const productionUploads=[['echo','ming','echo-ep1','2026-10-05T17:00:00+08:00'],['echo','li','echo-ep1','2026-10-05T17:20:00+08:00'],['changan','yue','changan-ep1','2026-10-10T16:00:00+08:00'],['changan','li','changan-ep1','2026-10-10T16:20:00+08:00'],['changan','hao','changan-ep1','2026-10-10T16:40:00+08:00']].map(([projectId,employeeId,episodeId,uploadedAt],index)=>({id:`upload-${index}`,projectId,employeeId,episodeId,uploadedAt,url:`https://pan.baidu.com/s/DEMO-${projectId}-${employeeId}`,source:'production-software'}));
  const totals=new Map();
  for(const row of data.ledgers.filter(ledger=>ledger.projectId==='changan'&&ledger.confirmed).flatMap(ledger=>ledger.rows))totals.set(row.employeeId,(totals.get(row.employeeId)||0)+row.seconds);
  const productionHandoffs=[{id:'handoff-changan-v1',projectId:'changan',version:1,groupId:'group-2',approved:true,confirmedAt:'2026-10-11T09:00:00+08:00',leaderId:'lead-xu',finalUrl:'https://pan.baidu.com/s/DEMO-CHANGAN-FINAL',accessCode:'DEMO',employeeDurations:[...totals].map(([employeeId,seconds])=>({employeeId,seconds})),source:'production-software'}];
  const productionProgress=[
    {projectId:'echo',generatedShots:780,totalShots:1200,employees:[{employeeId:'ming',generatedShots:280},{employeeId:'li',generatedShots:340},{employeeId:'zhao',generatedShots:160}]},
    {projectId:'changan',generatedShots:1080,totalShots:1080,employees:[{employeeId:'yue',generatedShots:540},{employeeId:'li',generatedShots:324},{employeeId:'hao',generatedShots:216}]},
    {projectId:'moon',generatedShots:100,totalShots:400,employees:[{employeeId:'zhao',generatedShots:70},{employeeId:'yue',generatedShots:30}]},
    {projectId:'mist',generatedShots:0,totalShots:500,employees:[]}
  ].map(row=>({...row,source:'production-software',syncedAt:data.now}));
  return {generationRecords,productionUploads,productionHandoffs,productionProgress,operations:[],operationReceipts:[]};
}
