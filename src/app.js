import { brandLogo } from './ui/brand.js';
import { DemoAuth, HttpAuth } from './data/auth.js';
import { renderLogin } from './ui/login.js';
import { fitAdaptiveWidgets } from './ui/adaptive-widgets.js';
import { installEditorInteractions } from './ui/editor-interactions.js';
import * as productionUi from './ui/production.js';
import * as operationsUi from './ui/operations.js';
import { modelDateRange } from './domain/model-consumption.js';
import { modelConsumptionDetails } from './ui/instruments.js';
import { screenProjectIds, rotationSeconds, scopedScreenData } from './domain/screen-scope.js';
import { startApplication } from './domain/startup.js';
import { repository, mode } from './data/repository.js';
import { icon } from './ui/icons.js';
import { button, escape, avatar, taskRows } from './ui/common.js';
import { renderDashboard } from './ui/dashboard.js';
import { renderProjects, renderPeople, renderScreens } from './ui/pages.js';
import { renderEditor, renderDisplay } from './ui/editor.js';
import * as dialogs from './ui/dialogs.js';
import './ui/carousel.js';
import { placeWidgetLocally, WIDGETS, autoLayout, moveModule, swapModules } from './domain/layout.js';
import { number } from './domain/metrics.js';
import { dataDetails } from './ui/data-details.js';
import { dailySnapshotDate } from './domain/releases.js';
import * as groupUi from './ui/groups.js';

const app=document.querySelector('#app');
const dialog=document.querySelector('#dialog');
const state={directoryFilter:'unassigned',directoryQuery:'',view:'dashboard',month:'2026-10',query:'',focusProject:'echo',projectFilter:'all',modal:null,tab:'overview',editor:null,pageIndex:0,selectedWidget:null,dirty:false,history:[],display:null,previousView:'screens'};
let data,noticeTimer,searchTimer;
const auth=mode==='http'?new HttpAuth(repository):new DemoAuth();
let signedInUser=null,loginInFlight=false,sessionRevision=0;

function lockWorkspace(message='') {
  sessionRevision++;signedInUser=null;data=null;state.view='dashboard';state.editor=null;state.display=null;state.history=[];state.dirty=false;
  closeDialog();app.innerHTML=renderLogin(mode,message);
}
window.addEventListener('studio:unauthorized',()=>lockWorkspace('登录已过期，请重新登录'));
async function loadWorkspace() {
  const revision=++sessionRevision;
  await startApplication({read:()=>repository.read(),render:next=>{if(signedInUser&&revision===sessionRevision){data=next;render();}},update:()=>repository.refreshDailyReleases(),onUpdateError:error=>{if(signedInUser)notify(`平台数据更新失败：${error.message}`,true);}});
}
async function submitLogin(form) {
  if(loginInFlight)return;
  loginInFlight=true;
  const submit=form.querySelector('[type="submit"]'),error=form.querySelector('#login-error');
  submit.disabled=true;submit.textContent='正在登录…';error.textContent='';
  try {
    const fields=new FormData(form);
    signedInUser=await auth.login(String(fields.get('account')||'').trim(),String(fields.get('password')||''));
    form.querySelector('[name="password"]').value='';
    await loadWorkspace();
  }catch(problem){signedInUser=null;if(form.isConnected)error.textContent=problem.message||'暂时无法登录，请重试';}
  finally{loginInFlight=false;if(submit.isConnected){submit.disabled=false;submit.innerHTML=`登录 ${icon('arrow',17)}`;}}
}

function notify(message,error=false) {
  clearTimeout(noticeTimer);
  document.querySelector('#notification').innerHTML=`<div class="notification-content ${error?'error':''}">${escape(message)}</div>`;
  noticeTimer=setTimeout(()=>{document.querySelector('#notification').innerHTML='';},error?6500:3500);
}
function render() {
  if(!signedInUser){app.innerHTML=renderLogin(mode);return;}
  if(state.view==='display') { app.innerHTML=renderDisplay(data,state.display,state.pageIndex,state.modelFilters); fitDisplay(); tickClock(); syncFullscreenControls(); return; }
  const pendingOperations=data.projects.filter(project=>operationsUi.operationsState(data,project).status==='inbox').length;
  const routes={dashboard:()=>renderDashboard(data,state),projects:()=>renderProjects(data,state),people:()=>renderPeople(data,state),screens:()=>renderScreens(data),operations:()=>operationsUi.renderOperations(data,state),editor:()=>renderEditor(data,state)};
  app.innerHTML=`<div class="app-shell"><aside class="sidebar">${brandLogo()}<nav class="nav-items" aria-label="主导航">${[['dashboard','overview','总览'],['projects','film','项目'],['people','people','团队'],['operations','upload','运营'],['screens','monitor','大屏']].map(([view,symbol,label])=>`<button class="nav-item ${state.view===view||(state.view==='editor'&&view==='screens')?'active':''}" data-action="navigate" data-view="${view}">${icon(symbol,21)}<span>${label}</span>${view==='operations'&&pendingOperations?`<small class="nav-count">${pendingOperations}</small>`:''}</button>`).join('')}</nav><div class="sidebar-bottom">${button(icon('settings',18),'simple-material','aria-label="切换简化材质"','icon-button')}${avatar(data,'lead-lin')}</div></aside><div class="shell-main"><header class="topbar"><div class="wordmark">星核耀火数据管理台<small>STORY · PRODUCTION · INSIGHT</small></div><div class="topbar-center"><label class="search-box">${icon('search',15)}<input id="global-search" placeholder="搜索作品、人员、组长" value="${escape(state.query)}" aria-label="搜索作品人员"><span class="shortcut">⌘ K</span></label><input type="month" class="month-select" id="global-month" value="${state.month}" aria-label="统计月份"><span class="demo-badge">${mode==='mock'?'假设案例 · 演示模式':'后端接口模式'}</span></div><div class="user-area">${avatar(data,'lead-lin')}<div><strong>${escape(signedInUser.name||signedInUser.account)}</strong><small>${mode==='mock'?'演示管理员':'已登录'}</small></div>${button('退出登录','logout','','logout-button')}</div></header><main class="page ${state.view==='screens'?'screens-page':''}">${routes[state.view]?.()||routes.dashboard()}<footer class="footer-status"><span><i class="dot"></i>${mode==='mock'?'模拟数据适配器':'HTTP数据适配器'} · 示例业务时间 ${data.now.slice(5,16).replace('T',' ')}<span>所有案例均为虚构</span></span><span>${mode==='mock'?button(`${icon('sync',12)} 演示数据更新`,'demo-update','','text-button')+button('重置案例','reset-demo','','text-button'):''}</span></footer></main></div></div>`;
}
async function refresh() { data=await repository.read(); render(); }
function showDialog(html,modal) { state.modal=modal; dialog.innerHTML=html; if(!dialog.open)dialog.showModal(); }
function closeDialog() { dialog.close(); state.modal=null; }
function openProject(id,tab='overview') {state.tab=tab;showDialog(dialogs.projectDetail(data,id,tab),{type:'project',projectId:id});}
function updateProjectDialog(tab=state.tab) {if(state.modal?.projectId)openProject(state.modal.projectId,tab);}
function rememberLayout() {state.history.push(structuredClone(state.editor));if(state.history.length>20)state.history.shift();state.dirty=true;}
function currentPage() {return state.editor.pages[state.pageIndex];}
function applyWidget(changed) {
  const placed=placeWidgetLocally(currentPage().components,changed);
  if(!placed){notify('这一页放不下该尺寸，请缩小模块或减少展示内容。',true);return;}
  rememberLayout();currentPage().components=placed;state.selectedWidget=changed.id;render();
}
function replacePages(pages) {
  if(!pages || pages.length!==1){notify('当前只支持一页，请缩小模块或减少展示内容。',true);return;}
  rememberLayout();state.editor.pages=[{...pages[0],id:state.editor.pages[0].id}];state.pageIndex=0;render();
}
function reflow(items) {replacePages(autoLayout(items));}
function fitDisplay() {
  fitAdaptiveWidgets();
  const stage=document.querySelector('#display-stage'),viewport=document.querySelector('.display-viewport');
  if(stage&&viewport)stage.style.setProperty('--display-scale',Math.min(viewport.clientWidth/1920,viewport.clientHeight/1080));
}
function syncFullscreenControls() {
  const active=Boolean(document.fullscreenElement);
  for(const control of document.querySelectorAll('[data-action="fullscreen"]')) {
    control.innerHTML=`${icon('expand',16)} <span>${active?'退出全屏':'全屏'}</span>`;
    control.setAttribute('aria-label',active?'退出全屏':'进入全屏');
    control.setAttribute('aria-pressed',String(active));
  }
}
document.addEventListener('fullscreenchange',()=>{syncFullscreenControls();fitDisplay();requestAnimationFrame(fitDisplay);});
function tickClock() {const clock=document.querySelector('#display-clock');if(clock)clock.textContent=new Date().toLocaleTimeString('zh-CN',{hour12:false});}
function openSavedDisplay() {const screens=data.screens.filter(screen=>!screen.archived);const screen=screens.find(row=>row.id===state.display?.id)||screens.find(row=>row.id==='screen-main')||screens[0];if(screen)enterDisplay(screen);else{state.view='screens';render();}}
function enterDisplay(screen,preview=false) {state.previousView=state.view;state.display=structuredClone(screen);state.displayPreview=preview;if(preview)state.display.version='草稿';state.pageIndex=0;closeDialog();state.view='display';render();}

function openGeneration(projectId,filters={}) {showDialog(productionUi.generationDialog(data,projectId,filters),{type:'generation',projectId,filters});}
const actions={
  'toggle-password':el=>{const input=document.querySelector('#login-password');const show=input.type==='password';input.type=show?'text':'password';el.setAttribute('aria-label',show?'隐藏密码':'显示密码');el.setAttribute('aria-pressed',String(show));},
  logout:async()=>{await auth.logout();lockWorkspace();},
  'model-period':el=>{const month=state.view==='display'?state.display.month:state.month;const range=modelDateRange(month);state.modelFilters={...state.modelFilters,period:el.dataset.period,start:state.modelFilters?.start||range.start,end:state.modelFilters?.end||range.end};render();},
  'model-range':el=>{const root=el.closest('[data-model-consumption]');const options={...state.modelFilters,period:'custom',start:root.querySelector('[data-model-start]').value,end:root.querySelector('[data-model-end]').value};modelDateRange(state.view==='display'?state.display.month:state.month,options);state.modelFilters=options;render();},
  'model-select':el=>{state.modelFilters={...state.modelFilters,modelId:state.modelFilters?.modelId===el.dataset.model?'all':el.dataset.model};render();},
  'model-details':el=>{const ids=el.closest('[data-model-consumption]').dataset.modelProjects.split(',');showDialog(modelConsumptionDetails(scopedScreenData(data,ids),state.view==='display'?state.display.month:state.month,state.modelFilters),{type:'model-consumption'});},
  'generation-records':el=>openGeneration(el.dataset.id,{episodeId:el.dataset.episode||null,employeeId:el.dataset.employee||''}),
  'generation-filter':()=>{const filters={...state.modal.filters,employeeId:document.querySelector('#generation-employee').value,start:document.querySelector('#generation-start').value,end:document.querySelector('#generation-end').value,page:0};openGeneration(state.modal.projectId,filters);},
  'generation-page':el=>openGeneration(state.modal.projectId,{...state.modal.filters,page:Number(el.dataset.page)}),
  'open-operations':el=>{closeDialog();state.view='operations';state.query=data.projects.find(row=>row.id===el.dataset.id)?.displayName||'';render();},
  'operations-filter':el=>{state.operationsFilter=el.dataset.filter;render();},
  'refresh-operations':async()=>{await refresh();notify('已读取最新制作交付与运营数据。');},
  'receive-handoff':async el=>{await repository.receiveHandoff(el.dataset.id);await refresh();notify('已接收最终交付，可以填写投放信息。');},
  'operation-edit':el=>{const row=operationsUi.operationsState(data,data.projects.find(project=>project.id===el.dataset.id));if(!row.ready||!row.received){notify('请先接收制作软件提交的最终交付。',true);return;}showDialog(operationsUi.operationDialog(data,el.dataset.id,el.dataset.record),{type:'operation',projectId:el.dataset.id});},
  'sync-directory':async el=>{el.disabled=true;try{await repository.syncDirectory();await refresh();notify('员工池与统计已同步，网页分组已保留。');}finally{el.disabled=false;}},
  'new-group':()=>showDialog(groupUi.groupDialog(data),{type:'workgroup'}),
  'edit-group':el=>showDialog(groupUi.groupDialog(data,el.dataset.id),{type:'workgroup'}),
  'add-group-members':el=>showDialog(groupUi.addMembersDialog(data,el.dataset.id),{type:'group-members'}),
  'edit-group-member':el=>showDialog(groupUi.memberDialog(data,el.dataset.id,el.dataset.employee),{type:'group-member'}),
  'assign-employee':el=>showDialog(groupUi.assignEmployeeDialog(data,el.dataset.employee),{type:'assign-employee'}),
  'remove-group-member':async el=>{const group=data.groups.find(row=>row.id===el.dataset.id);await repository.removeGroupMember(group.id,el.dataset.employee,group.version);await refresh();notify('已移出本组，员工保留在待分配池中。');},
  'group-details':el=>showDialog(groupUi.groupDetails(data,el.dataset.id,state.view==='display'?state.display.month:state.month),{type:'group-details'}),
  'directory-filter':el=>{state.directoryFilter=el.dataset.filter;render();},
  'data-detail':el=>showDialog(dataDetails(data,el.dataset.kind,state.view==='display'?state.display.month:state.month),{type:'data-detail'}),
  navigate:async el=>{if(state.dirty&&state.view==='editor'){notify('草稿暂存于本次会话；再次打开同一方案可继续，保存后用于展示。');}state.query='';closeDialog();state.view=el.dataset.view;render();},
  focus:el=>{state.focusProject=el.dataset.id;render();},
  'new-project':()=>showDialog(dialogs.newProjectDialog(data),{type:'new-project'}),
  project:el=>openProject(el.dataset.id,el.dataset.tab),
  'close-dialog':closeDialog,
  'detail-tab':el=>updateProjectDialog(el.dataset.tab),
  'project-filter':el=>{state.projectFilter=el.dataset.filter;render();},
  'team-edit':()=>notify('请在制作软件完成此操作，网页只展示同步结果。'),
  'new-task':()=>notify('请在制作软件完成此操作，网页只展示同步结果。'),
  'task-edit':()=>notify('请在制作软件完成此操作，网页只展示同步结果。'),
  'complete-task':()=>notify('请在制作软件完成此操作，网页只展示同步结果。'),
  'ledger':()=>notify('请在制作软件完成此操作，网页只展示同步结果。'),
  'release-edit':el=>showDialog(dialogs.releaseDialog(data,el.dataset.id),{type:'release',projectId:el.dataset.id}),
  'approve-episode':()=>notify('请在制作软件完成此操作，网页只展示同步结果。'),
  'project-status':()=>notify('请在制作软件完成此操作，网页只展示同步结果。'),
  'sync-project':async el=>{await repository.syncProject(el.dataset.id);await refresh();updateProjectDialog('sync');},
  'copy-name':async el=>{await navigator.clipboard.writeText(data.projects.find(project=>project.id===el.dataset.id).name);el.textContent='已复制';},
  person:el=>showDialog(dialogs.personDialog(data,el.dataset.id),{type:'person'}),
  leader:el=>{state.query=data.employees.find(person=>person.id===el.dataset.id)?.name||'';state.view='projects';render();},
  'new-screen':()=>showDialog(dialogs.screenDialog(),{type:'screen'}),
  'edit-screen':el=>{if(state.editor?.id!==el.dataset.id){const saved=structuredClone(data.screens.find(screen=>screen.id===el.dataset.id));
    if(saved.pages.length>1){const pages=autoLayout(saved.pages.flatMap(page=>page.components));if(pages.length!==1){notify('旧方案内容超出一页，请新建单页方案后选择需要的模块。',true);return;}saved.pages=pages;}
    state.editor=saved;state.dirty=false;state.history=[];}state.pageIndex=0;state.selectedWidget=null;state.view='editor';render();},
  'delete-screen':async el=>{await repository.archiveScreen(el.dataset.id);await refresh();notify('方案已删除，可在下方已删除方案中恢复。');},
  'restore-screen':async el=>{await repository.restoreScreen(el.dataset.id);await refresh();notify('方案已恢复。');},
  'copy-screen':async el=>{const screen=structuredClone(data.screens.find(row=>row.id===el.dataset.id));delete screen.id;screen.version=0;screen.name+=' · 副本';await repository.saveScreen(screen);await refresh();},
  display:el=>enterDisplay(data.screens.find(row=>row.id===el.dataset.id)),
  'display-default':openSavedDisplay,
  'screen-manager':()=>{closeDialog();state.view='screens';state.pageIndex=0;render();if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});},
  'preview-screen':()=>enterDisplay(state.editor,true),
  'exit-display':()=>{state.view=state.previousView==='display'?'screens':state.previousView;state.pageIndex=0;render();if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});},
  fullscreen:async()=>{
    try {
      if(document.fullscreenElement)await document.exitFullscreen();
      else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();
      else notify('当前浏览器不支持全屏，可继续使用普通展示。');
    } catch { notify('未能切换全屏，可继续使用普通展示。'); }
    syncFullscreenControls();
  },
  'simple-material':()=>document.body.classList.toggle('simple-material'),
  'save-screen':async()=>{const saved=await repository.saveScreen(state.editor);state.editor=saved;state.dirty=false;await refresh();notify('已保存，电视展示使用此版本。');},
  'toggle-widget-lock':el=>{const item=currentPage().components.find(row=>row.id===el.dataset.id);if(!item)return;rememberLayout();item.locked=!item.locked;state.selectedWidget=item.id;render();},
  'auto-layout':()=>reflow(currentPage().components),
  'move-widget':el=>{state.selectedWidget=el.dataset.id||state.selectedWidget;const pages=moveModule(currentPage().components,state.selectedWidget,el.dataset.direction);if(pages)replacePages(pages);else notify('这个方向没有可交换的模块。');},
  'toggle-module':el=>{const items=currentPage().components;const type=el.dataset.type;if(items.some(row=>row.type===type&&row.locked))return;reflow(items.some(row=>row.type===type)?items.filter(row=>row.type!==type):[...items,{id:`w-${Date.now()}`,type,scope:'inherit'}]);},
  'add-widget':el=>{const config=WIDGETS[el.dataset.type];applyWidget({id:`w-${Date.now()}`,type:el.dataset.type,x:0,y:0,w:config.minW,h:config.minH,scope:'inherit'});},
  'apply-widget':()=>{const item=currentPage().components.find(row=>row.id===state.selectedWidget);const changed={...item};for(const key of ['x','y','w','h'])changed[key]=Number(document.querySelector(`#widget-${key}`).value);applyWidget(changed);},
  'delete-widget':()=>{if(currentPage().components.find(row=>row.id===state.selectedWidget)?.locked)return;rememberLayout();currentPage().components=currentPage().components.filter(row=>row.id!==state.selectedWidget);state.selectedWidget=null;render();},
  'duplicate-widget':()=>{const item=currentPage().components.find(row=>row.id===state.selectedWidget);applyWidget({...item,id:`w-${Date.now()}`,locked:false,y:0,x:0});},
  'undo-layout':()=>{if(state.history.length){state.editor=state.history.pop();state.dirty=true;state.selectedWidget=null;render();}},
  'demo-update':async()=>{await repository.demoUpdate();await refresh();app.classList.add('data-updated');setTimeout(()=>app.classList.remove('data-updated'),800);notify('模拟一次6元生成扣费：成本更新，已确认有效时长保持不变。');},
  'reset-demo':async()=>{data=await repository.reset();state.editor=null;state.dirty=false;state.view='dashboard';closeDialog();render();notify('案例已重置。');},
};
document.addEventListener('click',async event=>{
  const el=event.target.closest('[data-action]');
  if(el&&actions[el.dataset.action]){try{await actions[el.dataset.action](el);}catch(error){notify(error.message,true);}return;}
  const widget=event.target.closest('[data-widget]');if(widget&&state.view==='editor'&&!event.target.closest('[data-resize]')){state.selectedWidget=widget.dataset.widget;render();}
});
document.addEventListener('input',event=>{
  if(event.target.id==='member-pool-query'){const query=event.target.value.trim();for(const row of dialog.querySelectorAll('[data-member-search]'))row.hidden=!row.dataset.memberSearch.includes(query);}
  if(event.target.id==='directory-query'){const query=event.target.value;state.directoryQuery=query;render();const input=document.querySelector('#directory-query');input?.focus();input?.setSelectionRange(query.length,query.length);}

  if(event.target.id==='global-search'){clearTimeout(searchTimer);const query=event.target.value;searchTimer=setTimeout(()=>{state.query=query;render();const input=document.querySelector('#global-search');input?.focus();input?.setSelectionRange(query.length,query.length);},250);}
  if(event.target.id==='screen-name'){state.editor.name=event.target.value;state.dirty=true;}
  if(event.target.dataset.durationRow!==undefined||event.target.name==='total')updateLedgerBalance();
});
document.addEventListener('change',async event=>{
  const el=event.target;
  if(el.matches('[data-model-selector]')){state.modelFilters={...state.modelFilters,modelId:el.value};render();}
  if(el.id==='global-month'){state.month=el.value;render();}
  if(el.dataset.screenProject){const ids=screenProjectIds(data,state.editor);const next=el.checked?[...new Set([...ids,el.dataset.screenProject])]:ids.filter(id=>id!==el.dataset.screenProject);if(!next.length){el.checked=true;notify('请至少保留一部剧目。');return;}rememberLayout();state.editor.projectIds=next;state.editor.projectId=next[0];render();}
  if(el.id==='screen-rotation'){rememberLayout();state.editor.rotationSeconds=rotationSeconds(el.value);}
  if(el.id==='screen-month'){state.editor.month=el.value;state.dirty=true;}
  if(['widget-scope','widget-project'].includes(el.id)){rememberLayout();const item=currentPage().components.find(row=>row.id===state.selectedWidget);if(el.id==='widget-scope')item.scope=el.value;else item.projectId=el.value;render();}
  if(el.id==='ledger-episode'){showDialog(dialogs.ledgerDialog(data,state.modal.projectId,el.value),state.modal);updateLedgerBalance();}
  if(el.id==='ledger-csv'){try{const text=await el.files[0].text();for(const line of text.trim().split(/\r?\n/)){const [id,value]=line.split(',');if(id==='employeeId')continue;const target=dialog.querySelector(`[name="seconds-${CSS.escape(id.trim())}"]`);if(!target||!Number.isFinite(Number(value)))throw new Error(`CSV人员或时长无效：${line}`);target.value=Number(value);}updateLedgerBalance();}catch(error){notify(error.message,true);}}
});
function updateLedgerBalance(){const form=document.querySelector('#active-form');if(!form||form.dataset.form!=='ledger')return;let total=0;for(const el of form.querySelectorAll('[data-duration-row]')){total+=Number(el.value);const label=form.querySelector(`[data-minute-label="${el.dataset.durationRow}"]`);if(label)label.textContent=number(Number(el.value)/60,2);}const expected=Number(form.elements.total.value);document.querySelector('#ledger-balance').textContent=`归属合计 ${number(total,3)}秒 / 确认总量 ${number(expected,3)}秒 · ${Math.abs(total-expected)<.001?'已平衡':'尚未平衡'}`;}
document.addEventListener('submit',async event=>{
  const form=event.target.closest('[data-form]');if(!form)return;event.preventDefault();
  if(form.dataset.form==='login'){await submitLogin(form);return;}
  if(!signedInUser)return;
  const fields=new FormData(form);const input=Object.fromEntries(fields.entries());
  const submit=document.querySelector(`button[form="${form.id}"]`);if(submit)submit.disabled=true;
  try{
    const projectId=input.projectId;
    switch(form.dataset.form){
      case 'workgroup':await repository.saveGroup(input);break;
      case 'group-members':await repository.addGroupMembers(input.groupId,fields.getAll('employeeIds'),Number(input.version));break;
      case 'group-member':await repository.updateGroupMember(input.groupId,input.employeeId,{...input,version:Number(input.version),targetVersion:data.groups.find(group=>group.id===input.targetGroupId)?.version});break;
      case 'assign-employee':await repository.addGroupMembers(input.groupId,[input.employeeId],data.groups.find(group=>group.id===input.groupId)?.version);break;

      case 'project':{const file=fields.get('script');const scriptText=file?.size?await file.text():null;await repository.createProject({...input,episodeCount:Number(input.episodeCount),members:fields.getAll('members'),draft:input.draft==='true',scriptText});break;}
      case 'team':await repository.updateTeam(projectId,{leaderId:input.leaderId,members:fields.getAll('members'),transferTo:input.transferTo});break;
      case 'task':if(input.taskId)await repository.updateTask(input.taskId,{assigneeId:input.assigneeId,status:input.status});else await repository.createTask(input);break;
      case 'ledger':{const project=data.projects.find(row=>row.id===projectId);const rows=[...form.querySelectorAll('[data-duration-row]')].map(el=>({employeeId:el.dataset.durationRow||null,seconds:Number(el.value),producedOn:input.producedOn,leaderId:project.leaderId})).filter(row=>row.seconds>0);await repository.confirmLedger({projectId,episodeId:input.episodeId,total:Number(input.total),version:Number(input.version),rows});break;}
      case 'release':await repository.saveRelease({...input,views:Number(input.views),likes:Number(input.likes),saves:Number(input.saves)});break;
      case 'operation':await repository.saveOperation({...input,version:Number(input.version),views:Number(input.views),likes:Number(input.likes),saves:Number(input.saves)});state.view='operations';break;
      case 'screen':{const screen=await repository.createScreen(input.name,'overview',fields.getAll('modules'));state.editor=screen;state.view='editor';state.pageIndex=0;state.selectedWidget=null;state.dirty=false;break;}
    }
    closeDialog();await refresh();if(projectId&&form.dataset.form!=='operation')openProject(projectId,{team:'tasks',task:'tasks',ledger:'duration',release:'release'}[form.dataset.form]||'overview');
  }catch(error){const target=document.querySelector('#form-error');if(target)target.textContent=error.message;else if(signedInUser)notify(error.message,true);}finally{if(submit)submit.disabled=false;}
});
installEditorInteractions({
  getItems:()=>state.view==='editor'?currentPage().components:null,
  onSelect:id=>{state.selectedWidget=id;render();},
  onResize:item=>applyWidget(item),
  onDrop:(item,targetId,position)=>{
    state.selectedWidget=item.id;
    if(targetId&&targetId!==item.id){
      const pages=swapModules(currentPage().components,item.id,targetId);
      if(pages)replacePages(pages);else{render();notify('本次移动未完成，已保留原布局。',true);}
    }else applyWidget({...item,...position});
  }
});
document.addEventListener('keydown',event=>{if((event.metaKey||event.ctrlKey)&&event.key==='k'){event.preventDefault();document.querySelector('#global-search')?.focus();}if(event.key==='Escape'&&state.view==='display'&&!document.fullscreenElement)actions['exit-display']();const widget=event.target.closest('[data-widget]');if(widget&&widget.dataset.locked!=='true'&&['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();const pages=moveModule(currentPage().components,widget.dataset.widget,event.key.replace('Arrow','').toLowerCase());if(pages)replacePages(pages);}});
window.addEventListener('resize',()=>{fitDisplay();requestAnimationFrame(fitDisplay);});
window.visualViewport?.addEventListener('resize',fitDisplay);
window.addEventListener('beforeunload',event=>{if(state.dirty){event.preventDefault();event.returnValue='';}});
let taskPage=0;
setInterval(()=>{tickClock();if(state.view==='display'){for(const target of document.querySelectorAll('[data-paged-tasks]')){const rows=data.tasks.filter(task=>target.dataset.pagedTasks.split(',').includes(task.projectId));const pages=Math.max(1,Math.ceil(rows.length/4));target.innerHTML=taskRows(data,rows.slice((taskPage%pages)*4),{max:4});}}taskPage++;},15000);
setInterval(async()=>{if(!signedInUser||state.view!=='display')return;try{data=await repository.read();const saved=data.screens.find(row=>row.id===state.display.id);if(saved&&!state.displayPreview&&saved.version!==state.display.version){state.display=saved;render();}}catch(error){notify(`更新失败：${error.message}`,true);}},60000);
try {
  signedInUser=await auth.restore();
  if(signedInUser)await loadWorkspace();else render();
}catch(error){lockWorkspace(error.message||'无法恢复登录，请重试');}


let lastReleaseDay=dailySnapshotDate();
let refreshingReleases=false;
async function updateDailySnapshots() {
  const day=dailySnapshotDate();
  if(!signedInUser||refreshingReleases||day===lastReleaseDay)return;
  refreshingReleases=true;
  try { await repository.refreshDailyReleases();lastReleaseDay=day;data=await repository.read();render(); }
  catch(error) { notify(`平台快照更新失败：${error.message}`,true); }
  finally { refreshingReleases=false; }
}
setInterval(updateDailySnapshots,60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateDailySnapshots();});
let readingGroups=false;
setInterval(async()=>{
  if(!signedInUser||readingGroups||!['people','operations'].includes(state.view)||dialog.open||document.hidden||document.activeElement?.matches('input,select,textarea'))return;
  readingGroups=true;
  try{const next=await repository.read();if(JSON.stringify(next)!==JSON.stringify(data)){data=next;render();}}
  catch(error){notify(`数据同步失败，保留上次数据：${error.message}`,true);}
  finally{readingGroups=false;}
},60000);

setInterval(async()=>{if(!signedInUser||document.hidden)return;try{const user=await auth.restore();if(!user)lockWorkspace('登录已过期，请重新登录');}catch{}},60000);
