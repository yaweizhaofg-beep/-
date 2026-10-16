import test from 'node:test';
import assert from 'node:assert/strict';
import { installEditorInteractions } from '../src/ui/editor-interactions.js';

test('pointer drag keeps the DOM stable while moving and commits once on release',()=>{
  const original={document:globalThis.document,window:globalThis.window,requestAnimationFrame:globalThis.requestAnimationFrame,cancelAnimationFrame:globalThis.cancelAnimationFrame};
  const handlers=new Map();let frame;
  const classes=()=>({add(){},remove(){}});
  const canvas={getBoundingClientRect:()=>({left:0,top:0,width:240,height:120}),querySelectorAll:()=>[first,second]};
  const widget=(id,left)=>({dataset:{widget:id},classList:classes(),style:{removeProperty(){}},setPointerCapture(){},getBoundingClientRect:()=>({left,right:left+120,top:0,bottom:120,width:120,height:120}),closest(selector){return selector==='#editor-canvas'?canvas:selector==='[data-widget]'?this:null;}});
  const first=widget('a',0),second=widget('b',120);
  const commits=[],selections=[];
  try {
    globalThis.document={body:{classList:classes()},addEventListener:(name,fn)=>handlers.set(name,fn)};
    globalThis.window={addEventListener(){}};
    globalThis.requestAnimationFrame=fn=>{frame=fn;return 1;};globalThis.cancelAnimationFrame=()=>{};
    installEditorInteractions({getItems:()=>[{id:'a',x:0,y:0,w:12,h:12}],onSelect:id=>selections.push(id),onDrop:(...args)=>commits.push(args),onResize(){}});
    handlers.get('pointerdown')({button:0,target:first,pointerId:1,clientX:20,clientY:20,preventDefault(){}});
    for(let x=30;x<=160;x+=10){handlers.get('pointermove')({clientX:x,clientY:40});frame();}
    assert.equal(commits.length,0);
    assert.equal(selections.length,0);
    assert.equal(first.style.transform,'translate3d(140px,20px,0)');
    handlers.get('pointerup')({clientX:160,clientY:40});
    assert.equal(commits.length,1);
    assert.equal(commits[0][1],'b');
  } finally {Object.assign(globalThis,original);}
});
