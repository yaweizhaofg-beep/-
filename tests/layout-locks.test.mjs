import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultLayout, autoLayout, moveModule, swapModules, placeWidgetLocally, validateLayout } from '../src/domain/layout.js';
import { MockRepository } from '../src/data/mock-repository.js';

test('locked modules cannot move, resize, or act as a swap target',()=>{
  const items=defaultLayout();items[2].locked=true;
  assert.equal(moveModule(items,'w3','down'),null);
  assert.equal(swapModules(items,'w3','w4'),null);
  assert.equal(swapModules(items,'w4','w3'),null);
  assert.equal(placeWidgetLocally(items,{...items[2],y:3}),null);
});
test('automatic arrangement preserves the entire locked slot',()=>{
  const items=defaultLayout();items[2].locked=true;
  const pages=autoLayout(items);
  assert.equal(pages.length,1);
  assert.deepEqual(pages[0].components.find(row=>row.id==='w3'),items[2]);
});
test('adding a module fits around a locked anchor without changing its geometry',()=>{
  const items=defaultLayout();items[2].locked=true;
  items.splice(3,1);items.push({id:'replacement',type:'release',scope:'inherit'});
  const pages=autoLayout(items);
  assert.equal(pages.length,1);assert.ok(validateLayout(pages[0].components));
  assert.deepEqual(pages[0].components.find(row=>row.id==='w3'),items.find(row=>row.id==='w3'));
});
test('saved scheme retains lock after repository reload',async()=>{
  let stored;
  const storage={getItem:()=>stored||null,setItem:(_,value)=>{stored=value;},removeItem(){}};
  const repo=new MockRepository(storage),screen=(await repo.read()).screens[0];
  screen.pages[0].components[0].locked=true;
  await repo.saveScreen(screen);
  assert.equal((await new MockRepository(storage).read()).screens[0].pages[0].components[0].locked,true);
});
