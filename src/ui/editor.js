import { workProgressPreview } from './work-progress.js';
import { screenProjectIds, scopedScreenData, rotationSeconds } from '../domain/screen-scope.js';
import { WIDGETS, OVERVIEW_MODULES } from '../domain/layout.js';
import { button, escape, heroCard, taskRows, releasePanel, sectionTitle } from './common.js';
import { icon } from './icons.js';
import { metricStrip, teamPanel } from './dashboard.js';
import { costTable } from './dialogs.js';
import { renderInstruments } from './instruments.js';
import { productionGallery, releaseGallery, detailLink } from './overview.js';
export function renderEditor(data, state) {
  const screen = state.editor;
  const page = screen.pages[state.pageIndex] || screen.pages[0];
  const projectIds = screenProjectIds(data, screen);
  const selected = page.components.find(item => item.id === state.selectedWidget);
  return `<div class="editor-heading"><input id="screen-name" value="${escape(screen.name)}" aria-label="大屏方案名称"><span class="unsaved">${state.dirty ? '未保存草稿' : `已保存 V${screen.version}`}</span><div class="heading-actions">${button(icon('undo',16),'undo-layout','aria-label="撤销布局"')}${button('返回方案','screen-manager')}${button(`${icon('play',15)} 预览`,'preview-screen')}${button(`${icon('save',15)} 保存`,'save-screen','','primary')}</div></div>
  <div class="editor-layout"><aside class="editor-tools glass"><h3>选择总览模块</h3>${OVERVIEW_MODULES.map(type=>`<button class="widget-add ${page.components.some(row=>row.type===type)?'is-selected':''}" data-action="toggle-module" data-type="${type}" aria-pressed="${page.components.some(row=>row.type===type)}" ${page.components.some(row=>row.type===type&&row.locked)?'disabled':''}><span>${WIDGETS[type].name}</span><b>${page.components.some(row=>row.type===type)?'✓':'+'}</b></button>`).join('')}${button('自动适配排版','auto-layout')}<p class="panel-note">拖到其他模块上即可交换位置。<br>支持上移、下移和拖动缩放，所有模块保留在一页。</p></aside>
  <div class="canvas-wrap"><div class="editor-canvas" id="editor-canvas">${page.components.map(item=>`<div class="editor-widget ${selected?.id===item.id?'selected':''}" draggable="false" tabindex="0" data-widget="${item.id}" data-locked="${Boolean(item.locked)}" style="--x:${item.x};--y:${item.y};--w:${item.w};--h:${item.h}"><div class="editor-widget-header"><h4><span class="widget-drag-handle" title="按住拖动模块">${icon('grip',16)}</span>${WIDGETS[item.type].name}</h4><div class="widget-quick-moves">${button(icon(item.locked?'lock':'unlock',13),'toggle-widget-lock',`data-id="${item.id}" aria-label="${item.locked?'解锁':'锁定'}${WIDGETS[item.type].name}" aria-pressed="${Boolean(item.locked)}" title="${item.locked?'已锁定位置，点击解锁':'锁定位置与尺寸'}"`,'widget-lock')}${button('↑ 上移','move-widget',`data-id="${item.id}" data-direction="up" aria-label="上移${WIDGETS[item.type].name}" ${item.locked?'disabled':''}`)}${button('↓ 下移','move-widget',`data-id="${item.id}" data-direction="down" aria-label="下移${WIDGETS[item.type].name}" ${item.locked?'disabled':''}`)}</div></div>${item.scope==='independent'?'<p>独立项目范围</p>':''}${widgetPlaceholder(item.type)}<button class="widget-resize" data-resize="${item.id}" aria-label="调整组件尺寸" ${item.locked?'disabled':''}>${icon('expand',13)}</button></div>`).join('')}</div><div class="canvas-caption"><span>16:9 · 24列 × 12行 · ${page.components.length}组件</span><span>选中组件后，可用方向键移动</span></div></div>
  <aside class="editor-properties glass"><h3>${selected?'组件配置':'方案范围'}</h3><div><fieldset class="screen-scope-picker"><legend>方案范围 · 可多选</legend>${data.projects.filter(project=>project.status!=='draft').map(project=>`<label><input type="checkbox" data-screen-project="${project.id}" ${projectIds.includes(project.id)?'checked':''}><span>${escape(project.displayName)}</span></label>`).join('')}<small>已选${projectIds.length}部 · 继承范围的模块同步筛选</small></fieldset><label class="field"><span>轮播间隔（剧目 / 小组）</span><select id="screen-rotation">${[15,30,60].map(seconds=>`<option value="${seconds}" ${rotationSeconds(screen.rotationSeconds)===seconds?'selected':''}>${seconds}秒</option>`).join('')}</select></label><label class="field"><span>统计月份</span><input type="month" id="screen-month" value="${screen.month}"></label>${selected?`<div class="move-controls">${[['up','↑','上移'],['left','←','左移'],['right','→','右移'],['down','↓','下移']].map(([direction,label,title])=>button(label,'move-widget',`data-direction="${direction}" aria-label="${title}" ${selected.locked?'disabled':''}`)).join('')}</div><label class="field"><span>数据范围</span><select id="widget-scope"><option value="inherit" ${selected.scope!=='independent'?'selected':''}>继承大屏</option><option value="independent" ${selected.scope==='independent'?'selected':''}>独立项目</option></select></label>${selected.scope==='independent'?`<label class="field"><span>独立项目</span><select id="widget-project">${data.projects.map(project=>`<option value="${project.id}" ${selected.projectId===project.id?'selected':''}>${escape(project.displayName)}</option>`).join('')}</select></label>`:''}<details class="advanced-layout"><summary>高级位置与尺寸</summary><div class="editor-prop-grid">${[['x','横向位置'],['y','纵向位置'],['w','宽度格数'],['h','高度格数']].map(([key,label])=>`<label class="field"><span>${label}</span><input type="number" min="0" id="widget-${key}" value="${selected[key]}" ${selected.locked?'disabled':''}></label>`).join('')}</div>${button('应用位置与尺寸','apply-widget',selected.locked?'disabled':'','primary')}</details><div class="heading-actions" style="margin-top:12px">${button(icon('copy',14),'duplicate-widget','aria-label="复制组件"')}${button(icon('trash',14),'delete-widget',`aria-label="删除组件" ${selected.locked?'disabled':''}`)}</div>`:'<p class="form-hint">选择画布组件，配置位置、大小和数据范围。</p>'}</div></aside></div>`;
}
function widgetPlaceholder(type) {
  if(type==='instruments') return '<p>视频模型 · 生成数量 · 积分占比 · 日期筛选</p>';
  if (type==='project') return '<div class="widget-thumb"><img src="./public/assets/echo-archive.png" alt="" draggable="false"><div class="thumb-lines"></div></div>';
  if(type==='metrics') return '<p>累计积分 · 立项 · 制作中 · 完成 · 时长 · 周期 · 生成成本</p>';
  return `<div class="widget-preview-bars"><span class="tone-violet"></span><span class="tone-rose"></span><span class="tone-mint"></span></div><p>${{teams:'四组产出对比 · 本月有效时长',tasks:'正在做 / 已完成',release:'浏览 / 点赞 / 收藏',cost:'员工 / 有效分钟 / 单位成本',note:'统计口径与更新时间'}[type]}</p>`;
}
export function renderDisplay(data, screen, pageIndex=0, modelFilters={}) {
  const ids=screenProjectIds(data,screen);
  const project=data.projects.find(row=>ids.includes(row.id))||data.projects[0];
  const page=screen.pages[pageIndex]||screen.pages[0];
  return `<div class="display-viewport"><div class="display-actions" role="group" aria-label="大屏展示操作">${button(`${icon('expand',16)} <span>全屏</span>`,'fullscreen','aria-label="进入全屏" aria-pressed="false"','display-fullscreen')}${button(`${icon('logout',16)} 退出展示`,'exit-display','title="返回进入展示前的页面"')}</div><div class="display-stage" id="display-stage">${screenSky()}<header class="display-header"><div><h1>${escape(screen.name)}</h1><p>${screen.month.replace('-','年')}月 · 已选${ids.length}部 · 单页展示 · ${rotationSeconds(screen.rotationSeconds)}秒轮播 · 模拟案例 · 已保存V${screen.version||'草稿'}</p></div><div class="display-status"><span class="demo-badge">示例数据 · 未接真实后端</span><span>数据日期 ${data.now.slice(0,10)}</span><strong id="display-clock"></strong></div></header><div class="display-grid">${page.components.map(item=>`<section class="display-widget glass" data-type="${item.type}" ${item.adaptive?'data-adaptive-widget':''} style="grid-column:${item.x+1}/span ${item.w};grid-row:${item.y+1}/span ${item.h}">${item.adaptive?`<div class="adaptive-widget-content">${displayWidget(data,item,screen,project,modelFilters)}</div>`:displayWidget(data,item,screen,project,modelFilters)}${item.scope==='independent'?'<span class="panel-note">独立项目范围</span>':''}</section>`).join('')}</div></div><div class="display-controls">${button(`${icon('logout',16)} 退出展示`,'exit-display')}${button('简化材质','simple-material')}</div></div>`;
}
function displayWidget(data,item,screen,defaultProject,modelFilters) {
  const project=item.scope==='independent'?data.projects.find(row=>row.id===item.projectId)||defaultProject:defaultProject;
  const ids=item.scope==='independent'?[project.id]:screenProjectIds(data,screen);
  const scoped=scopedScreenData(data,ids);
  switch(item.type) {
    case 'instruments':return renderInstruments(scoped,screen.month,modelFilters);
    case 'metrics':return metricStrip(ids.length===data.projects.filter(row=>row.status!=='draft').length?data:scoped,screen.month);
    case 'project':return `${sectionTitle('剧目IP',detailLink('projects'))}${productionGallery(data,scoped.projects,{intervalSeconds:rotationSeconds(screen.rotationSeconds)})}`;
    case 'teams':return teamPanel(scoped,screen.month);
    case 'release':return `${sectionTitle('多剧发布表现',detailLink('releases'))}${releaseGallery(scoped,null,{intervalSeconds:rotationSeconds(screen.rotationSeconds)})}`;
    case 'tasks':return `${workProgressPreview(scoped,{intervalSeconds:rotationSeconds(screen.rotationSeconds)})}<p class="panel-note">按小组轮播 · 员工工作项目与当前节点</p>`;
    case 'cost':return `${sectionTitle('人员时长与成本',detailLink('credits'))}${costTable(data,project.id)}`;
    default:return `${sectionTitle('统计口径')}<p class="form-hint" style="font-size:20px">所有数据为假设案例。贡献条按确认有效画面时长，任务与生成请求独立，成本不含工资。历史按修订口径查询。</p>`;
  }
}

function screenSky() {
  return `<div class="screen-sky" aria-hidden="true">${[0,1,2,3].map(i=>`<div class="screen-shower" style="--start-x:${[1550,1200,1800,970][i]}px;--start-y:${[40,90,400,270][i]}px;--flight:${[15,19,23,27][i]}s;--wait:${[0,4,8,12][i]}s"><i class="screen-meteor"></i><i class="screen-afterglow"></i></div>`).join('')}${Array.from({length:18},(_,i)=>`<i class="screen-star" style="left:${8+(i*137%85)}%;top:${5+(i*73%86)}%;--twinkle:${3+i%5}s;--offset:-${i*.7}s"></i>`).join('')}</div>`;
}
