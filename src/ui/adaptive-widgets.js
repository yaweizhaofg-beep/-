const sizes={metrics:[900,130],instruments:[520,350],project:[520,320],teams:[360,300],release:[420,280],tasks:[420,320],cost:[520,300],note:[300,180]};
export function fitAdaptiveWidgets() {
  for(const widget of document.querySelectorAll('[data-adaptive-widget]')) {
    const inner=widget.querySelector('.adaptive-widget-content');
    const [minWidth,minHeight]=sizes[widget.dataset.type]||[360,260];
    const width=Math.max(1,widget.clientWidth-32),height=Math.max(1,widget.clientHeight-32);
    const naturalWidth=Math.max(width,minWidth),naturalHeight=Math.max(height,minHeight);
    inner.style.width=`${naturalWidth}px`;inner.style.height=`${naturalHeight}px`;
    const scale=Math.min(width/naturalWidth,height/naturalHeight);
    inner.style.transform=`scale(${scale})`;
    inner.style.left=`${16+(width-naturalWidth*scale)/2}px`;
    inner.style.top=`${16+(height-naturalHeight*scale)/2}px`;
  }
}
