import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultLayout, swapModules, validateLayout, autoLayout, OVERVIEW_MODULES, placeWidgetLocally, moveModule } from '../src/domain/layout.js';
import { MockRepository } from '../src/data/mock-repository.js';

test('dragging a module onto another swaps their slots without moving unrelated modules',()=>{
  const items=defaultLayout();
  const pages=swapModules(items,'w3','w4');
  assert.equal(pages.length,1);
  const result=pages[0].components;
  assert.ok(validateLayout(result));
  assert.deepEqual(result.find(row=>row.id==='w2'),items.find(row=>row.id==='w2'));
  const from=result.find(row=>row.id==='w3'), target=items.find(row=>row.id==='w4');
  assert.deepEqual([from.x,from.y,from.w,from.h],[target.x,target.y,target.w,target.h]);
});

test('different-width modules adapt to swapped slots without moving any peer',()=>{
  const items=autoLayout(OVERVIEW_MODULES.map(type=>({id:type,type})))[0].components;
  const before=structuredClone(items);
  const pages=swapModules(items,'teams','instruments');
  assert.equal(pages.length,1);
  assert.ok(validateLayout(pages[0].components));
  for(const item of items.filter(row=>!['teams','instruments'].includes(row.id)))assert.deepEqual(pages[0].components.find(row=>row.id===item.id),item);
  assert.deepEqual(items,before);
  assert.equal(pages[0].components.find(row=>row.id==='teams').y,items.find(row=>row.id==='instruments').y);
});

test('every arrow move changes at most the selected module and one target',()=>{
  const items=autoLayout(OVERVIEW_MODULES.map(type=>({id:type,type})))[0].components;
  for(const item of items)for(const direction of ['up','down','left','right']){
    const pages=moveModule(items,item.id,direction);
    if(!pages)continue;
    assert.equal(pages.length,1);assert.ok(validateLayout(pages[0].components));
    const changed=items.filter(row=>JSON.stringify(row)!==JSON.stringify(pages[0].components.find(next=>next.id===row.id)));
    assert.equal(changed.length,2);assert.ok(changed.some(row=>row.id===item.id));
  }
});

test('free-position collision never pushes neighbouring modules out of the way',()=>{
  const items=defaultLayout();
  assert.equal(placeWidgetLocally(items,{...items[2],x:0,y:2}),null);
  assert.deepEqual(items,defaultLayout());
});

test('saving a second page is rejected without changing the stored scheme',async()=>{
  const repo=new MockRepository({getItem:()=>null,setItem(){},removeItem(){}});
  const screen=(await repo.read()).screens[0];
  await assert.rejects(repo.saveScreen({...screen,pages:[...screen.pages,...screen.pages]}),/只支持一页/);
  assert.deepEqual((await repo.read()).screens[0],screen);
});
