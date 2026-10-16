import test from 'node:test';
import assert from 'node:assert/strict';
import {createFixtures} from '../src/data/fixtures.js';
import {modelDateRange,modelConsumption,shanghaiDay} from '../src/domain/model-consumption.js';
import {scopedScreenData} from '../src/domain/screen-scope.js';

test('model donut reconciles gross charges, refunds, independent video outputs and scope',()=>{
 const data=createFixtures(),range=modelDateRange('2026-10');
 const summary=modelConsumption(data,range),seedance=summary.rows.find(row=>row.id==='seedance-2.0');
 assert.equal(summary.consumed,8320);assert.equal(summary.refunds,80);assert.equal(summary.net,8240);
 assert.equal(seedance.videos,400);assert.equal(seedance.consumed,4800);assert.equal(summary.videos,471);
 assert.ok(Math.abs(summary.rows.reduce((sum,row)=>sum+row.share,0)-100)<1e-8);
 const echo=modelConsumption(scopedScreenData(data,['echo']),range);
 assert.equal(echo.net,2800);assert.equal(echo.rows.length,1);assert.equal(echo.videos,60);
});
test('date selection is inclusive, validates invalid intervals, and uses Shanghai calendar boundaries',()=>{
 assert.equal(shanghaiDay('2026-10-14T16:00:00Z'),'2026-10-15');
 assert.deepEqual(modelDateRange('2026-10',{period:'day'},'2026-10-14T16:00:00Z'),{period:'day',start:'2026-10-15',end:'2026-10-15'});
 assert.equal(modelDateRange('2024-02').end,'2024-02-29');
 assert.throws(()=>modelDateRange('2026-10',{period:'custom',start:'2026-10-20',end:'2026-10-01'}));
 assert.throws(()=>modelDateRange('2026-10',{period:'custom',start:'2026-02-30',end:'2026-03-01'}));
 const summary=modelConsumption(createFixtures(),modelDateRange('2026-10',{period:'custom',start:'2026-10-05',end:'2026-10-05'}));
 assert.ok(summary.records.length>0&&summary.records.every(row=>row.date==='2026-10-05'));
});
test('refund-only and empty windows never produce negative or NaN donut shares',()=>{
 const data=createFixtures();const summary=modelConsumption(data,{start:'2026-10-13',end:'2026-10-13'});
 assert.equal(summary.consumed,0);assert.equal(summary.refunds,80);assert.equal(summary.net,-80);
 assert.ok(summary.rows.every(row=>row.share===0));
 assert.equal(modelConsumption(data,{start:'2026-11-01',end:'2026-11-02'}).rows.length,0);
});
test('billing fallback does not equate cost rows with successfully generated videos and excludes images',()=>{
 const data=createFixtures();delete data.modelUsageDaily;
 data.charges.push({id:'image-only',projectId:'echo',postedAt:'2026-10-05T16:00:00+08:00',kind:'image',model:'Seedream',points:10000});
 const summary=modelConsumption(scopedScreenData(data,['echo']),modelDateRange('2026-10'));
 assert.equal(summary.videos,null);assert.equal(summary.net,2800);assert.ok(!summary.rows.some(row=>row.name==='Seedream'));
});
