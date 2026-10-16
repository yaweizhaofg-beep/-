import { rotationSeconds } from '../domain/screen-scope.js';
import { scrollPlayback } from '../domain/scroll-playback.js';
const clocks = new WeakMap();
export { carousel } from './carousel-template.js';

function show(root, step) {
  const slides=[...root.querySelectorAll('[data-slide]')];
  const index=slides.findIndex(slide=>!slide.hidden);
  const next=(index+step+slides.length)%slides.length;
  slides.forEach((slide,i)=>{slide.hidden=i!==next;});
  root.querySelector('[data-carousel-count]').textContent=`${next+1} / ${slides.length}`;
  const members=slides[next].querySelector('.workforce-members');
  if(members)members.scrollTop=0;
  clocks.set(root,{elapsed:0,last:performance.now()});
}
document.addEventListener('click',event=>{
  const control=event.target.closest('[data-carousel-step],[data-carousel-pause]');
  if(!control)return;
  const root=control.closest('[data-carousel]');
  if(control.hasAttribute('data-carousel-step'))show(root,Number(control.dataset.carouselStep));
  else {
    const paused=control.getAttribute('aria-pressed')!=='true';
    control.setAttribute('aria-pressed',String(paused));control.textContent=paused?'继续':'暂停';
    control.setAttribute('aria-label',paused?'继续轮播':'暂停轮播');
    const clock=clocks.get(root)||{elapsed:0,last:performance.now()};
    clocks.set(root,{elapsed:clock.elapsed,last:performance.now()});
  }
});
setInterval(()=>{
  const now=performance.now();
  document.querySelectorAll('[data-carousel]').forEach(root=>{
    const clock=clocks.get(root)||{elapsed:0,last:now};
    const paused=document.hidden||document.querySelector('dialog[open]')||root.querySelector('[data-carousel-pause]').getAttribute('aria-pressed')==='true';
    if(!paused)clock.elapsed+=Math.min(now-clock.last,1500);
    clock.last=now;clocks.set(root,clock);
    const members=root.querySelector('[data-slide]:not([hidden]) .workforce-members');
    const overflow=members?members.scrollHeight-members.clientHeight:0;
    const {duration}=scrollPlayback(clock.elapsed,overflow,rotationSeconds(root.dataset.interval)*1000);
    if(!paused&&clock.elapsed>=duration)show(root,1);
  });
},1000);

document.addEventListener('change',event=>{
  if(!event.target.matches('[data-carousel-interval]'))return;
  const root=event.target.closest('[data-carousel]');root.dataset.interval=rotationSeconds(event.target.value);
  clocks.set(root,{elapsed:0,last:performance.now()});
});

let lastScrollFrame=0;
function animateMemberScroll(now) {
  requestAnimationFrame(animateMemberScroll);
  if(now-lastScrollFrame<32 || document.hidden || document.querySelector('dialog[open]'))return;
  lastScrollFrame=now;
  document.querySelectorAll('.workforce-carousel').forEach(root=>{
    if(root.querySelector('[data-carousel-pause]').getAttribute('aria-pressed')==='true')return;
    const members=root.querySelector('[data-slide]:not([hidden]) .workforce-members');
    const clock=clocks.get(root);
    if(!members||!clock)return;
    const elapsed=clock.elapsed+Math.min(now-clock.last,1500);
    const {offset}=scrollPlayback(elapsed,members.scrollHeight-members.clientHeight,rotationSeconds(root.dataset.interval)*1000);
    if(Math.abs(members.scrollTop-offset)>=.5)members.scrollTop=offset;
  });
}
requestAnimationFrame(animateMemberScroll);
