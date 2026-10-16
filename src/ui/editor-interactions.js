/** Pointer gestures keep the canvas DOM stable until release; no application render on move. */
export function installEditorInteractions({getItems,onSelect,onDrop,onResize}) {
  let gesture=null, frame=0, swallowClickUntil=0;
  const clearTarget=()=>{if(gesture?.target)gesture.target.classList.remove('drop-target');};
  function paint() {
    frame=0;
    const g=gesture;
    if(!g?.moved)return;
    const dx=g.x-g.startX,dy=g.y-g.startY;
    if(g.resize) {
      g.element.style.width=`${Math.max(40,g.bounds.width+dx)}px`;
      g.element.style.height=`${Math.max(30,g.bounds.height+dy)}px`;
    } else {
      g.element.style.transform=`translate3d(${dx}px,${dy}px,0)`;
      const target=g.targets.find(row=>g.x>=row.rect.left&&g.x<=row.rect.right&&g.y>=row.rect.top&&g.y<=row.rect.bottom)?.element;
      if(g.target!==target){clearTarget();g.target=target;target?.classList.add('drop-target');}
    }
  }
  document.addEventListener('pointerdown',event=>{
    if(event.button!==0 || gesture || event.target.closest('[data-action],input,select'))return;
    const element=event.target.closest('[data-widget]'),canvas=element?.closest('#editor-canvas');
    if(!canvas)return;
    const item=getItems()?.find(row=>row.id===element.dataset.widget);
    if(!item)return;
    if(item.locked){event.preventDefault();return;}
    event.preventDefault();
    const bounds=element.getBoundingClientRect();
    gesture={element,item:{...item},canvas:canvas.getBoundingClientRect(),bounds,resize:Boolean(event.target.closest('[data-resize]')),startX:event.clientX,startY:event.clientY,x:event.clientX,y:event.clientY,moved:false,targets:[...canvas.querySelectorAll('[data-widget]')].filter(node=>node!==element&&node.dataset.locked!=='true').map(node=>({element:node,rect:node.getBoundingClientRect()}))};
    element.setPointerCapture?.(event.pointerId);
    element.classList.add('gesture-selected');
  });
  document.addEventListener('pointermove',event=>{
    if(!gesture)return;
    const g=gesture;g.x=event.clientX;g.y=event.clientY;
    if(!g.moved&&Math.hypot(g.x-g.startX,g.y-g.startY)<5)return;
    g.moved=true;g.element.classList.add('is-dragging');document.body.classList.add('editor-gesture');
    if(!frame)frame=requestAnimationFrame(paint);
  });
  function finish(event,cancelled=false) {
    if(!gesture)return;
    const g=gesture;
    if(frame){cancelAnimationFrame(frame);frame=0;}
    if(!cancelled){g.x=event.clientX;g.y=event.clientY;paint();}
    clearTarget();gesture=null;
    document.body.classList.remove('editor-gesture');
    g.element.classList.remove('is-dragging','gesture-selected');
    g.element.style.removeProperty('transform');g.element.style.removeProperty('width');g.element.style.removeProperty('height');
    swallowClickUntil=performance.now()+350;
    if(cancelled){onSelect(g.item.id);return;}
    if(!g.moved){onSelect(g.item.id);return;}
    if(g.resize)onResize({...g.item,w:g.item.w+Math.round((g.x-g.startX)/g.canvas.width*24),h:g.item.h+Math.round((g.y-g.startY)/g.canvas.height*12)});
    else onDrop(g.item,g.target?.dataset.widget,{
      x:Math.max(0,Math.min(24-g.item.w,g.item.x+Math.round((g.x-g.startX)/g.canvas.width*24))),
      y:Math.max(0,Math.min(12-g.item.h,g.item.y+Math.round((g.y-g.startY)/g.canvas.height*12)))
    });
  }
  document.addEventListener('pointerup',event=>finish(event));
  document.addEventListener('pointercancel',event=>finish(event,true));
  window.addEventListener('blur',()=>{if(gesture)finish({},true);});
  document.addEventListener('click',event=>{
    if(performance.now()<swallowClickUntil&&event.target.closest('[data-widget]')&&!event.target.closest('[data-action]')){event.preventDefault();event.stopImmediatePropagation();}
  },true);
}
